'use client';

import React, { useState } from 'react';
import { Link } from '../router/RouterContext';

const SALE_CATEGORIES = [
  { title: 'Căn hộ chung cư', path: '/ban-can-ho-chung-cu', icon: 'fa-regular fa-building', countLabel: 'Chung cư cao cấp, giá tốt' },
  { title: 'Chung cư mini', path: '/ban-chung-cu-mini', icon: 'fa-solid fa-city', countLabel: 'Căn hộ dịch vụ, studio' },
  { title: 'Nhà riêng, nhà phố', path: '/ban-nha-rieng', icon: 'fa-solid fa-house', countLabel: 'Sổ hồng riêng chính chủ' },
  { title: 'Nhà biệt thự, liền kề', path: '/ban-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark', countLabel: 'Khu đô thị, nghỉ dưỡng' },
  { title: 'Nhà mặt phố', path: '/ban-nha-mat-pho', icon: 'fa-solid fa-shop', countLabel: 'Kinh doanh sầm uất' },
  { title: 'Shophouse', path: '/ban-shophouse', icon: 'fa-solid fa-store', countLabel: 'Nhà phố thương mại' },
  { title: 'Đất nền dự án', path: '/ban-dat-nen-du-an', icon: 'fa-solid fa-mountain-sun', countLabel: 'Quy hoạch 1/500 hoàn thiện' },
  { title: 'Đất thổ cư', path: '/ban-dat', icon: 'fa-solid fa-map', countLabel: 'Đất ở xây dựng ngay' },
  { title: 'Trang trại, nghỉ dưỡng', path: '/ban-trang-trai-khu-nghi-duong', icon: 'fa-solid fa-tree', countLabel: 'Nhà vườn, sinh thái' },
  { title: 'Condotel', path: '/ban-condotel', icon: 'fa-solid fa-hotel', countLabel: 'Căn hộ khách sạn biển' },
  { title: 'Kho, nhà xưởng', path: '/ban-kho-nha-xuong', icon: 'fa-solid fa-warehouse', countLabel: 'Mặt bằng sản xuất' },
  { title: 'BĐS khác', path: '/ban-bat-dong-san-khac', icon: 'fa-solid fa-shapes', countLabel: 'Mặt bằng kinh doanh khác' }
];

const RENT_CATEGORIES = [
  { title: 'Thuê căn hộ chung cư', path: '/cho-thue-can-ho-chung-cu', icon: 'fa-regular fa-building', countLabel: 'Full nội thất, ở ngay' },
  { title: 'Thuê chung cư mini', path: '/cho-thue-chung-cu-mini', icon: 'fa-solid fa-city', countLabel: 'Giá rẻ, tiện nghi' },
  { title: 'Thuê nhà riêng', path: '/cho-thue-nha-rieng', icon: 'fa-solid fa-house', countLabel: 'Nguyên căn cho gia đình' },
  { title: 'Thuê biệt thự, liền kề', path: '/cho-thue-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark', countLabel: 'Cao cấp, an ninh 24/7' },
  { title: 'Thuê nhà mặt phố', path: '/cho-thue-nha-mat-pho', icon: 'fa-solid fa-shop', countLabel: 'Vị trí đắc địa kinh doanh' },
  { title: 'Thuê shophouse', path: '/cho-thue-shophouse', icon: 'fa-solid fa-store', countLabel: 'Vừa ở vừa kinh doanh' },
  { title: 'Thuê văn phòng', path: '/cho-thue-van-phong', icon: 'fa-solid fa-briefcase', countLabel: 'Tòa nhà văn phòng hiện đại' },
  { title: 'Thuê mặt bằng bán lẻ', path: '/cho-thue-mat-bang-cua-hang', icon: 'fa-solid fa-store', countLabel: 'Cửa hàng, showroom' },
  { title: 'Thuê phòng trọ, nhà trọ', path: '/cho-thue-nha-tro-phong-tro', icon: 'fa-solid fa-door-open', countLabel: 'Phòng trọ sinh viên, công nhân' },
  { title: 'Thuê kho, nhà xưởng', path: '/cho-thue-kho-nha-xuong', icon: 'fa-solid fa-warehouse', countLabel: 'Xe công ra vào thuận tiện' }
];

export default function HomeCategoryShowcase() {
  const [tab, setTab] = useState('sale');

  const categories = tab === 'sale' ? SALE_CATEGORIES : RENT_CATEGORIES;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-2">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        {/* Header với Tabs Mua Bán / Cho Thuê */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              Khám Phá Danh Mục Bất Động Sản
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tra cứu nhanh theo loại hình mua bán và cho thuê trên toàn quốc
            </p>
          </div>

          {/* Switch tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/70">
            <button
              type="button"
              onClick={() => setTab('sale')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'sale'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-house-chimney mr-1.5"></i>
              Bất Động Sản Bán
            </button>
            <button
              type="button"
              onClick={() => setTab('rent')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'rent'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-key mr-1.5"></i>
              Cho Thuê Nhà Đất
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-4">
          {categories.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-red-400 hover:shadow-sm transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-base mb-2 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-all">
                <i className={item.icon}></i>
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {item.countLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
