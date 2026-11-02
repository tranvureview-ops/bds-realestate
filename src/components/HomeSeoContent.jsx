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
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 border-t border-slate-100">
      <div className="prose prose-slate max-w-none">

        {/* =====================================================================
            H2: Thị Trường Mua Bán & Cho Thuê Theo Khu Vực
           ===================================================================== */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Thị Trường Mua Bán & Cho Thuê Nhà Đất 24H Theo Khu Vực
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          Mạng lưới dữ liệu của Kênh Nhà Đất 24h bao phủ toàn diện 63 tỉnh thành, phân tách theo động lực phát triển kinh tế từng vùng:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {/* H3 – HN & HCM */}
          <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              <Link to="/nha-dat-ban" className="hover:text-red-600 transition-colors">
                Giao Dịch Bất Động Sản Hà Nội & TP. Hồ Chí Minh
              </Link>
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Cập nhật liên tục biến động giá bán và giá thuê tại các quận trung tâm cũng như các khu đô thị vệ tinh. Phân khúc{' '}
              <Link to="/nha-dat-cho-thue" className="text-red-600 hover:underline font-medium">căn hộ dịch vụ, văn phòng cho thuê</Link>{' '}
              và nhà riêng sở hữu biên độ lợi nhuận khai thác dòng tiền từ 4% – 7%/năm.
            </p>
          </div>

          {/* H3 – Miền Trung */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              <Link to="/ban-can-ho-chung-cu-da-nang" className="hover:text-blue-600 transition-colors">
                Điểm Nóng Nhà Đất Đà Nẵng, Quảng Nam & Khu Vực Miền Trung
              </Link>
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Tập trung khai thác bất động sản ven sông Hàn, đô thị Nam Hòa Xuân, căn hộ biển Sơn Trà, Ngũ Hành Sơn và{' '}
              <Link to="/ban-dat-nen-du-an-da-nang" className="text-blue-600 hover:underline font-medium">quỹ đất thương mại dịch vụ ven sông Cổ Cò (Hội An)</Link>.{' '}
              Đây là những khu vực có tính thanh khoản cao nhờ tốc độ phục hồi du lịch và định hướng quy hoạch trung tâm tài chính quốc tế.
            </p>
          </div>

          {/* H3 – Tỉnh thành tiềm năng */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Thị Trường Tiềm Năng Tại Các Tỉnh Thành Phát Triển
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Theo dõi sát sao quỹ đất công nghiệp, đất vùng ven đón đầu các trục cao tốc Bắc – Nam, sân bay và các vành đai đô thị công nghiệp tại Bình Dương, Đồng Nai, Long An, Hải Phòng và Bắc Ninh.
            </p>
          </div>
        </div>

        {/* =====================================================================
            H2: Nền Tảng Giao Dịch Đáng Tin Cậy
           ===================================================================== */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Nền Tảng Giao Dịch Bất Động Sản Trực Tuyến Đáng Tin Cậy
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {/* H3 – Kiểm Duyệt */}
          <div className="flex flex-col gap-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Kiểm Duyệt Tin Đăng Xác Thực & Tránh Rủi Ro Pháp Lý
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hệ thống áp dụng quy trình kiểm soát tin đăng hai lớp: thuật toán tự động quét trùng lặp dữ liệu và đội ngũ kiểm duyệt thực địa xác minh tọa độ, hình ảnh thực tế và giấy tờ quyền sử dụng đất. Tiêu chí này loại bỏ tình trạng tin ảo, giá mồi hoặc sai lệch hiện trạng quy hoạch.
            </p>
          </div>

          {/* H3 – Định Giá */}
          <div className="flex flex-col gap-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Công Cụ Định Giá Bất Động Sản Và Cập Nhật Xu Hướng Đầu Tư
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Kenhnhadat24h.com.vn tích hợp module phân tích lịch sử giao dịch và dữ liệu so sánh giá theo từng cung đường, tuyến phố. Tính năng dự đoán và tham chiếu giá bất động sản hỗ trợ cả bên mua lẫn bên bán xác định điểm cân bằng thị trường, hạn chế tình trạng định giá lệch biên độ.
            </p>
          </div>

          {/* H3 – Môi Giới */}
          <div className="flex flex-col gap-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Giải Pháp Đăng Tin Mua Bán Nhà Đất Nhanh Chóng Cho Môi Giới
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Hệ sinh thái công cụ hỗ trợ môi giới bao gồm: quản lý giỏ hàng, đo lường lượt tiếp cận khách hàng tiềm năng theo thời gian thực và liên kết trực tiếp ứng dụng nhắn tin (Zalo, cuộc gọi thoại) với khách hàng có nhu cầu thực tế.
            </p>
          </div>
        </div>

        {/* =====================================================================
            H2: Cẩm Nang & Hỏi Đáp Pháp Lý
           ===================================================================== */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-5">
          Cẩm Nang & Hỏi Đáp Pháp Lý Giao Dịch Nhà Đất Thực Chiến
        </h2>

        <div className="space-y-4 mb-4">
          <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm">
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-semibold text-slate-800 text-sm sm:text-base list-none select-none">
              <span>
                <i className="fa-solid fa-file-contract text-red-500 mr-2"></i>
                Quy trình thẩm định sổ hồng trước khi đặt cọc
              </span>
              <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              Cách đối chiếu trích lục bản đồ địa chính, kiểm tra quy hoạch phân khu tại cơ quan tài nguyên môi trường địa phương để tránh mua phải diện tích dính hành lang an toàn công trình. Đảm bảo sổ hồng riêng, không vướng tranh chấp và chỉ giới quy hoạch đường bộ rõ ràng trước khi ký hợp đồng đặt cọc.
            </div>
          </details>

          <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm">
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-semibold text-slate-800 text-sm sm:text-base list-none select-none">
              <span>
                <i className="fa-solid fa-receipt text-amber-500 mr-2"></i>
                Chi phí thuế, phí chuyển nhượng quyền sử dụng đất
              </span>
              <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              Hướng dẫn chi tiết cách tính thuế thu nhập cá nhân (2%), lệ phí trước bạ (0.5%), phí công chứng và các thủ tục sang tên đổi chủ đúng hạn định pháp luật. Nắm rõ các khoản phí này giúp người mua tránh phát sinh chi phí ẩn ngoài hợp đồng.
            </div>
          </details>

          <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm">
            <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-semibold text-slate-800 text-sm sm:text-base list-none select-none">
              <span>
                <i className="fa-solid fa-piggy-bank text-emerald-500 mr-2"></i>
                Kinh nghiệm vay mua nhà an toàn tài chính
              </span>
              <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              Công thức tính toán đòn bẩy tài chính với tỷ lệ nợ trên thu nhập (DTI), phương án lựa chọn gói lãi suất cố định dài hạn thay vì phụ thuộc biên độ thả nổi rủi ro. Tỷ lệ DTI an toàn không vượt quá 40% tổng thu nhập hộ gia đình.
            </div>
          </details>
        </div>

      </div>
    </section>
  );
}
