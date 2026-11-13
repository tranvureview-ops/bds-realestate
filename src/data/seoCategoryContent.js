/**
 * Cấu hình nội dung SEO & dữ liệu thị trường đồng bộ theo Danh mục (PropertyType) + Địa phương (City)
 * Dùng chung cho:
 *  - SaleListingsSeoContent.jsx (Trang Mua Bán)
 *  - RentListingsSeoContent.jsx (Trang Cho Thuê)
 *  - src/app/[slug]/page.jsx (FAQPage JSON-LD đồng bộ 100% với nội dung hiển thị)
 */

import { VIETNAM_ADMINISTRATIVE_DATA } from './vietnamAdministrativeData.js';
import { buildSeoUrl, formatPriceRangeText, formatAreaRangeText } from '../utils/permalink.js';

const ALL_TYPES = new Set(['', 'all', 'null', 'undefined']);

const normalizeType = (propertyType) => {
  if (!propertyType) return 'all';
  if (Array.isArray(propertyType)) {
    const valid = propertyType.map(normalizeType).filter(t => t !== 'all');
    return valid.length > 0 ? valid[0] : 'all';
  }
  if (typeof propertyType !== 'string') return 'all';
  const trimmed = propertyType.trim().toLowerCase();
  if (ALL_TYPES.has(trimmed)) return 'all';
  if (trimmed.includes(',')) {
    const first = trimmed.split(',')[0].trim();
    return ALL_TYPES.has(first) ? 'all' : first;
  }
  return trimmed;
};

/**
 * Chuẩn hóa thông tin địa phương đang chọn (Hà Nội, TP.HCM, Đà Nẵng, Quảng Nam hoặc 63 tỉnh thành)
 */
const resolveCityContext = (activeCity) => {
  if (!activeCity || typeof activeCity !== 'string') {
    return { key: 'national', displayName: 'Toàn Quốc', matchedProvince: null };
  }
  const lower = activeCity.toLowerCase();
  if (activeCity.includes('Đà Nẵng') || lower.includes('da nang')) {
    return { key: 'danang', displayName: 'Đà Nẵng', matchedProvince: findProvince(activeCity) };
  }
  if (activeCity.includes('Quảng Nam') || lower.includes('quang nam')) {
    return { key: 'quangnam', displayName: 'Quảng Nam', matchedProvince: findProvince(activeCity) };
  }
  if (activeCity.includes('Hà Nội') || lower.includes('ha noi')) {
    return { key: 'hanoi', displayName: 'Hà Nội', matchedProvince: findProvince(activeCity) };
  }
  if (activeCity.includes('Hồ Chí Minh') || lower.includes('ho chi minh')) {
    return { key: 'hcm', displayName: 'TP. Hồ Chí Minh', matchedProvince: findProvince(activeCity) };
  }
  const matched = findProvince(activeCity);
  return {
    key: 'province',
    displayName: matched?.name || activeCity,
    matchedProvince: matched
  };
};

const findProvince = (cityName) => {
  const lower = cityName.toLowerCase();
  return (VIETNAM_ADMINISTRATIVE_DATA || []).find((p) => {
    const pLower = p.name.toLowerCase();
    return pLower === lower || lower.includes(pLower) || pLower.includes(lower);
  }) || null;
};

/**
 * Hạt nhân cấu hình từng danh mục BĐS (Mua Bán)
 * Dùng bảng ánh xạ thống nhất, tránh lặp logic if/else dài dòng.
 */
const SALE_CATEGORY_PROFILES = {
  apartment: {
    label: 'Căn Hộ Chung Cư',
    shortLabel: 'căn hộ chung cư',
    priceUnit: 'tr/m²',
    tableCols: ['Chung cư bình dân / NƠXH', 'Chung cư trung cấp', 'Chung cư cao cấp / Hạng sang', 'Dự án / Khu vực tiêu biểu'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['35 - 48 tr/m²', '52 - 80 tr/m²', '90 - 190 tr/m²'], hotspots: 'TP. Thủ Đức, Quận 7, Bình Thạnh, Bình Tân' },
        { area: 'Hà Nội', cols: ['38 - 52 tr/m²', '55 - 82 tr/m²', '88 - 165 tr/m²'], hotspots: 'Nam Từ Liêm, Cầu Giấy, Tây Hồ, Gia Lâm' },
        { area: 'Đà Nẵng', cols: ['28 - 38 tr/m²', '40 - 60 tr/m²', '65 - 120 tr/m²'], hotspots: 'Sơn Trà, Hải Châu, Ngũ Hành Sơn, Liên Chiểu' },
        { area: 'Bình Dương & Đồng Nai', cols: ['24 - 34 tr/m²', '35 - 48 tr/m²', '50 - 68 tr/m²'], hotspots: 'Dĩ An, Thuận An, TP. Thủ Dầu Một, Biên Hòa' },
        { area: 'Hải Phòng & Khánh Hòa', cols: ['25 - 35 tr/m²', '38 - 58 tr/m²', '60 - 95 tr/m²'], hotspots: 'Lê Chân, Thủy Nguyên, Nha Trang trung tâm' }
      ],
      danang: [
        { area: 'Hải Châu (Trung tâm & Ven sông Hàn)', cols: ['38 - 50 tr/m²', '55 - 82 tr/m²', '85 - 135 tr/m²'], hotspots: 'Bạch Đằng, Trần Hưng Đạo, 2/9, Thuận Phước' },
        { area: 'Sơn Trà (Ven biển & Bán đảo)', cols: ['34 - 45 tr/m²', '48 - 72 tr/m²', '75 - 125 tr/m²'], hotspots: 'Võ Nguyên Giáp, Trần Hưng Đạo, Phạm Văn Đồng' },
        { area: 'Ngũ Hành Sơn (Đô thị sinh thái)', cols: ['30 - 40 tr/m²', '42 - 62 tr/m²', '65 - 105 tr/m²'], hotspots: 'FPT City, Khuê Mỹ, Trường Sa ven biển' },
        { area: 'Thanh Khê & Cẩm Lệ', cols: ['26 - 35 tr/m²', '36 - 50 tr/m²', '52 - 68 tr/m²'], hotspots: 'Điện Biên Phủ, Lê Duẩn, KĐT Hòa Xuân' },
        { area: 'Liên Chiểu (Đón sóng Cảng & KCN)', cols: ['22 - 30 tr/m²', '32 - 44 tr/m²', '-'], hotspots: 'Hòa Khánh, Bầu Tràm Lakeside, Nguyễn Tất Thành' }
      ],
      hanoi: [
        { area: 'Tây Hồ & Ba Đình', cols: ['58 - 78 tr/m²', '82 - 120 tr/m²', '130 - 220 tr/m²'], hotspots: 'Ciputra, Starlake Tây Hồ Tây, Liễu Giai' },
        { area: 'Cầu Giấy & Nam Từ Liêm', cols: ['45 - 58 tr/m²', '60 - 85 tr/m²', '88 - 135 tr/m²'], hotspots: 'Trung Hòa Nhân Chính, Mỹ Đình, Vinhomes Smart City' },
        { area: 'Đống Đa & Thanh Xuân', cols: ['44 - 56 tr/m²', '58 - 80 tr/m²', '85 - 125 tr/m²'], hotspots: 'Nguyễn Trãi, Lê Văn Lương, Royal City' },
        { area: 'Long Biên & Gia Lâm', cols: ['36 - 48 tr/m²', '48 - 66 tr/m²', '68 - 95 tr/m²'], hotspots: 'Vinhomes Ocean Park, Việt Hưng, Bồ Đề' },
        { area: 'Hà Đông & Hoàng Mai', cols: ['32 - 44 tr/m²', '45 - 60 tr/m²', '62 - 82 tr/m²'], hotspots: 'Văn Phú, Dương Nội, Linh Đàm, Gamuda' }
      ],
      hcm: [
        { area: 'Quận 1 & Quận 3 (Lõi trung tâm)', cols: ['65 - 88 tr/m²', '95 - 140 tr/m²', '150 - 280 tr/m²'], hotspots: 'Bến Nghé, Đa Kao, Võ Thị Sáu, Ba Son' },
        { area: 'TP. Thủ Đức (Thảo Điền - Thủ Thiêm)', cols: ['38 - 52 tr/m²', '55 - 88 tr/m²', '95 - 190 tr/m²'], hotspots: 'Thảo Điền, An Phú, Vinhomes Grand Park' },
        { area: 'Quận 7 & Nhà Bè (Khu Nam)', cols: ['36 - 48 tr/m²', '50 - 78 tr/m²', '80 - 135 tr/m²'], hotspots: 'Phú Mỹ Hưng, Nguyễn Hữu Thọ, Đào Trí' },
        { area: 'Bình Thạnh & Phú Nhuận', cols: ['44 - 58 tr/m²', '60 - 85 tr/m²', '88 - 130 tr/m²'], hotspots: 'Vinhomes Central Park, Điện Biên Phủ, Hoàng Sa' },
        { area: 'Bình Tân & Quận 12 (Vành đai ở thực)', cols: ['30 - 40 tr/m²', '42 - 54 tr/m²', '55 - 68 tr/m²'], hotspots: 'Tên Lửa, Kinh Dương Vương, Picity High Park' }
      ],
      quangnam: [
        { area: 'TP. Hội An (Căn hộ nghỉ dưỡng & ven biển)', cols: ['32 - 44 tr/m²', '45 - 65 tr/m²', '68 - 95 tr/m²'], hotspots: 'Cửa Đại, Cẩm An, Thanh Hà' },
        { area: 'TX. Điện Bàn (KĐT ven sông Cổ Cò)', cols: ['20 - 28 tr/m²', '28 - 40 tr/m²', '42 - 58 tr/m²'], hotspots: 'Điện Ngọc, Điện Dương, KĐT FPT - Điện Nam' },
        { area: 'TP. Tam Kỳ (Trung tâm hành chính)', cols: ['17 - 24 tr/m²', '25 - 34 tr/m²', '-'], hotspots: 'Tân Thạnh, An Mỹ, Hùng Vương' },
        { area: 'Huyện Núi Thành (KKT mở Chu Lai)', cols: ['15 - 22 tr/m²', '22 - 30 tr/m²', '-'], hotspots: 'Tam Hiệp, TT. Núi Thành' }
      ]
    },
    scaleFactor: [0.48, 0.72, 1.05],
    marketFocus: 'nguồn cung căn hộ mới tại khu vực nội đô khan hiếm trong khi sức cầu ở thực của gia đình trẻ và giới chuyên gia tăng cao. Xu hướng năm 2026 ưu tiên rõ rệt các dự án chung cư đã bàn giao có Sổ hồng riêng lâu dài, mật độ thang máy hợp lý, tiện ích khép kín và kết nối trực tiếp tới các tuyến metro, vành đai giao thông. Khi Luật Nhà ở 2023 và Luật Kinh doanh BĐS 2023 siết chặt điều kiện huy động vốn, người mua căn hộ được bảo vệ tốt hơn về tiến độ cấp sổ, quỹ bảo trì 2% và an toàn phòng cháy chữa cháy.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Mua Căn Hộ Chung Cư',
    legalSteps: [
      {
        title: 'Kiểm tra Sổ hồng riêng hoặc Văn bản đủ điều kiện bán',
        text: 'Đối với căn hộ đã có sổ, đối chiếu bản gốc Sổ hồng và CCCD chủ sở hữu. Với căn hộ đang chuyển nhượng Hợp đồng mua bán (HĐMB), yêu cầu giấy xác nhận chưa nộp hồ sơ cấp sổ từ chủ đầu tư và văn bản giải chấp nếu căn hộ/dự án từng thế chấp ngân hàng.'
      },
      {
        title: 'Xác minh thời hạn sở hữu & Nghiệm thu PCCC, Hoàn công',
        text: 'Phân biệt rõ căn hộ đất ở sở hữu lâu dài với căn hộ thương mại dịch vụ / Officetel sở hữu có thời hạn (thường 50 năm). Kiểm tra văn bản nghiệm thu phòng cháy chữa cháy (PCCC) và thông báo chấp thuận nghiệm thu công trình đưa vào sử dụng.'
      },
      {
        title: 'Kiểm tra Quỹ bảo trì 2%, Phí quản lý & Hiện trạng tòa nhà',
        text: 'Xác nhận bên bán hoặc chủ đầu tư đã đóng đủ phí bảo trì 2%, hỏi Ban Quản Lý về mức phí quản lý (VNĐ/m²), phí gửi ô tô/xe máy, tình trạng thấm dột, cách âm và công suất thang máy giờ cao điểm.',
        linkText: 'xem thủ tục sang tên sổ hồng căn hộ',
        linkTo: '/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho'
      },
      {
        title: 'Đối chiếu công nợ phí dịch vụ & Ký hợp đồng đặt cọc an toàn',
        text: 'Yêu cầu bên bán thanh toán hết công nợ điện, nước, phí quản lý trước ngày công chứng. Kiểm tra ngăn chặn giao dịch qua hệ thống UCHI và ghi rõ điều khoản hoàn cọc 100% nếu không công chứng được trong ',
        linkText: 'mẫu hợp đồng đặt cọc mua bán chuẩn pháp lý',
        linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly'
      }
    ],
    guides: [
      {
        badge: 'Kinh nghiệm chọn mua',
        badgeTone: 'emerald',
        icon: 'fa-solid fa-building-circle-check',
        title: 'Kinh Nghiệm Mua Căn Hộ Chung Cư Lần Đầu Không Bị Hớ Giá & Rủi Ro',
        desc: 'Checklist chọn tầng, hướng ban công mát, đánh giá chủ đầu tư và kiểm tra mật độ thang máy.',
        to: '/kien-thuc/kinh-nghiem-mua-can-ho-chung-cu-lan-dau'
      },
      {
        badge: 'Pháp lý sang tên',
        badgeTone: 'blue',
        icon: 'fa-solid fa-file-signature',
        title: 'Thủ Tục Sang Tên Sổ Hồng Căn Hộ Chung Cư & Biểu Thuế Mới Nhất',
        desc: 'Quy trình công chứng HĐMB/Sổ hồng, tính thuế TNCN 2%, lệ phí trước bạ 0.5% và hồ sơ nộp một cửa.',
        to: '/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho'
      },
      {
        badge: 'Công cụ tài chính',
        badgeTone: 'amber',
        icon: 'fa-solid fa-calculator',
        title: 'Công Cụ Tính Lãi Suất Vay Mua Căn Hộ Chung Cư Tự Động 2026',
        desc: 'Ước tính chính xác gốc và lãi phải trả hàng tháng khi vay 50% - 70% giá trị căn hộ theo dư nợ giảm dần.',
        to: '/tinh-lai-vay'
      }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua căn hộ chung cư ${citySuffix ? `tại ${cityName} ` : ''}chưa có Sổ hồng (đang hợp đồng mua bán) có an toàn không?`,
        a: `Việc mua chuyển nhượng căn hộ theo Hợp đồng mua bán (HĐMB) hoàn toàn hợp pháp nếu dự án đủ điều kiện chuyển nhượng và chưa nộp hồ sơ xin cấp Sổ hồng tại Văn phòng Đăng ký Đất đai. Người mua bắt buộc phải yêu cầu bên bán cung cấp giấy xác nhận tình trạng chưa nộp sổ của chủ đầu tư, kiểm tra biên lai đóng tiền các đợt, công văn giải chấp (nếu dự án từng thế chấp ngân hàng) và thực hiện công chứng văn bản chuyển nhượng HĐMB theo đúng quy định.`
      },
      {
        q: `Nên chọn căn hộ chung cư sở hữu lâu dài hay chung cư 50 năm${citySuffix ? ` tại ${cityName}` : ''}?`,
        a: `Căn hộ đất ở đô thị có Sổ hồng sở hữu lâu dài giữ giá tốt hơn, dễ vay ngân hàng hạn mức 70% - 80% và thanh khoản bán lại cao hơn, phù hợp để an cư lâu dài. Trong khi đó, căn hộ thương mại dịch vụ / Officetel sở hữu 50 năm thường có giá mềm hơn 15% - 25%, phù hợp để ở kết hợp văn phòng hoặc khai thác cho thuê dòng tiền ngắn hạn.`
      },
      {
        q: `Chi phí sang tên Sổ hồng căn hộ chung cư và quỹ bảo trì 2% bên nào chịu?`,
        a: `Quỹ bảo trì 2% giá trị căn hộ (chưa VAT) thường được nộp một lần khi nhận bàn giao nhà từ chủ đầu tư và gắn liền với căn hộ khi chuyển nhượng lại. Khi mua bán lại trên thị trường thứ cấp, bên bán chịu Thuế thu nhập cá nhân 2% (nếu không thuộc diện miễn thuế nhà ở duy nhất) và bên mua chịu Lệ phí trước bạ 0.5% cùng phí thẩm định cấp đổi sổ mới (tổng cộng khoảng 1 - 2 triệu đồng).`
      },
      {
        q: `Làm sao chọn đúng căn hộ chung cư có pháp lý sạch, giá hợp lý trên Kênh Nhà Đất 24H?`,
        a: `Bạn có thể sử dụng thanh lọc nâng cao tại trang Bán Căn Hộ Chung Cư: Lọc theo ${cityName ? `quận/huyện tại ${cityName}` : 'tỉnh thành và dự án'}, chọn khoảng giá, diện tích (1PN - 3PN) và bật bộ lọc 'Tin chính chủ / Đã xác thực' để ưu tiên các căn hộ đã được kiểm duyệt thông tin pháp lý và hình ảnh thực tế.`
      }
    ]
  },

  'mini-apartment': {
    label: 'Chung Cư Mini, Căn Hộ Dịch Vụ',
    shortLabel: 'chung cư mini, căn hộ dịch vụ',
    priceUnit: 'tr/m²',
    tableCols: ['Căn Studio (20 - 30m²)', 'Căn hộ dịch vụ 1PN - 2PN', 'Tòa nhà dòng tiền (Cả tòa)', 'Khu vực sôi động'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['1.1 - 1.8 tỷ/căn', '1.8 - 3.2 tỷ/căn', '12 - 35 tỷ/tòa'], hotspots: 'Bình Thạnh, Tân Bình, Phú Nhuận, Quận 7' },
        { area: 'Hà Nội', cols: ['950 tr - 1.5 tỷ/căn', '1.5 - 2.6 tỷ/căn', '10 - 28 tỷ/tòa'], hotspots: 'Cầu Giấy, Đống Đa, Thanh Xuân, Nam Từ Liêm' },
        { area: 'Đà Nẵng', cols: ['850 tr - 1.3 tỷ/căn', '1.3 - 2.2 tỷ/căn', '7 - 18 tỷ/tòa'], hotspots: 'Sơn Trà (An Thượng), Hải Châu, Ngũ Hành Sơn' },
        { area: 'Bình Dương & Bắc Ninh', cols: ['650 - 950 tr/căn', '1.0 - 1.6 tỷ/căn', '5 - 12 tỷ/tòa'], hotspots: 'Thuận An, Dĩ An, Từ Sơn, TP. Bắc Ninh' }
      ]
    },
    scaleFactor: [0.42, 0.65, 1.0],
    marketFocus: 'Luật Nhà ở 2023 chính thức công nhận quyền cấp Sổ hồng riêng cho căn hộ chung cư mini nếu đáp ứng đầy đủ điều kiện về quy chuẩn xây dựng và phòng cháy chữa cháy (PCCC). Điều này thúc đẩy phân khúc chung cư mini, tòa căn hộ dịch vụ vận hành dòng tiền trở thành tâm điểm của giới đầu tư tìm kiếm tỷ suất cho thuê 6% - 9%/năm tại các khu vực tập trung nhiều đại học và khu văn phòng.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Khi Mua Chung Cư Mini & Căn Hộ Dịch Vụ',
    legalSteps: [
      {
        title: 'Kiểm tra Giấy phép xây dựng & Điều kiện cấp Sổ hồng theo Luật Nhà ở 2023',
        text: 'Xác minh công trình xây dựng đúng mật độ, số tầng theo giấy phép, có thiết kế riêng biệt từng căn hộ và đáp ứng tiêu chuẩn nhà chung cư nhiều tầng nhiều căn hộ để đủ điều kiện tách sổ hồng riêng.'
      },
      {
        title: 'Thẩm định hệ thống PCCC & Lối thoát nạn bắt buộc',
        text: 'Kiểm tra trực tiếp văn bản thẩm duyệt và nghiệm thu PCCC của cơ quan công an: Thang thoát hiểm ngoài trời hoặc buồng thang kín chống cháy, lối thoát nạn tầng hầm và hệ thống báo cháy tự động.'
      },
      {
        title: 'Phân biệt mua từng căn (vi bằng/sổ chung) với mua nguyên tòa (sổ đỏ riêng)',
        text: 'Nếu mua nguyên tòa nhà căn hộ dịch vụ để khai thác dòng tiền, đảm bảo Sổ hồng đứng tên một chủ sở hữu duy nhất, hoàn công đúng hiện trạng số tầng và không vi phạm chỉ giới.',
        linkText: 'tra cứu quy hoạch trực tuyến trước khi cọc',
        linkTo: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai'
      },
      {
        title: 'Rà soát hợp đồng thuê hiện hữu & Giấy phép kinh doanh lưu trú',
        text: 'Nếu tòa căn hộ dịch vụ đang có khách thuê sẵn, kiểm tra toàn bộ hợp đồng thuê đang chạy, sổ tiền cọc bàn giao và cam kết không tranh chấp trước khi ký ',
        linkText: 'hợp đồng đặt cọc chuẩn pháp lý',
        linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly'
      }
    ],
    guides: [
      { badge: 'Kinh nghiệm', badgeTone: 'emerald', icon: 'fa-solid fa-city', title: 'Kinh Nghiệm Mua Căn Hộ Chung Cư & Căn Hộ Dịch Vụ Cho Thuê An Toàn', desc: 'Đánh giá tỷ suất dòng tiền thực tế, chi phí vận hành và rủi ro pháp lý cần tránh.', to: '/kien-thuc/kinh-nghiem-mua-can-ho-chung-cu-lan-dau' },
      { badge: 'Pháp lý', badgeTone: 'blue', icon: 'fa-solid fa-file-shield', title: 'Hướng Dẫn Tra Cứu Quy Hoạch & Hiện Trạng Xây Dựng Chuẩn', desc: 'Cách kiểm tra lộ giới, hệ số sử dụng đất và thông tin quy hoạch quận/huyện nhanh nhất.', to: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { badge: 'Tài chính', badgeTone: 'amber', icon: 'fa-solid fa-calculator', title: 'Tính Dòng Tiền & Lãi Suất Vay Đầu Tư Tòa Căn Hộ Dịch Vụ', desc: 'So sánh tiền lãi ngân hàng hàng tháng với doanh thu cho thuê căn hộ dịch vụ dự kiến.', to: '/tinh-lai-vay' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Chung cư mini ${citySuffix ? `tại ${cityName} ` : ''}có được cấp Sổ hồng riêng theo Luật Nhà ở 2023 không?`,
        a: `Có. Theo Luật Nhà ở 2023, cá nhân xây dựng nhà ở từ 2 tầng trở lên mà tại mỗi tầng có thiết kế, xây dựng căn hộ để bán hoặc cho thuê sẽ được cấp Giấy chứng nhận (Sổ hồng) từng căn nếu đáp ứng đầy đủ điều kiện về đất ở, quy chuẩn xây dựng và đặc biệt là tiêu chuẩn an toàn phòng cháy chữa cháy (PCCC).`
      },
      {
        q: `Có nên mua chung cư mini chưa tách sổ bằng hình thức vi bằng không?`,
        a: `Không khuyến khích mua bán bằng vi bằng vì vi bằng của Thừa phát lại chỉ ghi nhận sự kiện giao nhận tiền chứ không có giá trị chuyển quyền sở hữu hợp pháp. Người mua nên ưu tiên căn hộ mini đã có sổ riêng hoặc mua trọn tòa căn hộ dịch vụ có sổ hồng hoàn công đầy đủ.`
      },
      {
        q: `Tỷ suất sinh lời khi mua cả tòa căn hộ dịch vụ cho thuê năm 2026 là bao nhiêu?`,
        a: `Tại các quận trung tâm hoặc gần khu đại học, khu công nghệ cao, tỷ suất lợi nhuận cho thuê ròng đạt khoảng 5.5% - 8.5%/năm, chưa bao gồm biên độ tăng giá đất dài hạn.`
      },
      {
        q: `Cần kiểm tra tiêu chuẩn PCCC nào khi đi xem chung cư mini?`,
        a: `Cần kiểm tra 4 yếu tố sống còn: Lối thoát hiểm thứ hai (thang sắt ngoài trời/ban công thông), cửa ngăn cháy tại khu vực để xe tầng 1/hầm, đầu báo khói + bình chữa cháy từng tầng và nghiệm thu PCCC của cơ quan chức năng.`
      }
    ]
  },

  house: {
    label: 'Nhà Riêng, Nhà Phố',
    shortLabel: 'nhà riêng, nhà trong ngõ',
    anchorLabel: 'nhà riêng',
    priceUnit: 'tr/m²',
    tableCols: ['Nhà ngõ nhỏ (xe máy)', 'Nhà ngõ ô tô (4 - 6m)', 'Nhà phố / Phân lô đẹp', 'Khu vực tiêu biểu'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['75 - 125 tr/m²', '130 - 210 tr/m²', '220 - 380 tr/m²'], hotspots: 'Bình Thạnh, Gò Vấp, Phú Nhuận, Thủ Đức' },
        { area: 'Hà Nội', cols: ['95 - 145 tr/m²', '155 - 245 tr/m²', '250 - 420 tr/m²'], hotspots: 'Ba Đình, Đống Đa, Cầu Giấy, Thanh Xuân, Hoàng Mai' },
        { area: 'Đà Nẵng', cols: ['38 - 65 tr/m²', '65 - 115 tr/m²', '115 - 185 tr/m²'], hotspots: 'Hải Châu, Thanh Khê, Sơn Trà, Cẩm Lệ' },
        { area: 'Bình Dương & Đồng Nai', cols: ['28 - 48 tr/m²', '48 - 82 tr/m²', '85 - 140 tr/m²'], hotspots: 'Thuận An, Dĩ An, Thủ Dầu Một, Biên Hòa' },
        { area: 'Quảng Nam & Miền Trung', cols: ['20 - 36 tr/m²', '36 - 62 tr/m²', '65 - 105 tr/m²'], hotspots: 'TP. Hội An, Điện Bàn, TP. Tam Kỳ, Nha Trang' }
      ],
      danang: [
        { area: 'Hải Châu & Thanh Khê (Trung tâm)', cols: ['55 - 88 tr/m²', '90 - 150 tr/m²', '155 - 235 tr/m²'], hotspots: 'Hùng Vương, Lê Duẩn, Hải Phòng, Núi Thành' },
        { area: 'Sơn Trà (Gần biển & Cầu Rồng)', cols: ['42 - 70 tr/m²', '72 - 125 tr/m²', '130 - 195 tr/m²'], hotspots: 'An Hải Bắc, An Hải Đông, Mân Thái' },
        { area: 'Ngũ Hành Sơn & Cẩm Lệ', cols: ['32 - 52 tr/m²', '52 - 90 tr/m²', '92 - 150 tr/m²'], hotspots: 'Khuê Mỹ, KĐT Hòa Xuân, Khuê Trung' },
        { area: 'Liên Chiểu', cols: ['24 - 40 tr/m²', '40 - 68 tr/m²', '70 - 110 tr/m²'], hotspots: 'Hòa Minh, Hòa Khánh Bắc, Nguyễn Tất Thành' }
      ],
      hanoi: [
        { area: 'Ba Đình, Hoàn Kiếm & Tây Hồ', cols: ['135 - 210 tr/m²', '220 - 340 tr/m²', '350 - 550 tr/m²'], hotspots: 'Đội Cấn, Kim Mã, Thụy Khuê, Lạc Long Quân' },
        { area: 'Cầu Giấy, Đống Đa & Thanh Xuân', cols: ['115 - 165 tr/m²', '170 - 260 tr/m²', '265 - 420 tr/m²'], hotspots: 'Trung Kính, Thái Hà, Hoàng Quốc Việt, Vũ Tông Phan' },
        { area: 'Hoàng Mai, Hai Bà Trưng & Long Biên', cols: ['85 - 135 tr/m²', '140 - 210 tr/m²', '215 - 320 tr/m²'], hotspots: 'Minh Khai, Bồ Đề, Việt Hưng, Linh Đàm' },
        { area: 'Hà Đông & Nam Từ Liêm', cols: ['75 - 115 tr/m²', '120 - 185 tr/m²', '190 - 280 tr/m²'], hotspots: 'Mỹ Đình, Mỗ Lao, Văn Quán' }
      ],
      hcm: [
        { area: 'Quận 1, Quận 3 & Phú Nhuận', cols: ['135 - 220 tr/m²', '230 - 360 tr/m²', '370 - 620 tr/m²'], hotspots: 'Tân Định, Võ Thị Sáu, Phan Xích Long' },
        { area: 'Bình Thạnh, Tân Bình & Quận 10', cols: ['95 - 150 tr/m²', '155 - 245 tr/m²', '250 - 400 tr/m²'], hotspots: 'D2, Hoàng Hoa Thám, Sư Vạn Hạnh' },
        { area: 'Gò Vấp, Quận 7 & TP. Thủ Đức', cols: ['72 - 118 tr/m²', '120 - 195 tr/m²', '200 - 320 tr/m²'], hotspots: 'Quang Trung, Lâm Văn Bền, Thảo Điền, Linh Đông' },
        { area: 'Bình Tân, Tân Phú & Quận 12', cols: ['60 - 95 tr/m²', '95 - 150 tr/m²', '155 - 230 tr/m²'], hotspots: 'Tên Lửa, Tân Kỳ Tân Quý, Hiệp Thành' }
      ],
      quangnam: [
        { area: 'TP. Hội An', cols: ['42 - 72 tr/m²', '75 - 130 tr/m²', '135 - 210 tr/m²'], hotspots: 'Cẩm Châu, Tân An, Sơn Phong, Cẩm Phô' },
        { area: 'TX. Điện Bàn & TP. Tam Kỳ', cols: ['18 - 32 tr/m²', '32 - 58 tr/m²', '60 - 95 tr/m²'], hotspots: 'Điện Ngọc, Vĩnh Điện, An Mỹ, Tân Thạnh' }
      ]
    },
    scaleFactor: [0.75, 1.0, 1.35],
    marketFocus: 'nhu cầu mua nhà riêng gắn liền với quyền sử dụng đất ở lâu dài luôn là kênh tích sản an toàn hàng đầu tại Việt Nam. Dưới tiêu chuẩn nghiêm ngặt hơn của Luật Nhà ở 2023 về cấp phép xây dựng (GPXD), hoàn công công trình và lối thoát nạn PCCC nhà ở nhiều tầng trong ngõ, người mua năm 2026 ưu tiên rõ rệt các căn nhà riêng ngõ ô tô (rộng từ 3.5m - 5m trở lên), kết cấu 3 - 5 tầng đã hoàn công đầy đủ trên Sổ hồng và sổ vuông vức.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Trước Khi Mua Nhà Riêng, Nhà Phố',
    legalSteps: [
      { title: 'Kiểm tra bản gốc Sổ hồng & Tài sản gắn liền trên đất (Hoàn công)', text: 'Đối chiếu số thửa, diện tích đất và diện tích sàn xây dựng đã được ghi nhận hoàn công trên trang 2/trang 3 Sổ hồng để tránh rủi ro nhà xây sai phép, không được cấp phép sửa chữa sau này.' },
      { title: 'Tra cứu quy hoạch phân khu & Lộ giới mở rộng hẻm', text: 'Mang bản sao sổ hồng đến Bộ phận Một cửa quận/huyện để kiểm tra chỉ giới mở rộng hẻm, tránh mua phải nhà bị cắt phần lớn diện tích vào lộ giới qua ', linkText: 'hướng dẫn tra cứu quy hoạch đất đai trực tuyến', linkTo: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { title: 'Đo đạc thực tế ranh giới, tường riêng & Tranh chấp lối đi chung', text: 'Đo kiểm lại kích thước mặt tiền và chiều sâu nhà xem có trùng khớp bản vẽ tọa độ trên sổ hay bị hàng xóm lấn chiếm; kiểm tra tường riêng/tường chung, hố ga và tình trạng thoát nước mưa.' },
      { title: 'Kiểm tra ngăn chặn UCHI & Ký hợp đồng đặt cọc chuẩn pháp lý', text: 'Xác minh tài sản không bị kê biên thi hành án hay thế chấp ngân hàng trái phép trước khi ký ', linkText: 'mẫu hợp đồng đặt cọc chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Cẩm nang an cư', badgeTone: 'emerald', icon: 'fa-solid fa-house-circle-check', title: 'Cẩm Nang Mua Nhà Lần Đầu Từ A - Z Cho Vợ Chồng Trẻ Năm 2026', desc: 'Cách cân đối dòng tiền 50-30-20, so sánh mua nhà riêng hẻm ô tô vs căn hộ chung cư.', to: '/kien-thuc/cam-nang-mua-nha-lan-dau' },
      { badge: 'Tra cứu quy hoạch', badgeTone: 'blue', icon: 'fa-solid fa-map-location-dot', title: 'Hướng Dẫn Tra Cứu Quy Hoạch Lộ Giới Hẻm & Đất Ở Trực Tuyến', desc: 'Tránh mua phải nhà dính quy hoạch treo, cắt lộ giới mở hẻm hoặc đất xen kẹt.', to: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { badge: 'Tài chính', badgeTone: 'amber', icon: 'fa-solid fa-calculator', title: 'Công Cụ Tính Lãi Suất Vay Mua Nhà Riêng Trực Tuyến 2026', desc: 'Mô phỏng tiền gốc lãi hàng tháng theo dư nợ giảm dần khi vay ngân hàng.', to: '/tinh-lai-vay' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua nhà riêng ${citySuffix ? `tại ${cityName} ` : ''}chưa hoàn công trên Sổ hồng có công chứng sang tên được không?`,
        a: `Nhà chưa hoàn công vẫn có thể công chứng chuyển nhượng quyền sử dụng đất (nếu phần đất có Sổ đỏ hợp pháp), nhưng phần công trình nhà trên đất sẽ không được công nhận trên sổ mới. Tài sản chưa hoàn công thường bị ngân hàng định giá thấp hơn 20% - 30% và gặp trở ngại khi xin phép cải tạo lớn, vì vậy nên yêu cầu bên bán hoàn công trước hoặc thỏa thuận trừ chi phí hoàn công vào giá bán.`
      },
      {
        q: `Làm sao biết nhà riêng trong ngõ có bị dính quy hoạch mở đường hay giải tỏa không?`,
        a: `Chụp ảnh trang bản vẽ tọa độ VN-2000 trên Sổ hồng mang đến Chi nhánh Văn phòng Đăng ký Đất đai ${cityName ? `tại ${cityName}` : 'cấp quận/huyện'} nộp phiếu xin cung cấp thông tin quy hoạch (thời gian trả kết quả 3 - 5 ngày làm việc), hoặc tra cứu qua cổng thông tin quy hoạch trực tuyến của địa phương.`
      },
      {
        q: `Thuế và lệ phí sang tên Sổ hồng nhà riêng bên nào đóng?`,
        a: `Theo quy định pháp luật hiện hành: Bên bán nộp Thuế TNCN 2%, Bên mua nộp Lệ phí trước bạ 0.5% giá trị chuyển nhượng cùng phí thẩm định hồ sơ và lệ phí cấp đổi sổ (khoảng 1 - 2 triệu đồng). Hai bên có thể thỏa thuận "bao sang tên" trong hợp đồng đặt cọc.`
      },
      {
        q: `Nên chọn nhà riêng hẻm xe máy hay nhà hẻm ô tô tránh và cách thương lượng giá tốt nhất?`,
        a: `Nhà ngõ ô tô (độ rộng từ 3.5m trở lên) có tính thanh khoản cao gấp 2 - 3 lần hẻm nhỏ, dễ thoát hiểm PCCC và giữ giá bền vững hơn. Khi thương lượng, hãy khảo sát ít nhất 5 căn tương đồng trong bán kính 1 km, kiểm tra điểm yếu thấm dột/kết cấu để đàm phán giảm 5% - 10% kết hợp lộ trình cọc nhanh.`
      }
    ]
  },

  'street-house': {
    label: 'Nhà Mặt Phố',
    shortLabel: 'nhà mặt phố kinh doanh',
    priceUnit: 'tr/m²',
    tableCols: ['Mặt phố nhánh / Kinh doanh nhỏ', 'Mặt tiền đường lớn (15 - 25m)', 'Mặt phố lõi trung tâm', 'Tuyến phố sầm uất'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['180 - 320 tr/m²', '350 - 650 tr/m²', '700 tr - 1.5 tỷ/m²'], hotspots: 'Nguyễn Huệ, Đồng Khởi, Phan Xích Long, Cách Mạng Tháng 8' },
        { area: 'Hà Nội', cols: ['210 - 380 tr/m²', '400 - 750 tr/m²', '800 tr - 1.6 tỷ/m²'], hotspots: 'Phố Cổ, Phố Huế, Thái Hà, Cầu Giấy, Kim Mã' },
        { area: 'Đà Nẵng', cols: ['95 - 160 tr/m²', '170 - 320 tr/m²', '340 - 550 tr/m²'], hotspots: 'Bạch Đằng, Nguyễn Văn Linh, Hùng Vương, Võ Nguyên Giáp' },
        { area: 'Quảng Nam & Đô thị loại 2', cols: ['45 - 85 tr/m²', '90 - 160 tr/m²', '165 - 260 tr/m²'], hotspots: 'Trần Phú Hội An, Hùng Vương Tam Kỳ, Quang Trung' }
      ]
    },
    scaleFactor: [1.1, 1.6, 2.3],
    marketFocus: 'nhà mặt phố luôn là tài sản khan hiếm bậc nhất với giá trị kép: vừa cho thuê mặt bằng tạo dòng tiền đều đặn (hợp đồng dài hạn 3 - 5 năm cho ngân hàng, showroom, F&B, phòng khám), vừa tích lũy tăng giá đất bền vững theo thời gian. Xu hướng năm 2026 cho thấy nhà đầu tư ưu tiên các căn mặt phố có mặt tiền rộng trên 5m, vỉa hè thông thoáng đỗ được ô tô và có lối thang máy riêng biệt cho các tầng trên.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý & Thương Mại Khi Mua Nhà Mặt Phố',
    legalSteps: [
      { title: 'Kiểm tra Sổ hồng, Hoàn công & Chỉ giới hành lang an toàn đường bộ', text: 'Đo kiểm phần diện tích đất công nhận trên sổ so với diện tích nằm trong lộ giới/vỉa hè quy hoạch mở rộng đường để định giá chính xác phần đất được phép xây dựng bền vững.' },
      { title: 'Đánh giá mặt tiền, lề đường & Lưu lượng giao thông một chiều', text: 'Kiểm tra chiều rộng vỉa hè đỗ xe, dải phân cách cứng giữa đường và tình trạng cấm đậu đỗ giờ cao điểm ảnh hưởng trực tiếp tới doanh thu cho thuê mặt bằng.', linkText: 'kinh nghiệm mua nhà mặt phố kinh doanh', linkTo: '/kien-thuc/kinh-nghiem-mua-nha-mat-pho-kinh-doanh' },
      { title: 'Thẩm định hợp đồng thuê mặt bằng hiện hữu (nếu có)', text: 'Xem kỹ hợp đồng đang cho thuê (giá thuê, thời hạn còn lại, tiền cọc, quyền ưu tiên mua của khách thuê cũ) và thỏa thuận bàn giao tiền cọc khách thuê ngay tại công chứng.' },
      { title: 'Kiểm tra UCHI, thế chấp ngân hàng & Ký hợp đồng đặt cọc chặt chẽ', text: 'Đối với tài sản giá trị lớn hàng chục tỷ, ưu tiên giao dịch giải ngân phong tỏa ngân hàng và sử dụng ', linkText: 'mẫu hợp đồng đặt cọc chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Chiến lược đầu tư', badgeTone: 'emerald', icon: 'fa-solid fa-shop', title: 'Kinh Nghiệm Mua Nhà Mặt Phố Kinh Doanh & Khai Thác Dòng Tiền Tối Đa', desc: 'Tiêu chí chọn mặt tiền, chiều sâu, vỉa hè và công thức định giá nhà mặt phố theo dòng tiền thuê.', to: '/kien-thuc/kinh-nghiem-mua-nha-mat-pho-kinh-doanh' },
      { badge: 'Quy hoạch', badgeTone: 'blue', icon: 'fa-solid fa-compass-drafting', title: 'Cách Tra Cứu Chỉ Giới Đường Đỏ & Lộ Giới Mặt Tiền Trước Khi Mua', desc: 'Kiểm tra nhanh diện tích đất bị vướng quy hoạch mở rộng trục đường chính.', to: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { badge: 'Lãi suất 2026', badgeTone: 'amber', icon: 'fa-solid fa-percent', title: 'Lãi Suất Vay Mua BĐS Thương Mại 2026 & Kịch Bản Tái Cấu Trúc Vốn', desc: 'Cập nhật gói vay ưu đãi thế chấp tài sản dòng tiền tại Big 4 ngân hàng.', to: '/kien-thuc/lai-suat-vay-mua-nha-2026' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua nhà mặt phố ${citySuffix ? `tại ${cityName} ` : ''}có phần diện tích bị lộ giới có rủi ro gì không?`,
        a: `Phần diện tích dính lộ giới sẽ không được cấp phép xây dựng kiên cố mới và khi Nhà nước thu hồi mở đường chỉ được bồi thường theo quy định tùy thời điểm tạo lập tài sản. Tuy nhiên nhiều căn nhà mặt phố có phần lộ giới làm vỉa hè kinh doanh rất rộng. Bạn chỉ nên tính giá đất theo phần diện tích được công nhận ngoài lộ giới và giảm trừ hợp lý phần dính lộ giới.`
      },
      {
        q: `Tỷ suất cho thuê nhà mặt phố năm 2026 thường đạt mức bao nhiêu?`,
        a: `Trung bình dao động từ 2.5% - 4.5%/năm tùy vị trí lõi trung tâm hay đường nhánh thương mại. Giá trị cốt lõi của nhà mặt phố đến từ khả năng giữ tiền trước lạm phát và tăng trưởng giá trị đất 8% - 15%/năm.`
      },
      {
        q: `Tiêu chuẩn mặt tiền đẹp nhất của nhà mặt phố kinh doanh là bao nhiêu mét?`,
        a: `Mặt tiền tối thiểu từ 4.5m trở lên và lý tưởng nhất là 5m - 8m, dáng đất nở hậu hoặc vuông vức, không vướng trụ điện, tủ biến áp hay hố ga ngay trước cửa nhà.`
      },
      {
        q: `Nếu nhà mặt phố đang có người thuê, người mua mới có được tăng giá hoặc lấy lại nhà không?`,
        a: `Theo Bộ luật Dân sự, hợp đồng thuê nhà đang còn hiệu lực vẫn được bảo lưu quyền thuê của bên thuê khi đổi chủ, trừ khi hợp đồng thuê cũ có điều khoản chấm dứt khi bán nhà. Vì vậy cần làm rõ điều khoản thanh lý hoặc kế thừa hợp đồng thuê trước khi ký đặt cọc.`
      }
    ]
  },

  shophouse: {
    label: 'Shophouse, Nhà Phố Thương Mại',
    shortLabel: 'shophouse, nhà phố thương mại',
    priceUnit: 'tr/m²',
    tableCols: ['Shophouse nội khu KĐT', 'Shophouse trục đường lớn', 'Shophouse khối đế chung cư', 'Dự án / KĐT nổi bật'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['110 - 190 tr/m²', '200 - 380 tr/m²', '95 - 180 tr/m²'], hotspots: 'Thủ Thiêm, Phú Mỹ Hưng, Vinhomes Grand Park, Vạn Phúc' },
        { area: 'Hà Nội', cols: ['135 - 240 tr/m²', '260 - 450 tr/m²', '90 - 175 tr/m²'], hotspots: 'Vinhomes Ocean Park, Tây Hồ Tây, The Manor, Mỹ Đình' },
        { area: 'Đà Nẵng', cols: ['65 - 110 tr/m²', '120 - 210 tr/m²', '60 - 115 tr/m²'], hotspots: 'Sun Cosmo Residence, Nam Hòa Xuân, FPT City' },
        { area: 'Quảng Nam & Bình Dương', cols: ['42 - 75 tr/m²', '80 - 145 tr/m²', '48 - 85 tr/m²'], hotspots: 'Điện Bàn (Sông Cổ Cò), Hội An, Thành phố Mới Bình Dương' }
      ]
    },
    scaleFactor: [0.95, 1.35, 1.85],
    marketFocus: 'shophouse (nhà phố thương mại) thu hút dòng tiền đầu tư bài bản nhờ kiến trúc đồng bộ hai mặt thoáng, công năng vừa kinh doanh tầng 1 - 2 vừa ở hoặc làm văn phòng các tầng trên. Đặc biệt, các shophouse nằm trong đại đô thị có tỷ lệ cư dân lấp đầy cao trên 60% hoặc trên trục kết nối du lịch mang lại dòng tiền cho thuê ổn định từ chuỗi tiện ích F&B, siêu thị và showroom.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Khi Mua Shophouse, Nhà Phố Thương Mại',
    legalSteps: [
      { title: 'Phân biệt Shophouse Sổ hồng lâu dài với Shophouse khối đế 50 năm', text: 'Shophouse thấp tầng quy hoạch đất ở đô thị được cấp Sổ hồng lâu dài; trong khi Shophouse khối đế chung cư thường có thời hạn sử dụng 50 năm gắn với thời hạn dự án. Cần đọc kỹ mục đích sử dụng đất trên Sổ hoặc HĐMB.' },
      { title: 'Kiểm tra tỷ lệ cư dân lấp đầy & Quy hoạch ngành nghề kinh doanh', text: 'Đánh giá lưu lượng cư dân thực tế nội khu, khả năng đỗ xe trước cửa và kiểm tra nội quy khu đô thị về các ngành hàng được phép kinh doanh (F&B, karaoke, kho hàng).' },
      { title: 'Xác minh hoàn công xây dựng & Điều khoản cải tạo mặt ngoài', text: 'Hầu hết các đại đô thị quy định giữ nguyên kiến trúc mặt ngoài shophouse; cần kiểm tra hiện trạng không bị cơi nới sai thiết kế mẫu để đủ điều kiện sang tên thuận lợi.', linkText: 'kinh nghiệm mua nhà mặt phố & shophouse', linkTo: '/kien-thuc/kinh-nghiem-mua-nha-mat-pho-kinh-doanh' },
      { title: 'Kiểm tra phí quản lý KĐT, công nợ chủ đầu tư & Hợp đồng đặt cọc', text: 'Yêu cầu xác nhận đã hoàn tất thanh toán phí quản lý khu đô thị và nghĩa vụ tài chính với chủ đầu tư trước khi công chứng chuyển nhượng qua ', linkText: 'hợp đồng đặt cọc chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Kinh doanh dòng tiền', badgeTone: 'emerald', icon: 'fa-solid fa-store', title: 'Kinh Nghiệm Chọn Mua Nhà Mặt Phố & Shophouse Sinh Lời Cao', desc: 'Cách đo lưu lượng khách vãng lai, độ lấp đầy cư dân và tính thời gian hoàn vốn.', to: '/kien-thuc/kinh-nghiem-mua-nha-mat-pho-kinh-doanh' },
      { badge: 'Pháp lý căn hộ/khối đế', badgeTone: 'blue', icon: 'fa-solid fa-file-contract', title: 'Thủ Tục Sang Tên Sổ Hồng & Chuyển Nhượng HĐMB Dự Án Đô Thị', desc: 'Lưu ý thuế phí, xác nhận chủ đầu tư và thời hạn sở hữu 50 năm vs lâu dài.', to: '/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho' },
      { badge: 'Đòn bẩy vốn', badgeTone: 'amber', icon: 'fa-solid fa-calculator', title: 'Tính Lãi Suất Vay Mua Shophouse & Cân Đối Tiền Thuê Trả Góp', desc: 'Mô phỏng dòng tiền thuê bù gốc lãi ngân hàng hàng tháng năm 2026.', to: '/tinh-lai-vay' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Shophouse khối đế chung cư${citySuffix ? ` tại ${cityName}` : ''} thời hạn 50 năm hết hạn xử lý thế nào?`,
        a: `Khi hết thời hạn 50 năm sử dụng đất thương mại dịch vụ của khối đế, chủ sở hữu được xem xét gia hạn sử dụng đất theo quy hoạch và nộp tiền thuê đất gia hạn theo quy định của Luật Đất đai 2024 nếu công trình vẫn đảm bảo an toàn kết cấu và phù hợp quy hoạch đô thị.`
      },
      {
        q: `Khi nào nên đầu tư Shophouse trong khu đô thị mới?`,
        a: `Thời điểm an toàn nhất là khi các tòa chung cư xung quanh đã bắt đầu bàn giao và đạt tỷ lệ cư dân về ở từ 50% trở lên, tránh mua theo kỳ vọng quá xa khiến mặt bằng bị bỏ trống kéo dài.`
      },
      {
        q: `Có được sửa chữa mặt tiền Shophouse hoặc đập thông 2 căn không?`,
        a: `Bên trong nhà thường được cải tạo công năng và đập thông vách không chịu lực nếu có sự chấp thuận của Ban Quản Lý dự án, nhưng phần kiến trúc mặt ngoài phải giữ nguyên thiết kế đồng bộ theo quy chế khu đô thị.`
      },
      {
        q: `Phí dịch vụ quản lý Shophouse thường tính theo diện tích nào?`,
        a: `Thường tính trên diện tích đất hoặc tổng diện tích sàn xây dựng tùy quy chế từng chủ đầu tư, dao động khoảng 8.000 - 20.000 VNĐ/m²/tháng.`
      }
    ]
  },

  villa: {
    label: 'Biệt Thự, Liền Kề',
    shortLabel: 'biệt thự, liền kề',
    priceUnit: 'tr/m²',
    tableCols: ['Nhà liền kề KĐT', 'Biệt thự song lập', 'Biệt thự đơn lập / Ven sông', 'Khu đô thị tiêu biểu'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['115 - 210 tr/m²', '180 - 320 tr/m²', '280 - 650 tr/m²'], hotspots: 'Thảo Điền, Phú Mỹ Hưng, Lakeview City, The Global City' },
        { area: 'Hà Nội', cols: ['140 - 260 tr/m²', '220 - 380 tr/m²', '320 - 700 tr/m²'], hotspots: 'Vinhomes Riverside, Ciputra, Starlake, Dương Nội' },
        { area: 'Đà Nẵng', cols: ['65 - 125 tr/m²', '110 - 190 tr/m²', '160 - 320 tr/m²'], hotspots: 'Euro Village, Đảo Nổi Hòa Xuân, Nam Hòa Xuân, FPT City' },
        { area: 'Quảng Nam (Hội An - Cổ Cò)', cols: ['38 - 70 tr/m²', '55 - 105 tr/m²', '85 - 180 tr/m²'], hotspots: 'Ven sông Cổ Cò, Casamia Hội An, Cẩm Thanh, Điện Dương' }
      ]
    },
    scaleFactor: [1.0, 1.45, 2.1],
    marketFocus: 'phân khúc biệt thự, nhà liền kề trong các khu đô thị sinh thái quy hoạch bài bản thu hút mạnh giới khách hàng thượng lưu tìm kiếm không gian sống riêng tư, an ninh khép kín 24/7 và mảng xanh ven sông, ven hồ. Sức hút của biệt thự hoàn thiện sẵn nội thất hoặc nằm sát các tuyến hạ tầng trọng điểm giữ mức tăng giá bền vững bất chấp biến động ngắn hạn.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Khi Mua Biệt Thự & Nhà Liền Kề',
    legalSteps: [
      { title: 'Kiểm tra Sổ hồng riêng & Diện tích sân vườn được công nhận', text: 'Đối chiếu rõ diện tích đất ở lâu dài, diện tích đất trồng cây lâu năm (nếu có trong khuôn viên biệt thự vườn) và diện tích xây dựng đã hoàn công trên Sổ hồng.' },
      { title: 'Kiểm tra khoảng lùi xây dựng & Hiện trạng cơi nới cảnh quan', text: 'Biệt thự song lập/đơn lập bắt buộc tuân thủ khoảng lùi sân trước, sân sau và hông; tránh mua các căn tự ý lợp mái che hoặc xây lấn phần đất công cộng dẫn tới vướng hoàn công sang tên.' },
      { title: 'Thẩm định chất lượng khu đô thị, an ninh & phí dịch vụ compound', text: 'Khảo sát hệ thống bảo vệ đa lớp, công viên nội khu, hồ bơi, bến du thuyền và kiểm tra quy định về phí quản lý khu compound hàng tháng.', linkText: 'xem báo cáo xu hướng thị trường BĐS 2026', linkTo: '/kien-thuc/bao-cao-thi-truong-bat-dong-san-2026-xu-huong-va-co-hoi' },
      { title: 'Kiểm tra thế chấp, UCHI & Ký hợp đồng đặt cọc có điều khoản bảo vệ', text: 'Thực hiện kiểm tra dữ liệu ngăn chặn tại Văn phòng Công chứng và ràng buộc chặt chẽ tiến độ giải chấp, bàn giao sổ qua ', linkText: 'mẫu hợp đồng đặt cọc chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Xu hướng 2026', badgeTone: 'emerald', icon: 'fa-solid fa-landmark', title: 'Báo Cáo Thị Trường BĐS Cao Cấp & Biệt Thự Sinh Thái Năm 2026', desc: 'Phân tích dòng tiền tìm kiếm bất động sản ven sông, đô thị compound an ninh.', to: '/kien-thuc/bao-cao-thi-truong-bat-dong-san-2026-xu-huong-va-co-hoi' },
      { badge: 'Quy hoạch', badgeTone: 'blue', icon: 'fa-solid fa-map-location-dot', title: 'Hướng Dẫn Tra Cứu Quy Hoạch Chỉ Giới Xây Dựng Biệt Thự Liền Kề', desc: 'Kiểm tra chỉ giới xây dựng, mật độ và hành lang bảo vệ ven sông hồ.', to: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { badge: 'Đặt cọc an toàn', badgeTone: 'amber', icon: 'fa-solid fa-file-signature', title: 'Mẫu Hợp Đồng Đặt Cọc Mua Bán Biệt Thự Giá Trị Lớn Chuẩn Pháp Lý', desc: 'Các điều khoản phong tỏa tài sản, bồi thường cọc và lộ trình công chứng chuẩn.', to: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua biệt thự xây thô chưa hoàn công trong khu đô thị${citySuffix ? ` tại ${cityName}` : ''} cần lưu ý gì?`,
        a: `Biệt thự xây thô chuyển nhượng theo Hợp đồng mua bán cần có xác nhận chưa nộp hồ sơ cấp sổ của chủ đầu tư, kiểm tra người bán đã hoàn tất thanh toán theo tiến độ đến 95% hay chưa và xem trước chi phí ước tính để hoàn thiện mặt ngoài/nội thất theo đúng mẫu kiến trúc quy định của dự án.`
      },
      {
        q: `Biệt thự ven sông có bị ảnh hưởng hành lang bảo vệ bờ sông không?`,
        a: `Có. Các dự án ven sông phải tuân thủ khoảng lùi hành lang bảo vệ bờ sông (thường từ 10m - 50m tùy cấp sông). Cần kiểm tra bản đồ quy hoạch 1/500 để chắc chắn phần công trình nhà ở nằm hoàn toàn trên phần đất ở hợp pháp ngoài hành lang bảo vệ.`
      },
      {
        q: `Nên chọn nhà liền kề hay biệt thự song lập để giữ giá tốt hơn?`,
        a: `Nhà liền kề có tổng giá trị đầu tư vừa phải hơn nên tính thanh khoản chuyển nhượng cao hơn; trong khi biệt thự song lập/đơn lập ven sông có độ khan hiếm cực cao, giữ giá vượt trội trong dài hạn 5 - 10 năm.`
      },
      {
        q: `Phí công chứng và lệ phí trước bạ khi mua biệt thự tính như thế nào?`,
        a: `Lệ phí trước bạ vẫn là 0.5% giá trị hợp đồng (hoặc theo bảng giá đất và suất vốn đầu tư xây dựng nhà ở do UBND tỉnh ban hành), còn phí công chứng áp dụng theo biểu lũy tiến giá trị tài sản theo Thông tư hiện hành.`
      }
    ]
  },

  land: {
    label: 'Đất Thổ Cư, Đất Nền',
    shortLabel: 'đất nền, đất thổ cư',
    priceUnit: 'tr/m²',
    tableCols: ['Đất hẻm / KDC hiện hữu', 'Đất đường quy hoạch 5.5 - 7.5m', 'Đất mặt tiền / Trục lớn', 'Khu vực sôi động'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['38 - 65 tr/m²', '65 - 115 tr/m²', '120 - 260 tr/m²'], hotspots: 'TP. Thủ Đức, Củ Chi, Bình Chánh, Nhà Bè' },
        { area: 'Hà Nội', cols: ['35 - 68 tr/m²', '70 - 130 tr/m²', '140 - 280 tr/m²'], hotspots: 'Đông Anh, Hoài Đức, Gia Lâm, Long Biên, Hà Đông' },
        { area: 'Đà Nẵng', cols: ['22 - 42 tr/m²', '38 - 68 tr/m²', '70 - 145 tr/m²'], hotspots: 'Nam Hòa Xuân, Hòa Xuân, Liên Chiểu, Hòa Vang' },
        { area: 'Quảng Nam (Điện Bàn - Tam Kỳ)', cols: ['10 - 18 tr/m²', '18 - 35 tr/m²', '38 - 75 tr/m²'], hotspots: 'Ven sông Cổ Cò, Điện Ngọc, Hội An, Núi Thành' },
        { area: 'Bình Dương & Đồng Nai', cols: ['14 - 26 tr/m²', '25 - 45 tr/m²', '48 - 90 tr/m²'], hotspots: 'Thuận An, Dĩ An, Bến Cát, Long Thành, Nhơn Trạch' }
      ]
    },
    scaleFactor: [0.55, 0.85, 1.25],
    marketFocus: 'sau giai đoạn thanh lọc mạnh và quy định siết phân lô bán nền tại các đô thị từ loại III trở lên theo Luật Kinh doanh BĐS 2023, nguồn cung đất nền có sẵn Sổ đỏ riêng ngày càng khan hiếm. Những lô đất thổ cư 100% (ODT/ONT), pháp lý sạch, hạ tầng điện nước đồng bộ và nằm gần các đại công trình giao thông (Vành đai, Cao tốc, Cảng biển, KCN) đang dẫn dắt làn sóng phục hồi bền vững năm 2026.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Mua Đất Nền, Đất Thổ Cư',
    legalSteps: [
      { title: 'Kiểm tra bản gốc Sổ đỏ & Loại đất (ODT / ONT hay CLN)', text: 'Phân biệt rõ đất ở đô thị/nông thôn (ODT/ONT được phép xây dựng ngay) với đất trồng cây lâu năm (CLN) hoặc đất nông nghiệp. Kiểm tra thời hạn sử dụng đất và thông tin quy chủ trang 1 - trang 4.' },
      { title: 'Tra cứu quy hoạch 1/500, Chỉ giới đường đỏ & Đất xen kẹt', text: 'Mang bản sao Sổ đỏ kiểm tra tại Chi nhánh Văn phòng Đăng ký Đất đai xem thửa đất có dính quy hoạch công viên, hành lang lưới điện, mở đường hay không qua ', linkText: 'hướng dẫn tra cứu quy hoạch đất đai trực tuyến', linkTo: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { title: 'Đo đạc cắm mốc ranh giới thực tế & Kiểm tra tranh chấp giáp ranh', text: 'Thuê đơn vị đo đạc địa chính hoặc cán bộ địa chính kiểm tra diện tích thực tế, đóng cọc ranh giới rõ ràng với các hộ liền kề để tránh đất bị chồng ranh hoặc thiếu diện tích so với sổ.' },
      { title: 'Kiểm tra UCHI & Ký hợp đồng đặt cọc ghi rõ cam kết thổ cư/tách thửa', text: 'Ràng buộc trách nhiệm hoàn cọc 100% và bồi thường cọc nếu đất dính quy hoạch thu hồi hoặc không đủ điều kiện tách thửa sang tên trong ', linkText: 'mẫu hợp đồng đặt cọc mua bán chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Đàm phán giá', badgeTone: 'emerald', icon: 'fa-solid fa-handshake', title: 'Bí Quyết Thương Lượng Giá Đất Nền Mua Được Giá Rẻ Hơn Thị Trường 10%', desc: 'Cách định giá so sánh theo m², phát hiện nhược điểm phong thủy/quy hoạch để đàm phán khéo.', to: '/kien-thuc/bi-quyet-thuong-luong-gia-dat-nen' },
      { badge: 'Quy hoạch đất đai', badgeTone: 'blue', icon: 'fa-solid fa-map-location-dot', title: 'Hướng Dẫn Tra Cứu Quy Hoạch Đất Đai Trực Tuyến Chuẩn 63 Tỉnh Thành', desc: 'Cách đọc bản đồ sử dụng đất, ký hiệu ONT/ODT/LUK/CLN tránh mất trắng khi xuống tiền.', to: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
      { badge: 'Pháp lý đặt cọc', badgeTone: 'amber', icon: 'fa-solid fa-file-signature', title: 'Mẫu Hợp Đồng Đặt Cọc Mua Bán Đất Nền Chuẩn Pháp Lý Chống Lật Kèo', desc: 'Điều khoản bắt buộc khi mua đất chờ tách sổ, đất đồng sở hữu hoặc đất có thế chấp.', to: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua đất nền${citySuffix ? ` tại ${cityName}` : ''} cần kiểm tra ký hiệu loại đất nào trên Sổ đỏ để được phép xây nhà?`,
        a: `Trên Giấy chứng nhận quyền sử dụng đất (Sổ đỏ), phần Mục đích sử dụng đất phải ghi rõ là "Đất ở tại đô thị" (ODT) hoặc "Đất ở tại nông thôn" (ONT) với thời hạn sử dụng Lâu dài thì mới được xin giấy phép xây dựng nhà ở hợp pháp ngay.`
      },
      {
        q: `Có nên mua đất đồng sở hữu (chung sổ) hoặc đất mua bằng giấy tay / vi bằng không?`,
        a: `Tuyệt đối hạn chế. Mua đất bằng vi bằng không làm phát sinh quyền sử dụng đất hợp pháp và không thể sang tên sổ đỏ; còn mua đất chung sổ rất dễ phát sinh tranh chấp khi muốn bán, tách thửa hoặc thế chấp vay ngân hàng do phải có chữ ký đồng thuận của tất cả đồng sở hữu.`
      },
      {
        q: `Thời gian chuyển nhượng sang tên Sổ đỏ đất nền mất bao lâu và gồm những loại thuế nào?`,
        a: `Thời gian giải quyết tại Văn phòng Đăng ký Đất đai thông thường từ 10 đến 15 ngày làm việc. Thuế phí cơ bản gồm Thuế TNCN 2% (bên bán), Lệ phí trước bạ 0.5% (bên mua) và phí thẩm định cấp đổi sổ.`
      },
      {
        q: `Làm sao chọn được lô đất nền có tiềm năng tăng giá và thanh khoản tốt năm 2026?`,
        a: `Ưu tiên tiêu chí "Nhất cận thị, nhị cận giang, tam cận lộ": Đã có Sổ đỏ riêng cầm tay, đường bê tông/nhựa ô tô ra vào rộng từ 5m trở lên, gần khu dân cư hiện hữu hoặc đón đầu quy hoạch hạ tầng kết nối KCN, sân bay, đường vành đai.`
      }
    ]
  },

  'project-land': {
    label: 'Đất Nền Dự Án',
    shortLabel: 'đất nền dự án',
    priceUnit: 'tr/m²',
    tableCols: ['Đường nội khu (5.5m - 7.5m)', 'Đường lớn / Công viên (10.5m - 15m)', 'Trục chính KĐT / Lô góc', 'Dự án / KĐT tiêu biểu'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh & Vùng Đông', cols: ['38 - 65 tr/m²', '65 - 115 tr/m²', '115 - 240 tr/m²'], hotspots: 'Long Phước Thủ Đức, Phú Mỹ Hưng, Cần Giờ' },
        { area: 'Đồng Nai & Bình Dương', cols: ['18 - 32 tr/m²', '32 - 55 tr/m²', '58 - 95 tr/m²'], hotspots: 'Century City Long Thành, EcoLakes Bến Cát, VSIP' },
        { area: 'Đà Nẵng', cols: ['28 - 46 tr/m²', '48 - 82 tr/m²', '85 - 150 tr/m²'], hotspots: 'KĐT Hòa Xuân, Nam Hòa Xuân, Golden Hills, FPT City' },
        { area: 'Quảng Nam (Điện Bàn - Cổ Cò)', cols: ['15 - 26 tr/m²', '26 - 45 tr/m²', '48 - 82 tr/m²'], hotspots: 'Viêm Đông, KĐT Rosa, Điện Ngọc, Vịnh An Hòa' },
        { area: 'Khánh Hòa & Hải Phòng', cols: ['22 - 38 tr/m²', '38 - 65 tr/m²', '68 - 110 tr/m²'], hotspots: 'Golden Bay Cam Ranh, Bắc Sông Cấm Thủy Nguyên' }
      ],
      danang: [
        { area: 'Cẩm Lệ (KĐT Hòa Xuân)', cols: ['38 - 55 tr/m²', '58 - 85 tr/m²', '88 - 145 tr/m²'], hotspots: 'Đảo 1, Đảo VIP, trục Võ Chí Công - Nguyễn Phước Lan' },
        { area: 'Ngũ Hành Sơn (Nam Hòa Xuân & FPT)', cols: ['32 - 48 tr/m²', '50 - 75 tr/m²', '78 - 135 tr/m²'], hotspots: 'Nam Hòa Xuân, FPT City, ven sông Cổ Cò' },
        { area: 'Liên Chiểu (Golden Hills & Tây Bắc)', cols: ['22 - 34 tr/m²', '35 - 52 tr/m²', '55 - 88 tr/m²'], hotspots: 'Golden Hills, Lakeside Infinity, Trục Mê Linh' }
      ],
      quangnam: [
        { area: 'TX. Điện Bàn (KĐT ven sông Cổ Cò & Viêm Đông)', cols: ['16 - 26 tr/m²', '28 - 45 tr/m²', '48 - 78 tr/m²'], hotspots: 'KĐT Viêm Đông, KĐT Rosa, Đất Quảng Riverside, Điện Ngọc' },
        { area: 'Huyện Núi Thành & TP. Tam Kỳ', cols: ['13 - 22 tr/m²', '22 - 35 tr/m²', '38 - 62 tr/m²'], hotspots: 'Vịnh An Hòa City, KĐT Tây Bắc Tam Kỳ' }
      ]
    },
    scaleFactor: [0.62, 0.92, 1.32],
    marketFocus: 'hiệu lực Luật Kinh doanh Bất động sản 2023 và Luật Đất đai 2024 tiếp tục thanh lọc mạnh thị trường đất nền dự án khi siết quy định phân lô bán nền tại đô thị loại đặc biệt, I, II, III. Nhờ đó, những dự án quy hoạch chi tiết 1/500 đã hoàn thiện 100% hạ tầng điện âm - vỉa hè, hoàn thành nghĩa vụ tiền sử dụng đất và sẵn Sổ đỏ từng lô quanh các đại công trình giao thông (Sân bay Long Thành, Vành đai 3, Vành đai 4, Bắc Sông Cấm, Cổ Cò) trở thành tâm điểm hút dòng tiền đầu tư bền vững năm 2026.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Mua Đất Nền Dự Án',
    legalSteps: [
      {
        title: 'Kiểm tra Phê duyệt Quy hoạch 1/500 & Nghĩa vụ tiền sử dụng đất',
        text: 'Yêu cầu xem Quyết định giao đất/cho thuê đất, Quyết định phê duyệt đồ án quy hoạch chi tiết tỷ lệ 1/500 và biên lai xác nhận chủ đầu tư đã hoàn thành 100% tiền sử dụng đất dự án.'
      },
      {
        title: 'Thẩm định hạ tầng kỹ thuật nghiệm thu & Điều kiện mở bán',
        text: 'Kiểm tra văn bản nghiệm thu hoàn thành hạ tầng kỹ thuật (đường nhựa, vỉa hè, điện nước âm, PCCC, kết nối thoát nước) và thông báo của Sở Xây dựng xác nhận dự án đủ điều kiện chuyển nhượng quyền sử dụng đất.'
      },
      {
        title: 'Xác minh Sổ đỏ từng nền & Văn bản giải chấp ngân hàng',
        text: 'Nếu chuyển nhượng thứ cấp, đối chiếu bản gốc Sổ đỏ riêng từng lô (mục đích sử dụng đất ở ODT/ONT) và yêu cầu văn bản giải chấp ngân hàng nếu toàn khu dự án từng được chủ đầu tư thế chấp.',
        linkText: 'tra cứu quy hoạch trực tuyến 63 tỉnh thành',
        linkTo: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai'
      },
      {
        title: 'Ký Hợp đồng chuyển nhượng / Đặt cọc chuẩn bảo vệ quyền lợi',
        text: 'Tuyệt đối tránh các phiếu giữ chỗ mập mờ, hợp đồng góp vốn tại dự án chưa đủ điều kiện pháp lý; luôn công chứng và ràng buộc rõ điều khoản hoàn cọc 100% qua ',
        linkText: 'mẫu hợp đồng đặt cọc chuẩn pháp lý',
        linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly'
      }
    ],
    guides: [
      {
        badge: 'Khảo sát dự án',
        badgeTone: 'emerald',
        icon: 'fa-solid fa-map-location-dot',
        title: 'Khảo Sát Giá Đất Nền Dự Án Đón Sóng Hạ Tầng Vành Đai & Đô Thị Mới',
        desc: 'Phân tích biên độ tăng giá theo tiến độ hạ tầng khu đô thị và yếu tố thanh khoản thực tế.',
        to: '/kien-thuc/gia-dat-nen-quan-9-2027'
      },
      {
        badge: 'Đàm phán & Pháp lý',
        badgeTone: 'blue',
        icon: 'fa-solid fa-handshake',
        title: 'Bí Quyết Thương Lượng & Tra Cứu Quy Hoạch 1/500 Trước Khi Xuống Tiền',
        desc: 'Cách kiểm tra chỉ giới đường, diện tích cây xanh công cộng và định giá lô góc/lô thường.',
        to: '/kien-thuc/bi-quyet-thuong-luong-gia-dat-nen'
      },
      {
        badge: 'Hợp đồng đặt cọc',
        badgeTone: 'amber',
        icon: 'fa-solid fa-file-signature',
        title: 'Mẫu Hợp Đồng Đặt Cọc Mua Đất Nền Dự Án Đã Có Sổ Hoặc Chờ Sổ An Toàn',
        desc: 'Quy định phạt cọc, kiểm tra UCHI và điều khoản hoàn tiền 100% nếu vướng quy hoạch dự án.',
        to: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly'
      }
    ],
    faqsBuilder: (citySuffix, cityName) => [
      {
        q: `Mua đất nền dự án${citySuffix ? ` tại ${cityName}` : ''} cần kiểm tra những giấy tờ pháp lý cốt lõi nào?`,
        a: `Cần kiểm tra 4 văn bản bắt buộc: (1) Quyết định phê duyệt quy hoạch chi tiết 1/500; (2) Quyết định giao đất & chứng từ hoàn thành tiền sử dụng đất của chủ đầu tư; (3) Văn bản nghiệm thu hạ tầng kỹ thuật và thông báo đủ điều kiện chuyển nhượng của Sở Xây dựng/Sở Tài nguyên & Môi trường; (4) Sổ hồng riêng từng nền (hoặc văn bản giải chấp nếu đang thế chấp ngân hàng).`
      },
      {
        q: `Luật Kinh doanh BĐS 2023 siết phân lô bán nền tác động thế nào đến thị trường đất nền dự án năm 2026?`,
        a: `Quy định không cho phép phân lô bán nền tại các phường của đô thị loại đặc biệt, loại I, II và III khiến nguồn cung đất nền dự án mới tại các thành phố lớn giảm mạnh. Điều này làm tăng giá trị khan hiếm và thanh khoản cho các khu đô thị đã hoàn thiện hạ tầng và có sẵn Sổ đỏ từng lô trước thời điểm luật có hiệu lực.`
      },
      {
        q: `Có nên ký Hợp đồng góp vốn hoặc Thỏa thuận đặt chỗ đất nền dự án chưa có sổ từng lô không?`,
        a: `Rủi ro rất cao nếu dự án chưa hoàn tất nghĩa vụ tiền sử dụng đất hoặc chưa được Sở Xây dựng cho phép chuyển nhượng. Người mua ở thực hoặc đầu tư an toàn năm 2026 nên ưu tiên dự án đã ra Sổ đỏ từng lô công chứng sang tên được ngay hoặc dự án của chủ đầu tư lớn đã hoàn chỉnh hạ tầng 100%.`
      },
      {
        q: `Thủ tục sang tên Sổ đỏ đất nền dự án mất bao lâu và chi phí thuế thế nào?`,
        a: `Đối với đất nền dự án đã có Sổ đỏ từng lô, thời gian công chứng và đăng bộ sang tên tại Văn phòng Đăng ký Đất đai mất khoảng 10 - 15 ngày làm việc. Thuế phí cơ bản gồm Thuế TNCN 2% (bên bán), Lệ phí trước bạ 0.5% (bên mua) và lệ phí cấp đổi sổ mới.`
      }
    ]
  },
  'land-group': { alias: 'land', label: 'Đất Nền & Đất Thổ Cư', shortLabel: 'đất nền, đất thổ cư' },
  'house-group': { alias: 'house', label: 'Nhà Ở & Nhà Phố', shortLabel: 'nhà riêng, nhà phố, biệt thự' },

  condotel: {
    label: 'Condotel, Căn Hộ Nghỉ Dưỡng',
    shortLabel: 'condotel, căn hộ du lịch',
    priceUnit: 'tr/m²',
    tableCols: ['Studio nghỉ dưỡng (30 - 40m²)', 'Condotel 1PN - 2PN View Biển', 'Condotel Penthouse / Hạng sang', 'Quần thể du lịch nổi bật'],
    priceRanges: {
      national: [
        { area: 'Đà Nẵng (Biển Mỹ Khê - Non Nước)', cols: ['38 - 55 tr/m²', '55 - 88 tr/m²', '90 - 140 tr/m²'], hotspots: 'Võ Nguyên Giáp, Trường Sa, Sơn Trà' },
        { area: 'Khánh Hòa (Nha Trang - Cam Ranh)', cols: ['35 - 52 tr/m²', '52 - 82 tr/m²', '85 - 130 tr/m²'], hotspots: 'Trần Phú, Bãi Dài Cam Ranh' },
        { area: 'Kiên Giang (Phú Quốc) & Vũng Tàu', cols: ['34 - 50 tr/m²', '50 - 80 tr/m²', '85 - 125 tr/m²'], hotspots: 'Bãi Trường, Bãi Kem, Thùy Vân' },
        { area: 'Quảng Nam (Hội An - Nam Hội An)', cols: ['32 - 48 tr/m²', '48 - 72 tr/m²', '75 - 110 tr/m²'], hotspots: 'Cửa Đại, An Bàng, Duy Hải' }
      ]
    },
    scaleFactor: [0.55, 0.85, 1.15],
    marketFocus: 'Nghị định 10/2023/NĐ-CP và Luật Đất đai 2024 đã tháo gỡ hành lang pháp lý cho việc cấp Giấy chứng nhận quyền sở hữu công trình xây dựng gắn liền với đất thương mại dịch vụ cho căn hộ du lịch Condotel. Cùng sự phục hồi của lượng khách du lịch quốc tế năm 2026, phân khúc Condotel tại các thủ phủ biển như Đà Nẵng, Nha Trang, Phú Quốc, Hội An đang thu hút trở lại nhà đầu tư tìm kiếm thu nhập thụ động từ chia sẻ doanh thu vận hành.',
    legalTitlePrefix: '4 Bước Thẩm Định Pháp Lý Trước Khi Mua Condotel',
    legalSteps: [
      { title: 'Kiểm tra quyền cấp Sổ hồng công trình du lịch (Nghị định 10/2023)', text: 'Xác minh dự án đã hoàn thành nghĩa vụ tiền sử dụng đất thương mại dịch vụ và đủ điều kiện cấp Giấy chứng nhận quyền sở hữu gắn thời hạn sử dụng đất còn lại.' },
      { title: 'Thẩm định năng lực đơn vị vận hành & Hợp đồng chia sẻ lợi nhuận', text: 'Đọc kỹ tỷ lệ chia sẻ doanh thu/lợi nhuận ròng (80/20 hoặc doanh thu gộp), các khoản phí bảo trì, phí thương hiệu và quyền tự khai thác/lưu trú của chủ sở hữu.' },
      { title: 'Kiểm tra tình trạng thế chấp dự án & Nghiệm thu PCCC khách sạn', text: 'Yêu cầu văn bản giải chấp ngân hàng (nếu có) và xác nhận nghiệm thu hoàn công, phòng cháy chữa cháy tiêu chuẩn lưu trú du lịch.', linkText: 'xem thủ tục sang tên sổ hồng căn hộ', linkTo: '/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho' },
      { title: 'Ràng buộc điều khoản hoàn cọc & Phạt vi phạm trong Hợp đồng', text: 'Đảm bảo hợp đồng đặt cọc và chuyển nhượng có điều khoản bảo vệ quyền lợi rõ ràng qua ', linkText: 'mẫu hợp đồng đặt cọc chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
    ],
    guides: [
      { badge: 'Pháp lý sổ hồng', badgeTone: 'emerald', icon: 'fa-solid fa-hotel', title: 'Thủ Tục Sang Tên Sổ Hồng Căn Hộ & Tài Sản Gắn Liền Đất Du Lịch', desc: 'Cập nhật quy định cấp sổ cho Condotel theo Nghị định 10 và Luật Đất đai mới.', to: '/kien-thuc/thu-tuc-sang-ten-so-hong-can-ho' },
      { badge: 'Thị trường', badgeTone: 'blue', icon: 'fa-solid fa-chart-line', title: 'Báo Cáo Thị Trường BĐS Du Lịch & Nghỉ Dưỡng Việt Nam 2026', desc: 'Xu hướng công suất phòng tại Đà Nẵng, Hội An, Nha Trang và Phú Quốc.', to: '/kien-thuc/bao-cao-thi-truong-bat-dong-san-2026-xu-huong-va-co-hoi' },
      { badge: 'Tính tài chính', badgeTone: 'amber', icon: 'fa-solid fa-calculator', title: 'Công Cụ Tính Dòng Tiền & Lãi Suất Vay Mua BĐS Nghỉ Dưỡng', desc: 'So sánh lợi nhuận khai thác cho thuê du lịch với chi phí lãi vay hàng năm.', to: '/tinh-lai-vay' }
    ],
    faqsBuilder: () => [
      {
        q: 'Condotel có được cấp Sổ hồng hay không và thời hạn sở hữu là bao lâu?',
        a: 'Theo Nghị định 10/2023/NĐ-CP và Luật Đất đai 2024, Condotel xây dựng trên đất thương mại dịch vụ nếu đủ điều kiện sẽ được cấp Giấy chứng nhận quyền sở hữu công trình gắn liền với đất với thời hạn theo thời hạn dự án (thường 50 năm, được xem xét gia hạn khi hết hạn).'
      },
      {
        q: 'Nên chọn Condotel cam kết lợi nhuận hay chia sẻ doanh thu thực tế?',
        a: 'Thị trường năm 2026 ưa chuộng mô hình chia sẻ doanh thu/lợi nhuận thực tế gắn với đơn vị vận hành quốc tế uy tín vì phản ánh đúng sức khỏe kinh doanh thay vì cam kết ảo được cộng sẵn vào giá bán.'
      },
      {
        q: 'Chủ sở hữu Condotel có được đăng ký thường trú (hộ khẩu) tại căn hộ không?',
        a: 'Không. Condotel là loại hình căn hộ lưu trú du lịch thuộc đất thương mại dịch vụ nên chỉ dùng để nghỉ dưỡng, lưu trú ngắn hạn và kinh doanh cho thuê, không hình thành đơn vị ở để nhập hộ khẩu thường trú.'
      },
      {
        q: 'Chi phí chuyển nhượng lại Condotel gồm những khoản thuế gì?',
        a: 'Bên bán nộp Thuế TNCN 2% giá trị chuyển nhượng, bên mua nộp Lệ phí trước bạ 0.5% cùng phí xác nhận chuyển nhượng HĐMB hoặc sang tên sổ (nếu đã cấp giấy chứng nhận).'
      }
    ]
  },

  'farm-resort': { alias: 'land', label: 'Trang Trại, Khu Nghỉ Dưỡng', shortLabel: 'trang trại, BĐS nghỉ dưỡng' },
  warehouse: { alias: 'land', label: 'Kho, Nhà Xưởng', shortLabel: 'kho bãi, nhà xưởng' },
  other: { alias: 'all', label: 'Bất Động Sản Khác', shortLabel: 'nhà đất' }
};

/**
 * Resolve profile thực tế cho danh mục (hỗ trợ alias gọn sạch)
 */
const getSaleProfile = (propertyType) => {
  const norm = normalizeType(propertyType);
  if (norm === 'all') return null;
  const raw = SALE_CATEGORY_PROFILES[norm];
  if (!raw) return null;
  if (raw.alias) {
    const base = SALE_CATEGORY_PROFILES[raw.alias];
    return base ? { ...base, label: raw.label, shortLabel: raw.shortLabel } : null;
  }
  return raw;
};

/**
 * Tạo bảng giá động theo Quận/Huyện cho bất kỳ tỉnh thành nào dựa trên profile danh mục
 */
const buildProvincialCategoryBenchmarks = (province, scaleFactors, unit = 'tr/m²', isShophouseOrVilla = false) => {
  return province.districts.slice(0, 6).map((d, index) => {
    const baseMin = Math.max(12, (isShophouseOrVilla ? 55 : 46) - index * 5);
    const baseMax = Math.max(22, (isShophouseOrVilla ? 95 : 85) - index * 9);
    const cols = scaleFactors.map((factor) => {
      const min = Math.max(8, Math.round(baseMin * factor));
      const max = Math.max(min + 6, Math.round(baseMax * factor));
      return `${min} - ${max} ${unit}`;
    });
    const hotspots = (d.projects && d.projects.length > 0)
      ? d.projects.slice(0, 3).join(', ')
      : (d.streets && d.streets.length > 0 ? d.streets.slice(0, 3).join(', ') : d.name);
    return { area: d.name, cols, hotspots };
  });
};

/**
 * Lấy mô tả thị trường theo thành phố khi người dùng đang xem Danh mục tổng (All Nhà Đất)
 */
const GENERAL_SALE_CITY_CONTENT = {
  danang: {
    marketTitle: 'Thị Trường Mua Bán Nhà Đất Đà Nẵng Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
    marketDesc: 'Bước sang năm 2026, thị trường bất động sản Đà Nẵng bước vào chu kỳ phục hồi và bứt phá mạnh mẽ khi hàng loạt dự án hạ tầng giao thông quy mô lớn được đẩy nhanh tiến độ: Dự án Cảng Liên Chiểu, Mở rộng Sân bay Quốc tế Đà Nẵng, Cầu Quảng Đà và quy hoạch trung tâm tài chính quốc tế ven biển. Đà Nẵng thu hút mạnh mẽ dòng vốn đầu tư cho phân khúc căn hộ ven sông Hàn, đất nền ven biển và nhà phố thương mại tại Hải Châu, Sơn Trà, Ngũ Hành Sơn và Cẩm Lệ.',
    priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Đà Nẵng [2026]',
    tableHeaders: ['Khu vực / Quận Huyện', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: [
      { area: 'Hải Châu (Trung tâm)', cols: ['110 - 220 tr/m²', '45 - 85 tr/m²', '90 - 160 tr/m²'], hotspots: 'Bạch Đằng, Nguyễn Văn Linh, 2/9' },
      { area: 'Sơn Trà (Du lịch biển)', cols: ['85 - 170 tr/m²', '40 - 75 tr/m²', '70 - 130 tr/m²'], hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, An Hải Bắc' },
      { area: 'Ngũ Hành Sơn (Nghỉ dưỡng)', cols: ['65 - 130 tr/m²', '38 - 68 tr/m²', '50 - 95 tr/m²'], hotspots: 'Nam Hòa Xuân, Khuê Mỹ, Non Nước' },
      { area: 'Cẩm Lệ (Đô thị mới)', cols: ['45 - 85 tr/m²', '30 - 45 tr/m²', '35 - 65 tr/m²'], hotspots: 'KĐT Hòa Xuân, Khuê Trung, Cầu Đỏ' },
      { area: 'Thanh Khê (Thương mại bán lẻ)', cols: ['70 - 140 tr/m²', '35 - 55 tr/m²', '55 - 95 tr/m²'], hotspots: 'Điện Biên Phủ, Nguyễn Tất Thành, Dũng Sĩ' },
      { area: 'Liên Chiểu (Đón sóng hạ tầng)', cols: ['38 - 75 tr/m²', '28 - 42 tr/m²', '30 - 55 tr/m²'], hotspots: 'Cảng Liên Chiểu, Hòa Khánh, Nguyễn Lương Bằng' },
      { area: 'Hòa Vang (Đất nền sinh thái)', cols: ['22 - 45 tr/m²', '-', '15 - 35 tr/m²'], hotspots: 'Hòa Châu, Hòa Phước, Hòa Tiến' }
    ],
    faqs: [
      { q: 'Có nên mua nhà đất Đà Nẵng năm 2026 và khu vực nào có tiềm năng tăng trưởng tốt nhất?', a: 'Năm 2026 là thời điểm tốt để mua nhà đất Đà Nẵng nhờ mặt bằng giá tích lũy ổn định và hạ tầng bứt phá: Liên Chiểu (đón sóng Cảng biển quốc tế), Nam Hòa Xuân / Ngũ Hành Sơn (đô thị sinh thái ven sông) và Hải Châu (nhà phố kinh doanh dòng tiền).' },
      { q: 'Người ngoại tỉnh (Hà Nội, TP.HCM...) mua nhà đất tại Đà Nẵng cần lưu ý những thủ tục gì?', a: 'Người ngoại tỉnh có quyền đứng tên sổ hồng nhà đất Đà Nẵng hoàn toàn bình thường. Cần kiểm tra quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện và tình trạng ngăn chặn giao dịch qua hệ thống UCHI trước khi cọc.' },
      { q: 'Mua căn hộ chung cư hay đất nền thổ cư tại Đà Nẵng có tính thanh khoản cao hơn?', a: 'Căn hộ ven sông Hàn và ven biển Mỹ Khê có thanh khoản cho thuê tốt (6% - 8%/năm). Trong khi đất nền tại các khu đô thị quy hoạch bài bản (Hòa Xuân, Nam Hòa Xuân, Golden Hills) có biên độ tăng giá vốn dài hạn mạnh mẽ.' },
      { q: 'Lệ phí trước bạ và thuế chuyển nhượng nhà đất tại Đà Nẵng nộp ở đâu?', a: 'Sau khi ký công chứng, hồ sơ được nộp tại Bộ phận Một cửa Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện tại Đà Nẵng. Thuế TNCN (2%) và Lệ phí trước bạ (0.5%) nộp tại Kho bạc Nhà nước hoặc ngân hàng được ủy nhiệm thu.' }
    ]
  },
  hanoi: {
    marketTitle: 'Thị Trường Mua Bán Nhà Đất Hà Nội Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
    marketDesc: 'Thị trường bất động sản Thủ đô Hà Nội năm 2026 duy trì sức cầu ở thực cực kỳ bền vững. Các dự án phát triển đường Vành đai 4, các cây cầu mới bắc qua sông Hồng cùng việc hoàn thiện mạng lưới metro đô thị tiếp tục thúc đẩy giá trị bất động sản tại các quận nội thành và đô thị vệ tinh phía Tây, phía Đông.',
    priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Hà Nội [2026]',
    tableHeaders: ['Khu vực / Quận Huyện', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: [
      { area: 'Cầu Giấy & Nam Từ Liêm', cols: ['160 - 280 tr/m²', '55 - 95 tr/m²', '120 - 220 tr/m²'], hotspots: 'Duy Tân, Mễ Trì, Trung Hòa Nhân Chính' },
      { area: 'Tây Hồ & Ba Đình', cols: ['220 - 450 tr/m²', '75 - 140 tr/m²', '180 - 350 tr/m²'], hotspots: 'Quảng An, Xuân Diệu, Liễu Giai' },
      { area: 'Đống Đa & Thanh Xuân', cols: ['140 - 250 tr/m²', '50 - 85 tr/m²', '110 - 190 tr/m²'], hotspots: 'Thái Hà, Nguyễn Trãi, Lê Văn Lương' },
      { area: 'Hà Đông & Hoàng Mai', cols: ['90 - 170 tr/m²', '38 - 65 tr/m²', '70 - 130 tr/m²'], hotspots: 'Văn Quán, Linh Đàm, Yên Nghĩa' },
      { area: 'Long Biên & Gia Lâm', cols: ['85 - 165 tr/m²', '42 - 70 tr/m²', '60 - 110 tr/m²'], hotspots: 'Vinhomes Ocean Park, Việt Hưng' }
    ],
    faqs: [
      { q: 'Người mua nhà đất Hà Nội lần đầu cần kiểm tra những gì để tránh rủi ro?', a: 'Bắt buộc kiểm tra sổ đỏ gốc, đo vẽ diện tích thực tế để tránh lấn chiếm ngõ ngách, tra cứu quy hoạch tại Sở Quy hoạch - Kiến trúc Hà Nội và xác minh tình trạng thế chấp sổ đỏ.' },
      { q: 'Giá nhà đất Hà Nội năm 2026 có xu hướng tăng hay giảm?', a: 'Phân khúc chung cư trung - cao cấp cùng nhà riêng ngõ ô tô tại Hà Nội duy trì đà tăng ổn định 8% - 12%/năm nhờ nguồn cung mới nội đô khan hiếm.' },
      { q: 'Thủ tục sang tên sổ đỏ tại Hà Nội mất bao lâu?', a: 'Thời gian đăng bộ sang tên sổ đỏ tại Văn phòng Đăng ký Đất đai Hà Nội kéo dài khoảng 10 đến 15 ngày làm việc kể từ ngày nộp đủ hồ sơ hợp lệ.' },
      { q: 'Làm thế nào để tìm nhà chính chủ giá tốt tại Hà Nội trên Kênh Nhà Đất 24H?', a: 'Sử dụng bộ lọc Quận/Huyện, mức giá phù hợp và tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để kết nối trực tiếp người bán.' }
    ]
  },
  hcm: {
    marketTitle: 'Thị Trường Mua Bán Nhà Đất TP. Hồ Chí Minh Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
    marketDesc: 'TP. Hồ Chí Minh tiếp tục là thị trường bất động sản sôi động nhất cả nước. Tuyến Metro số 1 Bến Thành - Suối Tiên vận hành ổn định cùng tiến độ Vành đai 3 và kết nối sân bay Long Thành tạo xung lực mạnh cho bất động sản tại TP. Thủ Đức, khu Nam Quận 7 và khu Tây Bình Tân.',
    priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại TP. Hồ Chí Minh [2026]',
    tableHeaders: ['Khu vực / Quận Huyện', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: [
      { area: 'Quận 1 & Quận 3 (Trung tâm)', cols: ['320 - 750 tr/m²', '95 - 220 tr/m²', '280 - 600 tr/m²'], hotspots: 'Bến Nghé, Đa Kao, Võ Thị Sáu' },
      { area: 'TP. Thủ Đức (Đô thị sáng tạo)', cols: ['110 - 250 tr/m²', '50 - 110 tr/m²', '70 - 160 tr/m²'], hotspots: 'Thảo Điền, An Phú, Vạn Phúc City' },
      { area: 'Quận 7 & Nhà Bè (Khu Nam)', cols: ['95 - 210 tr/m²', '45 - 90 tr/m²', '65 - 130 tr/m²'], hotspots: 'Phú Mỹ Hưng, Nguyễn Hữu Thọ, Huỳnh Tấn Phát' },
      { area: 'Bình Thạnh & Phú Nhuận', cols: ['130 - 240 tr/m²', '52 - 85 tr/m²', '100 - 180 tr/m²'], hotspots: 'Phan Xích Long, Điện Biên Phủ, D2' },
      { area: 'Gò Vấp & Tân Bình', cols: ['85 - 165 tr/m²', '40 - 65 tr/m²', '65 - 120 tr/m²'], hotspots: 'Quang Trung, Cộng Hòa, Phan Huy Ích' }
    ],
    faqs: [
      { q: 'Mua nhà đất TP.HCM năm 2026 nên chọn khu vực nào có tiềm năng sinh lời cao?', a: 'TP. Thủ Đức (hưởng lợi từ Metro số 1 và Vành đai 3), Quận 7 / Nhà Bè (đô thị sinh thái ổn định) và Bình Thạnh, Phú Nhuận (nhà phố có dòng tiền cho thuê tốt).' },
      { q: 'Quy trình kiểm tra quy hoạch nhà đất tại TP. Hồ Chí Minh như thế nào?', a: 'Tra cứu trực tuyến qua ứng dụng \'Thông tin quy hoạch TP.HCM\' của Sở Quy hoạch - Kiến trúc hoặc nộp phiếu xin thông tin quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai quận/huyện.' },
      { q: 'Chi phí mua bán chuyển nhượng nhà đất tại TP.HCM gồm những gì?', a: 'Bao gồm Thuế thu nhập cá nhân (2%), Lệ phí trước bạ (0.5%), Phí công chứng theo giá trị hợp đồng và Phí cấp đổi sổ mới (khoảng 1 - 2 triệu đồng).' },
      { q: 'Có nên mua căn hộ chung cư chưa có sổ hồng tại TP.HCM không?', a: 'Cần kiểm tra hợp đồng mua bán với chủ đầu tư, biên bản bàn giao nhà và giấy xác nhận chưa nộp hồ sơ xin cấp sổ để chuyển nhượng hợp đồng mua bán có công chứng an toàn.' }
    ]
  },
  quangnam: {
    marketTitle: 'Thị Trường Mua Bán Nhà Đất Quảng Nam Năm 2026: Diễn Biến & Tiềm Năng Bứt Phá',
    marketDesc: 'Năm 2026, thị trường bất động sản Quảng Nam đón xung lực mạnh từ khơi thông sông Cổ Cò kết nối Đà Nẵng - Hội An, trục ven biển Võ Chí Công (tuyến 129), cầu Quảng Đà nối Điện Bàn với Hòa Vang và quy hoạch Sân bay Chu Lai. Dòng tiền tập trung vào đất nền ven sông Cổ Cò (Điện Bàn), bất động sản di sản TP. Hội An và đất ở thực quanh TP. Tam Kỳ, KKT Chu Lai (Núi Thành).',
    priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Quảng Nam [2026]',
    tableHeaders: ['Khu vực / Quận Huyện', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: [
      { area: 'TP. Hội An (Di sản & Du lịch biển)', cols: ['85 - 180 tr/m²', '45 - 85 tr/m²', '40 - 95 tr/m²'], hotspots: 'Trần Phú, Cửa Đại, Cẩm An, Cẩm Châu' },
      { area: 'Thị xã Điện Bàn (Ven sông Cổ Cò)', cols: ['35 - 75 tr/m²', '22 - 38 tr/m²', '18 - 45 tr/m²'], hotspots: 'KĐT Rosa, Điện Ngọc, Điện Dương' },
      { area: 'TP. Tam Kỳ (Trung tâm hành chính)', cols: ['30 - 65 tr/m²', '18 - 28 tr/m²', '15 - 35 tr/m²'], hotspots: 'Hùng Vương, Phan Bội Châu, Vịnh An Hòa' },
      { area: 'Huyện Duy Xuyên (Ven Hoiana)', cols: ['22 - 45 tr/m²', '-', '14 - 32 tr/m²'], hotspots: 'Duy Hải, Duy Nghĩa, Nam Phước' },
      { area: 'Huyện Thăng Bình', cols: ['18 - 35 tr/m²', '-', '10 - 25 tr/m²'], hotspots: 'Bình Minh, Bình Dương, Hà Lam' },
      { area: 'Huyện Núi Thành (KKT Chu Lai)', cols: ['18 - 40 tr/m²', '15 - 24 tr/m²', '12 - 28 tr/m²'], hotspots: 'Tam Hiệp, Vịnh An Hòa City, Kỳ Hà' }
    ],
    faqs: [
      { q: 'Mua đất nền dự án ven sông Cổ Cò (Điện Bàn - Quảng Nam) năm 2026 cần lưu ý pháp lý gì?', a: 'Ưu tiên dự án đã có Sổ hồng từng lô hoặc hoàn thành 100% nghĩa vụ tài chính, nghiệm thu hạ tầng kỹ thuật theo Luật Đất đai 2024; tránh hợp đồng góp vốn tại dự án chưa đủ điều kiện mở bán.' },
      { q: 'Thủ tục sang tên chuyển nhượng nhà đất tại Quảng Nam nộp ở đâu và mất bao lâu?', a: 'Nộp tại Bộ phận Một cửa Chi nhánh Văn phòng Đăng ký Đất đai tại TP. Hội An, TX. Điện Bàn, TP. Tam Kỳ hoặc các huyện thuộc tỉnh Quảng Nam. Thời hạn giải quyết 10 - 15 ngày làm việc.' },
      { q: 'Người ngoài tỉnh (Đà Nẵng, Hà Nội, TP.HCM...) có được đứng tên mua nhà đất tại Quảng Nam không?', a: 'Hoàn toàn được đứng tên quyền sử dụng đất và quyền sở hữu nhà ở tại Quảng Nam bình thường theo quy định pháp luật.' },
      { q: 'Khu vực nào tại Quảng Nam có tiềm năng thanh khoản cao nhất năm 2026?', a: 'TP. Hội An (khai thác cho thuê du lịch), TX. Điện Bàn (liên kết đô thị Nam Đà Nẵng - sông Cổ Cò) và TP. Tam Kỳ - Núi Thành (công nghiệp Chu Lai).' }
    ]
  },
  national: {
    marketTitle: 'Thị Trường Mua Bán Nhà Đất Toàn Quốc Năm 2026: Diễn Biến & Xu Hướng',
    marketDesc: 'Bước sang năm 2026, thị trường bất động sản Việt Nam chứng kiến bước chuyển mình mạnh mẽ khi bộ ba luật sửa đổi gồm Luật Đất đai 2024, Luật Nhà ở 2023 và Luật Kinh doanh Bất động sản 2023 đi vào thực thi đồng bộ. Dòng tiền đầu tư đang tập trung có chọn lọc vào các sản phẩm phục vụ nhu cầu ở thực, pháp lý minh bạch có sẵn sổ hồng, và các dự án phát triển theo mô hình đô thị tích hợp gắn liền với hạ tầng giao thông kết nối liên vùng.',
    priceTableTitle: 'Khung Giá Nhà Đất Tham Khảo Tại Các Tỉnh/Thành Phố Trọng Điểm [2026]',
    tableHeaders: ['Khu vực / Tỉnh thành', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: [
      { area: 'TP. Hồ Chí Minh', cols: ['95 - 180 tr/m²', '48 - 95 tr/m²', '45 - 85 tr/m²'], hotspots: 'Thủ Đức, Quận 7, Bình Thạnh, Gò Vấp' },
      { area: 'Hà Nội', cols: ['110 - 210 tr/m²', '45 - 90 tr/m²', '50 - 100 tr/m²'], hotspots: 'Cầu Giấy, Nam Từ Liêm, Hà Đông, Long Biên' },
      { area: 'Đà Nẵng', cols: ['45 - 95 tr/m²', '35 - 65 tr/m²', '30 - 60 tr/m²'], hotspots: 'Hải Châu, Sơn Trà, Ngũ Hành Sơn, Liên Chiểu' },
      { area: 'Bình Dương & Đồng Nai', cols: ['35 - 65 tr/m²', '28 - 42 tr/m²', '20 - 45 tr/m²'], hotspots: 'Thuận An, Dĩ An, TP. Thủ Dầu Một, Biên Hòa' }
    ],
    faqs: [
      { q: 'Người mua nhà đất lần đầu cần chuẩn bị những thủ tục pháp lý quan trọng nào?', a: 'Thực hiện 4 bước cốt lõi: (1) Kiểm tra bản gốc Sổ đỏ/Sổ hồng và đối chiếu CCCD; (2) Tra cứu quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai; (3) Kiểm tra ngăn chặn giao dịch UCHI tại Văn phòng Công chứng; (4) Ký hợp đồng đặt cọc có điều khoản hoàn cọc 100% nếu vướng quy hoạch.' },
      { q: 'Chi phí thuế và lệ phí sang tên chuyển nhượng nhà đất bên nào chịu?', a: 'Bên bán chịu Thuế TNCN (2% giá trị chuyển nhượng); Bên mua chịu Lệ phí trước bạ (0.5%) cùng phí thẩm định và cấp đổi phôi sổ (1 - 2 triệu đồng), hoặc theo thỏa thuận riêng trong hợp đồng.' },
      { q: 'Có nên vay ngân hàng mua nhà đất trong năm 2026 và tỷ lệ vay bao nhiêu là an toàn?', a: 'Lãi suất ưu đãi cố định 12 - 24 tháng phổ biến ở mức 5.5% - 7.5%/năm. Tỷ lệ vay an toàn nhất từ 30% - 50% giá trị tài sản, nghĩa vụ trả nợ không vượt quá 35% - 40% thu nhập hàng tháng.' },
      { q: 'Làm thế nào để tìm kiếm nhà đất chính chủ, pháp lý minh bạch trên Kênh Nhà Đất 24H?', a: 'Sử dụng bộ lọc đa năng theo Tỉnh thành, Quận huyện, Mức giá, Diện tích và bật bộ lọc \'Tin chính chủ / Đã xác thực\' để kết nối trực tiếp tin đăng đã được kiểm duyệt thông tin.' }
    ]
  }
};

const DEFAULT_LEGAL_STEPS = (cityLabel) => [
  { title: 'Kiểm tra bản gốc Sổ đỏ / Sổ hồng', text: 'Tuyệt đối không giao dịch qua bản photo. Soi kỹ hoa văn phôi sổ, đối chiếu số CCCD gắn chip của chủ nhà có khớp với tên người đứng quyền sử dụng đất trên trang 1 và trang 2.' },
  { title: 'Tra cứu quy hoạch & Lộ giới đường đỏ', text: `Mang bản sao sổ đỏ đến Bộ phận Một cửa Chi nhánh Văn phòng Đăng ký Đất đai ${cityLabel ? `tại ${cityLabel}` : 'cấp quận/huyện'} hoặc tra cứu nhanh qua `, linkText: 'hướng dẫn tra cứu quy hoạch đất đai trực tuyến', linkTo: '/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai' },
  { title: 'Xác minh tranh chấp & Ngăn chặn giao dịch', text: `Hỏi thăm các hộ lân cận về tranh chấp ranh giới, lối đi chung và nhờ Văn phòng Công chứng kiểm tra dữ liệu ngăn chặn UCHI ${cityLabel || ''} xem tài sản có bị kê biên hay không.` },
  { title: 'Ký hợp đồng đặt cọc có điều khoản bảo vệ', text: 'Bắt buộc ghi rõ điều khoản hoàn trả 100% tiền cọc nếu phát hiện vướng quy hoạch hoặc không công chứng được qua ', linkText: 'mẫu hợp đồng đặt cọc mua bán chuẩn pháp lý', linkTo: '/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly' }
];

const DEFAULT_GUIDES = [
  { badge: 'Cẩm nang nổi bật', badgeTone: 'emerald', icon: 'fa-solid fa-house-circle-check', title: 'Cẩm Nang Mua Nhà Lần Đầu Từ A - Z Cho Vợ Chồng Trẻ Năm 2026', desc: 'Quy tắc tích lũy vốn 50-30-20, kiểm soát nợ vay 28/36 và so sánh chung cư vs nhà phố.', to: '/kien-thuc/cam-nang-mua-nha-lan-dau' },
  { badge: 'Tín dụng & Lãi suất', badgeTone: 'blue', icon: 'fa-solid fa-percent', title: 'Lãi Suất Vay Mua Nhà 2026: Bảng So Sánh Ngân Hàng & Kịch Bản Ứng Phó', desc: 'Cập nhật lãi suất ưu đãi Big 4, giải mã bẫy lãi thả nổi và 3 kịch bản tái cấu trúc dòng tiền.', to: '/kien-thuc/lai-suat-vay-mua-nha-2026' },
  { badge: 'Công cụ tài chính', badgeTone: 'amber', icon: 'fa-solid fa-calculator', title: 'Công Cụ Tính Lãi Suất Vay Mua Nhà Trực Tuyến Tự Động', desc: 'Mô phỏng chính xác tiền gốc và lãi trả hàng tháng theo dư nợ giảm dần hoặc niên kim cố định.', to: '/tinh-lai-vay' }
];

/**
 * Xây dựng dữ liệu internal Silo Discovery Links theo chiến lược Topical Authority:
 * - Khi đang xem một phân khúc cụ thể ở toàn quốc (VD: /ban-can-ho-chung-cu):
 *   Ưu tiên liên kết phân nhánh cùng phân khúc tại 5 đô thị trọng điểm + 1 phân khúc anh em (VD: Chung cư mini) -> giữ chặt dòng sức mạnh Silo!
 * - Khi đang ở trang Tổng hợp hoặc đã lọc thành phố: Liên kết theo các phân khúc thuộc thành phố đó.
 */
const buildSaleDiscoveryLinks = ({ activeCity, propertyType, profile }) => {
  const norm = normalizeType(propertyType);
  if (!activeCity && profile && norm !== 'all') {
    const topCities = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Khánh Hòa'];
    const anchorPrefix = profile.anchorLabel || profile.shortLabel;
    const links = topCities.map((c) => ({
      name: `Bán ${anchorPrefix} ${c}`,
      path: buildSeoUrl({ demand: 'sale', propertyType: norm, city: c })
    }));
    const siblingMap = {
      apartment: { type: 'mini-apartment', name: 'Bán chung cư mini, căn hộ dịch vụ' },
      'mini-apartment': { type: 'apartment', name: 'Bán căn hộ chung cư' },
      land: { type: 'project-land', name: 'Bán đất nền dự án' },
      'project-land': { type: 'land-group', name: 'Bán đất thổ cư, đất nền' },
      'land-group': { type: 'project-land', name: 'Bán đất nền dự án' },
      house: { type: 'street-house', name: 'Bán nhà mặt phố' },
      'house-group': { type: 'villa', name: 'Bán biệt thự liền kề' },
      'street-house': { type: 'shophouse', name: 'Bán shophouse' },
      shophouse: { type: 'street-house', name: 'Bán nhà mặt phố' },
      villa: { type: 'house', name: 'Bán nhà riêng' }
    };
    const sibling = siblingMap[norm] || { type: 'apartment', name: 'Bán căn hộ chung cư' };
    links.push({
      name: sibling.name,
      path: buildSeoUrl({ demand: 'sale', propertyType: sibling.type })
    });
    return {
      title: `Khám Phá ${profile.label} Đang Bán Tại Các Đô Thị Trọng Điểm`,
      links
    };
  }

  const cityNameSuffix = activeCity ? ` ${activeCity}` : '';
  const cityParam = activeCity || null;
  return {
    title: activeCity ? `Khám Phá Nhà Đất Tại ${activeCity} Theo Phân Khúc` : 'Khám Phá Nhà Đất Bán Theo Phân Khúc',
    links: [
      { name: `Bán căn hộ chung cư${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'apartment', city: cityParam }) },
      { name: `Bán nhà riêng${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'house', city: cityParam }) },
      { name: `Bán nhà mặt phố${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'street-house', city: cityParam }) },
      { name: `Bán đất nền thổ cư${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'land', city: cityParam }) },
      { name: `Bán biệt thự liền kề${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'villa', city: cityParam }) },
      { name: `Bán shophouse${cityNameSuffix}`, path: buildSeoUrl({ demand: 'sale', propertyType: 'shophouse', city: cityParam }) }
    ]
  };
};

/**
 * Phân tích và chuẩn hóa nhãn cho các tiêu chí bộ lọc chuẩn SEO (Giá, Diện tích, Số phòng ngủ)
 */
const resolveFacetFilterLabels = ({ priceRange, priceLabel, areaRange, areaLabel, bedroom, taxonomyInfo } = {}) => {
  // 1. Nhãn mức giá
  let cleanPrice = priceLabel || taxonomyInfo?.priceLabel || '';
  const effPriceRange = (priceRange && priceRange !== 'all')
    ? priceRange
    : (taxonomyInfo?.priceRange && taxonomyInfo.priceRange !== 'all' ? taxonomyInfo.priceRange : null);
  if (!cleanPrice && effPriceRange) {
    const dynBetween = String(effPriceRange).match(/^([0-9.]+)([bm])-([0-9.]+)([bm])$/i);
    if (dynBetween) {
      const minUnit = dynBetween[2].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
      const maxUnit = dynBetween[4].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
      const v1 = parseFloat(dynBetween[1]);
      const v2 = parseFloat(dynBetween[3]);
      cleanPrice = minUnit === maxUnit ? `giá từ ${v1} đến ${v2} ${maxUnit}` : `giá từ ${v1} ${minUnit} đến ${v2} ${maxUnit}`;
    } else {
      const pText = formatPriceRangeText(effPriceRange);
      if (pText && pText !== 'Mọi mức giá') {
        cleanPrice = `giá ${pText.charAt(0).toLowerCase() + pText.slice(1)}`;
      }
    }
  }

  // 2. Nhãn diện tích
  let cleanArea = areaLabel || taxonomyInfo?.areaLabel || '';
  const effAreaRange = (areaRange && areaRange !== 'all')
    ? areaRange
    : (taxonomyInfo?.areaRange && taxonomyInfo.areaRange !== 'all' ? taxonomyInfo.areaRange : null);
  if (!cleanArea && effAreaRange) {
    const aText = formatAreaRangeText(effAreaRange);
    if (aText && aText !== 'Mọi diện tích') {
      cleanArea = `diện tích ${aText.charAt(0).toLowerCase() + aText.slice(1)}`;
    }
  }

  // 3. Nhãn phòng ngủ
  const effBedroom = (bedroom && bedroom !== 'all')
    ? bedroom
    : (taxonomyInfo?.bedroom && taxonomyInfo.bedroom !== 'all' ? taxonomyInfo.bedroom : null);
  const cleanBedroom = effBedroom ? `${effBedroom} phòng ngủ` : '';

  const filterParts = [];
  if (cleanPrice) filterParts.push(cleanPrice);
  if (cleanArea) filterParts.push(cleanArea);
  if (cleanBedroom) filterParts.push(cleanBedroom);

  const hasFacetFilters = filterParts.length > 0;
  const filterSuffix = hasFacetFilters ? `, ${filterParts.join(', ')}` : '';

  return {
    cleanPrice,
    cleanArea,
    cleanBedroom,
    filterParts,
    hasFacetFilters,
    filterSuffix
  };
};

/**
 * Tạo danh sách internal linking Silo thông minh khi người dùng đang ở trang bộ lọc sâu
 */
const buildFacetedDiscoveryLinks = ({ demand = 'sale', propertyType = null, activeCity = null, profile = null } = {}) => {
  const isRent = demand === 'rent';
  const norm = normalizeType(propertyType);
  const cParam = activeCity || null;
  const cSuffix = activeCity ? ` ${activeCity}` : '';

  const links = [];
  if (isRent) {
    links.push(
      { name: `Giá dưới 3 triệu${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: 'under-3m' }) },
      { name: `Giá 3 - 5 triệu${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: '3m-5m' }) },
      { name: `Giá 5 - 10 triệu${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: '5m-10m' }) },
      { name: `Diện tích 30 - 50 m²${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, areaRange: '30-50' }) },
      { name: `Diện tích 50 - 80 m²${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, areaRange: '50-80' }) },
      { name: `Căn 1 phòng ngủ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, bedroom: '1' }) },
      { name: `Căn 2 phòng ngủ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, bedroom: '2' }) },
      { name: `Căn 3 phòng ngủ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, bedroom: '3' }) }
    );
  } else {
    links.push(
      { name: `Giá dưới 2 tỷ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: 'under-2b' }) },
      { name: `Giá 2 - 5 tỷ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: '2b-5b' }) },
      { name: `Giá 5 - 10 tỷ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, priceRange: '5b-10b' }) },
      { name: `Diện tích 50 - 100 m²${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, areaRange: '50-100' }) },
      { name: `Diện tích 100 - 200 m²${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, areaRange: '100-200' }) },
      { name: `Căn 2 phòng ngủ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, bedroom: '2' }) },
      { name: `Căn 3 phòng ngủ${cSuffix}`, path: buildSeoUrl({ demand, propertyType: norm, city: cParam, bedroom: '3' }) }
    );
  }
  return {
    title: `Khám Phá ${profile?.label || 'Bất Động Sản'} Theo Khoảng Giá & Bộ Lọc Đề Xuất`,
    links
  };
};

/**
 * Trả về trọn bộ dữ liệu On-Page SEO cho SaleListingsSeoContent
 */
export const buildSaleSeoContentData = ({
  activeCity = null,
  district = null,
  propertyType = null,
  priceRange = null,
  priceLabel = null,
  areaRange = null,
  areaLabel = null,
  bedroom = null,
  taxonomyInfo = null
} = {}) => {
  const cityCtx = resolveCityContext(activeCity);
  const profile = getSaleProfile(propertyType);
  const isSpecificCity = cityCtx.key !== 'national';
  const locHeader = isSpecificCity ? 'Khu vực / Quận Huyện' : 'Khu vực / Tỉnh thành';
  const cityDisplay = cityCtx.displayName;
  const norm = normalizeType(propertyType);

  const facet = resolveFacetFilterLabels({
    priceRange,
    priceLabel,
    areaRange,
    areaLabel,
    bedroom,
    taxonomyInfo
  });

  const effDistrict = district || taxonomyInfo?.district || null;
  const locationLabel = effDistrict
    ? `tại ${effDistrict}${activeCity ? `, ${cityDisplay}` : ''}`
    : (isSpecificCity ? `tại ${cityDisplay}` : 'toàn quốc');

  const discovery = facet.hasFacetFilters
    ? buildFacetedDiscoveryLinks({ demand: 'sale', propertyType: norm, activeCity: isSpecificCity ? cityDisplay : null, profile })
    : buildSaleDiscoveryLinks({ activeCity: isSpecificCity ? cityDisplay : null, propertyType, profile });

  // Trường hợp 1: Có phân khúc cụ thể (VD: /ban-can-ho-chung-cu hoặc /ban-can-ho-chung-cu-da-nang)
  if (profile) {
    const marketTitle = facet.hasFacetFilters
      ? `Thị Trường Mua Bán ${profile.label} ${locationLabel}${facet.filterSuffix} Năm 2026: Diễn Biến & Kinh Nghiệm`
      : `Thị Trường Mua Bán ${profile.label} ${isSpecificCity ? cityDisplay : 'Toàn Quốc'} Năm 2026: Diễn Biến & Xu Hướng`;

    let cityIntro = '';
    if (facet.hasFacetFilters) {
      let priceInsight = '';
      if (facet.cleanPrice) {
        if (facet.cleanPrice.includes('dưới 2') || facet.cleanPrice.includes('dưới 1') || facet.cleanPrice.includes('dưới 500')) {
          priceInsight = `Ở mức ${facet.cleanPrice}, đây là phân khúc nhà ở bình dân hoặc đất nền vùng ven đón sóng đầu tư hạ tầng; người mua cần thẩm định kỹ quy hoạch, tranh chấp và tính pháp lý sổ đỏ.`;
        } else if (facet.cleanPrice.includes('2 đến 3') || facet.cleanPrice.includes('2 đến 5') || facet.cleanPrice.includes('2 - 5')) {
          priceInsight = `Với tầm tài chính ${facet.cleanPrice}, phân khúc này là tâm điểm của nhu cầu an cư thực, thanh khoản tốt và được các ngân hàng thương mại hỗ trợ giải ngân gói vay mua nhà với lãi suất ưu đãi.`;
        } else if (facet.cleanPrice.includes('5 đến 10') || facet.cleanPrice.includes('5 - 10')) {
          priceInsight = `Trong tầm giá ${facet.cleanPrice}, người mua có thể sở hữu các bất động sản vị trí đắc địa, căn hộ cao cấp hoặc nhà riêng trung tâm với tiềm năng gia tăng giá trị ổn định theo thời gian.`;
        } else {
          priceInsight = `Phân khúc ${facet.cleanPrice} thuộc nhóm bất động sản giá trị cao, biệt thự và nhà mặt phố thương mại mang lại dòng tiền khai thác kinh doanh bền vững.`;
        }
      }

      let areaInsight = '';
      if (facet.cleanArea || facet.cleanBedroom) {
        const parts = [];
        if (facet.cleanArea) parts.push(facet.cleanArea);
        if (facet.cleanBedroom) parts.push(facet.cleanBedroom);
        areaInsight = `Với tiêu chí ${parts.join(' và ')}, việc kiểm tra hiện trạng hoàn công trên sổ hồng, mật độ xây dựng và cấu trúc chịu lực là yếu tố cốt lõi đảm bảo an toàn tài sản.`;
      }

      cityIntro = `Năm 2026, thị trường mua bán ${profile.shortLabel} ${locationLabel}${facet.filterSuffix} đang thu hút dòng vốn lớn nhờ các chính sách tháo gỡ pháp lý của Luật Đất đai 2024. ${priceInsight} ${areaInsight} Khuyến nghị từ Kênh Nhà Đất 24H: Người mua nên kiểm tra bản gốc giấy chứng nhận quyền sử dụng đất tại Văn phòng Đăng ký Đất đai, thẩm định giá thị trường thực tế và thực hiện thủ tục đặt cọc qua văn phòng công chứng hợp pháp.`;
    } else {
      cityIntro = isSpecificCity
        ? `Tại ${cityDisplay}, thị trường mua bán ${profile.shortLabel} năm 2026 ghi nhận sức hút lớn nhờ hạ tầng giao thông kết nối và quy hoạch đô thị đồng bộ. Xét trên bình diện chung, ${profile.marketFocus}`
        : `Bước sang năm 2026, phân khúc mua bán ${profile.shortLabel} trên toàn quốc chuyển dịch mạnh mẽ khi Luật Đất đai 2024, Luật Nhà ở 2023 và Luật Kinh doanh Bất động sản 2023 thực thi đồng bộ. Đặc biệt, ${profile.marketFocus}`;
    }

    const priceTableTitle = facet.hasFacetFilters
      ? `Khảo Sát Khung Giá Mua Bán ${profile.label} ${locationLabel}${facet.filterSuffix} [2026]`
      : (isSpecificCity
          ? `Khung Giá ${profile.label} Tham Khảo Từng Khu Vực Tại ${cityDisplay} [2026]`
          : `Khung Giá ${profile.label} Tham Khảo Tại Các Đô Thị Trọng Điểm [2026]`);

    const cityBenchmarks = profile.priceRanges[cityCtx.key];
    let benchmarks;
    if (cityBenchmarks) {
      benchmarks = cityBenchmarks;
    } else if (cityCtx.matchedProvince?.districts?.length) {
      benchmarks = buildProvincialCategoryBenchmarks(
        cityCtx.matchedProvince,
        profile.scaleFactor || [0.6, 0.85, 1.15],
        profile.priceUnit || 'tr/m²',
        ['shophouse', 'villa', 'street-house'].includes(normalizeType(propertyType))
      );
    } else {
      benchmarks = profile.priceRanges.national;
    }

    const legalTitle = `${profile.legalTitlePrefix}${isSpecificCity ? ` Tại ${cityDisplay}` : ''}`;
    const baseFaqs = profile.faqsBuilder(isSpecificCity, isSpecificCity ? cityDisplay : '');

    const facetFaqs = [];
    if (facet.hasFacetFilters) {
      facetFaqs.push({
        q: `Với tài chính ${facet.cleanPrice || 'hiện tại'}, người mua có thể sở hữu ${profile.shortLabel}${facet.cleanBedroom ? ` ${facet.cleanBedroom}` : ''}${facet.cleanArea ? ` ${facet.cleanArea}` : ''} ${locationLabel} không?`,
        a: `Hoàn toàn có thể. Năm 2026, các bất động sản ${profile.shortLabel}${facet.filterSuffix} ${locationLabel} có nguồn cung khá phong phú tại các dự án đô thị và khu dân cư quy hoạch đồng bộ. Người mua có thể chuẩn bị sẵn 30 - 50% vốn tự có và tận dụng các gói vay mua nhà hỗ trợ lãi suất từ ngân hàng để tối ưu dòng tiền.`
      });

      if (facet.cleanArea || facet.cleanBedroom) {
        facetFaqs.push({
          q: `Tiêu chuẩn thẩm định pháp lý và chất lượng công trình cho ${profile.shortLabel}${facet.cleanArea ? ` ${facet.cleanArea}` : ''}${facet.cleanBedroom ? ` ${facet.cleanBedroom}` : ''} gồm những gì?`,
          a: `Người mua cần kiểm tra kỹ: (1) Sổ hồng / Sổ đỏ chính chủ bản gốc, không nằm trong quy hoạch treo hoặc thế chấp ngân hàng chưa giải chấp; (2) Giấy phép xây dựng và biên bản hoàn công khớp đúng hiện trạng; (3) Hệ thống kỹ thuật điện nước, chất lượng tường chịu lực và độ chống thấm; (4) Khảo sát dân trí và an ninh khu vực lân cận.`
        });
      }

      facetFaqs.push({
        q: `Quy trình đặt cọc và công chứng sang tên phân khúc ${facet.cleanPrice || 'này'} thực hiện như thế nào để an toàn tuyệt đối?`,
        a: `Quy trình 3 bước chuẩn pháp lý: Bước 1 - Ký hợp đồng đặt cọc tại Văn phòng công chứng (tiền cọc từ 5 - 10% giá trị hợp đồng); Bước 2 - Hai bên ký hợp đồng chuyển nhượng công chứng và thanh toán đợt 2 (thường giữ lại 5% để chờ sổ); Bước 3 - Nộp hồ sơ sang tên tại Văn phòng Đăng ký Đất đai, nộp thuế TNCN và lệ phí trước bạ, nhận sổ hồng mang tên người mua mới.`
      });
    }

    const faqTitle = facet.hasFacetFilters
      ? `Câu Hỏi Thường Gặp Khi Mua Bán ${profile.label}${facet.filterSuffix} (FAQ)`
      : `Câu Hỏi Thường Gặp Khi Mua Bán ${profile.label}${isSpecificCity ? ` Tại ${cityDisplay}` : ''} (FAQ)`;

    return {
      marketTitle,
      marketDesc: cityIntro,
      priceTableTitle,
      tableHeaders: [locHeader, ...profile.tableCols],
      benchmarks,
      priceFootnote: `* Bảng giá ${profile.shortLabel} mang tính tham khảo thực tế đầu năm 2026, đơn giá có thể chênh lệch tùy dự án, vị trí tầng/hướng, hiện trạng nội thất và pháp lý sổ hồng.`,
      legalTitle,
      legalSteps: profile.legalSteps,
      guidesTitle: `Cẩm Nang Chuyên Sâu & Hướng Dẫn Mua ${profile.label} An Toàn`,
      guides: profile.guides,
      faqTitle,
      faqs: [...facetFaqs, ...baseFaqs],
      discoveryTitle: discovery.title,
      discoveryLinks: discovery.links
    };
  }

  // Trường hợp 2: Trang tổng hợp Mua Bán Nhà Đất (Toàn quốc hoặc theo Thành phố/Tỉnh)
  const presetCity = GENERAL_SALE_CITY_CONTENT[cityCtx.key];
  if (presetCity) {
    return {
      marketTitle: presetCity.marketTitle,
      marketDesc: presetCity.marketDesc,
      priceTableTitle: presetCity.priceTableTitle,
      tableHeaders: presetCity.tableHeaders,
      benchmarks: presetCity.benchmarks,
      priceFootnote: '* Bảng giá mang tính chất tham khảo thực tế tại thời điểm đầu năm 2026, đơn giá có thể thay đổi tùy thuộc vào vị trí hẻm, mặt tiền và hiện trạng xây dựng công trình.',
      legalTitle: `4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Xuống Tiền Mua Nhà Đất${isSpecificCity ? ` Tại ${cityDisplay}` : ''}`,
      legalSteps: DEFAULT_LEGAL_STEPS(isSpecificCity ? cityDisplay : null),
      guidesTitle: 'Cẩm Nang Tri Thức & Hướng Dẫn Mua Nhà An Toàn Từ Chuyên Gia',
      guides: DEFAULT_GUIDES,
      faqTitle: `Câu Hỏi Thường Gặp Khi Mua Bán Nhà Đất${isSpecificCity ? ` Tại ${cityDisplay}` : ''} (FAQ)`,
      faqs: presetCity.faqs,
      discoveryTitle: discovery.title,
      discoveryLinks: discovery.links
    };
  }

  // Trường hợp 3: Tỉnh thành khác trong 63 tỉnh thành (động từ VIETNAM_ADMINISTRATIVE_DATA)
  const prov = cityCtx.matchedProvince;
  const provBenchmarks = prov?.districts?.length
    ? prov.districts.slice(0, 7).map((d, index) => {
        const baseMin = Math.max(15, 60 - index * 6);
        const baseMax = Math.max(25, 110 - index * 12);
        const landMin = Math.max(10, Math.round(baseMin * 0.7));
        const landMax = Math.max(18, Math.round(baseMax * 0.7));
        const aptMin = index < 3 ? Math.max(18, Math.round(baseMin * 0.6)) : null;
        const aptMax = index < 3 ? Math.max(28, Math.round(baseMax * 0.55)) : null;
        const hotspots = (d.projects?.length ? d.projects : (d.streets || [d.name])).slice(0, 3).join(', ');
        return {
          area: d.name,
          cols: [`${baseMin} - ${baseMax} tr/m²`, aptMin ? `${aptMin} - ${aptMax} tr/m²` : '-', `${landMin} - ${landMax} tr/m²`],
          hotspots
        };
      })
    : GENERAL_SALE_CITY_CONTENT.national.benchmarks;

  return {
    marketTitle: `Thị Trường Mua Bán Nhà Đất ${cityDisplay} Năm 2026: Diễn Biến & Tiềm Năng Phát Triển`,
    marketDesc: `Thị trường bất động sản ${cityDisplay} năm 2026 ghi nhận bước chuyển mình tích cực nhờ hạ tầng giao thông kết nối liên vùng và hiệu lực của bộ ba Luật Đất đai 2024, Luật Nhà ở 2023 và Luật Kinh doanh Bất động sản 2023. Dòng tiền đầu tư tập trung vào phân khúc ở thực có sẵn sổ hồng tại trung tâm đô thị và khu vực phát triển công nghiệp, dịch vụ.`,
    priceTableTitle: `Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại ${cityDisplay} [2026]`,
    tableHeaders: ['Khu vực / Quận Huyện', 'Nhà phố / Mặt tiền', 'Căn hộ chung cư', 'Đất nền thổ cư', 'Khu vực sôi động'],
    benchmarks: provBenchmarks,
    priceFootnote: '* Bảng giá mang tính chất tham khảo thực tế tại thời điểm đầu năm 2026, đơn giá có thể thay đổi tùy thuộc vào vị trí hẻm, mặt tiền và hiện trạng xây dựng công trình.',
    legalTitle: `4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Mua Nhà Đất Tại ${cityDisplay}`,
    legalSteps: DEFAULT_LEGAL_STEPS(cityDisplay),
    guidesTitle: 'Cẩm Nang Tri Thức & Hướng Dẫn Mua Nhà An Toàn Từ Chuyên Gia',
    guides: DEFAULT_GUIDES,
    faqTitle: `Câu Hỏi Thường Gặp Khi Mua Bán Nhà Đất Tại ${cityDisplay} (FAQ)`,
    faqs: [
      { q: `Người mua nhà đất tại ${cityDisplay} lần đầu cần kiểm tra những thủ tục pháp lý nào?`, a: `Kiểm tra bản gốc Sổ đỏ/Sổ hồng, tra cứu thông tin quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai thuộc ${cityDisplay}, xác minh ngăn chặn giao dịch UCHI trước khi ký hợp đồng đặt cọc.` },
      { q: `Thủ tục sang tên chuyển nhượng sổ đỏ tại ${cityDisplay} nộp ở đâu?`, a: `Nộp tại Bộ phận Một cửa Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện/thị xã thuộc ${cityDisplay} sau khi công chứng hợp đồng mua bán. Thời hạn giải quyết 10 - 15 ngày làm việc.` },
      { q: `Chi phí thuế và lệ phí khi mua bán nhà đất tại ${cityDisplay} gồm những gì?`, a: `Gồm Thuế TNCN 2% (bên bán), Lệ phí trước bạ 0.5% (bên mua), phí thẩm định hồ sơ và lệ phí cấp đổi sổ mới (1 - 2 triệu đồng).` },
      { q: `Làm sao tìm được nhà đất chính chủ, giá tốt tại ${cityDisplay} trên Kênh Nhà Đất 24H?`, a: `Sử dụng bộ lọc Quận/Huyện tại ${cityDisplay}, khoảng giá, diện tích và bật bộ lọc 'Tin chính chủ / Đã xác thực'.` }
    ],
    discoveryTitle: discovery.title,
    discoveryLinks: discovery.links
  };
};

// ============================================================================
// CẤU HÌNH CHO THUÊ (RENT) ĐỒNG BỘ DANH MỤC + THÀNH PHỐ
// ============================================================================

const RENT_CATEGORY_PROFILES = {
  apartment: {
    label: 'Căn Hộ Chung Cư Cho Thuê',
    shortLabel: 'căn hộ chung cư',
    tableCols: ['Studio / 1PN (Đồ cơ bản)', 'Căn hộ 2PN (Full nội thất)', 'Căn hộ 3PN / Cao cấp', 'Dự án / Khu vực nổi bật'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['7 - 12 tr/tháng', '12 - 22 tr/tháng', '20 - 42 tr/tháng'], hotspots: 'TP. Thủ Đức, Quận 7, Bình Thạnh, Phú Nhuận' },
        { area: 'Hà Nội', cols: ['6.5 - 11 tr/tháng', '11 - 19 tr/tháng', '18 - 36 tr/tháng'], hotspots: 'Cầu Giấy, Nam Từ Liêm, Tây Hồ, Đống Đa' },
        { area: 'Đà Nẵng', cols: ['5.5 - 9.5 tr/tháng', '9 - 16 tr/tháng', '15 - 28 tr/tháng'], hotspots: 'Sơn Trà, Hải Châu, Ngũ Hành Sơn' },
        { area: 'Bình Dương & Đồng Nai', cols: ['4.5 - 7.5 tr/tháng', '7 - 12 tr/tháng', '11 - 18 tr/tháng'], hotspots: 'Thuận An, Dĩ An, Biên Hòa' }
      ],
      danang: [
        { area: 'Hải Châu (Trung tâm & Sông Hàn)', cols: ['7 - 11 tr/tháng', '11 - 18 tr/tháng', '18 - 32 tr/tháng'], hotspots: 'Bạch Đằng, 2/9, Trần Phú' },
        { area: 'Sơn Trà (Ven biển Mỹ Khê)', cols: ['6.5 - 10 tr/tháng', '10 - 17 tr/tháng', '16 - 30 tr/tháng'], hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, An Hải Bắc' },
        { area: 'Ngũ Hành Sơn & Cẩm Lệ', cols: ['5 - 8.5 tr/tháng', '8 - 14 tr/tháng', '13 - 22 tr/tháng'], hotspots: 'Khuê Mỹ, FPT City, Hòa Xuân' },
        { area: 'Thanh Khê & Liên Chiểu', cols: ['4.2 - 7 tr/tháng', '6.5 - 11 tr/tháng', '10 - 16 tr/tháng'], hotspots: 'Điện Biên Phủ, Bầu Tràm Lakeside' }
      ]
    },
    marketFocus: 'nhu cầu thuê căn hộ chung cư có sẵn nội thất, an ninh 24/7 và tiện ích hồ bơi, phòng gym tăng cao từ nhóm hộ gia đình trẻ, nhân sự văn phòng và chuyên gia nước ngoài. Giá thuê ổn định kết hợp chính sách thanh toán 1 - 3 tháng giúp người thuê dễ tối ưu dòng tiền sinh hoạt.',
    legalTitle: '4 Lưu Ý Quan Trọng Khi Ký Hợp Đồng Thuê Căn Hộ Chung Cư',
    legalSteps: [
      { title: 'Xác minh quyền cho thuê chính chủ & Tình trạng Sổ hồng', text: 'Kiểm tra Sổ hồng/HĐMB căn hộ khớp CCCD chủ nhà hoặc hợp đồng ủy quyền quản lý có công chứng trước khi đặt cọc.' },
      { title: 'Làm rõ phí quản lý, gửi xe & Biểu giá điện nước', text: 'Thỏa thuận rõ bên nào trả phí quản lý hàng tháng, chi phí slot đậu ô tô/xe máy và kiểm tra hóa đơn điện nước tính đúng theo biểu giá EVN.' },
      { title: 'Lập biên bản bàn giao nội thất chi tiết có hình ảnh', text: 'Chụp ảnh hiện trạng điều hòa, tủ lạnh, bếp từ, sàn gỗ trước khi nhận nhà để tránh tranh chấp khấu trừ cọc khi trả phòng.' },
      { title: 'Thủ tục đăng ký tạm trú & Điều khoản hoàn cọc 100%', text: 'Yêu cầu chủ nhà khai báo tạm trú qua Cổng dịch vụ công hoặc Công an phường và ghi rõ thời hạn hoàn trả tiền cọc trong 3 ngày sau khi thanh lý hợp đồng.' }
    ],
    faqsBuilder: (isCity, cityName) => [
      { q: `Thuê căn hộ chung cư${isCity ? ` tại ${cityName}` : ''} cần đặt cọc mấy tháng tiền nhà?`, a: `Thông thường mức đặt cọc là 1 đến 2 tháng tiền thuê tùy theo giá trị nội thất bàn giao và thanh toán hàng tháng hoặc 3 tháng/lần.` },
      { q: `Phí quản lý chung cư và tiền gửi xe do chủ nhà hay người thuê đóng?`, a: `Phí quản lý vận hành tòa nhà, phí gửi xe, điện nước và internet do người thuê trực tiếp chi trả theo mức sử dụng thực tế hàng tháng, trừ trường hợp hai bên thỏa thuận hợp đồng "giá thuê trọn gói".` },
      { q: `Người thuê căn hộ có tự đăng ký tạm trú được không?`, a: `Có. Chủ nhà hoặc người thuê (với sự đồng ý của chủ nhà và bản sao giấy tờ sở hữu) có thể khai báo tạm trú trực tuyến qua ứng dụng VNeID hoặc Cổng dịch vụ công cư trú.` },
      { q: `Khi trả nhà trước hạn hợp đồng thuê chung cư có bị mất cọc không?`, a: `Nếu đơn phương chấm dứt trước hạn ngoài điều khoản báo trước (thường 30 ngày) hoặc điều khoản bất khả kháng, tiền cọc có thể bị mất. Bạn nên thỏa thuận điều khoản được phép chuyển nhượng hợp đồng thuê (sang nhượng phòng) nếu thay đổi công tác.` }
    ]
  },
  'mini-apartment': {
    label: 'Chung Cư Mini, Căn Hộ Dịch Vụ Cho Thuê',
    shortLabel: 'chung cư mini, căn hộ dịch vụ',
    tableCols: ['Phòng Studio', 'Căn hộ dịch vụ 1 Phòng ngủ', 'Căn hộ dịch vụ 2 Phòng ngủ / Duplex', 'Khu vực sôi động'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['4.5 - 7.5 tr/tháng', '7 - 11 tr/tháng', '10 - 16 tr/tháng'], hotspots: 'Bình Thạnh, Tân Bình, Quận 1, Quận 7' },
        { area: 'Hà Nội', cols: ['3.8 - 6.5 tr/tháng', '6 - 9.5 tr/tháng', '8.5 - 14 tr/tháng'], hotspots: 'Cầu Giấy, Đống Đa, Thanh Xuân, Hai Bà Trưng' },
        { area: 'Đà Nẵng', cols: ['3.2 - 5.5 tr/tháng', '5 - 8 tr/tháng', '7 - 12 tr/tháng'], hotspots: 'Sơn Trà, Hải Châu, Ngũ Hành Sơn (An Thượng)' },
        { area: 'Bình Dương & Đồng Nai', cols: ['2.5 - 4.2 tr/tháng', '4 - 6.5 tr/tháng', '5.5 - 8.5 tr/tháng'], hotspots: 'Thuận An, Dĩ An, Biên Hòa' }
      ]
    },
    marketFocus: 'mô hình chung cư mini và căn hộ dịch vụ đầy đủ nội thất, giờ giấc tự do không chung chủ tiếp tục là lựa chọn số 1 của sinh viên và nhân sự trẻ tại các quận trung tâm. Người thuê năm 2026 ưu tiên đặc biệt các tòa nhà đạt chuẩn an toàn PCCC có thang thoát hiểm và hệ thống báo cháy riêng từng phòng.',
    legalTitle: '4 Lưu Ý Pháp Lý & An Toàn Khi Thuê Chung Cư Mini, Căn Hộ Dịch Vụ',
    legalSteps: [
      { title: 'Kiểm tra thực tế hệ thống PCCC & Lối thoát nạn thứ hai', text: 'Ưu tiên tòa nhà có thang thoát hiểm ngoài trời, cửa chống cháy tầng hầm xe máy và không bịt kín ban công bằng "chuồng cọp".' },
      { title: 'Chốt rõ đơn giá điện, nước, dịch vụ dọn phòng & gửi xe', text: 'Kiểm tra công tơ điện riêng từng phòng và hỏi rõ chi phí phát sinh như phí thang máy, vệ sinh chung, wifi trước khi cọc.' },
      { title: 'Ký hợp đồng trực tiếp với chủ tòa nhà hoặc đơn vị quản lý hợp pháp', text: 'Yêu cầu xem giấy ủy quyền quản lý vận hành nếu làm việc qua đơn vị khai thác thứ ba để tránh rủi ro tranh chấp tiền cọc.' },
      { title: 'Ghi nhận tình trạng thiết bị & Điều khoản hoàn cọc khi kết thúc', text: 'Kiểm tra vòi nước, máy lạnh, khóa vân tay ngay lúc nhận phòng và chốt rõ điều kiện hoàn cọc 100%.' }
    ],
    faqsBuilder: (isCity, cityName) => [
      { q: `Thuê chung cư mini${isCity ? ` tại ${cityName}` : ''} cần lưu ý tiêu chuẩn an toàn PCCC nào?`, a: `Kiểm tra cầu thang thoát hiểm khẩn cấp, bình chữa cháy tại hành lang, đầu báo khói tự động, lối ra từ tầng hầm để xe riêng biệt và van ngắt điện an toàn.` },
      { q: `Giá điện nước ở chung cư mini tính như thế nào?`, a: `Nhiều tòa nhà áp dụng đơn giá điện theo đồng hồ riêng từ 3.500 - 4.000đ/kWh (hoặc theo bậc EVN nếu có định mức) và tiền nước 20.000 - 30.000đ/m³ hoặc khoán theo người.` },
      { q: `Có nên đặt cọc giữ phòng chung cư mini qua chuyển khoản trước khi xem trực tiếp?`, a: `Tuyệt đối không chuyển cọc giữ phòng khi chưa đến xem trực tiếp căn phòng, kiểm tra hợp đồng thuê và đối chiếu thông tin chủ nhà.` },
      { q: `Thời hạn hợp đồng thuê căn hộ dịch vụ thường kéo dài bao lâu?`, a: `Phổ biến là 6 tháng đến 12 tháng với mức cọc 1 tháng tiền phòng.` }
    ]
  },
  house: {
    label: 'Nhà Riêng Nguyên Căn Cho Thuê',
    shortLabel: 'nhà riêng nguyên căn',
    tableCols: ['Nhà ngõ nhỏ / 2 - 3 PN', 'Nhà ngõ ô tô (3 - 4 tầng)', 'Nhà nguyên căn lớn / KĐT', 'Khu vực nổi bật'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['10 - 16 tr/tháng', '18 - 32 tr/tháng', '35 - 65 tr/tháng'], hotspots: 'Bình Thạnh, Gò Vấp, Phú Nhuận, TP. Thủ Đức' },
        { area: 'Hà Nội', cols: ['9 - 15 tr/tháng', '16 - 28 tr/tháng', '30 - 55 tr/tháng'], hotspots: 'Đống Đa, Cầu Giấy, Thanh Xuân, Hoàng Mai' },
        { area: 'Đà Nẵng', cols: ['7 - 12 tr/tháng', '12 - 22 tr/tháng', '22 - 40 tr/tháng'], hotspots: 'Hải Châu, Thanh Khê, Cẩm Lệ, Sơn Trà' },
        { area: 'Quảng Nam & Bình Dương', cols: ['5.5 - 9.5 tr/tháng', '10 - 17 tr/tháng', '18 - 32 tr/tháng'], hotspots: 'Hội An, Điện Bàn, Thuận An, Dĩ An' }
      ]
    },
    marketFocus: 'nhu cầu thuê nhà riêng nguyên căn phục vụ gia đình đông thành viên hoặc kết hợp ở và làm văn phòng/kho hàng online tăng ổn định. Lợi thế riêng tư, không chịu phí quản lý chung cư và tự chủ giờ giấc giúp phân khúc nhà nguyên căn hẻm ô tô luôn giữ tỷ lệ lấp đầy cao.',
    faqsBuilder: (isCity, cityName) => [
      { q: `Thuê nhà riêng nguyên căn${isCity ? ` tại ${cityName}` : ''} làm văn phòng hoặc kinh doanh online cần lưu ý gì?`, a: `Cần thỏa thuận rõ mục đích sử dụng trong hợp đồng thuê, kiểm tra chỗ đậu xe máy/ô tô trước nhà và xin xác nhận chủ nhà về việc đăng ký địa điểm kinh doanh/đặt biển hiệu công ty nếu cần.` },
      { q: `Ai chịu chi phí sửa chữa nhà nguyên căn nếu phát sinh hư hỏng?`, a: `Các hư hỏng kết cấu lớn (thấm dột mái, hệ thống điện nước âm tường) do chủ nhà chi trả; các thiết bị tiêu hao và sửa chữa nhỏ trong quá trình sử dụng do bên thuê đảm nhận.` },
      { q: `Thời hạn hợp đồng thuê nhà nguyên căn thường bao lâu?`, a: `Phổ biến từ 1 đến 3 năm với mức giữ giá cố định 12 - 24 tháng đầu để ổn định sinh hoạt gia đình hoặc hoạt động kinh doanh.` }
    ]
  },
  'house-rent-group': { alias: 'house', label: 'Nhà Nguyên Căn & Mặt Phố Cho Thuê', shortLabel: 'nhà nguyên căn, mặt phố' },
  'street-house': {
    label: 'Nhà Mặt Phố Cho Thuê',
    shortLabel: 'nhà mặt phố kinh doanh',
    tableCols: ['Mặt phố nhánh / Cửa hàng', 'Mặt tiền đường lớn', 'Mặt bằng góc / Hai mặt tiền', 'Tuyến phố sôi động'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['22 - 45 tr/tháng', '50 - 110 tr/tháng', '120 - 300 tr/tháng'], hotspots: 'Quận 1, Quận 3, Phan Xích Long, Cộng Hòa' },
        { area: 'Hà Nội', cols: ['20 - 42 tr/tháng', '45 - 95 tr/tháng', '100 - 250 tr/tháng'], hotspots: 'Thái Hà, Chùa Bộc, Cầu Giấy, Phố Huế' },
        { area: 'Đà Nẵng', cols: ['15 - 28 tr/tháng', '30 - 65 tr/tháng', '70 - 150 tr/tháng'], hotspots: 'Nguyễn Văn Linh, Lê Duẩn, Võ Nguyên Giáp' },
        { area: 'Quảng Nam & Bình Dương', cols: ['10 - 20 tr/tháng', '22 - 45 tr/tháng', '48 - 95 tr/tháng'], hotspots: 'Trần Phú Hội An, Hùng Vương, Yersin' }
      ]
    },
    marketFocus: 'nhà mặt phố vỉa hè rộng cho thuê phục vụ F&B, showroom, nha khoa và cửa hàng bán lẻ phục hồi mạnh mẽ theo sức tiêu dùng đô thị. Hợp đồng thuê thường kéo dài 3 - 5 năm với điều khoản trượt giá rõ ràng sau mỗi chu kỳ 2 năm.',
    faqsBuilder: (isCity, cityName) => [
      { q: `Thuê nhà mặt phố kinh doanh${isCity ? ` tại ${cityName}` : ''} nên ký hợp đồng mấy năm?`, a: `Nếu đầu tư sửa chữa nội thất và nhận diện thương hiệu, nên ký tối thiểu 3 - 5 năm và công chứng hợp đồng để bảo vệ quyền thuê khi đổi chủ sở hữu.` },
      { q: `Tiền cọc thuê mặt bằng mặt phố và chu kỳ tăng giá thông thường là bao nhiêu?`, a: `Mức cọc thường từ 3 đến 6 tháng, giữ giá trong 1 - 2 năm đầu và biên độ điều chỉnh tối đa không quá 10%/năm cho các năm tiếp theo.` },
      { q: `Có cần kiểm tra điều kiện PCCC và lộ giới vỉa hè khi thuê mặt bằng không?`, a: `Có. Đặc biệt với ngành F&B, spa, phòng khám cần kiểm tra quy định chỗ đậu xe vỉa hè, điện 3 pha và lối thoát hiểm PCCC trước khi ký cọc.` }
    ]
  },
  office: {
    label: 'Văn Phòng Cho Thuê',
    shortLabel: 'văn phòng, mặt bằng công ty',
    tableCols: ['Văn phòng hạng C (<100m²)', 'Văn phòng hạng B', 'Sàn hạng A / Nguyên tòa', 'Khu vực văn phòng'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['260 - 420 nghìn/m²', '450 - 780 nghìn/m²', '850 nghìn - 1.5 tr/m²'], hotspots: 'Quận 1, Quận 3, Phú Nhuận, Tân Bình' },
        { area: 'Hà Nội', cols: ['220 - 380 nghìn/m²', '400 - 680 nghìn/m²', '750 nghìn - 1.3 tr/m²'], hotspots: 'Cầu Giấy, Nam Từ Liêm, Đống Đa, Hoàn Kiếm' },
        { area: 'Đà Nẵng', cols: ['160 - 260 nghìn/m²', '280 - 450 nghìn/m²', '480 - 750 nghìn/m²'], hotspots: 'Hải Châu (Bạch Đằng, Nguyễn Văn Linh, 2/9)' }
      ]
    },
    marketFocus: 'xu hướng doanh nghiệp ưu tiên văn phòng tối ưu chi phí vận hành, sẵn vách ngăn kính, điều hòa trung tâm và gần các tuyến metro, trục tài chính trung tâm.',
    faqsBuilder: () => [
      { q: 'Thuê sàn văn phòng tòa nhà cần lưu ý những loại phí ngoài tiền thuê nào?', a: 'Ngoài giá thuê tính theo USD hoặc VNĐ/m², doanh nghiệp cần kiểm tra phí dịch vụ quản lý (thường 3 - 7 USD/m²), VAT 10%, phí làm việc ngoài giờ và hạn mức chỗ đậu xe miễn phí.' },
      { q: 'Chủ tòa nhà có hỗ trợ thời gian setup nội thất miễn phí (Fit-out) không?', a: 'Hầu hết các tòa nhà văn phòng hỗ trợ từ 15 đến 45 ngày miễn phí tiền thuê trong thời gian thi công nội thất tùy diện tích thuê.' }
    ]
  },
  room: {
    label: 'Phòng Trọ, Nhà Trọ Cho Thuê',
    shortLabel: 'phòng trọ, nhà trọ',
    tableCols: ['Phòng trọ cơ bản', 'Phòng gác lửng / Máy lạnh', 'Phòng khép kín cao cấp', 'Khu vực tập trung'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['2.2 - 3.5 tr/tháng', '3.5 - 5.2 tr/tháng', '5.2 - 7.5 tr/tháng'], hotspots: 'Bình Thạnh, Thủ Đức, Tân Bình, Quận 7' },
        { area: 'Hà Nội', cols: ['2.0 - 3.2 tr/tháng', '3.2 - 4.8 tr/tháng', '4.8 - 6.8 tr/tháng'], hotspots: 'Cầu Giấy, Thanh Xuân, Đống Đa, Hai Bà Trưng' },
        { area: 'Đà Nẵng', cols: ['1.6 - 2.5 tr/tháng', '2.5 - 3.8 tr/tháng', '3.8 - 5.5 tr/tháng'], hotspots: 'Liên Chiểu, Hải Châu, Sơn Trà, Cẩm Lệ' }
      ]
    },
    marketFocus: 'phân khúc phòng trọ gần các cụm đại học và khu công nghiệp duy trì nhu cầu cao quanh năm, ưu tiên phòng sạch sẽ có khóa vân tay, camera an ninh và lối thoát hiểm PCCC đảm bảo.',
    faqsBuilder: () => [
      { q: 'Khi đi xem phòng trọ cần kiểm tra ngay những yếu tố nào?', a: 'Kiểm tra sóng điện thoại/wifi trong phòng, áp lực nước vòi sen, ổ khóa an toàn, lối thoát hiểm PCCC và xác nhận đơn giá điện nước tính theo công tơ riêng.' },
      { q: 'Đặt cọc thuê phòng trọ bao nhiêu là hợp lý?', a: 'Thường đặt cọc tối đa 1 tháng tiền phòng và yêu cầu lập biên nhận/hợp đồng có chữ ký chủ nhà kèm bản chụp CCCD.' }
    ]
  },
  'commercial-space': { alias: 'street-house', label: 'Cửa Hàng, Mặt Bằng Kinh Doanh Cho Thuê', shortLabel: 'mặt bằng kinh doanh' },
  warehouse: {
    label: 'Kho, Nhà Xưởng Cho Thuê',
    shortLabel: 'kho xưởng, bến bãi',
    tableCols: ['Kho tiêu chuẩn (<500m²)', 'Kho xưởng 500 - 2.000m²', 'Kho KCN lớn (>2.000m²)', 'Khu công nghiệp / Giao thông'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh & Vệ tinh', cols: ['75 - 120 nghìn/m²', '85 - 135 nghìn/m²', '95 - 150 nghìn/m²'], hotspots: 'Bình Chánh, Củ Chi, Long An, Sóng Thần' },
        { area: 'Hà Nội & Bắc Ninh', cols: ['65 - 105 nghìn/m²', '75 - 120 nghìn/m²', '85 - 135 nghìn/m²'], hotspots: 'Long Biên, Gia Lâm, KCN Yên Phong, VSIP' },
        { area: 'Đà Nẵng & Quảng Nam', cols: ['50 - 80 nghìn/m²', '55 - 90 nghìn/m²', '65 - 105 nghìn/m²'], hotspots: 'KCN Hòa Khánh, KCN Liên Chiểu, Điện Nam - Điện Ngọc, Chu Lai' }
      ]
    },
    marketFocus: 'làn sóng thương mại điện tử và mở rộng chuỗi cung ứng giúp nhu cầu thuê kho vận logistics, xưởng sản xuất chuẩn PCCC đạt độ lấp đầy cao gần các trục quốc lộ và cảng biển.',
    discoveryCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Bình Dương', 'Đồng Nai', 'Đà Nẵng'],
    relatedLink: { name: 'Cho thuê đất, bãi đất kinh doanh', path: '/cho-thue-dat' },
    faqsBuilder: () => [
      { q: 'Thuê kho, nhà xưởng cần kiểm tra những tiêu chuẩn kỹ thuật nào?', a: 'Kiểm tra đường xe container 40 feet ra vào 24/24, chiều cao thông thủy trần kho, khả năng chịu tải nền bê tông, trạm biến áp điện 3 pha và nghiệm thu PCCC tự động.' },
      { q: 'Hợp đồng thuê kho xưởng dài hạn có cần xuất hóa đơn VAT không?', a: 'Doanh nghiệp đi thuê nên thỏa thuận rõ việc xuất hóa đơn VAT và tính hợp pháp của đất sản xuất kinh doanh (SKK/SKC) để hạch toán chi phí hợp lệ.' }
    ]
  },
  'farm-resort': {
    label: 'Trang Trại, Khu Nghỉ Dưỡng Cho Thuê',
    shortLabel: 'trang trại, khu nghỉ dưỡng',
    tableCols: ['Nhà vườn / Farmstay nhỏ (<1.000m²)', 'Trang trại sinh thái (1.000 - 5.000m²)', 'Khu nghỉ dưỡng / Resort (>5.000m²)', 'Địa bàn sinh thái nổi bật'],
    priceRanges: {
      national: [
        { area: 'Lâm Đồng (Đà Lạt, Bảo Lộc)', cols: ['12 - 25 tr/tháng', '25 - 55 tr/tháng', '60 - 150 tr/tháng'], hotspots: 'Tà Nung, Cầu Đất, Lạc Dương, Bảo Lộc' },
        { area: 'Đắk Lắk & Tây Nguyên', cols: ['8 - 18 tr/tháng', '18 - 38 tr/tháng', '45 - 95 tr/tháng'], hotspots: 'Buôn Ma Thuột, Cư M\'gar, Hồ Lắk, Gia Lai' },
        { area: 'Hà Nội & Vùng ven', cols: ['15 - 30 tr/tháng', '30 - 65 tr/tháng', '70 - 180 tr/tháng'], hotspots: 'Ba Vì, Sóc Sơn, Lương Sơn (Hòa Bình), Thạch Thất' },
        { area: 'Đà Nẵng & Quảng Nam', cols: ['10 - 22 tr/tháng', '22 - 48 tr/tháng', '50 - 120 tr/tháng'], hotspots: 'Hòa Vang (Hòa Bắc, Hòa Ninh), Hội An, Điện Bàn' },
        { area: 'Đồng Nai & Bà Rịa', cols: ['12 - 24 tr/tháng', '24 - 50 tr/tháng', '55 - 130 tr/tháng'], hotspots: 'Định Quán, Trảng Bom, Long Thành, Xuyên Mộc' }
      ],
      danang: [
        { area: 'Hòa Vang (Hòa Bắc & Hòa Ninh)', cols: ['10 - 20 tr/tháng', '20 - 45 tr/tháng', '45 - 110 tr/tháng'], hotspots: 'Ven sông Cu Đê, chân núi Bà Nà' },
        { area: 'Hòa Vang (Hòa Phú & Hòa Khương)', cols: ['8 - 18 tr/tháng', '18 - 40 tr/tháng', '40 - 95 tr/tháng'], hotspots: 'QL14G, KDL Ngầm Đôi, Suối Hoa' },
        { area: 'Sơn Trà & Ngũ Hành Sơn (Ven biển/sông)', cols: ['18 - 35 tr/tháng', '35 - 75 tr/tháng', '80 - 200 tr/tháng'], hotspots: 'Bán đảo Sơn Trà, ven sông Cổ Cò' }
      ],
      quangnam: [
        { area: 'TP. Hội An (Ven sông/biển)', cols: ['15 - 32 tr/tháng', '32 - 70 tr/tháng', '75 - 180 tr/tháng'], hotspots: 'Cẩm Thanh, Cẩm Châu, An Bàng' },
        { area: 'TX. Điện Bàn (Ven sông Cổ Cò)', cols: ['9 - 20 tr/tháng', '20 - 45 tr/tháng', '45 - 100 tr/tháng'], hotspots: 'Điện Dương, Điện Ngọc, bãi bồi ven sông' },
        { area: 'Duy Xuyên & Núi Thành', cols: ['7 - 16 tr/tháng', '16 - 35 tr/tháng', '35 - 80 tr/tháng'], hotspots: 'Gần KDL Mỹ Sơn, Tam Hải, Chu Lai' }
      ],
      hanoi: [
        { area: 'Ba Vì & Sơn Tây', cols: ['14 - 28 tr/tháng', '28 - 60 tr/tháng', '65 - 160 tr/tháng'], hotspots: 'Vân Hòa, Yên Bài, Suối Hai, Đá Chông' },
        { area: 'Sóc Sơn (Hồ sinh thái)', cols: ['15 - 30 tr/tháng', '30 - 65 tr/tháng', '70 - 170 tr/tháng'], hotspots: 'Hồ Đồng Đò, Hồ Kèo Cà, Minh Trí, Hiền Ninh' },
        { area: 'Thạch Thất & Quốc Oai', cols: ['12 - 25 tr/tháng', '25 - 55 tr/tháng', '60 - 140 tr/tháng'], hotspots: 'Hòa Lạc, Yên Bình, Đông Xuân' }
      ],
      hcm: [
        { area: 'Củ Chi & Hóc Môn', cols: ['12 - 25 tr/tháng', '25 - 50 tr/tháng', '55 - 130 tr/tháng'], hotspots: 'Ven sông Sài Gòn, Nhuận Đức, An Nhơn Tây' },
        { area: 'Cần Giờ (Sinh thái rừng mặn)', cols: ['10 - 22 tr/tháng', '22 - 45 tr/tháng', '50 - 120 tr/tháng'], hotspots: 'Bình Khánh, Long Hòa, Cần Thạnh' }
      ]
    },
    marketFocus: 'nhu cầu thuê trang trại sinh thái, nhà vườn farmstay, khu glamping nghỉ dưỡng chữa lành (wellness retreat) và homestay trải nghiệm nông nghiệp phát triển bùng nổ. Khách thuê ưu tiên các khu đất có cảnh quan tự nhiên đẹp, đường xe 16 - 29 chỗ vào tận nơi, nguồn điện nước ổn định và hợp đồng thuê dài hạn 5 - 10 năm để khấu hao chi phí đầu tư.',
    legalTitle: '4 Lưu Ý Pháp Lý Sống Còn Khi Thuê Trang Trại, Khu Nghỉ Dưỡng',
    legalSteps: [
      { title: 'Kiểm tra hiện trạng quy hoạch & Mục đích sử dụng đất', text: 'Xác minh rõ diện tích đất nông nghiệp (cây lâu năm/hàng năm), đất lâm nghiệp (rừng sản xuất) và tỷ lệ đất thổ cư (ONT/ODT). Tuyệt đối không thuê đất dính quy hoạch thu hồi hoặc đất rừng phòng hộ cấm khai thác du lịch.' },
      { title: 'Quy định dựng công trình tạm, bungalow & An toàn PCCC', text: 'Làm việc trực tiếp với chính quyền địa phương để nắm rõ quy chuẩn xây dựng công trình tiền chế, bungalow lắp ghép tháo dỡ và phương án nghiệm thu PCCC cơ sở lưu trú du lịch.' },
      { title: 'Thời hạn hợp đồng 5 - 10 năm & Điều khoản khấu hao tài sản', text: 'Kinh doanh farmstay nghỉ dưỡng đòi hỏi chi phí cải tạo cảnh quan lớn, hợp đồng thuê cần từ 5 đến 10 năm. Cần ghi rõ điều khoản bồi hoàn chi phí đầu tư nếu bên cho thuê đòi lại đất trước hạn.' },
      { title: 'Hạ tầng điện 3 pha, nước tưới tiêu & Đường giao thông', text: 'Khảo sát thực địa công suất trạm biến áp điện 3 pha, giếng khoan/nước tự nhiên và kiểm tra lộ giới đường xe khách ra vào tránh tranh chấp ngõ đi chung với cư dân bản địa.' }
    ],
    discoveryCities: ['Lâm Đồng', 'Đà Nẵng', 'Hà Nội', 'Quảng Nam', 'Khánh Hòa'],
    relatedLink: { name: 'Cho thuê biệt thự, villa nghỉ dưỡng', path: '/cho-thue-nha-biet-thu-lien-ke' },
    faqsBuilder: (isCity, cityName) => [
      {
        q: `Thuê đất trang trại làm farmstay nghỉ dưỡng${isCity ? ` tại ${cityName}` : ''} có cần chuyển mục đích lên đất thổ cư không?`,
        a: `Để xây dựng công trình lưu trú kiên cố (nhà hàng, lễ tân, phòng ngủ cao tầng), bạn bắt buộc phải có đất ở (thổ cư) hoặc đất thương mại dịch vụ (TMDV). Với mô hình lều glamping, nhà gỗ tiền chế có thể tháo dỡ, nhiều địa phương cho phép thí điểm kinh doanh nông nghiệp kết hợp du lịch sinh thái theo đề án được phê duyệt.`
      },
      {
        q: `Thời hạn thuê trang trại, khu nghỉ dưỡng tối ưu nhất để thu hồi vốn là bao lâu?`,
        a: `Thời gian thuê tối thiểu khuyến nghị từ 5 đến 10 năm. Năm đầu tiên thường dành cho cải tạo cảnh quan, đào hồ, phủ xanh và hoàn thiện pháp lý. Nên thỏa thuận mức trần tăng giá thuê không quá 5% - 10% sau mỗi 2 - 3 năm.`
      },
      {
        q: `Hợp đồng thuê trang trại nghỉ dưỡng có bắt buộc phải công chứng không?`,
        a: `Có. Với tài sản diện tích lớn, giá trị cao và thời hạn thuê dài trên 3 năm, việc công chứng hợp đồng thuê tại Văn phòng Công chứng là bắt buộc để đảm bảo giá trị pháp lý, chống lật kèo và đăng ký kinh doanh hợp lệ.`
      },
      {
        q: `Cần những giấy phép kinh doanh gì khi vận hành khu farmstay, resort nghỉ dưỡng?`,
        a: `Cần Giấy chứng nhận đăng ký doanh nghiệp/hộ kinh doanh ngành dịch vụ lưu trú du lịch, Chứng nhận đủ điều kiện an ninh trật tự (ANTT), Giấy chứng nhận thẩm duyệt/nghiệm thu PCCC và Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm.`
      }
    ]
  },
  villa: {
    label: 'Biệt Thự, Liền Kề Cho Thuê',
    shortLabel: 'biệt thự, villa nghỉ dưỡng',
    tableCols: ['Villa liền kề / Song lập', 'Biệt thự đơn lập sân vườn', 'Villa cao cấp / Có hồ bơi', 'Khu đô thị / Vị trí nổi bật'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['28 - 50 tr/tháng', '45 - 90 tr/tháng', '80 - 180 tr/tháng'], hotspots: 'Thảo Điền, Phú Mỹ Hưng, An Phú, Vạn Phúc City' },
        { area: 'Hà Nội', cols: ['25 - 45 tr/tháng', '40 - 85 tr/tháng', '75 - 160 tr/tháng'], hotspots: 'Tây Hồ, Starlake, Vinhomes Riverside, Ciputra' },
        { area: 'Đà Nẵng', cols: ['20 - 35 tr/tháng', '35 - 65 tr/tháng', '60 - 130 tr/tháng'], hotspots: 'Euro Village, Nam Việt Á, Ocean Villas, Furama' },
        { area: 'Quảng Nam (Hội An)', cols: ['18 - 32 tr/tháng', '30 - 55 tr/tháng', '50 - 110 tr/tháng'], hotspots: 'Cẩm Thanh, Cẩm An, An Bàng, ven sông Hoài' }
      ]
    },
    marketFocus: 'nhu cầu thuê biệt thự sân vườn, villa cao cấp làm nơi an cư cho chuyên gia nước ngoài, gia đình đa thế hệ hoặc làm trụ sở văn phòng đại diện sang trọng tiếp tục giữ mức hấp thụ cao.',
    discoveryCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Quảng Nam', 'Khánh Hòa'],
    relatedLink: { name: 'Cho thuê trang trại, khu nghỉ dưỡng', path: '/cho-thue-trang-trai-khu-nghi-duong' },
    faqsBuilder: () => [
      { q: 'Thuê biệt thự, villa ở hoặc làm văn phòng cần lưu ý chi phí quản trị nào?', a: 'Ngoài tiền thuê, người thuê cần làm rõ chi phí chăm sóc cây cảnh sân vườn, hóa chất vận hành hồ bơi định kỳ, phí an ninh khu đô thị và tiền điện sinh hoạt công suất lớn.' },
      { q: 'Có được cải tạo công năng bên trong biệt thự để làm văn phòng công ty không?', a: 'Cần có điều khoản cho phép thay đổi vách ngăn, trang trí nhận diện thương hiệu trong hợp đồng và đảm bảo không can thiệp kết cấu chịu lực của căn biệt thự.' }
    ]
  },
  shophouse: {
    label: 'Shophouse, Nhà Phố Thương Mại Cho Thuê',
    shortLabel: 'shophouse thương mại',
    tableCols: ['Shophouse khối đế chung cư', 'Shophouse nội khu KĐT', 'Shophouse trục đường lớn', 'Tổ hợp / Khu đô thị sầm uất'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh', cols: ['25 - 45 tr/tháng', '35 - 75 tr/tháng', '65 - 150 tr/tháng'], hotspots: 'Vinhomes Central Park, Sala Đại Quang Minh, TP. Thủ Đức' },
        { area: 'Hà Nội', cols: ['22 - 40 tr/tháng', '30 - 65 tr/tháng', '60 - 135 tr/tháng'], hotspots: 'Vinhomes Ocean Park, Smart City, The Manor Central Park' },
        { area: 'Đà Nẵng & Quảng Nam', cols: ['15 - 30 tr/tháng', '25 - 50 tr/tháng', '45 - 90 tr/tháng'], hotspots: 'Đà Nẵng Times Square, FPT City, Shophouse Hội An' }
      ]
    },
    marketFocus: 'shophouse thương mại với ưu thế vừa ở vừa kinh doanh, vỉa hè rộng rãi và lượng cư dân sẵn có tại các đại đô thị thu hút mạnh các thương hiệu F&B, chuỗi siêu thị tiện lợi, nhà thuốc và phòng khám.',
    discoveryCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Hải Phòng'],
    relatedLink: { name: 'Cho thuê nhà mặt phố kinh doanh', path: '/cho-thue-nha-mat-pho' },
    faqsBuilder: () => [
      { q: 'Thuê shophouse thương mại cần kiểm tra những pháp lý gì?', a: 'Xác minh quyền cho thuê, bảng ngành nghề được phép đăng ký kinh doanh tại khu đô thị (tránh ngành bị cấm như sửa xe, karaoke...) và số lượng chỗ đậu xe cho khách hàng.' },
      { q: 'Thời gian hoàn trả mặt bằng và bàn giao hiện trạng shophouse tính thế nào?', a: 'Hợp đồng cần ghi rõ bên thuê có phải hoàn trả nguyên trạng phần thô ban đầu hay được để lại các thiết bị nội thất gắn tường khi thanh lý.' }
    ]
  },
  condotel: {
    label: 'Condotel, Căn Hộ Nghỉ Dưỡng Cho Thuê',
    shortLabel: 'condotel nghỉ dưỡng',
    tableCols: ['Condotel Studio (35 - 45m²)', 'Condotel 1 - 2PN (50 - 75m²)', 'Condotel Suite / View biển', 'Dự án / Cung đường biển'],
    priceRanges: {
      national: [
        { area: 'Đà Nẵng', cols: ['6.5 - 11 tr/tháng', '11 - 18 tr/tháng', '18 - 35 tr/tháng'], hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, Hoàng Sa' },
        { area: 'Nha Trang (Khánh Hòa)', cols: ['6 - 10 tr/tháng', '10 - 16 tr/tháng', '16 - 30 tr/tháng'], hotspots: 'Trần Phú, Phạm Văn Đồng, Bãi Dài' },
        { area: 'Phú Quốc (Kiên Giang)', cols: ['7 - 12 tr/tháng', '12 - 20 tr/tháng', '20 - 40 tr/tháng'], hotspots: 'Bãi Trường, Dương Đông, Grand World' },
        { area: 'TP. Hồ Chí Minh & Hà Nội', cols: ['8 - 14 tr/tháng', '14 - 24 tr/tháng', '22 - 45 tr/tháng'], hotspots: 'Căn hộ khách sạn trung tâm du lịch' }
      ]
    },
    marketFocus: 'nhu cầu thuê condotel nghỉ dưỡng dài hạn từ các chuyên gia du mục số (digital nomads), khách công tác dài ngày và khách du lịch theo tuần/tháng với đầy đủ tiện ích như khách sạn 4 - 5 sao và bếp nấu riêng.',
    discoveryCities: ['Đà Nẵng', 'Khánh Hòa', 'Kiên Giang', 'Bà Rịa - Vũng Tàu', 'Quảng Nam'],
    relatedLink: { name: 'Cho thuê căn hộ chung cư', path: '/cho-thue-can-ho-chung-cu' },
    faqsBuilder: () => [
      { q: 'Thuê condotel theo tháng có được sử dụng miễn phí hồ bơi và phòng gym của tòa nhà không?', a: 'Hầu hết các dự án condotel cho phép khách thuê dài hạn sử dụng miễn phí các tiện ích chung như hồ bơi vô cực, gym, sauna; một số dự án tính phí dịch vụ theo thẻ cư dân.' },
      { q: 'Hợp đồng thuê condotel dài hạn có cần hóa đơn VAT cho công ty thanh toán không?', a: 'Nếu thuê từ đơn vị vận hành hoặc chủ nhà cá nhân đăng ký kinh doanh, bạn hoàn toàn có thể yêu cầu xuất hóa đơn lưu trú VAT hợp lệ để hạch toán chi phí.' }
    ]
  },
  land: {
    label: 'Đất Nền, Bãi Đất Trống Cho Thuê',
    shortLabel: 'đất trống, bãi đất kinh doanh',
    tableCols: ['Bãi đất nhỏ (<300m²)', 'Mặt bằng đất 300 - 1.000m²', 'Khu đất lớn (>1.000m²)', 'Trục đường / Cụm giao thông'],
    priceRanges: {
      national: [
        { area: 'TP. Hồ Chí Minh & Vệ tinh', cols: ['15 - 30 nghìn/m²', '25 - 55 nghìn/m²', '45 - 90 nghìn/m²'], hotspots: 'Quốc Lộ 1A, Bình Chánh, Thủ Đức, Dĩ An' },
        { area: 'Hà Nội & Bắc Ninh', cols: ['12 - 25 nghìn/m²', '20 - 45 nghìn/m²', '38 - 80 nghìn/m²'], hotspots: 'Vành Đai 3, Vành Đai 4, Gia Lâm, Từ Sơn' },
        { area: 'Đà Nẵng & Quảng Nam', cols: ['10 - 20 nghìn/m²', '18 - 35 nghìn/m²', '30 - 65 nghìn/m²'], hotspots: 'Trục đường gom Trường Sơn, QL1A, Điện Nam' }
      ]
    },
    marketFocus: 'nhu cầu thuê bãi đất trống, đất nền làm bãi đỗ xe tải, trạm tập kết vật liệu xây dựng, gara ô tô, kho hở và sân thể thao pickleball tăng nhanh nhờ chi phí đầu tư ban đầu hợp lý và pháp lý hợp đồng linh hoạt.',
    discoveryCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai'],
    relatedLink: { name: 'Cho thuê kho xưởng, bến bãi', path: '/cho-thue-kho-nha-xuong' },
    faqsBuilder: () => [
      { q: 'Thuê đất trống dựng nhà xưởng hoặc gara cần xin giấy phép gì?', a: 'Cần xin Giấy phép xây dựng công trình có thời hạn (công trình tạm) tại UBND quận/huyện và phương án PCCC theo quy chuẩn đất sản xuất kinh doanh/thương mại.' },
      { q: 'Hợp đồng thuê đất dài hạn có rủi ro bị thu hồi không?', a: 'Cần kiểm tra quy hoạch phân khu tại phòng Tài nguyên & Môi trường và thỏa thuận điều khoản bồi thường tài sản trên đất nếu quy hoạch nhà nước thu hồi trước hạn.' }
    ]
  },
  'land-group': { alias: 'land', label: 'Các Loại Đất Cho Thuê', shortLabel: 'đất trống, mặt bằng đất' },
  other: { alias: 'house', label: 'Bất Động Sản Cho Thuê Khác', shortLabel: 'nhà đất' }
};

const GENERAL_RENT_CITY_CONTENT = {
  danang: {
    marketTitle: 'Thị Trường Cho Thuê Nhà Đất Đà Nẵng Năm 2026: Diễn Biến & Cơ Hội Dòng Tiền',
    marketDesc: 'Thị trường cho thuê bất động sản Đà Nẵng năm 2026 ghi nhận nhu cầu lớn từ du lịch nghỉ dưỡng và lực lượng chuyên gia công nghệ cao. Tỷ lệ lấp đầy căn hộ dịch vụ ven biển, nhà phố thương mại và nhà nguyên căn duy trì mức cao từ 85% - 92%.',
    priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Đà Nẵng [2026]',
    benchmarks: [
      { area: 'Hải Châu (Trung tâm)', cols: ['8 - 18 tr/tháng', '15 - 35 tr/tháng', '3.5 - 7 tr/tháng'], hotspots: 'Bạch Đằng, Nguyễn Văn Linh, Lê Duẩn' },
      { area: 'Sơn Trà (Du lịch biển)', cols: ['7 - 16 tr/tháng', '12 - 28 tr/tháng', '3 - 6.5 tr/tháng'], hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, An Hải Bắc' },
      { area: 'Ngũ Hành Sơn (Nghỉ dưỡng)', cols: ['6 - 15 tr/tháng', '10 - 25 tr/tháng', '2.8 - 5.5 tr/tháng'], hotspots: 'Khuê Mỹ, An Thượng, Nam Hòa Xuân' },
      { area: 'Thanh Khê & Cẩm Lệ', cols: ['4.5 - 12 tr/tháng', '7 - 20 tr/tháng', '2.2 - 4.5 tr/tháng'], hotspots: 'Điện Biên Phủ, KĐT Hòa Xuân' },
      { area: 'Liên Chiểu (Sinh viên & KCN)', cols: ['3.5 - 8 tr/tháng', '5 - 14 tr/tháng', '1.8 - 3.5 tr/tháng'], hotspots: 'KCN Hòa Khánh, Tôn Đức Thắng' }
    ],
    faqs: [
      { q: 'Thuê căn hộ chung cư hoặc nhà riêng tại Đà Nẵng cần lưu ý những chi phí phát sinh nào?', a: 'Xác minh rõ phí quản lý tòa nhà (nếu là căn hộ), tiền điện nước theo hóa đơn Nhà nước hay đơn giá riêng, phí gửi xe và vệ sinh sinh hoạt.' },
      { q: 'Khách du lịch hoặc chuyên gia thuê căn hộ dài hạn tại Đà Nẵng làm thủ tục tạm trú thế nào?', a: 'Chủ nhà khai báo tạm trú trực tuyến qua Cổng dịch vụ công cư trú hoặc Công an phường dựa trên CCCD hoặc Hộ chiếu/Thị thực của người thuê.' },
      { q: 'Khu vực nào tại Đà Nẵng có giá thuê hợp lý và thuận tiện di chuyển nhất?', a: 'Cẩm Lệ và Thanh Khê có giá thuê tối ưu, dễ vào trung tâm; An Thượng (Ngũ Hành Sơn) và Phước Mỹ (Sơn Trà) phù hợp gần biển và dịch vụ du lịch.' }
    ]
  },
  quangnam: {
    marketTitle: 'Thị Trường Cho Thuê Nhà Đất Quảng Nam Năm 2026',
    marketDesc: 'Thị trường cho thuê nhà đất Quảng Nam năm 2026 tập trung vào phân khúc lưu trú homestay, villa nghỉ dưỡng tại TP. Hội An và nhà ở chuyên gia, kỹ sư tại TP. Tam Kỳ, TX. Điện Bàn, KKT mở Chu Lai (Núi Thành).',
    priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Quảng Nam [2026]',
    benchmarks: [
      { area: 'TP. Hội An (Homestay & Du lịch)', cols: ['7 - 16 tr/tháng', '12 - 30 tr/tháng', '3 - 6 tr/tháng'], hotspots: 'Cẩm Châu, Cẩm An, Cửa Đại, Phố cổ' },
      { area: 'TX. Điện Bàn (Ven Đà Nẵng)', cols: ['4 - 9 tr/tháng', '6 - 15 tr/tháng', '2 - 4 tr/tháng'], hotspots: 'Điện Ngọc, Điện Nam Trung, KĐT Rosa' },
      { area: 'TP. Tam Kỳ', cols: ['4.5 - 10 tr/tháng', '6 - 16 tr/tháng', '2 - 4.2 tr/tháng'], hotspots: 'Hùng Vương, Phan Bội Châu, Tân Thạnh' },
      { area: 'Huyện Núi Thành (KKT Chu Lai)', cols: ['3.5 - 8 tr/tháng', '5 - 14 tr/tháng', '1.8 - 3.8 tr/tháng'], hotspots: 'Tam Hiệp, Chu Lai, TT. Núi Thành' }
    ],
    faqs: [
      { q: 'Thuê nhà nguyên căn làm homestay kinh doanh tại Hội An (Quảng Nam) cần lưu ý gì?', a: 'Hợp đồng phải có điều khoản cho phép kinh doanh lưu trú và cho thuê lại (sublease), kiểm tra an toàn PCCC và khai báo lưu trú cho khách qua hệ thống Công an tỉnh.' },
      { q: 'Người lao động, chuyên gia tại KCN Điện Nam - Điện Ngọc hoặc Chu Lai nên thuê nhà ở đâu?', a: 'Khu vực dọc Trần Đại Nghĩa nối dài (Điện Bàn) và Tam Hiệp, thị trấn Núi Thành có nhiều nhà riêng và phòng trọ khép kín sạch sẽ.' },
      { q: 'Thủ tục ký hợp đồng thuê nhà tại Quảng Nam có cần công chứng không?', a: 'Hợp đồng thuê nhà ở không bắt buộc công chứng theo Bộ luật Dân sự, nhưng thuê mặt bằng kinh doanh dài hạn trên 3 năm nên công chứng để đảm bảo quyền lợi cao nhất.' }
    ]
  },
  hanoi: {
    marketTitle: 'Thị Trường Cho Thuê Nhà Đất Hà Nội Năm 2026: Nhu Cầu Ở Thực & Tỷ Suất Ổn Định',
    marketDesc: 'Thị trường cho thuê Hà Nội năm 2026 duy trì sức cầu lớn quanh các trục đại học, khu công nghệ cao Hòa Lạc và tổ hợp văn phòng Cầu Giấy, Nam Từ Liêm, Đống Đa.',
    priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Hà Nội [2026]',
    benchmarks: [
      { area: 'Cầu Giấy & Nam Từ Liêm', cols: ['9 - 22 tr/tháng', '14 - 35 tr/tháng', '3.8 - 7.5 tr/tháng'], hotspots: 'Duy Tân, Mễ Trì, Trung Hòa Nhân Chính' },
      { area: 'Tây Hồ & Ba Đình', cols: ['12 - 32 tr/tháng', '18 - 45 tr/tháng', '4.5 - 9 tr/tháng'], hotspots: 'Quảng An, Xuân Diệu, Liễu Giai' },
      { area: 'Đống Đa & Thanh Xuân', cols: ['8.5 - 20 tr/tháng', '12 - 30 tr/tháng', '3.5 - 6.8 tr/tháng'], hotspots: 'Thái Hà, Chùa Bộc, Nguyễn Trãi' },
      { area: 'Hà Đông & Hoàng Mai', cols: ['6.5 - 15 tr/tháng', '9 - 22 tr/tháng', '2.8 - 5.2 tr/tháng'], hotspots: 'Văn Quán, Linh Đàm, Yên Nghĩa' },
      { area: 'Long Biên & Gia Lâm', cols: ['6.5 - 16 tr/tháng', '8 - 20 tr/tháng', '2.6 - 5 tr/tháng'], hotspots: 'Vinhomes Ocean Park, Việt Hưng' }
    ],
    faqs: [
      { q: 'Người thuê căn hộ chung cư mini tại Hà Nội cần đặc biệt lưu ý điều kiện gì?', a: 'Kiểm tra kỹ hệ thống PCCC: thang thoát hiểm ngoài trời, cửa chống cháy tầng hầm để xe máy, báo cháy tự động và lối thoát nạn ban công.' },
      { q: 'Thời hạn đặt cọc và phương thức thanh toán tiền thuê nhà tại Hà Nội thông thường ra sao?', a: 'Phổ biến đặt cọc 1 tháng và đóng tiền 3 - 6 tháng/lần; thanh toán trước 1 năm thường được chiết khấu 5% - 8%.' }
    ]
  },
  hcm: {
    marketTitle: 'Thị Trường Cho Thuê Nhà Đất TP. Hồ Chí Minh Năm 2026: Sức Cầu Sôi Động',
    marketDesc: 'TP. Hồ Chí Minh là thị trường cho thuê sôi động nhất cả nước nhờ tuyến Metro Bến Thành - Suối Tiên kích thích dòng người thuê tại TP. Thủ Đức, Bình Thạnh và sức cầu căn hộ dịch vụ, văn phòng tại Quận 1, Quận 3, Quận 7.',
    priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại TP. Hồ Chí Minh [2026]',
    benchmarks: [
      { area: 'Quận 1 & Quận 3 (Trung tâm)', cols: ['14 - 38 tr/tháng', '22 - 60 tr/tháng', '5 - 10 tr/tháng'], hotspots: 'Bến Nghé, Đa Kao, Võ Thị Sáu' },
      { area: 'TP. Thủ Đức (Đô thị sáng tạo)', cols: ['8 - 22 tr/tháng', '12 - 32 tr/tháng', '3.5 - 7 tr/tháng'], hotspots: 'Thảo Điền, An Phú, Tam Bình' },
      { area: 'Quận 7 & Nhà Bè (Khu Nam)', cols: ['9 - 24 tr/tháng', '14 - 35 tr/tháng', '3.8 - 7.5 tr/tháng'], hotspots: 'Phú Mỹ Hưng, Nguyễn Hữu Thọ' },
      { area: 'Bình Thạnh & Phú Nhuận', cols: ['8.5 - 20 tr/tháng', '13 - 32 tr/tháng', '3.6 - 7.2 tr/tháng'], hotspots: 'Phan Xích Long, Điện Biên Phủ, D2' },
      { area: 'Gò Vấp & Tân Bình', cols: ['6.5 - 16 tr/tháng', '10 - 24 tr/tháng', '3 - 5.8 tr/tháng'], hotspots: 'Quang Trung, Cộng Hòa, Phan Huy Ích' }
    ],
    faqs: [
      { q: 'Kinh nghiệm thuê phòng trọ hoặc căn hộ dịch vụ chính chủ an toàn tại TP.HCM?', a: 'Ưu tiên tin Đã xác thực trên Kênh Nhà Đất 24H, khảo sát thực tế cả ban ngày lẫn buổi tối, kiểm tra công tơ điện riêng và ký hợp đồng kèm biên bản bàn giao trang thiết bị.' },
      { q: 'Giá thuê nhà tại TP.HCM thường tăng giá sau bao lâu?', a: 'Hợp đồng thuê ở thường giữ giá cố định 1 - 2 năm đầu; hợp đồng từ 3 năm trở lên thường quy định mức điều chỉnh trần 5% - 10%/năm.' }
    ]
  },
  national: {
    marketTitle: 'Thị Trường Cho Thuê Nhà Đất Toàn Quốc Năm 2026',
    marketDesc: 'Năm 2026, phân khúc bất động sản cho thuê tiếp tục khẳng định vai trò kênh tạo dòng tiền bền vững tại Hà Nội, TP. Hồ Chí Minh, Đà Nẵng và các đô thị công nghiệp trọng điểm.',
    priceTableTitle: 'Khung Giá Thuê Nhà Đất Tham Khảo Tại Các Đô Thị Lớn [2026]',
    benchmarks: [
      { area: 'TP. Hồ Chí Minh', cols: ['8 - 22 tr/tháng', '12 - 35 tr/tháng', '3.5 - 7 tr/tháng'], hotspots: 'Quận 7, Bình Thạnh, Thủ Đức, Tân Bình' },
      { area: 'Hà Nội', cols: ['7 - 20 tr/tháng', '10 - 30 tr/tháng', '3 - 6.5 tr/tháng'], hotspots: 'Cầu Giấy, Nam Từ Liêm, Đống Đa, Thanh Xuân' },
      { area: 'Đà Nẵng', cols: ['6 - 15 tr/tháng', '8 - 20 tr/tháng', '2.5 - 5 tr/tháng'], hotspots: 'Hải Châu, Sơn Trà, Ngũ Hành Sơn' },
      { area: 'Bình Dương & Đồng Nai', cols: ['5 - 12 tr/tháng', '6 - 16 tr/tháng', '2 - 4.5 tr/tháng'], hotspots: 'Thuận An, Dĩ An, Biên Hòa' }
    ],
    faqs: [
      { q: 'Người đi thuê nhà cần kiểm tra những giấy tờ pháp lý nào trước khi đặt cọc?', a: 'Yêu cầu bên cho thuê xuất trình Sổ hồng/Sổ đỏ (bản gốc hoặc sao y công chứng), CCCD gắn chip chính chủ và hợp đồng ủy quyền có công chứng nếu làm việc qua đơn vị quản lý.' },
      { q: 'Tiền đặt cọc thuê nhà thông thường là bao nhiêu tháng và làm sao lấy lại cọc an toàn?', a: 'Phổ biến 1 - 2 tháng với căn hộ/nhà ở, hoặc 3 - 6 tháng với mặt bằng kinh doanh. Ghi rõ thời hạn hoàn cọc 100% trong vòng 3 ngày làm việc sau khi thanh lý hợp đồng.' },
      { q: 'Chi phí điện, nước, internet và phí dịch vụ quản lý tòa nhà được tính như thế nào?', a: 'Nhà riêng nguyên căn thường tính điện nước theo hóa đơn EVN/cấp nước; căn hộ chung cư và căn hộ dịch vụ cần thỏa thuận rõ phí quản lý, gửi xe, đơn giá điện nước trước khi ký.' },
      { q: 'Làm thế nào để tìm được nhà cho thuê chính chủ, không qua trung gian môi giới?', a: 'Sử dụng bộ lọc khu vực, mức giá và bật bộ lọc \'Tin chính chủ / Đã xác thực\' trên Kênh Nhà Đất 24H để liên hệ trực tiếp chủ nhà.' }
    ]
  }
};

const DEFAULT_RENT_LEGAL_STEPS = [
  { title: 'Xác minh quyền cho thuê chính chủ', text: 'Yêu cầu xem Sổ hồng gốc hoặc giấy tờ chứng minh quyền sở hữu hợp pháp. Tránh giao tiền cọc cho bên thứ ba nếu không có hợp đồng ủy quyền có công chứng từ chính chủ.' },
  { title: 'Thỏa thuận tiền cọc & Điều kiện hoàn tiền 100%', text: 'Hợp đồng phải ghi rõ thời hạn chủ nhà hoàn trả lại 100% tiền cọc sau khi hết hạn thuê (thường trong vòng 3 ngày làm việc) và mức bồi thường nếu lấy lại nhà trước hạn.' },
  { title: 'Phân định trách nhiệm bảo trì thiết bị hư hỏng', text: 'Lập biên bản bàn giao chi tiết máy lạnh, máy nước nóng, tủ lạnh... Hư hỏng do hao mòn tự nhiên do chủ nhà sửa; hư hỏng do lỗi người dùng do bên thuê chi trả.' },
  { title: 'Minh bạch đơn giá điện, nước & Phí quản lý', text: 'Chốt số công tơ điện, đồng hồ nước ngay ngày nhận nhà và ghi rõ đơn giá điện (VNĐ/kWh), nước, internet, phí quản lý trong hợp đồng.' }
];

const getRentProfile = (propertyType) => {
  const norm = normalizeType(propertyType);
  if (norm === 'all') return null;
  const raw = RENT_CATEGORY_PROFILES[norm];
  if (!raw) return null;
  if (raw.alias) {
    const base = RENT_CATEGORY_PROFILES[raw.alias];
    return base ? { ...base, label: raw.label, shortLabel: raw.shortLabel } : { ...raw };
  }
  return raw;
};

/**
 * Trả về trọn bộ dữ liệu On-Page SEO cho RentListingsSeoContent
 */
export const buildRentSeoContentData = ({
  activeCity = null,
  district = null,
  propertyType = null,
  priceRange = null,
  priceLabel = null,
  areaRange = null,
  areaLabel = null,
  bedroom = null,
  taxonomyInfo = null
} = {}) => {
  const cityCtx = resolveCityContext(activeCity);
  const profile = getRentProfile(propertyType);
  const isSpecificCity = cityCtx.key !== 'national';
  const locHeader = isSpecificCity ? 'Khu vực / Quận Huyện' : 'Khu vực / Tỉnh thành';
  const cityDisplay = cityCtx.displayName;
  const norm = normalizeType(propertyType);

  const facet = resolveFacetFilterLabels({
    priceRange,
    priceLabel,
    areaRange,
    areaLabel,
    bedroom,
    taxonomyInfo
  });

  const effDistrict = district || taxonomyInfo?.district || null;
  const locationLabel = effDistrict
    ? `tại ${effDistrict}${activeCity ? `, ${cityDisplay}` : ''}`
    : (isSpecificCity ? `tại ${cityDisplay}` : 'toàn quốc');

  const discoveryLinks = facet.hasFacetFilters
    ? buildFacetedDiscoveryLinks({ demand: 'rent', propertyType: norm, activeCity: isSpecificCity ? cityDisplay : null, profile })
    : ((!isSpecificCity && profile && norm !== 'all')
        ? {
            title: `Khám Phá ${profile.label} Tại Các Địa Bàn Nổi Bật`,
            links: [
              ...(profile.discoveryCities || ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Khánh Hòa']).map((c) => ({
                name: `Thuê ${profile.shortLabel} ${c}`,
                path: buildSeoUrl({ demand: 'rent', propertyType: norm, city: c })
              })),
              {
                name: profile.relatedLink?.name || (norm === 'apartment' ? 'Cho thuê chung cư mini' : 'Cho thuê căn hộ chung cư'),
                path: profile.relatedLink?.path || buildSeoUrl({ demand: 'rent', propertyType: norm === 'apartment' ? 'mini-apartment' : 'apartment' })
              }
            ]
          }
        : {
            title: isSpecificCity ? `Khám Phá Nhà Đất Cho Thuê Tại ${cityDisplay} Theo Phân Khúc` : 'Khám Phá Nhà Đất Cho Thuê Theo Phân Khúc',
            links: [
              { name: `Cho thuê căn hộ chung cư${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'apartment', city: isSpecificCity ? cityDisplay : null }) },
              { name: `Cho thuê chung cư mini, căn hộ dịch vụ${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'mini-apartment', city: isSpecificCity ? cityDisplay : null }) },
              { name: `Cho thuê nhà riêng nguyên căn${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'house', city: isSpecificCity ? cityDisplay : null }) },
              { name: `Cho thuê nhà mặt phố kinh doanh${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'street-house', city: isSpecificCity ? cityDisplay : null }) },
              { name: `Cho thuê văn phòng, mặt bằng${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'office', city: isSpecificCity ? cityDisplay : null }) },
              { name: `Cho thuê kho xưởng, bến bãi${isSpecificCity ? ` ${cityDisplay}` : ''}`, path: buildSeoUrl({ demand: 'rent', propertyType: 'warehouse', city: isSpecificCity ? cityDisplay : null }) }
            ]
          });

  const presetGeneral = GENERAL_RENT_CITY_CONTENT[cityCtx.key];

  if (profile) {
    const marketTitle = facet.hasFacetFilters
      ? `Thị Trường ${profile.label} ${locationLabel}${facet.filterSuffix} Năm 2026: Đánh Giá & Kinh Nghiệm`
      : `Thị Trường ${profile.label} ${isSpecificCity ? cityDisplay : 'Toàn Quốc'} Năm 2026: Giá Thuê & Kinh Nghiệm`;

    let marketDesc = '';
    if (facet.hasFacetFilters) {
      let priceInsight = '';
      if (facet.cleanPrice) {
        if (facet.cleanPrice.includes('dưới 3') || facet.cleanPrice.includes('dưới 2') || facet.cleanPrice.includes('dưới 500')) {
          priceInsight = `Ở phân khúc ${facet.cleanPrice}, đây là khoảng ngân sách giá rẻ tối ưu cho sinh viên và người mới đi làm; nguồn cung có tính cạnh tranh cao và tập trung quanh các trường đại học, khu công nghiệp.`;
        } else if (facet.cleanPrice.includes('3 đến 5') || facet.cleanPrice.includes('3 - 5') || facet.cleanPrice.includes('từ 3') || facet.cleanPrice.includes('dưới 5')) {
          priceInsight = `Với ${facet.cleanPrice}, đây là phân khúc 'vàng' được tìm kiếm nhiều nhất trên thị trường hiện nay, cân bằng hoàn hảo giữa mức chi tiêu hợp lý và đầy đủ tiện nghi sinh hoạt độc lập.`;
        } else if (facet.cleanPrice.includes('5 đến 10') || facet.cleanPrice.includes('5 - 10') || facet.cleanPrice.includes('dưới 10')) {
          priceInsight = `Trong khoảng ${facet.cleanPrice}, người thuê dễ dàng tiếp cận các căn hộ dịch vụ cao cấp full nội thất, thang máy thẻ từ, ban công thoáng và dịch vụ quản lý chuyên nghiệp.`;
        } else {
          priceInsight = `Ở mức ${facet.cleanPrice}, thị trường cung cấp đa dạng các lựa chọn căn hộ cao cấp, diện tích rộng rãi với tiện ích khép kín tiêu chuẩn cao.`;
        }
      }

      let areaInsight = '';
      if (facet.cleanArea || facet.cleanBedroom) {
        const parts = [];
        if (facet.cleanArea) parts.push(facet.cleanArea);
        if (facet.cleanBedroom) parts.push(facet.cleanBedroom);
        areaInsight = `Khi lựa chọn tiêu chí ${parts.join(' và ')}, người thuê cần đặc biệt lưu ý kiểm tra độ thông thoáng của giếng trời/ban công, lối thoát hiểm PCCC và khả năng cách âm giữa các không gian phòng.`;
      }

      marketDesc = `Năm 2026, phân khúc ${profile.shortLabel} ${locationLabel}${facet.filterSuffix} ghi nhận lượng tìm kiếm và giao dịch sôi động. ${priceInsight} ${areaInsight} Lời khuyên từ chuyên gia Kênh Nhà Đất 24H: hãy khảo sát thực tế tối thiểu 3 căn phòng, làm rõ chi phí điện nước, phí dịch vụ phát sinh và lập biên bản bàn giao thiết bị chi tiết trước khi đặt bút ký hợp đồng.`;
    } else {
      marketDesc = profile.marketFocus
        ? `Năm 2026, thị trường ${profile.shortLabel} cho thuê${isSpecificCity ? ` tại ${cityDisplay}` : ' trên toàn quốc'} ghi nhận ${profile.marketFocus}`
        : (presetGeneral?.marketDesc || GENERAL_RENT_CITY_CONTENT.national.marketDesc);
    }

    const priceTableTitle = facet.hasFacetFilters
      ? `Khảo Sát Khung Giá & Phân Khúc ${profile.label} ${locationLabel}${facet.filterSuffix} [2026]`
      : `Khung Giá ${profile.label} Tham Khảo${isSpecificCity ? ` Tại ${cityDisplay}` : ' Tại Các Đô Thị Lớn'} [2026]`;

    const benchmarks = profile.priceRanges?.[cityCtx.key]
      || (cityCtx.matchedProvince?.districts?.length
        ? buildProvincialCategoryBenchmarks(cityCtx.matchedProvince, [0.14, 0.24, 0.38], 'tr/tháng')
        : (profile.priceRanges?.national || presetGeneral?.benchmarks || GENERAL_RENT_CITY_CONTENT.national.benchmarks));

    const baseFaqs = profile.faqsBuilder
      ? profile.faqsBuilder(isSpecificCity, isSpecificCity ? cityDisplay : '')
      : (presetGeneral?.faqs || GENERAL_RENT_CITY_CONTENT.national.faqs);

    const facetFaqs = [];
    if (facet.hasFacetFilters) {
      facetFaqs.push({
        q: `Với ngân sách ${facet.cleanPrice || 'hiện tại'}, có thể tìm thuê ${profile.shortLabel}${facet.cleanBedroom ? ` ${facet.cleanBedroom}` : ''}${facet.cleanArea ? ` ${facet.cleanArea}` : ''} ${locationLabel} không?`,
        a: `Hoàn toàn có thể. Năm 2026, nguồn cung ${profile.shortLabel}${facet.filterSuffix} ${locationLabel} tập trung tại các khu vực có hạ tầng phát triển, giao thông thuận tiện. Để chọn được căn ưng ý nhất, người thuê nên chủ động liên hệ sớm từ 1-2 tuần, so sánh ít nhất 3 lựa chọn tương đương và kiểm tra trực tiếp hiện trạng phòng trước khi đặt cọc.`
      });

      if (facet.cleanArea || facet.cleanBedroom) {
        facetFaqs.push({
          q: `Khi xem thuê ${profile.shortLabel}${facet.cleanArea ? ` ${facet.cleanArea}` : ''}${facet.cleanBedroom ? ` ${facet.cleanBedroom}` : ''}, cần kiểm tra những chi tiết gì?`,
          a: `Bạn cần ưu tiên kiểm tra: (1) Ánh sáng tự nhiên và độ thông gió của các phòng ngủ; (2) Hệ thống an toàn PCCC gồm bình chữa cháy, chuông báo khói và thang thoát hiểm; (3) Áp lực nước sinh hoạt, bình nóng lạnh và điều hòa; (4) Khả năng cách âm giữa các phòng và độ an ninh khu vực xung quanh.`
        });
      }

      facetFaqs.push({
        q: `Tiền đặt cọc và các chi phí dịch vụ định kỳ khi thuê ở phân khúc ${facet.cleanPrice || 'này'} thường là bao nhiêu?`,
        a: `Mức đặt cọc tiêu chuẩn thường là 1 tháng tiền thuê (đối với hợp đồng 6 - 12 tháng). Về chi phí dịch vụ: điện nước nên tính theo đồng hồ riêng hoặc giá nhà nước; các khoản phí quản lý tòa nhà, gửi xe, dọn vệ sinh và internet cần được thỏa thuận chi tiết bằng văn bản trong hợp đồng để tránh tranh chấp phát sinh.`
      });
    }

    return {
      marketTitle,
      marketDesc,
      priceTableTitle,
      tableHeaders: [locHeader, ...(profile.tableCols || ['Căn hộ / Mặt bằng nhỏ', 'Phân khúc tiêu chuẩn', 'Diện tích lớn / Cao cấp', 'Khu vực sôi động'])],
      benchmarks,
      legalTitle: profile.legalTitle || `4 Lưu Ý Pháp Lý Sống Còn Khi Ký Hợp Đồng ${profile.label}`,
      legalSteps: profile.legalSteps || DEFAULT_RENT_LEGAL_STEPS,
      faqTitle: facet.hasFacetFilters
        ? `Câu Hỏi Thường Gặp Về ${profile.label}${facet.filterSuffix} (FAQ)`
        : `Câu Hỏi Thường Gặp Về ${profile.label}${isSpecificCity ? ` Tại ${cityDisplay}` : ''}`,
      faqs: [...facetFaqs, ...baseFaqs],
      discoveryTitle: discoveryLinks.title,
      discoveryLinks: discoveryLinks.links
    };
  }

  if (presetGeneral) {
    const marketTitle = facet.hasFacetFilters
      ? `Thị Trường Cho Thuê Nhà Đất ${locationLabel}${facet.filterSuffix} Năm 2026: Nhu Cầu & Kinh Nghiệm`
      : presetGeneral.marketTitle;

    const priceTableTitle = facet.hasFacetFilters
      ? `Khảo Sát Khung Giá Cho Thuê Nhà Đất ${locationLabel}${facet.filterSuffix} [2026]`
      : presetGeneral.priceTableTitle;

    const facetFaqs = [];
    if (facet.hasFacetFilters) {
      facetFaqs.push({
        q: `Tìm thuê nhà đất ${locationLabel} với ${facet.filterParts.join(', ')} cần chuẩn bị gì?`,
        a: `Người thuê nên chuẩn bị sẵn sàng khoản tiền cọc 1-2 tháng, đối chiếu bản gốc sổ hồng và giấy tờ pháp lý của chủ cho thuê, kiểm tra đồng hồ điện nước riêng biệt và các khoản phí dịch vụ đi kèm.`
      });
    }

    return {
      marketTitle,
      marketDesc: facet.hasFacetFilters
        ? `Năm 2026, nhu cầu thuê nhà đất ${locationLabel} với ${facet.filterParts.join(', ')} tăng trưởng ổn định. Người thuê cần khảo sát nhiều vị trí, nắm rõ biểu phí dịch vụ và ký kết hợp đồng minh bạch.`
        : presetGeneral.marketDesc,
      priceTableTitle,
      tableHeaders: [locHeader, 'Căn hộ chung cư', 'Nhà riêng / Nguyên căn', 'Phòng trọ / CH Dịch vụ', 'Khu vực sôi động'],
      benchmarks: presetGeneral.benchmarks,
      legalTitle: `4 Lưu Ý Pháp Lý Sống Còn Khi Ký Hợp Đồng Thuê Nhà Đất ${locationLabel}`,
      legalSteps: DEFAULT_RENT_LEGAL_STEPS,
      faqTitle: facet.hasFacetFilters
        ? `Câu Hỏi Thường Gặp Khi Thuê Nhà Đất ${locationLabel}${facet.filterSuffix}`
        : `Câu Hỏi Thường Gặp Khi Thuê Nhà Đất${isSpecificCity ? ` Tại ${cityDisplay}` : ''}`,
      faqs: [...facetFaqs, ...presetGeneral.faqs],
      discoveryTitle: discoveryLinks.title,
      discoveryLinks: discoveryLinks.links
    };
  }

  const prov = cityCtx.matchedProvince;
  const provBenchmarks = prov?.districts?.length
    ? prov.districts.slice(0, 6).map((d, index) => {
        const aptMin = Math.max(3, 7 - index * 0.8).toFixed(1).replace('.0', '');
        const aptMax = Math.max(6, 15 - index * 1.5).toFixed(1).replace('.0', '');
        const houseMin = Math.max(4, 9 - index * 1).toFixed(1).replace('.0', '');
        const houseMax = Math.max(8, 20 - index * 2).toFixed(1).replace('.0', '');
        const roomMin = Math.max(1.5, 3.2 - index * 0.3).toFixed(1).replace('.0', '');
        const roomMax = Math.max(2.8, 5.5 - index * 0.5).toFixed(1).replace('.0', '');
        const hotspots = (d.projects?.length ? d.projects : (d.streets || [d.name])).slice(0, 3).join(', ');
        return {
          area: d.name,
          cols: [`${aptMin} - ${aptMax} tr/tháng`, `${houseMin} - ${houseMax} tr/tháng`, `${roomMin} - ${roomMax} tr/tháng`],
          hotspots
        };
      })
    : GENERAL_RENT_CITY_CONTENT.national.benchmarks;

  return {
    marketTitle: `Thị Trường Cho Thuê Nhà Đất ${cityDisplay} Năm 2026: Nhu Cầu & Tỷ Suất Dòng Tiền`,
    marketDesc: `Thị trường bất động sản cho thuê tại ${cityDisplay} năm 2026 ghi nhận nhu cầu cao từ lực lượng lao động, chuyên gia doanh nghiệp và hộ gia đình trẻ tập trung quanh trung tâm đô thị và khu công nghiệp.`,
    priceTableTitle: `Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại ${cityDisplay} [2026]`,
    tableHeaders: ['Khu vực / Quận Huyện', 'Căn hộ chung cư', 'Nhà riêng / Nguyên căn', 'Phòng trọ / CH Dịch vụ', 'Khu vực sôi động'],
    benchmarks: provBenchmarks,
    legalTitle: `4 Lưu Ý Pháp Lý Sống Còn Khi Ký Hợp Đồng Thuê Nhà Đất Tại ${cityDisplay}`,
    legalSteps: DEFAULT_RENT_LEGAL_STEPS,
    faqTitle: `Câu Hỏi Thường Gặp Khi Thuê Nhà Đất Tại ${cityDisplay}`,
    faqs: [
      { q: `Người thuê nhà tại ${cityDisplay} cần kiểm tra những giấy tờ gì trước khi đặt cọc?`, a: `Yêu cầu chủ nhà xuất trình bản gốc Sổ đỏ/Sổ hồng, đối chiếu CCCD và làm rõ điện nước, phí dịch vụ trước khi ký hợp đồng.` },
      { q: `Tiền đặt cọc thuê nhà tại ${cityDisplay} thông thường là bao nhiêu?`, a: `Mức cọc phổ biến từ 1 đến 2 tháng tiền thuê; hợp đồng cần ghi rõ hoàn trả cọc trong 3 ngày làm việc sau khi thanh lý.` }
    ],
    discoveryTitle: discoveryLinks.title,
    discoveryLinks: discoveryLinks.links
  };
};

/**
 * Lấy danh sách FAQ đồng bộ 100% giữa Schema JSON-LD (`src/app/[slug]/page.jsx`)
 * và nội dung hiển thị trên màn hình (`SaleListingsSeoContent` / `RentListingsSeoContent`).
 */
export const getTaxonomyFaqs = ({
  demand = 'sale',
  propertyType = null,
  city = null,
  district = null,
  priceRange = null,
  priceLabel = null,
  areaRange = null,
  areaLabel = null,
  bedroom = null,
  taxonomyInfo = null
} = {}) => {
  const data = demand === 'rent'
    ? buildRentSeoContentData({ activeCity: city, district, propertyType, priceRange, priceLabel, areaRange, areaLabel, bedroom, taxonomyInfo })
    : buildSaleSeoContentData({ activeCity: city, district, propertyType, priceRange, priceLabel, areaRange, areaLabel, bedroom, taxonomyInfo });
  return data.faqs || [];
};
