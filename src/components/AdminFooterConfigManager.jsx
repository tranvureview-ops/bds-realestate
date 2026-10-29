'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_FOOTER_CONFIG } from '../data/mockData';

// Danh sách toàn bộ các đường dẫn nội bộ trong website BĐS
export const ALL_INTERNAL_ROUTES = [
  {
    category: '📌 Trang Chính & Khám Phá',
    routes: [
      { label: 'Trang Chủ', url: '/' },
      { label: 'Nhà Đất Cần Bán', url: '/nha-dat-ban' },
      { label: 'Cho Thuê Nhà Đất', url: '/nha-dat-cho-thue' },
      { label: 'Bảng Giá Tin Đăng', url: '/bang-gia-tin-dang' },
      { label: 'Bảng Giá VIP', url: '/bang-gia-vip' },
      { label: 'Gói Hội Viên', url: '/goi-hoi-vien' },
      { label: 'Đăng Tin Mới (Hiệu Quả)', url: '/dang-tin' },
      { label: 'Công Cụ Tính Lãi Vay', url: '/tinh-lai-vay' },
      { label: 'So Sánh Đối Đầu BĐS', url: '/so-sanh' },
    ]
  },
  {
    category: '👤 Trang Thành Viên & Cá Nhân',
    routes: [
      { label: 'Hồ Sơ Cá Nhân', url: '/ho-so-ca-nhan' },
      { label: 'Quản Lý Tin Đăng', url: '/quan-ly-tin' },
      { label: 'Tin Đã Lưu Yêu Thích', url: '/tin-da-luu' },
      { label: 'Nạp Tiền Ví Tài Khoản', url: '/nap-tien' },
      { label: 'Đăng Nhập', url: '/dang-nhap' },
      { label: 'Đăng Ký Tài Khoản', url: '/dang-ky' },
      { label: 'Quên Mật Khẩu', url: '/quen-mat-khau' },
      { label: 'Đặt Lại Mật Khẩu', url: '/dat-lai-mat-khau' },
      { label: 'Bàn Làm Việc CMS Admin', url: '/admin' }
    ]
  },
  {
    category: '⚖️ Quy Chế & Chính Sách Pháp Lý',
    routes: [
      { label: 'Quy Chế Hoạt Động', url: '/quy-che-hoat-dong' },
      { label: 'Chính Sách Bảo Mật', url: '/chinh-sach-bao-mat' },
      { label: 'Chính Sách Pháp Lý', url: '/chinh-sach-phap-ly' },
      { label: 'Giải Quyết Khiếu Nại', url: '/giai-quyet-khieu-nai' }
    ]
  },
  {
    category: '🏢 Danh Mục BĐS Bán (Chuẩn SEO)',
    routes: [
      { label: 'Bán căn hộ chung cư', url: '/ban-can-ho-chung-cu/' },
      { label: 'Bán chung cư mini, CH dịch vụ', url: '/ban-chung-cu-mini/' },
      { label: 'Bán nhà riêng', url: '/ban-nha-rieng/' },
      { label: 'Bán nhà biệt thự, liền kề', url: '/ban-nha-biet-thu-lien-ke/' },
      { label: 'Bán nhà mặt phố', url: '/ban-nha-mat-pho/' },
      { label: 'Bán shophouse', url: '/ban-shophouse/' },
      { label: 'Bán đất nền dự án', url: '/ban-dat-nen-du-an/' },
      { label: 'Bán đất', url: '/ban-dat/' },
      { label: 'Bán trang trại, khu nghỉ dưỡng', url: '/ban-trang-trai-khu-nghi-duong/' },
      { label: 'Bán condotel', url: '/ban-condotel/' },
      { label: 'Bán kho, nhà xưởng', url: '/ban-kho-nha-xuong/' },
      { label: 'Bán loại BĐS khác', url: '/ban-bat-dong-san-khac/' }
    ]
  },
  {
    category: '🔑 Danh Mục BĐS Cho Thuê (Chuẩn SEO)',
    routes: [
      { label: 'Cho thuê căn hộ chung cư', url: '/cho-thue-can-ho-chung-cu/' },
      { label: 'Cho thuê chung cư mini, CH dịch vụ', url: '/cho-thue-chung-cu-mini/' },
      { label: 'Cho thuê nhà riêng, nguyên căn', url: '/cho-thue-nha-rieng/' },
      { label: 'Cho thuê biệt thự, liền kề', url: '/cho-thue-nha-biet-thu-lien-ke/' },
      { label: 'Cho thuê nhà mặt phố', url: '/cho-thue-nha-mat-pho/' },
      { label: 'Cho thuê shophouse', url: '/cho-thue-shophouse/' },
      { label: 'Cho thuê kho, nhà xưởng', url: '/cho-thue-kho-nha-xuong/' },
      { label: 'Cho thuê văn phòng', url: '/cho-thue-van-phong/' },
      { label: 'Cho thuê loại BĐS khác', url: '/cho-thue-bat-dong-san-khac/' }
    ]
  },
  {
    category: '📍 BĐS Trọng Điểm Đà Nẵng',
    routes: [
      { label: 'Căn hộ Sơn Trà (The Sang)', url: '/ban-can-ho-chung-cu-quan-son-tra/' },
      { label: 'Nhà riêng Quận Hải Châu', url: '/ban-nha-rieng-quan-hai-chau/' },
      { label: 'Đất nền Nam Hòa Xuân', url: '/ban-dat-nen-du-an-quan-ngu-hanh-son/' },
      { label: 'Đất nền dự án Đà Nẵng', url: '/ban-dat-nen-du-an-da-nang/' },
      { label: 'Biệt thự biển Sơn Trà', url: '/cho-thue-nha-biet-thu-lien-ke-quan-son-tra/' },
      { label: 'Đất Cẩm Lệ & Hòa Vang', url: '/ban-dat-quan-cam-le/' }
    ]
  }
];

// Danh sách các icon phổ biến theo nhóm phục vụ Icon Picker
export const AVAILABLE_FOOTER_ICONS = [
  // Thành viên & Người dùng
  { icon: 'fa-solid fa-user', name: 'Người dùng', cat: 'user', keywords: 'user nguoi dung ca nhan' },
  { icon: 'fa-solid fa-id-card-clip', name: 'Hồ sơ thẻ', cat: 'user', keywords: 'id card the ho so' },
  { icon: 'fa-solid fa-circle-user', name: 'User tròn', cat: 'user', keywords: 'circle user avatar' },
  { icon: 'fa-solid fa-users', name: 'Nhóm người', cat: 'user', keywords: 'users nhom cong dong' },
  { icon: 'fa-solid fa-user-tie', name: 'Môi giới', cat: 'user', keywords: 'tie moi gioi chuyen nghiep' },
  { icon: 'fa-solid fa-crown', name: 'Vương miện VIP', cat: 'user', keywords: 'crown vip vuong mien hoi vien' },
  { icon: 'fa-solid fa-shield-halved', name: 'Admin / Khiên', cat: 'user', keywords: 'shield admin quan tri' },

  // Nhà cửa & Bất động sản
  { icon: 'fa-solid fa-house', name: 'Ngôi nhà', cat: 'property', keywords: 'house nha rieng' },
  { icon: 'fa-solid fa-house-chimney', name: 'Nhà mái ấm', cat: 'property', keywords: 'chimney nha mai' },
  { icon: 'fa-solid fa-building', name: 'Tòa nhà / Căn hộ', cat: 'property', keywords: 'building chung cu can ho toa nha' },
  { icon: 'fa-solid fa-city', name: 'Đô thị / Dự án', cat: 'property', keywords: 'city do thi pho du an' },
  { icon: 'fa-solid fa-shop', name: 'Nhà mặt phố', cat: 'property', keywords: 'shop mat pho cua hang shophouse' },
  { icon: 'fa-solid fa-store', name: 'Shophouse', cat: 'property', keywords: 'store cua hang shophouse' },
  { icon: 'fa-solid fa-warehouse', name: 'Kho xưởng', cat: 'property', keywords: 'warehouse kho xuong' },
  { icon: 'fa-solid fa-landmark', name: 'Biệt thự / Villa', cat: 'property', keywords: 'landmark biet thu villa sang trong' },
  { icon: 'fa-solid fa-hotel', name: 'Khách sạn / Condotel', cat: 'property', keywords: 'hotel condotel khach san' },
  { icon: 'fa-solid fa-mountain-sun', name: 'Đất nền dự án', cat: 'property', keywords: 'mountain dat nen du an' },
  { icon: 'fa-solid fa-tree', name: 'Nghỉ dưỡng / Farm', cat: 'property', keywords: 'tree resort trang trai nghi duong' },
  { icon: 'fa-solid fa-key', name: 'Chìa khóa / Thuê', cat: 'property', keywords: 'key chia khoa cho thue' },

  // Quản lý & Tin đăng
  { icon: 'fa-solid fa-list-check', name: 'Quản lý tin', cat: 'manage', keywords: 'list check quan ly tin dang' },
  { icon: 'fa-solid fa-clipboard-list', name: 'Danh sách kiểm', cat: 'manage', keywords: 'clipboard danh sach' },
  { icon: 'fa-solid fa-pen-to-square', name: 'Đăng tin / Sửa', cat: 'manage', keywords: 'pen edit dang tin viet' },
  { icon: 'fa-solid fa-bullhorn', name: 'Quảng bá / Đẩy tin', cat: 'manage', keywords: 'bullhorn loa quang ba day tin vip' },
  { icon: 'fa-solid fa-newspaper', name: 'Bảng tin tức', cat: 'manage', keywords: 'newspaper bao tin tuc' },
  { icon: 'fa-solid fa-file-lines', name: 'Hồ sơ tài liệu', cat: 'manage', keywords: 'file lines tai lieu giay to' },
  { icon: 'fa-solid fa-clock', name: 'Thời gian / Lịch', cat: 'manage', keywords: 'clock gio hen gio thoi gian' },

  // Tài chính & Ví
  { icon: 'fa-solid fa-wallet', name: 'Ví tài khoản', cat: 'finance', keywords: 'wallet vi tien nap tien' },
  { icon: 'fa-solid fa-credit-card', name: 'Thẻ thanh toán', cat: 'finance', keywords: 'credit card the atm visa' },
  { icon: 'fa-solid fa-money-bill-wave', name: 'Tiền mặt', cat: 'finance', keywords: 'money tien mat dong' },
  { icon: 'fa-solid fa-coins', name: 'Đồng xu / Điểm', cat: 'finance', keywords: 'coins xu tich diem' },
  { icon: 'fa-solid fa-calculator', name: 'Tính lãi vay', cat: 'finance', keywords: 'calculator tinh lai vay ngan hang' },
  { icon: 'fa-solid fa-receipt', name: 'Hóa đơn / Giao dịch', cat: 'finance', keywords: 'receipt hoa don bien lai' },
  { icon: 'fa-solid fa-chart-line', name: 'Biểu đồ thị trường', cat: 'finance', keywords: 'chart bieu do gia tang truong' },

  // Tương tác & Yêu thích
  { icon: 'fa-solid fa-heart', name: 'Trái tim / Yêu thích', cat: 'interactive', keywords: 'heart trai tim yeu thich luu tin' },
  { icon: 'fa-solid fa-star', name: 'Ngôi sao / Nổi bật', cat: 'interactive', keywords: 'star ngoi sao danh gia vip' },
  { icon: 'fa-solid fa-bookmark', name: 'Đánh dấu', cat: 'interactive', keywords: 'bookmark danh dau luu' },
  { icon: 'fa-solid fa-code-compare', name: 'So sánh đối đầu', cat: 'interactive', keywords: 'compare so sanh hai san pham' },
  { icon: 'fa-solid fa-scale-balanced', name: 'Cân đo so sánh', cat: 'interactive', keywords: 'scale can do phap ly gia' },
  { icon: 'fa-solid fa-share-nodes', name: 'Chia sẻ', cat: 'interactive', keywords: 'share chia se mang xa hoi' },

  // Bảo mật & Chứng nhận
  { icon: 'fa-solid fa-shield-check', name: 'Khiên bảo mật', cat: 'security', keywords: 'shield check bao ve an toan ssl' },
  { icon: 'fa-solid fa-lock', name: 'Khóa an toàn SSL', cat: 'security', keywords: 'lock khoa mat ma 256-bit' },
  { icon: 'fa-solid fa-award', name: 'Huy hiệu danh giá', cat: 'security', keywords: 'award huy chuong giai thuong' },
  { icon: 'fa-solid fa-certificate', name: 'Chứng nhận bộ CT', cat: 'security', keywords: 'certificate chung nhan giay phep bo cong thuong' },
  { icon: 'fa-solid fa-circle-check', name: 'Tích xanh uy tín', cat: 'security', keywords: 'circle check tich xanh xac thuc' },
  { icon: 'fa-solid fa-file-shield', name: 'Pháp lý an toàn', cat: 'security', keywords: 'file shield so do so hong phap ly' },

  // Tiện ích & Hỗ trợ
  { icon: 'fa-solid fa-compass', name: 'La bàn khám phá', cat: 'utility', keywords: 'compass la ban huong nha phong thuy' },
  { icon: 'fa-solid fa-map-location-dot', name: 'Bản đồ vị trí', cat: 'utility', keywords: 'map location ban do toa do gis' },
  { icon: 'fa-solid fa-phone', name: 'Hotline gọi điện', cat: 'utility', keywords: 'phone dien thoai hotline cskh' },
  { icon: 'fa-solid fa-envelope', name: 'Hộp thư email', cat: 'utility', keywords: 'envelope email hop thu phan anh' },
  { icon: 'fa-solid fa-circle-info', name: 'Thông tin trợ giúp', cat: 'utility', keywords: 'info tro giup huong dan' },
  { icon: 'fa-solid fa-link', name: 'Liên kết', cat: 'utility', keywords: 'link lien ket duong dan' }
];

export const AVAILABLE_ICON_COLORS = [
  { label: 'Vàng Amber', value: 'text-amber-400', bg: 'bg-amber-400' },
  { label: 'Xanh Emerald', value: 'text-emerald-400', bg: 'bg-emerald-400' },
  { label: 'Xanh Blue', value: 'text-blue-400', bg: 'bg-blue-400' },
  { label: 'Đỏ Rose', value: 'text-rose-400', bg: 'bg-rose-400' },
  { label: 'Tím Purple', value: 'text-purple-400', bg: 'bg-purple-400' },
  { label: 'Xanh Teal', value: 'text-teal-400', bg: 'bg-teal-400' },
  { label: 'Cyan Biển', value: 'text-cyan-400', bg: 'bg-cyan-400' },
  { label: 'Trắng Sáng', value: 'text-white', bg: 'bg-white' },
];

export default function AdminFooterConfigManager() {
  const {
    footerConfig,
    updateFooterConfig,
    systemConfig,
    headerConfig,
    showToast
  } = useRealEstate();

  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_FOOTER_CONFIG,
    ...(footerConfig || {})
  }));

  useEffect(() => {
    if (footerConfig && Object.keys(footerConfig).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...footerConfig
      }));
    }
  }, [footerConfig]);

  const [isSaving, setIsSaving] = useState(false);

  // Modal Icon Picker State: { type: 'col3' | 'badge', index: number } | null
  const [iconPickerTarget, setIconPickerTarget] = useState(null);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [iconCategoryFilter, setIconCategoryFilter] = useState('all');

  // Xử lý lưu cấu hình (1 nút lưu duy nhất)
  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      await updateFooterConfig(formData);
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình Footer:', err);
      showToast('Có lỗi xảy ra khi lưu cấu hình Footer', 'error');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Helper Cột 2 (Khám Phá Nhà Đất)
  const handleAddCol2Link = () => {
    setFormData(prev => ({
      ...prev,
      col2Links: [
        ...(prev.col2Links || []),
        { id: `c2-${Date.now()}`, label: 'Nhà Đất Cần Bán', url: '/nha-dat-ban' }
      ]
    }));
  };

  const handleUpdateCol2Link = (index, field, val) => {
    setFormData(prev => {
      const list = [...(prev.col2Links || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, col2Links: list };
    });
  };

  const handleDeleteCol2Link = (index) => {
    setFormData(prev => {
      const list = [...(prev.col2Links || [])];
      list.splice(index, 1);
      return { ...prev, col2Links: list };
    });
  };

  // Helper Cột 3 (Trang Thành Viên)
  const handleAddCol3Link = () => {
    setFormData(prev => ({
      ...prev,
      col3Links: [
        ...(prev.col3Links || []),
        { id: `c3-${Date.now()}`, icon: 'fa-solid fa-user', color: 'text-amber-400', label: 'Hồ Sơ Cá Nhân', url: '/ho-so-ca-nhan' }
      ]
    }));
  };

  const handleUpdateCol3Link = (index, field, val) => {
    setFormData(prev => {
      const list = [...(prev.col3Links || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, col3Links: list };
    });
  };

  const handleDeleteCol3Link = (index) => {
    setFormData(prev => {
      const list = [...(prev.col3Links || [])];
      list.splice(index, 1);
      return { ...prev, col3Links: list };
    });
  };

  // Helper Cột 4 (Badges)
  const handleAddBadge = () => {
    setFormData(prev => ({
      ...prev,
      badges: [
        ...(prev.badges || []),
        {
          id: `b-${Date.now()}`,
          icon: 'fa-solid fa-award',
          iconColor: 'text-emerald-400',
          title: 'Chứng nhận mới',
          desc: 'Mô tả tiêu chuẩn bảo mật hoặc giấy phép sàn TMĐT...',
          url: ''
        }
      ]
    }));
  };

  const handleUpdateBadge = (index, field, val) => {
    setFormData(prev => {
      const list = [...(prev.badges || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, badges: list };
    });
  };

  const handleDeleteBadge = (index) => {
    setFormData(prev => {
      const list = [...(prev.badges || [])];
      list.splice(index, 1);
      return { ...prev, badges: list };
    });
  };

  // Helper Chính Sách (Policy Links)
  const handleAddPolicyLink = () => {
    setFormData(prev => ({
      ...prev,
      policyLinks: [
        ...(prev.policyLinks || []),
        { id: `p-${Date.now()}`, label: 'Chính sách mới', url: '/chinh-sach-bao-mat' }
      ]
    }));
  };

  const handleUpdatePolicyLink = (index, field, val) => {
    setFormData(prev => {
      const list = [...(prev.policyLinks || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, policyLinks: list };
    });
  };

  const handleDeletePolicyLink = (index) => {
    setFormData(prev => {
      const list = [...(prev.policyLinks || [])];
      list.splice(index, 1);
      return { ...prev, policyLinks: list };
    });
  };

  // Chọn icon từ Icon Picker
  const handleSelectIcon = (iconClass, colorClass) => {
    if (!iconPickerTarget) return;
    const { type, index } = iconPickerTarget;
    if (type === 'col3') {
      handleUpdateCol3Link(index, 'icon', iconClass);
      if (colorClass) handleUpdateCol3Link(index, 'color', colorClass);
    } else if (type === 'badge') {
      handleUpdateBadge(index, 'icon', iconClass);
      if (colorClass) handleUpdateBadge(index, 'iconColor', colorClass);
    }
    setIconPickerTarget(null);
  };

  // Helper chọn đường dẫn từ Dropdown toàn bộ routes nội bộ
  const handleSelectRouteForLink = (chosenUrl, updateFn, currentLabel) => {
    if (!chosenUrl) return;
    // Tìm route tương ứng để gợi ý tên nhãn tự động
    let matchedLabel = '';
    for (const group of ALL_INTERNAL_ROUTES) {
      const found = group.routes.find(r => r.url === chosenUrl);
      if (found) {
        matchedLabel = found.label;
        break;
      }
    }
    updateFn('url', chosenUrl);
    // Nếu tên nhãn hiện tại đang rỗng hoặc là tên mặc định tạo mới thì tự động điền tên trang chuẩn
    const isDefaultLabel = !currentLabel || 
      currentLabel === 'Liên kết mới' || 
      currentLabel === 'Trang mới' || 
      currentLabel === 'Chính sách mới';
    if (isDefaultLabel && matchedLabel) {
      updateFn('label', matchedLabel);
    }
  };

  // Fallback preview values
  const previewHotline = formData.hotline || systemConfig?.hotline || '0898 246 607';
  const previewZalo = formData.zalo || systemConfig?.zalo;
  const previewEmail = formData.email || systemConfig?.email || 'cskh@datbiendanang.vn';
  const previewAddress = formData.address || systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
  const previewBrandDesc = formData.brandDescription || DEFAULT_FOOTER_CONFIG.brandDescription;

  const socialConfig = headerConfig?.socialLinks || systemConfig?.socialLinks || {};
  const activeSocialList = Object.entries(socialConfig)
    .filter(([_, item]) => item && item.enabled && item.url)
    .map(([key, item]) => ({ key, ...item }));

  // Lọc icons trong modal picker
  const filteredIcons = AVAILABLE_FOOTER_ICONS.filter(ic => {
    const matchesCat = iconCategoryFilter === 'all' || ic.cat === iconCategoryFilter;
    const q = iconSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || ic.name.toLowerCase().includes(q) || ic.icon.toLowerCase().includes(q) || ic.keywords?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Current item being edited by Icon Picker
  const currentPickerItem = iconPickerTarget 
    ? (iconPickerTarget.type === 'col3' 
        ? formData.col3Links?.[iconPickerTarget.index] 
        : formData.badges?.[iconPickerTarget.index])
    : null;

  return (
    <div className="space-y-6 relative">
      {/* Top Banner & Single Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-shoe-prints"></i>
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Cài Đặt Chân Trang Website (Footer Settings)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị 4 cột nội dung, sổ danh sách toàn bộ liên kết nội bộ trang web và thư viện biểu tượng trực quan.
          </p>
        </div>

        {/* Master Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <i className={isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'}></i>
          <span>{isSaving ? 'Đang lưu cấu hình...' : 'Lưu Cài Đặt Footer'}</span>
        </button>
      </div>

      {/* Grid: Forms & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Nhóm 1: Cột 1 - Thông Tin Thương Hiệu & CSKH */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-building text-emerald-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  1. Cột 1: Thông Tin Thương Hiệu & Liên Hệ CSKH
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                Cột Trái
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mô Tả Ngắn Sàn BĐS (Dưới Logo Chân Trang):
                </label>
                <textarea
                  rows={3}
                  value={formData.brandDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandDescription: e.target.value }))}
                  placeholder="Nhập đoạn mô tả ngắn giới thiệu thế mạnh công nghệ, quy mô của sàn..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Hotline Hiển Thị Chân Trang:
                  </label>
                  <input
                    type="text"
                    value={formData.hotline || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, hotline: e.target.value }))}
                    placeholder={systemConfig?.hotline || '0898 246 607'}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Để trống sẽ tự động lấy theo Hotline Cài Đặt Hệ Thống</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Số Zalo CSKH Chân Trang:
                  </label>
                  <input
                    type="text"
                    value={formData.zalo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, zalo: e.target.value }))}
                    placeholder={systemConfig?.zalo || '0898 246 607'}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Để trống sẽ tự động lấy theo Zalo Cài Đặt Hệ Thống</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email CSKH Chân Trang:
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={systemConfig?.email || 'cskh@datbiendanang.vn'}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Trụ Sở Chính / Địa Chỉ:
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder={systemConfig?.address || 'Lô A38 Trần Văn Trứ, Hải Châu, Đà Nẵng'}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tùy chỉnh khối mạng xã hội */}
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.showSocialLinks !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, showSocialLinks: e.target.checked }))}
                      className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-white">Hiển thị Khối Icon Mạng Xã Hội</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    ({activeSocialList.length} kênh đang bật từ Tab Header)
                  </span>
                </div>

                {formData.showSocialLinks !== false && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tiêu đề khối mạng xã hội:
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinksTitle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, socialLinksTitle: e.target.value }))}
                      placeholder="KẾT NỐI VỚI CHÚNG TÔI:"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nhóm 2: Cột 2 - Khám Phá Nhà Đất */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-compass text-teal-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  2. Cột 2: Khám Phá Nhà Đất (Navigation Links)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddCol2Link}
                className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm Link</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tiêu Đề Cột 2:
              </label>
              <input
                type="text"
                value={formData.col2Title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, col2Title: e.target.value }))}
                placeholder="KHÁM PHÁ NHÀ ĐẤT"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase"
              />
            </div>

            {/* Danh sách liên kết Cột 2 */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Danh Sách Liên Kết:</span>
                <span className="text-[10px] text-teal-400 font-normal">
                  💡 Chọn từ danh sách sổ link hoặc nhập tùy chỉnh
                </span>
              </div>

              {(formData.col2Links || []).map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-teal-400 font-bold">Mục #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCol2Link(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition cursor-pointer flex items-center gap-1"
                      title="Xóa liên kết này"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                      <span className="text-[10px]">Xóa</span>
                    </button>
                  </div>

                  {/* Sổ chọn nhanh toàn bộ Link trong Website */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-list-ul text-teal-400 text-[10px]"></i>
                      <span>Sổ danh sách trang web (Chọn để tự động điền URL & Tên):</span>
                    </label>
                    <select
                      value={link.url || ''}
                      onChange={(e) => handleSelectRouteForLink(e.target.value, (f, v) => handleUpdateCol2Link(idx, f, v), link.label)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs outline-none focus:border-teal-500"
                    >
                      <option value="">-- Bấm vào đây để chọn nhanh trong 40+ trang website --</option>
                      {ALL_INTERNAL_ROUTES.map((group, gIdx) => (
                        <optgroup key={gIdx} label={group.category} className="bg-slate-900 text-emerald-400 font-bold">
                          {group.routes.map((r, rIdx) => (
                            <option key={rIdx} value={r.url} className="bg-slate-950 text-white font-normal">
                              {r.label} &rarr; {r.url}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="__custom__" className="text-amber-400">✏️ Đường dẫn tùy chỉnh khác...</option>
                    </select>
                  </div>

                  {/* Chi tiết Tên hiển thị & URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tên Hiển Thị (Label):</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => handleUpdateCol2Link(idx, 'label', e.target.value)}
                        placeholder="Nhà Đất Cần Bán"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đường Dẫn URL:</label>
                      <input
                        type="text"
                        value={link.url || ''}
                        onChange={(e) => handleUpdateCol2Link(idx, 'url', e.target.value)}
                        placeholder="/nha-dat-ban"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nhóm 3: Cột 3 - Trang Thành Viên */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-id-card-clip text-amber-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  3. Cột 3: Trang Thành Viên (Member Links)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddCol3Link}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm Link</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tiêu Đề Cột 3:
              </label>
              <input
                type="text"
                value={formData.col3Title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, col3Title: e.target.value }))}
                placeholder="TRANG THÀNH VIÊN"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase"
              />
            </div>

            {/* Danh sách liên kết Cột 3 */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Danh Sách Liên Kết Thành Viên:</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  💡 Nhấn vào Icon để mở bộ chọn biểu tượng trực quan
                </span>
              </div>

              {(formData.col3Links || []).map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">Mục #{idx + 1}</span>
                      {/* Nút mở Icon Picker trực quan */}
                      <button
                        type="button"
                        onClick={() => {
                          setIconPickerTarget({ type: 'col3', index: idx });
                          setIconSearchQuery('');
                          setIconCategoryFilter('all');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400/80 flex items-center gap-1.5 transition cursor-pointer group shadow-xs"
                        title="Bấm để chọn biểu tượng & màu sắc"
                      >
                        <i className={`${link.icon || 'fa-solid fa-link'} ${link.color || 'text-amber-400'} text-xs`}></i>
                        <span className="text-[10px] text-slate-300 font-semibold group-hover:text-amber-300">Đổi Icon ▾</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCol3Link(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition cursor-pointer flex items-center gap-1"
                      title="Xóa liên kết này"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                      <span className="text-[10px]">Xóa</span>
                    </button>
                  </div>

                  {/* Sổ chọn nhanh toàn bộ Link trong Website */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-list-ul text-amber-400 text-[10px]"></i>
                      <span>Sổ danh sách trang web (Tự động điền URL & Tên):</span>
                    </label>
                    <select
                      value={link.url || ''}
                      onChange={(e) => handleSelectRouteForLink(e.target.value, (f, v) => handleUpdateCol3Link(idx, f, v), link.label)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs outline-none focus:border-amber-500"
                    >
                      <option value="">-- Bấm vào đây để chọn nhanh trong 40+ trang website --</option>
                      {ALL_INTERNAL_ROUTES.map((group, gIdx) => (
                        <optgroup key={gIdx} label={group.category} className="bg-slate-900 text-emerald-400 font-bold">
                          {group.routes.map((r, rIdx) => (
                            <option key={rIdx} value={r.url} className="bg-slate-950 text-white font-normal">
                              {r.label} &rarr; {r.url}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="__custom__" className="text-amber-400">✏️ Đường dẫn tùy chỉnh khác...</option>
                    </select>
                  </div>

                  {/* Chi tiết Tên hiển thị & URL & Class Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tên Mục Thành Viên:</label>
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => handleUpdateCol3Link(idx, 'label', e.target.value)}
                        placeholder="Hồ Sơ Cá Nhân"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đường Dẫn URL:</label>
                      <input
                        type="text"
                        value={link.url || ''}
                        onChange={(e) => handleUpdateCol3Link(idx, 'url', e.target.value)}
                        placeholder="/ho-so-ca-nhan"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkbox Admin CMS */}
            <label className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showAdminCmsLink !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, showAdminCmsLink: e.target.checked }))}
                className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-800 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-300">
                Hiển thị liên kết <b>"Bàn Làm Việc CMS Admin"</b> ở chân trang (chỉ hiển thị khi Admin đăng nhập)
              </span>
            </label>
          </div>

          {/* Nhóm 4: Cột 4 - Chứng Nhận & Bảo Mật */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-blue-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  4. Cột 4: Chứng Nhận & Bảo Mật (Trust Badges)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddBadge}
                className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm Chứng Nhận</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Tiêu Đề Cột 4:
              </label>
              <input
                type="text"
                value={formData.col4Title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, col4Title: e.target.value }))}
                placeholder="CHỨNG NHẬN & BẢO MẬT"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase"
              />
            </div>

            {/* Danh sách Badges */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Danh Sách Huy Hiệu Chứng Nhận:</span>
                <span className="text-[10px] text-blue-400 font-normal">
                  💡 Bấm nút icon để chọn biểu tượng bảo mật / chứng chỉ
                </span>
              </div>

              {(formData.badges || []).map((badge, idx) => (
                <div
                  key={badge.id || idx}
                  className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-400">Huy hiệu #{idx + 1}</span>
                      {/* Nút mở Icon Picker cho Badge */}
                      <button
                        type="button"
                        onClick={() => {
                          setIconPickerTarget({ type: 'badge', index: idx });
                          setIconSearchQuery('');
                          setIconCategoryFilter('security');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-blue-400/80 flex items-center gap-1.5 transition cursor-pointer group shadow-xs"
                        title="Bấm để chọn biểu tượng & màu sắc"
                      >
                        <i className={`${badge.icon || 'fa-solid fa-award'} ${badge.iconColor || 'text-emerald-400'} text-xs`}></i>
                        <span className="text-[10px] text-slate-300 font-semibold group-hover:text-blue-300">Đổi Icon ▾</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBadge(idx)}
                      className="px-2 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can text-[9px]"></i>
                      <span>Xóa</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tiêu Đề Chứng Nhận:</label>
                    <input
                      type="text"
                      value={badge.title || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'title', e.target.value)}
                      placeholder="Đã Đăng Ký Bộ Công Thương"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mô Tả Chi Tiết / Căn Cứ Pháp Lý:</label>
                    <textarea
                      rows={2}
                      value={badge.desc || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'desc', e.target.value)}
                      placeholder="Sàn TMĐT giao dịch bất động sản hợp pháp theo Nghị định..."
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đường Dẫn Xác Minh Ngoài (Tùy chọn):</label>
                    <input
                      type="text"
                      value={badge.url || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'url', e.target.value)}
                      placeholder="https://online.gov.vn/... (Để trống nếu không liên kết ngoài)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nhóm 5: Bản Quyền & Chính Sách Pháp Lý (Chân Trang) */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-copyright text-slate-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  5. Bản Quyền & Chính Sách Pháp Lý Chân Trang
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddPolicyLink}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                <span>Thêm Chính Sách</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Dòng Chữ Bản Quyền Tùy Chỉnh:
              </label>
              <input
                type="text"
                value={formData.copyrightCustomText || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, copyrightCustomText: e.target.value }))}
                placeholder={`© ${new Date().getFullYear()} ${systemConfig?.brandShortName || 'SÀN BẤT ĐỘNG SẢN'}. Bản quyền thuộc về ${systemConfig?.platformName || 'Công ty Cổ phần BĐS'}.`}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Để trống sẽ tự động hiển thị theo Tên Thương Hiệu & Tên Pháp Nhân Sàn</p>
            </div>

            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-slate-400">Các Liên Kết Pháp Lý & Điều Khoản:</label>
              {(formData.policyLinks || []).map((policy, idx) => (
                <div
                  key={policy.id || idx}
                  className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Chính sách #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePolicyLink(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition cursor-pointer flex items-center gap-1"
                      title="Xóa chính sách này"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                      <span className="text-[10px]">Xóa</span>
                    </button>
                  </div>

                  {/* Sổ chọn nhanh trang chính sách */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Sổ chọn nhanh trang chính sách:
                    </label>
                    <select
                      value={policy.url || ''}
                      onChange={(e) => handleSelectRouteForLink(e.target.value, (f, v) => handleUpdatePolicyLink(idx, f, v), policy.label)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs outline-none focus:border-slate-500"
                    >
                      <option value="">-- Chọn trong danh sách trang pháp lý --</option>
                      {ALL_INTERNAL_ROUTES.filter(g => g.category.includes('Chính Sách') || g.category.includes('Chính')).map((group, gIdx) => (
                        <optgroup key={gIdx} label={group.category} className="bg-slate-900 text-emerald-400 font-bold">
                          {group.routes.map((r, rIdx) => (
                            <option key={rIdx} value={r.url} className="bg-slate-950 text-white font-normal">
                              {r.label} &rarr; {r.url}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tên Chính Sách:</label>
                      <input
                        type="text"
                        value={policy.label || ''}
                        onChange={(e) => handleUpdatePolicyLink(idx, 'label', e.target.value)}
                        placeholder="Quy chế hoạt động"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đường Dẫn URL:</label>
                      <input
                        type="text"
                        value={policy.url || ''}
                        onChange={(e) => handleUpdatePolicyLink(idx, 'url', e.target.value)}
                        placeholder="/quy-che-hoat-dong"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nhóm 6: Khối SEO Danh Mục & Địa Giới Hành Chính */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-sitemap text-emerald-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  6. Khối SEO Danh Mục & Địa Giới Hành Chính Chuẩn SEO
                </h4>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showSeoTaxonomy !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, showSeoTaxonomy: e.target.checked }))}
                className="w-5 h-5 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500 mt-0.5 shrink-0"
              />
              <div>
                <div className="font-bold text-white text-xs">
                  Hiển thị khối liên kết Danh Mục Bất Động Sản & Địa Giới Hành Chính ở chân trang
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Bao gồm 4 cột liên kết chuẩn SEO: BĐS Nhà ở & Căn hộ, Đất nền & Nghỉ dưỡng, BĐS Cho thuê, BĐS Trọng điểm Đà Nẵng. Giúp Google bot index sâu toàn bộ danh mục của sàn.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Xem Trước Chân Trang (Live Preview)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Đồng bộ tức thì</span>
              </div>

              {/* Mini Preview Box */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 text-xs text-slate-300 shadow-inner">
                {/* Brand & Contacts */}
                <div className="space-y-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-xs">
                        {systemConfig?.brandShortName || 'SÀN BẤT ĐỘNG SẢN'}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase">
                        {systemConfig?.tagline || 'Sàn Giao Dịch Bất Động Sản'}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {previewBrandDesc}
                  </p>

                  <div className="text-[10px] space-y-1 text-slate-300 font-mono">
                    <div>📞 Hotline: <span className="text-white font-bold">{previewHotline}</span></div>
                    {previewZalo && <div>💬 Zalo: <span className="text-emerald-400">{previewZalo}</span></div>}
                    <div>✉️ Email: <span className="text-slate-300">{previewEmail}</span></div>
                    <div>📍 Trụ sở: <span className="text-slate-400">{previewAddress}</span></div>
                  </div>

                  {formData.showSocialLinks !== false && activeSocialList.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {formData.socialLinksTitle || 'KẾT NỐI VỚI CHÚNG TÔI:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeSocialList.map(s => (
                          <span
                            key={s.key}
                            className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300"
                          >
                            {s.key === 'zalo' ? 'Z' : <i className={s.icon}></i>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columns Preview */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {/* Cột 2 */}
                  <div className="space-y-1">
                    <div className="font-black text-white uppercase text-[10px] tracking-wider text-teal-400">
                      {formData.col2Title || 'KHÁM PHÁ'}
                    </div>
                    <ul className="space-y-1 text-slate-400 text-[10px]">
                      {(formData.col2Links || []).map((l, i) => (
                        <li key={i} className="truncate">• {l.label}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cột 3 */}
                  <div className="space-y-1">
                    <div className="font-black text-white uppercase text-[10px] tracking-wider text-amber-400">
                      {formData.col3Title || 'THÀNH VIÊN'}
                    </div>
                    <ul className="space-y-1 text-slate-400 text-[10px]">
                      {(formData.col3Links || []).map((l, i) => (
                        <li key={i} className="truncate flex items-center gap-1">
                          <i className={`${l.icon || 'fa-solid fa-link'} ${l.color || 'text-amber-400'} text-[9px]`}></i>
                          <span className="truncate">{l.label}</span>
                        </li>
                      ))}
                      {formData.showAdminCmsLink !== false && (
                        <li className="text-red-400 font-semibold flex items-center gap-1">
                          <i className="fa-solid fa-shield-halved text-[9px]"></i>
                          <span>Bàn Làm Việc Admin</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Cột 4: Badges preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="font-black text-white uppercase text-[10px] tracking-wider text-blue-400">
                    {formData.col4Title || 'CHỨNG NHẬN & BẢO MẬT'}
                  </div>
                  <div className="space-y-1.5">
                    {(formData.badges || []).map((b, i) => (
                      <div key={i} className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px]">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <i className={`${b.icon || 'fa-solid fa-shield-check'} ${b.iconColor || 'text-emerald-400'} text-[10px]`}></i>
                          <span>{b.title}</span>
                        </div>
                        {b.desc && <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{b.desc}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Block Status */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span>Khối SEO Danh mục:</span>
                  <span className={`font-bold ${formData.showSeoTaxonomy !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formData.showSeoTaxonomy !== false ? 'Đang bật' : 'Đã ẩn'}
                  </span>
                </div>

                {/* Copyright preview */}
                <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 text-center">
                  {formData.copyrightCustomText?.trim() 
                    ? formData.copyrightCustomText 
                    : `© ${new Date().getFullYear()} ${systemConfig?.brandShortName || 'SÀN BẤT ĐỘNG SẢN'}.`}
                </div>
              </div>

              {/* Bottom Quick Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className={isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'}></i>
                <span>{isSaving ? 'Đang lưu cấu hình...' : 'Lưu Toàn Bộ Cài Đặt Footer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: BỘ CHỌN BIỂU TƯỢNG TRỰC QUAN (ICON PICKER MODAL)
         ======================================================== */}
      {iconPickerTarget !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold border border-amber-500/30">
                  <i className="fa-solid fa-icons"></i>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white tracking-wider">
                    Thư Viện Biểu Tượng (Icon Picker)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Bấm vào biểu tượng để chọn áp dụng ngay cho {iconPickerTarget.type === 'col3' ? 'liên kết thành viên' : 'huy hiệu chứng nhận'}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIconPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Current Selected Icon & Color Preview */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                  <i className={`${currentPickerItem?.icon || 'fa-solid fa-link'} ${currentPickerItem?.color || currentPickerItem?.iconColor || 'text-amber-400'}`}></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Biểu tượng đang chọn</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentPickerItem?.icon || 'fa-solid fa-link'}
                  </div>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Màu sắc:</span>
                {AVAILABLE_ICON_COLORS.map(c => {
                  const isSelected = (currentPickerItem?.color || currentPickerItem?.iconColor) === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        if (iconPickerTarget.type === 'col3') {
                          handleUpdateCol3Link(iconPickerTarget.index, 'color', c.value);
                        } else {
                          handleUpdateBadge(iconPickerTarget.index, 'iconColor', c.value);
                        }
                      }}
                      className={`w-5 h-5 rounded-full ${c.bg} transition transform hover:scale-110 cursor-pointer ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Search & Category Filter Pills */}
            <div className="space-y-2.5 shrink-0">
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  type="text"
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm biểu tượng (ví dụ: nhà, tiền, thẻ, user, lock, khiên, star...)"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                />
                {iconSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setIconSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { id: 'all', label: 'Tất Cả' },
                  { id: 'user', label: '👤 Người Dùng' },
                  { id: 'property', label: '🏠 Nhà & BĐS' },
                  { id: 'manage', label: '📋 Quản Lý' },
                  { id: 'finance', label: '💳 Tài Chính' },
                  { id: 'interactive', label: '❤️ Yêu Thích' },
                  { id: 'security', label: '🛡️ Bảo Mật' },
                  { id: 'utility', label: '🧭 Tiện Ích' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIconCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      iconCategoryFilter === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Grid of Icons */}
            <div className="overflow-y-auto flex-1 pr-1 border border-slate-800/80 rounded-2xl p-3 bg-slate-950/60 min-h-[220px]">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Không tìm thấy biểu tượng phù hợp với từ khóa "{iconSearchQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {filteredIcons.map(ic => {
                    const activeColor = currentPickerItem?.color || currentPickerItem?.iconColor || 'text-amber-400';
                    const isCurrent = currentPickerItem?.icon === ic.icon;
                    return (
                      <button
                        key={ic.icon}
                        type="button"
                        onClick={() => handleSelectIcon(ic.icon, activeColor)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group ${
                          isCurrent
                            ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/90 text-slate-300'
                        }`}
                        title={ic.name}
                      >
                        <i className={`${ic.icon} text-lg ${activeColor} group-hover:scale-110 transition`}></i>
                        <span className="text-[10px] text-slate-400 group-hover:text-white truncate max-w-[80px] text-center">
                          {ic.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer / Custom FontAwesome Input */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 shrink-0">Hoặc nhập class thủ công:</span>
                <input
                  type="text"
                  value={currentPickerItem?.icon || ''}
                  onChange={(e) => {
                    if (iconPickerTarget.type === 'col3') {
                      handleUpdateCol3Link(iconPickerTarget.index, 'icon', e.target.value);
                    } else {
                      handleUpdateBadge(iconPickerTarget.index, 'icon', e.target.value);
                    }
                  }}
                  placeholder="fa-solid fa-star"
                  className="p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs flex-1 outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setIconPickerTarget(null)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
