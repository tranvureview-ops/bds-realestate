'use client';

import React, { useState, useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { buildSaleSeoContentData } from '../data/seoCategoryContent';

const GUIDE_TONE_CLASSES = {
  emerald: {
    card: 'from-slate-50 to-emerald-50/40 hover:border-emerald-400',
    badge: 'text-emerald-800',
    titleHover: 'group-hover:text-emerald-700'
  },
  blue: {
    card: 'from-slate-50 to-blue-50/40 hover:border-blue-400',
    badge: 'text-blue-800',
    titleHover: 'group-hover:text-blue-700'
  },
  amber: {
    card: 'from-slate-50 to-amber-50/40 hover:border-amber-400',
    badge: 'text-amber-800',
    titleHover: 'group-hover:text-amber-700'
  }
};

export default function SaleListingsSeoContent({ city = null, district = null, propertyType = null, taxonomyInfo = null }) {
  const [openFaq, setOpenFaq] = useState(null);

  const activeCity = city || taxonomyInfo?.city || null;
  const activeType = (propertyType && propertyType !== 'all')
    ? propertyType
    : (taxonomyInfo?.propertyType || null);

  const seoData = useMemo(
    () => buildSaleSeoContentData({ activeCity, propertyType: activeType }),
    [activeCity, activeType]
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 mb-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-10">

        {/* =====================================================================
            H2: THỊ TRƯỜNG MUA BÁN (ĐỒNG BỘ THEO DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg font-bold shrink-0">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {seoData.marketTitle}
            </h2>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
            {seoData.marketDesc}
          </p>
        </div>

        {/* =====================================================================
            H2: BẢNG KHUNG GIÁ THAM KHẢO (ĐỒNG BỘ THEO DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
              <i className="fa-solid fa-tags"></i>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {seoData.priceTableTitle}
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
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{row.cols?.[0] ?? row.house ?? '-'}</td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{row.cols?.[1] ?? row.apartment ?? '-'}</td>
                    <td className="py-3 px-4 text-amber-700 font-semibold">{row.cols?.[2] ?? row.land ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-xs">{row.hotspots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 italic">
            {seoData.priceFootnote}
          </p>
        </div>

        {/* =====================================================================
            H2: 4 BƯỚC THẨM ĐỊNH PHÁP LÝ & AN TOÀN GIAO DỊCH THEO PHÂN KHÚC
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg font-bold shrink-0">
              <i className="fa-solid fa-shield-halved"></i>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {seoData.legalTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {seoData.legalSteps.map((step, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {step.text}
                  {step.linkTo && step.linkText && (
                    <>
                      {' '}
                      <Link to={step.linkTo} className="text-emerald-700 font-semibold underline">
                        {step.linkText}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            H2: CẨM NANG & LIÊN KẾT TRI THỨC HỮU ÍCH THEO PHÂN KHÚC
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg font-bold shrink-0">
              <i className="fa-solid fa-book-open-reader"></i>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {seoData.guidesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seoData.guides.map((guide, idx) => {
              const tone = GUIDE_TONE_CLASSES[guide.badgeTone] || GUIDE_TONE_CLASSES.emerald;
              return (
                <Link
                  key={idx}
                  to={guide.to}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${tone.card} border border-slate-200/90 hover:shadow-md transition group`}
                >
                  <div className={`text-xs font-bold ${tone.badge} uppercase tracking-wider mb-1 flex items-center gap-1.5`}>
                    <i className={guide.icon}></i>
                    <span>{guide.badge}</span>
                  </div>
                  <h3 className={`font-bold text-xs sm:text-sm text-slate-900 ${tone.titleHover} transition line-clamp-2`}>
                    {guide.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {guide.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            H2: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION ĐỒNG BỘ DANH MỤC & THÀNH PHỐ)
           ===================================================================== */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-lg font-bold shrink-0">
              <i className="fa-solid fa-circle-question"></i>
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {seoData.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {seoData.faqs.map((faq, idx) => {
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
            H2: KHÁM PHÁ SILO LIÊN KẾT NỘI BỘ (CÙNG PHÂN KHÚC HOẶC ĐỊA PHƯƠNG)
           ===================================================================== */}
        <div className="pt-6 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
                <i className="fa-solid fa-layer-group"></i>
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {seoData.discoveryTitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 text-xs">
              {seoData.discoveryLinks.map((item, idx) => (
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
