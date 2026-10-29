'use client';

import React, { useState } from 'react';
import { PRICE_PREDICTION_GAMES } from '../data/rewardData';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function PricePredictionPage({ projectSlug = null }) {
  const [games, setGames] = useState(PRICE_PREDICTION_GAMES);
  const [userVotes, setUserVotes] = useState({});
  const { showToast } = useRealEstate();

  const handleVote = (gameId, optionId, optionLabel) => {
    if (userVotes[gameId]) {
      if (showToast) showToast('Bạn đã bỏ phiếu cho phiên dự đoán này rồi!', 'info');
      return;
    }

    setUserVotes(prev => ({ ...prev, [gameId]: optionId }));
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        totalVotes: g.totalVotes + 1,
        options: g.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o)
      };
    }));

    if (showToast) {
      showToast(`Dự đoán thành công lựa chọn "${optionLabel}"! Chúc bạn may mắn chia quỹ thưởng! 🎯`, 'success');
    }
  };

  const displayGames = projectSlug
    ? games.filter(g => g.slug === projectSlug)
    : games;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    'headline': 'Minigame Dự Đoán Giá Bất Động Sản Cộng Đồng',
    'text': 'Tham gia dự đoán mức giá khớp lệnh thực tế của các dự án BĐS tại Đà Nẵng, Quảng Nam để nhận chia quỹ thưởng hàng triệu Xu.',
    'url': 'https://datbiendanang.vn/trung-tam-phan-thuong/du-doan-gia-bds/'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
              Sân Chơi Thẩm Định Giá Cộng Đồng
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Dự Đoán Giá BĐS - Chia Thưởng Triệu Xu
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Bạn có góc nhìn sắc bén về thị trường? Dự đoán giá chốt các sản phẩm BĐS tiêu biểu, tích lũy điểm chuyên gia và chia thưởng quỹ xu hấp dẫn.
            </p>
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
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
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

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center sm:text-right shrink-0">
                    <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Quỹ thưởng vòng này</div>
                    <div className="text-lg font-black text-amber-600">{game.totalPool}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{game.totalVotes.toLocaleString('vi-VN')} người tham gia</div>
                  </div>
                </div>

                {/* Voting Options */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {hasVoted ? 'Kết quả bình chọn cộng đồng:' : 'Chọn mức giá dự đoán của bạn:'}
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
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
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
                                <span>{opt.percent}%</span>
                                <span>{opt.votes} lượt</span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isUserChoice ? 'bg-blue-600' : 'bg-slate-400'}`}
                                  style={{ width: `${opt.percent}%` }}
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
