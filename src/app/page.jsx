import HomePage from '../views/HomePage';

const SITE_URL = 'https://kenhnhadat24h.com.vn';

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Kênh Nhà Đất 24H',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/nha-dat-ban?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Kênh Nhà Đất 24H',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Cổng thông tin mua bán, cho thuê bất động sản toàn quốc: căn hộ chung cư, nhà phố, đất nền dự án, biệt thự nghỉ dưỡng.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Vietnamese',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Vietnam',
  },
};

export async function generateMetadata() {
  return {
    title: {
      absolute: 'Kênh Nhà Đất 24H – Mua Bán & Cho Thuê Bất Động Sản Toàn Quốc'
    },
    description: 'Kenhnhadat24h.com.vn – Cổng thông tin mua bán, cho thuê bất động sản toàn quốc: căn hộ chung cư, nhà phố, đất nền dự án, biệt thự nghỉ dưỡng. Dữ liệu nguồn cung xác thực, sổ hồng riêng và định giá minh bạch 24/7.',
    keywords: 'kênh nhà đất 24h, mua bán nhà đất, bất động sản toàn quốc, cho thuê nhà đất, nhà đất chính chủ, căn hộ chung cư, đất nền dự án, định giá bất động sản, pháp lý nhà đất, sổ hồng riêng',
    robots: { index: true, follow: true },
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: 'Kênh Nhà Đất 24H',
      title: 'Kênh Nhà Đất 24H – Mua Bán & Cho Thuê Bất Động Sản Toàn Quốc',
      description: 'Cổng thông tin bất động sản: mua bán, cho thuê căn hộ, nhà phố, đất nền toàn quốc. Dữ liệu nguồn cung xác thực, sổ hồng riêng và định giá minh bạch 24/7.',
      locale: 'vi_VN',
    },
  };
}

export default function Page() {
  return (
    <>
      {/* JSON-LD Schema Markup – WebSite + SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
      />
      {/* JSON-LD Schema Markup – RealEstateAgent / Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
      />
      <HomePage />
    </>
  );
}
