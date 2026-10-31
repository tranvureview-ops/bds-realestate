'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_EMAIL_CONFIG, DEFAULT_EMAIL_TEMPLATES } from '../data/mockData';
import { renderEmailTemplateString, renderCustomEmailPreview, THEME_STYLES } from '../utils/emailService';

export default function AdminEmailConfigManager({ onNavigateToEmails = null }) {
  const {
    emailConfig,
    updateEmailConfig,
    resetEmailConfig,
    updateEmailTemplate,
    resetEmailTemplate,
    resetAllEmailTemplates,
    sendTestEmail,
    verifySmtpConnection,
    emailLogs,
    showToast,
    systemConfig
  } = useRealEstate();

  // Primary Tab: 'server' (Máy Chủ & SMTP) vs 'templates' (Tùy Chỉnh Mẫu Nội Dung)
  const [activeMainTab, setActiveMainTab] = useState('server');

  // Local state for editing form
  const [formData, setFormData] = useState(emailConfig || DEFAULT_EMAIL_CONFIG);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState(emailConfig?.adminAlertEmail || 'tranvu.review@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  // SMTP Verify State
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [smtpVerifyResult, setSmtpVerifyResult] = useState(null);

  // Template Customization State
  const [selectedTemplateId, setSelectedTemplateId] = useState('report_confirmation');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [lastFocusedField, setLastFocusedField] = useState('introText');

  // Sync when context changes
  useEffect(() => {
    if (emailConfig) {
      setFormData(emailConfig);
      if (!testEmailRecipient || testEmailRecipient === 'admin@landmark.vn' || testEmailRecipient === 'admin@datbiendanang.vn' || testEmailRecipient === 'tranvu.review@gmail.com') {
        setTestEmailRecipient(emailConfig.adminAlertEmail || 'tranvu.review@gmail.com');
      }
    }
  }, [emailConfig]);

  // Handle Form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSmtpChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [field]: value
      }
    }));
    setSmtpVerifyResult(null);
  };

  const handleSignatureChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      signature: {
        ...prev.signature,
        [field]: value
      }
    }));
  };

  // Quick Presets for SMTP
  const applyPreset = (presetName) => {
    if (presetName === 'gmail') {
      setFormData(prev => ({
        ...prev,
        driver: 'smtp',
        smtp: {
          ...prev.smtp,
          host: 'smtp.gmail.com',
          port: 587,
          encryption: 'tls',
          authRequired: true
        }
      }));
      setSmtpVerifyResult(null);
      showToast('Đã áp dụng thông số máy chủ Google / Gmail Workspace!', 'info');
    } else if (presetName === 'sendgrid') {
      setFormData(prev => ({
        ...prev,
        driver: 'smtp',
        smtp: {
          ...prev.smtp,
          host: 'smtp.sendgrid.net',
          port: 587,
          encryption: 'tls',
          authRequired: true
        }
      }));
      setSmtpVerifyResult(null);
      showToast('Đã áp dụng thông số máy chủ SendGrid SMTP!', 'info');
    } else if (presetName === 'office365') {
      setFormData(prev => ({
        ...prev,
        driver: 'smtp',
        smtp: {
          ...prev.smtp,
          host: 'smtp.office365.com',
          port: 587,
          encryption: 'tls',
          authRequired: true
        }
      }));
      setSmtpVerifyResult(null);
      showToast('Đã áp dụng thông số máy chủ Microsoft 365 / Outlook!', 'info');
    } else if (presetName === 'zoho') {
      setFormData(prev => ({
        ...prev,
        driver: 'smtp',
        smtp: {
          ...prev.smtp,
          host: 'smtp.zoho.com',
          port: 465,
          encryption: 'ssl',
          authRequired: true
        }
      }));
      setSmtpVerifyResult(null);
      showToast('Đã áp dụng thông số máy chủ ZOHO Mail!', 'info');
    }
  };

  // Save changes
  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateEmailConfig(formData);
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình email về mặc định ban đầu không?')) {
      resetEmailConfig();
      setFormData(DEFAULT_EMAIL_CONFIG);
      setLastTestResult(null);
      setSmtpVerifyResult(null);
    }
  };

  // Verify SMTP Connection directly
  const handleVerifySmtp = async () => {
    setIsVerifyingSmtp(true);
    setSmtpVerifyResult(null);
    try {
      updateEmailConfig(formData);
      const res = await verifySmtpConnection(formData.smtp);
      setSmtpVerifyResult(res);
    } catch (err) {
      setSmtpVerifyResult({ success: false, error: err.message });
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  // Send Test Email
  const handleSendTest = async (e) => {
    if (e) e.preventDefault();
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ để nhận thư kiểm tra!', 'warning');
      return;
    }

    setIsSendingTest(true);
    setLastTestResult(null);
    try {
      updateEmailConfig(formData);
      const res = await sendTestEmail(testEmailRecipient);
      if (res) {
        setLastTestResult({
          success: res.success,
          error: res.error,
          emailId: res.emailId,
          messageId: res.messageId,
          sentAt: new Date().toLocaleTimeString('vi-VN'),
          to: testEmailRecipient
        });
      }
    } catch (err) {
      console.error(err);
      setLastTestResult({
        success: false,
        error: err.message || 'Lỗi kết nối khi gửi thư',
        sentAt: new Date().toLocaleTimeString('vi-VN'),
        to: testEmailRecipient
      });
      showToast('Có lỗi xảy ra khi gửi thư thử nghiệm!', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // ================= TEMPLATE CUSTOMIZATION LOGIC =================
  const templates = formData.templates || DEFAULT_EMAIL_TEMPLATES;
  const currentTemplate = templates[selectedTemplateId] || DEFAULT_EMAIL_TEMPLATES[selectedTemplateId] || {};

  const handleTemplateFieldChange = (field, value) => {
    setFormData(prev => {
      const curTpls = prev.templates || DEFAULT_EMAIL_TEMPLATES;
      const updatedTpl = {
        ...(curTpls[selectedTemplateId] || DEFAULT_EMAIL_TEMPLATES[selectedTemplateId] || {}),
        [field]: value
      };
      return {
        ...prev,
        templates: {
          ...curTpls,
          [selectedTemplateId]: updatedTpl
        }
      };
    });
  };

  const handleSaveCurrentTemplate = () => {
    updateEmailTemplate(selectedTemplateId, currentTemplate);
  };

  const handleResetCurrentTemplate = () => {
    if (window.confirm(`Khôi phục mẫu "${currentTemplate.name || selectedTemplateId}" về thiết lập gốc ban đầu?`)) {
      resetEmailTemplate(selectedTemplateId);
      setFormData(prev => ({
        ...prev,
        templates: {
          ...(prev.templates || DEFAULT_EMAIL_TEMPLATES),
          [selectedTemplateId]: DEFAULT_EMAIL_TEMPLATES[selectedTemplateId]
        }
      }));
    }
  };

  const handleResetAllTemplates = () => {
    if (window.confirm('Khôi phục toàn bộ 5 mẫu nội dung email về thiết lập gốc ban đầu?')) {
      resetAllEmailTemplates();
      setFormData(prev => ({
        ...prev,
        templates: DEFAULT_EMAIL_TEMPLATES
      }));
    }
  };

  const handleInsertToken = (token) => {
    const currentVal = currentTemplate[lastFocusedField] || '';
    handleTemplateFieldChange(lastFocusedField, currentVal ? `${currentVal} ${token}` : token);
    showToast(`Đã chèn thẻ biến số ${token} vào trường "${lastFocusedField}"!`, 'success');
  };

  const TEMPLATE_TABS = [
    {
      id: 'welcome_verification',
      name: 'Chào mừng & Kích hoạt tặng thưởng ví',
      recipient: 'Gửi Thành Viên Mới',
      icon: 'fa-solid fa-gift',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'report_confirmation',
      name: 'Xác nhận tiếp nhận phản ánh',
      recipient: 'Gửi Người Báo Cáo',
      icon: 'fa-solid fa-clipboard-check',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    {
      id: 'author_warning',
      name: 'Cảnh báo vi phạm & Hạ tin',
      recipient: 'Gửi Chủ Tin Đăng',
      icon: 'fa-solid fa-triangle-exclamation',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'report_resolution',
      name: 'Thông báo kết quả giải quyết',
      recipient: 'Gửi Người Báo Cáo',
      icon: 'fa-solid fa-circle-check',
      badgeClass: 'bg-sky-950 text-sky-300 border-sky-800'
    },
    {
      id: 'admin_alert',
      name: 'Cảnh báo khẩn cấp tin vi phạm',
      recipient: 'Gửi Ban Quản Trị',
      icon: 'fa-solid fa-shield-halved',
      badgeClass: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      id: 'smtp_test',
      name: 'Thư thử nghiệm kết nối',
      recipient: 'SMTP Test Email',
      icon: 'fa-solid fa-vial-circle-check',
      badgeClass: 'bg-teal-950 text-teal-300 border-teal-800'
    }
  ];

  const AVAILABLE_TOKENS = [
    { token: '{{siteName}}', label: 'Tên Sàn BĐS', desc: 'Tên thương hiệu website (Đất Biển Đà Nẵng)' },
    { token: '{{websiteUrl}}', label: 'Địa chỉ Website', desc: 'Đường dẫn website sàn (https://datbiendanang.vn)' },
    { token: '{{bonusAmount}}', label: 'Số tiền thưởng chào mừng', desc: 'Số tiền tặng vào Ví Khuyến Mãi (ví dụ: 100.000 đ)' },
    { token: '{{verificationUrl}}', label: 'Link kích hoạt tài khoản', desc: 'Đường link xác thực email thành viên' },
    { token: '{{expiryMinutes}}', label: 'Thời hạn link (phút)', desc: 'Thời gian link kích hoạt có hiệu lực (ví dụ: 30)' },
    { token: '{{bonusExpiryDays}}', label: 'Thời hạn tiền (ngày)', desc: 'Thời gian tiền thưởng có hiệu lực trong ví (ví dụ: 30)' },
    { token: '{{userName}}', label: 'Tên người dùng mới', desc: 'Họ tên tài khoản đăng ký' },
    { token: '{{userEmail}}', label: 'Email người dùng', desc: 'Địa chỉ email đăng ký' },
    { token: '{{propertyId}}', label: 'Mã tin đăng', desc: 'Mã tin BDS (ví dụ: BDS-003)' },
    { token: '{{propertyTitle}}', label: 'Tiêu đề tin đăng', desc: 'Tiêu đề bài viết bất động sản' },
    { token: '{{reporterName}}', label: 'Tên người báo cáo', desc: 'Họ tên khách hàng phản ánh' },
    { token: '{{authorName}}', label: 'Tên chủ tin đăng', desc: 'Họ tên môi giới / chính chủ đăng bài' },
    { token: '{{reason}}', label: 'Lý do vi phạm', desc: 'Lý do báo cáo vi phạm' },
    { token: '{{reportId}}', label: 'Mã số hồ sơ', desc: 'Mã định danh báo cáo (REP-xxx)' },
    { token: '{{hotline}}', label: 'Hotline CSKH', desc: 'Số điện thoại hỗ trợ kỹ thuật' },
    { token: '{{adminNote}}', label: 'Ghi chú kiểm duyệt', desc: 'Lời giải trình hoặc ghi chú của BQT' },
    { token: '{{actionTaken}}', label: 'Hành động xử lý', desc: 'Biện pháp chế tài (Hạ tin / Đính chính)' },
    { token: '{{currentTime}}', label: 'Thời gian gửi', desc: 'Ngày giờ hệ thống phát email' }
  ];

  const THEME_OPTIONS = [
    { id: 'emerald', label: 'Xanh Ngọc (Emerald)', color: 'bg-emerald-600' },
    { id: 'rose', label: 'Đỏ Ruby (Rose)', color: 'bg-rose-600' },
    { id: 'sky', label: 'Xanh Biển (Sky)', color: 'bg-sky-600' },
    { id: 'amber', label: 'Vàng Cam (Amber)', color: 'bg-amber-600' },
    { id: 'slate', label: 'Đen Xám (Slate)', color: 'bg-slate-700' }
  ];

  // Live HTML preview string
  const previewHtml = renderCustomEmailPreview(selectedTemplateId, currentTemplate, formData);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ================= 1. HEADER & ACTION CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-xl font-black shrink-0">
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
              <span>Email Setting - Cấu Hình Máy Chủ SMTP & Mẫu Thư</span>
              {formData.enableEmailNotifications ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Đang hoạt động</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Đã tạm ngắt</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quản lý máy chủ SMTP, giao thức kết nối và tự do tùy biến lời văn, tiêu đề, biến số cho 5 mẫu email hệ thống.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {onNavigateToEmails && (
            <button
              type="button"
              onClick={onNavigateToEmails}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-white font-bold text-xs border border-blue-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-envelopes-bulk"></i>
              <span>Nhật Ký Thư ({(emailLogs || []).length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-900/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Lưu Toàn Bộ Cấu Hình</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN NAV TABS ================= */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab('server')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeMainTab === 'server'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-server text-sm"></i>
          <span>1. Cấu Hình Máy Chủ & SMTP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('templates')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeMainTab === 'templates'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <i className="fa-solid fa-pen-to-square text-sm"></i>
          <span>2. Tùy Chỉnh Nội Dung Email (5 Mẫu Thư)</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-[10px] font-bold">
            Live Preview
          </span>
        </button>
      </div>

      {/* ================= TAB 1: SERVER & SMTP CONFIG ================= */}
      {activeMainTab === 'server' && (
        <div className="space-y-6">
          {/* 4 Quick status cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Dịch Vụ Email</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableEmailNotifications !== false}
                    onChange={(e) => handleFieldChange('enableEmailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              <div className="text-lg font-black text-white mt-2 flex items-center gap-1.5">
                {formData.enableEmailNotifications ? (
                  <span className="text-emerald-400">Bật Gửi Mail</span>
                ) : (
                  <span className="text-rose-400">Tạm Ngắt Gửi</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Toàn bộ thông báo website</div>
              <i className="fa-solid fa-power-off absolute right-3 bottom-3 text-2xl text-slate-800/40 pointer-events-none"></i>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-teal-500/30 shadow-sm relative overflow-hidden">
              <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Phương Thức (Driver)</div>
              <div className="text-lg font-black text-white mt-2 truncate font-mono uppercase">
                {formData.driver || 'SMTP'}
              </div>
              <div className="text-[10px] text-teal-300/80 mt-1 truncate">
                {formData.smtp?.host || 'smtp.gmail.com'}:{formData.smtp?.port || 587}
              </div>
              <i className="fa-solid fa-server absolute right-3 bottom-3 text-2xl text-teal-900/20 pointer-events-none"></i>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Gửi Đi (From)</div>
              <div className="text-sm font-black text-white mt-2 truncate font-mono" title={formData.fromEmail}>
                {formData.fromEmail || 'kiemduyet@datbiendanang.vn'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate" title={formData.fromName}>
                {formData.fromName || 'Ban Quản Trị'}
              </div>
              <i className="fa-solid fa-paper-plane absolute right-3 bottom-3 text-2xl text-slate-800/40 pointer-events-none"></i>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email BQT Nhận Báo Cáo</div>
              <div className="text-sm font-black text-blue-400 mt-2 truncate font-mono" title={formData.adminAlertEmail}>
                {formData.adminAlertEmail || 'ban-kiem-duyet@datbiendanang.vn'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Đã phát {(emailLogs || []).length} thư trong nhật ký</div>
              <i className="fa-solid fa-shield-halved absolute right-3 bottom-3 text-2xl text-slate-800/40 pointer-events-none"></i>
            </div>
          </div>

          {/* Form and test grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* KHỐI 1: CẤU HÌNH NGƯỜI GỬI */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <i className="fa-solid fa-address-card text-teal-400 text-sm"></i>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    1. Thông Tin Người Gửi & Nhận Diện Thư Điện Tử (From & Reply-to)
                  </h4>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Tên Hiển Thị Người Gửi (From Name) <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="text"
                        value={formData.fromName || ''}
                        onChange={(e) => handleFieldChange('fromName', e.target.value)}
                        placeholder={`Ví dụ: Ban Quản Trị Sàn ${systemConfig?.brandShortName || 'Bất Động Sản'}`}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Tên xuất hiện trong hộp thư đến của khách hàng</p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Địa Chỉ Email Gửi Đi (From Email) <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="email"
                        value={formData.fromEmail || ''}
                        onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                        placeholder="Ví dụ: kiemduyet@datbiendanang.vn"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Địa chỉ email đại diện hệ thống gửi tự động</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Địa Chỉ Nhận Phản Hồi (Reply-To Email):
                      </label>
                      <input
                        type="email"
                        value={formData.replyToEmail || ''}
                        onChange={(e) => handleFieldChange('replyToEmail', e.target.value)}
                        placeholder="Ví dụ: cskh@datbiendanang.vn"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Khi khách hàng bấm "Trả lời (Reply)", thư sẽ gửi về đây</p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Giao Thức Gửi Thư (Mail Driver):
                      </label>
                      <select
                        value={formData.driver || 'smtp'}
                        onChange={(e) => handleFieldChange('driver', e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-teal-500"
                      >
                        <option value="smtp">🚀 Máy Chủ SMTP (Google / SendGrid / Custom Host)</option>
                        <option value="simulation">📦 Mô Phỏng Outbox Nội Bộ (Lưu nhật ký Local)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">Chuẩn giao thức kết nối gửi email tự động</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHỐI 2: CẤU HÌNH MÁY CHỦ SMTP */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-server text-blue-400 text-sm"></i>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      2. Cấu Hình Máy Chủ Gửi Thư SMTP (Mail Server Host & Port)
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-bold">Mẫu nhanh:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset('gmail')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-brands fa-google text-rose-400"></i>
                      <span>Gmail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('sendgrid')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-bolt text-blue-400"></i>
                      <span>SendGrid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('office365')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-brands fa-microsoft text-sky-400"></i>
                      <span>Office 365</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('zoho')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-envelope text-amber-400"></i>
                      <span>ZOHO</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-bold mb-1">
                        Máy Chủ SMTP (SMTP Host) <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="text"
                        value={formData.smtp?.host || ''}
                        onChange={(e) => handleSmtpChange('host', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Địa chỉ server gửi thư (IP hoặc Domain)</p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Cổng (SMTP Port) <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="number"
                        value={formData.smtp?.port || 587}
                        onChange={(e) => handleSmtpChange('port', Number(e.target.value))}
                        placeholder="587"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">587 (TLS), 465 (SSL), 25</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-bold mb-1">
                        Tài Khoản Đăng Nhập SMTP (Username / Email):
                      </label>
                      <input
                        type="text"
                        value={formData.smtp?.username || ''}
                        onChange={(e) => handleSmtpChange('username', e.target.value)}
                        placeholder="support@datbiendanang.vn hoặc email@gmail.com"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Giao Thức Mã Hóa (Encryption):
                      </label>
                      <select
                        value={formData.smtp?.encryption || 'tls'}
                        onChange={(e) => handleSmtpChange('encryption', e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-teal-500"
                      >
                        <option value="tls">TLS / STARTTLS (Khuyên dùng)</option>
                        <option value="ssl">SSL (Cổng 465)</option>
                        <option value="none">Không mã hóa (None)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1 flex items-center justify-between">
                      <span>Mật Khẩu SMTP (Password / Mật Khẩu Ứng Dụng App Password):</span>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-bold underline cursor-pointer"
                      >
                        {showGuide ? 'Ẩn hướng dẫn Gmail' : '💡 Xem cách lấy App Password Gmail'}
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.smtp?.password || ''}
                        onChange={(e) => handleSmtpChange('password', e.target.value)}
                        placeholder="Nhập mật khẩu ứng dụng 16 ký tự..."
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 mt-1 gap-1">
                      <span>Khuyến nghị: Với Google, hãy dùng <strong>Mật khẩu ứng dụng (App Password)</strong>.</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                        <i className="fa-solid fa-shield-halved text-xs"></i> Tự động mã hóa AES-256 cấp quân sự khi lưu vào Database
                      </span>
                    </div>

                    {showGuide && (
                      <div className="mt-3 p-4 bg-slate-900/90 border border-teal-500/30 rounded-2xl text-[11px] text-slate-300 space-y-2 animate-in fade-in duration-200">
                        <div className="font-bold text-teal-300 flex items-center gap-1.5">
                          <i className="fa-solid fa-lightbulb"></i>
                          <span>3 Bước Lấy App Password Cho Gmail / Google Workspace:</span>
                        </div>
                        <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                          <li>Truy cập <Link href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-teal-400 underline">Tài khoản Google &gt; Bảo mật</Link> và đảm bảo đã bật <strong>Xác minh 2 bước</strong>.</li>
                          <li>Tìm mục <strong>Mật khẩu ứng dụng (App Passwords)</strong> hoặc truy cập <Link href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-teal-400 underline">google.com/apppasswords</Link>.</li>
                          <li>Đặt tên ứng dụng là "Đất Biển Đà Nẵng Website" rồi bấm Tạo. Sao chép chuỗi 16 ký tự (ví dụ: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">vmsd xkzp ljwr gqae</code>) dán vào ô Mật khẩu SMTP ở trên.</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Verify Connection Button & Result Box */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={isVerifyingSmtp}
                      onClick={handleVerifySmtp}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-500 text-teal-400 hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer w-max disabled:opacity-60"
                    >
                      <i className={`fa-solid ${isVerifyingSmtp ? 'fa-spinner fa-spin' : 'fa-plug-circle-check'}`}></i>
                      <span>{isVerifyingSmtp ? 'Đang kiểm tra kết nối...' : 'Kiểm Tra Kết Nối SMTP (Ping Server)'}</span>
                    </button>

                    {smtpVerifyResult && (
                      <div className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 animate-in fade-in duration-150 ${
                        smtpVerifyResult.success
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                      }`}>
                        <i className={`fa-solid ${smtpVerifyResult.success ? 'fa-circle-check text-emerald-400' : 'fa-circle-exclamation text-rose-400'}`}></i>
                        <span>
                          {smtpVerifyResult.success
                            ? 'Kết nối máy chủ SMTP & xác thực thành công!'
                            : `Lỗi: ${smtpVerifyResult.error}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KHỐI 3: THIẾT LẬP THÔNG BÁO CHO BAN QUẢN TRỊ */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <i className="fa-solid fa-bell text-amber-400 text-sm"></i>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    3. Tiếp Nhận Thông Báo & Cảnh Báo Cho Ban Quản Trị (Admin Alert Recipients)
                  </h4>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Email BQT Tiếp Nhận Báo Cáo Vi Phạm <span className="text-red-400">*</span>:
                      </label>
                      <input
                        type="email"
                        value={formData.adminAlertEmail || ''}
                        onChange={(e) => handleFieldChange('adminAlertEmail', e.target.value)}
                        placeholder="ban-kiem-duyet@datbiendanang.vn"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Hệ thống gửi thư báo động đỏ tới email này ngay khi có vi phạm</p>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Email Giám Sát Đồng Gửi (CC List):
                      </label>
                      <input
                        type="text"
                        value={formData.adminCcEmails || ''}
                        onChange={(e) => handleFieldChange('adminCcEmails', e.target.value)}
                        placeholder="giam-sat@datbiendanang.vn, phap-che@datbiendanang.vn"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Phân cách nhiều địa chỉ bằng dấu phẩy (,)</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="font-bold text-slate-300 text-xs mb-2">Các sự kiện tự động phát thông báo Email:</div>

                    <label className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.notifyAdminOnReport !== false}
                        onChange={(e) => handleFieldChange('notifyAdminOnReport', e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-700 bg-slate-800 focus:ring-teal-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Cảnh Báo Báo Cáo Vi Phạm Tin Đăng</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">Khẩn cấp</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Phát email cảnh báo ngay khi người mua hoặc khách hàng gửi báo cáo sai lệch giá, ảnh giả mạo.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.notifyAdminOnNewListing !== false}
                        onChange={(e) => handleFieldChange('notifyAdminOnNewListing', e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-700 bg-slate-800 focus:ring-teal-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Tin Đăng Mới Cần Duyệt Thủ Công</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">Kiểm duyệt</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Gửi thư thông báo cho kiểm duyệt viên khi có bài viết mới nằm trong hàng đợi chờ duyệt.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.notifyAdminOnVipPurchase !== false}
                        onChange={(e) => handleFieldChange('notifyAdminOnVipPurchase', e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-700 bg-slate-800 focus:ring-teal-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Giao Dịch Nạp Tiền & Đăng Tin VIP Thành Công</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">Tài chính</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Thông báo kế toán khi thành viên nâng cấp gói VIP hoặc thanh toán thành công qua VietQR.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.notifyReporterOnResolution !== false}
                        onChange={(e) => handleFieldChange('notifyReporterOnResolution', e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-700 bg-slate-800 focus:ring-teal-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>Tự Động Phản Hồi Cho Người Báo Cáo</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-bold">Khách hàng</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tự động phát thư cảm ơn & biên nhận kết quả giải quyết khi Admin hạ tin hoặc xác minh vi phạm.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* KHỐI 4: CHỮ KÝ THƯƠNG HIỆU EMAIL */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                  <i className="fa-solid fa-signature text-purple-400 text-sm"></i>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    4. Chữ Ký Thương Hiệu & Chân Trang Email (Email Signature & Footer)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tên Doanh Nghiệp Chân Trang:</label>
                    <input
                      type="text"
                      value={formData.signature?.companyName || ''}
                      onChange={(e) => handleSignatureChange('companyName', e.target.value)}
                      placeholder={`Ví dụ: ${systemConfig?.platformName || 'Sàn Giao Dịch Bất Động Sản'}`}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-400 font-bold">Hotline CSKH Đính Kèm:</label>
                      <button
                        type="button"
                        onClick={() => handleSignatureChange('hotline', systemConfig?.hotline || '0904 084 888')}
                        className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline"
                        title="Đồng bộ từ Hotline hệ thống"
                      >
                        Lấy từ Cài đặt sàn ({systemConfig?.hotline || '0904 084 888'})
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.signature?.hotline || ''}
                      onChange={(e) => handleSignatureChange('hotline', e.target.value)}
                      placeholder={`VD: ${systemConfig?.hotline || '0904 084 888'}`}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Địa Chỉ Website Sàn (Website URL):</label>
                    <input
                      type="url"
                      value={formData.signature?.websiteUrl || ''}
                      onChange={(e) => handleSignatureChange('websiteUrl', e.target.value)}
                      placeholder="https://datbiendanang.vn"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Địa Chỉ Trụ Sở Trong Thư:</label>
                    <input
                      type="text"
                      value={formData.signature?.address || ''}
                      onChange={(e) => handleSignatureChange('address', e.target.value)}
                      placeholder="Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Test Email Tool */}
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm font-bold">
                    <i className="fa-solid fa-vial-circle-check"></i>
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Kiểm Tra Kết Nối SMTP
                    </h4>
                    <p className="text-[10px] text-slate-400">Gửi thư thử nghiệm xác thực cấu hình</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Địa Chỉ Nhận Thư Kiểm Tra:
                    </label>
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="tranvu.review@gmail.com hoặc email của bạn..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSendingTest}
                    onClick={handleSendTest}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSendingTest ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                        <span>Đang kết nối máy chủ & phát thư...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane text-sm"></i>
                        <span>Gửi Thư Thử Nghiệm Ngay</span>
                      </>
                    )}
                  </button>

                  {lastTestResult && (
                    lastTestResult.success ? (
                      <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-[11px] text-emerald-300 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-200">
                          <i className="fa-solid fa-circle-check text-emerald-400"></i>
                          <span>Gửi email thật thành công vào hòm thư!</span>
                        </div>
                        {lastTestResult.messageId && (
                          <div className="text-slate-300 text-[10px] break-all">
                            Message-ID: <code className="font-mono text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">{lastTestResult.messageId}</code>
                          </div>
                        )}
                        <div className="text-slate-400 text-[10px]">
                          Tới: <strong className="text-white">{lastTestResult.to}</strong> lúc {lastTestResult.sentAt}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-emerald-800/60">
                          💡 Vui lòng mở hòm thư của bạn (kiểm tra cả mục <strong>Inbox</strong> và <strong>Spam / Rác</strong>) để xem thư.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-[11px] text-rose-300 space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold flex items-center gap-1.5 text-rose-200">
                          <i className="fa-solid fa-triangle-exclamation text-rose-400"></i>
                          <span>Gửi email thử nghiệm không thành công</span>
                        </div>
                        <div className="p-2.5 bg-slate-900/90 border border-rose-800/80 rounded-xl text-rose-300 text-[11px] leading-relaxed break-words font-mono">
                          {lastTestResult.error || 'Máy chủ SMTP từ chối xác thực tài khoản.'}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Quick Template Switcher Teaser */}
              <div className="bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/40 p-5 rounded-3xl border border-blue-500/30 text-xs space-y-3">
                <div className="flex items-center gap-2 text-blue-300 font-bold">
                  <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                  <span>Tùy Chỉnh Nội Dung Email</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bạn có thể chỉnh sửa tiêu đề thư, lời chào, nội dung thông báo và phối màu giao diện cho 5 mẫu thư hệ thống.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMainTab('templates')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Chuyển Sang Trình Soạn Thảo Mẫu Thư</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TEMPLATE CUSTOMIZATION STUDIO ================= */}
      {activeMainTab === 'templates' && (
        <div className="space-y-6">
          {/* Sub-Tabs: 5 Templates Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-slate-950 p-2.5 rounded-3xl border border-slate-800">
            {TEMPLATE_TABS.map((tab) => {
              const isActive = selectedTemplateId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tab.id)}
                  className={`p-3 rounded-2xl text-left transition relative flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <i className={`${tab.icon} text-sm ${isActive ? 'text-white' : 'text-blue-400'}`}></i>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${isActive ? 'bg-white/20 text-white border-white/30' : tab.badgeClass}`}>
                      {tab.recipient}
                    </span>
                  </div>
                  <div className="font-bold text-xs leading-snug line-clamp-2">
                    {tab.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main 2-column Grid: Editor (Left 60%) + Live Preview (Right 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Template Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Template Header Card */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                        <i className="fa-solid fa-pen-nib"></i>
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {currentTemplate.name || 'Mẫu Thư'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {currentTemplate.description || 'Tự động gửi theo sự kiện tương ứng trên hệ thống.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveCurrentTemplate}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shadow-md shadow-blue-900/30 transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Lưu Mẫu</span>
                    </button>
                  </div>
                </div>

                {/* Token Toolbar */}
                <div className="p-3.5 bg-slate-900/80 border border-blue-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <i className="fa-solid fa-tags"></i>
                      <span>Thẻ Biến Số Nhanh (Click để chèn vào vị trí đang sửa):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Trường đang chọn: <strong className="text-teal-300 font-mono">{lastFocusedField}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TOKENS.map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => handleInsertToken(item.token)}
                        className="px-2 py-1 bg-slate-800 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-400 rounded-lg font-mono text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title={`${item.label}: ${item.desc}`}
                      >
                        <span>{item.token}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    💡 Khi gửi thư thực tế, hệ thống sẽ tự động thay thế <code className="text-teal-400">{'{{variable}}'}</code> bằng dữ liệu thật của tin đăng & người dùng.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 text-xs">
                  {/* Email Subject */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Tiêu Đề Email (Subject) <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      value={currentTemplate.subject || ''}
                      onFocus={() => setLastFocusedField('subject')}
                      onChange={(e) => handleTemplateFieldChange('subject', e.target.value)}
                      placeholder="Ví dụ: ✅ Tiếp nhận phản ánh vi phạm tin rao #{{propertyId}}"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Dòng tiêu đề hiển thị trong danh sách hộp thư đến của người nhận</p>
                  </div>

                  {/* Header Theme Color Picker */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Gam Màu Chủ Đạo Khung Tiêu Đề (Header Theme):
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {THEME_OPTIONS.map((th) => {
                        const isSelected = (currentTemplate.headerTheme || 'emerald') === th.id;
                        return (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => handleTemplateFieldChange('headerTheme', th.id)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/40'
                                : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${th.color}`}></span>
                            <span>{th.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Header Badge & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Huy Hiệu Nhỏ Trên Đầu (Badge):
                      </label>
                      <input
                        type="text"
                        value={currentTemplate.headerBadge || ''}
                        onFocus={() => setLastFocusedField('headerBadge')}
                        onChange={(e) => handleTemplateFieldChange('headerBadge', e.target.value)}
                        placeholder="Tiếp Nhận Phản Ánh"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Tiêu Đề Lớn Trong Khung Màu (Header Title):
                      </label>
                      <input
                        type="text"
                        value={currentTemplate.headerTitle || ''}
                        onFocus={() => setLastFocusedField('headerTitle')}
                        onChange={(e) => handleTemplateFieldChange('headerTitle', e.target.value)}
                        placeholder="Đã Tiếp Nhận Báo Cáo Vi Phạm"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Greeting */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Lời Chào Đầu Thư (Greeting):
                    </label>
                    <input
                      type="text"
                      value={currentTemplate.greeting || ''}
                      onFocus={() => setLastFocusedField('greeting')}
                      onChange={(e) => handleTemplateFieldChange('greeting', e.target.value)}
                      placeholder="Kính gửi {{reporterName}},"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Intro text */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Đoạn Văn Mở Đầu / Nội Dung Giới Thiệu (Intro Text):
                    </label>
                    <textarea
                      rows={3}
                      value={currentTemplate.introText || ''}
                      onFocus={() => setLastFocusedField('introText')}
                      onChange={(e) => handleTemplateFieldChange('introText', e.target.value)}
                      placeholder="Cảm ơn Quý khách đã gửi phản ánh vi phạm về tin rao bất động sản..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                    />
                  </div>

                  {/* Specific Body Fields for Template Type */}
                  {selectedTemplateId === 'welcome_verification' && (
                    <>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Văn Bản Nút Bấm Kích Hoạt (Action Button Text):
                        </label>
                        <input
                          type="text"
                          value={currentTemplate.actionButtonText || ''}
                          onFocus={() => setLastFocusedField('actionButtonText')}
                          onChange={(e) => handleTemplateFieldChange('actionButtonText', e.target.value)}
                          placeholder="Kích Hoạt Tài Khoản & Nhận {{bonusAmount}} Vào Ví"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Thông Báo Thời Hạn Hiệu Lực (Expiration Notice):
                        </label>
                        <textarea
                          rows={2}
                          value={currentTemplate.expirationNotice || ''}
                          onFocus={() => setLastFocusedField('expirationNotice')}
                          onChange={(e) => handleTemplateFieldChange('expirationNotice', e.target.value)}
                          placeholder="Lưu ý: Liên kết kích hoạt này có hiệu lực trong vòng {{expiryMinutes}} phút. Số tiền quà tặng có thời hạn sử dụng trong {{bonusExpiryDays}} ngày..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                    </>
                  )}

                  {selectedTemplateId === 'report_confirmation' && (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Cam Kết Quy Trình Thẩm Định 24 Giờ:
                      </label>
                      <textarea
                        rows={3}
                        value={currentTemplate.processNotice || ''}
                        onFocus={() => setLastFocusedField('processNotice')}
                        onChange={(e) => handleTemplateFieldChange('processNotice', e.target.value)}
                        placeholder="Trong vòng 24 giờ làm việc, đội ngũ thẩm định nội dung sẽ liên hệ trực tiếp..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                      />
                    </div>
                  )}

                  {selectedTemplateId === 'author_warning' && (
                    <>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Nội Dung Lý Do Vi Phạm (Reason Notice):
                        </label>
                        <textarea
                          rows={2}
                          value={currentTemplate.reasonNotice || ''}
                          onFocus={() => setLastFocusedField('reasonNotice')}
                          onChange={(e) => handleTemplateFieldChange('reasonNotice', e.target.value)}
                          placeholder="Lý do xử lý: {{adminNote}}"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Hướng Dẫn Khiếu Nại & Mở Lại Tin (Appeal Notice):
                        </label>
                        <textarea
                          rows={2}
                          value={currentTemplate.appealNotice || ''}
                          onFocus={() => setLastFocusedField('appealNotice')}
                          onChange={(e) => handleTemplateFieldChange('appealNotice', e.target.value)}
                          placeholder="Nếu bạn cho rằng quyết định này có sự nhầm lẫn, vui lòng liên hệ..."
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                    </>
                  )}

                  {selectedTemplateId === 'report_resolution' && (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Chi Tiết Kết Quả Thẩm Định & Chế Tài:
                      </label>
                      <textarea
                        rows={2}
                        value={currentTemplate.resolutionDetail || ''}
                        onFocus={() => setLastFocusedField('resolutionDetail')}
                        onChange={(e) => handleTemplateFieldChange('resolutionDetail', e.target.value)}
                        placeholder="Biện pháp đã thực hiện: {{actionTaken}}. {{adminNote}}"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                      />
                    </div>
                  )}

                  {/* Closing Text */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Lời Kết Thư / Cam Kết Đồng Hành:
                    </label>
                    <textarea
                      rows={2}
                      value={currentTemplate.closingText || ''}
                      onFocus={() => setLastFocusedField('closingText')}
                      onChange={(e) => handleTemplateFieldChange('closingText', e.target.value)}
                      placeholder="Một lần nữa xin chân thành cảm ơn Quý khách..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed outline-none focus:border-blue-500 resize-y"
                    />
                  </div>

                  {/* Sender Sign */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Chữ Ký Người Gửi Đại Diện (Sign-off):
                    </label>
                    <input
                      type="text"
                      value={currentTemplate.senderSign || ''}
                      onFocus={() => setLastFocusedField('senderSign')}
                      onChange={(e) => handleTemplateFieldChange('senderSign', e.target.value)}
                      placeholder="Đội Ngũ Kiểm Soát Chất Lượng Sàn {{siteName}}"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Bottom Actions for current template */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCurrentTemplate}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-floppy-disk"></i>
                    <span>Lưu Mẫu Thư Này</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live HTML Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
                {/* Header Window Dot Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    </span>
                    <span className="text-xs font-black text-white ml-2 flex items-center gap-1.5">
                      <i className="fa-solid fa-eye text-blue-400"></i>
                      <span>Bản Xem Trước Trực Quan Live HTML</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Màn hình lớn / Desktop"
                    >
                      <i className="fa-solid fa-desktop"></i>
                      <span>PC</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Màn hình điện thoại / Mobile"
                    >
                      <i className="fa-solid fa-mobile-screen"></i>
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Envelope Details */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 w-16 shrink-0">Người gửi:</span>
                    <strong className="text-slate-200 truncate">{formData.fromName || `Ban Quản Trị Sàn ${systemConfig?.brandShortName || 'Bất Động Sản'}`}</strong>
                    <span className="text-slate-400 font-mono truncate">&lt;{formData.fromEmail || 'kiemduyet@datbiendanang.vn'}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16 shrink-0">Tiêu đề:</span>
                    <strong className="text-teal-300 font-mono text-[11px] break-all">
                      {renderEmailTemplateString(currentTemplate.subject || '', {
                        propertyId: 'BDS-003',
                        siteName: formData.signature?.companyName || systemConfig?.brandShortName || 'Sàn BĐS',
                        websiteUrl: formData.signature?.websiteUrl || 'https://datbiendanang.vn',
                        reason: 'Giá không đúng thực tế',
                        currentTime: new Date().toLocaleTimeString('vi-VN')
                      })}
                    </strong>
                  </div>
                </div>

                {/* Rendered HTML Canvas */}
                <div className="bg-slate-900/60 p-2 sm:p-3 rounded-2xl border border-slate-800/80 overflow-x-auto max-h-[640px] overflow-y-auto">
                  <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[360px] shadow-2xl' : 'max-w-full'}`}>
                    <div
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      className="email-rendered-preview rounded-2xl overflow-hidden shadow"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center pt-1">
                  💡 Bản vẽ mô phỏng HTML sẽ hiển thị tương đương trên Gmail, Outlook và Apple Mail.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
