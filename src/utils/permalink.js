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
 *    - /nha-dat-ban-da-nang, /ban-can-ho-chung-cu-hai-chau, /ban-dat-nen-du-an-ngu-hanh-son
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

// Bảng ánh xạ danh mục loại hình BĐS chuẩn Batdongsan.com.vn & 12 danh mục chuẩn SEO
export const BATDONGSAN_TAXONOMY = {
  sale: {
    base: '/nha-dat-ban',
    title: 'Nhà Đất Bán Toàn Quốc',
    types: {
      apartment: { slug: '/ban-can-ho-chung-cu', name: 'Bán căn hộ chung cư' },
      'mini-apartment': { slug: '/ban-chung-cu-mini-can-ho-dich-vu', name: 'Bán chung cư mini, căn hộ dịch vụ' },
      house: { slug: '/ban-nha-rieng', name: 'Bán nhà riêng' },
      villa: { slug: '/ban-nha-biethu-lien-ke', name: 'Bán nhà biệt thự, liền kề' },
      'street-house': { slug: '/ban-nha-mat-pho', name: 'Bán nhà mặt phố' },
      shophouse: { slug: '/ban-shophouse-nha-pho-thuong-mai', name: 'Bán shophouse' },
      'project-land': { slug: '/ban-dat-nen-du-an', name: 'Bán đất nền dự án' },
      land: { slug: '/ban-dat', name: 'Bán đất' },
      'farm-resort': { slug: '/ban-trang-trai-khu-nghi-duong', name: 'Bán trang trại, khu nghỉ dưỡng' },
      condotel: { slug: '/ban-condotel', name: 'Bán condotel' },
      warehouse: { slug: '/ban-kho-nha-xuong', name: 'Bán kho, nhà xưởng' },
      other: { slug: '/ban-bat-dong-san-khac', name: 'Bán loại BĐS khác' },
      office: { slug: '/ban-mat-bang-van-phong', name: 'Bán văn phòng, mặt bằng' }
    }
  },
  rent: {
    base: '/nha-dat-cho-thue',
    title: 'Cho Thuê Nhà Đất Toàn Quốc',
    types: {
      apartment: { slug: '/cho-thue-can-ho-chung-cu', name: 'Cho thuê căn hộ chung cư' },
      'mini-apartment': { slug: '/cho-thue-chung-cu-mini-can-ho-dich-vu', name: 'Cho thuê chung cư mini, căn hộ dịch vụ' },
      house: { slug: '/cho-thue-nha-rieng', name: 'Cho thuê nhà riêng' },
      villa: { slug: '/cho-thue-nha-biethu-lien-ke', name: 'Cho thuê nhà biệt thự, liền kề' },
      'street-house': { slug: '/cho-thue-nha-mat-pho', name: 'Cho thuê nhà mặt phố' },
      shophouse: { slug: '/cho-thue-shophouse-nha-pho-thuong-mai', name: 'Cho thuê shophouse' },
      'project-land': { slug: '/cho-thue-dat-nen-du-an', name: 'Cho thuê đất nền dự án' },
      land: { slug: '/cho-thue-dat', name: 'Cho thuê đất' },
      'farm-resort': { slug: '/cho-thue-trang-trai-khu-nghi-duong', name: 'Cho thuê trang trại, khu nghỉ dưỡng' },
      condotel: { slug: '/cho-thue-condotel', name: 'Cho thuê condotel' },
      warehouse: { slug: '/cho-thue-kho-nha-xuong', name: 'Cho thuê kho, nhà xưởng' },
      other: { slug: '/cho-thue-bat-dong-san-khac', name: 'Cho thuê loại BĐS khác' },
      office: { slug: '/cho-thue-van-phong', name: 'Cho thuê văn phòng' }
    }
  }
};


// Ánh xạ thành phố chuẩn Đà Nẵng
export const CITY_SLUGS = {
  'Đà Nẵng': 'da-nang'
};

export const SLUG_TO_CITY = {
  'da-nang': 'Đà Nẵng'
};

// Bảng ánh xạ Quận/Huyện TP. Đà Nẵng chuẩn hỗ trợ Clean Slug SEO
export const DISTRICT_MAP = {
  'hai-chau': { name: 'Quận Hải Châu', city: 'Đà Nẵng' },
  'son-tra': { name: 'Quận Sơn Trà', city: 'Đà Nẵng' },
  'ngu-hanh-son': { name: 'Quận Ngũ Hành Sơn', city: 'Đà Nẵng' },
  'thanh-khe': { name: 'Quận Thanh Khê', city: 'Đà Nẵng' },
  'lien-chieu': { name: 'Quận Liên Chiểu', city: 'Đà Nẵng' },
  'cam-le': { name: 'Quận Cẩm Lệ', city: 'Đà Nẵng' },
  'hoa-vang': { name: 'Huyện Hòa Vang', city: 'Đà Nẵng' },
  'hoang-sa': { name: 'Huyện Hoàng Sa', city: 'Đà Nẵng' }
};

// Danh mục thực thể địa danh và dự án BĐS tiêu biểu tại TP. Đà Nẵng
export const KNOWN_ENTITIES = {
  'the-filmore': 'The Filmore Đà Nẵng',
  'sun-cosmo-residence': 'Sun Cosmo Residence',
  'sun-ponte-residence': 'Sun Ponte Residence',
  'nam-hoa-xuan': 'KĐT Nam Hòa Xuân',
  'fpt-city': 'KĐT FPT City Đà Nẵng',
  'shantira': 'Shantira Beach Resort',
  'wyndham-soleil': 'Wyndham Soleil Danang',
  'the-sang-residence': 'The Sang Residence',
  'golden-hills': 'Golden Hills Đà Nẵng',
  'dragon-smart-city': 'Dragon Smart City',
  'ocean-villas': 'Ocean Villas Đà Nẵng',
  'hyatt-regency': 'Hyatt Regency Danang',
  'aria-danang': 'Aria Danang Hotel & Resort',
  'monarchy': 'Chung cư Monarchy Đà Nẵng',
  'hiyori': 'Hiyori Garden Tower',
  'thach-thang': 'Thạch Thang',
  'hai-chau-1': 'Hải Châu 1',
  'hai-chau-2': 'Hải Châu 2',
  'binh-thuan': 'Bình Thuận',
  'hoa-cuong-bac': 'Hòa Cường Bắc',
  'hoa-cuong-nam': 'Hòa Cường Nam',
  'thuan-phuoc': 'Thuận Phước',
  'phuoc-ninh': 'Phước Ninh',
  'an-hai-bac': 'An Hải Bắc',
  'an-hai-tay': 'An Hải Tây',
  'phuoc-my': 'Phước Mỹ',
  'man-thai': 'Mân Thái',
  'tho-quang': 'Thọ Quang',
  'my-an': 'Mỹ An',
  'khue-my': 'Khuê Mỹ',
  'hoa-quy': 'Hòa Quý',
  'hoa-hai': 'Hòa Hải',
  'vinh-trung': 'Vĩnh Trung',
  'hoa-minh': 'Hòa Minh',
  'hoa-khanh': 'Hòa Khánh',
  'khue-trung': 'Khuê Trung',
  'hoa-xuan': 'Hòa Xuân',
  'hoa-chau': 'Hòa Châu'
};

/**
 * Chuyển đổi slug dự án/phường xã/địa danh thành Title có dấu hoặc viết hoa chuẩn
 */
export const slugToTitleCase = (slug) => {
  if (!slug) return '';
  const clean = slug.toLowerCase().replace(/^phuong-|^du-an-|^quan-|^huyen-/, '');
  if (KNOWN_ENTITIES[clean]) return KNOWN_ENTITIES[clean];
  if (KNOWN_ENTITIES[slug.toLowerCase()]) return KNOWN_ENTITIES[slug.toLowerCase()];
  return clean
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
 * Xây dựng URL chuẩn Technical SEO Bất Động Sản (SEO URL Structure Standard)
 * Hỗ trợ phân tầng: Nhu cầu -> Loại hình -> Địa lý (Tỉnh/Quận/Phường) -> Dự án -> Bộ lọc đơn -> Multi-filter
 * 
 * @param {Object} options
 * @param {'sale'|'rent'} [options.demand='sale']
 * @param {string} [options.propertyType] - 'apartment' | 'house' | 'street-house' | 'villa' | 'land' | 'shophouse' | 'office'
 * @param {string} [options.city] - 'da-nang' | 'Đà Nẵng'...
 * @param {string} [options.district] - 'quan-hai-chau' | 'Quận Hải Châu'...
 * @param {string} [options.ward] - 'phuong-thach-thang' | 'Phường Thạch Thang'...
 * @param {string} [options.project] - 'du-an-the-filmore' | 'The Filmore'...
 * @param {string} [options.priceRange] - 'tu-2-den-5-ty' | '2b-5b' | 'duoi-2-ty'...
 * @param {string} [options.areaRange] - '50-100' | 'tu-50-den-100-m2' | 'under-50'...
 * @param {string|number} [options.bedroom] - 1 | 2 | 3 | '4+'...
 * @param {Object} [options.extraParams] - các tham số query phụ khác
 * @returns {string} Clean URL hoặc URL kèm Query Parameters cho Multi-filter
 */
export const buildSeoUrl = ({
  demand = 'sale',
  propertyType = null,
  city = null,
  district = null,
  ward = null,
  project = null,
  priceRange = null,
  areaRange = null,
  bedroom = null,
  extraParams = {}
} = {}) => {
  const isRent = demand === 'rent';
  const group = BATDONGSAN_TAXONOMY[isRent ? 'rent' : 'sale'] || BATDONGSAN_TAXONOMY.sale;

  // 1. Base slug theo loại hình
  let basePath = '';
  if (propertyType && group.types[propertyType]) {
    basePath = (propertyType === 'house' && !city && !district && !ward && !project)
      ? (isRent ? '/cho-thue-nha-rieng-nha-pho' : '/ban-nha-rieng-nha-pho')
      : group.types[propertyType].slug;
  } else {
    basePath = group.base;
  }

  // 2. Dự án (Ưu tiên cao nhất)
  let locationOrProjectSegment = '';
  if (project && project.trim()) {
    let projSlug = toVietnameseSlug(project.trim()).replace(/^du-an-/, '');
    locationOrProjectSegment = `-du-an-${projSlug}`;
  } 
  // 3. Phường/Xã (Cấp 3)
  else if (ward && ward.trim()) {
    let wardSlug = toVietnameseSlug(ward.trim()).replace(/^phuong-/, '');
    let distShort = '';
    if (district && district.trim()) {
      distShort = toVietnameseSlug(district.trim()).replace(/^quan-|^huyen-|^tp-/, '');
    }
    locationOrProjectSegment = distShort ? `-phuong-${wardSlug}-${distShort}` : `-phuong-${wardSlug}`;
  } 
  // 4. Quận/Huyện (Cấp 2)
  else if (district && district.trim()) {
    let distSlug = toVietnameseSlug(district.trim());
    if (!distSlug.startsWith('quan-') && !distSlug.startsWith('huyen-') && !distSlug.startsWith('tp-')) {
      distSlug = `quan-${distSlug}`;
    }
    locationOrProjectSegment = `-${distSlug}`;
  } 
  // 5. Tỉnh/Thành phố (Cấp 1)
  else if (city && city.trim()) {
    const citySlug = CITY_SLUGS[city.trim()] || toVietnameseSlug(city.trim());
    locationOrProjectSegment = `-${citySlug}`;
  }

  let fullCleanPath = `${basePath}${locationOrProjectSegment}`;
  const queryParams = new URLSearchParams();

  // 6. Xử lý Single Clean Filter & Multi-filter
  let priceCleanSlug = '';
  if (priceRange && priceRange !== 'all') {
    if (priceRange === 'under-2b') priceCleanSlug = '-gia-duoi-2-ty';
    else if (priceRange === '2b-5b') priceCleanSlug = '-gia-tu-2-den-5-ty';
    else if (priceRange === '5b-10b') priceCleanSlug = '-gia-tu-5-den-10-ty';
    else if (priceRange === '10b-30b') priceCleanSlug = '-gia-tu-10-den-30-ty';
    else if (priceRange === 'over-30b') priceCleanSlug = '-gia-tren-30-ty';
    else if (priceRange.startsWith('gia-') || priceRange.startsWith('tu-')) {
      priceCleanSlug = `-${toVietnameseSlug(priceRange)}`;
    } else {
      const dynMatch = priceRange.match(/^([0-9.]+)[bB]-([0-9.]+)[bB]$/);
      if (dynMatch) {
        priceCleanSlug = `-gia-tu-${dynMatch[1]}-den-${dynMatch[2]}-ty`;
      } else {
        priceCleanSlug = `-gia-${toVietnameseSlug(priceRange)}`;
      }
    }
  }

  let areaCleanSlug = '';
  if (areaRange && areaRange !== 'all') {
    if (areaRange === 'under-50') areaCleanSlug = '-dien-tich-duoi-50-m2';
    else if (areaRange === '50-100') areaCleanSlug = '-dien-tich-50-100-m2';
    else if (areaRange === '100-200') areaCleanSlug = '-dien-tich-100-200-m2';
    else if (areaRange === 'over-200') areaCleanSlug = '-dien-tich-tren-200-m2';
    else if (areaRange.startsWith('dien-tich-')) {
      areaCleanSlug = `-${toVietnameseSlug(areaRange)}`;
    } else {
      areaCleanSlug = `-dien-tich-${toVietnameseSlug(areaRange)}-m2`;
    }
  }

  if (priceCleanSlug) {
    fullCleanPath += priceCleanSlug;
    if (areaCleanSlug) {
      queryParams.set('areaRange', areaRange);
    }
  } else if (areaCleanSlug) {
    fullCleanPath += areaCleanSlug;
  }

  if (bedroom && bedroom !== 'all') queryParams.set('bedroom', String(bedroom));
  if (extraParams && typeof extraParams === 'object') {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        queryParams.set(k, String(v));
      }
    }
  }

  const qs = queryParams.toString();
  return qs ? `${fullCleanPath}?${qs}` : fullCleanPath;
};

/**
 * Phân tích URL danh mục (Taxonomy URL) theo chuẩn Batdongsan.com.vn & Clean Slug SEO URLs
 * Ví dụ:
 * - /ban-can-ho-chung-cu-da-nang -> { isTaxonomy: true, demand: 'sale', propertyType: 'apartment', city: 'Đà Nẵng', ... }
 * - /ban-can-ho-chung-cu-quan-hai-chau -> { isTaxonomy: true, demand: 'sale', propertyType: 'apartment', district: 'Quận Hải Châu', city: 'Đà Nẵng' }
 * - /ban-can-ho-chung-cu-phuong-thach-thang-hai-chau -> { isTaxonomy: true, ward: 'Phường Thạch Thang', district: 'Quận Hải Châu' }
 * - /ban-can-ho-chung-cu-du-an-the-filmore -> { isTaxonomy: true, project: 'The Filmore' }
 * - /ban-can-ho-chung-cu-quan-hai-chau-gia-tu-2-den-5-ty -> { isTaxonomy: true, priceRange: '2b-5b' }
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
      // Khớp chính xác loại hình hoặc alias
      if (clean === typeInfo.slug || 
          (typeKey === 'house' && clean === '/ban-nha-rieng-nha-pho' && demand === 'sale') ||
          (typeKey === 'house' && clean === '/cho-thue-nha-rieng-nha-pho' && demand === 'rent') ||
          (typeKey === 'villa' && clean === '/ban-nha-biet-thu-lien-ke' && demand === 'sale') ||
          (typeKey === 'villa' && clean === '/cho-thue-nha-biet-thu-lien-ke' && demand === 'rent') ||
          (typeKey === 'shophouse' && clean === '/ban-shophouse' && demand === 'sale') ||
          (typeKey === 'warehouse' && clean === '/cho-thue-kho-nha-xuong-dat' && demand === 'rent')) {
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

    // B. PropertyType (Nhận diện chính xác 12 danh mục chuẩn SEO)
    let propertyType = 'all';
    if (raw.includes('chung-cu-mini-can-ho-dich-vu') || raw.includes('chung-cu-mini')) propertyType = 'mini-apartment';
    else if (raw.includes('can-ho-chung-cu') || raw.includes('chung-cu')) propertyType = 'apartment';
    else if (raw.includes('nha-biethu-lien-ke') || raw.includes('nha-biet-thu') || raw.includes('biet-thu')) propertyType = 'villa';
    else if (raw.includes('nha-mat-pho')) propertyType = 'street-house';
    else if (raw.includes('shophouse-nha-pho-thuong-mai') || raw.includes('shophouse')) propertyType = 'shophouse';
    else if (raw.includes('dat-nen-du-an')) propertyType = 'project-land';
    else if (raw.includes('trang-trai-khu-nghi-duong') || raw.includes('trang-trai')) propertyType = 'farm-resort';
    else if (raw.includes('condotel')) propertyType = 'condotel';
    else if (raw.includes('kho-nha-xuong') || raw.includes('kho-xuong')) propertyType = 'warehouse';
    else if (raw.includes('bat-dong-san-khac')) propertyType = 'other';
    else if (raw.includes('van-phong') || raw.includes('mat-bang-van-phong')) propertyType = 'office';
    else if (raw.includes('nha-rieng')) propertyType = 'house';
    else if (raw.includes('-dat-') || raw.endsWith('-dat') || raw.startsWith('ban-dat') || raw.startsWith('cho-thue-dat')) propertyType = 'land';


    // C. Dự án (Project)
    let project = '';
    const projMatch = raw.match(/du-an-([a-z0-9-]+)/);
    if (projMatch) {
      project = slugToTitleCase(projMatch[1]);
    }

    // D. Phường/Xã (Ward)
    let ward = '';
    const wardMatch = raw.match(/phuong-([a-z0-9-]+?)(?:-(?:quan|huyen|hai-chau|son-tra|ngu-hanh-son|lien-chieu|thanh-khe|cam-le|hoa-vang|da-nang|$))/);
    if (wardMatch) {
      ward = 'Phường ' + slugToTitleCase(wardMatch[1]);
    }

    // E. Thành phố & Quận/Huyện TP. Đà Nẵng
    let city = 'Đà Nẵng';
    let district = '';

    // Đối chiếu các quận huyện Đà Nẵng
    for (const [dSlug, dInfo] of Object.entries(DISTRICT_MAP)) {
      if (raw.includes(`quan-${dSlug}`) || raw.includes(`huyen-${dSlug}`) || raw.includes(`tp-${dSlug}`) || raw.includes(dSlug)) {
        district = dInfo.name;
        city = dInfo.city || 'Đà Nẵng';
        break;
      }
    }

    // F. Số phòng ngủ (PN)
    let bedroom = 'all';
    const bedMatch = raw.match(/(?:^|-)([0-9]+(?:\+)?)-?pn(?:-|$)/i) || raw.match(/([0-9]+(?:\+)?)\s*-?pn/i);
    if (bedMatch) bedroom = bedMatch[1];

    // G. Khoảng giá (Pricing Tier)
    let priceRange = 'all';
    let priceLabel = '';
    let minPrice = null;
    let maxPrice = null;

    // Hỗ trợ cả các dạng slug:
    // - tu-7-ty-den-10-ty, gia-tu-7-den-10-ty, tu-7-den-10-ty, 7-ty-den-10-ty, 7-den-10-ty
    // - tu-500-trieu-den-1-ty, tu-500-den-800-trieu
    // - duoi-2-ty, duoi-500-trieu, gia-duoi-2-ty
    // - tren-30-ty, gia-tren-30-ty, tren-500-trieu
    const priceBetweenMatch = raw.match(/(?:gia-)?(?:tu-)?([0-9.]+)(?:-(ty|trieu))?-den-([0-9.]+)-(ty|trieu)/);
    const priceUnderMatch = raw.match(/(?:gia-)?duoi-([0-9.]+)-(ty|trieu)/);
    const priceOverMatch = raw.match(/(?:gia-)?tren-([0-9.]+)-(ty|trieu)/);

    if (priceBetweenMatch) {
      const minVal = parseFloat(priceBetweenMatch[1]);
      const minUnit = priceBetweenMatch[2]; // 'ty' | 'trieu' | undefined
      const maxVal = parseFloat(priceBetweenMatch[3]);
      const maxUnit = priceBetweenMatch[4]; // 'ty' | 'trieu'

      // Nếu không có minUnit (ví dụ: tu-7-den-10-ty), thừa hưởng đơn vị từ maxUnit
      const actualMinUnit = minUnit || maxUnit;
      const minMultiplier = actualMinUnit === 'trieu' ? 1000000 : 1000000000;
      const maxMultiplier = maxUnit === 'trieu' ? 1000000 : 1000000000;

      minPrice = minVal * minMultiplier;
      maxPrice = maxVal * maxMultiplier;

      const minUnitText = actualMinUnit === 'trieu' ? 'triệu' : 'tỷ';
      const maxUnitText = maxUnit === 'trieu' ? 'triệu' : 'tỷ';
      if (actualMinUnit === maxUnit) {
        priceLabel = `giá từ ${minVal} đến ${maxVal} ${maxUnitText}`;
      } else {
        priceLabel = `giá từ ${minVal} ${minUnitText} đến ${maxVal} ${maxUnitText}`;
      }

      // Khớp chuẩn các preset hệ thống nếu min-max khớp hoàn hảo
      if (minVal === 0 && maxVal === 2 && maxUnit === 'ty') {
        priceRange = 'under-2b';
      } else if (minVal === 2 && maxVal === 5 && actualMinUnit === 'ty' && maxUnit === 'ty') {
        priceRange = '2b-5b';
      } else if (minVal === 5 && maxVal === 10 && actualMinUnit === 'ty' && maxUnit === 'ty') {
        priceRange = '5b-10b';
      } else if (minVal === 10 && maxVal === 30 && actualMinUnit === 'ty' && maxUnit === 'ty') {
        priceRange = '10b-30b';
      } else {
        // Dải giá động (ví dụ: 7b-10b, 3b-5b, 500m-1b)
        priceRange = `${minVal}${actualMinUnit === 'trieu' ? 'm' : 'b'}-${maxVal}${maxUnit === 'trieu' ? 'm' : 'b'}`;
      }
    } else if (priceUnderMatch) {
      const maxVal = parseFloat(priceUnderMatch[1]);
      const unit = priceUnderMatch[2];
      const unitText = unit === 'trieu' ? 'triệu' : 'tỷ';
      maxPrice = maxVal * (unit === 'trieu' ? 1000000 : 1000000000);
      priceLabel = `giá dưới ${maxVal} ${unitText}`;
      if (unit === 'ty' && maxVal <= 2) {
        priceRange = 'under-2b';
      } else if (unit === 'ty') {
        priceRange = `under-${maxVal}b`;
      } else {
        priceRange = `under-${maxVal}m`;
      }
    } else if (priceOverMatch) {
      const minVal = parseFloat(priceOverMatch[1]);
      const unit = priceOverMatch[2];
      const unitText = unit === 'trieu' ? 'triệu' : 'tỷ';
      minPrice = minVal * (unit === 'trieu' ? 1000000 : 1000000000);
      priceLabel = `giá trên ${minVal} ${unitText}`;
      if (unit === 'ty' && minVal >= 30) {
        priceRange = 'over-30b';
      } else if (unit === 'ty') {
        priceRange = `over-${minVal}b`;
      } else {
        priceRange = `over-${minVal}m`;
      }
    } else if (raw.includes('gia-re')) {
      priceRange = 'under-2b';
      maxPrice = 2000000000;
      priceLabel = 'giá rẻ';
    }

    // H. Diện tích (Area Range)
    let areaRange = 'all';
    let areaLabel = '';
    let minArea = null;
    let maxArea = null;
    const areaBetweenMatch = raw.match(/(?:dien-tich-)?(?:tu-)?([0-9.]+)(?:-m2)?-(?:den-)?([0-9.]+)-m2/);
    const areaUnderMatch = raw.match(/(?:dien-tich-)?duoi-([0-9.]+)-m2/);
    const areaOverMatch = raw.match(/(?:dien-tich-)?tren-([0-9.]+)-m2/);

    if (areaBetweenMatch) {
      const minVal = parseFloat(areaBetweenMatch[1]);
      const maxVal = parseFloat(areaBetweenMatch[2]);
      minArea = minVal;
      maxArea = maxVal;
      areaLabel = `diện tích ${minVal} - ${maxVal} m²`;
      if (minVal === 0 && maxVal === 50) areaRange = 'under-50';
      else if (minVal === 50 && maxVal === 100) areaRange = '50-100';
      else if (minVal === 100 && maxVal === 200) areaRange = '100-200';
      else areaRange = `${minVal}-${maxVal}`;
    } else if (areaUnderMatch) {
      const maxVal = parseFloat(areaUnderMatch[1]);
      maxArea = maxVal;
      areaLabel = `diện tích dưới ${maxVal} m²`;
      if (maxVal <= 50) areaRange = 'under-50';
      else areaRange = `under-${maxVal}`;
    } else if (areaOverMatch) {
      const minVal = parseFloat(areaOverMatch[1]);
      minArea = minVal;
      areaLabel = `diện tích trên ${minVal} m²`;
      if (minVal >= 200) areaRange = 'over-200';
      else areaRange = `over-${minVal}`;
    }

    // I. Tiện ích & Từ khóa đặc biệt
    let keyword = project || (ward ? ward.replace('Phường ', '') : '');
    if (!keyword) {
      if (raw.includes('full-noi-that')) keyword = 'full nội thất';
      else if (raw.includes('co-ban-cong') || raw.includes('ban-cong')) keyword = 'ban công';
      else if (raw.includes('so-do') || raw.includes('so-hong')) keyword = 'sổ đỏ';
    }

    // J. Sinh Title SEO chuẩn tiếng Việt có dấu
    let typeName = '';
    if (propertyType && propertyType !== 'all' && BATDONGSAN_TAXONOMY[demand]?.types[propertyType]) {
      typeName = BATDONGSAN_TAXONOMY[demand].types[propertyType].name;
    } else {
      typeName = demand === 'sale' ? 'Mua Bán Nhà Đất' : 'Cho Thuê Nhà Đất';
    }

    let title = typeName;
    if (project) {
      title += ` tại Dự án ${project}`;
      if (district) title += `, ${district}`;
      if (city) title += `, ${city}`;
    } else if (ward && district) {
      title += ` tại ${ward}, ${district}`;
      if (city) title += `, ${city}`;
    } else if (district) {
      title += ` tại ${district}`;
      if (city) title += `, ${city}`;
    } else if (city) {
      title += ` tại ${city}`;
    }

    if (priceLabel) title += ` ${priceLabel}`;
    if (areaLabel) title += ` ${areaLabel}`;
    if (bedroom !== 'all') title += ` ${bedroom} phòng ngủ`;

    return {
      isTaxonomy: true,
      isFacetedCleanSlug: true,
      demand,
      propertyType,
      city,
      district,
      ward,
      project,
      bedroom,
      priceRange,
      minPrice,
      maxPrice,
      priceLabel,
      areaRange,
      minArea,
      maxArea,
      areaLabel,
      keyword,
      title,
      canonicalUrl: clean
    };
  }

  return { isTaxonomy: false };
};

/**
 * Định dạng nhãn hiển thị cho bộ lọc mức giá thân thiện chuẩn tiếng Việt
 */
export const formatPriceRangeText = (priceRange, label = '') => {
  if (label) {
    return label.replace(/^giá\s+/i, '');
  }
  if (!priceRange || priceRange === 'all') return 'Mọi mức giá';
  if (priceRange === 'under-2b') return 'Dưới 2 tỷ';
  if (priceRange === '2b-5b') return '2 - 5 tỷ';
  if (priceRange === '5b-10b') return '5 - 10 tỷ';
  if (priceRange === '10b-30b') return '10 - 30 tỷ';
  if (priceRange === 'over-30b') return 'Trên 30 tỷ';

  // Dynamic formats: ví dụ '7b-10b', '3b-5b', '500m-1b'
  const dynBetween = priceRange.match(/^([0-9.]+)([bm])-([0-9.]+)([bm])$/i);
  if (dynBetween) {
    const minUnit = dynBetween[2].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
    const maxUnit = dynBetween[4].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
    if (minUnit === maxUnit) {
      return `${dynBetween[1]} - ${dynBetween[3]} ${maxUnit}`;
    }
    return `${dynBetween[1]} ${minUnit} - ${dynBetween[3]} ${maxUnit}`;
  }

  const dynUnder = priceRange.match(/^under-([0-9.]+)([bm])$/i);
  if (dynUnder) {
    const unit = dynUnder[2].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
    return `Dưới ${dynUnder[1]} ${unit}`;
  }

  const dynOver = priceRange.match(/^over-([0-9.]+)([bm])$/i);
  if (dynOver) {
    const unit = dynOver[2].toLowerCase() === 'm' ? 'triệu' : 'tỷ';
    return `Trên ${dynOver[1]} ${unit}`;
  }

  return priceRange;
};

/**
 * Định dạng nhãn hiển thị cho bộ lọc diện tích thân thiện chuẩn tiếng Việt
 */
export const formatAreaRangeText = (areaRange, label = '') => {
  if (label) {
    return label.replace(/^diện tích\s+/i, '');
  }
  if (!areaRange || areaRange === 'all') return 'Mọi diện tích';
  if (areaRange === 'under-50') return 'Dưới 50 m²';
  if (areaRange === '50-100') return '50 - 100 m²';
  if (areaRange === '100-200') return '100 - 200 m²';
  if (areaRange === 'over-200') return 'Trên 200 m²';

  const dynBetween = areaRange.match(/^([0-9.]+)-([0-9.]+)$/);
  if (dynBetween) {
    return `${dynBetween[1]} - ${dynBetween[2]} m²`;
  }

  const dynUnder = areaRange.match(/^under-([0-9.]+)$/);
  if (dynUnder) {
    return `Dưới ${dynUnder[1]} m²`;
  }

  const dynOver = areaRange.match(/^over-([0-9.]+)$/);
  if (dynOver) {
    return `Trên ${dynOver[1]} m²`;
  }

  return `${areaRange} m²`;
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
 * Tích hợp trực tiếp với bộ quy tắc buildSeoUrl chuẩn Technical SEO
 * Hỗ trợ các trường hợp Breadcrumb & Faceted Navigation:
 * - Cấp Loại hình: /ban-nha-rieng-nha-pho (hoặc /ban-can-ho-chung-cu, /cho-thue-can-ho-chung-cu)
 * - Cấp Tỉnh/Thành: /ban-nha-rieng-ha-noi
 * - Cấp Quận/Huyện: /ban-nha-rieng-quan-ba-dinh
 */
export const getCategoryPermalink = (demand = 'sale', propertyType = null, cityName = null, districtName = null) => {
  return buildSeoUrl({
    demand,
    propertyType,
    city: cityName,
    district: districtName
  });
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

