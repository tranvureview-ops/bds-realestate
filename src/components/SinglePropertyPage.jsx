'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';
import { VIP_PACKAGES, SALE_PRICE_PRESETS, RENT_PRICE_PRESETS } from '../data/mockData';
import dynamic from 'next/dynamic';
import { getPropertyPermalink, getCategoryPermalink, toVietnameseSlug, getBrokerPermalink, buildFacetedUrl, buildKeywordCleanSlug, buildSeoUrl, CITY_SLUGS, PROPERTY_TAXONOMY, formatSentenceCase } from '../utils/permalink';
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
      <i className="fa-solid fa-spinner fa-spin text-xl mr-2 text-emerald-600"></i> Đang tải bản đồ...
    </div>
  ),
});
import ListingCard from './ListingCard';
import CustomSelect from './CustomSelect';
import { findAdministrativeMerger, VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData';
import { validatePhoneNumber, normalizePhone, formatPhoneNumber } from '../utils/authValidation';
import PropertyVerificationModal from './PropertyVerificationModal';
import PropertyVerificationReviewModal from './PropertyVerificationReviewModal';
import SeoImage from './SeoImage';
import ArticleTreasureBox from './ArticleTreasureBox';
import BrokerProfileModal from './BrokerProfileModal';

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
    systemConfig,
    bookAppointment,
    usersList,
    verifyProperty,
    submitPropertyVerification
  } = useRealEstate();

  // Modal nộp Sổ đỏ 2 mặt & xem hồ sơ
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isReviewDocModalOpen, setIsReviewDocModalOpen] = useState(false);

  // Helper check xem người dùng hiện tại là khách vãng lai hay đã đăng nhập
  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';

  // If prop override provided, prioritize it
  const property = propertyOverride || selectedPropertyDetail || properties[0];

  // Photo viewer state
  const [activeMediaTab, setActiveMediaTab] = useState('photos'); // 'photos', 'vr360', 'video', 'map'
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeVrIndex, setActiveVrIndex] = useState(0);

  // Appointment Form state
  const [appointmentDate, setAppointmentDate] = useState('Hôm nay (Buổi chiều 14h - 16h)');
  const [appointmentName, setAppointmentName] = useState(() => currentUser?.name || '');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [appointmentPhoneError, setAppointmentPhoneError] = useState('');
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
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

  // Chia sẻ tin rao state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Modal Hồ sơ Chuyên viên tư vấn & Danh sách tin đăng của môi giới
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [brokerFilterTab, setBrokerFilterTab] = useState('all'); // 'all', 'sale', 'rent'

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

  // Khóa cuộn trang khi mở modal chia sẻ, modal báo cáo vi phạm, hoặc modal hồ sơ môi giới
  useEffect(() => {
    if (isReportModalOpen || isShareModalOpen || isBrokerModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isReportModalOpen, isShareModalOpen, isBrokerModalOpen]);

  // Tra cứu tự động thông tin sáp nhập đơn vị hành chính nếu có
  const mergerData = property?.isAdministrativeMerged ? {
    hasMerger: true,
    newAddress: property.newAddress || property.address,
    oldAddress: property.oldAddress || '',
    resolution: property.administrativeResolution || 'Nghị quyết của UBTV Quốc hội về việc sắp xếp các đơn vị hành chính'
  } : (property ? findAdministrativeMerger({
    city: property.city,
    district: property.district,
    ward: property.ward || property.address,
    street: property.street || property.address
  }) : null);

  // 1. Chuẩn hóa địa chỉ cũ / địa chỉ chưa cập nhật (chống trùng lặp từ)
  const displayOldAddress = useMemo(() => {
    if (!property) return '';
    if (property.oldAddress) return property.oldAddress;
    
    const rawAddr = (property.address || '').trim();
    const district = (property.district || '').trim();
    const city = (property.city || '').trim();

    // Tách các thành phần bằng dấu phẩy
    const parts = rawAddr.split(',').map(s => s.trim()).filter(Boolean);
    
    if (district && !parts.some(p => p.toLowerCase() === district.toLowerCase())) {
      parts.push(district);
    }
    if (city && !parts.some(p => p.toLowerCase() === city.toLowerCase())) {
      parts.push(city);
    }

    // Loại bỏ hoàn toàn các phần tử trùng lặp (ví dụ: "Quận Ngũ Hành Sơn, Đà Nẵng, Quận Ngũ Hành Sơn, Đà Nẵng")
    const uniqueParts = [];
    for (const part of parts) {
      if (!uniqueParts.some(u => u.toLowerCase() === part.toLowerCase())) {
        uniqueParts.push(part);
      }
    }
    return uniqueParts.join(', ');
  }, [property?.oldAddress, property?.address, property?.district, property?.city]);

  // 2. Chuẩn hóa địa chỉ mới (theo đơn vị hành chính mới / mô hình chính quyền đô thị tinh gọn bỏ cấp quận)
  const displayNewAddress = useMemo(() => {
    if (!property) return '';
    if (property.newAddress) return property.newAddress;
    
    if (mergerData?.newAddress) {
      return mergerData.newAddress;
    }

    let streetPart = property.street?.trim() || '';
    if (streetPart && !streetPart.toLowerCase().startsWith('đường') && !streetPart.toLowerCase().startsWith('phố')) {
      streetPart = `Đường ${streetPart}`;
    }

    if (!streetPart && property.address) {
      const parts = property.address.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        streetPart = parts[0];
      }
    }

    const wardPart = mergerData?.newWard || property.ward || '';
    const cityPart = property.city || 'Đà Nẵng';

    // Địa chỉ mới tại Đà Nẵng theo mô hình chính quyền đô thị mới (đã bỏ cấp quận)
    const newParts = [streetPart, wardPart, cityPart].filter(Boolean);
    const uniqueNewParts = [];
    for (const part of newParts) {
      if (!uniqueNewParts.some(u => u.toLowerCase() === part.toLowerCase())) {
        uniqueNewParts.push(part);
      }
    }
    return uniqueNewParts.join(', ');
  }, [property?.newAddress, property?.street, property?.address, property?.ward, property?.city, mergerData]);

  // 3. Chuỗi địa chỉ mới trong ngoặc đơn: (Xã/Phường, Tỉnh/TP mới)
  const newAddressNotice = useMemo(() => {
    if (!property) return '';
    // 1. Nếu có thông tin sáp nhập đơn vị hành chính
    if (mergerData?.newWard) {
      const city = mergerData.newCity || property.city || 'Đà Nẵng';
      return `${mergerData.newWard}, ${city}`.replace(/\s*mới\s*$/i, '').trim();
    }

    // 2. Nếu tin đăng có newAddress riêng biệt
    if (property.newAddress) {
      const rawNew = property.newAddress.replace(/^\(|\)$/g, '').replace(/\s*mới\s*$/i, '').trim();
      const parts = rawNew.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return parts.slice(-2).join(', ');
      }
      return rawNew;
    }

    // 3. Chuẩn hóa theo mô hình chính quyền đô thị mới tại Đà Nẵng (bỏ cấp quận)
    const ward = property.ward || '';
    const city = property.city || 'Đà Nẵng';
    if (ward && city) {
      return `${ward}, ${city}`;
    }

    return '';
  }, [mergerData, property?.newAddress, property?.ward, property?.city]);

  // Bảo vệ an toàn tuyệt đối chống lỗi thiếu ảnh hoặc thiếu thông tin tác giả/khách vãng lai
  const safeImages = Array.isArray(property?.images) && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

  // Tra cứu tác giả mới nhất từ usersList để đảm bảo tên & avatar luôn cập nhật theo hồ sơ người dùng
  const authorUser = property?.author?.id 
    ? usersList?.find(u => String(u.id) === String(property.author.id))
    : (property?.author?.phone ? usersList?.find(u => normalizePhone(u.phone) === normalizePhone(property.author.phone)) : null);

  // Phân định chính xác vai trò: Môi giới vs Khách tìm mua (đồng bộ theo lựa chọn đăng ký tài khoản)
  const rawRole = (authorUser?.role || property?.author?.role || '').toLowerCase();
  const rawRoleName = (authorUser?.roleName || property?.author?.title || '').toLowerCase();
  const isExplicitCustomer = rawRole === 'user' || rawRole === 'customer' || rawRole === 'buyer' ||
                             rawRoleName.includes('khách') || Boolean(property?.isGuest);

  const isBroker = !isExplicitCustomer && (
    rawRole === 'broker' ||
    rawRole === 'agent' ||
    rawRoleName.includes('môi giới') ||
    rawRoleName.includes('chuyên viên') ||
    Boolean(authorUser?.membership) ||
    (!authorUser?.role && !property?.author?.role) // Mặc định người đăng tin BĐS là môi giới
  );

  const authorRolePrefix = isBroker ? 'Môi Giới' : 'Khách tìm mua';
  const authorName = authorUser?.name || property?.author?.name || property?.contactName || 'Người đăng tin';
  const authorTitle = `${authorRolePrefix} ${authorName}`;
  const authorRoleLabel = isBroker ? 'Môi Giới BĐS' : 'Khách Tìm Mua';
  const authorBadgeLabel = isBroker ? 'Chuyên viên tư vấn' : 'Khách tìm mua';
  const brokerUrl = getBrokerPermalink({ id: authorUser?.id || property?.author?.id, name: authorName, phone: authorUser?.phone || property?.author?.phone || property?.contactPhone }, usersList);

  const isVerifiedAuthor = Boolean(
    authorUser?.isVerified ?? 
    property?.author?.isVerified ?? 
    authorUser?.kycStatus === 'verified' ?? 
    property?.author?.kycStatus === 'verified' ?? 
    false
  );

  const safeAuthor = {
    id: authorUser?.id || property?.author?.id || null,
    name: authorName,
    fullNameWithRole: authorTitle,
    rolePrefix: authorRolePrefix,
    isBroker,
    phone: formatPhoneNumber(authorUser?.phone || property?.author?.phone || property?.contactPhone || '0908 123 456'),
    zalo: (authorUser?.phone || property?.author?.zalo || property?.author?.phone || property?.contactPhone || '0908123456').replace(/\s+/g, ''),
    avatar: authorUser?.avatar || property?.author?.avatar || '/avatars/ai-preset-2.jpg',
    title: isVerifiedAuthor ? 'Môi giới chuyên nghiệp' : '',
    isVerified: isVerifiedAuthor,
    rating: property?.author?.rating || '5.0',
    reviewCount: property?.author?.reviewCount || 1,
    url: brokerUrl
  };

  // Lấy toàn bộ danh sách tin đăng thực tế của chuyên viên / môi giới này trên sàn
  const authorProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    const authorId = safeAuthor.id ? String(safeAuthor.id) : null;
    const authorPhone = normalizePhone(safeAuthor.phone);
    const authorNameLower = safeAuthor.name?.trim().toLowerCase();

    return properties.filter(p => {
      if (p.isDeleted || p.status === 'trash' || p.status === 'rejected') return false;
      const pAuthorId = p.author?.id ? String(p.author.id) : (p.userId ? String(p.userId) : null);
      const pPhone = normalizePhone(p.author?.phone || p.contactPhone);
      const pName = (p.author?.name || p.contactName || '').trim().toLowerCase();

      return (authorId && pAuthorId && authorId === pAuthorId) ||
             (authorPhone && pPhone && authorPhone.length >= 9 && authorPhone === pPhone) ||
             (authorNameLower && pName && authorNameLower === pName);
    });
  }, [properties, safeAuthor.id, safeAuthor.phone, safeAuthor.name]);

  // Đếm tổng số tin đăng thực tế của tác giả này trên sàn
  const authorListingsCount = useMemo(() => {
    return authorProperties.length > 0 
      ? authorProperties.length 
      : (authorUser?.activeListingsCount ?? (authorUser?.listingsCount ?? 1));
  }, [authorProperties.length, authorUser]);

  // Danh sách các tin khác của chuyên viên này (loại trừ tin hiện tại đang xem)
  const otherAuthorProperties = useMemo(() => {
    return authorProperties.filter(p => String(p.id) !== String(property?.id));
  }, [authorProperties, property?.id]);

  // Cấu trúc liên kết chuẩn: /moi-gioi/tran-van-vu
  const structuredBrokerLink = brokerUrl;

  // Handler mở Modal Popup hồ sơ môi giới bằng React State
  const handleOpenBrokerModal = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setIsBrokerModalOpen(true);
  };

  // Helper nhận diện chuẩn BĐS Bán vs Cho Thuê
  const isRentProperty = (p) => {
    if (!p) return false;
    const d = String(p.demand || p.type || p.listingType || '').toLowerCase();
    if (d === 'rent' || d === 'cho-thue' || d === 'chothue' || d === 'thue') return true;
    const title = String(p.title || '').toLowerCase();
    if (title.startsWith('cho thuê') || title.includes('cho thuê') || title.includes('cho thue')) return true;
    const price = String(p.priceDisplay || '').toLowerCase();
    if (price.includes('/tháng') || price.includes('tháng') || price.includes('/thang')) return true;
    return false;
  };

  const isSaleProperty = (p) => !isRentProperty(p);

  // Danh sách tin đăng hiển thị theo bộ lọc tab trong Modal hồ sơ môi giới
  const filteredAuthorProperties = useMemo(() => {
    if (brokerFilterTab === 'sale') {
      return authorProperties.filter(isSaleProperty);
    }
    if (brokerFilterTab === 'rent') {
      return authorProperties.filter(isRentProperty);
    }
    return authorProperties;
  }, [authorProperties, brokerFilterTab]);

  if (!property) return null;

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

  // Similar properties limit (default 4, configurable via Admin)
  const similarLimit = Number(
    singleConfig?.features?.similarPropertiesLimit || 
    singleConfig?.similarPropertiesLimit || 
    systemConfig?.similarPropertiesLimit || 
    4
  );

  // Similar properties (prioritize same city or same property type)
  const matchingProperties = properties.filter(
    p => p.id !== property.id && (p.city === property.city || p.propertyType === property.propertyType)
  );
  // Fallback if not enough matching properties to satisfy similarLimit, backfill from other active properties
  const otherProperties = properties.filter(
    p => p.id !== property.id && !matchingProperties.some(mp => mp.id === p.id)
  );
  const similarProperties = [...matchingProperties, ...otherProperties].slice(0, similarLimit);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setAppointmentPhoneError('');

    const phoneValidation = validatePhoneNumber(appointmentPhone);
    if (!phoneValidation.isValid) {
      setAppointmentPhoneError(phoneValidation.message);
      showToast(phoneValidation.message, 'warning');
      return;
    }

    setIsSubmittingAppointment(true);
    const appointmentPayload = {
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: displayOldAddress || property.address || `${property.district}, ${property.city}`,
      propertyPrice: property.priceDisplay,
      propertyPermalink: typeof window !== 'undefined' ? window.location.pathname : '',
      propertyCover: property.images?.[0] || '',
      appointmentDate: appointmentDate || 'Hôm nay (Buổi chiều 14h - 16h)',
      customerPhone: phoneValidation.normalized,
      customerName: (appointmentName || currentUser?.name || 'Khách hàng quan tâm').trim(),
      customerId: currentUser?.id && currentUser.id !== 'guest' ? currentUser.id : null,
      customerNote: (appointmentNote || '').trim(),
      brokerId: safeAuthor?.id || null,
      brokerName: safeAuthor?.name || 'Môi Giới Phụ Trách',
      brokerPhone: safeAuthor?.phone || '',
      brokerEmail: safeAuthor?.email || ''
    };

    const res = await bookAppointment(appointmentPayload);
    setIsSubmittingAppointment(false);

    if (res.success) {
      setAppointmentSuccess(true);
      showToast(`Đã gửi lịch hẹn xem nhà thành công! Môi giới ${safeAuthor.name} sẽ liên hệ xác nhận sớm nhất.`, 'success');
      setAppointmentNote('');
    } else {
      showToast(res.message || 'Lỗi khi gửi lịch hẹn xem nhà', 'error');
    }
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

    if (isGuest && (!reporterContact || !reporterContact.trim())) {
      showToast('Vui lòng cung cấp số điện thoại hoặc email liên hệ để nhận kết quả xử lý!', 'warning');
      return;
    }

    setReportSubmitting(true);
    try {
      const isEmail = reporterContact?.includes('@');
      const isPhone = reporterContact?.match(/\d{9,11}/);
      const rawResolvedEmail = !isGuest
        ? (currentUser?.email || (isEmail ? reporterContact.trim() : ''))
        : (isEmail ? reporterContact.trim() : '');
      const resolvedEmail = (rawResolvedEmail || '').replace(/@landmark\.vn/g, '@datbiendanang.vn');

      const contactValue = !isGuest
        ? (currentUser?.email || currentUser?.phone || reporterContact || '')
        : (reporterContact || '');

      const nameValue = !isGuest
        ? (currentUser?.name || 'Thành viên sàn')
        : (reporterName?.trim() || 'Khách vãng lai');

      const phoneValue = !isGuest
        ? (currentUser?.phone || '')
        : (isPhone ? reporterContact.trim() : '');

      const result = await addListingReport({
        propertyId: property.id,
        propertyTitle: property.title,
        reason: reportReason,
        description: reportDescription || '',
        contact: String(contactValue).replace(/@landmark\.vn/g, '@datbiendanang.vn'),
        reporterName: nameValue,
        reporterEmail: resolvedEmail,
        reporterPhone: phoneValue
      });

      setReportSuccessData({
        report: result.report,
        reporterEmail: resolvedEmail,
        property: property
      });
      setSupplementalEmail(resolvedEmail);
      setReportDescription('');
      showToast('Đã gửi báo cáo phản ánh tin rao vi phạm thành công!', 'success');
    } catch (err) {
      showToast('Có lỗi xảy ra khi gửi báo cáo, vui lòng thử lại sau', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HỆ THỐNG CÔNG THỨC GHÉP TỪ KHÓA TỐI ƯU HÓA SEO BẤT ĐỘNG SẢN (3 NHÓM / 6 CÔNG THỨC)
  // --------------------------------------------------------------------------
  const demandText = property.demand === 'sale' ? 'Bán' : 'Cho thuê';
  const typeText = property.propertyType === 'apartment' ? 'căn hộ chung cư'
    : property.propertyType === 'mini-apartment' ? 'chung cư mini, căn hộ dịch vụ'
    : property.propertyType === 'house' ? 'nhà riêng'
    : property.propertyType === 'villa' ? 'biệt thự liền kề'
    : property.propertyType === 'street-house' ? 'nhà mặt phố'
    : property.propertyType === 'shophouse' ? 'shophouse'
    : property.propertyType === 'project-land' ? 'đất nền dự án'
    : property.propertyType === 'land' ? 'đất'
    : property.propertyType === 'farm-resort' ? 'trang trại, khu nghỉ dưỡng'
    : property.propertyType === 'condotel' ? 'condotel'
    : property.propertyType === 'warehouse' ? 'kho, nhà xưởng'
    : property.propertyType === 'office' ? 'văn phòng'
    : property.propertyType === 'other' ? 'bất động sản khác'
    : (property.propertyTypeName || 'nhà riêng').toLowerCase();

  // 1. Tên Dự án (hoặc fallback tên khu vực)
  const cleanProject = (property.project || '')
    .replace(/\(.*?\)/g, '')
    .replace(/^Dự án:\s*/i, '')
    .trim() || (property.title.includes('Celadon') ? 'Celadon City' : property.title.includes('Goldmark') ? 'Goldmark City' : property.title.includes('Vinhomes') ? 'Vinhomes' : '');

  // 2. Tên Đường (Làm sạch chữ 'Đường' để chuẩn hóa ghép: Đường [Tên đường])
  let rawStreet = property.street || '';
  if (!rawStreet && property.address) {
    const firstPart = property.address.split(',')[0] || '';
    rawStreet = firstPart.replace(/^địa chỉ:\s*/i, '').trim();
  }
  const cleanStreet = rawStreet
    .replace(/^(đường|phố|ngõ|ngách|hẻm|số)\s+[^,]+/i, '')
    .replace(/^(đường|phố)\s+/i, '')
    .trim() || 'Kim Mã';

  // 3. Tên Phường (Làm sạch chữ 'Phường', 'Xã' để chuẩn hóa ghép: phường [Tên phường])
  let rawWard = property.ward || '';
  if (!rawWard && property.address) {
    const matchWard = property.address.match(/(?:phường|xã|phường\/xã)\s+([^,]+)/i);
    if (matchWard) rawWard = matchWard[1];
  }
  const cleanWard = (rawWard || '').replace(/^(phường|xã|phường\/xã)\s+/i, '').trim() || 'Hải Châu 1';

  // 4. Quận / Khu vực & Thành phố
  const districtName = property.district || 'Quận Hải Châu';
  const cityName = property.city || 'Đà Nẵng';

  // 5. Diện tích min - max (Diện tích làm tròn bao quanh diện tích thực tế)
  const curArea = Number(property.area) || 80;
  const areaMin = Math.max(20, Math.floor((curArea - 5) / 10) * 10);
  const areaMax = areaMin + 20;

  // 6. Số phòng ngủ
  const bedroomCount = property.bedroom || 2;

  // 7. Khoảng giá min - max (Dựa trên giá thực tế của BĐS, đảm bảo minPrice <= curPrice <= maxPrice)
  const curPrice = Number(property.price) || 3500000000;
  let priceMinText = '3 tỷ';
  let priceMaxText = '5 tỷ';
  let matchedPriceRange = '2b-5b';

  if (property.demand === 'rent') {
    const priceMillion = curPrice / 1000000;
    if (priceMillion < 5) {
      priceMinText = '3 triệu';
      priceMaxText = '5 triệu';
      matchedPriceRange = 'under-2b';
    } else if (priceMillion < 10) {
      priceMinText = '5 triệu';
      priceMaxText = '10 triệu';
      matchedPriceRange = 'under-2b';
    } else if (priceMillion < 15) {
      priceMinText = '10 triệu';
      priceMaxText = '15 triệu';
      matchedPriceRange = '2b-5b';
    } else if (priceMillion < 20) {
      priceMinText = '15 triệu';
      priceMaxText = '20 triệu';
      matchedPriceRange = '2b-5b';
    } else if (priceMillion < 30) {
      priceMinText = '20 triệu';
      priceMaxText = '30 triệu';
      matchedPriceRange = '5b-10b';
    } else if (priceMillion < 50) {
      priceMinText = '30 triệu';
      priceMaxText = '50 triệu';
      matchedPriceRange = '5b-10b';
    } else {
      priceMinText = '50 triệu';
      priceMaxText = '100 triệu';
      matchedPriceRange = '10b-30b';
    }
  } else {
    const priceBillion = curPrice / 1000000000;
    if (priceBillion < 2) {
      priceMinText = '1 tỷ';
      priceMaxText = '2 tỷ';
      matchedPriceRange = 'under-2b';
    } else if (priceBillion < 3) {
      priceMinText = '2 tỷ';
      priceMaxText = '3 tỷ';
      matchedPriceRange = '2b-5b';
    } else if (priceBillion < 5) {
      priceMinText = '3 tỷ';
      priceMaxText = '5 tỷ';
      matchedPriceRange = '2b-5b';
    } else if (priceBillion < 7) {
      priceMinText = '5 tỷ';
      priceMaxText = '7 tỷ';
      matchedPriceRange = '5b-10b';
    } else if (priceBillion <= 10) {
      priceMinText = '7 tỷ';
      priceMaxText = '10 tỷ';
      matchedPriceRange = '5b-10b';
    } else if (priceBillion <= 15) {
      priceMinText = '10 tỷ';
      priceMaxText = '15 tỷ';
      matchedPriceRange = '10b-30b';
    } else if (priceBillion <= 20) {
      priceMinText = '15 tỷ';
      priceMaxText = '20 tỷ';
      matchedPriceRange = '10b-30b';
    } else if (priceBillion <= 30) {
      priceMinText = '20 tỷ';
      priceMaxText = '30 tỷ';
      matchedPriceRange = '10b-30b';
    } else if (priceBillion <= 50) {
      priceMinText = '30 tỷ';
      priceMaxText = '50 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 70) {
      priceMinText = '50 tỷ';
      priceMaxText = '70 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 100) {
      priceMinText = '70 tỷ';
      priceMaxText = '100 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 150) {
      priceMinText = '100 tỷ';
      priceMaxText = '150 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 200) {
      priceMinText = '150 tỷ';
      priceMaxText = '200 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 300) {
      priceMinText = '200 tỷ';
      priceMaxText = '300 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 500) {
      priceMinText = '300 tỷ';
      priceMaxText = '500 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 1000) {
      priceMinText = '500 tỷ';
      priceMaxText = '1000 tỷ';
      matchedPriceRange = 'over-30b';
    } else if (priceBillion <= 2000) {
      priceMinText = '1000 tỷ';
      priceMaxText = '2000 tỷ';
      matchedPriceRange = 'over-30b';
    } else {
      const step = 1000;
      const lower = Math.floor(priceBillion / step) * step;
      const upper = lower + step;
      priceMinText = `${lower} tỷ`;
      priceMaxText = `${upper} tỷ`;
      matchedPriceRange = 'over-30b';
    }
  }

  // CHUẨN BỊ NỘI DUNG TỪ KHÓA THEO 6 CÔNG THỨC SEO CHUẨN
  const formula1Text = cleanProject 
    ? `${demandText} ${typeText} ${cleanProject} từ ${areaMin} m2 đến ${areaMax} m2`
    : `${demandText} ${typeText} ${districtName} từ ${areaMin} m2 đến ${areaMax} m2`;
  const formula2Text = `${demandText} ${typeText} Đường ${cleanStreet} ${districtName}`;
  const formula3Text = `${demandText} ${typeText} phường ${cleanWard} ${districtName}`;
  const formula4CityText = `${demandText} ${typeText} ${cityName} ${bedroomCount} PN`;
  const formula4DistrictText = `${demandText} ${typeText} ${districtName} ${bedroomCount} PN`;
  const formula5FurnitureText = `${demandText} ${typeText} ${districtName} full nội thất`;
  const formula5BalconyText = `${demandText} ${typeText} ${districtName} có ban công`;
  const formula6CityText = `${demandText} ${typeText} ${cityName} từ ${priceMinText} đến ${priceMaxText}`;
  const formula6DistrictText = `${demandText} ${typeText} ${districtName} từ ${priceMinText} đến ${priceMaxText}`;

  // TỔNG HỢP CÁC CỤM TỪ KHÓA THEO 3 NHÓM CÔNG THỨC SEO CHUẨN (CLEAN SLUG URLS):
  const seoFormulaKeywords = [
    // -------------------------------------------------------------
    // NHÓM 1: CÔNG THỨC GHÉP THEO VỊ TRÍ & ĐỊA LÝ (Location-based)
    // -------------------------------------------------------------
    // Công thức 1: [Loại hình] + [Tên dự án] + từ [Diện tích min] đến [Diện tích max]
    {
      group: 'location',
      groupName: 'Vị trí & Địa lý',
      formula: 'Công thức 1: Dự án & Diện tích',
      text: formula1Text,
      badge: `${areaMin} - ${areaMax} m²`,
      url: buildKeywordCleanSlug(formula1Text)
    },
    // Công thức 2: [Loại hình] + Đường [Tên đường] + [Quận/Khu vực]
    {
      group: 'location',
      groupName: 'Vị trí & Địa lý',
      formula: 'Công thức 2: Đường & Khu vực',
      text: formula2Text,
      badge: `Đường ${cleanStreet}`,
      url: buildKeywordCleanSlug(formula2Text)
    },
    // Công thức 3: [Loại hình] + Phường [Tên phường] + [Quận]
    {
      group: 'location',
      groupName: 'Vị trí & Địa lý',
      formula: 'Công thức 3: Phường & Quận',
      text: formula3Text,
      badge: `Phường ${cleanWard}`,
      url: buildKeywordCleanSlug(formula3Text)
    },

    // -------------------------------------------------------------
    // NHÓM 2: CÔNG THỨC GHÉP THEO ĐẶC ĐIỂM / TIỆN ÍCH (Property Attributes)
    // -------------------------------------------------------------
    // Công thức 4: [Loại hình] + [Khu vực/Thành phố] + [Số phòng ngủ] PN
    {
      group: 'attributes',
      groupName: 'Đặc điểm & Tiện ích',
      formula: 'Công thức 4: Số phòng ngủ',
      text: formula4CityText,
      badge: `${bedroomCount} PN ${cityName}`,
      url: buildKeywordCleanSlug(formula4CityText)
    },
    {
      group: 'attributes',
      groupName: 'Đặc điểm & Tiện ích',
      formula: 'Công thức 4: Số phòng ngủ (Quận)',
      text: formula4DistrictText,
      badge: `${bedroomCount} PN ${districtName}`,
      url: buildKeywordCleanSlug(formula4DistrictText)
    },
    // Công thức 5: [Loại hình] + [Khu vực] + full nội thất / có ban công
    {
      group: 'attributes',
      groupName: 'Đặc điểm & Tiện ích',
      formula: 'Công thức 5: Tiện ích / Nội thất',
      text: formula5FurnitureText,
      badge: 'Full nội thất',
      url: buildKeywordCleanSlug(formula5FurnitureText)
    },
    {
      group: 'attributes',
      groupName: 'Đặc điểm & Tiện ích',
      formula: 'Công thức 5: Ban công / View thoáng',
      text: formula5BalconyText,
      badge: 'Có ban công',
      url: buildKeywordCleanSlug(formula5BalconyText)
    },

    // -------------------------------------------------------------
    // NHÓM 3: CÔNG THỨC GHÉP THEO KHOẢNG GIÁ & TÀI CHÍNH (Pricing Tier)
    // -------------------------------------------------------------
    // Công thức 6: [Loại hình] + [Khu vực] + từ [Giá min] đến [Giá max]
    {
      group: 'pricing',
      groupName: 'Khoảng giá & Tài chính',
      formula: 'Công thức 6: Khoảng giá (Thành phố)',
      text: formula6CityText,
      badge: `${priceMinText} - ${priceMaxText}`,
      url: buildKeywordCleanSlug(formula6CityText)
    },
    {
      group: 'pricing',
      groupName: 'Khoảng giá & Tài chính',
      formula: 'Công thức 6: Khoảng giá (Quận / Huyện)',
      text: formula6DistrictText,
      badge: `${priceMinText} - ${priceMaxText}`,
      url: buildKeywordCleanSlug(formula6DistrictText)
    }
  ];


  // Danh sách các quận/huyện thuộc cùng thành phố để điều hướng khu vực lân cận
  const matchedAdminCity = (VIETNAM_ADMINISTRATIVE_DATA || []).find(c => 
    c.name.toLowerCase() === (property.city || '').toLowerCase() ||
    (property.city || '').toLowerCase().includes(c.name.toLowerCase())
  );
  const neighboringDistricts = (matchedAdminCity?.districts || []).slice(0, 8).map(d => ({
    name: d.name,
    count: properties.filter(p => 
      p.status === 'active' && 
      p.demand === property.demand && 
      p.city === property.city && 
      p.district?.toLowerCase().includes(d.name.toLowerCase().replace(/^(quận|huyện|thị xã|tp\.)\s+/i, ''))
    ).length,
    url: buildSeoUrl({ demand: property.demand, city: property.city, district: d.name })
  }));

  // Điều hướng đa diện theo Loại Hình tại cùng Quận/Huyện
  const propertyTypesInDistrict = [
    { key: 'apartment', name: 'Căn hộ chung cư', icon: 'fa-building' },
    { key: 'mini-apartment', name: 'Chung cư mini, CH dịch vụ', icon: 'fa-hotel' },
    { key: 'house', name: 'Nhà riêng, nhà ngõ', icon: 'fa-house' },
    { key: 'street-house', name: 'Nhà mặt phố kinh doanh', icon: 'fa-store' },
    { key: 'villa', name: 'Biệt thự liền kề', icon: 'fa-landmark-dome' },
    { key: 'shophouse', name: 'Shophouse', icon: 'fa-shop' },
    { key: 'land', name: 'Đất nền, đất thổ cư', icon: 'fa-map' }
  ].map(t => ({
    ...t,
    count: properties.filter(p => p.status === 'active' && p.demand === property.demand && p.district === property.district && p.propertyType === t.key).length,
    url: buildSeoUrl({ demand: property.demand, propertyType: t.key, city: property.city, district: property.district })
  }));

  // Điều hướng đa diện theo Khoảng Giá tại Quận/Huyện (Phân biệt mua bán và cho thuê)
  const isRent = property.demand === 'rent';
  const priceRangesInDistrict = (isRent ? RENT_PRICE_PRESETS.slice(1) : SALE_PRICE_PRESETS.slice(1)).map(pr => ({
    key: pr.value,
    label: pr.label,
    url: buildSeoUrl({ demand: property.demand, city: property.city, district: property.district, priceRange: pr.value })
  }));

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
              to={getCategoryPermalink(property.demand, property.propertyType)} 
              className="hover:text-emerald-600 transition font-semibold"
            >
              {(property.propertyType && PROPERTY_TAXONOMY[property.demand]?.types[property.propertyType]?.name) || (property.demand === 'sale' ? 'Bán nhà riêng, nhà phố' : 'Cho thuê nhà riêng, nhà phố')}
            </Link>
            {property.city && (
              <>
                <span className="text-slate-300">/</span>
                <Link 
                  to={getCategoryPermalink(property.demand, property.propertyType, property.city)}
                  className="text-slate-600 hover:text-emerald-600 transition font-semibold"
                >
                  {property.city}
                </Link>
              </>
            )}
            {property.district && (
              <>
                <span className="text-slate-300">/</span>
                <Link 
                  to={getCategoryPermalink(property.demand, property.propertyType, property.city, property.district)}
                  className="text-slate-600 hover:text-emerald-600 transition font-semibold"
                >
                  {property.district}
                </Link>
              </>
            )}
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs property-title-sentence">{formatSentenceCase(property.title)}</span>
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
              {/* Main Big Photo (LCP Optimized) */}
              <div 
                onClick={() => { setSelectedPhotoIndex(0); setIsLightboxOpen(true); }}
                className="md:col-span-2 h-full relative overflow-hidden group cursor-pointer"
              >
                <SeoImage
                  src={safeImages[0]}
                  property={property}
                  index={0}
                  total={safeImages.length}
                  type="main"
                  priority={true}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg ${vipPkg.badgeColor}`}>
                    {vipPkg.shortName}
                  </span>
                  {Boolean(property.is_verified || property.isVerified) && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-lg flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Tin xác thực</span>
                    </span>
                  )}
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
                  <SeoImage
                    src={safeImages[1] || safeImages[0]}
                    property={property}
                    index={1}
                    total={safeImages.length}
                    type="gallery"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition"></div>
                </div>
                <div 
                  onClick={() => { setSelectedPhotoIndex(2 % safeImages.length); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <SeoImage
                    src={safeImages[2] || safeImages[0]}
                    property={property}
                    index={2}
                    total={safeImages.length}
                    type="gallery"
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
                  <SeoImage
                    src={safeImages[3] || safeImages[0]}
                    property={property}
                    index={3}
                    total={safeImages.length}
                    type="gallery"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition"></div>
                </div>
                <div 
                  onClick={() => { setSelectedPhotoIndex(0); setIsLightboxOpen(true); }}
                  className="h-1/2 relative overflow-hidden group cursor-pointer"
                >
                  <SeoImage
                    src={safeImages[0]}
                    property={property}
                    index={0}
                    total={safeImages.length}
                    type="gallery"
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
            <SeoImage
              src={property.vrScenes?.[activeVrIndex]?.img || safeImages[0]}
              property={property}
              type="vr360"
              sceneName={property.vrScenes?.[activeVrIndex]?.name || 'Không gian thực tế'}
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

                {/* Tin đã xác thực: Badge màu xanh lục (Ẩn hoàn toàn khi chưa xác thực) */}
                {Boolean(property.is_verified || property.isVerified) && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Tin xác thực</span>
                  </span>
                )}

                <span className="text-xs text-slate-400 font-mono">
                  Mã tin: <strong>{property.id}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black leading-snug tracking-tight property-title-sentence ${vipPkg.titleClass}`}>
                {formatSentenceCase(property.title)}
              </h1>

              {/* Address */}
              <div className="flex items-start gap-2.5 text-xs sm:text-sm mt-3 pt-1 text-slate-800">
                <i className="fa-solid fa-location-dot text-slate-800 text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5 leading-snug">
                  <div className="font-semibold text-slate-900">
                    {displayOldAddress}
                  </div>
                  {newAddressNotice && (
                    <div className="text-slate-600 text-xs font-normal">
                      ({newAddressNotice} mới)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mức giá niêm yết</div>
                <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5">
                  {property.priceDisplay ? property.priceDisplay.replace(/Tỷ/g, 'tỷ') : ''}
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

          {/* RƯƠNG KHO BÁU BĐS TRONG BÀI VIẾT (TỐI ĐA 3 HỘP/NGÀY - CỘNG TIỀN VÀO VÍ KM) */}
          <ArticleTreasureBox property={property} />

          {/* B2. ĐẶC ĐIỂM TIN ĐĂNG */}
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

          {/* E. THÔNG BÁO VỀ NỘI DUNG VÀ MIỄN TRỪ TRÁCH NHIỆM (CẤU HÌNH TRONG ADMIN) */}
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
            const platformName = discCfg.platformName || systemConfig?.brandShortName || 'Đất Biển Đà Nẵng';

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

                  <div className="flex items-center gap-2">
                    {/* Nút Xác thực tin ở phần hành động nếu tin chưa xác thực (Ẩn khi tin đã xác thực) */}
                    {!Boolean(property.is_verified || property.isVerified) && (
                      (property.verification_status === 'pending' || property.verificationStatus === 'pending') ? (
                        <button
                          type="button"
                          onClick={() => setIsReviewDocModalOpen(true)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Hồ sơ Sổ đỏ 2 mặt đang chờ Ban quản trị duyệt. Bấm để xem lại."
                        >
                          <i className="fa-solid fa-file-shield text-xs text-amber-600"></i>
                          <span>Đang duyệt sổ đỏ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsVerifyModalOpen(true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Tải lên Sổ đỏ 2 mặt để yêu cầu Ban quản trị xác thực tin"
                        >
                          <i className="fa-solid fa-circle-check text-xs"></i>
                          <span>Xác thực tin</span>
                        </button>
                      )
                    )}

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
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed text-justify">
                  Quý vị đang xem nội dung tin rao <strong className="text-slate-900 font-bold">"{property.title}"</strong> - Mã tin <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{property.id}</span>. Nội dung tin đăng này do Người đăng tin cung cấp và chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của thông tin. Với tư cách là Nền tảng thương mại điện tử trung gian, <strong>{platformName}</strong> thực hiện rà soát, kiểm duyệt trên cơ sở các thông tin được cung cấp. Quý vị vui lòng chủ động kiểm tra, thẩm định thông tin pháp lý và thực tế trước khi giao dịch. Nếu phát hiện nội dung không chính xác hoặc vi phạm, xin vui lòng thông báo qua{' '}
                  <Link href={`tel:${hotlineClean}`} className="text-red-600 font-bold hover:underline inline-flex items-center gap-0.5">
                    Hotline {hotlineDisplay}
                  </Link>{' '}
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

          {/* G. TÌM KIẾM THEO TỪ KHÓA LIÊN QUAN & HASHTAG BĐS */}
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

              {/* Danh sách các cụm từ khóa sinh theo công thức SEO */}
              <div className="flex flex-wrap gap-2.5">
                {seoFormulaKeywords.map((kw, idx) => (
                  <Link
                    key={idx}
                    to={kw.url}
                    className="group px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl text-xs font-semibold text-slate-800 hover:text-indigo-700 transition flex items-center gap-2 shadow-xs hover:shadow-sm"
                  >
                    <i className="fa-solid fa-magnifying-glass text-[11px] text-slate-400 group-hover:text-indigo-600 transition"></i>
                    <span>{kw.text}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-300 group-hover:text-indigo-500 transition opacity-0 group-hover:opacity-100"></i>
                  </Link>
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
                  {/* Broker Header: Kiến trúc SEO tối ưu (Dùng State + Thẻ <Link> có cấu trúc + Schema.org Microdata) */}
                  <div 
                    itemScope 
                    itemType="https://schema.org/RealEstateAgent"
                    className="flex items-center gap-3 pb-4 border-b border-slate-100 group hover:bg-emerald-50/60 -mx-2 px-2 py-2 rounded-2xl transition-all"
                  >
                    {/* Dữ liệu có cấu trúc Microdata cho Search Engine */}
                    <meta itemProp="name" content={safeAuthor.name} />
                    <meta itemProp="telephone" content={safeAuthor.phone} />
                    <meta itemProp="jobTitle" content={safeAuthor.title} />

                    {/* 1. Avatar môi giới bọc trong thẻ <Link> có cấu trúc */}
                    <Link 
                      href={structuredBrokerLink}
                      rel="nofollow"
                      onClick={handleOpenBrokerModal}
                      className="relative shrink-0 block cursor-pointer"
                      title={authorTitle}
                    >
                      <SeoImage
                        src={safeAuthor.avatar}
                        propertyTitle={property.title}
                        type="agent"
                        customContext={safeAuthor.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md group-hover:scale-105 group-hover:border-emerald-600 transition-all"
                        itemProp="image"
                      />
                      {safeAuthor.isVerified && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow" title={`${authorTitle} đã xác thực`}>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </Link>

                    {/* 2. Thông tin chuyên viên bọc trong thẻ <Link> có cấu trúc */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                          {authorBadgeLabel}
                        </div>
                        <Link
                          href={structuredBrokerLink}
                          rel="nofollow"
                          onClick={handleOpenBrokerModal}
                          className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                          title={authorTitle}
                        >
                          <span>Xem hồ sơ</span>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </Link>
                      </div>

                      <Link
                        href={structuredBrokerLink}
                        rel="nofollow"
                        onClick={handleOpenBrokerModal}
                        className="block cursor-pointer group-hover:text-emerald-700 transition"
                        title={authorTitle}
                      >
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition truncate">
                          {safeAuthor.name}
                        </h4>
                      </Link>

                      {safeAuthor.title ? (
                        <div className="text-xs text-slate-500 truncate" title={safeAuthor.title}>
                          {safeAuthor.title}
                        </div>
                      ) : null}

                      <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-1">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-star"></i>
                          <span className="font-bold text-slate-800">{safeAuthor.rating || '5.0'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <Link
                          href={structuredBrokerLink}
                          rel="nofollow"
                          onClick={handleOpenBrokerModal}
                          className="text-emerald-600 font-bold hover:underline cursor-pointer"
                          title={`Xem tất cả ${authorListingsCount} tin đăng của ${authorTitle}`}
                        >
                          ({authorListingsCount} tin đăng)
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Direct Calling Hotline Button */}
                  <div className="space-y-2">
                    <Link
                      href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 group"
                    >
                      <i className="fa-solid fa-phone-volume group-hover:animate-bounce text-base"></i>
                      <span>GỌI NGAY: {safeAuthor.phone}</span>
                    </Link>

                    <Link
                      href={`https://zalo.me/${safeAuthor.zalo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-comment-dots"></i>
                      <span>Chat Trực Tiếp Qua Zalo</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Appointment Form */}
              {singleConfig?.features?.showAppointmentBooking !== false && (
                <form onSubmit={handleAppointmentSubmit} className={`space-y-3 ${singleConfig?.features?.showAuthorCard !== false ? 'pt-4 border-t border-slate-100' : ''}`}>
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-regular fa-calendar-check text-emerald-600"></i>
                      <span>Đặt Lịch Hẹn Xem Nhà Trực Tiếp</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Miễn phí 100%
                    </span>
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
                      onChange={(e) => {
                        setAppointmentPhone(e.target.value);
                        if (appointmentPhoneError) setAppointmentPhoneError('');
                      }}
                      onBlur={() => {
                        if (appointmentPhone) {
                          const v = validatePhoneNumber(appointmentPhone);
                          if (!v.isValid) setAppointmentPhoneError(v.message);
                        }
                      }}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:outline-none transition ${
                        appointmentPhoneError
                          ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                          : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                      required
                    />
                    {appointmentPhoneError && (
                      <p className="text-[10.5px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                        <span>{appointmentPhoneError}</span>
                      </p>
                    )}
                  </div>

                  {appointmentSuccess ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 animate-in fade-in duration-300">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                        <span>Đã gửi lời hẹn xem nhà thành công!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Môi giới <strong>{safeAuthor.name}</strong> đã nhận được thông báo qua Email & Zalo, sẽ sớm gọi xác nhận với bạn qua SĐT <strong>{appointmentPhone}</strong>.
                      </p>
                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        {safeAuthor.phone && (
                          <Link
                            href={`https://zalo.me/${normalizePhone(safeAuthor.phone)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-center text-[11px] transition flex items-center justify-center gap-1.5"
                          >
                            <i className="fa-solid fa-comment-dots"></i>
                            <span>Chat Zalo Môi Giới</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setAppointmentSuccess(false)}
                          className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-center text-[11px] transition"
                        >
                          Đặt lịch khác
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmittingAppointment}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingAppointment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Đang gửi lời hẹn...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-paper-plane"></i>
                          <span>Gửi Lời Hẹn Xem Nhà Ngay</span>
                        </>
                      )}
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
              Bảo Hiểm Thông Tin {systemConfig?.brandShortName || 'Sàn Giao Dịch'}
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Mọi tin đăng trên sàn đều được kiểm tra địa chỉ thực tế. Tuyệt đối không đặt cọc hoặc chuyển khoản trước khi kiểm tra sổ đỏ/hồng bản gốc tại văn phòng công chứng.
            </p>
          </div>

          {/* BỘ ĐIỀU HƯỚNG ĐA DIỆN (FACETED TAXONOMY NAVIGATION) TRÊN SIDEBAR */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-3.5 text-xs">
              {/* Mục 1: Quận / Huyện lân cận */}
              {neighboringDistricts.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                    <i className="fa-solid fa-location-dot text-emerald-600"></i>
                    <span>Quận / Huyện tại {property.city || 'Đà Nẵng'}</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {neighboringDistricts.map((nd, idx) => (
                      <Link
                        key={idx}
                        to={nd.url}
                        className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                          nd.name.toLowerCase().includes((property.district || '').toLowerCase().replace(/^(quận|huyện|thị xã|tp\.)\s+/i, ''))
                            ? 'bg-emerald-100 text-emerald-900 font-bold'
                            : 'hover:bg-white text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        <span className="truncate">{nd.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-semibold shrink-0">
                          {nd.count} tin
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mục 2: Loại hình BĐS tại quận */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <i className="fa-solid fa-building text-blue-600"></i>
                  <span>Loại hình tại {property.district || property.city || 'khu vực'}</span>
                </div>
                <div className="space-y-1.5">
                  {propertyTypesInDistrict.map((pt, idx) => (
                    <Link
                      key={idx}
                      to={pt.url}
                      className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        property.propertyType === pt.key
                          ? 'bg-blue-100 text-blue-900 font-bold'
                          : 'hover:bg-white text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <i className={`fa-solid ${pt.icon} text-[10px] text-slate-400`}></i>
                        {pt.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-semibold shrink-0">
                        {pt.count} tin
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mục 3: Khoảng giá tại quận */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <i className="fa-solid fa-tag text-rose-600"></i>
                  <span>Mức giá tại {property.district || property.city || 'khu vực'}</span>
                </div>
                <div className="space-y-1.5">
                  {priceRangesInDistrict.map((pr, idx) => (
                    <Link
                      key={idx}
                      to={pr.url}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-rose-700 transition"
                    >
                      <span className="truncate">{demandText} nhà đất {pr.label}</span>
                      <i className="fa-solid fa-arrow-right text-[9px] text-slate-300"></i>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3b. TIN ĐĂNG CÙNG CHUYÊN VIÊN TƯ VẤN (AUTHOR OTHER LISTINGS) */}
      {otherAuthorProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-emerald-600 rounded-full"></span>
                  <span>Tin Đăng Cùng {authorTitle}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Khám phá thêm các bất động sản do {authorTitle} đang đăng tải và phụ trách ({authorProperties.length} tin)
                </p>
              </div>
              <Link
                href={structuredBrokerLink}
                rel="nofollow"
                onClick={handleOpenBrokerModal}
                className="self-start sm:self-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title={`Xem toàn bộ ${authorProperties.length} tin đăng của ${authorTitle}`}
              >
                <span>Xem tất cả ({authorProperties.length} tin)</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherAuthorProperties.slice(0, 4).map(otherProp => (
                <ListingCard key={otherProp.id} property={otherProp} viewMode="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. BẤT ĐỘNG SẢN TƯƠNG TỰ CÙNG PHÂN KHÚC (FULL WIDTH CONTAINER) */}
      {singleConfig?.features?.showSimilarProperties !== false && similarProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-rose-600 rounded-full"></span>
                  <span>Bất Động Sản Tương Tự Cùng Phân Khúc</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Khám phá các bất động sản tương đồng về phân khúc hoặc khu vực {property.district ? `tại ${property.district}, ` : ''}{property.city}
                </p>
              </div>
              <span className="self-start sm:self-center text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full">
                {similarProperties.length} bất động sản gợi ý
              </span>
            </div>

            <div className={`grid gap-6 ${
              similarLimit === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : similarLimit === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : similarLimit === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {similarProperties.map(sim => (
                <ListingCard key={sim.id} property={sim} viewMode="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FULLSCREEN LIGHTBOX MODAL */}
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

            <SeoImage
              src={safeImages[selectedPhotoIndex] || safeImages[0]}
              property={property}
              index={selectedPhotoIndex}
              total={safeImages.length}
              type="gallery"
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
              <SeoImage
                key={idx}
                src={img}
                property={property}
                index={idx}
                total={safeImages.length}
                type="gallery"
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition ${selectedPhotoIndex === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. MODAL CHIA SẺ TIN ĐĂNG */}
      {isShareModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
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
                  {displayOldAddress}
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
                alt={`Mã QR quét nhanh bài đăng: ${property.title}`}
                title={`Mã QR quét nhanh bài đăng: ${property.title}`}
                loading="lazy"
                decoding="async"
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
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReportModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            {/* Header (Cố định ở trên cùng) */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shrink-0">
                  <i className="fa-solid fa-flag"></i>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Form hoặc Success State */}
            {reportSuccessData ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 sm:p-6 space-y-4 text-center overflow-y-auto flex-1">
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
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
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
                </div>

                <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportSuccessData(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow cursor-pointer"
                  >
                    Đóng Hộp Thoại
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Cuộn nội dung mượt mà, không bị che khuất */}
                <div className="overflow-y-auto px-5 sm:px-6 py-4 flex-1 space-y-4 text-xs">
                  {/* Target Property Summary */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-800 line-clamp-1">{property.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {property.priceDisplay} • {displayOldAddress}
                    </div>
                  </div>

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
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${reportReason === item.id ? 'bg-rose-50/70 border-rose-400 text-slate-900 font-semibold shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                        >
                          <input
                            type="radio"
                            name="reportReason"
                            value={item.id}
                            checked={reportReason === item.id}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="mt-0.5 accent-rose-600 shrink-0"
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
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                    ></textarea>
                  </div>

                  {/* Khu vực thông tin liên hệ của người báo cáo: CHỈ HIỂN THỊ CÁC Ô NHẬP LIỆU KHI CHƯA ĐĂNG NHẬP */}
                  {isGuest ? (
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <i className="fa-solid fa-address-card text-rose-500"></i>
                          Thông tin người phản ánh:
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <i className="fa-solid fa-user-secret text-[10px]"></i>
                          Khách vãng lai
                        </span>
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
                              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
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
                              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-info text-blue-500 text-[10px] shrink-0"></i>
                        <span>Vui lòng để lại số điện thoại hoặc email để BQT gửi thông báo giải quyết.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 truncate">
                            <span className="font-bold text-slate-800 block truncate">{currentUser.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono truncate block">
                              {currentUser.email || currentUser.phone}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0 flex items-center gap-1">
                          <i className="fa-solid fa-circle-check text-emerald-600"></i>
                          Tài khoản đã đăng nhập
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Cố Định / Nổi Bật (Luôn luôn thấy rõ hai nút Hủy bỏ & Gửi) */}
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer shadow-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
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
          <Link
            href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition whitespace-nowrap"
          >
            <i className="fa-solid fa-phone text-xs animate-pulse"></i>
            <span>Gọi Ngay</span>
          </Link>

          <Link
            href={`https://zalo.me/${safeAuthor.zalo}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/30 active:scale-95 transition whitespace-nowrap"
          >
            <i className="fa-solid fa-comment-dots text-xs"></i>
            <span>Zalo</span>
          </Link>

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

      {/* Modal nộp Sổ đỏ 2 mặt xác thực tin */}
      {isVerifyModalOpen && (
        <PropertyVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          property={property}
          onSubmit={async (pId, data) => {
            await submitPropertyVerification(pId, data);
            setIsVerifyModalOpen(false);
          }}
        />
      )}

      {/* Modal xem hồ sơ Sổ đỏ 2 mặt đã gửi */}
      {isReviewDocModalOpen && (
        <PropertyVerificationReviewModal
          isOpen={isReviewDocModalOpen}
          onClose={() => setIsReviewDocModalOpen(false)}
          property={property}
          isAdmin={false}
        />
      )}

      {/* Modal Hồ sơ Chuyên viên tư vấn & Toàn bộ tin đăng của môi giới */}
      {isBrokerModalOpen && (
        <BrokerProfileModal
          isOpen={isBrokerModalOpen}
          onClose={() => setIsBrokerModalOpen(false)}
          author={safeAuthor}
          property={property}
        />
      )}
    </div>
  );
}
