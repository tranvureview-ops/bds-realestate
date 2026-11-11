import { notFound, permanentRedirect } from 'next/navigation';
import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, getPropertyPermalink, generateCategoryMetadata, SITE_URL, formatSentenceCase } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { fetchServerProperties, findProperty } from '../../services/propertyService';
import { getTaxonomyFaqs } from '../../data/seoCategoryContent';

export function buildPropertyMetadata(matchedProperty) {
  const canonicalPermalink = getPropertyPermalink(matchedProperty);
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalFullUrl = `${domain}${canonicalPermalink}`;
  const formattedTitle = formatSentenceCase(matchedProperty.title);
  const desc = matchedProperty.description?.slice(0, 160) || formattedTitle;
  const primaryImg = matchedProperty.images?.[0] || `${domain}/hero.png`;

  return {
    title: formattedTitle,
    description: desc,
    alternates: { canonical: canonicalFullUrl },
    openGraph: {
      title: formattedTitle,
      description: desc,
      url: canonicalFullUrl,
      type: 'article',
      images: [
        {
          url: primaryImg,
          alt: formattedTitle,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: desc,
      images: [primaryImg]
    }
  };
}

export function buildTaxonomyMetadata(taxonomyInfo) {
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalUrl = taxonomyInfo.canonicalUrl?.startsWith('http')
    ? taxonomyInfo.canonicalUrl
    : `${domain}${taxonomyInfo.canonicalPath || taxonomyInfo.canonicalUrl || ''}`;
  const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, taxonomyInfo.page || 1);
  const ogImg = `${domain}/mua-ban-nha-dat-toan-quoc.webp`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImg,
          alt: title,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImg]
    }
  };
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = (await params) || {};
  const sp = (await searchParams) || {};
  const currentPath = `/${slug || ''}`;

  const parsedPropertyUrl = parsePropertyUrl(currentPath);
  if (parsedPropertyUrl.isProperty) {
    const serverProps = await fetchServerProperties();
    const matched = findProperty(serverProps, parsedPropertyUrl, currentPath) ||
      findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);
    if (matched) return buildPropertyMetadata(matched);
  }

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    const meta = buildTaxonomyMetadata(taxonomyInfo);
    if (sp.loai) {
      // For multi-category pages, prevent indexing and ensure canonical without query
      meta.robots = { index: false, follow: false };
    }
    return meta;
  }

  return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
}

export function renderTaxonomyPage(taxonomyInfo, page = 1, searchParams = {}) {
  return taxonomyInfo.demand === 'rent'
    ? <RentListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} serverSearchParams={searchParams} />
    : <SaleListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} serverSearchParams={searchParams} />;
}

export default async function Page({ params, searchParams }) {
  const { slug } = (await params) || {};
  const sp = (await searchParams) || {};

  // Chuyển hướng 301 chuẩn SEO cho các alias hoặc lỗi chính tả cũ (như biethu -> biet-thu)
  if (slug && slug.includes('biethu')) {
    const cleanSlug = slug.replace(/biethu/g, 'biet-thu');
    const queryParams = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v) queryParams.set(k, String(v));
    }
    const qs = queryParams.toString();
    permanentRedirect(qs ? `/${cleanSlug}/?${qs}` : `/${cleanSlug}/`);
  }

  const currentPath = `/${slug || ''}`;

  // 1. Ưu tiên tuyệt đối cho trang chi tiết bài đăng đơn lẻ (Single Property: /{slug}-pr{id})
  const parsed = parsePropertyUrl(currentPath);
  if (parsed.isProperty) {
    const serverProps = await fetchServerProperties();
    const prop = findProperty(serverProps, parsed, currentPath) || findProperty(INITIAL_PROPERTIES, parsed, currentPath);
    if (!prop) notFound();

    const canonical = getPropertyPermalink(prop);
    if (currentPath !== canonical) permanentRedirect(canonical);

    return <PropertyDetailPage initialProperty={prop} slug={slug} currentPath={currentPath} />;
  }

  // 2. Xử lý trang Danh mục / Taxonomy (Nhà đất bán, cho thuê, faceted clean slugs)
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    // 301 Redirect nếu URL có query param ?page=...
    if (sp.page) {
      const p = parseInt(sp.page, 10);
      const queryParams = new URLSearchParams();
      for (const [k, v] of Object.entries(sp)) {
        if (k !== 'page' && v) queryParams.set(k, String(v));
      }
      const qs = queryParams.toString();
      if (p > 1 && String(p) === sp.page) {
        permanentRedirect(qs ? `/${slug}/p${p}?${qs}` : `/${slug}/p${p}`);
      } else {
        permanentRedirect(qs ? `/${slug}?${qs}` : `/${slug}`);
      }
    }

    const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
    const canonicalUrl = taxonomyInfo.canonicalUrl?.startsWith('http')
      ? taxonomyInfo.canonicalUrl
      : `${domain}${taxonomyInfo.canonicalPath || taxonomyInfo.canonicalUrl || currentPath}`;
    const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, taxonomyInfo.page || 1);

    const isRent = taxonomyInfo.demand === 'rent';
    const parentDemandName = isRent ? 'Cho Thuê Nhà Đất' : 'Mua Bán Nhà Đất';
    const parentDemandPath = isRent ? `${domain}/nha-dat-cho-thue` : `${domain}/nha-dat-ban`;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: domain
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: parentDemandName,
          item: parentDemandPath
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: taxonomyInfo.title || title,
          item: canonicalUrl
        }
      ]
    };

    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#collection`,
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: 'vi-VN',
      isPartOf: {
        '@type': 'WebSite',
        '@id': domain,
        name: 'Kênh Nhà Đất 24H',
        url: domain
      }
    };

    const syncedFaqs = getTaxonomyFaqs({
      demand: taxonomyInfo.demand || 'sale',
      propertyType: taxonomyInfo.propertyType || null,
      city: taxonomyInfo.city || null
    });

    const faqEntities = syncedFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }));

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {renderTaxonomyPage(taxonomyInfo, 1, sp)}
      </>
    );
  }

  notFound();
}
