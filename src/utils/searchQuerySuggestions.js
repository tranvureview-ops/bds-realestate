import React from 'react';
import { VIETNAM_ADMINISTRATIVE_DATA, DANANG_MERGERS_MAP } from '../data/vietnamAdministrativeData.js';
import { removeAccents } from './propertyFilter.js';
import { buildSeoUrl } from './permalink.js';
import { parseSearchQuery } from './searchQueryParser.js';

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
    synonyms: ['nha rieng', 'nha pho', 'nha o', 'nha cap 4', 'ban nha', 'nha ban', 'mua nha', 'mua ban nha', 'nha'],
    salePrefix: 'Mua bán nhà riêng',
    rentPrefix: 'Thuê nhà riêng'
  },
  {
    id: 'street-house',
    name: 'nhà mặt phố',
    formalName: 'nhà mặt phố',
    synonyms: ['nha mat pho', 'nha mat tien', 'nha pho kinh doanh', 'mat pho', 'mat tien'],
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
    synonyms: ['phong tro', 'nha tro', 'phong cho thue', 'thue phong', 'tim phong', 'phong ktx'],
    salePrefix: 'Mua bán phòng trọ',
    rentPrefix: 'Thuê phòng trọ'
  }
];

/**
 * Sinh danh sách các truy vấn gợi ý chuẩn phong cách Batdongsan.com.vn
 * Được phân nhóm: Địa điểm (location), Dự án (project), Gợi ý tìm kiếm (suggestion)
 */
export function getSearchQuerySuggestions(rawKeyword = '', options = {}) {
  const keyword = (typeof rawKeyword === 'string' ? rawKeyword : '').replace(/^(vd\s*:\s*)/i, '').trim();
  if (!keyword) return [];

  const clean = removeAccents(keyword).toLowerCase();
  const {
    currentDemand = 'sale',
    currentCity = '',
    isMergerMode = false
  } = options;

  // Xác định rõ người dùng có gõ nhu cầu tường minh ("thuê" hoặc "bán") hay không
  const explicitDemand = /\b(cho thue|thue|can thue|muon)\b/.test(clean)
    ? 'rent'
    : (/\b(ban|mua ban|can mua|mua)\b/.test(clean) ? 'sale' : null);

  const activeDemand = explicitDemand || currentDemand || 'sale';

  const results = [];
  const seenQueries = new Set();

  const addResult = (item) => {
    if (!item || !item.query || seenQueries.has(item.query.toLowerCase())) return;
    seenQueries.add(item.query.toLowerCase());
    results.push({
      id: `sug-${seenQueries.size}`,
      highlightTerm: keyword,
      category: item.category || 'suggestion', // 'location' | 'project' | 'suggestion'
      ...item
    });
  };

  // 1. Phân tích Intent thông minh (Natural Language Query Parser)
  const parsed = parseSearchQuery(keyword, activeDemand, currentCity);
  if (parsed.hasIntent) {
    const demandLabel = parsed.demand === 'rent' ? 'Cho thuê' : 'Mua bán';
    const typeObj = PROPERTY_TYPE_DICTIONARY.find(t => t.id === parsed.propertyType);
    const typeName = typeObj ? typeObj.name : 'nhà đất';
    const streetDisplayName = parsed.street ? (/^(?:đường|phố|tuyến)\s+/i.test(parsed.street) ? parsed.street : `Đường ${parsed.street}`) : '';
    const locParts = [streetDisplayName, parsed.ward, parsed.district, parsed.city].filter(Boolean);
    const locStr = locParts.length > 0 ? `tại ${locParts.join(', ')}` : '';
    const priceStr = parsed.maxPrice ? (parsed.maxPrice >= 1e9 ? `dưới ${parsed.maxPrice / 1e9} tỷ` : `dưới ${parsed.maxPrice / 1e6} triệu`) : '';

    const smartTitle = [demandLabel, typeName, locStr, priceStr].filter(Boolean).join(' ');
    addResult({
      query: smartTitle,
      badge: 'Khớp tiêu chí',
      category: 'suggestion',
      demand: parsed.demand,
      propertyType: parsed.propertyType,
      city: parsed.city,
      district: parsed.district,
      ward: parsed.ward,
      street: parsed.street,
      project: parsed.project,
      maxPrice: parsed.maxPrice,
      minPrice: parsed.minPrice,
      priceRange: parsed.priceRange,
      bedroom: parsed.bedroom,
      keyword: parsed.residualKeyword,
      url: parsed.targetUrl
    });
  }

  // 2. Tra cứu Đơn vị hành chính mới sau sáp nhập (nếu bật isMergerMode)
  if (isMergerMode) {
    DANANG_MERGERS_MAP.forEach(m => {
      const matchFound = m.match.some(w => removeAccents(w).includes(clean)) || removeAccents(m.newWard).includes(clean);
      if (matchFound) {
        addResult({
          query: `${m.newWard}, ${m.newDistrict}, Đà Nẵng`,
          badge: 'Địa danh mới sáp nhập',
          category: 'location',
          demand: activeDemand,
          city: 'Đà Nẵng',
          district: m.newDistrict,
          ward: m.newWard,
          url: buildSeoUrl({ demand: activeDemand, city: 'Đà Nẵng', district: m.newDistrict, ward: m.newWard })
        });
      }
    });
  }

  // 2.5 Quét Tuyến đường khớp từ khóa (Ưu tiên chuẩn Batdongsan.com.vn khi tìm kiếm theo tên đường/phố)
  const cleanStreetQuery = clean.replace(/^(?:duong|pho|tuyen|ngo|ngach|hem)\s+/i, '').trim();
  const isStreetExplicit = /^(?:duong|pho|tuyen)\b/i.test(clean);

  if (isStreetExplicit || cleanStreetQuery.length >= 3) {
    const matchedStreets = [];
    for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
      if (!city.districts) continue;
      for (const dist of city.districts) {
        if (!dist.streets) continue;
        for (const street of dist.streets) {
          const streetClean = removeAccents(street).toLowerCase().replace(/^(?:duong|pho|tuyen)\s+/i, '').trim();
          const isExactMatch = streetClean === clean || streetClean === cleanStreetQuery;
          const isPrefixMatch = cleanStreetQuery.length >= 3 && streetClean.includes(cleanStreetQuery);
          const isLocationWithStreet = (
            cleanStreetQuery.length >= streetClean.length + 3 &&
            new RegExp(`^${streetClean}\\s+(?:quan|huyen|tp|phuong|xa|da nang|ha noi|ho chi minh|sai gon)`).test(cleanStreetQuery)
          );
          if (isExactMatch || isPrefixMatch || isLocationWithStreet) {
            matchedStreets.push({ city, dist, street, isExact: isExactMatch });
          }
        }
      }
    }

    if (matchedStreets.length > 0) {
      matchedStreets.sort((a, b) => {
        if (a.isExact && !b.isExact) return -1;
        if (!a.isExact && b.isExact) return 1;
        if (currentCity && a.city.name.includes(currentCity) && !b.city.name.includes(currentCity)) return -1;
        if (currentCity && !a.city.name.includes(currentCity) && b.city.name.includes(currentCity)) return 1;
        return 0;
      });

      const demandPrefix = activeDemand === 'rent' ? 'Cho thuê BĐS' : 'Mua bán BĐS';

      // Nhóm 1: Mua bán BĐS tại Đường... (Chuẩn Batdongsan Image 2)
      matchedStreets.slice(0, 7).forEach(({ city, dist, street }) => {
        const streetDisplayName = /^(?:đường|phố|tuyến)\s+/i.test(street) ? street : `Đường ${street}`;
        const shortCity = city.name.replace(/^TP\.\s*/i, '');
        addResult({
          query: `${demandPrefix} tại ${streetDisplayName}, ${dist.name}, ${shortCity}`,
          category: 'suggestion',
          demand: activeDemand,
          city: city.name,
          district: dist.name,
          street: street,
          url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name, street })
        });
      });

      // Nhóm 2: Mua bán đất tại Đường... / Cho thuê nhà riêng tại...
      matchedStreets.slice(0, 4).forEach(({ city, dist, street }) => {
        const streetDisplayName = /^(?:đường|phố|tuyến)\s+/i.test(street) ? street : `Đường ${street}`;
        const shortCity = city.name.replace(/^TP\.\s*/i, '');
        if (activeDemand === 'sale') {
          addResult({
            query: `Mua bán đất tại ${streetDisplayName}, ${dist.name}, ${shortCity}`,
            category: 'suggestion',
            demand: 'sale',
            propertyType: 'land-group',
            city: city.name,
            district: dist.name,
            street: street,
            url: buildSeoUrl({ demand: 'sale', propertyType: 'land-group', city: city.name, district: dist.name, street })
          });
        } else {
          addResult({
            query: `Cho thuê nhà riêng tại ${streetDisplayName}, ${dist.name}, ${shortCity}`,
            category: 'suggestion',
            demand: 'rent',
            propertyType: 'house',
            city: city.name,
            district: dist.name,
            street: street,
            url: buildSeoUrl({ demand: 'rent', propertyType: 'house', city: city.name, district: dist.name, street })
          });
        }
      });

      // Nhóm 3: Đường..., Quận..., Thành phố (category: location)
      matchedStreets.slice(0, 3).forEach(({ city, dist, street }) => {
        const streetDisplayName = /^(?:đường|phố|tuyến)\s+/i.test(street) ? street : `Đường ${street}`;
        const shortCity = city.name.replace(/^TP\.\s*/i, '');
        addResult({
          query: `${streetDisplayName}, ${dist.name}, ${shortCity}`,
          category: 'location',
          demand: activeDemand,
          city: city.name,
          district: dist.name,
          street: street,
          url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name, street })
        });
      });
    }
  }

  // 3. Khớp Địa danh hành chính: Quận/Huyện, Tỉnh/Thành, Phường/Xã (Nhóm ĐỊA ĐIỂM)
  if (!isStreetExplicit) {
  for (const city of VIETNAM_ADMINISTRATIVE_DATA) {
    const cityClean = removeAccents(city.name).toLowerCase();
    const cityMatched = cityClean.includes(clean);

    if (cityMatched) {
      addResult({
        query: city.name,
        category: 'location',
        demand: activeDemand,
        city: city.name,
        url: buildSeoUrl({ demand: activeDemand, city: city.name })
      });

      const primLabel = activeDemand === 'rent' ? 'Thuê' : 'Mua bán';
      addResult({
        query: `${primLabel} nhà đất tại ${city.name}`,
        category: 'suggestion',
        demand: activeDemand,
        city: city.name,
        url: buildSeoUrl({ demand: activeDemand, city: city.name })
      });
      addResult({
        query: `${primLabel} căn hộ chung cư tại ${city.name}`,
        category: 'suggestion',
        demand: activeDemand,
        propertyType: 'apartment',
        city: city.name,
        url: buildSeoUrl({ demand: activeDemand, propertyType: 'apartment', city: city.name })
      });
      addResult({
        query: `${primLabel} nhà riêng tại ${city.name}`,
        category: 'suggestion',
        demand: activeDemand,
        propertyType: 'house',
        city: city.name,
        url: buildSeoUrl({ demand: activeDemand, propertyType: 'house', city: city.name })
      });

      if (!explicitDemand) {
        const oppDemand = currentDemand === 'rent' ? 'sale' : 'rent';
        const oppLabel = oppDemand === 'rent' ? 'Thuê' : 'Mua bán';
        addResult({
          query: `${oppLabel} nhà đất tại ${city.name}`,
          category: 'suggestion',
          demand: oppDemand,
          city: city.name,
          url: buildSeoUrl({ demand: oppDemand, city: city.name })
        });
      }
    }

    if (city.districts && Array.isArray(city.districts)) {
      for (const dist of city.districts) {
        const distClean = removeAccents(dist.name).toLowerCase();
        const distMatched = distClean.includes(clean);

        if (distMatched) {
          const shortCity = city.name.replace(/^TP\.\s*/i, '');
          addResult({
            query: `${dist.name}, ${shortCity}`,
            category: 'location',
            demand: activeDemand,
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name })
          });

          // Gợi ý theo activeDemand
          const primDemand = activeDemand;
          const primLabel = primDemand === 'rent' ? 'Thuê' : 'Mua bán';
          addResult({
            query: `${primLabel} nhà riêng tại ${dist.name}, ${shortCity}`,
            category: 'suggestion',
            demand: primDemand,
            propertyType: 'house',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: primDemand, propertyType: 'house', city: city.name, district: dist.name })
          });
          addResult({
            query: `${primLabel} chung cư tại ${dist.name}, ${shortCity}`,
            category: 'suggestion',
            demand: primDemand,
            propertyType: 'apartment',
            city: city.name,
            district: dist.name,
            url: buildSeoUrl({ demand: primDemand, propertyType: 'apartment', city: city.name, district: dist.name })
          });

          // Nếu người dùng không nói rõ nhu cầu bán/thuê, gợi ý thêm nhu cầu đối diện (chuẩn Batdongsan)
          if (!explicitDemand) {
            const oppDemand = currentDemand === 'rent' ? 'sale' : 'rent';
            const oppLabel = oppDemand === 'rent' ? 'Thuê' : 'Mua bán';
            addResult({
              query: `${oppLabel} nhà riêng tại ${dist.name}, ${shortCity}`,
              category: 'suggestion',
              demand: oppDemand,
              propertyType: 'house',
              city: city.name,
              district: dist.name,
              url: buildSeoUrl({ demand: oppDemand, propertyType: 'house', city: city.name, district: dist.name })
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
                query: `${ward}, ${dist.name}, ${shortCity}`,
                category: 'location',
                demand: activeDemand,
                city: city.name,
                district: dist.name,
                ward: ward,
                url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name, ward: ward })
              });
              if (results.length >= 10) break;
            }
          }
        }

        // Quét Dự án khớp từ khóa (Nhóm DỰ ÁN)
        if (dist.projects && Array.isArray(dist.projects)) {
          for (const proj of dist.projects) {
            const projClean = removeAccents(proj).toLowerCase();
            if (projClean.includes(clean)) {
              const shortCity = city.name.replace(/^TP\.\s*/i, '');
              addResult({
                query: `${proj}, ${dist.name}, ${shortCity}`,
                category: 'project',
                demand: activeDemand,
                city: city.name,
                district: dist.name,
                project: proj,
                url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name, project: proj })
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
                query: `Đường ${street}, ${dist.name}, ${shortCity}`,
                category: 'location',
                demand: activeDemand,
                city: city.name,
                district: dist.name,
                street: street,
                url: buildSeoUrl({ demand: activeDemand, city: city.name, district: dist.name, street: street })
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
  }

  // 4. Khớp Loại hình BĐS (Chỉ gợi ý các thành phố lớn khi người dùng gõ loại hình mà không kèm địa danh cụ thể)
  const hasMatchedLocation = results.some(r => r.category === 'location');
  const matchedType = !hasMatchedLocation ? PROPERTY_TYPE_DICTIONARY.find(pt => {
    return pt.synonyms.some(s => {
      if (s.split(' ').length > 1) {
        return clean.includes(s);
      }
      const r = new RegExp(`(^|\\s)${s}($|\\s)`);
      return r.test(clean);
    });
  }) : null;

  if (matchedType) {
    const typeLabel = matchedType.name;
    const pref = activeDemand === 'rent' ? 'Thuê' : 'Mua bán';

    addResult({
      query: `${pref} ${typeLabel} tại Hà Nội`,
      category: 'suggestion',
      demand: activeDemand,
      propertyType: matchedType.id,
      city: 'Hà Nội',
      url: buildSeoUrl({ demand: activeDemand, propertyType: matchedType.id, city: 'Hà Nội' })
    });
    addResult({
      query: `${pref} ${typeLabel} tại Hồ Chí Minh`,
      category: 'suggestion',
      demand: activeDemand,
      propertyType: matchedType.id,
      city: 'TP. Hồ Chí Minh',
      url: buildSeoUrl({ demand: activeDemand, propertyType: matchedType.id, city: 'TP. Hồ Chí Minh' })
    });
    addResult({
      query: `${pref} ${typeLabel} tại Đà Nẵng`,
      category: 'suggestion',
      demand: activeDemand,
      propertyType: matchedType.id,
      city: 'Đà Nẵng',
      url: buildSeoUrl({ demand: activeDemand, propertyType: matchedType.id, city: 'Đà Nẵng' })
    });

    // Nếu không nói rõ bán hay thuê, thêm các gợi ý đối diện
    if (!explicitDemand) {
      const oppDemand = currentDemand === 'rent' ? 'sale' : 'rent';
      const oppPref = oppDemand === 'rent' ? 'Thuê' : 'Mua bán';
      addResult({
        query: `${oppPref} ${typeLabel} tại Hà Nội`,
        category: 'suggestion',
        demand: oppDemand,
        propertyType: matchedType.id,
        city: 'Hà Nội',
        url: buildSeoUrl({ demand: oppDemand, propertyType: matchedType.id, city: 'Hà Nội' })
      });
      addResult({
        query: `${oppPref} ${typeLabel} tại Hồ Chí Minh`,
        category: 'suggestion',
        demand: oppDemand,
        propertyType: matchedType.id,
        city: 'TP. Hồ Chí Minh',
        url: buildSeoUrl({ demand: oppDemand, propertyType: matchedType.id, city: 'TP. Hồ Chí Minh' })
      });
    }
  }

  // 5. Luôn bổ sung tìm kiếm từ khóa tự do (Fallback keyword search)
  addResult({
    query: `Tìm tất cả tin đăng có từ khóa "${keyword}"`,
    category: 'suggestion',
    demand: activeDemand,
    keyword: keyword,
    url: buildSeoUrl({ demand: activeDemand, extraParams: { keyword } })
  });

  return results.slice(0, 10);
}

/**
 * Component làm nổi bật từ khóa trong chuỗi truy vấn gợi ý
 */
export function HighlightedQuery({ text = '', highlight = '' }) {
  if (!highlight || !highlight.trim() || !text) {
    return React.createElement('span', { className: 'text-slate-700 text-xs sm:text-sm' }, text);
  }
  const cleanH = removeAccents(highlight.trim()).toLowerCase();
  const cleanT = removeAccents(text).toLowerCase();
  const idx = cleanT.indexOf(cleanH);
  if (idx === -1) {
    return React.createElement('span', { className: 'text-slate-700 text-xs sm:text-sm' }, text);
  }

  const before = text.substring(0, idx);
  const match = text.substring(idx, idx + highlight.trim().length);
  const after = text.substring(idx + highlight.trim().length);

  return React.createElement(
    'span',
    { className: 'text-slate-700 text-xs sm:text-sm' },
    before,
    React.createElement('span', { className: 'font-extrabold text-slate-950 underline decoration-slate-300 underline-offset-2' }, match),
    after
  );
}
