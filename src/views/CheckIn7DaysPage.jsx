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
  const [isMissed, setIsMissed] = useState(false);
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);

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

    // 2. Ưu tiên từ currentUser
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

    // 2. Điểm danh đúng ngày (tuyệt đối không nhảy cóc 2 ngày, nếu bỏ lỡ thì reset về ngày 1)
    const expiryDays = Number(systemConfig?.bonusExpiryDays) || 30;
    const res = executeCheckIn(currentUser, daysList, expiryDays);
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

    // Cộng tiền trực tiếp vào Ví Khuyến Mãi của người dùng kèm thời hạn theo cài đặt quản trị
    if (addBonusWalletBalance) {
      addBonusWalletBalance(res.reward, `Điểm danh ${res.dayLabel}`, {
        expiryDays,
        expiresAt: res.expiresAt
      });
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

          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
              <i className="fa-solid fa-wallet text-amber-600 text-base"></i>
              <span className="text-xs font-bold">Ví Khuyến Mãi của bạn:</span>
              <span className="font-mono text-base font-black text-amber-700">
                +{bonusBal.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            {/* Dòng cảnh báo nhỏ kèm icon đồng hồ cát */}
            <div className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-1.5 pt-0.5">
              <i className="fa-solid fa-hourglass-half text-amber-600 animate-pulse"></i>
              <span>
                {bonusBal > 0 && expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate
                  ? `(Có ${Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${expiringBonusInfo.formattedDate})`
                  : bonusBal > 0
                  ? `(Có ${bonusBal.toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')})`
                  : '(Tiền thưởng điểm danh có hạn sử dụng 30 ngày kể từ ngày nhận)'}
              </span>
            </div>
          </div>
        </div>

        {/* Banner cảnh báo nếu bỏ lỡ 1 ngày */}
        {isMissed && !checkedToday && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-rose-900 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-base">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <p className="font-bold text-rose-950">Chuỗi điểm danh đã quay lại từ Ngày 1!</p>
              <p className="text-rose-700 mt-0.5">
                Do bạn đã bỏ lỡ không điểm danh ngày hôm qua, chuỗi điểm danh 7 ngày liên tục được làm mới từ đầu. Hãy duy trì điểm danh mỗi ngày để tích lũy trọn vẹn tiền thưởng tuần nhé!
              </p>
            </div>
          </div>
        )}

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
            {isLoggedIn && checkedToday ? (
              <div className="inline-flex flex-col sm:flex-row items-center gap-3.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 text-emerald-950 shadow-sm mx-auto">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-base shadow-sm shrink-0">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-black text-emerald-950">
                    Bạn đã điểm danh thành công hôm nay!
                  </p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Hãy quay lại vào ngày mai để nhận tiếp <strong className="font-bold text-emerald-900">+{nextReward.toLocaleString('vi-VN')}đ</strong> (Ngày {nextDayToClaim})
                  </p>
                </div>
              </div>
            ) : (
              <button
                disabled={!isEnabled}
                onClick={handleCheckIn}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2.5 mx-auto shadow-lg cursor-pointer ${
                  !isLoggedIn
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-102'
                    : !isEnabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25 animate-pulse hover:scale-102'
                }`}
              >
                <i className={`fa-solid ${!isLoggedIn ? 'fa-arrow-right-to-bracket text-base' : 'fa-calendar-check text-base'}`}></i>
                <span>
                  {!isLoggedIn
                    ? 'Đăng nhập tài khoản để điểm danh'
                    : `Điểm danh Ngày ${nextDayToClaim} nhận +${nextReward.toLocaleString('vi-VN')}đ ngay`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Benefits Explain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-lg">
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase">Hạn dùng 30 ngày</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mỗi mốc thưởng có hạn 30 ngày kể từ ngày điểm danh, sau 30 ngày không dùng sẽ thu hồi.
            </p>
          </div>
        </div>

        {/* Notice on Rules */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <i className="fa-solid fa-circle-info text-amber-600 text-base mt-0.5"></i>
          <div className="space-y-1">
            <p className="font-bold text-amber-950">Quy định chuỗi điểm danh & Thời hạn tiền thưởng:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
              <li><strong>Bỏ lỡ ngày điểm danh:</strong> Nếu bạn bỏ lỡ bất kỳ 1 ngày nào mà không điểm danh, chuỗi tích lũy sẽ tự động quay lại từ Ngày 1.</li>
              <li><strong>Hạn sử dụng tiền thưởng:</strong> Tiền thưởng được cộng có hạn sử dụng đúng <strong>30 ngày</strong>. Sau 30 ngày nếu bạn chưa sử dụng để đăng tin hay đẩy tin VIP, hệ thống sẽ tự động thu hồi số tiền hết hạn đó.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
