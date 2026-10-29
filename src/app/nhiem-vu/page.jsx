import MissionHubPage from '../../views/MissionHubPage';
import { SITE_URL } from '../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Hệ Thống Nhiệm Vụ Thưởng Tiền Vào Ví Khuyến Mãi',
  description: 'Tham gia làm nhiệm vụ đăng tin, duyệt tin và tương tác mỗi ngày để nhận tiền tươi vào Ví Khuyến Mãi, đăng tin và đẩy tin VIP hoàn toàn miễn phí.',
  alternates: {
    canonical: `${baseUrl}/nhiem-vu/`,
  },
  openGraph: {
    title: 'Hệ Thống Nhiệm Vụ Thưởng Tiền Vào Ví Khuyến Mãi BĐS',
    description: 'Nhận tiền thưởng vào Ví Khuyến Mãi mỗi ngày.',
    url: `${baseUrl}/nhiem-vu/`,
    type: 'website',
  }
};

export default function Page() {
  return <MissionHubPage initialCategory="all" />;
}
