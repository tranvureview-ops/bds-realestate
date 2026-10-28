import { NextResponse } from 'next/server';
import {
  getSessionMessages,
  getTelegramConfig,
  checkAndProcessSessionTimeout,
  getChatSessions
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

    const config = await getTelegramConfig(true);
    const sessions = await getChatSessions();
    const currentSession = sessions[sessionId];

    // Xác định tên chuyên viên phụ trách cho phiên này
    let effectiveAgentName = currentSession?.agentName;
    if (!effectiveAgentName) {
      if (config.enableRandomAgentName && Array.isArray(config.agentNamesList) && config.agentNamesList.length > 0) {
        effectiveAgentName = config.agentNamesList[Math.floor(Math.random() * config.agentNamesList.length)];
      } else {
        effectiveAgentName = config.agentName || 'Nguyễn Huyền';
      }
    }

    // 1. Kiểm tra phiên chat có bị timeout 10 phút sau phản hồi của tư vấn viên không
    const timeoutCheck = await checkAndProcessSessionTimeout(sessionId);
    if (timeoutCheck.isEnded) {
      return NextResponse.json({
        success: true,
        sessionEnded: true,
        reason: timeoutCheck.reason || 'timeout',
        timeoutMessage: timeoutCheck.message,
        sessionId,
        messages: [],
        agentInfo: {
          name: effectiveAgentName,
          avatar: config.agentAvatar,
          title: config.agentTitle
        },
        enableRandomAgentName: config.enableRandomAgentName ?? true,
        agentNamesList: config.agentNamesList || [],
        welcomeMessage: config.welcomeMessage,
        quickQuestions: config.quickQuestions
      });
    }

    const messages = await getSessionMessages(sessionId, Number(since));

    return NextResponse.json({
      success: true,
      sessionEnded: false,
      sessionId,
      messages,
      agentInfo: {
        name: effectiveAgentName,
        avatar: config.agentAvatar,
        title: config.agentTitle
      },
      enableRandomAgentName: config.enableRandomAgentName ?? true,
      agentNamesList: config.agentNamesList || [],
      welcomeMessage: config.welcomeMessage,
      quickQuestions: config.quickQuestions
    });
  } catch (err) {
    console.error('Lỗi API /api/chat/messages:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
