/**
 * Module xử lý Permalink & Schema URL chuẩn hóa theo cấu trúc của website Batdongsan.com.vn
 * 
 * 1. Permalink Tin Đăng Chi Tiết (Canonical Property URL):
 *    - Cấu trúc: /{slug-tieu-de}-pr{id} hoặc /{loai-giao-dich}-{loai-bds}-{vi-tri}-{slug}-pr{id}
 *    - Ví dụ: /cho-thue-nha-pho-nguyen-can-quan-1-le-thanh-ton-pr006
 *            /ban-can-ho-2pn-goldmark-city-136-ho-tung-mau-pr001
 * 
 * 2. Schema URL Phân Cấp Danh Mục (Taxonomy URLs):
 *    - /ban-can-ho-chung-cu, /ban-nha-rieng, /ban-nha-mat-pho, /ban-dat-nen-du-an
 *    - /cho-thue-can-ho-chung-cu, /cho-thue-nha-mat-pho, /cho-thue-van-phong
 * 
 * 3. Schema URL Địa Giới Hành Chính:
 *    - /nha-dat-ban-ha-noi, /nha-dat-ban-tp-hcm, /ban-can-ho-chung-cu-cau-giay
 * 
 * 4. Schema.org JSON-LD Structured Data:
 *    - RealEstateListing, SingleFamilyResidence / Apartment, Offer, PostalAddress, BreadcrumbList
 */

// Hàm loại bỏ dấu tiếng Việt chuẩn SEO
export const toVietnameseSlug = (str) => {
  if (!str) return '';
  let slug = str.toLowerCase();
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  slug = slug.replace(/[đĐ]/g, 'd');
  slug = slug.replace(/[^a-z0-9\s-]/g, '').trim();
  slug = slug.replace(/[\s-]+/g, '-');
  return slug;
};

// Bảng ánh xạ danh mục loại hình BĐS chuẩn Batdongsan.com.vn
export const BATDONGSAN_TAXONOMY = {
  sale: {
    base: '/nha-dat-ban',
    title: 'Nhà Đất Bán Toàn Quốc',
    types: {
      apartment: { slug: '/ban-can-ho-chung-cu', name: 'Bán căn hộ chung cư' },
      house: { slug: '/ban-nha-rieng', name: 'Bán nhà riêng' },
      'street-house': { slug: '/ban-nha-mat-pho', name: 'Bán nhà mặt phố' },
      villa: { slug: '/ban-nha-biet-thu-lien-ke', name: 'Bán nhà biệt thự, liền kề' },
      land: { slug: '/ban-dat-nen-du-an', name: 'Bán đất nền dự án' },
      shophouse: { slug: '/ban-shophouse-nha-pho-thuong-mai', name: 'Bán shophouse, nhà phố thương mại' },
      office: { slug: '/ban-mat-bang-van-phong', name: 'Bán văn phòng, mặt bằng' }
    }
  },
  rent: {
    base: '/nha-dat-cho-thue',
    title: 'Cho Thuê Nhà Đất Toàn Quốc',
    types: {
      apartment: { slug: '/cho-thue-can-ho-chung-cu', name: 'Cho thuê căn hộ chung cư' },
      house: { slug: '/cho-thue-nha-rieng', name: 'Cho thuê nhà riêng, nguyên căn' },
      'street-house': { slug: '/cho-thue-nha-mat-pho', name: 'Cho thuê nhà mặt phố kinh doanh' },
      villa: { slug: '/cho-thue-nha-biet-thu-lien-ke', name: 'Cho thuê biệt thự nghỉ dưỡng' },
      land: { slug: '/cho-thue-kho-nha-xuong-dat', name: 'Cho thuê kho, bãi, đất' },
      shophouse: { slug: '/cho-thue-shophouse-nha-pho-thuong-mai', name: 'Cho thuê shophouse' },
      office: { slug: '/cho-thue-van-phong', name: 'Cho thuê văn phòng' }
    }
  }
};

// Ánh xạ thành phố chuẩn Batdongsan
export const CITY_SLUGS = {
  'Hà Nội': 'ha-noi',
  'TP. Hồ Chí Minh': 'tp-hcm',
  'Đà Nẵng': 'da-nang',
  'Bình Dương': 'binh-duong'
};

export const SLUG_TO_CITY = {
  'ha-noi': 'Hà Nội',
  'tp-hcm': 'TP. Hồ Chí Minh',
  'da-nang': 'Đà Nẵng',
  'binh-duong': 'Bình Dương'
};

/**
 * Phân tích URL danh mục (Taxonomy URL) theo chuẩn Batdongsan.com.vn
 * Ví dụ:
 * - /ban-can-ho-chung-cu-ha-noi -> { isTaxonomy: true, demand: 'sale', propertyType: 'apartment', city: 'Hà Nội', ... }
 * - /nha-dat-cho-thue-tp-hcm -> { isTaxonomy: true, demand: 'rent', propertyType: 'all', city: 'TP. Hồ Chí Minh', ... }
 * - /cho-thue-van-phong -> { isTaxonomy: true, demand: 'rent', propertyType: 'office', city: '', ... }
 */
export const parseTaxonomyUrl = (urlPath) => {
  if (!urlPath) return { isTaxonomy: false };

  const clean = urlPath.replace(/^#/, '').split('?')[0];

  // Không xử lý nếu là trang chi tiết (có -pr{id}, /pr..., /bds-... hoặc /bat-dong-san/)
  if (clean.match(/-pr[a-z0-9_.-]+$/i) || clean.match(/^\/pr[a-z0-9_.-]+/i) || clean.match(/^\/bds-[a-z0-9_.-]+/i) || clean.startsWith('/bat-dong-san/')) {
    return { isTaxonomy: false };
  }

  // 1. Kiểm tra Base danh mục: /nha-dat-ban hoặc /nha-dat-cho-thue
  for (const demand of ['sale', 'rent']) {
    const group = BATDONGSAN_TAXONOMY[demand];
    
    // Khớp chính xác base: /nha-dat-ban hoặc /nha-dat-cho-thue
    if (clean === group.base) {
      return {
        isTaxonomy: true,
        demand,
        propertyType: 'all',
        city: '',
        title: group.title,
        canonicalUrl: group.base
      };
    }

    // Khớp base + city: /nha-dat-ban-ha-noi
    for (const [cityName, citySlug] of Object.entries(CITY_SLUGS)) {
      if (clean === `${group.base}-${citySlug}`) {
        return {
          isTaxonomy: true,
          demand,
          propertyType: 'all',
          city: cityName,
          title: `${group.title} tại ${cityName}`,
          canonicalUrl: clean
        };
      }
    }

    // 2. Khớp từng loại hình: /ban-can-ho-chung-cu, /cho-thue-van-phong...
    for (const [typeKey, typeInfo] of Object.entries(group.types)) {
      // Khớp chính xác loại hình
      if (clean === typeInfo.slug) {
        return {
          isTaxonomy: true,
          demand,
          propertyType: typeKey,
          city: '',
          title: typeInfo.name,
          canonicalUrl: clean
        };
      }

      // Khớp loại hình + thành phố: /ban-can-ho-chung-cu-ha-noi
      for (const [cityName, citySlug] of Object.entries(CITY_SLUGS)) {
        if (clean === `${typeInfo.slug}-${citySlug}`) {
          return {
            isTaxonomy: true,
            demand,
            propertyType: typeKey,
            city: cityName,
            title: `${typeInfo.name} tại ${cityName}`,
            canonicalUrl: clean
          };
        }
      }
    }
  }

  return { isTaxonomy: false };
};

/**
 * Tạo URL Permalink bài đăng chi tiết chuẩn duy nhất Batdongsan.com.vn: /{slug-tieu-de}-pr{id}
 * Ví dụ: BDS-012 -> /ban-can-ho-chung-cu-goldmark-city-136-ho-tung-mau-75m-2pn-35-ty-pr012
 */
export const getPropertyPermalink = (property) => {
  if (!property) return '/';

  const numOnly = String(property.id || '').replace(/\D/g, '');
  const idSuffix = numOnly
    ? numOnly.padStart(3, '0')
    : String(property.id || '').replace(/^BDS-?/i, '').toLowerCase();

  let baseSlug = property.slug || toVietnameseSlug(property.title) || 'bat-dong-san';
  // Loại bỏ hậu tố -pr cũ nếu đã có trong slug để đảm bảo tính nhất quán tuyệt đối
  baseSlug = baseSlug.replace(/-pr[a-z0-9_.-]+$/i, '').trim();

  return `/${baseSlug}-pr${idSuffix || '001'}`;
};

/**
 * Phân tích URL để nhận diện ID hoặc Slug bài đăng
 * Hỗ trợ đa dạng định dạng:
 * 1. Chuẩn Batdongsan: /{slug}-pr{id} (ví dụ /cho-thue-nha-pho...-pr006, /fghfghfg...-pr011)
 * 2. Rút gọn: /pr{id} (ví dụ /pr011, /pr001)
 * 3. Chuẩn Mã BĐS: /bds-{id} (ví dụ /bds-011, /bds-001)
 * 4. Chuẩn Alias: /bat-dong-san/{slugOrId}
 */
export const parsePropertyUrl = (urlPath) => {
  if (!urlPath) return { isProperty: false };

  let raw = urlPath.replace(/^#/, '').split('?')[0];
  try {
    raw = decodeURIComponent(raw);
  } catch (e) {
    // ignore decode error
  }
  // Loại bỏ slash thừa ở cuối
  const clean = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;

  // 1. Khớp định dạng chuẩn Batdongsan: *-pr{id} hoặc *-pr{anyId}
  const prMatch = clean.match(/^\/([a-z0-9\u00C0-\u024F\u1E00-\u1EFF_.-]+)-pr([a-z0-9_.-]+)$/i);
  if (prMatch) {
    const rawSlug = prMatch[1];
    const rawIdNumber = prMatch[2];
    const numOnly = rawIdNumber.replace(/\D/g, '');
    const normalizedBdsId = numOnly 
      ? `BDS-${numOnly.padStart(3, '0')}` 
      : (rawIdNumber.toUpperCase().startsWith('BDS-') ? rawIdNumber.toUpperCase() : `BDS-${rawIdNumber.toUpperCase()}`);
    return {
      isProperty: true,
      rawSlug,
      rawIdNumber,
      normalizedBdsId,
      canonicalUrl: clean
    };
  }

  // 1b. Khớp định dạng rút gọn: /pr{id}
  const shortPrMatch = clean.match(/^\/pr([a-z0-9_.-]+)$/i);
  if (shortPrMatch) {
    const rawIdNumber = shortPrMatch[1];
    const numOnly = rawIdNumber.replace(/\D/g, '');
    const normalizedBdsId = numOnly 
      ? `BDS-${numOnly.padStart(3, '0')}` 
      : `BDS-${rawIdNumber.toUpperCase()}`;
    return {
      isProperty: true,
      rawSlug: null,
      rawIdNumber,
      normalizedBdsId,
      canonicalUrl: clean
    };
  }

  // 1c. Khớp trực tiếp mã định danh /bds-{id}
  const directBdsMatch = clean.match(/^\/(bds-?[a-z0-9_.-]+)$/i);
  if (directBdsMatch) {
    const bdsStr = directBdsMatch[1];
    const numOnly = bdsStr.replace(/\D/g, '');
    const normalizedBdsId = numOnly ? `BDS-${numOnly.padStart(3, '0')}` : bdsStr.toUpperCase();
    return {
      isProperty: true,
      rawSlug: null,
      rawIdNumber: numOnly || bdsStr,
      normalizedBdsId,
      canonicalUrl: clean
    };
  }

  // 2. Khớp định dạng alias: /bat-dong-san/:slugOrId
  if (clean.startsWith('/bat-dong-san/')) {
    const slugOrId = clean.replace('/bat-dong-san/', '').trim();
    
    // 2a. Nếu alias có chứa -pr{id}
    const innerPr = slugOrId.match(/^([a-z0-9\u00C0-\u024F\u1E00-\u1EFF_.-]+)-pr([a-z0-9_.-]+)$/i);
    if (innerPr) {
      const rawSlug = innerPr[1];
      const rawIdNumber = innerPr[2];
      const numOnly = rawIdNumber.replace(/\D/g, '');
      const normalizedBdsId = numOnly 
        ? `BDS-${numOnly.padStart(3, '0')}` 
        : (rawIdNumber.toUpperCase().startsWith('BDS-') ? rawIdNumber.toUpperCase() : `BDS-${rawIdNumber.toUpperCase()}`);
      return {
        isProperty: true,
        rawSlug,
        rawIdNumber,
        normalizedBdsId,
        canonicalUrl: `/${slugOrId}`
      };
    }

    // 2b. Nếu alias là dạng pr{id} hoặc bds-{id}
    const innerShortPr = slugOrId.match(/^pr([a-z0-9_.-]+)$/i);
    if (innerShortPr) {
      const rawIdNumber = innerShortPr[1];
      const numOnly = rawIdNumber.replace(/\D/g, '');
      return {
        isProperty: true,
        rawSlug: null,
        rawIdNumber,
        normalizedBdsId: numOnly ? `BDS-${numOnly.padStart(3, '0')}` : `BDS-${rawIdNumber.toUpperCase()}`,
        canonicalUrl: `/pr${rawIdNumber}`
      };
    }

    const innerBds = slugOrId.match(/^bds-?([a-z0-9_.-]+)$/i);
    if (innerBds) {
      const rawIdNumber = innerBds[1];
      const numOnly = rawIdNumber.replace(/\D/g, '');
      return {
        isProperty: true,
        rawSlug: null,
        rawIdNumber,
        normalizedBdsId: numOnly ? `BDS-${numOnly.padStart(3, '0')}` : `BDS-${rawIdNumber.toUpperCase()}`,
        canonicalUrl: `/bds-${rawIdNumber}`
      };
    }

    const numOnly = slugOrId.replace(/\D/g, '');
    const isId = slugOrId.match(/^BDS-?\d+$/i);
    return {
      isProperty: true,
      rawSlug: isId ? null : slugOrId,
      rawIdNumber: isId ? (numOnly || slugOrId) : null,
      normalizedBdsId: isId ? `BDS-${numOnly.padStart(3, '0')}` : null,
      canonicalUrl: clean
    };
  }

  // 3. Khớp Slug đơn lẻ (không chứa -pr) nếu không thuộc danh mục hoặc trang hệ thống cố định
  const RESERVED_STATIC_PATHS = [
    'admin', 'api', 'bang-gia-vip', 'dang-ky', 'dang-nhap', 'dang-tin', 
    'goi-hoi-vien', 'ho-so-ca-nhan', 'nap-tien', 'nha-dat-ban', 'nha-dat-cho-thue', 
    'quan-ly-tin', 'quy-che-hoat-dong', 'chinh-sach-bao-mat', 'chinh-sach-phap-ly', 
    'giai-quyet-khieu-nai', 'so-sanh', 'tin-da-luu', 'tinh-lai-vay'
  ];

  const singleSlugMatch = clean.match(/^\/([a-z0-9\u00C0-\u024F\u1E00-\u1EFF_-]+)$/i);
  if (singleSlugMatch) {
    const rawSlug = singleSlugMatch[1].toLowerCase();
    if (!RESERVED_STATIC_PATHS.includes(rawSlug)) {
      return {
        isProperty: true,
        rawSlug,
        rawIdNumber: null,
        normalizedBdsId: null,
        canonicalUrl: clean
      };
    }
  }

  return { isProperty: false };
};

/**
 * Tạo URL danh mục chuẩn Batdongsan theo Nhu cầu & Loại hình
 */
export const getCategoryPermalink = (demand = 'sale', propertyType = null, cityName = null) => {
  const group = BATDONGSAN_TAXONOMY[demand] || BATDONGSAN_TAXONOMY.sale;
  
  if (propertyType && group.types[propertyType]) {
    const typeSlug = group.types[propertyType].slug;
    if (cityName && CITY_SLUGS[cityName]) {
      return `${typeSlug}-${CITY_SLUGS[cityName]}`;
    }
    return typeSlug;
  }

  if (cityName && CITY_SLUGS[cityName]) {
    return `${group.base}-${CITY_SLUGS[cityName]}`;
  }

  return group.base;
};

/**
 * Sinh Schema.org JSON-LD Structured Data chuẩn SEO cho Bất Động Sản (Google Search Rich Results)
 */
export const generatePropertyJsonLd = (property, siteUrl = 'https://datbiendanang.vn') => {
  if (!property) return null;

  const permalink = getPropertyPermalink(property);
  const fullUrl = `${siteUrl}${permalink}`;

  // Phân loại Schema cụ thể: SingleFamilyResidence, Apartment hoặc House
  let residenceType = 'SingleFamilyResidence';
  if (property.propertyType === 'apartment') residenceType = 'Apartment';
  if (property.propertyType === 'shophouse' || property.propertyType === 'street-house') residenceType = 'House';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${fullUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Trang chủ',
            'item': siteUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': property.demand === 'sale' ? 'Nhà đất bán' : 'Cho thuê nhà đất',
            'item': `${siteUrl}${property.demand === 'sale' ? '/nha-dat-ban' : '/nha-dat-cho-thue'}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': property.city || 'Toàn quốc',
            'item': `${siteUrl}${getCategoryPermalink(property.demand, null, property.city)}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': property.title,
            'item': fullUrl
          }
        ]
      },
      // 2. RealEstateListing & Residence Schema
      {
        '@type': ['RealEstateListing', residenceType],
        '@id': fullUrl,
        'name': property.title,
        'description': property.description?.slice(0, 300) || property.title,
        'url': fullUrl,
        'image': property.images || [],
        'datePosted': property.publishedAt || new Date().toISOString(),
        'numberOfRooms': property.bedroom || 1,
        'numberOfBathroomsTotal': property.bathroom || 1,
        'floorSize': {
          '@type': 'QuantitativeValue',
          'value': property.area || 50,
          'unitCode': 'MTK'
        },
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': property.address || '',
          'addressLocality': property.district || '',
          'addressRegion': property.city || '',
          'addressCountry': 'VN'
        },
        'geo': property.lat && property.lng ? {
          '@type': 'GeoCoordinates',
          'latitude': property.lat,
          'longitude': property.lng
        } : undefined,
        'offers': {
          '@type': 'Offer',
          'price': property.price || 0,
          'priceCurrency': 'VND',
          'availability': 'https://schema.org/InStock',
          'validFrom': property.publishedAt || new Date().toISOString(),
          'priceSpecification': {
            '@type': 'PriceSpecification',
            'price': property.price || 0,
            'priceCurrency': 'VND',
            'unitText': property.demand === 'rent' ? 'tháng' : 'toàn bộ'
          }
        },
        'author': property.author ? {
          '@type': 'RealEstateAgent',
          'name': property.author.name,
          'telephone': property.author.phone,
          'image': property.author.avatar,
          'url': `${siteUrl}/ho-so-ca-nhan`
        } : undefined
      }
    ]
  };
};

/**
 * Sinh Schema.org JSON-LD CollectionPage/ItemList cho trang chuyên mục BĐS
 */
export const generateCategoryJsonLd = (categoryInfo, properties = [], siteUrl = 'https://datbiendanang.vn') => {
  if (!categoryInfo) return null;

  const fullUrl = `${siteUrl}${categoryInfo.canonicalUrl || (categoryInfo.demand === 'sale' ? '/nha-dat-ban' : '/nha-dat-cho-thue')}`;
  const listItems = properties.slice(0, 10).map((item, idx) => ({
    '@type': 'ListItem',
    'position': idx + 1,
    'url': `${siteUrl}${getPropertyPermalink(item)}`,
    'name': item.title
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${fullUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Trang chủ',
            'item': siteUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': categoryInfo.demand === 'sale' ? 'Nhà đất bán' : 'Nhà đất cho thuê',
            'item': `${siteUrl}${categoryInfo.demand === 'sale' ? '/nha-dat-ban' : '/nha-dat-cho-thue'}`
          },
          ...(categoryInfo.title ? [{
            '@type': 'ListItem',
            'position': 3,
            'name': categoryInfo.title,
            'item': fullUrl
          }] : [])
        ]
      },
      {
        '@type': 'CollectionPage',
        '@id': fullUrl,
        'name': categoryInfo.title || 'Danh sách bất động sản',
        'url': fullUrl,
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': properties.length,
          'itemListElement': listItems
        }
      }
    ]
  };
};

