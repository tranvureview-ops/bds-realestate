'use client';

import React, { useState, useEffect } from 'react';
import { CHECK_IN_7_DAYS } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { getCheckInStatus, executeCheckIn } from '../services/checkInService';

export default function CheckIn7DaysPage() {
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig,
    systemConfig,
    setActiveModal
  } = useRealEstate();
  const { navigate } = useRouter();

  const daysList = rewardsConfig?.checkInConfig?.days || CHECK_IN_7_DAYS;
  const isEnabled = rewardsConfig?.checkInConfig?.enabled !== false;
  const totalWeekly = daysList.reduce((acc, d) => acc + Number(d.reward || 0), 0);

  const isLoggedIn = Boolean(currentUser && currentUser.role !== 'guest' && currentUser.id);
  const userId = isLoggedIn ? currentUser.id : 'guest';
  const [currentStreak, setCurrentStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncCheckInStatus = () => {
      if (isLoggedIn) {
        const status = getCheckInStatus(currentUser.id);
        setCurrentStreak(status.streak);
        setCheckedToday(status.checkedToday);
      } else {
        setCurrentStreak(0);
        setCheckedToday(false);
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

  const handleCheckIn = () => {
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

    if (checkedToday || !isEnabled) return;

    // 2. Điểm danh đúng ngày (tuyệt đối không nhảy cóc 2 ngày)
    const res = executeCheckIn(currentUser, daysList);
    if (!res.success) {
      if (showToast) showToast(res.message, 'warning');
      return;
    }

    setCurrentStreak(res.streak);
    setCheckedToday(true);

    // Cộng tiền trực tiếp vào Ví Khuyến Mãi của người dùng
    if (addBonusWalletBalance) {
      addBonusWalletBalance(res.reward, `Điểm danh ${res.dayLabel}`);
    }

    if (showToast) {
      showToast(res.message, 'success');
    }
  };

  const nextDayToClaim = checkedToday ? currentStreak : (currentStreak >= 7 ? 1 : currentStreak + 1);
  const nextReward = Number(daysList[nextDayToClaim - 1]?.reward || 5000);
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
              Chuỗi hiện tại: {currentStreak}/7 ngày {checkedToday ? '(Đã xong hôm nay)' : ''}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {daysList.map((item, idx) => {
              const dayNum = idx + 1;
              const isChecked = dayNum <= currentStreak;
              const isCurrent = !checkedToday && dayNum === (currentStreak + 1);
              const isSpecialDay = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`relative p-4 rounded-2xl border text-center transition-all ${
                    isChecked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                      : isCurrent
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-md scale-103 font-bold'
                      : isSpecialDay
                      ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500 opacity-75'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                    <span>Ngày {dayNum}</span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-base font-black mb-2 bg-white shadow-xs">
                    {isChecked ? (
                      <i className="fa-solid fa-check text-emerald-600 text-lg"></i>
                    ) : isCurrent ? (
                      <i className="fa-solid fa-hand-holding-dollar text-amber-500 text-lg"></i>
                    ) : isSpecialDay ? (
                      <i className="fa-solid fa-crown text-purple-600 text-lg"></i>
                    ) : (
                      <i className="fa-solid fa-gift text-slate-400"></i>
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
              disabled={(isLoggedIn && checkedToday) || !isEnabled}
              onClick={handleCheckIn}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer ${
                !isLoggedIn
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                  : checkedToday
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                  : !isEnabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 animate-pulse hover:scale-102'
              }`}
            >
              <i className={`fa-solid ${!isLoggedIn ? 'fa-arrow-right-to-bracket text-base' : checkedToday ? 'fa-circle-check text-base' : 'fa-calendar-check text-base'}`}></i>
              <span>
                {!isLoggedIn
                  ? 'Đăng nhập tài khoản để điểm danh'
                  : checkedToday
                  ? '✅ Bạn đã điểm danh hôm nay (Quay lại vào ngày mai)'
                  : `Điểm danh Ngày ${nextDayToClaim} nhận +${nextReward.toLocaleString('vi-VN')}đ ngay`}
              </span>
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
