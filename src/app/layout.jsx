import './globals.css';
import Script from 'next/script';
import ClientLayout from './ClientLayout';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: {
    default: 'Đất Biển Đà Nẵng - Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP Toàn Quốc',
    template: '%s | Đất Biển Đà Nẵng'
  },
  description: 'Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất Đà Nẵng và toàn quốc, đăng tin VIP hiệu quả cao, xác thực pháp lý minh bạch.',
  keywords: ['bất động sản đà nẵng', 'đất biển đà nẵng', 'mua bán nhà đất', 'cho thuê căn hộ', 'đăng tin bđs vip'],
  authors: [{ name: 'Đất Biển Đà Nẵng' }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'><path d='M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z'/></svg>"
  },
  openGraph: {
    title: 'Đất Biển Đà Nẵng - Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP Toàn Quốc',
    description: 'Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất Đà Nẵng và toàn quốc.',
    url: 'https://datbiendanang.vn',
    siteName: 'Đất Biển Đà Nẵng',
    locale: 'vi_VN',
    type: 'website'
  }
};

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { MOCK_USERS, DEFAULT_GUEST_USER } from '../data/mockData';
import { isSupabaseConfigured, fetchFullSupabaseDb } from '../lib/supabase';
import { getFontConfig } from '../utils/fontConfig';

async function getInitialDb() {
  try {
    if (isSupabaseConfigured()) {
      try {
        const cloudData = await fetchFullSupabaseDb();
        if (cloudData && (cloudData.bds_properties?.length > 0 || cloudData.bds_header_config)) {
          return cloudData;
        }
      } catch (err) {
        console.warn('Lỗi kết nối Supabase trong RootLayout, fallback server-db.json:', err.message);
      }
    }
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (e) {
    console.error('Error reading server-db.json in layout:', e);
  }
  return null;
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
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="server-google-font-link"
          href={fontConfig.googleFontUrl}
          rel="stylesheet"
        />
        <style
          id="app-ssr-font-override"
          dangerouslySetInnerHTML={{
            __html: `
              :root { --font-custom-family: ${fontConfig.fontFamily}; }
              html, body, #__next, .font-sans, button, input, select, textarea, h1, h2, h3, h4, h5, h6, p, span, a {
                font-family: ${fontConfig.fontFamily} !important;
              }
            `
          }}
        />
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>
        {/* Leaflet JS */}
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="beforeInteractive"
        />
        <ClientLayout initialDb={initialDb} initialUser={initialUser}>{children}</ClientLayout>
      </body>
    </html>
  );
}
