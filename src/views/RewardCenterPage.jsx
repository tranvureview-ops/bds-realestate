'use client';

import React, { useState, useEffect } from 'react';
import { CHECK_IN_7_DAYS, PROMOTIONS_DATA, MISSIONS_DATA, PRICE_PREDICTION_GAMES } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getDailyClaims } from '../services/treasureHuntService';

export default function RewardCenterPage() {
  const { 
    currentUser, 
    systemConfig, 
    rewardsConfig, 
    showToast, 
    addBonusWalletBalance,
    properties 
  } = useRealEstate();
  const { navigate } = useRouter();

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
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

  // 2. Trạng thái Điểm Danh trực tiếp
  const [currentStreak, setCurrentStreak] = useState(1);
  const [checkedToday, setCheckedToday] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [claimedMissions, setClaimedMissions] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastDate = localStorage.getItem(`bds_checkin_last_date_${userId}`);
    const savedStreak = Number(localStorage.getItem(`bds_checkin_streak_${userId}`) || 0);
    const todayStr = new Date().toDateString();

    if (lastDate === todayStr) {
      setCheckedToday(true);
      setCurrentStreak(savedStreak || 1);
    } else if (lastDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        setCurrentStreak(savedStreak || 1);
      } else {
        setCurrentStreak(1);
      }
      setCheckedToday(false);
    } else {
      setCurrentStreak(1);
      setCheckedToday(false);
    }

    try {
      const savedClaims = localStorage.getItem(`bds_claimed_missions_${userId}`);
      if (savedClaims) {
        setClaimedMissions(JSON.parse(savedClaims));
      }
    } catch (e) {}
  }, [userId]);

  // Thao tác Điểm danh ngay trên Trung Tâm Phần Thưởng
  const handleQuickCheckIn = () => {
    if (checkedToday || !isCheckInEnabled) return;
    const effectiveUid = userId || 'guest';

    const todayStr = new Date().toDateString();
    const nextStreak = checkedToday ? currentStreak : (currentStreak >= 7 ? 1 : currentStreak + 1);

    setCurrentStreak(nextStreak);
    setCheckedToday(true);
    localStorage.setItem(`bds_checkin_last_date_${effectiveUid}`, todayStr);
    localStorage.setItem(`bds_checkin_streak_${effectiveUid}`, String(nextStreak));

    const item = checkInDays[nextStreak - 1] || { reward: 5000 };
    const amount = Number(item.reward || 5000);

    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Điểm danh Ngày ${nextStreak} (Trung tâm phần thưởng)`);
    }

    if (showToast) {
      showToast(`🎉 Điểm danh Ngày ${nextStreak} thành công! Đã cộng +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi!`, 'success');
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
    if (!currentUser || currentUser.role === 'guest') {
      if (showToast) showToast('Vui lòng đăng nhập để nhận thưởng!', 'info');
      navigate('/dang-nhap');
      return;
    }
    const updated = { ...claimedMissions, [mId]: true };
    setClaimedMissions(updated);
    try {
      localStorage.setItem(`bds_claimed_missions_${userId}`, JSON.stringify(updated));
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
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
                Đăng nhập điểm danh mỗi ngày để tích lũy lên tới <strong className="text-emerald-600 font-bold">{totalWeeklyCheckin.toLocaleString('vi-VN')}đ</strong> vào Ví Khuyến Mãi.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={checkedToday}
                onClick={handleQuickCheckIn}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                  checkedToday 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-200'
                }`}
              >
                <i className={`fa-solid ${checkedToday ? 'fa-check' : 'fa-calendar-check'}`}></i>
                <span>{checkedToday ? 'Đã điểm danh hôm nay' : 'Điểm danh nhận tiền ngay'}</span>
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
              const isPast = dayNum < currentStreak || (dayNum === currentStreak && checkedToday);
              const isCurrent = dayNum === currentStreak && !checkedToday;
              return (
                <div
                  key={dayNum}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md scale-102'
                      : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider mb-1">
                    Ngày {dayNum}
                  </div>
                  <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-black mb-1 bg-white shadow-xs">
                    {isPast ? (
                      <i className="fa-solid fa-check text-emerald-600"></i>
                    ) : (
                      <i className="fa-solid fa-gift text-amber-500"></i>
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
            {promoList.map(promo => (
              <div
                key={promo.id}
                className="rounded-2xl border border-slate-200 overflow-hidden hover:border-rose-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={promo.thumbnail} alt={promo.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${promo.badgeColor || 'bg-red-500 text-white'}`}>
                      {promo.badge}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="text-[10px] font-bold text-rose-600 uppercase">{promo.categoryLabel}</div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-2">{promo.title}</div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <span className="font-mono text-xs font-black text-slate-800">{promo.discountCode}</span>
                    <button
                      onClick={(e) => handleCopyCode(promo.discountCode, e)}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      {copiedCode === promo.discountCode ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                  <Link
                    to={`/khuyen-mai/${promo.slug}/`}
                    className="block text-center py-2 bg-slate-900 hover:bg-rose-600 text-white text-[11px] font-bold rounded-xl transition"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
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
