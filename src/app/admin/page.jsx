import AdminPage from '../../views/AdminPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Hệ thống quản trị sàn BĐS (CMS Admin)',
  description: 'Trung tâm quản trị tin đăng, duyệt bài, quản lý gói VIP, cấu hình email và kiểm duyệt sàn nhà đất.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminPage />;
}
