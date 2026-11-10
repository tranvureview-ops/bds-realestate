import { permanentRedirect } from 'next/navigation';
import RentListingsPage from '../../views/RentListingsPage';
import { generateCategoryMetadata, getCanonicalUrl, buildSeoUrl, parseTaxonomyUrl, SITE_URL } from '../../utils/permalink';

export async function generateMetadata() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const { title, description } = generateCategoryMetadata({ demand: 'rent' }, 2026, 1);
  const canonical = getCanonicalUrl('/nha-dat-cho-thue', 1);
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
  const canonical = getCanonicalUrl('/nha-dat-cho-thue', 1);
  const { title, description } = generateCategoryMetadata({ demand: 'rent' }, 2026, 1);

  // 301 Redirect nếu URL có query param ?bedroom=... sang Clean URL
  if (sp.bedroom && sp.bedroom !== 'all') {
    const extra = {};
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'bedroom' && k !== 'page' && v) extra[k] = v;
    }
    const targetUrl = buildSeoUrl({
      demand: 'rent',
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
      permanentRedirect(qs ? `/nha-dat-cho-thue/p${p}?${qs}` : `/nha-dat-cho-thue/p${p}`);
    } else {
      permanentRedirect(qs ? `/nha-dat-cho-thue?${qs}` : `/nha-dat-cho-thue`);
    }
  }

  const taxonomyInfo = parseTaxonomyUrl('/nha-dat-cho-thue');

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
        name: 'Cho Thuê Nhà Đất',
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
        name: 'Người đi thuê nhà cần kiểm tra những giấy tờ pháp lý nào trước khi đặt cọc?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trước khi giao tiền đặt cọc thuê nhà, bạn cần yêu cầu bên cho thuê xuất trình: (1) Bản gốc hoặc bản sao y công chứng Giấy chứng nhận quyền sở hữu nhà đất (Sổ hồng / Sổ đỏ); (2) Căn cước công dân gắn chip để đối chiếu thông tin chủ nhà; (3) Nếu là người thuê lại hoặc đơn vị quản lý vận hành ủy quyền, bắt buộc phải có Hợp đồng ủy quyền quản lý cho thuê hợp pháp có công chứng từ chính chủ nhà.'
        }
      },
      {
        '@type': 'Question',
        name: 'Tiền đặt cọc thuê nhà thông thường là bao nhiêu tháng và làm sao để lấy lại cọc an toàn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Thông thường trên thị trường, mức tiền đặt cọc dao động từ 1 đến 2 tháng tiền thuê nhà đối với căn hộ chung cư và nhà riêng, hoặc từ 3 đến 6 tháng đối với mặt bằng kinh doanh, nhà mặt phố. Để đảm bảo nhận lại 100% tiền cọc khi hết hạn hợp đồng, bạn cần ghi rõ điều khoản: Bên cho thuê có trách nhiệm hoàn trả toàn bộ tiền cọc trong vòng 3 ngày làm việc sau khi hai bên ký biên bản thanh lý và bàn giao lại mặt bằng.'
        }
      },
      {
        '@type': 'Question',
        name: 'Chi phí điện, nước, internet và phí dịch vụ quản lý tòa nhà được tính như thế nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Đối với nhà riêng nguyên căn, người thuê thường thanh toán tiền điện, nước sinh hoạt trực tiếp theo biểu giá quy định của Nhà nước qua hóa đơn EVN / Công ty cấp nước. Đối với căn hộ chung cư hoặc chung cư mini, bạn cần làm rõ trong hợp đồng: Phí dịch vụ quản lý tòa nhà (ai trả), phí gửi xe máy/ô tô hàng tháng, đơn giá điện (tính theo số công tơ riêng hay giá kinh doanh) và tiền rác sinh hoạt.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để tìm được nhà cho thuê chính chủ, không qua trung gian môi giới?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể sử dụng bộ lọc tìm kiếm thông minh trên Kênh Nhà Đất 24H: Chọn khu vực (Quận/Huyện, Phường/Xã), khoảng giá thuê mong muốn, và đặc biệt tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để kết nối trực tiếp với chủ nhà, giúp tiết kiệm thời gian và chi phí thương lượng.'
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
      <RentListingsPage taxonomyInfo={taxonomyInfo} initialPage={1} serverSearchParams={sp} />
    </>
  );
}
