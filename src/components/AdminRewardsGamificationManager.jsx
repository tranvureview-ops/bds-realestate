'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { isPromotionExpired, formatPromoDate } from '../data/rewardData';

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
  const [promoStatusFilter, setPromoStatusFilter] = useState('all'); // 'all', 'active', 'expired'

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

  const handleTogglePromoExpired = (promoId) => {
    setFormData(prev => {
      const updated = (prev.promotions || []).map(p => {
        if (p.id !== promoId) return p;
        const currentExpired = isPromotionExpired(p);
        return {
          ...p,
          isExpired: !currentExpired
        };
      });
      return { ...prev, promotions: updated };
    });
    if (showToast) showToast('Đã đổi trạng thái hết hạn trong bản nháp. Bấm "Lưu Cấu Hình" để kích hoạt!', 'info');
  };

  const PROMO_CONTENT_TEMPLATES = {
    standard: `### Thể lệ chương trình
- Áp dụng cho toàn bộ thành viên chính thức trên sàn giao dịch.
- Mỗi tài khoản được hưởng ưu đãi 01 lần duy nhất trong suốt thời gian diễn ra.
- Tiền thưởng Ví Khuyến Mãi được sử dụng trực tiếp để đăng tin VIP và mua lượt đẩy tin.

### Hướng dẫn nhận ưu đãi
1. Đăng nhập vào tài khoản thành viên.
2. Truy cập mục Nạp Tiền hoặc Đăng Tin.
3. Nhập mã voucher tại bước thanh toán để được giảm trừ tức thì.

### Quy định & Lưu ý
- Không có giá trị quy đổi thành tiền mặt rút về ngân hàng.
- Ban quản trị có quyền dừng ưu đãi nếu phát hiện hành vi gian lận.`,

    vip: `### Đặc quyền Gói Tin VIP
- Vị trí hiển thị ưu tiên tại Top 1 Trang chủ và đầu danh mục tìm kiếm.
- Huy hiệu VIP độc quyền kèm khung viền nổi bật thu hút lượt xem gấp 10 lần.
- Tự động đẩy tin lên đầu theo lịch hẹn giờ vàng mỗi ngày.

### Điều kiện áp dụng
- Áp dụng khi thanh toán nâng cấp tin đăng VIP từ 7 ngày trở lên.
- Giảm trực tiếp trên tổng giá trị thanh toán.`,

    broker: `### Quyền lợi Nhà Môi Giới Uy Tín
- Tặng tiền trực tiếp vào Ví Khuyến Mãi khi xác thực hồ sơ CCCD / Môi giới.
- Gắn huy hiệu "Môi giới xác thực uy tín" trên tất cả tin rao bán & cho thuê.
- Miễn phí 05 lượt đẩy tin tự động vào khung giờ vàng (11h-12h và 19h-21h).

### Hướng dẫn tham gia
1. Hoàn thành xác thực số điện thoại và cập nhật ảnh đại diện.
2. Tải lên ảnh CCCD hoặc chứng chỉ môi giới tại Hồ sơ cá nhân.
3. Hệ thống tự động xét duyệt và cộng ưu đãi vào ví trong vòng 15 phút.`
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
            onClick={handleSaveAll}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-2"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span>Danh sách chương trình ưu đãi hiện tại</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">{(formData.promotions || []).length}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Quản lý các chương trình khuyến mãi, voucher nạp tiền, chiết khấu tin VIP và thể lệ chi tiết.
              </p>
            </div>

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
                  isExpired: false,
                  isEvergreen: false,
                  thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                  description: '',
                  content: PROMO_CONTENT_TEMPLATES.standard
                });
                setPromoModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-900/30"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Thêm Khuyến Mãi Mới</span>
            </button>
          </div>

          {/* Filter Status: Tất cả / Đang diễn ra / Đã hết hạn */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setPromoStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                promoStatusFilter === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Tất cả ({(formData.promotions || []).length})
            </button>
            <button
              type="button"
              onClick={() => setPromoStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                promoStatusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Đang diễn ra ({(formData.promotions || []).filter(p => !isPromotionExpired(p)).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setPromoStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                promoStatusFilter === 'expired'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Đã hết hạn ({(formData.promotions || []).filter(p => isPromotionExpired(p)).length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.promotions || [])
              .filter(p => {
                if (promoStatusFilter === 'active') return !isPromotionExpired(p);
                if (promoStatusFilter === 'expired') return isPromotionExpired(p);
                return true;
              })
              .map(promo => {
                const expired = isPromotionExpired(promo);
                return (
                  <div 
                    key={promo.id} 
                    className={`bg-slate-900 border ${
                      expired ? 'border-rose-900/60 bg-slate-900/80' : 'border-slate-800'
                    } rounded-2xl p-4 flex gap-4 justify-between items-start transition hover:border-slate-700`}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={promo.thumbnail} 
                        alt={promo.title} 
                        className={`w-full h-full object-cover ${expired ? 'grayscale contrast-75' : ''}`} 
                      />
                      {expired && (
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                          <span className="text-[9px] font-black uppercase text-rose-300 bg-rose-950/90 px-1 py-0.5 rounded border border-rose-800/80">
                            Hết hạn
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-red-400 uppercase">{promo.categoryLabel}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          {promo.discountCode}
                        </span>
                        {expired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                            <i className="fa-solid fa-clock-rotate-left text-[9px]"></i>
                            <span>Đã Hết Hạn</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-[9px]"></i>
                            <span>Đang Diễn Ra</span>
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold truncate ${expired ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {promo.title}
                      </h4>
                      <div className="text-[11px] text-emerald-400 font-bold">Trị giá: {promo.discountValue}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Hạn dùng: <strong className={expired ? 'text-rose-400' : 'text-slate-300'}>{formatPromoDate(promo.validUntil)}</strong></span>
                        {promo.content ? (
                          <span className="text-emerald-400 font-medium">✓ Đã có thể lệ ({promo.content.length} ký tự)</span>
                        ) : (
                          <span className="text-amber-400 font-medium">⚠ Chưa có thể lệ</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleTogglePromoExpired(promo.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
                          expired 
                            ? 'bg-rose-950/80 text-rose-300 hover:bg-emerald-600 hover:text-white border border-rose-800' 
                            : 'bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white'
                        }`}
                        title={expired ? "Bấm để kích hoạt lại khuyến mãi này" : "Bấm để chuyển sang trạng thái ĐÃ HẾT HẠN"}
                      >
                        <i className={`fa-solid ${expired ? 'fa-arrow-rotate-left' : 'fa-ban'}`}></i>
                      </button>

                      <button
                        onClick={() => {
                          setEditingPromo({ 
                            ...promo,
                            content: promo.content || PROMO_CONTENT_TEMPLATES.standard
                          });
                          setPromoModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                        title="Chỉnh sửa thông tin & Thể lệ chi tiết"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                        title="Xóa khuyến mãi này"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
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
          <form onSubmit={handleSavePromo} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black flex items-center gap-2">
                <i className="fa-solid fa-gift text-red-500"></i>
                <span>{editingPromo.id?.startsWith('km-') && editingPromo.title ? 'Chỉnh Sửa Khuyến Mãi & Thể Lệ' : 'Thêm Khuyến Mãi Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tiêu đề & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Tiêu đề chương trình</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.title}
                    onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                    placeholder="Ví dụ: Tặng 100.000đ vào Ví Khuyến Mãi khi nạp ví lần đầu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.slug}
                    onChange={(e) => setEditingPromo({ ...editingPromo, slug: e.target.value })}
                    placeholder="tang-100k-nap-dau-tien"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Danh mục, Mã voucher, Trị giá, Hạn áp dụng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Danh mục ưu đãi</label>
                  <select
                    value={editingPromo.category || 'nap-tien'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const labels = {
                        'nap-tien': 'Nạp tiền ví',
                        'goi-vip': 'Gói tin VIP',
                        'hoi-vien': 'Hội viên Môi giới',
                        'khac': 'Ưu đãi khác'
                      };
                      setEditingPromo({ 
                        ...editingPromo, 
                        category: val,
                        categoryLabel: labels[val] || 'Khuyến mãi'
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:border-red-500"
                  >
                    <option value="nap-tien">Nạp tiền ví</option>
                    <option value="goi-vip">Gói tin VIP</option>
                    <option value="hoi-vien">Hội viên Môi giới</option>
                    <option value="khac">Ưu đãi khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mã Voucher</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.discountCode}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountCode: e.target.value.toUpperCase() })}
                    placeholder="WELCOME100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-black tracking-wider outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trị giá giảm / quà tặng</label>
                  <input
                    type="text"
                    value={editingPromo.discountValue}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountValue: e.target.value })}
                    placeholder="100.000đ hoặc 30%"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Hạn áp dụng</label>
                  <input
                    type="date"
                    value={editingPromo.validUntil || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Tùy chọn trạng thái Hết Hạn & Vô thời hạn */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingPromo.isExpired === true}
                    onChange={(e) => setEditingPromo({ ...editingPromo, isExpired: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded border-slate-700 bg-slate-800 focus:ring-rose-500"
                  />
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    Đánh dấu chương trình này ĐÃ HẾT HẠN (Dừng áp dụng voucher & gắn nhãn hết hạn)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingPromo.isEvergreen === true}
                    onChange={(e) => setEditingPromo({ ...editingPromo, isEvergreen: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <i className="fa-solid fa-infinity"></i>
                    Chương trình vô thời hạn (Evergreen)
                  </span>
                </label>
              </div>

              {/* Huy hiệu & Ảnh Thumbnail */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chữ trên huy hiệu</label>
                  <input
                    type="text"
                    value={editingPromo.badge || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                    placeholder="Hot nhất, Tiết kiệm 30%..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Màu sắc huy hiệu</label>
                  <select
                    value={editingPromo.badgeColor || 'bg-red-500 text-white'}
                    onChange={(e) => setEditingPromo({ ...editingPromo, badgeColor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                  >
                    <option value="bg-red-500 text-white">Đỏ (Hot)</option>
                    <option value="bg-amber-500 text-white">Vàng cam (Tiết kiệm)</option>
                    <option value="bg-emerald-500 text-white">Xanh lá (Quà tặng)</option>
                    <option value="bg-blue-600 text-white">Xanh dương (VIP)</option>
                    <option value="bg-purple-600 text-white">Tím huyền bí</option>
                    <option value="bg-slate-700 text-white">Xám đậm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Link Ảnh Thumbnail</label>
                  <input
                    type="url"
                    value={editingPromo.thumbnail || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Mô tả tóm tắt */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Mô tả ngắn tóm tắt (Hiển thị ngoài danh sách thẻ card)</label>
                <textarea
                  rows="2"
                  value={editingPromo.description || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  placeholder="Mô tả 1-2 câu ngắn gọn về quyền lợi của chương trình..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                />
              </div>

              {/* NỘI DUNG XEM CHI TIẾT & THỂ LỆ CHƯƠNG TRÌNH */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-black text-amber-400 text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-file-lines text-amber-400"></i>
                      <span>Nội Dung Trong Xem Chi Tiết & Thể Lệ Chương Trình:</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Hiển thị toàn bộ khi khách hàng bấm vào nút "Xem chi tiết & Thể lệ" của khuyến mãi.
                    </p>
                  </div>

                  {/* Nút chèn mẫu nhanh */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">Chèn mẫu:</span>
                    <button
                      type="button"
                      onClick={() => setEditingPromo({ ...editingPromo, content: PROMO_CONTENT_TEMPLATES.standard })}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                    >
                      + Thể lệ chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPromo({ ...editingPromo, content: PROMO_CONTENT_TEMPLATES.vip })}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                    >
                      + Gói Tin VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPromo({ ...editingPromo, content: PROMO_CONTENT_TEMPLATES.broker })}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition cursor-pointer"
                    >
                      + Tri ân Môi giới
                    </button>
                  </div>
                </div>

                <textarea
                  rows="9"
                  value={editingPromo.content || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, content: e.target.value })}
                  placeholder="### Thể lệ chương trình&#10;- Điều kiện 1...&#10;- Điều kiện 2...&#10;&#10;### Hướng dẫn nhận ưu đãi&#10;1. Bước 1...&#10;2. Bước 2..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs leading-relaxed outline-none focus:border-amber-500"
                />
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Hỗ trợ định dạng: <strong>### Tiêu đề mục</strong>, <strong>- Gạch đầu dòng</strong>, <strong>**Chữ in đậm**</strong>, <strong>1. 2. Đánh số bước</strong></span>
                  <span className="font-mono">{(editingPromo.content || '').length} ký tự</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs transition shadow-lg shadow-red-900/30 cursor-pointer"
              >
                Cập nhật Khuyến Mãi & Thể Lệ
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
