import AdminPage from '../../views/AdminPage';

export const metadata = {
  title: 'Hệ Thống Quản Trị Sàn BĐS (CMS Admin)',
  description: 'Trung tâm quản trị tin đăng, duyệt bài, quản lý gói VIP, cấu hình email và kiểm duyệt sàn bất động sản.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminPage />;
}
