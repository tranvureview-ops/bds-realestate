import MissionHubPage from '../../views/MissionHubPage';

export const metadata = {
  title: 'Hệ Thống Nhiệm Vụ & Tích Xu Đổi Quà | Đất Biển Đà Nẵng',
  description: 'Tham gia làm nhiệm vụ đăng tin, duyệt tin và tương tác mỗi ngày để nhận hàng ngàn xu thưởng, đổi voucher VIP và lượt đẩy tin miễn phí.',
  alternates: {
    canonical: 'https://datbiendanang.vn/nhiem-vu/',
  },
  openGraph: {
    title: 'Hệ Thống Nhiệm Vụ & Tích Xu Đổi Quà BĐS',
    description: 'Tích lũy xu thưởng mỗi ngày cùng Đất Biển Đà Nẵng.',
    url: 'https://datbiendanang.vn/nhiem-vu/',
    type: 'website',
  }
};

export default function Page() {
  return <MissionHubPage initialCategory="all" />;
}
