import { Suspense } from 'react';
import EmailVerificationPage from '../../views/EmailVerificationPage';

export const metadata = {
  title: 'Kích Hoạt Tài Khoản & Nhận Quà Tặng | Đất Biển Đà Nẵng',
  description: 'Trang kích hoạt tài khoản thành viên mới và nhận tiền thưởng chào mừng vào Ví Khuyến Mãi trên sàn giao dịch Đất Biển Đà Nẵng.'
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <EmailVerificationPage />
    </Suspense>
  );
}
