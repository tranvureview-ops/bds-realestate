import fs from 'fs';
import path from 'path';
import MembershipPage from '../../views/MembershipPage';
import { SITE_URL } from '../../utils/permalink';
import { MEMBERSHIP_PACKAGES } from '../../data/mockData';
import { MEMBERSHIP_FAQS, getPremiumPackageSavePercent } from '../../utils/membershipHelper';
import { getServerSsrDbCache } from '../../utils/serverDbCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function resolveServerMembershipPackages() {
  try {
    const cached = getServerSsrDbCache();
    if (Array.isArray(cached?.bds_membership_packages) && cached.bds_membership_packages.length > 0) {
      return cached.bds_membership_packages;
    }
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const parsed = JSON.parse(fs.readFileSync(dbFile, 'utf8') || '{}');
      if (Array.isArray(parsed?.bds_membership_packages) && parsed.bds_membership_packages.length > 0) {
        return parsed.bds_membership_packages;
      }
    }
  } catch (_) {}
  return MEMBERSHIP_PACKAGES;
}

export async function generateMetadata() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const currentYear = new Date().getFullYear();
  const packages = resolveServerMembershipPackages();
  const maxSavePercent = getPremiumPackageSavePercent(packages);
  const canonicalUrl = `${baseUrl}/goi-hoi-vien`;
  const ogImg = `${baseUrl}/mua-ban-nha-dat-toan-quoc.webp`;

  const title = `Gói hội viên môi giới giá tốt ${currentYear} | Kênh Nhà Đất 24H`;
  const description = `Đăng ký gói hội viên môi giới BĐS ${currentYear} chỉ từ 299.000đ/tháng, tiết kiệm tới ${maxSavePercent}%. Tặng kho voucher đăng tin thường, đẩy tin, giảm tin VIP. Xem ngay!`;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      'gói hội viên môi giới nhà đất',
      'gói hội viên kênh nhà đất 24h',
      'đăng ký hội viên đăng tin bất động sản',
      'bảng giá gói hội viên môi giới',
      'voucher đẩy tin bất động sản',
      'gói đăng tin bđs giá rẻ 2026',
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
          alt: 'Gói Hội Viên Môi Giới Bất Động Sản - Kênh Nhà Đất 24H',
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
  const canonicalUrl = `${baseUrl}/goi-hoi-vien`;
  const packages = resolveServerMembershipPackages();

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
        name: 'Gói Hội Viên Môi Giới Bất Động Sản',
        item: canonicalUrl,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Gói Hội Viên Môi Giới Bất Động Sản Kênh Nhà Đất 24H',
    serviceType: 'Gói dịch vụ đăng tin và đẩy tin bất động sản định kỳ cho môi giới',
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
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Bảng Giá Các Gói Hội Viên Môi Giới BĐS',
      itemListElement: (packages || []).map((pkg) => ({
        '@type': 'Offer',
        name: pkg.name,
        description: pkg.targetAudience || pkg.name,
        url: canonicalUrl,
        priceCurrency: 'VND',
        price: Number(pkg.monthlyPrice || pkg.billingCycles?.[0]?.price || 0),
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: Number(pkg.monthlyPrice || pkg.billingCycles?.[0]?.price || 0),
          priceCurrency: 'VND',
          unitCode: 'MON',
          unitText: 'tháng',
        },
      })),
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: MEMBERSHIP_FAQS.map((item) => ({
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
      <MembershipPage />
    </>
  );
}
