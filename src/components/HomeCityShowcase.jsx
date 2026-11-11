'use client';

import React, { useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { buildSeoUrl } from '../utils/permalink';

const FALLBACK_CITY_IMAGE = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

const FEATURED_CITIES = [
  {
    name: 'TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
    tag: 'SÔI ĐỘNG NHẤT',
    status: '24,600+ Tin mua bán & cho thuê',
    alt: 'Bất động sản TP. Hồ Chí Minh - Kênh Nhà Đất 24H',
    tagColor: 'bg-red-500/90 text-white'
  },
  {
    name: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    tag: 'THỦ ĐÔ',
    status: '18,250+ Tin đăng chính chủ',
    alt: 'Mua bán nhà đất Hà Nội - Kênh Nhà Đất 24H',
    tagColor: 'bg-amber-500/90 text-white'
  },
  {
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
    tag: 'ĐÁNG SỐNG',
    status: '8,700+ BĐS vị trí đẹp',
    alt: 'Bất động sản Đà Nẵng - Kênh Nhà Đất 24H',
    tagColor: 'bg-blue-500/90 text-white'
  },
  {
    name: 'Bình Dương',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    tag: 'CÔNG NGHIỆP',
    status: '6,800+ Nhà đất dự án',
    alt: 'Mua bán nhà đất Bình Dương - Kênh Nhà Đất 24H',
    tagColor: 'bg-emerald-500/90 text-white'
  },
  {
    name: 'Đồng Nai',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    tag: 'HẠ TẦNG MỚI',
    status: '5,400+ Đất nền sổ đỏ',
    alt: 'Bất động sản Đồng Nai - Kênh Nhà Đất 24H',
    tagColor: 'bg-indigo-500/90 text-white'
  },
  {
    name: 'Khánh Hòa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    tag: 'NGHỈ DƯỠNG',
    status: '3,100+ Căn hộ view biển',
    alt: 'Bất động sản Khánh Hòa - Mua bán nhà đất Nha Trang - Kênh Nhà Đất 24H',
    tagColor: 'bg-cyan-500/90 text-white'
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
    tag: 'ĐÔ THỊ BIỂN',
    status: '4,200+ Nhà phố giá tốt',
    alt: 'Bất động sản Bà Rịa - Vũng Tàu - Kênh Nhà Đất 24H',
    tagColor: 'bg-sky-500/90 text-white'
  },
  {
    name: 'Hải Phòng',
    image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=600&q=80',
    tag: 'CẢNG BIỂN',
    status: '3,200+ Tin mới cập nhật',
    alt: 'Mua bán nhà đất Hải Phòng - Kênh Nhà Đất 24H',
    tagColor: 'bg-purple-500/90 text-white'
  }
];

export default function HomeCityShowcase({ className = '' }) {
  const { properties } = useRealEstate();

  // Đếm chính xác số lượng bài viết thực tế theo từng Tỉnh / Thành phố từ kho dữ liệu
  const getCityCount = (cityName) => {
    if (!Array.isArray(properties)) return 0;
    const cleanTarget = cityName.toLowerCase()
      .replace(/^(tp\.|thành phố|tỉnh)\s*/i, '')
      .trim();

    return properties.filter(p => {
      if (!p?.city) return false;
      const cleanCity = p.city.toLowerCase()
        .replace(/^(tp\.|thành phố|tỉnh)\s*/i, '')
        .trim();
      return cleanCity === cleanTarget || cleanCity.includes(cleanTarget) || cleanTarget.includes(cleanCity);
    }).length;
  };

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-8 ${className ? className : 'pt-0 pb-0'}`}>
      {/* Header H2 căn giữa */}
      <div className="w-full text-center max-w-4xl mx-auto pb-4 sm:pb-5 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 tracking-tight text-center">
          Tìm Kiếm Bất Động Sản Theo Tỉnh Thành
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed mx-auto text-center font-normal">
          Kênh Nhà Đất 24H hỗ trợ tìm kiếm thông tin mua bán và cho thuê bất động sản theo tỉnh thành, giúp người dùng tiếp cận các tin đăng tại khu vực quan tâm. Bạn có thể lựa chọn địa phương để tham khảo giá bán, giá thuê và các loại hình bất động sản đang được đăng tải.
        </p>
      </div>

      {/* Lưới 8 Tỉnh Thành Trọng Điểm (2 hàng x 4 cột chuẩn Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 mt-4 sm:mt-5">
        {FEATURED_CITIES.map((city) => {
          const count = getCityCount(city.name);
          const targetUrl = buildSeoUrl({
            demand: 'sale',
            city: city.name
          });

          return (
            <Link
              key={city.name}
              to={targetUrl}
              className="group relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block bg-slate-900"
            >
              {/* Ảnh nền thành phố */}
              <img
                src={city.image}
                alt={city.alt || `Bất động sản ${city.name} - Kênh Nhà Đất 24H`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_CITY_IMAGE;
                }}
              />

              {/* Lớp phủ gradient tối ưu độ tương phản WCAG AA */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent"></div>

              {/* Tag nhãn đặc trưng góc trên */}
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${city.tagColor}`}>
                  {city.tag}
                </span>
              </div>

              {/* Thông tin tên thành phố và số lượng tin đăng ở chân card */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-location-dot text-red-500 text-xs shrink-0"></i>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight drop-shadow-sm group-hover:text-red-400 transition-colors truncate">
                    {city.name}
                  </h3>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-200 font-medium flex items-center justify-between gap-1.5">
                  <span className="leading-snug break-words">
                    {count > 0 ? `${count.toLocaleString('vi-VN')} bài viết` : '0 bài viết'}
                  </span>
                  <i className="fa-solid fa-arrow-right text-[10px] text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0"></i>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
