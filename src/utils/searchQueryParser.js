import { VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData.js';
import { removeAccents } from './propertyFilter.js';
import { buildSeoUrl } from './permalink.js';

/**
 * Từ điển phân loại loại hình BĐS và các từ khóa nhận diện chuẩn Batdongsan
 */
const TYPE_DETECTION_RULES = [
  {
    id: 'street-house',
    keywords: ['nha mat pho', 'nha mat tien', 'mat pho', 'mat tien kinh doanh', 'mat tien']
  },
  {
    id: 'apartment',
    keywords: ['chung cu cao cap', 'can ho chung cu', 'chung cu mini', 'chung cu', 'can ho', 'tap the', 'studio', 'condotel', 'duplex', 'penthouse', 'officetel']
  },
  {
    id: 'villa',
    keywords: ['biet thu', 'villa', 'lien ke', 'dinh thu']
  },
  {
    id: 'project-land',
    keywords: ['dat nen du an', 'dat nen', 'dat du an', 'dat phan lo']
  },
  {
    id: 'shophouse',
    keywords: ['shophouse', 'nha pho thuong mai']
  },
  {
    id: 'retail',
    keywords: ['mat bang kinh doanh', 'mat bang', 'cua hang', 'kiot']
  },
  {
    id: 'office',
    keywords: ['van phong', 'toa nha van phong', 'coworking']
  },
  {
    id: 'room',
    keywords: ['phong tro', 'nha tro', 'phong cho thue', 'thue phong', 'tim phong', 'phong ktx']
  },
  {
    id: 'warehouse',
    keywords: ['kho xuong', 'nha xuong', 'kho bai', 'kho']
  },
  {
    id: 'land',
    keywords: ['dat tho cu', 'dat o', 'dat vuon', 'ban dat', 'mua dat', 'dat']
  },
  {
    id: 'house',
    keywords: ['nha rieng', 'nha pho', 'nha cap 4', 'nha hem', 'ban nha', 'mua nha', 'nha o', 'nha']
  }
];

/**
 * Danh sách toàn bộ các từ khóa loại hình để dọn sạch residual keyword
 */
const ALL_TYPE_KEYWORDS = TYPE_DETECTION_RULES.flatMap(r => r.keywords).sort((a, b) => b.length - a.length);

/**
 * Trích xuất nhu cầu giao dịch (Demand: sale | rent)
 */
export function extractDemand(cleanText, defaultDemand = 'sale') {
  if (/\b(cho thue|thue|can thue|muon)\b/.test(cleanText)) {
    return { demand: 'rent', matched: cleanText.match(/\b(cho thue|thue|can thue|muon)\b/)?.[0] || '' };
  }
  if (/\b(ban|mua ban|can mua|mua)\b/.test(cleanText)) {
    return { demand: 'sale', matched: cleanText.match(/\b(ban|mua ban|can mua|mua)\b/)?.[0] || '' };
  }
  return { demand: defaultDemand, matched: '' };
}

/**
 * Trích xuất loại hình BĐS từ chuỗi tìm kiếm
 */
export function extractPropertyType(cleanText) {
  for (const rule of TYPE_DETECTION_RULES) {
    for (const kw of rule.keywords) {
      const regex = new RegExp(`(^|\\s)${kw}($|\\s)`);
      if (regex.test(cleanText)) {
        return { propertyType: rule.id, matched: kw };
      }
    }
  }
  return { propertyType: null, matched: '' };
}

/**
 * Trích xuất khoảng giá (Price Range) từ văn bản tiếng Việt
 */
export function extractPriceRange(cleanText) {
  // 1. Khoảng giá: từ X đến Y tỷ / X - Y tỷ
  const rangeTyMatch = cleanText.match(/(?:tu\s+)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi)\s*(\d+(?:[.,]\d+)?)\s*ty/);
  if (rangeTyMatch) {
    const minP = parseFloat(rangeTyMatch[1].replace(',', '.')) * 1e9;
    const maxP = parseFloat(rangeTyMatch[2].replace(',', '.')) * 1e9;
    return { minPrice: minP, maxPrice: maxP, priceRange: `${rangeTyMatch[1]}b-${rangeTyMatch[2]}b`, matched: rangeTyMatch[0] };
  }

  // Khoảng giá triệu: từ X đến Y triệu / X - Y triệu
  const rangeTrieuMatch = cleanText.match(/(?:tu\s+)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)/);
  if (rangeTrieuMatch) {
    const minP = parseFloat(rangeTrieuMatch[1].replace(',', '.')) * 1e6;
    const maxP = parseFloat(rangeTrieuMatch[2].replace(',', '.')) * 1e6;
    return { minPrice: minP, maxPrice: maxP, priceRange: `${rangeTrieuMatch[1]}m-${rangeTrieuMatch[2]}m`, matched: rangeTrieuMatch[0] };
  }

  // 2. Giá tối đa: dưới X tỷ / < X tỷ / đến X tỷ
  const underTyMatch = cleanText.match(/(?:duoi|<|<=|nho hon|tam|den)\s*(\d+(?:[.,]\d+)?)\s*ty/);
  if (underTyMatch) {
    const val = parseFloat(underTyMatch[1].replace(',', '.'));
    const maxP = val * 1e9;
    return { minPrice: null, maxPrice: maxP, priceRange: `under-${val}b`, matched: underTyMatch[0] };
  }

  // Giá tối đa triệu: dưới X triệu
  const underTrieuMatch = cleanText.match(/(?:duoi|<|<=|nho hon|tam|den)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)/);
  if (underTrieuMatch) {
    const val = parseFloat(underTrieuMatch[1].replace(',', '.'));
    const maxP = val * 1e6;
    return { minPrice: null, maxPrice: maxP, priceRange: `under-${val}m`, matched: underTrieuMatch[0] };
  }

  // 3. Giá tối thiểu: trên X tỷ / > X tỷ / từ X tỷ
  const overTyMatch = cleanText.match(/(?:tren|>|>=|lon hon|tu)\s*(\d+(?:[.,]\d+)?)\s*ty/);
  if (overTyMatch) {
    const val = parseFloat(overTyMatch[1].replace(',', '.'));
    const minP = val * 1e9;
    return { minPrice: minP, maxPrice: null, priceRange: `over-${val}b`, matched: overTyMatch[0] };
  }

  // Giá tối thiểu triệu: trên X triệu
  const overTrieuMatch = cleanText.match(/(?:tren|>|>=|lon hon|tu)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)/);
  if (overTrieuMatch) {
    const val = parseFloat(overTrieuMatch[1].replace(',', '.'));
    const minP = val * 1e6;
    return { minPrice: minP, maxPrice: null, priceRange: `over-${val}m`, matched: overTrieuMatch[0] };
  }

  return { minPrice: null, maxPrice: null, priceRange: null, matched: '' };
}

/**
 * Trích xuất diện tích (Area Range) từ văn bản
 */
export function extractAreaRange(cleanText) {
  const rangeMatch = cleanText.match(/(?:tu\s+)?(\d+(?:[.,]\d+)?)\s*(?:-|den|toi)\s*(\d+(?:[.,]\d+)?)\s*(?:m2|met vuong)/);
  if (rangeMatch) {
    const minA = parseFloat(rangeMatch[1]);
    const maxA = parseFloat(rangeMatch[2]);
    return { minArea: minA, maxArea: maxA, areaRange: `${minA}-${maxA}`, matched: rangeMatch[0] };
  }

  const underMatch = cleanText.match(/(?:duoi|<|<=)\s*(\d+(?:[.,]\d+)?)\s*(?:m2|met vuong)/);
  if (underMatch) {
    const val = parseFloat(underMatch[1]);
    return { minArea: null, maxArea: val, areaRange: `under-${val}`, matched: underMatch[0] };
  }

  const overMatch = cleanText.match(/(?:tren|>|>=)\s*(\d+(?:[.,]\d+)?)\s*(?:m2|met vuong)/);
  if (overMatch) {
    const val = parseFloat(overMatch[1]);
    return { minArea: val, maxArea: null, areaRange: `over-${val}`, matched: overMatch[0] };
  }

  return { minArea: null, maxArea: null, areaRange: null, matched: '' };
}

/**
 * Trích xuất số phòng ngủ: 1pn, 2 phòng ngủ, 3pn
 */
export function extractBedrooms(cleanText) {
  const match = cleanText.match(/(\d+)\s*(?:phong ngu|pn)/);
  if (match) {
    const count = parseInt(match[1], 10);
    return { bedroom: count >= 4 ? '4+' : String(count), matched: match[0] };
  }
  return { bedroom: null, matched: '' };
}

/**
 * Trích xuất hướng nhà: đông nam, tây bắc, tây tứ trạch, v.v.
 */
export function extractDirection(cleanText) {
  const dirs = [
    { label: 'Đông Nam', kw: 'dong nam' },
    { label: 'Tây Nam', kw: 'tay nam' },
    { label: 'Đông Bắc', kw: 'dong bac' },
    { label: 'Tây Bắc', kw: 'tay bac' },
    { label: 'Đông', kw: 'dong' },
    { label: 'Tây', kw: 'tay' },
    { label: 'Nam', kw: 'nam' },
    { label: 'Bắc', kw: 'bac' }
  ];

  for (const d of dirs) {
    const regex = new RegExp(`(?:huong\\s+)?${d.kw}\\b`);
    if (regex.test(cleanText)) {
      const match = cleanText.match(regex);
      return { direction: d.label, matched: match ? match[0] : d.kw };
    }
  }
  return { direction: null, matched: '' };
}

/**
 * Trích xuất địa danh hành chính (Tỉnh/Thành, Quận/Huyện, Phường/Xã, Tuyến đường, Dự án)
 * Ưu tiên:
 * 1. Tỉnh/Thành phố & Quận/Huyện (Cấp hành chính chính)
 * 2. Phường/Xã
 * 3. Dự án (Projects)
 * 4. Tuyến đường (Chỉ nhận diện khi có tiền tố đường/phố hoặc không trùng Tỉnh/Quận)
 */
export function extractLocation(cleanText, currentCity = '') {
  // 0. Nếu có tiền tố đường/phố rõ ràng (ví dụ: "đường an dương vương", "phố huế"), ưu tiên kiểm tra tuyến đường trước
  // để tránh bị nhận nhầm thành Quận/Huyện (như "Huyện An Dương" ở Hải Phòng)
  const hasStreetPrefix = /\b(?:duong|pho|tuyen)\s+/i.test(cleanText);
  if (hasStreetPrefix) {
    const sortedCities = currentCity 
      ? [...VIETNAM_ADMINISTRATIVE_DATA].sort((a, b) => (a.name === currentCity ? -1 : (b.name === currentCity ? 1 : 0)))
      : VIETNAM_ADMINISTRATIVE_DATA;

    for (const city of sortedCities) {
      if (!city.districts) continue;
      for (const dist of city.districts) {
        if (!dist.streets) continue;
        for (const street of dist.streets) {
          const streetClean = removeAccents(street).toLowerCase().replace(/^(?:duong|pho|tuyen)\s+/i, '').trim();
          const withPrefix = `duong ${streetClean}`;
          const withPho = `pho ${streetClean}`;
          // Không match "pho ..." nếu nó đứng ngay sau "mat " (vì "mat pho" là loại hình nhà mặt phố)
          const isMatPho = cleanText.includes(`mat ${withPho}`);
          const hasStreetPrefix = cleanText.includes(withPrefix) || (cleanText.includes(withPho) && !isMatPho);
          if (hasStreetPrefix) {
            // Nếu tên đường trùng với tên tỉnh/thành phố lớn (như 'da nang', 'ha noi', 'hai phong', 'ho chi minh')
            // và không có từ "duong" ở phía trước thì ưu tiên nhận diện là Thành phố, không phải tên đường của tỉnh khác
            const isCityCollision = ['da nang', 'ha noi', 'hai phong', 'ho chi minh', 'sai gon'].includes(streetClean);
            if (isCityCollision && !cleanText.includes(withPrefix)) {
              continue;
            }
            return {
              city: city.name,
              district: dist.name,
              project: '',
              ward: '',
              street: street,
              matched: cleanText.includes(withPrefix) ? withPrefix : withPho
            };
          }
        }
      }
    }
  }

  // 1. Kiểm tra Tỉnh / Thành phố trước (Đặc biệt: Đà Nẵng, Hà Nội, Hồ Chí Minh, Hải Phòng...)
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    const cityClean = removeAccents(city.name).toLowerCase();
    const cityCore = cityClean.replace(/^(tp\.|thanh pho|tinh)\s*/i, '');
    const regexFull = new RegExp(`(^|\\s)${cityClean}($|\\s)`);
    const regexCore = new RegExp(`(^|\\s)${cityCore}($|\\s)`);

    if (regexFull.test(cleanText) || (cityCore.length >= 3 && regexCore.test(cleanText))) {
      const matchedCity = regexFull.test(cleanText) ? cityClean : cityCore;

      // Tìm xem có Quận/Huyện nào thuộc thành phố này được nhắc đến không
      if (city.districts) {
        for (const dist of city.districts) {
          const distClean = removeAccents(dist.name).toLowerCase();
          const distCore = distClean.replace(/^(quan|huyen|thi xa|tp\.|thanh pho|tp)\s+/i, '');
          const dFull = new RegExp(`(^|\\s)${distClean}($|\\s)`);
          const dCore = new RegExp(`(^|\\s)${distCore}($|\\s)`);

          if (dFull.test(cleanText) || (distCore.length >= 3 && dCore.test(cleanText))) {
            const matchedDist = dFull.test(cleanText) ? distClean : distCore;
            return {
              city: city.name,
              district: dist.name,
              project: '',
              ward: '',
              street: '',
              matched: `${matchedCity} ${matchedDist}`
            };
          }
        }
      }

      return {
        city: city.name,
        district: '',
        project: '',
        ward: '',
        street: '',
        matched: matchedCity
      };
    }
  }

  // 2. Xử lý alias Tỉnh/Thành phố (Sài Gòn, TP.HCM, SG -> TP. Hồ Chí Minh)
  if (/\b(sai gon|tp hcm|tphcm|sg)\b/.test(cleanText)) {
    const match = cleanText.match(/\b(sai gon|tp hcm|tphcm|sg)\b/);
    return { city: 'TP. Hồ Chí Minh', district: '', project: '', ward: '', street: '', matched: match ? match[0] : 'sai gon' };
  }

  // 3. Kiểm tra Quận / Huyện độc lập (VD: 'Bình Thạnh', 'Cầu Giấy', 'Hải Châu', 'Sơn Trà', 'Gò Vấp', 'Quận 1', 'Nha Trang')
  const allDistricts = [];
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    if (city.districts) {
      for (const dist of city.districts) {
        const distClean = removeAccents(dist.name).toLowerCase();
        const distCore = distClean.replace(/^(quan|huyen|thi xa|tp\.|thanh pho|tp)\s+/i, '');
        allDistricts.push({ city: city.name, district: dist.name, distClean, distCore });
      }
    }
  }
  allDistricts.sort((a, b) => b.distCore.length - a.distCore.length);

  for (const item of allDistricts) {
    const regexFull = new RegExp(`(^|\\s)${item.distClean}($|\\s)`);
    const regexCore = new RegExp(`(^|\\s)${item.distCore}($|\\s)`);
    if (regexFull.test(cleanText)) {
      return {
        city: item.city,
        district: item.district,
        project: '',
        ward: '',
        street: '',
        matched: item.distClean
      };
    }
    if (item.distCore.length >= 3 && regexCore.test(cleanText)) {
      return {
        city: item.city,
        district: item.district,
        project: '',
        ward: '',
        street: '',
        matched: item.distCore
      };
    }
  }

  // 4. Kiểm tra Dự án nổi bật (Vinhomes, Landmark, Sun Ponte, Hòa Xuân...)
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    if (city.districts) {
      for (const dist of city.districts) {
        if (dist.projects) {
          for (const proj of dist.projects) {
            const projClean = removeAccents(proj).toLowerCase();
            if (projClean && cleanText.includes(projClean)) {
              return {
                city: city.name,
                district: dist.name,
                project: proj,
                ward: '',
                street: '',
                matched: projClean
              };
            }
          }
        }
      }
    }
  }

  // 5. Kiểm tra Phường / Xã
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    if (city.districts) {
      for (const dist of city.districts) {
        if (dist.wards) {
          for (const ward of dist.wards) {
            const wardClean = removeAccents(ward).toLowerCase();
            const wardCore = wardClean.replace(/^(phuong|xa|thi tran)\s+/i, '');

            // Bỏ qua các từ trùng với từ khóa nhu cầu hoặc từ dừng tiếng Việt (VD: "cho" trong "cho thue", "ban", "thue")
            if (['cho', 'ban', 'thue', 'mua', 'nha', 'dat'].includes(wardCore)) {
              const wFullCheck = new RegExp(`(^|\\s)${wardClean}($|\\s)`);
              if (!wFullCheck.test(cleanText)) {
                continue;
              }
            }

            const wFull = new RegExp(`(^|\\s)${wardClean}($|\\s)`);
            const wCore = new RegExp(`(^|\\s)${wardCore}($|\\s)`);
            if (wFull.test(cleanText) || (wardCore.length >= 4 && wCore.test(cleanText))) {
              const matchedStr = wFull.test(cleanText) ? wardClean : wardCore;
              return {
                city: city.name,
                district: dist.name,
                project: '',
                ward: ward,
                street: '',
                matched: matchedStr
              };
            }
          }
        }
      }
    }
  }

  // 6. Tuyến đường (Có tiền tố 'duong' / 'pho' hoặc tên đường đặc trưng từ 4 ký tự)
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    if (city.districts) {
      for (const dist of city.districts) {
        if (dist.streets) {
          for (const street of dist.streets) {
            const streetClean = removeAccents(street).toLowerCase().replace(/^(?:duong|pho|tuyen)\s+/i, '').trim();
            const withPrefix = `duong ${streetClean}`;
            const withPho = `pho ${streetClean}`;
            const isMatch = cleanText.includes(withPrefix) || cleanText.includes(withPho) ||
              (streetClean.length >= 4 && (cleanText === streetClean || new RegExp(`(?:^|\\s)${streetClean}(?:$|\\s)`).test(cleanText)));
            if (isMatch) {
              const matchedStr = cleanText.includes(withPrefix) ? withPrefix : (cleanText.includes(withPho) ? withPho : streetClean);
              return {
                city: city.name,
                district: dist.name,
                project: '',
                ward: '',
                street: street,
                matched: matchedStr
              };
            }
          }
        }
      }
    }
  }

  return {
    city: currentCity || '',
    district: '',
    project: '',
    ward: '',
    street: '',
    matched: ''
  };
}

/**
 * Lọc bỏ các cụm từ nhận diện và từ dừng (filler words) để lấy từ khóa còn lại
 */
function extractResidualKeyword(rawQuery, matchedPhrases = []) {
  let text = rawQuery.replace(/^(vd\s*:\s*)/i, '').trim();
  let cleanText = removeAccents(text).toLowerCase();

  // 1. Dọn sạch các cụm từ matchedPhrases trước (Đặc biệt là địa danh & loại hình đã nhận diện)
  for (const phrase of matchedPhrases) {
    if (!phrase || !phrase.trim()) continue;
    const cleanP = removeAccents(phrase).trim();
    if (!cleanP) continue;
    const regex = new RegExp(`\\b${cleanP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleanText = cleanText.replace(regex, ' ');
  }

  // 2. Dọn sạch toàn bộ từ khóa loại hình BĐS
  for (const kw of ALL_TYPE_KEYWORDS) {
    const r = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleanText = cleanText.replace(r, ' ');
  }

  // 3. Dọn sạch từ khóa nhu cầu (cho thuê, thuê, cần thuê, mua bán, bán, mua)
  cleanText = cleanText.replace(/\b(ban nha|mua ban nha|mua nha|ban dat|mua dat|cho thue nha|thue nha|cho thue|thue|can thue|mua ban|can mua|ban|mua)\b/gi, ' ');

  // 4. Xóa các từ phụ trợ tiếng Việt thông dụng
  const stopWords = [
    'tai', 'o', 'khu vuc', 'gan', 'gia', 'muc gia', 'dien tich',
    'khoang', 'tam', 'khoang gia', 'dong', 'viet nam', 'vn', 'quan', 'huyen', 'thanh pho', 'tp',
    'rieng', 'mat pho', 'mat tien', 'nguyen can', 'can', 'lo'
  ];

  for (const sw of stopWords) {
    const r = new RegExp(`\\b${sw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleanText = cleanText.replace(r, ' ');
  }

  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  // Nếu từ khóa còn lại quá ngắn (<= 2 ký tự) hoặc chỉ là từ vụn vặt, loại bỏ để tránh tạo ?keyword=hai
  if (cleanText.length <= 2) return '';
  return cleanText;
}

/**
 * HÀM CHÍNH: Phân tích toàn diện câu truy vấn tìm kiếm tự nhiên chuẩn Batdongsan
 */
export function parseSearchQuery(rawQuery = '', defaultDemand = 'sale', defaultCity = '') {
  const queryStr = (typeof rawQuery === 'string' ? rawQuery : '').replace(/^(vd\s*:\s*)/i, '').trim();
  if (!queryStr) {
    return {
      hasIntent: false,
      demand: defaultDemand,
      propertyType: 'all',
      city: defaultCity || '',
      district: '',
      ward: '',
      street: '',
      project: '',
      minPrice: null,
      maxPrice: null,
      priceRange: 'all',
      minArea: null,
      maxArea: null,
      areaRange: 'all',
      bedroom: 'all',
      direction: 'all',
      residualKeyword: '',
      targetUrl: buildSeoUrl({ demand: defaultDemand, city: defaultCity || null })
    };
  }

  const cleanText = removeAccents(queryStr).toLowerCase();
  const matchedPhrases = [];

  // 1. Phân tích Nhu cầu
  const { demand, matched: demandMatched } = extractDemand(cleanText, defaultDemand);
  if (demandMatched) matchedPhrases.push(demandMatched);

  // 2. Phân tích Địa danh trước (Location) để bảo vệ các tên riêng địa lý
  // (VD: 'Hải Phòng', 'Nha Trang', 'Nhà Bè', 'Đất Đỏ') không bị các từ khóa loại hình
  // ('phòng', 'nhà', 'đất') cắt xén làm sai lệch intent!
  const location = extractLocation(cleanText, defaultCity);
  if (location.matched) matchedPhrases.push(location.matched);

  // Chuỗi còn lại sau khi đã loại trừ địa danh đã nhận diện
  let textForTypeDetection = cleanText;
  if (location.matched) {
    const locRegex = new RegExp(`\\b${location.matched.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    textForTypeDetection = textForTypeDetection.replace(locRegex, ' ').replace(/\s+/g, ' ').trim();
  }

  // 3. Phân tích Loại hình BĐS trên chuỗi không chứa tên địa danh
  const { propertyType, matched: typeMatched } = extractPropertyType(textForTypeDetection);
  if (typeMatched) matchedPhrases.push(typeMatched);

  // 4. Phân tích Khoảng giá
  const { minPrice, maxPrice, priceRange, matched: priceMatched } = extractPriceRange(textForTypeDetection);
  if (priceMatched) matchedPhrases.push(priceMatched);

  // 5. Phân tích Diện tích
  const { minArea, maxArea, areaRange, matched: areaMatched } = extractAreaRange(textForTypeDetection);
  if (areaMatched) matchedPhrases.push(areaMatched);

  // 6. Phân tích Phòng ngủ
  const { bedroom, matched: bedMatched } = extractBedrooms(textForTypeDetection);
  if (bedMatched) matchedPhrases.push(bedMatched);

  // 7. Phân tích Hướng nhà
  const { direction, matched: dirMatched } = extractDirection(textForTypeDetection);
  if (dirMatched) matchedPhrases.push(dirMatched);

  // 8. Trích xuất từ khóa dư còn lại (nếu có đặc tính như: hẻm xe hơi, sổ hồng, chính chủ...)
  const residualKeyword = extractResidualKeyword(queryStr, matchedPhrases);

  // Kiểm tra xem truy vấn có chứa intent cấu trúc hoặc thay đổi nhu cầu không
  const hasIntent = Boolean(
    demandMatched ||
    (demand && defaultDemand && demand !== defaultDemand) ||
    (propertyType && propertyType !== 'all') || 
    location.district || 
    location.city || 
    location.project || 
    location.ward || 
    location.street || 
    (priceRange && priceRange !== 'all') || 
    (areaRange && areaRange !== 'all') || 
    (bedroom && bedroom !== 'all') || 
    (direction && direction !== 'all')
  );

  // 9. Xây dựng target SEO URL chuẩn hoá
  const targetUrl = buildSeoUrl({
    demand: demand || defaultDemand,
    propertyType: (propertyType && propertyType !== 'all') ? propertyType : null,
    city: location.city || null,
    district: location.district || null,
    ward: location.ward || null,
    street: location.street || null,
    project: location.project || null,
    priceRange: (priceRange && priceRange !== 'all') ? priceRange : null,
    minPrice,
    maxPrice,
    areaRange: (areaRange && areaRange !== 'all') ? areaRange : null,
    minArea,
    maxArea,
    bedroom: (bedroom && bedroom !== 'all') ? bedroom : null,
    extraParams: {
      ...(residualKeyword ? { keyword: residualKeyword } : {}),
      ...(direction && direction !== 'all' ? { direction } : {})
    }
  });

  return {
    hasIntent,
    demand: demand || defaultDemand,
    propertyType: propertyType || 'all',
    city: location.city || '',
    district: location.district || '',
    ward: location.ward || '',
    street: location.street || '',
    project: location.project || '',
    minPrice,
    maxPrice,
    priceRange: priceRange || 'all',
    minArea,
    maxArea,
    areaRange: areaRange || 'all',
    bedroom: bedroom || 'all',
    direction: direction || 'all',
    residualKeyword,
    targetUrl
  };
}
