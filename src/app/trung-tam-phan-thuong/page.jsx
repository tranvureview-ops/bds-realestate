import RewardCenterPage from '../../views/RewardCenterPage';
import { SITE_URL } from '../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Trung tâm phần thưởng tiền mặt ví khuyến mãi BĐS',
  description: 'Trải nghiệm điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS nhận tiền thưởng trực tiếp vào ví khuyến mãi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong`,
  },
  openGraph: {
    title: 'Trung tâm phần thưởng nhà đất',
    description: 'Khu vực tương tác nhận tiền thưởng trực tiếp vào ví khuyến mãi và đăng tin miễn phí.',
    url: `${baseUrl}/trung-tam-phan-thuong`,
    type: 'website',
  }
};

export default function Page() {
  return <RewardCenterPage />;
}
