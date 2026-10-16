'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

const validateRegisterInputs = (data, showToast) => {
  if (!data.name?.trim() || data.name.length < 3) {
    showToast('Họ và tên cần ít nhất 3 ký tự', 'warning');
    return false;
  }
  if (!data.phone?.trim() || data.phone.length < 9) {
    showToast('Vui lòng nhập số điện thoại hợp lệ', 'warning');
    return false;
  }
  if (!data.email?.trim() || !data.email.includes('@')) {
    showToast('Vui lòng nhập email hợp lệ', 'warning');
    return false;
  }
  if (!data.password || data.password.length < 6) {
    showToast('Mật khẩu cần ít nhất 6 ký tự', 'warning');
    return false;
  }
  if (data.password !== data.confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp', 'error');
    return false;
  }
  if (!data.agreeTerms) {
    showToast('Vui lòng đồng ý với điều khoản sử dụng', 'warning');
    return false;
  }
  return true;
};

export default function AuthModal({ onClose, initialTab = 'login' }) {
  const {
    loginUser,
    registerUser,
    resendUserVerificationEmail,
    showToast,
    usersList,
    currentUser,
    systemConfig
  } = useRealEstate();

  const [tab, setTab] = useState(initialTab); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccessEmail, setRegisterSuccessEmail] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const bonusAmount = Number(systemConfig?.welcomeBonusAmount || 100000);
  const bonusText = `${bonusAmount >= 1000 ? Math.floor(bonusAmount / 1000) + 'k' : bonusAmount}`;
  const bonusFormatted = `${bonusAmount.toLocaleString('vi-VN')} đ`;
  const tokenExpiry = systemConfig?.tokenExpiryMinutes || 30;

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('tuan.batdongsan@datbiendanang.vn');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Register form state
  const [registerData, setRegisterData] = useState({
    role: 'broker', // 'broker' or 'user'
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryArea: 'TP. Đà Nẵng',
    company: 'Bất Động Sản Đất Biển Đà Nẵng',
    agreeTerms: true
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại', 'warning');
      return;
    }
    const success = loginUser(loginIdentifier, loginPassword);
    if (success) {
      onClose();
    }
  };

  const handleQuickLogin = (user) => {
    loginUser(user.email, '123456');
    onClose();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterInputs(registerData, showToast)) return;

    setIsRegistering(true);
    const result = await registerUser(registerData);
    setIsRegistering(false);
    if (result && result.success) {
      setRegistrationResult(result);
      setRegisterSuccessEmail(registerData.email);
    }
  };

  const handleResend = async () => {
    if (!registerSuccessEmail) return;
    setIsResending(true);
    const res = await resendUserVerificationEmail(registerSuccessEmail);
    setIsResending(false);
    if (res?.verificationUrl) {
      setRegistrationResult(prev => ({ ...prev, verificationUrl: res.verificationUrl }));
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Vui lòng nhập email để khôi phục mật khẩu', 'warning');
      return;
    }
    setForgotSent(true);
    showToast(`Đã gửi liên kết đặt lại mật khẩu đến ${forgotEmail}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6 border border-slate-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-sm font-black shadow-md">
              <i className="fa-solid fa-building"></i>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {tab === 'login' ? 'Đăng Nhập Tài Khoản' : tab === 'register' ? 'Đăng Ký Thành Viên Mới' : 'Khôi Phục Mật Khẩu'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Sàn Giao Dịch Bất Động Sản & Hệ Thống Tin VIP Đất Biển Đà Nẵng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="grid grid-cols-2 p-1.5 m-4 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => { setTab('login'); setForgotSent(false); }}
            className={`py-2 rounded-xl transition ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-right-to-bracket mr-1.5 text-emerald-600"></i>
            Đăng Nhập
          </button>
          <button
            onClick={() => { setTab('register'); setForgotSent(false); setRegisterSuccessEmail(null); }}
            className={`py-2 rounded-xl transition ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-user-plus mr-1.5 text-red-600"></i>
            Đăng Ký (+{bonusText} ví)
          </button>
        </div>

        {/* BODY TAB 1: ĐĂNG NHẬP (LOGIN) */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 pt-0 space-y-4 text-xs">
            {/* Quick Demo Switcher */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Chọn nhanh tài khoản kiểm thử:</span>
                <span className="text-emerald-700 font-normal">1-Click Login</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {usersList.slice(0, 3).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 text-left transition flex flex-col items-center text-center shadow-xs group"
                  >
                    <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover mb-1 group-hover:scale-105 transition" />
                    <div className="font-bold text-slate-800 text-[11px] truncate w-full">{u.name}</div>
                    <div className="text-[9px] text-slate-400 font-semibold">{u.role === 'admin' ? 'Admin' : u.role === 'broker' ? 'Môi giới Pro' : 'Khách hàng'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email/Phone */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">
                Email hoặc Số điện thoại:
              </label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="VD: tuan.batdongsan@datbiendanang.vn hoặc 0898246607"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold uppercase text-[11px]">Mật khẩu:</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-blue-600 hover:underline font-bold"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Đăng Nhập Ngay</span>
            </button>

            {/* Social Logins */}
            <div className="pt-3 border-t border-slate-100 text-center space-y-2.5">
              <div className="text-[11px] text-slate-400">Hoặc tiếp tục bằng tài khoản liên kết:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { loginUser('tuan.batdongsan@datbiendanang.vn', ''); onClose(); }}
                  className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <i className="fa-brands fa-google text-red-500"></i> Google
                </button>
                <button
                  type="button"
                  onClick={() => { loginUser('tuan.batdongsan@datbiendanang.vn', ''); onClose(); }}
                  className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <i className="fa-brands fa-facebook text-blue-600"></i> Facebook
                </button>
                <button
                  type="button"
                  onClick={() => { loginUser('tuan.batdongsan@datbiendanang.vn', ''); onClose(); }}
                  className="py-2 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-comment-dots text-blue-500"></i> Zalo
                </button>
              </div>
            </div>
          </form>
        )}

        {/* BODY TAB 2: ĐĂNG KÝ (REGISTER) - THÀNH CÔNG */}
        {tab === 'register' && registerSuccessEmail && (
          <div className="p-6 pt-0 space-y-4 text-center text-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
              <i className="fa-regular fa-envelope-open animate-bounce"></i>
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                Đăng Ký Thành Công
              </span>
              <h3 className="text-lg font-black text-slate-900">Kích Hoạt Tài Khoản & Nhận Quà</h3>
              <p className="text-slate-600">
                Hệ thống đã tạo liên kết kích hoạt cho <strong className="text-slate-900">{registerSuccessEmail}</strong>
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1 text-left">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-gift text-emerald-600"></i>
                <span>Quà tặng {bonusFormatted} chờ kích hoạt</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Liên kết có hiệu lực trong <strong>{tokenExpiry} phút</strong>. Bấm nút bên dưới để cộng tiền vào ví và kích hoạt tài khoản ngay!
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {registrationResult?.verificationUrl && (
                <a
                  href={registrationResult.verificationUrl}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  <i className="fa-solid fa-bolt" />
                  <span>👉 Bấm Để Kích Hoạt Ngay ({bonusFormatted})</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
              >
                <i className={`fa-solid ${isResending ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`} />
                <span>Gửi lại email kích hoạt</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('login'); setRegisterSuccessEmail(null); setRegistrationResult(null); }}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Chuyển Đến Đăng Nhập
              </button>
            </div>
          </div>
        )}

        {tab === 'register' && !registerSuccessEmail && (
          <form onSubmit={handleRegisterSubmit} className="p-6 pt-0 space-y-3.5 text-xs">
            {/* Promo Banner */}
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base shrink-0">
                🎁
              </div>
              <div className="leading-tight">
                <div className="font-black text-xs">Tặng Ngay {bonusFormatted} Vào Ví Khuyến Mãi!</div>
                <div className="text-[10px] text-white/90">Áp dụng trực tiếp để mua gói đăng tin VIP hoặc dịch vụ đẩy tin.</div>
              </div>
            </div>

            {/* Account Type Selector */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">
                Bạn tham gia với tư cách:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterData(prev => ({ ...prev, role: 'broker' }))}
                  className={`p-3 rounded-2xl border text-left transition ${
                    registerData.role === 'broker'
                      ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-extrabold flex items-center gap-1.5">
                    <i className="fa-solid fa-crown text-amber-500"></i>
                    <span>Môi Giới Chuyên Nghiệp</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Đăng tin BĐS, mua gói VIP Kim Cương</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterData(prev => ({ ...prev, role: 'user' }))}
                  className={`p-3 rounded-2xl border text-left transition ${
                    registerData.role === 'user'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-400/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-extrabold flex items-center gap-1.5">
                    <i className="fa-solid fa-user text-blue-500"></i>
                    <span>Khách Hàng Tìm Mua</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tìm kiếm nhà đất, so sánh & lưu tin</div>
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Họ và tên:</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Tuấn"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Số điện thoại chính chủ:</label>
                <input
                  type="tel"
                  placeholder="VD: 0908 123 456"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Email đăng nhập:</label>
              <input
                type="email"
                placeholder="VD: tuan.batdongsan@gmail.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Mật khẩu:</label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* If broker: primary area & company */}
            {registerData.role === 'broker' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Khu vực hoạt động chính:</label>
                  <input
                    type="text"
                    placeholder="VD: Quận 1, Bình Thạnh, Cầu Giấy..."
                    value={registerData.primaryArea}
                    onChange={(e) => setRegisterData({ ...registerData, primaryArea: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Công ty / Sàn BĐS:</label>
                  <input
                    type="text"
                    placeholder="VD: Masterise Homes, Độc lập..."
                    value={registerData.company}
                    onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer text-slate-600 text-[11px] pt-1">
              <input
                type="checkbox"
                checked={registerData.agreeTerms}
                onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <span>Tôi đồng ý với <strong>Quy chế hoạt động</strong> và <strong>Chính sách bảo mật</strong> của Sàn Đất Biển Đà Nẵng.</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {isRegistering ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-user-check"></i>}
              <span>{isRegistering ? 'Đang Xử Lý Đăng Ký...' : `Hoàn Tất Đăng Ký & Nhận ${bonusText}`}</span>
            </button>
          </form>
        )}

        {/* BODY TAB 3: QUÊN MẬT KHẨU (FORGOT) */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="p-6 pt-0 space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Nhập email hoặc số điện thoại đã đăng ký của bạn. Hệ thống sẽ gửi mã xác thực OTP để tạo mật khẩu mới.
            </p>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Email đã đăng ký:</label>
              <input
                type="email"
                placeholder="VD: user@datbiendanang.vn"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-center">
                ✓ Đã gửi hướng dẫn khôi phục mật khẩu vào hòm thư của bạn!
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Gửi Hướng Dẫn Khôi Phục
              </button>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold"
              >
                ← Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
