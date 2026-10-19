'use client';

import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';

export default function FeaturedCategories() {
  const { properties } = useRealEstate();
  const [activeTab, setActiveTab] = useState('sale'); // 'sale' | 'rent' | 'location' | 'project'

  const activeProps = properties.filter(p => p.status === 'active' && (!p.expiresAt || Date.now() < new Date(p.expiresAt).getTime()));

  // Đếm số lượng tin cho từng danh mục
  const countByType = (demand, type) => activeProps.filter(p => p.demand === demand && p.propertyType === type).length;
  const countByCity = (cityKeyword) => activeProps.filter(p => p.city?.toLowerCase().includes(cityKeyword.toLowerCase())).length;

  // 12 Danh mục Bất Động Sản Bán chuẩn SEO
  const saleCategories = [
    {
      title: 'Căn Hộ Chung Cư',
      path: '/ban-can-ho-chung-cu',
      icon: 'fa-solid fa-building',
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Chung cư thương mại, view thoáng, đầy đủ sổ hồng',
      count: countByType('sale', 'apartment'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-can-ho-chung-cu-ha-noi' },
        { label: 'Cầu Giấy', path: '/ban-can-ho-chung-cu-quan-cau-giay' },
        { label: 'Phường Dịch Vọng', path: '/ban-can-ho-chung-cu-phuong-dich-vong-cau-giay' },
        { label: 'TP.HCM', path: '/ban-can-ho-chung-cu-tp-hcm' }
      ]
    },
    {
      title: 'Chung Cư Mini, Căn Hộ Dịch Vụ',
      path: '/ban-chung-cu-mini-can-ho-dich-vu',
      icon: 'fa-solid fa-city',
      color: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Tòa nhà dòng tiền cao, khai thác cho thuê ổn định',
      count: countByType('sale', 'mini-apartment'),
      popularLinks: [
        { label: 'Cầu Giấy', path: '/ban-chung-cu-mini-can-ho-dich-vu-quan-cau-giay' },
        { label: 'Hà Nội', path: '/ban-chung-cu-mini-can-ho-dich-vu-ha-noi' },
        { label: 'TP.HCM', path: '/ban-chung-cu-mini-can-ho-dich-vu-tp-hcm' },
        { label: 'Quận 1', path: '/ban-chung-cu-mini-can-ho-dich-vu-quan-1' }
      ]
    },
    {
      title: 'Nhà Riêng',
      path: '/ban-nha-rieng',
      icon: 'fa-solid fa-house',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Nhà thổ cư chính chủ, ngõ nông ô tô, sổ đỏ vuông vắn',
      count: countByType('sale', 'house'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-nha-rieng-ha-noi' },
        { label: 'Quận Ba Đình', path: '/ban-nha-rieng-quan-ba-dinh' },
        { label: 'Phường Kim Mã', path: '/ban-nha-rieng-phuong-kim-ma-ba-dinh' },
        { label: 'Quận 1 TP.HCM', path: '/ban-nha-rieng-quan-1' }
      ]
    },
    {
      title: 'Nhà Biệt Thự, Liền Kề',
      path: '/ban-nha-biethu-lien-ke',
      icon: 'fa-solid fa-landmark',
      color: 'from-amber-500 to-yellow-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Biệt thự đơn lập, song lập, khu đô thị compound an ninh',
      count: countByType('sale', 'villa'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-nha-biethu-lien-ke-ha-noi' },
        { label: 'TP.HCM', path: '/ban-nha-biethu-lien-ke-tp-hcm' },
        { label: 'Đà Nẵng', path: '/ban-nha-biethu-lien-ke-da-nang' },
        { label: 'Sơn Trà', path: '/ban-nha-biethu-lien-ke-quan-son-tra' }
      ]
    },
    {
      title: 'Nhà Mặt Phố',
      path: '/ban-nha-mat-pho',
      icon: 'fa-solid fa-shop',
      color: 'from-rose-500 to-red-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Mặt tiền tuyến phố kinh doanh sầm uất, vỉa hè rộng',
      count: countByType('sale', 'street-house'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-nha-mat-pho-ha-noi' },
        { label: 'Quận 1 TP.HCM', path: '/ban-nha-mat-pho-quan-1' },
        { label: 'Đà Nẵng', path: '/ban-nha-mat-pho-da-nang' },
        { label: 'Ba Đình', path: '/ban-nha-mat-pho-quan-ba-dinh' }
      ]
    },
    {
      title: 'Shophouse',
      path: '/ban-shophouse-nha-pho-thuong-mai',
      icon: 'fa-solid fa-store',
      color: 'from-orange-500 to-amber-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      description: 'Nhà phố thương mại khối đế dự án, vừa ở vừa kinh doanh',
      count: countByType('sale', 'shophouse'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-shophouse-nha-pho-thuong-mai-ha-noi' },
        { label: 'TP.HCM', path: '/ban-shophouse-nha-pho-thuong-mai-tp-hcm' },
        { label: 'Cầu Giấy', path: '/ban-shophouse-nha-pho-thuong-mai-quan-cau-giay' },
        { label: 'Đà Nẵng', path: '/ban-shophouse-nha-pho-thuong-mai-da-nang' }
      ]
    },
    {
      title: 'Đất Nền Dự Án',
      path: '/ban-dat-nen-du-an',
      icon: 'fa-solid fa-mountain-sun',
      color: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Đất phân lô quy hoạch hoàn chỉnh, pháp lý an toàn',
      count: countByType('sale', 'project-land') || countByType('sale', 'land'),
      popularLinks: [
        { label: 'Đà Nẵng', path: '/ban-dat-nen-du-an-da-nang' },
        { label: 'Ngũ Hành Sơn', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
        { label: 'Hải Châu', path: '/ban-dat-nen-du-an-quan-hai-chau' },
        { label: 'Bình Dương', path: '/ban-dat-nen-du-an-binh-duong' }
      ]
    },
    {
      title: 'Đất',
      path: '/ban-dat',
      icon: 'fa-solid fa-map',
      color: 'from-lime-600 to-green-700',
      badgeBg: 'bg-lime-50 text-lime-700 border-lime-200',
      description: 'Đất thổ cư chính chủ, đất vườn ven đô, giá đầu tư',
      count: countByType('sale', 'land'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-dat-ha-noi' },
        { label: 'TP.HCM', path: '/ban-dat-tp-hcm' },
        { label: 'Đà Nẵng', path: '/ban-dat-da-nang' },
        { label: 'Ngũ Hành Sơn', path: '/ban-dat-quan-ngu-hanh-son' }
      ]
    },
    {
      title: 'Trang Trại, Khu Nghỉ Dưỡng',
      path: '/ban-trang-trai-khu-nghi-duong',
      icon: 'fa-solid fa-tree',
      color: 'from-green-600 to-emerald-700',
      badgeBg: 'bg-green-50 text-green-700 border-green-200',
      description: 'Farmstay, homestay nghỉ dưỡng sinh thái ven đô view hồ, núi',
      count: countByType('sale', 'farm-resort'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-trang-trai-khu-nghi-duong-ha-noi' },
        { label: 'Đà Nẵng', path: '/ban-trang-trai-khu-nghi-duong-da-nang' },
        { label: 'Bình Dương', path: '/ban-trang-trai-khu-nghi-duong-binh-duong' }
      ]
    },
    {
      title: 'Condotel',
      path: '/ban-condotel',
      icon: 'fa-solid fa-hotel',
      color: 'from-violet-500 to-purple-600',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      description: 'Căn hộ khách sạn du lịch biển, cam kết lợi nhuận',
      count: countByType('sale', 'condotel'),
      popularLinks: [
        { label: 'Đà Nẵng', path: '/ban-condotel-da-nang' },
        { label: 'Ngũ Hành Sơn', path: '/ban-condotel-quan-ngu-hanh-son' },
        { label: 'Sơn Trà', path: '/ban-condotel-quan-son-tra' }
      ]
    },
    {
      title: 'Kho, Nhà Xưởng',
      path: '/ban-kho-nha-xuong',
      icon: 'fa-solid fa-warehouse',
      color: 'from-slate-600 to-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      description: 'Kho bãi xưởng công nghiệp chuẩn PCCC, trạm biến áp riêng',
      count: countByType('sale', 'warehouse'),
      popularLinks: [
        { label: 'Bình Dương', path: '/ban-kho-nha-xuong-binh-duong' },
        { label: 'Hà Nội', path: '/ban-kho-nha-xuong-ha-noi' },
        { label: 'TP.HCM', path: '/ban-kho-nha-xuong-tp-hcm' }
      ]
    },
    {
      title: 'Loại BĐS Khác',
      path: '/ban-bat-dong-san-khac',
      icon: 'fa-solid fa-shapes',
      color: 'from-fuchsia-500 to-pink-600',
      badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      description: 'Tòa nhà hỗn hợp, bến bãi, mặt bằng đa công năng',
      count: countByType('sale', 'other'),
      popularLinks: [
        { label: 'Hà Nội', path: '/ban-bat-dong-san-khac-ha-noi' },
        { label: 'TP.HCM', path: '/ban-bat-dong-san-khac-tp-hcm' },
        { label: 'Đà Nẵng', path: '/ban-bat-dong-san-khac-da-nang' }
      ]
    }
  ];

  // 12 Danh mục Bất Động Sản Cho Thuê chuẩn SEO
  const rentCategories = [
    {
      title: 'Căn Hộ Chung Cư',
      path: '/cho-thue-can-ho-chung-cu',
      icon: 'fa-solid fa-building',
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Căn hộ chung cư đủ đồ nội thất, tiện ích hồ bơi, gym',
      count: countByType('rent', 'apartment'),
      popularLinks: [
        { label: 'TP.HCM', path: '/cho-thue-can-ho-chung-cu-tp-hcm' },
        { label: 'Quận 1', path: '/cho-thue-can-ho-chung-cu-quan-1' },
        { label: 'Hà Nội', path: '/cho-thue-can-ho-chung-cu-ha-noi' },
        { label: 'Cầu Giấy', path: '/cho-thue-can-ho-chung-cu-quan-cau-giay' }
      ]
    },
    {
      title: 'Chung Cư Mini, Căn Hộ Dịch Vụ',
      path: '/cho-thue-chung-cu-mini-can-ho-dich-vu',
      icon: 'fa-solid fa-city',
      color: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Studio, 1PN full nội thất, giờ giấc tự do, thang máy',
      count: countByType('rent', 'mini-apartment'),
      popularLinks: [
        { label: 'Quận 1', path: '/cho-thue-chung-cu-mini-can-ho-dich-vu-quan-1' },
        { label: 'Cầu Giấy', path: '/cho-thue-chung-cu-mini-can-ho-dich-vu-quan-cau-giay' },
        { label: 'Hà Nội', path: '/cho-thue-chung-cu-mini-can-ho-dich-vu-ha-noi' },
        { label: 'TP.HCM', path: '/cho-thue-chung-cu-mini-can-ho-dich-vu-tp-hcm' }
      ]
    },
    {
      title: 'Nhà Riêng',
      path: '/cho-thue-nha-rieng',
      icon: 'fa-solid fa-house',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Nhà nguyên căn ở gia đình, làm văn phòng công ty',
      count: countByType('rent', 'house'),
      popularLinks: [
        { label: 'Quận 1', path: '/cho-thue-nha-rieng-quan-1' },
        { label: 'Phường Bến Nghé', path: '/cho-thue-nha-rieng-phuong-ben-nghe-quan-1' },
        { label: 'Hà Nội', path: '/cho-thue-nha-rieng-ha-noi' },
        { label: 'Ba Đình', path: '/cho-thue-nha-rieng-quan-ba-dinh' }
      ]
    },
    {
      title: 'Nhà Biệt Thự, Liền Kề',
      path: '/cho-thue-nha-biethu-lien-ke',
      icon: 'fa-solid fa-landmark',
      color: 'from-amber-500 to-yellow-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Biệt thự sang trọng cho chuyên gia nước ngoài, làm trụ sở',
      count: countByType('rent', 'villa'),
      popularLinks: [
        { label: 'TP.HCM', path: '/cho-thue-nha-biethu-lien-ke-tp-hcm' },
        { label: 'Hà Nội', path: '/cho-thue-nha-biethu-lien-ke-ha-noi' },
        { label: 'Đà Nẵng', path: '/cho-thue-nha-biethu-lien-ke-da-nang' }
      ]
    },
    {
      title: 'Nhà Mặt Phố',
      path: '/cho-thue-nha-mat-pho',
      icon: 'fa-solid fa-shop',
      color: 'from-rose-500 to-red-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Mặt bằng kinh doanh thời trang, spa, showroom thương hiệu',
      count: countByType('rent', 'street-house'),
      popularLinks: [
        { label: 'Quận 1', path: '/cho-thue-nha-mat-pho-quan-1' },
        { label: 'Hà Nội', path: '/cho-thue-nha-mat-pho-ha-noi' },
        { label: 'TP.HCM', path: '/cho-thue-nha-mat-pho-tp-hcm' },
        { label: 'Đà Nẵng', path: '/cho-thue-nha-mat-pho-da-nang' }
      ]
    },
    {
      title: 'Shophouse',
      path: '/cho-thue-shophouse-nha-pho-thuong-mai',
      icon: 'fa-solid fa-store',
      color: 'from-orange-500 to-amber-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      description: 'Shophouse khối đế chung cư cư dân đông đúc, mở F&B',
      count: countByType('rent', 'shophouse'),
      popularLinks: [
        { label: 'TP.HCM', path: '/cho-thue-shophouse-nha-pho-thuong-mai-tp-hcm' },
        { label: 'Hà Nội', path: '/cho-thue-shophouse-nha-pho-thuong-mai-ha-noi' },
        { label: 'Cầu Giấy', path: '/cho-thue-shophouse-nha-pho-thuong-mai-quan-cau-giay' }
      ]
    },
    {
      title: 'Đất Nền Dự Án',
      path: '/cho-thue-dat-nen-du-an',
      icon: 'fa-solid fa-mountain-sun',
      color: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Thuê đất dự án làm bãi đỗ xe, sân thể thao, kho trung chuyển',
      count: countByType('rent', 'project-land'),
      popularLinks: [
        { label: 'Đà Nẵng', path: '/cho-thue-dat-nen-du-an-da-nang' },
        { label: 'TP.HCM', path: '/cho-thue-dat-nen-du-an-tp-hcm' },
        { label: 'Bình Dương', path: '/cho-thue-dat-nen-du-an-binh-duong' }
      ]
    },
    {
      title: 'Đất',
      path: '/cho-thue-dat',
      icon: 'fa-solid fa-map',
      color: 'from-lime-600 to-green-700',
      badgeBg: 'bg-lime-50 text-lime-700 border-lime-200',
      description: 'Thuê đất trống dài hạn làm vườn ươm, kho bãi kinh doanh',
      count: countByType('rent', 'land'),
      popularLinks: [
        { label: 'TP.HCM', path: '/cho-thue-dat-tp-hcm' },
        { label: 'Hà Nội', path: '/cho-thue-dat-ha-noi' },
        { label: 'Đà Nẵng', path: '/cho-thue-dat-da-nang' }
      ]
    },
    {
      title: 'Trang Trại, Khu Nghỉ Dưỡng',
      path: '/cho-thue-trang-trai-khu-nghi-duong',
      icon: 'fa-solid fa-tree',
      color: 'from-green-600 to-emerald-700',
      badgeBg: 'bg-green-50 text-green-700 border-green-200',
      description: 'Thuê khu nghỉ dưỡng, resort tổ chức sự kiện, retreat',
      count: countByType('rent', 'farm-resort'),
      popularLinks: [
        { label: 'Hà Nội', path: '/cho-thue-trang-trai-khu-nghi-duong-ha-noi' },
        { label: 'Đà Nẵng', path: '/cho-thue-trang-trai-khu-nghi-duong-da-nang' }
      ]
    },
    {
      title: 'Condotel',
      path: '/cho-thue-condotel',
      icon: 'fa-solid fa-hotel',
      color: 'from-violet-500 to-purple-600',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
      description: 'Thuê căn hộ condotel nghỉ dưỡng dài hạn view biển',
      count: countByType('rent', 'condotel'),
      popularLinks: [
        { label: 'Đà Nẵng', path: '/cho-thue-condotel-da-nang' },
        { label: 'Ngũ Hành Sơn', path: '/cho-thue-condotel-quan-ngu-hanh-son' }
      ]
    },
    {
      title: 'Kho, Nhà Xưởng',
      path: '/cho-thue-kho-nha-xuong',
      icon: 'fa-solid fa-warehouse',
      color: 'from-slate-600 to-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      description: 'Thuê kho chứa hàng, nhà xưởng sản xuất, xe container ra vào',
      count: countByType('rent', 'warehouse'),
      popularLinks: [
        { label: 'Bình Dương', path: '/cho-thue-kho-nha-xuong-binh-duong' },
        { label: 'TP.HCM', path: '/cho-thue-kho-nha-xuong-tp-hcm' },
        { label: 'Hà Nội', path: '/cho-thue-kho-nha-xuong-ha-noi' }
      ]
    },
    {
      title: 'Loại BĐS Khác',
      path: '/cho-thue-bat-dong-san-khac',
      icon: 'fa-solid fa-shapes',
      color: 'from-fuchsia-500 to-pink-600',
      badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      description: 'Thuê mặt bằng kiot, rooftop, bến bãi, không gian sáng tạo',
      count: countByType('rent', 'other'),
      popularLinks: [
        { label: 'Hà Nội', path: '/cho-thue-bat-dong-san-khac-ha-noi' },
        { label: 'TP.HCM', path: '/cho-thue-bat-dong-san-khac-tp-hcm' },
        { label: 'Đà Nẵng', path: '/cho-thue-bat-dong-san-khac-da-nang' }
      ]
    }
  ];

  const locations = [
    {
      name: 'Hà Nội',
      slug: 'ha-noi',
      badge: 'Thủ Đô',
      image: 'https://images.unsplash.com/photo-1509030450996-93883b2762a0?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Hà Nội'),
      districts: [
        { name: 'Quận Cầu Giấy', path: '/ban-can-ho-chung-cu-quan-cau-giay' },
        { name: 'Phường Dịch Vọng', path: '/ban-can-ho-chung-cu-phuong-dich-vong-cau-giay' },
        { name: 'Quận Ba Đình', path: '/ban-nha-rieng-quan-ba-dinh' },
        { name: 'Phường Kim Mã', path: '/ban-nha-rieng-phuong-kim-ma-ba-dinh' },
        { name: 'Quận Long Biên', path: '/ban-can-ho-chung-cu-quan-long-bien' }
      ]
    },
    {
      name: 'TP. Hồ Chí Minh',
      slug: 'tp-hcm',
      badge: 'Kinh Tế',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Hồ Chí Minh'),
      districts: [
        { name: 'Quận 1 (Trung tâm)', path: '/cho-thue-nha-rieng-quan-1' },
        { name: 'Phường Bến Nghé', path: '/cho-thue-nha-rieng-phuong-ben-nghe-quan-1' },
        { name: 'TP. Thủ Đức', path: '/ban-can-ho-chung-cu-tp-thu-duc' },
        { name: 'Quận Bình Thạnh', path: '/ban-can-ho-chung-cu-quan-binh-thanh' },
        { name: 'Quận Tân Phú', path: '/ban-can-ho-chung-cu-quan-tan-phu' }
      ]
    },
    {
      name: 'Đà Nẵng',
      slug: 'da-nang',
      badge: 'Du Lịch',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
      count: countByCity('Đà Nẵng'),
      districts: [
        { name: 'Quận Hải Châu', path: '/ban-nha-rieng-quan-hai-chau' },
        { name: 'Quận Ngũ Hành Sơn', path: '/ban-dat-nen-du-an-quan-ngu-hanh-son' },
        { name: 'Quận Sơn Trà', path: '/ban-nha-rieng-quan-son-tra' },
        { name: 'Đất Nền Đà Nẵng', path: '/ban-dat-nen-du-an-da-nang' },
        { name: 'Căn Hộ Biển Đà Nẵng', path: '/ban-can-ho-chung-cu-da-nang' }
      ]
    }
  ];

  const featuredProjects = [
    {
      name: 'Dự án Goldmark City',
      location: '136 Hồ Tùng Mậu, Cầu Giấy, Hà Nội',
      path: '/ban-can-ho-chung-cu-du-an-goldmark-city',
      icon: 'fa-solid fa-city',
      tag: 'Căn Hộ Cao Cấp'
    },
    {
      name: 'Dự án Celadon City',
      location: 'Tân Phú, TP. Hồ Chí Minh',
      path: '/ban-can-ho-chung-cu-du-an-celadon-city',
      icon: 'fa-solid fa-tree-city',
      tag: 'Khu Đô Thị Xanh'
    },
    {
      name: 'Căn Hộ Cầu Giấy (2 - 5 Tỷ)',
      location: 'Mức giá tìm kiếm nhiều nhất tại Cầu Giấy',
      path: '/ban-can-ho-chung-cu-quan-cau-giay-gia-tu-2-den-5-ty',
      icon: 'fa-solid fa-tags',
      tag: 'Lọc Theo Giá'
    },
    {
      name: 'Nhà Riêng Ba Đình (50 - 100 m²)',
      location: 'Nhà phố thổ cư diện tích vàng quận Ba Đình',
      path: '/ban-nha-rieng-quan-ba-dinh-dien-tich-50-100-m2',
      icon: 'fa-solid fa-ruler-combined',
      tag: 'Lọc Theo Diện Tích'
    }
  ];

  const currentCategories = activeTab === 'sale' ? saleCategories : rentCategories;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <i className="fa-solid fa-sitemap"></i>
            Hệ Thống 12 Danh Mục Bất Động Sản Chuẩn SEO
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Khám Phá Theo Nhu Cầu & Địa Lý Trọng Điểm
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sale'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-tag text-emerald-600 text-[11px]"></i>
            Bán BĐS (12 Danh Mục)
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rent'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-key text-blue-600 text-[11px]"></i>
            Cho Thuê (12 Danh Mục)
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'location'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-location-dot text-indigo-600 text-[11px]"></i>
            Hà Nội, TP.HCM, ĐN
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'project'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-city text-amber-600 text-[11px]"></i>
            Dự Án & Lọc Nhanh
          </button>
        </div>
      </div>

      {/* Tab 1 & Tab 2: Hiển thị 12 Danh mục Bán / Cho Thuê dạng Grid 4 cột */}
      {(activeTab === 'sale' || activeTab === 'rent') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {currentCategories.map((cat, idx) => (
            <div
              key={idx}
              className={`p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between group ${
                activeTab === 'sale' ? 'hover:border-emerald-500' : 'hover:border-blue-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center text-base shadow-xs group-hover:scale-108 transition-transform`}>
                    <i className={cat.icon}></i>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                    {cat.count > 0 ? `${cat.count} BĐS` : 'Mới cập nhật'}
                  </span>
                </div>

                <Link to={cat.path} className={`block transition ${activeTab === 'sale' ? 'group-hover:text-emerald-600' : 'group-hover:text-blue-600'}`}>
                  <h3 className="font-extrabold text-[13.5px] text-slate-900 mb-1 leading-snug line-clamp-1">
                    {cat.title}
                  </h3>
                </Link>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Sub links */}
              <div className="pt-2.5 border-t border-slate-100 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {cat.popularLinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      to={sub.path}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 font-semibold transition border border-slate-200/60 ${
                        activeTab === 'sale' 
                          ? 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' 
                          : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Địa Lý Trọng Điểm (Hà Nội, TP.HCM, Đà Nẵng) */}
      {activeTab === 'location' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-400 transition flex flex-col"
            >
              {/* Image banner */}
              <div className="relative h-36 overflow-hidden group">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white mr-2">
                      {loc.badge}
                    </span>
                    <h3 className="text-lg font-black text-white">{loc.name}</h3>
                  </div>
                  <span className="text-xs text-slate-200 font-semibold bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    {loc.count} Tin đăng
                  </span>
                </div>
              </div>

              {/* District & Ward Links */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Khu vực trọng điểm chuẩn SEO:
                  </div>
                  {loc.districts.map((d, dIdx) => (
                    <Link
                      key={dIdx}
                      to={d.path}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition border border-transparent hover:border-emerald-200 group"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-slate-400 group-hover:text-emerald-600 text-[11px]"></i>
                        <span>{d.name}</span>
                      </span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5"></i>
                    </Link>
                  ))}
                </div>

                <Link
                  to={loc.slug === 'da-nang' ? '/ban-dat-nen-du-an-da-nang' : `/ban-can-ho-chung-cu-${loc.slug}`}
                  className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Xem Tất Cả Nhà Đất {loc.name}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Dự Án Tiêu Biểu & Bộ Lọc Nhanh */}
      {activeTab === 'project' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {featuredProjects.map((proj, idx) => (
            <Link
              key={idx}
              to={proj.path}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg group-hover:scale-110 transition">
                    <i className={proj.icon}></i>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {proj.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition mb-1">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {proj.location}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>Khám phá ngay</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
