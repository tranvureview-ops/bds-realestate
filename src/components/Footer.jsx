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
                <span>Trụ sở chính: {systemConfig?.address || 'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, TP. Đà Nẵng'}</span>
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
              <li><Link to="/dang-tin" className="hover:text-emerald-400 transition">Đăng Tin Chuẩn Sàn</Link></li>
              <li><Link to="/tinh-lai-vay" className="hover:text-emerald-400 transition">Công Cụ Tính Lãi Vay</Link></li>
            </ul>
          </div>

          {/* Service packages */}
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              Trang Thành Viên
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/ho-so-ca-nhan" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-user text-amber-500 text-[10px]"></i> Hồ Sơ Cá Nhân & KYC</Link></li>
              <li><Link to="/quan-ly-tin" className="hover:text-amber-400 transition flex items-center gap-1.5"><i className="fa-solid fa-list-check text-blue-400 text-[10px]"></i> Quản Lý Tin Của Tôi</Link></li>
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
