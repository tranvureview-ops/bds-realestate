import HomePage from '../views/HomePage';
import { getInitialDb } from './layout';

export async function generateMetadata() {
  const db = await getInitialDb();
  const sys = db?.bds_system_config || {};
  const brand = sys.brandShortName || 'Sàn Bất Động Sản';
  return {
    title: {
      absolute: `${brand} - Kênh Thông Tin & Giao Dịch Bất Động Sản Hàng Đầu`
    },
    description: sys.tagline ? `${brand} - ${sys.tagline}` : 'Khám phá hàng ngàn bất động sản bán và cho thuê với thông tin minh bạch, định giá chính xác và hình ảnh thực tế.',
  };
}

export default function Page() {
  return <HomePage />;
}
