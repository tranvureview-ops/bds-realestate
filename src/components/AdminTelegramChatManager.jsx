'use client';

import React, { useState, useEffect } from 'react';
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
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Tải cấu hình từ API
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/telegram-config');
      const data = await res.json();
      if (data.success) {
        setConfig(data.config || DEFAULT_TELEGRAM_CONFIG);
        if (data.suggestedWebhookUrl) setSuggestedWebhookUrl(data.suggestedWebhookUrl);
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
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <i className="fa-solid fa-arrows-split-up-and-left text-emerald-400 text-sm"></i>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                2. Cơ Chế 2 Chiều (Webhook Nhận Trả Lời Từ Telegram Về Web)
              </h4>
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
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <i className="fa-solid fa-headset text-amber-400 text-sm"></i>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                3. Tùy Chỉnh Nhân Viên Tư Vấn Hiển Thị Trên Khung Chat
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tên chuyên viên tư vấn:
                </label>
                <input
                  type="text"
                  value={config.agentName || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Chức danh / Tiêu đề phụ:
                </label>
                <input
                  type="text"
                  value={config.agentTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, agentTitle: e.target.value }))}
                  placeholder="Ví dụ: Chuyên Viên Tư Vấn Đất Biển Đà Nẵng"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">
                  Lời chào mừng mở đầu phiên chat:
                </label>
                <textarea
                  rows={2}
                  value={config.welcomeMessage || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 text-xs"
                />
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

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                <span>{isSaving ? 'Đang lưu hệ thống...' : 'Lưu Thay Đổi Cấu Hình'}</span>
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
