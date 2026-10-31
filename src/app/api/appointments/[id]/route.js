import { NextResponse } from 'next/server';
import { updateAppointmentById, deleteAppointmentById } from '../../../../services/serverDbService';
import { verifyAdminRequest } from '../../../../utils/adminAuth';

/**
 * PATCH /api/appointments/[id]
 * Cập nhật trạng thái (status: pending, confirmed, completed, cancelled) hoặc ghi chú lịch hẹn
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu mã lịch hẹn cần cập nhật.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const allowedFields = ['status', 'adminNote', 'customerNote', 'appointmentDate'];
    const updates = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await updateAppointmentById(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy lịch hẹn để cập nhật.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật lịch hẹn thành công!',
      appointment: updated
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật lịch hẹn:', err);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi cập nhật lịch hẹn.' }, { status: 500 });
  }
}

/**
 * DELETE /api/appointments/[id]
 * Xóa một lịch hẹn khỏi hệ thống
 */
export async function DELETE(request, { params }) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized: Chỉ Quản trị viên mới có quyền xóa lịch hẹn!' 
      }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu mã lịch hẹn cần xóa.' }, { status: 400 });
    }

    await deleteAppointmentById(id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa lịch hẹn thành công!'
    });
  } catch (err) {
    console.error('Lỗi khi xóa lịch hẹn:', err);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi xóa lịch hẹn.' }, { status: 500 });
  }
}
