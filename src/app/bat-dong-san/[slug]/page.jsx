import PropertyDetailPage from '../../../views/PropertyDetailPage';
import { parsePropertyUrl } from '../../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../../data/mockData';
import { fetchServerProperties, findProperty } from '../../../services/propertyService';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/bat-dong-san/${slug}`;
  const parsedPropertyUrl = parsePropertyUrl(currentPath);

  const serverProperties = await fetchServerProperties();
  const matchedProperty = findProperty(serverProperties, parsedPropertyUrl, currentPath) ||
    findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);

  if (matchedProperty) {
    return {
      title: matchedProperty.title,
      description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
      openGraph: {
        title: matchedProperty.title,
        description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
        images: matchedProperty.images?.length > 0 ? [{ url: matchedProperty.images[0] }] : [],
      }
    };
  }

  return {
    title: `Chi Tiết Bất Động Sản (${slug})`,
    description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/bat-dong-san/${slug}`;
  const parsedPropertyUrl = parsePropertyUrl(currentPath);

  const serverProperties = await fetchServerProperties();
  const matchedProperty = findProperty(serverProperties, parsedPropertyUrl, currentPath) ||
    findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);

  return (
    <PropertyDetailPage
      initialProperty={matchedProperty}
      slug={slug}
      currentPath={currentPath}
    />
  );
}
