import { NextResponse } from 'next/server';
import { getFullSystemDatabase, updateUserById } from '../../../../services/serverDbService';
import { verifyPassword } from '../../../../services/authService';
import { generateAdminToken, verifyAdminRequest } from '../../../../utils/adminAuth';
import {
  generateBase32Secret,
  formatSecret,
  getOtpAuthUrl,
  getQrCodeUrl,
  verifyTOTP
} from '../../../../utils/totp';

/**
 * GET /api/auth/2fa
 * Lấy thông tin thiết lập 2FA (BẢO VỆ CHẶT CHẼ: Không lộ Secret nếu 2FA đã được kích hoạt)
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

    const email = user.email || 'tranvu.review@gmail.com';
    const isAlreadyEnabled = Boolean(user.twoFactorEnabled);

    // NGUYÊN TẮC BẢO MẬT: Nếu 2FA ĐANG BẬT, TUYỆT ĐỐI KHÔNG trả về Secret/QR cho yêu cầu GET thông thường
    // Trình duyệt chỉ cần biết 2FA đang bật để hiện ô nhập mã 6 số
    if (isAlreadyEnabled) {
      return NextResponse.json({
        success: true,
        userId: user.id,
        email,
        twoFactorEnabled: true
      });
    }

    // Trường hợp 2FA chưa bật (cần cài đặt lần đầu):
    // Chỉ cấp Secret & QR Code nếu request có token xác thực Admin hợp lệ
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({
        success: false,
        message: 'Bạn cần đăng nhập với quyền Quản trị viên để lấy mã QR thiết lập 2FA!'
      }, { status: 401 });
    }

    let secret = user.twoFactorSecret;
    if (!secret || secret.length !== 32) {
      secret = generateBase32Secret(32);
      await updateUserById(user.id, { twoFactorSecret: secret });
    }

    const otpAuthUrl = getOtpAuthUrl(secret, email, 'DatBienDaNang-Admin');
    const qrCodeUrl = await getQrCodeUrl(otpAuthUrl, 240);

    return NextResponse.json({
      success: true,
      userId: user.id,
      email,
      twoFactorEnabled: false,
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
    const { action = 'validate', userId = 'admin-01', token, secret, password } = body || {};

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

      const adminToken = generateAdminToken(updatedUser);
      const res = NextResponse.json({
        success: true,
        message: 'Kích hoạt xác thực 2FA Google Authenticator thành công!',
        user: updatedUser,
        adminToken
      });

      if (adminToken) {
        res.cookies.set('bds_admin_token', adminToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/'
        });
      }

      return res;
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

      // Cấp mới Admin Token có chữ ký bảo mật sau khi vượt qua lớp 2FA
      const adminToken = generateAdminToken(user);
      const res = NextResponse.json({
        success: true,
        message: 'Xác thực 2FA thành công! Đang chuyển hướng vào Bàn làm việc CMS...',
        verifiedAt: new Date().toISOString(),
        adminToken
      });

      if (adminToken) {
        res.cookies.set('bds_admin_token', adminToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/'
        });
      }

      return res;
    }

    // C. RESET / TẠO LẠI MÃ QR 2FA (BẮT BUỘC XÁC THỰC QUYỀN ADMIN)
    if (action === 'reset') {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({
          success: false,
          message: 'Chỉ Quản trị viên đã đăng nhập mới có quyền đặt lại mã 2FA!'
        }, { status: 401 });
      }

      const newSecret = generateBase32Secret(32);
      await updateUserById(user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: newSecret,
        twoFactorVerifiedAt: null
      });

      const email = user.email || 'tranvu.review@gmail.com';
      const otpAuthUrl = getOtpAuthUrl(newSecret, email, 'DatBienDaNang-Admin');
      const qrCodeUrl = await getQrCodeUrl(otpAuthUrl, 240);

      return NextResponse.json({
        success: true,
        message: 'Đã tạo mới mã bí mật 2FA. Vui lòng quét lại mã QR trên Google Authenticator!',
        secret: newSecret,
        formattedSecret: formatSecret(newSecret),
        otpAuthUrl,
        qrCodeUrl
      });
    }

    // D. TẮT TÍNH NĂNG 2FA (BẮT BUỘC XÁC THỰC QUYỀN ADMIN VÀ MẬT KHẨU HOẶC MÃ OTP)
    if (action === 'disable') {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({
          success: false,
          message: 'Bạn không có quyền tắt 2FA (Yêu cầu phiên làm việc Quản trị viên).'
        }, { status: 401 });
      }

      // Xác minh mật khẩu hoặc mã OTP hiện tại trước khi cho phép tắt
      const isOtpValid = token && user.twoFactorSecret && verifyTOTP(token, user.twoFactorSecret, 1);
      const isPassValid = password && user.passwordHash && verifyPassword(password, user.passwordHash);

      if (!isOtpValid && !isPassValid) {
        return NextResponse.json({
          success: false,
          message: 'Vui lòng cung cấp mã OTP 6 số hiện tại hoặc mật khẩu Admin để xác nhận tắt 2FA!'
        }, { status: 403 });
      }

      const updatedUser = await updateUserById(user.id, {
        twoFactorEnabled: false
      });

      return NextResponse.json({
        success: true,
        message: 'Đã tắt tính năng xác thực 2 bước (2FA) thành công!',
        twoFactorEnabled: false,
        user: updatedUser
      });
    }

    // E. BẬT LẠI TÍNH NĂNG 2FA
    if (action === 'enable') {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({
          success: false,
          message: 'Bạn không có quyền kích hoạt 2FA (Yêu cầu phiên làm việc Quản trị viên).'
        }, { status: 401 });
      }

      const updatedUser = await updateUserById(user.id, {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Đã kích hoạt lại tính năng xác thực 2 bước (2FA)!',
        twoFactorEnabled: true,
        user: updatedUser
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
