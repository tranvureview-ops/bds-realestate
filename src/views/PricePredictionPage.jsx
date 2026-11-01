'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import PredictionConfetti from '../components/PredictionConfetti';
import {
  formatPriceToVietnameseText,
  formatSummaryPrice,
  getPriceSuggestions
} from '../components/PostListingModal';
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

// Quy đổi và format mức giá theo đúng chuẩn giao diện phần Đăng Tin
function getPriceInterpretation(rawVal) {
  if (!rawVal) return null;
  const cleanStr = String(rawVal).trim().replace(',', '.');
  const num = Number(cleanStr);
  if (isNaN(num) || num <= 0) return null;

  let totalVnd = 0;
  let tyVal = 0;

  if (cleanStr.includes('.') || num <= 500) {
    // Nhập dạng tỷ (ví dụ 3.4, 7.5, 15.65)
    tyVal = num;
    totalVnd = Math.round(num * 1e9);
  } else if (num < 100_000) {
    // Nhập số triệu (ví dụ 3500 triệu = 3.5 tỷ)
    totalVnd = Math.round(num * 1e6);
    tyVal = +(totalVnd / 1e9).toFixed(3);
  } else {
    // Nhập số tiền VNĐ đầy đủ (ví dụ 3400000000)
    totalVnd = Math.round(num);
    tyVal = +(totalVnd / 1e9).toFixed(3);
  }

  // Sử dụng chuẩn hàm của phần Đăng Tin
  const summaryText = formatSummaryPrice(totalVnd); // Ví dụ: "3,4 tỷ"
  const fullText = formatPriceToVietnameseText(totalVnd); // Ví dụ: "3 tỷ 400 triệu"

  return {
    totalVnd,
    tyVal,
    summaryText,
    fullText
  };
}

export default function PricePredictionPage({ projectSlug = null }) {
  const { currentUser, setCurrentUser, showToast, addBonusWalletBalance, systemConfig, predictionPrograms, membershipPackages } = useRealEstate();
  
  // Danh sách chương trình dự đoán (Ưu tiên đồng bộ trực tiếp từ SSR initialData để chống giật/nhảy trang)
  const [programs, setPrograms] = useState(() => {
    if (Array.isArray(predictionPrograms) && predictionPrograms.length > 0) {
      return predictionPrograms;
    }
    return getStoredPredictionPrograms();
  });
  const [selectedGameId, setSelectedGameId] = useState(null);
  
  // Quản lý Bảng Vinh Danh Người Trúng Thưởng Các Kỳ
  const [selectedHonorRoundId, setSelectedHonorRoundId] = useState(() => {
    const defaultPrograms = Array.isArray(predictionPrograms) && predictionPrograms.length > 0
      ? predictionPrograms
      : getStoredPredictionPrograms();
    const settled = defaultPrograms.find(p => p.status === 'settled' || Boolean(p.settledResult));
    return settled ? settled.id : (defaultPrograms[0]?.id || null);
  });

  const currentHonorGame = useMemo(() => {
    return programs.find(p => p.id === selectedHonorRoundId) 
      || programs.find(p => p.status === 'settled' || Boolean(p.settledResult))
      || programs[0];
  }, [programs, selectedHonorRoundId]);

  const currentWinners = useMemo(() => {
    if (!currentHonorGame?.settledResult?.winners) return [];
    return [...currentHonorGame.settledResult.winners].sort((a, b) => (a.rank || 99) - (b.rank || 99));
  }, [currentHonorGame]);

  const top1Winner = currentWinners.find(w => w.rank === 1) || currentWinners[0];
  const top2Winner = currentWinners.find(w => w.rank === 2) || currentWinners[1];
  const top3Winner = currentWinners.find(w => w.rank === 3) || currentWinners[2];
  
  // Dữ liệu lượt dự đoán của user hiện tại
  const [userInputs, setUserInputs] = useState({});
  const [activeLeaderboardGame, setActiveLeaderboardGame] = useState(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all'); // 'all' | 'real_only' | 'my_prediction'
  const [voteSyncTick, setVoteSyncTick] = useState(0);
  
  // Animation Slot Machine / Thành công
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotSuccessModal, setSlotSuccessModal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const userId = currentUser && currentUser.role !== 'guest' ? String(currentUser.id) : 'guest';
  const isAdmin = currentUser?.role === 'admin';
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Nhà Đất';
  const isMemberActive = Boolean(currentUser?.membership?.packageId && (currentUser?.membership?.status === 'active' || new Date(currentUser?.membership?.expiresAt || 0) > new Date()));
  const activeUserPkg = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
  const isMemberPredictionAllowed = isMemberActive && activeUserPkg?.allowPricePrediction !== false;

  // Trạng thái yêu cầu Gói Hội Viên toàn hệ thống (Real-time Cross-tab Sync)
  const [globalMembershipRequired, setGlobalMembershipRequired] = useState(() => {
    if (systemConfig?.predictionRequireMembership !== undefined) {
      return Boolean(systemConfig.predictionRequireMembership);
    }
    return getIsPredictionMembershipRequired();
  });

  useEffect(() => {
    if (systemConfig?.predictionRequireMembership !== undefined) {
      setGlobalMembershipRequired(Boolean(systemConfig.predictionRequireMembership));
    }
  }, [systemConfig?.predictionRequireMembership]);

  // Tự động đồng bộ programs khi predictionPrograms từ context cập nhật
  useEffect(() => {
    if (Array.isArray(predictionPrograms) && predictionPrograms.length > 0) {
      setPrograms(predictionPrograms);
    }
  }, [predictionPrograms]);

  // Kiểm tra cấu hình Đặc Quyền Gói Hội Viên (Ưu tiên theo cờ toàn hệ thống)
  const isGameMembershipRequired = (game) => {
    // 1. Cờ toàn hệ thống từ state / localStorage / systemConfig có độ ưu tiên cao nhất
    if (globalMembershipRequired === false || systemConfig?.predictionRequireMembership === false) {
      return false;
    }
    if (globalMembershipRequired === true || systemConfig?.predictionRequireMembership === true) {
      return true;
    }

    // 2. Nếu cấu hình gói hội viên toàn sàn: có bật allowPricePrediction cho ít nhất 1 gói
    const hasPkgPrediction = Array.isArray(membershipPackages) && membershipPackages.some(p => p.allowPricePrediction === true);
    if (hasPkgPrediction) {
      return true;
    }

    // 3. Fallback theo từng chương trình minigame
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

    const handleVotesUpdate = () => {
      setVoteSyncTick(t => t + 1);
    };

    const handleStorageChange = (e) => {
      if (e.key === PREDICTION_MEMBERSHIP_KEY) {
        setGlobalMembershipRequired(e.newValue === 'true');
      }
      if (e.key === PREDICTION_STORAGE_KEY) {
        setPrograms(getStoredPredictionPrograms());
      }
      if (e.key && e.key.startsWith(PREDICTION_VOTES_KEY)) {
        setVoteSyncTick(t => t + 1);
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
          } else if (event.data?.type === 'VOTES_UPDATED') {
            setVoteSyncTick(t => t + 1);
          }
        };
      } catch (e) {}
    }

    window.addEventListener('bds_prediction_membership_toggled', handleMembershipToggle);
    window.addEventListener('bds_prediction_programs_updated', handleProgramsUpdate);
    window.addEventListener('bds_prediction_votes_updated', handleVotesUpdate);
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
      window.removeEventListener('bds_prediction_votes_updated', handleVotesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Dữ liệu mẫu Live Ticker mặc định giúp SSR & Client đồng nhất 100% không bị giật/nhảy
  const DEFAULT_TICKER_ITEMS = useMemo(() => [
    { id: 'def-1', userName: 'Ngô B***', price: '5.54', totalPrize: '2.000.000đ', timeText: 'vừa xong', isBot: true },
    { id: 'def-2', userName: '096***280', price: '5.68', totalPrize: '3.000.000đ', timeText: '1 phút trước', isBot: true },
    { id: 'def-3', userName: 'Thùy Dương', price: '5.45', totalPrize: '2.000.000đ', timeText: '2 phút trước', isBot: true },
    { id: 'def-4', userName: 'Lê A. Q***', price: '15.65', totalPrize: '2.000.000đ', timeText: '3 phút trước', isBot: true },
    { id: 'def-5', userName: 'Đặng M***', price: '16.42', totalPrize: '3.000.000đ', timeText: '5 phút trước', isBot: true },
    { id: 'def-6', userName: '090***618', price: '15.80', totalPrize: '2.000.000đ', timeText: '7 phút trước', isBot: true },
    { id: 'def-7', userName: 'Trần Văn H***', price: '5.62', totalPrize: '3.000.000đ', timeText: '10 phút trước', isBot: true }
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
          totalPrize: (Number(prog.totalPrize) || 2000000).toLocaleString('vi-VN') + ' đ Ví KM',
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
    if (isGameMembershipRequired(game)) {
      if (!isMemberActive) {
        if (showToast) showToast('Tính năng này là Đặc Quyền dành riêng cho Gói Hội Viên! Vui lòng đăng ký Gói Hội Viên để tham gia.', 'warning');
        return;
      }
      if (!isMemberPredictionAllowed) {
        if (showToast) showToast(`Gói hội viên "${activeUserPkg?.name || 'hiện tại'}" chưa hỗ trợ tiện ích Dự đoán giá BĐS. Vui lòng nâng cấp gói để tham gia!`, 'warning');
        return;
      }
    }

    // Kiểm tra nếu chương trình đã hết hạn hoặc đã chốt kết quả
    const isExpired = Boolean(game.endDate && new Date(game.endDate) < new Date());
    if (isExpired || game.status === 'settled') {
      if (showToast) showToast('Chương trình dự đoán giá này đã hết hạn nhận bài tham gia!', 'warning');
      return;
    }

    const rawVal = customPrice !== null ? customPrice : userInputs[game.id]?.price;
    const interpretation = getPriceInterpretation(rawVal);
    const priceToSubmit = interpretation?.tyVal;

    if (!priceToSubmit || isNaN(priceToSubmit) || priceToSubmit <= 0) {
      if (showToast) showToast('Vui lòng nhập mức giá dự đoán hợp lệ (ví dụ: 15.65)!', 'warning');
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
  }, [activeLeaderboardGame, leaderboardFilter, userId, voteSyncTick]);

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
          <div className="overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-nowrap flex items-center gap-4 text-xs text-slate-700 py-0.5 w-full">
            {tickerEvents.map((evt, idx) => (
              <div key={evt.id || `${evt.userName}-${idx}`} className="inline-flex items-center gap-2 shrink-0 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-[10px] shrink-0">
                  <i className="fa-solid fa-user"></i>
                </div>
                <span className="font-bold text-slate-900">{evt.userName}</span>
                <span>vừa gia nhập <strong className="text-slate-900 font-bold">Dự đoán giá BĐS</strong> với mức giá <strong className="text-indigo-600 font-mono font-black">{evt.price} tỷ</strong>!</span>
                <span className="text-amber-800 font-medium">Tổng giải thưởng <strong className="text-emerald-700 font-mono font-black">{evt.totalPrize || '2.000.000 đ Ví KM'}</strong> đang rung lắc dữ dội!</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                  <i className="fa-solid fa-check text-[9px]"></i>
                  <span>Đã ghi nhận</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nút điều hướng nhanh */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <a
              href="#bang-vinh-danh"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-trophy"></i>
              <span>🏆 Bảng Vinh Danh Trúng Thưởng</span>
            </a>
            <a
              href="#cac-ky-du-doan"
              className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-chart-line text-indigo-600"></i>
              <span>Các Kỳ Mở Dự Đoán Giá</span>
            </a>
          </div>
          <div className="text-xs text-slate-500 font-semibold hidden sm:block">
            Cập nhật kết quả trao giải thực tế từ hội đồng thẩm định
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🏆 BẢNG VINH DANH NGƯỜI TRÚNG THƯỞNG CÁC KỲ (HALL OF FAME & WINNERS PODIUM) */}
        {/* ========================================================================= */}
        <section id="bang-vinh-danh" className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-8 shadow-2xl border border-amber-500/30 space-y-6">
          {/* Ánh kim trang trí mờ ảo */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider">
                <i className="fa-solid fa-crown text-amber-400"></i>
                Bảng Vinh Danh Danh Dự • Hall of Fame
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Vinh Danh Người Trúng Thưởng Các Giải Của Kỳ</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Tôn vinh các thẩm định viên tài ba có mức giá dự đoán sát với giá chuẩn thực tế nhất của từng kỳ. Tiền thưởng được giải ngân 100% vào Ví Khuyến Mãi.
              </p>
            </div>

            {/* Thống kê giải ngân nhanh */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 rounded-2xl px-4 py-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-sm">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Tổng Thưởng Đã Trao</div>
                <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
                  +2.000.000 đ Ví KM
                </div>
              </div>
            </div>
          </div>

          {/* Tab chọn Kỳ Dự Đoán (Round Switcher) */}
          <div className="relative z-10 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-calendar-check text-amber-400"></i>
              <span>Chọn Kỳ Dự Đoán Để Xem Vinh Danh:</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none pb-1">
              {programs.map((prog, pIdx) => {
                const isSelected = prog.id === currentHonorGame?.id;
                const isExpired = Boolean(prog.endDate && new Date(prog.endDate) < new Date());
                const isSettled = prog.status === 'settled' || Boolean(prog.settledResult);
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => setSelectedHonorRoundId(prog.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/40 font-black'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-black ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {pIdx + 1}
                    </span>
                    <span className="truncate max-w-[180px] sm:max-w-[220px]">
                      {prog.title || prog.projectName}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSettled
                        ? isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isExpired
                        ? isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {isSettled ? 'Đã Trao Thưởng' : isExpired ? 'Đã Hết Hạn' : 'Đang Mở'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nội dung Kỳ đang chọn */}
          {currentHonorGame && (
            <div className="relative z-10 space-y-6">
              
              {/* Thống kê Tổng Kết Của Kỳ Đang Xem */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-bullseye text-emerald-400"></i>
                    <span>Giá Chốt Thực Tế</span>
                  </div>
                  <div className="text-base sm:text-xl font-black text-emerald-400 font-mono">
                    {currentHonorGame.settledResult?.targetPrice || currentHonorGame.targetPrice || currentHonorGame.basePrice} tỷ VNĐ
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentHonorGame.settledResult ? 'Trung vị người thật thẩm định' : 'Mức giá tham chiếu dự kiến'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-gift text-amber-400"></i>
                    <span>Tổng Quỹ Giải Thưởng</span>
                  </div>
                  <div className="text-base sm:text-xl font-black text-amber-300 font-mono">
                    {(Number(currentHonorGame.totalPrize) || 2000000).toLocaleString('vi-VN')} đ Ví KM
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentHonorGame.settledResult ? 'Đã giải ngân 100% vào Ví' : 'Chờ trao khi kết thúc sự kiện'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-users text-indigo-400"></i>
                    <span>Lượt Người Tham Gia</span>
                  </div>
                  <div className="text-base sm:text-xl font-black text-white font-mono">
                    {(currentHonorGame.settledResult?.totalParticipants || getStoredPredictions(currentHonorGame.id).length || 1420).toLocaleString('vi-VN')} lượt
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Cộng đồng thẩm định BĐS
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-clock-rotate-left text-cyan-400"></i>
                    <span>Trạng Thái Kỳ</span>
                  </div>
                  <div className="text-sm sm:text-base font-black font-mono">
                    {currentHonorGame.settledResult ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-check text-xs"></i>
                        Đã Trao Giải
                      </span>
                    ) : (
                      <span className="text-indigo-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                        Đang Bình Chọn
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentHonorGame.settledResult
                      ? `Chốt ngày ${new Date(currentHonorGame.settledResult.settledAt || '2026-10-31').toLocaleDateString('vi-VN')}`
                      : 'Kết quả sẽ được công bố sớm'}
                  </div>
                </div>
              </div>

              {/* NẾU KỲ ĐÃ CHỐT: BỤC VINH DANH TOP 3 & BẢNG CHI TIẾT */}
              {currentHonorGame.settledResult && currentWinners.length > 0 ? (
                <div className="space-y-8 pt-2">
                  
                  {/* BỤC VINH DANH TOP 3 (PODIUM) */}
                  <div className="p-6 rounded-3xl bg-slate-950/60 border border-amber-500/20 backdrop-blur-md">
                    <div className="text-center space-y-1 mb-8">
                      <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-2">
                        <i className="fa-solid fa-medal text-amber-400"></i>
                        <span>Bục Vinh Danh Top 3 Bậc Thầy Thẩm Định Giá</span>
                        <i className="fa-solid fa-medal text-amber-400"></i>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Top 3 người dự đoán có độ sai số thấp nhất so với giá chốt thẩm định thực tế ({currentHonorGame.settledResult.targetPrice} tỷ)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end max-w-4xl mx-auto">
                      
                      {/* #2: Á QUÂN (GIẢI NHÌ) - BÊN TRÁI */}
                      {top2Winner && (
                        <div className="order-2 sm:order-1 flex flex-col items-center text-center space-y-3">
                          <div className="relative">
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-3 border-slate-300 p-0.5 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-lg shadow-slate-400/20 mx-auto flex items-center justify-center overflow-hidden">
                              <img src={top2Winner.userAvatar || '/avatars/ai-preset-2.jpg'} alt={top2Winner.userName} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] shadow-sm uppercase">
                              #2 Á Quân
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <div className="font-black text-sm text-white truncate max-w-[200px]" title={top2Winner.userName}>
                              {top2Winner.userName}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              Đoán: <strong className="text-slate-100 font-mono font-black">{top2Winner.predictedPrice} tỷ</strong>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Lệch: {top2Winner.diff !== undefined ? `${top2Winner.diff} tỷ` : '0.01 tỷ'}
                            </div>
                          </div>

                          {/* Bục Á Quân */}
                          <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-b from-slate-400/20 via-slate-500/10 to-slate-900 border-t-2 border-x border-slate-400/50 flex flex-col items-center justify-center p-3 shadow-inner space-y-1">
                            <span className="text-xs font-black text-slate-300">GIẢI NHÌ</span>
                            <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                              +{top2Winner.rewardAmount?.toLocaleString('vi-VN')} đ
                            </div>
                            <span className="text-[9px] text-slate-400">Ví Khuyến Mãi</span>
                          </div>
                        </div>
                      )}

                      {/* #1: QUÁN QUÂN (GIẢI NHẤT) - Ở GIỮA, CAO NHẤT */}
                      {top1Winner && (
                        <div className="order-1 sm:order-2 flex flex-col items-center text-center space-y-3">
                          <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl shadow-amber-500/40 mx-auto flex items-center justify-center overflow-hidden animate-pulse">
                              <img src={top1Winner.userAvatar || '/avatars/ai-preset-1.jpg'} alt={top1Winner.userName} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl text-amber-300 drop-shadow-lg animate-bounce">
                              <i className="fa-solid fa-crown"></i>
                            </div>
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] shadow-md uppercase tracking-wider">
                              #1 Quán Quân
                            </span>
                          </div>

                          <div className="space-y-0.5 pt-1">
                            <div className="font-black text-base text-amber-300 truncate max-w-[220px]" title={top1Winner.userName}>
                              {top1Winner.userName}
                            </div>
                            <div className="text-xs text-slate-200">
                              Đoán: <strong className="text-amber-300 font-mono font-black text-sm">{top1Winner.predictedPrice} tỷ</strong>
                            </div>
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                              <i className="fa-solid fa-check"></i>
                              <span>Chính xác 100% (Lệch: 0.00 tỷ)</span>
                            </div>
                          </div>

                          {/* Bục Quán Quân Cao Nhất */}
                          <div className="w-full h-36 sm:h-44 rounded-t-3xl bg-gradient-to-b from-amber-500/30 via-amber-600/15 to-slate-900 border-t-3 border-x-2 border-amber-400 flex flex-col items-center justify-center p-3 shadow-xl shadow-amber-500/10 space-y-1.5">
                            <div className="flex items-center gap-1 text-xs font-black text-amber-300">
                              <i className="fa-solid fa-trophy"></i>
                              <span>QUÁN QUÂN</span>
                            </div>
                            <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono">
                              +{top1Winner.rewardAmount?.toLocaleString('vi-VN')} đ
                            </div>
                            <span className="text-[10px] font-bold text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                              {top1Winner.rewardBadge || 'Thần Phán Đoán BĐS ★'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* #3: GIẢI BA (QUÝ QUÂN) - BÊN PHẢI */}
                      {top3Winner && (
                        <div className="order-3 flex flex-col items-center text-center space-y-3">
                          <div className="relative">
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-3 border-orange-400 p-0.5 bg-gradient-to-tr from-amber-700 via-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 mx-auto flex items-center justify-center overflow-hidden">
                              <img src={top3Winner.userAvatar || '/avatars/ai-preset-1.jpg'} alt={top3Winner.userName} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-black text-[10px] shadow-sm uppercase">
                              #3 Giải Ba
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <div className="font-black text-sm text-white truncate max-w-[200px]" title={top3Winner.userName}>
                              {top3Winner.userName}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              Đoán: <strong className="text-slate-100 font-mono font-black">{top3Winner.predictedPrice} tỷ</strong>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Lệch: {top3Winner.diff !== undefined ? `${top3Winner.diff} tỷ` : '0.01 tỷ'}
                            </div>
                          </div>

                          {/* Bục Giải Ba */}
                          <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-orange-600/20 via-orange-700/10 to-slate-900 border-t-2 border-x border-orange-500/50 flex flex-col items-center justify-center p-3 shadow-inner space-y-1">
                            <span className="text-xs font-black text-orange-300">GIẢI BA</span>
                            <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                              +{top3Winner.rewardAmount?.toLocaleString('vi-VN')} đ
                            </div>
                            <span className="text-[9px] text-slate-400">Ví Khuyến Mãi</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* BẢNG CHI TIẾT TẤT CẢ NGƯỜI TRÚNG THƯỞNG CỦA KỲ */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <i className="fa-solid fa-list-ol text-amber-400"></i>
                        <span>Chi Tiết Toàn Bộ Danh Sách Trúng Giải:</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Đã cộng ví 100%</span>
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-[11px] text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-4 font-bold">Thứ Hạng</th>
                            <th className="py-3 px-4 font-bold">Người Trúng Giải</th>
                            <th className="py-3 px-4 font-bold text-center">Giá Dự Đoán</th>
                            <th className="py-3 px-4 font-bold text-center">Độ Lệch</th>
                            <th className="py-3 px-4 font-bold text-right">Tiền Thưởng Ví KM</th>
                            <th className="py-3 px-4 font-bold text-center">Danh Hiệu Vinh Danh</th>
                            <th className="py-3 px-4 font-bold text-center">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {currentWinners.map((winner, wIdx) => {
                            const isFirst = winner.rank === 1;
                            const isSecond = winner.rank === 2;
                            const isThird = winner.rank === 3;

                            return (
                              <tr key={wIdx} className={`hover:bg-white/5 transition ${
                                isFirst ? 'bg-amber-500/10 font-medium' : ''
                              }`}>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-mono text-xs font-black shadow-xs ${
                                    isFirst
                                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                      : isSecond
                                      ? 'bg-slate-300 text-slate-950'
                                      : isThird
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    #{winner.rank || wIdx + 1}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                                      <img
                                        src={winner.userAvatar || '/avatars/ai-preset-1.jpg'}
                                        alt={winner.userName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className={`font-bold text-xs ${isFirst ? 'text-amber-300 font-black' : 'text-white'}`}>
                                        {winner.userName}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {winner.awardedAt || '31/10/2026 20:00'}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <span className="font-mono font-bold text-amber-300 text-sm">
                                    {winner.predictedPrice} tỷ
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <span className={`text-[11px] font-mono font-bold ${
                                    winner.diff === 0 || winner.diff === 0.00
                                      ? 'text-emerald-400'
                                      : 'text-slate-300'
                                  }`}>
                                    {winner.diff !== undefined ? `${winner.diff} tỷ` : '0.00 tỷ'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="font-mono font-black text-amber-300 text-sm">
                                    +{winner.rewardAmount?.toLocaleString('vi-VN')} đ
                                  </div>
                                  <div className="text-[9px] text-slate-400">Cộng trực tiếp Ví KM</div>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    isFirst
                                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                      : isSecond
                                      ? 'bg-slate-300/20 text-slate-200 border-slate-300/30'
                                      : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                  }`}>
                                    {isFirst && <i className="fa-solid fa-crown text-[9px] text-amber-400"></i>}
                                    <span>{winner.rewardBadge || 'Thần Phán Đoán BĐS ★'}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    <i className="fa-solid fa-circle-check text-[9px]"></i>
                                    <span>Đã nhận ví</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                /* NẾU KỲ CHƯA CHỐT KẾT QUẢ (ĐANG MỞ BÌNH CHỌN) */
                <div className="p-8 rounded-3xl bg-slate-950/70 border border-indigo-500/30 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/30 animate-pulse">
                    <i className="fa-solid fa-hourglass-half"></i>
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg font-black text-white">
                      Kỳ Này Đang Mở Bình Chọn & Thẩm Định Giá
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hệ thống đang mở cổng để cộng đồng tham gia dự đoán mức giá chuẩn. Bảng vinh danh người chiến thắng sẽ được công bố ngay khi Admin kết thúc sự kiện!
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs">
                    <span className="text-slate-400">Tổng giải thưởng đang đón chờ:</span>
                    <strong className="text-amber-300 font-mono font-black text-sm">
                      {(Number(currentHonorGame.totalPrize) || 2000000).toLocaleString('vi-VN')} đ Ví KM
                    </strong>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`#game-${currentHonorGame.id}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md cursor-pointer active:scale-95"
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Dự Đoán Mức Giá Kỳ Này Ngay</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          )}
        </section>

        {/* Tiêu đề Section 2: Danh sách các kỳ đang mở dự đoán */}
        <div id="cac-ky-du-doan" className="pt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-fire text-amber-500"></i>
              <span>Các Kỳ Thẩm Định Giá Đang Mở</span>
            </h2>
            <p className="text-xs text-slate-500">
              Nhập mức giá thẩm định chuẩn xác để có cơ hội vinh danh và nhận thưởng vào Ví Khuyến Mãi
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            {displayGames.length} chương trình
          </span>
        </div>

        {/* 3. DANH SÁCH GAME DỰ ĐOÁN (BỐ CỤC LƯỚI 2 CỘT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {displayGames.map(game => {
            const userVote = getUserPredictionForGame(game.id);
            const hasVoted = Boolean(userVote);
            const isExpired = Boolean(game.endDate && new Date(game.endDate) < new Date());
            const isSettled = game.status === 'settled';
            const isClosed = isSettled || isExpired;
            const allVotes = getStoredPredictions(game.id);
            const totalParticipants = allVotes.length;

            return (
              <div
                key={game.id}
                id={`game-${game.id}`}
                className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between gap-5 transition overflow-hidden relative ${
                  isSettled 
                    ? 'border-amber-400/80 bg-amber-50/10' 
                    : isExpired
                    ? 'border-rose-200 bg-rose-50/15'
                    : 'border-slate-200/80 hover:border-indigo-300'
                } p-5 sm:p-6`}
              >
                {/* Badge trạng thái */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      isSettled 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : isExpired
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      <i className={`fa-solid ${
                        isSettled ? 'fa-flag-checkered text-amber-600' : isExpired ? 'fa-lock text-rose-600' : 'fa-circle-dot animate-pulse text-emerald-600'
                      }`}></i>
                      <span>
                        {isSettled ? 'Đã Chốt Kết Quả' : isExpired ? 'Đã Hết Hạn Dự Đoán' : 'Đang Mở Dự Đoán'}
                      </span>
                    </span>
                    <span className={`text-[11px] font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      Hạn: {new Date(game.endDate).toLocaleDateString('vi-VN')} {isExpired && '(Đã hết hạn)'}
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
                      alt={game.title || game.projectName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                        {game.location}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1" title={game.title || game.projectName}>
                        {game.title || game.projectName}
                      </h2>
                      {game.projectName && game.title && game.projectName !== game.title && (
                        <div className="text-xs text-slate-500 font-medium truncate mt-0.5" title={game.projectName}>
                          {game.projectName}
                        </div>
                      )}
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

                {/* NẾU ĐÃ HẾT HẠN (CHỜ ADMIN CHỐT KẾT QUẢ) */}
                {isExpired && !isSettled && (
                  <div className="pt-2 min-h-[58px] flex items-center">
                    {hasVoted ? (
                      <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                            <i className="fa-solid fa-lock"></i>
                          </span>
                          <div>
                            <div className="text-[11px] text-slate-700 font-bold">Đã hết hạn • Mức giá bạn đã dự đoán:</div>
                            <div className="text-base font-black text-slate-800 font-mono">
                              {userVote.predictedPrice} tỷ
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-xl font-bold border border-slate-300 shrink-0">
                          Chờ Chốt Giải
                        </span>
                      </div>
                    ) : (
                      <div className="w-full p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold shrink-0">
                            <i className="fa-solid fa-lock"></i>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Đã Hết Hạn Nhận Dự Đoán</div>
                            <div className="text-[11px] text-slate-500">Cổng dự đoán đã đóng vào {new Date(game.endDate).toLocaleDateString('vi-VN')}. Đang chờ công bố kết quả.</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveLeaderboardGame(game)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          Xem BXH
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* NẾU ĐANG HOẠT ĐỘNG VÀ CHƯA HẾT HẠN: KHUNG NHẬP GIÁ DỰ ĐOÁN THỦ CÔNG */}
                {!isClosed && (
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
                              {userVote.predictedPrice} tỷ
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
                              placeholder={
                                isGameMembershipRequired(game) && !isMemberActive
                                  ? "Yêu cầu Gói Hội Viên để dự đoán"
                                  : isGameMembershipRequired(game) && !isMemberPredictionAllowed
                                  ? `Gói ${activeUserPkg?.name || 'hiện tại'} không hỗ trợ`
                                  : "Nhập mức giá dự đoán"
                              }
                              disabled={isGameMembershipRequired(game) && (!isMemberActive || !isMemberPredictionAllowed)}
                              value={userInputs[game.id]?.price || ''}
                              onChange={(e) => {
                                const inputVal = e.target.value;
                                // Chỉ cho phép nhập số, dấu chấm (.) và dấu phẩy (,)
                                const cleaned = inputVal.replace(/[^0-9.,]/g, '');
                                
                                // Đảm bảo chỉ có tối đa một dấu ngăn cách thập phân (. hoặc ,)
                                let separatorFound = false;
                                let formatted = '';
                                for (let i = 0; i < cleaned.length; i++) {
                                  const c = cleaned[i];
                                  if (c === '.' || c === ',') {
                                    if (!separatorFound) {
                                      formatted += c;
                                      separatorFound = true;
                                    }
                                  } else {
                                    formatted += c;
                                  }
                                }

                                // Giới hạn tối đa 3 chữ số sau phần thập phân
                                if (separatorFound) {
                                  const sep = formatted.includes(',') ? ',' : '.';
                                  const parts = formatted.split(sep);
                                  if (parts[1] && parts[1].length > 3) {
                                    formatted = `${parts[0]}${sep}${parts[1].slice(0, 3)}`;
                                  }
                                }

                                setUserInputs(prev => ({
                                  ...prev,
                                  [game.id]: {
                                    ...prev[game.id],
                                    price: formatted
                                  }
                                }));
                              }}
                              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-black text-slate-900 outline-none transition shadow-xs ${
                                isGameMembershipRequired(game) && (!isMemberActive || !isMemberPredictionAllowed)
                                  ? 'border-purple-200 bg-slate-50 cursor-not-allowed opacity-80'
                                  : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
                              }`}
                            />
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
                          ) : isGameMembershipRequired(game) && isMemberActive && !isMemberPredictionAllowed ? (
                            <Link
                              to="/goi-hoi-vien"
                              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                              title={`Gói "${activeUserPkg?.name || ''}" chưa hỗ trợ dự đoán giá. Bấm để nâng cấp gói!`}
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-white"></i>
                              <span>Nâng Cấp Gói Để Dự Đoán</span>
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

                        {/* Gợi ý các mức giá chuẩn (Suggestion Pills giống phần Đăng Tin) */}
                        {(() => {
                          const currentVal = userInputs[game.id]?.price;
                          const suggestions = getPriceSuggestions(currentVal);
                          if (!suggestions || suggestions.length === 0) return null;

                          const interpretation = getPriceInterpretation(currentVal);
                          const currentTotalVnd = interpretation?.totalVnd || 0;

                          return (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 animate-in fade-in duration-150">
                              {suggestions.map((item) => {
                                const isSelected = Math.abs(currentTotalVnd - item.value) < 1000;
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                      const ty = +(item.value / 1e9).toFixed(3);
                                      const formattedVal = ty >= 1 ? String(ty) : String(item.value);
                                      setUserInputs(prev => ({
                                        ...prev,
                                        [game.id]: {
                                          ...prev[game.id],
                                          price: formattedVal
                                        }
                                      }));
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                                      isSelected
                                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{item.label}</span>
                                    {isSelected && <i className="fa-solid fa-check text-[10px] text-emerald-400"></i>}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Dòng chữ quy đổi tổng trị giá giống hệt phần Đăng Tin */}
                        {(() => {
                          const interpretation = getPriceInterpretation(userInputs[game.id]?.price);
                          if (!interpretation) return null;

                          return (
                            <div className="text-xs text-slate-700 pt-1 animate-in fade-in duration-150 flex flex-wrap items-center gap-1.5">
                              <span>Mức giá dự đoán:</span>
                              <strong className="font-bold text-slate-900">{interpretation.summaryText}</strong>
                              {interpretation.fullText && interpretation.fullText !== interpretation.summaryText && (
                                <span className="text-emerald-700 font-semibold">
                                  ({interpretation.fullText})
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
