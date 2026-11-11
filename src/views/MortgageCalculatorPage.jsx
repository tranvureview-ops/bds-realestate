'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import MortgageCalculatorModal from '../components/MortgageCalculatorModal';

export default function MortgageCalculatorPage({ initialParams = {} }) {
  const price = initialParams?.price;
  const ratio = initialParams?.ratio;
  const years = initialParams?.years;
  const rate = initialParams?.rate;
  const propertyTitle = initialParams?.propertyTitle || initialParams?.property;

  const bankRates = [
    { name: 'Vietcombank', promoRate: '6.0%', floatingRate: '9.5%', maxRatio: '70%', maxYears: '35 năm', highlight: 'Lãi suất ưu đãi thấp nhất khối Big 4' },
    { name: 'BIDV', promoRate: '6.2%', floatingRate: '9.6%', maxRatio: '80%', maxYears: '30 năm', highlight: 'Gói vay linh hoạt, thủ tục giải ngân nhanh' },
    { name: 'VietinBank', promoRate: '6.4%', floatingRate: '9.8%', maxRatio: '80%', maxYears: '35 năm', highlight: 'Hỗ trợ hạn mức vay lớn cho dự án liên kết' },
    { name: 'Agribank', promoRate: '6.5%', floatingRate: '9.5%', maxRatio: '75%', maxYears: '25 năm', highlight: 'Mạng lưới chi nhánh rộng khắp toàn quốc' },
    { name: 'Techcombank', promoRate: '7.2%', floatingRate: '10.5%', maxRatio: '80%', maxYears: '35 năm', highlight: 'Phê duyệt hồ sơ online tiện lợi, ân hạn nợ gốc' },
    { name: 'MBBank', promoRate: '6.8%', floatingRate: '10.2%', maxRatio: '80%', maxYears: '30 năm', highlight: 'Chính sách ưu đãi vượt trội cho quân đội và cán bộ' },
    { name: 'VPBank', promoRate: '7.5%', floatingRate: '11.0%', maxRatio: '85%', maxYears: '35 năm', highlight: 'Hạn mức vay lên tới 85% giá trị bất động sản' },
    { name: 'ACB', promoRate: '7.0%', floatingRate: '10.2%', maxRatio: '80%', maxYears: '25 năm', highlight: 'Dịch vụ thẩm định và chăm sóc khách hàng chuyên nghiệp' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 font-medium transition">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
          <span className="text-slate-800 font-bold">Công cụ tính lãi suất vay mua nhà</span>
        </nav>

        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-3">
            <i className="fa-solid fa-calculator text-xs"></i>
            <span>Tiện Ích Tài Chính Bất Động Sản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Công Cụ Tính Lãi Suất Vay Mua Nhà Trả Góp
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Dự toán chính xác số tiền gốc, tiền lãi và tổng số tiền phải trả hàng tháng theo phương thức Dư nợ giảm dần hoặc Niên kim cố định, giúp bạn chủ động kế hoạch tài chính an cư lạc nghiệp.
          </p>
        </div>

        {/* Embedded Standalone Calculator Card */}
        <div className="relative">
          <MortgageCalculatorModal 
            isStandalone={true}
            customInitialPrice={price}
            customInitialRatio={ratio}
            customInitialYears={years}
            customInitialRate={rate}
            propertyTitle={propertyTitle}
          />
        </div>

        {/* Bảng Tham Khảo Lãi Suất Các Ngân Hàng Mới Nhất */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                <span>Bảng Lãi Suất Vay Mua Nhà Các Ngân Hàng Hàng Đầu</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mức lãi suất tham khảo từ các ngân hàng thương mại lớn tại Việt Nam (cập nhật mới nhất)
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Cập nhật mới nhất 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 border-b">Ngân hàng</th>
                  <th className="p-3 border-b text-center text-blue-700">Lãi suất ưu đãi</th>
                  <th className="p-3 border-b text-center text-slate-600">Lãi suất thả nổi ước tính</th>
                  <th className="p-3 border-b text-center">Tỷ lệ vay tối đa</th>
                  <th className="p-3 border-b text-center">Thời hạn tối đa</th>
                  <th className="p-3 border-b">Điểm nổi bật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bankRates.map(bank => (
                  <tr key={bank.name} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{bank.name}</td>
                    <td className="p-3 font-black text-blue-700 text-center bg-blue-50/50">{bank.promoRate} / năm</td>
                    <td className="p-3 font-semibold text-slate-700 text-center">{bank.floatingRate} / năm</td>
                    <td className="p-3 text-center">{bank.maxRatio}</td>
                    <td className="p-3 text-center text-slate-600">{bank.maxYears}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{bank.highlight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 italic pt-2">
            * Lưu ý: Mức lãi suất trên chỉ mang tính chất tham khảo tại thời điểm hiện tại. Lãi suất thực tế có thể thay đổi tùy thuộc vào chính sách tín dụng từng thời kỳ, gói vay cụ thể và xếp hạng tín dụng cá nhân của khách hàng.
          </div>
        </div>

        {/* Cẩm Nang & 4 Lưu Ý Quan Trọng Khi Vay Mua Nhà */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-amber-500 rounded-full"></span>
            <span>4 Lời Khuyên Tài Chính Vàng Khi Vay Mua Nhà Đất</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                Quy Tắc An Toàn 30% - 40% Thu Nhập
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Số tiền trả nợ gốc và lãi hàng tháng không nên vượt quá 40% tổng thu nhập khả dụng của gia đình. Khoản dự phòng 60% còn lại dùng để trang trải sinh hoạt, giáo dục con cái và các chi phí phát sinh bất ngờ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                Biên Độ Thả Nổi Sau Hết Hạn Ưu Đãi
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Hãy đọc kỹ hợp đồng tín dụng về công thức tính lãi sau thời gian ưu đãi: thường bằng Lãi suất tiết kiệm 12-24 tháng cộng thêm biên độ từ 3.0% - 4.5%. Cần chuẩn bị phương án dự phòng khi lãi suất thị trường tăng.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                Phí Phạt Trả Nợ Trước Hạn
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Nhiều ngân hàng áp dụng mức phí phạt từ 1% - 3% trên số tiền trả trước hạn trong 3-5 năm đầu. Nếu bạn có kế hoạch tất toán khoản vay sớm, hãy ưu tiên các ngân hàng có điều khoản miễn phí phạt sau năm thứ 3 hoặc thứ 5.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                Thời Hạn Vay Nên Kéo Dài Linh Hoạt
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Nên chọn thời hạn vay dài nhất có thể (20 - 30 năm) để giảm thiểu áp lực số tiền trả gốc mỗi tháng. Khi tài chính dồi dào, bạn hoàn toàn có thể chủ động thanh toán bớt nợ gốc mà không lo bị quá tải chi tiêu.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-6">
          <Link
            to="/nha-dat-ban"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-bold text-xs sm:text-sm shadow-xs transition"
          >
            <i className="fa-solid fa-house text-emerald-600"></i>
            <span>Tìm nhà đất bán phù hợp tài chính</span>
          </Link>
          <Link
            to="/xem-tuoi-mua-dat-xay-nha"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-800 hover:text-amber-700 font-bold text-xs sm:text-sm shadow-xs transition"
          >
            <i className="fa-solid fa-compass text-amber-600"></i>
            <span>Xem tuổi mua đất xây nhà chuẩn phong thủy</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
