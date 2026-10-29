import RewardCenterPage from '../../views/RewardCenterPage';

export const metadata = {
  title: 'Trung Tâm Phần Thưởng & Gamification Bất Động Sản',
  description: 'Trải nghiệm điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS chia thưởng triệu Xu tại Đất Biển Đà Nẵng.',
  alternates: {
    canonical: 'https://datbiendanang.vn/trung-tam-phan-thuong/',
  },
  openGraph: {
    title: 'Trung Tâm Phần Thưởng Đất Biển Đà Nẵng',
    description: 'Khu vực tương tác nhận quà, voucher VIP và lượt đẩy tin miễn phí.',
    url: 'https://datbiendanang.vn/trung-tam-phan-thuong/',
    type: 'website',
  }
};

export default function Page() {
  return <RewardCenterPage />;
}
