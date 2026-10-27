'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PROPERTY_TYPES } from '../data/mockData';

const DA_NANG_DISTRICTS = [
  'Quận Hải Châu',
  'Quận Thanh Khê',
  'Quận Sơn Trà',
  'Quận Ngũ Hành Sơn',
  'Quận Liên Chiểu',
  'Quận Cẩm Lệ',
  'Huyện Hòa Vang'
];

const DIRECTIONS = [
  { value: 'all', label: 'Tất cả hướng' },
  { value: 'Đông', label: 'Đông' },
  { value: 'Tây', label: 'Tây' },
  { value: 'Nam', label: 'Nam' },
  { value: 'Bắc', label: 'Bắc' },
  { value: 'Đông Nam', label: 'Đông Nam' },
  { value: 'Đông Bắc', label: 'Đông Bắc' },
  { value: 'Tây Nam', label: 'Tây Nam' },
  { value: 'Tây Bắc', label: 'Tây Bắc' }
];

export default function ListingFilterBar({
  filters = {},
  setFilters,
  demand = 'sale',
  taxonomyInfo = null,
  className = ''
}) {
  const [keywordInput, setKeywordInput] = useState(filters?.keyword || '');
  const [openDropdown, setOpenDropdown] = useState(null); // 'type' | 'price' | 'area' | null
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  const containerRef = useRef(null);

  // Đồng bộ keywordInput khi filters.keyword thay đổi từ URL hoặc chip
  useEffect(() => {
    setKeywordInput(filters?.keyword || '');
  }, [filters?.keyword]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleApplySearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      keyword: keywordInput.trim()
    }));
  };

  const handleToggleVerified = () => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      onlyVerified: !prev.onlyVerified
    }));
  };

  const handleToggleProAgent = () => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      onlyProAgent: !prev.onlyProAgent
    }));
  };

  const handleSelectPropertyType = (typeId) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      propertyType: typeId
    }));
    setOpenDropdown(null);
  };

  const handleSelectPriceRange = (rangeKey, minP = null, maxP = null) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      priceRange: rangeKey,
      minPrice: minP,
      maxPrice: maxP
    }));
    setOpenDropdown(null);
  };

  const handleSelectAreaRange = (rangeKey, minA = null, maxA = null) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      areaRange: rangeKey,
      minArea: minA,
      maxArea: maxA
    }));
    setOpenDropdown(null);
  };

  // Nhãn hiển thị cho Loại BĐS
  const getPropertyTypeLabel = () => {
    if (!filters.propertyType || filters.propertyType === 'all') return 'Loại nhà đất';
    const found = PROPERTY_TYPES.find(t => t.id === filters.propertyType);
    return found ? found.name : filters.propertyType;
  };

  // Nhãn hiển thị cho Khoảng Giá
  const getPriceRangeLabel = () => {
    if (!filters.priceRange || filters.priceRange === 'all') return 'Khoảng giá';
    if (demand === 'rent') {
      switch (filters.priceRange) {
        case 'under-5m': return '< 5 triệu';
        case '5m-10m': return '5 - 10 triệu';
        case '10m-20m': return '10 - 20 triệu';
        case '20m-40m': return '20 - 40 triệu';
        case 'over-40m': return '> 40 triệu';
        default: return filters.priceRange;
      }
    }
    switch (filters.priceRange) {
      case 'under-2b': return '< 2 tỷ';
      case '2b-5b': return '2 - 5 tỷ';
      case '5b-10b': return '5 - 10 tỷ';
      case '10b-30b': return '10 - 30 tỷ';
      case 'over-30b': return '> 30 tỷ';
      default: return filters.priceRange;
    }
  };

  // Nhãn hiển thị cho Diện Tích
  const getAreaRangeLabel = () => {
    if (!filters.areaRange || filters.areaRange === 'all') return 'Diện tích';
    switch (filters.areaRange) {
      case 'under-50': return '< 50 m²';
      case '50-100': return '50 - 100 m²';
      case '100-200': return '100 - 200 m²';
      case 'over-200': return '> 200 m²';
      default: return `${filters.areaRange} m²`;
    }
  };

  // Số lượng tiêu chí lọc nâng cao đang active
  const advancedCount = [
    Boolean(filters.district),
    Boolean(filters.bedroom && filters.bedroom !== 'all'),
    Boolean(filters.direction && filters.direction !== 'all'),
    Boolean(filters.hasVR360)
  ].filter(Boolean).length;

  return (
    <div ref={containerRef} className={`max-w-7xl mx-auto px-4 sm:px-8 mt-4 sm:mt-5 ${className}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4">
        {/* ROW 1: Search Input with Red "Tìm kiếm" button */}
        <form onSubmit={handleApplySearch} className="relative flex items-center border border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-xl bg-white transition p-1 sm:p-1.5">
          <i className="fa-solid fa-magnifying-glass text-slate-400 pl-3 pr-2 text-sm sm:text-base"></i>
          
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder={
              filters.propertyType && filters.propertyType !== 'all' 
                ? `${getPropertyTypeLabel()} - Nhập từ khóa, dự án, vị trí...` 
                : (demand === 'rent' ? 'Nhà riêng, căn hộ, mặt bằng cho thuê...' : 'Nhà riêng, căn hộ, biệt thự cần bán...')
            }
            className="flex-1 bg-transparent py-1.5 sm:py-2 px-1 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none min-w-0"
          />

          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput('');
                if (setFilters) setFilters(prev => ({ ...prev, keyword: '' }));
              }}
              className="text-slate-400 hover:text-slate-600 p-1.5 mr-1 transition cursor-pointer"
              title="Xóa từ khóa"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}

          <button
            type="submit"
            className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center shrink-0 cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        {/* ROW 2: Horizontal Quick Filter Dropdowns & Toggles */}
        <div className="flex items-center gap-2 sm:gap-2.5 mt-3 flex-wrap text-xs sm:text-sm">
          {/* 1. Nút "Lọc" (Mở bộ lọc nâng cao) */}
          <button
            type="button"
            onClick={() => setShowAdvancedModal(true)}
            className={`border rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
              advancedCount > 0
                ? 'border-red-500 bg-red-50/60 text-red-700 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <i className="fa-solid fa-filter text-xs"></i>
            <span>Lọc</span>
            {advancedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                {advancedCount}
              </span>
            )}
          </button>

          {/* 2. Switch "Tin xác thực" */}
          <button
            type="button"
            onClick={handleToggleVerified}
            className={`border rounded-lg px-3 py-1.5 sm:py-2 font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
              filters.onlyVerified
                ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Chỉ hiển thị tin đăng đã được BQT xác thực chính chủ"
          >
            <i className="fa-solid fa-circle-check text-emerald-600 text-xs sm:text-sm"></i>
            <span>Tin xác thực</span>
            <div className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ml-0.5 ${
              filters.onlyVerified ? 'bg-emerald-600' : 'bg-slate-300'
            }`}>
              <span className={`inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                filters.onlyVerified ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {/* 3. Dropdown "Loại nhà đất ⌵" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'type' ? null : 'type')}
              className={`border rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                filters.propertyType && filters.propertyType !== 'all'
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getPropertyTypeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Loại nhà đất */}
            {openDropdown === 'type' && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chọn Loại Bất Động Sản
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectPropertyType('all')}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      (!filters.propertyType || filters.propertyType === 'all') ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                    }`}
                  >
                    <span>Tất cả loại nhà đất</span>
                    {(!filters.propertyType || filters.propertyType === 'all') && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                  </button>

                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleSelectPropertyType(type.id)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        filters.propertyType === type.id ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${type.icon} text-slate-400 text-xs w-4 text-center`}></i>
                        <span>{type.name}</span>
                      </div>
                      {filters.propertyType === type.id && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Dropdown "Khoảng giá ⌵" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'price' ? null : 'price')}
              className={`border rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                filters.priceRange && filters.priceRange !== 'all'
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getPriceRangeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Khoảng giá */}
            {openDropdown === 'price' && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chọn Khoảng Giá
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectPriceRange('all')}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      (!filters.priceRange || filters.priceRange === 'all') ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                    }`}
                  >
                    <span>Tất cả mức giá</span>
                    {(!filters.priceRange || filters.priceRange === 'all') && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                  </button>

                  {(demand === 'rent'
                    ? [
                        { key: 'under-5m', label: 'Dưới 5 triệu' },
                        { key: '5m-10m', label: '5 - 10 triệu' },
                        { key: '10m-20m', label: '10 - 20 triệu' },
                        { key: '20m-40m', label: '20 - 40 triệu' },
                        { key: 'over-40m', label: 'Trên 40 triệu' }
                      ]
                    : [
                        { key: 'under-2b', label: 'Dưới 2 tỷ' },
                        { key: '2b-5b', label: '2 - 5 tỷ' },
                        { key: '5b-10b', label: '5 - 10 tỷ' },
                        { key: '10b-30b', label: '10 - 30 tỷ' },
                        { key: 'over-30b', label: 'Trên 30 tỷ' }
                      ]
                  ).map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectPriceRange(item.key)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        filters.priceRange === item.key ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {filters.priceRange === item.key && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Dropdown "Diện tích ⌵" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'area' ? null : 'area')}
              className={`border rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                filters.areaRange && filters.areaRange !== 'all'
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getAreaRangeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'area' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Diện tích */}
            {openDropdown === 'area' && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chọn Diện Tích
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectAreaRange('all')}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      (!filters.areaRange || filters.areaRange === 'all') ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                    }`}
                  >
                    <span>Tất cả diện tích</span>
                    {(!filters.areaRange || filters.areaRange === 'all') && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                  </button>

                  {[
                    { key: 'under-50', label: 'Dưới 50 m²' },
                    { key: '50-100', label: '50 - 100 m²' },
                    { key: '100-200', label: '100 - 200 m²' },
                    { key: 'over-200', label: 'Trên 200 m²' }
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectAreaRange(item.key)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        filters.areaRange === item.key ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {filters.areaRange === item.key && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Switch "Môi giới chuyên nghiệp" */}
          <button
            type="button"
            onClick={handleToggleProAgent}
            className={`border rounded-lg px-3 py-1.5 sm:py-2 font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
              filters.onlyProAgent
                ? 'border-cyan-500 bg-cyan-50/60 text-cyan-800 font-bold'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Chỉ hiển thị bài đăng từ môi giới chuyên nghiệp hoặc hội viên uy tín"
          >
            <i className="fa-solid fa-award text-cyan-600 text-xs sm:text-sm"></i>
            <span>Môi giới chuyên nghiệp</span>
            <div className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 items-center rounded-full transition-colors ml-0.5 ${
              filters.onlyProAgent ? 'bg-cyan-600' : 'bg-slate-300'
            }`}>
              <span className={`inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                filters.onlyProAgent ? 'translate-x-3.5 sm:translate-x-4.5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* POPUP MODAL: BỘ LỌC NÂNG CAO (KHI BẤM NÚT "LỌC") */}
      {showAdvancedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                  <i className="fa-solid fa-filter"></i>
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Bộ Lọc Tìm Kiếm Nâng Cao
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Quận / Huyện */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <i className="fa-solid fa-map-pin text-red-600"></i>
                  Quận / Huyện:
                </label>
                <select
                  value={filters.district || ''}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500"
                >
                  <option value="">Tất cả Quận / Huyện</option>
                  {DA_NANG_DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Số phòng ngủ */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <i className="fa-solid fa-bed text-purple-600"></i>
                  Số phòng ngủ:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 'all', label: 'Tất cả' },
                    { val: '1', label: '1 PN' },
                    { val: '2', label: '2 PN' },
                    { val: '3', label: '3 PN' },
                    { val: '4+', label: '4+ PN' },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFilters && setFilters(prev => ({ ...prev, bedroom: item.val }))}
                      className={`py-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                        (filters.bedroom || 'all') === item.val
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hướng nhà */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <i className="fa-solid fa-compass text-amber-600"></i>
                  Hướng nhà:
                </label>
                <select
                  value={filters.direction || 'all'}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, direction: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500"
                >
                  {DIRECTIONS.map(dir => (
                    <option key={dir.value} value={dir.value}>{dir.label}</option>
                  ))}
                </select>
              </div>

              {/* VR 360 */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.hasVR360)}
                    onChange={(e) => setFilters && setFilters(prev => ({ ...prev, hasVR360: e.target.checked }))}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="fa-solid fa-vr-cardboard text-indigo-600"></i>
                      <span>Xem nhà thực tế ảo (VR 360)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Chỉ lọc bất động sản có tích hợp video thực tế ảo 360°</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (setFilters) {
                    setFilters(prev => ({
                      ...prev,
                      district: '',
                      bedroom: 'all',
                      direction: 'all',
                      hasVR360: false
                    }));
                  }
                }}
                className="text-slate-500 hover:text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Thiết lập lại</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedModal(false)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
