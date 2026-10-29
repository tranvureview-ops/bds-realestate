import { normalizePhone } from './authValidation';

/**
 * Đánh giá xem một người dùng F1 có đủ điều kiện là "Lượt giới thiệu Hợp Lệ" (Qualified Referral) hay không.
 * Tiêu chí chống gian lận:
 * 1. Phải kích hoạt tài khoản (Email verified hoặc SMS/Status active)
 * 2. VÀ phải phát sinh ít nhất 1 hành động thực tế:
 *    - Đã đăng ít nhất 01 bài đăng BĐS hợp lệ
 *    - HOẶC Đã hoàn tất eKYC định danh CCCD
 *    - HOẶC Đã phát sinh giao dịch nạp tiền vào ví
 */
export function isReferralQualified(user, properties = [], transactions = []) {
  if (!user || user.role === 'guest' || user.id === 'guest') return false;

  // 1. Phải kích hoạt tài khoản
  const isActive = Boolean(user.status === 'active' || user.emailVerified || user.isVerified);
  if (!isActive) return false;

  // 2. Kiểm tra đã có tin đăng trên sàn
  const hasListing = (properties || []).some(p => {
    if (!p) return false;
    if (p.author?.id && String(p.author.id) === String(user.id)) return true;
    if (p.userId && String(p.userId) === String(user.id)) return true;
    if (p.authorId && String(p.authorId) === String(user.id)) return true;
    if (p.author?.phone && user.phone && normalizePhone(p.author.phone) === normalizePhone(user.phone)) return true;
    return false;
  });
  if (hasListing) return true;

  // 3. Kiểm tra đã xác thực eKYC
  if (user.kycStatus === 'verified' || user.isVerified) return true;

  // 4. Kiểm tra đã phát sinh nạp tiền
  const hasDeposit = (transactions || []).some(t => {
    if (!t) return false;
    return String(t.userId) === String(user.id) && t.type === 'deposit' && t.status === 'success';
  });
  if (hasDeposit) return true;

  return false;
}

/**
 * Lấy danh sách tất cả bạn bè F1 được giới thiệu bởi người dùng này
 */
export function getReferredUsers(referrer, usersList = []) {
  if (!referrer || !referrer.id || referrer.role === 'guest') return [];
  const refPhone = referrer.phone ? normalizePhone(referrer.phone) : '';
  const refCode = referrer.refCode ? String(referrer.refCode).toUpperCase() : '';
  const refId = String(referrer.id);

  return (usersList || []).filter(u => {
    if (!u || u.id === referrer.id) return false;
    const by = u.referredBy ? String(u.referredBy) : '';
    if (!by) return false;
    if (by === refId) return true;
    if (refCode && by.toUpperCase() === refCode) return true;
    if (refPhone && normalizePhone(by) === refPhone) return true;
    return false;
  });
}

/**
 * Trả về chi tiết phân loại và tiến độ Affiliate của một người dùng
 */
export function getAffiliateReport(referrer, usersList = [], properties = [], transactions = []) {
  const referred = getReferredUsers(referrer, usersList);
  const totalReferred = referred.length;

  const qualifiedList = [];
  const pendingList = [];

  referred.forEach(f => {
    const isQual = isReferralQualified(f, properties, transactions);
    const userListingsCount = (properties || []).filter(p => 
      (p.author?.id && String(p.author.id) === String(f.id)) ||
      (p.userId && String(p.userId) === String(f.id)) ||
      (p.authorId && String(p.authorId) === String(f.id)) ||
      (p.author?.phone && f.phone && normalizePhone(p.author.phone) === normalizePhone(f.phone))
    ).length;

    const totalDeposited = (transactions || [])
      .filter(t => String(t.userId) === String(f.id) && t.type === 'deposit' && t.status === 'success')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const record = {
      ...f,
      isQualified: isQual,
      userListingsCount,
      totalDeposited,
      kycDone: Boolean(f.kycStatus === 'verified' || f.isVerified)
    };

    if (isQual) {
      qualifiedList.push(record);
    } else {
      pendingList.push(record);
    }
  });

  return {
    totalReferred,
    qualifiedCount: qualifiedList.length,
    pendingCount: pendingList.length,
    qualifiedList,
    pendingList,
    allReferred: [...qualifiedList, ...pendingList]
  };
}

/**
 * Cấu hình mặc định các mốc thưởng chiêu mộ bạn bè (Milestones)
 * Cho phép quản trị viên tùy chỉnh số lượng bạn bè và số tiền thưởng từng mốc trong CMS
 */
export const DEFAULT_AFFILIATE_MILESTONES = [
  { id: 'mile-1', target: 1, reward: 50000, label: 'Mốc 1: Kết nối 1 bạn bè' },
  { id: 'mile-2', target: 3, reward: 100000, label: 'Mốc 2: Kết nối 3 bạn bè' },
  { id: 'mile-3', target: 5, reward: 150000, label: 'Mốc 3: Kết nối 5 bạn bè' },
  { id: 'mile-4', target: 10, reward: 300000, label: 'Mốc 4: Kết nối 10 bạn bè' }
];

/**
 * Lấy lịch sử các mốc thưởng đã nhận của một người dùng
 */
export function getClaimedMilestones(userId) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`bds_claimed_milestones_${userId || 'guest'}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Đánh dấu một mốc thưởng đã nhận và lưu vào LocalStorage
 */
export function saveClaimedMilestone(userId, milestoneId) {
  if (typeof window === 'undefined') return {};
  try {
    const current = getClaimedMilestones(userId);
    const updated = { ...current, [milestoneId]: new Date().toISOString() };
    localStorage.setItem(`bds_claimed_milestones_${userId || 'guest'}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('bds_milestones_updated', { detail: updated }));
    return updated;
  } catch (e) {
    return {};
  }
}
