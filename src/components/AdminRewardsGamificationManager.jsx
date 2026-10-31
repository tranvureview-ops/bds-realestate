'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { isPromotionExpired, formatPromoDate } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { getPropertyPermalink } from '../utils/permalink';
import { 
  calculateTreasureHuntExpiry, 
  isPropertyTreasureActive, 
  getTreasureExpirationInfo,
  getMonthlyTreasureBudgetStatus,
  DEFAULT_TREASURE_REWARD_TIERS
} from '../services/treasureHuntService';

export default function AdminRewardsGamificationManager() {
  const { 
    rewardsConfig, 
    updateRewardsConfig, 
    resetRewardsConfig, 
    DEFAULT_REWARDS_CONFIG, 
    showToast,
    properties = [],
    updateProperty,
    updateMultipleProperties,
    transactions = []
  } = useRealEstate();

  // Local state form
  const [activeSubTab, setActiveSubTab] = useState('treasure'); // 'promotions', 'missions', 'checkin', 'treasure', 'predictions'
  const [formData, setFormData] = useState(rewardsConfig || DEFAULT_REWARDS_CONFIG);
  const [promoStatusFilter, setPromoStatusFilter] = useState('all'); // 'all', 'active', 'expired'
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isDirtyRef = useRef(false);

  // States quản lý bài viết kích hoạt rương kho báu (Phương án 1)
  const [treasureSearchTerm, setTreasureSearchTerm] = useState('');
  const [treasureViewMode, setTreasureViewMode] = useState('active_only'); // 'active_only', 'all', 'inactive_only'

  // Tính trạng thái ngân sách tháng và 4 mốc phần thưởng
  const monthlyBudgetVal = Number(formData.treasureHuntConfig?.monthlyBudget ?? 50000);
  const budgetStatus = useMemo(() => {
    return getMonthlyTreasureBudgetStatus(monthlyBudgetVal, transactions);
  }, [monthlyBudgetVal, transactions]);

  const currentRewardTiers = useMemo(() => {
    const raw = formData.treasureHuntConfig?.rewardTiers;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_TREASURE_REWARD_TIERS;
  }, [formData.treasureHuntConfig?.rewardTiers]);

  const totalTierPercentage = useMemo(() => {
    return currentRewardTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
  }, [currentRewardTiers]);

  const handleUpdateTier = (index, field, value) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const updated = currentRewardTiers.map((t, idx) => {
      if (idx !== index) return t;
      return {
        ...t,
        [field]: field === 'label' ? value : Math.max(0, Number(value) || 0)
      };
    });
    handleTreasureConfigChange('rewardTiers', updated);
  };

  const handleResetDefaultTiers = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
    handleTreasureConfigChange('rewardTiers', DEFAULT_TREASURE_REWARD_TIERS);
    if (showToast) showToast('Đã khôi phục 4 mốc phần thưởng về tỷ lệ chuẩn!', 'info');
  };

  // Sync when context changes - TUYỆT ĐỐI KHÔNG GHI ĐÈ NẾU ADMIN ĐANG NHẬP DỞ (isDirty)
  useEffect(() => {
    if (rewardsConfig && !isDirtyRef.current) {
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

  // Danh sách bài viết hợp lệ & có rương (Phương án 1)
  const validProperties = useMemo(() => {
    return (properties || []).filter(p => !p.isDeleted && p.status !== 'trash');
  }, [properties]);

  const treasureArticlesList = useMemo(() => {
    return validProperties.filter(p => Boolean(p.isTreasureHuntActive));
  }, [validProperties]);

  const filteredPropertiesForTreasure = useMemo(() => {
    return validProperties
      .filter(p => {
        if (treasureViewMode === 'active_only') return Boolean(p.isTreasureHuntActive);
        if (treasureViewMode === 'inactive_only') return !p.isTreasureHuntActive;
        return true;
      })
      .filter(p => {
        if (!treasureSearchTerm.trim()) return true;
        const term = treasureSearchTerm.trim().toLowerCase();
        return (
          (p.id && p.id.toLowerCase().includes(term)) ||
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.author?.name && p.author.name.toLowerCase().includes(term)) ||
          (p.district && p.district.toLowerCase().includes(term)) ||
          (p.city && p.city.toLowerCase().includes(term))
        );
      });
  }, [validProperties, treasureViewMode, treasureSearchTerm]);

  const handleToggleTreasureArticle = (prop) => {
    if (!updateProperty) return;
    const isCurrentlyActive = Boolean(prop.isTreasureHuntActive);
    if (!isCurrentlyActive) {
      const { activatedAt, expiresAt } = calculateTreasureHuntExpiry();
      updateProperty(prop.id, { 
        isTreasureHuntActive: true,
        treasureHuntActivatedAt: activatedAt,
        treasureHuntExpiresAt: expiresAt
      });
      if (showToast) showToast(`[Admin] Đã kích hoạt rương kho báu 15 ngày cho bài viết ${prop.id}!`, 'success');
    } else {
      updateProperty(prop.id, { 
        isTreasureHuntActive: false,
        treasureHuntActivatedAt: null,
        treasureHuntExpiresAt: null
      });
      if (showToast) showToast(`[Admin] Đã tắt rương kho báu bài viết ${prop.id}`, 'info');
    }
  };

  const handleEnableDiamondTreasure = () => {
    const diamondProps = validProperties.filter(p => p.vipPackageId === 'vip-diamond' && !p.isTreasureHuntActive);
    if (diamondProps.length === 0) {
      if (showToast) showToast('Tất cả bài viết VIP Kim Cương đã được bật rương từ trước!', 'info');
      return;
    }
    const { activatedAt, expiresAt } = calculateTreasureHuntExpiry();
    const updates = diamondProps.map(p => ({
      id: p.id,
      data: {
        isTreasureHuntActive: true,
        treasureHuntActivatedAt: activatedAt,
        treasureHuntExpiresAt: expiresAt
      }
    }));
    if (updateMultipleProperties) {
      updateMultipleProperties(updates);
    } else {
      diamondProps.forEach(p => updateProperty(p.id, updates[0].data));
    }
    if (showToast) showToast(`Đã kích hoạt rương 15 ngày cho ${diamondProps.length} bài viết VIP Kim Cương!`, 'success');
  };

  const handleDisableAllTreasure = () => {
    if (!window.confirm('Bạn có chắc chắn muốn TẮT rương kho báu trên toàn bộ bài viết không?')) return;
    const activeProps = validProperties.filter(p => Boolean(p.isTreasureHuntActive));
    if (activeProps.length === 0) {
      if (showToast) showToast('Hiện không có bài viết nào đang bật rương!', 'info');
      return;
    }
    const updates = activeProps.map(p => ({
      id: p.id,
      data: {
        isTreasureHuntActive: false,
        treasureHuntActivatedAt: null,
        treasureHuntExpiresAt: null
      }
    }));
    if (updateMultipleProperties) {
      updateMultipleProperties(updates);
    } else {
      activeProps.forEach(p => updateProperty(p.id, updates[0].data));
    }
    if (showToast) showToast(`Đã tắt rương trên toàn bộ ${activeProps.length} bài viết!`, 'info');
  };

  // 1. Lưu toàn bộ cấu hình
  const handleSaveAll = async (customConfig = null) => {
    const targetConfig = customConfig || formData;
    const tCfg = targetConfig.treasureHuntConfig || {};

    const regularLimit = Math.max(1, Number(tCfg.regularDailyLimit ?? 1));
    const memberLimit = Math.max(1, Number(tCfg.memberDailyLimit ?? 3));
    const monthlyBudget = Math.max(0, Number(tCfg.monthlyBudget ?? 50000));
    const minReading = Math.max(0, Number(tCfg.minReadingSeconds ?? 4));
    const cooldown = Math.max(0, Number(tCfg.cooldownSeconds ?? 20));
    const itemsPerPg = Math.max(1, Number(tCfg.itemsPerPage ?? 16));

    const tiers = Array.isArray(tCfg.rewardTiers) && tCfg.rewardTiers.length > 0
      ? tCfg.rewardTiers
      : DEFAULT_TREASURE_REWARD_TIERS;

    // Kiểm tra tổng tỷ lệ 4 mốc
    const totalPercent = tiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
    if (totalPercent !== 100) {
      if (showToast) {
        showToast(`Cảnh báo: Tổng tỷ lệ 4 mốc phần thưởng là ${totalPercent}% (Khuyến nghị đúng 100%)!`, 'warning');
      }
    }

    const memberMin = Math.max(1000, Number(tCfg.memberMinAmount ?? 8000));
    const memberMax = Math.max(memberMin, Number(tCfg.memberMaxAmount ?? 20000));
    const memberChance = Math.min(100, Math.max(10, Number(tCfg.memberHighTierChance ?? 80)));

    // Chuẩn hóa dữ liệu cấu hình rương đảm bảo luôn là kiểu chuẩn
    const sanitizedData = {
      ...targetConfig,
      treasureHuntConfig: {
        ...tCfg,
        enabled: tCfg.enabled !== false,
        requireLogin: tCfg.requireLogin !== false,
        regularDailyLimit: regularLimit,
        memberDailyLimit: memberLimit,
        dailyLimit: regularLimit,
        monthlyBudget,
        minReadingSeconds: minReading,
        cooldownSeconds: cooldown,
        itemsPerPage: itemsPerPg,
        rewardTiers: tiers.map(t => ({
          ...t,
          amount: Math.max(0, Number(t.amount) || 0),
          percentage: Math.max(0, Number(t.percentage) || 0)
        })),
        memberMinAmount: memberMin,
        memberMaxAmount: memberMax,
        memberHighTierChance: memberChance,
        memberBonusEnabled: tCfg.memberBonusEnabled !== false
      }
    };

    setIsSaving(true);
    try {
      if (updateRewardsConfig) {
        await updateRewardsConfig(sanitizedData);
        isDirtyRef.current = false;
        setIsDirty(false);
        setFormData(sanitizedData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // === XỬ LÝ KHUYẾN MÃI (Tự động đồng bộ và lưu tức thì vào Database/Supabase) ===
  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!editingPromo?.title || !editingPromo?.slug) {
      if (showToast) showToast('Vui lòng nhập tiêu đề và slug khuyến mãi!', 'warning');
      return;
    }

    const currentPromos = formData.promotions || [];
    const exists = currentPromos.some(p => p.id === editingPromo.id);
    let updatedPromos = [];
    if (exists) {
      updatedPromos = currentPromos.map(p => p.id === editingPromo.id ? editingPromo : p);
    } else {
      const newPromo = {
        ...editingPromo,
        id: editingPromo.id || `km-${Date.now()}`
      };
      updatedPromos = [...currentPromos, newPromo];
    }

    const newConfig = { ...formData, promotions: updatedPromos };
    setFormData(newConfig);
    setPromoModalOpen(false);
    setEditingPromo(null);

    // Lưu tự động ngay lập tức lên Supabase & hệ thống để Client thấy thay đổi tức thì
    await handleSaveAll(newConfig);
    if (showToast) showToast('Đã lưu và cập nhật khuyến mãi lên hệ thống thành công!', 'success');
  };

  const handleDeletePromo = async (promoId) => {
    if (confirm('Xóa chương trình khuyến mãi này?')) {
      const updatedPromos = (formData.promotions || []).filter(p => p.id !== promoId);
      const newConfig = { ...formData, promotions: updatedPromos };
      setFormData(newConfig);
      await handleSaveAll(newConfig);
      if (showToast) showToast('Đã xóa chương trình khuyến mãi thành công!', 'info');
    }
  };

  const handleTogglePromoExpired = async (promoId) => {
    const updatedPromos = (formData.promotions || []).map(p => {
      if (p.id !== promoId) return p;
      const currentExpired = isPromotionExpired(p);
      return {
        ...p,
        isExpired: !currentExpired
      };
    });

    const newConfig = { ...formData, promotions: updatedPromos };
    setFormData(newConfig);
    
    // Lưu tự động ngay lập tức lên Supabase & hệ thống
    await handleSaveAll(newConfig);
    const target = updatedPromos.find(p => p.id === promoId);
    const nowExpired = isPromotionExpired(target);
    if (showToast) {
      showToast(
        nowExpired 
          ? `Đã chuyển mã [${target?.discountCode || target?.title}] sang trạng thái ĐÃ HẾT HẠN và lưu thành công!` 
          : `Đã mở lại mã [${target?.discountCode || target?.title}] (Đang diễn ra) và lưu thành công!`,
        nowExpired ? 'warning' : 'success'
      );
    }
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

    isDirtyRef.current = true;
    setIsDirty(true);
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
      isDirtyRef.current = true;
      setIsDirty(true);
      setFormData(prev => ({
        ...prev,
        missions: {
          ...prev.missions,
          [cat]: (prev.missions?.[cat] || []).filter(m => m.id !== missionId)
        }
      }));
    }
  };

  // === XỬ LÝ SĂN KHO BÁU BÀI VIẾT ===
  const handleTreasureConfigChange = (field, value) => {
    isDirtyRef.current = true;
    setIsDirty(true);
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
              Tùy chỉnh chương trình ưu đãi, nhiệm vụ và cơ chế rương kho báu bài viết.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {isDirty && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Bản nháp chưa lưu
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
            <span>{isSaving ? 'Đang Lưu...' : 'Lưu Toàn Bộ Cấu Hình'}</span>
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

              <div className="flex items-center gap-3">
                {isDirty && (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Chưa lưu
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Kho Báu'}</span>
                </button>
                {/* Toggle Enable */}
                <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-300">
                    {formData.treasureHuntConfig?.enabled ? 'Đang Bật' : 'Đang Tắt'}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.treasureHuntConfig?.enabled ?? true}
                    onChange={(e) => handleTreasureConfigChange('enabled', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 1. QUY TẮC MỞ RƯƠNG & CHỐNG BOT (CHUNG TẤT CẢ ĐỐI TƯỢNG) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-amber-400"></i>
                  <span>Quy Tắc Đối Tượng, Hạn Mức & Chống Bot</span>
                </div>
                {/* Toggle Yêu cầu đăng nhập */}
                <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <span className="text-xs font-bold text-slate-300">
                    Bắt buộc đăng nhập (Khách vãng lai):
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.treasureHuntConfig?.requireLogin !== false}
                    onChange={(e) => handleTreasureConfigChange('requireLogin', e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    formData.treasureHuntConfig?.requireLogin !== false 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {formData.treasureHuntConfig?.requireLogin !== false ? 'Yêu cầu đăng nhập' : 'Cho phép khách'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Hạn mức Thành viên thường */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Hạn mức Thành Viên Thường</span>
                    <span className="text-amber-400 text-[10px] font-mono">1 ngày / user</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.treasureHuntConfig?.regularDailyLimit ?? 1}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        handleTreasureConfigChange('regularDailyLimit', val);
                        handleTreasureConfigChange('dailyLimit', val);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Mặc định: 1 rương / ngày đối với người chưa mua gói.</div>
                </div>

                {/* Hạn mức Hội viên VIP */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-amber-400 text-[10px]"></i>
                      <span>Hạn mức Hội Viên VIP</span>
                    </span>
                    <span className="text-amber-400 text-[10px] font-mono">Đặc quyền VIP</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.treasureHuntConfig?.memberDailyLimit ?? 3}
                      onChange={(e) => handleTreasureConfigChange('memberDailyLimit', Math.max(1, Number(e.target.value) || 3))}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Mặc định: 3 rương / ngày đối với tài khoản mua Gói Hội Viên.</div>
                </div>

                {/* Tổng ngân sách tháng */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Tổng Ngân Sách Mở Rương / Tháng</span>
                    <span className="text-emerald-400 text-[10px] font-mono">Quỹ tối đa</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={formData.treasureHuntConfig?.monthlyBudget ?? 50000}
                      onChange={(e) => handleTreasureConfigChange('monthlyBudget', Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-emerald-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                  </div>
                  {/* Thanh tiến độ ngân sách tháng */}
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Đã chi tháng này: <strong className="text-emerald-400 font-mono">{budgetStatus.currentSpent.toLocaleString('vi-VN')}đ</strong></span>
                      <span className="font-mono">{budgetStatus.percentUsed}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${budgetStatus.isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${budgetStatus.percentUsed}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Thời gian đọc bài chống bot */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Thời gian đọc chống bot (Chung)</span>
                    <span className="text-blue-400 text-[10px] font-mono">Anti-bot</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.treasureHuntConfig?.minReadingSeconds ?? 4}
                      onChange={(e) => handleTreasureConfigChange('minReadingSeconds', Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Giây</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Phải xem bài viết đủ số giây này mới cho phép bấm mở rương (chung tất cả).</div>
                </div>

                {/* Thời gian hồi chiêu Cooldown */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Thời gian chờ Cooldown (Chung)</span>
                    <span className="text-purple-400 text-[10px] font-mono">Giãn cách</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={formData.treasureHuntConfig?.cooldownSeconds ?? 20}
                      onChange={(e) => handleTreasureConfigChange('cooldownSeconds', Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-purple-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Giây</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Thời gian nghỉ tối thiểu giữa 2 lần mở hộp quà khác nhau (chung tất cả).</div>
                </div>

                {/* Số tin hiển thị / trang */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300">
                    Số tin hiển thị / trang (Săn rương)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="4"
                      max="60"
                      step="4"
                      value={formData.treasureHuntConfig?.itemsPerPage ?? 16}
                      onChange={(e) => handleTreasureConfigChange('itemsPerPage', Math.max(1, Number(e.target.value) || 16))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Tin/trang</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Số lượng tin hiển thị trước khi phân trang (Mặc định: 16).</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CẤU HÌNH 4 MỐC PHẦN THƯỞNG THEO HÌNH THIẾT KẾ */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-table-list text-amber-400"></i>
                  Cấu Hình 4 Mốc Phần Thưởng (Tỷ Lệ Xuất Hiện %)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tùy chỉnh 4 mốc phần thưởng, số tiền và tỷ lệ xuất hiện theo bảng chuẩn. Tổng tỷ lệ phải bằng đúng 100%.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                  totalTierPercentage === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                }`}>
                  <i className={`fa-solid ${totalTierPercentage === 100 ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                  <span>Tổng tỷ lệ: {totalTierPercentage}% {totalTierPercentage === 100 ? '(Chuẩn)' : '(Chưa đủ/vượt 100%)'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetDefaultTiers}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Khôi phục về 4 mốc mặc định: 0đ (25%), 1.200đ (45%), 2.500đ (25%), 12.000đ (5%)"
                >
                  <i className="fa-solid fa-rotate-left text-[10px]"></i>
                  <span>Khôi phục mặc định</span>
                </button>
              </div>
            </div>

            {/* Bảng chỉnh sửa 4 mốc phần thưởng */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold">
                    <th className="py-2.5 px-3">Mốc phần thưởng</th>
                    <th className="py-2.5 px-3">Số tiền nhận (đ)</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ xuất hiện (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {currentRewardTiers.map((tier, idx) => (
                    <tr key={tier.id || idx} className="hover:bg-slate-950/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${Number(tier.amount) === 0 ? 'bg-slate-500' : 'bg-amber-400'}`}></span>
                          <input
                            type="text"
                            value={tier.label || ''}
                            onChange={(e) => handleUpdateTier(idx, 'label', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
                            placeholder="Tên mốc phần thưởng..."
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={tier.amount ?? 0}
                            onChange={(e) => handleUpdateTier(idx, 'amount', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-amber-300 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                          />
                          <span className="text-slate-400 text-xs font-mono font-bold shrink-0">đ</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tier.percentage ?? 0}
                            onChange={(e) => handleUpdateTier(idx, 'percentage', e.target.value)}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-right text-emerald-400 font-mono font-bold text-xs focus:border-emerald-400 focus:outline-none"
                          />
                          <span className="text-slate-400 text-xs font-mono font-bold shrink-0">%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ghi chú giải thích cơ chế 4 mốc */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-info text-amber-400 text-[11px]"></i>
                <span>Quy tắc vận hành 4 mốc:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                <li>Khi quay vào mốc <strong>Chúc may mắn (0đ)</strong>, hệ thống sẽ hiển thị thông báo popup "Chúc bạn may mắn lần sau", không cộng tiền nhưng vẫn tính 1 lượt mở rương hôm nay.</li>
                <li>Khi quay vào các mốc <strong>1.200đ</strong>, <strong>2.500đ</strong> hoặc <strong>12.000đ</strong>, tiền được cộng thẳng vào Ví Khuyến Mãi của người dùng.</li>
                <li>Nếu ngân sách tháng vượt ngưỡng {monthlyBudgetVal.toLocaleString('vi-VN')}đ, hệ thống tự động khóa nhận tiền và thông báo hết ngân sách tháng.</li>
              </ul>
            </div>

            {/* Phân hệ Đặc Quyền Hội Viên Khi Mở Rương */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <i className="fa-solid fa-crown text-amber-400"></i>
                    <span>Đặc Quyền Mở Rương Cho Người Mua Gói Hội Viên (Tỷ Lệ Tiền Cao Hơn)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bất kỳ tài khoản nào sở hữu gói hội viên (Basic, Standard, Premium...) khi mở rương sẽ nhận tỷ lệ giá trị tiền cao hơn người không mua gói.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  👑 Đặc quyền VIP Hội Viên
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Mức Thưởng Tối Thiểu Hội Viên</span>
                    <span className="text-amber-400 text-[10px] font-mono">Đảm bảo &gt; thường</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={formData.treasureHuntConfig?.memberMinAmount ?? 8000}
                      onChange={(e) => {
                        isDirtyRef.current = true;
                        setIsDirty(true);
                        handleTreasureConfigChange('memberMinAmount', Math.max(1000, Number(e.target.value) || 8000));
                      }}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-amber-400 font-bold shrink-0">VNĐ</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Mức tối thiểu Hội viên nhận được (Mặc định: 8.000 đ, không bao giờ nhận 2k bèo bọt).</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Mức Thưởng Tối Đa Hội Viên</span>
                    <span className="text-amber-400 text-[10px] font-mono">Tối đa</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={formData.treasureHuntConfig?.memberMaxAmount ?? 20000}
                      onChange={(e) => {
                        isDirtyRef.current = true;
                        setIsDirty(true);
                        handleTreasureConfigChange('memberMaxAmount', Math.max(1000, Number(e.target.value) || 20000));
                      }}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-amber-400 font-bold shrink-0">VNĐ</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Mức tiền trần tối đa Hội viên có thể nhận (Mặc định: 20.000 đ).</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Tỷ Lệ Trúng Mốc Tiền Lớn</span>
                    <span className="text-amber-400 text-[10px] font-mono">Xác suất cao</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      step="5"
                      value={formData.treasureHuntConfig?.memberHighTierChance ?? 80}
                      onChange={(e) => {
                        isDirtyRef.current = true;
                        setIsDirty(true);
                        handleTreasureConfigChange('memberHighTierChance', Math.min(100, Math.max(10, Number(e.target.value) || 80)));
                      }}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-amber-400 font-bold shrink-0">%</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Cơ hội rơi vào các mốc tiền cao nhất trong dải thưởng (Mặc định: 80%).</div>
                </div>
              </div>

              {/* Bảng so sánh trực quan Hội Viên vs Thường */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-user text-slate-400"></i>
                      <span>Người Không Mua Gói (Thường)</span>
                    </span>
                    <span className="text-slate-400 font-mono">{(Number(formData.treasureHuntConfig?.minAmount || 2000)).toLocaleString('vi-VN')}đ - {(Number(formData.treasureHuntConfig?.maxAmount || 20000)).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    • 75% cơ hội rơi vào mốc nhỏ (2.000đ - 9.000đ).<br/>
                    • Giá trị trung bình kỳ vọng: ~4.500 đ / rương.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-amber-400"></i>
                      <span>Người Mua Gói Hội Viên Bất Kỳ</span>
                    </span>
                    <span className="text-amber-400 font-mono font-black">{(Number(formData.treasureHuntConfig?.memberMinAmount ?? 8000)).toLocaleString('vi-VN')}đ - {(Number(formData.treasureHuntConfig?.memberMaxAmount ?? 20000)).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="text-[11px] text-amber-200/90 leading-relaxed">
                    • Đảm bảo tối thiểu từ {(Number(formData.treasureHuntConfig?.memberMinAmount ?? 8000)).toLocaleString('vi-VN')}đ.<br/>
                    • <strong>{formData.treasureHuntConfig?.memberHighTierChance ?? 80}% cơ hội</strong> trúng các mốc tiền lớn nhất (15.000đ - 20.000đ).<br/>
                    • Giá trị trung bình kỳ vọng: <strong>~17.000 đ / rương (Cao hơn gấp ~3.5 lần)</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHÂN HỆ QUẢN LÝ BÀI VIẾT KÍCH HOẠT RƯƠNG (PHƯƠNG ÁN 1) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-gift text-amber-400"></i>
                  <span>Quản Lý Kích Hoạt Bài Viết Có Rương Thưởng (Phương Án 1)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                    {treasureArticlesList.length} bài đang bật rương
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Theo <strong>Phương Án 1</strong>, chỉ các bài viết được kích hoạt cờ Rương bên dưới mới xuất hiện hộp quà tiền thưởng và được gợi ý tại trang Săn Kho Báu.
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleEnableDiamondTreasure}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Kích hoạt rương cho toàn bộ tin VIP Kim Cương"
                >
                  <i className="fa-solid fa-crown text-[10px]"></i>
                  <span>Bật tất cả VIP Kim Cương</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisableAllTreasure}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Tắt rương kho báu trên toàn bộ bài viết"
                >
                  <i className="fa-solid fa-power-off text-[10px] text-rose-400"></i>
                  <span>Tắt tất cả rương</span>
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm & lọc chế độ xem */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {/* Tab chế độ lọc */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTreasureViewMode('active_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    treasureViewMode === 'active_only'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <i className="fa-solid fa-gift text-[11px]"></i>
                  <span>Đang có rương ({treasureArticlesList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTreasureViewMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    treasureViewMode === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>Tất cả bài viết ({validProperties.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTreasureViewMode('inactive_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    treasureViewMode === 'inactive_only'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>Chưa bật ({validProperties.length - treasureArticlesList.length})</span>
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative min-w-[240px]">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, ID, tác giả..."
                  value={treasureSearchTerm}
                  onChange={(e) => setTreasureSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Danh sách bài viết */}
            {filteredPropertiesForTreasure.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                {filteredPropertiesForTreasure.slice(0, 50).map(p => {
                  const link = getPropertyPermalink(p);
                  const isTreasure = Boolean(p.isTreasureHuntActive);
                  return (
                    <div key={p.id} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{p.id}</span>
                            {p.vipPackageId && p.vipPackageId !== 'normal' && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                p.vipPackageId === 'vip-diamond' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                p.vipPackageId === 'vip-gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {p.vipPackageId === 'vip-diamond' ? 'VIP Kim Cương' : p.vipPackageId === 'vip-gold' ? 'VIP Vàng' : 'VIP Bạc'}
                              </span>
                            )}
                            <span className="text-[10px] text-emerald-400 font-bold">{p.priceDisplay || 'Thỏa thuận'}</span>
                          </div>
                          <Link
                            to={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-white hover:text-amber-400 truncate block transition"
                          >
                            {p.title}
                          </Link>
                          <div className="text-[10px] text-slate-500">
                            Người đăng: {p.author?.name || p.contactName || 'Khách vãng lai'}
                          </div>
                        </div>
                      </div>

                      {/* Nút Toggle Kích Hoạt Rương */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {(() => {
                          const treasureInfo = getTreasureExpirationInfo(p);
                          return (
                            <button
                              type="button"
                              onClick={() => handleToggleTreasureArticle(p)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                isTreasure
                                  ? 'bg-amber-500 hover:bg-rose-600 text-slate-950 hover:text-white'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                              }`}
                              title={isTreasure ? `Bài viết đang bật rương đến ngày ${treasureInfo.formattedExpiryDate}. Bấm để tắt.` : 'Kích hoạt rương kho báu 15 ngày cho bài viết này'}
                            >
                              <i className={`fa-solid ${isTreasure ? 'fa-gift' : 'fa-plus'} text-[11px]`}></i>
                              <span>{isTreasure ? `Đang BẬT rương (${treasureInfo.daysRemaining > 0 ? `${treasureInfo.daysRemaining}d` : 'hết hạn'})` : 'Bật rương (15d)'}</span>
                            </button>
                          );
                        })()}
                        <Link
                          to={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition inline-flex items-center"
                          title="Xem bài viết trong tab mới"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {filteredPropertiesForTreasure.length > 50 && (
              <div className="text-center text-[11px] text-slate-500 pt-1">
                Hiển thị 50 trên tổng số {filteredPropertiesForTreasure.length} bài viết. Dùng ô tìm kiếm để lọc thêm.
              </div>
            )}
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Khuyến Mãi'}</span>
              </button>

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
                <label className="block font-bold text-slate-400 mb-1">Chỉ tiêu hoàn thành (Số lượng tin/ngày/lượt)</label>
                <input
                  type="number"
                  min="1"
                  value={editingMission.target || editingMission.progress?.total || 1}
                  onChange={(e) => {
                    const tVal = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setEditingMission({ 
                      ...editingMission, 
                      target: tVal,
                      progress: {
                        ...(editingMission.progress || {}),
                        total: tVal
                      }
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  placeholder="VD: 15"
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
