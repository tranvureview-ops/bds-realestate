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

// Hàm tính ngẫu nhiên tiền thưởng từ minAmount (hạng thấp nhất) đến maxAmount (hạng cao nhất)
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

  let tier = 'tier1';
  let tierLabel = 'Rương May Mắn';
  let color = 'text-amber-700 bg-amber-50';

  const range = max - min;
  if (range > 0) {
    const ratio = (amount - min) / range;
    if (ratio >= 0.75) {
      tier = 'tier4';
      tierLabel = 'Rương Kim Cương Đỉnh Cao';
      color = 'text-rose-700 bg-rose-50';
    } else if (ratio >= 0.45) {
      tier = 'tier3';
      tierLabel = 'Rương Vàng Phú Quý';
      color = 'text-amber-900 bg-amber-100';
    } else if (ratio >= 0.20) {
      tier = 'tier2';
      tierLabel = 'Rương Bạc Rực Rỡ';
      color = 'text-blue-700 bg-blue-50';
    } else {
      tier = 'tier1';
      tierLabel = 'Rương Đồng May Mắn';
      color = 'text-amber-700 bg-amber-50';
    }
  }

  return {
    amount,
    tier,
    tierLabel,
    color
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
