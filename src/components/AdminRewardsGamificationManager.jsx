'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function AdminRewardsGamificationManager() {
  const { 
    rewardsConfig, 
    updateRewardsConfig, 
    resetRewardsConfig, 
    DEFAULT_REWARDS_CONFIG, 
    showToast 
  } = useRealEstate();

  // Local state form
  const [activeSubTab, setActiveSubTab] = useState('treasure'); // 'promotions', 'missions', 'checkin', 'treasure', 'predictions'
  const [formData, setFormData] = useState(rewardsConfig || DEFAULT_REWARDS_CONFIG);

  // Sync when context changes
  useEffect(() => {
    if (rewardsConfig) {
      setFormData(rewardsConfig);
    }
  }, [rewardsConfig]);

  // Modal thêm/sửa khuyến mãi
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoModalOpen, setPromoModalOpen] = useState(false);

  // Modal thêm/sửa nhiệm vụ
  const [editingMission, setEditingMission] = useState(null);
  const [missionCategory, setMissionCategory] = useState('tan-thu');
  const [missionModalOpen, setMissionModalOpen] = useState(false);

  // 1. Lưu toàn bộ cấu hình
  const handleSaveAll = async () => {
    const minAmt = Number(formData.treasureHuntConfig?.minAmount || 2000);
    const maxAmt = Number(formData.treasureHuntConfig?.maxAmount || 20000);
    if (minAmt > maxAmt) {
      if (showToast) showToast('Cảnh báo: Tiền thưởng Min không được lớn hơn Max!', 'warning');
      return;
    }

    if (updateRewardsConfig) {
      await updateRewardsConfig(formData);
    }
  };

  // 2. Khôi phục mặc định
  const handleResetDefault = async () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ Khuyến mãi, Nhiệm vụ và Phần thưởng về mặc định không?')) {
      if (resetRewardsConfig) {
        await resetRewardsConfig();
      }
      setFormData(DEFAULT_REWARDS_CONFIG);
    }
  };

  // === XỬ LÝ KHUYẾN MÃI ===
  const handleSavePromo = (e) => {
    e.preventDefault();
    if (!editingPromo?.title || !editingPromo?.slug) {
      if (showToast) showToast('Vui lòng nhập tiêu đề và slug khuyến mãi!', 'warning');
      return;
    }

    setFormData(prev => {
      const exists = prev.promotions?.some(p => p.id === editingPromo.id);
      let updatedPromos = [];
      if (exists) {
        updatedPromos = prev.promotions.map(p => p.id === editingPromo.id ? editingPromo : p);
      } else {
        const newPromo = {
          ...editingPromo,
          id: editingPromo.id || `km-${Date.now()}`
        };
        updatedPromos = [...(prev.promotions || []), newPromo];
      }
      return { ...prev, promotions: updatedPromos };
    });

    setPromoModalOpen(false);
    setEditingPromo(null);
    if (showToast) showToast('Đã cập nhật chương trình khuyến mãi trong bản nháp. Nhớ bấm "Lưu Cấu Hình"!', 'info');
  };

  const handleDeletePromo = (promoId) => {
    if (confirm('Xóa chương trình khuyến mãi này?')) {
      setFormData(prev => ({
        ...prev,
        promotions: (prev.promotions || []).filter(p => p.id !== promoId)
      }));
    }
  };

  // === XỬ LÝ NHIỆM VỤ ===
  const handleSaveMission = (e) => {
    e.preventDefault();
    if (!editingMission?.title) {
      if (showToast) showToast('Vui lòng nhập tên nhiệm vụ!', 'warning');
      return;
    }

    const cat = missionCategory;
    setFormData(prev => {
      const currentList = prev.missions?.[cat] || [];
      const exists = currentList.some(m => m.id === editingMission.id);
      let updatedList = [];
      if (exists) {
        updatedList = currentList.map(m => m.id === editingMission.id ? editingMission : m);
      } else {
        const newM = {
          ...editingMission,
          id: editingMission.id || `m-${cat}-${Date.now()}`
        };
        updatedList = [...currentList, newM];
      }
      return {
        ...prev,
        missions: {
          ...prev.missions,
          [cat]: updatedList
        }
      };
    });

    setMissionModalOpen(false);
    setEditingMission(null);
    if (showToast) showToast('Đã cập nhật nhiệm vụ trong bản nháp. Nhớ bấm "Lưu Cấu Hình"!', 'info');
  };

  const handleDeleteMission = (cat, missionId) => {
    if (confirm('Xóa nhiệm vụ này?')) {
      setFormData(prev => ({
        ...prev,
        missions: {
          ...prev.missions,
          [cat]: (prev.missions?.[cat] || []).filter(m => m.id !== missionId)
        }
      }));
    }
  };

  // === XỬ LÝ ĐIỂM DANH 7 NGÀY ===
  const handleDayRewardChange = (dayNum, amount) => {
    setFormData(prev => {
      const days = (prev.checkInConfig?.days || []).map(d => {
        if (d.day === dayNum) {
          return {
            ...d,
            reward: Number(amount) || 0,
            label: `+${Number(amount || 0).toLocaleString('vi-VN')}đ vào Ví KM`
          };
        }
        return d;
      });
      return {
        ...prev,
        checkInConfig: {
          ...prev.checkInConfig,
          days
        }
      };
    });
  };

  // === XỬ LÝ SĂN KHO BÁU BÀI VIẾT ===
  const handleTreasureConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg">
            <i className="fa-solid fa-gift"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>Quản Lý Khuyến Mãi & Phần Thưởng</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Tiền mặt Ví KM
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tùy chỉnh chương trình ưu đãi, nhiệm vụ, mốc thưởng điểm danh 7 ngày và cơ chế rương kho báu bài viết.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-arrow-rotate-left mr-1.5"></i>
            Khôi phục mặc định
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Lưu Toàn Bộ Cấu Hình</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('treasure')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'treasure'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-gem text-xs"></i>
          <span>Săn Kho Báu Trong Bài Viết</span>
          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black">Hot</span>
        </button>

        <button
          onClick={() => setActiveSubTab('promotions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'promotions'
              ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-tags text-xs"></i>
          <span>Chương Trình Khuyến Mãi</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
            {(formData.promotions || []).length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('missions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'missions'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-list-check text-xs"></i>
          <span>Hệ Thống Nhiệm Vụ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('checkin')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'checkin'
              ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-calendar-check text-xs"></i>
          <span>Điểm Danh 7 Ngày</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: SĂN KHO BÁU TRONG BÀI VIẾT (TREASURE HUNT & ANTI-SPAM)
         ============================================================== */}
      {activeSubTab === 'treasure' && (
        <div className="space-y-6">
          {/* General Feature Toggle & Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-amber-400"></i>
                  Cấu Hình Hạn Mức & Chống Spam Bài Viết
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kiểm soát số lượng hộp quà mỗi ngày và điều kiện ngăn chặn công cụ gian lận F5.
                </p>
              </div>

              {/* Toggle Enable */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-xs font-bold text-slate-300">
                  {formData.treasureHuntConfig?.enabled ? 'Đang Bật' : 'Đang Tắt'}
                </span>
                <input
                  type="checkbox"
                  checked={formData.treasureHuntConfig?.enabled ?? true}
                  onChange={(e) => handleTreasureConfigChange('enabled', e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Anti-spam inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">
                  Hạn mức rương / ngày / tài khoản
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.treasureHuntConfig?.dailyLimit ?? 3}
                    onChange={(e) => handleTreasureConfigChange('dailyLimit', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Hộp</span>
                </div>
                <div className="text-[10px] text-slate-500">Người dùng chỉ được nhận tối đa số hộp này trong 1 ngày.</div>
              </div>

              <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">
                  Thời gian đọc bài tối thiểu (Anti-bot)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.treasureHuntConfig?.minReadingSeconds ?? 4}
                    onChange={(e) => handleTreasureConfigChange('minReadingSeconds', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Giây</span>
                </div>
                <div className="text-[10px] text-slate-500">Phải xem bài viết đủ số giây này mới cho phép bấm mở rương.</div>
              </div>

              <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">
                  Thời gian hồi chiêu (Cooldown)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.treasureHuntConfig?.cooldownSeconds ?? 20}
                    onChange={(e) => handleTreasureConfigChange('cooldownSeconds', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Giây</span>
                </div>
                <div className="text-[10px] text-slate-500">Giãn cách tối thiểu giữa 2 lần mở hộp quà khác nhau.</div>
              </div>
            </div>
          </div>

          {/* Cấu hình Khoảng Tiền Thưởng Ngẫu Nhiên */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-coins text-amber-400"></i>
                  Khoảng Tiền Thưởng Ngẫu Nhiên (Cộng Trực Tiếp Ví KM)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tùy chỉnh khoảng giá min (hạng thấp nhất) đến max (hạng cao nhất). Mỗi rương mở ra sẽ random số tiền trong khoảng này.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {(Number(formData.treasureHuntConfig?.minAmount || 2000)).toLocaleString('vi-VN')} đ ➔ {(Number(formData.treasureHuntConfig?.maxAmount || 20000)).toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Giá Min (Hạng Thấp Nhất)</span>
                  <span className="text-emerald-400 text-[11px] font-mono">Tối thiểu: 1.000 đ</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.treasureHuntConfig?.minAmount ?? 2000}
                    onChange={(e) => handleTreasureConfigChange('minAmount', Math.max(1000, Number(e.target.value) || 1000))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold shrink-0">VNĐ</span>
                </div>
                <div className="text-[10px] text-slate-500">Mức tiền tối thiểu người dùng nhận được khi mở rương (Mặc định: 2.000 đ).</div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Giá Max (Hạng Cao Nhất)</span>
                  <span className="text-amber-400 text-[11px] font-mono">Ví dụ: 20.000 đ</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.treasureHuntConfig?.maxAmount ?? 20000}
                    onChange={(e) => handleTreasureConfigChange('maxAmount', Math.max(1000, Number(e.target.value) || 20000))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold shrink-0">VNĐ</span>
                </div>
                <div className="text-[10px] text-slate-500">Mức tiền tối đa người dùng có thể nhận được khi mở rương (Mặc định: 20.000 đ).</div>
              </div>
            </div>

            {/* Xem trước trực quan */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div className="leading-relaxed">
                Người dùng mở rương trong các bài viết tin rao sẽ nhận ngẫu nhiên một con số từ <strong className="text-emerald-400">{(Number(formData.treasureHuntConfig?.minAmount || 2000)).toLocaleString('vi-VN')} đ</strong> đến <strong className="text-amber-400">{(Number(formData.treasureHuntConfig?.maxAmount || 20000)).toLocaleString('vi-VN')} đ</strong> (bước nhảy 1.000 đ) cộng ngay vào Ví Khuyến Mãi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: CHƯƠNG TRÌNH KHUYẾN MÃI (PROMOTIONS)
         ============================================================== */}
      {activeSubTab === 'promotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300">
              Danh sách chương trình ưu đãi hiện tại ({(formData.promotions || []).length})
            </h3>
            <button
              onClick={() => {
                setEditingPromo({
                  id: `km-${Date.now()}`,
                  title: '',
                  slug: '',
                  category: 'nap-tien',
                  categoryLabel: 'Nạp tiền ví',
                  badge: 'Mới',
                  badgeColor: 'bg-red-500 text-white',
                  discountCode: '',
                  discountValue: '50.000đ',
                  validUntil: '2026-12-31',
                  thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                  description: '',
                  content: ''
                });
                setPromoModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Thêm Khuyến Mãi Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.promotions || []).map(promo => (
              <div key={promo.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 justify-between items-start">
                <img src={promo.thumbnail} alt={promo.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase">{promo.categoryLabel}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                      {promo.discountCode}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{promo.title}</h4>
                  <div className="text-[11px] text-emerald-400 font-bold">Trị giá: {promo.discountValue}</div>
                  <div className="text-[10px] text-slate-500">Hạn dùng: {promo.validUntil}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingPromo({ ...promo });
                      setPromoModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition"
                    title="Chỉnh sửa"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    onClick={() => handleDeletePromo(promo.id)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition"
                    title="Xóa"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: HỆ THỐNG NHIỆM VỤ (MISSIONS)
         ============================================================== */}
      {activeSubTab === 'missions' && (
        <div className="space-y-6">
          {['tan-thu', 'hang-ngay', 'thanh-tuu'].map(cat => {
            const list = formData.missions?.[cat] || [];
            const catTitles = {
              'tan-thu': 'Nhiệm Vụ Tân Thủ',
              'hang-ngay': 'Nhiệm Vụ Hàng Ngày',
              'thanh-tuu': 'Nhiệm Vụ Thành Tựu'
            };

            return (
              <div key={cat} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
                    <span>{catTitles[cat]} ({list.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setMissionCategory(cat);
                      setEditingMission({
                        id: `m-${cat}-${Date.now()}`,
                        title: '',
                        reward: 10000,
                        rewardFormatted: '+10.000đ vào Ví KM',
                        icon: 'fa-solid fa-star',
                        status: 'pending',
                        description: '',
                        link: '/nha-dat-ban'
                      });
                      setMissionModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                    <span>Thêm nhiệm vụ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map(m => (
                    <div key={m.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm shrink-0">
                          <i className={m.icon}></i>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{m.title}</div>
                          <div className="text-[11px] font-black text-emerald-400">
                            +{Number(m.reward || 0).toLocaleString('vi-VN')} đ vào Ví KM
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setMissionCategory(cat);
                            setEditingMission({ ...m });
                            setMissionModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteMission(cat, m.id)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==============================================================
          TAB 4: ĐIỂM DANH 7 NGÀY (CHECK-IN)
         ============================================================== */}
      {activeSubTab === 'checkin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-purple-400"></i>
                Cấu Hình Tiền Thưởng Chuỗi Điểm Danh 7 Ngày
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chỉnh sửa số tiền thưởng cộng vào Ví Khuyến Mãi cho từng ngày từ Ngày 1 đến Ngày 7.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-slate-300">
                {formData.checkInConfig?.enabled ? 'Đang Bật' : 'Đang Tắt'}
              </span>
              <input
                type="checkbox"
                checked={formData.checkInConfig?.enabled ?? true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  checkInConfig: { ...prev.checkInConfig, enabled: e.target.checked }
                }))}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(formData.checkInConfig?.days || []).map(d => (
              <div key={d.day} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                <span className="text-[11px] font-black uppercase text-purple-400">
                  Ngày {d.day}
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center mx-auto text-sm">
                  <i className={d.icon}></i>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Tiền Thưởng (VNĐ)</label>
                  <input
                    type="number"
                    step="1000"
                    value={d.reward}
                    onChange={(e) => handleDayRewardChange(d.day, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-white font-bold text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA / THÊM KHUYẾN MÃI */}
      {promoModalOpen && editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePromo} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 text-white">
            <h3 className="text-base font-black">
              {editingPromo.id?.startsWith('km-') && editingPromo.title ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Tiêu đề chương trình</label>
                <input
                  type="text"
                  required
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.slug}
                    onChange={(e) => setEditingPromo({ ...editingPromo, slug: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Mã Voucher</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.discountCode}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountCode: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Trị giá giảm</label>
                  <input
                    type="text"
                    value={editingPromo.discountValue}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountValue: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Hạn áp dụng</label>
                  <input
                    type="date"
                    value={editingPromo.validUntil}
                    onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Link Ảnh Thumbnail</label>
                <input
                  type="url"
                  value={editingPromo.thumbnail}
                  onChange={(e) => setEditingPromo({ ...editingPromo, thumbnail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows="2"
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA / THÊM NHIỆM VỤ */}
      {missionModalOpen && editingMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMission} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-white">
            <h3 className="text-base font-black">
              Chỉnh Sửa Nhiệm Vụ ({missionCategory})
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Tên nhiệm vụ</label>
                <input
                  type="text"
                  required
                  value={editingMission.title}
                  onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Tiền thưởng Ví Khuyến Mãi (VNĐ)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={editingMission.reward}
                  onChange={(e) => setEditingMission({ ...editingMission, reward: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-black"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Đường dẫn làm nhiệm vụ (Link)</label>
                <input
                  type="text"
                  value={editingMission.link}
                  onChange={(e) => setEditingMission({ ...editingMission, link: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Mô tả nhiệm vụ</label>
                <textarea
                  rows="2"
                  value={editingMission.description}
                  onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMissionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
