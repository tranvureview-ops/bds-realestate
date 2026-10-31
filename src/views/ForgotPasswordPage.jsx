'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

export default function ForgotPasswordPage() {
  const { showToast } = useRealEstate();
  const { navigate } = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentResult, setSentResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại đã đăng ký.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.', 'error');
        return;
      }

      showToast('Đã gửi liên kết khôi phục mật khẩu!', 'success');
      setSentResult(data);
    } catch (err) {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (sentResult) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-5 max-w-md w-full">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-regular fa-paper-plane animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
              Đã Gửi Hướng Dẫn
            </span>
            <h2 className="text-xl font-black text-slate-900">Kiểm Tra Email Của Bạn</h2>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {sentResult.message}
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-[11px] text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <i className="fa-solid fa-clock" />
              <span>Thời hạn hiệu lực:</span>
            </div>
            <p className="text-amber-700">
              Liên kết trong email chỉ có giá trị trong vòng <strong>30 phút</strong>. Sau khi hoàn tất đổi mật khẩu, bạn có thể đăng nhập ngay.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && sentResult.resetUrl && (
            <div className="pt-1">
              <Link
                href={sentResult.resetUrl}
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider hover:from-red-700 hover:to-rose-700 transition shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-key" />
                <span>👉 Đổi Mật Khẩu Ngay (Chỉ hiển thị môi trường Dev)</span>
              </Link>
            </div>
          )}

          <div className="space-y-2 pt-2 text-xs">
            <button
              type="button"
              onClick={() => setSentResult(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              Gửi Lại Cho Email / Số Khác
            </button>

            <Link
              to="/dang-nhap"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket" />
              <span>Quay Lại Đăng Nhập</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Quên Mật Khẩu?</h1>
          <p className="text-xs text-slate-500">
            Nhập email hoặc số điện thoại đã đăng ký để nhận liên kết thiết lập lại mật khẩu an toàn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email hoặc Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <i className="fa-regular fa-envelope" />
              </span>
              <input
                type="text"
                required
                placeholder="VD: tuan.bds@gmail.com hoặc 0904084888"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <i className="fa-solid fa-spinner animate-spin" />
            ) : (
              <i className="fa-solid fa-paper-plane" />
            )}
            <span>{isSubmitting ? 'Đang Xử Lý Gửi Thư...' : 'Gửi Liên Kết Đặt Lại Mật Khẩu'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <Link to="/dang-nhap" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
            <i className="fa-solid fa-arrow-left text-[10px]" />
            <span>Quay lại Đăng nhập</span>
          </Link>
          <Link to="/dang-ky" className="text-slate-600 font-bold hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
