'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function WalletDepositModal({ onClose }) {
  const { currentUser, depositWallet, paymentConfig } = useRealEstate();

  const [depositAmount, setDepositAmount] = useState(500000); // 500k default
  const [method, setMethod] = useState('vietqr'); // 'vietqr', 'momo', 'vnpay'
  const [isProcessing, setIsProcessing] = useState(false);

  const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

  const handleConfirmDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      depositWallet(depositAmount, method === 'vietqr' ? 'VietQR Ngân hàng' : method === 'momo' ? 'Ví MoMo' : 'Cổng VNPAY');
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base shadow">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Nạp Tiền Vào Ví Tài Khoản
              </h2>
              <p className="text-xs text-slate-500">
                Sử dụng số dư để mua các gói VIP, đẩy tin và ghim bài đăng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Balance Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md flex items-center justify-between">
            <div className="space-y-1.5">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-200">Số dư ví chính (Nạp tiền):</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {currentUser.walletBalance?.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-100 pt-1 border-t border-white/10">
                <i className="fa-solid fa-gift text-amber-300"></i>
                <span>Ví Khuyến Mãi (Tiền thưởng):</span>
                <strong className="text-amber-300 font-mono text-sm">
                  +{(Number(currentUser.bonusWalletBalance) || 0).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-wallet text-amber-300"></i>
            </div>
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Chọn số tiền nạp:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${depositAmount === amt ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                >
                  +{amt.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Hoặc nhập số tiền tùy ý (VND):
            </label>
            <input
              type="number"
              step="10000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Math.max(10000, Number(e.target.value)))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Phương thức thanh toán:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('vietqr')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${method === 'vietqr' ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <i className="fa-solid fa-qrcode text-base block mb-1 text-blue-600"></i>
                VietQR Ngân hàng
              </button>
              <button
                type="button"
                onClick={() => setMethod('momo')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${method === 'momo' ? 'bg-pink-50 border-pink-600 text-pink-700 ring-1 ring-pink-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <i className="fa-solid fa-wallet text-base block mb-1 text-pink-600"></i>
                Ví MoMo
              </button>
              <button
                type="button"
                onClick={() => setMethod('vnpay')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${method === 'vnpay' ? 'bg-blue-50 border-blue-700 text-blue-800 ring-1 ring-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <i className="fa-solid fa-credit-card text-base block mb-1 text-blue-700"></i>
                VNPAY-QR
              </button>
            </div>
          </div>

          {/* VietQR Bank Info Display */}
          {method === 'vietqr' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
              {/* QR Mockup */}
              <div className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src={`https://img.vietqr.io/image/${paymentConfig?.vietqr?.bankBin || '970422'}-${paymentConfig?.vietqr?.accountNumber || '0898246607'}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent((paymentConfig?.vietqr?.syntaxPrefix || 'DBDN') + ' NAP ' + currentUser.id)}&accountName=${encodeURIComponent(paymentConfig?.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG')}`}
                  alt="VietQR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://datbiendanang.vn/pay';
                  }}
                />
              </div>

              <div className="text-xs space-y-1 text-slate-700">
                <div>Ngân hàng: <strong className="text-slate-900">{paymentConfig?.vietqr?.bankName || 'MB Bank (Quân Đội)'}</strong></div>
                <div>Số tài khoản: <strong className="text-blue-700 font-mono text-sm">{paymentConfig?.vietqr?.accountNumber || '0898246607'}</strong></div>
                <div>Chủ tài khoản: <strong className="text-slate-900">{paymentConfig?.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG'}</strong></div>
                <div>Nội dung: <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">{(paymentConfig?.vietqr?.syntaxPrefix || 'DBDN')} NAP {currentUser.id}</span></div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmDeposit}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Đang xử lý giao dịch...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i>
                <span>Xác Nhận Nạp {depositAmount.toLocaleString('vi-VN')} đ Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
