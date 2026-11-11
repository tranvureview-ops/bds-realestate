import MissionHubPage from '../../../views/MissionHubPage';
import { SITE_URL } from '../../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams?.category;

  const titles = {
    'tan-thu': 'Nhiệm vụ tân thủ',
    'hang-ngay': 'Nhiệm vụ hàng ngày',
    'thanh-tuu': 'Nhiệm vụ thành tựu'
  };

  const name = titles[category] || 'Danh mục nhiệm vụ';

  return {
    title: `${name} | Thưởng tiền vào ví khuyến mãi`,
    description: `Danh sách ${name.toLowerCase()} nhận tiền thưởng trực tiếp vào ví khuyến mãi.`,
    alternates: {
      canonical: `${baseUrl}/nhiem-vu/${category}/`,
    }
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <MissionHubPage initialCategory={resolvedParams?.category || 'all'} />;
}
