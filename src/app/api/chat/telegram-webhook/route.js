import { NextResponse } from 'next/server';
import { handleTelegramWebhookUpdate } from '../../../../lib/telegramService';

/**
 * TELEGRAM WEBHOOK ENDPOINT (CHIỀU VỀ: TELEGRAM -> WEBSITE)
 * Nhận tin nhắn nhân viên bấm "Reply" từ nhóm Telegram và chuyển thẳng về trình duyệt của khách hàng
 * POST /api/chat/telegram-webhook
 */
export async function POST(req) {
  try {
    const update = await req.json();

    // Telegram sends update object: { update_id, message: { ... } }
    const result = await handleTelegramWebhookUpdate(update);

    // Luôn trả về 200 OK để Telegram không gửi lại nhiều lần (re-try storm)
    return NextResponse.json({
      ok: true,
      result: result
    });
  } catch (err) {
    console.error('Lỗi Telegram Webhook:', err);
    return NextResponse.json({ ok: true, error: err.message }, { status: 200 });
  }
}

/**
 * GET method để kiểm tra tình trạng Webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'BDS Telegram Webhook 2-Way Live Chat Gateway',
    timestamp: new Date().toISOString()
  });
}
