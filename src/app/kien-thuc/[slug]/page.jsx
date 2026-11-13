import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import KnowledgeHubPage from '../../../views/KnowledgeHubPage';
import KnowledgeArticleDetailPage from '../../../views/KnowledgeArticleDetailPage';
import { 
  getCategoryBySlug, 
  getArticleBySlug, 
  KNOWLEDGE_CATEGORIES, 
  KNOWLEDGE_ARTICLES 
} from '../../../data/knowledgeArticles';
import { SITE_URL } from '../../../utils/permalink';

function getLiveArticles() {
  try {
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const parsed = JSON.parse(fs.readFileSync(dbFile, 'utf-8') || '{}');
      if (Array.isArray(parsed.bds_articles) && parsed.bds_articles.length > 0) {
        return parsed.bds_articles;
      }
    }
  } catch (_) {}
  return KNOWLEDGE_ARTICLES;
}

function getLiveCategories() {
  try {
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const parsed = JSON.parse(fs.readFileSync(dbFile, 'utf-8') || '{}');
      if (Array.isArray(parsed.bds_knowledge_categories) && parsed.bds_knowledge_categories.length > 0) {
        return parsed.bds_knowledge_categories;
      }
    }
  } catch (_) {}
  return KNOWLEDGE_CATEGORIES;
}

/**
 * Tự động tạo static params cho tất cả Category slugs và Article slugs
 */
export async function generateStaticParams() {
  const categories = getLiveCategories();
  const articles = getLiveArticles();
  const categoryParams = categories.map(cat => ({ slug: cat.slug }));
  const articleParams = articles.map(art => ({ slug: art.slug }));
  return [...categoryParams, ...articleParams];
}

/**
 * Sinh dynamic SEO metadata cho từng trang (Category hoặc Article Flat URL)
 */
export async function generateMetadata({ params }) {
  const { slug } = (await params) || {};
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const categories = getLiveCategories();
  const articles = getLiveArticles();

  // 1. Kiểm tra nếu là Danh mục cha
  const category = categories.find(c => c.slug === slug) || getCategoryBySlug(slug);
  if (category) {
    const canonicalUrl = `${domain}/kien-thuc/${category.slug}`;
    const categoryTitle = category.slug === 'thi-truong'
      ? 'Thông tin thị trường bất động sản 2026 | Kênh Nhà Đất 24H'
      : (category.slug === 'kinh-nghiem'
        ? 'Kinh nghiệm mua bán nhà đất & đầu tư 2026 | Kênh Nhà Đất 24H'
        : (category.slug === 'phap-ly'
          ? 'Kiến thức pháp lý & quy hoạch bất động sản 2026 | Kênh Nhà Đất 24H'
          : `${category.name} 2026 | Kênh Nhà Đất 24H`));
    const categoryDesc = category.slug === 'thi-truong'
      ? 'Cập nhật liên tục diễn biến giá nhà đất, báo cáo nguồn cung cầu, xu hướng dòng tiền và dự báo thị trường bất động sản toàn quốc mới nhất 2026.'
      : (category.slug === 'kinh-nghiem'
        ? 'Cẩm nang kinh nghiệm mua bán nhà đất thực chiến: bí quyết thương lượng giá, cách kiểm tra thực địa, kinh nghiệm mua chung cư lần đầu và quản lý vốn đầu tư an toàn.'
        : (category.slug === 'phap-ly'
          ? 'Cẩm nang pháp lý bất động sản: quy trình làm sổ đỏ, sổ hồng, tra cứu quy hoạch đất đai trực tuyến, biểu mẫu hợp đồng đặt cọc mua bán chuẩn Luật Đất đai.'
          : category.description));

    return {
      title: {
        absolute: categoryTitle
      },
      description: categoryDesc,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: categoryTitle,
        description: categoryDesc,
        url: canonicalUrl,
        type: 'website',
        images: [{ url: `${domain}/hero.png`, width: 1200, height: 630 }]
      },
      twitter: {
        card: 'summary_large_image',
        title: categoryTitle,
        description: categoryDesc,
        images: [`${domain}/hero.png`]
      }
    };
  }

  // 2. Kiểm tra nếu là Trang bài viết Flat URL (/kien-thuc/[slug])
  const article = articles.find(a => a.slug === slug) || getArticleBySlug(slug);
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
  const categories = getLiveCategories();
  const articles = getLiveArticles();

  // 1. Kiểm tra Danh mục cha
  const category = categories.find(c => c.slug === slug) || getCategoryBySlug(slug);
  if (category) {
    const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
    const canonicalUrl = `${domain}/kien-thuc/${category.slug}`;
    const categoryArticles = articles.filter(a => a.categorySlug === category.slug);

    const categoryBreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: domain
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Kiến Thức & Cẩm Nang Bất Động Sản',
          item: `${domain}/kien-thuc`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: canonicalUrl
        }
      ]
    };

    const categoryCollectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#collection`,
      name: `${category.name} - Cẩm Nang Bất Động Sản | Kênh Nhà Đất 24H`,
      description: category.description,
      url: canonicalUrl,
      inLanguage: 'vi-VN',
      isPartOf: {
        '@type': 'WebSite',
        '@id': domain,
        name: 'Kênh Nhà Đất 24H',
        url: domain
      },
      mainEntity: {
        '@type': 'ItemList',
        name: `Danh Sách Bài Viết Thuộc Chuyên Mục ${category.name}`,
        numberOfItems: categoryArticles.length,
        itemListElement: categoryArticles.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: article.title,
          url: `${domain}/kien-thuc/${article.slug}`,
          description: article.excerpt,
          image: article.image?.startsWith('http') ? article.image : `${domain}${article.image || '/hero.png'}`
        }))
      }
    };

    const categoryFaqs = category.slug === 'thi-truong' ? [
      {
        question: 'Diễn biến thị trường bất động sản năm 2026 có những xu hướng nào nổi bật?',
        answer: 'Thị trường bất động sản năm 2026 ghi nhận sự phục hồi vững chắc với dòng vốn ưu tiên các sản phẩm đáp ứng nhu cầu ở thực (căn hộ chung cư, nhà phố có sẵn dòng tiền cho thuê) và đất nền pháp lý sổ đỏ hoàn chỉnh tại các khu vực đón đầu hạ tầng giao thông lớn.'
      },
      {
        question: 'Phân khúc bất động sản nào đang có tính thanh khoản và tỷ suất dòng tiền tốt nhất?',
        answer: 'Phân khúc căn hộ chung cư phân khúc trung cấp tại các đô thị lớn như Hà Nội, TP.HCM và Đà Nẵng đang dẫn đầu về thanh khoản và tỷ suất lợi nhuận cho thuê ổn định từ 4.5% - 6.2%/năm. Tiếp theo là nhà riêng mặt ngõ và đất nền phân lô pháp lý sạch tại các vùng ven.'
      },
      {
        question: 'Tác động của Luật Đất đai 2024 và bảng giá đất mới đến thị trường nhà đất ra sao?',
        answer: 'Luật Đất đai 2024 và việc áp dụng bảng giá đất mới sát giá thị trường giúp minh bạch hóa nghĩa vụ tài chính, bảo vệ quyền lợi người mua và thanh lọc các dự án yếu kém, thúc đẩy thị trường phát triển bền vững và giảm thiểu rủi ro đầu cơ lướt sóng.'
      },
      {
        question: 'Làm thế nào để theo dõi và cập nhật thông tin thị trường BĐS chuẩn xác nhất trên Kênh Nhà Đất 24H?',
        answer: 'Bạn có thể truy cập thường xuyên chuyên mục Thị trường trên Kênh Nhà Đất 24H để cập nhật các báo cáo biến động giá nhà đất theo từng khu vực, khảo sát nguồn cung thực tế và tham gia công cụ Dự đoán giá BĐS để nhận định mặt bằng giá mới nhất.'
      }
    ] : (category.slug === 'kinh-nghiem' ? [
      {
        question: 'Người mua nhà đất lần đầu cần lưu ý những kinh nghiệm quan trọng nào?',
        answer: 'Người mua nhà lần đầu cần chú trọng 4 yếu tố cốt lõi: (1) Kiểm tra kỹ pháp lý (sổ đỏ/sổ hồng riêng, không tranh chấp, không dính quy hoạch); (2) Khảo sát thực địa nhiều lần vào các khung giờ khác nhau (giờ cao điểm, ban đêm, khi trời mưa); (3) Định giá so sánh với ít nhất 3 bất động sản lân cận; (4) Chuẩn bị phương án tài chính vững chắc, chỉ nên vay tối đa 40% - 50% giá trị tài sản.'
      },
      {
        question: 'Làm thế nào để đàm phán, thương lượng được mức giá tốt nhất khi mua nhà đất?',
        answer: 'Để thương lượng hiệu quả, hãy tìm hiểu động cơ bán của chủ nhà (cần tiền gấp hay chỉ bán thăm dò), chỉ ra các chi phí sửa chữa hoặc nhược điểm phong thủy/hạ tầng một cách lịch sự để khấu trừ vào giá, đồng thời thể hiện thiện chí bằng việc sẵn sàng đặt cọc nhanh nếu đạt được mức giá kỳ vọng.'
      },
      {
        question: 'Kinh nghiệm vay ngân hàng mua nhà trả góp an toàn dòng tiền là gì?',
        answer: 'Áp dụng nguyên tắc vàng: số tiền trả nợ gốc và lãi hàng tháng không nên vượt quá 40% tổng thu nhập ổn định của gia đình. Luôn ưu tiên gói vay có thời gian ưu đãi lãi suất dài (1 - 3 năm), nắm rõ biên độ lãi suất thả nổi sau ưu đãi và phí phạt trả nợ trước hạn.'
      },
      {
        question: 'Có nên mua căn hộ chung cư chưa có sổ hồng và cần kiểm tra những gì?',
        answer: 'Nếu mua căn hộ chưa có sổ, bạn chỉ nên giao dịch các dự án đã được cấp phép mở bán chính thức, có bảo lãnh ngân hàng và hợp đồng mua bán trực tiếp với chủ đầu tư uy tín. Cần kiểm tra kỹ tiến độ hoàn công, nghiệm thu PCCC và giữ lại một khoản tiền (thường 5%) thanh toán khi nhận sổ chính thức.'
      }
    ] : (category.slug === 'phap-ly' ? [
      {
        question: 'Quy trình và thủ tục sang tên sổ đỏ, sổ hồng căn hộ hoặc đất thổ cư mất bao lâu?',
        answer: 'Theo quy định hiện hành, thời gian thực hiện thủ tục đăng ký biến động (sang tên sổ đỏ/sổ hồng) từ 10 - 15 ngày làm việc kể từ ngày cơ quan Đăng ký đất đai tiếp nhận đủ hồ sơ hợp lệ. Quy trình gồm 4 bước: (1) Kiểm tra pháp lý; (2) Công chứng hợp đồng mua bán; (3) Kê khai và nộp thuế TNCN (2%), lệ phí trước bạ (0.5%); (4) Nhận Giấy chứng nhận đã cập nhật biến động.'
      },
      {
        question: 'Làm thế nào để kiểm tra nhà đất có bị dính quy hoạch treo hoặc bị tranh chấp, thế chấp ngân hàng?',
        answer: 'Trước khi đặt cọc, bạn cần: (1) Kiểm tra bản chính Giấy chứng nhận (xem trang 3 và trang 4 có đóng dấu thế chấp ngân hàng không); (2) Tra cứu ứng dụng quy hoạch của Sở Quy hoạch - Kiến trúc địa phương hoặc xin trích lục quy hoạch tại Văn phòng Đăng ký đất đai; (3) Yêu cầu Văn phòng Công chứng kiểm tra trên phần mềm quản lý hồ sơ giao dịch UCHI xem tài sản có đang bị ngăn chặn giao dịch hay không.'
      },
      {
        question: 'Hợp đồng đặt cọc mua bán nhà đất viết tay có hiệu lực pháp lý không?',
        answer: 'Bộ luật Dân sự 2015 không bắt buộc hợp đồng đặt cọc phải công chứng, nên hợp đồng đặt cọc viết tay vẫn có giá trị pháp lý nếu hai bên có đầy đủ năng lực hành vi dân sự và hoàn toàn tự nguyện. Tuy nhiên, để phòng tránh rủi ro lật cọc, tranh chấp chữ ký hoặc bán một tài sản cho nhiều người, bạn nên thực hiện công chứng hợp đồng đặt cọc tại Văn phòng Công chứng hoặc lập Vi bằng thừa phát lại.'
      },
      {
        question: 'Các khoản thuế, phí và lệ phí bắt buộc phải nộp khi chuyển nhượng bất động sản gồm những gì?',
        answer: 'Giao dịch chuyển nhượng bất động sản thông thường phát sinh: (1) Thuế thu nhập cá nhân 2% tính trên giá trị chuyển nhượng (theo thỏa thuận thường do bên bán nộp); (2) Lệ phí trước bạ 0.5% (thường do bên mua nộp); (3) Phí thẩm định hồ sơ và lệ phí cấp đổi phôi sổ mới (từ 500.000đ - 1.500.000đ tùy địa phương).'
      }
    ] : [
      {
        question: `Làm thế nào để cập nhật tin tức và cẩm nang ${category.name} mới nhất?`,
        answer: `Bạn có thể theo dõi thường xuyên chuyên mục ${category.name} trên Kênh Nhà Đất 24H để cập nhật những chia sẻ kinh nghiệm thực tế, văn bản pháp luật mới nhất và kiến thức hữu ích trước khi giao dịch.`
      }
    ]));

    const categoryFaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: categoryFaqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryBreadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryCollectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryFaqSchema) }}
        />
        <KnowledgeHubPage activeCategorySlug={category.slug} />
      </>
    );
  }

  // 2. Kiểm tra Bài viết Flat URL
  const article = articles.find(a => a.slug === slug) || getArticleBySlug(slug);
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
        name: article.author || 'Ban Biên Tập Kênh Nhà Đất 24H',
        jobTitle: article.authorRole || 'Ban Biên Tập Tin Tức & Cẩm Nang BĐS',
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

    const category = categories.find(c => c.slug === article.categorySlug) || getCategoryBySlug(article.categorySlug);

    const articleBreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: domain
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Kiến Thức & Cẩm Nang Bất Động Sản',
          item: `${domain}/kien-thuc`
        },
        ...(category ? [{
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: `${domain}${category.path || `/kien-thuc/${category.slug}`}`
        }] : []),
        {
          '@type': 'ListItem',
          position: category ? 4 : 3,
          name: article.shortTitle || article.title,
          item: canonicalUrl
        }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleBreadcrumbSchema) }}
        />
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
