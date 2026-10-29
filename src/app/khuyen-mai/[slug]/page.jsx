import PromotionDetailPage from '../../../views/PromotionDetailPage';
import { PROMOTIONS_DATA } from '../../../data/rewardData';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const promo = PROMOTIONS_DATA.find(p => p.slug === slug);

  if (!promo) {
    return {
      title: 'Chương Trình Khuyến Mãi | Đất Biển Đà Nẵng',
      description: 'Chương trình khuyến mãi dịch vụ bất động sản trên Đất Biển Đà Nẵng.',
    };
  }

  return {
    title: `${promo.title} | Khuyến Mãi BĐS`,
    description: promo.description,
    alternates: {
      canonical: `https://datbiendanang.vn/khuyen-mai/${promo.slug}/`,
    },
    openGraph: {
      title: promo.title,
      description: promo.description,
      images: [promo.thumbnail],
      url: `https://datbiendanang.vn/khuyen-mai/${promo.slug}/`,
    }
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <PromotionDetailPage slug={resolvedParams?.slug} />;
}
