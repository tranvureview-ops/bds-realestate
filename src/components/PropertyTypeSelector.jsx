'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getPropertyTypeTree,
  formatPropertyTypeTriggerLabel,
  expandPropertyTypeIds
} from '../data/propertyTypeTaxonomy';

/**
 * Chuẩn hóa giá trị đầu vào thành mảng ID
 */
const normalizeSelectedValues = (val) => {
  if (!val || val === 'all') return ['all'];
  let raw = [];
  if (Array.isArray(val)) {
    raw = val.filter(v => v && v !== 'all');
  } else if (typeof val === 'string') {
    raw = val.split(',').map(s => s.trim()).filter(v => v && v !== 'all');
  }
  if (raw.length === 0) return ['all'];
  const expanded = expandPropertyTypeIds(raw);
  return expanded.length > 0 ? expanded : ['all'];
};

/**
 * Component Bảng chọn Loại Nhà Đất phân cấp dạng cây (Tree Checkbox) chuẩn Batdongsan.com.vn
 * - Hiển thị danh sách cây (Tree list) với checkbox vuông bên phải
 * - Phân cấp nhóm cha (Ví dụ: "Các loại nhà bán", "Các loại đất bán") và các mục con thụt lề
 * - Tự động đồng bộ trạng thái checkbox cha (checked / indeterminate) khi chọn tất cả hoặc một phần mục con
 * - Header có tiêu đề "Loại nhà đất" và nút đóng [ ✕ ]
 * - Chân popup có nút "Đặt lại" và "Áp dụng" màu đỏ nổi bật
 * - Đảm bảo state độc lập, không bị reset khi render lại
 */
export default function PropertyTypeSelector({
  value,
  demand = 'sale',
  onApply,
  onClose,
  onBack,
  isModal = false,
  className = ''
}) {
  const tree = useMemo(() => getPropertyTypeTree(demand), [demand]);

  // Chuỗi khóa nhận diện thay đổi từ bên ngoài (chỉ re-sync khi value thực sự thay đổi)
  const externalKey = useMemo(() => {
    if (!value || value === 'all') return 'all';
    if (Array.isArray(value)) return value.filter(Boolean).sort().join(',');
    return String(value).trim();
  }, [value]);

  const [selected, setSelected] = useState(() => normalizeSelectedValues(value));
  const prevKeyRef = useRef(externalKey);

  // Quản lý trạng thái mở rộng/thu gọn của từng nhóm cha (mặc định thu gọn để giao diện gọn gàng)
  const [expandedGroups, setExpandedGroups] = useState(() => ({}));

  const toggleGroupExpand = (e, groupId) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Thu gọn tất cả hoặc Mở rộng tất cả
  const isAnyGroupExpanded = useMemo(() => {
    return Object.values(expandedGroups).some(Boolean);
  }, [expandedGroups]);

  const toggleAllGroups = (e) => {
    if (e) e.stopPropagation();
    if (isAnyGroupExpanded) {
      setExpandedGroups({});
    } else {
      const allExpanded = {};
      tree.forEach(item => {
        if (item.isGroup) allExpanded[item.id] = true;
      });
      setExpandedGroups(allExpanded);
    }
  };

  // Chỉ đồng bộ lại khi externalKey hoặc demand thực sự thay đổi
  useEffect(() => {
    if (prevKeyRef.current !== externalKey) {
      prevKeyRef.current = externalKey;
      setSelected(normalizeSelectedValues(value));
    }
  }, [externalKey, value, demand]);

  // Kiểm tra trạng thái của một nhóm cha (Group)
  const getGroupState = (group) => {
    if (!group.children || group.children.length === 0) {
      return { isChecked: false, isIndeterminate: false };
    }
    const childIds = group.children.map(c => c.id);
    const selectedCount = childIds.filter(id => selected.includes(id)).length;
    const isChecked = selectedCount === childIds.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < childIds.length;
    return { isChecked, isIndeterminate };
  };

  // Toggle item 'all' (Tất cả nhà đất)
  const handleToggleAll = (e) => {
    if (e) e.stopPropagation();
    setSelected(['all']);
  };

  // Toggle nhóm cha (Chọn hoặc bỏ chọn toàn bộ mục con)
  const handleToggleGroup = (e, group) => {
    if (e) e.stopPropagation();
    const childIds = group.children.map(c => c.id);
    const { isChecked } = getGroupState(group);

    if (isChecked) {
      // Đang chọn hết => bỏ chọn tất cả mục con trong nhóm này
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
  const handleToggleItem = (e, itemId) => {
    if (e) e.stopPropagation();
    if (itemId === 'all') {
      setSelected(['all']);
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

  // Xử lý nút Đặt lại => Trở về "Tất cả nhà đất"
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
    if (onClose && !isModal) {
      onClose();
    }
  };

  const isAllChecked = selected.includes('all') || selected.length === 0;

  return (
    <div
      className={`bg-white flex flex-col text-slate-800 ${
        isModal
          ? 'w-full h-full'
          : 'w-80 sm:w-[320px] rounded-2xl border border-slate-200 shadow-2xl overflow-hidden'
      } ${className}`}
    >
      {/* 1. HEADER (Tiêu đề "Loại nhà đất" + Nút quay lại/đóng) */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-base font-bold text-slate-900 flex items-center gap-2 hover:text-red-600 transition cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
            <span>Loại nhà đất</span>
          </button>
        ) : (
          <h4 className="text-sm sm:text-base font-bold text-slate-900 w-full text-center pl-6">
            Loại nhà đất
          </h4>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
          title="Đóng"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      {/* 2. DANH SÁCH CÂY PHÂN CẤP CHUẨN BATDONGSAN (Chiều cao max-h-[420px] giống hệt Khoảng giá & Diện tích) */}
      <div className={`overflow-y-auto divide-y divide-slate-100 ${isModal ? 'flex-1' : 'max-h-[420px]'} py-1`}>
        {tree.map(item => {
          // MỤC "TẤT CẢ NHÀ ĐẤT"
          if (item.isAll) {
            return (
              <div
                key={item.id}
                onClick={(e) => handleToggleAll(e)}
                className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-sm w-4 text-center transition-colors shrink-0`}></i>
                  <span className={`text-xs sm:text-sm truncate ${isAllChecked ? 'text-[#e03c31] font-bold' : 'text-slate-800 font-medium'}`}>
                    {item.name}
                  </span>
                </div>
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                  isAllChecked
                    ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isAllChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              </div>
            );
          }

          // NHÓM PHÂN CẤP CHA - CON (Ví dụ: "Các loại nhà bán", "Các loại đất bán")
          if (item.isGroup) {
            const { isChecked, isIndeterminate } = getGroupState(item);
            const isExpanded = Boolean(expandedGroups[item.id]);

            return (
              <div key={item.id} className="py-0.5">
                {/* DÒNG TIÊU ĐỀ NHÓM CHA */}
                <div
                  className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition select-none group cursor-pointer"
                >
                  <div
                    onClick={(e) => toggleGroupExpand(e, item.id)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 pr-2 cursor-pointer"
                    title={isExpanded ? 'Bấm để thu gọn' : 'Bấm để mở rộng chi tiết'}
                  >
                    <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-sm w-4 text-center transition-colors shrink-0`}></i>
                    <span className={`text-xs sm:text-sm font-bold truncate ${isChecked || isIndeterminate ? 'text-[#e03c31]' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({item.children.length})
                    </span>
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[9px] text-slate-400 group-hover:text-slate-600 ml-0.5 transition-transform`}></i>
                  </div>

                  <div
                    onClick={(e) => handleToggleGroup(e, item)}
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 cursor-pointer ${
                      isChecked || isIndeterminate
                        ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                    title="Chọn / Bỏ chọn toàn bộ nhóm"
                  >
                    {isChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                    {!isChecked && isIndeterminate && <i className="fa-solid fa-minus text-[10px]"></i>}
                  </div>
                </div>

                {/* CÁC MỤC CON THỤT LỀ (CHỈ HIỂN THỊ KHI MỞ RỘNG) */}
                {isExpanded && (
                  <div className="border-l-2 border-slate-100 ml-7 pl-3 py-1 space-y-0.5 animate-fadeIn">
                    {item.children.map(child => {
                      const isChildChecked = selected.includes(child.id);
                      return (
                        <div
                          key={child.id}
                          onClick={(e) => handleToggleItem(e, child.id)}
                          className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg transition cursor-pointer select-none group"
                        >
                          <span className={`text-xs sm:text-[13px] truncate ${isChildChecked ? 'text-[#e03c31] font-bold' : 'text-slate-700 font-medium'}`}>
                            {child.name}
                          </span>
                          <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                            isChildChecked
                              ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}>
                            {isChildChecked && <i className="fa-solid fa-check text-[10px]"></i>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // MỤC ĐƠN KHÔNG PHÂN NHÓM (Căn hộ chung cư, Condotel, Kho xưởng...)
          const isItemChecked = selected.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={(e) => handleToggleItem(e, item.id)}
              className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-sm w-4 text-center transition-colors shrink-0`}></i>
                <span className={`text-xs sm:text-sm truncate ${isItemChecked ? 'text-[#e03c31] font-bold' : 'text-slate-800 font-medium'}`}>
                  {item.name}
                </span>
              </div>
              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition shrink-0 ml-3 ${
                isItemChecked
                  ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              }`}>
                {isItemChecked && <i className="fa-solid fa-check text-[10px]"></i>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FOOTER ACTIONS: ĐẶT LẠI & ÁP DỤNG (Giống hệt Khoảng giá & Diện tích) */}
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
