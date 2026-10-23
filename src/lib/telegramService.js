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
  if (newConfig.botToken && !newConfig.botToken.includes('••••')) {
    tokenToSave = newConfig.botToken.trim();
  }

  let pusherSecretToSave = current.pusherSecret;
  if (newConfig.pusherSecret && !newConfig.pusherSecret.includes('••••')) {
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
 */
export async function saveTelegramMsgMapping(telegramMsgId, sessionId) {
  const idStr = String(telegramMsgId);
  memoryMsgMap.set(idStr, sessionId);
  const currentObj = Object.fromEntries(memoryMsgMap);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('platform_settings')
        .upsert({
          key: 'bds_chat_message_map',
          value: currentObj,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
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
export async function registerNewLeadChat({ sessionId, customer, propertyContext }) {
  const config = await getTelegramConfig(false);
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, message: 'Telegram bot chưa kích hoạt' };
  }

  // Khởi tạo hoặc cập nhật session trong DB
  const sessions = await getChatSessions();
  const existing = sessions[sessionId] || {};
  const sessionData = {
    ...existing,
    sessionId,
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
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }
    ]
  };

  sessions[sessionId] = sessionData;
  await saveChatSessions(sessions);

  // Bắn thông báo Lead mới về Telegram nếu được bật
  if (config.notifyNewLead) {
    let propText = 'Khách truy cập chung trên toàn sàn';
    if (propertyContext) {
      propText = `<b>${propertyContext.title || 'Bất động sản'}</b>\n   💰 Giá: <b>${propertyContext.priceDisplay || 'Thương lượng'}</b> (Mã: <code>${propertyContext.id || 'N/A'}</code>)`;
    }

    const leadMsg = `
🔔 <b>KHÁCH HÀNG MỚI BẮT ĐẦU LIVE CHAT</b>
────────────────────────
👤 <b>Họ tên:</b> ${customer?.name || 'Khách vãng lai'}
📞 <b>Số điện thoại:</b> <a href="tel:${(customer?.phone || '').replace(/\s+/g, '')}">${customer?.phone || 'Chưa có'}</a>
💬 <b>Zalo:</b> <a href="https://zalo.me/${(customer?.phone || '').replace(/\s+/g, '')}">Chat Zalo ngay</a>
${customer?.email ? `✉️ <b>Email:</b> ${customer.email}\n` : ''}🏠 <b>Đang xem:</b> ${propText}
🆔 <b>Mã phiên:</b> <code>#chat_${sessionId}</code>
🕒 <b>Thời gian:</b> ${new Date().toLocaleTimeString('vi-VN')} ngày ${new Date().toLocaleDateString('vi-VN')}
────────────────────────
👉 <i>Khách hàng vừa mở khung chat và sẵn sàng nhận tư vấn từ chuyên viên.</i>
`.trim();

    sendRawTelegramMessage(config.botToken, config.chatId, leadMsg).catch(console.warn);
  }

  return { success: true, session: sessionData };
}

/**
 * Khách gửi tin nhắn từ Web lên Telegram (Chiều đi)
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
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  session.messages = [...(session.messages || []), newMsg];
  session.updatedAt = new Date().toISOString();
  sessions[sessionId] = session;
  await saveChatSessions(sessions);

  // 2. Định dạng thông điệp gửi lên nhóm Telegram
  let propHeader = '';
  if (propertyContext?.title) {
    propHeader = `\n🏠 <b>Đang hỏi về:</b> ${propertyContext.title} (<b>${propertyContext.priceDisplay || ''}</b>)`;
  }

  const telegramText = `
💬 <b>TIN NHẮN TỪ KHÁCH HÀNG</b>
👤 <b>Khách:</b> ${session.customer?.name || 'Khách vãng lai'} | 📞 <b>SĐT:</b> <a href="tel:${(session.customer?.phone || '').replace(/\s+/g, '')}">${session.customer?.phone || 'Chưa có'}</a>${propHeader}
🆔 <b>Mã phiên:</b> <code>#chat_${sessionId}</code>
────────────────────────
📝 <b>Nội dung:</b>
<i>"${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</i>
────────────────────────
👉 <b>HƯỚNG DẪN:</b> Nhân viên chỉ cần bấm <b>REPLY (TRẢ LỜI)</b> tin nhắn này trên Telegram để chat trực tiếp với khách!
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

  // 2. Fallback: Nếu không tìm thấy trong map, trích xuất từ mã #chat_xxxx trong văn bản gốc
  if (!sessionId && replyTo.text) {
    const match = replyTo.text.match(/#chat_([a-zA-Z0-9_\-]+)/);
    if (match && match[1]) {
      sessionId = match[1];
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

  const staffName = message.from?.first_name 
    ? `${message.from.first_name}${message.from.last_name ? ' ' + message.from.last_name : ''}`
    : 'Chuyên Viên Tư Vấn';

  const agentMsg = {
    id: `msg_agent_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    sender: 'agent',
    text: staffReplyText,
    staffName: staffName,
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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

  if (!sinceTimestamp) return session.messages;
  return session.messages.filter(m => (m.timestamp || 0) > Number(sinceTimestamp));
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
