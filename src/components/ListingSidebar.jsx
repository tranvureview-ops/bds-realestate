'use client';

import React, { useState, useMemo } from 'react';
import { SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import { Link } from '../router/RouterContext';
import { buildSeoUrl, buildSeoFilterUrl, buildDistrictSeoUrl, buildCitySeoUrl, getDistrictSlug } from '../utils/permalink';
import { expandPropertyTypeIds } from '../data/propertyTypeTaxonomy';
import { VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData';

// Danh sách các dự án nổi bật tiêu biểu tại Đà Nẵng & Quảng Nam
const FEATURED_PROJECTS = [
  {
    id: 'proj-1',
    name: 'The Filmore Đà Nẵng',
    location: 'Bạch Đằng, Q. Hải Châu',
    price: 'Từ 85 - 110 tr/m²',
    status: 'Đang mở bán',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    filterKeyword: 'The Filmore'
  },
  {
    id: 'proj-2',
    name: 'Sun Cosmo Residence',
    location: 'Cầu Trần Thị Lý, Q. Hải Châu',
    price: 'Từ 65 - 90 tr/m²',
    status: 'Sắp bàn giao',
    badgeColor: 'bg-blue-100 text-blue-800',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    filterKeyword: 'Sun Cosmo Residence'
  },
  {
    id: 'proj-3',
    name: 'Sun Ponte Residence',
    location: 'Cầu Rồng, Q. Sơn Trà',
    price: 'Từ 70 - 95 tr/m²',
    status: 'Mở bán đợt 2',
    badgeColor: 'bg-amber-100 text-amber-800',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
    filterKeyword: 'Sun Ponte Residence'
  },
  {
    id: 'proj-4',
    name: 'KĐT Nam Hòa Xuân',
    location: 'Hòa Quý, Q. Ngũ Hành Sơn',
    price: 'Từ 3.2 - 6.5 tỷ/lô',
    status: 'Sổ đỏ sẵn',
    badgeColor: 'bg-rose-100 text-rose-800',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    filterKeyword: 'Nam Hòa Xuân'
  }
];

// Danh sách các tỉnh/thành phố trọng điểm toàn quốc chuẩn batdongsan.com.vn
const POPULAR_CITIES = [
  { name: 'Hà Nội' },
  { name: 'TP. Hồ Chí Minh' },
  { name: 'Đà Nẵng' },
  { name: 'Bình Dương' },
  { name: 'Đồng Nai' },
  { name: 'Quảng Nam' },
  { name: 'Khánh Hòa' },
  { name: 'Hải Phòng' },
  { name: 'Bà Rịa - Vũng Tàu' },
  { name: 'Cần Thơ' },
  { name: 'Lâm Đồng' },
  { name: 'Kiên Giang' }
];

// Danh sách các quận/huyện trọng điểm
const POPULAR_DISTRICTS = [
  { name: 'Quận Hải Châu', city: 'Đà Nẵng' },
  { name: 'Quận Sơn Trà', city: 'Đà Nẵng' },
  { name: 'Quận Ngũ Hành Sơn', city: 'Đà Nẵng' },
  { name: 'Quận Thanh Khê', city: 'Đà Nẵng' },
  { name: 'Quận Cẩm Lệ', city: 'Đà Nẵng' },
  { name: 'Quận Liên Chiểu', city: 'Đà Nẵng' },
  { name: 'Huyện Hòa Vang', city: 'Đà Nẵng' },
  { name: 'Thành phố Hội An', city: 'Quảng Nam' },
  { name: 'Thị xã Điện Bàn', city: 'Quảng Nam' },
  { name: 'Quận 1', city: 'TP. Hồ Chí Minh' },
  { name: 'Quận Cầu Giấy', city: 'Hà Nội' }
];

export default function ListingSidebar({
  demand = 'sale',
  filters = {},
  setFilters,
  properties = [],
  onScrollToTop,
  basePath = ''
}) {
  const isRent = (filters?.demand === 'rent' || demand === 'rent');
  const currentDemand = isRent ? 'rent' : 'sale';
  const pricePresets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;

  const [showAllPrices, setShowAllPrices] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);

  const activeCity = filters?.city || '';
  const isCitySelected = Boolean(activeCity && activeCity !== 'all' && activeCity !== 'Toàn Quốc');

  // 1. Lọc danh sách BĐS theo đúng Danh Mục (Nhu cầu & Loại hình BĐS hiện tại)
  const categoryProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    const activeTypes = expandPropertyTypeIds(filters?.propertyTypes || filters?.propertyType);
    const hasTypeFilter = activeTypes.length > 0 && !activeTypes.includes('all');

    return properties.filter(p => {
      // a. Phù hợp Trạng thái tin
      if (p.status && p.status !== 'active') return false;

      // b. Phù hợp Nhu cầu (Mua bán / Cho thuê)
      if (p.demand !== currentDemand) return false;

      // c. Phù hợp Loại hình BĐS (Danh mục)
      if (hasTypeFilter && !activeTypes.includes(p.propertyType)) {
        return false;
      }

      // d. Nếu có lọc Tin xác thực
      if (filters?.onlyVerified && !p.verified && !p.isVerified) {
        return false;
      }

      return true;
    });
  }, [properties, currentDemand, filters?.propertyType, filters?.propertyTypes, filters?.onlyVerified]);

  // 2. Tính số lượng tin đăng theo từng tỉnh thành theo đúng danh mục
  const cityCounts = useMemo(() => {
    const counts = {};
    categoryProperties.forEach(p => {
      if (p.city) {
        counts[p.city] = (counts[p.city] || 0) + 1;
      }
    });
    return counts;
  }, [categoryProperties]);

  // 3. Danh sách Tỉnh / Thành phố được sắp xếp GIẢM DẦN theo số lượng tin
  const sortedCities = useMemo(() => {
    const allCityNames = new Set(POPULAR_CITIES.map(c => c.name));
    Object.keys(cityCounts).forEach(cName => allCityNames.add(cName));

    const list = Array.from(allCityNames).map(name => ({
      name,
      count: cityCounts[name] || 0
    }));

    return list.sort((a, b) => {
      // Ưu tiên tỉnh/thành có số lượng tin nhiều nhất lên trước
      if (b.count !== a.count) return b.count - a.count;
      // Cùng số lượng tin thì xếp theo thứ tự bảng chữ cái tiếng Việt
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [cityCounts]);

  // 4. Tính số lượng tin đăng theo từng quận huyện theo đúng danh mục
  const districtCounts = useMemo(() => {
    const counts = {};
    categoryProperties.forEach(p => {
      if (p.district) {
        if (!isCitySelected || !p.city || p.city.toLowerCase() === activeCity.toLowerCase() || p.city.toLowerCase().includes(activeCity.toLowerCase())) {
          counts[p.district] = (counts[p.district] || 0) + 1;
        }
      }
    });
    return counts;
  }, [categoryProperties, isCitySelected, activeCity]);

  // 5. Danh sách quận/huyện của thành phố đang chọn, sắp xếp GIẢM DẦN theo số lượng tin
  const cityDistricts = useMemo(() => {
    if (!isCitySelected) return [];
    const matchedCity = VIETNAM_ADMINISTRATIVE_DATA.find(c =>
      c.name.toLowerCase() === activeCity.toLowerCase() ||
      c.name.toLowerCase().includes(activeCity.toLowerCase())
    );

    let rawDistricts = [];
    if (matchedCity?.districts && matchedCity.districts.length > 0) {
      rawDistricts = matchedCity.districts.map(d => ({ name: d.name, city: activeCity }));
    } else {
      rawDistricts = POPULAR_DISTRICTS.filter(d => !d.city || d.city === activeCity);
    }

    // Đảm bảo tất cả quận/huyện có tin trong categoryProperties cũng có mặt
    const districtNameSet = new Set(rawDistricts.map(d => d.name));
    categoryProperties.forEach(p => {
      if (p.district && (!p.city || p.city.toLowerCase() === activeCity.toLowerCase() || p.city.toLowerCase().includes(activeCity.toLowerCase()))) {
        if (!districtNameSet.has(p.district)) {
          districtNameSet.add(p.district);
          rawDistricts.push({ name: p.district, city: activeCity });
        }
      }
    });

    // Gắn số lượng tin và sắp xếp giảm dần theo số lượng tin (quận nhiều tin nhất lên đầu)
    const withCounts = rawDistricts.map(d => ({
      ...d,
      count: districtCounts[d.name] || 0
    }));

    return withCounts.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [isCitySelected, activeCity, districtCounts, categoryProperties]);

  // Đồng bộ thanh địa chỉ trình duyệt mà KHÔNG gây cuộn trang / reload
  const syncBrowserUrl = (targetUrl) => {
    if (typeof window !== 'undefined' && targetUrl) {
      try {
        if (window.location.pathname !== targetUrl) {
          window.history.pushState(null, '', targetUrl);
        }
      } catch {
        // Fallback im lặng nếu pushState bị hạn chế
      }
    }
  };

  // Xử lý chọn khoảng giá (Mượt mà, không cuộn giật, hỗ trợ bật/tắt toggle)
  const handleSelectPrice = (e, preset, targetUrl) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    const isSelected = (filters.priceRange || 'all') === preset.value;
    const nextRange = isSelected ? 'all' : preset.value;
    const nextMin = isSelected ? null : (preset.min || null);
    const nextMax = isSelected ? null : (preset.max || null);

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        priceRange: nextRange,
        minPrice: nextMin,
        maxPrice: nextMax
      }));
    }

    const resetUrl = buildSeoUrl({
      ...filters,
      demand: isRent ? 'rent' : 'sale',
      priceRange: 'all',
      minPrice: null,
      maxPrice: null
    });
    const nextUrl = isSelected ? resetUrl : targetUrl;
    syncBrowserUrl(nextUrl);
  };

  // Xử lý chọn diện tích (Mượt mà, không cuộn giật, hỗ trợ bật/tắt toggle)
  const handleSelectArea = (e, preset, targetUrl) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    const isSelected = (filters.areaRange || 'all') === preset.value;
    const nextRange = isSelected ? 'all' : preset.value;
    const nextMin = isSelected ? null : (preset.min || null);
    const nextMax = isSelected ? null : (preset.max || null);

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        areaRange: nextRange,
        minArea: nextMin,
        maxArea: nextMax
      }));
    }

    const resetUrl = buildSeoUrl({
      ...filters,
      demand: isRent ? 'rent' : 'sale',
      areaRange: 'all',
      minArea: null,
      maxArea: null
    });
    const nextUrl = isSelected ? resetUrl : targetUrl;
    syncBrowserUrl(nextUrl);
  };

  // Xử lý chọn tỉnh/thành phố khi ở danh mục chính
  const handleSelectCity = (e, cityName, targetUrl) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        city: cityName,
        district: '',
        ward: '',
        street: '',
        project: ''
      }));
    }

    syncBrowserUrl(targetUrl);
  };

  // Quay lại danh mục chính toàn quốc
  const handleResetCity = (e) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        city: '',
        district: '',
        ward: '',
        street: '',
        project: ''
      }));
    }

    const resetUrl = buildSeoUrl({
      ...filters,
      demand: currentDemand,
      city: '',
      district: '',
      ward: '',
      street: '',
      project: ''
    });
    syncBrowserUrl(resetUrl);
  };

  // Xử lý chọn quận huyện (Mượt mà, không cuộn giật, hỗ trợ bật/tắt toggle)
  const handleSelectDistrict = (e, item, targetUrl) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    const isSelected = filters.district === item.name;

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        city: isSelected ? '' : (item.city || activeCity),
        district: isSelected ? '' : item.name,
        ward: '',
        street: ''
      }));
    }

    const resetUrl = buildSeoUrl({
      ...filters,
      demand: currentDemand,
      city: item.city || activeCity,
      district: '',
      ward: '',
      street: ''
    });
    const nextUrl = isSelected ? resetUrl : targetUrl;
    syncBrowserUrl(nextUrl);
  };

  // Xử lý chọn dự án (Mượt mà, không cuộn giật, hỗ trợ bật/tắt toggle)
  const handleSelectProject = (e, proj, targetUrl) => {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
    }

    const isSelected = filters.project === proj.name;

    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        keyword: isSelected ? '' : (proj.filterKeyword || proj.name),
        project: isSelected ? '' : proj.name
      }));
    }

    const resetUrl = isRent ? '/nha-dat-cho-thue' : '/nha-dat-ban';
    const nextUrl = isSelected ? resetUrl : targetUrl;
    syncBrowserUrl(nextUrl);
  };

  const filteredPricePresets = useMemo(() => {
    return pricePresets.filter(p => p.value !== 'all');
  }, [pricePresets]);

  const filteredAreaPresets = useMemo(() => {
    return AREA_PRESETS.filter(p => p.value !== 'all');
  }, []);

  const displayedPrices = showAllPrices ? filteredPricePresets : filteredPricePresets.slice(0, 8);
  const displayedAreas = showAllAreas ? filteredAreaPresets : filteredAreaPresets.slice(0, 8);
  const displayedCities = showAllCities ? sortedCities : sortedCities.slice(0, 7);
  const displayedDistricts = showAllDistricts ? cityDistricts : cityDistricts.slice(0, 7);

  return (
    <div className="w-full space-y-5">
      {/* ========================================================
          WIDGET 1: LỌC THEO KHOẢNG GIÁ (CHUẨN BATDONGSAN.COM.VN)
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-tag text-xs"></i>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
            Lọc theo khoảng giá
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {displayedPrices.map(item => {
            const targetUrl = buildSeoUrl({
              ...filters,
              demand: isRent ? 'rent' : 'sale',
              priceRange: item.value
            });

            return (
              <Link
                key={item.value}
                href={targetUrl}
                scroll={false}
                onClick={(e) => handleSelectPrice(e, item, targetUrl)}
                className="text-left px-2.5 py-2 rounded-xl transition-colors duration-150 cursor-pointer truncate font-medium flex items-center justify-between group border border-transparent text-slate-700 hover:bg-slate-50 hover:text-red-600"
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
                <i className="fa-solid fa-chevron-right text-[9px] text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-transform"></i>
              </Link>
            );
          })}
        </div>

        {filteredPricePresets.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllPrices(!showAllPrices)}
            className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{showAllPrices ? 'Thu gọn' : `Xem thêm (${filteredPricePresets.length - 8} mức giá)`}</span>
            <i className={`fa-solid fa-chevron-${showAllPrices ? 'up' : 'down'} text-[10px]`}></i>
          </button>
        )}
      </div>

      {/* ========================================================
          WIDGET 2: LỌC THEO DIỆN TÍCH (CHUẨN BATDONGSAN.COM.VN)
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-ruler-combined text-xs"></i>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
            Lọc theo diện tích
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {displayedAreas.map(item => {
            const targetUrl = buildSeoUrl({
              ...filters,
              demand: isRent ? 'rent' : 'sale',
              areaRange: item.value
            });

            return (
              <Link
                key={item.value}
                href={targetUrl}
                scroll={false}
                onClick={(e) => handleSelectArea(e, item, targetUrl)}
                className="text-left px-2.5 py-2 rounded-xl transition-colors duration-150 cursor-pointer truncate font-medium flex items-center justify-between group border border-transparent text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
                <i className="fa-solid fa-chevron-right text-[9px] text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-transform"></i>
              </Link>
            );
          })}
        </div>

        {filteredAreaPresets.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllAreas(!showAllAreas)}
            className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-teal-700 hover:text-teal-800 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{showAllAreas ? 'Thu gọn' : `Xem thêm (${filteredAreaPresets.length - 8} khoảng)`}</span>
            <i className={`fa-solid fa-chevron-${showAllAreas ? 'up' : 'down'} text-[10px]`}></i>
          </button>
        )}
      </div>

      {/* ========================================================
          WIDGET 3: BẤT ĐỘNG SẢN THEO KHU VỰC
          - Ở danh mục chính (chưa chọn thành phố): Hiển thị Tỉnh / Thành phố nổi bật
          - Khi đã chọn thành phố: Hiển thị các Quận / Huyện thuộc thành phố đó
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i className={`fa-solid ${isCitySelected ? 'fa-location-dot' : 'fa-map-location-dot'} text-xs`}></i>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate">
              {isCitySelected ? `Khu vực tại ${activeCity}` : 'Bất động sản theo tỉnh thành'}
            </h3>
          </div>
          {isCitySelected && (
            <button
              type="button"
              onClick={handleResetCity}
              className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
              title="Xem tất cả tỉnh thành"
            >
              <i className="fa-solid fa-arrow-left text-[9px]"></i>
              <span>Toàn quốc</span>
            </button>
          )}
        </div>

        {/* 1. Danh sách Tỉnh / Thành phố khi ở Danh mục chính (Toàn quốc) */}
        {!isCitySelected ? (
          <>
            <div className="space-y-1 text-xs">
              {displayedCities.map(item => {
                const count = item.count || 0;
                const targetUrl = buildSeoUrl({
                  ...filters,
                  demand: currentDemand,
                  city: item.name,
                  district: '',
                  ward: '',
                  street: '',
                  project: ''
                });

                return (
                  <Link
                    key={item.name}
                    href={targetUrl}
                    scroll={false}
                    onClick={(e) => handleSelectCity(e, item.name, targetUrl)}
                    className="w-full text-left px-3 py-2 rounded-xl transition-colors duration-150 cursor-pointer flex items-center justify-between group border border-transparent text-slate-700 hover:bg-slate-50 hover:text-red-600"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <i className="fa-solid fa-map-pin text-[10px] text-slate-400 group-hover:text-red-500 transition-colors"></i>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                      {count > 0 ? `${count} tin` : 'Xem tin'}
                    </span>
                  </Link>
                );
              })}
            </div>

            {sortedCities.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllCities(!showAllCities)}
                className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{showAllCities ? 'Thu gọn' : `Xem thêm tỉnh thành (${sortedCities.length - 7})`}</span>
                <i className={`fa-solid fa-chevron-${showAllCities ? 'up' : 'down'} text-[10px]`}></i>
              </button>
            )}
          </>
        ) : (
          /* 2. Danh sách Quận / Huyện khi đã chọn một Tỉnh / Thành phố cụ thể */
          <>
            <div className="space-y-1 text-xs">
              {displayedDistricts.map(item => {
                const count = item.count || 0;
                const targetUrl = buildSeoUrl({
                  ...filters,
                  demand: currentDemand,
                  city: item.city || activeCity,
                  district: item.name,
                  ward: '',
                  street: ''
                });

                return (
                  <Link
                    key={item.name}
                    href={targetUrl}
                    scroll={false}
                    onClick={(e) => handleSelectDistrict(e, item, targetUrl)}
                    className="w-full text-left px-3 py-2 rounded-xl transition-colors duration-150 cursor-pointer flex items-center justify-between group border border-transparent text-slate-700 hover:bg-slate-50 hover:text-red-600"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <i className="fa-solid fa-map-pin text-[10px] text-slate-400 group-hover:text-red-500 transition-colors"></i>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                      {count > 0 ? `${count} tin` : 'Xem tin'}
                    </span>
                  </Link>
                );
              })}
            </div>

            {cityDistricts.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllDistricts(!showAllDistricts)}
                className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{showAllDistricts ? 'Thu gọn' : `Xem thêm khu vực (${cityDistricts.length - 7})`}</span>
                <i className={`fa-solid fa-chevron-${showAllDistricts ? 'up' : 'down'} text-[10px]`}></i>
              </button>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          WIDGET 4: DỰ ÁN BẤT ĐỘNG SẢN NỔI BẬT
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-city text-xs"></i>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
              Dự án nổi bật
            </h3>
          </div>
          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
            Hot 2026
          </span>
        </div>

        <div className="space-y-3">
          {FEATURED_PROJECTS.map(proj => {
            const isSelected = filters.project === proj.name;
            const projUrl = `/${currentDemand === 'rent' ? 'nha-dat-cho-thue' : 'nha-dat-ban'}?keyword=${encodeURIComponent(proj.filterKeyword || proj.name)}`;

            return (
              <Link
                key={proj.id}
                href={projUrl}
                scroll={false}
                onClick={(e) => handleSelectProject(e, proj, projUrl)}
                className={`group flex gap-3 p-2 rounded-xl transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                    : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                  <img
                    src={proj.image}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition truncate">
                      {proj.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      <i className="fa-solid fa-location-dot text-[9px] mr-1 text-slate-400"></i>
                      {proj.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold text-red-600">
                      {proj.price}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${proj.badgeColor}`}>
                      {proj.status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          WIDGET 5: TIỆN ÍCH TÍNH LÃI SUẤT VAY MUA NHÀ
         ======================================================== */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <i className="fa-solid fa-calculator text-sm"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-snug">
              Tính lãi suất vay mua nhà
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ước tính số tiền trả góp gốc & lãi hàng tháng từ Vietcombank, BIDV, Techcombank...
            </p>
          </div>
        </div>

        <Link
          to="/tinh-lai-vay"
          className="mt-3.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Tính toán khoản vay</span>
          <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* ========================================================
          WIDGET 6: BANNER ĐĂNG TIN BÁN & CHO THUÊ NHÀ ĐẤT
         ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-red-600/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-[10px] font-bold text-red-300">
            <i className="fa-solid fa-fire text-red-400"></i> Đăng tin hiệu quả
          </div>

          <h4 className="text-sm font-black text-white leading-snug">
            Bạn có nhà đất cần bán hoặc cho thuê?
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tiếp cận 100.000+ người tìm mua thực tế mỗi ngày. Hỗ trợ duyệt nhanh, định giá và pháp lý chuẩn xác!
          </p>

          <Link
            to="/dang-tin"
            className="w-full py-2.5 bg-[#e03c31] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer block text-center"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Đăng tin ngay</span>
          </Link>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Hotline tư vấn 24/7:</span>
            <a href="tel:0905467138" className="text-red-400 font-bold hover:underline">
              0905 467 138
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
