'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link, useRouter } from '../router/RouterContext';
import { 
  getDailyQuotaStatus, 
  hasClaimedPropertyToday, 
  checkCooldownStatus, 
  calculateTreasureReward, 
  recordTreasureClaim 
} from '../services/treasureHuntService';

export default function ArticleTreasureBox({ property }) {
  const { currentUser, showToast, addBonusWalletBalance } = useRealEstate();
  const { navigate } = useRouter();

  const [hasClaimedThisArticle, setHasClaimedThisArticle] = useState(false);
  const [quota, setQuota] = useState({ count: 0, limit: 3, remaining: 3, isLimitReached: false });
  const [timeReady, setTimeReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedReward, setRevealedReward] = useState(null);

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : null;
  const isGuest = !userId;

  // 1. Kiểm tra trạng thái rương khi tải bài viết
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (userId && property?.id) {
      setHasClaimedThisArticle(hasClaimedPropertyToday(userId, property.id));
      setQuota(getDailyQuotaStatus(userId));
    }

    // Chống bot/spam: Phải xem bài viết ít nhất 4 giây mới sẵn sàng mở hộp
    const timer = setTimeout(() => {
      setTimeReady(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [userId, property?.id]);

  // 2. Thao tác Mở Hộp Quà
  const handleOpenChest = () => {
    // A. Yêu cầu đăng nhập nếu là khách
    if (isGuest) {
      if (showToast) {
        showToast('Vui lòng đăng nhập để nhận tiền thưởng trực tiếp vào Ví Khuyến Mãi!', 'info');
      }
      navigate('/dang-nhap');
      return;
    }

    // B. Kiểm tra giới hạn 3 hộp / ngày
    const currentQuota = getDailyQuotaStatus(userId);
    if (currentQuota.isLimitReached) {
      if (showToast) {
        showToast('Hôm nay bạn đã mở đủ 3/3 rương kho báu! Hãy quay lại vào ngày mai nhé.', 'warning');
      }
      return;
    }

    // C. Kiểm tra đã mở bài viết này chưa
    if (hasClaimedPropertyToday(userId, property?.id)) {
      if (showToast) {
        showToast('Bạn đã nhận rương từ tin đăng này hôm nay. Hãy khám phá tin khác!', 'info');
      }
      return;
    }

    // D. Kiểm tra Cooldown chống spam 20s
    const cooldown = checkCooldownStatus(userId);
    if (!cooldown.canOpen) {
      if (showToast) {
        showToast(`Vui lòng chờ ${cooldown.secondsLeft} giây trước khi mở rương tiếp theo!`, 'warning');
      }
      return;
    }

    // Bắt đầu mở hộp quà
    setIsOpening(true);

    setTimeout(() => {
      // Tính ngẫu nhiên tiền thưởng theo đúng tỷ lệ
      const reward = calculateTreasureReward();

      // Cộng tiền trực tiếp vào Ví Khuyến Mãi
      if (addBonusWalletBalance) {
        addBonusWalletBalance(reward.amount, `Rương bài viết: ${property?.title || property?.id}`);
      }

      // Lưu lịch sử claim
      recordTreasureClaim(userId, property?.id, property?.title, reward.amount);

      setRevealedReward(reward);
      setHasClaimedThisArticle(true);
      setQuota(getDailyQuotaStatus(userId));
      setIsOpening(false);

      if (showToast) {
        showToast(`🎉 Chúc mừng! Đã cộng +${reward.amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi của bạn!`, 'success');
      }
    }, 1200);
  };

  if (!property) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-7 text-white shadow-lg border border-amber-300/40 my-6">
      {/* Decorative background icons */}
      <div className="absolute right-[-15px] bottom-[-20px] opacity-15 pointer-events-none">
        <i className="fa-solid fa-gem text-9xl"></i>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Chest Icon & Description */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl sm:text-4xl text-amber-200 shadow-inner ${
              !hasClaimedThisArticle && !quota.isLimitReached ? 'animate-bounce' : ''
            }`}>
              <i className={`fa-solid ${hasClaimedThisArticle ? 'fa-box-open text-white/80' : 'fa-box'}`}></i>
            </div>
            {!hasClaimedThisArticle && !quota.isLimitReached && (
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
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Hạn mức hôm nay: <strong>{quota.count}/3 rương</strong>
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black leading-snug">
              {hasClaimedThisArticle 
                ? 'Bạn đã mở rương bài viết này thành công!'
                : quota.isLimitReached
                ? 'Bạn đã nhận đủ 3/3 rương kho báu hôm nay!'
                : 'Bạn vừa tìm thấy 1 Rương Kho Báu trong bài viết này!'}
            </h4>

            <p className="text-xs text-white/90 leading-relaxed max-w-xl">
              {hasClaimedThisArticle
                ? 'Tiền thưởng đã được cộng vào Ví Khuyến Mãi. Hãy tiếp tục xem tin khác để săn rương tiếp theo!'
                : quota.isLimitReached
                ? 'Hẹn gặp lại bạn vào ngày mai để tiếp tục săn 3 rương nhận tiền vào Ví Khuyến Mãi nhé.'
                : 'Mở rương ngẫu nhiên nhận từ 2.000đ đến 20.000đ tiền tươi cộng thẳng vào Ví Khuyến Mãi.'}
            </p>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0 w-full sm:w-auto text-center">
          {hasClaimedThisArticle ? (
            <div className="px-5 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-check text-amber-300"></i>
              <span>Đã nhận thưởng</span>
            </div>
          ) : quota.isLimitReached ? (
            <div className="px-5 py-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-lock"></i>
              <span>Đã hết lượt hôm nay</span>
            </div>
          ) : (
            <button
              onClick={handleOpenChest}
              disabled={isOpening}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isOpening ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin text-amber-600"></i>
                  <span>Đang mở rương...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key text-amber-500"></i>
                  <span>{isGuest ? 'Đăng nhập mở rương' : 'Mở Rương Nhận Tiền'}</span>
                </>
              )}
            </button>
          )}

          {!hasClaimedThisArticle && !quota.isLimitReached && (
            <div className="text-[10px] text-white/80 mt-1.5">
              Tỷ lệ: 2k-4k (50%), 5k-10k (25%), 11k-15k (15%), 15k-20k (10%)
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup chúc mừng nhận quà */}
      {revealedReward && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl text-slate-800">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                {revealedReward.tierLabel}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Mở Rương Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tiền thưởng đã được cộng trực tiếp vào <strong>Ví Khuyến Mãi</strong> của bạn:
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300">
              <div className="text-2xl font-black text-emerald-700 font-mono">
                +{revealedReward.amount.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                Sử dụng ngay để đăng tin hoặc đẩy tin TOP 1
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Tiến độ hôm nay: <strong>{quota.count}/3 rương</strong>
            </div>

            <button
              onClick={() => setRevealedReward(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Tuyệt vời, tiếp tục xem tin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
