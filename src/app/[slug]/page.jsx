import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { fetchServerProperties, findProperty } from '../../services/propertyService';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/${slug}`;

  // 1. Phân tích nếu là liên kết tin đăng bất động sản
  const parsedPropertyUrl = parsePropertyUrl(currentPath);
  if (parsedPropertyUrl.isProperty) {
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
      title: 'Chi Tiết Bất Động Sản',
      description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
    };
  }

  // 2. Phân tích nếu là liên kết danh mục phân loại (Taxonomy)
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    return {
      title: taxonomyInfo.title,
      description: `Danh sách tin đăng ${taxonomyInfo.title} giá tốt, chính chủ, cập nhật liên tục 24/7.`,
    };
  }

  return {
    title: 'Bất Động Sản',
    description: 'Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất Đà Nẵng và toàn quốc.',
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/${slug}`;

  // 1. Điều hướng danh mục cho thuê / bán theo chuẩn Batdongsan
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    if (taxonomyInfo.demand === 'rent') {
      return <RentListingsPage taxonomyInfo={taxonomyInfo} />;
    }
    return <SaleListingsPage taxonomyInfo={taxonomyInfo} />;
  }

  // 2. Phân giải tin đăng bất động sản phía máy chủ
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
