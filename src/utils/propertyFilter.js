/**
 * Chuẩn hóa chuỗi loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
 */
export function removeAccents(str) {
  if (!str) return '';
  return str.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Utility hàm lọc danh sách Bất động sản chuẩn hóa dùng chung
 * Đảm bảo tính nhất quán giữa ListingGrid, SaleListingsPage, RentListingsPage, HomePage
 */
export function filterProperties(properties = [], filters = {}) {
  if (!Array.isArray(properties)) return [];
  if (!filters || typeof filters !== 'object') return properties;

  return properties.filter(prop => {
    // 1. Trạng thái & Hạn tin
    if (prop.status !== 'active') return false;
    if (prop.expiresAt && Date.now() >= new Date(prop.expiresAt).getTime()) return false;

    // 2. Nhu cầu (Demand: 'sale' | 'rent')
    if (filters.demand && filters.demand !== 'all' && prop.demand !== filters.demand) {
      return false;
    }

    // 3. Loại hình BĐS (Property Type)
    if (filters.propertyType && filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
      return false;
    }

    // 4. Thành phố (City)
    if (filters.city && filters.city.trim() && prop.city) {
      const filterCityClean = removeAccents(filters.city);
      const propCityClean = removeAccents(prop.city);
      if (!propCityClean.includes(filterCityClean) && !prop.city.toLowerCase().includes(filters.city.trim().toLowerCase())) {
        return false;
      }
    }

    // 5. Quận / Huyện (District)
    if (filters.district && filters.district.trim() && prop.district) {
      const filterDistClean = removeAccents(filters.district.replace(/^(quận|huyện|thị xã|tp\.)\s+/i, ''));
      const propDistClean = removeAccents(prop.district.replace(/^(quận|huyện|thị xã|tp\.)\s+/i, ''));
      const directMatch = prop.district.toLowerCase().includes(filters.district.trim().toLowerCase());
      const cleanMatch = propDistClean.includes(filterDistClean);
      if (!directMatch && !cleanMatch) {
        return false;
      }
    }

    // 6. Từ khóa (Keyword / Search Query)
    if (filters.keyword && filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      const kwClean = removeAccents(kw);

      const searchTargetRaw = [
        prop.title,
        prop.address,
        prop.description,
        prop.project,
        prop.street,
        prop.ward,
        prop.district,
        prop.city
      ].filter(Boolean).join(' ').toLowerCase();

      const searchTargetClean = removeAccents(searchTargetRaw);

      const matchExact = searchTargetRaw.includes(kw);
      const matchClean = searchTargetClean.includes(kwClean);

      if (!matchExact && !matchClean) return false;
    }

    // 7. Khoảng giá (Price)
    const p = Number(prop.price) || 0;
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) {
      if (p < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice > 0) {
      if (p > filters.maxPrice) return false;
    }
    if (filters.priceRange && filters.priceRange !== 'all') {
      if (filters.priceRange === 'under-2b' && p > 2000000000) return false;
      else if (filters.priceRange === '2b-5b' && (p < 2000000000 || p > 5000000000)) return false;
      else if (filters.priceRange === '5b-10b' && (p < 5000000000 || p > 10000000000)) return false;
      else if (filters.priceRange === '10b-30b' && (p < 10000000000 || p > 30000000000)) return false;
      else if (filters.priceRange === 'over-30b' && p < 30000000000) return false;
      else {
        // Dynamic price ranges (VD: '7b-10b', '3b-5b', '500m-1b')
        const dynBetween = filters.priceRange.match(/^([0-9.]+)([bm])-([0-9.]+)([bm])$/i);
        if (dynBetween) {
          const minUnit = dynBetween[2].toLowerCase() === 'm' ? 1000000 : 1000000000;
          const maxUnit = dynBetween[4].toLowerCase() === 'm' ? 1000000 : 1000000000;
          const minP = parseFloat(dynBetween[1]) * minUnit;
          const maxP = parseFloat(dynBetween[3]) * maxUnit;
          if (p < minP || p > maxP) return false;
        } else {
          const dynUnder = filters.priceRange.match(/^under-([0-9.]+)([bm])$/i);
          if (dynUnder) {
            const maxP = parseFloat(dynUnder[1]) * (dynUnder[2].toLowerCase() === 'm' ? 1000000 : 1000000000);
            if (p > maxP) return false;
          } else {
            const dynOver = filters.priceRange.match(/^over-([0-9.]+)([bm])$/i);
            if (dynOver) {
              const minP = parseFloat(dynOver[1]) * (dynOver[2].toLowerCase() === 'm' ? 1000000 : 1000000000);
              if (p < minP) return false;
            }
          }
        }
      }
    }

    // 8. Diện tích (Area)
    const a = Number(prop.area) || 0;
    if (filters.minArea !== undefined && filters.minArea !== null && filters.minArea > 0) {
      if (a < filters.minArea) return false;
    }
    if (filters.maxArea !== undefined && filters.maxArea !== null && filters.maxArea > 0) {
      if (a > filters.maxArea) return false;
    }
    if (filters.areaRange && filters.areaRange !== 'all') {
      if (filters.areaRange === 'under-50' && a > 50) return false;
      else if (filters.areaRange === '50-100' && (a < 50 || a > 100)) return false;
      else if (filters.areaRange === '100-200' && (a < 100 || a > 200)) return false;
      else if (filters.areaRange === 'over-200' && a < 200) return false;
      else {
        const dynBetween = filters.areaRange.match(/^([0-9.]+)-([0-9.]+)$/);
        if (dynBetween) {
          const minA = parseFloat(dynBetween[1]);
          const maxA = parseFloat(dynBetween[2]);
          if (a < minA || a > maxA) return false;
        } else {
          const dynUnder = filters.areaRange.match(/^under-([0-9.]+)$/);
          if (dynUnder && a > parseFloat(dynUnder[1])) return false;
          const dynOver = filters.areaRange.match(/^over-([0-9.]+)$/);
          if (dynOver && a < parseFloat(dynOver[1])) return false;
        }
      }
    }

    // 9. Số phòng ngủ (Bedroom)
    if (filters.bedroom && filters.bedroom !== 'all') {
      if (filters.bedroom === '4+') {
        if (prop.bedroom < 4) return false;
      } else if (prop.bedroom !== parseInt(filters.bedroom, 10)) {
        return false;
      }
    }

    // 10. Hướng nhà (Direction)
    if (filters.direction && filters.direction !== 'all' && prop.direction !== filters.direction) {
      return false;
    }

    // 11. VR360
    if (filters.hasVR360 && !prop.hasVR360) return false;

    // 12. Tin chính chủ / Đã xác thực
    if (filters.onlyVerified && (!prop.author || !prop.author.isVerified)) return false;

    return true;
  });
}
