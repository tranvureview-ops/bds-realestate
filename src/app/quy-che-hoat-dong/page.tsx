import type { Metadata } from 'next';
import Link from 'next/link';

// ============================================================================
// HẰNG SỐ THÔNG TIN THƯƠNG HIỆU ĐỒNG BỘ CÀI ĐẶT WEBSITE
// ============================================================================
const BRAND_NAME = 'Đất Biển Đà Nẵng';
const COMPANY_NAME = 'Sàn Giao Dịch Bất Động Sản Đất Biển Đà Nẵng';
const HOTLINE = '0904 084 888';
const EMAIL = 'tranvanvu.dev@gmail.com';
const ADDRESS = 'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, TP. Đà Nẵng';
const DOMAIN = 'https://bds-realestate.vercel.app';

// ============================================================================
// 1. METADATA API CHUẨN SEO GOOGLE (TITLE < 60 chars, DESC < 160 chars)
// ============================================================================
export const metadata: Metadata = {
  title: `Quy Chế Hoạt Động Sàn BĐS | ${BRAND_NAME}`,
  description: `Quy chế hoạt động Sàn giao dịch TMĐT bất động sản ${BRAND_NAME}. Quyền và nghĩa vụ thành viên, quy định kiểm duyệt tin và chế tài xử lý vi phạm.`,
  alternates: {
    canonical: `${DOMAIN}/quy-che-hoat-dong`,
  },
  openGraph: {
    title: `Quy Chế Hoạt Động Sàn BĐS | ${BRAND_NAME}`,
    description: `Quy chế hoạt động Sàn TMĐT bất động sản ${BRAND_NAME}. Quyền và nghĩa vụ thành viên, quy định đăng tin và chế tài vi phạm.`,
    url: `${DOMAIN}/quy-che-hoat-dong`,
    siteName: BRAND_NAME,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Quy Chế Hoạt Động Sàn BĐS | ${BRAND_NAME}`,
    description: `Quy chế hoạt động Sàn TMĐT bất động sản ${BRAND_NAME}. Tuân thủ pháp luật Việt Nam.`,
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
  name: `Quy Chế Hoạt Động Sàn Giao Dịch Bất Động Sản ${BRAND_NAME}`,
  description: `Quy chế hoạt động Sàn TMĐT bất động sản ${BRAND_NAME}. Căn cứ Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.`,
  url: `${DOMAIN}/quy-che-hoat-dong`,
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

export default function OperatingRegulationPage() {
  const currentDateFormatted = '16/10/2026';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
        {/* Header Trang & Breadcrumb */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                <li>
                  <Link href="/chinh-sach-phap-ly" className="transition hover:text-red-600">
                    Chính sách pháp lý
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li className="font-semibold text-slate-800" aria-current="page">
                  Quy chế hoạt động
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  Quy chuẩn pháp lý sàn TMĐT
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Quy Chế Hoạt Động Sàn Giao Dịch BĐS {BRAND_NAME}
                </h1>
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                <p>Cập nhật: <strong className="text-slate-700">{currentDateFormatted}</strong></p>
                <p>Hiệu lực: <strong className="text-emerald-700">Đang áp dụng toàn sàn</strong></p>
              </div>
            </div>

            {/* Thanh chuyển đổi nhanh giữa 3 trang chính sách */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
              <span className="text-slate-400 font-semibold mr-1">Bộ chính sách:</span>
              <span className="rounded-xl bg-red-600 px-3.5 py-1.5 text-white shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-scroll text-[11px]"></i>
                1. Quy chế hoạt động
              </span>
              <Link
                href="/chinh-sach-bao-mat"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-shield-halved text-[11px] text-emerald-600"></i>
                2. Chính sách bảo mật
              </Link>
              <Link
                href="/giai-quyet-khieu-nai"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-scale-balanced text-[11px] text-blue-600"></i>
                3. Giải quyết khiếu nại
              </Link>
            </div>
          </div>
        </header>

        {/* Nội dung bài viết */}
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Cột Trái: Mục lục tự động (TOC Sticky) */}
            <aside className="lg:col-span-3">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mục Lục Quy Chế
                  </h2>
                </div>

                <nav className="mt-4 space-y-1.5 text-xs">
                  <a
                    href="#nguyen-tac-chung"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>1. Nguyên tắc chung & định nghĩa</span>
                    <span className="text-[10px] text-slate-400 font-mono">01</span>
                  </a>
                  <a
                    href="#quyen-nghia-vu-thanh-vien"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>2. Quyền & nghĩa vụ thành viên</span>
                    <span className="text-[10px] text-slate-400 font-mono">02</span>
                  </a>
                  <a
                    href="#quyen-nghia-vu-ban-quan-tri"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>3. Quyền & trách nhiệm Ban quản trị</span>
                    <span className="text-[10px] text-slate-400 font-mono">03</span>
                  </a>
                  <a
                    href="#cac-hanh-vi-bi-cam"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>4. Các hành vi nghiêm cấm</span>
                    <span className="text-[10px] text-slate-400 font-mono">04</span>
                  </a>
                  <a
                    href="#quy-dinh-tin-dang"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>5. Quy định về tin đăng BĐS</span>
                    <span className="text-[10px] text-slate-400 font-mono">05</span>
                  </a>
                  <a
                    href="#che-tai-xu-ly"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <span>6. Chế tài xử lý vi phạm</span>
                    <span className="text-[10px] text-slate-400 font-mono">06</span>
                  </a>
                </nav>

                <div className="mt-6 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-[11px] leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-800">Đơn vị chủ quản:</p>
                  <p className="mt-1 font-semibold text-slate-700">{COMPANY_NAME}</p>
                  <p className="mt-0.5 text-slate-500">Hotline: <strong className="text-red-600 font-mono">{HOTLINE}</strong></p>
                </div>
              </div>
            </aside>

            {/* Cột Phải: Nội dung chi tiết */}
            <article className="lg:col-span-9 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700">
              
              {/* Lời mở đầu căn cứ pháp lý */}
              <div className="mb-8 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Căn cứ pháp lý áp dụng
                </p>
                <p>
                  Quy chế này được xây dựng căn cứ theo quy định của <strong>Luật Giao dịch điện tử</strong>, <strong>Luật Thương mại</strong>, <strong>Luật Kinh doanh Bất động sản</strong>, <strong>Nghị định số 52/2013/NĐ-CP</strong> và <strong>Nghị định số 85/2021/NĐ-CP</strong> của Chính phủ về quản lý hoạt động thương mại điện tử.
                </p>
              </div>

              {/* Mục 1: Nguyên tắc chung & Định nghĩa */}
              <section id="nguyen-tac-chung" className="scroll-mt-24 border-b border-slate-200 pb-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">1</span>
                  Nguyên Tắc Chung và Định Nghĩa Thuật Ngữ
                </h2>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>
                    Sàn giao dịch thương mại điện tử <strong>{BRAND_NAME}</strong> (sau đây gọi là <em>"Sàn TMĐT"</em>) do <strong>{COMPANY_NAME}</strong> sở hữu và vận hành, là cổng thông tin trực tuyến phục vụ nhu cầu đăng tin quảng cáo, giới thiệu, mua bán, chuyển nhượng và cho thuê bất động sản hợp pháp trên toàn lãnh thổ Việt Nam.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Thành viên / Người dùng:</strong> Cá nhân hoặc tổ chức đăng ký tài khoản hợp lệ trên Sàn hoặc khách vãng lai truy cập tra cứu thông tin bất động sản.</li>
                    <li><strong>Người Đăng Tin / Môi Giới:</strong> Thương nhân, tổ chức, cá nhân có quyền sử dụng đất hoặc sở hữu nhà ở, hoặc môi giới được ủy quyền hợp pháp đăng tải thông tin bất động sản lên Sàn.</li>
                    <li><strong>Người Tìm Kiếm / Khách Hàng:</strong> Người có nhu cầu tìm mua, thuê bất động sản và liên hệ trực tiếp với Người Đăng Tin để thỏa thuận giao dịch.</li>
                    <li><strong>Ban Quản Trị Sàn:</strong> Đội ngũ quản lý, kỹ thuật và kiểm duyệt viên thuộc đơn vị chủ quản có trách nhiệm giám sát, duy trì hệ thống và hỗ trợ người dùng.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 2: Quyền & Nghĩa vụ thành viên */}
              <section id="quyen-nghia-vu-thanh-vien" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">2</span>
                  Quyền và Nghĩa Vụ của Thành Viên
                </h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <h3 className="font-black text-slate-900 text-sm mb-2 text-emerald-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check"></i> Quyền Lợi Của Thành Viên
                    </h3>
                    <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                      <li>Được cấp quyền đăng ký tài khoản, quản lý tin đăng và sử dụng các công cụ tính toán tài chính, tra cứu bản đồ quy hoạch miễn phí.</li>
                      <li>Được quyền mua các gói dịch vụ gia tăng: <strong>VIP Kim Cương, VIP Vàng, VIP Bạc, VIP Đồng</strong> và đặt lịch đẩy tin tự động theo biểu phí niêm yết.</li>
                      <li>Được bảo mật an toàn tuyệt đối mọi thông tin cá nhân và thông tin tài khoản ngân hàng liên kết.</li>
                      <li>Được khiếu nại, phản ánh các hành vi gian dối của người dùng khác và yêu cầu Ban quản trị can thiệp bảo vệ quyền lợi.</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <h3 className="font-black text-slate-900 text-sm mb-2 text-red-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation"></i> Nghĩa Vụ Của Thành Viên
                    </h3>
                    <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                      <li>Cung cấp chính xác thông tin cá nhân khi đăng ký và xuất trình giấy tờ chứng minh quyền sở hữu hoặc ủy quyền khi có yêu cầu.</li>
                      <li>Cam kết thông tin bất động sản đăng tải là <strong>hoàn toàn có thật, không tranh chấp, không thuộc diện quy hoạch giải tỏa trái phép</strong>.</li>
                      <li>Chịu trách nhiệm trực tiếp trước người mua và pháp luật về mọi thỏa thuận thanh toán, giao dịch đặt cọc và chuyển nhượng.</li>
                      <li>Bảo mật tài khoản, không chia sẻ mật khẩu hoặc cho bên thứ ba mượn tài khoản nhằm mục đích trục lợi.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Mục 3: Quyền & Trách nhiệm Ban quản trị */}
              <section id="quyen-nghia-vu-ban-quan-tri" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">3</span>
                  Quyền và Trách Nhiệm của Ban Quản Trị Sàn
                </h2>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <p>
                    Ban quản trị sàn <strong>{BRAND_NAME}</strong> đóng vai trò trung gian kết nối thông tin, cung cấp nền tảng kỹ thuật số và bảo đảm môi trường kinh doanh minh bạch:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Quyền kiểm duyệt & từ chối:</strong> Có quyền kiểm duyệt, từ chối hoặc xóa bỏ bất kỳ nội dung tin đăng nào vi phạm quy chuẩn nội dung mà không cần thông báo trước.</li>
                    <li><strong>Áp dụng công nghệ kiểm soát tự động:</strong> Tích hợp trí tuệ nhân tạo (AI Moderation) để quét từ khóa nhạy cảm, ngăn chặn các hành vi spam và nhận diện ảnh trùng lặp.</li>
                    <li><strong>Trách nhiệm cung cấp chứng cứ:</strong> Hợp tác và cung cấp thông tin giao dịch, địa chỉ IP của người dùng vi phạm cho cơ quan Cảnh sát điều tra khi có văn bản yêu cầu chính thức.</li>
                    <li><strong>Không chịu trách nhiệm bồi thường:</strong> Sàn không phải là một bên tham gia giao dịch mua bán thực tế giữa người mua và người bán, do đó không chịu trách nhiệm dân sự đối với tranh chấp thanh toán ngoài sàn giữa các bên.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 4: Các hành vi bị cấm */}
              <section id="cac-hanh-vi-bi-cam" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">4</span>
                  Các Hành Vi Nghiêm Cấm Tuyệt Đối
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Rao bán "Dự án ma" / Đất chưa đủ điều kiện</strong>
                    Đăng tin rao bán đất nông nghiệp phân lô trái phép, dự án chưa có chấp thuận chủ trương đầu tư hoặc bất động sản đang bị kê biên thi hành án.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Thông tin sai lệch giá & Vị trí</strong>
                    Đăng giá cực thấp (giá mồi) nhằm lôi kéo khách hàng rồi dẫn đi xem vị trí khác cách xa hàng chục cây số; chèn thông tin địa chỉ giả mạo.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Xúc phạm danh dự & Cạnh tranh không lành mạnh</strong>
                    Sử dụng ngôn từ thô tục, bôi nhọ đối thủ cạnh tranh, kêu gọi tẩy chay hoặc tung tin thất thiệt gây hoang mang dư luận.
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                    <strong className="text-rose-900 block mb-1">❌ Sử dụng công cụ Auto Spam</strong>
                    Sử dụng phần mềm tự động bắn tin, spam liên tục cùng một nội dung gây quá tải băng thông và làm sai lệch bảng xếp hạng tìm kiếm.
                  </div>
                </div>
              </section>

              {/* Mục 5: Quy định tin đăng */}
              <section id="quy-dinh-tin-dang" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">5</span>
                  Quy Định Chuẩn Về Tiêu Đề, Nội Dung và Hình Ảnh Tin Rao
                </h2>
                <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">A. Tiêu đề tin đăng:</strong>
                    Viết bằng tiếng Việt có dấu, độ dài tối thiểu 30 ký tự, tối đa 100 ký tự. Không được viết hoa toàn bộ (IN HOA), không chèn số điện thoại, ký tự đặc biệt (@, #, $, %) vào tiêu đề.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">B. Nội dung mô tả chi tiết:</strong>
                    Mô tả rõ ràng diện tích, vị trí, đường trước nhà, số phòng ngủ, hướng nhà, tình trạng nội thất và pháp lý (Sổ đỏ, sổ hồng). Độ dài khuyến nghị từ 100 - 3.000 ký tự.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">C. Hình ảnh minh họa:</strong>
                    Tối thiểu 3 ảnh thực tế, định dạng JPG/PNG/WebP, dung lượng dưới 5MB/ảnh. Không đăng ảnh chứa watermark thương hiệu đối thủ, ảnh mờ hoặc ảnh nhạy cảm trái thuần phong mỹ tục.
                  </div>
                </div>
              </section>

              {/* Mục 6: Chế tài xử lý */}
              <section id="che-tai-xu-ly" className="scroll-mt-24 pt-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">6</span>
                  Quy Trình và Chế Tài Xử Lý Thành Viên Vi Phạm
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3 border-b">Mức độ vi phạm</th>
                        <th className="p-3 border-b">Hành vi điển hình</th>
                        <th className="p-3 border-b">Hình thức chế tài</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold text-amber-700">Mức 1: Nhắc nhở</td>
                        <td className="p-3 text-slate-600">Sai danh mục, thiếu thông tin pháp lý sơ bộ, ảnh bị xoay ngược.</td>
                        <td className="p-3 text-slate-800">Tạm dừng hiển thị 24h để người đăng chỉnh sửa.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-orange-700">Mức 2: Hạ tin & Cảnh cáo</td>
                        <td className="p-3 text-slate-600">Spam tin trùng lặp, chèn SĐT vào ảnh, tái phạm Mức 1 quá 3 lần.</td>
                        <td className="p-3 text-slate-800">Xóa vĩnh viễn tin rao, không hoàn phí dịch vụ gói tin.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-red-700">Mức 3: Khóa tài khoản</td>
                        <td className="p-3 text-slate-600">Đăng tin lừa đảo chiếm đoạt cọc, rao dự án ma, tấn công hệ thống.</td>
                        <td className="p-3 text-slate-800">Khóa tài khoản vĩnh viễn, tịch thu số dư ví, cấm IP vĩnh viễn.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Cam kết tuân thủ */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                <p>
                  Quy chế này được công bố rộng rãi trên Sàn <strong>{BRAND_NAME}</strong> và có hiệu lực bắt buộc đối với tất cả thành viên kể từ thời điểm đăng ký tài khoản hoặc sử dụng dịch vụ.
                </p>
              </div>

            </article>
          </div>
        </main>
      </div>
    </>
  );
}
