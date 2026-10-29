import { SITE_URL } from '../utils/permalink';

/**
 * Next.js Metadata Route: robots.txt chuẩn Technical SEO
 * 1. Chặn bot thu thập tham số affiliate ?ref= để bảo vệ Crawl Budget
 * 2. Chặn đường dẫn chuyển hướng /r/
 * 3. Chặn các trang nội bộ admin và api
 */
export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*?*ref=',
          '/r/',
          '/admin/',
          '/api/',
          '/moi-gioi/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
