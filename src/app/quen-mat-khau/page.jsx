import { Suspense } from 'react';
import ForgotPasswordPage from '../../views/ForgotPasswordPage';

export const metadata = {
  title: 'Quên Mật Khẩu & Khôi Phục Tài Khoản | Đất Biển Đà Nẵng',
  description: 'Khôi phục mật khẩu tài khoản thành viên trên sàn giao dịch Đất Biển Đà Nẵng nhanh chóng và an toàn.'
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ForgotPasswordPage />
    </Suspense>
  );
}
