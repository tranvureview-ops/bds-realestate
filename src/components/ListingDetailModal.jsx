'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { VIP_PACKAGES } from '../data/mockData';
import InteractiveMap from './InteractiveMap';

export default function ListingDetailModal({ property, onClose }) {
  const { 
    favorites, 
    toggleFavorite, 
    compareList, 
    toggleCompare, 
    setActiveModal, 
    showToast 
  } = useRealEstate();

  const [activeMediaTab, setActiveMediaTab] = useState('photos'); // 'photos', 'vr360', 'video', 'map'
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeVrSceneIndex, setActiveVrSceneIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  if (!property) return null;

  const isFav = favorites.includes(property.id);
  const isCompared = compareList.some(item => item.id === property.id);
  const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
  const vipPkg = VIP_PACKAGES.find(p => p.id === property.vipPackageId) || defaultPkg;
  const isDiamond = property.vipPackageId === 'vip-diamond';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setMessageSent(true);
    showToast(`Đã gửi tin nhắn đến môi giới ${property.author.name}! Họ sẽ phản hồi sớm nhất qua SĐT hoặc Zalo.`, 'success');
    setContactMessage('');
    setTimeout(() => setMessageSent(false), 5000);
  };

  const handleCalculateLoan = () => {
    setActiveModal('mortgage-calc');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${vipPkg.badgeColor}`}>
              {vipPkg.shortName}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Mã tin: <strong className="text-slate-800">{property.id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare */}
            <button
              onClick={() => toggleCompare(property)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isCompared 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <i className="fa-solid fa-code-compare"></i>
              <span>{isCompared ? 'Đang so sánh' : 'So sánh BĐS'}</span>
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition ${
                isFav 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Lưu tin"
            >
              <i className="fa-solid fa-heart"></i>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Media Section: Photos / VR360 / Video / Map Tabs */}
          <div>
            {/* Tabs Controller */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setActiveMediaTab('photos')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeMediaTab === 'photos' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <i className="fa-solid fa-images"></i>
                Hình Ảnh ({property.images.length})
              </button>

              {property.hasVR360 && (
                <button
                  onClick={() => setActiveMediaTab('vr360')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeMediaTab === 'vr360' ? 'bg-purple-600 text-white shadow-sm animate-pulse' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                >
                  <i className="fa-solid fa-vr-cardboard"></i>
                  Tour Thực Tế Ảo VR 360°
                </button>
              )}

              {property.videoUrl && (
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeMediaTab === 'video' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <i className="fa-solid fa-play"></i>
                  Video Review
                </button>
              )}

              <button
                onClick={() => setActiveMediaTab('map')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeMediaTab === 'map' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <i className="fa-solid fa-map-location-dot"></i>
                Vị Trí Bản Đồ
              </button>
            </div>

            {/* Media Content Display */}
            {activeMediaTab === 'photos' && (
              <div className="space-y-3">
                {/* Big Main Image */}
                <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                  <img
                    src={property.images[selectedPhotoIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Prev / Next buttons */}
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold">
                    {selectedPhotoIndex + 1} / {property.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${selectedPhotoIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VR 360 Simulated Interactive View */}
            {activeMediaTab === 'vr360' && property.hasVR360 && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-500 shadow-xl">
                <div className="relative h-96 w-full cursor-grab active:cursor-grabbing">
                  <img
                    src={property.vrScenes[activeVrSceneIndex]?.img || property.images[0]}
                    alt="VR 360 Scene"
                    className="w-full h-full object-cover animate-pulse"
                  />
                  {/* Overlay VR badge & controls */}
                  <div className="absolute top-4 left-4 bg-purple-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-purple-400 text-xs font-bold flex items-center gap-2">
                    <i className="fa-solid fa-vr-cardboard text-purple-300"></i>
                    <span>Chế độ xem VR 360° Panorama - Góc nhìn: <strong>{property.vrScenes[activeVrSceneIndex]?.name}</strong></span>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-3">
                    <span><i className="fa-solid fa-arrows-up-down-left-right text-purple-400 mr-1"></i> Rê chuột để xoay 360 độ</span>
                    <span>|</span>
                    {property.vrScenes.map((scene, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveVrSceneIndex(idx)}
                        className={`px-3 py-1 rounded-full text-xs transition ${activeVrSceneIndex === idx ? 'bg-purple-600 text-white font-bold' : 'hover:bg-white/20'}`}
                      >
                        {scene.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Video Review Tab */}
            {activeMediaTab === 'video' && property.videoUrl && (
              <div className="h-96 w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                <iframe
                  src={property.videoUrl}
                  title="Video Review BĐS"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Location Map Tab */}
            {activeMediaTab === 'map' && (
              <div className="space-y-3">
                <InteractiveMap properties={[property]} height="380px" />
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-crosshairs text-emerald-600"></i>
                  <span>Địa chỉ chính xác: <strong>{property.address}, {property.district}, {property.city}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Core Info Grid: Left Column (Details) / Right Column (Broker & Fast Actions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Title, Price, Attributes, Description, Amenities */}
            <div className="lg:col-span-8 space-y-6">
              {/* Title & Price Header */}
              <div>
                <h1 className={`text-xl sm:text-2xl font-black leading-snug mb-3 ${vipPkg.titleClass}`}>
                  {property.title}
                </h1>

                <div className="flex flex-wrap items-baseline gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Mức giá niêm yết</div>
                    <div className={`text-2xl sm:text-3xl font-black ${isDiamond ? 'text-red-600' : 'text-emerald-700'}`}>
                      {property.priceDisplay}
                    </div>
                  </div>

                  <div className="border-l border-slate-300 pl-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Đơn giá / m²</div>
                    <div className="text-base sm:text-lg font-bold text-slate-700">
                      {property.pricePerM2}
                    </div>
                  </div>

                  <div className="border-l border-slate-300 pl-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Diện tích sử dụng</div>
                    <div className="text-base sm:text-lg font-bold text-slate-700">
                      {property.area} m²
                    </div>
                  </div>

                  {/* Fast Loan Calculator trigger */}
                  <div className="ml-auto">
                    <button
                      onClick={handleCalculateLoan}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-calculator text-blue-600"></i>
                      <span>Ước tính trả góp hàng tháng</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                  Đặc Điểm Bất Động Sản
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Phòng ngủ</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      <i className="fa-solid fa-bed text-emerald-600 mr-1.5"></i>
                      {property.bedroom || 'Không xác định'} PN
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Phòng tắm / WC</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      <i className="fa-solid fa-bath text-emerald-600 mr-1.5"></i>
                      {property.bathroom || 'Không xác định'} WC
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Hướng ban công/cửa</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      <i className="fa-regular fa-compass text-emerald-600 mr-1.5"></i>
                      {property.direction || 'Đông Nam'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Pháp lý</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5 truncate" title={property.legal}>
                      <i className="fa-solid fa-certificate text-emerald-600 mr-1.5"></i>
                      {property.legal}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Số tầng</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      <i className="fa-solid fa-stairs text-emerald-600 mr-1.5"></i>
                      {property.floor ? `${property.floor} tầng` : 'Nhà trệt'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Nội thất bàn giao</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5 truncate" title={property.furniture}>
                      <i className="fa-solid fa-couch text-emerald-600 mr-1.5"></i>
                      {property.furniture}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Thông Tin Mô Tả Chi Tiết
                </h3>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {property.description}
                </div>
              </div>

              {/* Amenities & Nearby Facilities */}
              {property.nearbyFacilities && property.nearbyFacilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                    Tiện Ích & Kết Nối Xung Quanh (Bán Kính 1km)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.nearbyFacilities.map((fac, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <i className="fa-solid fa-circle-dot text-emerald-600 text-[10px]"></i>
                          {fac.name}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {fac.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (4 cols): Broker Contact Card & Direct Form */}
            <div className="lg:col-span-4 sticky top-16 space-y-4">
              <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-xl">
                {/* Broker Profile */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src={property.author.avatar}
                      alt={property.author.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                    {property.author.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow" title="Môi giới đã xác thực">
                        <i className="fa-solid fa-check"></i>
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-emerald-700 uppercase">
                      Người đăng tin
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {property.author.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {property.author.title}
                    </p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                      <i className="fa-solid fa-star"></i>
                      <span className="font-bold text-slate-800">{property.author.rating}</span>
                      <span className="text-slate-400">({property.author.reviewCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                {/* Direct Call & Zalo Action Buttons */}
                <div className="py-4 space-y-2.5">
                  <a
                    href={`tel:${property.author.phone.replace(/\s+/g, '')}`}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <i className="fa-solid fa-phone-volume group-hover:animate-bounce"></i>
                    <span>Gọi Ngay: {property.author.phone}</span>
                  </a>

                  <a
                    href={`https://zalo.me/${property.author.zalo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>Chat Trực Tiếp Qua Zalo</span>
                  </a>
                </div>

                {/* Fast Message Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gửi tin nhắn hẹn xem nhà:
                  </label>
                  <textarea
                    rows="3"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={`Chào anh/chị ${property.author.name}, tôi quan tâm đến BĐS ${property.id}. Vui lòng liên hệ lại...`}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
                  ></textarea>

                  {messageSent ? (
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold text-center">
                      ✓ Đã gửi tin nhắn thành công!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-regular fa-paper-plane"></i>
                      <span>Gửi yêu cầu liên hệ</span>
                    </button>
                  )}
                </form>
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <i className="fa-solid fa-shield-halved text-amber-600 mr-1"></i>
                <strong>Khuyến cáo an toàn:</strong> Không chuyển tiền đặt cọc trước khi trực tiếp kiểm tra giấy tờ sổ đỏ/hồng và hiện trạng thực tế của bất động sản.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
