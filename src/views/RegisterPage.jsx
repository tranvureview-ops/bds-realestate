'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

export default function RegisterPage() {
  const { registerUser, resendUserVerificationEmail, showToast, systemConfig } = useRealEstate();
  const { navigate } = useRouter();

  const [registerData, setRegisterData] = useState({
    role: 'broker',
    name: '',
    phone: '',
    email: '',
    password: '',
    primaryArea: 'TP. Đà Nẵng',
    company: 'Đất Biển Đà Nẵng',
    agreeTerms: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const bonusAmount = Number(systemConfig?.welcomeBonusAmount || 100000);
  const bonusFormatted = bonusAmount.toLocaleString('vi-VN') + 'đ';
  const tokenExpiry = systemConfig?.tokenExpiryMinutes || 30;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registerData.name.trim() || registerData.name.length < 3) {
      showToast('Họ và tên cần ít nhất 3 ký tự', 'warning');
      return;
    }
    if (!registerData.phone.trim() || registerData.phone.length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ', 'warning');
      return;
    }
    if (!registerData.email.trim() || !registerData.email.includes('@')) {
      showToast('Vui lòng nhập email hợp lệ', 'warning');
      return;
    }
    if (!registerData.password || registerData.password.length < 6) {
      showToast('Mật khẩu cần tối thiểu 6 ký tự', 'warning');
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
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-regular fa-envelope-open" />
          </div>
          <div className="space-y-1">
            <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200">
              Đăng Ký Thành Công
            </span>
            <h2 className="text-xl font-black text-slate-900">Kích Hoạt Tài Khoản & Nhận Quà</h2>
            <p className="text-xs text-slate-600">
              Hệ thống đã tạo liên kết kích hoạt cho <strong className="text-slate-900">{registerData.email}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <i className="fa-solid fa-gift text-emerald-600" />
              <span>Quà tặng {bonusFormatted} chờ kích hoạt:</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Liên kết có hiệu lực trong {tokenExpiry} phút. Bấm nút bên dưới để cộng tiền vào ví và sử dụng ngay!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {registrationResult.verificationUrl && (
              <a
                href={registrationResult.verificationUrl}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition cursor-pointer"
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

            <Link
              to="/"
              className="inline-block w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center text-xl font-black mx-auto shadow-md">
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Đăng Ký Thành Viên Mới</h1>
          <p className="text-xs text-slate-500">
            Tạo tài khoản đăng tin và nhận ngay quà tặng chào mừng <strong className="text-red-600 font-bold">{bonusFormatted}</strong> vào ví
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selector */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Bạn tham gia với tư cách:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-3 border-2 rounded-2xl flex items-center gap-2 cursor-pointer transition ${registerData.role === 'broker' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`}>
                <input
                  type="radio"
                  name="role"
                  value="broker"
                  checked={registerData.role === 'broker'}
                  onChange={() => setRegisterData(prev => ({ ...prev, role: 'broker' }))}
                  className="accent-amber-500"
                />
                <div>
                  <div className="font-bold">Môi Giới BĐS</div>
                  <div className="text-[10px]">Đăng tin & nâng VIP</div>
                </div>
              </label>

              <label className={`p-3 border-2 rounded-2xl flex items-center gap-2 cursor-pointer transition ${registerData.role === 'user' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600'}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={registerData.role === 'user'}
                  onChange={() => setRegisterData(prev => ({ ...prev, role: 'user' }))}
                  className="accent-blue-500"
                />
                <div>
                  <div className="font-bold">Khách Tìm Mua</div>
                  <div className="text-[10px]">Lưu tin & liên hệ</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Họ và tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn Tuấn"
              value={registerData.name}
              onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0904 084 888"
                value={registerData.phone}
                onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Email nhận tin <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mật khẩu tạo mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự..."
              value={registerData.password}
              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Welcome Promo Gift Banner */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-gift"></i>
            </div>
            <div className="text-[11px] text-emerald-800">
              <span className="font-bold">Ưu đãi thành viên mới:</span> Tặng ngay <strong className="font-black text-emerald-700">{bonusFormatted} vào ví</strong> để trải nghiệm đăng tin và đẩy tin VIP hoàn toàn miễn phí.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-60 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-user-plus"></i>}
            <span>{isSubmitting ? 'Đang Xử Lý Đăng Ký...' : `Đăng Ký & Nhận ${bonusFormatted} Vào Ví Ngay`}</span>
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Đã có tài khoản trên Đất Biển Đà Nẵng?{' '}
          <Link to="/dang-nhap" className="text-emerald-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
