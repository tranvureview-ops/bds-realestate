'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import { 
  getDailyQuotaStatus, 
  hasClaimedPropertyToday, 
  checkCooldownStatus, 
  calculateTreasureReward, 
  recordTreasureClaim,
  isPropertyTreasureActive,
  getTreasureExpirationInfo,
  calculateTreasureHuntExpiry,
  isUserMembershipActive,
  getMonthlyTreasureBudgetStatus
} from '../services/treasureHuntService';

export default function ArticleTreasureBox({ property }) {
  const { 
    currentUser, 
    showToast, 
    addBonusWalletBalance, 
    rewardsConfig, 
    updateProperty, 
    isMembershipActive,
    transactions,
    setActiveModal
  } = useRealEstate();
  const { navigate } = useRouter();

  const isMember = isMembershipActive ? isMembershipActive(currentUser) : isUserMembershipActive(currentUser);

  const tConfig = rewardsConfig?.treasureHuntConfig;
  const isFeatureEnabled = tConfig?.enabled !== false;
  const requireLogin = tConfig?.requireLogin !== false;

  // Hạn mức mở rương theo đối tượng: Thành viên thường (mặc định 1) vs Hội viên VIP (mặc định 3)
  const regularDailyLimit = Number(tConfig?.regularDailyLimit || 1);
  const memberDailyLimit = Number(tConfig?.memberDailyLimit || 3);
  const effectiveDailyLimit = isMember ? memberDailyLimit : regularDailyLimit;

  // Thời gian đọc chống bot & cooldown dùng chung cho tất cả đối tượng
  const minReadingSeconds = Number(tConfig?.minReadingSeconds || 4);
  const cooldownSeconds = Number(tConfig?.cooldownSeconds || 20);

  // Tổng ngân sách tháng
  const monthlyBudget = Number(tConfig?.monthlyBudget || 50000);
  const budgetStatus = getMonthlyTreasureBudgetStatus(monthlyBudget, transactions);

  const isAdmin = currentUser?.role === 'admin';
  const isTreasureActive = isPropertyTreasureActive(property, property?.author);
  const treasureExpInfo = getTreasureExpirationInfo(property);

  const isGuest = !currentUser || currentUser.role === 'guest' || !currentUser.id;
  const effectiveUserId = (!isGuest ? currentUser.id : null) || 'guest';

  const [hasClaimedThisArticle, setHasClaimedThisArticle] = useState(false);
  const [quota, setQuota] = useState({ count: 0, limit: effectiveDailyLimit, remaining: effectiveDailyLimit, isLimitReached: false });
  const [readingSecondsLeft, setReadingSecondsLeft] = useState(minReadingSeconds > 0 ? minReadingSeconds : 0);
  const [timeReady, setTimeReady] = useState(minReadingSeconds <= 0);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedReward, setRevealedReward] = useState(null);

  // 1. Kiểm tra trạng thái rương & đồng hồ đếm ngược xem bài viết (Anti-bot)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer = null;

    if (property?.id) {
      const claimed = hasClaimedPropertyToday(effectiveUserId, property.id);
      const quotaStatus = getDailyQuotaStatus(effectiveUserId, effectiveDailyLimit);
      setHasClaimedThisArticle(claimed);
      setQuota(quotaStatus);

      // Nếu đã nhận rương hoặc hết hạn mức hôm nay thì không cần đếm ngược
      if (claimed || quotaStatus.isLimitReached) {
        setReadingSecondsLeft(0);
        setTimeReady(true);
        return;
      }
    }

    if (minReadingSeconds <= 0) {
      setReadingSecondsLeft(0);
      setTimeReady(true);
      return;
    }

    // Khởi tạo đếm ngược theo thời gian tối thiểu đã cấu hình trong Admin
    setReadingSecondsLeft(minReadingSeconds);
    setTimeReady(false);

    timer = setInterval(() => {
      setReadingSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [effectiveUserId, property?.id, effectiveDailyLimit, minReadingSeconds]);

  // 2. Thao tác Mở Hộp Quà
  const handleOpenChest = () => {
    // 0. Khách vãng lai: Yêu cầu đăng nhập mới được mở rương
    if (isGuest && requireLogin) {
      if (showToast) {
        showToast('🔑 Vui lòng đăng nhập để mở rương và nhận tiền thưởng vào Ví Khuyến Mãi!', 'info');
      }
      if (typeof setActiveModal === 'function') {
        setActiveModal('auth');
      } else if (navigate) {
        navigate('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
      }
      return;
    }

    // A. Kiểm tra ngân sách tháng
    if (budgetStatus.isBudgetExceeded) {
      if (showToast) {
        showToast('🎁 Ngân sách mở rương tháng này đã đạt giới hạn tối đa. Hẹn gặp lại bạn vào đầu tháng sau!', 'warning');
      }
      return;
    }

    // B. Chống bot/spam: Phải xem bài viết ít nhất X giây mới sẵn sàng mở hộp
    if (!timeReady || readingSecondsLeft > 0) {
      if (showToast) {
        showToast(`🛡️ Vui lòng xem tin đăng thêm ${readingSecondsLeft}s nữa để mở khóa rương (Chống bot gian lận)!`, 'warning');
      }
      return;
    }

    // C. Kiểm tra giới hạn N hộp / ngày theo loại tài khoản (Thành viên thường: 1, VIP: 3)
    const currentQuota = getDailyQuotaStatus(effectiveUserId, effectiveDailyLimit);
    if (currentQuota.isLimitReached) {
      if (showToast) {
        showToast(`Hôm nay bạn đã mở đủ ${effectiveDailyLimit}/${effectiveDailyLimit} rương kho báu! Hãy quay lại vào ngày mai nhé.`, 'warning');
      }
      return;
    }

    // D. Kiểm tra đã mở bài viết này chưa
    if (hasClaimedPropertyToday(effectiveUserId, property?.id)) {
      if (showToast) {
        showToast('Bạn đã nhận rương từ tin đăng này hôm nay. Hãy khám phá tin khác!', 'info');
      }
      return;
    }

    // E. Kiểm tra Cooldown chống spam
    const cooldown = checkCooldownStatus(effectiveUserId, cooldownSeconds);
    if (!cooldown.canOpen) {
      if (showToast) {
        showToast(`Vui lòng chờ ${cooldown.secondsLeft} giây trước khi mở rương tiếp theo!`, 'warning');
      }
      return;
    }

    // Bắt đầu mở hộp quà
    setIsOpening(true);

    setTimeout(() => {
      // Tính tiền thưởng theo 4 mốc cấu hình (Thường: 0đ/25%, 1.200đ/45%, 2.500đ/25%, 12.000đ/5%; VIP hưởng mốc cao)
      const reward = calculateTreasureReward(tConfig, currentUser, isMember, budgetStatus.remainingBudget);

      // Nếu trúng mốc có tiền: cộng tiền vào Ví Khuyến Mãi
      if (!reward.isEmpty && reward.amount > 0 && addBonusWalletBalance) {
        addBonusWalletBalance(reward.amount, `Rương bài viết (${reward.label}): ${property?.title || property?.id}`);
      }

      // Lưu lịch sử claim (kể cả khi 0đ vẫn tính là 1 lượt mở hôm nay)
      recordTreasureClaim(
        effectiveUserId, 
        property?.id, 
        property?.title, 
        reward.amount, 
        reward.isMemberBonus, 
        { isEmpty: Boolean(reward.isEmpty), label: reward.label }
      );

      setRevealedReward(reward);
      setHasClaimedThisArticle(true);
      setQuota(getDailyQuotaStatus(effectiveUserId, effectiveDailyLimit));
      setIsOpening(false);

      if (showToast) {
        if (reward.isEmpty) {
          showToast('🍀 Bạn trúng mốc Chúc May Mắn. Hẹn gặp lại bạn vào ngày mai để thử vận may nhé!', 'info');
        } else if (reward.isMemberBonus) {
          showToast(`👑 Đặc quyền Hội Viên! Đã cộng +${reward.amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi của bạn!`, 'success');
        } else {
          showToast(`🎉 Chúc mừng! Đã cộng +${reward.amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi của bạn!`, 'success');
        }
      }
    }, 1200);
  };

  if (!property || !isFeatureEnabled) return null;

  // PHƯƠNG ÁN 1: Nếu bài viết không được kích hoạt rương
  if (!isTreasureActive) {
    // Nếu là Admin, hiển thị thanh quản trị nhanh cho phép bật rương
    if (isAdmin) {
      return (
        <div className="bg-slate-900 border border-dashed border-amber-500/50 rounded-2xl p-4 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm shrink-0">
              <i className="fa-solid fa-gift"></i>
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">Chế độ Admin</span>
                <span>Bài viết này chưa kích hoạt Rương Kho Báu</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Người dùng thông thường sẽ không nhìn thấy rương trong tin này (Theo Phương án 1).
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (updateProperty) {
                const { activatedAt, expiresAt } = calculateTreasureHuntExpiry(currentUser);
                updateProperty(property.id, { 
                  isTreasureHuntActive: true,
                  treasureHuntActivatedAt: activatedAt,
                  treasureHuntExpiresAt: expiresAt
                });
                if (showToast) showToast(`[Admin] Đã kích hoạt rương kho báu 15 ngày cho bài viết ${property.id}!`, 'success');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-bolt"></i>
            <span>Bật rương cho bài viết này</span>
          </button>
        </div>
      );
    }
    // Đối với người dùng thông thường: Ẩn hoàn toàn rương
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-amber-300/40 my-6">
      {/* Nút Admin Tắt rương nhanh */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={() => {
              if (updateProperty) {
                updateProperty(property.id, { 
                  isTreasureHuntActive: false,
                  treasureHuntExpiresAt: null
                });
                if (showToast) showToast(`[Admin] Đã tắt rương kho báu cho bài viết ${property.id}`, 'info');
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
            title="Quản trị viên: Bấm để tắt rương bài viết này"
          >
            <i className="fa-solid fa-power-off text-[9px]"></i>
            <span>Admin: Tắt rương {treasureExpInfo.daysRemaining > 0 ? `(${treasureExpInfo.daysRemaining}d)` : ''}</span>
          </button>
        </div>
      )}
      {/* Decorative background icons */}
      <div className="absolute right-[-15px] bottom-[-20px] opacity-15 pointer-events-none">
        <i className="fa-solid fa-gem text-9xl"></i>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Chest Icon & Description */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl sm:text-4xl text-amber-200 shadow-inner ${
              !hasClaimedThisArticle && !quota.isLimitReached && timeReady ? 'animate-bounce' : ''
            }`}>
              <i className={`fa-solid ${hasClaimedThisArticle ? 'fa-box-open text-white/80' : timeReady ? 'fa-box-open' : 'fa-box'}`}></i>
            </div>
            
            {/* Huy hiệu đếm ngược trên góc icon */}
            {!hasClaimedThisArticle && !quota.isLimitReached && !timeReady && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[11px] font-black border border-amber-400 shadow-md flex items-center gap-1">
                <i className="fa-solid fa-lock text-[9px] text-amber-400"></i>
                <span>{readingSecondsLeft}s</span>
              </span>
            )}

            {!hasClaimedThisArticle && !quota.isLimitReached && timeReady && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border border-white"></span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-amber-200">
                Săn Kho Báu BĐS
              </span>
              {isMember && (
                <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 flex items-center gap-1 shadow-sm animate-pulse">
                  <i className="fa-solid fa-crown text-[9px] text-amber-800"></i>
                  <span>Đặc quyền Hội Viên: Tỷ Lệ Tiền Thưởng Cao</span>
                </span>
              )}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Hạn mức hôm nay: <strong>{quota.count}/{effectiveDailyLimit} rương</strong>
              </span>
              {budgetStatus.isBudgetExceeded && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600/80 text-white flex items-center gap-1 shadow-xs">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  <span>Ngân sách tháng đã hết</span>
                </span>
              )}
              {!hasClaimedThisArticle && !quota.isLimitReached && !budgetStatus.isBudgetExceeded && (
                !timeReady ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/70 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-xs">
                    <i className="fa-solid fa-hourglass-half animate-spin text-[10px] text-amber-400"></i>
                    <span>Đang đọc bài: <strong>còn {readingSecondsLeft}s</strong></span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 flex items-center gap-1.5 shadow-xs">
                    <i className="fa-solid fa-unlock-keyhole text-[10px] text-emerald-300"></i>
                    <span>Đã mở khóa</span>
                  </span>
                )
              )}
            </div>

            <h4 className="text-base sm:text-lg font-black leading-snug">
              {hasClaimedThisArticle 
                ? 'Bạn đã mở rương bài viết này thành công!'
                : budgetStatus.isBudgetExceeded
                ? 'Ngân sách thưởng mở rương tháng này đã đạt giới hạn!'
                : quota.isLimitReached
                ? `Bạn đã nhận đủ ${effectiveDailyLimit}/${effectiveDailyLimit} rương kho báu hôm nay!`
                : !timeReady
                ? `Rương Kho Báu Đang Mở Khóa (${readingSecondsLeft}s)`
                : isMember
                ? `Rương Đặc Quyền Hội Viên (${currentUser?.membership?.packageName || 'VIP'})`
                : isGuest && requireLogin
                ? 'Đăng nhập để mở Rương Kho Báu trong bài viết này!'
                : 'Bạn vừa tìm thấy 1 Rương Kho Báu trong bài viết này!'}
            </h4>

            <p className="text-xs text-white/90 leading-relaxed max-w-xl">
              {hasClaimedThisArticle
                ? 'Tiền thưởng đã được cộng vào Ví Khuyến Mãi. Hãy tiếp tục xem tin khác để săn rương tiếp theo!'
                : budgetStatus.isBudgetExceeded
                ? 'Tổng quỹ tiền thưởng mở rương tháng này đã được trao hết. Hệ thống sẽ làm mới quỹ vào đầu tháng sau.'
                : quota.isLimitReached
                ? `Hẹn gặp lại bạn vào ngày mai để tiếp tục săn ${effectiveDailyLimit} rương nhận tiền vào Ví Khuyến Mãi nhé.`
                : isGuest && requireLogin
                ? 'Quý khách vui lòng đăng nhập tài khoản để mở rương nhận thưởng trực tiếp vào Ví Khuyến Mãi.'
                : !timeReady
                ? `Vui lòng xem bài viết trong ${readingSecondsLeft} giây nữa để chống bot và mở khóa nhận thưởng vào Ví Khuyến Mãi.`
                : isMember
                ? `👑 Đặc quyền Hội Viên: Bạn được mở tối đa ${effectiveDailyLimit} rương mỗi ngày để nhận thưởng trực tiếp vào Ví Khuyến Mãi!`
                : 'Mở rương ngẫu nhiên nhận thưởng từ các mốc tiền thưởng may mắn cộng thẳng vào Ví Khuyến Mãi.'}
            </p>

            {/* Thanh tiến trình đếm ngược thời gian đọc tin */}
            {!hasClaimedThisArticle && !quota.isLimitReached && !budgetStatus.isBudgetExceeded && !timeReady && minReadingSeconds > 0 && (
              <div className="w-full max-w-md bg-black/30 rounded-full h-1.5 overflow-hidden mt-2 p-0.5 border border-white/20">
                <div 
                  className="bg-gradient-to-r from-amber-300 to-yellow-200 h-full rounded-full transition-all duration-1000 ease-linear shadow"
                  style={{ width: `${Math.min(100, Math.max(0, Math.round(((minReadingSeconds - readingSecondsLeft) / minReadingSeconds) * 100)))}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0 w-full sm:w-auto text-center">
          {hasClaimedThisArticle ? (
            <div className="px-5 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-check text-amber-300"></i>
              <span>Đã nhận thưởng</span>
            </div>
          ) : budgetStatus.isBudgetExceeded ? (
            <div className="px-5 py-2.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 text-rose-200 text-xs font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-300"></i>
              <span>Hết ngân sách tháng</span>
            </div>
          ) : quota.isLimitReached ? (
            <div className="px-5 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-lock"></i>
              <span>Đã hết lượt hôm nay</span>
            </div>
          ) : isGuest && requireLogin ? (
            <button
              type="button"
              onClick={handleOpenChest}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket text-amber-600"></i>
              <span>Đăng nhập để mở rương</span>
            </button>
          ) : !timeReady ? (
            <button
              type="button"
              onClick={() => {
                if (showToast) {
                  showToast(`🛡️ Vui lòng xem tin đăng thêm ${readingSecondsLeft}s nữa để mở khóa rương (Chống bot gian lận)!`, 'warning');
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950/90 text-amber-300 font-bold text-xs sm:text-sm border border-amber-400/50 shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              title={`Vui lòng xem bài viết thêm ${readingSecondsLeft} giây để mở khóa`}
            >
              <i className="fa-solid fa-lock text-amber-400"></i>
              <span>Mở sau {readingSecondsLeft}s</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenChest}
              disabled={isOpening}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              {isOpening ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin text-amber-600"></i>
                  <span>Đang mở rương...</span>
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isMember ? 'fa-crown text-amber-500' : 'fa-key text-amber-500'}`}></i>
                  <span>{isMember ? 'Mở Rương Hội Viên' : 'Mở Rương Nhận Tiền'}</span>
                </>
              )}
            </button>
          )}

          {!hasClaimedThisArticle && !quota.isLimitReached && !budgetStatus.isBudgetExceeded && (
            <div className="text-[10px] text-white/90 mt-1.5 font-medium">
              {isMember ? (
                <span className="text-amber-100 font-bold">
                  👑 Đặc quyền Hội Viên: Hạn mức mở {memberDailyLimit} rương / ngày
                </span>
              ) : (
                <span>
                  🎁 Thưởng theo 4 mốc: 0đ (25%) • 1.200đ (45%) • 2.500đ (25%) • 12.000đ (5%)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup chúc mừng nhận quà / Chúc may mắn lần sau */}
      {revealedReward && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl text-slate-800">
            {revealedReward.isEmpty ? (
              // Trường hợp 1: Trúng mốc 0đ (Chúc may mắn - Rỗng)
              <>
                <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-4xl shadow-inner">
                  <i className="fa-solid fa-face-smile-wink text-amber-500"></i>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                    🍀 Chúc May Mắn
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">Chúc Bạn May Mắn Lần Sau!</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Rất tiếc rương này chưa có tiền thưởng (Mốc Chúc may mắn 0đ). Đừng nản lòng nhé!
                  </p>
                </div>
                <div className="p-4 rounded-2xl border-2 border-dashed bg-slate-50 border-slate-300">
                  <div className="text-2xl font-black font-mono text-slate-600">
                    0 đ
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                    Đã tính 1 lượt mở rương hôm nay
                  </div>
                </div>
              </>
            ) : (
              // Trường hợp 2: Trúng mốc có tiền thưởng
              <>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce ${
                  revealedReward.isMemberBonus ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <i className={`fa-solid ${revealedReward.isMemberBonus ? 'fa-crown' : 'fa-hand-holding-dollar'}`}></i>
                </div>

                <div>
                  {revealedReward.isMemberBonus ? (
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                      <i className="fa-solid fa-crown text-amber-600"></i>
                      <span>Đặc Quyền Hội Viên: {revealedReward.memberPackageName || 'VIP'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      🎁 {revealedReward.label || 'Tiền Thưởng Ngẫu Nhiên'}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-slate-900 mt-2">Mở Rương Thành Công!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {revealedReward.isMemberBonus
                      ? 'Nhờ sở hữu Gói Hội Viên, bạn nhận được mức tiền thưởng tỷ lệ cao vào Ví Khuyến Mãi:'
                      : 'Tiền thưởng đã được cộng trực tiếp vào Ví Khuyến Mãi của bạn:'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 border-dashed ${
                  revealedReward.isMemberBonus ? 'bg-amber-50/80 border-amber-300' : 'bg-emerald-50 border-emerald-300'
                }`}>
                  <div className={`text-2xl font-black font-mono ${
                    revealedReward.isMemberBonus ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    +{revealedReward.amount.toLocaleString('vi-VN')} đ
                  </div>
                  <div className={`text-[11px] font-semibold mt-1 ${
                    revealedReward.isMemberBonus ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {revealedReward.isMemberBonus
                      ? '👑 Rương VIP Hội Viên • Tỷ lệ tiền thưởng vượt trội'
                      : 'Sử dụng ngay để đăng tin hoặc đẩy tin TOP 1'}
                  </div>
                </div>
              </>
            )}

            {/* Mẹo nâng cấp nếu chưa có gói */}
            {!revealedReward.isMemberBonus && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <i className="fa-solid fa-crown text-amber-600"></i>
                  <span>Đặc quyền Gói Hội Viên VIP</span>
                </div>
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  Tài khoản Hội Viên VIP được mở tối đa <strong>{memberDailyLimit} rương/ngày</strong> (gấp 3 lần thành viên thường) và tích lũy số dư Ví Khuyến Mãi nhanh chóng.
                </div>
                <Link
                  href="/goi-hoi-vien"
                  onClick={() => setRevealedReward(null)}
                  className="inline-block mt-1 text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Xem các Gói Hội Viên ➔
                </Link>
              </div>
            )}

            <div className="text-xs text-slate-500">
              Tiến độ hôm nay: <strong>{quota.count}/{effectiveDailyLimit} rương</strong>
            </div>

            <button
              onClick={() => setRevealedReward(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              {revealedReward.isEmpty ? 'Đóng' : 'Tuyệt vời, tiếp tục xem tin'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
