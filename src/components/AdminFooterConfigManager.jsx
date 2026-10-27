'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_FOOTER_CONFIG } from '../data/mockData';

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

  // Helper Thêm / Sửa / Xóa liên kết Cột 2 (Khám Phá Nhà Đất)
  const handleAddCol2Link = () => {
    setFormData(prev => ({
      ...prev,
      col2Links: [
        ...(prev.col2Links || []),
        { id: `c2-${Date.now()}`, label: 'Liên kết mới', url: '/nha-dat-ban' }
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

  // Helper Thêm / Sửa / Xóa liên kết Cột 3 (Trang Thành Viên)
  const handleAddCol3Link = () => {
    setFormData(prev => ({
      ...prev,
      col3Links: [
        ...(prev.col3Links || []),
        { id: `c3-${Date.now()}`, icon: 'fa-solid fa-link', color: 'text-amber-400', label: 'Trang mới', url: '/ho-so-ca-nhan' }
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

  // Helper Thêm / Sửa / Xóa Chứng Nhận Cột 4 (Badges)
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

  // Helper Thêm / Sửa / Xóa Chính Sách (Policy Links)
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

  // Fallback values for preview
  const previewHotline = formData.hotline || systemConfig?.hotline || '0898 246 607';
  const previewZalo = formData.zalo || systemConfig?.zalo;
  const previewEmail = formData.email || systemConfig?.email || 'cskh@datbiendanang.vn';
  const previewAddress = formData.address || systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
  const previewBrandDesc = formData.brandDescription || DEFAULT_FOOTER_CONFIG.brandDescription;

  const socialConfig = headerConfig?.socialLinks || systemConfig?.socialLinks || {};
  const activeSocialList = Object.entries(socialConfig)
    .filter(([_, item]) => item && item.enabled && item.url)
    .map(([key, item]) => ({ key, ...item }));

  return (
    <div className="space-y-6">
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
            Quản trị 4 cột nội dung, thông tin liên hệ sàn, điều hướng thành viên, chứng nhận bảo mật và bản quyền chân trang.
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
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-slate-400">Danh Sách Liên Kết:</label>
              {(formData.col2Links || []).map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800"
                >
                  <span className="text-[10px] font-mono text-slate-500 w-5 text-center shrink-0">#{idx + 1}</span>
                  <input
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => handleUpdateCol2Link(idx, 'label', e.target.value)}
                    placeholder="Tên liên kết"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => handleUpdateCol2Link(idx, 'url', e.target.value)}
                    placeholder="/duong-dan"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCol2Link(idx)}
                    className="w-7 h-7 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                    title="Xóa liên kết này"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                  </button>
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
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-slate-400">Danh Sách Liên Kết:</label>
              {(formData.col3Links || []).map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 w-4 text-center shrink-0">#{idx + 1}</span>
                    <input
                      type="text"
                      value={link.icon || ''}
                      onChange={(e) => handleUpdateCol3Link(idx, 'icon', e.target.value)}
                      placeholder="fa-solid fa-user"
                      className="w-28 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-[11px]"
                      title="Font Awesome Icon class"
                    />
                  </div>
                  <input
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => handleUpdateCol3Link(idx, 'label', e.target.value)}
                    placeholder="Tên mục"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => handleUpdateCol3Link(idx, 'url', e.target.value)}
                    placeholder="/ho-so-ca-nhan"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCol3Link(idx)}
                    className="w-7 h-7 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 flex items-center justify-center text-xs transition cursor-pointer self-end sm:self-auto shrink-0"
                    title="Xóa liên kết này"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                  </button>
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
              <label className="block text-xs font-bold text-slate-400">Danh Sách Huy Hiệu Chứng Nhận:</label>
              {(formData.badges || []).map((badge, idx) => (
                <div
                  key={badge.id || idx}
                  className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-blue-400">Huy hiệu #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBadge(idx)}
                      className="px-2 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can text-[9px]"></i>
                      <span>Xóa</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Icon FontAwesome:</label>
                      <input
                        type="text"
                        value={badge.icon || ''}
                        onChange={(e) => handleUpdateBadge(idx, 'icon', e.target.value)}
                        placeholder="fa-solid fa-shield-check"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tiêu Đề Chứng Nhận:</label>
                      <input
                        type="text"
                        value={badge.title || ''}
                        onChange={(e) => handleUpdateBadge(idx, 'title', e.target.value)}
                        placeholder="Đã Đăng Ký Bộ Công Thương"
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mô Tả Chi Tiết / Căn Cứ Pháp Lý:</label>
                    <textarea
                      rows={2}
                      value={badge.desc || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'desc', e.target.value)}
                      placeholder="Sàn TMĐT giao dịch bất động sản hợp pháp theo Nghị định..."
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Đường Dẫn Xác Minh (Tùy chọn):</label>
                    <input
                      type="text"
                      value={badge.url || ''}
                      onChange={(e) => handleUpdateBadge(idx, 'url', e.target.value)}
                      placeholder="https://online.gov.vn/... (Để trống nếu không liên kết ngoài)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs"
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
                placeholder={`© 2026 ${systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}. Bản quyền thuộc về ${systemConfig?.platformName || 'Công ty Cổ phần BĐS'}.`}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Để trống sẽ tự động hiển thị theo Tên Thương Hiệu & Tên Pháp Nhân Sàn</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold text-slate-400">Các Liên Kết Pháp Lý & Điều Khoản:</label>
              {(formData.policyLinks || []).map((policy, idx) => (
                <div
                  key={policy.id || idx}
                  className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800"
                >
                  <input
                    type="text"
                    value={policy.label || ''}
                    onChange={(e) => handleUpdatePolicyLink(idx, 'label', e.target.value)}
                    placeholder="Quy chế hoạt động"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                  <input
                    type="text"
                    value={policy.url || ''}
                    onChange={(e) => handleUpdatePolicyLink(idx, 'url', e.target.value)}
                    placeholder="/quy-che-hoat-dong"
                    className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePolicyLink(idx)}
                    className="w-7 h-7 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                    title="Xóa chính sách này"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                  </button>
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
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 text-xs text-slate-300">
                {/* Brand & Contacts */}
                <div className="space-y-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-xs">
                        {systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}
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
                    <div className="font-black text-white uppercase text-[10px] tracking-wider text-emerald-400">
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
                        <li key={i} className="truncate">• {l.label}</li>
                      ))}
                      {formData.showAdminCmsLink !== false && (
                        <li className="text-red-400 font-semibold">• Bàn Làm Việc Admin</li>
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
                        <div className="font-bold text-white flex items-center gap-1">
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
                    : `© 2026 ${systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}.`}
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
    </div>
  );
}
