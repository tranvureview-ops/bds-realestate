'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles';

/**
 * KnowledgeArticleDetailPage
 * Trang chi tiết bài viết chuẩn Flat URL: /kien-thuc/[slug]
 */
export default function KnowledgeArticleDetailPage({ article }) {
  if (!article) return null;

  const category = KNOWLEDGE_CATEGORIES.find(c => c.slug === article.categorySlug);
  const relatedArticles = KNOWLEDGE_ARTICLES.filter(
    a => a.categorySlug === article.categorySlug && a.id !== article.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Navigation chuẩn Flat URL */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
              <i className="fa-solid fa-house"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            <Link to="/kien-thuc" className="hover:text-emerald-700 transition">
              Kiến thức
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            {category && (
              <>
                <Link to={category.path} className="hover:text-emerald-700 transition">
                  {category.shortName}
                </Link>
                <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
              </>
            )}
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
      </div>
    </div>
  );
}

/**
 * Format markdown to clean, semantic W3C-compliant HTML
 */
function formatArticleHtml(content) {
  if (!content) return '';

  // Helper hàm format inline elements (Bold, Italic, Link, Inline code)
  const formatInline = (text) => {
    return text
      .replace(/\$\$/g, '')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs"><img src="$2" alt="$1" class="w-full h-auto object-cover max-h-[500px]" loading="lazy" /><figcaption class="p-3 text-center text-xs sm:text-sm text-slate-600 font-medium italic border-t border-slate-100 bg-white">$1</figcaption></figure>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-700 hover:text-emerald-800 font-semibold underline decoration-emerald-300 transition-colors">$1</a>');
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

  // Tách văn bản thành từng khối block dựa trên 2 hoặc nhiều dấu xuống dòng liên tiếp
  const rawBlocks = content.split(/\n\s*\n/);
  const htmlBlocks = [];

  for (let block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 1. Heading 2 (## Title {#custom-id})
    if (/^##\s+/.test(trimmed)) {
      const match = trimmed.match(/^##\s+(.*?)(?:\s+\{#([a-zA-Z0-9\-_]+)\})?$/);
      if (match) {
        const titleText = match[1];
        const headingId = match[2] || slugify(titleText);
        htmlBlocks.push(
          `<h2 id="${headingId}" class="text-xl sm:text-2xl font-black text-slate-900 mt-9 mb-4 tracking-tight scroll-mt-24 pb-2.5 border-b border-slate-200/80 flex items-center gap-2">${formatInline(titleText)}</h2>`
        );
        continue;
      }
    }

    // 2. Heading 3 (### Title {#custom-id})
    if (/^###\s+/.test(trimmed)) {
      const match = trimmed.match(/^###\s+(.*?)(?:\s+\{#([a-zA-Z0-9\-_]+)\})?$/);
      if (match) {
        const titleText = match[1];
        const headingId = match[2] || slugify(titleText);
        htmlBlocks.push(
          `<h3 id="${headingId}" class="text-lg sm:text-xl font-black text-slate-800 mt-6 mb-3 tracking-tight scroll-mt-24">${formatInline(titleText)}</h3>`
        );
        continue;
      }
    }

    // 3. Heading 4 (#### Title)
    if (/^####\s+/.test(trimmed)) {
      const match = trimmed.match(/^####\s+(.*)$/);
      if (match) {
        htmlBlocks.push(
          `<h4 class="text-base font-bold text-slate-800 mt-5 mb-2">${formatInline(match[1])}</h4>`
        );
        continue;
      }
    }

    // 4. Blockquote (> Text)
    if (/^>\s+/.test(trimmed)) {
      const quoteLines = trimmed.split('\n').map(line => line.replace(/^>\s?/, ''));
      htmlBlocks.push(
        `<blockquote class="p-4 sm:p-5 my-5 bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-2xl text-slate-700 text-sm sm:text-base leading-relaxed italic shadow-2xs">${formatInline(quoteLines.join(' '))}</blockquote>`
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
        .replace(/\\times/g, 'x')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥')
        .replace(/\\text\{([^}]+)\}/g, '$1');
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

    // 9. Standard Paragraph (không bao bọc heading hay list)
    const formattedParagraph = formatInline(trimmed.replace(/\n/g, '<br />'));
    htmlBlocks.push(
      `<p class="text-slate-700 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">${formattedParagraph}</p>`
    );
  }

  return htmlBlocks.join('\n');
}
