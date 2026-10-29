import { NextResponse } from 'next/server';

/**
 * Route Handler xử lý Shortlink Tiếp thị liên kết (Affiliate Shortlink)
 * Định dạng: https://datbiendanang.vn/r/[refCode]
 * Quy trình:
 * 1. Trích xuất và chuẩn hóa refCode
 * 2. Thiết lập Cookie 30 ngày (bds_aff_ref)
 * 3. HTTP 302 Redirect về trang đăng ký thành viên
 * 4. Chặn Googlebot lập chỉ mục (X-Robots-Tag: noindex, nofollow)
 */
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const rawCode = resolvedParams?.refCode || '';
  const cleanRefCode = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

  const targetUrl = new URL('/dang-ky/', request.url);
  targetUrl.searchParams.set('utm_source', 'affiliate');
  if (cleanRefCode) {
    targetUrl.searchParams.set('ref', cleanRefCode);
  }

  const response = NextResponse.redirect(targetUrl, { status: 302 });

  // Thiết lập Cookie lưu mã người giới thiệu trong 30 ngày
  if (cleanRefCode) {
    response.cookies.set({
      name: 'bds_aff_ref',
      value: cleanRefCode,
      maxAge: 30 * 24 * 60 * 60, // 30 ngày = 2.592.000 giây
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Để client-side JavaScript có thể đọc và tự điền vào form đăng ký
    });
  }

  // Header bảo mật SEO ngăn Googlebot index shortlink
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}
