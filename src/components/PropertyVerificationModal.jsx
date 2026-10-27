'use client';

import React, { useState } from 'react';

/**
 * PropertyVerificationModal.jsx
 * Modal nộp hồ sơ giấy tờ pháp lý (Sổ đỏ / Sổ hồng 2 mặt) để Admin duyệt xác thực tin đăng
 */

// Ảnh mẫu Sổ đỏ / Sổ hồng tiêu chuẩn để người dùng test nhanh trong 1 cú click
const SAMPLE_DOCS = {
  front: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  back: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80'
};

export default function PropertyVerificationModal({
  isOpen,
  onClose,
  property,
  onSubmit
}) {
  const [frontImage, setFrontImage] = useState(property?.verificationDocuments?.frontImage || '');
  const [backImage, setBackImage] = useState(property?.verificationDocuments?.backImage || '');
  const [certNumber, setCertNumber] = useState(property?.verificationDocuments?.certNumber || '');
  const [notes, setNotes] = useState(property?.verificationDocuments?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !property) return null;

  // Xử lý upload file ảnh từ máy
  const handleFileUpload = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chỉ chọn tệp định dạng hình ảnh (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Dung lượng tệp vượt quá 15MB. Vui lòng chọn ảnh dung lượng nhỏ hơn.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (side === 'front') {
        setFrontImage(event.target.result);
      } else {
        setBackImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Chọn nhanh ảnh mẫu
  const handleUseSample = () => {
    setFrontImage(SAMPLE_DOCS.front);
    setBackImage(SAMPLE_DOCS.back);
    if (!certNumber) setCertNumber('CN-DANANG-2026/8982');
    if (!notes) setNotes('Sổ hồng chính chủ lâu dài, sẵn sàng công chứng sang tên ngay trong ngày.');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      setErrorMessage('Vui lòng tải lên đầy đủ cả 2 mặt của Sổ đỏ / Sổ hồng (Mặt trước và Mặt sau).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(property.id, {
          frontImage,
          backImage,
          certNumber: certNumber.trim(),
          notes: notes.trim(),
          submittedAt: new Date().toISOString()
        });
      }
      onClose && onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              <i className="fa-solid fa-file-contract"></i>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold truncate flex items-center gap-2">
                <span>Xác Thực Tin Đăng & Pháp Lý</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Cấp Tích Xanh
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Chính sách bảo mật & Quyền lợi */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <i className="fa-solid fa-shield-check text-emerald-600 text-base mt-0.5 shrink-0"></i>
            <div className="space-y-1 text-[11.5px] leading-relaxed text-emerald-950">
              <div className="font-bold text-emerald-900 text-xs">
                Quyền Lợi Khi Được Duyệt "Tin Xác Thực":
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                <li>Hiển thị Badge <strong>"Tin xác thực"</strong> màu xanh lục nổi bật trên toàn bộ website.</li>
                <li>Tăng <strong>gấp 3 lần tỷ lệ gọi điện</strong> từ khách mua có nhu cầu thực tế.</li>
                <li><strong>Bảo mật 100%:</strong> Hình ảnh Sổ đỏ chỉ lưu nội bộ phục vụ BQT kiểm duyệt, tuyệt đối không hiển thị công khai.</li>
              </ul>
            </div>
          </div>

          {/* Quick Test Sample Button */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
              <span>Dùng để kiểm thử nhanh quy trình?</span>
            </span>
            <button
              type="button"
              onClick={handleUseSample}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-image text-emerald-400"></i>
              <span>Chọn ảnh mẫu Sổ đỏ có sẵn</span>
            </button>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hai Khung Upload: Sổ Đỏ Mặt Trước & Mặt Sau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Mặt trước Sổ Đỏ */}
            <div className="space-y-2">
              <label className="font-extrabold text-slate-800 flex items-center justify-between">
                <span>1. Sổ đỏ mặt trước (Trang 1 & 2) <span className="text-rose-500">*</span></span>
                {frontImage && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <i className="fa-solid fa-circle-check"></i> Đã chọn
                  </span>
                )}
              </label>

              {frontImage ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group h-44 shadow-sm">
                  <img
                    src={frontImage}
                    alt="Sổ đỏ mặt trước"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFrontImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl cursor-pointer transition p-4 text-center group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center text-base mb-2 transition">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <span className="font-bold text-slate-800 text-xs">Tải lên mặt trước</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Trang 1 & 2: Thông tin thửa đất, sơ đồ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 2. Mặt sau Sổ Đỏ */}
            <div className="space-y-2">
              <label className="font-extrabold text-slate-800 flex items-center justify-between">
                <span>2. Sổ đỏ mặt sau (Trang 3 & 4) <span className="text-rose-500">*</span></span>
                {backImage && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <i className="fa-solid fa-circle-check"></i> Đã chọn
                  </span>
                )}
              </label>

              {backImage ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group h-44 shadow-sm">
                  <img
                    src={backImage}
                    alt="Sổ đỏ mặt sau"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBackImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>Xóa ảnh</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl cursor-pointer transition p-4 text-center group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center text-base mb-2 transition">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <span className="font-bold text-slate-800 text-xs">Tải lên mặt sau</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Trang 3 & 4: Biến động, công chứng</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'back')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Số Giấy Chứng Nhận / Số vào sổ cấp GCN (Tùy chọn)
              </label>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="Ví dụ: CS 892182 / Số vào sổ: CH-09821..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Ghi chú bổ sung cho Ban Quản Trị (Tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về tình trạng pháp lý, ngày cấp sổ, liên hệ chính chủ..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !frontImage || !backImage}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Đang gửi hồ sơ...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                <span>Gửi Hồ Sơ Xác Thực</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
