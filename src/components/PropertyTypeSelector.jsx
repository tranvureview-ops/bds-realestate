'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getPropertyTypeTree,
  formatPropertyTypeTriggerLabel
} from '../data/propertyTypeTaxonomy';

/**
 * Chuẩn hóa giá trị đầu vào thành mảng ID
 */
const normalizeSelectedValues = (val) => {
  if (!val || val === 'all') return ['all'];
  if (Array.isArray(val)) {
    const clean = val.filter(v => v && v !== 'all');
    return clean.length > 0 ? clean : ['all'];
  }
  if (typeof val === 'string') {
    const split = val.split(',').map(s => s.trim()).filter(v => v && v !== 'all');
    return split.length > 0 ? split : ['all'];
  }
  return ['all'];
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
    if (onClose) {
      onClose();
    }
  };

  const isAllChecked = selected.includes('all') || selected.length === 0;

  return (
    <div
      className={`bg-white flex flex-col text-slate-800 ${
        isModal
          ? 'w-full h-full'
          : 'w-72 sm:w-[295px] rounded-xl border border-slate-200 shadow-xl overflow-hidden'
      } ${className}`}
    >
      {/* 1. HEADER (Tiêu đề "Loại nhà đất" + Nút Thu gọn/Mở rộng + Nút đóng ✕) */}
      <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
        <button
          type="button"
          onClick={toggleAllGroups}
          className="text-[10px] text-slate-500 hover:text-red-600 font-medium transition cursor-pointer flex items-center gap-1 select-none"
          title={isAnyGroupExpanded ? 'Thu gọn tất cả nhóm' : 'Mở rộng tất cả nhóm'}
        >
          <i className={`fa-solid fa-${isAnyGroupExpanded ? 'compress' : 'expand'} text-[9px]`}></i>
          <span>{isAnyGroupExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
        </button>

        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 text-center">
          Loại nhà đất
        </h4>

        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
          title="Đóng"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>

      {/* 2. DANH SÁCH CÂY PHÂN CẤP CHUẨN BATDONGSAN (GỌN GÀNG, TIẾT KIỆM KHÔNG GIAN) */}
      <div className={`overflow-y-auto divide-y divide-slate-50 ${isModal ? 'flex-1 p-2' : 'max-h-[340px] py-0.5'}`}>
        {tree.map(item => {
          // MỤC "TẤT CẢ NHÀ ĐẤT"
          if (item.isAll) {
            return (
              <div
                key={item.id}
                onClick={(e) => handleToggleAll(e)}
                className="flex items-center justify-between px-3.5 py-1.5 hover:bg-slate-50 transition cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-xs w-3.5 text-center transition-colors shrink-0`}></i>
                  <span className={`text-xs truncate ${isAllChecked ? 'text-[#e03c31] font-bold' : 'text-slate-800 font-medium'}`}>
                    {item.name}
                  </span>
                </div>
                <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition shrink-0 ml-2 ${
                  isAllChecked
                    ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isAllChecked && <i className="fa-solid fa-check text-[9px]"></i>}
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
                  className="flex items-center justify-between px-3.5 py-1.5 hover:bg-slate-50 transition select-none group cursor-pointer"
                >
                  <div
                    onClick={(e) => toggleGroupExpand(e, item.id)}
                    className="flex items-center gap-2 min-w-0 flex-1 pr-2 cursor-pointer"
                    title={isExpanded ? 'Bấm để thu gọn' : 'Bấm để mở rộng chi tiết'}
                  >
                    <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-xs w-3.5 text-center transition-colors shrink-0`}></i>
                    <span className={`text-xs font-bold truncate ${isChecked || isIndeterminate ? 'text-[#e03c31]' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({item.children.length})
                    </span>
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[8.5px] text-slate-400 group-hover:text-slate-600 ml-0.5 transition-transform`}></i>
                  </div>

                  <div
                    onClick={(e) => handleToggleGroup(e, item)}
                    className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition shrink-0 ml-2 cursor-pointer ${
                      isChecked || isIndeterminate
                        ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                    title="Chọn / Bỏ chọn toàn bộ nhóm"
                  >
                    {isChecked && <i className="fa-solid fa-check text-[9px]"></i>}
                    {!isChecked && isIndeterminate && <i className="fa-solid fa-minus text-[9px]"></i>}
                  </div>
                </div>

                {/* CÁC MỤC CON THỤT LỀ (CHỈ HIỂN THỊ KHI MỞ RỘNG) */}
                {isExpanded && (
                  <div className="border-l-2 border-slate-100 ml-6 pl-2.5 py-0.5 space-y-0.5 animate-fadeIn">
                    {item.children.map(child => {
                      const isChildChecked = selected.includes(child.id);
                      return (
                        <div
                          key={child.id}
                          onClick={(e) => handleToggleItem(e, child.id)}
                          className="flex items-center justify-between px-2 py-1 hover:bg-slate-50 rounded-md transition cursor-pointer select-none group"
                        >
                          <span className={`text-[11.5px] truncate ${isChildChecked ? 'text-[#e03c31] font-semibold' : 'text-slate-700 font-medium'}`}>
                            {child.name}
                          </span>
                          <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition shrink-0 ml-2 ${
                            isChildChecked
                              ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}>
                            {isChildChecked && <i className="fa-solid fa-check text-[9px]"></i>}
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
              className="flex items-center justify-between px-3.5 py-1.5 hover:bg-slate-50 transition cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <i className={`${item.icon} text-slate-400 group-hover:text-red-600 text-xs w-3.5 text-center transition-colors shrink-0`}></i>
                <span className={`text-xs truncate ${isItemChecked ? 'text-[#e03c31] font-bold' : 'text-slate-800 font-medium'}`}>
                  {item.name}
                </span>
              </div>
              <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition shrink-0 ml-2 ${
                isItemChecked
                  ? 'bg-[#e03c31] border-[#e03c31] text-white shadow-2xs'
                  : 'border-slate-300 bg-white group-hover:border-slate-400'
              }`}>
                {isItemChecked && <i className="fa-solid fa-check text-[9px]"></i>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FOOTER ACTIONS: ĐẶT LẠI & ÁP DỤNG */}
      <div className="px-3.5 py-2 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-600 hover:text-slate-900 font-bold text-xs px-1.5 py-1 transition cursor-pointer"
        >
          Đặt lại
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="bg-[#e03c31] hover:bg-[#c9352b] text-white font-bold text-xs px-4 py-1.5 rounded-lg transition cursor-pointer shadow-xs active:scale-95"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
