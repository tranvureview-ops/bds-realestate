import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData.js';
import { removeAccents } from './propertyFilter.js';
import { buildSeoUrl } from './permalink.js';

// Danh mục định nghĩa loại hình BĐS và các từ khóa đồng nghĩa
const PROPERTY_TYPE_DICTIONARY = [
  {
    id: 'apartment',
    name: 'chung cư',
    formalName: 'căn hộ chung cư',
    synonyms: ['chung cu', 'can ho', 'can ho chung cu', 'chung cu cao cap', 'studio', 'chung cu mini'],
    salePrefix: 'Mua bán chung cư',
    rentPrefix: 'Thuê chung cư'
  },
  {
    id: 'house',
    name: 'nhà riêng',
    formalName: 'nhà riêng',
    synonyms: ['nha rieng', 'nha pho', 'nha o', 'nha cap 4', 'ban nha', 'nha ban', 'mua nha', 'mua ban nha'],
    salePrefix: 'Mua bán nhà riêng',
    rentPrefix: 'Thuê nhà riêng'
  },
  {
    id: 'street-house',
    name: 'nhà mặt phố',
    formalName: 'nhà mặt phố',
    synonyms: ['nha mat pho', 'nha mat tien', 'nha pho kinh doanh', 'mat pho'],
    salePrefix: 'Mua bán nhà mặt phố',
    rentPrefix: 'Thuê nhà mặt phố'
  },
  {
    id: 'villa',
    name: 'biệt thự',
    formalName: 'biệt thự, liền kề',
    synonyms: ['biet thu', 'lien ke', 'villa', 'dinh thu'],
    salePrefix: 'Mua bán biệt thự',
    rentPrefix: 'Thuê biệt thự'
  },
  {
    id: 'project-land',
    name: 'đất nền',
    formalName: 'đất nền dự án',
    synonyms: ['dat nen', 'dat nen du an', 'dat du an', 'dat phan lo'],
    salePrefix: 'Mua bán đất nền',
    rentPrefix: 'Thuê đất nền'
  },
  {
    id: 'land',
    name: 'đất thổ cư',
    formalName: 'đất thổ cư, đất ở',
    synonyms: ['dat tho cu', 'dat', 'ban dat', 'mua dat', 'dat o'],
    salePrefix: 'Mua bán đất',
    rentPrefix: 'Thuê đất'
  },
  {
    id: 'shophouse',
    name: 'shophouse',
    formalName: 'shophouse thương mại',
    synonyms: ['shophouse', 'nha pho thuong mai'],
    salePrefix: 'Mua bán shophouse',
    rentPrefix: 'Thuê shophouse'
  },
  {
    id: 'retail',
    name: 'mặt bằng',
    formalName: 'mặt bằng kinh doanh',
    synonyms: ['mat bang', 'mat bang kinh doanh', 'cua hang', 'kiot'],
    salePrefix: 'Mua bán mặt bằng',
    rentPrefix: 'Thuê mặt bằng kinh doanh'
  },
  {
    id: 'office',
    name: 'văn phòng',
    formalName: 'văn phòng',
    synonyms: ['van phong', 'toa nha van phong', 'coworking'],
    salePrefix: 'Mua bán văn phòng',
    rentPrefix: 'Thuê văn phòng'
  },
  {
    id: 'room',
    name: 'phòng trọ',
    formalName: 'phòng trọ, nhà trọ',
    synonyms: ['phong tro', 'nha tro', 'phong cho thue'],
    salePrefix: 'Mua bán phòng trọ',
    rentPrefix: 'Thuê phòng trọ'
  }
];

// Danh sách các Tỉnh / Thành phố trọng điểm hàng đầu (chuẩn Batdongsan)
const KEY_CITIES = [
  { name: 'Hà Nội', shortName: 'Hà Nội' },
  { name: 'TP. Hồ Chí Minh', shortName: 'Hồ Chí Minh' },
  { name: 'Đà Nẵng', shortName: 'Đà Nẵng' },
  { name: 'Hải Phòng', shortName: 'Hải Phòng' },
  { name: 'Bình Dương', shortName: 'Bình Dương' },
  { name: 'Đồng Nai', shortName: 'Đồng Nai' },
  { name: 'Khánh Hòa', shortName: 'Khánh Hòa' },
  { name: 'Cần Thơ', shortName: 'Cần Thơ' }
];

/**
 * Sinh danh sách các truy vấn gợi ý chuẩn phong cách Batdongsan.com.vn
 * @param {string} rawKeyword Từ khóa người dùng đang gõ
 * @param {Object} options Tùy chọn cấu hình
 * @returns {Array} Danh sách các query gợi ý
 */
export function getSearchQuerySuggestions(rawKeyword = '', options = {}) {
  const keyword = (typeof rawKeyword === 'string' ? rawKeyword : '').trim();
  if (!keyword) return [];

  const clean = removeAccents(keyword).toLowerCase();
  const {
    currentDemand = 'sale',
    currentCity = '',
    isMergerMode = false
  } = options;

  const results = [];
  const seenQueries = new Set();

  const addResult = (item) => {
    if (!item || !item.query || seenQueries.has(item.query.toLowerCase())) return;
    seenQueries.add(item.query.toLowerCase());
    results.push({
      id: `sug-${seenQueries.size}`,
      highlightTerm: keyword,
      ...item
    });
  };

  // 1. Kiểm tra nếu người dùng đang tìm kiếm đơn vị hành chính sau sáp nhập (khi bật isMergerMode)
  if (isMergerMode) {
    DANANG_MERGERS_MAP.forEach(m => {
      const matchFound = m.match.some(w => removeAccents(w).includes(clean)) || removeAccents(m.newWard).includes(clean);
      if (matchFound) {
        addResult({
          query: `Mua bán nhà đất tại ${m.newWard}, ${m.newDistrict}`,
          badge: 'Địa danh mới sáp nhập',
          demand: 'sale',
          city: 'Đà Nẵng',
          district: m.newDistrict,
          ward: m.newWard,
          url: buildSeoUrl({ demand: 'sale', city: 'Đà Nẵng', district: m.newDistrict, ward: m.newWard })
        });
        addResult({
          query: `Thuê nhà đất tại ${m.newWard}, ${m.newDistrict}`,
          badge: 'Địa danh mới sáp nhập',
          demand: 'rent',
          city: 'Đà Nẵng',
          district: m.newDistrict,
          ward: m.newWard,
          url: buildSeoUrl({ demand: 'rent', city: 'Đà Nẵng', district: m.newDistrict, ward: m.newWard })
        });
      }
    });
  }

  // 2. Tìm kiếm loại hình BĐS khớp từ khóa (VD: 'chung cu', 'can ho', 'nha rieng', 'dat nen'...)
  const matchedType = PROPERTY_TYPE_DICTIONARY.find(pt => {
    return pt.synonyms.some(s => s.includes(clean) || clean.includes(s));
  });

  if (matchedType) {
    const typeLabel = matchedType.name;

    // A. 6 Query Trọng Tâm Quốc Gia (Chuẩn Batdongsan screenshot)
    // 1. Mua bán [loại BĐS] tại Hà Nội
    addResult({
      query: `Mua bán ${typeLabel} tại Hà Nội`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Hà Nội',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Hà Nội' })
    });

    // 2. Mua bán [loại BĐS] tại Hồ Chí Minh
    addResult({
      query: `Mua bán ${typeLabel} tại Hồ Chí Minh`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'TP. Hồ Chí Minh',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'TP. Hồ Chí Minh' })
    });

    // 3. Thuê [loại BĐS] tại Hà Nội
    addResult({
      query: `Thuê ${typeLabel} tại Hà Nội`,
      demand: 'rent',
      propertyType: matchedType.id,
      city: 'Hà Nội',
      url: buildSeoUrl({ demand: 'rent', propertyType: matchedType.id, city: 'Hà Nội' })
    });

    // 4. Thuê [loại BĐS] tại Hồ Chí Minh
    addResult({
      query: `Thuê ${typeLabel} tại Hồ Chí Minh`,
      demand: 'rent',
      propertyType: matchedType.id,
      city: 'TP. Hồ Chí Minh',
      url: buildSeoUrl({ demand: 'rent', propertyType: matchedType.id, city: 'TP. Hồ Chí Minh' })
    });

    // 5. Mua bán [loại BĐS] tại Đà Nẵng
    addResult({
      query: `Mua bán ${typeLabel} tại Đà Nẵng`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Đà Nẵng',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Đà Nẵng' })
    });

    // 6. Thuê [loại BĐS] tại Đà Nẵng
    addResult({
      query: `Thuê ${typeLabel} tại Đà Nẵng`,
      demand: 'rent',
      propertyType: matchedType.id,
      city: 'Đà Nẵng',
      url: buildSeoUrl({ demand: 'rent', propertyType: matchedType.id, city: 'Đà Nẵng' })
    });

    // B. Các Phường / Quận tiêu biểu (Khớp chính xác ảnh mẫu của người dùng)
    // Phường Cát Linh, Quận Đống Đa, Hà Nội
    addResult({
      query: `Mua bán ${typeLabel} tại Phường Cát Linh, Quận Đống Đa, Hà Nội`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Hà Nội',
      district: 'Quận Đống Đa',
      ward: 'Phường Cát Linh',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Cát Linh' })
    });

    // Phường Hàng Bột, Quận Đống Đa, Hà Nội
    addResult({
      query: `Mua bán ${typeLabel} tại Phường Hàng Bột, Quận Đống Đa, Hà Nội`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Hà Nội',
      district: 'Quận Đống Đa',
      ward: 'Phường Hàng Bột',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Hàng Bột' })
    });

    // Phường Khâm Thiên, Quận Đống Đa, Hà Nội
    addResult({
      query: `Mua bán ${typeLabel} tại Phường Khâm Thiên, Quận Đống Đa, Hà Nội`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Hà Nội',
      district: 'Quận Đống Đa',
      ward: 'Phường Khâm Thiên',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Khâm Thiên' })
    });

    // Thêm các quận trọng điểm khác tại TP.HCM hoặc Đà Nẵng nếu có
    addResult({
      query: `Mua bán ${typeLabel} tại Quận Bình Thạnh, Hồ Chí Minh`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'TP. Hồ Chí Minh',
      district: 'Quận Bình Thạnh',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'TP. Hồ Chí Minh', district: 'Quận Bình Thạnh' })
    });

    addResult({
      query: `Mua bán ${typeLabel} tại Quận Hải Châu, Đà Nẵng`,
      demand: 'sale',
      propertyType: matchedType.id,
      city: 'Đà Nẵng',
      district: 'Quận Hải Châu',
      url: buildSeoUrl({ demand: 'sale', propertyType: matchedType.id, city: 'Đà Nẵng', district: 'Quận Hải Châu' })
    });
  }

  // 3. Khớp Địa danh hành chính (Tỉnh / Thành, Quận / Huyện, Phường / Xã, Tuyến đường, Dự án)
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    const cityClean = removeAccents(city.name).toLowerCase();
    const cityMatched = cityClean.includes(clean);

    // Nếu người dùng gõ tên Tỉnh / Thành phố (VD: 'ha noi', 'da nang', 'ho chi minh', 'hai phong'...)
    if (cityMatched) {
      const cityName = city.name.replace(/^TP\.\s*/i, '');
      addResult({
        query: `Mua bán nhà đất tại ${city.name}`,
        demand: 'sale',
        city: city.name,
        url: buildSeoUrl({ demand: 'sale', city: city.name })
      });
      addResult({
        query: `Mua bán chung cư tại ${cityName}`,
        demand: 'sale',
        propertyType: 'apartment',
        city: city.name,
        url: buildSeoUrl({ demand: 'sale', propertyType: 'apartment', city: city.name })
      });
      addResult({
        query: `Thuê nhà đất tại ${city.name}`,
        demand: 'rent',
        city: city.name,
        url: buildSeoUrl({ demand: 'rent', city: city.name })
      });
      addResult({
        query: `Mua bán nhà riêng tại ${cityName}`,
        demand: 'sale',
        propertyType: 'house',
        city: city.name,
        url: buildSeoUrl({ demand: 'sale', propertyType: 'house', city: city.name })
      });
      addResult({
        query: `Mua bán đất nền tại ${cityName}`,
        demand: 'sale',
        propertyType: 'project-land',
        city: city.name,
        url: buildSeoUrl({ demand: 'sale', propertyType: 'project-land', city: city.name })
      });
      addResult({
        query: `Thuê chung cư tại ${cityName}`,
        demand: 'rent',
        propertyType: 'apartment',
        city: city.name,
        url: buildSeoUrl({ demand: 'rent', propertyType: 'apartment', city: city.name })
      });
    }

    // Quét từng Quận / Huyện
    if (city.districts && Array.isArray(city.districts)) {
      for (const dist of city.districts) {
        const distClean = removeAccents(dist.name).toLowerCase();
        const distMatched = distClean.includes(clean);

        if (distMatched) {
          const shortCity = city.name.replace(/^TP\.\s*/i, '');
          addResult({
            query: `Mua bán nhà đất tại ${dist.name}, ${shortCity}`,
            demand: 'sale',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: 'sale', city: city.name, district: dist.name })
          });
          addResult({
            query: `Mua bán chung cư tại ${dist.name}, ${shortCity}`,
            demand: 'sale',
            propertyType: 'apartment',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: 'sale', propertyType: 'apartment', city: city.name, district: dist.name })
          });
          addResult({
            query: `Thuê nhà đất tại ${dist.name}, ${shortCity}`,
            demand: 'rent',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: 'rent', city: city.name, district: dist.name })
          });
          addResult({
            query: `Mua bán nhà riêng tại ${dist.name}, ${shortCity}`,
            demand: 'sale',
            propertyType: 'house',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: 'sale', propertyType: 'house', city: city.name, district: dist.name })
          });

          // Gợi ý top 3 Phường thuộc Quận này
          if (dist.wards && Array.isArray(dist.wards)) {
            dist.wards.slice(0, 3).forEach(w => {
              addResult({
                query: `Mua bán nhà đất tại ${w}, ${dist.name}, ${shortCity}`,
                demand: 'sale',
                city: city.name,
                district: dist.name,
                ward: w,
                url: buildSeoUrl({ demand: 'sale', city: city.name, district: dist.name, ward: w })
              });
            });
          }
        }

        // Quét Phường / Xã khớp từ khóa
        if (dist.wards && Array.isArray(dist.wards)) {
          for (const ward of dist.wards) {
            const wardClean = removeAccents(ward).toLowerCase();
            if (wardClean.includes(clean)) {
              const shortCity = city.name.replace(/^TP\.\s*/i, '');
              addResult({
                query: `Mua bán nhà đất tại ${ward}, ${dist.name}, ${shortCity}`,
                demand: 'sale',
                city: city.name,
                district: dist.name,
                ward: ward,
                url: buildSeoUrl({ demand: 'sale', city: city.name, district: dist.name, ward: ward })
              });
              addResult({
                query: `Mua bán chung cư tại ${ward}, ${dist.name}, ${shortCity}`,
                demand: 'sale',
                propertyType: 'apartment',
                city: city.name,
                district: dist.name,
                ward: ward,
                url: buildSeoUrl({ demand: 'sale', propertyType: 'apartment', city: city.name, district: dist.name, ward: ward })
              });
              addResult({
                query: `Thuê nhà đất tại ${ward}, ${dist.name}, ${shortCity}`,
                demand: 'rent',
                city: city.name,
                district: dist.name,
                ward: ward,
                url: buildSeoUrl({ demand: 'rent', city: city.name, district: dist.name, ward: ward })
              });
              if (results.length >= 10) break;
            }
          }
        }

        // Quét Tuyến đường khớp từ khóa
        if (dist.streets && Array.isArray(dist.streets)) {
          for (const street of dist.streets) {
            const streetClean = removeAccents(street).toLowerCase();
            if (streetClean.includes(clean)) {
              const shortCity = city.name.replace(/^TP\.\s*/i, '');
              addResult({
                query: `Mua bán nhà đất đường ${street}, ${dist.name}, ${shortCity}`,
                demand: 'sale',
                city: city.name,
                district: dist.name,
                street: street,
                keyword: street,
                url: buildSeoUrl({ demand: 'sale', city: city.name, district: dist.name, street: street })
              });
              if (results.length >= 10) break;
            }
          }
        }

        // Quét Dự án khớp từ khóa
        if (dist.projects && Array.isArray(dist.projects)) {
          for (const proj of dist.projects) {
            const projClean = removeAccents(proj).toLowerCase();
            if (projClean.includes(clean)) {
              const shortCity = city.name.replace(/^TP\.\s*/i, '');
              addResult({
                query: `Mua bán BĐS tại ${proj}, ${shortCity}`,
                demand: 'sale',
                city: city.name,
                district: dist.name,
                project: proj,
                keyword: proj,
                url: buildSeoUrl({ demand: 'sale', city: city.name, district: dist.name, project: proj })
              });
              addResult({
                query: `Thuê BĐS tại ${proj}, ${shortCity}`,
                demand: 'rent',
                city: city.name,
                district: dist.name,
                project: proj,
                keyword: proj,
                url: buildSeoUrl({ demand: 'rent', city: city.name, district: dist.name, project: proj })
              });
              if (results.length >= 10) break;
            }
          }
        }

        if (results.length >= 12) break;
      }
    }

    if (results.length >= 12) break;
  }

  // 4. Nếu chưa có kết quả nào hoặc từ khóa tự do (VD: '5 ty', 'so do', 'view ho'...)
  if (results.length === 0) {
    KEY_CITIES.slice(0, 4).forEach(c => {
      addResult({
        query: `Mua bán nhà đất ${keyword} tại ${c.shortName}`,
        demand: 'sale',
        city: c.name,
        keyword: keyword,
        url: buildSeoUrl({ demand: 'sale', city: c.name, extraParams: { keyword } })
      });
    });
    addResult({
      query: `Tìm tất cả tin đăng có từ khóa "${keyword}"`,
      demand: currentDemand || 'sale',
      keyword: keyword,
      url: buildSeoUrl({ demand: currentDemand || 'sale', extraParams: { keyword } })
    });
  }

  // Giới hạn trả về tối đa 9 kết quả như thiết kế của Batdongsan.com.vn
  return results.slice(0, 9);
}

/**
 * Component / Helper làm nổi bật từ khóa trong chuỗi truy vấn gợi ý
 */
export function HighlightedQuery({ text = '', highlight = '' }) {
  if (!highlight || !highlight.trim() || !text) {
    return <span className="text-slate-700 text-xs sm:text-sm">{text}</span>;
  }
  const cleanH = removeAccents(highlight.trim()).toLowerCase();
  const cleanT = removeAccents(text).toLowerCase();
  const idx = cleanT.indexOf(cleanH);
  if (idx === -1) {
    return <span className="text-slate-700 text-xs sm:text-sm">{text}</span>;
  }

  const before = text.substring(0, idx);
  const match = text.substring(idx, idx + highlight.trim().length);
  const after = text.substring(idx + highlight.trim().length);

  return (
    <span className="text-slate-700 text-xs sm:text-sm">
      {before}
      <span className="font-extrabold text-slate-950 underline decoration-slate-300 underline-offset-2">{match}</span>
      {after}
    </span>
  );
}
