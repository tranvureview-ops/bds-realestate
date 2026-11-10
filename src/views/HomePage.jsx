'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import HeroSearch from '../components/HeroSearch';
import ListingGrid from '../components/ListingGrid';
import HomeCategoryShowcase from '../components/HomeCategoryShowcase';
import HomeCityShowcase from '../components/HomeCityShowcase';
import HomeSeoContent from '../components/HomeSeoContent';
import { filterProperties } from '../utils/propertyFilter';


export default function HomePage() {
  const { properties } = useRealEstate();

  // Search & Filter state
  const [filters, setFilters] = useState({
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

  const matchingCount = useMemo(() => {
    return filterProperties(properties, filters).length;
  }, [properties, filters]);

  // Kiểm tra xem người dùng có đang chủ động áp dụng tiêu chí lọc nào hay không
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (filters.keyword && filters.keyword.trim()) ||
      (filters.city && filters.city.trim()) ||
      (filters.district && filters.district.trim()) ||
      (filters.ward && filters.ward.trim()) ||
      (filters.street && filters.street.trim()) ||
      (filters.project && filters.project.trim()) ||
      (filters.propertyType && filters.propertyType !== 'all') ||
      (filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0 && !filters.propertyTypes.includes('all')) ||
      (filters.priceRange && filters.priceRange !== 'all') ||
      (filters.areaRange && filters.areaRange !== 'all') ||
      (filters.bedroom && filters.bedroom !== 'all') ||
      (filters.direction && filters.direction !== 'all') ||
      (filters.minPrice && Number(filters.minPrice) > 0) ||
      (filters.maxPrice && Number(filters.maxPrice) > 0) ||
      (filters.minArea && Number(filters.minArea) > 0) ||
      (filters.maxArea && Number(filters.maxArea) > 0) ||
      filters.hasVR360 ||
      filters.onlyVerified
    );
  }, [filters]);

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <HeroSearch 
        filters={filters} 
        setFilters={setFilters} 
        totalResults={matchingCount}
      />

      {/* Danh mục Bất động sản Mua bán & Cho thuê (Phía trên Bất Động Sản Nổi Bật) */}
      <div className="-mt-3 sm:-mt-4">
        <HomeCategoryShowcase />
      </div>

      {/* Khối Kết Quả Tìm Kiếm Theo Bộ Lọc: Tách riêng khi người dùng chọn tiêu chí lọc trên trang chủ */}
      {hasActiveFilters && (
        <div id="home-search-results-section" className="!mt-5 sm:!mt-6 scroll-mt-20">
          <ListingGrid 
            properties={properties} 
            filters={filters} 
            setFilters={setFilters}
            title={`Kết Quả Tìm Kiếm Theo Bộ Lọc (${matchingCount} bất động sản)`}
            subtitle="Danh sách các bất động sản phù hợp với tiêu chí và bộ lọc bạn vừa lựa chọn."
            isHomePage={true}
            limit={8}
            hasSidebar={false}
            centerHeader={true}
            className="pt-0 pb-0"
          />
        </div>
      )}

      {/* Core Listings Grid: Tin Đăng Bất Động Sản Nổi Bật (Luôn giữ cố định 8 tin VIP tiêu biểu nhất, độc lập hoàn toàn với bộ lọc tìm kiếm) */}
      <div id="home-listings-section" className="!mt-5 sm:!mt-6 scroll-mt-20">
        <ListingGrid 
          properties={properties} 
          filters={{}}
          isHomePage={true}
          className="pt-0 pb-0"
        />
      </div>

      {/* Nhà Đất Bán Mới Nhất Trên Toàn Quốc (8 bài viết bán mới nhất) */}
      <div id="home-latest-sales-section" className="!mt-0 scroll-mt-20">
        <ListingGrid 
          properties={properties} 
          filters={{ demand: 'sale' }}
          isHomePage={true}
          showDualViewAllLinks={true}
          title="Nhà Đất Bán Mới Nhất Trên Toàn Quốc"
          subtitle="Cập nhật các tin đăng mua bán nhà đất mới được đăng trên Kênh Nhà Đất 24H tại nhiều tỉnh thành trên cả nước. Danh sách bao gồm căn hộ chung cư, nhà riêng, nhà phố, đất nền, đất thổ cư, biệt thự và nhiều loại hình bất động sản khác. Người mua có thể theo dõi thông tin mới, so sánh giá bán, diện tích và vị trí để tìm kiếm bất động sản phù hợp."
          initialSort="newest"
          limit={8}
          hasSidebar={false}
          enablePagination={false}
          hideViewControls={true}
          centerHeader={true}
          className="pt-0 pb-0"
        />
      </div>

      {/* Tìm Kiếm Bất Động Sản Theo Tỉnh Thành (8 Tỉnh / Thành phố trọng điểm) */}
      <div id="home-cities-section" className="!mt-0 scroll-mt-20">
        <HomeCityShowcase className="pt-0 pb-0" />
      </div>

      {/* SEO On-page Content Section (H2/H3 Heading Tree + Internal Links) */}
      <div id="home-seo-section" className="!mt-8 sm:!mt-10">
        <HomeSeoContent />
      </div>
    </div>
  );
}
