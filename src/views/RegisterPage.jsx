'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { validateFullRegistration, validatePhoneNumber, validateEmailAddress } from '../utils/authValidation';
import PasswordSecurityChecker from '../components/PasswordSecurityChecker';

export default function RegisterPage() {
  const { registerUser, resendUserVerificationEmail, showToast, systemConfig } = useRealEstate();
  const { navigate } = useRouter();

  const [registerData, setRegisterData] = useState({
    role: 'broker', // 'broker' or 'user'
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryArea: 'TP. Đà Nẵng',
    company: systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H',
    referralCode: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

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

  const bonusAmount = Number(systemConfig?.welcomeBonusAmount || 100000);
  const enableWelcomeBonus = systemConfig?.enableWelcomeBonus !== false && bonusAmount > 0;
  const bonusText = `${bonusAmount >= 1000 ? Math.floor(bonusAmount / 1000) + 'k' : bonusAmount}`;
  const bonusFormatted = `${bonusAmount.toLocaleString('vi-VN')} đ`;
  const tokenExpiry = systemConfig?.tokenExpiryMinutes || 30;

  // Real-time field validation messages
  const phoneValidation = validatePhoneNumber(registerData.phone);
  const emailValidation = validateEmailAddress(registerData.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    setEmailTouched(true);

    const validation = validateFullRegistration(registerData);
    if (!validation.isValid) {
      showToast(validation.message, 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser(registerData);
    setIsSubmitting(false);

    if (result && result.success) {
      setRegistrationResult(result);
    }
  };

  const handleResend = async () => {
    if (!registerData.email) return;
    setIsResending(true);
    const res = await resendUserVerificationEmail(registerData.email);
    setIsResending(false);
    if (res?.verificationUrl) {
      setRegistrationResult(prev => ({ ...prev, verificationUrl: res.verificationUrl }));
    }
  };

  if (registrationResult) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-emerald-200 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-regular fa-envelope-open" />
          </div>
          <div className="space-y-1">
            <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
              Đăng Ký Thành Công
            </span>
            <h2 className="text-xl font-black text-slate-900">Kích Hoạt Tài Khoản & Nhận Quà</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống đã gửi liên kết kích hoạt tài khoản đến <strong className="text-slate-900">{registerData.email}</strong>.
            </p>
          </div>

          {/* Khung màu xanh thông báo */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <i className="fa-solid fa-gift text-emerald-600" />
              <span>Quà tặng {bonusFormatted} chờ kích hoạt:</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Liên kết có hiệu lực trong <strong>{tokenExpiry} phút</strong>. Vui lòng kiểm tra email và bấm vào liên kết để cộng tiền vào ví và sử dụng ngay!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
            >
              <i className={`fa-solid ${isResending ? 'fa-spinner fa-spin' : 'fa-rotate-right'}`} />
              <span>Gửi lại email kích hoạt</span>
            </button>

            <Link
              to="/dang-nhap"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket" />
              <span>Đến Trang Đăng Nhập</span>
            </Link>

            <Link
              to="/"
              className="inline-block w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/80">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* Modal-style Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-md shrink-0">
              <i className="fa-solid fa-city"></i>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Đăng Ký Thành Viên Mới
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sàn Giao Dịch Bất Động Sản & Hệ Thống Tin VIP {systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition shrink-0"
            title="Về trang chủ"
          >
            <i className="fa-solid fa-xmark"></i>
          </Link>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="grid grid-cols-2 p-1.5 mx-5 mt-4 bg-slate-100 rounded-2xl text-xs font-bold">
          <Link
            to="/dang-nhap"
            className="py-2.5 rounded-xl transition text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-right-to-bracket text-emerald-600"></i>
            <span>Đăng Nhập</span>
          </Link>
          <div className="py-2.5 rounded-xl bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5 font-bold">
            <i className="fa-solid fa-user-plus text-red-600"></i>
            <span>Đăng Ký {enableWelcomeBonus ? `(+${bonusText} ví)` : ''}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 pt-4 space-y-4 text-xs">
          {/* Orange Promo Banner (Tặng Ngay 100.000 đ Vào Ví Khuyến Mãi) */}
          {enableWelcomeBonus && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-base shrink-0">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs">Tặng Ngay {bonusFormatted} Vào Ví Khuyến Mãi!</div>
                <div className="text-[11px] text-white/90">Áp dụng trực tiếp để mua gói đăng tin VIP hoặc dịch vụ đẩy tin.</div>
              </div>
            </div>
          )}

          {/* Account Type Selector (Bạn tham gia với tư cách) */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">
              Bạn tham gia với tư cách:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegisterData(prev => ({ ...prev, role: 'broker' }))}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
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
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
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
                onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition ${
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
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition ${
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  value={registerData.password}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">
                Xác nhận mật khẩu <span className="text-red-500">*</span>:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
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
                  onChange={(e) => setRegisterData(prev => ({ ...prev, primaryArea: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Công ty / Sàn BĐS:</label>
                <input
                  type="text"
                  placeholder={`VD: ${systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}...`}
                  value={registerData.company}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
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
                onChange={(e) => setRegisterData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))}
                className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 uppercase tracking-wider text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                <i className="fa-solid fa-user-tag"></i>
              </span>
            </div>
            {registerData.referralCode && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[9px]"></i>
                <span>Mã giới thiệu: <strong>{registerData.referralCode}</strong> (Cộng hoa hồng cho người giới thiệu)</span>
              </p>
            )}
          </div>

          {/* Terms checkbox với Link Quy chế hoạt động & Chính sách bảo mật */}
          <label className="flex items-start gap-2 cursor-pointer text-slate-600 text-[11px] pt-1">
            <input
              type="checkbox"
              checked={registerData.agreeTerms}
              onChange={(e) => setRegisterData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
            />
            <span>
              Tôi đồng ý với{' '}
              <Link
                to="/quy-che-hoat-dong"
                target="_blank"
                className="font-bold text-emerald-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Quy chế hoạt động
              </Link>{' '}
              và{' '}
              <Link
                to="/chinh-sach-bao-mat"
                target="_blank"
                className="font-bold text-emerald-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Chính sách bảo mật
              </Link>{' '}
              của Sàn {systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-user-check"></i>}
            <span>{isSubmitting ? 'Đang Xử Lý Đăng Ký...' : enableWelcomeBonus ? `Hoàn Tất Đăng Ký & Nhận ${bonusText}` : 'Hoàn Tất Đăng Ký'}</span>
          </button>
        </form>

        {/* Switch to Login Footer */}
        <div className="text-center text-xs text-slate-500 py-4 bg-slate-50/50 border-t border-slate-100">
          Đã có tài khoản trên {systemConfig?.brandShortName || 'KÊNH NHÀ ĐẤT 24H'}?{' '}
          <Link to="/dang-nhap" className="text-emerald-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
