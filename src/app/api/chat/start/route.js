import { NextResponse } from 'next/server';
import { registerNewLeadChat } from '../../../../lib/telegramService';
import { formatPhoneNumber } from '../../../../utils/authValidation';

/**
 * API BẮT ĐẦU PHIÊN LIVE CHAT & GỬI THÔNG BÁO LEAD MỚI VỀ TELEGRAM
 * POST /api/chat/start
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, customer, propertyContext, agentName } = body || {};

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã định danh phiên (sessionId)' }, { status: 400 });
    }

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp Họ tên và Số điện thoại' }, { status: 400 });
    }

    const formattedCustomer = {
      name: customer.name.trim(),
      phone: formatPhoneNumber(customer.phone),
      email: (customer.email || '').trim()
    };

    const result = await registerNewLeadChat({
      sessionId,
      customer: formattedCustomer,
      propertyContext: propertyContext || null,
      agentName: agentName || null
    });

    return NextResponse.json({
      success: true,
      session: result.session,
      customer: formattedCustomer
    });
  } catch (err) {
    console.error('Lỗi API /api/chat/start:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
