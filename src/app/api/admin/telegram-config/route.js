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
    const sessions = getAllChatSessions(30);

    // Tính toán Webhook URL dựa trên host request
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const webhookUrl = `${proto}://${host}/api/chat/telegram-webhook`;

    return NextResponse.json({
      success: true,
      config,
      suggestedWebhookUrl: webhookUrl,
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
      const { webhookUrl, secretToken } = body;
      const result = await setTelegramWebhook(webhookUrl, secretToken);
      return NextResponse.json(result);
    }

    // 3. Lưu cấu hình Telegram Bot
    if (action === 'save' || !action) {
      const { config } = body;
      if (!config) {
        return NextResponse.json({ success: false, error: 'Thiếu dữ liệu cấu hình' }, { status: 400 });
      }

      await saveTelegramConfig(config);
      const updatedMasked = await getTelegramConfig(true);

      return NextResponse.json({
        success: true,
        message: 'Đã lưu cấu hình Live Chat Telegram thành công (Token được mã hóa an toàn AES-256)!',
        config: updatedMasked
      });
    }

    return NextResponse.json({ success: false, error: `Hành động "${action}" không hợp lệ` }, { status: 400 });
  } catch (err) {
    console.error('Lỗi POST /api/admin/telegram-config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
