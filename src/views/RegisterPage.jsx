'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';

export default function RegisterPage() {
  const { registerUser, showToast } = useRealEstate();
  const { navigate } = useRouter();

  const [registerData, setRegisterData] = useState({
    role: 'broker',
    name: '',
    phone: '',
    email: '',
    password: '',
    primaryArea: 'Hà Nội & TP. Hồ Chí Minh',
    company: 'Đất Biển Đà Nẵng',
    agreeTerms: true
  });

  const handleSubmit = (e) => {
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

    const success = registerUser(registerData);
    if (success) {
      navigate('/ho-so-ca-nhan');
    }
  };

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
            Tạo tài khoản đăng tin và nhận ngay quà tặng chào mừng <strong className="text-red-600">100.000đ</strong> vào ví
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
                  <div className="text-[10px]">Lưu tin & so sánh</div>
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
              placeholder="VD: Nguyễn Văn Tuấn"
              value={registerData.name}
              onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0908 123 456"
                value={registerData.phone}
                onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="email@gmail.com"
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
              <span className="font-bold">Ưu đãi thành viên mới:</span> Tặng ngay <strong className="font-black text-emerald-700">100.000đ vào ví</strong> để trải nghiệm đăng tin và đẩy tin VIP hoàn toàn miễn phí.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-lg transition"
          >
            Đăng Ký & Nhận 100k Vào Ví Ngay
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
