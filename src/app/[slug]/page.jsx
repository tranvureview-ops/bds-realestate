import { notFound, permanentRedirect } from 'next/navigation';
import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, getPropertyPermalink } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { fetchServerProperties, findProperty } from '../../services/propertyService';

export function buildPropertyMetadata(matchedProperty) {
  const canonicalPermalink = getPropertyPermalink(matchedProperty);
  const canonicalFullUrl = `https://datbiendanang.vn${canonicalPermalink}`;
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
  return {
    title: taxonomyInfo.title,
    description: `Danh sách tin đăng ${taxonomyInfo.title} giá tốt, chính chủ, cập nhật liên tục 24/7.`
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

export function renderTaxonomyPage(taxonomyInfo) {
  return taxonomyInfo.demand === 'rent'
    ? <RentListingsPage taxonomyInfo={taxonomyInfo} />
    : <SaleListingsPage taxonomyInfo={taxonomyInfo} />;
}

export default async function Page({ params }) {
  const { slug } = (await params) || {};
  const currentPath = `/${slug || ''}`;

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) return renderTaxonomyPage(taxonomyInfo);

  const parsed = parsePropertyUrl(currentPath);
  if (!parsed.isProperty) notFound();

  const serverProps = await fetchServerProperties();
  const prop = findProperty(serverProps, parsed, currentPath) || findProperty(INITIAL_PROPERTIES, parsed, currentPath);
  if (!prop) notFound();

  const canonical = getPropertyPermalink(prop);
  if (currentPath !== canonical) permanentRedirect(canonical);

  return <PropertyDetailPage initialProperty={prop} slug={slug} currentPath={currentPath} />;
}
