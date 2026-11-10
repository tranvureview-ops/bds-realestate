'use client';

import React, { useState } from 'react';
import { Link } from '../router/RouterContext';

export default function GuidePostListingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  const FAQS = [
    {
      q: 'Đăng tin bất động sản trên Kênh Nhà Đất 24H có mất phí không?',
      a: 'Kênh Nhà Đất 24H luôn có chính sách hỗ trợ tin đăng cơ bản miễn phí dành cho mọi chính chủ và khách hàng cá nhân. Ngoài ra, nếu bạn cần bán hoặc cho thuê gấp, hệ thống cung cấp các gói VIP (Bạc, Vàng, Kim Cương) và lịch đẩy tin tự động theo khung giờ vàng với mức phí cực kỳ ưu đãi giúp tăng lượt tiếp cận gấp 5 - 20 lần.'
    },
    {
      q: 'Sau khi hoàn tất đăng tin thì bao lâu tin sẽ được duyệt và hiển thị lên web?',
      a: 'Hệ thống áp dụng công nghệ kiểm duyệt AI thông minh kết hợp đội ngũ điều hành 24/7. Các tin đăng đáp ứng đủ tiêu chuẩn hình ảnh thực tế và thông tin minh bạch thường được duyệt tự động chỉ sau 3 - 5 phút. Đối với các tin đăng gói VIP Kim Cương, tin sẽ được ưu tiên duyệt tức thì.'
    },
    {
      q: 'Làm thế nào để tin đăng của tôi lên Top tìm kiếm Google và tiếp cận nhiều khách hàng nhất?',
      a: 'Để tin đăng đạt chuẩn SEO và giữ chân khách hàng tốt nhất: (1) Tiêu đề dài từ 30 - 99 ký tự có chứa tên loại BĐS + vị trí đường/quận + giá bán; (2) Mô tả chi tiết trên 100 từ nói rõ diện tích, pháp lý sổ đỏ, công năng sử dụng; (3) Tải tối thiểu 6 - 8 hình ảnh chụp ban ngày sắc nét; (4) Đính kèm link video hoặc Tour thực tế ảo VR 360°; (5) Lựa chọn cấp độ VIP Vàng hoặc Kim Cương để luôn giữ vị trí đầu trang.'
    },
    {
      q: 'Tôi có thể chỉnh sửa hoặc cập nhật lại giá bán sau khi tin đã đăng không?',
      a: 'Hoàn toàn được! Bạn chỉ cần đăng nhập vào tài khoản, truy cập mục "Quản lý tin đăng", chọn tin cần sửa và nhấn nút "Chỉnh sửa". Mọi thông số về giá cả, mô tả, hình ảnh bổ sung đều có thể cập nhật linh hoạt 24/7 mà không ảnh hưởng đến số lượt xem tích lũy.'
    },
    {
      q: 'Khung giờ vàng đẩy tin tự động hoạt động như thế nào?',
      a: 'Kênh Nhà Đất 24H thiết lập 4 khung giờ vàng có lượng người dùng tìm kiếm BĐS cao điểm nhất trong ngày: 08:00 (Sáng đầu ngày), 11:30 (Nghỉ trưa), 14:00 (Đầu giờ chiều) và 19:30 (Tối thư giãn). Khi cài đặt lịch đẩy tin tự động, hệ thống sẽ tự động làm mới thời gian đăng, đưa bài viết của bạn trở lại vị trí dẫn đầu của danh mục.'
    },
    {
      q: 'Số điện thoại của tôi có bị lộ hoặc bị phần mềm quét rác làm phiền không?',
      a: 'Kênh Nhà Đất 24H áp dụng cơ chế bảo mật thông minh với tính năng ẩn số điện thoại một phần ("Bấm để hiện số"), ngăn chặn triệt để các bot tự động cào dữ liệu (web scrapers). Chỉ những khách hàng thực tế có nhu cầu liên hệ mới có thể xem và kết nối Zalo với bạn.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <li>
              <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
                <i className="fa-solid fa-house text-slate-400"></i>
                <span>Trang chủ</span>
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link to="/kien-thuc" className="hover:text-emerald-700 transition">
                Kiến thức & Hướng dẫn
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-bold truncate">Hướng dẫn đăng tin BĐS</li>
          </ol>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
            <i className="fa-solid fa-circle-check text-emerald-400"></i>
            <span>CẨM NANG CHÍNH THỨC • CẬP NHẬT 2027</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Hướng Dẫn Đăng Tin Bất Động Sản Hiệu Quả & Nhanh Chóng
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Quy trình chuẩn hóa 4 bước từ khâu chọn địa giới hành chính GIS, viết tiêu đề chuẩn SEO, đăng ảnh sắc nét cho đến chiến lược chọn gói VIP và lịch đẩy tin giờ vàng giúp thanh khoản bất động sản nhanh gấp 3 lần.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dang-tin"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/40 transition flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Bắt Đầu Đăng Tin Ngay (Miễn Phí)</span>
            </Link>
            <Link
              to="/bang-gia-tin-dang"
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center gap-2"
            >
              <i className="fa-solid fa-crown text-amber-400"></i>
              <span>Xem Bảng Giá Gói VIP</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto border-t border-slate-700/60 text-left">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xl font-black text-emerald-400">1.000.000+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Lượt xem tin/tháng</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xl font-black text-amber-400">3 - 5 Phút</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Duyệt bài tự động AI</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xl font-black text-cyan-400">x20 Lần</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tiếp cận với VIP Kim Cương</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xl font-black text-rose-400">100% Bảo Mật</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Chống cào số điện thoại</div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-10">

        {/* Mục lục tóm tắt nhanh (Quick Jump) */}
        <section aria-labelledby="toc-heading" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <i className="fa-solid fa-list-ol text-emerald-600 text-base"></i>
            <h2 id="toc-heading" className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Mục Lục Hướng Dẫn Nhanh
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <a href="#buoc-1" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Bước 1: Phân loại BĐS & Chọn địa giới hành chính GIS</span>
            </a>
            <a href="#buoc-2" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Bước 2: Viết tiêu đề chuẩn SEO & nhập thông số kỹ thuật</span>
            </a>
            <a href="#buoc-3" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">3</span>
              <span>Bước 3: Tải ảnh chụp thực tế & nhúng VR 360° / Video</span>
            </a>
            <a href="#buoc-4" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">4</span>
              <span>Bước 4: Chọn gói VIP, lịch đẩy tin giờ vàng & xuất bản</span>
            </a>
            <a href="#so-sanh-vip" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">5</span>
              <span>So sánh hiệu quả 4 cấp độ tin đăng VIP</span>
            </a>
            <a href="#cau-hoi-thuong-gap" className="hover:text-emerald-700 flex items-center gap-2 py-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">6</span>
              <span>Câu hỏi thường gặp khi đăng tin (FAQ)</span>
            </a>
          </div>
        </section>

        {/* ========================================================
            QUY TRÌNH 4 BƯỚC ĐĂNG TIN CHI TIẾT
           ======================================================== */}
        <section aria-label="Quy trình 4 bước đăng tin" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chi Tiết 4 Bước Đăng Tin Chuẩn Sàn Kênh Nhà Đất 24H
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Giao diện đăng tin được tối ưu hóa theo 4 bước liên hoàn giúp bạn hoàn thành đăng tin nhanh chỉ trong vòng 2 phút.
            </p>
          </div>

          {/* BƯỚC 1 */}
          <article id="buoc-1" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                  1
                </span>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Bước 1 trên hệ thống</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Phân Loại Nhu Cầu & Xác Định Địa Giới Hành Chính Chuẩn GIS
                  </h3>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Định vị chính xác 100%
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Đây là bước quan trọng nhất quyết định bất động sản của bạn xuất hiện đúng bộ lọc khi khách hàng tìm kiếm theo địa phương.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-arrows-split-up-and-left text-emerald-600"></i>
                    <span>1. Chọn Hình Thức Giao Dịch & Loại BĐS:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                    <li><strong>Bán nhà đất:</strong> Căn hộ chung cư, Nhà riêng, Biệt thự/liền kề, Nhà mặt phố, Shophouse, Đất nền dự án, Đất thổ cư, Kho xưởng, Trang trại/nghỉ dưỡng...</li>
                    <li><strong>Cho thuê bất động sản:</strong> Thuê căn hộ, thuê phòng trọ/chung cư mini, thuê nhà nguyên căn, thuê mặt bằng kinh doanh, thuê kho xưởng...</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-map-location-dot text-emerald-600"></i>
                    <span>2. Địa Giới Hành Chính 3 Cấp:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                    <li><strong>Tỉnh / Thành phố:</strong> Chọn đúng tỉnh/thành (Hà Nội, TP.HCM, Đà Nẵng, Bình Dương, Hải Phòng...).</li>
                    <li><strong>Quận / Huyện & Phường / Xã:</strong> Danh mục được đồng bộ chuẩn theo địa giới hành chính quốc gia.</li>
                    <li><strong>Tên Đường / Số Nhà & Dự Án:</strong> Nhập chính xác tên trục đường hoặc tên khu đô thị để tăng độ tin cậy.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Mẹo hay ghim vị trí GPS trên Bản đồ số GIS:</span>
                </div>
                <p>
                  Hệ thống tự động đồng bộ ghim vị trí theo địa chỉ bạn nhập. Bạn có thể kéo thả nhẹ ghim đỏ trên bản đồ để khách hàng bấm xem ngay lộ trình đường đi và các tiện ích xung quanh (trường học, bệnh viện, chợ, siêu thị).
                </p>
              </div>
            </div>
          </article>

          {/* BƯỚC 2 */}
          <article id="buoc-2" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-600/30">
                  2
                </span>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Bước 2 trên hệ thống</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Soạn Tiêu Đề Chuẩn SEO, Nội Dung Mô Tả & Thông Số Chi Tiết
                  </h3>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                Tối ưu tỷ lệ nhấp chuột (CTR)
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Tiêu đề và nội dung mô tả là yếu tố trực tiếp quyết định người mua có bấm vào xem tin và nhấc máy gọi cho bạn hay không.
              </p>

              {/* Công thức tiêu đề vàng */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Công Thức Tiêu Đề Vàng (Độ dài chuẩn: 30 - 99 Ký Tự)</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl font-mono text-xs sm:text-sm text-emerald-300">
                  [Hành Động] + [Loại BĐS] + [Đặc Điểm Nổi Bật / Diện Tích] + [Tên Đường, Phường, Quận] + [Giá Bán]
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div><strong className="text-white">Ví dụ 1:</strong> <em>Bán nhà phố 3 tầng mặt tiền Trần Văn Trứ, Hải Châu, Đà Nẵng, 90m2, giá 8.5 tỷ</em></div>
                  <div><strong className="text-white">Ví dụ 2:</strong> <em>Cho thuê căn hộ cao cấp 2PN The Sang Residence view biển, full nội thất, 15 triệu/tháng</em></div>
                </div>
              </div>

              {/* Cấu trúc mô tả 3 phần */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">1. Mở bài (Tổng quan)</div>
                  <p className="text-xs text-slate-600">
                    Lý do bán/cho thuê (chính chủ cần tiền định cư, chuyển công tác), vị trí đắc địa, diện tích tổng thể, hướng nhà phong thủy.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">2. Thân bài (Công năng & Nội thất)</div>
                  <p className="text-xs text-slate-600">
                    Số phòng ngủ, phòng khách, phòng tắm, ban công, thiết bị nội thất nhập khẩu kèm theo (điều hòa, bếp, bình nóng lạnh...).
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">3. Kết bài (Pháp lý & Liên hệ)</div>
                  <p className="text-xs text-slate-600">
                    Tình trạng pháp lý rõ ràng (Sổ hồng chính chủ, sẵn sàng công chứng), giá bán thương lượng, số điện thoại hoặc Zalo liên hệ trực tiếp.
                  </p>
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs">Điền đầy đủ các trường thông số kỹ thuật:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Giá:</strong> Số tiền hoặc Thỏa thuận</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Diện tích:</strong> m² thông thủy</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Số phòng:</strong> Phòng ngủ / WC</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Pháp lý:</strong> Sổ đỏ/Sổ hồng</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Hướng nhà:</strong> Đông, Tây, Nam, Bắc...</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Mặt tiền:</strong> Chiều rộng mặt tiền (m)</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Đường vào:</strong> Ô tô tránh / Ngõ xe máy</div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200"><strong>Nội thất:</strong> Đầy đủ / Cơ bản / Thô</div>
                </div>
              </div>
            </div>
          </article>

          {/* BƯỚC 3 */}
          <article id="buoc-3" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-cyan-600/30">
                  3
                </span>
                <div>
                  <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Bước 3 trên hệ thống</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Đăng Tải Hình Ảnh Chụp Thực Tế & Nhúng Tour Thực Tế Ảo VR 360°
                  </h3>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs font-semibold">
                Tăng 300% tương tác
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Tin đăng có từ <strong>6 - 12 hình ảnh thật</strong> nhận được lượng cuộc gọi cao gấp 4 lần so với tin không có ảnh hoặc chỉ có 1 - 2 ảnh mờ.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-camera text-cyan-600"></i>
                    <span>Tiêu Chuẩn Hình Ảnh Đạt Chuẩn:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                    <li>Chụp vào ban ngày (từ 8h - 11h sáng hoặc 14h - 16h chiều) để ánh sáng tự nhiên đẹp nhất.</li>
                    <li>Ảnh chụp góc ngang rộng, bao quát trọn vẹn không gian, dọn dẹp nhà cửa gọn gàng trước khi chụp.</li>
                    <li>Chụp đầy đủ: Mặt tiền nhà/tòa nhà &rarr; Đường trước nhà &rarr; Phòng khách &rarr; Bếp &rarr; Phòng ngủ &rarr; Nhà vệ sinh &rarr; Sơ đồ thửa đất trên sổ đỏ.</li>
                    <li>Không chèn chữ số điện thoại quá lớn đè lên ảnh làm giảm trải nghiệm của người xem.</li>
                  </ul>
                </div>

                <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-200/80 space-y-2.5">
                  <div className="font-bold text-cyan-950 flex items-center gap-2">
                    <i className="fa-solid fa-vr-cardboard text-cyan-700"></i>
                    <span>Tích Hợp Tour VR 360° & Video YouTube:</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Kênh Nhà Đất 24H hỗ trợ trường nhúng Tour thực tế ảo VR 360° và video quay thực tế căn nhà.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc">
                    <li>Khách hàng từ xa (Hà Nội, Sài Gòn, Việt Kiều) có thể trải nghiệm xem nhà như đang có mặt thực tế.</li>
                    <li>Tin đăng có VR 360° được gắn nhãn độc quyền và ưu tiên hiển thị trên trang chủ sàn.</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          {/* BƯỚC 4 */}
          <article id="buoc-4" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-600/30">
                  4
                </span>
                <div>
                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Bước 4 trên hệ thống</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Lựa Chọn Cấp Độ VIP, Lịch Đẩy Tin Giờ Vàng & Xuất Bản Tin
                  </h3>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-red-50 text-red-900 border border-red-200 text-xs font-semibold">
                Thúc đẩy thanh khoản tối đa
              </span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Tại bước cuối cùng, bạn có thể lựa chọn cấp độ hiển thị và cài đặt lịch làm mới tin tự động để tin đăng luôn nằm ở trang nhất.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-regular fa-clock text-red-600"></i>
                    <span>Cài Đặt Đẩy Tin Tự Động (4 Khung Giờ Vàng):</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>• <strong>08:00 Sáng:</strong> Đón khách tìm kiếm BĐS đầu ngày.</div>
                    <div>• <strong>11:30 Trưa:</strong> Giờ nghỉ trưa cao điểm khách lướt web.</div>
                    <div>• <strong>14:00 Chiều:</strong> Môi giới & nhà đầu tư liên hệ giao dịch.</div>
                    <div>• <strong>19:30 Tối:</strong> Khung giờ vàng thư giãn có đông người truy cập nhất.</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-user-shield text-emerald-600"></i>
                    <span>Thông Tin Liên Hệ & Bảo Mật:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                    <li>Nhập họ tên chính xác của người quản lý tin đăng.</li>
                    <li>Số điện thoại nhận tin nhắn Zalo tư vấn khách hàng.</li>
                    <li>Hệ thống mã hóa một phần số điện thoại chống bot cào rác tự động.</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* ========================================================
            BẢNG SO SÁNH 4 CẤP ĐỘ TIN ĐĂNG
           ======================================================== */}
        <section id="so-sanh-vip" aria-labelledby="vip-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Đòn bẩy thanh khoản</span>
              <h2 id="vip-heading" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                So Sánh Hiệu Quả 4 Cấp Độ Tin Đăng Tại Kênh Nhà Đất 24H
              </h2>
            </div>
            <Link
              to="/bang-gia-tin-dang"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Xem chi tiết bảng giá</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* VIP Kim Cương */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-red-50 to-white border-2 border-red-500 shadow-md relative space-y-3">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase shadow-xs">
                HOT NHẤT
              </span>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">VIP Kim Cương</span>
                <div className="text-base font-black text-slate-900">★★★★★</div>
              </div>
              <div className="text-2xl font-black text-red-600">x20 <span className="text-xs font-medium text-slate-600">lượt xem</span></div>
              <ul className="space-y-1.5 text-xs text-slate-700 border-t border-red-100 pt-3">
                <li>✓ Vị trí Top 1 độc tôn trang chủ & danh mục</li>
                <li>✓ Kích thước thẻ tin lớn nhất với huy hiệu Kim Cương</li>
                <li>✓ Duyệt bài tự động ưu tiên số 1</li>
                <li>✓ Hỗ trợ đẩy tin giờ vàng tối đa</li>
              </ul>
            </div>

            {/* VIP Vàng */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-300 shadow-sm space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">VIP Vàng</span>
                <div className="text-base font-black text-amber-500">★★★★</div>
              </div>
              <div className="text-2xl font-black text-amber-700">x10 <span className="text-xs font-medium text-slate-600">lượt xem</span></div>
              <ul className="space-y-1.5 text-xs text-slate-700 border-t border-amber-100 pt-3">
                <li>✓ Nằm ngay dưới tin VIP Kim Cương</li>
                <li>✓ Viền ánh vàng sang trọng thu hút mắt nhìn</li>
                <li>✓ Không hiển thị tin quảng cáo đối thủ</li>
                <li>✓ Thích hợp nhà phố, đất nền cần chốt deal</li>
              </ul>
            </div>

            {/* VIP Bạc */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-200 shadow-sm space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">VIP Bạc</span>
                <div className="text-base font-black text-blue-500">★★★</div>
              </div>
              <div className="text-2xl font-black text-blue-700">x5 <span className="text-xs font-medium text-slate-600">lượt xem</span></div>
              <ul className="space-y-1.5 text-xs text-slate-700 border-t border-blue-100 pt-3">
                <li>✓ Nằm phía trên toàn bộ tin đăng thường</li>
                <li>✓ Huy hiệu Bạc uy tín tạo niềm tin</li>
                <li>✓ Chi phí cực kỳ tiết kiệm</li>
                <li>✓ Thích hợp căn hộ cho thuê, đất nền nhỏ</li>
              </ul>
            </div>

            {/* Tin Thường */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tin Thường</span>
                <div className="text-base font-bold text-slate-400">Tiêu chuẩn</div>
              </div>
              <div className="text-2xl font-black text-slate-800">Cơ bản <span className="text-xs font-medium text-slate-500">miễn phí</span></div>
              <ul className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <li>✓ Đăng tin tiếp cận khách hàng tìm kiếm</li>
                <li>✓ Đầy đủ thông số, bản đồ và hình ảnh</li>
                <li>✓ Quản lý tin đăng linh hoạt trong tài khoản</li>
                <li>✓ Dành cho chính chủ không gấp gáp</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================
            CÂU HỎI THƯỜNG GẶP (FAQ)
           ======================================================== */}
        <section id="cau-hoi-thuong-gap" aria-labelledby="faq-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Giải đáp thắc mắc</span>
            <h2 id="faq-heading" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Những Câu Hỏi Thường Gặp Về Đăng Tin BĐS
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 bg-slate-50/80 hover:bg-slate-100/80 transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-question text-emerald-600 text-sm shrink-0"></i>
                      <span>{faq.q}</span>
                    </span>
                    <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition transform ${isOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            CTA BANNER
           ======================================================== */}
        <section aria-label="Kêu gọi hành động" className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-8 sm:p-10 text-center space-y-4 shadow-xl shadow-teal-900/20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
            Sẵn Sàng Tiếp Cận Hàng Triệu Khách Hàng Tiềm Năng?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Đăng tin bán hoặc cho thuê bất động sản ngay hôm nay trên Kênh Nhà Đất 24H để trải nghiệm công nghệ kết nối giao dịch thông minh và thanh khoản nhanh nhất.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dang-tin"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 font-extrabold text-sm shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-cloud-arrow-up text-emerald-700"></i>
              <span>Đăng Tin Mới Ngay</span>
            </Link>
            <Link
              to="/bang-gia-tin-dang"
              className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-500/50 font-bold text-sm transition flex items-center gap-2"
            >
              <i className="fa-solid fa-crown text-amber-300"></i>
              <span>Bảng Giá Tin Đăng & Gói VIP</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
