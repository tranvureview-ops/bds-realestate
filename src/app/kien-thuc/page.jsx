import React from 'react';
import KnowledgeHubPage from '../../views/KnowledgeHubPage';
import { SITE_URL } from '../../utils/permalink';
import { KNOWLEDGE_ARTICLES } from '../../data/knowledgeArticles';

const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: {
    absolute: 'Kiến thức & cẩm nang bất động sản thực chiến 2026 | Kênh Nhà Đất 24H'
  },
  description: 'Tổng hợp kiến thức bất động sản thực chiến 2026: phân tích biến động giá thị trường, kinh nghiệm mua bán đầu tư, thủ tục pháp lý sổ đỏ sổ hồng và tra cứu quy hoạch chuẩn 100%.',
  alternates: {
    canonical: `${domain}/kien-thuc`
  },
  openGraph: {
    title: 'Kiến thức & cẩm nang bất động sản thực chiến 2026 | Kênh Nhà Đất 24H',
    description: 'Tổng hợp kiến thức bất động sản thực chiến 2026: phân tích biến động giá thị trường, kinh nghiệm mua bán đầu tư, thủ tục pháp lý sổ đỏ sổ hồng và tra cứu quy hoạch chuẩn 100%.',
    url: `${domain}/kien-thuc`,
    type: 'website',
    images: [
      {
        url: `${domain}/hero.png`,
        width: 1200,
        height: 630,
        alt: 'Kiến thức và cẩm nang bất động sản - Kênh Nhà Đất 24H'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiến thức & cẩm nang bất động sản thực chiến 2026 | Kênh Nhà Đất 24H',
    description: 'Tổng hợp kiến thức bất động sản thực chiến 2026: phân tích giá cả, kinh nghiệm đầu tư, pháp lý sổ đỏ và tra cứu quy hoạch.',
    images: [`${domain}/hero.png`]
  }
};

export default function KnowledgeRootPage() {
  const breadcrumbSchema = {
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
        name: 'Kiến thức & cẩm nang bất động sản',
        item: `${domain}/kien-thuc`
      }
    ]
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${domain}/kien-thuc#collection`,
    name: 'Kiến thức và cẩm nang bất động sản thực chiến 2026 | Kênh Nhà Đất 24H',
    description: 'Tổng hợp kiến thức bất động sản thực chiến 2026: phân tích biến động giá thị trường, kinh nghiệm mua bán đầu tư, thủ tục pháp lý sổ đỏ sổ hồng và tra cứu quy hoạch chuẩn 100%.',
    url: `${domain}/kien-thuc`,
    inLanguage: 'vi-VN',
    isPartOf: {
      '@type': 'WebSite',
      '@id': domain,
      name: 'Kênh Nhà Đất 24H',
      url: domain
    },
    about: {
      '@type': 'Thing',
      name: 'Kiến thức Bất động sản Việt Nam'
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Danh Sách Bài Viết Cẩm Nang Bất Động Sản Mới Nhất',
      numberOfItems: KNOWLEDGE_ARTICLES.length,
      itemListElement: KNOWLEDGE_ARTICLES.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${domain}/kien-thuc/${article.slug}`,
        description: article.excerpt,
        image: article.image?.startsWith('http') ? article.image : `${domain}${article.image || '/hero.png'}`
      }))
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Làm thế nào để tra cứu thông tin quy hoạch đất đai trực tuyến chính xác nhất?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể tra cứu trực tuyến qua các ứng dụng quy hoạch chính thống của Sở Xây dựng và Sở Tài nguyên Môi trường từng tỉnh thành, hoặc nộp Phiếu yêu cầu cung cấp dữ liệu đất đai tại Văn phòng Đăng ký Đất đai để nhận thông tin pháp lý chính xác 100%.'
        }
      },
      {
        '@type': 'Question',
        name: 'Quy trình sang tên đổi chủ sổ hồng, sổ đỏ gồm các bước nào theo Luật Đất đai mới?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quy trình chuẩn gồm 4 bước: (1) Đặt cọc và kiểm tra hồ sơ thực địa; (2) Công chứng hợp đồng mua bán chuyển nhượng; (3) Kê khai thuế thu nhập cá nhân (2%) và lệ phí trước bạ (0.5%); (4) Nộp hồ sơ đăng ký biến động tại Văn phòng Đăng ký Đất đai để sang tên sổ mới.'
        }
      },
      {
        '@type': 'Question',
        name: 'Bí quyết thương lượng giá mua bán bất động sản thực chiến giúp tiết kiệm chi phí?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Khảo sát mặt bằng giá của 3-5 sản phẩm tương đồng trong khu vực, nắm rõ lý do bán của chủ sở hữu, chỉ ra các nhược điểm thực tế có thể thương lượng và chuẩn bị sẵn tài chính để sẵn sàng đặt cọc nhanh.'
        }
      },
      {
        '@type': 'Question',
        name: 'Cẩm nang và kinh nghiệm trên Kênh Nhà Đất 24H được tổng hợp từ nguồn nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Các bài viết, cẩm nang và bài học đầu tư trên Kênh Nhà Đất 24H được ban biên tập tổng hợp, chọn lọc từ các nguồn thông tin thị trường chính thống, văn bản pháp lý đất đai hiện hành và kinh nghiệm giao dịch thực tế từ các nhà đầu tư và người mua nhà.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <KnowledgeHubPage activeCategorySlug={null} />
    </>
  );
}
