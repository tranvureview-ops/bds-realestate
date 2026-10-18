'use client';

import React, { useState, useEffect } from 'react';
import AdminBackendPage from '../components/AdminBackendPage';
import AdminTwoFactorScreen from '../components/AdminTwoFactorScreen';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter } from '../router/RouterContext';

export function getAdminRedirectPath() {
  if (typeof window === 'undefined') return '/dang-nhap?redirect=/admin';
  const target = `/admin${window.location.hash || ''}`;
  return `/dang-nhap?redirect=${encodeURIComponent(target)}`;
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-400">Đang xác thực bảo mật phân quyền CMS...</p>
    </div>
  );
}

export function ForbiddenSessionInfo({ currentUser }) {
  return (
    <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 text-left text-xs mb-5">
      <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
        Phiên làm việc hiện tại:
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs">
          <i className="fa-solid fa-user" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-200 truncate">{currentUser?.name || 'Khách vãng lai'}</div>
          <div className="text-[10px] text-amber-400 font-medium">
            Vai trò: {currentUser?.roleName || currentUser?.role || 'Chưa đăng nhập'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CountdownNotice({ countdown }) {
  return (
    <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-center gap-2">
      <i className="fa-solid fa-clock-rotate-left text-red-400" />
      <span>Tự động chuyển hướng sau <strong className="text-red-400 font-bold">{countdown}s</strong>...</span>
    </div>
  );
}

export function ForbiddenActions({ countdown, onLogin, onHome }) {
  return (
    <div className="space-y-2.5">
      <CountdownNotice countdown={countdown} />
      <button
        onClick={onLogin}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <i className="fa-solid fa-right-to-bracket" />
        <span>Đến Trang Đăng Nhập Admin</span>
      </button>
      <button
        onClick={onHome}
        className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
      >
        <i className="fa-solid fa-house" />
        <span>Quay Về Trang Chủ</span>
      </button>
    </div>
  );
}

export function ForbiddenScreen({ currentUser, countdown, onLogin, onHome }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-red-500/10">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <div className="inline-block text-[10px] uppercase font-mono tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/50 mb-3">
          <i className="fa-solid fa-lock mr-1.5" /> 403 FORBIDDEN • BẢO MẬT HỆ THỐNG
        </div>
        <h1 className="text-xl font-black text-white mb-2">Khu Vực Quản Trị Hệ Thống Được Bảo Vệ</h1>
        <p className="text-xs text-slate-400 leading-relaxed mb-5">
          Trang CMS dành riêng cho tài khoản <strong>Quản Trị Viên (Admin)</strong>. Bạn cần đăng nhập với tài khoản có thẩm quyền để truy cập.
        </p>
        <ForbiddenSessionInfo currentUser={currentUser} />
        <ForbiddenActions countdown={countdown} onLogin={onLogin} onHome={onHome} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { currentUser, isHydrated } = useRealEstate();
  const { navigate } = useRouter();
  const [countdown, setCountdown] = useState(5);
  const isAdmin = isHydrated && currentUser?.role === 'admin';

  // Kiểm tra xem phiên làm việc hiện tại của Admin đã xác thực 2FA Google Authenticator chưa
  const [is2faVerified, setIs2faVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('bds_admin_2fa_verified') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isHydrated || currentUser?.role === 'admin') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(getAdminRedirectPath());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isHydrated, currentUser?.role, navigate]);

  if (!isHydrated) return <LoadingScreen />;
  if (!isAdmin) {
    return (
      <ForbiddenScreen
        currentUser={currentUser}
        countdown={countdown}
        onLogin={() => navigate(getAdminRedirectPath())}
        onHome={() => navigate('/')}
      />
    );
  }

  // Nếu tài khoản là Admin nhưng chưa hoàn thành xác thực 2FA trong phiên này
  if (!is2faVerified) {
    return (
      <AdminTwoFactorScreen
        adminUser={currentUser}
        onSuccess={() => {
          setIs2faVerified(true);
        }}
        onCancel={() => navigate('/')}
      />
    );
  }

  return <div className="min-h-screen bg-slate-900 text-slate-100 antialiased"><AdminBackendPage /></div>;
}
