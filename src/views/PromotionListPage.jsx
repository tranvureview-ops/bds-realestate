'use client';

import React, { useState, useEffect } from 'react';
import { PROMOTIONS_DATA, isPromotionExpired, formatPromoDate } from '../data/rewardData';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function PromotionListPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testedVoucher, setTestedVoucher] = useState(null);
  const { showToast, rewardsConfig, systemConfig, currentUser } = useRealEstate();
  const { navigate } = useRouter();

  const promoList = rewardsConfig?.promotions || PROMOTIONS_DATA;
  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Bất Động Sản';
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
  const [expiringBonusInfo, setExpiringBonusInfo] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
    try {
      const cachedExp = localStorage.getItem(`bds_user_bonus_exp_${userId}`);
      if (cachedExp) {
        const parsed = JSON.parse(cachedExp);
        if (parsed?.amount && parsed?.formattedDate) setExpiringBonusInfo(parsed);
      }
    } catch (e) {}

    if (currentUser?.earliestExpiringBonus?.amount && currentUser?.earliestExpiringBonus?.expiresAt) {
      const expDate = new Date(currentUser.earliestExpiringBonus.expiresAt);
      setExpiringBonusInfo({
        amount: Number(currentUser.earliestExpiringBonus.amount),
        expiresAt: currentUser.earliestExpiringBonus.expiresAt,
        formattedDate: currentUser.earliestExpiringBonus.formattedDate || expDate.toLocaleDateString('vi-VN')
      });
    }

    if (!userId || userId === 'guest') return;

    fetch(`/api/wallet/expiring-bonus?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.hasExpiringBonus) {
          setExpiringBonusInfo({
            amount: data.amount,
            expiresAt: data.expiresAt,
            formattedDate: data.formattedDate
          });
        }
      })
      .catch(() => {});
  }, [currentUser?.id, currentUser?.bonusWalletBalance]);

  const categories = [
    { id: 'all', label: 'Tất cả khuyến mãi', icon: 'fa-solid fa-gift' },
    { id: 'active', label: 'Đang diễn ra', icon: 'fa-solid fa-circle-check' },
    { id: 'expired', label: 'Đã hết hạn', icon: 'fa-solid fa-clock-rotate-left' },
    { id: 'nap-tien', label: 'Nạp tiền ví', icon: 'fa-solid fa-wallet' },
    { id: 'goi-vip', label: 'Gói tin VIP', icon: 'fa-solid fa-crown' },
    { id: 'hoi-vien', label: 'Hội viên Môi giới', icon: 'fa-solid fa-user-shield' }
  ];

  const filteredPromos = promoList.filter(p => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'active') return !isPromotionExpired(p);
    if (activeCategory === 'expired') return isPromotionExpired(p);
    return p.category === activeCategory;
  });

  const getCategoryCount = (catId) => {
    if (catId === 'all') return promoList.length;
    if (catId === 'active') return promoList.filter(p => !isPromotionExpired(p)).length;
    if (catId === 'expired') return promoList.filter(p => isPromotionExpired(p)).length;
    return promoList.filter(p => p.category === catId).length;
  };

  const handleCopyCode = (code, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (showToast) showToast(`Đã sao chép mã ưu đãi ${code}!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCheckCode = (e) => {
    e.preventDefault();
    const clean = testCodeInput.trim().toUpperCase();
    if (!clean) return;

    const matched = promoList.find(p => p.discountCode?.toUpperCase() === clean);
    if (matched) {
      setTestedVoucher({ valid: true, data: matched });
      if (showToast) showToast(`Mã ${clean} hợp lệ! ${matched.discountValue}`, 'success');
    } else {
      setTestedVoucher({ valid: false, code: clean });
      if (showToast) showToast(`Mã ưu đãi "${clean}" không tồn tại hoặc đã hết hạn!`, 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Khuyến mãi</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <i className="fa-solid fa-sparkles text-amber-300"></i>
              Ưu Đãi Độc Quyền {brandName}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">
              Trung Tâm Khuyến Mãi & Voucher Bất Động Sản
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Nhận voucher nạp tiền, chiết khấu đẩy tin VIP và các đặc quyền hội viên dành riêng cho nhà môi giới và chính chủ.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70">Số dư Ví Khuyến Mãi của bạn</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} <span className="text-xs text-white">VNĐ</span>
                </div>
                {/* Dòng cảnh báo nhỏ kèm icon đồng hồ cát */}
                <div className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5 mt-0.5">
                  <i className="fa-solid fa-hourglass-half text-amber-300 animate-pulse"></i>
                  <span>
                    {bonusBal > 0 && expiringBonusInfo?.amount > 0 && expiringBonusInfo?.formattedDate
                      ? `(Có ${Number(expiringBonusInfo.amount).toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${expiringBonusInfo.formattedDate})`
                      : bonusBal > 0
                      ? `(Có ${bonusBal.toLocaleString('vi-VN')}đ tiền thưởng sắp hết hạn vào ngày ${new Date(Date.now() + (Number(systemConfig?.bonusExpiryDays) || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')})`
                      : `(Hạn dùng tiền thưởng khuyến mãi ${Number(systemConfig?.bonusExpiryDays) || 30} ngày kể từ ngày nhận)`}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/trung-tam-phan-thuong/doi-qua/"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs transition shadow-md hover:bg-amber-50"
            >
              <span>Xem đặc quyền Ví KM &rarr;</span>
            </Link>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none hidden md:block">
            <i className="fa-solid fa-tags text-[240px]"></i>
          </div>
        </div>

        {/* Voucher Fast Checker Tool */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-ticket text-red-600 text-lg"></i>
                <h2 className="text-base font-black text-slate-900">
                  Kiểm Tra & Kích Hoạt Mã Ưu Đãi
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập mã voucher bạn có để kiểm tra hạn sử dụng và quyền lợi chiết khấu.
              </p>
            </div>

            <form onSubmit={handleCheckCode} className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                value={testCodeInput}
                onChange={(e) => setTestCodeInput(e.target.value)}
                placeholder="Ví dụ: WELCOME100, VIPDIAMOND30..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-sm"
              >
                Kiểm tra
              </button>
            </form>
          </div>

          {/* Result of Voucher Checker */}
          {testedVoucher && (
            <div className={`mt-4 p-4 rounded-2xl border text-xs ${testedVoucher.valid ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              {testedVoucher.valid ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-sm flex items-center gap-1.5 text-emerald-700">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Mã [{testedVoucher.data.discountCode}] hợp lệ: {testedVoucher.data.title}</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-1">
                      Giảm giá: <strong className="font-bold">{testedVoucher.data.discountValue}</strong> • Hạn dùng: <strong>{testedVoucher.data.validUntil}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(testedVoucher.data.category === 'nap-tien' ? '/nap-tien' : '/bang-gia-tin-dang')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shrink-0 cursor-pointer shadow-xs"
                  >
                    Dùng mã này ngay &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <i className="fa-solid fa-circle-xmark"></i>
                  <span>Mã "{testedVoucher.code}" không tồn tại hoặc đã hết hiệu lực. Vui lòng chọn một mã trong danh sách bên dưới!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-xs ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-red-200'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <i className={`${cat.icon} text-xs`}></i>
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map(promo => {
            const isExpired = isPromotionExpired(promo);

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-3xl border ${
                  isExpired 
                    ? 'border-slate-300/80 bg-slate-50/60 shadow-xs' 
                    : 'border-slate-200/80 hover:border-red-400 shadow-sm hover:shadow-xl'
                } overflow-hidden transition-all duration-300 flex flex-col group`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={promo.thumbnail}
                    alt={promo.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isExpired ? 'grayscale contrast-75 group-hover:grayscale-0' : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Huy hiệu gốc */}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${
                    isExpired ? 'bg-slate-700 text-slate-200 opacity-80' : (promo.badgeColor || 'bg-red-500 text-white')
                  }`}>
                    {promo.badge}
                  </span>

                  {/* Nhãn dán ĐÃ HẾT HẠN thiết kế nổi bật */}
                  {isExpired ? (
                    <>
                      {/* Tag dán góc trên phải */}
                      <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-lg flex items-center gap-1.5 animate-pulse">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <span>ĐÃ HẾT HẠN</span>
                      </span>

                      {/* Con dấu chìm đóng mộc ở tâm ảnh */}
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-dashed border-rose-500 bg-rose-950/90 text-rose-300 px-3.5 py-1 rounded-xl font-black text-xs uppercase tracking-widest rotate-[-10deg] shadow-2xl flex items-center gap-1.5">
                          <i className="fa-solid fa-ban text-rose-400"></i>
                          <span>HẾT HIỆU LỰC</span>
                        </div>
                      </div>

                      {/* Tag hạn dùng đổi sang đỏ */}
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-950/90 text-rose-200 border border-rose-800/80 flex items-center gap-1 shadow-sm">
                        <i className="fa-regular fa-calendar-xmark text-rose-400"></i>
                        <span>Đã hết hạn: {formatPromoDate(promo.validUntil)}</span>
                      </span>
                    </>
                  ) : (
                    <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                      <i className="fa-regular fa-calendar-check text-emerald-400"></i>
                      <span>Hạn dùng: {formatPromoDate(promo.validUntil)}</span>
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                      isExpired ? 'text-slate-400' : 'text-red-600'
                    }`}>
                      <span>{promo.categoryLabel}</span>
                      {isExpired && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Đã dừng ưu đãi
                        </span>
                      )}
                    </div>

                    <h2 className={`text-base font-bold transition line-clamp-2 mt-1 ${
                      isExpired ? 'text-slate-500' : 'text-slate-900 group-hover:text-red-600'
                    }`}>
                      {promo.title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {promo.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Voucher code box */}
                    <div className={`flex items-center justify-between p-2.5 rounded-xl border border-dashed ${
                      isExpired ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mã Voucher</div>
                        <div className={`text-xs font-black tracking-wider font-mono ${
                          isExpired ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}>
                          {promo.discountCode}
                        </div>
                      </div>

                      {isExpired ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 flex items-center gap-1 cursor-not-allowed">
                          <i className="fa-solid fa-ban text-[11px]"></i>
                          <span>Đã hết hạn</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleCopyCode(promo.discountCode, e)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            copiedCode === promo.discountCode 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white border border-slate-200 hover:border-red-500 text-slate-700 hover:text-red-600'
                          }`}
                        >
                          <i className={`fa-solid ${copiedCode === promo.discountCode ? 'fa-check' : 'fa-copy'} text-[11px]`}></i>
                          <span>{copiedCode === promo.discountCode ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/khuyen-mai/${promo.slug}/`}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                        isExpired
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-slate-900 hover:bg-red-600 text-white'
                      }`}
                    >
                      <span>{isExpired ? 'Xem Thể Lệ (Đã Hết Hạn)' : 'Xem chi tiết & Thể lệ'}</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
