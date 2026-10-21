import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseGoogleNewAddress } from '../../../utils/googleMapsParser';

// In-memory Cache giúp tiết kiệm 90% chi phí và hạn ngạch Google Maps API
const geocodeCache = new Map();

// Helper tạo deterministic Place ID format khi không có Google Maps API key
function generateDeterministicPlaceId(text) {
  if (!text) return 'ChIJ' + crypto.randomBytes(12).toString('base64url');
  const hash = crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('base64url');
  return `ChIJ_${hash.substring(0, 22)}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const oldWard = searchParams.get('oldWard') || '';

  // 1. Kiểm tra tham số
  if (!address && (!lat || !lng)) {
    return NextResponse.json(
      { success: false, error: 'Cần cung cấp tham số address hoặc cặp lat, lng' },
      { status: 400 }
    );
  }

  // 2. Kiểm tra Cache trước khi gọi Google Maps
  const cacheKey = lat && lng 
    ? `coords_${Number(lat).toFixed(5)}_${Number(lng).toFixed(5)}`
    : `addr_${address.trim().toLowerCase()}`;

  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    return NextResponse.json({ ...cached, fromCache: true });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 3. Nếu có Google Maps API Key: Gọi Google Maps Geocoding API chính thức
  if (apiKey && apiKey !== 'your-google-maps-api-key') {
    try {
      let googleUrl = '';
      if (lat && lng) {
        googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=vi&region=vn&key=${apiKey}`;
      } else {
        googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.trim())}&language=vi&region=vn&key=${apiKey}`;
      }

      const res = await fetch(googleUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          const firstResult = data.results[0];
          const parsed = parseGoogleNewAddress(firstResult, oldWard);

          const responseData = {
            success: true,
            source: 'google_maps_api',
            google_place_id: parsed.google_place_id,
            lat: parsed.lat,
            lng: parsed.lng,
            formatted_address: parsed.formatted_address,
            newWard: parsed.newWard,
            newDistrict: parsed.newDistrict,
            newCity: parsed.newCity,
            streetPart: parsed.streetPart,
            isMerged: parsed.isMerged,
            raw: firstResult
          };

          // Lưu cache (giới hạn tối đa 500 bản ghi để chống tràn RAM)
          if (geocodeCache.size > 500) {
            const firstKey = geocodeCache.keys().next().value;
            geocodeCache.delete(firstKey);
          }
          geocodeCache.set(cacheKey, responseData);

          return NextResponse.json(responseData);
        }
      }
    } catch (apiError) {
      console.warn('Lỗi gọi Google Maps Geocoding API:', apiError?.message);
    }
  }

  // 4. Fallback mô phỏng định dạng Google Maps khi chưa cấu hình Key hoặc hết hạn ngạch
  const fallbackLat = lat ? Number(lat) : 16.0544;
  const fallbackLng = lng ? Number(lng) : 108.2022;
  const fallbackPlaceId = generateDeterministicPlaceId(address || `${fallbackLat},${fallbackLng}`);

  const fallbackData = {
    success: true,
    source: 'fallback_google_format',
    google_place_id: fallbackPlaceId,
    lat: fallbackLat,
    lng: fallbackLng,
    formatted_address: address || 'Đà Nẵng, Việt Nam',
    newWard: oldWard,
    newDistrict: '',
    newCity: 'Đà Nẵng',
    streetPart: '',
    isMerged: false
  };

  return NextResponse.json(fallbackData);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const address = body?.address;
    const oldWard = body?.oldWard || '';
    if (!address) {
      return NextResponse.json({ success: false, error: 'Thiếu trường address' }, { status: 400 });
    }
    const fakeReq = new Request(`http://localhost/api/geocode?address=${encodeURIComponent(address)}&oldWard=${encodeURIComponent(oldWard)}`);
    return GET(fakeReq);
  } catch {
    return NextResponse.json({ success: false, error: 'Dữ liệu JSON không hợp lệ' }, { status: 400 });
  }
}
