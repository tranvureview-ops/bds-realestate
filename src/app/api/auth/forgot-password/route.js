import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAllUsers, savePasswordResetToken } from '../../../../services/serverDbService';
import { normalizePhone } from '../../../../utils/authValidation';
import { resolveServerOrigin, sendPasswordResetEmail } from '../../../../services/mailerService';

const RESET_TOKEN_EXPIRY_MINUTES = 30;

/**
 * Tìm người dùng theo Email hoặc Số điện thoại
 * @param {string} identifier Email hoặc Số điện thoại
 * @param {Array} users Danh sách người dùng
 * @returns {Object|null} Người dùng tìm thấy hoặc null
 */
function findUserByIdentifier(identifier, users = []) {
  if (!identifier || typeof identifier !== 'string') return null;
  const clean = identifier.trim().toLowerCase();
  const normalizedInputPhone = normalizePhone(identifier);

  return users.find((user) => {
    const userEmail = (user.email || '').trim().toLowerCase();
    const userPhone = normalizePhone(user.phone || '');
    return userEmail === clean || (normalizedInputPhone && userPhone === normalizedInputPhone);
  }) || null;
}

/**
 * Endpoint POST /api/auth/forgot-password
 * Tiếp nhận yêu cầu đặt lại mật khẩu từ người dùng (qua Email hoặc Số điện thoại)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier } = body || {};

    if (!identifier || !identifier.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng cung cấp Email hoặc Số điện thoại đã đăng ký.'
      }, { status: 400 });
    }

    const users = await getAllUsers();
    const user = findUserByIdentifier(identifier, users);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy tài khoản tương ứng với thông tin bạn cung cấp. Vui lòng kiểm tra lại.'
      }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json({
        success: false,
        message: 'Tài khoản này chưa được liên kết địa chỉ email. Vui lòng liên hệ CSKH để được trợ giúp.'
      }, { status: 400 });
    }

    // Sinh mã token đặt lại mật khẩu an toàn
    const tokenString = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const tokenRecord = {
      token: tokenString,
      userId: user.id,
      email: user.email,
      phone: user.phone || '',
      expiryMinutes: RESET_TOKEN_EXPIRY_MINUTES,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    };

    await savePasswordResetToken(tokenRecord);

    const origin = resolveServerOrigin(request);
    const mailResult = await sendPasswordResetEmail({
      toUser: user,
      tokenRecord,
      origin
    });

    const maskedEmail = user.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`);

    return NextResponse.json({
      success: true,
      message: `Hệ thống đã gửi hướng dẫn đặt lại mật khẩu đến email ${maskedEmail}. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam/Rác).`,
      email: user.email,
      resetUrl: mailResult.resetUrl || null,
      emailSent: mailResult.emailSent
    });
  } catch (error) {
    console.error('Lỗi xử lý yêu cầu quên mật khẩu:', error);
    return NextResponse.json({
      success: false,
      message: 'Có lỗi xảy ra trên hệ thống khi xử lý yêu cầu. Vui lòng thử lại sau.'
    }, { status: 500 });
  }
}
