'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import CustomSelect from './CustomSelect';
import { useRealEstate } from '../context/RealEstateContext';

/**
 * ListingTierSelector: Component chuẩn hóa giao diện chọn Loại Tin Đăng 
 * và Thời Hạn Hiển Thị.
 */

// Bảng đơn giá theo từng loại tin & thời hạn (5, 7, 10, 15, 30 ngày cho VIP, 60 ngày cho Tin Thường)
export const LISTING_RATES = {
  'vip-diamond': {
    id: 'vip-diamond',
    name: 'VIP Kim Cương',
    positionDesc: 'Hiển thị trên cùng',
    multiplierText: 'x30',
    tagText: 'lượt liên hệ so với tin thường',
    tagBg: 'bg-red-50 text-red-900 border-red-200',
    tagBadgeBg: 'bg-red-600 text-white',
    approvalBadge: 'Duyệt tức thì (0s)',
    approvalIcon: 'fa-solid fa-bolt',
    approvalColor: 'text-red-800 bg-red-50 border-red-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 32000,
      7: 32000,
      10: 32000,
      15: 32000,  // Base
      30: 24000   // -25%
    }
  },
  'vip-gold': {
    id: 'vip-gold',
    name: 'VIP Vàng',
    positionDesc: 'Dưới VIP Kim Cương',
    multiplierText: 'x15',
    tagText: 'lượt liên hệ so với tin thường',
    tagBg: 'bg-amber-50 text-amber-900 border-amber-200',
    tagBadgeBg: 'bg-amber-800 text-white',
    approvalBadge: 'Duyệt tức thì (0s)',
    approvalIcon: 'fa-solid fa-bolt',
    approvalColor: 'text-amber-900 bg-amber-50 border-amber-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 15000,
      7: 15000,
      10: 15000,
      15: 15000,
      30: 11250   // -25%
    }
  },
  'vip-silver': {
    id: 'vip-silver',
    name: 'VIP Bạc',
    positionDesc: 'Dưới VIP Vàng',
    multiplierText: 'x8',
    tagText: 'lượt liên hệ so với tin thường',
    tagBg: 'bg-teal-50 text-teal-900 border-teal-200',
    tagBadgeBg: 'bg-teal-700 text-white',
    approvalBadge: 'Duyệt tức thì (0s)',
    approvalIcon: 'fa-solid fa-bolt',
    approvalColor: 'text-teal-900 bg-teal-50 border-teal-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 8000,
      7: 8000,
      10: 8000,
      15: 8000,
      30: 6000    // -25%
    }
  },
  'normal': {
    id: 'normal',
    name: 'Tin Thường',
    positionDesc: 'Hiển thị dưới cùng',
    multiplierText: null,
    tagText: null,
    approvalBadge: 'Duyệt tự động (5 - 15 phút)',
    approvalIcon: 'fa-solid fa-clock-rotate-left',
    approvalColor: 'text-slate-800 bg-slate-100 border-slate-200',
    allowedDurations: [60],
    rates: {
      15: 0,   // Base
      30: 0,   // -25%
      60: 0    // Đăng tin thường 60 ngày MIỄN PHÍ (0 đ)
    }
  }
};

/**
 * Tính toán bảng tỷ giá hiển thị động theo cấu hình giá Admin từ vipPackages, paymentConfig và systemConfig
 */
export function getEffectiveListingRates(customVipPackages, paymentConfig = null, systemConfig = null) {
  const result = { ...LISTING_RATES };
  if (!customVipPackages || !Array.isArray(customVipPackages) || customVipPackages.length === 0) {
    return result;
  }
  const approvalTiers = paymentConfig?.approvalTiers;
  const discount30Percent = Number(systemConfig?.discount30DaysPercent ?? paymentConfig?.discount30DaysPercent ?? 25);
  const discount30Multiplier = (100 - discount30Percent) / 100;

  customVipPackages.forEach(pkg => {
    if (!pkg || !pkg.id) return;
    const defaultMeta = LISTING_RATES[pkg.id] || {
      id: pkg.id,
      name: pkg.name || 'Gói VIP',
      positionDesc: '',
      rates: { 5: 10000, 7: 10000, 10: 10000, 15: 10000, 30: 7500, 60: (pkg.id === 'normal' ? 5000 : 7000) }
    };

    const baseDaily = (pkg.pricePerDay !== undefined && pkg.pricePerDay !== null && !isNaN(Number(pkg.pricePerDay)))
      ? Math.max(0, Number(pkg.pricePerDay))
      : (pkg.rates?.[7] !== undefined ? Math.max(0, Number(pkg.rates[7])) : (pkg.rates?.[15] !== undefined ? Math.max(0, Number(pkg.rates[15])) : (defaultMeta.rates?.[15] ?? 3320)));

    let price5, price7, price10, price15, price30, price60;

    if (pkg.id === 'normal') {
      price5 = baseDaily;
      price7 = baseDaily;
      price10 = baseDaily;
      price15 = (pkg.rates?.[15] !== undefined && !isNaN(Number(pkg.rates[15]))) ? Math.max(0, Number(pkg.rates[15])) : baseDaily;
      price30 = (pkg.rates?.[30] !== undefined && !isNaN(Number(pkg.rates[30]))) ? Math.max(0, Number(pkg.rates[30])) : Math.round(baseDaily * discount30Multiplier);
      price60 = (pkg.rates?.[60] !== undefined && !isNaN(Number(pkg.rates[60]))) ? Math.max(0, Number(pkg.rates[60])) : (Number(pkg.publishPrice) || 0);
    } else {
      // Các gói VIP (Kim Cương, Vàng, Bạc):
      price5 = (pkg.rates?.[5] !== undefined && !isNaN(Number(pkg.rates[5]))) ? Math.max(0, Number(pkg.rates[5])) : baseDaily;
      price7 = (pkg.rates?.[7] !== undefined && !isNaN(Number(pkg.rates[7]))) ? Math.max(0, Number(pkg.rates[7])) : baseDaily;
      price10 = (pkg.rates?.[10] !== undefined && !isNaN(Number(pkg.rates[10]))) ? Math.max(0, Number(pkg.rates[10])) : baseDaily;
      price15 = (pkg.rates?.[15] !== undefined && !isNaN(Number(pkg.rates[15]))) ? Math.max(0, Number(pkg.rates[15])) : baseDaily;
      price30 = Math.round(baseDaily * discount30Multiplier);
      price60 = (pkg.rates?.[60] !== undefined && !isNaN(Number(pkg.rates[60]))) ? Math.max(0, Number(pkg.rates[60])) : Math.round(baseDaily * 0.70);
    }

    // Approval badge resolution:
    const tier = approvalTiers?.[pkg.id];
    // VIP Kim Cương, VIP Vàng, VIP Bạc: Luôn là Duyệt tức thì (0s)
    let approvalBadge = 'Duyệt tức thì (0s)';
    let approvalIcon = 'fa-solid fa-bolt';
    let approvalColor = 'text-red-800 bg-red-50 border-red-200';

    if (pkg.id === 'vip-diamond') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-red-800 bg-red-50 border-red-200';
    } else if (pkg.id === 'vip-gold') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-amber-900 bg-amber-50 border-amber-200';
    } else if (pkg.id === 'vip-silver') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-teal-900 bg-teal-50 border-teal-200';
    } else if (pkg.id === 'normal') {
      const min = tier?.delayMinMinutes ?? pkg?.approvalMinMinutes ?? 5;
      const max = tier?.delayMaxMinutes ?? pkg?.approvalMaxMinutes ?? 15;
      approvalBadge = `Duyệt tự động (${min} - ${max} phút)`;
      approvalIcon = 'fa-solid fa-clock-rotate-left';
      approvalColor = 'text-slate-800 bg-slate-100 border-slate-200';
    }

    result[pkg.id] = {
      ...defaultMeta,
      id: pkg.id,
      name: pkg.name || defaultMeta.name,
      shortName: pkg.shortName || defaultMeta.shortName,
      pricePerDay: baseDaily,
      allowedDurations: pkg.id === 'normal'
        ? (Array.isArray(pkg.allowedDurations) && pkg.allowedDurations.length > 0 ? pkg.allowedDurations : [60])
        : [5, 7, 10, 15, 30],
      approvalBadge,
      approvalIcon,
      approvalColor,
      rates: {
        5: price5,
        7: price7,
        10: price10,
        15: price15,
        30: price30,
        60: price60
      }
    };
  });
  return result;
}

// Backward compatibility alias
export const getEffectiveBdsRates = getEffectiveListingRates;

// Component vẽ Icon dải tầng
export function ListingTypeIcon({ type }) {
  if (type === 'vip-diamond') {
    return (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="4.5" rx="2.25" fill="#dc2626" />
        <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="#ef4444" />
        <rect x="2" y="15.5" width="20" height="3" rx="1.5" fill="#f87171" />
      </svg>
    );
  }
  if (type === 'vip-gold') {
    return (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="4.5" rx="2.25" fill="#d97706" />
        <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="#f59e0b" />
        <rect x="2" y="15.5" width="20" height="3" rx="1.5" fill="#fbbf24" />
      </svg>
    );
  }
  if (type === 'vip-silver') {
    return (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="4.5" rx="2.25" fill="#0f766e" />
        <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="#14b8a6" />
        <rect x="2" y="15.5" width="20" height="3" rx="1.5" fill="#2dd4bf" />
      </svg>
    );
  }
  // normal
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="3.5" rx="1.75" fill="#334155" />
      <rect x="2" y="8" width="20" height="2.5" rx="1.25" fill="#64748b" />
      <rect x="2" y="12" width="20" height="2.5" rx="1.25" fill="#94a3b8" />
      <rect x="2" y="16" width="20" height="2.5" rx="1.25" fill="#cbd5e1" />
    </svg>
  );
}

function getTodayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function ListingTierSelector({
  selectedType = 'normal',
  onSelectType,
  selectedDays = 60,
  onSelectDays,
  startDate,
  onStartDateChange,
  scheduleTime = 'now',
  onScheduleTimeChange,
  voucherDiscount = 0,
  appliedVoucher = null,
  showFullSummary = true,
  onApplyAction = null,
  applyActionText = 'Tiếp Tục Đăng Tin',
  customVipPackages = null,
  dailyQuotaInfo = null
}) {
  const realEstateContext = useRealEstate();
  const effectivePackages = customVipPackages || realEstateContext?.vipPackages;
  const paymentConfig = realEstateContext?.paymentConfig;
  const systemConfig = realEstateContext?.systemConfig;
  const ratesConfig = useMemo(() => getEffectiveListingRates(effectivePackages, paymentConfig, systemConfig), [effectivePackages, paymentConfig, systemConfig]);

  const currentUser = realEstateContext?.currentUser;
  const isMembershipActive = realEstateContext?.isMembershipActive;
  const membershipPackages = realEstateContext?.membershipPackages || [];
  const showToast = realEstateContext?.showToast;

  // Cấu hình tính năng Hẹn Giờ Đăng Tin (bật/tắt trong quản trị & phân quyền theo từng gói)
  const enableScheduledPublishing = systemConfig?.enableScheduledPublishing !== false;

  // Lọc ra danh sách các gói hội viên được cấp quyền hẹn giờ đăng tin
  const eligiblePackages = useMemo(() => {
    return (membershipPackages || []).filter(p => Boolean(p.allowScheduledPublishing));
  }, [membershipPackages]);

  const eligiblePackagesText = useMemo(() => {
    if (eligiblePackages.length === 0) return 'Gói Hội Viên được cấp quyền';
    if (eligiblePackages.length <= 2) {
      return eligiblePackages.map(p => p.shortName || p.name).join(' & ');
    }
    return eligiblePackages.map(p => p.shortName || p.name).join(', ');
  }, [eligiblePackages]);

  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : false;
  const userPkgId = currentUser?.membership?.packageId;
  const activeUserPkg = (membershipPackages || []).find(p => p.id === userPkgId);
  const hasEligibleMembership = isMemberActive && Boolean(activeUserPkg?.allowScheduledPublishing);
  const hasScheduleAccess = currentUser?.role === 'admin' || hasEligibleMembership;

  const handleLockedScheduleClick = useCallback(() => {
    if (showToast) {
      showToast(`🔒 Tiện ích Hẹn Giờ Đăng Tin theo khung giờ vàng là đặc quyền độc quyền dành riêng cho ${eligiblePackagesText}. Quý khách vui lòng nâng cấp gói hội viên!`, 'warning');
    }
  }, [showToast, eligiblePackagesText]);

  // Lọc ra danh sách các gói hội viên được cấp quyền chọn ngày bắt đầu tương lai
  const eligibleStartDatePackages = useMemo(() => {
    return (membershipPackages || []).filter(p => Boolean(p.allowFutureStartDate));
  }, [membershipPackages]);

  const eligibleStartDatePackagesText = useMemo(() => {
    if (eligibleStartDatePackages.length === 0) return 'Gói Hội Viên được cấp quyền';
    if (eligibleStartDatePackages.length <= 2) {
      return eligibleStartDatePackages.map(p => p.shortName || p.name).join(' & ');
    }
    return eligibleStartDatePackages.map(p => p.shortName || p.name).join(', ');
  }, [eligibleStartDatePackages]);

  const hasEligibleStartDateMembership = isMemberActive && Boolean(activeUserPkg?.allowFutureStartDate);
  const hasStartDateAccess = currentUser?.role === 'admin' || hasEligibleStartDateMembership;

  const handleLockedStartDateClick = useCallback((e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (showToast) {
      showToast(`🔒 Tiện ích Chọn Ngày Bắt Đầu trong tương lai là đặc quyền dành riêng cho ${eligibleStartDatePackagesText}. Quý khách vui lòng nâng cấp gói hội viên!`, 'warning');
    }
  }, [showToast, eligibleStartDatePackagesText]);

  // Nếu người dùng không có quyền mà scheduleTime khác 'now', tự động đưa về 'now'
  useEffect(() => {
    if (!hasScheduleAccess && scheduleTime && scheduleTime !== 'now' && onScheduleTimeChange) {
      onScheduleTimeChange('now');
    }
  }, [hasScheduleAccess, scheduleTime, onScheduleTimeChange]);

  const scheduleOptions = useMemo(() => [
    { value: 'now', label: '⚡ Đăng ngay bây giờ (Khuyến nghị)', disabled: false },
    { 
      value: '08:00', 
      label: '🌅 Sáng 08:00 (Khung giờ vàng - Đón khách xem tin)', 
      disabled: !hasScheduleAccess, 
      badge: !hasScheduleAccess ? '🔒 Khóa' : 'Vàng',
      onDisabledClick: handleLockedScheduleClick
    },
    { 
      value: '11:30', 
      label: '☀️ Trưa 11:30 (Cao điểm giờ nghỉ trưa tìm kiếm)', 
      disabled: !hasScheduleAccess, 
      badge: !hasScheduleAccess ? '🔒 Khóa' : 'Vàng',
      onDisabledClick: handleLockedScheduleClick
    },
    { 
      value: '14:00', 
      label: '☕ Chiều 14:00 (Thời điểm khảo sát thực địa)', 
      disabled: !hasScheduleAccess, 
      badge: !hasScheduleAccess ? '🔒 Khóa' : 'Vàng',
      onDisabledClick: handleLockedScheduleClick
    },
    { 
      value: '19:30', 
      label: '🌙 Tối 19:30 (Khung giờ vàng chốt cọc sau bữa tối)', 
      disabled: !hasScheduleAccess, 
      badge: !hasScheduleAccess ? '🔒 Khóa' : 'Vàng',
      onDisabledClick: handleLockedScheduleClick
    }
  ], [hasScheduleAccess, handleLockedScheduleClick]);

  const isNormal = selectedType === 'normal';
  const currentConfig = ratesConfig?.[selectedType] || ratesConfig?.['normal'] || LISTING_RATES['normal'];

  // Mức tiết kiệm mốc 30 ngày (đồng bộ trực tiếp từ cấu hình quản trị hệ thống)
  const discount30Percent = Number(systemConfig?.discount30DaysPercent ?? paymentConfig?.discount30DaysPercent ?? 25);

  const todayStr = useMemo(() => getTodayString(), []);
  const todayFormatted = useMemo(() => {
    try {
      const [y, m, d] = todayStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return todayStr;
    }
  }, [todayStr]);

  const initialStartDate = startDate || todayStr;
  const [internalStartDate, setInternalStartDate] = useState(initialStartDate);
  const dateInputRef = useRef(null);

  // Nếu người dùng không có quyền chọn ngày tương lai, bắt buộc ngày bắt đầu luôn là ngày hiện tại
  useEffect(() => {
    if (!hasStartDateAccess) {
      if (internalStartDate !== todayStr) {
        setInternalStartDate(todayStr);
      }
      if (startDate && startDate !== todayStr && onStartDateChange) {
        onStartDateChange(todayStr);
      }
    }
  }, [hasStartDateAccess, todayStr, internalStartDate, startDate, onStartDateChange]);

  // Tính ngày kết thúc
  const endDateFormatted = useMemo(() => {
    try {
      const base = startDate || internalStartDate || todayStr;
      const d = new Date(base);
      if (isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + (selectedDays || (isNormal ? 60 : 7)));
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }, [startDate, internalStartDate, todayStr, selectedDays, isNormal]);

  // Tính ngày kết thúc Tin Thường sau khi được cộng thêm 60 ngày (+60 ngày từ ngày hết VIP)
  const bonusNormalEndDateFormatted = useMemo(() => {
    try {
      if (isNormal) return '';
      const base = startDate || internalStartDate || todayStr;
      const d = new Date(base);
      if (isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + (selectedDays || 7) + 60);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }, [startDate, internalStartDate, todayStr, selectedDays, isNormal]);

  // Vị trí mũi tên tam giác trỏ xuống từ Card được chọn
  const arrowPositionClass = {
    'vip-diamond': 'left-[12.5%]',
    'vip-gold': 'left-[37.5%]',
    'vip-silver': 'left-[62.5%]',
    'normal': 'left-[87.5%]'
  }[selectedType] || 'left-[87.5%]';

  // Lấy các mốc thời gian cho phép hiển thị của gói (VIP: 5, 7, 10, 15, 30 ngày - loại bỏ 60 ngày; Tin Thường: 60 ngày)
  const allowedDurations = useMemo(() => {
    if (isNormal) {
      const raw = currentConfig?.allowedDurations;
      if (Array.isArray(raw) && raw.length > 0) return raw;
      return [60];
    }
    return [5, 7, 10, 15, 30];
  }, [currentConfig?.allowedDurations, isNormal]);

  // Đảm bảo số ngày được chọn luôn nằm trong các mốc cho phép và áp dụng đúng mặc định (7 ngày cho VIP, 60 ngày cho Tin Thường)
  useEffect(() => {
    if (Array.isArray(allowedDurations) && allowedDurations.length > 0 && onSelectDays) {
      if (!allowedDurations.includes(selectedDays)) {
        const defaultDay = isNormal ? 60 : 7;
        const nextDay = allowedDurations.includes(defaultDay) ? defaultDay : allowedDurations[0];
        if (nextDay && nextDay !== selectedDays) {
          onSelectDays(nextDay);
        }
      }
    }
  }, [allowedDurations, selectedDays, onSelectDays, isNormal]);

  const isNormal60 = isNormal && selectedDays === 60;
  const normal60Price = currentConfig?.rates?.[60] !== undefined && !isNaN(Number(currentConfig.rates[60]))
    ? Math.max(0, Number(currentConfig.rates[60]))
    : (Number(currentConfig?.publishPrice) || 0);
  const baseRate = currentConfig?.rates?.[7] ?? currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0;
  const currentDailyRate = isNormal60
    ? Math.round(normal60Price / 60)
    : (currentConfig?.rates?.[selectedDays] ?? currentConfig?.rates?.[7] ?? currentConfig?.pricePerDay ?? 0);
  const grossCost = isNormal60 ? normal60Price : (currentDailyRate * selectedDays);
  const finalCost = Math.max(0, grossCost - voucherDiscount);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* ========================================================
          1. HÀNG 4 THẺ LOẠI TIN ĐĂNG
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        {Object.values(ratesConfig || {}).map((item) => {
          if (!item || !item.id) return null;
          const isSelected = selectedType === item.id;
          const isNormalItem = item.id === 'normal';
          const itemBaseDaily = item?.rates?.[7] ?? item?.rates?.[15] ?? item?.pricePerDay ?? 0;
          const effectiveDailyRate = isSelected
            ? (item?.rates?.[selectedDays] ?? itemBaseDaily)
            : itemBaseDaily;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectType) onSelectType(item.id);
                if (onSelectDays) {
                  if (item.id === 'normal') {
                    onSelectDays(60);
                  } else {
                    onSelectDays(7);
                  }
                }
              }}
              className={`p-4 sm:p-4.5 rounded-2xl flex flex-col justify-between cursor-pointer border-2 transition-all duration-150 relative bg-white ${
                isSelected
                  ? 'border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Icon đầu thẻ */}
                <div className="mb-2">
                  <ListingTypeIcon type={item.id} />
                </div>

                {/* Tiêu đề & mô tả vị trí */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-700 mt-0.5 font-normal">
                  {item.positionDesc}
                </p>

                {/* Cơ chế phê duyệt theo cấp độ tin đăng */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border my-1.5 ${item.approvalColor}`}>
                  <i className={`${item.approvalIcon} text-[9px]`}></i>
                  <span>{item.approvalBadge}</span>
                </div>

                {/* Badge tỷ lệ tiếp cận (nếu có) */}
                {item.multiplierText ? (
                  <div className={`inline-flex items-center rounded-lg overflow-hidden border text-[11px] mb-2 ${item.tagBg}`}>
                    <span className={`font-black px-1.5 py-0.5 text-[10px] ${item.tagBadgeBg}`}>
                      {item.multiplierText}
                    </span>
                    <span className="px-2 py-0.5 font-medium leading-none">
                      {item.tagText}
                    </span>
                  </div>
                ) : (
                  <div className="h-6 mb-2"></div> // Giữ chiều cao đều giữa các thẻ
                )}
              </div>

              {/* Đơn giá niêm yết theo ngày tinh giản */}
              <div className="pt-2 text-sm font-bold tracking-tight">
                {isNormalItem ? (
                  (item?.rates?.[60] === 0) ? (
                    <span className="text-emerald-600 font-extrabold uppercase">Miễn phí</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {(item?.rates?.[60] ?? 5000).toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[11px] text-slate-700 font-normal">/60 ngày</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {effectiveDailyRate.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[11px] text-slate-700 font-normal">/ngày</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          2. KHUNG CHỌN THỜI HẠN VỚI MŨI TÊN TRỎ VÀO THẺ ĐƯỢC CHỌN
         ======================================================== */}
      <div className="relative bg-[#f4f5f7] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
        {/* Mũi tên tam giác chỉ lên thẻ được chọn */}
        <div
          className={`absolute -top-2 w-4 h-4 bg-[#f4f5f7] transform rotate-45 border-l border-t border-slate-200/80 hidden lg:block -translate-x-1/2 transition-[left] duration-150 ease-out ${arrowPositionClass}`}
        ></div>

        {/* Tiêu đề Thời hạn */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          {isNormal ? (
            <div className="flex items-center gap-1.5">
              <span>🎁 Thời hạn hiển thị:</span>
              <span className="text-emerald-700 font-bold">
                {normal60Price === 0 ? '60 ngày miễn phí' : `60 ngày (${normal60Price.toLocaleString('vi-VN')} đ)`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>⚡ Thời hạn hiển thị ({currentConfig?.name}):</span>
            </div>
          )}
          {!isNormal && (
            <span className="text-[11px] font-semibold text-slate-700 hidden sm:inline-block">
              Đăng từ 30 ngày tiết kiệm {discount30Percent}%
            </span>
          )}
        </div>

        {/* Khối lựa chọn thời hạn */}
        {isNormal ? (
          /* Tin Thường: Gọn gàng mốc 60 ngày */
          <div
            onClick={() => onSelectDays && onSelectDays(60)}
            className="p-3 bg-white rounded-xl border-2 border-slate-900 shadow-2xs flex items-center justify-between cursor-pointer transition hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-sm">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-950">60 ngày</span>
                  {normal60Price === 0 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Miễn phí 100%
                    </span>
                  ) : voucherDiscount >= normal60Price ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Hội viên: 0 đ (Voucher)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                      {normal60Price.toLocaleString('vi-VN')} đ / 60 ngày
                    </span>
                  )}
                  {dailyQuotaInfo && !dailyQuotaInfo.unlimited && (
                    <span className="text-[10px] font-semibold text-slate-700">
                      • Còn {dailyQuotaInfo.remaining}/{dailyQuotaInfo.limit} tin hôm nay
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-700">
                  Tin đăng hiển thị tối đa 60 ngày trên toàn sàn
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              {voucherDiscount >= normal60Price && normal60Price > 0 ? (
                <div>
                  <span className="text-xs text-slate-500 line-through mr-1.5">{normal60Price.toLocaleString('vi-VN')} đ</span>
                  <span className="text-sm font-black text-emerald-600">0 đ</span>
                </div>
              ) : (
                <div className="text-sm font-black text-slate-900">
                  {normal60Price === 0 ? '0 đ' : `${normal60Price.toLocaleString('vi-VN')} đ`}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VIP: 5 mốc tinh gọn (5, 7, 10, 15, 30 ngày) */
          <div className="space-y-2.5">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[5, 7, 10, 15, 30].map((days) => {
                const isSelected = selectedDays === days;
                const rate = currentConfig?.rates?.[days] ?? (
                  days === 30
                    ? Math.round((currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0) * (1 - discount30Percent / 100))
                    : (currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0)
                );
                const totalForDuration = rate * days;

                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => onSelectDays && onSelectDays(days)}
                    className={`relative p-2 sm:p-2.5 rounded-xl text-center border-2 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                        : 'bg-white/90 hover:bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {days === 7 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-2xs">
                        Mặc định
                      </span>
                    )}
                    {days === 30 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-800 bg-red-100 border border-red-200 px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-2xs">
                        -{discount30Percent}%
                      </span>
                    )}
                    <div className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                      {days} ngày
                    </div>
                    <div className={`text-xs sm:text-sm font-black mt-0.5 whitespace-nowrap ${isSelected ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {totalForDuration.toLocaleString('vi-VN')} đ
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dòng tóm tắt quyền lợi & tổng tiền tinh giản 1 dòng duy nhất */}
            <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-xs shrink-0">
                  <i className="fa-solid fa-gift"></i>
                </span>
                <span className="text-slate-600">
                  Tặng thêm <strong className="text-emerald-800 font-bold">60 ngày Tin Thường</strong> sau khi hết VIP (Tổng: <strong className="text-slate-900 font-bold">{selectedDays + 60} ngày</strong>)
                </span>
              </div>
              <div className="text-left sm:text-right shrink-0 flex items-baseline gap-1.5 sm:justify-end">
                <span className="text-xs text-slate-700 font-medium">Tổng:</span>
                <span className="text-sm sm:text-base font-black text-emerald-700">
                  {grossCost.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[11px] text-slate-600 font-normal">
                  ({currentDailyRate.toLocaleString('vi-VN')} đ/ng)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          3. HÀNG NGÀY BẮT ĐẦU & HẸN GIỜ ĐĂNG TIN
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Cột 1: Ngày bắt đầu */}
        <div className="space-y-1.5">
          <label 
            htmlFor="bds-start-date"
            onClick={hasStartDateAccess ? () => {
              try {
                dateInputRef.current?.showPicker();
              } catch (err) {}
            } : handleLockedStartDateClick}
            className="block text-xs font-bold text-slate-800 cursor-pointer"
          >
            Ngày bắt đầu
          </label>
          <div 
            onClick={hasStartDateAccess ? () => {
              try {
                dateInputRef.current?.showPicker();
              } catch (err) {}
            } : handleLockedStartDateClick}
            className="relative cursor-pointer"
          >
            <input
              ref={dateInputRef}
              id="bds-start-date"
              type="date"
              min={todayStr}
              max={!hasStartDateAccess ? todayStr : undefined}
              readOnly={!hasStartDateAccess}
              value={startDate || internalStartDate}
              onClick={(e) => {
                if (!hasStartDateAccess) {
                  handleLockedStartDateClick(e);
                  return;
                }
                try {
                  if (typeof e.currentTarget.showPicker === 'function') {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {}
              }}
              onChange={(e) => {
                if (!hasStartDateAccess) return;
                setInternalStartDate(e.target.value);
                if (onStartDateChange) onStartDateChange(e.target.value);
              }}
              className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition ${
                !hasStartDateAccess 
                  ? 'bg-slate-50 text-slate-600 cursor-not-allowed hover:border-slate-400 pr-9' 
                  : 'focus:ring-2 focus:ring-slate-900 cursor-pointer hover:border-slate-400'
              }`}
            />
            {!hasStartDateAccess && (
              <div 
                onClick={handleLockedStartDateClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                title="Đã khóa: Bắt buộc xuất bản ngày hiện tại"
              >
                <i className="fa-solid fa-lock text-xs"></i>
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-700 font-medium">
            {isNormal ? (
              <span>Kết thúc ngày <b className="text-slate-800 font-semibold">{endDateFormatted}</b></span>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5 leading-snug">
                <span>Hết VIP: <b className="text-slate-800 font-semibold">{endDateFormatted}</b></span>
                <span className="text-slate-300">•</span>
                <span>Tin Thường đến: <b className="text-emerald-700 font-semibold">{bonusNormalEndDateFormatted}</b></span>
              </span>
            )}
          </div>
        </div>

        {/* Cột 2: Hẹn giờ đăng tin */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <i className="fa-regular fa-clock text-amber-500"></i>
              <span>Hẹn giờ đăng tin</span>
            </span>
            {enableScheduledPublishing && scheduleTime && scheduleTime !== 'now' && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Lịch: {scheduleTime}</span>
              </span>
            )}
          </label>

          {!enableScheduledPublishing ? (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-slate-600 text-sm shrink-0"></i>
              <span className="text-[11px] leading-tight">Tính năng Hẹn Giờ Đăng Tin đang tạm tắt bởi Ban Quản Trị. Bài viết sẽ xuất bản ngay sau khi duyệt.</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <CustomSelect
                  value={scheduleTime}
                  onChange={(val) => onScheduleTimeChange && onScheduleTimeChange(val)}
                  options={scheduleOptions}
                  placeholder="Chọn khung giờ đăng tin"
                />
              </div>
              <div className="text-[11px] text-slate-700 font-medium">
                <span>Tự động xuất bản đúng khung giờ có lượt tương tác cao nhất</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gộp thông báo đặc quyền Hội Viên gọn gàng cho Ngày Bắt Đầu & Hẹn Giờ Đăng */}
      {(!hasStartDateAccess || !hasScheduleAccess) && (
        <div className="mt-2.5 px-3.5 py-2 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 min-w-0">
            <i className="fa-solid fa-crown text-amber-500 text-xs shrink-0"></i>
            <span className="text-[11px] truncate">
              <b>Hẹn giờ đăng</b> & <b>Chọn ngày tương lai</b> là đặc quyền dành riêng cho <b>Hội Viên</b>
            </span>
          </div>
          <a
            href="/goi-hoi-vien"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 underline"
          >
            <span>Nâng cấp gói hội viên</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </div>
      )}

      {/* ========================================================
          4. HÓA ĐƠN TÓM TẮT DỰ TOÁN (Tùy chọn)
         ======================================================== */}
      {showFullSummary && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-700 font-medium">
              Phân loại: <strong className="text-slate-900">{currentConfig?.name || 'Tin đăng'}</strong> • Thời hạn: <strong className="text-slate-900">{selectedDays} ngày</strong>
              {!isNormal && (
                <span className="text-emerald-700 font-bold ml-1.5">(+60 ngày Tin Thường miễn phí sau khi hết VIP)</span>
              )}
            </div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              Tổng thanh toán: <span className="text-red-600">{finalCost === 0 ? '0 đ (Miễn phí)' : `${finalCost.toLocaleString('vi-VN')} đ`}</span>
              {voucherDiscount > 0 && (
                <span className="text-xs font-normal text-emerald-600 ml-2">
                  (Đã giảm voucher -{voucherDiscount.toLocaleString('vi-VN')} đ)
                </span>
              )}
            </div>
          </div>

          {onApplyAction && (
            <button
              type="button"
              onClick={onApplyAction}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <span>{applyActionText}</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
