'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import HeroSearch from '../components/HeroSearch';
import ListingGrid from '../components/ListingGrid';
import VipPackageShowcase from '../components/VipPackageShowcase';
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

      {/* Fast Navigation Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link 
            to="/nha-dat-ban"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
              <i className="fa-solid fa-house-chimney"></i>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600">Nhà Đất Cần Bán</div>
              <div className="text-[11px] text-slate-500">Căn hộ, nhà phố, đất nền</div>
            </div>
          </Link>

          <Link 
            to="/nha-dat-cho-thue"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
              <i className="fa-solid fa-key"></i>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Cho Thuê Nhà Đất</div>
              <div className="text-[11px] text-slate-500">Thuê căn hộ, văn phòng</div>
            </div>
          </Link>

          <Link 
            to="/dang-tin"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-500 transition flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
              <i className="fa-solid fa-plus-circle"></i>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-red-600">Đăng Tin Hiệu Quả</div>
              <div className="text-[11px] text-slate-500">Phủ sóng sản phẩm, kết nối người mua</div>
            </div>
          </Link>

          <Link 
            to="/bang-gia-vip"
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 transition flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-amber-600">Gói Dịch Vụ Tin VIP</div>
              <div className="text-[11px] text-slate-500">Top 1 tiếp cận khách hàng</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Core Listings Grid & Interactive Map */}

      <ListingGrid 
        properties={properties} 
        filters={filters} 
        setFilters={setFilters}
      />

      {/* VIP Package Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <VipPackageShowcase />
      </div>
    </div>
  );
}
