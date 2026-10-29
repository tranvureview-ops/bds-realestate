'use client';

import React, { useState, useEffect } from 'react';
import { MISSIONS_DATA } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyClaims } from '../services/treasureHuntService';

export default function MissionHubPage({ initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [claimedMissions, setClaimedMissions] = useState({});
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig, 
    systemConfig,
    properties 
  } = useRealEstate();
  const { navigate } = useRouter();

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
  const allMissions = rewardsConfig?.missions || MISSIONS_DATA;

  // Đồng bộ activeCategory khi url param initialCategory thay đổi
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

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
  const hasAvatar = Boolean(currentUser?.avatar && currentUser.avatar.trim() !== '' && !currentUser.avatar.includes('placeholder'));
  const isPhoneVerified = Boolean(currentUser?.isVerified || currentUser?.phone);
  const isKycVerified = Boolean(currentUser?.kycStatus === 'verified' || currentUser?.isVerified);
  
  // Đếm chính xác số bài viết mà user hiện tại đã đăng
  const userPropertiesCount = (properties || []).filter(p => {
    if (!currentUser?.id) return false;
    return (p.author?.id && p.author.id === currentUser.id) ||
           (p.userId && p.userId === currentUser.id) ||
           (p.authorId && p.authorId === currentUser.id);
  }).length;

  const isCheckedInToday = typeof window !== 'undefined' 
    ? (localStorage.getItem(`bds_checkin_last_date_${userId}`) === new Date().toDateString())
    : false;
  const treasureCountToday = typeof window !== 'undefined'
    ? getDailyClaims(userId).length
    : 0;
  const hasVotedPrediction = typeof window !== 'undefined'
    ? Boolean(localStorage.getItem(`bds_prediction_votes_${userId}`))
    : false;
  const streakDays = typeof window !== 'undefined'
    ? (Number(localStorage.getItem(`bds_checkin_streak_${userId}`)) || 1)
    : 1;

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
    // 8. Thành tựu 10 tin
    else if (m.id === 'm-ach-01' || m.title?.toLowerCase().includes('10 tin')) {
      dynamicProgress = { current: Math.min(userPropertiesCount, 10), total: 10 };
      dynamicStatus = userPropertiesCount >= 10 ? 'claimable' : 'in-progress';
    } 
    // 9. Thành tựu chuỗi 30 ngày
    else if (m.id === 'm-ach-02' || m.title?.toLowerCase().includes('30 ngày')) {
      dynamicProgress = { current: Math.min(streakDays, 30), total: 30 };
      dynamicStatus = streakDays >= 30 ? 'claimable' : 'in-progress';
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
      addBonusWalletBalance(amount, `Nhiệm vụ: ${title}`);
    }

    if (showToast) {
      showToast(`🎉 Chúc mừng! Đã cộng trực tiếp +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi của bạn!`, 'success');
    }
  };

  const handleTabClick = (catId) => {
    setActiveCategory(catId);
    const targetUrl = catId === 'all' ? '/nhiem-vu' : `/nhiem-vu/${catId}`;
    navigate(targetUrl);
  };

  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl shadow-lg">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Ví Khuyến Mãi của bạn</div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
                </div>
              </div>
            </div>

            <Link
              to="/dang-tin"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md whitespace-nowrap flex items-center gap-1.5"
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
