'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_HEADER_CONFIG, DEFAULT_SOCIAL_LINKS } from '../data/mockData';
import SocialIcon from './SocialIcon';

const topbarColorClasses = {
  emerald: { badge: 'bg-emerald-900 text-emerald-100 border-emerald-700', dot: 'bg-emerald-300' },
  amber: { badge: 'bg-amber-900/80 text-amber-100 border-amber-600', dot: 'bg-amber-400' },
  red: { badge: 'bg-red-900/80 text-red-100 border-red-600', dot: 'bg-red-400' },
  blue: { badge: 'bg-blue-900/80 text-blue-100 border-blue-600', dot: 'bg-blue-400' },
  purple: { badge: 'bg-purple-900/80 text-purple-100 border-purple-600', dot: 'bg-purple-400' },
  slate: { badge: 'bg-slate-800 text-slate-200 border-slate-700', dot: 'bg-slate-400' }
};

export default function AdminHeaderConfigManager({ onSwitchToMenu = null }) {
  const {
    headerConfig,
    updateHeaderConfig,
    PRESET_LOGOS,
    navMenuItems,
    showToast,
    systemConfig
  } = useRealEstate();

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
    logoAlt: headerConfig?.logoAlt || `${systemConfig?.brandShortName || 'Sàn BĐS'} Logo`,
    showTaglineWithImage: headerConfig?.showTaglineWithImage || false,
    containerWidth: headerConfig?.containerWidth || 'boxed',
    socialLinks: headerConfig?.socialLinks || DEFAULT_SOCIAL_LINKS,
    topbar: {
      showTopbar: true,
      showBadge: true,
      badgeText: '',
      badgeColor: 'emerald',
      hotlineLabel: 'Hotline 24/7:',
      hotline: '',
      workingHours: '8:00 - 21:00',
      showWorkingHours: true,
      showSocial: true,
      bgColor: 'bg-slate-900',
      ...(headerConfig?.topbar || {})
    }
  }));

  // Sync when headerConfig changes
  useEffect(() => {
    if (headerConfig && Object.keys(headerConfig).length > 0) {
      setLogoFormData(prev => ({
        ...prev,
        ...headerConfig,
        socialLinks: {
          ...DEFAULT_SOCIAL_LINKS,
          ...(headerConfig.socialLinks || {})
        },
        topbar: {
          showTopbar: true,
          showBadge: true,
          badgeText: '',
          badgeColor: 'emerald',
          hotlineLabel: 'Hotline 24/7:',
          hotline: '',
          workingHours: '8:00 - 21:00',
          showWorkingHours: true,
          showSocial: true,
          bgColor: 'bg-slate-900',
          ...(headerConfig.topbar || {})
        }
      }));
    }
  }, [headerConfig]);

  const [isSavingHeader, setIsSavingHeader] = useState(false);

  const handleUpdateTopbar = (field, value) => {
    setLogoFormData(prev => ({
      ...prev,
      topbar: {
        ...(prev.topbar || {}),
        [field]: value
      }
    }));
  };

  // Xử lý bật/tắt từng mạng xã hội
  const handleToggleSocial = (key) => {
    setLogoFormData(prev => {
      const currentLinks = prev.socialLinks || DEFAULT_SOCIAL_LINKS;
      return {
        ...prev,
        socialLinks: {
          ...currentLinks,
          [key]: {
            ...(currentLinks[key] || DEFAULT_SOCIAL_LINKS[key] || {}),
            enabled: !currentLinks[key]?.enabled
          }
        }
      };
    });
  };

  // Cập nhật URL mạng xã hội
  const handleUpdateSocialUrl = (key, url) => {
    setLogoFormData(prev => {
      const currentLinks = prev.socialLinks || DEFAULT_SOCIAL_LINKS;
      return {
        ...prev,
        socialLinks: {
          ...currentLinks,
          [key]: {
            ...(currentLinks[key] || DEFAULT_SOCIAL_LINKS[key] || {}),
            url
          }
        }
      };
    });
  };

  // Cập nhật Nhãn mạng xã hội
  const handleUpdateSocialLabel = (key, label) => {
    setLogoFormData(prev => {
      const currentLinks = prev.socialLinks || DEFAULT_SOCIAL_LINKS;
      return {
        ...prev,
        socialLinks: {
          ...currentLinks,
          [key]: {
            ...(currentLinks[key] || DEFAULT_SOCIAL_LINKS[key] || {}),
            label
          }
        }
      };
    });
  };

  // Bật / Tắt tất cả
  const handleToggleAllSocial = (status) => {
    setLogoFormData(prev => {
      const currentLinks = prev.socialLinks || DEFAULT_SOCIAL_LINKS;
      const updated = {};
      Object.keys(currentLinks).forEach(k => {
        updated[k] = { ...currentLinks[k], enabled: status };
      });
      return { ...prev, socialLinks: updated };
    });
    showToast(status ? 'Đã bật tất cả các kênh mạng xã hội!' : 'Đã tắt tất cả các kênh mạng xã hội!', 'info');
  };

  // Khôi phục link mạng xã hội mặc định
  const handleResetSocialLinks = () => {
    setLogoFormData(prev => ({
      ...prev,
      socialLinks: DEFAULT_SOCIAL_LINKS
    }));
    showToast('Đã khôi phục danh sách mạng xã hội về mặc định!', 'info');
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

  const handleSaveHeaderSettings = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingHeader(true);
    try {
      await updateHeaderConfig(logoFormData);
    } finally {
      setTimeout(() => setIsSavingHeader(false), 400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm">
              <i className="fa-solid fa-window-maximize"></i>
            </span>
            <h2 className="text-lg font-black text-white">
              Header & Logo Thương Hiệu
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tùy biến nhận diện thương hiệu (Logo Text hoặc Hình Ảnh), slogan khẩu hiệu, huy hiệu và độ rộng hiển thị của Menu trên toàn website (Boxed, Wide, Full-width).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveHeaderSettings}
            disabled={isSavingHeader}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <i className={`fa-solid ${isSavingHeader ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
            <span>{isSavingHeader ? 'Đang Lưu...' : 'Lưu Header'}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs for Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Định Dạng Logo</div>
            <div className="text-base font-black text-white mt-1">
              {logoFormData.logoType === 'image' ? '🖼️ Hình Ảnh' : '🔤 Text & Icon'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center text-base">
            <i className="fa-solid fa-icons"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Độ Rộng Navbar</div>
            <div className="text-base font-black text-amber-400 mt-1">
              {logoFormData.containerWidth === 'full' ? 'Tràn viền 100%' : logoFormData.containerWidth === 'wide' ? 'Rộng 1536px' : 'Boxed 1280px'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center text-base">
            <i className="fa-solid fa-arrows-left-right"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Chiều Cao Logo</div>
            <div className="text-base font-black text-blue-400 mt-1">
              {logoFormData.logoHeight || 40} px
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center text-base">
            <i className="fa-solid fa-up-down"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Trạng Thái Header</div>
            <div className="text-base font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Hoạt Động</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-base">
            <i className="fa-solid fa-check"></i>
          </div>
        </div>
      </div>

      {/* PHÂN HỆ CẤU HÌNH LOGO & ĐỘ RỘNG MENU */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base">
              <i className="fa-solid fa-sliders"></i>
            </span>
            <div>
              <h3 className="text-base font-black text-white">
                Cấu Hình Logo & Độ Rộng Menu (Header & Logo Customizer)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tùy biến nhận diện thương hiệu (Text hoặc Logo ảnh) và bố cục hiển thị thanh Header (Full-width tràn viền hoặc Boxed)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột 1: Cấu hình Logo (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-icons text-emerald-400"></i>
                <span>1. Định Dạng Logo Thương Hiệu:</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogoFormData(prev => ({ ...prev, logoType: 'text' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    logoFormData.logoType === 'text'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-font"></i>
                  <span>Logo Chữ & Icon</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoFormData(prev => ({
                    ...prev,
                    logoType: 'image',
                    logoImageUrl: prev.logoImageUrl || DEFAULT_HEADER_CONFIG.logoImageUrl || (PRESET_LOGOS?.[0]?.url || '')
                  }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    logoFormData.logoType === 'image'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-image"></i>
                  <span>Logo Hình Ảnh</span>
                </button>
              </div>
            </div>

            {/* Logo Dạng Text */}
            {logoFormData.logoType === 'text' ? (
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tên Thương Hiệu (Tiền tố):</label>
                    <input
                      type="text"
                      value={logoFormData.brandName}
                      onChange={(e) => setLogoFormData({ ...logoFormData, brandName: e.target.value })}
                      placeholder="Ví dụ: BDS, NHADAT..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Chữ Nổi Bật (Màu Xanh):</label>
                    <input
                      type="text"
                      value={logoFormData.brandHighlight}
                      onChange={(e) => setLogoFormData({ ...logoFormData, brandHighlight: e.target.value })}
                      placeholder="Ví dụ: ĐÀ NẴNG, BIỂN XANH..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Slogan / Tagline (Mô tả phụ):</label>
                    <input
                      type="text"
                      value={logoFormData.brandTagline}
                      onChange={(e) => setLogoFormData({ ...logoFormData, brandTagline: e.target.value })}
                      placeholder="Ví dụ: Sàn Đăng Tin BĐS Đa Trang"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Huy Hiệu Tag (Badge):</label>
                    <input
                      type="text"
                      value={logoFormData.badgeText}
                      onChange={(e) => setLogoFormData({ ...logoFormData, badgeText: e.target.value })}
                      placeholder="VIP, PRO, 24/7..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-red-400 font-bold outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Biểu Tượng FontAwesome Logo:</label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow shrink-0">
                      <i className={logoFormData.brandIcon || 'fa-solid fa-building'}></i>
                    </div>
                    <input
                      type="text"
                      value={logoFormData.brandIcon}
                      onChange={(e) => setLogoFormData({ ...logoFormData, brandIcon: e.target.value })}
                      placeholder="fa-solid fa-building"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                  {/* Quick icon buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { icon: 'fa-solid fa-building', label: 'Tòa nhà' },
                      { icon: 'fa-solid fa-house-chimney', label: 'Nhà mái' },
                      { icon: 'fa-solid fa-city', label: 'Đô thị' },
                      { icon: 'fa-solid fa-landmark', label: 'Di tích' },
                      { icon: 'fa-solid fa-crown', label: 'Vương miện' },
                      { icon: 'fa-solid fa-shield-halved', label: 'Khiên bảo vệ' }
                    ].map(ic => (
                      <button
                        type="button"
                        key={ic.icon}
                        onClick={() => setLogoFormData({ ...logoFormData, brandIcon: ic.icon })}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition flex items-center gap-1 ${
                          logoFormData.brandIcon === ic.icon
                            ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <i className={ic.icon}></i>
                        <span>{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Logo Dạng Hình Ảnh */
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Đường Dẫn Ảnh Logo (Image URL):</label>
                  <input
                    type="text"
                    value={logoFormData.logoImageUrl}
                    onChange={(e) => setLogoFormData({ ...logoFormData, logoImageUrl: e.target.value })}
                    placeholder="https://... hoặc data:image/..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono text-[11px] outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Local File Upload button */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <div className="font-bold text-white text-xs">Tải Ảnh Logo Lên Từ Máy Tính:</div>
                    <div className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, SVG, WebP (Tối đa 2MB)</div>
                  </div>
                  <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow transition flex items-center gap-1.5">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Chọn Tệp Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset sample logos */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Hoặc Chọn Mẫu Logo Có Sẵn (Preset Logos):</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(PRESET_LOGOS || []).map(preset => (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setLogoFormData({ ...logoFormData, logoImageUrl: preset.url })}
                        className={`p-2 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                          logoFormData.logoImageUrl === preset.url
                            ? 'bg-emerald-950/60 border-emerald-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="h-8 object-contain w-auto rounded mx-auto" />
                        <div className="text-[10px] text-center font-bold text-slate-300 truncate w-full">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chiều cao logo (Height Slider) */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">Chiều Cao Hiển Thị Logo:</label>
                    <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {logoFormData.logoHeight || 40} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="64"
                    step="2"
                    value={logoFormData.logoHeight || 40}
                    onChange={(e) => setLogoFormData({ ...logoFormData, logoHeight: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Nhỏ (28px)</span>
                    <span>Chuẩn (40px)</span>
                    <span>Lớn (64px)</span>
                  </div>
                </div>

                {/* Toggle tagline with image */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Hiển Thị Tagline Kèm Logo Ảnh:</div>
                    <div className="text-[10px] text-slate-400">Hiển thị dòng chữ khẩu hiệu nhỏ bên cạnh logo hình ảnh</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={logoFormData.showTaglineWithImage}
                    onChange={(e) => setLogoFormData({ ...logoFormData, showTaglineWithImage: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cột 2: Cấu hình Độ Rộng (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-arrows-left-right text-emerald-400"></i>
              <span>2. Cấu Hình Độ Rộng Menu (Width):</span>
            </label>

            <div className="space-y-3">
              {/* Boxed */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setLogoFormData(prev => ({ ...prev, containerWidth: 'boxed' }))}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  logoFormData.containerWidth === 'boxed'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="containerWidthOption"
                  value="boxed"
                  checked={logoFormData.containerWidth === 'boxed'}
                  readOnly
                  className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer pointer-events-none"
                />
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-xs flex items-center justify-between gap-1.5 text-white">
                    <span>Chuẩn (Boxed - 1280px)</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono font-bold">max-w-7xl</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Menu được giới hạn trong khung 1280px và canh giữa màn hình. Cân đối, trang nhã, tập trung tầm nhìn.
                  </p>
                </div>
              </div>

              {/* Wide */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setLogoFormData(prev => ({ ...prev, containerWidth: 'wide' }))}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  logoFormData.containerWidth === 'wide'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="containerWidthOption"
                  value="wide"
                  checked={logoFormData.containerWidth === 'wide'}
                  readOnly
                  className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer pointer-events-none"
                />
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-xs flex items-center justify-between gap-1.5 text-white">
                    <span>Rộng (Wide - 1536px)</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-amber-950/80 text-amber-300 border border-amber-800/50 font-mono font-bold">95% Screen / 1536px</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Mở rộng không gian menu lên 1536px (hoặc 95% màn hình), lý tưởng cho website có nhiều menu và nút bấm.
                  </p>
                </div>
              </div>

              {/* Full Width */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setLogoFormData(prev => ({ ...prev, containerWidth: 'full' }))}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  logoFormData.containerWidth === 'full'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="containerWidthOption"
                  value="full"
                  checked={logoFormData.containerWidth === 'full'}
                  readOnly
                  className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer pointer-events-none"
                />
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-xs flex items-center justify-between gap-1.5 text-white">
                    <span>Toàn Màn Hình (Full-Width - 100%)</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-900 text-emerald-300 border border-emerald-700/50 font-black">FULL-WIDTH 100%</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Menu trải dài 100% tràn đều sang hai mép viền màn hình (Edge-to-Edge). Phong cách hiện đại theo chuẩn các sàn TMĐT quốc tế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CẤU HÌNH THANH TIỆN ÍCH TRÊN CÙNG (TOPBAR & SLOGAN PILL) */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-sm">
                <i className="fa-solid fa-bars-staggered"></i>
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                2. Thanh Tiện Ích Trên Cùng (TopBar & Khẩu Hiệu Sàn BĐS)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tùy biến hiển thị thanh tiện ích đen trên cùng: Huy hiệu khẩu hiệu (Slogan Pill), Hotline 24/7, Giờ làm việc và biểu tượng mạng xã hội.
            </p>
          </div>

          {/* Toggle Bật/Tắt Toàn Bộ Topbar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Hiển thị Topbar:</span>
            <button
              type="button"
              onClick={() => handleUpdateTopbar('showTopbar', !logoFormData.topbar?.showTopbar)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                logoFormData.topbar?.showTopbar !== false ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  logoFormData.topbar?.showTopbar !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Preview của Topbar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <i className="fa-regular fa-eye text-emerald-400"></i>
              <span>Xem Trước Thanh TopBar Thực Tế:</span>
            </span>
            <span className="text-[10px] text-slate-500">Hiển thị ngay trên website</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
            {logoFormData.topbar?.showTopbar === false ? (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                Thanh TopBar hiện đang TẮT (Không hiển thị trên trang chủ)
              </div>
            ) : (
              <div className={`${logoFormData.topbar?.bgColor || 'bg-slate-900'} py-2 px-4 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 transition-colors`}>
                <div className="flex items-center gap-3 min-w-0">
                  {logoFormData.topbar?.showBadge !== false && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold text-[11px] truncate ${
                      topbarColorClasses[logoFormData.topbar?.badgeColor || 'emerald']?.badge || 'bg-emerald-900 text-emerald-100 border-emerald-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        topbarColorClasses[logoFormData.topbar?.badgeColor || 'emerald']?.dot || 'bg-emerald-300'
                      } animate-pulse shrink-0`}></span>
                      <span className="truncate">
                        {logoFormData.topbar?.badgeText?.trim() || `Sàn BĐS ${logoFormData.brandName || 'KENHNHADAT24H'}${logoFormData.brandHighlight || '.com.vn'}`}
                      </span>
                    </span>
                  )}
                  <div className="hidden sm:inline-flex items-center gap-1.5 text-slate-300">
                    {logoFormData.topbar?.showBadge !== false && <span className="text-slate-600">|</span>}
                    <span className="text-slate-400">{logoFormData.topbar?.hotlineLabel || 'Hotline 24/7:'}</span>
                    <span className="text-white font-bold font-mono flex items-center gap-1">
                      <i className="fa-solid fa-phone text-[10px] text-emerald-400"></i>
                      <span>{logoFormData.topbar?.hotline?.trim() || systemConfig?.hotline || '0904 084 888'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  {logoFormData.topbar?.showWorkingHours !== false && (
                    <span className="inline-flex items-center gap-1.5">
                      <i className="fa-regular fa-clock text-emerald-400 text-[10px]"></i>
                      <span className="text-slate-300 font-semibold">{logoFormData.topbar?.workingHours || '8:00 - 21:00'}</span>
                    </span>
                  )}
                  {logoFormData.topbar?.showSocial !== false && (
                    <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      Mạng xã hội (Bật)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Các Form Điều Khiển Chi Tiết */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Cột 1: Tùy biến Huy hiệu / Khẩu hiệu (Pill Badge) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <i className="fa-solid fa-certificate text-emerald-400"></i>
                <span>Huy Hiệu Khẩu Hiệu (Slogan Pill)</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] text-slate-400">Bật huy hiệu:</span>
                <input
                  type="checkbox"
                  checked={logoFormData.topbar?.showBadge !== false}
                  onChange={(e) => handleUpdateTopbar('showBadge', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Nội dung Huy hiệu Topbar:
              </label>
              <input
                type="text"
                value={logoFormData.topbar?.badgeText || ''}
                onChange={(e) => handleUpdateTopbar('badgeText', e.target.value)}
                placeholder={`Mặc định: Sàn BĐS ${logoFormData.brandName || 'KENHNHADAT24H'}${logoFormData.brandHighlight || '.com.vn'}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-400">
                Để trống ô này để hệ thống tự động hiển thị tên sàn BĐS. Hoặc tự do nhập khẩu hiệu riêng (VD: <span className="text-emerald-400 font-bold">Sàn BĐS KENHNHADAT24H.com.vn</span>).
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-medium text-slate-300">
                Màu sắc Huy hiệu:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'emerald', label: 'Xanh Ngọc', bg: 'bg-emerald-900 border-emerald-600 text-emerald-200' },
                  { id: 'amber', label: 'Vàng Kim', bg: 'bg-amber-900 border-amber-600 text-amber-200' },
                  { id: 'red', label: 'Đỏ Ruby', bg: 'bg-red-900 border-red-600 text-red-200' },
                  { id: 'blue', label: 'Xanh Biển', bg: 'bg-blue-900 border-blue-600 text-blue-200' },
                  { id: 'purple', label: 'Tím', bg: 'bg-purple-900 border-purple-600 text-purple-200' },
                  { id: 'slate', label: 'Xám Đậm', bg: 'bg-slate-800 border-slate-600 text-slate-200' }
                ].map(c => {
                  const isCur = (logoFormData.topbar?.badgeColor || 'emerald') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleUpdateTopbar('badgeColor', c.id)}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition ${c.bg} ${
                        isCur ? 'ring-2 ring-white scale-102 shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>{c.label}</span>
                      {isCur && <i className="fa-solid fa-check text-[9px]"></i>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột 2: Hotline & Giờ làm việc & Màu nền */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <i className="fa-solid fa-phone text-emerald-400"></i>
              <span>Hotline & Giờ Làm Việc Trên Topbar</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Nhãn Hotline:
                </label>
                <input
                  type="text"
                  value={logoFormData.topbar?.hotlineLabel || 'Hotline 24/7:'}
                  onChange={(e) => handleUpdateTopbar('hotlineLabel', e.target.value)}
                  placeholder="Hotline 24/7:"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Số điện thoại Hotline:
                </label>
                <input
                  type="text"
                  value={logoFormData.topbar?.hotline || ''}
                  onChange={(e) => handleUpdateTopbar('hotline', e.target.value)}
                  placeholder={systemConfig?.hotline || '0904 084 888'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Giờ làm việc:
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logoFormData.topbar?.showWorkingHours !== false}
                      onChange={(e) => handleUpdateTopbar('showWorkingHours', e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                    />
                    <span className="text-[10px] text-slate-400">Hiện</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={logoFormData.topbar?.workingHours || '8:00 - 21:00'}
                  onChange={(e) => handleUpdateTopbar('workingHours', e.target.value)}
                  placeholder="8:00 - 21:00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Màu nền Topbar:
                </label>
                <select
                  value={logoFormData.topbar?.bgColor || 'bg-slate-900'}
                  onChange={(e) => handleUpdateTopbar('bgColor', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="bg-slate-900">Đen Slate Chuẩn (bg-slate-900)</option>
                  <option value="bg-slate-950">Đen Sâu Tuyệt Đối (bg-slate-950)</option>
                  <option value="bg-emerald-950">Xanh Ngọc Đậm Sang Trọng (bg-emerald-950)</option>
                  <option value="bg-blue-950">Xanh Navy Đại Dương (bg-blue-950)</option>
                  <option value="bg-slate-800">Xám Đậm Hiện Đại (bg-slate-800)</option>
                </select>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-slate-300">Biểu tượng Mạng xã hội trên Topbar:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoFormData.topbar?.showSocial !== false}
                  onChange={(e) => handleUpdateTopbar('showSocial', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Hiển thị các icon mạng xã hội</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cấu hình Kênh Mạng Xã Hội Website (Social Media Links - TopBar & Footer) */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-sm">
                <i className="fa-solid fa-share-nodes"></i>
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                3. Kênh Mạng Xã Hội Website (TopBar, Footer & Mobile Menu)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bật/tắt và gắn link các kênh mạng xã hội (Facebook, Zalo, YouTube, TikTok, Telegram, Instagram). Tự động hiển thị trên thanh tiện ích TopBar, chân trang Footer và ngăn kéo Menu Mobile.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleAllSocial(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 font-bold text-[11px] border border-emerald-800/60 transition cursor-pointer"
            >
              <i className="fa-solid fa-check mr-1"></i> Bật Tất Cả
            </button>
            <button
              type="button"
              onClick={() => handleToggleAllSocial(false)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-[11px] border border-slate-700/60 transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark mr-1"></i> Tắt Tất Cả
            </button>
          </div>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(logoFormData.socialLinks || DEFAULT_SOCIAL_LINKS).map(([key, item]) => {
            const isEnabled = item?.enabled ?? false;
            return (
              <div
                key={key}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isEnabled
                    ? 'bg-slate-900/90 border-slate-700 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                }`}
              >
                {/* Channel Header & Switch */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                      key === 'facebook' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                      key === 'zalo' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-sans' :
                      key === 'youtube' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
                      key === 'tiktok' ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30' :
                      key === 'telegram' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30'
                    }`}>
                      <SocialIcon item={{ key, ...item }} className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white capitalize">{item?.label || key}</div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full inline-block ${
                        isEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isEnabled ? 'Đang Hiển Thị' : 'Đã Tắt'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSocial(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                      isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={isEnabled ? 'Bấm để tắt kênh này' : 'Bấm để bật kênh này'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* URL Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Đường dẫn (URL):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={item?.url || ''}
                      onChange={(e) => handleUpdateSocialUrl(key, e.target.value)}
                      placeholder={
                        key === 'facebook' ? 'https://facebook.com/ten-fanpage' :
                        key === 'zalo' ? 'https://zalo.me/0904084888' :
                        key === 'youtube' ? 'https://youtube.com/@kenh-bds' :
                        key === 'tiktok' ? 'https://tiktok.com/@kenh-tiktok' :
                        key === 'telegram' ? 'https://t.me/kenh-telegram' :
                        'https://instagram.com/kenh-instagram'
                      }
                      className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500 font-mono"
                    />
                    {item?.url && (
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition shrink-0"
                        title="Mở kiểm tra đường dẫn"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
