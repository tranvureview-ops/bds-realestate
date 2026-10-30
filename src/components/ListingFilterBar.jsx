'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PROPERTY_TYPES, SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData';
import { removeAccents } from '../utils/propertyFilter';
import { formatPriceRangeText, formatAreaRangeText, buildSeoUrl } from '../utils/permalink';
import PropertyTypeSelector from './PropertyTypeSelector';
import PriceRangeSelector from './PriceRangeSelector';
import AreaRangeSelector from './AreaRangeSelector';
import { formatPropertyTypeTriggerLabel, getFlatPropertyTypes, getPropertyTypeDisplayName } from '../data/propertyTypeTaxonomy';

const CITIES = [
  'Đà Nẵng',
  'Quảng Nam',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Khánh Hòa'
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
  const effectiveDemand = (filters?.demand === 'rent' || taxonomyInfo?.demand === 'rent' || demand === 'rent') ? 'rent' : 'sale';

  const [keywordInput, setKeywordInput] = useState(filters?.keyword || '');
  const [openDropdown, setOpenDropdown] = useState(null); // 'type' | 'price' | 'area' | null
  const [expandedCity, setExpandedCity] = useState(filters?.city || '');
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [modalScreen, setModalScreen] = useState('main'); // 'main' | 'location' | 'price' | 'area' | 'type'

  // Draft filters state for modal - only applied when clicking "Xem kết quả"
  const [draftFilters, setDraftFilters] = useState({
    demand: effectiveDemand,
    propertyType: filters?.propertyType || 'all',
    propertyTypes: filters?.propertyTypes || (filters?.propertyType && filters?.propertyType !== 'all' ? filters.propertyType.split(',') : ['all']),
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

  const activeDraftTypes = useMemo(() => {
    const raw = draftFilters.propertyTypes || draftFilters.propertyType;
    if (!raw || raw === 'all') return [];
    if (Array.isArray(raw)) return raw.filter(id => id && id !== 'all');
    return raw.split(',').map(s => s.trim()).filter(id => id && id !== 'all');
  }, [draftFilters.propertyTypes, draftFilters.propertyType]);

  const containerRef = useRef(null);
  const openedFromQuickFilterRef = useRef(null); // 'location' | 'type' | 'price' | 'area' | null

  // Sync keywordInput with filters.keyword
  useEffect(() => {
    setKeywordInput(filters?.keyword || '');
  }, [filters?.keyword]);

  // Sync expandedCity when opening location dropdown or when filters.city changes
  useEffect(() => {
    if (openDropdown === 'location') {
      setExpandedCity(filters?.city || '');
    }
  }, [openDropdown, filters?.city]);

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

  // Lock body scroll on mobile/desktop when modal is open
  useEffect(() => {
    if (showAdvancedModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showAdvancedModal]);

  // Open modal and load current active filters into draft
  const handleOpenAdvancedModal = (initialScreen = 'main') => {
    const screen = (typeof initialScreen === 'string' && initialScreen) ? initialScreen : 'main';
    if (screen === 'main') {
      openedFromQuickFilterRef.current = null;
    }
    setDraftFilters({
      demand: filters?.demand || demand || 'sale',
      propertyType: filters?.propertyType || 'all',
      propertyTypes: filters?.propertyTypes || (filters?.propertyType && filters?.propertyType !== 'all' ? filters.propertyType.split(',') : ['all']),
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
    setModalScreen(screen);
    setShowAdvancedModal(true);
    setOpenDropdown(null);
  };

  const handleOpenLocationModal = () => {
    openedFromQuickFilterRef.current = 'location';
    handleOpenAdvancedModal('location');
  };

  // Mở bộ lọc nhanh: Trên mobile (< 768px) mở trực tiếp popup modal toàn màn hình, trên desktop mở dropdown
  const handleQuickFilterClick = (type) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      openedFromQuickFilterRef.current = type;
      handleOpenAdvancedModal(type);
      return;
    }
    setOpenDropdown(prev => prev === type ? null : type);
  };

  // Apply draft filters when clicking "Xem kết quả"
  const handleApplyAllDraftFilters = () => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        demand: draftFilters.demand,
        propertyType: draftFilters.propertyType,
        propertyTypes: draftFilters.propertyTypes,
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
      propertyTypes: ['all'],
      city: '',
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
  const getPropertyTypeLabel = (typeId = (filters?.propertyTypes || filters?.propertyType)) => {
    return formatPropertyTypeTriggerLabel(typeId, effectiveDemand, 'Loại nhà đất');
  };

  const getPriceRangeLabel = (rangeKey = filters?.priceRange, currentDemand = effectiveDemand) => {
    const isRent = currentDemand === 'rent';
    const mult = isRent ? 1e6 : 1e9;
    const u = isRent ? 'triệu' : 'tỷ';
    const minP = filters?.minPrice;
    const maxP = filters?.maxPrice;

    if (minP && maxP) {
      return `${Math.round(minP / mult * 10) / 10} - ${Math.round(maxP / mult * 10) / 10} ${u}`;
    } else if (maxP) {
      return `≤ ${Math.round(maxP / mult * 10) / 10} ${u}`;
    } else if (minP) {
      return `≥ ${Math.round(minP / mult * 10) / 10} ${u}`;
    }

    if (!rangeKey || rangeKey === 'all') return 'Khoảng giá';
    const presets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;
    const found = presets.find(p => p.value === rangeKey);
    if (found) {
      return found.label.replace('Dưới ', '≤ ').replace('Trên ', '≥ ');
    }
    return formatPriceRangeText(rangeKey).replace('Dưới ', '≤ ').replace('Trên ', '≥ ');
  };

  const getAreaRangeLabel = (rangeKey = filters?.areaRange) => {
    const minA = filters?.minArea;
    const maxA = filters?.maxArea;

    if (minA && maxA) {
      return `${minA} - ${maxA} m²`;
    } else if (maxA) {
      return `≤ ${maxA} m²`;
    } else if (minA) {
      return `≥ ${minA} m²`;
    }

    if (!rangeKey || rangeKey === 'all') return 'Diện tích';
    const found = AREA_PRESETS.find(p => p.value === rangeKey);
    if (found) {
      return found.label.replace('Dưới ', '≤ ').replace('Trên ', '≥ ');
    }
    return formatAreaRangeText(rangeKey).replace('Dưới ', '≤ ').replace('Trên ', '≥ ');
  };

  // Summary labels for Modal rows (Screenshot 1)
  const getLocationSummary = () => {
    const parts = [];
    if (draftFilters.project) parts.push(draftFilters.project);
    if (draftFilters.street) parts.push(draftFilters.street);
    if (draftFilters.ward) parts.push(draftFilters.ward);
    if (draftFilters.district) parts.push(draftFilters.district);
    if (draftFilters.city && draftFilters.city !== 'Toàn quốc' && parts.length > 0) {
      parts.push(draftFilters.city);
    }
    if (parts.length > 0) return parts.join(', ');
    if (draftFilters.city && draftFilters.city !== 'Toàn quốc') return draftFilters.city;
    return 'Trên toàn quốc';
  };

  const getPriceSummary = () => {
    if (draftFilters.priceRange && draftFilters.priceRange !== 'all' && draftFilters.priceRange !== 'custom') {
      const presets = draftFilters.demand === 'rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;
      const found = presets.find(p => p.value === draftFilters.priceRange);
      if (found) {
        return found.label;
      }
    }
    if (draftFilters.minPrice || draftFilters.maxPrice) {
      const unit = draftFilters.demand === 'rent' ? 'triệu' : 'tỷ';
      const div = draftFilters.demand === 'rent' ? 1e6 : 1e9;
      if (draftFilters.minPrice && draftFilters.maxPrice) {
        return `${Math.round(draftFilters.minPrice / div * 10) / 10} - ${Math.round(draftFilters.maxPrice / div * 10) / 10} ${unit}`;
      } else if (draftFilters.maxPrice) {
        return `≤ ${Math.round(draftFilters.maxPrice / div * 10) / 10} ${unit}`;
      } else if (draftFilters.minPrice) {
        return `≥ ${Math.round(draftFilters.minPrice / div * 10) / 10} ${unit}`;
      }
    }
    return 'Tất cả';
  };

  const getAreaSummary = () => {
    if (draftFilters.areaRange && draftFilters.areaRange !== 'all' && draftFilters.areaRange !== 'custom') {
      const found = AREA_PRESETS.find(p => p.value === draftFilters.areaRange);
      if (found) {
        return found.label;
      }
    }
    if (draftFilters.minArea || draftFilters.maxArea) {
      if (draftFilters.minArea && draftFilters.maxArea) {
        return `${draftFilters.minArea} - ${draftFilters.maxArea} m²`;
      } else if (draftFilters.maxArea) {
        return `≤ ${draftFilters.maxArea} m²`;
      } else if (draftFilters.minArea) {
        return `≥ ${draftFilters.minArea} m²`;
      }
    }
    return 'Tất cả';
  };

  // Location data calculations for Screenshot 2 (Hỗ trợ đầy đủ Đà Nẵng, Quảng Nam...)
  const currentCityData = useMemo(() => {
    if (!draftFilters.city) return null;
    return VIETNAM_ADMINISTRATIVE_DATA.find(c => 
      c.name.toLowerCase() === draftFilters.city.toLowerCase() || 
      removeAccents(c.name) === removeAccents(draftFilters.city)
    ) || null;
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

  // Kiểm tra các tiêu chí lọc đang được kích hoạt (không tính các giá trị mặc định của chính trang danh mục)
  const isTypeFilterActive = Boolean(
    (filters.propertyTypes && filters.propertyTypes.length > 0 && !filters.propertyTypes.includes('all')) ||
    (filters.propertyType && filters.propertyType !== 'all' && filters.propertyType !== taxonomyInfo?.propertyType)
  );
  const isCityFilterActive = Boolean(
    filters.city && filters.city !== taxonomyInfo?.city
  );
  const isDistrictFilterActive = Boolean(
    filters.district && filters.district !== taxonomyInfo?.district
  );
  const isPriceFilterActive = Boolean(
    ((filters.priceRange && filters.priceRange !== 'all') || filters.minPrice || filters.maxPrice) &&
    filters.priceRange !== taxonomyInfo?.priceRange
  );
  const isAreaFilterActive = Boolean(
    ((filters.areaRange && filters.areaRange !== 'all') || filters.minArea || filters.maxArea) &&
    filters.areaRange !== taxonomyInfo?.areaRange
  );

  // Đếm tổng số tiêu chí lọc nâng cao đang được kích hoạt (chuẩn Batdongsan.com.vn)
  const advancedCount = [
    isTypeFilterActive,
    isPriceFilterActive,
    isAreaFilterActive,
    isDistrictFilterActive,
    isCityFilterActive,
    Boolean(filters.ward && filters.ward !== taxonomyInfo?.ward),
    Boolean(filters.street && filters.street !== taxonomyInfo?.street),
    Boolean(filters.project && filters.project !== taxonomyInfo?.project),
    Boolean(filters.bedroom && filters.bedroom !== 'all' && filters.bedroom !== taxonomyInfo?.bedroom),
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
                : (effectiveDemand === 'rent' ? 'Căn hộ, nhà riêng, mặt bằng...' : 'Nhà riêng, căn hộ, biệt thự...')
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 mt-2 sm:mt-3 overflow-x-auto sm:overflow-visible no-scrollbar touch-pan-x pb-1 sm:pb-0 sm:flex-wrap text-xs sm:text-sm relative z-30">
          {/* 1. Nút "Lọc" (Mở bộ lọc phong cách Batdongsan) */}
          <button
            type="button"
            onClick={() => handleOpenAdvancedModal('main')}
            className={`shrink-0 border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap ${
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
            className={`shrink-0 border rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer shadow-2xs whitespace-nowrap ${
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
              onClick={() => handleQuickFilterClick('location')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                filters.city || filters.district
                  ? 'border-red-500 bg-red-50/60 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <i className="fa-solid fa-location-dot text-slate-400 text-xs"></i>
              <span>{getLocationQuickLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Khu vực chuẩn HeroSearch / Hình 2 có nút Lọc chi tiết (chỉ mở trên desktop >= 768px) */}
            {openDropdown === 'location' && (
              <div className="hidden md:block absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-fadeIn max-h-80 overflow-y-auto">
                {/* Header: Tiêu đề + Nút Lọc chi tiết */}
                <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khu vực</span>
                  <button
                    type="button"
                    onClick={handleOpenLocationModal}
                    className="text-red-600 hover:text-red-700 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    title="Mở bộ lọc chi tiết phường xã, đường phố, dự án"
                  >
                    <i className="fa-solid fa-sliders text-[10px]"></i>
                    <span>Lọc chi tiết »</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectQuickLocation('', '')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    (!filters.city && !filters.district) ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Trên toàn quốc
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                {VIETNAM_ADMINISTRATIVE_DATA.map(c => {
                  const isCityActive = filters.city === c.name;
                  const isExpanded = expandedCity === c.name;
                  return (
                    <div key={c.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedCity(prev => prev === c.name ? '' : c.name);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          isCityActive ? 'bg-red-50 text-red-600' : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({c.districts?.length || 0} quận)</span>
                      </button>
                      {isExpanded && (c.districts?.length || 0) > 0 && (
                        <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-red-200 ml-3 my-1 max-h-40 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => handleSelectQuickLocation(c.name, '')}
                            className={`w-full text-left px-2 py-1 rounded text-[11px] cursor-pointer transition flex items-center justify-between ${
                              isCityActive && !filters.district ? 'font-bold text-red-600' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>Tất cả {c.name}</span>
                            {isCityActive && !filters.district && <i className="fa-solid fa-check text-[10px] text-red-600"></i>}
                          </button>
                          {c.districts.map(d => (
                            <button
                              key={d.name}
                              type="button"
                              onClick={() => handleSelectQuickLocation(c.name, d.name)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] cursor-pointer transition flex items-center justify-between ${
                                isCityActive && filters.district === d.name ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{d.name}</span>
                              {isCityActive && filters.district === d.name && <i className="fa-solid fa-check text-[10px] text-red-600"></i>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Footer: Nút bấm mở lọc chi tiết các trường phường, đường, dự án */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleOpenLocationModal}
                    className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100/80 text-red-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-location-dot text-xs"></i>
                    <span>Lọc chi tiết phường, đường, dự án »</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dropdown "Loại nhà đất ⌵" */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => handleQuickFilterClick('type')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                (filters.propertyTypes?.length > 0 && !filters.propertyTypes.includes('all')) || (filters.propertyType && filters.propertyType !== 'all')
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getPropertyTypeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Loại nhà đất chuẩn Batdongsan (chỉ mở trên desktop >= 768px) */}
            {openDropdown === 'type' && (
              <div className="hidden md:block absolute top-full left-0 mt-1.5 z-50 animate-fadeIn">
                <PropertyTypeSelector
                  value={filters.propertyTypes || filters.propertyType}
                  demand={effectiveDemand}
                  onApply={(selectedIds) => {
                    const cleanIds = Array.isArray(selectedIds) ? selectedIds : [selectedIds].filter(Boolean);
                    const isAll = cleanIds.includes('all') || cleanIds.length === 0;
                    const houseChildren = ['house', 'villa', 'street-house', 'shophouse'];
                    const landChildren = ['project-land', 'land'];
                    const isFullHouse = houseChildren.every(id => cleanIds.includes(id)) && cleanIds.filter(id => !houseChildren.includes(id)).length === 0;
                    const isFullLand = landChildren.every(id => cleanIds.includes(id)) && cleanIds.filter(id => !landChildren.includes(id)).length === 0;

                    const primaryId = isAll
                      ? 'all'
                      : isFullHouse
                        ? (effectiveDemand === 'rent' ? 'house-rent-group' : 'house-group')
                        : isFullLand
                          ? 'land-group'
                          : (cleanIds.length === 1 ? cleanIds[0] : cleanIds.join(','));

                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        propertyType: primaryId,
                        propertyTypes: isAll ? ['all'] : cleanIds
                      }));
                    }
                    setOpenDropdown(null);
                  }}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>

          {/* 4. Dropdown "Khoảng giá ⌵" có Thanh Range Slider */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => handleQuickFilterClick('price')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                (filters.priceRange && filters.priceRange !== 'all') || filters.minPrice || filters.maxPrice
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getPriceRangeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Khoảng giá chuẩn Batdongsan (chỉ mở trên desktop >= 768px) */}
            {openDropdown === 'price' && (
              <div className="hidden md:block absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 z-50 animate-fadeIn">
                <PriceRangeSelector
                  demand={effectiveDemand}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  priceRange={filters.priceRange}
                  onApply={({ minPrice, maxPrice, priceRange }) => {
                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        minPrice,
                        maxPrice,
                        priceRange
                      }));
                    }
                    setOpenDropdown(null);
                  }}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>

          {/* 5. Dropdown "Diện tích ⌵" có Thanh Range Slider */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => handleQuickFilterClick('area')}
              className={`border rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                (filters.areaRange && filters.areaRange !== 'all') || filters.minArea || filters.maxArea
                  ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{getAreaRangeLabel()}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openDropdown === 'area' ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Menu Dropdown Diện tích chuẩn Batdongsan (chỉ mở trên desktop >= 768px) */}
            {openDropdown === 'area' && (
              <div className="hidden md:block absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 z-50 animate-fadeIn">
                <AreaRangeSelector
                  minArea={filters.minArea}
                  maxArea={filters.maxArea}
                  areaRange={filters.areaRange}
                  onApply={({ minArea, maxArea, areaRange }) => {
                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        minArea,
                        maxArea,
                        areaRange
                      }));
                    }
                    setOpenDropdown(null);
                  }}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          POPUP MODAL: BỘ LỌC TÌM KIẾM CHUẨN BATDONGSAN (ẢNH 1 & ẢNH 2)
         ======================================================== */}
      {showAdvancedModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowAdvancedModal(false)}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
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
                      onClick={() => setDraftFilters(prev => ({
                        ...prev,
                        demand: 'sale',
                        priceRange: 'all',
                        minPrice: null,
                        maxPrice: null,
                        propertyType: 'all',
                        propertyTypes: ['all']
                      }))}
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
                      onClick={() => setDraftFilters(prev => ({
                        ...prev,
                        demand: 'rent',
                        priceRange: 'all',
                        minPrice: null,
                        maxPrice: null,
                        propertyType: 'all',
                        propertyTypes: ['all']
                      }))}
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

                    {activeDraftTypes.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {activeDraftTypes.map(tId => {
                          const name = getPropertyTypeDisplayName(tId, draftFilters.demand);
                          return (
                            <span key={tId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold text-xs">
                              <span>{name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = activeDraftTypes.filter(x => x !== tId);
                                  const isAll = next.length === 0;
                                  setDraftFilters(prev => ({
                                    ...prev,
                                    propertyType: isAll ? 'all' : (next.length === 1 ? next[0] : next.join(',')),
                                    propertyTypes: isAll ? ['all'] : next
                                  }));
                                }}
                                className="hover:text-red-900 ml-0.5 text-xs font-bold cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
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
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                          <span>Tin xác thực</span>
                        </div>

                        {/* Switch */}
                        <button
                          type="button"
                          onClick={() => setDraftFilters(prev => ({ ...prev, onlyVerified: !prev.onlyVerified }))}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
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
                    className="flex-1 py-3 bg-[#c93026] hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
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
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (openedFromQuickFilterRef.current) {
                        setShowAdvancedModal(false);
                      } else {
                        setModalScreen('main');
                      }
                    }}
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
                      disabled={!draftFilters.city}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
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
                        city: '',
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
                    onClick={() => {
                      if (openedFromQuickFilterRef.current) {
                        handleApplyAllDraftFilters();
                      } else {
                        setModalScreen('main');
                      }
                    }}
                    className="flex-1 py-3 bg-[#c93026] hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
                  >
                    Áp dụng
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 3: KHOẢNG GIÁ (RANGE SLIDER CHUẨN BATDONGSAN)
               ---------------------------------------------------- */}
            {modalScreen === 'price' && (
              <PriceRangeSelector
                demand={draftFilters.demand}
                minPrice={draftFilters.minPrice}
                maxPrice={draftFilters.maxPrice}
                priceRange={draftFilters.priceRange}
                isModal={true}
                onBack={() => {
                  if (openedFromQuickFilterRef.current) {
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onApply={({ minPrice, maxPrice, priceRange }) => {
                  setDraftFilters(prev => ({
                    ...prev,
                    minPrice,
                    maxPrice,
                    priceRange
                  }));
                  if (openedFromQuickFilterRef.current) {
                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        minPrice,
                        maxPrice,
                        priceRange
                      }));
                    }
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onClose={() => setShowAdvancedModal(false)}
              />
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 4: DIỆN TÍCH (RANGE SLIDER CHUẨN BATDONGSAN)
               ---------------------------------------------------- */}
            {modalScreen === 'area' && (
              <AreaRangeSelector
                minArea={draftFilters.minArea}
                maxArea={draftFilters.maxArea}
                areaRange={draftFilters.areaRange}
                isModal={true}
                onBack={() => {
                  if (openedFromQuickFilterRef.current) {
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onApply={({ minArea, maxArea, areaRange }) => {
                  setDraftFilters(prev => ({
                    ...prev,
                    minArea,
                    maxArea,
                    areaRange
                  }));
                  if (openedFromQuickFilterRef.current) {
                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        minArea,
                        maxArea,
                        areaRange
                      }));
                    }
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onClose={() => setShowAdvancedModal(false)}
              />
            )}

            {/* ----------------------------------------------------
                MODAL SCREEN 5: LOẠI BẤT ĐỘNG SẢN (CHUẨN BATDONGSAN)
               ---------------------------------------------------- */}
            {modalScreen === 'type' && (
              <PropertyTypeSelector
                value={draftFilters.propertyTypes || draftFilters.propertyType}
                demand={draftFilters.demand}
                isModal={true}
                onBack={() => {
                  if (openedFromQuickFilterRef.current) {
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onApply={(selectedIds) => {
                  const cleanIds = Array.isArray(selectedIds) ? selectedIds : [selectedIds].filter(Boolean);
                  const isAll = cleanIds.includes('all') || cleanIds.length === 0;
                  const houseChildren = ['house', 'villa', 'street-house', 'shophouse'];
                  const landChildren = ['project-land', 'land'];
                  const isFullHouse = houseChildren.every(id => cleanIds.includes(id)) && cleanIds.filter(id => !houseChildren.includes(id)).length === 0;
                  const isFullLand = landChildren.every(id => cleanIds.includes(id)) && cleanIds.filter(id => !landChildren.includes(id)).length === 0;

                  const primaryId = isAll
                    ? 'all'
                    : isFullHouse
                      ? (draftFilters.demand === 'rent' ? 'house-rent-group' : 'house-group')
                      : isFullLand
                        ? 'land-group'
                        : (cleanIds.length === 1 ? cleanIds[0] : cleanIds.join(','));

                  const updatedTypes = isFullHouse
                    ? [draftFilters.demand === 'rent' ? 'house-rent-group' : 'house-group']
                    : (isFullLand ? ['land-group'] : (isAll ? ['all'] : cleanIds));

                  setDraftFilters(prev => ({
                    ...prev,
                    propertyType: primaryId,
                    propertyTypes: updatedTypes
                  }));

                  if (openedFromQuickFilterRef.current) {
                    if (setFilters) {
                      setFilters(prev => ({
                        ...prev,
                        propertyType: primaryId,
                        propertyTypes: updatedTypes
                      }));
                    }
                    setShowAdvancedModal(false);
                  } else {
                    setModalScreen('main');
                  }
                }}
                onClose={() => setShowAdvancedModal(false)}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
