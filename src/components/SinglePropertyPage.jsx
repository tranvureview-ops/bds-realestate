'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import { VIP_PACKAGES } from '../data/mockData';
import { getCategoryPermalink, toVietnameseSlug } from '../utils/permalink';
import InteractiveMap from './InteractiveMap';
import ListingCard from './ListingCard';
import CustomSelect from './CustomSelect';
import { findAdministrativeMerger } from '../data/vietnamAdministrativeData';

export default function SinglePropertyPage({ propertyOverride = null }) {
  const { 
    properties, 
    selectedPropertyDetail, 
    setCurrentView, 
    favorites, 
    toggleFavorite, 
    compareList, 
    toggleCompare, 
    setActiveModal, 
    showToast,
    getPropertyExpirationInfo,
    currentUser,
    addListingReport,
    resendReportConfirmationEmail,
    singleConfig,
    systemConfig
  } = useRealEstate();

  // If prop override provided, prioritize it
  const property = propertyOverride || selectedPropertyDetail || properties[0];

  // Photo viewer state
  const [activeMediaTab, setActiveMediaTab] = useState('photos'); // 'photos', 'vr360', 'video', 'map'
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeVrIndex, setActiveVrIndex] = useState(0);

  // Appointment Form state
  const [appointmentDate, setAppointmentDate] = useState('Hôm nay (Buổi chiều)');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Embedded loan calculator state
  const [loanRatio, setLoanRatio] = useState(70);
  const [loanYears, setLoanYears] = useState(20);
  const [loanInterest, setLoanInterest] = useState(7.5);

  // Báo cáo tin rao sai lệch / vi phạm state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('address_wrong');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterName, setReporterName] = useState(() => currentUser?.name || '');
  const [reporterContact, setReporterContact] = useState(() => {
    const raw = currentUser?.email || currentUser?.phone || '';
    return typeof raw === 'string' ? raw.replace(/@landmark\.vn/g, '@datbiendanang.vn') : '';
  });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccessData, setReportSuccessData] = useState(null);
  const [isResendingInModal, setIsResendingInModal] = useState(false);
  const [supplementalEmail, setSupplementalEmail] = useState('');

  // Tự động đồng bộ và điền sẵn thông tin người dùng nếu đã đăng nhập khi mở modal báo cáo
  useEffect(() => {
    if (isReportModalOpen && currentUser) {
      if (!reporterName) {
        setReporterName(currentUser.name || '');
      }
      const userEmail = (currentUser.email || '').replace(/@landmark\.vn/g, '@datbiendanang.vn');
      if (!reporterContact || reporterContact.includes('@landmark.vn')) {
        setReporterContact(userEmail || currentUser.phone || '');
      }
    }
  }, [isReportModalOpen, currentUser]);

  // Chia sẻ tin rao state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  if (!property) return null;

  // Tra cứu tự động thông tin sáp nhập đơn vị hành chính nếu có
  const mergerData = property.isAdministrativeMerged ? {
    hasMerger: true,
    newAddress: property.newAddress || property.address,
    oldAddress: property.oldAddress || '',
    resolution: property.administrativeResolution || 'Nghị quyết của UBTV Quốc hội về việc sắp xếp các đơn vị hành chính'
  } : findAdministrativeMerger({
    city: property.city,
    district: property.district,
    ward: property.ward || property.address,
    street: property.street || property.address
  });

  // Bảo vệ an toàn tuyệt đối chống lỗi thiếu ảnh hoặc thiếu thông tin tác giả/khách vãng lai
  const safeImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  const safeAuthor = {
    name: property.author?.name || property.contactName || 'Người đăng tin',
    phone: property.author?.phone || property.contactPhone || '0908 123 456',
    zalo: property.author?.zalo || String(property.author?.phone || property.contactPhone || '0908123456').replace(/\s+/g, ''),
    avatar: property.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    title: property.author?.title || (property.isGuest ? 'Khách vãng lai' : 'Chính chủ đăng tin'),
    isVerified: property.author?.isVerified || false,
    rating: property.author?.rating || '5.0',
    reviewCount: property.author?.reviewCount || 1
  };

  const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
  const vipPkg = VIP_PACKAGES.find(p => p.id === property.vipPackageId) || defaultPkg;
  const isDiamond = property.vipPackageId === 'vip-diamond';
  const isFav = favorites.includes(property.id);
  const isCompared = compareList.some(p => p.id === property.id);

  // Embedded Loan Calculation
  const loanAmount = (property.price * loanRatio) / 100;
  const totalMonths = loanYears * 12;
  const monthlyPrincipal = loanAmount / totalMonths;
  const monthlyInterest = loanAmount * (loanInterest / 100 / 12);
  const firstMonthPayment = monthlyPrincipal + monthlyInterest;

  // Similar properties (same city or same property type)
  const similarProperties = properties
    .filter(p => p.id !== property.id && (p.city === property.city || p.propertyType === property.propertyType))
    .slice(0, 3);

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    if (!appointmentPhone || appointmentPhone.length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ để môi giới liên hệ', 'warning');
      return;
    }
    setAppointmentSuccess(true);
    showToast(`Đã đặt lịch xem nhà thành công! Người đăng ${safeAuthor.name} sẽ gọi xác nhận trong 10 phút.`, 'success');
    setTimeout(() => setAppointmentSuccess(false), 6000);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedShareLink(true);
      showToast('Đã sao chép đường dẫn bài đăng vào bộ nhớ tạm!', 'success');
      setTimeout(() => setCopiedShareLink(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `BĐS: ${property.title} - Giá: ${property.priceDisplay} (${property.district}, ${property.city})`,
          url: currentUrl
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      showToast('Vui lòng chọn lý do phản ánh tin rao', 'warning');
      return;
    }
    setReportSubmitting(true);
    try {
      const isEmail = reporterContact?.includes('@');
      const isPhone = reporterContact?.match(/\d{9,11}/);
      const rawResolvedEmail = isEmail ? reporterContact.trim() : (currentUser?.email || '');
      const resolvedEmail = (rawResolvedEmail || '').replace(/@landmark\.vn/g, '@datbiendanang.vn');

      const result = await addListingReport({
        propertyId: property.id,
        propertyTitle: property.title,
        reason: reportReason,
        description: reportDescription || '',
        contact: (reporterContact || '').replace(/@landmark\.vn/g, '@datbiendanang.vn'),
        reporterName: reporterName || currentUser?.name || 'Người dùng ẩn danh',
        reporterEmail: resolvedEmail,
        reporterPhone: isPhone ? reporterContact.trim() : (currentUser?.phone || '')
      });

      setReportSuccessData({
        report: result.report,
        reporterEmail: resolvedEmail,
        property: property
      });
      setSupplementalEmail(resolvedEmail);
      setReportDescription('');
    } catch (err) {
      showToast('Có lỗi xảy ra khi gửi báo cáo, vui lòng thử lại sau', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Trích xuất các cụm từ khóa tìm kiếm liên quan và hashtag
  const demandText = property.demand === 'sale' ? 'Bán' : 'Cho thuê';
  const typeText = property.propertyType === 'apartment' ? 'căn hộ chung cư'
    : property.propertyType === 'street-house' ? 'nhà mặt phố'
    : property.propertyType === 'villa' ? 'biệt thự liền kề'
    : property.propertyType === 'land' ? 'đất nền dự án'
    : property.propertyType === 'office' ? 'văn phòng'
    : property.propertyType === 'shophouse' ? 'shophouse'
    : 'nhà riêng';

  const relatedKeywords = [
    `${demandText} ${typeText} ${property.district} ${property.city}`,
    `Mua bán nhà đất ${property.district} chính chủ`,
    `${demandText} ${typeText} đường ${property.address || property.district}`,
    `Bất động sản ${property.district} sổ đỏ pháp lý rõ ràng`,
    `${demandText} ${typeText} ${property.city} giá tốt`,
    `Nhà đất ${property.district} vị trí đẹp`,
    `Dự án bất động sản tại ${property.city}`,
    `Bán nhà mặt tiền kinh doanh ${property.district}`
  ];

  const cleanCitySlug = toVietnameseSlug(property.city || '').replace(/-/g, '');
  const cleanDistrictSlug = toVietnameseSlug(property.district || '').replace(/-/g, '');
  const cleanTypeSlug = toVietnameseSlug(typeText || '').replace(/-/g, '');

  const relatedHashtags = [
    `#${cleanTypeSlug}`,
    `#${cleanDistrictSlug}`,
    `#${cleanCitySlug}`,
    `#bds${cleanDistrictSlug}`,
    `#nhadep${cleanCitySlug}`,
    `#sodochinhchu`,
    `#batdongsangiare`,
    `#muabannhadat`
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-16">
      {/* 1. BREADCRUMBS & TOP ACTIONS BAR */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link 
              to="/" 
              className="hover:text-emerald-600 transition flex items-center gap-1 font-semibold"
            >
              <i className="fa-solid fa-house text-slate-400"></i>
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <Link 
              to={property.demand === 'sale' ? '/nha-dat-ban' : '/nha-dat-cho-thue'} 
              className="hover:text-emerald-600 transition font-semibold"
            >
              {property.demand === 'sale' ? 'Nhà đất bán' : 'Nhà đất cho thuê'}
            </Link>
            <span className="text-slate-300">/</span>
            <Link 
              to={getCategoryPermalink(property.demand, null, property.city)}
              className="text-slate-600 hover:text-emerald-600 transition font-semibold"
            >
              {property.city}
            </Link>
            <span className="text-slate-300">/</span>
            <Link 
              to={getCategoryPermalink(property.demand, property.propertyType, property.city)}
              className="text-slate-600 hover:text-emerald-600 transition font-semibold"
            >
              {property.district}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">{property.title}</span>
          </nav>

          {/* Top Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {singleConfig?.features?.showShareButton !== false && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Chia sẻ tin đăng qua Facebook, Zalo, QR code..."
              >
                <i className="fa-solid fa-share-nodes text-emerald-600"></i>
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            )}

            {singleConfig?.features?.showPrintButton !== false && (
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="In tin đăng hoặc lưu file PDF"
              >
                <i className="fa-solid fa-print text-indigo-600"></i>
                <span className="hidden sm:inline">In tin</span>
              </button>
            )}

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Báo cáo tin rao có thông tin không đúng hoặc vi phạm"
            >
              <i className="fa-solid fa-flag text-rose-500"></i>
              <span className="hidden sm:inline">Báo cáo</span>
            </button>

            <button
              onClick={() => toggleCompare(property)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isCompared 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <i className="fa-solid fa-code-compare"></i>
              <span className="hidden sm:inline">{isCompared ? 'Đang so sánh' : 'So sánh'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(property.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isFav 
                  ? 'bg-rose-600 text-white border-rose-600' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <i className="fa-solid fa-heart"></i>
              <span className="hidden sm:inline">{isFav ? 'Đã lưu' : 'Lưu tin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PHOTO MOSAIC HERO GALLERY (Airbnb / Realtor Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {/* Media Switcher Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setActiveMediaTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeMediaTab === 'photos' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <i className="fa-solid fa-images text-emerald-500"></i>
            Bộ Sưu Tập Hình Ảnh ({safeImages.length})
          </button>

          {property.hasVR360 && (
            <button
              onClick={() => setActiveMediaTab('vr360')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeMediaTab === 'vr360' ? 'bg-purple-600 text-white shadow' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <i className="fa-solid fa-vr-cardboard"></i>
              Tour Thực Tế Ảo VR 360°
            </button>
          )}

          {property.videoUrl && (
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeMediaTab === 'video' ? 'bg-red-600 text-white shadow' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <i className="fa-solid fa-circle-play"></i>
              Video Review 4K
            </button>
          )}
        </div>

        {/* Media Display Area */}
        {activeMediaTab === 'photos' && (
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200">
            {/* Grid Mosaic: 1 Big Photo Left (60%), 4 Smaller Photos Right */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[440px] lg:h-[480px]">
              {/* Main Big Photo */}
              <div 
                onClick={() => { setSelectedPhotoIndex(0); setIsLightboxOpen(true); }}
                className="md:col-span-2 h-full relative overflow-hidden group cursor-pointer"
              >
                <img
                  src={safeImages[0]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg ${vipPkg.badgeColor}`}>
                    {vipPkg.shortName}
                  </span>
                  {property.hasVR360 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-lg flex items-center gap-1.5">
                      <i className="fa-solid fa-vr-cardboard"></i> VR 360°
                    </span>
                  )}
                </div>
              </div>

              {/* Smaller Photos Column 1 */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                <div 
                  onClick={() => { setSelectedPhotoIndex(1 % safeImages.length); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={safeImages[1] || safeImages[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition"></div>
                </div>
                <div 
                  onClick={() => { setSelectedPhotoIndex(2 % safeImages.length); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={safeImages[2] || safeImages[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition"></div>
                </div>
              </div>

              {/* Smaller Photos Column 2 */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                <div 
                  onClick={() => { setSelectedPhotoIndex(3 % safeImages.length); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={safeImages[3] || safeImages[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition"></div>
                </div>
                <div 
                  onClick={() => { setSelectedPhotoIndex(0); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <img
                    src={safeImages[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-black text-sm group-hover:bg-black/30 transition">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-camera"></i>
                      +{safeImages.length} Ảnh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Float: "Xem tất cả ảnh" */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-xl backdrop-blur-md transition flex items-center gap-2 border border-slate-200"
            >
              <i className="fa-solid fa-table-cells"></i>
              <span>Xem Tất Cả Ảnh ({safeImages.length})</span>
            </button>
          </div>
        )}

        {/* VR 360 Panorama View */}
        {activeMediaTab === 'vr360' && property.hasVR360 && (
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-purple-500 shadow-2xl h-[420px] sm:h-[480px]">
            <img
              src={property.vrScenes?.[activeVrIndex]?.img || safeImages[0]}
              alt="VR Scene"
              className="w-full h-full object-cover animate-pulse"
            />
            <div className="absolute top-4 left-4 bg-purple-950/90 text-white px-4 py-2 rounded-2xl border border-purple-400 text-xs font-bold flex items-center gap-2 backdrop-blur-md">
              <i className="fa-solid fa-vr-cardboard text-purple-300 text-base"></i>
              <span>Góc nhìn 360° Panorama: <strong>{property.vrScenes?.[activeVrIndex]?.name || 'Không gian thực tế'}</strong></span>
            </div>

            {/* VR Navigation Switcher */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-xs font-bold flex items-center gap-3 border border-purple-500/40">
              <span className="text-purple-300"><i className="fa-solid fa-arrows-up-down-left-right mr-1.5"></i> Xoay 360°</span>
              <span className="text-slate-500">|</span>
              {(property.vrScenes || [{ name: 'Phòng khách', img: safeImages[0] }]).map((scene, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVrIndex(idx)}
                  className={`px-3 py-1 rounded-full transition ${activeVrIndex === idx ? 'bg-purple-600 text-white font-extrabold shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  {scene.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Video Review View */}
        {activeMediaTab === 'video' && property.videoUrl && (
          <div className="rounded-3xl overflow-hidden bg-black shadow-2xl h-[420px] sm:h-[480px]">
            <iframe
              src={property.videoUrl}
              title="Video Review BĐS"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT LAYOUT: 8 COLS (LEFT) + 4 COLS (RIGHT SIDEBAR) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* === LEFT COLUMN (8 COLS): PROPERTY FULL DETAILS === */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. TITLE, PRICE & KEY METRICS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {singleConfig?.features?.showVipBadge !== false && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${vipPkg.badgeColor}`}>
                    {vipPkg.shortName}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {property.demand === 'sale' ? 'Đang Mở Bán' : 'Cho Thuê'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Mã tin: <strong>{property.id}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black leading-snug tracking-tight ${vipPkg.titleClass}`}>
                {property.title}
              </h1>

              {/* Address */}
              <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-2">
                <i className="fa-solid fa-location-dot text-emerald-600 text-base shrink-0"></i>
                <span className="font-semibold text-slate-700">{property.address}, {property.district}, {property.city}</span>
              </div>

              {/* Administrative Merger Info Notice (Địa giới hành chính sau sáp nhập) */}
              {singleConfig?.features?.showAdministrativeMergerAlert !== false && mergerData && (
                <div className="mt-3 p-3.5 bg-gradient-to-r from-red-50/90 via-amber-50/90 to-orange-50/90 rounded-2xl border border-red-200/90 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-red-700 flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-map-pin text-red-600"></i>
                      <span>Đơn Vị Hành Chính Mới Sau Sáp Nhập (Cập Nhật 2024 - 2025)</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                      Mới Sáp Nhập
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-white/95 rounded-xl border border-red-200 shadow-xs">
                      <div className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mb-0.5">
                        <i className="fa-solid fa-circle-check text-red-600"></i>
                        <span>Địa chỉ mới (Hiện hành):</span>
                      </div>
                      <div className="font-extrabold text-slate-900 leading-snug">
                        {mergerData.newAddress || property.newAddress || property.address}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                        <i className="fa-regular fa-clock text-slate-400"></i>
                        <span>Địa chỉ cũ (Theo sổ đỏ/hồng):</span>
                      </div>
                      <div className="font-semibold text-slate-700 leading-snug">
                        {mergerData.oldAddress || property.oldAddress || `${property.address}, ${property.district}, ${property.city}`}
                      </div>
                    </div>
                  </div>

                  {mergerData.resolution && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pl-1">
                      <i className="fa-solid fa-scale-balanced text-amber-600"></i>
                      <span>Căn cứ pháp lý: {mergerData.resolution}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mức giá niêm yết</div>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5">
                  {property.priceDisplay}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Đơn giá: <strong className="text-white">{property.pricePerM2}</strong>
                </div>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-6 text-xs text-slate-300 space-y-1">
                <div>Diện tích: <strong className="text-white font-extrabold text-sm">{property.area} m²</strong></div>
                <div>Phòng ngủ: <strong className="text-white font-extrabold text-sm">{property.bedroom} PN</strong> • {property.bathroom} WC</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-circle-check"></i>
                  Sổ đỏ chính chủ sẵn sàng công chứng
                </div>
              </div>
            </div>

            {/* Key Specs Matrix */}
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                Thông Số Kỹ Thuật Bất Động Sản
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Diện tích sử dụng</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-solid fa-vector-square text-emerald-600"></i>
                    {property.area} m²
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Số phòng ngủ</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-solid fa-bed text-blue-600"></i>
                    {property.bedroom} Phòng ngủ
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Số phòng tắm / WC</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-solid fa-bath text-indigo-600"></i>
                    {property.bathroom} Phòng tắm
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Hướng nhà / ban công</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-regular fa-compass text-amber-600"></i>
                    {property.direction || 'Đông Nam'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Tình trạng pháp lý</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2 truncate" title={property.legal}>
                    <i className="fa-solid fa-certificate text-emerald-600"></i>
                    {property.legal}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Số tầng / Vị trí tầng</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-solid fa-stairs text-purple-600"></i>
                    {property.floor ? `Tầng ${property.floor}` : 'Nhà trệt'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-3">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Nội thất bàn giao</div>
                  <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <i className="fa-solid fa-couch text-rose-600"></i>
                    {property.furniture}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. DETAILED DESCRIPTION & HIGHLIGHTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 bg-emerald-600 rounded-full"></span>
              Thông Tin Mô Tả Chi Tiết
            </h3>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              {property.description}
            </div>

            {/* Highlights bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-emerald-600 text-sm"></i>
                Pháp lý minh bạch, không tranh chấp hay quy hoạch
              </div>
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-building-circle-check text-blue-600 text-sm"></i>
                Chủ nhà thiện chí, sẵn sàng gia lộc cho khách mua nhanh
              </div>
            </div>
          </div>

          {/* B2. ĐẶC ĐIỂM TIN ĐĂNG (CHUẨN BATDONGSAN.COM.VN) */}
          {(() => {
            const expInfo = getPropertyExpirationInfo ? getPropertyExpirationInfo(property) : null;

            // Quyền riêng tư: Chỉ hiển thị trạng thái vận hành (số ngày còn lại, tự động gia hạn) cho Tác giả & Quản trị viên
            const isAdmin = currentUser?.role === 'admin';
            const isAuthor = Boolean(
              currentUser && (
                (property.author?.id && property.author.id === currentUser.id) ||
                (property.userId && property.userId === currentUser.id) ||
                // Khách vãng lai cùng session
                ((!currentUser || currentUser.role === 'guest' || currentUser.id === 'guest') && 
                  (property.isGuest || property.author?.isGuest || String(property.author?.id).startsWith('guest'))) ||
                // Khớp theo số điện thoại đã lưu
                (currentUser.phone && (
                  (property.author?.phone && property.author.phone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '')) ||
                  (property.contactPhone && property.contactPhone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, ''))
                )) ||
                // Khớp theo email
                (currentUser.email && (
                  (property.author?.email && property.author.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (property.contactEmail && property.contactEmail.toLowerCase() === currentUser.email.toLowerCase())
                ))
              )
            );
            const canViewOperationalStatus = isAdmin || isAuthor;

            return (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-5 bg-purple-600 rounded-full"></span>
                  Đặc Điểm Tin Đăng
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Ngày đăng tin</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5 font-mono">
                      <i className="fa-regular fa-calendar-plus text-emerald-600"></i>
                      {new Date(property.publishedAt || property.createdAt || property.submittedAt || Date.now()).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Ngày hết hạn</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5 font-mono">
                      <i className="fa-regular fa-calendar-xmark text-rose-600"></i>
                      {property.expiresAt ? new Date(property.expiresAt).toLocaleDateString('vi-VN') : '15 ngày'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Loại tin rao</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${vipPkg.badgeColor}`}>
                        {vipPkg.shortName}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Mã tin đăng</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono flex items-center gap-1.5">
                      <i className="fa-solid fa-hashtag text-slate-400 text-xs"></i>
                      {property.id}
                    </div>
                  </div>
                </div>

                {/* Trạng thái hiển thị & Tự động gia hạn (CHỈ HIỂN THỊ CHO TÁC GIẢ VÀ ADMIN) */}
                {canViewOperationalStatus && expInfo && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500 font-medium">Trạng thái hiển thị:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${expInfo.badgeClass}`}>
                        {expInfo.badgeText}
                      </span>
                    </div>
                    {property.autoRenew && (
                      <span className="text-blue-600 font-bold flex items-center gap-1 text-[11px]">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        Đã bật tự động gia hạn
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* B3. THÔNG BÁO VỀ NỘI DUNG VÀ MIỄN TRỪ TRÁCH NHIỆM CHUẨN BATDONGSAN (CẤU HÌNH TRONG ADMIN) */}
          {singleConfig?.disclaimer?.enabled !== false && (() => {
            const discCfg = singleConfig?.disclaimer || {};
            const bgClass = discCfg.bgStyle === 'amber' ? 'bg-amber-50/90 border-amber-200/90 text-amber-900'
              : discCfg.bgStyle === 'blue' ? 'bg-blue-50/90 border-blue-200/90 text-blue-900'
              : discCfg.bgStyle === 'white' ? 'bg-white border-2 border-slate-200 text-slate-900'
              : 'bg-slate-100/90 border-slate-200/90 text-slate-800';
            
            const badgeClass = discCfg.badgeColor === 'rose' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
              : discCfg.badgeColor === 'blue' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
              : discCfg.badgeColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
              : discCfg.badgeColor === 'slate' ? 'bg-slate-800 text-white'
              : 'bg-amber-500/10 text-amber-600 border border-amber-500/30';

            const hotlineDisplay = (discCfg.hotline && discCfg.hotline !== '1900 1881') ? discCfg.hotline : (systemConfig?.hotline || '0898 246 607');
            const hotlineClean = hotlineDisplay.replace(/\s+/g, '');
            const platformName = (discCfg.platformName && discCfg.platformName !== 'Batdongsan.com.vn') ? discCfg.platformName : (systemConfig?.brandShortName || 'Đất Biển Đà Nẵng');

            return (
              <div className={`rounded-3xl p-6 sm:p-7 border shadow-sm space-y-3.5 transition-all ${bgClass}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${badgeClass}`}>
                      <i className={discCfg.icon || 'fa-solid fa-shield-halved'}></i>
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {discCfg.title || 'Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm'}
                    </h4>
                  </div>

                  {discCfg.showReportButton !== false && (
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-3 py-1.5 bg-white border border-rose-200 hover:border-rose-400 text-rose-600 hover:text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-flag text-[11px]"></i>
                      <span>{discCfg.reportButtonText || 'Báo cáo tin này'}</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed text-justify">
                  Quý vị đang xem nội dung tin rao <strong className="text-slate-900 font-bold">"{property.title}"</strong> - Mã tin <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{property.id}</span>. Nội dung tin đăng này do Người đăng tin cung cấp và chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của thông tin. Với tư cách là Nền tảng thương mại điện tử trung gian, <strong>{platformName}</strong> thực hiện rà soát, kiểm duyệt trên cơ sở các thông tin được cung cấp. Quý vị vui lòng chủ động kiểm tra, thẩm định thông tin pháp lý và thực tế trước khi giao dịch. Nếu phát hiện nội dung không chính xác hoặc vi phạm, xin vui lòng thông báo qua{' '}
                  <a href={`tel:${hotlineClean}`} className="text-red-600 font-bold hover:underline inline-flex items-center gap-0.5">
                    Hotline {hotlineDisplay}
                  </a>{' '}
                  hoặc công cụ{' '}
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 underline decoration-red-400 underline-offset-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                    Báo cáo vi phạm
                  </button>{' '}
                  để chúng tôi tiếp nhận và xử lý theo quy định.
                </p>

                {discCfg.showAuditChecklist !== false && (
                  <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200/80 text-xs">
                    {(discCfg.auditItems || ['Đã kiểm duyệt sơ bộ', 'Tuân thủ quy chế sàn TMĐT', 'Mã tin được bảo hộ dữ liệu']).map((item, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-slate-300">•</span>}
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <i className="fa-regular fa-circle-check text-emerald-600"></i>
                          {item}
                        </span>
                      </React.Fragment>
                    ))}
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => window.print()}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-print text-indigo-500 text-xs"></i>
                      In bản tin này
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-share-nodes text-emerald-500 text-xs"></i>
                      Chia sẻ
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* B4. TÌM KIẾM THEO TỪ KHÓA LIÊN QUAN & HASHTAG BĐS */}
          {singleConfig?.features?.showRelatedKeywords !== false && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-5 bg-indigo-600 rounded-full"></span>
                    Tìm Kiếm Theo Từ Khóa & Cụm Từ Liên Quan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khám phá các bất động sản tương tự trong khu vực {property.district}, {property.city}
                  </p>
                </div>
              </div>

              {/* Cụm từ khóa tìm kiếm liên quan */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-magnifying-glass text-indigo-500 text-xs"></i>
                  Cụm từ khóa tìm kiếm phổ biến:
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedKeywords.map((kw, idx) => (
                    <Link
                      key={idx}
                      to={getCategoryPermalink(property.demand, property.propertyType, property.city)}
                      className="group px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 transition flex items-center gap-2 shadow-sm"
                    >
                      <i className="fa-solid fa-magnifying-glass text-[10px] text-slate-400 group-hover:text-indigo-600 transition"></i>
                      <span>{kw}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-300 group-hover:text-indigo-400 transition opacity-0 group-hover:opacity-100"></i>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Hashtags BĐS */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-hashtag text-rose-500 text-xs"></i>
                  Hashtag nổi bật:
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedHashtags.map((tag, idx) => (
                    <Link
                      key={idx}
                      to={getCategoryPermalink(property.demand, property.propertyType, property.city)}
                      className="px-3 py-1.5 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-full text-xs font-bold text-rose-700 hover:text-rose-800 transition flex items-center gap-1"
                    >
                      <span className="text-rose-400">#</span>
                      <span>{tag.replace(/^#/, '')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* C. SATELLITE GIS MAP & NEARBY FACILITIES */}
          {singleConfig?.features?.showInteractiveMap !== false && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                Vị Trí Bản Đồ & Tiện Ích Xung Quanh (Bán Kính 1km)
              </h3>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <InteractiveMap properties={[property]} height="380px" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(property.nearbyFacilities || [
                  { name: 'Trường Liên cấp Quốc tế', distance: '300m' },
                  { name: 'Bệnh viện Đa khoa Quốc tế', distance: '500m' },
                  { name: 'Trung tâm Thương mại Vincom', distance: '400m' },
                  { name: 'Ga Tuyến Metro Số 1', distance: '650m' }
                ]).map((fac, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <i className="fa-solid fa-circle-dot text-emerald-600 text-[10px]"></i>
                      {fac.name}
                    </span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      {fac.distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. EMBEDDED MORTGAGE CALCULATOR FOR THIS EXACT PROPERTY */}
          {singleConfig?.features?.showLoanCalculator !== false && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-5 bg-amber-500 rounded-full"></span>
                    Ước Tính Trả Góp Vay Mua Căn Nhà Này
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tính toán số tiền vay dựa trên giá trị thực tế: <strong>{property.priceDisplay}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('mortgage-calc')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Xem lịch chi tiết</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </button>
              </div>

              {/* Quick interactive sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Tỷ lệ vay:</span>
                    <span className="text-blue-600">{loanRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={loanRatio}
                    onChange={(e) => setLoanRatio(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Cần vay: <strong className="text-slate-800">{((property.price * loanRatio) / 100).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Thời gian vay:</span>
                    <span className="text-blue-600">{loanYears} năm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={loanYears}
                    onChange={(e) => setLoanYears(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Tổng kỳ: <strong>{totalMonths} tháng</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Lãi suất ưu đãi:</span>
                    <span className="text-blue-600">{loanInterest}% / năm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="12"
                    step="0.5"
                    value={loanInterest}
                    onChange={(e) => setLoanInterest(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Áp dụng ưu đãi năm đầu
                  </div>
                </div>
              </div>

              {/* Estimated Monthly Payment Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase">
                    Ước tính số tiền trả tháng đầu tiên (Dư nợ giảm dần):
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                    {Math.round(firstMonthPayment).toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    (Gốc: {Math.round(monthlyPrincipal).toLocaleString('vi-VN')} đ + Lãi: {Math.round(monthlyInterest).toLocaleString('vi-VN')} đ)
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('mortgage-calc')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  Mở Bảng Kế Hoạch Vay
                </button>
              </div>
            </div>
          )}

          {/* E. SIMILAR PROPERTIES RECOMMENDATION */}
          {singleConfig?.features?.showSimilarProperties !== false && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-rose-600 rounded-full"></span>
                Bất Động Sản Tương Tự Cùng Phân Khúc
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProperties.map(sim => (
                  <ListingCard key={sim.id} property={sim} viewMode="grid" />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* === RIGHT COLUMN (4 COLS): STICKY BROKER PROFILE & APPOINTMENT FORM === */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          
          {/* Main Broker Box */}
          {(singleConfig?.features?.showAuthorCard !== false || singleConfig?.features?.showAppointmentBooking !== false) && (
            <div id="broker-contact-box" className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xl space-y-5">
              {singleConfig?.features?.showAuthorCard !== false && (
                <>
                  {/* Broker Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="relative">
                      <img
                        src={safeAuthor.avatar}
                        alt={safeAuthor.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                      />
                      {safeAuthor.isVerified && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow" title="Môi giới đã xác thực">
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                        Chuyên viên tư vấn
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {safeAuthor.name}
                      </h4>
                      <div className="text-xs text-slate-500">
                        {safeAuthor.title}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                        <i className="fa-solid fa-star"></i>
                        <span className="font-bold text-slate-800">{safeAuthor.rating || '4.9'}</span>
                        <span className="text-slate-400">({safeAuthor.reviewCount || 28} giao dịch)</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Calling Hotline Button */}
                  <div className="space-y-2">
                    <a
                      href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 group"
                    >
                      <i className="fa-solid fa-phone-volume group-hover:animate-bounce text-base"></i>
                      <span>GỌI NGAY: {safeAuthor.phone}</span>
                    </a>

                    <a
                      href={`https://zalo.me/${safeAuthor.zalo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-comment-dots"></i>
                      <span>Chat Trực Tiếp Qua Zalo</span>
                    </a>
                  </div>
                </>
              )}

              {/* Appointment Form */}
              {singleConfig?.features?.showAppointmentBooking !== false && (
                <form onSubmit={handleAppointmentSubmit} className={`space-y-3 ${singleConfig?.features?.showAuthorCard !== false ? 'pt-4 border-t border-slate-100' : ''}`}>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fa-regular fa-calendar-check text-emerald-600"></i>
                    <span>Đặt Lịch Hẹn Xem Nhà Trực Tiếp</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Chọn thời gian hẹn:
                    </label>
                    <CustomSelect
                      value={appointmentDate}
                      onChange={(val) => setAppointmentDate(val)}
                      options={[
                        'Hôm nay (Buổi chiều 14h - 16h)',
                        'Ngày mai (Buổi sáng 9h - 11h)',
                        'Ngày mai (Buổi chiều 14h - 16h)',
                        'Thứ 7 tuần này (Buổi sáng 9h)',
                        'Chủ nhật tuần này (Buổi chiều 15h)'
                      ]}
                      placeholder="Chọn thời gian hẹn xem nhà"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Số điện thoại của bạn:
                    </label>
                    <input
                      type="tel"
                      placeholder="Nhập SĐT để môi giới xác nhận..."
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  {appointmentSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                      ✓ Đã gửi lịch hẹn thành công!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow"
                    >
                      Gửi Lời Hẹn Xem Nhà Ngay
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Safety & Trust Box */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-2 text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <i className="fa-solid fa-shield-halved text-amber-600"></i>
              Bảo Hiểm Thông Tin Đất Biển Đà Nẵng
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Mọi tin đăng trên sàn đều được kiểm tra địa chỉ thực tế. Tuyệt đối không đặt cọc hoặc chuyển khoản trước khi kiểm tra sổ đỏ/hồng bản gốc tại văn phòng công chứng.
            </p>
          </div>

        </div>
      </div>

      {/* 4. FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <span className="font-bold text-sm">
              Hình ảnh {selectedPhotoIndex + 1} / {safeImages.length} - {property.title}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative my-4">
            <button
              onClick={() => setSelectedPhotoIndex(prev => prev > 0 ? prev - 1 : safeImages.length - 1)}
              className="absolute left-2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl"
            >
              ❮
            </button>

            <img
              src={safeImages[selectedPhotoIndex] || safeImages[0]}
              alt=""
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />

            <button
              onClick={() => setSelectedPhotoIndex(prev => prev < safeImages.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl"
            >
              ❯
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {safeImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition ${selectedPhotoIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. MODAL CHIA SẺ TIN ĐĂNG */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                  <i className="fa-solid fa-share-nodes"></i>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Chia Sẻ Tin Đăng
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Mã tin: {property.id}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img
                src={safeImages[0]}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {property.title}
                </h4>
                <div className="text-xs font-extrabold text-red-600 mt-1">
                  {property.priceDisplay} • {property.area} m²
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {property.address}, {property.district}
                </div>
              </div>
            </div>

            {/* Social Sharing Buttons */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Chia sẻ trực tiếp qua mạng xã hội:
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank', 'width=600,height=400')}
                  className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold transition flex flex-col items-center gap-1.5 border border-blue-100 cursor-pointer"
                >
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                  <span className="text-[11px]">Facebook</span>
                </button>

                {/* Zalo */}
                <button
                  type="button"
                  onClick={() => window.open(`https://zalo.me/share?url=${encodeURIComponent(currentUrl)}`, '_blank', 'width=600,height=400')}
                  className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold transition flex flex-col items-center gap-1.5 border border-sky-100 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">Z</span>
                  <span className="text-[11px]">Zalo</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(property.title)}`, '_blank')}
                  className="p-2.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-bold transition flex flex-col items-center gap-1.5 border border-cyan-100 cursor-pointer"
                >
                  <i className="fa-brands fa-telegram text-lg"></i>
                  <span className="text-[11px]">Telegram</span>
                </button>

                {/* Messenger */}
                <button
                  type="button"
                  onClick={() => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(currentUrl)}`, '_blank')}
                  className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold transition flex flex-col items-center gap-1.5 border border-indigo-100 cursor-pointer"
                >
                  <i className="fa-brands fa-facebook-messenger text-lg"></i>
                  <span className="text-[11px]">Messenger</span>
                </button>
              </div>

              {/* Native device share if supported */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-mobile-screen-button"></i>
                  <span>Chia sẻ bằng ứng dụng trên thiết bị (AirDrop, Tin nhắn, v.v.)</span>
                </button>
              )}
            </div>

            {/* Copy Link Input */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Sao chép liên kết bài đăng:
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-2 text-xs text-slate-700 bg-transparent outline-none truncate font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer ${copiedShareLink ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                >
                  {copiedShareLink ? (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy"></i>
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Quick Scan */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`}
                alt="QR Code bài đăng"
                className="w-20 h-20 rounded-xl bg-white p-1 border border-slate-200 shrink-0"
              />
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <i className="fa-solid fa-qrcode text-emerald-600"></i>
                  Quét mã QR bằng điện thoại
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Mở Zalo hoặc Camera trên điện thoại quét mã để xem trực tiếp hoặc gửi cho khách hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL BÁO CÁO TIN RAO CÓ THÔNG TIN KHÔNG ĐÚNG */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-base">
                  <i className="fa-solid fa-flag"></i>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Báo Cáo Tin Rao Vi Phạm
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Mã tin: <strong className="font-mono text-slate-800">{property.id}</strong> • Phản ánh sai lệch
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Property Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
              <div className="font-bold text-slate-800 line-clamp-1">{property.title}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                {property.priceDisplay} • {property.address}, {property.district}, {property.city}
              </div>
            </div>

            {/* Form or Success State */}
            {reportSuccessData ? (
              <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  <i className="fa-solid fa-check"></i>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Đã Tiếp Nhận Báo Cáo & Kích Hoạt Gửi Email
                  </h4>
                  <div className="text-xs text-slate-500 mt-1">
                    Hồ sơ phản ánh: <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">#{reportSuccessData.report.id}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">1</span>
                    <div>
                      <strong>Email Thông Báo Khẩn Cấp BQT:</strong> Đã chuyển tiếp toàn bộ nội dung vi phạm tới ban kiểm duyệt sàn.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">2</span>
                    <div className="flex-1">
                      <div>
                        <strong>Email Biên Nhận:</strong>{' '}
                        {reportSuccessData.reporterEmail ? (
                          <span>Đã phát xác nhận tới <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] font-bold text-slate-900">{reportSuccessData.reporterEmail}</code>.</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">Chưa có email để gửi biên nhận xác nhận.</span>
                        )}
                      </div>

                      {/* Nút / Form Phát Lại Email Xác Nhận */}
                      <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                        {reportSuccessData.reporterEmail ? (
                          <button
                            type="button"
                            disabled={isResendingInModal}
                            onClick={async () => {
                              setIsResendingInModal(true);
                              try {
                                await resendReportConfirmationEmail(reportSuccessData.report.id, reportSuccessData.reporterEmail);
                              } finally {
                                setIsResendingInModal(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1.5 shadow-xs"
                          >
                            <i className={`fa-solid ${isResendingInModal ? 'fa-spinner fa-spin' : 'fa-rotate-right'} text-[10px]`}></i>
                            <span>{isResendingInModal ? 'Đang phát lại...' : 'Phát lại email xác nhận'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 w-full">
                            <input
                              type="email"
                              value={supplementalEmail}
                              onChange={(e) => setSupplementalEmail(e.target.value)}
                              placeholder="Nhập email của bạn để nhận biên bản xác nhận..."
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              disabled={isResendingInModal}
                              onClick={async () => {
                                if (!supplementalEmail || !supplementalEmail.includes('@')) {
                                  showToast('Vui lòng nhập địa chỉ email hợp lệ!', 'warning');
                                  return;
                                }
                                setIsResendingInModal(true);
                                try {
                                  const res = await resendReportConfirmationEmail(reportSuccessData.report.id, supplementalEmail);
                                  if (res.success) {
                                    setReportSuccessData(prev => ({ ...prev, reporterEmail: supplementalEmail }));
                                  }
                                } finally {
                                  setIsResendingInModal(false);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-xs shrink-0"
                            >
                              <i className={`fa-solid ${isResendingInModal ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-[10px]`}></i>
                              <span>Phát Email Xác Nhận</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportSuccessData(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow"
                  >
                    Đóng Hộp Thoại
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Vui lòng chọn lý do phản ánh tin rao này: <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'address_wrong', label: 'Địa chỉ bất động sản không có thật hoặc sai vị trí', icon: 'fa-location-dot text-rose-500' },
                      { id: 'price_wrong', label: 'Giá bán/cho thuê không đúng thực tế (kê giá, giá ảo, báo giá một đằng bán một nẻo)', icon: 'fa-tag text-amber-500' },
                      { id: 'already_sold', label: 'Bất động sản đã bán hoặc đã cho thuê nhưng người đăng không hạ tin', icon: 'fa-circle-check text-blue-500' },
                      { id: 'fake_images', label: 'Hình ảnh không đúng thực tế, cắt ghép hoặc giả mạo dự án khác', icon: 'fa-image text-purple-500' },
                      { id: 'duplicate', label: 'Tin đăng trùng lặp với nhiều bài đăng khác gây nhiễu thông tin', icon: 'fa-copy text-indigo-500' },
                      { id: 'unreachable', label: 'Không liên hệ được với người đăng tin (SĐT ảo, không nghe máy)', icon: 'fa-phone-slash text-slate-500' },
                      { id: 'other', label: 'Lý do khác (dấu hiệu lừa đảo, tranh chấp pháp lý, nội dung thô tục...)', icon: 'fa-circle-exclamation text-rose-600' }
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${reportReason === item.id ? 'bg-rose-50/50 border-rose-300 text-slate-900 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={item.id}
                          checked={reportReason === item.id}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="mt-0.5 accent-rose-600"
                        />
                        <span className="flex-1 flex items-center gap-1.5 text-xs">
                          <i className={`fa-solid ${item.icon} text-xs shrink-0`}></i>
                          <span>{item.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Mô tả chi tiết nội dung sai lệch (Tùy chọn):
                  </label>
                  <textarea
                    rows="3"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Cung cấp thêm chi tiết (ví dụ: tôi đã gọi và chủ nhà bảo đã bán từ tháng trước...)"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                  ></textarea>
                </div>

                {/* Khu vực thông tin liên hệ của người báo cáo: Giữ nguyên ngay cả khi đã đăng nhập để người dùng chủ động kiểm tra/thay đổi */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="fa-solid fa-address-card text-rose-500"></i>
                      Thông tin người phản ánh:
                    </span>
                    {currentUser ? (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[10px] text-emerald-600"></i>
                        Đã tự động điền từ tài khoản đăng nhập
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <i className="fa-solid fa-user-secret text-[10px]"></i>
                        Khách vãng lai
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ và tên của bạn:
                      </label>
                      <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input
                          type="text"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="Ví dụ: Trần Hoàng Nam"
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại hoặc Email nhận phản hồi: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input
                          type="text"
                          value={reporterContact}
                          onChange={(e) => setReporterContact(e.target.value)}
                          placeholder="Ví dụ: 0898 246 607 hoặc email@datbiendanang.vn"
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-blue-500 text-[10px] shrink-0"></i>
                    <span>Bạn có thể kiểm tra hoặc tùy ý chỉnh sửa lại họ tên/thông tin liên hệ nhận kết quả giải quyết.</span>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                    <span>{reportSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo Vi Phạm'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. PRINT-ONLY HEADER FOR PAPER / PDF BROCHURE */}
      <div className="print-only-header hidden">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">
              {systemConfig?.platformName || 'ĐẤT BIỂN ĐÀ NẴNG • SÀN GIAO DỊCH BẤT ĐỘNG SẢN'}
            </h1>
            <div suppressHydrationWarning className="text-xs text-slate-600 mt-0.5">
              Hotline kiểm định & tư vấn: <strong suppressHydrationWarning>{systemConfig?.hotline || '0904 084 888'}</strong> • Website: <strong suppressHydrationWarning>{typeof window !== 'undefined' ? window.location.host : 'datbiendanang.vn'}</strong>
            </div>
          </div>
          <div suppressHydrationWarning className="text-right text-xs text-slate-600">
            <div>Mã tin: <strong className="font-mono text-slate-900 text-sm font-bold">{property.id}</strong></div>
            <div suppressHydrationWarning>Ngày in bản tin: <strong suppressHydrationWarning>{new Date().toLocaleDateString('vi-VN')}</strong></div>
          </div>
        </div>
      </div>

      {/* 8. MOBILE STICKY CONTACT ACTION BAR (World-class Mobile UX) */}
      <aside 
        aria-label="Thanh liên hệ nhanh di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-3 py-2 border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] pb-safe flex items-center justify-between gap-2"
      >
        <div className="flex flex-col min-w-0 pr-1">
          <div className="text-base font-black text-red-600 truncate leading-tight">
            {property.priceDisplay}
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {property.area} m² • {property.district}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition whitespace-nowrap"
          >
            <i className="fa-solid fa-phone text-xs animate-pulse"></i>
            <span>Gọi Ngay</span>
          </a>

          <a
            href={`https://zalo.me/${safeAuthor.zalo}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/30 active:scale-95 transition whitespace-nowrap"
          >
            <i className="fa-solid fa-comment-dots text-xs"></i>
            <span>Zalo</span>
          </a>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('broker-contact-box');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else showToast('Mời bạn kéo xuống form đặt lịch xem nhà bên dưới', 'info');
            }}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition whitespace-nowrap"
            title="Đặt lịch xem nhà"
          >
            <i className="fa-regular fa-calendar-check text-xs"></i>
            <span>Hẹn Xem</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
