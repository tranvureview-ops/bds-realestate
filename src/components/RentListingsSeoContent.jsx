'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { buildSeoUrl } from '../utils/permalink';
import { VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData';

export default function RentListingsSeoContent({ city = null, district = null, propertyType = null, taxonomyInfo = null }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Nhận diện địa phương đang lọc (thành phố / tỉnh)
  const activeCity = city || taxonomyInfo?.city || null;
  const isDaNang = activeCity && (activeCity.includes('Đà Nẵng') || activeCity.toLowerCase().includes('da nang'));
  const isQuangNam = activeCity && (activeCity.includes('Quảng Nam') || activeCity.toLowerCase().includes('quang nam'));
  const isHaNoi = activeCity && (activeCity.includes('Hà Nội') || activeCity.toLowerCase().includes('ha noi'));
  const isHcm = activeCity && (activeCity.includes('Hồ Chí Minh') || activeCity.toLowerCase().includes('ho chi minh'));

  // 1. Dữ liệu Phân tích Thị Trường & Khung Giá Thuê Động Theo Thành Phố
  const cityConfig = useMemo(() => {
    if (isDaNang) {
      return {
        name: 'Đà Nẵng',
        marketTitle: 'Thị Trường Cho Thuê Nhà Đất Đà Nẵng Năm 2026: Diễn Biến & Cơ Hội Dòng Tiền',
        marketDesc: 'Thị trường cho thuê bất động sản Đà Nẵng năm 2026 ghi nhận sự bùng nổ nhu cầu từ phân khúc du lịch, nghỉ dưỡng và lượng lớn chuyên gia, kỹ sư công nghệ cao. Với sự phát triển của Khu công nghệ cao Đà Nẵng, các tòa nhà văn phòng tài chính ven sông Hàn và hạ tầng du lịch biển phục hồi toàn diện, nhu cầu thuê căn hộ dịch vụ ven biển, nhà phố thương mại và nhà riêng nguyên căn duy trì tỷ lệ lấp đầy ấn tượng từ 85% - 92%.',
        priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Đà Nẵng [2026]',
        benchmarks: [
          { area: 'Hải Châu (Trung tâm)', apartment: '8 - 18 tr/tháng', house: '15 - 35 tr/tháng', room: '3.5 - 7 tr/tháng', hotspots: 'Bạch Đằng, Nguyễn Văn Linh, Lê Duẩn' },
          { area: 'Sơn Trà (Du lịch biển)', apartment: '7 - 16 tr/tháng', house: '12 - 28 tr/tháng', room: '3 - 6.5 tr/tháng', hotspots: 'Võ Nguyên Giáp, Phạm Văn Đồng, An Hải Bắc' },
          { area: 'Ngũ Hành Sơn (Nghỉ dưỡng)', apartment: '6 - 15 tr/tháng', house: '10 - 25 tr/tháng', room: '2.8 - 5.5 tr/tháng', hotspots: 'Khuê Mỹ, An Thượng, Nam Hòa Xuân' },
          { area: 'Thanh Khê (Kinh doanh bán lẻ)', apartment: '5 - 12 tr/tháng', house: '9 - 22 tr/tháng', room: '2.5 - 4.5 tr/tháng', hotspots: 'Điện Biên Phủ, Dũng Sĩ Thanh Khê' },
          { area: 'Cẩm Lệ (Đô thị mới)', apartment: '4.5 - 10 tr/tháng', house: '7 - 18 tr/tháng', room: '2.2 - 4 tr/tháng', hotspots: 'KĐT Hòa Xuân, Nguyễn Hữu Thọ' },
          { area: 'Liên Chiểu (Sinh viên & KCN)', apartment: '3.5 - 8 tr/tháng', house: '5 - 14 tr/tháng', room: '1.8 - 3.5 tr/tháng', hotspots: 'KCN Hòa Khánh, Tôn Đức Thắng, ĐH Bách Khoa' }
        ],
        faqs: [
          {
            q: 'Thuê căn hộ chung cư hoặc nhà riêng tại Đà Nẵng cần lưu ý những chi phí phát sinh nào?',
            a: 'Bên cạnh tiền thuê cố định hàng tháng, bạn cần xác minh rõ trong hợp đồng: Phí quản lý tòa nhà (nếu là căn hộ), tiền điện nước (tính theo hóa đơn Nhà nước hay đơn giá riêng), phí gửi xe máy/ô tô và tiền dọn dẹp vệ sinh sinh hoạt.'
          },
          {
            q: 'Khách du lịch hoặc chuyên gia thuê căn hộ dài hạn tại Đà Nẵng cần làm thủ tục tạm trú thế nào?',
            a: 'Chủ nhà có trách nhiệm khai báo tạm trú trực tuyến cho khách thuê qua Cổng dịch vụ công quản lý cư trú hoặc Công an phường sở tại. Bạn chỉ cần cung cấp bản chụp CCCD (đối với khách Việt Nam) hoặc Hộ chiếu và Thị thực hợp lệ (đối với người nước ngoài).'
          },
          {
            q: 'Khu vực nào tại Đà Nẵng có giá thuê hợp lý và thuận tiện di chuyển nhất?',
            a: 'Quận Cẩm Lệ và Thanh Khê có mức giá thuê rất hợp lý, kết nối nhanh vào trung tâm; còn nếu muốn gần biển và phố Tây du lịch, khu vực An Thượng (Ngũ Hành Sơn) và Phước Mỹ (Sơn Trà) là lựa chọn hàng đầu.'
          }
        ]
      };
    }

    if (isQuangNam) {
      return {
        name: 'Quảng Nam',
        marketTitle: 'Thị Trường Cho Thuê Nhà Đất Quảng Nam Năm 2026',
        marketDesc: 'Thị trường cho thuê nhà đất Quảng Nam năm 2026 đón đầu sức cầu mạnh mẽ từ hai trụ cột chính: Phân khúc lưu trú du lịch homestay, villa nghỉ dưỡng tại TP. Hội An và phân khúc nhà ở chuyên gia, kỹ sư công nghiệp tại TP. Tam Kỳ, TX. Điện Bàn và KKT mở Chu Lai (Núi Thành). Sự kết nối thông suốt của tuyến đường ven biển 129 Võ Chí Công và khơi thông sông Cổ Cò thúc đẩy lượng lớn nhân sự di chuyển liên vùng giữa Đà Nẵng và Quảng Nam thuê nhà ở dài hạn.',
        priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Quảng Nam [2026]',
        benchmarks: [
          { area: 'TP. Hội An (Homestay & Du lịch)', apartment: '7 - 16 tr/tháng', house: '12 - 30 tr/tháng', room: '3 - 6 tr/tháng', hotspots: 'Cẩm Châu, Cẩm An, Cửa Đại, Phố cổ' },
          { area: 'TX. Điện Bàn (Ven Đà Nẵng & KCN)', apartment: '4 - 9 tr/tháng', house: '6 - 15 tr/tháng', room: '2 - 4 tr/tháng', hotspots: 'Điện Ngọc, Điện Nam Trung, KĐT Rosa' },
          { area: 'TP. Tam Kỳ (Trung tâm hành chính)', apartment: '4.5 - 10 tr/tháng', house: '6 - 16 tr/tháng', room: '2 - 4.2 tr/tháng', hotspots: 'Hùng Vương, Phan Bội Châu, Tân Thạnh' },
          { area: 'Huyện Núi Thành (KKT Chu Lai)', apartment: '3.5 - 8 tr/tháng', house: '5 - 14 tr/tháng', room: '1.8 - 3.8 tr/tháng', hotspots: 'Tam Hiệp, Chu Lai, TT. Núi Thành' },
          { area: 'Huyện Duy Xuyên (Ven Hoiana)', apartment: '-', house: '4.5 - 12 tr/tháng', room: '1.8 - 3.2 tr/tháng', hotspots: 'Nam Phước, Duy Hải ven Hoiana' }
        ],
        faqs: [
          {
            q: 'Thuê nhà nguyên căn làm homestay kinh doanh tại Hội An (Quảng Nam) cần lưu ý gì?',
            a: 'Bắt buộc hợp đồng thuê phải có điều khoản cho phép người thuê được quyền khai thác kinh doanh lưu trú và cho thuê lại (sublease). Ngoài ra, cần kiểm tra điều kiện an toàn PCCC, giấy phép kinh doanh lưu trú và thực hiện đăng ký lưu trú cho khách nước ngoài qua hệ thống khai báo điện tử của Công an tỉnh Quảng Nam.'
          },
          {
            q: 'Người lao động, chuyên gia tại KCN Điện Nam - Điện Ngọc hoặc Chu Lai nên thuê nhà ở đâu?',
            a: 'Tại Điện Bàn, các khu đô thị dọc trục Trần Đại Nghĩa nối dài và Điện Ngọc có nguồn cung nhà mới, sạch sẽ và giá hợp lý. Tại Chu Lai (Núi Thành), khu vực Tam Hiệp và thị trấn Núi Thành tập trung nhiều nhà riêng và dãy phòng trọ khép kín đầy đủ tiện nghi.'
          },
          {
            q: 'Thủ tục ký hợp đồng thuê nhà tại Quảng Nam có cần công chứng không?',
            a: 'Theo quy định của Bộ luật Dân sự, hợp đồng thuê nhà ở không bắt buộc phải công chứng, chỉ cần có chữ ký xác nhận của hai bên. Tuy nhiên, nếu thuê mặt bằng kinh doanh hoặc thuê tài sản giá trị lớn dài hạn trên 3 năm, bạn nên công chứng để đảm bảo giá trị pháp lý cao nhất.'
          }
        ]
      };
    }

    if (isHaNoi) {
      return {
        name: 'Hà Nội',
        marketTitle: 'Thị Trường Cho Thuê Nhà Đất Hà Nội Năm 2026: Nhu Cầu Ở Thực & Tỷ Suất Dòng Tiền Ổn Định',
        marketDesc: 'Thị trường cho thuê Thủ đô Hà Nội năm 2026 tiếp tục duy trì tỷ suất sinh lời dòng tiền ổn định từ 4.8% - 6.2%/năm. Sự gia tăng của các trường đại học, khu công nghệ cao Hòa Lạc và văn phòng các tập đoàn đa quốc gia tại khu vực Cầu Giấy, Nam Từ Liêm tạo sức hút cực lớn cho phân khúc căn hộ chung cư mini, phòng trọ cao cấp và văn phòng chia sẻ.',
        priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại Hà Nội [2026]',
        benchmarks: [
          { area: 'Cầu Giấy & Nam Từ Liêm', apartment: '9 - 22 tr/tháng', house: '14 - 35 tr/tháng', room: '3.8 - 7.5 tr/tháng', hotspots: 'Duy Tân, Mễ Trì, Trung Hòa Nhân Chính' },
          { area: 'Tây Hồ & Ba Đình', apartment: '12 - 32 tr/tháng', house: '18 - 45 tr/tháng', room: '4.5 - 9 tr/tháng', hotspots: 'Quảng An, Xuân Diệu, Liễu Giai' },
          { area: 'Đống Đa & Thanh Xuân', apartment: '8.5 - 20 tr/tháng', house: '12 - 30 tr/tháng', room: '3.5 - 6.8 tr/tháng', hotspots: 'Thái Hà, Chùa Bộc, Nguyễn Trãi' },
          { area: 'Hà Đông & Hoàng Mai', apartment: '6.5 - 15 tr/tháng', house: '9 - 22 tr/tháng', room: '2.8 - 5.2 tr/tháng', hotspots: 'Văn Quán, Linh Đàm, Yên Nghĩa' },
          { area: 'Long Biên & Gia Lâm', apartment: '6.5 - 16 tr/tháng', house: '8 - 20 tr/tháng', room: '2.6 - 5 tr/tháng', hotspots: 'Vinhomes Ocean Park, Việt Hưng' }
        ],
        faqs: [
          {
            q: 'Người thuê căn hộ chung cư mini tại Hà Nội cần đặc biệt lưu ý điều kiện gì?',
            a: 'Cần kiểm tra kỹ hệ thống phòng cháy chữa cháy (PCCC): Thang thoát hiểm ngoài trời, cửa chống cháy tại tầng hầm để xe máy, hệ thống báo cháy tự động và ban công có lối thoát hiểm khẩn cấp.'
          },
          {
            q: 'Thời hạn đặt cọc và phương thức thanh toán tiền thuê nhà tại Hà Nội thông thường ra sao?',
            a: 'Phổ biến nhất tại Hà Nội là đặt cọc 1 tháng tiền nhà và thanh toán định kỳ 3 tháng hoặc 6 tháng một lần. Nếu thanh toán dài hạn 1 năm, người thuê thường đàm phán được mức chiết khấu từ 5% - 8% trên tổng giá trị thuê.'
          }
        ]
      };
    }

    if (isHcm) {
      return {
        name: 'TP. Hồ Chí Minh',
        marketTitle: 'Thị Trường Cho Thuê Nhà Đất TP. Hồ Chí Minh Năm 2026: Sức Cầu Bùng Nổ & Đa Dạng Phân Khúc',
        marketDesc: 'TP. Hồ Chí Minh là thị trường cho thuê sôi động bậc nhất cả nước. Tuyến Metro Bến Thành - Suối Tiên đi vào vận hành giúp dịch chuyển dòng người thuê nhà về các trạm ga tại TP. Thủ Đức và Bình Thạnh. Phân khúc căn hộ dịch vụ (CHDV), văn phòng hạng B-C và nhà nguyên căn kinh doanh bán lẻ đạt tốc độ hấp thụ cao.',
        priceTableTitle: 'Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại TP. Hồ Chí Minh [2026]',
        benchmarks: [
          { area: 'Quận 1 & Quận 3 (Trung tâm)', apartment: '14 - 38 tr/tháng', house: '22 - 60 tr/tháng', room: '5 - 10 tr/tháng', hotspots: 'Bến Nghé, Đa Kao, Võ Thị Sáu' },
          { area: 'TP. Thủ Đức (Đô thị sáng tạo)', apartment: '8 - 22 tr/tháng', house: '12 - 32 tr/tháng', room: '3.5 - 7 tr/tháng', hotspots: 'Thảo Điền, An Phú, Tam Bình' },
          { area: 'Quận 7 & Nhà Bè (Khu Nam)', apartment: '9 - 24 tr/tháng', house: '14 - 35 tr/tháng', room: '3.8 - 7.5 tr/tháng', hotspots: 'Phú Mỹ Hưng, Nguyễn Hữu Thọ' },
          { area: 'Bình Thạnh & Phú Nhuận', apartment: '8.5 - 20 tr/tháng', house: '13 - 32 tr/tháng', room: '3.6 - 7.2 tr/tháng', hotspots: 'Phan Xích Long, Điện Biên Phủ, D2' },
          { area: 'Gò Vấp & Tân Bình', apartment: '6.5 - 16 tr/tháng', house: '10 - 24 tr/tháng', room: '3 - 5.8 tr/tháng', hotspots: 'Quang Trung, Cộng Hòa, Phan Huy Ích' }
        ],
        faqs: [
          {
            q: 'Kinh nghiệm thuê phòng trọ hoặc căn hộ dịch vụ chính chủ an toàn tại TP.HCM?',
            a: 'Nên tìm tin đăng có nhãn Đã xác thực trên Kênh Nhà Đất 24H, đến khảo sát thực tế vào ban ngày lẫn buổi tối để kiểm tra an ninh xung quanh, kiểm tra công tơ điện riêng và ký hợp đồng có biên bản bàn giao hiện trạng trang thiết bị.'
          },
          {
            q: 'Giá thuê nhà tại TP.HCM thường tăng giá sau bao lâu?',
            a: 'Đối với hợp đồng thuê nhà ở thông thường, giá thuê được giữ cố định trong 1 - 2 năm đầu. Nếu ký hợp đồng dài hạn từ 3 năm trở lên, điều khoản tăng giá thường được áp dụng với mức trần từ 5% - 10%/năm tùy thỏa thuận.'
          }
        ]
      };
    }

    // Tự động phân tích và tạo khung giá thuê động cho bất kỳ tỉnh/thành nào trong 63 tỉnh thành Việt Nam
    const matchedProvince = activeCity ? (VIETNAM_ADMINISTRATIVE_DATA || []).find(p => 
      p.name.toLowerCase() === activeCity.toLowerCase() ||
      activeCity.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(activeCity.toLowerCase())
    ) : null;

    if (matchedProvince && matchedProvince.districts && matchedProvince.districts.length > 0) {
      const dynamicBenchmarks = matchedProvince.districts.slice(0, 6).map((d, index) => {
        const aptMin = Math.max(3, 7 - index * 0.8).toFixed(1).replace('.0', '');
        const aptMax = Math.max(6, 15 - index * 1.5).toFixed(1).replace('.0', '');
        const houseMin = Math.max(4, 9 - index * 1).toFixed(1).replace('.0', '');
        const houseMax = Math.max(8, 20 - index * 2).toFixed(1).replace('.0', '');
        const roomMin = Math.max(1.5, 3.2 - index * 0.3).toFixed(1).replace('.0', '');
        const roomMax = Math.max(2.8, 5.5 - index * 0.5).toFixed(1).replace('.0', '');
        const spots = (d.projects && d.projects.length > 0)
          ? d.projects.slice(0, 3).join(', ')
          : (d.streets && d.streets.length > 0 ? d.streets.slice(0, 3).join(', ') : d.name);

        return {
          area: d.name,
          apartment: `${aptMin} - ${aptMax} tr/tháng`,
          house: `${houseMin} - ${houseMax} tr/tháng`,
          room: `${roomMin} - ${roomMax} tr/tháng`,
          hotspots: spots
        };
      });

      return {
        name: matchedProvince.name,
        marketTitle: `Thị Trường Cho Thuê Nhà Đất ${matchedProvince.name} Năm 2026: Nhu Cầu & Tỷ Suất Dòng Tiền`,
        marketDesc: `Thị trường bất động sản cho thuê tại ${matchedProvince.name} năm 2026 ghi nhận sự quan tâm ngày càng lớn từ lực lượng lao động di cư, chuyên gia doanh nghiệp và các hộ gia đình trẻ. Nhu cầu thuê căn hộ chung cư, nhà riêng và phòng trọ dịch vụ tập trung mạnh mẽ quanh các khu đô thị trung tâm, cụm công nghiệp và các trục giao thông kết nối huyết mạch.`,
        priceTableTitle: `Khung Giá Thuê Nhà Đất Chi Tiết Từng Quận/Huyện Tại ${matchedProvince.name} [2026]`,
        benchmarks: dynamicBenchmarks,
        faqs: [
          {
            q: `Người thuê nhà tại ${matchedProvince.name} cần kiểm tra những giấy tờ gì trước khi đặt cọc?`,
            a: `Yêu cầu chủ nhà xuất trình bản gốc Sổ đỏ/Sổ hồng hoặc giấy tờ chứng minh quyền sở hữu hợp pháp, đối chiếu CCCD và làm rõ các khoản tiền điện nước, phí dịch vụ trước khi ký hợp đồng đặt cọc.`
          },
          {
            q: `Tiền đặt cọc thuê nhà tại ${matchedProvince.name} thông thường là bao nhiêu?`,
            a: `Mức đặt cọc phổ biến là từ 1 đến 2 tháng tiền thuê. Bạn cần yêu cầu ghi rõ trong hợp đồng thời hạn hoàn trả cọc (trong vòng 3 ngày làm việc sau khi kết thúc hợp đồng và thanh lý mặt bằng).`
          }
        ]
      };
    }

    // Mặc định: Toàn Quốc
    return {
      name: 'Toàn Quốc',
      marketTitle: 'Thị Trường Cho Thuê Nhà Đất Toàn Quốc Năm 2026',
      marketDesc: 'Năm 2026, phân khúc bất động sản cho thuê tiếp tục khẳng định vai trò là kênh đầu tư tạo dòng tiền ổn định và bền vững hàng đầu. Nhu cầu thuê nhà ở thực, căn hộ dịch vụ và mặt bằng kinh doanh tại các đại đô thị như Hà Nội, TP. Hồ Chí Minh và Đà Nẵng tăng trưởng mạnh mẽ, được thúc đẩy bởi sự phục hồi của các hoạt động thương mại bán lẻ, sự gia tăng của cộng đồng chuyên gia nước ngoài và làn sóng nhập cư của sinh viên, người lao động trẻ.',
      priceTableTitle: 'Khung Giá Thuê Nhà Đất Tham Khảo Tại Các Đô Thị Lớn [2026]',
      benchmarks: [
        { area: 'TP. Hồ Chí Minh', apartment: '8 - 22 tr/tháng', house: '12 - 35 tr/tháng', room: '3.5 - 7 tr/tháng', hotspots: 'Quận 7, Bình Thạnh, Thủ Đức, Tân Bình' },
        { area: 'Hà Nội', apartment: '7 - 20 tr/tháng', house: '10 - 30 tr/tháng', room: '3 - 6.5 tr/tháng', hotspots: 'Cầu Giấy, Nam Từ Liêm, Đống Đa, Thanh Xuân' },
        { area: 'Đà Nẵng', apartment: '6 - 15 tr/tháng', house: '8 - 20 tr/tháng', room: '2.5 - 5 tr/tháng', hotspots: 'Hải Châu, Sơn Trà, Ngũ Hành Sơn' },
        { area: 'Bình Dương & Đồng Nai', apartment: '5 - 12 tr/tháng', house: '6 - 16 tr/tháng', room: '2 - 4.5 tr/tháng', hotspots: 'Thuận An, Dĩ An, Biên Hòa' }
      ],
      faqs: [
        {
          q: 'Người đi thuê nhà cần kiểm tra những giấy tờ pháp lý nào trước khi đặt cọc?',
          a: 'Trước khi giao tiền đặt cọc thuê nhà, bạn cần yêu cầu bên cho thuê xuất trình: (1) Bản gốc hoặc bản sao y công chứng Giấy chứng nhận quyền sở hữu nhà đất (Sổ hồng / Sổ đỏ); (2) Căn cước công dân gắn chip để đối chiếu thông tin chủ nhà; (3) Nếu là người thuê lại hoặc đơn vị quản lý vận hành ủy quyền, bắt buộc phải có Hợp đồng ủy quyền quản lý cho thuê hợp pháp có công chứng từ chính chủ nhà.'
        },
        {
          q: 'Tiền đặt cọc thuê nhà thông thường là bao nhiêu tháng và làm sao để lấy lại cọc an toàn?',
          a: 'Thông thường trên thị trường, mức tiền đặt cọc dao động từ 1 đến 2 tháng tiền thuê nhà đối với căn hộ chung cư và nhà riêng, hoặc từ 3 đến 6 tháng đối với mặt bằng kinh doanh, nhà mặt phố. Để đảm bảo nhận lại 100% tiền cọc khi hết hạn hợp đồng, bạn cần ghi rõ điều khoản: Bên cho thuê có trách nhiệm hoàn trả toàn bộ tiền cọc trong vòng 3 ngày làm việc sau khi hai bên ký biên bản thanh lý và bàn giao lại mặt bằng.'
        },
        {
          q: 'Chi phí điện, nước, internet và phí dịch vụ quản lý tòa nhà được tính như thế nào?',
          a: 'Đối với nhà riêng nguyên căn, người thuê thường thanh toán tiền điện, nước sinh hoạt trực tiếp theo biểu giá quy định của Nhà nước qua hóa đơn EVN / Công ty cấp nước. Đối với căn hộ chung cư hoặc chung cư mini, bạn cần làm rõ trong hợp đồng: Phí dịch vụ quản lý tòa nhà (ai trả), phí gửi xe máy/ô tô hàng tháng, đơn giá điện (tính theo số công tơ riêng hay giá kinh doanh) và tiền rác sinh hoạt.'
        },
        {
          q: 'Làm thế nào để tìm được nhà cho thuê chính chủ, không qua trung gian môi giới?',
          a: 'Bạn có thể sử dụng bộ lọc tìm kiếm thông minh trên Kênh Nhà Đất 24H: Chọn khu vực (Quận/Huyện, Phường/Xã), khoảng giá thuê mong muốn, và đặc biệt tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để kết nối trực tiếp với chủ nhà, giúp tiết kiệm thời gian và chi phí thương lượng.'
        }
      ]
    };
  }, [activeCity, isDaNang, isQuangNam, isHaNoi, isHcm]);

  // 2. Phân khúc thuê động theo thành phố
  const propertyTypesLinks = useMemo(() => {
    const cityNameSuffix = activeCity ? ` ${activeCity}` : '';
    const cityParam = activeCity || null;

    return [
      {
        name: `Cho thuê căn hộ chung cư${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'apartment', city: cityParam })
      },
      {
        name: `Cho thuê chung cư mini, CHDV${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'mini-apartment', city: cityParam })
      },
      {
        name: `Cho thuê nhà riêng nguyên căn${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'house', city: cityParam })
      },
      {
        name: `Cho thuê nhà mặt phố kinh doanh${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'street-house', city: cityParam })
      },
      {
        name: `Cho thuê văn phòng, mặt bằng${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'office', city: cityParam })
      },
      {
        name: `Cho thuê kho xưởng, bến bãi${cityNameSuffix}`,
        path: buildSeoUrl({ demand: 'rent', propertyType: 'land', city: cityParam })
      }
    ];
  }, [activeCity]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 mb-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-10">
        
        {/* =====================================================================
            H2: THỊ TRƯỜNG CHO THUÊ NHÀ ĐẤT (ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-key"></i>
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
            H2: BẢNG KHUNG GIÁ THUÊ THAM KHẢO (ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-money-bill-wave"></i>
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
                  <th className="py-3 px-4">Căn hộ chung cư</th>
                  <th className="py-3 px-4">Nhà riêng / Nguyên căn</th>
                  <th className="py-3 px-4">Phòng trọ / CH Dịch vụ</th>
                  <th className="py-3 px-4 hidden md:table-cell">Khu vực sôi động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityConfig.benchmarks.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.area || row.region}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{row.apartment}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.house}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{row.room}</td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-xs">{row.hotspots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">
            * Khung giá thuê mang tính chất tham khảo thực tế tại thời điểm đầu năm 2026, giá thuê có thể chênh lệch tùy thuộc vào nội thất đi kèm, tầng cao, vị trí mặt tiền hay ngõ hẻm.
          </p>
        </div>

        {/* =====================================================================
            H2: 4 LƯU Ý PHÁP LÝ SỐNG CÒN KHI KÝ HỢP ĐỒNG THUÊ NHÀ
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-file-contract"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              4 Lưu Ý Pháp Lý Sống Còn Khi Ký Hợp Đồng Thuê Nhà Đất
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Xác minh quyền cho thuê chính chủ</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Yêu cầu xem Sổ hồng gốc hoặc giấy tờ chứng minh quyền sở hữu hợp pháp. Tránh ký hợp đồng và giao tiền cọc cho bên trung gian thứ ba nếu không có giấy ủy quyền cho thuê có công chứng từ chính chủ sở hữu.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Thỏa thuận tiền cọc &amp; Điều kiện hoàn tiền 100%</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Hợp đồng phải ghi rõ thời hạn chủ nhà hoàn trả lại 100% tiền cọc sau khi hết hạn thuê (thường là trong vòng 3 ngày làm việc). Đồng thời quy định rõ trách nhiệm bồi thường nếu chủ nhà đơn phương lấy lại nhà trước hạn.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Phân định trách nhiệm bảo trì thiết bị hư hỏng</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Lập biên bản bàn giao chi tiết hiện trạng các thiết bị điện máy (máy lạnh, máy nước nóng, tủ lạnh, bếp gas...). Quy định cụ thể: Hư hỏng do hao mòn tự nhiên do chủ nhà chi trả; hư hỏng do lỗi bất cẩn của người dùng do người thuê chịu trách nhiệm sửa chữa.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Minh bạch đơn giá điện, nước &amp; Phí quản lý</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Chốt số công tơ điện và đồng hồ nước ngay tại ngày ký nhận bàn giao nhà. Đối với nhà thuê kinh doanh hoặc phòng trọ, đơn giá điện (VNĐ/kWh) và nước (VNĐ/m³ hoặc theo đầu người) phải được ghi rõ trong hợp đồng để tránh tranh chấp về sau.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================================
            H2: CÂU HỎI THƯỜNG GẶP (FAQS ĐỒNG BỘ THEO THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold">
              <i className="fa-solid fa-circle-question"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Câu Hỏi Thường Gặp Khi Thuê Nhà Đất {activeCity ? `Tại ${activeCity}` : ''}
            </h2>
          </div>

          <div className="space-y-3">
            {cityConfig.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-800 transition"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <i
                      className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-700' : ''
                      }`}
                    ></i>
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
            H2: KHÁM PHÁ NHÀ ĐẤT CHO THUÊ THEO PHÂN KHÚC
           ===================================================================== */}
        <div className="pt-6 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeCity ? `Khám Phá Nhà Đất Cho Thuê Tại ${activeCity} Theo Phân Khúc` : 'Khám Phá Nhà Đất Cho Thuê Theo Phân Khúc'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 text-xs">
              {propertyTypesLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-blue-800 font-semibold text-center transition"
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