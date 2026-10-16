'use client';

import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import WalletDepositModal from '../components/WalletDepositModal';

export default function WalletDepositPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 font-medium">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[10px]"></i>
          <span className="text-slate-800 font-bold">Nạp Tiền Ví Tài Khoản</span>
        </div>

        {/* Embedded Wallet Deposit Card */}
        <div className="relative">
          <WalletDepositModal onClose={() => navigate('/ho-so-ca-nhan')} />
        </div>
      </div>
    </div>
  );
}
