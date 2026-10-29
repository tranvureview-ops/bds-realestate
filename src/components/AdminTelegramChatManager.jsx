'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_TELEGRAM_CONFIG } from '../data/mockData';

/**
 * AdminTelegramChatManager.jsx
 * Trang quản trị hệ thống Live Chat Telegram 2 Chiều
 * - Cấu hình Telegram Bot Token (Mã hóa bảo mật AES-256)
 * - Cấu hình Telegram Group Chat ID
 * - Tự động thiết lập Webhook 1 chạm & Kiểm tra kết nối Telegram
 * - Xem lịch sử phiên chat và danh sách khách hàng để lại thông tin (Leads)
 */
export default function AdminTelegramChatManager() {
  const { showToast } = useRealEstate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);

  const [showToken, setShowToken] = useState(false);
  const [showPusherSecret, setShowPusherSecret] = useState(false);

  const [config, setConfig] = useState(DEFAULT_TELEGRAM_CONFIG);
  const [suggestedWebhookUrl, setSuggestedWebhookUrl] = useState('');
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Quản lý danh sách tên chuyên viên tư vấn (Random liên tục)
  const [newAgentNameInput, setNewAgentNameInput] = useState('');
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [previewRandomHighlight, setPreviewRandomHighlight] = useState(false);

  // Danh sách mẫu 10 chuyên viên tư vấn chuẩn
  const SAMPLE_AGENT_NAMES = [
    'Nguyễn Huyền',
    'Trần Bảo Ngọc',
    'Lê Hoàng Nam',
    'Phạm Quỳnh Anh',
    'Vũ Minh Tuấn',
    'Đặng Thu Thảo',
    'Hoàng Gia Bảo',
    'Mai Phương Thúy',
    'Bùi Thanh Tùng',
    'Đỗ Hải Yến'
  ];

  // Thêm 1 tên mới vào danh sách
  const handleAddAgentName = () => {
    const trimmed = newAgentNameInput.trim();
    if (!trimmed) return;
    const currentList = Array.isArray(config.agentNamesList) ? config.agentNamesList : [];
    if (currentList.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Tên "${trimmed}" đã có trong danh sách!`, 'warning');
      return;
    }
    const updated = [...currentList, trimmed];
    setConfig(prev => ({
      ...prev,
      agentNamesList: updated,
      agentName: prev.agentName || trimmed
    }));
    setNewAgentNameInput('');
    showToast(`Đã thêm chuyên viên: ${trimmed}`, 'success');
  };

  // Xóa 1 tên khỏi danh sách
  const handleRemoveAgentName = (nameToRemove) => {
    const currentList = Array.isArray(config.agentNamesList) ? config.agentNamesList : [];
    const updated = currentList.filter(n => n !== nameToRemove);
    setConfig(prev => ({
      ...prev,
      agentNamesList: updated,
      agentName: prev.agentName === nameToRemove ? (updated[0] || 'Chuyên Viên Tư Vấn') : prev.agentName
    }));
  };

  // Nạp lại danh sách 10 tên mẫu
  const handleLoadSampleNames = () => {
    setConfig(prev => ({
      ...prev,
      agentNamesList: [...SAMPLE_AGENT_NAMES],
      agentName: SAMPLE_AGENT_NAMES[0],
      enableRandomAgentName: true
    }));
    showToast('Đã nạp 10 tên chuyên viên mẫu thành công!', 'success');
  };

  // Xóa toàn bộ danh sách
  const handleClearAllNames = () => {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách tên chuyên viên?')) {
      setConfig(prev => ({
        ...prev,
        agentNamesList: []
      }));
      showToast('Đã xóa danh sách tên.', 'info');
    }
  };

  // Chuyển đổi chế độ nhập hàng loạt
  const handleToggleBulkEdit = () => {
    if (!isBulkEditMode) {
      const currentList = Array.isArray(config.agentNamesList) ? config.agentNamesList : [];
      setBulkNamesText(currentList.join('\n'));
      setIsBulkEditMode(true);
    } else {
      setIsBulkEditMode(false);
    }
  };

  // Áp dụng nhập văn bản hàng loạt
  const handleApplyBulkNames = () => {
    const rawLines = bulkNamesText
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const unique = Array.from(new Set(rawLines));
    if (unique.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 tên!', 'warning');
      return;
    }

    setConfig(prev => ({
      ...prev,
      agentNamesList: unique,
      agentName: unique[0] || prev.agentName
    }));
    setIsBulkEditMode(false);
    showToast(`Đã cập nhật danh sách ${unique.length} tên chuyên viên!`, 'success');
  };

  // Random thử 1 tên từ danh sách để xem trước
  const handleRandomizeTest = () => {
    const list = Array.isArray(config.agentNamesList) && config.agentNamesList.length > 0
      ? config.agentNamesList
      : SAMPLE_AGENT_NAMES;

    const candidates = list.filter(n => n !== config.agentName);
    const pool = candidates.length > 0 ? candidates : list;
    const randomPicked = pool[Math.floor(Math.random() * pool.length)];

    setConfig(prev => ({
      ...prev,
      agentName: randomPicked
    }));

    setPreviewRandomHighlight(true);
    setTimeout(() => setPreviewRandomHighlight(false), 900);
    showToast(`🎲 Đã random thử: ${randomPicked}`, 'info');
  };

  const avatarFileInputRef = useRef(null);

  // Xử lý tải ảnh đại diện từ máy tính (nén Canvas HTML5 chuẩn 400x400 nhẹ ~30KB)
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn định dạng file ảnh hợp lệ (PNG, JPG, WEBP)!', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Dung lượng ảnh tối đa 10MB!', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSide = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSide) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          }
        } else {
          if (height > maxSide) {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setConfig(prev => ({ ...prev, agentAvatar: compressedDataUrl }));
        showToast('Đã tải ảnh đại diện lên! Nhớ bấm "Lưu Thay Đổi Cấu Hình" để áp dụng.', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Tải cấu hình từ API
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/telegram-config');
      const data = await res.json();
      if (data.success) {
        const loadedConfig = data.config || DEFAULT_TELEGRAM_CONFIG;
        if (!Array.isArray(loadedConfig.agentNamesList) || loadedConfig.agentNamesList.length === 0) {
          loadedConfig.agentNamesList = [...SAMPLE_AGENT_NAMES];
        }
        if (loadedConfig.enableRandomAgentName === undefined) {
          loadedConfig.enableRandomAgentName = true;
        }
        setConfig(loadedConfig);
        if (data.suggestedWebhookUrl) setSuggestedWebhookUrl(data.suggestedWebhookUrl);
        if (data.webhookInfo) setWebhookInfo(data.webhookInfo);
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Lỗi tải cấu hình Telegram:', err);
      showToast('Không thể tải cấu hình Telegram!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Lưu cấu hình
  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          config: config
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã lưu cấu hình Live Chat Telegram thành công!', 'success');
        if (data.config) {
          setConfig(data.config);
        }
      } else {
        showToast(data.error || 'Lỗi khi lưu cấu hình!', 'error');
      }
    } catch (err) {
      console.error('Lỗi lưu cấu hình Telegram:', err);
      showToast('Lỗi kết nối máy chủ khi lưu!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Kiểm tra kết nối Telegram
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const res = await fetch('/api/admin/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          botToken: config.botToken,
          chatId: config.chatId
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Kết nối Telegram Bot thành công!', 'success');
      } else {
        showToast(data.error || 'Kiểm tra kết nối thất bại!', 'error');
      }
    } catch (err) {
      showToast('Lỗi khi gửi tin kiểm tra!', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Kích hoạt Webhook với Telegram
  const handleSetWebhook = async () => {
    if (!suggestedWebhookUrl) {
      showToast('Vui lòng kiểm tra lại URL Webhook', 'warning');
      return;
    }

    try {
      setIsSettingWebhook(true);
      const res = await fetch('/api/admin/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-webhook',
          webhookUrl: suggestedWebhookUrl,
          botToken: config.botToken
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Đã kích hoạt Webhook thành công với Telegram!', 'success');
      } else {
        showToast(data.error || 'Lỗi thiết lập Webhook!', 'error');
      }
    } catch (err) {
      showToast('Lỗi khi đăng ký Webhook!', 'error');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-emerald-500 mr-2"></i>
        <span>Đang tải cấu hình Live Chat Telegram...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-sm">
              <i className="fa-brands fa-telegram"></i>
            </span>
            <h3 className="text-base font-black text-white">
              Cấu Hình Live Chat Telegram 2 Chiều
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hệ thống Live Chat tự động thu thập thông tin khách hàng, đẩy tin nhắn lên nhóm Telegram và cho phép nhân viên bấm <strong>Reply</strong> trực tiếp từ Telegram để trả lời khách trên website.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestConnection}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Gửi tin nhắn kiểm tra tới nhóm Telegram"
          >
            <i className={`fa-solid ${isTesting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            <span>{isTesting ? 'Đang gửi...' : 'Test Kết Nối'}</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Config Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Core Telegram Settings */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">

          {/* Nhóm 1: Kết nối Telegram Bot */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-robot text-sky-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  1. Thông Tin Telegram Bot & Nhóm Nhận Tin
                </h4>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  {config.enabled ? 'Đang Bật' : 'Đang Tắt'}
                </span>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                    config.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  title="Bật/Tắt Live Chat"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Telegram Bot Token */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">
                    Telegram Bot Token <span className="text-red-400">*</span>:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <i className={`fa-regular ${showToken ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    <span>{showToken ? 'Ẩn token' : 'Hiện token'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.botToken || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, botToken: e.target.value }))}
                    placeholder="Ví dụ: 7123456789:AAHABCdefGhIJKlmNoPQRstuVWXyz"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-lock text-emerald-400"></i>
                  <span>Lưu trữ mã hóa bảo mật chuẩn <strong>AES-256</strong> trong Cơ sở dữ liệu. Lấy token bằng cách nhắn <code>/newbot</code> cho <strong>@BotFather</strong>.</span>
                </p>
              </div>

              {/* Telegram Chat ID */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Telegram Chat ID / Group ID <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  value={config.chatId || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, chatId: e.target.value }))}
                  placeholder="Ví dụ: -1001234567890 (nhóm) hoặc 987654321 (cá nhân)"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  ID của nhóm hoặc kênh nơi nhân viên CSKH trực. Thêm bot vào nhóm và forward tin nhắn bất kỳ tới <strong>@userinfobot</strong> hoặc <strong>@RawDataBot</strong> để lấy Chat ID.
                </p>
              </div>

              {/* Bot Username */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Username của Bot (không bắt buộc):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={config.botUsername || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, botUsername: e.target.value.replace(/^@/, '') }))}
                    placeholder="DatBienDaNangBot"
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkbox Thông báo Lead mới */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(config.notifyNewLead)}
                    onChange={(e) => setConfig(prev => ({ ...prev, notifyNewLead: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 font-bold text-xs">
                    Tự động gửi thông báo Lead mới khi khách để lại Số điện thoại
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Webhook 2 Chiều */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrows-split-up-and-left text-emerald-400 text-sm"></i>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  2. Cơ Chế 2 Chiều (Webhook Nhận Trả Lời Từ Telegram Về Web)
                </h4>
              </div>

              {/* Webhook Status Badge */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                {webhookInfo?.url ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Webhook Đang Hoạt Động</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Chưa Gán Webhook</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p className="text-slate-400">
                Khi nhân viên bấm <strong>Reply (Trả lời)</strong> tin nhắn của khách trong nhóm Telegram, Telegram Webhook sẽ gọi về địa chỉ dưới đây để đưa nội dung trả lời vào đúng khung chat của khách hàng tương ứng.
              </p>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Đường dẫn Webhook (Webhook URL):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={suggestedWebhookUrl}
                    onChange={(e) => setSuggestedWebhookUrl(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isSettingWebhook}
                    onClick={handleSetWebhook}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Kích hoạt Webhook với máy chủ Telegram"
                  >
                    <i className={`fa-solid ${isSettingWebhook ? 'fa-spinner fa-spin' : 'fa-link'}`}></i>
                    <span>{isSettingWebhook ? 'Đang gán...' : 'Kích Hoạt Webhook'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Lưu ý: Telegram yêu cầu đường dẫn Webhook phải dùng giao thức <strong>HTTPS</strong> an toàn (hỗ trợ hoàn hảo trên Vercel/Cloudflare).
                </p>
              </div>

              {/* Hộp hướng dẫn thao tác cho nhân viên */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs text-amber-300">
                  <i className="fa-solid fa-lightbulb"></i>
                  <span>Quy Trình Phản Hồi 10+ Khách Hàng Đồng Thời Không Nhầm Lẫn:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Khách hàng gửi tin nhắn từ website ➔ Bot tự động đẩy tin vào nhóm Telegram kèm mã <code>#chat_xxxx</code>.</li>
                  <li>Nhân viên chỉ cần bấm <strong>Reply (Trả lời)</strong> vào đúng tin nhắn đó trên ứng dụng Telegram.</li>
                  <li>Hệ thống tự động đọc mã tin nhắn gốc để định tuyến câu trả lời về đúng trình duyệt của khách hàng đó.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Cấu hình Nhân Viên Tư Vấn Trực Tuyến */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <i className="fa-solid fa-headset text-amber-400 text-sm"></i>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                3. Tùy Chỉnh Nhân Viên Tư Vấn Hiển Thị Trên Khung Chat
              </h4>
            </div>

            {/* Avatar Selection & Upload */}
            <div className="space-y-3.5">
              <label className="block text-slate-300 font-bold text-xs">
                Ảnh đại diện chuyên viên (Avatar hiển thị trên khung chat):
              </label>

              {/* Box Avatar hiện tại + Nút Tải lên từ máy tính */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={config.agentAvatar || '/avatars/ai-preset-1.jpg'}
                    alt="Agent Avatar Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md shadow-emerald-950/50"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <span>Ảnh đang sử dụng:</span>
                    <span className="text-emerald-400 font-normal truncate max-w-[200px] text-[11px]">
                      {config.agentAvatar?.startsWith('data:') ? 'Ảnh tải lên từ máy tính' : (config.agentAvatar || 'Mẫu Mặc Định')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {/* Input file ẩn */}
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                    
                    {/* Nút bấm chọn ảnh từ máy */}
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      title="Chọn tệp ảnh từ máy tính hoặc điện thoại"
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      <span>Tải ảnh từ máy tính</span>
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-400 leading-relaxed">
                    Hỗ trợ file PNG, JPG, WEBP. Hệ thống tự động nén tròn chuẩn 400x400 để ảnh sắc nét và tải nhanh tức thì.
                  </p>
                </div>
              </div>

              {/* Thư viện mẫu có sẵn (Preset Gallery) */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-2">
                  Hoặc chọn nhanh từ thư viện mẫu chuyên viên:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Mẫu Nữ 1 (Thanh lịch)', url: '/avatars/ai-preset-1.jpg' },
                    { label: 'Mẫu Nữ 2 (Công sở)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
                    { label: 'Mẫu Nữ 3 (Thân thiện)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
                    { label: 'Mẫu Nam 1 (Trẻ trung)', url: '/avatars/ai-preset-2.jpg' },
                    { label: 'Mẫu Nam 2 (Chuyên nghiệp)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
                    { label: 'Logo Sàn BĐS', url: '/images/logo.png' }
                  ].map((preset, idx) => {
                    const isSelected = config.agentAvatar === preset.url || (!config.agentAvatar && idx === 0);
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, agentAvatar: preset.url }))}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xs ring-1 ring-emerald-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <span className="text-[11px] font-medium truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct URL input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Hoặc dán đường dẫn link ảnh (URL):
                </label>
                <input
                  type="text"
                  value={config.agentAvatar?.startsWith('data:') ? '' : (config.agentAvatar || '')}
                  onChange={(e) => setConfig(prev => ({ ...prev, agentAvatar: e.target.value }))}
                  placeholder={config.agentAvatar?.startsWith('data:') ? '[Đang sử dụng ảnh tùy chỉnh đã tải lên từ máy tính]' : 'Ví dụ: https://domain.com/hinh-anh.jpg'}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* CẤU HÌNH TÊN CHUYÊN VIÊN & DANH SÁCH RANDOM LIÊN TỤC */}
            <div className="space-y-4 pt-1">
              {/* Box Bật / Tắt Chế độ Random liên tục */}
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <i className="fa-solid fa-shuffle text-emerald-400"></i>
                      <span>Chế độ Random tên chuyên viên liên tục:</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      config.enableRandomAgentName !== false
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {config.enableRandomAgentName !== false ? '● ĐANG BẬT' : '○ ĐANG TẮT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tự động chọn ngẫu nhiên một chuyên viên từ danh sách dưới đây cho mỗi khách hàng / phiên chat mới trên website.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, enableRandomAgentName: !(prev.enableRandomAgentName !== false) }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.enableRandomAgentName !== false ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title="Bật/Tắt chế độ chọn ngẫu nhiên tên chuyên viên"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enableRandomAgentName !== false ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Danh sách nhiều tên chuyên viên (Random Pool) */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <i className="fa-solid fa-users text-blue-400"></i>
                      <span>Danh sách nhiều tên chuyên viên tư vấn:</span>
                    </label>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold">
                      {(config.agentNamesList || []).length} tên
                    </span>
                  </div>
                </div>

                {/* Giao diện thẻ Tags trực quan + Input thêm tên */}
                <div className="space-y-3">
                  {/* Thêm tên mới */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <i className="fa-solid fa-user-plus absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                      <input
                        type="text"
                        value={newAgentNameInput}
                        onChange={(e) => setNewAgentNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAgentName();
                          }
                        }}
                        placeholder="Nhập họ tên chuyên viên (VD: Nguyễn Huyền, Trần Bảo Ngọc...)"
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAgentName}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                      <span>Thêm tên</span>
                    </button>
                  </div>

                  {/* Danh sách Tags tên chuyên viên */}
                  <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {(config.agentNamesList || []).length === 0 ? (
                      <div className="text-[11px] text-amber-400/90 italic bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-xl w-full">
                        Chưa có tên nào trong danh sách. Hãy nhập tên ở trên và bấm "Thêm tên".
                      </div>
                    ) : (
                      (config.agentNamesList || []).map((name, idx) => {
                        const isCurrentActive = config.agentName === name;
                        return (
                          <span
                            key={`${name}_${idx}`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                              isCurrentActive
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                                : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <i className="fa-solid fa-user-tie text-[10px] text-slate-400"></i>
                            <button
                              type="button"
                              onClick={() => {
                                setConfig(prev => ({ ...prev, agentName: name }));
                                showToast(`Đã chọn xem trước: ${name}`, 'info');
                              }}
                              className="cursor-pointer hover:underline text-left"
                              title="Bấm để xem trước tên này trên khung chat"
                            >
                              {name}
                            </button>
                            {isCurrentActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Đang xem trước"></span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAgentName(name);
                              }}
                              className="text-slate-500 hover:text-rose-400 ml-1 transition cursor-pointer p-0.5"
                              title="Xóa tên này khỏi danh sách random"
                            >
                              <i className="fa-solid fa-xmark text-[11px]"></i>
                            </button>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Tên hiển thị xem trước / mặc định & Chức danh phụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tên chuyên viên tư vấn:
                  </label>
                  <input
                    type="text"
                    value={config.agentName || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, agentName: e.target.value }))}
                    placeholder="Ví dụ: Nguyễn Huyền"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    {config.enableRandomAgentName !== false
                      ? 'Tên này được hiển thị mẫu khi xem trước hoặc làm tên cố định khi tắt random.'
                      : 'Đang dùng tên cố định này cho toàn bộ khung chat (do đã tắt chế độ random).'}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Chức danh / Tiêu đề phụ:
                  </label>
                  <input
                    type="text"
                    value={config.agentTitle || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, agentTitle: e.target.value }))}
                    placeholder={`Ví dụ: Chuyên Viên Tư Vấn Sàn BĐS`}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Hiển thị ngay dưới tên chuyên viên trên thanh tiêu đề khung chat.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Lời chào mừng mở đầu phiên chat:
                  </label>
                  <textarea
                    rows={2}
                    value={config.welcomeMessage || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Ví dụ: Xin chào quý khách! Tôi có thể hỗ trợ gì cho quý khách?"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW BOX TRỰC QUAN */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <i className="fa-regular fa-eye text-emerald-400"></i>
                <span>Xem trước giao diện trên khung chat website:</span>
              </div>

              <div className="w-full max-w-sm mx-auto bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img
                      src={config.agentAvatar || '/avatars/ai-preset-1.jpg'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span className={`transition-all duration-300 ${previewRandomHighlight ? 'text-emerald-300 scale-105 font-black' : ''}`}>
                        {config.agentName || 'Chuyên Viên Tư Vấn'}
                      </span>
                      <i className="fa-solid fa-circle-check text-blue-400 text-[9px]"></i>
                    </div>
                    {config.agentTitle && (
                      <div className="text-[10px] text-slate-300 font-medium truncate">
                        {config.agentTitle}
                      </div>
                    )}
                    <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Đang trực tuyến • Phản hồi tức thì</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60">
                  <div className="flex items-start gap-1.5 max-w-[90%]">
                    <img
                      src={config.agentAvatar || '/avatars/ai-preset-1.jpg'}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
                    />
                    <div className="bg-white text-slate-800 p-2.5 rounded-2xl rounded-bl-xs text-xs shadow-xs leading-relaxed">
                      {config.welcomeMessage || 'Xin chào quý khách! Tôi là trợ lý tư vấn. Quý khách đang quan tâm đến bất động sản nào cần hỗ trợ nhanh?'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nút Lưu Cài Đặt Dưới Cùng */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <i className="fa-solid fa-cloud-arrow-up text-emerald-400"></i>
              <span>Dữ liệu cấu hình tự động đồng bộ lên Database đám mây (Mã hóa AES-256)</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid ${isTesting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                <span>{isTesting ? 'Đang gửi...' : 'Test Kết Nối'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Column (1 Col): Sessions List & Lead Management */}
        <div className="space-y-6">
          
          {/* Danh sách phiên chat gần đây */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Phiên Chat Gần Đây ({sessions.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={fetchConfig}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
                title="Làm mới danh sách"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Chưa có phiên chat nào từ khách hàng.
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {sessions.map(s => {
                  const msgs = Array.isArray(s.messages) ? s.messages : [];
                  const lastMsg = msgs[msgs.length - 1];
                  return (
                    <div
                      key={s.sessionId}
                      onClick={() => setSelectedSession(s)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedSession?.sessionId === s.sessionId
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <strong className="text-white truncate">
                          {s.customer?.name || 'Khách vãng lai'}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msgs.length} tin
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-emerald-400 mb-1">
                        📞 {s.customer?.phone || 'Chưa SĐT'}
                      </div>

                      {s.propertyContext?.title && (
                        <div className="text-[10px] text-slate-400 truncate mb-1">
                          🏠 {s.propertyContext.title}
                        </div>
                      )}

                      {lastMsg && (
                        <div className="text-[10px] text-slate-400 italic truncate">
                          "{lastMsg.text}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal xem chi tiết phiên chat */}
          {selectedSession && (
            <div className="bg-slate-950 p-5 rounded-3xl border border-emerald-800/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="font-bold text-white text-xs">
                  Chi Tiết Phiên: <code className="text-emerald-400">#{selectedSession.sessionId}</code>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="text-[11px] space-y-1 text-slate-400">
                <div>Khách hàng: <strong className="text-white">{selectedSession.customer?.name}</strong></div>
                <div>SĐT: <strong className="text-emerald-400 font-mono">{selectedSession.customer?.phone}</strong></div>
                {selectedSession.customer?.email && <div>Email: {selectedSession.customer?.email}</div>}
              </div>

              {/* Chat timeline */}
              <div className="max-h-52 overflow-y-auto space-y-2 p-2 bg-slate-900 rounded-xl text-xs">
                {(selectedSession.messages || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg ${
                      m.sender === 'user' ? 'bg-emerald-950 text-emerald-200 border border-emerald-800' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 font-bold mb-0.5">
                      {m.sender === 'user' ? (selectedSession.customer?.name || 'Khách') : (m.staffName || 'Chuyên viên')} • {m.time}
                    </div>
                    <div>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
