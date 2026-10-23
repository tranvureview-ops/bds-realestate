import { NextResponse } from 'next/server';
import {
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramConnection,
  setTelegramWebhook,
  getAllChatSessions
} from '../../../../lib/telegramService';

/**
 * API QUẢN TRỊ CẤU HÌNH TELEGRAM BOT & PHIÊN LIVE CHAT
 * GET & POST /api/admin/telegram-config
 */
export async function GET(req) {
  try {
    const config = await getTelegramConfig(true); // Trả về dạng mask token
    const sessions = await getAllChatSessions(30);

    // Tính toán Webhook URL dựa trên host request
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const webhookUrl = `${proto}://${host}/api/chat/telegram-webhook`;

    // Lấy thông tin webhook thực tế từ Telegram nếu đã có botToken
    let webhookInfo = null;
    try {
      const rawConfig = await getTelegramConfig(false);
      if (rawConfig.botToken) {
        const whRes = await fetch(`https://api.telegram.org/bot${rawConfig.botToken}/getWebhookInfo`);
        const whData = await whRes.json();
        if (whData.ok) {
          webhookInfo = whData.result;
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      config,
      suggestedWebhookUrl: webhookUrl,
      webhookInfo,
      sessionsCount: sessions.length,
      sessions
    });
  } catch (err) {
    console.error('Lỗi GET /api/admin/telegram-config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body || {};

    // 1. Kiểm tra kết nối Telegram Bot & Gửi tin nhắn test
    if (action === 'test') {
      const { botToken, chatId } = body;
      const result = await testTelegramConnection(botToken, chatId);
      return NextResponse.json(result);
    }

    // 2. Kích hoạt Webhook với Telegram
    if (action === 'set-webhook') {
      const { webhookUrl, secretToken, botToken } = body;
      const result = await setTelegramWebhook(webhookUrl, secretToken, botToken);
      return NextResponse.json(result);
    }

    // 3. Lưu cấu hình Telegram Bot & Tự động gán Webhook
    if (action === 'save' || !action) {
      const { config } = body;
      if (!config) {
        return NextResponse.json({ success: false, error: 'Thiếu dữ liệu cấu hình' }, { status: 400 });
      }

      await saveTelegramConfig(config);
      const updatedMasked = await getTelegramConfig(true);

      // Tự động kích hoạt Webhook luôn khi lưu nếu đang ở domain HTTPS (Vercel)
      let webhookAutoResult = null;
      try {
        const host = req.headers.get('host') || 'localhost:3000';
        const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
        const webhookUrl = `${proto}://${host}/api/chat/telegram-webhook`;
        if (webhookUrl.startsWith('https://')) {
          const rawConfig = await getTelegramConfig(false);
          if (rawConfig.botToken) {
            webhookAutoResult = await setTelegramWebhook(webhookUrl, null, rawConfig.botToken);
          }
        }
      } catch (whErr) {
        console.warn('Lỗi tự động gán webhook khi lưu:', whErr.message);
      }

      return NextResponse.json({
        success: true,
        message: webhookAutoResult?.success
          ? 'Đã lưu cấu hình và tự động kích hoạt Webhook 2 chiều thành công!'
          : 'Đã lưu cấu hình Live Chat Telegram thành công (Token được mã hóa an toàn AES-256)!',
        config: updatedMasked,
        webhookAutoResult
      });
    }

    return NextResponse.json({ success: false, error: `Hành động "${action}" không hợp lệ` }, { status: 400 });
  } catch (err) {
    console.error('Lỗi POST /api/admin/telegram-config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
