'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function MortgageCalculatorModal({ onClose }) {
  const { selectedPropertyDetail } = useRealEstate();

  // Initial price based on selected property or default 3 tỷ
  const initialPrice = selectedPropertyDetail ? selectedPropertyDetail.price : 3000000000;

  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [loanRatio, setLoanRatio] = useState(70); // 70%
  const [loanYears, setLoanYears] = useState(20); // 20 years
  const [preferentialRate, setPreferentialRate] = useState(7.5); // 7.5% / year
  const [preferentialMonths, setPreferentialMonths] = useState(12); // 12 months
  const [floatingRate, setFloatingRate] = useState(10.5); // 10.5% / year
  const [calcMethod, setCalcMethod] = useState('declining'); // 'declining' (dư nợ giảm dần) or 'equal' (trả đều)
  const [showSchedule, setShowSchedule] = useState(false);

  // Computed Loan Values
  const loanAmount = useMemo(() => {
    return (propertyPrice * loanRatio) / 100;
  }, [propertyPrice, loanRatio]);

  const totalMonths = useMemo(() => {
    return loanYears * 12;
  }, [loanYears]);

  // Generate Amortization Schedule
  const scheduleData = useMemo(() => {
    const list = [];
    let remainingPrincipal = loanAmount;
    let totalInterest = 0;
    const monthlyPrincipalEqual = loanAmount / totalMonths;

    for (let month = 1; month <= totalMonths; month++) {
      const annualRate = month <= preferentialMonths ? preferentialRate : floatingRate;
      const monthlyRate = annualRate / 100 / 12;

      let interestPayment = 0;
      let principalPayment = 0;
      let totalPayment = 0;

      if (calcMethod === 'declining') {
        // Dư nợ giảm dần
        principalPayment = monthlyPrincipalEqual;
        interestPayment = remainingPrincipal * monthlyRate;
        totalPayment = principalPayment + interestPayment;
        remainingPrincipal -= principalPayment;
        if (remainingPrincipal < 0) remainingPrincipal = 0;
      } else {
        // Trả đều hàng tháng (Annuity)
        totalPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        interestPayment = remainingPrincipal * monthlyRate;
        principalPayment = totalPayment - interestPayment;
        remainingPrincipal -= principalPayment;
        if (remainingPrincipal < 0) remainingPrincipal = 0;
      }

      totalInterest += interestPayment;

      list.push({
        month,
        principalPayment,
        interestPayment,
        totalPayment,
        remainingPrincipal
      });
    }

    return {
      list,
      totalInterest,
      totalPaymentAll: loanAmount + totalInterest,
      firstMonthPayment: list[0] ? list[0].totalPayment : 0,
      firstMonthInterest: list[0] ? list[0].interestPayment : 0,
      firstMonthPrincipal: list[0] ? list[0].principalPayment : 0
    };
  }, [loanAmount, totalMonths, preferentialRate, preferentialMonths, floatingRate, calcMethod]);

  const formatVND = (num) => {
    return Math.round(num).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-base shadow">
              <i className="fa-solid fa-calculator"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Công Cụ Tính Lãi Vay Mua Nhà Ngân Hàng
              </h2>
              <p className="text-xs text-slate-500">
                Lập kế hoạch tài chính chuẩn xác theo dư nợ giảm dần hoặc niên kim
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Input Form Column */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-sliders text-blue-600"></i>
                Thông Số Khoản Vay
              </h3>

              {/* Property Value */}
              <div>
                <label htmlFor="modal-property-price" className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                  Giá trị bất động sản: <span className="text-emerald-700 font-black">{formatVND(propertyPrice)}</span>
                </label>
                <input
                  id="modal-property-price"
                  aria-label="Giá trị bất động sản"
                  type="number"
                  step="50000000"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Loan Ratio Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <label htmlFor="modal-loan-ratio" className="cursor-pointer">Tỷ lệ vay: <strong className="text-blue-600">{loanRatio}%</strong></label>
                  <span>Cần vay: <strong className="text-emerald-700">{formatVND(loanAmount)}</strong></span>
                </div>
                <input
                  id="modal-loan-ratio"
                  aria-label="Tỷ lệ vay (% giá trị bất động sản)"
                  aria-valuemin={10}
                  aria-valuemax={85}
                  aria-valuenow={loanRatio}
                  type="range"
                  min="10"
                  max="85"
                  step="5"
                  value={loanRatio}
                  onChange={(e) => setLoanRatio(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>10% (Tối thiểu)</span>
                  <span>50%</span>
                  <span>70% (Khuyên dùng)</span>
                  <span>85% (Tối đa)</span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <label htmlFor="modal-loan-years" className="cursor-pointer">Thời gian vay: <strong className="text-blue-600">{loanYears} năm</strong></label>
                  <span className="text-slate-500">({totalMonths} tháng)</span>
                </div>
                <input
                  id="modal-loan-years"
                  aria-label="Thời gian vay mua nhà (năm)"
                  aria-valuemin={1}
                  aria-valuemax={35}
                  aria-valuenow={loanYears}
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Interest Rates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-preferential-rate" className="block text-[11px] font-bold text-slate-600 mb-1 cursor-pointer">
                    Lãi suất ưu đãi (%/năm)
                  </label>
                  <input
                    id="modal-preferential-rate"
                    aria-label="Lãi suất ưu đãi (%/năm)"
                    type="number"
                    step="0.1"
                    value={preferentialRate}
                    onChange={(e) => setPreferentialRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="modal-preferential-months" className="block text-[11px] font-bold text-slate-600 mb-1 cursor-pointer">
                    Thời gian ưu đãi (tháng)
                  </label>
                  <select
                    id="modal-preferential-months"
                    aria-label="Thời gian ưu đãi lãi suất"
                    value={preferentialMonths}
                    onChange={(e) => setPreferentialMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-400 shadow-sm transition cursor-pointer"
                  >
                    <option value="6">6 tháng</option>
                    <option value="12">12 tháng (1 năm)</option>
                    <option value="24">24 tháng (2 năm)</option>
                    <option value="36">36 tháng (3 năm)</option>
                  </select>
                </div>
              </div>

              {/* Floating Rate */}
              <div>
                <label htmlFor="modal-floating-rate" className="block text-[11px] font-bold text-slate-600 mb-1 cursor-pointer">
                  Lãi suất sau ưu đãi ước tính (%/năm)
                </label>
                <input
                  id="modal-floating-rate"
                  aria-label="Lãi suất sau ưu đãi ước tính (%/năm)"
                  type="number"
                  step="0.1"
                  value={floatingRate}
                  onChange={(e) => setFloatingRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              {/* Method Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phương thức tính trả nợ:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcMethod('declining')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      calcMethod === 'declining' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>Dư Nợ Giảm Dần</div>
                    <div className={`text-[10px] font-normal ${calcMethod === 'declining' ? 'text-blue-100' : 'text-slate-400'}`}>
                      Tiền lãi giảm theo từng tháng
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalcMethod('equal')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      calcMethod === 'equal' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>Trả Góp Đều (Niên kim)</div>
                    <div className={`text-[10px] font-normal ${calcMethod === 'equal' ? 'text-blue-100' : 'text-slate-400'}`}>
                      Mỗi tháng trả cố định
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xl">
                <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider mb-1">
                  Ước Tính Tháng Đầu Tiên
                </div>
                <div className="text-3xl font-black text-emerald-400 mb-1">
                  {formatVND(scheduleData.firstMonthPayment)}
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 mb-4">
                  <span>Gốc: <strong>{formatVND(scheduleData.firstMonthPrincipal)}</strong></span>
                  <span>+</span>
                  <span>Lãi: <strong>{formatVND(scheduleData.firstMonthInterest)}</strong></span>
                </div>

                <div className="pt-3 border-t border-slate-700 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Tổng số tiền vay:</div>
                    <div className="font-bold text-white text-sm">{formatVND(loanAmount)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Tổng lãi phải trả:</div>
                    <div className="font-bold text-amber-400 text-sm">{formatVND(scheduleData.totalInterest)}</div>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800">
                    <div className="text-slate-400 text-[11px]">Tổng Gốc + Lãi toàn bộ kỳ vay:</div>
                    <div className="font-black text-emerald-400 text-base">{formatVND(scheduleData.totalPaymentAll)}</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar of Principal vs Interest */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                    Tiền gốc ({Math.round((loanAmount / scheduleData.totalPaymentAll) * 100)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    Tiền lãi ({Math.round((scheduleData.totalInterest / scheduleData.totalPaymentAll) * 100)}%)
                  </span>
                </div>

                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${(loanAmount / scheduleData.totalPaymentAll) * 100}%` }} 
                    className="h-full bg-blue-600"
                  ></div>
                  <div 
                    style={{ width: `${(scheduleData.totalInterest / scheduleData.totalPaymentAll) * 100}%` }} 
                    className="h-full bg-amber-500"
                  ></div>
                </div>
              </div>

              {/* Schedule Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-table-list text-blue-600"></i>
                <span>{showSchedule ? 'Ẩn bảng lịch trả nợ' : 'Xem lịch trả nợ chi tiết 24 tháng đầu'}</span>
                <i className={`fa-solid ${showSchedule ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-slate-400`}></i>
              </button>
            </div>
          </div>

          {/* Collapsible Amortization Table (First 24 months) */}
          {showSchedule && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                Bảng Lịch Trả Nợ Chi Tiết (24 Tháng Đầu Tiên)
              </h4>
              <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 sticky top-0 text-slate-700">
                    <tr>
                      <th className="p-2 border-b">Kỳ (Tháng)</th>
                      <th className="p-2 border-b">Gốc phải trả</th>
                      <th className="p-2 border-b">Lãi phải trả</th>
                      <th className="p-2 border-b">Tổng trả hàng tháng</th>
                      <th className="p-2 border-b">Dư nợ còn lại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheduleData.list.slice(0, 24).map(item => (
                      <tr key={item.month} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-800">Tháng {item.month}</td>
                        <td className="p-2 font-medium text-slate-700">{formatVND(item.principalPayment)}</td>
                        <td className="p-2 font-medium text-amber-700">{formatVND(item.interestPayment)}</td>
                        <td className="p-2 font-black text-emerald-700">{formatVND(item.totalPayment)}</td>
                        <td className="p-2 font-medium text-slate-500">{formatVND(item.remainingPrincipal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
