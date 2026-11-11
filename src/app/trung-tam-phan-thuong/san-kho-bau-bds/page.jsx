import TreasureHuntPage from '../../../views/TreasureHuntPage';
import { SITE_URL } from '../../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Săn hộp quà kho báu trong bài viết BĐS',
  description: 'Khám phá các bài viết tin rao nhà đất để tìm kiếm hộp quà kho báu, nhận tiền thưởng ngẫu nhiên cộng trực tiếp vào ví khuyến mãi.',
  alternates: {
    canonical: `${baseUrl}/trung-tam-phan-thuong/san-kho-bau-bds/`,
  }
};

export default function Page() {
  return <TreasureHuntPage />;
}
