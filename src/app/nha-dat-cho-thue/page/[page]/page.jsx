import { notFound, permanentRedirect } from 'next/navigation';
import RentListingsPage from '../../../../views/RentListingsPage';
import { generateCategoryMetadata, getCanonicalUrl } from '../../../../utils/permalink';
import { fetchServerProperties } from '../../../../services/propertyService';
import { INITIAL_PROPERTIES, DEFAULT_SYSTEM_CONFIG } from '../../../../data/mockData';

export async function generateMetadata({ params }) {
  const { page } = (await params) || {};
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
  }
  const { title, description } = generateCategoryMetadata({ demand: 'rent' }, 2026, pageNum);
  const canonical = getCanonicalUrl('/nha-dat-cho-thue', pageNum);
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

export default async function PaginatedRentPage({ params }) {
  const { page } = (await params) || {};
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum <= 1) {
    permanentRedirect('/nha-dat-cho-thue/');
  }

  // 301 Chuyển hướng toàn bộ URL cũ /page/{number} sang định dạng mới /p{number}
  permanentRedirect(`/nha-dat-cho-thue/p${pageNum}`);
}
