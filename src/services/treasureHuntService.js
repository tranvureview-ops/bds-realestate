/**
 * Service quản lý tính năng Săn Rương Kho Báu trong bài viết BĐS
 * Cơ chế:
 * - 3 hộp / ngày / tài khoản
 * - 1 tin đăng chỉ mở được 1 lần / ngày
 * - Tỷ lệ random tiền thưởng:
 *   + 50%: 2.000đ - 4.000đ
 *   + 25%: 5.000đ - 10.000đ
 *   + 15%: 11.000đ - 15.000đ
 *   + 10%: 15.000đ - 20.000đ (Max 20.000đ)
 * - Chống spam: kiểm tra thời gian xem, kiểm tra đăng nhập, cooldown 30s
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

// Hàm tính ngẫu nhiên tiền thưởng theo đúng tỷ lệ
export function calculateTreasureReward(customTiers = null) {
  if (Array.isArray(customTiers) && customTiers.length > 0) {
    const rand = Math.random() * 100;
    let accumulated = 0;
    for (const t of customTiers) {
      accumulated += Number(t.probability || 0);
      if (rand <= accumulated) {
        const min = Number(t.minAmount || 1000);
        const max = Number(t.maxAmount || 5000);
        const step = 1000;
        const steps = Math.floor((max - min) / step);
        const amount = steps > 0 
          ? min + Math.floor(Math.random() * (steps + 1)) * step 
          : min;
        return {
          amount,
          tier: t.id || 'custom',
          tierLabel: t.label || 'Quà May Mắn',
          color: t.id === 'tier4' ? 'text-rose-700 bg-rose-50' : t.id === 'tier3' ? 'text-amber-900 bg-amber-100' : t.id === 'tier2' ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50'
        };
      }
    }
  }

  const rand = Math.random();

  // Tier 1 (50%): 2.000đ - 4.000đ
  if (rand < 0.50) {
    const choices = [2000, 3000, 4000];
    const amount = choices[Math.floor(Math.random() * choices.length)];
    return {
      amount,
      tier: 'tier1',
      tierLabel: 'May Mắn Đồng',
      color: 'text-amber-700 bg-amber-50'
    };
  }

  // Tier 2 (25%): 5.000đ - 10.000đ
  if (rand < 0.75) {
    const choices = [5000, 6000, 7000, 8000, 9000, 10000];
    const amount = choices[Math.floor(Math.random() * choices.length)];
    return {
      amount,
      tier: 'tier2',
      tierLabel: 'Bạc Rực Rỡ',
      color: 'text-blue-700 bg-blue-50'
    };
  }

  // Tier 3 (15%): 11.000đ - 15.000đ
  if (rand < 0.90) {
    const choices = [11000, 12000, 13000, 14000, 15000];
    const amount = choices[Math.floor(Math.random() * choices.length)];
    return {
      amount,
      tier: 'tier3',
      tierLabel: 'Vàng Phú Quý',
      color: 'text-amber-900 bg-amber-100'
    };
  }

  // Tier 4 (10%): 15.000đ - 20.000đ (Tối đa 20.000đ)
  const choices = [16000, 17000, 18000, 19000, 20000];
  const amount = choices[Math.floor(Math.random() * choices.length)];
  return {
    amount,
    tier: 'tier4',
    tierLabel: 'Kim Cương Đỉnh Cao',
    color: 'text-rose-700 bg-rose-50'
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
