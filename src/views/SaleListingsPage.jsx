'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import ListingGrid from '../components/ListingGrid';
import { generateCategoryJsonLd } from '../utils/permalink';

export default function SaleListingsPage({ taxonomyInfo = null }) {
  const { properties } = useRealEstate();

  const [filters, setFilters] = useState(() => ({
    keyword: '',
    demand: 'sale', // Cố định chuyên trang Nhà Đất Bán
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
        demand: 'sale',
        propertyType: taxonomyInfo.propertyType || 'all',
        city: taxonomyInfo.city || ''
      }));
    }

    // Bơm Schema.org Category/CollectionPage JSON-LD
    const jsonLdData = generateCategoryJsonLd(
      taxonomyInfo || { demand: 'sale', title: 'Mua Bán Nhà Đất Toàn Quốc', canonicalUrl: '/nha-dat-ban' },
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
  }, [taxonomyInfo, properties]);

  const saleCount = properties.filter(p => p.status === 'active' && p.demand === 'sale' && (!p.expiresAt || Date.now() < new Date(p.expiresAt).getTime())).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Breadcrumbs */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-emerald-400 font-medium">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <Link to="/nha-dat-ban" className="hover:text-emerald-400 font-medium">Nhà Đất Cần Bán</Link>
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
                <span>{taxonomyInfo?.title || 'Mua Bán Nhà Đất Toàn Quốc'}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {saleCount} BĐS đang bán
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Cập nhật liên tục tin đăng bán căn hộ chung cư, nhà phố, biệt thự liền kề, đất nền dự án chính chủ với pháp lý sổ hồng minh bạch 100%.
              </p>
            </div>

            <Link
              to="/dang-tin"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Đăng Tin Bán Nhà</span>
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
