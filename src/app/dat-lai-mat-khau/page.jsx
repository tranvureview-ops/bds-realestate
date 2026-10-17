import { Suspense } from 'react';
import ResetPasswordPage from '../../views/ResetPasswordPage';

export const metadata = {
  title: 'Thiết Lập Mật Khẩu Mới | Đất Biển Đà Nẵng',
  description: 'Trang đặt lại mật khẩu an toàn cho tài khoản thành viên trên sàn giao dịch Đất Biển Đà Nẵng.'
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}
