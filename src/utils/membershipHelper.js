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
    const rate60 = Number(normalPkg?.rates?.[60] !== undefined && normalPkg.rates[60] !== 0 ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 5000));
    const effectiveNormalRate = (normalPkg?.rates?.[60] === 0) ? 0 : rate60;

    // 1) Nếu Tin Thường đang miễn phí ở Client (mốc 60 ngày = 0 đ)
    if (effectiveNormalRate === 0) return true;
    // 2) Khi voucher discount >= đơn giá Tin Thường cấu hình trong Bảng Giá Tin Đăng
    if (effectiveNormalRate > 0 && d >= effectiveNormalRate) return true;
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
  const normalPkg = (options.vipPackages || []).find(p => p.id === 'normal');
  const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined && normalPkg.rates[60] !== 0 ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 5000));
  const rawPubDiscount = v.normalPublishDiscount ?? defaultNormalPrice;
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
  const normalPkg = (options.vipPackages || []).find(p => p.id === 'normal');
  const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined && normalPkg.rates[60] !== 0 ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 5000));
  const rawPubDiscount = vouchers?.normalPublishDiscount ?? defaultNormalPrice;
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

/**
 * Calculates the discount percentage of a specific package for a given cycle (3 or 6 months).
 * 
 * @param {Object} pkg Membership package object
 * @param {number} months 3 or 6
 * @returns {number} Percentage discount (e.g. 10, 15, 20)
 */
export function getPackageCycleDiscount(pkg, months = 3) {
  if (!pkg) return 0;
  const rawCycle = (pkg.billingCycles || []).find(c => c.months === months);
  // 1. Explicit discount field
  if (rawCycle && typeof rawCycle.discount === 'number' && rawCycle.discount > 0) {
    return rawCycle.discount;
  }
  // 2. Note field (e.g. "Tiết kiệm thêm 15%" -> 15)
  if (rawCycle && typeof rawCycle.note === 'string') {
    const match = rawCycle.note.match(/(\d+)%/);
    if (match) return parseInt(match[1], 10);
  }
  // 3. Mathematical calculation based on monthlyPrice vs cycle.price
  const monthlyPrice = Number(pkg.monthlyPrice) || (rawCycle?.months === 1 ? rawCycle.price : 0);
  const cyclePrice = Number(rawCycle?.price) || 0;
  if (monthlyPrice > 0 && cyclePrice > 0 && months > 1) {
    const baseTotal = monthlyPrice * months;
    if (baseTotal > cyclePrice) {
      return Math.round(((baseTotal - cyclePrice) / baseTotal) * 100);
    }
  }
  return months === 3 ? 5 : months === 6 ? 10 : 0;
}

/**
 * Calculates the average discount percentage across all packages for a cycle (e.g. average of 3 packages for 3 months).
 * 
 * @param {Array} packages Array of membership packages
 * @param {number} months 3 or 6
 * @returns {number} Average percentage rounded to integer (e.g. 15 for 3 months)
 */
export function getAverageCycleDiscount(packages = [], months = 3) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return months === 3 ? 5 : months === 6 ? 10 : 0;
  }
  const discounts = packages.map(p => getPackageCycleDiscount(p, months));
  const sum = discounts.reduce((acc, v) => acc + v, 0);
  return Math.round(sum / discounts.length);
}

/**
 * Gets the save percentage of the Standard Package (Gói Tiêu Chuẩn),
 * with fallback to recommended package or 33%.
 * 
 * @param {Array} packages Array of membership packages
 * @returns {number} Save percentage (e.g. 33)
 */
export function getStandardPackageSavePercent(packages = []) {
  if (!Array.isArray(packages) || packages.length === 0) return 33;
  const standardPkg = packages.find(p => p.id === 'member-standard') 
    || packages.find(p => p.recommended) 
    || packages[1] 
    || packages[0];
  return Number(standardPkg?.savePercent) || 33;
}

/**
 * Gets the save percentage of the Premium Package (Gói Cao Cấp),
 * with fallback to the highest savePercent or 39%.
 * 
 * @param {Array} packages Array of membership packages
 * @returns {number} Save percentage (e.g. 39)
 */
export function getPremiumPackageSavePercent(packages = []) {
  if (!Array.isArray(packages) || packages.length === 0) return 39;
  const premiumPkg = packages.find(p => p.id === 'member-premium') 
    || packages.find(p => p.id?.includes('premium') || p.name?.toLowerCase().includes('cao cấp'))
    || packages[packages.length - 1];
  return Number(premiumPkg?.savePercent) || 39;
}

/**
 * Bộ câu hỏi thường gặp chuẩn AIO/FAQPage dùng chung giữa SSR JSON-LD và DOM Client.
 */
export const MEMBERSHIP_FAQS = [
  {
    q: '1. Kho voucher của Gói Hội Viên được cấp và khấu trừ như thế nào?',
    a: 'Ngay sau khi thanh toán đăng ký gói thành công, toàn bộ voucher Đăng tin thường, Đẩy tin và Giảm giá tin VIP được cộng ngay vào kho cá nhân. Khi đăng tin hoặc đẩy tin, hệ thống tự động gợi ý áp dụng voucher để giảm trừ trực tiếp về 0 đ hoặc theo đúng hạn mức gói.'
  },
  {
    q: '2. Mua gói 3 tháng hoặc 6 tháng thì voucher được cấp thành mấy đợt?',
    a: 'Theo quy chế hội viên trên Kênh Nhà Đất 24H, hạn mức voucher được cấp mới định kỳ mỗi 30 ngày một lần để tránh tồn đọng lãng phí. Gói 3 tháng sẽ được cấp đủ 3 đợt (90 ngày), gói 6 tháng cấp đủ 6 đợt (180 ngày) và được giảm thêm từ 10% đến 30% tổng chi phí.'
  },
  {
    q: '3. Voucher chưa dùng hết trong chu kỳ 30 ngày có được cộng dồn sang tháng sau không?',
    a: 'Không. Nhằm duy trì mật độ đăng tin đều đặn giúp tài khoản môi giới tăng điểm uy tín, kho voucher được làm mới (reset) theo từng chu kỳ 30 ngày. Vì vậy, bạn nên tận dụng hết lượt đẩy tin trong chu kỳ để tối ưu hóa hiển thị.'
  },
  {
    q: '4. Tôi có thể nâng cấp hoặc đổi sang gói khác khi gói cũ còn hạn không?',
    a: 'Để đảm bảo tính nhất quán khi đối soát kho voucher theo chu kỳ 30 ngày, hệ thống chỉ cho phép gia hạn đúng gói đang hoạt động khi gói còn hạn. Sau khi chu kỳ hiện tại hết hạn, bạn có thể tự do chuyển sang bất kỳ gói Hội Viên nào khác.'
  },
  {
    q: '5. Quyền lợi Tin Nổi Bật (Săn Kho Báu BĐS) và Dự Đoán Giá BĐS hoạt động ra sao?',
    a: 'Hội viên từ Gói Tiêu Chuẩn trở lên được đặc quyền gắn các tin bất động sản chất lượng vào mục Tin Nổi Bật Săn Kho Báu BĐS (15 ngày/lần), tăng lượt mở rương kho báu mỗi ngày và tham gia Dự đoán giá BĐS chia thưởng cùng cộng đồng.'
  },
  {
    q: '6. Môi giới mới hoặc chủ nhà đăng ít tin nên chọn Gói Hội Viên nào để tiết kiệm nhất?',
    a: 'Nếu bạn có giỏ hàng dưới 30 tin/tháng, Gói Cơ Bản (299.000 đ/tháng) đã đáp ứng tốt nhu cầu duy trì đẩy tin hàng ngày. Nếu quản lý từ 30 đến 60 tin và cần gắn Tin Nổi Bật, Gói Tiêu Chuẩn (599.000 đ/tháng) mang lại hiệu quả ROI cao nhất.'
  }
];


