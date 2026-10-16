'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_HEADER_CONFIG } from '../data/mockData';

export default function AdminHeaderConfigManager({ onSwitchToMenu = null }) {
  const {
    headerConfig,
    updateHeaderConfig,
    resetHeaderConfig,
    PRESET_LOGOS,
    navMenuItems,
    showToast
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
    logoAlt: headerConfig?.logoAlt || 'Đất Biển Đà Nẵng Logo',
    showTaglineWithImage: headerConfig?.showTaglineWithImage || false,
    containerWidth: headerConfig?.containerWidth || 'boxed',
  }));

  // Sync when headerConfig changes
  useEffect(() => {
    if (headerConfig && Object.keys(headerConfig).length > 0) {
      setLogoFormData(prev => ({
        ...prev,
        ...headerConfig
      }));
    }
  }, [headerConfig]);

  const [isSavingHeader, setIsSavingHeader] = useState(false);

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

  const handleSaveHeaderSettings = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsSavingHeader(true);
    try {
      await updateHeaderConfig(logoFormData);
      showToast('Đã lưu cấu hình Header & Logo thành công!', 'success');
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
            Tùy biến nhận diện thương hiệu (Logo Text hoặc Hình Ảnh), slogan khẩu hiệu, huy hiệu và độ rộng hiển thị của thanh Menu trên toàn website (Boxed, Wide, Full-width).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetHeaderSettings}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition flex items-center gap-1.5"
            title="Khôi phục logo và độ rộng về mặc định"
          >
            <i className="fa-solid fa-rotate-left"></i>
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={handleSaveHeaderSettings}
            disabled={isSavingHeader}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <i className={`fa-solid ${isSavingHeader ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
            <span>{isSavingHeader ? 'Đang Lưu...' : 'Lưu Header'}</span>
          </button>

          {onSwitchToMenu && (
            <button
              type="button"
              onClick={onSwitchToMenu}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
              title="Chuyển sang phân hệ cấu hình các nút menu"
            >
              <i className="fa-solid fa-bars-staggered"></i>
              <span>Cấu Hình Nút Menu ➔</span>
            </button>
          )}
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

      {/* PHÂN HỆ CẤU HÌNH LOGO & ĐỘ RỘNG THANH MENU */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-base">
              <i className="fa-solid fa-sliders"></i>
            </span>
            <div>
              <h3 className="text-base font-black text-white">
                Cấu Hình Logo & Độ Rộng Thanh Menu (Header & Logo Customizer)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tùy biến nhận diện thương hiệu (Text hoặc Logo ảnh) và bố cục hiển thị thanh Header (Full-width tràn viền hoặc Boxed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetHeaderSettings}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition"
              title="Khôi phục logo và độ rộng về mặc định"
            >
              <i className="fa-solid fa-rotate-left mr-1"></i> Mặc Định
            </button>
            <button
              type="button"
              onClick={handleSaveHeaderSettings}
              disabled={isSavingHeader}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className={`fa-solid ${isSavingHeader ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
              <span>{isSavingHeader ? 'Đang Lưu...' : 'Lưu Cấu Hình'}</span>
            </button>
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
                  onClick={() => setLogoFormData({ ...logoFormData, logoType: 'text' })}
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
                  onClick={() => setLogoFormData({ ...logoFormData, logoType: 'image' })}
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
              <span>2. Cấu Hình Độ Rộng Thanh Menu (Width):</span>
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
                    <span>Tiêu Chuẩn (Boxed - 1280px)</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono font-bold">max-w-7xl</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Thanh menu được giới hạn trong khung 1280px và canh giữa màn hình. Cân đối, trang nhã, tập trung tầm nhìn.
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
                    Mở rộng không gian thanh menu lên 1536px (hoặc 95% màn hình), lý tưởng cho website có nhiều menu và nút bấm.
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
                    Thanh menu trải dài 100% tràn đều sang hai mép viền màn hình (Edge-to-Edge). Phong cách hiện đại theo chuẩn các sàn TMĐT quốc tế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Preview Header Bar */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Xem Trước Trực Quan Thời Gian Thực (Live Navbar Header Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono border border-slate-800">
              Độ rộng: {logoFormData.containerWidth === 'full' ? '100% Full-Width' : logoFormData.containerWidth === 'wide' ? '1536px Wide' : '1280px Boxed'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-mono border border-slate-800">
              Logo: {logoFormData.logoType === 'image' ? 'Hình ảnh' : 'Text & Icon'}
            </span>
          </div>
        </div>

        {/* Mock browser window */}
        <div className="bg-slate-900 p-2 sm:p-4 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className={`mx-auto bg-white text-slate-800 rounded-xl p-3 shadow-md border border-slate-200 transition-all duration-300 flex items-center justify-between gap-4 overflow-x-auto ${
            logoFormData.containerWidth === 'full' 
              ? 'w-full' 
              : logoFormData.containerWidth === 'wide' 
              ? 'max-w-[1536px] w-full' 
              : 'max-w-7xl w-full'
          }`}>
            {/* Logo Brand in preview */}
            <div className="flex items-center gap-2 shrink-0">
              {logoFormData.logoType === 'image' && logoFormData.logoImageUrl ? (
                <div className="flex items-center gap-2">
                  <img
                    src={logoFormData.logoImageUrl}
                    alt={logoFormData.logoAlt || 'Logo'}
                    style={{ height: `${Math.min(logoFormData.logoHeight || 36, 44)}px` }}
                    className="w-auto object-contain max-w-[200px]"
                  />
                  {logoFormData.showTaglineWithImage && logoFormData.brandTagline && (
                    <span className="hidden sm:inline text-[9px] text-slate-500 font-medium uppercase border-l pl-2 border-slate-200">
                      {logoFormData.brandTagline}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-md">
                    <i className={logoFormData.brandIcon || 'fa-solid fa-city'}></i>
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-black tracking-tight text-slate-900 flex items-center gap-1">
                      <span>{logoFormData.brandName || 'ĐẤT BIỂN'}</span>
                      <span className="text-emerald-600">{logoFormData.brandHighlight || 'ĐÀ NẴNG'}</span>
                      {logoFormData.badgeText && (
                        <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${logoFormData.badgeColor || 'bg-red-100 text-red-600'}`}>
                          {logoFormData.badgeText}
                        </span>
                      )}
                    </div>
                    {logoFormData.brandTagline && (
                      <div className="text-[8px] text-slate-500 font-bold uppercase">{logoFormData.brandTagline}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview of visible menu items */}
            <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
              {[...navMenuItems]
                .filter(m => m.isVisible)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((item, idx) => (
                  <div
                    key={item.id}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 border transition text-[11px] ${
                      idx === 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                        : item.id === 'menu-admin'
                        ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.icon && <i className={`${item.icon} text-[9px]`}></i>}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={`text-[7px] px-1 py-0.2 rounded-full font-black uppercase ${item.badgeColor || 'bg-red-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && item.children.length > 0 && (
                      <span className="text-[8px] text-slate-400">▾</span>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-sm">
                + Đăng Tin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Save Bar for Header Configuration */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 bg-slate-950/60 p-4 rounded-2xl">
        <button
          type="button"
          onClick={handleResetHeaderSettings}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-rotate-left"></i>
          <span>Khôi Phục Mặc Định</span>
        </button>

        <button
          type="button"
          onClick={handleSaveHeaderSettings}
          disabled={isSavingHeader}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
        >
          <i className={`fa-solid ${isSavingHeader ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
          <span>{isSavingHeader ? 'Đang Lưu...' : 'Lưu Header'}</span>
        </button>
      </div>
    </div>
  );
}
