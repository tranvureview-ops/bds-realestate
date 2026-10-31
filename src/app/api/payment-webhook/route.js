import { NextResponse } from 'next/server';
import { paymentSessions } from '../../../utils/paymentSessions';
import { verifyAdminRequest } from '../../../utils/adminAuth';

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';

export async function POST(request) {
  try {
    // 1. Thẩm định chữ ký / mã bí mật Webhook
    const authHeader = request.headers.get('authorization') || '';
    const secretHeader = request.headers.get('x-webhook-secret') || '';
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret') || '';

    const providedSecret = secretHeader || querySecret || (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader);

    // Nếu hệ thống đã cấu hình biến WEBHOOK_SECRET, bắt buộc phải khớp hoặc là Admin
    if (WEBHOOK_SECRET && providedSecret !== WEBHOOK_SECRET) {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({ error: 'Unauthorized: Webhook signature hoặc Secret Key không hợp lệ!' }, { status: 401 });
      }
    }

    const data = await request.json();
    const orderId = data.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng (orderId).' }, { status: 400 });
    }

    const session = paymentSessions.get(orderId);
    const targetSession = session || { orderId };
    targetSession.status = 'success';
    targetSession.paidAt = Date.now();
    targetSession.paidAmount = data.amount || targetSession.amount;
    paymentSessions.set(orderId, targetSession);

    return NextResponse.json({ success: true, message: 'Webhook received and payment marked success' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
