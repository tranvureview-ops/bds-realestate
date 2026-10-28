'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AREA_PRESETS } from '../data/mockData';

/**
 * Component Bộ Chọn Diện Tích có Thanh Trượt Range Slider chuẩn Batdongsan.com.vn
 * - Thanh trượt kép 2 đầu (Dual Range Slider) từ 0 m² tới 3.000 m²
 * - 2 ô nhập số trực tiếp [Từ] -> [Đến]
 * - Hiển thị giá trị động "Từ: X m²" - "Đến: Y m²"
 * - Danh sách các khoảng diện tích định sẵn với radio button bên phải
 * - Tự động đồng bộ giữa thanh trượt, ô nhập số và danh sách chọn nhanh
 */
export default function AreaRangeSelector({
  minArea: initialMinArea = null,
  maxArea: initialMaxArea = null,
  areaRange: initialAreaRange = 'all',
  onApply,
  onClose,
  isModal = false,
  className = ''
}) {
  const maxLimit = 3000; // 3.000 m²
  const presets = AREA_PRESETS;

  // State cục bộ cho diện tích (m²)
  const [minVal, setMinVal] = useState(() => {
    return initialMinArea && initialMinArea > 0 ? initialMinArea : 0;
  });

  const [maxVal, setMaxVal] = useState(() => {
    return initialMaxArea && initialMaxArea > 0 ? initialMaxArea : maxLimit;
  });

  const [inputMin, setInputMin] = useState(() => {
    return initialMinArea && initialMinArea > 0 ? String(initialMinArea) : '';
  });

  const [inputMax, setInputMax] = useState(() => {
    return initialMaxArea && initialMaxArea > 0 && initialMaxArea < maxLimit ? String(initialMaxArea) : '';
  });

  // Đồng bộ khi prop thay đổi
  useEffect(() => {
    const m = initialMinArea && initialMinArea > 0 ? initialMinArea : 0;
    const M = initialMaxArea && initialMaxArea > 0 ? initialMaxArea : maxLimit;

    setMinVal(m);
    setMaxVal(M);
    setInputMin(m > 0 ? String(m) : '');
    setInputMax(M < maxLimit ? String(M) : '');
  }, [initialMinArea, initialMaxArea]);

  // --- PIECEWISE MAPPING (0 - 300 m² chiếm 60% thanh trượt; 300 - 3000 m² chiếm 40%) ---
  const valToPercent = (val) => {
    if (!val || val <= 0) return 0;
    if (val >= maxLimit) return 100;

    if (val <= 300) {
      return (val / 300) * 60;
    }
    return 60 + ((val - 300) / 2700) * 40;
  };

  const percentToVal = (pct) => {
    if (pct <= 0) return 0;
    if (pct >= 100) return maxLimit;

    if (pct <= 60) {
      const raw = (pct / 60) * 300;
      return Math.round(raw / 5) * 5; // Bước nhảy 5 m²
    }
    const raw = 300 + ((pct - 60) / 40) * 2700;
    return Math.round(raw / 25) * 25; // Bước nhảy 25 m²
  };

  const minPercent = Math.min(100, Math.max(0, valToPercent(minVal)));
  const maxPercent = Math.min(100, Math.max(0, valToPercent(maxVal)));

  // Kéo Slider Min
  const handleSliderMin = (e) => {
    const rawPct = parseFloat(e.target.value);
    const newVal = percentToVal(rawPct);
    const clamped = Math.min(newVal, maxVal);
    setMinVal(clamped);
    setInputMin(clamped > 0 ? String(clamped) : '');
  };

  // Kéo Slider Max
  const handleSliderMax = (e) => {
    const rawPct = parseFloat(e.target.value);
    const newVal = percentToVal(rawPct);
    const clamped = Math.max(newVal, minVal);
    setMaxVal(clamped);
    setInputMax(clamped < maxLimit ? String(clamped) : '');
  };

  // Nhập số trực tiếp vào ô [Từ]
  const handleInputMinChange = (e) => {
    const text = e.target.value;
    setInputMin(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      const clamped = Math.min(num, maxVal);
      setMinVal(clamped);
    } else {
      setMinVal(0);
    }
  };

  // Nhập số trực tiếp vào ô [Đến]
  const handleInputMaxChange = (e) => {
    const text = e.target.value;
    setInputMax(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      const clamped = Math.min(Math.max(num, minVal), maxLimit);
      setMaxVal(clamped);
    } else {
      setMaxVal(maxLimit);
    }
  };

  // Chọn một preset định sẵn
  const handleSelectPreset = (preset) => {
    if (preset.value === 'all') {
      setMinVal(0);
      setMaxVal(maxLimit);
      setInputMin('');
      setInputMax('');
      return;
    }

    const minA = preset.min || 0;
    const maxA = preset.max || maxLimit;

    setMinVal(minA);
    setMaxVal(maxA);
    setInputMin(minA > 0 ? String(minA) : '');
    setInputMax(maxA < maxLimit ? String(maxA) : '');
  };

  // Kiểm tra preset nào đang active
  const activePresetValue = useMemo(() => {
    const currentMin = minVal > 0 ? minVal : null;
    const currentMax = maxVal < maxLimit ? maxVal : null;

    if (!currentMin && !currentMax) return 'all';

    const found = presets.find(p => {
      if (p.value === 'all') return false;
      const pMin = p.min || null;
      const pMax = p.max || null;
      return pMin === currentMin && pMax === currentMax;
    });

    return found ? found.value : null;
  }, [minVal, maxVal, maxLimit, presets]);

  // Xử lý nút Đặt lại
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setMinVal(0);
    setMaxVal(maxLimit);
    setInputMin('');
    setInputMax('');
  };

  // Xử lý nút Áp dụng
  const handleApply = (e) => {
    if (e) e.stopPropagation();
    const finalMin = minVal > 0 ? minVal : null;
    const finalMax = maxVal < maxLimit ? maxVal : null;

    let rangeKey = activePresetValue || 'all';
    if (!activePresetValue) {
      if (!finalMin && !finalMax) {
        rangeKey = 'all';
      } else if (!finalMin && finalMax) {
        rangeKey = `under-${maxVal}`;
      } else if (finalMin && !finalMax) {
        rangeKey = `over-${minVal}`;
      } else {
        rangeKey = `${minVal}-${maxVal}`;
      }
    }

    // Tạo label hiển thị trigger (Chuẩn ảnh: "≤ 80 m²", "50 - 100 m²", "≥ 200 m²"...)
    let label = 'Diện tích';
    if (finalMin && finalMax) {
      label = `${minVal} - ${maxVal} m²`;
    } else if (finalMax) {
      label = `≤ ${maxVal} m²`;
    } else if (finalMin) {
      label = `≥ ${minVal} m²`;
    }

    if (onApply) {
      onApply({
        minArea: finalMin,
        maxArea: finalMax,
        areaRange: rangeKey,
        label
      });
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-white flex flex-col text-slate-800 ${isModal ? 'w-full h-full' : 'w-80 sm:w-88 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'} ${className}`}>
      {/* 1. HEADER (Tiêu đề "Diện tích" + Nút đóng ✕) */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 w-full text-center pl-6">
          Diện tích
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
              {minVal > 0 ? `${minVal} m²` : '0 m²'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Đến: </span>
            <span className="text-[#009BA1] font-bold">
              {maxVal < maxLimit ? `${maxVal} m²` : `${maxLimit} m²+`}
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

        {/* 5. DANH SÁCH MỨC DIỆN TÍCH ĐỊNH SẴN VỚI RADIO BUTTON */}
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
