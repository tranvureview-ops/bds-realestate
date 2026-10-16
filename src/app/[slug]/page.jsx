import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, toVietnameseSlug } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/${slug}`;

  // Check if it's a property permalink
  const propUrlInfo = parsePropertyUrl(currentPath);
  if (propUrlInfo.isProperty) {
    const matched = INITIAL_PROPERTIES.find(p => {
      if (propUrlInfo.normalizedBdsId && p.id?.toUpperCase() === propUrlInfo.normalizedBdsId.toUpperCase()) return true;
      const pNum = parseInt(String(p.id || '').replace(/\D/g, ''), 10);
      const parsedNum = parseInt(String(propUrlInfo.rawIdNumber || '').replace(/\D/g, ''), 10);
      if (!isNaN(pNum) && !isNaN(parsedNum) && pNum === parsedNum) return true;
      if (propUrlInfo.rawSlug && (p.slug === propUrlInfo.rawSlug || toVietnameseSlug(p.title) === propUrlInfo.rawSlug)) return true;
      return false;
    });

    if (matched) {
      return {
        title: matched.title,
        description: matched.description?.slice(0, 160) || matched.title,
        openGraph: {
          title: matched.title,
          description: matched.description?.slice(0, 160) || matched.title,
          images: matched.images?.length > 0 ? [{ url: matched.images[0] }] : [],
        }
      };
    }
    return {
      title: 'Chi Tiết Bất Động Sản',
      description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
    };
  }

  // Check if it's a taxonomy route
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

  // 1. Check if it's a property permalink
  const propUrlInfo = parsePropertyUrl(currentPath);
  if (propUrlInfo.isProperty) {
    return <PropertyDetailPage />;
  }

  // 2. Check if it's a taxonomy URL
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    if (taxonomyInfo.demand === 'rent') {
      return <RentListingsPage taxonomyInfo={taxonomyInfo} />;
    }
    return <SaleListingsPage taxonomyInfo={taxonomyInfo} />;
  }

  // Fallback to PropertyDetailPage
  return <PropertyDetailPage />;
}
