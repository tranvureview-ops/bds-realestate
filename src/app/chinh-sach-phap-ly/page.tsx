import type { Metadata } from 'next';
import Link from 'next/link';

// ============================================================================
// HẰNG SỐ & PLACEHOLDER THÔNG TIN THƯƠNG HIỆU & DOANH NGHIỆP
// ============================================================================
const BRAND_NAME = '[Tên Thương Hiệu]';
const COMPANY_NAME = '[Tên Doanh Nghiệp/Công Ty Cổ Phần BĐS]';
const HOTLINE = '[Hotline CSKH: 0898 246 607]';
const EMAIL = '[Email CSKH: cskh@datbiendanang.vn]';
const ADDRESS = '[Địa chỉ trụ sở: Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, TP. Đà Nẵng]';
const DOMAIN = 'https://bds-realestate.vercel.app';

// ============================================================================
// 1. CẤU HÌNH METADATA API CHUẨN SEO GOOGLE (TITLE < 60 chars, DESC < 160 chars)
// ============================================================================
export const metadata: Metadata = {
  title: `Quy Chế & Chính Sách Pháp Lý | ${BRAND_NAME}`,
  description: `Quy chế hoạt động, chính sách bảo mật dữ liệu và quy trình giải quyết khiếu nại minh bạch tại sàn bất động sản ${BRAND_NAME}. Tuân thủ pháp luật Việt Nam.`,
  alternates: {
    canonical: `${DOMAIN}/chinh-sach-phap-ly`,
  },
  openGraph: {
    title: `Quy Chế & Chính Sách Pháp Lý | ${BRAND_NAME}`,
    description: `Quy chế hoạt động sàn TMĐT, chính sách bảo mật dữ liệu và giải quyết khiếu nại tại sàn BĐS ${BRAND_NAME}.`,
    url: `${DOMAIN}/chinh-sach-phap-ly`,
    siteName: BRAND_NAME,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Quy Chế Hoạt Động & Bảo Mật | ${BRAND_NAME}`,
    description: `Chính sách pháp lý, quyền lợi người dùng và quy chế bảo vệ dữ liệu cá nhân tại ${BRAND_NAME}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ============================================================================
// 2. DỮ LIỆU CẤU TRÚC JSON-LD (GOOGLE STRUCTURED DATA)
// ============================================================================
const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Quy Chế Hoạt Động & Chính Sách Pháp Lý - ${BRAND_NAME}`,
  description: `Văn bản quy chế hoạt động sàn TMĐT, chính sách bảo mật dữ liệu cá nhân và cơ chế tiếp nhận giải quyết khiếu nại tại ${BRAND_NAME}.`,
  url: `${DOMAIN}/chinh-sach-phap-ly`,
  inLanguage: 'vi-VN',
  datePublished: '2024-01-01',
  dateModified: '2026-10-16',
  publisher: {
    '@type': 'Organization',
    name: COMPANY_NAME,
    url: DOMAIN,
    logo: `${DOMAIN}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: HOTLINE,
      contactType: 'customer service',
      email: EMAIL,
      areaServed: 'VN',
      availableLanguage: 'Vietnamese',
    },
  },
};

// ============================================================================
// 3. MAIN COMPONENT (SERVER COMPONENT CHUẨN NEXT.JS APP ROUTER)
// ============================================================================
export default function LegalPolicyPage() {
  const currentDateFormatted = '16/10/2026';

  return (
    <>
      {/* Schema JSON-LD cho Google Bot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
        {/* Thanh Breadcrumb & Header Trang */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/" className="transition hover:text-red-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li className="font-semibold text-slate-800" aria-current="page">
                  Chính sách & Quy chế pháp lý
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Văn bản pháp lý chính thức
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Quy Chế Hoạt Động & Chính Sách Pháp Lý Sàn {BRAND_NAME}
                </h1>
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                <p>Cập nhật lần cuối: <strong className="text-slate-700">{currentDateFormatted}</strong></p>
                <p>Hiệu lực thi hành: <strong className="text-emerald-700">Đang áp dụng toàn sàn</strong></p>
              </div>
            </div>

            {/* Thanh chuyển đổi nhanh tới 3 trang riêng biệt */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
              <span className="text-slate-400 font-semibold mr-1">3 Trang riêng biệt:</span>
              <Link
                href="/quy-che-hoat-dong"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-scroll text-[11px] text-red-600"></i>
                1. Quy chế hoạt động ↗
              </Link>
              <Link
                href="/chinh-sach-bao-mat"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-shield-halved text-[11px] text-emerald-600"></i>
                2. Chính sách bảo mật ↗
              </Link>
              <Link
                href="/giai-quyet-khieu-nai"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-scale-balanced text-[11px] text-blue-600"></i>
                3. Giải quyết khiếu nại ↗
              </Link>
            </div>
          </div>
        </header>

        {/* Thân bài viết & Mục lục */}
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Cột Trái: Mục lục tự động (Table of Contents - Sticky Desktop) */}
            <aside className="lg:col-span-4">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mục Lục Văn Bản
                  </h2>
                </div>

                <nav className="mt-4 space-y-1.5 text-xs">
                  <a
                    href="#quy-che-hoat-dong"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>I. Quy chế hoạt động sàn TMĐT</span>
                    <span className="text-[10px] text-slate-400 font-mono">01</span>
                  </a>
                  <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-2">
                    <a href="#quyen-nghia-vu-thanh-vien" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      1. Quyền & nghĩa vụ thành viên
                    </a>
                    <a href="#cac-hanh-vi-bi-cam" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      2. Các hành vi nghiêm cấm
                    </a>
                    <a href="#che-tai-xu-ly" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      3. Chế tài xử lý vi phạm
                    </a>
                  </div>

                  <a
                    href="#chinh-sach-bao-mat"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600 mt-2"
                  >
                    <span>II. Chính sách bảo mật dữ liệu</span>
                    <span className="text-[10px] text-slate-400 font-mono">02</span>
                  </a>
                  <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-2">
                    <a href="#muc-dich-thu-thap" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      1. Mục đích thu thập dữ liệu
                    </a>
                    <a href="#cam-ket-khong-chia-se" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      2. Cam kết không chia sẻ bên thứ ba
                    </a>
                    <a href="#quyen-chu-the-du-lieu" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      3. Quyền hạn của người dùng
                    </a>
                  </div>

                  <a
                    href="#giai-quyet-khieu-nai"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600 mt-2"
                  >
                    <span>III. Giải quyết tranh chấp, khiếu nại</span>
                    <span className="text-[10px] text-slate-400 font-mono">03</span>
                  </a>
                  <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-2">
                    <a href="#quy-trinh-3-buoc" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      1. Quy trình xử lý khiếu nại 3 bước
                    </a>
                    <a href="#thoi-gian-giai-quyet" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      2. Thời gian phản hồi cam kết
                    </a>
                    <a href="#thong-tin-lien-he" className="block py-1 text-slate-500 hover:text-red-600 transition">
                      3. Đầu mối tiếp nhận phản ánh
                    </a>
                  </div>
                </nav>

                <div className="mt-6 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-[11px] leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-800">Cần tư vấn pháp lý ngay?</p>
                  <p className="mt-1">Hotline CSKH: <strong className="text-red-600 font-mono">{HOTLINE}</strong></p>
                  <p>Email: <strong className="text-slate-800 font-mono">{EMAIL}</strong></p>
                </div>
              </div>
            </aside>

            {/* Cột Phải: Nội dung chi tiết chuẩn văn bản pháp luật */}
            <article className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700">
              
              {/* Lời mở đầu căn cứ pháp lý */}
              <div className="mb-8 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Căn cứ pháp lý áp dụng
                </p>
                <p>
                  Văn bản này được ban hành căn cứ theo <strong>Luật Thương mại điện tử</strong>, <strong>Nghị định số 52/2013/NĐ-CP</strong> và <strong>Nghị định số 85/2021/NĐ-CP</strong> của Chính phủ về quản lý hoạt động thương mại điện tử, <strong>Nghị định số 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân, cùng các văn bản quy phạm pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                </p>
              </div>

              {/* ========================================================= */}
              {/* PHẦN 1: QUY CHẾ HOẠT ĐỘNG SÀN */}
              {/* ========================================================= */}
              <section id="quy-che-hoat-dong" className="scroll-mt-24 border-b border-slate-200 pb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">
                    I
                  </span>
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                    Quy Chế Hoạt Động Sàn Giao Dịch Bất Động Sản {BRAND_NAME}
                  </h2>
                </div>

                <p className="mb-4 text-sm leading-relaxed">
                  Sàn giao dịch thương mại điện tử <strong>{BRAND_NAME}</strong> (sau đây gọi tắt là <em>"Sàn"</em>) là kênh thông tin trực tuyến kết nối giữa cá nhân, tổ chức có nhu cầu mua, bán, thuê, cho thuê bất động sản (gọi chung là <strong>Người Đăng Tin / Môi Giới</strong>) và khách hàng có nhu cầu giao dịch bất động sản (gọi chung là <strong>Người Tìm Kiếm / Khách Hàng</strong>).
                </p>

                {/* 1.1 Quyền & Nghĩa vụ thành viên */}
                <h3 id="quyen-nghia-vu-thanh-vien" className="scroll-mt-24 mt-6 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  1. Quyền và Nghĩa Vụ của Thành Viên Tham Gia Sàn
                </h3>
                
                <div className="mt-3 space-y-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <p className="font-bold text-slate-900 mb-1">A. Quyền lợi của thành viên:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Được cấp tài khoản người dùng an toàn để đăng tải tin rao, quản lý danh sách bất động sản và tương tác với khách hàng tiềm năng.</li>
                      <li>Được hưởng các quyền lợi ưu đãi, dịch vụ nâng cấp tin VIP, báo cáo lượt xem tin theo chính sách bảng giá niêm yết công khai của sàn.</li>
                      <li>Được bảo mật dữ liệu thông tin cá nhân theo đúng chính sách bảo mật quy định tại Mục II văn bản này.</li>
                      <li>Được Ban quản trị sàn hỗ trợ kỹ thuật, hướng dẫn đăng tin và giải quyết tranh chấp phát sinh trong quá trình hoạt động.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <p className="font-bold text-slate-900 mb-1">B. Nghĩa vụ bắt buộc của thành viên:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Cung cấp đầy đủ, chính xác, trung thực thông tin cá nhân và <strong>pháp lý bất động sản</strong> (Sổ hồng, Sổ đỏ, quy hoạch, giá trị thực) khi xuất bản tin đăng.</li>
                      <li>Tự chịu hoàn toàn trách nhiệm trước pháp luật về tính hợp pháp, nội dung, hình ảnh và cam kết giao dịch đối với sản phẩm do mình chào bán/cho thuê.</li>
                      <li>Tuân thủ các quy định về an toàn giao dịch, phòng chống rửa tiền và đạo đức nghề nghiệp môi giới bất động sản.</li>
                      <li>Thanh toán đầy đủ các khoản phí dịch vụ hiển thị (nếu có) theo biểu giá công khai trên nền tảng.</li>
                    </ul>
                  </div>
                </div>

                {/* 1.2 Các hành vi nghiêm cấm */}
                <h3 id="cac-hanh-vi-bi-cam" className="scroll-mt-24 mt-8 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  2. Các Hành Vi Nghiêm Cấm Tuyệt Đối Trên Sàn
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Nhằm xây dựng thị trường bất động sản văn minh và minh bạch, Ban quản trị sàn <strong>{BRAND_NAME}</strong> nghiêm cấm các hành vi sau:
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Đăng tin giả mạo / Dự án ma</strong>
                    Đăng tải bất động sản không có thật, sai lệch vị trí, sử dụng hình ảnh của dự án khác hoặc bất động sản đang có tranh chấp, kê biên pháp lý.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Kê khống giá / Lừa đảo đặt cọc</strong>
                    Kê giá ảo nhằm thao túng thị trường hoặc dùng các thủ đoạn gian dối hòng chiếm đoạt tiền đặt cọc của người mua/người thuê.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Spam nội dung / Nhân bản tin</strong>
                    Tạo nhiều tài khoản ảo, dùng công cụ tự động đăng trùng lặp cùng một sản phẩm nhằm chiếm dụng không gian hiển thị của thành viên khác.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Vi phạm an ninh mạng & Bản quyền</strong>
                    Phát tán mã độc, virus, xâm nhập trái phép hệ thống máy chủ hoặc sao chép trái phép thương hiệu, dữ liệu sở hữu trí tuệ của sàn.
                  </div>
                </div>

                {/* 1.3 Chế tài xử lý */}
                <h3 id="che-tai-xu-ly" className="scroll-mt-24 mt-8 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  3. Chế Tài Xử Lý Thành Viên Vi Phạm
                </h3>
                <ul className="mt-3 list-decimal pl-5 space-y-2 text-sm text-slate-600">
                  <li><strong>Khóa tạm thời tin đăng:</strong> Ẩn tin vi phạm trong vòng 24h đối với lỗi sơ bộ (sai danh mục, ảnh mờ, chèn số điện thoại vào tiêu đề).</li>
                  <li><strong>Gỡ bỏ vĩnh viễn và không hoàn phí:</strong> Áp dụng đối với các tin đăng sai sự thật, tin lừa đảo hoặc vi phạm thuần phong mỹ tục.</li>
                  <li><strong>Khóa tài khoản vĩnh viễn:</strong> Chấm dứt quyền thành viên đối với cá nhân/tổ chức có hành vi tái phạm nhiều lần hoặc có hành vi gian lận tài chính.</li>
                  <li><strong>Chuyển giao hồ sơ cho cơ quan pháp luật:</strong> Trường hợp vi phạm có dấu hiệu lừa đảo chiếm đoạt tài sản, Ban quản trị sẽ cung cấp đầy đủ chứng cứ cho cơ quan Công an có thẩm quyền theo quy định của pháp luật.</li>
                </ul>
              </section>

              {/* ========================================================= */}
              {/* PHẦN 2: CHÍNH SÁCH BẢO MẬT THÔNG TIN */}
              {/* ========================================================= */}
              <section id="chinh-sach-bao-mat" className="scroll-mt-24 border-b border-slate-200 py-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">
                    II
                  </span>
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                    Chính Sách Bảo Mật Thông Tin & Dữ Liệu Cá Nhân
                  </h2>
                </div>

                <p className="mb-4 text-sm leading-relaxed">
                  Chính sách bảo mật này quy định cách thức sàn <strong>{BRAND_NAME}</strong> thu thập, xử lý, bảo vệ và tôn trọng quyền riêng tư đối với dữ liệu cá nhân của mọi thành viên, tuân thủ nghiêm ngặt theo <strong>Nghị định số 13/2023/NĐ-CP</strong> về Bảo vệ dữ liệu cá nhân.
                </p>

                {/* 2.1 Mục đích thu thập */}
                <h3 id="muc-dich-thu-thap" className="scroll-mt-24 mt-6 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  1. Mục Đích và Phạm Vi Thu Thập Dữ Liệu
                </h3>
                <p className="mt-2 text-sm text-slate-600">Chúng tôi chỉ thu thập các trường thông tin cần thiết tối thiểu nhằm phục vụ các mục đích sau:</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3 border-b">Loại Dữ Liệu Thu Thập</th>
                        <th className="p-3 border-b">Mục Đích Sử Dụng Chính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Họ và tên, Số điện thoại, Email</td>
                        <td className="p-3 text-slate-600">Xác thực danh tính chủ tài khoản, gửi thông báo biến động tin đăng, liên kết kết nối người mua và người bán.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Số CCCD / Mã số thuế cá nhân</td>
                        <td className="p-3 text-slate-600">Dùng cho tính năng cấp chứng nhận <strong>"Môi Giới Xác Thực"</strong> hoặc xuất hóa đơn tài chính dịch vụ VAT.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Địa chỉ IP, Cookie, Lịch sử truy cập</td>
                        <td className="p-3 text-slate-600">Ghi nhận bảo mật chống tấn công DDoS, lưu trữ cấu hình giao diện ưa thích và cá nhân hóa gợi ý bất động sản.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2.2 Cam kết không chia sẻ bên thứ ba */}
                <h3 id="cam-ket-khong-chia-se" className="scroll-mt-24 mt-8 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  2. Cam Kết Tuyệt Đối Không Bán / Chia Sẻ Dữ Liệu Cho Bên Thứ Ba
                </h3>
                <div className="mt-3 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200 text-sm text-emerald-950 space-y-2">
                  <p className="font-bold flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Nguyên tắc bất khả xâm phạm về dữ liệu cá nhân:
                  </p>
                  <p>
                    Ban quản trị sàn <strong>{BRAND_NAME} cam kết không bán, không thương mại hóa, không chia sẻ hay tiết lộ thông tin cá nhân của người dùng</strong> cho bất kỳ bên thứ ba nào vì mục đích tiếp thị trái phép hoặc quảng cáo phiền nhiễu.
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    <em>Ngoại lệ duy nhất:</em> Thông tin chỉ được cung cấp khi có văn bản yêu cầu chính thức từ Viện Kiểm Sát, Tòa Án hoặc Cơ Quan Điều Tra Công An phục vụ điều tra các vụ án hình sự theo đúng trình tự pháp luật tố tụng.
                  </p>
                </div>

                {/* 2.3 Quyền chủ thể dữ liệu */}
                <h3 id="quyen-chu-the-du-lieu" className="scroll-mt-24 mt-8 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  3. Quyền Hạn Của Chủ Thể Dữ Liệu
                </h3>
                <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li><strong>Quyền tra cứu & điều chỉnh:</strong> Thành viên có quyền tự do chỉnh sửa họ tên, mật khẩu, số điện thoại trong mục <em>"Cài Đặt Hồ Sơ Cá Nhân"</em> bất cứ lúc nào.</li>
                  <li><strong>Quyền yêu cầu xóa bỏ dữ liệu (Right to be forgotten):</strong> Người dùng có thể gửi yêu cầu hủy tài khoản và xóa vĩnh viễn toàn bộ dữ liệu lịch sử liên quan qua email <strong>{EMAIL}</strong>. Yêu cầu sẽ được xử lý trong vòng <strong>72 giờ làm việc</strong>.</li>
                  <li><strong>An toàn mã hóa:</strong> Toàn bộ dữ liệu mật khẩu và số dư tài khoản được mã hóa một chiều (Bcrypt hashing) và truyền tải qua giao thức an toàn tiêu chuẩn quốc tế <strong>SSL/TLS 256-bit</strong>.</li>
                </ul>
              </section>

              {/* ========================================================= */}
              {/* PHẦN 3: CƠ CHẾ GIẢI QUYẾT KHIẾU NẠI & TRANH CHẤP */}
              {/* ========================================================= */}
              <section id="giai-quyet-khieu-nai" className="scroll-mt-24 py-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                    III
                  </span>
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                    Cơ Chế Giải Quyết Tranh Chấp & Khiếu Nại Minh Bạch
                  </h2>
                </div>

                <p className="mb-4 text-sm leading-relaxed">
                  <strong>{BRAND_NAME}</strong> luôn đề cao giải pháp thương lượng hòa giải giữa các bên nhằm đảm bảo quyền lợi tối thượng của khách hàng và uy tín lâu dài của thị trường bất động sản.
                </p>

                {/* 3.1 Quy trình 3 bước tiếp nhận & xử lý */}
                <h3 id="quy-trinh-3-buoc" className="scroll-mt-24 mt-6 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  1. Quy Trình 3 Bước Tiếp Nhận & Giải Quyết Khiếu Nại
                </h3>

                <div className="mt-4 space-y-3">
                  {/* Bước 1 */}
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                        B1
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Bước 1: Tiếp nhận thông tin khiếu nại (Trong vòng 24 giờ)
                        </h4>
                        <p className="mt-1 text-xs text-slate-600">
                          Khách hàng gửi phản ánh qua nút <strong>"Báo cáo tin rao vi phạm"</strong> trực tiếp trên từng bài đăng, gọi điện đến hotline <strong>{HOTLINE}</strong> hoặc gửi email tới <strong>{EMAIL}</strong> kèm theo mã tin, bằng chứng giao dịch (biên nhận, tin nhắn thỏa thuận).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                        B2
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Bước 2: Xác minh độc lập & Làm trung gian hòa giải (24h - 48h)
                        </h4>
                        <p className="mt-1 text-xs text-slate-600">
                          Ban Kiểm Duyệt & Pháp Chế tiến hành liên hệ người đăng tin bị khiếu nại, yêu cầu giải trình văn bản và cung cấp giấy tờ chứng minh. Trong thời gian này, tin đăng bị khiếu nại sẽ được <strong>tạm ẩn khỏi hệ thống tìm kiếm</strong> để phòng ngừa rủi ro.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                        B3
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Bước 3: Đưa ra kết luận & Biện pháp khắc phục (Tối đa 72 giờ)
                        </h4>
                        <p className="mt-1 text-xs text-slate-600">
                          Ban quản trị gửi thông báo kết luận bằng văn bản điện tử cho cả hai bên. Trường hợp người đăng tin có hành vi gian dối, sàn sẽ tiến hành khóa tài khoản vĩnh viễn, hoàn trả phí dịch vụ cho người mua (nếu thuộc phạm vi bảo vệ) và hỗ trợ hồ sơ pháp lý nếu người bị hại khởi kiện ra Tòa án.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.2 Cam kết thời gian xử lý */}
                <h3 id="thoi-gian-giai-quyet" className="scroll-mt-24 mt-8 text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  2. Cam Kết Thời Gian Xử Lý Phản Hồi
                </h3>
                <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                  <li><strong>Thời gian xác nhận tiếp nhận khiếu nại:</strong> Không quá <strong>24 giờ</strong> kể từ thời điểm gửi.</li>
                  <li><strong>Thời gian xử lý dứt điểm vụ việc thông thường:</strong> Không quá <strong>03 ngày làm việc</strong>.</li>
                  <li><strong>Vụ việc phức tạp liên quan nhiều bên:</strong> Tối đa <strong>07 ngày làm việc</strong> (có thông báo tiến độ định kỳ cho người khiếu nại).</li>
                </ul>

                {/* 3.3 Thông tin liên hệ đầu mối tiếp nhận */}
                <div id="thong-tin-lien-he" className="scroll-mt-24 mt-8 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        Bộ phận Tiếp nhận Khiếu nại & Kiểm soát chất lượng
                      </span>
                      <h4 className="text-lg font-black text-white mt-1">
                        SÀN GIAO DỊCH BẤT ĐỘNG SẢN {BRAND_NAME}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 border border-slate-700">
                      🏢 Thuộc: {COMPANY_NAME}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400 font-medium">Hotline Trực Tiếp 24/7:</p>
                      <p className="text-base font-black text-emerald-400 font-mono mt-1">
                        {HOTLINE}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Phục vụ từ 8h00 - 21h00 hàng ngày</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400 font-medium">Email Tiếp Nhận Khiếu Nại:</p>
                      <p className="text-sm font-bold text-white font-mono mt-1">
                        {EMAIL}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Phản hồi tự động trong 15 phút</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400 font-medium">Trụ Sở Văn Phòng Chính:</p>
                      <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">
                        {ADDRESS}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Việt Nam</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lời kết cam kết của sàn */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                <p>
                  Văn bản này có hiệu lực kể từ ngày đăng ký chính thức với Bộ Công Thương và áp dụng bình đẳng cho mọi cá nhân, tổ chức tham gia giao dịch trên nền tảng <strong>{BRAND_NAME}</strong>.
                </p>
              </div>

            </article>
          </div>
        </main>
      </div>
    </>
  );
}
