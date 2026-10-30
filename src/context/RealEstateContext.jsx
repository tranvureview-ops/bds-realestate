'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  fetchFullSupabaseDb,
  upsertSupabaseProperty,
  deleteSupabaseProperty,
  upsertSupabaseSetting,
  deleteSupabaseSetting,
  upsertSupabaseProfile,
  deleteSupabaseProfile,
  insertSupabaseTransaction,
  syncFullDbToSupabase
} from '../lib/supabase';
import { getEarliestExpiringBonus, deductBatchesFifo } from '../utils/bonusExpiryUtils';

// Helper bất đồng bộ lưu cấu hình sàn lên Supabase SDK
const persistSettingToSupabase = async (key, value) => {
  try {
    await upsertSupabaseSetting(key, value);
    if (typeof window !== 'undefined') {
      fetch('/api/db-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      }).catch(err => console.warn(`Lỗi db-sync khi lưu ${key}:`, err));
    }
  } catch (err) {
    console.warn(`Lỗi lưu cấu hình ${key} lên Supabase:`, err);
  }
};

// Helper bất đồng bộ xóa cấu hình sàn trên Supabase SDK
const removeSettingFromSupabase = async (key) => {
  try {
    await deleteSupabaseSetting(key);
    if (typeof window !== 'undefined') {
      fetch('/api/db-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: null })
      }).catch(err => console.warn(`Lỗi db-sync khi xóa ${key}:`, err));
    }
  } catch (err) {
    console.warn(`Lỗi xóa cấu hình ${key} trên Supabase:`, err);
  }
};
import { 
  INITIAL_PROPERTIES, 
  VIP_PACKAGES, 
  MEMBERSHIP_PACKAGES,
  BUMP_SERVICE_PRICE, 
  NORMAL_PUBLISH_PRICE,
  MOCK_USERS, 
  MOCK_TRANSACTIONS,
  INITIAL_NAV_MENU,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_SOCIAL_LINKS,
  PRESET_LOGOS,
  DEFAULT_PAYMENT_CONFIG,
  DEFAULT_APPROVAL_TIERS,
  VIETNAM_BANKS,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_SINGLE_CONFIG,
  DEFAULT_EMAIL_CONFIG,
  DEFAULT_EMAIL_TEMPLATES
} from '../data/mockData';
import { getPropertyPermalink, parsePropertyUrl, toVietnameseSlug, formatSentenceCase } from '../utils/permalink';
import { DEFAULT_REWARDS_CONFIG } from '../data/rewardData';
import { normalizePhone, formatPhoneNumber } from '../utils/authValidation';
import { sanitizePhoneFromText } from '../utils/textSanitizer';
import {
  getEmailLogs,
  dispatchEmail,
  generateAdminReportAlertEmailHtml,
  generateReporterConfirmationEmailHtml,
  generateAuthorWarningEmailHtml,
  generateResolutionEmailToReporterHtml,
  generateTestEmailHtml,
  renderEmailTemplateString,
  REPORT_REASONS
} from '../utils/emailService';
import { syncFeaturesWithVouchers } from '../utils/membershipHelper';

// Hàm tạo Slug Tiêu Đề chuẩn tiếng Việt không dấu (SEO-friendly)
export const createVietnameseSlug = toVietnameseSlug;

/**
 * Helper tính toán mốc thời gian chính xác cho Khung Giờ Vàng (Hẹn Giờ Đăng Tin)
 * @param {string} startDateStr Ngày bắt đầu định dạng YYYY-MM-DD
 * @param {string} scheduleTimeStr Khung giờ hẹn định dạng HH:mm (VD: "08:00", "11:30", "14:00", "19:30")
 * @returns {string|null} Chuỗi ISO 8601 của mốc xuất bản
 */
export const calculateScheduledPublishTimestamp = (startDateStr, scheduleTimeStr) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFutureDate = Boolean(startDateStr && startDateStr > todayStr);
  const isSpecificTime = Boolean(scheduleTimeStr && scheduleTimeStr !== 'now');

  if (!isSpecificTime && !isFutureDate) return null;

  let targetHours = 8;
  let targetMinutes = 0;

  if (isSpecificTime) {
    const [hourStr, minuteStr] = scheduleTimeStr.split(':');
    targetHours = parseInt(hourStr, 10) || 8;
    targetMinutes = parseInt(minuteStr, 10) || 0;
  } else {
    // Nếu chọn ngày tương lai nhưng để 'now', xuất bản vào đầu giờ làm việc (08:00) ngày hẹn
    targetHours = 8;
    targetMinutes = 0;
  }

  let targetDate = new Date();
  if (startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
    const [y, m, d] = startDateStr.split('-').map(Number);
    targetDate = new Date(y, m - 1, d, targetHours, targetMinutes, 0, 0);
  } else {
    targetDate.setHours(targetHours, targetMinutes, 0, 0);
  }

  // Nếu mốc thời gian đã trôi qua so với hiện tại, tự động dời sang khung giờ tương ứng của ngày kế tiếp
  while (targetDate.getTime() <= Date.now()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  return targetDate.toISOString();
};

// Chuẩn hóa và tính toán vòng đời / thời hạn bài viết theo quy chuẩn
export const normalizePropertyExpiration = (p) => {
  if (!p) return p;
  const now = Date.now();
  let listingDays = Number(p.listingDays) || (p.vipPackageId === 'vip-diamond' ? 30 : 15);
  let expiresAt = p.expiresAt;
  let status = p.status || 'active';
  let vipPackageId = p.vipPackageId === 'vip-bronze' ? 'vip-silver' : (p.vipPackageId || 'normal');
  let downgradedFromVip = p.downgradedFromVip || null;
  let vipExpiredAt = p.vipExpiredAt || null;
  let isFeatured = p.isFeatured;
  let hasDualListing = p.hasDualListing;

  // Thiết lập dữ liệu mẫu minh họa cho các trạng thái bài đăng
  if (p.id === 'BDS-008') {
    status = 'expired';
    if (!expiresAt || new Date(expiresAt).getTime() > now) {
      expiresAt = new Date(now - 50 * 86400 * 1000).toISOString(); // Đã hết hạn 50 ngày trước (đạt ngưỡng dọn dẹp DB 45 ngày)
    }
  } else if (p.id === 'BDS-007') {
    if (status === 'active' && (!expiresAt || new Date(expiresAt).getTime() <= now)) {
      expiresAt = new Date(now + 2 * 86400 * 1000 + 4 * 3600 * 1000).toISOString(); // Sắp hết hạn (còn 2 ngày)
    }
  } else if (p.id === 'BDS-006') {
    if (status === 'active' && (!expiresAt || new Date(expiresAt).getTime() <= now)) {
      expiresAt = new Date(now + 1 * 86400 * 1000 + 6 * 3600 * 1000).toISOString(); // Sắp hết hạn (còn 1 ngày)
    }
  } else if (status === 'active' && !expiresAt) {
    const pubTime = p.publishedAt ? new Date(p.publishedAt).getTime() : now;
    const computed = pubTime + listingDays * 86400 * 1000;
    expiresAt = (computed > now) ? new Date(computed).toISOString() : new Date(now + 14 * 86400 * 1000).toISOString();
  }

  // Hàng đợi tiêu chuẩn FIFO / Countdown tự động xuất bản
  let autoApproveAt = p.autoApproveAt;
  let queuePriority = p.queuePriority || (vipPackageId === 'vip-diamond' ? 'priority_diamond' : (vipPackageId === 'vip-gold' ? 'priority_gold' : (vipPackageId === 'vip-silver' ? 'priority_silver' : 'standard_fifo')));
  if (status === 'pending') {
    if (p.isScheduledPublish || p.scheduledPublishAt) {
      autoApproveAt = p.scheduledPublishAt || p.autoApproveAt || calculateScheduledPublishTimestamp(p.startDate, p.scheduleTime);
      queuePriority = 'scheduled_golden_hour';
    } else if (!autoApproveAt) {
      if (vipPackageId === 'vip-gold') {
        autoApproveAt = new Date(now + 12 * 60 * 1000).toISOString();
      } else if (vipPackageId === 'vip-silver') {
        autoApproveAt = new Date(now + 24 * 60 * 1000).toISOString();
      } else {
        // Hàng đợi tiêu chuẩn FIFO: Tự động xuất bản trong 1 tiếng (còn 48 phút với bài mẫu)
        autoApproveAt = new Date(now + 48 * 60 * 1000).toISOString();
      }
    }
  }

  // QUY TẮC ĐẶC QUYỀN VIP: Khi hết thời hạn VIP (VIP Kim Cương, VIP Vàng, VIP Bạc) thì tự động hạ thành Tin Thường và cộng thêm 60 ngày từ ngày hết VIP
  if (status === 'active' && expiresAt && ['vip-diamond', 'vip-gold', 'vip-silver'].includes(vipPackageId)) {
    const vipExpTime = new Date(expiresAt).getTime();
    if (vipExpTime <= now) {
      const normalExpTime = vipExpTime + 60 * 86400 * 1000;
      downgradedFromVip = vipPackageId;
      vipExpiredAt = expiresAt;
      vipPackageId = 'normal';
      isFeatured = false;
      hasDualListing = false;
      listingDays = 60;
      expiresAt = new Date(normalExpTime).toISOString();

      if (now >= normalExpTime) {
        // Quá cả thời hạn 60 ngày tin thường được tặng kèm
        if (!p.isDeleted && status !== 'trash') {
          status = 'expired';
        }
      } else {
        status = 'active';
      }
    }
  } else if (status === 'active' && expiresAt && new Date(expiresAt).getTime() <= now && !p.isDeleted && status !== 'trash') {
    // Tự động chuyển status sang expired nếu đã quá ngày hết hạn đối với Tin Thường
    status = 'expired';
  }

  // Chuẩn hóa tiêu đề: Chữ cái đầu tiên in hoa, các chữ sau in thường (Sentence Case)
  const title = p.title ? formatSentenceCase(p.title) : p.title;

  return {
    ...p,
    title,
    listingDays,
    expiresAt,
    status,
    autoApproveAt,
    queuePriority,
    autoRenew: p.autoRenew !== undefined ? Boolean(p.autoRenew) : (vipPackageId === 'vip-diamond'),
    vipPackageId,
    downgradedFromVip,
    vipExpiredAt,
    isFeatured,
    hasDualListing,
    is_verified: Boolean(p.is_verified ?? p.isVerified),
    isVerified: Boolean(p.is_verified ?? p.isVerified),
    verification_status: p.verification_status || p.verificationStatus || (Boolean(p.is_verified ?? p.isVerified) ? 'verified' : 'unverified'),
    verificationStatus: p.verification_status || p.verificationStatus || (Boolean(p.is_verified ?? p.isVerified) ? 'verified' : 'unverified'),
    verificationDocuments: p.verificationDocuments || p.verification_documents || null,
    verificationRejectReason: p.verificationRejectReason || null
  };
};

// Hàm trích xuất thông tin hạn dùng của bài đăng
export const getPropertyExpirationInfo = (prop) => {
  if (!prop) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeText: '--',
      badgeClass: 'bg-slate-800 text-slate-400',
      countdownText: '--'
    };
  }

  const now = Date.now();
  const isPending = prop.status === 'pending';
  const isRejected = prop.status === 'rejected';
  const isTrash = prop.isDeleted || prop.status === 'trash';
  const isArchived = prop.isArchived || prop.status === 'archived';

  if (isTrash) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeText: '🗑️ Trong thùng rác',
      badgeClass: 'bg-rose-950/90 text-rose-300 border border-rose-800',
      countdownText: 'Đã chuyển vào thùng rác'
    };
  }

  if (isArchived) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeText: '📦 Đã nén lưu trữ nhẹ',
      badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
      countdownText: 'Lưu trữ tối ưu hóa DB'
    };
  }

  if (isPending) {
    let pendingNote = '⏳ Chờ phê duyệt';
    let countdownDesc = `Thời hạn gói: ${prop.listingDays || 15} ngày`;
    if (prop.autoApproveAt) {
      const waitMs = new Date(prop.autoApproveAt).getTime() - now;
      if (waitMs > 0) {
        const minLeft = Math.ceil(waitMs / (60 * 1000));
        if (prop.vipPackageId === 'vip-gold') {
          pendingNote = `⏱ Ưu tiên Vàng (Còn ~${minLeft}p)`;
        } else if (prop.vipPackageId === 'vip-silver') {
          pendingNote = `⏱ Ưu tiên Bạc (Còn ~${minLeft}p)`;
        } else {
          pendingNote = `📋 FIFO (Còn ~${minLeft}p tự xuất bản)`;
        }
        countdownDesc = `Tự động xuất bản sau ~${minLeft} phút`;
      }
    }
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: Number(prop.listingDays) || 15,
      hoursRemaining: 0,
      badgeText: pendingNote,
      badgeClass: 'bg-amber-950/80 text-amber-400 border border-amber-800',
      countdownText: countdownDesc
    };
  }

  if (isRejected) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      badgeText: '🚫 Bị từ chối',
      badgeClass: 'bg-rose-950/80 text-rose-400 border border-rose-800',
      countdownText: 'Tin không được hiển thị'
    };
  }

  const expTime = prop.expiresAt ? new Date(prop.expiresAt).getTime() : 0;
  const diffMs = expTime - now;
  const isExpired = prop.status === 'expired' || (expTime > 0 && diffMs <= 0);

  if (isExpired) {
    const daysAgo = expTime > 0 ? Math.max(1, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))) : 1;
    return {
      isExpired: true,
      isExpiringSoon: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      daysAgo,
      badgeText: `🛑 Đã hết hạn (${daysAgo} ngày trước)`,
      badgeClass: 'bg-rose-950/80 text-rose-400 border border-rose-800',
      countdownText: `Quá hạn ${daysAgo} ngày`
    };
  }

  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const isExpiringSoon = daysRemaining < 3; // Cảnh báo sớm: dưới 3 ngày

  if (isExpiringSoon) {
    const timeStr = daysRemaining > 0 ? `Còn ${daysRemaining} ngày ${hoursRemaining}h` : `Còn ${hoursRemaining} giờ`;
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining,
      hoursRemaining,
      isDowngradedFromVip: Boolean(prop.downgradedFromVip),
      originalVip: prop.downgradedFromVip,
      badgeText: `⚠️ Sắp hết hạn (${timeStr})`,
      badgeClass: 'bg-amber-950/90 text-amber-300 border border-amber-500 font-bold animate-pulse',
      countdownText: `Còn ${daysRemaining} ngày ${hoursRemaining}h`
    };
  }

  // Nếu là tin thường được hạ từ VIP và được cộng 60 ngày:
  if (prop.downgradedFromVip) {
    const origVipName = prop.downgradedFromVip === 'vip-diamond' ? 'VIP Kim Cương' : prop.downgradedFromVip === 'vip-gold' ? 'VIP Vàng' : 'VIP Bạc';
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining,
      hoursRemaining,
      isDowngradedFromVip: true,
      originalVip: prop.downgradedFromVip,
      badgeText: `● Tin Thường (+60n từ ${origVipName} - Còn ${daysRemaining} ngày)`,
      badgeClass: 'bg-teal-950/80 text-teal-300 border border-teal-700',
      countdownText: `Còn ${daysRemaining} ngày hiển thị Tin Thường (Tặng kèm 60 ngày sau ${origVipName})`
    };
  }

  return {
    isExpired: false,
    isExpiringSoon: false,
    daysRemaining,
    hoursRemaining,
    badgeText: `● Còn ${daysRemaining} ngày`,
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800',
    countdownText: `Còn ${daysRemaining} ngày hiển thị`
  };
};

const RealEstateContext = createContext();

export const DEFAULT_GUEST_USER = {
  id: 'guest',
  name: 'Khách vãng lai',
  role: 'guest',
  roleName: 'Chưa đăng nhập',
  walletBalance: 0,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  isVerified: false
};

export const RealEstateProvider = ({ children, initialData = null, initialUser = null }) => {
  // Navigation View State ('listings', 'property-detail', 'admin', 'dashboard', 'favorites')
  const [currentView, setCurrentView] = useState('listings');

  // Hydration state tracker (Prevents Next.js SSR hydration mismatch with client localStorage)
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Properties State (deterministic SSR initial state)
  const [properties, setProperties] = useState(() => {
    const raw = (initialData?.bds_properties && Array.isArray(initialData.bds_properties) && initialData.bds_properties.length > 0)
      ? initialData.bds_properties
      : INITIAL_PROPERTIES;
    return raw.filter(p => !p.city || p.city === 'Đà Nẵng' || p.city.includes('Đà Nẵng') || p.city === 'Quảng Nam' || p.city.includes('Quảng Nam')).map(p => {
      const norm = normalizePropertyExpiration(p);
      return {
        ...norm,
        contactPhone: norm.contactPhone ? formatPhoneNumber(norm.contactPhone) : norm.contactPhone,
        author: norm.author ? {
          ...norm.author,
          phone: norm.author.phone ? formatPhoneNumber(norm.author.phone) : norm.author.phone
        } : norm.author
      };
    });
  });

  // 2. Favorites List
  const [favorites, setFavorites] = useState([]);

  // 4. Current User & Switcher (User, Broker, Admin) - Nhận initialUser từ Cookie Server SSR để đồng nhất 100%
  const [currentUser, setCurrentUser] = useState(() => {
    if (initialUser && (initialUser.status === 'trash' || initialUser.isDeleted || initialUser.status === 'locked')) {
      return DEFAULT_GUEST_USER;
    }
    let user = initialUser || DEFAULT_GUEST_USER;
    // Kiểm tra localStorage để khôi phục tức thời số dư Ví Khuyến Mãi nếu client đã nhận thưởng trước đó
    if (typeof window !== 'undefined' && user.id) {
      try {
        const cachedBonus = localStorage.getItem(`bds_user_bonus_${user.id}`);
        if (cachedBonus !== null && !isNaN(Number(cachedBonus))) {
          user = { ...user, bonusWalletBalance: Number(cachedBonus) };
        }
      } catch (e) {}
    }
    return {
      ...user,
      bonusWalletBalance: Number(user.bonusWalletBalance || 0),
      phone: user.phone ? formatPhoneNumber(user.phone) : user.phone
    };
  });

  // 5. All Users (for CMS Admin Management)
  const [usersList, setUsersList] = useState(() => {
    const list = (initialData?.bds_users_list && Array.isArray(initialData.bds_users_list) && initialData.bds_users_list.length > 0)
      ? initialData.bds_users_list
      : MOCK_USERS;
    return list.map(u => ({
      ...u,
      phone: u.phone ? formatPhoneNumber(u.phone) : u.phone
    }));
  });

  // 6. Listing Types / VIP Packages Configuration (editable by Admin)
  const normalizeVipPackage = (pkg) => {
    if (!pkg || !pkg.id) return pkg;
    const cleanFeatures = (Array.isArray(pkg.features) ? pkg.features : [])
      .filter(f => {
        if (typeof f !== 'string') return true;
        const lower = f.toLowerCase();
        return !lower.includes('nhân đôi hiển thị') &&
               !lower.includes('tặng kèm 1 tin thường') &&
               !lower.includes('đẩy miễn phí luôn tin thường') &&
               !lower.includes('được đẩy miễn phí luôn');
      })
      .map(f => {
        if (typeof f !== 'string') return f;
        return f.replace(/Chữ In Hoa/gi, 'chữ đậm').replace(/IN HOA/g, 'đậm');
      });
    if (pkg.id === 'normal') {
      const baseNormal = (pkg.pricePerDay !== undefined && pkg.pricePerDay !== null && !isNaN(Number(pkg.pricePerDay)))
        ? Math.max(0, Number(pkg.pricePerDay))
        : (pkg.rates?.[15] ?? 5000);
      const rate60 = (pkg.rates?.[60] !== undefined && Number(pkg.rates[60]) !== 0)
        ? Number(pkg.rates[60])
        : 5000;
      return {
        ...pkg,
        features: cleanFeatures,
        hasDualListing: false,
        pricePerDay: baseNormal,
        publishPrice: rate60,
        minDays: 60,
        allowedDurations: Array.isArray(pkg.allowedDurations) && pkg.allowedDurations.length > 0 ? pkg.allowedDurations : [60],
        approvalType: 'random_fifo',
        approvalTimeMinutes: 10,
        approvalMinMinutes: 5,
        approvalMaxMinutes: 15,
        approvalBadge: 'Duyệt tự động (5 - 15 phút)',
        approvalLabel: 'Duyệt tự động ngẫu nhiên (5 - 15 phút)',
        rates: {
          15: pkg.rates?.[15] ?? baseNormal,
          30: pkg.rates?.[30] ?? Math.round(baseNormal * 0.75),
          60: rate60
        }
      };
    }
    const base = (pkg.pricePerDay !== undefined && pkg.pricePerDay !== null && !isNaN(Number(pkg.pricePerDay)))
      ? Math.max(0, Number(pkg.pricePerDay))
      : (pkg.rates?.[7] ?? pkg.rates?.[15] ?? 0);
    return {
      ...pkg,
      features: cleanFeatures,
      hasDualListing: false,
      pricePerDay: base,
      minDays: 5,
      allowedDurations: [5, 7, 10, 15, 30],
      approvalType: 'instant',
      approvalTimeMinutes: 0,
      approvalBadge: 'Duyệt tức thì (0s)',
      approvalLabel: 'Duyệt Tức Thì tự động (Active ngay)',
      rates: {
        5: base,
        7: base,
        10: base,
        15: base,
        30: Math.round(base * 0.75),
        60: Math.round(base * 0.70)
      }
    };
  };

  const [vipPackages, setVipPackages] = useState(() => {
    const raw = (initialData?.bds_vip_packages && Array.isArray(initialData.bds_vip_packages) && initialData.bds_vip_packages.length >= 4)
      ? initialData.bds_vip_packages
      : VIP_PACKAGES;
    return raw.map(normalizeVipPackage);
  });

  // 6b. Membership Packages (Gói Hội Viên: Cơ bản, Tiêu chuẩn, Cao cấp)
  const [membershipPackages, setMembershipPackages] = useState(() => {
    const rawPackages = (initialData?.bds_membership_packages && Array.isArray(initialData.bds_membership_packages))
      ? initialData.bds_membership_packages
      : MEMBERSHIP_PACKAGES;
    const normalPkg = (initialData?.bds_vip_packages || VIP_PACKAGES).find(p => p.id === 'normal');
    const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 0));
    return rawPackages.map(pkg => ({
      ...pkg,
      vouchersPerCycle: {
        ...pkg.vouchersPerCycle,
        normalPublishDiscount: (!pkg.vouchersPerCycle?.normalPublishDiscount || pkg.vouchersPerCycle?.normalPublishDiscount === 35000)
          ? defaultNormalPrice
          : Number(pkg.vouchersPerCycle?.normalPublishDiscount)
      },
      allowScheduledPublishing: typeof pkg.allowScheduledPublishing === 'boolean'
        ? pkg.allowScheduledPublishing
        : (pkg.id === 'member-basic' ? false : true),
      allowFutureStartDate: typeof pkg.allowFutureStartDate === 'boolean'
        ? pkg.allowFutureStartDate
        : (pkg.id === 'member-basic' ? false : true)
    }));
  });

  // 6c. Dịch Vụ Đẩy Tin (Làm Mới Tin Lên Đầu Trang) - Editable by Admin
  const [bumpServicePrice, setBumpServicePrice] = useState(() => {
    if (typeof initialData?.bds_bump_service_price === 'number') {
      return initialData.bds_bump_service_price;
    }
    const normalPkg = (initialData?.bds_vip_packages || VIP_PACKAGES).find(p => p.id === 'normal');
    return normalPkg?.bumpPrice || BUMP_SERVICE_PRICE || 10000;
  });

  // 7. Transactions History
  const [transactions, setTransactions] = useState(() => {
    return (initialData?.bds_transactions && Array.isArray(initialData.bds_transactions))
      ? initialData.bds_transactions
      : MOCK_TRANSACTIONS;
  });

  // 8. Navigation Menu Configuration State
  const [navMenuItems, setNavMenuItems] = useState(() => {
    const raw = (initialData?.bds_nav_menu && Array.isArray(initialData.bds_nav_menu) && initialData.bds_nav_menu.length > 0)
      ? initialData.bds_nav_menu
      : INITIAL_NAV_MENU;
    return raw.map(item => {
      const isSale = item.path?.includes('nha-dat-ban') || item.id === 'menu-sale' || item.title?.toLowerCase().includes('bán');
      const isRent = item.path?.includes('cho-thue') || item.id === 'menu-rent' || item.title?.toLowerCase().includes('thuê');
      if ((isSale || isRent) && Array.isArray(item.children)) {
        return {
          ...item,
          children: item.children.map(sub => {
            const rawTitle = sub.title || '';
            if (isSale && !rawTitle.toLowerCase().startsWith('bán')) {
              return { ...sub, title: `Bán ${rawTitle}` };
            }
            if (isRent && !rawTitle.toLowerCase().startsWith('cho thuê')) {
              return { ...sub, title: `Cho Thuê ${rawTitle}` };
            }
            return sub;
          })
        };
      }
      return item;
    });
  });

  // 9. Header, Logo & Menu Width Configuration State
  const [headerConfig, setHeaderConfig] = useState(() => {
    const raw = initialData?.bds_header_config || {};
    return {
      ...DEFAULT_HEADER_CONFIG,
      ...raw,
      socialLinks: {
        ...DEFAULT_SOCIAL_LINKS,
        ...(DEFAULT_HEADER_CONFIG.socialLinks || {}),
        ...(raw.socialLinks || {})
      }
    };
  });

  // 9b. Footer Configuration State
  const [footerConfig, setFooterConfig] = useState(() => {
    const raw = initialData?.bds_footer_config || {};
    return {
      ...DEFAULT_FOOTER_CONFIG,
      ...raw
    };
  });

  // 10. Payment Methods Configuration State (Backend Admin Config)
  const [paymentConfig, setPaymentConfig] = useState(() => {
    const raw = initialData?.bds_payment_config || DEFAULT_PAYMENT_CONFIG;
    const currentTiers = raw?.approvalTiers || {};
    return {
      ...raw,
      approvalTiers: {
        ...currentTiers,
        'vip-diamond': {
          ...(currentTiers['vip-diamond'] || {}),
          mode: 'instant',
          delayMinutes: 0,
          badgeText: 'Duyệt tức thì (0s)'
        },
        'vip-gold': {
          ...(currentTiers['vip-gold'] || {}),
          mode: 'instant',
          delayMinutes: 0,
          badgeText: 'Duyệt tức thì (0s)'
        },
        'vip-silver': {
          ...(currentTiers['vip-silver'] || {}),
          mode: 'instant',
          delayMinutes: 0,
          badgeText: 'Duyệt tức thì (0s)'
        },
        'normal': {
          ...(currentTiers['normal'] || {}),
          mode: 'random',
          delayMinMinutes: currentTiers['normal']?.delayMinMinutes ?? 5,
          delayMaxMinutes: currentTiers['normal']?.delayMaxMinutes ?? 15,
          badgeText: `Duyệt tự động (${currentTiers['normal']?.delayMinMinutes ?? 5} - ${currentTiers['normal']?.delayMaxMinutes ?? 15} phút)`
        }
      }
    };
  });

  const updatePaymentConfig = async (newConfig) => {
    let merged;
    setPaymentConfig(prev => {
      merged = { ...prev, ...newConfig };
      return merged;
    });
    await persistSettingToSupabase('bds_payment_config', merged);
    showToast('Đã lưu cấu hình phương thức thanh toán thành công!', 'success');
  };

  const resetPaymentConfig = async () => {
    setPaymentConfig(DEFAULT_PAYMENT_CONFIG);
    await removeSettingFromSupabase('bds_payment_config');
    showToast('Đã khôi phục cấu hình thanh toán mặc định', 'info');
  };

  // 11. Cài Đặt Vận Hành Hệ Thống Sàn BĐS (Platform Operating Settings State)
  const [systemConfig, setSystemConfig] = useState(() => {
    const raw = initialData?.bds_system_config || {};
    return {
      ...DEFAULT_SYSTEM_CONFIG,
      ...raw,
      socialLinks: {
        ...DEFAULT_SOCIAL_LINKS,
        ...(DEFAULT_SYSTEM_CONFIG.socialLinks || {}),
        ...(raw.socialLinks || {})
      }
    };
  });

  // 11b. Cấu hình Trang Chi Tiết Bất Động Sản (Single Property Page Config)
  const [singleConfig, setSingleConfig] = useState(() => {
    return initialData?.bds_single_config || DEFAULT_SINGLE_CONFIG;
  });

  // 11c. Cấu hình Email Website & Máy Chủ Gửi Thư (Email Website & SMTP Config)
  const [emailConfig, setEmailConfig] = useState(() => {
    return initialData?.bds_email_config || DEFAULT_EMAIL_CONFIG;
  });

  // 11c2. Cấu hình Khuyến Mãi, Nhiệm Vụ & Trung Tâm Phần Thưởng (Rewards & Gamification Config)
  const [rewardsConfig, setRewardsConfig] = useState(() => {
    // 1. Ưu tiên cấu hình mới nhất từ Server SSR (Supabase / server-db.json)
    const serverConfig = initialData?.bds_rewards_config;
    if (serverConfig && typeof serverConfig === 'object') {
      const merged = {
        ...DEFAULT_REWARDS_CONFIG,
        ...serverConfig,
        missions: {
          ...(DEFAULT_REWARDS_CONFIG.missions || {}),
          ...(serverConfig.missions || {})
        }
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bds_rewards_config', JSON.stringify(merged));
        } catch (e) {}
      }
      return merged;
    }

    // 2. Dự phòng đọc từ LocalStorage
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('bds_rewards_config');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && typeof parsed === 'object') {
            const mergedMissions = { ...(DEFAULT_REWARDS_CONFIG.missions || {}) };
            if (parsed.missions && typeof parsed.missions === 'object') {
              for (const cat of Object.keys(mergedMissions)) {
                const defaultList = mergedMissions[cat] || [];
                const userList = parsed.missions[cat] || [];
                const userIds = new Set(userList.map(m => m.id));
                const missingFromUser = defaultList.filter(d => !userIds.has(d.id));
                mergedMissions[cat] = [...userList, ...missingFromUser];
              }
            }
            return {
              ...DEFAULT_REWARDS_CONFIG,
              ...parsed,
              missions: mergedMissions
            };
          }
        }
      } catch (e) {}
    }
    return DEFAULT_REWARDS_CONFIG;
  });

  // 11d. Danh sách Lịch hẹn xem nhà (Direct Property Viewing Appointments)
  const [appointmentsList, setAppointmentsList] = useState(() => {
    return (initialData?.bds_appointments && Array.isArray(initialData.bds_appointments))
      ? initialData.bds_appointments
      : [];
  });

  // 11e. Danh sách Thông báo nội bộ hệ thống (In-App Notifications)
  const [inAppNotifications, setInAppNotifications] = useState(() => {
    return (initialData?.bds_notifications && Array.isArray(initialData.bds_notifications))
      ? initialData.bds_notifications
      : [];
  });

  // Methods for System Config with Automatic Cross-System Brand & Hotline Synchronization
  const updateSystemConfig = async (newConfig) => {
    let updatedSystem;
    setSystemConfig(prev => {
      updatedSystem = { ...prev, ...newConfig };
      return updatedSystem;
    });

    let updatedHeader;
    // 1. TỰ ĐỘNG ĐỒNG BỘ NHẬN DIỆN THƯƠNG HIỆU SANG HEADER / NAVBAR
    const brandToSync = newConfig.brandShortName || newConfig.platformName;
    if (brandToSync || newConfig.tagline) {
      setHeaderConfig(prev => {
        let bName = prev.brandName;
        let bHighlight = prev.brandHighlight;
        if (brandToSync) {
          const words = brandToSync.trim().split(/\s+/).filter(Boolean);
          if (words.length <= 1) {
            bName = words[0] || '';
            bHighlight = '';
          } else if (words.length === 2) {
            bName = words[0];
            bHighlight = words[1];
          } else if (words.length === 3) {
            bName = `${words[0]} ${words[1]}`;
            bHighlight = words[2];
          } else {
            const mid = Math.ceil(words.length / 2);
            bName = words.slice(0, mid).join(' ');
            bHighlight = words.slice(mid).join(' ');
          }
        }

        updatedHeader = {
          ...prev,
          ...(brandToSync ? { brandName: bName, brandHighlight: bHighlight, logoAlt: `${brandToSync} Logo` } : {}),
          ...(newConfig.tagline ? { brandTagline: newConfig.tagline } : {})
        };
        return updatedHeader;
      });
    }

    let updatedSingle;
    // 2. TỰ ĐỘNG ĐỒNG BỘ SANG TRANG CHI TIẾT BĐS (Single Disclaimer)
    setSingleConfig(prev => {
      const brandNameForDisclaimer = newConfig.brandShortName || newConfig.platformName;
      updatedSingle = {
        ...prev,
        disclaimer: {
          ...(prev.disclaimer || {}),
          ...(newConfig.hotline ? { hotline: newConfig.hotline } : {}),
          ...(brandNameForDisclaimer ? { platformName: brandNameForDisclaimer } : {})
        }
      };
      return updatedSingle;
    });

    let updatedEmail;
    // 3. TỰ ĐỘNG ĐỒNG BỘ SANG CHỮ KÝ EMAIL & NGƯỜI GỬI EMAIL
    setEmailConfig(prev => {
      const brandForEmail = newConfig.platformName || newConfig.brandShortName;
      updatedEmail = {
        ...prev,
        ...(newConfig.email ? { replyToEmail: newConfig.email } : {}),
        ...(brandForEmail ? { fromName: `Ban Quản Trị Sàn ${newConfig.brandShortName || brandForEmail}` } : {}),
        signature: {
          ...(prev.signature || {}),
          ...(newConfig.hotline ? { hotline: newConfig.hotline } : {}),
          ...(newConfig.zalo ? { zalo: newConfig.zalo } : {}),
          ...(brandForEmail ? { companyName: brandForEmail } : {}),
          ...(newConfig.address ? { address: newConfig.address } : {})
        }
      };
      return updatedEmail;
    });

    let updatedFooter;
    // 4. TỰ ĐỘNG ĐỒNG BỘ SANG CHÂN TRANG FOOTER
    setFooterConfig(prev => {
      const brandToSync = newConfig.brandShortName || newConfig.platformName;
      const fullCompany = newConfig.platformName || brandToSync;
      updatedFooter = {
        ...prev,
        ...(newConfig.hotline ? { hotline: newConfig.hotline } : {}),
        ...(newConfig.zalo ? { zalo: newConfig.zalo } : {}),
        ...(newConfig.email ? { email: newConfig.email } : {}),
        ...(newConfig.address ? { address: newConfig.address } : {}),
        copyrightCustomText: `© ${new Date().getFullYear()} ${brandToSync || 'Sàn Bất Động Sản'}. Bản quyền thuộc về ${fullCompany || 'Ban Quản Trị Sàn'}.`,
        brandDescription: `${brandToSync || 'Sàn giao dịch'} là nền tảng thương mại điện tử chuyên nghiệp cung cấp thông tin mua bán, cho thuê nhà đất, dự án và đăng tin VIP hiệu quả cao trên toàn quốc.`
      };
      return updatedFooter;
    });

    await Promise.all([
      persistSettingToSupabase('bds_system_config', updatedSystem || newConfig),
      updatedHeader ? persistSettingToSupabase('bds_header_config', updatedHeader) : Promise.resolve(),
      updatedSingle ? persistSettingToSupabase('bds_single_config', updatedSingle) : Promise.resolve(),
      updatedEmail ? persistSettingToSupabase('bds_email_config', updatedEmail) : Promise.resolve(),
      updatedFooter ? persistSettingToSupabase('bds_footer_config', updatedFooter) : Promise.resolve()
    ]);

    showToast('Đã lưu và đồng bộ toàn bộ Thông tin thương hiệu & Liên hệ hệ thống!', 'success');
  };

  const resetSystemConfig = async () => {
    setSystemConfig(DEFAULT_SYSTEM_CONFIG);

    let updatedHeader;
    setHeaderConfig(prev => {
      updatedHeader = {
        ...prev,
        brandName: DEFAULT_HEADER_CONFIG.brandName,
        brandHighlight: DEFAULT_HEADER_CONFIG.brandHighlight,
        brandTagline: DEFAULT_HEADER_CONFIG.brandTagline,
        logoAlt: DEFAULT_HEADER_CONFIG.logoAlt
      };
      return updatedHeader;
    });

    let updatedSingle;
    setSingleConfig(prev => {
      updatedSingle = {
        ...prev,
        disclaimer: {
          ...(prev.disclaimer || {}),
          hotline: DEFAULT_SYSTEM_CONFIG.hotline,
          platformName: DEFAULT_SYSTEM_CONFIG.brandShortName
        }
      };
      return updatedSingle;
    });

    let updatedEmail;
    setEmailConfig(prev => {
      updatedEmail = {
        ...prev,
        fromName: `Ban Quản Trị Sàn ${DEFAULT_SYSTEM_CONFIG.brandShortName}`,
        replyToEmail: DEFAULT_SYSTEM_CONFIG.email,
        signature: {
          ...(prev.signature || {}),
          hotline: DEFAULT_SYSTEM_CONFIG.hotline,
          zalo: DEFAULT_SYSTEM_CONFIG.zalo,
          companyName: DEFAULT_SYSTEM_CONFIG.platformName,
          address: DEFAULT_SYSTEM_CONFIG.address
        }
      };
      return updatedEmail;
    });

    await Promise.all([
      removeSettingFromSupabase('bds_system_config'),
      persistSettingToSupabase('bds_header_config', updatedHeader),
      persistSettingToSupabase('bds_single_config', updatedSingle),
      persistSettingToSupabase('bds_email_config', updatedEmail)
    ]);

    showToast('Đã khôi phục cài đặt sàn và đồng bộ thương hiệu về mặc định!', 'info');
  };

  const updateSingleConfig = async (newConfig) => {
    let merged;
    setSingleConfig(prev => {
      merged = {
        ...prev,
        ...newConfig,
        disclaimer: {
          ...prev.disclaimer,
          ...(newConfig.disclaimer || {})
        },
        features: {
          ...prev.features,
          ...(newConfig.features || {})
        }
      };
      return merged;
    });
    await persistSettingToSupabase('bds_single_config', merged);
    showToast('Đã lưu cấu hình trang Single BĐS thành công!', 'success');
  };

  const resetSingleConfig = async () => {
    setSingleConfig(DEFAULT_SINGLE_CONFIG);
    await removeSettingFromSupabase('bds_single_config');
    showToast('Đã khôi phục cấu hình trang Single về mặc định!', 'info');
  };

  const updateRewardsConfig = async (newConfig) => {
    const current = rewardsConfig || DEFAULT_REWARDS_CONFIG;
    const merged = {
      ...current,
      ...newConfig,
      promotions: newConfig.promotions || current.promotions || [],
      missions: newConfig.missions || current.missions || {},
      checkInConfig: {
        ...(current.checkInConfig || {}),
        ...(newConfig.checkInConfig || {})
      },
      treasureHuntConfig: {
        ...(current.treasureHuntConfig || {}),
        ...(newConfig.treasureHuntConfig || {})
      },
      predictionGames: newConfig.predictionGames || current.predictionGames || []
    };
    setRewardsConfig(merged);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bds_rewards_config', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('bds_rewards_config_updated', { detail: merged }));
      } catch (e) {}
    }
    await persistSettingToSupabase('bds_rewards_config', merged);
    showToast('Đã lưu cấu hình Khuyến mãi & Phần thưởng thành công!', 'success');
  };

  const resetRewardsConfig = async () => {
    setRewardsConfig(DEFAULT_REWARDS_CONFIG);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bds_rewards_config');
      } catch (e) {}
    }
    await removeSettingFromSupabase('bds_rewards_config');
    showToast('Đã khôi phục cấu hình Khuyến mãi & Phần thưởng về mặc định!', 'info');
  };

  const updateEmailConfig = async (newConfig) => {
    let merged;
    setEmailConfig(prev => {
      merged = {
        ...prev,
        ...newConfig,
        smtp: {
          ...prev.smtp,
          ...(newConfig.smtp || {})
        },
        signature: {
          ...prev.signature,
          ...(newConfig.signature || {})
        },
        templates: {
          ...prev.templates,
          ...(newConfig.templates || {})
        }
      };
      return merged;
    });
    await persistSettingToSupabase('bds_email_config', merged);

    // Cập nhật đồng bộ các thư mang địa chỉ mẫu cũ trong Email Logs
    if (newConfig.fromEmail || newConfig.fromName) {
      setEmailLogs(prev => prev.map(m => {
        if (m.from === 'cskh@landmark.vn' || m.from === 'kiemduyet@landmark.vn' || m.from === 'system-alerts@landmark.vn') {
          return {
            ...m,
            from: newConfig.fromEmail || m.from,
            fromName: newConfig.fromName || m.fromName
          };
        }
        return m;
      }));
    }

    showToast('Đã lưu cấu hình email website & máy chủ SMTP thành công!', 'success');
  };

  // Cập nhật 1 mẫu nội dung email tùy biến
  const updateEmailTemplate = async (templateId, templateData) => {
    let merged;
    setEmailConfig(prev => {
      merged = {
        ...prev,
        templates: {
          ...prev.templates,
          [templateId]: {
            ...(prev.templates?.[templateId] || {}),
            ...templateData
          }
        }
      };
      return merged;
    });
    await persistSettingToSupabase('bds_email_config', merged);
    showToast(`Đã lưu tùy chỉnh mẫu thư "${DEFAULT_EMAIL_TEMPLATES[templateId]?.name || templateId}"!`, 'success');
  };

  // Khôi phục 1 mẫu email về chuẩn mặc định
  const resetEmailTemplate = async (templateId) => {
    if (!DEFAULT_EMAIL_TEMPLATES[templateId]) return;
    let merged;
    setEmailConfig(prev => {
      merged = {
        ...prev,
        templates: {
          ...prev.templates,
          [templateId]: DEFAULT_EMAIL_TEMPLATES[templateId]
        }
      };
      return merged;
    });
    await persistSettingToSupabase('bds_email_config', merged);
    showToast(`Đã khôi phục mẫu thư "${DEFAULT_EMAIL_TEMPLATES[templateId].name}" về mặc định!`, 'info');
  };

  // Khôi phục toàn bộ mẫu email về chuẩn ban đầu
  const resetAllEmailTemplates = async () => {
    let merged;
    setEmailConfig(prev => {
      merged = {
        ...prev,
        templates: DEFAULT_EMAIL_TEMPLATES
      };
      return merged;
    });
    await persistSettingToSupabase('bds_email_config', merged);
    showToast('Đã khôi phục toàn bộ 5 mẫu nội dung email về mặc định ban đầu!', 'info');
  };

  const resetEmailConfig = async () => {
    setEmailConfig(DEFAULT_EMAIL_CONFIG);
    await removeSettingFromSupabase('bds_email_config');
    showToast('Đã khôi phục cấu hình email về mặc định!', 'info');
  };

  // 1. Kiểm tra thông số kết nối máy chủ SMTP (Ping / Verify)
  const verifySmtpConnection = async (customSmtp = null) => {
    const smtp = customSmtp || emailConfig.smtp;
    try {
      const response = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        showToast('✅ Kết nối máy chủ SMTP thành công!', 'success');
        return { success: true, message: data.message };
      } else {
        const errMsg = data.error || 'Kết nối SMTP thất bại. Vui lòng kiểm tra lại Username và App Password.';
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const msg = 'Lỗi kết nối tới cổng kiểm tra SMTP nội bộ.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // 2. Gửi email thử nghiệm kiểm tra kết nối SMTP thực tế
  const sendTestEmail = async (recipientEmail) => {
    const to = (recipientEmail || emailConfig.adminAlertEmail || 'tranvu.review@gmail.com').trim();
    if (!to || !to.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email người nhận hợp lệ!', 'warning');
      return { success: false, error: 'Địa chỉ email người nhận không hợp lệ' };
    }

    const testSubject = renderEmailTemplateString(
      emailConfig?.templates?.smtp_test?.subject || '✅ [THỬ NGHIỆM] Kết nối máy chủ gửi thư thành công • {{siteName}}',
      {
        siteName: emailConfig?.signature?.companyName || 'Đất Biển Đà Nẵng',
        currentTime: new Date().toLocaleTimeString('vi-VN')
      }
    );
    const testHtml = generateTestEmailHtml({ emailConfig, testRecipient: to });
    const fromSender = emailConfig.fromEmail || 'kiemduyet@datbiendanang.vn';
    const fromName = emailConfig.fromName || 'Ban Quản Trị Sàn Đất Biển Đà Nẵng';

    let realDeliverySuccess = false;
    let deliveryMessage = '';
    let messageId = null;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: emailConfig.smtp,
          from: fromSender,
          fromName: fromName,
          to,
          toName: 'Quản Trị Viên (Thư Test)',
          subject: testSubject,
          html: testHtml,
          text: `Thư thử nghiệm kết nối máy chủ ${emailConfig.smtp?.host || 'SMTP'} lúc ${new Date().toLocaleTimeString('vi-VN')}`
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        realDeliverySuccess = true;
        messageId = result.messageId;
        deliveryMessage = `Đã phát thành công tới hòm thư thật ${to}! (MessageID: ${result.messageId})`;
        showToast(deliveryMessage, 'success');
      } else {
        deliveryMessage = result.error || 'Máy chủ SMTP từ chối kết nối hoặc mật khẩu ứng dụng chưa đúng.';
        showToast(deliveryMessage, 'error');
      }
    } catch (networkErr) {
      console.warn('Lỗi gọi endpoint /api/send-email:', networkErr);
      deliveryMessage = 'Không thể kết nối đến máy chủ gửi mail nội bộ. Đã ghi nhận thư vào Outbox mô phỏng.';
      showToast(deliveryMessage, 'warning');
    }

    // Luôn ghi nhận vào Outbox / Email Logs để theo dõi
    const testLog = await dispatchEmail({
      to,
      toName: 'Quản Trị Viên (Thư Test)',
      from: fromSender,
      fromName: fromName,
      subject: testSubject,
      previewText: `Xác thực kết nối máy chủ ${emailConfig.smtp?.host || 'SMTP'} (${realDeliverySuccess ? 'Đã phát thành công' : 'Thất bại: ' + deliveryMessage})...`,
      type: 'custom_admin_direct',
      status: realDeliverySuccess ? 'delivered' : 'failed',
      htmlBody: testHtml,
      metadata: {
        smtpHost: emailConfig.smtp?.host,
        smtpPort: emailConfig.smtp?.port,
        messageId: messageId,
        error: realDeliverySuccess ? null : deliveryMessage
      }
    });

    setEmailLogs(getEmailLogs());

    return {
      success: realDeliverySuccess,
      emailId: testLog.id,
      error: realDeliverySuccess ? null : deliveryMessage,
      messageId: messageId,
      to
    };
  };

  // 12. Listing Violation Reports State (Quản lý Báo Cáo Tin Rao Vi Phạm)
  const [listingReports, setListingReports] = useState([
    {
      id: 'REP-1729012300001',
      propertyId: 'BDS-003',
      propertyTitle: 'Cắt lỗ 2 tỷ căn hoa hậu 3PN Masterise Park Place',
      reason: 'price_wrong',
      description: 'Tiêu đề ghi cắt lỗ 2 tỷ nhưng gọi điện môi giới báo giá 4.2 tỷ, báo giá ảo để kéo khách xem.',
      contact: '0918 882 199 (hoangnam.tran@gmail.com)',
      reporterName: 'Trần Hoàng Nam',
      reporterEmail: 'hoangnam.tran@gmail.com',
      reporterPhone: '0918 882 199',
      createdAt: '2026-10-15T12:00:00.000Z',
      status: 'pending'
    },
    {
      id: 'REP-1729011900002',
      propertyId: 'BDS-002',
      propertyTitle: 'Nhà Mặt Phố Trần Duy Hưng Cầu Giấy 8 Tầng Thang Máy',
      reason: 'already_sold',
      description: 'Tôi đến tận nơi hỏi bảo vệ thì tòa nhà này đã có người thuê từ tháng trước, chủ nhà đã sang tên hợp đồng nhưng tin vẫn để trên web.',
      contact: '0987 654 321',
      reporterName: 'Lê Thu Trang',
      reporterEmail: 'trang.le@vinahouse.vn',
      reporterPhone: '0987 654 321',
      createdAt: '2026-10-15T08:00:00.000Z',
      status: 'verified',
      adminNote: 'Đã xác minh qua điện thoại với chủ tòa nhà, hiện đang chuẩn bị ký gia hạn.'
    },
    {
      id: 'REP-1729009800003',
      propertyId: 'BDS-006',
      propertyTitle: 'Cho thuê Shophouse chân đế Vinhomes Ocean Park',
      reason: 'fake_images',
      description: 'Hình ảnh đăng là căn góc phân khu Sapphire nhưng thực tế chào thuê là căn thường ở phân khu khác, thông tin sai lệch.',
      contact: 'baopq@gmail.com',
      reporterName: 'Phạm Quốc Bảo',
      reporterEmail: 'baopq@gmail.com',
      reporterPhone: '0903 112 233',
      createdAt: '2026-10-14T10:00:00.000Z',
      status: 'delisted',
      adminNote: 'Đã yêu cầu môi giới gỡ bỏ hoặc cung cấp ảnh thật căn hộ.',
      resolvedAt: '2026-10-14T16:00:00.000Z'
    }
  ]);

  // 13. System Email Logs State (Outbox Lịch sử gửi mail)
  const [emailLogs, setEmailLogs] = useState(() => (Array.isArray(initialData?.bds_email_logs) ? initialData.bds_email_logs : []));

  // 14. Toast Notifications
  const [toast, setToast] = useState(null);

  // Helper show Toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 9. Modals State
  const [activeModal, setActiveModal] = useState(null); 
  // 'post-listing', 'mortgage-calc', 'compare', 'pricing-vip', 'wallet-deposit', 'listing-detail'
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(INITIAL_PROPERTIES[0]);
  const [selectedPropertyForVip, setSelectedPropertyForVip] = useState(null);
  const [preselectedListingType, setPreselectedListingType] = useState('normal');

  // Đồng bộ cookie session cho SSR
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const val = currentUser?.id || 'guest';
      document.cookie = `bds_session_user=${encodeURIComponent(val)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [currentUser]);

  // Đồng bộ số dư và mốc hết hạn Ví Khuyến Mãi của currentUser từ LocalStorage sau khi Hydration ở Client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uid = currentUser?.id || 'guest';
    try {
      const cachedBonus = localStorage.getItem(`bds_user_bonus_${uid}`);
      let userUpdates = {};
      let effectiveBonus = Number(currentUser?.bonusWalletBalance) || 0;
      if (cachedBonus !== null && !isNaN(Number(cachedBonus))) {
        const numBonus = Number(cachedBonus);
        if (numBonus !== effectiveBonus) {
          userUpdates.bonusWalletBalance = numBonus;
          effectiveBonus = numBonus;
        }
      }

      // Tự động kiểm tra và chuyển mốc hết hạn sang ngày gần nhất còn hiệu lực (FIFO date progression)
      if (effectiveBonus > 0) {
        const freshEarliest = getEarliestExpiringBonus({
          ...currentUser,
          bonusWalletBalance: effectiveBonus
        }, systemConfig);
        if (freshEarliest) {
          const currentExp = currentUser?.earliestExpiringBonus;
          if (!currentExp || currentExp.expiresAt !== freshEarliest.expiresAt || currentExp.amount !== freshEarliest.amount) {
            userUpdates.earliestExpiringBonus = freshEarliest;
            userUpdates.bonusExpiresAt = freshEarliest.expiresAt;
          }
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        setCurrentUser(prev => {
          let hasDiff = false;
          for (const k in userUpdates) {
            if (prev?.[k] !== userUpdates[k]) {
              hasDiff = true;
              break;
            }
          }
          return hasDiff ? { ...prev, ...userUpdates } : prev;
        });
      }
    } catch (e) {}

    const handleBonusWalletEvent = (e) => {
      if (e.detail?.bonusWalletBalance !== undefined && e.detail?.userId === uid) {
        setCurrentUser(prev => ({ 
          ...prev, 
          bonusWalletBalance: Number(e.detail.bonusWalletBalance),
          earliestExpiringBonus: e.detail.earliestExpiringBonus || prev.earliestExpiringBonus,
          bonusExpiresAt: e.detail.earliestExpiringBonus?.expiresAt || prev.bonusExpiresAt
        }));
      }
    };
    window.addEventListener('bds_bonus_wallet_updated', handleBonusWalletEvent);
    return () => window.removeEventListener('bds_bonus_wallet_updated', handleBonusWalletEvent);
  }, [currentUser?.id, systemConfig?.bonusExpiryDays]);

  // Tải dữ liệu mới nhất trực tiếp từ Supabase qua SDK (Central Fetcher)
  const fetchLatestDataFromSupabase = useCallback(async (isSilent = true) => {
    try {
      const db = await fetchFullSupabaseDb();
      if (db) {
        if (Array.isArray(db.bds_properties) && db.bds_properties.length > 0) {
          const validProps = db.bds_properties.filter(p => !p.city || p.city === 'Đà Nẵng' || p.city.includes('Đà Nẵng') || p.city === 'Quảng Nam' || p.city.includes('Quảng Nam'));
          setProperties(validProps.map(normalizePropertyExpiration));
        }
        if (Array.isArray(db.bds_users_list) && db.bds_users_list.length > 0) {
          setUsersList(db.bds_users_list);
        }
        if (Array.isArray(db.bds_transactions) && db.bds_transactions.length > 0) {
          setTransactions(db.bds_transactions);
        }
        if (db.bds_payment_config) {
          setPaymentConfig(db.bds_payment_config);
        }
        if (db.bds_header_config) {
          setHeaderConfig(prev => ({ ...prev, ...db.bds_header_config }));
        }
        if (db.bds_footer_config) {
          setFooterConfig(prev => ({ ...prev, ...db.bds_footer_config }));
        }
        if (db.bds_system_config) {
          setSystemConfig(prev => ({
            ...prev,
            ...db.bds_system_config,
            discount30DaysPercent: typeof db.bds_system_config.discount30DaysPercent === 'number'
              ? db.bds_system_config.discount30DaysPercent
              : (prev.discount30DaysPercent ?? 25)
          }));
        }
        if (Array.isArray(db.bds_nav_menu) && db.bds_nav_menu.length > 0) {
          const hasNewCategories = db.bds_nav_menu.some(m => m.children?.some(c => c.path?.includes('chung-cu-mini')));
          const baseMenu = hasNewCategories ? db.bds_nav_menu : INITIAL_NAV_MENU;
          const normalized = baseMenu.map(item => {
            const isSale = item.path?.includes('nha-dat-ban') || item.id === 'menu-sale' || item.title?.toLowerCase().includes('bán');
            const isRent = item.path?.includes('cho-thue') || item.id === 'menu-rent' || item.title?.toLowerCase().includes('thuê');
            if ((isSale || isRent) && Array.isArray(item.children)) {
              return {
                ...item,
                children: item.children.map(sub => {
                  const rawTitle = sub.title || '';
                  if (isSale && !rawTitle.toLowerCase().startsWith('bán')) {
                    return { ...sub, title: `Bán ${rawTitle}` };
                  }
                  if (isRent && !rawTitle.toLowerCase().startsWith('cho thuê')) {
                    return { ...sub, title: `Cho Thuê ${rawTitle}` };
                  }
                  return sub;
                })
              };
            }
            return item;
          });
          setNavMenuItems(normalized);
        }

        if (Array.isArray(db.bds_vip_packages) && db.bds_vip_packages.length > 0) {
          setVipPackages(db.bds_vip_packages.map(normalizeVipPackage));
        }
        if (Array.isArray(db.bds_membership_packages)) {
          const normalPkg = (db.bds_vip_packages || vipPackages || []).find(p => p.id === 'normal');
          const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 0));
          setMembershipPackages(db.bds_membership_packages.map(pkg => ({
            ...pkg,
            vouchersPerCycle: {
              ...pkg.vouchersPerCycle,
              normalPublishDiscount: (!pkg.vouchersPerCycle?.normalPublishDiscount || pkg.vouchersPerCycle?.normalPublishDiscount === 35000)
                ? defaultNormalPrice
                : Number(pkg.vouchersPerCycle?.normalPublishDiscount)
            },
            allowScheduledPublishing: typeof pkg.allowScheduledPublishing === 'boolean'
              ? pkg.allowScheduledPublishing
              : (pkg.id === 'member-basic' ? false : true),
            allowFutureStartDate: typeof pkg.allowFutureStartDate === 'boolean'
              ? pkg.allowFutureStartDate
              : (pkg.id === 'member-basic' ? false : true)
          })));
        }
        if (typeof db.bds_bump_service_price === 'number') {
          setBumpServicePrice(db.bds_bump_service_price);
        } else if (Array.isArray(db.bds_vip_packages)) {
          const normalPkg = db.bds_vip_packages.find(p => p.id === 'normal');
          if (typeof normalPkg?.bumpPrice === 'number') {
            setBumpServicePrice(normalPkg.bumpPrice);
          }
        }
        if (db.bds_single_config) {
          setSingleConfig(prev => ({ ...prev, ...db.bds_single_config }));
        }
        if (db.bds_email_config) {
          setEmailConfig(prev => ({ ...prev, ...db.bds_email_config }));
        }
        if (Array.isArray(db.bds_reported_listings)) {
          setListingReports(db.bds_reported_listings);
        }
        if (Array.isArray(db.bds_email_logs)) {
          setEmailLogs(db.bds_email_logs);
        }
        if (Array.isArray(db.bds_appointments)) {
          setAppointmentsList(db.bds_appointments);
        }
        if (Array.isArray(db.bds_notifications)) {
          setInAppNotifications(db.bds_notifications);
        }
        if (db.bds_rewards_config) {
          setRewardsConfig(prev => {
            const merged = {
              ...prev,
              ...db.bds_rewards_config,
              missions: {
                ...(prev?.missions || {}),
                ...(db.bds_rewards_config.missions || {})
              }
            };
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('bds_rewards_config', JSON.stringify(merged));
              } catch (e) {}
            }
            return merged;
          });
        }
        if (!isSilent) {
          showToast('Đã tải và đồng bộ dữ liệu mới nhất từ Supabase Cloud!', 'success');
        }
        return true;
      }
    } catch (err) {
      console.warn('Lỗi fetchLatestDataFromSupabase:', err);
      if (!isSilent) {
        showToast('Không thể kết nối tải dữ liệu từ Supabase', 'error');
      }
    }
    return false;
  }, [showToast]);

  // 1. One-time client rehydration from Supabase Client SDK
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined') {
      const STALE_SERVER_KEYS = [
        'bds_users_list',
        'bds_properties',
        'bds_vip_packages',
        'bds_bump_service_price',
        'bds_membership_packages',
        'bds_transactions',
        'bds_nav_menu',
        'bds_header_config',
        'bds_payment_config',
        'bds_system_config',
        'bds_single_config',
        'bds_email_config',
        'bds_reported_listings',
        'bds_email_logs'
      ];
      STALE_SERVER_KEYS.forEach(k => {
        try { window.localStorage.removeItem(k); } catch (e) {}
      });
    }

    // Ngay khi mount ở client, kích hoạt hydrated ngay vì đã có dữ liệu SSR đầy đủ
    if (isMounted) setIsHydrated(true);

    // Nếu người dùng đã đăng nhập (Thành viên / Môi giới / Quản trị) hoặc đang truy cập trang /admin, tự động kéo dữ liệu đồng bộ
    if ((currentUser && currentUser.role !== 'guest' && currentUser.id !== 'guest') || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'))) {
      fetchLatestDataFromSupabase(true);
    } else if (!initialData || !initialData.bds_properties || initialData.bds_properties.length === 0) {
      fetchLatestDataFromSupabase(true);
    }

    return () => { isMounted = false; };
  }, [fetchLatestDataFromSupabase, initialData]);

  // 2. Window Focus / Tab Switch Auto-Fetch (Tự động kéo dữ liệu mới khi chuyển tab về web)
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchLatestDataFromSupabase(true);
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [fetchLatestDataFromSupabase]);

  // 3. Supabase Realtime Subscription (Lắng nghe tức thì khi có thay đổi trên Database Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    let debounceTimer = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchLatestDataFromSupabase(true);
      }, 1500);
    };

    const channel = supabase
      .channel('realestate-realtime-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, debouncedFetch)
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchLatestDataFromSupabase]);

  // Stable refs for interval background processors to completely eliminate infinite re-render loops (React Error #185)
  const vipPackagesRef = useRef(vipPackages);
  vipPackagesRef.current = vipPackages;
  const usersListRef = useRef(usersList);
  usersListRef.current = usersList;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const membershipPackagesRef = useRef(membershipPackages);
  membershipPackagesRef.current = membershipPackages;

  // Background Auto-Approval Processor for Countdown Queues (VIP Vàng 15 phút, VIP Bạc 30 phút)
  useEffect(() => {
    const processAutoApprovals = () => {
      const now = Date.now();
      setProperties(prevList => {
        let hasChanges = false;
        const updated = prevList.map(prop => {
          if (prop.status === 'pending' && prop.autoApproveAt) {
            const approveTime = new Date(prop.autoApproveAt).getTime();
            if (now >= approveTime) {
              hasChanges = true;
              const isScheduled = Boolean(prop.isScheduledPublish || prop.scheduledPublishAt || prop.approvalType === 'scheduled_golden_hour');
              const tierName = prop.vipPackageId === 'vip-diamond'
                ? 'VIP Kim Cương'
                : (prop.vipPackageId === 'vip-gold' 
                    ? 'VIP Vàng' 
                    : (prop.vipPackageId === 'vip-silver' 
                        ? 'VIP Bạc' 
                        : 'Tin Thường'));
              const days = Number(prop.listingDays) || 15;
              const nowIso = new Date(now).toISOString();
              const autoPublishNote = isScheduled
                ? `Đã tự động xuất bản đúng Khung Giờ Vàng ${prop.scheduleTime || ''} (${new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${tierName})`
                : (prop.approvalNote || `Tự động xuất bản theo Hàng đợi tiêu chuẩn FIFO (${tierName})`);

              const updatedProp = {
                ...prop,
                status: 'active',
                approvedAt: nowIso,
                publishedAt: nowIso,
                expiresAt: new Date(now + days * 86400 * 1000).toISOString(),
                autoApproved: true,
                isScheduledPublish: false,
                approvalType: isScheduled ? 'scheduled_published' : (prop.approvalType || 'fifo_auto_published'),
                approvalNote: autoPublishNote
              };

              upsertSupabaseProperty(updatedProp).catch(console.warn);
              return updatedProp;
            }
          }
          return prop;
        });

        return hasChanges ? updated : prevList;
      });
    };

    processAutoApprovals();
    const autoApproveTimer = setInterval(processAutoApprovals, 3000);
    return () => clearInterval(autoApproveTimer);
  }, []);

  // Background Listing Expiration & Auto-Renewal Processor
  useEffect(() => {
    const processExpirations = () => {
      const now = Date.now();
      setProperties(prevList => {
        let hasChanges = false;
        const updated = prevList.map(prop => {
          if (prop.status === 'active' && prop.expiresAt) {
            const expTime = new Date(prop.expiresAt).getTime();
            if (now >= expTime) {
              hasChanges = true;

              // Kiểm tra xem có cấu hình Tự Động Gia Hạn (Auto-Renew) và ví tác giả đủ tiền không
              if (prop.autoRenew && prop.author && !prop.author.isGuest) {
                const pkg = (vipPackagesRef.current || []).find(v => v.id === prop.vipPackageId) || { pricePerDay: 5000 };
                const days = Number(prop.listingDays) || 15;
                const cost = (pkg.rates?.[days] || pkg.pricePerDay || 5000) * days;
                const authorUser = (usersListRef.current || []).find(u => u.id === prop.author.id);

                if (authorUser && authorUser.walletBalance >= cost) {
                  // Trừ ví người đăng tự động
                  const newBal = authorUser.walletBalance - cost;
                  const updatedAuthorUser = { ...authorUser, walletBalance: newBal };
                  setUsersList(uList => uList.map(u => u.id === authorUser.id ? updatedAuthorUser : u));
                  if (currentUserRef.current?.id === authorUser.id) {
                    setCurrentUser(updatedAuthorUser);
                  }

                  const newTxn = {
                    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                    userId: authorUser.id,
                    userName: authorUser.name,
                    type: 'auto_renew_vip',
                    title: `Tự động gia hạn tin ${prop.id} (${days} ngày)`,
                    amount: -cost,
                    balanceAfter: newBal,
                    status: 'success',
                    createdAt: new Date().toISOString(),
                    paymentMethod: 'Ví tài khoản'
                  };
                  setTransactions(txns => [newTxn, ...txns]);

                  return {
                    ...prop,
                    status: 'active',
                    expiresAt: new Date(now + days * 86400 * 1000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    renewCount: (prop.renewCount || 0) + 1,
                    lastRenewedAt: new Date().toISOString()
                  };
                }
              }

              // QUY TẮC ĐẶC QUYỀN VIP:
              // Nếu là gói VIP (VIP Kim Cương, VIP Vàng, VIP Bạc):
              // Khi hết thời hạn VIP thì hạ thành Tin Thường và được cộng thêm 60 ngày từ ngày hết VIP!
              if (['vip-diamond', 'vip-gold', 'vip-silver'].includes(prop.vipPackageId)) {
                const vipExpTime = expTime; // Thời điểm mốc hết hạn VIP
                const newNormalExpiresAt = new Date(vipExpTime + 60 * 86400 * 1000).toISOString();

                if (currentUserRef.current && currentUserRef.current.id === prop.author?.id) {
                  showToast(`ℹ️ Tin đăng ${prop.id} đã hoàn tất thời hạn VIP và được tự động chuyển thành Tin Thường + cộng thêm 60 ngày hiển thị miễn phí!`, 'info');
                }

                return {
                  ...prop,
                  vipPackageId: 'normal',
                  downgradedFromVip: prop.vipPackageId,
                  vipExpiredAt: prop.expiresAt,
                  listingDays: 60,
                  expiresAt: newNormalExpiresAt,
                  status: 'active',
                  isFeatured: false,
                  hasDualListing: false,
                  updatedAt: new Date().toISOString(),
                  downgradedAt: new Date().toISOString()
                };
              }

              // Chuyển sang trạng thái hết hạn (cho Tin Thường hoặc tin đã hết 60 ngày cộng thêm)
              return {
                ...prop,
                status: 'expired',
                updatedAt: new Date().toISOString(),
                expiredAt: new Date().toISOString()
              };
            }
          }
          return prop;
        });

        return hasChanges ? updated : prevList;
      });
    };

    processExpirations();
    const expireTimer = setInterval(processExpirations, 5000);
    return () => clearInterval(expireTimer);
  }, [showToast]);

  // Bộ xử lý tự động quét & dọn dẹp Database ngầm khi bật autoCleanupEnabled
  useEffect(() => {
    if (!isHydrated) return;
    if (systemConfig?.autoCleanupEnabled === false) return;

    const runAutoCleanupCheck = () => {
      const lastCheck = typeof window !== 'undefined' ? localStorage.getItem('bds_last_auto_cleanup') : null;
      const now = Date.now();
      // Quét ngầm tối đa 1 lần mỗi 30 phút để tối ưu hiệu năng
      if (!lastCheck || (now - Number(lastCheck)) > 30 * 60 * 1000) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('bds_last_auto_cleanup', String(now));
        }
        runDatabaseCleanup(systemConfig, true);
      }
    };

    runAutoCleanupCheck();
    const cleanupInterval = setInterval(runAutoCleanupCheck, 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [isHydrated, systemConfig?.autoCleanupEnabled, systemConfig?.expiredRetentionDays, systemConfig?.expiredCleanupAction]);

  // Kiểm tra gói hội viên có còn hiệu lực không (Active & Chưa hết hạn)
  const isMembershipActive = (user = currentUser) => {
    if (!user || user.id === 'guest') return false;
    if (!user.membership || !user.membership.packageId || user.membership.packageId === 'none') return false;
    if (user.membership.status === 'expired') return false;
    if (user.membership.expiresAt && new Date(user.membership.expiresAt).getTime() <= Date.now()) return false;
    return true;
  };

  // Background Membership Expiration & Voucher Revocation Processor (Phương án 1)
  useEffect(() => {
    const processMembershipExpirations = () => {
      const now = Date.now();

      setUsersList(prevUsers => {
        let usersChanged = false;
        const updatedUsers = prevUsers.map(user => {
          if (!user || !user.membership || !user.membership.packageId || user.membership.packageId === 'none') {
            return user;
          }

          const expTime = user.membership.expiresAt ? new Date(user.membership.expiresAt).getTime() : 0;
          const isExpired = user.membership.status === 'expired' || (expTime > 0 && now >= expTime);

          if (isExpired) {
            const hasVouchers = (user.vouchers?.normalPublish || 0) > 0 || 
                                (user.vouchers?.normalBump || 0) > 0 || 
                                (user.vouchers?.vipPublish || 0) > 0;
            const needsStatusUpdate = user.membership.status !== 'expired';

            // Nếu chưa được đánh dấu expired hoặc vẫn còn voucher chưa thu hồi
            if (needsStatusUpdate || hasVouchers) {
              // 1. Kiểm tra nếu BẬT tự động gia hạn (isAutoRenew)
              if (user.membership.isAutoRenew && !user.isGuest) {
                const pkg = (membershipPackagesRef.current || []).find(p => p.id === user.membership.packageId);
                const billingMonths = user.membership.billingMonths || 1;
                const cycle = pkg?.billingCycles?.find(c => c.months === billingMonths) || pkg?.billingCycles?.[0];
                const cost = cycle?.price || pkg?.monthlyPrice || 0;

                if (pkg && cost > 0 && (user.walletBalance || 0) >= cost) {
                  usersChanged = true;
                  const newBal = (user.walletBalance || 0) - cost;
                  const durationDays = cycle?.duration_days || cycle?.durationDays || (billingMonths * 30);
                  const newExpires = new Date(now + durationDays * 86400 * 1000).toISOString();

                  const newTxn = {
                    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                    userId: user.id,
                    userName: user.name,
                    type: 'auto_renew_membership',
                    title: `Tự động gia hạn ${pkg.name} (${billingMonths} tháng) - Cấp mới kho voucher 30 ngày`,
                    amount: -cost,
                    balanceAfter: newBal,
                    status: 'success',
                    createdAt: new Date().toISOString(),
                    paymentMethod: 'Ví tài khoản'
                  };
                  setTransactions(txns => [newTxn, ...txns]);

                  const updatedUser = {
                    ...user,
                    walletBalance: newBal,
                    membership: {
                      ...user.membership,
                      status: 'active',
                      expiresAt: newExpires,
                      durationDays,
                      lastRenewedAt: new Date().toISOString()
                    },
                    vouchers: {
                      normalPublish: pkg.vouchersPerCycle?.normalPublishVouchers || 0,
                      normalBump: pkg.vouchersPerCycle?.normalBumpVouchers || 0,
                      vipPublish: pkg.vouchersPerCycle?.vipVouchers || 0
                    }
                  };

                  upsertSupabaseProfile(updatedUser);
                  return updatedUser;
                }
              }

              // 2. Không tự động gia hạn hoặc không đủ tiền ví: Chuyển sang 'expired' & THU HỒI TOÀN BỘ VOUCHER VỀ 0
              usersChanged = true;
              const updatedUser = {
                ...user,
                membership: {
                  ...user.membership,
                  status: 'expired',
                  expiredAt: user.membership.expiredAt || new Date().toISOString()
                },
                vouchers: {
                  normalPublish: 0,
                  normalBump: 0,
                  vipPublish: 0
                }
              };

              upsertSupabaseProfile(updatedUser);
              return updatedUser;
            }
          } else if (user.membership.status === 'active') {
            // Chu kỳ cấp mới voucher định kỳ mỗi 30 ngày (Hình thức 1)
            const nextRefreshTime = user.membership.nextVoucherRefreshAt 
              ? new Date(user.membership.nextVoucherRefreshAt).getTime()
              : 0;

            if (nextRefreshTime > 0 && now >= nextRefreshTime && now < expTime) {
              usersChanged = true;
              const pkg = (membershipPackagesRef.current || []).find(p => p.id === user.membership.packageId);
              const normalPub = pkg?.vouchersPerCycle?.normalPublishVouchers || 0;
              const normalBump = pkg?.vouchersPerCycle?.normalBumpVouchers || 0;
              const vipPub = pkg?.vouchersPerCycle?.vipVouchers || 0;

              const nextNextRefresh = new Date(Math.min(now + 30 * 86400 * 1000, expTime)).toISOString();

              const updatedUser = {
                ...user,
                membership: {
                  ...user.membership,
                  lastVoucherRefreshedAt: new Date().toISOString(),
                  nextVoucherRefreshAt: nextNextRefresh,
                  currentCycleIndex: (user.membership.currentCycleIndex || 1) + 1
                },
                // Reset kho voucher cũ và cấp mới cho chu kỳ 30 ngày tiếp theo (Hình thức 1)
                vouchers: {
                  normalPublish: normalPub,
                  normalBump: normalBump,
                  vipPublish: vipPub
                }
              };

              upsertSupabaseProfile(updatedUser);
              return updatedUser;
            }
          }
          return user;
        });

        if (usersChanged) {
          persistSettingToSupabase('bds_users_list', updatedUsers);
        }
        return usersChanged ? updatedUsers : prevUsers;
      });

      // Đồng bộ currentUser nếu đang đăng nhập
      setCurrentUser(curr => {
        if (!curr || curr.id === 'guest' || !curr.membership || !curr.membership.packageId || curr.membership.packageId === 'none') {
          return curr;
        }
        const expTime = curr.membership.expiresAt ? new Date(curr.membership.expiresAt).getTime() : 0;
        const isExpired = curr.membership.status === 'expired' || (expTime > 0 && now >= expTime);

        if (isExpired) {
          const hasVouchers = (curr.vouchers?.normalPublish || 0) > 0 || 
                              (curr.vouchers?.normalBump || 0) > 0 || 
                              (curr.vouchers?.vipPublish || 0) > 0;
          const needsStatusUpdate = curr.membership.status !== 'expired';

          if (needsStatusUpdate || hasVouchers) {
            if (!curr.membership.isAutoRenew) {
              return {
                ...curr,
                membership: {
                  ...curr.membership,
                  status: 'expired',
                  expiredAt: curr.membership.expiredAt || new Date().toISOString()
                },
                vouchers: {
                  normalPublish: 0,
                  normalBump: 0,
                  vipPublish: 0
                }
              };
            }
          }
        } else if (curr.membership.status === 'active') {
          // Chu kỳ cấp mới voucher 30 ngày (Hình thức 1) cho currentUser
          const nextRefreshTime = curr.membership.nextVoucherRefreshAt 
            ? new Date(curr.membership.nextVoucherRefreshAt).getTime()
            : 0;

          if (nextRefreshTime > 0 && now >= nextRefreshTime && now < expTime) {
            const pkg = (membershipPackagesRef.current || []).find(p => p.id === curr.membership.packageId);
            const normalPub = pkg?.vouchersPerCycle?.normalPublishVouchers || 0;
            const normalBump = pkg?.vouchersPerCycle?.normalBumpVouchers || 0;
            const vipPub = pkg?.vouchersPerCycle?.vipVouchers || 0;
            const nextNextRefresh = new Date(Math.min(now + 30 * 86400 * 1000, expTime)).toISOString();

            showToast(`Kho voucher định kỳ 30 ngày của ${curr.membership.packageName} đã được cấp mới thành công!`, 'success');

            return {
              ...curr,
              membership: {
                ...curr.membership,
                lastVoucherRefreshedAt: new Date().toISOString(),
                nextVoucherRefreshAt: nextNextRefresh,
                currentCycleIndex: (curr.membership.currentCycleIndex || 1) + 1
              },
              vouchers: {
                normalPublish: normalPub,
                normalBump: normalBump,
                vipPublish: vipPub
              }
            };
          }
        }
        return curr;
      });
    };

    processMembershipExpirations();
    const membershipTimer = setInterval(processMembershipExpirations, 5000);
    return () => clearInterval(membershipTimer);
  }, [showToast]);

  // Switch role helper
  const switchUserRole = (roleKey) => {
    let target = usersList.find(u => u.role === roleKey);
    if (!target && roleKey === 'admin') {
      target = MOCK_USERS.find(u => u.role === 'admin') || {
        id: 'admin-01',
        name: 'Trần Vũ RB',
        email: 'tranvu.review@gmail.com',
        role: 'admin',
        roleName: 'Tổng Quản Trị Viên (CMS Admin)',
        walletBalance: 99999999,
        phone: '0898 246 607',
        avatar: '/avatars/ai-preset-2.jpg'
      };
      setUsersList(prev => [...prev, target]);
    }
    target = target || usersList[0];
    setCurrentUser(target);
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `bds_session_user=${encodeURIComponent(target.id)}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (e) {
      console.error(e);
    }
    showToast(`Đã chuyển sang vai trò: ${target.roleName}`, 'info');
  };

  // Navigate to Dedicated Single Property Page (bằng URL Permalink: /{slug}-pr{id})
  const navigateToProperty = (property) => {
    setSelectedPropertyDetail(property);
    setCurrentView('property-detail');
    const targetPath = getPropertyPermalink(property);
    const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

    if (isFileProtocol) {
      if (window.location.hash !== '#' + targetPath) {
        window.location.hash = '#' + targetPath;
      }
    } else {
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      if (window.location.hash) {
        window.history.replaceState({}, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Favorite
  const toggleFavorite = (propertyId) => {
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter(id => id !== propertyId));
      showToast('Đã xóa khỏi danh sách tin yêu thích', 'info');
    } else {
      setFavorites([...favorites, propertyId]);
      showToast('Đã lưu tin vào danh sách yêu thích!', 'success');
    }
  };

  // Bump listing (Đẩy tin) - Hỗ trợ Voucher Hội viên
  const bumpListing = (propertyId, useVoucher = false) => {
    const property = properties.find(p => p.id === propertyId);
    const isMemberActive = isMembershipActive(currentUser);
    const hasBumpVoucher = isMemberActive && (currentUser.vouchers?.normalBump || 0) > 0;

    let finalPrice = bumpServicePrice ?? BUMP_SERVICE_PRICE ?? 10000;
    let usedVoucher = false;

    if (useVoucher) {
      if (!isMemberActive) {
        showToast('Gói hội viên của bạn đã hết hạn hoặc không khả dụng. Toàn bộ voucher đi kèm đã hết hiệu lực theo quy chế sàn!', 'warning');
        return false;
      }
      if (hasBumpVoucher) {
        finalPrice = 0;
        usedVoucher = true;
      }
    }

    if (finalPrice > 0 && currentUser.walletBalance < finalPrice) {
      showToast(`Số dư ví không đủ ${finalPrice.toLocaleString('vi-VN')} đ để đẩy tin. Vui lòng nạp thêm!`, 'error');
      setActiveModal('wallet-deposit');
      return false;
    }

    // Deduct wallet if paid
    const newBalance = currentUser.walletBalance - finalPrice;
    const updatedVouchers = usedVoucher ? {
      ...currentUser.vouchers,
      normalBump: Math.max(0, (currentUser.vouchers?.normalBump || 0) - 1)
    } : currentUser.vouchers;

    const updatedUser = { 
      ...currentUser, 
      walletBalance: newBalance,
      vouchers: updatedVouchers
    };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Update Property
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          publishedAt: new Date().toISOString(),
          viewsCount: (p.viewsCount || 0) + 25
        };
      }
      return p;
    }));

    // Record Transaction
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'bump_listing',
      title: usedVoucher 
        ? `Đẩy tin bằng Voucher Hội viên (${propertyId})` 
        : `Đẩy tin lên đầu trang (${propertyId})`,
      amount: -finalPrice,
      balanceAfter: newBalance,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: usedVoucher ? 'Voucher Hội Viên' : 'Ví tài khoản'
    };
    setTransactions([newTxn, ...transactions]);

    if (usedVoucher) {
      showToast(`Đã dùng Voucher Hội viên! Đẩy tin ${propertyId} thành công (0 đ).`, 'success');
    } else {
      showToast(`Đẩy tin ${propertyId} thành công! Tin đã được đưa lên đầu trang.`, 'success');
    }
    return true;
  };

  // Upgrade VIP Package
  const upgradeVip = (propertyId, newVipPackageId, days = 7) => {
    const pkg = vipPackages.find(p => p.id === newVipPackageId);
    if (!pkg) return false;

    const totalCost = pkg.pricePerDay * days;
    if (currentUser.walletBalance < totalCost) {
      showToast(`Số dư ví không đủ ${totalCost.toLocaleString('vi-VN')} đ để nâng cấp gói ${pkg.name}. Vui lòng nạp thêm!`, 'error');
      setActiveModal('wallet-deposit');
      return false;
    }

    const newBalance = currentUser.walletBalance - totalCost;
    const updatedUser = { ...currentUser, walletBalance: newBalance };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const now = Date.now();
    const newExpiresAt = new Date(now + days * 86400 * 1000).toISOString();

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          status: 'active',
          vipPackageId: newVipPackageId,
          listingDays: days,
          expiresAt: newExpiresAt,
          downgradedFromVip: null,
          vipExpiredAt: null,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFeatured: newVipPackageId === 'vip-diamond',
          hasDualListing: false
        };
      }
      return p;
    }));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'purchase_vip',
      title: `Nâng cấp ${pkg.name} (${propertyId} - ${days} ngày)`,
      amount: -totalCost,
      balanceAfter: newBalance,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: 'Ví tài khoản'
    };
    setTransactions([newTxn, ...transactions]);

    showToast(`Nâng cấp tin ${propertyId} lên ${pkg.name} thành công!`, 'success');
    return true;
  };

  // Đếm số lượng tin đăng miễn phí/tin thường của user trong ngày hôm nay (00:00 -> hiện tại)
  const getTodayFreeListingCount = (userOrPhone) => {
    if (!userOrPhone) return 0;
    const userId = typeof userOrPhone === 'string' ? userOrPhone : userOrPhone?.id;
    const userPhone = typeof userOrPhone === 'object' ? userOrPhone?.phone : (String(userOrPhone).startsWith('0') ? String(userOrPhone) : null);
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return (properties || []).filter(p => {
      const matchesUser = (userId && p.author?.id === userId) ||
                          (userPhone && (p.author?.phone === userPhone || p.contactPhone === userPhone));
      if (!matchesUser) return false;

      // Đếm tin thường hoặc tin 0 đ đăng trong ngày hôm nay
      const isFreeOrNormal = p.vipPackageId === 'normal' || p.paidAmount === 0;
      if (!isFreeOrNormal) return false;

      const pDate = new Date(p.submittedAt || p.publishedAt || p.createdAt);
      return !isNaN(pDate.getTime()) && pDate >= startOfToday;
    }).length;
  };

  // Kiểm tra hạn mức đăng tin miễn phí trong ngày của user
  const checkDailyFreeListingQuota = (userOrPhone) => {
    const limit = typeof systemConfig?.dailyFreeListingLimit === 'number'
      ? systemConfig.dailyFreeListingLimit
      : ((vipPackages.find(p => p.id === 'normal')?.dailyFreeLimit) ?? 5);

    // limit <= 0 nghĩa là không giới hạn
    if (limit <= 0) {
      return { allowed: true, count: 0, limit: 0, remaining: 9999, unlimited: true };
    }

    // Admin không bị giới hạn
    if (currentUser?.role === 'admin') {
      return { allowed: true, count: 0, limit, remaining: limit, isAdmin: true, unlimited: false };
    }

    const count = getTodayFreeListingCount(userOrPhone || currentUser);
    const remaining = Math.max(0, limit - count);
    const allowed = count < limit;

    return { allowed, count, limit, remaining, unlimited: false };
  };

  // Add new Property from form (Hỗ trợ áp dụng Voucher Hội Viên, Khách Vãng Lai & Cổng Thanh Toán)
  const addProperty = (formData, vipPackageId, days, paymentMethod, appliedVoucher = null) => {
    const pkg = vipPackages.find(p => p.id === vipPackageId) || vipPackages[vipPackages.length - 1];
    const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
    
    // Tỷ lệ giá theo chu kỳ ngày
    const baseDailyRate = Number(pkg.pricePerDay) || 0;
    const activeRates = pkg.rates || {
      5: baseDailyRate,
      7: baseDailyRate,
      10: baseDailyRate,
      15: baseDailyRate,
      30: Math.round(baseDailyRate * 0.75),
      60: vipPackageId === 'normal' ? 0 : Math.round(baseDailyRate * 0.7)
    };
    const currentDailyRate = activeRates[days] ?? activeRates[15] ?? baseDailyRate;
    const listingCost = currentDailyRate * days;

    // Đẩy tin tự động khung giờ vàng (đồng bộ theo bumpServicePrice)
    const currentBumpPrice = Number(bumpServicePrice) || Number(BUMP_SERVICE_PRICE) || 10000;
    const autoBumpHours = Array.isArray(formData.autoBumpHours) ? formData.autoBumpHours : [];
    const bumpDays = Math.max(1, Math.min(Number(formData.autoBumpDays) || 1, Number(days) || 1));
    const autoBumpFee = autoBumpHours.length * currentBumpPrice * bumpDays;

    let totalCost = listingCost + autoBumpFee;
    let discountAmount = 0;
    let usedVoucherType = null;

    if (!isGuest && currentUser) {
      const isMemberActive = isMembershipActive(currentUser);
      if (appliedVoucher && !isMemberActive) {
        showToast('Gói hội viên của bạn đã hết hạn hoặc không khả dụng. Toàn bộ voucher đi kèm đã hết hiệu lực theo quy chế sàn!', 'warning');
        return null;
      }
      if (isMemberActive && appliedVoucher === 'normalPublish' && (currentUser.vouchers?.normalPublish || 0) > 0) {
        const userPkg = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
        const normalVoucherVal = Number(userPkg?.vouchersPerCycle?.normalPublishDiscount);
        discountAmount = (normalVoucherVal && normalVoucherVal > 0) ? Math.min(listingCost, normalVoucherVal) : listingCost;
        usedVoucherType = 'normalPublish';
      } else if (isMemberActive && appliedVoucher === 'vipPublish' && (currentUser.vouchers?.vipPublish || 0) > 0 && vipPackageId !== 'normal') {
        discountAmount = Math.min(listingCost, 400000);
        usedVoucherType = 'vipPublish';
      }
    }

    const finalCost = Math.max(0, totalCost - discountAmount);

    // Kiểm tra giới hạn đăng tin miễn phí trong ngày (nếu là Tin Thường hoặc tin 0 đ)
    const isFreeListing = (vipPackageId === 'normal' || currentDailyRate === 0) && autoBumpFee === 0 && finalCost === 0;
    if (isFreeListing && currentUser?.role !== 'admin') {
      const quota = checkDailyFreeListingQuota(currentUser || { phone: formData.contactPhone });
      if (!quota.allowed) {
        showToast(`Bạn đã đạt giới hạn đăng tin miễn phí trong ngày (tối đa ${quota.limit} tin/ngày). Vui lòng nâng cấp Tin VIP hoặc quay lại vào ngày mai!`, 'warning');
        return null;
      }
    }

    if (paymentMethod === 'wallet' && finalCost > 0) {
      if (isGuest) {
        showToast('Khách vãng lai vui lòng chọn thanh toán qua VietQR, MoMo hoặc VNPAY!', 'error');
        return null;
      }
      const totalAvailable = (Number(currentUser.walletBalance) || 0) + (Number(currentUser.bonusWalletBalance) || 0);
      if (totalAvailable < finalCost) {
        showToast('Số dư ví không đủ thanh toán gói tin đăng!', 'error');
        return null;
      }
    }

    let newBal = (!isGuest && currentUser) ? (currentUser.walletBalance || 0) : 0;
    let newBonusBal = (!isGuest && currentUser) ? (currentUser.bonusWalletBalance || 0) : 0;
    if (!isGuest && currentUser) {
      let updatedBatches = Array.isArray(currentUser.bonusBatches) ? [...currentUser.bonusBatches] : [];
      let updatedEarliest = currentUser.earliestExpiringBonus;

      if (paymentMethod === 'wallet' && finalCost > 0) {
        let remaining = finalCost;
        let bonusUsed = 0;
        if (newBonusBal >= remaining) {
          bonusUsed = remaining;
          newBonusBal -= remaining;
          remaining = 0;
        } else {
          bonusUsed = newBonusBal;
          remaining -= newBonusBal;
          newBonusBal = 0;
          newBal = Math.max(0, newBal - remaining);
        }

        // Khấu trừ theo nguyên tắc FIFO: gói hết hạn sớm nhất trừ trước
        if (bonusUsed > 0 && updatedBatches.length > 0) {
          const deductRes = deductBatchesFifo(updatedBatches, bonusUsed);
          updatedBatches = deductRes.updatedBatches;
        }

        // Tự động tính lại mốc sắp hết hạn gần nhất kế tiếp
        updatedEarliest = getEarliestExpiringBonus({
          ...currentUser,
          bonusWalletBalance: newBonusBal,
          bonusBatches: updatedBatches
        }, systemConfig);
      }

      const updatedVouchers = usedVoucherType ? {
        ...currentUser.vouchers,
        [usedVoucherType]: Math.max(0, (currentUser.vouchers?.[usedVoucherType] || 0) - 1)
      } : currentUser.vouchers;

      const updatedUser = { 
        ...currentUser, 
        walletBalance: newBal,
        bonusWalletBalance: newBonusBal,
        bonusBatches: updatedBatches,
        earliestExpiringBonus: updatedEarliest,
        bonusExpiresAt: updatedEarliest?.expiresAt || null,
        vouchers: updatedVouchers
      };
      setCurrentUser(updatedUser);
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`bds_user_bonus_${currentUser.id}`, String(newBonusBal));
          if (updatedEarliest) {
            localStorage.setItem(`bds_user_bonus_exp_${currentUser.id}`, JSON.stringify(updatedEarliest));
          } else {
            localStorage.removeItem(`bds_user_bonus_exp_${currentUser.id}`);
          }
          localStorage.setItem('bds_current_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent('bds_bonus_wallet_updated', {
            detail: { 
              userId: currentUser.id, 
              bonusWalletBalance: newBonusBal,
              earliestExpiringBonus: updatedEarliest
            }
          }));
        } catch (e) {}
      }
    }

    const methodLabels = {
      wallet: 'Ví tài khoản',
      vietqr: 'VietQR Ngân Hàng',
      momo: 'Ví MoMo',
      vnpay: 'Cổng VNPAY-QR'
    };
    const paymentMethodLabel = usedVoucherType && finalCost === 0 
      ? 'Voucher Hội Viên' 
      : (methodLabels[paymentMethod] || 'Trực tuyến');

    const contactPhone = formatPhoneNumber(String(formData.contactPhone || currentUser?.phone || '0901234567').trim());
    const contactName = String(formData.contactName || (!isGuest && currentUser?.name) || 'Khách vãng lai').trim();

    const authorObj = (!isGuest && currentUser) ? {
      id: currentUser.id,
      name: currentUser.name || contactName,
      title: currentUser.membership ? `${currentUser.membership.packageName}` : (currentUser.role === 'broker' ? 'Môi Giới' : 'Chính chủ'),
      phone: formatPhoneNumber(currentUser.phone || contactPhone),
      zalo: normalizePhone(currentUser.phone || contactPhone),
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isVerified: currentUser.isVerified || false,
      rating: 5.0,
      reviewCount: 1,
      isGuest: false,
      authorType: 'member'
    } : {
      id: `guest-${Date.now().toString().slice(-4)}`,
      name: contactName,
      title: 'Khách vãng lai (Chưa đăng nhập)',
      phone: contactPhone,
      zalo: normalizePhone(contactPhone),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
      isGuest: true,
      authorType: 'guest'
    };

    if (finalCost > 0 || usedVoucherType) {
      const isDirectPayment = paymentMethod !== 'wallet' && paymentMethod !== 'Ví tài khoản';
      const txnId = formData.orderId || `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTxn = {
        id: txnId,
        orderId: formData.orderId || null,
        userId: (!isGuest && currentUser) ? currentUser.id : authorObj.id,
        userName: (!isGuest && currentUser) ? currentUser.name : authorObj.name,
        type: 'purchase_vip',
        title: usedVoucherType 
          ? `Đăng tin ${pkg.name} (${days} ngày) - Áp dụng Voucher Hội viên giảm ${discountAmount.toLocaleString('vi-VN')} đ`
          : `Đăng tin mới ${pkg.name} (${days} ngày) qua ${paymentMethodLabel}`,
        amount: isDirectPayment ? finalCost : -finalCost,
        balanceAfter: (!isGuest && currentUser) ? newBal : 0,
        status: 'success',
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethodLabel,
        isDirectPayment: isDirectPayment
      };
      setTransactions([newTxn, ...transactions]);
    }

    // =========================================================================
    // Cơ Chế Thanh Toán Trước - Phê Duyệt Tự Động Theo Cấp Độ Tin Đăng:
    // 1. Khung Giờ Vàng (Hẹn Giờ Đăng Tin) / Ngày Bắt Đầu Tương Lai: Đưa vào hàng đợi với mốc autoApproveAt chính xác
    // 2. VIP Kim Cương, VIP Vàng, VIP Bạc: Duyệt Tức Thì tự động (0s - Active ngay)
    // 3. Tin Thường ('normal'): Duyệt Tự Động ngẫu nhiên (5 - 15 phút)
    // =========================================================================
    const todayIsoStr = new Date().toISOString().slice(0, 10);
    const isAdmin = currentUser?.role === 'admin';
    const isMemberActive = currentUser?.membership?.status === 'active' || (currentUser?.membership && !currentUser?.membership?.isExpired);
    const activeUserPkg = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
    const canUseFutureDate = isAdmin || (isMemberActive && Boolean(activeUserPkg?.allowFutureStartDate));

    let sanitizedStartDate = formData.startDate || todayIsoStr;
    if (!canUseFutureDate && sanitizedStartDate > todayIsoStr) {
      sanitizedStartDate = todayIsoStr;
    }

    const isFutureStartDate = Boolean(sanitizedStartDate > todayIsoStr);
    const isScheduledPublish = Boolean((formData.scheduleTime && formData.scheduleTime !== 'now') || isFutureStartDate);
    const tierConfig = paymentConfig?.approvalTiers?.[vipPackageId] || DEFAULT_APPROVAL_TIERS[vipPackageId] || DEFAULT_APPROVAL_TIERS['normal'];

    let initialStatus = 'pending';
    let autoApproveAt = null;
    let scheduledPublishAt = null;
    let queuePriority = 'standard_fifo';
    let queueRank = 4;
    let approvalType = 'standard_fifo';
    let approvalNote = '';

    const isVipTier = ['vip-diamond', 'vip-gold', 'vip-silver'].includes(vipPackageId);

    if (isScheduledPublish) {
      // 1. Tính toán mốc thời gian Khung Giờ Vàng & Ngày Bắt Đầu tương lai chính xác
      scheduledPublishAt = calculateScheduledPublishTimestamp(sanitizedStartDate, formData.scheduleTime);
      initialStatus = 'pending';
      autoApproveAt = scheduledPublishAt;
      queuePriority = 'scheduled_golden_hour';
      queueRank = 1;
      approvalType = 'scheduled_golden_hour';
      const targetTimeFormatted = scheduledPublishAt ? new Date(scheduledPublishAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : '';
      approvalNote = (formData.scheduleTime && formData.scheduleTime !== 'now')
        ? `Lịch hẹn Khung Giờ Vàng (${formData.scheduleTime}) ngày ${sanitizedStartDate}: Tự động xuất bản lúc ${targetTimeFormatted}`
        : `Lịch hẹn xuất bản ngày ${sanitizedStartDate}: Tự động xuất bản lúc ${targetTimeFormatted}`;
    } else if (isAdmin) {
      initialStatus = 'active';
      approvalType = 'admin_instant';
      approvalNote = 'Quản trị viên xuất bản trực tiếp';
    } else if (isVipTier && tierConfig?.mode !== 'countdown' && tierConfig?.mode !== 'manual') {
      // 1. Cả 3 gói VIP (Kim Cương, Vàng, Bạc): Duyệt Tức Thì tự động (Active ngay)
      initialStatus = 'active';
      approvalType = 'instant';
      approvalNote = `Đặc quyền ${pkg.name}: Duyệt Tức Thì tự động (Active ngay 0s)`;
    } else if (isVipTier && tierConfig?.mode === 'countdown') {
      // Tùy chỉnh Admin: Hẹn giờ duyệt cho VIP
      const delayMin = Number(tierConfig?.delayMinutes ?? 15);
      initialStatus = 'pending';
      approvalType = 'priority_countdown';
      queuePriority = `priority_${vipPackageId.replace('vip-', '')}`;
      queueRank = vipPackageId === 'vip-gold' ? 2 : 3;
      autoApproveAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
      approvalNote = `${pkg.name}: Ưu tiên sớm (Tự động duyệt sau ${delayMin} phút)`;
    } else if (vipPackageId === 'normal' && tierConfig?.mode === 'instant') {
      // Tin Thường nếu admin bật Duyệt tức thì
      initialStatus = 'active';
      approvalType = 'instant';
      approvalNote = 'Tin Thường: Duyệt Tức Thì tự động theo cấu hình Admin';
    } else {
      // 2. Tin Thường: Duyệt tự động ngẫu nhiên 5 - 15 phút (hoặc theo cấu hình Admin)
      let delayMin = 10;
      if (tierConfig?.mode === 'countdown' && tierConfig?.delayMinutes > 0) {
        delayMin = Number(tierConfig.delayMinutes);
        approvalNote = `Tin Thường: Hàng đợi duyệt tự động cố định (${delayMin} phút)`;
      } else {
        const min = Math.max(1, Number(tierConfig?.delayMinMinutes) || 5);
        const max = Math.max(min, Number(tierConfig?.delayMaxMinutes) || 15);
        delayMin = Math.floor(Math.random() * (max - min + 1)) + min;
        approvalNote = `Tin Thường: Hàng đợi duyệt tự động ngẫu nhiên ${min} - ${max} phút (Lần này: ~${delayMin} phút)`;
      }

      initialStatus = 'pending';
      approvalType = 'random_countdown';
      queuePriority = 'standard_fifo';
      queueRank = 4;
      autoApproveAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
    }

    const numDays = Number(days) || Number(formData.listingDays) || 15;
    const now = Date.now();
    const expiresAt = initialStatus === 'active' 
      ? new Date(now + numDays * 86400 * 1000).toISOString()
      : null;

    const cleanedTitle = (systemConfig?.autoFilterPhoneInContent !== false && formData.title)
      ? sanitizePhoneFromText(formData.title).text
      : (formData.title || '').trim();
    const cleanedDescription = (systemConfig?.autoFilterPhoneInContent !== false && formData.description)
      ? sanitizePhoneFromText(formData.description).text
      : (formData.description || '').trim();

    const newProp = {
      ...formData,
      id: `BDS-${String(properties.length + 1).padStart(3, '0')}`,
      title: cleanedTitle,
      description: cleanedDescription,
      slug: (cleanedTitle && createVietnameseSlug(cleanedTitle)) || `bds-${Date.now().toString().slice(-4)}`,
      vipPackageId: vipPackageId,
      status: initialStatus,
      publishedAt: initialStatus === 'active' ? new Date().toISOString() : null,
      listingDays: numDays,
      expiresAt: expiresAt,
      autoRenew: formData.autoRenew !== undefined ? Boolean(formData.autoRenew) : (vipPackageId === 'vip-diamond'),
      submittedAt: new Date().toISOString(),
      autoApproveAt: autoApproveAt,
      scheduledPublishAt: scheduledPublishAt,
      isScheduledPublish: isScheduledPublish,
      scheduleTime: formData.scheduleTime || 'now',
      startDate: sanitizedStartDate,
      queuePriority: queuePriority,
      queueRank: queueRank,
      approvalType: approvalType,
      approvalNote: approvalNote,
      viewsCount: 1,
      callsCount: 0,
      isFeatured: vipPackageId === 'vip-diamond',
      hasDualListing: false,
      paymentMethod: paymentMethodLabel,
      paidAmount: finalCost,
      autoBumpHours: autoBumpHours,
      autoBumpDays: bumpDays,
      autoBumpFee: autoBumpFee,
      paymentOrderId: formData.orderId || null,
      google_place_id: formData.google_place_id || formData.googlePlaceId || null,
      newAddress: formData.newAddress || null,
      isGuest: isGuest,
      is_verified: false,
      isVerified: false,
      author: authorObj
    };

    setProperties([newProp, ...properties]);
    upsertSupabaseProperty(newProp).catch(console.warn);

    if (initialStatus === 'active') {
      if (vipPackageId === 'vip-diamond') {
        showToast(`⚡ Thanh toán thành công! Tin VIP Kim Cương (${newProp.id}) được Duyệt Tức Thì và đang hiển thị ngay trên website.`, 'success');
      } else if (vipPackageId === 'vip-gold') {
        showToast(`🥇 Thanh toán thành công! Tin VIP Vàng (${newProp.id}) được Duyệt Tức Thì và đang hiển thị ngay trên website.`, 'success');
      } else if (vipPackageId === 'vip-silver') {
        showToast(`🥈 Thanh toán thành công! Tin VIP Bạc (${newProp.id}) được Duyệt Tức Thì và đang hiển thị ngay trên website.`, 'success');
      } else {
        showToast(`⚡ Xuất bản thành công! Tin (${newProp.id}) đang hiển thị trực tiếp trên sàn.`, 'success');
      }
    } else if (isScheduledPublish) {
      const scheduledTimeStr = new Date(scheduledPublishAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
      showToast(`⏰ Đã lên lịch thành công! Tin (${newProp.id}) sẽ tự động xuất bản đúng Khung Giờ Vàng lúc ${scheduledTimeStr}.`, 'success');
    } else {
      showToast(`📋 Đăng tin thành công! Tin ${pkg?.name || 'Tin Thường'} (${newProp.id}) đang trong hàng đợi phê duyệt (Tự động kích hoạt sau ít phút).`, 'info');
    }
    return newProp;
  };

  // Đăng ký hoặc Gia Hạn Gói Hội Viên (Membership Packages)
  const subscribeMembership = (packageId, billingMonths = 1, customDays = null) => {
    if (!currentUser || currentUser.id === 'guest' || !currentUser.email) {
      showToast('Vui lòng đăng nhập tài khoản để thực hiện giao dịch!', 'warning');
      setActiveModal('auth');
      return false;
    }

    const pkg = membershipPackages.find(p => p.id === packageId);
    if (!pkg) {
      showToast('Gói hội viên không tồn tại!', 'error');
      return false;
    }

    // Chặn đăng ký gói khác nếu gói hiện tại vẫn còn hạn sử dụng
    if (isMembershipActive(currentUser) && currentUser.membership?.packageId !== pkg.id) {
      showToast(`Bạn đang sử dụng "${currentUser.membership.packageName}" còn hạn đến ${new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}. Không thể đăng ký gói khác khi gói hiện tại chưa hết hạn!`, 'warning');
      return false;
    }

    const cycle = pkg.billingCycles.find(c => c.months === billingMonths) || pkg.billingCycles[0];
    const totalPrice = cycle.price;

    if (currentUser.walletBalance < totalPrice) {
      showToast(`Số dư ví (${currentUser.walletBalance.toLocaleString('vi-VN')} đ) không đủ ${totalPrice.toLocaleString('vi-VN')} đ để ${currentUser.membership?.packageId === pkg.id ? 'gia hạn' : 'đăng ký'} ${pkg.name}. Vui lòng nạp thêm tiền!`, 'warning');
      setActiveModal('wallet-deposit');
      return false;
    }

    const durationDays = customDays || cycle.duration_days || cycle.durationDays || (billingMonths * 30);
    const newBalance = currentUser.walletBalance - totalPrice;

    // Kiểm tra xem là Đăng ký mới hay Gia hạn gói đang dùng
    const isRenew = currentUser.membership && currentUser.membership.packageId === pkg.id;
    const baseTime = (isRenew && currentUser.membership.expiresAt && new Date(currentUser.membership.expiresAt).getTime() > Date.now())
      ? new Date(currentUser.membership.expiresAt).getTime()
      : Date.now();

    const expiresDate = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const normalPubCount = pkg.vouchersPerCycle.normalPublishVouchers;
    const normalBumpCount = pkg.vouchersPerCycle.normalBumpVouchers;
    const vipCount = pkg.vouchersPerCycle.vipVouchers || 0;

    // Chu kỳ cấp voucher 30 ngày định kỳ (Hình thức 1)
    const nextRefreshDate = new Date(Math.min(Date.now() + 30 * 24 * 60 * 60 * 1000, new Date(expiresDate).getTime())).toISOString();

    const updatedUser = {
      ...currentUser,
      walletBalance: newBalance,
      membership: {
        packageId: pkg.id,
        packageName: pkg.name,
        shortName: pkg.shortName,
        billingMonths,
        durationDays: (isRenew && currentUser.membership.durationDays ? currentUser.membership.durationDays + durationDays : durationDays),
        subscribedAt: isRenew ? (currentUser.membership.subscribedAt || new Date().toISOString()) : new Date().toISOString(),
        expiresAt: expiresDate,
        status: 'active',
        isAutoRenew: false, // Mặc định tắt tự động gia hạn (Auto-renew: OFF)
        badge: pkg.badge,
        badgeColor: pkg.badgeColor,
        lastVoucherRefreshedAt: new Date().toISOString(),
        nextVoucherRefreshAt: nextRefreshDate,
        voucherCycleMonths: billingMonths,
        currentCycleIndex: isRenew ? (currentUser.membership.currentCycleIndex || 1) : 1
      },
      vouchers: {
        normalPublish: normalPubCount,
        normalBump: normalBumpCount,
        vipPublish: vipCount
      }
    };

    setCurrentUser(updatedUser);
    const nextList = usersList.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsersList(nextList);

    // Đồng bộ lập tức lên Supabase Cloud Database (profiles & system_settings)
    upsertSupabaseProfile(updatedUser).catch(console.warn);
    persistSettingToSupabase('bds_users_list', nextList).catch(console.warn);

    // Record Transaction
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'purchase_membership',
      title: `${isRenew ? 'Gia hạn' : 'Đăng ký'} ${pkg.name} (${billingMonths} tháng • ${durationDays} ngày) - Nhận kho voucher 30 ngày`,
      amount: -totalPrice,
      balanceAfter: newBalance,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: 'Ví tài khoản'
    };
    setTransactions([newTxn, ...transactions]);

    showToast(`${isRenew ? 'Gia hạn thành công' : 'Đăng ký thành công'} ${pkg.name}! Đã cộng ${normalPubCount} voucher đăng tin và ${normalBumpCount} voucher đẩy tin. Hạn dùng đến: ${new Date(expiresDate).toLocaleDateString('vi-VN')}`, 'success');
    return true;
  };

  // Bật / Tắt Tự động gia hạn gói hội viên khi hết hạn (Auto-Renew Membership)
  const toggleMembershipAutoRenew = async (targetUserId = null, explicitValue = undefined) => {
    const targetId = targetUserId || currentUser?.id;
    if (!targetId || targetId === 'guest') {
      showToast('Vui lòng đăng nhập để thực hiện tính năng này!', 'warning');
      return false;
    }

    const targetUser = usersList.find(u => u.id === targetId) || (targetId === currentUser?.id ? currentUser : null);
    if (!targetUser) return false;

    if (!targetUser.membership || !targetUser.membership.packageId || targetUser.membership.packageId === 'none') {
      showToast('Bạn chưa đăng ký gói hội viên nào để bật tự động gia hạn!', 'warning');
      return false;
    }

    const currentAutoRenew = Boolean(targetUser.membership.isAutoRenew);
    const newAutoRenew = explicitValue !== undefined ? Boolean(explicitValue) : !currentAutoRenew;

    const updatedUser = {
      ...targetUser,
      membership: {
        ...targetUser.membership,
        isAutoRenew: newAutoRenew
      }
    };

    if (currentUser?.id === targetId) {
      setCurrentUser(updatedUser);
    }
    const nextList = usersList.map(u => u.id === targetId ? updatedUser : u);
    setUsersList(nextList);

    await upsertSupabaseProfile(updatedUser).catch(console.warn);
    await persistSettingToSupabase('bds_users_list', nextList).catch(console.warn);

    showToast(
      newAutoRenew
        ? 'Đã BẬT tự động gia hạn! Khi gói hết hạn, hệ thống sẽ tự động trừ ví để tiếp tục gia hạn quyền lợi.'
        : 'Đã TẮT tự động gia hạn gói hội viên.',
      'success'
    );
    return true;
  };

  const updateMembershipPackage = async (id, updatedFields) => {
    let updatedList;
    setMembershipPackages(prev => {
      updatedList = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      return updatedList;
    });
    await persistSettingToSupabase('bds_membership_packages', updatedList);
    showToast(`Đã cập nhật cấu hình gói hội viên!`, 'success');
  };

  const addMembershipPackage = async (newPkg) => {
    const pkgWithId = {
      ...newPkg,
      id: newPkg.id || `member-${Date.now()}`
    };
    let updatedList;
    setMembershipPackages(prev => {
      updatedList = [...prev, pkgWithId];
      return updatedList;
    });
    await persistSettingToSupabase('bds_membership_packages', updatedList);
    showToast(`Đã thêm gói hội viên "${pkgWithId.name}" thành công!`, 'success');
    return pkgWithId;
  };

  const deleteMembershipPackage = async (id) => {
    let deletedName = '';
    let updatedList;
    setMembershipPackages(prev => {
      if (prev.length <= 1) {
        showToast('Hệ thống cần tối thiểu 1 gói hội viên hoạt động!', 'error');
        return prev;
      }
      const target = prev.find(p => p.id === id);
      deletedName = target ? target.name : '';
      updatedList = prev.filter(p => p.id !== id);
      return updatedList;
    });
    if (updatedList) {
      await persistSettingToSupabase('bds_membership_packages', updatedList);
    }
    if (deletedName) {
      showToast(`Đã xóa gói hội viên "${deletedName}"!`, 'info');
    }
  };

  const resetMembershipPackages = async () => {
    setMembershipPackages(MEMBERSHIP_PACKAGES);
    await removeSettingFromSupabase('bds_membership_packages');
    showToast('Đã khôi phục các gói hội viên về mặc định ban đầu!', 'info');
  };

  // Cập nhật đơn giá chung cho 3 loại voucher và tự động đồng bộ sang tất cả các gói hội viên
  const updateCommonVoucherPrices = async (newPrices) => {
    const pubDiscount = Math.max(0, Number(newPrices.normalPublishDiscount) || 0);
    const bumpDiscount = Math.max(0, Number(newPrices.normalBumpDiscount) || 0);
    const vipDiscount = Math.max(0, Number(newPrices.vipDiscount) || 0);

    let updatedList;
    setMembershipPackages(prev => {
      updatedList = prev.map(pkg => {
        const updatedVouchers = {
          ...pkg.vouchersPerCycle,
          normalPublishDiscount: pubDiscount,
          normalBumpDiscount: bumpDiscount,
          vipDiscount: vipDiscount
        };
        const updatedFeatures = syncFeaturesWithVouchers(pkg.features, updatedVouchers, { vipPackages, bumpServicePrice });
        return {
          ...pkg,
          vouchersPerCycle: updatedVouchers,
          features: updatedFeatures
        };
      });
      return updatedList;
    });

    if (updatedList) {
      await persistSettingToSupabase('bds_membership_packages', updatedList);
    }
    showToast('Đã lưu & đồng bộ đơn giá chung 3 loại voucher thành công cho tất cả các gói hội viên!', 'success');
    return updatedList;
  };

  // Admin moderation: Approve
  const approveProperty = async (propertyId) => {
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    let approvedTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const days = Number(p.listingDays) || 15;
        approvedTarget = { 
          ...p, 
          status: 'active', 
          approvedAt: nowIso,
          updatedAt: nowIso,
          publishedAt: nowIso,
          expiresAt: new Date(now + days * 86400 * 1000).toISOString(),
          isScheduledPublish: false,
          scheduledPublishAt: null,
          autoApproved: false
        };
        return approvedTarget;
      }
      return p;
    }));
    if (approvedTarget) {
      await upsertSupabaseProperty(approvedTarget);
    }
    showToast(`Đã duyệt xuất bản tin ${propertyId}!`, 'success');
  };

  // Người dùng hoặc Quản trị viên kích hoạt xuất bản ngay lập tức một tin đang chờ / đang hẹn giờ
  const publishPropertyNow = useCallback(async (propertyId) => {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    let updatedTarget = null;

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId || p._id === propertyId) {
        const days = Number(p.listingDays) || 15;
        updatedTarget = {
          ...p,
          status: 'active',
          publishedAt: nowIso,
          approvedAt: nowIso,
          updatedAt: nowIso,
          expiresAt: new Date(nowMs + days * 86400 * 1000).toISOString(),
          isScheduledPublish: false,
          scheduledPublishAt: null,
          autoApproved: false,
          approvalType: 'manual_instant_published',
          approvalNote: `Người dùng đã chủ động Xuất Bản Ngay (${new Date(nowMs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
        };
        return updatedTarget;
      }
      return p;
    }));

    if (updatedTarget) {
      try {
        await upsertSupabaseProperty(updatedTarget);
      } catch (err) {
        console.warn('Lỗi đồng bộ Supabase khi xuất bản ngay:', err);
      }
      showToast(`⚡ Đã xuất bản tin ${propertyId} lên trang chủ thành công!`, 'success');
      return updatedTarget;
    }
    return null;
  }, [showToast]);

  // Nộp hồ sơ giấy tờ (Sổ đỏ 2 mặt) để xác thực tin đăng -> verification_status: 'pending'
  const submitPropertyVerification = useCallback(async (propertyId, verificationData) => {
    let updatedTarget = null;

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId || p._id === propertyId) {
        updatedTarget = {
          ...p,
          is_verified: false,
          isVerified: false,
          verification_status: 'pending',
          verificationStatus: 'pending',
          verificationDocuments: {
            frontImage: verificationData.frontImage,
            backImage: verificationData.backImage,
            certNumber: verificationData.certNumber || '',
            notes: verificationData.notes || '',
            submittedAt: verificationData.submittedAt || new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
        return updatedTarget;
      }
      return p;
    }));

    if (updatedTarget) {
      try {
        await upsertSupabaseProperty(updatedTarget);
        if (typeof window !== 'undefined') {
          fetch('/api/db-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bds_properties: properties.map(p => p.id === propertyId ? updatedTarget : p)
            })
          }).catch(err => console.warn('Lỗi db-sync khi gửi hồ sơ xác thực:', err));
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ Supabase khi gửi hồ sơ xác thực:', err);
      }

      showToast(`📄 Hồ sơ Sổ đỏ 2 mặt đã được gửi thành công! Trạng thái: Chờ Ban quản trị thẩm định.`, 'success');
      return updatedTarget;
    }
    return null;
  }, [properties, showToast]);

  // Xác thực tin đăng bất động sản (Cấp / Hủy / Từ chối huy hiệu "Tin xác thực")
  const verifyProperty = useCallback(async (propertyId, isVerified = true, rejectReason = '') => {
    let updatedTarget = null;
    const vStatus = isVerified ? 'verified' : (rejectReason ? 'rejected' : 'unverified');

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId || p._id === propertyId) {
        updatedTarget = {
          ...p,
          is_verified: Boolean(isVerified),
          isVerified: Boolean(isVerified),
          verification_status: vStatus,
          verificationStatus: vStatus,
          verificationRejectReason: rejectReason || null,
          verifiedAt: isVerified ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };
        return updatedTarget;
      }
      return p;
    }));

    if (updatedTarget) {
      try {
        await upsertSupabaseProperty(updatedTarget);
        if (typeof window !== 'undefined') {
          fetch('/api/db-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bds_properties: properties.map(p => p.id === propertyId ? updatedTarget : p)
            })
          }).catch(err => console.warn('Lỗi db-sync khi xác thực tin:', err));
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ Supabase khi xác thực tin:', err);
      }

      if (isVerified) {
        showToast(`✅ Đã phê duyệt xác thực tin "${updatedTarget.title || propertyId}"! Huy hiệu "Tin xác thực" đã được kích hoạt.`, 'success');
      } else if (rejectReason) {
        showToast(`Đã từ chối hồ sơ xác thực của tin ${propertyId}. Lý do: ${rejectReason}`, 'warning');
      } else {
        showToast(`Đã hủy trạng thái xác thực của tin ${propertyId}.`, 'info');
      }
      return updatedTarget;
    }
    return null;
  }, [properties, showToast]);

  // Admin moderation: Reject
  const rejectProperty = async (propertyId, reason = 'Vi phạm quy chế') => {
    let rejectedTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        rejectedTarget = { 
          ...p, 
          status: 'rejected', 
          rejectReason: reason,
          updatedAt: new Date().toISOString()
        };
        return rejectedTarget;
      }
      return p;
    }));
    if (rejectedTarget) {
      await upsertSupabaseProperty(rejectedTarget);
    }
    showToast(`Đã từ chối tin ${propertyId}: ${reason}`, 'warning');
  };

  // Chuyển bài viết vào Thùng rác (Trash / Soft Delete)
  const moveToTrash = (propertyId) => {
    let trashTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        trashTarget = {
          ...p,
          isDeleted: true,
          status: 'trash',
          previousStatus: p.status,
          deletedAt: new Date().toISOString()
        };
        return trashTarget;
      }
      return p;
    }));
    setFavorites(prev => prev.filter(id => id !== propertyId));
    if (trashTarget) {
      deleteSupabaseProperty(propertyId, true).catch(console.warn);
    }
    showToast(`Đã chuyển bài viết ${propertyId} vào Thùng rác! Có thể khôi phục trong tab Thùng rác.`, 'info');
    return true;
  };

  // Khôi phục bài viết từ Thùng rác (Restore)
  const restoreProperty = (propertyId) => {
    const now = Date.now();
    let restoredTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const isExp = p.expiresAt && new Date(p.expiresAt).getTime() <= now;
        const restoredStatus = isExp ? 'expired' : (p.previousStatus && p.previousStatus !== 'trash' ? p.previousStatus : 'active');
        restoredTarget = {
          ...p,
          isDeleted: false,
          deletedAt: null,
          status: restoredStatus,
          updatedAt: new Date().toISOString()
        };
        return restoredTarget;
      }
      return p;
    }));
    if (restoredTarget) {
      upsertSupabaseProperty(restoredTarget).catch(console.warn);
    }
    showToast(`Đã khôi phục bài đăng ${propertyId} thành công!`, 'success');
    return true;
  };

  // Xóa vĩnh viễn bài đăng khỏi hệ thống database
  const permanentDeleteProperty = (propertyId) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setFavorites(prev => prev.filter(id => id !== propertyId));
    deleteSupabaseProperty(propertyId, false).catch(console.warn);
    showToast(`Đã xóa vĩnh viễn bài đăng ${propertyId} khỏi cơ sở dữ liệu!`, 'warning');
    return true;
  };

  // Dọn sạch toàn bộ Thùng rác
  const emptyTrash = () => {
    const trashItems = properties.filter(p => p.isDeleted || p.status === 'trash');
    if (trashItems.length === 0) {
      showToast('Thùng rác hiện đang trống!', 'info');
      return 0;
    }
    setProperties(prev => prev.filter(p => !p.isDeleted && p.status !== 'trash'));
    trashItems.forEach(p => deleteSupabaseProperty(p.id, false).catch(console.warn));
    showToast(`Đã dọn sạch vĩnh viễn ${trashItems.length} bài viết trong Thùng rác!`, 'success');
    return trashItems.length;
  };

  // Delete property: mặc định chuyển vào thùng rác (nếu permanent = true thì xóa vĩnh viễn)
  const deleteProperty = (propertyId, permanent = false) => {
    if (permanent) {
      return permanentDeleteProperty(propertyId);
    }
    return moveToTrash(propertyId);
  };

  // Chuyển bài viết sang dữ liệu nhẹ (Archive / Optimize DB)
  const archivePropertyLight = (p) => {
    const safeThumbnail = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
    const truncatedDesc = (p.description || '').slice(0, 180) + '... [Dữ liệu đã nén lưu trữ tối ưu DB]';
    return {
      ...p,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      status: 'archived',
      images: [safeThumbnail],
      vrScenes: [],
      floorPlanImages: [],
      videoUrl: null,
      hasVR360: false,
      description: truncatedDesc
    };
  };

  // Chạy quy trình quét dọn dẹp và tối ưu hóa database
  const runDatabaseCleanup = (customConfig = null, isSilent = false) => {
    const cfg = customConfig || systemConfig || DEFAULT_SYSTEM_CONFIG;
    const retentionDays = Number(cfg.expiredRetentionDays) || 45;
    const action = cfg.expiredCleanupAction || 'archive_light';
    const trashDays = Number(cfg.trashRetentionDays) || 30;
    const now = Date.now();

    let archivedCount = 0;
    let deletedCount = 0;
    let trashCleanedCount = 0;
    let nextList = [];

    setProperties(prev => {
      const next = [];
      for (const p of prev) {
        // 1. Dọn dẹp tin trong Thùng rác quá trashRetentionDays (ví dụ 30 ngày)
        if (p.isDeleted || p.status === 'trash') {
          const delTime = p.deletedAt ? new Date(p.deletedAt).getTime() : now;
          const daysInTrash = Math.floor((now - delTime) / (1000 * 60 * 60 * 24));
          if (trashDays > 0 && daysInTrash >= trashDays) {
            trashCleanedCount++;
            continue; // Bỏ qua khỏi danh sách => Xóa vĩnh viễn
          }
          next.push(p);
          continue;
        }

        // 2. Xử lý tin hết hạn không gia hạn quá retentionDays (ví dụ 45 ngày)
        let expTime = p.expiresAt ? new Date(p.expiresAt).getTime() : 0;
        let propStatus = p.status;
        let propVip = p.vipPackageId;

        // Đặc quyền VIP: Nếu tin VIP đang active mà đã qua thời hạn VIP thì hạ thành Tin Thường + 60 ngày
        if (propStatus === 'active' && ['vip-diamond', 'vip-gold', 'vip-silver'].includes(propVip) && expTime > 0 && expTime <= now) {
          const normalExpTime = expTime + 60 * 86400 * 1000;
          if (now < normalExpTime) {
            next.push({
              ...p,
              vipPackageId: 'normal',
              downgradedFromVip: propVip,
              vipExpiredAt: p.expiresAt,
              listingDays: 60,
              expiresAt: new Date(normalExpTime).toISOString(),
              status: 'active',
              isFeatured: false,
              hasDualListing: false,
              updatedAt: new Date().toISOString()
            });
            continue;
          } else {
            expTime = normalExpTime;
            propStatus = 'expired';
          }
        }

        const isExpired = propStatus === 'expired' || (expTime > 0 && expTime <= now);

        if (isExpired && expTime > 0 && !p.isArchived) {
          const daysSinceExpiry = Math.floor((now - expTime) / (1000 * 60 * 60 * 24));
          if (daysSinceExpiry >= retentionDays) {
            if (action === 'permanent_delete') {
              deletedCount++;
              continue; // Xóa sạch khỏi database
            } else if (action === 'move_to_trash') {
              deletedCount++;
              next.push({
                ...p,
                isDeleted: true,
                status: 'trash',
                previousStatus: 'expired',
                deletedAt: new Date().toISOString(),
                trashReason: `Tự động đưa vào thùng rác do hết hạn quá ${retentionDays} ngày`
              });
              continue;
            } else {
              // Mặc định: 'archive_light' (Chuyển sang dữ liệu siêu nhẹ)
              archivedCount++;
              next.push(archivePropertyLight(p));
              continue;
            }
          }
        }

        next.push(p);
      }
      nextList = next;
      return next;
    });

    const totalProcessed = archivedCount + deletedCount + trashCleanedCount;
    const estFreedKb = (archivedCount * 25) + (deletedCount * 80) + (trashCleanedCount * 80);

    // Đồng bộ lập tức ra Server & Supabase nếu có bài viết được nén hoặc dọn dẹp
    if (totalProcessed > 0 && nextList.length > 0) {
      persistSettingToSupabase('bds_properties', nextList).catch(console.warn);
      try {
        fetch('/api/db-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bds_properties: nextList })
        }).catch(console.warn);
      } catch (e) {
        console.warn('Lỗi db-sync khi dọn dẹp:', e);
      }
    }

    const msg = totalProcessed > 0
      ? `Dọn dẹp DB hoàn tất: Đã nén nhẹ ${archivedCount} tin, xóa ${deletedCount + trashCleanedCount} tin quá hạn ${retentionDays} ngày. Giải phóng ~${estFreedKb} KB!`
      : `Hệ thống đã được kiểm tra: Không có bài viết nào hết hạn quá ${retentionDays} ngày cần xử lý!`;

    if (!isSilent) {
      showToast(msg, totalProcessed > 0 ? 'success' : 'info');
    }
    return { archivedCount, deletedCount, trashCleanedCount, estFreedKb, message: msg };
  };

  // Admin update property
  const updateProperty = (propertyId, partialData) => {
    let sanitizedData = { ...partialData };
    if (systemConfig?.autoFilterPhoneInContent !== false) {
      if (sanitizedData.title) {
        sanitizedData.title = sanitizePhoneFromText(sanitizedData.title).text;
      }
      if (sanitizedData.description) {
        sanitizedData.description = sanitizePhoneFromText(sanitizedData.description).text;
      }
    }

    const currentProp = properties.find(p => p.id === propertyId);
    const updatedTarget = currentProp ? {
      ...currentProp,
      ...sanitizedData,
      updatedAt: sanitizedData.updatedAt || new Date().toISOString()
    } : {
      id: propertyId,
      ...sanitizedData,
      updatedAt: sanitizedData.updatedAt || new Date().toISOString()
    };

    const nextProperties = properties.map(p => p.id === propertyId ? updatedTarget : p);
    setProperties(nextProperties);

    // 1. Đồng bộ lên Supabase Cloud
    upsertSupabaseProperty(updatedTarget).catch(console.warn);

    // 2. Đồng bộ xuống server-db.json qua API route /api/db-sync để F5 / SSR giữ nguyên
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/db-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bds_properties: nextProperties
          })
        }).catch(console.warn);
      } catch (e) {
        console.warn('Lỗi db-sync khi updateProperty:', e);
      }
    }
    showToast(`Đã cập nhật bài đăng ${propertyId}!`, 'success');
  };

  // Cập nhật hàng loạt nhiều bài viết cùng lúc (tránh nghẽn race-condition)
  const updateMultipleProperties = (updatesArray) => {
    if (!Array.isArray(updatesArray) || updatesArray.length === 0) return;
    const updateMap = new Map();
    updatesArray.forEach(u => {
      if (u && u.id) updateMap.set(u.id, u.data || {});
    });

    const updatedTargets = [];
    const nextProperties = properties.map(p => {
      if (updateMap.has(p.id)) {
        const partialData = updateMap.get(p.id);
        const updated = {
          ...p,
          ...partialData,
          updatedAt: partialData.updatedAt || new Date().toISOString()
        };
        updatedTargets.push(updated);
        return updated;
      }
      return p;
    });

    setProperties(nextProperties);

    // 1. Đồng bộ lên Supabase Cloud hàng loạt
    if (updatedTargets.length > 0) {
      syncStateToSupabase({ bds_properties: nextProperties }).catch(console.warn);
    }

    // 2. Đồng bộ xuống server-db.json qua API route /api/db-sync
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/db-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bds_properties: nextProperties
          })
        }).catch(console.warn);
      } catch (e) {
        console.warn('Lỗi db-sync khi updateMultipleProperties:', e);
      }
    }
  };

  // Gia hạn tin đăng (Renew / Extend Listing)
  const renewProperty = ({ propertyId, extendDays = 15, newVipPackageId = null, autoRenew = undefined, isFreeAdmin = false }) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) {
      showToast('Không tìm thấy tin đăng cần gia hạn!', 'error');
      return false;
    }

    const vipId = newVipPackageId || prop.vipPackageId || 'normal';
    const pkg = (vipPackages || []).find(v => v.id === vipId) || { name: 'Tin Thường', pricePerDay: 5000 };
    const days = Number(extendDays) || 15;
    const dailyRate = pkg.rates?.[days] || pkg.rates?.[15] || pkg.pricePerDay || 5000;
    const totalCost = isFreeAdmin ? 0 : dailyRate * days;

    const isAdmin = currentUser?.role === 'admin';

    if (!isAdmin && !isFreeAdmin && totalCost > 0) {
      if ((currentUser.walletBalance || 0) < totalCost) {
        showToast(`Số dư ví (${(currentUser.walletBalance || 0).toLocaleString('vi-VN')} đ) không đủ để gia hạn ${pkg.name} (${totalCost.toLocaleString('vi-VN')} đ). Vui lòng nạp thêm!`, 'error');
        setActiveModal('wallet-deposit');
        return false;
      }

      // Deduct wallet
      const newBal = (currentUser.walletBalance || 0) - totalCost;
      const updatedUser = { ...currentUser, walletBalance: newBal };
      setCurrentUser(updatedUser);
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      // Record transaction
      const newTxn = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'renew_listing',
        title: `Gia hạn tin ${prop.id} (${pkg.name} - ${days} ngày)`,
        amount: -totalCost,
        balanceAfter: newBal,
        status: 'success',
        createdAt: new Date().toISOString(),
        paymentMethod: 'Ví tài khoản'
      };
      setTransactions(prev => [newTxn, ...prev]);
    }

    // Tính thời gian hết hạn mới:
    // Nếu tin đã hết hạn: tính từ thời điểm gia hạn (now + days)
    // Nếu tin đang còn hạn: cộng nối tiếp vào hạn hiện tại (expiresAt_cũ + days)
    const now = Date.now();
    let newExpiresAt;
    const currentExp = prop.expiresAt ? new Date(prop.expiresAt).getTime() : 0;
    if (prop.status === 'expired' || currentExp <= now) {
      newExpiresAt = new Date(now + days * 86400 * 1000).toISOString();
    } else {
      newExpiresAt = new Date(currentExp + days * 86400 * 1000).toISOString();
    }

    const isRenewingVip = ['vip-diamond', 'vip-gold', 'vip-silver'].includes(vipId);
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          status: 'active',
          vipPackageId: vipId,
          listingDays: days,
          expiresAt: newExpiresAt,
          downgradedFromVip: isRenewingVip ? null : p.downgradedFromVip,
          vipExpiredAt: isRenewingVip ? null : p.vipExpiredAt,
          isFeatured: vipId === 'vip-diamond',
          hasDualListing: false,
          autoRenew: autoRenew !== undefined ? autoRenew : (p.autoRenew ?? false),
          updatedAt: new Date().toISOString(),
          lastRenewedAt: new Date().toISOString(),
          renewCount: (p.renewCount || 0) + 1
        };
      }
      return p;
    }));

    showToast(`Gia hạn tin đăng ${prop.id} thành công thêm ${days} ngày! Hạn mới đến: ${new Date(newExpiresAt).toLocaleDateString('vi-VN')}`, 'success');
    return true;
  };

  // Deposit money into wallet
  const depositWallet = (amount, paymentMethod = 'VietQR') => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) return;

    const newBalance = currentUser.walletBalance + numAmount;
    const updatedUser = { ...currentUser, walletBalance: newBalance };
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      title: `Nạp tiền vào tài khoản qua ${paymentMethod}`,
      amount: numAmount,
      balanceAfter: newBalance,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod
    };
    setTransactions(prev => [newTxn, ...prev]);

    showToast(`Nạp thành công +${numAmount.toLocaleString('vi-VN')} đ vào ví! Số dư mới: ${newBalance.toLocaleString('vi-VN')} đ`, 'success');

    // === TỰ ĐỘNG TRẢ THƯỞNG HOA HỒNG DOANH THU AFFILIATE (% DOANH THU) ===
    const commissionRate = Number(systemConfig?.affiliateCommissionRate !== undefined ? systemConfig.affiliateCommissionRate : 7);
    if (currentUser?.referredBy && commissionRate > 0) {
      const cleanRefBy = String(currentUser.referredBy);
      const referrer = (usersList || []).find(u => 
        String(u.id) === cleanRefBy ||
        (u.refCode && String(u.refCode).toUpperCase() === cleanRefBy.toUpperCase()) ||
        (u.phone && normalizePhone(u.phone) === normalizePhone(cleanRefBy))
      );

      if (referrer && referrer.id !== currentUser.id) {
        const commissionAmt = Math.round((numAmount * commissionRate) / 100);
        if (commissionAmt > 0) {
          const referrerNewBal = (Number(referrer.walletBalance) || 0) + commissionAmt;
          const updatedReferrer = { ...referrer, walletBalance: referrerNewBal };
          setUsersList(prevList => prevList.map(u => u.id === referrer.id ? updatedReferrer : u));

          const commTxn = {
            id: `TXN-COMM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
            userId: referrer.id,
            userName: referrer.name,
            type: 'affiliate_commission',
            title: `Hoa hồng nạp tiền (${commissionRate}%): ${currentUser.name || 'F1'} nạp ${numAmount.toLocaleString('vi-VN')}đ`,
            amount: commissionAmt,
            balanceAfter: referrerNewBal,
            status: 'success',
            createdAt: new Date().toISOString(),
            paymentMethod: 'Hoa Hồng Tiếp Thị'
          };
          setTransactions(prev => [commTxn, ...prev]);

          if (typeof window !== 'undefined') {
            try {
              const storedComm = JSON.parse(localStorage.getItem('bds_affiliate_commissions') || '[]');
              storedComm.unshift({
                id: commTxn.id,
                referrerId: referrer.id,
                referrerName: referrer.name,
                refereeId: currentUser.id,
                refereeName: currentUser.name,
                depositAmount: numAmount,
                rate: commissionRate,
                commissionAmount: commissionAmt,
                createdAt: commTxn.createdAt
              });
              localStorage.setItem('bds_affiliate_commissions', JSON.stringify(storedComm));
            } catch (e) {}
          }
        }
      }
    }
  };

  // Admin Adjust User Balance (Cộng/trừ tiền thủ công)
  const adjustUserBalance = (userId, amount, note = 'Điều chỉnh bởi Admin') => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount) return;

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newBal = u.walletBalance + numAmount;
        if (currentUser.id === userId) {
          setCurrentUser({ ...currentUser, walletBalance: newBal });
        }
        return { ...u, walletBalance: newBal };
      }
      return u;
    }));

    const targetUser = usersList.find(u => u.id === userId);
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId,
      userName: targetUser ? targetUser.name : 'Người dùng',
      type: numAmount > 0 ? 'deposit' : 'adjust',
      title: `${note} (${numAmount > 0 ? '+' : ''}${numAmount.toLocaleString('vi-VN')} đ)`,
      amount: numAmount,
      balanceAfter: (targetUser ? targetUser.walletBalance : 0) + numAmount,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: 'Ban Quản Trị CMS'
    };
    setTransactions([newTxn, ...transactions]);
    showToast(`Đã điều chỉnh ví user ${userId}: ${numAmount > 0 ? '+' : ''}${numAmount.toLocaleString('vi-VN')} đ`, 'success');
  };

  // Admin Toggle User Verification
  const toggleUserVerification = (userId) => {
    let updatedTarget = null;
    const nextUsers = usersList.map(u => {
      if (u.id === userId) {
        const nextState = !u.isVerified;
        showToast(`${nextState ? 'Đã duyệt cấp tích xanh' : 'Đã thu hồi tích xanh'} cho ${u.name}`, 'info');
        if (currentUser.id === userId) {
          setCurrentUser(curr => ({ ...curr, isVerified: nextState, kycStatus: nextState ? 'verified' : 'unverified' }));
        }
        updatedTarget = { 
          ...u, 
          isVerified: nextState, 
          kycStatus: nextState ? 'verified' : (u.idCardNumber ? 'pending' : 'unverified') 
        };
        return updatedTarget;
      }
      return u;
    });
    setUsersList(nextUsers);
    if (updatedTarget) {
      upsertSupabaseProfile(updatedTarget).catch(console.warn);
      persistSettingToSupabase('bds_users_list', nextUsers).catch(console.warn);
    }
  };

  // Admin Update User
  const updateUser = async (userId, updatedFields) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Không tìm thấy người dùng' };

    const formattedFields = {
      ...updatedFields,
      ...(updatedFields.phone ? { phone: formatPhoneNumber(updatedFields.phone) } : {})
    };
    const updatedTarget = { ...target, ...formattedFields, updatedAt: new Date().toISOString() };
    const nextList = usersList.map(u => u.id === userId ? updatedTarget : u);
    setUsersList(nextList);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedTarget }));
    }

    // Cập nhật đồng bộ các tin đăng của người dùng này
    const nextProperties = properties.map(p => {
      const isOwner = Boolean(
        (p.author?.id && String(p.author.id) === String(userId)) ||
        (p.author?.email && target.email && p.author.email.toLowerCase() === target.email.toLowerCase()) ||
        (p.author?.phone && target.phone && normalizePhone(p.author.phone) === normalizePhone(target.phone))
      );
      if (isOwner) {
        return {
          ...p,
          contactName: updatedTarget.name || p.contactName,
          contactPhone: updatedTarget.phone || p.contactPhone,
          author: {
            ...p.author,
            name: updatedTarget.name || p.author?.name,
            phone: updatedTarget.phone || p.author?.phone,
            zalo: updatedTarget.phone ? normalizePhone(updatedTarget.phone) : p.author?.zalo
          }
        };
      }
      return p;
    });
    setProperties(nextProperties);

    await upsertSupabaseProfile(updatedTarget);
    await persistSettingToSupabase('bds_users_list', nextList);
    await persistSettingToSupabase('bds_properties', nextProperties);
    showToast(`Đã cập nhật thông tin người dùng "${updatedTarget.name || userId}" thành công!`, 'success');
    return { success: true, user: updatedTarget };
  };

  // Admin Assign & Sync User Membership
  const assignUserMembership = async (userId, membershipData, voucherData = null) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Không tìm thấy người dùng' };

    const updatedTarget = {
      ...target,
      membership: membershipData,
      vouchers: voucherData !== null ? voucherData : target.vouchers,
      updatedAt: new Date().toISOString()
    };
    const nextList = usersList.map(u => u.id === userId ? updatedTarget : u);
    setUsersList(nextList);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedTarget }));
    }

    await upsertSupabaseProfile(updatedTarget);
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã đồng bộ gói hội viên cho "${updatedTarget.name || userId}" thành công!`, 'success');
    return { success: true, user: updatedTarget };
  };

  // Move User to Trash (Soft Delete)
  const moveUserToTrash = async (userId) => {
    if (currentUser?.id === userId) {
      const msg = 'Không thể đưa tài khoản đang đăng nhập của bạn vào thùng rác!';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
    const target = usersList.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Không tìm thấy người dùng' };

    const trashedUser = {
      ...target,
      isDeleted: true,
      status: 'trash',
      previousStatus: (target.status && target.status !== 'trash') ? target.status : 'active',
      deletedAt: new Date().toISOString()
    };
    const nextList = usersList.map(u => u.id === userId ? trashedUser : u);
    setUsersList(nextList);

    await upsertSupabaseProfile(trashedUser);
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã chuyển người dùng "${trashedUser.name}" vào thùng rác!`, 'info');
    return { success: true, user: trashedUser };
  };

  // Restore User from Trash
  const restoreUserFromTrash = async (userId) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Không tìm thấy tài khoản để khôi phục' };

    const restoredUser = {
      ...target,
      isDeleted: false,
      status: (target.previousStatus && target.previousStatus !== 'trash') ? target.previousStatus : 'active',
      deletedAt: null
    };
    const nextList = usersList.map(u => u.id === userId ? restoredUser : u);
    setUsersList(nextList);

    await upsertSupabaseProfile(restoredUser);
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã khôi phục tài khoản "${restoredUser.name}" thành công!`, 'success');
    return { success: true, user: restoredUser };
  };

  // Permanent Delete User
  const permanentDeleteUser = async (userId) => {
    if (currentUser?.id === userId) {
      const msg = 'Không thể xóa tài khoản của chính bạn!';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
    const target = usersList.find(u => u.id === userId);
    const nextList = usersList.filter(u => u.id !== userId);
    setUsersList(nextList);

    await deleteSupabaseProfile(userId);
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã xóa vĩnh viễn tài khoản "${target?.name || userId}" khỏi hệ thống!`, 'warning');
    return { success: true, id: userId };
  };

  // Empty User Trash
  const emptyUserTrash = async () => {
    const trashUsers = usersList.filter(u => u.isDeleted || u.status === 'trash');
    if (trashUsers.length === 0) {
      showToast('Thùng rác người dùng hiện đang trống!', 'info');
      return { success: true, count: 0 };
    }
    const nextList = usersList.filter(u => !u.isDeleted && u.status !== 'trash');
    setUsersList(nextList);

    await Promise.all(trashUsers.map(u => deleteSupabaseProfile(u.id)));
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã dọn sạch vĩnh viễn ${trashUsers.length} tài khoản trong thùng rác!`, 'success');
    return { success: true, count: trashUsers.length };
  };

  // Admin Update VIP Package Price (Hỗ trợ 0 đ cho Tin Thường & cấu hình giới hạn)
  const updateVipPackagePrice = async (pkgId, newPrice, extraData = {}) => {
    const parsed = parseInt(newPrice, 10);
    const priceNum = isNaN(parsed) ? 0 : Math.max(0, parsed);

    const discount30Percent = extraData.discount30DaysPercent !== undefined
      ? Math.max(0, Math.min(100, parseInt(extraData.discount30DaysPercent, 10) || 0))
      : (Number(systemConfig?.discount30DaysPercent) || 25);

    const customRates = (pkgId === 'normal' && extraData.rates) ? extraData.rates : {};
    const rate5 = priceNum;
    const rate7 = priceNum;
    const rate10 = priceNum;
    const rate15 = customRates[15] !== undefined ? customRates[15] : priceNum;
    const rate30 = customRates[30] !== undefined
      ? customRates[30]
      : (extraData.rate30 !== undefined
          ? Math.max(0, parseInt(extraData.rate30, 10) || 0)
          : Math.round(priceNum * (100 - discount30Percent) / 100));
    const rate60 = customRates[60] !== undefined
      ? customRates[60]
      : (pkgId === 'normal' ? 5000 : Math.round(priceNum * 0.70));

    let updatedPackages;
    setVipPackages(prev => {
      updatedPackages = prev.map(p => {
        if (p.id === pkgId) {
          return {
            ...p,
            pricePerDay: priceNum,
            publishPrice: (pkgId === 'normal' ? rate60 : p.publishPrice),
            rates: {
              ...(p.rates || {}),
              5: rate5,
              7: rate7,
              10: rate10,
              15: rate15,
              30: rate30,
              60: rate60,
              ...customRates
            },
            ...(pkgId !== 'normal' ? { allowedDurations: [5, 7, 10, 15, 30], minDays: 5 } : {}),
            ...extraData
          };
        }
        return p;
      });
      return updatedPackages;
    });
    await persistSettingToSupabase('bds_vip_packages', updatedPackages);
    if (extraData.dailyFreeLimit !== undefined) {
      const limitNum = Math.max(0, parseInt(extraData.dailyFreeLimit, 10) || 0);
      setSystemConfig(prev => {
        const nextCfg = { ...prev, dailyFreeListingLimit: limitNum };
        persistSettingToSupabase('bds_system_config', nextCfg);
        return nextCfg;
      });
    }
    if (extraData.approvalMode !== undefined || extraData.approvalMinMinutes !== undefined || extraData.approvalMaxMinutes !== undefined || extraData.delayMinutes !== undefined) {
      setPaymentConfig(prev => {
        const currentTiers = prev?.approvalTiers || DEFAULT_APPROVAL_TIERS;
        const currentPkgTier = currentTiers[pkgId] || DEFAULT_APPROVAL_TIERS[pkgId] || {};
        const mode = extraData.approvalMode || currentPkgTier.mode || (pkgId === 'normal' ? 'random' : 'instant');
        const delayMinMinutes = extraData.approvalMinMinutes !== undefined ? Number(extraData.approvalMinMinutes) : (currentPkgTier.delayMinMinutes ?? 5);
        const delayMaxMinutes = extraData.approvalMaxMinutes !== undefined ? Number(extraData.approvalMaxMinutes) : (currentPkgTier.delayMaxMinutes ?? 15);
        const delayMinutes = extraData.delayMinutes !== undefined ? Number(extraData.delayMinutes) : (currentPkgTier.delayMinutes ?? 10);
        
        let badgeText = 'Duyệt tức thì (0s)';
        if (mode === 'random') {
          badgeText = `Duyệt tự động (${delayMinMinutes} - ${delayMaxMinutes} phút)`;
        } else if (mode === 'countdown') {
          badgeText = `Tự động duyệt (${delayMinutes} phút)`;
        }

        const nextCfg = {
          ...prev,
          approvalTiers: {
            ...currentTiers,
            [pkgId]: {
              ...currentPkgTier,
              mode,
              delayMinutes,
              delayMinMinutes,
              delayMaxMinutes,
              badgeText
            }
          }
        };
        persistSettingToSupabase('bds_payment_config', nextCfg);
        return nextCfg;
      });
    }
    showToast(
      priceNum === 0 
        ? `Đã cập nhật gói ${pkgId} thành Miễn phí (0 đ/ngày)` 
        : `Đã cập nhật giá gói ${pkgId} thành ${priceNum.toLocaleString('vi-VN')} đ/ngày`, 
      'success'
    );
  };

  // Admin Update All VIP Package Prices at once (Hỗ trợ giá 0 đ & giới hạn tin miễn phí/ngày)
  const updateAllVipPackagePrices = async (pricesMap = {}, extraConfig = {}) => {
    const discount30Percent = extraConfig.discount30DaysPercent !== undefined
      ? Math.max(0, Math.min(100, parseInt(extraConfig.discount30DaysPercent, 10) || 0))
      : (Number(systemConfig?.discount30DaysPercent) || 25);

    let updatedPackages;
    setVipPackages(prev => {
      updatedPackages = prev.map(p => {
        if (pricesMap[p.id] !== undefined) {
          const rawVal = pricesMap[p.id];
          const parsed = parseInt(rawVal, 10);
          const priceNum = isNaN(parsed) ? 0 : Math.max(0, parsed);
          const rate5 = priceNum;
          const rate7 = priceNum;
          const rate10 = priceNum;
          const rate15 = (p.id === 'normal' && extraConfig.normalCustomRates?.[15] !== undefined)
            ? extraConfig.normalCustomRates[15]
            : priceNum;
          const rate30 = (p.id === 'normal' && extraConfig.normalCustomRates?.[30] !== undefined)
            ? extraConfig.normalCustomRates[30]
            : (extraConfig.customRates30?.[p.id] !== undefined
                ? Math.max(0, parseInt(extraConfig.customRates30[p.id], 10) || 0)
                : Math.round(priceNum * (100 - discount30Percent) / 100));
          const rate60 = (p.id === 'normal') 
            ? (extraConfig.normalCustomRates?.[60] !== undefined ? extraConfig.normalCustomRates[60] : 0) 
            : Math.round(priceNum * 0.70);
          const extra = (p.id === 'normal')
            ? {
                ...(extraConfig.dailyFreeListingLimit !== undefined ? { dailyFreeLimit: Math.max(0, parseInt(extraConfig.dailyFreeListingLimit, 10) || 0) } : {}),
                ...(extraConfig.normalAllowedDurations ? { allowedDurations: extraConfig.normalAllowedDurations } : {}),
                ...(extraConfig.normalCustomRates ? { rates: { ...(p.rates || {}), ...extraConfig.normalCustomRates, 15: rate15, 30: rate30, 60: rate60 } } : {}),
                ...(extraConfig.approvalMinMinutes !== undefined ? { approvalMinMinutes: Number(extraConfig.approvalMinMinutes) } : {}),
                ...(extraConfig.approvalMaxMinutes !== undefined ? { approvalMaxMinutes: Number(extraConfig.approvalMaxMinutes) } : {}),
                approvalMode: 'random',
                approvalBadge: `Duyệt tự động (${extraConfig.approvalMinMinutes ?? p.approvalMinMinutes ?? 5} - ${extraConfig.approvalMaxMinutes ?? p.approvalMaxMinutes ?? 15} phút)`
              }
            : {
                allowedDurations: [5, 7, 10, 15, 30],
                minDays: 5,
                approvalMode: 'instant',
                approvalBadge: 'Duyệt tức thì (0s)'
              };
          return {
            ...p,
            pricePerDay: priceNum,
            publishPrice: (p.id === 'normal' ? rate60 : p.publishPrice),
            rates: {
              ...(p.rates || {}),
              5: rate5,
              7: rate7,
              10: rate10,
              15: rate15,
              30: rate30,
              60: rate60,
              ...(p.id === 'normal' && extraConfig.normalCustomRates ? extraConfig.normalCustomRates : {})
            },
            ...extra
          };
        }
        return p;
      });
      return updatedPackages;
    });
    await persistSettingToSupabase('bds_vip_packages', updatedPackages);
    if (extraConfig.dailyFreeListingLimit !== undefined || extraConfig.discount30DaysPercent !== undefined) {
      setSystemConfig(prev => {
        const nextCfg = { 
          ...prev, 
          ...(extraConfig.dailyFreeListingLimit !== undefined ? { dailyFreeLimit: Math.max(0, parseInt(extraConfig.dailyFreeListingLimit, 10) || 0) } : {}),
          ...(extraConfig.discount30DaysPercent !== undefined ? { discount30DaysPercent: discount30Percent } : {})
        };
        persistSettingToSupabase('bds_system_config', nextCfg);
        return nextCfg;
      });
    }
    if (extraConfig.approvalMinMinutes !== undefined || extraConfig.approvalMaxMinutes !== undefined) {
      setPaymentConfig(prev => {
        const currentTiers = prev?.approvalTiers || DEFAULT_APPROVAL_TIERS;
        const currentPkgTier = currentTiers['normal'] || DEFAULT_APPROVAL_TIERS['normal'] || {};
        const delayMinMinutes = extraConfig.approvalMinMinutes !== undefined ? Number(extraConfig.approvalMinMinutes) : (currentPkgTier.delayMinMinutes ?? 5);
        const delayMaxMinutes = extraConfig.approvalMaxMinutes !== undefined ? Number(extraConfig.approvalMaxMinutes) : (currentPkgTier.delayMaxMinutes ?? 15);
        const badgeText = `Duyệt tự động (${delayMinMinutes} - ${delayMaxMinutes} phút)`;
        const nextCfg = {
          ...prev,
          approvalTiers: {
            ...currentTiers,
            normal: {
              ...currentPkgTier,
              mode: 'random',
              delayMinMinutes,
              delayMaxMinutes,
              badgeText
            }
          }
        };
        persistSettingToSupabase('bds_payment_config', nextCfg);
        return nextCfg;
      });
    }
    showToast('Đã lưu và đồng bộ toàn bộ bảng giá tin đăng thành công!', 'success');
    return updatedPackages;
  };

  // Admin Update Daily Free Listing Limit (Giới hạn số tin đăng miễn phí/ngày/user)
  const updateDailyFreeListingLimit = async (limit) => {
    const limitNum = Math.max(0, parseInt(limit, 10) || 0);
    setSystemConfig(prev => {
      const nextCfg = { ...prev, dailyFreeListingLimit: limitNum };
      persistSettingToSupabase('bds_system_config', nextCfg);
      return nextCfg;
    });
    setVipPackages(prev => {
      const nextPkgs = prev.map(p => p.id === 'normal' ? { ...p, dailyFreeLimit: limitNum } : p);
      persistSettingToSupabase('bds_vip_packages', nextPkgs);
      return nextPkgs;
    });
    showToast(
      limitNum === 0 
        ? 'Đã đặt giới hạn tin miễn phí: Không giới hạn' 
        : `Đã cập nhật giới hạn đăng tin miễn phí: ${limitNum} tin/ngày/user`, 
      'success'
    );
  };

  // Admin Update 30-Day Listing Discount Percentage (Mức tiết kiệm mốc 30 ngày)
  const updateDiscount30DaysPercent = async (percent) => {
    const pNum = Math.max(0, Math.min(100, parseInt(percent, 10) || 0));
    setSystemConfig(prev => {
      const nextCfg = { ...prev, discount30DaysPercent: pNum };
      persistSettingToSupabase('bds_system_config', nextCfg);
      return nextCfg;
    });

    let nextPkgs;
    setVipPackages(prev => {
      nextPkgs = prev.map(p => {
        if (p.id === 'normal') return p;
        const baseDaily = Number(p.pricePerDay) || 0;
        const rate30 = Math.round(baseDaily * (100 - pNum) / 100);
        return {
          ...p,
          rates: {
            ...(p.rates || {}),
            30: rate30
          }
        };
      });
      persistSettingToSupabase('bds_vip_packages', nextPkgs);
      return nextPkgs;
    });

    showToast(`Đã cập nhật mức tiết kiệm mốc 30 ngày thành ${pNum}%`, 'success');
  };

  // Admin Update Bump Service Price (Đơn giá Đẩy Tin toàn sàn)
  const updateBumpServicePrice = async (newPrice) => {
    const priceNum = Math.max(0, parseInt(newPrice, 10) || 0);
    setBumpServicePrice(priceNum);

    // Đồng bộ vào gói normal trong vipPackages
    let updatedPackages;
    setVipPackages(prev => {
      updatedPackages = prev.map(p => p.id === 'normal' ? { ...p, bumpPrice: priceNum } : p);
      return updatedPackages;
    });

    await Promise.all([
      persistSettingToSupabase('bds_bump_service_price', priceNum),
      updatedPackages ? persistSettingToSupabase('bds_vip_packages', updatedPackages) : Promise.resolve()
    ]);

    showToast(`Đã cập nhật đơn giá dịch vụ Đẩy Tin thành ${priceNum.toLocaleString('vi-VN')} đ/lần!`, 'success');
    return priceNum;
  };

  // Reset to original seed data
  const resetToMockData = async () => {
    setProperties(INITIAL_PROPERTIES);
    setFavorites(['BDS-001']);
    setCurrentUser(MOCK_USERS[1]);
    setUsersList(MOCK_USERS);
    setVipPackages(VIP_PACKAGES);
    setBumpServicePrice(BUMP_SERVICE_PRICE);
    setMembershipPackages(MEMBERSHIP_PACKAGES);
    setTransactions(MOCK_TRANSACTIONS);
    setNavMenuItems(INITIAL_NAV_MENU);
    setHeaderConfig(DEFAULT_HEADER_CONFIG);
    setSystemConfig(DEFAULT_SYSTEM_CONFIG);

    await syncFullDbToSupabase({
      bds_properties: INITIAL_PROPERTIES,
      bds_users_list: MOCK_USERS,
      bds_transactions: MOCK_TRANSACTIONS,
      bds_vip_packages: VIP_PACKAGES,
      bds_bump_service_price: BUMP_SERVICE_PRICE,
      bds_membership_packages: MEMBERSHIP_PACKAGES,
      bds_nav_menu: INITIAL_NAV_MENU,
      bds_header_config: DEFAULT_HEADER_CONFIG,
      bds_system_config: DEFAULT_SYSTEM_CONFIG
    });

    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!', 'info');
  };

  // User Login (Xác thực đăng nhập nghiêm ngặt với mật khẩu)
  const loginUser = async (identifier, password) => {
    if (!identifier || !identifier.trim()) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại!', 'warning');
      return false;
    }
    if (!password || !password.trim()) {
      showToast('Vui lòng nhập mật khẩu!', 'warning');
      return false;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.', 'error');
        return false;
      }

      const found = data.user;
      setCurrentUser(found);
      if (typeof document !== 'undefined') {
        document.cookie = `bds_session_user=${encodeURIComponent(found.id)}; path=/; max-age=31536000; SameSite=Lax`;
      }
      showToast(data.message || `Đăng nhập thành công! Chào mừng ${found.name}`, 'success');
      return found;
    } catch (err) {
      // Fallback offline / local check nếu fetch gặp lỗi mạng
      const cleanIdent = identifier.trim().toLowerCase();
      const normalizePhone = phone => {
        let digits = (phone || '').replace(/\D/g, '');
        if (digits.startsWith('84') && digits.length >= 11) {
          digits = '0' + digits.slice(2);
        }
        return digits;
      };
      const inputDigits = normalizePhone(identifier);

      const found = usersList.find(u => {
        const emailMatch = u.email && u.email.trim().toLowerCase() === cleanIdent;
        const uPhoneDigits = normalizePhone(u.phone);
        const phoneMatch = inputDigits.length >= 9 && uPhoneDigits.length >= 9 && uPhoneDigits === inputDigits;
        return emailMatch || phoneMatch;
      });

      if (!found) {
        showToast('Tài khoản hoặc số điện thoại không tồn tại trong hệ thống!', 'error');
        return false;
      }
      if (found.status === 'trash' || found.isDeleted) {
        showToast('Tài khoản này đã bị chuyển vào thùng rác hoặc vô hiệu hóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ!', 'error');
        return false;
      }
      if (found.status === 'locked' || found.status === 'banned') {
        showToast('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên!', 'error');
        return false;
      }
      if (found.status === 'pending') {
        showToast('Tài khoản chưa được kích hoạt qua email! Vui lòng kiểm tra hộp thư để kích hoạt.', 'warning');
        return false;
      }

      // Xác thực mật khẩu
      let isMatch = false;
      if (found.password) {
        isMatch = (found.password === password);
      } else {
        isMatch = (password === '123456') || (found.role === 'admin' && password === 'admin123');
      }

      if (!isMatch) {
        showToast('Mật khẩu không chính xác! Vui lòng kiểm tra lại.', 'error');
        return false;
      }

      setCurrentUser(found);
      if (typeof document !== 'undefined') {
        document.cookie = `bds_session_user=${encodeURIComponent(found.id)}; path=/; max-age=31536000; SameSite=Lax`;
      }
      showToast(`Đăng nhập thành công! Chào mừng ${found.name}`, 'success');
      return found;
    }
  };

  // User Register (Gọi API Backend kiểm tra chống trùng, hash mật khẩu và gửi email kích hoạt)
  const registerUser = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Đăng ký tài khoản thất bại!', 'error');
        return { success: false, message: data.message };
      }
      showToast(data.message || 'Đăng ký thành công! Vui lòng kiểm tra email kích hoạt.', 'success');
      return { success: true, pendingVerification: true, email: userData.email, ...data };
    } catch (err) {
      showToast('Lỗi kết nối máy chủ khi đăng ký tài khoản.', 'error');
      return { success: false, message: err.message };
    }
  };

  const refreshUsersListFromServer = async () => {
    try {
      const res = await fetch('/api/db-sync');
      const db = await res.json();
      if (db.bds_users_list && Array.isArray(db.bds_users_list)) {
        setUsersList(db.bds_users_list);
        showToast(`Đã đồng bộ ${db.bds_users_list.length} người dùng từ máy chủ!`, 'success');
        return db.bds_users_list;
      }
    } catch (e) {
      showToast('Lỗi khi đồng bộ danh sách người dùng!', 'error');
    }
    return usersList;
  };

  const activateUserManually = async (userId) => {
    try {
      const res = await fetch('/api/auth/manual-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã kích hoạt tài khoản thành công!', 'success');
        await refreshUsersListFromServer();
        return true;
      }
      showToast(data.message || 'Kích hoạt thất bại!', 'error');
      return false;
    } catch (err) {
      showToast('Lỗi kết nối khi kích hoạt tài khoản!', 'error');
      return false;
    }
  };

  const resendUserVerificationEmail = async (email) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      showToast(data.message || 'Đã phát lại liên kết kích hoạt!', data.success ? 'success' : 'error');
      return data;
    } catch (err) {
      showToast('Lỗi khi gửi lại email xác thực!', 'error');
      return { success: false };
    }
  };

  // Update User Profile
  const updateUserProfile = (profileData) => {
    const formattedData = {
      ...profileData,
      ...(profileData.phone ? { phone: formatPhoneNumber(profileData.phone) } : {})
    };
    const updated = { ...currentUser, ...formattedData };
    setCurrentUser(updated);

    const nextUsers = usersList.map(u => String(u.id) === String(currentUser.id) ? updated : u);
    setUsersList(nextUsers);

    // Cập nhật thông tin tác giả cho tất cả bài đăng thuộc quyền sở hữu của người dùng (khớp theo id, email hoặc SĐT)
    const nextProperties = properties.map(p => {
      const isOwner = Boolean(
        (p.author?.id && currentUser.id && String(p.author.id) === String(currentUser.id)) ||
        (p.author?.email && currentUser.email && p.author.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (p.author?.phone && currentUser.phone && normalizePhone(p.author.phone) === normalizePhone(currentUser.phone))
      );
      if (isOwner) {
        return {
          ...p,
          contactName: updated.name,
          contactPhone: updated.phone,
          author: {
            ...p.author,
            name: updated.name,
            phone: updated.phone,
            zalo: updated.phone ? normalizePhone(updated.phone) : p.author?.zalo,
            avatar: updated.avatar
          }
        };
      }
      return p;
    });
    setProperties(nextProperties);

    // Đồng bộ lập tức lên Supabase Cloud
    upsertSupabaseProfile(updated).catch(console.warn);
    persistSettingToSupabase('bds_users_list', nextUsers).catch(console.warn);
    persistSettingToSupabase('bds_properties', nextProperties).catch(console.warn);

    // Đồng bộ lập tức xuống server-db.json qua API route
    try {
      fetch('/api/db-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bds_users_list: nextUsers,
          bds_properties: nextProperties
        })
      }).catch(console.warn);
    } catch (e) {
      console.warn('Lỗi db-sync:', e);
    }

    showToast('Cập nhật hồ sơ thông tin cá nhân thành công!', 'success');
  };

  // Submit KYC Verification Request - Hỗ trợ Tự động kiểm duyệt (Auto-eKYC) và Lưu trữ hồ sơ
  const submitKycVerification = async (kycData) => {
    const cleanId = String(kycData.idCardNumber || '').trim().replace(/\s+/g, '');
    const isAlreadyVerified = Boolean(currentUser.isVerified);
    const nextKycStatus = isAlreadyVerified ? 'verified' : 'pending';

    const updated = {
      ...currentUser,
      kycStatus: nextKycStatus,
      isVerified: isAlreadyVerified,
      idCardNumber: cleanId,
      licenseNumber: kycData.licenseNumber || '',
      idCardFront: kycData.idCardFront || currentUser.idCardFront || '',
      idCardBack: kycData.idCardBack || currentUser.idCardBack || '',
      certificateImage: kycData.certificateImage || currentUser.certificateImage || '',
      kycImages: {
        idCardFront: kycData.idCardFront || currentUser.kycImages?.idCardFront || '',
        idCardBack: kycData.idCardBack || currentUser.kycImages?.idCardBack || '',
        certificateImage: kycData.certificateImage || currentUser.kycImages?.certificateImage || ''
      },
      kycSubmittedAt: new Date().toISOString()
    };

    setCurrentUser(updated);
    const nextUsers = (usersList || []).map(u => String(u.id) === String(currentUser.id) ? updated : u);
    setUsersList(nextUsers);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bds_current_user', JSON.stringify(updated));
      } catch (e) {}
    }
    if (updated.id !== 'guest') {
      upsertSupabaseProfile(updated).catch(console.warn);
      persistSettingToSupabase('bds_users_list', nextUsers).catch(console.warn);
    }

    if (isAlreadyVerified) {
      showToast('Đã cập nhật bổ sung hồ sơ CCCD & Chứng chỉ môi giới thành công!', 'success');
    } else {
      showToast('Đã gửi hồ sơ xác thực CCCD & Chứng chỉ môi giới thành công! Ban Quản Trị sẽ xét duyệt và cấp Tích Xanh.', 'success');
    }
    return updated;
  };

  // Logout User
  const logoutUser = () => {
    setCurrentUser(DEFAULT_GUEST_USER);
    if (typeof document !== 'undefined') {
      document.cookie = `bds_session_user=guest; path=/; max-age=31536000; SameSite=Lax`;
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('bds_admin_2fa_verified');
      window.sessionStorage.removeItem('bds_admin_2fa_time');
    }
    showToast('Đã đăng xuất khỏi tài khoản!', 'info');
  };

  // Đặt lịch hẹn xem nhà trực tiếp
  const bookAppointment = async (appointmentData) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể đặt lịch hẹn xem nhà.');
      }
      setAppointmentsList(prev => [data.appointment, ...prev.filter(a => a.id !== data.appointment.id)]);
      return { success: true, appointment: data.appointment, notifications: data.notifications };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Cập nhật trạng thái lịch hẹn (pending, confirmed, completed, cancelled)
  const updateAppointmentStatus = async (appointmentId, newStatus, adminNote = '') => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái lịch hẹn.');
      }
      setAppointmentsList(prev => prev.map(a => a.id === appointmentId ? data.appointment : a));
      showToast('Đã cập nhật trạng thái lịch hẹn thành công!', 'success');
      return { success: true, appointment: data.appointment };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // Xóa lịch hẹn xem nhà
  const deleteAppointment = async (appointmentId) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể xóa lịch hẹn.');
      }
      setAppointmentsList(prev => prev.filter(a => a.id !== appointmentId));
      showToast('Đã xóa lịch hẹn xem nhà thành công!', 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // Đánh dấu thông báo nội bộ đã đọc
  const markNotificationAsRead = (notificationId) => {
    setInAppNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  // Open property detail (default to dedicated single page)
  const openPropertyDetail = (property) => {
    navigateToProperty(property);
  };

  // 10. Menu Navigation Management Methods
  const addMenuItem = (itemData) => {
    const newId = itemData.id || `menu-custom-${Date.now().toString().slice(-4)}`;
    const maxOrder = navMenuItems.reduce((max, item) => Math.max(max, item.order || 0), 0);
    const newItem = {
      id: newId,
      title: itemData.title || 'Mục Mới',
      path: itemData.path || '/',
      icon: itemData.icon || 'fa-solid fa-link',
      badge: itemData.badge || '',
      badgeColor: itemData.badgeColor || 'bg-emerald-500 text-white',
      isVisible: itemData.isVisible !== undefined ? itemData.isVisible : true,
      order: maxOrder + 1,
      target: itemData.target || '_self',
      isCustom: true,
      children: itemData.children || []
    };
    setNavMenuItems(prev => [...prev, newItem]);
    showToast(`Đã thêm mục menu "${newItem.title}" thành công!`, 'success');
    return newItem;
  };

  const updateMenuItem = (id, updatedFields) => {
    setNavMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    showToast(`Đã cập nhật mục menu thành công!`, 'success');
  };

  const deleteMenuItem = (id) => {
    setNavMenuItems(prev => prev.filter(item => item.id !== id));
    showToast(`Đã xóa mục menu khỏi hệ thống`, 'info');
  };

  const toggleMenuItemVisibility = (id) => {
    setNavMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isVisible;
        showToast(`Đã ${nextState ? 'kích hoạt hiển thị' : 'ẩn'} menu "${item.title}"`, 'info');
        return { ...item, isVisible: nextState };
      }
      return item;
    }));
  };

  const moveMenuItem = (id, direction) => {
    setNavMenuItems(prev => {
      const sorted = [...prev].sort((a, b) => (a.order || 0) - (b.order || 0));
      const index = sorted.findIndex(item => item.id === id);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        const tempOrder = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = tempOrder;
      } else if (direction === 'down' && index < sorted.length - 1) {
        const tempOrder = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = tempOrder;
      }
      return [...sorted];
    });
    showToast(`Đã thay đổi thứ tự menu`, 'success');
  };

  const addSubMenuItem = (parentId, subItemData) => {
    const subId = subItemData.id || `sub-${Date.now().toString().slice(-4)}`;
    const newSubItem = {
      id: subId,
      title: subItemData.title || 'Mục con mới',
      path: subItemData.path || '/',
      icon: subItemData.icon || 'fa-solid fa-chevron-right'
    };
    setNavMenuItems(prev => prev.map(item => {
      if (item.id === parentId) {
        const existingChildren = item.children || [];
        return { ...item, children: [...existingChildren, newSubItem] };
      }
      return item;
    }));
    showToast(`Đã thêm menu con vào danh mục`, 'success');
  };

  const deleteSubMenuItem = (parentId, subId) => {
    setNavMenuItems(prev => prev.map(item => {
      if (item.id === parentId) {
        return { ...item, children: (item.children || []).filter(sub => sub.id !== subId) };
      }
      return item;
    }));
    showToast(`Đã xóa mục menu con`, 'info');
  };

  const resetNavMenu = async () => {
    setNavMenuItems(INITIAL_NAV_MENU);
    await removeSettingFromSupabase('bds_nav_menu');
    showToast('Đã khôi phục cấu hình menu mặc định!', 'info');
  };

  // 11. Header & Logo Configuration Methods
  const updateHeaderConfig = async (updatedFields) => {
    const toSave = {
      ...DEFAULT_HEADER_CONFIG,
      ...headerConfig,
      ...updatedFields
    };

    setHeaderConfig(toSave);

    // Đồng bộ 2 chiều: Khi cập nhật Tên thương hiệu ở Header, tự động đồng bộ sang systemConfig
    const fullBrandName = [toSave.brandName, toSave.brandHighlight].filter(Boolean).join(' ').trim();
    let updatedSystem;
    if (fullBrandName) {
      setSystemConfig(prev => {
        updatedSystem = {
          ...prev,
          brandShortName: fullBrandName,
          ...(toSave.brandTagline ? { tagline: toSave.brandTagline } : {})
        };
        return updatedSystem;
      });
    }

    await Promise.all([
      persistSettingToSupabase('bds_header_config', toSave),
      updatedSystem ? persistSettingToSupabase('bds_system_config', updatedSystem) : Promise.resolve()
    ]);

    const widthLabel = toSave.containerWidth === 'full' 
      ? 'Toàn Màn Hình (100% Full-Width)' 
      : toSave.containerWidth === 'wide' 
      ? 'Rộng (Wide - 1536px)' 
      : 'Tiêu Chuẩn (Boxed - 1280px)';

    showToast(`Đã lưu cấu hình Header thành công! (Độ rộng: ${widthLabel})`, 'success');
    return toSave;
  };

  const resetHeaderConfig = async () => {
    setHeaderConfig(DEFAULT_HEADER_CONFIG);
    await removeSettingFromSupabase('bds_header_config');
    showToast('Đã khôi phục cấu hình Header & Logo về mặc định!', 'info');
  };

  const updateFooterConfig = async (newConfig) => {
    const raw = {
      ...DEFAULT_FOOTER_CONFIG,
      ...(footerConfig || {}),
      ...newConfig
    };
    // Làm sạch tuyệt đối các url rác hoặc '__custom__' trước khi lưu
    const cleanList = (list) => (list || []).map(item => ({
      ...item,
      url: (!item.url || item.url === '__custom__') ? '' : item.url
    }));
    const toSave = {
      ...raw,
      col2Links: cleanList(raw.col2Links),
      col3Links: cleanList(raw.col3Links),
      policyLinks: cleanList(raw.policyLinks)
    };
    setFooterConfig(toSave);
    await persistSettingToSupabase('bds_footer_config', toSave);
    showToast('Đã lưu cấu hình Footer thành công!', 'success');
    return toSave;
  };

  // 12. Sao lưu & Di chuyển Cấu Hình Hệ Thống Toàn Diện
  const importAllConfig = async (data) => {
    if (!data) return false;
    if (data.paymentConfig) {
      setPaymentConfig(prev => ({ ...prev, ...data.paymentConfig }));
    }
    if (data.headerConfig) {
      setHeaderConfig(prev => ({ ...prev, ...data.headerConfig }));
    }
    if (data.systemConfig) {
      setSystemConfig(prev => ({ ...prev, ...data.systemConfig }));
      if (data.systemConfig.hotline) {
        setSingleConfig(prev => ({
          ...prev,
          disclaimer: { ...(prev.disclaimer || {}), hotline: data.systemConfig.hotline }
        }));
        setEmailConfig(prev => ({
          ...prev,
          signature: { ...(prev.signature || {}), hotline: data.systemConfig.hotline }
        }));
      }
    }
    if (data.navMenuItems && Array.isArray(data.navMenuItems)) {
      setNavMenuItems(data.navMenuItems);
    }
    if (data.vipPackages && Array.isArray(data.vipPackages)) {
      setVipPackages(data.vipPackages);
    }
    if (data.membershipPackages && Array.isArray(data.membershipPackages)) {
      setMembershipPackages(data.membershipPackages);
    }
    if (data.properties && Array.isArray(data.properties)) {
      setProperties(data.properties);
    }
    if (data.singleConfig && typeof data.singleConfig === 'object') {
      setSingleConfig(prev => ({ ...prev, ...data.singleConfig }));
    }
    if (data.listingReports && Array.isArray(data.listingReports)) {
      setListingReports(data.listingReports);
    }
    await syncFullDbToSupabase(data);
    showToast('Đã nhập và khôi phục toàn bộ cấu hình hệ thống thành công!', 'success');
    return true;
  };

  // 15. Quản Lý Báo Cáo Tin Rao Vi Phạm (Listing Violation Reports Management)
  const addListingReport = async (reportData) => {
    const reportId = 'REP-' + Date.now();
    const targetProp = properties.find(p => p.id === reportData.propertyId) || {};

    const newReport = {
      id: reportId,
      propertyId: reportData.propertyId,
      propertyTitle: reportData.propertyTitle || targetProp.title || 'Bất động sản',
      reason: reportData.reason || 'other',
      description: reportData.description || '',
      contact: reportData.contact || '',
      reporterName: reportData.reporterName || reportData.contactName || 'Người dùng ẩn danh',
      reporterEmail: reportData.reporterEmail || (reportData.contact?.includes('@') ? reportData.contact.trim() : ''),
      reporterPhone: reportData.reporterPhone || (reportData.contact?.match(/\d{9,11}/) ? reportData.contact.trim() : ''),
      evidenceUrl: reportData.evidenceUrl || '',
      createdAt: new Date().toISOString(),
      status: 'pending' // 'pending', 'verified', 'delisted', 'rejected'
    };

    setListingReports(prev => {
      const updated = [newReport, ...prev];
      persistSettingToSupabase('bds_reported_listings', updated);
      return updated;
    });

    // Phát tín hiệu thông báo tức thì (Real-time Broadcast Event) cho toàn bộ ứng dụng & Admin Backend
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bds-new-report-alert', {
        detail: { report: newReport, property: targetProp }
      }));
    }

    // Gửi email thông báo cho Ban Kiểm Duyệt Sàn (Admin)
    if (emailConfig?.notifyAdminOnReport !== false) {
      const adminEmail = emailConfig?.adminAlertEmail || systemConfig?.supportEmail || 'ban-kiem-duyet@datbiendanang.vn';
      const adminHtml = generateAdminReportAlertEmailHtml({ report: newReport, property: targetProp });
      const adminSubject = renderEmailTemplateString(
        emailConfig?.templates?.admin_alert?.subject || '🚨 [CẢNH BÁO VI PHẠM] Tin rao #{{propertyId}} bị báo cáo: {{reason}}',
        {
          propertyId: newReport.propertyId,
          reason: REPORT_REASONS[newReport.reason]?.label || newReport.reason,
          siteName: emailConfig?.signature?.companyName || 'Đất Biển Đà Nẵng'
        }
      );
      await dispatchEmail({
        to: adminEmail,
        toName: 'Ban Kiểm Duyệt Đất Biển Đà Nẵng',
        from: emailConfig?.fromEmail || 'system-alerts@datbiendanang.vn',
        fromName: emailConfig?.fromName || 'Hệ Thống Kiểm Duyệt Tự Động',
        subject: adminSubject,
        htmlBody: adminHtml,
        type: 'report_admin_alert',
        metadata: { reportId: newReport.id, propertyId: newReport.propertyId }
      });
    }

    // Gửi email xác nhận tiếp nhận cho Người Báo Cáo (nếu có để lại email)
    if (newReport.reporterEmail) {
      const reporterHtml = generateReporterConfirmationEmailHtml({ report: newReport, property: targetProp });
      const reporterSubject = renderEmailTemplateString(
        emailConfig?.templates?.report_confirmation?.subject || '✅ Tiếp nhận phản ánh vi phạm tin rao #{{propertyId}} • {{siteName}}',
        {
          propertyId: newReport.propertyId,
          siteName: emailConfig?.signature?.companyName || 'Đất Biển Đà Nẵng'
        }
      );
      await dispatchEmail({
        to: newReport.reporterEmail,
        toName: newReport.reporterName,
        from: emailConfig?.fromEmail || 'cskh@datbiendanang.vn',
        fromName: emailConfig?.fromName || 'Đất Biển Đà Nẵng CSKH',
        subject: reporterSubject,
        htmlBody: reporterHtml,
        type: 'report_confirmation_reporter',
        metadata: { reportId: newReport.id, propertyId: newReport.propertyId }
      });
    }

    setEmailLogs(getEmailLogs());
    showToast(`Đã tiếp nhận phản ánh cho tin #${newReport.propertyId} và kích hoạt quy trình gửi email!`, 'success');
    return { success: true, report: newReport };
  };

  // Cập nhật trạng thái xử lý báo cáo trong Backend (Xác minh, Hạ tin, Bác bỏ)
  const updateReportStatus = async (reportId, newStatus, adminNote = '', shouldDelist = false) => {
    let affectedReport = null;

    setListingReports(prev => prev.map(r => {
      if (r.id === reportId) {
        affectedReport = {
          ...r,
          status: newStatus,
          adminNote: adminNote || r.adminNote,
          resolvedAt: new Date().toISOString()
        };
        return affectedReport;
      }
      return r;
    }));

    if (!affectedReport) return;
    const targetProperty = properties.find(p => p.id === affectedReport.propertyId);

    // Nếu chọn hạ tin (Delist) -> Tạm ẩn / Đổi trạng thái tin sang 'rejected'
    if (shouldDelist || newStatus === 'delisted') {
      if (targetProperty) {
        setProperties(prev => prev.map(p => {
          if (p.id === affectedReport.propertyId) {
            return {
              ...p,
              status: 'rejected',
              rejectionReason: adminNote || `Tin bị gỡ do vi phạm: ${REPORT_REASONS[affectedReport.reason]?.label || affectedReport.reason}`,
              delistedAt: new Date().toISOString()
            };
          }
          return p;
        }));

        // Gửi email thông báo gỡ tin tới chủ tin
        const authorEmail = targetProperty.author?.email || targetProperty.contactEmail;
        if (authorEmail) {
          const authorHtml = generateAuthorWarningEmailHtml({
            property: targetProperty,
            report: affectedReport,
            actionType: 'delisted',
            adminNote
          });
          const authorSubject = renderEmailTemplateString(
            emailConfig?.templates?.author_warning?.subject || '⚠️ [THÔNG BÁO] Tin đăng #{{propertyId}} vi phạm tiêu chuẩn • {{siteName}}',
            {
              propertyId: targetProperty.id,
              siteName: emailConfig?.signature?.companyName || 'Đất Biển Đà Nẵng'
            }
          );
          await dispatchEmail({
            to: authorEmail,
            toName: targetProperty.author?.name || targetProperty.contactName || 'Người đăng tin',
            from: emailConfig?.fromEmail || 'kiemduyet@datbiendanang.vn',
            fromName: emailConfig?.fromName || 'Ban Kiểm Duyệt Đất Biển Đà Nẵng',
            subject: authorSubject,
            htmlBody: authorHtml,
            type: 'author_warning_delist',
            metadata: { reportId, propertyId: targetProperty.id }
          });
        }
      }
    }

    // Gửi email thông báo kết quả xử lý cho người báo cáo (nếu có email)
    if (affectedReport.reporterEmail && (newStatus === 'delisted' || newStatus === 'verified' || newStatus === 'rejected')) {
      const resolutionHtml = generateResolutionEmailToReporterHtml({
        report: affectedReport,
        property: targetProperty || { id: affectedReport.propertyId, title: affectedReport.propertyTitle },
        actionTaken: newStatus,
        adminNote
      });
      const resSubject = renderEmailTemplateString(
        emailConfig?.templates?.report_resolution?.subject || '🎉 Kết quả xử lý phản ánh vi phạm tin rao #{{propertyId}} • {{siteName}}',
        {
          propertyId: affectedReport.propertyId,
          siteName: emailConfig?.signature?.companyName || 'Đất Biển Đà Nẵng'
        }
      );
      await dispatchEmail({
        to: affectedReport.reporterEmail,
        toName: affectedReport.reporterName,
        from: emailConfig?.fromEmail || 'cskh@datbiendanang.vn',
        fromName: emailConfig?.fromName || 'Đất Biển Đà Nẵng CSKH',
        subject: resSubject,
        htmlBody: resolutionHtml,
        type: 'report_resolution_reporter',
        metadata: { reportId, propertyId: affectedReport.propertyId }
      });
    }

    setEmailLogs(getEmailLogs());
    showToast(`Đã cập nhật xử lý báo cáo #${reportId} (${newStatus})!`, 'success');
  };

  // Xóa báo cáo khỏi danh sách
  const deleteListingReport = (reportId) => {
    setListingReports(prev => prev.filter(r => r.id !== reportId));
    showToast(`Đã xóa bản ghi báo cáo #${reportId}`, 'info');
  };

  // Xóa hàng loạt báo cáo vi phạm
  const deleteMultipleListingReports = (reportIds) => {
    if (!reportIds || reportIds.length === 0) return;
    const idsSet = new Set(reportIds);
    setListingReports(prev => prev.filter(r => !idsSet.has(r.id)));
    showToast(`Đã xóa thành công ${reportIds.length} báo cáo vi phạm!`, 'success');
  };

  // Xóa 1 thư khỏi nhật ký email
  const deleteEmailLog = (emailId) => {
    setEmailLogs(prev => prev.filter(m => m.id !== emailId));
    showToast(`Đã xóa thư #${emailId} khỏi nhật ký!`, 'info');
  };

  // Xóa hàng loạt thư khỏi nhật ký email
  const deleteMultipleEmailLogs = (emailIds) => {
    if (!emailIds || emailIds.length === 0) return;
    const idsSet = new Set(emailIds);
    setEmailLogs(prev => prev.filter(m => !idsSet.has(m.id)));
    showToast(`Đã xóa thành công ${emailIds.length} thư khỏi nhật ký!`, 'success');
  };

  // Gửi Email thủ công từ Quản trị viên
  const sendCustomEmail = async (emailData) => {
    const res = await dispatchEmail({
      from: emailConfig?.fromEmail || 'kiemduyet@datbiendanang.vn',
      fromName: emailConfig?.fromName || 'Ban Quản Trị Sàn Đất Biển Đà Nẵng',
      ...emailData
    });
    setEmailLogs(getEmailLogs());
    showToast(`Đã gửi email thành công tới ${emailData.to}!`, 'success');
    return res;
  };

  // Phát lại email xác nhận tiếp nhận phản ánh cho Người Báo Cáo
  const resendReportConfirmationEmail = async (reportId, overrideEmail = '') => {
    const report = listingReports.find(r => r.id === reportId);
    if (!report) {
      showToast('Không tìm thấy bản ghi báo cáo để phát lại email!', 'error');
      return { success: false, message: 'Báo cáo không tồn tại' };
    }

    const recipientEmail = (overrideEmail || report.reporterEmail || (report.contact?.includes('@') ? report.contact : '')).trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      showToast('Chưa có địa chỉ email hợp lệ để phát lại email xác nhận!', 'warning');
      return { success: false, message: 'Thiếu email người nhận' };
    }

    const targetProp = (properties || []).find(p => p.id === report.propertyId) || {
      id: report.propertyId,
      title: report.propertyTitle || 'Bất động sản'
    };

    // Cập nhật lại email người báo cáo nếu trước đó chưa lưu
    if (!report.reporterEmail || report.reporterEmail !== recipientEmail) {
      setListingReports(prev => {
        const updated = prev.map(r => r.id === reportId ? { ...r, reporterEmail: recipientEmail } : r);
        persistSettingToSupabase('bds_reported_listings', updated);
        return updated;
      });
    }

    const reporterHtml = generateReporterConfirmationEmailHtml({
      report: { ...report, reporterEmail: recipientEmail },
      property: targetProp
    });

    const res = await dispatchEmail({
      to: recipientEmail,
      toName: report.reporterName || 'Người gửi phản ánh',
      from: emailConfig?.fromEmail || 'cskh@datbiendanang.vn',
      fromName: emailConfig?.fromName || 'Đất Biển Đà Nẵng CSKH',
      subject: `✅ [PHÁT LẠI] Tiếp nhận phản ánh vi phạm tin rao #${report.propertyId} • ${emailConfig?.fromName || 'Đất Biển Đà Nẵng'}`,
      htmlBody: reporterHtml,
      type: 'report_confirmation_reporter',
      metadata: {
        reportId: report.id,
        propertyId: report.propertyId,
        isResend: true,
        resendAt: new Date().toISOString()
      }
    });

    setEmailLogs(getEmailLogs());
    showToast(`Đã phát lại email xác nhận thành công tới ${recipientEmail}!`, 'success');
    return { success: true, email: res.email };
  };

  // Phát lại bất kỳ email nào trong Email Logs
  const resendEmail = async (emailId) => {
    const logs = getEmailLogs();
    const targetEmail = logs.find(m => m.id === emailId);
    if (!targetEmail) {
      showToast('Không tìm thấy thư trong nhật ký email!', 'error');
      return { success: false };
    }

    const res = await dispatchEmail({
      to: targetEmail.to,
      toName: targetEmail.toName,
      from: (targetEmail.from === 'cskh@landmark.vn' || targetEmail.from === 'kiemduyet@landmark.vn' || targetEmail.from === 'cskh@datbiendanang.vn' || targetEmail.from === 'kiemduyet@datbiendanang.vn')
        ? (emailConfig?.fromEmail || targetEmail.from)
        : targetEmail.from,
      fromName: (targetEmail.fromName === 'Đất Biển Đà Nẵng CSKH' || targetEmail.fromName === 'BDS Landmark CSKH' || targetEmail.fromName === 'Ban Kiểm Duyệt Sàn Đất Biển Đà Nẵng' || targetEmail.fromName === 'Ban Kiểm Duyệt Sàn BDS Landmark' || targetEmail.fromName === 'Ban Kiểm Duyệt Đất Biển Đà Nẵng' || targetEmail.fromName === 'Ban Kiểm Duyệt BDS Landmark')
        ? (emailConfig?.fromName || targetEmail.fromName)
        : targetEmail.fromName,
      subject: targetEmail.subject.startsWith('✅ [PHÁT LẠI]') ? targetEmail.subject : `[PHÁT LẠI] ${targetEmail.subject}`,
      htmlBody: targetEmail.htmlBody,
      type: targetEmail.type,
      metadata: {
        ...targetEmail,
        isResend: true,
        originalEmailId: targetEmail.id,
        resendAt: new Date().toISOString()
      }
    });

    setEmailLogs(getEmailLogs());
    showToast(`Đã phát lại email tới ${targetEmail.to} thành công!`, 'success');
    return { success: true, email: res.email };
  };

  /**
   * Cộng tiền thưởng trực tiếp vào Ví Khuyến Mãi (bonusWalletBalance) của người dùng
   * Dùng cho Gamification, Điểm danh, Nhiệm vụ, Săn kho báu, Dự đoán giá & Affiliate
   * Đảm bảo lưu đồng thời vào State, LocalStorage, Supabase Cloud và server-db.json
   */
  const addBonusWalletBalance = (amount, reason = '', options = {}) => {
    const num = Number(amount);
    if (!num || num <= 0) return 0;

    const targetUser = currentUser || DEFAULT_GUEST_USER;
    const targetUserId = targetUser.id || 'guest';
    const currentBonus = Number(targetUser.bonusWalletBalance) || 0;
    const newBonus = currentBonus + num;

    // Hạn sử dụng: ưu tiên theo options.expiryDays, nếu không có lấy theo cấu hình quản trị hệ thống systemConfig.bonusExpiryDays, mặc định 30 ngày
    const systemExpiryDays = Number(systemConfig?.bonusExpiryDays) || 30;
    const expiryDays = Number(options.expiryDays) || systemExpiryDays;
    const expiryDateObj = options.expiresAt 
      ? new Date(options.expiresAt) 
      : new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    const newExpiresAt = expiryDateObj.toISOString();

    // Quản lý các gói tiền thưởng có hạn (bonusBatches)
    const currentBatches = Array.isArray(targetUser.bonusBatches) ? targetUser.bonusBatches : [];
    const newBatch = {
      id: `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: num,
      expiresAt: newExpiresAt,
      reason: reason || 'Tiền thưởng Ví Khuyến Mãi (Gamification)',
      createdAt: new Date().toISOString()
    };
    const nextBatches = [...currentBatches, newBatch];

    // Tính toán mốc hết hạn sớm nhất bằng getEarliestExpiringBonus
    const earliestInfo = getEarliestExpiringBonus({
      ...targetUser,
      bonusWalletBalance: newBonus,
      bonusBatches: nextBatches
    }, systemConfig);

    const updatedUser = {
      ...targetUser,
      bonusWalletBalance: newBonus,
      bonusBatches: nextBatches,
      bonusExpiresAt: earliestInfo?.expiresAt || newExpiresAt,
      earliestExpiringBonus: earliestInfo
    };

    // 1. Cập nhật state currentUser
    setCurrentUser(updatedUser);

    // 2. Cập nhật state usersList
    const nextUsers = (usersList || []).map(u => String(u.id) === String(targetUserId) ? updatedUser : u);
    setUsersList(nextUsers);

    // 3. Ghi nhận giao dịch thưởng vào transactions
    const newTxn = {
      id: `TXN-BONUS-${Date.now()}`,
      userId: targetUserId,
      userName: updatedUser.name || 'Người dùng',
      type: 'bonus_reward',
      title: reason || 'Tiền thưởng Ví Khuyến Mãi (Gamification)',
      amount: num,
      balanceAfter: newBonus,
      walletType: 'bonus',
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: 'system_reward'
    };
    setTransactions(prev => [newTxn, ...(prev || [])]);

    // 4. Lưu ngay vào LocalStorage để F5 không bao giờ mất
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`bds_user_bonus_${targetUserId}`, String(newBonus));
        localStorage.setItem(`bds_user_bonus_exp_${targetUserId}`, JSON.stringify(earliestInfo));
        localStorage.setItem('bds_current_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('bds_bonus_wallet_updated', {
          detail: { 
            userId: targetUserId, 
            bonusWalletBalance: newBonus, 
            addedAmount: num, 
            reason,
            earliestExpiringBonus: earliestInfo
          }
        }));
      } catch (e) {}
    }

    // 5. Nếu không phải khách vãng lai, đồng bộ lên Supabase Cloud & server-db.json
    if (targetUserId !== 'guest') {
      upsertSupabaseProfile(updatedUser).catch(console.warn);
      persistSettingToSupabase('bds_users_list', nextUsers).catch(console.warn);
      persistSettingToSupabase('bds_transactions', [newTxn, ...(transactions || [])]).catch(console.warn);

      try {
        fetch('/api/db-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bds_users_list: nextUsers,
            bds_transactions: [newTxn, ...(transactions || []).slice(0, 50)]
          })
        }).catch(console.warn);
      } catch (e) {}
    }

    return newBonus;
  };

  return (
    <RealEstateContext.Provider
      value={{
        addBonusWalletBalance,
        currentView,
        setCurrentView,
        properties,
        favorites,
        compareList: [],
        currentUser,
        isHydrated,
        usersList,
        vipPackages,
        transactions,
        navMenuItems,
        toast,
        activeModal,
        selectedPropertyDetail,
        selectedPropertyForVip,
        preselectedListingType,
        setPreselectedListingType,
        setActiveModal,
        setSelectedPropertyDetail,
        setSelectedPropertyForVip,
        showToast,
        refetchData: (isSilent = false) => fetchLatestDataFromSupabase(isSilent),
        switchUserRole,
        navigateToProperty,
        toggleFavorite,
        toggleCompare: () => {},
        removeCompare: () => {},
        clearCompare: () => {},
        bumpListing,
        upgradeVip,
        addProperty,
        approveProperty,
        publishPropertyNow,
        verifyProperty,
        submitPropertyVerification,
        rejectProperty,
        deleteProperty,
        moveToTrash,
        restoreProperty,
        permanentDeleteProperty,
        emptyTrash,
        runDatabaseCleanup,
        updateProperty,
        updateMultipleProperties,
        renewProperty,
        getPropertyExpirationInfo,
        depositWallet,
        adjustUserBalance,
        toggleUserVerification,
        updateUser,
        assignUserMembership,
        moveUserToTrash,
        restoreUserFromTrash,
        permanentDeleteUser,
        emptyUserTrash,
        updateVipPackagePrice,
        updateAllVipPackagePrices,
        resetToMockData,
        openPropertyDetail,
        loginUser,
        registerUser,
        updateUserProfile,
        submitKycVerification,
        logoutUser,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemVisibility,
        moveMenuItem,
        addSubMenuItem,
        deleteSubMenuItem,
        resetNavMenu,
        headerConfig,
        updateHeaderConfig,
        resetHeaderConfig,
        PRESET_LOGOS,
        DEFAULT_SOCIAL_LINKS,
        paymentConfig,
        updatePaymentConfig,
        resetPaymentConfig,
        VIETNAM_BANKS,
        membershipPackages,
        subscribeMembership,
        isMembershipActive,
        toggleMembershipAutoRenew,
        updateMembershipPackage,
        addMembershipPackage,
        deleteMembershipPackage,
        resetMembershipPackages,
        updateCommonVoucherPrices,
        importAllConfig,
        systemConfig,
        updateSystemConfig,
        resetSystemConfig,
        dailyFreeListingLimit: typeof systemConfig?.dailyFreeListingLimit === 'number'
          ? systemConfig.dailyFreeListingLimit
          : ((vipPackages.find(p => p.id === 'normal')?.dailyFreeLimit) ?? 5),
        updateDailyFreeListingLimit,
        discount30DaysPercent: typeof systemConfig?.discount30DaysPercent === 'number'
          ? systemConfig.discount30DaysPercent
          : 25,
        updateDiscount30DaysPercent,
        getTodayFreeListingCount,
        checkDailyFreeListingQuota,
        bumpServicePrice,
        updateBumpServicePrice,
        BUMP_SERVICE_PRICE: bumpServicePrice ?? BUMP_SERVICE_PRICE ?? 10000,
        NORMAL_PUBLISH_PRICE,
        listingReports,
        emailLogs,
        addListingReport,
        updateReportStatus,
        deleteListingReport,
        deleteMultipleListingReports,
        deleteEmailLog,
        deleteMultipleEmailLogs,
        sendCustomEmail,
        resendReportConfirmationEmail,
        resendEmail,
        singleConfig,
        updateSingleConfig,
        resetSingleConfig,
        rewardsConfig,
        updateRewardsConfig,
        resetRewardsConfig,
        DEFAULT_REWARDS_CONFIG,
        emailConfig,
        updateEmailConfig,
        resetEmailConfig,
        updateEmailTemplate,
        resetEmailTemplate,
        resetAllEmailTemplates,
        sendTestEmail,
        verifySmtpConnection,
        refreshUsersListFromServer,
        activateUserManually,
        resendUserVerificationEmail,
        appointmentsList,
        inAppNotifications,
        bookAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        markNotificationAsRead,
        footerConfig,
        updateFooterConfig,
        DEFAULT_FOOTER_CONFIG
      }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};

export const useRealEstate = () => useContext(RealEstateContext);
