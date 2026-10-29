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
  const { selectedPropertyDetail, currentUser, systemConfig } = useRealEstate();

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
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'agent',
      text: `Xin chào quý khách! Tôi là trợ lý tư vấn ${systemConfig?.brandShortName || 'Sàn Bất Động Sản'}. Quý khách đang quan tâm đến dự án nào cần hỗ trợ thông tin nhanh?`,
      time: 'Vừa xong',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStaffTyping, setIsStaffTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Trạng thái phiên chat kết thúc do quá hạn 10 phút không tương tác
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [sessionEndNotice, setSessionEndNotice] = useState('');

  // Thông tin nhân viên tư vấn
  const [agentInfo, setAgentInfo] = useState({
    name: 'Nguyễn Huyền',
    avatar: '/avatars/ai-preset-1.jpg',
    title: 'Tư Vấn Viên'
  });

  const messagesEndRef = useRef(null);
  const lastTimestampRef = useRef(Date.now() - 3600000); // 1 giờ trước
  const isSendingRef = useRef(false);

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
    if (isUserLoggedIn && currentUser) {
      setHasStartedChat(true);
      setCustomerInfo(prev => {
        if (
          prev &&
          prev.name === (currentUser.name || 'Thành viên') &&
          prev.phone === (currentUser.phone || '') &&
          prev.email === (currentUser.email || '')
        ) {
          return prev;
        }
        return {
          name: currentUser.name || 'Thành viên',
          phone: currentUser.phone || '',
          email: currentUser.email || ''
        };
      });
    } else if (customerInfo && customerInfo.phone) {
      setHasStartedChat(true);
    }
  }, [isUserLoggedIn, currentUser?.name, currentUser?.phone, currentUser?.email]);

  // Lấy cấu hình chuyên viên tư vấn & lịch sử tin nhắn từ server
  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) return;

        // Nếu phiên chat đã bị kết thúc và xóa dữ liệu do quá hạn 10 phút
        if (data.sessionEnded) {
          setIsSessionEnded(true);
          setSessionEndNotice(data.timeoutMessage || 'Phiên tư vấn đã kết thúc do không nhận được phản hồi sau 10 phút. Toàn bộ dữ liệu của phiên chat đã được tự động xóa.');
          localStorage.removeItem(STORAGE_SESSION_KEY);
          localStorage.removeItem(STORAGE_LEAD_KEY);
          setMessages([]);
          return;
        }

        // Cập nhật thông tin nhân viên theo cấu hình Admin mới nhất
        if (data.agentInfo) {
          setAgentInfo(prev => ({
            ...prev,
            ...data.agentInfo
          }));
        }

        const activeWelcome = data.welcomeMessage || 'Xin chào quý khách! Tôi là trợ lý tư vấn. Quý khách đang quan tâm đến bất động sản nào cần hỗ trợ nhanh?';

        // Cập nhật tin nhắn trong phiên
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Luôn đồng bộ lời chào mừng mới nhất vào bong bóng tin nhắn đầu tiên nếu là lời chào
          const updated = data.messages.map((m, idx) => {
            if (idx === 0 && (m.id === 'welcome' || m.id === 'msg_welcome' || m.sender === 'agent')) {
              return { ...m, text: activeWelcome };
            }
            return m;
          });
          setMessages(updated);
          const maxTs = Math.max(...updated.map(m => m.timestamp || 0), 0);
          if (maxTs > 0) lastTimestampRef.current = maxTs;
        } else {
          setMessages([
            {
              id: 'msg_welcome',
              sender: 'agent',
              text: activeWelcome,
              time: 'Vừa xong',
              timestamp: Date.now()
            }
          ]);
        }
      })
      .catch(console.warn);
  }, [sessionId, hasStartedChat]);

  // Realtime Polling: Kiểm tra tin nhắn trả lời từ nhân viên (Telegram Webhook) mỗi 2.5 giây khi chat đang mở
  useEffect(() => {
    if (!isOpen || !hasStartedChat || !sessionId || isSessionEnded) return;

    const interval = setInterval(() => {
      fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.success) return;

          // Nếu server thông báo phiên chat đã kết thúc do quá hạn 10 phút không phản hồi
          if (data.sessionEnded) {
            setIsSessionEnded(true);
            setSessionEndNotice(data.timeoutMessage || 'Phiên tư vấn đã kết thúc do không nhận được phản hồi sau 10 phút. Toàn bộ dữ liệu của phiên chat đã được tự động xóa.');
            localStorage.removeItem(STORAGE_SESSION_KEY);
            localStorage.removeItem(STORAGE_LEAD_KEY);
            setMessages([]);
            return;
          }

          if (Array.isArray(data.messages)) {
            setMessages(prev => {
              // Kiểm tra xem có tin nhắn mới nào từ agent không
              const prevIds = new Set(prev.map(m => m.id));
              const newAgentMsgs = data.messages.filter(m => m.sender === 'agent' && !prevIds.has(m.id));

              // Nếu có tin nhắn mới từ agent
              if (newAgentMsgs.length > 0) {
                // Nếu khung chat đang đóng thì tăng số thông báo
                if (!isOpen) {
                  setUnreadCount(c => c + newAgentMsgs.length);
                }

                // Phát âm thanh ping nhẹ khi có phản hồi từ nhân viên
                try {
                  const audio = new Audio('/sounds/notification.mp3');
                  audio.play().catch(() => {});
                } catch (_) {}
              }

              // Lọc các tin tạm đang chờ xác nhận từ server
              const pendingTemps = prev.filter(m => m.id?.startsWith('temp_'));
              const serverTexts = new Set(data.messages.map(m => m.text));
              const serverIds = new Set(data.messages.map(m => m.id));

              // Chỉ giữ tin tạm nếu server chưa có ID này và chưa có nội dung text này
              const remainingTemps = pendingTemps.filter(t => !serverIds.has(t.id) && !serverTexts.has(t.text));

              const unifiedList = [...data.messages, ...remainingTemps];

              // Tránh re-render nếu mảng không đổi
              if (
                prev.length === unifiedList.length &&
                prev.every((m, idx) => m.id === unifiedList[idx].id && m.text === unifiedList[idx].text)
              ) {
                return prev;
              }

              return unifiedList;
            });
          }
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(interval);
  }, [hasStartedChat, sessionId, isOpen, isSessionEnded]);

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

    // Sinh sessionId mới tinh cho phiên này để cách ly hoàn toàn với các phiên cũ
    const freshSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
    setSessionId(freshSessionId);

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
          sessionId: freshSessionId,
          customer: newCustomer,
          agentName: agentInfo.name,
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

  // Bắt đầu một phiên tư vấn mới (Xóa sạch session cũ để test hoặc chuyển khách)
  const handleResetChat = () => {
    if (typeof window !== 'undefined') {
      const confirmReset = window.confirm('Bạn có muốn bắt đầu một phiên chat tư vấn mới không?');
      if (!confirmReset) return;

      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_LEAD_KEY);
      const freshSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
      setSessionId(freshSessionId);
      setIsSessionEnded(false);
      setSessionEndNotice('');
      setCustomerInfo(null);
      setLeadFormData({ name: '', phone: '', email: '' });
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'agent',
          text: 'Xin chào quý khách! Tôi là trợ lý tư vấn. Quý khách đang quan tâm đến bất động sản nào cần hỗ trợ nhanh?',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }),
          timestamp: Date.now()
        }
      ]);
      setHasStartedChat(false);
    }
  };

  // Kiểm tra thời gian 10 phút sau phản hồi cuối cùng của tư vấn viên
  useEffect(() => {
    if (!hasStartedChat || isSessionEnded) return;

    const checkTimeoutTimer = setInterval(() => {
      const hasUserMsg = messages.some(m => m.sender === 'user');
      const lastMsg = messages[messages.length - 1];

      // Điều kiện: khách đã từng nhắn, tin nhắn cuối cùng là từ agent
      if (hasUserMsg && lastMsg && lastMsg.sender === 'agent') {
        const elapsed = Date.now() - (lastMsg.timestamp || 0);
        if (elapsed >= 10 * 60 * 1000) {
          // Đã quá 10 phút: kích hoạt kiểm tra và xóa phiên trên server
          fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`)
            .then(res => res.json())
            .then(data => {
              if (data.sessionEnded) {
                setIsSessionEnded(true);
                setSessionEndNotice(data.timeoutMessage || 'Phiên tư vấn đã kết thúc do không nhận được phản hồi sau 10 phút. Toàn bộ dữ liệu của phiên chat đã được tự động xóa.');
                localStorage.removeItem(STORAGE_SESSION_KEY);
                localStorage.removeItem(STORAGE_LEAD_KEY);
                setMessages([]);
              }
            })
            .catch(() => {});
        }
      }
    }, 10000); // Quét kiểm tra mỗi 10 giây

    return () => clearInterval(checkTimeoutTimer);
  }, [hasStartedChat, isSessionEnded, messages, sessionId]);

  // Bắt đầu phiên tư vấn mới sau khi phiên cũ đã kết thúc do quá hạn 10 phút
  const handleStartNewSessionAfterEnd = () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_LEAD_KEY);
    const freshSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
    setSessionId(freshSessionId);
    setIsSessionEnded(false);
    setSessionEndNotice('');
    setCustomerInfo(null);
    setLeadFormData({ name: '', phone: '', email: '' });
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'agent',
        text: agentInfo.welcomeMessage || 'Xin chào quý khách! Tôi là trợ lý tư vấn. Quý khách đang quan tâm đến bất động sản nào cần hỗ trợ nhanh?',
        time: 'Vừa xong',
        timestamp: Date.now()
      }
    ]);
    if (!isUserLoggedIn) {
      setHasStartedChat(false);
    } else {
      setHasStartedChat(true);
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
    if (!text || isSendingRef.current) return;

    isSendingRef.current = true;
    setIsSending(true);
    if (!textToSend) setInputValue('');

    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tempMsg = {
      id: tempId,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      }),
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
        // Thay thế ngay lập tức tin tạm tempMsg bằng tin nhắn server trả về
        setMessages(prev => prev.map(m => (m.id === tempId ? data.message : m)));
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleOpenWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <div className={`fixed z-50 select-none ${
      isOpen 
        ? 'inset-x-0 bottom-0 sm:bottom-5 sm:right-5 sm:left-auto flex justify-center sm:block' 
        : 'bottom-[4.25rem] sm:bottom-6 right-3 sm:right-6'
    }`}>
      {/* 1. FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <>
          {/* Mobile: Sleek Floating Concierge Pill (Gọn gàng, sang trọng, bo viền ngọc lục bảo) */}
          <button
            onClick={handleOpenWidget}
            className="sm:hidden flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-white/95 text-slate-800 shadow-[0_8px_25px_rgba(0,0,0,0.12)] border border-slate-200/90 backdrop-blur-md active:scale-95 transition-all cursor-pointer group"
            title="Chat tư vấn trực tiếp"
          >
            <div className="relative shrink-0">
              <img
                src={agentInfo.avatar || '/avatars/ai-preset-1.jpg'}
                alt="Tư vấn"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              </span>
            </div>
            <div className="text-left leading-none pr-0.5">
              <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                <span>Chat tư vấn</span>
                <i className="fa-solid fa-comment-dots text-emerald-600 text-[10px]"></i>
              </div>
              <div className="text-[8.5px] text-emerald-600 font-semibold mt-0.5">
                Online 24/7
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Desktop: Luxury Floating Concierge Button */}
          <button
            onClick={handleOpenWidget}
            className="hidden sm:flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md group"
            title="Live Chat tư vấn BĐS trực tiếp"
          >
            <div className="relative shrink-0">
              <img
                src={agentInfo.avatar || '/avatars/ai-preset-1.jpg'}
                alt="Chuyên viên tư vấn"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              </span>
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition flex items-center gap-1.5">
                <span>Tư vấn BĐS 24/7</span>
                <i className="fa-solid fa-comment-dots text-emerald-600 text-xs"></i>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                {agentInfo.name} • <span className="text-emerald-600 font-bold">Online</span>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-bounce shadow">
                {unreadCount}
              </span>
            )}
          </button>
        </>
      )}

      {/* 2. CHAT MODAL WINDOW */}
      {isOpen && (
        <div className="w-full sm:w-[385px] max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col h-[85dvh] sm:h-[540px] max-h-[640px] animate-in slide-in-from-bottom duration-250">
          {/* Mobile Handle Indicator */}
          <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto my-1.5 shrink-0"></div>

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
                  <span>{agentInfo.name || 'Chuyên Viên Tư Vấn'}</span>
                  <i className="fa-solid fa-circle-check text-blue-400 text-[10px]" title="Chuyên viên chính thức sàn BĐS"></i>
                </h4>
                {agentInfo.title && (
                  <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                    {agentInfo.title}
                  </div>
                )}
                <div className="text-[9.5px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Đang trực tuyến • Phản hồi tức thì</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                title="Bắt đầu phiên tư vấn mới"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
              <button
                onClick={handleCancelChat}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                title="Đóng khung chat"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>

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
                        placeholder="Nhập họ và tên..."
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
                {/* Thông báo kết thúc phiên khi quá 10 phút sau câu trả lời của chuyên viên */}
                {isSessionEnded && (
                  <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl text-amber-900 text-xs space-y-2.5 text-center animate-in fade-in duration-300 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-base shadow-xs">
                      <i className="fa-solid fa-hourglass-end"></i>
                    </div>
                    <div>
                      <div className="font-black text-xs text-amber-950 uppercase tracking-wide">
                        Phiên Tư Vấn Đã Kết Thúc
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-1">
                        {sessionEndNotice || 'Do không nhận được phản hồi sau 10 phút kể từ câu trả lời của tư vấn viên, phiên chat đã tự động kết thúc và dữ liệu đã được xóa.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartNewSessionAfterEnd}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                      <span>Bắt đầu cuộc trò chuyện mới</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              {isSessionEnded ? (
                <div className="p-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 text-[11px] italic font-medium flex items-center gap-1.5">
                    <i className="fa-regular fa-clock text-amber-600"></i>
                    <span>Phiên chat đã kết thúc sau 10 phút</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleStartNewSessionAfterEnd}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-rotate-right"></i>
                    <span>Chat mới</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập nội dung cần tư vấn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isSending && inputValue.trim()) {
                          handleSendMessage();
                        }
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
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
}
