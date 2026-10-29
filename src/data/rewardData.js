/**
 * Dữ liệu Khuyến Mãi, Nhiệm Vụ & Phần Thưởng Bất Động Sản
 * TẤT CẢ TIỀN THƯỞNG CỘNG TRỰC TIẾP VÀO VÍ KHUYẾN MÃI (bonusWalletBalance)
 * KHÔNG DÙNG TÍCH ĐIỂM / XU THƯỞNG
 */

// 1. DANH SÁCH CHƯƠNG TRÌNH KHUYẾN MÃI
export const PROMOTIONS_DATA = [
  {
    id: 'km-01',
    slug: 'tang-100k-nap-dau-tien',
    title: 'Tặng 100.000đ vào Ví Khuyến Mãi khi nạp ví lần đầu',
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
    description: 'Cộng trực tiếp 100.000đ vào Ví Khuyến Mãi dành cho thành viên mới xác thực tài khoản trên sàn Đất Biển Đà Nẵng.',
    content: `
      ### Thể lệ chương trình
      - Tặng ngay **100.000đ trực tiếp vào Ví Khuyến Mãi** khi thành viên thực hiện giao dịch nạp tiền đầu tiên tối thiểu từ 200.000đ.
      - Tiền trong Ví Khuyến Mãi được sử dụng trực tiếp để đăng tin VIP, mua lượt đẩy tin TOP 1 hoặc gia hạn tin đăng.
      - Mỗi tài khoản chính chủ chỉ được áp dụng 01 lần duy nhất.
      
      ### Hướng dẫn nhận ưu đãi
      1. Đăng ký tài khoản và hoàn tất xác thực số điện thoại.
      2. Truy cập mục **Nạp tiền vào ví**.
      3. Nhập mã khuyến mãi **WELCOME100** tại bước thanh toán.
      4. Hệ thống cộng ngay 100.000đ vào Ví Khuyến Mãi của bạn lập tức.
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
    description: 'Nâng tầm bất động sản lên vị trí đầu trang chủ và danh mục tìm kiếm với mức chiết khấu trừ trực tiếp số dư Ví KM.',
    content: `
      ### Đặc quyền tin VIP Kim Cương
      - Hiển thị cố định tại **Top 1 Trang chủ** và đầu trang danh mục Nhà Đất Bán / Cho Thuê.
      - Khung viền đỏ kim cương sang trọng kèm huy hiệu **VIP KIM CƯƠNG**.
      - Tự động đẩy tin lên đầu mỗi 12 tiếng một lần.
      - Được thanh toán kết hợp từ Ví Chính và Ví Khuyến Mãi.
    `
  },
  {
    id: 'km-03',
    slug: 'tri-an-moi-gioi-xuan-2027',
    title: 'Tri ân Nhà Môi Giới: Tặng 50.000đ Ví KM & 5 lượt đẩy tin TOP',
    category: 'hoi-vien',
    categoryLabel: 'Hội viên Môi giới',
    badge: 'Quà tặng',
    badgeColor: 'bg-emerald-500 text-white',
    discountCode: 'BROKER2027',
    discountValue: '50.000đ Ví KM',
    minDeposit: 0,
    validUntil: '2027-02-28',
    isEvergreen: false,
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    description: 'Cộng ngay 50.000đ vào Ví Khuyến Mãi dành riêng cho nhà môi giới có huy hiệu xác thực danh tính.',
    content: `
      ### Quyền lợi nhà môi giới
      - Cộng ngay 50.000đ vào Ví Khuyến Mãi sử dụng trọn đời.
      - Tặng 05 lượt đẩy tin tự động vào khung giờ vàng (11h00 - 12h00 và 19h00 - 21h00).
      - Miễn phí gắn nhãn **Môi giới xác thực uy tín** trên tất cả tin đăng.
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
    description: 'Giải pháp toàn diện cho sàn giao dịch và môi giới chuyên nghiệp cần đăng tin số lượng lớn.',
    content: `
      ### Đặc quyền Gói Hội Viên Vàng
      - Đăng tối đa 50 tin thường miễn phí mỗi tháng.
      - Giảm trực tiếp 25% chi phí nâng cấp tất cả các cấp độ tin VIP.
      - Tiền thưởng Ví Khuyến Mãi được trừ trực tiếp khi đăng ký gói.
    `
  }
];

// 2. DANH SÁCH NHIỆM VỤ (TIỀN THƯỞNG CỘNG TRỰC TIẾP VÀO VÍ KHUYẾN MÃI)
export const MISSIONS_DATA = {
  'tan-thu': [
    {
      id: 'm-new-01',
      title: 'Xác thực số điện thoại OTP',
      reward: 20000,
      rewardFormatted: '+20.000đ vào Ví KM',
      icon: 'fa-solid fa-mobile-screen-button',
      status: 'claimable',
      description: 'Bảo mật tài khoản và nhận ngay 20.000đ tiền thưởng vào ví.',
      link: '/ho-so-ca-nhan'
    },
    {
      id: 'm-new-02',
      title: 'Định danh CCCD / KYC điện tử',
      reward: 50000,
      rewardFormatted: '+50.000đ vào Ví KM',
      icon: 'fa-solid fa-id-card',
      status: 'pending',
      description: 'Nhận huy hiệu Người Bán Xác Thực và thưởng ngay 50.000đ vào ví.',
      link: '/ho-so-ca-nhan'
    },
    {
      id: 'm-new-03',
      title: 'Đăng tin bất động sản đầu tiên',
      reward: 30000,
      rewardFormatted: '+30.000đ vào Ví KM',
      icon: 'fa-solid fa-plus-circle',
      status: 'pending',
      description: 'Đăng 1 tin mua bán hoặc cho thuê nhận 30.000đ vào ví khuyến mãi.',
      link: '/dang-tin'
    }
  ],
  'hang-ngay': [
    {
      id: 'm-day-01',
      title: 'Điểm danh ngày mới',
      reward: 5000,
      rewardFormatted: '+5.000đ vào Ví KM',
      icon: 'fa-solid fa-calendar-check',
      status: 'claimable',
      description: 'Mỗi ngày đăng nhập nhận ngay 5.000đ tiền tươi vào ví khuyến mãi.',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'm-day-02',
      title: 'Xem 5 tin bất động sản nổi bật',
      reward: 5000,
      rewardFormatted: '+5.000đ vào Ví KM',
      icon: 'fa-solid fa-eye',
      progress: { current: 3, total: 5 },
      status: 'in_progress',
      description: 'Khảo sát giá thị trường nhận thưởng 5.000đ vào ví.',
      link: '/nha-dat-ban/'
    },
    {
      id: 'm-day-03',
      title: 'Chia sẻ 1 tin rao lên Zalo hoặc Facebook',
      reward: 10000,
      rewardFormatted: '+10.000đ vào Ví KM',
      icon: 'fa-solid fa-share-nodes',
      status: 'pending',
      description: 'Chia sẻ tin đăng BĐS nhận ngay 10.000đ tiền thưởng vào ví.',
      link: '/nha-dat-ban/'
    },
    {
      id: 'm-day-04',
      title: 'Tham gia dự đoán giá 1 dự án',
      reward: 10000,
      rewardFormatted: '+10.000đ vào Ví KM',
      icon: 'fa-solid fa-chart-line',
      status: 'pending',
      description: 'Bình chọn giá thị trường nhận 10.000đ vào ví khuyến mãi.',
      link: '/trung-tam-phan-thuong/du-doan-gia-bds/'
    }
  ],
  'thanh-tuu': [
    {
      id: 'm-ach-01',
      title: 'Nhà môi giới uy tín (10 tin xác thực)',
      reward: 150000,
      rewardFormatted: '+150.000đ vào Ví KM',
      icon: 'fa-solid fa-medal',
      progress: { current: 4, total: 10 },
      status: 'in_progress',
      description: 'Sở hữu 10 tin đăng có sổ đỏ nhận 150.000đ vào ví khuyến mãi.',
      link: '/dang-tin'
    },
    {
      id: 'm-ach-02',
      title: 'Đạt chuỗi điểm danh 30 ngày',
      reward: 200000,
      rewardFormatted: '+200.000đ vào Ví KM',
      icon: 'fa-solid fa-fire',
      progress: { current: 12, total: 30 },
      status: 'in_progress',
      description: 'Duy trì đăng nhập liên tục suốt 1 tháng thưởng ngay 200.000đ ví KM.',
      link: '/trung-tam-phan-thuong/diem-danh-7-ngay/'
    },
    {
      id: 'm-ach-03',
      title: 'Chiêu mộ 5 người bạn đăng ký (Affiliate)',
      reward: 300000,
      rewardFormatted: '+300.000đ vào Ví KM',
      icon: 'fa-solid fa-users',
      progress: { current: 2, total: 5 },
      status: 'in_progress',
      description: 'Giới thiệu đồng nghiệp cùng tham gia nhận ngay 300.000đ vào ví.',
      link: '/r/'
    }
  ]
};

// 3. DỮ LIỆU ĐIỂM DANH 7 NGÀY (CỘNG TIỀN VÀO VÍ KHUYẾN MÃI)
export const CHECK_IN_7_DAYS = [
  { day: 1, reward: 5000, label: '+5.000đ vào Ví KM', icon: 'fa-solid fa-money-bill-wave' },
  { day: 2, reward: 10000, label: '+10.000đ vào Ví KM', icon: 'fa-solid fa-money-bill-wave' },
  { day: 3, reward: 15000, label: '+15.000đ + Đẩy Tin', icon: 'fa-solid fa-gift', highlight: true },
  { day: 4, reward: 10000, label: '+10.000đ vào Ví KM', icon: 'fa-solid fa-money-bill-wave' },
  { day: 5, reward: 15000, label: '+15.000đ vào Ví KM', icon: 'fa-solid fa-money-bill-wave' },
  { day: 6, reward: 20000, label: '+20.000đ vào Ví KM', icon: 'fa-solid fa-money-bill-wave' },
  { day: 7, reward: 50000, label: '+50.000đ Thưởng Tuần', icon: 'fa-solid fa-crown', super: true }
];

// 4. DỮ LIỆU SĂN KHO BÁU BĐS (MỞ RƯƠNG NHẬN TIỀN VÍ KM)
export const TREASURE_LOCATIONS = [
  {
    id: 'loc-01',
    name: 'Khu Đô Thị The Monarchy Đà Nẵng',
    district: 'Sơn Trà, Đà Nẵng',
    lat: 16.0544,
    lng: 108.2372,
    rewardAmount: 50000,
    reward: '+50.000đ vào Ví KM',
    opened: false,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-02',
    name: 'Sun Ponte Residence Cầu Rồng',
    district: 'Hải Châu, Đà Nẵng',
    lat: 16.0605,
    lng: 108.2255,
    rewardAmount: 100000,
    reward: '+100.000đ vào Ví KM',
    opened: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-03',
    name: 'Biệt Thự Shantira Beach Resort Hội An',
    district: 'Điện Bàn, Quảng Nam',
    lat: 15.9082,
    lng: 108.3392,
    rewardAmount: 50000,
    reward: '+50.000đ vào Ví KM + 03 Đẩy Tin',
    opened: false,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'loc-04',
    name: 'Khu Đô Thị Sinh Thái Nam Hòa Xuân',
    district: 'Ngũ Hành Sơn, Đà Nẵng',
    lat: 16.0125,
    lng: 108.2415,
    rewardAmount: 30000,
    reward: '+30.000đ vào Ví KM',
    opened: false,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80'
  }
];

// 5. DỮ LIỆU DỰ ĐOÁN GIÁ BĐS CỘNG ĐỒNG (QUỸ THƯỞNG TIỀN MẶT VÍ KM)
export const PRICE_PREDICTION_GAMES = [
  {
    id: 'pred-01',
    slug: 'the-monarchy-da-nang',
    projectName: 'Căn hộ 2PN The Monarchy Block B View Sông Hàn',
    location: 'Sơn Trà, Đà Nẵng',
    currentEstimate: '3.65 - 3.85 tỷ',
    totalPool: '3.500.000đ Ví KM',
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
    totalPool: '8.000.000đ Ví KM',
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
    totalPool: '5.200.000đ Ví KM',
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

// 6. CÁC DỊCH VỤ SỬ DỤNG TRỰC TIẾP VÍ KHUYẾN MÃI (THAY THẾ ĐỔI ĐIỂM)
export const PROMO_WALLET_SERVICES = [
  {
    id: 'srv-01',
    title: 'Đăng Tin Rao Bất Động Sản',
    cost: 'Miễn phí hoặc trừ Ví KM',
    icon: 'fa-solid fa-file-circle-plus text-emerald-500',
    actionText: 'Đăng tin ngay',
    link: '/dang-tin',
    description: 'Sử dụng 100% số dư Ví Khuyến Mãi để đăng tin thường và tin VIP mà không cần nạp thêm tiền.'
  },
  {
    id: 'srv-02',
    title: 'Đẩy Tin TOP 1 Giờ Vàng',
    cost: '10.000đ / lượt (Trừ Ví KM)',
    icon: 'fa-solid fa-rocket text-blue-500',
    actionText: 'Đẩy tin ngay',
    link: '/quan-ly-tin',
    description: 'Trừ trực tiếp 10.000đ trong Ví Khuyến Mãi để đưa tin đăng lên vị trí top đầu danh mục trong 24 giờ.'
  },
  {
    id: 'srv-03',
    title: 'Nâng Cấp Tin VIP Vàng',
    cost: '50.000đ / tuần (Trừ Ví KM)',
    icon: 'fa-solid fa-crown text-amber-500',
    actionText: 'Xem bảng giá VIP',
    link: '/bang-gia-vip',
    description: 'Sử dụng tiền trong Ví Khuyến Mãi để gắn huy hiệu VIP Vàng nổi bật, tăng lượt xem gấp 5 lần.'
  },
  {
    id: 'srv-04',
    title: 'Nâng Cấp Tin VIP Kim Cương',
    cost: 'Chiết khấu trực tiếp từ Ví KM',
    icon: 'fa-solid fa-gem text-rose-500',
    actionText: 'Xem đặc quyền VIP',
    link: '/bang-gia-vip',
    description: 'Vị trí độc quyền trang chủ và danh mục chính của toàn sàn, thanh toán linh hoạt kết hợp Ví KM.'
  }
];

// 7. CẤU HÌNH TỔNG THỂ CHO CMS ADMIN QUẢN TRỊ
export const DEFAULT_REWARDS_CONFIG = {
  // A. Danh sách Khuyến mãi
  promotions: PROMOTIONS_DATA,

  // B. Danh sách Nhiệm vụ
  missions: MISSIONS_DATA,

  // C. Điểm danh 7 ngày
  checkInConfig: {
    enabled: true,
    days: CHECK_IN_7_DAYS
  },

  // D. Săn kho báu bài viết (Treasure Hunt & Anti-Spam)
  treasureHuntConfig: {
    enabled: true,
    dailyLimit: 3,
    minReadingSeconds: 4,
    cooldownSeconds: 20,
    tiers: [
      { id: 'tier1', label: 'Hạng May Mắn Đồng', percent: 50, minAmount: 2000, maxAmount: 4000 },
      { id: 'tier2', label: 'Hạng Bạc Rực Rỡ', percent: 25, minAmount: 5000, maxAmount: 10000 },
      { id: 'tier3', label: 'Hạng Vàng Phú Quý', percent: 15, minAmount: 11000, maxAmount: 15000 },
      { id: 'tier4', label: 'Hạng Kim Cương Đỉnh Cao', percent: 10, minAmount: 15000, maxAmount: 20000 }
    ]
  },

  // E. Minigame dự đoán giá BĐS
  predictionGames: PRICE_PREDICTION_GAMES
};
