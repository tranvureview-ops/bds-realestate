'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles';

/**
 * KnowledgeArticleDetailPage
 * Trang chi tiết bài viết chuẩn Flat URL: /kien-thuc/[slug]
 */
export default function KnowledgeArticleDetailPage({ article }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const btn = document.getElementById('btn-copy-contract');
    if (!btn) return;

    const handleCopyContract = () => {
      const contractEl = document.getElementById('legal-contract-content');
      if (contractEl && navigator.clipboard) {
        const text = contractEl.innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalHtml = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check text-white"></i><span>Đã sao chép mẫu hợp đồng!</span>';
          btn.classList.add('bg-emerald-700');
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('bg-emerald-700');
          }, 2500);
        }).catch(() => {});
      }
    };

    btn.addEventListener('click', handleCopyContract);
    return () => {
      btn.removeEventListener('click', handleCopyContract);
    };
  }, [article]);

  if (!article) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const category = KNOWLEDGE_CATEGORIES.find(c => c.slug === article.categorySlug);
  const relatedArticles = KNOWLEDGE_ARTICLES.filter(
    a => a.categorySlug === article.categorySlug && a.id !== article.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Navigation chuẩn 4 cấp độ */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
              <i className="fa-solid fa-house"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            <Link to="/kien-thuc" className="hover:text-emerald-700 transition">
              Kiến thức & Cẩm nang
            </Link>
            {category && (
              <>
                <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
                <Link to={category.path || `/kien-thuc/${category.slug}`} className="hover:text-emerald-700 transition">
                  {category.shortName || category.name}
                </Link>
              </>
            )}
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {article.shortTitle || article.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Body (8 cols) */}
          <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
            {/* Category Tag & Meta */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {category && (
                <Link
                  to={category.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                    category.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                    category.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                    'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <i className={`${category.icon} text-[11px]`}></i>
                  <span>{category.shortName}</span>
                </Link>
              )}
              <span className="text-xs text-slate-500">
                <i className="fa-regular fa-calendar mr-1"></i>
                {article.publishedAt}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                <i className="fa-regular fa-clock mr-1"></i>
                {article.readTime}
              </span>
            </div>

            {/* Title (H1) */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-snug mb-5">
              {article.title}
            </h1>

            {/* Lead Excerpt */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-l-4 border-emerald-600 text-slate-700 text-sm sm:text-base leading-relaxed font-medium mb-6">
              {article.excerpt}
            </div>

            {/* Cover Image */}
            <div className="rounded-2xl overflow-hidden aspect-video mb-8 bg-slate-100 border border-slate-200">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Table of Contents (Mục lục bài viết) */}
            {article.tableOfContents && article.tableOfContents.length > 0 && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base mb-3">
                  <i className="fa-solid fa-list-ul text-emerald-600"></i>
                  <span>Mục lục bài viết</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {article.tableOfContents.map((toc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 transition">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <a href={`#${toc.id}`} className="font-semibold hover:underline">
                        {toc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Content Rendered */}
            <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatArticleHtml(article.content) 
                }} 
              />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <i className="fa-solid fa-tags"></i>
                  <span>Từ khóa:</span>
                </span>
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share / Copy Link Toolbar */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i className="fa-solid fa-share-nodes text-emerald-600"></i>
                <span>Chia sẻ bài viết kinh nghiệm hữu ích này:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-xs text-slate-700 font-bold transition flex items-center gap-1.5 shadow-2xs"
                  title="Sao chép liên kết bài viết"
                >
                  <i className={`fa-regular ${copied ? 'fa-circle-check text-emerald-600' : 'fa-copy text-slate-500'}`}></i>
                  <span>{copied ? 'Đã sao chép link!' : 'Sao chép liên kết'}</span>
                </button>
              </div>
            </div>

            {/* Author Bio Box */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{article.author}</div>
                <div className="text-xs text-emerald-700 font-bold mt-0.5">{article.authorRole}</div>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Chuyên viên phân tích thị trường & thẩm định pháp lý tại Kênh Nhà Đất 24H. Bài viết được kiểm duyệt thực tế trước khi xuất bản.
                </p>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Categories & Related (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* CTA Widget: Đăng tin & Tra cứu */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold border border-red-500/30 mb-3">
                <i className="fa-solid fa-bolt"></i>
                <span>GIAO DỊCH BẤT ĐỘNG SẢN 24H</span>
              </div>
              <h3 className="text-lg font-black text-white leading-snug mb-2">
                Bạn Đang Cần Mua Bán Hoặc Cho Thuê Nhà Đất?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Đăng tin miễn phí tiếp cận hàng triệu khách mua tiềm năng hoặc tìm kiếm hàng ngàn BĐS chính chủ giá tốt trên toàn quốc.
              </p>
              <div className="space-y-2.5">
                <Link
                  to="/dang-tin"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <i className="fa-solid fa-file-pen"></i>
                  <span>Đăng Tin Nhà Đất Miễn Phí</span>
                </Link>
                <Link
                  to="/nha-dat-ban"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>Tìm Mua Nhà Đất Giá Tốt</span>
                </Link>
              </div>
            </div>

            {/* Danh mục cha (Categories Box) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <i className="fa-solid fa-folder-tree text-emerald-600"></i>
                <span>Chuyên Mục Cẩm Nang</span>
              </h3>
              <div className="space-y-2">
                {KNOWLEDGE_CATEGORIES.map(cat => {
                  const isCurrent = article.categorySlug === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      to={cat.path}
                      className={`p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold transition ${
                        isCurrent 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <i className={`${cat.icon} text-xs ${isCurrent ? 'text-emerald-700' : 'text-slate-400'}`}></i>
                        <span>{cat.shortName}</span>
                      </span>
                      <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bài viết liên quan (Related Flat Articles) */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <i className="fa-solid fa-newspaper text-emerald-600"></i>
                  <span>Bài Viết Cùng Chuyên Mục</span>
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/kien-thuc/${rel.slug}`}
                      className="group block"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-1">
                        {rel.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span><i className="fa-regular fa-clock mr-1"></i>{rel.readTime}</span>
                        <span>•</span>
                        <span>{rel.publishedAt}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>

        {/* Khối Khám Phá Thị Trường Địa Phương Chân Bài Viết (Local SEO Silo Links) */}
        <ArticleLocalSeoLinks />
      </div>
    </div>
  );
}

/**
 * Component Liên Kết Chân Trang Tập Trung 3 Thị Trường Trọng Điểm: Hồ Chí Minh, Hà Nội & Đà Nẵng
 */
function ArticleLocalSeoLinks() {
  const cityGroups = [
    {
      cityName: 'TP. Hồ Chí Minh',
      badge: 'Sôi Động Nhất',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      icon: 'fa-solid fa-city',
      links: [
        { name: 'Mua Bán Nhà Đất TP.HCM', path: '/nha-dat-ban-ho-chi-minh' },
        { name: 'Bán Căn Hộ Chung Cư TP.HCM', path: '/ban-can-ho-chung-cu-ho-chi-minh' },
        { name: 'Bán Nhà Riêng TP.HCM', path: '/ban-nha-rieng-ho-chi-minh' },
        { name: 'Cho Thuê Nhà Đất TP.HCM', path: '/nha-dat-cho-thue-ho-chi-minh' }
      ]
    },
    {
      cityName: 'Thủ Đô Hà Nội',
      badge: 'Trung Tâm Miền Bắc',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'fa-solid fa-landmark',
      links: [
        { name: 'Mua Bán Nhà Đất Hà Nội', path: '/nha-dat-ban-ha-noi' },
        { name: 'Bán Căn Hộ Chung Cư Hà Nội', path: '/ban-can-ho-chung-cu-ha-noi' },
        { name: 'Bán Nhà Riêng Hà Nội', path: '/ban-nha-rieng-ha-noi' },
        { name: 'Cho Thuê Nhà Đất Hà Nội', path: '/nha-dat-cho-thue-ha-noi' }
      ]
    },
    {
      cityName: 'TP. Đà Nẵng',
      badge: 'Đô Thị Biển Đáng Sống',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'fa-solid fa-water',
      links: [
        { name: 'Mua Bán Nhà Đất Đà Nẵng', path: '/nha-dat-ban-da-nang' },
        { name: 'Bán Đất Nền Đà Nẵng', path: '/ban-dat-da-nang' },
        { name: 'Bán Căn Hộ Đà Nẵng', path: '/ban-can-ho-chung-cu-da-nang' },
        { name: 'Cho Thuê Nhà Đất Đà Nẵng', path: '/nha-dat-cho-thue-da-nang' }
      ]
    }
  ];

  return (
    <nav aria-labelledby="article-local-seo-heading" className="mt-14 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Thị trường trọng điểm</span>
          <h2 id="article-local-seo-heading" className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            Khám Phá Nhà Đất Mua Bán & Cho Thuê: Hồ Chí Minh, Hà Nội & Đà Nẵng
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Tra cứu nhanh tin đăng xác thực tại 3 trung tâm bất động sản lớn nhất
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {cityGroups.map((group, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i className={`${group.icon} text-emerald-600 text-xs`}></i>
                  <span>{group.cityName}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}>
                  {group.badge}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.path}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-400 text-xs text-slate-700 hover:text-emerald-700 font-medium transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * Render Legal Contract Document formatted as an authentic Vietnamese Contract
 */
function renderContractDocumentHtml(contractText, formatInline) {
  const lines = contractText.split('\n');
  const output = [];

  output.push('<div class="my-8 rounded-2xl border-2 border-slate-300 bg-white shadow-xl overflow-hidden print:border-none print:shadow-none">');
  
  // Header action bar
  output.push(`
  <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
    <div class="flex items-center gap-2.5">
      <span class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
        <i class="fa-solid fa-file-contract text-base"></i>
      </span>
      <div>
        <div class="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">Văn Bản Mẫu Hợp Đồng Đặt Cọc Chuẩn Thực Tế</div>
        <div class="text-[11px] text-slate-300">Căn cứ Bộ luật Dân sự 2015 &amp; Luật Đất đai 2024</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        id="btn-copy-contract"
        class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        title="Sao chép toàn bộ mẫu hợp đồng để dán vào Microsoft Word hoặc Google Docs"
      >
        <i class="fa-regular fa-copy"></i>
        <span>Sao chép mẫu hợp đồng</span>
      </button>
    </div>
  </div>
  `);

  output.push('<div id="legal-contract-content" class="p-6 sm:p-10 bg-[#fdfdfc] text-slate-800 text-xs sm:text-sm leading-relaxed border-t border-slate-200 font-sans selection:bg-amber-100">');

  let currentBlockType = null;
  let buffer = [];

  const flushBuffer = () => {
    if (currentBlockType === 'signatures') {
      output.push(`
      <div class="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p class="font-bold text-xs sm:text-sm text-slate-900 uppercase">ĐẠI DIỆN BÊN A (BÊN MUA)</p>
          <p class="text-[11px] italic text-slate-500 mt-1">(Ký, điểm chỉ và ghi rõ họ tên)</p>
          <div class="h-24 sm:h-28 flex items-end justify-center pb-2 text-xs text-slate-400 italic">....................................................</div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p class="font-bold text-xs sm:text-sm text-slate-900 uppercase">ĐẠI DIỆN BÊN B (BÊN BÁN)</p>
          <p class="text-[11px] italic text-slate-500 mt-1">(Cả hai vợ chồng cùng ký, điểm chỉ)</p>
          <div class="h-24 sm:h-28 flex items-end justify-center pb-2 text-xs text-slate-400 italic">....................................................</div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p class="font-bold text-xs sm:text-sm text-slate-900 uppercase">ĐẠI DIỆN BÊN C (LÀM CHỨNG)</p>
          <p class="text-[11px] italic text-slate-500 mt-1">(Ký, ghi rõ họ tên / Môi giới)</p>
          <div class="h-24 sm:h-28 flex items-end justify-center pb-2 text-xs text-slate-400 italic">....................................................</div>
        </div>
      </div>
      `);
      buffer = [];
      return;
    }

    if (buffer.length === 0) return;
    const text = buffer.join('\n').trim();
    if (!text) { buffer = []; return; }

    if (currentBlockType === 'header') {
      const headerLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const mottoDate = headerLines.filter(l => l.includes('ngày') || l.includes('Hôm nay')).join(' ') || 'Hôm nay, ngày ...... tháng ...... năm 2026';
      output.push(`
      <div class="text-center mb-6 pb-4 border-b border-slate-200/80">
        <p class="font-bold text-sm sm:text-base tracking-wider uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p class="font-bold text-xs sm:text-sm text-slate-800 mt-1">Độc lập – Tự do – Hạnh phúc</p>
        <div class="w-28 sm:w-36 h-[1.5px] bg-slate-800 mx-auto my-2.5"></div>
        <p class="text-xs italic text-slate-600 mt-2">${formatInline(mottoDate)}</p>
      </div>
      `);
    } else if (currentBlockType === 'title') {
      const titleLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      output.push(`
      <div class="text-center my-6">
        <h3 class="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">${formatInline(titleLines[0] || 'HỢP ĐỒNG ĐẶT CỌC MUA BÁN NHÀ ĐẤT')}</h3>
        ${titleLines.slice(1).map(l => `<p class="text-xs sm:text-sm italic text-slate-600 mt-1">${formatInline(l)}</p>`).join('')}
      </div>
      `);
    } else if (currentBlockType === 'basis') {
      const basisLines = text.split('\n').filter(Boolean);
      let basisHtml = '<div class="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-600 italic space-y-1">';
      basisLines.forEach(l => {
        basisHtml += `<p>${formatInline(l)}</p>`;
      });
      basisHtml += '</div>';
      output.push(basisHtml);
    } else if (currentBlockType === 'party') {
      output.push(`
      <div class="my-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
        ${text.split('\n').map(l => `<p class="py-0.5">${formatInline(l)}</p>`).join('')}
      </div>
      `);
    } else if (currentBlockType === 'article') {
      const artLines = text.split('\n');
      const heading = artLines[0];
      const rest = artLines.slice(1).join('\n');
      output.push(`
      <div class="my-5 pb-3 border-b border-slate-200/60">
        <h4 class="font-bold text-sm sm:text-base text-slate-900 mb-2 uppercase flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
          <span>${formatInline(heading)}</span>
        </h4>
        <div class="text-slate-700 space-y-1.5 pl-3 border-l-2 border-emerald-500/30">
          ${rest.split('\n').map(l => l.trim() ? `<p class="py-0.5">${formatInline(l)}</p>` : '').join('')}
        </div>
      </div>
      `);
    } else {
      output.push(`
      <div class="my-3 text-slate-700">
        ${text.split('\n').map(l => l.trim() ? `<p class="py-0.5">${formatInline(l)}</p>` : '').join('')}
      </div>
      `);
    }
    buffer = [];
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[HEADER]')) {
      flushBuffer();
      currentBlockType = 'header';
      continue;
    }
    if (trimmed.startsWith('[TITLE]')) {
      flushBuffer();
      currentBlockType = 'title';
      continue;
    }
    if (trimmed.startsWith('[BASIS]')) {
      flushBuffer();
      currentBlockType = 'basis';
      continue;
    }
    if (trimmed.startsWith('[PARTY]')) {
      flushBuffer();
      currentBlockType = 'party';
      continue;
    }
    if (trimmed.startsWith('[ARTICLE]')) {
      flushBuffer();
      currentBlockType = 'article';
      continue;
    }
    if (trimmed.startsWith('[SIGNATURES]')) {
      flushBuffer();
      currentBlockType = 'signatures';
      continue;
    }
    buffer.push(line);
  }
  flushBuffer();

  output.push('</div>'); // End legal-contract-content

  // Legal tips footer box
  output.push(`
  <div class="bg-amber-50/80 border-t border-amber-200/80 p-4 sm:p-5 text-xs text-amber-900 flex items-start gap-3">
    <i class="fa-solid fa-circle-exclamation text-amber-600 text-base mt-0.5 shrink-0"></i>
    <div class="space-y-1">
      <p class="font-bold text-xs sm:text-sm text-amber-950">Lưu ý nghiệp vụ khi lập hợp đồng cọc thực tế:</p>
      <ul class="text-slate-700 space-y-1 list-disc list-inside mt-1 leading-relaxed">
        <li>Luôn yêu cầu bên bán xuất trình <strong>bản gốc Sổ hồng / Sổ đỏ</strong> và CCCD gắn chip gốc để kiểm tra, đối chiếu trực tiếp trước khi giao tiền.</li>
        <li>Nếu tài sản là tài sản chung vợ chồng trong thời kỳ hôn nhân, bắt buộc <strong>cả hai vợ chồng</strong> cùng ký và điểm chỉ vào hợp đồng đặt cọc.</li>
        <li>Chuyển tiền qua tài khoản ngân hàng chính chủ của người bán với cú pháp ghi rõ: <em>"Thanh toán tiền đặt cọc mua nhà đất theo Hợp đồng ngày dd/mm/yyyy"</em> hoặc lập biên bản giao nhận tiền mặt có chữ ký của bên làm chứng.</li>
      </ul>
    </div>
  </div>
  `);

  output.push('</div>'); // End wrapper
  return output.join('\n');
}

/**
 * Render Financial / Math Formula Card
 */
function renderFormulaCardHtml(rawText, formatInline) {
  const lines = rawText.split('\n');
  let title = 'Công thức tính toán tài chính bất động sản';
  let left = '';
  let numerator = '';
  let denominator = '';
  let multiplier = '';
  let simpleFormula = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[TITLE]')) {
      title = trimmed.replace('[TITLE]', '').trim();
    } else if (trimmed.startsWith('[LEFT]')) {
      left = trimmed.replace('[LEFT]', '').trim();
    } else if (trimmed.startsWith('[NUMERATOR]')) {
      numerator = trimmed.replace('[NUMERATOR]', '').trim();
    } else if (trimmed.startsWith('[DENOMINATOR]')) {
      denominator = trimmed.replace('[DENOMINATOR]', '').trim();
    } else if (trimmed.startsWith('[MULTIPLIER]')) {
      multiplier = trimmed.replace('[MULTIPLIER]', '').trim();
    } else if (trimmed) {
      if (!simpleFormula) simpleFormula = trimmed;
    }
  }

  if (numerator && denominator) {
    return `
    <div class="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white shadow-lg overflow-x-auto">
      <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-slate-700/80 pb-2.5">
        <span class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs">
          <i class="fa-solid fa-calculator"></i>
        </span>
        <span>${formatInline(title)}</span>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base font-semibold py-2">
        ${left ? `<span class="text-amber-300 font-bold text-sm sm:text-lg whitespace-nowrap">${formatInline(left)}</span>` : ''}
        <span class="text-slate-400 text-xl font-bold">=</span>
        <div class="inline-flex flex-col items-center mx-1">
          <span class="px-3 py-1 border-b-2 border-amber-400 text-center text-slate-100 font-medium text-xs sm:text-sm whitespace-nowrap">
            ${formatInline(numerator)}
          </span>
          <span class="px-3 py-1 text-center text-emerald-400 font-bold text-xs sm:text-sm whitespace-nowrap">
            ${formatInline(denominator)}
          </span>
        </div>
        ${multiplier ? `<span class="text-amber-300 font-bold text-base sm:text-lg whitespace-nowrap">${formatInline(multiplier)}</span>` : ''}
      </div>
    </div>
    `;
  }

  return `
  <div class="my-6 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-700 text-center text-amber-300 font-mono text-sm sm:text-base shadow-md">
    ${formatInline(simpleFormula || rawText)}
  </div>
  `;
}

/**
 * Format markdown to clean, semantic W3C-compliant HTML
 */
function formatArticleHtml(content) {
  if (!content) return '';

  // Helper hàm format inline elements (Bold, Italic, Link, Inline code)
  const formatInline = (text) => {
    return text
      .replace(/\$/g, '')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs"><img src="$2" alt="$1" class="w-full h-auto object-cover max-h-[500px]" loading="lazy" /><figcaption class="p-3 text-center text-xs sm:text-sm text-slate-600 font-medium italic border-t border-slate-100 bg-white">$1</figcaption></figure>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
        const isExternal = url.startsWith('http://') || url.startsWith('https://');
        if (isExternal && !url.includes('kenhnhadat24h.com.vn') && !url.includes('localhost')) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:text-emerald-800 font-semibold underline decoration-emerald-300 transition-colors inline-flex items-center gap-1">${label}<i class="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-70"></i></a>`;
        }
        return `<a href="${url}" class="text-emerald-700 hover:text-emerald-800 font-semibold underline decoration-emerald-300 transition-colors">${label}</a>`;
      });
  };

  // Helper slugify id cho heading nếu chưa có explicit id
  const slugify = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // 0. Pre-process contract code blocks :::contract ... ::: or ```contract ... ```
  const contractBlocks = [];
  let processedContent = content
    .replace(/:::contract([\s\S]*?):::/g, (match, inner) => {
      const idx = contractBlocks.length;
      contractBlocks.push(renderContractDocumentHtml(inner.trim(), formatInline));
      return `__CONTRACT_BLOCK_${idx}__`;
    })
    .replace(/```contract([\s\S]*?)```/g, (match, inner) => {
      const idx = contractBlocks.length;
      contractBlocks.push(renderContractDocumentHtml(inner.trim(), formatInline));
      return `__CONTRACT_BLOCK_${idx}__`;
    });

  // 0b. Pre-process formula code blocks :::formula ... :::
  const formulaBlocks = [];
  processedContent = processedContent
    .replace(/:::formula([\s\S]*?):::/g, (match, inner) => {
      const idx = formulaBlocks.length;
      formulaBlocks.push(renderFormulaCardHtml(inner.trim(), formatInline));
      return `__FORMULA_BLOCK_${idx}__`;
    });

  // Tách văn bản thành từng khối block dựa trên 2 hoặc nhiều dấu xuống dòng liên tiếp
  const rawBlocks = processedContent.split(/\n\s*\n/);
  const htmlBlocks = [];

  for (let block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 0. Check Legal Contract Block Placeholder
    const contractPlaceholderMatch = trimmed.match(/^__CONTRACT_BLOCK_(\d+)__$/);
    if (contractPlaceholderMatch) {
      const idx = parseInt(contractPlaceholderMatch[1], 10);
      if (contractBlocks[idx]) {
        htmlBlocks.push(contractBlocks[idx]);
        continue;
      }
    }

    // 0b. Check Financial Formula Block Placeholder
    const formulaPlaceholderMatch = trimmed.match(/^__FORMULA_BLOCK_(\d+)__$/);
    if (formulaPlaceholderMatch) {
      const idx = parseInt(formulaPlaceholderMatch[1], 10);
      if (formulaBlocks[idx]) {
        htmlBlocks.push(formulaBlocks[idx]);
        continue;
      }
    }

    // 1. Heading 2 (## Title {#custom-id})
    if (/^##\s+/.test(trimmed)) {
      const lines = trimmed.split('\n');
      const headingLine = lines[0].trim();
      const match = headingLine.match(/^##\s+(.*?)(?:\s+\{#([a-zA-Z0-9\-_]+)\})?$/);
      if (match) {
        const titleText = match[1];
        const headingId = match[2] || slugify(titleText);
        htmlBlocks.push(
          `<h2 id="${headingId}" class="text-xl sm:text-2xl font-black text-slate-900 mt-9 mb-4 tracking-tight scroll-mt-24 pb-2.5 border-b border-slate-200/80 flex items-center gap-2">${formatInline(titleText)}</h2>`
        );
        const remaining = lines.slice(1).join('\n').trim();
        if (remaining) {
          htmlBlocks.push(
            `<p class="text-slate-700 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">${formatInline(remaining).replace(/\n/g, '<br />')}</p>`
          );
        }
        continue;
      }
    }

    // 2. Heading 3 (### Title {#custom-id})
    if (/^###\s+/.test(trimmed)) {
      const lines = trimmed.split('\n');
      const headingLine = lines[0].trim();
      const match = headingLine.match(/^###\s+(.*?)(?:\s+\{#([a-zA-Z0-9\-_]+)\})?$/);
      if (match) {
        const titleText = match[1];
        const headingId = match[2] || slugify(titleText);
        htmlBlocks.push(
          `<h3 id="${headingId}" class="text-lg sm:text-xl font-black text-slate-800 mt-6 mb-3 tracking-tight scroll-mt-24">${formatInline(titleText)}</h3>`
        );
        const remaining = lines.slice(1).join('\n').trim();
        if (remaining) {
          htmlBlocks.push(
            `<p class="text-slate-700 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">${formatInline(remaining).replace(/\n/g, '<br />')}</p>`
          );
        }
        continue;
      }
    }

    // 3. Heading 4 (#### Title)
    if (/^####\s+/.test(trimmed)) {
      const lines = trimmed.split('\n');
      const headingLine = lines[0].trim();
      const match = headingLine.match(/^####\s+(.*)$/);
      if (match) {
        htmlBlocks.push(
          `<h4 class="text-base font-bold text-slate-800 mt-5 mb-2">${formatInline(match[1])}</h4>`
        );
        const remaining = lines.slice(1).join('\n').trim();
        if (remaining) {
          htmlBlocks.push(
            `<p class="text-slate-700 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">${formatInline(remaining).replace(/\n/g, '<br />')}</p>`
          );
        }
        continue;
      }
    }

    // 4. Blockquote (> Text)
    if (/^>\s+/.test(trimmed)) {
      const quoteLines = trimmed.split('\n').map(line => line.replace(/^>\s?/, ''));
      htmlBlocks.push(
        `<blockquote class="p-4 sm:p-5 my-5 bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-2xl text-slate-700 text-sm sm:text-base leading-relaxed italic shadow-2xs">${quoteLines.map(l => formatInline(l)).join('<br />')}</blockquote>`
      );
      continue;
    }

    // 4b. Standalone Image (![alt](src))
    if (/^!\[(.*?)\]\((.*?)\)\s*$/.test(trimmed)) {
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
      if (match) {
        const alt = match[1];
        const src = match[2];
        htmlBlocks.push(
          `<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
            <img src="${src}" alt="${alt}" class="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
            ${alt ? `<figcaption class="p-3 text-center text-xs sm:text-sm text-slate-600 font-medium italic border-t border-slate-100 bg-white">${alt}</figcaption>` : ''}
          </figure>`
        );
        continue;
      }
    }

    // 5. Math / Formula block ($$ ... $$)
    if (/^\$\$[\s\S]*\$\$$/.test(trimmed)) {
      let formula = trimmed.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
      formula = formula
        .replace(/[\t\f\r]/g, ' ')
        .replace(/\\times/g, 'x')
        .replace(/times/g, 'x')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/ext\{([^}]+)\}/g, '$1')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)')
        .replace(/rac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)');
      htmlBlocks.push(
        `<div class="my-5 p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-center text-sm sm:text-base border border-slate-800 overflow-x-auto shadow-md"><strong>${formatInline(formula)}</strong></div>`
      );
      continue;
    }

    // 6. Markdown Table
    if (trimmed.includes('|') && trimmed.includes('---')) {
      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      let tableHtml = '<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">';
      let isThead = true;
      let hasClosedThead = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('---')) {
          isThead = false;
          continue;
        }
        const cells = line.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
        if (isThead && i === 0) {
          tableHtml += '<thead class="bg-slate-100 text-slate-900 font-bold border-b border-slate-200"><tr>';
          cells.forEach(c => {
            tableHtml += `<th class="px-4 py-3 text-left border border-slate-200 font-bold">${formatInline(c.trim())}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          hasClosedThead = true;
        } else {
          tableHtml += '<tr class="hover:bg-slate-50 transition border-b border-slate-100">';
          cells.forEach(c => {
            tableHtml += `<td class="px-4 py-3 border border-slate-200 text-slate-700">${formatInline(c.trim())}</td>`;
          });
          tableHtml += '</tr>';
        }
      }
      if (hasClosedThead) tableHtml += '</tbody>';
      tableHtml += '</table></div>';
      htmlBlocks.push(tableHtml);
      continue;
    }

    // 7. Unordered List (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const items = trimmed.split('\n').filter(Boolean);
      let listHtml = '<ul class="space-y-2 my-4 list-disc list-outside pl-5 text-slate-700 text-sm sm:text-base leading-relaxed">';
      for (let item of items) {
        const clean = item.replace(/^[-*]\s+/, '');
        listHtml += `<li>${formatInline(clean)}</li>`;
      }
      listHtml += '</ul>';
      htmlBlocks.push(listHtml);
      continue;
    }

    // 8. Ordered List (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split('\n').filter(Boolean);
      let listHtml = '<ol class="space-y-2.5 my-4 list-decimal list-outside pl-5 text-slate-700 text-sm sm:text-base leading-relaxed">';
      for (let item of items) {
        const clean = item.replace(/^\d+\.\s+/, '');
        listHtml += `<li>${formatInline(clean)}</li>`;
      }
      listHtml += '</ol>';
      htmlBlocks.push(listHtml);
      continue;
    }

    // 9. Bỏ qua các ký hiệu phân cách rác như '---', '***', '___' (xóa hoàn toàn thẻ <p>---</p>)
    if (/^[-*_]{3,}$/.test(trimmed)) {
      continue;
    }

    // 10. Standard Paragraph (không bao bọc heading hay list)
    const formattedParagraph = formatInline(trimmed.replace(/\n/g, '<br />'));
    if (!formattedParagraph || formattedParagraph === '---') {
      continue;
    }
    htmlBlocks.push(
      `<p class="text-slate-700 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">${formattedParagraph}</p>`
    );
  }

  return htmlBlocks.join('\n');
}
