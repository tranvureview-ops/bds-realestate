'use client';

import React, { useState } from 'react';
import { REDEMPTION_ITEMS } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function RewardRedeemPage() {
  const [items, setItems] = useState(REDEMPTION_ITEMS);
  const [userCoins, setUserCoins] = useState(85000);
  const { showToast } = useRealEstate();

  const handleRedeem = (item) => {
    if (userCoins < item.coinsNeeded) {
      if (showToast) {
        showToast(`Bạn cần thêm ${(item.coinsNeeded - userCoins).toLocaleString('vi-VN')} Xu để đổi quà này!`, 'warning');
      }
      return;
    }

    setUserCoins(prev => prev - item.coinsNeeded);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
    if (showToast) {
      showToast(`🎉 Đổi thành công "${item.title}"! Voucher đã được lưu vào ví của bạn.`, 'success');
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    'name': 'Cửa Hàng Đổi Quà & Voucher Bất Động Sản',
    'description': 'Quy đổi xu tích lũy ra voucher nạp tiền và gói dịch vụ đẩy tin VIP.',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/doi-qua/'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Cửa hàng đổi quà</span>
        </nav>

        {/* Header with Coin Wallet */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-700 via-pink-700 to-red-800 text-white p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-gift text-amber-300"></i>
              Kho Voucher & Dịch Vụ VIP
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Cửa Hàng Đổi Quà BĐS
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Sử dụng Xu tích lũy từ Điểm danh và Nhiệm vụ để đổi lấy các dịch vụ quảng cáo tin rao đắc lực nhất.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-bold">
              <i className="fa-solid fa-coins"></i>
            </div>
            <div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Xu khả dụng</div>
              <div className="text-xl font-black text-amber-300">{userCoins.toLocaleString('vi-VN')} Xu</div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map(item => {
            const canAfford = userCoins >= item.coinsNeeded;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                    <i className={item.icon}></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1.5">
                      Còn lại: <strong className="text-slate-700">{item.stock} suất</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Giá quy đổi</div>
                    <div className="text-base font-black text-amber-600 flex items-center gap-1">
                      <i className="fa-solid fa-coins text-xs"></i>
                      <span>{item.coinsNeeded.toLocaleString('vi-VN')} Xu</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(item)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                    <span>{canAfford ? 'Đổi quà ngay' : 'Chưa đủ xu'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
