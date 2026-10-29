import { NextResponse } from 'next/server';
import { getAllUsers } from '../../../../services/serverDbService';

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

    const users = await getAllUsers();
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

    const now = Date.now();
    let earliestBatch = null;

    // 1. Kiểm tra danh sách các gói tiền thưởng có hạn (bonusBatches)
    if (Array.isArray(user.bonusBatches) && user.bonusBatches.length > 0) {
      const validBatches = user.bonusBatches
        .filter(b => new Date(b.expiresAt).getTime() > now && Number(b.amount) > 0)
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

      if (validBatches.length > 0) {
        earliestBatch = validBatches[0];
      }
    }

    // 2. Dự phòng cấu hình đơn lẻ bonusExpiresAt (nếu chưa có mảng batches)
    if (!earliestBatch && user.bonusExpiresAt && new Date(user.bonusExpiresAt).getTime() > now) {
      earliestBatch = {
        amount: Number(user.earliestExpiringBonus?.amount) || bonusBalance,
        expiresAt: user.bonusExpiresAt
      };
    }

    // 3. Nếu user đang có tiền trong Ví KM mà chưa có ngày hết hạn -> Tính 30 ngày từ thời điểm hiện tại
    if (!earliestBatch) {
      const fallbackExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
      earliestBatch = {
        amount: bonusBalance,
        expiresAt: fallbackExpiry
      };
    }

    const expDate = new Date(earliestBatch.expiresAt);
    const formattedDate = expDate.toLocaleDateString('vi-VN');
    const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now) / (24 * 60 * 60 * 1000)));

    return NextResponse.json({
      success: true,
      hasExpiringBonus: true,
      amount: Number(earliestBatch.amount) || bonusBalance,
      expiresAt: earliestBatch.expiresAt,
      formattedDate,
      formattedAmount: `${(Number(earliestBatch.amount) || bonusBalance).toLocaleString('vi-VN')}đ`,
      daysLeft
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
