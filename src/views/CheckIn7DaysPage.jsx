'use client';

import React, { useState, useEffect } from 'react';
import { CHECK_IN_7_DAYS } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function CheckIn7DaysPage() {
  const { currentUser, showToast, addBonusWalletBalance } = useRealEstate();
  const [currentStreak, setCurrentStreak] = useState(3);
  const [checkedToday, setCheckedToday] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bds_checkin_today');
    if (saved === new Date().toDateString()) {
      setCheckedToday(true);
    }
  }, []);

  const handleCheckIn = () => {
    if (checkedToday) return;
    const nextStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
    setCurrentStreak(nextStreak);
    setCheckedToday(true);
    localStorage.setItem('bds_checkin_today', new Date().toDateString());

    const item = CHECK_IN_7_DAYS[nextStreak - 1];
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    'name': 'Điểm Danh 7 Ngày Thưởng Tiền Vào Ví Khuyến Mãi',
    'description': 'Đăng nhập điểm danh mỗi ngày nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi để đăng tin và đẩy tin VIP.',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/diem-danh-7-ngay/'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Không cần tích điểm. Tiền thưởng được cộng <strong>trực tiếp vào Ví Khuyến Mãi</strong> mỗi ngày để bạn sử dụng đăng tin và đẩy tin VIP ngay lập tức.
          </p>

          {/* Real-time Ví Khuyến Mãi Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 font-bold text-xs sm:text-sm">
            <i className="fa-solid fa-wallet text-emerald-600"></i>
            <span>Số dư Ví Khuyến Mãi hiện tại:</span>
            <strong className="text-emerald-700 text-base font-black font-mono">
              +{bonusBal.toLocaleString('vi-VN')} đ
            </strong>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCheckIn}
              disabled={checkedToday}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm transition shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer ${
                checkedToday
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 scale-105 animate-bounce'
              }`}
            >
              <i className={`fa-solid ${checkedToday ? 'fa-circle-check' : 'fa-hand-pointer'}`}></i>
              <span>{checkedToday ? 'Đã nhận thưởng hôm nay' : 'Điểm danh nhận tiền (+Ví KM)'}</span>
            </button>
          </div>
        </div>

        {/* 7 Days Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {CHECK_IN_7_DAYS.map((item) => {
            const isCompleted = item.day <= currentStreak;
            const isCurrent = item.day === currentStreak + 1 && !checkedToday;

            return (
              <div
                key={item.day}
                className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs'
                    : isCurrent
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-200'
                    : 'bg-white border-slate-200 text-slate-400'
                } ${item.super ? 'sm:col-span-2 md:col-span-1 bg-gradient-to-b from-purple-50 to-emerald-50 border-purple-300' : ''}`}
              >
                {item.highlight && (
                  <span className="absolute top-1 right-1 text-[8px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                    HOT
                  </span>
                )}
                {item.super && (
                  <span className="absolute top-1 right-1 text-[8px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                    VIP
                  </span>
                )}

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-2">
                    Ngày {item.day}
                  </div>
                  <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-lg my-2 ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <i className={item.icon}></i>
                  </div>
                </div>

                <div className="mt-2">
                  <div className={`text-xs font-bold ${isCompleted ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {item.label}
                  </div>
                  <div className="mt-2 text-[10px]">
                    {isCompleted ? (
                      <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                        <i className="fa-solid fa-check"></i> Đã cộng ví
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa mở</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-600">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-blue-600"></i>
            Thể lệ nhận thưởng Ví Khuyến Mãi
          </h2>
          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Mỗi tài khoản được điểm danh 01 lần duy nhất trong ngày và tiền thưởng được cộng trực tiếp vào <strong>Ví Khuyến Mãi</strong>.</li>
            <li>Tiền trong Ví Khuyến Mãi được trừ tự động khi thanh toán đăng tin mới, gia hạn tin đăng hoặc mua các gói đẩy tin TOP 1.</li>
            <li>Duy trì điểm danh 7 ngày liên tục để nhận mốc thưởng tuần lớn nhất (+50.000đ).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
