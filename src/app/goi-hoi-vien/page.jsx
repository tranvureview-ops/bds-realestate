import MembershipPage from '../../views/MembershipPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Gói Hội Viên Môi Giới Bất Động Sản',
  description: 'Gia nhập hội viên chuyên nghiệp: Tiết kiệm chi phí, nhận hạn mức tin VIP không giới hạn và huy hiệu môi giới uy tín.',
};

export default function Page() {
  return <MembershipPage />;
}
