'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { formatPhoneNumber } from '../utils/authValidation';

/**
 * LiveChatWidget.jsx
 * Widget Live Chat 2 Chiều tích hợp Telegram Bot
 * - Thu thập thông tin khách hàng (Họ tên, SĐT, Email) khi chưa đăng nhập
 * - Đồng bộ tin nhắn 2 chiều thời gian thực qua Telegram Bot API & Webhook
 * - Nhận diện ngữ cảnh BĐS đang xem (Tiêu đề, Giá, Hình ảnh)
 */

const STORAGE_SESSION_KEY = 'bds_livechat_session_id';
const STORAGE_LEAD_KEY = 'bds_livechat_lead_info';

export default function LiveChatWidget() {
  const { selectedPropertyDetail, currentUser } = useRealEstate();

  const isUserLoggedIn = Boolean(currentUser && currentUser.role !== 'guest' && currentUser.id !== 'guest');

  // Khởi tạo sessionId duy nhất cho mỗi trình duyệt khách hàng
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!saved) {
        saved = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem(STORAGE_SESSION_KEY, saved);
      }
      return saved;
    }
    return 'chat_default';
  });

  // Thông tin khách hàng đã lưu (nếu đã từng điền Form)
  const [customerInfo, setCustomerInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_LEAD_KEY);
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return null;
  });

  // Trạng thái hiển thị widget
  const [isOpen, setIsOpen] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Form thu thập thông tin khách hàng (chưa đăng nhập)
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Danh sách tin nhắn trong phiên
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Xin chào quý khách! Tôi là trợ lý tư vấn Đất Biển Đà Nẵng. Quý khách đang quan tâm đến dự án nào cần hỗ trợ thông tin nhanh?',
      time: 'Vừa xong',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStaffTyping, setIsStaffTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Thông tin nhân viên tư vấn
  const [agentInfo, setAgentInfo] = useState({
    name: 'Nguyễn Văn Tuấn',
    avatar: '/avatars/ai-preset-1.jpg',
    title: 'Chuyên Viên Tư Vấn Đất Biển Đà Nẵng'
  });

  const messagesEndRef = useRef(null);
  const lastTimestampRef = useRef(Date.now() - 3600000); // 1 giờ trước

  // Câu hỏi gợi ý nhanh
  const quickQuestions = useMemo(() => [
    'Bất động sản này còn không?',
    'Giá có thương lượng thêm không?',
    'Cho tôi hẹn lịch xem nhà vào T7 này',
    'Gửi tôi pháp lý sổ đỏ/hồng'
  ], []);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Kiểm tra nếu đã đăng nhập hoặc đã có thông tin khách trong LocalStorage thì cho vào thẳng khung chat
  useEffect(() => {
    if (isUserLoggedIn) {
      setHasStartedChat(true);
      setCustomerInfo({
        name: currentUser.name || 'Thành viên',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      });
    } else if (customerInfo && customerInfo.phone) {
      setHasStartedChat(true);
    }
  }, [isUserLoggedIn, currentUser, customerInfo]);

  // Lấy lịch sử tin nhắn ban đầu từ server khi mở chat
  useEffect(() => {
    if (!sessionId || !hasStartedChat) return;

    fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          const maxTs = Math.max(...data.messages.map(m => m.timestamp || 0), 0);
          if (maxTs > 0) lastTimestampRef.current = maxTs;
        }
        if (data.agentInfo) {
          setAgentInfo(data.agentInfo);
        }
      })
      .catch(console.warn);
  }, [sessionId, hasStartedChat]);

  // Realtime Polling: Kiểm tra tin nhắn trả lời từ nhân viên (Telegram Webhook) mỗi 2.5 giây khi chat đang mở
  useEffect(() => {
    if (!hasStartedChat || !sessionId) return;

    const interval = setInterval(() => {
      fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}&since=${lastTimestampRef.current}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            // Lọc các tin nhắn mới từ agent mà client chưa có
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMsgs = data.messages.filter(m => !existingIds.has(m.id));
              if (newMsgs.length === 0) return prev;

              // Cập nhật timestamp lớn nhất
              const maxTs = Math.max(...newMsgs.map(m => m.timestamp || 0));
              if (maxTs > lastTimestampRef.current) lastTimestampRef.current = maxTs;

              // Nếu khung chat đang đóng thì tăng số thông báo
              if (!isOpen) {
                setUnreadCount(c => c + newMsgs.length);
              }

              // Phát âm thanh ping nhẹ khi có phản hồi từ nhân viên
              try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => {});
              } catch (_) {}

              return [...prev, ...newMsgs];
            });
          }
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(interval);
  }, [hasStartedChat, sessionId, isOpen]);

  // Xử lý gửi Form thu thập thông tin khách hàng
  const handleStartChatSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = leadFormData.name.trim();
    const formattedPhone = formatPhoneNumber(leadFormData.phone);

    if (!trimmedName) {
      setFormError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!formattedPhone || formattedPhone.replace(/\s+/g, '').length < 9) {
      setFormError('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }

    setIsSubmittingForm(true);
    const newCustomer = {
      name: trimmedName,
      phone: formattedPhone,
      email: leadFormData.email.trim()
    };

    try {
      // 1. Lưu vào LocalStorage
      localStorage.setItem(STORAGE_LEAD_KEY, JSON.stringify(newCustomer));
      setCustomerInfo(newCustomer);

      // 2. Gửi thông báo Lead Mới lên Telegram qua API
      const propContext = selectedPropertyDetail ? {
        id: selectedPropertyDetail.id,
        title: selectedPropertyDetail.title,
        priceDisplay: selectedPropertyDetail.priceDisplay?.replace(/Tỷ/g, 'tỷ') || selectedPropertyDetail.priceDisplay,
        slug: selectedPropertyDetail.slug,
        image: selectedPropertyDetail.images?.[0] || null
      } : null;

      await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customer: newCustomer,
          propertyContext: propContext
        })
      });

      // 3. Chuyển sang giao diện Chat chính
      setHasStartedChat(true);
    } catch (err) {
      console.warn('Lỗi đăng ký phiên chat:', err);
      // Vẫn cho phép vào chat
      setHasStartedChat(true);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Xử lý đóng / Hủy khung chat
  const handleCancelChat = () => {
    setIsOpen(false);
    setFormError('');
  };

  // Xử lý gửi tin nhắn từ Web lên Telegram
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    if (!textToSend) setInputValue('');
    setIsSending(true);

    const now = new Date();
    const tempMsg = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      text: text,
      time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, tempMsg]);

    const activeCustomer = customerInfo || (isUserLoggedIn ? {
      name: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email
    } : { name: 'Khách hàng', phone: '' });

    const propContext = selectedPropertyDetail ? {
      id: selectedPropertyDetail.id,
      title: selectedPropertyDetail.title,
      priceDisplay: selectedPropertyDetail.priceDisplay?.replace(/Tỷ/g, 'tỷ') || selectedPropertyDetail.priceDisplay,
      slug: selectedPropertyDetail.slug
    } : null;

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customer: activeCustomer,
          propertyContext: propContext,
          message: text
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        lastTimestampRef.current = data.message.timestamp || Date.now();
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* 1. FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={handleOpenWidget}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all transform border-2 border-white group cursor-pointer"
          title="Live Chat tư vấn BĐS trực tiếp"
        >
          <i className="fa-solid fa-comments text-2xl group-hover:scale-110 transition-transform"></i>
          
          {/* Unread / Notification Ping Badge */}
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black animate-bounce shadow-md">
              {unreadCount}
            </span>
          ) : (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse"></span>
          )}
        </button>
      )}

      {/* 2. CHAT MODAL WINDOW */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom duration-250">
          
          {/* HEADER: Chuyên viên tư vấn & Nút thu nhỏ */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={agentInfo.avatar || '/avatars/ai-preset-1.jpg'}
                  alt={agentInfo.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold leading-tight truncate flex items-center gap-1.5">
                  <span>{agentInfo.name || 'Nguyễn Văn Tuấn'}</span>
                  <i className="fa-solid fa-circle-check text-blue-400 text-[10px]" title="Chuyên viên chính thức sàn BĐS"></i>
                </h4>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Đang trực tuyến • Phản hồi trong 1 phút</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCancelChat}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer shrink-0"
              title="Thu nhỏ khung chat"
            >
              <i className="fa-solid fa-minus"></i>
            </button>
          </div>

          {/* Context BĐS đang xem (nếu có) */}
          {selectedPropertyDetail && (
            <div className="bg-emerald-50/90 border-b border-emerald-100 px-3 py-2 flex items-center gap-2.5 text-xs">
              <img
                src={selectedPropertyDetail.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
                alt=""
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-emerald-200"
              />
              <div className="truncate flex-1">
                <div className="text-[10px] font-bold text-slate-900 truncate">
                  Đang hỏi về: {selectedPropertyDetail.title}
                </div>
                <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
                  <span>{selectedPropertyDetail.priceDisplay?.replace(/Tỷ/g, 'tỷ') || selectedPropertyDetail.priceDisplay}</span>
                  {selectedPropertyDetail.area && <span className="text-[10px] text-slate-500 font-normal">• {selectedPropertyDetail.area} m²</span>}
                </div>
              </div>
            </div>
          )}

          {/* NỘI DUNG 1: FORM THU THẬP THÔNG TIN (Dành cho khách chưa đăng nhập và chưa để lại thông tin) */}
          {!hasStartedChat ? (
            <div className="flex-1 p-5 overflow-y-auto bg-slate-50 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl shadow-xs">
                    <i className="fa-solid fa-user-pen"></i>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Bắt Đầu Trò Chuyện Trực Tuyến
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Vui lòng cung cấp thông tin liên hệ để chuyên viên hỗ trợ kết nối và gửi thông tin nhanh nhất cho bạn.
                  </p>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                    <span>{formError}</span>
                  </div>
                )}

                <form id="lead-chat-form" onSubmit={handleStartChatSubmit} className="space-y-3">
                  {/* Họ và tên */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-xs">
                      Tên đầy đủ <span className="text-red-500">*</span>:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                        <i className="fa-regular fa-user"></i>
                      </span>
                      <input
                        type="text"
                        required
                        value={leadFormData.name}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ví dụ: Nguyễn Văn Tuấn"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-xs">
                      Số điện thoại (Gọi / Zalo) <span className="text-red-500">*</span>:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                        <i className="fa-solid fa-phone"></i>
                      </span>
                      <input
                        type="tel"
                        required
                        value={leadFormData.phone}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: e.target.value }))}
                        onBlur={(e) => {
                          if (e.target.value) {
                            setLeadFormData(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }));
                          }
                        }}
                        placeholder="Ví dụ: 0898 256 607"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Định dạng chuẩn: 0898 256 607</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-xs">
                      Email liên hệ <span className="text-slate-400 font-normal">(Tùy chọn)</span>:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                        <i className="fa-regular fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Ví dụ: tuannv@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* NÚT THAO TÁC: Bắt đầu chat & Cancel */}
              <div className="pt-4 border-t border-slate-200 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelChat}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                >
                  Cancel (Đóng)
                </button>

                <button
                  type="submit"
                  form="lead-chat-form"
                  disabled={isSubmittingForm}
                  className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <i className={`fa-solid ${isSubmittingForm ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                  <span>{isSubmittingForm ? 'Đang kết nối...' : 'Bắt đầu chat'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* NỘI DUNG 2: KHUNG CHAT 2 CHIỀU CHÍNH (Đã có Lead info / Đã đăng nhập) */
            <>
              {/* Messages Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {/* Thông tin định danh khách hàng nhỏ ở đầu */}
                <div className="text-center">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-medium">
                    Phiên tư vấn: <strong className="text-slate-900">{customerInfo?.name || currentUser?.name || 'Khách hàng'}</strong> ({customerInfo?.phone || currentUser?.phone || 'Chưa SĐT'})
                  </span>
                </div>

                {messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[86%]">
                        {!isUser && (
                          <img
                            src={agentInfo.avatar || '/avatars/ai-preset-1.jpg'}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 mb-1"
                          />
                        )}
                        <div
                          className={`p-3 rounded-2xl leading-relaxed text-xs ${
                            isUser
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/90 shadow-xs'
                          }`}
                        >
                          {!isUser && msg.staffName && (
                            <div className="text-[10px] font-bold text-emerald-700 mb-0.5">
                              {msg.staffName}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                        {msg.time || 'Vừa xong'}
                      </span>
                    </div>
                  );
                })}

                {isStaffTyping && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2 bg-white rounded-xl w-24 border border-slate-200 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-2.5 py-1.5 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-medium rounded-full whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập nội dung cần tư vấn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-medium"
                />
                <button
                  type="button"
                  disabled={isSending || !inputValue.trim()}
                  onClick={() => handleSendMessage()}
                  className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center text-xs transition shadow-sm cursor-pointer shrink-0"
                  title="Gửi tin nhắn"
                >
                  <i className={`fa-solid ${isSending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
