/**
 * Knowledge Base & SEO News Articles Data
 * Cấu trúc Flat URL chuẩn: /kien-thuc/[slug]
 * Cấu trúc Danh mục cha: /kien-thuc/thi-truong, /kien-thuc/kinh-nghiem, /kien-thuc/phap-ly
 */

export const KNOWLEDGE_CATEGORIES = [
  {
    slug: 'thi-truong',
    name: 'Thông Tin Thị Trường Mua Bán Nhà Đất',
    shortName: 'Thị Trường & Xu Hướng',
    badge: 'THỊ TRƯỜNG & XU HƯỚNG',
    path: '/kien-thuc/thi-truong',
    icon: 'fa-solid fa-chart-line',
    color: 'blue',
    bgBadge: 'bg-blue-50 text-blue-700 border-blue-100',
    description: 'Cập nhật liên tục diễn biến giá mua bán nhà đất, báo cáo nguồn cung, nhu cầu thực tế và xu hướng chuyển dịch của dòng vốn trên thị trường bất động sản toàn quốc.',
    targetAudience: 'Nhận diện & Thu hút khách hàng có tiền, theo dõi biến động thị trường'
  },
  {
    slug: 'kinh-nghiem',
    name: 'Kinh Nghiệm Mua Bán Nhà Đất Và Đầu Tư',
    shortName: 'Đầu Tư & Tối Ưu Vốn',
    badge: 'ĐẦU TƯ & TỐI ƯU VỐN',
    path: '/kien-thuc/kinh-nghiem',
    icon: 'fa-solid fa-lightbulb',
    color: 'amber',
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-100',
    description: 'Chia sẻ cẩm nang tìm kiếm sản phẩm, bí quyết thương lượng giá, quy trình kiểm tra thực địa và chiến lược quản lý rủi ro tối ưu cho dòng tiền đầu tư.',
    targetAudience: 'Sàng lọc khách hàng có nhu cầu thực, chuẩn bị xuống tiền, cần mẹo thực chiến'
  },
  {
    slug: 'phap-ly',
    name: 'Kiến Thức Pháp Lý Cho Thuê Bất Động Sản',
    shortName: 'Pháp Lý & Quy Hoạch',
    badge: 'PHÁP LÝ & QUY HOẠCH',
    path: '/kien-thuc/phap-ly',
    icon: 'fa-solid fa-scale-balanced',
    color: 'red',
    bgBadge: 'bg-red-50 text-red-700 border-red-100',
    description: 'Hướng dẫn quy trình làm sổ đỏ, sổ hồng, tra cứu thông tin quy hoạch, biểu mẫu hợp đồng mua bán và các quy định pháp lý về quản lý cho thuê bất động sản.',
    targetAudience: 'Xây dựng lòng tin tuyệt đối để chốt deal, tháo gỡ vướng mắc pháp lý'
  }
];

export const KNOWLEDGE_ARTICLES = [
  // =========================================================================
  // CỘT 1: THÔNG TIN THỊ TRƯỜNG (Target: Nhà đầu tư theo dõi biến động)
  // =========================================================================
  {
    id: 'art-001',
    slug: 'gia-dat-nen-quan-9-2027',
    categorySlug: 'thi-truong',
    categoryName: 'Thông Tin Thị Trường Mua Bán Nhà Đất',
    title: 'Biến Động Giá Đất Nền Quận 9 Năm 2027: Báo Cáo Phân Tích & Dự Báo Dòng Tiền',
    shortTitle: 'Giá đất nền Quận 9 năm 2027',
    excerpt: 'Phân tích diễn biến mặt bằng giá đất nền tại Quận 9 (TP. Thủ Đức), báo cáo nguồn cung hạ tầng Vành Đai 3, tuyến Metro số 1 và xu hướng đón đầu sóng đầu tư trung hạn.',
    author: 'Chuyên gia BĐS Kênh Nhà Đất 24H',
    authorRole: 'Phòng Nghiên Cứu Thị Trường',
    publishedAt: '2026-11-02',
    readTime: '6 phút đọc',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    tags: ['Đất nền Quận 9', 'Giá đất Thủ Đức', 'Thị trường BĐS', 'Vành Đai 3'],
    tableOfContents: [
      { id: 'tong-quan', title: '1. Tổng quan thị trường đất nền Quận 9' },
      { id: 'bang-gia', title: '2. Bảng khảo sát giá đất nền theo từng phường' },
      { id: 'dong-luc-ha-tang', title: '3. Đòn bẩy hạ tầng thúc đẩy thanh khoản' },
      { id: 'loi-khuyen-nha-dau-tu', title: '4. Khuyến nghị dòng tiền cho nhà đầu tư' }
    ],
    content: `
### 1. Tổng quan thị trường đất nền Quận 9

Khu vực Quận 9 (nay thuộc TP. Thủ Đức, TP. Hồ Chí Minh) tiếp tục là tâm điểm thu hút dòng vốn của các nhà đầu tư cá nhân và tổ chức. Với lợi thế quỹ đất còn tương đối rộng, tiếp giáp sông Đồng Nai và các đại dự án khu công nghệ cao, phân khúc đất nền thổ cư tại đây đang ghi nhận tốc độ phục hồi giao dịch ấn tượng.

Nhà đầu tư hiện nay có xu hướng sàng lọc khắt khe hơn: ưu tiên các lô đất đã có **sổ đỏ riêng từng nền**, hạ tầng đường nội bộ hoàn chỉnh từ 8m trở lên và không vướng quy hoạch hành lang an toàn công trình.

### 2. Bảng khảo sát giá đất nền theo từng phường

Dưới đây là mặt bằng giá khảo sát thực tế tại các tuyến đường trọng điểm:

| Phường | Loại hình đất | Mặt bằng giá trung bình | Thanh khoản |
| :--- | :--- | :--- | :--- |
| **Long Phước** | Đất nền phân lô sổ đỏ | 32 - 45 triệu/m² | Ổn định, đầu tư dài hạn |
| **Long Thạnh Mỹ** | Đất gần Vinhomes Grand Park | 55 - 75 triệu/m² | Tích cực, nhu cầu ở thực cao |
| **Phước Long B** | Đất nền khu dân cư hiện hữu | 70 - 95 triệu/m² | Rất cao, khan hiếm nguồn cung |
| **Trường Thạnh** | Đất trục đường Nguyễn Duy Trinh | 42 - 58 triệu/m² | Tăng trưởng đều theo hạ tầng |

### 3. Đòn bẩy hạ tầng thúc đẩy thanh khoản

Có 3 xung lực hạ tầng trọng yếu định hình bức tranh giá đất nền Quận 9:
- **Tuyến Vành Đai 3 TP.HCM:** Đang đẩy nhanh tiến độ thi công toàn tuyến, kết nối trực tiếp Nhơn Trạch (Đồng Nai) và Bình Dương qua Quận 9, rút ngắn thời gian di chuyển liên vùng.
- **Mở rộng đường Nguyễn Duy Trinh & Đỗ Xuân Hợp:** Giảm áp lực ùn tắc container ra vào cảng Phú Hữu, khơi thông giao thương cho các khu dân cư lân cận.
- **Khu Công Nghệ Cao 2:** Thu hút hàng chục ngàn chuyên gia, kỹ sư và quản lý cấp cao sinh sống, tạo lực cầu cho thuê nhà ở và kinh doanh dịch vụ phụ trợ.

### 4. Khuyến nghị dòng tiền cho nhà đầu tư

1. **Tuyệt đối ưu tiên pháp lý:** Chỉ giao dịch các sản phẩm có sổ đỏ trao tay, kiểm tra kỹ bản đồ quy hoạch 1/2000 tại Phòng Tài nguyên & Môi trường TP. Thủ Đức trước khi đặt cọc.
2. **Quản trị đòn bẩy tài chính:** Trong bối cảnh lãi suất vay mua nhà đất có thể điều chỉnh theo chu kỳ, tỷ lệ vốn tự có nên duy trì ở mức tối thiểu 60% giá trị tài sản.
3. **Chiến lược giữ hàng:** Thời gian nắm giữ tối ưu cho đất nền Quận 9 là từ 2 - 4 năm để đón trọn nhịp thông xe toàn diện các nút giao Vành Đai 3.
    `
  },
  {
    id: 'art-002',
    slug: 'khao-sat-gia-can-ho-binh-thanh',
    categorySlug: 'thi-truong',
    categoryName: 'Thông Tin Thị Trường Mua Bán Nhà Đất',
    title: 'Khảo Sát Giá Căn Hộ Chung Cư Bình Thạnh Mới Nhất: Cung Cầu & Tỷ Suất Cho Thuê',
    shortTitle: 'Khảo sát giá căn hộ Bình Thạnh',
    excerpt: 'Báo cáo chi tiết biểu giá mua bán và cho thuê căn hộ chung cư Bình Thạnh, phân tích tỷ suất sinh lời dòng tiền từ 5% - 7%/năm tại các trục Điện Biên Phủ, Nguyễn Hữu Cảnh.',
    author: 'Chuyên gia BĐS Kênh Nhà Đất 24H',
    authorRole: 'Phòng Phân Tích Dữ Liệu',
    publishedAt: '2026-11-01',
    readTime: '5 phút đọc',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    tags: ['Căn hộ Bình Thạnh', 'Chung cư TP.HCM', 'Giá thuê căn hộ', 'Đầu tư dòng tiền'],
    tableOfContents: [
      { id: 'vi-the-binh-thanh', title: '1. Vị thế cửa ngõ và nhu cầu ở thực tại Bình Thạnh' },
      { id: 'bang-gia-chung-cu', title: '2. Biểu giá mua bán & cho thuê căn hộ cập nhật' },
      { id: 'ty-suat-sinh-loi', title: '3. Phân tích tỷ suất sinh lời dòng tiền cho thuê' },
      { id: 'tieu-chi-chon-mua', title: '4. Tiêu chí chọn căn hộ Bình Thạnh giữ giá tốt' }
    ],
    content: `
### 1. Vị thế cửa ngõ và nhu cầu ở thực tại Bình Thạnh

Quận Bình Thạnh luôn giữ vị trí độc tôn trong mắt người mua nhà và giới đầu tư cho thuê nhờ vị trí tiếp giáp trực tiếp Quận 1, Quận 2 (Khu đô thị Thủ Thiêm) và Phú Nhuận. Thời gian di chuyển đến trung tâm tài chính Bến Nghé chỉ từ 5 - 10 phút.

Nhờ mạng lưới trường đại học danh tiếng (HUTECH, Ngoại Thương, Giao Thông Vận Tải, Hồng Bàng) cùng hệ thống cao ốc văn phòng dọc trục Ung Văn Khiêm, Nguyễn Gia Trí, lực cầu thuê căn hộ chung cư tại đây luôn đạt tỷ lệ lấp đầy trên 92% quanh năm.

### 2. Biểu giá mua bán & cho thuê căn hộ cập nhật

| Phân khúc dự án | Mức giá bán trung bình | Giá cho thuê (2PN Full NT) | Tỷ suất lợi nhuận |
| :--- | :--- | :--- | :--- |
| **Căn hộ cao cấp** (Vinhomes Central Park, Sunwah Pearl) | 90 - 135 triệu/m² | 22 - 38 triệu/tháng | 5.2% - 6.0%/năm |
| **Căn hộ trung cao** (Saigon Pearl, Richmond City) | 58 - 85 triệu/m² | 15 - 22 triệu/tháng | 5.8% - 6.5%/năm |
| **Chung cư đã bàn giao 5-10 năm** (Thế Kỷ 21, Miếu Nổi) | 38 - 52 triệu/m² | 10 - 14 triệu/tháng | 6.2% - 7.1%/năm |

### 3. Phân tích tỷ suất sinh lời dòng tiền cho thuê

Đối với các nhà đầu tư tìm kiếm kênh trú ẩn dòng tiền an toàn kết hợp thu lãi đều đặn mỗi tháng, căn hộ 1PN và 2PN tại Bình Thạnh mang lại hiệu quả vượt trội so với gửi tiết kiệm ngân hàng.

Ngoài dòng tiền cho thuê định kỳ 6%/năm, giá trị tài sản căn hộ tại khu vực lõi Bình Thạnh vẫn ghi nhận mức tăng vốn tự nhiên trung bình từ 7% - 9%/năm nhờ sự khan hiếm dự án mới được cấp phép xây dựng.

### 4. Tiêu chí chọn căn hộ Bình Thạnh giữ giá tốt

- **Phí quản lý & ban quản trị:** Ưu tiên các tòa nhà được vận hành bởi các đơn vị chuyên nghiệp (CBRE, Savills hoặc ban quản trị cư dân có trách nhiệm).
- **Chỗ đỗ ô tô:** Kiểm tra kỹ số lượng slot để xe ô tô trong tầng hầm, vì đây là yếu tố quyết định tính thanh khoản khi cần bán lại.
- **Tình trạng pháp lý:** Ưu tiên các dự án đã ra sổ hồng từng căn để được ngân hàng hỗ trợ giải ngân vay đến 70% giá trị thẩm định.
    `
  },

  // =========================================================================
  // CỘT 2: KINH NGHIỆM ĐẦU TƯ (Target: Khách chuẩn bị xuống tiền, cần mẹo)
  // =========================================================================
  {
    id: 'art-003',
    slug: 'kinh-nghiem-mua-nha-mat-pho-kinh-doanh',
    categorySlug: 'kinh-nghiem',
    categoryName: 'Kinh Nghiệm Mua Bán Nhà Đất Và Đầu Tư',
    seoTitle: 'Kinh Nghiệm Mua Nhà Mặt Phố Kinh Doanh: 7 Điều Cần Kiểm Tra',
    seoDescription: 'Tìm hiểu 7 kinh nghiệm mua nhà mặt phố kinh doanh: khảo sát vị trí, lưu lượng khách, kiểm tra quy hoạch, pháp lý và cách tính hiệu quả cho thuê trước khi đặt cọc.',
    title: 'Kinh Nghiệm Mua Nhà Mặt Phố Kinh Doanh: 7 Tiêu Chí Cần Kiểm Tra Trước Khi Đặt Cọc',
    shortTitle: 'Kinh nghiệm mua nhà mặt phố kinh doanh',
    excerpt: 'Tìm hiểu 7 kinh nghiệm mua nhà mặt phố kinh doanh: khảo sát vị trí, lưu lượng khách, kiểm tra quy hoạch, pháp lý và cách tính hiệu quả cho thuê trước khi đặt cọc.',
    author: 'Chuyên gia Môi Giới Cấp Cao',
    authorRole: 'Cố Vấn Đầu Tư BĐS Dòng Tiền',
    publishedAt: '2026-10-28',
    readTime: '7 phút đọc',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nhà mặt phố', 'Kinh doanh', 'Kinh nghiệm mua nhà', 'Thẩm định giá'],
    tableOfContents: [
      { id: 'dac-thu-nha-pho', title: '1. Đặc thù và giá trị kép của nhà mặt phố' },
      { id: '7-tieu-chi-vang', title: '2. 7 tiêu chí vàng khảo sát trước khi xuống cọc' },
      { id: 'dinh-gia-thuc-te', title: '3. Cách định giá nhà mặt phố chuẩn không bị hớ' },
      { id: 'hop-dong-dat-coc', title: '4. Những điều khoản then chốt trong hợp đồng đặt cọc' }
    ],
    content: `
### 1. Đặc thù và giá trị kép của nhà mặt phố

Nhà mặt phố luôn được mệnh danh là "gà đẻ trứng vàng" trong giới bất động sản. Khác với nhà trong hẻm hay đất nền thuần túy, nhà mặt phố mang lại **giá trị kép**: vừa có giá trị tự gia tăng theo thời gian, vừa tạo ra dòng tiền cho thuê kinh doanh hoặc tự mở cửa hàng, trụ sở công ty.

Tuy nhiên, số tiền bỏ ra cho mỗi căn nhà phố thường từ vài tỷ đến vài chục tỷ đồng. Một quyết định sai lầm về vị trí hay quy hoạch lộ giới có thể chôn vùi toàn bộ số vốn tích lũy của nhà đầu tư.

### 2. 7 tiêu chí vàng khảo sát trước khi xuống cọc

1. **Chiều rộng mặt tiền tối thiểu 4m:** Mặt tiền dưới 3.5m sẽ gây khó khăn lớn cho việc nhận diện bảng hiệu thương hiệu và bố trí cửa hàng trưng bày.
2. **Khảo sát lưu lượng người qua lại ở 3 khung giờ:** 
   - Giờ cao điểm sáng (7h30 - 8h30)
   - Giờ trưa (11h30 - 13h00)
   - Giờ tan tầm tối (17h30 - 19h00)
   Cần phân biệt giữa đường *lưu thông nhanh* (xe chạy ào ào không dừng lại được) và đường *mua sắm sầm uất* (xe chạy chậm, vỉa hè rộng cho khách dừng xe).
3. **Độ rộng vỉa hè và chính sách để xe:** Vỉa hè rộng tối thiểu 2.5m - 3m có kẻ vạch để xe máy là lợi thế cạnh tranh sống còn cho các đơn vị thuê F&B hoặc thời trang.
4. **Không bị vướng cột điện, hố ga, cây xanh chắn ngang cửa:** Những yếu tố phong thủy và cản trở này thường làm giảm giá trị cho thuê từ 15% - 25%.
5. **Kiểm tra lộ giới mở đường và quy hoạch mở rộng:** Nhiều căn nhà giá rẻ bất thường do phần lớn diện tích tầng trệt nằm trọn trong lộ giới quy hoạch thu hồi đất.
6. **Kết cấu chịu lực và hoàn công xây dựng:** Sổ hồng phải hoàn công đúng số tầng thực tế để thuận tiện cho việc cải tạo, lắp thang máy hoặc mở rộng thang thoát hiểm.
7. **Lịch sử kinh doanh của khách thuê trước:** Nếu một mặt bằng liên tục thay đổi khách thuê sau 3 - 6 tháng, đó là dấu hiệu cảnh báo mặt bằng "kém duyên" hoặc giá thuê bị chủ nhà hét quá cao so với doanh thu.

### 3. Cách định giá nhà mặt phố chuẩn không bị hớ

Công thức tham khảo nhanh:
$$\\text{Giá trị BĐS} = \\text{Giá trị đất} + \\text{Giá trị xây dựng còn lại}$$
Trong đó, giá trị đất mặt phố cần được đối chiếu chéo qua 3 nguồn:
- Giá các căn lân cận đã giao dịch thành công trong 6 tháng gần nhất.
- Khả năng sinh dòng tiền: Tổng giá trị BĐS không nên vượt quá **250 - 300 lần giá thuê thực tế hàng tháng**.
- Thẩm định độc lập từ 2 ngân hàng thương mại uy tín.
    `
  },
  {
    id: 'art-004',
    slug: 'bi-quyet-thuong-luong-gia-dat-nen',
    categorySlug: 'kinh-nghiem',
    categoryName: 'Kinh Nghiệm Mua Bán Nhà Đất Và Đầu Tư',
    title: 'Bí Quyết Thương Lượng Giá Đất Nền Thực Chiến: Tiết Kiệm Hàng Trăm Triệu Cho Nhà Đầu Tư',
    shortTitle: 'Bí quyết thương lượng giá đất nền',
    excerpt: 'Nắm bắt tâm lý chủ nhà kẹt tiền, kỹ thuật tìm lỗi mềm để ép giá hợp lý và quy tắc đàm phán 3 bước giúp bạn mua được đất nền dưới giá thị trường từ 5% - 15%.',
    author: 'Chuyên gia Đàm Phán BĐS',
    authorRole: 'Chuyên Viên Tư Vấn Cấp Cao',
    publishedAt: '2026-10-25',
    readTime: '6 phút đọc',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    tags: ['Đàm phán BĐS', 'Thương lượng giá', 'Mẹo mua đất', 'Đầu tư thực chiến'],
    tableOfContents: [
      { id: 'tam-ly-chu-dat', title: '1. Thấu hiểu tâm lý và động cơ bán của chủ đất' },
      { id: 'chuan-bi-thong-tin', title: '2. Chuẩn bị thông tin đối ứng trước khi ngồi vào bàn' },
      { id: 'ky-thuat-thuong-luong', title: '3. 4 kỹ thuật ép giá mềm văn minh và hiệu quả' },
      { id: 'chot-deal-nhanh', title: '4. Nghệ thuật đặt tiền cọc để khóa cứng mức giá hời' }
    ],
    content: `
### 1. Thấu hiểu tâm lý và động cơ bán của chủ đất

Trong mọi cuộc đàm phán bất động sản, người nắm giữ nhiều thông tin hơn về đối phương là người chiếm thế thượng phong. Trước khi bàn về giá cả, hãy tìm hiểu lý do thực sự vì sao chủ nhà muốn bán:
- Bán vì kẹt tiền đáo hạn ngân hàng?
- Bán để chia tài sản thừa kế?
- Bán để chuyển chỗ ở hoặc mua căn nhà to hơn?
- Hay chỉ là "đăng bán thử giá cao xem có ai mua không"?

Nếu chủ đất đang đối mặt với áp lực tài chính cận kề ngày đáo hạn nợ, biên độ thương lượng của bạn có thể lên đến **10% - 15%** giá chào bán ban đầu.

### 2. Chuẩn bị thông tin đối ứng trước khi ngồi vào bàn

- **Danh sách 3 mảnh đất tương đương trong bán kính 500m:** Mang theo bảng so sánh giá thực tế của các lô bên cạnh để chủ đất thấy mức giá họ đưa ra đang cao hơn mặt bằng chung.
- **Chứng minh năng lực tài chính sẵn sàng:** Chuẩn bị sẵn tiền cọc trong tài khoản và cam kết thanh toán công chứng nhanh trong vòng 7 - 10 ngày. Tính thanh khoản tức thì này là "vũ khí" cực kỳ hấp dẫn đối với các chủ nhà cần tiền gấp.

### 3. 4 kỹ thuật ép giá mềm văn minh và hiệu quả

1. **Kỹ thuật "Tìm lỗi mềm để bớt tiền":** Không chê bai thô thiển làm phật lòng chủ nhà, mà lịch sự chỉ ra các chi phí phát sinh sau khi mua: chi phí san lấp mặt bằng, chi phí kéo điện nước, tiền đóng thuế chuyển mục đích sử dụng đất... để đề xuất khấu trừ vào giá bán.
2. **Kỹ thuật "Chia nhỏ mức chênh lệch":** Khi chủ đất đòi 2 tỷ 500 triệu còn bạn trả 2 tỷ 350 triệu (chênh 150 triệu), hãy đề xuất hai bên chia đôi mức chênh lệch tại 2 tỷ 425 triệu để cuộc đàm phán kết thúc trong thế đôi bên cùng thắng (Win-Win).
3. **Kỹ thuật "Điểm dừng dứt khoát":** Đưa ra mức giá cuối cùng kèm lời cảm ơn chân thành. Hãy để lại số điện thoại và thông báo bạn sẵn sàng ký cọc trong 24h nếu chủ nhà đồng ý. Khoảng 40% người bán sau khi suy nghĩ qua đêm sẽ chủ động gọi lại chấp nhận giá của bạn.
    `
  },

  // =========================================================================
  // CỘT 3: PHÁP LÝ & QUY HOẠCH (Target: Khách hàng cần chuyên gia gỡ rối)
  // =========================================================================
  {
    id: 'art-005',
    slug: 'thu-tuc-sang-ten-so-hong-can-ho',
    categorySlug: 'phap-ly',
    categoryName: 'Kiến Thức Pháp Lý Cho Thuê Bất Động Sản',
    title: 'Quy Trình & Thủ Tục Sang Tên Sổ Hồng Căn Hộ Chuẩn Nhất: Hồ Sơ, Thuế Phí & Thời Gian Cấp Sổ',
    shortTitle: 'Thủ tục sang tên sổ hồng căn hộ',
    excerpt: 'Hướng dẫn từng bước thủ tục sang tên sổ hồng căn hộ chung cư: các loại giấy tờ bắt buộc, biểu mẫu hợp đồng mua bán công chứng, mức thuế TNCN 2% và lệ phí trước bạ 0.5%.',
    author: 'Luật Sư Chuyên Ngành BĐS',
    authorRole: 'Cố Vấn Pháp Lý Doanh Nghiệp',
    publishedAt: '2026-10-20',
    readTime: '8 phút đọc',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Sổ hồng căn hộ', 'Thủ tục sang tên', 'Thuế phí nhà đất', 'Công chứng mua bán'],
    tableOfContents: [
      { id: 'ho-so-can-chuan-bi', title: '1. Bộ hồ sơ bắt buộc của bên bán và bên mua' },
      { id: 'cac-buoc-thuc-hien', title: '2. 4 bước thực hiện sang tên sổ hồng' },
      { id: 'thue-phi-nghia-vu', title: '3. Các khoản thuế và lệ phí phải nộp' },
      { id: 'nhung-luu-y-quan-trong', title: '4. Những rủi ro cần phòng tránh khi sang tên' }
    ],
    content: `
### 1. Bộ hồ sơ bắt buộc của bên bán và bên mua

Để quá trình công chứng và đăng bộ diễn ra thuận lợi trong 1 buổi làm việc, hai bên cần chuẩn bị đầy đủ các giấy tờ gốc sau:

#### Bên chuyển nhượng (Bên bán):
- Bản chính Giấy chứng nhận quyền sở hữu nhà ở (Sổ hồng căn hộ).
- Căn cước công dân gắn chip của vợ và chồng (nếu tài sản chung).
- Giấy chứng nhận đăng ký kết hôn (hoặc Giấy xác nhận tình trạng hôn nhân nếu còn độc thân).
- Giấy xác nhận của Ban Quản Trị / Chủ đầu tư về việc căn hộ không còn nợ phí bảo trì, phí dịch vụ.

#### Bên nhận chuyển nhượng (Bên mua):
- Căn cước công dân gắn chip của người đứng tên.
- Giấy tờ chứng minh nơi thường trú / tình trạng hôn nhân.

### 2. 4 bước thực hiện sang tên sổ hồng

- **Bước 1: Ký kết hợp đồng chuyển nhượng tại Văn phòng Công chứng:** Công chứng viên sẽ tra cứu dữ liệu ngăn chặn giao dịch trên hệ thống UCHI toàn quốc trước khi lăn tay ký tên.
- **Bước 2: Nộp hồ sơ kê khai nghĩa vụ tài chính:** Nộp tại Chi nhánh Văn phòng Đăng ký đất đai hoặc Bộ phận Một cửa cấp Quận/Huyện.
- **Bước 3: Nộp thuế thu nhập cá nhân & lệ phí trước bạ:** Thực hiện nộp thuế qua cổng Dịch vụ công Quốc gia hoặc tại Kho bạc Nhà nước theo thông báo nộp tiền.
- **Bước 4: Nhận kết quả Sổ hồng đã cập nhật biến động:** Thời gian xử lý thông thường từ **10 - 15 ngày làm việc**.

### 3. Các khoản thuế và lệ phí phải nộp

| Khoản phí / Thuế | Tỷ lệ quy định | Bên có nghĩa vụ nộp thông thường |
| :--- | :--- | :--- |
| **Thuế Thu Nhập Cá Nhân (TNCN)** | **2%** trên giá trị chuyển nhượng hợp đồng | Bên bán (trừ trường hợp thỏa thuận bên mua nộp thay) |
| **Lệ phí trước bạ** | **0.5%** trên giá trị chuyển nhượng | Bên mua |
| **Phí thẩm định hồ sơ** | 500.000đ - 1.500.000đ tùy địa phương | Người nộp hồ sơ |
| **Lệ phí cấp đổi / cấp phôi sổ mới** | 100.000đ - 200.000đ | Người nộp hồ sơ |
    `
  },
  {
    id: 'art-006',
    slug: 'cach-tra-cuu-quy-hoach-dat-dai',
    categorySlug: 'phap-ly',
    categoryName: 'Kiến Thức Pháp Lý Cho Thuê Bất Động Sản',
    title: 'Cách Tra Cứu Thông Tin Quy Hoạch Đất Đai Trực Tuyến Chuẩn Xác 100% Tránh Bẫy Đất Treo',
    shortTitle: 'Cách tra cứu quy hoạch đất đai',
    excerpt: 'Tổng hợp các ứng dụng tra cứu quy hoạch đất đai chính thống của TP.HCM, Hà Nội, Đà Nẵng, Bình Dương và kinh nghiệm đọc ký hiệu màu sắc trên bản đồ quy hoạch xây dựng.',
    author: 'Chuyên Viên Địa Chính & Quy Hoạch',
    authorRole: 'Tư Vấn Thẩm Định Pháp Lý',
    publishedAt: '2026-10-15',
    readTime: '7 phút đọc',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tra cứu quy hoạch', 'Bản đồ địa chính', 'Đất dính quy hoạch', 'Quy hoạch xây dựng'],
    tableOfContents: [
      { id: 'tai-sao-can-tra-cuu', title: '1. Tại sao bắt buộc phải tra cứu quy hoạch trước khi mua?' },
      { id: 'cac-cong-cu-truc-tuyen', title: '2. Các ứng dụng tra cứu quy hoạch chính thức theo tỉnh thành' },
      { id: 'cach-doc-ban-do', title: '3. Cách đọc màu sắc và ký hiệu trên bản đồ quy hoạch' },
      { id: 'kiem-tra-chuyen-sau', title: '4. Khi nào cần xin Chứng chỉ quy hoạch tại cơ quan Nhà nước?' }
    ],
    content: `
### 1. Tại sao bắt buộc phải tra cứu quy hoạch trước khi mua?

Trong giao dịch bất động sản, việc mua phải lô đất dính quy hoạch đường giao thông, quy hoạch cây xanh hoặc công trình công cộng là một trong những rủi ro đau đớn nhất. Nhiều trường hợp mua xong không thể xin phép xây dựng, không thể vay thế chấp ngân hàng và khi Nhà nước thu hồi chỉ được bồi thường theo đơn giá nhà nước rất thấp.

Do đó, tra cứu quy hoạch là bước thẩm định tiên quyết trước khi ký bất kỳ biên bản đặt cọc nào.

### 2. Các ứng dụng tra cứu quy hoạch chính thức theo tỉnh thành

Hiện nay, các địa phương lớn đã số hóa dữ liệu quy hoạch phục vụ người dân tra cứu hoàn toàn miễn phí:
- **TP. Hồ Chí Minh:** Ứng dụng *Thông tin Quy hoạch TP.HCM* (Sở Quy hoạch - Kiến trúc TP.HCM) trên nền tảng Web và App di động.
- **Hà Nội:** Cổng thông tin quy hoạch xây dựng Hà Nội (*quyhoach.hanoi.vn*).
- **Đà Nẵng:** Cổng dữ liệu đất đai và quy hoạch kiến trúc Đà Nẵng (*ttqh.danang.gov.vn*).
- **Bình Dương:** Ứng dụng *Quy hoạch Bình Dương*.

### 3. Cách đọc màu sắc và ký hiệu trên bản đồ quy hoạch

- **Màu hồng / cam (ONT, ODT):** Đất ở nông thôn hoặc đất ở đô thị $\rightarrow$ Loại đất an toàn nhất để an cư và xây dựng nhà ở lâu dài.
- **Màu vàng (CLN, HNK, LUC):** Đất nông nghiệp, đất trồng cây lâu năm, đất lúa $\rightarrow$ Cần kiểm tra xem có được quy hoạch chuyển đổi lên đất ở (thổ cư) hay không.
- **Màu xanh lá cây (CX, DKV):** Đất cây xanh, công viên công cộng $\rightarrow$ **Cảnh báo nguy cơ không được phép xây dựng kiên cố**.
- **Ký hiệu DGT kèm đường nét đứt màu đỏ:** Tuyến đường giao thông dự kiến mở rộng trong tương lai $\rightarrow$ Toàn bộ diện tích nằm trong hành lang này sẽ bị thu hồi giải tỏa khi làm đường.

### 4. Khi nào cần xin Chứng chỉ quy hoạch tại cơ quan Nhà nước?

Với những lô đất có giá trị lớn hoặc nằm ở khu vực ranh giới giáp ranh giữa các phân khu, các app tra cứu trực tuyến chỉ mang tính chất tham khảo. Bạn nên cùng chủ đất nộp đơn đề nghị cung cấp thông tin quy hoạch tại **Văn phòng Đăng ký đất đai quận/huyện** để nhận văn bản trả lời chính thức có mộc đỏ trước khi chuyển đủ tiền thanh toán.
    `
  }
];

/**
 * Helper tìm kiếm bài viết theo slug
 */
export function getArticleBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  return KNOWLEDGE_ARTICLES.find(art => art.slug === cleanSlug) || null;
}

/**
 * Helper tìm kiếm danh mục theo slug
 */
export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  return KNOWLEDGE_CATEGORIES.find(cat => cat.slug === cleanSlug) || null;
}

/**
 * Helper lấy danh sách bài viết theo danh mục
 */
export function getArticlesByCategory(categorySlug) {
  if (!categorySlug) return KNOWLEDGE_ARTICLES;
  return KNOWLEDGE_ARTICLES.filter(art => art.categorySlug === categorySlug);
}
