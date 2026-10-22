'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function LiveChatWidget() {
  const { selectedPropertyDetail } = useRealEstate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: 'Xin chào quý khách! Tôi là trợ lý tư vấn Đất Biển Đà Nẵng. Quý khách đang quan tâm đến dự án nào cần hỗ trợ thông tin nhanh?',
      time: 'Vừa xong'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const QUICK_QUESTIONS = [
    'Bất động sản này còn không?',
    'Giá có thương lượng thêm không?',
    'Cho tôi hẹn lịch xem nhà vào T7 này',
    'Gửi tôi pháp lý sổ đỏ/hồng'
  ];

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: 'Bây giờ'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate smart agent response
    setIsTyping(true);
    setTimeout(() => {
      let replyText = 'Cảm ơn quý khách đã quan tâm! Môi giới phụ trách khu vực này đã nhận được thông tin và sẽ gọi điện/nhắn Zalo hỗ trợ anh/chị ngay.';
      if (text.includes('còn không')) {
        replyText = 'Dạ bất động sản này hiện VẪN CÒN và đang có sổ đỏ sẵn sàng công chứng. Anh/chị cho em xin số điện thoại để gửi vị trí chi tiết nhé!';
      } else if (text.includes('thương lượng')) {
        replyText = 'Dạ chủ nhà đang rất thiện chí bán, có bớt lộc và thương lượng trực tiếp khi anh/chị đến xem nhà thực tế ạ.';
      } else if (text.includes('xem nhà')) {
        replyText = 'Dạ vâng, bên em sẽ sắp xếp xe và chuyên viên đón anh/chị vào thứ 7 này nhé. Em đã lưu lịch hẹn!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: replyText,
          time: 'Bây giờ'
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-2xl hover:scale-110 active:scale-95 transition transform border-2 border-white group"
          title="Chat trực tuyến với môi giới"
        >
          <i className="fa-solid fa-comments"></i>
          {/* Notification Ping Badge */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black animate-pulse">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom duration-300">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/avatars/ai-preset-1.jpg"
                  alt="Agent"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  {selectedPropertyDetail?.author?.name || 'Chuyên Viên Tư Vấn Đất Biển Đà Nẵng'}
                </h4>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Đang trực tuyến • Phản hồi trong 1 phút
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition"
            >
              <i className="fa-solid fa-minus"></i>
            </button>
          </div>

          {/* Current Property Context Banner (if viewing a property) */}
          {selectedPropertyDetail && (
            <div className="bg-emerald-50 border-b border-emerald-100 p-2 flex items-center gap-2 text-xs">
              <img
                src={selectedPropertyDetail.images[0]}
                alt=""
                className="w-8 h-8 rounded object-cover shrink-0"
              />
              <div className="truncate">
                <div className="text-[10px] font-bold text-emerald-900 truncate">
                  Đang hỏi về: {selectedPropertyDetail.title}
                </div>
                <div className="text-[10px] text-emerald-700 font-extrabold">
                  {selectedPropertyDetail.priceDisplay}
                </div>
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs p-2 bg-white rounded-xl w-24 border border-slate-200">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-full whitespace-nowrap transition"
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
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs transition shadow-sm"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
