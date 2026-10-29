import { NextResponse } from 'next/server';
import { getFullSystemDatabase } from '../../../../services/serverDbService';
import { getEarliestExpiringBonus } from '../../../../services/bonusCampaignService';

/**
 * API trả về thông tin gói tiền thưởng sắp hết hạn gần nhất của người dùng
 * Query param: ?userId=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return NextResponse.json({
        success: true,
        hasExpiringBonus: false,
        amount: 0,
        expiresAt: null,
        formattedDate: null,
        formattedAmount: '0đ',
        message: 'Tài khoản khách hoặc chưa đăng nhập'
      });
    }

    const db = await getFullSystemDatabase();
    const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
    const user = (users || []).find(u => String(u.id) === String(userId));

    if (!user) {
      return NextResponse.json({
        success: true,
        hasExpiringBonus: false,
        amount: 0,
        expiresAt: null,
        formattedDate: null,
        formattedAmount: '0đ',
        message: 'Không tìm thấy người dùng'
      });
    }

    const bonusBalance = Number(user.bonusWalletBalance) || 0;
    if (bonusBalance <= 0) {
      return NextResponse.json({
        success: true,
        hasExpiringBonus: false,
        amount: 0,
        expiresAt: null,
        formattedDate: null,
        formattedAmount: '0đ'
      });
    }

    const earliestInfo = getEarliestExpiringBonus(user, db.bds_system_config);
    if (!earliestInfo) {
      return NextResponse.json({
        success: true,
        hasExpiringBonus: false,
        amount: 0,
        expiresAt: null,
        formattedDate: null,
        formattedAmount: '0đ'
      });
    }

    return NextResponse.json({
      success: true,
      hasExpiringBonus: true,
      amount: earliestInfo.amount,
      expiresAt: earliestInfo.expiresAt,
      formattedDate: earliestInfo.formattedDate,
      formattedAmount: `${earliestInfo.amount.toLocaleString('vi-VN')}đ`,
      daysLeft: earliestInfo.daysLeft
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
