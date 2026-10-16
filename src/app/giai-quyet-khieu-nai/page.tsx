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
  title: `Quy Trình Giải Quyết Khiếu Nại | ${BRAND_NAME}`,
  description: `Cơ chế và quy trình 3 bước tiếp nhận, xử lý khiếu nại, tranh chấp giao dịch bất động sản tại ${BRAND_NAME}. Bảo vệ quyền lợi người tiêu dùng 24/7.`,
  alternates: {
    canonical: `${DOMAIN}/giai-quyet-khieu-nai`,
  },
  openGraph: {
    title: `Quy Trình Giải Quyết Khiếu Nại | ${BRAND_NAME}`,
    description: `Quy trình 3 bước tiếp nhận và xử lý khiếu nại giao dịch bất động sản minh bạch tại sàn ${BRAND_NAME}.`,
    url: `${DOMAIN}/giai-quyet-khieu-nai`,
    siteName: BRAND_NAME,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Giải Quyết Tranh Chấp & Khiếu Nại | ${BRAND_NAME}`,
    description: `Cơ chế tiếp nhận và bảo vệ quyền lợi người mua, người bán trên sàn giao dịch ${BRAND_NAME}.`,
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
  name: `Quy Trình Tiếp Nhận và Giải Quyết Khiếu Nại - ${BRAND_NAME}`,
  description: `Cơ chế giải quyết tranh chấp giao dịch bất động sản và bảo vệ quyền lợi người tiêu dùng tại ${BRAND_NAME}.`,
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
};

export default function DisputeResolutionPage() {
  const currentDateFormatted = '16/10/2026';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
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
                  Bảo vệ quyền lợi người tiêu dùng
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Cơ Chế Giải Quyết Tranh Chấp & Khiếu Nại {BRAND_NAME}
                </h1>
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                <p>Cập nhật: <strong className="text-slate-700">{currentDateFormatted}</strong></p>
                <p>Cam kết phản hồi: <strong className="text-blue-700">Trong vòng 24 giờ</strong></p>
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
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mục Lục Khiếu Nại
                  </h2>
                </div>

                <nav className="mt-4 space-y-1.5 text-xs">
                  <a
                    href="#nguyen-tac-giai-quyet"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>1. Nguyên tắc giải quyết tranh chấp</span>
                    <span className="text-[10px] text-slate-400 font-mono">01</span>
                  </a>
                  <a
                    href="#quy-trinh-3-buoc"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>2. Quy trình xử lý 3 bước</span>
                    <span className="text-[10px] text-slate-400 font-mono">02</span>
                  </a>
                  <a
                    href="#thoi-gian-cam-ket"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>3. Thời hiệu & thời gian cam kết</span>
                    <span className="text-[10px] text-slate-400 font-mono">03</span>
                  </a>
                  <a
                    href="#trach-nhiem-cac-ben"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>4. Trách nhiệm của các bên</span>
                    <span className="text-[10px] text-slate-400 font-mono">04</span>
                  </a>
                  <a
                    href="#bien-phap-che-tai"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>5. Biện pháp xử lý đối tượng vi phạm</span>
                    <span className="text-[10px] text-slate-400 font-mono">05</span>
                  </a>
                  <a
                    href="#thong-tin-dau-moi"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                  >
                    <span>6. Đầu mối liên hệ tiếp nhận</span>
                    <span className="text-[10px] text-slate-400 font-mono">06</span>
                  </a>
                </nav>

                <div className="mt-6 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-[11px] leading-relaxed text-blue-900">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-headset text-blue-600"></i> Hỗ trợ tiếp nhận khẩn cấp:
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
              
              <div className="mb-8 rounded-2xl bg-blue-50/60 p-4 border border-blue-200 text-xs text-blue-950 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-blue-950 mb-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Tôn chỉ phục vụ khách hàng
                </p>
                <p>
                  Sàn giao dịch <strong>{BRAND_NAME}</strong> luôn coi trọng quyền lợi hợp pháp của người tiêu dùng và khách hàng tìm kiếm bất động sản. Chúng tôi thiết lập quy trình giải quyết khiếu nại minh bạch, đa kênh và cam kết xử lý rốt ráo mọi phản ánh của người dùng nhằm xây dựng môi trường giao dịch an toàn và tin cậy.
                </p>
              </div>

              {/* Mục 1: Nguyên tắc giải quyết */}
              <section id="nguyen-tac-giai-quyet" className="scroll-mt-24 border-b border-slate-200 pb-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">1</span>
                  Nguyên Tắc Tiếp Nhận và Hòa Giải Tranh Chấp
                </h2>
                <div className="mt-3 space-y-2.5 text-sm text-slate-600 leading-relaxed">
                  <p>
                    Mọi khiếu nại, tranh chấp phát sinh giữa người mua và người bán liên quan đến tin đăng trên sàn <strong>{BRAND_NAME}</strong> đều được giải quyết trên các nguyên tắc cơ bản:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Ưu tiên thương lượng & hòa giải:</strong> Khuyến khích hai bên tự thỏa thuận khắc phục hậu quả trên tinh thần tôn trọng quyền lợi của nhau.</li>
                    <li><strong>Minh bạch & khách quan:</strong> Ban quản trị sàn giữ vai trò trung gian phân xử dựa trên chứng cứ giao dịch thực tế, nhật ký trao đổi và lịch sử tin đăng lưu trên hệ thống.</li>
                    <li><strong>Bảo vệ bên yếu thế:</strong> Ưu tiên bảo vệ người mua, người thuê nhà trước các hành vi lừa đảo đặt cọc, thông tin sai sự thật hoặc chiếm đoạt tài sản.</li>
                    <li><strong>Tuân thủ pháp luật:</strong> Nếu vụ việc không thể thương lượng và có dấu hiệu vi phạm pháp luật hình sự, sàn sẽ chủ động hướng dẫn các bên khởi kiện ra Tòa án có thẩm quyền hoặc chuyển giao hồ sơ cho cơ quan Công an.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 2: Quy trình 3 bước chuẩn */}
              <section id="quy-trinh-3-buoc" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">2</span>
                  Quy Trình 3 Bước Xử Lý Khiếu Nại Minh Bạch
                </h2>
                <p className="mt-2 text-sm text-slate-600">Quy trình xử lý phản ánh và khiếu nại được tiến hành theo 3 bước tuần tự:</p>

                <div className="mt-4 space-y-3">
                  {/* Bước 1 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 transition">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
                        01
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Bước 1: Tiếp nhận thông tin khiếu nại (Trong vòng 24 giờ)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Người khiếu nại gửi yêu cầu qua nút <strong>"Báo cáo tin vi phạm"</strong> trên bài đăng, gọi hotline <strong>{HOTLINE}</strong> hoặc gửi email tới <strong>{EMAIL}</strong>. Yêu cầu cần cung cấp:
                        </p>
                        <ul className="mt-1.5 list-disc pl-5 text-[11px] text-slate-500 space-y-0.5">
                          <li>Mã tin đăng hoặc đường dẫn URL của bất động sản bị phản ánh.</li>
                          <li>Tóm tắt nội dung vi phạm (Tin giả, sai giá, lừa đảo cọc, dự án ma).</li>
                          <li>Tài liệu chứng minh kèm theo: Hình ảnh chụp tin nhắn, giấy biên nhận đặt cọc, file ghi âm hoặc hợp đồng thỏa thuận (nếu có).</li>
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
                          Bước 2: Xác minh độc lập & Tạm dừng hiển thị tin rao (24h - 48h)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Ban Kiểm Soát & Thanh Tra sàn liên hệ trực tiếp với Người Đăng Tin bị khiếu nại và yêu cầu văn bản giải trình trong vòng 24 giờ.
                        </p>
                        <div className="mt-2 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-900 font-medium">
                          ⚡ Biện pháp khẩn cấp: Tin đăng bị khiếu nại sẽ được <strong>TẠM ẨN KHỎI HỆ THỐNG TÌM KIẾM</strong> ngay trong thời gian xác minh để ngăn chặn rủi ro cho những người mua khác.
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
                          Bước 3: Đưa ra phán quyết & Khắc phục hậu quả (Tối đa 72 giờ)
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Sau khi đối chiếu chứng cứ hai bên, Ban quản trị sàn ban hành văn bản kết luận giải quyết qua email cho các bên:
                        </p>
                        <ul className="mt-1.5 list-disc pl-5 text-[11px] text-slate-500 space-y-1">
                          <li><strong>Nếu khiếu nại đúng:</strong> Buộc Người Đăng Tin hoàn trả tiền cọc/bồi thường thỏa đáng cho người mua; khóa vĩnh viễn tài khoản người đăng tin vi phạm; công khai cảnh báo trên sàn.</li>
                          <li><strong>Nếu khiếu nại sai:</strong> Khôi phục trạng thái tin đăng và thông báo lý do bác đơn cho người khiếu nại.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mục 3: Thời hiệu & Cam kết thời gian */}
              <section id="thoi-gian-cam-ket" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">3</span>
                  Thời Hiệu Tiếp Nhận & Thời Gian Xử Lý Cam Kết
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3 border-b">Hạng mục quy định</th>
                        <th className="p-3 border-b">Thời hạn cam kết</th>
                        <th className="p-3 border-b">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Thời hiệu khiếu nại</td>
                        <td className="p-3 font-bold text-blue-600">30 ngày</td>
                        <td className="p-3 text-slate-500">Kể từ thời điểm xảy ra sự việc hoặc phát sinh giao dịch.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Phản hồi xác nhận tiếp nhận</td>
                        <td className="p-3 font-bold text-emerald-600">Dưới 24 giờ</td>
                        <td className="p-3 text-slate-500">Gửi mã số tiếp nhận hồ sơ vụ việc qua SMS/Email.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Giải quyết vụ việc thông thường</td>
                        <td className="p-3 font-bold text-slate-900">03 ngày làm việc</td>
                        <td className="p-3 text-slate-500">Áp dụng cho trường hợp thông tin sai giá, trùng lặp tin.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-800">Vụ việc phức tạp / Tranh chấp cọc</td>
                        <td className="p-3 font-bold text-amber-600">07 ngày làm việc</td>
                        <td className="p-3 text-slate-500">Có thông báo cập nhật tiến độ định kỳ cho người khiếu nại.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Mục 4: Trách nhiệm của các bên */}
              <section id="trach-nhiem-cac-ben" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">4</span>
                  Trách Nhiệm của Các Bên Trong Quá Trình Khiếu Nại
                </h2>
                <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">A. Người khiếu nại:</strong>
                    Cung cấp tài liệu trung thực, khách quan và chịu trách nhiệm pháp lý nếu cố tình vu khống, bôi nhọ uy tín người khác nhằm mục đích cạnh tranh không lành mạnh.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">B. Người bị khiếu nại:</strong>
                    Có nghĩa vụ chủ động phối hợp giải trình, cung cấp chứng từ pháp lý của bất động sản khi được yêu cầu; bồi hoàn thiệt hại thỏa đáng cho khách hàng nếu có sai phạm.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">C. Ban quản trị sàn {BRAND_NAME}:</strong>
                    Đóng vai trò trọng tài trung gian khách quan, áp dụng các chế tài kỹ thuật nghiêm khắc và hỗ trợ chuyển hồ sơ cơ quan pháp luật khi cần thiết.
                  </div>
                </div>
              </section>

              {/* Mục 5: Biện pháp chế tài */}
              <section id="bien-phap-che-tai" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">5</span>
                  Biện Pháp Chế Tài Đối Với Hành Vi Lừa Đảo Trục Lợi
                </h2>
                <div className="mt-3 text-xs text-slate-600 space-y-2">
                  <p>Đối với thành viên có hành vi gian dối, sàn sẽ áp dụng các biện pháp quyết liệt:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Khóa tài khoản vĩnh viễn, tịch thu toàn bộ số dư điểm/ví và không hoàn trả phí các gói tin VIP đã mua.</li>
                    <li>Đưa số điện thoại, số CCCD và tài khoản ngân hàng của đối tượng vào <strong>"Danh sách đen cảnh báo rủi ro"</strong> (Blacklist) trên toàn hệ thống.</li>
                    <li>Cung cấp địa chỉ IP, nhật ký hệ thống và thông tin liên quan cho Cơ quan Cảnh sát điều tra để khởi tố vụ án theo Điều 174 Bộ luật Hình sự về tội <em>"Lừa đảo chiếm đoạt tài sản"</em>.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 6: Đầu mối liên hệ tiếp nhận */}
              <section id="thong-tin-dau-moi" className="scroll-mt-24 pt-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">6</span>
                  Đầu Mối Tiếp Nhận Khiếu Nại & Hỗ Trợ Khách Hàng
                </h2>
                
                <div className="mt-4 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Trung Tâm Chăm Sóc Khách Hàng & Giải Quyết Tranh Chấp
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      SÀN GIAO DỊCH BẤT ĐỘNG SẢN {BRAND_NAME}
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Đường dây nóng khiếu nại (24/7):</p>
                      <p className="text-base font-black text-red-400 font-mono mt-1">
                        {HOTLINE}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Tiếp nhận phản ánh khẩn cấp</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Hộp thư điện tử tiếp nhận đơn:</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                        {EMAIL}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Phản hồi tự động có mã tiếp nhận</p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/80">
                      <p className="text-slate-400">Địa chỉ văn phòng tiếp công dân:</p>
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
                  Chúng tôi cam kết đồng hành cùng khách hàng xây dựng một thị trường bất động sản văn minh, an toàn và minh bạch.
                </p>
              </div>

            </article>
          </div>
        </main>
      </div>
    </>
  );
}
