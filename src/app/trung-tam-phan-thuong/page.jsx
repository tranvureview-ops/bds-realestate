import RewardCenterPage from '../../views/RewardCenterPage';
import { SITE_URL } from '../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Trung Tâm Phần Thưởng Tiền Mặt Ví Khuyến Mãi BĐS',
  description: 'Trải nghiệm điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/`,
  },
  openGraph: {
    title: 'Trung Tâm Phần Thưởng Bất Động Sản',
    description: 'Khu vực tương tác nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi và đăng tin miễn phí.',
    url: `${baseUrl}/trung-tam-phan-thuong/`,
    type: 'website',
  }
};

export default function Page() {
  return <RewardCenterPage />;
}
