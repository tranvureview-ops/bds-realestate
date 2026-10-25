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
    titleClass: 'text-red-600 font-extrabold text-lg tracking-wide',
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
    titleClass: 'text-amber-600 font-bold text-base',
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
      { months: 1, label: '1 tháng', duration_days: 30, price: 467000, discount: 0 },
      { months: 3, label: '3 tháng', duration_days: 90, price: 1330000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', duration_days: 180, price: 2520000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 15, // 15 voucher giảm 35.000 đ/lần Đăng Tin Thường
      normalPublishDiscount: 35000,
      normalBumpVouchers: 15,    // 15 voucher giảm 10.000 đ/lần Đẩy Tin Thường
      normalBumpDiscount: 10000,
      vipVouchers: 0,
      vipDiscount: 400000
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
      { months: 1, label: '1 tháng', duration_days: 30, price: 1267000, discount: 0 },
      { months: 3, label: '3 tháng', duration_days: 90, price: 3610000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', duration_days: 180, price: 6840000, discount: 10, note: 'Tiết kiệm thêm 10%' }
    ],
    vouchersPerCycle: {
      normalPublishVouchers: 20, // 20 voucher giảm 35.000 đ/lần Đăng Tin Thường
      normalPublishDiscount: 35000,
      vipVouchers: 1,            // 1 voucher giảm 400.000 đ cho Tin VIP
      vipDiscount: 400000,
      normalBumpVouchers: 20,    // 20 voucher giảm 10.000 đ/lần Đẩy Tin Thường
      normalBumpDiscount: 10000
    },
    features: [
      '20 voucher giảm 35.000 đ/lần Đăng Tin Thường (mỗi chu kỳ 30 ngày)',
      '1 voucher giảm 400.000 đ áp dụng cho Tin VIP (mỗi chu kỳ 30 ngày)',
      '20 voucher giảm 10.000 đ/lần Đẩy Tin Thường (mỗi chu kỳ 30 ngày)',
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
      { months: 1, label: '1 tháng', duration_days: 30, price: 2200000, discount: 0 },
      { months: 3, label: '3 tháng', duration_days: 90, price: 6270000, discount: 5, note: 'Tiết kiệm thêm 5%' },
      { months: 6, label: '6 tháng', duration_days: 180, price: 11880000, discount: 10, note: 'Tiết kiệm thêm 10%' }
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
  { id: 'apartment', slug: 'can-ho-chung-cu', name: 'Căn hộ chung cư', icon: 'fa-building' },
  { id: 'mini-apartment', slug: 'chung-cu-mini', name: 'Chung cư mini, căn hộ dịch vụ', icon: 'fa-city' },
  { id: 'house', slug: 'nha-rieng', name: 'Nhà riêng', icon: 'fa-house' },
  { id: 'villa', slug: 'nha-biet-thu-lien-ke', name: 'Nhà biệt thự, liền kề', icon: 'fa-landmark' },
  { id: 'street-house', slug: 'nha-mat-pho', name: 'Nhà mặt phố', icon: 'fa-shop' },
  { id: 'shophouse', slug: 'shophouse-nha-pho-thuong-mai', name: 'Shophouse', icon: 'fa-store' },
  { id: 'project-land', slug: 'dat-nen-du-an', name: 'Đất nền dự án', icon: 'fa-mountain-sun' },
  { id: 'land', slug: 'dat', name: 'Đất', icon: 'fa-map' },
  { id: 'farm-resort', slug: 'trang-trai-khu-nghi-duong', name: 'Trang trại, khu nghỉ dưỡng', icon: 'fa-tree' },
  { id: 'condotel', slug: 'condotel', name: 'Condotel', icon: 'fa-hotel' },
  { id: 'warehouse', slug: 'kho-nha-xuong', name: 'Kho, nhà xưởng', icon: 'fa-warehouse' },
  { id: 'other', slug: 'bat-dong-san-khac', name: 'Loại BĐS khác', icon: 'fa-shapes' }
];


import { VIETNAM_ADMINISTRATIVE_DATA } from './vietnamAdministrativeData.js';

export const LOCATIONS = VIETNAM_ADMINISTRATIVE_DATA;

export const INITIAL_PROPERTIES = [
  {
    "id": "BDS-001",
    "title": "SIÊU DỰ ÁN PENTHOUSE DUPLEX WYNDHAM SOLEIL ĐÀ NẴNG VIEW TRỌN BIỂN MỸ KHÊ - FULL NỘI THẤT Ý",
    "slug": "penthouse-duplex-wyndham-soleil-da-nang-view-bien-my-khe",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 38500000000,
    "priceDisplay": "38.5 tỷ",
    "pricePerM2": "137.5 triệu/m²",
    "area": 280,
    "facade": 12,
    "entranceRoad": 30,
    "roadType": "car_pass",
    "bedroom": 4,
    "bathroom": 5,
    "floor": 48,
    "direction": "Đông Nam",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp nhập khẩu Versace & B&B Italia",
    "address": "Góc Võ Nguyên Giáp & Phạm Văn Đồng, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
    "street": "Võ Nguyên Giáp",
    "ward": "Phường Phước Mỹ",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "project": "Wyndham Soleil Danang",
    "lat": 16.0684,
    "lng": 108.2467,
    "description": "Tuyệt phẩm căn hộ Penthouse Duplex áp mái Wyndham Soleil Danang - Biểu tượng kiến trúc mặt biển Đà Nẵng.\n- Thiết kế thông tầng trần cao 6.8m, kính Low-E tràn viền panorama 360 độ ngắm trọn biển Mỹ Khê và cầu Rồng lung linh pháo hoa.\n- Bố trí 4 phòng ngủ Master khép kín, phòng chiếu phim riêng, phòng gym mini, quầy bar rượu vang cao cấp.\n- Hệ thống SmartHome điều khiển giọng nói toàn diện.\n- Đặc quyền cư dân VIP: Hồ bơi vô cực trên không, bãi đỗ trực thăng, sảnh Lounge VIP đón tiếp riêng biệt.\n- Pháp lý: Sổ hồng sở hữu lâu dài, sẵn sàng công chứng sang tên trong ngày.",
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
        "name": "Ban công ngắm Biển Mỹ Khê",
        "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Hồ bơi vô cực trên không",
      "Khu Spa 5 sao",
      "Công viên Biển Đông",
      "Bến du thuyền Sông Hàn",
      "Bệnh viện Quốc tế Vinmec Đà Nẵng",
      "Trường Quốc tế Skyline",
      "TTTM Vincom Plaza"
    ],
    "nearbyFacilities": [
      {
        "name": "Bãi tắm Biển Mỹ Khê",
        "distance": "100m"
      },
      {
        "name": "Công viên Biển Đông",
        "distance": "150m"
      },
      {
        "name": "Cầu Rồng & Cầu Sông Hàn",
        "distance": "1.5km"
      },
      {
        "name": "Sân bay Quốc tế Đà Nẵng",
        "distance": "4.5km"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS Cao Cấp",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
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
    "title": "BIỆT THỰ ĐƠN LẬP MẶT BIỂN HYATT REGENCY ĐÀ NẴNG 450M2 HỒ BƠI RIÊNG SANG TRỌNG BẬC NHẤT ĐÀ THÀNH",
    "slug": "biet-thu-don-lap-mat-bien-hyatt-regency-da-nang-450m2",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "villa",
    "propertyTypeName": "Nhà biệt thự, liền kề",
    "price": 78000000000,
    "priceDisplay": "78 tỷ",
    "pricePerM2": "173.3 triệu/m²",
    "area": 450,
    "facade": 18,
    "entranceRoad": 20,
    "roadType": "car_pass",
    "bedroom": 6,
    "bathroom": 7,
    "floor": 3,
    "direction": "Nam",
    "balconyDirection": "Đông",
    "legal": "Sổ đỏ vĩnh viễn sẵn sàng giao dịch",
    "furniture": "Hoàn thiện tâm huyết gỗ gõ đỏ Pachy nhập khẩu, thang máy kính",
    "address": "Đường Trường Sa, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, Đà Nẵng",
    "street": "Trường Sa",
    "ward": "Phường Khuê Mỹ",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "project": "Hyatt Regency Danang Residences",
    "lat": 16.0125,
    "lng": 108.2612,
    "description": "Gia chủ cần nhượng lại căn Biệt thự đơn lập mặt biển đẹp nhất Hyatt Regency Danang Resort & Spa.\n- Lô góc 2 mặt tiền cực rộng, mặt trước ôm trọn bãi cát trắng mịn và biển xanh ngọc bích.\n- Sân vườn rộng rãi trồng dừa và hoa nhiệt đới, hồ bơi riêng tràn bờ ngắm bình minh.\n- Xây dựng 3 tầng nổi với phong cách kiến trúc nhiệt đới đương đại kết hợp tinh hoa nội thất gỗ tự nhiên.\n- An ninh 3 lớp bảo vệ 24/7, cộng đồng cư dân thượng lưu và các chủ tịch tập đoàn lớn.",
    "images": [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
    ],
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Sân vườn & Hồ bơi riêng mặt biển",
        "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Bãi biển riêng biệt",
      "Bể bơi vô cực",
      "Sân Tennis tiêu chuẩn quốc tế",
      "Trường Quốc tế Singapore",
      "Sân Golf BRG Danang"
    ],
    "nearbyFacilities": [
      {
        "name": "Danh thắng Ngũ Hành Sơn",
        "distance": "1.2km"
      },
      {
        "name": "Sân Golf BRG Danang Golf Resort",
        "distance": "2.5km"
      },
      {
        "name": "Phố cổ Hội An",
        "distance": "15km"
      }
    ],
    "author": {
      "id": "broker-02",
      "name": "Trần Thị Thu Hà",
      "title": "Chuyên Viên Tư Vấn BĐS Nghỉ Dưỡng Đà Nẵng",
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
    "queuePriority": "priority_diamond"
  },
  {
    "id": "BDS-003",
    "title": "NHÀ MẶT PHỐ NGUYỄN VĂN LINH HẢI CHÂU 8 TẦNG THANG MÁY - DÒNG TIỀN CHO THUÊ 180 TRIỆU/THÁNG",
    "slug": "nha-mat-pho-nguyen-van-linh-hai-chau-8-tang-thang-may",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "street-house",
    "propertyTypeName": "Nhà mặt phố",
    "price": 49500000000,
    "priceDisplay": "49.5 tỷ",
    "pricePerM2": "412.5 triệu/m²",
    "area": 120,
    "facade": 7.2,
    "entranceRoad": 24,
    "roadType": "car_pass",
    "bedroom": 12,
    "bathroom": 10,
    "floor": 8,
    "direction": "Tây Bắc",
    "balconyDirection": "Tây Bắc",
    "legal": "Sổ đỏ chính chủ, nở hậu đón tài lộc",
    "furniture": "Full điều hòa âm trần Daikin, hệ thống PCCC kiểm định chuẩn",
    "address": "Mặt phố Nguyễn Văn Linh, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng",
    "street": "Nguyễn Văn Linh",
    "ward": "Phường Hải Châu 1",
    "district": "Quận Hải Châu",
    "city": "Đà Nẵng",
    "lat": 16.0612,
    "lng": 108.2195,
    "description": "Vị trí kim cương ngay trục đường tài chính huyết mạch Nguyễn Văn Linh - Cầu Rồng.\n- Mặt tiền khủng 7.2m vỉa hè rộng 8m thênh thang, ô tô đỗ thoải mái ngày đêm.\n- Xây 8 tầng kiên cố khung bê tông cốt thép, thang máy nhập khẩu tốc độ cao tải trọng 1000kg.\n- Hiện đang cho Ngân hàng và Thẩm mỹ viện quốc tế thuê hợp đồng dài hạn 180 triệu/tháng (dòng tiền sinh lời 4.5%/năm).",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Thang máy nhập khẩu",
      "PCCC tiêu chuẩn mới",
      "Vỉa hè 8m",
      "Hầm để xe rộng"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Rồng Đà Nẵng",
        "distance": "300m"
      },
      {
        "name": "Sân bay Quốc tế Đà Nẵng",
        "distance": "1.5km"
      },
      {
        "name": "Bệnh viện Hoàn Mỹ Đà Nẵng",
        "distance": "600m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T13:03:41.203Z",
    "viewsCount": 2915,
    "callsCount": 84,
    "listingDays": 15,
    "expiresAt": "2026-10-30T10:00:00.000Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-004",
    "title": "CĂN HỘ 3PN SUN PONTE RESIDENCE CẦU RỒNG VIEW SÔNG HÀN - SỔ HỒNG TRAO TAY GIÁ CỰC TỐT",
    "slug": "can-ho-3pn-sun-ponte-residence-cau-rong-view-song-han",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 6800000000,
    "priceDisplay": "6.8 tỷ",
    "pricePerM2": "72.3 triệu/m²",
    "area": 94,
    "facade": 8,
    "entranceRoad": 20,
    "roadType": "car_pass",
    "bedroom": 3,
    "bathroom": 2,
    "floor": 18,
    "direction": "Đông Bắc",
    "balconyDirection": "Tây",
    "legal": "Sổ hồng sẵn, hỗ trợ vay bank 70%",
    "furniture": "Nội thất hiện đại gỗ An Cường cao cấp, đồ điện tử Samsung",
    "address": "Mặt đường Trần Hưng Đạo, Phường An Hải Tây, Quận Sơn Trà, Đà Nẵng",
    "street": "Trần Hưng Đạo",
    "ward": "Phường An Hải Tây",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "project": "Sun Ponte Residence (Cầu Rồng)",
    "lat": 16.061,
    "lng": 108.2325,
    "description": "Cần bán gấp căn hộ Sun Ponte Residence tháp The Ponte ven bờ sông Hàn, view trực diện Cầu Rồng và Cầu Tình Yêu xanh mát, cực kỳ đẳng cấp.\n- Diện tích 94m² thiết kế 3 phòng ngủ thoáng sáng đón gió sông trong lành.\n- Kết nối trực tiếp trung tâm Hải Châu qua Cầu Rồng chỉ 2 phút di chuyển.\n- Tiện ích nội khu đẳng cấp: Bến du thuyền Sun Group, hồ bơi vô cực view pháo hoa quốc tế, phòng gym tiêu chuẩn 5 sao.",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Phòng khách view Cầu Rồng & Sông Hàn",
        "img": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Hồ bơi vô cực ngắm Cầu Rồng",
      "Phòng tập Gym",
      "Bến du thuyền sông Hàn",
      "Sân chơi trẻ em",
      "TTTM Vincom Center Đà Nẵng"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Rồng Đà Nẵng",
        "distance": "150m"
      },
      {
        "name": "Cầu Tình Yêu & Tượng Cá Chép Hóa Rồng",
        "distance": "200m"
      },
      {
        "name": "Bãi biển Mỹ Khê",
        "distance": "1.8km"
      }
    ],
    "author": {
      "id": "broker-03",
      "name": "Lê Hoàng Nam",
      "title": "Môi Giới Chuyên Căn Hộ Sông Hàn Đà Nẵng",
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
    "propertyType": "project-land",
    "propertyTypeName": "Đất nền dự án",
    "price": 3650000000,
    "priceDisplay": "3.65 tỷ",
    "pricePerM2": "36.5 triệu/m²",
    "area": 100,
    "facade": 5,
    "entranceRoad": 7.5,
    "roadType": "car_pass",
    "bedroom": 0,
    "bathroom": 0,
    "floor": 0,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ đỏ chính chủ, xây dựng tự do",
    "furniture": "Đất trống hạ tầng hoàn thiện 100%",
    "address": "Đường Nguyễn Mậu Tài, Khu Đô Thị Nam Hòa Xuân, Quận Ngũ Hành Sơn, Đà Nẵng",
    "street": "Nguyễn Mậu Tài",
    "ward": "Phường Hòa Quý",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "project": "Khu đô thị Nam Hòa Xuân (Sun Group)",
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
    "title": "CHO THUÊ NHÀ PHỐ NGUYÊN CĂN SƠN TRÀ PHẠM VĂN ĐỒNG TIỆN LÀM SPA, VĂN PHÒNG HOẶC HOMESTAY DU LỊCH",
    "slug": "cho-thue-nha-pho-nguyen-can-son-tra-pham-van-dong",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "rent",
    "propertyType": "house",
    "propertyTypeName": "Nhà riêng",
    "price": 65000000,
    "priceDisplay": "65 Triệu/tháng",
    "pricePerM2": "325.000 đ/m²",
    "area": 200,
    "facade": 6,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 5,
    "bathroom": 5,
    "floor": 4,
    "direction": "Đông Nam",
    "balconyDirection": "Đông Nam",
    "legal": "Hợp đồng công chứng pháp lý rõ ràng",
    "furniture": "Đầy đủ nội thất và thiết bị từng phòng ngủ",
    "address": "Đường Phạm Văn Đồng, Phường An Hải Bắc, Quận Sơn Trà, Đà Nẵng",
    "street": "Phạm Văn Đồng",
    "ward": "Phường An Hải Bắc",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "lat": 16.0712,
    "lng": 108.2355,
    "description": "Cho thuê nhà nguyên căn trục đại lộ du lịch biển Phạm Văn Đồng - Sơn Trà.\n- Kết cấu 1 trệt 3 lầu sân thượng thoáng mát. Mặt tiền đường lớn vỉa hè rộng rãi đậu đỗ xe thoải mái.\n- Từng phòng đều có WC riêng, ban công đón gió biển. Thích hợp kinh doanh homestay, căn hộ dịch vụ cho chuyên gia nước ngoài, hoặc mở spa làm đẹp.",
    "images": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Đường lớn vỉa hè rộng",
      "Gần bãi biển Mỹ Khê",
      "Gần cầu Sông Hàn"
    ],
    "nearbyFacilities": [
      {
        "name": "Bãi biển Mỹ Khê",
        "distance": "600m"
      },
      {
        "name": "Cầu Sông Hàn & TTTM Vincom",
        "distance": "800m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Môi Giới Cho Thuê Nhà Biển Đà Nẵng",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-11T16:00:00Z",
    "viewsCount": 1650,
    "callsCount": 37,
    "listingDays": 15,
    "expiresAt": "2026-10-26T18:38:31.750Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-007",
    "title": "BÁN NHÀ RIÊNG KIỆT Ô TÔ HÙNG VƯƠNG THANH KHÊ 45M2 X 3 TẦNG GẦN CHỢ CỒN - SỔ HỒNG VUÔNG VẮN",
    "slug": "ban-nha-rieng-hung-vuong-thanh-khe-45m2",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "sale",
    "propertyType": "house",
    "propertyTypeName": "Nhà riêng",
    "price": 6200000000,
    "priceDisplay": "6.2 tỷ",
    "pricePerM2": "137.7 triệu/m²",
    "area": 45,
    "facade": 4.5,
    "entranceRoad": 5,
    "roadType": "car_pass",
    "bedroom": 4,
    "bathroom": 4,
    "floor": 5,
    "direction": "Tây Nam",
    "balconyDirection": "Tây Nam",
    "legal": "Sổ đỏ chính chủ, cất két giao dịch ngay",
    "furniture": "Cơ bản, sàn gỗ, tủ bếp hiện đại",
    "address": "Kiệt ô tô Hùng Vương, Phường Vĩnh Trung, Quận Thanh Khê, Đà Nẵng",
    "street": "Hùng Vương",
    "ward": "Phường Vĩnh Trung",
    "district": "Quận Thanh Khê",
    "city": "Đà Nẵng",
    "lat": 16.0691,
    "lng": 108.2144,
    "description": "Bán nhà kiệt ô tô trung tâm Thanh Khê Đà Nẵng, dân trí cao, an ninh tuyệt đối gần chợ Cồn và Big C:\n- Nhà chủ tự xây kiên cố để ở, thiết kế hiện đại, giếng trời thông thoáng.\n- Tầng 1: Phòng khách + bếp + WC. Tầng 2, 3: Mỗi tầng phòng ngủ rộng + WC khép kín. Sân thượng: Phòng thờ + sân phơi thoáng mát.",
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
        "name": "Chợ Cồn Đà Nẵng",
        "distance": "300m"
      },
      {
        "name": "Siêu thị GO! Đà Nẵng (Big C)",
        "distance": "400m"
      },
      {
        "name": "Sân bay Quốc tế Đà Nẵng",
        "distance": "1.8km"
      }
    ],
    "author": {
      "id": "broker-05",
      "name": "Phạm Hải Đăng",
      "title": "Môi Giới Nhà Phố Thanh Khê Đà Nẵng",
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
    "expiresAt": "2026-10-25T16:38:31.750Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-008",
    "title": "BÁN ĐẤT THỔ CƯ 80M2 TẠI LIÊN CHIỂU ĐÀ NẴNG GẦN LÀNG ĐẠI HỌC BÁCH KHOA ĐÀ NẴNG",
    "slug": "ban-dat-tho-cu-80m2-lien-chieu-da-nang",
    "vipPackageId": "normal",
    "status": "expired",
    "demand": "sale",
    "propertyType": "land",
    "propertyTypeName": "Đất",
    "price": 2450000000,
    "priceDisplay": "2.45 tỷ",
    "pricePerM2": "30.6 triệu/m²",
    "area": 80,
    "facade": 5,
    "entranceRoad": 5,
    "roadType": "car_pass",
    "bedroom": 0,
    "bathroom": 0,
    "floor": 0,
    "direction": "Đông Nam",
    "balconyDirection": "Đông Nam",
    "legal": "Sổ hồng riêng từng nền",
    "furniture": "Đất trống",
    "address": "Đường Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng",
    "street": "Nguyễn Lương Bằng",
    "ward": "Phường Hòa Khánh Bắc",
    "district": "Quận Liên Chiểu",
    "city": "Đà Nẵng",
    "lat": 16.0745,
    "lng": 108.1492,
    "description": "Chính chủ gửi bán lô đất thổ cư xây dựng tự do tại Liên Chiểu Đà Nẵng. Cách cổng trường Đại học Bách Khoa chỉ 800m, xung quanh dân cư sầm uất, thích hợp xây căn hộ mini, nhà trọ cho sinh viên hoặc an cư lâu dài.",
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
        "name": "Trường Đại Học Bách Khoa Đà Nẵng",
        "distance": "800m"
      },
      {
        "name": "Khu Công Nghiệp Hòa Khánh",
        "distance": "1.5km"
      },
      {
        "name": "Bến xe Trung tâm Đà Nẵng",
        "distance": "3km"
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
    "publishedAt": "2026-09-20T08:00:00Z",
    "viewsCount": 780,
    "callsCount": 14,
    "listingDays": 15,
    "expiresAt": "2026-10-05T08:00:00Z",
    "autoRenew": false,
    "queuePriority": "standard_fifo"
  },
  {
    "id": "BDS-009",
    "title": "CẦN BÁN GẤP CĂN SHOPHOUSE KHỐI ĐẾ CHUNG CƯ CẨM LỆ ĐÀ NẴNG ĐANG KINH DOANH CAFE HIGHLANDS",
    "slug": "ban-shophouse-cam-le-da-nang-dang-cho-thue-cafe",
    "vipPackageId": "normal",
    "status": "active",
    "demand": "sale",
    "propertyType": "shophouse",
    "propertyTypeName": "Shophouse",
    "price": 16500000000,
    "priceDisplay": "16.5 tỷ",
    "pricePerM2": "110 triệu/m²",
    "area": 150,
    "facade": 10,
    "entranceRoad": 20,
    "roadType": "car_pass",
    "bedroom": 1,
    "bathroom": 2,
    "floor": 2,
    "direction": "Đông Bắc",
    "balconyDirection": "Đông Bắc",
    "legal": "Sổ hồng 50 năm",
    "furniture": "Hoàn thiện đồng bộ",
    "address": "Đường Cách Mạng Tháng 8, Phường Khuê Trung, Quận Cẩm Lệ, Đà Nẵng",
    "street": "Cách Mạng Tháng 8",
    "ward": "Phường Khuê Trung",
    "district": "Quận Cẩm Lệ",
    "city": "Đà Nẵng",
    "lat": 16.0315,
    "lng": 108.2045,
    "description": "Shophouse khối đế tòa căn hộ cao tầng trung tâm Cẩm Lệ Đà Nẵng đang cho thương hiệu Highlands Coffee thuê dài hạn dòng tiền ổn định 60 triệu/tháng. Mặt tiền đường lớn Cách Mạng Tháng 8 thông thoáng, bãi đỗ ô tô xe máy rộng rãi.",
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
        "name": "Trung tâm Hội chợ Triển lãm Đà Nẵng",
        "distance": "400m"
      },
      {
        "name": "Cầu Cẩm Lệ",
        "distance": "800m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Giám Đốc Kinh Doanh BĐS Đà Nẵng",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T06:00:00Z",
    "viewsCount": 312,
    "callsCount": 18,
    "listingDays": 15,
    "expiresAt": "2026-10-30T14:28:32.641Z",
    "autoRenew": false,
    "queuePriority": "standard_fifo"
  },
  {
    "id": "BDS-010",
    "title": "BÁN CĂN HỘ THE MONARCHY TRẦN HƯNG ĐẠO VEN SÔNG HÀN 75M² 2PN VIEW PHÁO HOA",
    "slug": "ban-can-ho-the-monarchy-tran-hung-dao-ven-song-han-75m-2pn",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 3500000000,
    "priceDisplay": "3.5 tỷ",
    "pricePerM2": "46.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Tây",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "address": "Trần Hưng Đạo, (Dự án: Chung cư Monarchy Đà Nẵng), Phường An Hải Tây, Quận Sơn Trà, Đà Nẵng",
    "street": "Trần Hưng Đạo",
    "ward": "Phường An Hải Tây",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "project": "Chung cư Monarchy Đà Nẵng",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp The Monarchy view sông Hàn tuyệt đẹp:\n- Diện tích thông thủy: 75m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Đông, ban công hướng Tây ngắm cầu Rồng phun lửa và pháo hoa sông Hàn.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Vũ RB",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://plus.unsplash.com/premium_photo-1682095969640-cade58e5c561?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "authorType": "member"
    },
    "publishedAt": "2026-10-15T12:04:10.754Z",
    "listingDays": 15,
    "expiresAt": "2026-10-30T12:04:10.754Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-011",
    "title": "BÁN CĂN HỘ FPT PLAZA 2 NGŨ HÀNH SƠN ĐÀ NẴNG 75M² 2PN GIÁ TỐT CÔNG CHỨNG NGAY",
    "slug": "ban-can-ho-fpt-plaza-2-ngu-hanh-son-da-nang-75m-2pn-gia-tot",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 2200000000,
    "priceDisplay": "2.2 tỷ",
    "pricePerM2": "29.3 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 9,
    "direction": "Đông Nam",
    "balconyDirection": "Đông Nam",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "address": "Nam Kỳ Khởi Nghĩa, (Dự án: Chung cư FPT Plaza 1 & 2), Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng",
    "street": "Nam Kỳ Khởi Nghĩa",
    "ward": "Phường Hòa Hải",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "project": "Chung cư FPT Plaza 1 & 2",
    "description": "Chính chủ cần bán gấp căn hộ FPT Plaza 2 khu đô thị FPT City Đà Nẵng:\n- Diện tích thông thủy: 75m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Tây, ban công hướng Đông Nam thoáng mát nhìn về sông Cổ Cò.\n- Đầy đủ nội thất: Tủ bếp, bếp từ, điều hòa, sàn gạch bóng kiếng, khóa cửa thông minh.\n- Tiện ích nội khu đồng bộ: Công viên FPT, hồ bơi, trường quốc tế FPT School, đại học FPT, an ninh 24/7.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Vũ RB",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://plus.unsplash.com/premium_photo-1682095969640-cade58e5c561?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "authorType": "member"
    },
    "publishedAt": "2026-10-15T14:49:09.983Z",
    "listingDays": 15,
    "expiresAt": "2026-10-30T14:49:09.983Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-012",
    "title": "BÁN CĂN HỘ CAO CẤP BẠCH ĐẰNG COMPLEX SÔNG HÀN 75M² 2PN FULL NỘI THẤT HẢI CHÂU",
    "slug": "ban-can-ho-cao-cap-bach-dang-complex-song-han-75m-2pn-full-noi-that",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 4800000000,
    "priceDisplay": "4.8 tỷ",
    "pricePerM2": "64.0 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 18,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "address": "Bạch Đằng, (Dự án: Chung cư Bạch Đằng Complex), Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng",
    "street": "Bạch Đằng",
    "ward": "Phường Hải Châu 1",
    "district": "Quận Hải Châu",
    "city": "Đà Nẵng",
    "project": "Chung cư Bạch Đằng Complex",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view sông Hàn thoáng đẹp:\n- Diện tích thông thủy: 75m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Tây, ban công hướng Đông ngắm trực diện Cầu Sông Hàn thơ mộng.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Hội Viên Tiêu Chuẩn",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 1,
      "authorType": "member"
    },
    "publishedAt": "2026-10-15T14:49:35.321Z",
    "listingDays": 15,
    "expiresAt": "2026-10-30T15:05:24.756Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-013",
    "title": "BÁN CĂN HỘ THE SANG RESIDENCE VÕ NGUYÊN GIÁP MỸ KHÊ 75M² 2PN VIEW BIỂN TUYỆT ĐẸP",
    "slug": "ban-can-ho-the-sang-residence-vo-nguyen-giap-my-khe-75m-2pn-view-bien",
    "vipPackageId": "normal",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 3800000000,
    "priceDisplay": "3.8 tỷ",
    "pricePerM2": "50.7 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 12,
    "direction": "Đông Nam",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "address": "Võ Nguyên Giáp, (Dự án: The Sang Residence), Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
    "street": "Võ Nguyên Giáp",
    "ward": "Phường Phước Mỹ",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "project": "The Sang Residence",
    "description": "Chính chủ cần bán gấp căn hộ cao cấp view biển Mỹ Khê cực đẹp:\n- Diện tích thông thủy: 75m2, thiết kế tối ưu 2 phòng ngủ, 2 WC riêng biệt.\n- Cửa chính hướng Tây Nam, ban công hướng Đông ngắm trọn bình minh trên biển Đà Nẵng.\n- Đầy đủ nội thất cao cấp: Tủ bếp gỗ An Cường, bếp từ Bosch, điều hòa âm trần Daikin, sàn gỗ nhập khẩu, khóa cửa thông minh Hafele.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Hội Viên Tiêu Chuẩn",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 1,
      "authorType": "member"
    },
    "publishedAt": "2026-10-15T14:55:17.069Z",
    "listingDays": 15,
    "expiresAt": "2026-10-30T15:55:17.641Z",
    "autoRenew": false,
    "queuePriority": "standard_fifo"
  },
  {
    "id": "BDS-014",
    "title": "BÁN CĂN HỘ CHUNG CƯ THE FILMORE ĐÀ NẴNG (BẠCH ĐẰNG) 75M² 2PN 5.5 TỶ VIEW SÔNG HÀN",
    "slug": "ban-can-ho-chung-cu-the-filmore-da-nang-bach-dang-75m-2pn-55-ty",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "apartment",
    "propertyTypeName": "Căn hộ chung cư",
    "price": 5500000000,
    "priceDisplay": "5.5 tỷ",
    "pricePerM2": "73.3 tr/m²",
    "area": 75,
    "facade": 5,
    "entranceRoad": 20,
    "roadType": "car_pass",
    "bedroom": 2,
    "bathroom": 2,
    "floor": 16,
    "direction": "Đông Nam",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng lâu dài chính chủ",
    "furniture": "Full nội thất cao cấp",
    "address": "Bạch Đằng, (Dự án: The Filmore Đà Nẵng (Bạch Đằng)), Phường Bình Thuận, Quận Hải Châu, Đà Nẵng",
    "street": "Bạch Đằng",
    "ward": "Phường Bình Thuận",
    "district": "Quận Hải Châu",
    "city": "Đà Nẵng",
    "project": "The Filmore Đà Nẵng (Bạch Đằng)",
    "description": "Chính chủ cần bán căn hộ cao cấp The Filmore mặt đường Bạch Đằng ven sông Hàn:\n- Tầm nhìn triệu đô trực diện Cầu Rồng và Cầu Trần Thị Lý.\n- Tiện ích chuẩn khách sạn 5 sao: Hồ bơi vô cực nước ấm, phòng tiệc cigar & rượu vang, gym trên không.",
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "author": {
      "id": "admin-01",
      "name": "Trần Vũ RB",
      "title": "Hội Viên Cao Cấp VIP",
      "phone": "0898 246 607",
      "zalo": "0898246607",
      "avatar": "https://plus.unsplash.com/premium_photo-1682095969640-cade58e5c561?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": false,
      "rating": 5,
      "reviewCount": 1,
      "authorType": "member"
    },
    "publishedAt": "2026-10-15T14:57:50.044Z",
    "listingDays": 15,
    "expiresAt": "2026-10-30T14:57:50.043Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-015",
    "title": "BÁN TÒA CĂN HỘ DỊCH VỤ AN THƯỢNG NGŨ HÀNH SƠN 6 TẦNG 12 CĂN ĐANG FULL PHÒNG TÂY THUÊ 110TR/THÁNG",
    "slug": "ban-toa-can-ho-dich-vu-an-thuong-ngu-hanh-son-6-tang-12-can",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "mini-apartment",
    "propertyTypeName": "Chung cư mini, căn hộ dịch vụ",
    "price": 18500000000,
    "priceDisplay": "18.5 tỷ",
    "pricePerM2": "168.2 triệu/m²",
    "area": 110,
    "facade": 7.5,
    "entranceRoad": 7.5,
    "roadType": "car_pass",
    "bedroom": 12,
    "bathroom": 12,
    "floor": 6,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng hoàn công đầy đủ PCCC chuẩn",
    "furniture": "Full nội thất từng căn studio hiện đại, thang máy thẻ từ",
    "address": "Đường An Thượng 2, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng",
    "street": "An Thượng 2",
    "ward": "Phường Mỹ An",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "lat": 16.0521,
    "lng": 108.2435,
    "description": "Cần bán gấp tòa căn hộ dịch vụ khách sạn phố Tây An Thượng - Khu vực khách nước ngoài lưu trú đông nhất Đà Nẵng.\n- Diện tích đất 110m2, xây dựng 6 tầng có thang máy tốc độ cao, thang thoát hiểm PCCC nghiệm thu chuẩn.\n- Thiết kế 12 căn hộ Studio khép kín đầy đủ bếp, ban công thoáng mát.\n- Dòng tiền khai thác ổn định 100 - 120 triệu/tháng (tỷ suất sinh lời ~7.5%/năm).",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Căn hộ Studio mẫu",
        "img": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Thang máy thẻ từ",
      "PCCC kiểm định",
      "Phố đi bộ An Thượng",
      "Cách biển 200m"
    ],
    "nearbyFacilities": [
      {
        "name": "Bãi biển Mỹ Khê",
        "distance": "200m"
      },
      {
        "name": "Khu phố Tây An Thượng",
        "distance": "50m"
      },
      {
        "name": "Đại học Kinh Tế Đà Nẵng",
        "distance": "1.2km"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Chuyên Gia Căn Hộ Dịch Vụ Dòng Tiền",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T15:00:00Z",
    "viewsCount": 3840,
    "callsCount": 95,
    "listingDays": 30,
    "expiresAt": "2026-11-15T15:00:00Z",
    "autoRenew": true,
    "queuePriority": "priority_diamond"
  },
  {
    "id": "BDS-016",
    "title": "CHO THUÊ CĂN HỘ STUDIO DỊCH VỤ FULL NỘI THẤT CAO CẤP GẦN BIỂN MỸ KHÊ SƠN TRÀ",
    "slug": "cho-thue-can-ho-studio-dich-vu-full-noi-that-bien-my-khe-son-tra",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "rent",
    "propertyType": "mini-apartment",
    "propertyTypeName": "Chung cư mini, căn hộ dịch vụ",
    "price": 8500000,
    "priceDisplay": "8.5 Triệu/tháng",
    "pricePerM2": "223.000 đ/m²",
    "area": 38,
    "facade": 4,
    "entranceRoad": 6,
    "roadType": "car_pass",
    "bedroom": 1,
    "bathroom": 1,
    "floor": 3,
    "direction": "Đông Nam",
    "balconyDirection": "Đông",
    "legal": "Hợp đồng thuê linh hoạt từ 3 - 12 tháng",
    "furniture": "Full nội thất cao cấp: Giường nệm xịn, sofa, smart TV, máy giặt riêng, bếp từ",
    "address": "Đường Hà Bổng, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
    "street": "Hà Bổng",
    "ward": "Phường Phước Mỹ",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "lat": 16.0645,
    "lng": 108.243,
    "description": "Căn hộ dịch vụ mới 100% cách bãi biển Mỹ Khê chỉ 3 phút đi bộ:\n- Tòa nhà có thang máy, bảo vệ 24/7, camera an ninh, hầm để xe máy rộng rãi.\n- Miễn phí dọn phòng 1 lần/tuần, nước sinh hoạt, wifi tốc độ cao.\n- Phù hợp khách nước ngoài, chuyên gia làm việc tại Đà Nẵng hoặc người đi công tác dài hạn.",
    "images": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Thang máy",
      "Bảo vệ 24/7",
      "Dọn phòng miễn phí",
      "Máy giặt riêng"
    ],
    "nearbyFacilities": [
      {
        "name": "Bãi biển Mỹ Khê",
        "distance": "150m"
      },
      {
        "name": "Chợ đêm Sơn Trà",
        "distance": "1.2km"
      }
    ],
    "author": {
      "id": "broker-03",
      "name": "Lê Hoàng Nam",
      "title": "Chuyên Cho Thuê Căn Hộ Biển",
      "phone": "0938 555 777",
      "zalo": "0938555777",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 4.8,
      "reviewCount": 27
    },
    "publishedAt": "2026-10-15T09:30:00Z",
    "viewsCount": 1540,
    "callsCount": 48,
    "listingDays": 15,
    "expiresAt": "2026-10-30T09:30:00Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-017",
    "title": "BÁN CONDOTEL 5 SAO ARIA DANANG HOTEL & RESORT MẶT BIỂN TRƯỜNG SA CAM KẾT LỢI NHUẬN 10%/NĂM",
    "slug": "ban-condotel-5-sao-aria-danang-hotel-resort-mat-bien-truong-sa",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "condotel",
    "propertyTypeName": "Condotel",
    "price": 2850000000,
    "priceDisplay": "2.85 tỷ",
    "pricePerM2": "59.4 tr/m²",
    "area": 48,
    "facade": 6,
    "entranceRoad": 33,
    "roadType": "car_pass",
    "bedroom": 1,
    "bathroom": 1,
    "floor": 15,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Hợp đồng mua bán chính chủ, chia sẻ lợi nhuận minh bạch",
    "furniture": "Full nội thất chuẩn khách sạn quốc tế 5 sao",
    "address": "Đường Trường Sa, Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng",
    "street": "Trường Sa",
    "ward": "Phường Hòa Hải",
    "district": "Quận Ngũ Hành Sơn",
    "city": "Đà Nẵng",
    "project": "Aria Danang Hotel & Resort",
    "lat": 15.992,
    "lng": 108.274,
    "description": "Cơ hội sở hữu căn hộ khách sạn Condotel nghỉ dưỡng mặt biển Đà Nẵng tại Aria Danang Hotel & Resort:\n- Vị trí kim cương trên cung đường tỷ đô Trường Sa kết nối Đà Nẵng - Hội An.\n- View trực diện biển Non Nước hoang sơ tuyệt đẹp.\n- Chương trình cam kết cho thuê chia sẻ lợi nhuận 85/15, tặng 15 đêm nghỉ dưỡng miễn phí mỗi năm.",
    "images": [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Căn hộ Condotel mặt biển",
        "img": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Bãi biển riêng",
      "Bể bơi tràn bờ",
      "Nhà hàng ẩm thực Á Âu",
      "Spa & Sauna"
    ],
    "nearbyFacilities": [
      {
        "name": "Danh thắng Non Nước Ngũ Hành Sơn",
        "distance": "1km"
      },
      {
        "name": "Sân Golf Montgomerie Links",
        "distance": "2km"
      },
      {
        "name": "Phố cổ Hội An",
        "distance": "12km"
      }
    ],
    "author": {
      "id": "broker-02",
      "name": "Trần Thị Thu Hà",
      "title": "Chuyên Viên Tư Vấn BĐS Nghỉ Dưỡng Đà Nẵng",
      "phone": "0912 888 999",
      "zalo": "0912888999",
      "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 52
    },
    "publishedAt": "2026-10-15T11:00:00Z",
    "viewsCount": 2890,
    "callsCount": 71,
    "listingDays": 30,
    "expiresAt": "2026-11-14T11:00:00Z",
    "autoRenew": true,
    "queuePriority": "priority_diamond"
  },
  {
    "id": "BDS-018",
    "title": "CHO THUÊ CĂN CONDOTEL HÒA BÌNH GREEN ĐÀ NẴNG VIEW VỊNH ĐÀ NẴNG DÁT VÀNG ĐẦY ĐỦ TIỆN NGHI",
    "slug": "cho-thue-condotel-hoa-binh-green-da-nang-view-vinh",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "rent",
    "propertyType": "condotel",
    "propertyTypeName": "Condotel",
    "price": 12000000,
    "priceDisplay": "12 Triệu/tháng",
    "pricePerM2": "222.000 đ/m²",
    "area": 54,
    "facade": 5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 1,
    "bathroom": 1,
    "floor": 20,
    "direction": "Bắc",
    "balconyDirection": "Bắc",
    "legal": "Hợp đồng thuê 6 tháng trở lên",
    "furniture": "Nội thất dát vàng đẳng cấp, bồn tắm nằm, smart home",
    "address": "Đường Lê Văn Duyệt, Phường Nại Hiên Đông, Quận Sơn Trà, Đà Nẵng",
    "street": "Lê Văn Duyệt",
    "ward": "Phường Nại Hiên Đông",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "project": "Hòa Bình Green Đà Nẵng",
    "lat": 16.0912,
    "lng": 108.2255,
    "description": "Cho thuê căn hộ Condotel Hòa Bình Green Đà Nẵng tầng 20 ngắm trọn vịnh Đà Nẵng và cầu Thuận Phước:\n- Tòa nhà nổi tiếng với hồ bơi vô cực dát vàng 24K cao nhất Đông Nam Á.\n- Không gian yên tĩnh, lộng gió, đầy đủ trang thiết bị tiện nghi cho gia đình hoặc chuyên gia.",
    "images": [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Bể bơi vô cực dát vàng",
      "Phòng gym",
      "Trung tâm thương mại",
      "Bãi đỗ trực thăng"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Thuận Phước",
        "distance": "300m"
      },
      {
        "name": "Bán đảo Sơn Trà",
        "distance": "3km"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Môi Giới Cho Thuê BĐS Nghỉ Dưỡng",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-14T08:00:00Z",
    "viewsCount": 1120,
    "callsCount": 33,
    "listingDays": 15,
    "expiresAt": "2026-10-29T08:00:00Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-019",
    "title": "BÁN KHU NGHỈ DƯỠNG TRANG TRẠI SINH THÁI VEN SUỐI HÒA VANG 2.500M2 CÓ SẴN NHÀ VƯỜN VIEW ĐỒI NÚI",
    "slug": "ban-khu-nghi-duong-trang-trai-sinh-thai-ven-suoi-hoa-vang-2500m2",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "farm-resort",
    "propertyTypeName": "Trang trại, khu nghỉ dưỡng",
    "price": 8900000000,
    "priceDisplay": "8.9 tỷ",
    "pricePerM2": "3.56 triệu/m²",
    "area": 2500,
    "facade": 35,
    "entranceRoad": 7.5,
    "roadType": "car_pass",
    "bedroom": 3,
    "bathroom": 3,
    "floor": 1,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ đỏ 400m2 đất ở + 2.100m2 đất vườn lâu dài",
    "furniture": "Đầy đủ nhà gỗ mộc mạc, ao cá, vườn bưởi da xanh và cây ăn trái",
    "address": "Tuyến đường ĐT 602 (đường lên Bà Nà), Xã Hòa Ninh, Huyện Hòa Vang, Đà Nẵng",
    "street": "ĐT 602",
    "ward": "Xã Hòa Ninh",
    "district": "Huyện Hòa Vang",
    "city": "Đà Nẵng",
    "lat": 16.035,
    "lng": 108.065,
    "description": "Cần bán khu trang trại nghỉ dưỡng sinh thái tâm huyết ven suối mát lành tại Hòa Ninh, Hòa Vang Đà Nẵng:\n- Diện tích 2.500m2 thế đất tựa sơn nghinh thủy, lưng tựa núi, mặt trước suối đá róc rách quanh năm.\n- Đã xây dựng sẵn căn nhà gỗ phong cách Bắc Âu tiện nghi, ao nuôi cá Koi, vườn cây ăn quả đang thu hoạch.\n- Khí hậu mát mẻ như Đà Lạt, chỉ cách khu du lịch Bà Nà Hills 10 phút lái xe.",
    "images": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Suối tự nhiên",
      "Ao cá",
      "Vườn ăn trái",
      "Nhà gỗ nghỉ dưỡng"
    ],
    "nearbyFacilities": [
      {
        "name": "Khu du lịch Sun World Ba Na Hills",
        "distance": "4km"
      },
      {
        "name": "Khu du lịch Suối Mơ",
        "distance": "2km"
      },
      {
        "name": "Trung tâm TP. Đà Nẵng",
        "distance": "18km"
      }
    ],
    "author": {
      "id": "broker-04",
      "name": "Võ Minh Quân",
      "title": "Chuyên Gia Nhà Vườn Sinh Thái Hòa Vang",
      "phone": "0905 678 999",
      "zalo": "0905678999",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      "isVerified": false,
      "rating": 4.7,
      "reviewCount": 15
    },
    "publishedAt": "2026-10-15T07:00:00Z",
    "viewsCount": 2150,
    "callsCount": 56,
    "listingDays": 15,
    "expiresAt": "2026-10-30T07:00:00Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-020",
    "title": "CHO THUÊ KHU NGHỈ DƯỠNG TRANG TRẠI SINH THÁI GLAMPING BÀ NÀ HÒA VANG ĐANG VẬN HÀNH DU LỊCH",
    "slug": "cho-thue-khu-nghi-duong-trang-trai-glamping-ba-na-hoa-vang",
    "vipPackageId": "vip-silver",
    "status": "active",
    "demand": "rent",
    "propertyType": "farm-resort",
    "propertyTypeName": "Trang trại, khu nghỉ dưỡng",
    "price": 35000000,
    "priceDisplay": "35 Triệu/tháng",
    "pricePerM2": "7.000 đ/m²",
    "area": 5000,
    "facade": 50,
    "entranceRoad": 10,
    "roadType": "car_pass",
    "bedroom": 8,
    "bathroom": 6,
    "floor": 1,
    "direction": "Đông Nam",
    "balconyDirection": "Đông Nam",
    "legal": "Hợp đồng thuê dài hạn 3 - 5 năm",
    "furniture": "Đầy đủ lều glamping cao cấp, khu BBQ ngoài trời, nhà điều hành",
    "address": "Quốc Lộ 14G, Xã Hòa Phú, Huyện Hòa Vang, Đà Nẵng",
    "street": "Quốc Lộ 14G",
    "ward": "Xã Hòa Phú",
    "district": "Huyện Hòa Vang",
    "city": "Đà Nẵng",
    "lat": 15.98,
    "lng": 108.03,
    "description": "Cho thuê lại toàn bộ mô hình Glamping & Camping dã ngoại sinh thái đang vận hành có lượng khách ổn định:\n- Diện tích 5.000m2 bãi cỏ xanh mướt trải dài ven suối nước tự nhiên.\n- Đầy đủ 8 lều Glamping safari chống nước, quầy bar cafe, khu vệ sinh sạch sẽ, hệ thống điện chiếu sáng năng lượng mặt trời.\n- Vào kinh doanh khai thác dòng tiền ngay không cần đầu tư thêm.",
    "images": [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Suối tự nhiên",
      "Khu cắm trại Glamping",
      "Bãi đỗ xe rộng",
      "Bếp BBQ ngoài trời"
    ],
    "nearbyFacilities": [
      {
        "name": "Khu du lịch sinh thái Hòa Phú Thành",
        "distance": "2km"
      },
      {
        "name": "Suối khoáng nóng Núi Thần Tài",
        "distance": "5km"
      }
    ],
    "author": {
      "id": "broker-04",
      "name": "Võ Minh Quân",
      "title": "Chuyên Gia Nhà Vườn Sinh Thái Hòa Vang",
      "phone": "0905 678 999",
      "zalo": "0905678999",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      "isVerified": false,
      "rating": 4.7,
      "reviewCount": 15
    },
    "publishedAt": "2026-10-14T10:00:00Z",
    "viewsCount": 1680,
    "callsCount": 39,
    "listingDays": 15,
    "expiresAt": "2026-10-29T10:00:00Z",
    "autoRenew": false,
    "queuePriority": "priority_silver"
  },
  {
    "id": "BDS-021",
    "title": "BÁN KHO XƯỞNG TIÊU CHUẨN CÔNG NGHIỆP KCN HÒA KHÁNH LIÊN CHIỂU 1.200M2 XE CONTAINER VÀO TẬN CỬA",
    "slug": "ban-kho-xuong-tieu-chuan-kcn-hoa-khanh-lien-chieu-1200m2",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "warehouse",
    "propertyTypeName": "Kho, nhà xưởng",
    "price": 14500000000,
    "priceDisplay": "14.5 tỷ",
    "pricePerM2": "12.1 triệu/m²",
    "area": 1200,
    "facade": 25,
    "entranceRoad": 15,
    "roadType": "truck",
    "bedroom": 2,
    "bathroom": 4,
    "floor": 1,
    "direction": "Đông Bắc",
    "balconyDirection": "Đông Bắc",
    "legal": "Sổ hồng đất cơ sở sản xuất kinh doanh, pháp lý đầy đủ",
    "furniture": "Khung thép tiền chế zamil kiên cố, nền bê tông chịu tải 5 tấn/m2, trạm điện 250kVA",
    "address": "Đường số 3 KCN Hòa Khánh, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng",
    "street": "Đường số 3 KCN Hòa Khánh",
    "ward": "Phường Hòa Khánh Bắc",
    "district": "Quận Liên Chiểu",
    "city": "Đà Nẵng",
    "lat": 16.082,
    "lng": 108.135,
    "description": "Chính chủ cần bán kho xưởng tiêu chuẩn hiện đại tại Khu Công Nghiệp Hòa Khánh, Liên Chiểu Đà Nẵng:\n- Diện tích đất 1.200m2, trần cao 8.5m thoáng mát, mái cách nhiệt chống nóng.\n- Có văn phòng điều hành 2 tầng khép kín, bảo vệ, nhà ăn cho công nhân.\n- Đầy đủ trạm biến áp riêng 250kVA, hệ thống PCCC tự động đã nghiệm thu.",
    "images": [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Trạm biến áp riêng",
      "PCCC tự động",
      "Xe container 40 feet vào tận xưởng",
      "Văn phòng điều hành"
    ],
    "nearbyFacilities": [
      {
        "name": "Cảng biển Liên Chiểu",
        "distance": "4km"
      },
      {
        "name": "Quốc Lộ 1A",
        "distance": "1km"
      },
      {
        "name": "Bến xe Trung tâm Đà Nẵng",
        "distance": "5km"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Chuyên Bất Động Sản Công Nghiệp & Kho Bãi",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-14T11:00:00Z",
    "viewsCount": 1890,
    "callsCount": 52,
    "listingDays": 15,
    "expiresAt": "2026-10-29T11:00:00Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-022",
    "title": "CHO THUÊ KHO CHỨA HÀNG 450M2 CẨM LỆ ĐÀ NẴNG GẦN CẦU ĐỎ XE TẢI NẶNG ĐỖ CỬA PCCC CHUẨN",
    "slug": "cho-thue-kho-chua-hang-450m2-cam-le-da-nang-gan-cau-do",
    "vipPackageId": "normal",
    "status": "active",
    "demand": "rent",
    "propertyType": "warehouse",
    "propertyTypeName": "Kho, nhà xưởng",
    "price": 28000000,
    "priceDisplay": "28 Triệu/tháng",
    "pricePerM2": "62.000 đ/m²",
    "area": 450,
    "facade": 15,
    "entranceRoad": 12,
    "roadType": "truck",
    "bedroom": 1,
    "bathroom": 2,
    "floor": 1,
    "direction": "Nam",
    "balconyDirection": "Nam",
    "legal": "Hợp đồng thuê linh hoạt từ 1 - 3 năm",
    "furniture": "Kho trống sàn phẳng epoxy, có văn phòng làm việc máy lạnh",
    "address": "Quốc Lộ 1A, Phường Hòa Thọ Tây, Quận Cẩm Lệ, Đà Nẵng",
    "street": "Quốc Lộ 1A",
    "ward": "Phường Hòa Thọ Tây",
    "district": "Quận Cẩm Lệ",
    "city": "Đà Nẵng",
    "lat": 16.015,
    "lng": 108.182,
    "description": "Cho thuê kho chứa hàng hóa tiêu dùng, logistic tại Hòa Thọ Tây, Cẩm Lệ Đà Nẵng:\n- Vị trí mặt tiền đường gom Quốc Lộ 1A gần cầu Đỏ, thuận tiện phân phối hàng hóa khắp miền Trung.\n- Kho cao ráo không ngập nước, có sân bãi đậu xe tải quay đầu thoải mái.",
    "images": [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Xe tải quay đầu",
      "Nền epoxy sạch",
      "Điện 3 pha",
      "Bảo vệ chung khu vực"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Đỏ Cẩm Lệ",
        "distance": "800m"
      },
      {
        "name": "Ngã 3 Huế",
        "distance": "4.5km"
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
    "publishedAt": "2026-10-13T14:00:00Z",
    "viewsCount": 920,
    "callsCount": 26,
    "listingDays": 15,
    "expiresAt": "2026-10-28T14:00:00Z",
    "autoRenew": false,
    "queuePriority": "standard_fifo"
  },
  {
    "id": "BDS-023",
    "title": "BÁN BIỆT THỰ VEN SÔNG KHU ĐÔ THỊ SUN COSMO RESIDENCE ĐÀ NẴNG CẦU TRẦN THỊ LÝ ĐẲNG CẤP THƯỢNG LƯU",
    "slug": "ban-biet-thu-ven-song-sun-cosmo-residence-da-nang-cau-tran-thi-ly",
    "vipPackageId": "vip-diamond",
    "status": "active",
    "demand": "sale",
    "propertyType": "villa",
    "propertyTypeName": "Nhà biệt thự, liền kề",
    "price": 26500000000,
    "priceDisplay": "26.5 tỷ",
    "pricePerM2": "106.0 triệu/m²",
    "area": 250,
    "facade": 12.5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 5,
    "bathroom": 6,
    "floor": 3,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ hồng sở hữu lâu dài",
    "furniture": "Hoàn thiện mặt ngoài sang trọng, thô bên trong dễ dàng thiết kế cá nhân hóa",
    "address": "Đường 2 Tháng 9, Phường Hòa Cường Bắc, Quận Hải Châu, Đà Nẵng",
    "street": "2 Tháng 9",
    "ward": "Phường Hòa Cường Bắc",
    "district": "Quận Hải Châu",
    "city": "Đà Nẵng",
    "project": "Sun Cosmo Residence Cầu Trần Thị Lý",
    "lat": 16.05,
    "lng": 108.225,
    "description": "Biệt thự phố Sun Cosmo Residence do tập đoàn Sun Group kiến tạo bên bờ sông Hàn thơ mộng:\n- Nằm tại giao lộ vàng Trần Thị Lý - 2 Tháng 9 - Nguyễn Văn Trỗi.\n- Thiết kế kiến trúc giao thoa truyền thống và hiện đại với những nan lam gỗ cách điệu mềm mại.\n- Không gian sống chuẩn resort giữa lòng trung tâm quận Hải Châu danh giá.",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": true,
    "vrScenes": [
      {
        "name": "Phòng khách biệt thự Cosmo",
        "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "amenities": [
      "Bến du thuyền sông Hàn",
      "Công viên cảnh quan ven sông",
      "Khu thể thao ngoài trời",
      "An ninh 24/7"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Trần Thị Lý",
        "distance": "100m"
      },
      {
        "name": "Công viên Châu Á Asia Park",
        "distance": "800m"
      },
      {
        "name": "Sân bay Quốc tế Đà Nẵng",
        "distance": "3km"
      }
    ],
    "author": {
      "id": "broker-02",
      "name": "Trần Thị Thu Hà",
      "title": "Chuyên Viên Tư Vấn Sun Group Đà Nẵng",
      "phone": "0912 888 999",
      "zalo": "0912888999",
      "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
      "isVerified": true,
      "rating": 5,
      "reviewCount": 52
    },
    "publishedAt": "2026-10-15T16:00:00Z",
    "viewsCount": 4210,
    "callsCount": 118,
    "listingDays": 30,
    "expiresAt": "2026-11-14T16:00:00Z",
    "autoRenew": true,
    "queuePriority": "priority_diamond"
  },
  {
    "id": "BDS-024",
    "title": "BÁN SHOPHOUSE THƯƠNG MẠI 2 MẶT TIỀN ĐƯỜNG NGUYỄN PHƯỚC LAN KHU ĐÔ THỊ HÒA XUÂN SỔ ĐỎ CHÍNH CHỦ",
    "slug": "ban-shophouse-2-mat-tien-nguyen-phuoc-lan-hoa-xuan",
    "vipPackageId": "vip-gold",
    "status": "active",
    "demand": "sale",
    "propertyType": "shophouse",
    "propertyTypeName": "Shophouse",
    "price": 11200000000,
    "priceDisplay": "11.2 tỷ",
    "pricePerM2": "74.7 triệu/m²",
    "area": 150,
    "facade": 7.5,
    "entranceRoad": 30,
    "roadType": "car_pass",
    "bedroom": 4,
    "bathroom": 5,
    "floor": 4,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ đỏ đã hoàn công công chứng sang tên ngay",
    "furniture": "Hoàn thiện 4 tầng cao cấp, có ô chờ thang máy",
    "address": "Đường Nguyễn Phước Lan, Phường Hòa Xuân, Quận Cẩm Lệ, Đà Nẵng",
    "street": "Nguyễn Phước Lan",
    "ward": "Phường Hòa Xuân",
    "district": "Quận Cẩm Lệ",
    "city": "Đà Nẵng",
    "project": "Khu đô thị sinh thái Hòa Xuân",
    "lat": 16.022,
    "lng": 108.215,
    "description": "Bán căn Shophouse thương mại trục đại lộ lớn nhất Hòa Xuân - đường Nguyễn Phước Lan rộng 30m:\n- Vị trí buôn bán kinh doanh đắc địa nhất khu vực, vỉa hè rộng 6m đỗ xe thênh thang.\n- Nhà xây dựng 4 tầng kiến trúc tân cổ điển, phù hợp mở phòng khám, spa, văn phòng công ty hoặc ngân hàng.",
    "images": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Mặt tiền 30m",
      "Vỉa hè 6m",
      "Ô chờ thang máy",
      "Khu dân cư đông đúc"
    ],
    "nearbyFacilities": [
      {
        "name": "Cầu Hòa Xuân",
        "distance": "500m"
      },
      {
        "name": "Sân vận động Hòa Xuân",
        "distance": "1.5km"
      }
    ],
    "author": {
      "id": "broker-04",
      "name": "Võ Minh Quân",
      "title": "Chuyên Viên BĐS Hòa Xuân Đà Nẵng",
      "phone": "0905 678 999",
      "zalo": "0905678999",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      "isVerified": false,
      "rating": 4.7,
      "reviewCount": 15
    },
    "publishedAt": "2026-10-15T13:00:00Z",
    "viewsCount": 2280,
    "callsCount": 64,
    "listingDays": 15,
    "expiresAt": "2026-10-30T13:00:00Z",
    "autoRenew": false,
    "queuePriority": "priority_gold"
  },
  {
    "id": "BDS-025",
    "title": "BÁN KHÁCH SẠN BOUTIQUE HOTEL 7 TẦNG MẶT PHỐ DU LỊCH HỒ NGHINH SƠN TRÀ 18 PHÒNG FULL NỘI THẤT",
    "slug": "ban-khach-san-boutique-hotel-7-tang-ho-nghinh-son-tra",
    "vipPackageId": "normal",
    "status": "active",
    "demand": "sale",
    "propertyType": "other",
    "propertyTypeName": "Loại BĐS khác",
    "price": 23500000000,
    "priceDisplay": "23.5 tỷ",
    "pricePerM2": "188.0 triệu/m²",
    "area": 125,
    "facade": 6.5,
    "entranceRoad": 15,
    "roadType": "car_pass",
    "bedroom": 18,
    "bathroom": 20,
    "floor": 7,
    "direction": "Đông",
    "balconyDirection": "Đông",
    "legal": "Sổ đỏ đã hoàn công khách sạn, PCCC và an ninh trật tự đầy đủ",
    "furniture": "Full trang thiết bị khách sạn 3 sao, thang máy thẻ từ, máy phát điện dự phòng",
    "address": "Đường Hồ Nghinh, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng",
    "street": "Hồ Nghinh",
    "ward": "Phường Phước Mỹ",
    "district": "Quận Sơn Trà",
    "city": "Đà Nẵng",
    "lat": 16.067,
    "lng": 108.241,
    "description": "Chính chủ cần bán khách sạn Boutique Hotel 7 tầng mặt tiền phố du lịch Hồ Nghinh Đà Nẵng:\n- Cách bãi biển Mỹ Khê chỉ 200m đi bộ.\n- Gồm 18 phòng nghỉ sang trọng, sảnh lễ tân, nhà hàng tầng lửng, quầy cafe sân thượng ngắm biển.\n- Giấy phép kinh doanh lưu trú, PCCC đạt chuẩn, vận hành đón khách ngay.",
    "images": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    "hasVR360": false,
    "amenities": [
      "Thang máy",
      "PCCC đạt chuẩn",
      "Máy phát điện dự phòng",
      "Gần biển 200m"
    ],
    "nearbyFacilities": [
      {
        "name": "Bãi biển Mỹ Khê",
        "distance": "200m"
      },
      {
        "name": "Công viên Biển Đông",
        "distance": "300m"
      }
    ],
    "author": {
      "id": "broker-01",
      "name": "Nguyễn Văn Tuấn",
      "title": "Chuyên Mua Bán Khách Sạn Đà Nẵng",
      "phone": "0908 123 456",
      "zalo": "0908123456",
      "avatar": "https://plus.unsplash.com/premium_photo-1661688797823-36e97735223e?auto=format&fit=crop&w=256&h=256&q=80",
      "isVerified": true,
      "rating": 4.9,
      "reviewCount": 38
    },
    "publishedAt": "2026-10-15T14:00:00Z",
    "viewsCount": 1980,
    "callsCount": 54,
    "listingDays": 15,
    "expiresAt": "2026-10-30T14:00:00Z",
    "autoRenew": false,
    "queuePriority": "standard_fifo"
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
    avatar: '/avatars/ai-preset-1.jpg',
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
    avatar: '/avatars/ai-preset-2.jpg',
    isVerified: true,
    activeListingsCount: 12,
    membership: {
      packageId: 'member-standard',
      packageName: 'Hội Viên Tiêu Chuẩn',
      shortName: 'GÓI TIÊU CHUẨN',
      billingMonths: 3,
      durationDays: 90,
      subscribedAt: '2026-10-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      status: 'active',
      isAutoRenew: false,
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
    name: 'Trần Vũ RB',
    email: 'tranvu.review@gmail.com',
    password: '123456',
    passwordHash: '$2b$10$jgjsVvPtPeI7WDBTiFSj1eDC8xz6aYTszoychODv7PYe.94N0oTNi',
    role: 'admin',
    roleName: 'Tổng Quản Trị Viên (CMS Admin)',
    walletBalance: 99999999,
    phone: '0898 246 607',
    avatar: '/avatars/ai-preset-2.jpg',
    membership: {
      packageId: 'member-premium',
      packageName: 'Hội Viên Cao Cấp VIP',
      shortName: 'GÓI CAO CẤP',
      billingMonths: 12,
      durationDays: 365,
      subscribedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2030-01-01T00:00:00Z',
      status: 'active',
      isAutoRenew: false,
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

// Cấu hình danh mục Menu Điều Hướng (Navigation Menu Items)
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
      { id: 'sub-sale-mini-apt', title: 'Bán Chung Cư Mini, Căn Hộ Dịch Vụ', path: '/ban-chung-cu-mini', icon: 'fa-solid fa-city' },
      { id: 'sub-sale-house', title: 'Bán Nhà Riêng', path: '/ban-nha-rieng', icon: 'fa-solid fa-house' },
      { id: 'sub-sale-villa', title: 'Bán Nhà Biệt Thự, Liền Kề', path: '/ban-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark' },
      { id: 'sub-sale-street', title: 'Bán Nhà Mặt Phố', path: '/ban-nha-mat-pho', icon: 'fa-solid fa-shop' },
      { id: 'sub-sale-shophouse', title: 'Bán Shophouse', path: '/ban-shophouse', icon: 'fa-solid fa-store' },
      { id: 'sub-sale-project-land', title: 'Bán Đất Nền Dự Án', path: '/ban-dat-nen-du-an', icon: 'fa-solid fa-mountain-sun' },
      { id: 'sub-sale-land', title: 'Bán Đất', path: '/ban-dat', icon: 'fa-solid fa-map' },
      { id: 'sub-sale-farm', title: 'Bán Trang Trại, Khu Nghỉ Dưỡng', path: '/ban-trang-trai-khu-nghi-duong', icon: 'fa-solid fa-tree' },
      { id: 'sub-sale-condotel', title: 'Bán Condotel', path: '/ban-condotel', icon: 'fa-solid fa-hotel' },
      { id: 'sub-sale-warehouse', title: 'Bán Kho, Nhà Xưởng', path: '/ban-kho-nha-xuong', icon: 'fa-solid fa-warehouse' },
      { id: 'sub-sale-other', title: 'Bán Loại BĐS Khác', path: '/ban-bat-dong-san-khac', icon: 'fa-solid fa-shapes' }
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
      { id: 'sub-rent-mini-apt', title: 'Cho Thuê Chung Cư Mini, Căn Hộ Dịch Vụ', path: '/cho-thue-chung-cu-mini', icon: 'fa-solid fa-city' },
      { id: 'sub-rent-house', title: 'Cho Thuê Nhà Riêng', path: '/cho-thue-nha-rieng', icon: 'fa-solid fa-house' },
      { id: 'sub-rent-villa', title: 'Cho Thuê Nhà Biệt Thự, Liền Kề', path: '/cho-thue-nha-biet-thu-lien-ke', icon: 'fa-solid fa-landmark' },
      { id: 'sub-rent-street', title: 'Cho Thuê Nhà Mặt Phố', path: '/cho-thue-nha-mat-pho', icon: 'fa-solid fa-shop' },
      { id: 'sub-rent-shophouse', title: 'Cho Thuê Shophouse', path: '/cho-thue-shophouse', icon: 'fa-solid fa-store' },
      { id: 'sub-rent-project-land', title: 'Cho Thuê Đất Nền Dự Án', path: '/cho-thue-dat-nen-du-an', icon: 'fa-solid fa-mountain-sun' },
      { id: 'sub-rent-land', title: 'Cho Thuê Đất', path: '/cho-thue-dat', icon: 'fa-solid fa-map' },
      { id: 'sub-rent-farm', title: 'Cho Thuê Trang Trại, Khu Nghỉ Dưỡng', path: '/cho-thue-trang-trai-khu-nghi-duong', icon: 'fa-solid fa-tree' },
      { id: 'sub-rent-condotel', title: 'Cho Thuê Condotel', path: '/cho-thue-condotel', icon: 'fa-solid fa-hotel' },
      { id: 'sub-rent-warehouse', title: 'Cho Thuê Kho, Nhà Xưởng', path: '/cho-thue-kho-nha-xuong', icon: 'fa-solid fa-warehouse' },
      { id: 'sub-rent-other', title: 'Cho Thuê Loại BĐS Khác', path: '/cho-thue-bat-dong-san-khac', icon: 'fa-solid fa-shapes' }
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

// Cấu hình Kênh Mạng Xã Hội Mặc Định (Facebook, Zalo, YouTube, TikTok, Telegram, Instagram)
export const DEFAULT_SOCIAL_LINKS = {
  facebook: {
    enabled: true,
    url: 'https://facebook.com/datbiendanang',
    label: 'Facebook',
    icon: 'fa-brands fa-facebook-f',
    hoverColor: 'hover:text-blue-400 hover:border-blue-500/50'
  },
  zalo: {
    enabled: true,
    url: 'https://zalo.me/0904084888',
    label: 'Zalo',
    icon: 'fa-solid fa-comment-dots',
    hoverColor: 'hover:text-sky-400 hover:border-sky-500/50'
  },
  youtube: {
    enabled: true,
    url: 'https://youtube.com/@datbiendanang',
    label: 'YouTube',
    icon: 'fa-brands fa-youtube',
    hoverColor: 'hover:text-red-500 hover:border-red-500/50'
  },
  tiktok: {
    enabled: true,
    url: 'https://tiktok.com/@datbiendanang',
    label: 'TikTok',
    icon: 'fa-brands fa-tiktok',
    hoverColor: 'hover:text-pink-400 hover:border-pink-500/50'
  },
  telegram: {
    enabled: false,
    url: 'https://t.me/datbiendanang',
    label: 'Telegram',
    icon: 'fa-brands fa-telegram',
    hoverColor: 'hover:text-cyan-400 hover:border-cyan-500/50'
  },
  instagram: {
    enabled: false,
    url: 'https://instagram.com/datbiendanang',
    label: 'Instagram',
    icon: 'fa-brands fa-instagram',
    hoverColor: 'hover:text-fuchsia-400 hover:border-fuchsia-500/50'
  }
};

// Cấu hình Header, Logo & Độ Rộng Menu (Header & Logo Settings)
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
  socialLinks: DEFAULT_SOCIAL_LINKS
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
  enableWelcomeBonus: true, // Bật/Tắt chương trình quà tặng chào mừng thành viên mới

  // Cấu hình Phân Trang Danh Mục & Số lượng tin Trang Chủ & Trang Chi Tiết
  categoryPageSize: 12, // Số lượng BĐS trên mỗi trang phân trang tại các danh mục (Nhà đất bán, Cho thuê, Taxonomy)
  homePageSize: 18, // Số lượng BĐS hiển thị trên Trang Chủ
  similarPropertiesLimit: 4, // Số lượng BĐS tương tự hiển thị trên Trang Chi Tiết (Mặc định 4 sản phẩm)

  // Mạng xã hội toàn hệ thống
  socialLinks: DEFAULT_SOCIAL_LINKS
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
    similarPropertiesLimit: 4, // Số lượng BĐS tương tự hiển thị (mặc định 4 sản phẩm)
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

// Cấu hình Hệ Thống Live Chat Telegram 2 Chiều (Two-Way Telegram Live Chat)
export const DEFAULT_TELEGRAM_CONFIG = {
  enabled: true,
  botToken: '', // Token bot từ @BotFather (lưu trữ mã hóa AES-256)
  chatId: '', // ID nhóm / kênh Telegram nhận tin nhắn tư vấn
  botUsername: 'DatBienDaNangBot',
  welcomeMessage: 'Xin chào quý khách! Tôi là trợ lý tư vấn Đất Biển Đà Nẵng. Quý khách đang quan tâm đến dự án nào cần hỗ trợ thông tin nhanh?',
  agentName: 'Nguyễn Văn Tuấn',
  agentAvatar: '/avatars/ai-preset-1.jpg',
  agentTitle: 'Chuyên Viên Tư Vấn Đất Biển Đà Nẵng',
  notifyNewLead: true, // Tự động thông báo Lead mới khi khách điền Form
  quickQuestions: [
    'Bất động sản này còn không?',
    'Giá có thương lượng thêm không?',
    'Cho tôi hẹn lịch xem nhà vào T7 này',
    'Gửi tôi pháp lý sổ đỏ/hồng'
  ],
  realtimeProvider: 'sse', // 'sse' (Tự động không cần cài đặt) | 'pusher'
  pusherAppId: '',
  pusherKey: '',
  pusherSecret: '',
  pusherCluster: 'ap1'
};

