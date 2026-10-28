'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';
import CustomSelect from './CustomSelect';
import { filterProperties } from '../utils/propertyFilter';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import { buildPaginationUrl } from '../utils/permalink';
import ListingSidebar from './ListingSidebar';

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
  hasSidebar,
  title,
  subtitle,
  initialPage = 1,
  basePath = '',
  className = ''
}) {
  const { systemConfig } = useRealEstate();
  const gridContainerRef = useRef(null);

  const showSidebar = hasSidebar !== undefined ? hasSidebar : !isHomePage;

  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'split'
  const [sortBy, setSortBy] = useState('vip'); // 'vip', 'price-asc', 'price-desc', 'area-desc', 'newest'

  // Phân trang: Đọc trang hiện tại từ initialPage hoặc URL pathname /page/:page
  const [currentPage, setCurrentPage] = useState(() => {
    if (initialPage && Number(initialPage) > 0) return Number(initialPage);
    if (typeof window !== 'undefined') {
      const pageMatch = window.location.pathname.match(/\/page\/(\d+)/i);
      if (pageMatch) {
        const num = parseInt(pageMatch[1], 10);
        if (!isNaN(num) && num > 0) return num;
      }
      const p = new URLSearchParams(window.location.search).get('page');
      const num = parseInt(p, 10);
      return !isNaN(num) && num > 0 ? num : 1;
    }
    return 1;
  });

  // Đồng bộ trang khi initialPage thay đổi
  useEffect(() => {
    if (initialPage && Number(initialPage) > 0) {
      setCurrentPage(Number(initialPage));
    }
  }, [initialPage]);

  // Đồng bộ trạng thái khi người dùng nhấn nút Back/Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const pageMatch = window.location.pathname.match(/\/page\/(\d+)/i);
      if (pageMatch) {
        const num = parseInt(pageMatch[1], 10);
        if (!isNaN(num) && num > 0) {
          setCurrentPage(num);
          return;
        }
      }
      const p = new URLSearchParams(window.location.search).get('page');
      const num = parseInt(p, 10);
      setCurrentPage(!isNaN(num) && num > 0 ? num : 1);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reset trang về 1 khi người dùng thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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

  // Xác định basePath của trang hiện tại (ưu tiên prop basePath, fallback URL pathname loại bỏ /page/...)
  const activeBasePath = useMemo(() => {
    if (basePath) return basePath.replace(/\/+$/, '').replace(/\/page\/\d+$/i, '');
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/\/+$/, '').replace(/\/page\/\d+$/i, '');
      return p || (filters?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban');
    }
    return filters?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban';
  }, [basePath, filters?.demand]);

  // Query string hiện tại (loại bỏ param `page` vì đã nằm trong path)
  const currentQueryString = useMemo(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      sp.delete('page');
      return sp.toString();
    }
    return '';
  }, [filters]);

  // Tạo URL phân trang chuẩn SEO
  const getPageUrl = (targetPage) => {
    return buildPaginationUrl(activeBasePath, targetPage, currentQueryString);
  };

  // Cuộn mượt lên đầu danh sách tin đăng khi chuyển trang
  const scrollToGridTop = () => {
    if (gridContainerRef.current && typeof window !== 'undefined') {
      const top = gridContainerRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Nhãn phân loại nhu cầu hiển thị trên thanh công cụ
  const demandLabel = useMemo(() => {
    if (filters?.demand === 'rent') return 'bất động sản cho thuê';
    if (filters?.demand === 'sale') return 'bất động sản đang bán';
    return 'bất động sản';
  }, [filters?.demand]);

  // Render Trạng thái rỗng khi không có kết quả phù hợp
  const renderEmptyState = () => (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 my-4">
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
            demand: filters.demand || 'sale',
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
          className="mt-5 px-5 py-2.5 bg-[#e03c31] hover:bg-red-700 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <i className="fa-solid fa-rotate-left mr-2"></i>
          Xóa toàn bộ bộ lọc
        </button>
      )}
    </div>
  );

  // Render Thanh Phân Trang Chuẩn SEO & UX
  const renderPagination = () => {
    if (!enablePagination || totalPages <= 1) return null;
    return (
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Thông tin số lượng tin đang hiển thị */}
        <div className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
          Đang hiển thị <span className="font-bold text-slate-900">{startIndex + 1}</span> - <span className="font-bold text-slate-900">{endIndex}</span> trong tổng số <span className="font-bold text-red-600">{totalItems}</span> bất động sản
        </div>

        {/* Các nút liên kết phân trang chuẩn thẻ <a> HTML cho Crawler & Bot SEO */}
        <nav className="flex items-center gap-1.5 flex-wrap justify-center" aria-label="Phân trang danh mục">
          {/* Nút Về Trang Đầu */}
          {safePage === 1 ? (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-300 opacity-40 cursor-not-allowed shadow-2xs select-none"
              title="Đang ở trang đầu tiên"
            >
              <i className="fa-solid fa-angles-left"></i>
            </span>
          ) : (
            <Link
              href={getPageUrl(1)}
              onClick={scrollToGridTop}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
              title="Về trang đầu tiên"
            >
              <i className="fa-solid fa-angles-left"></i>
            </Link>
          )}

          {/* Nút Trang Trước */}
          {safePage === 1 ? (
            <span
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-300 opacity-40 cursor-not-allowed shadow-2xs select-none"
              title="Đang ở trang đầu"
            >
              <i className="fa-solid fa-angle-left"></i>
              <span className="hidden sm:inline">Trước</span>
            </span>
          ) : (
            <Link
              href={getPageUrl(safePage - 1)}
              onClick={scrollToGridTop}
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
              title="Trang trước"
            >
              <i className="fa-solid fa-angle-left"></i>
              <span className="hidden sm:inline">Trước</span>
            </Link>
          )}

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
            if (isActive) {
              return (
                <span
                  key={`page-${p}`}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition cursor-default bg-[#e03c31] text-white shadow-md shadow-red-600/30 ring-2 ring-red-600/20"
                  aria-current="page"
                >
                  {p}
                </span>
              );
            }
            return (
              <Link
                key={`page-${p}`}
                href={getPageUrl(p)}
                onClick={scrollToGridTop}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                {p}
              </Link>
            );
          })}

          {/* Nút Trang Sau */}
          {safePage === totalPages ? (
            <span
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-300 opacity-40 cursor-not-allowed shadow-2xs select-none"
              title="Đang ở trang cuối"
            >
              <span className="hidden sm:inline">Sau</span>
              <i className="fa-solid fa-angle-right"></i>
            </span>
          ) : (
            <Link
              href={getPageUrl(safePage + 1)}
              onClick={scrollToGridTop}
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
              title="Trang kế tiếp"
            >
              <span className="hidden sm:inline">Sau</span>
              <i className="fa-solid fa-angle-right"></i>
            </Link>
          )}

          {/* Nút Đến Trang Cuối */}
          {safePage === totalPages ? (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-300 opacity-40 cursor-not-allowed shadow-2xs select-none"
              title="Đang ở trang cuối"
            >
              <i className="fa-solid fa-angles-right"></i>
            </span>
          ) : (
            <Link
              href={getPageUrl(totalPages)}
              onClick={scrollToGridTop}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
              title="Đến trang cuối cùng"
            >
              <i className="fa-solid fa-angles-right"></i>
            </Link>
          )}
        </nav>
      </div>
    );
  };

  return (
    <div ref={gridContainerRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className ? className : (isHomePage ? 'pt-2 pb-3' : 'pt-4 sm:pt-6 pb-8')}`}>
      {/* View Controls & Sorting Bar */}
      <div className={`flex ${title || isHomePage ? 'flex-col sm:flex-row items-start sm:items-center' : 'flex-row items-center'} justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-5 border-b border-slate-200`}>
        {title ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        ) : isHomePage ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Danh Sách Bất Động Sản Nổi Bật
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {subtitle || 'Ưu tiên hiển thị tin VIP Kim Cương, VIP Vàng và tin có tương tác cao'}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 shrink-0">
            <span>Hiện có</span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
              {totalItems.toLocaleString('vi-VN')}
            </span>
            <span>{demandLabel}</span>
          </div>
        )}

        {/* Sorting & View Mode Switches */}
        <div className={`flex items-center gap-2 sm:gap-3 ${title || isHomePage ? 'w-full sm:w-auto justify-end' : 'shrink-0'}`}>
          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-slate-500 font-semibold hidden md:inline shrink-0">Sắp xếp:</span>
            <div className="w-[140px] sm:w-[190px]">
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                dropdownClassName="right-0 left-auto min-w-[180px]"
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

          {/* View Mode Toggle Buttons (Ẩn trên mobile vì không tối ưu màn hình hẹp) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
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

      {/* ========================================================
          MAIN CONTENT AREA (HỖ TRỢ 2 CỘT CÓ SIDEBAR BÊN PHẢI CHUẨN BATDONGSAN)
         ======================================================== */}
      {showSidebar ? (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start my-5 sm:my-6">
          {/* CỘT TRÁI: DANH SÁCH BẤT ĐỘNG SẢN CHÍNH (~70% Chiều ngang desktop) */}
          <div className="w-full lg:flex-1 min-w-0">
            {sortedProperties.length === 0 ? (
              renderEmptyState()
            ) : viewMode === 'split' ? (
              /* Split Screen View */
              <div className="space-y-4">
                <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs mb-4">
                  <InteractiveMap properties={displayedProperties} height="400px" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedProperties.map(property => (
                    <ListingCard key={property.id} property={property} viewMode="grid" />
                  ))}
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* List View: Hiển thị thẻ dạng danh sách ngang rộng rãi */
              <div className="space-y-4">
                {displayedProperties.map(property => (
                  <ListingCard key={property.id} property={property} viewMode="list" />
                ))}
              </div>
            ) : (
              /* Grid View: 2 cột chuẩn khi có sidebar bên phải */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {displayedProperties.map(property => (
                  <ListingCard key={property.id} property={property} viewMode="grid" />
                ))}
              </div>
            )}

            {/* Phân trang danh mục chuẩn SEO */}
            {renderPagination()}
          </div>

          {/* CỘT PHẢI: SIDEBAR ĐA NĂNG CHUẨN BATDONGSAN.COM.VN */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
            <ListingSidebar
              demand={filters?.demand || 'sale'}
              filters={filters}
              setFilters={setFilters}
              properties={properties}
              onScrollToTop={scrollToGridTop}
              basePath={basePath}
            />
          </aside>
        </div>
      ) : (
        /* Khi KHÔNG có Sidebar (Chế độ Trang Chủ) */
        <>
          {sortedProperties.length === 0 ? (
            renderEmptyState()
          ) : viewMode === 'split' ? (
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
            <div className="space-y-4 my-6">
              {displayedProperties.map(property => (
                <ListingCard key={property.id} property={property} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
              {displayedProperties.map(property => (
                <ListingCard key={property.id} property={property} viewMode="grid" />
              ))}
            </div>
          )}

          {/* Trang Chủ: Nút xem tất cả BĐS nếu còn tin chưa hiển thị */}
          {isHomePage && sortedProperties.length > homeLimit && (
            <div className="mt-4 mb-0 text-center">
              <Link 
                to={filters?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-red-500 hover:bg-red-50 text-slate-800 hover:text-red-700 font-bold text-xs sm:text-sm shadow-xs transition group cursor-pointer"
              >
                <span>Xem tất cả {sortedProperties.length} bất động sản</span>
                <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition text-red-600"></i>
              </Link>
            </div>
          )}

          {/* Phân trang */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
