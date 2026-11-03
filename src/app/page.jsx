import HomePage from '../views/HomePage';

const SITE_URL = 'https://www.kenhnhadat24h.com.vn';

export async function generateMetadata() {
  const ogImageUrl = `${SITE_URL}/hero.png`;
  const ogTitle = 'Mua Bán Nhà Đất, Cho Thuê Bất Động Sản Toàn Quốc - Kênh Nhà Đất 24H';
  const ogDesc = 'Cổng thông tin mua bán và cho thuê bất động sản xác thực toàn quốc. Tra cứu nhà đất chính chủ, căn hộ, đất nền pháp lý chuẩn 24/7 - Kênh Nhà Đất 24H.';

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
          alt: 'Cổng thông tin mua bán và cho thuê bất động sản toàn quốc - Kênh Nhà Đất 24H'
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
