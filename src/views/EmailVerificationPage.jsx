'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

/**
 * Hiển thị thẻ giao diện khi đang trong quá trình thẩm tra token
 */
function VerifyingStateCard() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4 max-w-lg w-full">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h2 className="text-xl font-black text-slate-800">Đang Thẩm Tra Mã Xác Thực...</h2>
      <p className="text-xs text-slate-500">
        Hệ thống đang kiểm tra tính hợp lệ của token và khởi tạo Ví Khuyến Mãi cho bạn. Vui lòng chờ giây lát.
      </p>
    </div>
  );
}

/**
 * Hiển thị thẻ kích hoạt thành công kèm số tiền thưởng vào ví
 */
function SuccessStateCard({ verifyResult, onOpenLogin }) {
  const bonusFormatted = Number(verifyResult?.bonusAmount || 100000).toLocaleString('vi-VN');
  const expiryDate = verifyResult?.bonusExpiresAt ? new Date(verifyResult.bonusExpiresAt).toLocaleDateString('vi-VN') : '30 ngày';

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-2xl text-center space-y-6 max-w-lg w-full">
      <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
        <i className="fa-solid fa-gift animate-bounce"></i>
      </div>
      <div className="space-y-2">
        <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-200">
          Kích Hoạt Tài Khoản Thành Công
        </span>
        <h1 className="text-2xl font-black text-slate-900">Chúc Mừng Bạn!</h1>
        <p className="text-xs text-slate-500">
          Tài khoản của bạn đã được xác thực an toàn và chuyển sang trạng thái <strong>Hoạt Động</strong>.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 rounded-2xl shadow-lg space-y-2">
        <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-100">
          Ví Khuyến Mãi Đã Được Cộng
        </div>
        <div className="text-3xl font-black font-mono">+{bonusFormatted} đ</div>
        <div className="text-[11px] text-emerald-100 flex items-center justify-center gap-1.5 pt-1 border-t border-emerald-400/40">
          <i className="fa-regular fa-clock"></i>
          <span>Hạn sử dụng tiền thưởng: <strong>{expiryDate}</strong></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onOpenLogin}
          className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wide hover:from-red-700 hover:to-rose-700 transition shadow-md"
        >
          Đăng Nhập Ngay
        </button>
        <Link
          href="/"
          className="flex-1 py-3 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 transition text-center"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}

/**
 * Hiển thị thẻ thông báo lỗi token kèm nút gửi lại email
 */
function FailureStateCard({ errorMessage, email, onResendEmail, isResending, resendSuccess }) {
  const [inputEmail, setInputEmail] = useState(email || '');

  const handleResendSubmit = (e) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      onResendEmail(inputEmail.trim());
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-200 shadow-2xl text-center space-y-6 max-w-lg w-full">
      <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
        <i className="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div className="space-y-2">
        <span className="inline-block bg-rose-50 text-rose-700 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border border-rose-200">
          Xác Thực Không Thành Công
        </span>
        <h1 className="text-2xl font-black text-slate-900">Liên Kết Hết Hạn Hoặc Sai</h1>
        <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
          {errorMessage || 'Liên kết kích hoạt đã hết hiệu lực. Vui lòng yêu cầu liên kết mới.'}
        </p>
      </div>

      {resendSuccess ? (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs border border-emerald-200 space-y-1">
          <div className="font-bold flex items-center justify-center gap-1.5">
            <i className="fa-solid fa-circle-check text-emerald-600"></i> Đã gửi email kích hoạt mới!
          </div>
          <div>Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam) của email <strong>{inputEmail}</strong>.</div>
        </div>
      ) : (
        <form onSubmit={handleResendSubmit} className="space-y-3 text-left">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Nhập Email để nhận liên kết mới:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="nhap-email@example.com"
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isResending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {isResending ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-regular fa-paper-plane"></i>}
              Gửi Lại Email
            </button>
          </div>
        </form>
      )}

      <div className="pt-2 border-t border-slate-100">
        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

/**
 * Trang xử lý xác thực email và nhận thưởng chào mừng
 */
export default function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { openAuthModal, showToast } = useRealEstate();

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [verifyResult, setVerifyResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Không tìm thấy mã token xác thực trên đường dẫn.');
      return;
    }
    fetch(`/api/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.success) {
          setStatus('success');
          setVerifyResult(data);
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
          if (data.email) setUserEmail(data.email);
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
      });
  }, [token]);

  const handleResend = async (emailToResend) => {
    setIsResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendSuccess(true);
        showToast('Đã gửi email kích hoạt mới thành công!', 'success');
      } else {
        showToast(data.message || 'Không thể gửi lại email.', 'error');
      }
    } catch (err) {
      showToast('Lỗi mạng khi gửi lại email.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      {status === 'loading' && <VerifyingStateCard />}
      {status === 'success' && (
        <SuccessStateCard
          verifyResult={verifyResult}
          onOpenLogin={() => openAuthModal && openAuthModal('login')}
        />
      )}
      {status === 'error' && (
        <FailureStateCard
          errorMessage={errorMessage}
          email={userEmail}
          onResendEmail={handleResend}
          isResending={isResending}
          resendSuccess={resendSuccess}
        />
      )}
    </div>
  );
}
