import PricePredictionPage from '../../../../views/PricePredictionPage';
import { PRICE_PREDICTION_GAMES } from '../../../../data/rewardData';
import { SITE_URL } from '../../../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const projectSlug = resolvedParams?.projectSlug;
  const game = PRICE_PREDICTION_GAMES.find(g => g.slug === projectSlug);

  if (!game) {
    return {
      title: 'Dự đoán giá BĐS dự án | Sàn Nhà Đất',
      description: 'Dự đoán mức giá thị trường nhà đất.',
    };
  }

  return {
    title: `Dự đoán giá ${game.projectName} | Quỹ ${game.totalPool}`,
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
