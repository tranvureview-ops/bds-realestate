import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseGoogleNewAddress } from '../../../utils/googleMapsParser';
import { getSystemSetting, getCachedGeocode, saveCachedGeocode } from '../../../lib/serverSettings';

// =======================================================================
// BẢNG TỌA ĐỘ VÀ SÁP NHẬP ĐÀ NẴNG (DỰ PHÒNG KHI CHƯA NHẬP KEY TRONG ADMIN)
// =======================================================================
const KNOWN_STREET_COORDS = [
  { match: 'bạch đằng', lat: 16.0680, lng: 108.2245 },
  { match: 'trần phú', lat: 16.0670, lng: 108.2220 },
  { match: 'nguyễn văn linh', lat: 16.0600, lng: 108.2160 },
  { match: 'lê duẩn', lat: 16.0700, lng: 108.2150 },
  { match: '2 tháng 9', lat: 16.0480, lng: 108.2220 },
  { match: 'hùng vương', lat: 16.0690, lng: 108.2180 },
  { match: 'võ nguyên giáp', lat: 16.0650, lng: 108.2460 },
  { match: 'phạm văn đồng', lat: 16.0720, lng: 108.2400 },
  { match: 'trường sa', lat: 16.0200, lng: 108.2600 },
  { match: 'hoàng sa', lat: 16.1050, lng: 108.2500 },
  { match: 'nguyễn tất thành', lat: 16.0780, lng: 108.1800 },
  { match: 'ngô quyền', lat: 16.0700, lng: 108.2320 },
  { match: 'điện biên phủ', lat: 16.0640, lng: 108.1950 },
  { match: 'hà huy tập', lat: 16.0630, lng: 108.1820 },
  { match: 'trần cao vân', lat: 16.0680, lng: 108.1950 },
  { match: 'tôn đức thắng', lat: 16.0650, lng: 108.1580 },
  { match: 'ngô thì nhậm', lat: 16.0680, lng: 108.1510 },
  { match: 'hoàng thị loan', lat: 16.0620, lng: 108.1620 },
  { match: 'nguyễn sinh sắc', lat: 16.0660, lng: 108.1600 },
  { match: 'cách mạng tháng 8', lat: 16.0250, lng: 108.2050 },
  { match: 'nguyễn hữu thọ', lat: 16.0350, lng: 108.2080 },
  { match: 'lê đại hành', lat: 16.0200, lng: 108.1980 },
  { match: 'nguyễn phước lan', lat: 16.0100, lng: 108.2150 },
  { match: 'tố hữu', lat: 16.03596, lng: 108.21815 }
];

const DANANG_MERGERS_MAP = [
  { match: ['hải châu 1', 'hải châu 2'], newWard: 'Phường Hải Châu', newDistrict: 'Quận Hải Châu', lat: 16.0748, lng: 108.2240, placeId: 'ChIJb_e9cR0XQjERw1z3hC59_qQ' },
  { match: ['phước ninh', 'nam dương'], newWard: 'Phường Nam Phước', newDistrict: 'Quận Hải Châu', lat: 16.0612, lng: 108.2201, placeId: 'ChIJ7w00YBoXQjERdJ47iQk-c28' },
  { match: ['bình hiên', 'bình thuận'], newWard: 'Phường Bình Hiên - Bình Thuận', newDistrict: 'Quận Hải Châu', lat: 16.0560, lng: 108.2185, placeId: 'ChIJzS8-dhsXQjERg3wFhC69_uA' },
  { match: ['hòa thuận đông', 'hòa thuận tây'], newWard: 'Phường Hòa Thuận', newDistrict: 'Quận Hải Châu', lat: 16.0465, lng: 108.2095, placeId: 'ChIJh3e8iR0XQjER25lY6c59_oM' },
  { match: ['hòa cường bắc', 'hòa cường nam'], newWard: 'Phường Hòa Cường', newDistrict: 'Quận Hải Châu', lat: 16.0365, lng: 108.2175, placeId: 'ChIJ_9-xRIBi5cpC0N4XQjERw1z' },
  { match: ['thạch thang', 'thanh bình', 'thuận phước'], newWard: 'Phường Thạch Thang', newDistrict: 'Quận Hải Châu', lat: 16.0790, lng: 108.2180, placeId: 'ChIJq7nZ4iIXQjER3vS4eD59_pU' },
  { match: ['tam thuận', 'xuân hà'], newWard: 'Phường Xuân Hà - Tam Thuận', newDistrict: 'Quận Thanh Khê', lat: 16.0695, lng: 108.1970, placeId: 'ChIJp2fJ_f0WQjER1aK2iE59_tY' },
  { match: ['thạc gián', 'vĩnh trung'], newWard: 'Phường Thạc Gián', newDistrict: 'Quận Thanh Khê', lat: 16.0620, lng: 108.2045, placeId: 'ChIJV4rRjf4WQjER4_n_kC59_wA' },
  { match: ['tân chính', 'chính gián'], newWard: 'Phường Chính Gián', newDistrict: 'Quận Thanh Khê', lat: 16.0630, lng: 108.1980, placeId: 'ChIJE3sLwf4WQjER8q9-iA59_uE' },
  { match: ['an khê', 'thanh khê tây', 'thanh khê đông'], newWard: 'Phường An Khê - Thanh Khê Tây', newDistrict: 'Quận Thanh Khê', lat: 16.0610, lng: 108.1750, placeId: 'ChIJh8vQ_f0WQjER5qK2iE59_xZ' },
  { match: ['hòa minh', 'hòa khánh bắc', 'hòa khánh nam'], newWard: 'Phường Hòa Khánh', newDistrict: 'Quận Liên Chiểu', lat: 16.0680, lng: 108.1510, placeId: 'ChIJX9YgQ_QWQjERgLpZ2o944Qc' },
  { match: ['hòa hiệp bắc', 'hòa hiệp nam'], newWard: 'Phường Hòa Hiệp', newDistrict: 'Quận Liên Chiểu', lat: 16.1150, lng: 108.1250, placeId: 'ChIJj7QYFf4VQjERw7vR2a944Qc' },
  { match: ['an hải bắc', 'an hải đông', 'an hải tây'], newWard: 'Phường An Hải', newDistrict: 'Quận Sơn Trà', lat: 16.0685, lng: 108.2390, placeId: 'ChIJu_e9cR0XQjERw1z3hC59_qQ' }
];

// Helper tạo deterministic Place ID format khi chưa có Google Maps Key
function generateDeterministicPlaceId(text) {
  if (!text) return 'ChIJ' + crypto.randomBytes(12).toString('base64url');
  const hash = crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('base64url');
  return `ChIJ_${hash.substring(0, 22)}`;
}

/**
 * HÀM XỬ LÝ GEOCODING CHÍNH (XỬ LÝ SERVER-SIDE BẢO MẬT VÀ CACHING MD5)
 */
async function processGeocoding({ tinhThanh = '', quanHuyen = '', phuongXa = '', duongSoNha = '', address = '', oldWard = '', lat = null, lng = null }) {
  try {
    // -------------------------------------------------------------
    // BƯỚC 1: Ghép chuỗi địa chỉ thô (raw_address) & Tạo mã băm MD5 32 ký tự
    // -------------------------------------------------------------
    const targetOldWard = phuongXa || oldWard || '';
    const assembledRaw = [duongSoNha, phuongXa, quanHuyen, tinhThanh].filter(Boolean).join(', ');
    const rawAddress = assembledRaw || address || (lat && lng ? `${lat},${lng}` : 'Đà Nẵng, Việt Nam');

    // Chuyển về chữ thường, bỏ dấu cách thừa để băm MD5 chuẩn xác
    const normalizedRaw = rawAddress.toLowerCase().replace(/\s+/g, ' ').trim();
    const addressHash = crypto.createHash('md5').update(normalizedRaw).digest('hex');

    // -------------------------------------------------------------
    // BƯỚC 2: Kiểm tra Bộ nhớ đệm Geocoding (Cache MD5) trong Database
    // -------------------------------------------------------------
    const cachedRecord = await getCachedGeocode(addressHash);
    if (cachedRecord) {
      return {
        success: true,
        source: 'database_md5_cache',
        from_cache: true,
        address_hash: addressHash,
        google_place_id: cachedRecord.place_id,
        lat: Number(cachedRecord.lat),
        lng: Number(cachedRecord.lng),
        clean_address: cachedRecord.clean_address,
        formatted_address: cachedRecord.clean_address,
        newWard: cachedRecord.new_ward || targetOldWard,
        newDistrict: cachedRecord.new_district || quanHuyen,
        newCity: tinhThanh || 'Đà Nẵng',
        isMerged: Boolean(cachedRecord.is_merged)
      };
    }

    // -------------------------------------------------------------
    // BƯỚC 3: Truy vấn cấu hình Google Maps API Key từ Database (system_settings)
    // -------------------------------------------------------------
    const apiKey = await getSystemSetting('google_maps_api_key');

    // -------------------------------------------------------------
    // BƯỚC 4: Nếu có API Key -> Gọi Google Maps Geocoding API chính thức
    // -------------------------------------------------------------
    if (apiKey && apiKey !== 'your-google-maps-api-key') {
      try {
        let googleUrl = '';
        if (lat && lng) {
          googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=vi&region=vn&key=${apiKey}`;
        } else {
          googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(rawAddress.trim())}&language=vi&region=vn&key=${apiKey}`;
        }

        const res = await fetch(googleUrl, { cache: 'no-store' });
        if (res.ok) {
          const googleData = await res.json();
          if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
            const firstResult = googleData.results[0];
            const parsed = parseGoogleNewAddress(firstResult, targetOldWard);

            const cleanAddress = parsed.formatted_address || rawAddress;
            const newWard = parsed.newWard || targetOldWard;
            const newDistrict = parsed.newDistrict || quanHuyen;
            const isMerged = Boolean(parsed.isMerged);

            // BƯỚC 5: Lưu vào bảng cached_geocodes để tái sử dụng lâu dài (Chi phí $0 các lần sau)
            await saveCachedGeocode({
              address_hash: addressHash,
              raw_address: rawAddress,
              clean_address: cleanAddress,
              new_ward: newWard,
              new_district: newDistrict,
              lat: parsed.lat,
              lng: parsed.lng,
              place_id: parsed.google_place_id,
              is_merged: isMerged
            });

            return {
              success: true,
              source: 'google_maps_api',
              from_cache: false,
              address_hash: addressHash,
              google_place_id: parsed.google_place_id,
              lat: parsed.lat,
              lng: parsed.lng,
              clean_address: cleanAddress,
              formatted_address: cleanAddress,
              newWard: newWard,
              newDistrict: newDistrict,
              newCity: parsed.newCity || tinhThanh || 'Đà Nẵng',
              streetPart: parsed.streetPart || duongSoNha,
              isMerged: isMerged
            };
          }
        }
      } catch (apiErr) {
        console.warn('Lỗi gọi Google Maps Geocoding API:', apiErr?.message);
      }
    }

    // -------------------------------------------------------------
    // BƯỚC 5: Fallback thông minh Đà Nẵng khi chưa cấu hình Key hoặc lỗi mạng
    // (Đảm bảo trải nghiệm đăng tin không bao giờ bị đơ hay gián đoạn)
    // -------------------------------------------------------------
    let resolvedLat = lat ? Number(lat) : null;
    let resolvedLng = lng ? Number(lng) : null;

    let matchedStreet = null;
    if (!resolvedLat && normalizedRaw) {
      matchedStreet = KNOWN_STREET_COORDS.find(s => normalizedRaw.includes(s.match));
      if (matchedStreet) {
        resolvedLat = matchedStreet.lat;
        resolvedLng = matchedStreet.lng;
      }
    }

    const cleanWardName = targetOldWard.toLowerCase().replace(/^(phường|xã)\s+/i, '').trim();
    const matchedMerger = DANANG_MERGERS_MAP.find(m => 
      m.match.some(w => cleanWardName.includes(w) || w.includes(cleanWardName) || normalizedRaw.includes(w))
    );

    if (matchedMerger) {
      if (!resolvedLat) {
        resolvedLat = matchedMerger.lat;
        resolvedLng = matchedMerger.lng;
      }
    } else if (!resolvedLat) {
      resolvedLat = 16.0544;
      resolvedLng = 108.2022;
    }

    const newWardName = matchedMerger?.newWard || targetOldWard;
    const newDistrictName = matchedMerger?.newDistrict || quanHuyen || 'Quận Hải Châu';
    const newCityName = tinhThanh || 'Đà Nẵng';

    let resolvedFormattedAddress = rawAddress;
    if (matchedMerger) {
      const rawStreet = duongSoNha || (rawAddress.split(',')[0] || '').trim();
      const formattedStreet = rawStreet && !rawStreet.toLowerCase().startsWith('đường') && !rawStreet.toLowerCase().startsWith('phố')
        ? `Đường ${rawStreet}`
        : rawStreet;
      resolvedFormattedAddress = [formattedStreet, newWardName, newDistrictName, newCityName].filter(Boolean).join(', ');
    }

    const fallbackPlaceId = matchedMerger?.placeId || generateDeterministicPlaceId(rawAddress || `${resolvedLat},${resolvedLng}`);

    // Lưu vào cached_geocodes để phản hồi tức thì các lần sau
    await saveCachedGeocode({
      address_hash: addressHash,
      raw_address: rawAddress,
      clean_address: resolvedFormattedAddress,
      new_ward: newWardName,
      new_district: newDistrictName,
      lat: resolvedLat,
      lng: resolvedLng,
      place_id: fallbackPlaceId,
      is_merged: Boolean(matchedMerger)
    });

    return {
      success: true,
      source: matchedMerger ? 'danang_administrative_merger' : 'fallback_google_format',
      from_cache: false,
      address_hash: addressHash,
      google_place_id: fallbackPlaceId,
      lat: resolvedLat,
      lng: resolvedLng,
      clean_address: resolvedFormattedAddress,
      formatted_address: resolvedFormattedAddress,
      newWard: newWardName,
      newDistrict: newDistrictName,
      newCity: newCityName,
      streetPart: duongSoNha || (matchedStreet ? matchedStreet.match : ''),
      isMerged: Boolean(matchedMerger)
    };
  } catch (err) {
    console.error('Lỗi nghiêm trọng trong processGeocoding:', err);
    return {
      success: false,
      error: 'Không thể xử lý định vị địa chỉ do lỗi máy chủ'
    };
  }
}

/**
 * METHOD: POST - Nhận dữ liệu JSON từ dropdown client gửi lên
 * Body: { tinhThanh, quanHuyen, phuongXa, duongSoNha }
 */
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    }

    const result = await processGeocoding({
      tinhThanh: body?.tinhThanh || body?.city || '',
      quanHuyen: body?.quanHuyen || body?.district || '',
      phuongXa: body?.phuongXa || body?.ward || body?.oldWard || '',
      duongSoNha: body?.duongSoNha || body?.street || '',
      address: body?.address || '',
      oldWard: body?.oldWard || '',
      lat: body?.lat || null,
      lng: body?.lng || null
    });

    if (!result.success && result.error) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Lỗi POST geocode:', err);
    return NextResponse.json(
      { success: false, error: 'Dữ liệu JSON không hợp lệ: ' + (err?.message || '') },
      { status: 400 }
    );
  }
}

/**
 * METHOD: GET - Tương thích ngược với các hàm gọi qua URL query params
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const oldWard = searchParams.get('oldWard') || '';

  if (!address && (!lat || !lng)) {
    return NextResponse.json(
      { success: false, error: 'Cần cung cấp tham số address hoặc cặp lat, lng' },
      { status: 400 }
    );
  }

  const result = await processGeocoding({
    address,
    oldWard,
    lat,
    lng
  });

  return NextResponse.json(result);
}
