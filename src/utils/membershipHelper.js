// Helper functions for Membership Packages and Voucher Feature Synchronization

/**
 * Resolves package features dynamically so voucher counts and discount values
 * always reflect the current vouchersPerCycle data.
 * 
 * @param {Object} pkg The membership package object
 * @returns {string[]} Array of resolved feature strings
 */
export function getResolvedFeatures(pkg) {
  if (!pkg) return [];
  const v = pkg.vouchersPerCycle || {};
  const pubCount = v.normalPublishVouchers ?? 0;
  const pubDiscount = Number(v.normalPublishDiscount ?? 35000).toLocaleString('vi-VN');
  const bumpCount = v.normalBumpVouchers ?? 0;
  const bumpDiscount = Number(v.normalBumpDiscount ?? 10000).toLocaleString('vi-VN');
  const vipCount = v.vipVouchers ?? 0;
  const vipDiscount = Number(v.vipDiscount ?? 400000).toLocaleString('vi-VN');

  const rawFeatures = Array.isArray(pkg.features) ? pkg.features : [];

  return rawFeatures.map(feat => {
    if (typeof feat !== 'string') return feat;
    // Normal Publish Voucher line
    if (/voucher.*đăng tin thường/i.test(feat)) {
      return `${pubCount} voucher giảm ${pubDiscount} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`;
    }
    // Normal Bump Voucher line
    if (/voucher.*đẩy tin( thường)?/i.test(feat)) {
      return `${bumpCount} voucher giảm ${bumpDiscount} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`;
    }
    // VIP Voucher line
    if (/voucher.*tin vip/i.test(feat)) {
      if (vipCount > 0) {
        return `${vipCount} voucher giảm ${vipDiscount} đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)`;
      }
      return null; // Omit if 0 VIP vouchers
    }
    return feat;
  }).filter(Boolean);
}

/**
 * Synchronizes a list of feature strings with the given vouchersPerCycle configuration.
 * Used when saving or updating membership packages in Admin.
 * 
 * @param {string[]} features Array of feature strings
 * @param {Object} vouchers The vouchersPerCycle object
 * @returns {string[]} Updated features array
 */
export function syncFeaturesWithVouchers(features = [], vouchers = {}) {
  const pubCount = vouchers?.normalPublishVouchers ?? 0;
  const pubDiscount = Number(vouchers?.normalPublishDiscount ?? 35000).toLocaleString('vi-VN');
  const bumpCount = vouchers?.normalBumpVouchers ?? 0;
  const bumpDiscount = Number(vouchers?.normalBumpDiscount ?? 10000).toLocaleString('vi-VN');
  const vipCount = vouchers?.vipVouchers ?? 0;
  const vipDiscount = Number(vouchers?.vipDiscount ?? 400000).toLocaleString('vi-VN');

  const rawFeatures = Array.isArray(features) ? [...features] : [];

  let hasPub = false;
  let hasBump = false;
  let hasVip = false;

  const updated = rawFeatures.map(feat => {
    if (typeof feat !== 'string') return feat;
    if (/voucher.*đăng tin thường/i.test(feat)) {
      hasPub = true;
      return `${pubCount} voucher giảm ${pubDiscount} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`;
    }
    if (/voucher.*đẩy tin( thường)?/i.test(feat)) {
      hasBump = true;
      return `${bumpCount} voucher giảm ${bumpDiscount} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`;
    }
    if (/voucher.*tin vip/i.test(feat)) {
      hasVip = true;
      if (vipCount > 0) {
        return `${vipCount} voucher giảm ${vipDiscount} đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)`;
      }
      return null;
    }
    return feat;
  }).filter(Boolean);

  // If the package didn't have these voucher lines, prepend them if count > 0
  const additions = [];
  if (!hasPub && pubCount > 0) {
    additions.push(`${pubCount} voucher giảm ${pubDiscount} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`);
  }
  if (!hasBump && bumpCount > 0) {
    additions.push(`${bumpCount} voucher giảm ${bumpDiscount} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`);
  }
  if (!hasVip && vipCount > 0) {
    additions.push(`${vipCount} voucher giảm ${vipDiscount} đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)`);
  }

  return [...additions, ...updated];
}
