'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function AdminCommonVoucherPricing({ className = '' }) {
  const { membershipPackages = [], updateCommonVoucherPrices } = useRealEstate();

  // Lấy đơn giá hiện tại từ danh sách gói
  const getInitialPrices = () => {
    const pubVal = membershipPackages[0]?.vouchersPerCycle?.normalPublishDiscount ?? 35000;
    const bumpVal = membershipPackages[0]?.vouchersPerCycle?.normalBumpDiscount ?? 10000;
    const vipVal = membershipPackages.find(p => Number(p.vouchersPerCycle?.vipDiscount || 0) > 0)?.vouchersPerCycle?.vipDiscount ?? 400000;
    return {
      normalPublishDiscount: pubVal,
      normalBumpDiscount: bumpVal,
      vipDiscount: vipVal
    };
  };

  const [prices, setPrices] = useState(getInitialPrices);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cập nhật state nếu membershipPackages thay đổi từ bên ngoài
  useEffect(() => {
    const initial = getInitialPrices();
    setPrices(initial);
    setHasChanges(false);
  }, [membershipPackages]);

  const handleChange = (field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setPrices(prev => ({
      ...prev,
      [field]: num
    }));
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      await updateCommonVoucherPrices(prices);
      setHasChanges(false);
    } catch (err) {
      console.error('Lỗi lưu đơn giá voucher:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center text-lg font-black shrink-0 shadow-lg shadow-amber-500/20">
            <i className="fa-solid fa-tags"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-black text-white">
                Cấu Hình Đơn Giá Chung Cho 3 Loại Voucher Hội Viên
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                Áp Dụng Cho Cả 3 Gói Hội Viên
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Nhập mức tiền giảm giá chung dưới đây. Hệ thống sẽ tự động cập nhật và đồng bộ quyền lợi cho <strong>Gói Cơ Bản</strong>, <strong>Gói Tiêu Chuẩn</strong> và <strong>Gói Cao Cấp</strong> cùng lúc.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 shadow-lg ${
            hasChanges
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
          }`}
        >
          {isSaving ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <i className="fa-solid fa-floppy-disk"></i>
          )}
          <span>{isSaving ? 'Đang Đồng Bộ...' : (hasChanges ? 'Lưu & Áp Dụng Ngay' : 'Lưu Đơn Giá Chung')}</span>
        </button>
      </div>

      {/* 3 Voucher Price Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Voucher Đăng Tin Thường */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                <i className="fa-solid fa-file-lines"></i>
              </span>
              <div>
                <span className="font-bold text-white text-xs block">Voucher Đăng Tin Thường</span>
                <span className="text-[10px] text-slate-400">Đăng tin thường 30 ngày</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/60">
              đ/tin
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1">
            Mức giảm trừ mỗi lần đăng tin thường (chuẩn 35.000 đ)
          </p>

          <div className="relative pt-1">
            <input
              type="number"
              step="1000"
              min="0"
              value={prices.normalPublishDiscount}
              onChange={(e) => handleChange('normalPublishDiscount', e.target.value)}
              className="w-full py-2.5 pl-3 pr-14 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-black text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="35000"
            />
            <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-bold pointer-events-none">VNĐ</span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-slate-800/60">
            <span>Đang cấu hình:</span>
            <b className="text-emerald-400 font-mono text-xs">{Number(prices.normalPublishDiscount || 0).toLocaleString('vi-VN')} đ/lần</b>
          </div>
        </div>

        {/* 2. Voucher Đẩy Tin */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0">
                <i className="fa-solid fa-arrow-up"></i>
              </span>
              <div>
                <span className="font-bold text-white text-xs block">Voucher Đẩy Tin</span>
                <span className="text-[10px] text-slate-400">Làm mới tin lên đầu trang</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 text-[10px] font-mono font-bold border border-amber-800/60">
              đ/lượt
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1">
            Mức giảm cho mỗi lần dùng dịch vụ đẩy tin (chuẩn 10.000 đ)
          </p>

          <div className="relative pt-1">
            <input
              type="number"
              step="1000"
              min="0"
              value={prices.normalBumpDiscount}
              onChange={(e) => handleChange('normalBumpDiscount', e.target.value)}
              className="w-full py-2.5 pl-3 pr-14 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-black text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              placeholder="10000"
            />
            <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-bold pointer-events-none">VNĐ</span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-slate-800/60">
            <span>Đang cấu hình:</span>
            <b className="text-amber-400 font-mono text-xs">{Number(prices.normalBumpDiscount || 0).toLocaleString('vi-VN')} đ/lần</b>
          </div>
        </div>

        {/* 3. Voucher Giảm Tin VIP */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 transition-all space-y-2 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-black shrink-0">
                <i className="fa-solid fa-gem"></i>
              </span>
              <div>
                <span className="font-bold text-white text-xs block">Voucher Giảm Tin VIP</span>
                <span className="text-[10px] text-slate-400">Giảm trừ trực tiếp tin VIP</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-400 text-[10px] font-mono font-bold border border-rose-800/60">
              đ/tin VIP
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-1">
            Mức giảm trực tiếp khi đăng Tin VIP (chuẩn 400.000 đ)
          </p>

          <div className="relative pt-1">
            <input
              type="number"
              step="10000"
              min="0"
              value={prices.vipDiscount}
              onChange={(e) => handleChange('vipDiscount', e.target.value)}
              className="w-full py-2.5 pl-3 pr-14 bg-slate-900 border border-slate-700 rounded-xl text-rose-400 font-mono font-black text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              placeholder="400000"
            />
            <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-bold pointer-events-none">VNĐ</span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 border-t border-slate-800/60">
            <span>Đang cấu hình:</span>
            <b className="text-rose-400 font-mono text-xs">{Number(prices.vipDiscount || 0).toLocaleString('vi-VN')} đ/tin</b>
          </div>
        </div>
      </div>

      {/* Footer sync info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-emerald-400"></i>
          <span>
            Đồng bộ tự động tới <strong>{(membershipPackages || []).length} gói hội viên</strong>: {membershipPackages.map(p => p.shortName || p.name).join(' • ')}
          </span>
        </div>
        <div className="text-slate-500">
          Khi sửa giá tại đây, số lượng voucher của từng gói vẫn giữ nguyên theo thiết lập riêng.
        </div>
      </div>
    </div>
  );
}
