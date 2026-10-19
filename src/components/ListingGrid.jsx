'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[750px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
      <i className="fa-solid fa-spinner fa-spin text-2xl mr-2 text-emerald-600"></i> Đang tải bản đồ...
    </div>
  ),
});
import { VIP_PACKAGES } from '../data/mockData';
import CustomSelect from './CustomSelect';

export default function ListingGrid({ properties, filters, setFilters }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'split'
  const [sortBy, setSortBy] = useState('vip'); // 'vip', 'price-asc', 'price-desc', 'area-desc', 'newest'

  // Filter Properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Phải là bài viết 'active' và chưa hết hạn theo chuẩn Batdongsan.com.vn
      if (prop.status !== 'active') return false;
      if (prop.expiresAt && Date.now() >= new Date(prop.expiresAt).getTime()) return false;

      // Demand filter
      if (filters.demand && filters.demand !== 'all' && prop.demand !== filters.demand) {
        return false;
      }

      // Property type filter
      if (filters.propertyType && filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }

      // City filter
      if (filters.city && !prop.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // District filter
      if (filters.district && !prop.district.toLowerCase().includes(filters.district.toLowerCase())) {
        return false;
      }

      // Keyword filter
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(kw);
        const matchAddress = prop.address.toLowerCase().includes(kw);
        const matchDesc = prop.description.toLowerCase().includes(kw);
        if (!matchTitle && !matchAddress && !matchDesc) return false;
      }

      // Price filter
      if (filters.priceRange && filters.priceRange !== 'all') {
        const p = prop.price;
        if (filters.priceRange === 'under-2b' && p > 2000000000) return false;
        if (filters.priceRange === '2b-5b' && (p < 2000000000 || p > 5000000000)) return false;
        if (filters.priceRange === '5b-10b' && (p < 5000000000 || p > 10000000000)) return false;
        if (filters.priceRange === '10b-30b' && (p < 10000000000 || p > 30000000000)) return false;
        if (filters.priceRange === 'over-30b' && p < 30000000000) return false;
      }

      // Area filter
      if (filters.areaRange && filters.areaRange !== 'all') {
        const a = prop.area;
        if (filters.areaRange === 'under-50' && a > 50) return false;
        if (filters.areaRange === '50-100' && (a < 50 || a > 100)) return false;
        if (filters.areaRange === '100-200' && (a < 100 || a > 200)) return false;
        if (filters.areaRange === 'over-200' && a < 200) return false;
      }

      // Bedroom filter
      if (filters.bedroom && filters.bedroom !== 'all') {
        if (filters.bedroom === '4+') {
          if (prop.bedroom < 4) return false;
        } else if (prop.bedroom !== parseInt(filters.bedroom, 10)) {
          return false;
        }
      }

      // Direction filter
      if (filters.direction && filters.direction !== 'all' && prop.direction !== filters.direction) {
        return false;
      }

      // VR360 filter
      if (filters.hasVR360 && !prop.hasVR360) return false;

      // Only verified agent
      if (filters.onlyVerified && (!prop.author || !prop.author.isVerified)) return false;

      return true;
    });
  }, [properties, filters]);

  // Sort Properties
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];

    const getVipRank = (vipId) => {
      switch (vipId) {
        case 'vip-diamond': return 1;
        case 'vip-gold': return 2;
        case 'vip-silver': return 3;
        case 'vip-bronze': return 4;
        default: return 5;
      }
    };

    return list.sort((a, b) => {
      if (sortBy === 'vip') {
        const rankDiff = getVipRank(a.vipPackageId) - getVipRank(b.vipPackageId);
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'area-desc') return b.area - a.area;
      if (sortBy === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return 0;
    });
  }, [filteredProperties, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Controls & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Danh Sách Bất Động Sản Nổi Bật
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ưu tiên hiển thị tin VIP Kim Cương, VIP Vàng và tin có tương tác cao
          </p>
        </div>

        {/* Sorting & View Mode Switches */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort Selection */}
          <div className="flex items-center gap-2 text-xs min-w-[210px]">
            <span className="text-slate-500 font-semibold hidden md:inline shrink-0">Sắp xếp:</span>
            <div className="flex-1">
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: 'vip', label: 'Mặc định' },
                  { value: 'newest', label: '🕒 Tin mới đăng nhất' },
                  { value: 'price-asc', label: '💵 Giá: Thấp đến Cao' },
                  { value: 'price-desc', label: '💎 Giá: Cao đến Thấp' },
                  { value: 'area-desc', label: '📐 Diện tích: Lớn đến Bé' }
                ]}
              />
            </div>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Dạng lưới"
            >
              <i className="fa-solid fa-grip"></i>
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Dạng danh sách"
            >
              <i className="fa-solid fa-list"></i>
              <span className="hidden sm:inline">Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Bản đồ song song"
            >
              <i className="fa-solid fa-map-location-dot"></i>
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {sortedProperties.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 my-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mx-auto mb-4">
            <i className="fa-solid fa-house-chimney-crack"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy bất động sản phù hợp</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Không có kết quả nào khớp với bộ lọc hiện tại của bạn. Hãy thử thay đổi mức giá, diện tích hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => setFilters({
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
            })}
            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            <i className="fa-solid fa-rotate-left mr-2"></i>
            Xóa toàn bộ bộ lọc
          </button>
        </div>
      ) : viewMode === 'split' ? (
        /* Split Screen View: List on left, Interactive Map on right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
          <div className="lg:col-span-6 space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {sortedProperties.map(property => (
              <ListingCard key={property.id} property={property} viewMode="grid" />
            ))}
          </div>
          <div className="lg:col-span-6 sticky top-6">
            <InteractiveMap properties={sortedProperties} height="750px" />
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4 my-6">
          {sortedProperties.map(property => (
            <ListingCard key={property.id} property={property} viewMode="list" />
          ))}
        </div>
      ) : (
        /* Grid View: 3 columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {sortedProperties.map(property => (
            <ListingCard key={property.id} property={property} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
