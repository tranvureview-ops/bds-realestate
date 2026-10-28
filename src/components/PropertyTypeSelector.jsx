'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getPropertyTypeOptions,
  formatPropertyTypeTriggerLabel
} from '../data/propertyTypeTaxonomy';

/**
 * Component Bảng chọn Loại Nhà Đất dạng Select chuẩn Batdongsan.com.vn
 * - Thiết kế đồng bộ 100% với Bộ Lọc "Khoảng giá" và "Diện tích"
 * - Header có tiêu đề "Loại nhà đất" và nút đóng [ ✕ ]
 * - Danh sách dạng cuộn gọn gàng kèm radio button tròn (#009BA1) bên phải
 * - Chân popup có nút "Đặt lại" và "Áp dụng" màu đỏ nổi bật
 * - Đồng bộ tức thì với bộ lọc trang và URL SEO
 */
export default function PropertyTypeSelector({
  value,
  demand = 'sale',
  onApply,
  onClose,
  isModal = false,
  className = ''
}) {
  const options = useMemo(() => getPropertyTypeOptions(demand), [demand]);

  // Chuẩn hóa giá trị đầu vào thành ID duy nhất (mặc định 'all')
  const initialSelectedId = useMemo(() => {
    if (!value || value === 'all') return 'all';
    if (Array.isArray(value)) {
      const first = value.find(v => v && v !== 'all');
      return first || 'all';
    }
    if (typeof value === 'string') {
      const split = value.split(',').map(s => s.trim()).filter(Boolean);
      const first = split.find(v => v && v !== 'all');
      return first || 'all';
    }
    return 'all';
  }, [value]);

  const [selectedId, setSelectedId] = useState(initialSelectedId);

  // Đồng bộ khi prop value hoặc demand thay đổi từ bên ngoài
  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId, demand]);

  // Xử lý chọn nhanh 1 loại hình
  const handleSelect = (val) => {
    setSelectedId(val);
  };

  // Xử lý nút Đặt lại -> Trở về "Tất cả nhà đất"
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setSelectedId('all');
  };

  // Xử lý nút Áp dụng
  const handleApply = (e) => {
    if (e) e.stopPropagation();
    const finalId = selectedId || 'all';
    const opt = options.find(o => o.value === finalId);
    const label = opt ? opt.label : 'Loại nhà đất';

    if (onApply) {
      // Hỗ trợ truyền mảng ID để tương thích cả multi-select và single-select
      const resultIds = finalId === 'all' ? ['all'] : [finalId];
      onApply(resultIds, label);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`bg-white flex flex-col text-slate-800 ${
        isModal
          ? 'w-full h-full'
          : 'w-80 sm:w-[320px] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'
      } ${className}`}
    >
      {/* 1. HEADER (Tiêu đề "Loại nhà đất" + Nút đóng ✕) */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 w-full text-center pl-6">
          Loại nhà đất
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

      {/* 2. DANH SÁCH CÁC LOẠI HÌNH VỚI RADIO BUTTON GỌN GÀNG */}
      <div className={`overflow-y-auto ${isModal ? 'flex-1' : 'max-h-80 sm:max-h-96'}`}>
        <div className="p-2 space-y-0.5">
          {options.map((item) => {
            const isSelected = selectedId === item.value;
            return (
              <div
                key={item.value}
                onClick={() => handleSelect(item.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-teal-50/50 text-[#009BA1] font-bold'
                    : 'text-slate-700 font-medium hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {item.icon && (
                    <i
                      className={`${item.icon} text-xs w-4 text-center shrink-0 ${
                        isSelected ? 'text-[#009BA1]' : 'text-slate-400'
                      }`}
                    ></i>
                  )}
                  <span className="text-xs sm:text-sm truncate">
                    {item.label}
                  </span>
                </div>

                {/* Radio Circle chuẩn phong cách Batdongsan (đồng bộ Khoảng giá & Diện tích) */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ml-3 ${
                    isSelected ? 'border-[#009BA1] bg-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#009BA1]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
