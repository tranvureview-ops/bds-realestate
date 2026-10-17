import { NextResponse } from 'next/server';
import {
  findPasswordResetToken,
  markPasswordResetTokenAsUsed,
  getAllUsers,
  updateUserById
} from '../../../../services/serverDbService';
import { hashPassword } from '../../../../services/authService';
import { evaluatePasswordSecurity } from '../../../../utils/authValidation';

/**
 * Thẩm định tính hợp lệ của token đặt lại mật khẩu
 * @param {string} token Chuỗi token cần kiểm tra
 * @returns {Promise<{ isValid: boolean, message: string, tokenRecord: Object|null, user: Object|null }>}
 */
async function inspectResetToken(token) {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { isValid: false, message: 'Mã token đặt lại mật khẩu không hợp lệ hoặc bị thiếu.', tokenRecord: null, user: null };
  }

  const tokenRecord = await findPasswordResetToken(token.trim());
  if (!tokenRecord) {
    return { isValid: false, message: 'Mã xác thực đặt lại mật khẩu không tồn tại trong hệ thống.', tokenRecord: null, user: null };
  }

  if (tokenRecord.used) {
    return { isValid: false, message: 'Liên kết đặt lại mật khẩu này đã được sử dụng trước đó.', tokenRecord, user: null };
  }

  const expiresTime = new Date(tokenRecord.expiresAt).getTime();
  if (Date.now() > expiresTime) {
    return { isValid: false, message: 'Liên kết đặt lại mật khẩu đã hết hạn hiệu lực (30 phút). Vui lòng yêu cầu cấp lại mã mới.', tokenRecord, user: null };
  }

  const users = await getAllUsers();
  const user = users.find((u) => u.id === tokenRecord.userId || u.email === tokenRecord.email);
  if (!user) {
    return { isValid: false, message: 'Tài khoản người dùng liên quan không còn tồn tại trên hệ thống.', tokenRecord, user: null };
  }

  return { isValid: true, message: null, tokenRecord, user };
}

/**
 * GET /api/auth/reset-password?token=XYZ
 * Kiểm tra trước tính hợp lệ của token khi người dùng bấm vào liên kết trong email
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const check = await inspectResetToken(token);
    if (!check.isValid) {
      return NextResponse.json({
        valid: false,
        message: check.message
      }, { status: 400 });
    }

    const maskedEmail = check.user.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`);

    return NextResponse.json({
      valid: true,
      userName: check.user.name,
      email: maskedEmail
    });
  } catch (error) {
    console.error('Lỗi kiểm tra token đặt lại mật khẩu:', error);
    return NextResponse.json({
      valid: false,
      message: 'Có lỗi xảy ra khi kiểm tra mã xác thực. Vui lòng thử lại.'
    }, { status: 500 });
  }
}

/**
 * POST /api/auth/reset-password
 * Cập nhật mật khẩu mới cho người dùng
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body || {};

    // 1. Kiểm tra token
    const check = await inspectResetToken(token);
    if (!check.isValid) {
      return NextResponse.json({
        success: false,
        message: check.message
      }, { status: 400 });
    }

    // 2. Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp. Vui lòng nhập lại chính xác.'
      }, { status: 400 });
    }

    // 3. Thẩm định độ mạnh mật khẩu theo tiêu chuẩn bảo mật
    const passwordValidation = evaluatePasswordSecurity(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: passwordValidation.message
      }, { status: 400 });
    }

    // 4. Mã hóa mật khẩu và cập nhật vào cơ sở dữ liệu
    const passwordHash = hashPassword(newPassword);
    await updateUserById(check.user.id, {
      password: newPassword,
      passwordHash: passwordHash,
      passwordUpdatedAt: new Date().toISOString()
    });

    // 5. Đánh dấu token đã được sử dụng
    await markPasswordResetTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.'
    });
  } catch (error) {
    console.error('Lỗi cập nhật mật khẩu mới:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra trong quá trình đổi mật khẩu. Vui lòng thử lại.'
    }, { status: 500 });
  }
}
