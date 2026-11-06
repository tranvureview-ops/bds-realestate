import React from 'react';
import { notFound } from 'next/navigation';
import KnowledgeHubPage from '../../../views/KnowledgeHubPage';
import KnowledgeArticleDetailPage from '../../../views/KnowledgeArticleDetailPage';
import { 
  getCategoryBySlug, 
  getArticleBySlug, 
  KNOWLEDGE_CATEGORIES, 
  KNOWLEDGE_ARTICLES 
} from '../../../data/knowledgeArticles';
import { SITE_URL } from '../../../utils/permalink';

/**
 * Tự động tạo static params cho tất cả Category slugs và Article slugs
 */
export async function generateStaticParams() {
  const categoryParams = KNOWLEDGE_CATEGORIES.map(cat => ({ slug: cat.slug }));
  const articleParams = KNOWLEDGE_ARTICLES.map(art => ({ slug: art.slug }));
  return [...categoryParams, ...articleParams];
}

/**
 * Sinh dynamic SEO metadata cho từng trang (Category hoặc Article Flat URL)
 */
export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

  // 1. Kiểm tra nếu là Danh mục cha
  const category = getCategoryBySlug(slug);
  if (category) {
    const canonicalUrl = `${domain}/kien-thuc/${category.slug}`;
    const cleanCategoryTitle = `${category.name} - Cẩm Nang Bất Động Sản`;
    const exactTitle = `${cleanCategoryTitle} | Kênh Nhà Đất 24H`;
    return {
      title: {
        absolute: exactTitle
      },
      description: category.description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: exactTitle,
        description: category.description,
        url: canonicalUrl,
        type: 'website',
        images: [{ url: `${domain}/hero.png`, width: 1200, height: 630 }]
      }
    };
  }

  // 2. Kiểm tra nếu là Trang bài viết Flat URL (/kien-thuc/[slug])
  const article = getArticleBySlug(slug);
  if (article) {
    const canonicalUrl = `${domain}/kien-thuc/${article.slug}`;
    // Loại bỏ hoàn toàn mọi hậu tố thương hiệu bị lặp trước đó nếu có
    const rawTitle = article.seoTitle || article.title;
    const cleanTitle = rawTitle.replace(/\s*\|\s*(Kênh Nhà Đất 24H|Sàn Nhà Đất).*$/i, '').trim();
    const exactTitle = `${cleanTitle} | Kênh Nhà Đất 24H`;
    const pageDesc = article.seoDescription || article.excerpt;

    return {
      title: {
        absolute: exactTitle
      },
      description: pageDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: exactTitle,
        description: pageDesc,
        url: canonicalUrl,
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author],
        images: [
          {
            url: article.image?.startsWith('http') ? article.image : `${domain}${article.image || '/hero.png'}`,
            width: 1200,
            height: 630,
            alt: cleanTitle
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: exactTitle,
        description: pageDesc,
        images: [article.image?.startsWith('http') ? article.image : `${domain}${article.image || '/hero.png'}`]
      }
    };
  }

  return {
    title: 'Không tìm thấy nội dung | Kênh Nhà Đất 24H'
  };
}

/**
 * Route Handler thông minh:
 * - Nếu slug trùng Category (/kien-thuc/thi-truong, /kien-thuc/kinh-nghiem, /kien-thuc/phap-ly) -> Render Category Hub
 * - Nếu slug trùng Article (/kien-thuc/gia-dat-nen-quan-9-2027, v.v.) -> Render Flat Article Detail
 */
export default async function KnowledgeDynamicPage({ params }) {
  const { slug } = (await params) || {};

  // 1. Kiểm tra Danh mục cha
  const category = getCategoryBySlug(slug);
  if (category) {
    return <KnowledgeHubPage activeCategorySlug={category.slug} />;
  }

  // 2. Kiểm tra Bài viết Flat URL
  const article = getArticleBySlug(slug);
  if (article) {
    const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
    const canonicalUrl = `${domain}/kien-thuc/${article.slug}`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${canonicalUrl}#article`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Kênh Nhà Đất 24H',
        url: domain
      },
      headline: article.h1 || article.title,
      description: article.seoDescription || article.excerpt,
      inLanguage: 'vi-VN',
      mainEntityOfPage: canonicalUrl,
      datePublished: article.publishedAt ? `${article.publishedAt}T08:00:00+07:00` : undefined,
      dateModified: `${article.publishedAt || '2026-11-06'}T08:00:00+07:00`,
      image: article.image?.startsWith('http') ? article.image : `${domain}${article.image || '/hero.png'}`,
      author: {
        '@type': 'Person',
        name: article.author || 'Nguyễn Văn Tuấn',
        jobTitle: article.authorRole || 'Chuyên Gia Tư Vấn Định Giá & Đầu Tư BĐS Dòng Tiền',
        worksFor: {
          '@type': 'Organization',
          name: 'Kênh Nhà Đất 24H'
        }
      },
      publisher: {
        '@type': 'Organization',
        name: 'Kênh Nhà Đất 24H',
        url: domain,
        logo: {
          '@type': 'ImageObject',
          url: `${domain}/hero.png`
        }
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <KnowledgeArticleDetailPage article={article} />
      </>
    );
  }

  // 3. Nếu không khớp cả hai
  notFound();
}
