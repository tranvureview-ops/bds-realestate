'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_APPROVAL_TIERS, DEFAULT_HEADER_CONFIG, PROPERTY_TYPES } from '../data/mockData';
import { Link } from '../router/RouterContext';
import { getPropertyPermalink } from '../utils/permalink';
import { REPORT_REASONS } from '../utils/emailService';
import AdminReportsManager from './AdminReportsManager';
import AdminSingleConfigManager from './AdminSingleConfigManager';
import AdminEmailConfigManager from './AdminEmailConfigManager';
import AdminMembershipManager from './AdminMembershipManager';
import AdminHeaderConfigManager from './AdminHeaderConfigManager';
import AdminMenuConfigManager from './AdminMenuConfigManager';
import { AVAILABLE_FONTS, getFontConfig, applyFontToDom } from '../utils/fontConfig';

export const VALID_ADMIN_TABS = [
  'dashboard',
  'moderation',
  'reports',
  'emails',
  'properties',
  'users',
  'finance',
  'pricing',
  'membership',
  'header',
  'menu',
  'payments',
  'single-config',
  'email-config',
  'settings'
];

export const getSettingsSubTabFromHash = () => {
  if (typeof window === 'undefined') return 'system';
  const fullHash = (window.location.hash || '').replace(/^#/, '').split('?')[0].trim().toLowerCase();
  if (fullHash === 'header' || fullHash === 'settings/header' || fullHash.startsWith('settings/header') || fullHash.includes('tab=header')) return 'header';
  if (fullHash === 'menu' || fullHash === 'settings/menu' || fullHash.startsWith('settings/menu') || fullHash.includes('tab=menu')) return 'menu';
  if (fullHash === 'email-config' || fullHash === 'email' || fullHash === 'settings/email' || fullHash.startsWith('settings/email') || fullHash.includes('tab=email')) return 'email';
  return 'system';
};

export const getTabFromHash = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const rawHash = (window.location.hash || '').replace(/^#/, '').split('?')[0].split('/')[0].trim().toLowerCase();
  if (rawHash === 'header' || rawHash === 'menu' || rawHash === 'email-config' || rawHash === 'email') return 'settings';
  return VALID_ADMIN_TABS.includes(rawHash) ? rawHash : 'dashboard';
};

export default function AdminBackendPage() {
  const { 
    properties, 
    usersList, 
    vipPackages, 
    transactions, 
    currentUser, 
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
    adjustUserBalance, 
    toggleUserVerification, 
    updateVipPackagePrice, 
    navigateToProperty, 
    setCurrentView, 
    showToast,
    resetToMockData,
    navMenuItems,
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
    membershipPackages,
    updateMembershipPackage,
    paymentConfig,
    updatePaymentConfig,
    resetPaymentConfig,
    VIETNAM_BANKS,
    systemConfig,
    updateSystemConfig,
    resetSystemConfig,
    importAllConfig,
    listingReports,
    emailLogs,
    singleConfig,
    refreshUsersListFromServer,
    activateUserManually,
    resendUserVerificationEmail
  } = useRealEstate();

  // Settings sub-tab state (synced with #settings/system, #settings/header, #settings/menu)
  const [settingsSubTab, setSettingsSubTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      return getSettingsSubTabFromHash();
    }
    return 'system';
  });

  const handleSelectSettingsSubTab = useCallback((subTab) => {
    setSettingsSubTabState(subTab);
    if (typeof window !== 'undefined') {
      const targetHash = subTab === 'system' ? '#settings' : `#settings/${subTab}`;
      const currentFull = (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
      const targetClean = targetHash.replace(/^#/, '').toLowerCase();
      if (currentFull !== targetClean) {
        if (window.history?.pushState) {
          window.history.pushState(null, '', targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    }
  }, []);

  // Active Admin Sidebar Menu (synced with URL hash)
  const [activeMenu, setActiveMenuState] = useState(() => {
    if (typeof window !== 'undefined') {
      return getTabFromHash();
    }
    return 'dashboard';
  });

  const setActiveMenu = useCallback((tab, subTab = null) => {
    let targetTab = tab;
    let targetSubTab = subTab;
    if (tab === 'header') {
      targetTab = 'settings';
      targetSubTab = 'header';
    } else if (tab === 'menu') {
      targetTab = 'settings';
      targetSubTab = 'menu';
    } else if (tab === 'email-config' || tab === 'email') {
      targetTab = 'settings';
      targetSubTab = 'email';
    }

    if (!VALID_ADMIN_TABS.includes(targetTab)) return;
    setActiveMenuState(targetTab);
    if (targetSubTab) {
      setSettingsSubTabState(targetSubTab);
    }

    if (typeof window !== 'undefined') {
      let targetHash = `#${targetTab}`;
      if (targetTab === 'settings') {
        const currentSub = targetSubTab || (tab === 'settings' && !subTab ? settingsSubTab : 'system');
        targetHash = currentSub === 'system' ? '#settings' : `#settings/${currentSub}`;
      }
      const currentHash = (window.location.hash || '').trim().toLowerCase();
      if (currentHash !== targetHash.toLowerCase()) {
        if (window.history?.pushState) {
          window.history.pushState(null, '', targetHash);
        } else {
          window.location.hash = targetHash;
        }
      }
    }
  }, [settingsSubTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
      const tab = getTabFromHash();
      if (!currentHash) {
        if (window.history?.replaceState) {
          window.history.replaceState(null, '', '#dashboard');
        }
      } else if (tab === 'settings') {
        const sub = getSettingsSubTabFromHash();
        const expectedHash = sub === 'system' ? '#settings' : `#settings/${sub}`;
        if (currentHash === 'header' || currentHash === 'menu' || currentHash === 'email-config' || currentHash === 'email') {
          if (window.history?.replaceState) {
            window.history.replaceState(null, '', expectedHash);
          }
        }
        setSettingsSubTabState(sub);
      } else if (currentHash !== tab) {
        if (window.history?.replaceState) {
          window.history.replaceState(null, '', `#${tab}`);
        }
      }
      setActiveMenuState(tab);
    }

    const handleHashOrPopState = () => {
      const tab = getTabFromHash();
      setActiveMenuState(tab);
      if (tab === 'settings') {
        const subTab = getSettingsSubTabFromHash();
        setSettingsSubTabState(subTab);
      }
    };

    window.addEventListener('hashchange', handleHashOrPopState);
    window.addEventListener('popstate', handleHashOrPopState);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPopState);
      window.removeEventListener('popstate', handleHashOrPopState);
    };
  }, []);

  const handleNavClick = useCallback((tab) => (e) => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      setActiveMenu(tab);
    }
  }, [setActiveMenu]);

  const pendingReportsCount = (listingReports || []).filter(r => r.status === 'pending').length;

  // Notification Center Dropdown & Alert States
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'reports', 'emails'
  const [targetReportId, setTargetReportId] = useState(null);
  const [incomingAlertToast, setIncomingAlertToast] = useState(null);
  const notificationRef = useRef(null);

  // Synthesized notification sound for incoming reports (Web Audio API)
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now); // G5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.1); // C6
      gain2.gain.setValueAtTime(0.18, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } catch (e) {
      // Audio playback may require initial user gesture
    }
  }, []);

  // Real-time Event Listener for incoming violation reports
  useEffect(() => {
    const handleNewReportAlert = (e) => {
      const report = e?.detail?.report;
      if (report) {
        playNotificationSound();
        setIncomingAlertToast(report);
      }
    };
    window.addEventListener('bds-new-report-alert', handleNewReportAlert);
    return () => window.removeEventListener('bds-new-report-alert', handleNewReportAlert);
  }, [playNotificationSound]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss floating toast alert after 12 seconds
  useEffect(() => {
    if (incomingAlertToast) {
      const timer = setTimeout(() => setIncomingAlertToast(null), 12000);
      return () => clearTimeout(timer);
    }
  }, [incomingAlertToast]);

  const [formPaymentConfig, setFormPaymentConfig] = useState(paymentConfig || {});
  const [formSystemConfig, setFormSystemConfig] = useState(systemConfig || {});

  useEffect(() => {
    if (paymentConfig) {
      setFormPaymentConfig(paymentConfig);
    }
  }, [paymentConfig]);

  useEffect(() => {
    if (systemConfig) {
      setFormSystemConfig(systemConfig);
    }
  }, [systemConfig]);

  // Subfilters
  const [moderationTab, setModerationTab] = useState('pending'); // 'pending', 'active', 'rejected'
  const [pendingQueueFilter, setPendingQueueFilter] = useState('all'); // 'all', 'gold', 'silver', 'normal'
  const [_clockTicker, setClockTicker] = useState(Date.now());
  const [rejectModalProp, setRejectModalProp] = useState(null);
  const [rejectReason, setRejectReason] = useState('Giá chưa phản ánh đúng thực tế thị trường');
  const [propertyAuthorFilter, setPropertyAuthorFilter] = useState('all'); // 'all', 'guest', 'member'
  const [userTab, setUserTab] = useState('members'); // 'members', 'guests'

  // Live 1-second ticker for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => setClockTicker(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper tính thời gian đếm ngược tự động kích hoạt
  const getRemainingCountdown = (autoApproveAt) => {
    if (!autoApproveAt) return null;
    const diff = new Date(autoApproveAt).getTime() - Date.now();
    if (diff <= 0) return { expired: true, text: 'Đang kích hoạt tự động...' };
    const totalSec = Math.floor(diff / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return {
      expired: false,
      text: `${mins} phút ${String(secs).padStart(2, '0')}s`,
      totalSec
    };
  };

  // Adjust Wallet Modal
  const [adjustWalletUser, setAdjustWalletUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(500000);
  const [adjustNote, setAdjustNote] = useState('Nạp tiền thưởng khuyến mãi');
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  // Quick edit VIP package modal
  const [editingVipProp, setEditingVipProp] = useState(null);
  const [newVipId, setNewVipId] = useState('vip-diamond');

  // Search keyword inside admin
  const [searchTerm, setSearchTerm] = useState('');

  // Property Management States (Search, Multi-Filter, Sorting, Expiration & Renewal - Chuẩn Batdongsan.com.vn)
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all'); // 'all', 'active', 'expiring_soon', 'expired', 'pending', 'rejected'
  const [propertyDemandFilter, setPropertyDemandFilter] = useState('all'); // 'all', 'sale', 'rent'
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState('all'); // 'all' or propertyType
  const [propertyCityFilter, setPropertyCityFilter] = useState('all'); // 'all' or city name
  const [propertyVipFilter, setPropertyVipFilter] = useState('all'); // 'all', 'vip-diamond', 'vip-gold', 'vip-silver', 'normal'
  const [propertySortBy, setPropertySortBy] = useState('newest'); // 'newest', 'oldest', 'expiring_first', 'price_desc', 'price_asc'

  // Renewal Modal State (Gia Hạn Tin Đăng - Batdongsan Renew)
  const [renewModalProp, setRenewModalProp] = useState(null);
  const [renewDays, setRenewDays] = useState(15);
  const [renewVipId, setRenewVipId] = useState('');
  const [renewAutoRenew, setRenewAutoRenew] = useState(false);

  // Finance Ledger & Revenue States (Sổ cái giao dịch & Báo cáo doanh thu)
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeUserFilter, setFinanceUserFilter] = useState('all'); // 'all' or userId
  const [financeTypeFilter, setFinanceTypeFilter] = useState('all'); // 'all', 'deposit', 'purchase_vip', 'bump_listing'
  const [financePaymentFilter, setFinancePaymentFilter] = useState('all'); // 'all', 'vietqr', 'momo', 'vnpay', 'wallet'
  const [financeDatePreset, setFinanceDatePreset] = useState('all'); // 'all', 'today', '7days', '30days', 'thisMonth', 'custom'
  const [financeStartDate, setFinanceStartDate] = useState('');
  const [financeEndDate, setFinanceEndDate] = useState('');
  const [financePage, setFinancePage] = useState(1);
  const [financePageSize, setFinancePageSize] = useState(15);
  const [isUserReportModalOpen, setIsUserReportModalOpen] = useState(false);
  const [userReportSearch, setUserReportSearch] = useState('');

  // Helper format ngày giờ chuẩn Việt Nam (dd/MM/yyyy HH:mm:ss)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: '--/--/----', time: '--:--:--', full: '--/--/----' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: String(dateStr), time: '', full: String(dateStr) };
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${mins}:${secs}`,
        full: `${day}/${month}/${year} ${hours}:${mins}:${secs}`
      };
    } catch {
      return { date: String(dateStr), time: '', full: String(dateStr) };
    }
  };

  // Menu Management States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    title: '',
    path: '',
    icon: 'fa-solid fa-link',
    badge: '',
    badgeColor: 'bg-emerald-500 text-white',
    isVisible: true,
    target: '_self'
  });
  const [activeSubmenuParentId, setActiveSubmenuParentId] = useState(null);
  const [subFormData, setSubFormData] = useState({ title: '', path: '', icon: 'fa-solid fa-chevron-right' });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Logo & Header Width State
  const [logoFormData, setLogoFormData] = useState(() => ({
    logoType: headerConfig?.logoType || 'text',
    brandName: headerConfig?.brandName || 'ĐẤT BIỂN',
    brandHighlight: headerConfig?.brandHighlight || 'ĐÀ NẴNG',
    brandTagline: headerConfig?.brandTagline || 'Bất Động Sản Biển & Đất Nền Đà Nẵng',
    brandIcon: headerConfig?.brandIcon || 'fa-solid fa-water',
    badgeText: headerConfig?.badgeText || 'VIP',
    badgeColor: headerConfig?.badgeColor || 'bg-red-100 text-red-600 border border-red-200',
    logoImageUrl: headerConfig?.logoImageUrl || '',
    logoHeight: headerConfig?.logoHeight || 40,
    logoAlt: headerConfig?.logoAlt || 'Đất Biển Đà Nẵng Logo',
    showTaglineWithImage: headerConfig?.showTaglineWithImage || false,
    containerWidth: headerConfig?.containerWidth || 'boxed',
  }));

  // Only sync logoFormData on initial load when cloud/database config arrives
  const isHeaderLoadedRef = useRef(false);
  useEffect(() => {
    if (!isHeaderLoadedRef.current && headerConfig && Object.keys(headerConfig).length > 0) {
      setLogoFormData(prev => ({
        ...prev,
        ...headerConfig
      }));
      isHeaderLoadedRef.current = true;
    }
  }, [headerConfig]);

  const handleResetHeaderSettings = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình Header & Độ rộng về mặc định ban đầu?')) {
      await resetHeaderConfig();
      setLogoFormData(DEFAULT_HEADER_CONFIG);
      showToast('Đã khôi phục cấu hình Header về mặc định!', 'info');
    }
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Kích thước ảnh tối đa 2MB!', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoFormData(prev => ({
          ...prev,
          logoType: 'image',
          logoImageUrl: event.target.result
        }));
        showToast('Đã tải ảnh logo lên thành công!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSavingHeader, setIsSavingHeader] = useState(false);

  const handleSaveHeaderSettings = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingHeader(true);
    try {
      await updateHeaderConfig(logoFormData);
    } finally {
      setTimeout(() => setIsSavingHeader(false), 400);
    }
  };

  const [isSavingSystem, setIsSavingSystem] = useState(false);

  const handleSaveSystemConfig = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingSystem(true);
    try {
      await updateSystemConfig(formSystemConfig);
    } finally {
      setTimeout(() => setIsSavingSystem(false), 500);
    }
  };

  const handleResetSystemSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ thông tin nhận diện thương hiệu và cài đặt vận hành sàn về mặc định?')) {
      resetSystemConfig();
      setFormSystemConfig(DEFAULT_SYSTEM_CONFIG);
    }
  };

  const handleSavePaymentSettings = (e) => {
    if (e) e.preventDefault();
    updatePaymentConfig(formPaymentConfig);
    showToast('Đã lưu cấu hình cổng thanh toán thành công!', 'success');
  };

  const handleResetPaymentSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục thiết lập thanh toán về mặc định ban đầu?')) {
      resetPaymentConfig();
      showToast('Đã khôi phục cấu hình thanh toán mặc định!', 'info');
    }
  };

  const handleBankSelect = (e) => {
    const selectedBankCode = e.target.value;
    const bank = (VIETNAM_BANKS || []).find(b => b.code === selectedBankCode);
    if (bank) {
      setFormPaymentConfig(prev => ({
        ...prev,
        vietqr: {
          ...prev.vietqr,
          bankCode: bank.code,
          bankBin: bank.bin,
          bankName: bank.name
        }
      }));
    }
  };

  const configFileInputRef = useRef(null);

  const handleExportSystemConfig = () => {
    const backupData = {
      appName: 'ĐẤT BIỂN ĐÀ NẴNG',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      paymentConfig: formPaymentConfig || paymentConfig,
      headerConfig: logoFormData || headerConfig,
      systemConfig: formSystemConfig || systemConfig,
      navMenuItems: navMenuItems,
      vipPackages: vipPackages,
      membershipPackages: membershipPackages,
      properties: properties,
      transactions: transactions,
      singleConfig: singleConfig,
      listingReports: listingReports
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dat-bien-da-nang-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file sao lưu cấu hình hệ thống!', 'success');
  };

  const handleImportSystemConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (importAllConfig) {
          importAllConfig(data);
        }
        if (data.paymentConfig) setFormPaymentConfig(data.paymentConfig);
        if (data.headerConfig) setLogoFormData(data.headerConfig);
        if (data.systemConfig) setFormSystemConfig(data.systemConfig);
      } catch (err) {
        showToast('File cấu hình JSON không hợp lệ!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // KPIs
  const pendingProps = useMemo(() => properties.filter(p => p.status === 'pending'), [properties]);
  const activeProps = useMemo(() => properties.filter(p => p.status === 'active'), [properties]);
  const rejectedProps = useMemo(() => properties.filter(p => p.status === 'rejected'), [properties]);

  // Hàng đợi kiểm duyệt phân loại theo cấp độ tin đăng
  const goldPending = useMemo(() => pendingProps.filter(p => p.vipPackageId === 'vip-gold'), [pendingProps]);
  const silverPending = useMemo(() => pendingProps.filter(p => p.vipPackageId === 'vip-silver'), [pendingProps]);
  const normalPending = useMemo(() => pendingProps.filter(p => p.vipPackageId === 'normal' || !p.vipPackageId), [pendingProps]);

  const guestProps = useMemo(() => {
    return properties.filter(p => p.isGuest || p.author?.isGuest || String(p.author?.id).startsWith('guest') || p.author?.title?.includes('Khách'));
  }, [properties]);

  const memberProps = useMemo(() => {
    return properties.filter(p => !(p.isGuest || p.author?.isGuest || String(p.author?.id).startsWith('guest') || p.author?.title?.includes('Khách')));
  }, [properties]);

  const guestAuthors = useMemo(() => {
    const map = new Map();
    properties.forEach(p => {
      const isGuest = p.isGuest || p.author?.isGuest || String(p.author?.id).startsWith('guest') || p.author?.title?.includes('Khách');
      if (isGuest) {
        const phone = p.author?.phone || p.contactPhone || 'Chưa có SĐT';
        const key = phone !== 'Chưa có SĐT' ? phone : (p.author?.name || p.id);
        if (!map.has(key)) {
          map.set(key, {
            id: p.author?.id || `guest-${p.id}`,
            name: p.author?.name || p.contactName || 'Khách vãng lai',
            phone: phone,
            email: p.contactEmail || p.author?.email || 'khach@vanglai.vn',
            listingsCount: 1,
            listings: [p],
            latestDate: p.publishedAt
          });
        } else {
          const item = map.get(key);
          item.listingsCount += 1;
          item.listings.push(p);
          if (new Date(p.publishedAt) > new Date(item.latestDate)) {
            item.latestDate = p.publishedAt;
          }
        }
      }
    });
    return Array.from(map.values());
  }, [properties]);

  // Danh bạ người dùng tổng hợp (Thành viên + Khách) để tra cứu SĐT, Email trong Sổ cái
  const userDirectoryMap = useMemo(() => {
    const map = {};
    // 1. Thành viên hệ thống
    (usersList || []).forEach(u => {
      if (u.id) {
        map[u.id] = {
          id: u.id,
          name: u.name || 'Thành viên',
          phone: u.phone || '',
          email: u.email || '',
          role: u.role || 'user',
          roleName: u.roleName || (u.role === 'admin' ? 'Quản trị viên' : u.role === 'broker' ? 'Môi giới' : 'Thành viên'),
          avatar: u.avatar || '',
          walletBalance: u.walletBalance || 0
        };
      }
    });
    // 2. Khách vãng lai
    (guestAuthors || []).forEach(g => {
      if (g.id) {
        map[g.id] = {
          id: g.id,
          name: g.name,
          phone: g.phone || '',
          email: g.email || '',
          role: 'guest',
          roleName: 'Khách vãng lai',
          avatar: '',
          walletBalance: 0
        };
      }
    });
    // 3. Tác giả bài đăng
    (properties || []).forEach(p => {
      if (p.author?.id && !map[p.author.id]) {
        map[p.author.id] = {
          id: p.author.id,
          name: p.author.name || p.contactName || '',
          phone: p.author.phone || p.contactPhone || '',
          email: p.author.email || p.contactEmail || '',
          role: p.isGuest ? 'guest' : 'member',
          roleName: p.author.title || (p.isGuest ? 'Khách vãng lai' : 'Thành viên'),
          avatar: p.author.avatar || '',
          walletBalance: 0
        };
      }
    });
    return map;
  }, [usersList, guestAuthors, properties]);

  // Hàm chuẩn hóa & tra cứu người dùng của từng giao dịch
  const resolveTransactionUser = useCallback((t) => {
    if (!t) return { id: 'unknown', name: 'Không xác định', phone: '', email: '', role: 'guest' };

    let u = t.userId ? userDirectoryMap[t.userId] : null;
    if (u) {
      return {
        id: u.id,
        name: t.userName || u.name,
        phone: t.userPhone || u.phone || '',
        email: t.userEmail || u.email || '',
        role: u.role,
        roleName: u.roleName,
        avatar: u.avatar,
        walletBalance: u.walletBalance || 0
      };
    }

    // Tra cứu theo tên nếu không khớp ID
    if (t.userName) {
      const matchByName = Object.values(userDirectoryMap).find(item => 
        item.name && item.name.trim().toLowerCase() === t.userName.trim().toLowerCase()
      );
      if (matchByName) {
        return {
          id: matchByName.id,
          name: t.userName,
          phone: t.userPhone || matchByName.phone || '',
          email: t.userEmail || matchByName.email || '',
          role: matchByName.role,
          roleName: matchByName.roleName,
          avatar: matchByName.avatar,
          walletBalance: matchByName.walletBalance || 0
        };
      }
    }

    // Tra cứu qua mã BĐS trong tiêu đề nếu có (VD: BDS-008)
    const bdsMatch = (t.title || '').match(/BDS-\d+/i);
    if (bdsMatch) {
      const prop = (properties || []).find(p => p.id?.toUpperCase() === bdsMatch[0].toUpperCase());
      if (prop) {
        return {
          id: prop.author?.id || t.userId || 'guest',
          name: t.userName || prop.author?.name || prop.contactName || 'Khách vãng lai',
          phone: t.userPhone || prop.author?.phone || prop.contactPhone || '',
          email: t.userEmail || prop.author?.email || prop.contactEmail || '',
          role: prop.isGuest ? 'guest' : 'member',
          roleName: prop.isGuest ? 'Khách vãng lai' : 'Thành viên',
          avatar: prop.author?.avatar || '',
          walletBalance: 0
        };
      }
    }

    return {
      id: t.userId || 'guest',
      name: t.userName || t.userId || 'Khách vãng lai',
      phone: t.userPhone || '',
      email: t.userEmail || '',
      role: 'guest',
      roleName: 'Khách vãng lai',
      avatar: '',
      walletBalance: 0
    };
  }, [userDirectoryMap, properties]);

  // Danh sách người dùng tổng hợp cho bộ lọc tài chính
  const allFinanceUsers = useMemo(() => {
    const userMap = new Map();
    // 1. Registered users
    (usersList || []).forEach(u => {
      userMap.set(u.id, {
        id: u.id,
        name: u.name,
        phone: u.phone || '',
        email: u.email || '',
        role: u.role,
        roleName: u.roleName || (u.role === 'admin' ? 'Quản trị viên' : u.role === 'broker' ? 'Môi giới' : 'Thành viên'),
        avatar: u.avatar,
        walletBalance: u.walletBalance || 0
      });
    });
    // 2. From transactions
    (transactions || []).forEach(t => {
      const u = resolveTransactionUser(t);
      if (u.id && !userMap.has(u.id)) {
        userMap.set(u.id, {
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          roleName: u.roleName,
          avatar: u.avatar,
          walletBalance: u.walletBalance || 0
        });
      }
    });
    return Array.from(userMap.values());
  }, [usersList, transactions, resolveTransactionUser]);

  // Tổng hợp tài chính theo từng người dùng (User Financial Summary)
  const userFinanceSummaries = useMemo(() => {
    return allFinanceUsers.map(user => {
      const userTxns = (transactions || []).filter(t => {
        const u = resolveTransactionUser(t);
        return t.userId === user.id || u.id === user.id;
      });

      const totalDeposited = userTxns
        .filter(t => t.type === 'deposit' || t.isDirectPayment)
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      const totalSpent = userTxns
        .filter(t => t.type === 'purchase_vip' || t.type === 'bump_listing')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      const latestTxn = userTxns.length > 0
        ? [...userTxns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      return {
        ...user,
        txnCount: userTxns.length,
        totalDeposited,
        totalSpent,
        latestTxnDate: latestTxn ? latestTxn.createdAt : null,
        transactions: userTxns
      };
    });
  }, [allFinanceUsers, transactions, resolveTransactionUser]);

  // Bộ lọc tìm kiếm người dùng trong Báo cáo tài chính theo User
  const filteredUsersForReport = useMemo(() => {
    if (!userReportSearch.trim()) return userFinanceSummaries;
    const term = userReportSearch.toLowerCase().trim();
    const cleanTermPhone = term.replace(/[\s.+\-()]/g, '');
    return userFinanceSummaries.filter(u => {
      const uPhone = (u.phone || '').replace(/[\s.+\-()]/g, '');
      return (u.name || '').toLowerCase().includes(term) ||
             (u.email || '').toLowerCase().includes(term) ||
             (u.id || '').toLowerCase().includes(term) ||
             (u.phone && u.phone.toLowerCase().includes(term)) ||
             (cleanTermPhone && uPhone.includes(cleanTermPhone));
    });
  }, [userFinanceSummaries, userReportSearch]);

  // Thống kê số lượng bài đăng theo vòng đời, hạn hiển thị & Thùng rác
  const propertyStatusCounts = useMemo(() => {
    const counts = {
      all: 0,
      active: 0,
      expiringSoon: 0,
      expired: 0,
      pending: 0,
      rejected: 0,
      trash: 0,
      archived: 0
    };
    const now = Date.now();
    properties.forEach(p => {
      const isTrash = p.isDeleted || p.status === 'trash';
      if (isTrash) {
        counts.trash++;
        return; // Không tính vào danh sách hoạt động
      }
      counts.all++;

      if (p.isArchived || p.status === 'archived') {
        counts.archived++;
      }

      const isPending = p.status === 'pending';
      const isRejected = p.status === 'rejected';
      const isExp = p.status === 'expired' || (p.expiresAt && new Date(p.expiresAt).getTime() <= now);

      if (isPending) {
        counts.pending++;
      } else if (isRejected) {
        counts.rejected++;
      } else if (isExp) {
        counts.expired++;
      } else if (p.status === 'active') {
        counts.active++;
        const expTime = p.expiresAt ? new Date(p.expiresAt).getTime() : 0;
        const daysLeft = Math.floor((expTime - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 3) {
          counts.expiringSoon++;
        }
      }
    });
    return counts;
  }, [properties]);

  // Thống kê số lượng BĐS theo Nhu cầu (Bán / Thuê)
  const propertyDemandCounts = useMemo(() => {
    let sale = 0;
    let rent = 0;
    properties.forEach(p => {
      const isTrash = p.isDeleted || p.status === 'trash';
      if (isTrash) return;
      if (p.demand === 'rent') {
        rent++;
      } else {
        sale++;
      }
    });
    return { sale, rent, all: sale + rent };
  }, [properties]);

  // Danh sách Tỉnh/Thành phố hiện có trong hệ thống BĐS
  const availableCities = useMemo(() => {
    const set = new Set();
    properties.forEach(p => {
      if (p.city && p.city.trim() && !p.isDeleted && p.status !== 'trash') {
        set.add(p.city.trim());
      }
    });
    return Array.from(set).sort();
  }, [properties]);

  // Bộ lọc tìm kiếm & đa tiêu chí BĐS chuẩn Batdongsan.com.vn (Hỗ trợ Thùng rác)
  const filteredPropertiesList = useMemo(() => {
    const now = Date.now();
    return properties
      // 0. Phân tách Thùng rác: nếu đang xem Thùng rác thì chỉ hiện tin đã xóa, ngược lại ẩn tin đã xóa
      .filter(p => {
        const isTrash = p.isDeleted || p.status === 'trash';
        if (propertyStatusFilter === 'trash') return isTrash;
        return !isTrash;
      })
      // 0.1 Phân loại Nhu cầu (Tất cả / Cần bán / Cho thuê)
      .filter(p => {
        if (propertyStatusFilter === 'trash') return true;
        if (propertyDemandFilter === 'all') return true;
        const d = p.demand || 'sale';
        return d === propertyDemandFilter;
      })
      // 0.2 Phân loại Danh mục / Loại hình BĐS (8 loại hình chuẩn)
      .filter(p => {
        if (propertyStatusFilter === 'trash') return true;
        if (propertyCategoryFilter === 'all') return true;
        return p.propertyType === propertyCategoryFilter || p.type === propertyCategoryFilter;
      })
      // 0.3 Phân loại Tỉnh / Thành phố
      .filter(p => {
        if (propertyStatusFilter === 'trash') return true;
        if (propertyCityFilter === 'all') return true;
        return (p.city && p.city.trim()) === propertyCityFilter;
      })
      // 1. Phân loại tác giả: Tất cả / Khách vãng lai / Thành viên
      .filter(p => {
        if (propertyStatusFilter === 'trash') return true;
        const isGuest = p.isGuest || p.author?.isGuest || String(p.author?.id).startsWith('guest') || p.author?.title?.includes('Khách');
        if (propertyAuthorFilter === 'guest') return isGuest;
        if (propertyAuthorFilter === 'member') return !isGuest;
        return true;
      })
      // 2. Phân loại Gói VIP
      .filter(p => {
        if (propertyStatusFilter === 'trash') return true;
        if (propertyVipFilter === 'all') return true;
        return p.vipPackageId === propertyVipFilter;
      })
      // 3. Trạng thái vòng đời Batdongsan.com.vn
      .filter(p => {
        if (propertyStatusFilter === 'all' || propertyStatusFilter === 'trash') return true;
        const isPending = p.status === 'pending';
        const isRejected = p.status === 'rejected';
        const isExp = p.status === 'expired' || (p.expiresAt && new Date(p.expiresAt).getTime() <= now);
        const isActive = p.status === 'active' && !isExp;
        const expTime = p.expiresAt ? new Date(p.expiresAt).getTime() : 0;
        const daysLeft = Math.floor((expTime - now) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = isActive && daysLeft < 3;

        if (propertyStatusFilter === 'active') return isActive;
        if (propertyStatusFilter === 'expiring_soon') return isExpiringSoon;
        if (propertyStatusFilter === 'expired') return isExp;
        if (propertyStatusFilter === 'pending') return isPending;
        if (propertyStatusFilter === 'rejected') return isRejected;
        return true;
      })
      // 4. Tìm kiếm từ khóa đa trường (Mã tin, Tiêu đề, Tên người đăng, SĐT, Dự án, Danh mục, Pháp lý, Địa chỉ, Phường, Quận/Huyện, Tỉnh/Thành)
      .filter(p => {
        const term = (propertySearchTerm || searchTerm || '').trim().toLowerCase();
        if (!term) return true;
        return (
          (p.id && p.id.toLowerCase().includes(term)) ||
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.project && p.project.toLowerCase().includes(term)) ||
          (p.propertyTypeName && p.propertyTypeName.toLowerCase().includes(term)) ||
          (p.legal && p.legal.toLowerCase().includes(term)) ||
          (p.author?.name && p.author.name.toLowerCase().includes(term)) ||
          (p.contactName && p.contactName.toLowerCase().includes(term)) ||
          (p.author?.phone && p.author.phone.includes(term)) ||
          (p.contactPhone && p.contactPhone.includes(term)) ||
          (p.address && p.address.toLowerCase().includes(term)) ||
          (p.street && p.street.toLowerCase().includes(term)) ||
          (p.ward && p.ward.toLowerCase().includes(term)) ||
          (p.district && p.district.toLowerCase().includes(term)) ||
          (p.city && p.city.toLowerCase().includes(term))
        );
      })
      // 5. Sắp xếp đa dạng
      .sort((a, b) => {
        if (propertySortBy === 'newest') {
          return new Date(b.publishedAt || b.createdAt || b.submittedAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || a.submittedAt || 0).getTime();
        }
        if (propertySortBy === 'oldest') {
          return new Date(a.publishedAt || a.createdAt || a.submittedAt || 0).getTime() - new Date(b.publishedAt || b.createdAt || b.submittedAt || 0).getTime();
        }
        if (propertySortBy === 'expiring_first') {
          const aExp = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
          const bExp = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
          return aExp - bExp;
        }
        if (propertySortBy === 'price_desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (propertySortBy === 'price_asc') {
          return (a.price || 0) - (b.price || 0);
        }
        return 0;
      });
  }, [properties, propertyAuthorFilter, propertyDemandFilter, propertyCategoryFilter, propertyCityFilter, propertyVipFilter, propertyStatusFilter, propertySearchTerm, searchTerm, propertySortBy]);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'purchase_vip' || t.type === 'bump_listing')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const _totalDeposit = useMemo(() => {
    return transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  }, [transactions]);

  // Bộ lọc nâng cao cho Sổ cái giao dịch & Báo cáo doanh thu (hỗ trợ tìm kiếm theo SĐT, Email, User)
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      const userInfo = resolveTransactionUser(t);

      // 1. Lọc theo User cụ thể
      if (financeUserFilter !== 'all') {
        if (t.userId !== financeUserFilter && userInfo.id !== financeUserFilter) {
          return false;
        }
      }

      // 2. Text Search match (Mã GD, Tên người dùng, SĐT, Email, Nội dung, Số tiền, Phương thức)
      if (financeSearch.trim()) {
        const term = financeSearch.toLowerCase().trim();
        const cleanTermPhone = term.replace(/[\s.+\-()]/g, '');

        const userPhone = userInfo.phone || '';
        const cleanUserPhone = userPhone.replace(/[\s.+\-()]/g, '');
        const userEmail = (userInfo.email || '').toLowerCase();

        const matchId = (t.id || '').toLowerCase().includes(term);
        const matchUser = (userInfo.name || t.userName || t.userId || '').toLowerCase().includes(term);
        const matchPhone = (userPhone.toLowerCase().includes(term)) || (cleanTermPhone && cleanUserPhone.includes(cleanTermPhone));
        const matchEmail = userEmail.includes(term);
        const matchTitle = (t.title || '').toLowerCase().includes(term);
        const matchMethod = (t.paymentMethod || '').toLowerCase().includes(term);
        const matchAmount = String(Math.abs(t.amount || 0)).includes(term);

        if (!matchId && !matchUser && !matchPhone && !matchEmail && !matchTitle && !matchMethod && !matchAmount) {
          return false;
        }
      }

      // 3. Transaction Type match
      if (financeTypeFilter !== 'all' && t.type !== financeTypeFilter) {
        return false;
      }

      // 4. Payment Method match
      if (financePaymentFilter !== 'all') {
        const m = (t.paymentMethod || '').toLowerCase();
        if (financePaymentFilter === 'vietqr' && !m.includes('vietqr') && !m.includes('ngân hàng')) return false;
        if (financePaymentFilter === 'momo' && !m.includes('momo')) return false;
        if (financePaymentFilter === 'vnpay' && !m.includes('vnpay')) return false;
        if (financePaymentFilter === 'wallet' && !m.includes('ví')) return false;
      }

      // 5. Date Preset / Custom Date Range match
      if (financeDatePreset !== 'all' || (financeStartDate && financeEndDate)) {
        const tDate = new Date(t.createdAt || Date.now());
        const now = new Date();

        if (financeDatePreset === 'today') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (tDate < startOfToday) return false;
        } else if (financeDatePreset === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (tDate < sevenDaysAgo) return false;
        } else if (financeDatePreset === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (tDate < thirtyDaysAgo) return false;
        } else if (financeDatePreset === 'thisMonth') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (tDate < startOfMonth) return false;
        } else if (financeDatePreset === 'custom') {
          if (financeStartDate) {
            const start = new Date(financeStartDate + 'T00:00:00');
            if (tDate < start) return false;
          }
          if (financeEndDate) {
            const end = new Date(financeEndDate + 'T23:59:59');
            if (tDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [transactions, financeSearch, financeUserFilter, financeTypeFilter, financePaymentFilter, financeDatePreset, financeStartDate, financeEndDate, resolveTransactionUser]);

  // Tự động quay về trang 1 khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setFinancePage(1);
  }, [financeSearch, financeUserFilter, financeTypeFilter, financePaymentFilter, financeDatePreset, financeStartDate, financeEndDate, financePageSize]);

  // Phân trang danh sách giao dịch
  const totalFinancePages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTransactions.length / financePageSize));
  }, [filteredTransactions.length, financePageSize]);

  const paginatedTransactions = useMemo(() => {
    const start = (financePage - 1) * financePageSize;
    return filteredTransactions.slice(start, start + financePageSize);
  }, [filteredTransactions, financePage, financePageSize]);

  const filteredRevenue = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'purchase_vip' || t.type === 'bump_listing')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  }, [filteredTransactions]);

  const filteredDeposit = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  }, [filteredTransactions]);

  const handleRejectSubmit = () => {
    if (rejectModalProp) {
      rejectProperty(rejectModalProp.id, rejectReason);
      setRejectModalProp(null);
    }
  };

  const handleAdjustBalanceSubmit = () => {
    if (adjustWalletUser) {
      adjustUserBalance(adjustWalletUser.id, adjustAmount, adjustNote);
      setAdjustWalletUser(null);
    }
  };

  const handleRefreshUsers = async () => {
    setIsSyncingUsers(true);
    try {
      await refreshUsersListFromServer();
      showToast('Đã đồng bộ danh sách người dùng mới nhất từ server!', 'success');
    } catch (e) {
      showToast('Không thể đồng bộ người dùng', 'error');
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleManualActivate = async (userId, userName) => {
    if (!window.confirm(`Xác nhận kích hoạt tài khoản "${userName}" và cộng tiền khuyến mãi?`)) return;
    const res = await activateUserManually(userId);
    if (res?.success) {
      showToast(`Đã kích hoạt tài khoản "${userName}" thành công!`, 'success');
    }
  };

  const handleResendUserEmail = async (email) => {
    if (!email) return;
    const res = await resendUserVerificationEmail(email);
    if (res?.success) {
      showToast(`Đã gửi lại email kích hoạt tới ${email}`, 'success');
    }
  };

  const handleUpdatePropertyVip = () => {
    if (editingVipProp) {
      updateProperty(editingVipProp.id, { vipPackageId: newVipId, updatedAt: new Date().toISOString() });
      setEditingVipProp(null);
    }
  };

  // Quản lý Chỉnh sửa chi tiết bài đăng Bất động sản
  const [editingProperty, setEditingProperty] = useState(null);
  const [editPropFormData, setEditPropFormData] = useState({});
  const [editPropTab, setEditPropTab] = useState('general'); // 'general' | 'specs' | 'media' | 'content'
  const [newImageInput, setNewImageInput] = useState('');

  const handleOpenEditProperty = (prop) => {
    setEditingProperty(prop);
    setEditPropTab('general');
    setNewImageInput('');
    const expDateStr = prop.expiresAt ? new Date(prop.expiresAt).toISOString().slice(0, 16) : '';
    const currentPropType = prop.propertyType || prop.type || 'apartment';
    const currentTypeName = prop.propertyTypeName || PROPERTY_TYPES.find(t => t.id === currentPropType)?.name || 'Căn hộ chung cư';

    setEditPropFormData({
      // 1. Nhu cầu, Loại hình & Vị trí
      demand: prop.demand || 'sale',
      propertyType: currentPropType,
      propertyTypeName: currentTypeName,
      project: prop.project || '',
      addressDisplay: prop.addressDisplay || '',
      street: prop.street || '',
      ward: prop.ward || '',
      district: prop.district || '',
      city: prop.city || '',

      // 2. Định giá & Thông số kỹ thuật
      priceDisplay: prop.priceDisplay || '',
      price: prop.price || 0,
      priceType: prop.priceType || 'total',
      pricePerM2: prop.pricePerM2 || '',
      area: prop.area || 0,
      facade: prop.facade ?? '',
      entranceRoad: prop.entranceRoad ?? '',
      roadType: prop.roadType || 'car_pass',
      bedroom: prop.bedroom ?? 0,
      bathroom: prop.bathroom ?? 0,
      floor: prop.floor ?? '',
      direction: prop.direction || '',
      balconyDirection: prop.balconyDirection || '',
      legal: prop.legal || 'Sổ hồng lâu dài chính chủ',
      furniture: prop.furniture || 'Full nội thất',

      // 3. Media & Hình ảnh
      images: Array.isArray(prop.images) ? [...prop.images] : (prop.images ? [prop.images] : []),
      videoUrl: prop.videoUrl || '',
      hasVR360: Boolean(prop.hasVR360),

      // 4. Nội dung bài viết, Liên hệ & VIP
      title: prop.title || '',
      description: prop.description || '',
      vipPackageId: prop.vipPackageId || 'normal',
      status: prop.status || 'active',
      listingDays: prop.listingDays || 15,
      expiresAt: expDateStr,
      autoRenew: prop.autoRenew ?? false,
      contactName: prop.author?.name || prop.contactName || '',
      contactPhone: prop.author?.phone || prop.contactPhone || '',
      contactEmail: prop.author?.email || prop.contactEmail || '',
      contactAddress: prop.author?.address || prop.contactAddress || ''
    });
  };

  const handleSaveEditProperty = () => {
    if (!editingProperty) return;
    const nowIso = new Date().toISOString();
    let newExpiresAt = editingProperty.expiresAt;
    if (editPropFormData.expiresAt) {
      newExpiresAt = new Date(editPropFormData.expiresAt).toISOString();
    }
    
    const matchedType = PROPERTY_TYPES.find(t => t.id === editPropFormData.propertyType);
    const resolvedTypeName = matchedType?.name || editPropFormData.propertyTypeName || 'Căn hộ chung cư';

    const fullAddress = [
      editPropFormData.street,
      editPropFormData.ward,
      editPropFormData.district,
      editPropFormData.city
    ].filter(Boolean).join(', ');

    updateProperty(editingProperty.id, {
      demand: editPropFormData.demand || 'sale',
      propertyType: editPropFormData.propertyType || 'apartment',
      propertyTypeName: resolvedTypeName,
      project: editPropFormData.project || '',
      addressDisplay: editPropFormData.addressDisplay || '',
      address: fullAddress || editingProperty.address || '',
      street: editPropFormData.street || '',
      ward: editPropFormData.ward || '',
      district: editPropFormData.district || '',
      city: editPropFormData.city || '',
      title: editPropFormData.title || '',
      description: editPropFormData.description || '',
      priceDisplay: editPropFormData.priceDisplay || '',
      price: Number(editPropFormData.price) || editingProperty.price || 0,
      priceType: editPropFormData.priceType || 'total',
      pricePerM2: editPropFormData.pricePerM2 || '',
      area: Number(editPropFormData.area) || editingProperty.area || 0,
      facade: editPropFormData.facade !== '' && editPropFormData.facade !== null ? Number(editPropFormData.facade) : null,
      entranceRoad: editPropFormData.entranceRoad !== '' && editPropFormData.entranceRoad !== null ? Number(editPropFormData.entranceRoad) : null,
      roadType: editPropFormData.roadType || 'car_pass',
      bedroom: Number(editPropFormData.bedroom) || 0,
      bathroom: Number(editPropFormData.bathroom) || 0,
      floor: editPropFormData.floor !== '' && editPropFormData.floor !== null ? Number(editPropFormData.floor) : null,
      direction: editPropFormData.direction || '',
      balconyDirection: editPropFormData.balconyDirection || '',
      legal: editPropFormData.legal || '',
      furniture: editPropFormData.furniture || '',
      images: Array.isArray(editPropFormData.images) && editPropFormData.images.length > 0 
        ? editPropFormData.images 
        : editingProperty.images,
      videoUrl: editPropFormData.videoUrl || '',
      hasVR360: Boolean(editPropFormData.hasVR360),
      vipPackageId: editPropFormData.vipPackageId || 'normal',
      status: editPropFormData.status || 'active',
      listingDays: Number(editPropFormData.listingDays) || editingProperty.listingDays || 15,
      expiresAt: newExpiresAt,
      autoRenew: Boolean(editPropFormData.autoRenew),
      contactName: editPropFormData.contactName || '',
      contactPhone: editPropFormData.contactPhone || '',
      contactEmail: editPropFormData.contactEmail || '',
      contactAddress: editPropFormData.contactAddress || '',
      author: {
        ...editingProperty.author,
        name: editPropFormData.contactName || editingProperty.author?.name || '',
        phone: editPropFormData.contactPhone || editingProperty.author?.phone || '',
        email: editPropFormData.contactEmail || editingProperty.author?.email || '',
        address: editPropFormData.contactAddress || editingProperty.author?.address || ''
      },
      updatedAt: nowIso
    });
    setEditingProperty(null);
  };

  // Quản lý Gia Hạn Tin Đăng (Batdongsan Renewal Handlers)
  const handleOpenRenewModal = (prop) => {
    setRenewModalProp(prop);
    setRenewDays(prop.listingDays || 15);
    setRenewVipId(prop.vipPackageId || 'normal');
    setRenewAutoRenew(Boolean(prop.autoRenew));
  };

  const handleConfirmRenew = () => {
    if (!renewModalProp) return;
    renewProperty({
      propertyId: renewModalProp.id,
      extendDays: renewDays,
      newVipPackageId: renewVipId,
      autoRenew: renewAutoRenew,
      isFreeAdmin: true
    });
    setRenewModalProp(null);
  };

  const handleExportCSV = () => {
    const headers = "Ma_GD,Ngay_Gio_GD,Nguoi_Dung,Ma_User,So_Dien_Thoai,Email,Loai_GD,Noi_Dung_GD,Phuong_Thuc_Thanh_Toan,So_Tien_VND,So_Du_Sau_VND,Trang_Thai\n";
    const rows = filteredTransactions.map(t => {
      const u = resolveTransactionUser(t);
      const dt = formatDateTime(t.createdAt).full;
      const typeLabel = t.type === 'deposit' ? 'Nạp tiền vào ví' : t.type === 'purchase_vip' ? 'Mua VIP / Đăng tin' : 'Đẩy tin';
      const cleanTitle = (t.title || '').replace(/"/g, '""');
      const cleanUser = (u.name || t.userName || 'Khách vãng lai').replace(/"/g, '""');
      const cleanUserId = (u.id || t.userId || '').replace(/"/g, '""');
      const cleanPhone = (u.phone || '').replace(/"/g, '""');
      const cleanEmail = (u.email || '').replace(/"/g, '""');
      const cleanMethod = (t.paymentMethod || 'Trực tuyến').replace(/"/g, '""');
      return `"${t.id}","${dt}","${cleanUser}","${cleanUserId}","${cleanPhone}","${cleanEmail}","${typeLabel}","${cleanTitle}","${cleanMethod}","${t.amount}","${t.balanceAfter}","Thành công"`;
    }).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filterUserSuffix = financeUserFilter !== 'all' ? `_User_${financeUserFilter}` : '';
    link.setAttribute("download", `DatBienDaNang_SoCai_GiaoDich${filterUserSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất báo cáo ${filteredTransactions.length} giao dịch thành công (File CSV UTF-8)!`, 'success');
  };

  // Xuất Báo Cáo Tổng Hợp Tài Chính Theo Toàn Bộ User
  const handleExportUserSummaryCSV = () => {
    const headers = "STT,Ma_User,Ho_Va_Ten,So_Dien_Thoai,Email,Vai_Tro,So_Du_Vi_Hien_Tai_VND,Tong_Nap_Tien_VND,Tong_Chi_Dich_Vu_VND,So_Giao_Dich,Giao_Dich_Moi_Nhat\n";
    const rows = userFinanceSummaries.map((u, idx) => {
      const cleanName = (u.name || '').replace(/"/g, '""');
      const cleanPhone = (u.phone || '').replace(/"/g, '""');
      const cleanEmail = (u.email || '').replace(/"/g, '""');
      const cleanRole = (u.roleName || u.role || 'Thành viên').replace(/"/g, '""');
      const dt = u.latestTxnDate ? formatDateTime(u.latestTxnDate).full : 'Chưa có';
      return `"${idx + 1}","${u.id}","${cleanName}","${cleanPhone}","${cleanEmail}","${cleanRole}","${u.walletBalance || 0}","${u.totalDeposited || 0}","${u.totalSpent || 0}","${u.txnCount || 0}","${dt}"`;
    }).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DatBienDaNang_BaoCao_TaiChinh_TongHop_TheoUser_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất báo cáo tổng hợp tài chính của ${userFinanceSummaries.length} User thành công!`, 'success');
  };

  // Xuất Sao Kê Giao Dịch Chi Tiết của 1 User cụ thể
  const handleExportSingleUserCSV = (userObj) => {
    if (!userObj) return;
    const userTxns = (transactions || []).filter(t => {
      const u = resolveTransactionUser(t);
      return t.userId === userObj.id || u.id === userObj.id;
    });

    const infoHeader = `"BÁO CÁO SAO KÊ GIAO DỊCH TÀI CHÍNH NGƯỜI DÙNG"\n` +
      `"Khách hàng:","${userObj.name}","Mã User:","${userObj.id}"\n` +
      `"Số điện thoại:","${userObj.phone || 'Chưa cập nhật'}","Email:","${userObj.email || 'Chưa cập nhật'}"\n` +
      `"Số dư ví hiện tại:","${(userObj.walletBalance || 0).toLocaleString('vi-VN')} đ","Tổng nạp:","${(userObj.totalDeposited || 0).toLocaleString('vi-VN')} đ","Tổng chi:","${(userObj.totalSpent || 0).toLocaleString('vi-VN')} đ"\n` +
      `"Ngày xuất báo cáo:","${formatDateTime(new Date().toISOString()).full}"\n\n`;

    const tableHeaders = "Ma_GD,Ngay_Gio_GD,Loai_GD,Noi_Dung,Phuong_Thuc,So_Tien_VND,So_Du_Sau_GD_VND,Trang_Thai\n";
    const rows = userTxns.map(t => {
      const dt = formatDateTime(t.createdAt).full;
      const typeLabel = t.type === 'deposit' ? 'Nạp tiền vào ví' : t.type === 'purchase_vip' ? 'Mua VIP / Đăng tin' : 'Đẩy tin';
      const cleanTitle = (t.title || '').replace(/"/g, '""');
      const cleanMethod = (t.paymentMethod || 'Trực tuyến').replace(/"/g, '""');
      return `"${t.id}","${dt}","${typeLabel}","${cleanTitle}","${cleanMethod}","${t.amount}","${t.balanceAfter}","Thành công"`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + infoHeader + tableHeaders + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BDS_SaoKe_${userObj.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất sao kê giao dịch cho người dùng ${userObj.name} (${userTxns.length} GD)!`, 'success');
  };

  // Menu Management Handlers
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuFormData({
      title: '',
      path: '',
      icon: 'fa-solid fa-link',
      badge: '',
      badgeColor: 'bg-emerald-500 text-white',
      isVisible: true,
      target: '_self'
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item) => {
    setEditingMenuItem(item);
    setMenuFormData({
      title: item.title,
      path: item.path,
      icon: item.icon || 'fa-solid fa-link',
      badge: item.badge || '',
      badgeColor: item.badgeColor || 'bg-emerald-500 text-white',
      isVisible: item.isVisible !== undefined ? item.isVisible : true,
      target: item.target || '_self'
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = (e) => {
    e.preventDefault();
    if (!menuFormData.title || !menuFormData.path) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và đường dẫn URL', 'warning');
      return;
    }
    if (editingMenuItem) {
      updateMenuItem(editingMenuItem.id, menuFormData);
    } else {
      addMenuItem(menuFormData);
    }
    setIsMenuModalOpen(false);
  };

  const handleOpenAddSubItem = (parentId) => {
    setActiveSubmenuParentId(parentId);
    setSubFormData({ title: '', path: '', icon: 'fa-solid fa-chevron-right' });
    setIsSubModalOpen(true);
  };

  const handleSaveSubItem = (e) => {
    e.preventDefault();
    if (!subFormData.title || !subFormData.path) {
      showToast('Vui lòng nhập đầy đủ tên và đường dẫn menu con', 'warning');
      return;
    }
    if (activeSubmenuParentId) {
      addSubMenuItem(activeSubmenuParentId, subFormData);
      setIsSubModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* === 1. ADMIN SIDEBAR NAVIGATION === */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-red-600/30">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>BDS</span>
                  <span className="text-red-500">ADMIN</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CMS Quản Trị Trung Tâm</div>
              </div>
            </div>
          </div>

          {/* Admin Profile Mini */}
          <div className="p-4 mx-3 my-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
            <div className="leading-tight truncate">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Super Admin
              </div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="px-3 space-y-1 text-xs font-bold">
            <a
              href="#dashboard"
              onClick={handleNavClick('dashboard')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-chart-line text-sm w-5 text-center"></i>
              <span>Dashboard Tổng Quan</span>
            </a>

            <a
              href="#moderation"
              onClick={handleNavClick('moderation')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                activeMenu === 'moderation' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-list-check text-sm w-5 text-center"></i>
                <span>Kiểm Duyệt Tin Đăng</span>
              </div>
              {pendingProps.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                  {pendingProps.length}
                </span>
              )}
            </a>

            <a
              href="#reports"
              onClick={handleNavClick('reports')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                activeMenu === 'reports' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-flag text-sm w-5 text-center text-rose-400"></i>
                <span>Báo Cáo Vi Phạm</span>
              </div>
              {pendingReportsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {pendingReportsCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-bold">
                  {(listingReports || []).length}
                </span>
              )}
            </a>

            <a
              href="#emails"
              onClick={handleNavClick('emails')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                activeMenu === 'emails' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-envelope-circle-check text-sm w-5 text-center text-blue-400"></i>
                <span>Hộp Thư / Email Logs</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-blue-300 font-bold border border-slate-700">
                {(emailLogs || []).length}
              </span>
            </a>

            <a
              href="#properties"
              onClick={handleNavClick('properties')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'properties' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-city text-sm w-5 text-center"></i>
              <span>Quản Lý Bất Động Sản</span>
            </a>

            <a
              href="#users"
              onClick={handleNavClick('users')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-users-gear text-sm w-5 text-center"></i>
              <span>Người Dùng & Phân Quyền</span>
            </a>

            <a
              href="#finance"
              onClick={handleNavClick('finance')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'finance' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-money-bill-trend-up text-sm w-5 text-center"></i>
              <span>Doanh Thu & Giao Dịch</span>
            </a>

            <a
              href="#pricing"
              onClick={handleNavClick('pricing')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                activeMenu === 'pricing' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-tags text-sm w-5 text-center"></i>
                <span>Bảng Giá Tin Đăng</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                4 cấp
              </span>
            </a>

            <a
              href="#membership"
              onClick={handleNavClick('membership')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                activeMenu === 'membership' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-crown text-sm w-5 text-center text-amber-400"></i>
                <span>Gói Hội Viên</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {(membershipPackages || []).length} gói
              </span>
            </a>

            {/* Nhóm Cài Đặt Website & Giao Diện */}
            <div className="pt-2">
              <a
                href="#settings"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu('settings');
                }}
                className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-left ${
                  activeMenu === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-sliders text-sm w-5 text-center"></i>
                  <span>Cài Đặt Website</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeMenu === 'settings' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    4 Tab
                  </span>
                  <i className={`fa-solid fa-chevron-${activeMenu === 'settings' ? 'down' : 'right'} text-[10px] opacity-70`}></i>
                </div>
              </a>

              {/* Sub-items under Cài Đặt Website */}
              {activeMenu === 'settings' && (
                <div className="mt-1 ml-4 pl-3 py-1 space-y-1 border-l-2 border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSelectSettingsSubTab('system')}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition ${
                      settingsSubTab === 'system'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-gear text-[11px] w-4 text-center"></i>
                      <span>1. Hệ Thống & CSKH</span>
                    </div>
                    {settingsSubTab === 'system' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSettingsSubTab('header')}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition ${
                      settingsSubTab === 'header'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-window-maximize text-[11px] w-4 text-center"></i>
                      <span>2. Header</span>
                    </div>
                    {settingsSubTab === 'header' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSettingsSubTab('menu')}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition ${
                      settingsSubTab === 'menu'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-bars-staggered text-[11px] w-4 text-center"></i>
                      <span>3. Thanh Menu</span>
                    </div>
                    {settingsSubTab === 'menu' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSettingsSubTab('email')}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition ${
                      settingsSubTab === 'email'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-envelope-open-text text-[11px] w-4 text-center text-teal-400"></i>
                      <span>4. Email Setting</span>
                    </div>
                    {settingsSubTab === 'email' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  </button>
                </div>
              )}
            </div>

            <a
              href="#payments"
              onClick={handleNavClick('payments')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'payments' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-credit-card text-sm w-5 text-center"></i>
              <span>Cấu Hình Thanh Toán</span>
            </a>

            <a
              href="#single-config"
              onClick={handleNavClick('single-config')}
              className={`w-full px-3 py-2.5 rounded-xl transition flex items-center gap-3 text-left ${
                activeMenu === 'single-config' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className="fa-solid fa-file-contract text-sm w-5 text-center text-rose-400"></i>
              <span>Cấu Hình Single</span>
            </a>
          </nav>
        </div>

        {/* Bottom Sidebar Action: Back to Home Page & Migration */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 shadow-sm"
            title="Mở Trang Chủ Sàn BĐS trong tab mới"
          >
            <i className="fa-solid fa-house text-emerald-400"></i>
            <span>Xem Trang Chủ Sàn BĐS</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500"></i>
          </a>

          {/* Export / Import Config across computers */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleExportSystemConfig}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded-lg text-[10px] font-bold border border-slate-800 flex items-center justify-center gap-1 transition"
              title="Xuất toàn bộ cấu hình để chuyển sang máy tính khác"
            >
              <i className="fa-solid fa-file-export"></i>
              <span>Xuất Cấu Hình</span>
            </button>
            <button
              onClick={() => configFileInputRef.current?.click()}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-lg text-[10px] font-bold border border-slate-800 flex items-center justify-center gap-1 transition"
              title="Nhập file cấu hình từ máy tính khác"
            >
              <i className="fa-solid fa-file-import"></i>
              <span>Nhập Cấu Hình</span>
            </button>
            <input
              type="file"
              ref={configFileInputRef}
              onChange={handleImportSystemConfig}
              accept=".json"
              className="hidden"
            />
          </div>

          <button
            onClick={resetToMockData}
            className="w-full py-1 text-slate-500 hover:text-slate-300 text-[11px] text-center"
          >
            Khôi phục CSDL mẫu
          </button>
        </div>
      </aside>

      {/* === 2. MAIN CMS CONTENT AREA === */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-900">
        
        {/* Top Header Bar inside CMS */}
        <header className="h-14 sm:h-16 bg-slate-950/70 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <h2 className="text-xs sm:text-base font-black text-white capitalize truncate">
              {activeMenu === 'dashboard' && '📊 Dashboard Thống Kê'}
              {activeMenu === 'moderation' && '📝 Kiểm Duyệt Tin Đăng'}
              {activeMenu === 'reports' && '⚠️ Quản Lý Báo Cáo Vi Phạm'}
              {activeMenu === 'emails' && '📬 Nhật Ký Gửi Email'}
              {activeMenu === 'properties' && '🏢 Danh Mục BĐS Toàn Sàn'}
              {activeMenu === 'users' && '👥 Quản Lý Người Dùng'}
              {activeMenu === 'finance' && '💳 Sổ Cái Giao Dịch & Doanh Thu'}
              {activeMenu === 'pricing' && '👑 Bảng Giá Gói Dịch Vụ VIP'}
              {activeMenu === 'membership' && '👑 Gói Hội Viên'}
              {activeMenu === 'header' && '🎨 Header & Logo'}
              {activeMenu === 'menu' && '🧭 Thanh Menu Điều Hướng'}
              {activeMenu === 'payments' && '💳 Cấu Hình Cổng Thanh Toán'}
              {activeMenu === 'single-config' && '📄 Cấu Hình Trang Chi Tiết BĐS'}
              {activeMenu === 'email-config' && '✉️ Email Setting'}
              {activeMenu === 'settings' && (
                settingsSubTab === 'header'
                  ? '🎨 Cài Đặt Website › Header'
                  : settingsSubTab === 'menu'
                  ? '🧭 Cài Đặt Website › Menu'
                  : settingsSubTab === 'email'
                  ? '✉️ Cài Đặt Website › Email'
                  : '⚙️ Cài Đặt Website › Hệ Thống'
              )}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Box */}
            <div className="relative hidden md:block">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
              <input
                type="text"
                placeholder="Tìm mã tin, user, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 w-52"
              />
            </div>

            {/* Total System Revenue Counter */}
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-black hidden lg:flex items-center gap-1.5">
              <i className="fa-solid fa-coins"></i>
              <span>Tổng thu: {totalRevenue.toLocaleString('vi-VN')} đ</span>
            </div>

            {/* Quick Link: View Public Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Mở Trang Chủ Sàn BĐS trong tab mới"
            >
              <i className="fa-solid fa-globe text-emerald-400"></i>
              <span className="hidden sm:inline">Xem Sàn</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500 hidden sm:inline-block"></i>
            </a>

            {/* Trung Tâm Thông Báo Ban Quản Trị (Notification Center) */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition border ${
                  isNotificationMenuOpen
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                    : pendingReportsCount > 0
                      ? 'bg-rose-950/60 text-rose-400 border-rose-800/80 hover:bg-rose-900/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
                title={`Trung tâm thông báo (${pendingReportsCount} báo cáo vi phạm cần xử lý)`}
              >
                <i className={`fa-solid fa-bell text-sm ${pendingReportsCount > 0 ? 'animate-bounce' : ''}`}></i>
                {pendingReportsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-slate-950 shadow-md animate-pulse">
                    {pendingReportsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationMenuOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-bell text-rose-400"></i>
                      <h4 className="font-black text-white text-xs uppercase tracking-wider">
                        Thông Báo Ban Quản Trị
                      </h4>
                    </div>
                    {pendingReportsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-[10px]">
                        {pendingReportsCount} vi phạm mới
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                        Tất cả đã xử lý
                      </span>
                    )}
                  </div>

                  {/* Filter Tabs inside Dropdown */}
                  <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800/80 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex-1 text-center ${
                        notificationFilter === 'all'
                          ? 'bg-slate-800 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tất cả ({(listingReports || []).length + (emailLogs || []).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('reports')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex-1 text-center flex items-center justify-center gap-1 ${
                        notificationFilter === 'reports'
                          ? 'bg-rose-600 text-white shadow'
                          : 'text-rose-400 hover:text-white'
                      }`}
                    >
                      <span>Vi phạm</span>
                      {pendingReportsCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                      )}
                      <span>({(listingReports || []).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('emails')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex-1 text-center ${
                        notificationFilter === 'emails'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-blue-400 hover:text-white'
                      }`}
                    >
                      Email ({(emailLogs || []).length})
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin">
                    {/* Render Reports */}
                    {(notificationFilter === 'all' || notificationFilter === 'reports') &&
                      (listingReports || []).slice(0, 6).map(report => {
                        const reasonInfo = REPORT_REASONS[report.reason] || { label: report.reason, color: 'rose' };
                        const isPending = report.status === 'pending';
                        return (
                          <div
                            key={report.id}
                            onClick={() => {
                              setActiveMenu('reports');
                              setTargetReportId(report.id);
                              setIsNotificationMenuOpen(false);
                            }}
                            className={`p-3 transition cursor-pointer hover:bg-slate-900/80 space-y-1.5 ${
                              isPending ? 'bg-rose-950/20 border-l-2 border-rose-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-black text-[10px] flex items-center gap-1">
                                <i className="fa-solid fa-flag text-[9px]"></i>
                                <span>Tin #{report.propertyId}</span>
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(report.createdAt).toLocaleDateString('vi-VN')} {new Date(report.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="text-white font-bold line-clamp-1 text-xs">
                              {report.propertyTitle}
                            </div>

                            <div className="text-[11px] text-slate-300">
                              <span className="text-rose-400 font-semibold">{reasonInfo.label}</span>
                              {report.description && (
                                <p className="text-slate-400 italic mt-0.5 line-clamp-2">
                                  "{report.description}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[10px]">
                              <span className="text-slate-400">
                                Người gửi: <strong className="text-slate-300">{report.reporterName}</strong>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded font-bold ${
                                isPending
                                  ? 'bg-amber-400 text-slate-950 animate-pulse'
                                  : report.status === 'delisted'
                                    ? 'bg-rose-900/40 text-rose-300'
                                    : 'bg-emerald-900/40 text-emerald-300'
                              }`}>
                                {isPending ? 'Chờ xử lý' : report.status === 'delisted' ? 'Đã hạ tin' : 'Đã duyệt'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                    {/* Render Email Logs */}
                    {(notificationFilter === 'all' || notificationFilter === 'emails') &&
                      (emailLogs || []).slice(0, 4).map(email => (
                        <div
                          key={email.id}
                          onClick={() => {
                            setActiveMenu('emails');
                            setIsNotificationMenuOpen(false);
                          }}
                          className="p-3 transition cursor-pointer hover:bg-slate-900/80 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] flex items-center gap-1">
                              <i className="fa-solid fa-envelope text-[9px]"></i>
                              <span>Email Hệ Thống</span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(email.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-slate-200 font-medium line-clamp-1 text-xs">
                            {email.subject}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Đến: <strong className="text-blue-300">{email.toName}</strong> ({email.to})
                          </div>
                        </div>
                      ))}

                    {/* Empty State */}
                    {(listingReports || []).length === 0 && (emailLogs || []).length === 0 && (
                      <div className="p-6 text-center text-slate-500 space-y-1">
                        <i className="fa-regular fa-bell-slash text-2xl text-slate-600 mb-1"></i>
                        <p className="text-xs">Không có thông báo mới</p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu('reports');
                        setIsNotificationMenuOpen(false);
                      }}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-center font-bold text-[11px] transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <i className="fa-solid fa-list-check text-xs"></i>
                      <span>Xem Tất Cả Báo Cáo Vi Phạm & Email Logs</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <main className="p-6 space-y-6 flex-1">
          
          {/* =========================================
              PHÂN HỆ 1: DASHBOARD TỔNG QUAN
             ========================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Alert Banner for Pending Reports */}
              {pendingReportsCount > 0 && (
                <div className="bg-gradient-to-r from-rose-950 via-red-950/80 to-slate-950 border-2 border-rose-500/60 p-4 sm:p-5 rounded-3xl shadow-xl shadow-rose-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-xl shrink-0 animate-bounce">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-black text-sm sm:text-base flex items-center gap-2">
                          <span>Có {pendingReportsCount} báo cáo tin rao vi phạm mới từ người dùng!</span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                          Cần xử lý gấp
                        </span>
                      </div>
                      <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl">
                        Người xem vừa gửi phản ánh về thông tin không đúng thực tế (SĐT ảo, giá sai, nhà đã bán...). Vui lòng kiểm duyệt và hạ tin nếu vi phạm để bảo vệ uy tín sàn.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const firstPending = (listingReports || []).find(r => r.status === 'pending');
                        if (firstPending) setTargetReportId(firstPending.id);
                        setActiveMenu('reports');
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-black transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-flag"></i>
                      <span>Kiểm Tra & Xử Lý Ngay ({pendingReportsCount})</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}
              {/* 4 Core KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh thu thu về</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                    {totalRevenue.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <i className="fa-solid fa-arrow-trend-up"></i>
                    +34.5% so với tháng trước
                  </div>
                  <i className="fa-solid fa-wallet absolute -bottom-2 -right-2 text-slate-800/40 text-6xl pointer-events-none"></i>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tin đang hiển thị</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                    {activeProps.length} tin
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Tổng: {properties.length} bài</span>
                    <button
                      onClick={() => { setActiveMenu('properties'); setPropertyAuthorFilter('guest'); }}
                      className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold hover:bg-purple-500/30 text-[10px] border border-purple-500/30"
                      title="Xem danh sách tin của Khách vãng lai"
                    >
                      {guestProps.length} tin Vãng Lai
                    </button>
                  </div>
                  <i className="fa-solid fa-building-circle-check absolute -bottom-2 -right-2 text-slate-800/40 text-6xl pointer-events-none"></i>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cần duyệt ngay</div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-500 mt-1">
                    {pendingProps.length} tin
                  </div>
                  <div className="text-[11px] text-amber-400 mt-2 font-bold">
                    {pendingProps.filter(p => p.vipPackageId === 'vip-diamond').length} tin VIP Kim Cương ưu tiên
                  </div>
                  <i className="fa-solid fa-hourglass-half absolute -bottom-2 -right-2 text-slate-800/40 text-6xl pointer-events-none"></i>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thành viên & Khách</div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                    {usersList.length + guestAuthors.length} người
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>{usersList.length} thành viên</span>
                    <button
                      onClick={() => { setActiveMenu('users'); setUserTab('guests'); }}
                      className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold hover:bg-purple-500/30 text-[10px] border border-purple-500/30"
                      title="Xem danh sách khách vãng lai từng đăng bài"
                    >
                      {guestAuthors.length} Khách Vãng Lai
                    </button>
                  </div>
                  <i className="fa-solid fa-user-check absolute -bottom-2 -right-2 text-slate-800/40 text-6xl pointer-events-none"></i>
                </div>
              </div>

              {/* Revenue Breakdown & Package Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Share Bars (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Cơ Cấu Doanh Thu Gói Dịch Vụ Tin Đăng
                    </h3>
                    <span className="text-xs text-slate-400">7 ngày gần nhất</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-red-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                          VIP Kim Cương (VIP 1 - 100k/ngày)
                        </span>
                        <span className="text-white font-mono">68% (~4.500.000 đ)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full w-[68%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          VIP Vàng (VIP 2 - 50k/ngày)
                        </span>
                        <span className="text-white font-mono">20% (~1.400.000 đ)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[20%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          VIP Bạc (VIP 3 - 25k/ngày)
                        </span>
                        <span className="text-white font-mono">7% (~500.000 đ)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[7%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Dịch Vụ Đẩy Tin (Làm Mới - 5k/lần)
                        </span>
                        <span className="text-white font-mono">5% (~350.000 đ)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[5%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Moderation Queue preview (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Tin Chờ Kiểm Duyệt
                      </h3>
                      <button 
                        onClick={() => setActiveMenu('moderation')}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Xem tất cả ({pendingProps.length})
                      </button>
                    </div>

                    {pendingProps.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        <i className="fa-solid fa-circle-check text-2xl text-emerald-500 mb-2"></i>
                        <div>Không có tin nào cần duyệt!</div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {pendingProps.slice(0, 3).map(p => (
                          <div key={p.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                            <div className="truncate">
                              <span className="font-bold text-amber-400">{p.id}</span>
                              <div className="font-medium text-slate-200 truncate">{p.title}</div>
                              <div className="text-[10px] text-slate-400">{p.priceDisplay} • {p.city}</div>
                            </div>
                            <button
                              onClick={() => approveProperty(p.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0"
                            >
                              Duyệt
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Quy tắc: Tin VIP 1 duyệt trong 5 phút</span>
                    <button onClick={handleExportCSV} className="text-emerald-400 hover:underline">
                      Xuất Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ 2: KIỂM DUYỆT TIN ĐĂNG (MODERATION DESK)
             ========================================= */}
          {activeMenu === 'moderation' && (
            <div className="space-y-4">
              {/* Notice for Auto-Approved vs Pending */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-emerald-400"></i>
                  <span>
                    <strong>Cơ chế hiển thị:</strong> Tin đăng sau khi thanh toán VietQR / MoMo / VNPAY thành công nếu bật Tự động duyệt sẽ nằm ở Tab <strong className="text-emerald-400">"Đang Hiển Thị ({activeProps.length})"</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] shrink-0">
                  <span className="text-slate-400">Tin Khách vãng lai:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {guestProps.length} bài
                  </span>
                </div>
              </div>

              {/* Filter Tabs: Pending / Active / Rejected */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setModerationTab('pending')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      moderationTab === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    <i className="fa-solid fa-clock"></i>
                    Chờ Phê Duyệt ({pendingProps.length})
                  </button>

                  <button
                    onClick={() => setModerationTab('active')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      moderationTab === 'active' ? 'bg-emerald-600 text-white font-black' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    <i className="fa-solid fa-check"></i>
                    Đang Hiển Thị ({activeProps.length})
                  </button>

                  <button
                    onClick={() => setModerationTab('rejected')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      moderationTab === 'rejected' ? 'bg-rose-600 text-white font-black' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    <i className="fa-solid fa-ban"></i>
                    Đã Từ Chối ({rejectedProps.length})
                  </button>
                </div>

                {/* Subfilter for Pending Queues */}
                {moderationTab === 'pending' && pendingProps.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setPendingQueueFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        pendingQueueFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tất Cả ({pendingProps.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingQueueFilter('gold')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        pendingQueueFilter === 'gold' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-amber-400 hover:text-white'
                      }`}
                    >
                      <span>🥇 VIP Vàng (15p)</span>
                      <span className="opacity-80">({goldPending.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingQueueFilter('silver')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        pendingQueueFilter === 'silver' ? 'bg-blue-600 text-white font-black shadow' : 'text-blue-400 hover:text-white'
                      }`}
                    >
                      <span>🥈 VIP Bạc (30p)</span>
                      <span className="opacity-80">({silverPending.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingQueueFilter('normal')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        pendingQueueFilter === 'normal' ? 'bg-slate-700 text-white font-black shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>📋 Tin Thường FIFO (1 Giờ)</span>
                      <span className="opacity-80">({normalPending.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Moderation Listing Cards */}
              <div className="space-y-3">
                {properties
                  .filter(p => p.status === moderationTab)
                  .filter(p => {
                    if (moderationTab !== 'pending') return true;
                    if (pendingQueueFilter === 'gold') return p.vipPackageId === 'vip-gold';
                    if (pendingQueueFilter === 'silver') return p.vipPackageId === 'vip-silver';
                    if (pendingQueueFilter === 'normal') return p.vipPackageId === 'normal' || !p.vipPackageId;
                    return true;
                  })
                  .filter(p => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return p.title.toLowerCase().includes(term) ||
                      p.id.toLowerCase().includes(term) ||
                      (p.author?.name && p.author.name.toLowerCase().includes(term)) ||
                      (p.author?.phone && p.author.phone.includes(term));
                  })
                  .map(prop => {
                    const isDiamond = prop.vipPackageId === 'vip-diamond';
                    const isGold = prop.vipPackageId === 'vip-gold';
                    const isSilver = prop.vipPackageId === 'vip-silver';
                    const isGuest = prop.isGuest || prop.author?.isGuest || String(prop.author?.id).startsWith('guest') || prop.author?.title?.includes('Khách');
                    const countdown = getRemainingCountdown(prop.autoApproveAt);
                    const normalIndex = normalPending.findIndex(p => p.id === prop.id);

                    return (
                      <div
                        key={prop.id}
                        className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        {/* Photo & Specs */}
                        <div className="flex items-start gap-4">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'}
                            alt=""
                            className="w-24 h-20 object-cover rounded-2xl border border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isDiamond 
                                  ? 'bg-red-600 text-white' 
                                  : isGold 
                                  ? 'bg-amber-500 text-slate-950' 
                                  : isSilver
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {prop.vipPackageId?.toUpperCase() || 'TIN THƯỜNG'}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-400">{prop.id}</span>
                              <span className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                                <span>| Người đăng: <strong className="text-white">{prop.author?.name || 'Khách vãng lai'}</strong> ({prop.author?.phone || 'Chưa có SĐT'})</span>
                                {isGuest ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                                    <i className="fa-solid fa-user-secret text-[9px]"></i> Khách Vãng Lai
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                                    <i className="fa-solid fa-user-check text-[9px]"></i> Thành Viên
                                  </span>
                                )}
                              </span>

                              {/* Source of approval in Active tab */}
                              {prop.status === 'active' && (
                                <span className="ml-1">
                                  {isDiamond ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                                      <i className="fa-solid fa-bolt text-[9px]"></i> ⚡ Duyệt Tức Thì (Active Ngay)
                                    </span>
                                  ) : isGold && prop.autoApproved ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                                      <i className="fa-solid fa-clock text-[9px]"></i> ⏱ Kích Hoạt Tự Động (VIP Vàng 15p)
                                    </span>
                                  ) : isSilver && prop.autoApproved ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                                      <i className="fa-solid fa-clock text-[9px]"></i> ⏱ Kích Hoạt Tự Động (VIP Bạc 30p)
                                    </span>
                                  ) : prop.autoApproved ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-emerald-300 border border-slate-700 flex items-center gap-1">
                                      <i className="fa-solid fa-clock text-[9px]"></i> ⏱ Tự Động Xuất Bản (FIFO 1 Tiếng)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                      <i className="fa-solid fa-check text-[9px]"></i> Admin Đã Phê Duyệt
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>

                            <Link 
                              to={getPropertyPermalink(prop)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-white hover:text-emerald-400 transition cursor-pointer line-clamp-1 block"
                            >
                              {prop.title}
                            </Link>

                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                              <span className="text-emerald-400 font-black">{prop.priceDisplay}</span>
                              <span>• {prop.area} m²</span>
                              <span>• {prop.address}, {prop.district}, {prop.city}</span>
                            </div>

                            {/* Live Countdown Queue Notice in Pending Tab */}
                            {prop.status === 'pending' && (
                              <div className="mt-2">
                                {isGold && (
                                  <div className="flex items-center gap-2 p-2 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 w-fit">
                                    <i className="fa-solid fa-clock-rotate-left animate-spin text-amber-400 text-xs"></i>
                                    <span>
                                      <strong>Hàng Đợi Ưu Tiên Sớm (15 Phút):</strong> Còn{' '}
                                      <strong className="text-amber-200 font-mono text-sm underline">
                                        {countdown?.text || '15 phút 00s'}
                                      </strong>{' '}
                                      sẽ tự động Kích Hoạt (Active).
                                    </span>
                                  </div>
                                )}

                                {isSilver && (
                                  <div className="flex items-center gap-2 p-2 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 w-fit">
                                    <i className="fa-solid fa-clock-rotate-left animate-spin text-blue-400 text-xs"></i>
                                    <span>
                                      <strong>Hàng Đợi Ưu Tiên Sớm (30 Phút):</strong> Còn{' '}
                                      <strong className="text-blue-200 font-mono text-sm underline">
                                        {countdown?.text || '30 phút 00s'}
                                      </strong>{' '}
                                      sẽ tự động Kích Hoạt (Active).
                                    </span>
                                  </div>
                                )}

                                {!isDiamond && !isGold && !isSilver && (
                                  <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 w-fit flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                      <i className="fa-solid fa-list-ol text-slate-400 text-xs"></i>
                                      <span>
                                        <strong>Hàng Đợi Tiêu Chuẩn FIFO:</strong> Thứ tự{' '}
                                        <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded ml-0.5">
                                          #{normalIndex !== -1 ? normalIndex + 1 : 1}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-700 pl-2">
                                      <i className="fa-solid fa-clock-rotate-left animate-spin text-emerald-400 text-xs"></i>
                                      <span>
                                        Tự động xuất bản sau:{' '}
                                        <strong className="text-emerald-300 font-mono text-sm underline">
                                          {countdown?.text || '60 phút 00s'}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {prop.rejectReason && (
                              <div className="mt-1 text-[11px] text-rose-400 font-medium">
                                Lý do từ chối: {prop.rejectReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Moderation Actions */}
                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <Link
                            to={getPropertyPermalink(prop)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition inline-flex items-center"
                          >
                            <i className="fa-solid fa-eye mr-1"></i> Xem trước
                          </Link>

                          {prop.status !== 'active' && (
                            <button
                              onClick={() => approveProperty(prop.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
                            >
                              <i className="fa-solid fa-check"></i>
                              <span>{isGold || isSilver ? 'Duyệt Ngay Bây Giờ' : 'Duyệt Xuất Bản'}</span>
                            </button>
                          )}

                          {prop.status === 'pending' && (
                            <button
                              onClick={() => setRejectModalProp(prop)}
                              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl text-xs font-bold transition"
                            >
                              <i className="fa-solid fa-ban mr-1"></i> Từ Chối
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa vĩnh viễn bài đăng ${prop.id}?`)) {
                                deleteProperty(prop.id);
                              }
                            }}
                            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 flex items-center justify-center transition"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ 3: QUẢN LÝ BẤT ĐỘNG SẢN TOÀN SÀN
             ========================================= */}
          {activeMenu === 'properties' && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm space-y-4">
              
              {/* === TOOLBAR TÌM KIẾM & BỘ LỌC ĐA NĂNG CHUẨN BATDONGSAN.COM.VN === */}
              <div className="p-4 border-b border-slate-800 space-y-3.5 bg-slate-950/90">
                {/* Hàng 1: Tiêu đề phân hệ, Nút đăng tin mới & Thanh tìm kiếm mở rộng */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center text-xs">
                        <i className="fa-solid fa-city"></i>
                      </span>
                      <span>Danh Sách Bất Động Sản Toàn Sàn ({properties.length})</span>
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Quản lý đầy đủ danh mục, nhu cầu Mua bán / Cho thuê, thông số kỹ thuật, hạn hiển thị & tự động gia hạn chuẩn Batdongsan
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Nút Đăng Tin BĐS Mới */}
                    <Link
                      to="/dang-tin"
                      target="_blank"
                      className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20 flex items-center gap-1.5 shrink-0"
                    >
                      <i className="fa-solid fa-circle-plus text-sm"></i>
                      <span>Đăng Tin Mới</span>
                    </Link>

                    {/* Thanh tìm kiếm tức thì theo nhiều trường */}
                    <div className="relative w-full sm:w-72">
                      <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                      <input
                        type="text"
                        placeholder="Tìm mã BDS, tiêu đề, SĐT, dự án, khu vực..."
                        value={propertySearchTerm}
                        onChange={(e) => setPropertySearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium transition"
                      />
                      {propertySearchTerm && (
                        <button
                          onClick={() => setPropertySearchTerm('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition"
                          title="Xóa tìm kiếm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hàng 2: Tabs Lọc Trạng Thái Tin Đăng (Batdongsan Lifecycle Tabs) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                  <button
                    onClick={() => setPropertyStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'all'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Tất Cả</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-black">
                      {propertyStatusCounts.all}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-900 text-emerald-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Đang Hiển Thị</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-black border border-emerald-800">
                      {propertyStatusCounts.active}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('expiring_soon')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'expiring_soon'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 text-amber-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <i className="fa-solid fa-triangle-exclamation text-xs text-amber-400 animate-pulse"></i>
                    <span>Sắp Hết Hạn (≤ 3 ngày)</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 font-black border border-amber-600">
                      {propertyStatusCounts.expiringSoon}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('expired')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'expired'
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                        : 'bg-slate-900 text-rose-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <i className="fa-solid fa-ban text-xs"></i>
                    <span>Đã Hết Hạn</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 font-black border border-rose-800">
                      {propertyStatusCounts.expired}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'pending'
                        ? 'bg-yellow-500 text-slate-950 font-black shadow'
                        : 'bg-slate-900 text-yellow-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <i className="fa-regular fa-clock text-xs"></i>
                    <span>Chờ Duyệt</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-yellow-950 text-yellow-300 font-black border border-yellow-800">
                      {propertyStatusCounts.pending}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'rejected'
                        ? 'bg-slate-700 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Từ Chối</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-bold">
                      {propertyStatusCounts.rejected}
                    </span>
                  </button>

                  <button
                    onClick={() => setPropertyStatusFilter('trash')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                      propertyStatusFilter === 'trash'
                        ? 'bg-rose-700 text-white shadow-lg shadow-rose-900/50 ring-2 ring-rose-500/50 font-black'
                        : 'bg-slate-900 text-rose-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                    <span>Thùng Rác</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 font-black border border-rose-800">
                      {propertyStatusCounts.trash}
                    </span>
                  </button>
                </div>

                {/* Hàng 3: Bộ lọc chi tiết (Nhu cầu, Danh mục BĐS, Tỉnh/Thành, Người đăng, Gói VIP, Sắp xếp) */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Nhu cầu (Bán / Thuê) */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setPropertyDemandFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          propertyDemandFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tất cả nhu cầu ({propertyDemandCounts.all})
                      </button>
                      <button
                        onClick={() => setPropertyDemandFilter('sale')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          propertyDemandFilter === 'sale' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-tag text-[10px]"></i>
                        <span>Cần bán ({propertyDemandCounts.sale})</span>
                      </button>
                      <button
                        onClick={() => setPropertyDemandFilter('rent')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          propertyDemandFilter === 'rent' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-key text-[10px]"></i>
                        <span>Cho thuê ({propertyDemandCounts.rent})</span>
                      </button>
                    </div>

                    {/* Filter Danh mục BĐS (8 loại hình chuẩn) */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-layer-group text-amber-400"></i>
                        <span>Danh mục:</span>
                      </span>
                      <select
                        value={propertyCategoryFilter}
                        onChange={(e) => setPropertyCategoryFilter(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer max-w-[170px] truncate"
                      >
                        <option value="all" className="bg-slate-900 text-white">Tất cả danh mục ({properties.length})</option>
                        {PROPERTY_TYPES.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-slate-900 text-white font-medium">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Tỉnh / Thành phố */}
                    {availableCities.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <i className="fa-solid fa-location-dot text-rose-400"></i>
                          <span>Tỉnh/Thành:</span>
                        </span>
                        <select
                          value={propertyCityFilter}
                          onChange={(e) => setPropertyCityFilter(e.target.value)}
                          className="bg-transparent text-white font-bold outline-none cursor-pointer max-w-[140px] truncate"
                        >
                          <option value="all" className="bg-slate-900 text-white">Tất cả địa bàn ({availableCities.length})</option>
                          {availableCities.map(city => (
                            <option key={city} value={city} className="bg-slate-900 text-white">
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Filter Người đăng */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setPropertyAuthorFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          propertyAuthorFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tất cả tác giả
                      </button>
                      <button
                        onClick={() => setPropertyAuthorFilter('guest')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          propertyAuthorFilter === 'guest' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-user-secret text-[10px]"></i>
                        <span>Khách vãng lai ({guestProps.length})</span>
                      </button>
                      <button
                        onClick={() => setPropertyAuthorFilter('member')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          propertyAuthorFilter === 'member' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-user-check text-[10px]"></i>
                        <span>Thành viên ({memberProps.length})</span>
                      </button>
                    </div>

                    {/* Filter Gói VIP */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-crown text-amber-400"></i>
                        <span>Gói:</span>
                      </span>
                      <select
                        value={propertyVipFilter}
                        onChange={(e) => setPropertyVipFilter(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900 text-white">Tất cả gói VIP</option>
                        <option value="vip-diamond" className="bg-slate-900 text-red-400 font-bold">VIP Kim Cương</option>
                        <option value="vip-gold" className="bg-slate-900 text-amber-400 font-bold">VIP Vàng</option>
                        <option value="vip-silver" className="bg-slate-900 text-blue-400 font-bold">VIP Bạc</option>
                        <option value="normal" className="bg-slate-900 text-slate-300">Tin Thường</option>
                      </select>
                    </div>
                  </div>

                  {/* Sắp xếp kết quả */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-arrow-down-short-wide text-slate-400"></i>
                        <span>Sắp xếp:</span>
                      </span>
                      <select
                        value={propertySortBy}
                        onChange={(e) => setPropertySortBy(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer"
                      >
                        <option value="newest" className="bg-slate-900 text-white">Mới đăng nhất</option>
                        <option value="oldest" className="bg-slate-900 text-white">Cũ nhất</option>
                        <option value="expiring_first" className="bg-slate-900 text-amber-400 font-bold">Sắp hết hạn trước</option>
                        <option value="price_desc" className="bg-slate-900 text-white">Giá cao đến thấp</option>
                        <option value="price_asc" className="bg-slate-900 text-white">Giá thấp đến cao</option>
                      </select>
                    </div>

                    {/* Nút đặt lại bộ lọc nếu có lọc */}
                    {(propertySearchTerm || propertyStatusFilter !== 'all' || propertyDemandFilter !== 'all' || propertyCategoryFilter !== 'all' || propertyCityFilter !== 'all' || propertyVipFilter !== 'all' || propertyAuthorFilter !== 'all' || propertySortBy !== 'newest') && (
                      <button
                        onClick={() => {
                          setPropertySearchTerm('');
                          setPropertyStatusFilter('all');
                          setPropertyDemandFilter('all');
                          setPropertyCategoryFilter('all');
                          setPropertyCityFilter('all');
                          setPropertyVipFilter('all');
                          setPropertyAuthorFilter('all');
                          setPropertySortBy('newest');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        title="Đặt lại toàn bộ bộ lọc về mặc định"
                      >
                        <i className="fa-solid fa-rotate-left text-[10px]"></i>
                        <span>Đặt lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Trash Bin Header Notice & Empty Trash Button */}
              {propertyStatusFilter === 'trash' && (
                <div className="mx-4 mb-2 p-3.5 bg-rose-950/40 border border-rose-900/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-3 text-rose-300">
                    <div className="w-8 h-8 rounded-xl bg-rose-900/80 text-rose-200 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>Khu Vực Thùng Rác (Trash Bin)</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] bg-rose-900/80 text-rose-200 font-bold">
                          {propertyStatusCounts.trash} tin đã xóa
                        </span>
                      </div>
                      <div className="text-[11px] text-rose-300/80 mt-0.5">
                        Các bài đăng đã xóa sẽ được lưu giữ tạm thời tại đây. Bạn có thể Khôi phục về website hoặc Xóa vĩnh viễn khỏi Database.
                      </div>
                    </div>
                  </div>

                  {propertyStatusCounts.trash > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn DỌN SẠCH TOÀN BỘ bài viết trong Thùng rác? Toàn bộ bài viết sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu và KHÔNG THỂ KHÔI PHỤC!')) {
                          emptyTrash();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
                    >
                      <i className="fa-solid fa-skull-crossbones text-xs"></i>
                      <span>Dọn Sạch Thùng Rác ({propertyStatusCounts.trash})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Table with filtered properties */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-3">Mã & Nhu Cầu</th>
                      <th className="p-3 min-w-[320px]">Hình ảnh, Tiêu đề & Danh mục</th>
                      <th className="p-3 min-w-[160px]">Thông số & Định giá</th>
                      <th className="p-3">Người đăng & Phân loại</th>
                      <th className="p-3">Gói VIP</th>
                      <th className="p-3">Khu vực</th>
                      <th className="p-3 min-w-[140px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <i className="fa-regular fa-calendar-plus text-emerald-400"></i>
                          <span>Thời Gian Đăng</span>
                        </div>
                      </th>
                      <th className="p-3 min-w-[140px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <i className="fa-regular fa-pen-to-square text-amber-400"></i>
                          <span>Thời Gian Đã Sửa</span>
                        </div>
                      </th>
                      <th className="p-3 min-w-[170px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <i className="fa-regular fa-calendar-xmark text-rose-400"></i>
                          <span>Hạn Hiển Thị (Hết Hạn)</span>
                        </div>
                      </th>
                      <th className="p-3 text-center">Trạng thái</th>
                      <th className="p-3 text-right">Thao tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredPropertiesList.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="p-8 text-center text-slate-400">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl mx-auto mb-2">
                            <i className="fa-solid fa-magnifying-glass"></i>
                          </div>
                          <div className="font-bold text-white text-sm">Không tìm thấy bài viết bất động sản nào</div>
                          <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Không có kết quả khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử từ khóa khác hoặc bấm đặt lại bộ lọc.
                          </div>
                          <button
                            onClick={() => {
                              setPropertySearchTerm('');
                              setPropertyStatusFilter('all');
                              setPropertyDemandFilter('all');
                              setPropertyCategoryFilter('all');
                              setPropertyCityFilter('all');
                              setPropertyVipFilter('all');
                              setPropertyAuthorFilter('all');
                            }}
                            className="mt-3 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow"
                          >
                            Xóa toàn bộ bộ lọc
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredPropertiesList.map(p => {
                        const isGuest = p.isGuest || p.author?.isGuest || String(p.author?.id).startsWith('guest') || p.author?.title?.includes('Khách');
                        const expInfo = getPropertyExpirationInfo(p);
                        const matchedType = PROPERTY_TYPES.find(t => t.id === (p.propertyType || p.type));
                        const typeName = p.propertyTypeName || matchedType?.name || 'Căn hộ chung cư';
                        const typeIcon = matchedType?.icon || 'fa-building';
                        const isRent = p.demand === 'rent';

                        return (
                          <tr key={p.id} className="hover:bg-slate-900/60 transition">
                            {/* Cột 1: Mã BĐS & Nhu Cầu (Bán / Thuê) */}
                            <td className="p-3">
                              <div className="font-mono font-bold text-slate-400">{p.id}</div>
                              <div className="mt-1">
                                {isRent ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1 w-fit shadow-sm">
                                    <i className="fa-solid fa-key text-[9px]"></i> CHO THUÊ
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit shadow-sm">
                                    <i className="fa-solid fa-tag text-[9px]"></i> CẦN BÁN
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Cột 2: Hình ảnh, Tiêu đề, Danh mục & Dự án */}
                            <td className="p-3 min-w-[320px]">
                              <div className="flex items-start gap-3">
                                <div className="relative shrink-0">
                                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'} alt="" className="w-14 h-12 object-cover rounded-xl border border-slate-800" />
                                  {p.images && p.images.length > 1 && (
                                    <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                                      {p.images.length} ảnh
                                    </span>
                                  )}
                                  {p.hasVR360 && (
                                    <span className="absolute top-0.5 left-0.5 bg-cyan-600 text-white text-[8px] px-1 rounded font-black">
                                      VR 360
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/70 inline-flex items-center gap-1">
                                      <i className={`fa-solid ${typeIcon} text-[9px]`}></i>
                                      <span>{typeName}</span>
                                    </span>
                                    {p.project && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[150px]" title={p.project}>
                                        <i className="fa-solid fa-city text-[9px] mr-1 text-slate-400"></i>
                                        {p.project}
                                      </span>
                                    )}
                                  </div>
                                  <Link 
                                    to={getPropertyPermalink(p)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-white hover:text-emerald-400 cursor-pointer line-clamp-2 block transition text-xs leading-snug"
                                  >
                                    {p.title}
                                  </Link>
                                </div>
                              </div>
                            </td>

                            {/* Cột 3: Mức giá, Diện tích & Thông số kỹ thuật (PN, WC, Hướng, Pháp lý) */}
                            <td className="p-3 min-w-[160px]">
                              <div className="font-black text-emerald-400 text-sm">{p.priceDisplay}</div>
                              <div className="text-[11px] text-slate-300 font-bold">
                                {p.area} m² {p.pricePerM2 && <span className="text-[10px] text-slate-400 font-normal">({p.pricePerM2})</span>}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 flex-wrap">
                                {Number(p.bedroom) > 0 && (
                                  <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 flex items-center gap-0.5" title="Phòng ngủ">
                                    <i className="fa-solid fa-bed text-slate-500 text-[9px]"></i>
                                    <span>{p.bedroom} PN</span>
                                  </span>
                                )}
                                {Number(p.bathroom) > 0 && (
                                  <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 flex items-center gap-0.5" title="Phòng tắm / WC">
                                    <i className="fa-solid fa-bath text-slate-500 text-[9px]"></i>
                                    <span>{p.bathroom} WC</span>
                                  </span>
                                )}
                                {p.direction && (
                                  <span className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 flex items-center gap-0.5" title="Hướng cửa">
                                    <i className="fa-solid fa-compass text-slate-500 text-[9px]"></i>
                                    <span>{p.direction}</span>
                                  </span>
                                )}
                                {p.legal && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 truncate max-w-[120px]" title={p.legal}>
                                    {p.legal}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Column: Người Đăng & Phân Loại */}
                            <td className="p-3 min-w-[170px]">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span className="truncate max-w-[130px]">{p.author?.name || p.contactName || 'Khách vãng lai'}</span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {p.author?.phone || p.contactPhone || 'Chưa có SĐT'}
                              </div>
                              <div className="mt-1">
                                {isGuest ? (
                                   <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1 w-fit">
                                    <i className="fa-solid fa-user-secret text-[9px]"></i> Khách Vãng Lai
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1 w-fit">
                                    <i className="fa-solid fa-user-check text-[9px]"></i> Thành Viên
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                p.vipPackageId === 'vip-diamond' ? 'bg-red-600 text-white' :
                                p.vipPackageId === 'vip-gold' ? 'bg-amber-500 text-slate-950' :
                                p.vipPackageId === 'vip-silver' ? 'bg-blue-600 text-white' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {p.vipPackageId?.replace('vip-', 'VIP ') || 'TIN THƯỜNG'}
                              </span>
                            </td>

                            <td className="p-3 text-slate-300 min-w-[130px]">
                              <div className="font-medium text-white">{p.district || 'Chưa rõ quận'}, {p.city || 'Chưa rõ'}</div>
                              {p.street && <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{p.street}</div>}
                            </td>
                            
                            {/* Cột: Thời Gian Đăng Tin */}
                            <td className="p-3 min-w-[140px]">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                                  <i className="fa-regular fa-calendar-plus"></i>
                                </div>
                                <div>
                                  <div className="font-mono font-bold text-slate-200 text-xs">
                                    {formatDateTime(p.publishedAt || p.createdAt || p.submittedAt).date}
                                  </div>
                                  <div className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                                    <i className="fa-regular fa-clock text-[9px]"></i>
                                    <span>{formatDateTime(p.publishedAt || p.createdAt || p.submittedAt).time}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Cột: Thời Gian Đã Sửa Tin */}
                            <td className="p-3 min-w-[140px]">
                              {p.updatedAt ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                                    <i className="fa-regular fa-pen-to-square"></i>
                                  </div>
                                  <div>
                                    <div className="font-mono font-bold text-amber-200 text-xs">
                                      {formatDateTime(p.updatedAt).date}
                                    </div>
                                    <div className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
                                      <i className="fa-regular fa-clock text-[9px]"></i>
                                      <span>{formatDateTime(p.updatedAt).time}</span>
                                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] border border-amber-500/30 font-sans font-bold">
                                        Đã sửa
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-500 italic text-[11px] flex items-center gap-1.5 pl-1">
                                  <i className="fa-solid fa-minus text-[9px]"></i>
                                  <span>Chưa chỉnh sửa</span>
                                </div>
                              )}
                            </td>

                            {/* Cột: Hạn Hiển Thị & Hết Hạn (Chuẩn Batdongsan.com.vn) */}
                            <td className="p-3 min-w-[170px]">
                              <div className="space-y-1">
                                {p.expiresAt ? (
                                  <div>
                                    <div className="font-mono font-bold text-slate-300 text-xs flex items-center gap-1">
                                      <i className="fa-regular fa-calendar-xmark text-slate-400 text-[10px]"></i>
                                      <span>{formatDateTime(p.expiresAt).date}</span>
                                    </div>
                                    <div className="mt-1">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${expInfo.badgeClass}`}>
                                        {expInfo.badgeText}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-slate-500 italic text-[11px]">
                                    {p.status === 'pending' ? 'Chờ kích hoạt' : 'Chưa thiết lập'}
                                  </div>
                                )}
                                {p.autoRenew && (
                                  <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-0.5">
                                    <i className="fa-solid fa-arrows-rotate text-[9px] animate-spin" style={{ animationDuration: '6s' }}></i>
                                    <span>Tự động gia hạn</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Cột: Trạng Thái */}
                            <td className="p-3 text-center">
                              {p.isDeleted || p.status === 'trash' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center justify-center gap-1">
                                  <i className="fa-solid fa-trash-can text-[9px]"></i>
                                  <span>Thùng rác</span>
                                </span>
                              ) : p.isArchived || p.status === 'archived' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-1">
                                  <i className="fa-solid fa-box-archive text-[9px]"></i>
                                  <span>Đã nén DB</span>
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                  p.status === 'expired' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                                  p.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                  'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {p.status === 'active' ? '● Hiển thị' :
                                   p.status === 'expired' ? '🛑 Đã hết hạn' :
                                   p.status === 'pending' ? '⏳ Chờ duyệt' : 'Từ chối'}
                                </span>
                              )}
                            </td>

                            {/* Cột: Thao Tác Admin */}
                            <td className="p-3 text-right">
                              {p.isDeleted || p.status === 'trash' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => restoreProperty(p.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                                    title="Khôi phục bài đăng về website"
                                  >
                                    <i className="fa-solid fa-rotate-left text-[9px]"></i>
                                    <span>Khôi Phục</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`CẢNH BÁO: XÓA VĨNH VIỄN bài đăng ${p.id}? Dữ liệu sẽ mất hoàn toàn khỏi database và không thể khôi phục!`)) {
                                        permanentDeleteProperty(p.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                                    title="Xóa vĩnh viễn khỏi Database"
                                  >
                                    <i className="fa-solid fa-trash-can text-[9px]"></i>
                                    <span>Xóa Vĩnh Viễn</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Nút Gia Hạn (Renew) */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRenewModal(p)}
                                    className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                                    title="Gia hạn thời gian hiển thị (Chuẩn Batdongsan.com.vn)"
                                  >
                                    <i className="fa-solid fa-clock-rotate-left text-[9px]"></i>
                                    <span>Gia Hạn</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProperty(p)}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                                    title="Chỉnh sửa thông tin bài đăng"
                                  >
                                    <i className="fa-solid fa-pen text-[9px]"></i>
                                    <span>Sửa</span>
                                  </button>
                                  <button
                                    onClick={() => { setEditingVipProp(p); setNewVipId(p.vipPackageId); }}
                                    className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-[10px] font-bold"
                                    title="Thay đổi cấp độ gói VIP"
                                  >
                                    Đổi VIP
                                  </button>
                                  <Link
                                    to={getPropertyPermalink(p)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold inline-flex items-center"
                                  >
                                    Xem
                                  </Link>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Chuyển bài đăng ${p.id} vào Thùng rác? Bạn có thể khôi phục bất cứ lúc nào trong tab Thùng Rác.`)) {
                                        moveToTrash(p.id);
                                      }
                                    }}
                                    className="w-6 h-6 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900 flex items-center justify-center text-[10px]"
                                    title="Chuyển vào Thùng rác"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ 4: QUẢN LÝ NGƯỜI DÙNG & KHÁCH VÃNG LAI
             ========================================= */}
          {activeMenu === 'users' && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm space-y-4">
              <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Quản Lý Tài Khoản Thành Viên & Khách Vãng Lai
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Tra cứu hồ sơ môi giới, người mua đã đăng ký và khách vãng lai từng đăng tin
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRefreshUsers}
                    disabled={isSyncingUsers}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm"
                    title="Đồng bộ danh sách người dùng mới nhất từ Cloud / Server"
                  >
                    <i className={`fa-solid ${isSyncingUsers ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'} text-xs`}></i>
                    <span>Đồng Bộ & Làm Mới</span>
                  </button>

                  {/* Sub-tabs: Thành viên vs Khách vãng lai */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => setUserTab('members')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === 'members'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-users text-xs"></i>
                      <span>Thành Viên ({usersList.length})</span>
                    </button>
                    <button
                      onClick={() => setUserTab('guests')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        userTab === 'guests'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-purple-400 hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-user-secret text-xs"></i>
                      <span>Khách Vãng Lai Từng Đăng Tin ({guestAuthors.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* VIEW 1: THÀNH VIÊN ĐÃ ĐĂNG KÝ */}
              {userTab === 'members' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">SĐT</th>
                        <th className="p-3">Vai trò</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Ví Chính (VND)</th>
                        <th className="p-3 text-right">Ví KM (VND)</th>
                        <th className="p-3 text-center">Tích Xanh</th>
                        <th className="p-3 text-right">Thao tác Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {usersList
                        .filter(u => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          return (
                            u.name?.toLowerCase().includes(term) ||
                            u.email?.toLowerCase().includes(term) ||
                            (u.phone && u.phone.includes(term))
                          );
                        })
                        .map(u => {
                          const isPending = u.status === 'pending';
                          const bonusBal = Number(u.bonusWalletBalance || 0);
                          const mainBal = Number(u.walletBalance || 0);

                          return (
                            <tr key={u.id} className="hover:bg-slate-900/60 transition">
                              <td className="p-3 flex items-center gap-2.5 font-bold text-white">
                                <img
                                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white">{u.name}</div>
                                  {isPending && (
                                    <span className="text-[10px] text-amber-400 font-normal">Chờ kích hoạt email</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                              <td className="p-3 font-mono text-slate-300">{u.phone || '—'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.role === 'admin' ? 'bg-red-950 text-red-400 border border-red-800' :
                                  u.role === 'broker' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                  'bg-blue-950 text-blue-400 border border-blue-800'
                                }`}>
                                  {u.roleName || (u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'broker' ? 'Môi Giới' : 'Khách Hàng')}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {isPending ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-700/60 inline-flex items-center gap-1">
                                    <i className="fa-solid fa-clock text-[9px]"></i>
                                    <span>Chờ kích hoạt</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 inline-flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-[9px]"></i>
                                    <span>Đã kích hoạt</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right font-black text-emerald-400 font-mono">
                                {mainBal.toLocaleString('vi-VN')} đ
                              </td>
                              <td className="p-3 text-right font-black text-amber-400 font-mono">
                                {bonusBal > 0 ? (
                                  <span title={u.bonusExpiresAt ? `Hết hạn: ${new Date(u.bonusExpiresAt).toLocaleDateString('vi-VN')}` : 'Ví KM'}>
                                    🎁 {bonusBal.toLocaleString('vi-VN')} đ
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-normal">0 đ</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => toggleUserVerification(u.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                                    u.isVerified 
                                      ? 'bg-blue-600 text-white shadow' 
                                      : 'bg-slate-800 text-slate-500 hover:text-white'
                                  }`}
                                >
                                  <i className="fa-solid fa-circle-check"></i>
                                  <span>{u.isVerified ? 'Đã cấp' : 'Chưa cấp'}</span>
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => handleManualActivate(u.id, u.name)}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                                        title="Kích hoạt ngay và tặng tiền khuyến mãi"
                                      >
                                        <i className="fa-solid fa-bolt text-[9px]"></i>
                                        <span>Kích hoạt</span>
                                      </button>
                                      <button
                                        onClick={() => handleResendUserEmail(u.email)}
                                        className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                                        title="Gửi lại email xác thực"
                                      >
                                        <i className="fa-solid fa-envelope text-[9px]"></i>
                                        <span>Gửi thư</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => { setAdjustWalletUser(u); setAdjustAmount(500000); }}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[10px] font-bold border border-slate-700"
                                  >
                                    ± Sửa ví
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW 2: KHÁCH VÃNG LAI TỪNG ĐĂNG TIN */}
              {userTab === 'guests' && (
                <div className="overflow-x-auto">
                  {guestAuthors.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      <i className="fa-solid fa-user-clock text-3xl text-slate-600 mb-2"></i>
                      <p>Chưa có khách vãng lai nào đăng tin trên hệ thống.</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-3">Khách Vãng Lai</th>
                          <th className="p-3">Số Điện Thoại</th>
                          <th className="p-3">Email Liên Hệ</th>
                          <th className="p-3 text-center">Số Tin Đã Đăng</th>
                          <th className="p-3">Lần Đăng Gần Nhất</th>
                          <th className="p-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {guestAuthors
                          .filter(g => {
                            if (!searchTerm) return true;
                            const term = searchTerm.toLowerCase();
                            return g.name.toLowerCase().includes(term) ||
                              g.email.toLowerCase().includes(term) ||
                              (g.phone && g.phone.includes(term));
                          })
                          .map((g, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60 transition">
                              <td className="p-3 flex items-center gap-2.5 font-bold text-white">
                                <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center text-xs">
                                  <i className="fa-solid fa-user-secret"></i>
                                </div>
                                <div>
                                  <div className="font-bold text-white">{g.name}</div>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                                    Chưa Đăng Ký TK
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400">{g.phone}</td>
                              <td className="p-3 text-slate-400">{g.email}</td>
                              <td className="p-3 text-center">
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-bold text-xs">
                                  {g.listingsCount} tin
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {new Date(g.latestDate).toLocaleDateString('vi-VN')} {new Date(g.latestDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setActiveMenu('properties');
                                    setPropertyAuthorFilter('guest');
                                    setSearchTerm(g.phone !== 'Chưa có SĐT' ? g.phone : g.name);
                                  }}
                                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                                >
                                  <i className="fa-solid fa-newspaper text-xs"></i>
                                  <span>Xem Tin Của Khách</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================
              PHÂN HỆ 5: DOANH THU & SỔ CÁI GIAO DỊCH
             ========================================= */}
          {activeMenu === 'finance' && (
            <div className="space-y-6">
              {/* Header & Export Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <i className="fa-solid fa-file-invoice-dollar text-sm"></i>
                    </span>
                    <h3 className="text-base font-black uppercase text-white tracking-wider">
                      Sổ Cái Giao Dịch & Báo Cáo Doanh Thu
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ghi nhận biến động số dư, đối soát nạp tiền qua VietQR, MoMo, VNPay và doanh thu từ dịch vụ đăng tin VIP.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsUserReportModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
                    title="Mở bảng báo cáo doanh thu & đối soát tài chính theo từng người dùng (User)"
                  >
                    <i className="fa-solid fa-users text-sm"></i>
                    <span>Báo Cáo Theo User</span>
                  </button>

                  <button
                    onClick={handleExportUserSummaryCSV}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                    title="Xuất bảng tổng hợp doanh số và số dư tài chính của tất cả Users ra file CSV"
                  >
                    <i className="fa-solid fa-file-csv text-sm"></i>
                    <span>Xuất Tổng Hợp Users (.CSV)</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                    title="Xuất dữ liệu giao dịch đang lọc ra định dạng Excel CSV (có dấu tiếng Việt UTF-8)"
                  >
                    <i className="fa-solid fa-file-excel text-sm"></i>
                    <span>Xuất Sổ Cái (CSV)</span>
                  </button>
                </div>
              </div>

              {/* 4 Financial KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Doanh thu dịch vụ */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doanh Thu Dịch Vụ</span>
                    <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-coins"></i>
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-2">
                    {filteredRevenue.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-crown text-amber-500 text-[10px]"></i>
                    Thu từ Đăng VIP & Đẩy tin
                  </div>
                  <i className="fa-solid fa-chart-line absolute -bottom-3 -right-2 text-slate-900 text-6xl pointer-events-none"></i>
                </div>

                {/* Tiền nạp vào ví */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dòng Tiền Nạp Ví</span>
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-wallet"></i>
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-2">
                    {filteredDeposit.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-arrow-down text-emerald-400 text-[10px]"></i>
                    Qua VietQR, MoMo, VNPay
                  </div>
                  <i className="fa-solid fa-money-bill-transfer absolute -bottom-3 -right-2 text-slate-900 text-6xl pointer-events-none"></i>
                </div>

                {/* Tổng số giao dịch */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Số Giao Dịch</span>
                    <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-receipt"></i>
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-400 mt-2">
                    {filteredTransactions.length} <span className="text-sm font-semibold text-slate-400">/ {transactions.length} GD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-filter text-blue-400 text-[10px]"></i>
                    {filteredTransactions.length === transactions.length ? 'Toàn bộ hệ thống' : 'Theo bộ lọc hiện tại'}
                  </div>
                  <i className="fa-solid fa-clock-rotate-left absolute -bottom-3 -right-2 text-slate-900 text-6xl pointer-events-none"></i>
                </div>

                {/* Giá trị trung bình / GD */}
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">GD Trung Bình</span>
                    <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-scale-balanced"></i>
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-400 mt-2">
                    {filteredTransactions.length > 0 
                      ? Math.round((filteredRevenue + filteredDeposit) / filteredTransactions.length).toLocaleString('vi-VN') 
                      : 0} đ
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-chart-pie text-purple-400 text-[10px]"></i>
                    Mức chi tiêu / giao dịch
                  </div>
                  <i className="fa-solid fa-calculator absolute -bottom-3 -right-2 text-slate-900 text-6xl pointer-events-none"></i>
                </div>
              </div>

              {/* Advanced Search & Filtering Toolbar */}
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                {/* Search Bar + Date Presets */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo mã GD (TXN-...), người dùng, SĐT, email, nội dung, số tiền, cổng thanh toán..."
                      value={financeSearch}
                      onChange={(e) => setFinanceSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
                    />
                    {financeSearch && (
                      <button
                        onClick={() => setFinanceSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-800"
                        title="Xóa tìm kiếm"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>

                  {/* Date Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'today', label: 'Hôm nay' },
                      { id: '7days', label: '7 ngày qua' },
                      { id: '30days', label: '30 ngày' },
                      { id: 'thisMonth', label: 'Tháng này' },
                      { id: 'custom', label: 'Tùy chọn ngày 📅' },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setFinanceDatePreset(preset.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          financeDatePreset === preset.id
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range Picker (shown when 'custom' is selected) */}
                {financeDatePreset === 'custom' && (
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-amber-500/30 flex flex-wrap items-center gap-3 animate-fadeIn">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <i className="fa-regular fa-calendar-days"></i>
                      <span>Chọn khoảng ngày:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Từ ngày:</span>
                      <input
                        type="date"
                        value={financeStartDate}
                        onChange={(e) => setFinanceStartDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Đến ngày:</span>
                      <input
                        type="date"
                        value={financeEndDate}
                        onChange={(e) => setFinanceEndDate(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    {(financeStartDate || financeEndDate) && (
                      <button
                        onClick={() => { setFinanceStartDate(''); setFinanceEndDate(''); }}
                        className="text-xs text-slate-400 hover:text-rose-400 font-semibold underline ml-auto"
                      >
                        Đặt lại ngày
                      </button>
                    )}
                  </div>
                )}

                {/* User Filter Dropdown & Active User Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1 shrink-0">
                      <i className="fa-solid fa-user text-amber-400 text-[10px]"></i>
                      <span>Lọc theo User:</span>
                    </span>
                    <select
                      value={financeUserFilter}
                      onChange={(e) => setFinanceUserFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[260px]"
                    >
                      <option value="all">Tất cả người dùng ({allFinanceUsers.length})</option>
                      <optgroup label="Thành viên hệ thống">
                        {allFinanceUsers.filter(u => u.role !== 'guest').map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.phone || u.id})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Khách vãng lai">
                        {allFinanceUsers.filter(u => u.role === 'guest').map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.phone || u.id})
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {financeUserFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setFinanceUserFilter('all')}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition flex items-center gap-1"
                        title="Bỏ lọc theo User"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                        <span>Bỏ lọc User</span>
                      </button>
                    )}
                  </div>

                  {financeUserFilter !== 'all' && (() => {
                    const selUser = allFinanceUsers.find(u => u.id === financeUserFilter);
                    const userSummary = userFinanceSummaries.find(u => u.id === financeUserFilter);
                    return selUser ? (
                      <button
                        type="button"
                        onClick={() => handleExportSingleUserCSV(userSummary || selUser)}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                        title="Tải file CSV sao kê giao dịch riêng của User này"
                      >
                        <i className="fa-solid fa-file-arrow-down text-xs"></i>
                        <span>Xuất Sao Kê User: {selUser.name} (.CSV)</span>
                      </button>
                    ) : null;
                  })()}
                </div>

                {/* Sub-Filters: Type & Payment Method */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold mr-1">Loại GD:</span>
                    {[
                      { id: 'all', label: 'Tất cả loại' },
                      { id: 'deposit', label: 'Nạp tiền ví', icon: 'fa-arrow-down text-emerald-400' },
                      { id: 'purchase_vip', label: 'Mua VIP', icon: 'fa-crown text-amber-400' },
                      { id: 'bump_listing', label: 'Đẩy tin', icon: 'fa-rocket text-blue-400' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setFinanceTypeFilter(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          financeTypeFilter === t.id
                            ? 'bg-slate-800 text-white border border-slate-600'
                            : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.icon && <i className={`fa-solid ${t.icon} text-[10px]`}></i>}
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold mr-1">Phương thức:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'vietqr', label: 'VietQR / Ngân hàng' },
                      { id: 'momo', label: 'MoMo' },
                      { id: 'vnpay', label: 'VNPay' },
                      { id: 'wallet', label: 'Số dư ví' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setFinancePaymentFilter(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          financePaymentFilter === p.id
                            ? 'bg-slate-800 text-white border border-slate-600'
                            : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}

                    {/* Reset all filters button */}
                    {(financeSearch || financeUserFilter !== 'all' || financeTypeFilter !== 'all' || financePaymentFilter !== 'all' || financeDatePreset !== 'all' || financeStartDate || financeEndDate) && (
                      <button
                        onClick={() => {
                          setFinanceSearch('');
                          setFinanceUserFilter('all');
                          setFinanceTypeFilter('all');
                          setFinancePaymentFilter('all');
                          setFinanceDatePreset('all');
                          setFinanceStartDate('');
                          setFinanceEndDate('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition flex items-center gap-1"
                        title="Xóa toàn bộ các bộ lọc đang chọn"
                      >
                        <i className="fa-solid fa-rotate-left text-[10px]"></i>
                        <span>Đặt lại</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Transactions Table with Date & Time Column */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Danh Sách Biến Động Số Dư
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 font-mono font-bold text-xs border border-slate-800">
                      {filteredTransactions.length} bản ghi
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-medium hidden sm:block">
                    Cập nhật mới nhất: <span className="text-white font-mono">{formatDateTime(new Date().toISOString()).full}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 font-bold">Mã GD</th>
                        <th className="p-3.5 font-bold">
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <i className="fa-regular fa-clock"></i>
                            <span>Ngày & Giờ GD</span>
                          </div>
                        </th>
                        <th className="p-3.5 font-bold">Người Dùng</th>
                        <th className="p-3.5 font-bold">Loại Giao Dịch</th>
                        <th className="p-3.5 font-bold">Nội Dung Chi Tiết</th>
                        <th className="p-3.5 font-bold">Phương Thức</th>
                        <th className="p-3.5 text-right font-bold">Số Tiền (VND)</th>
                        <th className="p-3.5 text-right font-bold">Số Dư Sau GD</th>
                        <th className="p-3.5 text-center font-bold">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                              <i className="fa-solid fa-magnifying-glass-dollar text-4xl text-slate-700"></i>
                              <div className="font-bold text-slate-400 text-sm">Không tìm thấy giao dịch nào phù hợp</div>
                              <p className="text-xs text-slate-500 max-w-sm">
                                Thử thay đổi từ khóa tìm kiếm (SĐT, Email, Tên), bộ lọc loại giao dịch, lọc user hoặc chọn mốc thời gian khác.
                              </p>
                              <button
                                onClick={() => {
                                  setFinanceSearch('');
                                  setFinanceUserFilter('all');
                                  setFinanceTypeFilter('all');
                                  setFinancePaymentFilter('all');
                                  setFinanceDatePreset('all');
                                  setFinanceStartDate('');
                                  setFinanceEndDate('');
                                }}
                                className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700 transition"
                              >
                                Xóa tất cả bộ lọc
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedTransactions.map(t => {
                          const dt = formatDateTime(t.createdAt);
                          const userInfo = resolveTransactionUser(t);
                          const isDirectIncoming = t.isDirectPayment || 
                                                   t.paymentMethod?.toLowerCase().includes('vietqr') || 
                                                   t.paymentMethod?.toLowerCase().includes('ngân hàng') || 
                                                   t.paymentMethod?.toLowerCase().includes('momo') || 
                                                   t.paymentMethod?.toLowerCase().includes('vnpay');
                          const isPositive = isDirectIncoming || t.type === 'deposit' || (t.amount || 0) > 0;
                          const isGuest = userInfo.role === 'guest' || t.userName?.includes('Khách') || String(t.userId).startsWith('guest') || !t.userId;

                          return (
                            <tr key={t.id} className="hover:bg-slate-900/50 transition">
                              {/* Mã GD */}
                              <td className="p-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                                {t.id}
                              </td>

                              {/* Ngày & Giờ GD (Hiển thị 2 dòng: Giờ:phút:giây trên và Ngày/tháng/năm dưới) */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-bold text-white flex items-center gap-1 font-mono text-xs">
                                    <i className="fa-regular fa-clock text-slate-500 text-[10px]"></i>
                                    {dt.time}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    {dt.date}
                                  </span>
                                </div>
                              </td>

                              {/* Người dùng - Hiển thị Tên, ID, SĐT, Email */}
                              <td className="p-3.5">
                                <div className="flex items-start gap-2.5">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                    isGuest 
                                      ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                                  }`}>
                                    {userInfo.avatar ? (
                                      <img src={userInfo.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                      <i className={`fa-solid ${isGuest ? 'fa-user-secret' : 'fa-user'}`}></i>
                                    )}
                                  </div>
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="font-bold text-white whitespace-nowrap flex items-center gap-1.5">
                                      <span>{userInfo.name}</span>
                                      {userInfo.id && (
                                        <button
                                          type="button"
                                          onClick={() => setFinanceUserFilter(userInfo.id)}
                                          className={`text-[9px] px-1.5 py-0.2 rounded font-normal transition ${
                                            financeUserFilter === userInfo.id
                                              ? 'bg-amber-500 text-slate-950 font-bold'
                                              : 'bg-slate-900 text-slate-400 hover:bg-amber-500 hover:text-slate-950 border border-slate-800'
                                          }`}
                                          title={`Lọc riêng các giao dịch của ${userInfo.name}`}
                                        >
                                          <i className="fa-solid fa-filter text-[8px] mr-0.5"></i>
                                          {financeUserFilter === userInfo.id ? 'Đang lọc' : 'Lọc'}
                                        </button>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      ID: {userInfo.id}
                                    </div>
                                    {userInfo.phone && (
                                      <div className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                                        <i className="fa-solid fa-phone text-[9px] text-emerald-500"></i>
                                        <span>{userInfo.phone}</span>
                                      </div>
                                    )}
                                    {userInfo.email && (
                                      <div className="text-[10px] text-slate-400 truncate max-w-[170px] flex items-center gap-1" title={userInfo.email}>
                                        <i className="fa-regular fa-envelope text-[9px] text-slate-500"></i>
                                        <span>{userInfo.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Loại GD */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                  t.type === 'deposit' 
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                                    : t.type === 'purchase_vip' 
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' 
                                      : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                                }`}>
                                  <i className={`fa-solid ${
                                    t.type === 'deposit' ? 'fa-arrow-down' :
                                    t.type === 'purchase_vip' ? 'fa-crown text-amber-400' : 'fa-rocket'
                                  } text-[9px]`}></i>
                                  {t.type === 'deposit' ? 'Nạp tiền ví' : t.type === 'purchase_vip' ? 'Đăng tin VIP' : 'Đẩy tin'}
                                </span>
                              </td>

                              {/* Nội dung */}
                              <td className="p-3.5 text-slate-300 font-medium max-w-xs truncate" title={t.title}>
                                {t.title}
                              </td>

                              {/* Phương thức */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 w-fit">
                                  {t.paymentMethod?.toLowerCase().includes('vietqr') || t.paymentMethod?.toLowerCase().includes('ngân hàng') ? (
                                    <i className="fa-solid fa-building-columns text-emerald-400 text-[10px]"></i>
                                  ) : t.paymentMethod?.toLowerCase().includes('momo') ? (
                                    <i className="fa-solid fa-mobile-screen-button text-pink-400 text-[10px]"></i>
                                  ) : t.paymentMethod?.toLowerCase().includes('vnpay') ? (
                                    <i className="fa-solid fa-qrcode text-blue-400 text-[10px]"></i>
                                  ) : (
                                    <i className="fa-solid fa-wallet text-amber-400 text-[10px]"></i>
                                  )}
                                  <span>{t.paymentMethod}</span>
                                </span>
                              </td>

                              {/* Số tiền (VND) - Hiển thị chuẩn theo Dòng Tiền Sàn & Phân Loại */}
                              <td className={`p-3.5 text-right font-black whitespace-nowrap ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-black font-mono">
                                    {isPositive 
                                      ? `+${Math.abs(t.amount).toLocaleString('vi-VN')} đ` 
                                      : `-${Math.abs(t.amount).toLocaleString('vi-VN')} đ`}
                                  </span>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isPositive ? 'text-emerald-500/80' : 'text-red-400/80'}`}>
                                    {isDirectIncoming 
                                      ? 'Tiền vào tài khoản sàn' 
                                      : t.type === 'deposit' 
                                      ? 'Nạp tiền vào ví' 
                                      : 'Trừ ví thành viên'}
                                  </span>
                                </div>
                              </td>

                              {/* Số dư sau GD */}
                              <td className="p-3.5 text-right font-mono font-bold text-slate-300 whitespace-nowrap">
                                {t.balanceAfter.toLocaleString('vi-VN')} đ
                              </td>

                              {/* Trạng thái */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800/50 inline-flex items-center gap-1">
                                  <i className="fa-solid fa-check text-[9px]"></i>
                                  <span>Thành công</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Summary & Pagination */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
                  {/* Summary Bar */}
                  <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>
                        Hiển thị <strong className="text-white">{filteredTransactions.length === 0 ? 0 : (financePage - 1) * financePageSize + 1} - {Math.min(financePage * financePageSize, filteredTransactions.length)}</strong> trên <strong className="text-white">{filteredTransactions.length}</strong> GD
                        {filteredTransactions.length !== transactions.length && (
                          <span className="text-slate-500 font-mono ml-1">(Tổng toàn sàn: {transactions.length})</span>
                        )}
                      </span>

                      {/* Page Size Selector */}
                      <div className="flex items-center gap-1.5 ml-0 sm:ml-3 pl-0 sm:pl-3 border-t sm:border-t-0 sm:border-l border-slate-800">
                        <span className="text-[11px] text-slate-500">Xem mỗi trang:</span>
                        <select
                          value={financePageSize}
                          onChange={(e) => {
                            setFinancePageSize(Number(e.target.value));
                            setFinancePage(1);
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="10">10 GD</option>
                          <option value="15">15 GD</option>
                          <option value="25">25 GD</option>
                          <option value="50">50 GD</option>
                          <option value="100">100 GD</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span>
                        Doanh thu lọc: <strong className="text-amber-400 font-mono">{filteredRevenue.toLocaleString('vi-VN')} đ</strong>
                      </span>
                      <span>
                        Tổng nạp lọc: <strong className="text-emerald-400 font-mono">{filteredDeposit.toLocaleString('vi-VN')} đ</strong>
                      </span>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalFinancePages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                      <div className="text-xs text-slate-500">
                        Trang <strong className="text-white">{financePage}</strong> / <strong className="text-white">{totalFinancePages}</strong>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap">
                        {/* First page button */}
                        <button
                          type="button"
                          onClick={() => setFinancePage(1)}
                          disabled={financePage === 1}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Trang đầu tiên"
                        >
                          <i className="fa-solid fa-angles-left text-[10px]"></i>
                        </button>

                        {/* Prev page button */}
                        <button
                          type="button"
                          onClick={() => setFinancePage(p => Math.max(1, p - 1))}
                          disabled={financePage === 1}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
                        >
                          <i className="fa-solid fa-chevron-left text-[10px]"></i>
                          <span className="hidden sm:inline">Trước</span>
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let start = Math.max(1, financePage - Math.floor(maxVisible / 2));
                          let end = Math.min(totalFinancePages, start + maxVisible - 1);
                          if (end - start + 1 < maxVisible) {
                            start = Math.max(1, end - maxVisible + 1);
                          }
                          for (let i = start; i <= end; i++) {
                            pages.push(i);
                          }
                          return pages.map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFinancePage(p)}
                              className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                                financePage === p
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                              }`}
                            >
                              {p}
                            </button>
                          ));
                        })()}

                        {/* Next page button */}
                        <button
                          type="button"
                          onClick={() => setFinancePage(p => Math.min(totalFinancePages, p + 1))}
                          disabled={financePage === totalFinancePages}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
                        >
                          <span className="hidden sm:inline">Sau</span>
                          <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </button>

                        {/* Last page button */}
                        <button
                          type="button"
                          onClick={() => setFinancePage(totalFinancePages)}
                          disabled={financePage === totalFinancePages}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Trang cuối cùng"
                        >
                          <i className="fa-solid fa-angles-right text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ 6: CẤU HÌNH BẢNG GIÁ TIN ĐĂNG (LISTING TYPES)
             ========================================= */}
          {activeMenu === 'pricing' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-tags text-red-500"></i>
                    <span>Cấu Hình Bảng Giá Tin Đăng (4 Cấp Độ Tin VIP)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Giá mới sẽ được áp dụng ngay lập tức khi người dùng đăng tin hoặc nâng cấp gói tin trên hệ thống.
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu('membership')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <i className="fa-solid fa-crown text-amber-400"></i>
                  <span>Sang Gói Hội Viên ➔</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vipPackages.map(pkg => (
                  <div key={pkg.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pkg.badgeColor}`}>
                          {pkg.shortName}
                        </span>
                        <span className="text-xs font-black text-white">{pkg.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Cấp {pkg.level}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {pkg.id === 'vip-diamond' ? (
                        <span className="text-red-400 font-bold">★ Đặc quyền: Tặng kèm 1 Tin Thường + Đẩy tin kèm MIỄN PHÍ</span>
                      ) : pkg.id === 'normal' ? (
                        <span className="text-slate-300">Tin Thường đăng chuẩn 35k/7 ngày • Hỗ trợ Voucher Hội viên</span>
                      ) : (
                        <span>{pkg.features?.[0]}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="text-[11px] text-slate-400">
                        Tối thiểu: <b className="text-slate-200">{pkg.minDays} ngày</b>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={pkg.pricePerDay}
                          id={`price-${pkg.id}`}
                          className="w-28 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-right text-emerald-400"
                        />
                        <span className="text-xs text-slate-400">đ/ngày</span>
                        <button
                          onClick={() => {
                            const val = document.getElementById(`price-${pkg.id}`)?.value;
                            if (val) updateVipPackagePrice(pkg.id, val);
                          }}
                          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dịch vụ đẩy tin lẻ */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                    <i className="fa-solid fa-arrow-up-right-dots"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dịch Vụ Đẩy Tin (Làm Mới Tin Lên Đầu Trang)</div>
                    <div className="text-[11px] text-slate-400">Cập nhật thời gian hiển thị lên đầu trang theo đúng cấp độ VIP</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-400 font-mono">10.000 đ/lần</span>
                  <div className="text-[10px] text-slate-500">Được tặng voucher khi mua Gói Hội Viên</div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ: CẤU HÌNH GÓI HỘI VIÊN
             ========================================= */}
          {activeMenu === 'membership' && (
            <AdminMembershipManager onNavigateToPricing={() => setActiveMenu('pricing')} />
          )}

                    {/* =========================================
              PHÂN HỆ CẤU HÌNH HEADER (FORWARD TỚI SETTINGS TAB)
             ========================================= */}
          {activeMenu === 'header' && (
            <AdminHeaderConfigManager onSwitchToMenu={() => handleSelectSettingsSubTab('menu')} />
          )}

          {/* =========================================
              PHÂN HỆ CẤU HÌNH MENU (FORWARD TỚI SETTINGS TAB)
             ========================================= */}
          {activeMenu === 'menu' && (
            <AdminMenuConfigManager onSwitchToHeader={() => handleSelectSettingsSubTab('header')} />
          )}

          {/* =========================================
              PHÂN HỆ: CẤU HÌNH PHƯƠNG THỨC THANH TOÁN (VIETQR, MOMO, VNPAY, VÍ NỘI BỘ)
             ========================================= */}
          {activeMenu === 'payments' && (
            <div className="space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-credit-card"></i>
                    </span>
                    <h2 className="text-lg font-black text-white">
                      Cấu Hình Cổng Thanh Toán & Tài Khoản Nhận Tiền
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Quản lý tài khoản thụ hưởng VietQR Napas 24/7, ví MoMo, VNPAY, thiết lập hiển thị thanh toán cho khách vãng lai và cơ chế tự động kích hoạt tin sau khi thanh toán.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPaymentSettings}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition flex items-center gap-1.5"
                    title="Khôi phục thiết lập thanh toán về mặc định"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>Khôi Phục Mặc Định</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePaymentSettings}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                  >
                    <i className="fa-solid fa-floppy-disk"></i>
                    <span>Lưu Cấu Hình Thanh Toán</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Cổng VietQR Napas</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formPaymentConfig?.vietqr?.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                      <span>{formPaymentConfig?.vietqr?.enabled ? 'Đang Hoạt Động' : 'Đã Tắt'}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold">
                      {formPaymentConfig?.vietqr?.bankCode} - {formPaymentConfig?.vietqr?.accountNumber}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-qrcode"></i>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Ví MoMo</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formPaymentConfig?.momo?.enabled ? 'bg-pink-400' : 'bg-slate-600'}`}></span>
                      <span>{formPaymentConfig?.momo?.enabled ? 'Đang Hoạt Động' : 'Đã Tắt'}</span>
                    </div>
                    <div className="text-[11px] text-pink-400 font-mono font-bold">
                      {formPaymentConfig?.momo?.phoneNumber || 'Chưa thiết lập'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-pink-950 text-pink-400 border border-pink-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-mobile-screen-button"></i>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Cổng VNPAY-QR</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formPaymentConfig?.vnpay?.enabled ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
                      <span>{formPaymentConfig?.vnpay?.enabled ? 'Đang Hoạt Động' : 'Đã Tắt'}</span>
                    </div>
                    <div className="text-[11px] text-blue-400 font-mono">
                      {formPaymentConfig?.vnpay?.sandbox ? 'Chế độ Sandbox' : 'Production'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-bold uppercase">Ví Tài Khoản Nội Bộ</div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formPaymentConfig?.wallet?.enabled ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
                      <span>{formPaymentConfig?.wallet?.enabled ? 'Thành Viên' : 'Đã Tắt'}</span>
                    </div>
                    <div className="text-[10px] text-amber-300">
                      Khách vãng lai: Tự ẩn ví
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Settings Form (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* CARD 1: Cổng VietQR Napas 24/7 */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm">
                          <i className="fa-solid fa-qrcode"></i>
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>1. Cổng Chuyển Khoản VietQR Napas 24/7</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              Ưu tiên số 1
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Khách hàng quét mã bằng bất kỳ App ngân hàng nào, tự động điền STK, số tiền & cú pháp
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPaymentConfig?.vietqr?.enabled ?? true}
                          onChange={(e) => setFormPaymentConfig(prev => ({
                            ...prev,
                            vietqr: { ...prev.vietqr, enabled: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Chọn Ngân Hàng */}
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Ngân Hàng Thụ Hưởng (Liên minh VietQR / Napas 247):
                        </label>
                        <select
                          value={formPaymentConfig?.vietqr?.bankCode || 'MB'}
                          onChange={handleBankSelect}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                        >
                          {(VIETNAM_BANKS || []).map((b) => (
                            <option key={b.code} value={b.code}>
                              {b.shortName} - {b.name} (BIN: {b.bin})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Số Tài Khoản & Tên Tài Khoản */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Số Tài Khoản Nhận Tiền:
                          </label>
                          <input
                            type="text"
                            value={formPaymentConfig?.vietqr?.accountNumber || ''}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vietqr: { ...prev.vietqr, accountNumber: e.target.value.replace(/\s+/g, '') }
                            }))}
                            placeholder="Ví dụ: 0898246607"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Tên Chủ Tài Khoản (In hoa, không dấu):
                          </label>
                          <input
                            type="text"
                            value={formPaymentConfig?.vietqr?.accountName || ''}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vietqr: { ...prev.vietqr, accountName: e.target.value.toUpperCase() }
                            }))}
                            placeholder="Ví dụ: CONG TY DAT BIEN DA NANG"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold uppercase outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Tiền tố cú pháp */}
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Tiền Tố Cú Pháp Chuyển Khoản (Syntax Prefix):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formPaymentConfig?.vietqr?.syntaxPrefix || 'BDS'}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vietqr: { ...prev.vietqr, syntaxPrefix: e.target.value.toUpperCase().trim() }
                            }))}
                            placeholder="BDS"
                            className="w-32 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-black outline-none focus:border-emerald-500 uppercase text-center"
                          />
                          <span className="text-[11px] text-slate-400">
                            Cú pháp sinh tự động sẽ có dạng: <strong className="text-white font-mono">{formPaymentConfig?.vietqr?.syntaxPrefix || 'BDS'} [SĐT_MÔI_GIỚI]</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Ví MoMo & Cổng VNPAY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* MoMo Settings */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">
                            <i className="fa-solid fa-mobile-screen-button"></i>
                          </span>
                          <span className="font-bold text-white text-xs">2. Ví Điện Tử MoMo</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPaymentConfig?.momo?.enabled ?? true}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              momo: { ...prev.momo, enabled: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Số MoMo nhận tiền:</label>
                          <input
                            type="text"
                            value={formPaymentConfig?.momo?.phoneNumber || ''}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              momo: { ...prev.momo, phoneNumber: e.target.value }
                            }))}
                            placeholder="0898246607"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Tên chủ ví MoMo:</label>
                          <input
                            type="text"
                            value={formPaymentConfig?.momo?.accountName || ''}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              momo: { ...prev.momo, accountName: e.target.value.toUpperCase() }
                            }))}
                            placeholder="NGUYEN VAN QUAN TRI"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* VNPAY Settings */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                            <i className="fa-solid fa-credit-card"></i>
                          </span>
                          <span className="font-bold text-white text-xs">3. Cổng VNPAY-QR</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPaymentConfig?.vnpay?.enabled ?? true}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vnpay: { ...prev.vnpay, enabled: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Mã Website (TMN Code):</label>
                          <input
                            type="text"
                            value={formPaymentConfig?.vnpay?.tmnCode || ''}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vnpay: { ...prev.vnpay, tmnCode: e.target.value }
                            }))}
                            placeholder="DATBIENDANANG"
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs"
                          />
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-slate-400 text-[11px] font-bold">Chế độ Thử nghiệm (Sandbox):</span>
                          <input
                            type="checkbox"
                            checked={formPaymentConfig?.vnpay?.sandbox ?? true}
                            onChange={(e) => setFormPaymentConfig(prev => ({
                              ...prev,
                              vnpay: { ...prev.vnpay, sandbox: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: Ví Nội Bộ & Quy Tắc Khách Vãng Lai */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm">
                          <i className="fa-solid fa-wallet"></i>
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>4. Ví Tài Khoản Nội Bộ & Quy Chế Khách Vãng Lai</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Thanh toán khấu trừ số dư tài khoản đã nạp trực tiếp
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPaymentConfig?.wallet?.enabled ?? true}
                          onChange={(e) => setFormPaymentConfig(prev => ({
                            ...prev,
                            wallet: { ...prev.wallet, enabled: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                      <div className="font-bold text-amber-400 flex items-center gap-2">
                        <i className="fa-solid fa-circle-info"></i>
                        <span>Quy Tắc Hiển Thị Phân Luồng Người Dùng:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed pl-1">
                        <li>
                          <strong className="text-white">Khách vãng lai (Chưa đăng nhập):</strong> Khi bấm đăng tin, hệ thống sẽ <strong className="text-amber-300">tự động ẩn "Ví tài khoản"</strong> và chỉ hiển thị 3 cổng thanh toán trực tiếp: <strong>VietQR Napas 24/7</strong>, <strong>Ví MoMo</strong>, và <strong>Cổng VNPAY</strong>.
                        </li>
                        <li>
                          <strong className="text-white">Thành viên (Đã đăng nhập):</strong> Hiển thị đầy đủ cả Ví tài khoản (nếu số dư khả dụng $\ge$ số tiền đăng tin) cùng với các phương thức nạp/thanh toán trực tiếp.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* CARD 5: Quy Chế Thanh Toán Trước - Phê Duyệt Tự Động Theo Cấp Độ Tin Đăng */}
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-sm">
                          <i className="fa-solid fa-bolt"></i>
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>5. Quy Chế Thanh Toán Trước - Phê Duyệt Tự Động Theo Cấp Độ</span>
                            <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
                              Tự Động 24/7
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Xác lập cơ chế duyệt tức thì & hàng đợi ưu tiên sớm sau khi thanh toán thành công
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormPaymentConfig(prev => ({
                            ...prev,
                            approvalTiers: DEFAULT_APPROVAL_TIERS,
                            autoApproveVip: true,
                            autoApproveOther: true
                          }));
                          showToast('Đã đặt lại quy chế duyệt tin theo chuẩn mặc định', 'info');
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold border border-slate-800 transition"
                      >
                        <i className="fa-solid fa-rotate-left mr-1"></i> Mặc định
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* 1. VIP KIM CƯƠNG */}
                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-red-900/50 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                              VIP KIM CƯƠNG ★★★★★
                            </span>
                            <span className="font-bold text-white text-xs">Duyệt Tức Thì Tự Động (Active Ngay)</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/30">
                            ⚡ 0 giây (Ngay lập tức)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Khi khách hàng (hoặc môi giới) thanh toán xong tin VIP Kim Cương, hệ thống sẽ <strong>tự động duyệt và kích hoạt trạng thái Active ngay lập tức</strong>, đẩy bài lên vị trí số 1 Trang Chủ & Tìm Kiếm mà không cần Admin can thiệp.
                        </p>
                      </div>

                      {/* 2. VIP VÀNG */}
                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-800/50 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                              VIP VÀNG ★★★★
                            </span>
                            <span className="font-bold text-white text-xs">Ưu Tiên Sớm (15 Phút Tự Động Duyệt)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Thời gian duyệt:</span>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={formPaymentConfig?.approvalTiers?.['vip-gold']?.delayMinutes ?? 15}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 15);
                                setFormPaymentConfig(prev => ({
                                  ...prev,
                                  approvalTiers: {
                                    ...(prev.approvalTiers || DEFAULT_APPROVAL_TIERS),
                                    'vip-gold': {
                                      ...(prev.approvalTiers?.['vip-gold'] || DEFAULT_APPROVAL_TIERS['vip-gold']),
                                      delayMinutes: val
                                    }
                                  }
                                }));
                              }}
                              className="w-14 p-1 text-center bg-slate-950 border border-amber-600/50 rounded-lg text-amber-300 font-mono font-bold text-xs"
                            />
                            <span className="text-amber-400 font-bold text-[11px]">phút</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Tin được xếp vào <strong>Hàng Đợi Ưu Tiên Cấp Tốc</strong> với đồng hồ đếm ngược 15 phút. Admin có thể duyệt sớm bất kỳ lúc nào, hoặc nếu hết 15 phút hệ thống sẽ <strong>tự động chuyển trạng thái Active</strong>.
                        </p>
                      </div>

                      {/* 3. VIP BẠC */}
                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-blue-800/50 space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                              VIP BẠC ★★★
                            </span>
                            <span className="font-bold text-white text-xs">Ưu Tiên Sớm (30 Phút Tự Động Duyệt)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Thời gian duyệt:</span>
                            <input
                              type="number"
                              min="1"
                              max="180"
                              value={formPaymentConfig?.approvalTiers?.['vip-silver']?.delayMinutes ?? 30}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 30);
                                setFormPaymentConfig(prev => ({
                                  ...prev,
                                  approvalTiers: {
                                    ...(prev.approvalTiers || DEFAULT_APPROVAL_TIERS),
                                    'vip-silver': {
                                      ...(prev.approvalTiers?.['vip-silver'] || DEFAULT_APPROVAL_TIERS['vip-silver']),
                                      delayMinutes: val
                                    }
                                  }
                                }));
                              }}
                              className="w-14 p-1 text-center bg-slate-950 border border-blue-600/50 rounded-lg text-blue-300 font-mono font-bold text-xs"
                            />
                            <span className="text-blue-400 font-bold text-[11px]">phút</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Tin VIP Bạc được ưu tiên xử lý trước toàn bộ Tin Thường. Tự động kích hoạt hiển thị sau 30 phút nếu ban quản trị chưa duyệt thủ công.
                        </p>
                      </div>

                      {/* 4. TIN THƯỜNG */}
                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-black uppercase">
                              TIN THƯỜNG (TIÊU CHUẨN)
                            </span>
                            <span className="font-bold text-white text-xs">Hàng Đợi Tiêu Chuẩn FIFO (Tự Động Xuất Bản 1 Tiếng)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Tự động xuất bản sau:</span>
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={formPaymentConfig?.approvalTiers?.['normal']?.delayMinutes ?? 60}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 60);
                                setFormPaymentConfig(prev => ({
                                  ...prev,
                                  approvalTiers: {
                                    ...(prev.approvalTiers || DEFAULT_APPROVAL_TIERS),
                                    'normal': {
                                      ...(prev.approvalTiers?.['normal'] || DEFAULT_APPROVAL_TIERS['normal']),
                                      mode: 'countdown',
                                      delayMinutes: val
                                    }
                                  }
                                }));
                              }}
                              className="w-16 p-1 text-center bg-slate-950 border border-slate-600 rounded-lg text-emerald-400 font-mono font-bold text-xs"
                            />
                            <span className="text-slate-400 font-bold text-[11px]">phút (1 tiếng)</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Tin Thường sau khi thanh toán được đưa vào <strong>Hàng Đợi Tiêu Chuẩn FIFO</strong>. Ban quản trị có thể duyệt sớm theo thứ tự tiếp nhận, hoặc hệ thống <strong>tự động xuất bản trong vòng 1 tiếng (60 phút)</strong> để đảm bảo quyền lợi hiển thị cho người đăng.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Live Simulator (5 cols) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Trình Giả Lập Quét Mã QR (Live Napas VietQR Preview)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono border border-slate-800">
                        Napas 24/7
                      </span>
                    </div>

                    {/* Mockup Payment Screen */}
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="text-center space-y-1">
                        <div className="text-xs font-black text-white">
                          Cổng Thanh Toán VietQR Tự Động
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Mở app Ngân hàng quét mã để thanh toán tự động
                        </div>
                      </div>

                      {/* Live Generated VietQR Image */}
                      <div className="bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center mx-auto max-w-[220px]">
                        <img
                          src={`https://img.vietqr.io/image/${formPaymentConfig?.vietqr?.bankBin || '970422'}-${formPaymentConfig?.vietqr?.accountNumber || '0898246607'}-compact2.png?amount=150000&addInfo=${encodeURIComponent((formPaymentConfig?.vietqr?.syntaxPrefix || 'BDS') + ' 0901234567')}&accountName=${encodeURIComponent(formPaymentConfig?.vietqr?.accountName || 'BDS LANDMARK VIETNAM')}`}
                          alt="VietQR Live Preview"
                          className="w-full h-auto object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BDS%20THANH%20TOAN%20VIETQR';
                          }}
                        />
                      </div>

                      {/* Live Transfer Information Breakdown */}
                      <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                          <strong className="text-white text-right max-w-[170px] truncate">
                            {formPaymentConfig?.vietqr?.bankName || 'MBBank Quân Đội'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Số tài khoản:</span>
                          <strong className="text-emerald-400 font-mono font-bold text-xs">
                            {formPaymentConfig?.vietqr?.accountNumber || '0898246607'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Chủ tài khoản:</span>
                          <strong className="text-white uppercase text-right max-w-[170px] truncate">
                            {formPaymentConfig?.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Số tiền mẫu:</span>
                          <strong className="text-red-400 font-bold">150.000 đ</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800">
                          <span className="text-slate-400">Cú pháp chuyển khoản:</span>
                          <strong className="text-blue-400 font-mono font-bold">
                            {(formPaymentConfig?.vietqr?.syntaxPrefix || 'BDS')} 0901234567
                          </strong>
                        </div>
                      </div>

                      {/* Mockup Button */}
                      <button
                        type="button"
                        onClick={() => showToast('Đây là nút mô phỏng dành cho khách hàng khi thực hiện giao dịch!', 'info')}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Tôi Đã Chuyển Khoản Xong & Kích Hoạt Tin</span>
                      </button>

                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-[10px] text-emerald-300 flex items-start gap-1.5">
                        <i className="fa-solid fa-shield-halved mt-0.5 text-xs"></i>
                        <span>
                          Dữ liệu cấu hình ở bảng này được đồng bộ tức thì với Modal Đăng Tin ngoài giao diện Frontend cho toàn bộ khách hàng.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================
              PHÂN HỆ: CÀI ĐẶT WEBSITE TOÀN DIỆN (HỆ THỐNG, HEADER, MENU)
             ========================================= */}
          {activeMenu === 'settings' && (
            <div className="space-y-6">
              {/* Top Multi-Option Segmented Tab Bar */}
              <div className="bg-slate-950 p-3 sm:p-4 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Section Header & Active Sub-Tab Badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shadow-inner shrink-0">
                      <i className="fa-solid fa-sliders"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-white">
                          Trung Tâm Cài Đặt Website
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          {settingsSubTab === 'system' ? '⚙️ Hệ Thống' : settingsSubTab === 'header' ? '🎨 Header' : settingsSubTab === 'menu' ? '🧭 Thanh Menu' : '✉️ Email Setting'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Quản lý toàn diện nhận diện thương hiệu, giao diện Header, danh mục menu, Email Setting và vận hành hệ thống.
                      </p>
                    </div>
                  </div>

                  {/* Right: 4 Segmented Options Switcher */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                    {/* Option 1: System */}
                    <button
                      type="button"
                      onClick={() => handleSelectSettingsSubTab('system')}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer ${
                        settingsSubTab === 'system'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <i className="fa-solid fa-gear text-sm"></i>
                      <div className="text-left">
                        <div className="leading-tight">1. Cài Đặt Hệ Thống</div>
                        <div className="text-[10px] font-normal opacity-80 hidden sm:block">CSKH, Duyệt Tin, DB</div>
                      </div>
                    </button>

                    {/* Option 2: Header */}
                    <button
                      type="button"
                      onClick={() => handleSelectSettingsSubTab('header')}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer ${
                        settingsSubTab === 'header'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <i className="fa-solid fa-window-maximize text-sm"></i>
                      <div className="text-left">
                        <div className="leading-tight">2. Header</div>
                        <div className="text-[10px] font-normal opacity-80 hidden sm:block">Logo & Độ Rộng Navbar</div>
                      </div>
                    </button>

                    {/* Option 3: Menu */}
                    <button
                      type="button"
                      onClick={() => handleSelectSettingsSubTab('menu')}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer ${
                        settingsSubTab === 'menu'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <i className="fa-solid fa-bars-staggered text-sm"></i>
                      <div className="text-left">
                        <div className="leading-tight">3. Thanh Menu</div>
                        <div className="text-[10px] font-normal opacity-80 hidden sm:block">
                          {(navMenuItems || []).length} mục điều hướng
                        </div>
                      </div>
                    </button>

                    {/* Option 4: Email Setting */}
                    <button
                      type="button"
                      onClick={() => handleSelectSettingsSubTab('email')}
                      className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center sm:justify-start gap-2.5 cursor-pointer ${
                        settingsSubTab === 'email'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <i className="fa-solid fa-envelope-open-text text-sm"></i>
                      <div className="text-left">
                        <div className="leading-tight">4. Email Setting</div>
                        <div className="text-[10px] font-normal opacity-80 hidden sm:block">
                          SMTP & 5 Mẫu Thư
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* TAB 1: HỆ THỐNG & CSKH */}
              {settingsSubTab === 'system' && (
                <div className="space-y-6 max-w-5xl">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
                      <i className="fa-solid fa-sliders"></i>
                    </span>
                    <h3 className="text-base font-black text-white">
                      Cài Đặt Vận Hành Hệ Thống Sàn BĐS
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cấu hình thông tin thương hiệu, kênh CSKH 24/7 (Hotline, Zalo, Email), cơ chế tự động duyệt tin VIP và thiết lập vận hành toàn hệ thống.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetSystemSettings}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition flex items-center gap-1.5"
                    title="Khôi phục toàn bộ cài đặt sàn về mặc định"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>Mặc Định</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingSystem}
                    onClick={handleSaveSystemConfig}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5"
                  >
                    <i className={isSavingSystem ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"}></i>
                    <span>{isSavingSystem ? "Đang lưu..." : "Lưu Cài Đặt Hệ Thống"}</span>
                  </button>
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Inputs (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Nhóm 1: Nhận diện thương hiệu sàn */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-building text-emerald-400 text-sm"></i>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          1. Thông Tin Nhận Diện Thương Hiệu
                        </h4>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 self-start sm:self-auto">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        Đồng bộ tự động Header, Footer & Email
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Tên Sàn Giao Dịch Đầy Đủ <span className="text-red-400">*</span>:
                        </label>
                        <input
                          type="text"
                          value={formSystemConfig.platformName || ''}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, platformName: e.target.value }))}
                          placeholder="Ví dụ: SÀN GIAO DỊCH BẤT ĐỘNG SẢN LANDMARK VIỆT NAM"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Tên pháp nhân đầy đủ dùng cho bản quyền chân trang (Footer), Chữ ký Email & Miễn trừ trách nhiệm tin BĐS.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Tên Thương Hiệu Rút Gọn:
                          </label>
                          <input
                            type="text"
                            value={formSystemConfig.brandShortName || ''}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, brandShortName: e.target.value }))}
                            placeholder="Ví dụ: LANDMARK VIỆT NAM"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Tự động đồng bộ lên Logo Navbar, Topbar, Chân trang Footer & Khối kiểm duyệt tin.
                          </p>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Khẩu Hiệu / Slogan Sàn:
                          </label>
                          <input
                            type="text"
                            value={formSystemConfig.tagline || ''}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, tagline: e.target.value }))}
                            placeholder="Ví dụ: Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Khẩu hiệu phụ hiển thị dưới Logo Menu chính và Chân trang Footer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 2: Kênh Liên Hệ CSKH 24/7 */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                      <i className="fa-solid fa-headset text-amber-400 text-sm"></i>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        2. Kênh Liên Hệ & Hỗ Trợ Khách Hàng (CSKH 24/7)
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Hotline CSKH 24/7 (Đồng bộ toàn bộ Website & Email):
                          </label>
                          <input
                            type="text"
                            value={formSystemConfig.hotline || ''}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, hotline: e.target.value }))}
                            placeholder="Ví dụ: 0898 246 607"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500"
                          />
                          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                            <i className="fa-solid fa-arrows-rotate"></i>
                            <span>Tự động đồng bộ sang Topbar, Footer, Chi tiết tin BĐS, Bảng giá VIP, Đăng tin & Chữ ký Email</span>
                          </p>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Số Zalo Tư Vấn Nhanh:
                          </label>
                          <input
                            type="text"
                            value={formSystemConfig.zalo || ''}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, zalo: e.target.value }))}
                            placeholder="Ví dụ: 0898 246 607"
                            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Email Tiếp Nhận Khiếu Nại & Hỗ Trợ Kỹ Thuật:
                        </label>
                        <input
                          type="email"
                          value={formSystemConfig.email || ''}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Ví dụ: cskh@datbiendanang.vn"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Địa Chỉ Trụ Sở Chính (Văn Phòng Giao Dịch):
                        </label>
                        <textarea
                          rows={2}
                          value={formSystemConfig.address || ''}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Ví dụ: Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 3: Cài Đặt Phông Chữ Toàn Sàn (Font Family & Typography) */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-font text-violet-400 text-sm"></i>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          3. Cài Đặt Phông Chữ Toàn Sàn (Font Family & Typography)
                        </h4>
                      </div>
                      <span className="text-[10px] text-violet-400 bg-violet-950/60 border border-violet-800/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 self-start sm:self-auto">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Đồng bộ tự động toàn bộ website
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lựa chọn phông chữ chủ đạo áp dụng cho toàn bộ giao diện sàn BĐS (Header, Menu, Bộ lọc tìm kiếm, Thẻ tin đăng, Chi tiết BĐS và Trang chính sách pháp lý). Tất cả phông chữ đều được tuyển chọn chuẩn Tiếng Việt sắc nét từ Google Fonts.
                    </p>

                    {/* Danh sách thẻ phông chữ trực quan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_FONTS.map((font) => {
                        const currentFont = (formSystemConfig.fontFamily || 'Plus Jakarta Sans').trim().toLowerCase();
                        const isSelected = currentFont === font.name.toLowerCase() || currentFont === font.id.toLowerCase();
                        return (
                          <div
                            key={font.id}
                            onClick={() => {
                              setFormSystemConfig(prev => ({ ...prev, fontFamily: font.name }));
                              applyFontToDom(font.name);
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-950/50 ring-1 ring-violet-500/50'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white group-hover:text-violet-300 transition">
                                {font.name}
                              </span>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                                  <i className="fa-solid fa-check"></i>
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500"></span>
                              )}
                            </div>

                            <div className="text-[10px] text-violet-400 font-medium mb-3">
                              {font.category}
                            </div>

                            {/* Live Text Preview with font applied */}
                            <div 
                              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1"
                              style={{ fontFamily: font.fontFamily }}
                            >
                              <div className="text-xs font-black text-slate-100 truncate">
                                {font.sampleHeadline}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {font.sampleText}
                              </div>
                              <div className="text-[11px] font-bold text-emerald-400">
                                {font.samplePrice}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Preview Live Box của font đang chọn */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/30 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                          <i className="fa-solid fa-eye"></i>
                          Xem trước giao diện với phông chữ đang chọn:
                        </span>
                        <span className="text-xs font-black text-white px-2.5 py-0.5 rounded-lg bg-violet-900/50 border border-violet-700/50">
                          {formSystemConfig.fontFamily || 'Plus Jakarta Sans'}
                        </span>
                      </div>
                      <div 
                        className="space-y-1.5 pt-1"
                        style={{ fontFamily: getFontConfig(formSystemConfig.fontFamily).fontFamily }}
                      >
                        <h3 className="text-base font-extrabold text-white">
                          Sàn Giao Dịch Bất Động Sản Đất Biển Đà Nẵng
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Hệ thống quản lý tin đăng VIP, bản đồ số GIS và pháp lý thương mại điện tử minh bạch. Mọi giao dịch được đảm bảo tuân thủ quy chuẩn pháp luật.
                        </p>
                        <div className="flex items-center gap-3 text-xs pt-1">
                          <span className="text-emerald-400 font-black text-sm">5.200.000.000 ₫</span>
                          <span className="text-slate-400">• Lô A38 Trần Văn Trứ, Hải Châu • 120m²</span>
                        </div>
                      </div>

                      {/* Direct Apply & Save button right in the font preview */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          Áp dụng phông chữ này cho toàn bộ khách truy cập và mọi trang trên sàn BĐS.
                        </div>
                        <button
                          type="button"
                          disabled={isSavingSystem}
                          onClick={handleSaveSystemConfig}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-950/40 transition flex items-center justify-center gap-2 whitespace-nowrap self-end sm:self-auto"
                        >
                          <i className={isSavingSystem ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check-double"}></i>
                          <span>{isSavingSystem ? "Đang lưu..." : `Lưu & Kích Hoạt Phông ${formSystemConfig.fontFamily || 'Plus Jakarta Sans'}`}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 4: Kiểm duyệt & Quy tắc Vận Hành */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                      <i className="fa-solid fa-shield-halved text-blue-400 text-sm"></i>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        4. Cơ Chế Kiểm Duyệt & Tự Động Vận Hành
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Toggle Auto approve VIP Diamond */}
                      <label className="flex items-start gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={formSystemConfig.autoApproveDiamond !== false}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, autoApproveDiamond: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Tự động kích hoạt VIP Kim Cương (Duyệt Tức Thì)</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-800">
                              VIP 1
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Khi bật, tin mua gói VIP Kim Cương sẽ được hiển thị ngay lập tức (Active ngay) trên website mà không cần Admin duyệt thủ công.
                          </p>
                        </div>
                      </label>

                      {/* Toggle AI Moderation */}
                      <label className="flex items-start gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={formSystemConfig.enableAiModeration !== false}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, enableAiModeration: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Trợ lý AI rà soát từ ngữ nhạy cảm & spam</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800">
                              AI Pre-check
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Tự động cảnh báo các bài đăng có dấu hiệu giá ảo, địa chỉ không có thực hoặc số điện thoại spam.
                          </p>
                        </div>
                      </label>

                      {/* Default Listing Days */}
                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-bold text-white">Thời gian hiển thị mặc định của tin đăng:</div>
                          <div className="text-[11px] text-slate-400">Số ngày tin đăng được chọn mặc định trong form tạo tin mới</div>
                        </div>
                        <select
                          value={formSystemConfig.defaultListingDays || 15}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, defaultListingDays: Number(e.target.value) }))}
                          className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs"
                        >
                          <option value={7}>7 ngày</option>
                          <option value={10}>10 ngày</option>
                          <option value={15}>15 ngày (Mặc định)</option>
                          <option value={30}>30 ngày</option>
                          <option value={60}>60 ngày</option>
                        </select>
                      </div>

                      {/* Maintenance mode */}
                      <label className="flex items-start gap-3 p-3.5 bg-rose-950/20 hover:bg-rose-950/30 rounded-2xl border border-rose-900/50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={formSystemConfig.maintenanceMode === true}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                          className="w-4 h-4 text-rose-500 rounded border-slate-700 bg-slate-800 focus:ring-rose-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-rose-300 flex items-center gap-2">
                            <span>Chế độ bảo trì hệ thống (Maintenance Mode)</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Chỉ mở giao diện cho tài khoản Ban Quản Trị (Admin), khách vãng lai và thành viên sẽ thấy thông báo bảo trì nâng cấp.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Nhóm 5: Cấu Hình Tối Ưu Hóa Database & Bài Viết Quá Hạn */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-database text-cyan-400 text-sm"></i>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          5. Cấu Hình Tối Ưu Hóa Database & Dọn Dẹp Bài Viết Quá Hạn
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        DB Optimization
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Bật/Tắt Tự Động Quét Dọn Dẹp */}
                      <label className="flex items-start gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={formSystemConfig.autoCleanupEnabled !== false}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, autoCleanupEnabled: e.target.checked }))}
                          className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-800 focus:ring-cyan-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Tự động quét & dọn dẹp dữ liệu bài viết quá hạn định kỳ</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                              Khuyên dùng
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Khi bật, hệ thống định kỳ rà soát các bài viết đã hết hạn hiển thị mà không được gia hạn quá số ngày quy định để tối ưu hóa bộ nhớ database.
                          </p>
                        </div>
                      </label>

                      {/* Số ngày chờ sau khi hết hạn */}
                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <i className="fa-regular fa-calendar-xmark text-amber-400"></i>
                            <span>Thời gian chờ xử lý sau khi tin hết hạn:</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Nếu tin hết hạn mà không gia hạn trong khoảng thời gian này, hệ thống sẽ tự động thực thi hành động dọn dẹp.
                          </div>
                        </div>
                        <select
                          value={formSystemConfig.expiredRetentionDays || 45}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, expiredRetentionDays: Number(e.target.value) }))}
                          className="p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs shrink-0"
                        >
                          <option value={15}>15 ngày sau khi hết hạn</option>
                          <option value={30}>30 ngày sau khi hết hạn</option>
                          <option value={45}>45 ngày sau khi hết hạn (Mặc định)</option>
                          <option value={60}>60 ngày sau khi hết hạn</option>
                          <option value={90}>90 ngày sau khi hết hạn</option>
                          <option value={180}>180 ngày (6 tháng)</option>
                        </select>
                      </div>

                      {/* Chế độ xử lý dọn dẹp */}
                      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <i className="fa-solid fa-wand-magic-sparkles text-cyan-400"></i>
                          <span>Hành động xử lý khi bài viết quá hạn:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <label className={`p-3 rounded-xl border cursor-pointer transition ${
                            (formSystemConfig.expiredCleanupAction || 'archive_light') === 'archive_light'
                              ? 'border-cyan-500 bg-cyan-950/30 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}>
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <input
                                type="radio"
                                name="cleanupAction"
                                checked={(formSystemConfig.expiredCleanupAction || 'archive_light') === 'archive_light'}
                                onChange={() => setFormSystemConfig(prev => ({ ...prev, expiredCleanupAction: 'archive_light' }))}
                                className="accent-cyan-500"
                              />
                              <span>Nén sang dữ liệu nhẹ</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed pl-5">
                              Giữ 1 thumbnail đại diện, lược bỏ VR360/gallery ảnh lớn, nén mô tả. Giảm 90% dung lượng DB mà vẫn giữ lịch sử báo cáo & doanh thu.
                            </p>
                          </label>

                          <label className={`p-3 rounded-xl border cursor-pointer transition ${
                            formSystemConfig.expiredCleanupAction === 'move_to_trash'
                              ? 'border-amber-500 bg-amber-950/30 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}>
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <input
                                type="radio"
                                name="cleanupAction"
                                checked={formSystemConfig.expiredCleanupAction === 'move_to_trash'}
                                onChange={() => setFormSystemConfig(prev => ({ ...prev, expiredCleanupAction: 'move_to_trash' }))}
                                className="accent-amber-500"
                              />
                              <span>Chuyển vào Thùng rác</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed pl-5">
                              Tự động chuyển vào Thùng rác để Admin kiểm tra và quyết định trước khi dọn sạch.
                            </p>
                          </label>

                          <label className={`p-3 rounded-xl border cursor-pointer transition ${
                            formSystemConfig.expiredCleanupAction === 'permanent_delete'
                              ? 'border-rose-500 bg-rose-950/30 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}>
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <input
                                type="radio"
                                name="cleanupAction"
                                checked={formSystemConfig.expiredCleanupAction === 'permanent_delete'}
                                onChange={() => setFormSystemConfig(prev => ({ ...prev, expiredCleanupAction: 'permanent_delete' }))}
                                className="accent-rose-500"
                              />
                              <span>Xóa vĩnh viễn khỏi DB</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed pl-5">
                              Xóa sạch hoàn toàn bài viết khỏi Database, giải phóng 100% dung lượng.
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Live Storage Metrics & Manual Trigger */}
                      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-700 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-white flex items-center gap-2 text-xs">
                              <i className="fa-solid fa-chart-pie text-cyan-400"></i>
                              <span>Thống Kê Hiện Trạng Cơ Sở Dữ Liệu:</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                              <span>Tổng tin: <b className="text-white font-mono">{properties.length}</b></span>
                              <span>•</span>
                              <span>Tin hoạt động: <b className="text-emerald-400 font-mono">{propertyStatusCounts.active}</b></span>
                              <span>•</span>
                              <span>Tin quá hạn &gt; {formSystemConfig.expiredRetentionDays || 45} ngày: <b className="text-amber-400 font-mono">{properties.filter(p => (p.status === 'expired' || (p.expiresAt && Date.now() - new Date(p.expiresAt).getTime() >= (formSystemConfig.expiredRetentionDays || 45) * 86400 * 1000)) && !p.isArchived && !p.isDeleted).length}</b></span>
                              <span>•</span>
                              <span>Đã nén nhẹ: <b className="text-cyan-400 font-mono">{propertyStatusCounts.archived}</b></span>
                              <span>•</span>
                              <span>Thùng rác: <b className="text-rose-400 font-mono">{propertyStatusCounts.trash}</b></span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => runDatabaseCleanup(formSystemConfig)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5 shrink-0"
                          >
                            <i className="fa-solid fa-broom text-xs"></i>
                            <span>Chạy Dọn Dẹp DB Ngay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nhóm 6: Cấu Hình Chiến Dịch Quà Tặng & Xác Thực Email */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-gift text-emerald-400 text-sm"></i>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          6. Cấu Hình Chiến Dịch Quà Tặng &amp; Xác Thực Email
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Welcome Bonus Campaign
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Bật/Tắt Chương Trình */}
                      <label className="flex items-start gap-3 p-3.5 bg-slate-900/80 hover:bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={formSystemConfig.enableWelcomeBonus !== false}
                          onChange={(e) => setFormSystemConfig(prev => ({ ...prev, enableWelcomeBonus: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>Kích hoạt chương trình Tặng Tiền Chào Mừng Thành Viên Mới</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                              Đang áp dụng
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Khi bật, mọi người dùng mới đăng ký và xác thực email sẽ được nhận ngay số tiền thưởng [SỐ_TIỀN_TẶNG] vào Ví Khuyến Mãi.
                          </p>
                        </div>
                      </label>

                      {/* 3 Tham số cốt lõi: SỐ_TIỀN_TẶNG, THỜI_GIẠN_HẾT_HẠN_TOKEN, THỜI_GIẠN_HẾT_HẠN_TIỀN */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* 1. SỐ_TIỀN_TẶNG */}
                        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                          <label className="block text-[11px] font-bold text-emerald-300 uppercase">
                            🎁 [SỐ_TIỀN_TẶNG] (VNĐ):
                          </label>
                          <input
                            type="number"
                            step="10000"
                            min="0"
                            value={formSystemConfig.welcomeBonusAmount || 100000}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, welcomeBonusAmount: Number(e.target.value) }))}
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:border-emerald-500 outline-none"
                          />
                          <p className="text-[10px] text-slate-400">
                            Ví dụ: 50.000, 100.000, 200.000...
                          </p>
                        </div>

                        {/* 2. THỜI_GIẠN_HẾT_HẠN_TOKEN */}
                        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                          <label className="block text-[11px] font-bold text-amber-300 uppercase">
                            ⏱ [HẠN_TOKEN_EMAIL] (Phút):
                          </label>
                          <select
                            value={formSystemConfig.tokenExpiryMinutes || 30}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, tokenExpiryMinutes: Number(e.target.value) }))}
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-500 outline-none"
                          >
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút (Khuyên dùng)</option>
                            <option value={60}>60 phút (1 giờ)</option>
                            <option value={120}>120 phút (2 giờ)</option>
                            <option value={1440}>1.440 phút (24 giờ)</option>
                          </select>
                          <p className="text-[10px] text-slate-400">
                            Thời gian link xác thực email có hiệu lực.
                          </p>
                        </div>

                        {/* 3. THỜI_GIẠN_HẾT_HẠN_TIỀN */}
                        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                          <label className="block text-[11px] font-bold text-sky-300 uppercase">
                            📅 [HẠN_DÙNG_TIỀN] (Ngày):
                          </label>
                          <select
                            value={formSystemConfig.bonusExpiryDays || 30}
                            onChange={(e) => setFormSystemConfig(prev => ({ ...prev, bonusExpiryDays: Number(e.target.value) }))}
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-sky-500 outline-none"
                          >
                            <option value={7}>7 ngày (1 tuần)</option>
                            <option value={15}>15 ngày</option>
                            <option value={30}>30 ngày (1 tháng)</option>
                            <option value={60}>60 ngày (2 tháng)</option>
                            <option value={90}>90 ngày (3 tháng)</option>
                          </select>
                          <p className="text-[10px] text-slate-400">
                            Sau số ngày này, tiền chưa dùng sẽ bị thu hồi.
                          </p>
                        </div>
                      </div>

                      {/* Anti-Cheat: Giới Hạn IP & Nút Quét Thu Hồi */}
                      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <i className="fa-solid fa-shield-halved text-rose-400"></i>
                              <span>Cơ Chế Bảo Mật &amp; Chống Gian Lận (Anti-Cheat):</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Giới hạn tối đa <strong className="text-white">{formSystemConfig.maxRegistrationsPerIpPerDay || 3}</strong> tài khoản / IP / ngày để ngăn chặn việc spam nhận thưởng.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={formSystemConfig.maxRegistrationsPerIpPerDay || 3}
                              onChange={(e) => setFormSystemConfig(prev => ({ ...prev, maxRegistrationsPerIpPerDay: Number(e.target.value) }))}
                              className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs"
                            >
                              <option value={1}>Tối đa 1 TK / IP / ngày</option>
                              <option value={2}>Tối đa 2 TK / IP / ngày</option>
                              <option value={3}>Tối đa 3 TK / IP / ngày</option>
                              <option value={5}>Tối đa 5 TK / IP / ngày</option>
                            </select>

                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/cron/expire-bonus', { method: 'POST' });
                                  const data = await res.json();
                                  showToast(data.message || `Đã thu hồi ${data.expiredCount || 0} tài khoản quá hạn!`, 'info');
                                } catch (e) {
                                  showToast('Lỗi khi kích hoạt quét thu hồi', 'error');
                                }
                              }}
                              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 shrink-0"
                            >
                              <i className="fa-solid fa-rotate text-xs"></i>
                              <span>Quét Thu Hồi Quá Hạn Ngay</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="space-y-6">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 sticky top-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                      <i className="fa-solid fa-eye text-emerald-400 text-sm"></i>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Xem Trước Hiển Thị (Live Preview)
                      </h4>
                    </div>

                    {/* Preview Topbar */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">1. Thanh Topbar Trên Cùng:</div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="text-emerald-400 font-bold truncate">{formSystemConfig.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-300 truncate font-mono">
                            Hotline: <strong className="text-white">{formSystemConfig.hotline || '0904 084 888'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Footer */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">2. Khối Liên Hệ Chân Trang (Footer):</div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
                        <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                          <i className="fa-solid fa-building text-emerald-400"></i>
                          <span>{formSystemConfig.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {formSystemConfig.tagline || 'Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP'}
                        </div>
                        <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                          <div>📞 Hotline: <strong className="text-white font-mono">{formSystemConfig.hotline || '0904 084 888'}</strong></div>
                          <div>💬 Zalo: <strong className="text-emerald-400 font-mono">{formSystemConfig.zalo || '0904 084 888'}</strong></div>
                          <div>✉️ Email: <strong className="text-slate-200 font-mono">{formSystemConfig.email || 'tranvanvu.dev@gmail.com'}</strong></div>
                          <div className="text-[10px] text-slate-400">📍 {formSystemConfig.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Font Applied */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">3. Phông Chữ Đang Áp Dụng Toàn Sàn:</div>
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-violet-500/30 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-font text-violet-400"></i>
                          <span className="font-bold text-white">{formSystemConfig.fontFamily || 'Plus Jakarta Sans'}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                          Google Fonts
                        </span>
                      </div>
                    </div>

                    {/* Status Overview Card */}
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Duyệt VIP Kim Cương:</span>
                        <span className={`font-bold ${formSystemConfig.autoApproveDiamond !== false ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {formSystemConfig.autoApproveDiamond !== false ? 'Tự động duyệt ngay' : 'Admin duyệt thủ công'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Trợ lý AI kiểm duyệt:</span>
                        <span className={`font-bold ${formSystemConfig.enableAiModeration !== false ? 'text-purple-400' : 'text-slate-500'}`}>
                          {formSystemConfig.enableAiModeration !== false ? 'Đang kích hoạt' : 'Tắt'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Thời hạn tin mặc định:</span>
                        <span className="font-bold text-white font-mono">{formSystemConfig.defaultListingDays || 15} ngày</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingSystem}
                      onClick={handleSaveSystemConfig}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <i className={isSavingSystem ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"}></i>
                      <span>{isSavingSystem ? "Đang lưu hệ thống..." : "Lưu Thay Đổi Ngay"}</span>
                    </button>
                  </div>
                </div>
              </div>
                </div>
              )}

              {/* TAB 2: HEADER & ĐỘ RỘNG */}
              {settingsSubTab === 'header' && (
                <AdminHeaderConfigManager onSwitchToMenu={() => handleSelectSettingsSubTab('menu')} />
              )}

              {/* TAB 3: CẤU HÌNH THANH MENU */}
              {settingsSubTab === 'menu' && (
                <AdminMenuConfigManager onSwitchToHeader={() => handleSelectSettingsSubTab('header')} />
              )}

              {/* TAB 4: EMAIL SETTING */}
              {settingsSubTab === 'email' && (
                <AdminEmailConfigManager onNavigateToEmails={() => setActiveMenu('emails')} />
              )}
            </div>
          )}

          {/* =========================================
              PHÂN HỆ: BÁO CÁO TIN RAO VI PHẠM & EMAIL LOGS
             ========================================= */}
          {(activeMenu === 'reports' || activeMenu === 'emails') && (
            <AdminReportsManager
              key={activeMenu}
              activeTab={activeMenu === 'emails' ? 'emails' : 'reports'}
              onTabChange={(tab) => setActiveMenu(tab)}
              initialReportId={targetReportId}
              onClearTargetReport={() => setTargetReportId(null)}
            />
          )}

          {/* =========================================
              PHÂN HỆ: CẤU HÌNH SINGLE & MIỄN TRỪ TRÁCH NHIỆM
             ========================================= */}
          {activeMenu === 'single-config' && (
            <AdminSingleConfigManager />
          )}

          {/* =========================================
              PHÂN HỆ: CẤU HÌNH EMAIL WEBSITE & MÁY CHỦ SMTP
             ========================================= */}
          {activeMenu === 'email-config' && (
            <AdminEmailConfigManager onNavigateToEmails={() => setActiveMenu('emails')} />
          )}

        </main>
      </div>

      {/* MODAL: TỪ CHỐI TIN ĐĂNG */}
      {rejectModalProp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-black text-white">
              Từ Chối Tin Đăng: {rejectModalProp.id}
            </h3>
            <p className="text-xs text-slate-400">
              Chọn hoặc nhập lý do từ chối để thông báo qua hệ thống đến môi giới {rejectModalProp.author?.name}:
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white"
            >
              <option value="Giá chưa phản ánh đúng thực tế thị trường">Giá chưa phản ánh đúng thực tế thị trường</option>
              <option value="Hình ảnh mờ, trùng lặp hoặc chứa watermark sàn khác">Hình ảnh mờ, trùng lặp hoặc chứa watermark sàn khác</option>
              <option value="Địa chỉ không đúng thực tế quy hoạch">Địa chỉ không đúng thực tế quy hoạch</option>
              <option value="Tin spam hoặc môi giới không có ủy quyền từ chủ nhà">Tin spam hoặc không có ủy quyền từ chủ nhà</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalProp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐIỀU CHỈNH VÍ USER */}
      {adjustWalletUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-black text-white">
              Điều Chỉnh Số Dư Ví: {adjustWalletUser.name}
            </h3>
            <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300">
              Số dư hiện tại: <strong className="text-emerald-400">{adjustWalletUser.walletBalance.toLocaleString('vi-VN')} đ</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Số tiền (Dương: cộng tiền, Âm: trừ tiền):</label>
                <input
                  type="number"
                  step="50000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Lý do điều chỉnh (Ghi chú GD):</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjustWalletUser(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleAdjustBalanceSubmit}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Xác nhận điều chỉnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐỔI GÓI VIP CHO TIN ĐĂNG */}
      {editingVipProp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-black text-white">
              Chuyển Gói VIP: {editingVipProp.id}
            </h3>
            <p className="text-xs text-slate-400">
              Chọn cấp độ VIP mới để áp dụng trực tiếp cho bài đăng này:
            </p>

            <select
              value={newVipId}
              onChange={(e) => setNewVipId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white"
            >
              <option value="vip-diamond">VIP Kim Cương (VIP 1 - Vị trí số 1)</option>
              <option value="vip-gold">VIP Vàng (VIP 2)</option>
              <option value="vip-silver">VIP Bạc (VIP 3)</option>
              <option value="vip-bronze">VIP Đồng (VIP 4)</option>
              <option value="normal">Tin Thường</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingVipProp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdatePropertyVip}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Cập nhật gói VIP ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA CHI TIẾT BÀI ĐĂNG BẤT ĐỘNG SẢN (ĐẦY ĐỦ TRƯỜNG & DANH MỤC THEO /dang-tin) */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-4xl w-full space-y-4 my-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">
                      Chỉnh Sửa Tin BĐS: {editingProperty.id}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      editPropFormData.demand === 'rent' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {editPropFormData.demand === 'rent' ? 'Cho Thuê' : 'Cần Bán'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                      {editPropFormData.propertyTypeName || 'Căn hộ'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                    <span>Đăng lúc: <strong className="text-slate-200 font-mono">{formatDateTime(editingProperty.publishedAt || editingProperty.createdAt || editingProperty.submittedAt).full}</strong></span>
                    {editingProperty.updatedAt && (
                      <span>• Đã sửa: <strong className="text-amber-300 font-mono">{formatDateTime(editingProperty.updatedAt).full}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-thin text-xs">
              <button
                type="button"
                onClick={() => setEditPropTab('general')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  editPropTab === 'general'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <i className="fa-solid fa-layer-group text-xs"></i>
                <span>1. Nhu Cầu & Vị Trí</span>
              </button>
              <button
                type="button"
                onClick={() => setEditPropTab('specs')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  editPropTab === 'specs'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <i className="fa-solid fa-ruler-combined text-xs"></i>
                <span>2. Thông Số & Pháp Lý & Giá</span>
              </button>
              <button
                type="button"
                onClick={() => setEditPropTab('media')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  editPropTab === 'media'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <i className="fa-solid fa-images text-xs"></i>
                <span>3. Hình Ảnh ({editPropFormData.images?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setEditPropTab('content')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 ${
                  editPropTab === 'content'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <i className="fa-solid fa-file-lines text-xs"></i>
                <span>4. Nội Dung & Liên Hệ & VIP</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
              
              {/* === TAB 1: NHU CẦU, DANH MỤC & VỊ TRÍ === */}
              {editPropTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Nhu cầu giao dịch */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-bold">Nhu cầu giao dịch:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditPropFormData({ ...editPropFormData, demand: 'sale' })}
                        className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition ${
                          editPropFormData.demand === 'sale'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-tag text-emerald-400"></i>
                        <span>Cần Bán (Sale)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPropFormData({ ...editPropFormData, demand: 'rent' })}
                        className={`p-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition ${
                          editPropFormData.demand === 'rent'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-key text-blue-400"></i>
                        <span>Cho Thuê (Rent)</span>
                      </button>
                    </div>
                  </div>

                  {/* Danh mục / Loại hình BĐS */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <i className="fa-solid fa-layer-group text-amber-400"></i>
                      <span>Danh mục loại hình BĐS ({PROPERTY_TYPES.length} loại hình chuẩn):</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROPERTY_TYPES.map(cat => {
                        const isSelected = editPropFormData.propertyType === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setEditPropFormData({
                              ...editPropFormData,
                              propertyType: cat.id,
                              propertyTypeName: cat.name
                            })}
                            className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                              isSelected
                                ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <i className={`fa-solid ${cat.icon} text-xs text-amber-400`}></i>
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dự án & Địa chỉ hiển thị */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Tên Dự án / Khu đô thị:</label>
                      <input
                        type="text"
                        placeholder="VD: Goldmark City, Vinhomes Ocean Park..."
                        value={editPropFormData.project || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, project: e.target.value })}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Địa chỉ hiển thị tùy chọn:</label>
                      <input
                        type="text"
                        placeholder="VD: 136 Hồ Tùng Mậu, Cầu Giấy"
                        value={editPropFormData.addressDisplay || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, addressDisplay: e.target.value })}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Vị trí hành chính 4 cấp */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-rose-400"></i>
                      <span>Vị trí hành chính:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Tỉnh / Thành phố:</label>
                        <input
                          type="text"
                          placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
                          value={editPropFormData.city || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, city: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Quận / Huyện:</label>
                        <input
                          type="text"
                          placeholder="VD: Quận Cầu Giấy..."
                          value={editPropFormData.district || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, district: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Phường / Xã:</label>
                        <input
                          type="text"
                          placeholder="VD: Dịch Vọng..."
                          value={editPropFormData.ward || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, ward: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Tuyến đường / Phố:</label>
                        <input
                          type="text"
                          placeholder="VD: Đường Cầu Giấy..."
                          value={editPropFormData.street || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, street: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: THÔNG SỐ KỸ THUẬT & PHÁP LÝ & GIÁ === */}
              {editPropTab === 'specs' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Định giá & Diện tích */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-coins text-emerald-400"></i>
                      <span>Định giá & Diện tích:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Giá hiển thị (VD: 3.5 Tỷ, 15 tr/tháng):</label>
                        <input
                          type="text"
                          value={editPropFormData.priceDisplay || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, priceDisplay: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-black outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Giá trị số chuẩn (VNĐ):</label>
                        <input
                          type="number"
                          step="10000000"
                          value={editPropFormData.price || 0}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, price: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Kiểu định giá:</label>
                        <select
                          value={editPropFormData.priceType || 'total'}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, priceType: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        >
                          <option value="total">Tổng giá trọn gói</option>
                          <option value="m2">Theo m²</option>
                          <option value="deal">Thỏa thuận</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Diện tích (m²):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editPropFormData.area || 0}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, area: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 font-bold mb-1">Đơn giá trên m² (pricePerM2):</label>
                        <input
                          type="text"
                          placeholder="VD: 46.7 tr/m²"
                          value={editPropFormData.pricePerM2 || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, pricePerM2: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mặt tiền & Lộ giới đường */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-road text-cyan-400"></i>
                      <span>Quy hoạch & Đường sá:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Mặt tiền (m):</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="VD: 5.0"
                          value={editPropFormData.facade ?? ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, facade: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Đường vào / Lộ giới (m):</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="VD: 8.0"
                          value={editPropFormData.entranceRoad ?? ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, entranceRoad: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Đặc điểm đường vào:</label>
                        <select
                          value={editPropFormData.roadType || 'car_pass'}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, roadType: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        >
                          <option value="car_pass">Đường ô tô tránh nhau</option>
                          <option value="truck">Đường xe tải tránh</option>
                          <option value="car_in">Đường ô tô vào nhà</option>
                          <option value="bike">Đường xe máy / Ngõ nhỏ</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cấu trúc & Hướng */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Phòng ngủ:</label>
                      <input
                        type="number"
                        min="0"
                        value={editPropFormData.bedroom ?? 0}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, bedroom: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Phòng tắm / WC:</label>
                      <input
                        type="number"
                        min="0"
                        value={editPropFormData.bathroom ?? 0}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, bathroom: Number(e.target.value) })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Số tầng:</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="VD: 3"
                        value={editPropFormData.floor ?? ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, floor: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Hướng cửa chính:</label>
                      <select
                        value={editPropFormData.direction || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, direction: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      >
                        <option value="">Chưa xác định</option>
                        <option value="Đông">Đông</option>
                        <option value="Tây">Tây</option>
                        <option value="Nam">Nam</option>
                        <option value="Bắc">Bắc</option>
                        <option value="Đông Nam">Đông Nam</option>
                        <option value="Đông Bắc">Đông Bắc</option>
                        <option value="Tây Nam">Tây Nam</option>
                        <option value="Tây Bắc">Tây Bắc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Hướng ban công:</label>
                      <select
                        value={editPropFormData.balconyDirection || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, balconyDirection: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      >
                        <option value="">Chưa xác định</option>
                        <option value="Đông">Đông</option>
                        <option value="Tây">Tây</option>
                        <option value="Nam">Nam</option>
                        <option value="Bắc">Bắc</option>
                        <option value="Đông Nam">Đông Nam</option>
                        <option value="Đông Bắc">Đông Bắc</option>
                        <option value="Tây Nam">Tây Nam</option>
                        <option value="Tây Bắc">Tây Bắc</option>
                      </select>
                    </div>
                  </div>

                  {/* Pháp lý & Nội thất */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Tình trạng pháp lý:</label>
                      <input
                        type="text"
                        placeholder="VD: Sổ hồng lâu dài chính chủ, Hợp đồng mua bán..."
                        value={editPropFormData.legal || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, legal: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Tình trạng nội thất:</label>
                      <input
                        type="text"
                        placeholder="VD: Full nội thất cao cấp, Đầy đủ, Cơ bản, Nhà thô..."
                        value={editPropFormData.furniture || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, furniture: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: HÌNH ẢNH & ĐA PHƯƠNG TIỆN === */}
              {editPropTab === 'media' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* VR 360 & Video URL */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <i className="fa-solid fa-vr-cardboard text-cyan-400"></i>
                        <span>Thực tế ảo VR 360 độ:</span>
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editPropFormData.hasVR360)}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, hasVR360: e.target.checked })}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                        />
                        <span className="text-white font-bold">Kích hoạt xem nhà 360°</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Link Video giới thiệu (Youtube / TikTok / FB):</label>
                      <input
                        type="text"
                        placeholder="VD: https://www.youtube.com/watch?v=..."
                        value={editPropFormData.videoUrl || ''}
                        onChange={(e) => setEditPropFormData({ ...editPropFormData, videoUrl: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Quản lý danh sách hình ảnh */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-300 flex items-center gap-1.5">
                        <i className="fa-solid fa-images text-blue-400"></i>
                        <span>Danh sách hình ảnh ({editPropFormData.images?.length || 0} ảnh):</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Ảnh đầu tiên là ảnh bìa chính</span>
                    </div>

                    {/* Quick Add Image */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Dán link ảnh (https://...)"
                        value={newImageInput}
                        onChange={(e) => setNewImageInput(e.target.value)}
                        className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newImageInput.trim()) return;
                          const currentImgs = Array.isArray(editPropFormData.images) ? [...editPropFormData.images] : [];
                          setEditPropFormData({ ...editPropFormData, images: [...currentImgs, newImageInput.trim()] });
                          setNewImageInput('');
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1 transition shrink-0"
                      >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm ảnh</span>
                      </button>
                    </div>

                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {Array.isArray(editPropFormData.images) && editPropFormData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                          <img src={imgUrl} alt="" className="w-full h-24 object-cover" />
                          <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                            #{idx + 1} {idx === 0 ? '• BÌA' : ''}
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const imgs = [...editPropFormData.images];
                                  const [moved] = imgs.splice(idx, 1);
                                  imgs.unshift(moved);
                                  setEditPropFormData({ ...editPropFormData, images: imgs });
                                }}
                                className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs"
                                title="Đặt làm ảnh bìa"
                              >
                                <i className="fa-solid fa-star"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const imgs = editPropFormData.images.filter((_, i) => i !== idx);
                                setEditPropFormData({ ...editPropFormData, images: imgs });
                              }}
                              className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs"
                              title="Xóa ảnh này"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 4: NỘI DUNG, LIÊN HỆ & VIP === */}
              {editPropTab === 'content' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tiêu đề bài đăng:</label>
                    <input
                      type="text"
                      value={editPropFormData.title || ''}
                      onChange={(e) => setEditPropFormData({ ...editPropFormData, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Mô tả chi tiết */}
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Mô tả chi tiết:</label>
                    <textarea
                      rows="5"
                      value={editPropFormData.description || ''}
                      onChange={(e) => setEditPropFormData({ ...editPropFormData, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-blue-500 leading-relaxed font-sans"
                    ></textarea>
                  </div>

                  {/* Thông tin người liên hệ */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-user-tie text-blue-400"></i>
                      <span>Thông tin người liên hệ (Môi giới / Chủ nhà):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Họ tên người đăng / liên hệ:</label>
                        <input
                          type="text"
                          value={editPropFormData.contactName || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, contactName: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Số điện thoại liên hệ:</label>
                        <input
                          type="text"
                          value={editPropFormData.contactPhone || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, contactPhone: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Email liên hệ:</label>
                        <input
                          type="email"
                          value={editPropFormData.contactEmail || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, contactEmail: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Địa chỉ người liên hệ:</label>
                        <input
                          type="text"
                          value={editPropFormData.contactAddress || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, contactAddress: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gói VIP & Trạng thái & Vòng đời */}
                  <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-amber-400"></i>
                      <span>Gói VIP & Vòng đời tin đăng:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Cấp độ gói VIP:</label>
                        <select
                          value={editPropFormData.vipPackageId || 'normal'}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, vipPackageId: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        >
                          <option value="vip-diamond">VIP Kim Cương (VIP 1 - Vị trí số 1)</option>
                          <option value="vip-gold">VIP Vàng (VIP 2)</option>
                          <option value="vip-silver">VIP Bạc (VIP 3)</option>
                          <option value="normal">Tin Thường</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Trạng thái xuất bản:</label>
                        <select
                          value={editPropFormData.status || 'active'}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, status: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        >
                          <option value="active">Hiển thị (Active)</option>
                          <option value="expired">Đã hết hạn (Expired)</option>
                          <option value="pending">Chờ phê duyệt (Pending)</option>
                          <option value="rejected">Từ chối (Rejected)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Số ngày hiển thị (listingDays):</label>
                        <select
                          value={editPropFormData.listingDays || 15}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, listingDays: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        >
                          <option value={7}>7 ngày</option>
                          <option value={10}>10 ngày</option>
                          <option value={15}>15 ngày (Tiêu chuẩn)</option>
                          <option value={30}>30 ngày</option>
                          <option value={60}>60 ngày</option>
                          <option value={90}>90 ngày</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Thời điểm hết hạn (expiresAt):</label>
                        <input
                          type="datetime-local"
                          value={editPropFormData.expiresAt || ''}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, expiresAt: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                          <i className="fa-solid fa-arrows-rotate text-cyan-400"></i>
                          <span>Tự động gia hạn khi hết hạn (Auto-Renew):</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(editPropFormData.autoRenew)}
                          onChange={(e) => setEditPropFormData({ ...editPropFormData, autoRenew: e.target.checked })}
                          className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-3 gap-2">
              <div className="text-[11px] text-slate-500 text-left w-full sm:w-auto">
                * Mọi thay đổi về Nhu cầu, Danh mục, Thông số & Vị trí sẽ được đồng bộ tức thì trên toàn sàn.
              </div>
              <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditProperty}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Lưu Thay Đổi BĐS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GIA HẠN TIN ĐĂNG (BATDONGSAN RENEWAL MODAL) */}
      {renewModalProp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 my-8 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Gia Hạn Tin Đăng</span>
                    <span className="font-mono text-emerald-400 text-xs">({renewModalProp.id})</span>
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Cơ chế gia hạn & khôi phục hiển thị theo chuẩn sàn Batdongsan.com.vn
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRenewModalProp(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Listing Summary Card */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white line-clamp-1">{renewModalProp.title}</div>
              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                <span>Người đăng: <strong className="text-slate-200">{renewModalProp.author?.name || 'Khách vãng lai'}</strong></span>
                <span>• SĐT: <strong className="text-slate-200 font-mono">{renewModalProp.author?.phone || '--'}</strong></span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <div className="text-slate-400">
                  Hạn hiện tại: <strong className="text-amber-300 font-mono">{formatDateTime(renewModalProp.expiresAt).full}</strong>
                </div>
                <div>
                  {renewModalProp.status === 'expired' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      🛑 Đã hết hạn
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ● Đang hoạt động
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form configuration */}
            <div className="space-y-3.5 text-xs">
              {/* Chọn số ngày gia hạn */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>1. Chọn Chu Kỳ Gia Hạn Thêm:</span>
                  <span className="text-emerald-400 font-normal">Tối thiểu 7 ngày</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 7, label: '7 ngày', note: 'Ngắn hạn' },
                    { days: 10, label: '10 ngày', note: 'Cơ bản' },
                    { days: 15, label: '15 ngày', note: 'Khuyên dùng' },
                    { days: 30, label: '30 ngày', note: 'Tiết kiệm 25%' },
                    { days: 60, label: '60 ngày', note: 'Tiết kiệm 30%' },
                    { days: 90, label: '90 ngày', note: 'Dài hạn' },
                  ].map(item => (
                    <button
                      type="button"
                      key={item.days}
                      onClick={() => setRenewDays(item.days)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        renewDays === item.days
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-black text-xs">{item.label}</span>
                      <span className={`text-[10px] ${renewDays === item.days ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {item.note}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn cấp độ gói VIP */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  2. Cấp Độ Gói VIP Áp Dụng:
                </label>
                <select
                  value={renewVipId}
                  onChange={(e) => setRenewVipId(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                >
                  <option value="vip-diamond">VIP Kim Cương (Vị trí số 1, duyệt tức thì)</option>
                  <option value="vip-gold">VIP Vàng (Ưu tiên sớm 15p, viền cam vàng)</option>
                  <option value="vip-silver">VIP Bạc (Ưu tiên sớm 30p, viền xanh dương)</option>
                  <option value="normal">Tin Thường (Tiêu chuẩn)</option>
                </select>
              </div>

              {/* Tùy chọn tự động gia hạn */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-arrows-rotate text-cyan-400"></i>
                    <span>Tự Động Gia Hạn Khi Hết Hạn (Auto-Renew):</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tự động gia hạn thêm chu kỳ tương ứng mà không làm gián đoạn hiển thị
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={renewAutoRenew}
                  onChange={(e) => setRenewAutoRenew(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Dự kiến thời gian hết hạn mới */}
              {(() => {
                const now = Date.now();
                const curExp = renewModalProp.expiresAt ? new Date(renewModalProp.expiresAt).getTime() : 0;
                let targetDate;
                if (renewModalProp.status === 'expired' || curExp <= now) {
                  targetDate = new Date(now + renewDays * 86400 * 1000);
                } else {
                  targetDate = new Date(curExp + renewDays * 86400 * 1000);
                }

                return (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-emerald-400/80 uppercase font-bold">Thời hạn hiển thị mới:</div>
                      <div className="font-bold text-white mt-0.5">
                        Đến hết ngày <span className="font-mono text-emerald-300">{targetDate.toLocaleDateString('vi-VN')}</span> ({targetDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs">
                      +{renewDays} ngày
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <i className="fa-solid fa-shield text-emerald-400"></i>
                <span>Quyền Quản Trị: Kích hoạt miễn phí</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRenewModalProp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRenew}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Xác Nhận Gia Hạn Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BÁO CÁO DOANH THU & ĐỐI SOÁT TÀI CHÍNH THEO USER */}
      {isUserReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-users-viewfinder"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-white tracking-wider">
                      Báo Cáo Doanh Thu & Đối Soát Tài Chính Theo User
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                      {userFinanceSummaries.length} Users
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thống kê chi tiết số dư ví, tổng nạp tiền, doanh thu sàn thu được từ dịch vụ VIP và lịch sử giao dịch của từng người dùng.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUserReportModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-sm transition"
                title="Đóng modal"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 border-b border-slate-800 shrink-0">
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Người Dùng Có GD</div>
                <div className="text-xl font-black text-white mt-1">
                  {userFinanceSummaries.filter(u => u.txnCount > 0).length} <span className="text-xs text-slate-500 font-normal">/ {userFinanceSummaries.length}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Tiền Nạp Ví</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {userFinanceSummaries.reduce((sum, u) => sum + (u.totalDeposited || 0), 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Doanh Thu Thu Từ Users</div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {userFinanceSummaries.reduce((sum, u) => sum + (u.totalSpent || 0), 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Số Dư Ví Hiện Tại</div>
                <div className="text-xl font-black text-blue-400 mt-1">
                  {userFinanceSummaries.reduce((sum, u) => sum + (u.walletBalance || 0), 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Toolbar: Search & Action Buttons */}
            <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:max-w-md">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, email, mã User..."
                  value={userReportSearch}
                  onChange={(e) => setUserReportSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
                {userReportSearch && (
                  <button
                    onClick={() => setUserReportSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExportUserSummaryCSV}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                  title="Xuất bảng tổng hợp toàn bộ Users ra file CSV"
                >
                  <i className="fa-solid fa-file-csv"></i>
                  <span>Xuất Toàn Bộ Users (.CSV)</span>
                </button>
              </div>
            </div>

            {/* Table Content (Scrollable) */}
            <div className="overflow-y-auto flex-1 p-4">
              {filteredUsersForReport.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <i className="fa-solid fa-user-slash text-4xl text-slate-700"></i>
                  <div className="font-bold text-slate-400 text-sm">Không tìm thấy người dùng nào phù hợp</div>
                  <p className="text-xs text-slate-500">
                    Hãy kiểm tra lại từ khóa tìm kiếm (Tên, SĐT, Email hoặc Mã User).
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800/80 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 font-bold">Người Dùng</th>
                        <th className="p-3 font-bold">Liên Hệ (SĐT / Email)</th>
                        <th className="p-3 text-right font-bold">Số Dư Ví</th>
                        <th className="p-3 text-right font-bold text-emerald-400">Tổng Nạp</th>
                        <th className="p-3 text-right font-bold text-amber-400">Doanh Thu Thu Được</th>
                        <th className="p-3 text-center font-bold">Số GD</th>
                        <th className="p-3 font-bold">GD Gần Nhất</th>
                        <th className="p-3 text-right font-bold">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                      {filteredUsersForReport.map((user) => {
                        const isGuest = user.role === 'guest';
                        return (
                          <tr key={user.id} className="hover:bg-slate-900/50 transition">
                            {/* User Info */}
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isGuest 
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}>
                                  {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    <i className={`fa-solid ${isGuest ? 'fa-user-secret' : 'fa-user'}`}></i>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span className="truncate">{user.name}</span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                      isGuest 
                                        ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                                    }`}>
                                      {user.roleName || user.role}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info */}
                            <td className="p-3">
                              <div className="space-y-0.5">
                                {user.phone ? (
                                  <div className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                                    <i className="fa-solid fa-phone text-[9px] text-emerald-500"></i>
                                    <span>{user.phone}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 text-[10px]">Chưa có SĐT</span>
                                )}
                                {user.email ? (
                                  <div className="text-slate-400 truncate max-w-[180px] flex items-center gap-1" title={user.email}>
                                    <i className="fa-regular fa-envelope text-[9px] text-slate-500"></i>
                                    <span>{user.email}</span>
                                  </div>
                                ) : null}
                              </div>
                            </td>

                            {/* Wallet Balance */}
                            <td className="p-3 text-right font-mono font-bold text-white whitespace-nowrap">
                              {(user.walletBalance || 0).toLocaleString('vi-VN')} đ
                            </td>

                            {/* Total Deposited */}
                            <td className="p-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                              +{(user.totalDeposited || 0).toLocaleString('vi-VN')} đ
                            </td>

                            {/* Total Spent / Platform Revenue */}
                            <td className="p-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                              {(user.totalSpent || 0).toLocaleString('vi-VN')} đ
                            </td>

                            {/* Txn Count */}
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold text-[11px]">
                                {user.txnCount} GD
                              </span>
                            </td>

                            {/* Latest Txn Date */}
                            <td className="p-3 text-slate-400 whitespace-nowrap">
                              {user.latestTxnDate ? (
                                <div className="flex flex-col">
                                  <span className="text-white font-mono">{formatDateTime(user.latestTxnDate).time}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{formatDateTime(user.latestTxnDate).date}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[10px]">Chưa phát sinh GD</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFinanceUserFilter(user.id);
                                    setIsUserReportModalOpen(false);
                                    setActiveMenu('finance');
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title={`Xem chi tiết sổ cái giao dịch của ${user.name}`}
                                >
                                  <i className="fa-solid fa-list-check text-[10px]"></i>
                                  <span>Xem Sổ Cái</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleExportSingleUserCSV(user)}
                                  className="px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow"
                                  title={`Tải file sao kê CSV của ${user.name}`}
                                >
                                  <i className="fa-solid fa-file-arrow-down text-[10px]"></i>
                                  <span>Sao Kê</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-400">
                Đang hiển thị <strong className="text-white">{filteredUsersForReport.length}</strong> / <strong className="text-white">{userFinanceSummaries.length}</strong> người dùng
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Real-time Toast Alert in Admin when new report arrives */}
      {incomingAlertToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-slate-950 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl shadow-rose-950/80 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg shrink-0 animate-bounce border border-rose-500/40">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Báo Cáo Vi Phạm Mới!
                </span>
                <button
                  type="button"
                  onClick={() => setIncomingAlertToast(null)}
                  className="text-slate-400 hover:text-white text-xs w-5 h-5 rounded-full flex items-center justify-center bg-slate-800"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">
                Tin #{incomingAlertToast.propertyId}: {incomingAlertToast.propertyTitle}
              </div>
              <div className="text-[11px] text-rose-200/90 line-clamp-2">
                <strong>Lý do:</strong> {REPORT_REASONS[incomingAlertToast.reason]?.label || incomingAlertToast.reason}
                {incomingAlertToast.description ? ` - "${incomingAlertToast.description}"` : ''}
              </div>
              <div className="text-[10px] text-slate-400">
                Người gửi: <strong className="text-white">{incomingAlertToast.reporterName || 'Khách'}</strong> ({incomingAlertToast.contact || 'Ẩn danh'})
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetReportId(incomingAlertToast.id);
                    setActiveMenu('reports');
                    setIncomingAlertToast(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition shadow-lg shadow-rose-600/40"
                >
                  <i className="fa-solid fa-gavel"></i>
                  <span>Xử Lý Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIncomingAlertToast(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-bold transition"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
