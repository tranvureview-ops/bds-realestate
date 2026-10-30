/**
 * Tiện ích quản lý thời hạn và tính toán khấu trừ Ví Khuyến Mãi (Isomorphic: Client & Server Safe)
 */

const DEFAULT_BONUS_EXPIRY_DAYS = 30;

/**
 * Lấy thông tin gói tiền thưởng sắp hết hạn gần nhất của người dùng.
 * Ưu tiên gói có ngày hết hạn sớm nhất trong tương lai (Earliest Expiry First).
 * Khi gói gần nhất đã đến hạn (quá hạn) hoặc đã dùng hết, tự động hiển thị mốc kế tiếp.
 * 
 * @param {Object} user Bản ghi người dùng
 * @param {Object} systemConfig Cấu hình hệ thống (để lấy bonusExpiryDays mặc định)
 * @returns {Object|null} Thông tin gói sắp hết hạn { amount, expiresAt, formattedDate, daysLeft, batchCount }
 */
export function getEarliestExpiringBonus(user, systemConfig = null) {
  if (!user || Number(user.bonusWalletBalance) <= 0) {
    return null;
  }

  const now = Date.now();
  const balance = Number(user.bonusWalletBalance);
  const defaultDays = Number(systemConfig?.bonusExpiryDays) || DEFAULT_BONUS_EXPIRY_DAYS;

  // 1. Quét theo danh sách các gói tiền thưởng có hạn (bonusBatches)
  if (Array.isArray(user.bonusBatches) && user.bonusBatches.length > 0) {
    const validBatches = user.bonusBatches
      .filter((b) => Number(b.amount) > 0 && new Date(b.expiresAt).getTime() > now)
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

    if (validBatches.length > 0) {
      const earliest = validBatches[0];
      const expDate = new Date(earliest.expiresAt);
      const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now) / (24 * 60 * 60 * 1000)));
      return {
        amount: Math.min(balance, Number(earliest.amount)),
        expiresAt: earliest.expiresAt,
        formattedDate: expDate.toLocaleDateString('vi-VN'),
        daysLeft,
        batchCount: validBatches.length
      };
    }
  }

  // 2. Dự phòng: Nếu có mốc đơn lẻ bonusExpiresAt và chưa quá hạn
  if (user.bonusExpiresAt && new Date(user.bonusExpiresAt).getTime() > now) {
    const expDate = new Date(user.bonusExpiresAt);
    const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now) / (24 * 60 * 60 * 1000)));
    const amt = Number(user.earliestExpiringBonus?.amount) || balance;
    return {
      amount: Math.min(balance, amt),
      expiresAt: user.bonusExpiresAt,
      formattedDate: expDate.toLocaleDateString('vi-VN'),
      daysLeft,
      batchCount: 1
    };
  }

  // 3. Nếu user có số dư ví KM nhưng chưa có ngày hoặc ngày cũ đã qua:
  // Tính theo thời hạn cấu hình quản trị hệ thống (systemConfig.bonusExpiryDays)
  const fallbackExpiry = new Date(now + defaultDays * 24 * 60 * 60 * 1000);
  fallbackExpiry.setHours(23, 59, 59, 0);
  const fallbackIso = fallbackExpiry.toISOString();
  return {
    amount: balance,
    expiresAt: fallbackIso,
    formattedDate: fallbackExpiry.toLocaleDateString('vi-VN'),
    daysLeft: defaultDays,
    batchCount: 1
  };
}

/**
 * Khấu trừ tiền từ danh sách các gói tiền thưởng theo nguyên tắc FIFO (gói hết hạn sớm nhất bị trừ trước)
 * @param {Array} batches Danh sách gói thưởng
 * @param {number} amountToDeduct Số tiền cần trừ
 * @returns {Object} { remainingDeduct, updatedBatches }
 */
export function deductBatchesFifo(batches = [], amountToDeduct = 0) {
  let remaining = Number(amountToDeduct) || 0;
  if (remaining <= 0 || !Array.isArray(batches) || batches.length === 0) {
    return { remainingDeduct: remaining, updatedBatches: batches || [] };
  }

  // Clone và sắp xếp tăng dần theo thời hạn hết hạn
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  );

  const updatedBatches = [];
  for (const b of sortedBatches) {
    const batchAmt = Number(b.amount) || 0;
    if (remaining <= 0) {
      if (batchAmt > 0) updatedBatches.push(b);
      continue;
    }

    if (batchAmt <= remaining) {
      remaining -= batchAmt;
      // Gói này đã tiêu hết hoàn toàn, không đưa vào danh sách hiệu lực
    } else {
      updatedBatches.push({
        ...b,
        amount: batchAmt - remaining
      });
      remaining = 0;
    }
  }

  return { remainingDeduct: remaining, updatedBatches };
}
