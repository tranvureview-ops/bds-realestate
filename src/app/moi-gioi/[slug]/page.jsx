import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  const formattedName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Chuyên Viên';

  return {
    title: `Danh Sách Tin Đăng Của ${formattedName} | Sàn BĐS Đất Biển Đà Nẵng`,
    description: `Xem tất cả các bất động sản và tin đăng nhà đất đang quản lý bởi ${formattedName}.`,
    robots: { index: false, follow: false }
  };
}

export default async function BrokerDetailPage({ params }) {
  const { slug } = (await params) || {};
  const queryName = slug ? slug.replace(/-/g, ' ') : '';
  redirect(`/nha-dat-ban?q=${encodeURIComponent(queryName)}`);
}
