'use client';

import React from 'react';
import { Link } from '../router/RouterContext';

/**
 * HomeSeoContent – Khối nội dung On-page SEO trang chủ
 * Cấu trúc H2/H3 theo brief kỹ thuật SEO từ Giám đốc Technical SEO.
 * Mọi heading, body text và anchor text phải được giữ nguyên.
 */
export default function HomeSeoContent() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-6 sm:pb-8 border-t border-slate-200/80">
      <div className="not-prose">

        {/* =====================================================================
            H2: Tin Tức Và Kiến Thức Bất Động Sản
           ===================================================================== */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug text-center">
              Tin Tức Và Kiến Thức Bất Động Sản
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto text-center">
              Cập nhật nhanh chóng thông tin thị trường, cẩm nang mua bán nhà đất, kinh nghiệm đầu tư thực chiến và các vấn đề pháp lý hiện hành liên quan đến lĩnh vực bất động sản. Nội dung được xây dựng và kiểm duyệt khắt khe bởi đội ngũ chuyên gia, nhằm giúp người đọc hiểu rõ biến động thị trường, chuẩn bị đầy đủ hồ sơ cần thiết và tự tin đưa ra các quyết định giao dịch an toàn, tối ưu dòng tiền.
            </p>
          </div>

          {/* 3 Nhóm Bài Viết (H3) - Thiết kế Card Tri Thức Thân Thiện & Đều Nhịp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Nhóm 1: Thông Tin Thị Trường Mua Bán Nhà Đất */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <Link 
                    to="/kien-thuc/thi-truong"
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-100/80 transition"
                  >
                    Thị Trường & Xu Hướng
                  </Link>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2.5 group-hover:text-blue-600 transition-colors">
                  Thông Tin Thị Trường Mua Bán Nhà Đất
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal">
                  Cập nhật liên tục diễn biến giá mua bán nhà đất, báo cáo nguồn cung, nhu cầu thực tế và xu hướng chuyển dịch của dòng vốn trên thị trường bất động sản toàn quốc.
                </p>

                {/* Flat URL Articles */}
                <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bài viết tiêu biểu:</div>
                  <Link
                    to="/kien-thuc/gia-dat-nen-quan-9-2027"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-blue-500 shrink-0"></i>
                    <span className="truncate">Biến động giá đất nền Quận 9 năm 2027</span>
                  </Link>
                  <Link
                    to="/kien-thuc/khao-sat-gia-can-ho-binh-thanh"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-blue-500 shrink-0"></i>
                    <span className="truncate">Khảo sát giá căn hộ chung cư Bình Thạnh</span>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto">
                <Link
                  to="/kien-thuc/thi-truong"
                  className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-slate-50 group-hover:bg-blue-50/80 border border-slate-200/70 group-hover:border-blue-200 text-slate-700 group-hover:text-blue-700 text-xs font-bold transition-all duration-200"
                >
                  <span className="truncate pr-2">📈 Khảo sát giá nhà đất, cung cầu & xu hướng mới nhất</span>
                  <i className="fa-solid fa-arrow-right text-[11px] text-blue-600 group-hover:translate-x-1 transition-transform shrink-0"></i>
                </Link>
              </div>
            </div>

            {/* Nhóm 2: Kinh Nghiệm Mua Bán Nhà Đất Và Đầu Tư */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-amber-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-lightbulb"></i>
                  </div>
                  <Link
                    to="/kien-thuc/kinh-nghiem"
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50/80 hover:bg-amber-100 text-amber-700 border border-amber-100/80 transition"
                  >
                    Kinh Nghiệm & Cẩm Nang
                  </Link>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2.5 group-hover:text-amber-600 transition-colors">
                  Kinh Nghiệm Mua Bán Nhà Đất Và Đầu Tư
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal">
                  Chia sẻ cẩm nang tìm kiếm sản phẩm, bí quyết thương lượng giá, quy trình kiểm tra thực địa và chiến lược quản lý rủi ro tối ưu cho dòng tiền đầu tư.
                </p>

                {/* Flat URL Articles */}
                <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bài viết tiêu biểu:</div>
                  <Link
                    to="/kien-thuc/kinh-nghiem-mua-nha-mat-pho-kinh-doanh"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-amber-500 shrink-0"></i>
                    <span className="truncate">Kinh nghiệm mua nhà mặt phố kinh doanh</span>
                  </Link>
                  <Link
                    to="/kien-thuc/bi-quyet-thuong-luong-gia-dat-nen"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-amber-500 shrink-0"></i>
                    <span className="truncate">Bí quyết thương lượng giá đất nền</span>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto">
                <Link
                  to="/kien-thuc/kinh-nghiem"
                  className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-slate-50 group-hover:bg-amber-50/80 border border-slate-200/70 group-hover:border-amber-200 text-slate-700 group-hover:text-amber-700 text-xs font-bold transition-all duration-200"
                >
                  <span className="truncate pr-2">💡 Bí quyết thương lượng, kiểm tra & quản lý rủi ro dòng vốn</span>
                  <i className="fa-solid fa-arrow-right text-[11px] text-amber-600 group-hover:translate-x-1 transition-transform shrink-0"></i>
                </Link>
              </div>
            </div>

            {/* Nhóm 3: Kiến Thức Pháp Lý & Quy Hoạch Bất Động Sản */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <Link
                    to="/kien-thuc/phap-ly"
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50/80 hover:bg-red-100 text-red-700 border border-red-100/80 transition"
                  >
                    Pháp Lý & Quy Hoạch
                  </Link>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-2.5 group-hover:text-red-600 transition-colors">
                  Kiến Thức Pháp Lý & Quy Hoạch Bất Động Sản
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal">
                  Hướng dẫn quy trình làm sổ đỏ, sổ hồng, sang tên chuyển nhượng, tra cứu thông tin quy hoạch và biểu mẫu hợp đồng mua bán bất động sản an toàn.
                </p>

                {/* Flat URL Articles */}
                <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bài viết tiêu biểu:</div>
                  <Link
                    to="/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-red-500 shrink-0"></i>
                    <span className="truncate">Thủ tục sang tên sổ hồng căn hộ</span>
                  </Link>
                  <Link
                    to="/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 transition"
                  >
                    <i className="fa-solid fa-arrow-right text-[10px] text-red-500 shrink-0"></i>
                    <span className="truncate">Cách tra cứu quy hoạch đất đai trực tuyến</span>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto">
                <Link
                  to="/kien-thuc/phap-ly"
                  className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-slate-50 group-hover:bg-red-50/80 border border-slate-200/70 group-hover:border-red-200 text-slate-700 group-hover:text-red-700 text-xs font-bold transition-all duration-200"
                >
                  <span className="truncate pr-2">⚖️ Thủ tục sổ đỏ, sổ hồng, tra cứu quy hoạch & hợp đồng mẫu</span>
                  <i className="fa-solid fa-arrow-right text-[11px] text-red-600 group-hover:translate-x-1 transition-transform shrink-0"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* ===================================================================
              Ban Biên Tập & Nguyên Tắc Thẩm Định Thông Tin (Google EEAT Standards)
             =================================================================== */}
          <div className="mt-8 sm:mt-10 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Background Decorative Gradient Orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="pb-6 border-b border-slate-800">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Ban Biên Tập & Nguyên Tắc Thẩm Định Thông Tin
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                  Kênh Nhà Đất 24H cam kết tính minh bạch: Mọi cẩm nang pháp lý, tin tức thị trường và kinh nghiệm giao dịch đều được tổng hợp, đối chiếu khắt khe từ văn bản pháp luật, báo chí chính thống và trải nghiệm thực tế từ thị trường bất động sản toàn quốc.
                </p>
              </div>

              {/* 3 Verification Pillars (EEAT Compliant) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-6">
                {/* Trụ cột 1: Pháp lý chính thống */}
                <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex items-start gap-3.5 hover:border-slate-600 transition">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl shrink-0 font-black shadow-xs">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Đối Chiếu Pháp Lý Chính Thống</div>
                    <div className="text-xs font-bold text-blue-400 mt-0.5">Luật Đất Đai & Nghị Định Mới</div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Mọi nội dung thủ tục, sổ đỏ, thuế phí và hợp đồng mẫu đều được đối chiếu trực tiếp từ Luật Đất đai 2024, Cổng thông tin Bộ Xây Dựng và văn bản pháp luật hiện hành.
                    </p>
                  </div>
                </div>

                {/* Trụ cột 2: Kinh nghiệm thực chiến */}
                <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex items-start gap-3.5 hover:border-slate-600 transition">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M519.2 127.9l-47.6-47.6A56.252 56.252 0 0 0 432 64H205.2c-14.8 0-29.1 5.9-39.6 16.3L118 127.9H0v255.7h64c17.6 0 31.8-14.2 31.9-31.7h9.1l84.6 76.4c30.9 25.1 73.8 25.7 105.6 3.8c12.5 10.8 26 15.9 41.1 15.9c18.2 0 35.3-7.4 48.8-24c22.1 8.7 48.2 2.6 64-16.8l26.2-32.3c5.6-6.9 9.1-14.8 10.9-23h57.9c.1 17.5 14.4 31.7 31.9 31.7h64V127.9H519.2zM48 351.6c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16c0 8.9-7.2 16-16 16zm390-6.9l-26.1 32.2c-2.8 3.4-7.8 4-11.3 1.2l-23.9-19.4l-30 36.5c-6 7.3-15 4.8-18 2.4l-36.8-31.5l-15.6 19.2c-13.9 17.1-39.2 19.7-55.3 6.6l-97.3-88H96V175.8h41.9l61.7-61.6c2-.8 3.7-1.5 5.7-2.3H262l-38.7 35.5c-29.4 26.9-31.1 72.3-4.4 101.3c14.8 16.2 61.2 41.2 101.5 4.4l8.2-7.5l108.2 87.8c3.4 2.8 3.9 7.9 1.2 11.3zm106-40.8h-69.2c-2.3-2.8-4.9-5.4-7.7-7.7l-102.7-83.4l12.5-11.4c6.5-6 7-16.1 1-22.6L367 167.1c-6-6.5-16.1-6.9-22.6-1l-55.2 50.6c-9.5 8.7-25.7 9.4-34.6 0c-9.3-9.9-8.5-25.1 1.2-33.9l65.6-60.1c7.4-6.8 17-10.5 27-10.5l83.7-.2c2.1 0 4.1.8 5.5 2.3l61.7 61.6H544zm48 47.7c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16c0 8.9-7.2 16-16 16z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Kinh Nghiệm Giao Dịch Thực Tế</div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">Thực Chiến 63 Tỉnh Thành</div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Đúc kết từ kinh nghiệm thực tiễn của đội ngũ quản trị và mạng lưới môi giới chuyên nghiệp: Hướng dẫn đàm phán giá, kiểm tra quy hoạch và phòng ngừa rủi ro đặt cọc.
                    </p>
                  </div>
                </div>

                {/* Trụ cột 3: Nguồn tin uy tín */}
                <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex items-start gap-3.5 hover:border-slate-600 transition">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0 font-black shadow-xs">
                    <i className="fa-solid fa-newspaper"></i>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Tổng Hợp Đa Nguồn Tin Cậy</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">Báo Chí & Dữ Liệu Thị Trường</div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Dữ liệu biến động giá và thông tin dự án được tổng hợp, kiểm chứng chéo từ các cơ quan báo chí kinh tế uy tín (VnExpress, CafeF, Báo Xây Dựng) trước khi biên tập lại.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            H2: Vì Sao Nên Lựa Chọn Kênh Nhà Đất 24H?
           ===================================================================== */}
        <div className="mb-6 sm:mb-8">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug text-center">
              Vì Sao Nên Lựa Chọn Kênh Nhà Đất 24H?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto text-center">
              Kênh Nhà Đất 24H tự hào là cổng thông tin và nền tảng giao dịch bất động sản uy tín, được xây dựng dựa trên các tiêu chuẩn kiểm duyệt khắt khe nhằm bảo đảm dòng tiền an toàn cho nhà đầu tư, đồng thời tối đa hóa tính thanh khoản cho chủ sở hữu. Chúng tôi mang đến hệ sinh thái kết nối minh bạch, toàn diện cho mọi nhu cầu mua bán nhà đất và cho thuê bất động sản trên toàn quốc nhờ vào các giải pháp công nghệ thông minh cùng những thế mạnh vượt trội dưới đây.
            </p>
          </div>

          {/* 3 Premium Feature Cards - Phong cách Hiện Đại & Đáng Tin Cậy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Card 1: Hệ thống danh mục đa dạng */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-red-200 transition-colors select-none">
                    01
                  </span>
                </div>

                <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1.5">
                  Đa Dạng Danh Mục
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3 group-hover:text-red-600 transition-colors">
                  Hệ thống danh mục mua bán nhà đất và cho thuê bất động sản đa dạng
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-normal">
                  Nhằm đáp ứng trọn vẹn mọi phân khúc của thị trường, Kênh Nhà Đất 24H cung cấp hệ thống tin đăng phong phú, phân loại khoa học theo từng nhu cầu giao dịch thực tế. Người dùng có thể dễ dàng tìm thấy các dự án mua bán nhà đất từ căn hộ chung cư cao cấp, nhà phố mặt tiền, đất nền thổ cư cho đến các mặt bằng kinh doanh hay văn phòng cho thuê bất động sản. Mọi thông tin đều được kiểm duyệt chặt chẽ, giúp các nhà đầu tư và khách hàng nhanh chóng tiếp cận nguồn hàng chất lượng, an tâm xuống tiền đầu tư hoặc an cư.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
                <i className="fa-solid fa-circle-check text-red-500 text-xs"></i>
                <span>Phân loại chuẩn hóa hơn 10+ loại hình BĐS</span>
              </div>
            </div>

            {/* Card 2: Bộ lọc thông minh */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-amber-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-filter"></i>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-amber-200 transition-colors select-none">
                    02
                  </span>
                </div>

                <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">
                  Bộ Lọc Thông Minh
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3 group-hover:text-amber-600 transition-colors">
                  Bộ lọc thông minh tìm kiếm nhà đất theo khu vực và ngân sách
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-normal">
                  Hệ thống tích hợp bộ lọc công nghệ tiên tiến, giúp người dùng rút ngắn tối đa thời gian tìm kiếm sản phẩm phù hợp. Bạn có thể chủ động sàng lọc thông tin mua bán nhà đất hoặc danh mục cho thuê bất động sản một cách chính xác tuyệt đối theo vị trí tỉnh thành, quận huyện, diện tích, hướng nhà và khoảng giá tài chính cụ thể. Tính năng vượt trội này giúp các nhà đầu tư nắm bắt nhanh chóng các cơ hội sinh lời cao và hỗ trợ khách hàng cá nhân sớm tìm được nơi an cư lý tưởng trong tầm giá.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
                <i className="fa-solid fa-circle-check text-amber-500 text-xs"></i>
                <span>Tìm kiếm chính xác theo 63 tỉnh thành & tài chính</span>
              </div>
            </div>

            {/* Card 3: Nền tảng đăng tin nhanh chóng */}
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <i className="fa-solid fa-paper-plane"></i>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors select-none">
                    03
                  </span>
                </div>

                <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
                  Đăng Tin Nhanh Chóng
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3 group-hover:text-emerald-600 transition-colors">
                  Nền tảng đăng tin bất động sản trực tuyến nhanh chóng, hiệu quả
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-normal">
                  Đối với các chính chủ và nhà môi giới đang cần thúc đẩy giao dịch mua bán nhà đất hoặc tìm khách cho thuê bất động sản, Kênh Nhà Đất 24H chính là bệ phóng thanh khoản tối ưu nhất. Với giao diện đăng tin trực tuyến được thiết kế tối giản, trực quan và tối ưu hóa hiển thị trên mọi thiết bị, tin đăng của bạn sẽ ngay lập tức tiếp cận đến hàng triệu lượt truy cập của khách hàng tiềm năng mỗi ngày, từ đó nâng cao tỷ lệ chốt giao dịch thành công trong thời gian ngắn nhất.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                <span>Tiếp cận hàng triệu lượt khách hàng tiềm năng</span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            H2: Câu Hỏi Thường Gặp Về Mua Bán Và Cho Thuê Nhà Đất
           ===================================================================== */}
        <div className="mb-4">
          <div className="text-center max-w-4xl mx-auto mb-6 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug text-center">
              Câu Hỏi Thường Gặp Về Mua Bán Và Cho Thuê Nhà Đất
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto text-center">
              Giải đáp nhanh các thắc mắc phổ biến của người dùng về việc đăng tin, tìm kiếm, liên hệ người bán và quản lý giao dịch bất động sản trên hệ thống Kênh Nhà Đất 24H.
            </p>
          </div>

          <div className="space-y-3.5 max-w-4xl mx-auto">
            {/* Câu hỏi 1 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Kênh Nhà Đất 24H có hỗ trợ đăng tin bất động sản miễn phí không?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Có. Kênh Nhà Đất 24H hỗ trợ người dùng đăng tin Tin Thường hoàn toàn miễn phí với thời hạn hiển thị lên đến 60 ngày. Ngoài ra, nếu có nhu cầu gia tăng tỷ lệ tiếp cận người mua và thanh khoản nhanh chóng, bạn có thể lựa chọn nâng cấp các <Link to="/bang-gia-tin-dang" className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300">gói tin VIP</Link> (VIP Kim Cương, VIP Vàng, VIP Bạc) với vị trí ưu tiên và nhãn nhận diện nổi bật trên toàn sàn.
              </div>
            </details>

            {/* Câu hỏi 2 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Làm thế nào để đăng tin mua bán nhà đất?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Bạn chỉ cần nhấp vào nút <Link to="/dang-tin" className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300">"Đăng tin"</Link> tại góc trên màn hình hoặc tham khảo <Link to="/huong-dan-dang-tin" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">hướng dẫn đăng tin</Link>. Hãy nhập đầy đủ thông tin: nhu cầu giao dịch (Bán hoặc Cho thuê), loại hình nhà đất, địa chỉ chi tiết, diện tích, giá bán, tải lên hình ảnh chụp thực tế và số điện thoại liên hệ. Sau khi xác nhận hoàn tất, hệ thống sẽ tiến hành kiểm duyệt tự động và kích hoạt hiển thị tin đăng trên website.
              </div>
            </details>

            {/* Câu hỏi 3 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Làm thế nào để tìm kiếm bất động sản theo tỉnh thành?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Bạn có thể tra cứu nhà đất theo địa phương qua 2 cách nhanh chóng: (1) Sử dụng bộ lọc thông minh tại đầu trang chủ để chọn Tỉnh/Thành phố và Quận/Huyện mong muốn; hoặc (2) Cuộn xuống khu vực <strong>"Tìm Kiếm Bất Động Sản Theo Tỉnh Thành"</strong> và nhấp trực tiếp vào Card của tỉnh thành bạn quan tâm (như <Link to="/nha-dat-ban-ho-chi-minh" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">TP. Hồ Chí Minh</Link>, <Link to="/nha-dat-ban-ha-noi" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Hà Nội</Link>, <Link to="/nha-dat-ban-da-nang" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Đà Nẵng</Link>, <Link to="/nha-dat-ban-hai-phong" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Hải Phòng</Link>...) để xem ngay danh sách toàn bộ tin đăng tại khu vực đó.
              </div>
            </details>

            {/* Câu hỏi 4 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Website có những loại hình bất động sản nào?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Kênh Nhà Đất 24H phân loại khoa học đầy đủ các loại hình sản phẩm trên thị trường, bao gồm: <Link to="/ban-can-ho-chung-cu" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Căn hộ chung cư</Link>, <Link to="/ban-chung-cu-mini" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Chung cư mini</Link>, <Link to="/ban-nha-rieng" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Nhà riêng, nhà phố</Link>, <Link to="/ban-nha-biet-thu-lien-ke" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Biệt thự, liền kề</Link>, <Link to="/ban-nha-mat-pho" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Nhà mặt phố kinh doanh</Link>, <Link to="/ban-shophouse" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Shophouse thương mại</Link>, <Link to="/ban-dat-nen-du-an" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Đất nền dự án</Link>, <Link to="/ban-dat" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300">Đất thổ cư</Link>, Trang trại & Khu nghỉ dưỡng, Kho bãi và Nhà xưởng tiêu chuẩn công nghiệp.
              </div>
            </details>

            {/* Câu hỏi 5 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Làm thế nào để liên hệ với người đăng tin?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Tại trang chi tiết của mỗi bất động sản hoặc trên thẻ tin xem nhanh, hệ thống hiển thị rõ ràng số điện thoại của người bán/môi giới. Bạn có thể nhấn trực tiếp vào nút <strong>"Gọi điện"</strong> để kết nối thoại ngay hoặc bấm nút <strong>"Chat Zalo"</strong> để trò chuyện trực tiếp 1-chạm, thỏa thuận mức giá và đặt lịch đi xem thực tế căn nhà mà không phải trả bất kỳ khoản phí trung gian nào.
              </div>
            </details>

            {/* Câu hỏi 6 */}
            <details className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
              <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-bold text-slate-800 text-sm sm:text-base list-none select-none">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Làm thế nào để chỉnh sửa hoặc gỡ tin đã đăng?
                </h3>
                <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform shrink-0"></i>
              </summary>
              <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3.5">
                Bạn hãy đăng nhập vào tài khoản cá nhân, nhấp vào tên tài khoản và chọn mục <Link to="/quan-ly-tin" className="text-blue-600 hover:text-blue-800 font-bold underline decoration-blue-300">"Quản lý tin"</Link>. Tại bảng điều khiển danh sách tin đăng, bạn có thể dễ dàng chọn nút <strong>"Chỉnh sửa"</strong> để cập nhật mức giá, bổ sung ảnh hay thay đổi nội dung mô tả; hoặc chọn nút <strong>"Hạ tin / Đã giao dịch"</strong> khi bất động sản đã bán/cho thuê thành công để ngừng nhận cuộc gọi.
              </div>
            </details>
          </div>
        </div>

      </div>
    </section>
  );
}
