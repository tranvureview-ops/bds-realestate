// Danh mục phông chữ chuẩn hoá toàn bộ hệ thống - DUY NHẤT ROBOTO (Local Self-hosted)
export const AVAILABLE_FONTS = [
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'Phổ biến, Thân thiện, Tối ưu tiếng Việt và tương thích mọi thiết bị (Mặc định)',
    fontFamily: "'Roboto', 'App Font Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    cssValue: "'Roboto', 'App Font Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    fallbackMetrics: {
      ascent: '92.8%',
      descent: '24.4%',
      lineGap: '0%',
      sizeAdjust: '100%'
    },
    primaryPreloadWoff2: '/fonts/roboto/roboto-400-vietnamese.woff2',
    sampleHeadline: 'Sàn Giao Dịch Nhà Đất Kênh Nhà Đất 24H',
    sampleText: 'Phông chữ Roboto tải trực tiếp từ thư viện nội bộ, hiển thị mượt mà và tải trang tức thì.',
    samplePrice: '4.850.000.000 ₫'
  }
];

export const DEFAULT_FONT_NAME = 'Roboto';

export const getFontConfig = (_fontNameOrId) => {
  return AVAILABLE_FONTS[0];
};

/**
 * Áp dụng phông chữ Roboto vào toàn bộ DOM và mọi thành phần UI trên trang
 */
export const applyFontToDom = () => {
  if (typeof document === 'undefined') return;
  const fontObj = AVAILABLE_FONTS[0];

  // Nếu SSR đã thiết lập sẵn font-override thì không chèn lại để tránh làm layout bị re-flow giật chữ
  const existingSsrStyle = document.getElementById('app-ssr-font-override');
  if (existingSsrStyle) {
    document.documentElement.style.setProperty('--font-custom-family', fontObj.fontFamily);
    return;
  }

  document.documentElement.style.setProperty('--font-custom-family', fontObj.fontFamily);
  document.documentElement.style.fontFamily = fontObj.fontFamily;
  if (document.body) {
    document.body.style.fontFamily = fontObj.fontFamily;
  }

  const styleId = 'app-dynamic-font-override';
  let styleElem = document.getElementById(styleId);
  if (!styleElem) {
    styleElem = document.createElement('style');
    styleElem.id = styleId;
    document.head.appendChild(styleElem);
  }
  styleElem.innerHTML = `
    @font-face {
      font-family: 'App Font Fallback';
      src: local('Arial'), local('Segoe UI');
      ascent-override: 92.8%;
      descent-override: 24.4%;
      line-gap-override: 0%;
      size-adjust: 100%;
    }
    :root {
      --font-custom-family: ${fontObj.fontFamily};
    }
    html, body {
      font-family: var(--font-custom-family, ${fontObj.fontFamily}) !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    button, input, select, textarea, optgroup, option, label {
      font-family: inherit !important;
    }
    .font-mono, .font-sans {
      font-family: var(--font-custom-family, ${fontObj.fontFamily}) !important;
    }
    .font-mono {
      font-variant-numeric: tabular-nums;
    }
  `;
};
