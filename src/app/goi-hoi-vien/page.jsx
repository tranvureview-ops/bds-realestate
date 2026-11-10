import MembershipPage from '../../views/MembershipPage';
import { SITE_URL } from '../../utils/permalink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: 'Gói Hội Viên Môi Giới Nhà Đất',
  description: 'Gia nhập hội viên chuyên nghiệp: Tiết kiệm chi phí, nhận hạn mức tin VIP không giới hạn và huy hiệu môi giới uy tín.',
  alternates: {
    canonical: `${baseUrl}/goi-hoi-vien/`,
  },
  openGraph: {
    title: 'Gói Hội Viên Môi Giới Nhà Đất',
    description: 'Gia nhập hội viên chuyên nghiệp: Tiết kiệm chi phí, nhận hạn mức tin VIP không giới hạn và huy hiệu môi giới uy tín.',
    url: `${baseUrl}/goi-hoi-vien/`,
  }
};

export default function Page() {
  return <MembershipPage />;
}
