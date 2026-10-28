'use client';

import React, { useState } from 'react';
import { LOCATIONS, PROPERTY_TYPES, SALE_PRICE_PRESETS, RENT_PRICE_PRESETS, AREA_PRESETS } from '../data/mockData';
import CustomSelect from './CustomSelect';
import { Link } from '../router/RouterContext';



export default function HeroSearch({ filters, setFilters, totalResults }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Selected city's district list
  const currentCityObj = LOCATIONS.find(l => l.name === filters.city);
  const districtList = currentCityObj ? currentCityObj.districts : [];

  const handleCityChange = (newCity) => {
    setFilters(prev => ({
      ...prev,
      city: newCity,
      district: '' // reset district when city changes
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      demand: 'all',
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
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-700 overflow-hidden">
      {/* Background abstract architectural glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Title & Slogan */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <i className="fa-solid fa-sparkles"></i>
            Hệ Thống Phân Cấp Tin Đăng & Công Nghệ Bất Động Sản 4.0
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Tìm Kiếm & Đăng Tin Bất Động Sản <span className="text-emerald-400">Nhanh Chóng, Hiệu Quả</span>
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Khám phá hàng ngàn bất động sản chính chủ, tin đăng VIP Kim Cương, công nghệ xem nhà VR 360 thực tế ảo và công cụ so sánh trực quan.
          </p>
        </div>

        {/* Search Box Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-800 border border-slate-100">
          {/* Demand Tabs: Tất cả / Mua bán / Cho thuê */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setFilters(prev => ({ ...prev, demand: 'all' }))}
              className={`px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${filters.demand === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-layer-group text-xs"></i>
              Tất Cả
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, demand: 'sale' }))}
              className={`px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${filters.demand === 'sale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-tag text-xs"></i>
              Nhà Đất Bán
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, demand: 'rent' }))}
              className={`px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${filters.demand === 'rent' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-key text-xs"></i>
              Nhà Đất Cho Thuê
            </button>

            <div className="ml-auto text-xs text-slate-500 hidden sm:block shrink-0">
              Tìm thấy <strong className="text-emerald-600 font-bold">{totalResults}</strong> bất động sản phù hợp
            </div>
          </div>

          {/* Core Search Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Từ khóa / Dự án / Địa danh
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="VD: Đất Biển Mỹ Khê, Đất Nam Hòa Xuân, Biệt thự Sơn Trà..."
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Khu Vực / Thành Phố
              </label>
              <CustomSelect
                value={filters.city}
                onChange={handleCityChange}
                options={[
                  { value: '', label: 'Tất cả Tỉnh / Thành' },
                  ...LOCATIONS.map(loc => ({
                    value: loc.name,
                    label: loc.name,
                    sublabel: loc.name === 'Đà Nẵng' ? 'Trung tâm BĐS Đà Nẵng' : 'Bất Động Sản Quảng Nam'
                  }))
                ]}
                placeholder="Tất cả Tỉnh / Thành"
                showSearch={true}
                searchPlaceholder="Tìm kiếm..."
                icon={<i className="fa-solid fa-location-dot text-slate-400 text-xs"></i>}
              />
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Quận / Huyện
              </label>
              <CustomSelect
                value={filters.district}
                disabled={!filters.city}
                onChange={(val) => setFilters(prev => ({ ...prev, district: val }))}
                options={[
                  { value: '', label: filters.city ? 'Tất cả Quận/Huyện' : 'Chọn Tỉnh/Thành trước' },
                  ...districtList.map(dist => ({ value: dist.name, label: dist.name }))
                ]}
                placeholder={filters.city ? 'Tất cả Quận/Huyện' : 'Chọn Tỉnh/Thành trước'}
                showSearch={true}
                searchPlaceholder="Tìm quận huyện..."
                icon={<i className="fa-solid fa-map-pin text-slate-400 text-xs"></i>}
              />
            </div>

            {/* Property Type Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Loại hình BĐS
              </label>
              <CustomSelect
                value={filters.propertyType}
                onChange={(val) => setFilters(prev => ({ ...prev, propertyType: val }))}
                options={[
                  { value: 'all', label: 'Tất cả loại hình' },
                  ...PROPERTY_TYPES.map(type => ({ value: type.id, label: type.name }))
                ]}
                placeholder="Tất cả loại hình"
                icon={<i className="fa-solid fa-house-chimney text-slate-400 text-xs"></i>}
              />
            </div>
          </div>

          {/* Quick Price & Area Row + Advanced Filter Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 items-center">
            {/* Price Range Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Mức giá
              </label>
              <CustomSelect
                value={filters.priceRange}
                onChange={(val) => setFilters(prev => ({ ...prev, priceRange: val }))}
                options={[
                  { value: 'all', label: 'Mọi mức giá' },
                  ...(filters.demand === 'rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS).slice(1).map(p => ({
                    value: p.value,
                    label: p.label
                  }))
                ]}
                placeholder="Mọi mức giá"
              />
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Diện tích
              </label>
              <CustomSelect
                value={filters.areaRange}
                onChange={(val) => setFilters(prev => ({ ...prev, areaRange: val }))}
                options={[
                  { value: 'all', label: 'Mọi diện tích' },
                  ...AREA_PRESETS.slice(1).map(a => ({
                    value: a.value,
                    label: a.label
                  }))
                ]}
                placeholder="Mọi diện tích"
              />
            </div>

            {/* Toggle Advanced Filter */}
            <div className="flex items-center gap-2 mt-4 sm:mt-5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
              >
                <i className="fa-solid fa-sliders text-emerald-600"></i>
                <span>{showAdvanced ? 'Thu gọn bộ lọc' : 'Lọc nâng cao'}</span>
                <i className={`fa-solid ${showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-slate-400`}></i>
              </button>
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-center gap-2 mt-4 sm:mt-5">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Section */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-xl">
              {/* Bedrooms */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Số phòng ngủ
                </label>
                <select
                  value={filters.bedroom}
                  onChange={(e) => setFilters(prev => ({ ...prev, bedroom: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-emerald-500 text-slate-800"
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
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Hướng nhà
                </label>
                <select
                  value={filters.direction}
                  onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-emerald-500 text-slate-800"
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

              {/* Checkboxes: VR360 & Verified */}
              <div className="flex items-center gap-4 lg:col-span-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={filters.hasVR360}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasVR360: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span><i className="fa-solid fa-vr-cardboard text-purple-600 mr-1"></i> Có Tour VR 360</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={filters.onlyVerified}
                    onChange={(e) => setFilters(prev => ({ ...prev, onlyVerified: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span><i className="fa-solid fa-circle-check text-blue-600 mr-1"></i> Môi giới đã xác thực</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Popular Trending SEO Categories & Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
            <i className="fa-solid fa-fire text-amber-400 text-[10px]"></i>
            Xu hướng tìm kiếm:
          </span>
          {[
            { label: 'Căn hộ Hải Châu', path: '/ban-can-ho-chung-cu-quan-hai-chau' },
            { label: 'Căn hộ biển Sơn Trà', path: '/ban-can-ho-chung-cu-quan-son-tra' },
            { label: 'Đất Nam Hòa Xuân', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
            { label: 'Nhà mặt phố Hải Châu', path: '/ban-nha-mat-pho-quan-hai-chau' },
            { label: 'Biệt thự biển Đà Nẵng', path: '/ban-nha-biethu-lien-ke-da-nang' },
            { label: 'Đất nền Đà Nẵng', path: '/ban-dat-nen-du-an-da-nang' }
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-emerald-600/90 text-slate-300 hover:text-white rounded-full border border-slate-700/80 hover:border-emerald-500 text-[11px] font-medium transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

