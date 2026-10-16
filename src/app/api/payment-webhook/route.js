import { NextResponse } from 'next/server';
import { paymentSessions } from '../../../utils/paymentSessions';

export async function POST(request) {
  try {
    const data = await request.json();
    const orderId = data.orderId;
    if (orderId) {
      const session = paymentSessions.get(orderId) || { orderId };
      session.status = 'success';
      session.paidAt = Date.now();
      session.paidAmount = data.amount || session.amount;
      paymentSessions.set(orderId, session);
    }
    return NextResponse.json({ success: true, message: 'Webhook received and payment marked success' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
