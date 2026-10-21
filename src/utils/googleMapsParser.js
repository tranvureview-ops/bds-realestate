/**
 * Hàm phân tích và bóc tách kết quả Google Maps Geocoding / Places API
 * Tự động trích xuất Đơn vị hành chính mới sau sáp nhập (Phường mới, Quận mới, Tỉnh mới)
 * từ mảng `address_components` chuẩn của Google Maps.
 */
export function parseGoogleNewAddress(googleResult, oldWard = '') {
  if (!googleResult) return null;

  const components = googleResult.address_components || [];
  let newWard = '';
  let newDistrict = '';
  let newCity = '';
  let streetName = '';
  let streetNumber = '';

  for (const comp of components) {
    const types = comp.types || [];

    // 1. Phường / Xã mới (Google Maps đánh dấu bằng sublocality_level_1 hoặc administrative_area_level_3)
    if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
      newWard = comp.long_name;
    }
    // 2. Quận / Huyện mới (administrative_area_level_2)
    else if (types.includes('administrative_area_level_2')) {
      newDistrict = comp.long_name;
    }
    // 3. Tỉnh / Thành phố (administrative_area_level_1)
    else if (types.includes('administrative_area_level_1')) {
      newCity = comp.long_name;
    }
    // 4. Tuyến đường (route)
    else if (types.includes('route')) {
      streetName = comp.long_name;
    }
    // 5. Số nhà (street_number)
    else if (types.includes('street_number')) {
      streetNumber = comp.long_name;
    }
  }

  // Chuẩn hóa tiền tố Phường / Xã
  if (newWard && !/^(phường|xã|thị trấn)\s+/i.test(newWard)) {
    newWard = `Phường ${newWard}`;
  }

  // Chuẩn hóa tiền tố Quận / Huyện
  if (newDistrict && !/^(quận|huyện|thị xã|thành phố)\s+/i.test(newDistrict)) {
    newDistrict = `Quận ${newDistrict}`;
  }

  // Kiểm tra xem đơn vị này có sự thay đổi (sáp nhập / đổi tên) so với Phường cũ không
  let isMerged = false;
  if (oldWard && newWard) {
    const cleanOldW = oldWard.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
    const cleanNewW = newWard.toLowerCase().replace(/^(phường|xã|thị trấn)\s+/i, '').trim();
    if (cleanOldW && cleanNewW && cleanOldW !== cleanNewW) {
      isMerged = true;
    }
  }

  const streetPart = [streetNumber, streetName].filter(Boolean).join(' ');

  return {
    google_place_id: googleResult.place_id || null,
    lat: googleResult.geometry?.location?.lat || null,
    lng: googleResult.geometry?.location?.lng || null,
    formatted_address: googleResult.formatted_address || '',
    newWard,
    newDistrict,
    newCity,
    streetPart,
    isMerged
  };
}
