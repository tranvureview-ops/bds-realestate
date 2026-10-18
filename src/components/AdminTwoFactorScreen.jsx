'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * Component Xác Thực & Kích Hoạt 2FA Google Authenticator cho Quản Trị Viên
 */
export default function AdminTwoFactorScreen({
  adminUser,
  onSuccess,
  onCancel,
  initialMode = null // 'setup' | 'verify' | null (tự động phát hiện)
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Dữ liệu 2FA từ server
  const [twoFactorData, setTwoFactorData] = useState({
    twoFactorEnabled: false,
    secret: '',
    formattedSecret: '',
    qrCodeUrl: '',
    email: adminUser?.email || 'admin@datbiendanang.vn'
  });

  // Chế độ hiện tại: 'setup' (kích hoạt lần đầu) hoặc 'verify' (đã có secret, chỉ cần nhập mã)
  const [mode, setMode] = useState(initialMode || 'verify');

  // Ô nhập mã 6 chữ số
  const [otpCode, setOtpCode] = useState('');
  const inputRef = useRef(null);

  // Tải thông tin 2FA của Admin từ server
  const fetch2FAInfo = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/auth/2fa?userId=${encodeURIComponent(adminUser?.id || 'admin-01')}`);
      const data = await res.json();
      if (data.success) {
        setTwoFactorData(data);
        if (initialMode) {
          setMode(initialMode);
        } else {
          // Nếu chưa kích hoạt thì vào thẳng setup, nếu đã kích hoạt thì vào verify
          setMode(data.twoFactorEnabled ? 'verify' : 'setup');
        }
      } else {
        setErrorMsg(data.message || 'Không thể tải thông tin 2FA');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối máy chủ khi tải 2FA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch2FAInfo();
  }, [adminUser?.id]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, mode]);

  // Xử lý sao chép Secret Key
  const handleCopySecret = () => {
    if (!twoFactorData.secret) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(twoFactorData.secret);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Reset / Tạo mã QR mới
  const handleReset2FA = async () => {
    if (!window.confirm('Bạn có chắc muốn tạo mới mã QR bí mật cho Google Authenticator?')) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          userId: adminUser?.id || 'admin-01'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorData(prev => ({
          ...prev,
          twoFactorEnabled: false,
          secret: data.secret,
          formattedSecret: data.formattedSecret,
          qrCodeUrl: data.qrCodeUrl
        }));
        setMode('setup');
        setOtpCode('');
      } else {
        setErrorMsg(data.message || 'Không thể đặt lại 2FA');
      }
    } catch (err) {
      setErrorMsg('Lỗi khi đặt lại 2FA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Submit mã OTP 6 số
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = otpCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setErrorMsg('Vui lòng nhập đúng 6 chữ số từ Google Authenticator!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const action = mode === 'setup' ? 'verify-setup' : 'validate';
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: adminUser?.id || 'admin-01',
          token: cleanCode,
          secret: twoFactorData.secret
        })
      });
      const data = await res.json();

      if (data.success) {
        // Lưu cờ xác thực vào sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bds_admin_2fa_verified', 'true');
          sessionStorage.setItem('bds_admin_2fa_time', Date.now().toString());
        }
        if (onSuccess) onSuccess(data);
      } else {
        setErrorMsg(data.message || 'Mã xác thực không hợp lệ. Vui lòng thử lại!');
        setOtpCode('');
        if (inputRef.current) inputRef.current.focus();
      }
    } catch (err) {
      setErrorMsg('Lỗi mạng khi xác thực: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Tự động submit khi nhập đủ 6 chữ số
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(val);
    if (errorMsg) setErrorMsg('');
    if (val.length === 6) {
      setTimeout(() => {
        const form = document.getElementById('two-factor-form');
        if (form) form.requestSubmit();
      }, 50);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-400">Đang khởi tạo mã bảo mật Google Authenticator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-teal-600/10 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20 font-black">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <i className="fa-brands fa-google"></i>
            <span>Google Authenticator (2FA)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'setup' ? 'Kích Hoạt Xác Thực 2 Bước (2FA)' : 'Xác Thực Danh Tính Quản Trị'}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {mode === 'setup'
              ? 'Tài khoản Quản Trị Viên (Admin) bắt buộc phải liên kết với Google Authenticator để bảo vệ hệ thống CMS.'
              : 'Vui lòng nhập mã 6 chữ số từ ứng dụng Google Authenticator trên điện thoại của bạn.'}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
            <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm mt-0.5 shrink-0"></i>
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* === CHẾ ĐỘ 1: KÍCH HOẠT LẦN ĐẦU (SETUP) === */}
        {mode === 'setup' && (
          <div className="space-y-5">
            {/* Bước 1 & 2 Hướng dẫn */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                <span>Mở ứng dụng Google Authenticator và Quét mã QR:</span>
              </div>

              {/* Mã QR Code */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-3 bg-white rounded-2xl shadow-xl inline-block border-2 border-emerald-500/30">
                  <img
                    src={twoFactorData.qrCodeUrl}
                    alt="Mã QR Google Authenticator"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
                  <i className="fa-solid fa-camera text-emerald-400"></i>
                  Quét bằng camera điện thoại trong ứng dụng
                </span>
              </div>

              {/* Nhập khóa bí mật thủ công */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>Không quét được? Nhập khóa thủ công:</span>
                  {copySuccess && (
                    <span className="text-emerald-400 text-[10px] font-bold animate-in fade-in">
                      ✓ Đã sao chép!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                  <span className="font-mono text-xs text-amber-300 font-bold px-2 flex-1 tracking-wider truncate select-all">
                    {twoFactorData.formattedSecret || twoFactorData.secret}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <i className="fa-regular fa-copy"></i>
                    <span>Chép</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === FORM NHẬP MÃ 6 SỐ (Áp dụng cho cả Setup và Verify) === */}
        <form id="two-factor-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-center">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              {mode === 'setup' ? 'Bước 2: Nhập mã 6 chữ số để kích hoạt' : 'Nhập mã xác thực 6 chữ số'}
            </label>

            <div className="flex justify-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={handleOtpChange}
                placeholder="• • • • • •"
                className="w-full max-w-xs py-3 px-4 text-center font-mono font-black text-2xl tracking-[0.5em] bg-slate-950 border-2 border-emerald-500/40 focus:border-emerald-500 rounded-2xl text-emerald-400 placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Mã 6 chữ số thay đổi tự động mỗi 30 giây trong Google Authenticator.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting || otpCode.length !== 6}
            className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang kiểm tra mã xác thực...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock-open"></i>
                <span>{mode === 'setup' ? 'Xác Nhận & Kích Hoạt 2FA Ngay' : 'Xác Thực & Vào Trang Quản Trị'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800 text-slate-400">
          {mode === 'verify' ? (
            <button
              type="button"
              onClick={() => setMode('setup')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline flex items-center gap-1 transition cursor-pointer"
            >
              <i className="fa-solid fa-qrcode"></i>
              <span>Quét lại mã QR thiết lập</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset2FA}
              className="text-amber-400 hover:text-amber-300 font-semibold hover:underline flex items-center gap-1 transition cursor-pointer"
              title="Tạo lại khóa bí mật mới nếu bị lộ hoặc đổi máy"
            >
              <i className="fa-solid fa-rotate"></i>
              <span>Làm mới mã QR</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-white font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Đăng xuất / Quay lại</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
