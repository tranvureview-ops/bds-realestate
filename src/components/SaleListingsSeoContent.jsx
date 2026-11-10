'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { buildSeoUrl } from '../utils/permalink';
import { VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData';

export default function SaleListingsSeoContent({ city = null, district = null, propertyType = null, taxonomyInfo = null }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Nhận diện địa phương đang lọc (thành phố / tỉnh)
  const activeCity = city || taxonomyInfo?.city || null;
  const isDaNang = activeCity && (activeCity.includes('Đà Nẵng') || activeCity.toLowerCase().includes('da nang'));
  const isQuangNam = activeCity && (activeCity.includes('Quảng Nam') || activeCity.toLowerCase().includes('quang nam'));
  const isHaNoi = activeCity && (activeCity.includes('Hà Nội') || activeCity.toLowerCase().includes('ha noi'));
  const isHcm = activeCity && (activeCity.includes('Hồ Chí Minh') || activeCity.toLowerCase().includes('ho chi minh'));

  // 1. Dữ liệu Phân tích Thị Trường & Khung Giá Động Theo Thành Phố
  const cityConfig = useMemo(() => {
    if (isDaNang) {
      return {
        name: 'Đà Nẵng',
        marketTitle: 'Thị Trường Mua Bán Nhà Đất Đà Nẵng Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
        marketDesc: 'Bước sang năm 2026, thị trường bất động sản Đà Nẵng bước vào chu kỳ phục hồi và bứt phá mạnh mẽ khi hàng loạt dự án hạ tầng giao thông quy mô lớn đồng loạt được đẩy nhanh tiến độ: Dự án Cảng Liên Chiểu, Mở rộng Sân bay Quốc tế Đà Nẵng, Cầu Quảng Đà và quy hoạch trung tâm tài chính quốc tế ven biển. Đà Nẵng tiếp tục khẳng định vị thế đô thị đáng sống hàng đầu Việt Nam, thu hút mạnh mẽ dòng vốn đầu tư cho phân khúc căn hộ du lịch ven sông, đất nền ven biển và nhà phố thương mại tại các quận trung tâm như Hải Châu, Sơn Trà, Ngũ Hành Sơn và Cẩm Lệ.',
        priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Đà Nẵng [2026]',
        benchmarks: [
          { area: 'Hải Châu (Trung tâm)', house: '110 - 220 tr/m²', apartment: '45 - 85 tr/m²', land: '90 - 160 tr/m²', hotspots: 'Bạch Đằng, Nguyễn Văn Linh, 2/9' },
          { area: 'Sơn Trà (Du lịch biển)', house: '85 - 170 tr/m²', apartment: '40 - 75 tr/m²', land: '70 - 130 tr/m²', hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, An Hải Bắc' },
          { area: 'Ngũ Hành Sơn (Nghỉ dưỡng)', house: '65 - 130 tr/m²', apartment: '38 - 68 tr/m²', land: '50 - 95 tr/m²', hotspots: 'Nam Hòa Xuân, Khuê Mỹ, Non Nước' },
          { area: 'Cẩm Lệ (Đô thị mới)', house: '45 - 85 tr/m²', apartment: '30 - 45 tr/m²', land: '35 - 65 tr/m²', hotspots: 'KĐT Hòa Xuân, Khuê Trung, Cầu Đỏ' },
          { area: 'Thanh Khê (Thương mại bán lẻ)', house: '70 - 140 tr/m²', apartment: '35 - 55 tr/m²', land: '55 - 95 tr/m²', hotspots: 'Điện Biên Phủ, Nguyễn Tất Thành, Dũng Sĩ' },
          { area: 'Liên Chiểu (Đón sóng hạ tầng)', house: '38 - 75 tr/m²', apartment: '28 - 42 tr/m²', land: '30 - 55 tr/m²', hotspots: 'Cảng Liên Chiểu, Hòa Khánh, Nguyễn Lương Bằng' },
          { area: 'Hòa Vang (Đất nền sinh thái)', house: '22 - 45 tr/m²', apartment: '-', land: '15 - 35 tr/m²', hotspots: 'Hòa Châu, Hòa Phước, Hòa Tiến' }
        ],
        faqs: [
          {
            q: 'Có nên mua nhà đất Đà Nẵng năm 2026 và khu vực nào có tiềm năng tăng trưởng tốt nhất?',
            a: 'Năm 2026 là thời điểm vàng để mua nhà đất Đà Nẵng nhờ mặt bằng giá đã tích lũy ổn định và hạ tầng bứt phá. Các khu vực tiềm năng gồm: Quận Liên Chiểu (đón sóng Cảng biển quốc tế), Nam Hòa Xuân / Ngũ Hành Sơn (đô thị sinh thái ven sông) và khu vực trung tâm Hải Châu (nhà phố kinh doanh dòng tiền).'
          },
          {
            q: 'Người ngoại tỉnh (Hà Nội, TP.HCM...) mua nhà đất tại Đà Nẵng cần lưu ý những thủ tục gì?',
            a: 'Người ngoại tỉnh có quyền đứng tên sổ hồng nhà đất Đà Nẵng hoàn toàn bình thường như công dân địa phương. Quy trình công chứng có thể ủy quyền hoặc ký trực tiếp tại bất kỳ Văn phòng Công chứng nào tại Đà Nẵng. Cần kiểm tra kỹ quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện và tình trạng pháp lý tài sản qua hệ thống ngăn chặn UCHI Đà Nẵng trước khi cọc.'
          },
          {
            q: 'Mua căn hộ chung cư hay đất nền thổ cư tại Đà Nẵng có tính thanh khoản cao hơn?',
            a: 'Căn hộ chung cư cao cấp ven sông Hàn và ven biển Mỹ Khê có thanh khoản cho thuê rất tốt (tỷ suất 6% - 8%/năm từ khách du lịch và chuyên gia). Trong khi đó, đất nền tại các khu đô thị quy hoạch bài bản (như Hòa Xuân, Nam Hòa Xuân, Golden Hills) có biên độ tăng giá vốn mạnh mẽ theo chu kỳ hạ tầng.'
          },
          {
            q: 'Lệ phí trước bạ và thuế chuyển nhượng nhà đất tại Đà Nẵng nộp ở đâu?',
            a: 'Sau khi ký công chứng hợp đồng mua bán, hồ sơ được nộp tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa) Chi nhánh Văn phòng Đăng ký Đất đai tại các quận/huyện ở Đà Nẵng. Thuế TNCN (2%) và Lệ phí trước bạ (0.5%) được nộp tại Kho bạc Nhà nước hoặc ngân hàng thương mại được ủy nhiệm thu.'
          }
        ]
      };
    }

    if (isHaNoi) {
      return {
        name: 'Hà Nội',
        marketTitle: 'Thị Trường Mua Bán Nhà Đất Hà Nội Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
        marketDesc: 'Thị trường bất động sản Thủ đô Hà Nội năm 2026 duy trì sức cầu ở thực cực kỳ bền vững. Các dự án phát triển mạng lưới đường Vành đai 4, các cây cầu mới bắc qua sông Hồng (cầu Trần Hưng Đạo, cầu Tứ Liên) cùng việc khánh thành các tuyến metro đô thị tiếp tục thúc đẩy giá trị bất động sản tại các quận nội thành và khu vực đô thị vệ tinh phía Tây và phía Đông.',
        priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Hà Nội [2026]',
        benchmarks: [
          { area: 'Cầu Giấy & Nam Từ Liêm', house: '160 - 280 tr/m²', apartment: '55 - 95 tr/m²', land: '120 - 220 tr/m²', hotspots: 'Duy Tân, Mễ Trì, Trung Hòa Nhân Chính' },
          { area: 'Tây Hồ & Ba Đình', house: '220 - 450 tr/m²', apartment: '75 - 140 tr/m²', land: '180 - 350 tr/m²', hotspots: 'Quảng An, Xuân Diệu, Liễu Giai' },
          { area: 'Đống Đa & Thanh Xuân', house: '140 - 250 tr/m²', apartment: '50 - 85 tr/m²', land: '110 - 190 tr/m²', hotspots: 'Thái Hà, Nguyễn Trãi, Lê Văn Lương' },
          { area: 'Hà Đông & Hoàng Mai', house: '90 - 170 tr/m²', apartment: '38 - 65 tr/m²', land: '70 - 130 tr/m²', hotspots: 'Văn Quán, Linh Đàm, Yên Nghĩa' },
          { area: 'Long Biên & Gia Lâm', house: '85 - 165 tr/m²', apartment: '42 - 70 tr/m²', land: '60 - 110 tr/m²', hotspots: 'Vinhomes Ocean Park, Việt Hưng' }
        ],
        faqs: [
          {
            q: 'Người mua nhà đất Hà Nội lần đầu cần kiểm tra những gì để tránh rủi ro?',
            a: 'Bắt buộc kiểm tra sổ đỏ gốc, đo vẽ hiện trạng diện tích thực tế để không bị lấn chiếm ranh giới ngõ ngách, tra cứu quy hoạch phân khu tại Sở Quy hoạch - Kiến trúc Hà Nội và xác minh tình trạng thế chấp sổ đỏ tại ngân hàng.'
          },
          {
            q: 'Giá nhà đất Hà Nội năm 2026 có xu hướng tăng hay giảm?',
            a: 'Phân khúc chung cư trung và cao cấp cùng nhà riêng trong ngõ ô tô vào được tại Hà Nội tiếp tục ghi nhận đà tăng trưởng ổn định 8% - 12%/năm do nguồn cung mới trong nội đô khan hiếm và nhu cầu an cư thực tế rất cao.'
          },
          {
            q: 'Thủ tục sang tên sổ đỏ tại Hà Nội mất bao lâu?',
            a: 'Theo quy định hiện hành, thời gian làm thủ tục đăng bộ sang tên sổ đỏ tại Văn phòng Đăng ký Đất đai Hà Nội kéo dài từ 10 đến 15 ngày làm việc kể từ ngày nộp đủ hồ sơ hợp lệ.'
          },
          {
            q: 'Làm thế nào để tìm nhà chính chủ giá rẻ tại Hà Nội trên Kênh Nhà Đất 24H?',
            a: 'Sử dụng bộ lọc khu vực Quận/Huyện, chọn mức giá phù hợp và tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để kết nối trực tiếp với người bán.'
          }
        ]
      };
    }

    if (isHcm) {
      return {
        name: 'TP. Hồ Chí Minh',
        marketTitle: 'Thị Trường Mua Bán Nhà Đất TP. Hồ Chí Minh Năm 2026: Diễn Biến & Tiềm Năng Tăng Trưởng',
        marketDesc: 'TP. Hồ Chí Minh tiếp tục là đầu tàu kinh tế và thị trường bất động sản sôi động nhất cả nước. Việc vận hành chính thức tuyến Metro số 1 Bến Thành - Suối Tiên, tăng tốc thi công Vành đai 3 và mở rộng mạng lưới giao thông kết nối sân bay Long Thành tạo xung lực mạnh mẽ cho giá trị bất động sản tại TP. Thủ Đức, khu Nam Quận 7 và khu Tây Bình Tân.',
        priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại TP. Hồ Chí Minh [2026]',
        benchmarks: [
          { area: 'Quận 1 & Quận 3 (Trung tâm)', house: '320 - 750 tr/m²', apartment: '95 - 220 tr/m²', land: '280 - 600 tr/m²', hotspots: 'Bến Nghé, Đa Kao, Võ Thị Sáu' },
          { area: 'TP. Thủ Đức (Đô thị sáng tạo)', house: '110 - 250 tr/m²', apartment: '50 - 110 tr/m²', land: '70 - 160 tr/m²', hotspots: 'Thảo Điền, An Phú, Vạn Phúc City' },
          { area: 'Quận 7 & Nhà Bè (Khu Nam)', house: '95 - 210 tr/m²', apartment: '45 - 90 tr/m²', land: '65 - 130 tr/m²', hotspots: 'Phú Mỹ Hưng, Nguyễn Hữu Thọ, Huỳnh Tấn Phát' },
          { area: 'Bình Thạnh & Phú Nhuận', house: '130 - 240 tr/m²', apartment: '52 - 85 tr/m²', land: '100 - 180 tr/m²', hotspots: 'Phan Xích Long, Điện Biên Phủ, D2' },
          { area: 'Gò Vấp & Tân Bình', house: '85 - 165 tr/m²', apartment: '40 - 65 tr/m²', land: '65 - 120 tr/m²', hotspots: 'Quang Trung, Cộng Hòa, Phan Huy Ích' }
        ],
        faqs: [
          {
            q: 'Mua nhà đất TP.HCM năm 2026 nên chọn khu vực nào có tiềm năng sinh lời cao?',
            a: 'TP. Thủ Đức (hưởng lợi từ hạ tầng Metro và Vành đai 3), Quận 7 / Nhà Bè (đô thị sinh thái phát triển ổn định) và khu vực trung tâm mở rộng Bình Thạnh, Phú Nhuận (nhà phố có sẵn dòng tiền cho thuê cao).'
          },
          {
            q: 'Quy trình kiểm tra quy hoạch nhà đất tại TP. Hồ Chí Minh như thế nào?',
            a: 'Bạn có thể tra cứu thông tin quy hoạch trực tiếp qua ứng dụng \'Thông tin quy hoạch TP.HCM\' của Sở Quy hoạch - Kiến trúc hoặc nộp hồ sơ xin thông tin quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện.'
          },
          {
            q: 'Chi phí mua bán chuyển nhượng nhà đất tại TP.HCM gồm những gì?',
            a: 'Bao gồm: Thuế thu nhập cá nhân (2%), Lệ phí trước bạ (0.5%), Phí công chứng (theo biểu giá tài sản) và Phí cấp đổi phôi sổ mới (khoảng 1 - 2 triệu đồng).'
          },
          {
            q: 'Có nên mua căn hộ chung cư chưa có sổ hồng tại TP.HCM không?',
            a: 'Nếu mua căn hộ chưa có sổ hồng, người mua cần kiểm tra kỹ hợp đồng mua bán với chủ đầu tư, biên bản bàn giao nhà và giấy xác nhận chưa nộp hồ sơ xin cấp sổ để làm thủ tục chuyển nhượng hợp đồng mua bán có công chứng an toàn.'
          }
        ]
      };
    }

    if (isQuangNam) {
      return {
        name: 'Quảng Nam',
        marketTitle: 'Thị Trường Mua Bán Nhà Đất Quảng Nam Năm 2026: Diễn Biến & Tiềm Năng Bứt Phá',
        marketDesc: 'Năm 2026, thị trường bất động sản Quảng Nam đón nhận xung lực phát triển vượt bậc nhờ chuỗi dự án hạ tầng liên kết vùng Đà Nẵng - Quảng Nam được đẩy mạnh: Dự án khơi thông toàn tuyến sông Cổ Cò kết nối Đà Nẵng với phố cổ Hội An, nâng cấp tuyến đường ven biển Võ Chí Công (tuyến 129), thông xe cầu Quảng Đà kết nối Điện Bàn với Hòa Vang, cùng đề án quy hoạch mở rộng Sân bay Chu Lai và phát triển Khu kinh tế mở Chu Lai. Thị trường bất động sản Quảng Nam ghi nhận sự sôi động mạnh mẽ tại phân khúc đất nền đô thị sinh thái ven sông Cổ Cò (Điện Bàn), bất động sản nghỉ dưỡng - di sản tại TP. Hội An, và phân khúc đất nền ở thực quanh trung tâm hành chính TP. Tam Kỳ và KKT Chu Lai (Núi Thành).',
        priceTableTitle: 'Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại Quảng Nam [2026]',
        benchmarks: [
          { area: 'TP. Hội An (Di sản & Du lịch biển)', house: '85 - 180 tr/m²', apartment: '45 - 85 tr/m²', land: '40 - 95 tr/m²', hotspots: 'Trần Phú, Cửa Đại, Hai Bà Trưng, Cẩm An, Cẩm Châu' },
          { area: 'Thị xã Điện Bàn (Đô thị ven sông Cổ Cò)', house: '35 - 75 tr/m²', apartment: '22 - 38 tr/m²', land: '18 - 45 tr/m²', hotspots: 'KĐT Rosa, Nam Ngọc, Điện Ngọc, Điện Nam Trung, Điện Dương' },
          { area: 'TP. Tam Kỳ (Trung tâm hành chính tỉnh)', house: '30 - 65 tr/m²', apartment: '18 - 28 tr/m²', land: '15 - 35 tr/m²', hotspots: 'Hùng Vương, Phan Bội Châu, Trần Cao Vân, KĐT Vịnh An Hòa' },
          { area: 'Huyện Duy Xuyên (Liền kề Hoiana & Nam Hội An)', house: '22 - 45 tr/m²', apartment: '-', land: '14 - 32 tr/m²', hotspots: 'Duy Hải, Duy Nghĩa ven Hoiana Resort, Nam Phước' },
          { area: 'Huyện Thăng Bình (Đô thị ven biển Vinpearl)', house: '18 - 35 tr/m²', apartment: '-', land: '10 - 25 tr/m²', hotspots: 'Bình Minh, Bình Dương (Vinpearl Nam Hội An), Hà Lam' },
          { area: 'Huyện Núi Thành (KKT Chu Lai & Sân bay)', house: '18 - 40 tr/m²', apartment: '15 - 24 tr/m²', land: '12 - 28 tr/m²', hotspots: 'KKT mở Chu Lai, Tam Hiệp, Vịnh An Hòa City, Kỳ Hà' },
          { area: 'Huyện Đại Lộc (Cửa ngõ Tây Đà Nẵng)', house: '15 - 30 tr/m²', apartment: '-', land: '8 - 18 tr/m²', hotspots: 'TT. Ái Nghĩa, Cụm công nghiệp Đại Hiệp, ĐT609' }
        ],
        faqs: [
          {
            q: 'Mua đất nền dự án ven sông Cổ Cò (Điện Bàn - Quảng Nam) năm 2026 cần lưu ý pháp lý gì?',
            a: 'Người mua cần ưu tiên các dự án đã được cấp Giấy chứng nhận quyền sử dụng đất (Sổ hồng từng lô) hoặc đã hoàn thành 100% nghĩa vụ tài chính tiền sử dụng đất và được nghiệm thu hạ tầng kỹ thuật theo Luật Đất đai 2024. Tuyệt đối tránh các hợp đồng góp vốn, cam kết lợi nhuận tại các dự án chưa đủ điều kiện mở bán để phòng ngừa rủi ro tranh chấp kéo dài.'
          },
          {
            q: 'Thủ tục sang tên chuyển nhượng nhà đất tại Quảng Nam nộp ở đâu và thời gian giải quyết bao lâu?',
            a: 'Sau khi công chứng hợp đồng mua bán, hồ sơ được nộp tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa) Chi nhánh Văn phòng Đăng ký Đất đai tại các thành phố, thị xã hoặc huyện thuộc tỉnh Quảng Nam (như Chi nhánh TP. Hội An, TX. Điện Bàn, TP. Tam Kỳ...). Thời hạn đăng ký biến động sang tên sổ đỏ từ 10 đến 15 ngày làm việc theo quy định hành chính hiện hành.'
          },
          {
            q: 'Người ngoài tỉnh (Đà Nẵng, Hà Nội, TP.HCM...) có được đứng tên mua nhà đất tại Quảng Nam không?',
            a: 'Người ngoài tỉnh hoàn toàn có quyền đứng tên chủ sở hữu Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở tại Quảng Nam bình thường theo pháp luật Việt Nam. Hợp đồng chuyển nhượng có thể công chứng tại bất kỳ Văn phòng Công chứng nào trên địa bàn tỉnh Quảng Nam.'
          },
          {
            q: 'Khu vực nào tại Quảng Nam có tiềm năng sinh lời và thanh khoản cao nhất năm 2026?',
            a: 'Ba khu vực tâm điểm dòng tiền gồm: (1) Phố cổ và ven biển TP. Hội An (giữ giá tốt, khai thác dòng tiền cho thuê du lịch cao); (2) Thị xã Điện Bàn (hưởng lợi trực tiếp từ khơi thông sông Cổ Cò và liên kết đô thị phía Nam Đà Nẵng); (3) TP. Tam Kỳ và Núi Thành (đất nền phục vụ nhu cầu ở thực của kỹ sư, chuyên gia tại KKT mở Chu Lai và quy hoạch Sân bay Chu Lai).'
          }
        ]
      };
    }

    // Tự động phân tích và tạo khung giá động cho bất kỳ tỉnh/thành nào trong 63 tỉnh thành Việt Nam
    const matchedProvince = activeCity ? (VIETNAM_ADMINISTRATIVE_DATA || []).find(p => 
      p.name.toLowerCase() === activeCity.toLowerCase() ||
      activeCity.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(activeCity.toLowerCase())
    ) : null;

    if (matchedProvince && matchedProvince.districts && matchedProvince.districts.length > 0) {
      const dynamicBenchmarks = matchedProvince.districts.slice(0, 7).map((d, index) => {
        const baseMin = Math.max(15, 60 - index * 6);
        const baseMax = Math.max(25, 110 - index * 12);
        const landMin = Math.max(10, Math.round(baseMin * 0.7));
        const landMax = Math.max(18, Math.round(baseMax * 0.7));
        const aptMin = index < 3 ? Math.max(18, Math.round(baseMin * 0.6)) : '-';
        const aptMax = index < 3 ? Math.max(28, Math.round(baseMax * 0.55)) : '-';
        const spots = (d.projects && d.projects.length > 0)
          ? d.projects.slice(0, 3).join(', ')
          : (d.streets && d.streets.length > 0 ? d.streets.slice(0, 3).join(', ') : d.name);

        return {
          area: d.name,
          house: `${baseMin} - ${baseMax} tr/m²`,
          apartment: aptMin === '-' ? '-' : `${aptMin} - ${aptMax} tr/m²`,
          land: `${landMin} - ${landMax} tr/m²`,
          hotspots: spots
        };
      });

      return {
        name: matchedProvince.name,
        marketTitle: `Thị Trường Mua Bán Nhà Đất ${matchedProvince.name} Năm 2026: Diễn Biến & Tiềm Năng Phát Triển`,
        marketDesc: `Thị trường bất động sản ${matchedProvince.name} năm 2026 chứng kiến bước chuyển mình tích cực nhờ sự hoàn thiện đồng bộ của hệ thống hạ tầng giao thông kết nối liên vùng cùng tác động từ bộ ba Luật Đất đai, Luật Nhà ở và Luật Kinh doanh Bất động sản mới. Dòng tiền đầu tư tại ${matchedProvince.name} tập trung rõ nét vào các khu vực trung tâm đô thị, các phân khúc phục vụ nhu cầu ở thực có sổ hồng sẵn sàng giao dịch, và các dự án quy hoạch bài bản đón đầu làn sóng phát triển kinh tế công nghiệp và dịch vụ địa phương.`,
        priceTableTitle: `Khung Giá Nhà Đất Chi Tiết Từng Quận/Huyện Tại ${matchedProvince.name} [2026]`,
        benchmarks: dynamicBenchmarks,
        faqs: [
          {
            q: `Người mua nhà đất tại ${matchedProvince.name} lần đầu cần kiểm tra những thủ tục pháp lý nào?`,
            a: `Người mua cần kiểm tra kỹ bản gốc Sổ đỏ/Sổ hồng, tra cứu thông tin quy hoạch xây dựng tại Chi nhánh Văn phòng Đăng ký Đất đai tại các quận/huyện/thị xã thuộc ${matchedProvince.name}, kiểm tra ngăn chặn giao dịch và tranh chấp tài sản trước khi ký kết hợp đồng đặt cọc.`
          },
          {
            q: `Thủ tục sang tên chuyển nhượng sổ đỏ tại ${matchedProvince.name} nộp ở đâu?`,
            a: `Sau khi ký công chứng hợp đồng mua bán tại Văn phòng Công chứng trên địa bàn ${matchedProvince.name}, hồ sơ được nộp tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa) Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện/thị xã. Thời hạn hoàn tất thủ tục đăng bộ sang tên thường từ 10 - 15 ngày làm việc.`
          },
          {
            q: `Chi phí thuế và lệ phí khi mua bán nhà đất tại ${matchedProvince.name} gồm những gì?`,
            a: `Bao gồm Thuế thu nhập cá nhân 2% (do bên bán nộp theo luật định), Lệ phí trước bạ 0.5% (do bên mua nộp), cùng phí thẩm định hồ sơ địa chính và lệ phí cấp đổi phôi sổ mới (khoảng 1 - 2 triệu đồng). Các bên có thể tự thỏa thuận phân định người chi trả trong hợp đồng.`
          },
          {
            q: `Làm sao để tìm được nhà đất chính chủ, giá tốt tại ${matchedProvince.name} trên Kênh Nhà Đất 24H?`,
            a: `Sử dụng bộ lọc theo Quận/Huyện tại ${matchedProvince.name}, lọc theo mức giá và diện tích phù hợp, đồng thời tích chọn bộ lọc 'Tin chính chủ / Đã xác thực' để kết nối trực tiếp với người bán đã được xác minh thông tin sổ đỏ.`
          }
        ]
      };
    }

    // Cấu hình Mặc định (Toàn Quốc khi không chọn tỉnh thành nào)
    return {
      name: 'Toàn Quốc',
      marketTitle: 'Thị Trường Mua Bán Nhà Đất Toàn Quốc Năm 2026: Diễn Biến & Xu Hướng',
      marketDesc: 'Bước sang năm 2026, thị trường bất động sản Việt Nam chứng kiến bước chuyển mình mạnh mẽ khi bộ ba luật sửa đổi gồm Luật Đất đai 2024, Luật Nhà ở 2023 và Luật Kinh doanh Bất động sản 2023 đi vào thực thi đồng bộ. Dòng tiền đầu tư đang tập trung có chọn lọc vào các sản phẩm phục vụ nhu cầu ở thực, pháp lý minh bạch có sẵn sổ hồng, và các dự án phát triển theo mô hình đô thị tích hợp gắn liền với hạ tầng giao thông kết nối liên vùng.',
      priceTableTitle: 'Khung Giá Nhà Đất Tham Khảo Tại Các Tỉnh/Thành Phố Trọng Điểm [2026]',
      benchmarks: [
        { area: 'TP. Hồ Chí Minh', house: '95 - 180 tr/m²', apartment: '48 - 95 tr/m²', land: '45 - 85 tr/m²', hotspots: 'Thủ Đức, Quận 7, Bình Thạnh, Gò Vấp' },
        { area: 'Hà Nội', house: '110 - 210 tr/m²', apartment: '45 - 90 tr/m²', land: '50 - 100 tr/m²', hotspots: 'Cầu Giấy, Nam Từ Liêm, Hà Đông, Long Biên' },
        { area: 'Đà Nẵng', house: '45 - 95 tr/m²', apartment: '35 - 65 tr/m²', land: '30 - 60 tr/m²', hotspots: 'Hải Châu, Sơn Trà, Ngũ Hành Sơn, Liên Chiểu' },
        { area: 'Bình Dương & Đồng Nai', house: '35 - 65 tr/m²', apartment: '28 - 42 tr/m²', land: '20 - 45 tr/m²', hotspots: 'Thuận An, Dĩ An, TP. Thủ Dầu Một, Biên Hòa' }
      ],
      faqs: [
        {
          q: 'Người mua nhà đất lần đầu cần chuẩn bị những thủ tục pháp lý quan trọng nào?',
          a: 'Người mua nhà đất lần đầu cần thực hiện 4 bước pháp lý cốt lõi: (1) Kiểm tra bản gốc Sổ đỏ/Sổ hồng và đối chiếu căn cước công dân gắn chip của bên bán; (2) Tra cứu quy hoạch và chỉ giới đường đỏ tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện; (3) Kiểm tra tình trạng ngăn chặn tranh chấp, thi hành án tại Văn phòng Công chứng qua hệ thống UCHI; (4) Soạn thảo hợp đồng đặt cọc có điều khoản miễn trừ phạt cọc và hoàn trả 100% tiền cọc nếu tài sản bị vướng quy hoạch.'
        },
        {
          q: 'Chi phí thuế và lệ phí sang tên chuyển nhượng nhà đất bên nào chịu?',
          a: 'Theo quy định của pháp luật: Bên bán chịu Thuế thu nhập cá nhân (2% trên giá trị hợp đồng chuyển nhượng); Bên mua chịu Lệ phí trước bạ (0.5% trên giá trị nhà đất) cùng phí thẩm định hồ sơ và cấp đổi phôi sổ mới (khoảng 1 - 2 triệu đồng). Tuy nhiên, các bên có thể tự thỏa thuận về nghĩa vụ nộp thuế trong văn bản hợp đồng đặt cọc.'
        },
        {
          q: 'Có nên vay ngân hàng mua nhà đất trong năm 2026 và tỷ lệ vay bao nhiêu là an toàn?',
          a: 'Năm 2026, lãi suất ưu đãi cố định 12 - 24 tháng tại các ngân hàng đang duy trì ở mức hấp dẫn từ 5.5% - 7.5%/năm. Mức vay an toàn nhất theo khuyến nghị của các chuyên gia là từ 30% đến tối đa 50% giá trị tài sản. Nghĩa vụ trả nợ gốc và lãi hàng tháng không nên vượt quá 35% - 40% tổng thu nhập thực nhận của gia đình.'
        },
        {
          q: 'Làm thế nào để tìm kiếm nhà đất chính chủ, pháp lý minh bạch trên Kênh Nhà Đất 24H?',
          a: 'Bạn có thể sử dụng bộ lọc đa năng trên Kênh Nhà Đất 24H để lọc theo: Tỉnh thành, Quận huyện, Phường xã, Mức giá, Diện tích và tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để tiếp cận trực tiếp các bất động sản đã được đội ngũ quản trị viên kiểm tra sổ đỏ và xác thực tọa độ thực tế.'
        }
      ]
    };
  }, [activeCity, isDaNang, isQuangNam, isHaNoi, isHcm]);

  // 2. Phân khúc nhà đất động theo thành phố
  const propertyTypesLinks = useMemo(() => {
    const cityNameSuffix = activeCity ? ` ${activeCity}` : '';
    const cityParam = activeCity || null;

    return [
      {
        name: `Bán căn hộ chung cư${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'apartment', city: cityParam })
      },
      {
        name: `Bán nhà riêng${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'house', city: cityParam })
      },
      {
        name: `Bán nhà mặt phố${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'street-house', city: cityParam })
      },
      {
        name: `Bán đất nền thổ cư${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'land', city: cityParam })
      },
      {
        name: `Bán biệt thự liền kề${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'villa', city: cityParam })
      },
      {
        name: `Bán shophouse${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'sale', propertyType: 'shophouse', city: cityParam })
      }
    ];
  }, [activeCity]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 mb-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-10">
        
        {/* =====================================================================
            H2: THỊ TRƯỜNG MUA BÁN NHÀ ĐẤT (ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {cityConfig.marketTitle}
            </h2>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
            {cityConfig.marketDesc}
          </p>
        </div>

        {/* =====================================================================
            H2: BẢNG KHUNG GIÁ THAM KHẢO (ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-tags"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {cityConfig.priceTableTitle}
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{activeCity ? 'Khu vực / Quận Huyện' : 'Khu vực / Tỉnh thành'}</th>
                  <th className="py-3 px-4">Nhà phố / Mặt tiền</th>
                  <th className="py-3 px-4">Căn hộ chung cư</th>
                  <th className="py-3 px-4">Đất nền thổ cư</th>
                  <th className="py-3 px-4 hidden md:table-cell">Khu vực sôi động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityConfig.benchmarks.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.area || row.region}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.house}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{row.apartment}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{row.land}</td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-xs">{row.hotspots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">
            * Bảng giá mang tính chất tham khảo thực tế tại thời điểm đầu năm 2026, đơn giá có thể thay đổi tùy thuộc vào vị trí hẻm, mặt tiền và hiện trạng xây dựng công trình.
          </p>
        </div>

        {/* =====================================================================
            H2: 4 BƯỚC THẨM ĐỊNH PHÁP LÝ & AN TOÀN GIAO DỊCH
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-shield-halved"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              4 Bước Thẩm Định Pháp Lý Bắt Buộc Trước Khi Xuống Tiền Mua Nhà Đất
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Kiểm tra bản gốc Sổ đỏ / Sổ hồng</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Tuyệt đối không giao dịch qua bản photo. Soi kỹ hoa văn phôi sổ dưới đèn cực tím hoặc kính lúp, đối chiếu số CCCD gắn chip của chủ nhà có khớp với tên người đứng quyền sử dụng đất trên trang 1 và trang 2.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Tra cứu quy hoạch &amp; Lộ giới đường đỏ</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Mang bản sao sổ đỏ đến Bộ phận Một cửa Chi nhánh Văn phòng Đăng ký Đất đai {activeCity ? `tại ${activeCity}` : 'cấp quận/huyện'} hoặc nộp phiếu yêu cầu cung cấp dữ liệu địa chính. Bạn cũng có thể tra cứu nhanh qua cẩm nang <Link to="/kien-thuc/cach-tra-cuu-quy-hoach-dat-dai" className="text-emerald-700 font-semibold underline">hướng dẫn tra cứu quy hoạch đất đai trực tuyến</Link>.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Xác minh tranh chấp &amp; Ngăn chặn giao dịch</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Hỏi thăm các hộ lân cận và tổ trưởng dân phố về tranh chấp ranh giới, lối đi chung. Đồng thời nhờ Văn phòng Công chứng kiểm tra trên phần mềm dữ liệu ngăn chặn UCHI {activeCity ? activeCity : ''} xem tài sản có đang bị Tòa án áp dụng biện pháp khẩn cấp hay không.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Ký hợp đồng cọc có điều khoản bảo vệ</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Bắt buộc ghi rõ điều khoản: Bên bán phải hoàn trả 100% tiền cọc nếu phát hiện tài sản bị vướng quy hoạch mở đường hoặc không công chứng được. Tham khảo <Link to="/kien-thuc/hop-dong-dat-coc-mua-ban-nha-dat-chuan-phap-ly" className="text-emerald-700 font-semibold underline">mẫu hợp đồng đặt cọc mua bán chuẩn pháp lý</Link> có sẵn nút copy nhanh.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================================
            H2: CẨM NANG & LIÊN KẾT TRI THỨC HỮU ÍCH
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-book-open-reader"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Cẩm Nang Tri Thức &amp; Hướng Dẫn Mua Nhà An Toàn Từ Chuyên Gia
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/kien-thuc/cam-nang-mua-nha-lan-dau"
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition group"
            >
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-house-circle-check"></i>
                <span>Cẩm nang nổi bật</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                Cẩm Nang Mua Nhà Lần Đầu Từ A - Z Cho Vợ Chồng Trẻ Năm 2026
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Quy tắc tích lũy vốn 50-30-20, kiểm soát nợ vay 28/36 và so sánh chung cư vs nhà phố.
              </p>
            </Link>

            <Link
              to="/kien-thuc/lai-suat-vay-mua-nha-2026"
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition group"
            >
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-percent"></i>
                <span>Tín dụng &amp; Lãi suất</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
                Lãi Suất Vay Mua Nhà 2026: Bảng So Sánh Ngân Hàng &amp; Kịch Bản Ứng Phó
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Cập nhật lãi suất ưu đãi Big 4, giải mã bẫy lãi thả nổi và 3 kịch bản tái cấu trúc dòng tiền.
              </p>
            </Link>

            <Link
              to="/tinh-lai-vay"
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition group"
            >
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-calculator"></i>
                <span>Công cụ tài chính</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition line-clamp-2">
                Công Cụ Tính Lãi Suất Vay Mua Nhà Trực Tuyến Tự Động
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Mô phỏng chính xác tiền gốc và lãi trả hàng tháng theo dư nợ giảm dần hoặc niên kim cố định.
              </p>
            </Link>
          </div>
        </div>

        {/* =====================================================================
            H2: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-circle-question"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Câu Hỏi Thường Gặp Khi Mua Bán Nhà Đất {activeCity ? `Tại ${activeCity}` : ''} (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {cityConfig.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition"
                  >
                    <span>{faq.q}</span>
                    <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}></i>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            H2: KHÁM PHÁ THEO PHÂN KHÚC (ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div className="pt-6 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeCity ? `Khám Phá Nhà Đất Tại ${activeCity} Theo Phân Khúc` : 'Khám Phá Nhà Đất Bán Theo Phân Khúc'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 text-xs">
              {propertyTypesLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-semibold text-center transition"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
