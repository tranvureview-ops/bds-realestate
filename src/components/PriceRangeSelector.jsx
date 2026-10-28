'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SALE_PRICE_PRESETS, RENT_PRICE_PRESETS } from '../data/mockData';

/**
 * Component Bộ Chọn Khoảng Giá có Thanh Trượt Range Slider chuẩn Batdongsan.com.vn
 * - Thanh trượt kép 2 đầu (Dual Range Slider)
 * - 2 ô nhập số trực tiếp [Từ] -> [Đến]
 * - Hiển thị giá trị động "Từ: X triệu/tỷ" - "Đến: Y triệu/tỷ"
 * - Danh sách mức giá định sẵn với radio button bên phải
 * - Tự động đồng bộ giữa thanh trượt, ô nhập số và danh sách chọn nhanh
 */
export default function PriceRangeSelector({
  demand = 'sale',
  minPrice: initialMinPrice = null,
  maxPrice: initialMaxPrice = null,
  priceRange: initialPriceRange = 'all',
  onApply,
  onClose,
  isModal = false,
  className = ''
}) {
  const isRent = demand === 'rent';
  const unitText = isRent ? 'triệu' : 'tỷ';
  const multiplier = isRent ? 1e6 : 1e9;
  const maxLimit = isRent ? 500 : 1000; // 500 triệu hoặc 1.000 tỷ
  const presets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;

  // Chuyển đổi VND sang đơn vị hiển thị (triệu/tỷ)
  const toUnitVal = (vnd) => {
    if (vnd === null || vnd === undefined || isNaN(vnd)) return null;
    const num = Number(vnd) / multiplier;
    return isRent ? Math.round(num) : Math.round(num * 10) / 10;
  };

  // Chuyển đổi đơn vị (triệu/tỷ) sang VND
  const toVnd = (unitVal) => {
    if (unitVal === null || unitVal === undefined || isNaN(unitVal) || unitVal <= 0) return null;
    return Math.round(Number(unitVal) * multiplier);
  };

  // State cục bộ cho khoảng giá
  const [minUnit, setMinUnit] = useState(() => {
    const val = toUnitVal(initialMinPrice);
    return val !== null && val > 0 ? val : 0;
  });

  const [maxUnit, setMaxUnit] = useState(() => {
    const val = toUnitVal(initialMaxPrice);
    return val !== null && val > 0 ? val : maxLimit;
  });

  const [inputMin, setInputMin] = useState(() => {
    const val = toUnitVal(initialMinPrice);
    return val !== null && val > 0 ? String(val) : '';
  });

  const [inputMax, setInputMax] = useState(() => {
    const val = toUnitVal(initialMaxPrice);
    return val !== null && val > 0 && val < maxLimit ? String(val) : '';
  });

  // Đồng bộ khi prop thay đổi
  useEffect(() => {
    const initMin = toUnitVal(initialMinPrice);
    const initMax = toUnitVal(initialMaxPrice);

    const m = initMin !== null && initMin > 0 ? initMin : 0;
    const M = initMax !== null && initMax > 0 ? initMax : maxLimit;

    setMinUnit(m);
    setMaxUnit(M);
    setInputMin(m > 0 ? String(m) : '');
    setInputMax(M < maxLimit ? String(M) : '');
  }, [initialMinPrice, initialMaxPrice, demand]);

  // --- PIECEWISE MAPPING (Cho phép kéo thanh trượt mượt mà ở khoảng phổ biến) ---
  const valToPercent = (val) => {
    if (!val || val <= 0) return 0;
    if (val >= maxLimit) return 100;

    if (isRent) {
      // 0 - 50 triệu chiếm 50% thanh trượt, 50 - 500 triệu chiếm 50% còn lại
      if (val <= 50) {
        return (val / 50) * 50;
      }
      return 50 + ((val - 50) / 450) * 50;
    } else {
      // 0 - 30 tỷ chiếm 60% thanh trượt, 30 - 1000 tỷ chiếm 40% còn lại
      if (val <= 30) {
        return (val / 30) * 60;
      }
      return 60 + ((val - 30) / 970) * 40;
    }
  };

  const percentToVal = (pct) => {
    if (pct <= 0) return 0;
    if (pct >= 100) return maxLimit;

    if (isRent) {
      if (pct <= 50) {
        return Math.round((pct / 50) * 50);
      }
      return Math.round(50 + ((pct - 50) / 50) * 450);
    } else {
      if (pct <= 60) {
        const raw = (pct / 60) * 30;
        return Math.round(raw * 2) / 2; // Bước nhảy 0.5 tỷ
      }
      return Math.round(30 + ((pct - 60) / 40) * 970);
    }
  };

  const minPercent = Math.min(100, Math.max(0, valToPercent(minUnit)));
  const maxPercent = Math.min(100, Math.max(0, valToPercent(maxUnit)));

  // Kéo Slider Min
  const handleSliderMin = (e) => {
    const rawPct = parseFloat(e.target.value);
    const newMinVal = percentToVal(rawPct);
    const clampedMin = Math.min(newMinVal, maxUnit);
    setMinUnit(clampedMin);
    setInputMin(clampedMin > 0 ? String(clampedMin) : '');
  };

  // Kéo Slider Max
  const handleSliderMax = (e) => {
    const rawPct = parseFloat(e.target.value);
    const newMaxVal = percentToVal(rawPct);
    const clampedMax = Math.max(newMaxVal, minUnit);
    setMaxUnit(clampedMax);
    setInputMax(clampedMax < maxLimit ? String(clampedMax) : '');
  };

  // Nhập số trực tiếp vào ô [Từ]
  const handleInputMinChange = (e) => {
    const text = e.target.value;
    setInputMin(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      const clamped = Math.min(num, maxUnit);
      setMinUnit(clamped);
    } else {
      setMinUnit(0);
    }
  };

  // Nhập số trực tiếp vào ô [Đến]
  const handleInputMaxChange = (e) => {
    const text = e.target.value;
    setInputMax(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      const clamped = Math.min(Math.max(num, minUnit), maxLimit);
      setMaxUnit(clamped);
    } else {
      setMaxUnit(maxLimit);
    }
  };

  // Chọn một preset định sẵn
  const handleSelectPreset = (preset) => {
    if (preset.value === 'all') {
      setMinUnit(0);
      setMaxUnit(maxLimit);
      setInputMin('');
      setInputMax('');
      return;
    }

    const minU = preset.min ? toUnitVal(preset.min) : 0;
    const maxU = preset.max ? toUnitVal(preset.max) : maxLimit;

    setMinUnit(minU);
    setMaxUnit(maxU);
    setInputMin(minU > 0 ? String(minU) : '');
    setInputMax(maxU < maxLimit ? String(maxU) : '');
  };

  // Kiểm tra preset nào đang active
  const activePresetValue = useMemo(() => {
    const currentMinVnd = minUnit > 0 ? toVnd(minUnit) : null;
    const currentMaxVnd = maxUnit < maxLimit ? toVnd(maxUnit) : null;

    if (!currentMinVnd && !currentMaxVnd) return 'all';

    const found = presets.find(p => {
      if (p.value === 'all') return false;
      const pMin = p.min || null;
      const pMax = p.max || null;
      return pMin === currentMinVnd && pMax === currentMaxVnd;
    });

    return found ? found.value : null;
  }, [minUnit, maxUnit, maxLimit, presets]);

  // Xử lý nút Đặt lại
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setMinUnit(0);
    setMaxUnit(maxLimit);
    setInputMin('');
    setInputMax('');
  };

  // Xử lý nút Áp dụng
  const handleApply = (e) => {
    if (e) e.stopPropagation();
    const finalMinVnd = minUnit > 0 ? toVnd(minUnit) : null;
    const finalMaxVnd = maxUnit < maxLimit ? toVnd(maxUnit) : null;

    let rangeKey = activePresetValue || 'all';
    if (!activePresetValue) {
      if (!finalMinVnd && !finalMaxVnd) {
        rangeKey = 'all';
      } else if (!finalMinVnd && finalMaxVnd) {
        rangeKey = `under-${maxUnit}${isRent ? 'm' : 'b'}`;
      } else if (finalMinVnd && !finalMaxVnd) {
        rangeKey = `over-${minUnit}${isRent ? 'm' : 'b'}`;
      } else {
        rangeKey = `${minUnit}${isRent ? 'm' : 'b'}-${maxUnit}${isRent ? 'm' : 'b'}`;
      }
    }

    // Tạo label hiển thị trigger (Chuẩn ảnh: "≤ 57 triệu", "40 - 70 triệu", "≥ 10 tỷ"...)
    let label = 'Khoảng giá';
    if (finalMinVnd && finalMaxVnd) {
      label = `${minUnit} - ${maxUnit} ${unitText}`;
    } else if (finalMaxVnd) {
      label = `≤ ${maxUnit} ${unitText}`;
    } else if (finalMinVnd) {
      label = `≥ ${minUnit} ${unitText}`;
    }

    if (onApply) {
      onApply({
        minPrice: finalMinVnd,
        maxPrice: finalMaxVnd,
        priceRange: rangeKey,
        label
      });
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-white flex flex-col text-slate-800 ${isModal ? 'w-full h-full' : 'w-80 sm:w-88 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'} ${className}`}>
      {/* 1. HEADER (Tiêu đề "Khoảng giá" + Nút đóng ✕) */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 w-full text-center pl-6">
          Khoảng giá
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
          title="Đóng"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div className={`overflow-y-auto px-4 py-3 space-y-4 ${isModal ? 'flex-1' : 'max-h-96'}`}>
        {/* 2. DÒNG HIỂN THỊ TỪ / ĐẾN (Chuẩn thiết kế Batdongsan màu xanh Teal #009BA1) */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 font-medium">Từ: </span>
            <span className="text-[#009BA1] font-bold">
              {minUnit > 0 ? `${minUnit} ${unitText}` : `0 ${unitText}`}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Đến: </span>
            <span className="text-[#009BA1] font-bold">
              {maxUnit < maxLimit ? `${maxUnit} ${unitText}` : `${maxLimit} ${unitText}+`}
            </span>
          </div>
        </div>

        {/* 3. HAI Ô NHẬP TRỰC TIẾP [ Từ ] -> [ Đến ] */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 relative">
            <input
              type="number"
              value={inputMin}
              onChange={handleInputMinChange}
              placeholder="Từ"
              className="w-full text-center py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#009BA1] focus:ring-1 focus:ring-[#009BA1] transition placeholder-slate-400"
            />
          </div>
          <span className="text-slate-400 font-bold text-base shrink-0">→</span>
          <div className="flex-1 relative">
            <input
              type="number"
              value={inputMax}
              onChange={handleInputMaxChange}
              placeholder="Đến"
              className="w-full text-center py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-[#009BA1] focus:ring-1 focus:ring-[#009BA1] transition placeholder-slate-400"
            />
          </div>
        </div>

        {/* 4. THANH TRƯỢT KÉP RANGE SLIDER 2 ĐẦU */}
        <div className="py-2 px-1">
          <div className="relative h-6 flex items-center select-none">
            {/* Đường ray nền */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-200 rounded-full" />

            {/* Dải màu xanh Teal kích hoạt giữa 2 nút */}
            <div
              className="absolute h-1.5 bg-[#009BA1] rounded-full pointer-events-none"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`
              }}
            />

            {/* Range Input Đầu Min */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={minPercent}
              onChange={handleSliderMin}
              className="bds-range-slider absolute w-full appearance-none bg-transparent pointer-events-none z-20"
            />

            {/* Range Input Đầu Max */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={maxPercent}
              onChange={handleSliderMax}
              className="bds-range-slider absolute w-full appearance-none bg-transparent pointer-events-none z-30"
            />
          </div>
        </div>

        {/* 5. DANH SÁCH MỨC GIÁ ĐỊNH SẴN VỚI RADIO BUTTON */}
        <div className="pt-2 border-t border-slate-100 space-y-0.5">
          {presets.map(item => {
            const isSelected = activePresetValue === item.value;
            return (
              <div
                key={item.value}
                onClick={() => handleSelectPreset(item)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition select-none hover:bg-slate-50 ${
                  isSelected ? 'bg-teal-50/50' : ''
                }`}
              >
                <span className={`text-xs sm:text-sm ${isSelected ? 'text-[#009BA1] font-bold' : 'text-slate-700 font-medium'}`}>
                  {item.label}
                </span>

                {/* Radio Circle */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ml-3 ${
                  isSelected ? 'border-[#009BA1] bg-white' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#009BA1]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FOOTER ACTIONS: ĐẶT LẠI & ÁP DỤNG */}
      <div className="p-3 sm:p-3.5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          Đặt lại
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="bg-[#e03c31] hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
        >
          Áp dụng
        </button>
      </div>

      {/* Scoped CSS cho Range Slider Thumb */}
      <style jsx>{`
        .bds-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #009BA1;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .bds-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .bds-range-slider::-webkit-slider-thumb:active {
          transform: scale(1.25);
          background: #008287;
        }
        .bds-range-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #009BA1;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
