'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { REPORT_REASONS } from '../utils/emailService';
import { getPropertyPermalink } from '../utils/permalink';

export default function AdminReportsManager({ 
  initialTab = 'reports', 
  activeTab: controlledTab,
  onTabChange,
  initialReportId = null, 
  onClearTargetReport = null 
}) {
  const {
    properties,
    listingReports,
    emailLogs,
    emailConfig,
    updateReportStatus,
    deleteListingReport,
    deleteMultipleListingReports,
    deleteEmailLog,
    deleteMultipleEmailLogs,
    sendCustomEmail,
    resendReportConfirmationEmail,
    resendEmail,
    showToast,
    systemConfig
  } = useRealEstate();

  // Active view tab ('reports' or 'emails')
  const [internalTab, setInternalTab] = useState(controlledTab || initialTab);
  const activeTab = controlledTab || internalTab;

  useEffect(() => {
    if (controlledTab) {
      setInternalTab(controlledTab);
    } else if (initialTab) {
      setInternalTab(initialTab);
    }
  }, [controlledTab, initialTab]);

  const handleTabChange = (newTab) => {
    setInternalTab(newTab);
    if (onTabChange) onTabChange(newTab);
  };

  // Search & Filter state for Reports
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all'); // 'all', 'pending', 'verified', 'delisted', 'rejected'
  const [reportReasonFilter, setReportReasonFilter] = useState('all');

  // Pagination & Bulk Selection for Reports
  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(10);
  const [selectedReportIds, setSelectedReportIds] = useState([]);

  // Search & Filter state for Emails
  const [emailSearch, setEmailSearch] = useState('');
  const [emailTypeFilter, setEmailTypeFilter] = useState('all');

  // Pagination & Bulk Selection for Emails
  const [emailPage, setEmailPage] = useState(1);
  const [emailPageSize, setEmailPageSize] = useState(10);
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);

  // Reset page when filters change
  useEffect(() => {
    setReportPage(1);
  }, [reportSearch, reportStatusFilter, reportReasonFilter]);

  useEffect(() => {
    setEmailPage(1);
  }, [emailSearch, emailTypeFilter]);

  // Modal states
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);
  const [actionType, setActionType] = useState('delist'); // 'delist', 'verify', 'reject', 'details'
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // States for resending confirmation email & email logs
  const [resendingReportId, setResendingReportId] = useState(null);
  const [resendingEmailId, setResendingEmailId] = useState(null);
  const [promptResendReport, setPromptResendReport] = useState(null);
  const [customResendEmail, setCustomResendEmail] = useState('');

  // Auto-focus selected report when navigated from Admin Notifications
  useEffect(() => {
    if (initialReportId && listingReports && listingReports.length > 0) {
      const found = listingReports.find(r => r.id === initialReportId || r.propertyId === initialReportId);
      if (found) {
        setSelectedReportForAction(found);
        setActionType(found.status === 'pending' ? 'delist' : 'verify');
        setAdminNoteInput(found.adminNote || (found.status === 'pending' ? `Đã tiếp nhận phản ánh: ${REPORT_REASONS[found.reason]?.label || found.reason}. Đang xử lý.` : ''));
        handleTabChange('reports');
      }
    }
  }, [initialReportId, listingReports]);

  // Email Preview Modal
  const [previewEmail, setPreviewEmail] = useState(null);

  // Compose Email Modal
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeFormData, setComposeFormData] = useState({
    to: '',
    toName: '',
    subject: '',
    messageContent: '',
    templateType: 'custom'
  });

  // KPI Metrics
  const totalReports = (listingReports || []).length;
  const pendingReports = (listingReports || []).filter(r => r.status === 'pending').length;
  const delistedReports = (listingReports || []).filter(r => r.status === 'delisted').length;
  const resolvedReports = (listingReports || []).filter(r => r.status === 'verified' || r.status === 'rejected').length;
  const totalEmails = (emailLogs || []).length;

  // Filtered Reports List
  const filteredReports = useMemo(() => {
    return (listingReports || []).filter(item => {
      // 1. Status Filter
      if (reportStatusFilter !== 'all' && item.status !== reportStatusFilter) {
        return false;
      }
      // 2. Reason Filter
      if (reportReasonFilter !== 'all' && item.reason !== reportReasonFilter) {
        return false;
      }
      // 3. Search Filter
      if (reportSearch.trim()) {
        const q = reportSearch.toLowerCase().trim();
        const matchId = item.id.toLowerCase().includes(q);
        const matchPropId = item.propertyId?.toLowerCase().includes(q);
        const matchTitle = item.propertyTitle?.toLowerCase().includes(q);
        const matchName = item.reporterName?.toLowerCase().includes(q);
        const matchContact = item.contact?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchId && !matchPropId && !matchTitle && !matchName && !matchContact && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [listingReports, reportStatusFilter, reportReasonFilter, reportSearch]);

  // Filtered Email Logs
  const filteredEmails = useMemo(() => {
    return (emailLogs || []).filter(item => {
      if (emailTypeFilter !== 'all' && item.type !== emailTypeFilter) {
        return false;
      }
      if (emailSearch.trim()) {
        const q = emailSearch.toLowerCase().trim();
        const matchTo = item.to?.toLowerCase().includes(q);
        const matchToName = item.toName?.toLowerCase().includes(q);
        const matchSubject = item.subject?.toLowerCase().includes(q);
        const matchProp = item.propertyId?.toLowerCase().includes(q);
        if (!matchTo && !matchToName && !matchSubject && !matchProp) {
          return false;
        }
      }
      return true;
    });
  }, [emailLogs, emailTypeFilter, emailSearch]);

  // Phân trang danh sách Báo Cáo Vi Phạm
  const totalReportPages = Math.max(1, Math.ceil(filteredReports.length / reportPageSize));
  const paginatedReports = useMemo(() => {
    const start = (reportPage - 1) * reportPageSize;
    return filteredReports.slice(start, start + reportPageSize);
  }, [filteredReports, reportPage, reportPageSize]);

  useEffect(() => {
    if (reportPage > totalReportPages) {
      setReportPage(totalReportPages);
    }
  }, [totalReportPages, reportPage]);

  // Phân trang danh sách Hộp Thư / Email Logs
  const totalEmailPages = Math.max(1, Math.ceil(filteredEmails.length / emailPageSize));
  const paginatedEmails = useMemo(() => {
    const start = (emailPage - 1) * emailPageSize;
    return filteredEmails.slice(start, start + emailPageSize);
  }, [filteredEmails, emailPage, emailPageSize]);

  useEffect(() => {
    if (emailPage > totalEmailPages) {
      setEmailPage(totalEmailPages);
    }
  }, [totalEmailPages, emailPage]);

  // Xử lý chọn và xóa hàng loạt Báo Cáo
  const isAllReportsOnPageSelected = paginatedReports.length > 0 && paginatedReports.every(r => selectedReportIds.includes(r.id));
  const isAllFilteredReportsSelected = filteredReports.length > 0 && selectedReportIds.length === filteredReports.length;

  const handleToggleReport = (id) => {
    setSelectedReportIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllReports = () => {
    if (isAllReportsOnPageSelected) {
      const pageIds = new Set(paginatedReports.map(r => r.id));
      setSelectedReportIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedReports.map(r => r.id);
      setSelectedReportIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFilteredReports = () => {
    setSelectedReportIds(filteredReports.map(r => r.id));
  };

  const handleClearSelectedReports = () => {
    setSelectedReportIds([]);
  };

  const handleBulkDeleteReports = () => {
    if (selectedReportIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedReportIds.length} báo cáo vi phạm đã chọn không? Thao tác này không thể hoàn tác.`)) {
      deleteMultipleListingReports(selectedReportIds);
      setSelectedReportIds([]);
    }
  };

  // Xử lý chọn và xóa hàng loạt Email Logs
  const isAllEmailsOnPageSelected = paginatedEmails.length > 0 && paginatedEmails.every(m => selectedEmailIds.includes(m.id));
  const isAllFilteredEmailsSelected = filteredEmails.length > 0 && selectedEmailIds.length === filteredEmails.length;

  const handleToggleEmail = (id) => {
    setSelectedEmailIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllEmails = () => {
    if (isAllEmailsOnPageSelected) {
      const pageIds = new Set(paginatedEmails.map(m => m.id));
      setSelectedEmailIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedEmails.map(m => m.id);
      setSelectedEmailIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFilteredEmails = () => {
    setSelectedEmailIds(filteredEmails.map(m => m.id));
  };

  const handleClearSelectedEmails = () => {
    setSelectedEmailIds([]);
  };

  const handleBulkDeleteEmails = () => {
    if (selectedEmailIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedEmailIds.length} thư đã chọn khỏi nhật ký không?`)) {
      deleteMultipleEmailLogs(selectedEmailIds);
      setSelectedEmailIds([]);
    }
  };

  const handleDeleteSingleEmail = (emailId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thư #${emailId} khỏi nhật ký?`)) {
      deleteEmailLog(emailId);
      setSelectedEmailIds(prev => prev.filter(id => id !== emailId));
    }
  };

  // Quick Action Handler for Report
  const openActionModal = (report, type) => {
    setSelectedReportForAction(report);
    setActionType(type);
    if (type === 'delist') {
      setAdminNoteInput(`Hạ tin rao do vi phạm tiêu chuẩn: ${REPORT_REASONS[report.reason]?.label || report.reason}. Vui lòng liên hệ BQT để đính chính.`);
    } else if (type === 'verify') {
      setAdminNoteInput('Đã liên hệ người bán và xác nhận thông tin. Yêu cầu chủ tin cập nhật lại mức giá/tình trạng mới nhất.');
    } else if (type === 'reject') {
      setAdminNoteInput('Thông tin tin rao hoàn toàn hợp lệ, không có dấu hiệu vi phạm như phản ánh.');
    } else {
      setAdminNoteInput(report.adminNote || '');
    }
  };

  const handleCloseActionModal = () => {
    setSelectedReportForAction(null);
    if (onClearTargetReport) onClearTargetReport();
  };

  const handleConfirmAction = async () => {
    if (!selectedReportForAction) return;
    setIsSubmittingAction(true);
    try {
      const shouldDelist = actionType === 'delist';
      const newStatus = actionType === 'delist' ? 'delisted' : actionType === 'verify' ? 'verified' : 'rejected';
      await updateReportStatus(selectedReportForAction.id, newStatus, adminNoteInput, shouldDelist);
      handleCloseActionModal();
    } catch (err) {
      showToast('Có lỗi xảy ra khi xử lý báo cáo!', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Phát lại email xác nhận tiếp nhận cho Người Báo Cáo
  const handleResendConfirmation = async (report) => {
    const existingEmail = (report.reporterEmail || (report.contact?.includes('@') ? report.contact : '')).trim();
    if (!existingEmail || !existingEmail.includes('@')) {
      setPromptResendReport(report);
      setCustomResendEmail('');
      return;
    }

    setResendingReportId(report.id);
    try {
      await resendReportConfirmationEmail(report.id, existingEmail);
    } finally {
      setResendingReportId(null);
    }
  };

  const handleConfirmPromptResend = async (e) => {
    e.preventDefault();
    if (!customResendEmail || !customResendEmail.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ!', 'warning');
      return;
    }
    setResendingReportId(promptResendReport.id);
    try {
      await resendReportConfirmationEmail(promptResendReport.id, customResendEmail);
      setPromptResendReport(null);
    } finally {
      setResendingReportId(null);
    }
  };

  // Phát lại email bất kỳ trong logs
  const handleResendAnyEmail = async (emailId) => {
    setResendingEmailId(emailId);
    try {
      await resendEmail(emailId);
    } finally {
      setResendingEmailId(null);
    }
  };

  // Open Compose Email with pre-filled recipient
  const activeHotline = systemConfig?.hotline || emailConfig?.signature?.hotline || '0904 084 888';

  const handleOpenComposeForUser = (recipientEmail, recipientName, report = null) => {
    setComposeFormData({
      to: recipientEmail || '',
      toName: recipientName || '',
      subject: report ? `[Đất Biển Đà Nẵng] Phản hồi về tin rao #${report.propertyId}` : '[Đất Biển Đà Nẵng] Thông báo từ Ban Kiểm Duyệt Sàn',
      messageContent: report
        ? `Kính gửi ${recipientName || 'Quý khách'},\n\nBan kiểm duyệt Đất Biển Đà Nẵng xin gửi thông báo liên quan đến tin đăng #${report.propertyId} (${report.propertyTitle}).\n\nNội dung trao đổi:\n- \n\nMọi thắc mắc xin liên hệ Hotline ${activeHotline}.\nTrân trọng!`
        : `Kính gửi ${recipientName || 'Quý khách'},\n\n`,
      templateType: 'custom'
    });
    setIsComposeModalOpen(true);
  };

  // Handle Send Compose Email
  const handleSendComposeEmail = async (e) => {
    e.preventDefault();
    if (!composeFormData.to || !composeFormData.subject || !composeFormData.messageContent) {
      showToast('Vui lòng điền đầy đủ email người nhận, tiêu đề và nội dung thư!', 'warning');
      return;
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 20px 24px; color: #ffffff; border-bottom: 3px solid #e11d48;">
          <h2 style="margin: 0; font-size: 18px;">${systemConfig?.brandShortName || 'ĐẤT BIỂN ĐÀ NẴNG'} • THÔNG BÁO TỪ BAN QUẢN TRỊ</h2>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-line;">
          ${composeFormData.messageContent}
        </div>
        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
          Hệ thống email quản trị Sàn Giao Dịch Bất Động Sản ${systemConfig?.brandShortName || 'Đất Biển Đà Nẵng'} • Hotline: ${activeHotline}
        </div>
      </div>
    `;

    await sendCustomEmail({
      to: composeFormData.to,
      toName: composeFormData.toName || composeFormData.to,
      from: emailConfig?.fromEmail || 'kiemduyet@datbiendanang.vn',
      fromName: emailConfig?.fromName || 'Ban Kiểm Duyệt Sàn Đất Biển Đà Nẵng',
      subject: composeFormData.subject,
      htmlBody,
      type: 'custom_admin_direct'
    });

    setIsComposeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER & TABS SWITCHER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner border transition-colors ${
            activeTab === 'emails'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <i className={`fa-solid ${activeTab === 'emails' ? 'fa-envelopes-bulk' : 'fa-flag'}`}></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{activeTab === 'emails' ? 'Hộp Thư & Nhật Ký Gửi Email Hệ Thống' : 'Quản Lý Báo Cáo Tin Rao Vi Phạm'}</span>
              {activeTab === 'emails' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-black">
                  {totalEmails} thư đã gửi
                </span>
              ) : pendingReports > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black animate-pulse">
                  {pendingReports} chờ duyệt
                </span>
              ) : null}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'emails'
                ? 'Theo dõi toàn bộ lịch sử thư thông báo tự động, cảnh báo vi phạm và biên bản xử lý gửi đến thành viên'
                : 'Kiểm soát chất lượng tin đăng, xử lý phản ánh sai lệch và tự động thông báo qua Email'}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>Hồ Sơ Báo Cáo ({totalReports})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('emails')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'emails'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <i className="fa-solid fa-envelope-circle-check"></i>
            <span>Hộp Thư / Email Logs ({totalEmails})</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenComposeForUser('', '')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Soạn Email</span>
          </button>

          {onTabChange && (
            <button
              type="button"
              onClick={() => onTabChange('email-config')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-teal-600 text-teal-400 hover:text-white border border-teal-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow"
              title="Đi tới trang Cấu hình Email Website & Máy chủ SMTP"
            >
              <i className="fa-solid fa-gear"></i>
              <span>Cấu Hình Email Website</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 4 KPI CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Báo Cáo Nhận</div>
          <div className="text-2xl font-black text-white mt-1">{totalReports}</div>
          <div className="text-[10px] text-slate-500 mt-1">Từ người mua & cộng đồng sàn</div>
          <i className="fa-solid fa-inbox absolute right-3 bottom-3 text-3xl text-slate-800/40 pointer-events-none"></i>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Đang Chờ Xử Lý</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingReports}</div>
          <div className="text-[10px] text-amber-300/80 mt-1">Cần BQT kiểm tra trong 24h</div>
          <i className="fa-solid fa-hourglass-half absolute right-3 bottom-3 text-3xl text-amber-900/20 pointer-events-none"></i>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Đã Hạ Tin Vi Phạm</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{delistedReports}</div>
          <div className="text-[10px] text-rose-300/80 mt-1">Gỡ bỏ khỏi sàn & cảnh báo chủ tin</div>
          <i className="fa-solid fa-ban absolute right-3 bottom-3 text-3xl text-rose-900/20 pointer-events-none"></i>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 shadow-sm relative overflow-hidden">
          <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Email Đã Phát Đi</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{totalEmails}</div>
          <div className="text-[10px] text-blue-300/80 mt-1">Tự động thông báo BQT & khách</div>
          <i className="fa-solid fa-paper-plane absolute right-3 bottom-3 text-3xl text-blue-900/20 pointer-events-none"></i>
        </div>
      </div>

      {/* ================= TAB 1: DANH SÁCH BÁO CÁO VI PHẠM ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Toolbar Search & Multi-Filters */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500"></i>
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Tìm mã tin, mã báo cáo, tên, SĐT..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="all">Tất cả trạng thái ({totalReports})</option>
                <option value="pending">⏳ Đang chờ xử lý ({pendingReports})</option>
                <option value="verified">✅ Đã xác minh</option>
                <option value="delisted">🚫 Đã hạ tin vi phạm ({delistedReports})</option>
                <option value="rejected">❌ Đã bác bỏ phản ánh</option>
              </select>

              <select
                value={reportReasonFilter}
                onChange={(e) => setReportReasonFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-xs"
              >
                <option value="all">Tất cả lý do vi phạm</option>
                {Object.entries(REPORT_REASONS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Action Toolbar for Reports */}
          {selectedReportIds.length > 0 && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-rose-300">
                <i className="fa-solid fa-circle-check text-rose-400"></i>
                <span>Đã chọn <strong>{selectedReportIds.length}</strong> / {filteredReports.length} báo cáo</span>
                {!isAllFilteredReportsSelected && (
                  <button
                    type="button"
                    onClick={handleSelectAllFilteredReports}
                    className="underline hover:text-white font-bold ml-1 text-rose-200"
                  >
                    (Chọn tất cả {filteredReports.length} báo cáo)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSelectedReports}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold transition border border-slate-800"
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeleteReports}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                  <span>Xóa đã chọn ({selectedReportIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllReportsOnPageSelected}
                        onChange={handleToggleSelectAllReports}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600 bg-slate-900 border-slate-700 cursor-pointer"
                        title="Chọn tất cả trên trang này"
                      />
                    </th>
                    <th className="p-3.5">Mã Hồ Sơ & Ngày</th>
                    <th className="p-3.5">Tin Rao Bị Báo Cáo</th>
                    <th className="p-3.5">Lý Do & Nội Dung Phản Ánh</th>
                    <th className="p-3.5">Người Gửi Phản Ánh</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-right">Thao Tác Nghiệp Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        <i className="fa-solid fa-clipboard-check text-3xl mb-2 text-slate-700 block"></i>
                        Không có báo cáo vi phạm nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((report) => {
                      const reasonMeta = REPORT_REASONS[report.reason] || { label: report.reason, color: 'rose' };
                      const targetProp = (properties || []).find(p => p.id === report.propertyId);
                      const permalink = targetProp ? getPropertyPermalink(targetProp) : `/bat-dong-san/${report.propertyId}`;
                      const isSelected = selectedReportIds.includes(report.id);

                      return (
                        <tr key={report.id} className={`hover:bg-slate-900/50 transition ${isSelected ? 'bg-rose-950/20' : ''}`}>
                          {/* Checkbox chọn */}
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleReport(report.id)}
                              className="w-4 h-4 rounded text-rose-600 accent-rose-600 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                          </td>
                          {/* Mã & Thời gian */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-mono font-bold text-rose-400">{report.id}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(report.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </td>

                          {/* Tin Rao */}
                          <td className="p-3.5 max-w-xs">
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-900 rounded text-slate-300 border border-slate-800 shrink-0 mt-0.5">
                                #{report.propertyId}
                              </span>
                              <div className="min-w-0">
                                <a
                                  href={permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-white hover:text-rose-400 transition line-clamp-1 flex items-center gap-1"
                                  title="Xem tin đăng trực tiếp trên web"
                                >
                                  <span>{report.propertyTitle || targetProp?.title || 'Tin đăng'}</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-500"></i>
                                </a>
                                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                  {targetProp ? `${targetProp.priceDisplay} • ${targetProp.district}, ${targetProp.city}` : 'Không rõ vị trí'}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Chủ tin: <strong>{targetProp?.author?.name || targetProp?.contactName || 'Người đăng'}</strong> ({targetProp?.author?.phone || targetProp?.contactPhone || 'N/A'})
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Lý Do & Mô Tả */}
                          <td className="p-3.5 max-w-sm">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mb-1 ${
                              reasonMeta.color === 'rose' || reasonMeta.color === 'red'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                : reasonMeta.color === 'amber'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                            }`}>
                              {reasonMeta.label}
                            </span>
                            <div className="text-slate-300 text-[11px] line-clamp-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                              "{report.description || 'Không có mô tả chi tiết'}"
                            </div>
                          </td>

                          {/* Người Báo Cáo */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-bold text-white">{report.reporterName || 'Người dùng ẩn danh'}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {report.reporterPhone || report.contact || 'Chưa cung cấp SĐT'}
                            </div>
                            {report.reporterEmail ? (
                              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                <i className="fa-solid fa-envelope text-[9px]"></i>
                                <span>{report.reporterEmail}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">Không có email</span>
                            )}
                          </td>

                          {/* Trạng Thái */}
                          <td className="p-3.5 whitespace-nowrap">
                            {report.status === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black flex items-center gap-1.5 w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>Chờ Xử Lý</span>
                              </span>
                            )}
                            {report.status === 'delisted' && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-black flex items-center gap-1.5 w-max">
                                <i className="fa-solid fa-ban text-[9px]"></i>
                                <span>Đã Hạ Tin</span>
                              </span>
                            )}
                            {report.status === 'verified' && (
                              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black flex items-center gap-1.5 w-max">
                                <i className="fa-solid fa-check text-[9px]"></i>
                                <span>Đã Xác Minh</span>
                              </span>
                            )}
                            {report.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1.5 w-max">
                                <span>Bác Bỏ</span>
                              </span>
                            )}

                            {report.adminNote && (
                              <div className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={report.adminNote}>
                                📝 {report.adminNote}
                              </div>
                            )}
                          </td>

                          {/* Thao Tác Nghiệp Vụ */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Hạ Tin */}
                              <button
                                type="button"
                                onClick={() => openActionModal(report, 'delist')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs transition flex items-center gap-1"
                                title="Hạ tin đăng ngay lập tức và gửi email cảnh báo chủ tin"
                              >
                                <i className="fa-solid fa-ban text-[10px]"></i>
                                <span>Hạ Tin</span>
                              </button>

                              {/* Nút Duyệt */}
                              <button
                                type="button"
                                onClick={() => openActionModal(report, 'verify')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-bold text-xs transition flex items-center gap-1"
                                title="Đánh dấu đã xác minh"
                              >
                                <i className="fa-solid fa-check text-[10px]"></i>
                                <span>Duyệt</span>
                              </button>

                              {/* Nút Phát Lại Email Xác Nhận Tiếp Nhận */}
                              <button
                                type="button"
                                disabled={resendingReportId === report.id}
                                onClick={() => handleResendConfirmation(report)}
                                className={`px-2.5 py-1.5 rounded-lg border font-bold text-xs transition flex items-center gap-1 ${
                                  resendingReportId === report.id
                                    ? 'bg-emerald-600 text-white border-emerald-500 opacity-70'
                                    : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                                }`}
                                title={report.reporterEmail ? `Phát lại email xác nhận tiếp nhận tới ${report.reporterEmail}` : 'Nhập email để phát lại thư xác nhận'}
                              >
                                <i className={`fa-solid ${resendingReportId === report.id ? 'fa-spinner fa-spin' : 'fa-rotate-right'} text-[10px]`}></i>
                                <span>{resendingReportId === report.id ? 'Đang gửi...' : 'Phát lại email'}</span>
                              </button>

                              {/* Nút Gửi Email Trực Tiếp */}
                              <button
                                type="button"
                                onClick={() => {
                                  const targetEmail = report.reporterEmail || targetProp?.author?.email || '';
                                  const targetName = report.reporterName || targetProp?.author?.name || '';
                                  handleOpenComposeForUser(targetEmail, targetName, report);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white border border-slate-800 transition"
                                title="Soạn email phản hồi"
                              >
                                <i className="fa-solid fa-envelope text-xs"></i>
                              </button>

                              {/* Nút Xóa */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi báo cáo #${report.id}?`)) {
                                    deleteListingReport(report.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-600/80 text-slate-400 hover:text-white border border-slate-800 transition"
                                title="Xóa báo cáo này"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls for Reports */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-white">{filteredReports.length === 0 ? 0 : (reportPage - 1) * reportPageSize + 1} - {Math.min(reportPage * reportPageSize, filteredReports.length)}</strong> trên tổng <strong className="text-rose-400 font-bold">{filteredReports.length}</strong> báo cáo
              </span>
              <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-slate-800">
                <span className="text-slate-500 text-[11px]">Dòng/trang:</span>
                <select
                  value={reportPageSize}
                  onChange={(e) => {
                    setReportPageSize(Number(e.target.value));
                    setReportPage(1);
                  }}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-semibold focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalReportPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={reportPage === 1}
                  onClick={() => setReportPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  <span>Trước</span>
                </button>

                {Array.from({ length: totalReportPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalReportPages || Math.abs(p - reportPage) <= 2)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prevP && p - prevP > 1 && (
                          <span className="px-1 text-slate-600">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setReportPage(p)}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center text-xs ${
                            reportPage === p
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={reportPage === totalReportPages}
                  onClick={() => setReportPage(prev => Math.min(totalReportPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                >
                  <span>Sau</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: HỘP THƯ / EMAIL OUTBOX LOGS ================= */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          {/* Email Toolbar */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500"></i>
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Tìm địa chỉ email, người nhận, tiêu đề..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={emailTypeFilter}
                onChange={(e) => setEmailTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại email ({totalEmails})</option>
                <option value="report_admin_alert">⚠️ Cảnh báo BQT</option>
                <option value="report_confirmation_reporter">✅ Biên nhận người báo cáo</option>
                <option value="author_warning_delist">🚫 Thông báo gỡ tin chủ nhà</option>
                <option value="report_resolution_reporter">📋 Kết quả xử lý vi phạm</option>
                <option value="custom_admin_direct">✉️ Email gửi trực tiếp</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Toolbar for Emails */}
          {selectedEmailIds.length > 0 && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-blue-300">
                <i className="fa-solid fa-circle-check text-blue-400"></i>
                <span>Đã chọn <strong>{selectedEmailIds.length}</strong> / {filteredEmails.length} thư trong nhật ký</span>
                {!isAllFilteredEmailsSelected && (
                  <button
                    type="button"
                    onClick={handleSelectAllFilteredEmails}
                    className="underline hover:text-white font-bold ml-1 text-blue-200"
                  >
                    (Chọn tất cả {filteredEmails.length} thư)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSelectedEmails}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold transition border border-slate-800"
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeleteEmails}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                  <span>Xóa đã chọn ({selectedEmailIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Email Logs Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllEmailsOnPageSelected}
                        onChange={handleToggleSelectAllEmails}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
                        title="Chọn tất cả trên trang này"
                      />
                    </th>
                    <th className="p-3.5">Mã Email & Ngày</th>
                    <th className="p-3.5">Người Nhận (To)</th>
                    <th className="p-3.5">Tiêu Đề Thư (Subject)</th>
                    <th className="p-3.5">Phân Loại</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-right">Thao Tác & Bản Vẽ HTML</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmails.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        <i className="fa-solid fa-envelope-open text-3xl mb-2 text-slate-700 block"></i>
                        Chưa có lịch sử email nào được gửi đi.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmails.map((email) => (
                      <tr key={email.id} className={`hover:bg-slate-900/50 transition ${selectedEmailIds.includes(email.id) ? 'bg-blue-950/20' : ''}`}>
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedEmailIds.includes(email.id)}
                            onChange={() => handleToggleEmail(email.id)}
                            className="w-4 h-4 rounded text-blue-600 accent-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
                          />
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-mono font-bold text-blue-400">{email.id}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(email.sentAt).toLocaleString('vi-VN')}
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-white">{email.toName || email.to}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{email.to}</div>
                        </td>

                        <td className="p-3.5 max-w-sm">
                          <div className="font-semibold text-slate-200 line-clamp-1">{email.subject}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Từ: <strong className="text-slate-400">{email.fromName || email.from}</strong>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            email.type === 'report_admin_alert'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : email.type === 'author_warning_delist'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : email.type === 'report_confirmation_reporter'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {email.type === 'report_admin_alert' ? 'Cảnh Báo BQT' :
                             email.type === 'author_warning_delist' ? 'Hạ Tin Đăng' :
                             email.type === 'report_confirmation_reporter' ? 'Biên Nhận' :
                             email.type === 'report_resolution_reporter' ? 'Kết Quả' : 'Gửi Trực Tiếp'}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                            <i className="fa-solid fa-check text-[9px]"></i>
                            <span>Đã phát</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={resendingEmailId === email.id}
                              onClick={() => handleResendAnyEmail(email.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                resendingEmailId === email.id
                                  ? 'bg-emerald-600 text-white border-emerald-500 opacity-70'
                                  : 'bg-slate-900 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30'
                              }`}
                              title={`Phát lại thư này tới ${email.to}`}
                            >
                              <i className={`fa-solid ${resendingEmailId === email.id ? 'fa-spinner fa-spin' : 'fa-rotate-right'} text-[11px]`}></i>
                              <span>{resendingEmailId === email.id ? 'Đang phát...' : 'Phát lại'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPreviewEmail(email)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                              <i className="fa-solid fa-eye text-xs"></i>
                              <span>Xem Thư HTML</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSingleEmail(email.id)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-800 hover:border-rose-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1"
                              title="Xóa thư này khỏi nhật ký"
                            >
                              <i className="fa-solid fa-trash-can text-[11px]"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls for Emails */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-white">{filteredEmails.length === 0 ? 0 : (emailPage - 1) * emailPageSize + 1} - {Math.min(emailPage * emailPageSize, filteredEmails.length)}</strong> trên tổng <strong className="text-blue-400 font-bold">{filteredEmails.length}</strong> thư
              </span>
              <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-slate-800">
                <span className="text-slate-500 text-[11px]">Dòng/trang:</span>
                <select
                  value={emailPageSize}
                  onChange={(e) => {
                    setEmailPageSize(Number(e.target.value));
                    setEmailPage(1);
                  }}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-semibold focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalEmailPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={emailPage === 1}
                  onClick={() => setEmailPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  <span>Trước</span>
                </button>

                {Array.from({ length: totalEmailPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalEmailPages || Math.abs(p - emailPage) <= 2)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prevP && p - prevP > 1 && (
                          <span className="px-1 text-slate-600">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEmailPage(p)}
                          className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center text-xs ${
                            emailPage === p
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={emailPage === totalEmailPages}
                  onClick={() => setEmailPage(prev => Math.min(totalEmailPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold"
                >
                  <span>Sau</span>
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: XỬ LÝ BÁO CÁO (HẠ TIN / XÁC MINH / BÁC BỎ) ================= */}
      {selectedReportForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                  actionType === 'delist' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <i className={`fa-solid ${actionType === 'delist' ? 'fa-ban' : 'fa-check'}`}></i>
                </span>
                <div>
                  <h4 className="text-base font-black text-white">
                    {actionType === 'delist' ? 'Hạ Tin Rao Khỏi Sàn Giao Dịch' :
                     actionType === 'verify' ? 'Xác Minh Báo Cáo Vi Phạm' : 'Bác Bỏ Phản Ánh'}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Hồ sơ: <strong className="text-white font-mono">{selectedReportForAction.id}</strong> • Tin rao: <strong className="text-white font-mono">#{selectedReportForAction.propertyId}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseActionModal}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Target Listing Recap */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white line-clamp-1">{selectedReportForAction.propertyTitle}</div>
              <div className="text-[11px] text-slate-400">
                Lý do báo cáo: <strong className="text-rose-400">{REPORT_REASONS[selectedReportForAction.reason]?.label || selectedReportForAction.reason}</strong>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                "{selectedReportForAction.description || 'Không có mô tả chi tiết'}"
              </div>
            </div>

            {/* Note & Email Warning Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Ghi chú của Ban Kiểm Duyệt (Sẽ được gửi trong Email thông báo):
              </label>
              <textarea
                rows="3"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Nhập lý do hạ tin hoặc hướng dẫn đính chính..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-rose-500 shadow-inner"
              ></textarea>
            </div>

            {/* Auto Email Checklist Indicator */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-400">
              <div className="font-bold text-slate-300 mb-1">Quy trình tự động kích hoạt khi bấm Xác Nhận:</div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <i className="fa-solid fa-envelope-circle-check text-[10px]"></i>
                <span>Gửi email kết quả xác minh cho người báo cáo ({selectedReportForAction.reporterEmail || 'nếu có email'})</span>
              </div>
              {actionType === 'delist' && (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <i className="fa-solid fa-ban text-[10px]"></i>
                  <span>Chuyển trạng thái tin đăng sang "Tạm gỡ / Bị từ chối" và gửi email thông báo chủ tin</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseActionModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleConfirmAction}
                className={`px-5 py-2 font-bold text-white rounded-xl shadow transition flex items-center gap-1.5 ${
                  actionType === 'delist' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>{isSubmittingAction ? 'Đang xử lý...' : 'Xác Nhận & Gửi Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: XEM TRƯỚC BẢN VẼ EMAIL HTML ================= */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-900">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                  <i className="fa-solid fa-envelope-open-text"></i>
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    Bản Vẽ Email Gửi Đi (Email HTML Preview)
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Mã thư: {previewEmail.id} • {new Date(previewEmail.sentAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Email Metadata Envelope */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold text-slate-500">Người gửi:</span>
                <span className="font-semibold text-slate-800">{previewEmail.fromName} &lt;{previewEmail.from}&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold text-slate-500">Người nhận:</span>
                <span className="font-bold text-blue-700">{previewEmail.toName} &lt;{previewEmail.to}&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold text-slate-500">Tiêu đề:</span>
                <span className="font-extrabold text-slate-900">{previewEmail.subject}</span>
              </div>
            </div>

            {/* Rendered HTML Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
              <div
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-4"
                dangerouslySetInnerHTML={{ __html: previewEmail.htmlBody }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Trạng thái: <strong>Đã phát thành công</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={resendingEmailId === previewEmail.id}
                  onClick={() => handleResendAnyEmail(previewEmail.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                >
                  <i className={`fa-solid ${resendingEmailId === previewEmail.id ? 'fa-spinner fa-spin' : 'fa-rotate-right'} text-xs`}></i>
                  <span>{resendingEmailId === previewEmail.id ? 'Đang phát...' : 'Phát Lại Thư Này'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewEmail(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Đóng Bản Xem Trước
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SOẠN VÀ GỬI EMAIL THỦ CÔNG ================= */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/30">
                  <i className="fa-solid fa-pen-nib"></i>
                </span>
                <div>
                  <h4 className="text-base font-black text-white">Soạn Email Quản Trị Viên</h4>
                  <div className="text-[11px] text-slate-400">Gửi email trực tiếp từ ban kiểm duyệt Sàn Đất Biển Đà Nẵng</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendComposeEmail} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tên người nhận:
                  </label>
                  <input
                    type="text"
                    value={composeFormData.toName}
                    onChange={(e) => setComposeFormData(prev => ({ ...prev, toName: e.target.value }))}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email người nhận: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={composeFormData.to}
                    onChange={(e) => setComposeFormData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tiêu đề email: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={composeFormData.subject}
                  onChange={(e) => setComposeFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ví dụ: [Đất Biển Đà Nẵng] Yêu cầu cập nhật giá tin rao"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nội dung thư: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="6"
                  required
                  value={composeFormData.messageContent}
                  onChange={(e) => setComposeFormData(prev => ({ ...prev, messageContent: e.target.value }))}
                  placeholder="Nhập nội dung trao đổi..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>Phát Email Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NHẬP EMAIL ĐỂ PHÁT LẠI XÁC NHẬN ================= */}
      {promptResendReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/30">
                  <i className="fa-solid fa-rotate-right"></i>
                </span>
                <div>
                  <h4 className="text-base font-black text-white">Phát Lại Email Xác Nhận</h4>
                  <div className="text-[11px] text-slate-400">Gửi biên nhận tiếp nhận báo cáo #{promptResendReport.id}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromptResendReport(null)}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPromptResend} className="space-y-3.5">
              <p className="text-slate-300">
                Bản ghi báo cáo này chưa lưu email của người gửi phản ánh. Vui lòng nhập địa chỉ email để phát lại thư xác nhận tiếp nhận:
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Địa chỉ Email người nhận: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={customResendEmail}
                  onChange={(e) => setCustomResendEmail(e.target.value)}
                  placeholder="nguoibaocao@example.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPromptResendReport(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resendingReportId === promptResendReport.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <i className={`fa-solid ${resendingReportId === promptResendReport.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                  <span>{resendingReportId === promptResendReport.id ? 'Đang gửi...' : 'Phát Lại Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
