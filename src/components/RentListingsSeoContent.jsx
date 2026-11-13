'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { buildRentSeoContentData } from '../data/seoCategoryContent';

export default function RentListingsSeoContent({ city = null, district = null, propertyType = null, taxonomyInfo = null }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Ưu tiên tuyệt đối danh mục gốc chuẩn SEO của trang (taxonomyInfo), không bị biến dạng bởi query filters (?loai=room, ?gia=...)
  const activeCity = taxonomyInfo?.city || city || null;
  const activeDistrict = taxonomyInfo?.district || district || null;
  const activeType = (taxonomyInfo?.propertyType && taxonomyInfo.propertyType !== 'all')
    ? taxonomyInfo.propertyType
    : ((propertyType && propertyType !== 'all') ? propertyType : null);

  const seoData = useMemo(
    () => buildRentSeoContentData({
      activeCity,
      district: activeDistrict,
      propertyType: activeType,
      priceRange: taxonomyInfo?.priceRange,
      priceLabel: taxonomyInfo?.priceLabel,
      areaRange: taxonomyInfo?.areaRange,
      areaLabel: taxonomyInfo?.areaLabel,
      bedroom: taxonomyInfo?.bedroom,
      taxonomyInfo
    }),
    [activeCity, activeDistrict, activeType, taxonomyInfo]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 mb-8 sm:mt-8 sm:mb-10">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6 sm:space-y-7">

        {/* =====================================================================
            H2: THỊ TRƯỜNG CHO THUÊ (ĐỒNG BỘ THEO DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
              <i className="fa-solid fa-key"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {seoData.marketTitle}
            </h2>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
            {seoData.marketDesc}
          </p>
        </div>

        {/* =====================================================================
            H2: BẢNG KHUNG GIÁ THUÊ THAM KHẢO (ĐỒNG BỘ THEO DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
              <i className="fa-solid fa-money-bill-wave"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {seoData.priceTableTitle ? seoData.priceTableTitle.replace(/\[(\d{4})\]/g, '$1') : ''}
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{seoData.tableHeaders[0]}</th>
                  <th className="py-3 px-4">{seoData.tableHeaders[1]}</th>
                  <th className="py-3 px-4">{seoData.tableHeaders[2]}</th>
                  <th className="py-3 px-4">{seoData.tableHeaders[3]}</th>
                  <th className="py-3 px-4 hidden md:table-cell">{seoData.tableHeaders[4]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seoData.benchmarks.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.area || row.region}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{row.cols?.[0] ?? row.apartment ?? '-'}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.cols?.[1] ?? row.house ?? '-'}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{row.cols?.[2] ?? row.room ?? '-'}</td>
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
            H2: 4 LƯU Ý PHÁP LÝ KHI KÝ HỢP ĐỒNG THUÊ
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
              <i className="fa-solid fa-file-contract"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {seoData.legalTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {seoData.legalSteps.map((step, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            H2: CÂU HỎI THƯỜNG GẶP (FAQS ĐỒNG BỘ DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
              <i className="fa-solid fa-circle-question"></i>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {seoData.faqTitle}
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            {seoData.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-800 transition"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <i
                      className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-700' : ''
                      }`}
                    ></i>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            H2: KHÁM PHÁ CHO THUÊ SILO NỘI BỘ
           ===================================================================== */}
        <div className="pt-5 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {seoData.discoveryTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 text-xs">
              {seoData.discoveryLinks.map((item, idx) => (
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
