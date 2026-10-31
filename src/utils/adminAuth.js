import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * adminAuth.js
 * Hệ thống xác thực Token mật mã an toàn cấp máy chủ (HMAC-SHA256) dành cho Quản Trị Viên (Admin)
 * Chống giả mạo vai trò (Role Escalation), ngăn chặn truy cập trái phép vào các API Quản trị
 */

const AUTH_SECRET = process.env.ENCRYPTION_SECRET 
  || process.env.NEXTAUTH_SECRET 
  || process.env.SUPABASE_SERVICE_ROLE_KEY 
  || 'bds-datbiendanang-system-encryption-secret-key-2026';

/**
 * Sinh chuỗi Token xác thực có chữ ký số bí mật cho Admin
 * Có hiệu lực trong 24 giờ kể từ thời điểm cấp phát
 */
export function generateAdminToken(user) {
  if (!user || user.role !== 'admin') return null;

  const payload = {
    uid: user.id || 'admin-01',
    role: 'admin',
    email: user.email || 'tranvu.review@gmail.com',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 giờ
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Thẩm định tính hợp lệ của Token Admin
 * @param {string} token Chuỗi token nhận được từ header hoặc cookie
 * @returns {{ valid: boolean, user?: object, reason?: string }}
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Thiếu mã xác thực (Token).' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Định dạng mã xác thực không hợp lệ.' };
  }

  const [encodedPayload, signature] = parts;

  // 1. Kiểm tra chữ ký số chống giả mạo bằng HMAC-SHA256
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, reason: 'Chữ ký số của mã xác thực không hợp lệ (Bị làm giả).' };
  }

  // 2. Đọc payload và kiểm tra thời hạn
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    
    if (payload.role !== 'admin') {
      return { valid: false, reason: 'Tài khoản không có đặc quyền Quản trị viên (Admin).' };
    }

    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, reason: 'Phiên làm việc quản trị đã hết hạn (Sau 24 giờ). Vui lòng đăng nhập lại.' };
    }

    return { valid: true, user: payload };
  } catch (err) {
    return { valid: false, reason: 'Không thể giải mã dữ liệu phiên làm việc.' };
  }
}

/**
 * Trích xuất và thẩm định quyền Admin trực tiếp từ NextRequest (Dùng trong mọi API Route)
 * Hỗ trợ nhận Token qua:
 * 1. Header Authorization: Bearer <token>
 * 2. Header x-admin-token: <token>
 * 3. Cookie bds_admin_token
 */
export function verifyAdminRequest(request) {
  if (!request) return { valid: false, reason: 'Thiếu thông tin request.' };

  // 1. Lấy từ Header Authorization
  const authHeader = request.headers?.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const result = verifyAdminToken(token);
    if (result.valid) return result;
  }

  // 2. Lấy từ Header tùy chỉnh x-admin-token
  const customHeader = request.headers?.get('x-admin-token');
  if (customHeader) {
    const result = verifyAdminToken(customHeader);
    if (result.valid) return result;
  }

  // 3. Lấy từ Cookie bds_admin_token
  const cookieHeader = request.headers?.get('cookie') || '';
  const match = cookieHeader.match(/bds_admin_token=([^;]+)/);
  if (match && match[1]) {
    const token = decodeURIComponent(match[1]);
    const result = verifyAdminToken(token);
    if (result.valid) return result;
  }

  // 4. Lấy từ Cookie phiên đăng nhập bds_session_user
  const sessionMatch = cookieHeader.match(/bds_session_user=([^;]+)/);
  if (sessionMatch && sessionMatch[1]) {
    const userId = decodeURIComponent(sessionMatch[1]);
    try {
      const dbPath = path.resolve(process.cwd(), 'server-db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}');
        const user = (db.bds_users_list || []).find(u => String(u.id) === String(userId));
        if (user && user.role === 'admin') {
          return { valid: true, user };
        }
      }
    } catch (_) {}
  }

  return { valid: false, reason: 'Bạn không có quyền truy cập API quản trị này (Thiếu hoặc sai mã xác thực Admin).' };
}
