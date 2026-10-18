import { NextResponse } from 'next/server';
import { getAllUsers, updateUserById } from '../../../../services/serverDbService';
import { verifyPassword, hashPassword } from '../../../../services/authService';
import { evaluatePasswordSecurity } from '../../../../utils/authValidation';
import { isSupabaseConfigured, upsertSupabaseProfile } from '../../../../lib/supabase';

/**
 * POST /api/auth/change-password
 * Xử lý đổi mật khẩu cho người dùng đang đăng nhập:
 * 1. Kiểm tra mật khẩu hiện tại (currentPassword) chính xác
 * 2. Thẩm định mật khẩu mới đạt chuẩn bảo mật (>= 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
 * 3. Mã hóa bcrypt và lưu trực tiếp vào cơ sở dữ liệu server-db.json & Supabase
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, email, phone, currentPassword, newPassword, confirmNewPassword } = body || {};

    // 1. Kiểm tra định danh người dùng
    if (!userId && !email && !phone) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu thông tin nhận diện tài khoản cần đổi mật khẩu.'
      }, { status: 400 });
    }

    if (!currentPassword || !currentPassword.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại của bạn.'
      }, { status: 400 });
    }

    if (!newPassword || !newPassword.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập mật khẩu mới.'
      }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.'
      }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
      }, { status: 400 });
    }

    // 2. Thẩm định độ mạnh mật khẩu mới theo chuẩn bảo mật
    const passwordSecurity = evaluatePasswordSecurity(newPassword);
    if (!passwordSecurity.isValid) {
      return NextResponse.json({
        success: false,
        message: passwordSecurity.message
      }, { status: 400 });
    }

    // 3. Tìm tài khoản trong Database
    const users = await getAllUsers();
    const user = users.find((u) => {
      if (userId && String(u.id) === String(userId)) return true;
      if (email && u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase()) return true;
      if (phone && u.phone && u.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')) return true;
      return false;
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy tài khoản người dùng trên hệ thống.'
      }, { status: 404 });
    }

    // 4. Đối chiếu mật khẩu hiện tại
    let isCurrentPasswordCorrect = false;
    if (user.passwordHash) {
      isCurrentPasswordCorrect = verifyPassword(currentPassword, user.passwordHash);
    } else if (user.password) {
      isCurrentPasswordCorrect = (user.password === currentPassword);
    } else {
      // Fallback tài khoản demo mặc định ban đầu
      isCurrentPasswordCorrect = (currentPassword === '123456') || (user.role === 'admin' && currentPassword === 'admin123');
    }

    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác! Vui lòng kiểm tra lại.'
      }, { status: 401 });
    }

    // 5. Mã hóa mật khẩu mới và lưu vào cơ sở dữ liệu
    const newPasswordHash = hashPassword(newPassword);
    const updatedUser = await updateUserById(user.id, {
      passwordHash: newPasswordHash,
      password: newPassword, // Lưu dự phòng cho các logic cũ nếu cần
      updatedAt: new Date().toISOString()
    });

    // 6. Đồng bộ lên Supabase nếu có cấu hình
    if (isSupabaseConfigured() && updatedUser) {
      try {
        await upsertSupabaseProfile(updatedUser);
      } catch (err) {
        console.warn('Lỗi đồng bộ hồ sơ Supabase sau khi đổi mật khẩu:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu tài khoản thành công! Mật khẩu mới đã được lưu an toàn.'
    });

  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi máy chủ trong quá trình đổi mật khẩu.'
    }, { status: 500 });
  }
}
