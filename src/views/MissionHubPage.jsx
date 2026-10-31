'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MISSIONS_DATA } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyClaims } from '../services/treasureHuntService';
import { normalizePhone } from '../utils/authValidation';
import { 
  getAffiliateReport, 
  DEFAULT_AFFILIATE_MILESTONES, 
  getClaimedMilestones, 
  saveClaimedMilestone 
} from '../utils/affiliateEngine';

export default function MissionHubPage({ initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [claimedMissions, setClaimedMissions] = useState({});
  const [claimedMilestones, setClaimedMilestones] = useState({});
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig, 
    systemConfig,
    headerConfig,
    properties,
    usersList,
    transactions
  } = useRealEstate();
  const router = useRouter();
  const pathname = router?.pathname || '';

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
  const [localRewardsConfig, setLocalRewardsConfig] = useState(rewardsConfig);
  const [localBonusBal, setLocalBonusBal] = useState(Number(currentUser?.bonusWalletBalance || 0));
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);

  const userRefCode = currentUser?.refCode || currentUser?.phone || (currentUser?.id && currentUser.id !== 'guest' ? currentUser.id : '');
  const affiliateLink = typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/dang-ky?ref=${userRefCode || 'BDS'}`
    : `https://bds-realestate.vercel.app/dang-ky?ref=${userRefCode || 'BDS'}`;

  // Thống kê Affiliate chuẩn hóa với cơ chế thẩm tra đạt chuẩn (Qualified) tối ưu useMemo tránh chặn luồng render
  const affiliateReport = useMemo(() => {
    return getAffiliateReport(currentUser, usersList, properties, transactions);
  }, [currentUser, usersList, properties, transactions]);
  const realRefSuccess = affiliateReport.qualifiedCount;
  const totalReferred = affiliateReport.totalReferred;
  const referredFriends = affiliateReport.allReferred;

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
    const loadClaimedMilestones = () => {
      try {
        setClaimedMilestones(getClaimedMilestones(userId));
      } catch (e) {}
    };

    loadClaimed();
    loadClaimedMilestones();

    window.addEventListener('bds_claimed_missions_updated', loadClaimed);
    window.addEventListener('bds_rewards_config_updated', loadClaimed);
    window.addEventListener('bds_milestones_updated', loadClaimedMilestones);
    window.addEventListener('storage', loadClaimed);
    window.addEventListener('storage', loadClaimedMilestones);
    return () => {
      window.removeEventListener('bds_claimed_missions_updated', loadClaimed);
      window.removeEventListener('bds_rewards_config_updated', loadClaimed);
      window.removeEventListener('bds_milestones_updated', loadClaimedMilestones);
      window.removeEventListener('storage', loadClaimed);
      window.removeEventListener('storage', loadClaimedMilestones);
    };
  }, [userId]);

  // Cấu hình các mốc thưởng Affiliate từ Admin CMS (hoặc mốc mặc định)
  const activeMilestones = useMemo(() => {
    if (Array.isArray(systemConfig?.affiliateMilestones) && systemConfig.affiliateMilestones.length > 0) {
      return [...systemConfig.affiliateMilestones].sort((a, b) => Number(a.target) - Number(b.target));
    }
    return DEFAULT_AFFILIATE_MILESTONES;
  }, [systemConfig?.affiliateMilestones]);

  // Xác định mốc hiện tại mà user cần chinh phục hoặc đang chờ nhận thưởng
  const firstClaimableMilestone = useMemo(() => {
    return activeMilestones.find(
      m => !claimedMilestones[m.id] && realRefSuccess >= Number(m.target)
    );
  }, [activeMilestones, claimedMilestones, realRefSuccess]);

  const firstUnclaimedMilestone = useMemo(() => {
    return activeMilestones.find(m => !claimedMilestones[m.id]);
  }, [activeMilestones, claimedMilestones]);

  const currentMilestone = firstClaimableMilestone || firstUnclaimedMilestone || activeMilestones[activeMilestones.length - 1];
  const allMilestonesClaimed = useMemo(() => {
    return activeMilestones.length > 0 && activeMilestones.every(m => Boolean(claimedMilestones[m.id]));
  }, [activeMilestones, claimedMilestones]);

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

  const treasureCountToday = typeof window !== 'undefined'
    ? getDailyClaims(userId).length
    : 0;
  const hasVotedPrediction = typeof window !== 'undefined'
    ? Boolean(localStorage.getItem(`bds_prediction_votes_${userId}`))
    : false;

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
    // 5. Xem tin hoặc mở rương
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
    // 7. Thành tựu giới thiệu bạn bè (Affiliate / Chiêu mộ bạn bè theo từng mốc cấu hình)
    else if (m.id === 'm-ach-03' || m.title?.toLowerCase().includes('chiêu mộ') || m.title?.toLowerCase().includes('affiliate') || m.title?.toLowerCase().includes('giới thiệu')) {
      const curTarget = Number(currentMilestone?.target || 5);
      const curReward = Number(currentMilestone?.reward || 150000);
      const curLabel = currentMilestone?.label || `Chiêu mộ ${curTarget} người bạn đăng ký (Affiliate)`;

      const isCurClaimable = !allMilestonesClaimed && realRefSuccess >= curTarget && !claimedMilestones[currentMilestone?.id];
      dynamicProgress = {
        current: Math.min(realRefSuccess, curTarget),
        total: curTarget
      };
      dynamicStatus = allMilestonesClaimed ? 'claimed' : isCurClaimable ? 'claimable' : 'in-progress';

      return {
        ...m,
        title: allMilestonesClaimed
          ? 'Đã hoàn thành toàn bộ mốc Chiêu Mộ Bạn Bè'
          : curLabel,
        description: allMilestonesClaimed
          ? `Chúc mừng bạn đã chinh phục toàn bộ ${activeMilestones.length} mốc thưởng Affiliate và tiếp tục nhận hoa hồng nạp tiền!`
          : `Giới thiệu đồng nghiệp cùng tham gia nhận ngay +${curReward.toLocaleString('vi-VN')}đ vào ví khi đạt mốc ${curTarget} bạn bè hợp lệ.`,
        reward: curReward,
        dynamicStatus,
        dynamicProgress,
        isAffiliateMilestone: true,
        currentMilestoneId: currentMilestone?.id
      };
    }

    return {
      ...m,
      dynamicStatus,
      dynamicProgress
    };
  });

  // Thống kê nhanh nhiệm vụ
  const missionStats = useMemo(() => {
    const total = displayMissions.length;
    const claimable = displayMissions.filter(m => m.dynamicStatus === 'claimable').length;
    const claimed = displayMissions.filter(m => m.dynamicStatus === 'claimed').length;
    const totalReward = displayMissions.reduce((acc, m) => acc + (Number(m.reward) || 0), 0);
    return { total, claimable, claimed, totalReward };
  }, [displayMissions]);

  // Sắp xếp thông minh: Nhiệm vụ có thể nhận đưa lên đầu -> Đang làm -> Đã nhận
  const sortedMissions = useMemo(() => {
    return [...displayMissions].sort((a, b) => {
      if (a.dynamicStatus === 'claimable' && b.dynamicStatus !== 'claimable') return -1;
      if (b.dynamicStatus === 'claimable' && a.dynamicStatus !== 'claimable') return 1;
      if (a.dynamicStatus !== 'claimed' && b.dynamicStatus === 'claimed') return -1;
      if (b.dynamicStatus !== 'claimed' && a.dynamicStatus === 'claimed') return 1;
      return 0;
    });
  }, [displayMissions]);

  const handleNavigate = (url) => {
    if (router?.navigate) {
      router.navigate(url);
    } else {
      window.location.href = url;
    }
  };

  const handleActionClick = (m) => {
    const isAffiliate = m.id === 'm-ach-03' || m.title?.toLowerCase().includes('chiêu mộ') || m.title?.toLowerCase().includes('affiliate');
    if (isAffiliate) {
      if (!currentUser || currentUser.role === 'guest') {
        if (showToast) showToast('Vui lòng đăng nhập để nhận link và mã giới thiệu riêng của bạn!', 'info');
        handleNavigate('/dang-nhap?redirect=/nhiem-vu/thanh-tuu');
        return;
      }
      setShowAffiliateModal(true);
      return;
    }
    handleNavigate(m.link || '/dang-tin');
  };

  const handleClaimMilestone = (milestone) => {
    if (!milestone || !milestone.id) return;
    const effectiveUid = userId || 'guest';
    const updated = saveClaimedMilestone(effectiveUid, milestone.id);
    setClaimedMilestones(updated);

    const amount = Number(milestone.reward || 0);
    const expiryDays = Number(systemConfig?.bonusExpiryDays) || 30;
    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Thưởng Affiliate: ${milestone.label || `Mốc ${milestone.target} bạn bè`}`, {
        expiryDays
      });
    }

    if (showToast) {
      showToast(`🎉 Xuất sắc! Bạn đã nhận +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi cho ${milestone.label || `Mốc ${milestone.target} bạn bè`}!`, 'success');
    }
  };

  const handleClaim = (missionId, reward, title, milestoneId) => {
    const effectiveUid = userId || 'guest';
    if (milestoneId) {
      const updated = saveClaimedMilestone(effectiveUid, milestoneId);
      setClaimedMilestones(updated);
    } else {
      const updated = { ...claimedMissions, [missionId]: true };
      setClaimedMissions(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`bds_claimed_missions_${effectiveUid}`, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('bds_claimed_missions_updated'));
        } catch (e) {}
      }
    }

    const amount = Number(reward || 0);

    // Cộng tiền trực tiếp vào Ví Khuyến Mãi của user
    const expiryDays = Number(systemConfig?.bonusExpiryDays) || 30;
    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Nhiệm vụ: ${title}`, {
        expiryDays
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Hệ thống nhiệm vụ</span>
        </nav>

        {/* Hero Header & Wallet Balance Card */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/10">
              <i className="fa-solid fa-list-check text-amber-400"></i>
              <span>Trung Tâm Nhiệm Vụ {brandName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Làm Nhiệm Vụ — Nhận Tiền Ví Khuyến Mãi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hoàn thành các nhiệm vụ bên dưới để nhận tiền thưởng <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong>. Dùng ngay để đăng tin và đẩy tin VIP hoàn toàn miễn phí.
            </p>
          </div>

          {/* User Bonus Wallet Box */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 shadow-lg lg:min-w-[380px]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Số dư Ví Khuyến Mãi</div>
                <div className="text-2xl font-black text-amber-400 font-mono tracking-tight tabular-nums">
                  +{localBonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white font-sans">VNĐ</span>
                </div>
                {expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate ? (
                  <div className="text-[11px] text-amber-200/90 font-medium flex items-center gap-1.5 mt-0.5">
                    <i className="fa-solid fa-hourglass-half text-amber-400 animate-pulse text-[10px]"></i>
                    <span>Có {Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ hết hạn {expiringBonusInfo.formattedDate}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <i className="fa-solid fa-shield-halved text-emerald-400 text-[10px]"></i>
                    <span>Hạn dùng {Number(systemConfig?.bonusExpiryDays) || 30} ngày/lần nhận</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              <Link
                to="/dang-tin"
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Đăng tin bằng ví</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
              <button
                type="button"
                onClick={() => setShowAffiliateModal(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer border border-slate-600"
              >
                <i className="fa-solid fa-share-nodes text-blue-400"></i>
                <span>Mời bạn bè</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base shrink-0 font-bold">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Tổng nhiệm vụ</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">{missionStats.total} nhiệm vụ</div>
            </div>
          </div>

          <div className={`rounded-2xl p-4 border shadow-xs flex items-center gap-3 transition-all ${
            missionStats.claimable > 0 
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200 shadow-emerald-100' 
              : 'bg-white border-slate-200/80'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 font-bold ${
              missionStats.claimable > 0 ? 'bg-emerald-600 text-white animate-bounce' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Chờ nhận thưởng</div>
              <div className={`text-base sm:text-lg font-black font-mono ${missionStats.claimable > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                {missionStats.claimable} nhiệm vụ
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base shrink-0 font-bold">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Đã hoàn thành</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {missionStats.claimed}/{missionStats.total}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setShowAffiliateModal(true)}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3 cursor-pointer hover:border-blue-300 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base shrink-0 font-bold group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Chiêu mộ (Affiliate)</div>
              <div className="text-base sm:text-lg font-black text-blue-700 font-mono">{realRefSuccess} bạn đạt chuẩn</div>
            </div>
          </div>
        </div>

        {/* Category Tabs & Subtitle */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-xs ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-blue-200'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <i className={`${cat.icon} text-xs`}></i>
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tự động sắp xếp: Nhiệm vụ sẵn sàng nhận tiền luôn ưu tiên hiển thị đầu tiên</span>
          </div>
        </div>

        {/* Missions Grid (Responsive 2-column layout on Desktop, streamlined cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedMissions.map(m => {
            const isClaimed = m.dynamicStatus === 'claimed';
            const isClaimable = m.dynamicStatus === 'claimable';

            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isClaimable
                    ? 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-emerald-300 ring-2 ring-emerald-200/80 shadow-md'
                    : isClaimed
                    ? 'bg-slate-50/80 border-slate-200/70 opacity-75'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                    isClaimable
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : isClaimed
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-blue-50 text-blue-600 border border-blue-100 shadow-inner'
                  }`}>
                    <i className={m.icon || 'fa-solid fa-gift'}></i>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {m.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono shrink-0">
                        <i className="fa-solid fa-money-bill-wave text-emerald-700 text-[10px]"></i>
                        +{Number(m.reward || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {m.description}
                    </p>

                    {/* Dynamic Progress bar if present */}
                    {m.dynamicProgress && (
                      <div className="pt-1 flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isClaimable ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(100, (m.dynamicProgress.current / m.dynamicProgress.total) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 font-mono shrink-0">
                          {m.dynamicProgress.current}/{m.dynamicProgress.total}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    {isClaimable ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Đã đạt điều kiện nhận tiền
                      </span>
                    ) : isClaimed ? (
                      <span className="text-slate-400 flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-emerald-600"></i>
                        Đã cộng vào Ví Khuyến Mãi
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <i className="fa-regular fa-clock text-blue-500"></i>
                        Đang thực hiện
                      </span>
                    )}
                  </div>

                  <div>
                    {isClaimed ? (
                      <button
                        disabled
                        className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                      >
                        <i className="fa-solid fa-check text-emerald-600"></i>
                        <span>Đã nhận</span>
                      </button>
                    ) : isClaimable ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(m.id, m.reward, m.title, m.currentMilestoneId)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-1.5 active:scale-95 animate-pulse"
                      >
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                        <span>Nhận +{Number(m.reward || 0).toLocaleString('vi-VN')}đ</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActionClick(m)}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Thực hiện</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Hộp thoại Giới thiệu bạn bè (Affiliate Modal) */}
      {showAffiliateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 my-8">
            {/* Nút đóng */}
            <button
              onClick={() => setShowAffiliateModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Chương trình Affiliate & Chiêu Mộ
                </span>
                <h3 className="text-lg font-black text-slate-900">Chinh Phục Các Mốc Thưởng Chiêu Mộ</h3>
              </div>
            </div>

            {/* Overview Progress Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">Tiến độ bạn bè đạt chuẩn: </span>
                  <span className="text-xs font-black text-blue-700 font-mono">
                    {realRefSuccess} bạn bè
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1.5">(Tổng đã mời: {totalReferred})</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {allMilestonesClaimed
                    ? '🎉 Đã nhận toàn bộ các mốc!'
                    : `Đã mở khóa: ${activeMilestones.filter(m => Boolean(claimedMilestones[m.id])).length}/${activeMilestones.length} mốc`}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                <span>🎁 Tiền thưởng: <strong>Cộng trực tiếp vào Ví KM</strong> (hạn {Number(systemConfig?.bonusExpiryDays) || 30} ngày)</span>
                <span className="text-[10px] text-slate-500 italic">Chuẩn: Kích hoạt + tin đăng / eKYC / nạp tiền</span>
              </div>
            </div>

            {/* Danh sách các Mốc Thưởng Từng Mốc (Interactive Milestone Track) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5 tracking-wider">
                  <i className="fa-solid fa-trophy text-amber-500"></i>
                  <span>Thưởng Từng Mốc Chiêu Mộ</span>
                </h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Nhận thưởng riêng theo từng mốc
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeMilestones.map((m, idx) => {
                  const isClaimed = Boolean(claimedMilestones[m.id]);
                  const isReached = realRefSuccess >= Number(m.target);
                  const isClaimable = isReached && !isClaimed;

                  return (
                    <div
                      key={m.id || idx}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isClaimed
                          ? 'bg-slate-50 border-slate-200/80 opacity-80'
                          : isClaimable
                          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-300 shadow-sm ring-1 ring-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isClaimed
                            ? 'bg-emerald-100 text-emerald-700'
                            : isClaimable
                            ? 'bg-emerald-600 text-white shadow-xs animate-bounce'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isClaimed ? (
                            <i className="fa-solid fa-check"></i>
                          ) : (
                            <span>#{idx + 1}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {m.label || `Mốc ${idx + 1}: Kết nối ${m.target} bạn bè`}
                            </span>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">
                              +{Number(m.reward).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>Mục tiêu: <strong>{m.target} bạn đạt chuẩn</strong></span>
                            <span>•</span>
                            <span className={isClaimed ? 'text-slate-400' : isReached ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                              {isClaimed ? 'Đã nhận thưởng' : isReached ? 'Đã đủ điều kiện nhận!' : `Còn thiếu ${Math.max(0, m.target - realRefSuccess)} bạn`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>Đã nhận</span>
                          </span>
                        ) : isClaimable ? (
                          <button
                            type="button"
                            onClick={() => handleClaimMilestone(m)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <i className="fa-solid fa-gift"></i>
                            <span>Nhận +{Number(m.reward).toLocaleString('vi-VN')}đ</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <i className="fa-solid fa-lock text-[10px]"></i>
                            <span>{realRefSuccess}/{m.target}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Share Commission Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div className="text-[11px] text-emerald-950 leading-snug">
                <div className="font-black text-emerald-800">Hoa hồng nạp tiền {systemConfig?.affiliateCommissionRate || 7}%</div>
                <div className="text-emerald-700">Mỗi khi bạn bè nạp tiền mua gói VIP hoặc đẩy tin, bạn nhận ngay {systemConfig?.affiliateCommissionRate || 7}% hoa hồng tiền mặt vào Ví Chính.</div>
              </div>
            </div>

            {/* Referral Code & Referral Link */}
            <div className="space-y-3">
              {/* Mã giới thiệu */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1.5">
                  Mã giới thiệu của bạn
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={userRefCode || 'Chưa cập nhật'}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl outline-none"
                  />
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard && userRefCode) {
                        navigator.clipboard.writeText(userRefCode);
                        if (showToast) showToast('Đã sao chép mã giới thiệu!', 'success');
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i className="fa-regular fa-copy"></i>
                    <span>Sao chép mã</span>
                  </button>
                </div>
              </div>

              {/* Link giới thiệu */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 mb-1.5">
                  Đường dẫn giới thiệu riêng (1 chạm mở trang đăng ký)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateLink}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3.5 py-2.5 rounded-xl outline-none truncate font-mono"
                  />
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(affiliateLink);
                        if (showToast) showToast('Đã sao chép link giới thiệu vào bộ nhớ tạm!', 'success');
                      }
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                  >
                    <i className="fa-solid fa-link"></i>
                    <span>Sao chép link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Nút chia sẻ nhanh qua Zalo & Facebook */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-600">
                Chia sẻ nhanh
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    const shareMsg = `Tham gia sàn Bất Động Sản cùng mình nhé! Đăng ký nhận ngay quà tặng vào Ví Khuyến Mãi để đăng tin VIP miễn phí: ${affiliateLink}`;
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(shareMsg);
                      if (showToast) showToast('Đã copy lời mời kèm link! Hãy dán vào Zalo để gửi cho bạn bè nhé!', 'success');
                    }
                    window.open(`https://zalo.me/share?url=${encodeURIComponent(affiliateLink)}`, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <i className="fa-solid fa-comment-dots"></i>
                  <span>Gửi qua Zalo</span>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLink)}`, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                  <span>Chia sẻ Facebook</span>
                </button>
              </div>
            </div>

            {/* Danh sách bạn bè đã tham gia */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Bạn bè đã tham gia ({totalReferred} người, {realRefSuccess} đạt chuẩn)</span>
                <span className="text-emerald-600 text-[11px]">
                  {allMilestonesClaimed
                    ? '🎉 Đã chinh phục tất cả mốc!'
                    : `Mốc tiếp theo: ${currentMilestone?.target || 0} bạn (cần thêm ${Math.max(0, (currentMilestone?.target || 0) - realRefSuccess)} bạn)`}
                </span>
              </div>
              {referredFriends.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {referredFriends.map((f, idx) => (
                    <div key={f.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 ${f.isQualified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{f.name || 'Người dùng mới'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {f.phone ? f.phone.slice(0, 4) + '***' + f.phone.slice(-3) : f.email ? f.email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Tài khoản'}
                            {f.userListingsCount > 0 ? ` • ${f.userListingsCount} tin đăng` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {f.isQualified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <i className="fa-solid fa-circle-check text-emerald-600"></i>
                            <span>Đạt chuẩn</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <i className="fa-regular fa-clock text-amber-500"></i>
                            <span>Chờ tin/KYC</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Chưa có người bạn nào đăng ký qua mã của bạn. Hãy gửi link trên để mời đồng nghiệp ngay!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
