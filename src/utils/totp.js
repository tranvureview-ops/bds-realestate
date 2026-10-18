import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Chuyển chuỗi Base32 thành Buffer
 */
export function base32ToBuffer(base32) {
  const cleaned = (base32 || '').toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Sinh chuỗi Secret Base32 ngẫu nhiên cho Google Authenticator (chuẩn 32 ký tự = 160 bits = 20 bytes chẵn)
 */
export function generateBase32Secret(length = 32) {
  let secret = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[randomBytes[i] % BASE32_ALPHABET.length];
  }
  return secret;
}

/**
 * Định dạng chuỗi Secret thành từng nhóm 4 ký tự dễ đọc (VD: ABCD EFGH ...)
 */
export function formatSecret(secret) {
  if (!secret) return '';
  return secret.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Sinh chuỗi URI otpauth:// chuẩn quốc tế cho Google Authenticator
 */
export function getOtpAuthUrl(secret, accountName = 'tranvu.review@gmail.com', issuer = 'DatBienDaNang') {
  const cleanSecret = (secret || '').replace(/\s+/g, '').toUpperCase();
  const cleanIssuer = (issuer || 'DatBienDaNang').trim();
  const cleanAccount = (accountName || 'tranvu.review@gmail.com').trim();
  // Định dạng chuẩn Google Authenticator: Issuer:account (không mã hóa ký tự @ trong label)
  const label = `${encodeURIComponent(cleanIssuer)}:${cleanAccount}`;
  return `otpauth://totp/${label}?secret=${cleanSecret}&issuer=${encodeURIComponent(cleanIssuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Sinh URL hình ảnh mã QR Code sắc nét (Data URI base64) tương thích 100% với Google Authenticator
 */
export async function getQrCodeUrl(otpAuthUrl, size = 240) {
  try {
    return await QRCode.toDataURL(otpAuthUrl, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    // Fallback dịch vụ dự phòng nếu lỗi
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(otpAuthUrl)}`;
  }
}

/**
 * Tính mã HOTP theo bộ đếm thời gian
 */
function generateHOTP(secretBuffer, counter) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(buffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Sinh mã TOTP 6 số tại thời điểm hiện tại
 */
export function generateTOTP(secretBase32, timeStepSeconds = 30) {
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds);
  const secretBuffer = base32ToBuffer(secretBase32);
  return generateHOTP(secretBuffer, counter);
}

/**
 * Xác thực mã 6 số nhập từ Google Authenticator
 * @param {string} token Mã 6 chữ số người dùng nhập
 * @param {string} secretBase32 Khóa bí mật
 * @param {number} window Dung sai bù trừ lệch đồng hồ (mặc định 1: kiểm tra ±30s)
 */
export function verifyTOTP(token, secretBase32, window = 1, timeStepSeconds = 30) {
  if (!token || !secretBase32) return false;
  const cleanToken = token.toString().trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / timeStepSeconds);
  const secretBuffer = base32ToBuffer(secretBase32);

  for (let i = -window; i <= window; i++) {
    const expected = generateHOTP(secretBuffer, currentCounter + i);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}
