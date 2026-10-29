'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { MEMBERSHIP_PACKAGES } from '../data/mockData';
import { syncFeaturesWithVouchers, getResolvedFeatures, isVoucherDiscountFree } from '../utils/membershipHelper';
import AdminCommonVoucherPricing from './AdminCommonVoucherPricing';

// Preset color options for package badges
const BADGE_COLOR_PRESETS = [
  { id: 'emerald', label: 'Xanh Ngọc (Emerald)', class: 'bg-emerald-600 text-white' },
  { id: 'amber', label: 'Vàng Gold (Amber)', class: 'bg-amber-500 text-slate-950 font-black' },
  { id: 'gradient-red-purple', label: 'Đỏ Tím Gradient (VIP)', class: 'bg-gradient-to-r from-red-600 to-purple-600 text-white font-black' },
  { id: 'blue', label: 'Xanh Biển (Sky)', class: 'bg-blue-600 text-white font-bold' },
  { id: 'purple', label: 'Tím Hoàng Gia (Purple)', class: 'bg-purple-600 text-white font-bold' },
  { id: 'rose', label: 'Đỏ Ruby (Rose)', class: 'bg-rose-600 text-white font-bold' },
  { id: 'slate', label: 'Đen Xám (Dark Slate)', class: 'bg-slate-800 text-white font-bold' }
];

// Suggested feature templates for quick-adding
const SUGGESTED_FEATURES = [
  'Ưu đãi voucher cấp mới định kỳ 30 ngày trong suốt thời hạn gói',
  'Hẹn giờ đăng tin tự động theo khung giờ vàng tiếp cận khách mua',
  'Tự động đẩy tin định kỳ giúp tin rao luôn ở vị trí đầu trang',
  'Ưu tiên Xuất bản & Duyệt tin nhanh không phải chờ đợi',
  'Báo cáo phân tích hiệu suất lượt xem & số cuộc gọi chi tiết',
  'Huy hiệu "Hội Viên Chuyên Nghiệp" tăng 80% độ tin cậy giao dịch',
  'Chuyên viên CSKH hỗ trợ kỹ thuật và tối ưu tin đăng riêng 24/7',
  'Miễn phí gắn nhãn Pháp lý chuẩn / Sổ đỏ chính chủ',
  'Tiết kiệm tối đa chi phí quảng cáo so với mua lẻ từng tin'
];

export default function AdminMembershipManager({ onNavigateToPricing = null }) {
  const {
    membershipPackages,
    vipPackages,
    bumpServicePrice,
    updateMembershipPackage,
    addMembershipPackage,
    deleteMembershipPackage,
    resetMembershipPackages,
    systemConfig,
    updateSystemConfig,
    showToast
  } = useRealEstate();

  const pricingOptions = { vipPackages, bumpServicePrice };

  // Đơn giá voucher chung toàn sàn (áp dụng cho cả 3 gói)
  const normalPkg = (vipPackages || []).find(p => p.id === 'normal');
  const defaultNormalRate = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 0));
  const commonPublishDiscount = (membershipPackages[0]?.vouchersPerCycle?.normalPublishDiscount && membershipPackages[0]?.vouchersPerCycle?.normalPublishDiscount !== 35000)
    ? Number(membershipPackages[0].vouchersPerCycle.normalPublishDiscount)
    : defaultNormalRate;
  const commonBumpDiscount = membershipPackages[0]?.vouchersPerCycle?.normalBumpDiscount ?? 400;
  const commonVipDiscount = membershipPackages.find(p => Number(p.vouchersPerCycle?.vipDiscount || 0) > 0)?.vouchersPerCycle?.vipDiscount ?? 50000;

  // State for Edit/Create Modal
  const [editingPkg, setEditingPkg] = useState(null); // null when modal closed, pkg object when open
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState('general'); // 'general' | 'pricing' | 'vouchers' | 'features'
  const [previewCycle, setPreviewCycle] = useState(1); // 1 | 3 | 6
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Quick package template for new package
  const createNewTemplate = () => ({
    id: `member-${Date.now()}`,
    name: 'Gói Hội Viên Mới',
    shortName: 'GÓI MỚI',
    badge: 'ƯU ĐÃI MỚI',
    badgeColor: 'bg-emerald-600 text-white',
    targetAudience: 'Môi giới cá nhân hoặc sàn BĐS mới gia nhập hệ thống',
    monthlyPrice: 500000,
    savePercent: 30,
    billingCycles: [
      { months: 1, label: '1 tháng', duration_days: 30, price: 500000, discount: 0 },
      { months: 3, label: '3 tháng', duration_days: 90, price: 1425000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', duration_days: 180, price: 2700000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 20,
      normalPublishDiscount: commonPublishDiscount,
      normalBumpVouchers: 20,
      normalBumpDiscount: commonBumpDiscount,
      vipVouchers: 1,
      vipDiscount: commonVipDiscount
    },
    features: [
      `20 voucher giảm ${Number(commonPublishDiscount).toLocaleString('vi-VN')} đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)`,
      `20 voucher giảm ${Number(commonBumpDiscount).toLocaleString('vi-VN')} đ/lần Đẩy Tin (mỗi chu kỳ 30 ngày)`,
      `1 voucher giảm ${Number(commonVipDiscount).toLocaleString('vi-VN')} đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)`,
      'Ưu đãi voucher cấp mới định kỳ 30 ngày trong suốt thời hạn gói',
      'Báo cáo thống kê lượt tương tác cơ bản'
    ],
    allowScheduledPublishing: true,
    allowFutureStartDate: true,
    allowTreasureHunt: true,
    treasureHuntMaxArticles: 2,
    recommended: false
  });

  // Open Edit Modal
  const handleOpenEdit = (pkg) => {
    // Deep clone pkg to avoid mutating state directly
    const cloned = JSON.parse(JSON.stringify(pkg));
    cloned.allowScheduledPublishing = typeof cloned.allowScheduledPublishing === 'boolean'
      ? cloned.allowScheduledPublishing
      : (cloned.id === 'member-basic' ? false : true);
    cloned.allowFutureStartDate = typeof cloned.allowFutureStartDate === 'boolean'
      ? cloned.allowFutureStartDate
      : (cloned.id === 'member-basic' ? false : true);
    cloned.allowTreasureHunt = typeof cloned.allowTreasureHunt === 'boolean'
      ? cloned.allowTreasureHunt
      : (cloned.id === 'member-basic' ? false : true);
    cloned.treasureHuntMaxArticles = typeof cloned.treasureHuntMaxArticles === 'number'
      ? cloned.treasureHuntMaxArticles
      : (cloned.id === 'member-premium' ? 5 : (cloned.id === 'member-basic' ? 0 : 2));
    cloned.vouchersPerCycle = {
      ...cloned.vouchersPerCycle,
      normalPublishDiscount: commonPublishDiscount,
      normalBumpDiscount: commonBumpDiscount,
      vipDiscount: commonVipDiscount
    };
    cloned.features = syncFeaturesWithVouchers(cloned.features, cloned.vouchersPerCycle, pricingOptions);
    setEditingPkg(cloned);
    setIsCreatingNew(false);
    setModalActiveTab('general');
    setPreviewCycle(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPkg(createNewTemplate());
    setIsCreatingNew(true);
    setModalActiveTab('general');
    setPreviewCycle(1);
  };

  // Close Modal
  const handleCloseModal = () => {
    setEditingPkg(null);
    setIsCreatingNew(false);
    setNewFeatureInput('');
  };

  // Field change handler in editingPkg
  const handleFieldChange = (field, value) => {
    setEditingPkg(prev => {
      if (!prev) return prev;
      if (field === 'monthlyPrice') {
        const newMonthly = Math.max(0, Number(value) || 0);
        const currentCycles = (prev.billingCycles && prev.billingCycles.length > 0)
          ? prev.billingCycles
          : [
              { label: '1 tháng', price: newMonthly, months: 1, discount: 0, duration_days: 30 },
              { label: '3 tháng', price: Math.round(newMonthly * 3 * 0.95), months: 3, discount: 5, duration_days: 90, note: 'Tiết kiệm thêm 5%' },
              { label: '6 tháng', price: Math.round(newMonthly * 6 * 0.90), months: 6, discount: 10, duration_days: 180, note: 'Tiết kiệm thêm 10%' }
            ];

        const updatedCycles = currentCycles.map(c => {
          if (c.months === 1) {
            return { ...c, price: newMonthly };
          }
          const discountPercent = c.discount ?? (c.months === 3 ? 5 : c.months === 6 ? 10 : 0);
          return {
            ...c,
            price: Math.round(newMonthly * c.months * (1 - discountPercent / 100)),
            discount: discountPercent
          };
        });

        return {
          ...prev,
          monthlyPrice: newMonthly,
          billingCycles: updatedCycles
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Voucher quota change handler (chỉ cập nhật số lượng voucher, đơn giá luôn cố định theo giá chung toàn sàn)
  const handleVoucherQuotaChange = (field, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setEditingPkg(prev => {
      const updatedVouchers = {
        ...prev.vouchersPerCycle,
        normalPublishDiscount: commonPublishDiscount,
        normalBumpDiscount: commonBumpDiscount,
        vipDiscount: commonVipDiscount,
        [field]: num
      };
      const updatedFeatures = syncFeaturesWithVouchers(prev.features, updatedVouchers, pricingOptions);
      return {
        ...prev,
        vouchersPerCycle: updatedVouchers,
        features: updatedFeatures
      };
    });
  };

  // Billing cycle price/discount/duration change handler
  const handleBillingCycleChange = (index, field, value) => {
    setEditingPkg(prev => {
      if (!prev) return prev;
      const updated = [...(prev.billingCycles || [])];
      if (updated[index]) {
        const numVal = Number(value);
        if (field === 'duration_days' || field === 'durationDays') {
          updated[index] = {
            ...updated[index],
            duration_days: numVal,
            durationDays: numVal
          };
        } else if (field === 'note' || field === 'label') {
          updated[index] = {
            ...updated[index],
            [field]: value
          };
        } else {
          updated[index] = {
            ...updated[index],
            [field]: numVal
          };
        }
      }
      let updatedMonthly = prev.monthlyPrice;
      const targetCycle = updated[index];
      if (targetCycle && targetCycle.months === 1 && field === 'price') {
        updatedMonthly = Math.max(0, Number(value) || 0);
      }
      return { ...prev, billingCycles: updated, monthlyPrice: updatedMonthly };
    });
  };

  // Add a new custom billing cycle (e.g. 12 months / 365 days)
  const handleAddCustomCycle = () => {
    if (!editingPkg) return;
    const currentCycles = editingPkg.billingCycles || [];
    const lastCycle = currentCycles[currentCycles.length - 1] || { months: 6, price: 2000000 };
    const newMonths = lastCycle.months === 6 ? 12 : lastCycle.months + 3;
    const newDays = newMonths === 12 ? 365 : newMonths * 30;
    const newDiscount = Math.min(25, (lastCycle.discount || 10) + 5);
    const monthlyPrice = Number(editingPkg.monthlyPrice) || 500000;
    const basePrice = monthlyPrice * newMonths;
    const calculatedPrice = Math.round(basePrice * (1 - newDiscount / 100));

    const newCycle = {
      months: newMonths,
      duration_days: newDays,
      durationDays: newDays,
      label: `${newMonths} tháng`,
      price: calculatedPrice,
      discount: newDiscount,
      note: `Tiết kiệm siêu hời -${newDiscount}%`
    };

    setEditingPkg(prev => ({
      ...prev,
      billingCycles: [...currentCycles, newCycle]
    }));
    showToast(`Đã thêm chu kỳ ${newMonths} tháng (${newDays} ngày)!`, 'success');
  };

  // Remove a billing cycle
  const handleDeleteCycle = (idx) => {
    if (!editingPkg) return;
    if ((editingPkg.billingCycles || []).length <= 1) {
      showToast('Gói phải duy trì tối thiểu 1 chu kỳ thanh toán!', 'warning');
      return;
    }
    setEditingPkg(prev => ({
      ...prev,
      billingCycles: prev.billingCycles.filter((_, i) => i !== idx)
    }));
    showToast('Đã xóa chu kỳ thanh toán!', 'info');
  };

  // Auto calculate 3 & 6 months billing cycles based on monthlyPrice
  const handleAutoCalculateCycles = () => {
    if (!editingPkg) return;
    const monthly = Number(editingPkg.monthlyPrice) || 0;
    const updated = (editingPkg.billingCycles || []).map(cycle => {
      if (cycle.months === 1) {
        return { ...cycle, price: monthly, discount: 0 };
      }
      const discountPercent = cycle.discount || (cycle.months === 3 ? 5 : 10);
      const basePrice = monthly * cycle.months;
      const calculatedPrice = Math.round(basePrice * (1 - discountPercent / 100));
      return {
        ...cycle,
        price: calculatedPrice,
        discount: discountPercent,
        note: `Tiết kiệm thêm ${discountPercent}%`
      };
    });
    setEditingPkg(prev => ({
      ...prev,
      billingCycles: updated
    }));
    showToast('Đã tự động tính lại đơn giá 3 tháng (-5%) và 6 tháng (-10%)!', 'info');
  };

  // Feature list handlers
  const handleAddFeature = (featureText) => {
    const text = (featureText || newFeatureInput).trim();
    if (!text) return;
    if (editingPkg.features.includes(text)) {
      showToast('Đặc quyền này đã có trong danh sách!', 'info');
      return;
    }
    setEditingPkg(prev => ({
      ...prev,
      features: [...prev.features, text]
    }));
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index) => {
    setEditingPkg(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateFeature = (index, value) => {
    setEditingPkg(prev => {
      const copy = [...prev.features];
      copy[index] = value;
      return { ...prev, features: copy };
    });
  };

  const handleMoveFeature = (index, direction) => {
    setEditingPkg(prev => {
      const copy = [...prev.features];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, features: copy };
    });
  };

  // Save Modal
  const handleSaveModal = (e) => {
    e?.preventDefault();
    if (!editingPkg) return;

    if (!editingPkg.name?.trim()) {
      showToast('Vui lòng nhập tên gói hội viên!', 'error');
      setModalActiveTab('general');
      return;
    }
    if (!editingPkg.monthlyPrice || Number(editingPkg.monthlyPrice) <= 0) {
      showToast('Đơn giá theo tháng phải lớn hơn 0!', 'error');
      setModalActiveTab('pricing');
      return;
    }

    const syncedVouchers = {
      ...editingPkg.vouchersPerCycle,
      normalPublishDiscount: commonPublishDiscount,
      normalBumpDiscount: commonBumpDiscount,
      vipDiscount: commonVipDiscount
    };
    const syncedFeatures = syncFeaturesWithVouchers(editingPkg.features, syncedVouchers, pricingOptions);
    const finalMonthlyPrice = Math.max(0, Number(editingPkg.monthlyPrice) || 0);
    const syncedCycles = (editingPkg.billingCycles || []).map(c => {
      if (c.months === 1) {
        return { ...c, price: finalMonthlyPrice };
      }
      return c;
    });

    const finalPkg = {
      ...editingPkg,
      monthlyPrice: finalMonthlyPrice,
      billingCycles: syncedCycles,
      vouchersPerCycle: syncedVouchers,
      features: syncedFeatures
    };

    if (isCreatingNew) {
      addMembershipPackage(finalPkg);
    } else {
      updateMembershipPackage(finalPkg.id, finalPkg);
    }
    handleCloseModal();
  };

  // Quick toggle Recommended flag
  const handleToggleRecommended = (pkgId) => {
    const target = membershipPackages.find(p => p.id === pkgId);
    if (!target) return;
    const newRecommended = !target.recommended;
    updateMembershipPackage(pkgId, { recommended: newRecommended });
    showToast(newRecommended ? `Đã đặt "${target.name}" làm gói nổi bật khuyên dùng!` : `Đã bỏ cờ khuyên dùng của "${target.name}".`, 'info');
  };

  // Quick toggle Scheduled Publishing flag per package
  const handleTogglePackageSchedule = (pkgId, isEnabled) => {
    const target = membershipPackages.find(p => p.id === pkgId);
    if (!target) return;
    updateMembershipPackage(pkgId, { ...target, allowScheduledPublishing: isEnabled });
    showToast(
      isEnabled
        ? `Đã BẬT tiện ích Hẹn giờ đăng tin cho "${target.name}"!`
        : `Đã TẮT tiện ích Hẹn giờ đăng tin cho "${target.name}"!`,
      'success'
    );
  };

  // Quick toggle Future Start Date flag per package
  const handleTogglePackageFutureStartDate = (pkgId, isEnabled) => {
    const target = membershipPackages.find(p => p.id === pkgId);
    if (!target) return;
    updateMembershipPackage(pkgId, { ...target, allowFutureStartDate: isEnabled });
    showToast(
      isEnabled
        ? `Đã BẬT quyền chọn Ngày bắt đầu tương lai cho "${target.name}"!`
        : `Đã TẮT quyền chọn Ngày bắt đầu tương lai cho "${target.name}"!`,
      'success'
    );
  };

  // Quick toggle Treasure Hunt flag per package
  const handleTogglePackageTreasureHunt = (pkgId, isEnabled) => {
    const target = membershipPackages.find(p => p.id === pkgId);
    if (!target) return;
    const currentMax = target.treasureHuntMaxArticles !== undefined ? target.treasureHuntMaxArticles : (pkgId === 'member-premium' ? 5 : 2);
    updateMembershipPackage(pkgId, { ...target, allowTreasureHunt: isEnabled, treasureHuntMaxArticles: currentMax });
    showToast(
      isEnabled
        ? `Đã BẬT đặc quyền Săn Kho Báu (Tối đa ${currentMax} tin) cho "${target.name}"!`
        : `Đã TẮT đặc quyền Săn Kho Báu cho "${target.name}"!`,
      'success'
    );
  };

  // Quick Clone Package
  const handleClonePackage = (pkg) => {
    const cloned = {
      ...JSON.parse(JSON.stringify(pkg)),
      id: `member-${Date.now()}`,
      name: `${pkg.name} (Bản sao)`,
      shortName: `${pkg.shortName} (COPY)`,
      recommended: false
    };
    addMembershipPackage(cloned);
  };

  // Delete Package
  const handleConfirmDelete = (id) => {
    deleteMembershipPackage(id);
    setConfirmDeleteId(null);
  };

  // Calculate total monthly voucher value for editing package
  const calcTotalVoucherValue = (vouchers) => {
    if (!vouchers) return 0;
    const pubVal = (vouchers.normalPublishVouchers || 0) * (vouchers.normalPublishDiscount ?? defaultNormalRate);
    const bumpVal = (vouchers.normalBumpVouchers || 0) * (vouchers.normalBumpDiscount || 10000);
    const vipVal = (vouchers.vipVouchers || 0) * (vouchers.vipDiscount || 50000);
    return pubVal + bumpVal + vipVal;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ================= 1. HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl font-black shrink-0">
            <i className="fa-solid fa-crown"></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
              <span>Gói Hội Viên</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                {(membershipPackages || []).length} Gói Đang Hoạt Động
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Quản lý và tùy chỉnh toàn diện thông tin các gói hội viên: đơn giá, chu kỳ thanh toán (1/3/6 tháng), kho voucher cấp mỗi 30 ngày, danh sách đặc quyền và nhận diện thương hiệu.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-circle-plus"></i>
            <span>+ Thêm Gói Hội Viên Mới</span>
          </button>
        </div>
      </div>

      {/* ================= 1.5. CẤU HÌNH ĐƠN GIÁ CHUNG CHO 3 LOẠI VOUCHER HỘI VIÊN ================= */}
      <AdminCommonVoucherPricing />

      {/* ================= 2. QUICK STATS SUMMARY ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Số Gói</div>
          <div className="text-xl font-black text-white mt-1">{(membershipPackages || []).length} Gói</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Sẵn sàng đăng ký</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gói Nổi Bật</div>
          <div className="text-xl font-black text-amber-400 mt-1 truncate">
            {(membershipPackages || []).find(p => p.recommended)?.shortName || 'Chưa thiết lập'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Đánh dấu khuyên dùng</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiết Kiệm Tối Đa</div>
          <div className="text-xl font-black text-red-400 mt-1">
            {Math.max(...(membershipPackages || []).map(p => p.savePercent || 0))}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">So với mua lẻ tin đăng</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kho Voucher Max</div>
          <div className="text-xl font-black text-cyan-400 mt-1">
            {Math.max(...(membershipPackages || []).map(p => (p.vouchersPerCycle?.normalPublishVouchers || 0) + (p.vouchersPerCycle?.normalBumpVouchers || 0)))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Voucher cấp mỗi 30 ngày</div>
        </div>
      </div>

      {/* ================= 3. MEMBERSHIP PACKAGES CARDS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {(membershipPackages || []).map(pkg => {
          const totalVoucherValue = calcTotalVoucherValue(pkg.vouchersPerCycle);

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 bg-slate-950 border flex flex-col justify-between transition-all duration-200 relative ${
                pkg.recommended
                  ? 'border-amber-500/60 shadow-xl shadow-amber-500/5 ring-2 ring-amber-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase px-3.5 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                  <i className="fa-solid fa-star text-[9px]"></i>
                  <span>Gói Phổ Biến & Khuyên Dùng</span>
                </div>
              )}

              <div>
                {/* Header Badge & Action Icons */}
                <div className="flex items-center justify-between mb-3 pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${pkg.badgeColor || 'bg-emerald-600 text-white'}`}>
                    {pkg.badge || pkg.shortName}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleRecommended(pkg.id)}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        pkg.recommended ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-amber-400 hover:bg-slate-900'
                      }`}
                      title={pkg.recommended ? 'Bỏ cờ khuyên dùng' : 'Đặt làm gói khuyên dùng'}
                    >
                      <i className={`fa-star ${pkg.recommended ? 'fa-solid' : 'fa-regular'}`}></i>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClonePackage(pkg)}
                      className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-cyan-400 hover:bg-slate-900 transition"
                      title="Nhân bản (sao chép) gói này"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(pkg.id)}
                      className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                      title="Xóa gói hội viên này"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                {/* Name & Audience */}
                <h4 className="text-lg font-black text-white flex items-center justify-between gap-2">
                  <span>{pkg.name}</span>
                  <span className="text-xs font-bold text-red-400 shrink-0 font-mono">
                    -{pkg.savePercent}%
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                  {pkg.targetAudience}
                </p>

                {/* Price Display */}
                <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Đơn giá niêm yết:
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                      {Number(pkg.monthlyPrice || 0).toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">VNĐ / tháng</span>
                  </div>

                  {/* Billing cycles preview */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                    {(pkg.billingCycles || []).map(c => (
                      <div key={c.months} className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Chu kỳ {c.label} ({c.duration_days || (c.months * 30)} ngày):</span>
                        <span className="font-mono font-bold text-slate-200">
                          {Number(c.price || 0).toLocaleString('vi-VN')} đ
                          {c.discount > 0 && (
                            <span className="text-emerald-400 font-normal ml-1">(-{c.discount}%)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vouchers Per 30-Day Cycle */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-ticket text-emerald-400"></i>
                      <span>Kho Voucher Cấp Mỗi 30 Ngày:</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold" title="Tổng giá trị voucher nhận được mỗi chu kỳ">
                      ~{totalVoucherValue.toLocaleString('vi-VN')} đ/tháng
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/40">
                      <span className="text-slate-300">• Voucher Đăng Tin Thường:</span>
                      <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                        <span>{pkg.vouchersPerCycle?.normalPublishVouchers || 0} voucher</span>
                        {isVoucherDiscountFree('normalPublish', pkg.vouchersPerCycle?.normalPublishDiscount ?? defaultNormalRate, pricingOptions) ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">Miễn Phí</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">(-{Math.round((pkg.vouchersPerCycle?.normalPublishDiscount || defaultNormalRate) / 1000)}k)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/40">
                      <span className="text-slate-300">• Voucher Đẩy Tin:</span>
                      <span className="text-amber-400 font-mono font-bold flex items-center gap-1.5">
                        <span>{pkg.vouchersPerCycle?.normalBumpVouchers || 0} voucher</span>
                        {isVoucherDiscountFree('normalBump', pkg.vouchersPerCycle?.normalBumpDiscount ?? 10000, pricingOptions) ? (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">Miễn Phí</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">(-{Math.round((pkg.vouchersPerCycle?.normalBumpDiscount || 10000) / 1000)}k)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/40">
                      <span className="text-slate-300">• Voucher Giảm Tin VIP:</span>
                      <span className={`font-mono font-bold ${(pkg.vouchersPerCycle?.vipVouchers || 0) > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {(pkg.vouchersPerCycle?.vipVouchers || 0) > 0 
                          ? `${pkg.vouchersPerCycle.vipVouchers} voucher (-${(pkg.vouchersPerCycle.vipDiscount || 50000) / 1000}k)`
                          : 'Không áp dụng'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Privileges Preview */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Quyền Lợi & Đặc Quyền:</span>
                    <span className="text-slate-500">{(pkg.features || []).length} mục</span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 max-h-36 overflow-y-auto pr-1">
                    {getResolvedFeatures(pkg, pricingOptions).slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 text-[10px] shrink-0"></i>
                        <span className="leading-tight text-slate-300">{feat}</span>
                      </div>
                    ))}
                    {getResolvedFeatures(pkg, pricingOptions).length > 4 && (
                      <div className="text-[10px] text-amber-400/90 font-bold pl-3.5 pt-0.5">
                        + {getResolvedFeatures(pkg).length - 4} đặc quyền khác...
                      </div>
                    )}
                  </div>
                </div>

                {/* Per-package Scheduled Publishing Switch Toggle */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      pkg.allowScheduledPublishing 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      <i className="fa-regular fa-clock text-xs"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Hẹn Giờ Đăng:</span>
                        {pkg.allowScheduledPublishing ? (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded-full">
                            ● BẬT
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full">
                            ○ TẮT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {pkg.allowScheduledPublishing ? 'Mở khóa khung giờ vàng' : 'Không có quyền hẹn giờ'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePackageSchedule(pkg.id, !pkg.allowScheduledPublishing)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pkg.allowScheduledPublishing ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={pkg.allowScheduledPublishing ? `Bấm để TẮT hẹn giờ cho ${pkg.name}` : `Bấm để BẬT hẹn giờ cho ${pkg.name}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        pkg.allowScheduledPublishing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Per-package Future Start Date Switch Toggle */}
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      pkg.allowFutureStartDate 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      <i className="fa-regular fa-calendar-days text-xs"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Ngày Tương Lai:</span>
                        {pkg.allowFutureStartDate ? (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded-full">
                            ● BẬT
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full">
                            ○ TẮT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {pkg.allowFutureStartDate ? 'Mở khóa chọn ngày đăng tương lai' : 'Bắt buộc đăng ngày hiện tại'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePackageFutureStartDate(pkg.id, !pkg.allowFutureStartDate)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pkg.allowFutureStartDate ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={pkg.allowFutureStartDate ? `Bấm để TẮT chọn ngày tương lai cho ${pkg.name}` : `Bấm để BẬT chọn ngày tương lai cho ${pkg.name}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        pkg.allowFutureStartDate ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Per-package Treasure Hunt Switch Toggle */}
                <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      pkg.allowTreasureHunt 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      <i className="fa-solid fa-gift text-xs"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Săn Kho Báu:</span>
                        {pkg.allowTreasureHunt ? (
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.2 rounded-full">
                            ● BẬT ({pkg.treasureHuntMaxArticles || 2} tin)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full">
                            ○ TẮT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {pkg.allowTreasureHunt ? `Ưu tiên gắn tối đa ${pkg.treasureHuntMaxArticles || 2} bài vào Săn Kho Báu` : 'Không có quyền gắn tin Kho Báu'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePackageTreasureHunt(pkg.id, !pkg.allowTreasureHunt)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      pkg.allowTreasureHunt ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    title={pkg.allowTreasureHunt ? `Bấm để TẮT quyền Săn Kho Báu cho ${pkg.name}` : `Bấm để BẬT quyền Săn Kho Báu cho ${pkg.name}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        pkg.allowTreasureHunt ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Button: Edit Details */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(pkg)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:border-amber-500 transition flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <i className="fa-solid fa-pen-to-square text-amber-400 group-hover:scale-110 transition"></i>
                  <span>Tùy Chỉnh Thông Tin Gói</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 4. CONFIRM DELETE DIALOG ================= */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 className="text-base font-black text-white">Xác Nhận Xóa Gói Hội Viên?</h4>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa gói hội viên{' '}
              <strong className="text-white">
                {(membershipPackages || []).find(p => p.id === confirmDeleteId)?.name}
              </strong>{' '}
              khỏi sàn giao dịch? Người dùng sẽ không thể đăng ký mới gói này.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. FULL CUSTOMIZATION MODAL (TÙY CHỈNH THÔNG TIN GÓI HỘI VIÊN) ================= */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold shrink-0">
                  <i className={`fa-solid ${isCreatingNew ? 'fa-plus' : 'fa-pen-to-square'}`}></i>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{isCreatingNew ? 'Thêm Mới Gói Hội Viên' : `Tùy Chỉnh Thông Tin: ${editingPkg.name}`}</span>
                    {editingPkg.recommended && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        ★ Gói Khuyên Dùng
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cập nhật toàn diện tên, đơn giá, chiết khấu chu kỳ, kho voucher 30 ngày và các quyền lợi đi kèm.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800 cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950 shrink-0 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setModalActiveTab('general')}
                className={`pb-3 px-3 font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  modalActiveTab === 'general'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fa-solid fa-id-card"></i>
                <span>1. Nhận Diện & Cơ Bản</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab('pricing')}
                className={`pb-3 px-3 font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  modalActiveTab === 'pricing'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fa-solid fa-tags"></i>
                <span>2. Đơn Giá & Chu Kỳ (1/3/6 tháng)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab('vouchers')}
                className={`pb-3 px-3 font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  modalActiveTab === 'vouchers'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fa-solid fa-ticket"></i>
                <span>3. Kho Voucher 30 Ngày</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab('features')}
                className={`pb-3 px-3 font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
                  modalActiveTab === 'features'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <i className="fa-solid fa-list-check"></i>
                <span>4. Danh Sách Đặc Quyền ({editingPkg.features?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body: Split view (Edit Form + Realtime Preview) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Form Editor (8 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* TAB 1: GENERAL & BRANDING */}
                  {modalActiveTab === 'general' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">
                            Tên Đầy Đủ Gói Hội Viên <span className="text-red-400">*</span>:
                          </label>
                          <input
                            type="text"
                            value={editingPkg.name || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="Ví dụ: Gói Hội Viên Tiêu Chuẩn"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Tên Ngắn / Nhãn Viết Tắt (In Hoa):
                          </label>
                          <input
                            type="text"
                            value={editingPkg.shortName || ''}
                            onChange={(e) => handleFieldChange('shortName', e.target.value)}
                            placeholder="Ví dụ: GÓI TIÊU CHUẨN"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Mức Tiết Kiệm Hiển Thị (%):
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingPkg.savePercent || 0}
                              onChange={(e) => handleFieldChange('savePercent', Number(e.target.value))}
                              placeholder="33"
                              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500 pr-8"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Nhãn Huy Hiệu (Badge Text):
                          </label>
                          <input
                            type="text"
                            value={editingPkg.badge || ''}
                            onChange={(e) => handleFieldChange('badge', e.target.value)}
                            placeholder="Ví dụ: BÁN CHẠY NHẤT 🔥"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Màu Sắc Huy Hiệu (Badge Color):
                          </label>
                          <select
                            value={editingPkg.badgeColor || ''}
                            onChange={(e) => handleFieldChange('badgeColor', e.target.value)}
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                          >
                            {BADGE_COLOR_PRESETS.map(preset => (
                              <option key={preset.id} value={preset.class}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">
                            Đối Tượng Áp Dụng / Mô Tả Khách Hàng Mục Tiêu:
                          </label>
                          <textarea
                            rows={2}
                            value={editingPkg.targetAudience || ''}
                            onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                            placeholder="Ví dụ: Môi giới chuyên nghiệp, giỏ hàng từ ~10 BĐS cần tối ưu chi phí đăng tin..."
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* Recommended Flag Toggle */}
                      <label className="flex items-center gap-3 p-3.5 bg-slate-900/60 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={editingPkg.recommended || false}
                          onChange={(e) => handleFieldChange('recommended', e.target.checked)}
                          className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 focus:ring-amber-400 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <span>Đánh dấu là "Gói Khuyên Dùng & Bán Chạy Nhất"</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              ★ Recommended
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Gói này sẽ được gắn dải banner ánh vàng nổi bật và hiệu ứng viền phát sáng thu hút khách hàng trên trang Hội viên.
                          </p>
                        </div>
                      </label>

                      {/* Scheduled Publishing Feature Toggle */}
                      <label className="flex items-center gap-3 p-3.5 bg-slate-900/60 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={Boolean(editingPkg.allowScheduledPublishing)}
                          onChange={(e) => handleFieldChange('allowScheduledPublishing', e.target.checked)}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-400 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <i className="fa-regular fa-clock text-amber-400"></i>
                            <span>Bật Tiện Ích "Hẹn Giờ Đăng Tin (Khung Giờ Vàng)" Cho Gói Này</span>
                            {editingPkg.allowScheduledPublishing ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                ✓ Đang Bật
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                                ○ Đang Tắt
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Khi bật, người đăng có gói hội viên này sẽ được mở khóa các khung giờ hẹn đăng tự động (08:00, 11:30, 14:00, 19:30).
                          </p>
                        </div>
                      </label>

                      {/* Future Start Date Feature Toggle */}
                      <label className="flex items-center gap-3 p-3.5 bg-slate-900/60 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={Boolean(editingPkg.allowFutureStartDate)}
                          onChange={(e) => handleFieldChange('allowFutureStartDate', e.target.checked)}
                          className="w-4 h-4 text-blue-500 rounded border-slate-700 bg-slate-800 focus:ring-blue-400 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <i className="fa-regular fa-calendar-days text-blue-400"></i>
                            <span>Bật Tiện Ích "Chọn Ngày Bắt Đầu Tương Lai" Cho Gói Này</span>
                            {editingPkg.allowFutureStartDate ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                ✓ Đang Bật
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                                ○ Đang Tắt
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Khi bật, người đăng có gói hội viên này được tự do chọn ngày bắt đầu đăng tin trong tương lai. Nếu tắt, bài viết bắt buộc phải xuất bản vào ngày hiện tại.
                          </p>
                        </div>
                      </label>

                      {/* Treasure Hunt Feature Toggle & Quota Config */}
                      <div className="p-3.5 bg-slate-900/60 hover:bg-slate-900 rounded-2xl border border-slate-800 space-y-3 transition">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingPkg.allowTreasureHunt)}
                            onChange={(e) => handleFieldChange('allowTreasureHunt', e.target.checked)}
                            className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 focus:ring-amber-400 shrink-0"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-white text-xs flex items-center gap-2">
                              <i className="fa-solid fa-gift text-amber-400"></i>
                              <span>Bật Đặc Quyền "Gắn Tin Vào Săn Kho Báu BĐS" Cho Gói Này</span>
                              {editingPkg.allowTreasureHunt ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                  ✓ Đang Bật
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                                  ○ Đang Tắt
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Hội viên sở hữu gói này được phép tự chọn các bài đăng của mình trong trang Quản lý tin để gắn rương quà trong mục "Săn Kho Báu BĐS". Hệ thống ưu tiên hiển thị hàng đầu theo cấp độ VIP Kim Cương ⟶ VIP Vàng ⟶ VIP Bạc ⟶ Tin Thường để tăng đột biến lượt xem và tương tác.
                            </p>
                          </div>
                        </label>

                        {/* Ô cấu hình số lượng tin tối đa được gắn Săn Kho Báu */}
                        {Boolean(editingPkg.allowTreasureHunt) && (
                          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-4">
                            <div>
                              <label className="block text-slate-300 font-bold text-xs">
                                Số Lượng Tin Tối Đa Được Gắn Săn Kho Báu:
                              </label>
                              <span className="text-[10px] text-slate-400">
                                Giới hạn số bài đăng hội viên được chọn trong trang Quản lý tin
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={editingPkg.treasureHuntMaxArticles !== undefined ? editingPkg.treasureHuntMaxArticles : 2}
                                onChange={(e) => handleFieldChange('treasureHuntMaxArticles', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-center font-bold text-amber-400 text-sm focus:border-amber-400 focus:outline-none"
                              />
                              <span className="text-xs text-slate-400 font-medium">tin rao</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRICING & BILLING CYCLES */}
                  {modalActiveTab === 'pricing' && (
                    <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="block text-slate-300 font-bold">
                              Đơn Giá Cơ Bản Theo Tháng (VNĐ / Tháng) <span className="text-red-400">*</span>:
                            </label>
                            <p className="text-[11px] text-slate-400">Đơn giá chuẩn khi người dùng chọn thanh toán chu kỳ 1 tháng</p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAutoCalculateCycles}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-xs transition flex items-center gap-1.5 w-max"
                            title="Tự động tính giá 3 tháng (-5%) và 6 tháng (-10%) theo đơn giá tháng"
                          >
                            <i className="fa-solid fa-calculator"></i>
                            <span>Tự Tính Chu Kỳ 3T & 6T</span>
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="number"
                            step="1000"
                            value={editingPkg.monthlyPrice || 0}
                            onChange={(e) => handleFieldChange('monthlyPrice', Number(e.target.value))}
                            placeholder="599000"
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono text-base font-black outline-none focus:border-amber-500"
                          />
                          <span className="absolute right-3.5 top-3 text-slate-400 font-bold">VNĐ</span>
                        </div>
                      </div>

                      {/* Detailed Billing Cycles list */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                            <i className="fa-solid fa-calendar-days text-teal-400"></i>
                            <span>Chi Tiết Giá & Thời Hạn Ngày Dùng (duration_days) Từng Chu Kỳ:</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCustomCycle}
                            className="px-2.5 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
                          >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm Chu Kỳ Mới</span>
                          </button>
                        </div>

                        {(editingPkg.billingCycles || []).map((cycle, idx) => (
                          <div key={cycle.months || idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono">
                                  {idx + 1}
                                </span>
                                <span>Kỳ Hạn: <strong>{cycle.label}</strong> ({cycle.months} tháng)</span>
                                <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-mono font-bold">
                                  ⏱ {cycle.duration_days ?? (cycle.durationDays || cycle.months * 30)} ngày dùng
                                </span>
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                  Chiết khấu: {cycle.discount || 0}%
                                </span>
                                {(editingPkg.billingCycles || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCycle(idx)}
                                    className="w-5 h-5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 flex items-center justify-center text-[10px] transition"
                                    title="Xóa chu kỳ này"
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                              <div>
                                <label className="block text-[10px] text-teal-400 font-bold mb-0.5">Thời Hạn Dùng (Ngày):</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={cycle.duration_days ?? (cycle.durationDays || cycle.months * 30)}
                                  onChange={(e) => handleBillingCycleChange(idx, 'duration_days', e.target.value)}
                                  className="w-full p-2 bg-slate-950 border border-teal-700/60 rounded-lg text-teal-300 font-mono text-xs font-bold outline-none focus:border-teal-400 shadow-inner"
                                  placeholder="Ví dụ: 30, 90, 365"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Tổng Tiền Thu (VNĐ):</label>
                                <input
                                  type="number"
                                  step="1000"
                                  value={cycle.price || 0}
                                  onChange={(e) => handleBillingCycleChange(idx, 'price', e.target.value)}
                                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs font-bold outline-none focus:border-amber-500"
                                />
                                {cycle.months > 1 && (
                                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 truncate">
                                    ~{Math.round((cycle.price || 0) / cycle.months).toLocaleString('vi-VN')} đ/tháng
                                  </span>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">% Giảm Giá (Discount):</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={cycle.discount || 0}
                                  onChange={(e) => handleBillingCycleChange(idx, 'discount', e.target.value)}
                                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Ghi Chú Ưu Đãi:</label>
                                <input
                                  type="text"
                                  value={cycle.note || ''}
                                  onChange={(e) => handleBillingCycleChange(idx, 'note', e.target.value)}
                                  placeholder="Tiết kiệm thêm 10%"
                                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VOUCHERS QUOTAS PER 30 DAYS */}
                  {modalActiveTab === 'vouchers' && (
                    <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                      <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-emerald-300 flex items-center gap-2">
                            <span>Kho Voucher Cấp Mỗi Chu Kỳ 30 Ngày</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                              Đơn giá chung: 3 Gói
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Đơn giá giảm được cấu hình chung cho cả 3 gói. Tại đây bạn thiết lập số lượng voucher cấp phát cho gói này.
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-slate-400">Tổng Trị Giá Ước Tính:</div>
                          <div className="text-sm font-black text-cyan-300 font-mono">
                            ~{calcTotalVoucherValue(editingPkg.vouchersPerCycle).toLocaleString('vi-VN')} đ/tháng
                          </div>
                        </div>
                      </div>

                      {/* 1. Normal Publish Voucher */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                              <i className="fa-solid fa-file-lines"></i>
                            </span>
                            <span className="font-bold text-white text-xs">Voucher Đăng Tin Thường:</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
                            <span>Giảm {Number(commonPublishDiscount).toLocaleString('vi-VN')} đ/tin</span>
                            {isVoucherDiscountFree('normalPublish', commonPublishDiscount, pricingOptions) && (
                              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-black border border-emerald-500/40 uppercase">Miễn Phí</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1">Số Lượng Voucher Cấp Mỗi 30 Ngày:</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={editingPkg.vouchersPerCycle?.normalPublishVouchers || 0}
                              onChange={(e) => handleVoucherQuotaChange('normalPublishVouchers', e.target.value)}
                              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-teal-500 text-sm"
                              placeholder="15"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-bold">Voucher</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Normal Bump Voucher */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                              <i className="fa-solid fa-arrow-up"></i>
                            </span>
                            <span className="font-bold text-white text-xs">Voucher Đẩy Tin (Bump Service):</span>
                          </div>
                          <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40 flex items-center gap-1.5">
                            <span>Giảm {Number(commonBumpDiscount).toLocaleString('vi-VN')} đ/lượt</span>
                            {isVoucherDiscountFree('normalBump', commonBumpDiscount, pricingOptions) && (
                              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-black border border-emerald-500/40 uppercase">Miễn Phí</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1">Số Lượng Voucher Cấp Mỗi 30 Ngày:</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={editingPkg.vouchersPerCycle?.normalBumpVouchers || 0}
                              onChange={(e) => handleVoucherQuotaChange('normalBumpVouchers', e.target.value)}
                              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-teal-500 text-sm"
                              placeholder="15"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-bold">Voucher</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. VIP Publish Voucher */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                              <i className="fa-solid fa-gem"></i>
                            </span>
                            <span className="font-bold text-white text-xs">Voucher Giảm Giá Tin VIP (Kim Cương / Vàng):</span>
                          </div>
                          <span className="text-[11px] text-rose-400 font-mono font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/40">
                            Giảm {Number(commonVipDiscount).toLocaleString('vi-VN')} đ/tin
                          </span>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1">Số Lượng Voucher Cấp Mỗi 30 Ngày (0 = Không áp dụng):</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={editingPkg.vouchersPerCycle?.vipVouchers || 0}
                              onChange={(e) => handleVoucherQuotaChange('vipVouchers', e.target.value)}
                              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-red-400 font-mono font-bold outline-none focus:border-teal-500 text-sm"
                              placeholder="0"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-bold">Voucher</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PRIVILEGES & FEATURES LIST */}
                  {modalActiveTab === 'features' && (
                    <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                      {/* Input to add new feature */}
                      <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                        <label className="block text-slate-300 font-bold">Thêm Đặc Quyền / Tiện Ích Mới:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newFeatureInput}
                            onChange={(e) => setNewFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddFeature();
                              }
                            }}
                            placeholder="Nhập nội dung đặc quyền (ví dụ: Miễn phí đẩy tin giờ vàng mỗi ngày)..."
                            className="flex-1 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddFeature()}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shrink-0 cursor-pointer"
                          >
                            + Thêm
                          </button>
                        </div>

                        {/* Quick suggestions */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                            Gợi ý đặc quyền chuẩn BĐS (Bấm để thêm nhanh):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {SUGGESTED_FEATURES.map((sug, sIdx) => {
                              const alreadyHas = editingPkg.features?.includes(sug);
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  disabled={alreadyHas}
                                  onClick={() => handleAddFeature(sug)}
                                  className={`text-[10px] px-2 py-1 rounded-lg border transition text-left ${
                                    alreadyHas
                                      ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400 cursor-pointer'
                                  }`}
                                >
                                  {alreadyHas ? '✓ ' : '+ '}{sug}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Current features list (reorder & edit) */}
                      <div className="space-y-2">
                        <div className="font-bold text-slate-300 text-xs flex items-center justify-between">
                          <span>Danh Sách Đặc Quyền Hiện Có ({(editingPkg.features || []).length}):</span>
                          <span className="text-[10px] text-slate-500">Kéo hoặc dùng mũi tên để sắp xếp</span>
                        </div>

                        {(editingPkg.features || []).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 group">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                              {idx + 1}
                            </span>

                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                              className="flex-1 bg-transparent border-none text-white text-xs outline-none focus:ring-1 focus:ring-amber-400 rounded px-1"
                            />

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveFeature(idx, -1)}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] disabled:opacity-30 cursor-pointer"
                                title="Di chuyển lên"
                              >
                                <i className="fa-solid fa-arrow-up"></i>
                              </button>

                              <button
                                type="button"
                                disabled={idx === editingPkg.features.length - 1}
                                onClick={() => handleMoveFeature(idx, 1)}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] disabled:opacity-30 cursor-pointer"
                                title="Di chuyển xuống"
                              >
                                <i className="fa-solid fa-arrow-down"></i>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="w-6 h-6 rounded bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                                title="Xóa đặc quyền này"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Real-time Live Preview Card (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-eye text-cyan-400"></i>
                      <span>Xem Trước Trực Quan (Live Preview):</span>
                    </span>

                    {/* Cycle Toggle in Preview */}
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewCycle(1)}
                        className={`px-2 py-0.5 rounded-lg transition ${previewCycle === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                      >
                        1T
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewCycle(3)}
                        className={`px-2 py-0.5 rounded-lg transition ${previewCycle === 3 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                      >
                        3T
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewCycle(6)}
                        className={`px-2 py-0.5 rounded-lg transition ${previewCycle === 6 ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                      >
                        6T
                      </button>
                    </div>
                  </div>

                  {/* Rendered Card replicating MembershipPage.jsx */}
                  {(() => {
                    const activeCycle = editingPkg.billingCycles?.find(c => c.months === previewCycle) || {
                      months: previewCycle,
                      price: (editingPkg.monthlyPrice || 0) * previewCycle,
                      discount: 0
                    };

                    return (
                      <div className={`rounded-3xl p-6 bg-white text-slate-900 border-2 transition-all relative shadow-2xl ${
                        editingPkg.recommended 
                          ? 'border-amber-500 ring-4 ring-amber-400/20' 
                          : 'border-slate-200'
                      }`}>
                        {editingPkg.recommended && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase px-3.5 py-0.5 rounded-full shadow-md tracking-wider">
                            ★ Gói Phổ Biến & Bán Chạy Nhất
                          </div>
                        )}

                        {/* Top Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${editingPkg.badgeColor || 'bg-emerald-600 text-white'}`}>
                            {editingPkg.badge || editingPkg.shortName}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 font-mono">
                            Chu kỳ {previewCycle} tháng
                          </span>
                        </div>

                        <h4 className="text-xl font-black text-slate-900">{editingPkg.name || 'Tên Gói Hội Viên'}</h4>
                        <p className="text-xs text-slate-500 mt-1 min-h-[32px] line-clamp-2">
                          {editingPkg.targetAudience || 'Mô tả đối tượng khách hàng phù hợp...'}
                        </p>

                        {/* Price box */}
                        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                              {Number(activeCycle.price || 0).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-xs font-bold text-slate-500">đ / {previewCycle} tháng</span>
                          </div>

                          {previewCycle > 1 && (
                            <div className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
                              <span>(tương đương</span>
                              <strong className="text-emerald-700 font-black font-mono">
                                ~{Math.round(Number(activeCycle.price || 0) / previewCycle).toLocaleString('vi-VN')} đ
                              </strong>
                              <span>/ tháng)</span>
                            </div>
                          )}

                          {previewCycle > 1 && (
                            <div className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                              <i className="fa-solid fa-tag text-[10px]"></i>
                              <span>{activeCycle.note || `Tiết kiệm thêm khi đăng ký ${previewCycle} tháng`}</span>
                            </div>
                          )}
                        </div>

                        {/* Monthly Vouchers */}
                        <div className="space-y-2 pt-2 pb-3 border-t border-slate-100 text-xs">
                          <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <i className="fa-solid fa-ticket text-emerald-600"></i>
                            <span>Kho Voucher Cấp Mỗi 30 Ngày:</span>
                          </div>

                          <div className="space-y-1.5">
                            {(() => {
                              const pubDisc = editingPkg.vouchersPerCycle?.normalPublishDiscount ?? defaultNormalRate;
                              const isPubFree = isVoucherDiscountFree('normalPublish', pubDisc, pricingOptions);
                              return (
                                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                                      {editingPkg.vouchersPerCycle?.normalPublishVouchers || 0}
                                    </span>
                                    <span className="font-bold text-emerald-950 text-[11px]">Voucher Đăng Tin Thường</span>
                                  </div>
                                  {isPubFree ? (
                                    <span className="text-emerald-700 font-black text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                      Miễn Phí
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 font-black text-[10px]">
                                      -{Number(pubDisc).toLocaleString('vi-VN')} đ/lần
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            {(() => {
                              const bumpDisc = editingPkg.vouchersPerCycle?.normalBumpDiscount || 10000;
                              const isBumpFree = isVoucherDiscountFree('normalBump', bumpDisc, pricingOptions);
                              return (
                                <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                                      {editingPkg.vouchersPerCycle?.normalBumpVouchers || 0}
                                    </span>
                                    <span className="font-bold text-blue-950 text-[11px]">Voucher Đẩy Tin</span>
                                  </div>
                                  {isBumpFree ? (
                                    <span className="text-blue-700 font-black text-[10px] bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                                      Miễn Phí
                                    </span>
                                  ) : (
                                    <span className="text-blue-700 font-black text-[10px]">
                                      -{Number(bumpDisc).toLocaleString('vi-VN')} đ/lần
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            {(editingPkg.vouchersPerCycle?.vipVouchers || 0) > 0 && (
                              <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                                    {editingPkg.vouchersPerCycle.vipVouchers}
                                  </span>
                                  <span className="font-bold text-amber-950 text-[11px]">Voucher Giảm Tin VIP</span>
                                </div>
                                <span className="text-amber-800 font-black text-[10px]">
                                  -{(editingPkg.vouchersPerCycle.vipDiscount || 50000).toLocaleString('vi-VN')} đ/tin
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                            Quyền lợi đi kèm:
                          </div>
                          {getResolvedFeatures(editingPkg, pricingOptions).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                              <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-[10px] shrink-0"></i>
                              <span className="leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA button */}
                        <div className="mt-5 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-2 ${
                              editingPkg.recommended
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            <i className="fa-solid fa-crown text-xs"></i>
                            <span>Đăng Ký {editingPkg.shortName}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60 shrink-0">
              <div className="text-[11px] text-slate-400">
                Thay đổi sẽ có hiệu lực ngay lập tức cho tất cả khách hàng trên sàn BĐS.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>{isCreatingNew ? 'Tạo Gói Hội Viên' : 'Lưu Thay Đổi Gói'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
