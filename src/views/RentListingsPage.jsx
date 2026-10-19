'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import { generateCategoryJsonLd, formatPriceRangeText, formatAreaRangeText } from '../utils/permalink';

export default function RentListingsPage({ taxonomyInfo = null }) {
  const { properties } = useRealEstate();
  const searchParams = useSearchParams();
  const { navigate } = useRouter();

  // Đọc các giá trị bộ lọc đa diện (Faceted Taxonomy parameters) từ URL hoặc Clean Slug taxonomyInfo
  const queryDistrict = searchParams?.get('district') || taxonomyInfo?.district || '';
  const queryCity = searchParams?.get('city') || taxonomyInfo?.city || '';
  const queryType = searchParams?.get('propertyType') || taxonomyInfo?.propertyType || 'all';
  const queryKeyword = searchParams?.get('keyword') || searchParams?.get('q') || taxonomyInfo?.project || (taxonomyInfo?.ward ? taxonomyInfo.ward.replace('Phường ', '') : '') || taxonomyInfo?.keyword || '';
  const queryPrice = searchParams?.get('priceRange') || searchParams?.get('price') || taxonomyInfo?.priceRange || 'all';
  const queryMinPrice = taxonomyInfo?.minPrice ? Number(taxonomyInfo.minPrice) : (searchParams?.get('minPrice') ? Number(searchParams.get('minPrice')) : null);
  const queryMaxPrice = taxonomyInfo?.maxPrice ? Number(taxonomyInfo.maxPrice) : (searchParams?.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null);
  const queryArea = searchParams?.get('areaRange') || searchParams?.get('area') || taxonomyInfo?.areaRange || 'all';
  const queryMinArea = taxonomyInfo?.minArea ? Number(taxonomyInfo.minArea) : (searchParams?.get('minArea') ? Number(searchParams.get('minArea')) : null);
  const queryMaxArea = taxonomyInfo?.maxArea ? Number(taxonomyInfo.maxArea) : (searchParams?.get('maxArea') ? Number(searchParams.get('maxArea')) : null);
  const queryBedroom = searchParams?.get('bedroom') || taxonomyInfo?.bedroom || 'all';
  const queryVerified = searchParams?.get('onlyVerified') === 'true' || taxonomyInfo?.onlyVerified || false;

  const [filters, setFilters] = useState(() => ({
    keyword: queryKeyword,
    demand: 'rent', // Cố định chuyên trang Cho Thuê
    propertyType: queryType,
    city: queryCity,
    district: queryDistrict,
    priceRange: queryPrice,
    minPrice: queryMinPrice,
    maxPrice: queryMaxPrice,
    areaRange: queryArea,
    minArea: queryMinArea,
    maxArea: queryMaxArea,
    bedroom: queryBedroom,
    direction: 'all',
    hasVR360: false,
    onlyVerified: queryVerified
  }));

  // Cập nhật bộ lọc và SEO Schema khi taxonomy URL hoặc query parameters thay đổi
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      demand: 'rent',
      propertyType: queryType,
      city: queryCity,
      district: queryDistrict,
      keyword: queryKeyword,
      priceRange: queryPrice,
      minPrice: queryMinPrice,
      maxPrice: queryMaxPrice,
      areaRange: queryArea,
      minArea: queryMinArea,
      maxArea: queryMaxArea,
      bedroom: queryBedroom,
      onlyVerified: queryVerified
    }));

    // Bơm Schema.org Category/CollectionPage JSON-LD
    const jsonLdData = generateCategoryJsonLd(
      taxonomyInfo || { 
        demand: 'rent', 
        title: queryDistrict ? `Cho Thuê Nhà Đất tại ${queryDistrict}, ${queryCity || 'Toàn Quốc'}` : 'Cho Thuê Bất Động Sản Toàn Quốc', 
        canonicalUrl: '/nha-dat-cho-thue' 
      },
      properties.filter(p => p.demand === 'rent')
    );

    let scriptTag = document.getElementById('bds-category-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'bds-category-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [taxonomyInfo, queryDistrict, queryCity, queryType, queryKeyword, queryPrice, queryArea, queryVerified, properties]);

  // Kiểm tra có đang áp dụng Faceted Filters nào không
  const hasActiveFacets = Boolean(
    filters.district || 
    (filters.city && !taxonomyInfo?.city) || 
    (filters.propertyType !== 'all' && filters.propertyType !== taxonomyInfo?.propertyType) ||
    filters.keyword || 
    filters.priceRange !== 'all' || 
    filters.areaRange !== 'all' || 
    filters.onlyVerified
  );

  const resetAllFacets = () => {
    setFilters({
      keyword: '',
      demand: 'rent',
      propertyType: taxonomyInfo?.propertyType || 'all',
      city: taxonomyInfo?.city || '',
      district: '',
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
    });
    navigate(taxonomyInfo?.canonicalUrl || '/nha-dat-cho-thue');
  };

  const rentCount = properties.filter(p => p.status === 'active' && p.demand === 'rent' && (!p.expiresAt || Date.now() < new Date(p.expiresAt).getTime())).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Breadcrumbs */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-blue-400 font-medium">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <Link to="/nha-dat-cho-thue" className="hover:text-blue-400 font-medium">Cho Thuê Nhà Đất</Link>
            {taxonomyInfo?.title && (
              <>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                <span className="text-white font-bold">{taxonomyInfo.title}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <span>{taxonomyInfo?.title || 'Cho Thuê Bất Động Sản Toàn Quốc'}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                  {rentCount} BĐS cho thuê
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Tổng hợp căn hộ chung cư cao cấp, phòng trọ, nhà nguyên căn, văn phòng làm việc và mặt bằng kinh doanh cho thuê giá tốt nhất.
              </p>
            </div>

            <Link
              to="/dang-tin"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Đăng Tin Cho Thuê</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Faceted Filters Banner */}
      {hasActiveFacets && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <i className="fa-solid fa-filter text-blue-600"></i>
                Đang lọc theo:
              </span>

              {filters.city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
                  <i className="fa-solid fa-location-dot text-[10px]"></i>
                  {filters.city}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, city: '' }))}
                    className="hover:text-blue-900 ml-0.5"
                    title="Bỏ lọc thành phố"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.district && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold">
                  <i className="fa-solid fa-map-pin text-[10px]"></i>
                  {filters.district}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, district: '' }))}
                    className="hover:text-indigo-900 ml-0.5"
                    title="Bỏ lọc quận huyện"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.propertyType && filters.propertyType !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                  <i className="fa-solid fa-building text-[10px]"></i>
                  {filters.propertyType === 'apartment' ? 'Chung cư' : filters.propertyType === 'house' ? 'Nhà riêng' : filters.propertyType === 'street-house' ? 'Nhà mặt phố' : filters.propertyType === 'villa' ? 'Biệt thự' : filters.propertyType === 'office' ? 'Văn phòng' : filters.propertyType}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, propertyType: 'all' }))}
                    className="hover:text-emerald-900 ml-0.5"
                    title="Bỏ lọc loại hình"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.keyword && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                  <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
                  "{filters.keyword}"
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, keyword: '' }))}
                    className="hover:text-amber-900 ml-0.5"
                    title="Bỏ lọc từ khóa"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.priceRange && filters.priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold">
                  <i className="fa-solid fa-tag text-[10px]"></i>
                  Khoảng giá: {formatPriceRangeText(filters.priceRange, taxonomyInfo?.priceLabel)}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: 'all', minPrice: null, maxPrice: null }))}
                    className="hover:text-rose-900 ml-0.5"
                    title="Bỏ lọc giá"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.areaRange && filters.areaRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                  <i className="fa-solid fa-ruler-combined text-[10px]"></i>
                  Diện tích: {formatAreaRangeText(filters.areaRange, taxonomyInfo?.areaLabel)}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, areaRange: 'all', minArea: null, maxArea: null }))}
                    className="hover:text-amber-900 ml-0.5"
                    title="Bỏ lọc diện tích"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.onlyVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-bold">
                  <i className="fa-solid fa-certificate text-[10px]"></i>
                  Chính chủ / Đã xác thực
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, onlyVerified: false }))}
                    className="hover:text-teal-900 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={resetAllFacets}
              className="text-slate-500 hover:text-rose-600 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Xóa toàn bộ lọc</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Listing Grid Component */}
      <ListingGrid 
        properties={properties} 
        filters={filters} 
        setFilters={setFilters}
      />
    </div>
  );
}
