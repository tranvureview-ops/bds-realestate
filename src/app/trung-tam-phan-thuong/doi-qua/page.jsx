import RewardRedeemPage from '../../../views/RewardRedeemPage';
import { SITE_URL } from '../../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Đặc quyền sử dụng ví khuyến mãi BĐS',
  description: 'Sử dụng tiền trong ví khuyến mãi để đăng tin miễn phí, mua lượt đẩy tin top 1 và nâng cấp tin VIP hoàn toàn tiện lợi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/doi-qua/`,
  }
};

export default function Page() {
  return <RewardRedeemPage />;
}
