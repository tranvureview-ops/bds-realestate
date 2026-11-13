import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '../../utils/permalink';

// ============================================================================
// HẰNG SỐ THÔNG TIN THƯƠNG HIỆU ĐỒNG BỘ CÀI ĐẶT WEBSITE
// ============================================================================
const BRAND_NAME = 'Kênh Nhà Đất 24H';
const COMPANY_NAME = 'Sàn Giao Dịch Nhà Đất Kênh Nhà Đất 24H';
const HOTLINE = '0905 467 138';
const EMAIL = 'tranvanvu.dev@gmail.com';
const ADDRESS = 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
const DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

// ============================================================================
// 1. METADATA API CHUẨN SEO GOOGLE (TITLE < 60 chars, DESC < 160 chars)
// ============================================================================
export const metadata: Metadata = {
  title: {
    absolute: `Quy trình khiếu nại dịch vụ website | ${BRAND_NAME}`,
  },
  description: `Quy trình tiếp nhận và giải quyết khiếu nại về hoạt động website, sự cố kỹ thuật, dịch vụ tin đăng và giao dịch nạp ví tại sàn ${BRAND_NAME}.`,
  alternates: {
    canonical: `${DOMAIN}/giai-quyet-khieu-nai`,
  },
  openGraph: {
    title: `Quy trình khiếu nại dịch vụ website | ${BRAND_NAME}`,
    description: `Quy trình tiếp nhận và xử lý khiếu nại hoạt động website, giao dịch ví và dịch vụ tin đăng minh bạch tại ${BRAND_NAME}.`,
    url: `${DOMAIN}/giai-quyet-khieu-nai`,
    siteName: BRAND_NAME,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Giải quyết khiếu nại hoạt động website | ${BRAND_NAME}`,
    description: `Quy trình xử lý sự cố kỹ thuật, dịch vụ gói tin và nạp ví thành viên trên sàn ${BRAND_NAME}.`,
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
  '@graph': [
    {
      '@type': 'WebPage',
      name: `Quy trình tiếp nhận và giải quyết khiếu nại dịch vụ website - ${BRAND_NAME}`,
      description: `Cơ chế tiếp nhận và xử lý sự cố kỹ thuật, dịch vụ gói tin, nạp ví và vận hành website tại sàn ${BRAND_NAME}.`,
      url: `${DOMAIN}/giai-quyet-khieu-nai`,
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
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: DOMAIN,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Chính sách pháp lý',
          item: `${DOMAIN}/chinh-sach-phap-ly`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Giải quyết khiếu nại',
          item: `${DOMAIN}/giai-quyet-khieu-nai`,
        },
      ],
    },
  ],
};

export default function DisputeResolutionPage() {
  const currentDateFormatted = '16/10/2026';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-700 selection:text-white">
        {/* Header Trang & Breadcrumb */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/" className="transition hover:text-blue-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li>
                  <Link href="/chinh-sach-phap-ly" className="transition hover:text-blue-600">
                    Chính sách pháp lý
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li className="font-semibold text-slate-800" aria-current="page">
                  Giải quyết khiếu nại
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Cơ chế hỗ trợ kỹ thuật & vận hành website
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Quy Trình Tiếp Nhận & Giải Quyết Khiếu Nại Hoạt Động Website
                </h1>
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                <p>Cập nhật: <strong className="text-slate-700">{currentDateFormatted}</strong></p>
                <p>Cam kết phản hồi kỹ thuật: <strong className="text-blue-700">Trong vòng 24 giờ</strong></p>
              </div>
            </div>

            {/* Thanh chuyển đổi nhanh giữa 3 trang chính sách */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
              <span className="text-slate-400 font-semibold mr-1">Bộ chính sách:</span>
              <Link
                href="/quy-che-hoat-dong"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-scroll text-[11px] text-red-600"></i>
                1. Quy chế hoạt động
              </Link>
              <Link
                href="/chinh-sach-bao-mat"
                className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-shield-halved text-[11px] text-emerald-600"></i>
                2. Chính sách bảo mật
              </Link>
              <span className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-white shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-scale-balanced text-[11px]"></i>
                3. Giải quyết khiếu nại
              </span>
            </div>
          </div>
        </header>

        {/* Thân bài viết */}
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Cột Trái: Mục lục tự động (TOC Sticky) */}
            <aside className="lg:col-span-3">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mục Lục Khiếu Nại
                  </p>
                </div>

                <nav aria-label="Mục lục nội dung" className="mt-4 space-y-1.5 text-xs">
                  <Link
                    href="#pham-vi-giai-quyet"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>1. Phạm vi xử lý dịch vụ website</span>
                    <span className="text-[10px] text-slate-400 font-mono">01</span>
                  </Link>
                  <Link
                    href="#mien-tru-tranh-chap"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>2. Miễn trừ tranh chấp mua bán</span>
                    <span className="text-[10px] text-slate-400 font-mono">02</span>
                  </Link>
                  <Link
                    href="#quy-trinh-3-buoc"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>3. Quy trình 3 bước xử lý</span>
                    <span className="text-[10px] text-slate-400 font-mono">03</span>
                  </Link>
                  <Link
                    href="#thoi-gian-cam-ket"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>4. Thời hiệu & cam kết xử lý</span>
                    <span className="text-[10px] text-slate-400 font-mono">04</span>
                  </Link>
                  <Link
                    href="#che-tai-ky-thuat"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>5. Chế tài kỹ thuật trên website</span>
                    <span className="text-[10px] text-slate-400 font-mono">05</span>
                  </Link>
                  <Link
                    href="#thong-tin-dau-moi"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>6. Đầu mối tiếp nhận kỹ thuật</span>
                    <span className="text-[10px] text-slate-400 font-mono">06</span>
                  </Link>
                </nav>

                <div className="mt-6 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-[11px] leading-relaxed text-blue-900">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-headset text-blue-600"></i> Hỗ trợ kỹ thuật 24/7:
                  </p>
                  <p className="mt-1">
                    Hotline: <strong className="font-mono text-red-600 font-bold">{HOTLINE}</strong>
                  </p>
                  <p>
                    Email: <strong className="font-mono text-slate-800">{EMAIL}</strong>
                  </p>
                </div>
              </div>
            </aside>

            {/* Cột Phải: Nội dung chi tiết */}
            <article className="lg:col-span-9 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700">
              
              {/* Khung Tôn chỉ & Nguyên tắc cốt lõi */}
              <div className="mb-8 rounded-2xl bg-blue-50/60 p-4 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-blue-950 mb-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Nguyên tắc vận hành & phạm vi áp dụng
                </p>
                <p>
                  Trang này quy định cơ chế và quy trình tiếp nhận, xử lý khiếu nại liên quan đến <strong>hoạt động vận hành website, các dịch vụ trực tuyến, tài khoản thành viên và giao dịch nạp ví trên sàn {BRAND_NAME}</strong>. Ban Quản Trị cam kết bảo đảm hạ tầng kỹ thuật thông suốt, minh bạch chi phí dịch vụ và bảo vệ quyền lợi thành viên khi sử dụng nền tảng.
                </p>
              </div>

              {/* Mục 1: Phạm vi giải quyết khiếu nại hoạt động website */}
              <section id="pham-vi-giai-quyet" className="scroll-mt-24 border-b border-slate-200 pb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">1</span>
                  <span>Các Trường Hợp Khiếu Nại Thuộc Thẩm Quyền Xử Lý Của Website</span>
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Ban Quản Trị sàn <strong>{BRAND_NAME}</strong> tiếp nhận, thẩm tra và xử lý triệt để các khiếu nại phát sinh trực tiếp từ quá trình trải nghiệm và sử dụng dịch vụ trên website, bao gồm:
                </p>
                
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">A. Khiếu nại về giao dịch tài chính & nạp tiền ví:</strong>
                    Xảy ra lỗi khi nạp tiền qua cổng thanh toán (VietQR, thẻ ngân hàng, ví điện tử) nhưng tài khoản chưa được cộng điểm; bị trừ tiền trùng lặp; lỗi áp dụng mã khuyến mãi; hoặc hệ thống trừ phí sai so với bảng giá gói tin niêm yết.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">B. Khiếu nại về hiển thị & dịch vụ tin đăng:</strong>
                    Tin đăng gói VIP (Kim Cương, Vàng, Bạc, Đồng) không hiển thị đúng vị trí ưu tiên cam kết; tính năng đặt lịch đẩy tin tự động bị gián đoạn; ảnh tải lên bị lỗi hiển thị hoặc định vị bản đồ GIS sai lệch do lỗi kỹ thuật của hệ thống.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">C. Khiếu nại về kiểm duyệt tài khoản & tin đăng:</strong>
                    Thành viên phản ánh về việc tin đăng bị từ chối duyệt hoặc bị tạm ẩn chưa rõ nguyên nhân; tài khoản bị hạn chế tính năng hoặc bị khóa nhầm lẫn do hệ thống quét tự động.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">D. Báo cáo tin đăng vi phạm quy chế trên nền tảng:</strong>
                    Tiếp nhận báo cáo từ cộng đồng về các tin đăng spam liên tục, tin rác, trùng lặp nội dung, hình ảnh phản cảm hoặc thông tin sai sự thật trên website để Ban Quản Trị áp dụng biện pháp kỹ thuật hạ tin và xử lý tài khoản vi phạm.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">E. Khiếu nại về bản quyền hình ảnh & sở hữu trí tuệ:</strong>
                    Chủ sở hữu bất động sản hoặc người chụp ảnh gửi yêu cầu gỡ bỏ hình ảnh, nội dung bị người dùng khác sao chép trái phép đưa lên website mà chưa có sự đồng ý.
                  </div>
                </div>
              </section>

              {/* Mục 2: Miễn trừ tranh chấp giữa người bán & người mua */}
              <section id="mien-tru-tranh-chap" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">2</span>
                  <span>Tuyên Bố Miễn Trừ Trách Nhiệm Về Tranh Chấp Giữa Người Bán & Người Mua</span>
                </h2>
                
                <div className="mt-4 rounded-2xl bg-rose-50/70 border border-rose-200 p-4 text-xs text-rose-950 space-y-2.5 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-sm uppercase">
                    <i className="fa-solid fa-triangle-exclamation text-rose-600"></i>
                    <span>Tuyên bố pháp lý quan trọng:</span>
                  </div>
                  <p>
                    <strong>Sàn Giao Dịch Nhà Đất {BRAND_NAME} là nền tảng công nghệ trung gian kết nối thông tin (Sàn TMĐT)</strong>, cung cấp dịch vụ đăng tin quảng bá bất động sản. Chúng tôi <strong>KHÔNG PHẢI là một bên tham gia</strong> vào các giao dịch mua bán, chuyển nhượng, cho thuê, đặt cọc hay ủy quyền thực tế ngoài đời thực giữa Người Bán (Chủ nhà/Môi giới) và Người Mua (Khách hàng).
                  </p>
                  <p>
                    Do đó, Ban Quản Trị sàn <strong>HOÀN TOÀN KHÔNG CHỊU TRÁCH NHIỆM</strong> giải quyết, hòa giải, bồi thường thiệt hại hay phân xử đối với các tranh chấp dân sự phát sinh giữa Người Bán và Người Mua, bao gồm nhưng không giới hạn ở:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-rose-900 font-medium">
                    <li>Tranh chấp về tiền đặt cọc, phạt cọc, chậm thanh toán hoặc không hoàn trả cọc giữa hai bên.</li>
                    <li>Tranh chấp về pháp lý tài sản (nhà đất dính quy hoạch, tranh chấp ranh giới, đất đang bị kê biên thi hành án hoặc giấy tờ giả mạo).</li>
                    <li>Sự khác biệt giữa tình trạng thực tế của bất động sản với thông tin mô tả do người đăng tin tự khai báo.</li>
                    <li>Bất kỳ hành vi lừa đảo chiếm đoạt tài sản, gian lận thương mại hoặc thỏa thuận miệng phát sinh ngoài phạm vi nền tảng website.</li>
                  </ul>
                  <p className="pt-1 text-slate-600 italic">
                    * Các tranh chấp dân sự giữa Người Bán và Người Mua thuộc thẩm quyền tự thỏa thuận của các bên, hoặc do Tòa án Nhân dân, Cơ quan Công an và Trọng tài thương mại thụ lý giải quyết theo quy định của Bộ luật Dân sự và pháp luật hiện hành. Sàn chỉ có trách nhiệm hỗ trợ kỹ thuật: Cung cấp dữ liệu lịch sử tin đăng và thông tin tài khoản cho Cơ quan Nhà nước có thẩm quyền khi có văn bản yêu cầu chính thức theo quy định.
                  </p>
                </div>
              </section>

              {/* Mục 3: Quy trình 3 bước giải quyết khiếu nại dịch vụ website */}
              <section id="quy-trinh-3-buoc" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">3</span>
                  <span>Quy Trình 3 Bước Xử Lý Khiếu Nại Sự Cố Website & Dịch Vụ</span>
                </h2>
                <p className="mt-2 text-sm text-slate-600">Khi gặp sự cố kỹ thuật hoặc lỗi dịch vụ trên website, thành viên được hỗ trợ xử lý theo quy trình 3 bước chuẩn:</p>

                <div className="mt-4 space-y-3">
                  {/* Bước 1 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
                        01
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Bước 1: Tiếp nhận yêu cầu khiếu nại kỹ thuật (Dưới 24 giờ)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Thành viên gửi yêu cầu hỗ trợ qua hotline <strong>{HOTLINE}</strong>, email <strong>{EMAIL}</strong> hoặc mục "Báo cáo lỗi / Khiếu nại" trong trang quản lý tài khoản. Hồ sơ khiếu nại gồm:
                        </p>
                        <ul className="mt-1.5 list-disc pl-5 text-[11px] text-slate-500 space-y-0.5">
                          <li>Tên tài khoản (Username) hoặc Số điện thoại / Email đăng ký trên sàn.</li>
                          <li>Mã tin đăng gặp sự cố hoặc Mã giao dịch thanh toán nạp tiền ví (Transaction ID).</li>
                          <li>Mô tả ngắn gọn lỗi kỹ thuật gặp phải kèm ảnh chụp màn hình thông báo lỗi (nếu có).</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
                        02
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Bước 2: Thẩm tra nhật ký hệ thống & Đối soát dữ liệu (24h - 48h)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Đội ngũ Kỹ thuật và Quản trị sàn tiến hành kiểm tra nhật ký máy chủ (Server Logs), đối soát giao dịch ngân hàng/cổng thanh toán và rà soát trạng thái duyệt tin trong cơ sở dữ liệu:
                        </p>
                        <div className="mt-2 rounded-xl bg-blue-50 p-2.5 border border-blue-200 text-[11px] text-blue-900 font-medium">
                          🛠️ Cam kết xử lý: Nếu phát hiện lỗi hệ thống làm gián đoạn quyền lợi của người dùng, đội ngũ kỹ thuật lập tức can thiệp cô lập lỗi và tái cấp quyền dịch vụ tạm thời cho thành viên.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
                        03
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Bước 3: Khắc phục sự cố & Bồi hoàn quyền lợi dịch vụ (Tối đa 72 giờ)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Sau khi xác định nguyên nhân sự cố, Ban Quản Trị ban hành kết luận và thực hiện biện pháp khắc phục thỏa đáng:
                        </p>
                        <ul className="mt-1.5 list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                          <li><strong>Nếu do lỗi kỹ thuật website:</strong> Hoàn trả 100% số tiền giao dịch lỗi vào ví tài khoản; cộng bù thời gian hiển thị tin VIP tương ứng số ngày bị gián đoạn; hoặc cấp lại lượt đẩy tin miễn phí.</li>
                          <li><strong>Nếu do thao tác người dùng không đúng quy chế:</strong> Gửi email hướng dẫn thao tác chuẩn, giải thích rõ quy định và hỗ trợ kích hoạt lại dịch vụ nếu đủ điều kiện.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mục 4: Thời hiệu & Cam kết thời gian xử lý */}
              <section id="thoi-gian-cam-ket" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">4</span>
                  <span>Thời Hiệu Tiếp Nhận & Cam Kết Thời Gian Xử Lý</span>
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3 border-b">Loại sự cố / Khiếu nại website</th>
                        <th className="p-3 border-b">Thời hạn cam kết xử lý</th>
                        <th className="p-3 border-b">Biện pháp khắc phục</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Lỗi nạp tiền ví / Cổng thanh toán</td>
                        <td className="p-3 font-bold text-emerald-600">4 - 8 giờ làm việc</td>
                        <td className="p-3 text-slate-500">Đối soát sao kê ngân hàng và cộng điểm thủ công ngay lập tức.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Lỗi duyệt tin / Hiển thị tin VIP</td>
                        <td className="p-3 font-bold text-blue-600">Dưới 12 giờ</td>
                        <td className="p-3 text-slate-500">Khôi phục vị trí tin và gia hạn bù thời gian hiển thị.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Báo cáo tin đăng rác, spam trên website</td>
                        <td className="p-3 font-bold text-slate-900">Dưới 24 giờ</td>
                        <td className="p-3 text-slate-500">Kiểm duyệt lại, hạ tin vi phạm và gửi cảnh báo tài khoản.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Khiếu nại bản quyền hình ảnh</td>
                        <td className="p-3 font-bold text-amber-600">24 - 48 giờ</td>
                        <td className="p-3 text-slate-500">Gỡ bỏ ảnh vi phạm khi người khiếu nại chứng minh bản quyền hợp pháp.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Mục 5: Biện pháp chế tài kỹ thuật trên website */}
              <section id="che-tai-ky-thuat" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">5</span>
                  <span>Biện Pháp Chế Tài Kỹ Thuật Đối Với Hành Vi Phá Hoại Hoạt Động Sàn</span>
                </h2>
                <div className="mt-3 text-xs text-slate-600 space-y-2">
                  <p>Để bảo vệ tính toàn vẹn của website và trải nghiệm người dùng chân chính, sàn sẽ áp dụng các chế tài kỹ thuật nghiêm khắc đối với các hành vi vi phạm:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Hạ vĩnh viễn các tin đăng spam, tin lặp lại nhiều lần hoặc tin đăng sai danh mục mà không hoàn phí dịch vụ.</li>
                    <li>Khóa tính năng đăng tin hoặc khóa vĩnh viễn tài khoản người dùng cố tình lợi dụng lỗ hổng kỹ thuật để trục lợi.</li>
                    <li>Chặn dải địa chỉ IP (IP Blacklist) đối với các hành vi dùng tool tự động bắn tin, spam bot hoặc tấn công hệ thống website.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 6: Đầu mối liên hệ kỹ thuật */}
              <section id="thong-tin-dau-moi" className="scroll-mt-24 pt-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">6</span>
                  <span>Đầu Mối Tiếp Nhận Hỗ Trợ Kỹ Thuật & Vận Hành Sàn</span>
                </h2>
                
                <div className="mt-4 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Bộ Phận Hỗ Trợ Kỹ Thuật & Chăm Sóc Khách Hàng Website
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      SÀN GIAO DỊCH NHÀ ĐẤT {BRAND_NAME}
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Hotline hỗ trợ kỹ thuật (24/7):</p>
                      <p className="text-base font-black text-red-400 font-mono mt-1">
                        {HOTLINE}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Tiếp nhận báo lỗi ví, lỗi tin khẩn cấp</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Email tiếp nhận sự cố website:</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                        {EMAIL}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Phản hồi có mã đối soát hệ thống</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Địa chỉ văn phòng quản trị:</p>
                      <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">
                        {ADDRESS}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Giờ hành chính: Thứ 2 - Thứ 6</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lời kết cam kết */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                <p>
                  Kênh Nhà Đất 24H cam kết duy trì hệ thống website ổn định, bảo mật và luôn đồng hành giải quyết mọi khó khăn kỹ thuật của quý thành viên.
                </p>
              </div>

            </article>
          </div>
        </main>
      </div>
    </>
  );
}
