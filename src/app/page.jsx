import HomePage from '../views/HomePage';

const SITE_URL = 'https://kenhnhadat24h.com.vn';

export async function generateMetadata() {
  const ogImageUrl = `${SITE_URL}/hero.png`;
  const ogTitle = 'Kênh Nhà Đất 24H - Mua Bán Nhà Đất, Cho Thuê Bất Động Sản Toàn Quốc';
  const ogDesc = 'Kênh Nhà Đất 24H - Tìm kiếm nhà đất bán, căn hộ, đất nền, nhà phố, biệt thự và bất động sản cho thuê trên toàn quốc. Kết nối người mua, người bán và môi giới.';

  return {
    title: {
      absolute: ogTitle
    },
    description: ogDesc,
    keywords: 'kênh nhà đất 24h, mua bán nhà đất, bất động sản toàn quốc, cho thuê nhà đất, nhà đất chính chủ, căn hộ chung cư, đất nền dự án, định giá bất động sản, pháp lý nhà đất, sổ hồng riêng',
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
          alt: 'Kênh Nhà Đất 24H - Cổng thông tin mua bán và cho thuê bất động sản toàn quốc'
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
