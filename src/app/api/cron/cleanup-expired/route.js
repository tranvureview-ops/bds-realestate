import { NextResponse } from 'next/server';
import { executeAutoDatabaseCleanup } from '../../../../services/propertyCleanupService';
import { cleanupAllExpiredChatSessions } from '../../../../lib/telegramService';

/**
 * Endpoint GET cho Vercel Cron Job tự động chạy định kỳ
 * Quét dọn BĐS hết hạn & Tự động kết thúc + xóa phiên chat quá 10 phút sau phản hồi của tư vấn viên
 */
export async function GET() {
  try {
    const propertyResult = await executeAutoDatabaseCleanup();
    const chatResult = await cleanupAllExpiredChatSessions();
    return NextResponse.json({
      success: true,
      propertyCleanup: propertyResult,
      chatSessionsCleanup: chatResult
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Endpoint POST cho Admin kích hoạt quét dọn dẹp thủ công từ server
 */
export async function POST() {
  try {
    const propertyResult = await executeAutoDatabaseCleanup();
    const chatResult = await cleanupAllExpiredChatSessions();
    return NextResponse.json({
      success: true,
      propertyCleanup: propertyResult,
      chatSessionsCleanup: chatResult
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
