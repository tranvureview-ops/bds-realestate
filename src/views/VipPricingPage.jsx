'use client';

import React, { useState, useMemo } from 'react';
import { Link, useRouter } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { VIP_PACKAGES as MOCK_VIP, MEMBERSHIP_PACKAGES, BUMP_SERVICE_PRICE } from '../data/mockData';
import BatdongsanListingSelector, { BATDONGSAN_RATES, getEffectiveBdsRates, ListingTypeIcon } from '../components/BatdongsanListingSelector';

export default function VipPricingPage() {
  const { navigate } = useRouter();
  const { 
    currentUser, 
    vipPackages: contextVipPackages, 
    selectedPropertyForVip, 
    setSelectedPropertyForVip, 
    setPreselectedListingType,
    upgradeVip, 
    setActiveModal,
    showToast,
    systemConfig,
    bumpServicePrice,
    BUMP_SERVICE_PRICE: contextBumpPrice
  } = useRealEstate();

  const currentBumpPrice = bumpServicePrice ?? contextBumpPrice ?? BUMP_SERVICE_PRICE ?? 10000;

  const vipPackages = contextVipPackages || MOCK_VIP;
  const ratesConfig = useMemo(() => getEffectiveBdsRates(vipPackages), [vipPackages]);

  // 1. Batdongsan UI Selector State (Khớp 100% ảnh chụp Batdongsan.com.vn)
  const [selectedListingType, setSelectedListingType] = useState('normal'); // Mặc định 'normal' như ảnh
  const [selectedDuration, setSelectedDuration] = useState(60);            // Mặc định 60 ngày như ảnh
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleTime, setScheduleTime] = useState('now');

  // Chu kỳ thời hạn chuẩn Batdongsan.com.vn (15 ngày, 30 ngày -25%, 60 ngày -30%)
  const DURATION_DISCOUNTS = {
    15: { label: '15 ngày', discountPercent: 0, badge: 'Đăng ký cơ bản' },
    30: { label: '30 ngày', discountPercent: 25, badge: 'Tiết kiệm 25%' },
    60: { label: '60 ngày', discountPercent: 30, badge: 'Tiết kiệm 30%' }
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Handle action from BatdongsanListingSelector
  const handleApplyListingChoice = () => {
    if (selectedPropertyForVip) {
      const success = upgradeVip(selectedPropertyForVip.id, selectedListingType, selectedDuration);
      if (success) {
        setSelectedPropertyForVip(null);
        navigate('/quan-ly-tin');
      }
    } else {
      if (setPreselectedListingType) {
        setPreselectedListingType(selectedListingType);
      }
      navigate('/dang-tin');
    }
  };

  // Handle direct package click
  const handleSelectPackage = (pkgId) => {
    setSelectedListingType(pkgId);
    if (selectedPropertyForVip) {
      const success = upgradeVip(selectedPropertyForVip.id, pkgId, selectedDuration);
      if (success) {
        setSelectedPropertyForVip(null);
        navigate('/quan-ly-tin');
      }
    } else {
      if (setPreselectedListingType) {
        setPreselectedListingType(pkgId);
      }
      navigate('/dang-tin');
    }
  };

  // FAQs List
  const FAQS = [
    {
      q: 'VIP Kim Cương, VIP Vàng có phải là "Gói dịch vụ" đăng ký theo tháng không?',
      a: 'Hoàn toàn KHÔNG. VIP Kim Cương, VIP Vàng, VIP Bạc và Tin Thường là 4 Phân Loại Tin Đăng (Listing Types) dành cho từng bài viết bất động sản riêng biệt. Người dùng lựa chọn loại tin và số ngày hiển thị khi tạo tin hoặc nâng hạng tin đang chạy. Đơn giá được tính theo ngày hiển thị của bài đăng đó. Còn khái niệm "Đăng ký gói" chỉ áp dụng cho Gói Hội Viên Môi Giới (Gói Cơ Bản, Gói Tiêu Chuẩn, Gói Cao Cấp) theo chu kỳ tháng để nhận kho voucher 30 ngày.'
    },
    {
      q: 'Mối quan hệ giữa Gói Hội Viên Môi Giới và các Loại Tin Đăng là gì?',
      a: 'Gói Hội Viên là hình thức thuê bao tài khoản môi giới định kỳ hàng tháng để nhận kho Voucher ưu đãi. Khi bạn đăng bất kỳ bài viết BĐS nào (chọn Loại Tin Thường hoặc Loại Tin VIP), bạn có thể áp dụng Voucher từ Gói Hội Viên của mình để được Miễn phí 100% tin thường (35k -> 0đ) hoặc Giảm 400.000 đ cho tin VIP.'
    },
    {
      q: 'Đặc quyền "Tặng kèm 1 Tin Thường song hành" của VIP Kim Cương hoạt động như thế nào?',
      a: 'Khi đăng một tin phân hạng VIP Kim Cương, hệ thống sẽ tự động tạo thêm một tin đăng phân hạng Tin Thường với cùng nội dung và hiển thị song song ở các trang tìm kiếm. Điều này giúp bất động sản của bạn vừa xuất hiện ở Top 1 sàn đấu giá hiển thị cao nhất, vừa có mặt ở danh sách tin thường, nhân đôi tỷ lệ tiếp cận khách mua nhà.'
    },
    {
      q: 'Cơ chế "Đẩy tin kép MIỄN PHÍ" của VIP Kim Cương là gì?',
      a: 'Bất cứ khi nào bạn thực hiện Đẩy Tin (làm mới tin) cho tin VIP Kim Cương, tin thường được tặng kèm song hành cũng sẽ tự động được làm mới lên đầu trang MIỄN PHÍ 100% cùng thời điểm mà không tốn thêm bất kỳ lượt đẩy tin hay chi phí nào.'
    },
    {
      q: 'Tôi có thể nâng cấp tin từ Tin Thường lên Tin VIP khi tin đang chạy không?',
      a: 'Hoàn toàn được! Bạn chỉ cần vào mục "Quản Lý Tin Của Tôi", chọn tin đăng cần nâng cấp và nhấn nút "Nâng cấp VIP". Tin đăng sẽ được đẩy lên phân hạng mới ngay lập tức với vị trí và giao diện viền màu tương ứng.'
    },
    {
      q: 'Tin đăng có được duyệt ngay không sau khi thanh toán?',
      a: 'Tin VIP Kim Cương được áp dụng cơ chế "Duyệt Tức Thì" (Active tự động ngay sau khi hoàn tất). Các loại tin VIP Vàng, VIP Bạc được ưu tiên duyệt nhanh trong vòng 15 - 30 phút. Tin thường sẽ được kiểm duyệt trong khung giờ làm việc theo quy chuẩn sàn.'
    }
  ];

  return (
    <div className="space-y-10 pb-16 bg-slate-50">
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-amber-400 font-medium transition flex items-center gap-1">
              <i className="fa-solid fa-house text-slate-500"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
            <span className="text-white font-bold">Bảng Phân Loại & Đơn Giá Tin Đăng</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-rose-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
                <i className="fa-solid fa-crown text-amber-400"></i>
                Hệ Thống Phân Cấp Tin Đăng 4 Thứ Hạng
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Bảng Phân Loại & Biểu Phí <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">Tin Đăng Bất Động Sản</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Cung cấp 4 phân loại hiển thị chuyên nghiệp: <b>VIP Kim Cương</b>, <b>VIP Vàng</b>, <b>VIP Bạc</b> và <b>Tin Thường</b>. Tính phí linh hoạt theo <b>số ngày hiển thị</b> cho từng bài viết cụ thể (<b>KHÔNG PHẢI GÓI THUÊ BAO ĐỊNH KỲ</b>).
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to="/dang-tin"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-red-500/25 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-cloud-arrow-up text-base"></i>
                <span>Soạn Tin Đăng Mới</span>
              </Link>
              <Link
                to="/goi-hoi-vien"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-black text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-ticket text-amber-400"></i>
                <span>Đăng Ký Gói Hội Viên (-39%)</span>
              </Link>
            </div>
          </div>

          {/* Context Banner: If user is upgrading a specific property */}
          {selectedPropertyForVip && (
            <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrow-up-right-dots text-amber-400 text-lg"></i>
                <div>
                  Đang chọn nâng cấp phân loại cho tin: <strong className="text-white">{selectedPropertyForVip.id}</strong> — {selectedPropertyForVip.title.substring(0, 60)}...
                </div>
              </div>
              <button
                onClick={() => setSelectedPropertyForVip(null)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-white text-[11px] font-bold"
              >
                Hủy chọn
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 -mt-8 relative z-20">
        {/* 1.5 CLARIFICATION BANNER: PHÂN BIỆT RÕ RÀNG */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-xl bg-gradient-to-r from-amber-50/70 via-white to-red-50/60">
          <div className="flex items-start sm:items-center gap-3.5 mb-5">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center text-xl font-black shrink-0 shadow-md">
              <i className="fa-solid fa-circle-question"></i>
            </span>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase mb-1">
                Lưu Ý Quan Trọng
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Phân Biệt Rõ Ràng: "Phân Loại Tin Đăng" và "Gói Hội Viên"
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Cơ chế vận hành chuẩn giúp bạn hiểu đúng và lựa chọn chính xác theo nhu cầu:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: Phân Loại Tin Đăng */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-black text-[10px] uppercase">
                  1. Phân Loại Tin Đăng (Loại Tin)
                </span>
                <span className="font-bold text-slate-500 text-[11px]">Áp dụng từng bài viết</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                VIP Kim Cương, VIP Vàng, VIP Bạc & Tin Thường
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                • <b>Bản chất:</b> Đây là <b>Loại Tin</b> chọn khi đăng 1 căn nhà/mảnh đất cụ thể.<br/>
                • <b>Cách tính phí:</b> Đơn giá tính theo <b>số ngày hiển thị</b> (từ 100k/ngày đến 5k/ngày).<br/>
                • <b>Cơ chế:</b> <b>KHÔNG PHẢI ĐĂNG KÝ GÓI THUÊ BAO</b>. Đăng bài nào tính tiền bài đó theo ngày.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Chọn khi tạo bài đăng</span>
                <Link to="/dang-tin" className="text-red-600 font-bold hover:underline flex items-center gap-1">
                  <span>Đăng tin ngay</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>

            {/* Box 2: Gói Hội Viên */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase">
                  2. Gói Hội Viên (Thuê Bao)
                </span>
                <span className="font-bold text-emerald-700 text-[11px]">Tiết kiệm tới 39%</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Gói Cơ Bản, Gói Tiêu Chuẩn & Gói Cao Cấp
              </h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                • <b>Bản chất:</b> Đây mới là <b>ĐĂNG KÝ GÓI</b> (thuê bao định kỳ chu kỳ 30 ngày).<br/>
                • <b>Quyền lợi:</b> Nhận kho <b>Voucher 30 ngày</b>: đăng tin thường 0đ, voucher đẩy tin, và voucher giảm 400.000đ tin VIP.<br/>
                • <b>Cách dùng:</b> Khi đăng bài ở mục 1, bạn dùng Voucher trong Gói Hội Viên này để thanh toán!
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Thuê bao theo tháng</span>
                <Link to="/goi-hoi-vien" className="text-amber-800 font-bold hover:underline flex items-center gap-1">
                  <span>Xem Gói Hội Viên</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BẢNG PHÂN LOẠI & DỰ TOÁN HIỂN THỊ CHUẨN 100% GIAO DIỆN BATDONGSAN.COM.VN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase">
                <i className="fa-solid fa-layer-group text-red-600"></i>
                Bảng Biểu Phí & Lựa Chọn Trực Quan
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Chọn Phân Loại Tin Đăng & Thời Hạn Hiển Thị
              </h2>
              <p className="text-xs text-slate-500">
                Bấm chọn thẻ và thời hạn để mô phỏng biểu phí niêm yết
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Bạn có Voucher Hội Viên?</span>
              <Link to="/goi-hoi-vien" className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold border border-amber-300 rounded-xl text-xs transition flex items-center gap-1.5">
                <i className="fa-solid fa-crown text-amber-600"></i>
                <span>Xem Gói Hội Viên (-39%)</span>
              </Link>
            </div>
          </div>

          <BatdongsanListingSelector
            selectedType={selectedListingType}
            onSelectType={(type) => setSelectedListingType(type)}
            selectedDays={selectedDuration}
            onSelectDays={(days) => setSelectedDuration(days)}
            startDate={startDate}
            onStartDateChange={setStartDate}
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
            voucherDiscount={(currentUser?.vouchers?.normalPublish || 0) > 0 ? (selectedListingType === 'normal' ? 35000 : 400000) : 0}
            showFullSummary={true}
            customVipPackages={vipPackages}
            onApplyAction={handleApplyListingChoice}
            applyActionText={selectedPropertyForVip ? `Áp Dụng Nâng Hạng Cho Tin: ${selectedPropertyForVip.id}` : `Đăng Tin Ngay Với ${ratesConfig[selectedListingType]?.name || 'Loại Này'}`}
          />
        </div>

        {/* 3. BẢNG CHI TIẾT TÍNH NĂNG & MẪU THẺ CỦA 4 LOẠI TIN */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Chi Tiết Đặc Quyền & Thiết Kế Thẻ Của 4 Loại Tin Đăng
              </h3>
              <p className="text-xs text-slate-500">
                Hiển thị đơn giá theo chu kỳ <b>{selectedDuration} ngày</b> đang chọn ở trên (tính năng & quyền lợi hiển thị tương ứng)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-3 py-1 rounded-xl self-start sm:self-auto">
              Chu kỳ {selectedDuration} ngày ({DURATION_DISCOUNTS[selectedDuration]?.badge})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {vipPackages.map((pkg) => {
              const isDiamond = pkg.id === 'vip-diamond';
              const isGold = pkg.id === 'vip-gold';
              const isSilver = pkg.id === 'vip-silver';
              const isNormal = pkg.id === 'normal';

              const activeRates = ratesConfig[pkg.id] || ratesConfig['normal'];
              const currentDailyRate = activeRates.rates[selectedDuration] || activeRates.rates[15];
              const base15Rate = activeRates.rates[15];
              const discountInfo = DURATION_DISCOUNTS[selectedDuration] || DURATION_DISCOUNTS[15];
              const discountPercent = discountInfo.discountPercent;
              const grossPeriodPrice = currentDailyRate * selectedDuration;

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border-2 ${
                    isDiamond 
                      ? 'border-red-500 shadow-2xl ring-4 ring-red-400/20 lg:-translate-y-2' 
                      : isGold 
                      ? 'border-amber-400 shadow-xl' 
                      : isSilver
                      ? 'border-blue-400 shadow-md'
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Ribbon Badges */}
                  {isDiamond && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
                      <i className="fa-solid fa-gem text-amber-300"></i>
                      <span>TOP 1 SÀN • TIẾP CẬN GẤP 30 LẦN</span>
                    </div>
                  )}
                  {isGold && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                      TOP 2 TRANG CHỦ • X15 HIỆU QUẢ
                    </div>
                  )}
                  {isSilver && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                      TRÊN TIN THƯỜNG • X8 HIỆU QUẢ
                    </div>
                  )}
                  {isNormal && (currentUser?.vouchers?.normalPublish || 0) > 0 && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap animate-pulse">
                      ✓ CÓ VOUCHER HỘI VIÊN (0 Đ)
                    </div>
                  )}

                  <div>
                    {/* Badge & Level */}
                    <div className="text-center pb-4 border-b border-slate-100">
                      <div className="flex justify-center mb-2">
                        <ListingTypeIcon type={pkg.id} />
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wide mb-1 ${pkg.badgeColor}`}>
                        {pkg.badgeText || pkg.shortName}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {pkg.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {activeRates.positionDesc}
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="text-center py-4 bg-slate-50/70 rounded-2xl my-3 border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                        Đơn giá theo ngày ({selectedDuration} ngày)
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                        {currentDailyRate.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ/ngày</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="text-slate-600 font-medium">
                          Tổng {selectedDuration} ngày: <b className="text-slate-900">{grossPeriodPrice.toLocaleString('vi-VN')} đ</b>
                        </div>
                        {discountPercent > 0 ? (
                          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            <span className="line-through text-slate-400 mr-1">{(base15Rate * selectedDuration).toLocaleString('vi-VN')} đ</span>
                            Tiết kiệm {discountPercent}%
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Đơn giá chuẩn
                          </div>
                        )}
                      </div>

                      {isNormal && (
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mt-1">
                          Áp dụng Voucher Hội viên = 0 đ
                        </div>
                      )}
                    </div>

                    {/* Key Perks Highlight */}
                    {isDiamond && (
                      <div className="p-3 bg-red-50 border border-red-200/80 rounded-2xl mb-3 space-y-1 text-xs">
                        <div className="font-extrabold text-red-900 flex items-center gap-1.5">
                          <i className="fa-solid fa-gift text-red-600"></i>
                          <span>Đặc quyền VIP Kim Cương:</span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5 font-medium">
                          <div>• <b>TẶNG KÈM 1 Tin Thường</b> song hành</div>
                          <div>• <b>Đẩy tin kép MIỄN PHÍ</b> cả 2 tin</div>
                          <div>• <b>Duyệt bài TỨC THÌ (Active ngay)</b></div>
                          <div>• Không hiển thị quảng cáo đối thủ</div>
                        </div>
                      </div>
                    )}

                    {/* Feature Checklist */}
                    <ul className="space-y-2.5 py-3 border-t border-slate-100 text-xs text-slate-600">
                      {pkg.features.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <i className={`fa-solid fa-circle-check text-xs mt-0.5 shrink-0 ${
                            isDiamond ? 'text-red-600' : isGold ? 'text-amber-500' : isSilver ? 'text-blue-500' : 'text-slate-400'
                          }`}></i>
                          <span className={idx === 0 ? 'font-bold text-slate-900' : ''}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Call to action button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`w-full py-3 px-3 sm:px-4 rounded-xl font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        isDiamond 
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20' 
                          : isGold 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black' 
                          : isSilver
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span className="whitespace-nowrap">
                        {selectedPropertyForVip 
                          ? `Áp Dụng Cho Tin: ${pkg.shortName}` 
                          : (pkg.id === 'normal' ? 'Đăng Tin Thường' : `Đăng Tin ${pkg.shortName}`)}
                      </span>
                      <i className="fa-solid fa-arrow-right text-[10px] shrink-0"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. FEATURE COMPARISON MATRIX (BẢNG SO SÁNH QUYỀN LỢI CHI TIẾT) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase">
              Minh Bạch & Chuẩn Hóa
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Bảng So Sánh Quyền Lợi Chi Tiết 4 Cấp Độ Tin Đăng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Đối chiếu từng tiêu chí hiển thị, nhận diện thương hiệu và đặc quyền dịch vụ chuyên nghiệp.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="py-4 px-4 font-black text-slate-900 uppercase text-[11px] w-1/4">
                    Tiêu Chí So Sánh
                  </th>
                  <th className="py-4 px-3 text-center bg-red-50/70 border-x border-red-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase">
                      VIP Kim Cương
                    </span>
                    <div className="font-black text-red-700 text-xs mt-1">Từ 314.820 đ/ngày</div>
                  </th>
                  <th className="py-4 px-3 text-center bg-amber-50/70 border-r border-amber-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                      VIP Vàng
                    </span>
                    <div className="font-black text-amber-800 text-xs mt-1">Từ 111.970 đ/ngày</div>
                  </th>
                  <th className="py-4 px-3 text-center bg-blue-50/70 border-r border-blue-100">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px] uppercase">
                      VIP Bạc
                    </span>
                    <div className="font-black text-teal-800 text-xs mt-1">Từ 57.740 đ/ngày</div>
                  </th>
                  <th className="py-4 px-3 text-center bg-slate-100/70">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-700 font-bold text-[10px] uppercase">
                      Tin Thường
                    </span>
                    <div className="font-bold text-slate-700 text-xs mt-1">Từ 2.330 đ/ngày</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Vị trí hiển thị */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Vị trí hiển thị trên Sàn
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-red-600 bg-red-50/30 border-x border-red-100">
                    Top 1 Trang Chủ & Danh Mục
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-800 bg-amber-50/30 border-r border-amber-100">
                    Top 2 Trang Chủ & Danh Mục
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 bg-teal-50/30 border-r border-teal-100">
                    Nằm trên toàn bộ Tin Thường
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 bg-slate-50/30">
                    Nằm sau tất cả các tin VIP
                  </td>
                </tr>

                {/* 2. Tỷ lệ tiếp cận */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Tỷ lệ tiếp cận khách mua (Benchmark)
                  </td>
                  <td className="py-3 px-3 text-center font-black text-red-600 text-sm bg-red-50/30 border-x border-red-100">
                    Gấp 30 lần (x30)
                  </td>
                  <td className="py-3 px-3 text-center font-black text-amber-700 text-sm bg-amber-50/30 border-r border-amber-100">
                    Gấp 15 lần (x15)
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-teal-700 bg-teal-50/30 border-r border-teal-100">
                    Gấp 8 lần (x8)
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 bg-slate-50/30">
                    Tiêu chuẩn (1x)
                  </td>
                </tr>

                {/* 3. Tặng kèm Tin Thường */}
                <tr className="hover:bg-slate-50/50 bg-red-50/20">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-gift text-red-600"></i>
                    <span>Tặng kèm 1 Tin Thường song hành</span>
                  </td>
                  <td className="py-3 px-3 text-center font-black text-red-700 bg-red-100/50 border-x border-red-200">
                    ✓ CÓ (Nhân đôi phủ sóng)
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-amber-50/30 border-r border-amber-100">
                    ✗ Không
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-blue-50/30 border-r border-blue-100">
                    ✗ Không
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-slate-50/30">
                    ✗ Không
                  </td>
                </tr>

                {/* 4. Đẩy tin kép miễn phí */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Đẩy tin kép MIỄN PHÍ cả 2 tin
                  </td>
                  <td className="py-3 px-3 text-center font-black text-red-700 bg-red-50/30 border-x border-red-100">
                    ✓ CÓ (Tự động đẩy tin thường)
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-amber-50/30 border-r border-amber-100">
                    ✗ Không
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-blue-50/30 border-r border-blue-100">
                    ✗ Không
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-slate-50/30">
                    ✗ Không
                  </td>
                </tr>

                {/* 5. Không quảng cáo đối thủ */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Không hiển thị quảng cáo bên thứ 3
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 bg-red-50/30 border-x border-red-100">
                    ✓ CÓ (Trang chi tiết sạch 100%)
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 bg-amber-50/30 border-r border-amber-100">
                    ✓ CÓ
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-blue-50/30 border-r border-blue-100">
                    ✗ Không
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 bg-slate-50/30">
                    ✗ Không
                  </td>
                </tr>

                {/* 6. Kiểm duyệt & Xuất bản */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Tốc độ kiểm duyệt & Xuất bản
                  </td>
                  <td className="py-3 px-3 text-center font-black text-red-600 bg-red-50/30 border-x border-red-100">
                    Duyệt Tức Thì (Active ngay)
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-amber-800 bg-amber-50/30 border-r border-amber-100">
                    Ưu tiên sớm (15 phút)
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 bg-blue-50/30 border-r border-blue-100">
                    Ưu tiên sớm
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 bg-slate-50/30">
                    Hàng đợi tiêu chuẩn
                  </td>
                </tr>

                {/* 7. Kích thước thẻ & Nhận diện */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Kích thước thẻ & Hiệu ứng viền
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-red-700 bg-red-50/30 border-x border-red-100">
                    Thẻ Hero Card cực đại, viền phát sáng
                  </td>
                  <td className="py-3 px-3 text-center text-slate-800 bg-amber-50/30 border-r border-amber-100">
                    Thẻ VIP lớn, viền mạ vàng
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 bg-blue-50/30 border-r border-blue-100">
                    Thẻ VIP vừa, viền xanh
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 bg-slate-50/30">
                    Thẻ tiêu chuẩn chuẩn sàn
                  </td>
                </tr>

                {/* 8. Màu sắc tiêu đề */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Màu sắc & Định dạng tiêu đề
                  </td>
                  <td className="py-3 px-3 text-center font-black text-red-600 uppercase bg-red-50/30 border-x border-red-100">
                    Chữ In Hoa Đỏ Ruby
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-amber-600 uppercase bg-amber-50/30 border-r border-amber-100">
                    Chữ In Hoa Cam Vàng
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-blue-700 bg-blue-50/30 border-r border-blue-100">
                    Chữ Đậm Xanh Sapphire
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 bg-slate-50/30">
                    Chữ Thường màu tối
                  </td>
                </tr>

                {/* 9. Áp dụng Voucher Hội Viên */}
                <tr className="hover:bg-slate-50/50 bg-emerald-50/20">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Áp dụng Voucher Hội Viên Môi Giới
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-red-50/30 border-x border-red-100">
                    Giảm trừ 400.000 đ
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-amber-50/30 border-r border-amber-100">
                    Giảm trừ 400.000 đ
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-blue-50/30 border-r border-blue-100">
                    Giảm trừ 400.000 đ
                  </td>
                  <td className="py-3 px-3 text-center font-black text-emerald-700 bg-emerald-100/60">
                    Giảm 35.000 đ (Chỉ còn 0 đ)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. BUMP SERVICE & GOLDEN HOURS GUIDE */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 text-2xl shadow-xl shrink-0">
                <i className="fa-solid fa-arrow-up-right-dots"></i>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-400 font-extrabold">
                  Dịch Vụ Gia Tăng Hiệu Quả
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Dịch Vụ Đẩy Tin (Làm Mới Tin) Lên Đầu Trang
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Cập nhật thời gian đăng tin lên thời điểm hiện tại. Đưa tin của bạn lên đầu kết quả tìm kiếm theo đúng phân cấp VIP mà không cần tạo tin mới.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="text-right">
                <div className="text-xs text-slate-400">Chi phí tiêu chuẩn</div>
                <div className="text-2xl font-black text-amber-400">
                  {currentBumpPrice.toLocaleString('vi-VN')} đ <span className="text-xs text-slate-400 font-normal">/ lần</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  Hội viên dùng Voucher = 0 đ
                </div>
              </div>
              <Link
                to={(!currentUser || currentUser.role === 'guest' || currentUser.id === 'guest') ? '/dang-nhap?redirect=/quan-ly-tin' : '/quan-ly-tin'}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                Vào Quản Lý Đẩy Tin ➔
              </Link>
            </div>
          </div>

          {/* Golden Hours Schedule */}
          <div className="pt-6 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <i className="fa-solid fa-clock text-amber-400"></i>
              4 Khung Giờ Vàng Đẩy Tin Hiệu Quả Nhất (Lượng Khách Xem BĐS Cao Nhất):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-black text-amber-300 text-sm">08:00 - 09:30</div>
                <div className="font-bold text-white text-xs">Giờ Đầu Ngày Làm Việc</div>
                <div className="text-[11px] text-slate-400">Khách hàng mở điện thoại cập nhật tin thị trường trước giờ làm.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-black text-amber-300 text-sm">11:30 - 13:00</div>
                <div className="font-bold text-white text-xs">Giờ Nghỉ Trưa Cao Điểm</div>
                <div className="text-[11px] text-slate-400">Thời gian nghỉ ngơi, lướt web xem căn hộ và gọi điện hỏi giá.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-black text-amber-300 text-sm">14:00 - 15:30</div>
                <div className="font-bold text-white text-xs">Giờ Giao Dịch Chiều</div>
                <div className="text-[11px] text-slate-400">Các nhà đầu tư và môi giới lọc danh sách BĐS để đi xem thực tế.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-black text-amber-300 text-sm">19:30 - 21:30</div>
                <div className="font-bold text-white text-xs">Giờ Vàng Gia Đình</div>
                <div className="text-[11px] text-slate-400">Khung giờ vàng có lượt xem trang và gửi yêu cầu tư vấn cao nhất.</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. MEMBERSHIP PACKAGE BENEFIT COMPARISON (MUA LẺ VS GÓI HỘI VIÊN) */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 lg:p-10 text-slate-950 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-3xl shadow-xl shrink-0">
                <i className="fa-solid fa-crown"></i>
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase mb-1">
                  Bài Toán Kinh Tế Dành Cho Môi Giới
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                  Đăng Ký Gói Hội Viên — Tiết Kiệm Tới 39% Chi Phí Đăng Tin
                </h3>
                <p className="text-xs sm:text-sm text-slate-950 font-medium mt-1 max-w-xl">
                  Nhận trọn bộ kho Voucher cấp mới định kỳ 30 ngày: voucher giảm 35.000đ đăng tin + voucher giảm 10.000đ đẩy tin + voucher 400.000đ tin VIP.
                </p>
              </div>
            </div>

            <Link
              to="/goi-hoi-vien"
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl shrink-0 flex items-center gap-2"
            >
              <span>Xem Bảng Gói Hội Viên</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>

          {/* Comparison Cards: Retail vs Membership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-amber-600/30 space-y-2">
              <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                <span>Phương Án 1: Mua Lẻ Từng Tin Đăng</span>
                <span className="text-red-600 text-xs font-bold">Không Ưu Đãi</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li>• Đăng 30 tin thường: 30 x 35.000 đ = <b>1.050.000 đ</b></li>
                <li>• Đẩy 30 lần tin thường: 30 x {currentBumpPrice.toLocaleString('vi-VN')} đ = <b>{(30 * currentBumpPrice).toLocaleString('vi-VN')} đ</b></li>
                <li>• Đăng 1 tin VIP Kim Cương (7 ngày): <b>700.000 đ</b></li>
                <li className="pt-2 border-t border-amber-600/20 font-black text-xs text-slate-900">
                  Tổng chi phí mua lẻ: 2.050.000 đ
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-2">
              <div className="font-extrabold text-sm text-amber-400 flex items-center justify-between">
                <span>Phương Án 2: Đăng Ký Gói Hội Viên Tiêu Chuẩn</span>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Tiết Kiệm 39%</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• Cấp 30 voucher giảm 35.000 đ đăng tin thường (<b>0 đ</b>)</li>
                <li>• Cấp 30 voucher giảm 10.000 đ đẩy tin thường (<b>0 đ</b>)</li>
                <li>• Tặng 1 voucher giảm 400.000 đ đăng tin VIP (<b>Giảm ngay 400k</b>)</li>
                <li className="pt-2 border-t border-slate-800 font-black text-xs text-amber-300">
                  Chỉ còn 1.267.000 đ/tháng (Tiết kiệm gần 800.000 đ)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 8. FAQ SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase">
              Hỏi Đáp Dịch Vụ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Câu Hỏi Thường Gặp Về Tin Đăng Bất Động Sản
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Giải đáp thắc mắc chi tiết về cơ chế hiển thị, đẩy tin và quyền lợi hội viên.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left font-black text-xs sm:text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs shrink-0 font-bold">
                      ?
                    </span>
                    {faq.q}
                  </span>
                  <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-red-600' : ''}`}></i>
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 9. BOTTOM SUPPORT & HOTLINE */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div>
              <h3 className="font-black text-base text-white">Bạn Cần Tư Vấn Phân Loại Tin Đăng Phù Hợp Cho Bất Động Sản?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chuyên viên tư vấn VIP sẵn sàng hỗ trợ bạn 24/7 qua Zalo & Tổng đài Hotline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href={`tel:${(systemConfig?.hotline || '0898 246 607').replace(/\s+/g, '')}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg"
              title="Gọi ngay Hotline tư vấn VIP"
            >
              <i className="fa-solid fa-phone"></i>
              <span>Hotline: {systemConfig?.hotline || '0898 246 607'}</span>
            </Link>
            {systemConfig?.zalo && (
              <Link
                href={`https://zalo.me/${systemConfig.zalo.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg"
                title="Chat Zalo Tư Vấn Nhanh"
              >
                <i className="fa-solid fa-comment-dots"></i>
                <span>Zalo: {systemConfig.zalo}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
