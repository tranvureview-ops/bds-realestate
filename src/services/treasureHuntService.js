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

// Kiểm tra tài khoản có đang sở hữu bất kỳ Gói Hội Viên nào còn hiệu lực không
export function isUserMembershipActive(user) {
  if (!user || user.id === 'guest' || user.role === 'guest') return false;
  if (!user.membership || !user.membership.packageId || user.membership.packageId === 'none') return false;
  if (user.membership.status === 'expired') return false;
  if (user.membership.expiresAt && new Date(user.membership.expiresAt).getTime() <= Date.now()) return false;
  return true;
}

/**
 * Hàm tính ngẫu nhiên tiền thưởng mở rương:
 * - Người KHÔNG mua gói: Nhận tiền theo tỷ lệ cơ bản (chủ yếu tập trung ở mốc tiền phổ thông).
 * - Người CÓ MUA BẤT KỲ GÓI HỘI VIÊN NÀO:
 *   + Tỷ lệ giá trị tiền cao hơn rõ rệt (mức tối thiểu cao hơn & 80% cơ hội trúng các mốc tiền lớn nhất).
 */
export function calculateTreasureReward(tConfig = null, user = null, isMemberExplicit = null) {
  const isMember = typeof isMemberExplicit === 'boolean' 
    ? isMemberExplicit 
    : isUserMembershipActive(user);

  let baseMin = 2000;
  let baseMax = 20000;

  if (tConfig && typeof tConfig === 'object') {
    if (tConfig.minAmount !== undefined) baseMin = Math.max(1000, Number(tConfig.minAmount) || 2000);
    if (tConfig.maxAmount !== undefined) baseMax = Math.max(baseMin, Number(tConfig.maxAmount) || 20000);
  }

  const step = 1000;

  // 1. Trường hợp: Người dùng CÓ MUA BẤT KỲ GÓI HỘI VIÊN NÀO
  if (isMember) {
    let memberMin = tConfig?.memberMinAmount !== undefined
      ? Math.max(baseMin, Number(tConfig.memberMinAmount) || 8000)
      : Math.max(baseMin, Math.min(baseMax, 8000));

    let memberMax = tConfig?.memberMaxAmount !== undefined
      ? Math.max(memberMin, Number(tConfig.memberMaxAmount) || baseMax)
      : baseMax;

    if (memberMin > memberMax) memberMin = memberMax;

    // Tỷ lệ trúng mốc tiền cao (High Tier Chance, mặc định 80%)
    const highTierChance = Number(tConfig?.memberHighTierChance ?? 80);
    const isHighTierRoll = Math.random() * 100 < highTierChance;

    let selectedAmount = memberMin;

    if (isHighTierRoll) {
      // 80% cơ hội trúng thưởng ở khoảng cao nhất (từ 65% đến 100% của khoảng memberMin -> memberMax)
      const highCutoff = memberMin + Math.floor((memberMax - memberMin) * 0.65 / step) * step;
      const highSteps = Math.floor((memberMax - highCutoff) / step);
      selectedAmount = highSteps > 0
        ? highCutoff + Math.floor(Math.random() * (highSteps + 1)) * step
        : memberMax;
    } else {
      // 20% cơ hội rơi ngẫu nhiên trong toàn dải của Hội Viên
      const totalSteps = Math.floor((memberMax - memberMin) / step);
      selectedAmount = totalSteps > 0
        ? memberMin + Math.floor(Math.random() * (totalSteps + 1)) * step
        : memberMin;
    }

    selectedAmount = Math.round(selectedAmount / step) * step;

    return {
      amount: selectedAmount,
      isMemberBonus: true,
      memberPackageName: user?.membership?.packageName || 'Hội Viên VIP',
      label: 'Rương Đặc Quyền Hội Viên',
      minPossible: memberMin,
      maxPossible: memberMax
    };
  }

  // 2. Trường hợp: Người dùng KHÔNG mua gói hội viên (Người thường / Khách)
  // Tỷ lệ phân phối lệch về các mốc tiền nhỏ (75% rơi vào nửa dưới)
  const isLowerTierRoll = Math.random() * 100 < 75;
  let selectedAmount = baseMin;

  if (isLowerTierRoll) {
    // 75% cơ hội rơi vào mốc nhỏ (từ baseMin đến 45% của khoảng thưởng)
    const lowerMax = baseMin + Math.floor((baseMax - baseMin) * 0.45 / step) * step;
    const lowerSteps = Math.floor((lowerMax - baseMin) / step);
    selectedAmount = lowerSteps > 0
      ? baseMin + Math.floor(Math.random() * (lowerSteps + 1)) * step
      : baseMin;
  } else {
    // 25% cơ hội may mắn rơi vào nửa trên
    const upperMin = baseMin + Math.floor((baseMax - baseMin) * 0.45 / step) * step;
    const upperSteps = Math.floor((baseMax - upperMin) / step);
    selectedAmount = upperSteps > 0
      ? upperMin + Math.floor(Math.random() * (upperSteps + 1)) * step
      : baseMax;
  }

  selectedAmount = Math.round(selectedAmount / step) * step;

  return {
    amount: selectedAmount,
    isMemberBonus: false,
    label: 'Rương May Mắn',
    minPossible: baseMin,
    maxPossible: baseMax
  };
}

// Lưu lượt nhận thưởng vào Storage
export function recordTreasureClaim(userId, propertyId, propertyTitle, rewardAmount, isMemberBonus = false) {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const current = getDailyClaims(userId);
    const newClaim = {
      propertyId: String(propertyId),
      propertyTitle: propertyTitle || 'Tin đăng BĐS',
      amount: rewardAmount,
      isMemberBonus: Boolean(isMemberBonus),
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
