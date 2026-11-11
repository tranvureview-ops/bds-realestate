'use client';

import React, { useMemo } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { LISTING_TYPES, POST_LISTING_FAQS } from '../data/mockData';
import PostListingModal from '../components/PostListingModal';

export default function PostListingPage() {
  const { navigate } = useRouter();
  const { systemConfig, vipPackages, bumpServicePrice } = useRealEstate();
  const currentYear = new Date().getFullYear();

  const resolvedPackages = useMemo(() => {
    const source = Array.isArray(vipPackages) && vipPackages.length > 0 ? vipPackages : LISTING_TYPES;
    const byId = (id) => source.find((item) => item.id === id) || LISTING_TYPES.find((item) => item.id === id);
    return {
      diamond: byId('vip-diamond'),
      gold: byId('vip-gold'),
      silver: byId('vip-silver'),
      normal: byId('normal'),
    };
  }, [vipPackages]);

  const normalPrice60 = Number(
    resolvedPackages.normal?.rates?.[60] !== undefined
      ? resolvedPackages.normal.rates[60]
      : (resolvedPackages.normal?.publishPrice ?? 0)
  );
  const effectiveBumpPrice = Number(bumpServicePrice ?? resolvedPackages.normal?.bumpPrice ?? 400);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Breadcrumb & Navigation Quick-Links */}
        <nav aria-label="Breadcrumb" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Link to="/" className="hover:text-red-600 transition flex items-center gap-1">
              <i className="fa-solid fa-house text-slate-400"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" aria-hidden="true"></i>
            <span className="text-slate-900 font-bold" aria-current="page">Đăng Tin Nhà Đất</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/huong-dan-dang-tin"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-book-open text-emerald-600"></i>
              <span>Hướng Dẫn Đăng Tin</span>
            </Link>
            <Link
              to="/goi-hoi-vien"
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-crown text-amber-600"></i>
              <span>Gói Hội Viên</span>
            </Link>
            <Link
              to="/bang-gia-tin-dang"
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-tags text-slate-500"></i>
              <span>Bảng Giá Tin Đăng</span>
            </Link>
          </div>
        </nav>

        {/* Compact SEO Header & Single H1 above the 4-step form */}
        <header className="bg-white px-5 py-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Đăng Tin Mua Bán &amp; Cho Thuê Nhà Đất Miễn Phí [{currentYear}]
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Hoàn thành biểu mẫu 4 bước bên dưới để xuất bản tin rao chính chủ có định vị bản đồ, hình ảnh thực tế và tiếp cận người mua thực toàn quốc.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {normalPrice60 === 0 ? 'Tin Thường 0 đ (60 ngày)' : `Tin Thường ${normalPrice60.toLocaleString('vi-VN')} đ`}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              VIP Duyệt tức thì 0s
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Đẩy tin chỉ {effectiveBumpPrice.toLocaleString('vi-VN')} đ/lần
            </span>
          </div>
        </header>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Full 4-Step Form */}
          <div className="lg:col-span-8">
            <PostListingModal isEmbedded={true} onClose={() => navigate('/')} />
          </div>

          {/* Right Column: Broker Sidebar & Real-time Insights */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. So Sánh Hiệu Quả 4 Cấp Độ Tin Đăng (Đồng bộ live từ Context/LISTING_TYPES) */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-red-600 text-sm"></i>
                  <h3 className="font-black text-sm text-slate-900 uppercase">Hiệu Quả 4 Cấp Độ Tin Đăng</h3>
                </div>
                <Link to="/bang-gia-tin-dang" className="text-[11px] text-red-600 font-bold hover:underline">
                  Xem bảng giá
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {/* Diamond */}
                <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                      {resolvedPackages.diamond?.badgeText || 'VIP KIM CƯƠNG ★★★★★'}
                    </span>
                    <span className="font-black text-red-600 text-[11px]">
                      Tiếp cận {resolvedPackages.diamond?.multiplierText || 'x30'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Vị trí Top 1 Trang Chủ &amp; Kết quả tìm kiếm, {resolvedPackages.diamond?.approvalBadge || 'Duyệt tức thì (0s)'}, không quảng cáo bên thứ 3.
                  </p>
                </div>

                {/* Gold */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                      {resolvedPackages.gold?.badgeText || 'VIP VÀNG ★★★★'}
                    </span>
                    <span className="font-black text-amber-700 text-[11px]">
                      Tiếp cận {resolvedPackages.gold?.multiplierText || 'x15'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Ưu tiên ngay dưới VIP Kim Cương, viền vàng nổi bật, nút Gọi/Zalo 1-chạm rõ nét.
                  </p>
                </div>

                {/* Silver */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px] uppercase">
                      {resolvedPackages.silver?.badgeText || 'VIP BẠC ★★★'}
                    </span>
                    <span className="font-black text-blue-700 text-[11px]">
                      Tiếp cận {resolvedPackages.silver?.multiplierText || 'x8'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Hiển thị trên toàn bộ Tin Thường, huy hiệu VIP Bạc xanh tăng độ tin cậy với khách tìm mua.
                  </p>
                </div>

                {/* Normal */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-300 text-slate-700 font-bold text-[9px] uppercase">
                      {resolvedPackages.normal?.shortName || 'TIN THƯỜNG'}
                    </span>
                    <span className="font-black text-[11px] text-emerald-600">
                      {normalPrice60 === 0
                        ? `Miễn phí (${resolvedPackages.normal?.minDays || 60} ngày)`
                        : `${normalPrice60.toLocaleString('vi-VN')} đ (${resolvedPackages.normal?.minDays || 60} ngày)`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Giới hạn {resolvedPackages.normal?.dailyFreeLimit || 3} tin/ngày/tài khoản, đẩy tin lên đầu danh sách chỉ {effectiveBumpPrice.toLocaleString('vi-VN')} đ/lần.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Tiêu Chuẩn Kiểm Duyệt Tin Đăng */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                <h3>Tiêu Chuẩn Kiểm Duyệt Tin Đăng</h3>
              </div>
              <ul className="space-y-2 text-slate-700 text-[11px]">
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Tiêu đề:</b> Dài 30 - 99 ký tự, nêu rõ loại hình BĐS + vị trí/dự án + mức giá bán/thuê.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Hình ảnh:</b> Tối thiểu 4 ảnh thực tế chụp ban ngày rõ mặt tiền, phòng khách, bếp hoặc bản vẽ sổ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>Pháp lý minh bạch:</b> Ghi rõ Sổ hồng riêng, Sổ đỏ, GPXD hoặc HĐMB để tăng tỷ lệ liên hệ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-check text-emerald-600 mt-0.5"></i>
                  <span><b>GPS &amp; Tour VR 360°:</b> Định vị chính xác trên bản đồ giúp khách lọc khu vực tìm thấy tin nhanh hơn.</span>
                </li>
              </ul>
            </div>

            {/* 3. Hotline Hỗ Trợ Môi Giới */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Hỗ Trợ Đăng Tin VIP 24/7</div>
                <div className="text-[11px] text-slate-700 font-medium">Tư vấn chọn gói &amp; nạp tiền ví</div>
              </div>
              <Link
                href={`tel:${(systemConfig?.hotline || '0898 246 607').replace(/\s+/g, '')}`}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                title="Gọi Hotline hỗ trợ đăng tin"
              >
                <i className="fa-solid fa-phone text-xs"></i>
                <span>{systemConfig?.hotline || '0898 246 607'}</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Section AIO/GEO & E-E-A-T Tóm Tắt Quy Trình + Silo Links */}
        <section aria-labelledby="post-listing-guide-heading" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 id="post-listing-guide-heading" className="text-xl font-black text-slate-900">
              Quy Trình 4 Bước Đăng Tin Nhanh &amp; Mẹo Tăng Lượt Gọi [{currentYear}]
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Công cụ đăng tin tại <strong className="text-slate-900">Kênh Nhà Đất 24H</strong> giúp chủ nhà và môi giới xuất bản tin rao bất động sản đầy đủ thông tin chỉ trong 3 phút. Khi phân loại đúng vị trí khu vực, giá bán và tình trạng pháp lý ngay từ lúc nhập liệu, tin đăng sẽ hiển thị chính xác với khách hàng đang tìm mua.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-black text-red-600 uppercase">Bước 1: Vị Trí &amp; Loại BĐS</div>
              <h3 className="font-bold text-slate-900 text-sm">Chọn Loại Hình &amp; Khu Vực</h3>
              <p className="text-slate-600 leading-relaxed">
                Chọn đúng Nhu cầu (Bán/Cho thuê), Loại hình (Nhà riêng, Căn hộ, Đất nền...) cùng Tỉnh/Thành, Quận/Huyện để tin lên đúng danh mục khu vực.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-black text-emerald-700 uppercase">Bước 2: Thông Tin &amp; Pháp Lý</div>
              <h3 className="font-bold text-slate-900 text-sm">Tiêu Đề, Giá Bán &amp; Sổ Hồng</h3>
              <p className="text-slate-600 leading-relaxed">
                Đặt tiêu đề rõ loại BĐS + tên đường/dự án + mức giá; khai báo đầy đủ diện tích, số phòng, hướng nhà và tình trạng pháp lý (Sổ hồng/HĐMB).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-black text-blue-700 uppercase">Bước 3: Hình Ảnh Thực Tế</div>
              <h3 className="font-bold text-slate-900 text-sm">Ảnh Rõ Nét &amp; Tour VR 360°</h3>
              <p className="text-slate-600 leading-relaxed">
                Tin có từ 4 - 8 ảnh thực tế không dính chữ chèn (watermark rác) và có Video/VR 360° giữ chân người xem lâu hơn và tăng lượt nhắn Zalo.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-black text-amber-700 uppercase">Bước 4: Chọn Gói &amp; Lịch Đẩy</div>
              <h3 className="font-bold text-slate-900 text-sm">Áp Voucher &amp; Giờ Vàng</h3>
              <p className="text-slate-600 leading-relaxed">
                Đăng Tin Thường 0 đ hoặc nâng cấp VIP Bạc/Vàng/Kim Cương; áp dụng Voucher Hội Viên để giảm giá về 0 đ và bật đẩy tin tự động.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                <span>Hệ thống kiểm duyệt &amp; bảo vệ thông tin bởi Kênh Nhà Đất 24H</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ẩn một phần SĐT chống bot quét rác • Khám phá các công cụ và trang hướng dẫn liên quan:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <Link to="/huong-dan-dang-tin" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition">
                Cẩm Nang Đăng Tin Chi Tiết
              </Link>
              <Link to="/bang-gia-tin-dang" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 transition">
                Bảng Giá Tin VIP
              </Link>
              <Link to="/goi-hoi-vien" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition">
                Gói Hội Viên &amp; Voucher
              </Link>
              <Link to="/quan-ly-tin" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition">
                Quản Lý Tin Đã Đăng
              </Link>
              <Link to="/nap-tien" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition">
                Nạp Tiền Ví VietQR
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section (Đồng bộ 100% với JSON-LD FAQPage) */}
        <section aria-labelledby="post-listing-faq-heading" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 id="post-listing-faq-heading" className="text-xl font-black text-slate-900">
            Câu Hỏi Thường Gặp Khi Đăng Tin Nhà Đất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            {POST_LISTING_FAQS.map((faq, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs sm:text-[13px]">{faq.q}</h3>
                <p className="leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
