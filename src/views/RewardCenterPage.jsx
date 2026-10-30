'use client';

import React, { useState, useEffect } from 'react';
import { CHECK_IN_7_DAYS, PROMOTIONS_DATA, MISSIONS_DATA, PRICE_PREDICTION_GAMES, isPromotionExpired, formatPromoDate } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyClaims } from '../services/treasureHuntService';
import { getCheckInStatus, executeCheckIn } from '../services/checkInService';

export default function RewardCenterPage() {
  const { 
    currentUser, 
    systemConfig, 
    rewardsConfig, 
    showToast, 
    addBonusWalletBalance,
    properties,
    setActiveModal
  } = useRealEstate();
  const { navigate } = useRouter();

  const isLoggedIn = Boolean(currentUser && currentUser.role !== 'guest' && currentUser.id);
  const userId = isLoggedIn ? currentUser.id : 'guest';
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);

  // 1. Dữ liệu động từ rewardsConfig (quản trị CMS)
  const tConfig = rewardsConfig?.treasureHuntConfig;
  const minTreasure = Number(tConfig?.minAmount || 2000);
  const maxTreasure = Number(tConfig?.maxAmount || 20000);
  const dailyLimitTreasure = Number(tConfig?.dailyLimit || 3);

  const checkInDays = rewardsConfig?.checkInConfig?.days || CHECK_IN_7_DAYS;
  const isCheckInEnabled = rewardsConfig?.checkInConfig?.enabled !== false;
  const totalWeeklyCheckin = checkInDays.reduce((acc, d) => acc + Number(d.reward || 0), 0);

  const promoList = (rewardsConfig?.promotions || PROMOTIONS_DATA).slice(0, 3);
  const allMissions = rewardsConfig?.missions || MISSIONS_DATA;
  const hotMissions = [
    ...(allMissions['hang-ngay'] || []),
    ...(allMissions['tan-thu'] || [])
  ].slice(0, 3);

  // 2. Trạng thái Điểm Danh trực tiếp (Chuẩn hóa từ checkInService)
  const [currentStreak, setCurrentStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [isMissed, setIsMissed] = useState(false);
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [claimedMissions, setClaimedMissions] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncCheckInStatus = () => {
      if (isLoggedIn) {
        const status = getCheckInStatus(currentUser.id);
        setCurrentStreak(status.streak);
        setCheckedToday(status.checkedToday);
        setIsMissed(Boolean(status.isMissed));
      } else {
        setCurrentStreak(0);
        setCheckedToday(false);
        setIsMissed(false);
      }
    };

    syncCheckInStatus();
    window.addEventListener('bds_checkin_updated', syncCheckInStatus);
    window.addEventListener('storage', syncCheckInStatus);
    return () => {
      window.removeEventListener('bds_checkin_updated', syncCheckInStatus);
      window.removeEventListener('storage', syncCheckInStatus);
    };
  }, [currentUser?.id, isLoggedIn]);

  // Lấy dữ liệu gói tiền có hạn gần nhất được truyền từ API về
  useEffect(() => {
    // 1. Kiểm tra LocalStorage ngay lập tức (kể cả guest hoặc khi API chưa phản hồi)
    try {
      const cachedExp = localStorage.getItem(`bds_user_bonus_exp_${userId}`);
      if (cachedExp) {
        const parsed = JSON.parse(cachedExp);
        if (parsed?.amount && parsed?.formattedDate) {
          setExpiringBonusInfo(parsed);
        }
      }
    } catch (e) {}

    if (currentUser?.earliestExpiringBonus?.amount && currentUser?.earliestExpiringBonus?.expiresAt) {
      const expDate = new Date(currentUser.earliestExpiringBonus.expiresAt);
      setExpiringBonusInfo({
        amount: Number(currentUser.earliestExpiringBonus.amount),
        expiresAt: currentUser.earliestExpiringBonus.expiresAt,
        formattedDate: currentUser.earliestExpiringBonus.formattedDate || expDate.toLocaleDateString('vi-VN')
      });
    }

    if (!isLoggedIn || !currentUser?.id) {
      return;
    }

    const fetchExpiringBonus = async () => {
      try {
        const res = await fetch(`/api/wallet/expiring-bonus?userId=${currentUser.id}`);
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
    window.addEventListener('bds_bonus_wallet_updated', fetchExpiringBonus);
    return () => {
      window.removeEventListener('bds_bonus_wallet_updated', fetchExpiringBonus);
    };
  }, [currentUser?.id, isLoggedIn, currentUser?.bonusWalletBalance, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadClaims = () => {
      try {
        const savedClaims = localStorage.getItem(`bds_claimed_missions_${userId}`);
        if (savedClaims) {
          setClaimedMissions(JSON.parse(savedClaims));
        }
      } catch (e) {}
    };
    loadClaims();
    window.addEventListener('bds_claimed_missions_updated', loadClaims);
    window.addEventListener('bds_rewards_config_updated', loadClaims);
    window.addEventListener('storage', loadClaims);
    return () => {
      window.removeEventListener('bds_claimed_missions_updated', loadClaims);
      window.removeEventListener('bds_rewards_config_updated', loadClaims);
      window.removeEventListener('storage', loadClaims);
    };
  }, [userId]);

  // Thao tác Điểm danh ngay trên Trung Tâm Phần Thưởng
  const handleQuickCheckIn = () => {
    // 1. Bắt buộc đăng nhập mới có thể điểm danh
    if (!isLoggedIn) {
      if (showToast) showToast('Vui lòng đăng nhập tài khoản để điểm danh nhận tiền vào Ví Khuyến Mãi!', 'warning');
      if (setActiveModal) {
        setActiveModal('auth');
      } else {
        navigate('/dang-nhap');
      }
      return;
    }

    if (checkedToday || !isCheckInEnabled) return;

    // 2. Thực hiện điểm danh đúng ngày trong chuỗi (tuyệt đối không nhảy số)
    const expiryDays = Number(systemConfig?.bonusExpiryDays) || 30;
    const res = executeCheckIn(currentUser, checkInDays, expiryDays);
    if (!res.success) {
      if (showToast) showToast(res.message, 'warning');
      return;
    }

    setCurrentStreak(res.streak);
    setCheckedToday(true);
    setIsMissed(false);

    // Cập nhật gói sắp hết hạn ngay lập tức
    setExpiringBonusInfo({
      amount: res.reward,
      expiresAt: res.expiresAt,
      formattedDate: res.formattedExpiryDate
    });

    if (addBonusWalletBalance) {
      addBonusWalletBalance(res.reward, `Điểm danh ${res.dayLabel} (Trung tâm phần thưởng)`, {
        expiryDays,
        expiresAt: res.expiresAt
      });
    }

    if (showToast) {
      showToast(res.message, 'success');
    }
  };

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (showToast) showToast(`Đã sao chép mã ưu đãi ${code}!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClaimMission = (mId, reward, title) => {
    const effectiveUid = userId || 'guest';
    const updated = { ...claimedMissions, [mId]: true };
    setClaimedMissions(updated);
    try {
      localStorage.setItem(`bds_claimed_missions_${effectiveUid}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('bds_claimed_missions_updated'));
    } catch (e) {}

    const amount = Number(reward || 0);
    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Nhiệm vụ: ${title}`);
    }
    if (showToast) {
      showToast(`🎉 Đã cộng +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi!`, 'success');
    }
  };

  // 4 Trụ Cột Tính Năng (Tự động cập nhật số liệu động theo cấu hình)
  const features = [
    {
      id: 'diem-danh',
      title: 'Điểm Danh 7 Ngày',
      description: `Đăng nhập mỗi ngày nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi lên đến ${totalWeeklyCheckin.toLocaleString('vi-VN')}đ/tuần.`,
      icon: 'fa-solid fa-calendar-check',
      color: 'from-amber-500 to-orange-500',
      badge: `+${totalWeeklyCheckin.toLocaleString('vi-VN')}đ/tuần`,
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'kho-bau',
      title: 'Săn Kho Báu BĐS',
      description: `Mở rương bài viết tin rao nhận ngẫu nhiên ${minTreasure.toLocaleString('vi-VN')}đ - ${maxTreasure.toLocaleString('vi-VN')}đ cộng trực tiếp vào Ví KM (Tối đa ${dailyLimitTreasure} hộp/ngày).`,
      icon: 'fa-solid fa-gem',
      color: 'from-emerald-500 to-teal-600',
      badge: `${minTreasure.toLocaleString('vi-VN')}đ - ${maxTreasure.toLocaleString('vi-VN')}đ`,
      link: '/trung-tam-phan-thuong/san-kho-bau-bds/'
    },
    {
      id: 'du-doan',
      title: 'Dự Đoán Giá BĐS',
      description: 'Trổ tài thẩm định giá thị trường các căn hộ, biệt thự để chia quỹ thưởng tiền mặt hàng triệu đồng.',
      icon: 'fa-solid fa-chart-line',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Quỹ thưởng tiền mặt',
      link: '/trung-tam-phan-thuong/du-doan-gia-bds/'
    },
    {
      id: 'doi-qua',
      title: 'Đặc Quyền Ví Khuyến Mãi',
      description: 'Sử dụng tiền trong Ví Khuyến Mãi để đăng tin thường miễn phí (0đ), mua lượt đẩy tin 400đ và nâng cấp tin VIP.',
      icon: 'fa-solid fa-wallet',
      color: 'from-rose-500 to-pink-600',
      badge: 'Dùng ngay 0đ',
      link: '/trung-tam-phan-thuong/doi-qua/'
    }
  ];

  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Bất Động Sản';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Trung tâm phần thưởng</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-900 text-white p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
              <i className="fa-solid fa-trophy"></i>
              Khu Vực Tương Tác & Tiền Thưởng Ví Khuyến Mãi
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              Trung Tâm Phần Thưởng {brandName}
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Nhận tiền thưởng <strong>cộng trực tiếp vào Ví Khuyến Mãi</strong> qua Điểm danh mỗi ngày, Săn rương bài viết và Dự đoán giá thị trường. Sử dụng để đăng tin và đẩy tin VIP hoàn toàn miễn phí.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70">Số dư Ví Khuyến Mãi của bạn</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
                </div>
                {/* Dòng cảnh báo nhỏ kèm icon đồng hồ cát */}
                <div className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <i className="fa-solid fa-hourglass-half text-amber-300 animate-pulse"></i>
                  <span>
                    {bonusBal > 0 && expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate
                      ? `(Có ${Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${expiringBonusInfo.formattedDate})`
                      : bonusBal > 0
                      ? `(Có ${bonusBal.toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${new Date(Date.now() + (Number(systemConfig?.bonusExpiryDays) || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')})`
                      : `(Hạn dùng tiền thưởng ${Number(systemConfig?.bonusExpiryDays) || 30} ngày kể từ ngày nhận)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/nhiem-vu/"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-2"
              >
                <i className="fa-solid fa-list-check"></i>
                <span>Nhiệm vụ nhận tiền</span>
              </Link>
              <Link
                to="/dang-tin"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-md"
              >
                <i className="fa-solid fa-circle-plus"></i>
                <span>Đăng tin bằng Ví KM</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 1. WIDGET ĐIỂM DANH 7 NGÀY TRỰC TIẾP (DỰA THEO CẤU HÌNH CMS) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-lg font-black text-slate-900">
                  Chuỗi Điểm Danh 7 Ngày Nhận Thưởng
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Đăng nhập điểm danh mỗi ngày để tích lũy lên tới <strong className="text-emerald-600 font-bold">{totalWeeklyCheckin.toLocaleString('vi-VN')}đ</strong> vào Ví Khuyến Mãi (Hạn dùng {Number(systemConfig?.bonusExpiryDays) || 30} ngày/lần nhận, bỏ lỡ 1 ngày sẽ quay lại Ngày 1).
              </p>
              {isMissed && !checkedToday && (
                <div className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  <i className="fa-solid fa-clock-rotate-left text-rose-600"></i>
                  <span>Bạn đã bỏ lỡ ngày hôm qua! Chuỗi điểm danh quay lại từ Ngày 1.</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={isLoggedIn && checkedToday}
                onClick={handleQuickCheckIn}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                  !isLoggedIn
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-200'
                    : checkedToday 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 cursor-default font-semibold'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-200 hover:scale-102'
                }`}
              >
                <i className={`fa-solid ${!isLoggedIn ? 'fa-arrow-right-to-bracket' : checkedToday ? 'fa-circle-check text-emerald-600' : 'fa-calendar-check'}`}></i>
                <span>
                  {!isLoggedIn 
                    ? 'Đăng nhập để điểm danh' 
                    : checkedToday 
                    ? 'Đã điểm danh hôm nay' 
                    : 'Điểm danh nhận tiền ngay'}
                </span>
              </button>
              <Link
                to="/trung-tam-phan-thuong/diem-danh-7-ngay/"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Chi tiết &rarr;
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {checkInDays.map((d, idx) => {
              const dayNum = idx + 1;
              const isChecked = dayNum <= currentStreak;
              const isCurrent = !checkedToday && dayNum === (currentStreak + 1);

              return (
                <div
                  key={dayNum}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md scale-102 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 opacity-75'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <span>Ngày {dayNum}</span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-black mb-1 bg-white shadow-xs">
                    {isChecked ? (
                      <i className="fa-solid fa-check text-emerald-600 text-base"></i>
                    ) : isCurrent ? (
                      <i className="fa-solid fa-hand-holding-dollar text-amber-500 text-base"></i>
                    ) : (
                      <i className="fa-solid fa-gift text-slate-400"></i>
                    )}
                  </div>
                  <div className="text-xs font-black font-mono">
                    +{Number(d.reward || 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CÁC KHU VỰC THƯỞNG CHÍNH (4 Cards) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-cubes text-indigo-600"></i>
              Danh Mục Tính Năng Tương Tác
            </h2>
            <span className="text-xs text-slate-500">Cập nhật trực tiếp theo thời gian thực</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(f => (
              <Link
                key={f.id}
                to={f.link}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                      <i className={f.icon}></i>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {f.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Khám phá ngay</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. KHUYẾN MÃI ĐANG DIỄN RA (ĐỒNG BỘ TỪ REWARDS CONFIG) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-tags text-rose-500"></i>
                Chương Trình Khuyến Mãi Mới Nhất
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Voucher nạp tiền và chiết khấu gói tin VIP đang hoạt động trên hệ thống.
              </p>
            </div>
            <Link
              to="/khuyen-mai/"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition flex items-center gap-1"
            >
              <span>Xem tất cả ({rewardsConfig?.promotions?.length || promoList.length})</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {promoList.map(promo => {
              const isExpired = isPromotionExpired(promo);

              return (
                <div
                  key={promo.id}
                  className={`rounded-2xl border ${
                    isExpired ? 'border-slate-300 bg-slate-50/70' : 'border-slate-200 hover:border-rose-400'
                  } overflow-hidden hover:shadow-md transition flex flex-col justify-between`}
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={promo.thumbnail} 
                        alt={promo.title} 
                        className={`w-full h-full object-cover ${isExpired ? 'grayscale contrast-75' : ''}`} 
                      />
                      <span className={`absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isExpired ? 'bg-slate-700 text-slate-200 opacity-90' : (promo.badgeColor || 'bg-red-500 text-white')
                      }`}>
                        {promo.badge}
                      </span>
                      {isExpired && (
                        <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-md flex items-center gap-1">
                          <i className="fa-solid fa-clock-rotate-left"></i>
                          <span>Hết hạn</span>
                        </span>
                      )}
                      <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                        isExpired ? 'bg-rose-950/90 text-rose-200 border border-rose-800' : 'bg-black/60 text-white'
                      }`}>
                        {isExpired ? `Hết hạn: ${formatPromoDate(promo.validUntil)}` : `Hạn dùng: ${formatPromoDate(promo.validUntil)}`}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className={`text-[10px] font-bold uppercase flex items-center justify-between ${isExpired ? 'text-slate-400' : 'text-rose-600'}`}>
                        <span>{promo.categoryLabel}</span>
                        {isExpired && <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">Đã kết thúc</span>}
                      </div>
                      <div className={`text-xs font-bold line-clamp-2 ${isExpired ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {promo.title}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-2">
                    <div className={`flex items-center justify-between p-2 rounded-xl border border-dashed ${
                      isExpired ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <span className={`font-mono text-xs font-black ${isExpired ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {promo.discountCode}
                      </span>
                      {isExpired ? (
                        <span className="text-[10px] font-bold text-slate-400">
                          Đã hết hạn
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleCopyCode(promo.discountCode, e)}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          {copiedCode === promo.discountCode ? 'Đã chép' : 'Sao chép'}
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/khuyen-mai/${promo.slug}/`}
                      className={`block text-center py-2 text-[11px] font-bold rounded-xl transition ${
                        isExpired ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-900 hover:bg-rose-600 text-white'
                      }`}
                    >
                      {isExpired ? 'Xem Thể Lệ (Đã Hết Hạn)' : 'Xem chi tiết & Thể lệ'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. NHIỆM VỤ NỔI BẬT NHẬN THƯỞNG VÀO VÍ KM */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-600"></i>
                Nhiệm Vụ Nhận Tiền Tươi Vào Ví Khuyến Mãi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hoàn thành nhiệm vụ nhận tiền thưởng cộng trực tiếp vào ví để đăng tin ngay.
              </p>
            </div>
            <Link
              to="/nhiem-vu/"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
            >
              <span>Xem tất cả nhiệm vụ</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="space-y-3">
            {hotMissions.map(m => {
              const isClaimed = claimedMissions[m.id];
              return (
                <div
                  key={m.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-lg">
                      <i className={m.icon}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{m.title}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          +{Number(m.reward || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <i className="fa-solid fa-check"></i> Đã nhận vào Ví KM
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimMission(m.id, m.reward, m.title)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Nhận +{Number(m.reward || 0).toLocaleString('vi-VN')}đ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
