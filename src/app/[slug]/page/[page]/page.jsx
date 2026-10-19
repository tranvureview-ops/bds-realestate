import { notFound, permanentRedirect } from 'next/navigation';
import SaleListingsPage from '../../../../views/SaleListingsPage';
import RentListingsPage from '../../../../views/RentListingsPage';
import { parseTaxonomyUrl, generateCategoryMetadata, getCanonicalUrl } from '../../../../utils/permalink';
import { fetchServerProperties } from '../../../../services/propertyService';
import { INITIAL_PROPERTIES, DEFAULT_SYSTEM_CONFIG } from '../../../../data/mockData';
import { filterProperties } from '../../../../utils/propertyFilter';

export async function generateMetadata({ params }) {
  const { slug, page } = (await params) || {};
  const currentPath = `/${slug || ''}`;
  const taxonomyInfo = parseTaxonomyUrl(currentPath);

  if (!taxonomyInfo.isTaxonomy) {
    return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
  }

  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
  }

  const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, pageNum);
  const canonical = getCanonicalUrl(currentPath, pageNum);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website'
    }
  };
}

export function renderTaxonomyPage(taxonomyInfo, page = 1) {
  return taxonomyInfo.demand === 'rent'
    ? <RentListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} />
    : <SaleListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} />;
}

export default async function PaginatedTaxonomyPage({ params }) {
  const { slug, page } = (await params) || {};
  const pageNum = parseInt(page, 10);
  const currentPath = `/${slug || ''}`;

  // 1. Không cho phép /page/1 độc lập -> Chuyển hướng 301 về URL gốc
  if (page === '1') {
    permanentRedirect(`/${slug}/`);
  }

  // 2. Kiểm tra tính hợp lệ của số trang (không chấp nhận số âm, thập phân, chữ cái)
  if (isNaN(pageNum) || pageNum < 1 || String(pageNum) !== page) {
    notFound();
  }

  // 3. Phân tích slug danh mục
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (!taxonomyInfo.isTaxonomy) {
    notFound();
  }

  // 4. Lấy danh sách properties và kiểm tra trang vượt giới hạn (404 chuẩn SEO)
  const serverProps = await fetchServerProperties();
  const allProps = (serverProps && serverProps.length > 0) ? serverProps : INITIAL_PROPERTIES;
  
  // Lọc sơ bộ theo danh mục để tính đúng totalPages
  const categoryFilters = {
    demand: taxonomyInfo.demand || 'sale',
    propertyType: taxonomyInfo.propertyType || 'all',
    city: taxonomyInfo.city || '',
    district: taxonomyInfo.district || ''
  };
  const matchedProps = filterProperties(allProps, categoryFilters);
  const pageSize = DEFAULT_SYSTEM_CONFIG.categoryPageSize || 12;
  const totalPages = Math.max(1, Math.ceil(matchedProps.length / pageSize));

  if (pageNum > totalPages) {
    notFound();
  }

  return renderTaxonomyPage(taxonomyInfo, pageNum);
}
