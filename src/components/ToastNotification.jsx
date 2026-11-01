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
        className={`pointer-events-auto flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl backdrop-blur-md border text-xs sm:text-[13px] font-semibold tracking-wide transition-all select-none ${
          isSuccess 
            ? 'bg-slate-950/92 border-emerald-500/60 text-emerald-100 shadow-emerald-950/40 ring-1 ring-emerald-500/20' 
            : isError 
            ? 'bg-slate-950/92 border-rose-500/60 text-rose-100 shadow-rose-950/40 ring-1 ring-rose-500/20' 
            : isWarning 
            ? 'bg-slate-950/92 border-amber-500/60 text-amber-100 shadow-amber-950/40 ring-1 ring-amber-500/20' 
            : 'bg-slate-950/92 border-sky-500/60 text-sky-100 shadow-slate-950/40 ring-1 ring-sky-500/20'
        }`}
      >
        {/* Compact Icon */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
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
        <span className="line-clamp-2 leading-tight">
          {toast.message}
        </span>

        {/* Quick Close Button */}
        <button
          type="button"
          onClick={dismissToast}
          className="ml-1 -mr-1 w-5 h-5 rounded-full hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center text-[11px] transition cursor-pointer shrink-0"
          title="Đóng thông báo"
          aria-label="Đóng thông báo"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
