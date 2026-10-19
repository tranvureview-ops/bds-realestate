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

  // 1. Không cho phép /page/1 độc lập -> Chuyển hướng 301 về URL gốc
  if (page === '1') {
    permanentRedirect('/nha-dat-ban/');
  }

  // 2. Kiểm tra tính hợp lệ của số trang (không chấp nhận số âm, thập phân, chữ cái)
  if (isNaN(pageNum) || pageNum < 1 || String(pageNum) !== page) {
    notFound();
  }

  // 3. Tính toán tổng số trang và xử lý khi trang vượt giới hạn (404 chuẩn SEO)
  const serverProps = await fetchServerProperties();
  const allProps = (serverProps && serverProps.length > 0) ? serverProps : INITIAL_PROPERTIES;
  const saleProps = allProps.filter(p => p.demand === 'sale');
  const pageSize = DEFAULT_SYSTEM_CONFIG.categoryPageSize || 12;
  const totalPages = Math.max(1, Math.ceil(saleProps.length / pageSize));

  if (pageNum > totalPages) {
    notFound();
  }

  return <SaleListingsPage initialPage={pageNum} />;
}
