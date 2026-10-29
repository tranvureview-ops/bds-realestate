'use client';

import React, { useState, useEffect } from 'react';
import { MISSIONS_DATA } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyClaims } from '../services/treasureHuntService';
import { getCheckInStatus } from '../services/checkInService';
import { normalizePhone } from '../utils/authValidation';

export default function MissionHubPage({ initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [claimedMissions, setClaimedMissions] = useState({});
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig, 
    systemConfig,
    properties,
    usersList
  } = useRealEstate();
  const router = useRouter();
  const pathname = router?.pathname || '';

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
  const [localRewardsConfig, setLocalRewardsConfig] = useState(rewardsConfig);
  const [localBonusBal, setLocalBonusBal] = useState(Number(currentUser?.bonusWalletBalance || 0));
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);

  useEffect(() => {
    setLocalRewardsConfig(rewardsConfig);
  }, [rewardsConfig]);

  useEffect(() => {
    setLocalBonusBal(Number(currentUser?.bonusWalletBalance || 0));
  }, [currentUser?.bonusWalletBalance]);

  // Đồng bộ activeCategory khi url param initialCategory hoặc pathname thay đổi
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setActiveCategory(initialCategory);
    } else if (pathname) {
      if (pathname.includes('/tan-thu')) setActiveCategory('tan-thu');
      else if (pathname.includes('/hang-ngay')) setActiveCategory('hang-ngay');
      else if (pathname.includes('/thanh-tuu')) setActiveCategory('thanh-tuu');
    }
  }, [initialCategory, pathname]);

  // Lắng nghe cấu hình phần thưởng và thông tin ví theo thời gian thực
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Kiểm tra LocalStorage ngay lập tức
    try {
      const cachedBonus = localStorage.getItem(`bds_user_bonus_${userId}`);
      if (cachedBonus !== null && !isNaN(Number(cachedBonus))) {
        setLocalBonusBal(Number(cachedBonus));
      }
      const cachedExp = localStorage.getItem(`bds_user_bonus_exp_${userId}`);
      if (cachedExp) {
        const parsed = JSON.parse(cachedExp);
        if (parsed?.amount && parsed?.formattedDate) {
          setExpiringBonusInfo(parsed);
        }
      }
    } catch (e) {}

    // 2. Ưu tiên từ currentUser
    if (currentUser?.earliestExpiringBonus?.amount && currentUser?.earliestExpiringBonus?.expiresAt) {
      const expDate = new Date(currentUser.earliestExpiringBonus.expiresAt);
      setExpiringBonusInfo({
        amount: Number(currentUser.earliestExpiringBonus.amount),
        expiresAt: currentUser.earliestExpiringBonus.expiresAt,
        formattedDate: currentUser.earliestExpiringBonus.formattedDate || expDate.toLocaleDateString('vi-VN')
      });
    }

    const handleConfigUpdate = (e) => {
      if (e.detail) {
        setLocalRewardsConfig(e.detail);
      }
    };

    const handleWalletUpdated = (e) => {
      if (e.detail?.bonusWalletBalance !== undefined) {
        setLocalBonusBal(Number(e.detail.bonusWalletBalance));
      }
      if (e.detail?.earliestExpiringBonus) {
        setExpiringBonusInfo(e.detail.earliestExpiringBonus);
      }
    };

    window.addEventListener('bds_rewards_config_updated', handleConfigUpdate);
    window.addEventListener('bds_bonus_wallet_updated', handleWalletUpdated);

    if (!userId || userId === 'guest') {
      return () => {
        window.removeEventListener('bds_rewards_config_updated', handleConfigUpdate);
        window.removeEventListener('bds_bonus_wallet_updated', handleWalletUpdated);
      };
    }

    const fetchExpiringBonus = async () => {
      try {
        const res = await fetch(`/api/wallet/expiring-bonus?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.hasExpiringBonus) {
          setExpiringBonusInfo({
            amount: data.amount,
            expiresAt: data.expiresAt,
            formattedDate: data.formattedDate
          });
        }
      } catch (err) {
        console.warn('Lỗi lấy thông tin gói tiền sắp hết hạn:', err);
      }
    };

    fetchExpiringBonus();

    return () => {
      window.removeEventListener('bds_rewards_config_updated', handleConfigUpdate);
      window.removeEventListener('bds_bonus_wallet_updated', handleWalletUpdated);
    };
  }, [userId, currentUser?.bonusWalletBalance]);

  const allMissions = localRewardsConfig?.missions || rewardsConfig?.missions || MISSIONS_DATA;

  // Tải trạng thái các nhiệm vụ đã nhận thưởng từ LocalStorage và lắng nghe sự kiện
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadClaimed = () => {
      try {
        const saved = localStorage.getItem(`bds_claimed_missions_${userId}`);
        if (saved) {
          setClaimedMissions(JSON.parse(saved));
        }
      } catch (e) {}
    };
    loadClaimed();
    window.addEventListener('bds_claimed_missions_updated', loadClaimed);
    window.addEventListener('bds_rewards_config_updated', loadClaimed);
    window.addEventListener('storage', loadClaimed);
    return () => {
      window.removeEventListener('bds_claimed_missions_updated', loadClaimed);
      window.removeEventListener('bds_rewards_config_updated', loadClaimed);
      window.removeEventListener('storage', loadClaimed);
    };
  }, [userId]);

  const categories = [
    { id: 'all', label: 'Tất cả nhiệm vụ', icon: 'fa-solid fa-list-check' },
    { id: 'tan-thu', label: 'Tân thủ', icon: 'fa-solid fa-seedling' },
    { id: 'hang-ngay', label: 'Hàng ngày', icon: 'fa-solid fa-calendar-day' },
    { id: 'thanh-tuu', label: 'Thành tựu', icon: 'fa-solid fa-trophy' }
  ];

  let rawMissions = [];
  if (activeCategory === 'all') {
    rawMissions = [
      ...(allMissions['tan-thu'] || []),
      ...(allMissions['hang-ngay'] || []),
      ...(allMissions['thanh-tuu'] || [])
    ];
  } else if (allMissions[activeCategory]) {
    rawMissions = allMissions[activeCategory];
  }

  // Đánh giá trạng thái thực tế của nhiệm vụ theo dữ liệu thực của tài khoản (Dynamic Progress Engine)
  // Chỉ tính là ĐÃ CẬP NHẬT AVATAR khi người dùng thực sự tự tải ảnh mới lên (Base64 data URL, blob, hoặc có cờ hasCustomAvatar), loại trừ ảnh mẫu mặc định (unsplash, placeholder)
  const isDefaultAvatar = !currentUser?.avatar || 
    currentUser.avatar.includes('placeholder') || 
    currentUser.avatar.includes('unsplash.com') ||
    currentUser.avatar.includes('photo-1535713875002');
  const hasAvatar = Boolean(
    currentUser?.hasCustomAvatar || 
    currentUser?.avatarUpdatedAt ||
    (!isDefaultAvatar && (currentUser?.avatar?.startsWith('data:image/') || currentUser?.avatar?.startsWith('blob:')))
  );

  const isPhoneVerified = Boolean(currentUser?.isVerified || currentUser?.phone);
  const isKycVerified = Boolean(currentUser?.kycStatus === 'verified' || currentUser?.isVerified);
  
  // Đếm chính xác số bài viết mà user hiện tại đã đăng
  const userPropertiesCount = (properties || []).filter(p => {
    if (!currentUser?.id) return false;
    return (p.author?.id && p.author.id === currentUser.id) ||
           (p.userId && p.userId === currentUser.id) ||
           (p.authorId && p.authorId === currentUser.id);
  }).length;

  const checkInStatus = getCheckInStatus(userId);
  const isCheckedInToday = checkInStatus.checkedToday;
  const treasureCountToday = typeof window !== 'undefined'
    ? getDailyClaims(userId).length
    : 0;
  const hasVotedPrediction = typeof window !== 'undefined'
    ? Boolean(localStorage.getItem(`bds_prediction_votes_${userId}`))
    : false;
  const streakDays = checkInStatus.streak;

  const displayMissions = rawMissions.map(m => {
    const isClaimed = Boolean(claimedMissions[m.id]);
    if (isClaimed) {
      return { ...m, dynamicStatus: 'claimed' };
    }

    // Kiểm tra điều kiện tự động của từng nhiệm vụ
    let dynamicStatus = m.status || 'in-progress';
    let dynamicProgress = m.progress;

    // 1. Nhiệm vụ Ảnh đại diện
    if (m.id === 'm-new-avatar' || m.title?.toLowerCase().includes('ảnh đại diện') || m.title?.toLowerCase().includes('avatar')) {
      dynamicStatus = hasAvatar ? 'claimable' : 'in-progress';
    } 
    // 2. Nhiệm vụ Xác thực SĐT / OTP
    else if (m.id === 'm-new-01' || (m.title?.toLowerCase().includes('số điện thoại') && m.title?.toLowerCase().includes('otp'))) {
      dynamicStatus = isPhoneVerified ? 'claimable' : 'in-progress';
    } 
    // 3. Nhiệm vụ Định danh CCCD / KYC
    else if (m.id === 'm-new-02' || m.title?.toLowerCase().includes('định danh') || m.title?.toLowerCase().includes('kyc') || m.title?.toLowerCase().includes('cccd')) {
      dynamicStatus = isKycVerified ? 'claimable' : 'in-progress';
    } 
    // 4. Nhiệm vụ Đăng tin đầu tiên
    else if (m.id === 'm-new-03' || m.title?.toLowerCase().includes('đăng tin bất động sản đầu tiên') || (m.title?.toLowerCase().includes('đăng tin') && m.title?.toLowerCase().includes('đầu tiên'))) {
      dynamicProgress = { current: Math.min(userPropertiesCount, 1), total: 1 };
      dynamicStatus = userPropertiesCount >= 1 ? 'claimable' : 'in-progress';
    } 
    // 5. Điểm danh ngày mới
    else if (m.id === 'm-day-01' || m.title?.toLowerCase().includes('điểm danh ngày mới')) {
      dynamicStatus = isCheckedInToday ? 'claimable' : 'in-progress';
    } 
    // 6. Xem tin hoặc mở rương
    else if (m.id === 'm-day-02' || m.title?.toLowerCase().includes('xem 5 tin') || m.title?.toLowerCase().includes('kho báu') || m.title?.toLowerCase().includes('rương')) {
      const views = Math.max(treasureCountToday * 2, 3);
      dynamicProgress = { current: Math.min(views, 5), total: 5 };
      if (treasureCountToday >= 1 || views >= 5) dynamicStatus = 'claimable';
    } 
    // 7. Tham gia dự đoán giá
    else if (m.id === 'm-day-04' || m.title?.toLowerCase().includes('dự đoán')) {
      dynamicStatus = hasVotedPrediction ? 'claimable' : 'in-progress';
    } 
    // Helper trích xuất chỉ tiêu số lượng thực tế từ tiêu đề / mô tả (Ví dụ: "15 tin" -> 15, "5 người" -> 5)
    const parseTarget = (mission, fallback) => {
      if (mission.target && Number(mission.target) > 0) return Number(mission.target);
      const combined = `${mission.title || ''} ${mission.description || ''}`;
      const matched = combined.match(/(\d+)\s*(tin|bài|người|ngày|lần|bạn)/i);
      if (matched) return parseInt(matched[1], 10);
      if (mission.progress?.total && Number(mission.progress.total) > 0) return Number(mission.progress.total);
      return fallback;
    };

    // 8. Thành tựu đăng tin (Nhà môi giới uy tín 10 tin / 15 tin...)
    if (m.id === 'm-ach-01' || m.title?.toLowerCase().includes('tin xác thực') || (m.title?.toLowerCase().includes('tin') && m.title?.toLowerCase().includes('môi giới'))) {
      const targetTin = parseTarget(m, 15);
      dynamicProgress = { current: Math.min(userPropertiesCount, targetTin), total: targetTin };
      dynamicStatus = userPropertiesCount >= targetTin ? 'claimable' : 'in-progress';
    } 
    // 9. Thành tựu chuỗi ngày điểm danh (30 ngày liên tục)
    else if (m.id === 'm-ach-02' || m.title?.toLowerCase().includes('chuỗi') || m.title?.toLowerCase().includes('điểm danh 30')) {
      const targetDays = parseTarget(m, 30);
      dynamicProgress = { current: Math.min(streakDays, targetDays), total: targetDays };
      dynamicStatus = streakDays >= targetDays ? 'claimable' : 'in-progress';
    }
    // 10. Thành tựu giới thiệu bạn bè (Affiliate / Chiêu mộ bạn bè)
    else if (m.id === 'm-ach-03' || m.title?.toLowerCase().includes('chiêu mộ') || m.title?.toLowerCase().includes('affiliate') || m.title?.toLowerCase().includes('giới thiệu')) {
      const targetRef = parseTarget(m, 5);
      // Đếm số lượng người thực tế đã đăng ký qua mã giới thiệu của tài khoản này
      const realRefSuccess = (usersList || []).filter(u => {
        if (!currentUser?.id) return false;
        return String(u.referredBy) === String(currentUser.id) ||
               (currentUser.refCode && String(u.referredBy) === String(currentUser.refCode)) ||
               (currentUser.phone && u.referredBy && normalizePhone(u.referredBy) === normalizePhone(currentUser.phone));
      }).length;
      dynamicProgress = { current: Math.min(realRefSuccess, targetRef), total: targetRef };
      dynamicStatus = realRefSuccess >= targetRef ? 'claimable' : 'in-progress';
    }

    return {
      ...m,
      dynamicStatus,
      dynamicProgress
    };
  });

  const handleClaim = (missionId, reward, title) => {
    const effectiveUid = userId || 'guest';
    const updated = { ...claimedMissions, [missionId]: true };
    setClaimedMissions(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`bds_claimed_missions_${effectiveUid}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('bds_claimed_missions_updated'));
      } catch (e) {}
    }

    const amount = Number(reward || 0);

    // Cộng tiền trực tiếp vào Ví Khuyến Mãi của user
    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Nhiệm vụ: ${title}`, {
        expiryDays: 30
      });
    }

    if (showToast) {
      showToast(`🎉 Chúc mừng! Đã cộng trực tiếp +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi của bạn!`, 'success');
    }
  };

  const handleTabClick = (catId) => {
    setActiveCategory(catId);
    const targetUrl = catId === 'all' ? '/nhiem-vu' : `/nhiem-vu/${catId}`;
    if (router?.navigate) {
      router.navigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Bất Động Sản';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Hệ thống nhiệm vụ</span>
        </nav>

        {/* Hero Banner with User Ví Khuyến Mãi Balance */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-gift text-amber-300"></i>
              Nhiệm Vụ Nhận Tiền Vào Ví Khuyến Mãi {brandName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Làm Nhiệm Vụ - Tiền Tươi Vào Ví Khuyến Mãi
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Không tích điểm rườm rà. Hoàn thành nhiệm vụ nhận tiền thưởng <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong> để đăng tin và nâng cấp tin VIP ngay.
            </p>
          </div>

          {/* User Bonus Wallet Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg shrink-0">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Ví Khuyến Mãi của bạn</div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  +{localBonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
                </div>
                {/* Dòng cảnh báo nhỏ kèm icon đồng hồ cát */}
                <div className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <i className="fa-solid fa-hourglass-half text-amber-300 animate-pulse"></i>
                  <span>
                    {localBonusBal > 0 && expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate
                      ? `(Có ${Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${expiringBonusInfo.formattedDate})`
                      : localBonusBal > 0
                      ? `(Có ${localBonusBal.toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')})`
                      : '(Tiền thưởng nhiệm vụ có hạn dùng 30 ngày kể từ ngày nhận)'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/dang-tin"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <span>Dùng ví đăng tin</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const count = cat.id === 'all'
              ? [
                  ...(allMissions['tan-thu'] || []),
                  ...(allMissions['hang-ngay'] || []),
                  ...(allMissions['thanh-tuu'] || [])
                ].length
              : (allMissions[cat.id] || []).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-xs ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <i className={`${cat.icon} text-xs`}></i>
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Missions List */}
        <div className="space-y-4">
          {displayMissions.map(m => {
            const isClaimed = m.dynamicStatus === 'claimed';
            const isClaimable = m.dynamicStatus === 'claimable';

            return (
              <div
                key={m.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 border border-blue-100 shadow-inner">
                    <i className={m.icon}></i>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {m.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        <i className="fa-solid fa-money-bill-wave text-emerald-600"></i>
                        +{Number(m.reward || 0).toLocaleString('vi-VN')}đ vào Ví KM
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {m.description}
                    </p>

                    {/* Dynamic Progress bar if present */}
                    {m.dynamicProgress && (
                      <div className="pt-2 flex items-center gap-3">
                        <div className="w-36 sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (m.dynamicProgress.current / m.dynamicProgress.total) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {m.dynamicProgress.current}/{m.dynamicProgress.total}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isClaimed ? (
                    <button
                      disabled
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
                    >
                      <i className="fa-solid fa-check text-emerald-600"></i>
                      <span>Đã cộng vào Ví KM</span>
                    </button>
                  ) : isClaimable ? (
                    <button
                      onClick={() => handleClaim(m.id, m.reward, m.title)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer animate-pulse"
                    >
                      <i className="fa-solid fa-hand-holding-dollar"></i>
                      <span>Nhận +{Number(m.reward || 0).toLocaleString('vi-VN')}đ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(m.link || '/dang-tin')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Thực hiện ngay</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
