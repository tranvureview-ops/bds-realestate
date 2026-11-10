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
  const cleanSlug = (slug || '').replace(/biethu/g, 'biet-thu');
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum <= 1) {
    permanentRedirect(`/${cleanSlug}/`);
  }

  // 301 Chuyển hướng toàn bộ URL cũ /page/{number} sang định dạng mới /p{number}
  permanentRedirect(`/${cleanSlug}/p${pageNum}`);
}
