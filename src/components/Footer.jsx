'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_FOOTER_CONFIG } from '../data/mockData';

export default function Footer() {
  const { systemConfig, headerConfig, currentUser, footerConfig } = useRealEstate();

  // Danh sách mạng xã hội đã bật
  const socialConfig = headerConfig?.socialLinks || systemConfig?.socialLinks || {};
  const activeSocialList = Object.entries(socialConfig)
    .filter(([_, item]) => item && item.enabled && item.url)
    .map(([key, item]) => ({
      key,
      ...item
    }));

  const activeBrandName = systemConfig?.brandShortName || 'SÀN BẤT ĐỘNG SẢN';
  const activePlatformName = systemConfig?.platformName || `${activeBrandName} - Sàn Giao Dịch Bất Động Sản`;

  const activeHotline = footerConfig?.hotline || systemConfig?.hotline || '0898 246 607';
  const activeZalo = footerConfig?.zalo || systemConfig?.zalo;
  const activeEmail = footerConfig?.email || systemConfig?.email || 'cskh@datbiendanang.vn';
  const activeAddress = footerConfig?.address || systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
  const rawBrandDesc = footerConfig?.brandDescription ?? DEFAULT_FOOTER_CONFIG.brandDescription;
  const brandDesc = rawBrandDesc
    ? rawBrandDesc.replace(/Đất Biển Đà Nẵng/g, activeBrandName).replace(/ĐẤT BIỂN ĐÀ NẴNG/g, activeBrandName)
    : `${activeBrandName} là sàn thương mại điện tử chuyên biệt về bất động sản, đất nền dự án, biệt thự nghỉ dưỡng và căn hộ cao cấp toàn quốc.`;

  const col2Title = footerConfig?.col2Title || DEFAULT_FOOTER_CONFIG.col2Title;
  const col2Links = Array.isArray(footerConfig?.col2Links) && footerConfig.col2Links.length > 0 
    ? footerConfig.col2Links 
    : DEFAULT_FOOTER_CONFIG.col2Links;

  const col3Title = footerConfig?.col3Title || DEFAULT_FOOTER_CONFIG.col3Title;
  const col3Links = Array.isArray(footerConfig?.col3Links) && footerConfig.col3Links.length > 0 
    ? footerConfig.col3Links 
    : DEFAULT_FOOTER_CONFIG.col3Links;

  const col4Title = footerConfig?.col4Title || DEFAULT_FOOTER_CONFIG.col4Title;
  const badges = Array.isArray(footerConfig?.badges) && footerConfig.badges.length > 0 
    ? footerConfig.badges 
    : DEFAULT_FOOTER_CONFIG.badges;

  const policyLinks = Array.isArray(footerConfig?.policyLinks) && footerConfig.policyLinks.length > 0 
    ? footerConfig.policyLinks 
    : DEFAULT_FOOTER_CONFIG.policyLinks;

  const copyrightText = footerConfig?.copyrightCustomText?.trim() 
    ? footerConfig.copyrightCustomText
        .replace(/ĐẤT BIỂN ĐÀ NẴNG/g, activeBrandName)
        .replace(/Đất Biển Đà Nẵng/g, activeBrandName)
        .replace(/Công ty Cổ phần Bất Động Sản Đất Biển Đà Nẵng/g, activePlatformName)
    : `© ${new Date().getFullYear()} ${activeBrandName}. Bản quyền thuộc về ${activePlatformName}.`;

  const showSocial = footerConfig?.showSocialLinks !== false;
  const socialTitle = footerConfig?.socialLinksTitle || 'KẾT NỐI VỚI CHÚNG TÔI:';
  const showAdminLink = (footerConfig?.showAdminCmsLink !== false) && currentUser?.role === 'admin';
  const showSeo = footerConfig?.showSeoTaxonomy !== false;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Cột 1: Brand Info & Contacts */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                <i className="fa-solid fa-building"></i>
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  <span>{activeBrandName}</span>
                </div>
                <div className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                  {systemConfig?.tagline || 'Sàn Giao Dịch Bất Động Sản & Đăng Tin VIP'}
                </div>
              </div>
            </Link>

            {brandDesc && (
              <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
                {brandDesc}
              </p>
            )}

            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-emerald-400" aria-hidden="true"></i>
                <span>
                  Hotline 24/7:{' '}
                  <Link
                    href={`tel:${activeHotline.replace(/\s+/g, '')}`}
                    className="text-white hover:text-emerald-400 font-bold font-mono transition"
                    title={`Gọi điện Hotline 24/7: ${activeHotline}`}
                    aria-label={`Gọi điện Hotline 24/7: ${activeHotline}`}
                  >
                    {activeHotline}
                  </Link>
                  {activeZalo && (
                    <span className="text-slate-300 text-xs ml-1.5">
                      (
                      <Link
                        href={`https://zalo.me/${activeZalo.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-mono"
                        title={`Nhắn tin tư vấn Zalo: ${activeZalo}`}
                        aria-label={`Nhắn tin tư vấn Zalo: ${activeZalo}`}
                      >
                        Zalo: {activeZalo}
                      </Link>
                      )
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-emerald-400"></i>
                <span>
                  Email:{' '}
                  <Link
                    href={`mailto:${activeEmail}`}
                    className="text-white hover:text-emerald-400 font-bold transition"
                    title="Gửi email phản ánh / CSKH"
                  >
                    {activeEmail}
                  </Link>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-emerald-400"></i>
                <span>Trụ sở chính: {activeAddress}</span>
              </div>
            </div>

            {/* Social Media Links in Footer */}
            {showSocial && activeSocialList.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-share-nodes text-emerald-400"></i>
                  <span>{socialTitle}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeSocialList.map(item => (
                    <Link
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs hover:border-emerald-500/50 hover:scale-105"
                      title={item.label || item.key}
                    >
                      {item.key === 'zalo' ? (
                        <span className="font-black text-[11px] text-sky-400 leading-none">Z</span>
                      ) : (
                        <i className={`${item.icon} text-xs`}></i>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột 2: Quick links */}
          <nav aria-label="Khám phá nhanh">
            <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              {col2Title}
            </h3>
            <ul className="space-y-0.5 text-xs text-slate-300">
              {col2Links.map(link => (
                <li key={link.id || link.url}>
                  <Link to={link.url} className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cột 3: Service & Member packages */}
          <nav aria-label="Dịch vụ và tiện ích">
            <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              {col3Title}
            </h3>
            <ul className="space-y-0.5 text-xs text-slate-300">
              {col3Links.map(link => (
                <li key={link.id || link.url}>
                  <Link to={link.url} className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group">
                    {link.icon && <i className={`${link.icon} ${link.color || 'text-amber-400'} text-[11px] group-hover:scale-110 transition`}></i>}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              {showAdminLink && (
                <li>
                  <Link
                    to="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 sm:py-1 hover:text-red-400 transition flex items-center gap-1.5 text-red-400 font-semibold"
                  >
                    <i className="fa-solid fa-shield-halved text-red-500 text-[11px]"></i>
                    <span>Bàn Làm Việc CMS Admin</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400"></i>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Cột 4: Trust & Certifications */}
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              {col4Title}
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              {badges.map(badge => {
                const BadgeWrapper = badge.url ? Link : 'div';
                const wrapperProps = badge.url 
                  ? { href: badge.url, target: '_blank', rel: 'noopener noreferrer' } 
                  : {};

                return (
                  <BadgeWrapper
                    key={badge.id || badge.title}
                    {...wrapperProps}
                    className={`block p-3 bg-slate-800 rounded-xl border border-slate-700 ${badge.url ? 'hover:border-emerald-500/60 hover:bg-slate-800/80 transition' : ''}`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                      {badge.icon && <i className={`${badge.icon} ${badge.iconColor || 'text-emerald-400'}`}></i>}
                      <span>{badge.title}</span>
                      {badge.url && <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-300 ml-auto"></i>}
                    </div>
                    {badge.desc && (
                      <div className="text-[11px] leading-relaxed text-slate-300">{badge.desc}</div>
                    )}
                  </BadgeWrapper>
                );
              })}
            </div>
          </div>
        </div>

        {/* SEO Category & Location Taxonomy Footer Links */}
        {showSeo && (
          <nav aria-label="Chỉ mục danh mục bất động sản và khu vực" className="pt-8 pb-6 border-t border-slate-800/80">
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-sitemap text-[11px]"></i>
                Danh Mục Bất Động Sản & Địa Giới Hành Chính Chuẩn SEO
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Tra cứu nhanh theo loại hình, tỉnh thành, quận huyện, phường xã và dự án trọng điểm
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-6 text-xs text-slate-300 max-w-6xl">
              {/* Column 1: BĐS Bán - Nhà Ở & Căn Hộ */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-emerald-300">
                  Bất Động Sản Nhà Ở & Căn Hộ
                </div>
                <ul className="space-y-0.5">
                  <li><Link to="/ban-can-ho-chung-cu/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán căn hộ chung cư</span></Link></li>
                  <li><Link to="/ban-chung-cu-mini/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán chung cư mini, căn hộ dịch vụ</span></Link></li>
                  <li><Link to="/ban-nha-rieng/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán nhà riêng</span></Link></li>
                  <li><Link to="/ban-nha-biet-thu-lien-ke/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán nhà biệt thự, liền kề</span></Link></li>
                  <li><Link to="/ban-nha-mat-pho/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán nhà mặt phố</span></Link></li>
                  <li><Link to="/ban-shophouse/" className="py-1.5 sm:py-1 hover:text-emerald-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-400 transition shrink-0"></span><span className="truncate">Bán shophouse</span></Link></li>
                </ul>
              </div>

              {/* Column 2: BĐS Đất Nền & Đầu Tư */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-amber-300">
                  Đất Nền, Nghỉ Dưỡng & Kho Xưởng
                </div>
                <ul className="space-y-0.5">
                  <li><Link to="/ban-dat-nen-du-an/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán đất nền dự án</span></Link></li>
                  <li><Link to="/ban-dat/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán đất</span></Link></li>
                  <li><Link to="/ban-trang-trai-khu-nghi-duong/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán trang trại, khu nghỉ dưỡng</span></Link></li>
                  <li><Link to="/ban-condotel/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán condotel</span></Link></li>
                  <li><Link to="/ban-kho-nha-xuong/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán kho, nhà xưởng</span></Link></li>
                  <li><Link to="/ban-bat-dong-san-khac/" className="py-1.5 sm:py-1 hover:text-amber-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-amber-400 transition shrink-0"></span><span className="truncate">Bán loại BĐS khác</span></Link></li>
                </ul>
              </div>

              {/* Column 3: BĐS Cho Thuê Chuẩn SEO */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-blue-300">
                  Bất Động Sản Cho Thuê
                </div>
                <ul className="space-y-0.5">
                  <li><Link to="/cho-thue-can-ho-chung-cu/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê căn hộ chung cư</span></Link></li>
                  <li><Link to="/cho-thue-chung-cu-mini/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê chung cư mini, CH dịch vụ</span></Link></li>
                  <li><Link to="/cho-thue-nha-rieng/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê nhà riêng, nguyên căn</span></Link></li>
                  <li><Link to="/cho-thue-nha-biet-thu-lien-ke/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê biệt thự, liền kề</span></Link></li>
                  <li><Link to="/cho-thue-nha-mat-pho/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê nhà mặt phố</span></Link></li>
                  <li><Link to="/cho-thue-kho-nha-xuong/" className="py-1.5 sm:py-1 hover:text-blue-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400 transition shrink-0"></span><span className="truncate">Cho thuê kho, nhà xưởng</span></Link></li>
                </ul>
              </div>

              {/* Column 4: BĐS Trọng Điểm Đà Nẵng */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 text-rose-300">
                  BĐS Trọng Điểm Đà Nẵng
                </div>
                <ul className="space-y-0.5">
                  <li><Link to="/ban-can-ho-chung-cu-quan-son-tra/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Căn hộ Sơn Trà (The Sang)</span></Link></li>
                  <li><Link to="/ban-nha-rieng-quan-hai-chau/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Nhà riêng Quận Hải Châu</span></Link></li>
                  <li><Link to="/ban-dat-nen-du-an-quan-ngu-hanh-son/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Đất nền Nam Hòa Xuân</span></Link></li>
                  <li><Link to="/ban-dat-nen-du-an-da-nang/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Đất nền dự án Đà Nẵng</span></Link></li>
                  <li><Link to="/cho-thue-nha-biet-thu-lien-ke-quan-son-tra/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Biệt thự biển Sơn Trà</span></Link></li>
                  <li><Link to="/ban-dat-quan-cam-le/" className="py-1.5 sm:py-1 hover:text-rose-400 transition flex items-center gap-1.5 group"><span className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-rose-400 transition shrink-0"></span><span className="truncate">Đất Cẩm Lệ & Hòa Vang</span></Link></li>
                </ul>
              </div>
            </div>
          </nav>
        )}

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            {copyrightText}
          </div>
          <nav aria-label="Chính sách và điều khoản" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
            {policyLinks.map(policy => (
              <Link key={policy.id || policy.url} to={policy.url} className="py-1.5 hover:text-emerald-400 transition inline-block">
                {policy.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
