import { fetchServerProperties } from '../../../services/propertyService';
import { SITE_URL } from '../../../utils/permalink';
import BrokerProfilePage from '../../../views/BrokerProfilePage';

export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  const formattedName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Chuyên Viên';

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/moi-gioi/${slug || ''}`;

  return {
    title: `Hồ Sơ Môi Giới ${formattedName} | Bất Động Sản Đang Quản Lý`,
    description: `Xem toàn bộ danh sách bất động sản và tin đăng nhà đất đang quản lý bởi chuyên viên môi giới ${formattedName}. Liên hệ trực tiếp xem nhà và nhận tư vấn pháp lý chính xác.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `Hồ Sơ Môi Giới ${formattedName} | Sàn Giao Dịch BĐS Đất Biển Đà Nẵng`,
      description: `Khám phá các bất động sản bán và cho thuê đang quản lý bởi môi giới ${formattedName}.`,
      url: canonicalUrl,
      type: 'profile',
    },
  };
}

export default async function BrokerDetailPage({ params }) {
  const { slug } = (await params) || {};
  let initialProperties = [];
  try {
    initialProperties = await fetchServerProperties();
  } catch (_e) {
    initialProperties = [];
  }

  return <BrokerProfilePage slug={slug} initialProperties={initialProperties} />;
}
