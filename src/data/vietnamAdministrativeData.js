// Dữ liệu Địa Giới Hành Chính Việt Nam chuẩn Batdongsan.com.vn
// Bao gồm 63 Tỉnh/Thành phố, đầy đủ Quận/Huyện, Phường/Xã, Đường/Phố và Dự án Bất Động Sản tiêu biểu

export const VIETNAM_ADMINISTRATIVE_DATA = [
  // =========================================================================
  // 1. HÀ NỘI (Thủ đô - 30 Quận / Huyện / Thị xã)
  // =========================================================================
  {
    id: 'hn',
    name: 'Hà Nội',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hn-cg',
        name: 'Quận Cầu Giấy',
        wards: [
          'Phường Dịch Vọng',
          'Phường Dịch Vọng Hậu',
          'Phường Yên Hòa',
          'Phường Trung Hòa',
          'Phường Nghĩa Đô',
          'Phường Nghĩa Tân',
          'Phường Mai Dịch',
          'Phường Quan Hoa'
        ],
        streets: [
          'Trần Duy Hưng',
          'Cầu Giấy',
          'Xuân Thủy',
          'Duy Tân',
          'Hoàng Quốc Việt',
          'Nguyễn Phong Sắc',
          'Trung Hòa',
          'Trung Kính',
          'Nguyễn Chánh',
          'Phạm Văn Đồng',
          'Trần Thái Tông',
          'Trần Quốc Hoàn',
          'Nguyễn Khánh Toàn',
          'Vũ Phạm Hàm',
          'Thọ Tháp',
          'Mạc Thái Tổ',
          'Mạc Thái Tông',
          'Dương Đình Nghệ',
          'Phạm Hùng'
        ],
        projects: [
          'D\'Capitale Trần Duy Hưng',
          'The Zei Mỹ Đình (Cầu Giấy)',
          'Golden Park Tower',
          'Discovery Complex 302 Cầu Giấy',
          'Sunshine Center 16 Phạm Hùng',
          'Thăng Long Number One',
          'Tràng An Complex Phùng Chí Kiên',
          'Home City Trung Kính',
          'Eurowindow Multi Complex'
        ]
      },
      {
        id: 'hn-ntl',
        name: 'Quận Nam Từ Liêm',
        wards: [
          'Phường Mỹ Đình 1',
          'Phường Mỹ Đình 2',
          'Phường Mễ Trì',
          'Phường Trung Văn',
          'Phường Tây Mỗ',
          'Phường Đại Mỗ',
          'Phường Phú Đô',
          'Phường Cầu Diễn',
          'Phường Phương Canh',
          'Phường Xuân Phương'
        ],
        streets: [
          'Mễ Trì',
          'Lê Quang Đạo',
          'Phạm Hùng',
          'Tây Mỗ',
          'Đại Mỗ',
          'Tố Hữu',
          'Hàm Nghi',
          'Nguyễn Cơ Thạch',
          'Hồ Tùng Mậu',
          'Châu Văn Liêm',
          'Đỗ Đức Dục',
          'Cương Kiên',
          'Đại Lộ Thăng Long',
          'Lê Đức Thọ',
          'Trần Hữu Dực'
        ],
        projects: [
          'Vinhomes Smart City (Tây Mỗ - Đại Mỗ)',
          'The Matrix One (Lê Quang Đạo)',
          'Vinhomes Skylake Phạm Hùng',
          'The Manor Central Park',
          'Iris Garden 30 Trần Hữu Dực',
          'Florence Mỹ Đình (Trần Hữu Dực)',
          'Imperia Smart City',
          'Sun Square 21 Lê Đức Thọ',
          'Khu đô thị Mỹ Đình Sông Đà (Sudico)'
        ]
      },
      {
        id: 'hn-btl',
        name: 'Quận Bắc Từ Liêm',
        wards: [
          'Phường Cổ Nhuế 1',
          'Phường Cổ Nhuế 2',
          'Phường Đông Ngạc',
          'Phường Đức Thắng',
          'Phường Phúc Diễn',
          'Phường Phú Diễn',
          'Phường Minh Khai',
          'Phường Tây Tựu',
          'Phường Thụy Phương',
          'Phường Xuân Đỉnh',
          'Phường Xuân Tảo'
        ],
        streets: [
          'Phạm Văn Đồng',
          'Hoàng Tăng Bí',
          'Cổ Nhuế',
          'Nguyễn Đình Tứ',
          'Văn Tiến Dũng',
          'Đức Thắng',
          'Phú Diễn',
          'Kẻ Vẽ',
          'Đỗ Nhuận',
          'Xuân Tảo',
          'Nguyễn Văn Huyên kéo dài'
        ],
        projects: [
          'Goldmark City 136 Hồ Tùng Mậu',
          'Starlake Tây Hồ Tây (Bắc Từ Liêm)',
          'Khu Ngoại Giao Đoàn (Xuân Tảo)',
          'An Bình City (Phạm Văn Đồng)',
          'Green Stars 234 Phạm Văn Đồng',
          'Scenia Bay / Sunshine City Tây Hồ'
        ]
      },
      {
        id: 'hn-bd',
        name: 'Quận Ba Đình',
        wards: [
          'Phường Kim Mã',
          'Phường Cống Vị',
          'Phường Liễu Giai',
          'Phường Điện Biên',
          'Phường Đội Cấn',
          'Phường Giảng Võ',
          'Phường Ngọc Hà',
          'Phường Ngọc Khánh',
          'Phường Nguyễn Trung Trực',
          'Phường Phúc Xá',
          'Phường Quán Thánh',
          'Phường Thành Công',
          'Phường Trúc Bạch',
          'Phường Vĩnh Phúc'
        ],
        streets: [
          'Kim Mã',
          'Liễu Giai',
          'Đội Cấn',
          'Giảng Võ',
          'Nguyễn Chí Thanh',
          'Hoàng Hoa Thám',
          'Phan Đình Phùng',
          'Điện Biên Phủ',
          'Trần Phú',
          'Đào Tấn',
          'Vạn Bảo',
          'Vạn Phúc',
          'Núi Trúc',
          'Ngọc Khánh',
          'Quán Thánh'
        ],
        projects: [
          'Vinhomes Metropolis 29 Liễu Giai',
          'Grandeur Palace 138 Giảng Võ',
          'Platinum Residences 6 Nguyễn Công Hoan',
          'Chung cư Lancaster 20 Núi Trúc',
          'The Golden Armor B6 Giảng Võ',
          'Hanoi Aqua Central 44 Yên Phụ'
        ]
      },
      {
        id: 'hn-th',
        name: 'Quận Tây Hồ',
        wards: [
          'Phường Quảng An',
          'Phường Xuân La',
          'Phường Yên Phụ',
          'Phường Tứ Liên',
          'Phường Nhật Tân',
          'Phường Bưởi',
          'Phường Thụy Khuê',
          'Phường Phú Thượng'
        ],
        streets: [
          'Lạc Long Quân',
          'Âu Cơ',
          'Xuân Diệu',
          'Tô Ngọc Vân',
          'Quảng An',
          'Thụy Khuê',
          'Hoàng Hoa Thám',
          'Võ Chí Công',
          'Nguyễn Hoàng Tôn',
          'Yên Phụ',
          'Đặng Thai Mai',
          'Từ Hoa'
        ],
        projects: [
          'Ciputra Hanoi International City',
          'Heritage West Lake (Lạc Long Quân)',
          'D\'. Le Roi Soleil 59 Xuân Diệu',
          'Sun Grand City Thụy Khuê Residence',
          'D\'. El Dorado Phú Thanh & Phú Thượng',
          'Sunshine Golden River Ciputra',
          'Khu đô thị Tây Hồ Tây (Starlake)'
        ]
      },
      {
        id: 'hn-tx',
        name: 'Quận Thanh Xuân',
        wards: [
          'Phường Nhân Chính',
          'Phường Khương Trung',
          'Phường Khương Mai',
          'Phường Khương Đình',
          'Phường Thanh Xuân Bắc',
          'Phường Thanh Xuân Nam',
          'Phường Thanh Xuân Trung',
          'Phường Hạ Đình',
          'Phường Kim Giang',
          'Phường Phương Liệt',
          'Phường Thượng Đình'
        ],
        streets: [
          'Nguyễn Trãi',
          'Lê Văn Lương',
          'Khuất Duy Tiến',
          'Hoàng Đạo Thúy',
          'Vũ Tông Phan',
          'Nguyễn Tuân',
          'Vũ Trọng Phụng',
          'Ngụy Như Kon Tum',
          'Nguyễn Huy Tưởng',
          'Nguyễn Xiển',
          'Lê Văn Thiêm',
          'Quan Nhân',
          'Hoàng Văn Thái'
        ],
        projects: [
          'Vinhomes Royal City 72A Nguyễn Trãi',
          'Hapulico Complex Vũ Trọng Phụng',
          'Imperia Garden 203 Nguyễn Huy Tưởng',
          'Stellar Garden 35 Lê Văn Thiêm',
          'Rivera Park 69 Vũ Trọng Phụng',
          'King Palace 108 Nguyễn Trãi',
          'The Legend 109 Nguyễn Tuân',
          'Mandarin Garden Hoàng Minh Giám'
        ]
      },
      {
        id: 'hn-hbt',
        name: 'Quận Hai Bà Trưng',
        wards: [
          'Phường Bách Khoa',
          'Phường Minh Khai',
          'Phường Vĩnh Tuy',
          'Phường Đồng Tâm',
          'Phường Lê Đại Hành',
          'Phường Phố Huế',
          'Phường Bạch Đằng',
          'Phường Thanh Lương',
          'Phường Thanh Nhàn',
          'Phường Trương Định'
        ],
        streets: [
          'Minh Khai',
          'Bà Triệu',
          'Phố Huế',
          'Bạch Mai',
          'Đại Cồ Việt',
          'Trần Khát Chân',
          'Kim Ngưu',
          'Tam Trinh',
          'Lạc Trung',
          'Lò Đúc',
          'Tạ Quang Bửu',
          'Võ Thị Sáu'
        ],
        projects: [
          'Vinhomes Times City 458 Minh Khai',
          'Sun Grand City Ancora Lương Yên',
          'Hòa Bình Green City 505 Minh Khai',
          'Chung cư Imperia Sky Garden 423 Minh Khai',
          'Green Pearl 378 Minh Khai',
          'Amber Riverside 622 Minh Khai'
        ]
      },
      {
        id: 'hn-dd',
        name: 'Quận Đống Đa',
        wards: [
          'Phường Láng Hạ',
          'Phường Láng Thượng',
          'Phường Ô Chợ Dừa',
          'Phường Cát Linh',
          'Phường Nam Đồng',
          'Phường Quang Trung',
          'Phường Trung Liệt',
          'Phường Khâm Thiên',
          'Phường Kim Liên',
          'Phường Phương Mai'
        ],
        streets: [
          'Thái Hà',
          'Chùa Bộc',
          'Xã Đàn',
          'Tôn Đức Thắng',
          'Nguyễn Lương Bằng',
          'Láng Hạ',
          'Huỳnh Thúc Kháng',
          'Đường Láng',
          'Nguyễn Chí Thanh',
          'Hoàng Cầu',
          'Hào Nam',
          'Đặng Văn Ngữ'
        ],
        projects: [
          'Vinhomes Nguyễn Chí Thanh (54A NCT)',
          'D\'. Le Pont D\'. Or Hoàng Cầu',
          'Hateco Laroma Huỳnh Thúc Kháng',
          'Chung cư Tân Hoàng Minh Hoàng Cầu',
          'Kinh Đô Building 102 Trường Chinh'
        ]
      },
      {
        id: 'hn-hk',
        name: 'Quận Hoàn Kiếm',
        wards: [
          'Phường Hàng Bạc',
          'Phường Hàng Bài',
          'Phường Hàng Bồ',
          'Phường Hàng Bông',
          'Phường Hàng Buồm',
          'Phường Hàng Đào',
          'Phường Hàng Gai',
          'Phường Hàng Mã',
          'Phường Hàng Trống',
          'Phường Cửa Đông',
          'Phường Cửa Nam',
          'Phường Đồng Xuân',
          'Phường Lý Thái Tổ',
          'Phường Phan Chu Trinh',
          'Phường Phúc Tân',
          'Phường Tràng Tiền',
          'Phường Trần Hưng Đạo'
        ],
        streets: [
          'Tràng Tiền',
          'Đinh Tiên Hoàng',
          'Hàng Khay',
          'Bà Triệu',
          'Phan Chu Trinh',
          'Lý Thường Kiệt',
          'Trần Hưng Đạo',
          'Hai Bà Trưng',
          'Hàng Bài',
          'Quang Trung',
          'Hàng Gai',
          'Hàng Bông',
          'Cầu Gỗ'
        ],
        projects: [
          'D\'. San Rafaelle 22-24 Hàng Bài',
          'T-Place 30A Lý Thường Kiệt',
          'Pacific Place 83B Lý Thường Kiệt'
        ]
      },
      {
        id: 'hn-hd',
        name: 'Quận Hà Đông',
        wards: [
          'Phường Mộ Lao',
          'Phường Văn Quán',
          'Phường La Khê',
          'Phường Dương Nội',
          'Phường Yên Nghĩa',
          'Phường Kiến Hưng',
          'Phường Phú Lãm',
          'Phường Vạn Phúc',
          'Phường Hà Cầu',
          'Phường Quang Trung'
        ],
        streets: [
          'Quang Trung',
          'Tố Hữu',
          'Lê Trọng Tấn',
          'Văn Phú',
          'Trần Phú',
          'Phùng Hưng',
          'Nguyễn Văn Lộc',
          'Chiến Thắng',
          'Nguyễn Khuyến'
        ],
        projects: [
          'Khu đô thị Mỗ Lao (Mulberry Lane, Seasons Avenue)',
          'Khu đô thị Văn Quán Hà Đông',
          'Khu đô thị Dương Nội (Anland Complex, Anland Lakeview)',
          'The Pride Hải Phát',
          'Roman Plaza Tố Hữu',
          'Hà Nội Landmark 51',
          'Khu đô thị ParkCity Hanoi',
          'Khu đô thị Văn Phú (Victoria Văn Phú)'
        ]
      },
      {
        id: 'hn-hm',
        name: 'Quận Hoàng Mai',
        wards: [
          'Phường Định Công',
          'Phường Đại Kim',
          'Phường Hoàng Liệt',
          'Phường Thịnh Liệt',
          'Phường Giáp Bát',
          'Phường Tân Mai',
          'Phường Mai Động',
          'Phường Vĩnh Hưng',
          'Phường Yên Sở'
        ],
        streets: [
          'Giải Phóng',
          'Kim Đồng',
          'Tân Mai',
          'Trương Định',
          'Tam Trinh',
          'Lĩnh Nam',
          'Định Công',
          'Nguyễn Xiển',
          'Nghiêm Xuân Yêm',
          'Linh Đàm'
        ],
        projects: [
          'Khu đô thị Linh Đàm (HH Linh Đàm, VP Linh Đàm)',
          'Gamuda City (Gamuda Gardens)',
          'The Manor Central Park (Hoàng Mai)',
          'Gelexia Riverside 885 Tam Trinh',
          'Athena Complex Pháp Vân',
          'Chung cư Eco Lake View 32 Đại Từ',
          'Khu đô thị Đại Kim Định Công'
        ]
      },
      {
        id: 'hn-lb',
        name: 'Quận Long Biên',
        wards: [
          'Phường Bồ Đề',
          'Phường Gia Thụy',
          'Phường Ngọc Lâm',
          'Phường Ngọc Thụy',
          'Phường Phúc Đồng',
          'Phường Phúc Lợi',
          'Phường Sài Đồng',
          'Phường Thạch Bàn',
          'Phường Thượng Thanh',
          'Phường Việt Hưng',
          'Phường Long Biên'
        ],
        streets: [
          'Nguyễn Văn Cừ',
          'Ngọc Lâm',
          'Nguyễn Sơn',
          'Hoàng Như Tiếp',
          'Cổ Linh',
          'Chu Huy Mân',
          'Đàm Quang Trung',
          'Vũ Đức Thận',
          'Huỳnh Tấn Phát',
          'Sài Đồng'
        ],
        projects: [
          'Vinhomes Riverside & The Harmony',
          'Mipec Riverside Long Biên',
          'Khu đô thị Việt Hưng',
          'Khu đô thị Sài Đồng (Le Grand Jardin)',
          'BerRiver Jardin 390 Nguyễn Văn Cừ',
          'Eco City Việt Hưng',
          'Northern Diamond Long Biên'
        ]
      },
      {
        id: 'hn-gl',
        name: 'Huyện Gia Lâm',
        wards: [
          'Thị trấn Trâu Quỳ',
          'Thị trấn Yên Viên',
          'Xã Đa Tốn',
          'Xã Kiêu Kỵ',
          'Xã Dương Xá',
          'Xã Bát Tràng',
          'Xã Cổ Bi',
          'Xã Đặng Xá'
        ],
        streets: ['Ngô Xuân Quảng', 'Đường Lý Thánh Tông', 'Đường Hà Huy Tập', 'Quốc Lộ 5', 'Đường Giáp Hải'],
        projects: [
          'Vinhomes Ocean Park 1 (Gia Lâm)',
          'Masteri Waterfront Ocean Park',
          'The Zenpark Ocean Park',
          'Khu đô thị Đặng Xá Gia Lâm',
          'Eurowindow Twin Parks Gia Lâm'
        ]
      },
      {
        id: 'hn-da',
        name: 'Huyện Đông Anh',
        wards: ['Thị trấn Đông Anh', 'Xã Hải Bối', 'Xã Vĩnh Ngọc', 'Xã Kim Chung', 'Xã Tiên Dương', 'Xã Uy Nỗ'],
        streets: ['Võ Nguyên Giáp', 'Võ Văn Kiệt', 'Quốc Lộ 3', 'Đường Trường Sa', 'Đường Hoàng Sa'],
        projects: ['Thành phố thông minh BRG Smart City Đông Anh', 'Eurowindow River Park', 'Vinhomes Cổ Loa (Global Gate)']
      },
      {
        id: 'hn-hd2',
        name: 'Huyện Hoài Đức',
        wards: ['Thị trấn Trạm Trôi', 'Xã An Khánh', 'Xã An Thượng', 'Xã Vân Canh', 'Xã Kim Chung', 'Xã Di Trạch'],
        streets: ['Đại Lộ Thăng Long', 'Quốc Lộ 32', 'Đường Lê Trọng Tấn kéo dài', 'Đường Vành Đai 3.5'],
        projects: ['Khu đô thị Splendora Bắc An Khánh', 'Vinhomes Thăng Long', 'Hinode Royal Park (Kim Chung Di Trạch)', 'Khu đô thị Nam An Khánh (Sudico)']
      },
      {
        id: 'hn-tt',
        name: 'Huyện Thanh Trì',
        wards: ['Thị trấn Văn Điển', 'Xã Tân Triều', 'Xã Thanh Liệt', 'Xã Tứ Hiệp', 'Xã Ngũ Hiệp', 'Xã Vĩnh Quỳnh'],
        streets: ['Phan Trọng Tuệ', 'Ngọc Hồi', 'Kim Giang', 'Đường Cầu Bươu', 'Nghiêm Xuân Yêm'],
        projects: ['Khu đô thị IEC Residences Tứ Hiệp', 'Khu đô thị Pháp Vân Tứ Hiệp', 'Eco Green City Thanh Trì', 'Tecco Skyville Tower']
      }
    ]
  },

  // =========================================================================
  // 2. TP. HỒ CHÍ MINH (22 Quận / Huyện / Thành phố Thủ Đức)
  // =========================================================================
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    region: 'Miền Nam',
    districts: [
      {
        id: 'hcm-q1',
        name: 'Quận 1',
        wards: [
          'Phường Bến Nghé',
          'Phường Bến Thành',
          'Phường Đa Kao',
          'Phường Tân Định',
          'Phường Nguyễn Thái Bình',
          'Phường Phạm Ngũ Lão',
          'Phường Cô Giang',
          'Phường Cầu Kho',
          'Phường Cầu Ông Lãnh',
          'Phường Nguyễn Cư Trinh'
        ],
        streets: [
          'Nguyễn Huệ',
          'Lê Lợi',
          'Đồng Khởi',
          'Pasteur',
          'Hai Bà Trưng',
          'Nam Kỳ Khởi Nghĩa',
          'Lê Duẩn',
          'Tôn Đức Thắng',
          'Bùi Viện',
          'Trần Hưng Đạo',
          'Nguyễn Thị Minh Khai',
          'Lý Tự Trọng',
          'Lê Thánh Tôn',
          'Hàm Nghi',
          'Võ Văn Kiệt',
          'Nguyễn Du',
          'Đinh Tiên Hoàng'
        ],
        projects: [
          'Grand Marina Saigon (Ba Son)',
          'The Marq 29B Nguyễn Đình Chiểu',
          'The Grand Manhattan 100 Cô Giang',
          'Lancaster Legacy 230 Nguyễn Trãi',
          'Vinhomes Golden River Ba Son',
          'Sailing Tower 111A Pasteur',
          'Alpha City Cống Quỳnh'
        ]
      },
      {
        id: 'hcm-td',
        name: 'TP. Thủ Đức',
        wards: [
          'Phường Thảo Điền',
          'Phường An Phú',
          'Phường An Khánh',
          'Phường Thủ Thiêm',
          'Phường Thạnh Mỹ Lợi',
          'Phường Bình An',
          'Phường Bình Trưng Tây',
          'Phường Bình Trưng Đông',
          'Phường Hiệp Phú',
          'Phường Tăng Nhơn Phú A',
          'Phường Phước Long B',
          'Phường Long Thạnh Mỹ',
          'Phường Long Bình',
          'Phường Linh Trung',
          'Phường Linh Chiểu',
          'Phường Tam Phú',
          'Phường Trường Thọ'
        ],
        streets: [
          'Mai Chí Thọ',
          'Xa Lộ Hà Nội (Võ Nguyên Giáp)',
          'Đỗ Xuân Hợp',
          'Nguyễn Duy Trinh',
          'Nguyễn Thị Định',
          'Lương Định Của',
          'Trần Não',
          'Võ Văn Ngân',
          'Quốc Lộ 13',
          'Đặng Văn Bi',
          'Tô Ngọc Vân',
          'Nguyễn Xiển',
          'Phước Thiện',
          'Đồng Văn Cống',
          'Song Hành Cao Tốc'
        ],
        projects: [
          'Vinhomes Grand Park (Long Thạnh Mỹ)',
          'The River Thủ Thiêm & Empire City',
          'The Metropole Thủ Thiêm',
          'Khu đô thị Sala Đại Quang Minh',
          'Masteri Thảo Điền & Masteri An Phú',
          'The Sun Avenue (Mai Chí Thọ)',
          'D\'Lusso & Precia (Nguyễn Thị Định)',
          'Eaton Park Gamuda Land',
          'Lumiere Riverside Thảo Điền'
        ]
      },
      {
        id: 'hcm-bt',
        name: 'Quận Bình Thạnh',
        wards: [
          'Phường 22',
          'Phường 19',
          'Phường 21',
          'Phường 25',
          'Phường 26',
          'Phường 27 (Thanh Đa)',
          'Phường 28',
          'Phường 15',
          'Phường 17',
          'Phường 24',
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 12',
          'Phường 14'
        ],
        streets: [
          'Nguyễn Hữu Cảnh',
          'Điện Biên Phủ',
          'Xô Viết Nghệ Tĩnh',
          'Bạch Đằng',
          'Đinh Bộ Lĩnh',
          'Nơ Trang Long',
          'Phan Đăng Lưu',
          'Lê Quang Định',
          'Bùi Đình Túy',
          'Ung Văn Khiêm',
          'D2 (Nguyễn Gia Trí)',
          'Phạm Văn Đồng',
          'Vũ Tùng'
        ],
        projects: [
          'Vinhomes Central Park (Landmark 81)',
          'Sunwah Pearl (90 Nguyễn Hữu Cảnh)',
          'Saigon Pearl (92 Nguyễn Hữu Cảnh)',
          'Pearl Plaza (561 Điện Biên Phủ)',
          'Richmond City Nguyễn Xí',
          'Wilton Tower Văn Thánh'
        ]
      },
      {
        id: 'hcm-q7',
        name: 'Quận 7',
        wards: [
          'Phường Tân Phong',
          'Phường Tân Phú',
          'Phường Tân Quy',
          'Phường Tân Kiểng',
          'Phường Tân Thuận Đông',
          'Phường Tân Thuận Tây',
          'Phường Phú Mỹ',
          'Phường Phú Thuận',
          'Phường Bình Thuận'
        ],
        streets: [
          'Nguyễn Văn Linh',
          'Nguyễn Thị Thập',
          'Huỳnh Tấn Phát',
          'Lâm Văn Bền',
          'Lê Văn Lương',
          'Nguyễn Hữu Thọ',
          'Trần Xuân Soạn',
          'Đào Trí',
          'Hoàng Quốc Việt',
          'Bùi Bằng Đoàn',
          'Tôn Dật Tiên'
        ],
        projects: [
          'Khu đô thị Phú Mỹ Hưng (Midtown, The Peak, Star Hill)',
          'Sunrise City & Sunrise Cityview',
          'Eco Green Saigon (Nguyễn Văn Linh)',
          'The Golden Star (Nguyễn Thị Thập)',
          'Q7 Saigon Riverside Đào Trí',
          'Sunshine City Sài Gòn'
        ]
      },
      {
        id: 'hcm-q3',
        name: 'Quận 3',
        wards: [
          'Phường Võ Thị Sáu',
          'Phường 1',
          'Phường 2',
          'Phường 3',
          'Phường 4',
          'Phường 5',
          'Phường 9',
          'Phường 11',
          'Phường 12',
          'Phường 14'
        ],
        streets: [
          'Nam Kỳ Khởi Nghĩa',
          'Võ Văn Tần',
          'Nguyễn Đình Chiểu',
          'Điện Biên Phủ',
          'Cách Mạng Tháng 8',
          'Lê Văn Sỹ',
          'Trần Quốc Thảo',
          'Trương Định',
          'Bà Huyện Thanh Quan',
          'Pasteur',
          'Nguyễn Thông'
        ],
        projects: [
          'Serenity Sky Villas 259 Điện Biên Phủ',
          'Terra Royal 280 Nam Kỳ Khởi Nghĩa',
          'Léman Luxury Apartments 117 Nguyễn Đình Chiểu',
          'Grand Central 194B Nam Kỳ Khởi Nghĩa'
        ]
      },
      {
        id: 'hcm-q10',
        name: 'Quận 10',
        wards: [
          'Phường 1',
          'Phường 2',
          'Phường 4',
          'Phường 5',
          'Phường 6',
          'Phường 8',
          'Phường 9',
          'Phường 10',
          'Phường 12',
          'Phường 13',
          'Phường 14',
          'Phường 15'
        ],
        streets: [
          'Ba Tháng Hai (3/2)',
          'Sư Vạn Hạnh',
          'Cách Mạng Tháng 8',
          'Lý Thường Kiệt',
          'Nguyễn Tri Phương',
          'Thành Thái',
          'Tô Hiến Thành',
          'Lê Hồng Phong',
          'Ngô Gia Tự'
        ],
        projects: [
          'HaDo Centrosa Garden (200 Đường 3/2)',
          'Kingdom 101 Tô Hiến Thành',
          'Charmington La Pointe Cao Thắng',
          'Xi Grand Court 256 Lý Thường Kiệt'
        ]
      },
      {
        id: 'hcm-tb',
        name: 'Quận Tân Bình',
        wards: [
          'Phường 2',
          'Phường 4',
          'Phường 12',
          'Phường 13',
          'Phường 15',
          'Phường 1',
          'Phường 3',
          'Phường 5',
          'Phường 10',
          'Phường 11'
        ],
        streets: [
          'Trường Sơn',
          'Cộng Hòa',
          'Hoàng Văn Thụ',
          'Lê Văn Sỹ',
          'Bạch Đằng',
          'Trường Chinh',
          'Âu Cơ',
          'Phổ Quang',
          'Út Tịch',
          'Xuân Diệu'
        ],
        projects: [
          'Botanica Premier 108 Hồng Hà',
          'Sky Center 10 Phổ Quang',
          'The Botanica Phổ Quang',
          'Cộng Hòa Garden 20 Cộng Hòa',
          'Carillon 1 & Carillon 3 Hoàng Hoa Thám'
        ]
      },
      {
        id: 'hcm-pn',
        name: 'Quận Phú Nhuận',
        wards: ['Phường 1', 'Phường 2', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 15', 'Phường 17'],
        streets: ['Phan Xích Long', 'Nguyễn Văn Trỗi', 'Phan Đăng Lưu', 'Hoàng Văn Thụ', 'Huỳnh Văn Bánh', 'Lê Văn Sỹ'],
        projects: ['Golden Mansion 119 Phổ Quang', 'Orchard Garden 128 Hồng Hà', 'Garden Gate 8 Hoàng Minh Giám', 'The Prince Residence 17-19-21 Nguyễn Văn Trỗi']
      },
      {
        id: 'hcm-q4',
        name: 'Quận 4',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 13', 'Phường 18'],
        streets: ['Bến Vân Đồn', 'Hoàng Diệu', 'Đoàn Văn Bơ', 'Nguyễn Tất Thành', 'Tôn Thất Thuyết', 'Khánh Hội'],
        projects: ['The Tresor 39 Bến Vân Đồn', 'Masteri Millennium 132 Bến Vân Đồn', 'Icon 56 Bến Vân Đồn', 'Saigon Royal Residence', 'RiverGate Residence']
      },
      {
        id: 'hcm-q5',
        name: 'Quận 5',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 11', 'Phường 12'],
        streets: ['Trần Hưng Đạo', 'Nguyễn Trãi', 'An Dương Vương', 'Hùng Vương', 'Hải Thượng Lãn Ông', 'Nguyễn Tri Phương'],
        projects: ['Tản Đà Court', 'Hùng Vương Plaza', 'Tam Đức Plaza', 'The EverRich Infinity (An Dương Vương)']
      },
      {
        id: 'hcm-bc',
        name: 'Huyện Bình Chánh',
        wards: ['Thị trấn Tân Túc', 'Xã Bình Hưng', 'Xã Phong Phú', 'Xã An Phú Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B'],
        streets: ['Nguyễn Văn Linh', 'Quốc Lộ 1A', 'Quốc Lộ 50', 'Đinh Đức Thiện', 'Đoàn Nguyễn Tuấn'],
        projects: ['Khu đô thị Mizuki Park (Nam Long)', 'Lovera Vista & Lovera Park Khang Điền', 'Westgate Bình Chánh (An Gia)', 'Khu dân cư Trung Sơn']
      },
      {
        id: 'hcm-nb',
        name: 'Huyện Nhà Bè',
        wards: ['Thị trấn Nhà Bè', 'Xã Phước Kiển', 'Xã Phú Xuân', 'Xã Nhơn Đức', 'Xã Long Thới', 'Xã Hiệp Phước'],
        streets: ['Nguyễn Hữu Thọ', 'Lê Văn Lương', 'Huỳnh Tấn Phát', 'Nguyễn Văn Tạo', 'Phạm Hữu Lầu'],
        projects: ['Khu đô thị GS Metrocity (Zeitgeist Nhà Bè)', 'Celesta Rise & Celesta Heights Keppel Land', 'Sunrise Riverside Novaland', 'The Park Residence']
      }
    ]
  },

  // =========================================================================
  // 3. ĐÀ NẴNG (8 Quận / Huyện)
  // =========================================================================
  {
    id: 'dn',
    name: 'Đà Nẵng',
    region: 'Miền Trung',
    districts: [
      {
        id: 'dn-hc',
        name: 'Quận Hải Châu',
        wards: ['Phường Thạch Thang', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Thuận Phước', 'Phường Phước Ninh'],
        streets: ['Bạch Đằng', 'Trần Phú', 'Nguyễn Văn Linh', 'Lê Duẩn', '2 Tháng 9', 'Hùng Vương', 'Phan Châu Trinh', 'Hoàng Diệu', 'Nguyễn Thị Minh Khai', 'Như Nguyệt'],
        projects: ['The Filmore Đà Nẵng (Bạch Đằng)', 'Shantira Beach Resort & Spa', 'F-Home Đà Nẵng', 'Hiyori Garden Tower', 'Risemount Apartment']
      },
      {
        id: 'dn-st',
        name: 'Quận Sơn Trà',
        wards: ['Phường An Hải Bắc', 'Phường An Hải Tây', 'Phường Phước Mỹ', 'Phường Mân Thái', 'Phường Thọ Quang', 'Phường Nại Hiên Đông'],
        streets: ['Võ Nguyên Giáp', 'Phạm Văn Đồng', 'Hoàng Sa', 'Ngô Quyền', 'Trần Hưng Đạo', 'Nguyễn Văn Thoại', 'Võ Văn Kiệt', 'Hồ Nghinh'],
        projects: ['Sun Cosmo Residence Đà Nẵng (Cầu Trần Thị Lý)', 'Sun Ponte Residence (Cầu Rồng)', 'Wyndham Soleil Danang', 'The Sang Residence', 'Khu đô thị Quốc tế Đa Phước']
      },
      {
        id: 'dn-nhs',
        name: 'Quận Ngũ Hành Sơn',
        wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải'],
        streets: ['Võ Nguyên Giáp', 'Trường Sa', 'Lê Văn Hiến', 'Nam Kỳ Khởi Nghĩa', 'Minh Mạng', 'Chương Dương'],
        projects: ['Khu đô thị Nam Hòa Xuân (Sun Group)', 'Khu đô thị FPT City Đà Nẵng', 'Aria Danang Hotel & Resort', 'Hyatt Regency Danang Residences', 'Ocean Villas Đà Nẵng']
      },
      {
        id: 'dn-tk',
        name: 'Quận Thanh Khê',
        wards: ['Phường Vĩnh Trung', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Chính Gián', 'Phường Tam Thuận', 'Phường Xuân Hà', 'Phường An Khê', 'Phường Thanh Khê Đông'],
        streets: ['Nguyễn Tất Thành', 'Điện Biên Phủ', 'Hà Huy Tập', 'Trần Cao Vân', 'Lê Duẩn', 'Hùng Vương'],
        projects: ['Chung cư D-Aqua Đà Nẵng', 'Khu phức hợp Danang Times Square']
      },
      {
        id: 'dn-lc',
        name: 'Quận Liên Chiểu',
        wards: ['Phường Hòa Minh', 'Phường Hòa Khánh', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam'],
        streets: ['Ngô Thì Nhậm', 'Nguyễn Tất Thành', 'Tôn Đức Thắng', 'Nguyễn Lương Bằng', 'Hoàng Thị Loan', 'Nguyễn Sinh Sắc'],
        projects: ['Asiana Luxury Residences (Shizen Nami)', 'Khu đô thị Golden Hills Đà Nẵng', 'Khu đô thị Dragon Smart City']
      }
    ]
  },

  // =========================================================================
  // 4. BÌNH DƯƠNG (TP. Thủ Dầu Một, Thuận An, Dĩ An, Bến Cát, Tân Uyên...)
  // =========================================================================
  {
    id: 'bd',
    name: 'Bình Dương',
    region: 'Miền Nam',
    districts: [
      {
        id: 'bd-tda',
        name: 'TP. Thủ Dầu Một',
        wards: ['Phường Phú Hòa', 'Phường Hiệp Thành', 'Phường Phú Cường', 'Phường Định Hòa', 'Phường Hòa Phú', 'Phường Phú Lợi', 'Phường Chánh Nghĩa'],
        streets: ['Đại Lộ Bình Dương (QL13)', 'Yersin', 'Thích Quảng Đức', 'Huỳnh Văn Lũy', 'Phạm Ngọc Thạch', 'Lê Hồng Phong', 'Bác Sĩ Yersin'],
        projects: ['Becamex Tokyu Sora Gardens 1 & 2', 'Midori Park The View', 'Happy One Central Thủ Dầu Một', 'Compass One Chánh Nghĩa', 'Bình Dương New City']
      },
      {
        id: 'bd-ta',
        name: 'TP. Thuận An',
        wards: ['Phường Lái Thiêu', 'Phường An Phú', 'Phường Bình Hòa', 'Phường Thuận Giao', 'Phường Vĩnh Phú', 'Phường Bình Chuẩn'],
        streets: ['Quốc Lộ 13', 'ĐT743', 'Cách Mạng Tháng 8', 'Nguyễn Trãi', 'Phan Đình Phùng', 'Nguyễn Văn Tiết'],
        projects: ['Astral City Phát Đạt', 'The Rivana Thuận An', 'Opal Skyline Đất Xanh', 'Habitat Bình Dương (VSIP 1)', 'EcoXuan Lái Thiêu', 'Lavita Thuận An']
      },
      {
        id: 'bd-da',
        name: 'TP. Dĩ An',
        wards: ['Phường Dĩ An', 'Phường Đông Hòa', 'Phường Tân Bình', 'Phường An Bình', 'Phường Tân Đông Hiệp', 'Phường Bình An'],
        streets: ['Quốc Lộ 1K', 'ĐT743B', 'Nguyễn An Ninh', 'Lý Thường Kiệt', 'Thống Nhất', 'Đại Lộ Độc Lập'],
        projects: ['Bcons City & Bcons Plaza', 'Bcons Bee & Bcons Sala', 'Opal Boulevard (Phạm Văn Đồng nối dài)', 'Phú Đông Premier', 'Chung cư Charm City Dĩ An', 'Green Square Dĩ An']
      },
      {
        id: 'bd-bc',
        name: 'TP. Bến Cát',
        wards: ['Phường Mỹ Phước', 'Phường Thới Hòa', 'Phường Tân Định', 'Phường Hòa Lợi', 'Phường Chánh Phú Hòa'],
        streets: ['Đại Lộ Bình Dương', 'Đường Vành Đai 4', 'Đường NE8 Mỹ Phước 3', 'Đường ĐT741'],
        projects: ['Khu đô thị EcoLakes Mỹ Phước', 'Khu đô thị Mỹ Phước 1, 2, 3, 4', 'Oasis City Bến Cát', 'Mega City Bến Cát']
      }
    ]
  },

  // =========================================================================
  // 5. ĐỒNG NAI (Biên Hòa, Long Thành, Nhơn Trạch, Trảng Bom...)
  // =========================================================================
  {
    id: 'dong-nai',
    name: 'Đồng Nai',
    region: 'Miền Nam',
    districts: [
      {
        id: 'dn-bh',
        name: 'TP. Biên Hòa',
        wards: ['Phường Quyết Thắng', 'Phường Thống Nhất', 'Phường Trung Dũng', 'Phường Tân Mai', 'Phường Tam Hiệp', 'Phường Trảng Dài', 'Phường Long Bình Tân', 'Phường Hiệp Hòa'],
        streets: ['Phạm Văn Thuận', 'Nguyễn Ái Quốc', 'Võ Thị Sáu (Đường 5 nối dài)', 'Đồng Khởi', 'Xa Lộ Hà Nội', 'Bùi Văn Hòa'],
        projects: ['Aqua City Novaland (Biên Hòa)', 'Bien Hoa Universe Complex Hưng Thịnh', 'Khu đô thị Amata Biên Hòa', 'Khu đô thị Long Hưng']
      },
      {
        id: 'dn-lt',
        name: 'Huyện Long Thành',
        wards: ['Thị trấn Long Thành', 'Xã Lộc An', 'Xã Bình Sơn', 'Xã An Phước', 'Xã Long Đức', 'Xã Tam An'],
        streets: ['Quốc Lộ 51', 'Cao Tốc TP.HCM - Long Thành', 'Đường Tỉnh 769', 'Đường Bàu Cạn'],
        projects: ['Century City Kim Oanh', 'Gem Sky World Đất Xanh', 'Khu tái định cư Lộc An - Bình Sơn (Sân Bay Long Thành)']
      },
      {
        id: 'dn-nt',
        name: 'Huyện Nhơn Trạch',
        wards: ['Thị trấn Hiệp Phước', 'Xã Đại Phước', 'Xã Phú Hội', 'Xã Phước Khánh', 'Xã Long Tân'],
        streets: ['Đường Lý Thái Tổ', 'Đường Tôn Đức Thắng', 'Đường Hùng Vương', 'Đường Nguyễn Hữu Cảnh'],
        projects: ['SwanBay Đại Phước', 'SwanPark Đông Sài Gòn', 'Khu đô thị King Bay Nhơn Trạch', 'Khu đô thị Thăng Long Home Hiệp Phước']
      }
    ]
  },

  // =========================================================================
  // 6. BÀ RỊA - VŨNG TÀU (TP. Vũng Tàu, TP. Bà Rịa, TX. Phú Mỹ...)
  // =========================================================================
  {
    id: 'vung-tau',
    name: 'Bà Rịa - Vũng Tàu',
    region: 'Miền Nam',
    districts: [
      {
        id: 'vt-vt',
        name: 'TP. Vũng Tàu',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Thắng Tam (Bãi Sau)', 'Phường Nguyễn An Ninh', 'Phường Thắng Nhất', 'Phường 10', 'Phường 11'],
        streets: ['Thùy Vân', 'Hạ Long (Bãi Trước)', 'Trần Phú (Bãi Dâu)', 'Lê Hồng Phong', 'Ba Cu', 'Trương Công Định', 'Võ Thị Sáu', 'Nguyễn An Ninh'],
        projects: ['The Maris Vũng Tàu', 'Vũng Tàu Pearl Hưng Thịnh', 'Oyster Gành Hào', 'Aria Vũng Tàu Hotel & Resort', 'Gateway Vũng Tàu DIC']
      },
      {
        id: 'vt-pm',
        name: 'Thị xã Phú Mỹ',
        wards: ['Phường Phú Mỹ', 'Phường Hắc Dịch', 'Phường Mỹ Xuân', 'Phường Tân Phước', 'Phường Phước Hòa'],
        streets: ['Quốc Lộ 51', 'Đường Trần Hưng Đạo', 'Đường Hùng Vương', 'Đường Nguyễn Huệ', 'Đường Lê Duẩn'],
        projects: ['Khu đô thị Cảng Quốc Tế Cái Mép - Thị Vải', 'Tumys Phú Mỹ', 'Khu dân cư Phú Mỹ Gold City']
      }
    ]
  },

  // =========================================================================
  // 7. HẢI PHÒNG (Thành phố Hoa Phượng Đỏ)
  // =========================================================================
  {
    id: 'hai-phong',
    name: 'Hải Phòng',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hp-hb',
        name: 'Quận Hồng Bàng',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Thượng Lý', 'Phường Quán Toan'],
        streets: ['Điện Biên Phủ', 'Đinh Tiên Hoàng', 'Trần Hưng Đạo', 'Hoàng Văn Thụ', 'Bạch Đằng', 'Hùng Vương'],
        projects: ['Vinhomes Imperia Hải Phòng', 'Hoàng Huy Grand Tower', 'Diamond Crown Hải Phòng']
      },
      {
        id: 'hp-lch',
        name: 'Quận Lê Chân',
        wards: ['Phường Vĩnh Niệm', 'Phường An Dương', 'Phường Hàng Kênh', 'Phường Dư Hàng Kênh', 'Phường Kênh Dương'],
        streets: ['Tô Hiệu', 'Trần Nguyên Hãn', 'Nguyễn Đức Cảnh', 'Võ Nguyên Giáp', 'Bùi Viện', 'Hồ Sen'],
        projects: ['Vinhomes Marina Cầu Rào 2', 'Chung cư Hoàng Huy Commerce', 'Minato Residence Hải Phòng (Nhật Bản)', 'Sentosa Sky Park']
      },
      {
        id: 'hp-tn',
        name: 'Huyện Thủy Nguyên (TP. Thủy Nguyên tương lai)',
        wards: ['Thị trấn Núi Đèo', 'Xã Tân Dương', 'Xã Dương Quan', 'Xã Thủy Đường', 'Xã Hoa Động'],
        streets: ['Đường Đỗ Mười', 'Đường 359', 'Đường Máng Nước', 'Cầu Hoàng Văn Thụ'],
        projects: ['Khu đô thị Bắc Sông Cấm (Trung tâm Hành chính mới)', 'BelHomes VSIP Hải Phòng', 'Centor Hills Thủy Nguyên']
      }
    ]
  },

  // =========================================================================
  // 8. KHÁNH HÒA (Nha Trang, Cam Ranh, Cam Lâm...)
  // =========================================================================
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa',
    region: 'Miền Trung',
    districts: [
      {
        id: 'kh-nt',
        name: 'TP. Nha Trang',
        wards: ['Phường Lộc Thọ', 'Phường Vĩnh Hòa', 'Phường Vĩnh Hải', 'Phường Phước Hải', 'Phường Phước Tân', 'Phường Xương Huân', 'Phường Tân Lập'],
        streets: ['Trần Phú', 'Phạm Văn Đồng', 'Lê Thánh Tôn', 'Hùng Vương', 'Nguyễn Thị Minh Khai', 'Thống Nhất', '2 Tháng 4', 'Vân Đồn'],
        projects: ['Vega City Nha Trang (Bãi Tiên)', 'The Aston Luxury Residence (Cầu Trần Phú)', 'Scenia Bay Nha Trang', 'Gold Coast Nha Trang', 'Khu đô thị VCN Phước Hải']
      },
      {
        id: 'kh-cr',
        name: 'TP. Cam Ranh',
        wards: ['Phường Cam Nghĩa', 'Phường Cam Ranh', 'Phường Ba Ngòi', 'Xã Cam Lập'],
        streets: ['Đại Lộ Nguyễn Tất Thành', 'Quốc Lộ 1A', 'Đường Phạm Văn Đồng'],
        projects: ['KN Paradise Cam Ranh (CaraWorld)', 'Vinpearl Bãi Dài Cam Ranh', 'Movenpick Resort Cam Ranh']
      }
    ]
  },

  // =========================================================================
  // 9. QUẢNG NINH (Hạ Long, Cẩm Phả, Vân Đồn, Móng Cái...)
  // =========================================================================
  {
    id: 'quang-ninh',
    name: 'Quảng Ninh',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'qn-hl',
        name: 'TP. Hạ Long',
        wards: ['Phường Bãi Cháy', 'Phường Hòn Gai', 'Phường Bạch Đằng', 'Phường Hồng Gai', 'Phường Hồng Hải', 'Phường Cao Xanh', 'Phường Hùng Thắng'],
        streets: ['Đường Hạ Long', 'Đường Hoàng Quốc Việt', 'Đường bao biển Trần Quốc Nghiễn', 'Đường Lê Thánh Tông', 'Đường 25 Tháng 4'],
        projects: ['Sun Marina Town Bãi Cháy', 'Sun Grand City Feria Hạ Long', 'Khu đô thị Halong Marina (BIM Land)', 'The Sapphire Residence Bến Đoan', 'InterContinental Halong Bay']
      },
      {
        id: 'qn-vd',
        name: 'Huyện Vân Đồn',
        wards: ['Thị trấn Cái Rồng', 'Xã Hạ Long', 'Xã Đông Xá', 'Xã Đoàn Kết', 'Xã Quan Lạn'],
        streets: ['Đường trục chính Vân Đồn', 'Đường Lý Anh Tông', 'Tỉnh lộ 334'],
        projects: ['Khu đô thị Phương Đông Vân Đồn', 'Sonasea Vân Đồn Harbor City (CEO Group)', 'Khu kinh tế Vân Đồn']
      }
    ]
  },

  // =========================================================================
  // 10. CẦN THƠ (Thủ phủ Miền Tây)
  // =========================================================================
  {
    id: 'can-tho',
    name: 'Cần Thơ',
    region: 'Miền Nam',
    districts: [
      {
        id: 'ct-nk',
        name: 'Quận Ninh Kiều',
        wards: ['Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường Tân An (Bến Ninh Kiều)', 'Phường Xuân Khánh', 'Phường Hưng Lợi'],
        streets: ['Hai Bà Trưng (Bến Ninh Kiều)', 'Đại Lộ Hòa Bình', '30 Tháng 4', 'Nguyễn Văn Cừ', 'Mậu Thân', 'Trần Hưng Đạo', 'Cách Mạng Tháng 8'],
        projects: ['Stella Mega City Cần Thơ', 'Chung cư Cara River Park Cần Thơ', 'Vincom Shophouse Cần Thơ', 'Khu đô thị Nam Cần Thơ']
      },
      {
        id: 'ct-cr',
        name: 'Quận Cái Răng',
        wards: ['Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Ba Láng'],
        streets: ['Quốc Lộ 1A', 'Đường Võ Nguyên Giáp', 'Đường Phạm Hùng', 'Đường Trần Hưng Đạo'],
        projects: ['Khu đô thị Hưng Phú 1 & 2', 'Khu đô thị Nam Long Cần Thơ', 'Khu dân cư Nông Thổ Sản']
      }
    ]
  },

  // =========================================================================
  // 11. LÂM ĐỒNG (Đà Lạt & Bảo Lộc)
  // =========================================================================
  {
    id: 'lam-dong',
    name: 'Lâm Đồng',
    region: 'Miền Trung',
    districts: [
      {
        id: 'ld-dl',
        name: 'TP. Đà Lạt',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'],
        streets: ['Trần Phú', 'Trần Hưng Đạo', 'Nguyễn Thị Minh Khai (Chợ Đà Lạt)', 'Bùi Thị Xuân', 'Phan Đình Phùng', 'Khe Sanh', 'Hùng Vương', 'Mai Anh Đào'],
        projects: ['Khu biệt thự cổ Trần Hưng Đạo', 'Dalat Wonder Resort', 'Sacom Tuyền Lâm Resort', 'The Panorama Đà Lạt']
      },
      {
        id: 'ld-bl',
        name: 'TP. Bảo Lộc',
        wards: ['Phường 1', 'Phường 2', 'Phường B\'Lao', 'Phường Lộc Sơn', 'Phường Lộc Phát'],
        streets: ['Trần Phú (QL20)', 'Nguyễn Công Trứ', 'Lê Hồng Phong', 'Huỳnh Thúc Kháng', 'Lý Thường Kiệt'],
        projects: ['Khu đô thị Bảo Lộc Golden City', 'Làng sinh thái La Nature', 'Fog Garden Bảo Lộc']
      }
    ]
  },

  // =========================================================================
  // 12. HƯNG YÊN (Ecopark, Vinhomes Ocean Park 2 & 3)
  // =========================================================================
  {
    id: 'hung-yen',
    name: 'Hưng Yên',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hy-vg',
        name: 'Huyện Văn Giang',
        wards: ['Thị trấn Văn Giang', 'Xã Xuân Quan', 'Xã Phụng Công', 'Xã Cửu Cao', 'Xã Nghĩa Trụ', 'Xã Long Hưng'],
        streets: ['Đường trục Ecopark', 'Đường Vành Đai 3.5', 'Đường ĐT 379', 'Đường Tô Quyền'],
        projects: [
          'Thành phố xanh Ecopark Hưng Yên',
          'Vinhomes Ocean Park 2 - The Empire (Nghĩa Trụ)',
          'Vinhomes Ocean Park 3 - The Crown',
          'Khu biệt thự đảo Ecopark Grand The Island',
          'Chung cư Haven Park Ecopark'
        ]
      },
      {
        id: 'hy-tp',
        name: 'TP. Hưng Yên',
        wards: ['Phường Hiến Nam', 'Phường Lê Lợi', 'Phường Minh Khai', 'Phường Hồng Châu', 'Phường Lam Sơn'],
        streets: ['Đường Bãi Sậy', 'Đường Điện Biên', 'Đường Nguyễn Văn Linh', 'Đường Chùa Chuông'],
        projects: ['Khu đô thị Phố Nối House', 'Khu đô thị V-Green City Phố Nối']
      }
    ]
  },

  // =========================================================================
  // 13. BẮC NINH (Kinh Bắc - Đô thị Vệ Tinh Công Nghệ Cao)
  // =========================================================================
  {
    id: 'bac-ninh',
    name: 'Bắc Ninh',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'bn-tp',
        name: 'TP. Bắc Ninh',
        wards: ['Phường Suối Hoa', 'Phường Tiền An', 'Phường Ninh Xá', 'Phường Đại Phúc', 'Phường Võ Cường', 'Phường Vạn An'],
        streets: ['Đường Lý Thái Tổ', 'Đường Trần Hưng Đạo', 'Đường Nguyễn Gia Thiều', 'Đường Lê Thái Tổ', 'Đường Huyền Quang'],
        projects: ['Vinhomes Bắc Ninh (Ngã 6)', 'Royal Park Bắc Ninh', 'Sing Garden VSIP Bắc Ninh', 'Khu đô thị Him Lam Green Park']
      },
      {
        id: 'bn-ts',
        name: 'TP. Từ Sơn',
        wards: ['Phường Đồng Nguyên', 'Phường Tân Hồng', 'Phường Đình Bảng', 'Phường Trang Hạ', 'Phường Đông Ngàn'],
        streets: ['Đường Trần Phú', 'Đường Lý Thánh Tông', 'Đường Lê Quang Đạo', 'Quốc Lộ 1A'],
        projects: ['Khu đô thị Nam Hồng Từ Sơn', 'Khu đô thị Hanaka Paris Ocean Park Từ Sơn', 'Khu công nghiệp & đô thị VSIP Bắc Ninh']
      }
    ]
  },

  // =========================================================================
  // 14. LONG AN (Cửa ngõ Tây Nam Bộ)
  // =========================================================================
  {
    id: 'long-an',
    name: 'Long An',
    region: 'Miền Nam',
    districts: [
      {
        id: 'la-bl',
        name: 'Huyện Bến Lức',
        wards: ['Thị trấn Bến Lức', 'Xã An Thạnh', 'Xã Thạnh Đức', 'Xã Lương Hòa', 'Xã Mỹ Yên'],
        streets: ['Quốc Lộ 1A', 'Đường Nguyễn Hữu Thọ', 'Tỉnh lộ 830', 'Đường Vành Đai 4'],
        projects: ['Khu đô thị Waterpoint Nam Long (355ha)', 'Khu đô thị Lago Centro', 'Khu dân cư Phúc Long']
      },
      {
        id: 'la-cg',
        name: 'Huyện Cần Giuộc',
        wards: ['Thị trấn Cần Giuộc', 'Xã Long Hậu', 'Xã Phước Lại', 'Xã Đông Thạnh', 'Xã Phước Vĩnh Tây'],
        streets: ['Quốc Lộ 50', 'Đường Nguyễn Văn Tạo nối dài', 'Tỉnh lộ 826', 'Đường Tân Tập - Long Hậu'],
        projects: ['Khu đô thị T&T City Millennia Cần Giuộc (267ha)', 'Hiep Phuoc Harbour View', 'Sài Gòn Village Long Hậu']
      },
      {
        id: 'la-dh',
        name: 'Huyện Đức Hòa',
        wards: ['Thị trấn Hậu Nghĩa', 'Thị trấn Đức Hòa', 'Xã Đức Hòa Hạ', 'Xã Mỹ Hạnh Nam', 'Xã Mỹ Hạnh Bắc'],
        streets: ['Tỉnh lộ 824', 'Tỉnh lộ 10', 'Tỉnh lộ 825', 'Quốc Lộ N2'],
        projects: ['Khu đô thị Cát Tường Phú Sinh', 'Khu đô thị E.City Tân Đức', 'West Lakes Golf & Villas Đức Hòa']
      }
    ]
  },

  // =========================================================================
  // 15. KIÊN GIANG (Đảo Ngọc Phú Quốc)
  // =========================================================================
  {
    id: 'kien-giang',
    name: 'Kiên Giang',
    region: 'Miền Nam',
    districts: [
      {
        id: 'kg-pq',
        name: 'TP. Phú Quốc',
        wards: ['Phường Dương Đông', 'Phường An Thới', 'Xã Gành Dầu', 'Xã Cửa Cạn', 'Xã Cửa Dương', 'Xã Dương Tơ', 'Xã Hàm Ninh', 'Xã Bãi Thơm'],
        streets: ['Trần Hưng Đạo (Bãi Trường)', 'Đường 30 Tháng 4', 'Nguyễn Trung Trực', 'Đường Bào', 'Đường Suối Mây', 'Đường Cửa Cạn - Gành Dầu'],
        projects: [
          'Grand World Phú Quốc (United Center)',
          'Sun Grand City New An Thới',
          'Sun Premier Village Primavera (Thị trấn Hoàng Hôn)',
          'Meyhomes Capital Phú Quốc (Tân Á Đại Thành)',
          'Khu nghỉ dưỡng Bãi Kem Phú Quốc (Sun Group)'
        ]
      },
      {
        id: 'kg-rg',
        name: 'TP. Rạch Giá',
        wards: ['Phường Vĩnh Thanh Vân', 'Phường Vĩnh Lạc', 'Phường An Hòa', 'Phường Vĩnh Quang'],
        streets: ['Đường Nguyễn Trung Trực', 'Đường Trần Phú', 'Đường Lạc Hồng', 'Đường 3 Tháng 2'],
        projects: ['Khu lấn biển Rạch Giá (Phú Cường)', 'Khu đô thị Tây Bắc Rạch Giá']
      }
    ]
  },

  // =========================================================================
  // 16. THỪA THIÊN HUẾ (Cố Đô Huế)
  // =========================================================================
  {
    id: 'hue',
    name: 'Thừa Thiên Huế',
    region: 'Miền Trung',
    districts: [
      {
        id: 'hue-tp',
        name: 'TP. Huế',
        wards: ['Phường Vĩnh Ninh', 'Phường Phú Nhuận', 'Phường Thuận Thành', 'Phường Phú Hội', 'Phường An Cựu', 'Phường Xuân Phú'],
        streets: ['Lê Lợi', 'Hùng Vương', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hà Nội', 'Đống Đa', 'Bà Triệu'],
        projects: ['Khu đô thị An Cựu City', 'Khu đô thị Manor Crown Huế', 'Bria Vạn Xuân Huế', 'Eco Garden Huế']
      }
    ]
  },

  // =========================================================================
  // 17. BÌNH THUẬN (Phan Thiết & Mũi Né)
  // =========================================================================
  {
    id: 'binh-thuan',
    name: 'Bình Thuận',
    region: 'Miền Trung',
    districts: [
      {
        id: 'bt-pt',
        name: 'TP. Phan Thiết',
        wards: ['Phường Hàm Tiến (Mũi Né)', 'Phường Mũi Né', 'Phường Phú Thủy', 'Phường Đức Nghĩa', 'Phường Thanh Hải', 'Xã Tiến Thành'],
        streets: ['Nguyễn Đình Chiểu', 'Huỳnh Thúc Kháng', 'Trần Hưng Đạo', 'Thủ Khoa Huân', 'Lạc Long Quân', 'Võ Nguyên Giáp'],
        projects: ['NovaWorld Phan Thiết (Tiến Thành)', 'Apec Mandala Wyndham Mũi Né', 'Summerland Mũi Né Hưng Lộc Phát', 'Centara Mirage Resort Mũi Né']
      }
    ]
  },

  // =========================================================================
  // CÁC TỈNH THÀNH CÒN LẠI (Hoàn thiện đầy đủ 63 Tỉnh/Thành phố toàn quốc)
  // =========================================================================
  {
    id: 'thanh-hoa',
    name: 'Thanh Hóa',
    region: 'Miền Trung',
    districts: [
      {
        id: 'th-tp',
        name: 'TP. Thanh Hóa',
        wards: ['Phường Điện Biên', 'Phường Đông Thọ', 'Phường Đông Sơn', 'Phường Ba Đình', 'Phường Đông Vệ'],
        streets: ['Đại Lộ Lê Lợi', 'Đường Trần Phú', 'Đường Quang Trung', 'Đại Lộ Hùng Vương'],
        projects: ['Vinhomes Star City Thanh Hóa', 'Eurowindow Garden City Thanh Hóa', 'Sun Group Sầm Sơn']
      },
      {
        id: 'th-ss',
        name: 'TP. Sầm Sơn',
        wards: ['Phường Bắc Sơn', 'Phường Trung Sơn', 'Phường Trường Sơn', 'Phường Quảng Cư'],
        streets: ['Đường Hồ Xuân Hương', 'Đường Thanh Niên', 'Đường Nguyễn Du'],
        projects: ['Sun Grand Boulevard Sầm Sơn', 'FLC Samson Beach & Golf Resort']
      }
    ]
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    region: 'Miền Trung',
    districts: [
      {
        id: 'na-tp',
        name: 'TP. Vinh',
        wards: ['Phường Quang Trung', 'Phường Lê Mao', 'Phường Hưng Bình', 'Phường Trường Thi', 'Phường Hà Huy Tập'],
        streets: ['Đường Quang Trung', 'Đường Lê Nin', 'Đường Trường Thi', 'Đường Nguyễn Văn Cừ'],
        projects: ['Khu đô thị Eco Central Park Vinh (Ecopark)', 'Vinhomes Quang Trung', 'Handico Vinh']
      },
      {
        id: 'na-cl',
        name: 'Thị xã Cửa Lò',
        wards: ['Phường Nghi Thu', 'Phường Nghi Hương', 'Phường Thu Thủy', 'Phường Nghi Thủy'],
        streets: ['Đường Bình Minh', 'Đường Nguyễn Sinh Cung', 'Đường Nguyễn Huệ'],
        projects: ['Vinpearl Cửa Hội Resort', 'Cửa Lò Golf Resort']
      }
    ]
  },
  {
    id: 'quang-nam',
    name: 'Quảng Nam',
    region: 'Miền Trung',
    districts: [
      {
        id: 'qn-ha',
        name: 'TP. Hội An',
        wards: ['Phường Cẩm Phô', 'Phường Minh An', 'Phường Cẩm Châu', 'Phường Cửa Đại', 'Phường Cẩm An (An Bàng)'],
        streets: ['Trần Phú', 'Bạch Đằng', 'Cửa Đại', 'Lạc Long Quân', 'Hai Bà Trưng'],
        projects: ['Hoiana Shores Golf Villa', 'Shantira Beach Resort & Spa Hội An', 'Hội An d\'Or']
      },
      {
        id: 'qn-tk',
        name: 'TP. Tam Kỳ',
        wards: ['Phường An Mỹ', 'Phường An Xuân', 'Phường Phước Hòa'],
        streets: ['Đường Hùng Vương', 'Đường Phan Châu Trinh', 'Đường Trần Cao Vân']
      }
    ]
  },
  {
    id: 'hai-duong',
    name: 'Hải Dương',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hd-tp',
        name: 'TP. Hải Dương',
        wards: ['Phường Trần Phú', 'Phường Lê Thanh Nghị', 'Phường Quang Trung', 'Phường Tứ Minh'],
        streets: ['Đường Nguyễn Lương Bằng', 'Đường Trần Hưng Đạo', 'Đường Bạch Đằng', 'Đường Thanh Niên'],
        projects: ['Khu đô thị Ecorivers Hải Dương (Ecopark Hải Dương)']
      }
    ]
  },
  {
    id: 'thai-nguyen',
    name: 'Thái Nguyên',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'tn-tp',
        name: 'TP. Thái Nguyên',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Phan Đình Phùng', 'Phường Quang Trung', 'Phường Tân Lập'],
        streets: ['Đường Hoàng Văn Thụ', 'Đường Lương Ngọc Quyến', 'Đường Cách Mạng Tháng 8'],
        projects: ['Khu đô thị Danko City Thái Nguyên', 'Crown Villas Thái Nguyên']
      }
    ]
  },
  {
    id: 'nam-dinh',
    name: 'Nam Định',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'nd-tp',
        name: 'TP. Nam Định',
        wards: ['Phường Trần Hưng Đạo', 'Phường Vị Hoàng', 'Phường Năng Tĩnh', 'Phường Lộc Vượng'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Lê Hồng Phong', 'Đường Quang Trung', 'Đường Đông A']
      }
    ]
  },
  {
    id: 'vinh-phuc',
    name: 'Vĩnh Phúc',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'vp-vy',
        name: 'TP. Vĩnh Yên',
        wards: ['Phường Tích Sơn', 'Phường Liên Bảo', 'Phường Khai Quang', 'Phường Định Trung'],
        streets: ['Đường Mê Linh', 'Đường Nguyễn Tất Thành', 'Đường Hai Bà Trưng'],
        projects: ['Khu đô thị Times Garden Vĩnh Yên', 'Khu nghỉ dưỡng Flamingo Đại Lải']
      }
    ]
  },
  {
    id: 'bac-giang',
    name: 'Bắc Giang',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'bg-tp',
        name: 'TP. Bắc Giang',
        wards: ['Phường Ngô Quyền', 'Phường Trần Phú', 'Phường Lê Lợi', 'Phường Hoàng Văn Thụ'],
        streets: ['Đường Hùng Vương', 'Đường Hoàng Văn Thụ', 'Đường Xương Giang'],
        projects: ['Vinhomes Sky Park Bắc Giang', 'Aqua Park Bắc Giang']
      }
    ]
  },
  {
    id: 'phu-tho',
    name: 'Phú Thọ',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'pt-vt',
        name: 'TP. Việt Trì',
        wards: ['Phường Gia Cẩm', 'Phường Tiên Cát', 'Phường Nông Trang', 'Phường Tân Dân'],
        streets: ['Đại Lộ Hùng Vương', 'Đường Nguyễn Tất Thành', 'Đường Châu Phong'],
        projects: ['Khu nghỉ dưỡng Wyndham Lynn Times Thanh Thủy']
      }
    ]
  },
  {
    id: 'thai-binh',
    name: 'Thái Bình',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'tb-tp',
        name: 'TP. Thái Bình',
        wards: ['Phường Lê Hồng Phong', 'Phường Bồ Xuyên', 'Phường Kỳ Bá', 'Phường Đề Thám'],
        streets: ['Đường Lê Lợi', 'Đường Trần Hưng Đạo', 'Đường Lý Bôn', 'Đường Hai Bà Trưng']
      }
    ]
  },
  {
    id: 'ha-nam',
    name: 'Hà Nam',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hn-ply',
        name: 'TP. Phủ Lý',
        wards: ['Phường Minh Khai', 'Phường Lương Khánh Thiện', 'Phường Lê Hồng Phong'],
        streets: ['Đường Biên Hòa', 'Đường Đinh Tiên Hoàng', 'Đường Lý Thường Kiệt'],
        projects: ['Sun Urban City Hà Nam (Sun Group)', 'Khu đô thị CEO City Phủ Lý']
      }
    ]
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'nb-tp',
        name: 'TP. Ninh Bình',
        wards: ['Phường Vân Giang', 'Phường Tân Thành', 'Phường Nam Thành', 'Phường Bích Đào'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Lê Hồng Phong', 'Đường Đinh Tiên Hoàng']
      }
    ]
  },
  {
    id: 'hoa-binh',
    name: 'Hòa Bình',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hb-tp',
        name: 'TP. Hòa Bình',
        wards: ['Phường Phương Lâm', 'Phường Đồng Tiến', 'Phường Hữu Nghị', 'Phường Tân Thịnh'],
        streets: ['Đường Cù Chính Lan', 'Đường Chi Lăng', 'Đường Trần Hưng Đạo'],
        projects: ['Ivory Villas & Resort Lương Sơn', 'Legacy Hill Hòa Bình']
      }
    ]
  },
  {
    id: 'lao-cai',
    name: 'Lào Cai',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'lc-sp',
        name: 'Thị xã Sa Pa',
        wards: ['Phường Sa Pa', 'Phường Phan Si Păng', 'Phường Cầu Mây', 'Phường Hàm Rồng'],
        streets: ['Đường Fansipan', 'Đường Cầu Mây', 'Đường Thạch Sơn', 'Đường Mường Hoa'],
        projects: ['Sun World Fansipan Legend', 'Sapa Jade Hill Resort']
      },
      {
        id: 'lc-tp',
        name: 'TP. Lào Cai',
        wards: ['Phường Kim Tân', 'Phường Cốc Lếu', 'Phường Bắc Cường'],
        streets: ['Đại Lộ Trần Hưng Đạo', 'Đường Hoàng Liên', 'Đường Quy Hóa']
      }
    ]
  },
  {
    id: 'binh-dinh',
    name: 'Bình Định',
    region: 'Miền Trung',
    districts: [
      {
        id: 'bd-qn',
        name: 'TP. Quy Nhơn',
        wards: ['Phường Lê Lợi', 'Phường Trần Phú', 'Phường Nguyễn Văn Cừ', 'Phường Ghềnh Ráng'],
        streets: ['Đường Xuân Diệu', 'Đường An Dương Vương', 'Đường Nguyễn Tất Thành', 'Đường Tây Sơn'],
        projects: ['Khu đô thị FLC Quy Nhơn Beach & Golf Resort', 'TMS Hotel Quy Nhơn', 'Grand Center Quy Nhơn']
      }
    ]
  },
  {
    id: 'phu-yen',
    name: 'Phú Yên',
    region: 'Miền Trung',
    districts: [
      {
        id: 'py-th',
        name: 'TP. Tuy Hòa',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 7', 'Phường 9'],
        streets: ['Đường Hùng Vương', 'Đường Độc Lập', 'Đường Trần Hưng Đạo', 'Đường Lê Duẩn'],
        projects: ['Kallias Complex City Tuy Hòa', 'Apec Mandala Grand Phú Yên']
      }
    ]
  },
  {
    id: 'ninh-thuan',
    name: 'Ninh Thuận',
    region: 'Miền Trung',
    districts: [
      {
        id: 'nt-pr',
        name: 'TP. Phan Rang - Tháp Chàm',
        wards: ['Phường Kinh Dinh', 'Phường Phủ Hà', 'Phường Mỹ Hương', 'Phường Thanh Sơn'],
        streets: ['Đường Thống Nhất', 'Đường 16 Tháng 4', 'Đường Yên Ninh (Biển Ninh Chữ)'],
        projects: ['SunBay Park Hotel & Resort Phan Rang']
      }
    ]
  },
  {
    id: 'dak-lak',
    name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    districts: [
      {
        id: 'dl-bmt',
        name: 'TP. Buôn Ma Thuột',
        wards: ['Phường Thắng Lợi', 'Phường Tân Lợi', 'Phường Tự An', 'Phường Tân Lập', 'Phường Thành Công'],
        streets: ['Đường Lê Duẩn', 'Đường Nguyễn Tất Thành', 'Đường Phan Chu Trinh', 'Đường Phan Bội Châu'],
        projects: ['Thành phố Cà Phê (Coffee City Trung Nguyên)', 'Khu đô thị EcoCity Premia Buôn Ma Thuột']
      }
    ]
  },
  {
    id: 'gia-lai',
    name: 'Gia Lai',
    region: 'Tây Nguyên',
    districts: [
      {
        id: 'gl-pk',
        name: 'TP. Pleiku',
        wards: ['Phường Hoa Lư', 'Phường Tây Sơn', 'Phường Diên Hồng', 'Phường Hội Thương'],
        streets: ['Đường Hùng Vương', 'Đường Trần Phú', 'Đường Lê Duẩn', 'Đường Phan Đình Phùng']
      }
    ]
  },
  {
    id: 'tien-giang',
    name: 'Tiền Giang',
    region: 'Miền Nam',
    districts: [
      {
        id: 'tg-mytho',
        name: 'TP. Mỹ Tho',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 7'],
        streets: ['Đường Ấp Bắc', 'Đường Hùng Vương', 'Đường Lý Thường Kiệt', 'Đường Tết Mậu Thân']
      }
    ]
  },
  {
    id: 'ben-tre',
    name: 'Bến Tre',
    region: 'Miền Nam',
    districts: [
      {
        id: 'bt-tp',
        name: 'TP. Bến Tre',
        wards: ['Phường An Hội', 'Phường Phú Khương', 'Phường Phú Tân'],
        streets: ['Đại Lộ Đồng Khởi', 'Đường Nguyễn Đình Chiểu', 'Đường Hùng Vương']
      }
    ]
  },
  {
    id: 'tay-ninh',
    name: 'Tây Ninh',
    region: 'Miền Nam',
    districts: [
      {
        id: 'tn-tp',
        name: 'TP. Tây Ninh',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường Hiệp Ninh', 'Phường Ninh Sơn'],
        streets: ['Đường Cách Mạng Tháng 8', 'Đường 30 Tháng 4', 'Đường Hoàng Lê Kha', 'Đường Bời Lời (Núi Bà Đen)'],
        projects: ['Khu du lịch Quốc gia Núi Bà Đen (Sun Group)']
      }
    ]
  },
  {
    id: 'an-giang',
    name: 'An Giang',
    region: 'Miền Nam',
    districts: [
      {
        id: 'ag-lx',
        name: 'TP. Long Xuyên',
        wards: ['Phường Mỹ Long', 'Phường Mỹ Bình', 'Phường Mỹ Xuyên', 'Phường Đông Xuyên'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Hà Hoàng Hổ', 'Đường Lý Thái Tổ']
      },
      {
        id: 'ag-cd',
        name: 'TP. Châu Đốc',
        wards: ['Phường Châu Phú A', 'Phường Châu Phú B', 'Phường Núi Sam'],
        streets: ['Đường Lê Lợi', 'Đường Thủ Khoa Nghĩa', 'Đường Tân Lộ Kiều Lương']
      }
    ]
  },
  {
    id: 'ca-mau',
    name: 'Cà Mau',
    region: 'Miền Nam',
    districts: [
      {
        id: 'cm-tp',
        name: 'TP. Cà Mau',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 8', 'Phường 9'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Phan Ngọc Hiển', 'Đường Hùng Vương', 'Đường Nguyễn Tất Thành']
      }
    ]
  },
  {
    id: 'bac-lieu',
    name: 'Bạc Liêu',
    region: 'Miền Nam',
    districts: [
      {
        id: 'bl-tp',
        name: 'TP. Bạc Liêu',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 7', 'Phường 8'],
        streets: ['Đường Trần Phú', 'Đường Hòa Bình', 'Đường Hai Bà Trưng', 'Đường Võ Thị Sáu']
      }
    ]
  },
  {
    id: 'vinh-long',
    name: 'Vĩnh Long',
    region: 'Miền Nam',
    districts: [
      {
        id: 'vl-tp',
        name: 'TP. Vĩnh Long',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 8', 'Phường 9'],
        streets: ['Đường Lê Thái Tổ', 'Đường Trưng Nữ Vương', 'Đường Nguyễn Huệ', 'Đường Phạm Thái Bường']
      }
    ]
  },
  {
    id: 'dong-thap',
    name: 'Đồng Tháp',
    region: 'Miền Nam',
    districts: [
      {
        id: 'dt-cl',
        name: 'TP. Cao Lãnh',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường Hòa Thuận'],
        streets: ['Đường Nguyễn Huệ', 'Đường Lý Thường Kiệt', 'Đường 30 Tháng 4', 'Đường Hùng Vương']
      },
      {
        id: 'dt-sd',
        name: 'TP. Sa Đéc',
        wards: ['Phường 1', 'Phường 2', 'Phường Tân Quy Đông'],
        streets: ['Đường Hùng Vương', 'Đường Trần Hưng Đạo', 'Đường Nguyễn Sinh Sắc']
      }
    ]
  },
  {
    id: 'soc-trang',
    name: 'Sóc Trăng',
    region: 'Miền Nam',
    districts: [
      {
        id: 'st-tp',
        name: 'TP. Sóc Trăng',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 6'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Hai Bà Trưng', 'Đường Lê Duẩn']
      }
    ]
  },
  {
    id: 'tra-vinh',
    name: 'Trà Vinh',
    region: 'Miền Nam',
    districts: [
      {
        id: 'tv-tp',
        name: 'TP. Trà Vinh',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 7'],
        streets: ['Đường Phạm Thái Bường', 'Đường Điện Biên Phủ', 'Đường Nguyễn Thị Minh Khai']
      }
    ]
  },
  {
    id: 'hau-giang',
    name: 'Hậu Giang',
    region: 'Miền Nam',
    districts: [
      {
        id: 'hg-vt',
        name: 'TP. Vị Thanh',
        wards: ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5'],
        streets: ['Đường Trần Hưng Đạo', 'Đường Nguyễn Công Trứ', 'Đường 3 Tháng 2']
      }
    ]
  },
  {
    id: 'binh-phuoc',
    name: 'Bình Phước',
    region: 'Miền Nam',
    districts: [
      {
        id: 'bp-dx',
        name: 'TP. Đồng Xoài',
        wards: ['Phường Tân Phú', 'Phường Tân Bình', 'Phường Tân Đồng', 'Phường Tân Xuân'],
        streets: ['Đường Phú Riềng Đỏ', 'Đường Quốc Lộ 14', 'Đường Hùng Vương', 'Đường ĐT 741'],
        projects: ['Khu đô thị Cát Tường Phú Hưng Đồng Xoài']
      }
    ]
  },
  {
    id: 'ha-tinh',
    name: 'Hà Tĩnh',
    region: 'Miền Trung',
    districts: [
      {
        id: 'ht-tp',
        name: 'TP. Hà Tĩnh',
        wards: ['Phường Bắc Hà', 'Phường Nam Hà', 'Phường Trần Phú', 'Phường Tân Giang'],
        streets: ['Đường Hà Huy Tập', 'Đường Trần Phú', 'Đường Phan Đình Phùng'],
        projects: ['Vinhomes New Center Hà Tĩnh']
      }
    ]
  },
  {
    id: 'quang-binh',
    name: 'Quảng Bình',
    region: 'Miền Trung',
    districts: [
      {
        id: 'qb-dh',
        name: 'TP. Đồng Hới',
        wards: ['Phường Đồng Hải', 'Phường Hải Đình', 'Phường Bắc Lý', 'Phường Nam Lý'],
        streets: ['Đường Quách Xuân Kỳ', 'Đường Hùng Vương', 'Đường Trần Hưng Đạo'],
        projects: ['FLC Quang Binh Beach & Golf Resort']
      }
    ]
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị',
    region: 'Miền Trung',
    districts: [
      {
        id: 'qt-dh',
        name: 'TP. Đông Hà',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường Đông Lễ'],
        streets: ['Đường Lê Duẩn', 'Đường Quốc Lộ 9', 'Đường Hùng Vương']
      }
    ]
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    region: 'Miền Trung',
    districts: [
      {
        id: 'qng-tp',
        name: 'TP. Quảng Ngãi',
        wards: ['Phường Trần Phú', 'Phường Lê Hồng Phong', 'Phường Chánh Lộ', 'Phường Nghĩa Chánh'],
        streets: ['Đường Quang Trung', 'Đường Hùng Vương', 'Đường Phan Đình Phùng'],
        projects: ['Khu đô thị VSIP Quảng Ngãi']
      }
    ]
  },
  {
    id: 'kon-tum',
    name: 'Kon Tum',
    region: 'Tây Nguyên',
    districts: [
      {
        id: 'kt-tp',
        name: 'TP. Kon Tum',
        wards: ['Phường Quyết Thắng', 'Phường Thắng Lợi', 'Phường Quang Trung'],
        streets: ['Đường Phan Đình Phùng', 'Đường Trần Phú', 'Đường Bà Triệu']
      }
    ]
  },
  {
    id: 'dak-nong',
    name: 'Đắk Nông',
    region: 'Tây Nguyên',
    districts: [
      {
        id: 'dn-gn',
        name: 'TP. Gia Nghĩa',
        wards: ['Phường Nghĩa Đức', 'Phường Nghĩa Thành', 'Phường Nghĩa Phú'],
        streets: ['Đường 23 Tháng 3', 'Đường Hùng Vương', 'Đường Tôn Đức Thắng']
      }
    ]
  },
  {
    id: 'lang-son',
    name: 'Lạng Sơn',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'ls-tp',
        name: 'TP. Lạng Sơn',
        wards: ['Phường Hoàng Văn Thụ', 'Phường Tam Thanh', 'Phường Chi Lăng', 'Phường Vĩnh Trại'],
        streets: ['Đường Trần Phú', 'Đường Lê Lợi', 'Đường Bà Triệu']
      }
    ]
  },
  {
    id: 'son-la',
    name: 'Sơn La',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'sl-tp',
        name: 'TP. Sơn La',
        wards: ['Phường Chiềng Lề', 'Phường Tô Hiệu', 'Phường Quyết Thắng'],
        streets: ['Đường Tô Hiệu', 'Đường Chu Văn Thịnh', 'Đường Giảng Lắc']
      },
      {
        id: 'sl-mc',
        name: 'Huyện Mộc Châu',
        wards: ['Thị trấn Mộc Châu', 'Thị trấn Nông trường Mộc Châu', 'Xã Đông Sang'],
        streets: ['Quốc Lộ 6', 'Đường Phan Đình Giót', 'Đường Thảo Nguyên']
      }
    ]
  },
  {
    id: 'yen-bai',
    name: 'Yên Bái',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'yb-tp',
        name: 'TP. Yên Bái',
        wards: ['Phường Đồng Tâm', 'Phường Yên Ninh', 'Phường Minh Tân', 'Phường Hồng Hà'],
        streets: ['Đường Điện Biên', 'Đường Đinh Tiên Hoàng', 'Đường Trần Hưng Đạo']
      }
    ]
  },
  {
    id: 'tuyen-quang',
    name: 'Tuyên Quang',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'tq-tp',
        name: 'TP. Tuyên Quang',
        wards: ['Phường Tân Quang', 'Phường Phan Thiết', 'Phường Minh Xuân'],
        streets: ['Đường Bình Thuận', 'Đường Quang Trung', 'Đường Tân Trào'],
        projects: ['Vincom Shophouse Tuyên Quang']
      }
    ]
  },
  {
    id: 'ha-giang',
    name: 'Hà Giang',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'hg-tp',
        name: 'TP. Hà Giang',
        wards: ['Phường Trần Phú', 'Phường Minh Khai', 'Phường Nguyễn Trãi'],
        streets: ['Đường Nguyễn Trãi', 'Đường Trần Hưng Đạo', 'Đường Lý Thường Kiệt']
      }
    ]
  },
  {
    id: 'cao-bang',
    name: 'Cao Bằng',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'cb-tp',
        name: 'TP. Cao Bằng',
        wards: ['Phường Hợp Giang', 'Phường Sông Bằng', 'Phường Sông Hiến'],
        streets: ['Đường Kim Đồng', 'Đường Hoàng Đình Giong', 'Đường Bế Văn Đàn']
      }
    ]
  },
  {
    id: 'bac-kan',
    name: 'Bắc Kạn',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'bk-tp',
        name: 'TP. Bắc Kạn',
        wards: ['Phường Đức Xuân', 'Phường Sông Cầu', 'Phường Phùng Chí Kiên'],
        streets: ['Đường Đội Kỳ', 'Đường Kon Tum', 'Đường Trường Chinh']
      }
    ]
  },
  {
    id: 'dien-bien',
    name: 'Điện Biên',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'db-dbph',
        name: 'TP. Điện Biên Phủ',
        wards: ['Phường Mường Thanh', 'Phường Tân Thanh', 'Phường Him Lam', 'Phường Thanh Bình'],
        streets: ['Đường Võ Nguyên Giáp', 'Đường Hoàng Văn Thái', 'Đường Trần Đăng Ninh']
      }
    ]
  },
  {
    id: 'lai-chau',
    name: 'Lai Châu',
    region: 'Miền Bắc',
    districts: [
      {
        id: 'lc-tp',
        name: 'TP. Lai Châu',
        wards: ['Phường Tân Phong', 'Phường Đoàn Kết', 'Phường Quyết Thắng'],
        streets: ['Đường Trần Phú', 'Đường Lê Duẩn', 'Đường Điện Biên Phủ']
      }
    ]
  }
];

// Fallback danh sách đường phố phổ biến khi quận/huyện nhỏ chưa có dữ liệu riêng
export const DEFAULT_POPULAR_STREETS = [
  'Trần Hưng Đạo',
  'Nguyễn Huệ',
  'Lê Lợi',
  'Hùng Vương',
  'Quang Trung',
  'Hai Bà Trưng',
  'Phan Chu Trinh',
  'Lý Thường Kiệt',
  'Nguyễn Trãi',
  'Trần Phú',
  'Điện Biên Phủ',
  'Phan Đình Phùng',
  'Bà Triệu',
  'Nguyễn Văn Cừ',
  'Cách Mạng Tháng 8'
];

// Helper tra cứu nhanh Tỉnh/Thành theo tên
export function findProvinceByName(provinceName) {
  if (!provinceName) return VIETNAM_ADMINISTRATIVE_DATA[0];
  const query = provinceName.toLowerCase().trim();
  return (
    VIETNAM_ADMINISTRATIVE_DATA.find(
      (p) => p.name.toLowerCase() === query || p.id.toLowerCase() === query
    ) || VIETNAM_ADMINISTRATIVE_DATA[0]
  );
}

// Helper tra cứu danh sách Quận/Huyện của một Tỉnh/Thành
export function getDistrictsOfProvince(provinceName) {
  const province = findProvinceByName(provinceName);
  return province?.districts || [];
}

// Helper tra cứu chi tiết Quận/Huyện
export function findDistrictByName(provinceName, districtName) {
  const districts = getDistrictsOfProvince(provinceName);
  if (!districtName) return districts[0] || null;
  const query = districtName.toLowerCase().trim();
  return (
    districts.find(
      (d) => d.name.toLowerCase() === query || d.id.toLowerCase() === query
    ) || districts[0] || null
  );
}

// Helper tra cứu Phường/Xã
export function getWardsOfDistrict(provinceName, districtName) {
  const district = findDistrictByName(provinceName, districtName);
  return district?.wards || ['Phường 1', 'Phường 2', 'Trung tâm'];
}

// Helper tra cứu Đường/Phố
export function getStreetsOfDistrict(provinceName, districtName) {
  const district = findDistrictByName(provinceName, districtName);
  return district?.streets?.length ? district.streets : DEFAULT_POPULAR_STREETS;
}

// Helper tra cứu Dự án BĐS
export function getProjectsOfDistrict(provinceName, districtName) {
  const district = findDistrictByName(provinceName, districtName);
  return district?.projects || [];
}

// =========================================================================
// DỮ LIỆU SÁP NHẬP ĐƠN VỊ HÀNH CHÍNH VIỆT NAM (Administrative Mergers)
// Theo các Nghị quyết của Ủy ban Thường vụ Quốc hội về sắp xếp ĐVHC cấp huyện, cấp xã
// =========================================================================
export const VIETNAM_ADMINISTRATIVE_MERGERS = [
  // 1. ĐÀ NẴNG (Chuẩn trường hợp Ngô Thì Nhậm, Hòa Minh -> Hòa Khánh)
  {
    id: 'merger-dn-01',
    city: 'Đà Nẵng',
    district: 'Quận Liên Chiểu',
    oldWard: 'Phường Hòa Minh',
    newWard: 'Phường Hòa Khánh',
    newDistrict: '', // Theo chuẩn Batdongsan.com.vn gợi ý: "Đường Ngô Thì Nhậm, Phường Hòa Khánh, Đà Nẵng"
    newCity: 'Đà Nẵng',
    sampleStreets: ['Ngô Thì Nhậm', 'Tôn Đức Thắng', 'Nguyễn Tất Thành', 'Hoàng Thị Loan', 'Nguyễn Sinh Sắc'],
    resolution: 'Nghị quyết của UBTV Quốc hội về việc sắp xếp các đơn vị hành chính TP. Đà Nẵng',
    effectiveYear: '2024 - 2025',
    note: 'Sắp xếp, điều chỉnh địa giới Phường Hòa Minh vào Phường Hòa Khánh, Đà Nẵng'
  },
  {
    id: 'merger-dn-02',
    city: 'Đà Nẵng',
    district: 'Quận Liên Chiểu',
    oldWard: 'Phường Hòa Khánh Bắc',
    newWard: 'Phường Hòa Khánh',
    newDistrict: '',
    newCity: 'Đà Nẵng',
    sampleStreets: ['Âu Cơ', 'Lạc Long Quân', 'Nguyễn Lương Bằng'],
    resolution: 'Nghị quyết UBTVQH về sắp xếp ĐVHC TP. Đà Nẵng'
  },
  {
    id: 'merger-dn-03',
    city: 'Đà Nẵng',
    district: 'Quận Liên Chiểu',
    oldWard: 'Phường Hòa Khánh Nam',
    newWard: 'Phường Hòa Khánh',
    newDistrict: '',
    newCity: 'Đà Nẵng',
    sampleStreets: ['Phạm Như Xương', 'Đồng Kè', 'Nam Cao'],
    resolution: 'Nghị quyết UBTVQH về sắp xếp ĐVHC TP. Đà Nẵng'
  },
  {
    id: 'merger-dn-04',
    city: 'Đà Nẵng',
    district: 'Quận Hải Châu',
    oldWard: 'Phường Hải Châu 1',
    newWard: 'Phường Hải Châu',
    newDistrict: 'Quận Hải Châu',
    newCity: 'Đà Nẵng',
    resolution: 'Sáp nhập Phường Hải Châu 1 và Phường Hải Châu 2 thành Phường Hải Châu mới'
  },
  {
    id: 'merger-dn-05',
    city: 'Đà Nẵng',
    district: 'Quận Hải Châu',
    oldWard: 'Phường Hải Châu 2',
    newWard: 'Phường Hải Châu',
    newDistrict: 'Quận Hải Châu',
    newCity: 'Đà Nẵng',
    resolution: 'Sáp nhập Phường Hải Châu 1 và Phường Hải Châu 2 thành Phường Hải Châu mới'
  },
  {
    id: 'merger-dn-06',
    city: 'Đà Nẵng',
    district: 'Quận Thanh Khê',
    oldWard: 'Phường Tam Thuận',
    newWard: 'Phường Xuân Hà - Tam Thuận',
    newDistrict: 'Quận Thanh Khê',
    newCity: 'Đà Nẵng',
    resolution: 'Sáp nhập Phường Tam Thuận và Phường Xuân Hà, Quận Thanh Khê'
  },
  {
    id: 'merger-dn-07',
    city: 'Đà Nẵng',
    district: 'Quận Hải Châu',
    oldWard: 'Phường Bình Thuận',
    newWard: 'Phường Bình Thuận - Hòa Thuận',
    newDistrict: 'Quận Hải Châu',
    newCity: 'Đà Nẵng',
    resolution: 'Sáp nhập Phường Bình Thuận và Hòa Thuận Đông'
  },

  // 2. TP. HỒ CHÍ MINH
  {
    id: 'merger-hcm-01',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    oldWard: 'Phường 10',
    newWard: 'Phường 9',
    newDistrict: 'Quận 3',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 10 vào Phường 9, Quận 3'
  },
  {
    id: 'merger-hcm-02',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 4',
    oldWard: 'Phường 1',
    newWard: 'Phường 2',
    newDistrict: 'Quận 4',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 1 vào Phường 2, Quận 4'
  },
  {
    id: 'merger-hcm-03',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 4',
    oldWard: 'Phường 6',
    newWard: 'Phường 9',
    newDistrict: 'Quận 4',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 6 vào Phường 9, Quận 4'
  },
  {
    id: 'merger-hcm-04',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    oldWard: 'Phường 3',
    newWard: 'Phường 2',
    newDistrict: 'Quận 5',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 3 vào Phường 2, Quận 5'
  },
  {
    id: 'merger-hcm-05',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    oldWard: 'Phường 6',
    newWard: 'Phường 5',
    newDistrict: 'Quận 5',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 6 vào Phường 5, Quận 5'
  },
  {
    id: 'merger-hcm-06',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 10',
    oldWard: 'Phường 5',
    newWard: 'Phường 4',
    newDistrict: 'Quận 10',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 5 vào Phường 4, Quận 10'
  },
  {
    id: 'merger-hcm-07',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    oldWard: 'Phường 3',
    newWard: 'Phường 1',
    newDistrict: 'Quận Bình Thạnh',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 3 vào Phường 1, Quận Bình Thạnh'
  },
  {
    id: 'merger-hcm-08',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Phú Nhuận',
    oldWard: 'Phường 17',
    newWard: 'Phường 15',
    newDistrict: 'Quận Phú Nhuận',
    newCity: 'TP. Hồ Chí Minh',
    resolution: 'Sáp nhập Phường 17 vào Phường 15, Quận Phú Nhuận'
  },

  // 3. HÀ NỘI
  {
    id: 'merger-hn-01',
    city: 'Hà Nội',
    district: 'Quận Đống Đa',
    oldWard: 'Phường Trung Phụng',
    newWard: 'Phường Khâm Thiên',
    newDistrict: 'Quận Đống Đa',
    newCity: 'Hà Nội',
    resolution: 'Sáp nhập Phường Trung Phụng vào Phường Khâm Thiên, Quận Đống Đa'
  },
  {
    id: 'merger-hn-02',
    city: 'Hà Nội',
    district: 'Quận Ba Đình',
    oldWard: 'Phường Nguyễn Trung Trực',
    newWard: 'Phường Trúc Bạch',
    newDistrict: 'Quận Ba Đình',
    newCity: 'Hà Nội',
    resolution: 'Sáp nhập Phường Nguyễn Trung Trực vào Phường Trúc Bạch, Quận Ba Đình'
  },
  {
    id: 'merger-hn-03',
    city: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    oldWard: 'Phường Hàng Bạc',
    newWard: 'Phường Hàng Đào',
    newDistrict: 'Quận Hoàn Kiếm',
    newCity: 'Hà Nội',
    resolution: 'Sáp nhập Phường Hàng Bạc vào Phường Hàng Đào, Quận Hoàn Kiếm'
  },
  {
    id: 'merger-hn-04',
    city: 'Hà Nội',
    district: 'Quận Hai Bà Trưng',
    oldWard: 'Phường Đống Mác',
    newWard: 'Phường Bạch Đằng',
    newDistrict: 'Quận Hai Bà Trưng',
    newCity: 'Hà Nội',
    resolution: 'Sáp nhập Phường Đống Mác vào Phường Bạch Đằng, Quận Hai Bà Trưng'
  },

  // 4. HẢI PHÒNG
  {
    id: 'merger-hp-01',
    city: 'Hải Phòng',
    district: 'Huyện Thủy Nguyên',
    oldWard: 'Thị trấn Núi Đèo',
    newWard: 'Phường Thủy Nguyên',
    newDistrict: 'TP. Thủy Nguyên',
    newCity: 'Hải Phòng',
    resolution: 'Thành lập Thành phố Thủy Nguyên trực thuộc TP. Hải Phòng'
  },
  {
    id: 'merger-hp-02',
    city: 'Hải Phòng',
    district: 'Huyện An Dương',
    oldWard: 'Thị trấn An Dương',
    newWard: 'Phường An Dương',
    newDistrict: 'Quận An Dương',
    newCity: 'Hải Phòng',
    resolution: 'Thành lập Quận An Dương trực thuộc TP. Hải Phòng'
  }
];

// Helper tra cứu sáp nhập đơn vị hành chính và sinh gợi ý địa chỉ mới
export function findAdministrativeMerger({ city, district, ward, street }) {
  if (!city && !ward) return null;
  const cleanCity = (city || '').toLowerCase().trim();
  const cleanDistrict = (district || '').toLowerCase().trim();
  const cleanWard = (ward || '').toLowerCase().trim();

  // Tìm kiếm quy tắc sáp nhập phù hợp nhất
  const match = VIETNAM_ADMINISTRATIVE_MERGERS.find(m => {
    // 1. So khớp Tỉnh/Thành
    const matchCity = !cleanCity || 
      m.city.toLowerCase() === cleanCity || 
      cleanCity.includes(m.city.toLowerCase()) || 
      m.city.toLowerCase().includes(cleanCity);
    if (!matchCity) return false;

    // 2. So khớp Phường/Xã cũ (chính xác hoặc tương đối)
    if (m.oldWard && cleanWard) {
      const cleanOldW = m.oldWard.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
      const cleanW = cleanWard.replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
      if (cleanOldW === cleanW || cleanWard.includes(cleanOldW)) {
        return true;
      }
    }

    // 3. Nếu người dùng chọn Tỉnh/Thành & Quận/Huyện có đường phố mẫu sáp nhập
    if (street && m.sampleStreets && m.sampleStreets.length > 0) {
      const cleanSt = street.toLowerCase().replace(/^(đường|phố)\s+/i, '').trim();
      const matchSt = m.sampleStreets.some(s => s.toLowerCase().includes(cleanSt) || cleanSt.includes(s.toLowerCase()));
      if (matchSt && (!cleanDistrict || m.district.toLowerCase().includes(cleanDistrict))) {
        return true;
      }
    }

    return false;
  });

  if (!match) return null;

  // Xây dựng địa chỉ cũ và địa chỉ mới
  const streetClean = street ? street.replace(/^(đường|phố)\s+/i, '').trim() : '';
  const streetPart = streetClean ? `Đường ${streetClean}` : '';

  const oldParts = [
    streetPart,
    ward || match.oldWard,
    district || match.district,
    city || match.city
  ].filter(Boolean);
  const oldAddress = oldParts.join(', ');

  const newParts = [
    streetPart,
    match.newWard,
    match.newDistrict || '',
    match.newCity || match.city
  ].filter(Boolean);
  const newAddress = newParts.join(', ');

  return {
    ...match,
    hasMerger: true,
    oldAddress,
    newAddress,
    highlightText: match.newWard,
    suggestionLabel: 'Địa chỉ do hệ thống gợi ý'
  };
}
