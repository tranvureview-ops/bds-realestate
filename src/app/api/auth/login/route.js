import { NextResponse } from 'next/server';
import { verifyPassword } from '../../../../services/authService';
import { getFullSystemDatabase } from '../../../../services/serverDbService';

/**
 * Trích xuất chỉ các chữ số trong số điện thoại để so sánh chính xác
 * @param {string} phone Chuỗi số điện thoại
 * @returns {string} Chuỗi các chữ số
 */
/**
 * Chuẩn hóa số điện thoại Việt Nam (loại bỏ ký tự lạ, chuyển đầu số +84/84 về 0)
 * @param {string} phone Chuỗi số điện thoại
 * @returns {string} Chuỗi các chữ số chuẩn hóa
 */
function normalizePhone(phone) {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}

/**
 * Endpoint POST /api/auth/login xác thực đăng nhập người dùng nghiêm ngặt
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body || {};

    if (!identifier || !identifier.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập Email hoặc Số điện thoại.'
      }, { status: 400 });
    }

    if (!password || !password.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng nhập mật khẩu.'
      }, { status: 400 });
    }

    const db = await getFullSystemDatabase();
    const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];

    const cleanIdent = identifier.trim().toLowerCase();
    const inputDigits = normalizePhone(identifier);

    const found = users.find((u) => {
      const emailMatch = u.email && u.email.trim().toLowerCase() === cleanIdent;
      const uPhoneDigits = normalizePhone(u.phone);
      const phoneMatch = inputDigits.length >= 9 && uPhoneDigits.length >= 9 && uPhoneDigits === inputDigits;
      return emailMatch || phoneMatch;
    });

    if (!found) {
      return NextResponse.json({
        success: false,
        message: 'Tài khoản hoặc số điện thoại không tồn tại trong hệ thống!'
      }, { status: 404 });
    }

    if (found.status === 'trash' || found.isDeleted) {
      return NextResponse.json({
        success: false,
        message: 'Tài khoản này đã bị chuyển vào thùng rác hoặc vô hiệu hóa. Vui lòng liên hệ Quản trị viên!'
      }, { status: 403 });
    }

    if (found.status === 'locked' || found.status === 'banned') {
      return NextResponse.json({
        success: false,
        message: 'Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên!'
      }, { status: 403 });
    }

    if (found.status === 'pending') {
      return NextResponse.json({
        success: false,
        message: 'Tài khoản chưa được kích hoạt qua email! Vui lòng kiểm tra hộp thư để kích hoạt.'
      }, { status: 403 });
    }

    // Kiểm tra mật khẩu (so khớp bcrypt hash, mật khẩu thường, hoặc mật khẩu mặc định của tài khoản demo)
    let isPasswordValid = false;
    if (found.passwordHash) {
      isPasswordValid = verifyPassword(password, found.passwordHash);
    } else if (found.password) {
      isPasswordValid = (found.password === password);
    } else {
      isPasswordValid = (password === '123456') || (found.role === 'admin' && password === 'admin123');
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.'
      }, { status: 401 });
    }

    // Đăng nhập thành công - Loại bỏ triệt để các trường nhạy cảm trước khi trả về client
    const { password: _p, passwordHash: _ph, twoFactorSecret: _tfs, ...safeUser } = found;
    return NextResponse.json({
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${found.name}`,
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi xử lý đăng nhập từ máy chủ.'
    }, { status: 500 });
  }
}
