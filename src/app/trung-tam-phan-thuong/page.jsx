import RewardCenterPage from '../../views/RewardCenterPage';

export const metadata = {
  title: 'Trung Tâm Phần Thưởng Tiền Mặt Ví Khuyến Mãi BĐS',
  description: 'Trải nghiệm điểm danh 7 ngày, săn kho báu dự án và dự đoán giá BĐS nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi tại Đất Biển Đà Nẵng.',
  alternates: {
    canonical: 'https://datbiendanang.vn/trung-tam-phan-thuong/',
  },
  openGraph: {
    title: 'Trung Tâm Phần Thưởng Đất Biển Đà Nẵng',
    description: 'Khu vực tương tác nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi và đăng tin miễn phí.',
    url: 'https://datbiendanang.vn/trung-tam-phan-thuong/',
    type: 'website',
  }
};

export default function Page() {
  return <RewardCenterPage />;
}
