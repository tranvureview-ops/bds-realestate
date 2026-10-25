'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import CustomSelect from './CustomSelect';
import { useRealEstate } from '../context/RealEstateContext';

/**
 * BatdongsanListingSelector: Component chuẩn hóa giao diện chọn Loại Tin Đăng 
 * và Thời Hạn Hiển Thị theo đúng 100% UI thực tế của Batdongsan.com.vn.
 */

// Bảng đơn giá chuẩn Batdongsan.com.vn theo từng loại tin & thời hạn (5, 7, 10, 15, 30 ngày cho VIP, 60 ngày cho Tin Thường)
export const BATDONGSAN_RATES = {
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
    approvalColor: 'text-red-600 bg-red-50 border-red-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 79000,
      7: 79000,
      10: 79000,
      15: 79000,  // Base
      30: 59250   // -25%
    }
  },
  'vip-gold': {
    id: 'vip-gold',
    name: 'VIP Vàng',
    positionDesc: 'Dưới VIP Kim Cương',
    multiplierText: 'x15',
    tagText: 'lượt liên hệ so với tin thường',
    tagBg: 'bg-amber-50 text-amber-900 border-amber-200',
    tagBadgeBg: 'bg-amber-600 text-white',
    approvalBadge: 'Duyệt tức thì (0s)',
    approvalIcon: 'fa-solid fa-bolt',
    approvalColor: 'text-amber-700 bg-amber-50 border-amber-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 29000,
      7: 29000,
      10: 29000,
      15: 29000,
      30: 21750   // -25%
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
    approvalColor: 'text-teal-700 bg-teal-50 border-teal-200',
    allowedDurations: [5, 7, 10, 15, 30],
    rates: {
      5: 9000,
      7: 9000,
      10: 9000,
      15: 9000,
      30: 6750    // -25%
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
    approvalColor: 'text-slate-600 bg-slate-100 border-slate-200',
    allowedDurations: [60],
    rates: {
      15: 3320,   // Base
      30: 2490,   // -25%
      60: 0       // Miễn phí
    }
  }
};

/**
 * Tính toán bảng tỷ giá hiển thị động theo cấu hình giá Admin từ vipPackages và paymentConfig
 */
export function getEffectiveBdsRates(customVipPackages, paymentConfig = null) {
  const result = { ...BATDONGSAN_RATES };
  if (!customVipPackages || !Array.isArray(customVipPackages) || customVipPackages.length === 0) {
    return result;
  }
  const approvalTiers = paymentConfig?.approvalTiers;

  customVipPackages.forEach(pkg => {
    if (!pkg || !pkg.id) return;
    const defaultMeta = BATDONGSAN_RATES[pkg.id] || {
      id: pkg.id,
      name: pkg.name || 'Gói VIP',
      positionDesc: '',
      rates: { 5: 10000, 7: 10000, 10: 10000, 15: 10000, 30: 7500, 60: 0 }
    };

    const rawRate15 = pkg.rates?.[15] !== undefined ? pkg.rates[15] : pkg.pricePerDay;
    const price15 = (rawRate15 !== undefined && rawRate15 !== null && rawRate15 !== '' && !isNaN(Number(rawRate15)))
      ? Math.max(0, Number(rawRate15))
      : (defaultMeta.rates?.[15] ?? 3320);

    const price5 = pkg.rates?.[5] !== undefined ? Math.max(0, Number(pkg.rates[5])) : price15;
    const price7 = pkg.rates?.[7] !== undefined ? Math.max(0, Number(pkg.rates[7])) : price15;
    const price10 = pkg.rates?.[10] !== undefined ? Math.max(0, Number(pkg.rates[10])) : price15;

    const rawRate30 = pkg.rates?.[30];
    const price30 = (rawRate30 !== undefined && rawRate30 !== null && rawRate30 !== '' && !isNaN(Number(rawRate30)))
      ? Math.max(0, Number(rawRate30))
      : ((price15 === 0) ? 0 : Math.round(price15 * 0.75));

    const rawRate60 = pkg.rates?.[60];
    const price60 = (rawRate60 !== undefined && rawRate60 !== null && rawRate60 !== '' && !isNaN(Number(rawRate60)))
      ? Math.max(0, Number(rawRate60))
      : ((price15 === 0) ? 0 : Math.round(price15 * 0.70));

    // Approval badge resolution:
    const tier = approvalTiers?.[pkg.id];
    // VIP Kim Cương, VIP Vàng, VIP Bạc: Luôn là Duyệt tức thì (0s)
    let approvalBadge = 'Duyệt tức thì (0s)';
    let approvalIcon = 'fa-solid fa-bolt';
    let approvalColor = 'text-red-600 bg-red-50 border-red-200';

    if (pkg.id === 'vip-diamond') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-red-600 bg-red-50 border-red-200';
    } else if (pkg.id === 'vip-gold') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (pkg.id === 'vip-silver') {
      approvalBadge = 'Duyệt tức thì (0s)';
      approvalIcon = 'fa-solid fa-bolt';
      approvalColor = 'text-teal-700 bg-teal-50 border-teal-200';
    } else if (pkg.id === 'normal') {
      const min = tier?.delayMinMinutes ?? pkg?.approvalMinMinutes ?? 5;
      const max = tier?.delayMaxMinutes ?? pkg?.approvalMaxMinutes ?? 15;
      approvalBadge = `Duyệt tự động (${min} - ${max} phút)`;
      approvalIcon = 'fa-solid fa-clock-rotate-left';
      approvalColor = 'text-slate-600 bg-slate-100 border-slate-200';
    }

    result[pkg.id] = {
      ...defaultMeta,
      id: pkg.id,
      name: pkg.name || defaultMeta.name,
      shortName: pkg.shortName || defaultMeta.shortName,
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

// Component vẽ Icon dải tầng chuẩn của Batdongsan.com.vn
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

export default function BatdongsanListingSelector({
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
  customVipPackages = null
}) {
  const realEstateContext = useRealEstate();
  const effectivePackages = customVipPackages || realEstateContext?.vipPackages;
  const paymentConfig = realEstateContext?.paymentConfig;
  const ratesConfig = useMemo(() => getEffectiveBdsRates(effectivePackages, paymentConfig), [effectivePackages, paymentConfig]);

  const isNormal = selectedType === 'normal';
  const currentConfig = ratesConfig?.[selectedType] || ratesConfig?.['normal'] || BATDONGSAN_RATES['normal'];

  const todayStr = useMemo(() => getTodayString(), []);
  const initialStartDate = startDate || todayStr;
  const [internalStartDate, setInternalStartDate] = useState(initialStartDate);
  const dateInputRef = useRef(null);

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

  const baseRate = currentConfig?.rates?.[7] ?? currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0;
  const currentDailyRate = currentConfig?.rates?.[selectedDays] ?? currentConfig?.rates?.[7] ?? currentConfig?.pricePerDay ?? 0;
  const grossCost = currentDailyRate * selectedDays;
  const finalCost = Math.max(0, grossCost - voucherDiscount);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* ========================================================
          1. HÀNG 4 THẺ LOẠI TIN ĐĂNG (CHUẨN ẢNH BATDONGSAN.COM.VN)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        {Object.values(ratesConfig || {}).map((item) => {
          if (!item || !item.id) return null;
          const isSelected = selectedType === item.id;
          // Giá hiển thị trên card: Tin Thường hiển thị theo 60 ngày (0 đ / Miễn phí), VIP hiển thị theo selectedDays hoặc 7 ngày mặc định
          const daysForCard = item.id === 'normal' ? 60 : (selectedDays || 7);
          const cardDailyRate = item?.rates?.[daysForCard] ?? item?.rates?.[7] ?? item?.rates?.[15] ?? 0;

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
              className={`p-5 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-150 relative bg-white ${
                isSelected
                  ? 'border-2 border-slate-900 shadow-md ring-1 ring-slate-900/10'
                  : 'border border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Icon đầu thẻ */}
                <div className="mb-2">
                  <ListingTypeIcon type={item.id} />
                </div>

                {/* Tiêu đề & mô tả vị trí */}
                <h3 className="text-base font-bold text-slate-900">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
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

              {/* Đơn giá theo ngày */}
              <div className="pt-2 text-sm font-bold text-slate-900 tracking-tight">
                {cardDailyRate === 0 ? (
                  <span className="text-emerald-600 font-extrabold uppercase">Miễn phí</span>
                ) : (
                  `${cardDailyRate.toLocaleString('vi-VN')} đ/ngày`
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          2. KHUNG CHỌN THỜI HẠN VỚI MŨI TÊN TRỎ VÀO THẺ ĐƯỢC CHỌN
         ======================================================== */}
      <div className="relative bg-[#f4f5f7] p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
        {/* Mũi tên tam giác chỉ lên thẻ được chọn */}
        <div
          className={`absolute -top-2 w-4 h-4 bg-[#f4f5f7] transform rotate-45 border-l border-t border-slate-200/80 hidden lg:block -translate-x-1/2 transition-all duration-300 ${arrowPositionClass}`}
        ></div>

        {/* Tiêu đề khuyến mãi / Thời hạn */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          {isNormal ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🎁</span>
              <span>Thời hạn đăng tin mặc định: 60 ngày (Miễn phí 100%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <span>Thời hạn hiển thị ({currentConfig?.name || 'Gói đã chọn'}):</span>
            </div>
          )}
          {!isNormal && (
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block">
              Đăng từ 30 ngày tiết kiệm 25%
            </span>
          )}
        </div>

        {/* Khối lựa chọn thời hạn */}
        {isNormal ? (
          allowedDurations.length === 1 && allowedDurations[0] === 60 ? (
            /* Tin Thường: Gọn gàng mốc 60 ngày */
            <div
              onClick={() => onSelectDays && onSelectDays(60)}
              className="p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-sm flex items-center justify-between cursor-pointer transition hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-gift text-base"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-950">60 ngày</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Mặc định miễn phí 100%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tin đăng hiển thị tối đa trong 60 ngày trên toàn sàn
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-black text-emerald-600">0 đ</div>
                <div className="text-[10px] text-slate-400">Miễn phí trọn kỳ</div>
              </div>
            </div>
          ) : (
            <div className={`grid gap-2 ${allowedDurations.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
              {allowedDurations.map((d) => {
                const isSelected = selectedDays === d;
                const rate = currentConfig?.rates?.[d] ?? 0;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSelectDays && onSelectDays(d)}
                    className={`p-2.5 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white border-2 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                        : 'bg-white/90 hover:bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                      {d} ngày
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 whitespace-nowrap">
                      {rate === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : `${rate.toLocaleString('vi-VN')} đ/ng`}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* VIP (Kim Cương, Vàng, Bạc): 5 mốc tối giản, gọn 5, 7, 10, 15, 30 ngày (loại bỏ 60 ngày, mặc định 7 ngày) */
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
            {[5, 7, 10, 15, 30].map((days) => {
              const isSelected = selectedDays === days;
              const rate = currentConfig?.rates?.[days] ?? (
                days === 30
                  ? Math.round((currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0) * 0.75)
                  : (currentConfig?.rates?.[15] ?? currentConfig?.pricePerDay ?? 0)
              );

              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => onSelectDays && onSelectDays(days)}
                  className={`relative p-2 sm:p-2.5 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-white border-2 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                      : 'bg-white/90 hover:bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {days === 7 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200/60 px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs scale-90 sm:scale-100">
                      Mặc định
                    </span>
                  )}
                  {days === 30 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-600 bg-red-100 border border-red-200/60 px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs scale-90 sm:scale-100">
                      -25%
                    </span>
                  )}
                  <div className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                    {days} ngày
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 whitespace-nowrap">
                    {rate === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      `${rate.toLocaleString('vi-VN')} đ/ng`
                    )}
                  </div>
                </button>
              );
            })}
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
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch (err) {}
            }}
            className="block text-xs font-bold text-slate-800 cursor-pointer"
          >
            Ngày bắt đầu
          </label>
          <div 
            onClick={() => {
              try {
                dateInputRef.current?.showPicker();
              } catch (err) {}
            }}
            className="relative cursor-pointer"
          >
            <input
              ref={dateInputRef}
              id="bds-start-date"
              type="date"
              value={startDate || internalStartDate}
              onClick={(e) => {
                try {
                  if (typeof e.currentTarget.showPicker === 'function') {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {}
              }}
              onChange={(e) => {
                setInternalStartDate(e.target.value);
                if (onStartDateChange) onStartDateChange(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer transition hover:border-slate-400"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Kết thúc ngày {endDateFormatted}
          </div>
        </div>

        {/* Cột 2: Hẹn giờ đăng tin */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <i className="fa-regular fa-clock text-amber-500"></i>
              <span>Hẹn giờ đăng tin</span>
            </span>
            {scheduleTime && scheduleTime !== 'now' && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Lịch: {scheduleTime}</span>
              </span>
            )}
          </label>
          <div className="relative">
            <CustomSelect
              value={scheduleTime}
              onChange={(val) => onScheduleTimeChange && onScheduleTimeChange(val)}
              options={[
                { value: 'now', label: '⚡ Đăng ngay bây giờ (Khuyến nghị)' },
                { value: '08:00', label: '🌅 Sáng 08:00 (Khung giờ vàng - Đón khách xem tin)' },
                { value: '11:30', label: '☀️ Trưa 11:30 (Cao điểm giờ nghỉ trưa tìm kiếm)' },
                { value: '14:00', label: '☕ Chiều 14:00 (Thời điểm khảo sát thực địa)' },
                { value: '19:30', label: '🌙 Tối 19:30 (Khung giờ vàng chốt cọc sau bữa tối)' }
              ]}
              placeholder="Chọn khung giờ đăng tin"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Tự động xuất bản đúng khung giờ có lượt tương tác cao nhất
          </div>
        </div>
      </div>

      {/* ========================================================
          4. HÓA ĐƠN TÓM TẮT DỰ TOÁN (Tùy chọn)
         ======================================================== */}
      {showFullSummary && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-500">
              Phân loại: <strong className="text-slate-900">{currentConfig?.name || 'Tin đăng'}</strong> • Thời hạn: <strong className="text-slate-900">{selectedDays} ngày</strong>
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
