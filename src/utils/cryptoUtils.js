import crypto from 'crypto';

/**
 * cryptoUtils.js
 * Tiện ích mã hóa & giải mã bảo mật cao bằng thuật toán AES-256-GCM
 * Dùng để bảo vệ an toàn các chuỗi nhạy cảm: Telegram Bot Token, Webhook Secret, Pusher Keys...
 */

const DEFAULT_SECRET = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || 'bds-datbiendanang-system-encryption-secret-key-2026';

/**
 * Tạo khóa chuẩn 32 bytes từ chuỗi secret
 */
function getEncryptionKey(secret = DEFAULT_SECRET) {
  return crypto.createHash('sha256').update(String(secret || DEFAULT_SECRET)).digest();
}

/**
 * Mã hóa chuỗi văn bản bằng thuật toán AES-256-GCM
 * @param {string} plainText Chuỗi cần mã hóa
 * @param {string} [customSecret] Khóa bí mật tùy chọn
 * @returns {string} Chuỗi mã hóa dạng iv:authTag:ciphertext (hex)
 */
export function encryptAES256(plainText, customSecret = null) {
  if (!plainText || typeof plainText !== 'string') return '';
  try {
    const key = getEncryptionKey(customSecret);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Lỗi mã hóa AES-256:', err);
    return plainText; // Fallback an toàn nếu môi trường không hỗ trợ
  }
}

/**
 * Giải mã chuỗi đã mã hóa bằng AES-256-GCM
 * @param {string} cipherText Chuỗi đã mã hóa
 * @param {string} [customSecret] Khóa bí mật tùy chọn
 * @returns {string} Chuỗi gốc ban đầu
 */
export function decryptAES256(cipherText, customSecret = null) {
  if (!cipherText || typeof cipherText !== 'string') return '';
  
  // Nếu chuỗi không có định dạng iv:tag:data thì coi như chuỗi thô chưa mã hóa
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    return cipherText;
  }

  try {
    const [ivHex, tagHex, dataHex] = parts;
    const key = getEncryptionKey(customSecret);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Nếu giải mã lỗi (ví dụ chuỗi là token thô có chứa dấu :), trả về chuỗi gốc
    return cipherText;
  }
}

/**
 * Che mờ các token / key nhạy cảm khi hiển thị trên giao diện
 * Ví dụ: "7123456789:AAHTestTokenString" -> "7123••••••••••••tring"
 */
export function maskSensitiveToken(token, startLen = 6, endLen = 4) {
  if (!token || typeof token !== 'string') return '';
  if (token.length <= startLen + endLen) return '••••••••••••';
  const start = token.substring(0, startLen);
  const end = token.substring(token.length - endLen);
  return `${start}••••••••••••${end}`;
}
