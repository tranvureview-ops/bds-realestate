import { NextResponse } from 'next/server';
import { validateVerificationToken, calculateBonusExpirationDate } from '../../../services/bonusCampaignService';
import {
  getFullSystemDatabase,
  updateUserById,
  markTokenAsUsed,
  recordTransaction
} from '../../../services/serverDbService';

/**
 * Khởi tạo bản ghi lịch sử giao dịch tặng tiền thưởng chào mừng
 * @param {Object} user Người dùng nhận thưởng
 * @param {number} amount Số tiền thưởng
 * @returns {Object} Bản ghi giao dịch
 */
export function buildBonusTransaction(user, amount) {
  const newBonusBalance = (Number(user.bonusWalletBalance) || 0) + Number(amount);
  return {
    id: `TXN-PROMO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name,
    type: 'promo_welcome',
    title: `Tặng tiền thưởng chào mừng thành viên mới (${Number(amount).toLocaleString('vi-VN')} đ)`,
    amount: Number(amount),
    balanceAfter: Number(user.walletBalance) || 0,
    bonusBalanceAfter: newBonusBalance,
    status: 'success',
    paymentMethod: 'Ví Khuyến Mãi',
    createdAt: new Date().toISOString()
  };
}

/**
 * Xử lý cập nhật người dùng, ví khuyến mãi và lưu lịch sử giao dịch
 * @param {Object} tokenRecord Bản ghi token xác thực
 * @param {Array} users Danh sách người dùng
 * @returns {Promise<Object|null>} Người dùng đã được kích hoạt
 */
export async function processAccountActivation(tokenRecord, users) {
  const user = users.find((u) => u.id === tokenRecord.userId || u.email === tokenRecord.email);
  if (!user) return null;

  const bonusAmount = Number(tokenRecord.bonusAmount) || 100000;
  const expiryDays = Number(tokenRecord.bonusExpiryDays) || 30;
  const bonusExpiresAt = calculateBonusExpirationDate(expiryDays);
  const newBonusBalance = (Number(user.bonusWalletBalance) || 0) + bonusAmount;

  const welcomeBatch = {
    id: `BATCH-WELCOME-${Date.now()}`,
    amount: bonusAmount,
    expiresAt: bonusExpiresAt,
    reason: 'Quà tặng chào mừng thành viên mới (Kích hoạt email)',
    createdAt: new Date().toISOString()
  };
  const currentBatches = Array.isArray(user.bonusBatches) ? user.bonusBatches : [];
  const nextBatches = [...currentBatches, welcomeBatch];

  const earliestInfo = {
    amount: bonusAmount,
    expiresAt: bonusExpiresAt,
    formattedDate: new Date(bonusExpiresAt).toLocaleDateString('vi-VN')
  };

  await recordTransaction(buildBonusTransaction(user, bonusAmount));
  await markTokenAsUsed(tokenRecord.token);

  return updateUserById(user.id, {
    status: 'active',
    emailVerified: true,
    bonusWalletBalance: newBonusBalance,
    bonusExpiresAt,
    bonusBatches: nextBatches,
    earliestExpiringBonus: earliestInfo,
    bonusActivatedAt: new Date().toISOString()
  });
}

/**
 * Đóng gói phản hồi lỗi khi token không hợp lệ hoặc hết hạn
 * @param {Object} checkResult Kết quả kiểm tra token
 * @returns {Response} Next.js JSON Response
 */
export function buildVerificationErrorResponse(checkResult) {
  return NextResponse.json({
    success: false,
    reason: checkResult.reason,
    message: checkResult.message,
    email: checkResult.tokenRecord?.email || null
  }, { status: 400 });
}

export function buildVerificationSuccessResponse(user, bonusAmount) {
  return NextResponse.json({
    success: true,
    message: 'Kích hoạt tài khoản thành công! Tiền thưởng đã được cộng vào Ví Khuyến Mãi.',
    bonusAmount,
    bonusExpiresAt: user.bonusExpiresAt,
    user: { id: user.id, name: user.name, email: user.email }
  });
}

/**
 * Endpoint GET /api/verify-email?token=... xác thực tài khoản và tặng tiền
 */
export async function GET(request) {
  try {
    const token = new URL(request.url).searchParams.get('token');
    const db = await getFullSystemDatabase();
    const checkResult = validateVerificationToken(token, db.bds_verification_tokens || []);
    if (!checkResult.isValid) return buildVerificationErrorResponse(checkResult);

    const user = await processAccountActivation(checkResult.tokenRecord, db.bds_users_list || []);
    if (!user) return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản.' }, { status: 404 });

    return buildVerificationSuccessResponse(user, checkResult.tokenRecord.bonusAmount);
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
