'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import ListingCard from './ListingCard';

export default function FavoritesView({ setCurrentView }) {
  const { properties, favorites } = useRealEstate();

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm">
              <i className="fa-solid fa-heart"></i>
            </span>
            Danh Sách Bất Động Sản Đã Lưu ({favoriteProperties.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi các căn nhà đất bạn quan tâm và dễ dàng so sánh giá
          </p>
        </div>

        <button
          onClick={() => setCurrentView('listings')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Quay lại khám phá
        </button>
      </div>

      {favoriteProperties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
            <i className="fa-regular fa-heart"></i>
          </div>
          <h3 className="text-base font-bold text-slate-800">Bạn chưa lưu bất động sản nào</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Bấm vào biểu tượng trái tim trên các thẻ tin đăng để lưu lại và xem lại tại đây bất cứ lúc nào.
          </p>
          <button
            onClick={() => setCurrentView('listings')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            Khám phá danh sách nhà đất
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map(property => (
            <ListingCard key={property.id} property={property} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
