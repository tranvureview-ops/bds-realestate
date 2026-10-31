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
      sublabel: opt.sublabel,
      disabled: Boolean(opt.disabled),
      onDisabledClick: opt.onDisabledClick
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
                className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition cursor-pointer"
                title="Xóa lựa chọn"
                aria-label="Xóa lựa chọn"
              >
                <i className="fa-solid fa-xmark text-[11px]" aria-hidden="true"></i>
                <span className="sr-only">Xóa lựa chọn</span>
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
              className="text-slate-400 hover:text-slate-600 p-0.5 focus:outline-none transition cursor-pointer disabled:cursor-not-allowed"
              title={placeholder ? `Mở rộng danh sách ${placeholder}` : 'Mở rộng danh sách lựa chọn'}
              aria-label={placeholder ? `Mở rộng danh sách ${placeholder}` : 'Mở rộng danh sách lựa chọn'}
              aria-expanded={isOpen}
            >
              <i
                className={`fa-solid fa-chevron-down text-[10px] text-slate-600 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-red-600' : ''
                }`}
                aria-hidden="true"
              ></i>
              <span className="sr-only">
                {placeholder ? `Mở rộng danh sách ${placeholder}` : 'Mở rộng danh sách lựa chọn'}
              </span>
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
          aria-label={selectedOption ? `${placeholder || 'Chọn'}: ${selectedOption.label}` : (placeholder || 'Chọn một mục')}
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 truncate">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            <span className={`truncate ${!selectedOption ? 'text-slate-400 font-normal' : 'text-slate-800'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>

          <i
            className={`fa-solid fa-chevron-down text-[10px] text-slate-600 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-red-600' : ''
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
            {/* Mục ưu tiên: Cho phép chọn giá trị người dùng vừa gõ (Nếu chưa có trong danh mục) */}
            {allowCustomInput && (value || searchTerm)?.trim() && (
              <div
                onClick={() => handleSelect((value || searchTerm).trim())}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 cursor-pointer transition mb-1 shadow-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <i className="fa-solid fa-plus-circle text-blue-600 text-sm shrink-0"></i>
                  <span className="truncate">
                    Dùng tên đường bạn nhập: <strong className="text-blue-950 underline">&ldquo;{(value || searchTerm).trim()}&rdquo;</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-md shrink-0">
                  Chọn mục này ↵
                </span>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-2 px-2 text-center text-xs text-slate-400 font-medium">
                {allowCustomInput ? (
                  <div
                    onClick={() => handleSelect((value || searchTerm || '').trim())}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl cursor-pointer transition text-left"
                  >
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="fa-solid fa-map-pin text-blue-600 text-sm"></i>
                      <span>Tên đường này chưa có trong danh mục gợi ý</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold mt-1">
                      Bấm vào đây để sử dụng: <strong className="underline text-blue-950">&ldquo;{(value || searchTerm || '').trim()}&rdquo;</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      (Google Maps Geocoding sẽ tự động định vị vị trí con đường này)
                    </div>
                  </div>
                ) : (
                  'Không tìm thấy kết quả phù hợp'
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const isDisabled = Boolean(opt.disabled);
                return (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.stopPropagation();
                        if (opt.onDisabledClick) opt.onDisabledClick();
                        return;
                      }
                      handleSelect(opt.value);
                    }}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold select-none transition ${
                      isDisabled
                        ? 'opacity-70 bg-slate-50/80 cursor-not-allowed text-slate-400 hover:bg-amber-50/60'
                        : isSelected
                        ? 'bg-red-50 text-red-600 font-bold cursor-pointer'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isDisabled
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                    </span>

                    {isDisabled ? (
                      <i className="fa-solid fa-lock text-amber-500 text-xs shrink-0"></i>
                    ) : isSelected ? (
                      <i className="fa-solid fa-check text-red-600 text-xs shrink-0"></i>
                    ) : null}
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
