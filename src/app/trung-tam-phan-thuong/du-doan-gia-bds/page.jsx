import PricePredictionPage from '../../../views/PricePredictionPage';
import { SITE_URL } from '../../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Dự đoán giá BĐS cộng đồng | Chia thưởng tiền mặt ví KM',
  description: 'Trổ tài thẩm định giá thị trường các căn hộ, biệt thự để chia quỹ thưởng tiền mặt hàng triệu đồng vào ví khuyến mãi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/du-doan-gia-bds/`,
  }
};

export default function Page() {
  return <PricePredictionPage />;
}
