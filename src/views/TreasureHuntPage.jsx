'use client';

import React, { useState } from 'react';
import { TREASURE_LOCATIONS } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function TreasureHuntPage() {
  const [locations, setLocations] = useState(TREASURE_LOCATIONS);
  const [activeChest, setActiveChest] = useState(null);
  const { showToast } = useRealEstate();

  const handleOpenChest = (loc) => {
    if (loc.opened) {
      if (showToast) showToast('Rương này đã được mở hôm nay!', 'info');
      return;
    }

    setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, opened: true } : l));
    setActiveChest(loc);
    if (showToast) {
      showToast(`🎉 Chúc mừng! Bạn đã mở rương tại ${loc.name} và nhận ${loc.reward}!`, 'success');
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    'name': 'Săn Kho Báu Bất Động Sản',
    'description': 'Khám phá bản đồ dự án BĐS tại Đà Nẵng, Quảng Nam để tìm kiếm rương vàng và voucher dịch vụ.',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/san-kho-bau-bds/'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Săn kho báu BĐS</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
              <i className="fa-solid fa-map-location-dot"></i>
              Bản Đồ Kho Báu Dự Án
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Săn Rương Kho Báu Dự Án Hot
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Khám phá các tọa độ dự án đắc địa tại Đà Nẵng & Hội An. Mỗi ngày có 4 rương vàng chứa Voucher VIP và Xu thưởng đang chờ bạn khai mở!
            </p>
          </div>
        </div>

        {/* Chests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map(loc => (
            <div
              key={loc.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                loc.opened ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-teal-400'
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-rose-400"></i>
                  {loc.district}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                  <div className="text-white">
                    <h2 className="text-base font-bold">{loc.name}</h2>
                    <div className="text-xs text-amber-300 font-medium mt-0.5">
                      Phần thưởng: {loc.reward}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    loc.opened 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-amber-100 text-amber-600 animate-pulse'
                  }`}>
                    <i className={loc.opened ? 'fa-solid fa-box-open' : 'fa-solid fa-box'}></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {loc.opened ? 'Rương đã mở' : 'Rương kho báu bí mật'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {loc.opened ? `Đã nhận: ${loc.reward}` : 'Chạm để giải mã & nhận quà'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenChest(loc)}
                  disabled={loc.opened}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    loc.opened
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md'
                  }`}
                >
                  <i className={`fa-solid ${loc.opened ? 'fa-check' : 'fa-key'}`}></i>
                  <span>{loc.opened ? 'Đã nhận' : 'Mở rương'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal reward popup if just opened */}
        {activeChest && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900">Mở Rương Thành Công!</h3>
              <p className="text-xs text-slate-500">
                Chúc mừng bạn đã khai mở kho báu tại <strong>{activeChest.name}</strong>.
              </p>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 font-bold text-sm">
                🎁 {activeChest.reward}
              </div>
              <button
                onClick={() => setActiveChest(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Nhận quà & Tiếp tục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
