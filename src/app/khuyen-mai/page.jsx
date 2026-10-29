import PromotionListPage from '../../views/PromotionListPage';

export const metadata = {
  title: 'Trung Tâm Khuyến Mãi Bất Động Sản | Voucher & Ưu Đãi VIP',
  description: 'Tổng hợp các chương trình khuyến mãi nạp tiền ví, chiết khấu tin VIP và gói hội viên môi giới mới nhất 2026 trên Đất Biển Đà Nẵng.',
  alternates: {
    canonical: 'https://datbiendanang.vn/khuyen-mai/',
  },
  openGraph: {
    title: 'Trung Tâm Khuyến Mãi & Voucher Bất Động Sản',
    description: 'Nhận ngay voucher nạp tiền, chiết khấu tin VIP và ưu đãi dành riêng cho nhà môi giới.',
    url: 'https://datbiendanang.vn/khuyen-mai/',
    type: 'website',
  }
};

export default function Page() {
  return <PromotionListPage />;
}
