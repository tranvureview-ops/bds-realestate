import { NextResponse } from 'next/server';
import { getCampaignSettings } from '../../../../services/bonusCampaignService';
import { getFullSystemDatabase, updateUserById, persistDatabaseSlice } from '../../../../services/serverDbService';
import { verifyAdminRequest } from '../../../../utils/adminAuth';

export function calculateBonusExpiration(bonusExpiryDays) {
  const days = Number(bonusExpiryDays) || 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function buildManualActivationTransaction(user, bonusAmount) {
  return {
    id: `TXN-ACTIVATE-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    type: 'bonus',
    title: 'Quà tặng chào mừng thành viên mới (Kích hoạt thủ công)',
    amount: bonusAmount,
    balanceAfter: Number(user.walletBalance || 0) + Number(bonusAmount),
    status: 'success',
    paymentMethod: 'Ví Khuyến Mãi',
    createdAt: new Date().toISOString()
  };
}

export async function appendTransactionRecord(transaction) {
  const db = await getFullSystemDatabase();
  const txns = Array.isArray(db.bds_transactions) ? db.bds_transactions : [];
  await persistDatabaseSlice('bds_transactions', [transaction, ...txns]);
}

export async function markTokensAsUsed(email) {
  const db = await getFullSystemDatabase();
  const tokens = Array.isArray(db.bds_verification_tokens) ? db.bds_verification_tokens : [];
  const updated = tokens.map(t => (t.email?.toLowerCase() === email.toLowerCase() ? { ...t, used: true } : t));
  await persistDatabaseSlice('bds_verification_tokens', updated);
}

export async function executeManualActivation(user, campaign) {
  const bonusExpiresAt = calculateBonusExpiration(campaign.bonusExpiryDays);
  const bonusAmount = Number(campaign.welcomeBonusAmount) || 100000;
  const welcomeBatch = {
    id: `BATCH-WELCOME-${Date.now()}`,
    amount: bonusAmount,
    expiresAt: bonusExpiresAt,
    reason: 'Quà tặng chào mừng thành viên mới (Kích hoạt thủ công)',
    createdAt: new Date().toISOString()
  };
  const currentBatches = Array.isArray(user.bonusBatches) ? user.bonusBatches : [];
  const nextBatches = [...currentBatches, welcomeBatch];
  const earliestInfo = {
    amount: bonusAmount,
    expiresAt: bonusExpiresAt,
    formattedDate: new Date(bonusExpiresAt).toLocaleDateString('vi-VN')
  };

  const updatedUser = await updateUserById(user.id, {
    status: 'active',
    emailVerified: true,
    bonusWalletBalance: bonusAmount,
    bonusExpiresAt,
    bonusBatches: nextBatches,
    earliestExpiringBonus: earliestInfo,
    bonusActivatedAt: new Date().toISOString()
  });
  const txn = buildManualActivationTransaction(user, bonusAmount);
  await appendTransactionRecord(txn);
  await markTokensAsUsed(user.email);
  return updatedUser;
}

export async function resolveUserFromDb(userId) {
  const db = await getFullSystemDatabase();
  const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
  return { db, user: users.find(u => u.id === userId) };
}

export async function POST(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized: Chỉ Quản trị viên đã đăng nhập mới có quyền kích hoạt tài khoản thủ công!' 
      }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ success: false, message: 'Thiếu mã người dùng (userId).' }, { status: 400 });

    const { db, user } = await resolveUserFromDb(userId);
    if (!user) return NextResponse.json({ success: false, message: 'Không tìm thấy người dùng.' }, { status: 404 });

    if (user.status === 'active' && user.bonusActivatedAt) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tài khoản này đã được kích hoạt thành công từ trước, không thể kích hoạt lại nhiều lần!' 
      }, { status: 400 });
    }

    const campaign = getCampaignSettings(db.bds_system_config);
    const updatedUser = await executeManualActivation(user, campaign);
    const bonusText = Number(campaign.welcomeBonusAmount).toLocaleString('vi-VN');

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt tài khoản ${user.name} và cộng ${bonusText} đ vào ví!`,
      user: updatedUser
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
