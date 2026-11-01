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
  DEFAULT_TREASURE_REWARD_TIERS,
  DEFAULT_BASIC_MEMBER_REWARD_TIERS,
  DEFAULT_STANDARD_MEMBER_REWARD_TIERS,
  DEFAULT_PREMIUM_MEMBER_REWARD_TIERS,
  getSuggestedRewardTiers
} from '../services/treasureHuntService';
import PredictionConfetti from './PredictionConfetti';
import {
  getStoredPredictionPrograms,
  savePredictionPrograms,
  getStoredPredictions,
  syncBotsForGame,
  settlePredictionGame,
  calculateMedianPrice,
  awardBadgeToUser,
  DEFAULT_PREDICTION_PROGRAMS
} from '../services/predictionGameService';

/**
 * Component hiển thị gợi ý bảng mốc phần thưởng dựa trên Tổng Ngân Sách Mở Rương
 * Giúp Quản trị viên tham khảo phân bổ tài chính tối ưu theo chu kỳ 30 ngày (Chỉ mang tính chất gợi ý).
 */
function RewardTierSuggestionBox({
  tierType,
  tierName,
  budget,
  onApply
}) {
  const [applied, setApplied] = useState(false);
  const suggestedTiers = useMemo(() => {
    return getSuggestedRewardTiers(tierType, budget);
  }, [tierType, budget]);

  if (!budget || budget <= 0 || !suggestedTiers || suggestedTiers.length === 0) {
    return null;
  }

  const handleApply = () => {
    onApply(suggestedTiers);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-indigo-500/30 text-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
            <i className="fa-solid fa-lightbulb"></i>
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-indigo-200">
                Gợi ý bảng Mốc phần thưởng ({Number(budget).toLocaleString('vi-VN')}đ / tháng)
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
                Chỉ gợi ý • Không tự ý thay đổi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cơ cấu phần thưởng tối ưu theo chu kỳ 30 ngày cho {tierName}. Bạn có thể xem trước hoặc bấm áp dụng vào bảng mốc bên dưới.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-900/50 cursor-pointer"
        >
          <i className={`fa-solid ${applied ? 'fa-check text-emerald-300' : 'fa-wand-magic-sparkles text-amber-300'}`}></i>
          <span>{applied ? 'Đã áp dụng vào bảng!' : 'Áp dụng gợi ý này'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {suggestedTiers.map((t, idx) => (
          <div
            key={t.id || idx}
            className="p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 flex flex-col justify-between gap-1 shadow-inner"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-slate-400 font-medium truncate" title={t.label}>
                {t.label}
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                {t.percentage}%
              </span>
            </div>
            <div className="text-sm font-mono font-extrabold text-white">
              {Number(t.amount || 0).toLocaleString('vi-VN')}đ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    transactions = [],
    currentUser,
    addBonusWalletBalance,
    usersList = [],
    setUsersList
  } = useRealEstate();

  // Local state form
  const [activeSubTab, setActiveSubTab] = useState('treasure'); // 'promotions', 'missions', 'checkin', 'treasure', 'predictions'
  const [formData, setFormData] = useState(rewardsConfig || DEFAULT_REWARDS_CONFIG);
  const [promoStatusFilter, setPromoStatusFilter] = useState('all'); // 'all', 'active', 'expired'
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isDirtyRef = useRef(false);

  // States quản lý Dự Đoán Giá BĐS & Bot Ảo (TAB 4)
  const [predictionPrograms, setPredictionPrograms] = useState(() => getStoredPredictionPrograms());
  const [editingProgram, setEditingProgram] = useState(null);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [settleModalProgram, setSettleModalProgram] = useState(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [settledResultData, setSettledResultData] = useState(null);
  const [showAdminConfetti, setShowAdminConfetti] = useState(false);
  const [isSyncingBotId, setIsSyncingBotId] = useState(null);

  // States quản lý bài viết kích hoạt rương kho báu (Phương án 1)
  const [treasureSearchTerm, setTreasureSearchTerm] = useState('');
  const [treasureViewMode, setTreasureViewMode] = useState('active_only'); // 'active_only', 'all', 'inactive_only'
  const [adminTierTab, setAdminTierTab] = useState('regular'); // 'regular' | 'basic' | 'standard' | 'premium'

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

  // State và xử lý riêng cho 2. CẤU HÌNH HỆ THỐNG (HỘI VIÊN CƠ BẢN)
  const basicMonthlyBudgetVal = Number(formData.treasureHuntConfig?.basicMemberConfig?.monthlyBudget ?? 120000);
  const currentBasicRewardTiers = useMemo(() => {
    const raw = formData.treasureHuntConfig?.basicMemberConfig?.rewardTiers;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_BASIC_MEMBER_REWARD_TIERS;
  }, [formData.treasureHuntConfig?.basicMemberConfig?.rewardTiers]);

  const totalBasicTierPercentage = useMemo(() => {
    return currentBasicRewardTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
  }, [currentBasicRewardTiers]);

  const handleUpdateBasicTier = (index, field, value) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const updated = currentBasicRewardTiers.map((t, idx) => {
      if (idx !== index) return t;
      return {
        ...t,
        [field]: field === 'label' ? value : Math.max(0, Number(value) || 0)
      };
    });
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        basicMemberConfig: {
          ...prev.treasureHuntConfig?.basicMemberConfig,
          monthlyBudget: basicMonthlyBudgetVal,
          rewardTiers: updated
        }
      }
    }));
  };

  const handleBasicMonthlyBudgetChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        basicMemberConfig: {
          ...prev.treasureHuntConfig?.basicMemberConfig,
          monthlyBudget: Math.max(0, Number(val) || 0),
          rewardTiers: currentBasicRewardTiers
        }
      }
    }));
  };

  const handleBasicDailyLimitChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const limit = Math.max(1, Number(val) || 1);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        basicMemberConfig: {
          ...prev.treasureHuntConfig?.basicMemberConfig,
          dailyLimit: limit
        }
      }
    }));
  };

  const handleResetDefaultBasicTiers = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        basicMemberConfig: {
          ...prev.treasureHuntConfig?.basicMemberConfig,
          monthlyBudget: 120000,
          rewardTiers: DEFAULT_BASIC_MEMBER_REWARD_TIERS
        }
      }
    }));
    if (showToast) showToast('Đã khôi phục 3 mốc phần thưởng Hội Viên Cơ Bản về tỷ lệ chuẩn!', 'info');
  };

  // State và xử lý riêng cho 3. CẤU HÌNH HỆ THỐNG (HỘI VIÊN TIÊU CHUẨN)
  const standardMonthlyBudgetVal = Number(formData.treasureHuntConfig?.standardMemberConfig?.monthlyBudget ?? 370000);
  const currentStandardRewardTiers = useMemo(() => {
    const raw = formData.treasureHuntConfig?.standardMemberConfig?.rewardTiers;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_STANDARD_MEMBER_REWARD_TIERS;
  }, [formData.treasureHuntConfig?.standardMemberConfig?.rewardTiers]);

  const totalStandardTierPercentage = useMemo(() => {
    return currentStandardRewardTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
  }, [currentStandardRewardTiers]);

  const handleUpdateStandardTier = (index, field, value) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const updated = currentStandardRewardTiers.map((t, idx) => {
      if (idx !== index) return t;
      return {
        ...t,
        [field]: field === 'label' ? value : Math.max(0, Number(value) || 0)
      };
    });
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        standardMemberConfig: {
          ...prev.treasureHuntConfig?.standardMemberConfig,
          monthlyBudget: standardMonthlyBudgetVal,
          rewardTiers: updated
        }
      }
    }));
  };

  const handleStandardMonthlyBudgetChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        standardMemberConfig: {
          ...prev.treasureHuntConfig?.standardMemberConfig,
          monthlyBudget: Math.max(0, Number(val) || 0),
          rewardTiers: currentStandardRewardTiers
        }
      }
    }));
  };

  const handleStandardDailyLimitChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const limit = Math.max(1, Number(val) || 1);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        standardMemberConfig: {
          ...prev.treasureHuntConfig?.standardMemberConfig,
          dailyLimit: limit
        }
      }
    }));
  };

  const handleResetDefaultStandardTiers = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        standardMemberConfig: {
          ...prev.treasureHuntConfig?.standardMemberConfig,
          monthlyBudget: 370000,
          rewardTiers: DEFAULT_STANDARD_MEMBER_REWARD_TIERS
        }
      }
    }));
    if (showToast) showToast('Đã khôi phục 3 mốc phần thưởng Hội Viên Tiêu Chuẩn về tỷ lệ chuẩn!', 'info');
  };

  // State và xử lý riêng cho 4. CẤU HÌNH HỆ THỐNG (HỘI VIÊN CAO CẤP)
  const premiumMonthlyBudgetVal = Number(formData.treasureHuntConfig?.premiumMemberConfig?.monthlyBudget ?? 1000000);
  const currentPremiumRewardTiers = useMemo(() => {
    const raw = formData.treasureHuntConfig?.premiumMemberConfig?.rewardTiers;
    return Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_PREMIUM_MEMBER_REWARD_TIERS;
  }, [formData.treasureHuntConfig?.premiumMemberConfig?.rewardTiers]);

  const totalPremiumTierPercentage = useMemo(() => {
    return currentPremiumRewardTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
  }, [currentPremiumRewardTiers]);

  const handleUpdatePremiumTier = (index, field, value) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const updated = currentPremiumRewardTiers.map((t, idx) => {
      if (idx !== index) return t;
      return {
        ...t,
        [field]: field === 'label' ? value : Math.max(0, Number(value) || 0)
      };
    });
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        premiumMemberConfig: {
          ...prev.treasureHuntConfig?.premiumMemberConfig,
          monthlyBudget: premiumMonthlyBudgetVal,
          rewardTiers: updated
        }
      }
    }));
  };

  const handlePremiumMonthlyBudgetChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        premiumMemberConfig: {
          ...prev.treasureHuntConfig?.premiumMemberConfig,
          monthlyBudget: Math.max(0, Number(val) || 0),
          rewardTiers: currentPremiumRewardTiers
        }
      }
    }));
  };

  const handlePremiumDailyLimitChange = (val) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    const limit = Math.max(1, Number(val) || 1);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        premiumMemberConfig: {
          ...prev.treasureHuntConfig?.premiumMemberConfig,
          dailyLimit: limit
        }
      }
    }));
  };

  const handleResetDefaultPremiumTiers = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        premiumMemberConfig: {
          ...prev.treasureHuntConfig?.premiumMemberConfig,
          monthlyBudget: 1000000,
          rewardTiers: DEFAULT_PREMIUM_MEMBER_REWARD_TIERS
        }
      }
    }));
    if (showToast) showToast('Đã khôi phục 4 mốc phần thưởng Hội Viên Cao Cấp về tỷ lệ chuẩn!', 'info');
  };

  // Handlers áp dụng bảng mốc gợi ý cho 4 nhóm đối tượng
  const handleApplySuggestedTiers = (suggested) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    handleTreasureConfigChange('rewardTiers', suggested);
    if (showToast) showToast('Đã áp dụng bảng mốc gợi ý cho Khách & Thành Viên Thường!', 'success');
  };

  const handleApplySuggestedBasicTiers = (suggested) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        basicMemberConfig: {
          ...prev.treasureHuntConfig?.basicMemberConfig,
          monthlyBudget: basicMonthlyBudgetVal,
          rewardTiers: suggested
        }
      }
    }));
    if (showToast) showToast('Đã áp dụng bảng mốc gợi ý cho Hội Viên Cơ Bản!', 'success');
  };

  const handleApplySuggestedStandardTiers = (suggested) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        standardMemberConfig: {
          ...prev.treasureHuntConfig?.standardMemberConfig,
          monthlyBudget: standardMonthlyBudgetVal,
          rewardTiers: suggested
        }
      }
    }));
    if (showToast) showToast('Đã áp dụng bảng mốc gợi ý cho Hội Viên Tiêu Chuẩn!', 'success');
  };

  const handleApplySuggestedPremiumTiers = (suggested) => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      treasureHuntConfig: {
        ...prev.treasureHuntConfig,
        premiumMemberConfig: {
          ...prev.treasureHuntConfig?.premiumMemberConfig,
          monthlyBudget: premiumMonthlyBudgetVal,
          rewardTiers: suggested
        }
      }
    }));
    if (showToast) showToast('Đã áp dụng bảng mốc gợi ý cho Hội Viên Cao Cấp!', 'success');
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

    const regularLimit = Math.max(1, Number(tCfg.regularDailyLimit ?? tCfg.dailyLimit ?? 1));
    const safeRegularLimit = regularLimit === 2 ? 1 : regularLimit;
    const monthlyBudget = Math.max(0, Number(tCfg.monthlyBudget ?? 50000));
    const minReading = Math.max(0, Number(tCfg.minReadingSeconds ?? 4));
    const cooldown = Math.max(0, Number(tCfg.cooldownSeconds ?? 20));
    const itemsPerPg = Math.max(1, Number(tCfg.itemsPerPage ?? 16));

    const tiers = Array.isArray(tCfg.rewardTiers) && tCfg.rewardTiers.length > 0
      ? tCfg.rewardTiers
      : DEFAULT_TREASURE_REWARD_TIERS;

    // Kiểm tra tổng tỷ lệ 4 mốc (Thành viên thường)
    const totalPercent = tiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
    if (totalPercent !== 100) {
      if (showToast) {
        showToast(`Cảnh báo: Tổng tỷ lệ 4 mốc Thành Viên Thường là ${totalPercent}% (Khuyến nghị đúng 100%)!`, 'warning');
      }
    }

    // Chuẩn hóa cấu hình Hội Viên Cơ Bản
    const basicCfg = tCfg.basicMemberConfig || {};
    const basicMonthlyBudget = Math.max(0, Number(basicCfg.monthlyBudget ?? 120000));
    const basicTiers = Array.isArray(basicCfg.rewardTiers) && basicCfg.rewardTiers.length > 0
      ? basicCfg.rewardTiers
      : DEFAULT_BASIC_MEMBER_REWARD_TIERS;
    const totalBasicPercent = basicTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
    if (totalBasicPercent !== 100) {
      if (showToast) {
        showToast(`Cảnh báo: Tổng tỷ lệ 3 mốc Hội Viên Cơ Bản là ${totalBasicPercent}% (Khuyến nghị đúng 100%)!`, 'warning');
      }
    }

    // Chuẩn hóa cấu hình Hội Viên Tiêu Chuẩn
    const standardCfg = tCfg.standardMemberConfig || {};
    const standardMonthlyBudget = Math.max(0, Number(standardCfg.monthlyBudget ?? 370000));
    const standardTiers = Array.isArray(standardCfg.rewardTiers) && standardCfg.rewardTiers.length > 0
      ? standardCfg.rewardTiers
      : DEFAULT_STANDARD_MEMBER_REWARD_TIERS;
    const totalStandardPercent = standardTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
    if (totalStandardPercent !== 100) {
      if (showToast) {
        showToast(`Cảnh báo: Tổng tỷ lệ 3 mốc Hội Viên Tiêu Chuẩn là ${totalStandardPercent}% (Khuyến nghị đúng 100%)!`, 'warning');
      }
    }

    // Chuẩn hóa cấu hình Hội Viên Cao Cấp
    const premiumCfg = tCfg.premiumMemberConfig || {};
    const premiumMonthlyBudget = Math.max(0, Number(premiumCfg.monthlyBudget ?? 1000000));
    const premiumTiers = Array.isArray(premiumCfg.rewardTiers) && premiumCfg.rewardTiers.length > 0
      ? premiumCfg.rewardTiers
      : DEFAULT_PREMIUM_MEMBER_REWARD_TIERS;
    const totalPremiumPercent = premiumTiers.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
    if (totalPremiumPercent !== 100) {
      if (showToast) {
        showToast(`Cảnh báo: Tổng tỷ lệ 4 mốc Hội Viên Cao Cấp là ${totalPremiumPercent}% (Khuyến nghị đúng 100%)!`, 'warning');
      }
    }

    // Chuẩn hóa dữ liệu cấu hình rương đảm bảo luôn là kiểu chuẩn
    const sanitizedData = {
      ...targetConfig,
      treasureHuntConfig: {
        ...tCfg,
        enabled: tCfg.enabled !== false,
        requireLogin: tCfg.requireLogin !== false,
        regularDailyLimit: safeRegularLimit,
        dailyLimit: safeRegularLimit,
        monthlyBudget,
        minReadingSeconds: minReading,
        cooldownSeconds: cooldown,
        itemsPerPage: itemsPerPg,
        rewardTiers: tiers.map(t => ({
          ...t,
          amount: Math.max(0, Number(t.amount) || 0),
          percentage: Math.max(0, Number(t.percentage) || 0)
        })),
        basicMemberConfig: {
          monthlyBudget: basicMonthlyBudget,
          dailyLimit: Math.max(1, Number(basicCfg.dailyLimit || 1)),
          minAmount: 2500,
          maxAmount: 10000,
          rewardTiers: basicTiers.map(t => ({
            ...t,
            amount: Math.max(0, Number(t.amount) || 0),
            percentage: Math.max(0, Number(t.percentage) || 0)
          }))
        },
        standardMemberConfig: {
          monthlyBudget: standardMonthlyBudget,
          dailyLimit: Math.max(1, Number(standardCfg.dailyLimit || 1)),
          minAmount: 8000,
          maxAmount: 35000,
          rewardTiers: standardTiers.map(t => ({
            ...t,
            amount: Math.max(0, Number(t.amount) || 0),
            percentage: Math.max(0, Number(t.percentage) || 0)
          }))
        },
        premiumMemberConfig: {
          monthlyBudget: premiumMonthlyBudget,
          dailyLimit: Math.max(1, Number(premiumCfg.dailyLimit || 1)),
          minAmount: 20000,
          maxAmount: 100000,
          rewardTiers: premiumTiers.map(t => ({
            ...t,
            amount: Math.max(0, Number(t.amount) || 0),
            percentage: Math.max(0, Number(t.percentage) || 0)
          }))
        }
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

  // === QUẢN LÝ DỰ ĐOÁN GIÁ BĐS & BOT ẢO (TAB 4) ===
  const handleSyncBots = (prog) => {
    setIsSyncingBotId(prog.id);
    setTimeout(() => {
      syncBotsForGame(prog.id, prog.botConfig, prog.startDate, prog.endDate);
      setIsSyncingBotId(null);
      setPredictionPrograms(getStoredPredictionPrograms());
      if (showToast) {
        showToast(`Đã chia đều ${(prog.botConfig?.botCount || 2000).toLocaleString('vi-VN')} Bot ảo theo dòng thời gian từ ngày bắt đầu đến nay (cơ chế phân bổ như thật)!`, 'success');
      }
    }, 600);
  };

  const handleOpenProgramModal = (prog = null) => {
    if (prog) {
      setEditingProgram({ ...prog });
    } else {
      setEditingProgram({
        id: `pred-${Date.now()}`,
        slug: `du-doan-gia-${Date.now()}`,
        title: '',
        projectName: '',
        location: 'Đà Nẵng',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        currentEstimate: '5.0 - 6.0 tỷ',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        totalPrize: 2000000,
        basePrice: 5.5,
        spreadPercent: 8,
        targetPrice: 5.5,
        requireMembership: true, // Mặc định bật đặc quyền Gói Hội Viên
        status: 'active',
        botConfig: {
          isEnabled: true,
          botCount: 2000,
          basePrice: 5.5,
          spreadPercent: 8
        },
        options: [
          { id: 'opt-a', label: 'Dưới 5 tỷ', min: 0, max: 5.0 },
          { id: 'opt-b', label: 'Từ 5 - 6 tỷ', min: 5.0, max: 6.0 },
          { id: 'opt-c', label: 'Trên 6 tỷ', min: 6.0, max: 99.0 }
        ]
      });
    }
    setProgramModalOpen(true);
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!editingProgram.title || !editingProgram.projectName) {
      if (showToast) showToast('Vui lòng điền tên chương trình và tên dự án BĐS!', 'warning');
      return;
    }

    const currentList = getStoredPredictionPrograms();
    const exists = currentList.find(p => p.id === editingProgram.id);
    let nextList;
    if (exists) {
      nextList = currentList.map(p => p.id === editingProgram.id ? editingProgram : p);
    } else {
      nextList = [editingProgram, ...currentList];
    }

    savePredictionPrograms(nextList);
    setPredictionPrograms(nextList);
    setProgramModalOpen(false);

    // Tự động đồng bộ bot nếu bot được bật
    if (editingProgram.botConfig?.isEnabled) {
      syncBotsForGame(editingProgram.id, editingProgram.botConfig, editingProgram.startDate, editingProgram.endDate);
    }

    if (showToast) showToast(`Đã lưu chương trình "${editingProgram.title}" thành công!`, 'success');
  };

  const handleDeleteProgram = (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương trình dự đoán này không?')) return;
    const currentList = getStoredPredictionPrograms();
    const nextList = currentList.filter(p => p.id !== id);
    savePredictionPrograms(nextList);
    setPredictionPrograms(nextList);
    if (showToast) showToast('Đã xóa chương trình dự đoán!', 'info');
  };

  const handleOpenSettleModal = (prog) => {
    setSettleModalProgram(prog);
  };

  const handleExecuteSettle = () => {
    if (!settleModalProgram) return;

    // GỌI LOGIC KẾT THÚC SỰ KIỆN: LỌC BOT (is_bot = 1) -> TỰ ĐỘNG TÍNH GIÁ TRUNG VỊ NGƯỜI THẬT -> TÍNH SAI SỐ -> CHIA ĐỀU NẾU >3 ĐỒNG HẠNG -> TRAO THƯỞNG & HUY HIỆU
    const res = settlePredictionGame({
      gameId: settleModalProgram.id,
      targetPrice: null, // Tự động tính theo trung vị của người thật
      totalPrize: settleModalProgram.totalPrize || 2000000,
      currentUser
    });

    if (!res.success) {
      if (showToast) showToast(res.message, 'warning');
      return;
    }

    // Trao tiền thưởng Ví KM cho các User Thật thắng cuộc (chỉ cộng tiền cho User thật is_bot === 0)
    res.winners.forEach(w => {
      if (w.is_bot === 0 && addBonusWalletBalance && w.rewardAmount > 0) {
        addBonusWalletBalance(w.rewardAmount, `Giải thưởng Dự Đoán Giá BĐS (#${w.rank}): ${settleModalProgram.projectName || settleModalProgram.title}`);
      }
      // Trao huy hiệu vinh danh "Thần Phán Đoán" vào User thật
      if (w.is_bot === 0 && currentUser && String(currentUser.id) === String(w.userId)) {
        awardBadgeToUser(currentUser, w.rewardBadge || 'Thần Phán Đoán BĐS ★');
      }
    });

    // Cập nhật trạng thái chương trình sang settled
    const currentList = getStoredPredictionPrograms();
    const nextList = currentList.map(p => {
      if (p.id === settleModalProgram.id) {
        return {
          ...p,
          status: 'settled',
          targetPrice: res.settledResult?.targetPrice,
          settledResult: res.settledResult
        };
      }
      return p;
    });

    savePredictionPrograms(nextList);
    setPredictionPrograms(nextList);
    setSettledResultData(res.settledResult);
    setSettleModalProgram(null);
    setShowAdminConfetti(true);

    if (showToast) {
      showToast(`🎯 Chốt kết quả thành công! ${res.isSplitPrize ? `Có ${res.winners.length} người đồng hạng: Đã chia đều giải thưởng!` : `Đã xét trao thưởng Top ${res.winners.length} thành công!`}`, 'success');
    }
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

        <button
          onClick={() => setActiveSubTab('predictions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'predictions'
              ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-chart-line text-xs text-amber-400"></i>
          <span>Dự Đoán Giá BĐS</span>
          <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">AI Bot</span>
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
                  <span>Quy Tắc Đối Tượng, Hạn Mức & Bảo Mật</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Thời gian đọc bài chống bot */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Thời gian đọc bài viết (Chung)</span>
                    <span className="text-blue-400 text-[10px] font-mono">Xem tin</span>
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

          {/* HỆ THỐNG CẤU HÌNH TỶ LỆ & NGÂN SÁCH MỞ RƯƠNG 4 NHÓM HỘI VIÊN (TINH CHỈNH GỌN GÀNG THEO TAB) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            {/* Header chung & Thanh Sub-Tabs chọn nhóm đối tượng */}
            <div className="space-y-4 border-b border-slate-800 pb-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-table-list text-amber-400"></i>
                    <span>Cấu Hình Tỷ Lệ & Ngân Sách Theo Nhóm Đối Tượng</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chọn nhóm đối tượng bên dưới để tinh chỉnh ngân sách tháng và bảng tỷ lệ phần thưởng mở rương tương ứng (Tổng tỷ lệ mỗi nhóm phải bằng đúng 100%).
                  </p>
                </div>

                <div className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2 self-start lg:self-auto">
                  <span>Hệ thống phân tầng:</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg">Khách/Thường</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-lg">Cơ Bản</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-300 rounded-lg">Tiêu Chuẩn</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-lg">Cao Cấp</span>
                </div>
              </div>

              {/* 4 Nút Tab chuyển đổi trực quan kèm badge trạng thái % */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdminTierTab('regular')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    adminTierTab === 'regular'
                      ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-user text-[11px] text-slate-400"></i>
                      <span>1. Khách & Thường</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      totalTierPercentage === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {totalTierPercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Quỹ: {Number(formData.treasureHuntConfig?.monthlyBudget ?? 50000).toLocaleString('vi-VN')}đ / tháng
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTierTab('basic')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    adminTierTab === 'basic'
                      ? 'bg-amber-950/40 text-amber-200 shadow-md border border-amber-500/40'
                      : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-[11px] text-amber-400"></i>
                      <span>2. Hội Viên Cơ Bản</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      totalBasicTierPercentage === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {totalBasicTierPercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-400/80">
                    Quỹ: {basicMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTierTab('standard')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    adminTierTab === 'standard'
                      ? 'bg-orange-950/40 text-orange-200 shadow-md border border-orange-500/40'
                      : 'text-slate-400 hover:text-orange-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-award text-[11px] text-orange-400"></i>
                      <span>3. Hội Viên Tiêu Chuẩn</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      totalStandardTierPercentage === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {totalStandardTierPercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-orange-400/80">
                    Quỹ: {standardMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTierTab('premium')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    adminTierTab === 'premium'
                      ? 'bg-purple-950/40 text-purple-200 shadow-md border border-purple-500/40'
                      : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-gem text-[11px] text-purple-400"></i>
                      <span>4. Hội Viên Cao Cấp</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      totalPremiumTierPercentage === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {totalPremiumTierPercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-purple-400/80">
                    Quỹ: {premiumMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng
                  </div>
                </button>
              </div>
            </div>

            {/* TAB 1: KHÁCH VÃNG LAI VÀ THÀNH VIÊN THƯỜNG */}
            {adminTierTab === 'regular' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-user text-slate-400"></i>
                      <span>1. Cấu hình tỷ lệ Khách Vãng Lai và Thành Viên Thường</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gồm 4 mốc phần thưởng tiêu chuẩn, số tiền và tỷ lệ xuất hiện (yêu cầu đăng nhập, hạn mức 1 rương/ngày).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                      totalTierPercentage === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      <i className={`fa-solid ${totalTierPercentage === 100 ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                      <span>Tổng tỷ lệ: {totalTierPercentage}% {totalTierPercentage === 100 ? '(Chuẩn)' : '(Chưa chuẩn)'}</span>
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

                {/* Ô nhập Tổng Ngân Sách Mở Rương / Tháng */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-sack-dollar text-amber-400"></i>
                        <span>Tổng Ngân Sách Mở Rương / Tháng (Khách & Thường)</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hạn mức quỹ tiền thưởng tối đa mở rương được phát trong 1 tháng dương lịch cho khách vãng lai và thành viên thường.
                      </p>
                    </div>
                    <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
                      Quỹ cấu hình: {monthlyBudgetVal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={formData.treasureHuntConfig?.monthlyBudget ?? 50000}
                        onChange={(e) => handleTreasureConfigChange('monthlyBudget', Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-emerald-400 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Đã chi tháng này: <strong className="text-emerald-400 font-mono">{budgetStatus.currentSpent.toLocaleString('vi-VN')}đ</strong></span>
                        <span className="font-mono font-bold text-slate-300">{budgetStatus.percentUsed}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${budgetStatus.isBudgetExceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${budgetStatus.percentUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khối gợi ý bảng Mốc phần thưởng theo ngân sách (Chỉ gợi ý) */}
                  <RewardTierSuggestionBox
                    tierType="regular"
                    tierName="Khách Vãng Lai & Thành Viên Thường"
                    budget={monthlyBudgetVal}
                    onApply={handleApplySuggestedTiers}
                  />
                </div>

                {/* Hạn mức mở rương / ngày cho Khách Vãng Lai & Thành Viên Thường */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-gift text-amber-400"></i>
                      <span>Hạn mức mở rương / ngày (Khách Vãng Lai & Thành Viên Thường)</span>
                    </label>
                    <span className="text-amber-400 text-[10px] font-mono">1 ngày / user</span>
                  </div>
                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.treasureHuntConfig?.dailyLimit === 2 ? 1 : (formData.treasureHuntConfig?.dailyLimit ?? formData.treasureHuntConfig?.regularDailyLimit ?? 1)}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        handleTreasureConfigChange('dailyLimit', val);
                        handleTreasureConfigChange('regularDailyLimit', val);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Mặc định: 1 rương / ngày với mỗi tài khoản khách và tk thường.</div>
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
                    <span>Quy tắc vận hành 4 mốc phần thưởng:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                    <li>Khi quay vào mốc <strong>Chúc may mắn (0đ)</strong>: Hiển thị popup "Chúc bạn may mắn lần sau", không cộng tiền nhưng vẫn tính 1 lượt mở rương hôm nay.</li>
                    <li>Khi quay vào các mốc <strong>1.200đ</strong>, <strong>2.500đ</strong> hoặc <strong>12.000đ</strong>: Tiền thưởng được cộng thẳng vào Ví Khuyến Mãi của người dùng.</li>
                    <li>Hạn mức mở rương mặc định: <strong>{formData.treasureHuntConfig?.dailyLimit ?? formData.treasureHuntConfig?.regularDailyLimit ?? 1} rương / ngày / tài khoản</strong> (Khách vãng lai yêu cầu đăng nhập).</li>
                    <li>Nếu ngân sách tháng đạt ngưỡng {monthlyBudgetVal.toLocaleString('vi-VN')}đ, hệ thống tự động khóa nhận tiền và thông báo hết ngân sách tháng.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: HỘI VIÊN CƠ BẢN */}
            {adminTierTab === 'basic' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-crown text-amber-400"></i>
                      <span>2. Cấu hình Hệ thống (Hội Viên Cơ Bản)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        100% Trúng Thưởng
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tùy chỉnh ngân sách tháng, các mốc phần thưởng và tỷ lệ xuất hiện dành riêng cho Hội Viên Cơ Bản khi mở rương.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                      totalBasicTierPercentage === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      <i className={`fa-solid ${totalBasicTierPercentage === 100 ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                      <span>Tổng tỷ lệ: {totalBasicTierPercentage}% {totalBasicTierPercentage === 100 ? '(Chuẩn)' : '(Chưa chuẩn)'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetDefaultBasicTiers}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Khôi phục về 3 mốc mặc định: 2.500đ (40%), 4.000đ (50%), 10.000đ (10%)"
                    >
                      <i className="fa-solid fa-rotate-left text-[10px]"></i>
                      <span>Khôi phục mặc định</span>
                    </button>
                  </div>
                </div>

                {/* Ô nhập Tổng Ngân Sách Mở Rương / Tháng cho Hội Viên Cơ Bản */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-sack-dollar text-amber-400"></i>
                        <span>Tổng Ngân Sách Mở Rương / Tháng (Hội Viên Cơ Bản)</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hạn mức quỹ tiền thưởng tối đa mở rương dành riêng cho các tài khoản Gói Hội Viên Cơ Bản trong 1 tháng dương lịch.
                      </p>
                    </div>
                    <span className="text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 self-start sm:self-auto">
                      Quỹ cấu hình: {basicMonthlyBudgetVal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.treasureHuntConfig?.basicMemberConfig?.monthlyBudget ?? 120000}
                      onChange={(e) => handleBasicMonthlyBudgetChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                  </div>

                  {/* Khối gợi ý bảng Mốc phần thưởng theo ngân sách (Chỉ gợi ý) */}
                  <RewardTierSuggestionBox
                    tierType="basic"
                    tierName="Hội Viên Cơ Bản"
                    budget={basicMonthlyBudgetVal}
                    onApply={handleApplySuggestedBasicTiers}
                  />
                </div>

                {/* Hạn mức mở rương / ngày cho Hội Viên Cơ Bản */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-gift text-amber-400"></i>
                      <span>Hạn mức mở rương / ngày (Hội Viên Cơ Bản)</span>
                    </label>
                    <span className="text-amber-400 text-[10px] font-mono">Gói Cơ Bản</span>
                  </div>
                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.treasureHuntConfig?.basicMemberConfig?.dailyLimit ?? 1}
                      onChange={(e) => handleBasicDailyLimitChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Số lượng rương tối đa tài khoản Gói Cơ Bản được mở mỗi ngày (mặc định: 1 rương / ngày).</div>
                </div>

                {/* Bảng chỉnh sửa 3 mốc phần thưởng cho Hội Viên Cơ Bản */}
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
                      {currentBasicRewardTiers.map((tier, idx) => (
                        <tr key={tier.id || idx} className="hover:bg-slate-950/40 transition">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400"></span>
                              <input
                                type="text"
                                value={tier.label || ''}
                                onChange={(e) => handleUpdateBasicTier(idx, 'label', e.target.value)}
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
                                onChange={(e) => handleUpdateBasicTier(idx, 'amount', e.target.value)}
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
                                onChange={(e) => handleUpdateBasicTier(idx, 'percentage', e.target.value)}
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

                {/* Ghi chú giải thích cơ chế Hội Viên Cơ Bản */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
                  <div className="text-slate-300 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-amber-400 text-[11px]"></i>
                    <span>Quy tắc vận hành mốc thưởng Hội Viên Cơ Bản:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                    <li>Dành riêng cho tài khoản đăng ký <strong>Gói Hội Viên Cơ Bản</strong> (mỗi chu kỳ nhận tỷ lệ trúng thưởng cao hơn).</li>
                    <li><strong>100% trúng thưởng</strong> (không có mốc rỗng 0đ Chúc May Mắn): Mức nhận gồm <strong>2.500đ (40%)</strong>, <strong>4.000đ (50%)</strong> hoặc <strong>10.000đ (10%)</strong>.</li>
                    <li>Tổng ngân sách mở rương riêng cho Hội Viên Cơ Bản: <strong>{basicMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng</strong>.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: HỘI VIÊN TIÊU CHUẨN */}
            {adminTierTab === 'standard' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-award text-orange-400"></i>
                      <span>3. Cấu hình Hệ thống (Hội Viên Tiêu Chuẩn)</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                        100% Trúng Thưởng (Mức Cao)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tùy chỉnh ngân sách tháng, các mốc phần thưởng và tỷ lệ xuất hiện dành riêng cho Hội Viên Tiêu Chuẩn khi mở rương.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                      totalStandardTierPercentage === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      <i className={`fa-solid ${totalStandardTierPercentage === 100 ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                      <span>Tổng tỷ lệ: {totalStandardTierPercentage}% {totalStandardTierPercentage === 100 ? '(Chuẩn)' : '(Chưa chuẩn)'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetDefaultStandardTiers}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Khôi phục về 3 mốc mặc định: 8.000đ (40%), 12.000đ (50%), 35.000đ (10%)"
                    >
                      <i className="fa-solid fa-rotate-left text-[10px]"></i>
                      <span>Khôi phục mặc định</span>
                    </button>
                  </div>
                </div>

                {/* Ô nhập Tổng Ngân Sách Mở Rương / Tháng cho Hội Viên Tiêu Chuẩn */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-sack-dollar text-orange-400"></i>
                        <span>Tổng Ngân Sách Mở Rương / Tháng (Hội Viên Tiêu Chuẩn)</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hạn mức quỹ tiền thưởng tối đa mở rương dành riêng cho các tài khoản Gói Hội Viên Tiêu Chuẩn trong 1 tháng dương lịch.
                      </p>
                    </div>
                    <span className="text-orange-400 text-xs font-mono font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 self-start sm:self-auto">
                      Quỹ cấu hình: {standardMonthlyBudgetVal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.treasureHuntConfig?.standardMemberConfig?.monthlyBudget ?? 370000}
                      onChange={(e) => handleStandardMonthlyBudgetChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-orange-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                  </div>

                  {/* Khối gợi ý bảng Mốc phần thưởng theo ngân sách (Chỉ gợi ý) */}
                  <RewardTierSuggestionBox
                    tierType="standard"
                    tierName="Hội Viên Tiêu Chuẩn"
                    budget={standardMonthlyBudgetVal}
                    onApply={handleApplySuggestedStandardTiers}
                  />
                </div>

                {/* Hạn mức mở rương / ngày cho Hội Viên Tiêu Chuẩn */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-gift text-orange-400"></i>
                      <span>Hạn mức mở rương / ngày (Hội Viên Tiêu Chuẩn)</span>
                    </label>
                    <span className="text-orange-400 text-[10px] font-mono">Gói Tiêu Chuẩn</span>
                  </div>
                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.treasureHuntConfig?.standardMemberConfig?.dailyLimit ?? 1}
                      onChange={(e) => handleStandardDailyLimitChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-orange-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Số lượng rương tối đa tài khoản Gói Tiêu Chuẩn được mở mỗi ngày (mặc định: 1 rương / ngày).</div>
                </div>

                {/* Bảng chỉnh sửa 3 mốc phần thưởng cho Hội Viên Tiêu Chuẩn */}
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
                      {currentStandardRewardTiers.map((tier, idx) => (
                        <tr key={tier.id || idx} className="hover:bg-slate-950/40 transition">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0 bg-orange-400"></span>
                              <input
                                type="text"
                                value={tier.label || ''}
                                onChange={(e) => handleUpdateStandardTier(idx, 'label', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:border-orange-400 focus:outline-none"
                                placeholder="Tên mốc phần thưởng..."
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 max-w-[200px]">
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={tier.amount ?? 0}
                                onChange={(e) => handleUpdateStandardTier(idx, 'amount', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-orange-300 font-mono font-bold text-xs focus:border-orange-400 focus:outline-none"
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
                                onChange={(e) => handleUpdateStandardTier(idx, 'percentage', e.target.value)}
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

                {/* Ghi chú giải thích cơ chế Hội Viên Tiêu Chuẩn */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
                  <div className="text-slate-300 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-orange-400 text-[11px]"></i>
                    <span>Quy tắc vận hành mốc thưởng Hội Viên Tiêu Chuẩn:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                    <li>Dành riêng cho tài khoản đăng ký <strong>Gói Hội Viên Tiêu Chuẩn</strong> (mỗi chu kỳ nhận tỷ lệ trúng thưởng vượt trội).</li>
                    <li><strong>100% trúng thưởng</strong> (không có mốc rỗng 0đ Chúc May Mắn): Mức nhận gồm <strong>8.000đ (40%)</strong>, <strong>12.000đ (50%)</strong> hoặc <strong>35.000đ (10%)</strong>.</li>
                    <li>Tổng ngân sách mở rương riêng cho Hội Viên Tiêu Chuẩn: <strong>{standardMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng</strong>.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: HỘI VIÊN CAO CẤP */}
            {adminTierTab === 'premium' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-gem text-purple-400"></i>
                      <span>4. Cấu hình Hệ thống (Hội Viên Cao Cấp)</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        VIP Premium (Có Jackpot)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thiết lập hạn mức ngân sách tháng và 4 mốc phần thưởng độc quyền (bao gồm Siêu Jackpot 100.000đ) dành cho Hội Viên Cao Cấp.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                      totalPremiumTierPercentage === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}>
                      <i className={`fa-solid ${totalPremiumTierPercentage === 100 ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}`}></i>
                      <span>Tổng tỷ lệ: {totalPremiumTierPercentage}% {totalPremiumTierPercentage === 100 ? '(Chuẩn)' : '(Chưa chuẩn)'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetDefaultPremiumTiers}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Khôi phục 4 mốc mặc định: 20k (40%), 30k (30%), 55k (25%), Jackpot 100k (5%)"
                    >
                      <i className="fa-solid fa-rotate-left text-[10px]"></i>
                      <span>Khôi phục mặc định</span>
                    </button>
                  </div>
                </div>

                {/* Ô nhập Tổng Ngân Sách Mở Rương / Tháng cho Hội Viên Cao Cấp */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-sack-dollar text-purple-400"></i>
                        <span>Tổng Ngân Sách Mở Rương / Tháng (Hội Viên Cao Cấp)</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hạn mức quỹ tiền thưởng tối đa mở rương dành riêng cho các tài khoản Gói Hội Viên Cao Cấp trong 1 tháng dương lịch.
                      </p>
                    </div>
                    <span className="text-purple-400 text-xs font-mono font-bold bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 self-start sm:self-auto">
                      Quỹ cấu hình: {premiumMonthlyBudgetVal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={formData.treasureHuntConfig?.premiumMemberConfig?.monthlyBudget ?? 1000000}
                      onChange={(e) => handlePremiumMonthlyBudgetChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-purple-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                  </div>

                  {/* Khối gợi ý bảng Mốc phần thưởng theo ngân sách (Chỉ gợi ý) */}
                  <RewardTierSuggestionBox
                    tierType="premium"
                    tierName="Hội Viên Cao Cấp"
                    budget={premiumMonthlyBudgetVal}
                    onApply={handleApplySuggestedPremiumTiers}
                  />
                </div>

                {/* Hạn mức mở rương / ngày cho Hội Viên Cao Cấp */}
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-gift text-purple-400"></i>
                      <span>Hạn mức mở rương / ngày (Hội Viên Cao Cấp)</span>
                    </label>
                    <span className="text-purple-400 text-[10px] font-mono">Gói Cao Cấp</span>
                  </div>
                  <div className="relative max-w-md">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.treasureHuntConfig?.premiumMemberConfig?.dailyLimit ?? 1}
                      onChange={(e) => handlePremiumDailyLimitChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-purple-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rương / ngày</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Số lượng rương tối đa tài khoản Gói Cao Cấp được mở mỗi ngày (mặc định: 1 rương / ngày).</div>
                </div>

                {/* Bảng chỉnh sửa 4 mốc phần thưởng cho Hội Viên Cao Cấp */}
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
                      {currentPremiumRewardTiers.map((tier, idx) => (
                        <tr key={tier.id || idx} className="hover:bg-slate-950/40 transition">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${idx === 3 ? 'bg-amber-400' : 'bg-purple-400'}`}></span>
                              <input
                                type="text"
                                value={tier.label || ''}
                                onChange={(e) => handleUpdatePremiumTier(idx, 'label', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs focus:border-purple-400 focus:outline-none"
                                placeholder="Tên mốc phần thưởng..."
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 max-w-[200px]">
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={tier.amount ?? 0}
                                onChange={(e) => handleUpdatePremiumTier(idx, 'amount', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-purple-300 font-mono font-bold text-xs focus:border-purple-400 focus:outline-none"
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
                                onChange={(e) => handleUpdatePremiumTier(idx, 'percentage', e.target.value)}
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

                {/* Ghi chú giải thích cơ chế Hội Viên Cao Cấp */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
                  <div className="text-slate-300 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-purple-400 text-[11px]"></i>
                    <span>Quy tắc vận hành mốc thưởng Hội Viên Cao Cấp:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
                    <li>Dành riêng cho tài khoản đăng ký <strong>Gói Hội Viên Cao Cấp (VIP Premium)</strong> với giá trị mở rương lớn nhất sàn.</li>
                    <li><strong>100% trúng thưởng</strong>: Mức nhận gồm <strong>20.000đ (40%)</strong>, <strong>30.000đ (30%)</strong>, <strong>55.000đ (25%)</strong> và cơ hội nổ <strong>Siêu Jackpot 100.000đ (5%)</strong>.</li>
                    <li>Tổng ngân sách mở rương riêng cho Hội Viên Cao Cấp: <strong>{premiumMonthlyBudgetVal.toLocaleString('vi-VN')}đ / tháng</strong>.</li>
                  </ul>
                </div>
              </div>
            )}
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

      {/* ==============================================================
          TAB 4: DỰ ĐOÁN GIÁ BĐS & CẤU HÌNH BOT ẢO (AI FOMO ENGINE)
         ============================================================== */}
      {activeSubTab === 'predictions' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-chart-line"></i>
                </span>
                <h2 className="text-base font-black text-white">
                  Quản Lý Dự Đoán Giá BĐS & AI Bot Ảo (FOMO Engine)
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Thiết lập chương trình dự đoán giá thẩm định cộng đồng, cấu hình Bot ảo tạo hiệu ứng bảng xếp hạng đông đúc, và chốt kết quả tự động chia đều giải thưởng cho User thật.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenProgramModal()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-900/40 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <i className="fa-solid fa-circle-plus"></i>
              <span>Tạo Chương Trình Mới</span>
            </button>
          </div>

          {/* Danh sách các chương trình */}
          <div className="grid grid-cols-1 gap-6">
            {predictionPrograms.map(prog => {
              const allVotes = getStoredPredictions(prog.id);
              const botVotes = allVotes.filter(v => v.is_bot === 1);
              const realVotes = allVotes.filter(v => !v.is_bot && v.is_bot !== 1);
              const isSettled = prog.status === 'settled';

              return (
                <div
                  key={prog.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5"
                >
                  {/* Top info */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={prog.image}
                        alt={prog.projectName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-700"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSettled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isSettled ? 'Đã Chốt Kết Quả' : 'Đang Hoạt Động'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            (systemConfig?.predictionRequireMembership !== undefined ? systemConfig.predictionRequireMembership : prog.requireMembership !== false) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            <i className={`fa-solid ${(systemConfig?.predictionRequireMembership !== undefined ? systemConfig.predictionRequireMembership : prog.requireMembership !== false) ? 'fa-crown text-amber-400' : 'fa-users'}`}></i>
                            <span>{(systemConfig?.predictionRequireMembership !== undefined ? systemConfig.predictionRequireMembership : prog.requireMembership !== false) ? 'Đặc Quyền Gói Hội Viên' : 'Mở Cho Tất Cả'}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {prog.location}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white">
                          {prog.title || prog.projectName}
                        </h3>
                        <div className="text-xs text-slate-400">
                          Khoảng tham chiếu: <strong className="text-indigo-400">{prog.currentEstimate}</strong> • Thời gian: <strong className="text-slate-200">{new Date(prog.startDate).toLocaleDateString('vi-VN')} - {new Date(prog.endDate).toLocaleDateString('vi-VN')}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Tổng Giải Thưởng</div>
                        <div className="text-base font-black text-amber-400 font-mono">
                          {(Number(prog.totalPrize) || 2000000).toLocaleString('vi-VN')} đ Ví KM
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Lượt Tham Gia</div>
                        <div className="text-base font-black text-emerald-400 font-mono">
                          {allVotes.length.toLocaleString('vi-VN')} ({realVotes.length} thật / {botVotes.length} bot)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cấu hình Bot Ảo (is_bot = 1) */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                          <i className="fa-solid fa-robot"></i>
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Cấu Hình Bot Ảo Tạo Hiệu Ứng FOMO (is_bot = 1)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Trạng thái Bot:</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          prog.botConfig?.isEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {prog.botConfig?.isEnabled ? 'Bật Bot' : 'Tắt Bot'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">Số lượng Bot</div>
                        <div className="text-base font-black text-white font-mono">
                          {(prog.botConfig?.botCount || 2000).toLocaleString('vi-VN')} bot
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">Giá cơ sở</div>
                        <div className="text-base font-black text-amber-400 font-mono">
                          {prog.botConfig?.basePrice || prog.basePrice || 7.8} tỷ
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">Biên độ dao động (Spread)</div>
                        <div className="text-base font-black text-indigo-400 font-mono">
                          ±{prog.botConfig?.spreadPercent || prog.spreadPercent || 6}%
                        </div>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">Quyền nhận thưởng</div>
                        <div className="text-xs font-bold text-rose-400 mt-0.5">
                          100% Không được nhận giải
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-indigo-300 bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-900/40 flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-amber-400"></i>
                      <span><strong>Cơ chế chia thời gian như thật:</strong> Bot ảo được phân bổ rải đều từ ngày bắt đầu ({new Date(prog.startDate).toLocaleDateString('vi-VN')}) đến hiện tại theo nhịp sinh hoạt thực tế (giờ vàng sáng/tối tham gia đông, đêm muộn thưa thớt, mốc mới nhất hiển thị "Vừa xong", "X phút trước").</span>
                    </div>

                    {/* HÀNG NÚT HÀNH ĐỘNG CỦA ADMIN */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSyncingBotId === prog.id}
                          onClick={() => handleSyncBots(prog)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-indigo-300 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-700"
                        >
                          <i className={`fa-solid ${isSyncingBotId === prog.id ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`}></i>
                          <span>{isSyncingBotId === prog.id ? 'Đang chạy đồng bộ...' : 'Chạy / Đồng Bộ Bot'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenProgramModal(prog)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>Chỉnh Sửa</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSettled}
                          onClick={() => handleOpenSettleModal(prog)}
                          className={`px-5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg ${
                            isSettled
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 shadow-amber-500/20'
                          }`}
                        >
                          <i className="fa-solid fa-gavel"></i>
                          <span>{isSettled ? 'Đã Chốt Kết Quả' : 'Chốt Kết Quả & Quay Thưởng'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProgram(prog.id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-700"
                          title="Xóa chương trình"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* NẾU ĐÃ CHỐT KẾT QUẢ: HIỂN THỊ TÓM TẮT GIẢI THƯỞNG */}
                  {isSettled && prog.settledResult && (
                    <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-amber-300">
                        <span>Giá Chốt Thực Tế: <strong className="font-mono text-white text-sm">{prog.settledResult.targetPrice} tỷ</strong></span>
                        <span>{prog.settledResult.isSplitPrize ? `Chia đều ${prog.settledResult.winners.length} người thắng` : 'Xếp hạng Top 1, 2, 3'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {prog.settledResult.winners?.slice(0, 3).map((w, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white flex items-center gap-1">
                                <span className="text-amber-400">#{w.rank || idx + 1}</span>
                                <span>{w.userName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">Đoán: {w.predictedPrice} tỷ (Lệch: {w.diff} tỷ)</div>
                            </div>
                            <div className="text-right font-mono font-black text-emerald-400">
                              +{w.rewardAmount?.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 1: CHỐT KẾT QUẢ & QUAY THƯỞNG (ADMIN)
         ============================================================== */}
      {settleModalProgram && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-md">
                  <i className="fa-solid fa-gavel"></i>
                </span>
                <div>
                  <h3 className="text-base font-black text-white">Chốt Kết Quả & Trao Thưởng</h3>
                  <div className="text-[11px] text-slate-400">{settleModalProgram.title}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettleModalProgram(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Quy trình hệ thống xử lý tự động:</div>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-filter text-amber-400"></i>
                    <span><strong>Bước 1:</strong> Loại bỏ toàn bộ Bot ảo (<code className="text-amber-300">is_bot = 1</code>), chỉ giữ User thật (<code className="text-emerald-300">is_bot = 0</code>).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-calculator text-indigo-400"></i>
                    <span><strong>Bước 2:</strong> Tự động tính <strong>Giá Chuẩn theo Trung Vị (Median)</strong> của người thật và xếp hạng sai số.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-gift text-emerald-400"></i>
                    <span><strong>Bước 3:</strong> Nếu &gt;3 người đồng hạng ở Top, tự động <strong>chia đều tổng giải thưởng {(settleModalProgram.totalPrize || 2000000).toLocaleString('vi-VN')}đ</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fa-solid fa-award text-purple-400"></i>
                    <span><strong>Bước 4:</strong> Trao Huy hiệu vinh danh <strong>"Thần Phán Đoán BĐS ★"</strong> và bắn pháo hoa vinh danh.</span>
                  </li>
                </ul>
              </div>

              {/* KHỐI TỰ ĐỘNG TÍNH GIÁ CHUẨN THEO TRUNG VỊ NGƯỜI THẬT */}
              {(() => {
                const allRecords = getStoredPredictions(settleModalProgram.id);
                const realUsers = allRecords.filter(r => !r.is_bot && r.is_bot !== 1);
                const medianPrice = calculateMedianPrice(realUsers);

                return (
                  <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900 border-2 border-amber-500/50 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-chart-pie"></i>
                        Phương pháp tính Giá Chuẩn:
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Trung Vị Người Thật (Median)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[11px] text-slate-400">Số User thật tham gia:</div>
                        <div className="text-base font-black text-white font-mono">
                          {realUsers.length.toLocaleString('vi-VN')} người
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-amber-300 font-bold">Giá Chuẩn Trung Vị (Tự Động):</div>
                        <div className="text-2xl font-black text-amber-400 font-mono">
                          {realUsers.length > 0 ? `${medianPrice} tỷ VNĐ` : 'Chưa có người thật'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-check text-emerald-400"></i>
                        <span>Hệ thống tự động lấy giá trị trung vị của toàn bộ người dùng thật (<code className="text-emerald-300 font-mono">is_bot = 0</code>) làm giá chuẩn xét giải.</span>
                      </div>
                      {realUsers.length < 3 && (
                        <div className="flex items-start gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-[10px] leading-relaxed">
                          <i className="fa-solid fa-wand-magic-sparkles text-amber-400 mt-0.5"></i>
                          <span>Khi có ít hơn 3 user thật ({realUsers.length} người): Hệ thống sẽ tự động bổ sung random 2 - 5 bot có mức giá gần trung vị, ưu tiên người thật nhận Giải 1 & Giải 2, Giải 3 chia đều cho hệ thống bot.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSettleModalProgram(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteSettle}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
              >
                <i className="fa-solid fa-check-double"></i>
                <span>Xác Nhận Chốt Theo Giá Trung Vị</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 2: KẾT QUẢ XÉT THƯỞNG & VINH DANH (CONFEDTI + BANNER)
         ============================================================== */}
      {settledResultData && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          {showAdminConfetti && (
            <PredictionConfetti duration={5000} onComplete={() => setShowAdminConfetti(false)} />
          )}

          <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 text-white shadow-2xl relative text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              <i className="fa-solid fa-trophy animate-bounce"></i>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Chốt Kết Quả & Trao Thưởng Thành Công!
              </h3>
              <p className="text-xs text-slate-400">
                Giá chuẩn: <strong className="text-emerald-400 font-mono text-sm">{settledResultData.targetPrice} tỷ</strong> • Tổng giải: <strong className="text-amber-400 font-mono">{settledResultData.totalPrize.toLocaleString('vi-VN')}đ</strong>
              </p>
              {settledResultData.isSplitPrize && (
                <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-[11px] rounded-full border border-amber-500/30 mt-1">
                  Đồng hạng &gt;3 người: Đã chia đều {settledResultData.rewardPerWinner?.toLocaleString('vi-VN')}đ / người
                </div>
              )}
            </div>

            {/* Bảng Danh sách Người chiến thắng */}
            <div className="space-y-2 text-left max-h-60 overflow-y-auto pr-1">
              {settledResultData.winners?.map((w, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      #{w.rank || idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{w.userName}</span>
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                          {w.rewardBadge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Đoán: <strong className="text-indigo-400 font-mono">{w.predictedPrice} tỷ</strong> (Lệch: {w.diff} tỷ)
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-black text-emerald-400 text-sm">
                    +{w.rewardAmount?.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSettledResultData(null);
                setShowAdminConfetti(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 3: TẠO MỚI / CHỈNH SỬA CHƯƠNG TRÌNH DỰ ĐOÁN
         ============================================================== */}
      {programModalOpen && editingProgram && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProgram} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black">
                {editingProgram.id ? 'Chỉnh Sửa Chương Trình Dự Đoán' : 'Tạo Chương Trình Dự Đoán Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Tên chương trình:</label>
                <input
                  type="text"
                  required
                  value={editingProgram.title}
                  onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                  placeholder="VD: Dự đoán giá Penthouse Sun Ponte Residence"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Tên BĐS / Dự án:</label>
                  <input
                    type="text"
                    required
                    value={editingProgram.projectName}
                    onChange={(e) => setEditingProgram({ ...editingProgram, projectName: e.target.value })}
                    placeholder="VD: Penthouse Sun Ponte"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Vị trí (Khu vực):</label>
                  <input
                    type="text"
                    value={editingProgram.location}
                    onChange={(e) => setEditingProgram({ ...editingProgram, location: e.target.value })}
                    placeholder="VD: Sơn Trà, Đà Nẵng"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    value={editingProgram.startDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Ngày kết thúc:</label>
                  <input
                    type="date"
                    value={editingProgram.endDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Tổng giải thưởng (VNĐ Ví KM):</label>
                  <input
                    type="number"
                    step="100000"
                    value={editingProgram.totalPrize || 2000000}
                    onChange={(e) => setEditingProgram({ ...editingProgram, totalPrize: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Khoảng giá tham chiếu:</label>
                  <input
                    type="text"
                    value={editingProgram.currentEstimate}
                    onChange={(e) => setEditingProgram({ ...editingProgram, currentEstimate: e.target.value })}
                    placeholder="VD: 14.5 - 16.0 tỷ"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Ảnh BĐS (URL):</label>
                <input
                  type="url"
                  value={editingProgram.image}
                  onChange={(e) => setEditingProgram({ ...editingProgram, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              {/* QUẢN LÝ ĐẶC QUYỀN GÓI HỘI VIÊN TẬP TRUNG TẠI MENU GÓI HỘI VIÊN */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-purple-500/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                    <i className="fa-solid fa-crown text-amber-400"></i>
                    <span>Đặc Quyền Dành Cho Gói Hội Viên</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bật / tắt tập trung tại <strong>Menu Gói Hội Viên</strong> toàn sàn.
                  </div>
                </div>
                <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 border border-purple-500/40 px-2 py-1 rounded-lg">
                  Quản lý tại Menu Hội Viên
                </span>
              </div>

              {/* KHỐI CẤU HÌNH BOT ẢO */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase text-[11px]">
                    <i className="fa-solid fa-robot"></i>
                    <span>Cấu hình AI Bot Ảo (is_bot = 1)</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProgram.botConfig?.isEnabled !== false}
                      onChange={(e) => setEditingProgram({
                        ...editingProgram,
                        botConfig: {
                          ...(editingProgram.botConfig || {}),
                          isEnabled: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Số lượng Bot:</label>
                    <input
                      type="number"
                      min="10"
                      max="3000"
                      value={editingProgram.botConfig?.botCount || 2000}
                      onChange={(e) => setEditingProgram({
                        ...editingProgram,
                        botConfig: {
                          ...(editingProgram.botConfig || {}),
                          botCount: Number(e.target.value)
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Giá cơ sở (tỷ):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProgram.botConfig?.basePrice || editingProgram.basePrice || 7.8}
                      onChange={(e) => setEditingProgram({
                        ...editingProgram,
                        botConfig: {
                          ...(editingProgram.botConfig || {}),
                          basePrice: Number(e.target.value)
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Biên độ dao động (%):</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editingProgram.botConfig?.spreadPercent || editingProgram.spreadPercent || 8}
                      onChange={(e) => setEditingProgram({
                        ...editingProgram,
                        botConfig: {
                          ...(editingProgram.botConfig || {}),
                          spreadPercent: Number(e.target.value)
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-indigo-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Lưu Chương Trình
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
