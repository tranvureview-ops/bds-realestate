import MissionHubPage from '../../views/MissionHubPage';

export const metadata = {
  title: 'Hệ Thống Nhiệm Vụ Thưởng Tiền Vào Ví Khuyến Mãi | Đất Biển Đà Nẵng',
  description: 'Tham gia làm nhiệm vụ đăng tin, duyệt tin và tương tác mỗi ngày để nhận tiền tươi vào Ví Khuyến Mãi, đăng tin và đẩy tin VIP hoàn toàn miễn phí.',
  alternates: {
    canonical: 'https://datbiendanang.vn/nhiem-vu/',
  },
  openGraph: {
    title: 'Hệ Thống Nhiệm Vụ Thưởng Tiền Vào Ví Khuyến Mãi BĐS',
    description: 'Nhận tiền thưởng vào Ví Khuyến Mãi mỗi ngày cùng Đất Biển Đà Nẵng.',
    url: 'https://datbiendanang.vn/nhiem-vu/',
    type: 'website',
  }
};

export default function Page() {
  return <MissionHubPage initialCategory="all" />;
}
