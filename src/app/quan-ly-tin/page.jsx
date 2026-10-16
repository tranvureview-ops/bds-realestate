import UserDashboardPage from '../../views/UserDashboardPage';

export const metadata = {
  title: 'Quản Lý Tin Đăng & Thùng Rác BĐS',
  description: 'Bảng điều khiển cá nhân: Quản lý tin đăng đang hiển thị, tin chờ duyệt, đẩy tin VIP, và phục hồi tin từ Thùng rác.',
};

export default function Page() {
  return <UserDashboardPage />;
}
