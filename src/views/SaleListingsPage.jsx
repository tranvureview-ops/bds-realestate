'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import ListingFilterBar from '../components/ListingFilterBar';
import SaleListingsSeoContent from '../components/SaleListingsSeoContent';
import { generateCategoryJsonLd, generateCategoryMetadata, getCanonicalUrl, parseTaxonomyUrl, buildDynamicTaxonomyInfo, buildSeoUrl, formatSentenceCase } from '../utils/permalink';
import { filterProperties } from '../utils/propertyFilter';
import { parseCIdsParam } from '../data/propertyTypeTaxonomy';

export default function SaleListingsPage({ taxonomyInfo = null, initialPage = 1, serverSearchParams = null }) {
  const { properties } = useRealEstate();
  const searchParams = useSearchParams();
  const { navigate } = useRouter();

  // Đọc các giá trị bộ lọc đa diện (Faceted Taxonomy parameters) từ URL hoặc Clean Slug taxonomyInfo
  const queryDistrict = serverSearchParams?.district || searchParams?.get('district') || taxonomyInfo?.district || '';
  const queryCity = serverSearchParams?.city || searchParams?.get('city') || taxonomyInfo?.city || '';
  const queryWard = serverSearchParams?.ward || searchParams?.get('ward') || taxonomyInfo?.ward || '';
  const queryStreet = serverSearchParams?.street || searchParams?.get('street') || taxonomyInfo?.street || '';
  const queryProject = serverSearchParams?.project || searchParams?.get('project') || taxonomyInfo?.project || '';
  const queryType = serverSearchParams?.propertyType || searchParams?.get('propertyType') || taxonomyInfo?.propertyType || 'all';

  // Đọc ?loai= (đa danh mục): ví dụ ?loai=mini-apartment (kết hợp với primary category từ slug)
  const clientUrlLoai = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('loai')
    : null;
  const queryLoai = serverSearchParams?.loai || searchParams?.get('loai') || clientUrlLoai || '';
  const queryLoaiTypes = queryLoai ? parseCIdsParam(queryLoai, 'sale') : null;

  // Hợp nhất category chính từ slug/queryType với danh mục phụ từ ?loai=
  const baseCategory = (queryType && queryType !== 'all')
    ? queryType
    : (taxonomyInfo?.propertyType && taxonomyInfo.propertyType !== 'all' ? taxonomyInfo.propertyType : null);

  const initialCombinedTypes = [];
  if (baseCategory) initialCombinedTypes.push(baseCategory);
  if (queryLoaiTypes && queryLoaiTypes.length > 0) {
    queryLoaiTypes.forEach(t => {
      if (t && t !== 'all' && !initialCombinedTypes.includes(t)) {
        initialCombinedTypes.push(t);
      }
    });
  }

  const initPropertyTypes = initialCombinedTypes.length > 0 ? initialCombinedTypes : ['all'];
  const initPropertyType = initPropertyTypes.includes('all') ? 'all' : initPropertyTypes[0];
  const queryKeyword = serverSearchParams?.keyword || serverSearchParams?.q || searchParams?.get('keyword') || searchParams?.get('q') || taxonomyInfo?.keyword || '';
  const queryPrice = serverSearchParams?.priceRange || serverSearchParams?.price || searchParams?.get('priceRange') || searchParams?.get('price') || taxonomyInfo?.priceRange || 'all';
  const queryMinPrice = taxonomyInfo?.minPrice ? Number(taxonomyInfo.minPrice) : ((serverSearchParams?.minPrice || searchParams?.get('minPrice')) ? Number(serverSearchParams?.minPrice || searchParams?.get('minPrice')) : null);
  const queryMaxPrice = taxonomyInfo?.maxPrice ? Number(taxonomyInfo.maxPrice) : ((serverSearchParams?.maxPrice || searchParams?.get('maxPrice')) ? Number(serverSearchParams?.maxPrice || searchParams?.get('maxPrice')) : null);
  const queryArea = serverSearchParams?.areaRange || serverSearchParams?.area || searchParams?.get('areaRange') || searchParams?.get('area') || taxonomyInfo?.areaRange || 'all';
  const queryMinArea = taxonomyInfo?.minArea ? Number(taxonomyInfo.minArea) : ((serverSearchParams?.minArea || searchParams?.get('minArea')) ? Number(serverSearchParams?.minArea || searchParams?.get('minArea')) : null);
  const queryMaxArea = taxonomyInfo?.maxArea ? Number(taxonomyInfo.maxArea) : ((serverSearchParams?.maxArea || searchParams?.get('maxArea')) ? Number(serverSearchParams?.maxArea || searchParams?.get('maxArea')) : null);
  const queryBedroom = serverSearchParams?.bedroom || searchParams?.get('bedroom') || taxonomyInfo?.bedroom || 'all';
  const queryVerified = (serverSearchParams?.onlyVerified === 'true' || searchParams?.get('onlyVerified') === 'true') || taxonomyInfo?.onlyVerified || false;

  const [filters, setFilters] = useState(() => ({
    keyword: queryKeyword,
    demand: 'sale', // Cố định chuyên trang Nhà Đất Bán
    propertyType: initPropertyType,
    propertyTypes: initPropertyTypes,
    city: queryCity,
    district: queryDistrict,
    ward: queryWard,
    street: queryStreet,
    project: queryProject,
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

  // Đồng bộ khi prop taxonomyInfo hoặc searchParams thay đổi
  useEffect(() => {
    if (!taxonomyInfo) return;
    const taxType = taxonomyInfo.propertyType || 'all';
    const currentLoai = serverSearchParams?.loai || searchParams?.get('loai') || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('loai') : '') || '';
    const currentLoaiTypes = currentLoai ? parseCIdsParam(currentLoai, 'sale') : null;

    setFilters(prev => {
      const currentBaseType = (taxType && taxType !== 'all') ? taxType : null;
      let nextTypes = [];
      if (currentBaseType) nextTypes.push(currentBaseType);
      if (currentLoaiTypes && currentLoaiTypes.length > 0) {
        currentLoaiTypes.forEach(t => {
          if (t && t !== 'all' && !nextTypes.includes(t)) {
            nextTypes.push(t);
          }
        });
      }
      if (nextTypes.length === 0) {
        nextTypes = prev.propertyTypes && prev.propertyTypes.length > 0 ? prev.propertyTypes : ['all'];
      }
      const nextType = nextTypes.includes('all') ? 'all' : nextTypes[0];

      const nextCity = taxonomyInfo.city || prev.city;
      const nextDistrict = taxonomyInfo.district || prev.district;
      const nextWard = taxonomyInfo.ward !== undefined ? taxonomyInfo.ward : prev.ward;
      const nextStreet = taxonomyInfo.street !== undefined ? taxonomyInfo.street : prev.street;
      const nextProject = taxonomyInfo.project !== undefined ? taxonomyInfo.project : prev.project;
      const nextPriceRange = taxonomyInfo.priceRange || prev.priceRange;
      const nextAreaRange = taxonomyInfo.areaRange || prev.areaRange;
      const nextBedroom = taxonomyInfo.bedroom || prev.bedroom;

      const typesEqual = prev.propertyTypes?.length === nextTypes.length &&
        prev.propertyTypes.every((t, i) => t === nextTypes[i]);

      if (
        prev.propertyType === nextType &&
        typesEqual &&
        prev.city === nextCity &&
        prev.district === nextDistrict &&
        prev.ward === nextWard &&
        prev.street === nextStreet &&
        prev.project === nextProject &&
        prev.priceRange === nextPriceRange &&
        prev.areaRange === nextAreaRange &&
        prev.bedroom === nextBedroom
      ) {
        return prev;
      }

      return {
        ...prev,
        city: nextCity,
        district: nextDistrict,
        ward: nextWard,
        street: nextStreet,
        project: nextProject,
        propertyType: nextType,
        propertyTypes: nextTypes,
        priceRange: nextPriceRange,
        minPrice: taxonomyInfo.minPrice ? Number(taxonomyInfo.minPrice) : prev.minPrice,
        maxPrice: taxonomyInfo.maxPrice ? Number(taxonomyInfo.maxPrice) : prev.maxPrice,
        areaRange: nextAreaRange,
        minArea: taxonomyInfo.minArea ? Number(taxonomyInfo.minArea) : prev.minArea,
        maxArea: taxonomyInfo.maxArea ? Number(taxonomyInfo.maxArea) : prev.maxArea,
        bedroom: nextBedroom,
      };
    });
  }, [taxonomyInfo?.canonicalUrl, taxonomyInfo?.propertyType, serverSearchParams?.loai]);

  // Lắng nghe sự kiện bds:reset-category-filters khi người dùng click vào menu Nhà Đất Bán khi đang ở chính trang này
  useEffect(() => {
    const handleResetEvent = (e) => {
      const resetPath = e.detail?.path || '';
      if (resetPath === '/nha-dat-ban' || resetPath.startsWith('/nha-dat-ban')) {
        setFilters({
          keyword: '',
          demand: 'sale',
          propertyType: 'all',
          propertyTypes: ['all'],
          city: '',
          district: '',
          ward: '',
          street: '',
          project: '',
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
        setCurrentPage(1);
        if (typeof window !== 'undefined' && window.location.search) {
          window.history.replaceState(null, '', '/nha-dat-ban');
        }
      }
    };
    window.addEventListener('bds:reset-category-filters', handleResetEvent);
    return () => window.removeEventListener('bds:reset-category-filters', handleResetEvent);
  }, []);

  // Tự động reset bộ lọc khi điều hướng từ trang danh mục khác về trang gốc /nha-dat-ban
  const prevCanonicalRef = useRef(taxonomyInfo?.canonicalUrl);
  useEffect(() => {
    const prevCanonical = prevCanonicalRef.current;
    prevCanonicalRef.current = taxonomyInfo?.canonicalUrl;

    if (prevCanonical && prevCanonical !== taxonomyInfo?.canonicalUrl) {
      const isRootSale = taxonomyInfo?.canonicalUrl?.endsWith('/nha-dat-ban') && !taxonomyInfo?.city && (!taxonomyInfo?.propertyType || taxonomyInfo?.propertyType === 'all');
      if (isRootSale) {
        setFilters({
          keyword: '',
          demand: 'sale',
          propertyType: 'all',
          propertyTypes: ['all'],
          city: '',
          district: '',
          ward: '',
          street: '',
          project: '',
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
        setCurrentPage(1);
      }
    }
  }, [taxonomyInfo?.canonicalUrl]);

  // Lắng nghe popstate khi người dùng nhấn Back / Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const parsed = parseTaxonomyUrl(window.location.pathname);
      if (parsed?.isTaxonomy) {
        // Đọc ?loai= từ URL hiện tại sau popstate
        const sp = new URLSearchParams(window.location.search);
        const popLoai = sp.get('loai') || '';
        const popLoaiTypes = popLoai ? parseCIdsParam(popLoai, 'sale') : null;
        const popBaseType = (parsed.propertyType && parsed.propertyType !== 'all') ? parsed.propertyType : null;
        const popCombined = [];
        if (popBaseType) popCombined.push(popBaseType);
        if (popLoaiTypes && popLoaiTypes.length > 0) {
          popLoaiTypes.forEach(t => {
            if (t && t !== 'all' && !popCombined.includes(t)) {
              popCombined.push(t);
            }
          });
        }
        const popTypes = popCombined.length > 0 ? popCombined : ['all'];
        const popType = popTypes.includes('all') ? 'all' : popTypes[0];

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
          bedroom: parsed.bedroom || 'all',
          propertyType: popType,
          propertyTypes: popTypes
        }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Tự động đồng bộ Clean URL chuẩn SEO (PushState) CHỈ khi người dùng THỰC SỰ thay đổi bộ lọc
  const prevFiltersRef = useRef(filters);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevFiltersRef.current = filters;
      return;
    }

    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;

    if (!prev) return;
    const hasFilterChanged = 
      prev.demand !== filters.demand ||
      prev.propertyType !== filters.propertyType ||
      prev.city !== filters.city ||
      prev.district !== filters.district ||
      prev.ward !== filters.ward ||
      prev.project !== filters.project ||
      prev.priceRange !== filters.priceRange ||
      prev.minPrice !== filters.minPrice ||
      prev.maxPrice !== filters.maxPrice ||
      prev.areaRange !== filters.areaRange ||
      prev.minArea !== filters.minArea ||
      prev.maxArea !== filters.maxArea ||
      prev.bedroom !== filters.bedroom ||
      prev.direction !== filters.direction ||
      prev.onlyVerified !== filters.onlyVerified ||
      prev.hasVR360 !== filters.hasVR360 ||
      prev.keyword !== filters.keyword ||
      JSON.stringify(prev.propertyTypes || []) !== JSON.stringify(filters.propertyTypes || []);

    // Nếu bộ lọc không thay đổi (ví dụ người dùng chỉ tải trang, refresh trang /p4, /p6 hoặc ấn phân trang) -> TUYỆT ĐỐI KHÔNG can thiệp URL
    if (!hasFilterChanged) {
      return;
    }

    try {
      if (typeof window === 'undefined') return;
      // Khi người dùng đổi bộ lọc mới, reset trang hiện tại về 1
      setCurrentPage(1);

      // Xử lý đa danh mục: propertyTypes (mảng) ưu tiên hơn propertyType (đơn)
      // type đầu tiên → slug chính, các type còn lại → ?loai=apartment,mini-apartment
      const multiTypes = filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0 && !filters.propertyTypes.includes('all')
        ? filters.propertyTypes
        : null;
      const singleType = filters.propertyType && filters.propertyType !== 'all' ? filters.propertyType : null;

      const isSwitchingDemand = filters.demand && filters.demand !== 'sale';
      const targetUrl = buildSeoUrl({
        demand: isSwitchingDemand ? filters.demand : 'sale',
        propertyType: multiTypes ? null : singleType,
        propertyTypes: multiTypes,
        city: filters.city || null,
        district: filters.district || null,
        ward: filters.ward || null,
        project: filters.project || null,
        priceRange: filters.priceRange && filters.priceRange !== 'all' ? filters.priceRange : null,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        areaRange: filters.areaRange && filters.areaRange !== 'all' ? filters.areaRange : null,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        bedroom: filters.bedroom && filters.bedroom !== 'all' ? filters.bedroom : null,
        extraParams: {
          ...(filters.keyword ? { keyword: filters.keyword } : {}),
          ...(filters.onlyVerified ? { onlyVerified: 'true' } : {}),
          ...(filters.hasVR360 ? { hasVR360: 'true' } : {}),
          ...(filters.direction && filters.direction !== 'all' ? { direction: filters.direction } : {})
        }
      });

      if (isSwitchingDemand && targetUrl) {
        navigate(targetUrl);
        return;
      }

      if (targetUrl) {
        const currentUrl = window.location.pathname + (window.location.search || '');
        const normalize = (u) => decodeURIComponent(u).replace(/\/+(\?|$)/, '$1').replace(/\/(?:page\/\d+|p\d+)(?=[/?#]|$)/i, '');
        if (normalize(currentUrl) !== normalize(targetUrl)) {
          window.history.pushState(null, '', targetUrl);
        }
      }
    } catch {
      // Bỏ qua nếu môi trường bị giới hạn
    }
  }, [filters]);

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

  // Quản lý trang phân tầng activePage đồng bộ client & server
  const [currentPage, setCurrentPage] = useState(() => {
    if (initialPage && Number(initialPage) > 0) return Number(initialPage);
    if (taxonomyInfo?.page && Number(taxonomyInfo.page) > 0) return Number(taxonomyInfo.page);
    if (typeof window !== 'undefined') {
      const pageMatch = window.location.pathname.match(/\/(?:page\/|p)(\d+)/i);
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

  useEffect(() => {
    if (initialPage && Number(initialPage) > 0) {
      setCurrentPage(Number(initialPage));
    }
  }, [initialPage]);

  useEffect(() => {
    const handlePopState = () => {
      const pageMatch = window.location.pathname.match(/\/(?:page\/|p)(\d+)/i);
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

  const activePage = currentPage;

  // Đường dẫn danh mục SEO hiện tại (tự động thích ứng khi người dùng lọc loại hình, khu vực, giá, diện tích, phòng ngủ...)
  const currentCategoryBasePath = useMemo(() => {
    try {
      const multiTypes = filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0 && !filters.propertyTypes.includes('all')
        ? filters.propertyTypes
        : null;
      const singleType = filters.propertyType && filters.propertyType !== 'all' ? filters.propertyType : null;

      const targetUrl = buildSeoUrl({
        demand: 'sale',
        propertyType: multiTypes ? null : singleType,
        propertyTypes: multiTypes,
        city: filters.city || null,
        district: filters.district || null,
        ward: filters.ward || null,
        project: filters.project || null,
        priceRange: filters.priceRange && filters.priceRange !== 'all' ? filters.priceRange : null,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        areaRange: filters.areaRange && filters.areaRange !== 'all' ? filters.areaRange : null,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        bedroom: filters.bedroom && filters.bedroom !== 'all' ? filters.bedroom : null
      });

      if (targetUrl) {
        const [cleanPath] = targetUrl.split('?');
        if (cleanPath && cleanPath !== '/') return cleanPath;
      }
    } catch {}
    return taxonomyInfo?.basePath || '/nha-dat-ban';
  }, [filters, taxonomyInfo?.basePath]);

  // Taxonomy sạch chuẩn SEO đồng bộ theo cleanPath hiện tại (chứa danh mục, địa điểm, giá, diện tích, phòng ngủ; KHÔNG bị ô nhiễm bởi tham số query như ?loai=...)
  const currentCleanTaxonomy = useMemo(() => {
    if (currentCategoryBasePath) {
      const parsed = parseTaxonomyUrl(currentCategoryBasePath);
      if (parsed && parsed.isTaxonomy) {
        return parsed;
      }
    }
    return dynamicTaxonomy;
  }, [currentCategoryBasePath, dynamicTaxonomy]);

  const categorySeo = useMemo(() => {
    return generateCategoryMetadata(
      currentCleanTaxonomy,
      2026,
      activePage
    );
  }, [currentCleanTaxonomy, activePage]);

  // Cập nhật thẻ Title, Meta Description, Canonical & OpenGraph tối ưu SEO On-Page
  useEffect(() => {
    if (categorySeo?.title && typeof document !== 'undefined') {
      document.title = categorySeo.title;

      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', categorySeo.description);

      // Cập nhật thẻ Canonical URL chuẩn xác
      const currentBasePath = currentCleanTaxonomy?.canonicalPath || currentCleanTaxonomy?.basePath || '/nha-dat-ban';
      const canonicalUrl = getCanonicalUrl(currentBasePath, activePage);
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);

      // Cập nhật Open Graph Tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', categorySeo.title);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', categorySeo.description);

      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
    }
  }, [categorySeo, activePage, currentCleanTaxonomy]);

  const saleCount = useMemo(() => {
    return filterProperties(properties, filters).length;
  }, [properties, filters]);

  const displayTitle = useMemo(() => {
    // Tiêu đề Breadcrumb luôn lấy từ currentCleanTaxonomy chuẩn SEO (bảo toàn danh mục chuẩn + bộ lọc sạch, không bị ghép query thừa ?loai=...)
    const baseTitle = currentCleanTaxonomy?.title || 'Mua Bán Nhà Đất';
    let titleWithLoc = baseTitle;
    if (currentCleanTaxonomy?.city) {
      titleWithLoc = baseTitle.includes(currentCleanTaxonomy.city) ? baseTitle : `${baseTitle} tại ${currentCleanTaxonomy.city}`;
    } else if (!baseTitle.toLowerCase().includes('toàn quốc')) {
      titleWithLoc = `${baseTitle} trên toàn quốc`;
    }
    const trimmed = titleWithLoc.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
  }, [currentCleanTaxonomy]);

  // Tiêu đề H1 chuyên nghiệp chuẩn SEO & Tối ưu chuyển đổi (CRO) theo Phương án 1
  const h1Title = useMemo(() => {
    const isGeneralListing = !currentCleanTaxonomy?.propertyType || currentCleanTaxonomy.propertyType === 'all';
    if (isGeneralListing) {
      const locParts = [];
      if (currentCleanTaxonomy?.ward) locParts.push(currentCleanTaxonomy.ward);
      if (currentCleanTaxonomy?.district) locParts.push(currentCleanTaxonomy.district);
      if (currentCleanTaxonomy?.city) locParts.push(currentCleanTaxonomy.city);
      const locStr = locParts.join(', ');

      if (locStr) {
        return `Mua Bán Nhà Đất tại ${locStr} Năm 2026: Sổ Đỏ Chính Chủ, Giá Tốt Nhất`;
      }
      return 'Mua Bán Nhà Đất Toàn Quốc Năm 2026: Sổ Đỏ Chính Chủ, Giá Tốt Nhất';
    }
    return displayTitle;
  }, [currentCleanTaxonomy, displayTitle]);

  return (
    <div className="pb-2 sm:pb-4">
      {/* Header Banner & Breadcrumbs */}
      <div className="bg-slate-900 text-white py-7 sm:py-8 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-emerald-400 font-medium">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <Link to="/nha-dat-ban" className="hover:text-emerald-400 font-medium">Bán</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span className="text-white font-bold">
              {displayTitle}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {h1Title}
              {activePage > 1 && (
                <span className="text-emerald-400 font-semibold text-lg sm:text-xl ml-2">
                  - Trang {activePage}
                </span>
              )}
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
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        initialPage={initialPage}
        basePath={currentCategoryBasePath}
        className="pt-4 sm:pt-5 pb-2 sm:pb-3"
      />

      {/* Khối Nội Dung On-Page SEO & Cẩm Nang Mua Bán Nhà Đất Chuyên Sâu Đồng Bộ Tùy Thành Phố */}
      <SaleListingsSeoContent 
        city={currentCleanTaxonomy?.city} 
        district={currentCleanTaxonomy?.district} 
        propertyType={currentCleanTaxonomy?.propertyType} 
        taxonomyInfo={currentCleanTaxonomy} 
      />
    </div>
  );
}
