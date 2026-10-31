import { NextResponse } from 'next/server';
import { scanAndExpireBonuses } from '../../../../services/bonusCampaignService';
import { getFullSystemDatabase, persistDatabaseSlice } from '../../../../services/serverDbService';
import { verifyAdminRequest } from '../../../../utils/adminAuth';

function isAuthorizedCron(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  const adminCheck = verifyAdminRequest(req);
  if (adminCheck.valid) return true;
  return process.env.NODE_ENV !== 'production' && !process.env.CRON_SECRET;
}

/**
 * Lưu trữ danh sách người dùng đã thu hồi thưởng và ghi nhận các bản ghi giao dịch
 * @param {Array} updatedUsers Danh sách user sau khi trừ ví
 * @param {Array} transactions Danh sách giao dịch thu hồi
 */
export async function persistClawbackChanges(updatedUsers, transactions) {
  const db = await getFullSystemDatabase();
  const currentTxns = Array.isArray(db.bds_transactions) ? db.bds_transactions : [];
  await persistDatabaseSlice('bds_users_list', updatedUsers);
  await persistDatabaseSlice('bds_transactions', [...transactions, ...currentTxns]);
}

/**
 * Quét toàn bộ người dùng và thu hồi các khoản tiền khuyến mãi đã hết hạn
 * @returns {Promise<Object>} Kết quả thu hồi { expiredCount, transactions }
 */
export async function executeBonusClawback() {
  const db = await getFullSystemDatabase();
  const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
  const { updatedUsers, clawbackTransactions, expiredCount } = scanAndExpireBonuses(users);

  if (expiredCount > 0) {
    await persistClawbackChanges(updatedUsers, clawbackTransactions);
  }

  return { expiredCount, clawbackTransactions };
}

/**
 * Endpoint GET cho Cron Job tự động chạy định kỳ hàng ngày
 */
export async function GET(req) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized Cron Request' }, { status: 401 });
    }
    const result = await executeBonusClawback();
    return NextResponse.json({
      success: true,
      message: `Đã hoàn tất quét: Thu hồi ${result.expiredCount} tài khoản có tiền thưởng hết hạn.`,
      ...result
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/**
 * Endpoint POST cho Admin kích hoạt quét thu hồi thủ công từ bảng quản trị
 */
export async function POST(req) {
  try {
    if (!isAuthorizedCron(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized Cron Request' }, { status: 401 });
    }
    const result = await executeBonusClawback();
    return NextResponse.json({
      success: true,
      message: `Quét thủ công thành công: Đã thu hồi ${result.expiredCount} tài khoản quá hạn.`,
      ...result
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
