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
    const pageTitle = `${category.name} | Cẩm Nang Bất Động Sản Kênh Nhà Đất 24H`;
    return {
      title: pageTitle,
      description: category.description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: pageTitle,
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
    const pageTitle = article.seoTitle || `${article.title} | Kênh Nhà Đất 24H`;
    const pageDesc = article.seoDescription || article.excerpt;
    return {
      title: {
        absolute: pageTitle
      },
      description: pageDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: article.seoTitle || article.title,
        description: pageDesc,
        url: canonicalUrl,
        type: 'article',
        publishedTime: article.publishedAt,
        authors: [article.author],
        images: [
          {
            url: article.image || `${domain}/hero.png`,
            width: 1200,
            height: 630,
            alt: article.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: article.seoTitle || article.title,
        description: pageDesc,
        images: [article.image || `${domain}/hero.png`]
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
    return <KnowledgeArticleDetailPage article={article} />;
  }

  // 3. Nếu không khớp cả hai
  notFound();
}
