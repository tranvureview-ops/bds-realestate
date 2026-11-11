import { notFound } from 'next/navigation';
import { fetchServerProperties } from '../../../services/propertyService';
import { getAllUsers } from '../../../services/serverDbService';
import { resolveBrokerFromSlug, SITE_URL } from '../../../utils/permalink';
import BrokerProfilePage from '../../../views/BrokerProfilePage';

export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  let users = [];
  let properties = [];
  try {
    [users, properties] = await Promise.all([
      getAllUsers(),
      fetchServerProperties()
    ]);
  } catch (_) {}

  const broker = resolveBrokerFromSlug(slug, users, properties);
  if (!broker) {
    return {
      title: 'Không tìm thấy môi giới | Kênh Nhà Đất 24H',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const formattedName = broker.name || 'Chuyên viên';
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/moi-gioi/${slug || ''}`;

  return {
    title: `Hồ sơ môi giới ${formattedName} | Nhà đất đang quản lý`,
    description: `Xem toàn bộ danh sách nhà đất và tin đăng nhà đất đang quản lý bởi chuyên viên môi giới ${formattedName}. Liên hệ trực tiếp xem nhà và nhận tư vấn pháp lý chính xác.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `Hồ sơ môi giới ${formattedName} | Sàn giao dịch BĐS Kênh Nhà Đất 24H`,
      description: `Khám phá các nhà đất bán và cho thuê đang quản lý bởi môi giới ${formattedName}.`,
      url: canonicalUrl,
      type: 'profile',
    },
  };
}

export default async function BrokerDetailPage({ params }) {
  const { slug } = (await params) || {};
  let users = [];
  let initialProperties = [];
  try {
    [users, initialProperties] = await Promise.all([
      getAllUsers(),
      fetchServerProperties()
    ]);
  } catch (_e) {
    initialProperties = [];
  }

  const broker = resolveBrokerFromSlug(slug, users, initialProperties);
  if (!broker) {
    notFound();
  }

  return <BrokerProfilePage slug={slug} initialProperties={initialProperties} initialBroker={broker} />;
}
