'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter } from '../router/RouterContext';

export default function MembershipPage() {
  const { 
    currentUser, 
    membershipPackages, 
    subscribeMembership, 
    showToast,
    setActiveModal 
  } = useRealEstate();

  const { navigate } = useRouter();
  const [selectedCycle, setSelectedCycle] = useState(1); // 1, 3, or 6 months
  const [confirmingPackage, setConfirmingPackage] = useState(null);

  const isCurrentMember = !!currentUser?.membership;

  const handleSubscribe = (pkg) => {
    const cycle = pkg.billingCycles.find(c => c.months === selectedCycle) || pkg.billingCycles[0];
    if (currentUser.walletBalance < cycle.price) {
      showToast(`Số dư ví (${currentUser.walletBalance.toLocaleString('vi-VN')} đ) không đủ ${cycle.price.toLocaleString('vi-VN')} đ. Vui lòng nạp thêm tiền!`, 'warning');
      setActiveModal('wallet-deposit');
      return;
    }
    setConfirmingPackage({ pkg, cycle });
  };

  const handleConfirmSubscribe = () => {
    if (!confirmingPackage) return;
    const success = subscribeMembership(confirmingPackage.pkg.id, confirmingPackage.cycle.months);
    if (success) {
      setConfirmingPackage(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition">Trang chủ</button>
          <span>/</span>
          <span className="text-slate-800 font-bold">Gói Hội Viên</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <i className="fa-solid fa-crown text-amber-500"></i>
            <span>Chính Sách Gói Hội Viên Đất Biển Đà Nẵng</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Gói Hội Viên Bất Động Sản
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Giải pháp tối ưu hóa chi phí quảng cáo và tiếp cận khách mua nhà toàn diện. Nhận kho <strong className="text-emerald-700">Voucher 30 ngày</strong> định kỳ giúp tiết kiệm tới <strong className="text-red-600">39%</strong> so với đăng tin và đẩy tin mua lẻ.
          </p>
        </div>

        {/* Current User Membership & Voucher Status Box */}
        {currentUser && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* User info & membership badge */}
              <div className="flex items-start sm:items-center gap-4">
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md shrink-0" 
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
                    {isCurrentMember ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${currentUser.membership.badgeColor || 'bg-amber-400 text-slate-950'}`}>
                        <i className="fa-solid fa-crown mr-1"></i> {currentUser.membership.packageName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        Chưa kích hoạt Hội viên
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Số dư ví: <b className="text-emerald-400 font-mono text-sm">{currentUser.walletBalance?.toLocaleString('vi-VN')} đ</b></span>
                    {isCurrentMember && (
                      <span>Hạn dùng: <b className="text-amber-300 font-mono">{new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')}</b></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Vouchers balance pills */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Tin Thường</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    {currentUser.vouchers?.normalPublish || 0} <span className="text-xs text-slate-500 font-normal">lượt (-35k)</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Đẩy Tin</div>
                  <div className="text-lg font-black text-blue-400 mt-0.5">
                    {currentUser.vouchers?.normalBump || 0} <span className="text-xs text-slate-500 font-normal">lượt (-10k)</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                <div className="text-center px-3 py-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Voucher Tin VIP</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {currentUser.vouchers?.vipPublish || 0} <span className="text-xs text-slate-500 font-normal">voucher (-400k)</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate('/dang-tin')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  <span>Dùng Voucher Đăng Tin</span>
                </button>
                <button
                  onClick={() => setActiveModal('wallet-deposit')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition"
                  title="Nạp thêm tiền vào ví"
                >
                  <i className="fa-solid fa-wallet mr-1"></i> + Nạp Ví
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector (1 Tháng, 3 Tháng, 6 Tháng) */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Chọn kỳ hạn đăng ký gói hội viên:
          </div>
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm gap-1">
            <button
              onClick={() => setSelectedCycle(1)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                selectedCycle === 1 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 Tháng
            </button>
            <button
              onClick={() => setSelectedCycle(3)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCycle === 3 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>3 Tháng</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${selectedCycle === 3 ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'}`}>
                -5%
              </span>
            </button>
            <button
              onClick={() => setSelectedCycle(6)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCycle === 6 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>6 Tháng</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${selectedCycle === 6 ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-800'}`}>
                -10% Tối ưu
              </span>
            </button>
          </div>
        </div>

        {/* 3 Main Membership Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {(membershipPackages || []).map((pkg) => {
            const cycle = pkg.billingCycles.find(c => c.months === selectedCycle) || pkg.billingCycles[0];
            const isCurrent = currentUser?.membership?.packageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  pkg.recommended 
                    ? 'bg-white border-2 border-amber-500 shadow-2xl ring-4 ring-amber-400/10' 
                    : 'bg-white border border-slate-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] uppercase px-4 py-1 rounded-full shadow-md tracking-wider">
                    ★ Gói Phổ Biến & Bán Chạy Nhất
                  </div>
                )}

                <div>
                  {/* Top Badge & Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Chu kỳ {selectedCycle} tháng
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
                    {pkg.targetAudience}
                  </p>

                  {/* Price display */}
                  <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {cycle.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs font-bold text-slate-500">đ / {selectedCycle} tháng</span>
                    </div>
                    {selectedCycle > 1 && (
                      <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-tag"></i>
                        <span>{cycle.note || `Tiết kiệm thêm khi đăng ký ${selectedCycle} tháng`}</span>
                      </div>
                    )}
                  </div>

                  {/* Monthly Vouchers Breakdown */}
                  <div className="space-y-3 pt-2 pb-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-ticket text-emerald-600"></i>
                      <span>Kho Voucher Cấp Mỗi 30 Ngày:</span>
                    </div>

                    <div className="space-y-2">
                      {/* Tin thường voucher */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                            {pkg.vouchersPerCycle.normalPublishVouchers}
                          </span>
                          <span className="font-bold text-emerald-950">Voucher Đăng Tin Thường</span>
                        </div>
                        <span className="text-emerald-700 font-black text-[11px]">-35.000 đ/lần</span>
                      </div>

                      {/* Đẩy tin thường voucher */}
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                            {pkg.vouchersPerCycle.normalBumpVouchers}
                          </span>
                          <span className="font-bold text-blue-950">Voucher Đẩy Tin Thường</span>
                        </div>
                        <span className="text-blue-700 font-black text-[11px]">-10.000 đ/lần</span>
                      </div>

                      {/* Tin VIP voucher */}
                      {pkg.vouchersPerCycle.vipVouchers > 0 ? (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                              {pkg.vouchersPerCycle.vipVouchers}
                            </span>
                            <span className="font-bold text-amber-950">Voucher Giảm Tin VIP</span>
                          </div>
                          <span className="text-amber-800 font-black text-[11px]">-400.000 đ/tin</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>Voucher Tin VIP:</span>
                          <span className="text-[11px]">Không áp dụng</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                      Tiện ích & Quyền lợi đi kèm:
                    </div>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-xs shrink-0"></i>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribe Button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSubscribe(pkg)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : pkg.recommended
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    }`}
                  >
                    <i className="fa-solid fa-crown text-sm"></i>
                    <span>{isCurrent ? 'Gia Hạn Gói Này' : `Đăng Ký ${pkg.shortName}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900">
              Bảng So Sánh Chi Tiết Quyền Lợi Các Gói Hội Viên
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Chính sách cấp voucher định kỳ 30 ngày theo quy chế sàn
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4 w-1/3">Tiêu Chí & Tiện Ích</th>
                  <th className="p-4 text-center">Gói Cơ Bản</th>
                  <th className="p-4 text-center bg-amber-50/50 text-amber-900">Gói Tiêu Chuẩn ★</th>
                  <th className="p-4 text-center">Gói Cao Cấp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-bold text-slate-800">Mức giá đăng ký hàng tháng</td>
                  <td className="p-4 text-center font-bold text-slate-700">467.000 đ/tháng</td>
                  <td className="p-4 text-center font-black text-amber-700 bg-amber-50/30">1.267.000 đ/tháng</td>
                  <td className="p-4 text-center font-bold text-purple-700">2.200.000 đ/tháng</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Tỷ lệ tiết kiệm so với mua lẻ</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">31%</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-amber-50/30">33%</td>
                  <td className="p-4 text-center font-black text-emerald-600">39% Tối đa</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher giảm 35.000đ Đăng Tin Thường</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-sm">15 lượt/tháng</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-sm bg-amber-50/30">30 lượt/tháng</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-sm">50 lượt/tháng</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher giảm 10.000đ Đẩy Tin Thường</td>
                  <td className="p-4 text-center font-black text-blue-600 text-sm">15 lượt/tháng</td>
                  <td className="p-4 text-center font-black text-blue-600 text-sm bg-amber-50/30">30 lượt/tháng</td>
                  <td className="p-4 text-center font-black text-blue-600 text-sm">50 lượt/tháng</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Voucher giảm 400.000đ cho Tin VIP</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center font-black text-amber-600 text-sm bg-amber-50/30">1 voucher/tháng</td>
                  <td className="p-4 text-center font-black text-amber-600 text-sm">3 voucher/tháng</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Hẹn giờ đăng tin tự động khung giờ vàng</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-amber-50/30">✓ Có hỗ trợ</td>
                  <td className="p-4 text-center font-bold text-emerald-600">✓ Có hỗ trợ</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Ưu tiên xuất bản & duyệt tin sớm</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center font-bold text-emerald-600 bg-amber-50/30">✓ Có hỗ trợ</td>
                  <td className="p-4 text-center font-bold text-emerald-600">✓ Ưu tiên cao nhất</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-800">Báo cáo hiệu suất lượt xem & tương tác</td>
                  <td className="p-4 text-center text-slate-500">Cơ bản</td>
                  <td className="p-4 text-center font-bold text-slate-800 bg-amber-50/30">Chi tiết</td>
                  <td className="p-4 text-center font-black text-purple-700">Chuyên sâu & Thị trường</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
          <h4 className="text-base font-black text-slate-900">
            Câu Hỏi Thường Gặp Về Gói Hội Viên & Voucher
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">1. Voucher được cấp và sử dụng như thế nào?</div>
              <p>Ngay khi bạn đăng ký gói hội viên thành công, toàn bộ số lượng voucher tương ứng sẽ được cộng tự động vào kho voucher cá nhân của bạn. Khi đăng tin hoặc đẩy tin, hệ thống sẽ tự động gợi ý bạn áp dụng voucher để giảm trừ chi phí về 0 đ.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">2. Quyền lợi có được cộng dồn không?</div>
              <p>Quyền lợi voucher được cấp mới định kỳ 30 ngày một lần theo chu kỳ đăng ký. Các voucher không sử dụng hết trong chu kỳ 30 ngày sẽ không được bảo lưu cộng dồn sang chu kỳ tiếp theo theo chính sách tiêu chuẩn của Batdongsan.</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">3. Tin VIP Kim Cương có ưu đãi gì đặc biệt?</div>
              <p>VIP Kim Cương sở hữu đặc quyền "Nhân đôi hiển thị": Khi tạo tin VIP Kim Cương, bạn được tặng kèm 1 Tin Thường hiển thị đồng thời; và khi bạn Đẩy tin VIP Kim Cương, tin thường đi kèm cũng được đẩy MIỄN PHÍ!</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">4. Tôi có thể đổi sang gói khác khi đang dùng không?</div>
              <p>Bạn hoàn toàn có thể nâng cấp lên Gói Tiêu Chuẩn hoặc Gói Cao Cấp bất cứ lúc nào. Kho voucher của gói mới sẽ được kích hoạt tức thì sau khi thanh toán.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black shrink-0">
                <i className="fa-solid fa-crown text-amber-500"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Xác Nhận Đăng Ký Hội Viên</h4>
                <div className="text-xs text-slate-500">{confirmingPackage.pkg.name}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Kỳ hạn đăng ký:</span>
                <span className="font-bold text-slate-900">{confirmingPackage.cycle.months} tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng thanh toán:</span>
                <span className="font-black text-emerald-600 text-base">
                  {confirmingPackage.cycle.price.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số dư ví hiện tại:</span>
                <span className="font-mono text-slate-700">
                  {currentUser.walletBalance?.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="border-t pt-2 space-y-1 text-[11px] text-slate-600">
                <div className="font-bold text-slate-700">Kho Voucher sẽ nhận:</div>
                <div>✓ {confirmingPackage.pkg.vouchersPerCycle.normalPublishVouchers} voucher giảm 35.000 đ đăng tin thường</div>
                <div>✓ {confirmingPackage.pkg.vouchersPerCycle.normalBumpVouchers} voucher giảm 10.000 đ đẩy tin thường</div>
                {confirmingPackage.pkg.vouchersPerCycle.vipVouchers > 0 && (
                  <div>✓ {confirmingPackage.pkg.vouchersPerCycle.vipVouchers} voucher giảm 400.000 đ tin VIP</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingPackage(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSubscribe}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30"
              >
                Xác Nhận & Trừ Ví
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
