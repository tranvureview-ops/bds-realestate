'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import PredictionConfetti from '../components/PredictionConfetti';
import {
  getStoredPredictionPrograms,
  getStoredPredictions,
  recordUserPrediction,
  syncBotsForGame,
  awardBadgeToUser,
  formatRelativeTime,
  appendLiveBotPrediction,
  getIsPredictionMembershipRequired,
  PREDICTION_STORAGE_KEY,
  PREDICTION_MEMBERSHIP_KEY
} from '../services/predictionGameService';

// Đọc số tiền tỷ ra chữ Tiếng Việt giống logic phần Đăng tin
function getPriceInterpretation(rawVal) {
  if (!rawVal) return null;
  const num = Number(String(rawVal).replace(',', '.'));
  if (isNaN(num) || num <= 0) return null;

  let tyVal = num;
  if (num >= 1_000_000) {
    tyVal = +(num / 1e9).toFixed(3);
  } else if (num > 100 && num < 1_000_000) {
    tyVal = +(num / 1000).toFixed(3);
  }

  const totalVnd = Math.round(tyVal * 1e9);
  let textWords = '';
  if (totalVnd >= 1e9) {
    const ty = Math.floor(totalVnd / 1e9);
    const trieu = Math.round((totalVnd % 1e9) / 1e6);
    const tyText = ty >= 1000 ? ty.toLocaleString('vi-VN') : ty;
    textWords = trieu > 0 ? `${tyText} tỷ ${trieu} triệu đồng` : `${tyText} tỷ đồng`;
  } else if (totalVnd >= 1e6) {
    const trieu = Math.round(totalVnd / 1e6);
    textWords = `${trieu} triệu đồng`;
  } else {
    textWords = `${totalVnd.toLocaleString('vi-VN')} đồng`;
  }

  return {
    tyVal,
    formattedTy: `${tyVal.toString().replace('.', ',')} tỷ VNĐ`,
    textWords
  };
}

export default function PricePredictionPage({ projectSlug = null }) {
  const { currentUser, setCurrentUser, showToast, addBonusWalletBalance, systemConfig, predictionPrograms } = useRealEstate();
  
  // Danh sách chương trình dự đoán (Ưu tiên đồng bộ trực tiếp từ SSR initialData để chống giật/nhảy trang)
  const [programs, setPrograms] = useState(() => {
    if (Array.isArray(predictionPrograms) && predictionPrograms.length > 0) {
      return predictionPrograms;
    }
    return getStoredPredictionPrograms();
  });
  const [selectedGameId, setSelectedGameId] = useState(null);
  
  // Dữ liệu lượt dự đoán của user hiện tại
  const [userInputs, setUserInputs] = useState({});
  const [activeLeaderboardGame, setActiveLeaderboardGame] = useState(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all'); // 'all' | 'real_only' | 'my_prediction'
  
  // Animation Slot Machine / Thành công
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotSuccessModal, setSlotSuccessModal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const userId = currentUser && currentUser.role !== 'guest' ? String(currentUser.id) : 'guest';
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Nhà Đất';
  const isMemberActive = Boolean(currentUser?.membership?.packageId && new Date(currentUser?.membership?.expiresAt || 0) > new Date());

  // Trạng thái yêu cầu Gói Hội Viên toàn hệ thống (Real-time Cross-tab Sync)
  const [globalMembershipRequired, setGlobalMembershipRequired] = useState(() => {
    return getIsPredictionMembershipRequired();
  });

  // Tự động đồng bộ programs khi predictionPrograms từ context cập nhật
  useEffect(() => {
    if (Array.isArray(predictionPrograms) && predictionPrograms.length > 0) {
      setPrograms(predictionPrograms);
    }
  }, [predictionPrograms]);

  // Kiểm tra cấu hình Đặc Quyền Gói Hội Viên (Ưu tiên cấu hình từ Menu Gói Hội Viên toàn sàn)
  const isGameMembershipRequired = (game) => {
    if (globalMembershipRequired !== undefined && globalMembershipRequired !== null) {
      return Boolean(globalMembershipRequired);
    }
    if (systemConfig?.predictionRequireMembership !== undefined) {
      return Boolean(systemConfig.predictionRequireMembership);
    }
    return Boolean(game?.requireMembership);
  };

  // Lắng nghe sự kiện đồng bộ từ Admin (khi Admin bật/tắt Đặc quyền Hội Viên hoặc cập nhật chương trình)
  useEffect(() => {
    const handleMembershipToggle = (e) => {
      setGlobalMembershipRequired(Boolean(e.detail));
      setPrograms(getStoredPredictionPrograms());
    };

    const handleProgramsUpdate = (e) => {
      setPrograms(getStoredPredictionPrograms());
    };

    const handleStorageChange = (e) => {
      if (e.key === PREDICTION_MEMBERSHIP_KEY) {
        setGlobalMembershipRequired(e.newValue === 'true');
      }
      if (e.key === PREDICTION_STORAGE_KEY) {
        setPrograms(getStoredPredictionPrograms());
      }
    };

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('bds_prediction_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'PROGRAMS_UPDATED') {
            if (Array.isArray(event.data.programs)) {
              setPrograms(event.data.programs);
            } else {
              setPrograms(getStoredPredictionPrograms());
            }
          } else if (event.data?.type === 'MEMBERSHIP_TOGGLED') {
            setGlobalMembershipRequired(Boolean(event.data.isRequired));
            setPrograms(getStoredPredictionPrograms());
          }
        };
      } catch (e) {}
    }

    window.addEventListener('bds_prediction_membership_toggled', handleMembershipToggle);
    window.addEventListener('bds_prediction_programs_updated', handleProgramsUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Chủ động đồng bộ dữ liệu mới nhất từ server-db.json & Supabase Cloud qua /api/db-sync
    fetch('/api/db-sync')
      .then(res => res.json())
      .then(db => {
        if (Array.isArray(db.bds_prediction_programs) && db.bds_prediction_programs.length > 0) {
          try { localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(db.bds_prediction_programs)); } catch (e) {}
          setPrograms(db.bds_prediction_programs);
        }
        if (db.bds_prediction_membership_required !== undefined) {
          try { localStorage.setItem(PREDICTION_MEMBERSHIP_KEY, String(db.bds_prediction_membership_required)); } catch (e) {}
          setGlobalMembershipRequired(Boolean(db.bds_prediction_membership_required));
        }
      })
      .catch(() => {});

    return () => {
      if (bc) bc.close();
      window.removeEventListener('bds_prediction_membership_toggled', handleMembershipToggle);
      window.removeEventListener('bds_prediction_programs_updated', handleProgramsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Dữ liệu mẫu Live Ticker mặc định giúp SSR & Client đồng nhất 100% không bị giật/nhảy
  const DEFAULT_TICKER_ITEMS = useMemo(() => [
    { id: 'def-1', userName: 'Ngô B***', price: '5.54', timeText: 'vừa xong', isBot: true },
    { id: 'def-2', userName: '096***280', price: '5.68', timeText: '1 phút trước', isBot: true },
    { id: 'def-3', userName: 'Thùy Dương', price: '5.45', timeText: '2 phút trước', isBot: true },
    { id: 'def-4', userName: 'Lê A. Q***', price: '15.65', timeText: '3 phút trước', isBot: true },
    { id: 'def-5', userName: 'Đặng M***', price: '16.42', timeText: '5 phút trước', isBot: true },
    { id: 'def-6', userName: '090***618', price: '15.80', timeText: '7 phút trước', isBot: true },
    { id: 'def-7', userName: 'Trần Văn H***', price: '5.62', timeText: '10 phút trước', isBot: true }
  ], []);

  // Khởi tạo và đồng bộ bot ngầm nếu chưa có dữ liệu trong storage (không ép re-render layout)
  useEffect(() => {
    const loadedPrograms = getStoredPredictionPrograms();
    loadedPrograms.forEach(prog => {
      const existing = getStoredPredictions(prog.id);
      if (existing.length === 0 && prog.botConfig?.isEnabled === true && Number(prog.botConfig?.botCount || 0) > 0) {
        syncBotsForGame(prog.id, prog.botConfig, prog.startDate, prog.endDate);
      }
    });
  }, []);

  // Ref lưu programs cho timer để interval chạy ổn định, không bị restart gây giật trang
  const programsRef = useRef(programs);
  useEffect(() => {
    programsRef.current = programs;
  }, [programs]);

  // Mô phỏng dòng thời gian thực tế: Cứ mỗi 25 giây có thêm 1 lượt dự đoán mới tự nhiên
  useEffect(() => {
    const timer = setInterval(() => {
      const currentProgs = programsRef.current || [];
      const activeProgs = currentProgs.filter(p => p.status === 'active' && p.botConfig?.isEnabled === true && Number(p.botConfig?.botCount || 0) > 0);
      if (activeProgs.length === 0) return;
      const randomProg = activeProgs[Math.floor(Math.random() * activeProgs.length)];
      appendLiveBotPrediction(randomProg.id, randomProg.botConfig);
      setPrograms(getStoredPredictionPrograms());
    }, 25000);

    return () => clearInterval(timer);
  }, []);

  // Ticker Live FOMO Events (Sắp xếp ổn định theo thời gian, KHÔNG dùng Math.random() để triệt tiêu hiện tượng giật/nhảy)
  const tickerEvents = useMemo(() => {
    const events = [];
    programs.forEach(prog => {
      const records = getStoredPredictions(prog.id);
      // Lấy các lượt gần nhất của mỗi chương trình
      records.slice(0, 8).forEach((r, idx) => {
        events.push({
          id: `${prog.id}-${r.userId || r.userName || idx}`,
          userName: r.userName,
          price: r.predictedPrice,
          isBot: Boolean(r.is_bot),
          programTitle: prog.projectName || prog.title,
          timeText: formatRelativeTime(r.createdAt),
          createdAt: r.createdAt || new Date().toISOString()
        });
      });
    });

    if (events.length === 0) return DEFAULT_TICKER_ITEMS;

    return events
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 15);
  }, [programs, DEFAULT_TICKER_ITEMS]);

  // Kiểm tra xem User đã dự đoán cho chương trình này chưa
  const getUserPredictionForGame = (gameId) => {
    if (userId === 'guest') return null;
    const records = getStoredPredictions(gameId);
    return records.find(r => r.is_bot === 0 && String(r.userId) === userId) || null;
  };

  // Xử lý gửi dự đoán (User Thật is_bot = 0)
  const handleSubmitPrediction = (game, customPrice = null) => {
    if (!currentUser || currentUser.role === 'guest') {
      if (showToast) showToast('Vui lòng đăng nhập tài khoản để tham gia dự đoán và nhận tiền thưởng!', 'warning');
      return;
    }

    // Kiểm tra nếu chương trình yêu cầu Gói Hội Viên
    if (isGameMembershipRequired(game) && !isMemberActive) {
      if (showToast) showToast('Tính năng này là Đặc Quyền dành riêng cho Gói Hội Viên! Vui lòng đăng ký Gói Hội Viên để tham gia.', 'warning');
      return;
    }

    const priceToSubmit = Number(customPrice !== null ? customPrice : userInputs[game.id]?.price);

    if (!priceToSubmit || isNaN(priceToSubmit) || priceToSubmit <= 0) {
      if (showToast) showToast('Vui lòng nhập mức giá dự đoán hợp lệ (Số tỷ VNĐ, ví dụ: 15.65)!', 'warning');
      return;
    }

    // Bắt đầu hiệu ứng Slot Machine quay số
    setSlotSpinning(true);
    setSlotSuccessModal({
      game,
      predictedPrice: priceToSubmit,
      rewardAmount: 0
    });

    setTimeout(() => {
      setSlotSpinning(false);
      setShowConfetti(true);

      // Lưu bản ghi vào Storage (is_bot = 0)
      recordUserPrediction(game.id, currentUser, priceToSubmit, userInputs[game.id]?.chosenOption);

      // Cập nhật lại state chương trình
      setPrograms(getStoredPredictionPrograms());

      if (showToast) {
        showToast(`🎯 Đã ghi nhận dự đoán ${priceToSubmit} tỷ thành công!`, 'success');
      }
    }, 1200);
  };

  const displayGames = projectSlug
    ? programs.filter(g => g.slug === projectSlug)
    : programs;

  // Lấy dữ liệu Leaderboard cho Modal
  const activeLeaderboardData = useMemo(() => {
    if (!activeLeaderboardGame) return [];
    const all = getStoredPredictions(activeLeaderboardGame.id);

    if (leaderboardFilter === 'real_only') {
      return all.filter(r => !r.is_bot && r.is_bot !== 1);
    }
    if (leaderboardFilter === 'my_prediction') {
      return all.filter(r => r.is_bot === 0 && String(r.userId) === userId);
    }
    return all;
  }, [activeLeaderboardGame, leaderboardFilter, userId]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 relative">
      {/* Pháo hoa Confetti khi trúng giải / xác nhận */}
      {showConfetti && (
        <PredictionConfetti duration={4500} onComplete={() => setShowConfetti(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Dự đoán giá BĐS</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-900/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300 border border-indigo-500/30">
              <i className="fa-solid fa-chart-line text-amber-400"></i>
              Sân Chơi Thẩm Định Giá Cộng Đồng {brandName}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Dự Đoán Giá BĐS - Chia Thưởng Triệu Đồng Vào Ví
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Trổ tài thẩm định giá nhà đất và cùng nhận cơ hội chia đều tổng quỹ giải thưởng hấp dẫn khi Admin chốt kết quả sự kiện!
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-slate-300 font-semibold">Ví Khuyến Mãi của bạn</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/dang-tin"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-2 border border-white/10"
              >
                <span>Dùng Ví Đăng Tin</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. DÒNG TICKER CHẠY THÔNG BÁO LIÊN TỤC (TẠO HIỆU ỨNG FOMO - CỐ ĐỊNH CHIỀU CAO CHỐNG NHẢY TRANG) */}
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-indigo-200/60 rounded-2xl p-2.5 overflow-hidden flex items-center gap-3 shadow-xs min-h-[48px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-[11px] shrink-0 uppercase tracking-wider shadow-xs">
            <i className="fa-solid fa-bolt-lightning text-amber-300 animate-bounce"></i>
            <span>Live Ticker</span>
          </div>
          <div className="overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap flex items-center gap-6 text-xs text-slate-700 py-0.5 w-full">
            {tickerEvents.map((evt, idx) => (
              <div key={evt.id || `${evt.userName}-${idx}`} className="inline-flex items-center gap-2 shrink-0 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-user"></i>
                </div>
                <span className="font-bold text-slate-900">{evt.userName}</span>
                <span className="text-slate-400">•</span>
                <span>Dự đoán: <strong className="text-indigo-600 font-mono font-bold">{evt.price} tỷ</strong></span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <i className="fa-solid fa-check text-[9px]"></i>
                  <span>Đã ghi nhận</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. DANH SÁCH GAME DỰ ĐOÁN (BỐ CỤC LƯỚI 2 CỘT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {displayGames.map(game => {
            const userVote = getUserPredictionForGame(game.id);
            const hasVoted = Boolean(userVote);
            const isSettled = game.status === 'settled';
            const allVotes = getStoredPredictions(game.id);
            const totalParticipants = allVotes.length;

            return (
              <div
                key={game.id}
                className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between gap-5 transition overflow-hidden relative ${
                  isSettled ? 'border-amber-400/80 bg-amber-50/10' : 'border-slate-200/80 hover:border-indigo-300'
                } p-5 sm:p-6`}
              >
                {/* Badge trạng thái */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isSettled ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      <i className={`fa-solid ${isSettled ? 'fa-flag-checkered' : 'fa-circle-dot animate-pulse text-emerald-600'}`}></i>
                      <span>{isSettled ? 'Đã Chốt Kết Quả' : 'Đang Mở Dự Đoán'}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Hạn: {new Date(game.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveLeaderboardGame(game)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl cursor-pointer"
                  >
                    <i className="fa-solid fa-trophy text-amber-500"></i>
                    <span>Bảng Xếp Hạng ({totalParticipants.toLocaleString('vi-VN')})</span>
                  </button>
                </div>

                {/* Thông tin BĐS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={game.image}
                      alt={game.projectName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                        {game.location}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1" title={game.projectName}>
                        {game.projectName || game.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-left sm:text-right shrink-0">
                    <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Tổng Giải Thưởng</div>
                    <div className="text-lg font-black text-emerald-600 font-mono">
                      {(Number(game.totalPrize) || 2000000).toLocaleString('vi-VN')} đ Ví KM
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {totalParticipants.toLocaleString('vi-VN')} lượt tham gia
                    </div>
                  </div>
                </div>

                {/* NẾU ĐÃ CHỐT KẾT QUẢ (SETTLED BANNER) */}
                {isSettled && game.settledResult && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 border border-amber-300 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <i className="fa-solid fa-crown text-amber-600"></i>
                        <span>Giá Chuẩn (Trung Vị Người Thật): <strong className="text-base font-mono text-emerald-700">{game.settledResult.targetPrice} tỷ</strong></span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {game.settledResult.isSplitPrize ? 'Chia Đều Giải Thưởng' : 'Top Chiến Thắng'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Bảng Vinh Danh Người Thắng Giải:</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{game.settledResult.winners?.length || 0} người nhận thưởng</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                        {game.settledResult.winners?.map((w, wIdx) => {
                          const rankColor = w.rank === 1 ? 'bg-amber-500 text-slate-950 font-black' : w.rank === 2 ? 'bg-slate-300 text-slate-800 font-bold' : 'bg-orange-200 text-orange-950 font-bold';
                          return (
                            <div key={wIdx} className="p-2 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 ${rankColor}`}>
                                  #{w.rank || wIdx + 1}
                                </span>
                                <div className="truncate max-w-[115px]">
                                  <div className="font-bold text-slate-900 truncate">{w.userName}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{w.rewardBadge?.split('(')[0] || 'Trúng giải'}</div>
                                </div>
                              </div>
                              <div className="text-right font-mono shrink-0">
                                <div className="font-bold text-emerald-600">+{w.rewardAmount?.toLocaleString('vi-VN')}đ</div>
                                <div className="text-[9px] text-slate-400">Đoán: {w.predictedPrice} tỷ</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* NẾU ĐANG HOẠT ĐỘNG: KHUNG NHẬP GIÁ DỰ ĐOÁN THỦ CÔNG (CỐ ĐỊNH MIN-HEIGHT TRÁNH CO GIÃN THẺ) */}
                {!isSettled && (
                  <div className="pt-2 min-h-[58px] flex items-center">
                    {/* Ô Nhập Giá Thủ Công Chuẩn Giống Phần Đăng Tin */}
                    {hasVoted ? (
                      <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                            <i className="fa-solid fa-check"></i>
                          </span>
                          <div>
                            <div className="text-[11px] text-emerald-800 font-bold">Mức giá bạn đã dự đoán:</div>
                            <div className="text-base font-black text-emerald-700 font-mono">
                              {userVote.predictedPrice} tỷ VNĐ
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl font-bold border border-emerald-200 shrink-0">
                          Đã ghi nhận
                        </span>
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="VD: 7.50 hoặc 15.65"
                              value={userInputs[game.id]?.price || ''}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                setUserInputs(prev => ({
                                  ...prev,
                                  [game.id]: {
                                    ...prev[game.id],
                                    price: raw
                                  }
                                }));
                              }}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition pr-20 shadow-xs"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none pointer-events-none">
                              tỷ VNĐ
                            </span>
                          </div>

                          {isGameMembershipRequired(game) && !isMemberActive ? (
                            <Link
                              to="/goi-hoi-vien"
                              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                              title="Tính năng là đặc quyền dành riêng cho Gói Hội Viên. Bấm để đăng ký ngay!"
                            >
                              <i className="fa-solid fa-crown text-amber-300"></i>
                              <span>Đăng Ký Hội Viên Để Dự Đoán</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSubmitPrediction(game)}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <i className="fa-solid fa-paper-plane"></i>
                              <span>Dự Đoán</span>
                            </button>
                          )}
                        </div>

                        {/* Dòng chữ quy đổi mức giá dự đoán trực quan giống Đăng Tin */}
                        {(() => {
                          const interpretation = getPriceInterpretation(userInputs[game.id]?.price);
                          if (!interpretation) return null;

                          return (
                            <div className="text-xs text-slate-600 pt-0.5 animate-in fade-in duration-150">
                              Mức giá dự đoán: <strong className="font-bold text-slate-900">{interpretation.formattedTy}</strong>
                              {interpretation.textWords && (
                                <span className="text-emerald-700 font-semibold ml-1.5">
                                  ({interpretation.textWords})
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL QUAY SỐ / XÁC NHẬN DỰ ĐOÁN THÀNH CÔNG (SLOT MACHINE ANIMATION) */}
      {/* ========================================================================= */}
      {slotSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            {slotSpinning ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="text-lg font-black text-slate-900">
                  Đang khóa mức giá dự đoán của bạn...
                </div>
                <div className="text-2xl font-black font-mono text-indigo-600 animate-pulse">
                  {slotSuccessModal.predictedPrice} tỷ VNĐ
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-inner animate-bounce">
                  <i className="fa-solid fa-gift"></i>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    Xác Nhận Dự Đoán Thành Công!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hệ thống đã ghi nhận mức giá thẩm định của bạn vào bảng xếp hạng.
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="text-xs text-slate-600">Mức giá bạn dự đoán:</div>
                  <div className="text-2xl font-black font-mono text-emerald-700">
                    {slotSuccessModal.predictedPrice} tỷ VNĐ
                  </div>
                  <div className="pt-2 border-t border-emerald-200/70 text-center text-xs font-bold text-emerald-800">
                    Kết quả và giải thưởng sẽ được xét trao khi sự kiện kết thúc!
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSlotSuccessModal(null)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
                >
                  Tuyệt Vời • Tiếp Tục Khám Phá
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL LIVE LEADERBOARD (BẢNG XẾP HẠNG ĐÔNG ĐÚC) */}
      {/* ========================================================================= */}
      {activeLeaderboardGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-base">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Bảng Xếp Hạng Trực Tiếp (Live Leaderboard)
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {activeLeaderboardGame.projectName || activeLeaderboardGame.title}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLeaderboardGame(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Bộ lọc Tab */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeaderboardFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  leaderboardFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({getStoredPredictions(activeLeaderboardGame.id).length})
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardFilter('my_prediction')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  leaderboardFilter === 'my_prediction' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dự đoán của tôi
              </button>
            </div>

            {/* Danh sách bình chọn */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
              {activeLeaderboardData.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <i className="fa-solid fa-inbox text-3xl mb-2 block"></i>
                  <span>Chưa có lượt dự đoán nào theo bộ lọc này.</span>
                </div>
              ) : (
                activeLeaderboardData.slice(0, 30).map((record, rIdx) => {
                  const isCurrentUserRecord = record.is_bot === 0 && String(record.userId) === userId;
                  const rankNum = rIdx + 1;

                  // Màu huy hiệu thứ hạng
                  let rankBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (rankNum === 1) {
                    rankBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-black ring-1 ring-amber-200';
                  } else if (rankNum === 2) {
                    rankBadgeClass = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
                  } else if (rankNum === 3) {
                    rankBadgeClass = 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
                  }

                  return (
                    <div
                      key={record.id || rIdx}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isCurrentUserRecord
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono text-xs shrink-0 ${rankBadgeClass}`}>
                          #{rankNum}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{record.userName}</span>
                            {isCurrentUserRecord && (
                              <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                                BẠN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-500">{formatRelativeTime(record.createdAt)}</span>
                            <span>•</span>
                            <span>{new Date(record.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-indigo-700 font-mono text-sm">
                          {record.predictedPrice} tỷ
                        </div>
                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Đã khóa
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
              <span>Hiển thị tối đa 30 lượt tham gia mới nhất</span>
              <button
                type="button"
                onClick={() => setActiveLeaderboardGame(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
