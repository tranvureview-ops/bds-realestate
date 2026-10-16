'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function ToastNotification() {
  const { toast } = useRealEstate();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed top-16 right-5 z-50 animate-in slide-in-from-top duration-300">
      <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 ${
        isSuccess ? 'bg-emerald-900/95 border-emerald-500 text-white' :
        isError ? 'bg-red-900/95 border-red-500 text-white' :
        isWarning ? 'bg-amber-900/95 border-amber-500 text-white' :
        'bg-slate-900/95 border-slate-700 text-white'
      }`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
          isSuccess ? 'bg-emerald-500 text-white' :
          isError ? 'bg-red-500 text-white' :
          isWarning ? 'bg-amber-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <i className={`fa-solid ${
            isSuccess ? 'fa-check' :
            isError ? 'fa-triangle-exclamation' :
            isWarning ? 'fa-circle-exclamation' :
            'fa-info'
          }`}></i>
        </div>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
