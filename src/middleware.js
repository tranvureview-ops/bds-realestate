import { NextResponse } from 'next/server';

/**
 * Middleware chuẩn Technical SEO Bất Động Sản
 * Xử lý 301 Redirect cho hệ thống phân trang permalink:
 * 1. Chuyển hướng URL cũ có query parameter ?page=2 sang /page/2/
 * 2. Chuyển hướng ?page=1 về URL gốc /
 * 3. Chuyển hướng URL biến thể /page/1 hoặc /page/1/ về URL gốc /
 * 4. Bảo lưu nguyên vẹn các tham số lọc khác (district, price, area, v.v.)
 */
export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Bỏ qua các tài nguyên tĩnh, API routes, và Next.js internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Xử lý trường hợp URL chứa segment /page/1 hoặc /page/1/
  if (/\/page\/1\/?$/i.test(pathname)) {
    const cleanPath = pathname.replace(/\/page\/1\/?$/i, '') || '/';
    const normalizedPath = cleanPath === '/' ? '/' : `${cleanPath}/`;
    const targetUrl = new URL(normalizedPath, request.url);
    
    // Bảo lưu các searchParams hiện có
    searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // 2. Xử lý trường hợp URL có query parameter ?page=...
  if (searchParams.has('page')) {
    const rawPage = searchParams.get('page');
    const pageNum = parseInt(rawPage, 10);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('page');
    const qs = newSearchParams.toString();

    // Chuẩn hóa basePath không có trailing slash để ghép nối
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '';

    if (pageNum === 1 || isNaN(pageNum) || pageNum < 1) {
      // Trang 1: Redirect về URL danh mục gốc kèm query khác (nếu có)
      const targetPath = cleanPath ? `${cleanPath}/` : '/';
      const targetUrl = new URL(qs ? `${targetPath}?${qs}` : targetPath, request.url);
      return NextResponse.redirect(targetUrl, { status: 301 });
    }

    if (pageNum > 1 && String(pageNum) === rawPage) {
      // Trang 2+: Redirect sang permalink phân trang tĩnh /page/{number}/
      const targetPath = cleanPath ? `${cleanPath}/page/${pageNum}/` : `/page/${pageNum}/`;
      const targetUrl = new URL(qs ? `${targetPath}?${qs}` : targetPath, request.url);
      return NextResponse.redirect(targetUrl, { status: 301 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả các đường dẫn trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Các file tĩnh có extension (.png, .jpg, .svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
