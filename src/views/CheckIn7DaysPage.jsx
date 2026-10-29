'use client';

import React, { useState, useEffect } from 'react';
import { CHECK_IN_7_DAYS } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function CheckIn7DaysPage() {
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig,
    systemConfig 
  } = useRealEstate();
  const { navigate } = useRouter();

  const daysList = rewardsConfig?.checkInConfig?.days || CHECK_IN_7_DAYS;
  const isEnabled = rewardsConfig?.checkInConfig?.enabled !== false;
  const totalWeekly = daysList.reduce((acc, d) => acc + Number(d.reward || 0), 0);

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
  const [currentStreak, setCurrentStreak] = useState(1);
  const [checkedToday, setCheckedToday] = useState(false);

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
  }, [userId]);

  const handleCheckIn = () => {
    if (checkedToday || !isEnabled) return;
    if (!currentUser || currentUser.role === 'guest') {
      if (showToast) showToast('Vui lòng đăng nhập để nhận tiền thưởng điểm danh vào Ví KM!', 'info');
      navigate('/dang-nhap');
      return;
    }

    const todayStr = new Date().toDateString();
    let nextStreak = checkedToday ? currentStreak : (currentStreak >= 7 ? 1 : currentStreak + 1);
    const lastDate = localStorage.getItem(`bds_checkin_last_date_${userId}`);
    if (!lastDate) {
      nextStreak = 1;
    }

    setCurrentStreak(nextStreak);
    setCheckedToday(true);
    localStorage.setItem(`bds_checkin_last_date_${userId}`, todayStr);
    localStorage.setItem(`bds_checkin_streak_${userId}`, String(nextStreak));

    const item = daysList[nextStreak - 1] || { reward: 5000 };
    const amount = Number(item.reward || 5000);

    // Cộng tiền trực tiếp vào Ví Khuyến Mãi của người dùng
    if (addBonusWalletBalance) {
      addBonusWalletBalance(amount, `Điểm danh Ngày ${nextStreak}`);
    }

    if (showToast) {
      showToast(`🎉 Điểm danh Ngày ${nextStreak} thành công! Đã cộng trực tiếp +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi!`, 'success');
    }
  };

  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Bất Động Sản';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Điểm danh 7 ngày</span>
        </nav>

        {/* Header Card with Real-time Ví Khuyến Mãi */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Điểm Danh Nhận Tiền Vào Ví Khuyến Mãi
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Không cần tích điểm. Tiền thưởng được cộng <strong>trực tiếp vào Ví Khuyến Mãi</strong> mỗi ngày để bạn sử dụng đăng tin và đẩy tin VIP trên {brandName} ngay lập tức.
          </p>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <i className="fa-solid fa-wallet text-amber-600 text-base"></i>
            <span className="text-xs font-bold">Ví Khuyến Mãi của bạn:</span>
            <span className="font-mono text-base font-black text-amber-700">
              +{bonusBal.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        {/* Check-In 7 Days Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-lg font-black text-slate-900">
                  Chu Kỳ 7 Ngày Liên Tục
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng giá trị chu kỳ tuần này: <strong className="text-emerald-600 font-bold">+{totalWeekly.toLocaleString('vi-VN')}đ</strong> vào Ví KM.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              Chuỗi hiện tại: Ngày {currentStreak}/7
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {daysList.map((item, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < currentStreak || (dayNum === currentStreak && checkedToday);
              const isCurrent = dayNum === currentStreak && !checkedToday;
              const isSpecialDay = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`relative p-4 rounded-2xl border text-center transition-all ${
                    isPast
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md scale-103'
                      : isSpecialDay
                      ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider mb-2">
                    Ngày {dayNum}
                  </div>
                  <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-base font-black mb-2 bg-white shadow-xs">
                    {isPast ? (
                      <i className="fa-solid fa-check text-emerald-600 text-lg"></i>
                    ) : isSpecialDay ? (
                      <i className="fa-solid fa-crown text-purple-600 text-lg"></i>
                    ) : (
                      <i className="fa-solid fa-gift text-amber-500"></i>
                    )}
                  </div>
                  <div className="text-xs font-black font-mono">
                    +{Number(item.reward || 0).toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-1">
                    {item.note || 'Ví KM'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2 text-center">
            <button
              disabled={checkedToday || !isEnabled}
              onClick={handleCheckIn}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer ${
                checkedToday
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                  : !isEnabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 animate-pulse hover:scale-102'
              }`}
            >
              <i className={`fa-solid ${checkedToday ? 'fa-circle-check text-base' : 'fa-calendar-check text-base'}`}></i>
              <span>{checkedToday ? '✅ Bạn đã điểm danh hôm nay (Quay lại vào ngày mai)' : `Điểm danh Ngày ${currentStreak} nhận +${Number(daysList[currentStreak - 1]?.reward || 5000).toLocaleString('vi-VN')}đ ngay`}</span>
            </button>
          </div>
        </div>

        {/* Benefits Explain */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">Cộng tiền trực tiếp</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Không dùng xu hay điểm thưởng. Tiền vào thẳng Ví Khuyến Mãi.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">Đẩy tin 400đ</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1 ngày điểm danh đủ tiền để đẩy tin lên Top đầu 10-25 lần.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-gem"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">Thưởng lớn ngày 7</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Duy trì trọn vẹn 7 ngày nhận phần thưởng cao nhất tuần.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
