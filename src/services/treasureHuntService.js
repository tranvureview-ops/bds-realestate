/**
 * Service quản lý tính năng Săn Rương Kho Báu trong bài viết BĐS
 * Cơ chế quy tắc:
 * 1. Khách vãng lai: Bắt buộc đăng nhập mới được mở rương (requireLogin).
 * 2. Hạn mức mở rương: 1 rương / ngày / tài khoản (dailyLimit).
 * 3. 1 tin đăng chỉ mở được 1 lần / ngày.
 * 4. Thời gian đọc chống bot (minReadingSeconds) & Thời gian chờ Cooldown (cooldownSeconds) dùng chung cho tất cả đối tượng.
 * 5. Tổng ngân sách mở rương tối đa 1 tháng (monthlyBudget) cấu hình trong CMS.
 * 6. 4 Mốc phần thưởng theo tỷ lệ cấu hình:
 *    - Chúc may mắn (Rỗng): 0đ | 25%
 *    - Thưởng Tối Thiểu (Nhỏ): 1.200đ | 45%
 *    - Thưởng Phổ Biến (Vừa): 2.500đ | 25%
 *    - Thưởng Tối Đa (Lớn): 12.000đ | 5%
 */

export const DEFAULT_TREASURE_REWARD_TIERS = [
  { id: 'tier_empty', label: 'Chúc may mắn (Rỗng)', amount: 0, percentage: 25 },
  { id: 'tier_min', label: 'Thưởng Tối Thiểu (Nhỏ)', amount: 1200, percentage: 45 },
  { id: 'tier_common', label: 'Thưởng Phổ Biến (Vừa)', amount: 2500, percentage: 25 },
  { id: 'tier_max', label: 'Thưởng Tối Đa (Lớn)', amount: 12000, percentage: 5 }
];

const DEFAULT_DAILY_LIMIT = 1;
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
export function getDailyQuotaStatus(userId, customLimit = DEFAULT_DAILY_LIMIT) {
  const claims = getDailyClaims(userId);
  const count = claims.length;
  const limit = Math.max(1, Number(customLimit || DEFAULT_DAILY_LIMIT));
  const remaining = Math.max(0, limit - count);
  const isLimitReached = count >= limit;

  return {
    count,
    limit,
    remaining,
    isLimitReached
  };
}

/**
 * Tính toán trạng thái ngân sách mở rương trong tháng hiện tại
 * @param {number} monthlyBudget Ngân sách tối đa 1 tháng (ví dụ: 50.000đ)
 * @param {Array} transactions Danh sách lịch sử giao dịch toàn sàn
 * @returns {object} { currentSpent, monthlyBudget, remainingBudget, isBudgetExceeded, percentUsed }
 */
export function getMonthlyTreasureBudgetStatus(monthlyBudget = 50000, transactions = []) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const budget = Number(monthlyBudget) > 0 ? Number(monthlyBudget) : 50000;

  let currentSpent = 0;
  if (Array.isArray(transactions)) {
    transactions.forEach(t => {
      if (!t) return;
      const tDate = t.createdAt || t.timestamp || t.date;
      if (!tDate) return;
      if (String(tDate).slice(0, 7) === currentMonth) {
        // Giao dịch cộng tiền từ rương: type === 'bonus_reward' hoặc lý do có chữ rương/kho báu
        const isTreasureReward = t.type === 'bonus_reward' || 
          (t.title && /rương|kho báu|treasure/i.test(t.title)) ||
          (t.reason && /rương|kho báu|treasure/i.test(t.reason));
        if (isTreasureReward) {
          const amt = Math.max(0, Number(t.amount) || 0);
          currentSpent += amt;
        }
      }
    });
  }

  const remainingBudget = Math.max(0, budget - currentSpent);
  const isBudgetExceeded = currentSpent >= budget;
  const percentUsed = budget > 0 ? Math.min(100, Math.round((currentSpent / budget) * 100)) : 100;

  return {
    monthlyBudget: budget,
    currentSpent,
    remainingBudget,
    isBudgetExceeded,
    percentUsed
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

// Kiểm tra tài khoản có đang sở hữu bất kỳ Gói Hội Viên nào còn hiệu lực không
export function isUserMembershipActive(user) {
  if (!user || user.id === 'guest' || user.role === 'guest') return false;
  if (!user.membership || !user.membership.packageId || user.membership.packageId === 'none') return false;
  if (user.membership.status === 'expired') return false;
  if (user.membership.expiresAt && new Date(user.membership.expiresAt).getTime() <= Date.now()) return false;
  return true;
}

/**
 * Hàm tính tiền thưởng mở rương thống nhất theo 4 Mốc phần thưởng cấu hình:
 * - Chúc may mắn (Rỗng): 0đ | 25%
 * - Thưởng Tối Thiểu (Nhỏ): 1.200đ | 45%
 * - Thưởng Phổ Biến (Vừa): 2.500đ | 25%
 * - Thưởng Tối Đa (Lớn): 12.000đ | 5%
 * Ràng buộc trần ngân sách tháng (remainingBudget): Không vượt quá ngân sách còn lại trong tháng.
 * Áp dụng hạn mức chung cho mọi tài khoản thành viên: 1 rương / ngày (hoặc theo cấu hình dailyLimit trong CMS).
 */
export function calculateTreasureReward(tConfig = null, user = null, remainingBudget = null) {
  // Nếu ngân sách tháng đã hết hoặc bằng 0
  if (remainingBudget !== null && remainingBudget <= 0) {
    return {
      amount: 0,
      isEmpty: true,
      isBudgetExceeded: true,
      label: 'Ngân sách tháng đã hết',
      message: 'Ngân sách thưởng mở rương tháng này đã đạt giới hạn tối đa.'
    };
  }

  // Lấy danh sách 4 mốc phần thưởng từ cấu hình hoặc fallback mặc định
  const tiers = Array.isArray(tConfig?.rewardTiers) && tConfig.rewardTiers.length > 0
    ? tConfig.rewardTiers
    : DEFAULT_TREASURE_REWARD_TIERS;

  // Tính tổng tỷ lệ để chia xác suất chính xác
  const totalWeight = tiers.reduce((sum, t) => sum + Math.max(0, Number(t.percentage) || 0), 0) || 100;
  const roll = Math.random() * totalWeight;

  let cumulative = 0;
  let selectedTier = tiers[0];

  for (const tier of tiers) {
    const weight = Math.max(0, Number(tier.percentage) || 0);
    cumulative += weight;
    if (roll <= cumulative) {
      selectedTier = tier;
      break;
    }
  }

  let finalAmount = Math.max(0, Number(selectedTier.amount) || 0);

  // Ràng buộc không vượt quá ngân sách tháng còn lại
  if (remainingBudget !== null && remainingBudget > 0 && finalAmount > 0) {
    finalAmount = Math.min(finalAmount, remainingBudget);
  }

  const isEmpty = finalAmount <= 0;

  return {
    amount: finalAmount,
    isEmpty,
    tierId: selectedTier.id,
    label: selectedTier.label || (isEmpty ? 'Chúc may mắn (Rỗng)' : 'Thưởng May Mắn')
  };
}

// Lưu lượt nhận thưởng vào Storage
export function recordTreasureClaim(userId, propertyId, propertyTitle, rewardAmount, isMemberBonus = false, extraMeta = {}) {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const current = getDailyClaims(userId);
    const newClaim = {
      propertyId: String(propertyId),
      propertyTitle: propertyTitle || 'Tin đăng BĐS',
      amount: Number(rewardAmount) || 0,
      isEmpty: Boolean(extraMeta?.isEmpty || Number(rewardAmount) <= 0),
      isMemberBonus: Boolean(isMemberBonus),
      timestamp: new Date().toISOString(),
      ...extraMeta
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
