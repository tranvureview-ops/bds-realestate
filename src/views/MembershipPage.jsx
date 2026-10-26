'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter } from '../router/RouterContext';
import { getResolvedFeatures } from '../utils/membershipHelper';

export default function MembershipPage() {
  const { 
    currentUser, 
    membershipPackages, 
    subscribeMembership, 
    isMembershipActive,
    showToast,
    setActiveModal 
  } = useRealEstate();

  const { navigate } = useRouter();
  const [selectedCycle, setSelectedCycle] = useState(1); // 1, 3, or 6 months
  const [confirmingPackage, setConfirmingPackage] = useState(null);

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
  const isLoggedIn = !isGuest;

  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const isMemberExpired = Boolean(currentUser?.membership && !isMemberActive);

  // Lấy đơn giá giảm trừ voucher từ gói đang dùng hoặc cấu hình chung 3 gói
  const activePackage = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId) || membershipPackages?.[0];
  const commonPublishDiscount = activePackage?.vouchersPerCycle?.normalPublishDiscount ?? 35000;
  const commonBumpDiscount = activePackage?.vouchersPerCycle?.normalBumpDiscount ?? 10000;
  const commonVipDiscount = (membershipPackages || []).find(p => Number(p.vouchersPerCycle?.vipDiscount || 0) > 0)?.vouchersPerCycle?.vipDiscount 
    ?? (activePackage?.vouchersPerCycle?.vipDiscount || 400000);

  const formatDiscountK = (val) => {
    const num = Number(val) || 0;
    if (num <= 0) return '';
    if (num >= 1000) {
      const k = num / 1000;
      return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return `${num}đ`;
  };

  const handleSubscribe = (pkg) => {
    if (isGuest || !currentUser?.email) {
      showToast('Vui lòng đăng nhập tài khoản để đăng ký hoặc gia hạn Gói Hội Viên!', 'warning');
      setActiveModal('auth');
      return;
    }

    // Chặn đăng ký gói khác nếu gói hiện tại còn hạn
    if (isMemberActive && currentUser.membership?.packageId !== pkg.id) {
      showToast(`Bạn đang sử dụng "${currentUser.membership.packageName}" còn hạn đến ${new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}. Không thể đăng ký gói khác khi gói hiện tại chưa hết hạn!`, 'warning');
      return;
    }

    const cycle = pkg.billingCycles?.find(c => c.months === selectedCycle) || pkg.billingCycles?.[0] || { months: 1, price: pkg.monthlyPrice || 500000 };
    if ((currentUser.walletBalance || 0) < cycle.price) {
      showToast(`Số dư ví (${(currentUser.walletBalance || 0).toLocaleString('vi-VN')} đ) không đủ ${cycle.price.toLocaleString('vi-VN')} đ để ${currentUser.membership?.packageId === pkg.id ? 'gia hạn' : 'đăng ký'} ${pkg.name}. Vui lòng nạp thêm tiền!`, 'warning');
      setActiveModal('wallet-deposit');
      return;
    }
    setConfirmingPackage({ pkg, cycle });
  };

  const handleConfirmSubscribe = () => {
    if (!confirmingPackage) return;
    const days = confirmingPackage.cycle.duration_days || (confirmingPackage.cycle.months * 30);
    const success = subscribeMembership(
      confirmingPackage.pkg.id, 
      confirmingPackage.cycle.months,
      days
    );
    if (success) {
      setConfirmingPackage(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition">Trang chủ</button>
          <span>/</span>
          <span className="text-slate-800 font-bold">Gói Hội Viên</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <i className="fa-solid fa-crown text-amber-500"></i>
            <span>Chính Sách Gói Hội Viên Đất Biển Đà Nẵng</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Gói Hội Viên Bất Động Sản
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Giải pháp tối ưu hóa chi phí quảng cáo và tiếp cận khách mua nhà toàn diện. Nhận kho <strong className="text-emerald-700">Voucher 30 ngày</strong> định kỳ giúp tiết kiệm tới <strong className="text-red-600">39%</strong> so với đăng tin và đẩy tin mua lẻ.
          </p>
        </div>

        {/* Current User Membership & Voucher Status Box (Chỉ hiển thị khi đã đăng nhập) */}
        {isLoggedIn && (
          <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl border ${
            isMemberExpired
              ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/70 border-rose-800/80'
              : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* User info & membership badge */}
              <div className="flex items-start sm:items-center gap-4">
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md shrink-0" 
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
                    {isMemberActive ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentUser.membership.badgeColor || 'bg-amber-400 text-slate-950'}`}>
                        <i className="fa-solid fa-crown mr-1"></i> {currentUser.membership.packageName}
                      </span>
                    ) : isMemberExpired ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <i className="fa-solid fa-triangle-exclamation mr-1"></i> GÓI ĐÃ HẾT HẠN ({currentUser.membership.packageName})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        Chưa kích hoạt Hội viên
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Số dư ví: <b className="text-emerald-400 font-mono text-sm">{currentUser.walletBalance?.toLocaleString('vi-VN')} đ</b></span>
                    {isMemberActive && (
                      <>
                        <span>Hạn dùng: <b className="text-amber-300 font-mono">{new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}</b></span>
                        {currentUser.membership.nextVoucherRefreshAt && new Date(currentUser.membership.nextVoucherRefreshAt).getTime() < new Date(currentUser.membership.expiresAt).getTime() && (
                          <span className="text-teal-300">
                            • Đợt cấp mới voucher tiếp theo: <b className="text-teal-200 font-mono">{new Date(currentUser.membership.nextVoucherRefreshAt).toLocaleDateString('vi-VN')}</b>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          currentUser.membership.isAutoRenew === true 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          <i className="fa-solid fa-arrows-rotate text-[8px]"></i>
                          <span>{currentUser.membership.isAutoRenew === true ? 'Tự động gia hạn: BẬT' : 'Tự động gia hạn: TẮT'}</span>
                        </span>
                      </>
                    )}
                    {isMemberExpired && (
                      <span className="text-rose-300 font-medium">
                        Hết hạn ngày: <b className="text-white font-mono">{new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}</b> • Toàn bộ voucher đã hết hiệu lực theo quy chế sàn.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vouchers balance pills */}
              <div className={`flex flex-wrap items-center gap-3 p-3.5 rounded-2xl border ${
                isMemberExpired
                  ? 'bg-rose-950/40 border-rose-800/60'
                  : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Tin Thường</div>
                  <div className={`text-lg font-black mt-0.5 ${isMemberExpired ? 'text-rose-400 font-mono' : 'text-emerald-400'}`}>
                    {isMemberExpired ? 0 : (currentUser.vouchers?.normalPublish || 0)} <span className="text-xs text-slate-500 font-normal">{isMemberExpired ? '(hết hạn)' : `lượt (-${formatDiscountK(commonPublishDiscount)})`}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Đẩy Tin</div>
                  <div className={`text-lg font-black mt-0.5 ${isMemberExpired ? 'text-rose-400 font-mono' : 'text-blue-400'}`}>
                    {isMemberExpired ? 0 : (currentUser.vouchers?.normalBump || 0)} <span className="text-xs text-slate-500 font-normal">{isMemberExpired ? '(hết hạn)' : `lượt (-${formatDiscountK(commonBumpDiscount)})`}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Tin VIP</div>
                  <div className={`text-lg font-black mt-0.5 ${isMemberExpired ? 'text-rose-400 font-mono' : 'text-amber-400'}`}>
                    {isMemberExpired ? 0 : (currentUser.vouchers?.vipPublish || 0)} <span className="text-xs text-slate-500 font-normal">{isMemberExpired ? '(hết hạn)' : `voucher (-${formatDiscountK(commonVipDiscount)})`}</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isMemberActive ? (
                  <button
                    onClick={() => navigate('/dang-tin')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-plus-circle"></i>
                    <span>Dùng Voucher Đăng Tin</span>
                  </button>
                ) : isMemberExpired ? (
                  <button
                    onClick={() => {
                      const el = document.getElementById('pricing-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1.5 animate-pulse"
                  >
                    <i className="fa-solid fa-arrows-rotate"></i>
                    <span>Gia Hạn Gói Ngay</span>
                  </button>
                ) : null}
                <button
                  onClick={() => setActiveModal('wallet-deposit')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition"
                  title="Nạp thêm tiền vào ví"
                >
                  <i className="fa-solid fa-wallet mr-1"></i> + Nạp Ví
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector (1 Tháng, 3 Tháng, 6 Tháng) */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chọn kỳ hạn đăng ký gói hội viên:
          </div>
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm gap-1">
            <button
              onClick={() => setSelectedCycle(1)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                selectedCycle === 1 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 Tháng
            </button>
            <button
              onClick={() => setSelectedCycle(3)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCycle === 3 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>3 Tháng</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${selectedCycle === 3 ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'}`}>
                -5%
              </span>
            </button>
            <button
              onClick={() => setSelectedCycle(6)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCycle === 6 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>6 Tháng</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${selectedCycle === 6 ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-800'}`}>
                -10% Tối ưu
              </span>
            </button>
          </div>
        </div>

        {/* 3 Main Membership Packages Cards */}
        <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {(membershipPackages || []).map((pkg) => {
            const cycle = pkg.billingCycles.find(c => c.months === selectedCycle) || pkg.billingCycles[0];
            const isCurrent = currentUser?.membership?.packageId === pkg.id;
            const isOtherPackageLocked = isMemberActive && !isCurrent;

            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  pkg.recommended 
                    ? 'bg-white border-2 border-amber-500 shadow-2xl ring-4 ring-amber-400/10' 
                    : 'bg-white border border-slate-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] uppercase px-4 py-1 rounded-full shadow-md tracking-wider">
                    ★ Gói Phổ Biến & Bán Chạy Nhất
                  </div>
                )}

                <div>
                  {/* Top Badge & Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Chu kỳ {selectedCycle} tháng
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
                    {pkg.targetAudience}
                  </p>

                  {/* Price display */}
                  <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {cycle.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-bold text-slate-500">đ / {selectedCycle} tháng</span>
                    </div>
                    {selectedCycle > 1 && (
                      <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-tag"></i>
                        <span>{cycle.note || `Tiết kiệm thêm khi đăng ký ${selectedCycle} tháng`}</span>
                      </div>
                    )}
                  </div>

                  {/* Monthly Vouchers Breakdown */}
                  <div className="space-y-3 pt-2 pb-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-ticket text-emerald-600"></i>
                      <span>Kho Voucher Cấp Mỗi 30 Ngày:</span>
                    </div>

                    <div className="space-y-2">
                      {/* Tin thường voucher */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                            {pkg.vouchersPerCycle?.normalPublishVouchers || 0}
                          </span>
                          <span className="font-bold text-emerald-950">Voucher Đăng Tin Thường</span>
                        </div>
                        <span className="text-emerald-700 font-black text-[11px]">
                          -{Number(pkg.vouchersPerCycle?.normalPublishDiscount || 35000).toLocaleString('vi-VN')} đ/lần
                        </span>
                      </div>

                      {/* Đẩy tin thường voucher */}
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                            {pkg.vouchersPerCycle?.normalBumpVouchers || 0}
                          </span>
                          <span className="font-bold text-blue-950">Voucher Đẩy Tin Thường</span>
                        </div>
                        <span className="text-blue-700 font-black text-[11px]">
                          -{Number(pkg.vouchersPerCycle?.normalBumpDiscount || 10000).toLocaleString('vi-VN')} đ/lần
                        </span>
                      </div>

                      {/* Tin VIP voucher */}
                      {(pkg.vouchersPerCycle?.vipVouchers || 0) > 0 ? (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              {pkg.vouchersPerCycle.vipVouchers}
                            </span>
                            <span className="font-bold text-amber-950">Voucher Giảm Tin VIP</span>
                          </div>
                          <span className="text-amber-800 font-black text-[11px]">
                            -{Number(pkg.vouchersPerCycle?.vipDiscount || 400000).toLocaleString('vi-VN')} đ/tin
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>Voucher Tin VIP:</span>
                          <span className="text-[11px]">Không áp dụng</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                      Tiện ích & Quyền lợi đi kèm:
                    </div>
                    {getResolvedFeatures(pkg).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-xs shrink-0"></i>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribe Button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSubscribe(pkg)}
                    disabled={isOtherPackageLocked}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
                      isOtherPackageLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : isCurrent && isMemberActive
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : isCurrent && isMemberExpired
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                        : pkg.recommended
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    }`}
                  >
                    <i className={isOtherPackageLocked ? "fa-solid fa-lock text-sm" : "fa-solid fa-crown text-sm"}></i>
                    <span>
                      {isOtherPackageLocked
                        ? `Đang Dùng ${currentUser?.membership?.shortName || currentUser?.membership?.packageName}`
                        : isCurrent
                        ? (isMemberExpired ? 'Gia Hạn Lại Gói Này' : 'Gia Hạn Gói Này')
                        : `Đăng Ký ${pkg.shortName}`}
                    </span>
                  </button>

                  {isOtherPackageLocked && (
                    <div className="text-[10px] text-amber-700/90 text-center mt-2 font-medium flex items-center justify-center gap-1">
                      <i className="fa-solid fa-circle-exclamation text-[9px] text-amber-600"></i>
                      <span>Cần chờ gói hiện tại hết hạn để đổi sang gói này</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900">
              Bảng So Sánh Chi Tiết Quyền Lợi Các Gói Hội Viên
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Chính sách cấp voucher định kỳ 30 ngày theo quy chế sàn
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4 w-1/3">Tiêu Chí & Tiện Ích</th>
                  {(membershipPackages || []).map(p => (
                    <th key={p.id} className={`p-4 text-center ${p.recommended ? 'bg-amber-50/50 text-amber-900 font-black' : ''}`}>
                      {p.name} {p.recommended ? '★' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-bold text-slate-800">Mức giá đăng ký hàng tháng</td>
                  {(membershipPackages || []).map(p => (
                    <td key={p.id} className={`p-4 text-center font-bold ${p.recommended ? 'text-amber-700 bg-amber-50/30 font-black' : 'text-slate-700'}`}>
                      {Number(p.monthlyPrice || 0).toLocaleString('vi-VN')} đ/tháng
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Tỷ lệ tiết kiệm so với mua lẻ</td>
                  {(membershipPackages || []).map(p => (
                    <td key={p.id} className={`p-4 text-center font-bold text-emerald-600 ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                      {p.savePercent || 0}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher Đăng Tin Thường (30 ngày)</td>
                  {(membershipPackages || []).map(p => (
                    <td key={p.id} className={`p-4 text-center font-black text-emerald-600 text-sm ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                      {p.vouchersPerCycle?.normalPublishVouchers || 0} lượt/tháng
                      <div className="text-[10px] text-slate-400 font-normal">(-{Number(p.vouchersPerCycle?.normalPublishDiscount || 35000).toLocaleString('vi-VN')} đ/lần)</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher Đẩy Tin Thường (30 ngày)</td>
                  {(membershipPackages || []).map(p => (
                    <td key={p.id} className={`p-4 text-center font-black text-blue-600 text-sm ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                      {p.vouchersPerCycle?.normalBumpVouchers || 0} lượt/tháng
                      <div className="text-[10px] text-slate-400 font-normal">(-{Number(p.vouchersPerCycle?.normalBumpDiscount || 10000).toLocaleString('vi-VN')} đ/lần)</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher Giảm Tin VIP (30 ngày)</td>
                  {(membershipPackages || []).map(p => (
                    <td key={p.id} className={`p-4 text-center ${(p.vouchersPerCycle?.vipVouchers || 0) > 0 ? 'font-black text-amber-600 text-sm' : 'text-slate-400'} ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                      {(p.vouchersPerCycle?.vipVouchers || 0) > 0 ? (
                        <>
                          {p.vouchersPerCycle.vipVouchers} voucher/tháng
                          <div className="text-[10px] text-slate-400 font-normal">(-{Number(p.vouchersPerCycle?.vipDiscount || 400000).toLocaleString('vi-VN')} đ/tin)</div>
                        </>
                      ) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Hẹn giờ đăng tin tự động khung giờ vàng</td>
                  {(membershipPackages || []).map(p => {
                    const hasFeature = typeof p.allowScheduledPublishing === 'boolean'
                      ? p.allowScheduledPublishing
                      : (p.features || []).some(f => /hẹn giờ/i.test(f));
                    return (
                      <td key={p.id} className={`p-4 text-center font-bold ${hasFeature ? 'text-emerald-600' : 'text-slate-400'} ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                        {hasFeature ? '✓ Có hỗ trợ' : '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Chọn ngày bắt đầu đăng tin trong tương lai</td>
                  {(membershipPackages || []).map(p => {
                    const hasFeature = typeof p.allowFutureStartDate === 'boolean'
                      ? p.allowFutureStartDate
                      : (p.id === 'member-basic' ? false : true);
                    return (
                      <td key={p.id} className={`p-4 text-center font-bold ${hasFeature ? 'text-emerald-600' : 'text-slate-400'} ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                        {hasFeature ? '✓ Tự do chọn ngày' : '— (Chỉ đăng hôm nay)'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Ưu tiên xuất bản & duyệt tin sớm</td>
                  {(membershipPackages || []).map((p, idx) => {
                    const hasFeature = (p.features || []).some(f => /ưu tiên|duyệt tin/i.test(f));
                    const isHighest = idx === (membershipPackages || []).length - 1;
                    return (
                      <td key={p.id} className={`p-4 text-center font-bold ${hasFeature ? 'text-emerald-600' : 'text-slate-400'} ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                        {hasFeature ? (isHighest ? '✓ Ưu tiên cao nhất' : '✓ Có hỗ trợ') : '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Báo cáo hiệu suất lượt xem & tương tác</td>
                  {(membershipPackages || []).map((p, idx) => {
                    const reportLabel = idx === 0 ? 'Cơ bản' : idx === 1 ? 'Chi tiết' : 'Chuyên sâu & Thị trường';
                    return (
                      <td key={p.id} className={`p-4 text-center font-bold ${idx === 2 ? 'text-purple-700 font-black' : idx === 1 ? 'text-slate-800' : 'text-slate-500'} ${p.recommended ? 'bg-amber-50/30' : ''}`}>
                        {reportLabel}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
          <h4 className="text-base font-black text-slate-900">
            Câu Hỏi Thường Gặp Về Gói Hội Viên & Voucher
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">1. Voucher được cấp và sử dụng như thế nào?</div>
              <p>Ngay khi bạn đăng ký gói hội viên thành công, toàn bộ số lượng voucher tương ứng sẽ được cộng tự động vào kho voucher cá nhân của bạn. Khi đăng tin hoặc đẩy tin, hệ thống sẽ tự động gợi ý bạn áp dụng voucher để giảm trừ chi phí về 0 đ.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">2. Mua gói 3 tháng, 6 tháng thì voucher được cấp thế nào?</div>
              <p>Theo chuẩn quy chế Batdongsan (Hình thức 1), quyền lợi voucher được cấp mới định kỳ mỗi 30 ngày một lần. Khách hàng mua gói 3 tháng sẽ nhận 3 đợt cấp voucher, gói 6 tháng nhận 6 đợt. Mỗi 30 ngày, hệ thống sẽ tự động cấp mới bộ voucher tương ứng để bạn sử dụng cho tháng tiếp theo.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">3. Tin VIP Kim Cương có ưu đãi gì đặc biệt?</div>
              <p>VIP Kim Cương sở hữu đặc quyền "Nhân đôi hiển thị": Khi tạo tin VIP Kim Cương, bạn được tặng kèm 1 Tin Thường hiển thị đồng thời; và khi bạn Đẩy tin VIP Kim Cương, tin thường đi kèm cũng được đẩy MIỄN PHÍ!</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">4. Tôi có thể đổi sang gói khác khi đang dùng không?</div>
              <p>Để đảm bảo quyền lợi và sự đồng bộ của kho voucher, khi gói hội viên hiện tại đang còn hạn sử dụng, bạn sẽ không thể đăng ký gói khác mà chỉ có thể gia hạn gói đang dùng. Bạn có thể đổi sang gói mới sau khi gói cũ hết hạn sử dụng.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingPackage && (() => {
        const isRenew = currentUser?.membership?.packageId === confirmingPackage.pkg.id;
        const days = confirmingPackage.cycle.duration_days || (confirmingPackage.cycle.months * 30);
        const baseTime = (isRenew && currentUser?.membership?.expiresAt && new Date(currentUser.membership.expiresAt).getTime() > Date.now())
          ? new Date(currentUser.membership.expiresAt).getTime()
          : Date.now();
        const projectedExpiry = new Date(baseTime + days * 86400000);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black shrink-0">
                  <i className="fa-solid fa-crown text-amber-500"></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    {isRenew ? 'Xác Nhận Gia Hạn Hội Viên' : 'Xác Nhận Đăng Ký Hội Viên'}
                  </h4>
                  <div className="text-xs text-slate-500">{confirmingPackage.pkg.name}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hình thức:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${isRenew ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {isRenew ? 'Gia hạn gói đang dùng' : 'Đăng ký mới'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kỳ hạn đăng ký:</span>
                  <span className="font-bold text-slate-900">{confirmingPackage.cycle.label || `${confirmingPackage.cycle.months} tháng`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời hạn sử dụng:</span>
                  <span className="font-bold text-teal-700 font-mono">
                    {days} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chu kỳ cấp Voucher:</span>
                  <span className="font-bold text-emerald-700">
                    Cấp mới mỗi 30 ngày ({confirmingPackage.cycle.months} đợt)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hạn dùng sau khi {isRenew ? 'gia hạn' : 'đăng ký'}:</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {projectedExpiry.toLocaleDateString('vi-VN')} {isRenew ? '(Cộng nối tiếp)' : ''}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-500">Tổng thanh toán:</span>
                  <span className="font-black text-emerald-600 text-base">
                    {confirmingPackage.cycle.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số dư ví hiện tại:</span>
                  <span className="font-mono text-slate-700">
                    {(currentUser?.walletBalance || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="border-t pt-2 space-y-1 text-[11px] text-slate-600">
                  <div className="font-bold text-slate-700">Kho Voucher sẽ nhận:</div>
                  <div>✓ {confirmingPackage.pkg.vouchersPerCycle?.normalPublishVouchers || 0} voucher giảm {Number(confirmingPackage.pkg.vouchersPerCycle?.normalPublishDiscount || 35000).toLocaleString('vi-VN')} đ đăng tin thường</div>
                  <div>✓ {confirmingPackage.pkg.vouchersPerCycle?.normalBumpVouchers || 0} voucher giảm {Number(confirmingPackage.pkg.vouchersPerCycle?.normalBumpDiscount || 10000).toLocaleString('vi-VN')} đ đẩy tin thường</div>
                  {(confirmingPackage.pkg.vouchersPerCycle?.vipVouchers || 0) > 0 && (
                    <div>✓ {confirmingPackage.pkg.vouchersPerCycle.vipVouchers} voucher giảm {Number(confirmingPackage.pkg.vouchersPerCycle?.vipDiscount || 400000).toLocaleString('vi-VN')} đ tin VIP</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingPackage(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubscribe}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition"
                >
                  {isRenew ? 'Xác Nhận Gia Hạn Ngay' : 'Xác Nhận & Trừ Ví'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
