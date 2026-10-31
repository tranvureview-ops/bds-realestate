'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter } from '../router/RouterContext';
import Link from 'next/link';
import { PROPERTY_TYPES, VIP_PACKAGES, MEMBERSHIP_PACKAGES } from '../data/mockData';
import ListingTierSelector, { LISTING_RATES, getEffectiveListingRates } from './ListingTierSelector';
import CustomSelect from './CustomSelect';
import ListingCard from './ListingCard';
import ListingLocationMap from './ListingLocationMap';
import { VIETNAM_ADMINISTRATIVE_DATA as LOCATIONS, findDanangMerger } from '../data/vietnamAdministrativeData';
import { formatPhoneNumber, normalizePhone } from '../utils/authValidation';
import { sanitizePhoneFromText, hasPhoneNumber } from '../utils/textSanitizer';
import { isVoucherDiscountFree, getStandardPackageSavePercent, getPremiumPackageSavePercent } from '../utils/membershipHelper';

// Danh sách các khung giờ vàng đẩy tin tự động với mô tả chi tiết
const BUMP_GOLDEN_HOURS_OPTIONS = [
  { 
    id: '08:00', 
    time: '08:00', 
    period: 'Sáng', 
    title: 'Khung Giờ Vàng Sáng (08:00)', 
    desc: 'Đón khách tìm kiếm BĐS đầu ngày, tỷ lệ tương tác cao',
    icon: 'fa-regular fa-sun text-amber-500'
  },
  { 
    id: '11:30', 
    time: '11:30', 
    period: 'Trưa', 
    title: 'Khung Giờ Vàng Trưa (11:30)', 
    desc: 'Giờ nghỉ trưa cao điểm khách lướt tin & tìm kiếm nhà đất',
    icon: 'fa-solid fa-cloud-sun text-orange-500'
  },
  { 
    id: '14:00', 
    time: '14:00', 
    period: 'Chiều', 
    title: 'Khung Giờ Vàng Chiều (14:00)', 
    desc: 'Đầu giờ làm việc chiều, môi giới & khách hàng liên hệ giao dịch',
    icon: 'fa-regular fa-clock text-blue-500'
  },
  { 
    id: '19:30', 
    time: '19:30', 
    period: 'Tối', 
    title: 'Khung Giờ Vàng Tối (19:30)', 
    desc: 'Khung giờ vàng đông khách truy cập nhất trong ngày (Cao điểm nhất)',
    icon: 'fa-regular fa-moon text-indigo-500'
  }
];

// Hàm phát âm thanh thành công khi Webhook/Polling khớp thanh toán (Web Audio API)
function playPaymentSuccessSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
    });
  } catch {
    // browser policy fallback
  }
}

// Gợi ý dự án tiêu biểu tại Đà Nẵng
const MOCK_PROJECTS = {
  'Đà Nẵng': [
    'The Filmore Đà Nẵng (Bạch Đằng)',
    'Sun Cosmo Residence Đà Nẵng',
    'Sun Ponte Residence (Cầu Rồng)',
    'Wyndham Soleil Danang',
    'The Sang Residence',
    'Khu đô thị Nam Hòa Xuân (Sun Group)',
    'Khu đô thị FPT City Đà Nẵng',
    'Chung cư Monarchy Đà Nẵng',
    'Hiyori Garden Tower',
    'Risemount Apartment Đà Nẵng',
    'Chung cư FPT Plaza 1 & 2'
  ]
};

// Mẫu nội dung mô tả chuẩn SEO & AloNhaDat
const DESCRIPTION_TEMPLATES = {
  apartment: `Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:
- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.
- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.
- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.
- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.
- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.
- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.`,
  house: `Bán nhà phố xây mới tâm huyết, ngõ thông ô tô tránh đỗ cửa:
- Diện tích: 65m2 x 5 tầng, mặt tiền rộng 5.2m vuông vắn không lỗi phong thủy.
- Đường trước nhà rộng 7.5m trải nhựa, 2 ô tô tránh nhau thoải mái, ô tô 7 chỗ vào thẳng gara trong nhà.
- Công năng thiết kế thông minh:
  + Tầng 1: Gara ô tô, phòng khách phụ, WC.
  + Tầng 2: Phòng khách lớn sang trọng, bếp ăn hiện đại full tủ bếp.
  + Tầng 3, 4: Mỗi tầng 2 phòng ngủ rộng khép kín, ban công thoáng sáng.
  + Tầng 5: Phòng thờ tôn nghiêm, sân phơi giặt đồ, vườn tiểu cảnh BBQ.
- Vị trí đắc địa: Gần trường học liên cấp, chợ dân sinh, bệnh viện, ga metro chỉ 300m.
- Pháp lý: Sổ đỏ chính chủ, sẵn sàng giao dịch ngay.`,
  rent: `Cho thuê căn hộ/nhà mặt phố mới đẹp, tiện kinh doanh hoặc ở gia đình:
- Diện tích: 85m2, mặt tiền rộng, vỉa hè rộng đỗ xe thoải mái.
- Đã trang bị đầy đủ nội thất cao cấp, khách thuê chỉ việc xách vali vào ở.
- Vị trí trung tâm sầm uất, an ninh đảm bảo, giao thông thuận tiện kết nối.
- Giá thuê hợp lý, hợp đồng dài hạn, thanh toán linh hoạt theo kỳ 3 - 6 tháng.`
};

// Hàm chuyển đổi số tiền thành chữ Tiếng Việt
function formatPriceToVietnameseText(num, isRent = false) {
  if (!num || num <= 0) return 'Thỏa thuận';
  let text = '';
  if (num >= 1000000000) {
    const ty = Math.floor(num / 1000000000);
    const trieu = Math.round((num % 1000000000) / 1000000);
    const tyText = ty >= 1000 ? ty.toLocaleString('vi-VN') : ty;
    text = trieu > 0 ? `${tyText} tỷ ${trieu} triệu` : `${tyText} tỷ`;
  } else if (num >= 1000000) {
    const trieu = Math.round(num / 1000000);
    text = `${trieu} triệu`;
  } else if (num >= 1000) {
    const nghin = +(num / 1000).toFixed(2);
    text = `${nghin.toString().replace('.', ',')} nghìn`;
  } else {
    text = `${num.toLocaleString('vi-VN')} đ`;
  }
  return isRent ? `${text}/tháng` : text;
}

// Hàm định dạng số tiền thành chữ tóm tắt
export function formatSummaryPrice(num, isRent = false, isPerM2 = false) {
  if (!num || num <= 0) return 'Thỏa thuận';
  let text = '';
  if (num >= 1e9) {
    const val = +(num / 1e9).toFixed(3);
    const valText = val >= 1000 ? val.toLocaleString('vi-VN') : val.toString().replace('.', ',');
    text = `${valText} tỷ`;
  } else if (num >= 1e6) {
    const val = +(num / 1e6).toFixed(3);
    text = `${val.toString().replace('.', ',')} triệu`;
  } else if (num >= 1e3) {
    const val = +(num / 1e3).toFixed(2);
    text = `${val.toString().replace('.', ',')} nghìn`;
  } else {
    text = `${num.toLocaleString('vi-VN')} đ`;
  }

  if (isPerM2) {
    return isRent ? `${text}/m²/tháng` : `${text}/m²`;
  }
  return isRent ? `${text}/tháng` : text;
}

// Hàm sinh các mốc giá gợi ý chuẩn xác theo bội số 10 dựa trên chữ số người dùng đang nhập
export function getPriceSuggestions(rawInput, isRent = false, isPerM2 = false) {
  const digits = String(rawInput || '').replace(/\D/g, '');
  if (!digits) return [];
  const num = parseInt(digits, 10);
  if (!num || num <= 0) return [];

  let minVal = 10_000_000;
  let maxVal = 2_000_000_000_000; // Hỗ trợ tới 2.000 tỷ

  if (isPerM2) {
    minVal = isRent ? 10_000 : 1_000_000;
    maxVal = isRent ? 50_000_000 : 500_000_000;
  } else if (isRent) {
    minVal = 1_000_000;
    maxVal = 2_000_000_000; // Hỗ trợ tới 2 tỷ/tháng (bao gồm 500 triệu)
  }

  const candidates = [];
  for (let p = -5; p <= 12; p++) {
    const val = Math.round(num * Math.pow(10, p));
    if (val >= minVal && val <= maxVal) {
      if (!candidates.includes(val)) {
        candidates.push(val);
      }
    }
  }

  candidates.sort((a, b) => a - b);
  let selected = candidates;
  if (candidates.length > 5) {
    const idx = candidates.findIndex(c => c >= num);
    const start = Math.max(0, Math.min(candidates.length - 5, (idx > 1 ? idx - 2 : 0)));
    selected = candidates.slice(start, start + 5);
  }

  return selected.map(val => {
    let label = '';
    if (val >= 1e9) {
      const v = +(val / 1e9).toFixed(3);
      const vText = v >= 1000 ? v.toLocaleString('vi-VN') : v.toString().replace('.', ',');
      label = `${vText} tỷ`;
    } else if (val >= 1e6) {
      const v = +(val / 1e6).toFixed(3);
      label = `${v.toString().replace('.', ',')} triệu`;
    } else if (val >= 1e3) {
      const v = +(val / 1e3).toFixed(2);
      label = `${v.toString().replace('.', ',')} nghìn`;
    } else {
      label = `${val.toLocaleString('vi-VN')} đ`;
    }

    if (isPerM2) {
      label += isRent ? ' / m² / tháng' : ' / m²';
    } else if (isRent) {
      label += ' / tháng';
    }

    return {
      value: val,
      label
    };
  });
}

export default function PostListingModal({ onClose, isEmbedded = false }) {
  const { 
    currentUser, 
    properties, 
    addProperty, 
    showToast, 
    preselectedListingType, 
    setPreselectedListingType, 
    paymentConfig, 
    systemConfig,
    navigateToProperty,
    isMembershipActive,
    membershipPackages,
    vipPackages,
    checkDailyFreeListingQuota,
    dailyFreeListingLimit,
    bumpServicePrice,
    BUMP_SERVICE_PRICE: contextBumpPrice
  } = useRealEstate();
  const { navigate } = useRouter();

  const effectiveBumpPrice = Number(bumpServicePrice) || Number(contextBumpPrice) || 10000;
  const standardSavePercent = useMemo(() => getStandardPackageSavePercent(membershipPackages), [membershipPackages]);
  const premiumSavePercent = useMemo(() => getPremiumPackageSavePercent(membershipPackages), [membershipPackages]);

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
  const isMemberActive = isMembershipActive ? isMembershipActive(currentUser) : Boolean(
    currentUser?.membership && 
    currentUser.membership.status === 'active' && 
    (!currentUser.membership.expiresAt || new Date(currentUser.membership.expiresAt).getTime() > Date.now())
  );
  const isMemberExpired = Boolean(currentUser?.membership && !isMemberActive);
  const memberPackageObj = (membershipPackages || []).find(p => p.id === currentUser?.membership?.packageId);
  const normalPkg = (vipPackages || []).find(p => p.id === 'normal');
  const defaultNormalPrice = Number(normalPkg?.rates?.[60] !== undefined ? normalPkg.rates[60] : (normalPkg?.publishPrice ?? 0));
  const normalPublishVoucherDiscount = memberPackageObj?.vouchersPerCycle?.normalPublishDiscount || (membershipPackages?.[0]?.vouchersPerCycle?.normalPublishDiscount ?? defaultNormalPrice);
  const vipVoucherDiscount = memberPackageObj?.vouchersPerCycle?.vipDiscount || (membershipPackages || []).find(p => Number(p.vouchersPerCycle?.vipDiscount || 0) > 0)?.vouchersPerCycle?.vipDiscount || 400000;

  const [step, setStep] = useState(1); // 1: Vị trí, 2: Bài viết & Kỹ thuật, 3: Hình ảnh & VR, 4: Loại Tin & Lịch đăng
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [publishedProperty, setPublishedProperty] = useState(null);

  // Auto-Polling & Webhook Payment State
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [paymentPollingState, setPaymentPollingState] = useState('waiting'); // 'waiting' | 'verifying' | 'success' | 'expired'
  const [pollingCount, setPollingCount] = useState(0);
  const [checkoutCountdown, setCheckoutCountdown] = useState(600); // 10:00 (seconds)
  const [autoDemoTimer, setAutoDemoTimer] = useState(8); // 8s demo auto-trigger
  const [autoDemoEnabled, setAutoDemoEnabled] = useState(true);
  const [isTriggeringWebhook, setIsTriggeringWebhook] = useState(false);

  // Form State đầy đủ theo chuẩn chuyên nghiệp & AloNhaDat
  const [formData, setFormData] = useState({
    // 1. Phân loại giao dịch & Vị trí địa lý
    demand: 'sale', // 'sale' (Cần bán), 'rent' (Cho thuê)
    propertyType: 'apartment',
    propertyTypeName: 'Căn hộ chung cư',
    city: '',
    district: '',
    ward: '',
    street: '',
    project: '',
    detailedAddress: '',
    addressDisplay: '',
    selectedAddressType: '', // Mặc định để trống - Chỉ yêu cầu người dùng bấm chọn Địa chỉ mới
    newAddress: '',
    google_place_id: null,
    lat: null,
    lng: null,
    
    // 2. Thông tin bài viết
    title: '',
    description: '',
    
    // 3. Thông số kỹ thuật & Định giá
    priceType: 'total', // 'total' (Tổng giá), 'm2' (Theo m²), 'deal' (Thỏa thuận)
    price: '',
    priceDisplay: '',
    pricePerM2: '',
    area: '',
    facade: '', // Mặt tiền (m)
    entranceRoad: '', // Đường vào / Lộ giới (m)
    roadType: 'car_pass', // 'truck', 'car_pass', 'car_in', 'bike'
    bedroom: '',
    bathroom: '',
    floor: '',
    direction: '',
    balconyDirection: '',
    legal: '',
    furniture: '',
    
    // 4. Hình ảnh & VR 360
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    coverImageIndex: 0,
    videoUrl: '',
    hasVR360: false,
    
    // 5. Liên hệ người đăng (Khách vãng lai hoặc Thành viên)
    contactName: (!isGuest && currentUser?.name) ? currentUser.name : '',
    contactPhone: (!isGuest && currentUser?.phone) ? formatPhoneNumber(currentUser.phone) : '',
    contactEmail: (!isGuest && currentUser?.email) ? currentUser.email : '',
    contactAddress: (!isGuest && currentUser?.address) ? currentUser.address : ''
  });

  // Voucher discount calculation
  const hasNormalVoucher = (currentUser?.vouchers?.normalPublish || 0) > 0;
  const hasVipVoucher = (currentUser?.vouchers?.vipPublish || 0) > 0;

  // Listing Type & Billing state - Luôn mặc định là Tin Thường ('normal')
  const defaultListingType = preselectedListingType || 'normal';
  const [selectedVipId, setSelectedVipId] = useState(defaultListingType);
  const [listingDays, setListingDays] = useState(defaultListingType === 'normal' ? 60 : 7);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleTime, setScheduleTime] = useState('now');
  const [autoBumpHours, setAutoBumpHours] = useState([]); // Đẩy tin khung giờ vàng (mặc định rỗng)
  const [autoBumpDays, setAutoBumpDays] = useState(1); // Mặc định 1 ngày khi chọn mốc hẹn giờ đẩy tin
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('00');
  const [isBumpDropdownOpen, setIsBumpDropdownOpen] = useState(false);
  const bumpDropdownRef = useRef(null);

  // Click outside listener đóng dropdown đẩy tin tự động
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bumpDropdownRef.current && !bumpDropdownRef.current.contains(event.target)) {
        setIsBumpDropdownOpen(false);
      }
    };
    if (isBumpDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBumpDropdownOpen]);

  // Thêm mốc giờ & phút tùy chỉnh
  const handleAddCustomTime = () => {
    const timeStr = `${String(customHour).padStart(2, '0')}:${String(customMinute).padStart(2, '0')}`;
    if (autoBumpHours.includes(timeStr)) {
      showToast(`Khung giờ ${timeStr} đã có trong danh sách!`, 'warning');
      return;
    }
    setAutoBumpHours(prev => [...prev, timeStr].sort());
    showToast(`Đã thêm mốc đẩy tin tự động lúc ${timeStr}!`, 'info');
  };

  // Image Upload State & Handlers
  const fileInputRef = useRef(null);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target?.files || []);
    if (!files.length) return;

    const currentCount = formData.images?.length || 0;
    const remainingSlots = 20 - currentCount;
    if (remainingSlots <= 0) {
      showToast('Đã đạt giới hạn tối đa 20 ảnh cho mỗi bài đăng!', 'warning');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showToast(`Chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa (tổng 20 ảnh)!`, 'info');
    }

    const newImages = [];
    let processed = 0;

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`Tệp "${file.name}" không phải là ảnh hợp lệ!`, 'warning');
        processed++;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" vượt quá dung lượng 10MB!`, 'warning');
        processed++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target.result);
        processed++;
        if (processed === filesToProcess.length) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages]
          }));
          showToast(`Đã tải lên ${newImages.length} ảnh thành công!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://', 'warning');
      return;
    }
    if ((formData.images?.length || 0) >= 20) {
      showToast('Đã đạt tối đa 20 ảnh!', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), url]
    }));
    setImageUrlInput('');
    setShowUrlInput(false);
    showToast('Đã thêm liên kết ảnh thành công!', 'success');
  };
  // Nếu chưa đăng nhập (khách vãng lai), mặc định là VietQR Ngân Hàng
  const [paymentMethod, setPaymentMethod] = useState(!isGuest ? 'wallet' : 'vietqr');
  const [appliedVoucher, setAppliedVoucher] = useState(defaultListingType === 'normal' && hasNormalVoucher ? 'normalPublish' : null);

  // Đồng bộ loại tin nếu có preselectedListingType thay đổi từ bên ngoài (hoặc mặc định 'normal' 60 ngày, VIP 7 ngày)
  useEffect(() => {
    if (preselectedListingType) {
      setSelectedVipId(preselectedListingType);
      if (preselectedListingType === 'normal') {
        setListingDays(60);
        if (hasNormalVoucher) {
          setAppliedVoucher('normalPublish');
        }
      } else {
        setListingDays(7);
      }
    } else {
      setSelectedVipId('normal');
      setListingDays(60);
    }
  }, [preselectedListingType, hasNormalVoucher]);

  // Luôn reset loại tin đã chọn trước về 'normal' khi đóng/thoát modal đăng tin
  useEffect(() => {
    return () => {
      if (setPreselectedListingType) {
        setPreselectedListingType('normal');
      }
    };
  }, [setPreselectedListingType]);

  // Locations lookup (63 Tỉnh/Thành phố)
  const currentCityObj = formData.city ? LOCATIONS.find(l => l.name === formData.city) : null;
  const districtList = currentCityObj?.districts || [];
  const currentDistrictObj = formData.district ? districtList.find(d => d.name === formData.district) : null;
  const wardList = currentDistrictObj?.wards || [];
  
  // Danh sách đường thông minh: Gộp danh mục mặc định + tự động học các con đường người dùng đã từng nhập
  const streetList = useMemo(() => {
    const baseStreets = currentDistrictObj?.streets || [];
    if (!formData.district) return baseStreets;

    const set = new Set();
    const result = [];

    // 1. Thêm các tuyến đường mặc định
    baseStreets.forEach(st => {
      const clean = st.trim();
      const lower = clean.toLowerCase();
      if (!set.has(lower)) {
        set.add(lower);
        result.push(clean);
      }
    });

    // 2. Tự động gom thêm các con đường người dùng đã từng nhập/đăng tin tại quận này
    if (Array.isArray(properties)) {
      properties.forEach(p => {
        if (p.district === formData.district && p.street && typeof p.street === 'string') {
          const raw = p.street.replace(/^(đường|phố|số\s+\d+[\w\/]*\s+)\s*/i, '').trim();
          const clean = raw.split(',')[0].trim();
          const lower = clean.toLowerCase();
          if (clean && clean.length > 1 && !set.has(lower)) {
            set.add(lower);
            result.push(clean);
          }
        }
      });
    }

    return result;
  }, [currentDistrictObj, formData.district, properties]);

  const projectList = currentDistrictObj?.projects?.length ? currentDistrictObj.projects : (formData.city ? (MOCK_PROJECTS[formData.city] || []) : []);

  // Kiểm tra hạn mức đăng tin miễn phí trong ngày (3-5 tin/ngày theo cấu hình admin)
  const dailyQuotaInfo = useMemo(() => {
    if (checkDailyFreeListingQuota) {
      return checkDailyFreeListingQuota(currentUser || { phone: formData.contactPhone });
    }
    return { allowed: true, count: 0, limit: 3, remaining: 3, unlimited: false };
  }, [checkDailyFreeListingQuota, currentUser, formData.contactPhone, properties]);

  const hasFreeNormalQuota = Boolean(dailyQuotaInfo ? (dailyQuotaInfo.unlimited || (dailyQuotaInfo.allowed && (dailyQuotaInfo.remaining === undefined || dailyQuotaInfo.remaining > 0)) || currentUser?.role === 'admin') : true);

  // Selected package details
  const activeVipPackages = (vipPackages && vipPackages.length > 0) ? vipPackages : VIP_PACKAGES;
  const defaultPkg = activeVipPackages.find(p => p.id === 'normal') || activeVipPackages[activeVipPackages.length - 1];
  const selectedPkg = activeVipPackages.find(p => p.id === selectedVipId) || defaultPkg;
  const ratesConfig = useMemo(() => getEffectiveListingRates(activeVipPackages, paymentConfig, systemConfig), [activeVipPackages, paymentConfig, systemConfig]);
  const bdsConfig = ratesConfig?.[selectedVipId] || ratesConfig?.['normal'] || LISTING_RATES['normal'];
  const isNormal60 = selectedVipId === 'normal' && listingDays === 60;
  
  const configuredNormalRate = Number(bdsConfig?.rates?.[60] !== undefined && Number(bdsConfig.rates[60]) > 0
    ? bdsConfig.rates[60]
    : (Number(bdsConfig?.publishPrice) || 5000));
  const normal60Price = (selectedVipId === 'normal' && isNormal60)
    ? (hasFreeNormalQuota ? 0 : configuredNormalRate)
    : (bdsConfig?.rates?.[60] !== undefined ? Number(bdsConfig.rates[60]) : 0);

  const dailyRate = isNormal60
    ? Math.round(normal60Price / 60)
    : (bdsConfig?.rates?.[listingDays] ?? bdsConfig?.rates?.[15] ?? bdsConfig?.pricePerDay ?? 0);
  const bumpDays = Math.max(1, Math.min(Number(autoBumpDays) || 1, listingDays || 1));
  const autoBumpFee = autoBumpHours.length * effectiveBumpPrice * bumpDays;
  const listingCost = isNormal60 ? normal60Price : (dailyRate * listingDays);
  const totalCost = listingCost + autoBumpFee;

  // Smart selection handler with auto voucher recommendation
  const handleSelectPackage = (pkgId) => {
    setSelectedVipId(pkgId);
    if (pkgId === 'normal') {
      setListingDays(60); // Mặc định hiển thị 60 ngày cho Tin Thường
      if (hasNormalVoucher) {
        setAppliedVoucher('normalPublish');
        showToast('Đã tự động áp dụng Voucher Hội Viên: Đăng Tin Thường chỉ 0 đ!', 'success');
      } else {
        setAppliedVoucher(null);
      }
    } else {
      setListingDays(7); // Mặc định chọn 7 ngày cho VIP Kim Cương, Vàng, Bạc
      if (appliedVoucher === 'normalPublish') {
        setAppliedVoucher(null);
      }
    }
  };

  const voucherDiscount = useMemo(() => {
    let discount = 0;
    if (appliedVoucher === 'normalPublish' && hasNormalVoucher) {
      discount += Math.min(listingCost, normalPublishVoucherDiscount);
    }
    if (appliedVoucher === 'vipPublish' && hasVipVoucher && selectedVipId !== 'normal') {
      discount += Math.min(listingCost, vipVoucherDiscount);
    }
    return Math.min(totalCost, discount);
  }, [appliedVoucher, hasNormalVoucher, hasVipVoucher, totalCost, listingCost, selectedVipId, normalPublishVoucherDiscount, vipVoucherDiscount]);
  const finalCost = Math.max(0, totalCost - voucherDiscount);

  // Tính toán và định dạng giá theo Nhu cầu (Bán / Thuê)
  const updatePriceCalculations = (newPrice, newPriceType, currentArea, currentDemand = formData.demand) => {
    const isRentMode = currentDemand === 'rent';
    let pDisplay = '';
    let pPerM2 = '';

    if (newPriceType === 'deal') {
      pDisplay = 'Thỏa thuận';
      pPerM2 = 'Thỏa thuận';
    } else {
      const numPrice = Number(newPrice);
      const numArea = Number(currentArea);

      if (newPrice !== '' && !isNaN(numPrice) && numPrice > 0) {
        if (newPriceType === 'm2') {
          const perM2Text = (numPrice >= 1e6 ? (numPrice / 1e6).toFixed(1) + ' tr' : Math.round(numPrice / 1000) + 'k') + '/m²';
          pPerM2 = isRentMode ? `${perM2Text}/tháng` : perM2Text;
          if (numArea > 0) {
            const totalPrice = numPrice * numArea;
            pDisplay = formatPriceToVietnameseText(totalPrice, isRentMode);
          } else {
            pDisplay = pPerM2;
          }
        } else {
          // Total price
          pDisplay = formatPriceToVietnameseText(numPrice, isRentMode);
          if (numArea > 0) {
            const m2Val = numPrice / numArea;
            const perM2 = (m2Val >= 1e6 ? (m2Val / 1e6).toFixed(1) + ' tr' : Math.round(m2Val / 1000) + 'k') + '/m²';
            pPerM2 = isRentMode ? `${perM2}/tháng` : perM2;
          }
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      demand: currentDemand,
      price: newPriceType === 'deal' ? '' : newPrice,
      priceType: newPriceType,
      priceDisplay: pDisplay,
      pricePerM2: pPerM2
    }));
  };

  const isRent = formData.demand === 'rent';
  const isPerM2 = formData.priceType === 'm2';
  const priceSuggestions = useMemo(() => {
    if (formData.priceType === 'deal') return [];
    return getPriceSuggestions(formData.price, isRent, isPerM2);
  }, [formData.price, formData.priceType, isRent, isPerM2]);

  const formatInputValue = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString('vi-VN');
  };

  const handlePriceInputChange = (e) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '');
    if (cleanDigits === '') {
      updatePriceCalculations('', formData.priceType, formData.area, formData.demand);
      return;
    }
    const num = parseInt(cleanDigits, 10);
    updatePriceCalculations(num, formData.priceType, formData.area, formData.demand);
  };

  // Tự động quét và loại bỏ số điện thoại khỏi Tiêu đề khi blur hoặc paste
  const handleTitleBlur = () => {
    if (systemConfig?.autoFilterPhoneInContent !== false && formData.title) {
      const res = sanitizePhoneFromText(formData.title);
      if (res.hasPhone) {
        setFormData(prev => ({ ...prev, title: res.text }));
        showToast(`🛡️ Đã tự động lọc số điện thoại (${res.removedPhones.join(', ')}) khỏi Tiêu đề tin đăng!`, 'info');
      }
    }
  };

  const handleTitlePaste = (e) => {
    if (systemConfig?.autoFilterPhoneInContent !== false) {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted && hasPhoneNumber(pasted)) {
        setTimeout(() => {
          setFormData(prev => {
            const res = sanitizePhoneFromText(prev.title);
            if (res.hasPhone) {
              showToast(`🛡️ Đã tự động lọc số điện thoại khỏi Tiêu đề tin đăng!`, 'info');
              return { ...prev, title: res.text };
            }
            return prev;
          });
        }, 50);
      }
    }
  };

  // Tự động quét và loại bỏ số điện thoại khỏi Mô tả khi blur hoặc paste
  const handleDescriptionBlur = () => {
    if (systemConfig?.autoFilterPhoneInContent !== false && formData.description) {
      const res = sanitizePhoneFromText(formData.description);
      if (res.hasPhone) {
        setFormData(prev => ({ ...prev, description: res.text }));
        showToast(`🛡️ Đã tự động lọc số điện thoại (${res.removedPhones.join(', ')}) khỏi Mô tả chi tiết!`, 'info');
      }
    }
  };

  const handleDescriptionPaste = (e) => {
    if (systemConfig?.autoFilterPhoneInContent !== false) {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted && hasPhoneNumber(pasted)) {
        setTimeout(() => {
          setFormData(prev => {
            const res = sanitizePhoneFromText(prev.description);
            if (res.hasPhone) {
              showToast(`🛡️ Đã tự động lọc số điện thoại khỏi Mô tả chi tiết!`, 'info');
              return { ...prev, description: res.text };
            }
            return prev;
          });
        }, 50);
      }
    }
  };

  // Đổi thành phố -> tự động reset toàn bộ thông tin cấp dưới và trạng thái sáp nhập
  const handleCityChange = (cityName) => {
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: '',
      ward: '',
      street: '',
      project: '',
      selectedAddressType: '',
      isAdministrativeMerged: false,
      newAddress: '',
      google_place_id: null,
      lat: null,
      lng: null
    }));
  };

  // Đổi quận -> tự động reset phường, đường, dự án và trạng thái sáp nhập
  const handleDistrictChange = (districtName) => {
    setFormData(prev => ({
      ...prev,
      district: districtName,
      ward: '',
      street: '',
      project: '',
      selectedAddressType: '',
      isAdministrativeMerged: false,
      newAddress: '',
      google_place_id: null,
      lat: null,
      lng: null
    }));
  };

  // Trạng thái Google Maps Geocoding & Places API theo thời gian thực
  const [googleGeocodeInfo, setGoogleGeocodeInfo] = useState(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  // Tự động phân giải địa chỉ qua Google Maps Geocoding khi người dùng chọn 3 trường CŨ và/hoặc nhập tên đường
  useEffect(() => {
    if (!formData.city || !formData.district || !formData.ward) {
      setGoogleGeocodeInfo(null);
      return;
    }

    // Nếu người dùng đang gõ tên đường thì debounce 300ms, nếu chỉ chọn dropdown thì đồng bộ nhanh trong 50ms
    const isTypingStreet = Boolean(formData.street && formData.street.length > 2);
    const delay = isTypingStreet ? 300 : 50;

    const timer = setTimeout(async () => {
      setIsGeocodingLoading(true);

      try {
        const res = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tinhThanh: formData.city,
            quanHuyen: formData.district,
            phuongXa: formData.ward,
            duongSoNha: formData.street
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setGoogleGeocodeInfo(data);
            setFormData(prev => {
              const computedNewAddr = [prev.street, data.newWard, data.newCity].filter(Boolean).join(', ');
              return {
                ...prev,
                lat: data.lat || prev.lat,
                lng: data.lng || prev.lng,
                google_place_id: data.google_place_id || prev.google_place_id,
                ...(data.isMerged && data.newWard ? {
                  isAdministrativeMerged: true,
                  newAddress: prev.newAddress || computedNewAddr
                } : {})
              };
            });
          }
        }
      } catch (err) {
        console.warn('Lỗi gọi Google Maps Geocoding:', err);
      } finally {
        setIsGeocodingLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [formData.city, formData.district, formData.ward, formData.street]);

  // Nhận diện sáp nhập đơn vị hành chính: TỨC THÌ 0ms qua từ điển nội bộ & đồng bộ làm giàu qua Google Maps API
  // Giúp khối 'Địa chỉ hiển thị trên tin đăng' xuất hiện đồng bộ tức thì cùng lúc với bản đồ Map
  const mergerInfo = useMemo(() => {
    // 1. Phân giải tức thì (0ms) từ từ điển sáp nhập Đà Nẵng
    const localMerger = findDanangMerger(formData.ward);

    if (googleGeocodeInfo?.isMerged && googleGeocodeInfo?.newWard) {
      return {
        hasMerger: true,
        oldWard: formData.ward,
        newWard: googleGeocodeInfo.newWard,
        newDistrict: googleGeocodeInfo.newDistrict || localMerger?.newDistrict || formData.district,
        newCity: googleGeocodeInfo.newCity || formData.city,
        lat: googleGeocodeInfo.lat || localMerger?.lat,
        lng: googleGeocodeInfo.lng || localMerger?.lng,
        google_place_id: googleGeocodeInfo.google_place_id || localMerger?.placeId,
        resolution: 'Đơn vị hành chính mới đã cập nhật trên bản đồ Google Maps'
      };
    }

    if (localMerger) {
      return {
        hasMerger: true,
        oldWard: formData.ward,
        newWard: localMerger.newWard,
        newDistrict: localMerger.newDistrict || formData.district,
        newCity: formData.city || 'Đà Nẵng',
        lat: localMerger.lat,
        lng: localMerger.lng,
        google_place_id: localMerger.placeId,
        resolution: 'Đơn vị hành chính mới đã cập nhật trên bản đồ Google Maps'
      };
    }

    return null;
  }, [googleGeocodeInfo, formData.ward, formData.district, formData.city]);

  // Kiểm tra người dùng đã chọn xong 3 trường bắt buộc: Tỉnh/Thành phố *, Quận/Huyện *, Phường/Xã *
  const hasSelectedFullLocation = Boolean(formData.city && formData.district && formData.ward);

  // Chuẩn bị chuỗi địa chỉ hiển thị đối chiếu cũ/mới chuẩn xác theo form (không dùng dữ liệu mẫu mặc định)
  const displayStreetPart = formData.street
    ? (formData.street.toLowerCase().startsWith('đường') || formData.street.toLowerCase().startsWith('phố') ? formData.street : `Đường ${formData.street}`)
    : '';
  const displayWard = formData.ward || '';
  const displayDistrict = formData.district || '';
  const displayCity = formData.city || '';
  const currentOldAddress = [displayStreetPart, displayWard, displayDistrict, displayCity].filter(Boolean).join(', ');

  const suggestedWard = mergerInfo?.newWard || '';
  const suggestedCity = mergerInfo?.newCity || displayCity;
  // Địa chỉ mới tại Đà Nẵng đã bỏ cấp quận theo mô hình chính quyền đô thị mới
  const computedSuggestedNewAddress = mergerInfo
    ? [displayStreetPart, suggestedWard, suggestedCity].filter(Boolean).join(', ')
    : '';

  // Tự động ghép địa chỉ hiển thị
  const computedFullAddress = useMemo(() => {
    if (formData.selectedAddressType === 'new' && (formData.newAddress || computedSuggestedNewAddress)) {
      return formData.newAddress || computedSuggestedNewAddress;
    }
    const parts = [
      formData.detailedAddress?.trim(),
      formData.street ? `Đường ${formData.street.replace(/^(đường|phố)\s+/i, '')}` : '',
      formData.project ? `(Dự án: ${formData.project})` : '',
      formData.ward ? (formData.ward.startsWith('Phường') || formData.ward.startsWith('Xã') || formData.ward.startsWith('Thị trấn') ? formData.ward : `Phường ${formData.ward}`) : '',
      formData.district,
      formData.city
    ].filter(Boolean);
    return parts.join(', ');
  }, [formData.detailedAddress, formData.street, formData.project, formData.ward, formData.district, formData.city, formData.selectedAddressType, formData.newAddress, computedSuggestedNewAddress]);

  // Trạng thái Xem Trước Tin Đăng
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState('detail'); // 'detail' | 'card'
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  // Tạo đối tượng BĐS hoàn chỉnh để xem trước giao diện thực tế
  const previewProperty = useMemo(() => {
    const isGuestUser = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';
    const contactPhone = formatPhoneNumber(String(formData.contactPhone || currentUser?.phone || '').trim());
    const contactName = String(formData.contactName || (!isGuestUser && currentUser?.name) || 'Người đăng tin').trim();

    const safeAuthor = (!isGuestUser && currentUser) ? {
      id: currentUser.id,
      name: currentUser.name || contactName,
      title: currentUser.membership ? `${currentUser.membership.packageName}` : (currentUser.role === 'broker' ? 'Môi Giới' : 'Chính chủ'),
      phone: formatPhoneNumber(currentUser.phone || contactPhone),
      zalo: normalizePhone(currentUser.phone || contactPhone),
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isVerified: currentUser.isVerified || false,
      rating: 5.0,
      reviewCount: 1,
      isGuest: false,
      authorType: 'member'
    } : {
      id: 'guest-preview',
      name: contactName,
      title: 'Khách vãng lai (Chưa đăng nhập)',
      phone: contactPhone,
      zalo: normalizePhone(contactPhone),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
      isGuest: true,
      authorType: 'guest'
    };

    const images = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

    const defaultPkg = activeVipPackages.find(p => p.id === 'normal') || activeVipPackages[activeVipPackages.length - 1];
    const currentVipPkg = activeVipPackages.find(p => p.id === selectedVipId) || defaultPkg;

    const typeObj = PROPERTY_TYPES?.find(t => t.id === formData.type);
    const typeName = typeObj?.name || (formData.type === 'apartment' ? 'Căn hộ chung cư' : formData.type === 'house' ? 'Nhà riêng / Nhà phố' : 'Bất động sản');

    return {
      id: 'BDS-PREVIEW',
      title: formData.title?.trim() || 'Căn hộ cao cấp view thoáng mát, thiết kế hiện đại sang trọng',
      description: formData.description?.trim() || 'Chính chủ cần bán gấp căn hộ thiết kế hiện đại, đầy đủ tiện nghi cao cấp, pháp lý minh bạch sổ hồng trao tay.',
      price: Number(formData.price) || 0,
      priceDisplay: formData.priceDisplay || (formData.priceType === 'deal' ? 'Thỏa thuận' : ''),
      pricePerM2: formData.pricePerM2 || (formData.priceType === 'deal' ? 'Thỏa thuận' : ''),
      priceType: formData.priceType || 'total',
      priceUnit: formData.priceType === 'deal' 
        ? 'Thỏa thuận' 
        : (formData.priceType === 'm2' 
            ? (formData.demand === 'rent' ? 'tr/m²/tháng' : 'tr/m²') 
            : (formData.demand === 'rent' ? (Number(formData.price) >= 1e9 ? 'tỷ/tháng' : 'tr/tháng') : (Number(formData.price) >= 1e9 ? 'tỷ' : 'triệu'))),
      area: Number(formData.area) || 0,
      bedrooms: Number(formData.bedroom ?? formData.bedrooms) || 0,
      bathrooms: Number(formData.bathroom ?? formData.bathrooms) || 0,
      direction: formData.direction || '',
      balconyDirection: formData.balconyDirection || '',
      floor: formData.floor || '',
      juridical: formData.legal || formData.juridical || '',
      interior: formData.furniture || formData.interior || '',
      type: formData.type || formData.propertyType || 'apartment',
      typeName: typeName,
      category: formData.demand || formData.category || 'sale',
      status: 'active',
      location: {
        province: formData.city || '',
        district: formData.district || '',
        ward: formData.ward || '',
        street: formData.street || '',
        project: formData.project || '',
        fullAddress: computedFullAddress || 'Chưa cập nhật địa chỉ'
      },
      address: computedFullAddress || 'Chưa cập nhật địa chỉ',
      images: images,
      vr360Tour: formData.vr360Tour || null,
      hasVR360: Boolean(formData.vr360Tour),
      videoUrl: formData.videoUrl || null,
      amenities: formData.amenities?.length ? formData.amenities : ['Bể bơi 4 mùa', 'Phòng Gym', 'Thang máy thẻ từ', 'An ninh 24/7', 'Bãi đỗ ô tô thông minh', 'Sổ hồng sẵn sàng'],
      vipPackageId: selectedVipId || 'normal',
      vipPackage: currentVipPkg,
      publishedAt: new Date().toISOString(),
      author: safeAuthor,
      isFeatured: selectedVipId === 'vip-diamond',
      hasDualListing: false,
      viewsCount: 1,
      listingDays: listingDays || 15
    };
  }, [formData, selectedVipId, currentUser, computedFullAddress, listingDays]);

  // Validation chuyển bước
  const handleNext = () => {
    if (step === 1) {
      if (!formData.city) {
        showToast('Vui lòng chọn Tỉnh / Thành phố', 'warning');
        return;
      }
      if (!formData.district) {
        showToast('Vui lòng chọn Quận / Huyện', 'warning');
        return;
      }
      if (!formData.ward) {
        showToast('Vui lòng chọn Phường / Xã', 'warning');
        return;
      }
      if (!formData.street || !formData.street.trim()) {
        showToast('Vui lòng nhập Tên đường / Số nhà hoặc Địa chỉ cụ thể', 'warning');
        return;
      }
      if (mergerInfo && formData.selectedAddressType !== 'new') {
        // Chặn chuyển bước nếu chưa chọn địa chỉ mới, không hiển thị thông báo toast theo yêu cầu
        return;
      }
    }
    if (step === 2) {
      // Tự động quét và loại bỏ số điện thoại khỏi Tiêu đề & Mô tả nếu được cấu hình
      if (systemConfig?.autoFilterPhoneInContent !== false) {
        let cleanTitle = formData.title || '';
        let cleanDesc = formData.description || '';
        const titleRes = sanitizePhoneFromText(cleanTitle);
        const descRes = sanitizePhoneFromText(cleanDesc);
        if (titleRes.hasPhone || descRes.hasPhone) {
          cleanTitle = titleRes.text;
          cleanDesc = descRes.text;
          formData.title = cleanTitle;
          formData.description = cleanDesc;
          setFormData(prev => ({ ...prev, title: cleanTitle, description: cleanDesc }));
          showToast('🛡️ Đã tự động lọc sạch số điện thoại khỏi Tiêu đề & Mô tả theo quy định sàn!', 'info');
        }
      }

      if (!formData.title || formData.title.length < 30) {
        showToast('Tiêu đề cần tối thiểu 30 ký tự để thu hút khách!', 'warning');
        return;
      }
      if (formData.title.length > 99) {
        showToast('Tiêu đề không được vượt quá 99 ký tự!', 'warning');
        return;
      }
      if (!formData.description || formData.description.length < 50) {
        showToast('Mô tả bất động sản cần tối thiểu 50 ký tự (khuyên dùng mẫu có sẵn)', 'warning');
        return;
      }
      if (formData.priceType !== 'deal' && (!formData.price || formData.price <= 0)) {
        showToast('Vui lòng nhập mức giá hợp lệ hoặc chọn Thỏa thuận', 'warning');
        return;
      }
      if (!formData.area || formData.area <= 0) {
        showToast('Vui lòng nhập diện tích sử dụng lớn hơn 0', 'warning');
        return;
      }
    }
    if (step === 3) {
      if (formData.images.length === 0) {
        showToast('Hệ thống yêu cầu tối thiểu 1 hình ảnh thật của bất động sản', 'warning');
        return;
      }
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  // Sao chép nội dung vào Clipboard
  const copyToClipboard = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}: ${text}`, 'info');
    } catch {
      showToast(`Sao chép thất bại`, 'warning');
    }
  };

  // Xác nhận chuyển khoản và xuất bản tin
  const handleConfirmPaymentAndPublish = async (customOrderId = null) => {
    const orderId = customOrderId || checkoutOrderId || `TXN-${Math.floor(1000 + Math.random() * 9000)}`;

    // Xác định địa chỉ để geocode: ưu tiên địa chỉ mới sau sáp nhập
    const targetAddress = (formData.selectedAddressType === 'new' && (formData.newAddress || computedSuggestedNewAddress))
      ? (formData.newAddress || computedSuggestedNewAddress)
      : computedFullAddress;

    let finalPlaceId = formData.google_place_id || googleGeocodeInfo?.google_place_id || mergerInfo?.google_place_id || null;
    let finalLat = formData.lat || googleGeocodeInfo?.lat || mergerInfo?.lat;
    let finalLng = formData.lng || googleGeocodeInfo?.lng || mergerInfo?.lng;

    // Tự động gọi Google Maps Geocoding API dựa trên địa chỉ mới để lấy và lưu thêm thông tin google_place_id
    if (!finalPlaceId) {
      try {
        const geoRes = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: targetAddress,
            tinhThanh: formData.city,
            quanHuyen: formData.district,
            phuongXa: formData.ward,
            duongSoNha: formData.street
          })
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.google_place_id) {
            finalPlaceId = geoData.google_place_id;
          }
          if (geoData.lat && geoData.lng) {
            finalLat = Number(geoData.lat);
            finalLng = Number(geoData.lng);
          }
        }
      } catch (err) {
        console.warn('Lỗi gọi Google Maps Geocoding API khi đăng tin:', err);
      }
    }

    if (!finalPlaceId) {
      finalPlaceId = googleGeocodeInfo?.google_place_id || mergerInfo?.google_place_id || `ChIJ_${Math.random().toString(36).substring(2, 15)}`;
    }

    const isNewAddrSelected = formData.selectedAddressType === 'new';
    const payload = {
      ...formData,
      ward: isNewAddrSelected && mergerInfo?.newWard ? mergerInfo.newWard : formData.ward,
      district: isNewAddrSelected && mergerInfo?.newDistrict ? mergerInfo.newDistrict : formData.district,
      orderId,
      address: computedFullAddress,
      newAddress: (isNewAddrSelected ? (formData.newAddress || computedSuggestedNewAddress) : ''),
      lat: finalLat || 16.0544,
      lng: finalLng || 108.2022,
      google_place_id: finalPlaceId,
      publishedAt: new Date(startDate).toISOString(),
      startDate: startDate,
      listingDays,
      autoBumpHours,
      autoBumpDays: bumpDays,
      autoBumpFee,
      scheduleTime: scheduleTime || 'now'
    };

    const newProp = addProperty(payload, selectedVipId, listingDays, paymentMethod, appliedVoucher);
    if (newProp) {
      if (setPreselectedListingType) setPreselectedListingType('normal');
      setIsCheckoutModalOpen(false);
      setPublishedProperty(newProp);
    }
  };

  // Kích hoạt Webhook Ngân Hàng giả lập
  const triggerMockWebhook = async (orderIdToTrigger) => {
    const targetId = orderIdToTrigger || checkoutOrderId;
    if (!targetId || paymentPollingState === 'success' || paymentPollingState === 'verifying') return;
    setIsTriggeringWebhook(true);
    try {
      await fetch('/api/payment-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: targetId, amount: finalCost })
      });
      handlePaymentSuccess(targetId);
    } catch {
      handlePaymentSuccess(targetId);
    } finally {
      setIsTriggeringWebhook(false);
    }
  };

  // Xử lý khi Polling hoặc Webhook nhận diện thanh toán thành công
  const handlePaymentSuccess = (confirmedOrderId) => {
    if (paymentPollingState === 'success' || paymentPollingState === 'verifying') return;
    setPaymentPollingState('verifying');
    playPaymentSuccessSound();
    showToast('⚡ Ngân hàng Napas 24/7 báo có! Khớp số tiền và nội dung chuyển khoản thành công.', 'success');

    setTimeout(() => {
      setPaymentPollingState('success');
      setTimeout(() => {
        handleConfirmPaymentAndPublish(confirmedOrderId || checkoutOrderId);
      }, 1200);
    }, 700);
  };

  // Polling & Countdown Loop khi mở Checkout Modal
  useEffect(() => {
    if (!isCheckoutModalOpen || !checkoutOrderId) return;
    if (paymentPollingState === 'success' || paymentPollingState === 'verifying') return;

    // 1. Đồng hồ đếm ngược phiên thanh toán & Demo Auto-Detect
    const countdownTimer = setInterval(() => {
      setCheckoutCountdown(prev => {
        if (prev <= 1) {
          setPaymentPollingState('expired');
          return 0;
        }
        return prev - 1;
      });

      if (autoDemoEnabled && paymentPollingState === 'waiting') {
        setAutoDemoTimer(prev => {
          if (prev <= 1) {
            triggerMockWebhook(checkoutOrderId);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    // 2. Polling tự động kiểm tra trạng thái giao dịch mỗi 2.5s
    const pollTimer = setInterval(async () => {
      if (paymentPollingState !== 'waiting') return;
      try {
        setPollingCount(prev => prev + 1);
        const res = await fetch(`/api/payment-status?orderId=${checkoutOrderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            handlePaymentSuccess(checkoutOrderId);
          }
        }
      } catch (err) {
        // Fallback im lặng nếu mất mạng tạm thời
      }
    }, 2500);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(pollTimer);
    };
  }, [isCheckoutModalOpen, checkoutOrderId, paymentPollingState, autoDemoEnabled]);

  // Xác nhận đăng tin
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Kiểm tra thông tin Bước 1
    if (!formData.city) {
      setStep(1);
      showToast('Vui lòng chọn Tỉnh / Thành phố tại Bước 1!', 'warning');
      return;
    }
    if (!formData.district) {
      setStep(1);
      showToast('Vui lòng chọn Quận / Huyện tại Bước 1!', 'warning');
      return;
    }
    if (!formData.ward) {
      setStep(1);
      showToast('Vui lòng chọn Phường / Xã tại Bước 1!', 'warning');
      return;
    }
    if (!formData.street || !formData.street.trim()) {
      setStep(1);
      showToast('Vui lòng nhập Tên đường / Số nhà hoặc Địa chỉ cụ thể tại Bước 1!', 'warning');
      return;
    }
    if (mergerInfo && formData.selectedAddressType !== 'new') {
      setStep(1);
      // Chặn đăng tin nếu chưa chọn địa chỉ mới, không hiển thị thông báo toast theo yêu cầu
      return;
    }

    // 2. Tự động lọc sạch số điện thoại trong Tiêu đề & Mô tả nếu được cấu hình
    if (systemConfig?.autoFilterPhoneInContent !== false) {
      if (formData.title && hasPhoneNumber(formData.title)) {
        formData.title = sanitizePhoneFromText(formData.title).text;
      }
      if (formData.description && hasPhoneNumber(formData.description)) {
        formData.description = sanitizePhoneFromText(formData.description).text;
      }
    }

    // Kiểm tra thông tin Bước 2
    if (!formData.title || formData.title.length < 30) {
      setStep(2);
      showToast('Tiêu đề cần tối thiểu 30 ký tự để đạt chuẩn sàn (Bước 2)!', 'warning');
      return;
    }
    if (formData.title.length > 99) {
      setStep(2);
      showToast('Tiêu đề không được vượt quá 99 ký tự (Bước 2)!', 'warning');
      return;
    }
    if (!formData.description || formData.description.length < 50) {
      setStep(2);
      showToast('Mô tả bất động sản cần tối thiểu 50 ký tự (Bước 2)!', 'warning');
      return;
    }
    if (formData.priceType !== 'deal' && (!formData.price || formData.price <= 0)) {
      setStep(2);
      showToast('Vui lòng nhập mức giá hợp lệ hoặc chọn Thỏa thuận (Bước 2)!', 'warning');
      return;
    }
    if (!formData.area || formData.area <= 0) {
      setStep(2);
      showToast('Vui lòng nhập diện tích sử dụng lớn hơn 0 (Bước 2)!', 'warning');
      return;
    }

    // 3. Kiểm tra thông tin Bước 3
    if (!formData.images || formData.images.length === 0) {
      setStep(3);
      showToast('Vui lòng tải lên tối thiểu 1 hình ảnh thật của bất động sản (Bước 3)!', 'warning');
      return;
    }

    // 3b. Kiểm tra giới hạn đăng tin miễn phí trong ngày nếu chọn Tin Thường hoặc tin 0 đ
    const isFreeSubmission = (selectedVipId === 'normal' || dailyRate === 0) && finalCost === 0;
    if (isFreeSubmission && currentUser?.role !== 'admin' && !dailyQuotaInfo.allowed) {
      setStep(4);
      showToast(`Bạn đã đạt giới hạn đăng tin miễn phí trong ngày (tối đa ${dailyQuotaInfo.limit} tin/ngày). Vui lòng nâng cấp gói Tin VIP hoặc quay lại vào ngày mai!`, 'warning');
      return;
    }

    // 3c. Kiểm tra thông tin người đăng (Nếu chưa đăng nhập)
    if (isGuest) {
      if (!formData.contactName || !formData.contactName.trim()) {
        setStep(4);
        showToast('Vui lòng nhập họ và tên liên hệ (Bước 4)!', 'warning');
        return;
      }
      if (!formData.contactPhone || !formData.contactPhone.trim()) {
        setStep(4);
        showToast('Vui lòng nhập số điện thoại liên hệ (Bước 4)!', 'warning');
        return;
      }
    }

    // 4. Kiểm tra số dư ví nếu chọn thanh toán bằng Ví
    if (paymentMethod === 'wallet' && finalCost > 0) {
      if (isGuest) {
        showToast('Khách vãng lai vui lòng chọn thanh toán qua VietQR, MoMo hoặc VNPAY!', 'error');
        return;
      }
      const totalAvailable = (Number(currentUser?.walletBalance) || 0) + (Number(currentUser?.bonusWalletBalance) || 0);
      if (totalAvailable < finalCost) {
        showToast(`Số dư ví (${totalAvailable.toLocaleString('vi-VN')} đ) không đủ ${finalCost.toLocaleString('vi-VN')} đ. Vui lòng nạp thêm hoặc quét mã VietQR!`, 'error');
        return;
      }
    }

    // Nếu thanh toán qua cổng trực tiếp (VietQR, MoMo, VNPAY) và có phát sinh chi phí:
    // Khởi tạo phiên giao dịch và mở Popup Auto-Polling & Quét QR
    if (paymentMethod !== 'wallet' && finalCost > 0) {
      const newOrderId = 'BDS-' + Math.floor(100000 + Math.random() * 900000);
      setCheckoutOrderId(newOrderId);
      setPaymentPollingState('waiting');
      setPollingCount(0);
      setCheckoutCountdown(600);
      setAutoDemoTimer(8);
      setIsCheckoutModalOpen(true);

      // Đăng ký phiên thanh toán với Backend API
      fetch('/api/payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrderId,
          amount: finalCost,
          vipPackageId: selectedVipId,
          customerPhone: formData.contactPhone
        })
      }).catch(() => {});
      return;
    }

    // Nếu dùng Ví tài khoản hoặc miễn phí 0 đ qua Voucher: xuất bản ngay
    handleConfirmPaymentAndPublish();
  };

  const modalInnerContent = (
    <div 
      className={`relative bg-white rounded-3xl shadow-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200 ${
        isEmbedded ? 'shadow-lg border-slate-200' : 'max-w-4xl my-4 zoom-in-95'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header với Tiêu Chuẩn Chuyên Nghiệp & AloNhaDat */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white text-base font-black shadow-lg">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Đăng Tin Bất Động Sản</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Bước {step}/4: {
                step === 1 ? 'Loại BĐS & Địa giới hành chính' :
                step === 2 ? 'Tiêu đề, Mô tả & Thông số kỹ thuật' :
                step === 3 ? 'Hình ảnh thực tế & Tour VR 360°' :
                'Cấu hình Gói VIP & Lịch đẩy tin'
              }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && !isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition cursor-pointer"
              title="Đóng cửa sổ"
              aria-label="Đóng cửa sổ"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>

      {/* Persistent Membership & Voucher Status Banner */}
      {currentUser?.membership ? (
        <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isMemberExpired
            ? 'bg-gradient-to-r from-slate-950 via-rose-950/90 to-slate-900 border-rose-500/40 text-white'
            : 'bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-900 border-amber-500/30 text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-md ${
              isMemberExpired
                ? 'bg-rose-600 text-white'
                : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
            }`}>
              <i className={isMemberExpired ? "fa-solid fa-triangle-exclamation text-sm" : "fa-solid fa-crown text-sm"}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-wide ${isMemberExpired ? 'text-rose-300' : 'text-amber-300'}`}>
                  {currentUser.membership.packageName}
                </span>
                {isMemberActive ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                    Đang kích hoạt
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                    Đã hết hạn
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                {isMemberActive ? (
                  <span>Ưu đãi Voucher 30 ngày • Tiết kiệm tới {premiumSavePercent}% chi phí</span>
                ) : (
                  <span className="text-rose-300">
                    Hết hạn ngày: {new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')} • Toàn bộ voucher đã hết hiệu lực
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${isMemberActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-slate-300">Voucher Đăng Tin Thường:</span>
              <span className={`font-black text-xs ${isMemberActive ? 'text-emerald-400' : 'text-slate-400 font-mono'}`}>
                {isMemberActive ? (currentUser.vouchers?.normalPublish || 0) : 0} lượt
              </span>
            </div>

            <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full ${isMemberActive ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
              <span className="text-slate-300">Voucher Đẩy Tin:</span>
              <span className={`font-black text-xs ${isMemberActive ? 'text-amber-300' : 'text-slate-400 font-mono'}`}>
                {isMemberActive ? (currentUser.vouchers?.normalBump || 0) : 0} lượt
              </span>
            </div>

            {isMemberActive && (currentUser.vouchers?.vipPublish || 0) > 0 && (
              <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-amber-200">Voucher Tin VIP:</span>
                <span className="font-black text-amber-300 text-xs">{currentUser.vouchers.vipPublish} voucher</span>
              </div>
            )}

            <Link
              href="/goi-hoi-vien"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] shadow-sm ml-1 flex items-center gap-1 ${
                isMemberExpired
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <span>{isMemberExpired ? 'Gia hạn gói' : 'Xem gói'}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 px-5 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm shrink-0">
              <i className="fa-solid fa-fire text-amber-950"></i>
            </span>
            <div className="text-slate-800">
              <b className="text-amber-900">Ưu đãi Gói Hội Viên:</b> Tiết kiệm tới <b>{premiumSavePercent}%</b> chi phí & nhận tới <b>50 Voucher đăng tin 0 đ</b> mỗi tháng!
            </div>
          </div>
          <Link
            href="/goi-hoi-vien"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-lg text-[11px] shadow-sm transition shrink-0 flex items-center gap-1"
          >
            <span>Đăng Ký Gói Hội Viên</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </Link>
        </div>
      )}

      {/* Wizard Step Tabs Navigation */}
      <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 1 ? 'bg-white text-red-700 border-b-2 border-red-700 shadow-sm font-black' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 1 ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-800'
          }`}>1</span>
          <span className="hidden sm:inline">Vị Trí & Loại Hình</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 2 ? 'bg-white text-red-700 border-b-2 border-red-700 shadow-sm font-black' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 2 ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-800'
          }`}>2</span>
          <span className="hidden sm:inline">Bài Viết & Thông Số</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 3 ? 'bg-white text-red-700 border-b-2 border-red-700 shadow-sm font-black' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 3 ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-800'
          }`}>3</span>
          <span className="hidden sm:inline">Hình Ảnh & VR 360°</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 4 ? 'bg-white text-red-700 border-b-2 border-red-700 shadow-sm font-black' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 4 ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-800'
          }`}>4</span>
          <span className="hidden sm:inline">Loại Tin & Lịch Đăng</span>
        </button>
      </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {/* ========================================================
              BƯỚC 1: THÔNG TIN CƠ BẢN & ĐỊA GIỚI HÀNH CHÍNH 4 CẤP
             ======================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Nhu cầu giao dịch */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                  1. Nhu Cầu Giao Dịch <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, demand: 'sale' }));
                      updatePriceCalculations(formData.price, formData.priceType, formData.area, 'sale');
                    }}
                    className={`py-3 px-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition ${formData.demand === 'sale' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <i className="fa-solid fa-tag text-emerald-600 text-base"></i>
                    <div>
                      <div className="font-black text-sm">Cần Bán Nhà Đất</div>
                      <div className="text-[10px] font-normal text-slate-500">Chuyển nhượng, bán căn hộ, đất nền</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, demand: 'rent' }));
                      updatePriceCalculations(formData.price, formData.priceType, formData.area, 'rent');
                    }}
                    className={`py-3 px-4 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition ${formData.demand === 'rent' ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <i className="fa-solid fa-key text-blue-600 text-base"></i>
                    <div>
                      <div className="font-black text-sm">Cho Thuê Nhà Đất</div>
                      <div className="text-[10px] font-normal text-slate-500">Cho thuê nhà ở, văn phòng, mặt bằng</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Loại hình BĐS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                  2. Loại Hình Bất Động Sản <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROPERTY_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, propertyType: t.id, propertyTypeName: t.name }))}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${formData.propertyType === t.id ? 'bg-slate-900 text-white border-slate-900 shadow' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <i className={`fa-solid ${t.icon} text-amber-500 text-sm`}></i>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vị trí địa lý */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 uppercase flex items-center gap-2">
                    <i className="fa-solid fa-map-location-dot text-red-600 text-sm"></i>
                    <span>3. Địa Chỉ Bất Động Sản (Địa giới hành chính) <span className="text-red-500">*</span></span>
                  </div>
                </div>

                {/* Các trường tra cứu nhanh trực tiếp trên form */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.city}
                      onChange={(val) => handleCityChange(val)}
                      options={LOCATIONS.map(l => ({ value: l.name, label: l.name, sublabel: l.region }))}
                      placeholder="Chọn Tỉnh / Thành phố"
                      showSearch={true}
                      searchPlaceholder="Tìm tỉnh/thành (63 tỉnh toàn quốc)..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.district}
                      onChange={(val) => handleDistrictChange(val)}
                      options={districtList.map(d => ({ value: d.name, label: d.name }))}
                      placeholder="Chọn Quận / Huyện"
                      disabled={!formData.city || districtList.length === 0}
                      showSearch={true}
                      searchPlaceholder="Tìm quận huyện..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.ward}
                      onChange={(val) => {
                        const localMerger = findDanangMerger(val);
                        setFormData(prev => ({
                          ...prev,
                          ward: val,
                          selectedAddressType: '',
                          isAdministrativeMerged: Boolean(localMerger),
                          newAddress: localMerger ? [prev.street, localMerger.newWard, prev.city].filter(Boolean).join(', ') : '',
                          lat: localMerger?.lat || prev.lat,
                          lng: localMerger?.lng || prev.lng,
                          google_place_id: localMerger?.placeId || prev.google_place_id
                        }));
                      }}
                      options={wardList.map(w => ({ value: w, label: w }))}
                      placeholder="Chọn Phường / Xã"
                      disabled={!formData.district || wardList.length === 0}
                      showSearch={true}
                      searchPlaceholder="Tìm phường xã..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Đường / Phố & Số nhà <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.street}
                      onChange={(val) => setFormData(prev => ({
                        ...prev,
                        street: val
                      }))}
                      options={streetList.map(st => ({ value: st, label: st }))}
                      placeholder={!formData.district ? 'Vui lòng chọn Quận / Huyện trước' : 'VD: Số 208 Nguyễn Hữu Cảnh...'}
                      disabled={!formData.district}
                      allowCustomInput={true}
                    />
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <i className="fa-regular fa-lightbulb text-amber-500"></i>
                      <span>Gợi ý: Bạn có thể chọn tên đường có sẵn hoặc gõ trực tiếp tên đường &amp; số nhà bất kỳ nếu chưa có trong danh sách.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Dự án / Khu đô thị (Nếu thuộc dự án)
                    </label>
                    <CustomSelect
                      value={formData.project}
                      onChange={(val) => setFormData(prev => ({ ...prev, project: val }))}
                      options={projectList.map(proj => ({ value: proj, label: proj }))}
                      placeholder={!formData.city ? 'Vui lòng chọn Tỉnh / Thành trước' : 'Chọn hoặc nhập tên dự án...'}
                      disabled={!formData.city}
                      allowCustomInput={true}
                    />
                  </div>
                </div>

                {/* ======================================================== */}
                {/* CẤU TRÚC ĐỊA CHỈ HIỂN THỊ TRÊN TIN ĐĂNG & BẢN ĐỒ        */}
                {/* Chỉ hiển thị khi người dùng đã chọn xong 3 trường:       */}
                {/* Tỉnh / Thành phố *, Quận / Huyện *, Phường / Xã *        */}
                {/* ======================================================== */}
                {hasSelectedFullLocation && (
                  <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                    {/* Chỉ hiển thị cấu trúc Địa chỉ cũ / Địa chỉ mới khi phường có sáp nhập thực tế */}
                    {mergerInfo && (
                      <div className="space-y-4">
                        {/* 1. Tiêu đề hiển thị */}
                        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                          <span>Địa chỉ hiển thị trên tin đăng</span>
                          <span className="text-red-500">*</span>
                        </div>

                        {/* 2. Banner xanh thông báo địa chỉ mới */}
                        <div className="p-3 sm:p-3.5 bg-[#ecfbf3] rounded-2xl border border-emerald-200/80 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] shadow-xs">
                            <i className="fa-solid fa-check"></i>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-950">
                              Thêm hiển thị cho địa chỉ mới
                            </div>
                            <div className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed font-normal">
                              Tin hiển thị ở 2 trang kết quả tìm kiếm (địa chỉ mới và cũ), giúp tiếp cận nhiều người tìm nhà hơn
                            </div>
                          </div>
                        </div>

                        {/* 3. Khối so sánh Địa chỉ cũ & Địa chỉ mới */}
                        <div className="p-3 sm:p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-1.5">
                          {/* 1. Địa chỉ cũ - Chỉ hiển thị thông tin đối chiếu (không có radio chọn) */}
                          <div className="p-2.5 sm:p-3 bg-white/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5 shadow-2xs">
                            <i className="fa-solid fa-location-dot text-slate-700 text-sm mt-0.5 shrink-0"></i>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900">Địa chỉ cũ</div>
                              <div className="text-xs text-slate-700 pt-0.5 font-medium leading-relaxed">
                                {currentOldAddress}
                              </div>
                            </div>
                          </div>

                          {/* Mũi tên chuyển giao ↓ (Tối giản khoảng cách, gọn gàng và tinh tế) */}
                          <div className="pl-3.5 text-slate-400 flex items-center h-3 -my-0.5">
                            <i className="fa-solid fa-arrow-down text-[10px]"></i>
                          </div>

                          {/* 2. Địa chỉ mới - Chỉ yêu cầu người dùng chọn mục này */}
                          <div className="pt-0.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                                <i className="fa-solid fa-location-dot text-red-600 text-sm"></i>
                                <span>Địa chỉ mới</span>
                              </div>
                              {formData.selectedAddressType !== 'new' && (
                                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                                  <i className="fa-solid fa-circle-exclamation text-[9px]"></i>
                                  <span>Vui lòng chọn</span>
                                </span>
                              )}
                            </div>

                            {/* Card địa chỉ mới gợi ý chuẩn ảnh user với viền đỏ khi chưa chọn (Đã bỏ cấp quận) */}
                            <div
                              onClick={() => {
                                const newAddr = computedSuggestedNewAddress || [
                                  displayStreetPart,
                                  suggestedWard,
                                  mergerInfo?.newCity || displayCity
                                ].filter(Boolean).join(', ');
                                setFormData(prev => ({
                                  ...prev,
                                  selectedAddressType: 'new',
                                  isAdministrativeMerged: true,
                                  newAddress: newAddr,
                                  lat: mergerInfo?.lat || prev.lat,
                                  lng: mergerInfo?.lng || prev.lng,
                                  google_place_id: mergerInfo?.google_place_id || prev.google_place_id
                                }));
                              }}
                              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                                formData.selectedAddressType === 'new'
                                  ? 'bg-white border-slate-900 shadow-xs'
                                  : 'bg-white border-red-500 hover:border-red-600 shadow-xs ring-2 ring-red-500/10'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="text-[11px] font-medium text-slate-500">
                                  Địa chỉ mới theo đề án tinh gọn (đã bỏ cấp quận)
                                </div>
                                <div className="text-xs sm:text-sm text-slate-900 leading-snug">
                                  {displayStreetPart ? `${displayStreetPart}, ` : ''}
                                  <strong className="font-extrabold text-slate-950">
                                    {suggestedWard}
                                  </strong>
                                  {`, ${mergerInfo?.newCity || displayCity}`}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
                                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                                  <span>Đã đồng bộ đơn vị hành chính mới từ Google Maps</span>
                                </div>
                              </div>

                              <div className="shrink-0 pl-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                  formData.selectedAddressType === 'new' ? 'border-slate-900 bg-white' : 'border-red-500 bg-white'
                                }`}>
                                  {formData.selectedAddressType === 'new' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Link báo cáo góp ý cờ đen */}
                            <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-800">
                              <i className="fa-solid fa-flag text-slate-900 text-xs shrink-0"></i>
                              <button
                                type="button"
                                onClick={() => showToast('Cảm ơn đóng góp của bạn! Hệ thống sẽ cập nhật dữ liệu hành chính.', 'info')}
                                className="underline hover:text-red-600 transition font-medium text-left cursor-pointer"
                              >
                                Không tìm thấy địa chỉ phù hợp? Cho chúng tôi biết địa chỉ của bạn
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Chọn vị trí trên bản đồ */}
                    <ListingLocationMap
                      city={formData.city}
                      district={mergerInfo?.newDistrict || formData.district}
                      targetCoords={formData.lat && formData.lng ? { lat: Number(formData.lat), lng: Number(formData.lng) } : null}
                      defaultCoords={
                        mergerInfo?.lat && mergerInfo?.lng
                          ? { lat: Number(mergerInfo.lat), lng: Number(mergerInfo.lng), zoom: 16 }
                          : (googleGeocodeInfo?.lat && googleGeocodeInfo?.lng
                              ? { lat: Number(googleGeocodeInfo.lat), lng: Number(googleGeocodeInfo.lng), zoom: 16 }
                              : null)
                      }
                      formattedAddress={
                        formData.selectedAddressType === 'new' && (formData.newAddress || computedSuggestedNewAddress)
                          ? (formData.newAddress || computedSuggestedNewAddress)
                          : (googleGeocodeInfo?.formatted_address || currentOldAddress)
                      }
                      googlePlaceId={formData.google_place_id || googleGeocodeInfo?.google_place_id}
                      isGeocoding={isGeocodingLoading}
                      onLocationChange={(coords) => {
                        setFormData(prev => {
                          const dLat = Math.abs(Number(prev.lat || 0) - Number(coords.lat));
                          const dLng = Math.abs(Number(prev.lng || 0) - Number(coords.lng));
                          if (dLat < 0.00005 && dLng < 0.00005) return prev;
                          return {
                            ...prev,
                            lat: coords.lat,
                            lng: coords.lng
                          };
                        });
                      }}
                      onReset={() => {
                        showToast('Đã đặt lại vị trí bản đồ về tâm địa chỉ ban đầu', 'info');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              BƯỚC 2: BÀI VIẾT (TIÊU ĐỀ, MÔ TẢ) & THÔNG SỐ KỸ THUẬT
             ======================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Tiêu đề tin đăng 30-99 ký tự */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    1. Tiêu Đề Tin Đăng <span className="text-red-500">*</span>
                  </label>
                  <div className="text-xs font-mono font-bold">
                    <span className={formData.title.length < 30 ? 'text-amber-600' : formData.title.length > 99 ? 'text-red-600' : 'text-emerald-600'}>
                      {formData.title.length}/99 ký tự
                    </span>
                    <span className="text-slate-400 ml-1">(Chuẩn 30 - 99)</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="VD: Bán căn hộ 2PN Vinhomes Central Park view sông Sài Gòn, sổ hồng sẵn..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  onBlur={handleTitleBlur}
                  onPaste={handleTitlePaste}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-red-500"
                />
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>💡 Gợi ý: [Loại BĐS] + [Đặc điểm nổi bật/Vị trí] + [Pháp lý/Giá]</span>
                  <button
                    type="button"
                    onClick={() => {
                      const parts = [
                        formData.demand === 'sale' ? 'Bán' : 'Cho thuê',
                        formData.propertyTypeName,
                        formData.project ? formData.project : formData.street,
                        formData.area ? `${formData.area}m²` : '',
                        formData.bedroom ? `${formData.bedroom}PN` : '',
                        formData.priceDisplay || ''
                      ].filter(Boolean);
                      const suggest = parts.join(' ');
                      setFormData(prev => ({ ...prev, title: suggest }));
                    }}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    + Tạo tiêu đề gợi ý tự động
                  </button>
                </div>
              </div>

              {/* Nội dung mô tả kèm template chuẩn */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    2. Nội Dung Mô Tả Chi Tiết <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Chèn mẫu:</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, description: DESCRIPTION_TEMPLATES.apartment }))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      Mẫu Chung cư
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, description: DESCRIPTION_TEMPLATES.house }))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      Mẫu Nhà phố
                    </button>
                  </div>
                </div>
                <textarea
                  rows="5"
                  placeholder="Mô tả kỹ kết cấu, diện tích, nội thất bàn giao, vị trí kết nối giao thông, tiện ích nội ngoại khu..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  onBlur={handleDescriptionBlur}
                  onPaste={handleDescriptionPaste}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-900 focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              {/* Định giá & Đơn vị tính */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <i className="fa-solid fa-coins text-amber-500"></i>
                    <span>3. Mức Giá & Diện Tích <span className="text-red-500">*</span></span>
                  </span>
                  {/* Radio chọn kiểu định giá */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'total'} 
                        onChange={() => updatePriceCalculations(formData.price, 'total', formData.area, formData.demand)} 
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Tổng tiền</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'm2'} 
                        onChange={() => updatePriceCalculations(formData.price, 'm2', formData.area, formData.demand)} 
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Theo m²</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'deal'} 
                        onChange={() => updatePriceCalculations('', 'deal', formData.area, formData.demand)} 
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Thỏa thuận</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Ô nhập mức giá & Gợi ý nhanh */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-700">
                        {formData.priceType === 'm2' 
                          ? (formData.demand === 'rent' ? 'Giá thuê theo m² (VND/m²/tháng) *' : 'Giá theo m² (VND/m²) *') 
                          : (formData.demand === 'rent' ? 'Số tiền niêm yết cho thuê (VND/tháng) *' : 'Số tiền niêm yết (VND) *')
                        }
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.demand === 'rent' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {formData.demand === 'rent' ? 'Nhu cầu: Cho thuê' : 'Nhu cầu: Cần bán'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        disabled={formData.priceType === 'deal'}
                        placeholder={
                          formData.priceType === 'deal' 
                            ? 'Giá thỏa thuận trực tiếp khi liên hệ' 
                            : (formData.demand === 'rent' 
                                ? 'VD: 15.000.000 hoặc nhập 15' 
                                : 'VD: 3.500.000.000 hoặc nhập 3500'
                              )
                        }
                        value={formData.priceType === 'deal' ? '' : formatInputValue(formData.price)}
                        onChange={handlePriceInputChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 disabled:bg-slate-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition pr-24 shadow-xs"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 select-none">
                        {formData.priceType === 'm2' 
                          ? (formData.demand === 'rent' ? 'VND/m²/tháng' : 'VND/m²') 
                          : (formData.demand === 'rent' ? 'VND/tháng' : 'VND')
                        }
                      </span>
                    </div>

                    {/* Gợi ý các mức giá (Suggestion Pills) */}
                    {priceSuggestions.length > 0 && formData.priceType !== 'deal' && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
                        {priceSuggestions.map((item) => {
                          const isSelected = Number(formData.price) === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                updatePriceCalculations(item.value, formData.priceType, formData.area, formData.demand);
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
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
                    )}

                    {/* Dòng chữ quy đổi tổng trị giá */}
                    <div className="mt-2 text-xs">
                      {formData.priceType === 'deal' ? (
                        <span className="text-slate-500 font-medium">Giá thỏa thuận trực tiếp khi thương lượng</span>
                      ) : formData.price && formData.price > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-700 font-medium">
                            Tổng trị giá: <strong className="font-bold text-slate-900">{formatSummaryPrice(formData.price, formData.demand === 'rent', formData.priceType === 'm2')}</strong>
                          </span>
                          {formData.pricePerM2 && formData.area > 0 && formData.priceType !== 'm2' && (
                            <span className="text-slate-500 font-normal">
                              • Đơn giá m²: <b className="text-emerald-700 font-semibold">{formData.pricePerM2}</b>
                            </span>
                          )}
                          {formData.priceType === 'm2' && formData.area > 0 && (
                            <span className="text-slate-500 font-normal">
                              • Tổng tiền trọn gói: <b className="text-emerald-700 font-semibold">{formData.priceDisplay}</b>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal text-[11px]">
                          Nhập giá tiền để tự động gợi ý các mức giá chuẩn và quy đổi thành chữ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diện tích & Bàn giao nội thất */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Diện tích sử dụng (m²) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="VD: 75"
                        value={formData.area ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newArea = val === '' ? '' : Number(val);
                          setFormData(prev => ({ ...prev, area: newArea }));
                          updatePriceCalculations(formData.price, formData.priceType, newArea, formData.demand);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Bàn giao nội thất
                      </label>
                      <CustomSelect
                        value={formData.furniture || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, furniture: val }))}
                        options={[
                          'Full nội thất cao cấp',
                          'Nội thất cơ bản gắn tường',
                          'Bàn giao thô (chưa hoàn thiện)'
                        ]}
                        placeholder="Chọn tình trạng nội thất"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông số kỹ thuật chuyên sâu theo chuẩn AloNhaDat */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase block">
                  4. Đặc Điểm Bất Động Sản (Mặt tiền, Lộ giới, Hướng)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mặt tiền (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 5"
                      value={formData.facade ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, facade: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Đường vào / Lộ giới (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="VD: 8"
                      value={formData.entranceRoad ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, entranceRoad: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hướng nhà</label>
                    <CustomSelect
                      value={formData.direction || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, direction: val }))}
                      options={['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Nam', 'Đông Bắc', 'Tây Bắc']}
                      placeholder="Chọn hướng"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hướng ban công</label>
                    <CustomSelect
                      value={formData.balconyDirection || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, balconyDirection: val }))}
                      options={['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Nam', 'Đông Bắc', 'Tây Bắc']}
                      placeholder="Chọn hướng ban công"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Số phòng ngủ</label>
                    <input
                      type="number"
                      placeholder="VD: 2"
                      value={formData.bedroom ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedroom: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Số phòng vệ sinh (WC)</label>
                    <input
                      type="number"
                      placeholder="VD: 2"
                      value={formData.bathroom ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathroom: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Số tầng</label>
                    <input
                      type="number"
                      placeholder="VD: 1"
                      value={formData.floor ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Giấy tờ pháp lý</label>
                    <CustomSelect
                      value={formData.legal || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, legal: val }))}
                      options={[
                        'Sổ đỏ/Sổ hồng chính chủ',
                        'Hợp đồng mua bán (HĐMB)',
                        'Đang chờ cấp sổ',
                        'Giấy tờ hợp lệ khác'
                      ]}
                      placeholder="Chọn tình trạng pháp lý"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              BƯỚC 3: HÌNH ẢNH THỰC TẾ, VIDEO REVIEW & VR 360°
             ======================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <i className="fa-solid fa-camera text-red-600"></i>
                    <span>1. Hình Ảnh Bất Động Sản (Tối thiểu 1 - 20 ảnh)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-600">{formData.images.length}/20 ảnh đã chọn</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Theo thuật toán của hệ thống, bài đăng có từ 4 ảnh thực tế trở lên tăng 250% tỷ lệ người mua liên hệ.
                </p>

                {/* VÙNG TẢI ẢNH CHÍNH (DRAG & DROP + INPUT FILE) */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingImages(true); }}
                  onDragLeave={() => setIsDraggingImages(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingImages(false);
                    if (e.dataTransfer?.files?.length > 0) {
                      handleImageFileUpload({ target: { files: e.dataTransfer.files } });
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition cursor-pointer mb-3 ${
                    isDraggingImages
                      ? 'border-red-500 bg-red-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-red-500 bg-slate-50/80 hover:bg-red-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl mb-2 shadow-xs">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    Bấm để chọn ảnh từ máy tính / điện thoại hoặc Kéo thả ảnh vào đây
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Hỗ trợ định dạng JPG, JPEG, PNG, WebP (Tối đa 20 ảnh, dung lượng tối đa 10MB/ảnh)
                  </div>
                  <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow transition">
                    <i className="fa-solid fa-plus-circle"></i>
                    <span>Tải Ảnh Từ Thiết Bị Của Bạn</span>
                  </div>
                </div>

                {/* Nút mở ô nhập Link URL ảnh trực tiếp & Xóa tất cả */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-slate-600 hover:text-red-600 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-link text-slate-400"></i>
                    <span>{showUrlInput ? 'Ẩn ô nhập link ảnh' : '+ Hoặc chèn ảnh từ đường dẫn URL trực tiếp'}</span>
                  </button>

                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: [], coverImageIndex: 0 }))}
                      className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>Xóa tất cả ảnh</span>
                    </button>
                  )}
                </div>

                {/* Form chèn URL ảnh nếu mở */}
                {showUrlInput && (
                  <form onSubmit={handleAddImageUrl} className="flex gap-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="url"
                      placeholder="Dán link ảnh (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Thêm
                    </button>
                  </form>
                )}

                {/* Grid ảnh */}
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {formData.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`relative rounded-2xl overflow-hidden border-2 group h-28 cursor-pointer ${
                          formData.coverImageIndex === idx ? 'border-red-600 ring-2 ring-red-500/30' : 'border-slate-200'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, coverImageIndex: idx }))}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {formData.coverImageIndex === idx ? (
                          <span className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                            ★ Ảnh Bìa
                          </span>
                        ) : (
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                            Đặt làm ảnh bìa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                              coverImageIndex: 0
                            }));
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Thẻ + Thêm ảnh nếu chưa đủ 20 ảnh */}
                    {formData.images.length < 20 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 flex flex-col items-center justify-center h-28 cursor-pointer transition text-slate-400 hover:text-red-600"
                        title="Tải thêm ảnh từ máy"
                      >
                        <i className="fa-solid fa-plus text-xl mb-1"></i>
                        <span className="text-[11px] font-bold">Thêm ảnh</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-circle-exclamation text-amber-600 text-base shrink-0"></i>
                    <span>Chưa có ảnh nào được chọn. Vui lòng bấm vào khung trên để tải lên từ 1 đến 20 ảnh thực tế của bất động sản.</span>
                  </div>
                )}

                {/* Chọn bộ ảnh mẫu chất lượng cao */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    Gợi ý chọn bộ ảnh chụp kiến trúc chuẩn phong cách Realtor:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: [
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
                        ]
                      }))}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm cursor-pointer"
                    >
                      Bộ ảnh Căn hộ Biển Đà Nẵng cao cấp
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: [
                          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
                        ]
                      }))}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm cursor-pointer"
                    >
                      Bộ ảnh Biệt thự sân vườn
                    </button>
                  </div>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  2. Link Video Review Thực Tế (YouTube hoặc TikTok)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-600">
                    <i className="fa-brands fa-youtube text-base"></i>
                  </span>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Chế độ Tour Thực Tế Ảo VR 360° */}
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                    <i className="fa-solid fa-vr-cardboard text-purple-600 text-base"></i>
                    Bật Chế Độ Tour Thực Tế Ảo VR 360° Panorama
                  </div>
                  <div className="text-[11px] text-purple-700 mt-0.5">
                    Người xem có thể xoay góc nhìn 360 độ phòng khách và ban công như đang có mặt tại căn nhà.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.hasVR360}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hasVR360: e.target.checked,
                    vrScenes: e.target.checked ? [
                      { name: 'Phòng khách thông tầng 360', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80' },
                      { name: 'Ban công ngắm toàn cảnh 360', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80' }
                    ] : []
                  }))}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              BƯỚC 4: THÔNG TIN LIÊN HỆ, GÓI TIN VIP & LỊCH ĐẨY TIN
             ======================================================== */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Thông tin liên hệ người đăng: Chỉ hiển thị khi website CHƯA ĐĂNG NHẬP (Khách vãng lai) */}
              {isGuest && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase block">
                      1. Thông Tin Người Đăng & Liên Hệ
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tên liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="Vui lòng nhập họ và tên..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        onBlur={(e) => {
                          if (e.target.value) {
                            setFormData(prev => ({ ...prev, contactPhone: formatPhoneNumber(e.target.value) }));
                          }
                        }}
                        placeholder="Vui lòng nhập số điện thoại..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono placeholder:font-normal placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="Vui lòng nhập email..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Lựa chọn Phân Loại Tin Đăng & Thời Hạn */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    {isGuest ? '2. ' : ''}Chọn Loại Tin Đăng & Thời Gian Hiển Thị <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Bảng giá niêm yết theo ngày</span>
                </div>

                <ListingTierSelector
                  selectedType={selectedVipId}
                  onSelectType={handleSelectPackage}
                  selectedDays={listingDays}
                  onSelectDays={setListingDays}
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                  scheduleTime={scheduleTime}
                  onScheduleTimeChange={setScheduleTime}
                  voucherDiscount={voucherDiscount}
                  appliedVoucher={appliedVoucher}
                  showFullSummary={false}
                  customVipPackages={activeVipPackages}
                  dailyQuotaInfo={dailyQuotaInfo}
                />

                {/* Thông báo khi đã hết hạn mức đăng tin miễn phí trong ngày */}
                {selectedVipId === 'normal' && !hasFreeNormalQuota && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-info text-amber-600 text-sm shrink-0"></i>
                      <span>
                        Bạn đã sử dụng hết <b>{dailyQuotaInfo.limit}/{dailyQuotaInfo.limit}</b> lượt đăng tin miễn phí hôm nay. Tin thường tiếp theo sẽ áp dụng mức phí niêm yết <b>{configuredNormalRate.toLocaleString('vi-VN')} đ</b> (hoặc nâng cấp VIP).
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold shrink-0 uppercase">
                      Thu phí {configuredNormalRate.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
              </div>

              {/* Dịch vụ đẩy tin tự động - Chọn khung giờ vàng & chọn giờ phút linh hoạt */}
              <div 
                ref={bumpDropdownRef}
                className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl relative space-y-2.5 shadow-2xs"
              >
                {/* Header tinh gọn: Tiêu đề + Giá + Tổng tạm tính */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-arrow-up-right-dots"></i>
                    </span>
                    <span className="text-xs font-bold text-slate-900">Đẩy tin tự động</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{effectiveBumpPrice.toLocaleString('vi-VN')} đ/lần
                    </span>
                  </div>

                  {autoBumpHours.length > 0 && (
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-black text-emerald-700">
                        +{autoBumpFee.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                        ({autoBumpHours.length} mốc x {bumpDays} ngày{bumpDays > 1 ? ' đầu' : ''})
                      </span>
                    </div>
                  )}
                </div>

                {/* Dropdown Multi-Select Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBumpDropdownOpen(prev => !prev)}
                    className={`w-full px-3 py-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition bg-white shadow-2xs cursor-pointer ${
                      isBumpDropdownOpen
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : autoBumpHours.length > 0
                        ? 'border-emerald-400 text-slate-900 bg-emerald-50/20'
                        : 'border-slate-300 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <i className={`fa-solid ${autoBumpHours.length > 0 ? 'fa-calendar-check text-emerald-600' : 'fa-clock text-slate-400'} text-xs`}></i>
                      {autoBumpHours.length === 0 ? (
                        <span className="text-slate-400 text-xs">Chọn khung giờ vàng hoặc chọn giờ & phút cụ thể...</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">
                            Đã chọn {autoBumpHours.length} mốc:
                          </span>
                          {autoBumpHours.map(h => (
                            <span 
                              key={h}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono font-bold text-[11px]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      {autoBumpHours.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px]">
                          {autoBumpHours.length}
                        </span>
                      )}
                      <i className={`fa-solid fa-chevron-down text-[11px] transition-transform duration-200 ${isBumpDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`}></i>
                    </div>
                  </button>

                  {/* Dropdown Menu Popup (Multi-select) */}
                  {isBumpDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                      {/* Top Action Bar */}
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          Khung giờ vàng đề xuất:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const golden = ['08:00', '11:30', '14:00', '19:30'];
                              setAutoBumpHours(prev => Array.from(new Set([...prev, ...golden])).sort());
                            }}
                            className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] px-2 py-0.5 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                          >
                            ⚡ 4 Giờ vàng
                          </button>
                          {autoBumpHours.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setAutoBumpHours([])}
                              className="text-slate-500 hover:text-rose-600 font-bold text-[11px] px-2 py-0.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            >
                              ✕ Xóa hết
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Golden Hours Options Grid/List */}
                      <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                        {BUMP_GOLDEN_HOURS_OPTIONS.map((opt) => {
                          const isChecked = autoBumpHours.includes(opt.time);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => {
                                if (isChecked) {
                                  setAutoBumpHours(autoBumpHours.filter(h => h !== opt.time));
                                } else {
                                  setAutoBumpHours([...autoBumpHours, opt.time].sort());
                                }
                              }}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition select-none ${
                                isChecked
                                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {/* Custom Checkbox */}
                                <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition shrink-0 ${
                                  isChecked 
                                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isChecked && <i className="fa-solid fa-check text-[9px]"></i>}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                                    {opt.time}
                                  </span>
                                  <div>
                                    <div className="font-bold text-xs flex items-center gap-1.5">
                                      <i className={opt.icon}></i>
                                      <span>{opt.title}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {opt.desc}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-xs text-emerald-700">
                                  +{effectiveBumpPrice.toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Specific Hour & Minute Picker */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <i className="fa-regular fa-clock text-emerald-600"></i>
                          <span>Chọn giờ & phút tùy chọn:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Hour select */}
                          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                            <select
                              value={customHour}
                              onChange={(e) => setCustomHour(e.target.value)}
                              className="text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                            >
                              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                                <option key={h} value={h}>{h} giờ</option>
                              ))}
                            </select>
                            <span className="font-bold text-slate-400 mx-1">:</span>
                            {/* Minute select */}
                            <select
                              value={customMinute}
                              onChange={(e) => setCustomMinute(e.target.value)}
                              className="text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                            >
                              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                <option key={m} value={m}>{m} phút</option>
                              ))}
                            </select>
                          </div>

                          {/* Add button */}
                          <button
                            type="button"
                            onClick={handleAddCustomTime}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                          >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                            <span>Thêm mốc</span>
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Footer */}
                      <div className="p-2.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-600">
                          {autoBumpHours.length > 0
                            ? `Đã chọn ${autoBumpHours.length} mốc • Tạm tính: +${autoBumpFee.toLocaleString('vi-VN')} đ (${bumpDays} ngày)`
                            : 'Chưa chọn mốc thời gian nào'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsBumpDropdownOpen(false)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Hours Quick Pills Display & Days Selector */}
                {autoBumpHours.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/70 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-500 font-medium">Lịch đẩy hàng ngày:</span>
                        {autoBumpHours.map(hour => (
                          <span
                            key={hour}
                            className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-mono text-xs font-bold shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>{hour}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAutoBumpHours(autoBumpHours.filter(h => h !== hour));
                              }}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                              title={`Xóa mốc ${hour}`}
                            >
                              <i className="fa-solid fa-xmark text-[10px]"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold">
                        +{autoBumpFee.toLocaleString('vi-VN')} đ ({autoBumpHours.length} lần/ngày x {bumpDays} ngày{bumpDays > 1 ? ' đầu' : ''})
                      </div>
                    </div>

                    {/* Bộ chọn số ngày đẩy tin tự động (Mặc định 1 ngày) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 bg-white/70 p-2 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-calendar-days text-emerald-600 text-xs"></i>
                        <span className="text-[11px] font-bold text-slate-700">Số ngày áp dụng đẩy tin:</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">(Mặc định 1 ngày)</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[1, 2, 3, 5, 7].filter(d => d <= listingDays).map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setAutoBumpDays(d)}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              bumpDays === d
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                            }`}
                          >
                            {d} ngày {d === 1 && <span className="text-[9px] opacity-90 font-normal">(Mặc định)</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Phân Hệ Voucher Hội Viên Môi Giới */}
              <div className={`p-4 border rounded-2xl space-y-3 ${
                isMemberExpired
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                      isMemberExpired ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      <i className={isMemberExpired ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-ticket"}></i>
                    </span>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase">
                        Áp Dụng Voucher Gói Hội Viên
                      </div>
                      <div className="text-[11px]">
                        {isMemberActive ? (
                          <span className="text-slate-600">Gói đang kích hoạt: <b className="text-amber-800">{currentUser.membership.packageName}</b> (Hạn đến: {new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')})</span>
                        ) : isMemberExpired ? (
                          <span className="text-rose-700 font-bold">Gói đã hết hạn: {currentUser.membership.packageName} (Hết hạn {new Date(currentUser.membership.expiresAt).toLocaleDateString('vi-VN')})</span>
                        ) : (
                          <span className="text-slate-600">Chưa kích hoạt Gói Hội Viên</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isMemberExpired ? (
                  <div className="p-3 bg-white/80 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-rose-700">
                      <div className="font-bold">Kho Voucher của bạn đã hết hiệu lực theo quy chế sàn.</div>
                      <div className="text-[11px] text-rose-600">Vui lòng gia hạn gói để nhận lại bộ Voucher đăng tin và đẩy tin miễn phí.</div>
                    </div>
                    <Link
                      href="/goi-hoi-vien"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
                      <span>Gia Hạn Ngay</span>
                    </Link>
                  </div>
                ) : isMemberActive ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Voucher Tin Thường (-35k) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasNormalVoucher) {
                            showToast('Bạn đã hết Voucher Đăng Tin Thường trong chu kỳ 30 ngày này!', 'warning');
                            return;
                          }
                          if (selectedVipId !== 'normal') {
                            setSelectedVipId('normal');
                            setAppliedVoucher('normalPublish');
                            showToast(`Đã chuyển sang Tin Thường và áp dụng Voucher ${normalPublishVoucherDiscount.toLocaleString('vi-VN')} đ (0 đ)!`, 'success');
                            return;
                          }
                          setAppliedVoucher(appliedVoucher === 'normalPublish' ? null : 'normalPublish');
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          appliedVoucher === 'normalPublish'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md font-bold ring-2 ring-emerald-400/40'
                            : hasNormalVoucher
                            ? 'bg-white border-amber-200 text-slate-800 hover:border-emerald-400'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <i className="fa-solid fa-tag text-xs"></i>
                            <span>Voucher Đăng Tin Thường {isVoucherDiscountFree('normalPublish', normalPublishVoucherDiscount, { vipPackages: activeVipPackages, bumpServicePrice }) ? '(Miễn Phí)' : `(-${normalPublishVoucherDiscount.toLocaleString('vi-VN')} đ)`}</span>
                          </div>
                          <div className={`text-[10px] mt-0.5 ${appliedVoucher === 'normalPublish' ? 'text-emerald-100' : 'text-slate-500'}`}>
                            Khả dụng: <b>{currentUser.vouchers?.normalPublish || 0}</b> lượt
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            appliedVoucher === 'normalPublish' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {appliedVoucher === 'normalPublish' ? '✓ Đang dùng' : 'Dùng Voucher'}
                          </span>
                        </div>
                      </button>

                      {/* Voucher Tin VIP */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasVipVoucher) {
                            showToast(`Gói hội viên của bạn chưa có Voucher Giảm ${vipVoucherDiscount.toLocaleString('vi-VN')} đ cho Tin VIP!`, 'warning');
                            return;
                          }
                          if (selectedVipId === 'normal') {
                            showToast(`Voucher Tin VIP chỉ áp dụng cho các Loại Tin VIP (Kim Cương, Vàng, Bạc)!`, 'warning');
                            return;
                          }
                          setAppliedVoucher(appliedVoucher === 'vipPublish' ? null : 'vipPublish');
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          appliedVoucher === 'vipPublish'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black ring-2 ring-amber-400/40'
                            : hasVipVoucher
                            ? 'bg-white border-amber-200 text-slate-800 hover:border-amber-400'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <i className="fa-solid fa-crown text-xs"></i>
                            <span>Voucher Tin VIP (-{vipVoucherDiscount.toLocaleString('vi-VN')} đ)</span>
                          </div>
                          <div className={`text-[10px] mt-0.5 ${appliedVoucher === 'vipPublish' ? 'text-slate-900' : 'text-slate-500'}`}>
                            Khả dụng: <b>{currentUser.vouchers?.vipPublish || 0}</b> voucher
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            appliedVoucher === 'vipPublish' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {appliedVoucher === 'vipPublish' ? '✓ Đang dùng' : 'Dùng Voucher'}
                          </span>
                        </div>
                      </button>
                    </div>

                    {voucherDiscount > 0 && (
                      <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between border border-emerald-200 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
                          <div>
                            <div>Đã giảm trừ thành công: <b>-{voucherDiscount.toLocaleString('vi-VN')} đ</b></div>
                            <div className="text-[11px] text-emerald-700 font-normal">
                              {appliedVoucher === 'normalPublish' 
                                ? 'Tin Thường được tài trợ 100% chi phí đăng tin.' 
                                : `Giảm ${(voucherDiscount || vipVoucherDiscount).toLocaleString('vi-VN')} đ trực tiếp vào chi phí đăng Loại Tin VIP.`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedVoucher(null)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-semibold"
                        >
                          Hủy áp dụng
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/90 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <i className="fa-solid fa-percent text-amber-600"></i>
                        <span>Môi giới tiết kiệm tới {premiumSavePercent}% chi phí với Gói Hội Viên</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Nhận ngay 15 - 50 voucher giảm {normalPublishVoucherDiscount.toLocaleString('vi-VN')}đ đăng tin (0 đ) + voucher đẩy tin {effectiveBumpPrice.toLocaleString('vi-VN')}đ mỗi chu kỳ 30 ngày.
                      </div>
                    </div>
                    <Link
                      href="/goi-hoi-vien"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs transition shadow shrink-0 flex items-center gap-1.5"
                    >
                      <span>Đăng Ký Gói Hội Viên</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </Link>
                  </div>
                )}
              </div>

              {/* Hóa đơn & Phương thức thanh toán */}
              <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Số tiền thanh toán cuối cùng:</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
                      {finalCost === 0 ? (
                        <span className="text-emerald-400 flex items-center gap-2">
                          <span>0 đ</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {voucherDiscount > 0 ? 'MIỄN PHÍ QUA VOUCHER' : 'TIN ĐĂNG MIỄN PHÍ'}
                          </span>
                        </span>
                      ) : (
                        `${finalCost.toLocaleString('vi-VN')} đ`
                      )}
                    </div>
                    {voucherDiscount > 0 && (
                      <div className="text-xs text-emerald-400 mt-0.5 font-bold">
                        (Giá gốc: {totalCost.toLocaleString('vi-VN')} đ • Tiết kiệm Voucher: -{voucherDiscount.toLocaleString('vi-VN')} đ)
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-300 space-y-0.5">
                    <div>Gói: <strong className="text-white">{selectedPkg.name}</strong></div>
                    <div>Thời hạn: <strong className="text-white">{listingDays} ngày</strong></div>
                    {autoBumpHours.length > 0 && (
                      <div className="text-emerald-400">
                        Đẩy tin tự động: {autoBumpHours.length} lần/ngày x {bumpDays} ngày (+{autoBumpFee.toLocaleString('vi-VN')} đ)
                      </div>
                    )}
                  </div>
                </div>

                {finalCost > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        Chọn phương thức thanh toán:
                      </div>
                      {isGuest && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          Khách vãng lai (Chưa đăng nhập)
                        </span>
                      )}
                    </div>

                    <div className={`grid gap-2 text-xs ${!isGuest && paymentConfig?.wallet?.enabled !== false ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
                      {/* Ví tài khoản (Chỉ hiển thị cho người dùng ĐÃ ĐĂNG NHẬP) */}
                      {!isGuest && paymentConfig?.wallet?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`p-2.5 rounded-2xl border text-center font-bold transition ${paymentMethod === 'wallet' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'}`}
                        >
                          <i className="fa-solid fa-wallet mb-1 text-sm block"></i>
                          <div>Ví tài khoản</div>
                          <div className={`text-[11px] font-bold mt-0.5 tracking-tight ${paymentMethod === 'wallet' ? 'text-white drop-shadow-xs' : 'text-slate-300'}`}>
                            Dư: {((Number(currentUser?.walletBalance) || 0) + (Number(currentUser?.bonusWalletBalance) || 0)).toLocaleString('vi-VN')} đ
                          </div>
                        </button>
                      )}

                      {/* 1. VietQR Ngân Hàng Napas 24/7 */}
                      {paymentConfig?.vietqr?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('vietqr')}
                          className={`p-2.5 rounded-2xl border text-center font-bold transition ${paymentMethod === 'vietqr' ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'}`}
                        >
                          <i className="fa-solid fa-qrcode mb-1 text-sm block"></i>
                          <div>VietQR Ngân Hàng</div>
                          <div className={`text-[10px] font-semibold mt-0.5 ${paymentMethod === 'vietqr' ? 'text-blue-100' : 'text-slate-400'}`}>Quét mã QR 24/7</div>
                        </button>
                      )}

                      {/* 2. Ví MoMo */}
                      {paymentConfig?.momo?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('momo')}
                          className={`p-2.5 rounded-2xl border text-center font-bold transition ${paymentMethod === 'momo' ? 'bg-pink-600 text-white border-pink-500 shadow-md ring-2 ring-pink-400/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'}`}
                        >
                          <i className="fa-solid fa-mobile-screen-button mb-1 text-sm block"></i>
                          <div>Ví MoMo</div>
                          <div className={`text-[10px] font-semibold mt-0.5 ${paymentMethod === 'momo' ? 'text-pink-100' : 'text-slate-400'}`}>Thanh toán 1-chạm</div>
                        </button>
                      )}

                      {/* 3. Cổng VNPAY-QR */}
                      {paymentConfig?.vnpay?.enabled !== false && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('vnpay')}
                          className={`p-2.5 rounded-2xl border text-center font-bold transition ${paymentMethod === 'vnpay' ? 'bg-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-500/40' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'}`}
                        >
                          <i className="fa-solid fa-credit-card mb-1 text-sm block"></i>
                          <div>Cổng VNPAY-QR</div>
                          <div className={`text-[10px] font-semibold mt-0.5 ${paymentMethod === 'vnpay' ? 'text-blue-100' : 'text-slate-400'}`}>Thẻ ATM & Quốc tế</div>
                        </button>
                      )}
                    </div>

                    {isGuest && (
                      <div className="text-[11px] text-slate-300 mt-2.5 flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/70">
                        <i className="fa-solid fa-circle-info text-blue-400 text-xs"></i>
                        <span>Quý khách đang đăng tin với tư cách <strong>Khách vãng lai</strong>. Hệ thống đã lược bỏ Ví tài khoản và cung cấp 3 cổng thanh toán trực tiếp để kích hoạt tin đăng tức thì.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                Quay lại
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 shadow-sm hover:shadow"
                title="Xem trước giao diện tin rao trên website"
              >
                <i className="fa-regular fa-eye text-indigo-600"></i>
                <span>Xem trước tin rao</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  Tiếp tục bước {step + 1}
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl text-sm font-black transition shadow-xl flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white cursor-pointer"
                >
                  <i className="fa-solid fa-check-circle text-base"></i>
                  {finalCost === 0 
                    ? 'Xác Nhận Xuất Bản Tin Miễn Phí (0 đ)' 
                    : `Xác Nhận Thanh Toán & Đăng Tin (${finalCost.toLocaleString('vi-VN')} đ)`}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Checkout Modal Popup for VietQR / MoMo / VNPAY */}
        {/* Checkout Modal Popup with Real-Time Auto-Polling & Webhook Detection */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg transition-colors ${
                    paymentPollingState === 'success'
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                      : paymentPollingState === 'verifying'
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                      : 'bg-gradient-to-tr from-red-600 to-rose-600'
                  }`}>
                    <i className={
                      paymentPollingState === 'success'
                        ? 'fa-solid fa-check'
                        : paymentPollingState === 'verifying'
                        ? 'fa-solid fa-spinner fa-spin'
                        : paymentMethod === 'vietqr'
                        ? 'fa-solid fa-qrcode'
                        : paymentMethod === 'momo'
                        ? 'fa-solid fa-mobile-screen-button'
                        : 'fa-solid fa-credit-card'
                    }></i>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-red-400 font-extrabold flex items-center gap-2">
                      <span>Cổng Thanh Toán Napas 24/7</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-400 font-mono text-[10px] lowercase">live polling</span>
                    </div>
                    <h3 className="text-base font-black text-white">
                      {paymentMethod === 'vietqr' ? 'Quét Mã VietQR Chuyển Khoản' : paymentMethod === 'momo' ? 'Thanh Toán Ví MoMo' : 'Cổng Trực Tuyến VNPAY'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 font-bold">
                    {Math.floor(checkoutCountdown / 60)}:{String(checkoutCountdown % 60).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    disabled={paymentPollingState === 'verifying' || paymentPollingState === 'success'}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* 1. Live Polling & Webhook Radar Card */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                  paymentPollingState === 'verifying'
                    ? 'bg-amber-500/10 border-amber-400 text-amber-950'
                    : paymentPollingState === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400'
                    : paymentPollingState === 'expired'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-blue-200 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Animated Radar Indicator */}
                      <div className="relative flex items-center justify-center">
                        {paymentPollingState === 'waiting' && (
                          <>
                            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60"></span>
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-md">
                              <i className="fa-solid fa-satellite-dish animate-pulse"></i>
                            </div>
                          </>
                        )}
                        {paymentPollingState === 'verifying' && (
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md animate-spin">
                            <i className="fa-solid fa-spinner"></i>
                          </div>
                        )}
                        {paymentPollingState === 'success' && (
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-md animate-bounce">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                        {paymentPollingState === 'expired' && (
                          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-black uppercase tracking-wide flex items-center gap-2">
                          {paymentPollingState === 'waiting' && (
                            <span className="text-blue-700 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                              Đang Lắng Nghe Webhook Ngân Hàng Napas 24/7
                            </span>
                          )}
                          {paymentPollingState === 'verifying' && (
                            <span className="text-amber-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-spin"></span>
                              Đã Nhận Tín Hiệu! Đang Khớp Tiền & Kích Hoạt...
                            </span>
                          )}
                          {paymentPollingState === 'success' && (
                            <span className="text-emerald-700 flex items-center gap-1.5 font-black text-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                              ĐÃ KHỚP THANH TOÁN THÀNH CÔNG!
                            </span>
                          )}
                          {paymentPollingState === 'expired' && (
                            <span className="text-rose-700">Phiên thanh toán đã hết hạn</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {paymentPollingState === 'waiting' && (
                            <span>Tự động quét biến động số dư (Lần kiểm tra #{pollingCount}) • Nhận diện ngay sau 1-2s</span>
                          )}
                          {paymentPollingState === 'verifying' && (
                            <span className="text-amber-900 font-semibold">Tài khoản đã nhận +{finalCost.toLocaleString('vi-VN')} đ • Đang chuyển trang...</span>
                          )}
                          {paymentPollingState === 'success' && (
                            <span className="text-emerald-800 font-bold">Hoàn tất! Tin đăng đã được tiếp nhận và kích hoạt cơ chế duyệt tự động.</span>
                          )}
                          {paymentPollingState === 'expired' && (
                            <span>Vui lòng tải lại hoặc tạo phiên chuyển khoản mới.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end text-right">
                      <span className="text-[10px] text-slate-500 font-medium">Mã giao dịch:</span>
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {checkoutOrderId}
                      </span>
                    </div>
                  </div>

                  {/* Auto-Demo Progress Bar */}
                  {paymentPollingState === 'waiting' && autoDemoEnabled && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 font-medium flex items-center gap-1.5">
                          <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
                          <span>Auto-Demo: Tự động giả lập khớp tiền sau <strong>{autoDemoTimer}s</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAutoDemoEnabled(false)}
                          className="text-[10px] text-slate-500 hover:text-slate-700 underline"
                        >
                          Tắt tự động
                        </button>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${Math.max(0, Math.min(100, ((8 - autoDemoTimer) / 8) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Order Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Dịch vụ đăng tin:</span>
                    <strong className="text-slate-900">{selectedPkg.name} ({listingDays} ngày)</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Người đăng tin:</span>
                    <strong className="text-slate-900">{formData.contactName || 'Khách vãng lai'} ({formData.contactPhone || 'Chưa có SĐT'})</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-sm font-black text-red-600">
                    <span>Tổng tiền thanh toán:</span>
                    <span>{finalCost.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {/* 3. VietQR View */}
                {paymentMethod === 'vietqr' && (
                  <div className="text-center space-y-3">
                    <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-blue-300 inline-block shadow-sm">
                      <img
                        src={`https://img.vietqr.io/image/${paymentConfig?.vietqr?.bankBin || '970422'}-${paymentConfig?.vietqr?.accountNumber || '0898246607'}-compact2.png?amount=${finalCost}&addInfo=${encodeURIComponent((paymentConfig?.vietqr?.syntaxPrefix || 'DBDN') + ' ' + (checkoutOrderId || formData.contactPhone?.replace(/\s+/g, '') || '0901234567'))}&accountName=${encodeURIComponent(paymentConfig?.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG')}`}
                        alt="VietQR Chuyển Khoản"
                        className="w-56 h-56 mx-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BDS%20THANH%20TOAN';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-blue-700 font-bold">
                      <i className="fa-solid fa-camera mr-1"></i>
                      Mở app Ngân hàng (MB, VCB, BIDV, VPBank, Techcom...) quét mã để tự điền số tiền & nội dung
                    </div>

                    {/* Transfer Details Card with Copy Buttons */}
                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                        <strong className="text-slate-800">{paymentConfig?.vietqr?.bankName || 'MBBank (Ngân Hàng Quân Đội)'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span>{paymentConfig?.vietqr?.accountNumber || '0898246607'}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentConfig?.vietqr?.accountNumber || '0898246607', 'Số tài khoản')}
                            className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-[10px] font-sans font-bold"
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Chủ tài khoản:</span>
                        <strong className="text-slate-800">{paymentConfig?.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Số tiền:</span>
                        <div className="flex items-center gap-1.5 font-bold text-red-600">
                          <span>{finalCost.toLocaleString('vi-VN')} đ</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(finalCost), 'Số tiền')}
                            className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[10px] font-sans font-bold"
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Cú pháp chuyển khoản:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600">
                          <span>{(paymentConfig?.vietqr?.syntaxPrefix || 'BDS')} {checkoutOrderId || (formData.contactPhone?.replace(/\s+/g, '') || '0901234567')}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${(paymentConfig?.vietqr?.syntaxPrefix || 'BDS')} ${checkoutOrderId || (formData.contactPhone?.replace(/\s+/g, '') || '0901234567')}`, 'Cú pháp')}
                            className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-[10px] font-sans font-bold"
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MoMo View */}
                {paymentMethod === 'momo' && (
                  <div className="text-center space-y-3">
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200 text-xs text-pink-900 space-y-2 text-left">
                      <div className="font-bold flex items-center gap-2 text-pink-800 text-sm">
                        <i className="fa-solid fa-mobile-screen-button"></i>
                        Thanh toán qua Ví MoMo
                      </div>
                      <div>Số MoMo nhận tiền: <strong className="font-mono text-base text-slate-900">{paymentConfig?.momo?.phoneNumber || '0898246607'}</strong></div>
                      <div>Tên chủ ví: <strong>{paymentConfig?.momo?.accountName || 'NGUYEN VAN QUAN TRI'}</strong></div>
                      <div>Nội dung CK: <strong className="font-mono text-pink-700">{(paymentConfig?.vietqr?.syntaxPrefix || 'BDS')} {checkoutOrderId || (formData.contactPhone?.replace(/\s+/g, '') || '0901234567')}</strong></div>
                    </div>
                  </div>
                )}

                {/* VNPAY View */}
                {paymentMethod === 'vnpay' && (
                  <div className="text-center space-y-3">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-2 text-left">
                      <div className="font-bold flex items-center gap-2 text-blue-800 text-sm">
                        <i className="fa-solid fa-credit-card"></i>
                        Cổng VNPAY Sandbox / ATM Nội Địa & Quốc Tế
                      </div>
                      <div>Mã định danh đơn hàng: <strong className="font-mono text-slate-900">{checkoutOrderId || `VNP-${Date.now().toString().slice(-6)}`}</strong></div>
                      <div>TMN Code: <strong className="font-mono text-slate-900">{paymentConfig?.vnpay?.tmnCode || 'DATBIENDANANG'}</strong></div>
                      <div>Số tiền: <strong className="text-red-600 font-bold">{finalCost.toLocaleString('vi-VN')} đ</strong></div>
                    </div>
                  </div>
                )}

                {/* 4. Real-time Confirmation Note theo cấp độ tin đăng */}
                <div className={`p-3.5 rounded-2xl border text-[11px] flex items-start gap-2.5 ${
                  selectedPkg.id === 'vip-diamond' 
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : selectedPkg.id === 'vip-gold'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : selectedPkg.id === 'vip-silver'
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  <i className={`mt-0.5 text-sm ${
                    selectedPkg.id === 'vip-diamond'
                      ? 'fa-solid fa-bolt text-red-600'
                      : selectedPkg.id === 'vip-gold'
                      ? 'fa-solid fa-clock-rotate-left text-amber-600'
                      : selectedPkg.id === 'vip-silver'
                      ? 'fa-solid fa-clock-rotate-left text-blue-600'
                      : 'fa-solid fa-list-ol text-slate-600'
                  }`}></i>
                  <div>
                    {selectedPkg.id === 'vip-diamond' && (
                      <div>
                        <strong className="text-red-700">Đặc quyền VIP Kim Cương: Duyệt Tức Thì tự động (Active ngay).</strong> Ngay sau khi Webhook/Polling xác nhận tiền vào, tin đăng <strong>kích hoạt xuất bản tức thì</strong> lên đầu trang chủ và kết quả tìm kiếm!
                      </div>
                    )}
                    {selectedPkg.id === 'vip-gold' && (
                      <div>
                        <strong className="text-amber-800">Đặc quyền VIP Vàng: Hàng đợi Ưu Tiên Sớm (15 phút).</strong> Sau khi khớp tiền, tin đăng vào hàng đợi ưu tiên cao và <strong>tự động phê duyệt sau 15 phút</strong> (hoặc Admin duyệt ngay)!
                      </div>
                    )}
                    {selectedPkg.id === 'vip-silver' && (
                      <div>
                        <strong className="text-blue-800">Đặc quyền VIP Bạc: Hàng đợi Ưu Tiên Sớm (30 phút).</strong> Tin được ưu tiên duyệt và xuất bản trước toàn bộ tin thường, <strong>tự động duyệt sau 30 phút</strong>.
                      </div>
                    )}
                    {selectedPkg.id === 'normal' && (
                      <div>
                        <strong className="text-slate-800">Hàng Đợi Tiêu Chuẩn FIFO (Tự Động 1 Tiếng):</strong> Hệ thống đã nhận thanh toán, tin đăng được xếp vào hàng đợi tiêu chuẩn và sẽ <strong>tự động xuất bản trong vòng 1 tiếng</strong> (hoặc ban quản trị duyệt sớm).
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  disabled={paymentPollingState === 'verifying' || paymentPollingState === 'success'}
                  className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300"
                >
                  Quay lại sửa tin
                </button>

                <div className="flex items-center gap-2">
                  {/* Nút Giả lập Webhook khớp tiền ngay cho Test */}
                  {paymentPollingState === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => triggerMockWebhook(checkoutOrderId)}
                      disabled={isTriggeringWebhook}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
                      title="Mô phỏng Webhook Ngân hàng gửi tín hiệu đã nhận tiền"
                    >
                      <i className={`fa-solid ${isTriggeringWebhook ? 'fa-spinner fa-spin' : 'fa-bolt text-amber-300'}`}></i>
                      <span>{isTriggeringWebhook ? 'Đang gửi Webhook...' : '⚡ Khớp Tiền Ngay (Test Webhook)'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConfirmPaymentAndPublish(checkoutOrderId)}
                    disabled={paymentPollingState === 'verifying' || paymentPollingState === 'success'}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-circle-check text-sm"></i>
                    {paymentPollingState === 'success' || paymentPollingState === 'verifying' 
                      ? 'Đang Kích Hoạt...' 
                      : 'Tôi Đã Chuyển Khoản Xong'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal Dialog after publishing */}
        {publishedProperty && (
          <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-center">
              {/* Header Box based on Tier */}
              <div className={`p-6 bg-gradient-to-b flex flex-col items-center ${
                publishedProperty.status === 'active'
                  ? 'from-red-500/10 to-transparent'
                  : publishedProperty.vipPackageId === 'vip-gold'
                  ? 'from-amber-500/10 to-transparent'
                  : publishedProperty.vipPackageId === 'vip-silver'
                  ? 'from-blue-500/10 to-transparent'
                  : 'from-slate-500/10 to-transparent'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-lg ring-8 ${
                  publishedProperty.status === 'active'
                    ? 'bg-red-100 text-red-600 ring-red-50'
                    : publishedProperty.vipPackageId === 'vip-gold'
                    ? 'bg-amber-100 text-amber-600 ring-amber-50'
                    : publishedProperty.vipPackageId === 'vip-silver'
                    ? 'bg-blue-100 text-blue-600 ring-blue-50'
                    : 'bg-slate-100 text-slate-700 ring-slate-50'
                }`}>
                  <i className={
                    publishedProperty.status === 'active'
                      ? 'fa-solid fa-bolt'
                      : publishedProperty.vipPackageId === 'vip-gold' || publishedProperty.vipPackageId === 'vip-silver'
                      ? 'fa-solid fa-clock-rotate-left'
                      : 'fa-solid fa-list-check'
                  }></i>
                </div>

                <div className={`text-xs font-black uppercase tracking-wider mb-1 ${
                  publishedProperty.status === 'active'
                    ? 'text-red-600'
                    : publishedProperty.vipPackageId === 'vip-gold'
                    ? 'text-amber-600'
                    : publishedProperty.vipPackageId === 'vip-silver'
                    ? 'text-blue-600'
                    : 'text-slate-600'
                }`}>
                  {publishedProperty.status === 'active' 
                    ? 'Thanh Toán Thành Công • Duyệt Tức Thì (Active Ngay)'
                    : publishedProperty.vipPackageId === 'vip-gold'
                    ? 'Thanh Toán Thành Công • Ưu Tiên Sớm (15 Phút)'
                    : publishedProperty.vipPackageId === 'vip-silver'
                    ? 'Thanh Toán Thành Công • Ưu Tiên Sớm (30 Phút)'
                    : 'Thanh Toán Thành Công • Hàng Đợi Tiêu Chuẩn FIFO (Tự Động Xuất Bản 1 Tiếng)'}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {publishedProperty.status === 'active' 
                    ? 'Tin VIP Kim Cương Đã Kích Hoạt!'
                    : `Tiếp Nhận Tin Đăng ${selectedPkg.name}!`}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                  {publishedProperty.status === 'active' 
                    ? `Hệ thống đã nhận thanh toán qua ${publishedProperty.paymentMethod}. Tin đăng được kích hoạt hiển thị ngay lập tức trên website!`
                    : publishedProperty.vipPackageId === 'vip-gold'
                    ? `Đã nhận thanh toán qua ${publishedProperty.paymentMethod}. Tin được xếp vào Hàng Đợi Ưu Tiên Sớm và sẽ tự động kích hoạt tối đa sau 15 phút (hoặc Admin duyệt ngay).`
                    : publishedProperty.vipPackageId === 'vip-silver'
                    ? `Đã nhận thanh toán qua ${publishedProperty.paymentMethod}. Tin được xếp vào Hàng Đợi Ưu Tiên Sớm và sẽ tự động kích hoạt tối đa sau 30 phút.`
                    : `Đã nhận thanh toán qua ${publishedProperty.paymentMethod}. Tin được xếp vào Hàng Đợi Tiêu Chuẩn FIFO và sẽ tự động xuất bản trong vòng 1 tiếng (hoặc Ban quản trị duyệt sớm).`}
                </p>
              </div>

              {/* Property Info Box */}
              <div className="px-6 pb-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mã bài đăng:</span>
                    <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                      {publishedProperty.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Gói hiển thị:</span>
                    <div className="text-right">
                      <strong className="text-amber-600 font-bold">{selectedPkg.name} ({listingDays} ngày)</strong>
                      {selectedPkg.id !== 'normal' && (
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          🎁 Hết hạn VIP tự động chuyển Tin Thường + 60 ngày
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cơ chế phê duyệt:</span>
                    {publishedProperty.status === 'active' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        ⚡ Duyệt Tức Thì (Active Ngay)
                      </span>
                    ) : publishedProperty.vipPackageId === 'vip-gold' ? (
                      <span className="bg-amber-100 text-amber-800 font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                        <i className="fa-solid fa-clock text-amber-600 text-[10px]"></i>
                        ⏱ Ưu Tiên Sớm (Tự động active trong 15p)
                      </span>
                    ) : publishedProperty.vipPackageId === 'vip-silver' ? (
                      <span className="bg-blue-100 text-blue-800 font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                        <i className="fa-solid fa-clock text-blue-600 text-[10px]"></i>
                        ⏱ Ưu Tiên Sớm (Tự động active trong 30p)
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-800 font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                        <i className="fa-solid fa-clock-rotate-left text-slate-600 text-[10px]"></i>
                        📋 Hàng Đợi Tiêu Chuẩn FIFO (Tự động 1 tiếng)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Người liên hệ:</span>
                    <strong className="text-slate-800">{publishedProperty.author?.name} ({publishedProperty.author?.phone})</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-slate-500 text-[11px]">Tiêu đề tin đăng:</div>
                    <div className="font-bold text-slate-900 mt-0.5 line-clamp-2">
                      {publishedProperty.title}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-100 border-t border-slate-200 flex flex-col gap-2.5">
                {publishedProperty.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const targetProp = publishedProperty;
                      setPublishedProperty(null);
                      if (onClose) onClose();
                      navigateToProperty(targetProp);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    Xem Tin Đăng Của Bạn Ngay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishedProperty(null);
                      if (onClose) onClose();
                      navigate('/quan-ly-tin');
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-list-check"></i>
                    Theo Dõi Trạng Thái Trong Quản Lý Tin
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPublishedProperty(null);
                      if (onClose) onClose();
                      navigate('/');
                    }}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300"
                  >
                    Về Trang Chủ
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPublishedProperty(null);
                      if (onClose) onClose();
                      navigate('/quan-ly-tin');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Quản Lý Tin Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW MODAL OVERLAY */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[75] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div 
              className="relative bg-slate-100 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Top Header */}
              <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-sm font-bold">
                    <i className="fa-regular fa-eye animate-pulse"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Chế Độ Xem Trước Tin Đăng</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                        {previewProperty.vipPackage?.name || 'Tin Thường'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mô phỏng chính xác giao diện hiển thị trên website khi xuất bản
                    </div>
                  </div>
                </div>

                {/* Switch View Mode: Chi Tiết vs Thẻ Tin Tìm Kiếm */}
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('detail')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      previewViewMode === 'detail'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-regular fa-file-lines"></i>
                    <span>Trang Chi Tiết</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('card')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      previewViewMode === 'card'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-table-cells"></i>
                    <span>Thẻ Tin Tìm Kiếm</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                  title="Đóng chế độ xem trước"
                >
                  <span>Quay lại soạn tin</span>
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Preview Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {previewViewMode === 'card' ? (
                  /* ================= MODE: THẺ TIN TÌM KIẾM ================= */
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                      <i className="fa-solid fa-circle-info text-amber-600 text-lg mt-0.5"></i>
                      <div className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-amber-900">Giao diện hiển thị trong kết quả tìm kiếm:</strong> Khách hàng khi tìm kiếm bất động sản tại <strong>{previewProperty.location.province}</strong> sẽ nhìn thấy tin đăng của bạn với giao diện như bên dưới.
                        {selectedVipId === 'vip-diamond' && (
                          <div className="mt-1 text-red-700 font-bold">
                            ★ Gói <strong>VIP Kim Cương</strong> của bạn có viền kim sa vàng phát sáng, huy hiệu sao kim cương và luôn ghim ở vị trí Top 1 trên website (gấp 30 lần lượt liên hệ)!
                          </div>
                        )}
                        {selectedVipId === 'vip-gold' && (
                          <div className="mt-1 text-amber-800 font-bold">
                            🥇 Gói <strong>VIP Vàng</strong> đóng khung vàng sang trọng, tiêu đề nổi bật, đứng ngay sau VIP Kim Cương (gấp 15 lần lượt liên hệ).
                          </div>
                        )}
                        {selectedVipId === 'vip-silver' && (
                          <div className="mt-1 text-blue-800 font-bold">
                            🥈 Gói <strong>VIP Bạc</strong> có viền bạc ánh kim, tiêu đề xanh hiện đại, đứng trên toàn bộ Tin Thường.
                          </div>
                        )}
                        {selectedVipId === 'normal' && (
                          <div className="mt-1 text-slate-600 font-semibold">
                            📋 <strong>Tin Thường</strong> hiển thị theo thứ tự tiêu chuẩn FIFO, tiết kiệm chi phí tối đa.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dạng thẻ lưới */}
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
                        <i className="fa-solid fa-grip text-red-600"></i>
                        <span>1. Dạng Thẻ Lưới (Grid View - Hiển thị 2-4 cột trên Trang Chủ & Danh Mục)</span>
                      </div>
                      <div className="max-w-md mx-auto">
                        <ListingCard property={previewProperty} viewMode="grid" />
                      </div>
                    </div>

                    {/* Dạng thẻ danh sách */}
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
                        <i className="fa-solid fa-bars text-red-600"></i>
                        <span>2. Dạng Thẻ Danh Sách Ngang (List View - Hiển thị trên Bộ Lọc Tìm Kiếm Chuyên Sâu)</span>
                      </div>
                      <div className="max-w-4xl mx-auto">
                        <ListingCard property={previewProperty} viewMode="list" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= MODE: TRANG CHI TIẾT ĐẦY ĐỦ ================= */
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>Bất động sản</span>
                      <i className="fa-solid fa-chevron-right text-[9px] text-slate-400"></i>
                      <span>{previewProperty.category === 'rent' ? 'Cho thuê' : 'Bán'}</span>
                      <i className="fa-solid fa-chevron-right text-[9px] text-slate-400"></i>
                      <span className="font-semibold text-slate-700">{previewProperty.location.province}</span>
                      <i className="fa-solid fa-chevron-right text-[9px] text-slate-400"></i>
                      <span className="font-semibold text-slate-700">{previewProperty.location.district}</span>
                      {previewProperty.location.project && (
                        <>
                          <i className="fa-solid fa-chevron-right text-[9px] text-slate-400"></i>
                          <span className="font-semibold text-red-600">{previewProperty.location.project}</span>
                        </>
                      )}
                    </div>

                    {/* Header: Title & Badges */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${previewProperty.vipPackage?.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                          {previewProperty.vipPackage?.shortName || 'TIN THƯỜNG'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                          Mã tin: <strong>BDS-PREVIEW</strong>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          {previewProperty.typeName}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                          <i className="fa-regular fa-clock"></i>
                          <span>Vừa mới đăng</span>
                        </span>
                      </div>

                      <h1 className={`text-xl sm:text-2xl font-black text-slate-900 leading-snug ${selectedVipId === 'vip-diamond' ? 'text-red-600 uppercase' : selectedVipId === 'vip-gold' ? 'text-amber-800' : ''}`}>
                        {previewProperty.title}
                      </h1>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                        <i className="fa-solid fa-location-dot text-red-600"></i>
                        <span>{previewProperty.address}</span>
                      </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="space-y-3">
                      <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                        <img
                          src={previewProperty.images[previewPhotoIndex] || previewProperty.images[0]}
                          alt={previewProperty.title}
                          className="w-full h-full object-cover transition duration-300"
                        />
                        {previewProperty.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoIndex((prev) => (prev > 0 ? prev - 1 : previewProperty.images.length - 1))}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition shadow-lg"
                            >
                              <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoIndex((prev) => (prev < previewProperty.images.length - 1 ? prev + 1 : 0))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition shadow-lg"
                            >
                              <i className="fa-solid fa-chevron-right"></i>
                            </button>
                          </>
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                          <i className="fa-regular fa-image"></i>
                          <span>{previewPhotoIndex + 1} / {previewProperty.images.length} hình ảnh</span>
                        </div>
                      </div>

                      {/* Thumbnail strip */}
                      {previewProperty.images.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {previewProperty.images.map((img, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setPreviewPhotoIndex(idx)}
                              className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                                previewPhotoIndex === idx
                                  ? 'border-red-600 ring-2 ring-red-500/30'
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Mức Giá</div>
                        <div className="text-base sm:text-lg font-black text-red-600 mt-0.5">{previewProperty.priceDisplay}</div>
                        {previewProperty.pricePerM2 && previewProperty.priceType !== 'deal' && (
                          <div className="text-[10px] text-slate-500">{previewProperty.pricePerM2}</div>
                        )}
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Diện Tích</div>
                        <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{previewProperty.area} m²</div>
                        <div className="text-[10px] text-slate-500">Mặt sàn sử dụng</div>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Phòng Ngủ</div>
                        <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{previewProperty.bedrooms} PN</div>
                        <div className="text-[10px] text-slate-500">Thông thoáng</div>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Phòng Tắm</div>
                        <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">{previewProperty.bathrooms} WC</div>
                        <div className="text-[10px] text-slate-500">Thiết bị cao cấp</div>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Hướng Nhà</div>
                        <div className="text-sm font-black text-slate-800 mt-1">{previewProperty.direction || 'Đông Nam'}</div>
                        <div className="text-[10px] text-slate-500">Ban công: {previewProperty.balconyDirection || 'Đông Nam'}</div>
                      </div>

                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Pháp Lý</div>
                        <div className="text-sm font-black text-slate-800 mt-1 truncate" title={previewProperty.juridical}>
                          {previewProperty.juridical || 'Sổ hồng'}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">Minh bạch</div>
                      </div>
                    </div>

                    {/* 2-Column Section: Main Info & Author Contact */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Description, Specs, Amenities */}
                      <div className="lg:col-span-8 space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-base font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-3">
                            Thông Tin Mô Tả
                          </h3>
                          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                            {previewProperty.description}
                          </div>
                        </div>

                        {/* Specs Table */}
                        <div>
                          <h3 className="text-base font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-3">
                            Đặc Điểm Bất Động Sản
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Diện tích:</span>
                              <strong className="text-slate-900">{previewProperty.area} m²</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Mức giá:</span>
                              <strong className="text-red-600 font-bold">{previewProperty.priceDisplay}</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Số phòng ngủ:</span>
                              <strong className="text-slate-900">{previewProperty.bedrooms} phòng</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Số toilet / WC:</span>
                              <strong className="text-slate-900">{previewProperty.bathrooms} phòng</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Hướng nhà:</span>
                              <strong className="text-slate-900">{previewProperty.direction || 'Đông Nam'}</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Hướng ban công:</span>
                              <strong className="text-slate-900">{previewProperty.balconyDirection || 'Đông Nam'}</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Tầng số:</span>
                              <strong className="text-slate-900">{previewProperty.floor || 'Tầng trung'}</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-500">Tình trạng nội thất:</span>
                              <strong className="text-slate-900">{previewProperty.interior || 'Đầy đủ nội thất'}</strong>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                              <span className="text-slate-500">Giấy tờ pháp lý:</span>
                              <strong className="text-emerald-700 font-bold">{previewProperty.juridical || 'Sổ hồng lâu dài'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        {previewProperty.amenities && previewProperty.amenities.length > 0 && (
                          <div>
                            <h3 className="text-base font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-3">
                              Tiện Ích Nổi Bật
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {previewProperty.amenities.map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5"
                                >
                                  <i className="fa-solid fa-check text-emerald-600 text-[10px]"></i>
                                  <span>{amenity}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Disclaimer */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                          <strong className="text-slate-700">Miễn trừ trách nhiệm:</strong> Thông tin tin rao do Người đăng tin cung cấp và chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp. Quý vị vui lòng chủ động kiểm tra, thẩm định thông tin pháp lý và thực tế trước khi giao dịch.
                        </div>
                      </div>

                      {/* Right: Author / Broker Card */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                          <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                            Người Đăng Tin
                          </div>

                          <div className="flex items-center gap-3">
                            <img
                              src={previewProperty.author.avatar}
                              alt={previewProperty.author.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/50 shadow"
                            />
                            <div>
                              <div className="font-black text-base text-white flex items-center gap-1.5">
                                <span>{previewProperty.author.name}</span>
                                {previewProperty.author.isVerified && (
                                  <i className="fa-solid fa-circle-check text-emerald-400 text-xs" title="Đã xác thực"></i>
                                )}
                              </div>
                              <div className="text-xs text-amber-300 font-semibold mt-0.5">
                                {previewProperty.author.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Hotline / Zalo chính chủ
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                            >
                              <i className="fa-solid fa-phone"></i>
                              <span>{previewProperty.author.phone} • Gọi Ngay</span>
                            </button>

                            <button
                              type="button"
                              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                            >
                              <i className="fa-solid fa-comment-dots"></i>
                              <span>Chat qua Zalo</span>
                            </button>
                          </div>

                          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                              <i className="fa-solid fa-shield-halved text-xs"></i>
                              <span>Bảo Mật & Minh Bạch</span>
                            </div>
                            <p className="text-slate-400 leading-snug">
                              Khách hàng quan tâm sẽ liên hệ trực tiếp với bạn qua số điện thoại này. Không phát sinh chi phí trung gian.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Control Bar */}
              <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-600">
                  Đang xem trước gói: <strong className="text-slate-900">{previewProperty.vipPackage?.name}</strong> • Thời hạn: <strong className="text-slate-900">{listingDays} ngày</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Quay lại chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewOpen(false);
                      setStep(4);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-black transition shadow flex items-center gap-1.5"
                  >
                    <span>Đến bước Thanh toán & Xuất bản</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

  if (isEmbedded) {
    return modalInnerContent;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {modalInnerContent}
    </div>
  );
}
