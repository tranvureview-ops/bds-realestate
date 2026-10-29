import PricePredictionPage from '../../../views/PricePredictionPage';
import { SITE_URL } from '../../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Dự Đoán Giá BĐS Cộng Đồng | Chia Thưởng Tiền Mặt Ví KM',
  description: 'Trổ tài thẩm định giá thị trường các căn hộ, biệt thự để chia quỹ thưởng tiền mặt hàng triệu đồng vào Ví Khuyến Mãi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/du-doan-gia-bds/`,
  }
};

export default function Page() {
  return <PricePredictionPage />;
}
