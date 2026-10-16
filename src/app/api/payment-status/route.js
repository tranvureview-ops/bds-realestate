import { NextResponse } from 'next/server';
import { paymentSessions } from '../../../utils/paymentSessions';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const session = paymentSessions.get(orderId) || { orderId, status: 'pending' };
  return NextResponse.json(session);
}
