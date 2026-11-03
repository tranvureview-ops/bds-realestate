'use client';

import React from 'react';

/**
 * HomeSeoContent – Khối nội dung On-page SEO trang chủ
 * Cấu trúc H2/H3 theo brief kỹ thuật SEO từ Giám đốc Technical SEO.
 * Mọi heading, body text và anchor text phải được giữ nguyên.
 */
export default function HomeSeoContent() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-10 sm:pb-14 border-t border-slate-100">
      <div className="prose prose-slate max-w-none">

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
