import MissionHubPage from '../../views/MissionHubPage';
import { SITE_URL } from '../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Hệ thống nhiệm vụ thưởng tiền vào ví khuyến mãi',
  description: 'Tham gia làm nhiệm vụ đăng tin, duyệt tin và tương tác mỗi ngày để nhận tiền tươi vào ví khuyến mãi, đăng tin và đẩy tin VIP hoàn toàn miễn phí.',
  alternates: {
    canonical: `${baseUrl}/nhiem-vu/`,
  },
  openGraph: {
    title: 'Hệ thống nhiệm vụ thưởng tiền vào ví khuyến mãi BĐS',
    description: 'Nhận tiền thưởng vào ví khuyến mãi mỗi ngày.',
    url: `${baseUrl}/nhiem-vu/`,
    type: 'website',
  }
};

export default function Page() {
  return <MissionHubPage initialCategory="all" />;
}
