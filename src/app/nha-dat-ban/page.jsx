import { permanentRedirect } from 'next/navigation';
import SaleListingsPage from '../../views/SaleListingsPage';
import { generateCategoryMetadata, getCanonicalUrl, buildSeoUrl, parseTaxonomyUrl, SITE_URL } from '../../utils/permalink';

export async function generateMetadata() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const { title, description } = generateCategoryMetadata({ demand: 'sale' }, 2026, 1);
  const canonical = getCanonicalUrl('/nha-dat-ban', 1);
  const ogImg = `${baseUrl}/mua-ban-nha-dat-toan-quoc.webp`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: ogImg,
          alt: title,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImg]
    }
  };
}

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonical = getCanonicalUrl('/nha-dat-ban', 1);
  const { title, description } = generateCategoryMetadata({ demand: 'sale' }, 2026, 1);

  // 301 Redirect nếu URL có query param ?bedroom=... sang Clean URL
  if (sp.bedroom && sp.bedroom !== 'all') {
    const extra = {};
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'bedroom' && k !== 'page' && v) extra[k] = v;
    }
    const targetUrl = buildSeoUrl({
      demand: 'sale',
      bedroom: sp.bedroom,
      extraParams: extra
    });
    permanentRedirect(targetUrl);
  }

  if (sp.page) {
    const p = parseInt(sp.page, 10);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'page' && v) params.set(k, String(v));
    }
    const qs = params.toString();
    if (p > 1 && String(p) === sp.page) {
      permanentRedirect(qs ? `/nha-dat-ban/p${p}?${qs}` : `/nha-dat-ban/p${p}`);
    } else {
      permanentRedirect(qs ? `/nha-dat-ban?${qs}` : `/nha-dat-ban`);
    }
  }

  const taxonomyInfo = parseTaxonomyUrl('/nha-dat-ban');

  // Schema 1: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mua Bán Nhà Đất',
        item: canonical
      }
    ]
  };

  // Schema 2: CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonical}#collection`,
    name: title,
    description,
    url: canonical,
    inLanguage: 'vi-VN',
    isPartOf: {
      '@type': 'WebSite',
      '@id': baseUrl,
      name: 'Kênh Nhà Đất 24H',
      url: baseUrl
    }
  };

  // Schema 3: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Người mua nhà đất lần đầu cần chuẩn bị những thủ tục pháp lý quan trọng nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Người mua nhà đất lần đầu cần thực hiện 4 bước pháp lý cốt lõi: (1) Kiểm tra bản gốc Sổ đỏ/Sổ hồng và đối chiếu căn cước công dân gắn chip của bên bán; (2) Tra cứu quy hoạch và chỉ giới đường đỏ tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện; (3) Kiểm tra tình trạng ngăn chặn tranh chấp, thi hành án tại Văn phòng Công chứng qua hệ thống UCHI; (4) Soạn thảo hợp đồng đặt cọc có điều khoản miễn trừ phạt cọc và hoàn trả 100% tiền cọc nếu tài sản bị vướng quy hoạch.'
        }
      },
      {
        '@type': 'Question',
        name: 'Chi phí thuế và lệ phí sang tên chuyển nhượng nhà đất bên nào chịu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Theo quy định của pháp luật: Bên bán chịu Thuế thu nhập cá nhân (2% trên giá trị hợp đồng chuyển nhượng); Bên mua chịu Lệ phí trước bạ (0.5% trên giá trị nhà đất) cùng phí thẩm định hồ sơ và cấp đổi phôi sổ mới (khoảng 1 - 2 triệu đồng). Tuy nhiên, các bên có thể tự thỏa thuận về nghĩa vụ nộp thuế trong văn bản hợp đồng đặt cọc.'
        }
      },
      {
        '@type': 'Question',
        name: 'Có nên vay ngân hàng mua nhà đất trong năm 2026 và tỷ lệ vay bao nhiêu là an toàn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Năm 2026, lãi suất ưu đãi cố định 12 - 24 tháng tại các ngân hàng đang duy trì ở mức hấp dẫn từ 5.5% - 7.5%/năm. Mức vay an toàn nhất theo khuyến nghị của các chuyên gia là từ 30% đến tối đa 50% giá trị tài sản. Nghĩa vụ trả nợ gốc và lãi hàng tháng không nên vượt quá 35% - 40% tổng thu nhập thực nhận của gia đình.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để tìm kiếm nhà đất chính chủ, pháp lý minh bạch trên Kênh Nhà Đất 24H?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể sử dụng bộ lọc đa năng trên Kênh Nhà Đất 24H để lọc theo: Tỉnh thành, Quận huyện, Phường xã, Mức giá, Diện tích và tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để tiếp cận trực tiếp các bất động sản đã được đội ngũ quản trị viên kiểm tra sổ đỏ và xác thực tọa độ thực tế.'
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
      <SaleListingsPage taxonomyInfo={taxonomyInfo} initialPage={1} serverSearchParams={sp} />
    </>
  );
}
