import { NextResponse } from 'next/server';
import { getAllAppointments, saveAppointment } from '../../../services/serverDbService';
import { dispatchAppointmentNotifications } from '../../../services/notificationService';
import { resolveServerOrigin } from '../../../services/mailerService';
import { validatePhoneNumber, normalizePhone } from '../../../utils/authValidation';
import { verifyAdminRequest } from '../../../utils/adminAuth';

/**
 * GET /api/appointments
 * Lấy danh sách lịch hẹn xem nhà (có thể lọc theo brokerId, customerPhone, hoặc status)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brokerId = searchParams.get('brokerId');
    const customerPhone = searchParams.get('customerPhone');
    const status = searchParams.get('status');

    // BẢO MẬT: Nếu truy vấn toàn bộ danh sách lịch hẹn (không lọc theo môi giới hay khách hàng), bắt buộc phải có quyền Admin
    if (!brokerId && !customerPhone) {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({
          success: false,
          message: 'Unauthorized: Cần quyền Quản trị viên để xem toàn bộ lịch hẹn hệ thống.'
        }, { status: 401 });
      }
    }

    let appointments = await getAllAppointments();

    if (brokerId) {
      appointments = appointments.filter(a => String(a.brokerId) === String(brokerId));
    }
    if (customerPhone) {
      const norm = normalizePhone(customerPhone);
      appointments = appointments.filter(a => normalizePhone(a.customerPhone) === norm);
    }
    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }

    return NextResponse.json({
      success: true,
      appointments,
      total: appointments.length
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách lịch hẹn:', err);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy danh sách lịch hẹn.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Đặt lịch hẹn xem nhà mới, thẩm định số điện thoại di động Việt Nam,
 * lưu vào cơ sở dữ liệu và gửi thông báo tới người đăng (Email, Zalo, SMS)
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      propertyId,
      propertyTitle,
      propertyAddress,
      propertyPrice,
      propertyPermalink,
      propertyCover,
      appointmentDate,
      customerPhone,
      customerName,
      customerId,
      customerNote,
      brokerId,
      brokerName,
      brokerPhone,
      brokerEmail
    } = body;

    // 1. Kiểm tra các trường bắt buộc
    if (!propertyId || !propertyTitle) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bất động sản cần đặt lịch hẹn.' },
        { status: 400 }
      );
    }

    if (!appointmentDate || !appointmentDate.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng chọn thời gian hẹn xem nhà phù hợp.' },
        { status: 400 }
      );
    }

    // 2. Thẩm định chặt chẽ số điện thoại di động Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
    const phoneValidation = validatePhoneNumber(customerPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, message: phoneValidation.message },
        { status: 400 }
      );
    }

    // 3. Khởi tạo bản ghi lịch hẹn chuẩn hóa
    const appointmentId = `APPT-${Date.now()}`;
    const newAppointment = {
      id: appointmentId,
      propertyId,
      propertyTitle: propertyTitle.trim(),
      propertyAddress: propertyAddress || '',
      propertyPrice: propertyPrice || 'Thỏa thuận',
      propertyPermalink: propertyPermalink || '',
      propertyCover: propertyCover || '',
      appointmentDate: appointmentDate.trim(),
      customerPhone: phoneValidation.normalized,
      customerName: (customerName || 'Khách hàng quan tâm').trim(),
      customerId: customerId || null,
      customerNote: (customerNote || '').trim(),
      brokerId: brokerId || null,
      brokerName: (brokerName || 'Môi Giới Phụ Trách').trim(),
      brokerPhone: brokerPhone || '',
      brokerEmail: brokerEmail || '',
      status: 'pending', // 'pending' | 'confirmed' | 'completed' | 'cancelled'
      adminNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 4. Lưu bản ghi vào cơ sở dữ liệu
    await saveAppointment(newAppointment);

    // 5. Điều phối thông báo đa kênh tới người đăng (Email, Zalo, SMS, In-App)
    const origin = resolveServerOrigin(request);
    let notificationResults = null;
    try {
      notificationResults = await dispatchAppointmentNotifications({
        appointment: newAppointment,
        origin
      });
    } catch (notifErr) {
      console.warn('Lỗi khi kích hoạt dịch vụ thông báo:', notifErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Đặt lịch hẹn xem nhà thành công!',
      appointment: newAppointment,
      notifications: notificationResults
    }, { status: 201 });

  } catch (err) {
    console.error('Lỗi khi tạo lịch hẹn xem nhà:', err);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ trong quá trình đặt lịch hẹn.' },
      { status: 500 }
    );
  }
}
