import MissionHubPage from '../../../views/MissionHubPage';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams?.category;

  const titles = {
    'tan-thu': 'Nhiệm Vụ Tân Thủ',
    'hang-ngay': 'Nhiệm Vụ Hàng Ngày',
    'thanh-tuu': 'Nhiệm Vụ Thành Tựu'
  };

  const name = titles[category] || 'Danh Mục Nhiệm Vụ';

  return {
    title: `${name} | Thưởng Tiền Vào Ví Khuyến Mãi`,
    description: `Danh sách ${name.toLowerCase()} nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi trên Đất Biển Đà Nẵng.`,
    alternates: {
      canonical: `https://datbiendanang.vn/nhiem-vu/${category}/`,
    }
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  return <MissionHubPage initialCategory={resolvedParams?.category || 'all'} />;
}
