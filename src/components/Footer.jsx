'use client';

import React, { useMemo } from 'react';
import { Link } from '../router/RouterContext';
import { useRealEstate } from '../context/RealEstateContext';
import { DEFAULT_FOOTER_CONFIG } from '../data/mockData';
import SocialIcon from './SocialIcon';

const FOOTER_CATEGORY_COLUMNS = [
  {
    key: 'sale',
    viewAllUrl: '/nha-dat-ban',
    items: [
      { label: 'Bán căn hộ chung cư', url: '/ban-can-ho-chung-cu' },
      { label: 'Bán nhà riêng', url: '/ban-nha-rieng' },
      { label: 'Bán biệt thự, liền kề', url: '/ban-nha-biet-thu-lien-ke' },
      { label: 'Bán nhà mặt phố, shophouse', url: '/ban-nha-mat-pho' },
      { label: 'Bán đất nền, đất thổ cư', url: '/ban-dat' },
      { label: 'Bán văn phòng, mặt bằng', url: '/ban-mat-bang-van-phong' },
      { label: 'Bán kho xưởng', url: '/ban-kho-nha-xuong' }
    ]
  },
  {
    key: 'rent',
    viewAllUrl: '/nha-dat-cho-thue',
    items: [
      { label: 'Thuê căn hộ chung cư', url: '/cho-thue-can-ho-chung-cu' },
      { label: 'Thuê nhà riêng', url: '/cho-thue-nha-rieng' },
      { label: 'Thuê biệt thự, liền kề', url: '/cho-thue-nha-biet-thu-lien-ke' },
      { label: 'Thuê nhà mặt phố, shophouse', url: '/cho-thue-nha-mat-pho' },
      { label: 'Thuê đất nền, đất thổ cư', url: '/cho-thue-dat' },
      { label: 'Thuê văn phòng, mặt bằng', url: '/cho-thue-van-phong' },
      { label: 'Thuê kho xưởng', url: '/cho-thue-kho-nha-xuong' }
    ]
  }
];

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

  const { brandNameDisplay, brandHighlightDisplay } = useMemo(() => {
    let bName = headerConfig?.brandName?.trim() || '';
    let bHighlight = headerConfig?.brandHighlight?.trim() || '';

    if (!bName && !bHighlight) {
      const fullText = (systemConfig?.brandShortName || 'SÀN NHÀ ĐẤT').trim();
      const domainMatch = fullText.match(/^(.+?)(\.(?:com\.vn|vn|com|net|org))$/i);
      if (domainMatch) {
        bName = domainMatch[1];
        bHighlight = domainMatch[2];
      } else {
        const words = fullText.split(/\s+/).filter(Boolean);
        if (words.length <= 1) {
          bName = words[0] || 'NHÀ ĐẤT';
          bHighlight = '';
        } else {
          bName = words.slice(0, -1).join(' ');
          bHighlight = words[words.length - 1];
        }
      }
    } else if (!bHighlight) {
      const domainMatch = bName.match(/^(.+?)(\.(?:com\.vn|vn|com|net|org))$/i);
      if (domainMatch) {
        bName = domainMatch[1];
        bHighlight = domainMatch[2];
      }
    }

    return {
      brandNameDisplay: bName,
      brandHighlightDisplay: bHighlight
    };
  }, [headerConfig?.brandName, headerConfig?.brandHighlight, systemConfig?.brandShortName]);

  const activeBrandName = [brandNameDisplay, brandHighlightDisplay].filter(Boolean).join('') || systemConfig?.brandShortName || 'SÀN NHÀ ĐẤT';
  const activePlatformName = systemConfig?.platformName || `${activeBrandName} - Sàn Giao Dịch Nhà Đất`;

  const activeHotline = footerConfig?.hotline || systemConfig?.hotline || '0898 246 607';
  const activeZalo = footerConfig?.zalo || systemConfig?.zalo;
  const activeEmail = footerConfig?.email || systemConfig?.email || 'cskh@kenhnhadat24h.com.vn';
  const activeAddress = footerConfig?.address || systemConfig?.address || 'Lô A38 Trần Văn Trứ, Phường Hải Châu, Thành Phố Đà Nẵng';
  const rawBrandDesc = footerConfig?.brandDescription ?? DEFAULT_FOOTER_CONFIG.brandDescription;
  const brandDesc = rawBrandDesc
    ? rawBrandDesc.replace(/\{\{brandName\}\}/g, activeBrandName)
    : `${activeBrandName} là sàn thương mại điện tử chuyên biệt về nhà đất, đất nền dự án, biệt thự nghỉ dưỡng và căn hộ cao cấp toàn quốc.`;

  const col2Title = footerConfig?.col2Title || DEFAULT_FOOTER_CONFIG.col2Title;
  const col2Links = Array.isArray(footerConfig?.col2Links) && footerConfig.col2Links.length > 0 
    ? footerConfig.col2Links 
    : DEFAULT_FOOTER_CONFIG.col2Links;

  const col3Title = footerConfig?.col3Title || DEFAULT_FOOTER_CONFIG.col3Title;
  const col3Links = Array.isArray(footerConfig?.col3Links) && footerConfig.col3Links.length > 0 
    ? footerConfig.col3Links 
    : DEFAULT_FOOTER_CONFIG.col3Links;

  const policyLinks = Array.isArray(footerConfig?.policyLinks) && footerConfig.policyLinks.length > 0 
    ? footerConfig.policyLinks 
    : DEFAULT_FOOTER_CONFIG.policyLinks;

  const copyrightText = footerConfig?.copyrightCustomText?.trim() 
    ? footerConfig.copyrightCustomText
        .replace(/KÊNH NHÀ ĐẤT 24H/g, activeBrandName)
        .replace(/Kênh Nhà Đất 24H/g, activeBrandName)
        .replace(/Công ty Cổ phần Nhà Đất Kênh Nhà Đất 24H/g, activePlatformName)
    : `© ${new Date().getFullYear()} ${activeBrandName}. Bản quyền thuộc về ${activePlatformName}.`;

  const showSocial = footerConfig?.showSocialLinks !== false;
  const socialTitle = footerConfig?.socialLinksTitle || 'KẾT NỐI VỚI CHÚNG TÔI:';
  const showAdminLink = (footerConfig?.showAdminCmsLink !== false) && currentUser?.role === 'admin';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-8 sm:pt-9 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
          {/* Cột 1: Brand Info & Contacts */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg font-black shadow-md">
                <i className="fa-solid fa-building"></i>
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white flex items-center">
                  <span>{brandNameDisplay}</span>
                  {brandHighlightDisplay ? (
                    <span className="text-emerald-400 font-black">{brandHighlightDisplay}</span>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                  {systemConfig?.tagline || 'Sàn Giao Dịch Nhà Đất & Đăng Tin VIP'}
                </div>
              </div>
            </Link>

            {brandDesc && (
              <p className="text-xs text-slate-200 leading-relaxed max-w-sm whitespace-pre-line">
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
                      <SocialIcon item={item} className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột 2: Quick links & Khu vực nổi bật */}
          <div className="lg:col-span-2 space-y-6">
            <nav aria-label="Khám phá bất động sản">
              <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
                {col2Title}
              </h3>
              <ul className="space-y-0.5 text-xs text-slate-300">
                {col2Links.map(link => (
                  <li key={link.id || link.url}>
                    <Link to={link.url} className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Khu vực nổi bật">
              <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
                KHU VỰC NỔI BẬT
              </h3>
              <ul className="space-y-0.5 text-xs text-slate-300">
                <li>
                  <Link to="/nha-dat-ban-ha-noi" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Hà Nội
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-ho-chi-minh" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán TP. Hồ Chí Minh
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-da-nang" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Đà Nẵng
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-hai-phong" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Hải Phòng
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-can-tho" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Cần Thơ
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-quang-ninh" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Quảng Ninh
                  </Link>
                </li>
                <li>
                  <Link to="/nha-dat-ban-khanh-hoa" className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                    Nhà đất bán Khánh Hòa
                  </Link>
                </li>
                <li className="pt-1">
                  <Link to="/nha-dat-ban" className="py-1 sm:py-0.5 text-emerald-400 hover:text-emerald-300 font-semibold transition block">
                    Xem tất cả tỉnh thành &rarr;
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Cột 3: Service & Member packages (Cố định HTML theo thiết kế, không dùng icon) */}
          <nav aria-label="Dịch vụ và tiện ích" className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              DỊCH VỤ & TIỆN ÍCH
            </h3>
            <ul className="space-y-0.5 text-xs text-slate-300">
              <li>
                <Link to="/dang-tin" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Đăng tin bất động sản
                </Link>
              </li>
              <li>
                <Link to="/bang-gia-tin-dang" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Bảng giá tin đăng
                </Link>
              </li>
              <li>
                <Link to="/tinh-lai-vay" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Công cụ tính lãi vay
                </Link>
              </li>
              <li>
                <Link to="/xem-tuoi-mua-dat-xay-nha" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Xem tuổi mua đất xây nhà
                </Link>
              </li>
              <li>
                <Link to="/huong-dan-dang-tin" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Hướng dẫn đăng tin
                </Link>
              </li>
              <li>
                <Link to="/tin-da-luu" className="py-1.5 sm:py-1 hover:text-amber-400 transition block">
                  Tin bất động sản đã lưu
                </Link>
              </li>
              {showAdminLink && (
                <li className="pt-1.5">
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

          {/* Cột 4: Danh mục bất động sản (2 cột Bán & Thuê) */}
          <nav aria-label="Danh mục bất động sản" className="lg:col-span-4">
            <h3 className="text-xs font-black uppercase text-white tracking-wider mb-3">
              DANH MỤC BẤT ĐỘNG SẢN
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {FOOTER_CATEGORY_COLUMNS.map(col => (
                <ul key={col.key} className="space-y-0.5 text-xs text-slate-300">
                  {col.items.map(item => (
                    <li key={item.url}>
                      <Link to={item.url} className="py-1.5 sm:py-1 hover:text-emerald-400 transition block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-1">
                    <Link to={col.viewAllUrl} className="py-1 sm:py-0.5 text-emerald-400 hover:text-emerald-300 font-semibold transition block">
                      Xem tất cả danh mục &rarr;
                    </Link>
                  </li>
                </ul>
              ))}
            </div>
          </nav>
        </div>

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
