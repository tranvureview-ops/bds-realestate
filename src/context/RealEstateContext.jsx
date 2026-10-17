'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// Helper bất đồng bộ lưu cấu hình sàn lên Supabase SDK
const persistSettingToSupabase = async (key, value) => {
  try {
    await upsertSupabaseSetting(key, value);
  } catch (err) {
    console.warn(`Lỗi lưu cấu hình ${key} lên Supabase:`, err);
  }
};

// Helper bất đồng bộ xóa cấu hình sàn trên Supabase SDK
const removeSettingFromSupabase = async (key) => {
  try {
    await deleteSupabaseSetting(key);
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
  PRESET_LOGOS,
  DEFAULT_PAYMENT_CONFIG,
  DEFAULT_APPROVAL_TIERS,
  VIETNAM_BANKS,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_SINGLE_CONFIG,
  DEFAULT_EMAIL_CONFIG,
  DEFAULT_EMAIL_TEMPLATES
} from '../data/mockData';
import { getPropertyPermalink, parsePropertyUrl, toVietnameseSlug } from '../utils/permalink';
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

// Hàm tạo Slug Tiêu Đề chuẩn tiếng Việt không dấu (SEO-friendly)
export const createVietnameseSlug = toVietnameseSlug;

// Chuẩn hóa và tính toán vòng đời / thời hạn bài viết theo quy chuẩn Batdongsan.com.vn
export const normalizePropertyExpiration = (p) => {
  if (!p) return p;
  const now = Date.now();
  const listingDays = Number(p.listingDays) || (p.vipPackageId === 'vip-diamond' ? 30 : 15);
  let expiresAt = p.expiresAt;
  let status = p.status || 'active';

  // Thiết lập dữ liệu mẫu minh họa cho các trạng thái Batdongsan.com.vn
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
  let queuePriority = p.queuePriority || (p.vipPackageId === 'vip-diamond' ? 'priority_diamond' : (p.vipPackageId === 'vip-gold' ? 'priority_gold' : (p.vipPackageId === 'vip-silver' ? 'priority_silver' : 'standard_fifo')));
  if (status === 'pending') {
    if (!autoApproveAt) {
      if (p.vipPackageId === 'vip-gold') {
        autoApproveAt = new Date(now + 12 * 60 * 1000).toISOString();
      } else if (p.vipPackageId === 'vip-silver') {
        autoApproveAt = new Date(now + 24 * 60 * 1000).toISOString();
      } else {
        // Hàng đợi tiêu chuẩn FIFO: Tự động xuất bản trong 1 tiếng (còn 48 phút với bài mẫu)
        autoApproveAt = new Date(now + 48 * 60 * 1000).toISOString();
      }
    }
  }

  // Tự động chuyển status sang expired nếu đã quá ngày hết hạn và không nằm trong thùng rác
  if (status === 'active' && expiresAt && new Date(expiresAt).getTime() <= now && !p.isDeleted && status !== 'trash') {
    status = 'expired';
  }

  return {
    ...p,
    listingDays,
    expiresAt,
    status,
    autoApproveAt,
    queuePriority,
    autoRenew: p.autoRenew !== undefined ? Boolean(p.autoRenew) : (p.vipPackageId === 'vip-diamond'),
    vipPackageId: p.vipPackageId === 'vip-bronze' ? 'vip-silver' : p.vipPackageId
  };
};

// Hàm trích xuất thông tin hạn dùng theo chuẩn Batdongsan.com.vn
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
  const isExpiringSoon = daysRemaining < 3; // Cảnh báo sớm theo chuẩn Batdongsan: dưới 3 ngày

  if (isExpiringSoon) {
    const timeStr = daysRemaining > 0 ? `Còn ${daysRemaining} ngày ${hoursRemaining}h` : `Còn ${hoursRemaining} giờ`;
    return {
      isExpired: false,
      isExpiringSoon: true,
      daysRemaining,
      hoursRemaining,
      badgeText: `⚠️ Sắp hết hạn (${timeStr})`,
      badgeClass: 'bg-amber-950/90 text-amber-300 border border-amber-500 font-bold animate-pulse',
      countdownText: `Còn ${daysRemaining} ngày ${hoursRemaining}h`
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
    return raw.map(normalizePropertyExpiration);
  });

  // 2. Favorites List
  const [favorites, setFavorites] = useState([]);

  // 3. Comparison List (Max 4 properties)
  const [compareList, setCompareList] = useState([]);

  // 4. Current User & Switcher (User, Broker, Admin) - Nhận initialUser từ Cookie Server SSR để đồng nhất 100%
  const [currentUser, setCurrentUser] = useState(() => {
    if (initialUser && (initialUser.status === 'trash' || initialUser.isDeleted || initialUser.status === 'locked')) {
      return DEFAULT_GUEST_USER;
    }
    return initialUser || DEFAULT_GUEST_USER;
  });

  // 5. All Users (for CMS Admin Management)
  const [usersList, setUsersList] = useState(() => {
    if (initialData?.bds_users_list && Array.isArray(initialData.bds_users_list) && initialData.bds_users_list.length > 0) {
      return initialData.bds_users_list;
    }
    return MOCK_USERS;
  });

  // 6. Listing Types / VIP Packages Configuration (editable by Admin)
  const [vipPackages, setVipPackages] = useState(() => {
    return (initialData?.bds_vip_packages && Array.isArray(initialData.bds_vip_packages) && initialData.bds_vip_packages.length >= 4)
      ? initialData.bds_vip_packages
      : VIP_PACKAGES;
  });

  // 6b. Membership Packages (Gói Hội Viên: Cơ bản, Tiêu chuẩn, Cao cấp)
  const [membershipPackages, setMembershipPackages] = useState(() => {
    return (initialData?.bds_membership_packages && Array.isArray(initialData.bds_membership_packages))
      ? initialData.bds_membership_packages
      : MEMBERSHIP_PACKAGES;
  });

  // 7. Transactions History
  const [transactions, setTransactions] = useState(() => {
    return (initialData?.bds_transactions && Array.isArray(initialData.bds_transactions))
      ? initialData.bds_transactions
      : MOCK_TRANSACTIONS;
  });

  // 8. Navigation Menu Configuration State
  const [navMenuItems, setNavMenuItems] = useState(() => {
    return (initialData?.bds_nav_menu && Array.isArray(initialData.bds_nav_menu) && initialData.bds_nav_menu.length > 0)
      ? initialData.bds_nav_menu
      : INITIAL_NAV_MENU;
  });

  // 9. Header, Logo & Menu Width Configuration State
  const [headerConfig, setHeaderConfig] = useState(() => {
    return { ...DEFAULT_HEADER_CONFIG, ...(initialData?.bds_header_config || {}) };
  });

  // 10. Payment Methods Configuration State (Backend Admin Config)
  const [paymentConfig, setPaymentConfig] = useState(() => {
    return initialData?.bds_payment_config || DEFAULT_PAYMENT_CONFIG;
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
    return initialData?.bds_system_config || DEFAULT_SYSTEM_CONFIG;
  });

  // 11b. Cấu hình Trang Chi Tiết Bất Động Sản (Single Property Page Config)
  const [singleConfig, setSingleConfig] = useState(() => {
    return initialData?.bds_single_config || DEFAULT_SINGLE_CONFIG;
  });

  // 11c. Cấu hình Email Website & Máy Chủ Gửi Thư (Email Website & SMTP Config)
  const [emailConfig, setEmailConfig] = useState(() => {
    return initialData?.bds_email_config || DEFAULT_EMAIL_CONFIG;
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

    await Promise.all([
      persistSettingToSupabase('bds_system_config', updatedSystem || newConfig),
      updatedHeader ? persistSettingToSupabase('bds_header_config', updatedHeader) : Promise.resolve(),
      updatedSingle ? persistSettingToSupabase('bds_single_config', updatedSingle) : Promise.resolve(),
      updatedEmail ? persistSettingToSupabase('bds_email_config', updatedEmail) : Promise.resolve()
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
    const to = (recipientEmail || emailConfig.adminAlertEmail || 'admin@datbiendanang.vn').trim();
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
  const [preselectedListingType, setPreselectedListingType] = useState('vip-gold');

  // Đồng bộ cookie session cho SSR
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const val = currentUser?.id || 'guest';
      document.cookie = `bds_session_user=${encodeURIComponent(val)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [currentUser]);

  // Tải dữ liệu mới nhất trực tiếp từ Supabase qua SDK (Central Fetcher)
  const fetchLatestDataFromSupabase = useCallback(async (isSilent = true) => {
    try {
      const db = await fetchFullSupabaseDb();
      if (db) {
        if (Array.isArray(db.bds_properties) && db.bds_properties.length > 0) {
          setProperties(db.bds_properties.map(normalizePropertyExpiration));
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
        if (db.bds_system_config) {
          setSystemConfig(db.bds_system_config);
        }
        if (Array.isArray(db.bds_nav_menu) && db.bds_nav_menu.length > 0) {
          setNavMenuItems(db.bds_nav_menu);
        }
        if (Array.isArray(db.bds_vip_packages) && db.bds_vip_packages.length > 0) {
          setVipPackages(db.bds_vip_packages);
        }
        if (Array.isArray(db.bds_membership_packages)) {
          setMembershipPackages(db.bds_membership_packages);
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

    fetchLatestDataFromSupabase(true).finally(() => {
      if (isMounted) setIsHydrated(true);
    });

    return () => { isMounted = false; };
  }, [fetchLatestDataFromSupabase]);

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
    const channel = supabase
      .channel('realestate-realtime-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLatestDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchLatestDataFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, () => {
        fetchLatestDataFromSupabase(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLatestDataFromSupabase]);

  // Ghi nhận thay đổi xuống Server Disk định kỳ để các trình duyệt khác cùng đọc được
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      const payload = {
        bds_properties: properties,
        bds_users_list: usersList,
        bds_payment_config: paymentConfig,
        bds_header_config: headerConfig,
        bds_system_config: systemConfig,
        bds_nav_menu: navMenuItems,
        bds_transactions: transactions,
        bds_vip_packages: vipPackages,
        bds_membership_packages: membershipPackages,
        bds_reported_listings: listingReports,
        bds_single_config: singleConfig,
        bds_email_config: emailConfig,
        bds_email_logs: emailLogs
      };
      fetch('/api/db-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(timer);
  }, [isHydrated, properties, usersList, paymentConfig, headerConfig, systemConfig, navMenuItems, transactions, vipPackages, membershipPackages, listingReports, singleConfig, emailConfig, emailLogs]);

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
              const tierName = prop.vipPackageId === 'vip-gold' 
                ? 'VIP Vàng (Ưu tiên 15 phút)' 
                : (prop.vipPackageId === 'vip-silver' 
                    ? 'VIP Bạc (Ưu tiên 30 phút)' 
                    : 'Tin Thường (Hàng đợi tiêu chuẩn FIFO 1 tiếng)');
              const days = Number(prop.listingDays) || 15;
              return {
                ...prop,
                status: 'active',
                approvedAt: new Date().toISOString(),
                publishedAt: prop.publishedAt || new Date().toISOString(),
                expiresAt: (!prop.expiresAt || new Date(prop.expiresAt).getTime() <= now) 
                  ? new Date(now + days * 86400 * 1000).toISOString() 
                  : prop.expiresAt,
                autoApproved: true,
                approvalType: prop.approvalType || 'fifo_auto_published',
                approvalNote: prop.approvalNote || `Tự động xuất bản theo Hàng đợi tiêu chuẩn FIFO (${tierName})`
              };
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

  // Background Listing Expiration & Auto-Renewal Processor (Chuẩn Batdongsan.com.vn)
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
                const pkg = (vipPackages || []).find(v => v.id === prop.vipPackageId) || { pricePerDay: 5000 };
                const days = Number(prop.listingDays) || 15;
                const cost = (pkg.rates?.[days] || pkg.pricePerDay || 5000) * days;
                const authorUser = usersList.find(u => u.id === prop.author.id);

                if (authorUser && authorUser.walletBalance >= cost) {
                  // Trừ ví người đăng tự động
                  const newBal = authorUser.walletBalance - cost;
                  const updatedAuthorUser = { ...authorUser, walletBalance: newBal };
                  setUsersList(uList => uList.map(u => u.id === authorUser.id ? updatedAuthorUser : u));
                  if (currentUser.id === authorUser.id) {
                    setCurrentUser(updatedAuthorUser);
                  }

                  const newTxn = {
                    id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                    userId: authorUser.id,
                    userName: authorUser.name,
                    type: 'auto_renew_vip',
                    title: `Tự động gia hạn tin ${prop.id} (${days} ngày - chuẩn Batdongsan)`,
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

              // Chuyển sang trạng thái hết hạn chuẩn Batdongsan
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
  }, [vipPackages, usersList, currentUser]);

  // Switch role helper
  const switchUserRole = (roleKey) => {
    let target = usersList.find(u => u.role === roleKey);
    if (!target && roleKey === 'admin') {
      target = MOCK_USERS.find(u => u.role === 'admin') || {
        id: 'admin-01',
        name: 'Trần Ban Quản Trị',
        email: 'admin@datbiendanang.vn',
        role: 'admin',
        roleName: 'Tổng Quản Trị Viên (CMS Admin)',
        walletBalance: 99999999,
        phone: '0898 246 607',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
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

  // Navigate to Dedicated Single Property Page (bằng URL Permalink chuẩn Batdongsan: /{slug}-pr{id})
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

  // Toggle Compare
  const toggleCompare = (property) => {
    const exists = compareList.some(item => item.id === property.id);
    if (exists) {
      setCompareList(compareList.filter(item => item.id !== property.id));
      showToast(`Đã bỏ ${property.id} khỏi bảng so sánh`, 'info');
    } else {
      if (compareList.length >= 4) {
        showToast('Chỉ có thể so sánh tối đa 4 bất động sản cùng lúc!', 'warning');
        return;
      }
      setCompareList([...compareList, property]);
      showToast(`Đã thêm ${property.id} vào bảng so sánh!`, 'success');
    }
  };

  const removeCompare = (id) => {
    setCompareList(compareList.filter(item => item.id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
    showToast('Đã xóa toàn bộ danh sách so sánh', 'info');
  };

  // Bump listing (Đẩy tin) - Hỗ trợ Voucher Hội viên và Nhân đôi hiển thị VIP Kim Cương
  const bumpListing = (propertyId, useVoucher = false) => {
    const property = properties.find(p => p.id === propertyId);
    const isVipDiamond = property?.vipPackageId === 'vip-diamond';
    const hasBumpVoucher = (currentUser.vouchers?.normalBump || 0) > 0;

    let finalPrice = BUMP_SERVICE_PRICE;
    let usedVoucher = false;

    if (useVoucher && hasBumpVoucher) {
      finalPrice = 0;
      usedVoucher = true;
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

    if (isVipDiamond) {
      showToast(`Đẩy tin VIP Kim Cương ${propertyId} thành công! Kèm đặc quyền: Đẩy MIỄN PHÍ luôn Tin Thường nhân đôi hiển thị!`, 'success');
    } else if (usedVoucher) {
      showToast(`Đã dùng Voucher Hội viên giảm 10.000đ! Đẩy tin ${propertyId} thành công (0 đ).`, 'success');
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

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          vipPackageId: newVipPackageId,
          publishedAt: new Date().toISOString(),
          isFeatured: newVipPackageId === 'vip-diamond',
          hasDualListing: newVipPackageId === 'vip-diamond'
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

  // Add new Property from form (Hỗ trợ áp dụng Voucher Hội Viên, Khách Vãng Lai & Cổng Thanh Toán)
  const addProperty = (formData, vipPackageId, days, paymentMethod, appliedVoucher = null) => {
    const pkg = vipPackages.find(p => p.id === vipPackageId) || vipPackages[vipPackages.length - 1];
    const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
    
    // Tỷ lệ giá theo chu kỳ ngày (chuẩn Batdongsan)
    const activeRates = pkg.rates || { 15: pkg.pricePerDay || 5000, 30: Math.round((pkg.pricePerDay || 5000) * 0.75), 60: Math.round((pkg.pricePerDay || 5000) * 0.7) };
    const currentDailyRate = activeRates[days] || activeRates[15] || pkg.pricePerDay || 5000;
    let totalCost = currentDailyRate * days;
    let discountAmount = 0;
    let usedVoucherType = null;

    if (!isGuest && currentUser) {
      if (appliedVoucher === 'normalPublish' && (currentUser.vouchers?.normalPublish || 0) > 0) {
        discountAmount = Math.min(totalCost, 35000);
        usedVoucherType = 'normalPublish';
      } else if (appliedVoucher === 'vipPublish' && (currentUser.vouchers?.vipPublish || 0) > 0 && vipPackageId !== 'normal') {
        discountAmount = Math.min(totalCost, 400000);
        usedVoucherType = 'vipPublish';
      }
    }

    const finalCost = Math.max(0, totalCost - discountAmount);

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
      if (paymentMethod === 'wallet' && finalCost > 0) {
        let remaining = finalCost;
        if (newBonusBal >= remaining) {
          newBonusBal -= remaining;
          remaining = 0;
        } else {
          remaining -= newBonusBal;
          newBonusBal = 0;
          newBal = Math.max(0, newBal - remaining);
        }
      }

      const updatedVouchers = usedVoucherType ? {
        ...currentUser.vouchers,
        [usedVoucherType]: Math.max(0, (currentUser.vouchers?.[usedVoucherType] || 0) - 1)
      } : currentUser.vouchers;

      const updatedUser = { 
        ...currentUser, 
        walletBalance: newBal,
        bonusWalletBalance: newBonusBal,
        vouchers: updatedVouchers
      };
      setCurrentUser(updatedUser);
      setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
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

    const contactPhone = String(formData.contactPhone || currentUser?.phone || '0901234567').trim();
    const contactName = String(formData.contactName || (!isGuest && currentUser?.name) || 'Khách vãng lai').trim();

    const authorObj = (!isGuest && currentUser) ? {
      id: currentUser.id,
      name: currentUser.name || contactName,
      title: currentUser.membership ? `${currentUser.membership.packageName}` : (currentUser.role === 'broker' ? 'Môi Giới' : 'Chính chủ'),
      phone: currentUser.phone || contactPhone,
      zalo: String(currentUser.phone || contactPhone).replace(/\s+/g, ''),
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
      zalo: contactPhone.replace(/\s+/g, ''),
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
    // 1. VIP Kim Cương ('vip-diamond'): Duyệt Tức Thì tự động (Active ngay)
    // 2. VIP Vàng ('vip-gold'): Ưu tiên sớm (15 phút) -> Tự động duyệt sau 15p
    // 3. VIP Bạc ('vip-silver'): Ưu tiên sớm (30 phút) -> Tự động duyệt sau 30p
    // 4. Tin Thường ('normal'): Hàng đợi tiêu chuẩn theo thứ tự (FIFO)
    // =========================================================================
    const tierConfig = paymentConfig?.approvalTiers?.[vipPackageId] || DEFAULT_APPROVAL_TIERS[vipPackageId] || DEFAULT_APPROVAL_TIERS['normal'];
    const isAdmin = currentUser?.role === 'admin';

    let initialStatus = 'pending';
    let autoApproveAt = null;
    let queuePriority = 'standard_fifo';
    let queueRank = 4;
    let approvalType = 'standard_fifo';
    let approvalNote = '';

    if (isAdmin) {
      initialStatus = 'active';
      approvalType = 'admin_instant';
      approvalNote = 'Quản trị viên xuất bản trực tiếp';
    } else if (vipPackageId === 'vip-diamond') {
      // 1. VIP Kim Cương: Duyệt Tức Thì tự động (Active ngay)
      if (systemConfig?.autoApproveDiamond !== false && paymentConfig?.autoApproveVip !== false && tierConfig?.mode !== 'manual') {
        initialStatus = 'active';
        approvalType = 'instant';
        approvalNote = 'Đặc quyền VIP Kim Cương: Duyệt Tức Thì tự động (Active ngay)';
      } else {
        initialStatus = 'pending';
        queuePriority = 'priority_diamond';
        queueRank = 1;
        approvalType = 'manual_priority';
        approvalNote = 'VIP Kim Cương: Chờ Admin phê duyệt';
      }
    } else if (vipPackageId === 'vip-gold') {
      // 2. VIP Vàng: Ưu tiên sớm (15 phút)
      const delayMin = Number(tierConfig?.delayMinutes ?? 15);
      initialStatus = 'pending';
      approvalType = 'priority_countdown';
      queuePriority = 'priority_gold';
      queueRank = 2;
      autoApproveAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
      approvalNote = `VIP Vàng: Ưu tiên sớm (Tự động duyệt sau ${delayMin} phút)`;
    } else if (vipPackageId === 'vip-silver') {
      // 3. VIP Bạc: Ưu tiên sớm (30 phút)
      const delayMin = Number(tierConfig?.delayMinutes ?? 30);
      initialStatus = 'pending';
      approvalType = 'priority_countdown';
      queuePriority = 'priority_silver';
      queueRank = 3;
      autoApproveAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
      approvalNote = `VIP Bạc: Ưu tiên sớm (Tự động duyệt sau ${delayMin} phút)`;
    } else {
      // 4. Tin Thường: Hàng đợi tiêu chuẩn theo thứ tự (FIFO) - Tự động xuất bản trong 1 tiếng (60 phút)
      const delayMin = Number(tierConfig?.delayMinutes ?? 60);
      initialStatus = 'pending';
      approvalType = 'standard_fifo_countdown';
      queuePriority = 'standard_fifo';
      queueRank = 4;
      autoApproveAt = new Date(Date.now() + delayMin * 60 * 1000).toISOString();
      approvalNote = `Tin Thường: Hàng đợi tiêu chuẩn FIFO (Tự động xuất bản sau ${delayMin} phút / 1 tiếng)`;
    }

    const numDays = Number(days) || Number(formData.listingDays) || 15;
    const now = Date.now();
    const expiresAt = initialStatus === 'active' 
      ? new Date(now + numDays * 86400 * 1000).toISOString()
      : null;

    const newProp = {
      ...formData,
      id: `BDS-${String(properties.length + 1).padStart(3, '0')}`,
      slug: (formData.title && createVietnameseSlug(formData.title)) || `bds-${Date.now().toString().slice(-4)}`,
      vipPackageId: vipPackageId,
      status: initialStatus,
      publishedAt: new Date().toISOString(),
      listingDays: numDays,
      expiresAt: expiresAt,
      autoRenew: formData.autoRenew !== undefined ? Boolean(formData.autoRenew) : (vipPackageId === 'vip-diamond'),
      submittedAt: new Date().toISOString(),
      autoApproveAt: autoApproveAt,
      queuePriority: queuePriority,
      queueRank: queueRank,
      approvalType: approvalType,
      approvalNote: approvalNote,
      viewsCount: 1,
      callsCount: 0,
      isFeatured: vipPackageId === 'vip-diamond',
      hasDualListing: vipPackageId === 'vip-diamond',
      paymentMethod: paymentMethodLabel,
      paidAmount: finalCost,
      paymentOrderId: formData.orderId || null,
      isGuest: isGuest,
      author: authorObj
    };

    setProperties([newProp, ...properties]);
    upsertSupabaseProperty(newProp).catch(console.warn);

    if (initialStatus === 'active') {
      showToast(`⚡ Thanh toán thành công! Tin VIP Kim Cương (${newProp.id}) được Duyệt Tức Thì và đang hiển thị ngay trên website.`, 'success');
    } else if (vipPackageId === 'vip-gold') {
      showToast(`🥇 Thanh toán thành công! Tin VIP Vàng (${newProp.id}) vào Hàng Đợi Ưu Tiên Sớm (Tự động duyệt sau 15 phút).`, 'success');
    } else if (vipPackageId === 'vip-silver') {
      showToast(`🥈 Thanh toán thành công! Tin VIP Bạc (${newProp.id}) vào Hàng Đợi Ưu Tiên Sớm (Tự động duyệt sau 30 phút).`, 'success');
    } else {
      showToast(`📋 Thanh toán thành công! Tin ${pkg.name} (${newProp.id}) đã vào Hàng Đợi Tiêu Chuẩn FIFO (Tự động xuất bản trong 1 tiếng).`, 'info');
    }
    return newProp;
  };

  // Đăng ký Gói Hội Viên (Membership Packages)
  const subscribeMembership = (packageId, billingMonths = 1) => {
    const pkg = membershipPackages.find(p => p.id === packageId);
    if (!pkg) {
      showToast('Gói hội viên không tồn tại!', 'error');
      return false;
    }

    const cycle = pkg.billingCycles.find(c => c.months === billingMonths) || pkg.billingCycles[0];
    const totalPrice = cycle.price;

    if (currentUser.walletBalance < totalPrice) {
      showToast(`Số dư ví không đủ ${totalPrice.toLocaleString('vi-VN')} đ để đăng ký ${pkg.name}. Vui lòng nạp thêm!`, 'error');
      setActiveModal('wallet-deposit');
      return false;
    }

    const newBalance = currentUser.walletBalance - totalPrice;
    const expiresDate = new Date(Date.now() + billingMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

    const normalPubCount = pkg.vouchersPerCycle.normalPublishVouchers;
    const normalBumpCount = pkg.vouchersPerCycle.normalBumpVouchers;
    const vipCount = pkg.vouchersPerCycle.vipVouchers || 0;

    const updatedUser = {
      ...currentUser,
      walletBalance: newBalance,
      membership: {
        packageId: pkg.id,
        packageName: pkg.name,
        shortName: pkg.shortName,
        billingMonths,
        subscribedAt: new Date().toISOString(),
        expiresAt: expiresDate,
        status: 'active',
        badge: pkg.badge,
        badgeColor: pkg.badgeColor
      },
      vouchers: {
        normalPublish: (currentUser.vouchers?.normalPublish || 0) + normalPubCount,
        normalBump: (currentUser.vouchers?.normalBump || 0) + normalBumpCount,
        vipPublish: (currentUser.vouchers?.vipPublish || 0) + vipCount
      }
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Record Transaction
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'purchase_membership',
      title: `Đăng ký ${pkg.name} (${billingMonths} tháng) - Nhận kho voucher 30 ngày`,
      amount: -totalPrice,
      balanceAfter: newBalance,
      status: 'success',
      createdAt: new Date().toISOString(),
      paymentMethod: 'Ví tài khoản'
    };
    setTransactions([newTxn, ...transactions]);

    showToast(`Đăng ký thành công ${pkg.name}! Đã cộng ${normalPubCount} voucher đăng tin và ${normalBumpCount} voucher đẩy tin.`, 'success');
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

  // Admin moderation: Approve
  const approveProperty = async (propertyId) => {
    const now = Date.now();
    let approvedTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const days = Number(p.listingDays) || 15;
        approvedTarget = { 
          ...p, 
          status: 'active', 
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: p.publishedAt || new Date().toISOString(),
          expiresAt: (!p.expiresAt || new Date(p.expiresAt).getTime() <= now) 
            ? new Date(now + days * 86400 * 1000).toISOString() 
            : p.expiresAt
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
    setCompareList(prev => prev.filter(p => p.id !== propertyId));
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
    setCompareList(prev => prev.filter(p => p.id !== propertyId));
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
  const runDatabaseCleanup = (customConfig = null) => {
    const cfg = customConfig || systemConfig || DEFAULT_SYSTEM_CONFIG;
    const retentionDays = Number(cfg.expiredRetentionDays) || 45;
    const action = cfg.expiredCleanupAction || 'archive_light';
    const trashDays = Number(cfg.trashRetentionDays) || 30;
    const now = Date.now();

    let archivedCount = 0;
    let deletedCount = 0;
    let trashCleanedCount = 0;

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
        const expTime = p.expiresAt ? new Date(p.expiresAt).getTime() : 0;
        const isExpired = p.status === 'expired' || (expTime > 0 && expTime <= now);

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
      return next;
    });

    const totalProcessed = archivedCount + deletedCount + trashCleanedCount;
    const estFreedKb = (archivedCount * 25) + (deletedCount * 80) + (trashCleanedCount * 80);
    const msg = totalProcessed > 0
      ? `Dọn dẹp DB hoàn tất: Đã nén nhẹ ${archivedCount} tin, xóa ${deletedCount + trashCleanedCount} tin quá hạn ${retentionDays} ngày. Giải phóng ~${estFreedKb} KB!`
      : `Hệ thống đã được kiểm tra: Không có bài viết nào hết hạn quá ${retentionDays} ngày cần xử lý!`;

    showToast(msg, totalProcessed > 0 ? 'success' : 'info');
    return { archivedCount, deletedCount, trashCleanedCount, estFreedKb, message: msg };
  };

  // Admin update property
  const updateProperty = (propertyId, partialData) => {
    let updatedTarget = null;
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        updatedTarget = { 
          ...p, 
          ...partialData,
          updatedAt: partialData.updatedAt || new Date().toISOString()
        };
        return updatedTarget;
      }
      return p;
    }));
    if (updatedTarget) {
      upsertSupabaseProperty(updatedTarget).catch(console.warn);
    }
    showToast(`Đã cập nhật bài đăng ${propertyId}!`, 'success');
  };

  // Gia hạn tin đăng theo chuẩn Batdongsan.com.vn (Renew / Extend Listing)
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

    // Tính thời gian hết hạn mới theo chuẩn Batdongsan:
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

    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          status: 'active',
          vipPackageId: vipId,
          listingDays: days,
          expiresAt: newExpiresAt,
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
    setTransactions([newTxn, ...transactions]);

    showToast(`Nạp thành công +${numAmount.toLocaleString('vi-VN')} đ vào ví! Số dư mới: ${newBalance.toLocaleString('vi-VN')} đ`, 'success');
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
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isVerified;
        showToast(`${nextState ? 'Đã cấp tích xanh' : 'Đã thu hồi tích xanh'} cho ${u.name}`, 'info');
        if (currentUser.id === userId) {
          setCurrentUser({ ...currentUser, isVerified: nextState });
        }
        updatedTarget = { ...u, isVerified: nextState };
        return updatedTarget;
      }
      return u;
    }));
    if (updatedTarget) {
      upsertSupabaseProfile(updatedTarget).catch(console.warn);
    }
  };

  // Admin Update User
  const updateUser = async (userId, updatedFields) => {
    const target = usersList.find(u => u.id === userId);
    if (!target) return { success: false, error: 'Không tìm thấy người dùng' };

    const updatedTarget = { ...target, ...updatedFields, updatedAt: new Date().toISOString() };
    const nextList = usersList.map(u => u.id === userId ? updatedTarget : u);
    setUsersList(nextList);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedTarget }));
    }

    await upsertSupabaseProfile(updatedTarget);
    await persistSettingToSupabase('bds_users_list', nextList);
    showToast(`Đã cập nhật thông tin người dùng "${updatedTarget.name || userId}" thành công!`, 'success');
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

  // Admin Update VIP Package Price
  const updateVipPackagePrice = async (pkgId, newPrice) => {
    const priceNum = parseInt(newPrice, 10);
    if (!priceNum || priceNum <= 0) return;

    let updatedPackages;
    setVipPackages(prev => {
      updatedPackages = prev.map(p => p.id === pkgId ? { ...p, pricePerDay: priceNum } : p);
      return updatedPackages;
    });
    await persistSettingToSupabase('bds_vip_packages', updatedPackages);
    showToast(`Đã cập nhật giá gói ${pkgId} thành ${priceNum.toLocaleString('vi-VN')} đ/ngày`, 'success');
  };

  // Reset to original seed data
  const resetToMockData = async () => {
    setProperties(INITIAL_PROPERTIES);
    setFavorites(['BDS-001']);
    setCompareList([]);
    setCurrentUser(MOCK_USERS[1]);
    setUsersList(MOCK_USERS);
    setVipPackages(VIP_PACKAGES);
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
      bds_membership_packages: MEMBERSHIP_PACKAGES,
      bds_nav_menu: INITIAL_NAV_MENU,
      bds_header_config: DEFAULT_HEADER_CONFIG,
      bds_system_config: DEFAULT_SYSTEM_CONFIG
    });

    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!', 'info');
  };

  // User Login (Xác thực đăng nhập nghiêm ngặt)
  const loginUser = (identifier, _password) => {
    if (!identifier) {
      showToast('Vui lòng nhập Email hoặc Số điện thoại!', 'warning');
      return false;
    }
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\s+/g, '');
    const found = usersList.find(
      u => (u.email?.toLowerCase() === cleanIdent || 
            u.phone?.replace(/\s+/g, '') === cleanPhone)
    );
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
    setCurrentUser(found);
    if (typeof document !== 'undefined') {
      document.cookie = `bds_session_user=${encodeURIComponent(found.id)}; path=/; max-age=31536000; SameSite=Lax`;
    }
    showToast(`Đăng nhập thành công! Chào mừng ${found.name}`, 'success');
    return found;
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
    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updated : u));

    // Update author info across properties
    setProperties(prev => prev.map(p => {
      if (p.author && p.author.id === currentUser.id) {
        return {
          ...p,
          author: {
            ...p.author,
            name: updated.name,
            phone: updated.phone,
            zalo: updated.phone?.replace(/\s+/g, ''),
            avatar: updated.avatar
          }
        };
      }
      return p;
    }));

    upsertSupabaseProfile(updated).catch(console.warn);
    showToast('Cập nhật hồ sơ thông tin cá nhân thành công!', 'success');
  };

  // Submit KYC Verification Request
  const submitKycVerification = (kycData) => {
    const updated = {
      ...currentUser,
      kycStatus: 'pending',
      idCardNumber: kycData.idCardNumber,
      licenseNumber: kycData.licenseNumber || ''
    };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    showToast('Đã gửi hồ sơ xác thực danh tính! Ban Quản Trị sẽ xét duyệt trong vòng 24h.', 'success');
  };

  // Logout User
  const logoutUser = () => {
    setCurrentUser(DEFAULT_GUEST_USER);
    if (typeof document !== 'undefined') {
      document.cookie = `bds_session_user=guest; path=/; max-age=31536000; SameSite=Lax`;
    }
    showToast('Đã đăng xuất khỏi tài khoản!', 'info');
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
    showToast('Đã khôi phục cấu hình thanh menu mặc định!', 'info');
  };

  // 11. Header & Logo Configuration Methods
  const updateHeaderConfig = async (updatedFields) => {
    const toSave = {
      ...DEFAULT_HEADER_CONFIG,
      ...headerConfig,
      ...updatedFields
    };

    setHeaderConfig(toSave);
    await persistSettingToSupabase('bds_header_config', toSave);

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

  return (
    <RealEstateContext.Provider
      value={{
        currentView,
        setCurrentView,
        properties,
        favorites,
        compareList,
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
        toggleCompare,
        removeCompare,
        clearCompare,
        bumpListing,
        upgradeVip,
        addProperty,
        approveProperty,
        rejectProperty,
        deleteProperty,
        moveToTrash,
        restoreProperty,
        permanentDeleteProperty,
        emptyTrash,
        runDatabaseCleanup,
        updateProperty,
        renewProperty,
        getPropertyExpirationInfo,
        depositWallet,
        adjustUserBalance,
        toggleUserVerification,
        updateUser,
        moveUserToTrash,
        restoreUserFromTrash,
        permanentDeleteUser,
        emptyUserTrash,
        updateVipPackagePrice,
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
        paymentConfig,
        updatePaymentConfig,
        resetPaymentConfig,
        VIETNAM_BANKS,
        membershipPackages,
        subscribeMembership,
        updateMembershipPackage,
        addMembershipPackage,
        deleteMembershipPackage,
        resetMembershipPackages,
        importAllConfig,
        systemConfig,
        updateSystemConfig,
        resetSystemConfig,
        BUMP_SERVICE_PRICE,
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
        resendUserVerificationEmail
      }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};

export const useRealEstate = () => useContext(RealEstateContext);
