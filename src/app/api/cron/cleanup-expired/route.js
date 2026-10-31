import { NextResponse } from 'next/server';
import { executeAutoDatabaseCleanup } from '../../../../services/propertyCleanupService';
import { cleanupAllExpiredChatSessions } from '../../../../lib/telegramService';
import { verifyAdminRequest } from '../../../../utils/adminAuth';

function isAuthorizedCron(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  const adminCheck = verifyAdminRequest(req);
  if (adminCheck.valid) return true;
  // Cho phép chạy offline dev nếu chưa cấu hình secret
  return process.env.NODE_ENV !== 'production' && !process.env.CRON_SECRET;
}

/**
 * Endpoint GET cho Vercel Cron Job tự động chạy định kỳ
 * Quét dọn BĐS hết hạn & Tự động kết thúc + xóa phiên chat quá 10 phút sau phản hồi của tư vấn viên
 */
export async function GET(req) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized Cron Request' }, { status: 401 });
    }
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
export async function POST(req) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized Cron Request' }, { status: 401 });
    }
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
