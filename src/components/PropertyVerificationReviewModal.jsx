'use client';

import React, { useState } from 'react';

/**
 * PropertyVerificationReviewModal.jsx
 * Modal xem và thẩm tra hồ sơ giấy tờ (Sổ đỏ 2 mặt) dành cho Quản trị viên và Chủ bài đăng
 */
export default function PropertyVerificationReviewModal({
  isOpen,
  onClose,
  property,
  isAdmin = false,
  onApprove,
  onReject
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !property) return null;

  const docs = property.verificationDocuments || {
    frontImage: property.frontImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    backImage: property.backImage || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    certNumber: property.certNumber || 'Chưa cung cấp',
    notes: property.verificationNotes || 'Chính chủ gửi hồ sơ xác thực',
    submittedAt: property.updatedAt || new Date().toISOString()
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    try {
      await onApprove(property.id);
      onClose && onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho người đăng tin.');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(property.id, rejectReason.trim());
      onClose && onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-file-shield"></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold truncate flex items-center gap-2">
                <span>Hồ Sơ Sổ Đỏ / Sổ Hồng Cần Thẩm Định</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  property.is_verified || property.isVerified
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : property.verification_status === 'pending' || property.verificationStatus === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {property.is_verified || property.isVerified
                    ? 'Đã Duyệt Xác Thực'
                    : property.verification_status === 'pending' || property.verificationStatus === 'pending'
                    ? 'Chờ BQT Phê Duyệt'
                    : 'Chưa Xác Thực'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                Mã tin: {property.id} • {property.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Thông tin BĐS và Người gửi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Bất Động Sản</span>
              <span className="font-extrabold text-slate-900 text-sm block mt-0.5 line-clamp-1">{property.title}</span>
              <span className="text-slate-600 block mt-0.5 font-semibold text-emerald-700">{property.priceDisplay} • {property.area} m²</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Người Gửi Hồ Sơ</span>
              <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{property.author?.name || property.contactName || 'Khách vãng lai'}</span>
              <span className="text-slate-600 block mt-0.5 font-mono">SĐT: {property.author?.phone || property.contactPhone || 'Chưa cung cấp'}</span>
            </div>
          </div>

          {/* Hai Mặt Sổ Đỏ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-images text-emerald-600"></i>
                <span>Hình Ảnh Giấy Tờ Pháp Lý (Click vào ảnh để phóng to)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">2 mặt đầy đủ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mặt trước */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 text-xs flex items-center justify-between">
                  <span>Trang 1 & 2 (Mặt trước / Thửa đất)</span>
                  <button
                    type="button"
                    onClick={() => setZoomedImage(docs.frontImage)}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <i className="fa-solid fa-magnifying-glass-plus"></i> Xem lớn
                  </button>
                </div>
                <div 
                  onClick={() => setZoomedImage(docs.frontImage)}
                  className="h-56 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 bg-slate-900 cursor-zoom-in transition relative group shadow-sm"
                >
                  <img
                    src={docs.frontImage}
                    alt="Sổ đỏ mặt trước"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5">
                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                    <span>Phóng to xem chi tiết</span>
                  </div>
                </div>
              </div>

              {/* Mặt sau */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 text-xs flex items-center justify-between">
                  <span>Trang 3 & 4 (Mặt sau / Biến động)</span>
                  <button
                    type="button"
                    onClick={() => setZoomedImage(docs.backImage)}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <i className="fa-solid fa-magnifying-glass-plus"></i> Xem lớn
                  </button>
                </div>
                <div 
                  onClick={() => setZoomedImage(docs.backImage)}
                  className="h-56 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 bg-slate-900 cursor-zoom-in transition relative group shadow-sm"
                >
                  <img
                    src={docs.backImage}
                    alt="Sổ đỏ mặt sau"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5">
                    <i className="fa-solid fa-magnifying-glass-plus"></i>
                    <span>Phóng to xem chi tiết</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Số GCN & Ghi chú */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            {docs.certNumber && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Số Giấy Chứng Nhận / Số Vào Sổ:</span>
                <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">{docs.certNumber}</span>
              </div>
            )}
            {docs.notes && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Ghi Chú Của Người Nộp:</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{docs.notes}</p>
              </div>
            )}
            {docs.submittedAt && (
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                Thời gian nộp: <b className="text-slate-600 font-mono">{new Date(docs.submittedAt).toLocaleString('vi-VN')}</b>
              </div>
            )}
          </div>

          {/* Form nhập lý do từ chối khi Admin bấm từ chối */}
          {isAdmin && isRejecting && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="font-extrabold text-rose-800 flex items-center gap-1.5 text-xs">
                <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
                <span>Nhập lý do từ chối cấp tích xanh xác thực:</span>
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Ảnh chụp bị mờ không đọc được số thửa, thông tin diện tích không khớp với tin đăng..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50"
                >
                  Hủy từ chối
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              {!isRejecting && (
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-ban"></i>
                  <span>Từ Chối Hồ Sơ</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Đang duyệt...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Duyệt Cấp Tích Xanh</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic flex items-center gap-1.5">
              <i className="fa-solid fa-clock text-amber-500"></i>
              <span>Hồ sơ đang chờ Ban Quản Trị đối soát và phê duyệt.</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Phóng To Ảnh Toàn Màn Hình */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <img
            src={zoomedImage}
            alt="Phóng to giấy tờ"
            className="max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
    </div>
  );
}
