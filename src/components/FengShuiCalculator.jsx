'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { calculateFengShui } from '../utils/fengshuiCalculator';

export default function FengShuiCalculator() {
  const currentYear = new Date().getFullYear();

  // Form states
  const [birthYear, setBirthYear] = useState(1990);
  const [targetYear, setTargetYear] = useState(currentYear + 1); // Mặc định năm tới hoặc năm nay
  const [gender, setGender] = useState('nam');

  // Calculation results
  const result = useMemo(() => {
    return calculateFengShui(Number(birthYear), Number(targetYear), gender);
  }, [birthYear, targetYear, gender]);

  // Options
  const birthYearOptions = useMemo(() => {
    const list = [];
    for (let y = 1950; y <= currentYear - 16; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const targetYearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYear - 1; y <= currentYear + 10; y++) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  return (
    <div className="space-y-8">
      {/* 1. Interactive Input Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-amber-600 mb-2">
          <i className="fa-solid fa-compass-drafting text-amber-500"></i>
          <span>BỘ CÔNG CỤ TRA CỨU PHONG THỦY BẤT ĐỘNG SẢN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-2">
          Xem Tuổi Mua Đất, Làm Nhà & Động Thổ Khởi Công
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mb-6">
          Nhập năm sinh dương lịch của gia chủ (thường là người nam trụ cột gia đình) và năm dự kiến mua đất, khởi công xây dựng nhà ở để tra cứu 3 đại kỵ: <strong>Tam Tai, Kim Lâu, Hoang Ốc</strong> cùng giải pháp mượn tuổi đại cát.
        </p>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Năm sinh gia chủ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-cake-candles text-slate-400 mr-1.5"></i>
              Năm sinh gia chủ (Dương lịch)
            </label>
            <div className="relative">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-900 font-bold text-sm transition appearance-none cursor-pointer outline-none"
              >
                {birthYearOptions.map(y => (
                  <option key={y} value={y}>
                    Năm {y} ({result.birthYear === y ? result.canChiBirth.fullName : ''})
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down text-slate-400 text-xs absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-venus-mars text-slate-400 mr-1.5"></i>
              Giới tính gia chủ
            </label>
            <div className="grid grid-cols-2 gap-2 h-[46px]">
              <button
                type="button"
                onClick={() => setGender('nam')}
                className={`flex items-center justify-center gap-2 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  gender === 'nam'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <i className="fa-solid fa-mars"></i>
                <span>Nam giới</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('nu')}
                className={`flex items-center justify-center gap-2 rounded-2xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                  gender === 'nu'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <i className="fa-solid fa-venus"></i>
                <span>Nữ giới</span>
              </button>
            </div>
          </div>

          {/* Năm dự kiến mua đất / làm nhà */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-trowel-bricks text-slate-400 mr-1.5"></i>
              Năm dự kiến khởi công / mua đất
            </label>
            <div className="relative">
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-900 font-bold text-sm transition appearance-none cursor-pointer outline-none"
              >
                {targetYearOptions.map(y => (
                  <option key={y} value={y}>
                    Năm {y} {y === currentYear ? '(Năm nay)' : y === currentYear + 1 ? '(Năm tới)' : ''}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down text-slate-400 text-xs absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thẻ Thông Tin Gia Chủ & Bản Mệnh */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              HỒ SƠ BẢN MỆNH PHONG THỦY GIA CHỦ
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Gia chủ tuổi {result.canChiBirth.fullName} ({result.birthYear})
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Dự kiến mua đất / khởi công năm <strong>{result.targetYear} ({result.canChiTarget.fullName})</strong> — Tuổi âm lịch (tuổi mụ): <strong className="text-amber-300 text-sm">{result.tuoiMu} tuổi</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Mệnh Ngũ Hành</div>
              <div className="text-sm font-black text-amber-300">{result.menh}</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Bát Trạch</div>
              <div className="text-sm font-black text-cyan-300">{result.batTrach.cung} ({result.batTrach.nhom})</div>
            </div>
          </div>
        </div>

        {/* Hướng tốt hợp mệnh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2 uppercase">
              <i className="fa-solid fa-circle-check"></i>
              <span>4 Hướng Đại Cát (Nên Mua Nhà / Đặt Hướng Cửa Chính):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-white">
              {result.batTrach.tot.map(h => (
                <span key={h} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2 uppercase">
              <i className="fa-solid fa-circle-xmark"></i>
              <span>4 Hướng Đại Kỵ (Nên Tránh Khi Chọn Hướng Đất):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-white">
              {result.batTrach.xau.map(h => (
                <span key={h} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Khung Đánh Giá Tổng Quan Kết Luận */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
        result.rating === 'xuat-sac'
          ? 'bg-emerald-50/80 border-emerald-300'
          : result.rating === 'kha'
          ? 'bg-amber-50/80 border-amber-300'
          : 'bg-rose-50/80 border-rose-300'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
            result.rating === 'xuat-sac'
              ? 'bg-emerald-600 text-white'
              : result.rating === 'kha'
              ? 'bg-amber-500 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            <i className={
              result.rating === 'xuat-sac'
                ? 'fa-solid fa-trophy'
                : result.rating === 'kha'
                ? 'fa-solid fa-triangle-exclamation'
                : 'fa-solid fa-hand'
            }></i>
          </div>

          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
              KẾT LUẬN ĐÁNH GIÁ CHUYÊN GIA PHONG THỦY
            </div>
            <h3 className={`text-lg sm:text-xl font-black mb-2 ${
              result.rating === 'xuat-sac'
                ? 'text-emerald-800'
                : result.rating === 'kha'
                ? 'text-amber-900'
                : 'text-rose-900'
            }`}>
              {result.titleVerdict}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Chi Tiết 3 Đại Hạn: Tam Tai, Kim Lâu, Hoang Ốc */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-amber-500"></i>
          <span>Chi Tiết Khảo Sát 3 Đại Kỵ Phong Thủy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Hạn Tam Tai */}
          <div className={`rounded-2xl sm:rounded-3xl p-6 border bg-white shadow-2xs flex flex-col justify-between ${
            result.tamTai.isPham ? 'border-rose-200' : 'border-emerald-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">1. Hạn Tam Tai</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  result.tamTai.isPham
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  <i className={result.tamTai.isPham ? 'fa-solid fa-xmark' : 'fa-solid fa-check'}></i>
                  <span>{result.tamTai.isPham ? 'PHẠM TAM TAI' : 'KHÔNG PHẠM'}</span>
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Hạn Tam Hợp 3 Năm
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {result.tamTai.details}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-semibold text-slate-400">
              Tam tai của tuổi {result.canChiBirth.chi}: {result.tamTai.tamTaiYears.join(' - ')}
            </div>
          </div>

          {/* Card 2: Hạn Kim Lâu */}
          <div className={`rounded-2xl sm:rounded-3xl p-6 border bg-white shadow-2xs flex flex-col justify-between ${
            result.kimLau.isPham ? 'border-rose-200' : 'border-emerald-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">2. Hạn Kim Lâu</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  result.kimLau.isPham
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  <i className={result.kimLau.isPham ? 'fa-solid fa-xmark' : 'fa-solid fa-check'}></i>
                  <span>{result.kimLau.isPham ? result.kimLau.loaiKimLau : 'KHÔNG PHẠM'}</span>
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Hại Thân - Thê - Tử - Súc
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {result.kimLau.details}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-semibold text-slate-400">
              Công thức: {result.tuoiMu} ÷ 9 = dư {result.kimLau.remainder}
            </div>
          </div>

          {/* Card 3: Hạn Hoang Ốc */}
          <div className={`rounded-2xl sm:rounded-3xl p-6 border bg-white shadow-2xs flex flex-col justify-between ${
            result.hoangOc.isPham ? 'border-rose-200' : 'border-emerald-200'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">3. Hạn Hoang Ốc</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  result.hoangOc.isPham
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  <i className={result.hoangOc.isPham ? 'fa-solid fa-xmark' : 'fa-solid fa-check'}></i>
                  <span>{result.hoangOc.isPham ? 'PHẠM ' + result.hoangOc.cung : 'TỐT (' + result.hoangOc.cung + ')'}</span>
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Cung Địa Bàn 6 Cửa
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {result.hoangOc.details}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] font-semibold text-slate-400">
              {result.hoangOc.isTot ? 'Thuộc cung Cát (Nhất Cát, Nhì Nghi, Tứ Tấn Tài)' : 'Thuộc cung Hung (Tam Địa Sát, Ngũ Thọ Tử, Lục Hoang Ốc)'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. GỢI Ý MƯỢN TUỔI LÀM NHÀ ĐẸP NHẤT TRONG NĂM */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
              <i className="fa-solid fa-handshake"></i>
              <span>GIẢI PHÁP ĐẠI CÁT ĐẠI LỢI</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Bảng Gợi Ý Các Tuổi Đẹp Nhất Để Mượn Tuổi Làm Nhà Năm {result.targetYear}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Nếu gia chủ phạm hạn trong năm {result.targetYear}, bạn có thể nhờ người thân (nam giới, sức khỏe tốt, gia đạo thuận hòa) có năm sinh dưới đây đứng ra động thổ:
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 shrink-0">
            Top 8 Tuổi Vàng Không Phạm Hạn
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {result.suggestedBorrowAges.map((borrow) => (
            <div
              key={borrow.birthYear}
              className={`p-4 rounded-2xl border transition group hover:-translate-y-0.5 ${
                borrow.isPriority 
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition">
                  {borrow.canChi}
                </span>
                {borrow.isPriority && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    Ưu tiên
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-600">
                Sinh năm {borrow.birthYear} ({borrow.tuoiMu} tuổi)
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                Mệnh: {borrow.menh}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[9px]"></i>
                <span>Cung {borrow.cungHoangOc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Hướng Dẫn Quy Trình Mượn Tuổi Làm Nhà Chuẩn Phong Thủy */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-book-bookmark text-amber-500"></i>
          <span>Cẩm Nang Quy Trình Thủ Tục Mượn Tuổi Động Thổ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs mb-2.5">
              1
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Giấy Bán Tượng Trưng</h5>
            <p className="text-slate-600 text-xs leading-relaxed">
              Gia chủ làm một giấy bán đất tượng trưng cho người được mượn tuổi trước thần linh thổ địa.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs mb-2.5">
              2
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Lễ Động Thổ Khởi Công</h5>
            <p className="text-slate-600 text-xs leading-relaxed">
              Người mượn tuổi thay mặt gia chủ thắp hương, đọc văn khấn và cuốc 5 - 7 nhát đất khởi công. Gia chủ tạm lánh mặt cách đó 50m.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs mb-2.5">
              3
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Lễ Đổ Mái & Cất Nóc</h5>
            <p className="text-slate-600 text-xs leading-relaxed">
              Khi đổ bê tông mái hoặc đặt nóc xà gồ, người mượn tuổi tiếp tục đứng ra làm lễ khấn vái chu toàn cho công trình.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs mb-2.5">
              4
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Thủ Tục Chuộc Nhà</h5>
            <p className="text-slate-600 text-xs leading-relaxed">
              Khi công trình hoàn tất nhập trạch, gia chủ làm lễ chuộc nhà với giá tượng trưng cao hơn để chính thức an cư.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Footer CTA Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
        <div>
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            KẾ HOẠCH MUA ĐẤT AN CƯ & TÀI CHÍNH
          </div>
          <h4 className="text-lg sm:text-xl font-black text-white">
            Tìm Bất Động Sản Hợp Hướng Hoặc Tính Lãi Vay Ngân Hàng
          </h4>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            Kênh Nhà Đất 24H cung cấp bộ lọc thông minh tra cứu hướng nhà ({result.batTrach.nhom}) cùng công cụ dự toán bảng trả nợ gốc lãi chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/tinh-lai-vay"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition shadow-sm"
          >
            <i className="fa-solid fa-calculator mr-1.5"></i>
            <span>Tính Lãi Vay</span>
          </Link>
          <Link
            to="/nha-dat-ban"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm border border-emerald-400/40 transition"
          >
            <i className="fa-solid fa-magnifying-glass mr-1.5"></i>
            <span>Tìm Nhà Đất Bán</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
