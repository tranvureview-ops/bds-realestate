/**
 * authValidation.js
 * Bộ tiện ích thẩm định dữ liệu người dùng (SDT, Email, Mật khẩu bảo mật cao)
 * Chuẩn hóa và áp dụng đồng nhất cho cả Frontend và Backend API
 */

/**
 * Chuẩn hóa số điện thoại Việt Nam
 * Loại bỏ khoảng trắng, dấu chấm, dấu gạch nối, dấu ngoặc
 * Chuyển đổi +84 / 84 sang 0
 * @param {string} rawPhone Số điện thoại thô
 * @returns {string} Số điện thoại đã chuẩn hóa (chỉ gồm các chữ số)
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = rawPhone.toString().trim().replace(/[\s.()-]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length >= 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Định dạng số điện thoại hiển thị chuẩn phong cách Việt Nam
 * Tự động phân tách nhóm số thẩm mỹ, rõ ràng (4 - 3 - 3):
 * Ví dụ: "0898256607" -> "0898 256 607"
 * Ví dụ: "0904084888" -> "0904 084 888"
 * Ví dụ: "0912888999" -> "0912 888 999"
 * Hỗ trợ cả 10 số (0xxx xxx xxx) và 11 số (0xxx xxx xxxx)
 * @param {string|number} rawPhone Số điện thoại thô
 * @returns {string} Số điện thoại đã định dạng có khoảng trắng đẹp mắt
 */
export function formatPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = rawPhone.toString().trim().replace(/[\s.()-]/g, '');
  let norm = cleaned;
  if (norm.startsWith('+84')) norm = '0' + norm.slice(3);
  else if (norm.startsWith('84') && norm.length >= 11) norm = '0' + norm.slice(2);

  // 10 chữ số (chuẩn di động VN): 4 - 3 - 3 (ví dụ: 0898 256 607 hoặc 0912 888 999)
  if (/^0\d{9}$/.test(norm)) {
    return norm.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  // 11 chữ số (bàn/cũ): 4 - 3 - 4 (ví dụ: 0236 123 4567)
  if (/^0\d{10}$/.test(norm)) {
    return norm.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  return rawPhone.toString().trim();
}

/**
 * Kiểm tra tính hợp lệ của số điện thoại di động Việt Nam
 * Quy chuẩn: 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09
 * @param {string} rawPhone Số điện thoại
 * @returns {{ isValid: boolean, normalized: string, message: string|null }}
 */
export function validatePhoneNumber(rawPhone) {
  if (!rawPhone || !rawPhone.toString().trim()) {
    return {
      isValid: false,
      normalized: '',
      message: 'Vui lòng cung cấp số điện thoại liên hệ.'
    };
  }

  const normalized = normalizePhone(rawPhone);
  const generalVnMobilePattern = /^0[35789]\d{8}$/;

  if (!generalVnMobilePattern.test(normalized)) {
    return {
      isValid: false,
      normalized,
      message: 'Số điện thoại không hợp lệ. Vui lòng nhập số di động 10 số của Việt Nam (bắt đầu bằng 03, 05, 07, 08 hoặc 09).'
    };
  }

  return {
    isValid: true,
    normalized,
    message: null
  };
}

/**
 * Kiểm tra tính hợp lệ của địa chỉ Email
 * Quy chuẩn RFC, không chứa khoảng trắng, có domain và TLD hợp lệ (tối thiểu 2 ký tự)
 * @param {string} rawEmail Địa chỉ email
 * @returns {{ isValid: boolean, email: string, message: string|null }}
 */
export function validateEmailAddress(rawEmail) {
  if (!rawEmail || !rawEmail.toString().trim()) {
    return {
      isValid: false,
      email: '',
      message: 'Vui lòng cung cấp địa chỉ email.'
    };
  }

  const cleaned = rawEmail.toString().trim().toLowerCase();

  if (cleaned.includes(' ')) {
    return {
      isValid: false,
      email: cleaned,
      message: 'Địa chỉ email không được chứa khoảng trắng.'
    };
  }

  // Regex chuẩn kiểm tra format email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return {
      isValid: false,
      email: cleaned,
      message: 'Địa chỉ email không đúng định dạng chuẩn (ví dụ: contact@batdongsan.vn).'
    };
  }

  return {
    isValid: true,
    email: cleaned,
    message: null
  };
}

/**
 * Đánh giá chi tiết tiêu chuẩn bảo mật của Mật khẩu
 * Tiêu chuẩn bảo mật hiện đại:
 * 1. Tối thiểu 8 ký tự
 * 2. Có ít nhất 1 ký tự chữ in hoa (A-Z)
 * 3. Có ít nhất 1 ký tự chữ in thường (a-z)
 * 4. Có ít nhất 1 chữ số (0-9)
 * 5. Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
 * 
 * @param {string} password Mật khẩu nhập vào
 * @returns {{
 *   isValid: boolean,
 *   score: number,
 *   strengthLabel: string,
 *   strengthColor: string,
 *   rules: {
 *     minLength: boolean,
 *     hasUpper: boolean,
 *     hasLower: boolean,
 *     hasNumber: boolean,
 *     hasSpecial: boolean
 *   },
 *   missingRules: string[],
 *   message: string|null
 * }}
 */
export function evaluatePasswordSecurity(password = '') {
  const pwd = password || '';
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  // Ký tự đặc biệt: bất kỳ ký tự nào không phải chữ cái và không phải chữ số
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const missingRules = [];
  if (!minLength) missingRules.push('tối thiểu 8 ký tự');
  if (!hasUpper) missingRules.push('ít nhất 1 chữ in hoa (A-Z)');
  if (!hasLower) missingRules.push('ít nhất 1 chữ in thường (a-z)');
  if (!hasNumber) missingRules.push('ít nhất 1 chữ số (0-9)');
  if (!hasSpecial) missingRules.push('ít nhất 1 ký tự đặc biệt (@, #, $, %, !...)');

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Tính điểm độ mạnh từ 0 đến 5
  let score = 0;
  if (pwd.length > 0) {
    if (minLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
  }

  let strengthLabel = 'Chưa nhập';
  let strengthColor = 'bg-slate-300';
  let strengthTextColor = 'text-slate-400';

  if (pwd.length > 0) {
    if (score <= 2) {
      strengthLabel = 'Yếu';
      strengthColor = 'bg-rose-500';
      strengthTextColor = 'text-rose-500';
    } else if (score === 3 || score === 4) {
      strengthLabel = 'Trung bình';
      strengthColor = 'bg-amber-500';
      strengthTextColor = 'text-amber-500';
    } else if (score === 5 && isValid) {
      strengthLabel = 'Rất mạnh (An toàn)';
      strengthColor = 'bg-emerald-500';
      strengthTextColor = 'text-emerald-600';
    }
  }

  let message = null;
  if (!isValid && pwd.length > 0) {
    message = `Mật khẩu cần: ${missingRules.join(', ')}.`;
  } else if (!isValid && pwd.length === 0) {
    message = 'Vui lòng nhập mật khẩu tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
  }

  return {
    isValid,
    score,
    strengthLabel,
    strengthColor,
    strengthTextColor,
    rules: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    },
    missingRules,
    message
  };
}

/**
 * Thẩm định toàn diện form đăng ký tài khoản
 * @param {Object} formData Dữ liệu form đăng ký
 * @returns {{ isValid: boolean, field: string|null, message: string|null, normalized: Object|null }}
 */
export function validateFullRegistration(formData) {
  const { name, phone, email, password, confirmPassword, agreeTerms } = formData || {};

  // 1. Kiểm tra Họ và Tên
  if (!name || name.trim().length < 3) {
    return {
      isValid: false,
      field: 'name',
      message: 'Họ và tên hiển thị cần có ít nhất 3 ký tự.'
    };
  }

  // 2. Kiểm tra Số điện thoại
  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.isValid) {
    return {
      isValid: false,
      field: 'phone',
      message: phoneValidation.message
    };
  }

  // 3. Kiểm tra Email
  const emailValidation = validateEmailAddress(email);
  if (!emailValidation.isValid) {
    return {
      isValid: false,
      field: 'email',
      message: emailValidation.message
    };
  }

  // 4. Kiểm tra Mật khẩu bảo mật
  const passwordValidation = evaluatePasswordSecurity(password);
  if (!passwordValidation.isValid) {
    return {
      isValid: false,
      field: 'password',
      message: passwordValidation.message
    };
  }

  // 5. Kiểm tra Xác nhận mật khẩu (nếu có cung cấp trường confirmPassword)
  if (confirmPassword !== undefined && confirmPassword !== null) {
    if (!confirmPassword) {
      return {
        isValid: false,
        field: 'confirmPassword',
        message: 'Vui lòng nhập xác nhận lại mật khẩu.'
      };
    }
    if (confirmPassword !== password) {
      return {
        isValid: false,
        field: 'confirmPassword',
        message: 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.'
      };
    }
  }

  // 6. Kiểm tra Đồng ý điều khoản (nếu có trường agreeTerms)
  if (agreeTerms !== undefined && !agreeTerms) {
    return {
      isValid: false,
      field: 'agreeTerms',
      message: 'Vui lòng tích đồng ý với quy chế hoạt động và chính sách bảo mật.'
    };
  }

  return {
    isValid: true,
    field: null,
    message: null,
    normalized: {
      name: name.trim(),
      phone: phoneValidation.normalized,
      email: emailValidation.email,
      password: password
    }
  };
}
