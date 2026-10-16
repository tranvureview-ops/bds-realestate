'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_SINGLE_CONFIG } from '../data/mockData';

export default function AdminSingleConfigManager() {
  const { singleConfig, updateSingleConfig, resetSingleConfig, showToast, systemConfig } = useRealEstate();

  // Local state for editing form
  const [formData, setFormData] = useState(singleConfig || DEFAULT_SINGLE_CONFIG);

  // Sync when context changes
  useEffect(() => {
    if (singleConfig) {
      setFormData(singleConfig);
    }
  }, [singleConfig]);

  const handleDisclaimerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      disclaimer: {
        ...prev.disclaimer,
        [field]: value
      }
    }));
  };

  const handleFeatureToggle = (featureKey) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  const handleAddAuditItem = () => {
    const itemText = prompt('Nhập nội dung tiêu chí kiểm duyệt:');
    if (itemText && itemText.trim()) {
      setFormData(prev => ({
        ...prev,
        disclaimer: {
          ...prev.disclaimer,
          auditItems: [...(prev.disclaimer.auditItems || []), itemText.trim()]
        }
      }));
    }
  };

  const handleRemoveAuditItem = (index) => {
    setFormData(prev => ({
      ...prev,
      disclaimer: {
        ...prev.disclaimer,
        auditItems: prev.disclaimer.auditItems.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateSingleConfig(formData);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình trang Single về mặc định ban đầu?')) {
      resetSingleConfig();
      setFormData(DEFAULT_SINGLE_CONFIG);
    }
  };

  // Preview computed text
  const previewSampleTitle = 'Căn hộ chung cư Masterise Park Place 3PN view hồ';
  const previewSampleId = 'BDS-003';
  const renderedPreviewText = (formData.disclaimer?.contentTemplate || '')
    .replace(/\{title\}/g, `"${previewSampleTitle}"`)
    .replace(/\{id\}/g, previewSampleId)
    .replace(/\{platformName\}/g, formData.disclaimer?.platformName || systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG')
    .replace(/\{hotline\}/g, formData.disclaimer?.hotline || systemConfig?.hotline || '0904 084 888');

  // Background and color classes mapping
  const bgStylesMap = {
    slate: 'bg-slate-100/90 border-slate-200/90 text-slate-800',
    amber: 'bg-amber-50/90 border-amber-200/90 text-amber-900',
    blue: 'bg-blue-50/90 border-blue-200/90 text-blue-900',
    white: 'bg-white border-2 border-slate-200 text-slate-900'
  };

  const badgeColorMap = {
    amber: 'bg-amber-500/10 text-amber-600 border border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-600 border border-rose-500/30',
    blue: 'bg-blue-500/10 text-blue-600 border border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30',
    slate: 'bg-slate-800 text-white'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center text-xl font-black border border-red-500/20 shadow-inner">
            <i className="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Cấu Hình Trang Chi Tiết BĐS (Single Page)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Live Setting
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Thiết lập thông báo miễn trừ trách nhiệm, hotline khiếu nại và quản lý hiển thị các khối chức năng trên trang Single
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 transition"
          >
            Khôi Phục Mặc Định
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Lưu Cấu Hình Single</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Settings Form) & Right Column (Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Settings (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* PHẦN 1: THÔNG BÁO VỀ NỘI DUNG & MIỄN TRỪ TRÁCH NHIỆM */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">
                  <i className="fa-solid fa-shield-halved"></i>
                </span>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    1. Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Bắt buộc hiển thị theo quy chế sàn thương mại điện tử
                  </div>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.disclaimer?.enabled !== false}
                  onChange={(e) => handleDisclaimerChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {formData.disclaimer?.enabled !== false ? (
              <div className="space-y-4 text-xs">
                {/* Tiêu đề khối & Tên Nền Tảng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Tiêu đề khối thông báo: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.disclaimer?.title || ''}
                      onChange={(e) => handleDisclaimerChange('title', e.target.value)}
                      placeholder="Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-300 font-bold">
                        Tên nền tảng hiển thị (Platform Name):
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDisclaimerChange('platformName', systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG')}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
                        title="Đồng bộ từ tên thương hiệu sàn"
                      >
                        Lấy từ Cài đặt sàn ({systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'})
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.disclaimer?.platformName || ''}
                      onChange={(e) => handleDisclaimerChange('platformName', e.target.value)}
                      placeholder={`VD: ${systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'}`}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Hotline & Nhãn nút báo cáo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-300 font-bold">
                        Hotline tiếp nhận vi phạm & khiếu nại:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDisclaimerChange('hotline', systemConfig?.hotline || '0904 084 888')}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
                        title="Đồng bộ từ Hotline hệ thống"
                      >
                        Lấy Hotline sàn ({systemConfig?.hotline || '0904 084 888'})
                      </button>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-phone absolute left-3.5 top-3 text-slate-500 text-xs"></i>
                      <input
                        type="text"
                        value={formData.disclaimer?.hotline || ''}
                        onChange={(e) => handleDisclaimerChange('hotline', e.target.value)}
                        placeholder={`VD: ${systemConfig?.hotline || '0904 084 888'}`}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Nhãn nút báo cáo tin:
                    </label>
                    <input
                      type="text"
                      value={formData.disclaimer?.reportButtonText || 'Báo cáo tin này'}
                      onChange={(e) => handleDisclaimerChange('reportButtonText', e.target.value)}
                      placeholder="Báo cáo tin này"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Style Options: Icon, Badge Color & Background */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Icon đại diện:</label>
                    <select
                      value={formData.disclaimer?.icon || 'fa-solid fa-shield-halved'}
                      onChange={(e) => handleDisclaimerChange('icon', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold"
                    >
                      <option value="fa-solid fa-shield-halved">Khiên bảo vệ</option>
                      <option value="fa-solid fa-scale-balanced">Cán cân pháp lý</option>
                      <option value="fa-solid fa-circle-info">Thông tin quan trọng</option>
                      <option value="fa-solid fa-triangle-exclamation">Cảnh báo vi phạm</option>
                      <option value="fa-solid fa-certificate">Chứng chỉ sàn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Màu sắc icon:</label>
                    <select
                      value={formData.disclaimer?.badgeColor || 'amber'}
                      onChange={(e) => handleDisclaimerChange('badgeColor', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold"
                    >
                      <option value="amber">Vàng Cam (Amber)</option>
                      <option value="rose">Đỏ Hồng (Rose)</option>
                      <option value="blue">Xanh Dương (Blue)</option>
                      <option value="emerald">Xanh Ngọc (Emerald)</option>
                      <option value="slate">Xám Slate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Kiểu dáng nền:</label>
                    <select
                      value={formData.disclaimer?.bgStyle || 'slate'}
                      onChange={(e) => handleDisclaimerChange('bgStyle', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold"
                    >
                      <option value="slate">Xám Nhẹ (Slate 100)</option>
                      <option value="amber">Vàng Nhạt (Amber 50)</option>
                      <option value="blue">Xanh Nhẹ (Blue 50)</option>
                      <option value="white">Trắng Nổi Viền (White Card)</option>
                    </select>
                  </div>
                </div>

                {/* Nội dung Mẫu Thông Báo Template */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-bold">
                      Mẫu nội dung thông báo & miễn trừ:
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Hỗ trợ biến: {'{title}'}, {'{id}'}, {'{platformName}'}, {'{hotline}'}
                    </span>
                  </div>
                  <textarea
                    rows="6"
                    value={formData.disclaimer?.contentTemplate || ''}
                    onChange={(e) => handleDisclaimerChange('contentTemplate', e.target.value)}
                    placeholder="Quý vị đang xem nội dung tin rao {title} - Mã tin {id}..."
                    className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs font-normal leading-relaxed focus:outline-none focus:ring-1 focus:ring-red-500"
                  ></textarea>
                </div>

                {/* Audit Checklist Items */}
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.disclaimer?.showAuditChecklist !== false}
                        onChange={(e) => handleDisclaimerChange('showAuditChecklist', e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-red-500"
                      />
                      <span>Hiển thị tiêu chí cam kết chân khối thông báo</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddAuditItem}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                      <span>Thêm tiêu chí</span>
                    </button>
                  </div>

                  {formData.disclaimer?.showAuditChecklist !== false && (
                    <div className="space-y-2 pt-1">
                      {(formData.disclaimer?.auditItems || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 text-slate-300">
                            <i className="fa-regular fa-circle-check text-emerald-400 text-xs"></i>
                            <span className="font-semibold">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAuditItem(idx)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Xóa tiêu chí này"
                          >
                            <i className="fa-solid fa-xmark text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-rose-300 text-xs text-center">
                Khối thông báo miễn trừ trách nhiệm hiện đang bị <strong>Tắt</strong>. Người xem tin sẽ không nhìn thấy khối này trên trang chi tiết sản phẩm.
              </div>
            )}
          </div>

          {/* PHẦN 2: BẬT/TẮT CÁC TÍNH NĂNG & KHỐI CHỨC NĂNG TRÊN TRANG SINGLE */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm font-bold border border-blue-500/20">
                  <i className="fa-solid fa-toggle-on"></i>
                </span>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    2. Bật / Tắt Các Khối Chức Năng Trên Trang Single
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Linh hoạt cấu hình bật/tắt công cụ theo định hướng kinh doanh của sàn
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'showLoanCalculator', label: 'Bảng Tính Lãi Vay Ngân Hàng', desc: 'Cho phép khách tự tính số tiền trả góp hàng tháng', icon: 'fa-calculator' },
                { key: 'showAppointmentBooking', label: 'Form Đặt Lịch Xem Nhà Trực Tiếp', desc: 'Khách để lại SĐT và giờ hẹn để môi giới liên hệ', icon: 'fa-calendar-check' },
                { key: 'showPrintButton', label: 'Nút In Bản Tin / Xuất Brochure Giấy', desc: 'In tờ rơi khổ A4 chứa mã QR và hotline kiểm định', icon: 'fa-print' },
                { key: 'showShareButton', label: 'Nút Chia Sẻ Mạng Xã Hội & Copy Link', desc: 'Chia sẻ nhanh qua Zalo, Facebook, Tin nhắn SMS', icon: 'fa-share-nodes' },
                { key: 'showRelatedKeywords', label: 'Khối Từ Khóa Tìm Kiếm & Hashtag SEO', desc: 'Gợi ý các cụm từ khóa khu vực để tăng thứ hạng SEO', icon: 'fa-tags' },
                { key: 'showSimilarProperties', label: 'Khối Bất Động Sản Tương Tự', desc: 'Hiển thị 3 bất động sản cùng phân khúc hoặc quận', icon: 'fa-layer-group' },
                { key: 'showInteractiveMap', label: 'Bản Đồ Vệ Tinh & Tiện Ích Xung Quanh', desc: 'Bản đồ vị trí, bệnh viện, trường học, siêu thị lân cận', icon: 'fa-map-location-dot' },
                { key: 'showAuthorCard', label: 'Thẻ Thông Tin Môi Giới / Chủ Nhà', desc: 'Avatar, hotline, số Zalo và đánh giá uy tín người bán', icon: 'fa-address-card' },
                { key: 'showAdministrativeMergerAlert', label: 'Cảnh Báo Đối Chiếu ĐVHC Sáp Nhập Mới', desc: 'Hiển thị đối chiếu Địa chỉ mới vs Địa chỉ cũ (2024-2025)', icon: 'fa-map-pin' }
              ].map((feat) => {
                const isEnabled = formData.features?.[feat.key] !== false;
                return (
                  <label
                    key={feat.key}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                      isEnabled
                        ? 'bg-slate-900 border-slate-700/80 text-white'
                        : 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleFeatureToggle(feat.key)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-red-600 focus:ring-red-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center gap-1.5 text-xs truncate">
                        <i className={`fa-solid ${feat.icon} text-slate-400 text-xs`}></i>
                        <span>{feat.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {feat.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Xem Trước Trực Quan (Live Preview)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Hiển thị tức thì</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bản vẽ dưới đây mô phỏng chính xác giao diện khối <strong>Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm</strong> như khách hàng sẽ nhìn thấy trên trang Single:
            </p>

            {/* PREVIEW CONTAINER */}
            <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-300">
              {formData.disclaimer?.enabled !== false ? (
                <div className={`rounded-2xl p-5 border space-y-3 transition-all ${bgStylesMap[formData.disclaimer?.bgStyle || 'slate']}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${badgeColorMap[formData.disclaimer?.badgeColor || 'amber']}`}>
                        <i className={formData.disclaimer?.icon || 'fa-solid fa-shield-halved'}></i>
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {formData.disclaimer?.title || 'Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm'}
                      </h4>
                    </div>

                    {formData.disclaimer?.showReportButton !== false && (
                      <span className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1">
                        <i className="fa-solid fa-flag text-[10px]"></i>
                        <span>{formData.disclaimer?.reportButtonText || 'Báo cáo tin này'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed text-justify">
                    {renderedPreviewText}
                  </p>

                  {formData.disclaimer?.showAuditChecklist !== false && (formData.disclaimer?.auditItems || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-200/80 text-[11px]">
                      {(formData.disclaimer?.auditItems || []).map((item, idx) => (
                        <span key={idx} className="text-slate-500 font-medium flex items-center gap-1">
                          <i className="fa-regular fa-circle-check text-emerald-600"></i>
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  [Khối thông báo đã bị tắt]
                </div>
              )}
            </div>

            {/* Mini Summary of Enabled Features */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-[11px] space-y-2">
              <div className="font-bold text-slate-300">Trạng thái các khối tính năng khác:</div>
              <div className="grid grid-cols-2 gap-1.5 text-slate-400">
                <div>• Lãi vay: <strong className={formData.features?.showLoanCalculator !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showLoanCalculator !== false ? 'Bật' : 'Tắt'}</strong></div>
                <div>• Đặt lịch hẹn: <strong className={formData.features?.showAppointmentBooking !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showAppointmentBooking !== false ? 'Bật' : 'Tắt'}</strong></div>
                <div>• In brochure: <strong className={formData.features?.showPrintButton !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showPrintButton !== false ? 'Bật' : 'Tắt'}</strong></div>
                <div>• Chia sẻ: <strong className={formData.features?.showShareButton !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showShareButton !== false ? 'Bật' : 'Tắt'}</strong></div>
                <div>• Từ khóa SEO: <strong className={formData.features?.showRelatedKeywords !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showRelatedKeywords !== false ? 'Bật' : 'Tắt'}</strong></div>
                <div>• BĐS tương tự: <strong className={formData.features?.showSimilarProperties !== false ? 'text-emerald-400' : 'text-slate-600'}>{formData.features?.showSimilarProperties !== false ? 'Bật' : 'Tắt'}</strong></div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i>
              <span>Lưu Cấu Hình Single Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
