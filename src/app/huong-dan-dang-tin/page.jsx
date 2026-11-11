import React from 'react';
import GuidePostListingPage from '../../views/GuidePostListingPage';
import { SITE_URL } from '../../utils/permalink';

export const metadata = {
  title: {
    absolute: 'Hướng dẫn đăng tin bất động sản chuẩn SEO & nhanh chóng | Kênh Nhà Đất 24H'
  },
  description: 'Cẩm nang hướng dẫn đăng tin bán nhà, cho thuê căn hộ, đất nền chuẩn SEO tại Kênh Nhà Đất 24H. Quy trình 4 bước từ địa giới GIS, tiêu đề vàng, ảnh thật, gói VIP đến đẩy tin giờ vàng.',
  keywords: [
    'hướng dẫn đăng tin',
    'cách đăng tin bán nhà',
    'đăng tin bất động sản hiệu quả',
    'kinh nghiệm đăng tin nhà đất',
    'công thức đặt tiêu đề bán nhà',
    'gói tin vip kênh nhà đất 24h',
    'đăng tin cho thuê nhà đất'
  ],
  alternates: {
    canonical: `${SITE_URL.replace(/\/+$/, '')}/huong-dan-dang-tin`
  },
  openGraph: {
    title: 'Hướng dẫn đăng tin bất động sản chuẩn SEO & nhanh chóng | Kênh Nhà Đất 24H',
    description: 'Quy trình 4 bước đăng tin bán và cho thuê nhà đất đạt chuẩn kiểm duyệt, lên Top Google và tiếp cận 1.000.000+ khách hàng tiềm năng mỗi tháng.',
    url: `${SITE_URL.replace(/\/+$/, '')}/huong-dan-dang-tin`,
    type: 'article',
    images: [
      {
        url: `${SITE_URL.replace(/\/+$/, '')}/hero.png`,
        width: 1200,
        height: 630,
        alt: 'Hướng dẫn đăng tin BĐS - Kênh Nhà Đất 24H'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hướng dẫn đăng tin bất động sản chuẩn SEO & nhanh chóng | Kênh Nhà Đất 24H',
    description: 'Quy trình 4 bước đăng tin bán và cho thuê nhà đất đạt chuẩn kiểm duyệt, lên Top Google và tiếp cận 1.000.000+ khách hàng tiềm năng mỗi tháng.',
    images: [`${SITE_URL.replace(/\/+$/, '')}/hero.png`]
  }
};

export default function Page() {
  const siteUrlNorm = SITE_URL.replace(/\/+$/, '');
  const canonicalUrl = `${siteUrlNorm}/huong-dan-dang-tin`;

  // Schema.org HowTo & FAQPage JSON-LD
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Hướng dẫn 4 bước đăng tin bất động sản chuẩn SEO trên Kênh Nhà Đất 24H',
    description: 'Quy trình chi tiết 4 bước đăng tin bán nhà, cho thuê bất động sản tiếp cận triệu khách hàng tiềm năng.',
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'VND',
      value: '0'
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Phân loại nhu cầu & chọn địa giới hành chính GIS',
        text: 'Lựa chọn hình thức Bán hoặc Cho thuê, loại hình BĐS và địa chỉ hành chính 3 cấp (Tỉnh/Thành, Quận/Huyện, Phường/Xã) kèm ghim tọa độ GPS trên bản đồ vệ tinh.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Soạn tiêu đề chuẩn SEO & nhập thông số chi tiết',
        text: 'Đặt tiêu đề từ 30 - 99 ký tự theo công thức vàng kết hợp loại hình, vị trí và giá bán. Viết mô tả chi tiết tối thiểu 50 từ và điền đầy đủ các thông số diện tích, số phòng, pháp lý, hướng phong thủy.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Đăng tải hình ảnh thực tế & nhúng VR 360° / Video',
        text: 'Tải tối thiểu 6 - 12 hình ảnh chụp ban ngày rõ nét mặt tiền, phòng khách, phòng ngủ, bếp và sơ đồ sổ đỏ. Nhúng link video hoặc Tour thực tế ảo VR 360°.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Lựa chọn cấp độ VIP & cài đặt lịch đẩy tin giờ vàng',
        text: 'Chọn gói VIP Kim Cương, Vàng, Bạc hoặc Tin Thường tùy nhu cầu thanh khoản. Cài đặt lịch đẩy tin tự động theo 4 khung giờ vàng (08:00, 11:30, 14:00, 19:30) và hoàn tất đăng tin.'
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Đăng tin bất động sản trên Kênh Nhà Đất 24H có mất phí không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kênh Nhà Đất 24H luôn có chính sách hỗ trợ tin đăng cơ bản miễn phí dành cho mọi chính chủ và khách hàng cá nhân. Ngoài ra, sàn cung cấp các gói VIP và lịch đẩy tin tự động theo khung giờ vàng để tăng tốc thanh khoản.'
        }
      },
      {
        '@type': 'Question',
        name: 'Sau khi hoàn tất đăng tin thì bao lâu tin sẽ được duyệt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hệ thống áp dụng công nghệ kiểm duyệt AI thông minh kết hợp đội ngũ điều hành 24/7. Tin đăng hợp lệ thường được duyệt tự động chỉ sau 3 - 5 phút. Tin VIP Kim Cương được duyệt tức thì.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để tin đăng lên Top Google và tiếp cận nhiều khách nhất?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Viết tiêu đề dài 30 - 99 ký tự chứa từ khóa địa điểm + giá bán; mô tả chi tiết trên 100 từ; tải từ 6 - 8 ảnh chụp sắc nét ban ngày; đính kèm video hoặc Tour VR 360° và ưu tiên chọn gói VIP Vàng hoặc Kim Cương.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <GuidePostListingPage />
    </>
  );
}
