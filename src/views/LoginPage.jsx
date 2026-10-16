'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

export default function LoginPage() {
  const { loginUser, showToast } = useRealEstate();
  const { navigate } = useRouter();

  const [identifier, setIdentifier] = useState('tuan.batdongsan@datbiendanang.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại', 'warning');
      return;
    }
    const success = loginUser(identifier, password);
    if (success) {
      navigate('/');
    }
  };

  const handleQuickLogin = (email) => {
    loginUser(email, '123456');
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center text-xl font-black mx-auto shadow-md">
            <i className="fa-solid fa-building"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-slate-500">
            Truy cập để quản lý tin đăng, nạp tiền ví và nâng cấp gói VIP
          </p>
        </div>

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
              <button 
                type="button" 
                onClick={() => showToast('Mật khẩu mẫu thử nghiệm là: 123456', 'info')}
                className="text-emerald-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg transition"
          >
            Đăng Nhập Ngay
          </button>
        </form>

        {/* 1-Click Quick Demo Login */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 mb-2.5 text-center uppercase tracking-wider">
            Hoặc đăng nhập nhanh 1-chạm để trải nghiệm:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('tuan.batdongsan@datbiendanang.vn')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 text-xs text-center transition"
            >
              👑 Môi giới Pro
            </button>
            <button
              onClick={() => handleQuickLogin('mai.tran@gmail.com')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 text-xs text-center transition"
            >
              👤 Khách mua
            </button>
            <button
              onClick={() => handleQuickLogin('admin@datbiendanang.vn')}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-bold border border-red-200 text-xs text-center transition"
            >
              🛡️ Admin CMS
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Chưa có tài khoản Đất Biển Đà Nẵng?{' '}
          <Link to="/dang-ky" className="text-emerald-600 font-bold hover:underline">
            Đăng ký thành viên mới (Tặng 100k)
          </Link>
        </div>
      </div>
    </div>
  );
}
