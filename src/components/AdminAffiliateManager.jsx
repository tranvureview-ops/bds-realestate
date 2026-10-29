'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { normalizePhone } from '../utils/authValidation';
import { isReferralQualified, DEFAULT_AFFILIATE_MILESTONES } from '../utils/affiliateEngine';

export default function AdminAffiliateManager() {
  const { 
    usersList, 
    setUsersList,
    properties, 
    transactions, 
    systemConfig, 
    updateSystemConfig, 
    showToast 
  } = useRealEstate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'qualified', 'pending'

  // Form Cấu hình Affiliate & Milestones (Thưởng Từng Mốc)
  const [commissionRate, setCommissionRate] = useState(
    Number(systemConfig?.affiliateCommissionRate !== undefined ? systemConfig.affiliateCommissionRate : 7)
  );

  const [milestones, setMilestones] = useState(() => {
    if (Array.isArray(systemConfig?.affiliateMilestones) && systemConfig.affiliateMilestones.length > 0) {
      return systemConfig.affiliateMilestones;
    }
    return DEFAULT_AFFILIATE_MILESTONES;
  });

  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const handleMilestoneChange = (index, field, value) => {
    setMilestones(prev => {
      const updated = [...prev];
      updated[index] = { 
        ...updated[index], 
        [field]: field === 'label' ? value : Math.max(0, Number(value) || 0) 
      };
      return updated;
    });
  };

  const handleAddMilestone = () => {
    const lastM = milestones[milestones.length - 1];
    const nextTarget = lastM ? Number(lastM.target) + 5 : 5;
    const nextReward = lastM ? Number(lastM.reward) + 100000 : 100000;
    const newM = {
      id: `mile-${Date.now()}`,
      target: nextTarget,
      reward: nextReward,
      label: `Mốc ${milestones.length + 1}: Kết nối ${nextTarget} bạn bè`
    };
    setMilestones(prev => [...prev, newM]);
  };

  const handleRemoveMilestone = (index) => {
    if (milestones.length <= 1) {
      if (showToast) showToast('Cần giữ lại ít nhất 1 mốc thưởng!', 'warning');
      return;
    }
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  // Tính toán tất cả các cặp quan hệ Affiliate (Referrer -> Referee)
  const affiliateRecords = useMemo(() => {
    const list = [];
    (usersList || []).forEach(f1 => {
      if (!f1.referredBy) return;
      const refBy = String(f1.referredBy);
      const referrer = (usersList || []).find(u => 
        String(u.id) === refBy ||
        (u.refCode && String(u.refCode).toUpperCase() === refBy.toUpperCase()) ||
        (u.phone && normalizePhone(u.phone) === normalizePhone(refBy))
      );

      const isQual = isReferralQualified(f1, properties, transactions);
      const f1ListingsCount = (properties || []).filter(p => 
        (p.author?.id && String(p.author.id) === String(f1.id)) ||
        (p.userId && String(p.userId) === String(f1.id)) ||
        (p.authorId && String(p.authorId) === String(f1.id)) ||
        (p.author?.phone && f1.phone && normalizePhone(p.author.phone) === normalizePhone(f1.phone))
      ).length;

      const f1Deposited = (transactions || [])
        .filter(t => String(t.userId) === String(f1.id) && t.type === 'deposit' && t.status === 'success')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const f1Commissions = (transactions || [])
        .filter(t => 
          t.type === 'affiliate_commission' && 
          referrer && String(t.userId) === String(referrer.id) &&
          t.title?.includes(f1.name || f1.phone || '')
        )
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      list.push({
        id: `${f1.id}-${refBy}`,
        referee: f1,
        referrer: referrer || { name: 'Người dùng ẩn', phone: refBy, id: refBy },
        isQualified: isQual,
        f1ListingsCount,
        f1Deposited,
        f1Commissions,
        createdAt: f1.createdAt || new Date().toISOString()
      });
    });
    return list;
  }, [usersList, properties, transactions]);

  // Lọc dữ liệu hiển thị
  const filteredRecords = useMemo(() => {
    return affiliateRecords.filter(r => {
      if (statusFilter === 'qualified' && !r.isQualified) return false;
      if (statusFilter === 'pending' && r.isQualified) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const refName = (r.referrer.name || '').toLowerCase();
      const refPhone = (r.referrer.phone || '').toLowerCase();
      const f1Name = (r.referee.name || '').toLowerCase();
      const f1Phone = (r.referee.phone || '').toLowerCase();
      return refName.includes(term) || refPhone.includes(term) || f1Name.includes(term) || f1Phone.includes(term);
    });
  }, [affiliateRecords, statusFilter, searchTerm]);

  // Thống kê tổng quan KPI
  const stats = useMemo(() => {
    const totalReferees = affiliateRecords.length;
    const qualifiedCount = affiliateRecords.filter(r => r.isQualified).length;
    const pendingCount = totalReferees - qualifiedCount;
    const uniqueReferrers = new Set(affiliateRecords.map(r => r.referrer.id || r.referrer.phone)).size;
    
    const totalCommissionsPaid = (transactions || [])
      .filter(t => t.type === 'affiliate_commission' && t.status === 'success')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalReferees,
      qualifiedCount,
      pendingCount,
      uniqueReferrers,
      totalCommissionsPaid
    };
  }, [affiliateRecords, transactions]);

  // Lưu cấu hình toàn sàn
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const sortedMilestones = [...milestones].sort((a, b) => Number(a.target) - Number(b.target));
      if (updateSystemConfig) {
        await updateSystemConfig({
          affiliateCommissionRate: Number(commissionRate),
          affiliateMilestones: sortedMilestones
        });
      }
      if (showToast) showToast('Đã lưu cấu hình Mốc Thưởng & Hoa Hồng Affiliate thành công!', 'success');
    } catch (err) {
      if (showToast) showToast('Lỗi khi lưu cấu hình Affiliate!', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Duyệt đạt chuẩn thủ công cho 1 F1
  const handleManualApprove = (refereeId) => {
    if (!setUsersList) return;
    setUsersList(prev => prev.map(u => {
      if (u.id === refereeId) {
        return { ...u, isVerified: true, kycStatus: 'verified' };
      }
      return u;
    }));
    if (showToast) showToast('Đã duyệt Đạt Chuẩn cho thành viên này!', 'success');
  };

  // Hủy liên kết (Đánh dấu gian lận / gỡ referredBy)
  const handleRemoveAffiliate = (refereeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy liên kết Affiliate này (loại bỏ khỏi người giới thiệu)?')) return;
    if (!setUsersList) return;
    setUsersList(prev => prev.map(u => {
      if (u.id === refereeId) {
        return { ...u, referredBy: null };
      }
      return u;
    }));
    if (showToast) showToast('Đã hủy liên kết giới thiệu cho tài khoản này!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Người tham gia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Người Giới Thiệu</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.uniqueReferrers}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Thành viên có mạng lưới F1</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-users-rays"></i>
          </div>
        </div>

        {/* KPI 2: Tổng F1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Tổng Lượt Mời F1</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.totalReferees}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tài khoản được giới thiệu</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-user-plus"></i>
          </div>
        </div>

        {/* KPI 3: Đạt chuẩn (Qualified) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Lượt Mời Hợp Lệ</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {stats.qualifiedCount} <span className="text-xs text-slate-500 font-normal">({stats.totalReferees > 0 ? Math.round((stats.qualifiedCount / stats.totalReferees) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Đã đăng tin hoặc eKYC thật</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-shield-check"></i>
          </div>
        </div>

        {/* KPI 4: Hoa hồng nạp tiền đã chi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Hoa Hồng Đã Trả</div>
            <div className="text-2xl font-black text-amber-500 font-mono mt-1">
              {stats.totalCommissionsPaid.toLocaleString('vi-VN')} <span className="text-xs font-sans text-slate-700">đ</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Trích % doanh thu nạp tiền</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
        </div>
      </div>

      {/* 2. Cài đặt Chính Sách Trả Thưởng Toàn Sàn */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Cấu Hình Chính Sách Trả Thưởng & Hoa Hồng</h3>
              <p className="text-xs text-slate-500">Thiết lập tỷ lệ chia sẻ doanh thu và điều kiện nhận thưởng của toàn sàn</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5 pt-1">
          {/* Cấu hình hoa hồng nạp tiền */}
          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hoa hồng nạp tiền F1 (% trích từ doanh thu):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Tự động cộng tiền mặt vào Ví Chính của người giới thiệu khi F1 nạp tiền</span>
          </div>

          {/* Cấu hình các Mốc Thưởng Chiêu Mộ (Milestones) */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-trophy text-amber-500"></i>
                  <span>Các Mốc Thưởng Chiêu Mộ Bạn Bè (Thưởng Từng Mốc Vào Ví KM)</span>
                </h4>
                <p className="text-[11px] text-slate-500">Người dùng đạt đến mốc nào sẽ nhận tiền thưởng tương ứng của mốc đó</p>
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm Mốc Thưởng</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m, idx) => (
                <div key={m.id || idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-800">Mốc {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Số bạn đạt chuẩn (Target):</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={m.target}
                          onChange={(e) => handleMilestoneChange(idx, 'target', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">Bạn</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Thưởng Ví KM (VNĐ):</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="5000"
                          step="10000"
                          value={m.reward}
                          onChange={(e) => handleMilestoneChange(idx, 'reward', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">đ</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Tên hiển thị mốc:</label>
                      <input
                        type="text"
                        value={m.label || ''}
                        onChange={(e) => handleMilestoneChange(idx, 'label', e.target.value)}
                        placeholder={`Mốc ${idx + 1}: Kết nối ${m.target} bạn`}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    title="Xóa mốc thưởng này"
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition text-xs shrink-0 cursor-pointer self-end md:self-center"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Tổng cộng: <strong>{milestones.length} mốc thưởng</strong></span>
              <span>
                Tổng thưởng tích lũy: <strong className="text-emerald-700 font-mono">{milestones.reduce((s, m) => s + (Number(m.reward) || 0), 0).toLocaleString('vi-VN')}đ</strong> vào Ví KM
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSavingConfig ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
              <span>Lưu Cấu Hình Mốc Thưởng & Hoa Hồng</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Bảng Danh Sách Trả Thưởng & Đối Soát Hợp Lệ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Danh Sách Quan Hệ Affiliate & Tiến Độ Trả Thưởng</h3>
            <p className="text-xs text-slate-500">Kiểm tra tính hợp lệ của từng lượt giới thiệu và phát hiện gian lận</p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Tìm tên, SĐT Người mời / F1..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tất cả ({affiliateRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('qualified')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'qualified' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Đạt chuẩn ({stats.qualifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Chờ duyệt ({stats.pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Người Giới Thiệu (Referrer)</th>
                <th className="py-3 px-4">Thành Viên F1 (Referee)</th>
                <th className="py-3 px-4 text-center">Hoạt Động Của F1</th>
                <th className="py-3 px-4 text-center">Trạng Thái Thẩm Định</th>
                <th className="py-3 px-4 text-right">Hoa Hồng Đã Trả</th>
                <th className="py-3 px-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    {/* Referrer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.referrer.name || 'Người dùng'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.referrer.phone || r.referrer.id}</div>
                    </td>

                    {/* Referee */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.referee.name || 'Thành viên mới'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.referee.phone || r.referee.email}</div>
                      <div className="text-[10px] text-slate-400">Tham gia: {new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                    </td>

                    {/* F1 Activity */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col gap-1 items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${r.f1ListingsCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                          {r.f1ListingsCount} tin BĐS
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${r.referee.kycStatus === 'verified' || r.referee.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {r.referee.kycStatus === 'verified' || r.referee.isVerified ? 'Đã eKYC' : 'Chưa eKYC'}
                        </span>
                        {r.f1Deposited > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 font-mono">
                            Nạp: {r.f1Deposited.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {r.isQualified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <i className="fa-solid fa-circle-check text-emerald-600"></i>
                          <span>Hợp lệ (Qualified)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <i className="fa-solid fa-clock-rotate-left text-amber-600"></i>
                          <span>Chờ điều kiện</span>
                        </span>
                      )}
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold font-mono text-slate-900">
                        {r.f1Commissions > 0 ? `+${r.f1Commissions.toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!r.isQualified && (
                          <button
                            type="button"
                            onClick={() => handleManualApprove(r.referee.id)}
                            title="Duyệt Đạt Chuẩn thủ công"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition text-xs"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAffiliate(r.referee.id)}
                          title="Hủy liên kết giới thiệu (Chống spam/gian lận)"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition text-xs"
                        >
                          <i className="fa-solid fa-user-xmark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu lượt giới thiệu nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
