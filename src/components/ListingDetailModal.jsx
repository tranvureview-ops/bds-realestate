'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRealEstate } from '../context/RealEstateContext';
import dynamic from 'next/dynamic';
import { VIP_PACKAGES } from '../data/mockData';
import { normalizePhone, formatPhoneNumber } from '../utils/authValidation';
import { formatSentenceCase, getPropertyPermalink } from '../utils/permalink';
import SeoImage from './SeoImage';
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
      <i className="fa-solid fa-spinner fa-spin text-xl mr-2 text-emerald-600"></i> Đang tải bản đồ...
    </div>
  ),
});

export default function ListingDetailModal({ property, onClose }) {
  const { 
    properties,
    favorites, 
    toggleFavorite, 
    compareList, 
    toggleCompare, 
    setActiveModal, 
    showToast,
    usersList,
    verifyProperty
  } = useRealEstate();

  const [activeMediaTab, setActiveMediaTab] = useState('photos'); // 'photos', 'vr360', 'video', 'map'
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeVrSceneIndex, setActiveVrSceneIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [brokerFilterTab, setBrokerFilterTab] = useState('all'); // 'all', 'sale', 'rent'

  // Tra cứu tác giả mới nhất từ usersList để đảm bảo tên & avatar luôn cập nhật theo hồ sơ
  const authorUser = property?.author?.id 
    ? usersList?.find(u => String(u.id) === String(property.author.id))
    : (property?.author?.phone ? usersList?.find(u => normalizePhone(u.phone) === normalizePhone(property.author.phone)) : null);

  const safeAuthor = {
    id: authorUser?.id || property?.author?.id || null,
    name: authorUser?.name || property?.author?.name || property?.contactName || 'Người đăng tin',
    phone: formatPhoneNumber(authorUser?.phone || property?.author?.phone || property?.contactPhone || '0908 123 456'),
    zalo: (authorUser?.phone || property?.author?.zalo || property?.author?.phone || property?.contactPhone || '0908123456').replace(/\s+/g, ''),
    avatar: authorUser?.avatar || property?.author?.avatar || '/avatars/ai-preset-2.jpg',
    title: authorUser?.roleName || authorUser?.membership?.packageName || property?.author?.title || (property?.isGuest ? 'Khách vãng lai' : 'Chính chủ'),
    isVerified: authorUser?.isVerified ?? property?.author?.isVerified ?? false,
    rating: property?.author?.rating || '5.0',
    reviewCount: property?.author?.reviewCount || 1
  };

  // Toàn bộ danh sách tin đăng của môi giới này
  const authorProperties = useMemo(() => {
    if (!properties || !Array.isArray(properties)) return [];
    const authorId = safeAuthor.id ? String(safeAuthor.id) : null;
    const authorPhone = normalizePhone(safeAuthor.phone);
    const authorName = safeAuthor.name?.trim().toLowerCase();

    return properties.filter(p => {
      if (p.isDeleted || p.status === 'trash' || p.status === 'rejected') return false;
      const pAuthorId = p.author?.id ? String(p.author.id) : (p.userId ? String(p.userId) : null);
      const pPhone = normalizePhone(p.author?.phone || p.contactPhone);
      const pName = (p.author?.name || p.contactName || '').trim().toLowerCase();

      return (authorId && pAuthorId && authorId === pAuthorId) ||
             (authorPhone && pPhone && authorPhone.length >= 9 && authorPhone === pPhone) ||
             (authorName && pName && authorName === pName);
    });
  }, [properties, safeAuthor.id, safeAuthor.phone, safeAuthor.name]);

  // Đếm tổng số tin đăng thực tế của tác giả này trên sàn
  const authorListingsCount = useMemo(() => {
    return authorProperties.length > 0 
      ? authorProperties.length 
      : (authorUser?.activeListingsCount ?? (authorUser?.listingsCount ?? 1));
  }, [authorProperties.length, authorUser]);

  const filteredAuthorProperties = useMemo(() => {
    if (brokerFilterTab === 'sale') {
      return authorProperties.filter(p => p.type === 'ban' || p.listingType === 'sale');
    }
    if (brokerFilterTab === 'rent') {
      return authorProperties.filter(p => p.type === 'cho-thue' || p.listingType === 'rent');
    }
    return authorProperties;
  }, [authorProperties, brokerFilterTab]);

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
    showToast(`Đã gửi tin nhắn đến môi giới ${safeAuthor.name}! Họ sẽ phản hồi sớm nhất qua SĐT hoặc Zalo.`, 'success');
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${vipPkg.badgeColor}`}>
              {vipPkg.shortName}
            </span>
            {/* Tin đã xác thực: Badge màu xanh lục (Ẩn hoàn toàn khi chưa xác thực) */}
            {Boolean(property.is_verified || property.isVerified) && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <i className="fa-solid fa-circle-check"></i>
                <span>Tin xác thực</span>
              </span>
            )}
            <span className="text-xs font-bold text-slate-500">
              Mã tin: <strong className="text-slate-800">{property.id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Xác thực tin ở phần hành động nếu tin chưa xác thực (Ẩn khi tin đã xác thực) */}
            {!Boolean(property.is_verified || property.isVerified) && (
              <button
                type="button"
                onClick={async () => {
                  await verifyProperty(property.id, true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                title="Xác thực thông tin tin đăng này"
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Xác thực tin</span>
              </button>
            )}

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
                  <SeoImage
                    src={property.images[selectedPhotoIndex]}
                    property={property}
                    index={selectedPhotoIndex}
                    total={property.images.length}
                    type={selectedPhotoIndex === 0 ? 'main' : 'gallery'}
                    priority={selectedPhotoIndex === 0}
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
                      <SeoImage
                        src={img}
                        property={property}
                        index={idx}
                        total={property.images.length}
                        type="gallery"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VR 360 Simulated Interactive View */}
            {activeMediaTab === 'vr360' && property.hasVR360 && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-500 shadow-xl">
                <div className="relative h-96 w-full cursor-grab active:cursor-grabbing">
                  <SeoImage
                    src={property.vrScenes[activeVrSceneIndex]?.img || property.images[0]}
                    property={property}
                    type="vr360"
                    sceneName={property.vrScenes[activeVrSceneIndex]?.name}
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
                <h1 className={`text-xl sm:text-2xl font-black leading-snug mb-3 property-title-sentence ${vipPkg.titleClass}`}>
                  {formatSentenceCase(property.title)}
                </h1>

                <div className="flex flex-wrap items-baseline gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Mức giá niêm yết</div>
                    <div className={`text-2xl sm:text-3xl font-black ${isDiamond ? 'text-red-600' : 'text-emerald-700'}`}>
                      {property.priceDisplay ? property.priceDisplay.replace(/Tỷ/g, 'tỷ') : ''}
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
                {/* Broker Profile: Kiến trúc SEO tối ưu (Mã nguồn Link <a>, rel="nofollow", Giao diện Modal Popup) */}
                <Link 
                  href={`/nha-dat-ban?q=${encodeURIComponent(safeAuthor.name)}`}
                  rel="nofollow"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsBrokerModalOpen(true);
                  }}
                  className="flex items-center gap-3 pb-4 border-b border-slate-100 cursor-pointer group hover:bg-emerald-50/60 -mx-2 px-2 py-2 rounded-2xl transition-all block"
                  title={`Bấm để xem hồ sơ chuyên viên & ${authorListingsCount} tin đăng của ${safeAuthor.name}`}
                >
                  <div className="relative shrink-0">
                    <SeoImage
                      src={safeAuthor.avatar}
                      propertyTitle={property.title}
                      type="agent"
                      customContext={safeAuthor.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md group-hover:scale-105 group-hover:border-emerald-600 transition-all"
                    />
                    {safeAuthor.isVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow" title="Môi giới đã xác thực">
                        <i className="fa-solid fa-check"></i>
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        Người đăng tin
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold group-hover:underline flex items-center gap-1 shrink-0">
                        <span>Xem hồ sơ</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {safeAuthor.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {safeAuthor.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-1">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-star"></i>
                        <span className="font-bold text-slate-800">{safeAuthor.rating || '5.0'}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-bold hover:underline">
                        ({authorListingsCount} tin đăng)
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Direct Call & Zalo Action Buttons */}
                <div className="py-4 space-y-2.5">
                  <Link
                    href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
                  >
                    <i className="fa-solid fa-phone-volume group-hover:animate-bounce"></i>
                    <span>Gọi Ngay: {safeAuthor.phone}</span>
                  </Link>

                  <Link
                    href={`https://zalo.me/${safeAuthor.zalo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>Chat Trực Tiếp Qua Zalo</span>
                  </Link>
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
                    placeholder={`Chào anh/chị ${safeAuthor.name}, tôi quan tâm đến BĐS ${property.id}. Vui lòng liên hệ lại...`}
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

      {/* Modal Hồ sơ Chuyên viên tư vấn & Toàn bộ tin đăng của môi giới */}
      {isBrokerModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsBrokerModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setIsBrokerModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-md"
              title="Đóng cửa sổ"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            {/* Header Hero Cover của Môi Giới */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-5 sm:p-7 relative shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <img
                    src={safeAuthor.avatar}
                    alt={safeAuthor.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                  {safeAuthor.isVerified && (
                    <span className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg border-2 border-white" title="Môi giới đã xác thực uy tín">
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      Hồ Sơ Chuyên Viên Tư Vấn
                    </span>
                    {safeAuthor.isVerified && (
                      <span className="text-[11px] font-bold text-sky-200 bg-sky-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-sky-300"></i>
                        Đã xác thực CCCD/eKYC
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black truncate">
                    {safeAuthor.name}
                  </h3>

                  <div className="flex items-center gap-2.5 text-xs text-white/80 flex-wrap">
                    <span>{safeAuthor.title || 'Môi giới chuyên nghiệp'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <i className="fa-solid fa-star"></i>
                      <span>{safeAuthor.rating || '5.0'} / 5.0</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-200">
                      {authorProperties.length} tin đăng đang phụ trách
                    </span>
                  </div>

                  {/* Badges / Thông tin hoạt động */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-white/70 flex-wrap">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-map-location-dot text-emerald-400"></i>
                      <span>Khu vực: {property.city || 'Đà Nẵng'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-bolt text-amber-400"></i>
                      <span>Phản hồi trong 5 phút</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-shield-halved text-sky-300"></i>
                      <span>Pháp lý minh bạch</span>
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons on Header */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  <a
                    href={`tel:${safeAuthor.phone.replace(/\s+/g, '')}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <i className="fa-solid fa-phone"></i>
                    <span>Gọi {safeAuthor.phone}</span>
                  </a>

                  <a
                    href={`https://zalo.me/${safeAuthor.zalo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>Chat Zalo</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Title */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-house-chimney text-emerald-600"></i>
                  <span>Bất Động Sản Của {safeAuthor.name}</span>
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {authorProperties.length} tin
                </span>
              </div>

              {/* Tabs Lọc */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBrokerFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    brokerFilterTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Tất cả ({authorProperties.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBrokerFilterTab('sale')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    brokerFilterTab === 'sale'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Bán ({authorProperties.filter(p => p.type === 'ban' || p.listingType === 'sale').length})
                </button>
                <button
                  type="button"
                  onClick={() => setBrokerFilterTab('rent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    brokerFilterTab === 'rent'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Cho thuê ({authorProperties.filter(p => p.type === 'cho-thue' || p.listingType === 'rent').length})
                </button>
              </div>
            </div>

            {/* Danh sách BĐS của Môi Giới */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-3.5">
              {filteredAuthorProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAuthorProperties.map(p => {
                    const isCurrent = String(p.id) === String(property.id);
                    const permalink = getPropertyPermalink(p);
                    const imgUrl = Array.isArray(p.images) && p.images.length > 0 
                      ? p.images[0] 
                      : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-3 flex gap-3 transition hover:shadow-md relative bg-white ${
                          isCurrent 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Ảnh thu nhỏ */}
                        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100">
                          <img
                            src={imgUrl}
                            alt={p.title}
                            className="w-full h-full object-cover transition hover:scale-105 duration-300"
                            loading="lazy"
                          />
                          {p.vipPackageId && p.vipPackageId !== 'normal' && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white bg-red-600 shadow-xs">
                              VIP
                            </span>
                          )}
                          <span className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-xs ${
                            p.type === 'cho-thue' || p.listingType === 'rent' ? 'bg-sky-600' : 'bg-emerald-600'
                          }`}>
                            {p.type === 'cho-thue' || p.listingType === 'rent' ? 'Cho thuê' : 'Bán'}
                          </span>
                        </div>

                        {/* Thông tin BĐS */}
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-sm font-black text-red-600 font-mono">
                              {p.priceDisplay || (p.price ? `${p.price} Tỷ` : 'Thỏa thuận')}
                            </div>

                            <Link
                              href={permalink}
                              onClick={() => {
                                setIsBrokerModalOpen(false);
                                if (onClose) onClose();
                              }}
                              className="font-bold text-xs text-slate-800 hover:text-emerald-700 transition line-clamp-2 mt-0.5 leading-snug block"
                              title={p.title}
                            >
                              {p.title}
                            </Link>
                          </div>

                          <div className="space-y-1 pt-1.5 border-t border-slate-100">
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <i className="fa-solid fa-location-dot text-slate-400 text-[10px]"></i>
                              <span>{p.district ? `${p.district}, ` : ''}{p.city || 'Đà Nẵng'}</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span className="font-semibold">{p.area || 100} m²</span>
                              {isCurrent ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  Đang xem tin này
                                </span>
                              ) : (
                                <Link
                                  href={permalink}
                                  onClick={() => {
                                    setIsBrokerModalOpen(false);
                                    if (onClose) onClose();
                                  }}
                                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                                >
                                  <span>Xem tin</span>
                                  <i className="fa-solid fa-arrow-right text-[9px]"></i>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <i className="fa-solid fa-box-open text-3xl"></i>
                  <p className="text-xs">Không có tin đăng nào phù hợp với bộ lọc này.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="truncate">
                Chuyên viên: <strong className="text-slate-800">{safeAuthor.name}</strong> • SĐT: <strong className="text-slate-800">{safeAuthor.phone}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsBrokerModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
