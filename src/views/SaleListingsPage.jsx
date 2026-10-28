'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import ListingFilterBar from '../components/ListingFilterBar';
import { generateCategoryJsonLd, generateCategoryMetadata, parseTaxonomyUrl, buildDynamicTaxonomyInfo } from '../utils/permalink';
import { filterProperties } from '../utils/propertyFilter';

export default function SaleListingsPage({ taxonomyInfo = null, initialPage = 1 }) {
  const { properties } = useRealEstate();
  const searchParams = useSearchParams();
  const { navigate } = useRouter();

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
    demand: 'sale', // Cố định chuyên trang Nhà Đất Bán
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

  // Đồng bộ khi prop taxonomyInfo thực sự thay đổi từ SSR routing
  useEffect(() => {
    if (!taxonomyInfo) return;
    setFilters(prev => ({
      ...prev,
      city: taxonomyInfo.city || prev.city,
      district: taxonomyInfo.district || prev.district,
      propertyType: taxonomyInfo.propertyType || prev.propertyType,
      priceRange: taxonomyInfo.priceRange || prev.priceRange,
      minPrice: taxonomyInfo.minPrice ? Number(taxonomyInfo.minPrice) : prev.minPrice,
      maxPrice: taxonomyInfo.maxPrice ? Number(taxonomyInfo.maxPrice) : prev.maxPrice,
      areaRange: taxonomyInfo.areaRange || prev.areaRange,
      minArea: taxonomyInfo.minArea ? Number(taxonomyInfo.minArea) : prev.minArea,
      maxArea: taxonomyInfo.maxArea ? Number(taxonomyInfo.maxArea) : prev.maxArea,
    }));
  }, [taxonomyInfo]);

  // Lắng nghe popstate khi người dùng nhấn Back / Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const parsed = parseTaxonomyUrl(window.location.pathname);
      if (parsed?.isTaxonomy) {
        setFilters(prev => ({
          ...prev,
          district: parsed.district || '',
          city: parsed.city || '',
          priceRange: parsed.priceRange || 'all',
          minPrice: parsed.minPrice || null,
          maxPrice: parsed.maxPrice || null,
          areaRange: parsed.areaRange || 'all',
          minArea: parsed.minArea || null,
          maxArea: parsed.maxArea || null,
          propertyType: parsed.propertyType || 'all'
        }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const dynamicTaxonomy = useMemo(() => {
    return buildDynamicTaxonomyInfo(filters, taxonomyInfo);
  }, [filters, taxonomyInfo]);

  // Bơm Schema.org Category/CollectionPage JSON-LD
  useEffect(() => {
    const jsonLdData = generateCategoryJsonLd(
      dynamicTaxonomy,
      properties.filter(p => p.demand === 'sale')
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
  }, [dynamicTaxonomy, properties]);

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
      dynamicTaxonomy,
      2026,
      activePage
    );
  }, [dynamicTaxonomy, activePage]);

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



  const saleCount = useMemo(() => {
    return filterProperties(properties, filters).length;
  }, [properties, filters]);

  return (
    <div className="pb-12">
      {/* Header Banner & Breadcrumbs */}
      <div className="bg-slate-900 text-white py-7 sm:py-8 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-emerald-400 font-medium">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <Link to="/nha-dat-ban" className="hover:text-emerald-400 font-medium">Nhà Đất Cần Bán</Link>
            {dynamicTaxonomy?.title && dynamicTaxonomy.title !== 'Mua Bán Nhà Đất Toàn Quốc' && (
              <>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                <span className="text-white font-bold">{dynamicTaxonomy.title}</span>
              </>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {dynamicTaxonomy?.title || 'Mua Bán Nhà Đất Toàn Quốc'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {categorySeo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Batdongsan-Style Listing Filter Bar */}
      <ListingFilterBar 
        filters={filters} 
        setFilters={setFilters} 
        demand={filters?.demand || "sale"} 
        taxonomyInfo={taxonomyInfo} 
      />



      {/* Main Listing Grid Component */}
      <ListingGrid 
        properties={properties} 
        filters={filters} 
        setFilters={setFilters}
        enablePagination={true}
        initialPage={initialPage}
        basePath={taxonomyInfo?.basePath || (taxonomyInfo?.demand === 'rent' ? '/nha-dat-cho-thue' : '/nha-dat-ban')}
        className="pt-4 sm:pt-5 pb-8"
      />
    </div>
  );
}
