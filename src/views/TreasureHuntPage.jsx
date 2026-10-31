'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { 
  getDailyQuotaStatus, 
  getDailyClaims, 
  hasClaimedPropertyToday, 
  isPropertyTreasureActive, 
  isUserMembershipActive,
  getMonthlyTreasureBudgetStatus,
  DEFAULT_TREASURE_REWARD_TIERS
} from '../services/treasureHuntService';
import { getPropertyPermalink, SITE_URL } from '../utils/permalink';

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function TreasureHuntPage() {
  const { 
    currentUser, 
    properties, 
    rewardsConfig, 
    systemConfig, 
    addBonusWalletBalance, 
    showToast, 
    isMembershipActive,
    transactions,
    setActiveModal
  } = useRealEstate();
  const isMember = isMembershipActive ? isMembershipActive(currentUser) : isUserMembershipActive(currentUser);

  const tConfig = rewardsConfig?.treasureHuntConfig;
  const isFeatureEnabled = tConfig?.enabled !== false;
  const requireLogin = tConfig?.requireLogin !== false;

  // Hạn mức mở rương theo đối tượng: Thành viên thường (1) vs Hội viên VIP (3)
  const regularDailyLimit = Number(tConfig?.regularDailyLimit || 1);
  const memberDailyLimit = Number(tConfig?.memberDailyLimit || 3);
  const effectiveDailyLimit = isMember ? memberDailyLimit : regularDailyLimit;

  // Thời gian đọc chống bot & cooldown dùng chung cho tất cả đối tượng
  const minReadingSeconds = Number(tConfig?.minReadingSeconds || 4);
  const cooldownSeconds = Number(tConfig?.cooldownSeconds || 20);

  // Tổng ngân sách tháng
  const monthlyBudget = Number(tConfig?.monthlyBudget || 50000);
  const budgetStatus = getMonthlyTreasureBudgetStatus(monthlyBudget, transactions);

  // 4 Mốc phần thưởng
  const rewardTiers = Array.isArray(tConfig?.rewardTiers) && tConfig.rewardTiers.length > 0
    ? tConfig.rewardTiers
    : DEFAULT_TREASURE_REWARD_TIERS;

  const minAmount = Number(tConfig?.minAmount || 1200);
  const maxAmount = Number(tConfig?.maxAmount || 12000);

  const [quota, setQuota] = useState({ count: 0, limit: effectiveDailyLimit, remaining: effectiveDailyLimit, isLimitReached: false });
  const [claimsToday, setClaimsToday] = useState([]);

  const isGuest = !currentUser || currentUser.role === 'guest' || !currentUser.id;
  const userId = (!isGuest ? currentUser.id : null) || 'guest';
  const [localBonusBal, setLocalBonusBal] = useState(Number(currentUser?.bonusWalletBalance || 0));
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Lấy danh sách rương đã mở hôm nay (kiểm tra cả user hiện tại lẫn guest)
    let claims = getDailyClaims(userId);
    if (claims.length === 0 && userId !== 'guest') {
      const guestClaims = getDailyClaims('guest');
      if (guestClaims.length > 0) {
        claims = guestClaims;
      }
    }
    setQuota(getDailyQuotaStatus(userId, effectiveDailyLimit));
    setClaimsToday(claims);

    const earnedToday = claims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    // 2. Đồng bộ số dư Ví Khuyến Mãi từ LocalStorage & currentUser
    let resolvedBonus = Number(currentUser?.bonusWalletBalance || 0);
    try {
      const cachedBonus = localStorage.getItem(`bds_user_bonus_${userId}`);
      if (cachedBonus !== null && !isNaN(Number(cachedBonus))) {
        resolvedBonus = Math.max(resolvedBonus, Number(cachedBonus));
      }
      const cachedExp = localStorage.getItem(`bds_user_bonus_exp_${userId}`);
      if (cachedExp) {
        const parsed = JSON.parse(cachedExp);
        if (parsed?.amount && parsed?.formattedDate) {
          setExpiringBonusInfo(parsed);
        }
      }
    } catch (e) {}

    // 3. Tự động đối soát: Nếu đã săn được rương hôm nay mà Ví KM hiển thị nhỏ hơn số tiền săn rương, tự động cộng bù ngay
    if (earnedToday > 0 && resolvedBonus < earnedToday) {
      resolvedBonus = earnedToday;
      if (addBonusWalletBalance) {
        addBonusWalletBalance(earnedToday - (Number(currentUser?.bonusWalletBalance) || 0), 'Tiền thưởng săn rương kho báu hôm nay');
      } else {
        try {
          localStorage.setItem(`bds_user_bonus_${userId}`, String(resolvedBonus));
        } catch (e) {}
      }
    }

    setLocalBonusBal(resolvedBonus);

    // 4. Khởi tạo phiên xáo trộn ngẫu nhiên công bằng khi client tải trang
    setShuffleSeed(Date.now());

    const handleWalletUpdated = (e) => {
      if (e.detail?.bonusWalletBalance !== undefined) {
        setLocalBonusBal(Number(e.detail.bonusWalletBalance));
      }
      if (e.detail?.earliestExpiringBonus) {
        setExpiringBonusInfo(e.detail.earliestExpiringBonus);
      }
    };

    window.addEventListener('bds_bonus_wallet_updated', handleWalletUpdated);
    window.addEventListener('storage', handleWalletUpdated);

    return () => {
      window.removeEventListener('bds_bonus_wallet_updated', handleWalletUpdated);
      window.removeEventListener('storage', handleWalletUpdated);
    };
  }, [userId, effectiveDailyLimit, currentUser?.bonusWalletBalance]);

  const totalEarnedToday = claimsToday.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // Định dạng chuẩn cấu trúc giá bất động sản theo tiêu chuẩn hệ thống
  const formatPropertyPrice = (p) => {
    if (p.priceDisplay) return p.priceDisplay.replace(/Tỷ/g, 'tỷ');
    if (!p.price) return 'Thỏa thuận';
    const num = Number(p.price);
    if (isNaN(num)) return String(p.price);
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')} tỷ`;
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(0)} triệu${p.demand === 'rent' ? '/tháng' : ''}`;
    }
    return `${num.toLocaleString('vi-VN')} đ`;
  };

  // Lọc và sắp xếp bài viết tin đăng BĐS xuất hiện trong mục Săn Kho Báu theo Phương Án 1 (Fair Random Shuffle):
  // 1. Ưu tiên hàng đầu cho người mua Gói Hội Viên (bài viết được hội viên chọn bật isTreasureHuntActive)
  // 2. Trong số các bài của người mua gói: Tôn trọng cấp bậc VIP:
  //    VIP Kim Cương (vip-diamond) ⟶ VIP Vàng (vip-gold) ⟶ VIP Bạc (vip-silver) ⟶ Tin Thường (normal)
  // 3. Trong cùng cấp bậc VIP: Tự động đảo ngẫu nhiên công bằng (Fisher-Yates Fair Shuffle) theo từng phiên truy cập
  //    Đảm bảo 100% tất cả các bài của hội viên đều có cơ hội hiển thị ở vị trí hàng đầu như nhau, không bị dồn cục vào vài bài đầu!
  // 4. Ưu tiên đưa bài chưa mở hôm nay lên trước bài đã mở của người dùng.
  const ITEMS_PER_PAGE = Math.max(1, Number(tConfig?.itemsPerPage || systemConfig?.treasureHuntPageSize || 16));
  const [currentPage, setCurrentPage] = useState(1);
  const articlesSectionRef = useRef(null);

  // Lọc và sắp xếp bài viết tin đăng BĐS xuất hiện trong mục Săn Kho Báu theo Phương Án 1 (Fair Random Shuffle):
  // 1. Ưu tiên hàng đầu cho người mua Gói Hội Viên (bài viết được hội viên chọn bật isTreasureHuntActive)
  // 2. Trong số các bài của người mua gói: Tôn trọng cấp bậc VIP:
  //    VIP Kim Cương (vip-diamond) ⟶ VIP Vàng (vip-gold) ⟶ VIP Bạc (vip-silver) ⟶ Tin Thường (normal)
  // 3. Trong cùng cấp bậc VIP: Tự động đảo ngẫu nhiên công bằng (Fisher-Yates Fair Shuffle) theo từng phiên truy cập
  //    Đảm bảo 100% tất cả các bài của hội viên đều có cơ hội hiển thị ở vị trí hàng đầu như nhau, không bị dồn cục vào vài bài đầu!
  // 4. Ưu tiên đưa bài chưa mở hôm nay lên trước bài đã mở của người dùng.
  // 5. Hiển thị 16 tin mỗi trang, nếu nhiều hơn 16 tin thì phân trang rõ ràng, trực quan.
  const allTreasureArticles = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    const valid = properties.filter(p => !p.isDeleted && p.status !== 'trash' && p.status !== 'rejected');

    // Hàm xáo trộn mảng theo chuẩn Fisher-Yates
    const shuffleArray = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    // Hàm sắp xếp công bằng trong từng nhóm (Hội viên hoặc Tin thường)
    const fairSortArticles = (list) => {
      const diamond = list.filter(p => p.vipPackageId === 'vip-diamond');
      const gold = list.filter(p => p.vipPackageId === 'vip-gold');
      const silver = list.filter(p => p.vipPackageId === 'vip-silver');
      const normal = list.filter(p => !p.vipPackageId || p.vipPackageId === 'normal');

      // Helper đảo ngẫu nhiên và ưu tiên bài chưa mở hôm nay lên trước bài đã mở
      const processTier = (tierList) => {
        if (tierList.length <= 1) return tierList;
        // Nếu đã hydrate client (shuffleSeed > 0), xáo trộn ngẫu nhiên công bằng
        const listToOrder = shuffleSeed > 0 ? shuffleArray(tierList) : tierList;
        // Bài chưa mở lên trước bài đã mở của user này
        return listToOrder.sort((a, b) => {
          const claimedA = claimsToday.some(c => String(c.propertyId) === String(a.id)) ? 1 : 0;
          const claimedB = claimsToday.some(c => String(c.propertyId) === String(b.id)) ? 1 : 0;
          return claimedA - claimedB;
        });
      };

      return [
        ...processTier(diamond),
        ...processTier(gold),
        ...processTier(silver),
        ...processTier(normal)
      ];
    };

    // Lấy toàn bộ các bài viết đã được kích hoạt cờ Săn Kho Báu (isTreasureHuntActive === true)
    // và vẫn còn trong thời hạn 15 ngày hiệu lực (Phương Án 1 chuẩn xác tuyệt đối)
    const treasureArticles = valid.filter(p => isPropertyTreasureActive(p, p.author));
    return fairSortArticles(treasureArticles);
  }, [properties, shuffleSeed, claimsToday]);

  const totalItems = allTreasureArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Danh sách hiển thị đúng 16 tin trên trang hiện tại
  const paginatedArticles = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return allTreasureArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allTreasureArticles, safePage]);

  // Tự động kiểm tra và reset trang nếu số lượng bài viết thay đổi
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (p) => {
    if (p === safePage || p < 1 || p > totalPages) return;
    setCurrentPage(p);
    if (articlesSectionRef.current) {
      articlesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const baseUrl = (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL || 'https://bds-realestate.vercel.app')).replace(/\/+$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    'name': 'Săn Hộp Quà Kho Báu Trong Bài Viết BĐS',
    'description': `Khám phá các bài viết tin rao nhà đất để tìm rương kho báu, nhận tiền thưởng ngẫu nhiên từ ${minAmount.toLocaleString('vi-VN')}đ đến ${maxAmount.toLocaleString('vi-VN')}đ cộng trực tiếp vào Ví Khuyến Mãi (Tối đa ${dailyLimit} hộp/ngày).`,
    'url': `${baseUrl}/trung-tam-phan-thuong/san-kho-bau-bds/`
  };

  if (!isFeatureEnabled) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-solid fa-box-archive" aria-hidden="true"></i>
          </div>
          <h1 className="text-xl font-black text-slate-900">Tính Năng Săn Kho Báu Đang Tạm Đóng</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống Săn Kho Báu hiện đang được quản trị viên tạm tắt để bảo trì hoặc điều chỉnh hạn mức. Quý khách vui lòng quay lại sau!
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/trung-tam-phan-thuong" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition">
              Về Trung Tâm Phần Thưởng
            </Link>
            <Link to="/" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition">
              Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Săn kho báu bài viết</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-200">
              <i className="fa-solid fa-gift"></i>
              Săn Hộp Quà Trong Bài Viết BĐS
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Đọc Tin Rao - Mở Rương Tiền Thưởng Vào Ví
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Các rương kho báu đang ẩn giấu ngẫu nhiên bên trong các bài viết tin đăng nhà đất. Hãy khám phá tin rao để săn hộp quà, tiền thưởng được <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong>!
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70 font-semibold">Ví Khuyến Mãi hiện có</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{localBonusBal.toLocaleString('vi-VN')} đ
                </div>
                {/* Dòng cảnh báo hạn dùng 30 ngày */}
                <div className="text-[10px] text-amber-200/90 pt-0.5 flex items-center gap-1 font-medium">
                  <span>⏳</span>
                  <span>
                    {expiringBonusInfo?.formattedDate
                      ? `Có ${Number(expiringBonusInfo.amount || localBonusBal).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${expiringBonusInfo.formattedDate}`
                      : `Tiền thưởng săn rương có hạn sử dụng ${Number(systemConfig?.bonusExpiryDays) || 30} ngày kể từ ngày nhận`}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/nha-dat-ban"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition flex items-center gap-2 shadow-lg hover:bg-amber-50"
            >
              <span>Xem bài viết săn rương ngay</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Progress & Quota Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Daily Limit */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                {isMember ? 'Hội Viên' : 'Thành Viên'}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ hôm nay</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {quota.count} / {effectiveDailyLimit} <span className="text-sm font-semibold text-slate-500">hộp</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${effectiveDailyLimit > 0 ? Math.min(100, (quota.count / effectiveDailyLimit) * 100) : 0}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-500">
              {quota.isLimitReached 
                ? `🎉 Bạn đã mở đủ ${effectiveDailyLimit} hộp hôm nay!` 
                : isGuest && requireLogin
                ? '🔑 Vui lòng đăng nhập để mở rương nhận thưởng.'
                : `Còn lại ${quota.remaining} hộp có thể mở hôm nay.`}
            </div>
          </div>

          {/* Card 2: Earned Today */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                Tiền tươi vào ví
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền thưởng hôm nay</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                +{totalEarnedToday.toLocaleString('vi-VN')} đ
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cộng thẳng vào Ví Khuyến Mãi sử dụng đăng tin hoặc đẩy tin TOP 1 ngay lập tức.
            </p>
          </div>

          {/* Card 3: Monthly Budget */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                budgetStatus.isBudgetExceeded ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <i className={`fa-solid ${budgetStatus.isBudgetExceeded ? 'fa-battery-empty' : 'fa-vault'}`}></i>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                budgetStatus.isBudgetExceeded ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
              }`}>
                Quỹ Tháng: {monthlyBudget.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngân sách tháng này</div>
              <div className={`text-2xl font-black font-mono mt-0.5 ${budgetStatus.isBudgetExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
                {budgetStatus.currentSpent.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-500">/ {monthlyBudget.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetStatus.isBudgetExceeded ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${budgetStatus.percentUsed}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-500">
              {budgetStatus.isBudgetExceeded ? '⚠️ Đã hết ngân sách tháng này.' : `Còn lại ${budgetStatus.remainingBudget.toLocaleString('vi-VN')}đ tiền thưởng.`}
            </div>
          </div>

          {/* Card 4: Anti-Bot & Fair Play */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">
                Chống Bot 100%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian xem tin</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {minReadingSeconds}s • {cooldownSeconds}s
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Đọc tối thiểu {minReadingSeconds}s và giãn cách {cooldownSeconds}s giữa 2 lần mở. Áp dụng chung cho tất cả đối tượng.
            </p>
          </div>
        </div>

        {/* Banner Đặc Quyền Hội Viên */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl text-amber-200 shrink-0 shadow-inner">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 text-amber-200">
                  Đặc quyền Hội Viên
                </span>
                {isMember && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                    <i className="fa-solid fa-circle-check text-[9px]"></i>
                    Đang kích hoạt ({currentUser.membership?.packageName || 'VIP'})
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                {isMember 
                  ? `Bạn đang được mở tối đa ${memberDailyLimit} rương mỗi ngày!` 
                  : `Mua bất kỳ Gói Hội Viên nào: Mở tối đa ${memberDailyLimit} rương mỗi ngày!`}
              </h3>
              <p className="text-xs text-white/90 mt-0.5 max-w-2xl leading-relaxed">
                Tài khoản có Gói Hội Viên được mở tối đa {memberDailyLimit} rương mỗi ngày (gấp 3 lần thành viên thường), nhân ba cơ hội nhận tiền thưởng vào Ví Khuyến Mãi để đăng và đẩy tin VIP.
              </p>
            </div>
          </div>
          {!isMember && (
            <Link
              href="/goi-hoi-vien"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs shadow-md transition shrink-0 flex items-center gap-1.5"
            >
              <span>Xem Gói Hội Viên</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          )}
        </div>

        {/* Showcase cơ chế tiền thưởng ngẫu nhiên & Bảng 4 mốc */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-gift text-orange-500"></i>
                Bảng Tỷ Lệ & Các Mốc Phần Thưởng Mở Rương
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Quy tắc tỷ lệ ngẫu nhiên minh bạch dành cho thành viên thường (Tổng ngân sách tháng: <strong>{monthlyBudget.toLocaleString('vi-VN')}đ</strong>):
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full shrink-0">
              Hạn mức: {effectiveDailyLimit} rương / ngày
            </span>
          </div>

          {/* Bảng 4 mốc phần thưởng chuẩn xác theo ảnh thiết kế */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Mốc phần thưởng</th>
                  <th className="py-3 px-4">Số tiền nhận (đ)</th>
                  <th className="py-3 px-4 text-right">Tỷ lệ xuất hiện (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rewardTiers.map((tier, idx) => (
                  <tr key={tier.id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${Number(tier.amount) === 0 ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
                      <span>{tier.label}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      {Number(tier.amount) === 0 ? '0đ' : `${Number(tier.amount).toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-600 font-mono">
                      {tier.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 rounded-2xl border bg-amber-50/60 border-amber-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Hạn Mức Thành Viên Thường
              </div>
              <div className="text-xl font-black text-slate-900">
                {regularDailyLimit} Rương / Ngày
              </div>
              <div className="text-[11px] text-slate-500">
                Mở 1 rương mỗi ngày. Yêu cầu đăng nhập tài khoản.
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-purple-50/60 border-purple-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Chống Bot & Spam Chung
              </div>
              <div className="text-xl font-black text-slate-900">
                Xem {minReadingSeconds}s • Cooldown {cooldownSeconds}s
              </div>
              <div className="text-[11px] text-slate-500">
                Áp dụng chung cho tất cả đối tượng xem bài viết.
              </div>
            </div>

            <div className="p-4 rounded-2xl border bg-rose-50/60 border-rose-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Quỹ Ngân Sách Tháng
              </div>
              <div className="text-xl font-black text-slate-900">
                {monthlyBudget.toLocaleString('vi-VN')} đ / Tháng
              </div>
              <div className="text-[11px] text-slate-500">
                Đã giải ngân {budgetStatus.currentSpent.toLocaleString('vi-VN')}đ ({budgetStatus.percentUsed}%).
              </div>
            </div>
          </div>
        </div>


        {/* Claims History Today */}
        {claimsToday.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-slate-500"></i>
              Lịch sử các rương đã mở hôm nay ({claimsToday.length}/{dailyLimit})
            </h3>
            <div className="divide-y divide-slate-100">
              {claimsToday.map((c, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{c.propertyTitle}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(c.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.isMemberBonus && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                        <i className="fa-solid fa-crown text-[9px] text-amber-600"></i>
                        <span>Hội Viên</span>
                      </span>
                    )}
                    <span className="text-xs font-black text-emerald-600 font-mono">
                      +{Number(c.amount).toLocaleString('vi-VN')} đ vào Ví KM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Articles containing Gift Boxes */}
        <div className="space-y-4" ref={articlesSectionRef}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-fire text-red-500"></i>
                Danh Sách Bài Viết Đang Chứa Hộp Quà Hôm Nay {totalItems > 0 && <span className="text-sm font-bold text-amber-700">({totalItems})</span>}
              </h3>
              <p className="text-xs text-slate-500">
                Bấm vào từng bài viết bên dưới, cuộn xuống phần mô tả để mở rương kho báu:
              </p>
            </div>
            <Link to="/nha-dat-ban" className="text-xs font-bold text-emerald-700 hover:underline">
              Xem tất cả tin rao &rarr;
            </Link>
          </div>

          {allTreasureArticles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-amber-300 p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-800">Chưa có bài viết nào kích hoạt rương hôm nay</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rương kho báu là quyền lợi độc quyền dành cho bài viết của Gói Hội Viên hoặc bài viết được Quản trị viên kích hoạt. Các rương mới sẽ được mở thưởng trong thời gian sớm nhất!
                </p>
              </div>
              {currentUser?.role === 'admin' ? (
                <Link
                  to="/admin#properties"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-amber-300 hover:text-white font-bold text-xs shadow-md transition"
                >
                  <i className="fa-solid fa-gear text-amber-400"></i>
                  <span>Vào Quản Trị kích hoạt rương bài viết</span>
                </Link>
              ) : (
                <Link
                  to="/nha-dat-ban"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition"
                >
                  <span>Khám phá các tin rao BĐS khác</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {paginatedArticles.map(p => {
                  const link = getPropertyPermalink(p);
                  const isClaimed = userId ? hasClaimedPropertyToday(userId, p.id) : false;
                  return (
                    <Link
                      key={p.id}
                      to={link}
                      className="bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80'}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isClaimed ? (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1 z-10">
                            <i className="fa-solid fa-circle-check"></i> Đã Mở
                          </span>
                        ) : (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1 z-10">
                            <i className="fa-solid fa-gift"></i> Có Rương
                          </span>
                        )}

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                          {Boolean(p.isTreasureHuntActive) && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-xs flex items-center gap-0.5" title="Đặc quyền bài viết từ Gói Hội Viên">
                              <i className="fa-solid fa-crown text-[8px]"></i> Hội Viên
                            </span>
                          )}
                          {p.vipPackageId && p.vipPackageId !== 'normal' && (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md text-white shadow-xs ${
                              p.vipPackageId === 'vip-diamond' ? 'bg-gradient-to-r from-red-600 to-rose-600' :
                              p.vipPackageId === 'vip-gold' ? 'bg-amber-700' :
                              'bg-slate-700'
                            }`}>
                              {p.vipPackageId === 'vip-diamond' ? 'VIP Kim Cương' : p.vipPackageId === 'vip-gold' ? 'VIP Vàng' : 'VIP Bạc'}
                            </span>
                          )}
                        </div>

                        <span className="absolute bottom-2.5 right-2.5 text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-black/75 text-white backdrop-blur-xs font-mono shadow-xs">
                          {formatPropertyPrice(p)}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition line-clamp-2">
                          {p.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1 truncate">
                            <i className="fa-solid fa-location-dot text-rose-500 text-[10px] shrink-0"></i>
                            <span className="truncate">{p.district ? `${p.district}, ` : ''}{p.city || systemConfig?.city || 'Đà Nẵng'}</span>
                          </div>
                          {p.area ? (
                            <span className="font-semibold text-slate-600 shrink-0">{p.area} m²</span>
                          ) : null}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
                          <span>{isClaimed ? 'Đã nhận thưởng • Xem bài viết' : 'Khám phá & Săn rương'}</span>
                          <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Phân trang khi số lượng tin lớn hơn 16 */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Thông tin số lượng tin đang hiển thị */}
                  <div className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
                    Đang hiển thị <span className="font-bold text-slate-900">{(safePage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-slate-900">{Math.min(safePage * ITEMS_PER_PAGE, totalItems)}</span> trong tổng số <span className="font-bold text-amber-700">{totalItems}</span> bài viết chứa rương
                  </div>

                  {/* Thanh chuyển trang */}
                  <nav className="flex items-center gap-1.5 flex-wrap justify-center" aria-label="Phân trang rương kho báu">
                    {/* Nút Về Trang Đầu */}
                    {safePage === 1 ? (
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed select-none"
                        title="Đang ở trang đầu tiên"
                        aria-disabled="true"
                      >
                        <i className="fa-solid fa-angles-left"></i>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 cursor-pointer shadow-2xs"
                        title="Về trang đầu tiên"
                      >
                        <i className="fa-solid fa-angles-left"></i>
                      </button>
                    )}

                    {/* Nút Trang Trước */}
                    {safePage === 1 ? (
                      <span
                        className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed select-none"
                        title="Đang ở trang đầu"
                        aria-disabled="true"
                      >
                        <i className="fa-solid fa-angle-left"></i>
                        <span className="hidden sm:inline">Trước</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage - 1)}
                        className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 cursor-pointer shadow-2xs"
                        title="Trang trước"
                      >
                        <i className="fa-solid fa-angle-left"></i>
                        <span className="hidden sm:inline">Trước</span>
                      </button>
                    )}

                    {/* Danh sách các số trang */}
                    {getPageNumbers(safePage, totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span 
                            key={`ellipsis-${idx}`} 
                            className="w-8 h-9 flex items-center justify-center text-slate-700 font-bold text-xs select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const isActive = p === safePage;
                      if (isActive) {
                        return (
                          <span
                            key={`page-${p}`}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition cursor-default bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-600/20"
                            aria-current="page"
                          >
                            {p}
                          </span>
                        );
                      }
                      return (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                        >
                          {p}
                        </button>
                      );
                    })}

                    {/* Nút Trang Sau */}
                    {safePage === totalPages ? (
                      <span
                        className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed select-none"
                        title="Đang ở trang cuối"
                        aria-disabled="true"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <i className="fa-solid fa-angle-right"></i>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage + 1)}
                        className="px-3 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 cursor-pointer shadow-2xs"
                        title="Trang kế tiếp"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <i className="fa-solid fa-angle-right"></i>
                      </button>
                    )}

                    {/* Nút Đến Trang Cuối */}
                    {safePage === totalPages ? (
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed select-none"
                        title="Đang ở trang cuối"
                        aria-disabled="true"
                      >
                        <i className="fa-solid fa-angles-right"></i>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 cursor-pointer shadow-2xs"
                        title="Đến trang cuối cùng"
                      >
                        <i className="fa-solid fa-angles-right"></i>
                      </button>
                    )}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
