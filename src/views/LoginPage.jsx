'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import AdminTwoFactorScreen from '../components/AdminTwoFactorScreen';

export default function LoginPage() {
  const { loginUser, showToast, systemConfig } = useRealEstate();
  const { navigate, searchParams } = useRouter();

  const [redirectUrl, setRedirectUrl] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState(null);

  const bonusAmount = Number(systemConfig?.welcomeBonusAmount || 100000);
  const enableWelcomeBonus = systemConfig?.enableWelcomeBonus !== false && bonusAmount > 0;
  const bonusFormatted = bonusAmount >= 1000 ? `${(bonusAmount / 1000).toLocaleString('vi-VN')}k` : `${bonusAmount.toLocaleString('vi-VN')}đ`;
  const registerLinkText = enableWelcomeBonus 
    ? `Đăng ký thành viên mới (Tặng ${bonusFormatted})` 
    : 'Đăng ký thành viên mới';

  useEffect(() => {
    let red = searchParams?.get('redirect');
    if (!red && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      red = urlParams.get('redirect');
    }

    if (red) {
      setRedirectUrl(red);
      if (red === '/admin' || red.startsWith('/admin')) {
        setIdentifier('admin@datbiendanang.vn');
      }
    }
  }, [searchParams]);

  const handlePostLoginRedirect = (user) => {
    if (!user) return;
    if (redirectUrl) {
      if (redirectUrl.startsWith('/admin') && user.role !== 'admin') {
        showToast('Tài khoản của bạn không có đặc quyền Quản Trị Viên (Admin)!', 'warning');
        navigate('/');
        return;
      }
      navigate(redirectUrl);
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại', 'warning');
      return;
    }
    if (!password) {
      showToast('Vui lòng nhập mật khẩu', 'warning');
      return;
    }
    setIsSubmitting(true);
    const loggedUser = await loginUser(identifier, password);
    setIsSubmitting(false);
    if (loggedUser) {
      if (loggedUser.role === 'admin') {
        // Tài khoản Admin bắt buộc phải xác thực / kích hoạt 2FA Google Authenticator
        setPending2FAUser(loggedUser);
        return;
      }
      handlePostLoginRedirect(loggedUser);
    }
  };

  const isAdminRedirect = redirectUrl === '/admin' || redirectUrl.startsWith('/admin');

  // Nếu tài khoản là Admin và cần xác thực 2FA
  if (pending2FAUser) {
    return (
      <AdminTwoFactorScreen
        adminUser={pending2FAUser}
        onSuccess={() => {
          handlePostLoginRedirect(pending2FAUser);
        }}
        onCancel={() => setPending2FAUser(null)}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black mx-auto shadow-md ${
            isAdminRedirect 
              ? 'bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 text-white' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white'
          }`}>
            <i className={`fa-solid ${isAdminRedirect ? 'fa-shield-halved' : 'fa-building'}`}></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {isAdminRedirect ? 'Đăng Nhập Quản Trị Viên (Admin)' : 'Đăng Nhập Tài Khoản'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdminRedirect 
              ? 'Xác thực đặc quyền Ban Quản Trị để truy cập Bàn làm việc CMS' 
              : 'Truy cập để quản lý tin đăng, nạp tiền ví và nâng cấp gói VIP'}
          </p>
        </div>

        {/* Security Notification if redirected from /admin */}
        {isAdminRedirect && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs animate-in fade-in">
            <i className="fa-solid fa-triangle-exclamation text-rose-600 text-base mt-0.5 shrink-0"></i>
            <div>
              <div className="font-bold text-rose-950">Yêu cầu quyền Quản Trị Viên</div>
              <div className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                Khu vực <strong>/admin</strong> chỉ dành riêng cho tài khoản có vai trò <strong>Admin</strong>. Vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục.
              </div>
              <div className="mt-2 text-[11px] bg-white/80 p-2 rounded-xl border border-rose-200 font-mono text-rose-950">
                Email: <strong>admin@datbiendanang.vn</strong><br />
                Mật khẩu: <strong>123456</strong>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email hoặc Số điện thoại
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                placeholder="Nhập email hoặc số điện thoại..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 uppercase">
                Mật khẩu
              </label>
              <Link 
                to="/quen-mat-khau" 
                className="text-emerald-600 hover:underline font-semibold"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-black text-sm shadow-lg transition text-white flex items-center justify-center gap-2 cursor-pointer ${
              isAdminRedirect
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
            }`}
          >
            {isSubmitting && <i className="fa-solid fa-spinner animate-spin"></i>}
            <span>
              {isSubmitting 
                ? 'Đang Xác Thực...' 
                : (isAdminRedirect ? 'Xác Thực & Vào Trang Quản Trị' : 'Đăng Nhập Ngay')}
            </span>
          </button>
        </form>

        {/* Switch to Register */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Chưa có tài khoản Đất Biển Đà Nẵng?{' '}
          <Link to="/dang-ky" className="text-emerald-600 font-bold hover:underline">
            {registerLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
