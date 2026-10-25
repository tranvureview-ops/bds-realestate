'use client';

import React, { useState, useMemo, useRef } from 'react';
import CustomSelect from './CustomSelect';
import { useRealEstate } from '../context/RealEstateContext';

/**
 * BatdongsanListingSelector: Component chuẩn hóa giao diện chọn Loại Tin Đăng 
 * và Thời Hạn Hiển Thị theo đúng 100% UI thực tế của Batdongsan.com.vn.
 */

// Bảng đơn giá chuẩn Batdongsan.com.vn theo từng loại tin & thời hạn (15 ngày, 30 ngày, 60 ngày)
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
    rates: {
      15: 79000,  // Base
      30: 59250,  // -25%
      60: 55300   // -30%
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
    approvalBadge: 'Ưu tiên sớm (15p)',
    approvalIcon: 'fa-solid fa-clock-rotate-left',
    approvalColor: 'text-amber-700 bg-amber-50 border-amber-200',
    rates: {
      15: 29000,
      30: 21750,  // -25%
      60: 20300   // -30%
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
    approvalBadge: 'Ưu tiên sớm (30p)',
    approvalIcon: 'fa-solid fa-clock-rotate-left',
    approvalColor: 'text-teal-700 bg-teal-50 border-teal-200',
    rates: {
      15: 9000,
      30: 6750,   // -25%
      60: 6300    // -30%
    }
  },
  'normal': {
    id: 'normal',
    name: 'Tin Thường',
    positionDesc: 'Hiển thị dưới cùng',
    multiplierText: null,
    tagText: null,
    approvalBadge: 'Hàng đợi FIFO (Tự động 1 tiếng)',
    approvalIcon: 'fa-solid fa-clock-rotate-left',
    approvalColor: 'text-slate-600 bg-slate-100 border-slate-200',
    rates: {
      15: 3320,   // Base
      30: 2490,   // -25%
      60: 2324    // -30%
    }
  }
};

/**
 * Tính toán bảng tỷ giá hiển thị động theo cấu hình giá Admin từ vipPackages
 */
export function getEffectiveBdsRates(customVipPackages) {
  const result = { ...BATDONGSAN_RATES };
  if (!customVipPackages || !Array.isArray(customVipPackages) || customVipPackages.length === 0) {
    return result;
  }
  customVipPackages.forEach(pkg => {
    if (!pkg || !pkg.id) return;
    const defaultMeta = BATDONGSAN_RATES[pkg.id] || {};
    const price15 = (typeof pkg.rates?.[15] === 'number')
      ? Math.max(0, pkg.rates[15])
      : ((typeof pkg.pricePerDay === 'number' && !isNaN(pkg.pricePerDay))
          ? Math.max(0, pkg.pricePerDay)
          : (defaultMeta.rates?.[15] ?? 3320));

    const price30 = (typeof pkg.rates?.[30] === 'number')
      ? Math.max(0, pkg.rates[30])
      : ((price15 === 0) ? 0 : Math.round(price15 * 0.75));

    const price60 = (typeof pkg.rates?.[60] === 'number')
      ? Math.max(0, pkg.rates[60])
      : ((price15 === 0) ? 0 : Math.round(price15 * 0.70));

    result[pkg.id] = {
      ...defaultMeta,
      id: pkg.id,
      name: pkg.name || defaultMeta.name,
      shortName: pkg.shortName || defaultMeta.shortName,
      allowedDurations: pkg.allowedDurations,
      rates: {
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

export default function BatdongsanListingSelector({
  selectedType = 'normal',
  onSelectType,
  selectedDays = 15,
  onSelectDays,
  startDate = new Date().toISOString().slice(0, 10),
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
  const ratesConfig = useMemo(() => getEffectiveBdsRates(effectivePackages), [effectivePackages]);

  const [internalStartDate, setInternalStartDate] = useState(startDate);
  const dateInputRef = useRef(null);

  // Tính ngày kết thúc
  const endDateFormatted = useMemo(() => {
    try {
      const d = new Date(startDate || internalStartDate || new Date());
      d.setDate(d.getDate() + (selectedDays || 15));
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }, [startDate, internalStartDate, selectedDays]);

  // Vị trí mũi tên tam giác trỏ xuống từ Card được chọn
  const arrowPositionClass = {
    'vip-diamond': 'left-[12.5%]',
    'vip-gold': 'left-[37.5%]',
    'vip-silver': 'left-[62.5%]',
    'normal': 'left-[87.5%]'
  }[selectedType] || 'left-[87.5%]';

  const isNormal = selectedType === 'normal';

  // Dữ liệu gói hiện tại
  const currentConfig = ratesConfig[selectedType] || ratesConfig['normal'];

  // Lấy các mốc thời gian cho phép hiển thị của gói (Admin có thể bật/tắt trong trang quản trị)
  const allowedDurations = useMemo(() => {
    const raw = currentConfig?.allowedDurations;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
    return isNormal ? [60] : [15, 30, 60];
  }, [currentConfig?.allowedDurations, isNormal]);

  // Đảm bảo số ngày được chọn luôn nằm trong các mốc cho phép
  useEffect(() => {
    if (!allowedDurations.includes(selectedDays) && onSelectDays) {
      const nextDay = allowedDurations.includes(60) ? 60 : allowedDurations[0];
      if (nextDay) onSelectDays(nextDay);
    }
  }, [allowedDurations, selectedDays, onSelectDays]);

  const baseRate = currentConfig.rates[15];
  const currentDailyRate = currentConfig.rates[selectedDays] || currentConfig.rates[15];
  const grossCost = currentDailyRate * selectedDays;
  const finalCost = Math.max(0, grossCost - voucherDiscount);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* ========================================================
          1. HÀNG 4 THẺ LOẠI TIN ĐĂNG (CHUẨN ẢNH BATDONGSAN.COM.VN)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        {Object.values(ratesConfig).map((item) => {
          const isSelected = selectedType === item.id;
          // Giá hiển thị trên card: Tin Thường hiển thị theo 60 ngày (0 đ / Miễn phí)
          const daysForCard = item.id === 'normal' ? 60 : (selectedDays || 15);
          const cardDailyRate = item.rates[daysForCard] || item.rates[15];

          return (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectType) onSelectType(item.id);
                if (item.id === 'normal' && onSelectDays) {
                  onSelectDays(60);
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
      <div className="relative bg-[#f4f5f7] p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
        {/* Mũi tên tam giác chỉ lên thẻ được chọn */}
        <div
          className={`absolute -top-2 w-4 h-4 bg-[#f4f5f7] transform rotate-45 border-l border-t border-slate-200/80 hidden lg:block -translate-x-1/2 transition-all duration-300 ${arrowPositionClass}`}
        ></div>

        {/* Tiêu đề khuyến mãi / Thời hạn */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          {isNormal && allowedDurations.length === 1 && allowedDurations[0] === 60 ? (
            <>
              <span className="text-sm">🎁</span>
              <span>Thời hạn đăng tin mặc định: 60 ngày (Miễn phí 100%)</span>
            </>
          ) : (
            <>
              <span className="text-sm">🔥</span>
              <span>Tiết kiệm hơn khi đăng tin từ 30 ngày!</span>
            </>
          )}
        </div>

        {/* Các Lựa chọn số ngày: 15 ngày, 30 ngày, 60 ngày */}
        <div className={`grid gap-3 ${allowedDurations.length === 1 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {/* Lựa chọn 1: 15 ngày (Quản lý bật/tắt trong trang quản trị) */}
          {allowedDurations.includes(15) && (
            <div
              onClick={() => onSelectDays && onSelectDays(15)}
              className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between bg-white ${
                selectedDays === 15
                  ? 'border-2 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-slate-900">15 ngày</div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">
                  {currentConfig.rates[15] === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                    `${currentConfig.rates[15].toLocaleString('vi-VN')} đ/ngày`
                  )}
                </div>
              </div>
              {/* Custom Radio Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                selectedDays === 15 ? 'border-2 border-slate-900' : 'border border-slate-300'
              }`}>
                {selectedDays === 15 && <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>}
              </div>
            </div>
          )}

          {/* Lựa chọn 2: 30 ngày (-25%) (Quản lý bật/tắt trong trang quản trị) */}
          {allowedDurations.includes(30) && (
            <div
              onClick={() => onSelectDays && onSelectDays(30)}
              className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between bg-white ${
                selectedDays === 30
                  ? 'border-2 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900">30 ngày</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                    Tiết kiệm 25%
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                  {currentConfig.rates[30] === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  ) : (
                    <>
                      <span>{currentConfig.rates[30].toLocaleString('vi-VN')} đ/ngày</span>
                      {baseRate > 0 && (
                        <span className="line-through text-slate-400 font-normal text-[11px]">
                          {baseRate.toLocaleString('vi-VN')} đ/ngày
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Custom Radio Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                selectedDays === 30 ? 'border-2 border-slate-900' : 'border border-slate-300'
              }`}>
                {selectedDays === 30 && <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>}
              </div>
            </div>
          )}

          {/* Lựa chọn 3: 60 ngày (Quản lý bật/tắt trong trang quản trị) */}
          {allowedDurations.includes(60) && (
            <div
              onClick={() => onSelectDays && onSelectDays(60)}
              className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between bg-white ${
                selectedDays === 60
                  ? 'border-2 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900">60 ngày</span>
                  {isNormal && currentConfig.rates[60] === 0 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                      Mặc định miễn phí
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                      Tiết kiệm 30%
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                  {currentConfig.rates[60] === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí 100%</span>
                  ) : (
                    <>
                      <span>{currentConfig.rates[60].toLocaleString('vi-VN')} đ/ngày</span>
                      {baseRate > 0 && (
                        <span className="line-through text-slate-400 font-normal text-[11px]">
                          {baseRate.toLocaleString('vi-VN')} đ/ngày
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Custom Radio Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                selectedDays === 60 ? 'border-2 border-slate-900' : 'border border-slate-300'
              }`}>
                {selectedDays === 60 && <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>}
              </div>
            </div>
          )}
        </div>
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
              Phân loại: <strong className="text-slate-900">{currentConfig.name}</strong> • Thời hạn: <strong className="text-slate-900">{selectedDays} ngày</strong>
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
