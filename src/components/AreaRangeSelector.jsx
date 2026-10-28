'use client';

import React, { useState, useEffect } from 'react';
import { AREA_PRESETS } from '../data/mockData';

/**
 * Component Bộ Chọn Diện Tích chuẩn Batdongsan.com.vn
 * - Danh sách khoảng diện tích định sẵn với radio button bên phải
 * - Tinh gọn, trực quan, đúng 100% giao diện batdongsan.com.vn
 * - Nút "Đặt lại" và "Áp dụng" ở chân popup
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
  const presets = AREA_PRESETS;

  // Xác định preset ban đầu dựa vào initialAreaRange hoặc min/max
  const getInitialPresetValue = () => {
    if (initialAreaRange && initialAreaRange !== 'all') {
      const found = presets.find(p => p.value === initialAreaRange);
      if (found) return found.value;
    }
    if (initialMinArea || initialMaxArea) {
      const match = presets.find(p => p.min === initialMinArea && p.max === initialMaxArea);
      if (match) return match.value;
    }
    return 'all';
  };

  const [selectedPreset, setSelectedPreset] = useState(getInitialPresetValue);

  // Đồng bộ khi props thay đổi từ bên ngoài
  useEffect(() => {
    setSelectedPreset(getInitialPresetValue());
  }, [initialAreaRange, initialMinArea, initialMaxArea]);

  // Chọn preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.value);
  };

  // Đặt lại
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setSelectedPreset('all');
  };

  // Áp dụng
  const handleApply = (e) => {
    if (e) e.stopPropagation();
    const preset = presets.find(p => p.value === selectedPreset) || presets[0];

    const isAll = preset.value === 'all';
    const finalMin = isAll ? null : preset.min;
    const finalMax = isAll ? null : preset.max;
    const label = isAll ? 'Diện tích' : preset.label;

    if (onApply) {
      onApply({
        minArea: finalMin,
        maxArea: finalMax,
        areaRange: isAll ? 'all' : preset.value,
        label
      });
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-white flex flex-col text-slate-800 ${isModal ? 'w-full h-full' : 'w-72 sm:w-80 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'} ${className}`}>
      {/* 1. HEADER (Tiêu đề "Diện tích" + Nút đóng ✕) */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
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

      {/* 2. DANH SÁCH CÁC KHOẢNG DIỆN TÍCH VỚI RADIO BUTTON BÊN PHẢI */}
      <div className={`overflow-y-auto divide-y divide-slate-50 py-1 ${isModal ? 'flex-1 p-2' : 'max-h-80 sm:max-h-96'}`}>
        {presets.map(item => {
          const isSelected = selectedPreset === item.value;
          return (
            <div
              key={item.value}
              onClick={() => handleSelectPreset(item)}
              className={`flex items-center justify-between px-4 py-2.5 transition cursor-pointer select-none group ${
                isSelected ? 'bg-teal-50/50 text-[#009BA1] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <span className="text-xs sm:text-sm truncate">
                {item.label}
              </span>

              {/* Radio Circle chuẩn batdongsan */}
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ml-3 ${
                isSelected ? 'border-[#009BA1] bg-white' : 'border-slate-300 group-hover:border-slate-400'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#009BA1]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FOOTER ACTIONS: ĐẶT LẠI & ÁP DỤNG */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-800 hover:text-slate-950 font-bold text-xs sm:text-sm px-2 py-1 transition cursor-pointer"
        >
          Đặt lại
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="bg-[#e03c31] hover:bg-[#c9352b] text-white font-bold text-xs sm:text-sm px-6 py-2 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
