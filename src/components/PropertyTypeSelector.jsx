'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getPropertyTypeTree,
  formatPropertyTypeTriggerLabel,
  expandPropertyTypeIds
} from '../data/propertyTypeTaxonomy';

/**
 * Component Bảng chọn Loại Nhà Đất phân cấp chuẩn Batdongsan.com.vn
 * - Hiển thị danh sách cây (Tree list) với checkbox bên phải
 * - Phân cấp nhóm cha (Ví dụ: "Các loại nhà bán") và các mục con thụt lề
 * - Tự động đồng bộ trạng thái checkbox cha khi chọn tất cả hoặc một phần mục con
 * - Nút "Đặt lại" và "Áp dụng" ở chân bảng chọn
 */
export default function PropertyTypeSelector({
  value,
  demand = 'sale',
  onApply,
  onClose,
  isModal = false,
  className = ''
}) {
  // Chuẩn hóa giá trị đầu vào thành mảng ID
  const initialSelected = useMemo(() => {
    if (!value || value === 'all') return ['all'];
    if (Array.isArray(value)) {
      const clean = value.filter(Boolean);
      return clean.length > 0 ? clean : ['all'];
    }
    if (typeof value === 'string') {
      const split = value.split(',').map(s => s.trim()).filter(Boolean);
      return split.length > 0 ? split : ['all'];
    }
    return ['all'];
  }, [value]);

  const [selected, setSelected] = useState(initialSelected);

  // Đồng bộ khi value hoặc demand thay đổi từ bên ngoài
  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected, demand]);

  const tree = useMemo(() => getPropertyTypeTree(demand), [demand]);

  // Kiểm tra trạng thái của một nhóm cha (Group)
  const getGroupState = (group) => {
    if (!group.children || group.children.length === 0) return { isChecked: false, isIndeterminate: false };
    const childIds = group.children.map(c => c.id);
    const selectedCount = childIds.filter(id => selected.includes(id)).length;
    const isChecked = selectedCount === childIds.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < childIds.length;
    return { isChecked, isIndeterminate };
  };

  // Toggle item 'all'
  const handleToggleAll = () => {
    setSelected(['all']);
  };

  // Toggle nhóm cha
  const handleToggleGroup = (group) => {
    const childIds = group.children.map(c => c.id);
    const { isChecked } = getGroupState(group);

    if (isChecked) {
      // Đang chọn hết => bỏ chọn tất cả mục con
      const next = selected.filter(id => !childIds.includes(id));
      setSelected(next.length === 0 ? ['all'] : next);
    } else {
      // Chưa chọn hết => chọn toàn bộ mục con và bỏ 'all'
      const base = selected.filter(id => id !== 'all');
      const next = Array.from(new Set([...base, ...childIds]));
      setSelected(next);
    }
  };

  // Toggle mục đơn / mục con
  const handleToggleItem = (itemId) => {
    if (itemId === 'all') {
      handleToggleAll();
      return;
    }

    const isCurrentlySelected = selected.includes(itemId);
    let next;

    if (isCurrentlySelected) {
      next = selected.filter(id => id !== itemId);
      if (next.length === 0) {
        next = ['all'];
      }
    } else {
      next = [...selected.filter(id => id !== 'all'), itemId];
    }

    setSelected(next);
  };

  // Xử lý nút Đặt lại
  const handleReset = (e) => {
    if (e) e.stopPropagation();
    setSelected(['all']);
  };

  // Xử lý nút Áp dụng
  const handleApply = (e) => {
    if (e) e.stopPropagation();
    const finalSelected = selected.length === 0 ? ['all'] : selected;
    const label = formatPropertyTypeTriggerLabel(finalSelected, demand);
    if (onApply) {
      onApply(finalSelected, label);
    }
    if (onClose) {
      onClose();
    }
  };

  const isAllChecked = selected.includes('all') || selected.length === 0;

  return (
    <div className={`bg-white flex flex-col ${isModal ? 'w-full h-full' : 'w-80 sm:w-84 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'} ${className}`}>
      {/* DANH SÁCH CÂY PHÂN CẤP */}
      <div className={`overflow-y-auto divide-y divide-slate-100 ${isModal ? 'flex-1 p-2 sm:p-3' : 'max-h-80 sm:max-h-96 py-1.5'}`}>
        {tree.map(item => {
          if (item.isAll) {
            return (
              <div
                key={item.id}
                onClick={handleToggleAll}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <i className={`${item.icon} text-slate-500 group-hover:text-red-600 text-sm w-4 text-center transition-colors`}></i>
                  <span className={`text-xs sm:text-sm truncate ${isAllChecked ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}`}>
                    {item.name}
                  </span>
                </div>
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                  isAllChecked
                    ? 'bg-[#e03c31] border-[#e03c31] text-white'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isAllChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              </div>
            );
          }

          if (item.isGroup) {
            const { isChecked, isIndeterminate } = getGroupState(item);

            return (
              <div key={item.id} className="py-1">
                {/* DÒNG TIÊU ĐỀ NHÓM CHA */}
                <div
                  onClick={() => handleToggleGroup(item)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <i className={`${item.icon} text-slate-500 group-hover:text-red-600 text-sm w-4 text-center transition-colors`}></i>
                    <span className={`text-xs sm:text-sm font-semibold truncate ${isChecked ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                    isChecked || isIndeterminate
                      ? 'bg-[#e03c31] border-[#e03c31] text-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {isChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                    {!isChecked && isIndeterminate && <i className="fa-solid fa-minus text-[10px]"></i>}
                  </div>
                </div>

                {/* CÁC MỤC CON THỤT LỀ (INDENTED) */}
                <div className="space-y-0.5">
                  {item.children.map(child => {
                    const isChildChecked = selected.includes(child.id);
                    return (
                      <div
                        key={child.id}
                        onClick={() => handleToggleItem(child.id)}
                        className="flex items-center justify-between pl-10 pr-4 py-1.5 hover:bg-slate-50 transition cursor-pointer select-none group"
                      >
                        <span className={`text-xs sm:text-[13px] truncate ${isChildChecked ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                          {child.name}
                        </span>
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                          isChildChecked
                            ? 'bg-[#e03c31] border-[#e03c31] text-white'
                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }`}>
                          {isChildChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // MỤC ĐƠN KHÔNG PHÂN NHÓM
          const isItemChecked = selected.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item.id)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <i className={`${item.icon} text-slate-500 group-hover:text-red-600 text-sm w-4 text-center transition-colors`}></i>
                <span className={`text-xs sm:text-sm truncate ${isItemChecked ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}`}>
                  {item.name}
                </span>
              </div>
              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                isItemChecked
                  ? 'bg-[#e03c31] border-[#e03c31] text-white'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              }`}>
                {isItemChecked && <i className="fa-solid fa-check text-[10px]"></i>}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTIONS: ĐẶT LẠI & ÁP DỤNG */}
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
