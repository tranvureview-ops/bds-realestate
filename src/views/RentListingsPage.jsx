'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import { generateCategoryJsonLd, generateCategoryMetadata } from '../utils/permalink';
import { filterProperties } from '../utils/propertyFilter';

export default function RentListingsPage({ taxonomyInfo = null, initialPage = 1 }) {
  const { properties } = useRealEstate();
  const searchParams = useSearchParams();

  // Đọc các giá trị bộ lọc đa diện (Faceted Taxonomy parameters) từ URL hoặc Clean Slug taxonomyInfo
  const queryDistrict = searchParams?.get('district') || taxonomyInfo?.district || '';
  const queryCity = searchParams?.get('city') || taxonomyInfo?.city || '';
  const queryType = searchParams?.get('propertyType') || taxonomyInfo?.propertyType || 'all';
  const queryKeyword = searchParams?.get('keyword') || searchParams?.get('q') || taxonomyInfo?.project || taxonomyInfo?.street || (taxonomyInfo?.ward ? taxonomyInfo.ward.replace('Phường ', '') : '') || taxonomyInfo?.keyword || '';
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

  const activePage = useMemo(() => {
    if (initialPage && Number(initialPage) > 0) return Number(initialPage);
    if (taxonomyInfo?.page && Number(taxonomyInfo.page) > 0) return Number(taxonomyInfo.page);
    if (typeof window !== 'undefined') {
      const pageMatch = window.location.pathname.match(/\/page\/(\d+)/i);
      if (pageMatch) {
        const num = parseInt(pageMatch[1], 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return 1;
  }, [initialPage, taxonomyInfo?.page]);

  const categorySeo = useMemo(() => {
    return generateCategoryMetadata(
      taxonomyInfo || {
        demand: 'rent',
        propertyType: queryType !== 'all' ? queryType : null,
        city: queryCity,
        district: queryDistrict,
        page: activePage
      },
      2026,
      activePage
    );
  }, [taxonomyInfo, queryType, queryCity, queryDistrict, activePage]);

  // Cập nhật thẻ Title & Meta Description tối ưu SEO
  useEffect(() => {
    if (categorySeo?.title && typeof document !== 'undefined') {
      document.title = categorySeo.title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', categorySeo.description);
    }
  }, [categorySeo]);

  const rentCount = useMemo(() => {
    return filterProperties(properties, filters).length;
  }, [properties, filters]);

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
                {categorySeo.description}
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

      {/* Main Listing Grid Component */}
      <ListingGrid 
        properties={properties} 
        filters={filters} 
        setFilters={setFilters}
        enablePagination={true}
        initialPage={initialPage}
        basePath={taxonomyInfo?.basePath || (taxonomyInfo?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban')}
      />
    </div>
  );
}
