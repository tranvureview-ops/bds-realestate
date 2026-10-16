'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import { generateCategoryJsonLd } from '../utils/permalink';

export default function RentListingsPage({ taxonomyInfo = null }) {
  const { properties } = useRealEstate();

  const [filters, setFilters] = useState(() => ({
    keyword: '',
    demand: 'rent', // Cố định chuyên trang Cho Thuê
    propertyType: taxonomyInfo?.propertyType || 'all',
    city: taxonomyInfo?.city || '',
    district: '',
    priceRange: 'all',
    areaRange: 'all',
    bedroom: 'all',
    direction: 'all',
    hasVR360: false,
    onlyVerified: false
  }));

  // Cập nhật bộ lọc và SEO Schema khi taxonomy URL thay đổi
  useEffect(() => {
    if (taxonomyInfo) {
      setFilters(prev => ({
        ...prev,
        demand: 'rent',
        propertyType: taxonomyInfo.propertyType || 'all',
        city: taxonomyInfo.city || ''
      }));
    }

    // Bơm Schema.org Category/CollectionPage JSON-LD
    const jsonLdData = generateCategoryJsonLd(
      taxonomyInfo || { demand: 'rent', title: 'Cho Thuê Bất Động Sản Toàn Quốc', canonicalUrl: '/nha-dat-cho-thue' },
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
  }, [taxonomyInfo, properties]);

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

      {/* Main Listing Grid Component */}
      <ListingGrid 
        properties={properties} 
        filters={filters} 
        setFilters={setFilters}
      />
    </div>
  );
}
