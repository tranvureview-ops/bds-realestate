import { NextResponse } from 'next/server';
import { getCampaignSettings, generateVerificationTokenRecord } from '../../../../services/bonusCampaignService';
import { getFullSystemDatabase, saveVerificationToken } from '../../../../services/serverDbService';
import { resolveServerOrigin, sendWelcomeVerificationEmail } from '../../../../services/mailerService';

/**
 * Kiểm tra điều kiện gửi lại email kích hoạt cho người dùng
 * @param {string} email Địa chỉ email
 * @param {Array} users Danh sách người dùng
 * @returns {Object} { user, error, status }
 */
export function validateResendEligibility(email, users) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  if (!user) {
    return { user: null, error: 'Không tìm thấy tài khoản với email này.', status: 404 };
  }
  if (user.status === 'active' && user.emailVerified) {
    return { user: null, error: 'Tài khoản đã được kích hoạt thành công từ trước. Vui lòng đăng nhập.', status: 400 };
  }
  return { user, error: null, status: 200 };
}

/**
 * Cấp phát mã token kích hoạt mới và gửi email
 * @param {Object} user Người dùng
 * @param {Object} campaign Cấu hình chiến dịch
 * @param {Request} request Request hiện tại
 */
export async function issueFreshVerificationToken(user, campaign, request) {
  const tokenRecord = generateVerificationTokenRecord(user.id, user.email, campaign);
  await saveVerificationToken(tokenRecord);
  const origin = resolveServerOrigin(request);
  await sendWelcomeVerificationEmail({ toUser: user, tokenRecord, origin });
  return tokenRecord;
}

/**
 * Endpoint POST /api/auth/resend-verification gửi lại email kích hoạt
 */
export async function POST(request) {
  try {
    const { email } = await request.json();
    const db = await getFullSystemDatabase();
    const campaign = getCampaignSettings(db.bds_system_config);
    const { user, error, status } = validateResendEligibility(email, db.bds_users_list || []);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    await issueFreshVerificationToken(user, campaign, request);

    return NextResponse.json({
      success: true,
      message: 'Email kích hoạt mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
      email: user.email
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
