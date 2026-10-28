import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { encryptAES256, decryptAES256, maskSensitiveToken } from '../utils/cryptoUtils';
import { DEFAULT_TELEGRAM_CONFIG } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * telegramService.js
 * Trung tâm điều phối hệ thống Live Chat Telegram 2 Chiều
 * Hỗ trợ 10+ người dùng đồng thời, định tuyến chính xác qua Session ID & Telegram Message ID Mapping
 * Tương thích 100% với Vercel Serverless (Supabase Cloud Database platform_settings)
 */

const DB_PATH = path.resolve(process.cwd(), 'server-db.json');

// Bộ nhớ đệm in-memory cho tốc độ phản hồi mili-giây
let memoryChatSessions = null;
const memoryMsgMap = new Map();

/**
 * Đọc toàn bộ DB từ server-db.json (Dành cho môi trường Local)
 */
function readServerDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (e) {
    // Chế độ im lặng trên Vercel
  }
  return {};
}

/**
 * Ghi dữ liệu an toàn vào server-db.json (nếu có quyền ghi)
 */
function writeServerDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    // Trên Vercel môi trường read-only, bỏ qua lỗi filesystem
    return false;
  }
}

// =======================================================================
// 1. QUẢN LÝ CẤU HÌNH TELEGRAM BOT (SUPABASE platform_settings)
// =======================================================================

/**
 * Lấy cấu hình Telegram Bot (Tự động giải mã token AES-256)
 */
export async function getTelegramConfig(maskForAdmin = false) {
  let rawConfig = null;

  // 1. Ưu tiên tra cứu Supabase Cloud (bảng platform_settings)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'bds_telegram_config')
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        rawConfig = { ...DEFAULT_TELEGRAM_CONFIG, ...data.value };
      }
    } catch (e) {
      console.warn('Lỗi đọc bds_telegram_config từ Supabase:', e.message);
    }
  }

  // 2. Fallback sang server-db.json nếu Supabase chưa có
  if (!rawConfig) {
    const db = readServerDb();
    rawConfig = db.bds_telegram_config || DEFAULT_TELEGRAM_CONFIG;
  }

  const merged = { ...DEFAULT_TELEGRAM_CONFIG, ...rawConfig };

  if (!Array.isArray(merged.agentNamesList) || merged.agentNamesList.length === 0) {
    merged.agentNamesList = [
      'Nguyễn Huyền',
      'Trần Bảo Ngọc',
      'Lê Hoàng Nam',
      'Phạm Quỳnh Anh',
      'Vũ Minh Tuấn',
      'Đặng Thu Thảo',
      'Hoàng Gia Bảo',
      'Mai Phương Thúy'
    ];
  }
  if (merged.enableRandomAgentName === undefined) {
    merged.enableRandomAgentName = true;
  }

  // Giải mã botToken & pusherSecret
  const decryptedToken = decryptAES256(merged.botToken);
  const decryptedPusherSecret = decryptAES256(merged.pusherSecret);

  if (maskForAdmin) {
    return {
      ...merged,
      botToken: maskSensitiveToken(decryptedToken),
      hasToken: Boolean(decryptedToken),
      pusherSecret: maskSensitiveToken(decryptedPusherSecret),
      hasPusherSecret: Boolean(decryptedPusherSecret)
    };
  }

  return {
    ...merged,
    botToken: decryptedToken,
    pusherSecret: decryptedPusherSecret
  };
}

/**
 * Lưu cấu hình Telegram Bot (Mã hóa botToken bằng AES-256)
 */
export async function saveTelegramConfig(newConfig) {
  const current = await getTelegramConfig(false);

  // Xử lý token: nếu người dùng gửi chuỗi bị mask (chứa ••••), giữ nguyên token cũ
  let tokenToSave = current.botToken;
  if (newConfig.botToken !== undefined && !newConfig.botToken.includes('••••')) {
    tokenToSave = newConfig.botToken.trim();
  }

  let pusherSecretToSave = current.pusherSecret;
  if (newConfig.pusherSecret !== undefined && !newConfig.pusherSecret.includes('••••')) {
    pusherSecretToSave = newConfig.pusherSecret.trim();
  }

  const encryptedToken = encryptAES256(tokenToSave);
  const encryptedPusherSecret = encryptAES256(pusherSecretToSave);

  const toPersist = {
    ...current,
    ...newConfig,
    botToken: encryptedToken,
    pusherSecret: encryptedPusherSecret,
    updatedAt: new Date().toISOString()
  };

  // 1. Lưu lên Supabase Cloud (Bảng platform_settings) - Hoạt động 100% trên Vercel
  let savedCloud = false;
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'bds_telegram_config',
          value: toPersist,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (!error) {
        savedCloud = true;
      } else {
        console.warn('Lỗi Supabase khi lưu bds_telegram_config:', error.message);
      }
    } catch (e) {
      console.warn('Lỗi kết nối Supabase khi lưu config:', e.message);
    }
  }

  // 2. Ghi bản sao vào server-db.json nếu được phép (Local dev)
  try {
    const db = readServerDb();
    db.bds_telegram_config = toPersist;
    writeServerDb(db);
  } catch (_) {}

  return { success: true, savedCloud };
}

// =======================================================================
// 2. QUẢN LÝ PHIÊN CHAT & ÁNH XẠ TIN NHẮN (SESSIONS & MESSAGE MAP)
// =======================================================================

/**
 * Định dạng thời gian chuẩn Việt Nam (GMT+7) cho cả Client & Vercel Serverless
 */
export function formatVnTime(date = new Date()) {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
}

export function formatVnDateTime(date = new Date()) {
  const d = new Date(date);
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  const day = d.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  return `${time} ngày ${day}`;
}

/**
 * Lấy toàn bộ sessions từ Supabase / in-memory / local
 */
export async function getChatSessions() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'bds_chat_sessions')
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        memoryChatSessions = data.value;
        return memoryChatSessions;
      }
    } catch (_) {}
  }

  if (memoryChatSessions) return memoryChatSessions;

  const db = readServerDb();
  memoryChatSessions = db.bds_chat_sessions || {};
  return memoryChatSessions;
}

/**
 * Lưu toàn bộ sessions lên Supabase & local
 */
export async function saveChatSessions(sessions) {
  memoryChatSessions = sessions;

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('platform_settings')
        .upsert({
          key: 'bds_chat_sessions',
          value: sessions,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
    } catch (e) {
      console.warn('Lỗi lưu bds_chat_sessions lên Supabase:', e.message);
    }
  }

  try {
    const db = readServerDb();
    db.bds_chat_sessions = sessions;
    writeServerDb(db);
  } catch (_) {}
}

/**
 * Tra cứu sessionId từ telegramMsgId
 */
export async function resolveSessionIdFromMsgMap(telegramMsgId) {
  if (!telegramMsgId) return null;
  const idStr = String(telegramMsgId);
  if (memoryMsgMap.has(idStr)) {
    return memoryMsgMap.get(idStr);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'bds_chat_message_map')
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        for (const [k, v] of Object.entries(data.value)) {
          memoryMsgMap.set(String(k), v);
        }
        if (memoryMsgMap.has(idStr)) {
          return memoryMsgMap.get(idStr);
        }
      }
    } catch (_) {}
  }

  const db = readServerDb();
  return db.bds_chat_message_map?.[idStr] || null;
}

/**
 * Ghi ánh xạ telegramMsgId -> sessionId
 * Luôn merge với dữ liệu Supabase hiện có để không làm mất ánh xạ của các Lambda/phiên khác
 */
export async function saveTelegramMsgMapping(telegramMsgId, sessionId) {
  if (!telegramMsgId || !sessionId) return;
  const idStr = String(telegramMsgId);
  memoryMsgMap.set(idStr, sessionId);

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Đọc dữ liệu hiện tại từ Supabase để hợp nhất (tránh ghi đè xóa sạch của Lambda khác)
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'bds_chat_message_map')
        .maybeSingle();

      const mergedMap = (data?.value && typeof data.value === 'object') ? { ...data.value } : {};
      
      // Đồng bộ các ánh xạ trong memory
      for (const [k, v] of memoryMsgMap.entries()) {
        mergedMap[k] = v;
      }
      mergedMap[idStr] = sessionId;

      // Giới hạn 500 ID gần nhất
      const keys = Object.keys(mergedMap);
      if (keys.length > 500) {
        keys.slice(0, keys.length - 500).forEach(k => delete mergedMap[k]);
      }

      await supabase
        .from('platform_settings')
        .upsert({
          key: 'bds_chat_message_map',
          value: mergedMap,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      for (const [k, v] of Object.entries(mergedMap)) {
        memoryMsgMap.set(k, v);
      }
    } catch (e) {
      console.warn('Lỗi lưu bds_chat_message_map lên Supabase:', e.message);
    }
  }

  try {
    const db = readServerDb();
    if (!db.bds_chat_message_map) db.bds_chat_message_map = {};
    db.bds_chat_message_map[idStr] = sessionId;
    writeServerDb(db);
  } catch (_) {}
}

// =======================================================================
// 3. TƯƠNG TÁC VỚI TELEGRAM BOT API (GỬI TIN, TEST, WEBHOOK)
// =======================================================================

/**
 * Gửi tin nhắn thô lên Telegram qua Bot API
 */
export async function sendRawTelegramMessage(botToken, chatId, text, extraParams = {}) {
  if (!botToken || !chatId) {
    return { success: false, error: 'Thiếu Telegram Bot Token hoặc Chat ID' };
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        ...extraParams
      })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Lỗi gửi tin nhắn Telegram' };
    }

    return { success: true, result: data.result };
  } catch (err) {
    console.error('Lỗi kết nối Telegram API:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Kiểm tra kết nối Telegram Bot & Gửi tin nhắn thử nghiệm
 */
export async function testTelegramConnection(botTokenInput = null, chatIdInput = null) {
  const config = await getTelegramConfig(false);
  const token = botTokenInput && !botTokenInput.includes('••••') ? botTokenInput.trim() : config.botToken;
  const chatId = chatIdInput ? String(chatIdInput).trim() : config.chatId;

  if (!token) {
    return { success: false, error: 'Chưa cấu hình Telegram Bot Token!' };
  }
  if (!chatId) {
    return { success: false, error: 'Chưa cấu hình Telegram Chat ID!' };
  }

  // 1. Kiểm tra Bot info qua getMe
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    if (!meRes.ok || !meData.ok) {
      return { success: false, error: `Bot Token không hợp lệ: ${meData.description || 'Xác thực thất bại'}` };
    }

    const botName = meData.result?.first_name || meData.result?.username || 'Bot';

    // 2. Gửi tin nhắn kiểm tra vào nhóm/kênh
    const testMsg = `
🟢 <b>KIỂM TRA KẾT NỐI LIVE CHAT THÀNH CÔNG!</b>
────────────────────────
🤖 <b>Tên Bot:</b> @${meData.result?.username || botName}
🏢 <b>Hệ thống:</b> Sàn BĐS Đất Biển Đà Nẵng
🕒 <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
✨ Hệ thống Live Chat 2 chiều đã sẵn sàng nhận tin nhắn từ khách hàng!
`.trim();

    const sendRes = await sendRawTelegramMessage(token, chatId, testMsg);
    if (!sendRes.success) {
      return { success: false, error: `Không thể gửi tin vào Chat ID "${chatId}": ${sendRes.error}` };
    }

    return {
      success: true,
      bot: meData.result,
      message: `Đã kết nối thành công với Bot @${meData.result.username} và gửi tin kiểm tra tới Chat ID ${chatId}!`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Đăng ký Webhook tự động với Telegram
 */
export async function setTelegramWebhook(webhookUrl, secretToken = null, botTokenInput = null) {
  const config = await getTelegramConfig(false);
  const token = botTokenInput && !botTokenInput.includes('••••') ? botTokenInput.trim() : config.botToken;

  if (!token) {
    return { success: false, error: 'Chưa cấu hình Telegram Bot Token!' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/setWebhook`;
    const payload = {
      url: webhookUrl,
      allowed_updates: ['message', 'edited_message'],
      drop_pending_updates: false
    };
    if (secretToken) {
      payload.secret_token = secretToken;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || 'Lỗi thiết lập Webhook' };
    }

    return { success: true, message: 'Đã kích hoạt Webhook thành công với Telegram!', data: data.result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// =======================================================================
// 4. LUỒNG XỬ LÝ CHAT 2 CHIỀU (OUTBOUND WEB -> TG & INBOUND TG -> WEB)
// =======================================================================

/**
 * Xử lý Khách Hàng mới bắt đầu phiên chat (Bắn Lead thông báo lên Telegram)
 */
export async function registerNewLeadChat({ sessionId, customer, propertyContext, agentName }) {
  const config = await getTelegramConfig(false);
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, message: 'Telegram bot chưa kích hoạt' };
  }

  // Khởi tạo hoặc cập nhật session trong DB
  const sessions = await getChatSessions();
  const existing = sessions[sessionId] || {};

  // Xác định chuyên viên tư vấn tiếp nhận (ưu tiên tên đã gán, tên truyền từ client, hoặc random từ danh sách)
  let assignedAgent = existing.agentName || agentName;
  if (!assignedAgent) {
    if (config.enableRandomAgentName && Array.isArray(config.agentNamesList) && config.agentNamesList.length > 0) {
      assignedAgent = config.agentNamesList[Math.floor(Math.random() * config.agentNamesList.length)];
    } else {
      assignedAgent = config.agentName || 'Nguyễn Huyền';
    }
  }

  const sessionData = {
    ...existing,
    sessionId,
    agentName: assignedAgent,
    customer: {
      name: customer?.name || 'Khách vãng lai',
      phone: customer?.phone || 'Chưa cung cấp',
      email: customer?.email || ''
    },
    propertyContext: propertyContext || null,
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: existing.messages || [
      {
        id: 'msg_welcome',
        sender: 'agent',
        text: config.welcomeMessage,
        time: formatVnTime(),
        timestamp: Date.now()
      }
    ]
  };

  sessions[sessionId] = sessionData;
  await saveChatSessions(sessions);

  // Bắn thông báo Lead mới về Telegram nếu được bật
  if (config.notifyNewLead) {
    const cleanPhone = (customer?.phone || '').replace(/\s+/g, '');
    const leadMsg = `
🔔 <b>KHÁCH HÀNG MỚI BẮT ĐẦU LIVE CHAT</b>
────────────────────────
👤 <b>Họ tên:</b> ${customer?.name || 'Khách vãng lai'}
📞 <b>Số điện thoại:</b> <a href="tel:${cleanPhone}">${customer?.phone || 'Chưa có'}</a>
👩‍💼 <b>Chuyên viên tiếp nhận:</b> ${assignedAgent}
💬 <b>Zalo:</b> <a href="https://zalo.me/${cleanPhone}">Chat Zalo ngay</a>${customer?.email ? `\n✉️ <b>Email:</b> ${customer.email}` : ''}<a href="https://chat.bds/#chat_${sessionId}">&#8203;</a>
`.trim();

    const sendRes = await sendRawTelegramMessage(config.botToken, config.chatId, leadMsg);
    if (sendRes.success && sendRes.result?.message_id) {
      const leadMsgId = String(sendRes.result.message_id);
      await saveTelegramMsgMapping(leadMsgId, sessionId);
    }
  }

  return { success: true, session: sessionData };
}

/**
 * Khách gửi tin nhắn từ Web lên Telegram (Chiều đi)
 * Định dạng tinh gọn, loại bỏ dòng "Đang hỏi về" và "Mã phiên" để dễ thao tác trên điện thoại
 */
export async function sendCustomerMessageToTelegram({ sessionId, customer, propertyContext, messageText }) {
  const config = await getTelegramConfig(false);
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, error: 'Hệ thống Live Chat đang tạm ngưng phục vụ' };
  }

  // 1. Lưu tin nhắn vào session DB
  const sessions = await getChatSessions();
  let session = sessions[sessionId];
  if (!session) {
    session = {
      sessionId,
      customer: customer || { name: 'Khách hàng', phone: '' },
      propertyContext: propertyContext || null,
      createdAt: new Date().toISOString(),
      messages: []
    };
  }

  const newMsg = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    sender: 'user',
    text: messageText,
    time: formatVnTime(),
    timestamp: Date.now()
  };

  session.messages = [...(session.messages || []), newMsg];
  session.updatedAt = new Date().toISOString();
  sessions[sessionId] = session;
  await saveChatSessions(sessions);

  // 2. Định dạng thông điệp gửi lên nhóm Telegram siêu tinh gọn, dễ đọc, dễ thao tác
  const custName = session.customer?.name || 'Khách hàng';
  const custPhone = session.customer?.phone 
    ? ` | <a href="tel:${session.customer.phone.replace(/\s+/g, '')}">${session.customer.phone}</a>` 
    : '';

  const telegramText = `
💬 <b>${custName}</b>${custPhone}:
<i>"${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</i><a href="https://chat.bds/#chat_${sessionId}">&#8203;</a>
`.trim();

  // 3. Gửi lên Telegram
  const sendRes = await sendRawTelegramMessage(config.botToken, config.chatId, telegramText);
  if (sendRes.success && sendRes.result?.message_id) {
    const telegramMsgId = String(sendRes.result.message_id);
    await saveTelegramMsgMapping(telegramMsgId, sessionId);
  }

  return { success: true, message: newMsg };
}

/**
 * Xử lý Webhook khi nhân viên Reply tin nhắn trên Telegram (Chiều về)
 */
export async function handleTelegramWebhookUpdate(update) {
  if (!update || !update.message) {
    return { success: false, reason: 'Không có nội dung message' };
  }

  const message = update.message;
  const replyTo = message.reply_to_message;

  // Chỉ xử lý khi nhân viên bấm Reply (Trả lời) một tin nhắn trước đó
  if (!replyTo) {
    return { success: false, reason: 'Bỏ qua tin nhắn không phải là Reply của nhân viên' };
  }

  const replyMsgId = String(replyTo.message_id);
  const staffReplyText = (message.text || '').trim();

  if (!staffReplyText) {
    return { success: false, reason: 'Tin nhắn trả lời không có nội dung chữ' };
  }

  // 1. Tìm sessionId từ bản đồ ánh xạ telegramMsgId -> sessionId
  let sessionId = await resolveSessionIdFromMsgMap(replyMsgId);

  // 2. Fallback 1: Trích xuất từ link entity ẩn trong tin nhắn
  if (!sessionId && Array.isArray(replyTo.entities)) {
    for (const ent of replyTo.entities) {
      if (ent.type === 'text_link' && ent.url) {
        const match = ent.url.match(/#chat_([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) {
          sessionId = match[1];
          break;
        }
      }
    }
  }

  // 3. Fallback 2: Trích xuất từ hashtag trong văn bản gốc nếu có
  if (!sessionId && replyTo.text) {
    const match = replyTo.text.match(/#(?:chat_)?(chat_[a-zA-Z0-9_\-]+)/i)
               || replyTo.text.match(/#chat_([a-zA-Z0-9_\-]+)/i)
               || replyTo.text.match(/#(chat_[0-9]+_[a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      const candidate = match[1];
      const allSessions = await getChatSessions();
      if (allSessions[candidate]) {
        sessionId = candidate;
      } else if (allSessions[`chat_${candidate}`]) {
        sessionId = `chat_${candidate}`;
      } else {
        sessionId = candidate;
      }
    }
  }

  if (!sessionId) {
    return {
      success: false,
      reason: `Không tìm thấy phiên chat tương ứng với tin nhắn Telegram ID ${replyMsgId}`
    };
  }

  // 3. Lưu phản hồi của nhân viên vào phiên chat của khách hàng
  const sessions = await getChatSessions();
  const session = sessions[sessionId];
  if (!session) {
    return { success: false, reason: `Phiên chat ${sessionId} đã hết hạn hoặc không tồn tại` };
  }

  const agentMsg = {
    id: `msg_agent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    sender: 'agent',
    text: staffReplyText,
    time: formatVnTime(),
    timestamp: Date.now()
  };

  session.messages = [...(session.messages || []), agentMsg];
  session.updatedAt = new Date().toISOString();
  sessions[sessionId] = session;
  await saveChatSessions(sessions);

  // Lưu lại ID của tin nhắn trả lời này vào map để nhân viên có thể tiếp tục reply chuỗi hội thoại
  const currentMsgId = String(message.message_id);
  await saveTelegramMsgMapping(currentMsgId, sessionId);

  // 4. Bắn Realtime qua Pusher REST API (nếu được cấu hình key) - Không cần thư viện ngoài
  const config = await getTelegramConfig(false);
  if (config.realtimeProvider === 'pusher' && config.pusherKey && config.pusherSecret && config.pusherAppId) {
    try {
      await triggerPusherEventNative(config, `chat-${sessionId}`, 'new-message', agentMsg);
    } catch (e) {
      console.warn('Lỗi gửi Pusher event:', e.message);
    }
  }

  return {
    success: true,
    sessionId,
    message: agentMsg
  };
}

/**
 * Gửi event realtime qua Pusher Channels REST API chuẩn không cần cài thư viện ngoài
 */
async function triggerPusherEventNative(config, channel, eventName, data) {
  if (!config.pusherKey || !config.pusherSecret || !config.pusherAppId) return;
  const cluster = config.pusherCluster || 'ap1';
  const host = `api-${cluster}.pusher.com`;
  const path = `/apps/${config.pusherAppId}/events`;
  
  const bodyObj = {
    name: eventName,
    channel: channel,
    data: typeof data === 'string' ? data : JSON.stringify(data)
  };
  const bodyStr = JSON.stringify(bodyObj);
  const bodyMd5 = crypto.createHash('md5').update(bodyStr, 'utf8').digest('hex');
  
  const timestamp = Math.floor(Date.now() / 1000);
  const params = [
    `auth_key=${encodeURIComponent(config.pusherKey)}`,
    `auth_timestamp=${timestamp}`,
    `auth_version=1.0`,
    `body_md5=${bodyMd5}`
  ].sort().join('&');
  
  const stringToSign = `POST\n${path}\n${params}`;
  const signature = crypto
    .createHmac('sha256', config.pusherSecret)
    .update(stringToSign, 'utf8')
    .digest('hex');
    
  const url = `https://${host}${path}?${params}&auth_signature=${signature}`;
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: bodyStr
  });
}

/**
 * Lấy lịch sử tin nhắn của một phiên chat
 */
export async function getSessionMessages(sessionId, sinceTimestamp = 0) {
  if (!sessionId) return [];
  const sessions = await getChatSessions();
  const session = sessions[sessionId];
  if (!session || !Array.isArray(session.messages)) return [];

  const rawList = !sinceTimestamp 
    ? session.messages 
    : session.messages.filter(m => (m.timestamp || 0) > Number(sinceTimestamp));

  // Loại bỏ hoàn toàn staffName nếu có để không hiển thị nickname Telegram trên giao diện chat
  return rawList.map(m => {
    if (m.staffName) {
      const { staffName, ...rest } = m;
      return rest;
    }
    return m;
  });
}

/**
 * Xóa toàn bộ mapping tin nhắn liên quan tới sessionId khi kết thúc phiên
 */
export async function deleteSessionMsgMappings(sessionId) {
  if (!sessionId) return;

  // Xóa trong memory map
  for (const [msgId, sId] of memoryMsgMap.entries()) {
    if (sId === sessionId) {
      memoryMsgMap.delete(msgId);
    }
  }

  // Xóa trên Supabase Cloud platform_settings
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'bds_chat_message_map')
        .maybeSingle();

      if (data?.value && typeof data.value === 'object') {
        const map = { ...data.value };
        let modified = false;
        for (const [k, v] of Object.entries(map)) {
          if (v === sessionId) {
            delete map[k];
            modified = true;
          }
        }
        if (modified) {
          await supabase
            .from('platform_settings')
            .upsert({
              key: 'bds_chat_message_map',
              value: map,
              updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
        }
      }
    } catch (e) {
      console.warn('Lỗi xóa bds_chat_message_map:', e.message);
    }
  }

  // Xóa local
  try {
    const db = readServerDb();
    if (db.bds_chat_message_map) {
      for (const [k, v] of Object.entries(db.bds_chat_message_map)) {
        if (v === sessionId) delete db.bds_chat_message_map[k];
      }
      writeServerDb(db);
    }
  } catch (_) {}
}

/**
 * Kiểm tra và xử lý phiên chat hết hạn (Timeout 10 phút sau câu trả lời của tư vấn viên)
 * Nếu khách không phản hồi sau 10 phút: thông báo kết thúc phiên lên Telegram và xóa toàn bộ dữ liệu phiên
 */
export async function checkAndProcessSessionTimeout(sessionId) {
  if (!sessionId) return { isEnded: false };
  const sessions = await getChatSessions();
  const session = sessions[sessionId];

  if (!session || !Array.isArray(session.messages) || session.messages.length === 0) {
    return { isEnded: false };
  }

  const hasUserMsg = session.messages.some(m => m.sender === 'user');
  const lastMsg = session.messages[session.messages.length - 1];

  // Điều kiện kiểm tra:
  // 1. Khách hàng đã gửi ít nhất 1 tin nhắn
  // 2. Tư vấn viên đã phản hồi lại (tin nhắn cuối cùng là từ agent)
  // 3. Đã quá 10 phút (600,000 ms) kể từ câu trả lời của tư vấn viên mà khách không gửi thêm tin nào
  if (hasUserMsg && lastMsg && lastMsg.sender === 'agent') {
    const elapsedMs = Date.now() - (lastMsg.timestamp || 0);
    const TIMEOUT_MS = 10 * 60 * 1000; // 10 phút

    if (elapsedMs >= TIMEOUT_MS) {
      // 1. Gửi thông báo kết thúc phiên chat lên nhóm Telegram
      const config = await getTelegramConfig(false);
      if (config.enabled && config.botToken && config.chatId) {
        const custName = session.customer?.name || 'Khách hàng';
        const cleanPhone = (session.customer?.phone || '').replace(/\s+/g, '');
        const telMsg = `
⏱️ <b>PHIÊN TƯ VẤN ĐÃ KẾT THÚC (QUÁ 10 PHÚT)</b>
────────────────────────
👤 <b>Khách:</b> ${custName} | 📞 <a href="tel:${cleanPhone}">${session.customer?.phone || 'Chưa SĐT'}</a>
<i>Phiên chat đã tự động kết thúc và xóa toàn bộ dữ liệu do khách hàng không phản hồi sau 10 phút kể từ câu trả lời của tư vấn viên.</i>
`.trim();
        sendRawTelegramMessage(config.botToken, config.chatId, telMsg).catch(console.warn);
      }

      // 2. Xóa toàn bộ dữ liệu của phiên chat đó khỏi Database
      delete sessions[sessionId];
      await saveChatSessions(sessions);
      await deleteSessionMsgMappings(sessionId);

      return {
        isEnded: true,
        reason: 'timeout',
        message: 'Phiên tư vấn đã tự động kết thúc do quý khách không phản hồi sau 10 phút. Toàn bộ dữ liệu của phiên chat đã được tự động xóa.'
      };
    }
  }

  return { isEnded: false };
}

/**
 * Quét dọn tự động toàn bộ các phiên chat quá hạn 10 phút (Dành cho Cron Job / Periodic Sweep)
 */
export async function cleanupAllExpiredChatSessions() {
  const sessions = await getChatSessions();
  const config = await getTelegramConfig(false);
  const now = Date.now();
  const TIMEOUT_MS = 10 * 60 * 1000; // 10 phút
  let hasChanges = false;
  const expiredSessionIds = [];

  for (const [sId, s] of Object.entries(sessions || {})) {
    if (!Array.isArray(s.messages) || s.messages.length === 0) continue;
    const hasUserMsg = s.messages.some(m => m.sender === 'user');
    const lastMsg = s.messages[s.messages.length - 1];

    if (hasUserMsg && lastMsg && lastMsg.sender === 'agent') {
      const elapsed = now - (lastMsg.timestamp || 0);
      if (elapsed >= TIMEOUT_MS) {
        expiredSessionIds.push(sId);

        // Bắn thông báo Telegram
        if (config.enabled && config.botToken && config.chatId) {
          const custName = s.customer?.name || 'Khách hàng';
          const cleanPhone = (s.customer?.phone || '').replace(/\s+/g, '');
          const msg = `
⏱️ <b>PHIÊN TƯ VẤN ĐÃ KẾT THÚC (QUÁ 10 PHÚT)</b>
────────────────────────
👤 <b>Khách:</b> ${custName} | 📞 <a href="tel:${cleanPhone}">${s.customer?.phone || 'Chưa SĐT'}</a>
<i>Phiên chat đã tự động kết thúc và xóa toàn bộ dữ liệu do khách hàng không phản hồi sau 10 phút kể từ câu trả lời của tư vấn viên.</i>
`.trim();
          sendRawTelegramMessage(config.botToken, config.chatId, msg).catch(console.warn);
        }

        delete sessions[sId];
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    await saveChatSessions(sessions);
    for (const id of expiredSessionIds) {
      await deleteSessionMsgMappings(id);
    }
  }

  return { cleanedCount: expiredSessionIds.length, expiredSessionIds };
}

/**
 * Lấy toàn bộ danh sách phiên chat (Dành cho trang quản trị Admin)
 */
export async function getAllChatSessions(limit = 50) {
  const sessions = await getChatSessions();
  const list = Object.values(sessions || {});
  return list
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, limit);
}
