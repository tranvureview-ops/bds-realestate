import PostListingPage from '../../views/PostListingPage';
import { SITE_URL } from '../../utils/permalink';
import { POST_LISTING_FAQS } from '../../data/mockData';

export function generateMetadata() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const currentYear = new Date().getFullYear();
  const canonicalUrl = `${baseUrl}/dang-tin`;
  const ogImg = `${baseUrl}/mua-ban-nha-dat-toan-quoc.webp`;

  const title = `Đăng tin mua bán nhà đất miễn phí [${currentYear}] | Kênh Nhà Đất 24H`;
  const description = `Đăng tin bán nhà, cho thuê căn hộ, đất nền miễn phí ${currentYear} tại Kênh Nhà Đất 24H. Hỗ trợ gắn GPS, VR 360°, duyệt nhanh & gói VIP tiếp cận x30.`;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      'đăng tin nhà đất miễn phí',
      'đăng tin mua bán bất động sản',
      'đăng tin cho thuê nhà đất',
      'đăng tin bán nhà chính chủ',
      'đăng tin bđs kênh nhà đất 24h',
      'đăng tin vip bất động sản',
    ],
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      siteName: 'Kênh Nhà Đất 24H',
      title,
      description,
      locale: 'vi_VN',
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          type: 'image/webp',
          alt: 'Đăng tin mua bán & cho thuê nhà đất miễn phí - Kênh Nhà Đất 24H',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImg],
    },
  };
}

export default function Page() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/dang-tin`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Đăng Tin Mua Bán & Cho Thuê Nhà Đất',
        item: canonicalUrl,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Dịch vụ Đăng Tin Mua Bán & Cho Thuê Bất Động Sản Trực Tuyến',
    serviceType: 'Đăng tin quảng cáo bất động sản trực tuyến miễn phí và gói VIP',
    url: canonicalUrl,
    provider: {
      '@type': 'Organization',
      name: 'Kênh Nhà Đất 24H',
      url: baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    offers: {
      '@type': 'Offer',
      name: 'Gói Tin Thường 60 ngày',
      price: '0',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: POST_LISTING_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PostListingPage />
    </>
  );
}
