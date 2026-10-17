import nodemailer from 'nodemailer';
import { getFullSystemDatabase, persistDatabaseSlice } from './serverDbService';
import { generateWelcomeVerificationEmailHtml, generatePasswordResetEmailHtml } from '../utils/emailService';

/**
 * Trích xuất domain gốc từ request header hoặc fallback
 * @param {Request} request HTTP Request
 * @returns {string} Origin URL
 */
export function resolveServerOrigin(request) {
  const host = request?.headers?.get('x-forwarded-host') || request?.headers?.get('host');
  const proto = request?.headers?.get('x-forwarded-proto') || 'https';
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://datbiendanang.vn';
}

/**
 * Tạo nodemailer transport từ cấu hình SMTP
 * @param {Object} smtp Cấu hình SMTP
 * @returns {Object|null} Transporter instance hoặc null nếu thiếu thông tin
 */
export function createMailTransporter(smtp) {
  const host = (smtp?.host || '').trim();
  const user = (smtp?.username || '').trim();
  const pass = (smtp?.password || '').replace(/\s+/g, '');
  if (!host || !user || !pass) return null;

  const port = Number(smtp?.port) || 587;
  const isSecure = port === 465 || smtp?.encryption === 'ssl';
  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

/**
 * Lưu vết email vào nhật ký gửi thư bds_email_logs
 * @param {Object} logItem Bản ghi nhật ký email
 */
export async function appendEmailLog(logItem) {
  const db = await getFullSystemDatabase();
  const logs = Array.isArray(db.bds_email_logs) ? db.bds_email_logs : [];
  const updatedLogs = [logItem, ...logs.slice(0, 99)];
  await persistDatabaseSlice('bds_email_logs', updatedLogs);
}

/**
 * Tạo nội dung HTML và tiêu đề thư chào mừng kích hoạt tài khoản
 * @param {Object} params Tham số tạo nội dung
 * @returns {Object} { verificationUrl, subject, htmlBody }
 */
export function buildWelcomeEmailPayload({ toUser, tokenRecord, origin, emailConfig }) {
  const verificationUrl = `${origin}/xac-thuc-email?token=${tokenRecord.token}`;
  const htmlBody = generateWelcomeVerificationEmailHtml({
    userName: toUser.name,
    userEmail: toUser.email,
    verificationUrl,
    bonusAmount: tokenRecord.bonusAmount,
    expiryMinutes: tokenRecord.expiryMinutes || 30,
    bonusExpiryDays: tokenRecord.bonusExpiryDays || 30,
    customConfig: emailConfig
  });
  const subject = `🎁 Kích hoạt tài khoản và nhận ${Number(tokenRecord.bonusAmount).toLocaleString('vi-VN')} đ vào Ví`;
  return { verificationUrl, subject, htmlBody };
}

/**
 * Thực hiện gửi thư qua SMTP nếu đã cấu hình
 * @param {Object} transporter Đối tượng nodemailer transporter
 * @param {Object} emailConfig Cấu hình email hệ thống
 * @param {string} toEmail Địa chỉ người nhận
 * @param {string} subject Tiêu đề thư
 * @param {string} htmlBody Nội dung HTML
 */
export async function deliverEmailViaSmtp(transporter, emailConfig, toEmail, subject, htmlBody) {
  if (!transporter || emailConfig?.enableEmailNotifications === false) {
    return { delivered: false, reason: 'unconfigured_or_disabled' };
  }
  try {
    const fromSender = emailConfig?.fromName
      ? `"${emailConfig.fromName}" <${emailConfig.fromEmail || emailConfig.smtp?.username}>`
      : (emailConfig?.fromEmail || emailConfig.smtp?.username || 'cskh@datbiendanang.vn');
    const info = await transporter.sendMail({ from: fromSender, to: toEmail, subject, html: htmlBody });
    return { delivered: true, messageId: info?.messageId };
  } catch (err) {
    console.warn('Lỗi gửi email qua SMTP:', err.message);
    return { delivered: false, error: err.message };
  }
}

/**
 * Điều phối gửi email kích hoạt tài khoản kèm thông tin quà tặng chào mừng
 * @param {Object} params Tham số gửi email
 * @returns {Promise<Object>} Kết quả gửi email
 */
export async function sendWelcomeVerificationEmail({ toUser, tokenRecord, origin }) {
  const db = await getFullSystemDatabase();
  const emailConfig = db.bds_email_config || null;
  const { verificationUrl, subject, htmlBody } = buildWelcomeEmailPayload({
    toUser,
    tokenRecord,
    origin,
    emailConfig
  });

  const transporter = createMailTransporter(emailConfig?.smtp);
  const delivery = await deliverEmailViaSmtp(transporter, emailConfig, toUser.email, subject, htmlBody);

  await appendEmailLog({
    id: `LOG-MAIL-${Date.now()}`,
    to: toUser.email,
    type: 'welcome_verification',
    subject,
    status: delivery.delivered ? 'sent' : (delivery.error ? 'failed' : 'simulated'),
    error: delivery.error || null,
    sentAt: new Date().toISOString()
  });

  return {
    success: true,
    verificationUrl,
    emailSent: Boolean(delivery.delivered),
    deliveryError: delivery.error || null
  };
}

/**
 * Điều phối gửi email đặt lại mật khẩu cho thành viên
 * @param {Object} params Tham số gửi email
 * @returns {Promise<Object>} Kết quả gửi email
 */
export async function sendPasswordResetEmail({ toUser, tokenRecord, origin }) {
  const db = await getFullSystemDatabase();
  const emailConfig = db.bds_email_config || null;
  const resetUrl = `${origin}/dat-lai-mat-khau?token=${tokenRecord.token}`;
  const subject = `[Bảo Mật] Hướng dẫn đặt lại mật khẩu tài khoản ${emailConfig?.companyName || 'Đất Biển Đà Nẵng'}`;
  const htmlBody = generatePasswordResetEmailHtml({
    userName: toUser.name,
    userEmail: toUser.email,
    resetUrl,
    expiryMinutes: tokenRecord.expiryMinutes || 30,
    customConfig: emailConfig
  });

  const transporter = createMailTransporter(emailConfig?.smtp);
  const delivery = await deliverEmailViaSmtp(transporter, emailConfig, toUser.email, subject, htmlBody);

  await appendEmailLog({
    id: `LOG-MAIL-RESET-${Date.now()}`,
    to: toUser.email,
    type: 'password_reset',
    subject,
    status: delivery.delivered ? 'sent' : (delivery.error ? 'failed' : 'simulated'),
    error: delivery.error || null,
    sentAt: new Date().toISOString()
  });

  return {
    success: true,
    resetUrl,
    emailSent: Boolean(delivery.delivered),
    deliveryError: delivery.error || null
  };
}
