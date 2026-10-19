'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function Footer() {
  const { systemConfig, currentUser } = useRealEstate();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                <i className="fa-solid fa-building"></i>
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  <span>{systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {systemConfig?.tagline || 'Sàn Giao Dịch Bất Động Sản Biển & Đất Nền Đà Nẵng'}
                </div>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nền tảng công nghệ bất động sản đa trang tiên phong tích hợp bản đồ số GIS, tour thực tế ảo VR 360°, hệ thống phân cấp tin đăng VIP thông minh và công cụ tính toán tài chính chuẩn ngân hàng.
            </p>

            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-emerald-400"></i>
                <span>
                  Hotline 24/7:{' '}
                  <a
                    href={`tel:${(systemConfig?.hotline || '0898 246 607').replace(/\s+/g, '')}`}
                    className="text-white hover:text-emerald-400 font-bold font-mono transition"
                    title="Gọi Hotline CSKH"
                  >
                    {systemConfig?.hotline || '0898 246 607'}
                  </a>
                  {systemConfig?.zalo && (
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      (Zalo:{' '}
                      <a
                        href={`https://zalo.me/${systemConfig.zalo.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-mono"
                        title="Chat Zalo 24/7"
                      >
                        {systemConfig.zalo}
                      </a>)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-emerald-400"></i>
                <span>
                  Email:{' '}
                  <a
                    href={`mailto:${systemConfig?.email || 'cskh@datbiendanang.vn'}`}
                    className="text-white hover:text-emerald-400 font-bold transition"
                    title="Gửi email phản ánh / CSKH"
                  >
                    {systemConfig?.email || 'cskh@datbiendanang.vn'}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-emerald-400"></i>
                <span>Trụ sở chính: {systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng'}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              Khám Phá Nhà Đất
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/nha-dat-ban" className="hover:text-emerald-400 transition">Nhà Đất Cần Bán</Link></li>
              <li><Link to="/nha-dat-cho-thue" className="hover:text-emerald-400 transition">Cho Thuê Nhà Đất</Link></li>
              <li><Link to="/bang-gia-vip" className="hover:text-emerald-400 transition">Bảng Giá Gói Tin VIP</Link></li>
              <li><Link to="/dang-tin" className="hover:text-emerald-400 transition">Đăng Tin Hiệu Quả</Link></li>
              <li><Link to="/tinh-lai-vay" className="hover:text-emerald-400 transition">Công Cụ Tính Lãi Vay</Link></li>
            </ul>
          </div>

          {/* Service packages */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              Trang Thành Viên
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/ho-so-ca-nhan" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-user text-amber-500 text-[10px]"></i> Hồ Sơ Cá Nhân</Link></li>
              <li><Link to="/quan-ly-tin" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-list-check text-blue-400 text-[10px]"></i> Quản Lý Tin Đăng</Link></li>
              <li><Link to="/tin-da-luu" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-heart text-rose-400 text-[10px]"></i> Tin Đã Lưu Yêu Thích</Link></li>
              <li><Link to="/so-sanh" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-code-compare text-blue-400 text-[10px]"></i> So Sánh Đối Đầu</Link></li>
              <li><Link to="/nap-tien" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-wallet text-emerald-400 text-[10px]"></i> Nạp Tiền Ví Tài Khoản</Link></li>
              {currentUser?.role === 'admin' && (
                <li><Link to="/admin" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition flex items-center gap-1.5 text-red-400 font-semibold"><i className="fa-solid fa-shield-halved text-red-500 text-[10px]"></i> Bàn Làm Việc CMS Admin <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-500"></i></Link></li>
              )}
            </ul>
          </div>

          {/* Trust & Certifications */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              Chứng Nhận & Bảo Mật
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-shield-check text-emerald-400"></i>
                  Đã Đăng Ký Bộ Công Thương
                </div>
                <div className="text-[10px]">Sàn TMĐT giao dịch bất động sản hợp pháp theo Nghị định 52/2013/NĐ-CP.</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <i className="fa-solid fa-lock text-blue-400"></i>
                  Bảo Mật Giao Dịch SSL 256-bit
                </div>
                <div className="text-[10px]">Mọi thanh toán qua VietQR, MoMo và VNPAY được mã hóa tối đa.</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Category & Location Taxonomy Footer Links */}
        <div className="pt-8 pb-6 border-t border-slate-800/80">
          <div className="mb-4">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-sitemap text-[11px]"></i>
              Danh Mục Bất Động Sản & Địa Giới Hành Chính Chuẩn SEO
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tra cứu nhanh theo loại hình, tỉnh thành, quận huyện, phường xã và dự án trọng điểm
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-400">
            {/* Column 1: BĐS Bán - Nhà Ở & Căn Hộ */}
            <div className="space-y-1.5">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-emerald-300">
                Bất Động Sản Nhà Ở & Căn Hộ
              </div>
              <ul className="space-y-1.5">
                <li><Link to="/ban-can-ho-chung-cu" className="hover:text-emerald-400 transition">Căn hộ chung cư</Link></li>
                <li><Link to="/ban-chung-cu-mini-can-ho-dich-vu" className="hover:text-emerald-400 transition">Chung cư mini, căn hộ dịch vụ</Link></li>
                <li><Link to="/ban-nha-rieng" className="hover:text-emerald-400 transition">Nhà riêng thổ cư</Link></li>
                <li><Link to="/ban-nha-biethu-lien-ke" className="hover:text-emerald-400 transition">Nhà biệt thự, liền kề</Link></li>
                <li><Link to="/ban-nha-mat-pho" className="hover:text-emerald-400 transition">Nhà mặt phố kinh doanh</Link></li>
                <li><Link to="/ban-shophouse-nha-pho-thuong-mai" className="hover:text-emerald-400 transition">Shophouse thương mại</Link></li>
              </ul>
            </div>

            {/* Column 2: BĐS Đất Nền & Đầu Tư */}
            <div className="space-y-1.5">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-amber-300">
                Đất Nền, Nghỉ Dưỡng & Kho Xưởng
              </div>
              <ul className="space-y-1.5">
                <li><Link to="/ban-dat-nen-du-an" className="hover:text-amber-400 transition">Đất nền dự án</Link></li>
                <li><Link to="/ban-dat" className="hover:text-amber-400 transition">Đất thổ cư, đất vườn</Link></li>
                <li><Link to="/ban-trang-trai-khu-nghi-duong" className="hover:text-amber-400 transition">Trang trại, khu nghỉ dưỡng</Link></li>
                <li><Link to="/ban-condotel" className="hover:text-amber-400 transition">Căn hộ condotel nghỉ dưỡng</Link></li>
                <li><Link to="/ban-kho-nha-xuong" className="hover:text-amber-400 transition">Kho, nhà xưởng sản xuất</Link></li>
                <li><Link to="/ban-bat-dong-san-khac" className="hover:text-amber-400 transition">Loại BĐS khác</Link></li>
              </ul>
            </div>

            {/* Column 3: BĐS Cho Thuê Chuẩn SEO */}
            <div className="space-y-1.5">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-blue-300">
                Bất Động Sản Cho Thuê
              </div>
              <ul className="space-y-1.5">
                <li><Link to="/cho-thue-can-ho-chung-cu" className="hover:text-blue-400 transition">Cho thuê căn hộ chung cư</Link></li>
                <li><Link to="/cho-thue-chung-cu-mini-can-ho-dich-vu" className="hover:text-blue-400 transition">Cho thuê chung cư mini, CH dịch vụ</Link></li>
                <li><Link to="/cho-thue-nha-rieng" className="hover:text-blue-400 transition">Cho thuê nhà riêng, nguyên căn</Link></li>
                <li><Link to="/cho-thue-nha-biethu-lien-ke" className="hover:text-blue-400 transition">Cho thuê biệt thự, liền kề</Link></li>
                <li><Link to="/cho-thue-nha-mat-pho" className="hover:text-blue-400 transition">Cho thuê nhà mặt phố</Link></li>
                <li><Link to="/cho-thue-kho-nha-xuong" className="hover:text-blue-400 transition">Cho thuê kho, nhà xưởng</Link></li>
              </ul>
            </div>

            {/* Column 4: Địa Lý Trọng Điểm & Dự Án */}
            <div className="space-y-1.5">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-rose-300">
                Địa Lý Trọng Điểm & Dự Án
              </div>
              <ul className="space-y-1.5">
                <li><Link to="/ban-can-ho-chung-cu-ha-noi" className="hover:text-rose-400 transition">Căn hộ chung cư Hà Nội</Link></li>
                <li><Link to="/ban-can-ho-chung-cu-quan-cau-giay" className="hover:text-rose-400 transition">Căn hộ Cầu Giấy (Goldmark City)</Link></li>
                <li><Link to="/ban-nha-rieng-quan-ba-dinh" className="hover:text-rose-400 transition">Nhà riêng Quận Ba Đình (Kim Mã)</Link></li>
                <li><Link to="/cho-thue-nha-rieng-quan-1" className="hover:text-rose-400 transition">Nhà riêng Quận 1 TP.HCM (Bến Nghé)</Link></li>
                <li><Link to="/ban-dat-nen-du-an-da-nang" className="hover:text-rose-400 transition">Đất nền dự án Đà Nẵng</Link></li>
                <li><Link to="/ban-nha-rieng-quan-hai-chau" className="hover:text-rose-400 transition">Nhà riêng Quận Hải Châu</Link></li>
              </ul>
            </div>
          </div>
        </div>


        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">

          <div>
            © 2026 {systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}. Bản quyền thuộc về {systemConfig?.platformName || 'Công ty Cổ phần Bất Động Sản Đất Biển Đà Nẵng'}.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/quy-che-hoat-dong" className="hover:text-emerald-400 transition">Quy chế hoạt động</Link>
            <Link to="/chinh-sach-bao-mat" className="hover:text-emerald-400 transition">Chính sách bảo mật</Link>
            <Link to="/giai-quyet-khieu-nai" className="hover:text-emerald-400 transition">Giải quyết khiếu nại</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
