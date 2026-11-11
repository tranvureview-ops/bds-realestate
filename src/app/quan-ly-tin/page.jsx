import UserDashboardPage from '../../views/UserDashboardPage';

export const metadata = {
  title: 'Quản lý tin đăng',
  description: 'Bảng điều khiển cá nhân: quản lý tin đăng đang hiển thị, tin chờ duyệt, đẩy tin VIP và phục hồi tin từ thùng rác.',
};

export default function Page() {
  return <UserDashboardPage />;
}
