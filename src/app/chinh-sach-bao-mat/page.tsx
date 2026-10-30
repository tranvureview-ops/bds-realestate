import type { Metadata } from 'next';
import Link from 'next/link';

// ============================================================================
// HẰNG SỐ THÔNG TIN THƯƠNG HIỆU ĐỒNG BỘ CÀI ĐẶT WEBSITE
// ============================================================================
const BRAND_NAME = 'Đất Biển Đà Nẵng';
const COMPANY_NAME = 'Sàn Giao Dịch Bất Động Sản Đất Biển Đà Nẵng';
const HOTLINE = '0904 084 888';
const EMAIL = 'tranvanvu.dev@gmail.com';
const ADDRESS = 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
const DOMAIN = 'https://bds-realestate.vercel.app';

// ============================================================================
// 1. METADATA API CHUẨN SEO GOOGLE (TITLE < 60 chars, DESC < 160 chars)
// ============================================================================
export const metadata: Metadata = {
  title: `Chính Sách Bảo Mật Dữ Liệu | ${BRAND_NAME}`,
  description: `Chính sách bảo mật thông tin và dữ liệu cá nhân tại ${BRAND_NAME}. Cam kết không chia sẻ dữ liệu bên thứ ba, tuân thủ Nghị định 13/2023/NĐ-CP.`,
  alternates: {
    canonical: `${DOMAIN}/chinh-sach-bao-mat`,
  },
  openGraph: {
    title: `Chính Sách Bảo Mật Dữ Liệu | ${BRAND_NAME}`,
    description: `Chính sách bảo mật thông tin người dùng tại sàn ${BRAND_NAME}. Tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP.`,
    url: `${DOMAIN}/chinh-sach-bao-mat`,
    siteName: BRAND_NAME,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Chính Sách Bảo Mật Thông Tin | ${BRAND_NAME}`,
    description: `Bảo vệ dữ liệu cá nhân và quyền riêng tư của thành viên tại ${BRAND_NAME}.`,
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
  name: `Chính Sách Bảo Mật Thông Tin và Dữ Liệu Cá Nhân - ${BRAND_NAME}`,
  description: `Cam kết bảo vệ dữ liệu cá nhân theo Nghị định số 13/2023/NĐ-CP của Chính phủ tại Sàn BĐS ${BRAND_NAME}.`,
  url: `${DOMAIN}/chinh-sach-bao-mat`,
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

export default function PrivacyPolicyPage() {
  const currentDateFormatted = '16/10/2026';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
        {/* Header Trang & Breadcrumb */}
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/" className="transition hover:text-emerald-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li>
                  <Link href="/chinh-sach-phap-ly" className="transition hover:text-emerald-600">
                    Chính sách pháp lý
                  </Link>
                </li>
                <li>
                  <span className="text-slate-300">/</span>
                </li>
                <li className="font-semibold text-slate-800" aria-current="page">
                  Chính sách bảo mật
                </li>
              </ol>
            </nav>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Tuân thủ Nghị định 13/2023/NĐ-CP
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Chính Sách Bảo Mật Thông Tin & Dữ Liệu {BRAND_NAME}
                </h1>
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                <p>Cập nhật: <strong className="text-slate-700">{currentDateFormatted}</strong></p>
                <p>Tiêu chuẩn: <strong className="text-emerald-700">Mã hóa SSL 256-bit</strong></p>
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
              <span className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-white shadow-sm flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-[11px]"></i>
                2. Chính sách bảo mật
              </span>
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

        {/* Thân bài viết */}
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Cột Trái: Mục lục tự động (TOC Sticky) */}
            <aside className="lg:col-span-3">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Mục Lục Bảo Mật
                  </h2>
                </div>

                <nav aria-label="Mục lục nội dung" className="mt-4 space-y-1.5 text-xs">
                  <Link
                    href="#muc-dich-thu-thap"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>1. Mục đích thu thập thông tin</span>
                    <span className="text-[10px] text-slate-400 font-mono">01</span>
                  </Link>
                  <Link
                    href="#pham-vi-su-dung"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>2. Phạm vi sử dụng thông tin</span>
                    <span className="text-[10px] text-slate-400 font-mono">02</span>
                  </Link>
                  <Link
                    href="#thoi-gian-luu-tru"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>3. Thời gian lưu trữ dữ liệu</span>
                    <span className="text-[10px] text-slate-400 font-mono">03</span>
                  </Link>
                  <Link
                    href="#cam-ket-khong-chia-se"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>4. Cam kết không chia sẻ bên thứ ba</span>
                    <span className="text-[10px] text-slate-400 font-mono">04</span>
                  </Link>
                  <Link
                    href="#bien-phap-an-toan"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>5. Công nghệ bảo mật & mã hóa</span>
                    <span className="text-[10px] text-slate-400 font-mono">05</span>
                  </Link>
                  <Link
                    href="#quyen-chu-the-du-lieu"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>6. Quyền của chủ thể dữ liệu</span>
                    <span className="text-[10px] text-slate-400 font-mono">06</span>
                  </Link>
                  <Link
                    href="#dau-moi-lien-he"
                    className="flex items-center justify-between rounded-lg p-2 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-600"
                  >
                    <span>7. Đầu mối phụ trách an toàn dữ liệu</span>
                    <span className="text-[10px] text-slate-400 font-mono">07</span>
                  </Link>
                </nav>

                <div className="mt-6 rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100 text-[11px] leading-relaxed text-emerald-900">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <i className="fa-solid fa-lock text-emerald-600"></i> Bảo vệ dữ liệu cá nhân
                  </p>
                  <p className="mt-1">
                    Yêu cầu xóa dữ liệu hoặc phản ánh rò rỉ gửi về: <strong className="font-mono text-emerald-800">{EMAIL}</strong>
                  </p>
                </div>
              </div>
            </aside>

            {/* Cột Phải: Nội dung chi tiết */}
            <article className="lg:col-span-9 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700">
              
              <div className="mb-8 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-emerald-950 mb-1 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tuyên ngôn bảo vệ quyền riêng tư
                </p>
                <p>
                  Sàn giao dịch bất động sản <strong>{BRAND_NAME}</strong> coi trọng việc bảo vệ dữ liệu cá nhân của người dùng như một trong những nguyên tắc cốt lõi hàng đầu. Toàn bộ hoạt động thu thập, lưu trữ và xử lý dữ liệu được thực thi nghiêm túc theo <strong>Nghị định số 13/2023/NĐ-CP</strong> của Chính phủ về Bảo vệ dữ liệu cá nhân.
                </p>
              </div>

              {/* Mục 1: Mục đích thu thập */}
              <section id="muc-dich-thu-thap" className="scroll-mt-24 border-b border-slate-200 pb-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">1</span>
                  Mục Đích Thu Thập Dữ Liệu Cá Nhân
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Chúng tôi chỉ thu thập các thông tin thực sự cần thiết phục vụ cho việc vận hành sàn giao dịch, đảm bảo an toàn giao dịch và tuân thủ các quy định quản lý của Nhà nước:
                </p>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">A. Thông tin định danh tài khoản:</strong>
                    Bao gồm <strong>Họ tên, Số điện thoại, Địa chỉ Email, Mật khẩu đăng nhập</strong> (được mã hóa một chiều). Dùng để xác thực chủ tài khoản, kích hoạt tin đăng và bảo mật tài khoản người dùng.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">B. Thông tin phục vụ giao dịch tài chính & KYC:</strong>
                    Bao gồm số Căn cước công dân (CCCD), tài khoản ngân hàng thụ hưởng (khi nạp/rút tiền ví tài khoản) và thông tin xuất hóa đơn giá trị gia tăng (VAT) theo Luật Quản lý thuế.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 text-sm block mb-1">C. Dữ liệu kỹ thuật & Cookies:</strong>
                    Địa chỉ IP, loại thiết bị, trình duyệt web, thời gian truy cập và nhật ký tương tác để phòng chống tấn công gian lận, ngăn ngừa bot spam và cải thiện trải nghiệm người dùng.
                  </div>
                </div>
              </section>

              {/* Mục 2: Phạm vi sử dụng */}
              <section id="pham-vi-su-dung" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">2</span>
                  Phạm Vi Sử Dụng Dữ Liệu Cá Nhân
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Thông tin thu thập từ thành viên chỉ được sử dụng trong phạm vi nội bộ sàn <strong>{BRAND_NAME}</strong> nhằm:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Hiển thị thông tin liên hệ của Người Đăng Tin trên bài rao để khách hàng quan tâm có thể gọi điện, nhắn tin Zalo trao đổi bất động sản.</li>
                    <li>Gửi email tự động thông báo kết quả duyệt tin, biên lai thanh toán gói tin VIP và cảnh báo tin hết hạn.</li>
                    <li>Xác minh danh tính khi người dùng yêu cầu khôi phục mật khẩu hoặc xử lý khiếu nại tranh chấp tài khoản.</li>
                    <li>Nghiên cứu thị trường và tối ưu hóa tốc độ tải trang dựa trên thống kê hành vi ẩn danh.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 3: Thời gian lưu trữ */}
              <section id="thoi-gian-luu-tru" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">3</span>
                  Thời Gian Lưu Trữ Dữ Liệu
                </h2>
                <div className="mt-3 text-sm text-slate-600 space-y-2">
                  <p>
                    Dữ liệu cá nhân của thành viên sẽ được lưu trữ an toàn trên máy chủ của sàn cho đến khi có yêu cầu hủy bỏ từ chính chủ thể dữ liệu, hoặc thành viên tự thực hiện xóa tài khoản trong trang cá nhân.
                  </p>
                  <p>
                    Đối với các dữ liệu lịch sử giao dịch tài chính (mua gói tin VIP, nạp tiền ví), hệ thống sẽ lưu trữ tối thiểu <strong>05 năm</strong> căn cứ theo quy định của Luật Kế toán và Luật Quản lý thuế của Nhà nước.
                  </p>
                </div>
              </section>

              {/* Mục 4: Cam kết không chia sẻ */}
              <section id="cam-ket-khong-chia-se" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">4</span>
                  Cam Kết Tuyệt Đối Không Bán / Chia Sẻ Cho Bên Thứ Ba
                </h2>
                <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-950 space-y-2">
                  <strong className="text-rose-900 text-sm block">⚠️ Nguyên tắc bảo mật tuyệt đối:</strong>
                  <p>
                    Ban quản trị <strong>{BRAND_NAME} cam kết tuyệt đối không bán, không cho thuê, không trao đổi danh sách số điện thoại hay email của khách hàng cho các đơn vị tiếp thị telesale, bảo hiểm, chứng khoán hoặc bất kỳ bên thứ ba nào</strong>.
                  </p>
                  <p className="text-rose-800">
                    Trường hợp duy nhất cung cấp thông tin: Khi có văn bản đề nghị phối hợp điều tra từ Cơ quan Cảnh sát điều tra, Viện Kiểm sát hoặc Tòa án nhân dân theo đúng trình tự tố tụng hình sự pháp luật Việt Nam.
                  </p>
                </div>
              </section>

              {/* Mục 5: Biện pháp an toàn kỹ thuật */}
              <section id="bien-phap-an-toan" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">5</span>
                  Biện Pháp Kỹ Thuật Bảo Mật Hệ Thống
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">🔐 Mã hóa một chiều (Bcrypt / Argon2):</strong>
                    Mật khẩu thành viên được mã hóa hàm băm ngay trên thiết bị; kể cả kỹ thuật viên quản trị hệ thống cũng không thể đọc được mật khẩu gốc.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">🛡️ Giao thức bảo mật SSL/TLS 256-bit:</strong>
                    Toàn bộ đường truyền kết nối giữa người dùng và máy chủ được mã hóa chống nghe lén và bảo vệ phiên đăng nhập an toàn.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">⚡ Tường lửa Cloudflare & Tự động sao lưu:</strong>
                    Bảo vệ hạ tầng trước các đợt tấn công từ chối dịch vụ (DDoS) và sao lưu cơ sở dữ liệu định kỳ mỗi 24 giờ.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">👥 Phân quyền truy cập nội bộ (RBAC):</strong>
                    Chỉ nhân sự được phân quyền cụ thể mới được phép tra cứu hồ sơ để hỗ trợ khách hàng, mọi hành vi truy cập đều được ghi nhật ký hệ thống (Audit Logs).
                  </div>
                </div>
              </section>

              {/* Mục 6: Quyền chủ thể dữ liệu */}
              <section id="quyen-chu-the-du-lieu" className="scroll-mt-24 border-b border-slate-200 py-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">6</span>
                  Quyền Hạn của Chủ Thể Dữ Liệu
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Theo quy định tại Nghị định 13/2023/NĐ-CP, bạn có các quyền hợp pháp sau:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Quyền được biết & tra cứu:</strong> Xem toàn bộ dữ liệu hồ sơ cá nhân và lịch sử tin đăng của mình bất kỳ lúc nào.</li>
                    <li><strong>Quyền chỉnh sửa:</strong> Cập nhật, điều chỉnh số điện thoại, ảnh đại diện, mật khẩu trong trang quản lý tài khoản.</li>
                    <li><strong>Quyền yêu cầu xóa bỏ dữ liệu (Right to Erasure):</strong> Yêu cầu Ban quản trị xóa vĩnh viễn tài khoản và toàn bộ thông tin cá nhân khỏi hệ thống. Chúng tôi cam kết xử lý hoàn tất trong vòng <strong>72 giờ làm việc</strong>.</li>
                    <li><strong>Quyền rút lại sự đồng ý:</strong> Có quyền hủy đăng ký nhận bản tin quảng cáo hoặc khuyến mãi bất động sản qua email chỉ bằng một cú nhấp chuột.</li>
                  </ul>
                </div>
              </section>

              {/* Mục 7: Đầu mối phụ trách an toàn dữ liệu */}
              <section id="dau-moi-lien-he" className="scroll-mt-24 pt-8">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">7</span>
                  Đầu Mối Phụ Trách Bảo Vệ Dữ Liệu Cá Nhân
                </h2>
                <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-white text-xs space-y-2">
                  <p className="text-emerald-400 font-bold uppercase tracking-wider">
                    Ban An Toàn Thông Tin & Pháp Chế - {BRAND_NAME}
                  </p>
                  <p>Cơ quan chủ quản: <strong className="text-slate-200">{COMPANY_NAME}</strong></p>
                  <p>Hotline khẩn cấp 24/7: <strong className="text-emerald-400 font-mono text-sm">{HOTLINE}</strong></p>
                  <p>Email tiếp nhận yêu cầu bảo mật: <strong className="text-slate-200 font-mono">{EMAIL}</strong></p>
                  <p>Địa chỉ văn phòng: <span className="text-slate-300">{ADDRESS}</span></p>
                </div>
              </section>

              {/* Lời kết cam kết */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                <p>
                  Chính sách bảo mật này có hiệu lực từ ngày công bố. Mọi thay đổi về chính sách sẽ được thông báo trước 07 ngày trên trang chủ của sàn <strong>{BRAND_NAME}</strong>.
                </p>
              </div>

            </article>
          </div>
        </main>
      </div>
    </>
  );
}
