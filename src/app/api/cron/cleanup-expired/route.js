import { NextResponse } from 'next/server';
import { executeAutoDatabaseCleanup } from '../../../../services/propertyCleanupService';

/**
 * Endpoint GET cho Vercel Cron Job tự động chạy định kỳ
 */
export async function GET() {
  try {
    const result = await executeAutoDatabaseCleanup();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Endpoint POST cho Admin kích hoạt quét dọn dẹp thủ công từ server
 */
export async function POST() {
  try {
    const result = await executeAutoDatabaseCleanup();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
