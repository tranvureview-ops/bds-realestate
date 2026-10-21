'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect - Component Dropdown & Combobox hiện đại, bo tròn cao cấp, thay thế hoàn toàn thẻ <select>/<datalist> nguyên bản của trình duyệt
 * Hỗ trợ: icon, search nhanh, badge, kiểm soát click outside, animation mượt mà, gõ trực tiếp (allowCustomInput)
 */
export default function CustomSelect({
  value,
  onChange,
  options = [], // Mảng string[] hoặc object[] ({ value, label, icon, badge, sublabel })
  placeholder = 'Chọn một mục...',
  className = '',
  dropdownClassName = '',
  disabled = false,
  showSearch = false,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  icon = null,
  allowCustomInput = false // Cho phép gõ trực tiếp hoặc chọn gợi ý (Combobox)
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const comboboxInputRef = useRef(null);

  // Chuẩn hóa danh sách tùy chọn
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value !== undefined ? opt.value : opt.id || opt.name,
      label: opt.label || opt.name || String(opt.value),
      icon: opt.icon,
      badge: opt.badge,
      sublabel: opt.sublabel
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Tự động kích hoạt thanh tìm kiếm nếu danh sách có nhiều hơn 7 mục (chỉ áp dụng cho select chuẩn)
  const shouldShowSearch = !allowCustomInput && (showSearch || normalizedOptions.length > 7);

  // Lọc danh sách tùy chọn
  const filteredOptions = allowCustomInput
    ? (searchTerm.trim()
        ? normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : normalizedOptions)
    : (shouldShowSearch && searchTerm.trim()
        ? normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : normalizedOptions);

  // Lắng nghe click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      if (shouldShowSearch && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, shouldShowSearch]);

  const handleSelect = (optValue) => {
    onChange && onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* 1. TRƯỜNG HỢP COMBOBOX (Gõ trực tiếp hoặc chọn gợi ý) */}
      {allowCustomInput ? (
        <div
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-800 transition shadow-sm ${
            disabled
              ? 'opacity-60 bg-slate-100 cursor-not-allowed border-slate-200'
              : isOpen
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
        >
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            <input
              ref={comboboxInputRef}
              type="text"
              disabled={disabled}
              value={value || ''}
              onChange={(e) => {
                const newVal = e.target.value;
                onChange && onChange(newVal);
                setSearchTerm(newVal);
                if (!isOpen && !disabled && normalizedOptions.length > 0) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => {
                if (!disabled && normalizedOptions.length > 0) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setIsOpen(false);
                }
              }}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal truncate"
            />
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange && onChange('');
                  setSearchTerm('');
                  if (comboboxInputRef.current) comboboxInputRef.current.focus();
                }}
                className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition"
                title="Xóa"
              >
                <i className="fa-solid fa-xmark text-[11px]"></i>
              </button>
            )}

            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  setSearchTerm('');
                  setIsOpen(!isOpen);
                }
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 focus:outline-none transition cursor-pointer"
            >
              <i
                className={`fa-solid fa-chevron-down text-[10px] text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-red-500' : ''
                }`}
              ></i>
            </button>
          </div>
        </div>
      ) : (
        /* 2. TRƯỜNG HỢP SELECT THƯỜNG (Chỉ chọn mục) */
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-xl text-xs font-bold text-slate-800 transition shadow-sm cursor-pointer select-none text-left ${
            disabled
              ? 'opacity-60 bg-slate-100 cursor-not-allowed border-slate-200'
              : isOpen
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
        >
          <span className="flex items-center gap-2 truncate">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            <span className={`truncate ${!selectedOption ? 'text-slate-400 font-normal' : 'text-slate-800'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>

          <i
            className={`fa-solid fa-chevron-down text-[10px] text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-red-500' : ''
            }`}
          ></i>
        </button>
      )}

      {/* Menu thả xuống nổi cao cấp (Floating Card) */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
          style={{ minWidth: '100%' }}
        >
          {/* Ô tìm kiếm nhanh cho danh sách dài (Select thường) */}
          {shouldShowSearch && (
            <div className="p-1 border-b border-slate-100 mb-1">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-400 text-xs"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 focus:bg-white transition"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Danh sách các tùy chọn */}
          <div className="max-h-56 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-slate-400 font-medium">
                {allowCustomInput ? (
                  <span>
                    Chưa có gợi ý có sẵn.<br/>
                    <span className="text-[11px] text-slate-500 font-bold mt-1 inline-block">
                      Dùng giá trị vừa nhập: <strong className="text-slate-800">&ldquo;{value}&rdquo;</strong>
                    </span>
                  </span>
                ) : (
                  'Không tìm thấy kết quả phù hợp'
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <i className="fa-solid fa-check text-red-600 text-xs shrink-0"></i>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
