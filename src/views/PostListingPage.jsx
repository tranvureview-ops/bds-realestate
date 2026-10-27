'use client';

import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { VIP_PACKAGES } from '../data/mockData';
import PostListingModal from '../components/PostListingModal';

export default function PostListingPage() {
  const { navigate } = useRouter();
  const { currentUser, systemConfig, vipPackages } = useRealEstate();
  const normalPkg = (vipPackages || []).find(p => p.id === 'normal');
  const normalPrice = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 5000));
  const isNormalFree = normalPrice === 0;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Breadcrumb & Navigation Quick-Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Link to="/" className="hover:text-red-600 transition flex items-center gap-1">
              <i className="fa-solid fa-house text-slate-400"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
            <span className="text-slate-900 font-bold">Đăng Tin Mới</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/goi-hoi-vien"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-crown text-amber-600"></i>
              <span>Gói Hội Viên</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-amber-700 ml-0.5"></i>
            </Link>
            <Link
              to="/bang-gia-tin-dang"
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-tags text-slate-500"></i>
              <span>Bảng Giá Tin Đăng</span>
            </Link>
            <Link
              to="/quan-ly-tin"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <i className="fa-solid fa-list-check text-xs"></i>
              <span>Quản Lý Tin Đăng</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Full 4-Step Form */}
          <div className="lg:col-span-8">
            <PostListingModal isEmbedded={true} onClose={() => navigate('/')} />
          </div>

          {/* Right Column: Broker Sidebar & Real-time Insights */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. So Sánh Hiệu Quả 4 Cấp Độ Tin Đăng */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-red-600 text-sm"></i>
                  <h3 className="font-black text-sm text-slate-900 uppercase">Hiệu Quả 4 Cấp Độ Tin Đăng</h3>
                </div>
                <Link to="/bang-gia-tin-dang" className="text-[11px] text-red-600 font-bold hover:underline">
                  Xem chi tiết
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {/* Diamond */}
                <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                      VIP Kim Cương ★★★★★
                    </span>
                    <span className="font-black text-red-600 text-[11px]">Tiếp cận x20</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Vị trí độc tôn Top 1 sàn, nổi bật nhất trang chủ, duyệt bài tức thì.
                  </p>
                </div>

                {/* Gold */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                      VIP Vàng ★★★★
                    </span>
                    <span className="font-black text-amber-700 text-[11px]">Tiếp cận x10</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Top 2 trang chủ, viền ánh vàng sang trọng, không chèn quảng cáo đối thủ.
                  </p>
                </div>

                {/* Silver */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px] uppercase">
                      VIP Bạc ★★★
                    </span>
                    <span className="font-black text-blue-700 text-[11px]">Tiếp cận x5</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Nằm trên toàn bộ Tin Thường, huy hiệu VIP Bạc xanh uy tín.
                  </p>
                </div>

                {/* Normal */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-300 text-slate-700 font-bold text-[9px] uppercase">
                      Tin Thường
                    </span>
                    <span className={`font-black text-[11px] ${isNormalFree ? 'text-emerald-600' : 'text-slate-800 font-mono'}`}>
                      {isNormalFree ? 'Miễn phí (60 ngày)' : `${normalPrice.toLocaleString('vi-VN')} đ / 60 ngày`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isNormalFree ? 'Đăng tin tiếp cận khách hàng hoàn toàn miễn phí 100%.' : 'Kinh tế, áp dụng Voucher Hội Viên chỉ 0 đ.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Tiêu Chuẩn Kiểm Duyệt Tin Đăng */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                <span>Tiêu Chuẩn Kiểm Duyệt Tin Đăng</span>
              </div>
              <ul className="space-y-2 text-slate-700 text-[11px]">
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Tiêu đề:</b> Tối thiểu 30 ký tự, rõ loại hình BĐS + dự án + mức giá.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Hình ảnh:</b> Tối thiểu 4 ảnh thực tế chụp phòng khách, bếp, ban công.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Pháp lý:</b> Ghi rõ Sổ hồng, Sổ đỏ hoặc HĐMB để tăng 250% tỷ lệ gọi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Tour VR 360°:</b> Giúp bài đăng được thuật toán đẩy lên trang gợi ý.</span>
                </li>
              </ul>
            </div>

            {/* 4. Hotline Hỗ Trợ Môi Giới */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Hỗ Trợ Đăng Tin VIP 24/7</div>
                <div className="text-[11px] text-slate-500">Tư vấn chọn gói & nạp tiền ví</div>
              </div>
              <Link
                href={`tel:${(systemConfig?.hotline || '0898 246 607').replace(/\s+/g, '')}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                title="Gọi Hotline hỗ trợ đăng tin"
              >
                <i className="fa-solid fa-phone text-xs"></i>
                <span>{systemConfig?.hotline || '0898 246 607'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
