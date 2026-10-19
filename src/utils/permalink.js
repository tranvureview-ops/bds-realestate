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
      house: { slug: '/ban-nha-rieng', name: 'Bán nhà riêng, nhà phố' },
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
      house: { slug: '/cho-thue-nha-rieng', name: 'Cho thuê nhà riêng, nhà phố' },
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

// Bảng ánh xạ Quận/Huyện sang Tỉnh/Thành phố chuẩn hỗ trợ Clean Slug SEO
export const DISTRICT_MAP = {
  'ba-dinh': { name: 'Quận Ba Đình', city: 'Hà Nội' },
  'cau-giay': { name: 'Quận Cầu Giấy', city: 'Hà Nội' },
  'dong-da': { name: 'Quận Đống Đa', city: 'Hà Nội' },
  'hoan-kiem': { name: 'Quận Hoàn Kiếm', city: 'Hà Nội' },
  'tay-ho': { name: 'Quận Tây Hồ', city: 'Hà Nội' },
  'hai-ba-trung': { name: 'Quận Hai Bà Trưng', city: 'Hà Nội' },
  'thanh-xuan': { name: 'Quận Thanh Xuân', city: 'Hà Nội' },
  'hoang-mai': { name: 'Quận Hoàng Mai', city: 'Hà Nội' },
  'long-bien': { name: 'Quận Long Biên', city: 'Hà Nội' },
  'nam-tu-liem': { name: 'Quận Nam Từ Liêm', city: 'Hà Nội' },
  'bac-tu-liem': { name: 'Quận Bắc Từ Liêm', city: 'Hà Nội' },
  'ha-dong': { name: 'Quận Hà Đông', city: 'Hà Nội' },
  'tan-phu': { name: 'Quận Tân Phú', city: 'TP. Hồ Chí Minh' },
  'binh-thanh': { name: 'Quận Bình Thạnh', city: 'TP. Hồ Chí Minh' },
  'thu-duc': { name: 'TP. Thủ Đức', city: 'TP. Hồ Chí Minh' },
  'quan-1': { name: 'Quận 1', city: 'TP. Hồ Chí Minh' },
  'quan-2': { name: 'Quận 2', city: 'TP. Hồ Chí Minh' },
  'quan-3': { name: 'Quận 3', city: 'TP. Hồ Chí Minh' },
  'quan-4': { name: 'Quận 4', city: 'TP. Hồ Chí Minh' },
  'quan-5': { name: 'Quận 5', city: 'TP. Hồ Chí Minh' },
  'quan-7': { name: 'Quận 7', city: 'TP. Hồ Chí Minh' },
  'quan-10': { name: 'Quận 10', city: 'TP. Hồ Chí Minh' },
  'tan-binh': { name: 'Quận Tân Bình', city: 'TP. Hồ Chí Minh' },
  'go-vap': { name: 'Quận Gò Vấp', city: 'TP. Hồ Chí Minh' },
  'binh-chanh': { name: 'Huyện Bình Chánh', city: 'TP. Hồ Chí Minh' },
  'nha-be': { name: 'Huyện Nhà Bè', city: 'TP. Hồ Chí Minh' },
  'ngu-hanh-son': { name: 'Quận Ngũ Hành Sơn', city: 'Đà Nẵng' },
  'son-tra': { name: 'Quận Sơn Trà', city: 'Đà Nẵng' },
  'hai-chau': { name: 'Quận Hải Châu', city: 'Đà Nẵng' },
  'lien-chieu': { name: 'Quận Liên Chiểu', city: 'Đà Nẵng' },
  'di-an': { name: 'TP. Dĩ An', city: 'Bình Dương' },
  'thuan-an': { name: 'TP. Thuận An', city: 'Bình Dương' },
  'thu-dau-mot': { name: 'TP. Thủ Dầu Một', city: 'Bình Dương' }
};

/**
 * Chuyển đổi chuỗi cụm từ khóa thành Clean Slug URL chuẩn SEO (Không chứa query parameters)
 * Ví dụ: "Bán căn hộ chung cư Celadon City từ 80 m2 đến 100 m2"
 *        -> "/ban-can-ho-chung-cu-celadon-city-tu-80-m2-den-100-m2"
 */
export const buildKeywordCleanSlug = (text) => {
  if (!text) return '/nha-dat-ban';
  const clean = toVietnameseSlug(text);
  return clean ? `/${clean}` : '/nha-dat-ban';
};

/**
 * Phân tích URL danh mục (Taxonomy URL) theo chuẩn Batdongsan.com.vn & Clean Slug SEO URLs
 * Ví dụ:
 * - /ban-can-ho-chung-cu-ha-noi -> { isTaxonomy: true, demand: 'sale', propertyType: 'apartment', city: 'Hà Nội', ... }
 * - /ban-can-ho-chung-cu-duong-n1-tan-phu -> { isTaxonomy: true, demand: 'sale', propertyType: 'apartment', district: 'Quận Tân Phú', keyword: 'n1', ... }
 * - /ban-nha-rieng-quan-ba-dinh-tu-3-ty-den-5-ty -> { isTaxonomy: true, demand: 'sale', propertyType: 'house', district: 'Quận Ba Đình', priceRange: '2b-5b', ... }
 */
export const parseTaxonomyUrl = (urlPath) => {
  if (!urlPath) return { isTaxonomy: false };

  const clean = urlPath.replace(/^#/, '').split('?')[0];

  // Không xử lý nếu là trang chi tiết bất động sản (có đuôi chuẩn -pr{id})
  if (clean.match(/-pr[a-z0-9_.-]+$/i)) {
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
      // Khớp chính xác loại hình hoặc alias Bán nhà riêng, nhà phố
      if (clean === typeInfo.slug || 
          (typeKey === 'house' && clean === '/ban-nha-rieng-nha-pho' && demand === 'sale') ||
          (typeKey === 'house' && clean === '/cho-thue-nha-rieng-nha-pho' && demand === 'rent')) {
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

  // 3. Phân tích Clean Slug URL mở rộng (Faceted Keyword & Taxonomy Clean Slugs)
  if (clean.startsWith('/ban-') || clean.startsWith('/cho-thue-') || clean.startsWith('/nha-dat-')) {
    const raw = clean.slice(1); // bỏ dấu /

    // A. Demand
    const isRent = raw.startsWith('cho-thue-') || raw.startsWith('nha-dat-cho-thue');
    const demand = isRent ? 'rent' : 'sale';

    // B. PropertyType
    let propertyType = 'all';
    if (raw.includes('can-ho-chung-cu') || raw.includes('chung-cu')) propertyType = 'apartment';
    else if (raw.includes('nha-mat-pho')) propertyType = 'street-house';
    else if (raw.includes('nha-biet-thu') || raw.includes('biet-thu')) propertyType = 'villa';
    else if (raw.includes('dat-nen') || raw.includes('du-an')) propertyType = 'land';
    else if (raw.includes('shophouse')) propertyType = 'shophouse';
    else if (raw.includes('van-phong')) propertyType = 'office';
    else if (raw.includes('nha-rieng')) propertyType = 'house';

    // C. Thành phố & Quận/Huyện
    let city = '';
    let district = '';

    if (raw.includes('ho-chi-minh') || raw.includes('tp-hcm') || raw.includes('hcm')) {
      city = 'TP. Hồ Chí Minh';
    } else if (raw.includes('ha-noi')) {
      city = 'Hà Nội';
    } else if (raw.includes('da-nang')) {
      city = 'Đà Nẵng';
    } else if (raw.includes('binh-duong')) {
      city = 'Bình Dương';
    }

    // Đối chiếu các quận huyện
    for (const [dSlug, dInfo] of Object.entries(DISTRICT_MAP)) {
      if (raw.includes(dSlug) || raw.includes(`quan-${dSlug}`) || raw.includes(`huyen-${dSlug}`)) {
        district = dInfo.name;
        if (!city) city = dInfo.city;
        break;
      }
    }

    // D. Số phòng ngủ (PN)
    let bedroom = 'all';
    const bedMatch = raw.match(/([1-9])\s*-?pn/);
    if (bedMatch) bedroom = bedMatch[1];

    // E. Khoảng giá (Pricing Tier)
    let priceRange = 'all';
    const priceMatch = raw.match(/tu-([0-9]+)-ty-den-([0-9]+)-ty/);
    if (priceMatch) {
      const maxVal = parseInt(priceMatch[2], 10);
      if (maxVal <= 2) priceRange = 'under-2b';
      else if (maxVal <= 5) priceRange = '2b-5b';
      else if (maxVal <= 10) priceRange = '5b-10b';
      else if (maxVal <= 30) priceRange = '10b-30b';
      else priceRange = 'over-30b';
    } else if (raw.includes('gia-re') || raw.includes('duoi-2-ty')) {
      priceRange = 'under-2b';
    }

    // F. Diện tích (Area Range)
    let areaRange = 'all';
    const areaMatch = raw.match(/tu-([0-9]+)-m2-den-([0-9]+)-m2/);
    if (areaMatch) {
      const maxArea = parseInt(areaMatch[2], 10);
      if (maxArea <= 50) areaRange = 'under-50';
      else if (maxArea <= 100) areaRange = '50-100';
      else if (maxArea <= 200) areaRange = '100-200';
      else areaRange = 'over-200';
    }

    // G. Tiện ích & Từ khóa đặc biệt
    let keyword = '';
    if (raw.includes('full-noi-that')) {
      keyword = 'full nội thất';
    } else if (raw.includes('co-ban-cong') || raw.includes('ban-cong')) {
      keyword = 'ban công';
    } else if (raw.includes('so-do') || raw.includes('so-hong')) {
      keyword = 'sổ đỏ';
    } else if (raw.includes('celadon-city')) {
      keyword = 'Celadon City';
    } else if (raw.includes('goldmark-city')) {
      keyword = 'Goldmark City';
    } else if (raw.includes('vinhomes')) {
      keyword = 'Vinhomes';
    } else if (raw.includes('duong-')) {
      const streetMatch = raw.match(/duong-([a-z0-9-]+?)(?:-(?:quan|phuong|ha-noi|tp-hcm|ho-chi-minh|$))/);
      if (streetMatch) {
        keyword = streetMatch[1].replace(/-/g, ' ');
      }
    }

    // H. Phường
    let ward = '';
    const wardMatch = raw.match(/phuong-([a-z0-9-]+?)(?:-(?:quan|ha-noi|tp-hcm|ho-chi-minh|$))/);
    if (wardMatch) {
      ward = 'Phường ' + wardMatch[1].replace(/-/g, ' ');
    }

    // Sinh Title SEO chuẩn tiếng Việt có dấu
    let typeName = '';
    if (propertyType && propertyType !== 'all' && BATDONGSAN_TAXONOMY[demand]?.types[propertyType]) {
      typeName = BATDONGSAN_TAXONOMY[demand].types[propertyType].name;
    } else {
      typeName = demand === 'sale' ? 'Mua Bán Nhà Đất' : 'Cho Thuê Nhà Đất';
    }

    let title = typeName;
    if (ward && district) {
      title = `${typeName} tại ${ward}, ${district}`;
      if (city) title += `, ${city}`;
    } else if (district) {
      title = `${typeName} tại ${district}`;
      if (city) title += `, ${city}`;
    } else if (city) {
      title = `${typeName} tại ${city}`;
    } else {
      title = raw
        .replace(/-/g, ' ')
        .replace(/^(ban|cho thue)\s+/i, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return {
      isTaxonomy: true,
      isFacetedCleanSlug: true,
      demand,
      propertyType,
      city,
      district,
      ward,
      bedroom,
      priceRange,
      areaRange,
      keyword,
      title,
      canonicalUrl: clean
    };
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

export const cleanUrlPath = (urlPath) => {
  if (!urlPath) return '';
  let raw = urlPath.replace(/^#/, '').split('?')[0];
  try {
    raw = decodeURIComponent(raw);
  } catch (e) {}
  return raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
};

export const formatBdsIdentifier = (rawIdNumber) => {
  const numOnly = rawIdNumber.replace(/\D/g, '');
  if (numOnly) return `BDS-${numOnly.padStart(3, '0')}`;
  return rawIdNumber.toUpperCase().startsWith('BDS-')
    ? rawIdNumber.toUpperCase()
    : `BDS-${rawIdNumber.toUpperCase()}`;
};

/**
 * Phân tích URL bài đăng bất động sản theo định dạng chuẩn DUY NHẤT: /{slug}-pr{id}
 * Mọi định dạng khác (/pr..., /bds-..., /bat-dong-san/..., hoặc pure slug không có -pr) đều bị xóa bỏ.
 */
export const parsePropertyUrl = (urlPath) => {
  const clean = cleanUrlPath(urlPath);
  const match = clean.match(/^\/([a-z0-9\u00C0-\u024F\u1E00-\u1EFF_.-]+)-pr([a-z0-9_.-]+)$/i);
  if (!match) return { isProperty: false };

  return {
    isProperty: true,
    rawSlug: match[1],
    rawIdNumber: match[2],
    normalizedBdsId: formatBdsIdentifier(match[2]),
    canonicalUrl: clean
  };
};

/**
 * Tạo URL danh mục chuẩn Batdongsan theo Nhu cầu, Loại hình, Tỉnh/Thành & Quận/Huyện
 * Hỗ trợ các trường hợp Breadcrumb & Faceted Navigation:
 * - Cấp Loại hình: /ban-nha-rieng-nha-pho (hoặc /ban-can-ho-chung-cu, /cho-thue-can-ho-chung-cu)
 * - Cấp Tỉnh/Thành: /ban-nha-rieng-ha-noi
 * - Cấp Quận/Huyện: /ban-nha-rieng-quan-ba-dinh
 */
export const getCategoryPermalink = (demand = 'sale', propertyType = null, cityName = null, districtName = null) => {
  const group = BATDONGSAN_TAXONOMY[demand] || BATDONGSAN_TAXONOMY.sale;
  
  // Base type slug chuẩn (ví dụ /ban-nha-rieng, /ban-can-ho-chung-cu, hoặc base /nha-dat-ban)
  const baseTypeSlug = (propertyType && group.types[propertyType])
    ? group.types[propertyType].slug
    : group.base;

  // 1. Nếu có Quận/Huyện: Kết hợp Loại hình + Quận/Huyện (Ví dụ: /ban-nha-rieng-quan-ba-dinh)
  if (districtName && districtName.trim()) {
    const rawDistrictSlug = toVietnameseSlug(districtName.trim());
    return `${baseTypeSlug}-${rawDistrictSlug}`;
  }

  // 2. Nếu có Tỉnh/Thành phố (không có Quận/Huyện): Kết hợp Loại hình + Tỉnh/Thành phố (Ví dụ: /ban-nha-rieng-ha-noi)
  if (cityName && cityName.trim()) {
    const citySlug = CITY_SLUGS[cityName.trim()] || toVietnameseSlug(cityName.trim());
    return `${baseTypeSlug}-${citySlug}`;
  }

  // 3. Nếu chỉ có Loại hình BĐS (Ví dụ: Bán nhà riêng, nhà phố -> /ban-nha-rieng-nha-pho)
  if (propertyType && group.types[propertyType]) {
    if (propertyType === 'house') {
      return demand === 'sale' ? '/ban-nha-rieng-nha-pho' : '/cho-thue-nha-rieng-nha-pho';
    }
    return group.types[propertyType].slug;
  }

  // 4. Mặc định trả về Base nhóm nhu cầu: /nha-dat-ban hoặc /nha-dat-cho-thue
  return group.base;
};

/**
 * Xây dựng URL Faceted Taxonomy & Navigation chuẩn hóa
 * Hỗ trợ kết hợp đa diện (Phân cấp danh mục + Địa giới hành chính + Khoảng giá + Diện tích + Từ khóa + Xác thực)
 */
export const buildFacetedUrl = ({
  demand = 'sale',
  propertyType = null,
  city = null,
  district = null,
  keyword = null,
  priceRange = null,
  areaRange = null,
  onlyVerified = false
} = {}) => {
  const baseCategory = getCategoryPermalink(demand, propertyType, city);
  const params = new URLSearchParams();

  if (district && district.trim()) {
    params.set('district', district.trim());
  }
  if (keyword && keyword.trim()) {
    params.set('keyword', keyword.trim());
  }
  if (priceRange && priceRange !== 'all') {
    params.set('priceRange', priceRange);
  }
  if (areaRange && areaRange !== 'all') {
    params.set('areaRange', areaRange);
  }
  if (onlyVerified) {
    params.set('onlyVerified', 'true');
  }

  // Nếu city không có trong CITY_SLUGS thì đưa vào query parameter
  if (city && !CITY_SLUGS[city]) {
    params.set('city', city.trim());
  }

  const queryString = params.toString();
  return queryString ? `${baseCategory}?${queryString}` : baseCategory;
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
            'name': (property.propertyType && BATDONGSAN_TAXONOMY[property.demand]?.types[property.propertyType]?.name) || (property.demand === 'sale' ? 'Nhà đất bán' : 'Cho thuê nhà đất'),
            'item': `${siteUrl}${getCategoryPermalink(property.demand, property.propertyType)}`
          },
          ...(property.city ? [{
            '@type': 'ListItem',
            'position': 3,
            'name': property.city,
            'item': `${siteUrl}${getCategoryPermalink(property.demand, property.propertyType, property.city)}`
          }] : []),
          ...(property.district ? [{
            '@type': 'ListItem',
            'position': property.city ? 4 : 3,
            'name': property.district,
            'item': `${siteUrl}${getCategoryPermalink(property.demand, property.propertyType, property.city, property.district)}`
          }] : []),
          {
            '@type': 'ListItem',
            'position': (property.city ? 1 : 0) + (property.district ? 1 : 0) + 3,
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

