'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { VIP_PACKAGES } from '../data/mockData';
import { getPropertyPermalink } from '../utils/permalink';

export default function UserDashboard() {
  const { 
    properties, 
    currentUser, 
    transactions, 
    bumpListing, 
    deleteProperty, 
    restoreProperty,
    permanentDeleteProperty,
    emptyTrash,
    setSelectedPropertyForVip, 
    setActiveModal, 
    openPropertyDetail,
    showToast,
    renewProperty,
    getPropertyExpirationInfo,
    isMembershipActive,
    vipPackages: contextVipPackages
  } = useRealEstate();

  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'wallet', 'transactions', 'trash'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'expiring_soon', 'expired', 'pending'

  // Renewal Modal State (Batdongsan standard)
  const [renewModalProp, setRenewModalProp] = useState(null);
  const [renewDays, setRenewDays] = useState(15);
  const [renewVipId, setRenewVipId] = useState('normal');
  const [renewAutoRenew, setRenewAutoRenew] = useState(false);

  const activeVipPackages = (contextVipPackages && contextVipPackages.length > 0) ? contextVipPackages : VIP_PACKAGES;

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const isMemberExpired = Boolean(currentUser?.membership && !isMemberActive);

  // Listings authored by currentUser (or all listings if demo admin/broker)
  const myListings = properties.filter(p => {
    // Bỏ qua tin đã nằm trong thùng rác hoặc đã xóa
    if (p.isDeleted || p.status === 'trash') return false;

    // Show listings belonging to this user or all broker listings for demo
    if (currentUser?.role === 'admin') return true;
    if (isGuest) {
      return p.author && (String(p.author.id).startsWith('guest') || p.author.id === 'guest');
    }
    return p.author && p.author.id === currentUser?.id;
  });

  // Các tin rao đã chuyển vào Thùng rác (Trash)
  const trashListings = properties.filter(p => {
    if (!p.isDeleted && p.status !== 'trash') return false;
    if (currentUser?.role === 'admin') return true;
    if (isGuest) {
      return p.author && (String(p.author.id).startsWith('guest') || p.author.id === 'guest');
    }
    return p.author && p.author.id === currentUser?.id;
  });

  const activeCount = myListings.filter(p => p.status === 'active' && !getPropertyExpirationInfo?.(p)?.isExpired).length;
  const pendingCount = myListings.filter(p => p.status === 'pending').length;
  const expiringCount = myListings.filter(p => {
    const info = getPropertyExpirationInfo?.(p);
    return Boolean(info?.isExpiringSoon) && p.status === 'active';
  }).length;
  const expiredCount = myListings.filter(p => {
    const info = getPropertyExpirationInfo?.(p);
    return Boolean(info?.isExpired) || p.status === 'expired';
  }).length;

  const filteredListings = myListings.filter(p => {
    if (statusFilter === 'all') return true;
    const info = getPropertyExpirationInfo ? getPropertyExpirationInfo(p) : null;
    if (statusFilter === 'active') return p.status === 'active' && !info?.isExpired;
    if (statusFilter === 'pending') return p.status === 'pending';
    if (statusFilter === 'expiring_soon') return Boolean(info?.isExpiringSoon) && p.status === 'active';
    if (statusFilter === 'expired') return Boolean(info?.isExpired) || p.status === 'expired';
    return p.status === statusFilter;
  });

  const totalViews = myListings.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalCalls = myListings.reduce((sum, p) => sum + (p.callsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Profile & Quick Stats */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={currentUser?.name || 'Khách vãng lai'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser?.name || 'Khách vãng lai'}
              </h1>
              {currentUser?.isVerified && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
                  <i className="fa-solid fa-circle-check"></i> Đã xác thực
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.roleName || 'Chưa đăng nhập'} {currentUser?.phone ? `• SĐT: ${currentUser.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Wallet Balance & Deposit Quick Action */}
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl w-full md:w-auto justify-between md:justify-start">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Số dư ví khả dụng</div>
            <div className="text-2xl font-black text-emerald-700">
              {(currentUser?.walletBalance || 0).toLocaleString('vi-VN')} đ
            </div>
            {Number(currentUser?.bonusWalletBalance) > 0 && (
              <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1.5 mt-0.5">
                <span>Ví KM: +{Number(currentUser.bonusWalletBalance).toLocaleString('vi-VN')} đ</span>
                {currentUser.bonusExpiresAt && (
                  <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-normal">
                    Hạn: {new Date(currentUser.bonusExpiresAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setActiveModal('wallet-deposit')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>Nạp Thêm Tiền</span>
          </button>
        </div>
      </div>

      {/* Membership & Vouchers Status Banner */}
      <div className={`rounded-3xl p-5 sm:p-6 text-white shadow-xl border ${
        isMemberExpired
          ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/70 border-rose-800/80'
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shrink-0 ${
              isMemberExpired
                ? 'bg-rose-500 text-white'
                : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950'
            }`}>
              <i className={isMemberExpired ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-crown"}></i>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gói Hội Viên</span>
                {isMemberActive ? (
                  <>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${currentUser.membership.badgeColor || 'bg-amber-400 text-slate-950'}`}>
                      {currentUser.membership.packageName}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentUser.membership.isAutoRenew === true 
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/60' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <i className="fa-solid fa-arrows-rotate text-[8px]"></i>
                      <span>{currentUser.membership.isAutoRenew === true ? 'Tự động gia hạn: BẬT' : 'Tự động gia hạn: TẮT'}</span>
                    </span>
                  </>
                ) : isMemberExpired ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Gói đã hết hạn ({currentUser.membership.packageName})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      Voucher đã hết hiệu lực
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                    Chưa đăng ký
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5">
                {isMemberActive ? (
                  <span className="text-slate-300">
                    Hạn dùng gói: <b className="text-amber-300 font-mono">{new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}</b>
                    {currentUser.membership.durationDays ? ` (${currentUser.membership.durationDays} ngày)` : ''} • Voucher cấp mới định kỳ 30 ngày
                    {currentUser.membership.nextVoucherRefreshAt && new Date(currentUser.membership.nextVoucherRefreshAt).getTime() < new Date(currentUser.membership.expiresAt).getTime() && (
                      <span className="text-teal-300 ml-1.5 font-medium">
                        • Đợt cấp mới tiếp theo: <b className="text-teal-200 font-mono">{new Date(currentUser.membership.nextVoucherRefreshAt).toLocaleDateString('vi-VN')}</b>
                      </span>
                    )}
                  </span>
                ) : isMemberExpired ? (
                  <span className="text-rose-300">
                    Đã hết hạn vào ngày: <b className="text-white font-mono">{new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}</b> • Toàn bộ voucher chưa dùng đã hết hạn theo quy chế sàn.
                  </span>
                ) : (
                  <span className="text-slate-300">Đăng ký Gói Hội Viên để nhận kho voucher giảm 35k đăng tin và 10k đẩy tin, tiết kiệm tới 39%!</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isMemberActive ? (
              <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
                <div className="px-2.5 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tin Thường (-35k)</div>
                  <div className="text-sm font-black text-emerald-400 font-mono">{currentUser.vouchers?.normalPublish || 0}</div>
                </div>
                <div className="px-2.5 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Đẩy Tin (-10k)</div>
                  <div className="text-sm font-black text-amber-400 font-mono">{currentUser.vouchers?.normalBump || 0}</div>
                </div>
                <div className="px-2.5 py-1 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tin VIP (-400k)</div>
                  <div className="text-sm font-black text-red-400 font-mono">{currentUser.vouchers?.vipPublish || 0}</div>
                </div>
              </div>
            ) : isMemberExpired ? (
              <div className="flex items-center gap-2 bg-rose-950/60 p-2 rounded-xl border border-rose-800/60 text-xs">
                <div className="px-2.5 py-1 text-center border-r border-rose-900/60">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Tin Thường</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
                <div className="px-2.5 py-1 text-center border-r border-rose-900/60">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Đẩy Tin</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
                <div className="px-2.5 py-1 text-center">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Tin VIP</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
              </div>
            ) : null}

            <Link
              to="/goi-hoi-vien"
              className={`px-4 py-2 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 shrink-0 ${
                isMemberExpired
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <span>{isMemberExpired ? 'Gia Hạn Gói Ngay' : currentUser?.membership ? 'Quản Lý Gói Hội Viên' : 'Đăng Ký Gói Hội Viên'}</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Tổng tin đã đăng</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{myListings.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Đang hoạt động: {activeCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Tin chờ duyệt</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Admin duyệt trong 15p</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Lượt xem tiếp cận</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{totalViews.toLocaleString('vi-VN')}</div>
          <div className="text-[11px] text-blue-500 font-medium mt-1">+18% so với tuần trước</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Khách gọi & Zalo</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{totalCalls}</div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">Cuộc gọi trực tiếp</div>
        </div>
      </div>

      {/* Navigation Tabs (Listings, Wallet, Transactions, Trash) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'listings' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-list"></i>
          Quản Lý Tin Đăng ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-receipt"></i>
          Lịch Sử Giao Dịch Ví ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('trash')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'trash' ? 'bg-rose-800 text-white shadow' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'}`}
        >
          <i className="fa-solid fa-trash-can"></i>
          <span>Thùng Rác ({trashListings.length})</span>
        </button>

        <button
          onClick={() => setActiveModal('post-listing')}
          className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
        >
          <i className="fa-solid fa-plus-circle"></i>
          <span>Đăng Tin Mới Ngay</span>
        </button>
      </div>

      {/* TAB 1: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Subfilter: Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold">Lọc trạng thái:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Tất cả ({myListings.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Đang hiển thị ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('expiring_soon')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${statusFilter === 'expiring_soon' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'}`}
            >
              <i className="fa-solid fa-clock text-[10px]"></i>
              <span>Sắp hết hạn ({expiringCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${statusFilter === 'expired' ? 'bg-rose-600 text-white font-extrabold shadow-sm' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'}`}
            >
              <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
              <span>Đã hết hạn ({expiredCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${statusFilter === 'pending' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Chờ duyệt ({pendingCount})
            </button>
          </div>

          {/* Listings Table / Cards */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <i className="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
              <h4 className="text-sm font-bold text-slate-700">Chưa có tin đăng nào</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">Bạn chưa đăng tin bất động sản nào trong mục này.</p>
              <button
                onClick={() => setActiveModal('post-listing')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Đăng tin đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map(prop => {
                const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
                const pkg = activeVipPackages.find(p => p.id === prop.vipPackageId) || defaultPkg;
                const expInfo = getPropertyExpirationInfo ? getPropertyExpirationInfo(prop) : null;
                const isItemExpired = Boolean(expInfo?.isExpired) || prop.status === 'expired';
                const isItemExpiringSoon = Boolean(expInfo?.isExpiringSoon) && !isItemExpired && prop.status === 'active';

                return (
                  <div
                    key={prop.id}
                    className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                      isItemExpired ? 'border-rose-300 bg-rose-50/20' : isItemExpiringSoon ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Property info */}
                    <div className="flex items-start gap-4">
                      <Link to={getPropertyPermalink(prop)} className="shrink-0 block relative">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'}
                          alt=""
                          className={`w-24 h-20 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition cursor-pointer ${isItemExpired ? 'grayscale contrast-125 opacity-75' : ''}`}
                        />
                        {isItemExpired && (
                          <div className="absolute inset-0 bg-slate-950/40 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase">
                            Hết Hạn
                          </div>
                        )}
                      </Link>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pkg.badgeColor}`}>
                            {pkg.shortName}
                          </span>
                          
                          {/* Expiration Status Badge */}
                          {isItemExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
                              🛑 Đã hết hạn ({expInfo?.daysAgo || 1} ngày trước)
                            </span>
                          ) : isItemExpiringSoon ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 animate-pulse flex items-center gap-1">
                              <i className="fa-solid fa-clock text-amber-600"></i>
                              ⚠️ Sắp hết hạn ({expInfo?.daysRemaining > 0 ? `Còn ${expInfo.daysRemaining}d ${expInfo.hoursRemaining}h` : `Còn ${expInfo.hoursRemaining}h`})
                            </span>
                          ) : prop.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ● Còn {expInfo?.daysRemaining || 15} ngày
                            </span>
                          ) : prop.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <i className="fa-solid fa-clock-rotate-left text-amber-600 animate-spin text-[9px]"></i>
                              <span>{expInfo?.badgeText || '⏳ Chờ duyệt (Hàng đợi FIFO)'}</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Đã hạ
                            </span>
                          )}

                          {prop.autoRenew && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200" title="Tự động gia hạn khi hết hạn">
                              <i className="fa-solid fa-arrows-rotate mr-0.5 text-[9px]"></i> Tự gia hạn
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-mono">
                            {prop.id}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          <Link 
                            to={getPropertyPermalink(prop)}
                            className="hover:underline hover:text-emerald-600 transition"
                          >
                            {prop.title}
                          </Link>
                        </h4>

                        <div className="text-xs font-black text-emerald-700 mt-1 flex items-center gap-3">
                          <span>{prop.priceDisplay}</span>
                          <span className="text-slate-400 font-normal">| {prop.area} m²</span>
                          <span className="text-slate-400 font-normal">| Lượt xem: <strong className="text-slate-700">{prop.viewsCount || 0}</strong></span>
                        </div>

                        {/* Thời gian đăng, Hạn hiển thị & Thời gian đã sửa tin */}
                        <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <i className="fa-regular fa-calendar-plus text-emerald-600"></i>
                            <span>Đăng: <b className="text-slate-700 font-mono">{new Date(prop.publishedAt || prop.createdAt || prop.submittedAt || Date.now()).toLocaleDateString('vi-VN')} {new Date(prop.publishedAt || prop.createdAt || prop.submittedAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b></span>
                          </span>

                          {prop.expiresAt && (
                            <span className={`flex items-center gap-1 ${isItemExpired ? 'text-rose-600 font-bold' : isItemExpiringSoon ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                              <i className="fa-regular fa-calendar-xmark"></i>
                              <span>Hạn: <b className="font-mono">{new Date(prop.expiresAt).toLocaleDateString('vi-VN')}</b></span>
                            </span>
                          )}

                          {prop.updatedAt && (
                            <span className="flex items-center gap-1 text-amber-700">
                              <i className="fa-regular fa-pen-to-square"></i>
                              <span>Đã sửa: <b className="font-mono">{new Date(prop.updatedAt).toLocaleDateString('vi-VN')} {new Date(prop.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b></span>
                            </span>
                          )}
                        </div>

                        {prop.status === 'pending' && (
                          <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 w-fit">
                            <i className="fa-solid fa-circle-info text-amber-600"></i>
                            <span>
                              {prop.vipPackageId === 'normal' || !prop.vipPackageId
                                ? 'Tin đang trong Hàng Đợi Tiêu Chuẩn FIFO. Hệ thống sẽ tự động xuất bản trong vòng 1 tiếng (hoặc BQT duyệt sớm).'
                                : 'Tin đang trong Hàng Đợi Ưu Tiên Sớm và sẽ tự động kích hoạt.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for this listing */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Gia Hạn Tin (Batdongsan Renewal) */}
                      <button
                        onClick={() => {
                          setRenewModalProp(prop);
                          setRenewDays(prop.listingDays || 15);
                          setRenewVipId(prop.vipPackageId || 'normal');
                          setRenewAutoRenew(Boolean(prop.autoRenew));
                        }}
                        className={`px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 ${
                          isItemExpired 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                            : isItemExpiringSoon 
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title="Gia hạn thời gian hiển thị bài viết"
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Gia Hạn</span>
                      </button>

                      {/* Bump button */}
                      {(() => {
                        const hasBumpVoucher = (currentUser?.vouchers?.normalBump || 0) > 0;
                        const isDiamond = prop.vipPackageId === 'vip-diamond';

                        return (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => bumpListing(prop.id, hasBumpVoucher)}
                              className={`px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 ${
                                hasBumpVoucher 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                              }`}
                              title={hasBumpVoucher ? 'Đẩy tin dùng Voucher (0 đ)' : 'Đẩy tin lên đầu trang (Phí 10.000 đ)'}
                            >
                              <i className="fa-solid fa-arrow-up"></i>
                              <span>{hasBumpVoucher ? 'Đẩy tin (0đ • Voucher)' : 'Đẩy tin (10k)'}</span>
                            </button>
                            {isDiamond && (
                              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-200" title="VIP Kim Cương: Tự động đẩy MIỄN PHÍ luôn tin thường liên kết">
                                +Đẩy kèm
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Upgrade VIP button */}
                      <button
                        onClick={() => {
                          setSelectedPropertyForVip(prop);
                          setActiveModal('pricing-vip');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                      >
                        <i className="fa-solid fa-crown"></i>
                        <span>Nâng VIP</span>
                      </button>

                      {/* View preview */}
                      <Link
                        to={getPropertyPermalink(prop)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition"
                        title="Xem chi tiết tin"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn chuyển tin "${prop.title || prop.id}" vào thùng rác? (Có thể khôi phục lại sau)`)) {
                            deleteProperty(prop.id);
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs transition"
                        title="Chuyển vào thùng rác"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Lịch Sử Biến Động Số Dư
            </h3>
            <button
              onClick={() => setActiveModal('wallet-deposit')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <i className="fa-solid fa-plus-circle"></i> Nạp thêm tiền
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Mã GD</th>
                  <th className="p-3">Loại giao dịch</th>
                  <th className="p-3">Mô tả chi tiết</th>
                  <th className="p-3">Phương thức</th>
                  <th className="p-3 text-right">Số tiền (VND)</th>
                  <th className="p-3 text-right">Số dư sau GD</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{txn.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        txn.type === 'deposit' ? 'bg-emerald-100 text-emerald-800' :
                        txn.type === 'purchase_vip' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {txn.type === 'deposit' ? 'Nạp tiền ví' : txn.type === 'purchase_vip' ? 'Mua gói VIP' : 'Đẩy tin'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{txn.title}</td>
                    <td className="p-3 text-slate-500">{txn.paymentMethod}</td>
                    <td className={`p-3 text-right font-black ${txn.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? `+${txn.amount.toLocaleString('vi-VN')} đ` : `${txn.amount.toLocaleString('vi-VN')} đ`}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-700">
                      {txn.balanceAfter.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRASH MANAGEMENT (THÙNG RÁC TIN ĐĂNG) */}
      {activeTab === 'trash' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0 shadow-inner">
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Thùng Rác Tin Đăng ({trashListings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Các tin rao đã xóa tạm thời được lưu giữ tại đây. Bạn có thể Khôi phục để hiển thị lại hoặc Xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {trashListings.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn dọn sạch toàn bộ ${trashListings.length} tin trong Thùng rác? Hành động này sẽ xóa vĩnh viễn và không thể khôi phục!`)) {
                      emptyTrash();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <i className="fa-solid fa-dumpster-fire"></i>
                  <span>Dọn Sạch Thùng Rác</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <span>Quay lại Quản lý tin</span>
              </button>
            </div>
          </div>

          {trashListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-2xl mx-auto">
                <i className="fa-solid fa-trash-can-arrow-up"></i>
              </div>
              <h4 className="text-sm font-bold text-slate-800">Thùng rác hiện đang trống</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Không có bài viết nào trong thùng rác. Khi bạn nhấn biểu tượng thùng rác ở danh sách tin đăng, bài viết sẽ được chuyển vào đây để bạn có thể xem lại hoặc khôi phục bất cứ lúc nào.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer mt-2"
              >
                <i className="fa-solid fa-list"></i>
                <span>Xem danh sách tin đang quản lý</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trashListings.map(prop => {
                const pkg = activeVipPackages.find(p => p.id === prop.vipPackageId) || activeVipPackages[activeVipPackages.length - 1];
                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl p-4 border border-rose-200/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-rose-300"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <img
                        src={(prop.images && prop.images[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80'}
                        alt={prop.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 grayscale opacity-80"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <i className="fa-solid fa-trash-can text-[9px]"></i>
                            <span>Trong thùng rác</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{prop.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pkg?.badgeBg || 'bg-slate-100'} ${pkg?.badgeColor || 'text-slate-700'}`}>
                            {pkg?.name}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-700 line-clamp-1 line-through decoration-slate-400">
                          {prop.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="font-bold text-slate-600">{prop.price}</span>
                          <span>|</span>
                          <span>{prop.area} m²</span>
                          <span>|</span>
                          <span className="text-[11px] text-slate-400">
                            {prop.deletedAt ? `Đã xóa lúc: ${new Date(prop.deletedAt).toLocaleString('vi-VN')}` : 'Đã chuyển vào thùng rác'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => restoreProperty(prop.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Khôi phục tin này về trạng thái hoạt động"
                      >
                        <i className="fa-solid fa-rotate-left"></i>
                        <span>Khôi phục tin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa VĨNH VIỄN bài đăng "${prop.title || prop.id}" khỏi hệ thống? Hành động này không thể hoàn tác!`)) {
                            permanentDeleteProperty(prop.id);
                          }
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                        title="Xóa vĩnh viễn không thể khôi phục"
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Xóa vĩnh viễn</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL GIA HẠN TIN ĐĂNG (BATDONGSAN STANDARD RENEWAL MODAL) */}
      {renewModalProp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <i className="fa-solid fa-arrows-rotate"></i>
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Gia Hạn Hiển Thị Tin Đăng</h3>
                  <p className="text-[11px] text-slate-300">Quy chế gia hạn thời gian hiển thị tin đăng</p>
                </div>
              </div>
              <button
                onClick={() => setRenewModalProp(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Property summary info */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
              <img
                src={renewModalProp.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80'}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-bold">{renewModalProp.id}</span>
                  {(() => {
                    const exp = getPropertyExpirationInfo ? getPropertyExpirationInfo(renewModalProp) : null;
                    if (exp?.isExpired || renewModalProp.status === 'expired') {
                      return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Đã hết hạn ({exp?.daysAgo || 1} ngày trước)</span>;
                    }
                    if (exp?.isExpiringSoon) {
                      return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">Sắp hết hạn ({exp?.countdownText})</span>;
                    }
                    return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Còn {exp?.daysRemaining || 15} ngày</span>;
                  })()}
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate">{renewModalProp.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hạn hiện tại: <b className="font-mono">{renewModalProp.expiresAt ? new Date(renewModalProp.expiresAt).toLocaleDateString('vi-VN') : 'Chưa kích hoạt'}</b>
                </p>
              </div>
            </div>

            {/* Form Controls */}
            <div className="p-5 space-y-4 text-xs">
              {/* 1. Duration Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  1. Chọn thời gian gia hạn thêm:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 10, 15, 30, 60, 90].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRenewDays(days)}
                      className={`py-2 px-3 rounded-xl border text-center transition ${
                        renewDays === days 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-sm ring-2 ring-emerald-500/30' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="text-sm font-extrabold">{days} ngày</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {days >= 60 ? 'Giảm 30%' : days >= 30 ? 'Giảm 25%' : 'Tiêu chuẩn'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. VIP Package Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  2. Chọn gói hiển thị (Loại tin):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeVipPackages.map(pkg => {
                    const activeRates = pkg.rates || { 15: pkg.pricePerDay || 5000 };
                    const currentDaily = activeRates[renewDays] || activeRates[15] || pkg.pricePerDay || 5000;
                    const isSelected = renewVipId === pkg.id;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setRenewVipId(pkg.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition ${
                          isSelected 
                            ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/30' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${pkg.badgeColor}`}>
                            {pkg.shortName}
                          </span>
                          {isSelected && <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>}
                        </div>
                        <div className="font-bold text-slate-800 text-xs">{pkg.name}</div>
                        <div className="text-[11px] text-emerald-700 font-bold mt-1">
                          {currentDaily.toLocaleString('vi-VN')} đ/ngày
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Auto Renew Checkbox */}
              <div 
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer select-none" 
                onClick={() => setRenewAutoRenew(!renewAutoRenew)}
              >
                <input
                  type="checkbox"
                  checked={renewAutoRenew}
                  onChange={(e) => setRenewAutoRenew(e.target.checked)}
                  className="mt-0.5 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-900">Bật tự động gia hạn khi hết hạn (Auto-Renew)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hệ thống sẽ tự động trừ ví tài khoản và gia hạn tiếp {renewDays} ngày mỗi khi tin chạm mốc hết hạn, tránh bị gián đoạn tiếp cận khách mua.
                  </p>
                </div>
              </div>

              {/* 4. Calculation Breakdown */}
              {(() => {
                const selectedPkg = activeVipPackages.find(p => p.id === renewVipId) || activeVipPackages[activeVipPackages.length - 1];
                const activeRates = selectedPkg.rates || { 15: selectedPkg.pricePerDay || 5000 };
                const dailyRate = activeRates[renewDays] || activeRates[15] || selectedPkg.pricePerDay || 5000;
                const totalCost = dailyRate * renewDays;
                const userWallet = currentUser?.walletBalance || 0;
                const isInsufficient = userWallet < totalCost;

                const now = Date.now();
                const currentExp = renewModalProp.expiresAt ? new Date(renewModalProp.expiresAt).getTime() : 0;
                const isCurrentlyExpired = renewModalProp.status === 'expired' || currentExp <= now;
                const newExpDate = isCurrentlyExpired 
                  ? new Date(now + renewDays * 86400 * 1000) 
                  : new Date(currentExp + renewDays * 86400 * 1000);

                return (
                  <div className="space-y-3 pt-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Hạn mới sau gia hạn:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {newExpDate.toLocaleDateString('vi-VN')} ({isCurrentlyExpired ? 'Tính từ hôm nay' : `+${renewDays} ngày`})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Thời gian & Đơn giá:</span>
                        <span>{renewDays} ngày × {dailyRate.toLocaleString('vi-VN')} đ/ngày</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Số dư ví hiện có:</span>
                        <span className="font-bold text-slate-800">{userWallet.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="border-t border-emerald-200/80 pt-2 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs uppercase">Tổng thanh toán:</span>
                        <span className="text-lg font-black text-emerald-700">
                          {totalCost.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    {isInsufficient && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-triangle-exclamation text-rose-500"></i>
                          <span>Số dư ví không đủ (thiếu {(totalCost - userWallet).toLocaleString('vi-VN')} đ)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRenewModalProp(null);
                            setActiveModal('wallet-deposit');
                          }}
                          className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 transition shrink-0"
                        >
                          Nạp Tiền Ví
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRenewModalProp(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        disabled={isInsufficient}
                        onClick={() => {
                          const success = renewProperty({
                            propertyId: renewModalProp.id,
                            extendDays: renewDays,
                            newVipPackageId: renewVipId,
                            autoRenew: renewAutoRenew,
                            isFreeAdmin: false
                          });
                          if (success) {
                            setRenewModalProp(null);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold transition shadow-md flex items-center gap-2 ${
                          isInsufficient 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Xác Nhận Gia Hạn ({totalCost.toLocaleString('vi-VN')} đ)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
