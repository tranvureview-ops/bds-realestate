import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: {
    absolute: '404 - Không tìm thấy trang | Kênh Nhà Đất 24H',
  },
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến địa chỉ mới trên hệ sinh thái Kênh Nhà Đất 24H.',
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-slate-200/90 shadow-sm space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner border border-emerald-100">
          <i className="fa-solid fa-compass" />
        </div>

        <div>
          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight block mb-2">404</span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">
            Không Tìm Thấy Trang Yêu Cầu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Đường dẫn bạn vừa truy cập không tồn tại, đã bị gỡ bỏ hoặc chuyên viên môi giới này chưa được đăng ký trên hệ sinh thái Kênh Nhà Đất 24H.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house text-xs" />
            <span>Về Trang Chủ</span>
          </Link>

          <Link
            href="/nha-dat-ban"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-magnifying-glass text-xs" />
            <span>Xem Nhà Đất Bán</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
