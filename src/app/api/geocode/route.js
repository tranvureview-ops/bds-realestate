import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { VIETNAM_ADMINISTRATIVE_MERGERS } from '../../../data/vietnamAdministrativeData';

// Helper tạo Google Place ID chuẩn định dạng ChIJ... (Base64url an toàn)
function generateDeterministicPlaceId(address) {
  if (!address) return 'ChIJ' + crypto.randomBytes(12).toString('base64url');
  const hash = crypto.createHash('sha256').update(address.trim().toLowerCase()).digest('base64url');
  return `ChIJ_${hash.substring(0, 22)}`;
}

async function handleGeocode(address) {
  if (!address || !address.trim()) {
    return NextResponse.json(
      { success: false, error: 'Tham số địa chỉ (address) không được để trống' },
      { status: 400 }
    );
  }

  const cleanAddress = address.trim();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Nếu có Google Maps API Key hợp lệ: Gọi Google Maps Geocoding API chính thức
  if (apiKey && apiKey !== 'your-google-maps-api-key') {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddress)}&language=vi&region=vn&key=${apiKey}`;
      const res = await fetch(googleUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
          const firstResult = data.results[0];
          return NextResponse.json({
            success: true,
            source: 'google_maps_api',
            google_place_id: firstResult.place_id,
            lat: firstResult.geometry?.location?.lat,
            lng: firstResult.geometry?.location?.lng,
            formatted_address: firstResult.formatted_address,
            types: firstResult.types || [],
            address_components: firstResult.address_components || []
          });
        }
      }
    } catch (apiError) {
      console.warn('Lỗi gọi Google Maps Geocoding API trực tiếp:', apiError?.message);
    }
  }

  // 2. Tra cứu trong Database Sáp Nhập Đơn Vị Hành Chính 2 Cấp của hệ thống
  const matchedMerger = VIETNAM_ADMINISTRATIVE_MERGERS.find(m => {
    const cleanNewW = m.newWard ? m.newWard.toLowerCase().replace(/^(phường|xã)\s+/i, '').trim() : '';
    const cleanOldW = m.oldWard ? m.oldWard.toLowerCase().replace(/^(phường|xã)\s+/i, '').trim() : '';
    const addrLower = cleanAddress.toLowerCase();
    return (cleanNewW && addrLower.includes(cleanNewW)) || (cleanOldW && addrLower.includes(cleanOldW));
  });

  const fallbackLat = matchedMerger?.lat || 16.0544;
  const fallbackLng = matchedMerger?.lng || 108.2022;
  const fallbackPlaceId = matchedMerger?.google_place_id || generateDeterministicPlaceId(cleanAddress);

  return NextResponse.json({
    success: true,
    source: matchedMerger ? 'administrative_database_merger' : 'fallback_generated',
    google_place_id: fallbackPlaceId,
    lat: fallbackLat,
    lng: fallbackLng,
    formatted_address: cleanAddress,
    is_merged: Boolean(matchedMerger),
    merger_info: matchedMerger || null
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  return handleGeocode(address);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const address = body?.address;
    return handleGeocode(address);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Dữ liệu JSON không hợp lệ' },
      { status: 400 }
    );
  }
}
