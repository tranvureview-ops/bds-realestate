import PromotionListPage from '../../views/PromotionListPage';
import { SITE_URL } from '../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Trung Tâm Khuyến Mãi Bất Động Sản | Voucher & Ưu Đãi VIP',
  description: 'Tổng hợp các chương trình khuyến mãi nạp tiền ví, chiết khấu tin VIP và gói hội viên môi giới mới nhất.',
  alternates: {
    canonical: `${baseUrl}/khuyen-mai/`,
  },
  openGraph: {
    title: 'Trung Tâm Khuyến Mãi & Voucher Bất Động Sản',
    description: 'Nhận ngay voucher nạp tiền, chiết khấu tin VIP và ưu đãi dành riêng cho nhà môi giới.',
    url: `${baseUrl}/khuyen-mai/`,
    type: 'website',
  }
};

export default function Page() {
  return <PromotionListPage />;
}
