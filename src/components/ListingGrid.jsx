'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';
import CustomSelect from './CustomSelect';
import { filterProperties } from '../utils/propertyFilter';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[750px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
      <i className="fa-solid fa-spinner fa-spin text-2xl mr-2 text-emerald-600"></i> Đang tải bản đồ...
    </div>
  ),
});

/**
 * Thuật toán sinh danh sách số trang hiển thị thông minh (Google/Amazon style)
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function ListingGrid({ 
  properties = [], 
  filters = {}, 
  setFilters,
  enablePagination = false,
  pageSize,
  limit,
  isHomePage = false,
  title,
  subtitle
}) {
  const { systemConfig } = useRealEstate();
  const gridContainerRef = useRef(null);

  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'split'
  const [sortBy, setSortBy] = useState('vip'); // 'vip', 'price-asc', 'price-desc', 'area-desc', 'newest'

  // Phân trang: Đọc trang hiện tại từ URL query param `?page=X` nếu có
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('page');
      const num = parseInt(p, 10);
      return !isNaN(num) && num > 0 ? num : 1;
    }
    return 1;
  });

  // Tự động reset về trang 1 khi các tiêu chí lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
    if (enablePagination && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('page')) {
        url.searchParams.delete('page');
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [filters, enablePagination]);

  // Đồng bộ trạng thái khi người dùng nhấn nút Back/Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search).get('page');
      const num = parseInt(p, 10);
      setCurrentPage(!isNaN(num) && num > 0 ? num : 1);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filter Properties
  const filteredProperties = useMemo(() => {
    return filterProperties(properties, filters);
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

  // Xác định số lượng hiển thị (Lấy từ cấu hình trang quản trị hoặc props)
  const homeLimit = limit || systemConfig?.homePageSize || 18;
  const categoryLimit = pageSize || systemConfig?.categoryPageSize || 12;

  // Tính toán phân trang
  const totalItems = sortedProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / categoryLimit));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * categoryLimit;
  const endIndex = Math.min(startIndex + categoryLimit, totalItems);

  // Danh sách hiển thị theo chế độ (Trang chủ cắt 18 tin | Danh mục phân trang)
  const displayedProperties = useMemo(() => {
    if (isHomePage) {
      return sortedProperties.slice(0, homeLimit);
    }
    if (enablePagination) {
      return sortedProperties.slice(startIndex, endIndex);
    }
    return sortedProperties;
  }, [sortedProperties, isHomePage, homeLimit, enablePagination, startIndex, endIndex]);

  // Xử lý chuyển trang mượt mà
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newPage === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', newPage.toString());
      }
      window.history.pushState(null, '', url.pathname + url.search);

      // Cuộn mượt lên đầu danh sách tin đăng
      if (gridContainerRef.current) {
        const top = gridContainerRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <div ref={gridContainerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* View Controls & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title || 'Danh Sách Bất Động Sản Nổi Bật'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {subtitle || (
              isHomePage 
                ? `Hiển thị ${displayedProperties.length} tin VIP và mới nhất trên Trang Chủ`
                : 'Ưu tiên hiển thị tin VIP Kim Cương, VIP Vàng và tin có tương tác cao'
            )}
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
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Dạng lưới"
            >
              <i className="fa-solid fa-grip"></i>
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Dạng danh sách"
            >
              <i className="fa-solid fa-list"></i>
              <span className="hidden sm:inline">Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'split' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
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
          {setFilters && (
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
              className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left mr-2"></i>
              Xóa toàn bộ bộ lọc
            </button>
          )}
        </div>
      ) : viewMode === 'split' ? (
        /* Split Screen View: List on left, Interactive Map on right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-start">
          <div className="lg:col-span-6 space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {displayedProperties.map(property => (
              <ListingCard key={property.id} property={property} viewMode="grid" />
            ))}
          </div>
          <div className="lg:col-span-6 sticky top-6">
            <InteractiveMap properties={displayedProperties} height="750px" />
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4 my-6">
          {displayedProperties.map(property => (
            <ListingCard key={property.id} property={property} viewMode="list" />
          ))}
        </div>
      ) : (
        /* Grid View: 3 columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {displayedProperties.map(property => (
            <ListingCard key={property.id} property={property} viewMode="grid" />
          ))}
        </div>
      )}

      {/* Trang Chủ: Nút xem tất cả BĐS nếu còn tin chưa hiển thị */}
      {isHomePage && sortedProperties.length > homeLimit && (
        <div className="mt-10 text-center">
          <Link 
            to={filters?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban'}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-bold text-sm shadow-sm transition group cursor-pointer"
          >
            <span>Xem tất cả {sortedProperties.length} bất động sản</span>
            <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition text-emerald-600"></i>
          </Link>
        </div>
      )}

      {/* Danh Mục: Thanh Phân Trang Chuẩn SEO & UX */}
      {enablePagination && totalPages > 1 && (
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Thông tin số lượng tin đang hiển thị */}
          <div className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
            Đang hiển thị <span className="font-bold text-slate-900">{startIndex + 1}</span> - <span className="font-bold text-slate-900">{endIndex}</span> trong tổng số <span className="font-bold text-emerald-600">{totalItems}</span> bất động sản
          </div>

          {/* Các nút bấm phân trang */}
          <nav className="flex items-center gap-1.5 flex-wrap justify-center" aria-label="Phân trang danh mục">
            {/* Nút Về Trang Đầu */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={safePage === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Về trang đầu tiên"
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>

            {/* Nút Trang Trước */}
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Trang trước"
            >
              <i className="fa-solid fa-angle-left"></i>
              <span className="hidden sm:inline">Trước</span>
            </button>

            {/* Danh sách các số trang */}
            {getPageNumbers(safePage, totalPages).map((p, idx) => {
              if (p === '...') {
                return (
                  <span 
                    key={`ellipsis-${idx}`} 
                    className="w-8 h-9 flex items-center justify-center text-slate-400 font-bold text-xs select-none"
                  >
                    ...
                  </span>
                );
              }
              const isActive = p === safePage;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}

            {/* Nút Trang Sau */}
            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Trang kế tiếp"
            >
              <span className="hidden sm:inline">Sau</span>
              <i className="fa-solid fa-angle-right"></i>
            </button>

            {/* Nút Đến Trang Cuối */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safePage === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="Đến trang cuối cùng"
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
