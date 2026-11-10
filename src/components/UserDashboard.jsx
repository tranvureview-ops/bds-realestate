'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { VIP_PACKAGES, PROPERTY_TYPES } from '../data/mockData';
import { VIETNAM_ADMINISTRATIVE_DATA as LOCATIONS } from '../data/vietnamAdministrativeData';
import { getPropertyPermalink, formatSentenceCase } from '../utils/permalink';
import { isVoucherDiscountFree } from '../utils/membershipHelper';
import PropertyVerificationModal from './PropertyVerificationModal';
import PropertyVerificationReviewModal from './PropertyVerificationReviewModal';
import PostListingModal from './PostListingModal';
import SeoImage from './SeoImage';
import { 
  calculateTreasureHuntExpiry, 
  isPropertyTreasureActive, 
  getTreasureExpirationInfo 
} from '../services/treasureHuntService';

export default function UserDashboard({ initialTab = 'listings' }) {
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
    publishPropertyNow,
    verifyProperty,
    submitPropertyVerification,
    getPropertyExpirationInfo,
    updateProperty,
    isMembershipActive,
    vipPackages: contextVipPackages,
    membershipPackages = [],
    bumpServicePrice,
    BUMP_SERVICE_PRICE,
    checkDailyFreeListingQuota
  } = useRealEstate();

  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'trash') return 'trash';
      if (tabParam === 'listings') return 'listings';
    }
    return initialTab === 'trash' ? 'trash' : 'listings';
  }); // 'listings', 'trash'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'expiring_soon', 'expired', 'pending'

  // Verification Modal State
  const [verifyingProperty, setVerifyingProperty] = useState(null);
  const [reviewingDocProperty, setReviewingDocProperty] = useState(null);

  // Renewal Modal State
  const [renewModalProp, setRenewModalProp] = useState(null);
  const [renewDays, setRenewDays] = useState(15);
  const [renewVipId, setRenewVipId] = useState('normal');
  const [renewAutoRenew, setRenewAutoRenew] = useState(false);
  const [renewAppliedVoucher, setRenewAppliedVoucher] = useState(null);

  // Bump confirmation modal state
  const [bumpConfirmData, setBumpConfirmData] = useState(null);

  // Pagination State (10 tin mỗi trang)
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [trashCurrentPage, setTrashCurrentPage] = useState(1);

  // Edit Listing Modal State (Sử dụng đồng bộ 100% với PostListingModal)
  const [editingProperty, setEditingProperty] = useState(null);

  // Tự động về trang 1 khi đổi bộ lọc hoặc chuyển tab
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, activeTab]);

  useEffect(() => {
    setTrashCurrentPage(1);
  }, [activeTab]);

  const handleOpenRenewModal = (prop) => {
    setRenewModalProp(prop);
    const targetVip = prop.vipPackageId || 'normal';
    setRenewVipId(targetVip);
    setRenewAutoRenew(Boolean(prop.autoRenew));
    if (targetVip === 'normal') {
      const normalPkgObj = (activeVipPackages || []).find(p => p.id === 'normal');
      const normalAllowed = Array.isArray(normalPkgObj?.allowedDurations) && normalPkgObj.allowedDurations.length > 0
        ? normalPkgObj.allowedDurations
        : [60];
      const defaultDays = normalAllowed.includes(60) ? 60 : normalAllowed[0];
      setRenewDays(defaultDays);
      const quota = checkDailyFreeListingQuota ? checkDailyFreeListingQuota(currentUser) : { allowed: true };
      if (!quota.allowed && isMemberActive && (currentUser?.vouchers?.normalPublish || 0) > 0) {
        setRenewAppliedVoucher('normalPublish');
      } else {
        setRenewAppliedVoucher(null);
      }
    } else {
      const validVipDays = [5, 7, 10, 15, 30];
      const initialDays = validVipDays.includes(Number(prop.listingDays)) ? Number(prop.listingDays) : 15;
      setRenewDays(initialDays);
      if (isMemberActive && (currentUser?.vouchers?.vipPublish || 0) > 0) {
        setRenewAppliedVoucher('vipPublish');
      } else {
        setRenewAppliedVoucher(null);
      }
    }
  };

  const activeVipPackages = (contextVipPackages && contextVipPackages.length > 0) ? contextVipPackages : VIP_PACKAGES;

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const isMemberExpired = Boolean(currentUser?.membership && !isMemberActive);

  // Lấy đơn giá giảm trừ voucher từ gói đang dùng hoặc cấu hình chung 3 gói
  const activePackage = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId) || membershipPackages?.[0];
  const normalPkg = (activeVipPackages || []).find(p => p.id === 'normal');
  const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 0));
  const commonPublishDiscount = (activePackage?.vouchersPerCycle?.normalPublishDiscount && activePackage?.vouchersPerCycle?.normalPublishDiscount !== 35000)
    ? Number(activePackage.vouchersPerCycle.normalPublishDiscount)
    : defaultNormalPrice;
  const commonBumpDiscount = activePackage?.vouchersPerCycle?.normalBumpDiscount ?? 400;
  const commonVipDiscount = (membershipPackages || []).find(p => Number(p.vouchersPerCycle?.vipDiscount || 0) > 0)?.vouchersPerCycle?.vipDiscount 
    ?? (activePackage?.vouchersPerCycle?.vipDiscount || 50000);

  const pricingOptions = { vipPackages: activeVipPackages, bumpServicePrice };
  const isPubFree = isVoucherDiscountFree('normalPublish', commonPublishDiscount, pricingOptions);
  const isBumpFree = isVoucherDiscountFree('normalBump', commonBumpDiscount, pricingOptions);

  const formatDiscountK = (val) => {
    const num = Number(val) || 0;
    if (num <= 0) return '';
    if (num >= 1000) {
      const k = num / 1000;
      return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return `${num}đ`;
  };

  // Helper kiểm tra quyền sở hữu tin đăng đồng bộ theo ID hoặc SĐT
  const isPropertyOwner = (p) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (isGuest) {
      return p.author && (String(p.author.id).startsWith('guest') || p.author.id === 'guest');
    }
    const cleanPhone = (phone) => (phone || '').replace(/\D/g, '');
    const pPhone = cleanPhone(p.author?.phone || p.contactPhone);
    const uPhone = cleanPhone(currentUser?.phone);
    return Boolean(
      (p.author?.id && String(p.author.id) === String(currentUser?.id)) ||
      (p.userId && String(p.userId) === String(currentUser?.id)) ||
      (uPhone && pPhone && uPhone.length >= 9 && uPhone === pPhone)
    );
  };

  // Listings authored by currentUser (hoặc toàn bộ nếu là Admin)
  const myListings = properties.filter(p => {
    // Bỏ qua tin đã nằm trong thùng rác hoặc đã xóa
    if (p.isDeleted || p.status === 'trash') return false;
    return isPropertyOwner(p);
  });

  // Các tin rao đã chuyển vào Thùng rác (Trash)
  const trashListings = properties.filter(p => {
    if (!p.isDeleted && p.status !== 'trash') return false;
    return isPropertyOwner(p);
  });

  // Cấu hình đặc quyền Săn Kho Báu dành cho người mua Gói Hội Viên hoặc Quản Trị Viên (Admin)
  const isAdmin = currentUser?.role === 'admin';
  const userPackage = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
  const isTreasureHuntAllowed = isAdmin || Boolean(isMemberActive && (userPackage?.allowTreasureHunt !== false));
  const maxTreasureArticles = isAdmin 
    ? Infinity 
    : (isTreasureHuntAllowed ? Number(userPackage?.treasureHuntMaxArticles !== undefined ? userPackage.treasureHuntMaxArticles : 5) : 0);
  const currentTreasureArticles = myListings.filter(p => isPropertyTreasureActive(p, currentUser));
  const currentTreasureCount = currentTreasureArticles.length;

  const handleToggleTreasureHunt = (prop) => {
    const isCurrentlyActive = isPropertyTreasureActive(prop, currentUser);

    if (!isCurrentlyActive) {
      const propExpInfo = getPropertyExpirationInfo ? getPropertyExpirationInfo(prop) : null;
      const isPropExpired = Boolean(propExpInfo?.isExpired) || prop.status === 'expired';

      if (isPropExpired) {
        showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi Gán nổi bật.', 'warning');
        handleOpenRenewModal(prop);
        return;
      }

      if (!isTreasureHuntAllowed) {
        showToast('Đặc quyền Gán nổi bật bài viết dành riêng cho thành viên mua Gói Hội Viên! Vui lòng nâng cấp gói để mở khóa.', 'warning');
        navigate('/goi-hoi-vien');
        return;
      }

      if (!isAdmin && currentTreasureCount >= maxTreasureArticles) {
        showToast(`Gói hội viên của bạn chỉ cho phép tối đa ${maxTreasureArticles} bài viết gán nổi bật cùng lúc (Hiện đang có ${currentTreasureCount}/${maxTreasureArticles} bài). Vui lòng đợi các bài viết đang nổi bật hết hạn 15 ngày!`, 'warning');
        return;
      }

      // Tính hạn 15 ngày kể từ ngày gán
      const { activatedAt, expiresAt } = calculateTreasureHuntExpiry(currentUser);
      const expInfo = getTreasureExpirationInfo({
        ...prop,
        isTreasureHuntActive: true,
        treasureHuntActivatedAt: activatedAt,
        treasureHuntExpiresAt: expiresAt
      });

      updateProperty(prop.id, { 
        isTreasureHuntActive: true,
        treasureHuntActivatedAt: activatedAt,
        treasureHuntExpiresAt: expiresAt
      });

      showToast(`Đã gán nổi bật bài viết "${prop.title}" thành công! Thời hạn hiển thị cố định trong ${expInfo.daysRemaining} ngày (đến ngày ${expInfo.formattedExpiryDate}) và không thể tự ý thay đổi theo quy định.`, 'success');
    } else {
      // Khi người dùng đã gán nổi bật: KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI TRONG THỜI HẠN 15 NGÀY
      if (!isAdmin) {
        const expInfo = getTreasureExpirationInfo(prop);
        showToast(`Bài viết đã được gán nổi bật cố định 15 ngày (đến ngày ${expInfo.formattedExpiryDate}). Kể cả khi gói hội viên hết hạn trước, bài viết vẫn tiếp tục hiển thị rương quà đến khi đủ 15 ngày theo quy định!`, 'warning');
        return;
      }

      // Quản trị viên (Admin) có toàn quyền gỡ bỏ hoặc thay đổi
      updateProperty(prop.id, { 
        isTreasureHuntActive: false,
        treasureHuntExpiresAt: null
      });
      showToast(`[Admin] Đã gỡ nổi bật bài viết "${prop.title}".`, 'info');
    }
  };

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

  const filteredListings = useMemo(() => {
    const list = myListings.filter(p => {
      if (statusFilter === 'all') return true;
      const info = getPropertyExpirationInfo ? getPropertyExpirationInfo(p) : null;
      if (statusFilter === 'active') return p.status === 'active' && !info?.isExpired;
      if (statusFilter === 'pending') return p.status === 'pending';
      if (statusFilter === 'expiring_soon') return Boolean(info?.isExpiringSoon) && p.status === 'active';
      if (statusFilter === 'expired') return Boolean(info?.isExpired) || p.status === 'expired';
      return p.status === statusFilter;
    });

    // Sắp xếp ưu tiên: Tin vừa được đẩy (bumpedAt) hoặc đăng mới (publishedAt) sẽ hiển thị lên đầu
    return list.sort((a, b) => {
      const timeA = new Date(a.bumpedAt || a.publishedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.bumpedAt || b.publishedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [myListings, statusFilter, getPropertyExpirationInfo]);

  // Tính toán phân trang cho danh sách tin đăng
  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedListings = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredListings.slice(start, start + PAGE_SIZE);
  }, [filteredListings, safePage, PAGE_SIZE]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('user-listings-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Tính toán phân trang cho thùng rác
  const trashTotalPages = Math.ceil(trashListings.length / PAGE_SIZE) || 1;
  const safeTrashPage = Math.min(Math.max(1, trashCurrentPage), trashTotalPages);
  const paginatedTrashListings = useMemo(() => {
    const start = (safeTrashPage - 1) * PAGE_SIZE;
    return trashListings.slice(start, start + PAGE_SIZE);
  }, [trashListings, safeTrashPage, PAGE_SIZE]);

  const handleTrashPageChange = (newPage) => {
    setTrashCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('user-trash-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
            {Number(currentUser?.bonusWalletBalance) > 0 && (() => {
              const earliest = currentUser?.earliestExpiringBonus || (currentUser?.bonusExpiresAt ? {
                amount: currentUser.bonusWalletBalance,
                formattedDate: new Date(currentUser.bonusExpiresAt).toLocaleDateString('vi-VN')
              } : null);
              return (
                <div className="mt-1 space-y-0.5">
                  <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-gift text-emerald-600"></i>
                    <span>Ví KM: +{Number(currentUser.bonusWalletBalance).toLocaleString('vi-VN')} đ</span>
                  </div>
                  {earliest && (
                    <div className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                      <i className="fa-solid fa-hourglass-half text-amber-600"></i>
                      <span>(Có {Number(earliest.amount || currentUser.bonusWalletBalance).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày {earliest.formattedDate})</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => setActiveModal('wallet-deposit')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Nạp Tiền</span>
            </button>
            <Link
              to="/lich-su-giao-dich"
              className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-receipt text-emerald-600"></i>
              <span>Lịch Sử GD</span>
            </Link>
          </div>
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
                  <span className="text-slate-300">
                    Đăng ký Gói Hội Viên để nhận kho voucher {isPubFree ? 'Đăng tin Miễn Phí' : `giảm ${formatDiscountK(commonPublishDiscount)} đăng tin`} và {isBumpFree ? 'Đẩy tin Miễn Phí' : `giảm ${formatDiscountK(commonBumpDiscount)} đẩy tin`}, tiết kiệm chi phí tối đa!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isMemberActive ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tin Thường {isPubFree ? '(Miễn Phí)' : `(-${formatDiscountK(commonPublishDiscount)})`}</div>
                  <div className="text-sm font-black text-emerald-400 font-mono">{currentUser.vouchers?.normalPublish || 0}</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Đẩy Tin {isBumpFree ? '(Miễn Phí)' : `(-${formatDiscountK(commonBumpDiscount)})`}</div>
                  <div className="text-sm font-black text-amber-400 font-mono">{currentUser.vouchers?.normalBump || 0}</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tin VIP (-{formatDiscountK(commonVipDiscount)})</div>
                  <div className="text-sm font-black text-red-400 font-mono">{currentUser.vouchers?.vipPublish || 0}</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center">
                  <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center justify-center gap-1">
                    <i className="fa-solid fa-gift text-[9px]"></i>
                    <span>Tin Nổi Bật</span>
                  </div>
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {isTreasureHuntAllowed ? `${currentTreasureCount}/${isAdmin ? '∞' : maxTreasureArticles}` : '—'}
                  </div>
                </div>
              </div>
            ) : isMemberExpired ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-950/60 p-2 rounded-xl border border-rose-800/60 text-xs">
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-rose-900/60">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Tin Thường</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-rose-900/60">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Đẩy Tin</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center border-r border-rose-900/60">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Tin VIP</div>
                  <div className="text-sm font-black text-rose-300 font-mono">0</div>
                </div>
                <div className="px-2 sm:px-2.5 py-1 text-center">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">Tin Nổi Bật</div>
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
        <div id="user-listings-container" className="space-y-4">
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

          {/* Banner Đặc Quyền Săn Kho Báu Cho Hội Viên */}
          {isTreasureHuntAllowed ? (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-2xl border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
                  <i className="fa-solid fa-gift"></i>
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
                    <span>Đặc Quyền Hội Viên: Gán Tin Nổi Bật Săn Kho Báu</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                      Đã chọn: {currentTreasureCount}/{maxTreasureArticles} bài
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Gói <strong>{userPackage?.name}</strong> cho phép bạn gán nổi bật tối đa <strong>{maxTreasureArticles} bài viết</strong> vào mục "Săn Kho Báu". Các bài viết này được ưu tiên hiển thị hàng đầu theo cấp độ VIP (Kim Cương ⟶ Vàng ⟶ Bạc ⟶ Tin Thường) để thu hút hàng nghìn khách tìm rương quà tặng mỗi ngày.
                  </p>
                </div>
              </div>
              <Link
                to="/trung-tam-phan-thuong/san-kho-bau-bds"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                <span>Xem Trang Săn Kho Báu</span>
              </Link>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-100/90 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                  <i className="fa-solid fa-gift"></i>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Muốn đưa tin rao vào mục Săn Kho Báu BĐS để tăng 300% tương tác tự nhiên?</span>
                  <p className="text-[11px] text-slate-500">Đăng ký Gói Hội Viên để mở khóa đặc quyền tự chọn bài viết gắn rương quà thưởng.</p>
                </div>
              </div>
              <Link
                to="/goi-hoi-vien"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 transition"
              >
                Khám Phá Gói Hội Viên &rarr;
              </Link>
            </div>
          )}

          {/* Listings Table / Cards */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <i className="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
              <h4 className="text-sm font-bold text-slate-700">Chưa có tin đăng nào</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">Bạn chưa đăng tin nhà đất nào trong mục này.</p>
              <button
                onClick={() => setActiveModal('post-listing')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Đăng tin đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedListings.map(prop => {
                const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
                const pkg = activeVipPackages.find(p => p.id === prop.vipPackageId) || defaultPkg;
                const expInfo = getPropertyExpirationInfo ? getPropertyExpirationInfo(prop) : null;
                const isItemExpired = Boolean(expInfo?.isExpired) || prop.status === 'expired';
                const isItemExpiringSoon = Boolean(expInfo?.isExpiringSoon) && !isItemExpired && prop.status === 'active';
                const isScheduled = Boolean(prop.isScheduledPublish || prop.scheduledPublishAt || prop.approvalType === 'scheduled_golden_hour');
                const treasureExpInfo = getTreasureExpirationInfo(prop);
                const isItemTreasureActive = isPropertyTreasureActive(prop, currentUser);

                return (
                  <div
                    key={prop.id}
                    className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                      isItemExpired ? 'border-rose-300 bg-rose-50/20' : isItemExpiringSoon ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Property info */}
                    <div className="flex items-start gap-4">
                      <Link to={getPropertyPermalink(prop)} target="_blank" rel="noopener noreferrer" className="shrink-0 block relative">
                        <SeoImage
                          src={prop.images?.[0]}
                          property={prop}
                          type="thumbnail"
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

                          {/* Trạng thái xác thực: Chỉ hiển thị khi Tin đã xác thực */}
                          {Boolean(prop.is_verified || prop.isVerified) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                              <i className="fa-solid fa-circle-check text-emerald-600"></i>
                              <span>Tin xác thực</span>
                            </span>
                          )}

                          {/* Huy hiệu Gán Nổi Bật (Có thời hạn 15 ngày) */}
                          {isItemTreasureActive && (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-600 flex items-center gap-1 shadow-xs animate-in zoom-in-95 duration-150" 
                              title={`Bài viết đang gán nổi bật cố định (Hạn hiển thị đến: ${treasureExpInfo.formattedExpiryDate})`}
                            >
                              <i className="fa-solid fa-star text-[9px]"></i>
                              <span>Nổi Bật</span>
                            </span>
                          )}
                          
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
                          ) : prop.status === 'active' ? null : prop.status === 'pending' ? (
                            isScheduled ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 shadow-sm">
                                <i className="fa-solid fa-clock text-purple-600"></i>
                                <span>⏰ Lịch hẹn: {(!prop.scheduleTime || prop.scheduleTime === 'now') ? 'Ngày hẹn' : prop.scheduleTime} {prop.autoApproveAt ? `(Dự kiến: ${new Date(prop.autoApproveAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${new Date(prop.autoApproveAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})` : ''}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                <i className="fa-solid fa-clock-rotate-left text-amber-600 animate-spin text-[9px]"></i>
                                <span>{expInfo?.badgeText || '⏳ Chờ duyệt (Hàng đợi FIFO)'}</span>
                              </span>
                            )
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

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 property-title-sentence">
                          <Link 
                            to={getPropertyPermalink(prop)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-emerald-600 transition"
                          >
                            {formatSentenceCase(prop.title)}
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

                          {prop.downgradedFromVip && !isItemExpired && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i className="fa-solid fa-gift text-teal-600"></i>
                              <span>+60 ngày Tin Thường (Hạ từ {prop.downgradedFromVip === 'vip-diamond' ? 'VIP Kim Cương' : prop.downgradedFromVip === 'vip-gold' ? 'VIP Vàng' : 'VIP Bạc'})</span>
                            </span>
                          )}

                          {['vip-diamond', 'vip-gold', 'vip-silver'].includes(prop.vipPackageId) && !isItemExpired && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i className="fa-solid fa-gift text-emerald-600"></i>
                              <span>Hết VIP sẽ chuyển Tin Thường +60 ngày</span>
                            </span>
                          )}

                          {prop.bumpedAt && (
                            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <i className="fa-solid fa-arrow-up text-amber-600"></i>
                              <span>Đã đẩy: <b className="font-mono">{new Date(prop.bumpedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(prop.bumpedAt).toLocaleDateString('vi-VN')}</b></span>
                            </span>
                          )}

                          {prop.updatedAt && (
                            <span className="flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full text-[10px]">
                              <i className="fa-regular fa-pen-to-square text-slate-500"></i>
                              <span>Đã sửa: <b className="font-mono">{new Date(prop.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(prop.updatedAt).toLocaleDateString('vi-VN')}</b></span>
                            </span>
                          )}
                        </div>

                        {prop.status === 'pending' && (
                          isScheduled ? (
                            <div className="mt-2 text-[11px] text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-2 w-fit flex-wrap">
                              <i className="fa-solid fa-calendar-check text-purple-600 text-sm shrink-0"></i>
                              <div>
                                <span className="font-bold">⏰ Đã hẹn giờ đăng Khung Giờ Vàng ({prop.scheduleTime || 'Giờ vàng'}):</span>{' '}
                                <span>
                                  Dự kiến tự động xuất bản lên trang chủ lúc{' '}
                                  <b className="font-mono text-purple-700">
                                    {prop.autoApproveAt ? new Date(prop.autoApproveAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : prop.scheduleTime}
                                  </b>
                                  . Thời hạn hiển thị ({prop.listingDays || 15} ngày) sẽ bắt đầu tính từ khi tin lên trang chủ.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 w-fit">
                              <i className="fa-solid fa-clock text-amber-600"></i>
                              <span>
                                {prop.autoApproveAt
                                  ? `Tin đang trong hàng đợi kiểm duyệt tự động (Dự kiến hoàn tất lúc ${new Date(prop.autoApproveAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}).`
                                  : (prop.vipPackageId === 'normal' || !prop.vipPackageId
                                      ? 'Tin đang trong Hàng Đợi Tiêu Chuẩn FIFO. Hệ thống sẽ tự động xuất bản trong vòng 5 - 15 phút (hoặc BQT duyệt sớm).'
                                      : 'Tin đang trong Hàng Đợi Ưu Tiên Sớm và sẽ tự động kích hoạt.')}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for this listing */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Nút Xác Thực Tin / Đang Duyệt Sổ Đỏ */}
                      {Boolean(prop.is_verified || prop.isVerified) ? null : isItemExpired ? (
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi gửi hồ sơ xác thực.', 'warning');
                            handleOpenRenewModal(prop);
                          }}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 cursor-pointer"
                          title="Tin đăng đã hết hạn hiển thị. Bắt buộc gia hạn tin trước khi xác thực"
                        >
                          <i className="fa-solid fa-circle-check text-slate-400"></i>
                          <span>Xác thực tin</span>
                        </button>
                      ) : (prop.verification_status === 'pending' || prop.verificationStatus === 'pending') ? (
                        <button
                          type="button"
                          onClick={() => setReviewingDocProperty(prop)}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 cursor-pointer"
                          title="Xem lại hồ sơ Sổ đỏ 2 mặt đã gửi Ban quản trị"
                        >
                          <i className="fa-solid fa-file-shield text-amber-600"></i>
                          <span>Đang duyệt sổ đỏ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setVerifyingProperty(prop)}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          title="Tải lên Sổ đỏ 2 mặt để yêu cầu Ban quản trị xác thực tin"
                        >
                          <i className="fa-solid fa-circle-check"></i>
                          <span>Xác thực tin</span>
                        </button>
                      )}

                      {/* Nút Xuất Bản Ngay nếu tin đang hẹn giờ Khung Giờ Vàng */}
                      {prop.status === 'pending' && isScheduled && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Bạn có muốn xuất bản tin "${prop.title}" lên trang chủ ngay lập tức mà không cần chờ đến ${prop.scheduleTime || 'giờ hẹn'} không?`)) {
                              await publishPropertyNow(prop.id);
                            }
                          }}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                          title="Đưa tin lên trang chủ ngay lập tức mà không cần chờ đến khung giờ vàng đã hẹn"
                        >
                          <i className="fa-solid fa-bolt text-amber-300"></i>
                          <span>Xuất Bản Ngay</span>
                        </button>
                      )}

                      {/* Gia Hạn Tin (Chỉ hiển thị khi tin đã hết hạn) */}
                      {isItemExpired && (
                        <button
                          onClick={() => handleOpenRenewModal(prop)}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white animate-pulse cursor-pointer"
                          title="Tin đăng đã hết hạn. Bấm để gia hạn thời gian hiển thị"
                        >
                          <i className="fa-solid fa-arrows-rotate"></i>
                          <span>Gia Hạn</span>
                        </button>
                      )}

                      {/* Bump button */}
                      {(() => {
                        const hasBumpVoucher = (currentUser?.vouchers?.normalBump || 0) > 0;
                        const isDiamond = prop.vipPackageId === 'vip-diamond';

                        if (isItemExpired) {
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi Đẩy tin.', 'warning');
                                handleOpenRenewModal(prop);
                              }}
                              className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 cursor-pointer"
                              title="Tin đăng đã hết hạn hiển thị. Bắt buộc gia hạn tin trước khi đẩy tin"
                            >
                              <i className="fa-solid fa-arrow-up text-slate-400"></i>
                              <span>{hasBumpVoucher ? 'Đẩy tin (0đ • Voucher)' : `Đẩy tin (${formatDiscountK(bumpServicePrice || BUMP_SERVICE_PRICE || 10000)})`}</span>
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setBumpConfirmData({ prop, hasBumpVoucher })}
                              className={`px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 cursor-pointer ${
                                hasBumpVoucher 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                              }`}
                              title={hasBumpVoucher ? 'Đẩy tin dùng Voucher (0 đ)' : `Đẩy tin lên đầu trang (Phí ${(bumpServicePrice || BUMP_SERVICE_PRICE || 10000).toLocaleString('vi-VN')} đ)`}
                            >
                              <i className="fa-solid fa-arrow-up"></i>
                              <span>{hasBumpVoucher ? 'Đẩy tin (0đ • Voucher)' : `Đẩy tin (${formatDiscountK(bumpServicePrice || BUMP_SERVICE_PRICE || 10000)})`}</span>
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
                      {isItemExpired ? (
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi Nâng VIP.', 'warning');
                            handleOpenRenewModal(prop);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 cursor-pointer"
                          title="Tin đăng đã hết hạn hiển thị. Bắt buộc gia hạn tin trước khi nâng VIP"
                        >
                          <i className="fa-solid fa-crown text-slate-400"></i>
                          <span>Nâng VIP</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPropertyForVip(prop);
                            navigate('/bang-gia-tin-dang');
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-crown"></i>
                          <span>Nâng VIP</span>
                        </button>
                      )}

                      {/* Nút Gán Nổi Bật (Dành cho người mua Gói Hội Viên & Admin) */}
                      {isItemTreasureActive ? (
                        isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleToggleTreasureHunt(prop)}
                            className="px-3 py-1.5 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 cursor-pointer"
                            title="[Admin] Bài viết đang gán nổi bật. Bấm để tắt/gỡ bỏ."
                          >
                            <i className="fa-solid fa-star text-[10px]"></i>
                            <span>Đang nổi bật ({treasureExpInfo.daysRemaining > 0 ? `Còn ${treasureExpInfo.daysRemaining} ngày` : 'Sắp hết hạn'})</span>
                            <i className="fa-solid fa-xmark text-[10px] opacity-70"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleTreasureHunt(prop)}
                            className="px-3 py-1.5 font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 bg-amber-500 text-slate-950 border border-amber-600 cursor-pointer hover:bg-amber-400 transition"
                            title={`Bài viết đang gán nổi bật cố định 15 ngày (đến ngày ${treasureExpInfo.formattedExpiryDate}). Kể cả khi gói hội viên hết hạn trước, bài viết vẫn tiếp tục hiển thị rương quà đến khi đủ 15 ngày.`}
                          >
                            <i className="fa-solid fa-lock text-[10px] opacity-80"></i>
                            <i className="fa-solid fa-star text-[10px]"></i>
                            <span>Đang nổi bật ({treasureExpInfo.daysRemaining > 0 ? `Còn ${treasureExpInfo.daysRemaining} ngày` : 'Sắp hết hạn'})</span>
                          </button>
                        )
                      ) : isItemExpired ? (
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi Gán nổi bật.', 'warning');
                            handleOpenRenewModal(prop);
                          }}
                          className="px-3 py-1.5 font-medium rounded-xl text-xs flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 cursor-pointer transition"
                          title="Tin đăng đã hết hạn. Vui lòng gia hạn tin trước khi gán nổi bật."
                        >
                          <i className="fa-solid fa-ban text-slate-400 text-[10px]"></i>
                          <span>Gán nổi bật</span>
                        </button>
                      ) : isTreasureHuntAllowed ? (
                        <button
                          type="button"
                          onClick={() => handleToggleTreasureHunt(prop)}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-500 cursor-pointer"
                          title={isAdmin ? 'Gán nổi bật bài viết này vào mục Săn Kho Báu BĐS (Đặc quyền Quản trị)' : `Gán nổi bật bài viết này cố định 15 ngày (Đã dùng: ${currentTreasureCount}/${maxTreasureArticles})`}
                        >
                          <i className="fa-solid fa-star text-amber-600 text-[10px]"></i>
                          <span>Gán nổi bật {isAdmin ? '' : `(${currentTreasureCount}/${maxTreasureArticles})`}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Đặc quyền Gán nổi bật bài viết dành riêng cho thành viên mua Gói Hội Viên! Vui lòng nâng cấp gói để mở khóa.', 'warning');
                            navigate('/goi-hoi-vien');
                          }}
                          className="px-3 py-1.5 font-medium rounded-xl text-xs transition flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 cursor-pointer"
                          title="Chỉ áp dụng cho tài khoản mua Gói Hội Viên"
                        >
                          <i className="fa-solid fa-lock text-slate-400 text-[10px]"></i>
                          <span>Gán nổi bật</span>
                        </button>
                      )}

                      {/* Chỉnh sửa bài viết */}
                      {isItemExpired ? (
                        <button
                          type="button"
                          onClick={() => {
                            showToast('Tin đăng này đã hết hạn hiển thị! Vui lòng Gia hạn tin trước khi Chỉnh sửa.', 'warning');
                            handleOpenRenewModal(prop);
                          }}
                          className="px-3 py-1.5 font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-200 cursor-pointer"
                          title="Tin đăng đã hết hạn hiển thị. Bắt buộc gia hạn tin trước khi chỉnh sửa"
                        >
                          <i className="fa-solid fa-lock text-slate-400 text-[10px]"></i>
                          <span>Chỉnh sửa</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingProperty(prop)}
                          className="px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                          title="Chỉnh sửa thông tin bài viết"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Chỉnh sửa</span>
                        </button>
                      )}

                      {/* View preview */}
                      <Link
                        to={getPropertyPermalink(prop)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition"
                        title="Xem chi tiết tin (mở tab mới)"
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

          {/* Phân trang danh sách tin đăng */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-200 bg-white p-4 rounded-2xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">
                Hiển thị <span className="font-bold text-slate-800">{(safePage - 1) * PAGE_SIZE + 1}</span> - <span className="font-bold text-slate-800">{Math.min(safePage * PAGE_SIZE, filteredListings.length)}</span> trên tổng số <span className="font-bold text-slate-800">{filteredListings.length}</span> tin đăng
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Về trang đầu"
                >
                  <i className="fa-solid fa-angles-left text-[10px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang trước"
                >
                  <i className="fa-solid fa-angle-left text-[11px]"></i>
                </button>

                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        type="button"
                        onClick={() => handlePageChange(1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(
                        <span key="dots-start" className="px-1 text-slate-400 text-xs">...</span>
                      );
                    }
                  }

                  for (let p = start; p <= end; p++) {
                    const isActive = p === safePage;
                    pages.push(
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(
                        <span key="dots-end" className="px-1 text-slate-400 text-xs">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang sau"
                >
                  <i className="fa-solid fa-angle-right text-[11px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang cuối"
                >
                  <i className="fa-solid fa-angles-right text-[10px]"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRASH MANAGEMENT (THÙNG RÁC TIN ĐĂNG) */}
      {activeTab === 'trash' && (
        <div id="user-trash-container" className="space-y-4">
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
              {paginatedTrashListings.map(prop => {
                const pkg = activeVipPackages.find(p => p.id === prop.vipPackageId) || activeVipPackages[activeVipPackages.length - 1];
                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl p-4 border border-rose-200/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-rose-300"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <SeoImage
                        src={prop.images?.[0]}
                        property={prop}
                        type="thumbnail"
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

          {/* Phân trang thùng rác */}
          {trashTotalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-rose-200 bg-white p-4 rounded-2xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">
                Hiển thị <span className="font-bold text-slate-800">{(safeTrashPage - 1) * PAGE_SIZE + 1}</span> - <span className="font-bold text-slate-800">{Math.min(safeTrashPage * PAGE_SIZE, trashListings.length)}</span> trên tổng số <span className="font-bold text-slate-800">{trashListings.length}</span> tin trong thùng rác
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => handleTrashPageChange(1)}
                  disabled={safeTrashPage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Về trang đầu"
                >
                  <i className="fa-solid fa-angles-left text-[10px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrashPageChange(safeTrashPage - 1)}
                  disabled={safeTrashPage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang trước"
                >
                  <i className="fa-solid fa-angle-left text-[11px]"></i>
                </button>

                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, safeTrashPage - Math.floor(maxVisible / 2));
                  let end = Math.min(trashTotalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  for (let p = start; p <= end; p++) {
                    const isActive = p === safeTrashPage;
                    pages.push(
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTrashPageChange(p)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  type="button"
                  onClick={() => handleTrashPageChange(safeTrashPage + 1)}
                  disabled={safeTrashPage === trashTotalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang sau"
                >
                  <i className="fa-solid fa-angle-right text-[11px]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrashPageChange(trashTotalPages)}
                  disabled={safeTrashPage === trashTotalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Trang cuối"
                >
                  <i className="fa-solid fa-angles-right text-[10px]"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL GIA HẠN TIN ĐĂNG (RENEWAL MODAL) */}
      {renewModalProp && (() => {
        const isNormal = renewVipId === 'normal';
        const dailyQuota = checkDailyFreeListingQuota 
          ? checkDailyFreeListingQuota(currentUser) 
          : { allowed: true, limit: 3, remaining: 3, count: 0 };
        const isFreeQuotaAvailable = dailyQuota.allowed; // Còn suất miễn phí (tối đa 3 tin/ngày)

        const selectedPkg = activeVipPackages.find(p => p.id === renewVipId) || activeVipPackages[activeVipPackages.length - 1];
        const activeRates = selectedPkg.rates || {};
        const dailyRate = isNormal ? 0 : (activeRates[renewDays] || activeRates[15] || selectedPkg.pricePerDay || 0);

        // Chi phí gốc: Tin Thường hết 3 tin miễn phí trong ngày thì 5.000 đ / 60 ngày
        const rawCost = isNormal ? (isFreeQuotaAvailable ? 0 : 5000) : (dailyRate * renewDays);

        const userPackageObj = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
        const vipDiscountVal = Number(userPackageObj?.vouchersPerCycle?.vipDiscount !== undefined ? userPackageObj.vouchersPerCycle.vipDiscount : (commonVipDiscount || 0));

        let discountAmount = 0;
        if (isNormal) {
          if (!isFreeQuotaAvailable && renewAppliedVoucher === 'normalPublish') {
            discountAmount = rawCost; // Giảm toàn bộ 5.000 đ
          }
        } else {
          if (isMemberActive && renewAppliedVoucher === 'vipPublish') {
            discountAmount = Math.min(rawCost, vipDiscountVal);
          }
        }

        const totalCost = Math.max(0, rawCost - discountAmount);
        const mainWallet = Number(currentUser?.walletBalance) || 0;
        const bonusWallet = Number(currentUser?.bonusWalletBalance) || 0;
        const totalAvailable = mainWallet + bonusWallet;
        const isInsufficient = totalAvailable < totalCost;

        const now = Date.now();
        const currentExp = renewModalProp.expiresAt ? new Date(renewModalProp.expiresAt).getTime() : 0;
        const isCurrentlyExpired = renewModalProp.status === 'expired' || currentExp <= now;
        const activeDays = renewDays;
        const newExpDate = isCurrentlyExpired 
          ? new Date(now + activeDays * 86400 * 1000) 
          : new Date(currentExp + activeDays * 86400 * 1000);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80">
              {/* 1. Modal Header (Sticky Top) */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                    <i className="fa-solid fa-arrows-rotate"></i>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold leading-tight">Gia Hạn Hiển Thị Tin Đăng</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-300">Gia hạn thời gian hiển thị tin rao trên sàn</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRenewModalProp(null)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs sm:text-sm transition cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* 2. Property Quick Summary */}
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2.5 shrink-0">
                <SeoImage
                  src={renewModalProp.images?.[0]}
                  property={renewModalProp}
                  type="thumbnail"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[9px] px-1.5 py-0.2 bg-slate-200 rounded text-slate-700 font-bold">{renewModalProp.id}</span>
                    {(() => {
                      const exp = getPropertyExpirationInfo ? getPropertyExpirationInfo(renewModalProp) : null;
                      if (exp?.isExpired || renewModalProp.status === 'expired') {
                        return <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200">Đã hết hạn ({exp?.daysAgo || 1} ngày trước)</span>;
                      }
                      if (exp?.isExpiringSoon) {
                        return <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-300">Sắp hết hạn ({exp?.countdownText})</span>;
                      }
                      return null;
                    })()}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{renewModalProp.title}</h4>
                  <div className="text-[10px] text-slate-500">
                    Hạn hiện tại: <b className="font-mono text-slate-700">{renewModalProp.expiresAt ? new Date(renewModalProp.expiresAt).toLocaleDateString('vi-VN') : 'Chưa kích hoạt'}</b>
                  </div>
                </div>
              </div>

              {/* 3. Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 space-y-3.5 overscroll-contain text-xs">
                {/* Mục 1: Chọn gói hiển thị (Loại tin) */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    1. Chọn gói hiển thị (Phân loại tin):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {activeVipPackages.map(pkg => {
                      const isPkgNormal = pkg.id === 'normal';
                      const displayDaily = isPkgNormal 
                        ? 0 
                        : (pkg.rates?.[renewDays] || pkg.rates?.[15] || pkg.pricePerDay || 0);
                      const isSelected = renewVipId === pkg.id;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setRenewVipId(pkg.id);
                            if (isPkgNormal) {
                              const normalAllowed = Array.isArray(pkg?.allowedDurations) && pkg.allowedDurations.length > 0
                                ? pkg.allowedDurations
                                : [60];
                              const defaultDays = normalAllowed.includes(60) ? 60 : normalAllowed[0];
                              setRenewDays(defaultDays);
                              if (!isFreeQuotaAvailable && isMemberActive && (currentUser?.vouchers?.normalPublish || 0) > 0) {
                                setRenewAppliedVoucher('normalPublish');
                              } else {
                                setRenewAppliedVoucher(null);
                              }
                            } else {
                              const validVipDays = [5, 7, 10, 15, 30];
                              if (!validVipDays.includes(renewDays)) {
                                setRenewDays(15);
                              }
                              if (isMemberActive && (currentUser?.vouchers?.vipPublish || 0) > 0) {
                                setRenewAppliedVoucher('vipPublish');
                              } else {
                                setRenewAppliedVoucher(null);
                              }
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${pkg.badgeColor}`}>
                              {pkg.shortName}
                            </span>
                            {isSelected && <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>}
                          </div>
                          <div className="font-bold text-slate-800 text-xs">{pkg.name}</div>
                          <div className="text-[11px] font-extrabold mt-0.5">
                            {isPkgNormal ? (
                              <span className="text-emerald-700">Miễn phí {dailyQuota.limit} tin/ngày</span>
                            ) : (
                              <span className="text-amber-700">{displayDaily.toLocaleString('vi-VN')} đ/ngày</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mục 2: Chọn thời gian gia hạn thêm */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                    2. Chọn thời gian gia hạn thêm:
                  </label>

                  {isNormal ? (
                    (() => {
                      const normalPkgObj = (activeVipPackages || []).find(p => p.id === 'normal');
                      const normalAllowed = Array.isArray(normalPkgObj?.allowedDurations) && normalPkgObj.allowedDurations.length > 0
                        ? normalPkgObj.allowedDurations
                        : [60];

                      return (
                        <div className="space-y-2">
                          {normalAllowed.length > 1 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {normalAllowed.map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setRenewDays(d)}
                                  className={`py-2 px-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                                    renewDays === d 
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-500/20' 
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="text-xs sm:text-sm font-black">{d} ngày</div>
                                  <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
                                    {isFreeQuotaAvailable ? 'Miễn phí' : (d === 60 ? '5.000 đ' : `${d * 500} đ`)}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {isFreeQuotaAvailable ? (
                            <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/70 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-sm">{renewDays} ngày</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                    Miễn Phí (Còn {dailyQuota.remaining}/{dailyQuota.limit} tin hôm nay)
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                  Miễn phí {dailyQuota.limit} tin thường/ngày (thời hạn {renewDays} ngày). Bạn đang được áp dụng 0 đ.
                                </p>
                              </div>
                              <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl border-2 border-amber-500 bg-amber-50/80 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-900 text-sm">{renewDays} ngày</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                                    Đã hết {dailyQuota.limit} tin miễn phí hôm nay (5.000 đ / {renewDays} ngày)
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-900">
                                  Bạn đã dùng hết {dailyQuota.limit} tin miễn phí trong ngày. Phí gia hạn là 5.000 đ cho {renewDays} ngày (hoặc dùng Voucher Hội Viên để miễn phí 0 đ).
                                </p>
                              </div>
                              <i className="fa-solid fa-clock text-amber-600 text-lg"></i>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    // Tin VIP: 5 mốc ngày chuẩn [5, 7, 10, 15, 30]
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { days: 5, note: 'Tối thiểu' },
                        { days: 7, note: 'Chuẩn VIP' },
                        { days: 10, note: 'Tiêu chuẩn' },
                        { days: 15, note: 'Phổ biến', highlight: true },
                        { days: 30, note: 'Giảm 25%', discount: true }
                      ].map(item => (
                        <button
                          key={item.days}
                          type="button"
                          onClick={() => setRenewDays(item.days)}
                          className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            renewDays === item.days 
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-black">{item.days}N</div>
                          <div className={`text-[8px] sm:text-[9px] mt-0.5 leading-tight ${
                            item.discount 
                              ? 'text-emerald-700 font-bold' 
                              : item.highlight 
                              ? 'text-amber-700 font-bold' 
                              : 'text-slate-400'
                          }`}>
                            {item.note}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Ghi chú đặc quyền tự động cộng 60 ngày miễn phí khi hết VIP */}
                  {!isNormal && (
                    <div className="mt-2 p-2 rounded-lg bg-blue-50/80 border border-blue-200/80 text-[10px] sm:text-[11px] text-blue-800 flex items-start gap-1.5">
                      <i className="fa-solid fa-circle-info text-blue-600 text-xs mt-0.5 shrink-0"></i>
                      <span>
                        <b>Quy chế VIP:</b> Hết {renewDays} ngày VIP, tin đăng sẽ <b>tự động hạ thành Tin Thường</b> và được <b>cộng thêm 60 ngày miễn phí</b> trên sàn!
                      </span>
                    </div>
                  )}
                </div>

                {/* Mục 3: Phân Hệ Voucher & Quyền Lợi Gói Hội Viên */}
                {isNormal ? (
                  isFreeQuotaAvailable ? null : (
                    // Đã hết tin miễn phí hôm nay: Hiển thị áp dụng voucher hội viên (5.000 đ -> 0 đ)
                    <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-3 sm:p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                            <i className="fa-solid fa-ticket"></i>
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            Áp Dụng Voucher Tin Thường Hội Viên
                          </span>
                        </div>
                        {isMemberActive && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                            {currentUser?.membership?.shortName || 'HỘI VIÊN CHÍNH THỨC'}
                          </span>
                        )}
                      </div>

                      {isMemberActive ? (
                        (() => {
                          const normalVouchers = currentUser?.vouchers?.normalPublish || 0;
                          const hasNormalVoucher = normalVouchers > 0;
                          const isVoucherApplied = renewAppliedVoucher === 'normalPublish';

                          return (
                            <div 
                              onClick={() => {
                                if (!hasNormalVoucher) {
                                  showToast('Bạn đã hết Voucher Tin Thường trong chu kỳ 30 ngày này!', 'warning');
                                  return;
                                }
                                setRenewAppliedVoucher(isVoucherApplied ? null : 'normalPublish');
                              }}
                              className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                                isVoucherApplied
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                  : hasNormalVoucher
                                  ? 'border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-slate-800'
                                  : 'border-slate-200 bg-slate-50 opacity-60 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <i className={`fa-solid fa-ticket text-sm ${isVoucherApplied ? 'text-white' : 'text-emerald-700'}`}></i>
                                <div>
                                  <div className="font-bold text-xs">Voucher Tin Thường (Giảm -5.000 đ → 0 đ)</div>
                                  <div className={`text-[10px] ${isVoucherApplied ? 'text-emerald-100' : 'text-slate-500'}`}>
                                    Khả dụng: <b>{normalVouchers}</b> lượt trong chu kỳ
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  isVoucherApplied 
                                    ? 'bg-white text-emerald-800' 
                                    : 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300'
                                }`}
                              >
                                {isVoucherApplied ? '✓ Đang áp dụng' : 'Dùng voucher'}
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-200">
                          <p className="text-[10px] sm:text-[11px] leading-relaxed">
                            👑 Đăng ký <b>Gói Hội Viên</b> nhận từ <b>15 - 50 Voucher Tin Thường</b> để miễn phí khi vượt hạn mức {dailyQuota.limit} tin/ngày!
                          </p>
                          <Link
                            to="/goi-hoi-vien"
                            onClick={() => setRenewModalProp(null)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition shadow-xs flex items-center gap-1 shrink-0 justify-center"
                          >
                            <span>Xem Gói</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  // Tin VIP: Voucher VIP (-400.000 đ)
                  <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-3 sm:p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                          <i className="fa-solid fa-crown"></i>
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          Quyền Lợi Voucher Gói Hội Viên
                        </span>
                      </div>
                      {isMemberActive ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          {currentUser?.membership?.shortName || 'HỘI VIÊN CHÍNH THỨC'}
                        </span>
                      ) : (
                        <Link
                          to="/goi-hoi-vien"
                          onClick={() => setRenewModalProp(null)}
                          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>Xem Gói Hội Viên</span>
                          <i className="fa-solid fa-arrow-right text-[9px]"></i>
                        </Link>
                      )}
                    </div>

                    {isMemberActive ? (
                      (() => {
                        const vipVoucherCount = currentUser?.vouchers?.vipPublish || 0;
                        const hasVipVoucher = vipVoucherCount > 0;
                        const isVoucherApplied = renewAppliedVoucher === 'vipPublish';

                        return (
                          <div 
                            onClick={() => {
                              if (!hasVipVoucher) {
                                showToast('Gói hội viên của bạn chưa có Voucher giảm giá cho Tin VIP trong chu kỳ này!', 'warning');
                                return;
                              }
                              setRenewAppliedVoucher(isVoucherApplied ? null : 'vipPublish');
                            }}
                            className={`p-2.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                              isVoucherApplied
                                ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs font-bold'
                                : hasVipVoucher
                                ? 'border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-slate-800'
                                : 'border-slate-200 bg-slate-50 opacity-60 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-crown text-amber-800 text-sm"></i>
                              <div>
                                <div className="font-bold text-xs">
                                  Voucher Tin VIP {vipDiscountVal > 0 ? `(-${vipDiscountVal.toLocaleString('vi-VN')} đ)` : ''}
                                </div>
                                <div className={`text-[10px] ${isVoucherApplied ? 'text-slate-950 font-medium' : 'text-slate-500'}`}>
                                  Khả dụng: <b>{vipVoucherCount}</b> voucher trong chu kỳ
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                isVoucherApplied 
                                  ? 'bg-slate-950 text-amber-300' 
                                  : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                              }`}
                            >
                              {isVoucherApplied ? '✓ Đang áp dụng' : 'Áp dụng voucher'}
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 bg-white/90 p-2.5 rounded-xl border border-amber-200">
                        <p className="text-[10px] sm:text-[11px] leading-relaxed">
                          👑 Đăng ký <b>Gói Hội Viên</b> nhận ngay Voucher giảm giá cho Tin VIP và đặc quyền duyệt tức thì!
                        </p>
                        <Link
                          to="/goi-hoi-vien"
                          onClick={() => setRenewModalProp(null)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition shadow-xs flex items-center gap-1 shrink-0 justify-center"
                        >
                          <span>Nâng cấp</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Mục 4: Auto Renew Toggle (Gọn gàng 1 dòng) */}
                <div 
                  className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer select-none" 
                  onClick={() => setRenewAutoRenew(!renewAutoRenew)}
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-arrows-rotate text-emerald-600 text-xs"></i>
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Tự động gia hạn khi hết hạn (Auto-Renew)</span>
                      <p className="text-[10px] text-slate-500">Tự động gia hạn thêm {isNormal ? '60 ngày' : `${renewDays} ngày`} khi tin chạm mốc</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={renewAutoRenew}
                    onChange={(e) => setRenewAutoRenew(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Chi tiết hạn mới & số dư */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Hạn mới sau gia hạn:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {newExpDate.toLocaleDateString('vi-VN')} ({isCurrentlyExpired ? 'Tính từ hôm nay' : `+${activeDays} ngày`})
                    </span>
                  </div>
                  {(!isNormal || !isFreeQuotaAvailable) && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Tổng số dư ví khả dụng:</span>
                        <span className="font-bold text-slate-900 font-mono">{totalAvailable.toLocaleString('vi-VN')} đ</span>
                      </div>
                      {bonusWallet > 0 && (
                        <div className="flex items-center justify-between text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <span>Ví chính: <b>{mainWallet.toLocaleString('vi-VN')} đ</b> • Ví KM: <b>{bonusWallet.toLocaleString('vi-VN')} đ</b></span>
                          <span className="font-bold text-emerald-700">✓ Ưu tiên trừ Ví KM</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Modal Sticky Action Bar */}
              <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] space-y-2">
                {isInsufficient && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">Số dư ví không đủ (thiếu {(totalCost - totalAvailable).toLocaleString('vi-VN')} đ)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRenewModalProp(null);
                        setActiveModal('wallet-deposit');
                      }}
                      className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px] hover:bg-rose-700 transition shrink-0"
                    >
                      Nạp Tiền Ví
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  {/* Bên trái: Tổng tiền & Chiết khấu */}
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {discountAmount > 0 ? (
                        <span className="text-emerald-700">Đã giảm -{discountAmount.toLocaleString('vi-VN')} đ</span>
                      ) : (
                        <span>Tổng thanh toán</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {discountAmount > 0 && (
                        <span className="text-xs text-slate-400 line-through">
                          {rawCost.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                      <span className="text-base sm:text-lg font-black text-emerald-700">
                        {totalCost === 0 ? '0 đ (Miễn phí)' : `${totalCost.toLocaleString('vi-VN')} đ`}
                      </span>
                    </div>
                  </div>

                  {/* Bên phải: Nút đóng & Nút xác nhận */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRenewModalProp(null)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
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
                          isFreeAdmin: isNormal && isFreeQuotaAvailable,
                          appliedVoucher: renewAppliedVoucher
                        });
                        if (success) {
                          setRenewModalProp(null);
                        }
                      }}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-md flex items-center gap-1.5 ${
                        isInsufficient 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                      }`}
                    >
                      <i className="fa-solid fa-arrows-rotate text-xs"></i>
                      <span>
                        {totalCost === 0
                          ? (renewAppliedVoucher
                              ? 'Xác Nhận (0 đ • Voucher)'
                              : 'Xác Nhận (0 đ)')
                          : `Xác Nhận (${totalCost.toLocaleString('vi-VN')} đ)`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* Modal nộp hồ sơ Sổ đỏ 2 mặt xác thực tin */}
      {verifyingProperty && (
        <PropertyVerificationModal
          isOpen={Boolean(verifyingProperty)}
          onClose={() => setVerifyingProperty(null)}
          property={verifyingProperty}
          onSubmit={async (pId, data) => {
            await submitPropertyVerification(pId, data);
            setVerifyingProperty(null);
          }}
        />
      )}

      {/* Modal xem hồ sơ Sổ đỏ 2 mặt đã gửi */}
      {reviewingDocProperty && (
        <PropertyVerificationReviewModal
          isOpen={Boolean(reviewingDocProperty)}
          onClose={() => setReviewingDocProperty(null)}
          property={reviewingDocProperty}
          isAdmin={false}
        />
      )}

      {/* Modal Xác Nhận Đẩy Tin */}
      {bumpConfirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                bumpConfirmData.hasBumpVoucher ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <i className="fa-solid fa-arrow-up"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-slate-900">Xác Nhận Đẩy Tin Lên Đầu</h3>
                <p className="text-[11px] text-slate-500">Đưa tin đăng lên vị trí ưu tiên trang chủ & danh mục tìm kiếm</p>
              </div>
              <button 
                onClick={() => setBumpConfirmData(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Tin đăng áp dụng:</span>
                <div className="font-bold text-slate-800 line-clamp-2 leading-relaxed">
                  {bumpConfirmData.prop.title}
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span>Hình thức & Chi phí:</span>
                <span className="font-bold text-sm">
                  {bumpConfirmData.hasBumpVoucher ? (
                    <span className="text-emerald-600 font-mono flex items-center gap-1">
                      <i className="fa-solid fa-ticket text-xs"></i> 0 đ (Voucher Hội Viên)
                    </span>
                  ) : (
                    <span className="text-amber-600 font-mono">{(bumpServicePrice || BUMP_SERVICE_PRICE || 10000).toLocaleString('vi-VN')} đ</span>
                  )}
                </span>
              </div>

              {bumpConfirmData.hasBumpVoucher ? (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 font-medium flex items-center justify-between">
                  <span>Kho voucher hiện có:</span>
                  <strong>{currentUser?.vouchers?.normalBump || 0} lượt đẩy tin</strong>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span>Số dư ví chính:</span>
                  <strong className="text-slate-800 font-mono">{(currentUser?.walletBalance ?? currentUser?.balance ?? 0).toLocaleString('vi-VN')} đ</strong>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBumpConfirmData(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const { prop, hasBumpVoucher } = bumpConfirmData;
                  setBumpConfirmData(null);
                  bumpListing(prop.id, hasBumpVoucher);
                }}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                  bumpConfirmData.hasBumpVoucher 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                <i className="fa-solid fa-arrow-up"></i>
                <span>Xác Nhận Đẩy Tin Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA BÀI VIẾT / TIN ĐĂNG - Đồng bộ 100% form và cấu trúc Đăng Tin PostListingModal */}
      {editingProperty && (
        <PostListingModal
          editProperty={editingProperty}
          onClose={() => setEditingProperty(null)}
        />
      )}
    </div>
  );
}
