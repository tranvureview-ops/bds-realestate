import CheckIn7DaysPage from '../../../views/CheckIn7DaysPage';
import { SITE_URL } from '../../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Điểm Danh 7 Ngày Nhận Thưởng Vào Ví Khuyến Mãi',
  description: 'Đăng nhập điểm danh mỗi ngày nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi để đăng tin và đẩy tin VIP.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/diem-danh-7-ngay/`,
  }
};

export default function Page() {
  return <CheckIn7DaysPage />;
}
