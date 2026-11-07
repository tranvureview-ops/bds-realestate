'use client';

import React from 'react';
import { Link } from '../router/RouterContext';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles';
import { useRealEstate } from '../context/RealEstateContext';

/**
 * KnowledgeHubPage
 * Hiển thị trang chủ Kiến thức (/kien-thuc) hoặc trang Danh mục cha (/kien-thuc/thi-truong, v.v.)
 */
export default function KnowledgeHubPage({ activeCategorySlug = null }) {
  const { articlesList, articleCategories } = useRealEstate();

  const allCategories = (articleCategories && articleCategories.length > 0) 
    ? articleCategories 
    : KNOWLEDGE_CATEGORIES;

  const allArticles = (articlesList && articlesList.length > 0)
    ? articlesList.filter(a => a.status !== 'draft')
    : KNOWLEDGE_ARTICLES;

  const activeCategory = activeCategorySlug 
    ? allCategories.find(c => c.slug === activeCategorySlug)
    : null;

  const filteredArticles = activeCategorySlug
    ? allArticles.filter(a => a.categorySlug === activeCategorySlug)
    : allArticles;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-emerald-700 transition flex items-center gap-1">
              <i className="fa-solid fa-house"></i>
              <span>Trang chủ</span>
            </Link>
            <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
            {activeCategory ? (
              <>
                <Link to="/kien-thuc" className="hover:text-emerald-700 transition">
                  Kiến thức & Cẩm nang
                </Link>
                <i className="fa-solid fa-angle-right text-[10px] text-slate-400"></i>
                <span className="text-slate-900 font-bold">{activeCategory.shortName || activeCategory.name}</span>
              </>
            ) : (
              <span className="text-slate-900 font-bold">Kiến thức & Cẩm nang BĐS</span>
            )}
          </nav>
        </div>
      </div>

      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 pt-8 pb-10 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4 shadow-2xs">
              <i className="fa-solid fa-book-open-reader text-emerald-600"></i>
              <span>CẨM NANG THỰC CHIẾN & PHÂN TÍCH CHUYÊN GIA</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {activeCategory ? activeCategory.name : 'Kiến Thức Và Cẩm Nang Bất Động Sản'}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {activeCategory 
                ? activeCategory.description 
                : 'Cập nhật diễn biến thị trường, bí quyết đầu tư thực chiến, kinh nghiệm săn tìm nhà đất và cẩm nang pháp lý, tra cứu quy hoạch giúp bạn tự tin đưa ra quyết định giao dịch an toàn và tối ưu dòng tiền.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3 DANH MỤC CHA (Category Pillars) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allCategories.map(cat => {
            const isCurrent = activeCategorySlug === cat.slug;
            return (
              <Link
                key={cat.slug}
                to={cat.path || `/kien-thuc/${cat.slug}`}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-300 shadow-sm flex items-center justify-between group hover:-translate-y-0.5 ${
                  isCurrent 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    cat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    cat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    <i className={cat.icon || 'fa-solid fa-newspaper'}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {cat.shortName || cat.name}
                    </div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform shrink-0"></i>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        {/* Article Grid - Flat URLs (/kien-thuc/[slug]) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => {
            const cat = allCategories.find(c => c.slug === article.categorySlug);
            const flatArticleUrl = `/kien-thuc/${article.slug}`;

            return (
              <article
                key={article.id}
                className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Article Image Cover */}
                <Link to={flatArticleUrl} className="relative block aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={article.image || '/hero.png'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {cat && (
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${
                      cat.color === 'blue' ? 'bg-blue-600/90 text-white border-blue-500' :
                      cat.color === 'amber' ? 'bg-amber-600/90 text-white border-amber-500' :
                      'bg-red-600/90 text-white border-red-500'
                    }`}>
                      {cat.shortName || cat.name}
                    </span>
                  )}
                </Link>

                {/* Article Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
                      <span><i className="fa-regular fa-calendar mr-1"></i>{article.publishedAt}</span>
                      <span>•</span>
                      <span><i className="fa-regular fa-clock mr-1"></i>{article.readTime || '6 phút đọc'}</span>
                    </div>

                    {/* Article Title */}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-2.5">
                      <Link to={flatArticleUrl}>
                        {article.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Read More & Author Info */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="text-xs text-slate-500 font-medium truncate max-w-[180px]">
                      <i className="fa-solid fa-user-pen mr-1 text-slate-400"></i>
                      <span>{article.author}</span>
                    </div>
                    <Link
                      to={flatArticleUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition"
                    >
                      <span>Xem chi tiết</span>
                      <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
