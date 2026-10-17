import { NextResponse } from 'next/server';
import { hashPassword, validateRegistrationInput, checkUserDuplication } from '../../../../services/authService';
import { getCampaignSettings, checkIpRegistrationLimit, generateVerificationTokenRecord } from '../../../../services/bonusCampaignService';
import { saveNewUser, saveVerificationToken, getFullSystemDatabase } from '../../../../services/serverDbService';
import { resolveServerOrigin, sendWelcomeVerificationEmail } from '../../../../services/mailerService';

/**
 * Trích xuất IP người dùng từ headers của request
 * @param {Request} request Request gửi từ client
 * @returns {string} Địa chỉ IP
 */
export function extractClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1');
}

/**
 * Tạo bản ghi người dùng mới ở trạng thái chờ kích hoạt email (pending)
 * @param {Object} input Dữ liệu đăng ký
 * @param {string} clientIp IP máy người dùng
 * @returns {Object} Bản ghi người dùng
 */
export function buildPendingUserRecord(input, clientIp) {
  const cleanPhone = (input.phone || '').replace(/\D/g, '');
  const cleanEmail = (input.email || '').trim().toLowerCase();
  const selectedRole = input?.role === 'broker' ? 'broker' : 'user';
  const roleName = selectedRole === 'broker' ? 'Môi Giới' : 'Khách hàng';
  return {
    id: `user-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: (input.name || '').trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: input.password || '',
    passwordHash: hashPassword(input.password),
    role: selectedRole,
    roleName: roleName,
    company: (input.company || '').trim(),
    primaryArea: (input.primaryArea || '').trim(),
    walletBalance: 0,
    bonusWalletBalance: 0,
    bonusExpiresAt: null,
    status: 'pending',
    emailVerified: false,
    registeredIp: clientIp,
    createdAt: new Date().toISOString()
  };
}

/**
 * Thẩm định điều kiện đăng ký người dùng mới
 * @param {Object} input Dữ liệu form
 * @param {Array} users Danh sách users hiện có
 * @param {string} ip Địa chỉ IP
 * @param {Object} campaign Cấu hình chiến dịch
 * @returns {string|null} Lỗi nếu có
 */
export function validateNewRegistration(input, users, ip, campaign) {
  const ipCheck = checkIpRegistrationLimit(ip, users, campaign.maxRegistrationsPerIpPerDay);
  if (!ipCheck.isAllowed) {
    return `Địa chỉ IP đã đạt giới hạn nhận thưởng trong ngày (${campaign.maxRegistrationsPerIpPerDay} tài khoản/ngày).`;
  }
  const inputError = validateRegistrationInput(input);
  if (inputError) return inputError;

  return checkUserDuplication(input.email, input.phone, users);
}

/**
 * Lưu trữ người dùng, token và gửi email chào mừng
 * @param {Object} newUser Người dùng mới
 * @param {Object} tokenRecord Bản ghi token
 * @param {Request} request Request hiện tại
 */
export async function executeRegistration(newUser, tokenRecord, request) {
  await saveNewUser(newUser);
  await saveVerificationToken(tokenRecord);
  const origin = resolveServerOrigin(request);
  return sendWelcomeVerificationEmail({ toUser: newUser, tokenRecord, origin });
}

export function buildRegistrationSuccessResponse(newUser, bonusAmount, mailResult) {
  return NextResponse.json({
    success: true,
    message: mailResult?.emailSent
      ? 'Đăng ký thành công! Vui lòng kiểm tra email kích hoạt và nhận thưởng.'
      : 'Đăng ký thành công! Bạn có thể kích hoạt tài khoản ngay bằng liên kết bên dưới.',
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    bonusAmount,
    verificationUrl: mailResult?.verificationUrl || null,
    emailSent: Boolean(mailResult?.emailSent)
  });
}

/**
 * Endpoint POST xử lý đăng ký tài khoản thành viên mới
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getFullSystemDatabase();
    const campaign = getCampaignSettings(db.bds_system_config);
    const clientIp = extractClientIp(request);
    const error = validateNewRegistration(body, db.bds_users_list || [], clientIp, campaign);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });

    const newUser = buildPendingUserRecord(body, clientIp);
    const tokenRecord = generateVerificationTokenRecord(newUser.id, newUser.email, campaign);
    const mailResult = await executeRegistration(newUser, tokenRecord, request);

    return buildRegistrationSuccessResponse(newUser, campaign.welcomeBonusAmount, mailResult);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
