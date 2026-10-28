'use client';

import React, { useState, useMemo } from 'react';
import { SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import { Link } from '../router/RouterContext';

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
  onScrollToTop
}) {
  const isRent = demand === 'rent';
  const pricePresets = isRent ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;

  const [showAllPrices, setShowAllPrices] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  // Tính số lượng tin đăng theo từng quận huyện
  const districtCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(properties)) {
      properties.forEach(p => {
        if (p.demand === demand && p.district) {
          counts[p.district] = (counts[p.district] || 0) + 1;
        }
      });
    }
    return counts;
  }, [properties, demand]);

  // Xử lý chọn khoảng giá
  const handleSelectPrice = (preset) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      priceRange: preset.value,
      minPrice: preset.min || null,
      maxPrice: preset.max || null
    }));
    if (onScrollToTop) onScrollToTop();
  };

  // Xử lý chọn diện tích
  const handleSelectArea = (preset) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      areaRange: preset.value,
      minArea: preset.min || null,
      maxArea: preset.max || null
    }));
    if (onScrollToTop) onScrollToTop();
  };

  // Xử lý chọn quận huyện
  const handleSelectDistrict = (item) => {
    if (!setFilters) return;
    const isCurrent = filters.district === item.name;
    setFilters(prev => ({
      ...prev,
      city: isCurrent ? '' : item.city,
      district: isCurrent ? '' : item.name,
      ward: '',
      street: ''
    }));
    if (onScrollToTop) onScrollToTop();
  };

  // Xử lý chọn dự án
  const handleSelectProject = (proj) => {
    if (!setFilters) return;
    setFilters(prev => ({
      ...prev,
      keyword: proj.filterKeyword,
      project: proj.name
    }));
    if (onScrollToTop) onScrollToTop();
  };

  const displayedPrices = showAllPrices ? pricePresets : pricePresets.slice(0, 8);
  const displayedAreas = showAllAreas ? AREA_PRESETS : AREA_PRESETS.slice(0, 8);
  const displayedDistricts = showAllDistricts ? POPULAR_DISTRICTS : POPULAR_DISTRICTS.slice(0, 7);

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
            const isSelected = (filters.priceRange || 'all') === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelectPrice(item)}
                className={`text-left px-2.5 py-2 rounded-xl transition cursor-pointer truncate font-medium flex items-center justify-between group ${
                  isSelected
                    ? 'bg-red-50 text-red-600 font-bold border border-red-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
                }`}
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
                <i className={`fa-solid fa-chevron-right text-[9px] transition-transform ${isSelected ? 'text-red-600' : 'text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5'}`}></i>
              </button>
            );
          })}
        </div>

        {pricePresets.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllPrices(!showAllPrices)}
            className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{showAllPrices ? 'Thu gọn' : `Xem thêm (${pricePresets.length - 8} mức giá)`}</span>
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
            const isSelected = (filters.areaRange || 'all') === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelectArea(item)}
                className={`text-left px-2.5 py-2 rounded-xl transition cursor-pointer truncate font-medium flex items-center justify-between group ${
                  isSelected
                    ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-teal-700'
                }`}
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
                <i className={`fa-solid fa-chevron-right text-[9px] transition-transform ${isSelected ? 'text-teal-700' : 'text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5'}`}></i>
              </button>
            );
          })}
        </div>

        {AREA_PRESETS.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllAreas(!showAllAreas)}
            className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-teal-700 hover:text-teal-800 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{showAllAreas ? 'Thu gọn' : `Xem thêm (${AREA_PRESETS.length - 8} khoảng)`}</span>
            <i className={`fa-solid fa-chevron-${showAllAreas ? 'up' : 'down'} text-[10px]`}></i>
          </button>
        )}
      </div>

      {/* ========================================================
          WIDGET 3: BẤT ĐỘNG SẢN THEO KHU VỰC
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-location-dot text-xs"></i>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
            Khu vực nổi bật
          </h3>
        </div>

        <div className="space-y-1 text-xs">
          {displayedDistricts.map(item => {
            const isSelected = filters.district === item.name;
            const count = districtCounts[item.name] || 0;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectDistrict(item)}
                className={`w-full text-left px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-red-50 text-red-600 font-bold border border-red-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <i className={`fa-solid fa-map-pin text-[10px] ${isSelected ? 'text-red-600' : 'text-slate-400 group-hover:text-red-500'}`}></i>
                  <span className="truncate">{item.name}</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600'
                }`}>
                  {count > 0 ? `${count} tin` : item.city}
                </span>
              </button>
            );
          })}
        </div>

        {POPULAR_DISTRICTS.length > 7 && (
          <button
            type="button"
            onClick={() => setShowAllDistricts(!showAllDistricts)}
            className="w-full mt-3 pt-2.5 border-t border-slate-100 text-center text-xs font-bold text-slate-600 hover:text-red-600 transition cursor-pointer flex items-center justify-center gap-1"
          >
            <span>{showAllDistricts ? 'Thu gọn' : `Xem thêm khu vực (${POPULAR_DISTRICTS.length - 7})`}</span>
            <i className={`fa-solid fa-chevron-${showAllDistricts ? 'up' : 'down'} text-[10px]`}></i>
          </button>
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
          {FEATURED_PROJECTS.map(proj => (
            <div
              key={proj.id}
              onClick={() => handleSelectProject(proj)}
              className="group flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
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
            </div>
          ))}
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
