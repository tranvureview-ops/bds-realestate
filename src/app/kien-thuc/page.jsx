import React from 'react';
import KnowledgeHubPage from '../../views/KnowledgeHubPage';
import { SITE_URL } from '../../utils/permalink';

export const metadata = {
  title: {
    absolute: 'Kiến Thức Và Cẩm Nang Bất Động Sản Thực Chiến | Kênh Nhà Đất 24H'
  },
  description: 'Cập nhật diễn biến giá nhà đất, kinh nghiệm mua bán đầu tư thực chiến, cẩm nang pháp lý sổ đỏ, sổ hồng và tra cứu quy hoạch chuẩn xác trên Kênh Nhà Đất 24H.',
  alternates: {
    canonical: `${SITE_URL.replace(/\/+$/, '')}/kien-thuc`
  },
  openGraph: {
    title: 'Kiến Thức Và Cẩm Nang Bất Động Sản Thực Chiến | Kênh Nhà Đất 24H',
    description: 'Cập nhật diễn biến giá nhà đất, kinh nghiệm mua bán đầu tư thực chiến, cẩm nang pháp lý sổ đỏ, sổ hồng và tra cứu quy hoạch chuẩn xác.',
    url: `${SITE_URL.replace(/\/+$/, '')}/kien-thuc`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL.replace(/\/+$/, '')}/hero.png`,
        width: 1200,
        height: 630,
        alt: 'Kiến Thức Bất Động Sản - Kênh Nhà Đất 24H'
      }
    ]
  }
};

export default function KnowledgeRootPage() {
  return <KnowledgeHubPage activeCategorySlug={null} />;
}
