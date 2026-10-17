'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { evaluatePasswordSecurity } from '../utils/authValidation';
import PasswordSecurityChecker from '../components/PasswordSecurityChecker';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useRealEstate();
  const { navigate } = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setTokenError('Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setTokenError(data.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
        } else {
          setUserInfo(data);
        }
      } catch (err) {
        setTokenError('Không thể kết nối đến máy chủ để kiểm tra mã token.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.', 'warning');
      return;
    }

    const pwdCheck = evaluatePasswordSecurity(newPassword);
    if (!pwdCheck.isValid) {
      showToast(pwdCheck.message, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Đặt lại mật khẩu thất bại.', 'error');
        return;
      }

      showToast('Đặt lại mật khẩu thành công!', 'success');
      setIsSuccess(true);
    } catch (err) {
      showToast('Lỗi kết nối máy chủ khi cập nhật mật khẩu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 max-w-md w-full">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-black text-slate-800">Đang Kiểm Tra Mã Token...</h2>
          <p className="text-xs text-slate-500">Vui lòng chờ trong giây lát trong khi hệ thống xác thực đường dẫn của bạn.</p>
        </div>
      </div>
    );
  }

  // 2. Token Error State
  if (tokenError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-rose-200 shadow-xl text-center space-y-5 max-w-md w-full">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-rose-200">
              Liên Kết Không Hợp Lệ
            </span>
            <h2 className="text-xl font-black text-slate-900">Không Thể Đặt Lại Mật Khẩu</h2>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {tokenError}
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <Link
              to="/quen-mat-khau"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wide hover:from-red-700 hover:to-rose-700 transition shadow-md"
            >
              <i className="fa-solid fa-rotate-right" />
              <span>Yêu Cầu Gửi Lại Liên Kết Mới</span>
            </Link>

            <Link
              to="/dang-nhap"
              className="inline-block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Quay Lại Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Success State
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-5 max-w-md w-full">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-solid fa-circle-check animate-bounce" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
              Cập Nhật Thành Công
            </span>
            <h2 className="text-xl font-black text-slate-900">Đổi Mật Khẩu Thành Công!</h2>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Mật khẩu mới đã được cập nhật an toàn vào hệ thống. Bây giờ bạn có thể đăng nhập bằng thông tin mới.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <Link
              to="/dang-nhap"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wide hover:from-emerald-700 hover:to-teal-700 transition shadow-md"
            >
              <i className="fa-solid fa-right-to-bracket" />
              <span>Đến Trang Đăng Nhập Ngay</span>
            </Link>

            <Link
              to="/"
              className="inline-block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Form State
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
            <i className="fa-solid fa-key" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Thiết Lập Mật Khẩu Mới</h1>
          <p className="text-xs text-slate-500">
            Xin chào <strong className="text-slate-800">{userInfo?.userName || 'Quý khách'}</strong> ({userInfo?.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* New Password */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {/* Real-time Checklist & Strength Meter */}
          <PasswordSecurityChecker password={newPassword} confirmPassword={confirmPassword} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <i className="fa-solid fa-spinner animate-spin" />
            ) : (
              <i className="fa-solid fa-shield-halved" />
            )}
            <span>{isSubmitting ? 'Đang Cập Nhật Mật Khẩu...' : 'Xác Nhận Đổi Mật Khẩu Mới'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Nhớ lại mật khẩu cũ?{' '}
          <Link to="/dang-nhap" className="text-emerald-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
