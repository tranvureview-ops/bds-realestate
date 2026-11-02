'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import HeroSearch from '../components/HeroSearch';
import ListingGrid from '../components/ListingGrid';
import VipPackageShowcase from '../components/VipPackageShowcase';
import HomeCategoryShowcase from '../components/HomeCategoryShowcase';
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

      {/* Core Listings Grid & Interactive Map */}
      <div id="home-listings-section" className="!mt-2 sm:!mt-3 scroll-mt-20">
        <ListingGrid 
          properties={properties} 
          filters={filters} 
          setFilters={setFilters}
          isHomePage={true}
        />
      </div>

      {/* VIP Package Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 !mt-1">
        <VipPackageShowcase className="pt-2 pb-6 bg-transparent" />
      </div>

      {/* SEO On-page Content Section (H2/H3 Heading Tree + Internal Links) */}
      <HomeSeoContent />
    </div>
  );
}
