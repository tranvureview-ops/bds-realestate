// Bảng phân loại Tin Đăng theo chuẩn Batdongsan.com.vn (https://trogiup.batdongsan.com.vn/docs/tin-dang-bds)
export const LISTING_TYPES = [
  {
    id: 'vip-diamond',
    level: 1,
    name: 'VIP Kim Cương',
    shortName: 'VIP KIM CƯƠNG',
    pricePerDay: 449740,
    rates: { 15: 449740, 30: 337300, 60: 314820 },
    multiplierText: 'x30',
    tagText: 'lượt liên hệ so với tin thường',
    minDays: 15,
    badgeColor: 'badge-diamond',
    badgeText: 'VIP KIM CƯƠNG ★★★★★',
    borderColor: 'border-red-500 shadow-red-200',
    titleClass: 'text-red-600 font-extrabold uppercase text-lg tracking-wide',
    tagClass: 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold',
    approvalType: 'instant',
    approvalTimeMinutes: 0,
    approvalBadge: 'Duyệt tức thì (0s)',
    approvalLabel: 'Duyệt Tức Thì tự động (Active ngay)',
    features: [
      'Vị trí số 1: Luôn đứng đầu tiên trên Trang Chủ & Kết Quả Tìm Kiếm',
      '(*) Duyệt Tức Thì tự động: Kích hoạt hiển thị (Active ngay) lập tức khi thanh toán',
      '(**) Không hiển thị quảng cáo: Trang chi tiết không xuất hiện banner quảng cáo của bên thứ 3',
      '(***) Nhân đôi hiển thị: Tặng kèm 1 Tin Thường hiển thị đồng thời ở kết quả tìm kiếm',
      'Đẩy tin VIP Kim Cương được đẩy MIỄN PHÍ luôn Tin Thường kèm theo',
      'Thẻ hiển thị cực đại (Hero Card), hiệu ứng viền phát sáng',
      'Tỷ lệ tiếp cận khách hàng cao gấp 30 lần tin thường'
    ],
    hasDualListing: true,     // Nhân đôi hiển thị
    hasNoAds: true,           // Không hiển thị quảng cáo
    hasPriorityQueue: true,   // Ưu tiên hiển thị sớm
    recommended: true
  },
  {
    id: 'vip-gold',
    level: 2,
    name: 'VIP Vàng',
    shortName: 'VIP VÀNG',
    pricePerDay: 159960,
    rates: { 15: 159960, 30: 119970, 60: 111970 },
    multiplierText: 'x15',
    tagText: 'lượt liên hệ so với tin thường',
    minDays: 15,
    badgeColor: 'badge-gold',
    badgeText: 'VIP VÀNG ★★★★',
    borderColor: 'border-amber-400 shadow-amber-100',
    titleClass: 'text-amber-600 font-bold uppercase text-base',
    tagClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold',
    approvalType: 'priority',
    approvalTimeMinutes: 15,
    approvalBadge: 'Ưu tiên sớm (15 phút)',
    approvalLabel: 'Ưu tiên sớm (15 phút tự động kích hoạt)',
    features: [
      'Vị trí ưu tiên: Hiển thị ngay dưới VIP Kim Cương',
      '(*) Ưu tiên sớm (15 phút): Tự động phê duyệt sau 15 phút nếu Admin chưa duyệt trước',
      '(**) Không hiển thị quảng cáo: Không xuất hiện banner quảng cáo ở trang chi tiết',
      'Khung viền ánh vàng sang trọng, tiêu đề Chữ In Hoa màu Cam Vàng',
      'Tỷ lệ tiếp cận gấp 15 lần tin thường',
      'Hiển thị số điện thoại to & nút Gọi/Zalo 1-chạm nổi bật'
    ],
    hasDualListing: false,
    hasNoAds: true,
    hasPriorityQueue: true,
    recommended: false
  },
  {
    id: 'vip-silver',
    level: 3,
    name: 'VIP Bạc',
    shortName: 'VIP BẠC',
    pricePerDay: 82490,
    rates: { 15: 82490, 30: 61870, 60: 57740 },
    multiplierText: 'x8',
    tagText: 'lượt liên hệ so với tin thường',
    minDays: 15,
    badgeColor: 'badge-silver',
    badgeText: 'VIP BẠC ★★★',
    borderColor: 'border-blue-400',
    titleClass: 'text-blue-700 font-bold text-base',
    tagClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold',
    approvalType: 'priority',
    approvalTimeMinutes: 30,
    approvalBadge: 'Ưu tiên sớm (30 phút)',
    approvalLabel: 'Ưu tiên sớm (30 phút tự động kích hoạt)',
    features: [
      'Vị trí nổi bật: Hiển thị trên toàn bộ Tin Thường (dưới VIP Vàng)',
      '(*) Ưu tiên sớm (30 phút): Tự động duyệt sau 30 phút, ưu tiên trước tin thường',
      'Gắn huy hiệu VIP Bạc tin cậy, tiêu đề màu xanh đậm hiện đại',
      'Tỷ lệ tiếp cận gấp 8 lần tin thường',
      'Hiển thị đầy đủ thông tin môi giới và thông số BĐS'
    ],
    hasDualListing: false,
    hasNoAds: false,
    hasPriorityQueue: true,
    recommended: false
  },
  {
    id: 'normal',
    level: 4,
    name: 'Tin Thường',
    shortName: 'TIN THƯỜNG',
    pricePerDay: 3320,
    rates: { 15: 3320, 30: 2500, 60: 2330 },
    multiplierText: null,
    tagText: null,
    publishPrice: 35000, // Đăng tin tiêu chuẩn = 35.000 đ
    bumpPrice: 10000,    // Đẩy tin thường = 10.000 đ/lần
    minDays: 15,
    badgeColor: 'bg-slate-200 text-slate-700',
    badgeText: 'TIN THƯỜNG',
    borderColor: 'border-slate-200',
    titleClass: 'text-slate-800 font-medium hover:text-blue-600',
    tagClass: 'bg-slate-500 text-white',
    approvalType: 'countdown_fifo',
    approvalTimeMinutes: 60,
    approvalBadge: 'Hàng đợi FIFO (Tự động 1 tiếng)',
    approvalLabel: 'Hàng đợi tiêu chuẩn FIFO (Tự động xuất bản trong 1 tiếng)',
    features: [
      'Vị trí hiển thị: Nằm sau tất cả các phân hạng Tin VIP (Hiển thị dưới cùng)',
      '(*) Hàng đợi tiêu chuẩn FIFO: Tự động xuất bản trong 1 tiếng (hoặc BQT duyệt sớm)',
      'Phí đăng tin tiêu chuẩn: 35.000 đ/lần (Hội viên áp dụng Voucher giảm 35.000 đ còn 0 đ)',
      'Phí đẩy tin làm mới: 10.000 đ/lần (Hội viên áp dụng Voucher giảm 10.000 đ còn 0 đ)',
      'Đầy đủ thông tin liên hệ, hình ảnh và vị trí bản đồ BĐS',
      'Phù hợp tin đăng dài hạn, tiết kiệm chi phí tối đa (chỉ từ 2.330 đ/ngày)'
    ],
    hasDualListing: false,
    hasNoAds: false,
    hasPriorityQueue: false,
    recommended: false
  }
];

export const VIP_PACKAGES = LISTING_TYPES; // Backward compatibility

// Bảng Gói Hội Viên
export const MEMBERSHIP_PACKAGES = [
  {
    id: 'member-basic',
    name: 'Gói Hội Viên Cơ Bản',
    shortName: 'GÓI CƠ BẢN',
    badge: 'TIẾT KIỆM 31%',
    badgeColor: 'bg-emerald-600 text-white',
    targetAudience: 'Môi giới mới vào nghề hoặc có giỏ hàng nhỏ',
    monthlyPrice: 467000, // 467.000 đ / tháng
    savePercent: 31,
    billingCycles: [
      { months: 1, label: '1 tháng', price: 467000, discount: 0 },
      { months: 3, label: '3 tháng', price: 1330000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', price: 2520000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 15, // 15 voucher giảm 35.000 đ/lần Đăng Tin Thường
      normalPublishDiscount: 35000,
      normalBumpVouchers: 15,    // 15 voucher giảm 10.000 đ/lần Đẩy Tin Thường
      normalBumpDiscount: 10000,
      vipVouchers: 0,
      vipDiscount: 0
    },
    features: [
      '15 voucher giảm 35.000 đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)',
      '15 voucher giảm 10.000 đ/lần Đẩy Tin Thường (mỗi chu kỳ 30 ngày)',
      'Ưu đãi voucher cấp mới định kỳ 30 ngày trong suốt thời hạn gói',
      'Tiết kiệm 31% chi phí so với mua lẻ từng tin đăng',
      'Báo cáo thống kê lượt tương tác cơ bản'
    ],
    recommended: false
  },
  {
    id: 'member-standard',
    name: 'Gói Hội Viên Tiêu Chuẩn',
    shortName: 'GÓI TIÊU CHUẨN',
    badge: 'BÁN CHẠY NHẤT ★',
    badgeColor: 'bg-amber-500 text-slate-950 font-black',
    targetAudience: 'Môi giới chuyên nghiệp, giỏ hàng từ ~10 BĐS',
    monthlyPrice: 1267000, // 1.267.000 đ / tháng
    savePercent: 33,
    billingCycles: [
      { months: 1, label: '1 tháng', price: 1267000, discount: 0 },
      { months: 3, label: '3 tháng', price: 3610000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', price: 6840000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 30, // 30 voucher giảm 35.000 đ/lần Đăng Tin Thường
      normalPublishDiscount: 35000,
      vipVouchers: 1,            // 1 voucher giảm 400.000 đ cho Tin VIP
      vipDiscount: 400000,
      normalBumpVouchers: 30,    // 30 voucher giảm 10.000 đ/lần Đẩy Tin Thường
      normalBumpDiscount: 10000
    },
    features: [
      '30 voucher giảm 35.000 đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)',
      '1 voucher giảm 400.000 đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)',
      '30 voucher giảm 10.000 đ/lần Đẩy Tin Thường (mỗi chu kỳ 30 ngày)',
      'Tiện ích Hẹn giờ đăng tin tự động theo khung giờ vàng',
      'Ưu tiên Xuất bản & Duyệt tin nhanh',
      'Báo cáo hiệu suất lượt xem & khách gọi chi tiết',
      'Tiết kiệm 33% chi phí quảng cáo hàng tháng'
    ],
    recommended: true
  },
  {
    id: 'member-premium',
    name: 'Gói Hội Viên Cao Cấp',
    shortName: 'GÓI CAO CẤP',
    badge: 'ĐẲNG CẤP VIP',
    badgeColor: 'bg-gradient-to-r from-red-600 to-purple-600 text-white font-black',
    targetAudience: 'Môi giới lớn, sàn BĐS, ngân sách tiếp thị mạnh',
    monthlyPrice: 2200000, // 2.200.000 đ / tháng
    savePercent: 39,
    billingCycles: [
      { months: 1, label: '1 tháng', price: 2200000, discount: 0 },
      { months: 3, label: '3 tháng', price: 6270000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', price: 11880000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 50, // 50 voucher giảm 35.000 đ/lần Đăng Tin Thường
      normalPublishDiscount: 35000,
      vipVouchers: 3,            // 3 voucher giảm 400.000 đ cho Tin VIP
      vipDiscount: 400000,
      normalBumpVouchers: 50,    // 50 voucher giảm 10.000 đ/lần Đẩy Tin Thường
      normalBumpDiscount: 10000
    },
    features: [
      '50 voucher giảm 35.000 đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)',
      '3 voucher giảm 400.000 đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)',
      '50 voucher giảm 10.000 đ/lần Đẩy Tin Thường (mỗi chu kỳ 30 ngày)',
      'Trọn bộ tiện ích: Hẹn giờ đăng tin & Tự động đẩy tin định kỳ',
      'Báo cáo phân tích chuyên sâu thị trường, dự án & đối thủ',
      'Huy hiệu "Hội Viên Doanh Nghiệp" nâng cao uy tín thương hiệu',
      'Chuyên viên CSKH hỗ trợ kỹ thuật và tối ưu tin đăng riêng 24/7',
      'Tiết kiệm tối đa 39% chi phí marketing'
    ],
    recommended: false
  }
];

export const BUMP_SERVICE_PRICE = 10000; // 10,000 VND / lần đẩy tin thường theo chuẩn Batdongsan
export const NORMAL_PUBLISH_PRICE = 35000; // 35,000 VND / lần đăng tin thường theo chuẩn Batdongsan

export const PROPERTY_TYPES = [
  { id: 'apartment', name: 'Căn hộ chung cư', icon: 'fa-building' },
  { id: 'house', name: 'Nhà riêng / Nhà phố', icon: 'fa-house' },
  { id: 'street-house', name: 'Nhà mặt phố', icon: 'fa-shop' },
  { id: 'villa', name: 'Biệt thự / Liền kề', icon: 'fa-landmark' },
  { id: 'land', name: 'Đất nền dự án / Đất thổ cư', icon: 'fa-mountain-sun' },
  { id: 'shophouse', name: 'Shophouse thương mại', icon: 'fa-store' },
  { id: 'warehouse', name: 'Kho, xưởng, bến bãi', icon: 'fa-warehouse' },
  { id: 'office', name: 'Văn phòng / Mặt bằng', icon: 'fa-briefcase' }
];

import { VIETNAM_ADMINISTRATIVE_DATA } from './vietnamAdministrativeData.js';

export const LOCATIONS = VIETNAM_ADMINISTRATIVE_DATA;

export const INITIAL_PROPERTIES = [
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Trần Ban Quản Trị (Admin)",
    "contactPhone": "0898 246 607",
    "contactEmail": "admin@bdslandmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "TXN-3954",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T14:58:17.001Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-015",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "vip-gold",
    "status": "trash",
    "expiresAt": "2026-10-30T14:58:17.001Z",
    "autoRenew": false,
    "submittedAt": "2026-10-15T14:58:17.001Z",
    "autoApproveAt": null,
    "queuePriority": "standard_fifo",
    "queueRank": 4,
    "approvalType": "admin_instant",
    "approvalNote": "Quản trị viên xuất bản trực tiếp",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "Ví tài khoản",
    "paidAmount": 2399400,
    "paymentOrderId": "TXN-3954",
    "isGuest": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Ban Quản Trị (Admin)",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    },
    "isDeleted": true,
    "previousStatus": "active",
    "deletedAt": "2026-10-16T02:10:34.485Z"
  },
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Trần Ban Quản Trị (Admin)",
    "contactPhone": "0898 246 607",
    "contactEmail": "admin@bdslandmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "TXN-7567",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T14:57:50.044Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-014",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "vip-gold",
    "status": "active",
    "expiresAt": "2026-10-30T14:57:50.043Z",
    "autoRenew": false,
    "submittedAt": "2026-10-15T14:57:50.044Z",
    "autoApproveAt": null,
    "queuePriority": "standard_fifo",
    "queueRank": 4,
    "approvalType": "admin_instant",
    "approvalNote": "Quản trị viên xuất bản trực tiếp",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "Ví tài khoản",
    "paidAmount": 2399400,
    "paymentOrderId": "TXN-7567",
    "isGuest": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Ban Quản Trị (Admin)",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    }
  },
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Nguyễn Văn Tuấn",
    "contactPhone": "0908 123 456",
    "contactEmail": "tuan.batdongsan@landmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "TXN-4274",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T14:55:17.069Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-013",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "normal",
    "status": "active",
    "expiresAt": "2026-10-30T15:55:17.641Z",
    "autoRenew": false,
    "submittedAt": "2026-10-15T14:55:17.069Z",
    "autoApproveAt": "2026-10-15T15:55:17.069Z",
    "queuePriority": "standard_fifo",
    "queueRank": 4,
    "approvalType": "standard_fifo_countdown",
    "approvalNote": "Tin Thường: Hàng đợi tiêu chuẩn FIFO (Tự động xuất bản sau 60 phút / 1 tiếng)",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "Ví tài khoản",
    "paidAmount": 49800,
    "paymentOrderId": "TXN-4274",
    "isGuest": false,
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Hội Viên Tiêu Chuẩn",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    },
    "approvedAt": "2026-10-15T15:55:17.641Z",
    "autoApproved": true
  },
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Nguyễn Văn Tuấn",
    "contactPhone": "0908 123 456",
    "contactEmail": "tuan.batdongsan@landmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "TXN-9724",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T14:49:35.321Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-012",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "vip-gold",
    "status": "active",
    "expiresAt": "2026-10-30T15:05:24.756Z",
    "autoRenew": false,
    "submittedAt": "2026-10-15T14:49:35.321Z",
    "autoApproveAt": "2026-10-15T15:04:35.321Z",
    "queuePriority": "priority_gold",
    "queueRank": 2,
    "approvalType": "priority_countdown",
    "approvalNote": "VIP Vàng: Ưu tiên sớm (Tự động duyệt sau 15 phút)",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "Ví tài khoản",
    "paidAmount": 2399400,
    "paymentOrderId": "TXN-9724",
    "isGuest": false,
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Hội Viên Tiêu Chuẩn",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    },
    "approvedAt": "2026-10-15T15:05:24.759Z",
    "autoApproved": true,
    "isDeleted": false,
    "previousStatus": "active",
    "deletedAt": null,
    "updatedAt": "2026-10-16T02:23:33.157Z"
  },
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Trần Ban Quản Trị (Admin)",
    "contactPhone": "0898 246 607",
    "contactEmail": "admin@bdslandmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "TXN-9056",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T14:49:09.983Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-011",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "vip-gold",
    "status": "trash",
    "expiresAt": "2026-10-30T14:49:09.983Z",
    "autoRenew": false,
    "submittedAt": "2026-10-15T14:49:09.983Z",
    "autoApproveAt": null,
    "queuePriority": "standard_fifo",
    "queueRank": 4,
    "approvalType": "admin_instant",
    "approvalNote": "Quản trị viên xuất bản trực tiếp",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "Ví tài khoản",
    "paidAmount": 2399400,
    "paymentOrderId": "TXN-9056",
    "isGuest": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Ban Quản Trị (Admin)",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    },
    "isDeleted": true,
    "previousStatus": "active",
    "deletedAt": "2026-10-16T05:20:55.076Z"
  },
  {
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "city": "Hà Nội",
    "district": "Quận Cầu Giấy",
    "ward": "Dịch Vọng",
    "street": "Đường Cầu Giấy",
    "project": "Goldmark City (136 Hồ Tùng Mậu)",
    "addressDisplay": "",
    "title": "Bán Căn hộ chung cư Goldmark City (136 Hồ Tùng Mậu) 75m² 2PN 3.5 Tỷ",
    "description": "Chính chủ cần bán g�������������������������������������������������������p căn hộ cao cấp view thoáng đẹp:\n- Diện tích thông thủy: 78m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông Nam, ban công hướng Nam lộng gió quanh năm, view trực diện công viên nội khu.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.\n- Tiện ích nội khu đồng bộ: Trung tâm thương mại, bể bơi 4 mùa, phòng gym tiêu chuẩn quốc tế, trường mầm non, an ninh 24/7.\n- Pháp lý: Sổ hồng lâu dài chính chủ, sang tên công chứng nhanh chóng.\n- Hỗ trợ vay ngân hàng 70% giá trị căn hộ với lãi suất ưu đãi.",
    "priceType": "total",
    "price": 3500000000,
    "priceDisplay": "3.5 Tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 8,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "coverImageIndex": 0,
    "videoUrl": "",
    "hasVR360": false,
    "contactName": "Trần Ban Quản Trị (Admin)",
    "contactPhone": "0898 246 607",
    "contactEmail": "admin@bdslandmark.vn",
    "contactAddress": "Hà Nội & TP.HCM",
    "orderId": "BDS-920050",
    "address": "Đường Cầu Giấy, (Dự án: Goldmark City (136 Hồ Tùng Mậu)), Phường/Xã Dịch Vọng, Quận Cầu Giấy, Hà Nội",
    "publishedAt": "2026-10-15T12:04:10.754Z",
    "listingDays": 15,
    "autoBumpHours": [
      "08:00",
      "19:30"
    ],
    "id": "BDS-010",
    "slug": "ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty",
    "vipPackageId": "vip-gold",
    "status": "trash",
    "submittedAt": "2026-10-15T12:04:10.754Z",
    "autoApproveAt": null,
    "queuePriority": "standard_fifo",
    "queueRank": 4,
    "approvalType": "admin_instant",
    "approvalNote": "Quản trị viên xuất bản trực tiếp",
    "viewsCount": 1,
    "callsCount": 0,
    "isFeatured": false,
    "hasDualListing": false,
    "paymentMethod": "VietQR Ngân Hàng",
    "paidAmount": 2399400,
    "paymentOrderId": "BDS-920050",
    "isGuest": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Ban Quản Trị (Admin)",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "isGuest": false,
      "authorType": "member"
    },
    "updatedAt": "2026-10-15T12:25:12.594Z",
    "expiresAt": "2026-10-30T12:04:10.754Z",
    "autoRenew": false,
    "isDeleted": true,
    "previousStatus": "active",
    "deletedAt": "2026-10-16T02:12:08.126Z"
  },
  {
    "id": "BDS-001",
    "title": "SIÊU DỰ ÁN PENTHOUSE DUPLEX LANDMARK 81 TẦNG CAO VIEW TRỌN SÔNG SÀI GÒN - FULL NỘI THẤT HÀNG HIỆU Ý",
    "slug": "penthouse-duplex-landmark-81-view-song-sai-gon",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ Penthouse Duplex",
    "price": 38500000000,
    "priceDisplay": "38.5 Tỷ",
    "pricePerM2": "137.5 triệu/m²",
    "area": 280,
    "bedroom": 4,
    "bathroom": 5,
    "floor": 48,
    "direction": "Đông Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp nhập khẩu Versace & B&B Italia",
    "address": "Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Phường 22",
    "district": "Quận Bình Thạnh",
    "city": "TP. Hồ Chí Minh",
    "lat": 10.7951,
    "lng": 106.7219,
    "description": "Tuyệt phẩm căn hộ Penthouse Duplex áp mái Landmark 81 - Tòa nhà cao nhất Việt Nam.\n- Thiết kế thông tầng trần cao 6.8m, kính Low-E tràn viền panorama 360 độ ngắm trọn sông Sài Gòn và trung tâm Quận 1 pháo hoa rực rỡ.\n- Bố trí 4 phòng ngủ Master khép kín, phòng chiếu phim riêng, phòng gym mini, quầy bar rượu vang cao cấp.\n- Hệ thống SmartHome điều khiển giọng nói toàn diện.\n- Đặc quyền cư dân VIP: Hồ bơi vô cực riêng, bãi đỗ du thuyền, sảnh Lounge VIP đón tiếp riêng biệt.\n- Pháp lý: Sổ hồng sở hữu lâu dài, sẵn sàng công chứng sang tên trong ngày.",
    "images": [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Phòng khách thông tầng",
        "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
      },
      {
        "name": "Ban công ngắm Sông Sài Gòn",
        "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
      },
      {
        "name": "Phòng ngủ Master King-size",
        "img": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Hồ bơi vô cực",
      "Sân golf mini",
      "Công viên 14ha",
      "Bến du thuyền 5 sao",
      "Bệnh viện Vinmec",
      "Trường học Vinschool",
      "TTTM Landmark 81"
    ],
    "nearbyFacilities": [
      {
        "name": "Bến du thuyền Sài Gòn Marina",
        "distance": "150m"
      },
      {
        "name": "Bệnh viện Đa khoa Quốc tế Vinmec",
        "distance": "300m"
      },
      {
        "name": "Trường Liên cấp Quốc tế Vinschool",
        "distance": "250m"
      },
      {
        "name": "Ga Metro Tân Cảng Tuyến Số 1",
        "distance": "500m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS Cao Cấp",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T13:04:54.496Z",
    "viewsCount": 6290,
    "callsCount": 156,
    "isFeatured": true,
    "listingDays": 30,
    "expiresAt": "2026-11-13T08:30:00.000Z",
    "autoRenew": true,
    "queuePriority": "priority_diamond"
  },
  {
    "id": "BDS-002",
    "title": "BIỆT THỰ ĐƠN LẬP VINHOMES RIVERSIDE LONG BIÊN HOA LAN 450M2 HỒ ĐIỀU HÒA SANG TRỌNG BẬC NHẤT THỦ ĐÔ",
    "slug": "biet-thu-don-lap-vinhomes-riverside-hoa-lan-450m2",
    "vipPackageId": "vip-diamond",
    "status": "rejected",
    "demand": "sale",
    "propertyType": "villa",
    "propertyTypeName": "Biệt thự đơn lập",
    "price": 78000000000,
    "priceDisplay": "78 Tỷ",
    "pricePerM2": "173.3 triệu/m²",
    "area": 450,
    "bedroom": 6,
    "bathroom": 7,
    "floor": 3,
    "direction": "Nam",
    "legal": "Sổ đỏ vĩnh viễn sẵn sàng giao dịch",
    "furniture": "Hoàn thiện tâm huyết gỗ gõ đỏ Pachy nhập khẩu, thang máy kính",
    "address": "Khu Đô Thị Sinh Thái Vinhomes Riverside, Đường Hoa Lan",
    "district": "Quận Long Biên",
    "city": "Hà Nội",
    "lat": 21.0506,
    "lng": 105.9084,
    "description": "Gia chủ chuyển định cư nước ngoài cần nhượng lại căn Biệt thự đơn lập Hoa Lan đẹp nhất phân khu Riverside.\n- Lô góc 2 mặt tiền cực rộng, mặt sau ôm trọn sông đào sinh thái nước trong xanh quanh năm.\n- Sân vườn rộng rãi trồng hoa lan, hồ cá Koi Nhật Bản trị giá hàng tỷ đồng.\n- Xây dựng 3 tầng nổi + 1 tầng hầm làm hầm rượu vang và phòng karaoke chuẩn cách âm quốc tế.\n- An ninh 3 lớp bảo vệ 24/7, cộng đồng cư dân tinh hoa chính khách và chủ tịch tập đoàn lớn.",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
    ],
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Sân vườn & Hồ cá Koi",
        "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
      },
      {
        "name": "Đại sảnh phòng khách tân cổ điển",
        "img": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Sông đào sinh thái",
      "Bể bơi vô cực",
      "Sân Tennis tiêu chuẩn ATP",
      "Trường Quốc tế BIS",
      "TTTM Vincom Plaza"
    ],
    "nearbyFacilities": [
      {
        "name": "Trường Quốc Tế BIS British International",
        "distance": "400m"
      },
      {
        "name": "TTTM Vincom Long Biên",
        "distance": "600m"
      },
      {
        "name": "Sân Golf Long Biên",
        "distance": "2.5km"
      }
    ],
    "author": {
      "id": "broker-02",
      "name": "Trần Thị Thu Hà",
      "title": "Chuyên Viên Tư Vấn Vinhomes",
      "phone": "0912 888 999",
      "zalo": "0912888999",
      "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 52
    },
    "publishedAt": "2026-10-15T01:15:00Z",
    "viewsCount": 5120,
    "callsCount": 210,
    "isFeatured": true,
    "listingDays": 30,
    "expiresAt": "2026-11-14T01:15:00.000Z",
    "autoRenew": true,
    "queuePriority": "priority_diamond",
    "rejectionReason": "Đã tiếp nhận phản ánh: Hình ảnh không đúng thực tế, ảnh cắt ghép giả mạo. Đang xử lý.",
    "delistedAt": "2026-10-15T16:47:43.725Z"
  },
  {
    "id": "BDS-003",
    "title": "NHÀ MẶT PHỐ TRẦN DUY HƯNG CẦU GIẤY 8 TẦNG THANG MÁY - DÒNG TIỀN CHO THUÊ 180 TRIỆU/THÁNG",
    "slug": "nha-mat-pho-tran-duy-hung-cau-giay-8-tang-thang-may",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "street-house",
    "propertyTypeName": "Nhà mặt phố",
    "price": 49500000000,
    "priceDisplay": "49.5 Tỷ",
    "pricePerM2": "412.5 triệu/m²",
    "area": 120,
    "bedroom": 12,
    "bathroom": 10,
    "floor": 8,
    "direction": "Tây Bắc",
    "legal": "Sổ đỏ chính chủ, nở hậu đón tài lộc",
    "furniture": "Full điều hòa âm trần Daikin, hệ thống PCCC kiểm định chuẩn",
    "address": "Mặt phố Trần Duy Hưng, Phường Trung Hòa",
    "district": "Quận Cầu Giấy",
    "city": "Hà Nội",
    "lat": 21.0083,
    "lng": 105.7997,
    "description": "Vị trí kim cương ngay ngã tư Trần Duy Hưng - Hoàng Minh Giám.\n- Mặt tiền khủng 7.2m vỉa hè rộng 8m thênh thang, ô tô đỗ thoải mái ngày đêm.\n- Xây 8 tầng kiên cố khung bê tông cốt thép, thang máy nhập khẩu tốc độ cao tải trọng 1000kg.\n- Hiện đang cho Thẩm mỹ viện quốc tế thuê hợp đồng dài hạn 180 triệu/tháng (dòng tiền sinh lời 4.5%/năm).",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    "videoUrl": "",
    "hasVR360": false,
    "amenities": [
      "Thang máy nhập khẩu",
      "PCCC tiêu chuẩn mới",
      "Vỉa hè 8m",
      "Hầm để xe rộng"
    ],
    "nearbyFacilities": [
      {
        "name": "TTTM Big C Thăng Long",
        "distance": "200m"
      },
      {
        "name": "Trường THPT Chuyên Hà Nội - Amsterdam",
        "distance": "450m"
      },
      {
        "name": "Khách sạn JW Marriott",
        "distance": "1.2km"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T13:03:41.203Z",
    "viewsCount": 2915,
    "callsCount": 84,
    "listingDays": 15,
    "expiresAt": "2026-10-28T10:00:00.000Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-004",
    "title": "CĂN HỘ 3PN MASTERI THẢO ĐIỀN QUẬN 2 VIEW HỒ BƠI & METRO - SỔ HỒNG TRAO TAY GIÁ CỰC TỐT",
    "slug": "can-ho-3pn-masteri-thao-dien-quan-2",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư cao cấp",
    "price": 6800000000,
    "priceDisplay": "6.8 Tỷ",
    "pricePerM2": "72.3 triệu/m²",
    "area": 94,
    "bedroom": 3,
    "bathroom": 2,
    "floor": 18,
    "direction": "Đông Bắc",
    "legal": "Sổ hồng sẵn, hỗ trợ vay bank 70%",
    "furniture": "Nội thất hiện đại gỗ An Cường cao cấp, đồ điện tử Samsung",
    "address": "159 Xa Lộ Hà Nội, Phường Thảo Điền",
    "district": "TP. Thủ Đức (Quận 2)",
    "city": "TP. Hồ Chí Minh",
    "lat": 10.8032,
    "lng": 106.7354,
    "description": "Cần bán gấp căn hộ Masteri Thảo Điền tháp T4, view trực diện công viên và hồ bơi xanh mát, cực kỳ yên tĩnh.\n- Diện tích 94m² thiết kế 3 phòng ngủ thoáng sáng đón ánh nắng tự nhiên.\n- Kết nối trực tiếp Ga Metro An Phú qua cầu bộ hành trên cao, di chuyển vào Quận 1 chỉ 7 phút.\n- Tiện ích nội khu đẳng cấp: Vincom Mega Mall, rạp chiếu phim CGV, hồ bơi tràn bờ, phòng gym tiêu chuẩn.",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Phòng khách view hồ bơi",
        "img": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Hồ bơi 500m2",
      "Phòng tập Gym",
      "Sân tennis",
      "Sân chơi trẻ em",
      "TTTM Vincom Mega Mall Thảo Điền"
    ],
    "nearbyFacilities": [
      {
        "name": "Ga Metro An Phú Tuyến Bến Thành - Suối Tiên",
        "distance": "50m"
      },
      {
        "name": "Vincom Mega Mall Thảo Điền",
        "distance": "100m"
      },
      {
        "name": "Trường Quốc Tế ISHCMC",
        "distance": "800m"
      }
    ],
    "author": {
      "id": "broker-03",
      "name": "Lê Hoàng Nam",
      "title": "Môi Giới Chuyên Khu Vực Thảo Điền",
      "phone": "0938 555 777",
      "zalo": "0938555777",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.8,
      "reviewCount": 27
    },
    "publishedAt": "2026-10-14T14:20:00Z",
    "viewsCount": 1980,
    "callsCount": 65,
    "listingDays": 15,
    "expiresAt": "2026-10-29T14:20:00.000Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-005",
    "title": "ĐẤT NỀN KHU ĐÔ THỊ SINH THÁI HÒA XUÂN ĐÀ NẴNG GẦN CẦU HÒA XUÂN SỔ ĐỎ CÔNG CHỨNG NGAY",
    "slug": "dat-nen-kdt-sinh-thai-hoa-xuan-da-nang",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "sale",
    "propertyType": "land",
    "propertyTypeName": "Đất nền dự án",
    "price": 3650000000,
    "priceDisplay": "3.65 Tỷ",
    "pricePerM2": "36.5 triệu/m²",
    "area": 100,
    "bedroom": 0,
    "bathroom": 0,
    "floor": 0,
    "direction": "Đông",
    "legal": "Sổ đỏ chính chủ, xây dựng tự do",
    "furniture": "Đất trống hạ tầng hoàn thiện 100%",
    "address": "Đường Nguyễn Mậu Tài, Khu Đô Thị Nam Hòa Xuân",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "lat": 16.0124,
    "lng": 108.2231,
    "description": "Chính chủ cần vốn xoay kinh doanh bán gấp lô đất nền đẹp tuyệt đối tại Nam Hòa Xuân Đà Nẵng:\n- Đường 7.5m lề mỗi bên 4m trồng cây xanh rợp bóng mát.\n- Gần kề cụm trường mầm non, cấp 1-2 và công viên hồ điều hòa trung tâm.\n- Cách bãi biển Mỹ Khê chỉ 8 phút xe máy, không khí thoáng mát biển & sông.",
    "images": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Công viên sinh thái",
      "Bến thuyền",
      "Đường rộng 7.5m"
    ],
    "nearbyFacilities": [
      {
        "name": "Sân bay Quốc tế Đà Nẵng",
        "distance": "6km"
      },
      {
        "name": "Bãi tắm Sơn Thủy",
        "distance": "3km"
      }
    ],
    "author": {
      "id": "broker-04",
      "name": "Võ Minh Quân",
      "title": "Chuyên Viên Đất Nền Đà Nẵng",
      "phone": "0905 678 999",
      "zalo": "0905678999",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      "isVerified": false,
      "rating": 4.7,
      "reviewCount": 15
    },
    "publishedAt": "2026-10-12T09:10:00Z",
    "viewsCount": 1420,
    "callsCount": 42,
    "listingDays": 15,
    "expiresAt": "2026-10-27T09:10:00.000Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-006",
    "title": "CHO THUÊ NHÀ PHỐ NGUYÊN CĂN QUẬN 1 LÊ THÁNH TÔN TIỆN LÀM SPA, VĂN PHÒNG HOẶC AIRBNB",
    "slug": "cho-thue-nha-pho-nguyen-can-quan-1-le-thanh-ton",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "rent",
    "propertyType": "house",
    "propertyTypeName": "Nhà nguyên căn",
    "price": 65000000,
    "priceDisplay": "65 Triệu/tháng",
    "pricePerM2": "325.000 đ/m²",
    "area": 200,
    "bedroom": 5,
    "bathroom": 5,
    "floor": 4,
    "direction": "Đông Nam",
    "legal": "Hợp đ���ng công chứng pháp lý rõ ràng",
    "furniture": "Đầy đủ nội thất và thiết bị từng phòng ngủ",
    "address": "Hẻm xe hơi Lê Thánh Tôn, Phường Bến Nghé",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "lat": 10.7769,
    "lng": 106.7009,
    "description": "Cho thuê nhà nguyên căn khu phố Nhật Bản Little Tokyo Lê Thánh Tôn - Thái Văn Lung.\n- Kết cấu 1 trệt 3 lầu sân thượng thoáng mát. Hẻm xe hơi quay đầu rộng rãi.\n- Từng phòng đều có WC riêng, ban công đón gió. Thích hợp kinh doanh homestay, căn hộ dịch vụ cho chuyên gia Nhật Bản, hoặc mở spa làm đẹp.",
    "images": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Hẻm xe hơi",
      "Phố đi bộ",
      "Gần tuyến Metro"
    ],
    "nearbyFacilities": [
      {
        "name": "Chợ Bến Thành",
        "distance": "500m"
      },
      {
        "name": "Nhà hát Thành Phố",
        "distance": "300m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Môi Giới Cho Thuê Nhà Trung Tâm",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-11T16:00:00Z",
    "viewsCount": 1650,
    "callsCount": 37,
    "listingDays": 15,
    "expiresAt": "2026-10-16T18:38:31.750Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-007",
    "title": "Bán nhà riêng ngõ 290 Kim Mã Ba Đình 45m2 x 5 tầng cách đường ô tô 10m - Sổ đỏ vuông vắn",
    "slug": "ban-nha-rieng-kim-ma-ba-dinh-45m2",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "sale",
    "propertyType": "house",
    "propertyTypeName": "Nhà riêng",
    "price": 6200000000,
    "priceDisplay": "6.2 Tỷ",
    "pricePerM2": "137.7 triệu/m²",
    "area": 45,
    "bedroom": 4,
    "bathroom": 4,
    "floor": 5,
    "direction": "Tây Nam",
    "legal": "Sổ đỏ chính chủ, cất két giao dịch ngay",
    "furniture": "Cơ bản, sàn gỗ, tủ bếp hiện đại",
    "address": "Ngõ 290 Kim Mã, Phường Kim Mã",
    "district": "Quận Ba Đình",
    "city": "Hà Nội",
    "lat": 21.0318,
    "lng": 105.8213,
    "description": "Bán nhà khu trung tâm Ba Đình dân trí cao, an ninh tuyệt đối cạnh Đại sứ quán Thụy Điển:\n- Nhà chủ tự xây kiên cố để ở, thiết kế hiện đại, giếng trời thông thoáng.\n- Tầng 1: Phòng khách + bếp + WC. Tầng 2, 3, 4: Mỗi tầng 1 phòng ngủ rộng + WC khép kín. Tầng 5: Phòng thờ + sân phơi.",
    "images": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Gần trường học",
      "Dân trí cao",
      "An ninh tốt"
    ],
    "nearbyFacilities": [
      {
        "name": "Lotte Center Liễu Giai",
        "distance": "600m"
      },
      {
        "name": "Hồ Giảng Võ",
        "distance": "500m"
      }
    ],
    "author": {
      "id": "broker-05",
      "name": "Phạm Hải Đăng",
      "title": "Môi Giới Thổ Cư Ba Đình",
      "phone": "0977 123 789",
      "zalo": "0977123789",
      "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.6,
      "reviewCount": 19
    },
    "publishedAt": "2026-10-10T11:00:00Z",
    "viewsCount": 1100,
    "callsCount": 29,
    "listingDays": 15,
    "expiresAt": "2026-10-17T16:38:31.750Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-008",
    "title": "Bán đất thổ cư 80m2 tại Dĩ An Bình Dương gần làng Đại học Quốc gia TP.HCM",
    "slug": "ban-dat-tho-cu-80m2-di-an-binh-duong",
    "vipPackageId": "normal",
    "status": "expired",
    "demand": "sale",
    "propertyType": "land",
    "propertyTypeName": "Đất thổ cư",
    "price": 2450000000,
    "priceDisplay": "2.45 Tỷ",
    "pricePerM2": "30.6 triệu/m²",
    "area": 80,
    "bedroom": 0,
    "bathroom": 0,
    "floor": 0,
    "direction": "Đông Nam",
    "legal": "Sổ hồng riêng từng nền",
    "furniture": "Đất trống",
    "address": "Đường Đông Hòa, Phường Đông Hòa",
    "district": "TP. Dĩ An",
    "city": "Bình Dương",
    "lat": 10.8872,
    "lng": 106.7821,
    "description": "Chính chủ gửi bán lô đất thổ cư xây dựng tự do tại Dĩ An. Cách KTX Đại học Quốc gia 1km, xung quanh dân cư đông đúc, thích hợp xây nhà trọ cho sinh viên hoặc an cư lâu dài.",
    "images": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Đường bê tông 5m",
      "Điện nước sạch"
    ],
    "nearbyFacilities": [
      {
        "name": "Khu Đô Thị Đại Học Quốc Gia",
        "distance": "1km"
      },
      {
        "name": "Bến xe Miền Đông mới",
        "distance": "2.5km"
      }
    ],
    "author": {
      "id": "broker-06",
      "name": "Đoàn Thị Mai",
      "title": "Chính chủ đăng tin",
      "phone": "0983 999 111",
      "zalo": "0983999111",
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
      "isVerified": false,
      "rating": 4.5,
      "reviewCount": 8
    },
    "publishedAt": "2026-10-09T08:00:00Z",
    "viewsCount": 780,
    "callsCount": 14,
    "listingDays": 15,
    "expiresAt": "2026-08-26T13:30:00.668Z",
    "autoRenew": false,
    "updatedAt": "2026-10-15T13:29:55.215Z",
    "lastRenewedAt": "2026-10-15T13:29:55.215Z",
    "renewCount": 2,
    "queuePriority": "standard_fifo"
  },
  {
    "id": "BDS-009",
    "title": "Cần bán gấp căn shophouse khối đế chung cư Cầu Giấy đang kinh doanh Cafe Highlands",
    "slug": "ban-shophouse-cau-giay-dang-cho-thue-cafe",
    "vipPackageId": "normal",
    "status": "active",
    "demand": "sale",
    "propertyType": "shophouse",
    "propertyTypeName": "Shophouse thương mại",
    "price": 16500000000,
    "priceDisplay": "16.5 Tỷ",
    "pricePerM2": "110 triệu/m²",
    "area": 150,
    "bedroom": 1,
    "bathroom": 2,
    "floor": 2,
    "direction": "Đông Bắc",
    "legal": "Sổ hồng 50 năm",
    "furniture": "Hoàn thiện đồng bộ",
    "address": "Đường Duy Tân, Phường Dịch Vọng Hậu",
    "district": "Quận Cầu Giấy",
    "city": "Hà Nội",
    "lat": 21.0333,
    "lng": 105.7833,
    "description": "Tin đăng mới đang chờ Admin kiểm duyệt nội dung và giấy tờ pháp lý. Shophouse tầng trệt tòa nhà 30 tầng với hơn 1.200 căn hộ.",
    "images": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Mặt tiền 10m",
      "Chỗ đỗ xe rộng"
    ],
    "nearbyFacilities": [
      {
        "name": "Khu công nghệ cao Duy Tân",
        "distance": "100m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T06:00:00Z",
    "viewsCount": 12,
    "callsCount": 0,
    "listingDays": 15,
    "autoRenew": false,
    "autoApproveAt": "2026-10-15T14:27:44.966Z",
    "queuePriority": "standard_fifo",
    "approvalType": "standard_fifo_countdown",
    "approvalNote": "Tin Thường: Hàng đợi tiêu chuẩn FIFO (Tự động xuất bản trong 1 tiếng)",
    "expiresAt": "2026-10-30T14:28:32.641Z",
    "approvedAt": "2026-10-15T14:28:32.641Z",
    "autoApproved": true
  }
];

export const MOCK_USERS = [
  {
    id: 'user-01',
    name: 'Lê Minh Tâm',
    email: 'minhtam.le@gmail.com',
    password: '123456',
    passwordHash: '$2b$10$jgjsVvPtPeI7WDBTiFSj1eDC8xz6aYTszoychODv7PYe.94N0oTNi',
    role: 'user', // user, broker, admin
    roleName: 'Khách hàng cá nhân',
    walletBalance: 850000, // 850,000 VND
    phone: '0912 345 678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    membership: null,
    vouchers: {
      normalPublish: 0,
      normalBump: 0,
      vipPublish: 0
    }
  },
  {
    id: 'broker-01',
    name: 'Nguyễn Văn Tuấn',
    email: 'tuan.batdongsan@datbiendanang.vn',
    password: '123456',
    passwordHash: '$2b$10$jgjsVvPtPeI7WDBTiFSj1eDC8xz6aYTszoychODv7PYe.94N0oTNi',
    role: 'broker',
    roleName: 'Môi Giới',
    walletBalance: 4250000, // 4,250,000 VND
    phone: '0908 123 456',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    activeListingsCount: 12,
    membership: {
      packageId: 'member-standard',
      packageName: 'Hội Viên Tiêu Chuẩn',
      billingMonths: 3,
      subscribedAt: '2026-10-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      status: 'active',
      badge: 'HỘI VIÊN TIÊU CHUẨN ★',
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    vouchers: {
      normalPublish: 26, // Còn 26 voucher giảm 35.000 đ đăng tin thường
      normalBump: 28,    // Còn 28 voucher giảm 10.000 đ đẩy tin thường
      vipPublish: 1      // Còn 1 voucher giảm 400.000 đ cho tin VIP
    }
  },
  {
    id: 'admin-01',
    name: 'Trần Ban Quản Trị',
    email: 'admin@datbiendanang.vn',
    password: '123456',
    passwordHash: '$2b$10$jgjsVvPtPeI7WDBTiFSj1eDC8xz6aYTszoychODv7PYe.94N0oTNi',
    role: 'admin',
    roleName: 'Tổng Quản Trị Viên (CMS Admin)',
    walletBalance: 99999999,
    phone: '0898 246 607',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    membership: {
      packageId: 'member-premium',
      packageName: 'Hội Viên Cao Cấp VIP',
      billingMonths: 12,
      subscribedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2030-01-01T00:00:00Z',
      status: 'active',
      badge: 'HỘI VIÊN CAO CẤP',
      badgeColor: 'bg-purple-600 text-white font-black'
    },
    vouchers: {
      normalPublish: 99,
      normalBump: 99,
      vipPublish: 99
    }
  }
];

export const DEFAULT_GUEST_USER = {
  id: 'guest',
  name: 'Khách vãng lai',
  role: 'guest',
  roleName: 'Chưa đăng nhập',
  walletBalance: 0,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  isVerified: false
};

export const MOCK_TRANSACTIONS = [
  {
    id: 'TXN-9025',
    userId: 'guest-9821',
    userName: 'Phạm Minh Hoàng (Khách vãng lai)',
    type: 'purchase_vip',
    title: 'Đăng tin mới VIP Kim Cương (BDS-008 - 15 ngày) qua VietQR',
    amount: -6746100,
    balanceAfter: 0,
    status: 'success',
    createdAt: '2026-10-15T15:20:30.000Z',
    paymentMethod: 'VietQR Ngân Hàng'
  },
  {
    id: 'TXN-9021',
    userId: 'broker-01',
    userName: 'Nguyễn Văn Tuấn',
    type: 'purchase_vip',
    title: 'Nâng cấp VIP Kim Cương (Tin BDS-001 - 15 ngày)',
    amount: -1500000,
    balanceAfter: 4250000,
    status: 'success',
    createdAt: '2026-10-15T09:30:15.000Z',
    paymentMethod: 'Ví tài khoản'
  },
  {
    id: 'TXN-9018',
    userId: 'broker-01',
    userName: 'Nguyễn Văn Tuấn',
    type: 'deposit',
    title: 'Nạp tiền vào tài khoản qua VietQR Ngân hàng MB Bank',
    amount: 5000000,
    balanceAfter: 5750000,
    status: 'success',
    createdAt: '2026-10-14T14:15:40.000Z',
    paymentMethod: 'VietQR Ngân Hàng'
  },
  {
    id: 'TXN-9005',
    userId: 'user-01',
    userName: 'Lê Minh Tâm',
    type: 'purchase_vip',
    title: 'Đăng tin mới VIP Vàng (BDS-004 - 30 ngày) qua Ví MoMo',
    amount: -3599100,
    balanceAfter: 850000,
    status: 'success',
    createdAt: '2026-10-14T11:05:22.000Z',
    paymentMethod: 'Ví MoMo'
  },
  {
    id: 'TXN-8942',
    userId: 'broker-01',
    userName: 'Nguyễn Văn Tuấn',
    type: 'bump_listing',
    title: 'Đẩy tin làm mới lên đầu trang (Tin BDS-003)',
    amount: -10000,
    balanceAfter: 750000,
    status: 'success',
    createdAt: '2026-10-13T10:00:12.000Z',
    paymentMethod: 'Ví tài khoản'
  }
];

// Cấu hình danh mục thanh Menu Điều Hướng (Navigation Menu Items)
export const INITIAL_NAV_MENU = [
  {
    id: 'menu-explore',
    title: 'Khám Phá',
    path: '/',
    icon: 'fa-solid fa-compass',
    badge: '',
    badgeColor: '',
    isVisible: true,
    order: 1,
    target: '_self',
    children: []
  },
  {
    id: 'menu-sale',
    title: 'Nhà Đất Bán',
    path: '/nha-dat-ban',
    icon: 'fa-solid fa-house-chimney',
    badge: '',
    badgeColor: '',
    isVisible: true,
    order: 2,
    target: '_self',
    children: [
      { id: 'sub-sale-apt', title: 'Bán Căn Hộ Chung Cư', path: '/ban-can-ho-chung-cu', icon: 'fa-solid fa-building' },
      { id: 'sub-sale-house', title: 'Bán Nhà Riêng, Nhà Phố', path: '/ban-nha-rieng', icon: 'fa-solid fa-house' },
      { id: 'sub-sale-street', title: 'Bán Nhà Mặt Phố Kinh Doanh', path: '/ban-nha-mat-pho', icon: 'fa-solid fa-shop' },
      { id: 'sub-sale-villa', title: 'Bán Biệt Thự Liền Kề', path: '/ban-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark-dome' },
      { id: 'sub-sale-land', title: 'Bán Đất Nền Dự Án', path: '/ban-dat-nen-du-an', icon: 'fa-solid fa-mountain' }
    ]
  },
  {
    id: 'menu-rent',
    title: 'Cho Thuê',
    path: '/nha-dat-cho-thue',
    icon: 'fa-solid fa-key',
    badge: '',
    badgeColor: '',
    isVisible: true,
    order: 3,
    target: '_self',
    children: [
      { id: 'sub-rent-apt', title: 'Cho Thuê Căn Hộ Chung Cư', path: '/cho-thue-can-ho-chung-cu', icon: 'fa-solid fa-building' },
      { id: 'sub-rent-house', title: 'Cho Thuê Nhà Riêng, Nguyên Căn', path: '/cho-thue-nha-rieng', icon: 'fa-solid fa-house' },
      { id: 'sub-rent-street', title: 'Cho Thuê Nhà Mặt Phố', path: '/cho-thue-nha-mat-pho', icon: 'fa-solid fa-store' },
      { id: 'sub-rent-office', title: 'Cho Thuê Văn Phòng', path: '/cho-thue-van-phong', icon: 'fa-solid fa-briefcase' }
    ]
  },
  {
    id: 'menu-membership',
    title: 'Gói Hội Viên',
    path: '/goi-hoi-vien',
    icon: 'fa-solid fa-crown',
    badge: '',
    badgeColor: '',
    isVisible: true,
    order: 4,
    target: '_self',
    children: []
  }
];

// Cấu hình Header, Logo & Độ Rộng Thanh Menu (Header & Logo Settings)
export const DEFAULT_HEADER_CONFIG = {
  logoType: 'text', // 'text' | 'image'
  brandName: 'ĐẤT BIỂN',
  brandHighlight: 'ĐÀ NẴNG',
  brandTagline: 'Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP',
  brandIcon: 'fa-solid fa-water',
  badgeText: '',
  badgeColor: 'bg-red-100 text-red-600 border border-red-200',
  logoImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none"><rect width="240" height="60" rx="12" fill="%230f172a"/><path d="M22 45V22L36 12L50 22V45H40V30H32V45H22Z" fill="%230284c7"/><circle cx="36" cy="20" r="4" fill="%2338bdf8"/><text x="60" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="white">ĐẤT BIỂN <tspan fill="%2338bdf8">ĐÀ NẴNG</tspan></text><text x="60" y="47" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%2394a3b8" letter-spacing="2">BẤT ĐỘNG SẢN BIỂN</text></svg>',
  logoHeight: 40,
  logoAlt: 'Đất Biển Đà Nẵng Logo',
  showTaglineWithImage: false,
  containerWidth: 'boxed', // 'boxed' (max-w-7xl) | 'wide' (max-w-screen-2xl) | 'full' (w-full 100%)
};

export const PRESET_LOGOS = [
  {
    id: 'preset-gold',
    name: 'Đất Biển Đà Nẵng Luxury',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none"><rect width="240" height="60" rx="12" fill="%230f172a"/><path d="M22 45V22L36 12L50 22V45H40V30H32V45H22Z" fill="%230284c7"/><circle cx="36" cy="20" r="4" fill="%2338bdf8"/><text x="60" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="white">ĐẤT BIỂN <tspan fill="%2338bdf8">ĐÀ NẴNG</tspan></text><text x="60" y="47" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%2394a3b8" letter-spacing="2">BẤT ĐỘNG SẢN BIỂN</text></svg>'
  },
  {
    id: 'preset-emerald',
    name: 'Green City Eco',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none"><rect width="240" height="60" rx="12" fill="%23064e3b"/><path d="M20 44L34 16L48 44H38L34 32L30 44H20Z" fill="%2334d399"/><circle cx="34" cy="24" r="5" fill="%2310b981"/><text x="58" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="white">ECO <tspan fill="%2334d399">HOMES</tspan></text><text x="58" y="47" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%23a7f3d0" letter-spacing="2">BẤT ĐỘNG SẢN XANH</text></svg>'
  },
  {
    id: 'preset-modern',
    name: 'Modern Red Skyline',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none"><rect width="240" height="60" rx="12" fill="%231e1b4b"/><rect x="18" y="24" width="8" height="20" rx="2" fill="%23ef4444"/><rect x="28" y="16" width="10" height="28" rx="2" fill="%23f43f5e"/><rect x="40" y="28" width="8" height="16" rx="2" fill="%23fb7185"/><text x="58" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="white">VINA <tspan fill="%23ef4444">REALTY</tspan></text><text x="58" y="47" font-family="Arial, sans-serif" font-weight="600" font-size="9" fill="%23cbd5e1" letter-spacing="2">SÀN BĐS TOÀN QUỐC</text></svg>'
  }
];

// Danh sách các ngân hàng hỗ trợ VietQR tại Việt Nam
export const VIETNAM_BANKS = [
  { code: 'MB', name: 'MBBank - Ngân Hàng Quân Đội', bin: '970422', shortName: 'MBBank' },
  { code: 'VCB', name: 'Vietcombank - Ngân Hàng Ngoại Thương', bin: '970436', shortName: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank - Ngân Hàng Kỹ Thương', bin: '970407', shortName: 'Techcombank' },
  { code: 'VPB', name: 'VPBank - Ngân Hàng Việt Nam Thịnh Vượng', bin: '970432', shortName: 'VPBank' },
  { code: 'ACB', name: 'ACB - Ngân Hàng Á Châu', bin: '970416', shortName: 'ACB' },
  { code: 'BIDV', name: 'BIDV - Ngân Hàng Đầu Tư và Phát Triển', bin: '970418', shortName: 'BIDV' },
  { code: 'VBA', name: 'Agribank - Ngân Hàng Nông Nghiệp', bin: '970405', shortName: 'Agribank' },
  { code: 'TPB', name: 'TPBank - Ngân Hàng Tiên Phong', bin: '970423', shortName: 'TPBank' },
  { code: 'SEAB', name: 'SeABank - Ngân Hàng Đông Nam Á', bin: '970440', shortName: 'SeABank' }
];

// Quy Chế Thanh Toán Trước - Phê Duyệt Tự Động Theo Cấp Độ Tin Đăng
export const DEFAULT_APPROVAL_TIERS = {
  'vip-diamond': {
    mode: 'instant', // 'instant' | 'countdown' | 'manual'
    delayMinutes: 0,
    title: 'VIP Kim Cương',
    shortName: 'VIP KIM CƯƠNG',
    description: 'Duyệt Tức Thì tự động (Active ngay lập tức khi thanh toán thành công)',
    badgeText: 'Duyệt Tức Thì (0s)',
    badgeColor: 'bg-red-600 text-white',
    rank: 1
  },
  'vip-gold': {
    mode: 'countdown',
    delayMinutes: 15, // 15 phút
    title: 'VIP Vàng',
    shortName: 'VIP VÀNG',
    description: 'Ưu tiên sớm: Tự động phê duyệt sau 15 phút nếu Admin chưa duyệt trước',
    badgeText: 'Ưu tiên sớm (15 phút)',
    badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    rank: 2
  },
  'vip-silver': {
    mode: 'countdown',
    delayMinutes: 30, // 30 phút
    title: 'VIP Bạc',
    shortName: 'VIP BẠC',
    description: 'Ưu tiên sớm: Tự động phê duyệt sau 30 phút (trước tin thường)',
    badgeText: 'Ưu tiên sớm (30 phút)',
    badgeColor: 'bg-blue-600 text-white font-bold',
    rank: 3
  },
  'normal': {
    mode: 'countdown', // FIFO tự động xuất bản trong 1 tiếng (60 phút)
    delayMinutes: 60,
    title: 'Tin Thường',
    shortName: 'TIN THƯỜNG',
    description: 'Hàng đợi tiêu chuẩn FIFO - Tự động xuất bản trong 1 tiếng (hoặc BQT duyệt sớm)',
    badgeText: 'Hàng đợi FIFO (Tự động 1 tiếng)',
    badgeColor: 'bg-slate-700 text-slate-200',
    rank: 4
  }
};

// Cấu hình Phương Thức Thanh Toán Backend (Payment Gateway Settings)
export const DEFAULT_PAYMENT_CONFIG = {
  wallet: {
    enabled: true,
    name: 'Ví tài khoản',
    desc: 'Trừ trực tiếp số dư tài khoản đã nạp',
    icon: 'fa-solid fa-wallet',
    requiresLogin: true
  },
  vietqr: {
    enabled: true,
    name: 'VietQR Ngân Hàng',
    desc: 'Quét mã QR 24/7 (Tự động nhận diện & Duyệt tức thì)',
    icon: 'fa-solid fa-qrcode',
    bankCode: 'MB',
    bankBin: '970422',
    bankName: 'MBBank - Ngân Hàng Quân Đội',
    accountNumber: '0898246607',
    accountName: 'CONG TY DAT BIEN DA NANG',
    syntaxPrefix: 'DBDN'
  },
  momo: {
    enabled: true,
    name: 'Ví MoMo',
    desc: 'Thanh toán 1-chạm qua ứng dụng MoMo',
    icon: 'fa-solid fa-mobile-screen-button',
    phoneNumber: '0898246607',
    accountName: 'CONG TY DAT BIEN DA NANG',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0898246607|DAT%20BIEN%20DA%20NANG||0|0|0'
  },
  vnpay: {
    enabled: true,
    name: 'Cổng VNPAY-QR',
    desc: 'Thẻ ATM & Quốc tế (Visa, Master, JCB)',
    icon: 'fa-solid fa-credit-card',
    tmnCode: 'DATBIENDANANG',
    sandbox: true
  },
  autoApproveVip: true,
  autoApproveOther: true,
  approvalTiers: DEFAULT_APPROVAL_TIERS
};

// Cấu hình Vận Hành Hệ Thống Sàn BĐS (Platform Operating Settings)
export const DEFAULT_SYSTEM_CONFIG = {
  platformName: 'SÀN GIAO DỊCH BẤT ĐỘNG SẢN ĐẤT BIỂN ĐÀ NẴNG',
  brandShortName: 'ĐẤT BIỂN ĐÀ NẴNG',
  tagline: 'Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP',
  hotline: '0904 084 888',
  zalo: '0904 084 888',
  email: 'tranvanvu.dev@gmail.com',
  address: 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng',
  fontFamily: 'Roboto',
  autoApproveDiamond: true,
  enableAiModeration: true,
  defaultListingDays: 15,
  maintenanceMode: false,
  // Cấu hình vòng đời lưu trữ và tối ưu hóa Database khi tin hết hạn
  expiredRetentionDays: 45, // Sau 45 ngày hết hạn mà không gia hạn thì xử lý
  expiredCleanupAction: 'archive_light', // 'archive_light' (Chuyển sang dữ liệu siêu nhẹ tối ưu DB) | 'permanent_delete' (Xóa vĩnh viễn) | 'move_to_trash' (Chuyển vào thùng rác)
  autoCleanupEnabled: true, // Tự động quét dọn dẹp định kỳ
  trashRetentionDays: 30, // Tự động xóa vĩnh viễn trong thùng rác sau 30 ngày

  // Cấu hình Chiến Dịch Tặng Tiền Chào Mừng & Xác Thực Email (Welcome Bonus Campaign)
  welcomeBonusAmount: 100000, // [SỐ_TIỀN_TẶNG]: Mặc định 100.000đ (có thể chỉnh thành 50k, 200k... tùy chiến dịch)
  tokenExpiryMinutes: 30, // [THỜI_GIẠN_HẾT_HẠN_TOKEN]: Tính bằng phút, thời gian link email có hiệu lực
  bonusExpiryDays: 30, // [THỜI_GIẠN_HẾT_HẠN_TIỀN]: Tính bằng ngày, thời gian tiền khuyến mãi có hiệu lực trước khi bị thu hồi
  maxRegistrationsPerIpPerDay: 3, // Anti-cheat: Giới hạn 1 địa chỉ IP / thiết bị chỉ nhận thưởng tối đa 3 tài khoản / ngày
  enableWelcomeBonus: true // Bật/Tắt chương trình quà tặng chào mừng thành viên mới
};

// Cấu hình Trang Chi Tiết Bất Động Sản (Single Property Page Settings)
export const DEFAULT_SINGLE_CONFIG = {
  // 1. Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm
  disclaimer: {
    enabled: true,
    title: 'Thông Báo Về Nội Dung & Miễn Trừ Trách Nhiệm',
    icon: 'fa-solid fa-shield-halved', // 'fa-solid fa-shield-halved', 'fa-solid fa-scale-balanced', 'fa-solid fa-circle-info', 'fa-solid fa-triangle-exclamation'
    badgeColor: 'amber', // 'amber', 'rose', 'blue', 'slate', 'emerald'
    bgStyle: 'slate', // 'slate' | 'amber' | 'blue' | 'white'
    hotline: '0904 084 888',
    platformName: 'ĐẤT BIỂN ĐÀ NẴNG',
    contentTemplate: 'Quý vị đang xem nội dung tin rao "{title}" - Mã tin {id}. Nội dung tin đăng này do Người đăng tin cung cấp và chịu trách nhiệm về tính chính xác, đầy đủ và hợp pháp của thông tin. Với tư cách là Nền tảng thương mại điện tử trung gian, {platformName} thực hiện rà soát, kiểm duyệt trên cơ sở các thông tin được cung cấp. Quý vị vui lòng chủ động kiểm tra, thẩm định thông tin pháp lý và thực tế trước khi giao dịch. Nếu phát hiện nội dung không chính xác hoặc vi phạm, xin vui lòng thông báo qua Hotline {hotline} hoặc công cụ Báo cáo vi phạm để chúng tôi tiếp nhận và xử lý theo quy định.',
    showReportButton: true,
    reportButtonText: 'Báo cáo tin này',
    showAuditChecklist: true,
    auditItems: [
      'Đã kiểm duyệt sơ bộ',
      'Tuân thủ quy chế sàn TMĐT',
      'Mã tin được bảo hộ dữ liệu'
    ]
  },
  // 2. Các khối chức năng khác trên trang Single
  features: {
    showLoanCalculator: true,
    showAppointmentBooking: true,
    showPrintButton: true,
    showShareButton: true,
    showRelatedKeywords: true,
    showSimilarProperties: true,
    showInteractiveMap: true,
    showAuthorCard: true,
    showVipBadge: true,
    showAdministrativeMergerAlert: true
  }
};

// Mẫu Nội Dung Email Chuẩn Hóa (Customizable Email Templates)
export const DEFAULT_EMAIL_TEMPLATES = {
  report_confirmation: {
    id: 'report_confirmation',
    name: 'Xác nhận tiếp nhận phản ánh (Gửi Người Báo Cáo)',
    description: 'Tự động gửi cho người báo cáo ngay khi họ gửi thông tin phản ánh vi phạm.',
    subject: '✅ Tiếp nhận phản ánh vi phạm tin rao #{{propertyId}} • {{siteName}}',
    headerBadge: 'Tiếp Nhận Phản Ánh',
    headerTitle: 'Đã Tiếp Nhận Báo Cáo Vi Phạm',
    greeting: 'Kính gửi {{reporterName}},',
    introText: 'Cảm ơn Quý khách đã gửi phản ánh vi phạm về tin rao bất động sản trên sàn giao dịch {{siteName}}. Sự đóng góp của Quý khách có ý nghĩa rất lớn giúp xây dựng một môi trường giao dịch bất động sản minh bạch, chính xác và an toàn.',
    processNotice: 'Trong vòng 24 giờ làm việc, đội ngũ thẩm định nội dung sẽ liên hệ trực tiếp với người đăng tin để kiểm tra, yêu cầu xác minh sổ đỏ/giấy tờ pháp lý hoặc mức giá thực tế. Nếu phát hiện vi phạm, tin đăng sẽ bị hạ lập tức.',
    closingText: 'Chúng tôi sẽ gửi email thông báo kết quả giải quyết khi hoàn tất thẩm định.',
    senderSign: 'Đội Ngũ Kiểm Soát Chất Lượng Sàn {{siteName}}',
    headerTheme: 'emerald' // 'emerald' | 'rose' | 'sky' | 'amber' | 'slate'
  },
  author_warning: {
    id: 'author_warning',
    name: 'Cảnh báo vi phạm & Hạ tin (Gửi Chủ Tin Đăng)',
    description: 'Gửi cho người đăng bài khi tin bị khiếu nại hoặc khi ban kiểm duyệt ra quyết định gỡ tin.',
    subject: '⚠️ [THÔNG BÁO] Tin đăng #{{propertyId}} vi phạm tiêu chuẩn • {{siteName}}',
    headerBadge: 'Thông Báo Hạ Tin Đăng',
    headerTitle: 'Tin Đăng Bị Gỡ Do Vi Phạm Quy Chế',
    greeting: 'Kính gửi {{authorName}},',
    introText: 'Ban kiểm duyệt {{siteName}} xin thông báo: Tin đăng của bạn đã bị tạm gỡ khỏi sàn giao dịch do có nội dung vi phạm tiêu chuẩn cộng đồng hoặc thông tin không trùng khớp thực tế.',
    reasonNotice: 'Lý do xử lý: {{adminNote}}',
    appealNotice: 'Nếu bạn cho rằng quyết định này có sự nhầm lẫn, vui lòng liên hệ Bộ phận Khiếu nại qua Hotline {{hotline}} hoặc gửi email kèm giấy tờ chứng minh để được hỗ trợ mở lại tin.',
    senderSign: 'Ban Pháp Chế & Kiểm Duyệt Sàn {{siteName}}',
    headerTheme: 'rose'
  },
  report_resolution: {
    id: 'report_resolution',
    name: 'Thông báo kết quả giải quyết (Gửi Người Báo Cáo)',
    description: 'Gửi cho người báo cáo sau khi kiểm duyệt viên đã thẩm định và xử lý xong tin rao.',
    subject: '🎉 Kết quả xử lý phản ánh vi phạm tin rao #{{propertyId}} • {{siteName}}',
    headerBadge: 'Kết Quả Thẩm Định',
    headerTitle: 'Kết Quả Xử Lý Báo Cáo Vi Phạm',
    greeting: 'Kính gửi {{reporterName}},',
    introText: 'Ban kiểm duyệt {{siteName}} xin trân trọng thông báo kết quả xác minh phản ánh của Quý khách đối với tin đăng #{{propertyId}} - {{propertyTitle}}:',
    resolutionDetail: 'Biện pháp đã thực hiện: {{actionTaken}}. {{adminNote}}',
    closingText: 'Một lần nữa xin chân thành cảm ơn Quý khách đã chung tay xây dựng cộng đồng bất động sản văn minh và an toàn!',
    senderSign: 'Ban Quản Trị Sàn {{siteName}}',
    headerTheme: 'sky'
  },
  admin_alert: {
    id: 'admin_alert',
    name: 'Cảnh báo khẩn cấp tin vi phạm (Gửi Ban Quản Trị)',
    description: 'Gửi tức thì tới hòm thư Admin / Kiểm duyệt viên ngay khi có tin đăng bị báo cáo.',
    subject: '🚨 [CẢNH BÁO VI PHẠM] Tin rao #{{propertyId}} bị báo cáo: {{reason}}',
    headerBadge: 'Cảnh Báo Kiểm Duyệt Khẩn Cấp',
    headerTitle: 'Có Tin Rao Bị Người Dùng Báo Cáo Vi Phạm',
    greeting: 'Kính gửi Ban Kiểm Duyệt Sàn {{siteName}},',
    introText: 'Hệ thống tự động ghi nhận một phản ánh vi phạm mới từ người dùng trên sàn. Vui lòng đối chiếu hồ sơ và kiểm tra tính xác thực để có biện pháp xử lý kịp thời.',
    closingText: 'Vui lòng truy cập trang Quản Trị Hệ Thống để thẩm định và ra quyết định xử lý.',
    senderSign: 'Hệ Thống Giám Sát Tự Động • {{siteName}}',
    headerTheme: 'rose'
  },
  smtp_test: {
    id: 'smtp_test',
    name: 'Thư thử nghiệm kết nối (SMTP Test Email)',
    description: 'Gửi để kiểm tra khả năng phát thư và xác thực kết nối máy chủ gửi thư.',
    subject: '✅ [THỬ NGHIỆM] Kết nối máy chủ gửi thư thành công • {{siteName}}',
    headerBadge: 'Thư Thử Nghiệm Hệ Thống',
    headerTitle: 'Kết Nối Máy Chủ Email Thành Công!',
    greeting: 'Kính gửi Quản Trị Viên,',
    introText: 'Đây là bức thư thử nghiệm được gửi từ trang Cấu Hình Email Website nhằm xác thực thông số kết nối máy chủ gửi thư điện tử (SMTP / API) của sàn {{siteName}}.',
    closingText: 'Hệ thống gửi thư điện tử đã sẵn sàng hoạt động an toàn và ổn định.',
    senderSign: 'Bộ Phận Kỹ Thuật Hệ Thống • {{siteName}}',
    headerTheme: 'emerald'
  },
  welcome_verification: {
    id: 'welcome_verification',
    name: 'Kích hoạt tài khoản & Quà tặng chào mừng',
    description: 'Tự động gửi cho thành viên mới đăng ký kèm nút kích hoạt tài khoản và nhận tiền thưởng vào ví.',
    subject: '🎁 Chào mừng bạn gia nhập {{siteName}} - Kích hoạt để nhận ngay {{bonusAmount}} vào ví',
    headerBadge: 'Kích Hoạt Tài Khoản Mới',
    headerTitle: 'Chào Mừng Thành Viên Mới',
    greeting: 'Kính gửi {{userName}},',
    introText: 'Cảm ơn bạn đã đăng ký tài khoản trên sàn giao dịch {{siteName}}. Chúng tôi xin gửi tặng bạn phần quà chào mừng {{bonusAmount}} vào Ví Khuyến Mãi để trải nghiệm đăng tin và đẩy tin VIP hoàn toàn miễn phí!',
    actionButtonText: 'Kích Hoạt Tài Khoản & Nhận {{bonusAmount}} Vào Ví',
    expirationNotice: 'Lưu ý: Liên kết kích hoạt này có hiệu lực trong vòng {{expiryMinutes}} phút. Số tiền quà tặng có thời hạn sử dụng trong {{bonusExpiryDays}} ngày kể từ lúc kích hoạt.',
    senderSign: 'Ban Quản Trị & Chăm Sóc Khách Hàng {{siteName}}',
    headerTheme: 'emerald'
  }
};

// Cấu hình Email Website & Máy Chủ Gửi Thư (Website Email & SMTP Settings)
export const DEFAULT_EMAIL_CONFIG = {
  // 1. Chế độ gửi thư
  driver: 'smtp', // 'smtp' | 'sendgrid' | 'simulation'
  enableEmailNotifications: true, // Bật/tắt toàn bộ dịch vụ email

  // 2. Thông tin người gửi (From & Reply-to)
  fromEmail: 'tranvanvu.dev@gmail.com',
  fromName: 'Ban Quản Trị Sàn Đất Biển Đà Nẵng',
  replyToEmail: 'tranvanvu.dev@gmail.com',

  // 3. Email Quản Trị Viên / Ban Kiểm Duyệt tiếp nhận cảnh báo
  adminAlertEmail: 'tranvanvu.dev@gmail.com',
  adminCcEmails: 'tranvanvu.dev@gmail.com',
  notifyAdminOnReport: true, // Nhận email khi có báo cáo vi phạm mới
  notifyAdminOnNewListing: true, // Nhận email khi có tin đăng mới chờ duyệt
  notifyAdminOnVipPurchase: true, // Nhận email khi có giao dịch VIP mới
  notifyReporterOnResolution: true, // Tự động gửi kết quả xử lý cho người báo cáo

  // 4. Cấu hình Máy chủ SMTP
  smtp: {
    host: 'smtp.gmail.com',
    port: 587, // 587 (TLS), 465 (SSL), 25
    encryption: 'tls', // 'tls' | 'ssl' | 'none'
    username: 'tranvanvu.dev@gmail.com',
    password: 'yjhk hdia qswa lxxd', // Mật khẩu ứng dụng Gmail (App Password)
    authRequired: true,
    timeoutSeconds: 15
  },

  // 5. Cấu hình API Dịch vụ bên thứ ba (SendGrid)
  sendgrid: {
    apiKey: ''
  },

  // 6. Chữ ký thương hiệu & Chân trang Email (Signature / Footer)
  signature: {
    companyName: 'SÀN GIAO DỊCH BẤT ĐỘNG SẢN ĐẤT BIỂN ĐÀ NẴNG',
    hotline: '0904 084 888',
    address: 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng',
    websiteUrl: 'https://datbiendanang.vn'
  },

  // 7. Mẫu nội dung Email tùy chỉnh (Customizable Templates)
  templates: DEFAULT_EMAIL_TEMPLATES
};

