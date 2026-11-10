import { notFound, permanentRedirect } from 'next/navigation';
import SaleListingsPage from '../../../../views/SaleListingsPage';
import { generateCategoryMetadata, getCanonicalUrl } from '../../../../utils/permalink';
import { fetchServerProperties } from '../../../../services/propertyService';
import { INITIAL_PROPERTIES, DEFAULT_SYSTEM_CONFIG } from '../../../../data/mockData';

export async function generateMetadata({ params }) {
  const { page } = (await params) || {};
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
  }
  const { title, description } = generateCategoryMetadata({ demand: 'sale' }, 2026, pageNum);
  const canonical = getCanonicalUrl('/nha-dat-ban', pageNum);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website'
    }
  };
}

export default async function PaginatedSalePage({ params }) {
  const { page } = (await params) || {};
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum <= 1) {
    permanentRedirect('/nha-dat-ban/');
  }

  // 301 Chuyển hướng toàn bộ URL cũ /page/{number} sang định dạng mới /p{number}
  permanentRedirect(`/nha-dat-ban/p${pageNum}`);
}
