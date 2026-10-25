'use client';

import React from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import { VIP_PACKAGES, BUMP_SERVICE_PRICE } from '../data/mockData';

export default function VipPackageShowcase({ onClose = null, className = '' }) {
  const { navigate } = useRouter();
  const { 
    currentUser, 
    selectedPropertyForVip, 
    setPreselectedListingType,
    upgradeVip, 
    setActiveModal, 
    setSelectedPropertyForVip,
    bumpServicePrice,
    BUMP_SERVICE_PRICE: contextBumpPrice,
    vipPackages: contextVipPackages
  } = useRealEstate();

  const activeVipPackages = (contextVipPackages && contextVipPackages.length > 0) ? contextVipPackages : VIP_PACKAGES;
  const currentBumpPrice = bumpServicePrice ?? contextBumpPrice ?? BUMP_SERVICE_PRICE ?? 10000;

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';

  const handleSelectPackage = (pkgId) => {
    if (selectedPropertyForVip) {
      // Direct upgrade
      const success = upgradeVip(selectedPropertyForVip.id, pkgId, 7);
      if (success) {
        setSelectedPropertyForVip(null);
        if (onClose) onClose();
      }
    } else {
      // Open post listing modal with this listing type preselected
      if (setPreselectedListingType) {
        setPreselectedListingType(pkgId);
      }
      setActiveModal('post-listing');
      if (onClose) onClose();
    }
  };

  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${className ? className : 'py-6 sm:py-8'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fa-solid fa-crown text-amber-500"></i>
            Hệ Thống Phân Loại Tin Đăng & Biểu Phí
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Chọn Phân Loại Tin Đăng Để <span className="text-red-600">Bán Nhanh Gấp 15 Lần</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Tin đăng VIP Kim Cương và VIP Vàng luôn được hiển thị ưu tiên trên cùng. Đơn giá tính theo ngày hiển thị cho từng bài viết cụ thể (không phải gói thuê bao).
          </p>
          {selectedPropertyForVip && (
            <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-xl inline-block text-xs font-bold text-amber-900">
              Đang chọn nâng cấp cho tin: <span className="text-red-600 font-extrabold">{selectedPropertyForVip.id}</span> - {selectedPropertyForVip.title.substring(0, 45)}...
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mb-10">
          {activeVipPackages.map((pkg) => {
            const isDiamond = pkg.id === 'vip-diamond';
            const isGold = pkg.id === 'vip-gold';
            const isSilver = pkg.id === 'vip-silver';
            const isNormal = pkg.id === 'normal';

            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl flex flex-col justify-between transition-all duration-300 p-4 border-2 ${
                  isDiamond 
                    ? 'border-red-500 shadow-xl lg:-translate-y-2 ring-2 ring-red-400/20' 
                    : isGold 
                    ? 'border-amber-400 shadow-lg' 
                    : isSilver
                    ? 'border-blue-400 shadow-sm'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Popular Recommended Ribbon */}
                {isDiamond && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    ★ TOP 1 SÀN • TIẾP CẬN X20
                  </div>
                )}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    TOP 2 TRANG CHỦ • X10
                  </div>
                )}
                {isNormal && (currentUser?.vouchers?.normalPublish || 0) > 0 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md whitespace-nowrap animate-pulse">
                    ✓ CÓ VOUCHER 0 Đ
                  </div>
                )}

                <div>
                  {/* Badge & Level */}
                  <div className="text-center pb-3 border-b border-slate-100">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide mb-2 ${pkg.badgeColor}`}>
                      {pkg.badgeText || pkg.shortName}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Cấp Độ {pkg.level}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="text-center py-3 bg-slate-50/70 rounded-xl my-2 border border-slate-100">
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {pkg.pricePerDay.toLocaleString('vi-VN')} <span className="text-xs text-slate-500 font-normal">đ/ngày</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Đăng tối thiểu {pkg.minDays} ngày
                    </div>
                    {isNormal && (
                      <div className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full inline-block mt-1">
                        Hội viên dùng Voucher = 0 đ
                      </div>
                    )}
                  </div>

                  {/* Diamond Special Perks */}
                  {isDiamond && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-900 font-medium mb-2 space-y-0.5">
                      <div className="font-extrabold flex items-center gap-1 text-red-950">
                        <i className="fa-solid fa-gem text-red-600 text-[10px]"></i>
                        <span>TẶNG KÈM 1 Tin Thường song hành</span>
                      </div>
                      <div className="text-[10px] text-slate-600">Đẩy tin kép MIỄN PHÍ • Duyệt bài tức thì</div>
                    </div>
                  )}

                  {/* Feature Checklist */}
                  <ul className="space-y-1.5 py-2 border-t border-slate-100 text-xs text-slate-600">
                    {pkg.features.slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-tight">
                        <i className={`fa-solid fa-check text-[11px] mt-0.5 shrink-0 ${isDiamond ? 'text-red-600' : isGold ? 'text-amber-500' : isSilver ? 'text-blue-500' : 'text-slate-400'}`}></i>
                        <span className={idx === 0 ? 'font-bold text-slate-800' : ''}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      isDiamond 
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white' 
                        : isGold 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black' 
                        : isSilver
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span className="whitespace-nowrap">
                      {selectedPropertyForVip 
                        ? `Áp dụng: ${pkg.shortName}` 
                        : (pkg.id === 'normal' ? 'Đăng Tin Thường' : `Đăng Tin ${pkg.shortName}`)}
                    </span>
                    <i className="fa-solid fa-arrow-right text-[10px] shrink-0"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bump Listing Extra Service Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400 font-extrabold">
                Dịch Vụ Gia Tăng Đặc Biệt
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                Dịch Vụ Đẩy Tin (Làm Mới Tin) Lên Đầu Trang
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Cập nhật thời gian đăng tin lên thời điểm hiện tại. Đưa tin của bạn lên đầu kết quả tìm kiếm theo đúng phân cấp VIP mà không cần tạo tin mới.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400">Chi phí cực thấp</div>
              <div className="text-2xl font-black text-amber-400">
                {currentBumpPrice.toLocaleString('vi-VN')} đ <span className="text-xs text-slate-300 font-normal">/ lần đẩy</span>
              </div>
            </div>
            <Link
              to={isGuest ? '/dang-nhap?redirect=/quan-ly-tin' : '/quan-ly-tin'}
              onClick={() => {
                if (onClose) onClose();
                setActiveModal(null);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shrink-0 cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
            >
              <span>Vào Quản Lý Để Đẩy Tin</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Membership Callout */}
        <div className="mt-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-2xl shadow-lg shrink-0">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase mb-1">
                Dành Riêng Cho Môi Giới Bất Động Sản
              </div>
              <h4 className="text-xl font-black text-slate-950">
                Đăng Ký Gói Hội Viên — Tiết Kiệm Tới 39%
              </h4>
              <p className="text-xs text-slate-900 font-medium mt-1 max-w-xl">
                Nhận trọn bộ kho Voucher cấp mới định kỳ 30 ngày: voucher giảm 35.000đ đăng tin thường + voucher giảm 10.000đ đẩy tin + voucher 400.000đ tin VIP.
              </p>
            </div>
          </div>
          <Link
            to="/goi-hoi-vien"
            onClick={() => { if (onClose) onClose(); }}
            className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-black text-sm rounded-xl transition shadow-lg shrink-0 flex items-center gap-2"
          >
            <span>Khám Phá Gói Hội Viên</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
