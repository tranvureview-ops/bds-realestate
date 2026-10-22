'use client';

import React, { useState, useRef } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { normalizePhone } from '../utils/authValidation';
import { Link, useRouter } from '../router/RouterContext';

// Helper nén và cắt ảnh đại diện thành hình vuông 1:1 chất lượng cao
const resizeImageToAvatar = (file, maxWidth = 400, maxHeight = 400, quality = 0.88) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(maxWidth, size);
        canvas.height = Math.min(maxHeight, size);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, startX, startY, size, size, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

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
    navigateToProperty,
    membershipPackages,
    toggleMembershipAutoRenew,
    isMembershipActive
  } = useRealEstate();

  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'membership', 'kyc', 'security', 'notifications', 'appointments'
  const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'

  // Trạng thái gói hội viên & tự động gia hạn
  const memberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const memberExpired = Boolean(currentUser?.membership?.packageId && currentUser.membership.packageId !== 'none' && !memberActive);
  const hasMembership = Boolean(currentUser?.membership?.packageId && currentUser.membership.packageId !== 'none');
  const isAutoRenew = Boolean(currentUser?.membership?.isAutoRenew);

  const currentPkg = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
  const billingMonths = currentUser?.membership?.billingMonths || 1;
  const cycleInfo = currentPkg?.billingCycles?.find(c => c.months === billingMonths) || currentPkg?.billingCycles?.[0];
  const renewalCost = cycleInfo?.price || currentPkg?.monthlyPrice || 0;
  const isWalletSufficient = (currentUser?.walletBalance || 0) >= renewalCost;

  const expiresAtTime = currentUser?.membership?.expiresAt ? new Date(currentUser.membership.expiresAt).getTime() : 0;
  const daysDiff = expiresAtTime ? Math.ceil((expiresAtTime - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

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
    primaryArea: currentUser.primaryArea || 'TP. Đà Nẵng',
    company: currentUser.company || 'Đất Biển Đà Nẵng Partner',
    address: currentUser.address || 'Góc Võ Nguyên Giáp & Phạm Văn Đồng, P. Phước Mỹ, Q. Sơn Trà, TP. Đà Nẵng',
    avatar: currentUser.avatar || '/avatars/ai-preset-2.jpg'
  });

  // Tự động đồng bộ form với currentUser khi hydration hoặc đổi tài khoản
  React.useEffect(() => {
    if (currentUser && currentUser.id !== 'guest') {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name || '',
        phone: currentUser.phone || prev.phone || '',
        email: currentUser.email || prev.email || '',
        avatar: currentUser.avatar || prev.avatar || '',
        bio: currentUser.bio || prev.bio || '',
        primaryArea: currentUser.primaryArea || prev.primaryArea || '',
        company: currentUser.company || prev.company || '',
        address: currentUser.address || prev.address || ''
      }));
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.avatar, currentUser?.phone, currentUser?.email]);

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
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2 hình mẫu avatar AI: 1 Nam, 1 Nữ theo yêu cầu
  const AVATAR_PRESETS = [
    {
      url: '/avatars/ai-preset-2.jpg',
      label: 'Mẫu Nam',
      tag: 'Nam'
    },
    {
      url: '/avatars/ai-preset-1.jpg',
      label: 'Mẫu Nữ',
      tag: 'Nữ'
    }
  ];

  // Upload Avatar state & handler
  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP)!', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Kích thước ảnh tối đa là 10MB!', 'warning');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const optimizedDataUrl = await resizeImageToAvatar(file, 400, 400, 0.88);
      setFormData(prev => ({ ...prev, avatar: optimizedDataUrl }));
      updateUserProfile({ avatar: optimizedDataUrl });
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('Không thể xử lý hình ảnh, vui lòng thử lại với ảnh khác!', 'error');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.currentPassword.trim()) {
      const msg = 'Vui lòng nhập mật khẩu hiện tại của bạn.';
      setPasswordError(msg);
      showToast(msg, 'warning');
      return;
    }
    if (!passwordForm.newPassword || !passwordForm.newPassword.trim()) {
      const msg = 'Vui lòng nhập mật khẩu mới.';
      setPasswordError(msg);
      showToast(msg, 'warning');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      const msg = 'Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
      setPasswordError(msg);
      showToast(msg, 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      const msg = 'Xác nhận mật khẩu mới không khớp.';
      setPasswordError(msg);
      showToast(msg, 'error');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      const msg = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
      setPasswordError(msg);
      showToast(msg, 'warning');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email,
          phone: currentUser?.phone,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmNewPassword
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!';
        setPasswordError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      const successMsg = data.message || 'Đổi mật khẩu tài khoản thành công! Mật khẩu mới đã được cập nhật an toàn.';
      setPasswordSuccess(successMsg);
      showToast(successMsg, 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu đổi mật khẩu:', err);
      const errorMsg = 'Lỗi kết nối máy chủ khi đổi mật khẩu. Vui lòng thử lại sau.';
      setPasswordError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* 1. TOP HEADER PROFILE CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <img
                src={formData.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-emerald-500 shadow-lg cursor-pointer transition hover:opacity-95"
                onClick={() => fileInputRef.current?.click()}
                title="Bấm để tải ảnh đại diện từ máy tính / điện thoại"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 hover:bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white transition cursor-pointer"
                title="Bấm để tải ảnh đại diện từ thiết bị"
              >
                {isUploadingAvatar ? (
                  <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                ) : (
                  <i className="fa-solid fa-camera"></i>
                )}
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

          {/* Top Actions: Wallet Balance & Membership Auto-Renew Overview */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Wallet Balance & Deposit Action */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between sm:justify-start gap-4">
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Số dư ví tài khoản</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                  {currentUser.walletBalance.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1.5">
                  <span>Ví KM: <strong className="font-mono">{(Number(currentUser.bonusWalletBalance) || 0).toLocaleString('vi-VN')} đ</strong></span>
                  {currentUser.bonusExpiresAt && Number(currentUser.bonusWalletBalance) > 0 && (
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Hạn: {new Date(currentUser.bonusExpiresAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('wallet-deposit')}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span>Nạp Tiền</span>
              </button>
            </div>

            {/* Membership & Auto-Renew Quick Card */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between sm:justify-start gap-3.5 ${
              memberActive 
                ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border-amber-200/90' 
                : memberExpired
                ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <i className="fa-solid fa-crown text-amber-500"></i>
                  <span>Gói Hội Viên</span>
                  {memberActive && (
                    <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-bold">Active</span>
                  )}
                  {memberExpired && (
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-bold">Hết hạn</span>
                  )}
                </div>
                <div className="text-sm font-black text-slate-900 mt-0.5 truncate max-w-[170px]">
                  {currentUser.membership?.packageName || 'Chưa đăng ký'}
                </div>
                <div className="text-[10px] mt-0.5 flex items-center gap-1.5">
                  {hasMembership ? (
                    <>
                      <span className={daysDiff > 0 ? 'text-slate-600' : 'text-rose-600 font-bold'}>
                        {daysDiff > 0 ? `Còn ${daysDiff} ngày` : 'Đã hết hạn'}
                      </span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => toggleMembershipAutoRenew()}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${
                          isAutoRenew 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Click để bật/tắt tự động gia hạn"
                      >
                        <i className={`fa-solid fa-arrows-rotate text-[8px] ${isAutoRenew ? 'animate-spin' : ''}`}></i>
                        <span>Tự gia hạn: {isAutoRenew ? 'BẬT' : 'TẮT'}</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-500">Tiết kiệm 39% chi phí</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('membership')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 cursor-pointer"
                title="Quản lý gói hội viên & tự động gia hạn"
              >
                <span>Cài Đặt</span>
              </button>
            </div>
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
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`w-full p-3 rounded-2xl transition flex items-center justify-between text-left ${
              activeTab === 'membership' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-crown text-sm w-5 text-center text-amber-500"></i>
              <span>Gói Hội Viên & Gia Hạn</span>
            </div>
            {memberActive ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'membership' ? 'bg-white text-emerald-800' : isAutoRenew ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isAutoRenew ? 'Auto-renew: BẬT' : 'Đang dùng'}
              </span>
            ) : memberExpired ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'membership' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
              }`}>
                Hết hạn
              </span>
            ) : (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'membership' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                Mới
              </span>
            )}
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
            <Link
              to="/quan-ly-tin"
              className="w-full p-3 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition flex items-center gap-3 text-left font-bold"
            >
              <i className="fa-solid fa-list-check text-sm w-5 text-center text-emerald-600"></i>
              <span>Quản lý tin đăng</span>
            </Link>

            <button
              onClick={() => {
                logoutUser();
                navigate('/dang-nhap');
              }}
              className="w-full p-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition flex items-center gap-3 text-left font-bold cursor-pointer"
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

              {/* Khối Cập Nhật Ảnh Đại Diện Trực Quan */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
                <label className="block text-slate-700 font-bold uppercase text-[11px]">Ảnh đại diện tài khoản:</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group">
                    <img
                      src={formData.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xs">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {isUploadingAvatar ? (
                          <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                        ) : (
                          <i className="fa-solid fa-cloud-arrow-up text-emerald-400"></i>
                        )}
                        <span>{isUploadingAvatar ? 'Đang xử lý ảnh...' : 'Tải Ảnh Mới Từ Thiết Bị'}</span>
                      </button>
                    </div>
                    <div className="text-[10.5px] text-slate-500 leading-relaxed">
                      Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB). Ảnh được tự động cắt vuông chuẩn 1:1 và nén tối ưu hiển thị nhanh.
                    </div>
                  </div>
                </div>

                {/* Avatar mẫu gợi ý có gắn chữ AI */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Hoặc chọn nhanh avatar mẫu AI:</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      2 mẫu AI (1 Nam • 1 Nữ)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {AVATAR_PRESETS.map((preset, idx) => {
                      const presetUrl = preset.url;
                      const isSelected = formData.avatar === presetUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, avatar: presetUrl }));
                            updateUserProfile({ avatar: presetUrl });
                            showToast(`Đã chọn avatar AI (${preset.label})!`, 'success');
                          }}
                          className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 transition cursor-pointer hover:scale-102 group shadow-xs ${
                            isSelected ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                          title={`Chọn avatar AI: ${preset.label}`}
                        >
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            <img src={presetUrl} alt={`Avatar preset AI ${preset.label}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 px-1 py-px bg-slate-900/90 backdrop-blur-[2px] text-[7.5px] font-black text-emerald-400 rounded leading-none border border-emerald-500/40 pointer-events-none">
                              AI
                            </span>
                          </div>
                          <div className="text-left pr-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-800">{preset.label}</span>
                              <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${preset.tag === 'Nam' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {preset.tag}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              {isSelected ? '✓ Đang sử dụng' : 'Bấm để áp dụng'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

          {/* TAB: GÓI HỘI VIÊN & TỰ ĐỘNG GIA HẠN */}
          {activeTab === 'membership' && (
            <div className="space-y-6 text-xs animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <i className="fa-solid fa-crown text-amber-500"></i>
                    <span>Quản Lý Gói Hội Viên & Tự Động Gia Hạn</span>
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Quản lý chu kỳ sử dụng, kho voucher định kỳ 30 ngày và thiết lập tự động trừ ví để duy trì quyền lợi
                  </p>
                </div>

                <Link
                  to="/goi-hoi-vien"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fa-solid fa-table-list text-[11px] text-amber-400"></i>
                  <span>Bảng Quyền Lợi Gói ↗</span>
                </Link>
              </div>

              {/* KHỐI 1: TÍNH NĂNG TỰ ĐỘNG GIA HẠN KHI HẾT HẠN (YÊU CẦU CHÍNH) */}
              <div className={`p-5 rounded-3xl border transition-all duration-200 shadow-sm ${
                isAutoRenew 
                  ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white border-emerald-300' 
                  : 'bg-gradient-to-br from-slate-50/90 via-amber-50/40 to-white border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isAutoRenew ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                        <span>Tự Động Gia Hạn Khi Gói Hết Hạn</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAutoRenew ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isAutoRenew ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                        </span>
                      </h4>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Khi đến ngày hết hạn gói hội viên, hệ thống sẽ tự động trừ số tiền chu kỳ tiếp theo từ số dư ví tài khoản để gia hạn và cấp mới trọn bộ voucher 30 ngày. Quyền lợi hội viên của bạn sẽ được duy trì liên tục mà không lo bị gián đoạn.
                    </p>
                  </div>

                  {/* Toggle Switch Component */}
                  <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAutoRenew}
                        onChange={() => toggleMembershipAutoRenew()}
                        disabled={!hasMembership}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600 ${!hasMembership ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      <span className="ml-3 text-xs font-bold text-slate-800 hidden sm:inline">
                        {isAutoRenew ? 'Bật (ON)' : 'Tắt (OFF)'}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {hasMembership ? 'Nhấn để chuyển đổi' : 'Cần đăng ký gói để bật'}
                    </span>
                  </div>
                </div>

                {/* Hướng Dẫn & Thông Báo Dự Báo Số Dư Ví */}
                {hasMembership && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/90 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                        <span>Chi phí gia hạn chu kỳ tới:</span>
                        <span className="text-slate-800 font-extrabold">{billingMonths} tháng</span>
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        {renewalCost.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        Gói hiện tại: <strong>{currentUser.membership?.packageName}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/90 space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center justify-between">
                        <span>Số dư ví khả dụng:</span>
                        <button
                          type="button"
                          onClick={() => setActiveModal('wallet-deposit')}
                          className="text-emerald-700 hover:underline font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-plus-circle text-[9px]"></i> Nạp ví
                        </button>
                      </div>
                      <div className="text-base font-black text-slate-900">
                        {currentUser.walletBalance.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10.5px]">
                        {isWalletSufficient ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-circle-check"></i> Đủ tiền tự động gia hạn
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-triangle-exclamation"></i> Cần nạp thêm {(renewalCost - currentUser.walletBalance).toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 2: CHI TIẾT GÓI HỘI VIÊN & KHO VOUCHER */}
              {hasMembership ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-black shrink-0">
                        <i className="fa-solid fa-gem"></i>
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {currentUser.membership?.packageName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mã gói: <span className="font-mono">{currentUser.membership?.packageId}</span> • Chu kỳ: <span className="font-bold text-slate-700">{billingMonths} tháng</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        memberActive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {memberActive ? 'Đang Hoạt Động' : 'Đã Hết Hạn'}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin chu kỳ ngày */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Ngày đăng ký</div>
                      <div className="font-bold text-slate-800 mt-1">
                        {currentUser.membership?.subscribedAt ? new Date(currentUser.membership.subscribedAt).toLocaleDateString('vi-VN') : '—'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Ngày hết hạn chu kỳ</div>
                      <div className="font-bold text-slate-800 mt-1">
                        {currentUser.membership?.expiresAt ? new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN') : '—'}
                      </div>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      daysDiff > 5 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
                      daysDiff > 0 ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
                      'bg-rose-50/80 border-rose-200 text-rose-900'
                    }`}>
                      <div className="text-[10px] font-bold uppercase opacity-80">Thời gian còn lại</div>
                      <div className="font-black text-sm mt-0.5">
                        {daysDiff > 0 ? `${daysDiff} ngày nữa` : 'Đã hết thời hạn'}
                      </div>
                    </div>
                  </div>

                  {/* Kho voucher chu kỳ 30 ngày */}
                  <div className="space-y-2 pt-2">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-ticket text-emerald-600"></i>
                        <span>Kho Voucher Chu Kỳ 30 Ngày (Đang Khả Dụng)</span>
                      </span>
                      {currentUser.membership?.nextVoucherRefreshAt && (
                        <span className="text-[11px] text-slate-500 font-normal">
                          Lần cấp tiếp theo: <strong className="text-slate-700">{new Date(currentUser.membership.nextVoucherRefreshAt).toLocaleDateString('vi-VN')}</strong>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Voucher Đăng Tin Thường</div>
                          <div className="text-[10px] text-slate-400">Giảm 35.000 đ/tin về 0 đ</div>
                        </div>
                        <div className="text-xl font-black text-emerald-700">
                          {currentUser.vouchers?.normalPublish || 0}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Voucher Đẩy Tin Làm Mới</div>
                          <div className="text-[10px] text-slate-400">Giảm 10.000 đ/lần về 0 đ</div>
                        </div>
                        <div className="text-xl font-black text-blue-700">
                          {currentUser.vouchers?.normalBump || 0}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Voucher Đăng Tin VIP</div>
                          <div className="text-[10px] text-slate-400">Giảm 400.000 đ/tin</div>
                        </div>
                        <div className="text-xl font-black text-amber-600">
                          {currentUser.vouchers?.vipPublish || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hành động: Gia hạn thủ công hoặc đổi gói */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <i className="fa-regular fa-lightbulb text-amber-500"></i>
                      <span>Bạn có thể chủ động gia hạn trước khi hết hạn hoặc nâng cấp gói bất kỳ lúc nào.</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveModal('wallet-deposit')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        Nạp Ví Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/goi-hoi-vien')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Gia Hạn / Đổi Gói</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chưa đăng ký gói */
                <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md shadow-amber-500/20">
                    <i className="fa-solid fa-crown"></i>
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-lg font-black text-slate-900">
                      Nâng Tầm Môi Giới Với Gói Hội Viên
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tiết kiệm tới <strong>39% chi phí</strong>, nhận kho voucher đăng tin & đẩy tin định kỳ 30 ngày, tự động đẩy tin khung giờ vàng và tính năng tự động gia hạn tiện lợi.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/goi-hoi-vien')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition cursor-pointer inline-flex items-center gap-2"
                    >
                      <i className="fa-solid fa-crown"></i>
                      <span>Xem Bảng Gói & Đăng Ký Ngay</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                <p className="text-slate-500 text-[11px] mt-0.5">Khuyến nghị đổi mật khẩu định kỳ 6 tháng một lần để bảo vệ an toàn số dư ví và quyền quản lý tin đăng</p>
              </div>

              {/* Banner thông báo lỗi nếu có */}
              {passwordError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
                  <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5 text-sm shrink-0"></i>
                  <div className="font-semibold leading-relaxed">{passwordError}</div>
                </div>
              )}

              {/* Banner thông báo thành công */}
              {passwordSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
                  <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5 text-sm shrink-0"></i>
                  <div className="font-semibold leading-relaxed">{passwordSuccess}</div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Mật khẩu hiện tại:</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu hiện tại đang dùng"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                    title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fa-solid ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Mật khẩu mới:</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                        if (passwordError) setPasswordError('');
                      }}
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                      title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[11px]">Xác nhận mật khẩu mới:</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới vừa đặt"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => {
                        setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value });
                        if (passwordError) setPasswordError('');
                      }}
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                      title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn tiêu chuẩn mật khẩu an toàn */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                  <span>Yêu cầu tiêu chuẩn bảo mật cho mật khẩu mới:</span>
                </div>
                <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5 leading-relaxed">
                  <li>Độ dài tối thiểu từ <strong>8 ký tự</strong> trở lên.</li>
                  <li>Bao gồm đồng thời: chữ in hoa (A-Z), chữ thường (a-z), chữ số (0-9) và ký tự đặc biệt (@, #, $, %, v.v.).</li>
                  <li>Không trùng khớp với mật khẩu cũ đang sử dụng.</li>
                </ul>
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
                disabled={isSubmittingPassword}
                className={`px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 ${
                  isSubmittingPassword ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmittingPassword ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Đang xác thực & lưu mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key"></i>
                    <span>Cập Nhật Mật Khẩu Mới</span>
                  </>
                )}
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
