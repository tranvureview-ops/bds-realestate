'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import FengShuiCalculator from '../components/FengShuiCalculator';

export default function FengShuiPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
              <i className="fa-solid fa-house"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            <span className="text-slate-400">Dịch vụ & Tiện ích</span>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            <span className="text-slate-900 font-bold">Xem Tuổi Mua Đất Xây Nhà</span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-8">
        <FengShuiCalculator />
      </div>
    </div>
  );
}
