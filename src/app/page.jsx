import HomePage from '../views/HomePage';

const SITE_URL = 'https://www.kenhnhadat24h.com.vn';

export async function generateMetadata() {
  const ogImageUrl = 'https://www.kenhnhadat24h.com.vn';
  const ogTitle = 'Mua Bán Nhà Đất, Cho Thuê Bất Động Sản Toàn Quốc - Kênh Nhà Đất 24H';
  const ogDesc = 'Tìm mua bán nhà đất, cho thuê bất động sản trên toàn quốc. Khám phá nhà riêng, căn hộ, đất nền, dự án và đăng tin bất động sản miễn phí tại Kênh Nhà Đất 24H.';

  return {
    title: {
      absolute: ogTitle
    },
    description: ogDesc,
    robots: { index: true, follow: true },
    alternates: {
    canonical: SITE_URL,
    },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: 'Kênh Nhà Đất 24H',
      title: ogTitle,
      description: ogDesc,
      locale: 'vi_VN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Tìm mua bán nhà đất, cho thuê bất động sản trên toàn quốc. Khám phá nhà riêng, căn hộ, đất nền, dự án và đăng tin bất động sản miễn phí tại Kênh Nhà Đất 24H.'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [ogImageUrl]
    }
  };
}

export default function Page() {
  return <HomePage />;
}
