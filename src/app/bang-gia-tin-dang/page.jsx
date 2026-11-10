import VipPricingPage from '../../views/VipPricingPage';
import { SITE_URL } from '../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Bảng Giá Tin Đăng & Phân Loại Tin Nhà Đất',
  description: 'Bảng giá niêm yết các loại tin VIP Kim Cương, VIP Vàng, VIP Bạc, Tin Thường và dịch vụ đẩy tin tự động.',
  alternates: {
    canonical: `${baseUrl}/bang-gia-tin-dang/`,
  },
  openGraph: {
    title: 'Bảng Giá Tin Đăng & Phân Loại Tin Nhà Đất',
    description: 'Bảng giá niêm yết các loại tin VIP Kim Cương, VIP Vàng, VIP Bạc, Tin Thường và dịch vụ đẩy tin tự động.',
    url: `${baseUrl}/bang-gia-tin-dang/`,
  }
};

export default function Page() {
  return <VipPricingPage />;
}
