import PricePredictionPage from '../../../../views/PricePredictionPage';
import { PRICE_PREDICTION_GAMES } from '../../../../data/rewardData';
import { SITE_URL } from '../../../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const projectSlug = resolvedParams?.projectSlug;
  const game = PRICE_PREDICTION_GAMES.find(g => g.slug === projectSlug);

  if (!game) {
    return {
      title: 'Dự Đoán Giá BĐS Dự Án | Sàn Bất Động Sản',
      description: 'Dự đoán mức giá thị trường bất động sản.',
    };
  }

  return {
    title: `Dự Đoán Giá ${game.projectName} | Quỹ ${game.totalPool}`,
    description: `Tham gia bình chọn mức giá khớp lệnh dự án ${game.projectName} (${game.location}) để nhận thưởng.`,
    alternates: {
      canonical: `${baseUrl}/trung-tam-phan-thuong/du-doan-gia-bds/${game.slug}/`,
    }
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <PricePredictionPage projectSlug={resolvedParams?.projectSlug} />;
}
