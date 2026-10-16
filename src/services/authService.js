import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 3;
const MIN_PHONE_LENGTH = 9;

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
 * @param {Object} registrationData Dữ liệu form đăng ký
 * @returns {string|null} Chuỗi thông báo lỗi nếu không hợp lệ, null nếu hợp lệ
 */
export function validateRegistrationInput(registrationData) {
  const { name, phone, email, password } = registrationData || {};

  if (!name || name.trim().length < MIN_NAME_LENGTH) {
    return 'Họ và tên hiển thị cần có ít nhất 3 ký tự.';
  }
  if (!phone || phone.replace(/\D/g, '').length < MIN_PHONE_LENGTH) {
    return 'Vui lòng cung cấp số điện thoại hợp lệ (tối thiểu 9 số).';
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email.trim())) {
    return 'Địa chỉ email không đúng định dạng chuẩn.';
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return 'Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.';
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
  const normalizedPhone = (phone || '').replace(/\D/g, '');
  return users.some((user) => (user.phone || '').replace(/\D/g, '') === normalizedPhone);
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
