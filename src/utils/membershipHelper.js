// Helper functions for Membership Packages and Voucher Feature Synchronization

/**
 * Checks whether a voucher discount is sufficient to cover the base price
 * from "Bảng Giá Tin Đăng".
 * 
 * @param {string} voucherType 'normalPublish' | 'normalBump' | 'vip'
 * @param {number} discount The voucher discount amount
 * @param {Object} options Context info with vipPackages and bumpServicePrice
 * @returns {boolean}
 */
export function isVoucherDiscountFree(voucherType, discount, { vipPackages = [], bumpServicePrice = 10000 } = {}) {
  const d = Number(discount) || 0;
  if (d <= 0) return false;

  if (voucherType === 'normalBump' || voucherType === 'bump') {
    const baseBump = Number(bumpServicePrice) || 10000;
    // When voucher discount equals or exceeds the bump price in Bảng Giá Tin Đăng
    return d >= baseBump;
  }

  if (voucherType === 'normalPublish' || voucherType === 'normal') {
    const normalPkg = (vipPackages || []).find(p => p.id === 'normal');
    const pricePerDay = Number(normalPkg?.pricePerDay) || 0;
    const publishPrice = Number(normalPkg?.publishPrice) || 35000;

    // 1) When discount matches/exceeds the listing price per day configured in Bảng Giá Tin Đăng (e.g. 5000 >= 5000)
    if (pricePerDay > 0 && d >= pricePerDay) return true;
    // 2) Or discount matches/exceeds standard publish price (e.g. 35000 >= 35000)
    if (d >= publishPrice) return true;
    // 3) Or normal package is explicitly set as 0 đ (free)
    if (normalPkg && pricePerDay === 0) return true;
    return false;
  }

  if (voucherType === 'vip') {
    return false;
  }

  return false;
}

/**
 * Formats a voucher discount for display.
 * Returns "Miễn Phí" when discount covers base price in Bảng Giá Tin Đăng,
 * otherwise formatted as "-{discount} {unit}".
 */
export function formatVoucherDiscountDisplay(voucherType, discount, options = {}, unit = 'đ/lần') {
  const d = Number(discount) || 0;
  if (d <= 0) return '0 đ';
  if (isVoucherDiscountFree(voucherType, d, options)) {
    return 'Miễn Phí';
  }
  return `-${d.toLocaleString('vi-VN')} ${unit}`;
}

/**
 * Short discount format for tables or compact cards (e.g. "Miễn Phí" or "-35k").
 */
export function formatVoucherDiscountShort(voucherType, discount, options = {}) {
  const d = Number(discount) || 0;
  if (d <= 0) return '';
  if (isVoucherDiscountFree(voucherType, d, options)) {
    return 'Miễn Phí';
  }
  if (d >= 1000) {
    const k = d / 1000;
    return `-${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `-${d}đ`;
}

/**
 * Resolves package features dynamically so voucher counts and discount values
 * always reflect the current vouchersPerCycle data.
 * 
 * @param {Object} pkg The membership package object
 * @param {Object} options Context options (vipPackages, bumpServicePrice)
 * @returns {string[]} Array of resolved feature strings
 */
export function getResolvedFeatures(pkg, options = {}) {
  if (!pkg) return [];
  const v = pkg.vouchersPerCycle || {};
  const pubCount = v.normalPublishVouchers ?? 0;
  const rawPubDiscount = v.normalPublishDiscount ?? 35000;
  const isPubFree = isVoucherDiscountFree('normalPublish', rawPubDiscount, options);
  const pubDiscount = Number(rawPubDiscount).toLocaleString('vi-VN');

  const bumpCount = v.normalBumpVouchers ?? 0;
  const rawBumpDiscount = v.normalBumpDiscount ?? 10000;
  const isBumpFree = isVoucherDiscountFree('normalBump', rawBumpDiscount, options);
  const bumpDiscount = Number(rawBumpDiscount).toLocaleString('vi-VN');

  const vipCount = v.vipVouchers ?? 0;
  const vipDiscount = Number(v.vipDiscount ?? 400000).toLocaleString('vi-VN');

  const rawFeatures = Array.isArray(pkg.features) ? pkg.features : [];

  return rawFeatures.map(feat => {
    if (typeof feat !== 'string') return feat;
    // Normal Publish Voucher line
    if (/voucher.*đăng tin thường/i.test(feat)) {
      if (pubCount <= 0) return null;
      return isPubFree
        ? `${pubCount} voucher Đăng Tin Thường Miễn Phí (mỗi chu kỳ 30 ngày)`
        : `${pubCount} voucher giảm ${pubDiscount} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`;
    }
    // Normal Bump Voucher line
    if (/voucher.*đẩy tin( thường)?/i.test(feat)) {
      if (bumpCount <= 0) return null;
      return isBumpFree
        ? `${bumpCount} voucher Đẩy Tin Miễn Phí (mỗi chu kỳ 30 ngày)`
        : `${bumpCount} voucher giảm ${bumpDiscount} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`;
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
 * @param {Object} options Context options (vipPackages, bumpServicePrice)
 * @returns {string[]} Updated features array
 */
export function syncFeaturesWithVouchers(features = [], vouchers = {}, options = {}) {
  const pubCount = vouchers?.normalPublishVouchers ?? 0;
  const rawPubDiscount = vouchers?.normalPublishDiscount ?? 35000;
  const isPubFree = isVoucherDiscountFree('normalPublish', rawPubDiscount, options);
  const pubDiscount = Number(rawPubDiscount).toLocaleString('vi-VN');

  const bumpCount = vouchers?.normalBumpVouchers ?? 0;
  const rawBumpDiscount = vouchers?.normalBumpDiscount ?? 10000;
  const isBumpFree = isVoucherDiscountFree('normalBump', rawBumpDiscount, options);
  const bumpDiscount = Number(rawBumpDiscount).toLocaleString('vi-VN');

  const vipCount = vouchers?.vipVouchers ?? 0;
  const vipDiscount = Number(vouchers?.vipDiscount ?? 400000).toLocaleString('vi-VN');

  const rawFeatures = Array.isArray(features) ? [...features] : [];

  let hasPub = false;
  let hasBump = false;
  let hasVip = false;

  const pubFeatureText = isPubFree
    ? `${pubCount} voucher Đăng Tin Thường Miễn Phí (mỗi chu kỳ 30 ngày)`
    : `${pubCount} voucher giảm ${pubDiscount} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`;

  const bumpFeatureText = isBumpFree
    ? `${bumpCount} voucher Đẩy Tin Miễn Phí (mỗi chu kỳ 30 ngày)`
    : `${bumpCount} voucher giảm ${bumpDiscount} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`;

  const vipFeatureText = `${vipCount} voucher giảm ${vipDiscount} đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)`;

  const updated = rawFeatures.map(feat => {
    if (typeof feat !== 'string') return feat;
    if (/voucher.*đăng tin thường/i.test(feat)) {
      hasPub = true;
      return pubCount > 0 ? pubFeatureText : null;
    }
    if (/voucher.*đẩy tin( thường)?/i.test(feat)) {
      hasBump = true;
      return bumpCount > 0 ? bumpFeatureText : null;
    }
    if (/voucher.*tin vip/i.test(feat)) {
      hasVip = true;
      return vipCount > 0 ? vipFeatureText : null;
    }
    return feat;
  }).filter(Boolean);

  // If the package didn't have these voucher lines, prepend them if count > 0
  const additions = [];
  if (!hasPub && pubCount > 0) {
    additions.push(pubFeatureText);
  }
  if (!hasBump && bumpCount > 0) {
    additions.push(bumpFeatureText);
  }
  if (!hasVip && vipCount > 0) {
    additions.push(vipFeatureText);
  }

  return [...additions, ...updated];
}
