'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRealEstate } from '../context/RealEstateContext';
import { validateFullRegistration, validatePhoneNumber, validateEmailAddress } from '../utils/authValidation';
import PasswordSecurityChecker from './PasswordSecurityChecker';

const validateRegisterInputs = (data, showToast) => {
  const result = validateFullRegistration(data);
  if (!result.isValid) {
    showToast(result.message, 'warning');
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
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccessEmail, setRegisterSuccessEmail] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const bonusAmount = Number(systemConfig?.welcomeBonusAmount || 100000);
  const enableWelcomeBonus = systemConfig?.enableWelcomeBonus !== false && bonusAmount > 0;
  const bonusText = `${bonusAmount >= 1000 ? Math.floor(bonusAmount / 1000) + 'k' : bonusAmount}`;
  const bonusFormatted = `${bonusAmount.toLocaleString('vi-VN')} đ`;
  const tokenExpiry = systemConfig?.tokenExpiryMinutes || 30;

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    role: 'broker', // 'broker' or 'user'
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryArea: 'TP. Đà Nẵng',
    company: systemConfig?.brandShortName || 'Đối tác BĐS',
    referralCode: '',
    agreeTerms: true
  });

  // Tự động nhận diện mã người giới thiệu từ URL (?ref=...) hoặc Cookie Affiliate (bds_aff_ref)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('ref');
    if (!code) {
      const match = document.cookie.match(new RegExp('(^| )bds_aff_ref=([^;]+)'));
      if (match) code = match[2];
    }
    if (code) {
      const clean = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      setRegisterData(prev => ({ ...prev, referralCode: clean }));
    }
  }, []);

  // Real-time register validations
  const phoneValidation = validatePhoneNumber(registerData.phone);
  const emailValidation = validateEmailAddress(registerData.email);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotResult, setForgotResult] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại', 'warning');
      return;
    }
    if (!loginPassword) {
      showToast('Vui lòng nhập mật khẩu', 'warning');
      return;
    }
    setIsLoggingIn(true);
    const success = await loginUser(loginIdentifier, loginPassword);
    setIsLoggingIn(false);
    if (success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    setEmailTouched(true);
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại để khôi phục mật khẩu', 'warning');
      return;
    }

    setIsSendingForgot(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Không tìm thấy tài khoản tương ứng.', 'error');
        return;
      }

      setForgotResult(data);
      showToast('Đã gửi liên kết đặt lại mật khẩu!', 'success');
    } catch (err) {
      showToast('Lỗi kết nối máy chủ. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsSendingForgot(false);
    }
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
                Sàn Giao Dịch Bất Động Sản & Hệ Thống Tin VIP {systemConfig?.brandShortName || 'Toàn Quốc'}
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
            Đăng Ký {enableWelcomeBonus ? `(+${bonusText} ví)` : ''}
          </button>
        </div>

        {/* BODY TAB 1: ĐĂNG NHẬP (LOGIN) */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 pt-0 space-y-4 text-xs">
            {/* Email/Phone */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">
                Email hoặc Số điện thoại:
              </label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Nhập email hoặc số điện thoại..."
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
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrow-right-to-bracket"></i>}
              <span>{isLoggingIn ? 'Đang Xác Thực...' : 'Đăng Nhập Ngay'}</span>
            </button>
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

            {/* Khung màu xanh thông báo */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1 text-left">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-gift text-emerald-600"></i>
                <span>Quà tặng {bonusFormatted} chờ kích hoạt:</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Liên kết có hiệu lực trong <strong>{tokenExpiry} phút</strong>. Vui lòng kiểm tra email và bấm vào liên kết để cộng tiền vào ví và sử dụng ngay!
              </p>
            </div>

            <div className="space-y-2 pt-1">
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
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
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
                    <span>Môi Giới</span>
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
                  placeholder="Nhập họ và tên..."
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                  Số điện thoại chính chủ <span className="text-red-500">*</span>:
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0908 123 456"
                  value={registerData.phone}
                  onBlur={() => setPhoneTouched(true)}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition ${
                    phoneTouched && !phoneValidation.isValid ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                  required
                />
                {phoneTouched && !phoneValidation.isValid && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation text-[9px]" />
                    <span>{phoneValidation.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                Email đăng nhập <span className="text-red-500">*</span>:
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={registerData.email}
                onBlur={() => setEmailTouched(true)}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition ${
                  emailTouched && !emailValidation.isValid ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
                required
              />
              {emailTouched && !emailValidation.isValid && (
                <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[9px]" />
                  <span>{emailValidation.message}</span>
                </p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                  Mật khẩu <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    title={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fa-regular ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                    title={showRegisterConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fa-regular ${showRegisterConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Password Security Checklist & Strength Meter */}
            <PasswordSecurityChecker
              password={registerData.password}
              confirmPassword={registerData.confirmPassword}
              compact={true}
            />

            {/* If broker: primary area & company */}
            {registerData.role === 'broker' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Khu vực hoạt động chính:</label>
                  <input
                    type="text"
                    placeholder="VD: TP. Đà Nẵng, Hà Nội..."
                    value={registerData.primaryArea}
                    onChange={(e) => setRegisterData({ ...registerData, primaryArea: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Công ty / Sàn BĐS:</label>
                  <input
                    type="text"
                    placeholder={`VD: ${systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}...`}
                    value={registerData.company}
                    onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Referral Code (Mã giới thiệu) */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                Mã giới thiệu (Nếu có):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã giới thiệu người quen (VD: BDS888)..."
                  value={registerData.referralCode || ''}
                  onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                  className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 uppercase tracking-wider text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  <i className="fa-solid fa-user-tag"></i>
                </span>
              </div>
              {registerData.referralCode && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[9px]"></i>
                  <span>Mã giới thiệu: <strong>{registerData.referralCode}</strong></span>
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer text-slate-600 text-[11px] pt-1">
              <input
                type="checkbox"
                checked={registerData.agreeTerms}
                onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
              />
              <span>
                Tôi đồng ý với{' '}
                <Link
                  href="/quy-che-hoat-dong"
                  target="_blank"
                  className="font-bold text-emerald-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Quy chế hoạt động
                </Link>{' '}
                và{' '}
                <Link
                  href="/chinh-sach-bao-mat"
                  target="_blank"
                  className="font-bold text-emerald-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Chính sách bảo mật
                </Link>{' '}
                của Sàn {systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {isRegistering ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-user-check"></i>}
              <span>{isRegistering ? 'Đang Xử Lý Đăng Ký...' : enableWelcomeBonus ? `Hoàn Tất Đăng Ký & Nhận ${bonusText}` : 'Hoàn Tất Đăng Ký'}</span>
            </button>
          </form>
        )}

        {/* BODY TAB 3: QUÊN MẬT KHẨU (FORGOT) */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="p-6 pt-0 space-y-4 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto shadow-inner">
                <i className="fa-solid fa-key" />
              </div>
              <h3 className="text-base font-black text-slate-900">Quên Mật Khẩu?</h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Nhập Email hoặc Số điện thoại đã đăng ký. Hệ thống sẽ gửi liên kết an toàn để bạn thiết lập mật khẩu mới.
              </p>
            </div>

            {forgotResult ? (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-1 text-center">
                  <div className="font-bold flex items-center justify-center gap-1.5 text-emerald-900 text-xs">
                    <i className="fa-solid fa-circle-check text-emerald-600" />
                    <span>Đã Gửi Hướng Dẫn Khôi Phục</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {forgotResult.message}
                  </p>
                </div>

                {forgotResult.resetUrl && (
                  <Link
                    href={forgotResult.resetUrl}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:from-red-700 transition shadow cursor-pointer text-center"
                  >
                    <i className="fa-solid fa-key" />
                    <span>👉 Đổi Mật Khẩu Ngay (Thử Nghiệm Nhanh)</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setForgotResult(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Nhập Email / Số Khác
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                    Email hoặc Số điện thoại <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập email hoặc số điện thoại..."
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingForgot}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSendingForgot ? <i className="fa-solid fa-spinner animate-spin" /> : <i className="fa-solid fa-paper-plane" />}
                  <span>{isSendingForgot ? 'Đang Xử Lý Gửi Thư...' : 'Gửi Hướng Dẫn Khôi Phục'}</span>
                </button>
              </div>
            )}

            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setTab('login'); setForgotResult(null); }}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
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
