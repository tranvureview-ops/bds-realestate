'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function ToastNotification() {
  const { toast, dismissToast } = useRealEstate();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div 
      className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-max max-w-[92vw] sm:max-w-xl flex justify-center animate-in fade-in slide-in-from-top-3 duration-200"
      role="status"
      aria-live="polite"
    >
      <div 
        style={{ backgroundColor: '#0f172a' }}
        className={`pointer-events-auto flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 text-xs sm:text-[13px] font-bold tracking-wide transition-all select-none text-white !bg-[#0f172a] ${
          isSuccess 
            ? 'border-emerald-500 shadow-emerald-950/50 ring-2 ring-emerald-500/20' 
            : isError 
            ? 'border-rose-500 shadow-rose-950/50 ring-2 ring-rose-500/20' 
            : isWarning 
            ? 'border-amber-400 shadow-amber-950/50 ring-2 ring-amber-400/20' 
            : 'border-sky-400 shadow-sky-950/50 ring-2 ring-sky-400/20'
        }`}
      >
        {/* Compact Icon */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-black shadow-xs ${
          isSuccess 
            ? 'bg-emerald-500 text-slate-950' 
            : isError 
            ? 'bg-rose-500 text-white' 
            : isWarning 
            ? 'bg-amber-400 text-slate-950' 
            : 'bg-sky-400 text-slate-950'
        }`}>
          <i className={`fa-solid ${
            isSuccess 
              ? 'fa-check' 
              : isError 
              ? 'fa-xmark' 
              : isWarning 
              ? 'fa-exclamation' 
              : 'fa-info'
          }`}></i>
        </div>

        {/* Message Text */}
        <span className="line-clamp-2 leading-tight text-white font-bold drop-shadow-xs">
          {toast.message}
        </span>

        {/* Quick Close Button */}
        <button
          type="button"
          onClick={dismissToast}
          className="ml-1 -mr-1 w-5 h-5 rounded-full hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition cursor-pointer shrink-0"
          title="Đóng thông báo"
          aria-label="Đóng thông báo"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
