'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PROPERTY_TYPES, SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData';
import { formatPriceRangeText, formatAreaRangeText, buildSeoUrl } from '../utils/permalink';
import { removeAccents } from '../utils/propertyFilter';
import { Link, useRouter } from '../router/RouterContext';
import PropertyTypeSelector from './PropertyTypeSelector';
import PriceRangeSelector from './PriceRangeSelector';
import AreaRangeSelector from './AreaRangeSelector';
import { formatPropertyTypeTriggerLabel } from '../data/propertyTypeTaxonomy';

const DEFAULT_RECENT_SEARCHES = [
  {
    id: 'rec-1',
    title: 'Cho thuê căn hộ chung cư tại Huyện Nhà Bè',
    subtitle: 'Căn hộ chung cư · Huyện Nhà Bè · TP. Hồ Chí Minh',
    filters: { demand: 'rent', propertyType: 'apartment', city: 'TP. Hồ Chí Minh', district: 'Huyện Nhà Bè' },
    keyword: ''
  },
  {
    id: 'rec-2',
    title: 'Mua bán BĐS',
    subtitle: '5 - 7 tỷ · Đăng bởi môi giới chuyên nghiệp',
    filters: { demand: 'sale', priceRange: '5b-7b', onlyVerified: true },
    keyword: ''
  },
  {
    id: 'rec-3',
    title: 'Cho thuê BĐS',
    subtitle: 'Tất cả loại hình cho thuê toàn quốc',
    filters: { demand: 'rent', propertyType: 'all' },
    keyword: ''
  }
];

export default function HeroSearch({ filters = {}, setFilters, totalResults = 0 }) {
  const { navigate } = useRouter();
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMergerMode, setIsMergerMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFilterMenu, setOpenFilterMenu] = useState(null); // 'city' | 'type' | 'price' | 'area' | null

  // Recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState(DEFAULT_RECENT_SEARCHES);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Điều hướng chuyển trang kết quả chuẩn SEO Batdongsan.com.vn
  const executeSearchNavigation = (targetFilters, queryStr = '') => {
    const targetUrl = buildSeoUrl({
      demand: targetFilters.demand || 'sale',
      propertyType: targetFilters.propertyType && targetFilters.propertyType !== 'all' ? targetFilters.propertyType : null,
      city: targetFilters.city || null,
      district: targetFilters.district || null,
      ward: targetFilters.ward || null,
      project: targetFilters.project || null,
      priceRange: targetFilters.priceRange && targetFilters.priceRange !== 'all' ? targetFilters.priceRange : null,
      areaRange: targetFilters.areaRange && targetFilters.areaRange !== 'all' ? targetFilters.areaRange : null,
      bedroom: targetFilters.bedroom && targetFilters.bedroom !== 'all' ? targetFilters.bedroom : null,
      extraParams: {
        ...(queryStr ? { q: queryStr } : {}),
        ...(targetFilters.minPrice ? { minPrice: String(targetFilters.minPrice) } : {}),
        ...(targetFilters.maxPrice ? { maxPrice: String(targetFilters.maxPrice) } : {}),
        ...(targetFilters.minArea ? { minArea: String(targetFilters.minArea) } : {}),
        ...(targetFilters.maxArea ? { maxArea: String(targetFilters.maxArea) } : {}),
        ...(targetFilters.direction && targetFilters.direction !== 'all' ? { direction: targetFilters.direction } : {}),
        ...(targetFilters.onlyVerified ? { onlyVerified: 'true' } : {}),
        ...(targetFilters.hasVR360 ? { hasVR360: 'true' } : {})
      }
    });

    setIsDropdownOpen(false);
    navigate(targetUrl);
  };

  // Sync external filters.keyword changes
  useEffect(() => {
    if (filters?.keyword !== undefined && filters.keyword !== searchTerm) {
      setSearchTerm(filters.keyword);
    }
  }, [filters?.keyword]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bds_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save a recent search item
  const saveRecentSearch = (newItem) => {
    try {
      const updated = [
        { ...newItem, id: 'rec-' + Date.now() },
        ...recentSearches.filter(s => s.title !== newItem.title)
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('bds_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('bds_recent_searches');
    } catch {
      // ignore
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setOpenFilterMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Current Demand
  const currentDemand = filters?.demand === 'rent' ? 'rent' : 'sale';

  // Change Demand Tab
  const handleTabChange = (demandKey) => {
    setFilters(prev => ({
      ...prev,
      demand: demandKey,
      priceRange: 'all',
      minPrice: null,
      maxPrice: null,
      propertyType: 'all',
      propertyTypes: ['all']
    }));
    setIsDropdownOpen(false);
  };

  // Autocomplete Suggestions when user types
  const suggestions = useMemo(() => {
    const raw = searchTerm.trim().toLowerCase();
    if (!raw) return [];
    const clean = removeAccents(raw);
    const results = [];

    // 1. Post-merger Wards if isMergerMode is enabled
    if (isMergerMode) {
      DANANG_MERGERS_MAP.forEach(m => {
        const matchFound = m.match.some(w => removeAccents(w).includes(clean)) || removeAccents(m.newWard).includes(clean);
        if (matchFound) {
          results.push({
            type: 'merger',
            badge: 'Địa danh mới',
            title: `${m.newWard}, ${m.newDistrict}`,
            subtitle: `Sắp xếp sáp nhập từ các đơn vị cũ (${m.match.join(', ')})`,
            icon: 'fa-solid fa-arrows-split-up-and-left text-emerald-500',
            apply: () => {
              const updatedFilters = {
                ...filters,
                city: 'Đà Nẵng',
                district: m.newDistrict,
                ward: m.newWard,
                keyword: ''
              };
              setSearchTerm('');
              setFilters(updatedFilters);
              executeSearchNavigation(updatedFilters, '');
            }
          });
        }
      });
    }

    // 2. Matching Cities & Districts
    VIETNAM_ADMINISTRATIVE_DATA.forEach(city => {
      const cityClean = removeAccents(city.name);
      if (cityClean.includes(clean)) {
        results.push({
          type: 'city',
          badge: 'Tỉnh / Thành',
          title: city.name,
          subtitle: `Bất động sản tại ${city.name} (${city.districts?.length || 0} Quận/Huyện)`,
          icon: 'fa-solid fa-location-dot text-red-500',
          apply: () => {
            const updatedFilters = { ...filters, city: city.name, district: '', keyword: '' };
            setSearchTerm('');
            setFilters(updatedFilters);
            executeSearchNavigation(updatedFilters, '');
          }
        });
      }
      city.districts?.forEach(dist => {
        const distClean = removeAccents(dist.name);
        if (distClean.includes(clean)) {
          results.push({
            type: 'district',
            badge: 'Quận / Huyện',
            title: `${dist.name}, ${city.name}`,
            subtitle: `Khu vực ${dist.name} (${dist.wards?.length || 0} Phường/Xã)`,
            icon: 'fa-solid fa-map-pin text-blue-500',
            apply: () => {
              const updatedFilters = { ...filters, city: city.name, district: dist.name, keyword: '' };
              setSearchTerm('');
              setFilters(updatedFilters);
              executeSearchNavigation(updatedFilters, '');
            }
          });
        }
      });
    });

    // 3. Matching Property Types
    PROPERTY_TYPES.forEach(pt => {
      if (removeAccents(pt.name).includes(clean)) {
        results.push({
          type: 'propertyType',
          badge: 'Loại hình BĐS',
          title: pt.name,
          subtitle: `Tìm theo danh mục ${pt.name}`,
          icon: `fa-solid ${pt.icon} text-amber-500`,
          apply: () => {
            const updatedFilters = { ...filters, propertyType: pt.id };
            setFilters(updatedFilters);
            executeSearchNavigation(updatedFilters, searchTerm.trim());
          }
        });
      }
    });

    return results.slice(0, 6);
  }, [searchTerm, isMergerMode, filters, setFilters]);

  // Handle Search Submission (Chuẩn Batdongsan.com.vn: Điều hướng sang trang kết quả)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanKw = searchTerm.trim();
    const updatedFilters = {
      ...filters,
      keyword: cleanKw
    };
    setFilters(updatedFilters);

    // Save recent search
    if (cleanKw || filters.city || (filters.propertyType && filters.propertyType !== 'all')) {
      const locationPart = filters.district ? `${filters.district}, ${filters.city}` : (filters.city || 'Toàn quốc');
      const typePart = filters.propertyType && filters.propertyType !== 'all' ? (PROPERTY_TYPES.find(p => p.id === filters.propertyType)?.name || '') : '';
      saveRecentSearch({
        title: cleanKw || (typePart ? `${typePart} tại ${locationPart}` : (filters.demand === 'rent' ? 'Cho thuê BĐS' : 'Mua bán BĐS')),
        subtitle: [locationPart, typePart, filters.priceRange && filters.priceRange !== 'all' ? (filters.demand === 'rent' ? RENT_PRICE_PRESETS.find(p => p.value === filters.priceRange)?.label : SALE_PRICE_PRESETS.find(p => p.value === filters.priceRange)?.label) : null].filter(Boolean).join(' · '),
        filters: updatedFilters,
        keyword: cleanKw
      });
    }

    // Điều hướng trực tiếp sang trang danh sách kết quả chuyên biệt
    executeSearchNavigation(updatedFilters, cleanKw);
  };

  // Handle Selecting a Recent Search Item (Điều hướng sang trang kết quả)
  const handleSelectRecentSearch = (item) => {
    const updatedFilters = {
      ...filters,
      ...(item.filters || {}),
      keyword: item.keyword !== undefined ? item.keyword : (item.filters?.keyword || '')
    };
    setFilters(updatedFilters);
    if (item.keyword !== undefined) {
      setSearchTerm(item.keyword);
    }
    executeSearchNavigation(updatedFilters, item.keyword || item.filters?.keyword || '');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      keyword: '',
      demand: 'sale',
      propertyType: 'all',
      city: '',
      district: '',
      priceRange: 'all',
      areaRange: 'all',
      bedroom: 'all',
      direction: 'all',
      hasVR360: false,
      onlyVerified: false
    });
    setOpenFilterMenu(null);
  };

  // Dynamic Placeholder
  const inputPlaceholder = useMemo(() => {
    if (filters?.demand === 'rent') {
      return 'VD: Cho thuê căn hộ studio, chung cư dưới 10 triệu';
    }
    return 'VD: Bán nhà Bình Thạnh dưới 5 tỷ';
  }, [filters?.demand]);

  // Labels for Quick Bar
  const getLocationLabel = () => {
    if (filters.district) return filters.district;
    if (filters.city) return filters.city;
    return 'Trên toàn quốc';
  };

  const getPropertyTypeLabel = () => {
    return formatPropertyTypeTriggerLabel(filters.propertyTypes || filters.propertyType, currentDemand, 'Loại nhà đất');
  };

  const getPriceLabel = () => {
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

    if (!filters.priceRange || filters.priceRange === 'all') return 'Mức giá';
    const presets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;
    const found = presets.find(p => p.value === filters.priceRange);
    return found ? found.label.replace('Dưới ', '≤ ').replace('Trên ', '≥ ') : formatPriceRangeText(filters.priceRange);
  };

  const getAreaLabel = () => {
    const minA = filters?.minArea;
    const maxA = filters?.maxArea;

    if (minA && maxA) {
      return `${minA} - ${maxA} m²`;
    } else if (maxA) {
      return `≤ ${maxA} m²`;
    } else if (minA) {
      return `≥ ${minA} m²`;
    }

    if (!filters.areaRange || filters.areaRange === 'all') return 'Diện tích';
    const found = AREA_PRESETS.find(a => a.value === filters.areaRange);
    return found ? found.label.replace('Dưới ', '≤ ').replace('Trên ', '≥ ') : formatAreaRangeText(filters.areaRange);
  };

  // Active City's districts
  const activeCityDistricts = useMemo(() => {
    if (!filters.city) return [];
    const found = VIETNAM_ADMINISTRATIVE_DATA.find(c => c.name === filters.city);
    return found ? found.districts || [] : [];
  }, [filters.city]);

  return (
    <div className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 px-4 overflow-visible">
      {/* Background Graphic Ambient Glow & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        {/* Subtle decorative architectural blur */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-20" ref={containerRef}>
        {/* Slogan */}
        <div className="text-center mb-6 sm:mb-8 text-white">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            Tìm Kiếm Bất Động Sản <span className="text-[#e03c31]">Chính Xác & Toàn Diện</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Hàng ngàn tin đăng bán & cho thuê chính chủ, căn hộ, biệt thự và đất nền trên toàn quốc
          </p>
        </div>

        {/* ----------------------------------------------------
            BATDONGSAN.COM.VN SEARCH BOX WIDGET
           ---------------------------------------------------- */}
        <div className="w-full">
          {/* 1. TOP TABS: Mua bán / Cho thuê (Cân đối đối xứng 100%) */}
          <div className="inline-grid grid-cols-2 bg-[#2b353e]/95 backdrop-blur-md rounded-t-2xl border-b border-white/10 shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleTabChange('sale')}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition cursor-pointer relative flex items-center justify-center select-none ${
                currentDemand === 'sale'
                  ? 'text-white font-black'
                  : 'text-slate-300 hover:text-white font-medium'
              }`}
            >
              <span>Mua bán</span>
              {currentDemand === 'sale' && (
                <span className="absolute bottom-0 inset-x-3 sm:inset-x-4 h-[2.5px] bg-[#e03c31] rounded-t-full shadow-xs" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('rent')}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition cursor-pointer relative flex items-center justify-center select-none ${
                currentDemand === 'rent'
                  ? 'text-white font-black'
                  : 'text-slate-300 hover:text-white font-medium'
              }`}
            >
              <span>Cho thuê</span>
              {currentDemand === 'rent' && (
                <span className="absolute bottom-0 inset-x-3 sm:inset-x-4 h-[2.5px] bg-[#e03c31] rounded-t-full shadow-xs" />
              )}
            </button>
          </div>

          {/* 2. MAIN SEARCH INPUT CONTAINER (WHITE BOX) */}
          <div className="bg-white rounded-b-2xl rounded-tr-2xl sm:rounded-tr-2xl shadow-2xl p-3 sm:p-4 border border-slate-100 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 focus-within:border-red-500 focus-within:bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 transition shadow-2xs">
                {/* Search Magnifying Glass Icon */}
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm sm:text-base mr-2.5 shrink-0"></i>

                {/* Main Text Input */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={inputPlaceholder}
                  className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium placeholder-slate-400"
                />

                {/* Clear Input Button */}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters(prev => ({ ...prev, keyword: '' }));
                    }}
                    className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs mr-2 transition cursor-pointer shrink-0"
                    title="Xóa tìm kiếm"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}

                {/* Red "Tìm kiếm" Action Button */}
                <button
                  type="submit"
                  className="bg-[#e03c31] hover:bg-[#c93026] text-white font-bold px-4 sm:px-7 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shrink-0"
                >
                  <span>Tìm kiếm</span>
                </button>
              </div>

              {/* ----------------------------------------------------
                  3. DROPDOWN POPUP (MATCHING BATDONGSAN.COM.VN)
                 ---------------------------------------------------- */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn text-slate-800"
                >
                  {/* Row 1: "Tìm theo địa chỉ mới sau sáp nhập" (Toggle Switch) */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Tìm theo địa chỉ mới sau sáp nhập
                      </span>
                      {isMergerMode && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i className="fa-solid fa-check text-[9px]"></i> Đã kích hoạt
                        </span>
                      )}
                    </div>

                    {/* iOS style Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setIsMergerMode(!isMergerMode)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                        isMergerMode ? 'bg-[#e03c31]' : 'bg-slate-300'
                      }`}
                      title={isMergerMode ? 'Tắt tra cứu sáp nhập' : 'Bật tra cứu sáp nhập'}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          isMergerMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Suggestions when typing */}
                  {searchTerm.trim().length > 0 && suggestions.length > 0 && (
                    <div className="p-3 border-b border-slate-100">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1.5">
                        Gợi ý tìm kiếm
                      </div>
                      <div className="space-y-1">
                        {suggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              sug.apply();
                              setIsDropdownOpen(false);
                              handleSearchSubmit();
                            }}
                            className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <i className={sug.icon}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span>{sug.title}</span>
                                {sug.badge && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {sug.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{sug.subtitle}</div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 text-xs shrink-0 group-hover:translate-x-0.5 transition-transform"></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 2: "Tiếp tục tìm kiếm" (Lịch sử tìm kiếm gần đây) */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        Tiếp tục tìm kiếm
                      </span>
                      {recentSearches.length > 0 && (
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] text-slate-400 hover:text-red-600 transition font-medium cursor-pointer"
                        >
                          Xóa lịch sử
                        </button>
                      )}
                    </div>

                    {recentSearches.length > 0 ? (
                      <div className="space-y-1">
                        {recentSearches.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectRecentSearch(item)}
                            className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer group"
                          >
                            {/* Red Clock History Icon */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-[#e03c31] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-clock-rotate-left text-xs sm:text-sm"></i>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition truncate">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-400 truncate">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>

                            {/* Chevron Right */}
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-slate-500 text-xs shrink-0 group-hover:translate-x-0.5 transition-transform"></i>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400">
                        Chưa có lịch sử tìm kiếm gần đây
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* ----------------------------------------------------
                4. QUICK FILTER BAR ROW (BELOW SEARCH INPUT)
               ---------------------------------------------------- */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              {/* Dropdown 1: Khu vực */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilterMenu(prev => prev === 'city' ? null : 'city')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    filters.city
                      ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <i className="fa-solid fa-location-dot text-slate-400 text-[11px]"></i>
                  <span>{getLocationLabel()}</span>
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                </button>

                {openFilterMenu === 'city' && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-fadeIn max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, city: '', district: '' }));
                        setOpenFilterMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        !filters.city ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Trên toàn quốc
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    {VIETNAM_ADMINISTRATIVE_DATA.map(c => (
                      <div key={c.name}>
                        <button
                          type="button"
                          onClick={() => {
                            setFilters(prev => ({ ...prev, city: c.name, district: '' }));
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                            filters.city === c.name ? 'bg-red-50 text-red-600' : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({c.districts?.length || 0} quận)</span>
                        </button>
                        {filters.city === c.name && activeCityDistricts.length > 0 && (
                          <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-red-200 ml-3 my-1 max-h-40 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({ ...prev, district: '' }));
                                setOpenFilterMenu(null);
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] ${
                                !filters.district ? 'font-bold text-red-600' : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Tất cả {c.name}
                            </button>
                            {activeCityDistricts.map(d => (
                              <button
                                key={d.name}
                                type="button"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, district: d.name }));
                                  setOpenFilterMenu(null);
                                }}
                                className={`w-full text-left px-2 py-1 rounded text-[11px] ${
                                  filters.district === d.name ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {d.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown 2: Loại nhà đất */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilterMenu(prev => prev === 'type' ? null : 'type')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    filters.propertyType && filters.propertyType !== 'all'
                      ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <i className="fa-solid fa-house-chimney text-slate-400 text-[11px]"></i>
                  <span>{getPropertyTypeLabel()}</span>
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                </button>

                {openFilterMenu === 'type' && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 animate-fadeIn">
                    <PropertyTypeSelector
                      value={filters.propertyTypes || filters.propertyType}
                      demand={currentDemand}
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
                            ? (currentDemand === 'rent' ? 'house-rent-group' : 'house-group')
                            : isFullLand
                              ? 'land-group'
                              : (cleanIds.length === 1 ? cleanIds[0] : cleanIds.join(','));

                        setFilters(prev => ({
                          ...prev,
                          propertyType: primaryId,
                          propertyTypes: isAll ? ['all'] : cleanIds
                        }));
                        setOpenFilterMenu(null);
                      }}
                      onClose={() => setOpenFilterMenu(null)}
                    />
                  </div>
                )}
              </div>

              {/* Dropdown 3: Mức giá có Thanh Range Slider */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilterMenu(prev => prev === 'price' ? null : 'price')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    (filters.priceRange && filters.priceRange !== 'all') || filters.minPrice || filters.maxPrice
                      ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <i className="fa-solid fa-tag text-slate-400 text-[11px]"></i>
                  <span>{getPriceLabel()}</span>
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                </button>

                {openFilterMenu === 'price' && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 animate-fadeIn">
                    <PriceRangeSelector
                      demand={currentDemand}
                      minPrice={filters.minPrice}
                      maxPrice={filters.maxPrice}
                      priceRange={filters.priceRange}
                      onApply={({ minPrice, maxPrice, priceRange }) => {
                        setFilters(prev => ({
                          ...prev,
                          minPrice,
                          maxPrice,
                          priceRange
                        }));
                        setOpenFilterMenu(null);
                      }}
                      onClose={() => setOpenFilterMenu(null)}
                    />
                  </div>
                )}
              </div>

              {/* Dropdown 4: Diện tích có Thanh Range Slider */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilterMenu(prev => prev === 'area' ? null : 'area')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    (filters.areaRange && filters.areaRange !== 'all') || filters.minArea || filters.maxArea
                      ? 'border-red-500 bg-red-50/50 text-red-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <i className="fa-solid fa-ruler-combined text-slate-400 text-[11px]"></i>
                  <span>{getAreaLabel()}</span>
                  <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                </button>

                {openFilterMenu === 'area' && (
                  <div className="absolute top-full left-0 mt-1.5 z-50 animate-fadeIn">
                    <AreaRangeSelector
                      minArea={filters.minArea}
                      maxArea={filters.maxArea}
                      areaRange={filters.areaRange}
                      onApply={({ minArea, maxArea, areaRange }) => {
                        setFilters(prev => ({
                          ...prev,
                          minArea,
                          maxArea,
                          areaRange
                        }));
                        setOpenFilterMenu(null);
                      }}
                      onClose={() => setOpenFilterMenu(null)}
                    />
                  </div>
                )}
              </div>

              {/* Toggle Lọc nâng cao */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  showAdvanced ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-sliders text-[11px] text-emerald-600"></i>
                <span className="hidden sm:inline">Lọc nâng cao</span>
              </button>

              {/* Đặt lại bộ lọc (Reset) */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer ml-auto"
                title="Đặt lại bộ lọc"
              >
                <i className="fa-solid fa-arrow-rotate-left text-xs"></i>
              </button>
            </div>

            {/* Collapsible Advanced Filters Section */}
            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl animate-fadeIn">
                {/* Bedrooms */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Số phòng ngủ
                  </label>
                  <select
                    value={filters.bedroom || 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, bedroom: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-red-500 text-slate-800 outline-none"
                  >
                    <option value="all">Bất kỳ</option>
                    <option value="1">1 phòng ngủ</option>
                    <option value="2">2 phòng ngủ</option>
                    <option value="3">3 phòng ngủ</option>
                    <option value="4+">4+ phòng ngủ</option>
                  </select>
                </div>

                {/* Direction */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hướng nhà
                  </label>
                  <select
                    value={filters.direction || 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-red-500 text-slate-800 outline-none"
                  >
                    <option value="all">Mọi hướng</option>
                    <option value="Đông">Đông</option>
                    <option value="Tây">Tây</option>
                    <option value="Nam">Nam</option>
                    <option value="Bắc">Bắc</option>
                    <option value="Đông Nam">Đông Nam</option>
                    <option value="Tây Nam">Tây Nam</option>
                    <option value="Đông Bắc">Đông Bắc</option>
                    <option value="Tây Bắc">Tây Bắc</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popular Trending SEO Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
            <i className="fa-solid fa-fire text-amber-400 text-[10px]"></i>
            Xu hướng tìm kiếm:
          </span>
          {(currentDemand === 'rent' ? [
            { label: 'Căn hộ Sơn Trà', path: '/cho-thue-can-ho-chung-cu-quan-son-tra' },
            { label: 'Căn hộ Hải Châu', path: '/cho-thue-can-ho-chung-cu-quan-hai-chau' },
            { label: 'Nhà mặt phố Hải Châu', path: '/cho-thue-nha-mat-pho-quan-hai-chau' },
            { label: 'Biệt thự biển Đà Nẵng', path: '/cho-thue-nha-biet-thu-lien-ke-da-nang' },
            { label: 'Văn phòng Hải Châu', path: '/cho-thue-van-phong-quan-hai-chau' },
            { label: 'Nhà riêng Ngũ Hành Sơn', path: '/cho-thue-nha-rieng-quan-ngu-hanh-son' }
          ] : [
            { label: 'Căn hộ Hải Châu', path: '/ban-can-ho-chung-cu-quan-hai-chau' },
            { label: 'Căn hộ biển Sơn Trà', path: '/ban-can-ho-chung-cu-quan-son-tra' },
            { label: 'Đất Nam Hòa Xuân', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
            { label: 'Nhà mặt phố Hải Châu', path: '/ban-nha-mat-pho-quan-hai-chau' },
            { label: 'Biệt thự biển Đà Nẵng', path: '/ban-nha-biet-thu-lien-ke-da-nang' },
            { label: 'Đất Cẩm Lệ', path: '/ban-dat-quan-cam-le' }
          ]).map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-red-600/90 text-slate-300 hover:text-white rounded-full border border-slate-700/80 hover:border-red-500 text-[11px] font-medium transition cursor-pointer"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
