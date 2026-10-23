import { NextResponse } from 'next/server';
import {
  getSessionMessages,
  getTelegramConfig,
  checkAndProcessSessionTimeout
} from '../../../../lib/telegramService';

/**
 * API LẤY LỊCH SỬ TIN NHẮN THEO PHIÊN & REALTIME POLLING
 * GET /api/chat/messages?sessionId=...&since=...
 * Tự động kiểm tra timeout 10 phút sau câu trả lời của tư vấn viên để thông báo và dọn dẹp
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const since = searchParams.get('since') || 0;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã định danh phiên (sessionId)' }, { status: 400 });
    }

    // 1. Kiểm tra phiên chat có bị timeout 10 phút sau phản hồi của tư vấn viên không
    const timeoutCheck = await checkAndProcessSessionTimeout(sessionId);
    if (timeoutCheck.isEnded) {
      const config = await getTelegramConfig(true);
      return NextResponse.json({
        success: true,
        sessionEnded: true,
        reason: timeoutCheck.reason || 'timeout',
        timeoutMessage: timeoutCheck.message,
        sessionId,
        messages: [],
        agentInfo: {
          name: config.agentName,
          avatar: config.agentAvatar,
          title: config.agentTitle
        },
        welcomeMessage: config.welcomeMessage,
        quickQuestions: config.quickQuestions
      });
    }

    const messages = await getSessionMessages(sessionId, Number(since));
    const config = await getTelegramConfig(true);

    return NextResponse.json({
      success: true,
      sessionEnded: false,
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
