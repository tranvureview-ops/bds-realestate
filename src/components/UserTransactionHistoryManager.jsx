'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function UserTransactionHistoryManager() {
  const { currentUser, transactions = [], setActiveModal } = useRealEstate();

  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'deposit', 'bonus_reward', 'bonus_expired', 'service_payment'
  const [walletFilter, setWalletFilter] = useState('all'); // 'all', 'main', 'bonus'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', '7days', '30days'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);

  // Kéo dữ liệu gói tiền sắp hết hạn từ API về
  useEffect(() => {
    if (!currentUser?.id || currentUser?.role === 'guest') {
      setExpiringBonusInfo(null);
      return;
    }

    if (currentUser?.earliestExpiringBonus?.amount && currentUser?.earliestExpiringBonus?.expiresAt) {
      const expDate = new Date(currentUser.earliestExpiringBonus.expiresAt);
      setExpiringBonusInfo({
        amount: Number(currentUser.earliestExpiringBonus.amount),
        expiresAt: currentUser.earliestExpiringBonus.expiresAt,
        formattedDate: currentUser.earliestExpiringBonus.formattedDate || expDate.toLocaleDateString('vi-VN')
      });
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
  }, [currentUser?.id, currentUser?.bonusWalletBalance]);

  // 1. Lọc các giao dịch chỉ thuộc về tài khoản hiện tại
  const userTransactions = useMemo(() => {
    if (!currentUser) return [];
    const uid = String(currentUser.id || '');
    const isGuest = currentUser.role === 'guest' || uid === 'guest';

    return (transactions || []).filter(t => {
      if (isGuest) {
        return String(t.userId || '').startsWith('guest') || t.userId === 'guest';
      }
      return String(t.userId) === uid;
    });
  }, [transactions, currentUser]);

  // 2. Thống kê số liệu KPI tổng quan
  const stats = useMemo(() => {
    let totalDeposited = 0;
    let totalBonusReceived = 0;
    let totalBonusClawback = 0;
    let totalSpent = 0;

    userTransactions.forEach(t => {
      const amt = Number(t.amount || 0);
      const isBonus = t.walletType === 'bonus' || 
                      t.type === 'bonus_reward' || 
                      t.type === 'bonus_expired' || 
                      t.title?.toLowerCase().includes('khuyến mãi') || 
                      t.title?.toLowerCase().includes('ví km') ||
                      t.title?.toLowerCase().includes('điểm danh') ||
                      t.title?.toLowerCase().includes('nhiệm vụ') ||
                      t.title?.toLowerCase().includes('rương') ||
                      t.title?.toLowerCase().includes('thu hồi');

      if (t.type === 'deposit' && amt > 0) {
        totalDeposited += amt;
      } else if ((t.type === 'bonus_expired' || t.title?.toLowerCase().includes('thu hồi')) && amt < 0) {
        totalBonusClawback += Math.abs(amt);
      } else if (isBonus && amt > 0) {
        totalBonusReceived += amt;
      } else if (amt < 0) {
        totalSpent += Math.abs(amt);
      }
    });

    return {
      totalDeposited,
      totalBonusReceived,
      totalBonusClawback,
      totalSpent
    };
  }, [userTransactions]);

  // 3. Phân loại và lọc danh sách giao dịch chi tiết
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const cleanSearch = searchTerm.trim().toLowerCase();

    return userTransactions.filter(t => {
      const isBonus = t.walletType === 'bonus' || 
                      t.type === 'bonus_reward' || 
                      t.type === 'bonus_expired' || 
                      t.title?.toLowerCase().includes('khuyến mãi') || 
                      t.title?.toLowerCase().includes('ví km') ||
                      t.title?.toLowerCase().includes('điểm danh') ||
                      t.title?.toLowerCase().includes('nhiệm vụ') ||
                      t.title?.toLowerCase().includes('rương') ||
                      t.title?.toLowerCase().includes('thu hồi');

      const isClawback = t.type === 'bonus_expired' || (t.title?.toLowerCase().includes('thu hồi') && Number(t.amount) < 0);
      const isDeposit = t.type === 'deposit';
      const isBonusGrant = isBonus && Number(t.amount) > 0 && !isClawback;
      const isService = Number(t.amount) < 0 && !isClawback;

      // Lọc theo Loại hoạt động
      if (typeFilter === 'deposit' && !isDeposit) return false;
      if (typeFilter === 'bonus_reward' && !isBonusGrant) return false;
      if (typeFilter === 'bonus_expired' && !isClawback) return false;
      if (typeFilter === 'service_payment' && !isService) return false;

      // Lọc theo Ví
      if (walletFilter === 'main' && (isBonus || isClawback)) return false;
      if (walletFilter === 'bonus' && (!isBonus && !isClawback && !isBonusGrant)) return false;

      // Lọc theo Thời gian
      if (timeFilter !== 'all') {
        const tTime = t.createdAt ? new Date(t.createdAt).getTime() : 0;
        if (timeFilter === 'today' && (now - tTime > 24 * 60 * 60 * 1000)) return false;
        if (timeFilter === '7days' && (now - tTime > 7 * 24 * 60 * 60 * 1000)) return false;
        if (timeFilter === '30days' && (now - tTime > 30 * 24 * 60 * 60 * 1000)) return false;
      }

      // Lọc theo Từ khóa tìm kiếm
      if (cleanSearch) {
        const idMatch = String(t.id || '').toLowerCase().includes(cleanSearch);
        const titleMatch = String(t.title || '').toLowerCase().includes(cleanSearch);
        const methodMatch = String(t.paymentMethod || '').toLowerCase().includes(cleanSearch);
        if (!idMatch && !titleMatch && !methodMatch) return false;
      }

      return true;
    });
  }, [userTransactions, typeFilter, walletFilter, timeFilter, searchTerm]);

  // Phân trang
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const resetFilters = () => {
    setTypeFilter('all');
    setWalletFilter('all');
    setTimeFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getTransactionBadge = (txn) => {
    const isClawback = txn.type === 'bonus_expired' || (txn.title?.toLowerCase().includes('thu hồi') && Number(txn.amount) < 0);
    const isDeposit = txn.type === 'deposit';
    const isBonus = txn.walletType === 'bonus' || 
                    txn.type === 'bonus_reward' || 
                    txn.title?.toLowerCase().includes('khuyến mãi') || 
                    txn.title?.toLowerCase().includes('ví km') ||
                    txn.title?.toLowerCase().includes('điểm danh') ||
                    txn.title?.toLowerCase().includes('nhiệm vụ') ||
                    txn.title?.toLowerCase().includes('rương');

    if (isDeposit) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <i className="fa-solid fa-arrow-down-to-bracket text-emerald-600"></i>
          Nạp tiền ví
        </span>
      );
    }

    if (isClawback) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <i className="fa-solid fa-clock-rotate-left text-rose-600"></i>
          Thu hồi tiền KM
        </span>
      );
    }

    if (isBonus && txn.amount > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <i className="fa-solid fa-gift text-purple-600"></i>
          Thưởng Ví KM
        </span>
      );
    }

    if (txn.type === 'purchase_vip' || txn.title?.toLowerCase().includes('vip')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <i className="fa-solid fa-crown text-amber-600"></i>
          Mua Gói VIP
        </span>
      );
    }

    if (txn.type === 'bump_listing' || txn.title?.toLowerCase().includes('đẩy tin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <i className="fa-solid fa-rocket text-blue-600"></i>
          Đẩy tin rao
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <i className="fa-solid fa-receipt text-slate-500"></i>
        Dịch vụ tin đăng
      </span>
    );
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '--/--/----', time: '--:--' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const walletBal = Number(currentUser?.walletBalance || 0);
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ TỔNG QUAN (KPI STATS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Số dư ví khả dụng & Ví KM */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Số Dư Tài Khoản
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 text-sm">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {walletBal.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[11px] text-amber-300 font-bold mt-1 flex items-center gap-1.5">
              <span>Ví KM: +{bonusBal.toLocaleString('vi-VN')} đ</span>
            </div>
            {/* Cảnh báo có tiền thưởng sắp hết hạn */}
            {bonusBal > 0 && expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate && (
              <div className="text-[10px] text-amber-200 font-semibold flex items-center gap-1 mt-1 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <i className="fa-solid fa-hourglass-half text-amber-300 animate-pulse"></i>
                <span>(Có {Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày {expiringBonusInfo.formattedDate})</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('wallet-deposit')}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <i className="fa-solid fa-circle-plus"></i>
            <span>Nạp Thêm Tiền</span>
          </button>
        </div>

        {/* Card 2: Tổng Nạp Thực Tế */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Tiền Đã Nạp
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-arrow-down-to-bracket"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
            +{stats.totalDeposited.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tổng số tiền thực nạp qua tài khoản ngân hàng / VietQR.
          </p>
        </div>

        {/* Card 3: Tổng Thưởng Khuyến Mãi Nhận Được */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Thưởng KM Nhận
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-gift"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-600">
            +{stats.totalBonusReceived.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Điểm danh 7 ngày, hoàn thành nhiệm vụ và săn kho báu.
          </p>
        </div>

        {/* Card 4: Tổng Tiền KM Bị Thu Hồi */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Đã Thu Hồi Quá Hạn
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
            {stats.totalBonusClawback > 0 ? `-${stats.totalBonusClawback.toLocaleString('vi-VN')} đ` : '0 đ'}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tiền thưởng quá hạn 30 ngày không sử dụng bị thu hồi.
          </p>
        </div>
      </div>

      {/* 2. KHU VỰC BỘ LỌC GIAO DỊCH (FILTERS BAR) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã giao dịch (TXN-...), mô tả hoặc phương thức..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Bộ lọc dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Lọc loại hoạt động */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả hoạt động</option>
              <option value="deposit">📥 Nạp tiền ví chính</option>
              <option value="bonus_reward">🎁 Thưởng Ví KM (Điểm danh/Nhiệm vụ)</option>
              <option value="bonus_expired">⏳ Thu hồi tiền KM quá hạn</option>
              <option value="service_payment">💳 Thanh toán tin VIP / Đẩy tin</option>
            </select>

            {/* Lọc loại ví */}
            <select
              value={walletFilter}
              onChange={(e) => {
                setWalletFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả các ví</option>
              <option value="main">Ví chính (Khả dụng)</option>
              <option value="bonus">Ví Khuyến Mãi (Bonus)</option>
            </select>

            {/* Lọc thời gian */}
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="today">Hôm nay (24 giờ)</option>
              <option value="7days">7 ngày gần nhất</option>
              <option value="30days">30 ngày gần nhất</option>
            </select>

            {(typeFilter !== 'all' || walletFilter !== 'all' || timeFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. BẢNG DANH SÁCH CHI TIẾT GIAO DỊCH */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 whitespace-nowrap">Mã GD & Thời Gian</th>
                <th className="p-3.5 whitespace-nowrap">Phân Loại</th>
                <th className="p-3.5 whitespace-nowrap">Nội Dung Hoạt Động</th>
                <th className="p-3.5 whitespace-nowrap">Nguồn Ví</th>
                <th className="p-3.5 text-right whitespace-nowrap">Biến Động (VND)</th>
                <th className="p-3.5 text-right whitespace-nowrap">Số Dư Sau GD</th>
                <th className="p-3.5 text-center whitespace-nowrap">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl mb-3 shadow-inner">
                      <i className="fa-solid fa-receipt"></i>
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Chưa có bản ghi giao dịch nào</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchTerm || typeFilter !== 'all' || walletFilter !== 'all' || timeFilter !== 'all'
                        ? 'Không tìm thấy giao dịch nào phù hợp với bộ lọc tìm kiếm hiện tại.'
                        : 'Các hoạt động nạp tiền, thưởng điểm danh và chi tiêu dịch vụ sẽ được ghi nhận chi tiết tại đây.'}
                    </p>
                    {(searchTerm || typeFilter !== 'all' || walletFilter !== 'all' || timeFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-arrow-rotate-left"></i>
                        <span>Xóa bộ lọc</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(txn => {
                  const amt = Number(txn.amount || 0);
                  const isPositive = amt > 0;
                  const isClawback = txn.type === 'bonus_expired' || (txn.title?.toLowerCase().includes('thu hồi') && amt < 0);
                  const isBonus = txn.walletType === 'bonus' || 
                                  txn.type === 'bonus_reward' || 
                                  txn.type === 'bonus_expired' || 
                                  txn.title?.toLowerCase().includes('khuyến mãi') || 
                                  txn.title?.toLowerCase().includes('ví km') ||
                                  txn.title?.toLowerCase().includes('điểm danh') ||
                                  txn.title?.toLowerCase().includes('nhiệm vụ') ||
                                  txn.title?.toLowerCase().includes('rương') ||
                                  txn.title?.toLowerCase().includes('thu hồi');

                  const { date, time } = formatDateTime(txn.createdAt);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Cột 1: Mã GD & Thời gian */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 text-xs">
                          {txn.id}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <i className="fa-regular fa-clock text-[9px]"></i>
                          <span>{time}</span>
                          <span>•</span>
                          <span>{date}</span>
                        </div>
                      </td>

                      {/* Cột 2: Phân loại Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getTransactionBadge(txn)}
                      </td>

                      {/* Cột 3: Nội dung chi tiết */}
                      <td className="p-3.5 max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-800 line-clamp-2">
                          {txn.title}
                        </div>
                        {txn.paymentMethod && txn.paymentMethod !== 'Hệ thống tự động' && txn.paymentMethod !== 'system_reward' && (
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <i className="fa-regular fa-credit-card text-[9px]"></i>
                            <span>Phương thức: {txn.paymentMethod}</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Nguồn ví */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isBonus ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <i className="fa-solid fa-gift text-[9px]"></i>
                            Ví KM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <i className="fa-solid fa-wallet text-[9px]"></i>
                            Ví Chính
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Biến động số tiền */}
                      <td className={`p-3.5 text-right whitespace-nowrap font-black font-mono text-sm ${
                        isPositive ? 'text-emerald-600' : isClawback ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {isPositive ? `+${amt.toLocaleString('vi-VN')} đ` : `${amt.toLocaleString('vi-VN')} đ`}
                      </td>

                      {/* Cột 6: Số dư sau giao dịch */}
                      <td className="p-3.5 text-right whitespace-nowrap font-mono text-slate-600 font-semibold">
                        {txn.balanceAfter !== undefined && txn.balanceAfter !== null
                          ? `${Number(txn.balanceAfter).toLocaleString('vi-VN')} đ`
                          : '--'}
                      </td>

                      {/* Cột 7: Trạng thái */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {isClawback ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            Đã thu hồi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Thành công
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-500 text-[11px]">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} trên tổng số {filteredTransactions.length} giao dịch
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${
                    currentPage === p
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
