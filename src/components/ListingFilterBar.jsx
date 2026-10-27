'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PROPERTY_TYPES } from '../data/mockData';
import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData';
import { removeAccents } from '../utils/propertyFilter';

const CITIES = [
  'Đà Nẵng',
  'Quảng Nam',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Khánh Hòa'
];

const SALE_PRICE_PRESETS = [
  { value: 'all', label: 'Tất cả khoảng giá', min: null, max: null },
  { value: 'under-2b', label: 'Dưới 2 tỷ', min: null, max: 2000000000 },
  { value: '2b-5b', label: '2 - 5 tỷ', min: 2000000000, max: 5000000000 },
  { value: '5b-10b', label: '5 - 10 tỷ', min: 5000000000, max: 10000000000 },
  { value: '10b-30b', label: '10 - 30 tỷ', min: 10000000000, max: 30000000000 },
  { value: 'over-30b', label: 'Trên 30 tỷ', min: 30000000000, max: null }
];

const RENT_PRICE_PRESETS = [
  { value: 'all', label: 'Tất cả khoảng giá', min: null, max: null },
  { value: 'under-5m', label: 'Dưới 5 triệu', min: null, max: 5000000 },
  { value: '5m-10m', label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { value: '10m-20m', label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { value: '20m-40m', label: '20 - 40 triệu', min: 20000000, max: 40000000 },
  { value: 'over-40m', label: 'Trên 40 triệu', min: 40000000, max: null }
];

const AREA_PRESETS = [
  { value: 'all', label: 'Tất cả diện tích', min: null, max: null },
  { value: 'under-50', label: 'Dưới 50 m²', min: null, max: 50 },
  { value: '50-100', label: '50 - 100 m²', min: 50, max: 100 },
  { value: '100-200', label: '100 - 200 m²', min: 100, max: 200 },
  { value: 'over-200', label: 'Trên 200 m²', min: 200, max: null }
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
  const [modalScreen, setModalScreen] = useState('main'); // 'main' | 'location' | 'price' | 'area' | 'type'

  // Draft filters state for modal - only applied when clicking "Xem kết quả"
  const [draftFilters, setDraftFilters] = useState({
    demand: filters?.demand || demand || 'sale',
    propertyType: filters?.propertyType || 'all',
    city: filters?.city || '',
    district: filters?.district || '',
    ward: filters?.ward || '',
    street: filters?.street || '',
    project: filters?.project || '',
    useMergedAddress: false,
    priceRange: filters?.priceRange || 'all',
    minPrice: filters?.minPrice ?? null,
    maxPrice: filters?.maxPrice ?? null,
    areaRange: filters?.areaRange || 'all',
    minArea: filters?.minArea ?? null,
    maxArea: filters?.maxArea ?? null,
    bedroom: filters?.bedroom || 'all',
    direction: filters?.direction || 'all',
    hasVR360: Boolean(filters?.hasVR360),
    onlyVerified: Boolean(filters?.onlyVerified)
  });

  const containerRef = useRef(null);

  // Sync keywordInput with filters.keyword
  useEffect(() => {
    setKeywordInput(filters?.keyword || '');
  }, [filters?.keyword]);

  // Click outside to close quick dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Open modal and load current active filters into draft
  const handleOpenAdvancedModal = () => {
    setDraftFilters({
      demand: filters?.demand || demand || 'sale',
      propertyType: filters?.propertyType || 'all',
      city: filters?.city || '',
      district: filters?.district || '',
      ward: filters?.ward || '',
      street: filters?.street || '',
      project: filters?.project || '',
      useMergedAddress: false,
      priceRange: filters?.priceRange || 'all',
      minPrice: filters?.minPrice ?? null,
      maxPrice: filters?.maxPrice ?? null,
      areaRange: filters?.areaRange || 'all',
      minArea: filters?.minArea ?? null,
      maxArea: filters?.maxArea ?? null,
      bedroom: filters?.bedroom || 'all',
      direction: filters?.direction || 'all',
      hasVR360: Boolean(filters?.hasVR360),
      onlyVerified: Boolean(filters?.onlyVerified)
    });
    setModalScreen('main');
    setShowAdvancedModal(true);
  };

  // Apply draft filters when clicking "Xem kết quả"
  const handleApplyAllDraftFilters = () => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        demand: draftFilters.demand,
        propertyType: draftFilters.propertyType,
        city: draftFilters.city,
        district: draftFilters.district,
        ward: draftFilters.ward,
        street: draftFilters.street,
        project: draftFilters.project,
        priceRange: draftFilters.priceRange,
        minPrice: draftFilters.minPrice,
        maxPrice: draftFilters.maxPrice,
        areaRange: draftFilters.areaRange,
        minArea: draftFilters.minArea,
        maxArea: draftFilters.maxArea,
        bedroom: draftFilters.bedroom,
        direction: draftFilters.direction,
        hasVR360: draftFilters.hasVR360,
        onlyVerified: draftFilters.onlyVerified
      }));
    }
    setShowAdvancedModal(false);
  };

  // Reset main draft filters
  const handleResetMainDraft = () => {
    setDraftFilters(prev => ({
      ...prev,
      demand: demand || 'sale',
      propertyType: 'all',
      city: 'Đà Nẵng',
      district: '',
      ward: '',
      street: '',
      project: '',
      useMergedAddress: false,
      priceRange: 'all',
      minPrice: null,
      maxPrice: null,
      areaRange: 'all',
      minArea: null,
      maxArea: null,
      bedroom: 'all',
      direction: 'all',
      hasVR360: false,
      onlyVerified: false
    }));
  };

  // Search input submission
  const handleApplySearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      keyword: keywordInput.trim()
    }));
  };

  // Quick bar toggles
  const handleToggleVerified = () => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      onlyVerified: !prev.onlyVerified
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

  const handleSelectQuickLocation = (cityVal = '', districtVal = '') => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      city: cityVal,
      district: districtVal,
      ward: '',
      street: '',
      project: ''
    }));
    setOpenDropdown(null);
  };

  const getLocationQuickLabel = () => {
    if (filters?.district) return filters.district;
    if (filters?.city) return filters.city;
    return 'Khu vực';
  };

  // Labels for quick filter buttons
  const getPropertyTypeLabel = (typeId = filters?.propertyType) => {
    if (!typeId || typeId === 'all') return 'Loại nhà đất';
    const found = PROPERTY_TYPES.find(t => t.id === typeId);
    return found ? found.name : typeId;
  };

  const getPriceRangeLabel = (rangeKey = filters?.priceRange, currentDemand = demand) => {
    if (!rangeKey || rangeKey === 'all') return 'Khoảng giá';
    if (currentDemand === 'rent') {
      switch (rangeKey) {
        case 'under-5m': return '< 5 triệu';
        case '5m-10m': return '5 - 10 triệu';
        case '10m-20m': return '10 - 20 triệu';
        case '20m-40m': return '20 - 40 triệu';
        case 'over-40m': return '> 40 triệu';
        default: return rangeKey;
      }
    }
    switch (rangeKey) {
      case 'under-2b': return '< 2 tỷ';
      case '2b-5b': return '2 - 5 tỷ';
      case '5b-10b': return '5 - 10 tỷ';
      case '10b-30b': return '10 - 30 tỷ';
      case 'over-30b': return '> 30 tỷ';
      default: return rangeKey;
    }
  };

  const getAreaRangeLabel = (rangeKey = filters?.areaRange) => {
    if (!rangeKey || rangeKey === 'all') return 'Diện tích';
    switch (rangeKey) {
      case 'under-50': return '< 50 m²';
      case '50-100': return '50 - 100 m²';
      case '100-200': return '100 - 200 m²';
      case 'over-200': return '> 200 m²';
      default: return `${rangeKey} m²`;
    }
  };

  // Summary labels for Modal rows (Screenshot 1)
  const getLocationSummary = () => {
    const parts = [];
    if (draftFilters.project) parts.push(draftFilters.project);
    if (draftFilters.street) parts.push(draftFilters.street);
    if (draftFilters.ward) parts.push(draftFilters.ward);
    if (draftFilters.district) parts.push(draftFilters.district);
    if (parts.length > 0) return parts.join(', ');
    if (draftFilters.city && draftFilters.city !== 'Toàn quốc') return draftFilters.city;
    return 'Trên toàn quốc';
  };

  const getPriceSummary = () => {
    if (!draftFilters.priceRange || draftFilters.priceRange === 'all') {
      if (draftFilters.minPrice || draftFilters.maxPrice) {
        const unit = draftFilters.demand === 'rent' ? 'triệu' : 'tỷ';
        const div = draftFilters.demand === 'rent' ? 1e6 : 1e9;
        const minStr = draftFilters.minPrice ? `${draftFilters.minPrice / div}` : '0';
        const maxStr = draftFilters.maxPrice ? `${draftFilters.maxPrice / div}` : 'Không giới hạn';
        return `${minStr} - ${maxStr} ${unit}`;
      }
      return 'Tất cả';
    }
    return getPriceRangeLabel(draftFilters.priceRange, draftFilters.demand);
  };

  const getAreaSummary = () => {
    if (!draftFilters.areaRange || draftFilters.areaRange === 'all') {
      if (draftFilters.minArea || draftFilters.maxArea) {
        return `${draftFilters.minArea || 0} - ${draftFilters.maxArea || 'Không giới hạn'} m²`;
      }
      return 'Tất cả';
    }
    return getAreaRangeLabel(draftFilters.areaRange);
  };

  // Location data calculations for Screenshot 2 (Hỗ trợ đầy đủ Đà Nẵng, Quảng Nam...)
  const currentCityData = useMemo(() => {
    const targetCity = draftFilters.city || 'Đà Nẵng';
    return VIETNAM_ADMINISTRATIVE_DATA.find(c => 
      c.name.toLowerCase() === targetCity.toLowerCase() || 
      removeAccents(c.name) === removeAccents(targetCity)
    ) || VIETNAM_ADMINISTRATIVE_DATA[0];
  }, [draftFilters.city]);

  const districtList = useMemo(() => {
    return currentCityData?.districts || [];
  }, [currentCityData]);

  const currentDistrictObj = useMemo(() => {
    if (!draftFilters.district) return null;
    return districtList.find(d => d.name === draftFilters.district) || null;
  }, [draftFilters.district, districtList]);

  const wardList = useMemo(() => {
    if (draftFilters.useMergedAddress) {
      const filtered = draftFilters.district
        ? DANANG_MERGERS_MAP.filter(m => m.newDistrict === draftFilters.district)
        : DANANG_MERGERS_MAP;
      return Array.from(new Set(filtered.map(m => m.newWard)));
    }
    if (currentDistrictObj?.wards) {
      return currentDistrictObj.wards;
    }
    return [];
  }, [draftFilters.useMergedAddress, draftFilters.district, currentDistrictObj]);

  const streetList = useMemo(() => {
    return currentDistrictObj?.streets || [];
  }, [currentDistrictObj]);

  const projectList = useMemo(() => {
    return currentDistrictObj?.projects || [];
  }, [currentDistrictObj]);

  // Count active advanced criteria
  const advancedCount = [
    Boolean(filters.district),
    Boolean(filters.ward),
    Boolean(filters.street),
    Boolean(filters.project),
    Boolean(filters.bedroom && filters.bedroom !== 'all'),
    Boolean(filters.direction && filters.direction !== 'all'),
    Boolean(filters.hasVR360),
    Boolean(filters.onlyVerified)
  ].filter(Boolean).length;

  return (
    <div ref={containerRef} className={`max-w-7xl mx-auto px-3 sm:px-8 mt-3 sm:mt-5 relative z-30 ${className}`}>
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs p-2.5 sm:p-4 relative z-30 overflow-visible">
        {/* ROW 1: Search Input with Red "Tìm kiếm" button */}
        <form onSubmit={handleApplySearch} className="relative flex items-center border border-slate-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-lg sm:rounded-xl bg-white transition p-1 sm:p-1.5">
          <i className="fa-solid fa-magnifying-glass text-slate-400 pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 text-xs sm:text-sm"></i>
          
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder={
              filters.propertyType && filters.propertyType !== 'all' 
                ? `${getPropertyTypeLabel()} - Nhập từ khóa, vị trí...` 
                : (demand === 'rent' ? 'Căn hộ, nhà riêng, mặt bằng...' : 'Nhà riêng, căn hộ, biệt thự...')
            }
            className="flex-1 bg-transparent py-1 sm:py-2 px-1 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none min-w-0"
          />

          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput('');
                if (setFilters) setFilters(prev => ({ ...prev, keyword: '' }));
              }}
              className="text-slate-400 hover:text-slate-600 p-1 mr-0.5 sm:mr-1 transition cursor-pointer"
              title="Xóa từ khóa"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 sm:px-7 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center shrink-0 cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        {/* ROW 2: Horizontal Quick Filter Dropdowns & Toggles (Đầy đủ Khu vực, Loại BĐS, Giá, Diện tích) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 mt-2 sm:mt-3 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 sm:pb-0 sm:flex-wrap text-xs sm:text-sm relative z-30">
          {/* 1. Nút "Lọc" (Mở bộ lọc phong cách Batdongsan) */}
          <button
            type="button"
            onClick={handleOpenAdvancedModal}
            className={`shrink-0 border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
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
            className={`shrink-0 border rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer shadow-2xs ${
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

          {/* 2.5. Dropdown "Khu vực ⌵" (TP. Đà Nẵng & Tỉnh Quảng Nam) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'location' ? null : 'location')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                filters.city || filters.district
                  ? 'border-red-500 bg-red-50/60 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <i className="fa-solid fa-location-dot text-slate-400 text-xs"></i>
              <span>{getLocationQuickLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Khu vực */}
            {openDropdown === 'location' && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2 animate-fadeIn max-h-96 overflow-y-auto">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Khu Vực Bất Động Sản</span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalScreen('location');
                      setShowAdvancedModal(true);
                      setOpenDropdown(null);
                    }}
                    className="text-red-600 hover:underline text-[11px] font-bold normal-case cursor-pointer"
                  >
                    Lọc chi tiết »
                  </button>
                </div>

                {/* Option 1: Toàn quốc / Tất cả */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickLocation('', '')}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                    (!filters.city && !filters.district) ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                  }`}
                >
                  <span className="font-semibold">Tất cả Khu Vực (Toàn quốc)</span>
                  {(!filters.city && !filters.district) && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                </button>

                {/* GROUP 1: TP. ĐÀ NẴNG */}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 flex items-center justify-between">
                    <span>TP. ĐÀ NẴNG</span>
                    <button
                      type="button"
                      onClick={() => handleSelectQuickLocation('Đà Nẵng', '')}
                      className="text-[10px] text-emerald-800 underline font-semibold hover:text-emerald-950 cursor-pointer"
                    >
                      Toàn TP. Đà Nẵng
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5 px-2 py-1">
                    {['Quận Hải Châu', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Thanh Khê', 'Quận Liên Chiểu', 'Quận Cẩm Lệ', 'Huyện Hòa Vang'].map(dName => (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => handleSelectQuickLocation('Đà Nẵng', dName)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition cursor-pointer ${
                          filters.district === dName ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {dName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GROUP 2: TỈNH QUẢNG NAM */}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50/70 flex items-center justify-between">
                    <span>TỈNH QUẢNG NAM</span>
                    <button
                      type="button"
                      onClick={() => handleSelectQuickLocation('Quảng Nam', '')}
                      className="text-[10px] text-blue-800 underline font-semibold hover:text-blue-950 cursor-pointer"
                    >
                      Toàn Tỉnh Quảng Nam
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5 px-2 py-1">
                    {['Thành phố Hội An', 'Thị xã Điện Bàn', 'Thành phố Tam Kỳ', 'Huyện Duy Xuyên', 'Huyện Thăng Bình', 'Huyện Núi Thành'].map(dName => (
                      <button
                        key={dName}
                        type="button"
                        onClick={() => handleSelectQuickLocation('Quảng Nam', dName)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition cursor-pointer ${
                          filters.district === dName ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {dName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dropdown "Loại nhà đất ⌵" */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'type' ? null : 'type')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
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
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'price' ? null : 'price')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
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
                  {(demand === 'rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS).map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelectPriceRange(item.value, item.min, item.max)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        (filters.priceRange || 'all') === item.value ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {(filters.priceRange || 'all') === item.value && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Dropdown "Diện tích ⌵" */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpenDropdown(prev => prev === 'area' ? null : 'area')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
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
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Chọn Diện Tích
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {AREA_PRESETS.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelectAreaRange(item.value, item.min, item.max)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        (filters.areaRange || 'all') === item.value ? 'text-red-600 font-bold bg-red-50/40' : 'text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {(filters.areaRange || 'all') === item.value && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          POPUP MODAL: BỘ LỌC TÌM KIẾM CHUẨN BATDONGSAN (ẢNH 1 & ẢNH 2)
         ======================================================== */}
      {showAdvancedModal && (
        <div
          onClick={() => setShowAdvancedModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]"
          >
            {/* ----------------------------------------------------
                MODAL SCREEN 1: BỘ LỌC CHÍNH (ẢNH 1)
               ---------------------------------------------------- */}
            {modalScreen === 'main' && (
              <>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Bộ lọc
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
                  {/* 1. Demand Tabs: Tìm mua / Tìm thuê */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDraftFilters(prev => ({ ...prev, demand: 'sale' }))}
                      className={`py-2.5 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer text-center ${
                        draftFilters.demand === 'sale'
                          ? 'bg-[#3e3e3e] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tìm mua
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftFilters(prev => ({ ...prev, demand: 'rent' }))}
                      className={`py-2.5 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer text-center ${
                        draftFilters.demand === 'rent'
                          ? 'bg-[#3e3e3e] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tìm thuê
                    </button>
                  </div>

                  {/* 2. Loại bất động sản */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-sm">
                        Loại bất động sản
                      </label>
                      <button
                        type="button"
                        onClick={() => setModalScreen('type')}
                        className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-[10px]"></i>
                        <span>Thêm</span>
                      </button>
                    </div>

                    {draftFilters.propertyType && draftFilters.propertyType !== 'all' ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
                          <span>{getPropertyTypeLabel(draftFilters.propertyType)}</span>
                          <button
                            type="button"
                            onClick={() => setDraftFilters(prev => ({ ...prev, propertyType: 'all' }))}
                            className="hover:text-red-900 ml-0.5 text-xs font-bold"
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => setModalScreen('type')}
                        className="p-3 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-400 bg-white"
                      >
                        <span className="text-slate-500 font-medium">Tất cả loại nhà đất</span>
                        <i className="fa-solid fa-chevron-right text-xs text-slate-400"></i>
                      </div>
                    )}
                  </div>

                  {/* 3. Khu vực & Dự án (Chuyển sang Ảnh 2 khi bấm) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 text-sm">
                      Khu vực & Dự án
                    </label>
                    <div
                      onClick={() => setModalScreen('location')}
                      className="p-3 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-400 bg-white transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <i className="fa-solid fa-location-dot text-slate-500 text-sm shrink-0"></i>
                        <span className="text-slate-800 font-medium truncate">
                          {getLocationSummary()}
                        </span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0 ml-2"></i>
                    </div>
                  </div>

                  {/* 4. Khoảng giá */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 text-sm">
                      Khoảng giá
                    </label>
                    <div
                      onClick={() => setModalScreen('price')}
                      className="p-3 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-400 bg-white transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full border border-slate-400 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                          ₫
                        </span>
                        <span className="text-slate-800 font-medium truncate">
                          {getPriceSummary()}
                        </span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0 ml-2"></i>
                    </div>
                  </div>

                  {/* 5. Diện tích */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-900 text-sm">
                      Diện tích
                    </label>
                    <div
                      onClick={() => setModalScreen('area')}
                      className="p-3 border border-slate-300 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-400 bg-white transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <i className="fa-solid fa-ruler-combined text-slate-500 text-sm shrink-0"></i>
                        <span className="text-slate-800 font-medium truncate">
                          {getAreaSummary()}
                        </span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-slate-400 shrink-0 ml-2"></i>
                    </div>
                  </div>

                  {/* 6. Uy tín & Chất lượng (Khuyên dùng) */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-900 text-sm">
                        Uy tín & Chất lượng
                      </label>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Khuyên dùng
                      </span>
                    </div>

                    {/* Card 1: Tin xác thực */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                            <span>Tin xác thực</span>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            <span className="font-semibold text-slate-700 block mb-0.5">Hệ thống Đất Biển Đà Nẵng đã xác thực:</span>
                            <div>• Có sổ đỏ/hợp đồng mua bán chính chủ</div>
                            <div>• Đúng địa chỉ, hình ảnh & đặc điểm thực tế</div>
                            <div>• Trong khoảng giá thị trường chuẩn xác</div>
                          </div>
                        </div>

                        {/* Switch */}
                        <button
                          type="button"
                          onClick={() => setDraftFilters(prev => ({ ...prev, onlyVerified: !prev.onlyVerified }))}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer mt-1 ${
                            draftFilters.onlyVerified ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                            draftFilters.onlyVerified ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 7. Tiêu chí chi tiết khác: Số PN, Hướng nhà, VR360 */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="font-bold text-slate-900 text-sm block">
                      Số phòng ngủ & Hướng nhà
                    </label>

                    {/* Số phòng ngủ */}
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
                          onClick={() => setDraftFilters(prev => ({ ...prev, bedroom: item.val }))}
                          className={`py-2 rounded-xl font-bold border transition text-center cursor-pointer text-xs ${
                            (draftFilters.bedroom || 'all') === item.val
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Hướng nhà */}
                    <select
                      value={draftFilters.direction || 'all'}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, direction: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-none focus:border-red-500"
                    >
                      {DIRECTIONS.map(dir => (
                        <option key={dir.value} value={dir.value}>{dir.label}</option>
                      ))}
                    </select>

                    {/* VR 360 */}
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(draftFilters.hasVR360)}
                        onChange={(e) => setDraftFilters(prev => ({ ...prev, hasVR360: e.target.checked }))}
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

                {/* Footer (Ảnh 1) */}
                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetMainDraft}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
                  >
                    Đặt lại
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAllDraftFilters}
                    className="flex-1 py-3 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Xem kết quả
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 2: KHU VỰC, DỰ ÁN (ẢNH 2 CHUẨN BATDONGSAN)
               ---------------------------------------------------- */}
            {modalScreen === 'location' && (
              <>
                {/* Header Sub-screen */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 hover:text-red-600 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                    <span>Khu vực, dự án</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
                  {/* Switch: Tìm theo địa chỉ mới sau sáp nhập */}
                  <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      Tìm theo địa chỉ mới sau sáp nhập
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraftFilters(prev => ({ ...prev, useMergedAddress: !prev.useMergedAddress }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        draftFilters.useMergedAddress ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        draftFilters.useMergedAddress ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* 1. Tỉnh/Thành phố */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={draftFilters.city || ''}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setDraftFilters(prev => ({
                          ...prev,
                          city: newCity,
                          district: '',
                          ward: '',
                          street: '',
                          project: ''
                        }));
                      }}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="">Tất cả Tỉnh/Thành phố (Toàn quốc)</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Quận/Huyện */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                      Quận/Huyện
                    </label>
                    <select
                      value={draftFilters.district || ''}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDraftFilters(prev => ({
                          ...prev,
                          district: newDist,
                          ward: '',
                          street: '',
                          project: ''
                        }));
                      }}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="">{draftFilters.city ? `Tất cả Quận/Huyện tại ${draftFilters.city}` : 'Tất cả Quận/Huyện'}</option>
                      {districtList.map(dist => (
                        <option key={dist.id || dist.name} value={dist.name}>{dist.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Phường/Xã */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                      Phường/Xã
                    </label>
                    <select
                      value={draftFilters.ward || ''}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, ward: e.target.value }))}
                      disabled={wardList.length === 0}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wardList.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Đường/Phố */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                      Đường/Phố
                    </label>
                    <select
                      value={draftFilters.street || ''}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, street: e.target.value }))}
                      disabled={streetList.length === 0}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Chọn Đường/Phố</option>
                      {streetList.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Dự án */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                      Dự án
                    </label>
                    <select
                      value={draftFilters.project || ''}
                      onChange={(e) => setDraftFilters(prev => ({ ...prev, project: e.target.value }))}
                      disabled={projectList.length === 0}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Chọn Dự án</option>
                      {projectList.map(pj => (
                        <option key={pj} value={pj}>{pj}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Sub-screen */}
                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftFilters(prev => ({
                        ...prev,
                        city: 'Đà Nẵng',
                        district: '',
                        ward: '',
                        street: '',
                        project: '',
                        useMergedAddress: false
                      }));
                    }}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
                  >
                    Đặt lại
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="flex-1 py-3 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Áp dụng
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 3: KHOẢNG GIÁ
               ---------------------------------------------------- */}
            {modalScreen === 'price' && (
              <>
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 hover:text-red-600 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                    <span>Khoảng giá</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    {(draftFilters.demand === 'rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS).map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setDraftFilters(prev => ({
                          ...prev,
                          priceRange: item.value,
                          minPrice: item.min,
                          maxPrice: item.max
                        }))}
                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer text-xs sm:text-sm ${
                          draftFilters.priceRange === item.value
                            ? 'bg-red-50 text-red-700 border-red-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDraftFilters(prev => ({ ...prev, priceRange: 'all', minPrice: null, maxPrice: null }))}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
                  >
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="flex-1 py-3 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Áp dụng
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 4: DIỆN TÍCH
               ---------------------------------------------------- */}
            {modalScreen === 'area' && (
              <>
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 hover:text-red-600 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                    <span>Diện tích</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    {AREA_PRESETS.map(item => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setDraftFilters(prev => ({
                          ...prev,
                          areaRange: item.value,
                          minArea: item.min,
                          maxArea: item.max
                        }))}
                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer text-xs sm:text-sm ${
                          draftFilters.areaRange === item.value
                            ? 'bg-red-50 text-red-700 border-red-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDraftFilters(prev => ({ ...prev, areaRange: 'all', minArea: null, maxArea: null }))}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
                  >
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="flex-1 py-3 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Áp dụng
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 5: LOẠI BẤT ĐỘNG SẢN
               ---------------------------------------------------- */}
            {modalScreen === 'type' && (
              <>
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 hover:text-red-600 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left text-sm"></i>
                    <span>Loại bất động sản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-2 overflow-y-auto text-xs flex-1">
                  <button
                    type="button"
                    onClick={() => setDraftFilters(prev => ({ ...prev, propertyType: 'all' }))}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      draftFilters.propertyType === 'all'
                        ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-xs sm:text-sm">Tất cả loại nhà đất</span>
                    {draftFilters.propertyType === 'all' && <i className="fa-solid fa-check text-red-600"></i>}
                  </button>

                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDraftFilters(prev => ({ ...prev, propertyType: type.id }))}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        draftFilters.propertyType === type.id
                          ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <i className={`fa-solid ${type.icon} text-slate-400 text-sm w-4 text-center`}></i>
                        <span className="font-semibold text-xs sm:text-sm">{type.name}</span>
                      </div>
                      {draftFilters.propertyType === type.id && <i className="fa-solid fa-check text-red-600"></i>}
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDraftFilters(prev => ({ ...prev, propertyType: 'all' }))}
                    className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
                  >
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalScreen('main')}
                    className="flex-1 py-3 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Áp dụng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
