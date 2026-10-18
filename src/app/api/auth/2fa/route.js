import { NextResponse } from 'next/server';
import { getFullSystemDatabase, updateUserById } from '../../../../services/serverDbService';
import {
  generateBase32Secret,
  formatSecret,
  getOtpAuthUrl,
  getQrCodeUrl,
  verifyTOTP
} from '../../../../utils/totp';

/**
 * GET /api/auth/2fa
 * Lấy thông tin thiết lập 2FA (Secret, Mã QR, trạng thái kích hoạt)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'admin-01';

    const db = await getFullSystemDatabase();
    const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
    const user = users.find((u) => u.id === userId || u.role === 'admin');

    if (!user) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng!' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Tính năng 2FA chỉ áp dụng cho Quản Trị Viên (Admin)!' }, { status: 403 });
    }

    // Nếu đã có secret thì dùng lại, nếu chưa có thì sinh mới
    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = generateBase32Secret(20);
      // Lưu tạm secret vào database để chuẩn bị xác minh kích hoạt
      await updateUserById(user.id, { twoFactorSecret: secret });
    }

    const email = user.email || 'tranvu.review@gmail.com';
    const otpAuthUrl = getOtpAuthUrl(secret, email, 'DatBienDaNang-Admin');
    const qrCodeUrl = getQrCodeUrl(otpAuthUrl, 240);

    return NextResponse.json({
      success: true,
      userId: user.id,
      email,
      twoFactorEnabled: !!user.twoFactorEnabled,
      secret,
      formattedSecret: formatSecret(secret),
      otpAuthUrl,
      qrCodeUrl
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin 2FA.'
    }, { status: 500 });
  }
}

/**
 * POST /api/auth/2fa
 * Xử lý: Kích hoạt (verify-setup), Xác thực khi đăng nhập (validate), và Đặt lại (reset)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action = 'validate', userId = 'admin-01', token, secret } = body || {};

    const db = await getFullSystemDatabase();
    const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
    const user = users.find((u) => u.id === userId || u.role === 'admin');

    if (!user) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản quản trị!' }, { status: 404 });
    }

    // A. KÍCH HOẠT 2FA LẦN ĐẦU (Xác nhận mã 6 số từ Google Authenticator)
    if (action === 'verify-setup') {
      const secretToVerify = secret || user.twoFactorSecret;
      if (!secretToVerify) {
        return NextResponse.json({ success: false, message: 'Chưa có Secret Key để kích hoạt 2FA.' }, { status: 400 });
      }

      const isValid = verifyTOTP(token, secretToVerify, 1);
      if (!isValid) {
        return NextResponse.json({
          success: false,
          message: 'Mã xác thực 6 chữ số không chính xác hoặc đã hết hạn! Vui lòng kiểm tra lại đồng hồ trên điện thoại.'
        }, { status: 400 });
      }

      // Lưu trạng thái đã kích hoạt 2FA vào database
      const updatedUser = await updateUserById(user.id, {
        twoFactorEnabled: true,
        twoFactorSecret: secretToVerify,
        twoFactorVerifiedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Kích hoạt xác thực 2FA Google Authenticator thành công!',
        user: updatedUser
      });
    }

    // B. XÁC THỰC 2FA KHI ĐĂNG NHẬP HOẶC VÀO TRANG ADMIN
    if (action === 'validate') {
      const secretToVerify = user.twoFactorSecret;
      if (!secretToVerify) {
        return NextResponse.json({
          success: false,
          needsSetup: true,
          message: 'Tài khoản chưa thiết lập 2FA. Vui lòng kích hoạt 2FA trước.'
        }, { status: 400 });
      }

      const isValid = verifyTOTP(token, secretToVerify, 1);
      if (!isValid) {
        return NextResponse.json({
          success: false,
          message: 'Mã xác thực 6 chữ số không chính xác hoặc đã hết hạn (30 giây)! Vui lòng thử lại.'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Xác thực 2FA thành công! Đang chuyển hướng vào Bàn làm việc CMS...',
        verifiedAt: new Date().toISOString()
      });
    }

    // C. RESET / TẠO LẠI MÃ QR 2FA
    if (action === 'reset') {
      const newSecret = generateBase32Secret(20);
      await updateUserById(user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: newSecret,
        twoFactorVerifiedAt: null
      });

      const email = user.email || 'tranvu.review@gmail.com';
      const otpAuthUrl = getOtpAuthUrl(newSecret, email, 'DatBienDaNang-Admin');
      const qrCodeUrl = getQrCodeUrl(otpAuthUrl, 240);

      return NextResponse.json({
        success: true,
        message: 'Đã tạo mới mã bí mật 2FA. Vui lòng quét lại mã QR trên Google Authenticator!',
        secret: newSecret,
        formattedSecret: formatSecret(newSecret),
        otpAuthUrl,
        qrCodeUrl
      });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ!' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi xử lý xác thực 2FA từ máy chủ.'
    }, { status: 500 });
  }
}
