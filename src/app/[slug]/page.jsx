import { notFound, permanentRedirect } from 'next/navigation';
import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, getPropertyPermalink, generateCategoryMetadata, SITE_URL, formatSentenceCase } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { fetchServerProperties, findProperty } from '../../services/propertyService';

export function buildPropertyMetadata(matchedProperty) {
  const canonicalPermalink = getPropertyPermalink(matchedProperty);
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalFullUrl = `${domain}${canonicalPermalink}`;
  const formattedTitle = formatSentenceCase(matchedProperty.title);
  const desc = matchedProperty.description?.slice(0, 160) || formattedTitle;
  const primaryImg = matchedProperty.images?.[0] || `${domain}/hero.png`;

  return {
    title: formattedTitle,
    description: desc,
    alternates: { canonical: canonicalFullUrl },
    openGraph: {
      title: formattedTitle,
      description: desc,
      url: canonicalFullUrl,
      type: 'article',
      images: [
        {
          url: primaryImg,
          alt: formattedTitle,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: desc,
      images: [primaryImg]
    }
  };
}

export function buildTaxonomyMetadata(taxonomyInfo) {
  const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const canonicalUrl = taxonomyInfo.canonicalUrl?.startsWith('http')
    ? taxonomyInfo.canonicalUrl
    : `${domain}${taxonomyInfo.canonicalPath || taxonomyInfo.canonicalUrl || ''}`;
  const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, taxonomyInfo.page || 1);
  const ogImg = `${domain}/mua-ban-nha-dat-toan-quoc.webp`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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

export async function generateMetadata({ params, searchParams }) {
  const { slug } = (await params) || {};
  const sp = (await searchParams) || {};
  const currentPath = `/${slug || ''}`;

  const parsedPropertyUrl = parsePropertyUrl(currentPath);
  if (parsedPropertyUrl.isProperty) {
    const serverProps = await fetchServerProperties();
    const matched = findProperty(serverProps, parsedPropertyUrl, currentPath) ||
      findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);
    if (matched) return buildPropertyMetadata(matched);
  }

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    const meta = buildTaxonomyMetadata(taxonomyInfo);
    if (sp.loai) {
      // For multi-category pages, prevent indexing and ensure canonical without query
      meta.robots = { index: false, follow: false };
    }
    return meta;
  }

  return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
}

export function renderTaxonomyPage(taxonomyInfo, page = 1, searchParams = {}) {
  return taxonomyInfo.demand === 'rent'
    ? <RentListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} serverSearchParams={searchParams} />
    : <SaleListingsPage taxonomyInfo={taxonomyInfo} initialPage={page} serverSearchParams={searchParams} />;
}

export default async function Page({ params, searchParams }) {
  const { slug } = (await params) || {};
  const sp = (await searchParams) || {};

  // Chuyển hướng 301 chuẩn SEO cho các alias hoặc lỗi chính tả cũ (như biethu -> biet-thu)
  if (slug && slug.includes('biethu')) {
    const cleanSlug = slug.replace(/biethu/g, 'biet-thu');
    const queryParams = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v) queryParams.set(k, String(v));
    }
    const qs = queryParams.toString();
    permanentRedirect(qs ? `/${cleanSlug}/?${qs}` : `/${cleanSlug}/`);
  }

  const currentPath = `/${slug || ''}`;

  // 1. Ưu tiên tuyệt đối cho trang chi tiết bài đăng đơn lẻ (Single Property: /{slug}-pr{id})
  const parsed = parsePropertyUrl(currentPath);
  if (parsed.isProperty) {
    const serverProps = await fetchServerProperties();
    const prop = findProperty(serverProps, parsed, currentPath) || findProperty(INITIAL_PROPERTIES, parsed, currentPath);
    if (!prop) notFound();

    const canonical = getPropertyPermalink(prop);
    if (currentPath !== canonical) permanentRedirect(canonical);

    return <PropertyDetailPage initialProperty={prop} slug={slug} currentPath={currentPath} />;
  }

  // 2. Xử lý trang Danh mục / Taxonomy (Nhà đất bán, cho thuê, faceted clean slugs)
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    // 301 Redirect nếu URL có query param ?page=...
    if (sp.page) {
      const p = parseInt(sp.page, 10);
      const queryParams = new URLSearchParams();
      for (const [k, v] of Object.entries(sp)) {
        if (k !== 'page' && v) queryParams.set(k, String(v));
      }
      const qs = queryParams.toString();
      if (p > 1 && String(p) === sp.page) {
        permanentRedirect(qs ? `/${slug}/p${p}?${qs}` : `/${slug}/p${p}`);
      } else {
        permanentRedirect(qs ? `/${slug}?${qs}` : `/${slug}`);
      }
    }

    const domain = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
    const canonicalUrl = taxonomyInfo.canonicalUrl?.startsWith('http')
      ? taxonomyInfo.canonicalUrl
      : `${domain}${taxonomyInfo.canonicalPath || taxonomyInfo.canonicalUrl || currentPath}`;
    const { title, description } = generateCategoryMetadata(taxonomyInfo, 2026, taxonomyInfo.page || 1);

    const isRent = taxonomyInfo.demand === 'rent';
    const parentDemandName = isRent ? 'Cho Thuê Nhà Đất' : 'Mua Bán Nhà Đất';
    const parentDemandPath = isRent ? `${domain}/nha-dat-cho-thue` : `${domain}/nha-dat-ban`;

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
          name: parentDemandName,
          item: parentDemandPath
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: taxonomyInfo.title || title,
          item: canonicalUrl
        }
      ]
    };

    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#collection`,
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: 'vi-VN',
      isPartOf: {
        '@type': 'WebSite',
        '@id': domain,
        name: 'Kênh Nhà Đất 24H',
        url: domain
      }
    };

    const cityName = taxonomyInfo.city || '';
    const isDaNang = cityName.includes('Đà Nẵng') || cityName.toLowerCase().includes('da nang');
    const isQuangNam = cityName.includes('Quảng Nam') || cityName.toLowerCase().includes('quang nam');

    let faqEntities = [];
    if (isDaNang) {
      faqEntities = [
        {
          '@type': 'Question',
          name: 'Có nên mua nhà đất Đà Nẵng năm 2026 và khu vực nào có tiềm năng tăng trưởng tốt nhất?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Năm 2026 là thời điểm vàng để mua nhà đất Đà Nẵng nhờ mặt bằng giá đã tích lũy ổn định và hạ tầng bứt phá. Các khu vực tiềm năng gồm: Quận Liên Chiểu (đón sóng Cảng biển quốc tế), Nam Hòa Xuân / Ngũ Hành Sơn (đô thị sinh thái ven sông) và khu vực trung tâm Hải Châu (nhà phố kinh doanh dòng tiền).'
          }
        },
        {
          '@type': 'Question',
          name: 'Người ngoại tỉnh (Hà Nội, TP.HCM...) mua nhà đất tại Đà Nẵng cần lưu ý những thủ tục gì?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Người ngoại tỉnh có quyền đứng tên sổ hồng nhà đất Đà Nẵng hoàn toàn bình thường như công dân địa phương. Quy trình công chứng có thể ủy quyền hoặc ký trực tiếp tại bất kỳ Văn phòng Công chứng nào tại Đà Nẵng. Cần kiểm tra kỹ quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai cấp quận/huyện và tình trạng pháp lý tài sản qua hệ thống ngăn chặn UCHI Đà Nẵng trước khi cọc.'
          }
        },
        {
          '@type': 'Question',
          name: 'Mua căn hộ chung cư hay đất nền thổ cư tại Đà Nẵng có tính thanh khoản cao hơn?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Căn hộ chung cư cao cấp ven sông Hàn và ven biển Mỹ Khê có thanh khoản cho thuê rất tốt (tỷ suất 6% - 8%/năm từ khách du lịch và chuyên gia). Trong khi đó, đất nền tại các khu đô thị quy hoạch bài bản (như Hòa Xuân, Nam Hòa Xuân, Golden Hills) có biên độ tăng giá vốn mạnh mẽ theo chu kỳ hạ tầng.'
          }
        },
        {
          '@type': 'Question',
          name: 'Lệ phí trước bạ và thuế chuyển nhượng nhà đất tại Đà Nẵng nộp ở đâu?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sau khi ký công chứng hợp đồng mua bán, hồ sơ được nộp tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa) Chi nhánh Văn phòng Đăng ký Đất đai tại các quận/huyện ở Đà Nẵng. Thuế TNCN (2%) và Lệ phí trước bạ (0.5%) được nộp tại Kho bạc Nhà nước hoặc ngân hàng thương mại được ủy nhiệm thu.'
          }
        }
      ];
    } else if (isQuangNam) {
      faqEntities = [
        {
          '@type': 'Question',
          name: 'Mua đất nền dự án ven sông Cổ Cò (Điện Bàn - Quảng Nam) năm 2026 cần lưu ý pháp lý gì?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Người mua cần ưu tiên các dự án đã được cấp Giấy chứng nhận quyền sử dụng đất (Sổ hồng từng lô) hoặc đã hoàn thành 100% nghĩa vụ tài chính tiền sử dụng đất và được nghiệm thu hạ tầng kỹ thuật theo Luật Đất đai 2024. Tuyệt đối tránh các hợp đồng góp vốn, cam kết lợi nhuận tại các dự án chưa đủ điều kiện mở bán để phòng ngừa rủi ro tranh chấp kéo dài.'
          }
        },
        {
          '@type': 'Question',
          name: 'Thủ tục sang tên chuyển nhượng nhà đất tại Quảng Nam nộp ở đâu và thời gian giải quyết bao lâu?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sau khi công chứng hợp đồng mua bán, hồ sơ được nộp tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa) Chi nhánh Văn phòng Đăng ký Đất đai tại các thành phố, thị xã hoặc huyện thuộc tỉnh Quảng Nam (như Chi nhánh TP. Hội An, TX. Điện Bàn, TP. Tam Kỳ...). Thời hạn đăng ký biến động sang tên sổ đỏ từ 10 đến 15 ngày làm việc theo quy định hành chính hiện hành.'
          }
        },
        {
          '@type': 'Question',
          name: 'Người ngoài tỉnh (Đà Nẵng, Hà Nội, TP.HCM...) có được đứng tên mua nhà đất tại Quảng Nam không?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Người ngoài tỉnh hoàn toàn có quyền đứng tên chủ sở hữu Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở tại Quảng Nam bình thường theo pháp luật Việt Nam. Hợp đồng chuyển nhượng có thể công chứng tại bất kỳ Văn phòng Công chứng nào trên địa bàn tỉnh Quảng Nam.'
          }
        },
        {
          '@type': 'Question',
          name: 'Khu vực nào tại Quảng Nam có tiềm năng sinh lời và thanh khoản cao nhất năm 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ba khu vực tâm điểm dòng tiền gồm: (1) Phố cổ và ven biển TP. Hội An (giữ giá tốt, khai thác dòng tiền cho thuê du lịch cao); (2) Thị xã Điện Bàn (hưởng lợi trực tiếp từ khơi thông sông Cổ Cò và liên kết đô thị phía Nam Đà Nẵng); (3) TP. Tam Kỳ và Núi Thành (đất nền phục vụ nhu cầu ở thực của kỹ sư, chuyên gia tại KKT mở Chu Lai và quy hoạch Sân bay Chu Lai).'
          }
        }
      ];
    } else {
      faqEntities = [
        {
          '@type': 'Question',
          name: `Người mua nhà đất ${cityName ? `tại ${cityName}` : 'lần đầu'} cần chuẩn bị những thủ tục pháp lý quan trọng nào?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Người mua nhà đất cần kiểm tra bản gốc Sổ đỏ/Sổ hồng, tra cứu thông tin quy hoạch tại Chi nhánh Văn phòng Đăng ký Đất đai, kiểm tra tình trạng ngăn chặn tranh chấp tại Văn phòng Công chứng và lập hợp đồng đặt cọc có điều khoản hoàn cọc 100% nếu tài sản vướng quy hoạch.`
          }
        },
        {
          '@type': 'Question',
          name: `Chi phí thuế và lệ phí sang tên chuyển nhượng nhà đất ${cityName ? `tại ${cityName}` : ''} bên nào chịu?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Theo quy định pháp luật: Bên bán chịu Thuế thu nhập cá nhân (2% giá trị chuyển nhượng); Bên mua chịu Lệ phí trước bạ (0.5% giá trị nhà đất) và lệ phí cấp đổi phôi sổ mới.'
          }
        },
        {
          '@type': 'Question',
          name: `Làm thế nào để tìm kiếm nhà đất chính chủ ${cityName ? `tại ${cityName}` : ''} trên Kênh Nhà Đất 24H?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bạn có thể sử dụng bộ lọc khu vực Quận/Huyện, khoảng giá và tích chọn bộ lọc \'Tin chính chủ / Đã xác thực\' để tiếp cận các bất động sản đã được xác minh sổ đỏ và tọa độ thực tế.'
          }
        }
      ];
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities
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
        {renderTaxonomyPage(taxonomyInfo, 1, sp)}
      </>
    );
  }

  notFound();
}
