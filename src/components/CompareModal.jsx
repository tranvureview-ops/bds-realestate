'use client';

import React from 'react';
import Link from 'next/link';
import { useRealEstate } from '../context/RealEstateContext';

export default function CompareModal({ onClose }) {
  const { compareList, removeCompare, clearCompare, openPropertyDetail } = useRealEstate();

  if (compareList.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
          <i className="fa-solid fa-code-compare text-3xl text-slate-400 mb-3"></i>
          <h3 className="text-base font-bold text-slate-800">Chưa có bất động sản nào</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Hãy bấm vào biểu tượng so sánh trên mỗi tin đăng để đưa vào bảng so sánh.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Đóng lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-code-compare"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Bảng So Sánh Đối Đầu ({compareList.length}/4 Bất Động Sản)
              </h2>
              <p className="text-xs text-slate-500">
                Đặt cạnh nhau để đánh giá tương quan về giá, diện tích và tính pháp lý
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              Xóa tất cả
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[80vh]">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-bold text-slate-400 uppercase bg-slate-50 w-40 rounded-tl-xl border-b border-slate-200">
                  Tiêu chí so sánh
                </th>
                {compareList.map((prop) => (
                  <th key={prop.id} className="p-3 bg-slate-50/50 border-b border-slate-200 text-left min-w-[220px]">
                    <div className="relative group">
                      <img
                        src={prop.images[0]}
                        alt=""
                        className="w-full h-32 object-cover rounded-xl mb-2 shadow-sm"
                      />
                      <button
                        onClick={() => removeCompare(prop.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow hover:bg-red-700"
                        title="Bỏ căn này"
                      >
                        ×
                      </button>
                      <div className="text-[10px] font-black uppercase text-red-600">
                        {prop.vipPackageId === 'vip-diamond' ? 'VIP Kim Cương' : 'Tin BĐS'}
                      </div>
                      <h4 
                        onClick={() => {
                          onClose();
                          openPropertyDetail(prop);
                        }}
                        className="text-xs font-bold text-slate-900 line-clamp-2 hover:underline cursor-pointer property-title-sentence"
                      >
                        {prop.title}
                      </h4>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Row: Price */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-tag text-emerald-600 mr-1.5"></i>
                  Mức giá niêm yết
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 font-black text-emerald-700 text-base">
                    {prop.priceDisplay}
                  </td>
                ))}
              </tr>

              {/* Row: Price per m2 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-calculator text-blue-600 mr-1.5"></i>
                  Đơn giá / m²
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 font-bold text-slate-700">
                    {prop.pricePerM2}
                  </td>
                ))}
              </tr>

              {/* Row: Area */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-vector-square text-purple-600 mr-1.5"></i>
                  Diện tích
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 font-extrabold text-slate-900">
                    {prop.area} m²
                  </td>
                ))}
              </tr>

              {/* Row: Location */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-location-dot text-red-500 mr-1.5"></i>
                  Khu vực
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 font-medium text-slate-700">
                    {prop.district}, {prop.city}
                  </td>
                ))}
              </tr>

              {/* Row: Bedrooms & Bathrooms */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-bed text-amber-500 mr-1.5"></i>
                  Số phòng ngủ & WC
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 text-slate-700 font-semibold">
                    {prop.bedroom} PN • {prop.bathroom} WC
                  </td>
                ))}
              </tr>

              {/* Row: Direction */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-regular fa-compass text-teal-600 mr-1.5"></i>
                  Hướng nhà
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 text-slate-700">
                    {prop.direction || 'Chưa cập nhật'}
                  </td>
                ))}
              </tr>

              {/* Row: Legal */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-certificate text-emerald-600 mr-1.5"></i>
                  Pháp lý
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 text-slate-800 font-medium">
                    {prop.legal}
                  </td>
                ))}
              </tr>

              {/* Row: Furniture */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-couch text-indigo-600 mr-1.5"></i>
                  Nội thất
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3 text-slate-600">
                    {prop.furniture}
                  </td>
                ))}
              </tr>

              {/* Row: Contact */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-500 bg-slate-50/60">
                  <i className="fa-solid fa-phone text-red-600 mr-1.5"></i>
                  Liên hệ
                </td>
                {compareList.map(prop => (
                  <td key={prop.id} className="p-3">
                    <Link
                      href={`tel:${prop.author.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-sm transition whitespace-nowrap shrink-0"
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>{prop.author.phone}</span>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
