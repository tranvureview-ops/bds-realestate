'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles';
import { useRealEstate } from '../context/RealEstateContext';

/**
 * Helper tạo danh sách số trang có dấu ba chấm thông minh
 */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

/**
 * Bộ câu hỏi thường gặp FAQ chuẩn AIO & GEO Search (Tổng quan)
 */
const KNOWLEDGE_FAQS = [
  {
    question: 'Làm thế nào để tra cứu thông tin quy hoạch đất đai trực tuyến chính xác 100%?',
    answer: 'Bạn có thể tra cứu thông tin quy hoạch trực tuyến qua các ứng dụng chính thống của Sở Tài nguyên và Môi trường từng tỉnh thành (như Thông tin Quy hoạch TP.HCM, Quy hoạch Hà Nội, Guland, Meey Map). Tuy nhiên, trước khi đặt cọc số tiền lớn, bạn bắt buộc nên nộp Phiếu yêu cầu cung cấp dữ liệu đất đai tại Văn phòng Đăng ký Đất đai cấp quận/huyện để nhận văn bản trích lục pháp lý có dấu đỏ chuẩn xác nhất.'
  },
  {
    question: 'Quy trình sang tên chuyển nhượng sổ hồng/sổ đỏ theo Luật Đất đai mới gồm các bước nào?',
    answer: 'Quy trình chuẩn gồm 4 bước bắt buộc: (1) Kiểm tra thực địa và hồ sơ pháp lý tài sản; (2) Công chứng hợp đồng mua bán chuyển nhượng tại Văn phòng Công chứng; (3) Kê khai và nộp thuế thu nhập cá nhân (2%) cùng lệ phí trước bạ (0.5%); (4) Nộp hồ sơ đăng ký biến động tại Chi nhánh Văn phòng Đăng ký Đất đai để nhận sổ mang tên bạn.'
  },
  {
    question: 'Bí quyết thương lượng giá nhà đất giúp tiết kiệm chi phí hiệu quả cho người mua?',
    answer: 'Hãy khảo sát mặt bằng giá của ít nhất 3 - 5 căn nhà tương đồng trong bán kính 1km, tìm hiểu kỹ lý do bán (cần tiền gấp, dọn đi nơi khác hay cơ cấu vốn), chỉ ra các điểm trừ thực tế (hướng nắng gắt, ngõ hẹp, cần tu sửa) và chứng minh năng lực tài chính sẵn sàng đặt cọc ngay nếu được giá hợp lý.'
  },
  {
    question: 'Cẩm nang và kinh nghiệm trên Kênh Nhà Đất 24H được tổng hợp từ nguồn nào?',
    answer: 'Các bài viết, cẩm nang và kinh nghiệm trên Kênh Nhà Đất 24H được ban biên tập tổng hợp và chọn lọc kỹ lưỡng từ các nguồn thông tin thị trường uy tín, văn bản quy phạm pháp luật hiện hành và chia sẻ thực tế từ cộng đồng nhà đầu tư, người mua nhà.'
  }
];

/**
 * Bộ câu hỏi FAQ chuyên sâu về Thị Trường BĐS (AIO & GEO Search)
 */
const MARKET_FAQS = [
  {
    question: 'Diễn biến thị trường bất động sản năm 2026 có những xu hướng nào nổi bật?',
    answer: 'Thị trường bất động sản năm 2026 ghi nhận sự phục hồi vững chắc với dòng vốn ưu tiên các sản phẩm đáp ứng nhu cầu ở thực (căn hộ chung cư, nhà phố có sẵn dòng tiền cho thuê) và đất nền pháp lý sổ đỏ hoàn chỉnh tại các khu vực đón đầu hạ tầng giao thông lớn.'
  },
  {
    question: 'Phân khúc bất động sản nào đang có tính thanh khoản và tỷ suất dòng tiền tốt nhất?',
    answer: 'Phân khúc căn hộ chung cư trung cấp tại các đô thị lớn như Hà Nội, TP.HCM và Đà Nẵng đang dẫn đầu về thanh khoản và tỷ suất lợi nhuận cho thuê ổn định từ 4.5% - 6.2%/năm. Tiếp theo là nhà riêng mặt ngõ và đất nền phân lô pháp lý sạch tại các vùng ven.'
  },
  {
    question: 'Tác động của Luật Đất đai 2024 và bảng giá đất mới đến thị trường nhà đất ra sao?',
    answer: 'Luật Đất đai 2024 và việc áp dụng bảng giá đất mới sát giá thị trường giúp minh bạch hóa nghĩa vụ tài chính, bảo vệ quyền lợi người mua và thanh lọc các dự án yếu kém, thúc đẩy thị trường phát triển bền vững và giảm thiểu rủi ro đầu cơ lướt sóng.'
  },
  {
    question: 'Làm thế nào để theo dõi và cập nhật thông tin thị trường BĐS chuẩn xác nhất trên Kênh Nhà Đất 24H?',
    answer: 'Bạn có thể truy cập thường xuyên chuyên mục Thị trường trên Kênh Nhà Đất 24H để cập nhật các báo cáo biến động giá nhà đất theo từng khu vực, khảo sát nguồn cung thực tế và tham gia công cụ Dự đoán giá BĐS để nhận định mặt bằng giá mới nhất.'
  }
];

/**
 * Bộ câu hỏi FAQ chuyên sâu về Kinh Nghiệm Mua Bán & Đầu Tư BĐS
 */
const EXPERIENCE_FAQS = [
  {
    question: 'Người mua nhà đất lần đầu cần lưu ý những kinh nghiệm quan trọng nào?',
    answer: 'Người mua nhà lần đầu cần chú trọng 4 yếu tố cốt lõi: (1) Kiểm tra kỹ pháp lý (sổ đỏ/sổ hồng riêng, không tranh chấp, không dính quy hoạch); (2) Khảo sát thực địa nhiều lần vào các khung giờ khác nhau (giờ cao điểm, ban đêm, khi trời mưa); (3) Định giá so sánh với ít nhất 3 bất động sản lân cận; (4) Chuẩn bị phương án tài chính vững chắc, chỉ nên vay tối đa 40% - 50% giá trị tài sản.'
  },
  {
    question: 'Làm thế nào để đàm phán, thương lượng được mức giá tốt nhất khi mua nhà đất?',
    answer: 'Để thương lượng hiệu quả, hãy tìm hiểu động cơ bán của chủ nhà (cần tiền gấp hay chỉ bán thăm dò), chỉ ra các chi phí sửa chữa hoặc nhược điểm phong thủy/hạ tầng một cách lịch sự để khấu trừ vào giá, đồng thời thể hiện thiện chí bằng việc sẵn sàng đặt cọc nhanh nếu đạt được mức giá kỳ vọng.'
  },
  {
    question: 'Kinh nghiệm vay ngân hàng mua nhà trả góp an toàn dòng tiền là gì?',
    answer: 'Áp dụng nguyên tắc vàng: số tiền trả nợ gốc và lãi hàng tháng không nên vượt quá 40% tổng thu nhập ổn định của gia đình. Luôn ưu tiên gói vay có thời gian ưu đãi lãi suất dài (1 - 3 năm), nắm rõ biên độ lãi suất thả nổi sau ưu đãi và phí phạt trả nợ trước hạn.'
  },
  {
    question: 'Có nên mua căn hộ chung cư chưa có sổ hồng và cần kiểm tra những gì?',
    answer: 'Nếu mua căn hộ chưa có sổ, bạn chỉ nên giao dịch các dự án đã được cấp phép mở bán chính thức, có bảo lãnh ngân hàng và hợp đồng mua bán trực tiếp với chủ đầu tư uy tín. Cần kiểm tra kỹ tiến độ hoàn công, nghiệm thu PCCC và giữ lại một khoản tiền (thường 5%) thanh toán khi nhận sổ chính thức.'
  }
];

/**
 * Bộ câu hỏi FAQ chuyên sâu về Pháp Lý & Quy Hoạch BĐS
 */
const LEGAL_FAQS = [
  {
    question: 'Quy trình và thủ tục sang tên sổ đỏ, sổ hồng căn hộ hoặc đất thổ cư mất bao lâu?',
    answer: 'Theo quy định hiện hành, thời gian thực hiện thủ tục đăng ký biến động (sang tên sổ đỏ/sổ hồng) từ 10 - 15 ngày làm việc kể từ ngày cơ quan Đăng ký đất đai tiếp nhận đủ hồ sơ hợp lệ. Quy trình gồm 4 bước: (1) Kiểm tra pháp lý; (2) Công chứng hợp đồng mua bán; (3) Kê khai và nộp thuế TNCN (2%), lệ phí trước bạ (0.5%); (4) Nhận Giấy chứng nhận đã cập nhật biến động.'
  },
  {
    question: 'Làm thế nào để kiểm tra nhà đất có bị dính quy hoạch treo hoặc bị tranh chấp, thế chấp ngân hàng?',
    answer: 'Trước khi đặt cọc, bạn cần: (1) Kiểm tra bản chính Giấy chứng nhận (xem trang 3 và trang 4 có đóng dấu thế chấp ngân hàng không); (2) Tra cứu ứng dụng quy hoạch của Sở Quy hoạch - Kiến trúc địa phương hoặc xin trích lục quy hoạch tại Văn phòng Đăng ký đất đai; (3) Yêu cầu Văn phòng Công chứng kiểm tra trên phần mềm quản lý hồ sơ giao dịch UCHI xem tài sản có đang bị ngăn chặn giao dịch hay không.'
  },
  {
    question: 'Hợp đồng đặt cọc mua bán nhà đất viết tay có hiệu lực pháp lý không?',
    answer: 'Bộ luật Dân sự 2015 không bắt buộc hợp đồng đặt cọc phải công chứng, nên hợp đồng đặt cọc viết tay vẫn có giá trị pháp lý nếu hai bên có đầy đủ năng lực hành vi dân sự và hoàn toàn tự nguyện. Tuy nhiên, để phòng tránh rủi ro lật cọc, tranh chấp chữ ký hoặc bán một tài sản cho nhiều người, bạn nên thực hiện công chứng hợp đồng đặt cọc tại Văn phòng Công chứng hoặc lập Vi bằng thừa phát lại.'
  },
  {
    question: 'Các khoản thuế, phí và lệ phí bắt buộc phải nộp khi chuyển nhượng bất động sản gồm những gì?',
    answer: 'Giao dịch chuyển nhượng bất động sản thông thường phát sinh: (1) Thuế thu nhập cá nhân 2% tính trên giá trị chuyển nhượng (theo thỏa thuận thường do bên bán nộp); (2) Lệ phí trước bạ 0.5% (thường do bên mua nộp); (3) Phí thẩm định hồ sơ và lệ phí cấp đổi phôi sổ mới (từ 500.000đ - 1.500.000đ tùy địa phương).'
  }
];

/**
 * Component Hiển Thị 3 Cột Danh Mục Trọng Điểm (Category Pillars)
 */
function CategoryPillars({ allCategories, allArticles, activeCategorySlug }) {
  return (
    <section aria-labelledby="category-pillars-heading" className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6">
      <h2 id="category-pillars-heading" className="sr-only">
        Chuyên Mục Kiến Thức & Cẩm Nang Bất Động Sản Trọng Điểm
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allCategories.map(cat => {
          const isCurrent = activeCategorySlug === cat.slug;
          const articleCount = allArticles.filter(a => a.categorySlug === cat.slug).length;

          return (
            <Link
              key={cat.slug}
              to={cat.path || `/kien-thuc/${cat.slug}`}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-300 shadow-xs flex items-center justify-between group hover:-translate-y-0.5 ${
                isCurrent 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  cat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  cat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  <i className={cat.icon || 'fa-solid fa-newspaper'}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                    {cat.shortName || cat.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{articleCount} bài phân tích</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">Cập nhật 2026</span>
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform shrink-0"></i>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Component Hiển Thị Thẻ Bài Viết Cẩm Nang
 */
function ArticleCard({ article, category }) {
  const flatArticleUrl = `/kien-thuc/${article.slug}`;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Article Image Cover */}
      <Link to={flatArticleUrl} className="relative block aspect-video overflow-hidden bg-slate-100">
        <img
          src={article.image || '/hero.png'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
        />
        {category && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${
            category.color === 'blue' ? 'bg-blue-600/90 text-white border-blue-500' :
            category.color === 'amber' ? 'bg-amber-600/90 text-white border-amber-500' :
            'bg-red-600/90 text-white border-red-500'
          }`}>
            {category.shortName || category.name}
          </span>
        )}
      </Link>

      {/* Article Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
            <span><i className="fa-regular fa-calendar mr-1"></i>{article.publishedAt}</span>
            <span>•</span>
            <span><i className="fa-regular fa-clock mr-1"></i>{article.readTime || '6 phút đọc'}</span>
          </div>

          {/* Article Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-2.5">
            <Link to={flatArticleUrl}>
              {article.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Read More & Author Info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="text-xs text-slate-500 font-medium truncate max-w-[180px]">
            <i className="fa-solid fa-user-pen mr-1 text-slate-400"></i>
            <span>{article.author}</span>
          </div>
          <Link
            to={flatArticleUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition"
          >
            <span>Xem chi tiết</span>
            <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Component Hiển Thị Banner Hành Động & Khám Phá Nhà Đất
 */
function KnowledgeActionBanner() {
  return (
    <section className="mt-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
      <div className="relative z-10 max-w-2xl">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-bold border border-emerald-500/30 mb-3">
          CỔNG THÔNG TIN MUA BÁN NHÀ ĐẤT XÁC THỰC
        </span>
        <h2 className="text-xl font-black tracking-tight leading-snug">
          Cập Nhật Tin Tức & Khám Phá Nhà Đất Chính Chủ
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-3 leading-relaxed">
          Tra cứu hàng ngàn bất động sản mua bán và cho thuê được cập nhật liên tục mỗi ngày, hoặc đăng tin miễn phí tiếp cận ngay khách hàng tiềm năng trên Kênh Nhà Đất 24H.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/nha-dat-ban"
            className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-magnifying-glass text-emerald-600"></i>
            <span>Xem Kho Nhà Đất Bán</span>
          </Link>
          <Link
            to="/dang-tin"
            className="px-5 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition border border-emerald-500/40 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus-circle text-emerald-300"></i>
            <span>Đăng Tin Nhà Đất Ngay</span>
          </Link>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </section>
  );
}

/**
 * Component Hiển Thị Bộ Công Cụ Tiện Ích Bất Động Sản (CRO & Internal Links)
 */
function QuickToolsSection() {
  const tools = [
    {
      title: 'Công Cụ Tính Lãi Vay Mua Nhà',
      desc: 'Tính toán nhanh số tiền gốc + lãi trả góp hàng tháng theo dư nợ giảm dần chuẩn xác nhất.',
      icon: 'fa-solid fa-calculator',
      path: '/tinh-lai-vay',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionText: 'Tính lãi vay ngay'
    },
    {
      title: 'Tra Cứu Phong Thủy Bất Động Sản',
      desc: 'Xem hướng nhà, hướng đất và tuổi làm nhà hợp phong thủy rước tài lộc cho gia chủ.',
      icon: 'fa-solid fa-compass',
      path: '/xem-tuoi-mua-dat-xay-nha',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      actionText: 'Tra cứu phong thủy'
    },
    {
      title: 'Dự Đoán Giá BĐS Rinh Thưởng',
      desc: 'Thử tài thẩm định giá nhà đất, tham gia game dự đoán nhận ngay phần thưởng tiền triệu.',
      icon: 'fa-solid fa-trophy',
      path: '/trung-tam-phan-thuong/du-doan-gia-bds',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionText: 'Tham gia dự đoán'
    },
    {
      title: 'Kho Tin Mua Bán Nhà Đất Chính Chủ',
      desc: 'Khám phá hàng ngàn bất động sản có sổ hồng, sổ đỏ riêng, hỗ trợ xem nhà thực tế 24/7.',
      icon: 'fa-solid fa-house-circle-check',
      path: '/nha-dat-ban',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionText: 'Xem tin nhà đất'
    }
  ];

  return (
    <section className="mt-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tiện ích hỗ trợ giao dịch</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Bộ Công Cụ Tiện Ích Hỗ Trợ Đầu Tư Bất Động Sản
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((t, idx) => (
          <Link
            key={idx}
            to={t.path}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 border ${t.color}`}>
                <i className={t.icon}></i>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug mb-2">
                {t.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {t.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{t.actionText}</span>
              <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Component Hiển Thị Tổng Quan Xu Hướng Thị Trường BĐS [2026]
 */
function MarketOverviewSection() {
  const marketHighlights = [
    {
      title: 'Dòng Tiền Ưu Tiên Nhu Cầu Ở Thực',
      desc: 'Căn hộ chung cư và nhà riêng có sẵn dòng tiền cho thuê từ 4.5% - 6.2%/năm đang giữ vai trò dẫn dắt thanh khoản toàn thị trường.',
      icon: 'fa-solid fa-coins',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Đòn Bẩy Từ Hạ Tầng Trọng Điểm',
      desc: 'Tiến độ hoàn thiện các tuyến Vành Đai 3, Vành Đai 4 và mạng lưới cao tốc liên vùng kích hoạt mặt bằng giá mới tại các đô thị vệ tinh.',
      icon: 'fa-solid fa-road',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Minh Bạch Hóa Pháp Lý BĐS',
      desc: 'Khung pháp lý từ Luật Đất Đai 2024 và bảng giá đất mới giúp sàng lọc các dự án yếu kém, bảo vệ an toàn tối đa cho người mua nhà.',
      icon: 'fa-solid fa-scale-balanced',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <section className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Báo cáo tổng hợp</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Tổng Quan Diễn Biến & Động Lực Thị Trường BĐS 2026
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 self-start sm:self-auto">
          <i className="fa-solid fa-chart-line text-[11px]" />
          <span>Dữ liệu thị trường 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {marketHighlights.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-3 border ${item.color}`}>
                <i className={item.icon}></i>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Component Hiển Thị 3 Nguyên Tắc Vàng Khi Mua Bán & Đầu Tư BĐS Thực Chiến
 */
function ExperienceOverviewSection() {
  const experienceHighlights = [
    {
      title: 'Khảo Sát Thực Địa Đa Thời Điểm',
      desc: 'Khảo sát thực địa ít nhất 3 lần vào các thời điểm: giờ cao điểm kẹt xe, ban đêm để đánh giá an ninh và lúc trời mưa to để kiểm tra thoát nước, ngập úng.',
      icon: 'fa-solid fa-map-location-dot',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Thẩm Tra Pháp Lý 3 Lớp',
      desc: 'Luôn đối chiếu sổ đỏ/sổ hồng bản gốc, trích lục quy hoạch tại Văn phòng Đăng ký đất đai và hỏi thăm thông tin hàng xóm trước khi đặt cọc bất kỳ khoản tiền nào.',
      icon: 'fa-solid fa-shield-halved',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Kiểm Soát Tỷ Lệ Đòn Bẩy Dòng Tiền',
      desc: 'Giới hạn tỷ lệ vay nợ không quá 50% giá trị tài sản và số tiền gốc lãi trả nợ hàng tháng không vượt quá 40% tổng thu nhập gia đình để bảo đảm an toàn.',
      icon: 'fa-solid fa-calculator',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  return (
    <section className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Cẩm nang thực chiến</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            3 Nguyên Tắc Vàng Khi Mua Bán & Đầu Tư Bất Động Sản An Toàn
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 self-start sm:self-auto">
          <i className="fa-solid fa-lightbulb text-[11px]" />
          <span>Kinh nghiệm thực tế</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {experienceHighlights.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-3 border ${item.color}`}>
                <i className={item.icon}></i>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Component Hiển Thị 3 Điểm Tựa Pháp Lý Sống Còn Khi Mua Bán & Sở Hữu BĐS
 */
function LegalOverviewSection() {
  const legalHighlights = [
    {
      title: 'Kiểm Tra Bản Gốc Sổ Đỏ / Sổ Hồng',
      desc: 'Luôn xem trực tiếp phôi sổ bản chính, soi dấu nổi, mã vạch và thông tin trang 4 (đăng ký biến động, thế chấp ngân hàng) trước khi chuyển tiền.',
      icon: 'fa-solid fa-certificate',
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      title: 'Xác Minh Quy Hoạch & Tình Trạng Ngăn Chặn',
      desc: 'Tra cứu trực tuyến kết hợp nộp phiếu yêu cầu cung cấp dữ liệu địa chính tại Bộ phận Một cửa để đảm bảo đất không bị kê biên hay dính quy hoạch thu hồi.',
      icon: 'fa-solid fa-map',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Công Chứng Hợp Đồng Giao Dịch Chuẩn Luật',
      desc: 'Ký hợp đồng chuyển nhượng tại Văn phòng Công chứng để được tra cứu ngăn chặn tức thì trên hệ thống UCHI, loại trừ hoàn toàn nguy cơ tranh chấp.',
      icon: 'fa-solid fa-scale-balanced',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <section className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Pháp lý minh bạch</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            3 Điểm Tựa Pháp Lý Sống Còn Khi Giao Dịch Nhà Đất 2026
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200 self-start sm:self-auto">
          <i className="fa-solid fa-scale-balanced text-[11px]" />
          <span>Chuẩn Luật Đất Đai</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {legalHighlights.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-3 border ${item.color}`}>
                <i className={item.icon}></i>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Component Hiển Thị Hỏi Đáp Thường Gặp (FAQ Accordion)
 */
function KnowledgeFaqAccordion({ activeCategorySlug = null }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  };

  const isMarket = activeCategorySlug === 'thi-truong';
  const isExperience = activeCategorySlug === 'kinh-nghiem';
  const isLegal = activeCategorySlug === 'phap-ly';
  const faqs = isMarket ? MARKET_FAQS : (isExperience ? EXPERIENCE_FAQS : (isLegal ? LEGAL_FAQS : KNOWLEDGE_FAQS));
  const sectionTitle = isMarket 
    ? 'Hỏi Đáp Về Diễn Biến & Xu Hướng Thị Trường BĐS' 
    : (isExperience
      ? 'Hỏi Đáp Kinh Nghiệm Mua Bán & Đầu Tư Bất Động Sản Thực Chiến'
      : (isLegal
        ? 'Hỏi Đáp Về Thủ Tục Pháp Lý & Tra Cứu Quy Hoạch Đất Đai'
        : 'Hỏi Đáp & Cẩm Nang Bất Động Sản Thường Gặp'));
  const sectionDesc = isMarket
    ? 'Giải đáp những thắc mắc về chu kỳ dòng tiền, tỷ suất sinh lời cho thuê và tác động của bảng giá đất mới đến giá nhà đất.'
    : (isExperience
      ? 'Tổng hợp kinh nghiệm kiểm tra thực địa, bí quyết đàm phán giá nhà đất và mẹo quản trị dòng tiền vay ngân hàng an toàn.'
      : (isLegal
        ? 'Giải đáp trực tiếp các vướng mắc về quy trình sang tên sổ đỏ, thủ tục đặt cọc mua bán, tra cứu quy hoạch và nghĩa vụ thuế phí nhà đất theo Luật Đất đai hiện hành.'
        : 'Giải đáp trực tiếp những vướng mắc pháp lý, kinh nghiệm thương lượng và quy trình mua bán nhà đất an toàn theo Luật Đất đai hiện hành.'));

  const badgeText = isMarket
    ? 'HỎI ĐÁP THỊ TRƯỜNG BĐS 2026'
    : (isExperience 
      ? 'HỎI ĐÁP KINH NGHIỆM ĐẦU TƯ BĐS' 
      : (isLegal 
        ? 'HỎI ĐÁP PHÁP LÝ & QUY HOẠCH BĐS' 
        : 'HỎI ĐÁP & TRA CỨU NHANH BĐS'));
  const badgeColor = isMarket
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : (isExperience 
      ? 'bg-amber-50 text-amber-800 border-amber-200' 
      : (isLegal 
        ? 'bg-red-50 text-red-800 border-red-200' 
        : 'bg-emerald-50 text-emerald-800 border-emerald-200'));
  const badgeIcon = isMarket
    ? 'fa-solid fa-chart-line text-blue-600'
    : (isExperience 
      ? 'fa-solid fa-lightbulb text-amber-600' 
      : (isLegal 
        ? 'fa-solid fa-scale-balanced text-red-600' 
        : 'fa-solid fa-circle-question text-emerald-600'));

  return (
    <section className="mt-16 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
      <div className="max-w-3xl mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${badgeColor}`}>
          <i className={badgeIcon}></i>
          <span>{badgeText}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {sectionDesc}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-emerald-500/80 bg-emerald-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition"
              >
                <span>{faq.question}</span>
                <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 text-emerald-600' : ''
                }`}></i>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}



/**
 * Component Liên Kết Chân Trang Địa Phương Hóa (Local SEO & Silo Network)
 */
/**
 * Component Liên Kết Chân Trang Tập Trung 3 Thị Trường Trọng Điểm: Hồ Chí Minh, Hà Nội & Đà Nẵng
 */
function LocalSeoLinks() {
  const cityGroups = [
    {
      cityName: 'TP. Hồ Chí Minh',
      badge: 'Sôi Động Nhất',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      icon: 'fa-solid fa-city',
      links: [
        { name: 'Mua Bán Nhà Đất TP.HCM', path: '/nha-dat-ban-ho-chi-minh' },
        { name: 'Bán Căn Hộ Chung Cư TP.HCM', path: '/ban-can-ho-chung-cu-ho-chi-minh' },
        { name: 'Bán Nhà Riêng TP.HCM', path: '/ban-nha-rieng-ho-chi-minh' },
        { name: 'Cho Thuê Nhà Đất TP.HCM', path: '/nha-dat-cho-thue-ho-chi-minh' },
        { name: 'Thuê Căn Hộ TP.HCM', path: '/cho-thue-can-ho-chung-cu-ho-chi-minh' }
      ]
    },
    {
      cityName: 'Thủ Đô Hà Nội',
      badge: 'Trung Tâm Miền Bắc',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'fa-solid fa-landmark',
      links: [
        { name: 'Mua Bán Nhà Đất Hà Nội', path: '/nha-dat-ban-ha-noi' },
        { name: 'Bán Căn Hộ Chung Cư Hà Nội', path: '/ban-can-ho-chung-cu-ha-noi' },
        { name: 'Bán Nhà Riêng Hà Nội', path: '/ban-nha-rieng-ha-noi' },
        { name: 'Cho Thuê Nhà Đất Hà Nội', path: '/nha-dat-cho-thue-ha-noi' },
        { name: 'Thuê Căn Hộ Hà Nội', path: '/cho-thue-can-ho-chung-cu-ha-noi' }
      ]
    },
    {
      cityName: 'TP. Đà Nẵng',
      badge: 'Đô Thị Biển Đáng Sống',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'fa-solid fa-water',
      links: [
        { name: 'Mua Bán Nhà Đất Đà Nẵng', path: '/nha-dat-ban-da-nang' },
        { name: 'Bán Đất Nền Đà Nẵng', path: '/ban-dat-da-nang' },
        { name: 'Bán Căn Hộ Đà Nẵng', path: '/ban-can-ho-chung-cu-da-nang' },
        { name: 'Cho Thuê Nhà Đất Đà Nẵng', path: '/nha-dat-cho-thue-da-nang' }
      ]
    }
  ];

  return (
    <nav aria-labelledby="local-seo-heading" className="mt-16 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Thị trường trọng điểm</span>
          <h2 id="local-seo-heading" className="text-xl font-bold text-slate-900 mt-0.5">
            Khám Phá Nhà Đất Mua Bán & Cho Thuê: Hồ Chí Minh, Hà Nội & Đà Nẵng
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Tra cứu nhanh tin đăng xác thực tại 3 trung tâm bất động sản lớn nhất
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {cityGroups.map((group, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className={`${group.icon} text-emerald-600 text-xs`}></i>
                  <span>{group.cityName}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}>
                  {group.badge}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.path}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-400 text-xs text-slate-700 hover:text-emerald-700 font-medium transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * KnowledgeHubPage
 * Hiển thị trang chủ Kiến thức (/kien-thuc) hoặc trang Danh mục cha (/kien-thuc/thi-truong, v.v.)
 */
export default function KnowledgeHubPage({ activeCategorySlug = null }) {
  const { articlesList, articleCategories } = useRealEstate();

  const allCategories = (articleCategories && articleCategories.length > 0) 
    ? articleCategories 
    : KNOWLEDGE_CATEGORIES;

  const allArticles = (articlesList && articlesList.length > 0)
    ? articlesList.filter(a => a.status !== 'draft')
    : KNOWLEDGE_ARTICLES;

  const activeCategory = activeCategorySlug 
    ? allCategories.find(c => c.slug === activeCategorySlug)
    : null;

  const filteredArticles = activeCategorySlug
    ? allArticles.filter(a => a.categorySlug === activeCategorySlug)
    : allArticles;

  // Phân trang bài viết phía độc giả (9 bài/trang tương ứng 3 hàng lưới 3 cột)
  const ARTICLES_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef(null);

  // Khi chuyển đổi danh mục, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategorySlug]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedArticles = useMemo(() => {
    const start = (safePage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(start, start + ARTICLES_PER_PAGE);
  }, [filteredArticles, safePage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
              <i className="fa-solid fa-house"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            {activeCategory ? (
              <>
                <Link to="/kien-thuc" className="hover:text-emerald-700 transition">
                  Kiến thức & Cẩm nang
                </Link>
                <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
                <span className="text-slate-900 font-bold">{activeCategory.shortName || activeCategory.name}</span>
              </>
            ) : (
              <span className="text-slate-900 font-bold">Kiến thức & Cẩm nang BĐS</span>
            )}
          </nav>
        </div>
      </div>

      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 pt-8 pb-10 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
              <i className={
                activeCategorySlug === 'thi-truong' ? 'fa-solid fa-chart-line text-emerald-600' :
                activeCategorySlug === 'kinh-nghiem' ? 'fa-solid fa-lightbulb text-emerald-600' :
                activeCategorySlug === 'phap-ly' ? 'fa-solid fa-scale-balanced text-emerald-600' :
                'fa-solid fa-newspaper text-emerald-600'
              }></i>
              <span>{
                activeCategorySlug === 'thi-truong' ? 'THỊ TRƯỜNG & DỰ BÁO GIÁ NHÀ ĐẤT 2026' :
                activeCategorySlug === 'kinh-nghiem' ? 'CẨM NANG & KINH NGHIỆM MUA BÁN BĐS THỰC CHIẾN' :
                activeCategorySlug === 'phap-ly' ? 'CẨM NANG PHÁP LÝ & QUY HOẠCH BĐS 2026' :
                'TỔNG HỢP TIN TỨC & KINH NGHIỆM BẤT ĐỘNG SẢN'
              }</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {activeCategorySlug === 'thi-truong' 
                ? 'Thông Tin Thị Trường Bất Động Sản & Dự Báo Dòng Tiền 2026' 
                : (activeCategorySlug === 'kinh-nghiem'
                  ? 'Kinh Nghiệm Mua Bán Nhà Đất & Đầu Tư Thực Chiến 2026'
                  : (activeCategorySlug === 'phap-ly'
                    ? 'Kiến Thức Pháp Lý & Quy Hoạch Bất Động Sản 2026'
                    : (activeCategory ? activeCategory.name : 'Kiến Thức & Cẩm Nang Bất Động Sản')))}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {activeCategorySlug === 'thi-truong'
                ? 'Cập nhật liên tục diễn biến mặt bằng giá, báo cáo cung cầu thực tế, phân tích động lực hạ tầng và xu hướng chuyển dịch dòng tiền trên thị trường bất động sản toàn quốc mới nhất.'
                : (activeCategorySlug === 'kinh-nghiem'
                  ? 'Cẩm nang thực chiến đúc kết từ thực tế thị trường: bí quyết thương lượng giá mua bán, kinh nghiệm mua chung cư lần đầu, mẹo kiểm tra thực địa đa khung giờ và chiến lược quản trị dòng vốn an toàn.'
                  : (activeCategorySlug === 'phap-ly'
                    ? 'Tổng hợp hướng dẫn quy trình làm sổ đỏ, sổ hồng, thủ tục sang tên chuyển nhượng, cách tra cứu thông tin quy hoạch đất đai trực tuyến và các mẫu hợp đồng giao dịch chuẩn Luật Đất đai mới nhất.'
                    : (activeCategory 
                      ? activeCategory.description 
                      : 'Tổng hợp và cập nhật liên tục các diễn biến giá cả thị trường, kinh nghiệm mua bán đầu tư thực tế, cẩm nang pháp lý và tra cứu quy hoạch giúp bạn tham khảo thông tin chuẩn xác và đưa ra quyết định giao dịch an toàn.')))}
            </p>
          </div>
        </div>
      </section>

      {/* 3 DANH MỤC TRỌNG ĐIỂM (Category Pillars) */}
      <CategoryPillars
        allCategories={allCategories}
        allArticles={allArticles}
        activeCategorySlug={activeCategorySlug}
      />

      {/* Main Content Area */}
      <div ref={gridTopRef} className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 scroll-mt-24">
        {/* Khối Báo Cáo Chuyên Sâu Theo Từng Danh Mục */}
        {activeCategorySlug === 'thi-truong' && <MarketOverviewSection />}
        {activeCategorySlug === 'kinh-nghiem' && <ExperienceOverviewSection />}
        {activeCategorySlug === 'phap-ly' && <LegalOverviewSection />}

        {/* Article Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {activeCategory ? `Chuyên mục ${activeCategory.shortName || activeCategory.name}` : 'Tất cả bài viết thực chiến'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {activeCategory ? `Bài Viết & Báo Cáo ${activeCategory.name}` : 'Bài Viết & Báo Cáo Phân Tích Thực Chiến Mới Nhất 2026'}
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Có tổng cộng <strong className="text-slate-900">{filteredArticles.length}</strong> bài viết
          </div>
        </div>

        {/* Article Grid - Flat URLs (/kien-thuc/[slug]) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.length === 0 ? (
            <div className="col-span-full py-16 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
                <i className="fa-solid fa-newspaper" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Chưa có bài viết nào trong chuyên mục này</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Ban biên tập đang tổng hợp và cập nhật thêm bài viết chia sẻ kinh nghiệm cho chuyên mục này. Vui lòng quay lại sau!
              </p>
            </div>
          ) : (
            paginatedArticles.map(article => {
              const cat = allCategories.find(c => c.slug === article.categorySlug);
              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  category={cat}
                />
              );
            })
          )}
        </div>

        {/* Thanh Phân Trang Người Đọc (SEO & UX Pagination) */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
              Hiển thị <strong className="text-slate-900">{(safePage - 1) * ARTICLES_PER_PAGE + 1}</strong> -{' '}
              <strong className="text-slate-900">{Math.min(safePage * ARTICLES_PER_PAGE, filteredArticles.length)}</strong>{' '}
              trên tổng số <strong className="text-slate-900">{filteredArticles.length}</strong> bài viết (Trang <strong className="text-slate-900">{safePage}</strong>/{totalPages})
            </div>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => handlePageChange(safePage - 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
                title="Trang trước"
              >
                <i className="fa-solid fa-chevron-left text-[10px]" />
                <span className="hidden sm:inline">Trang trước</span>
              </button>

              {getPageNumbers(safePage, totalPages).map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold select-none">
                      ...
                    </span>
                  );
                }
                const isActive = p === safePage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center border shadow-2xs ${
                      isActive
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
                title="Trang sau"
              >
                <span className="hidden sm:inline">Trang sau</span>
                <i className="fa-solid fa-chevron-right text-[10px]" />
              </button>
            </div>
          </div>
        )}

        {/* Khối Bộ Công Cụ Tiện Ích BĐS (Internal Link & CRO) */}
        <QuickToolsSection />

        {/* Khối Hỏi Đáp Thường Gặp (FAQ Accordion - AIO/GEO Booster) */}
        <KnowledgeFaqAccordion activeCategorySlug={activeCategorySlug} />

        {/* Khối Banner Hành Động & Khám Phá Nhà Đất */}
        <KnowledgeActionBanner />

        {/* Khối Khám Phá Thị Trường Địa Phương (Local SEO Silo Links) */}
        <LocalSeoLinks />
      </div>
    </div>
  );
}
