/**
 * Dữ liệu Khuyến Mãi, Nhiệm Vụ & Gamification Phần Thưởng Bất Động Sản
 * Chuẩn bị cho Technical SEO & Semantic Siloing
 */

// 1. DANH SÁCH CHƯƠNG TRÌNH KHUYẾN MÃI
export const PROMOTIONS_DATA = [
  {
    id: 'km-01',
    slug: 'tang-100k-nap-dau-tien',
    title: 'Tặng 100.000đ khi nạp ví BĐS lần đầu tiên',
    category: 'nap-tien',
    categoryLabel: 'Nạp tiền ví',
    badge: 'Hot nhất',
    badgeColor: 'bg-red-500 text-white',
    discountCode: 'WELCOME100',
    discountValue: '100.000đ',
    minDeposit: 200000,
    validUntil: '2026-12-31',
    isEvergreen: true,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    description: 'Chương trình ưu đãi nạp tiền dành cho thành viên mới đăng ký và xác thực tài khoản trên sàn giao dịch Đất Biển Đà Nẵng.',
    content: `
      ### Thể lệ chương trình
      - Tặng ngay **100.000đ vào Ví Khuyến Mãi** khi thành viên thực hiện giao dịch nạp tiền đầu tiên tối thiểu từ 200.000đ.
      - Tiền khuyến mãi được sử dụng trực tiếp để đăng tin VIP, mua lượt đẩy tin TOP 1 hoặc gia hạn tin đăng.
      - Mỗi tài khoản chính chủ (xác thực SĐT & CCCD) chỉ được áp dụng 01 lần duy nhất.
      
      ### Hướng dẫn nhận ưu đãi
      1. Đăng ký tài khoản và hoàn tất xác thực số điện thoại.
      2. Truy cập mục **Nạp tiền vào ví**.
      3. Nhập mã khuyến mãi **WELCOME100** tại bước thanh toán.
      4. Hệ thống cộng ngay 100.000đ vào ví khuyến mãi ngay khi giao dịch thành công.
    `
  },
  {
    id: 'km-02',
    slug: 'giam-30-tin-vip-kim-cuong',
    title: 'Giảm 30% gói tin đăng VIP Kim Cương độc quyền',
    category: 'goi-vip',
    categoryLabel: 'Gói tin VIP',
    badge: 'Tiết kiệm 30%',
    badgeColor: 'bg-amber-500 text-white',
    discountCode: 'VIPDIAMOND30',
    discountValue: '30%',
    minDeposit: 0,
    validUntil: '2026-11-30',
    isEvergreen: false,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    description: 'Nâng tầm bất động sản của bạn lên vị trí đầu trang chủ và danh mục tìm kiếm với mức chiết khấu hấp dẫn nhất mùa mở bán.',
    content: `
      ### Đặc quyền tin VIP Kim Cương
      - Hiển thị cố định tại **Top 1 Trang chủ** và đầu trang danh mục Nhà Đất Bán / Cho Thuê.
      - Khung viền đỏ kim cương sang trọng kèm huy hiệu **VIP KIM CƯƠNG**.
      - Tự động đẩy tin lên đầu mỗi 12 tiếng một lần.
      - Tiếp cận gấp **10 lần khách hàng tiềm năng** so với tin thường.
      
      ### Điều kiện áp dụng
      - Áp dụng khi thanh toán gói VIP Kim Cương từ 15 ngày trở lên.
      - Áp dụng cho cả BĐS Bán và Cho Thuê toàn quốc.
    `
  },
  {
    id: 'km-03',
    slug: 'tri-an-moi-gioi-xuan-2027',
    title: 'Tri ân Nhà Môi Giới: Tặng 5 lượt đẩy tin TOP miễn phí',
    category: 'hoi-vien',
    categoryLabel: 'Hội viên Môi giới',
    badge: 'Quà tặng',
    badgeColor: 'bg-emerald-500 text-white',
    discountCode: 'BROKER2027',
    discountValue: '5 Lượt đẩy tin',
    minDeposit: 0,
    validUntil: '2027-02-28',
    isEvergreen: false,
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    description: 'Đặc quyền dành riêng cho các nhà môi giới có huy hiệu xác thực danh tính và duy trì đánh giá 5 sao từ khách mua.',
    content: `
      ### Quyền lợi nhà môi giới
      - Tặng 05 lượt đẩy tin tự động vào khung giờ vàng (11h00 - 12h00 và 19h00 - 21h00).
      - Miễn phí gắn nhãn **Môi giới xác thực uy tín** trên tất cả tin đăng.
      - Hỗ trợ duyệt nhanh tin đăng trong vòng 5 phút bởi đội ngũ kiểm duyệt viên.
    `
  },
  {
    id: 'km-04',
    slug: 'uu-dai-hoi-vien-vang',
    title: 'Nâng cấp Gói Hội Viên Vàng - Chiết khấu 25% trọn đời',
    category: 'hoi-vien',
    categoryLabel: 'Gói hội viên',
    badge: 'VIP Pro',
    badgeColor: 'bg-blue-600 text-white',
    discountCode: 'GOLDMEMBER',
    discountValue: '25% Trọn đời',
    minDeposit: 500000,
    validUntil: '2026-12-31',
    isEvergreen: true,
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Giải pháp toàn diện cho sàn giao dịch và môi giới chuyên nghiệp cần đăng tin số lượng lớn và tiếp cận dữ liệu độc quyền.',
    content: `
      ### Đặc quyền Gói Hội Viên Vàng
      - Đăng tối đa 50 tin thường miễn phí mỗi tháng.
      - Giảm trực tiếp 25% chi phí nâng cấp tất cả các cấp độ tin VIP.
      - Báo cáo phân tích lượt xem và biểu đồ quan tâm giá thị trường chi tiết.
    `
  }
];

// 2. DANH SÁCH NHIỆM VỤ (MISSIONS)
export const MISSIONS_DATA = {
  'tan-thu': [
    {
      id: 'm-new-01',
      title: 'Xác thực số điện thoại OTP',
      reward: 20000,
      rewardType: 'xu',
      icon: 'fa-solid fa-mobile-screen-button',
      status: 'claimable',
      description: 'Bảo mật tài khoản và mở khóa tính năng đăng tin chính chủ.',
      link: '/ho-so-ca-nhan'
    },
    {
      id: 'm-new-02',
      title: 'Định danh CCCD / KYC điện tử',
      reward: 50000,
      rewardType: 'xu',
      icon: 'fa-solid fa-id-card',
      status: 'pending',
      description: 'Nhận huy hiệu Người Bán Xác Thực tăng 300% độ tin cậy.',
      link: '/ho-so-ca-nhan'
    },
    {
      id: 'm-new-03',
      title: 'Đăng tin bất động sản đầu tiên',
      reward: 30000,
      rewardType: 'xu',
      icon: 'fa-solid fa-plus-circle',
      status: 'pending',
      description: 'Đăng 1 tin mua bán hoặc cho thuê có đầy đủ hình ảnh thực tế.',
      link: '/dang-tin'
    }
  ],
  'hang-ngay': [
    {
      id: 'm-day-01',
      title: 'Điểm danh ngày mới',
      reward: 2000,
      rewardType: 'xu',
      icon: 'fa-solid fa-calendar-check',
      status: 'claimable',
      description: 'Đăng nhập vào hệ thống mỗi ngày để nhận xu thưởng.',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'm-day-02',
      title: 'Xem 5 tin bất động sản nổi bật',
      reward: 5000,
      rewardType: 'xu',
      icon: 'fa-solid fa-eye',
      progress: { current: 3, total: 5 },
      status: 'in_progress',
      description: 'Cập nhật giá cả thị trường tại các dự án hot.',
      link: '/nha-dat-ban/'
    },
    {
      id: 'm-day-03',
      title: 'Chia sẻ 1 tin rao lên Zalo hoặc Facebook',
      reward: 8000,
      rewardType: 'xu',
      icon: 'fa-solid fa-share-nodes',
      status: 'pending',
      description: 'Lan tỏa thông tin nhà đất tới mạng lưới bạn bè.',
      link: '/nha-dat-ban/'
    },
    {
      id: 'm-day-04',
      title: 'Tham gia dự đoán giá 1 dự án',
      reward: 10000,
      rewardType: 'xu',
      icon: 'fa-solid fa-chart-line',
      status: 'pending',
      description: 'Đưa ra dự đoán giá chốt của căn hộ hoặc biệt thự cộng đồng.',
      link: '/trung-tam-phan-thuong/du-doan-gia-bds/'
    }
  ],
  'thanh-tuu': [
    {
      id: 'm-ach-01',
      title: 'Nhà môi giới uy tín (10 tin xác thực)',
      reward: 150000,
      rewardType: 'xu',
      icon: 'fa-solid fa-medal',
      progress: { current: 4, total: 10 },
      status: 'in_progress',
      description: 'Sở hữu 10 tin đăng có sổ đỏ và địa chỉ định vị chính xác.',
      link: '/dang-tin'
    },
    {
      id: 'm-ach-02',
      title: 'Đạt chuỗi điểm danh 30 ngày',
      reward: 200000,
      rewardType: 'xu',
      icon: 'fa-solid fa-fire',
      progress: { current: 12, total: 30 },
      status: 'in_progress',
      description: 'Duy trì đăng nhập liên tục suốt 1 tháng nhận rương thần tài.',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'm-ach-03',
      title: 'Chiêu mộ 5 người bạn đăng ký (Affiliate)',
      reward: 300000,
      rewardType: 'xu',
      icon: 'fa-solid fa-users',
      progress: { current: 2, total: 5 },
      status: 'in_progress',
      description: 'Giới thiệu đồng nghiệp môi giới cùng tham gia nền tảng.',
      link: '/r/'
    }
  ]
};

// 3. DỮ LIỆU ĐIỂM DANH 7 NGÀY
export const CHECK_IN_7_DAYS = [
  { day: 1, reward: 2000, type: 'xu', label: '2.000 Xu', icon: 'fa-solid fa-coins' },
  { day: 2, reward: 3000, type: 'xu', label: '3.000 Xu', icon: 'fa-solid fa-coins' },
  { day: 3, reward: 5000, type: 'voucher', label: 'Voucher Đẩy Tin TOP', icon: 'fa-solid fa-ticket', highlight: true },
  { day: 4, reward: 4000, type: 'xu', label: '4.000 Xu', icon: 'fa-solid fa-coins' },
  { day: 5, reward: 5000, type: 'xu', label: '5.000 Xu', icon: 'fa-solid fa-coins' },
  { day: 6, reward: 6000, type: 'xu', label: '6.000 Xu', icon: 'fa-solid fa-coins' },
  { day: 7, reward: 20000, type: 'box', label: 'Rương VIP Kim Cương', icon: 'fa-solid fa-gift', super: true }
];

// 4. DỮ LIỆU SĂN KHO BÁU BĐS (TREASURE HUNT)
export const TREASURE_LOCATIONS = [
  {
    id: 'loc-01',
    name: 'Khu Đô Thị The Monarchy Đà Nẵng',
    district: 'Sơn Trà, Đà Nẵng',
    lat: 16.0544,
    lng: 108.2372,
    chestType: 'gold',
    reward: 'Voucher 50% VIP Vàng',
    opened: false,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-02',
    name: 'Sun Ponte Residence Cầu Rồng',
    district: 'Hải Châu, Đà Nẵng',
    lat: 16.0605,
    lng: 108.2255,
    chestType: 'diamond',
    reward: '200.000 Xu Thưởng',
    opened: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-03',
    name: 'Biệt Thự Shantira Beach Resort Hội An',
    district: 'Điện Bàn, Quảng Nam',
    lat: 15.9082,
    lng: 108.3392,
    chestType: 'gold',
    reward: '03 Lượt Đẩy Tin TOP 1',
    opened: false,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-04',
    name: 'Khu Đô Thị Sinh Thái Nam Hòa Xuân',
    district: 'Ngũ Hành Sơn, Đà Nẵng',
    lat: 16.0125,
    lng: 108.2415,
    chestType: 'silver',
    reward: '50.000 Xu Thưởng',
    opened: false,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80'
  }
];

// 5. DỮ LIỆU DỰ ĐOÁN GIÁ BĐS CỘNG ĐỒNG
export const PRICE_PREDICTION_GAMES = [
  {
    id: 'pred-01',
    slug: 'the-monarchy-da-nang',
    projectName: 'Căn hộ 2PN The Monarchy Block B View Sông Hàn',
    location: 'Sơn Trà, Đà Nẵng',
    currentEstimate: '3.65 - 3.85 tỷ',
    totalPool: '3.500.000 Xu',
    totalVotes: 1420,
    endsAt: '2026-11-05T20:00:00Z',
    status: 'open',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    options: [
      { id: 'opt-a', label: 'Dưới 3.6 tỷ', votes: 290, percent: 20 },
      { id: 'opt-b', label: 'Từ 3.6 - 3.8 tỷ', votes: 780, percent: 55 },
      { id: 'opt-c', label: 'Trên 3.8 tỷ', votes: 350, percent: 25 }
    ]
  },
  {
    id: 'pred-02',
    slug: 'sun-ponte-residence',
    projectName: 'Penthouse Sun Ponte Residence Mặt Tiền Trần Hưng Đạo',
    location: 'Sơn Trà, Đà Nẵng',
    currentEstimate: '14.5 - 16.0 tỷ',
    totalPool: '8.000.000 Xu',
    totalVotes: 2310,
    endsAt: '2026-11-12T20:00:00Z',
    status: 'open',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    options: [
      { id: 'opt-a', label: 'Dưới 15 tỷ', votes: 550, percent: 24 },
      { id: 'opt-b', label: 'Từ 15 - 16 tỷ', votes: 1150, percent: 50 },
      { id: 'opt-c', label: 'Trên 16 tỷ', votes: 610, percent: 26 }
    ]
  },
  {
    id: 'pred-03',
    slug: 'biet-thu-co-co-hoi-an',
    projectName: 'Biệt Thự Nghỉ Dưỡng Ven Sông Cổ Cò Hội An (PR027)',
    location: 'Hội An, Quảng Nam',
    currentEstimate: '16.5 tỷ',
    totalPool: '5.200.000 Xu',
    totalVotes: 1890,
    endsAt: '2026-11-10T18:00:00Z',
    status: 'open',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    options: [
      { id: 'opt-a', label: 'Chốt dưới 16 tỷ', votes: 410, percent: 22 },
      { id: 'opt-b', label: 'Chốt từ 16 - 16.5 tỷ', votes: 980, percent: 52 },
      { id: 'opt-c', label: 'Chốt trên 16.5 tỷ', votes: 500, percent: 26 }
    ]
  }
];

// 6. GIAN HÀNG ĐỔI QUÀ (REDEMPTION ITEMS)
export const REDEMPTION_ITEMS = [
  {
    id: 'gift-01',
    title: 'Voucher Nạp Ví 50.000đ',
    coinsNeeded: 50000,
    category: 'voucher',
    icon: 'fa-solid fa-wallet text-emerald-500',
    stock: 99,
    description: 'Nạp trực tiếp 50.000đ vào ví khuyến mãi sử dụng ngay.'
  },
  {
    id: 'gift-02',
    title: '03 Lượt Đẩy Tin TOP 1 Giờ Vàng',
    coinsNeeded: 80000,
    category: 'service',
    icon: 'fa-solid fa-rocket text-blue-500',
    stock: 50,
    description: 'Đưa tin đăng lên vị trí top đầu danh mục trong 24 giờ.'
  },
  {
    id: 'gift-03',
    title: 'Nâng Cấp Tin VIP Vàng (7 Ngày)',
    coinsNeeded: 250000,
    category: 'vip',
    icon: 'fa-solid fa-crown text-amber-500',
    stock: 20,
    description: 'Gắn huy hiệu VIP Vàng nổi bật, tăng lượt xem gấp 5 lần.'
  },
  {
    id: 'gift-04',
    title: 'Nâng Cấp Tin VIP Kim Cương (7 Ngày)',
    coinsNeeded: 500000,
    category: 'vip',
    icon: 'fa-solid fa-gem text-rose-500',
    stock: 10,
    description: 'Vị trí độc quyền trang chủ và danh mục chính của toàn sàn.'
  }
];
