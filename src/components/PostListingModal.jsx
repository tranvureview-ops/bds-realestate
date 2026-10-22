'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter } from '../router/RouterContext';
import { LOCATIONS, PROPERTY_TYPES, VIP_PACKAGES, MEMBERSHIP_PACKAGES } from '../data/mockData';
import BatdongsanListingSelector, { BATDONGSAN_RATES } from './BatdongsanListingSelector';
import CustomSelect from './CustomSelect';
import ListingCard from './ListingCard';
import ListingLocationMap from './ListingLocationMap';

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

// Mẫu nội dung mô tả chuẩn SEO chuẩn Batdongsan.com.vn & AloNhaDat
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
function formatPriceToVietnameseText(num) {
  if (!num || num <= 0) return 'Thỏa thuận';
  if (num >= 1000000000) {
    const ty = Math.floor(num / 1000000000);
    const trieu = Math.round((num % 1000000000) / 1000000);
    return trieu > 0 ? `${ty} tỷ ${trieu} triệu` : `${ty} tỷ`;
  } else if (num >= 1000000) {
    const trieu = Math.round(num / 1000000);
    return `${trieu} triệu`;
  }
  return `${num.toLocaleString('vi-VN')} đ`;
}

export default function PostListingModal({ onClose, isEmbedded = false }) {
  const { currentUser, addProperty, showToast, preselectedListingType, setPreselectedListingType, paymentConfig, navigateToProperty } = useRealEstate();
  const { navigate } = useRouter();

  const isGuest = !currentUser || currentUser.role === 'guest' || currentUser.id === 'guest';

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

  // Form State đầy đủ theo chuẩn Batdongsan.com.vn & AloNhaDat
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
    selectedAddressType: 'old', // Mặc định là 'old' - Yêu cầu người dùng phải kích chọn 'new' mới được tiếp tục
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
    contactName: (!isGuest && currentUser?.name) ? currentUser.name : 'Nguyễn Văn Tuấn',
    contactPhone: (!isGuest && currentUser?.phone) ? currentUser.phone : '0908 123 456',
    contactEmail: (!isGuest && currentUser?.email) ? currentUser.email : 'khach.bds@datbiendanang.vn',
    contactAddress: (!isGuest && currentUser?.address) ? currentUser.address : 'TP. Đà Nẵng'
  });

  // Voucher discount calculation
  const hasNormalVoucher = (currentUser?.vouchers?.normalPublish || 0) > 0;
  const hasVipVoucher = (currentUser?.vouchers?.vipPublish || 0) > 0;

  // Listing Type & Billing state - Luôn mặc định là Tin Thường ('normal')
  const defaultListingType = preselectedListingType || 'normal';
  const [selectedVipId, setSelectedVipId] = useState(defaultListingType);
  const [listingDays, setListingDays] = useState(15);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleTime, setScheduleTime] = useState('now');
  const [autoBumpHours, setAutoBumpHours] = useState(['08:00', '19:30']); // Đẩy tin khung giờ vàng
  // Nếu chưa đăng nhập (khách vãng lai), mặc định là VietQR Ngân Hàng
  const [paymentMethod, setPaymentMethod] = useState(!isGuest ? 'wallet' : 'vietqr');
  const [appliedVoucher, setAppliedVoucher] = useState(defaultListingType === 'normal' && hasNormalVoucher ? 'normalPublish' : null);

  // Đồng bộ loại tin nếu có preselectedListingType thay đổi từ bên ngoài (hoặc mặc định 'normal')
  useEffect(() => {
    if (preselectedListingType) {
      setSelectedVipId(preselectedListingType);
      if (preselectedListingType === 'normal' && hasNormalVoucher) {
        setAppliedVoucher('normalPublish');
      }
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

  // Locations lookup (63 Tỉnh/Thành phố chuẩn Batdongsan)
  const currentCityObj = formData.city ? LOCATIONS.find(l => l.name === formData.city) : null;
  const districtList = currentCityObj?.districts || [];
  const currentDistrictObj = formData.district ? districtList.find(d => d.name === formData.district) : null;
  const wardList = currentDistrictObj?.wards || [];
  const streetList = currentDistrictObj?.streets?.length ? currentDistrictObj.streets : [];
  const projectList = currentDistrictObj?.projects?.length ? currentDistrictObj.projects : (formData.city ? (MOCK_PROJECTS[formData.city] || []) : []);

  // Selected package details
  const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
  const selectedPkg = VIP_PACKAGES.find(p => p.id === selectedVipId) || defaultPkg;
  const bdsConfig = BATDONGSAN_RATES[selectedVipId] || BATDONGSAN_RATES['normal'];
  const dailyRate = bdsConfig.rates[listingDays] || bdsConfig.rates[15];
  const autoBumpFee = autoBumpHours.length * 5000 * Math.min(listingDays, 3);
  const totalCost = (dailyRate * listingDays) + autoBumpFee;

  // Smart selection handler with auto voucher recommendation
  const handleSelectPackage = (pkgId) => {
    setSelectedVipId(pkgId);
    if (pkgId === 'normal') {
      if (hasNormalVoucher) {
        setAppliedVoucher('normalPublish');
        showToast('Đã tự động áp dụng Voucher Hội Viên (-35.000 đ): Đăng Tin Thường chỉ 0 đ!', 'success');
      } else {
        setAppliedVoucher(null);
      }
    } else {
      if (appliedVoucher === 'normalPublish') {
        setAppliedVoucher(null);
      }
      if (hasVipVoucher && appliedVoucher !== 'vipPublish') {
        showToast(`Bạn có ${currentUser.vouchers?.vipPublish} Voucher Tin VIP (-400.000 đ). Nhấn Áp dụng để tiết kiệm ngay!`, 'info');
      }
    }
  };

  const voucherDiscount = useMemo(() => {
    if (appliedVoucher === 'normalPublish' && hasNormalVoucher) {
      return Math.min(totalCost, 35000);
    }
    if (appliedVoucher === 'vipPublish' && hasVipVoucher && selectedVipId !== 'normal') {
      return Math.min(totalCost, 400000);
    }
    return 0;
  }, [appliedVoucher, hasNormalVoucher, hasVipVoucher, totalCost, selectedVipId]);
  const finalCost = Math.max(0, totalCost - voucherDiscount);

  // Tính toán và định dạng giá
  const updatePriceCalculations = (newPrice, newPriceType, currentArea) => {
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
          pPerM2 = `${(numPrice / 1000000).toFixed(1)} tr/m²`;
          if (numArea > 0) {
            const totalPrice = numPrice * numArea;
            pDisplay = formatPriceToVietnameseText(totalPrice);
          } else {
            pDisplay = `${(numPrice / 1000000).toFixed(1)} tr/m²`;
          }
        } else {
          // Total price
          pDisplay = formatPriceToVietnameseText(numPrice);
          if (numArea > 0) {
            pPerM2 = `${(numPrice / numArea / 1000000).toFixed(1)} tr/m²`;
          }
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      price: newPriceType === 'deal' ? '' : newPrice,
      priceType: newPriceType,
      priceDisplay: pDisplay,
      pricePerM2: pPerM2
    }));
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
      selectedAddressType: 'old',
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
      selectedAddressType: 'old',
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

    const timer = setTimeout(async () => {
      setIsGeocodingLoading(true);
      const queryAddress = [
        formData.street,
        formData.ward,
        formData.district,
        formData.city
      ].filter(Boolean).join(', ');

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
              const shouldAutoSelectNew = data.isMerged && Boolean(data.newWard);
              const computedNewAddr = data.formatted_address || [prev.street, data.newWard, data.newDistrict, data.newCity].filter(Boolean).join(', ');
              return {
                ...prev,
                lat: data.lat || prev.lat,
                lng: data.lng || prev.lng,
                google_place_id: data.google_place_id || prev.google_place_id,
                ...(shouldAutoSelectNew ? {
                  selectedAddressType: 'new',
                  isAdministrativeMerged: true,
                  newAddress: computedNewAddr
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
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.city, formData.district, formData.ward, formData.street]);

  // Nhận diện sáp nhập đơn vị hành chính trực tiếp từ Google Maps Geocoding API
  const mergerInfo = useMemo(() => {
    if (!googleGeocodeInfo?.isMerged || !googleGeocodeInfo?.newWard) return null;
    return {
      hasMerger: true,
      oldWard: formData.ward,
      newWard: googleGeocodeInfo.newWard,
      newDistrict: googleGeocodeInfo.newDistrict || formData.district,
      newCity: googleGeocodeInfo.newCity || formData.city,
      lat: googleGeocodeInfo.lat,
      lng: googleGeocodeInfo.lng,
      google_place_id: googleGeocodeInfo.google_place_id,
      resolution: 'Đơn vị hành chính mới đã cập nhật trên bản đồ Google Maps'
    };
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
  const suggestedDistrict = mergerInfo?.newDistrict || displayDistrict;
  const suggestedCity = mergerInfo?.newCity || displayCity;
  const computedSuggestedNewAddress = mergerInfo
    ? [displayStreetPart, suggestedWard, suggestedDistrict, suggestedCity].filter(Boolean).join(', ')
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
    const contactPhone = String(formData.contactPhone || currentUser?.phone || '0908 123 456').trim();
    const contactName = String(formData.contactName || (!isGuestUser && currentUser?.name) || 'Người đăng tin').trim();

    const safeAuthor = (!isGuestUser && currentUser) ? {
      id: currentUser.id,
      name: currentUser.name || contactName,
      title: currentUser.membership ? `${currentUser.membership.packageName}` : (currentUser.role === 'broker' ? 'Môi Giới' : 'Chính chủ'),
      phone: currentUser.phone || contactPhone,
      zalo: String(currentUser.phone || contactPhone).replace(/\s+/g, ''),
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
      zalo: contactPhone.replace(/\s+/g, ''),
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

    const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
    const currentVipPkg = VIP_PACKAGES.find(p => p.id === selectedVipId) || defaultPkg;

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
      priceUnit: formData.priceType === 'deal' ? 'Thỏa thuận' : (formData.priceType === 'm2' ? 'tr/m²' : 'tỷ'),
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
      hasDualListing: selectedVipId === 'vip-diamond',
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
      listingDays,
      autoBumpHours
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

    // 2. Kiểm tra thông tin Bước 2
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
      {/* Header với Tiêu Chuẩn Batdongsan.com.vn & AloNhaDat */}
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
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition"
              title="Đóng cửa sổ"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Persistent Membership & Voucher Status Banner */}
      {currentUser?.membership ? (
        <div className="bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-900 text-white px-5 py-3 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
              <i className="fa-solid fa-crown text-sm"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-300 uppercase tracking-wide">
                  {currentUser.membership.packageName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  Đang kích hoạt
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                Ưu đãi Voucher 30 ngày • Tiết kiệm tới 39% chi phí
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Voucher Đăng Tin Thường:</span>
              <span className="font-black text-emerald-400 text-xs">{currentUser.vouchers?.normalPublish || 0} lượt</span>
            </div>

            <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">Voucher Đẩy Tin:</span>
              <span className="font-black text-amber-300 text-xs">{currentUser.vouchers?.normalBump || 0} lượt</span>
            </div>

            {(currentUser.vouchers?.vipPublish || 0) > 0 && (
              <div className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span className="text-amber-200">Voucher Tin VIP:</span>
                <span className="font-black text-amber-300 text-xs">{currentUser.vouchers.vipPublish} voucher</span>
              </div>
            )}

            <a
              href="/goi-hoi-vien"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-[11px] shadow-sm ml-1 flex items-center gap-1"
            >
              <span>Xem gói</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 px-5 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm shrink-0">
              <i className="fa-solid fa-fire text-amber-950"></i>
            </span>
            <div className="text-slate-800">
              <b className="text-amber-900">Ưu đãi Gói Hội Viên:</b> Tiết kiệm tới <b>39%</b> chi phí & nhận tới <b>50 Voucher đăng tin 0 đ</b> mỗi tháng!
            </div>
          </div>
          <a
            href="/goi-hoi-vien"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-lg text-[11px] shadow-sm transition shrink-0 flex items-center gap-1"
          >
            <span>Đăng Ký Gói Hội Viên</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </div>
      )}

      {/* Wizard Step Tabs Navigation */}
      <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 1 ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 1 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>1</span>
          <span className="hidden sm:inline">Vị Trí & Loại Hình</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 2 ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 2 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>2</span>
          <span className="hidden sm:inline">Bài Viết & Thông Số</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 3 ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 3 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>3</span>
          <span className="hidden sm:inline">Hình Ảnh & VR 360°</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className={`py-3 px-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
            step === 4 ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            step === 4 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
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
                    onClick={() => setFormData(prev => ({ ...prev, demand: 'sale' }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, demand: 'rent' }))}
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
                      onChange={(val) => setFormData(prev => ({
                        ...prev,
                        ward: val,
                        selectedAddressType: 'old',
                        isAdministrativeMerged: false,
                        newAddress: ''
                      }))}
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

                        {/* 3. Khối so sánh Địa chỉ cũ & Địa chỉ mới (Chuẩn y hệt ảnh gốc Batdongsan) */}
                        <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3">
                          {/* 1. Địa chỉ cũ - Có thể click để chọn lại nếu muốn */}
                          <div
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedAddressType: 'old'
                              }));
                            }}
                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                              formData.selectedAddressType === 'old'
                                ? 'bg-white border-slate-800 shadow-xs'
                                : 'border-transparent hover:bg-white/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                <i className="fa-solid fa-location-dot text-slate-900 text-sm"></i>
                                <span>Địa chỉ cũ</span>
                              </div>
                              <div className="text-xs text-slate-800 pl-5 pt-1 font-medium leading-relaxed">
                                {currentOldAddress}
                              </div>
                            </div>
                            <div className="shrink-0 pr-1">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                formData.selectedAddressType === 'old' ? 'border-slate-900' : 'border-slate-300'
                              }`}>
                                {formData.selectedAddressType === 'old' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mũi tên chuyển giao ↓ */}
                          <div className="pl-5 text-slate-300">
                            <i className="fa-solid fa-arrow-down text-sm"></i>
                          </div>

                          {/* 2. Địa chỉ mới - Chuẩn ảnh gốc: Card hồng nhạt viền đỏ */}
                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1.5">
                              <i className="fa-solid fa-location-dot text-red-600 text-sm"></i>
                              <span>Địa chỉ mới</span>
                            </div>

                            {/* Card địa chỉ mới gợi ý chuẩn ảnh user với viền đỏ khi chưa chọn */}
                            <div
                              onClick={() => {
                                const newAddr = computedSuggestedNewAddress || [
                                  displayStreetPart,
                                  suggestedWard,
                                  mergerInfo?.newDistrict || displayDistrict,
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
                                  ? 'bg-white border-slate-800 shadow-xs'
                                  : 'bg-white border-red-500 hover:border-red-600 shadow-xs ring-2 ring-red-500/10'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="text-[11px] font-medium text-slate-500">
                                  Địa chỉ do Google Maps cập nhật sau sáp nhập
                                </div>
                                <div className="text-xs sm:text-sm text-slate-900 leading-snug">
                                  {displayStreetPart ? `${displayStreetPart}, ` : ''}
                                  <strong className="font-extrabold text-slate-950">
                                    {suggestedWard}
                                  </strong>
                                  {(mergerInfo?.newDistrict || displayDistrict) ? `, ${mergerInfo?.newDistrict || displayDistrict}` : ''}
                                  {`, ${mergerInfo?.newCity || displayCity}`}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
                                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                                  <span>Đã đồng bộ đơn vị hành chính mới từ Google Maps</span>
                                </div>
                              </div>

                              <div className="shrink-0 pl-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                  formData.selectedAddressType === 'new' ? 'border-slate-900' : 'border-red-500'
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

                    {/* 4. Chọn vị trí trên bản đồ chuẩn Batdongsan */}
                    <ListingLocationMap
                      city={formData.city}
                      district={mergerInfo?.newDistrict || formData.district}
                      targetCoords={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
                      formattedAddress={
                        formData.selectedAddressType === 'new' && (formData.newAddress || computedSuggestedNewAddress)
                          ? (formData.newAddress || computedSuggestedNewAddress)
                          : (googleGeocodeInfo?.formatted_address || currentOldAddress)
                      }
                      googlePlaceId={formData.google_place_id || googleGeocodeInfo?.google_place_id}
                      isGeocoding={isGeocodingLoading}
                      onLocationChange={(coords) => {
                        setFormData(prev => ({
                          ...prev,
                          lat: coords.lat,
                          lng: coords.lng
                        }));
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
              {/* Tiêu đề tin đăng chuẩn Batdongsan 30-99 ký tự */}
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
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-900 focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              {/* Định giá & Đơn vị tính */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    3. Mức Giá & Diện Tích <span className="text-red-500">*</span>
                  </span>
                  {/* Radio chọn kiểu định giá */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'total'} 
                        onChange={() => updatePriceCalculations(formData.price, 'total', formData.area)} 
                      />
                      <span>Tổng tiền</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'm2'} 
                        onChange={() => updatePriceCalculations(formData.price, 'm2', formData.area)} 
                      />
                      <span>Theo m²</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-type" 
                        checked={formData.priceType === 'deal'} 
                        onChange={() => updatePriceCalculations('', 'deal', formData.area)} 
                      />
                      <span>Thỏa thuận</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {formData.priceType === 'm2' ? 'Giá theo m² (VND/m²)' : 'Số tiền niêm yết (VND)'}
                    </label>
                    <input
                      type="number"
                      disabled={formData.priceType === 'deal'}
                      step="1000000"
                      placeholder={formData.priceType === 'deal' ? 'Giá thỏa thuận' : (formData.priceType === 'm2' ? 'VD: 45000000' : 'VD: 3500000000')}
                      value={formData.priceType === 'deal' ? '' : (formData.price ?? '')}
                      onChange={(e) => updatePriceCalculations(e.target.value === '' ? '' : Number(e.target.value), formData.priceType, formData.area)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 disabled:bg-slate-200"
                    />
                    {formData.priceDisplay ? (
                      <div className="text-[11px] text-emerald-700 font-black mt-1 truncate">
                        = {formData.priceDisplay} {formData.pricePerM2 ? `(${formData.pricePerM2})` : ''}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                        {formData.priceType === 'deal' ? '= Thỏa thuận' : 'Nhập giá để tự động quy đổi'}
                      </div>
                    )}
                  </div>

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
                        updatePriceCalculations(formData.price, formData.priceType, newArea);
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900"
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

              {/* Thông số kỹ thuật chuyên sâu theo chuẩn AloNhaDat & Batdongsan */}
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
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    1. Hình Ảnh Bất Động Sản (Tối thiểu 1 - 20 ảnh) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-600">{formData.images.length} ảnh đã chọn</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Theo thuật toán của hệ thống, bài đăng có từ 4 ảnh thực tế trở lên tăng 250% tỷ lệ người mua liên hệ.
                </p>

                {/* Grid ảnh */}
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
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

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
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm"
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
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm"
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
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Khách Vãng Lai (Chưa đăng nhập)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên liên hệ</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Số điện thoại liên hệ</label>
                      <input
                        type="text"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Lựa chọn Phân Loại Tin Đăng & Thời Hạn Chuẩn 100% Batdongsan.com.vn */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase">
                    {isGuest ? '2. ' : ''}Chọn Loại Tin Đăng & Thời Gian Hiển Thị <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Bảng giá niêm yết theo ngày</span>
                </div>

                <BatdongsanListingSelector
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
                />
              </div>

              {/* Dịch vụ đẩy tin khung giờ vàng tự động */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fa-solid fa-arrow-up-right-dots text-emerald-600"></i>
                    Đẩy tin tự động khung giờ vàng (+5.000đ/lần)
                  </div>
                  <div className="text-[10px] text-slate-500">Giúp bài viết luôn dẫn đầu trong giờ khách truy cập đông nhất</div>
                </div>
                <div className="flex gap-2">
                  {['08:00', '11:30', '14:00', '19:30'].map(hour => {
                    const isSelected = autoBumpHours.includes(hour);
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setAutoBumpHours(autoBumpHours.filter(h => h !== hour));
                          } else {
                            setAutoBumpHours([...autoBumpHours, hour]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Phân Hệ Voucher Hội Viên Môi Giới (Batdongsan Voucher Box) */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black shadow-sm">
                      <i className="fa-solid fa-ticket"></i>
                    </span>
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase">
                        Áp Dụng Voucher Gói Hội Viên
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {currentUser?.membership ? (
                          <span>Gói đang kích hoạt: <b className="text-amber-800">{currentUser.membership.packageName}</b></span>
                        ) : (
                          <span>Chưa kích hoạt Gói Hội Viên</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href="/goi-hoi-vien"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
                  >
                    <span>Xem bảng quyền lợi hội viên</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  </a>
                </div>

                {currentUser?.membership ? (
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
                            showToast('Đã chuyển sang Tin Thường và áp dụng Voucher 35.000 đ (0 đ)!', 'success');
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
                            <span>Voucher Đăng Tin Thường (-35.000 đ)</span>
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

                      {/* Voucher Tin VIP (-400k) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasVipVoucher) {
                            showToast('Gói hội viên của bạn chưa có Voucher Giảm 400.000 đ cho Tin VIP!', 'warning');
                            return;
                          }
                          if (selectedVipId === 'normal') {
                            showToast('Voucher 400k chỉ áp dụng cho các Loại Tin VIP (Kim Cương, Vàng, Bạc)!', 'warning');
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
                            <span>Voucher Tin VIP (-400.000 đ)</span>
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
                              {appliedVoucher === 'normalPublish' ? 'Tin Thường được tài trợ 100% chi phí đăng tin.' : 'Giảm 400.000 đ trực tiếp vào chi phí đăng Loại Tin VIP.'}
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
                        <span>Môi giới tiết kiệm tới 39% chi phí với Gói Hội Viên</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Nhận ngay 15 - 50 voucher giảm 35.000đ đăng tin (0 đ) + voucher đẩy tin 10.000đ mỗi chu kỳ 30 ngày.
                      </div>
                    </div>
                    <a
                      href="/goi-hoi-vien"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs transition shadow shrink-0 flex items-center gap-1.5"
                    >
                      <span>Đăng Ký Gói Hội Viên</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </a>
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
                            MIỄN PHÍ QUA VOUCHER
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
                    {selectedPkg.id === 'vip-diamond' && (
                      <div className="text-amber-300 font-bold">★ Tặng kèm 1 Tin Thường song hành</div>
                    )}
                    {autoBumpHours.length > 0 && (
                      <div className="text-emerald-400">Đẩy tin: {autoBumpHours.length} lần/ngày</div>
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
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">Dư: {((Number(currentUser?.walletBalance) || 0) + (Number(currentUser?.bonusWalletBalance) || 0)).toLocaleString('vi-VN')} đ</div>
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
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">Quét mã QR 24/7</div>
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
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">Thanh toán 1-chạm</div>
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
                          <div className="text-[10px] font-normal text-slate-400 mt-0.5">Thẻ ATM & Quốc tế</div>
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
                  className="px-7 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-sm font-black transition shadow-xl flex items-center gap-2"
                >
                  <i className="fa-solid fa-check-circle text-base"></i>
                  {finalCost === 0 ? 'Xác Nhận Xuất Bản Tin Miễn Phí (0 đ)' : `Xác Nhận Thanh Toán & Đăng Tin (${finalCost.toLocaleString('vi-VN')} đ)`}
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
                    <strong className="text-amber-600 font-bold">{selectedPkg.name} ({listingDays} ngày)</strong>
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

                        {/* Batdongsan Disclaimer */}
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
