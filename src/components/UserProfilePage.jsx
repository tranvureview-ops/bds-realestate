'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { normalizePhone } from '../utils/authValidation';

export default function UserProfilePage() {
  const { 
    currentUser, 
    updateUserProfile, 
    submitKycVerification, 
    logoutUser, 
    setActiveModal, 
    setCurrentView, 
    properties, 
    showToast,
    appointmentsList,
    updateAppointmentStatus,
    deleteAppointment,
    navigateToProperty
  } = useRealEstate();

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'kyc', 'security', 'notifications', 'appointments'
  const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'

  // Notification toggles state (Email, Zalo, SMS, In-App)
  const [notificationSettings, setNotificationSettings] = useState(() => ({
    emailAppointment: currentUser?.notificationSettings?.emailAppointment !== false,
    zaloAppointment: currentUser?.notificationSettings?.zaloAppointment !== false,
    smsAppointment: currentUser?.notificationSettings?.smsAppointment !== false,
    inAppAppointment: currentUser?.notificationSettings?.inAppAppointment !== false,
    vipExpiryAlert: currentUser?.notificationSettings?.vipExpiryAlert !== false,
    priceFluctuationAlert: currentUser?.notificationSettings?.priceFluctuationAlert !== false
  }));

  // Profile Form state
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    bio: currentUser.bio || 'Chuyên viên tư vấn bất động sản cao cấp, cam kết pháp lý minh bạch 100%.',
    primaryArea: currentUser.primaryArea || 'Hà Nội & TP. Hồ Chí Minh',
    company: currentUser.company || 'Đất Biển Đà Nẵng Partner',
    address: currentUser.address || '208 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh, TP.HCM',
    avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'
  });

  // KYC state
  const [kycForm, setKycForm] = useState({
    idCardNumber: currentUser.idCardNumber || '079090001234',
    licenseNumber: currentUser.licenseNumber || 'BDS-CCHN-2024-88',
    fullName: currentUser.name || ''
  });

  // Security password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Avatar choices
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80'
  ];

  // User's active listings
  const myListings = properties.filter(p => p.author && p.author.id === currentUser.id);

  // Appointments for this user (either as broker or as customer)
  const myAppointments = (appointmentsList || []).filter(a => {
    const isBroker = (a.brokerId && String(a.brokerId) === String(currentUser.id)) ||
                     (a.brokerPhone && normalizePhone(a.brokerPhone) === normalizePhone(currentUser.phone)) ||
                     (a.brokerEmail && currentUser.email && a.brokerEmail.toLowerCase() === currentUser.email.toLowerCase());
    const isCustomer = (a.customerId && String(a.customerId) === String(currentUser.id)) ||
                       (a.customerPhone && normalizePhone(a.customerPhone) === normalizePhone(currentUser.phone));
    return isBroker || isCustomer;
  });

  const pendingAppointmentsCount = myAppointments.filter(a => a.status === 'pending').length;

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
  };

  const handleSaveNotificationSettings = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateUserProfile({ notificationSettings });
    showToast('Đã lưu tùy chọn thông báo (Email, Zalo, SMS) thành công!', 'success');
  };

  const handleKycSubmit = (e) => {
    e.preventDefault();
    if (!kycForm.idCardNumber || kycForm.idCardNumber.length < 9) {
      showToast('Vui lòng nhập số CCCD / Hộ chiếu hợp lệ', 'warning');
      return;
    }
    submitKycVerification(kycForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast('Mật khẩu mới cần ít nhất 6 ký tự', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('Xác nhận mật khẩu mới không khớp', 'error');
      return;
    }
    showToast('Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới vào lần tới.', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. TOP HEADER PROFILE CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-emerald-500 shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  const nextIndex = (AVATAR_PRESETS.indexOf(formData.avatar) + 1) % AVATAR_PRESETS.length;
                  const nextAvatar = AVATAR_PRESETS[nextIndex];
                  setFormData({ ...formData, avatar: nextAvatar });
                  updateUserProfile({ avatar: nextAvatar });
                }}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs shadow-md border-2 border-white transition"
                title="Bấm để đổi avatar"
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentUser.name}
                </h1>
                {currentUser.isVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 border border-blue-200">
                    <i className="fa-solid fa-circle-check text-blue-600"></i>
                    Đã Xác Thực
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  currentUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                  currentUser.role === 'broker' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {currentUser.roleName}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span><i className="fa-solid fa-envelope mr-1 text-slate-400"></i> {currentUser.email}</span>
                <span>•</span>
                <span><i className="fa-solid fa-phone mr-1 text-slate-400"></i> {currentUser.phone}</span>
                <span>•</span>
                <span><i className="fa-solid fa-location-dot mr-1 text-slate-400"></i> {formData.primaryArea}</span>
              </p>

              {/* Stats badges */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <i className="fa-solid fa-star"></i>
                  <span className="text-slate-800 font-extrabold">{currentUser.rating || '4.9'}</span>
                  <span className="text-slate-400">({currentUser.reviewCount || 38} đánh giá)</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="text-slate-600">
                  Tin đăng: <strong className="text-slate-900">{myListings.length} bài</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance & Deposit Action */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between sm:justify-start gap-4 w-full md:w-auto">
            <div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Số dư ví tài khoản</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {currentUser.walletBalance.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[10px] text-emerald-600 flex items-center gap-1.5">
                <span>Ví khuyến mãi: <strong className="font-mono">{(Number(currentUser.bonusWalletBalance) || 0).toLocaleString('vi-VN')} đ</strong></span>
                {currentUser.bonusExpiresAt && Number(currentUser.bonusWalletBalance) > 0 && (
                  <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Hạn: {new Date(currentUser.bonusExpiresAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveModal('wallet-deposit')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Nạp Tiền</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION & CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`w-full p-3 rounded-2xl transition flex items-center gap-3 text-left ${
              activeTab === 'info' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-id-card text-sm w-5 text-center"></i>
            <span>Hồ Sơ & Thông Tin Liên Hệ</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`w-full p-3 rounded-2xl transition flex items-center justify-between text-left ${
              activeTab === 'kyc' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-certificate text-sm w-5 text-center"></i>
              <span>Xác Thực Tích Xanh Uy Tín</span>
            </div>
            {currentUser.isVerified ? (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Đã cấp</span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Cần KYC</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full p-3 rounded-2xl transition flex items-center gap-3 text-left ${
              activeTab === 'security' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-lock text-sm w-5 text-center"></i>
            <span>Bảo Mật & Đổi Mật Khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full p-3 rounded-2xl transition flex items-center gap-3 text-left ${
              activeTab === 'notifications' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-bell text-sm w-5 text-center"></i>
            <span>Cài Đặt Thông Báo (Email/Zalo/SMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full p-3 rounded-2xl transition flex items-center justify-between text-left ${
              activeTab === 'appointments' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-regular fa-calendar-check text-sm w-5 text-center"></i>
              <span>Lịch Hẹn Xem Nhà</span>
            </div>
            {pendingAppointmentsCount > 0 ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'appointments' ? 'bg-white text-emerald-700' : 'bg-amber-500 text-white'
              }`}>
                {pendingAppointmentsCount} mới
              </span>
            ) : myAppointments.length > 0 ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'appointments' ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {myAppointments.length}
              </span>
            ) : null}
          </button>

          <div className="pt-3 border-t border-slate-100 space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full p-3 rounded-2xl text-slate-700 hover:bg-slate-50 transition flex items-center gap-3 text-left"
            >
              <i className="fa-solid fa-list-check text-sm w-5 text-center text-slate-500"></i>
              <span>Quản Lý Tin Đăng Của Tôi</span>
            </button>

            <button
              onClick={() => {
                logoutUser();
                setCurrentView('listings');
              }}
              className="w-full p-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition flex items-center gap-3 text-left"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm w-5 text-center"></i>
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>
        </div>

        {/* Right Side Tab Panes (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          
          {/* TAB 1: THÔNG TIN HỒ SƠ */}
          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Thông Tin Hồ Sơ & Liên Hệ</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Thông tin này sẽ hiển thị trên tất cả bài đăng của bạn để khách hàng tiện liên hệ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Họ và tên hiển thị:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Số điện thoại (Nhận cuộc gọi & Zalo):</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Email liên hệ:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Khu vực hoạt động chuyên môn:</label>
                  <input
                    type="text"
                    value={formData.primaryArea}
                    onChange={(e) => setFormData({ ...formData, primaryArea: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Công ty / Sàn giao dịch:</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Địa chỉ văn phòng / cư trú:</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Tiểu sử & Giới thiệu bản thân (Bio):</label>
                <textarea
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Giới thiệu về kinh nghiệm phân phối dự án, cam kết hỗ trợ khách hàng..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Lưu Thay Đổi Hồ Sơ</span>
              </button>
            </form>
          )}

          {/* TAB 2: XÁC THỰC KYC & TÍCH XANH */}
          {activeTab === 'kyc' && (
            <form onSubmit={handleKycSubmit} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Xác Thực Danh Tính & Cấp Tích Xanh Môi Giới</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Hồ sơ có tích xanh giúp tăng 300% tỷ lệ người mua liên hệ và được ưu tiên duyệt tin</p>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                currentUser.isVerified 
                  ? 'bg-blue-50 border-blue-200 text-blue-900' 
                  : currentUser.kycStatus === 'pending'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                  currentUser.isVerified ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <i className={`fa-solid ${currentUser.isVerified ? 'fa-circle-check' : 'fa-hourglass-half'}`}></i>
                </div>
                <div>
                  <div className="font-extrabold text-sm">
                    {currentUser.isVerified ? 'Tài Khoản Đã Được Cấp Tích Xanh Xác Thực' : currentUser.kycStatus === 'pending' ? 'Hồ Sơ Đang Chờ Ban Quản Trị Xét Duyệt' : 'Chưa Xác Thực Danh Tính'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {currentUser.isVerified 
                      ? 'Hồ sơ đã được kiểm duyệt số CCCD và chứng chỉ hành nghề BĐS.' 
                      : 'Vui lòng cung cấp số CCCD và chứng chỉ để nhận tích xanh uy tín.'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Họ và tên trên CCCD:</label>
                  <input
                    type="text"
                    value={kycForm.fullName}
                    onChange={(e) => setKycForm({ ...kycForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Số CCCD / Hộ chiếu:</label>
                  <input
                    type="text"
                    value={kycForm.idCardNumber}
                    onChange={(e) => setKycForm({ ...kycForm, idCardNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    placeholder="VD: 079090001234"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Số Chứng chỉ hành nghề môi giới BĐS (Nếu có):</label>
                <input
                  type="text"
                  value={kycForm.licenseNumber}
                  onChange={(e) => setKycForm({ ...kycForm, licenseNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  placeholder="VD: BDS-CCHN-2024-88"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[11px] font-bold text-slate-700 mb-2">Ảnh chụp CCCD 2 mặt & Chứng chỉ:</div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 cursor-pointer">
                    <i className="fa-solid fa-id-card text-2xl text-slate-400 mb-1"></i>
                    <div className="text-[11px] font-bold text-slate-700">Mặt trước CCCD</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Đã tải lên</div>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:bg-slate-50 cursor-pointer">
                    <i className="fa-solid fa-id-card text-2xl text-slate-400 mb-1"></i>
                    <div className="text-[11px] font-bold text-slate-700">Mặt sau CCCD</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Đã tải lên</div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Gửi Yêu Cầu Cấp Tích Xanh Xác Thực</span>
              </button>
            </form>
          )}

          {/* TAB 3: BẢO MẬT & ĐỔI MẬT KHẨU */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Bảo Mật Tài Khoản & Mật Khẩu</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Khuyến nghị đổi mật khẩu định kỳ 6 tháng một lần để bảo vệ an toàn số dư ví</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Mật khẩu mới:</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Xác nhận mật khẩu mới:</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* 2FA setting */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Xác thực 2 yếu tố (2FA qua SMS)</div>
                  <div className="text-[11px] text-slate-500">Nhận mã OTP bảo mật mỗi khi trừ tiền ví mua gói tin VIP</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-600 rounded" />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-key"></i>
                <span>Cập Nhật Mật Khẩu Mới</span>
              </button>
            </form>
          )}

          {/* TAB 4: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotificationSettings} className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Cài Đặt Kênh Nhận Thông Báo</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Bật hoặc tắt các kênh nhận tin tức và thông báo khi có khách hàng đặt lịch hẹn xem nhà</p>
              </div>

              <div className="space-y-3">
                {/* 1. Kênh Email */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm shrink-0">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Thông báo qua Email</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        Gửi email chi tiết (thông tin khách, SĐT, giờ hẹn, BĐS) đến <strong>{currentUser.email || 'địa chỉ email của bạn'}</strong> ngay khi khách đặt lịch xem nhà.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.emailAppointment)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAppointment: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 2. Kênh Zalo */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-sm shrink-0 font-black">
                      Z
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Thông báo qua Zalo</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        Tự động chuẩn bị liên kết nhắn tin Zalo tức thì và kích hoạt thông báo điều hướng chat nhanh với khách hàng đặt lịch.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.zaloAppointment)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, zaloAppointment: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 3. Kênh Tin Nhắn SMS */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm shrink-0">
                      <i className="fa-solid fa-comment-sms"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Thông báo qua Tin Nhắn SMS</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        Gửi tin nhắn SMS Brandname về số điện thoại <strong>{currentUser.phone || 'chính của bạn'}</strong> thông báo mã hẹn và số liên hệ của khách.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.smsAppointment)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsAppointment: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 4. Kênh Chuông Thông Báo Website (In-App) */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm shrink-0">
                      <i className="fa-solid fa-bell"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Thông báo nội bộ trên Website</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        Hiển thị quả chuông thông báo màu đỏ góc trên màn hình khi có khách đặt lịch hẹn mới hoặc cập nhật trạng thái.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.inAppAppointment)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, inAppAppointment: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 5. Nhắc nhở tin VIP */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-800">Nhắc nhở tin đăng VIP sắp hết hạn</div>
                    <div className="text-[11px] text-slate-500">Nhắc trước 24 giờ để gia hạn gói VIP hoặc đẩy tin top 1</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.vipExpiryAlert)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, vipExpiryAlert: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 6. Biến động giá */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/70 transition rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-800">Bản tin biến động giá BĐS khu vực quan tâm</div>
                    <div className="text-[11px] text-slate-500">Cập nhật chỉ số giá đất, căn hộ hàng tuần từ hệ thống dữ liệu thị trường</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(notificationSettings.priceFluctuationAlert)}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, priceFluctuationAlert: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Lưu Thiết Lập Kênh Thông Báo</span>
              </button>
            </form>
          )}

          {/* TAB 5: LỊCH HẸN XEM NHÀ */}
          {activeTab === 'appointments' && (
            <div className="space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Lịch Hẹn Xem Nhà Trực Tiếp</span>
                    {myAppointments.length > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                        {myAppointments.length} lịch hẹn
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Quản lý khách hẹn xem nhà cho bài đăng của bạn hoặc các cuộc hẹn bạn đã đặt
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ xác nhận' },
                    { id: 'confirmed', label: 'Đã xác nhận' },
                    { id: 'completed', label: 'Hoàn thành' },
                    { id: 'cancelled', label: 'Đã hủy' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAppointmentFilter(f.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        appointmentFilter === f.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointment Items List */}
              {myAppointments.filter(a => appointmentFilter === 'all' || a.status === appointmentFilter).length === 0 ? (
                <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl">
                    <i className="fa-regular fa-calendar-xmark"></i>
                  </div>
                  <div className="font-bold text-slate-700">Chưa có lịch hẹn xem nhà nào</div>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    {appointmentFilter !== 'all'
                      ? 'Không có lịch hẹn nào phù hợp với bộ lọc đã chọn.'
                      : 'Khi có khách bấm nút "Đặt Lịch Hẹn Xem Nhà Trực Tiếp" trên bài đăng của bạn, thông tin sẽ hiển thị đầy đủ tại đây.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAppointments
                    .filter(a => appointmentFilter === 'all' || a.status === appointmentFilter)
                    .map(appt => {
                      const isCustomer = (appt.customerId && String(appt.customerId) === String(currentUser.id)) ||
                                         (appt.customerPhone && normalizePhone(appt.customerPhone) === normalizePhone(currentUser.phone));
                      return (
                        <div
                          key={appt.id}
                          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  appt.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  appt.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  appt.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}>
                                  {appt.status === 'pending' && '⏳ Chờ Xác Nhận'}
                                  {appt.status === 'confirmed' && '✓ Đã Xác Nhận'}
                                  {appt.status === 'completed' && '🎉 Đã Hoàn Thành'}
                                  {appt.status === 'cancelled' && '✕ Đã Hủy'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  #{appt.id}
                                </span>
                                {isCustomer && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                                    Cuộc hẹn của bạn
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition">
                                {appt.propertyTitle}
                              </h4>
                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                                <span>💰 <strong className="text-rose-600">{appt.propertyPrice}</strong></span>
                                {appt.propertyAddress && <span>📍 {appt.propertyAddress}</span>}
                              </div>
                            </div>

                            <div className="sm:text-right shrink-0">
                              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 inline-block">
                                ⏰ {appt.appointmentDate}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Tạo lúc: {new Date(appt.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </div>

                          {/* Customer / Broker Details Box */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="text-[11px] text-slate-500 font-semibold uppercase">
                                {isCustomer ? 'Môi giới phụ trách:' : 'Khách hàng đặt hẹn:'}
                              </div>
                              <div className="font-bold text-slate-900 text-xs">
                                {isCustomer ? appt.brokerName : appt.customerName}
                              </div>
                              <div className="text-xs font-mono font-bold text-emerald-700">
                                📞 {isCustomer ? (appt.brokerPhone || 'Chưa có SĐT') : appt.customerPhone}
                              </div>
                              {appt.customerNote && (
                                <div className="text-[11px] text-slate-600 italic mt-1">
                                  "{appt.customerNote}"
                                </div>
                              )}
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Call Action */}
                              <a
                                href={`tel:${isCustomer ? appt.brokerPhone : appt.customerPhone}`}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1.5"
                              >
                                <i className="fa-solid fa-phone"></i>
                                <span>Gọi Ngay</span>
                              </a>

                              {/* Zalo Action */}
                              <a
                                href={`https://zalo.me/${normalizePhone(isCustomer ? appt.brokerPhone : appt.customerPhone)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1.5"
                              >
                                <i className="fa-solid fa-comment-dots"></i>
                                <span>Chat Zalo</span>
                              </a>
                            </div>
                          </div>

                          {/* Status Management Bar */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {appt.status !== 'confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10.5px] font-bold border border-blue-200 transition"
                                >
                                  ✓ Đánh dấu đã xác nhận
                                </button>
                              )}
                              {appt.status !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10.5px] font-bold border border-emerald-200 transition"
                                >
                                  🎉 Đã hoàn thành buổi xem
                                </button>
                              )}
                              {appt.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10.5px] font-bold transition"
                                >
                                  ✕ Hủy lịch
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa lịch hẹn #${appt.id} này?`)) {
                                  deleteAppointment(appt.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold transition"
                            >
                              <i className="fa-regular fa-trash-can mr-1"></i> Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
