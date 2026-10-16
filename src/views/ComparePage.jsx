'use client';

import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import CompareModal from '../components/CompareModal';

export default function ComparePage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 font-medium">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
          <span className="text-slate-800 font-bold">So Sánh Bất Động Sản</span>
        </div>

        {/* Embedded Comparison Board */}
        <div className="relative">
          <CompareModal onClose={() => navigate('/')} />
        </div>
      </div>
    </div>
  );
}
