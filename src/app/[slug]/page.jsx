import { notFound, permanentRedirect } from 'next/navigation';
import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, getPropertyPermalink, generateCategoryMetadata, SITE_URL } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { fetchServerProperties, findProperty } from '../../services/propertyService';

export function buildPropertyMetadata(matchedProperty) {
  const canonicalPermalink = getPropertyPermalink(matchedProperty);
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalFullUrl = `${domain}${canonicalPermalink}`;
  return {
    title: matchedProperty.title,
    description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
    alternates: { canonical: canonicalFullUrl },
    openGraph: {
      title: matchedProperty.title,
      description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
      url: canonicalFullUrl,
      images: matchedProperty.images?.length > 0 ? [{ url: matchedProperty.images[0] }] : []
    }
  };
}

export function buildTaxonomyMetadata(taxonomyInfo) {
  const canonicalUrl = taxonomyInfo.canonicalUrl?.startsWith('http')
    ? taxonomyInfo.canonicalUrl
    : `${(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '')}${taxonomyInfo.canonicalPath || taxonomyInfo.canonicalUrl || ''}`;
  const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, taxonomyInfo.page || 1);
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website'
    }
  };
}

export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  const currentPath = `/${slug || ''}`;

  const parsedPropertyUrl = parsePropertyUrl(currentPath);
  if (parsedPropertyUrl.isProperty) {
    const serverProps = await fetchServerProperties();
    const matched = findProperty(serverProps, parsedPropertyUrl, currentPath) ||
      findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);
    if (matched) return buildPropertyMetadata(matched);
  }

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) return buildTaxonomyMetadata(taxonomyInfo);

  return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
}

export function renderTaxonomyPage(taxonomyInfo, page = 1) {
  return taxonomyInfo.demand === 'rent'
    ? <RentListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} />
    : <SaleListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} />;
}

export default async function Page({ params, searchParams }) {
  const { slug } = (await params) || {};
  const sp = (await searchParams) || {};
  const currentPath = `/${slug || ''}`;

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
        permanentRedirect(qs ? `/${slug}/page/${p}/?${qs}` : `/${slug}/page/${p}/`);
      } else {
        permanentRedirect(qs ? `/${slug}/?${qs}` : `/${slug}/`);
      }
    }
    return renderTaxonomyPage(taxonomyInfo, 1);
  }

  const parsed = parsePropertyUrl(currentPath);
  if (!parsed.isProperty) notFound();

  const serverProps = await fetchServerProperties();
  const prop = findProperty(serverProps, parsed, currentPath) || findProperty(INITIAL_PROPERTIES, parsed, currentPath);
  if (!prop) notFound();

  const canonical = getPropertyPermalink(prop);
  if (currentPath !== canonical) permanentRedirect(canonical);

  return <PropertyDetailPage initialProperty={prop} slug={slug} currentPath={currentPath} />;
}
