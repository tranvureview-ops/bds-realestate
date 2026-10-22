import { NextResponse } from 'next/server';
import { sendCustomerMessageToTelegram } from '../../../../lib/telegramService';
import { formatPhoneNumber } from '../../../../utils/authValidation';

/**
 * API GỬI TIN NHẮN TỪ WEBSITE LÊN TELEGRAM (CHIỀU ĐI)
 * POST /api/chat/send
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, customer, propertyContext, message } = body || {};

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã định danh phiên (sessionId)' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Nội dung tin nhắn không được để trống' }, { status: 400 });
    }

    const formattedCustomer = customer ? {
      name: customer.name?.trim() || 'Khách hàng',
      phone: formatPhoneNumber(customer.phone) || '',
      email: (customer.email || '').trim()
    } : null;

    const result = await sendCustomerMessageToTelegram({
      sessionId,
      customer: formattedCustomer,
      propertyContext: propertyContext || null,
      messageText: message.trim()
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error('Lỗi API /api/chat/send:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
