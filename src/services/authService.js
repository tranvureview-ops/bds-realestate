import bcrypt from 'bcryptjs';
import {
  normalizePhone,
  validatePhoneNumber,
  validateEmailAddress,
  evaluatePasswordSecurity,
  validateFullRegistration
} from '../utils/authValidation';

const SALT_ROUNDS = 10;

/**
 * Mã hóa mật khẩu an toàn với thuật toán bcrypt
 * @param {string} plainPassword Mật khẩu thô do người dùng nhập
 * @returns {string} Mật khẩu đã được mã hóa an toàn (hash)
 */
export function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

/**
 * Đối chiếu mật khẩu người dùng với mật khẩu đã mã hóa trong database
 * @param {string} plainPassword Mật khẩu thô
 * @param {string} passwordHash Mật khẩu đã băm trong database
 * @returns {boolean} True nếu khớp, False nếu sai
 */
export function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  try {
    return bcrypt.compareSync(plainPassword, passwordHash);
  } catch (error) {
    return false;
  }
}

/**
 * Kiểm tra tính hợp lệ của thông tin form đăng ký thành viên
 * Yêu cầu:
 * - Họ tên >= 3 ký tự
 * - SDT: 10 chữ số chuẩn di động Việt Nam (03, 05, 07, 08, 09)
 * - Email: Chuẩn RFC, không khoảng trắng
 * - Mật khẩu: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
 * @param {Object} registrationData Dữ liệu form đăng ký
 * @returns {string|null} Chuỗi thông báo lỗi nếu không hợp lệ, null nếu hợp lệ
 */
export function validateRegistrationInput(registrationData) {
  const result = validateFullRegistration(registrationData);
  if (!result.isValid) {
    return result.message;
  }
  return null;
}

/**
 * Kiểm tra trùng lặp Email và Số điện thoại trong cơ sở dữ liệu
 * @param {string} email Email đăng ký
 * @param {string} phone Số điện thoại đăng ký
 * @param {Array} existingUsers Danh sách người dùng hiện có
 * @returns {string|null} Thông báo lỗi nếu bị trùng, null nếu không trùng
 */
export function isEmailTaken(email, users = []) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  return users.some((user) => (user.email || '').trim().toLowerCase() === normalizedEmail);
}

export function isPhoneTaken(phone, users = []) {
  const normalizedPhone = normalizePhone(phone);
  return users.some((user) => normalizePhone(user.phone) === normalizedPhone);
}

export function checkUserDuplication(email, phone, existingUsers = []) {
  if (!Array.isArray(existingUsers)) return null;
  if (isEmailTaken(email, existingUsers)) {
    return 'Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
  }
  if (isPhoneTaken(phone, existingUsers)) {
    return 'Số điện thoại này đã được đăng ký trên sàn.';
  }
  return null;
}
