import PromotionDetailPage from '../../../views/PromotionDetailPage';
import { PROMOTIONS_DATA } from '../../../data/rewardData';
import { SITE_URL } from '../../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const promo = PROMOTIONS_DATA.find(p => p.slug === slug);

  if (!promo) {
    return {
      title: 'Chương Trình Khuyến Mãi Bất Động Sản',
      description: 'Chương trình khuyến mãi dịch vụ bất động sản.',
    };
  }

  return {
    title: `${promo.title} | Khuyến Mãi BĐS`,
    description: promo.description,
    alternates: {
      canonical: `${baseUrl}/khuyen-mai/${promo.slug}/`,
    },
    openGraph: {
      title: promo.title,
      description: promo.description,
      images: [promo.thumbnail],
      url: `${baseUrl}/khuyen-mai/${promo.slug}/`,
    }
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <PromotionDetailPage slug={resolvedParams?.slug} />;
}
