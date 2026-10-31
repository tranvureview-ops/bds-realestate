'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PRICE_PREDICTION_GAMES } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function PricePredictionPage({ projectSlug = null }) {
  const { currentUser, showToast, addBonusWalletBalance, rewardsConfig, systemConfig } = useRealEstate();
  const initialGames = rewardsConfig?.predictionGames || PRICE_PREDICTION_GAMES;
  const [games, setGames] = useState(initialGames);
  const [userVotes, setUserVotes] = useState({});

  const userId = currentUser && currentUser.role !== 'guest' ? currentUser.id : 'guest';
  const bonusBal = Number(currentUser?.bonusWalletBalance || 0);
  const brandName = systemConfig?.brandShortName || systemConfig?.companyName || 'Sàn Bất Động Sản';

  useEffect(() => {
    if (rewardsConfig?.predictionGames) {
      setGames(rewardsConfig.predictionGames);
    }
  }, [rewardsConfig?.predictionGames]);

  // Load user votes from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`bds_prediction_votes_${userId}`);
      if (saved) {
        setUserVotes(JSON.parse(saved));
      }
    } catch (e) {}
  }, [userId]);

  const handleVote = (gameId, optionId, optionLabel) => {
    if (!currentUser || currentUser.role === 'guest') {
      if (showToast) showToast('Vui lòng đăng nhập để bình chọn và nhận tiền thưởng vào Ví KM!', 'info');
      return;
    }

    if (userVotes[gameId]) {
      if (showToast) showToast('Bạn đã bỏ phiếu cho phiên dự đoán này rồi!', 'info');
      return;
    }

    const updatedVotes = { ...userVotes, [gameId]: optionId };
    setUserVotes(updatedVotes);
    try {
      localStorage.setItem(`bds_prediction_votes_${userId}`, JSON.stringify(updatedVotes));
    } catch (e) {}

    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const nextTotal = (g.totalVotes || 0) + 1;
      const nextOptions = g.options.map(o => {
        const nextOVotes = o.id === optionId ? (o.votes || 0) + 1 : (o.votes || 0);
        return {
          ...o,
          votes: nextOVotes,
          percent: Math.round((nextOVotes / nextTotal) * 100)
        };
      });
      return {
        ...g,
        totalVotes: nextTotal,
        options: nextOptions
      };
    }));

    // Thưởng ngay 10.000đ vào Ví Khuyến Mãi khi tham gia bình chọn
    if (addBonusWalletBalance) {
      addBonusWalletBalance(10000, `Tham gia dự đoán: ${gameId}`);
    }

    if (showToast) {
      showToast(`🎯 Dự đoán thành công "${optionLabel}"! Đã cộng +10.000đ vào Ví KM và tham gia chia quỹ thưởng!`, 'success');
    }
  };

  const displayGames = projectSlug
    ? games.filter(g => g.slug === projectSlug)
    : games;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-emerald-700 transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/trung-tam-phan-thuong/" className="hover:text-emerald-700 transition">Trung tâm phần thưởng</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Dự đoán giá BĐS</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300">
              <i className="fa-solid fa-chart-line"></i>
              Sân Chơi Thẩm Định Giá Cộng Đồng {brandName}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Dự Đoán Giá BĐS - Chia Thưởng Triệu Đồng Vào Ví
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Dự đoán mức giá chốt thực tế các căn hộ và biệt thự. Thưởng ngay <strong>+10.000đ vào Ví KM</strong> mỗi lượt bình chọn và chia quỹ tiền mặt lên tới 8.000.000đ khi chốt phiên!
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div>
                <div className="text-[11px] text-white/70 font-semibold">Ví Khuyến Mãi của bạn</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +{bonusBal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <Link
              to="/dang-tin"
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition flex items-center gap-2"
            >
              <span>Dùng ví đăng tin</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="space-y-6">
          {displayGames.map(game => {
            const hasVoted = Boolean(userVotes[game.id]);

            return (
              <div
                key={game.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={game.image}
                      alt={game.projectName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {game.location}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        {game.projectName}
                      </h2>
                      <div className="text-xs text-slate-500 mt-1">
                        Khoảng giá tham chiếu: <strong className="text-emerald-700">{game.currentEstimate}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center sm:text-right shrink-0">
                    <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Quỹ thưởng vòng này</div>
                    <div className="text-lg font-black text-emerald-600 font-mono">{game.totalPool}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{(game.totalVotes || 0).toLocaleString('vi-VN')} người tham gia</div>
                  </div>
                </div>

                {/* Voting Options */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{hasVoted ? 'Kết quả bình chọn cộng đồng:' : 'Chọn mức giá dự đoán của bạn (Nhận ngay +10.000đ):'}</span>
                    {!hasVoted && (
                      <span className="text-[11px] text-emerald-600 font-bold">
                        +10.000đ vào Ví KM
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {game.options.map(opt => {
                      const isUserChoice = userVotes[game.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVote(game.id, opt.id, opt.label)}
                          disabled={hasVoted}
                          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                            isUserChoice
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                              : hasVoted
                              ? 'border-slate-200 bg-slate-50 cursor-default'
                              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                            {isUserChoice && (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                <i className="fa-solid fa-check"></i>
                              </span>
                            )}
                          </div>

                          {hasVoted && (
                            <div className="mt-3 relative z-10">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                <span>{opt.percent || 0}%</span>
                                <span>{opt.votes || 0} lượt</span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isUserChoice ? 'bg-blue-600' : 'bg-slate-400'}`}
                                  style={{ width: `${opt.percent || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
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
