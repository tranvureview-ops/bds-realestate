'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import SeoImage from './SeoImage';

export default function CompareDrawer() {
  const { compareList, removeCompare, clearCompare, setActiveModal } = useRealEstate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 border border-slate-700 flex flex-wrap items-center gap-4 max-w-4xl w-[92%] sm:w-auto animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black">
          {compareList.length}
        </div>
        <div className="text-xs">
          <div className="font-bold text-white">So Sánh Bất Động Sản</div>
          <div className="text-[10px] text-slate-400">Tối đa 4 căn đặt cạnh nhau</div>
        </div>
      </div>

      {/* Thumbnails preview */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {compareList.map((prop) => (
          <div key={prop.id} className="relative group shrink-0">
            <SeoImage
              src={prop.images[0]}
              property={prop}
              type="thumbnail"
              className="w-12 h-10 object-cover rounded-lg border border-slate-600"
            />
            <button
              onClick={() => removeCompare(prop.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
              title="Bỏ căn này"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={clearCompare}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 transition"
        >
          Xóa hết
        </button>

        <button
          onClick={() => setActiveModal('compare')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <i className="fa-solid fa-code-compare"></i>
          <span>Xem Bảng So Sánh ({compareList.length})</span>
        </button>
      </div>
    </div>
  );
}
