'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import UserProfileComponent from '../components/UserProfilePage';

export default function UserProfilePage() {
  return (
    <div className="space-y-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/" className="hover:text-emerald-600 font-medium">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
          <span className="text-slate-800 font-bold">Hồ Sơ Cá Nhân & Xác Thực KYC</span>
        </div>
      </div>
      <UserProfileComponent />
    </div>
  );
}
