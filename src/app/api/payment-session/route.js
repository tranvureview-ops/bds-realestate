import { NextResponse } from 'next/server';
import { paymentSessions } from '../../../utils/paymentSessions';

export async function POST(request) {
  try {
    const data = await request.json();
    if (data.orderId) {
      paymentSessions.set(data.orderId, {
        orderId: data.orderId,
        amount: data.amount,
        status: 'pending',
        createdAt: Date.now()
      });
    }
    return NextResponse.json({ success: true, orderId: data.orderId });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
