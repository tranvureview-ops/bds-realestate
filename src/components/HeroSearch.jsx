'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { PROPERTY_TYPES, SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData';
import { formatPriceRangeText, formatAreaRangeText, buildSeoUrl } from '../utils/permalink';
import { removeAccents } from '../utils/propertyFilter';
import { Link, useRouter } from '../router/RouterContext';
import { getSearchQuerySuggestions, HighlightedQuery } from '../utils/searchQuerySuggestions';
import { useRecentSearches } from '../utils/recentSearches';
import PropertyTypeSelector from './PropertyTypeSelector';
import PriceRangeSelector from './PriceRangeSelector';
import AreaRangeSelector from './AreaRangeSelector';
import DirectionCompassSelector from './DirectionCompassSelector';
import { formatPropertyTypeTriggerLabel } from '../data/propertyTypeTaxonomy';
import { 
  IconSearch, 
  IconClose, 
  IconLocation, 
  IconChevronDown, 
  IconHouse, 
  IconTag, 
  IconRuler, 
  IconBed, 
  IconCompass 
} from './common/Icons';

const BEDROOM_OPTIONS = [
  { value: 'all', label: 'Bất kỳ' },
  { value: '1', label: '1 phòng ngủ' },
  { value: '2', label: '2 phòng ngủ' },
  { value: '3', label: '3 phòng ngủ' },
  { value: '4+', label: '4+ phòng ngủ' }
];

const DIRECTION_OPTIONS = [
  { value: 'all', label: 'Mọi hướng' },
  { value: 'Đông', label: 'Đông' },
  { value: 'Tây', label: 'Tây' },
  { value: 'Nam', label: 'Nam' },
  { value: 'Bắc', label: 'Bắc' },
  { value: 'Đông Nam', label: 'Đông Nam' },
  { value: 'Tây Nam', label: 'Tây Nam' },
  { value: 'Đông Bắc', label: 'Đông Bắc' },
  { value: 'Tây Bắc', label: 'Tây Bắc' }
];

export default function HeroSearch({ filters = {}, setFilters, totalResults = 0 }) {
  const { navigate } = useRouter();
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMergerMode, setIsMergerMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFilterMenu, setOpenFilterMenu] = useState(null); // 'city' | 'type' | 'price' | 'area' | null

  // Detailed Location Modal state (chuẩn hóa như bên danh mục)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [draftLocation, setDraftLocation] = useState({
    city: filters?.city || '',
    district: filters?.district || '',
    ward: filters?.ward || '',
    street: filters?.street || '',
    project: filters?.project || '',
    useMergedAddress: Boolean(filters?.useMergedAddress)
  });

  // Recent searches stored in localStorage via useRecentSearches
  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Khóa scroll khi mở Modal Lọc chi tiết
  useEffect(() => {
    if (showLocationModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showLocationModal]);

  const handleOpenDetailedLocation = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDraftLocation({
      city: filters?.city || '',
      district: filters?.district || '',
      ward: filters?.ward || '',
      street: filters?.street || '',
      project: filters?.project || '',
      useMergedAddress: Boolean(filters?.useMergedAddress)
    });
    setOpenFilterMenu(null);
    setIsDropdownOpen(false);
    setShowLocationModal(true);
  };

  const CITIES = useMemo(() => VIETNAM_ADMINISTRATIVE_DATA.map(c => c.name), []);

  const currentCityData = useMemo(() => {
    if (!draftLocation.city) return null;
    return VIETNAM_ADMINISTRATIVE_DATA.find(c => 
      c.name.toLowerCase() === draftLocation.city.toLowerCase() || 
      removeAccents(c.name) === removeAccents(draftLocation.city)
    ) || null;
  }, [draftLocation.city]);

  const districtList = useMemo(() => {
    return currentCityData?.districts || [];
  }, [currentCityData]);

  const currentDistrictObj = useMemo(() => {
    if (!draftLocation.district) return null;
    return districtList.find(d => d.name === draftLocation.district) || null;
  }, [draftLocation.district, districtList]);

  const wardList = useMemo(() => {
    if (draftLocation.useMergedAddress) {
      const filtered = draftLocation.district
        ? DANANG_MERGERS_MAP.filter(m => m.newDistrict === draftLocation.district)
        : DANANG_MERGERS_MAP;
      return Array.from(new Set(filtered.map(m => m.newWard)));
    }
    if (currentDistrictObj?.wards) {
      return currentDistrictObj.wards;
    }
    return [];
  }, [draftLocation.useMergedAddress, draftLocation.district, currentDistrictObj]);

  const streetList = useMemo(() => {
    return currentDistrictObj?.streets || [];
  }, [currentDistrictObj]);

  const projectList = useMemo(() => {
    return currentDistrictObj?.projects || [];
  }, [currentDistrictObj]);

  const handleApplyLocation = () => {
    setFilters(prev => ({
      ...prev,
      city: draftLocation.city,
      district: draftLocation.district,
      ward: draftLocation.ward,
      street: draftLocation.street,
      project: draftLocation.project,
      useMergedAddress: draftLocation.useMergedAddress
    }));
    setShowLocationModal(false);
  };

  const handleResetLocation = () => {
    setDraftLocation({
      city: '',
      district: '',
      ward: '',
      street: '',
      project: '',
      useMergedAddress: false
    });
  };

  // Điều hướng chuyển trang kết quả chuẩn SEO Batdongsan.com.vn
  const executeSearchNavigation = (targetFilters, queryStr = '') => {
    const multiTypes = targetFilters.propertyTypes && Array.isArray(targetFilters.propertyTypes) && targetFilters.propertyTypes.length > 0 && !targetFilters.propertyTypes.includes('all')
      ? targetFilters.propertyTypes
      : null;
    const singleType = targetFilters.propertyType && targetFilters.propertyType !== 'all' ? targetFilters.propertyType : null;

    const targetUrl = buildSeoUrl({
      demand: targetFilters.demand || 'sale',
      propertyType: multiTypes ? null : singleType,
      propertyTypes: multiTypes,
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

  // Khóa cuộn background khi mở Bottom Sheet trên mobile (< 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && openFilterMenu) {
      if (window.innerWidth < 768) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }
  }, [openFilterMenu]);

  // Handlers áp dụng bộ lọc nhanh
  const handleApplyPropertyType = (selectedIds) => {
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
  };

  const handleApplyPrice = ({ minPrice, maxPrice, priceRange }) => {
    setFilters(prev => ({
      ...prev,
      minPrice,
      maxPrice,
      priceRange
    }));
    setOpenFilterMenu(null);
  };

  const handleApplyArea = ({ minArea, maxArea, areaRange }) => {
    setFilters(prev => ({
      ...prev,
      minArea,
      maxArea,
      areaRange
    }));
    setOpenFilterMenu(null);
  };

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

  // Autocomplete Suggestions when user types (Chuẩn Batdongsan.com.vn)
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return getSearchQuerySuggestions(searchTerm, {
      currentDemand,
      currentCity: filters?.city || '',
      isMergerMode
    });
  }, [searchTerm, currentDemand, filters?.city, isMergerMode]);

  const handleSelectSuggestion = (sug) => {
    setIsDropdownOpen(false);
    addSearch({
      title: sug.query,
      subtitle: sug.badge || '',
      url: sug.url,
      filters: {
        demand: sug.demand || filters.demand,
        propertyType: sug.propertyType || filters.propertyType,
        city: sug.city || filters.city,
        district: sug.district || filters.district,
        ward: sug.ward || filters.ward
      },
      keyword: sug.keyword || ''
    });
    if (sug.url) {
      navigate(sug.url);
    } else {
      executeSearchNavigation({
        ...filters,
        demand: sug.demand || filters.demand,
        propertyType: sug.propertyType || filters.propertyType,
        city: sug.city || filters.city,
        district: sug.district || filters.district,
        ward: sug.ward || filters.ward
      }, sug.keyword || '');
    }
  };

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
      addSearch({
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
      ward: '',
      street: '',
      project: '',
      useMergedAddress: false,
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
    const parts = [];
    if (filters.project) parts.push(filters.project);
    if (filters.street) parts.push(filters.street);
    if (filters.ward) parts.push(filters.ward);
    if (filters.district) parts.push(filters.district);
    if (parts.length > 0) return parts.join(', ');
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

  const getBedroomLabel = () => {
    if (!filters.bedroom || filters.bedroom === 'all') return 'Bất kỳ';
    const found = BEDROOM_OPTIONS.find(b => b.value === filters.bedroom);
    return found ? found.label : `${filters.bedroom} phòng ngủ`;
  };

  const getDirectionLabel = () => {
    if (!filters.direction || filters.direction === 'all') return 'Mọi hướng';
    if (filters.directions && filters.directions.length > 1) {
      return `${filters.directions.length} hướng (${filters.direction})`;
    }
    return filters.direction;
  };

  // Active City's districts
  const activeCityDistricts = useMemo(() => {
    if (!filters.city) return [];
    const found = VIETNAM_ADMINISTRATIVE_DATA.find(c => c.name === filters.city);
    return found ? found.districts || [] : [];
  }, [filters.city]);

  return (
    <div className="relative pt-5 pb-8 sm:pt-7 sm:pb-10 px-4 overflow-visible">
      {/* Background Graphic Ambient Glow & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
        {/* Subtle decorative architectural blur */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-20" ref={containerRef}>
        {/* Slogan */}
        <div className="text-center mb-4 sm:mb-5 text-white flex flex-col justify-center min-h-[3.75rem] sm:min-h-[4.25rem] lg:min-h-[3.25rem]">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight drop-shadow-md leading-snug sm:leading-tight">
            <span className="block lg:inline text-[#ff6b6b] mt-1 lg:mt-0">
              <span className="inline-block whitespace-nowrap">Mua Bán Nhà Đất, Cho Thuê Bất Động Sản Toàn Quốc</span>
            </span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium leading-normal">
            Nền tảng tìm kiếm và đăng tin bất động sản trên toàn quốc, kết nối người mua, người bán, người thuê và chủ sở hữu bất động sản. Khám phá hàng loạt tin đăng nhà đất, căn hộ, đất nền, nhà phố, mặt bằng kinh doanh và các loại hình bất động sản khác theo khu vực, giá bán và nhu cầu thực tế.
          </p>
        </div>

        {/* ----------------------------------------------------
            BATDONGSAN.COM.VN SEARCH BOX WIDGET
           ---------------------------------------------------- */}
        <div className="w-full max-w-4xl mx-auto">
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
                <IconSearch className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />

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
                    aria-label="Xóa tìm kiếm"
                  >
                    <IconClose className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Red "Tìm kiếm" Action Button */}
                <button
                  type="submit"
                  aria-label="Tìm kiếm nhà đất"
                  className="bg-[#c93026] hover:bg-[#a8231b] text-white font-bold px-4 sm:px-7 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shrink-0"
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
                        isMergerMode ? 'bg-[#c93026]' : 'bg-slate-300'
                      }`}
                      title={isMergerMode ? 'Tắt tra cứu sáp nhập' : 'Bật tra cứu sáp nhập'}
                      aria-label={isMergerMode ? 'Tắt tra cứu sáp nhập' : 'Bật tra cứu sáp nhập'}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          isMergerMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* GỢI Ý TỪ KHÓA CHUẨN BATDONGSAN.COM.VN */}
                  {searchTerm.trim().length > 0 ? (
                    <div className="p-2 sm:p-3">
                      <div className="space-y-0.5">
                        {suggestions.map((sug) => (
                          <div
                            key={sug.id || sug.query}
                            onClick={() => handleSelectSuggestion(sug)}
                            className="px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer group"
                          >
                            <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs sm:text-sm shrink-0 group-hover:text-red-600 transition-colors"></i>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <HighlightedQuery text={sug.query} highlight={searchTerm} />
                              {sug.badge && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                                  {sug.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Khi chưa nhập từ khóa: Lịch sử tìm kiếm & Chọn địa danh chi tiết */
                    <div className="p-3 sm:p-4">
                      {recentSearches.length > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-end mb-1 px-1">
                            <button
                              type="button"
                              onClick={clearSearches}
                              className="text-[11px] text-slate-400 hover:text-red-600 transition font-medium cursor-pointer"
                            >
                              Xóa lịch sử
                            </button>
                          </div>
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
                                  <div className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-red-600 transition truncate">
                                    {item.title}
                                  </div>
                                  {item.subtitle && (
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {item.subtitle}
                                    </div>
                                  )}
                                </div>

                                {/* Nút xóa từng mục */}
                                <button
                                  type="button"
                                  onClick={(e) => removeSearch(item.id, e)}
                                  className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center transition shrink-0 opacity-0 group-hover:opacity-100"
                                  title="Xóa mục này"
                                  aria-label="Xóa mục này"
                                >
                                  <i className="fa-solid fa-xmark text-xs"></i>
                                </button>

                                <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-slate-500 text-xs shrink-0 group-hover:translate-x-0.5 transition-transform"></i>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Action: Chọn quận huyện, phường xã, đường phố, dự án */}
                      <div
                        onClick={handleOpenDetailedLocation}
                        className={`p-2 sm:p-2.5 rounded-xl hover:bg-red-50/50 flex items-center gap-3 transition cursor-pointer group ${
                          recentSearches.length > 0 ? 'mt-2 pt-2.5 border-t border-slate-100' : ''
                        }`}
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c93026] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          <i className="fa-solid fa-sliders text-xs"></i>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition flex-1">
                          Chọn quận huyện, phường xã, đường phố, dự án
                        </span>
                        <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-red-600 text-xs shrink-0 group-hover:translate-x-0.5 transition-transform"></i>
                      </div>
                    </div>
                  )}
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
                  <IconLocation className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getLocationLabel()}</span>
                  <IconChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {openFilterMenu === 'city' && (
                  <>
                    {/* Desktop popover */}
                    <div className="hidden md:block absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-fadeIn max-h-72 overflow-y-auto">
                      <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khu vực</span>
                        <button
                          type="button"
                          onClick={handleOpenDetailedLocation}
                          className="text-red-600 hover:text-red-700 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-sliders text-[10px]"></i>
                          <span>Lọc chi tiết »</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, city: '', district: '', ward: '', street: '', project: '' }));
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

                    {/* Mobile Bottom Sheet Drawer */}
                    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 animate-fadeIn">
                      <div className="fixed inset-0" onClick={() => setOpenFilterMenu(null)} />
                      <div
                        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            Khu vực & Tỉnh thành
                          </h4>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleOpenDetailedLocation}
                              className="text-red-600 hover:text-red-700 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fa-solid fa-sliders text-[10px]"></i>
                              <span>Lọc chi tiết »</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenFilterMenu(null)}
                              className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
                              title="Đóng"
                            >
                              <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                          </div>
                        </div>
                        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setFilters(prev => ({ ...prev, city: '', district: '', ward: '', street: '', project: '' }));
                              setOpenFilterMenu(null);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                              !filters.city ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>Trên toàn quốc</span>
                            {!filters.city && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                          </button>
                          <div className="pt-2">
                            {VIETNAM_ADMINISTRATIVE_DATA.map(c => (
                              <div key={c.name} className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFilters(prev => ({ ...prev, city: c.name, district: '' }));
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between ${
                                    filters.city === c.name ? 'bg-red-50 text-red-600' : 'text-slate-800 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{c.name}</span>
                                  <span className="text-xs text-slate-400 font-normal">({c.districts?.length || 0} quận/huyện)</span>
                                </button>
                                {filters.city === c.name && activeCityDistricts.length > 0 && (
                                  <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-red-200 ml-3 my-1.5 max-h-52 overflow-y-auto">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFilters(prev => ({ ...prev, district: '' }));
                                        setOpenFilterMenu(null);
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                                        !filters.district ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600 hover:bg-slate-100'
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
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
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
                        </div>
                      </div>
                    </div>
                  </>
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
                  <IconHouse className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getPropertyTypeLabel()}</span>
                  <IconChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {openFilterMenu === 'type' && (
                  <>
                    {/* Desktop popover */}
                    <div className="hidden md:block absolute top-full left-0 mt-1.5 z-50 animate-fadeIn">
                      <PropertyTypeSelector
                        value={filters.propertyTypes || filters.propertyType}
                        demand={currentDemand}
                        onApply={handleApplyPropertyType}
                        onClose={() => setOpenFilterMenu(null)}
                      />
                    </div>

                    {/* Mobile Bottom Sheet Drawer */}
                    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 animate-fadeIn">
                      <div className="fixed inset-0" onClick={() => setOpenFilterMenu(null)} />
                      <div
                        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <PropertyTypeSelector
                          isModal={true}
                          value={filters.propertyTypes || filters.propertyType}
                          demand={currentDemand}
                          onApply={handleApplyPropertyType}
                          onClose={() => setOpenFilterMenu(null)}
                        />
                      </div>
                    </div>
                  </>
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
                  <IconTag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getPriceLabel()}</span>
                  <IconChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {openFilterMenu === 'price' && (
                  <>
                    {/* Desktop popover */}
                    <div className="hidden md:block absolute top-full left-0 sm:left-auto sm:right-0 md:left-0 mt-1.5 z-50 animate-fadeIn">
                      <PriceRangeSelector
                        demand={currentDemand}
                        minPrice={filters.minPrice}
                        maxPrice={filters.maxPrice}
                        priceRange={filters.priceRange}
                        onApply={handleApplyPrice}
                        onClose={() => setOpenFilterMenu(null)}
                      />
                    </div>

                    {/* Mobile Bottom Sheet Drawer */}
                    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 animate-fadeIn">
                      <div className="fixed inset-0" onClick={() => setOpenFilterMenu(null)} />
                      <div
                        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <PriceRangeSelector
                          isModal={true}
                          demand={currentDemand}
                          minPrice={filters.minPrice}
                          maxPrice={filters.maxPrice}
                          priceRange={filters.priceRange}
                          onApply={handleApplyPrice}
                          onClose={() => setOpenFilterMenu(null)}
                        />
                      </div>
                    </div>
                  </>
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
                  <IconRuler className="w-3.5 h-3.5 text-slate-400" />
                  <span>{getAreaLabel()}</span>
                  <IconChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {openFilterMenu === 'area' && (
                  <>
                    {/* Desktop popover: right-0 để không bị tràn viền phải container */}
                    <div className="hidden md:block absolute top-full right-0 mt-1.5 z-50 animate-fadeIn">
                      <AreaRangeSelector
                        minArea={filters.minArea}
                        maxArea={filters.maxArea}
                        areaRange={filters.areaRange}
                        onApply={handleApplyArea}
                        onClose={() => setOpenFilterMenu(null)}
                      />
                    </div>

                    {/* Mobile Bottom Sheet Drawer */}
                    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 animate-fadeIn">
                      <div className="fixed inset-0" onClick={() => setOpenFilterMenu(null)} />
                      <div
                        className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
                        onClick={e => e.stopPropagation()}
                      >
                        <AreaRangeSelector
                          isModal={true}
                          minArea={filters.minArea}
                          maxArea={filters.maxArea}
                          areaRange={filters.areaRange}
                          onApply={handleApplyArea}
                          onClose={() => setOpenFilterMenu(null)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Toggle Lọc nâng cao */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                title="Lọc nâng cao"
                aria-label="Lọc nâng cao"
                className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  showAdvanced || (filters.bedroom && filters.bedroom !== 'all') || (filters.direction && filters.direction !== 'all')
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-sliders text-[11px] text-emerald-600" aria-hidden="true"></i>
                <span className="hidden sm:inline">Lọc nâng cao</span>
                {((filters.bedroom && filters.bedroom !== 'all') || (filters.direction && filters.direction !== 'all')) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                )}
              </button>

              {/* Đặt lại bộ lọc (Reset) */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer ml-auto"
                title="Đặt lại bộ lọc"
                aria-label="Đặt lại bộ lọc"
              >
                <i className="fa-solid fa-arrow-rotate-left text-xs" aria-hidden="true"></i>
              </button>
            </div>

            {/* Collapsible Advanced Filters Section */}
            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 sm:p-3.5 rounded-2xl animate-fadeIn">
                {/* 1. Bedrooms Custom Dropdown */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5 select-none">
                    <i className="fa-solid fa-bed text-slate-400 text-[10px]"></i>
                    <span>Số phòng ngủ</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenFilterMenu(prev => prev === 'bedroom' ? null : 'bedroom')}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs ${
                      filters.bedroom && filters.bedroom !== 'all'
                        ? 'border-red-500 bg-red-50/60 text-red-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{getBedroomLabel()}</span>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openFilterMenu === 'bedroom' ? 'rotate-180' : ''}`}></i>
                  </button>

                  {openFilterMenu === 'bedroom' && (
                    <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-1.5 animate-fadeIn">
                      {BEDROOM_OPTIONS.map(opt => {
                        const isSelected = (filters.bedroom || 'all') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFilters(prev => ({ ...prev, bedroom: opt.value }));
                              setOpenFilterMenu(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'bg-red-50 text-red-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <i className="fa-solid fa-check text-xs text-red-600"></i>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Direction Custom Dropdown */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1.5 select-none">
                    <i className="fa-solid fa-compass text-slate-400 text-[10px]"></i>
                    <span>Hướng nhà</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenFilterMenu(prev => prev === 'direction' ? null : 'direction')}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-2xs ${
                      filters.direction && filters.direction !== 'all'
                        ? 'border-red-500 bg-red-50/60 text-red-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{getDirectionLabel()}</span>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${openFilterMenu === 'direction' ? 'rotate-180' : ''}`}></i>
                  </button>

                  {openFilterMenu === 'direction' && (
                    <div className="absolute top-full right-0 sm:left-auto mt-1.5 w-[300px] sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 animate-fadeIn flex flex-col items-center">
                      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <i className="fa-solid fa-compass text-[#00594c]"></i>
                          <span>Chọn hướng nhà phong thủy</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenFilterMenu(null)}
                          className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </div>

                      <DirectionCompassSelector
                        value={filters.directions && filters.directions.length > 0 ? filters.directions : filters.direction || 'all'}
                        onChange={(newDirVal, newDirArr) => {
                          setFilters(prev => ({
                            ...prev,
                            direction: newDirVal,
                            directions: newDirArr
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          MODAL LỌC CHI TIẾT KHU VỰC, DỰ ÁN (PORTAL)
         ==================================================== */}
      {showLocationModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setShowLocationModal(false)} />

          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scaleUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-red-600 text-sm"></i>
                <span>Khu vực, dự án</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs flex-1">
              {/* Switch: Tìm theo địa chỉ mới sau sáp nhập */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Tìm theo địa chỉ mới sau sáp nhập
                </span>
                <button
                  type="button"
                  onClick={() => setDraftLocation(prev => ({ ...prev, useMergedAddress: !prev.useMergedAddress }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    draftLocation.useMergedAddress ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                    draftLocation.useMergedAddress ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* 1. Tỉnh/Thành phố */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 text-xs sm:text-sm">
                  Tỉnh/Thành phố
                </label>
                <select
                  value={draftLocation.city || ''}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setDraftLocation(prev => ({
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
                  value={draftLocation.district || ''}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setDraftLocation(prev => ({
                      ...prev,
                      district: newDist,
                      ward: '',
                      street: '',
                      project: ''
                    }));
                  }}
                  disabled={!draftLocation.city}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs sm:text-sm font-medium outline-none focus:border-red-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">{draftLocation.city ? `Tất cả Quận/Huyện tại ${draftLocation.city}` : 'Tất cả Quận/Huyện'}</option>
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
                  value={draftLocation.ward || ''}
                  onChange={(e) => setDraftLocation(prev => ({ ...prev, ward: e.target.value }))}
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
                  value={draftLocation.street || ''}
                  onChange={(e) => setDraftLocation(prev => ({ ...prev, street: e.target.value }))}
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
                  value={draftLocation.project || ''}
                  onChange={(e) => setDraftLocation(prev => ({ ...prev, project: e.target.value }))}
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

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetLocation}
                className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer shrink-0"
              >
                Đặt lại
              </button>

              <button
                type="button"
                onClick={handleApplyLocation}
                className="flex-1 py-3 bg-[#c93026] hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer text-center"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
