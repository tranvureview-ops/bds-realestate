import crypto from 'crypto';

const DEFAULT_BONUS_AMOUNT = 100000;
const DEFAULT_TOKEN_EXPIRY_MINUTES = 30;
const DEFAULT_BONUS_EXPIRY_DAYS = 30;
const DEFAULT_MAX_IP_DAILY_REGISTRATIONS = 3;

/**
 * Trích xuất các tham số cấu hình chiến dịch thưởng chào mừng
 * @param {Object} systemConfig Cấu hình hệ thống từ Context hoặc Database
 * @returns {Object} Bộ thông số chiến dịch
 */
export function getCampaignSettings(systemConfig = null) {
  return {
    welcomeBonusAmount: Number(systemConfig?.welcomeBonusAmount) || DEFAULT_BONUS_AMOUNT,
    tokenExpiryMinutes: Number(systemConfig?.tokenExpiryMinutes) || DEFAULT_TOKEN_EXPIRY_MINUTES,
    bonusExpiryDays: Number(systemConfig?.bonusExpiryDays) || DEFAULT_BONUS_EXPIRY_DAYS,
    maxRegistrationsPerIpPerDay: Number(systemConfig?.maxRegistrationsPerIpPerDay) || DEFAULT_MAX_IP_DAILY_REGISTRATIONS,
    enableWelcomeBonus: systemConfig?.enableWelcomeBonus !== false
  };
}

/**
 * Chống gian lận: Kiểm tra số lần đăng ký từ cùng 1 địa chỉ IP trong ngày
 * @param {string} clientIp Địa chỉ IP của người dùng
 * @param {Array} userList Danh sách người dùng trong hệ thống
 * @param {number} maxLimit Số lượng đăng ký tối đa cho phép trong ngày
 * @returns {Object} Kết quả kiểm tra { isAllowed, currentCount }
 */
export function checkIpRegistrationLimit(clientIp, userList = [], maxLimit = 3) {
  if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'unknown') {
    return { isAllowed: true, currentCount: 0 };
  }

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentRegistrationsFromIp = userList.filter((user) => {
    if (user.registeredIp !== clientIp) return false;
    const userCreatedTime = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    return userCreatedTime >= oneDayAgo;
  });

  const count = recentRegistrationsFromIp.length;
  return {
    isAllowed: count < maxLimit,
    currentCount: count,
    maxLimit
  };
}

/**
 * Sinh mã token xác thực email ngẫu nhiên an toàn kèm thời gian hết hạn
 * @param {string} userId Mã định danh người dùng
 * @param {string} email Địa chỉ email nhận xác thực
 * @param {Object} campaignSettings Cấu hình chiến dịch
 * @returns {Object} Bản ghi Token xác thực
 */
export function generateVerificationTokenRecord(userId, email, campaignSettings) {
  const tokenString = crypto.randomBytes(32).toString('hex');
  const expiryMinutes = campaignSettings.tokenExpiryMinutes || DEFAULT_TOKEN_EXPIRY_MINUTES;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

  return {
    token: tokenString,
    userId,
    email,
    bonusAmount: campaignSettings.welcomeBonusAmount,
    bonusExpiryDays: campaignSettings.bonusExpiryDays,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * Thẩm tra token kích hoạt email
 * @param {string} tokenString Chuỗi token truyền từ query param
 * @param {Array} tokenList Danh sách token đã lưu trữ
 * @returns {Object} Kết quả xác thực { isValid, reason, tokenRecord }
 */
/**
 * Kiểm tra trạng thái sử dụng và hạn dùng của token
 * @param {Object} tokenRecord Bản ghi token
 * @returns {Object} Kết quả kiểm tra
 */
export function checkTokenValidityStatus(tokenRecord) {
  if (tokenRecord.used) {
    return { isValid: false, reason: 'already_used', message: 'Liên kết kích hoạt này đã được sử dụng.' };
  }
  if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    return {
      isValid: false,
      reason: 'expired',
      message: 'Liên kết kích hoạt đã hết hạn (quá thời hạn quy định). Vui lòng gửi lại email mới.',
      tokenRecord
    };
  }
  return { isValid: true, tokenRecord };
}

/**
 * Thẩm tra token kích hoạt email
 * @param {string} tokenString Chuỗi token truyền từ query param
 * @param {Array} tokenList Danh sách token đã lưu trữ
 * @returns {Object} Kết quả xác thực { isValid, reason, tokenRecord }
 */
export function validateVerificationToken(tokenString, tokenList = []) {
  if (!tokenString) {
    return { isValid: false, reason: 'missing_token', message: 'Không tìm thấy mã xác thực.' };
  }
  const tokenRecord = tokenList.find((item) => item.token === tokenString);
  if (!tokenRecord) {
    return { isValid: false, reason: 'not_found', message: 'Mã xác thực không tồn tại hoặc đã bị xóa.' };
  }
  return checkTokenValidityStatus(tokenRecord);
}

/**
 * Tính toán thời điểm hết hạn của số tiền thưởng khuyến mãi
 * @param {number} expiryDays Số ngày hiệu lực của tiền thưởng
 * @returns {string} Chuỗi ISO biểu thị thời điểm hết hạn
 */
export function calculateBonusExpirationDate(expiryDays = 30) {
  const daysInMilliseconds = (Number(expiryDays) || 30) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + daysInMilliseconds).toISOString();
}

/**
 * Kiểm tra xem tài khoản có tiền thưởng quá hạn cần thu hồi hay không
 * @param {Object} user Người dùng
 * @param {number} currentTime Thời gian hiện tại
 * @returns {boolean} True nếu quá hạn
 */
export function isUserBonusExpired(user, currentTime) {
  const hasBonus = Number(user.bonusWalletBalance) > 0;
  return hasBonus && user.bonusExpiresAt && new Date(user.bonusExpiresAt).getTime() <= currentTime;
}

/**
 * Tạo bản ghi lịch sử thu hồi tiền thưởng hết hạn
 * @param {Object} user Người dùng
 * @param {number} expiredAmount Số tiền thu hồi
 * @returns {Object} Bản ghi giao dịch
 */
export function buildClawbackTransaction(user, expiredAmount) {
  return {
    id: `TXN-EXP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name,
    type: 'bonus_expired',
    title: 'Thu hồi tiền thưởng chào mừng đã hết hạn sử dụng',
    amount: -expiredAmount,
    balanceAfter: user.walletBalance || 0,
    bonusBalanceAfter: 0,
    status: 'success',
    paymentMethod: 'Hệ thống tự động',
    createdAt: new Date().toISOString()
  };
}

/**
 * Tự động quét và thu hồi số tiền thưởng quá hạn 30 ngày chưa sử dụng
 * Hỗ trợ cả cơ chế đa gói tiền thưởng (bonusBatches) và cấu hình đơn lẻ (bonusExpiresAt)
 * @param {Array} userList Danh sách người dùng
 * @returns {Object} { updatedUsers, clawbackTransactions, expiredCount }
 */
export function scanAndExpireBonuses(userList = []) {
  const now = Date.now();
  const clawbackTransactions = [];

  const updatedUsers = userList.map((user) => {
    const currentBonus = Number(user.bonusWalletBalance) || 0;
    if (currentBonus <= 0) return user;

    // 1. Quét theo danh sách các gói tiền thưởng có hạn (bonusBatches)
    if (Array.isArray(user.bonusBatches) && user.bonusBatches.length > 0) {
      const activeBatches = [];
      let expiredBatchAmount = 0;

      for (const batch of user.bonusBatches) {
        if (new Date(batch.expiresAt).getTime() <= now) {
          expiredBatchAmount += Number(batch.amount) || 0;
        } else {
          activeBatches.push(batch);
        }
      }

      if (expiredBatchAmount > 0) {
        const remainingBonus = Math.max(0, currentBonus - expiredBatchAmount);
        activeBatches.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
        const earliestBatch = activeBatches[0];

        clawbackTransactions.push({
          id: `TXN-EXP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          userId: user.id,
          userName: user.name,
          type: 'bonus_expired',
          title: `Thu hồi tiền thưởng quá hạn 30 ngày (-${expiredBatchAmount.toLocaleString('vi-VN')}đ)`,
          amount: -expiredBatchAmount,
          balanceAfter: user.walletBalance || 0,
          bonusBalanceAfter: remainingBonus,
          status: 'success',
          paymentMethod: 'Hệ thống tự động',
          createdAt: new Date().toISOString()
        });

        return {
          ...user,
          bonusWalletBalance: remainingBonus,
          bonusBatches: activeBatches,
          bonusExpiresAt: earliestBatch ? earliestBatch.expiresAt : null,
          earliestExpiringBonus: earliestBatch ? {
            amount: earliestBatch.amount,
            expiresAt: earliestBatch.expiresAt,
            formattedDate: new Date(earliestBatch.expiresAt).toLocaleDateString('vi-VN')
          } : null
        };
      }
      return user;
    }

    // 2. Dự phòng kiểm tra theo mốc đơn lẻ bonusExpiresAt (cho các tài khoản cũ)
    if (isUserBonusExpired(user, now)) {
      const expiredAmount = currentBonus;
      clawbackTransactions.push(buildClawbackTransaction(user, expiredAmount));
      return {
        ...user,
        bonusWalletBalance: 0,
        bonusExpiredAt: new Date().toISOString(),
        bonusExpiresAt: null,
        earliestExpiringBonus: null
      };
    }

    return user;
  });

  return { updatedUsers, clawbackTransactions, expiredCount: clawbackTransactions.length };
}

import { getEarliestExpiringBonus, deductBatchesFifo } from '../utils/bonusExpiryUtils';

export { getEarliestExpiringBonus, deductBatchesFifo };
