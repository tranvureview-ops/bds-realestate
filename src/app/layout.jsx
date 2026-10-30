import './globals.css';
import './fontawesome.css';
import Script from 'next/script';
import ClientLayout from './ClientLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { MOCK_USERS, DEFAULT_GUEST_USER } from '../data/mockData';
import { isSupabaseConfigured, fetchFullSupabaseDb } from '../lib/supabase';
import { getFontConfig } from '../utils/fontConfig';

const getInitialDb = cache(async () => {
  try {
    if (isSupabaseConfigured()) {
      try {
        const cloudData = await fetchFullSupabaseDb();
        if (cloudData && (cloudData.bds_properties?.length > 0 || cloudData.bds_header_config)) {
          if (Array.isArray(cloudData.bds_properties)) {
            cloudData.bds_properties = cloudData.bds_properties.filter(p => !p.city || p.city === 'Đà Nẵng' || p.city.includes('Đà Nẵng') || p.city === 'Quảng Nam' || p.city.includes('Quảng Nam'));
          }
          return cloudData;
        }
      } catch (err) {
        console.warn('Lỗi kết nối Supabase trong RootLayout, fallback server-db.json:', err.message);
      }
    }
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(content || '{}');
      if (Array.isArray(parsed.bds_properties)) {
        parsed.bds_properties = parsed.bds_properties.filter(p => !p.city || p.city === 'Đà Nẵng' || p.city.includes('Đà Nẵng') || p.city === 'Quảng Nam' || p.city.includes('Quảng Nam'));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading server-db.json in layout:', e);
  }
  return null;
});

export async function generateMetadata() {
  const db = await getInitialDb();
  const sys = db?.bds_system_config || {};
  const brand = sys.brandShortName || 'Sàn Bất Động Sản';
  const desc = sys.tagline 
    ? `${brand} - ${sys.tagline}. Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất và đăng tin VIP hiệu quả cao.`
    : 'Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất toàn quốc, đăng tin VIP hiệu quả cao, xác thực pháp lý minh bạch.';

  return {
    title: {
      default: `${brand} - Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP Toàn Quốc`,
      template: `%s | ${brand}`
    },
    description: desc,
    keywords: [brand.toLowerCase(), 'bất động sản', 'mua bán nhà đất', 'cho thuê căn hộ', 'đăng tin bđs vip'],
    authors: [{ name: brand }],
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'><path d='M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z'/></svg>"
    },
    openGraph: {
      title: `${brand} - Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP Toàn Quốc`,
      description: desc,
      url: 'https://datbiendanang.vn',
      siteName: brand,
      locale: 'vi_VN',
      type: 'website'
    }
  };
}

export default async function RootLayout({ children }) {
  const initialDb = await getInitialDb();

  let initialUser = DEFAULT_GUEST_USER;
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('bds_session_user')?.value;
    if (sessionUserId && sessionUserId !== 'guest') {
      const allUsers = (initialDb && Array.isArray(initialDb.bds_users_list)) ? initialDb.bds_users_list : MOCK_USERS;
      const found = allUsers.find(u => u.id === sessionUserId);
      if (found) {
        initialUser = found;
      }
    }
  } catch (e) {
    // fallback if cookies() not available
  }

  const activeFontFamily = initialDb?.bds_system_config?.fontFamily || 'Plus Jakarta Sans';
  const fontConfig = getFontConfig(activeFontFamily);

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Trusted Types Default Policy để hỗ trợ CSP require-trusted-types-for và chống DOM XSS an toàn */}
        <script
          id="trusted-types-policy"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
                try {
                  if (!window.trustedTypes.defaultPolicy) {
                    window.trustedTypes.createPolicy('default', {
                      createHTML: function(s) { return s; },
                      createScript: function(s) { return s; },
                      createScriptURL: function(s) { return s; }
                    });
                  }
                } catch (e) {}
              }
            `
          }}
        />
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical styling assets */}
        <link
          rel="preload"
          as="style"
          href={fontConfig.googleFontUrl}
        />
        <link
          rel="preload"
          as="style"
          href="/leaflet/leaflet.css"
        />
        {/* Non-render-blocking Asynchronous Stylesheet Injector to eliminate Critical Request Chains */}
        <script
          id="server-async-styles"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function loadCSS(href, id) {
                  var l = document.createElement('link');
                  if (id) l.id = id;
                  l.rel = 'stylesheet';
                  l.href = href;
                  document.head.appendChild(l);
                }
                loadCSS('${fontConfig.googleFontUrl}', 'server-google-font-link');
                loadCSS('/leaflet/leaflet.css', 'server-leaflet-css');
              })();
            `
          }}
        />
        <noscript>
          <link rel="stylesheet" href={fontConfig.googleFontUrl} />
          <link rel="stylesheet" href="/leaflet/leaflet.css" />
        </noscript>
        <style
          id="app-ssr-font-override"
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'Plus Jakarta Sans Fallback';
                src: local('Arial'), local('Helvetica'), local('sans-serif');
                ascent-override: 96%;
                descent-override: 24%;
                line-gap-override: 0%;
                size-adjust: 100%;
              }
              :root { --font-custom-family: ${fontConfig.fontFamily}; }
              html, body {
                font-family: var(--font-custom-family, ${fontConfig.fontFamily}), 'Plus Jakarta Sans Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              button, input, select, textarea, optgroup, option, label {
                font-family: inherit !important;
              }
              .font-mono, .font-sans {
                font-family: var(--font-custom-family, ${fontConfig.fontFamily}), 'Plus Jakarta Sans Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
              }
              .font-mono {
                font-variant-numeric: tabular-nums;
              }
            `
          }}
        />
        {/* Preload Font Awesome Webfonts locally with font-display: swap */}
        <link
          rel="preload"
          href="/webfonts/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/webfonts/fa-regular-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/webfonts/fa-brands-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        {/* Leaflet JS (Self-hosted locally & lazy loaded on idle) */}
        <Script
          src="/leaflet/leaflet.js"
          strategy="lazyOnload"
        />
        <ClientLayout initialDb={initialDb} initialUser={initialUser}>{children}</ClientLayout>
      </body>
    </html>
  );
}
