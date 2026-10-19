'use client';

import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function FeaturedCategories() {
  const { properties } = useRealEstate();
  const [activeTab, setActiveTab] = useState('sale'); // 'sale' | 'rent' | 'location' | 'project'

  const activeProps = properties.filter(p => p.status === 'active' && (!p.expiresAt || Date.now() < new Date(p.expiresAt).getTime()));

  // Đếm số lượng tin cho từng danh mục
  const countByType = (demand, type) => activeProps.filter(p => p.demand === demand && p.propertyType === type).length;
  const countByCity = (cityKeyword) => activeProps.filter(p => p.city?.toLowerCase().includes(cityKeyword.toLowerCase())).length;
  const countByDistrict = (distKeyword) => activeProps.filter(p => p.district?.toLowerCase().includes(distKeyword.toLowerCase())).length;

  const saleCategories = [
    {
      title: 'Căn Hộ Chung Cư',
      path: '/ban-can-ho-chung-cu',
      icon: 'fa-solid fa-building',
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Chung cư cao cấp, view đẹp, đầy đủ sổ hồng',
      count: countByType('sale', 'apartment'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-can-ho-chung-cu-ha-noi' },
        { label: 'Cầu Giấy', path: '/ban-can-ho-chung-cu-quan-cau-giay' },
        { label: 'Phường Dịch Vọng', path: '/ban-can-ho-chung-cu-phuong-dich-vong-cau-giay' },
        { label: 'TP.HCM', path: '/ban-can-ho-chung-cu-tp-hcm' }
      ]
    },
    {
      title: 'Nhà Riêng, Nhà Phố',
      path: '/ban-nha-rieng-nha-pho',
      icon: 'fa-solid fa-house',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Nhà thổ cư chính chủ, ngõ ô tô, pháp lý chuẩn',
      count: countByType('sale', 'house'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-nha-rieng-ha-noi' },
        { label: 'Quận Ba Đình', path: '/ban-nha-rieng-quan-ba-dinh' },
        { label: 'Phường Kim Mã', path: '/ban-nha-rieng-phuong-kim-ma-ba-dinh' },
        { label: 'Quận 1 TP.HCM', path: '/ban-nha-rieng-quan-1' }
      ]
    },
    {
      title: 'Đất Nền Dự Án',
      path: '/ban-dat-nen-du-an',
      icon: 'fa-solid fa-mountain-sun',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Đất quy hoạch hạ tầng đồng bộ, sinh lời cao',
      count: countByType('sale', 'land'),
      popularLinks: [
        { label: 'Đà Nẵng', path: '/ban-dat-nen-du-an-da-nang' },
        { label: 'Ngũ Hành Sơn', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
        { label: 'Hải Châu', path: '/ban-dat-nen-du-an-quan-hai-chau' },
        { label: 'Hà Nội', path: '/ban-dat-nen-du-an-ha-noi' }
      ]
    },
    {
      title: 'Nhà Mặt Phố',
      path: '/ban-nha-mat-pho',
      icon: 'fa-solid fa-shop',
      color: 'from-purple-500 to-rose-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Mặt tiền kinh doanh, lưu lượng sầm uất',
      count: countByType('sale', 'street-house'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-nha-mat-pho-ha-noi' },
        { label: 'Quận 1 TP.HCM', path: '/ban-nha-mat-pho-quan-1' },
        { label: 'Đà Nẵng', path: '/ban-nha-mat-pho-da-nang' },
        { label: 'Ba Đình', path: '/ban-nha-mat-pho-quan-ba-dinh' }
      ]
    }
  ];

  const rentCategories = [
    {
      title: 'Cho Thuê Căn Hộ Chung Cư',
      path: '/cho-thue-can-ho-chung-cu',
      icon: 'fa-solid fa-building',
      color: 'from-cyan-500 to-blue-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      description: 'Căn hộ đầy đủ nội thất, dịch vụ trọn gói',
      count: countByType('rent', 'apartment'),
      popularLinks: [
        { label: 'TP.HCM', path: '/cho-thue-can-ho-chung-cu-tp-hcm' },
        { label: 'Quận 1', path: '/cho-thue-can-ho-chung-cu-quan-1' },
        { label: 'Phường Bến Nghé', path: '/cho-thue-can-ho-chung-cu-phuong-ben-nghe-quan-1' },
        { label: 'Hà Nội', path: '/cho-thue-can-ho-chung-cu-ha-noi' }
      ]
    },
    {
      title: 'Cho Thuê Nhà Riêng, Nhà Phố',
      path: '/cho-thue-nha-rieng',
      icon: 'fa-solid fa-house-chimney-window',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Nhà nguyên căn, phù hợp ở gia đình hoặc làm văn phòng',
      count: countByType('rent', 'house'),
      popularLinks: [
        { label: 'Quận 1', path: '/cho-thue-nha-rieng-quan-1' },
        { label: 'Phường Bến Nghé', path: '/cho-thue-nha-rieng-phuong-ben-nghe-quan-1' },
        { label: 'Hà Nội', path: '/cho-thue-nha-rieng-ha-noi' },
        { label: 'Cầu Giấy', path: '/cho-thue-nha-rieng-quan-cau-giay' }
      ]
    },
    {
      title: 'Cho Thuê Nhà Mặt Phố',
      path: '/cho-thue-nha-mat-pho',
      icon: 'fa-solid fa-store',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Vị trí đắc địa kinh doanh, buôn bán sầm uất',
      count: countByType('rent', 'street-house'),
      popularLinks: [
        { label: 'Hà Nội', path: '/cho-thue-nha-mat-pho-ha-noi' },
        { label: 'TP.HCM', path: '/cho-thue-nha-mat-pho-tp-hcm' },
        { label: 'Quận 1', path: '/cho-thue-nha-mat-pho-quan-1' },
        { label: 'Đà Nẵng', path: '/cho-thue-nha-mat-pho-da-nang' }
      ]
    },
    {
      title: 'Cho Thuê Văn Phòng, Mặt Bằng',
      path: '/cho-thue-van-phong',
      icon: 'fa-solid fa-briefcase',
      color: 'from-violet-500 to-purple-600',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      description: 'Mặt sàn văn phòng hạng A-B-C, chuẩn PCCC',
      count: countByType('rent', 'office'),
      popularLinks: [
        { label: 'Hà Nội', path: '/cho-thue-van-phong-ha-noi' },
        { label: 'TP.HCM', path: '/cho-thue-van-phong-tp-hcm' },
        { label: 'Cầu Giấy', path: '/cho-thue-van-phong-quan-cau-giay' },
        { label: 'Quận 1', path: '/cho-thue-van-phong-quan-1' }
      ]
    }
  ];

  const locations = [
    {
      name: 'Hà Nội',
      slug: 'ha-noi',
      badge: 'Thủ Đô',
      image: 'https://images.unsplash.com/photo-1509030450996-93883b2762a0?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Hà Nội'),
      districts: [
        { name: 'Quận Cầu Giấy', path: '/ban-can-ho-chung-cu-quan-cau-giay' },
        { name: 'Phường Dịch Vọng', path: '/ban-can-ho-chung-cu-phuong-dich-vong-cau-giay' },
        { name: 'Quận Ba Đình', path: '/ban-nha-rieng-quan-ba-dinh' },
        { name: 'Phường Kim Mã', path: '/ban-nha-rieng-phuong-kim-ma-ba-dinh' },
        { name: 'Quận Long Biên', path: '/ban-can-ho-chung-cu-quan-long-bien' }
      ]
    },
    {
      name: 'TP. Hồ Chí Minh',
      slug: 'tp-hcm',
      badge: 'Kinh Tế',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Hồ Chí Minh'),
      districts: [
        { name: 'Quận 1 (Trung tâm)', path: '/cho-thue-nha-rieng-quan-1' },
        { name: 'Phường Bến Nghé', path: '/cho-thue-nha-rieng-phuong-ben-nghe-quan-1' },
        { name: 'TP. Thủ Đức', path: '/ban-can-ho-chung-cu-tp-thu-duc' },
        { name: 'Quận Bình Thạnh', path: '/ban-can-ho-chung-cu-quan-binh-thanh' },
        { name: 'Quận Tân Phú', path: '/ban-can-ho-chung-cu-quan-tan-phu' }
      ]
    },
    {
      name: 'Đà Nẵng',
      slug: 'da-nang',
      badge: 'Du Lịch',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Đà Nẵng'),
      districts: [
        { name: 'Quận Hải Châu', path: '/ban-nha-rieng-quan-hai-chau' },
        { name: 'Quận Ngũ Hành Sơn', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
        { name: 'Quận Sơn Trà', path: '/ban-nha-rieng-quan-son-tra' },
        { name: 'Đất Nền Đà Nẵng', path: '/ban-dat-nen-du-an-da-nang' },
        { name: 'Căn Hộ Biển Đà Nẵng', path: '/ban-can-ho-chung-cu-da-nang' }
      ]
    }
  ];

  const featuredProjects = [
    {
      name: 'Dự án Goldmark City',
      location: '136 Hồ Tùng Mậu, Cầu Giấy, Hà Nội',
      path: '/ban-can-ho-chung-cu-du-an-goldmark-city',
      icon: 'fa-solid fa-city',
      tag: 'Căn Hộ Cao Cấp'
    },
    {
      name: 'Dự án Celadon City',
      location: 'Tân Phú, TP. Hồ Chí Minh',
      path: '/ban-can-ho-chung-cu-du-an-celadon-city',
      icon: 'fa-solid fa-tree-city',
      tag: 'Khu Đô Thị Xanh'
    },
    {
      name: 'Căn Hộ Cầu Giấy (2 - 5 Tỷ)',
      location: 'Mức giá tìm kiếm nhiều nhất tại Cầu Giấy',
      path: '/ban-can-ho-chung-cu-quan-cau-giay-gia-tu-2-den-5-ty',
      icon: 'fa-solid fa-tags',
      tag: 'Lọc Theo Giá'
    },
    {
      name: 'Nhà Riêng Ba Đình (50 - 100 m²)',
      location: 'Nhà phố thổ cư diện tích vàng quận Ba Đình',
      path: '/ban-nha-rieng-quan-ba-dinh-dien-tich-50-100-m2',
      icon: 'fa-solid fa-ruler-combined',
      tag: 'Lọc Theo Diện Tích'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <i className="fa-solid fa-sitemap"></i>
            Danh Mục Bất Động Sản Chuẩn SEO
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Khám Phá Theo Nhu Cầu & Địa Lý Trọng Điểm
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sale'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-tag text-emerald-600 text-[11px]"></i>
            Bán BĐS
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rent'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-key text-blue-600 text-[11px]"></i>
            Cho Thuê BĐS
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'location'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-location-dot text-indigo-600 text-[11px]"></i>
            Địa Lý (Hà Nội, TP.HCM, ĐN)
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'project'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-city text-amber-600 text-[11px]"></i>
            Dự Án & Lọc Nhanh
          </button>
        </div>
      </div>

      {/* Tab 1: Danh Mục Nhà Đất Bán */}
      {activeTab === 'sale' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {saleCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition`}>
                    <i className={cat.icon}></i>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                    {cat.count > 0 ? `${cat.count} BĐS` : 'Đang cập nhật'}
                  </span>
                </div>

                <Link to={cat.path} className="block group-hover:text-emerald-600 transition">
                  <h3 className="font-extrabold text-base text-slate-900 mb-1">{cat.title}</h3>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Sub links */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Khu vực nổi bật:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.popularLinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      to={sub.path}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold transition border border-slate-200/60"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Danh Mục Cho Thuê */}
      {activeTab === 'rent' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {rentCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition`}>
                    <i className={cat.icon}></i>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                    {cat.count > 0 ? `${cat.count} BĐS` : 'Đang cập nhật'}
                  </span>
                </div>

                <Link to={cat.path} className="block group-hover:text-blue-600 transition">
                  <h3 className="font-extrabold text-base text-slate-900 mb-1">{cat.title}</h3>
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Sub links */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Khu vực nổi bật:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.popularLinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      to={sub.path}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-semibold transition border border-slate-200/60"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Địa Lý Trọng Điểm (Hà Nội, TP.HCM, Đà Nẵng) */}
      {activeTab === 'location' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-400 transition flex flex-col"
            >
              {/* Image banner */}
              <div className="relative h-36 overflow-hidden group">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white mr-2">
                      {loc.badge}
                    </span>
                    <h3 className="text-lg font-black text-white">{loc.name}</h3>
                  </div>
                  <span className="text-xs text-slate-200 font-semibold bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    {loc.count} Tin đăng
                  </span>
                </div>
              </div>

              {/* District & Ward Links */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Khu vực trọng điểm chuẩn SEO:
                  </div>
                  {loc.districts.map((d, dIdx) => (
                    <Link
                      key={dIdx}
                      to={d.path}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition border border-transparent hover:border-emerald-200 group"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-slate-400 group-hover:text-emerald-600 text-[11px]"></i>
                        <span>{d.name}</span>
                      </span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5"></i>
                    </Link>
                  ))}
                </div>

                <Link
                  to={loc.slug === 'da-nang' ? '/ban-dat-nen-du-an-da-nang' : `/ban-can-ho-chung-cu-${loc.slug}`}
                  className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Xem Tất Cả Nhà Đất {loc.name}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Dự Án Tiêu Biểu & Bộ Lọc Nhanh */}
      {activeTab === 'project' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {featuredProjects.map((proj, idx) => (
            <Link
              key={idx}
              to={proj.path}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg group-hover:scale-110 transition">
                    <i className={proj.icon}></i>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {proj.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition mb-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {proj.location}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>Khám phá ngay</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
