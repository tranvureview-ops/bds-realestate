import { NextResponse } from 'next/server';
import { getSessionMessages, getTelegramConfig } from '../../../../lib/telegramService';

/**
 * API LẤY LỊCH SỬ TIN NHẮN THEO PHIÊN & REALTIME POLLING
 * GET /api/chat/messages?sessionId=...&since=...
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const since = searchParams.get('since') || 0;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã định danh phiên (sessionId)' }, { status: 400 });
    }

    const messages = await getSessionMessages(sessionId, Number(since));
    const config = await getTelegramConfig(true);

    return NextResponse.json({
      success: true,
      sessionId,
      messages,
      agentInfo: {
        name: config.agentName,
        avatar: config.agentAvatar,
        title: config.agentTitle
      },
      welcomeMessage: config.welcomeMessage,
      quickQuestions: config.quickQuestions
    });
  } catch (err) {
    console.error('Lỗi API /api/chat/messages:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
