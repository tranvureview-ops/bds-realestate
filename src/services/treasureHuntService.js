/**
 * Service quản lý tính năng Săn Rương Kho Báu trong bài viết BĐS
 * Cơ chế:
 * - 3 hộp / ngày / tài khoản
 * - 1 tin đăng chỉ mở được 1 lần / ngày
 * - Tiền thưởng ngẫu nhiên từ minAmount (hạng thấp nhất) đến maxAmount (hạng cao nhất)
 * - Mặc định: 2.000đ - 20.000đ (có thể tùy chỉnh trong CMS Quản trị)
 * - Chống spam: kiểm tra thời gian xem (minReadingSeconds), kiểm tra đăng nhập, cooldown 20s
 */

const DAILY_LIMIT = 3;
const COOLDOWN_SECONDS = 20;

// Lấy key lưu trữ theo ngày và user
function getStorageKey(userId) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const uid = userId || 'guest';
  return `bds_treasure_${uid}_${today}`;
}

// Lấy lịch sử mở hộp hôm nay của user
export function getDailyClaims(userId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Kiểm tra user đã mở hộp của bài viết này hôm nay chưa
export function hasClaimedPropertyToday(userId, propertyId) {
  if (!propertyId) return false;
  const claims = getDailyClaims(userId);
  return claims.some(c => String(c.propertyId) === String(propertyId));
}

// Kiểm tra user đã đạt hạn mức số hộp hôm nay chưa
export function getDailyQuotaStatus(userId, customLimit = DAILY_LIMIT) {
  const claims = getDailyClaims(userId);
  const count = claims.length;
  const limit = Number(customLimit || DAILY_LIMIT);
  const remaining = Math.max(0, limit - count);
  const isLimitReached = count >= limit;

  return {
    count,
    limit,
    remaining,
    isLimitReached
  };
}

// Kiểm tra Cooldown chống spam giữa 2 lần mở hộp
export function checkCooldownStatus(userId, customCooldown = COOLDOWN_SECONDS) {
  const claims = getDailyClaims(userId);
  if (claims.length === 0) return { canOpen: true, secondsLeft: 0 };

  const lastClaim = claims[claims.length - 1];
  const lastTime = new Date(lastClaim.timestamp).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - lastTime) / 1000);
  const cooldown = Number(customCooldown || COOLDOWN_SECONDS);

  if (elapsed < cooldown) {
    return {
      canOpen: false,
      secondsLeft: cooldown - elapsed
    };
  }

  return { canOpen: true, secondsLeft: 0 };
}

// Hàm tính ngẫu nhiên tiền thưởng từ minAmount đến maxAmount (hoàn toàn ngẫu nhiên, không phân cấp hạng rương)
export function calculateTreasureReward(tConfig = null) {
  let min = 2000;
  let max = 20000;

  if (tConfig && typeof tConfig === 'object') {
    if (tConfig.minAmount !== undefined) min = Math.max(1000, Number(tConfig.minAmount) || 2000);
    if (tConfig.maxAmount !== undefined) max = Math.max(min, Number(tConfig.maxAmount) || 20000);
  }

  const step = 1000;
  const steps = Math.floor((max - min) / step);
  const amount = steps > 0 
    ? min + Math.floor(Math.random() * (steps + 1)) * step 
    : min;

  return {
    amount,
    label: 'Rương May Mắn'
  };
}

// Lưu lượt nhận thưởng vào Storage
export function recordTreasureClaim(userId, propertyId, propertyTitle, rewardAmount) {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const current = getDailyClaims(userId);
    const newClaim = {
      propertyId: String(propertyId),
      propertyTitle: propertyTitle || 'Tin đăng BĐS',
      amount: rewardAmount,
      timestamp: new Date().toISOString()
    };
    const updated = [...current, newClaim];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Thời hạn gán nổi bật cố định: 15 ngày
 */
export const TREASURE_HUNT_DURATION_DAYS = 15;

/**
 * Tính toán thời gian bắt đầu và hết hạn khi Gán Nổi Bật bài viết
 * - Thời hạn cố định: 15 ngày kể từ ngày gắn
 * - Được duy trì hiển thị trong thời gian tài khoản có Gói Hội Viên hiệu lực
 */
export function calculateTreasureHuntExpiry(currentUser = null) {
  const now = Date.now();
  const durationMs = TREASURE_HUNT_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const targetExpiryMs = now + durationMs;

  return {
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(targetExpiryMs).toISOString()
  };
}

/**
 * Kiểm tra trạng thái Gán Nổi Bật của bài viết:
 * - isTreasureHuntActive === true
 * - Chưa quá hạn 15 ngày kể từ ngày kích hoạt
 * - QUY TẮC ĐẶC QUYỀN: Kể cả khi gói hội viên hết hạn trước, rương/nổi bật vẫn hiển thị và
 *   xuất hiện rương quà cho đến khi hết đủ 15 ngày thì mới gỡ!
 */
export function isPropertyTreasureActive(prop, authorUser = null) {
  if (!prop || !prop.isTreasureHuntActive) return false;

  // Kiểm tra thời hạn 15 ngày của bài viết (hết đủ 15 ngày mới gỡ)
  const expInfo = getTreasureExpirationInfo(prop);
  if (expInfo.isExpired) {
    return false; // Đã quá hạn 15 ngày
  }

  return true;
}

/**
 * Lấy thông tin chi tiết về thời hạn Gán Nổi Bật của bài viết
 */
export function getTreasureExpirationInfo(prop) {
  if (!prop) {
    return {
      isActive: false,
      isExpired: false,
      activatedAt: null,
      expiresAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedExpiryDate: '',
      formattedActivatedDate: '',
      timeRemainingText: ''
    };
  }

  const isFlagActive = Boolean(prop.isTreasureHuntActive);
  const now = Date.now();

  if (!isFlagActive) {
    return {
      isActive: false,
      isExpired: false,
      activatedAt: prop.treasureHuntActivatedAt || null,
      expiresAt: prop.treasureHuntExpiresAt || null,
      daysRemaining: 0,
      hoursRemaining: 0,
      formattedExpiryDate: '',
      formattedActivatedDate: '',
      timeRemainingText: 'Chưa gán nổi bật'
    };
  }

  // Lấy hạn hết hạn
  let expMs = prop.treasureHuntExpiresAt ? new Date(prop.treasureHuntExpiresAt).getTime() : null;
  const actTime = prop.treasureHuntActivatedAt ? new Date(prop.treasureHuntActivatedAt).getTime() : null;

  // Nếu bài viết được gán nổi bật gần đây nhưng thời hạn bị giới hạn thiếu ngày (< 14 ngày kể từ lúc kích hoạt),
  // tự động chuẩn hóa đủ 15 ngày cố định theo quy chuẩn
  if (actTime && (!expMs || isNaN(expMs) || (expMs - actTime < (TREASURE_HUNT_DURATION_DAYS - 1) * 86400 * 1000))) {
    expMs = actTime + TREASURE_HUNT_DURATION_DAYS * 24 * 60 * 60 * 1000;
  } else if (!expMs || isNaN(expMs)) {
    expMs = (actTime || now) + TREASURE_HUNT_DURATION_DAYS * 24 * 60 * 60 * 1000;
  }

  const diffMs = expMs - now;
  const isExpired = diffMs <= 0;
  const isActive = !isExpired;

  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));

  const expDate = new Date(expMs);
  const formattedExpiryDate = `${String(expDate.getDate()).padStart(2, '0')}/${String(expDate.getMonth() + 1).padStart(2, '0')}/${expDate.getFullYear()}`;

  let formattedActivatedDate = '';
  if (prop.treasureHuntActivatedAt) {
    const actDate = new Date(prop.treasureHuntActivatedAt);
    formattedActivatedDate = `${String(actDate.getDate()).padStart(2, '0')}/${String(actDate.getMonth() + 1).padStart(2, '0')}/${actDate.getFullYear()}`;
  }

  let timeRemainingText = '';
  if (isExpired) {
    timeRemainingText = 'Đã hết hạn';
  } else if (daysRemaining > 1) {
    timeRemainingText = `Còn ${daysRemaining} ngày`;
  } else if (hoursRemaining > 0) {
    timeRemainingText = `Còn ${hoursRemaining} giờ`;
  } else {
    timeRemainingText = 'Hôm nay hết hạn';
  }

  return {
    isActive,
    isExpired,
    activatedAt: prop.treasureHuntActivatedAt || null,
    expiresAt: new Date(expMs).toISOString(),
    daysRemaining,
    hoursRemaining,
    formattedExpiryDate,
    formattedActivatedDate,
    timeRemainingText
  };
}
