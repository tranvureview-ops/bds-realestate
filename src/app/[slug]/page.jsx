import { permanentRedirect } from 'next/navigation';
import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, getPropertyPermalink } from '../../utils/permalink';
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
      const canonicalPermalink = getPropertyPermalink(matchedProperty);
      const canonicalFullUrl = `https://datbiendanang.vn${canonicalPermalink}`;
      return {
        title: matchedProperty.title,
        description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
        alternates: {
          canonical: canonicalFullUrl,
        },
        openGraph: {
          title: matchedProperty.title,
          description: matchedProperty.description?.slice(0, 160) || matchedProperty.title,
          url: canonicalFullUrl,
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

  // 3. TỐI ƯU SEO DUY NHẤT: Bắt buộc định dạng /{slug}-pr{id}
  // Mọi định dạng khác (/pr..., /bds-..., pure slug) lập tức chuyển hướng vĩnh viễn (301) về Canonical duy nhất
  if (matchedProperty) {
    const canonicalPermalink = getPropertyPermalink(matchedProperty);
    if (currentPath !== canonicalPermalink) {
      permanentRedirect(canonicalPermalink);
    }
  }

  return (
    <PropertyDetailPage
      initialProperty={matchedProperty}
      slug={slug}
      currentPath={currentPath}
    />
  );
}
