'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CITY_COORDS = {
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022, zoom: 14 }
};

const DISTRICT_COORDS = {
  'Quận Hải Châu': { lat: 16.0594, lng: 108.2208 },
  'Quận Sơn Trà': { lat: 16.0792, lng: 108.2427 },
  'Quận Ngũ Hành Sơn': { lat: 16.0125, lng: 108.2514 },
  'Quận Thanh Khê': { lat: 16.0645, lng: 108.1885 },
  'Quận Cẩm Lệ': { lat: 16.0150, lng: 108.1980 },
  'Quận Liên Chiểu': { lat: 16.0782, lng: 108.1488 },
  'Huyện Hòa Vang': { lat: 15.9892, lng: 108.1189 }
};

const WARD_COORDS = {
  // Hải Châu
  'Phường Hải Châu': { lat: 16.0748, lng: 108.2240 },
  'Phường Hải Châu 1': { lat: 16.0748, lng: 108.2240 },
  'Phường Hải Châu 2': { lat: 16.0712, lng: 108.2195 },
  'Phường Thạch Thang': { lat: 16.0790, lng: 108.2180 },
  'Phường Thanh Bình': { lat: 16.0790, lng: 108.2180 },
  'Phường Thuận Phước': { lat: 16.0885, lng: 108.2160 },
  'Phường Bình Hiên': { lat: 16.0560, lng: 108.2185 },
  'Phường Bình Thuận': { lat: 16.0560, lng: 108.2185 },
  'Phường Phước Ninh': { lat: 16.0612, lng: 108.2201 },
  'Phường Nam Dương': { lat: 16.0605, lng: 108.2150 },
  'Phường Hòa Thuận Đông': { lat: 16.0465, lng: 108.2095 },
  'Phường Hòa Thuận Tây': { lat: 16.0465, lng: 108.2095 },
  'Phường Hòa Cường Bắc': { lat: 16.0410, lng: 108.2180 },
  'Phường Hòa Cường Nam': { lat: 16.0320, lng: 108.2190 },
  // Sơn Trà
  'Phường An Hải': { lat: 16.0685, lng: 108.2390 },
  'Phường An Hải Bắc': { lat: 16.0720, lng: 108.2360 },
  'Phường An Hải Đông': { lat: 16.0650, lng: 108.2380 },
  'Phường An Hải Tây': { lat: 16.0620, lng: 108.2330 },
  'Phường Phước Mỹ': { lat: 16.0640, lng: 108.2460 },
  'Phường Mân Thái': { lat: 16.0820, lng: 108.2450 },
  'Phường Thọ Quang': { lat: 16.1020, lng: 108.2480 },
  'Phường Nại Hiên Đông': { lat: 16.0910, lng: 108.2320 },
  // Ngũ Hành Sơn
  'Phường Mỹ An': { lat: 16.0480, lng: 108.2450 },
  'Phường Khuê Mỹ': { lat: 16.0280, lng: 108.2520 },
  'Phường Hòa Quý': { lat: 15.9920, lng: 108.2480 },
  'Phường Hòa Hải': { lat: 16.0020, lng: 108.2610 },
  // Thanh Khê
  'Phường Tam Thuận': { lat: 16.0695, lng: 108.1970 },
  'Phường Xuân Hà': { lat: 16.0695, lng: 108.1970 },
  'Phường Thạc Gián': { lat: 16.0620, lng: 108.2045 },
  'Phường Vĩnh Trung': { lat: 16.0620, lng: 108.2045 },
  'Phường Tân Chính': { lat: 16.0630, lng: 108.1980 },
  'Phường Chính Gián': { lat: 16.0630, lng: 108.1980 },
  'Phường An Khê': { lat: 16.0610, lng: 108.1750 },
  'Phường Thanh Khê Tây': { lat: 16.0610, lng: 108.1750 },
  // Liên Chiểu
  'Phường Hòa Khánh': { lat: 16.0680, lng: 108.1510 },
  'Phường Hòa Minh': { lat: 16.0680, lng: 108.1510 },
  'Phường Hòa Khánh Bắc': { lat: 16.0820, lng: 108.1480 },
  'Phường Hòa Khánh Nam': { lat: 16.0590, lng: 108.1450 },
  'Phường Hòa Hiệp': { lat: 16.1150, lng: 108.1250 },
  'Phường Hòa Hiệp Bắc': { lat: 16.1150, lng: 108.1250 },
  'Phường Hòa Hiệp Nam': { lat: 16.1150, lng: 108.1250 },
  // Cẩm Lệ
  'Phường Khuê Trung': { lat: 16.0280, lng: 108.2050 },
  'Phường Hòa Thọ Đông': { lat: 16.0150, lng: 108.2010 },
  'Phường Hòa Thọ Tây': { lat: 16.0120, lng: 108.1880 },
  'Phường Hòa An': { lat: 16.0420, lng: 108.1820 },
  'Phường Hòa Phát': { lat: 16.0350, lng: 108.1750 },
  'Phường Hòa Xuân': { lat: 15.9980, lng: 108.2120 }
};

export default function ListingLocationMap({
  city,
  district,
  ward,
  mergerInfo,
  newAddress,
  targetCoords,
  googlePlaceId,
  onLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [coords, setCoords] = useState({ lat: 16.0544, lng: 108.2022 });

  // Lấy tọa độ mục tiêu: ưu tiên tọa độ sáp nhập địa chỉ mới -> ward -> district -> city
  const getTargetCenter = useCallback(() => {
    if (mergerInfo?.lat && mergerInfo?.lng) {
      return { lat: Number(mergerInfo.lat), lng: Number(mergerInfo.lng), zoom: 16 };
    }
    if (targetCoords?.lat && targetCoords?.lng) {
      return { lat: Number(targetCoords.lat), lng: Number(targetCoords.lng), zoom: 16 };
    }
    if (ward && WARD_COORDS[ward]) {
      return { ...WARD_COORDS[ward], zoom: 16 };
    }
    if (district && DISTRICT_COORDS[district]) {
      return { ...DISTRICT_COORDS[district], zoom: 15 };
    }
    if (city && CITY_COORDS[city]) {
      return CITY_COORDS[city];
    }
    return { lat: 16.0544, lng: 108.2022, zoom: 14 };
  }, [city, district, ward, mergerInfo, targetCoords]);

  // Khởi tạo bản đồ Leaflet OpenStreetMap
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    let timerId = null;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) {
        timerId = setTimeout(initMap, 200);
        return;
      }
      if (!isMounted) return;

      // Xóa instance cũ nếu có
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }

      const center = getTargetCenter();

      try {
        const map = window.L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: center.zoom || 14,
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: false
        });

        // Layer bản đồ OpenStreetMap chuẩn
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Nút zoom thu phóng góc phải dưới
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Lắng nghe di chuyển bản đồ -> cập nhật tọa độ tâm ghim
        map.on('move', () => {
          const c = map.getCenter();
          setCoords({ lat: c.lat, lng: c.lng });
          if (onLocationChange) {
            onLocationChange({ lat: c.lat, lng: c.lng });
          }
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
        setCoords({ lat: center.lat, lng: center.lng });
      } catch (err) {
        console.warn('Map initialization retry...', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [getTargetCenter, onLocationChange]);

  // Tự động di chuyển góc nhìn khi người dùng đổi Tỉnh / Quận / Phường hoặc có gợi ý sáp nhập
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      const center = getTargetCenter();
      mapInstanceRef.current.setView([center.lat, center.lng], center.zoom || 15, { animate: true });
      setCoords({ lat: center.lat, lng: center.lng });
      if (onLocationChange) {
        onLocationChange({ lat: center.lat, lng: center.lng });
      }
    }
  }, [city, district, ward, mergerInfo, targetCoords, getTargetCenter, isMapReady, onLocationChange]);

  // Hàm Đặt lại vị trí ban đầu
  const handleReset = () => {
    if (mapInstanceRef.current) {
      const center = getTargetCenter();
      mapInstanceRef.current.setView([center.lat, center.lng], center.zoom || 15, { animate: true });
      setCoords({ lat: center.lat, lng: center.lng });
      if (onLocationChange) {
        onLocationChange({ lat: center.lat, lng: center.lng });
      }
    }
  };

  const effectivePlaceId = googlePlaceId || mergerInfo?.google_place_id || null;
  const googleMapsUrl = effectivePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(effectivePlaceId)}`
    : `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="space-y-2 pt-4 border-t border-slate-200">
      {/* Header Chọn vị trí & Nút Xem Google Maps + Đặt lại */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
          <i className="fa-solid fa-map-location-dot text-red-600"></i>
          <span>Vị trí trên bản đồ Google Maps</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-700 hover:text-blue-800 flex items-center gap-1 font-semibold transition hover:underline"
            title="Mở tọa độ chính xác trên Google Maps"
          >
            <i className="fa-brands fa-google text-[11px] text-red-500"></i>
            <span>Xem trên Google Maps</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-800 hover:text-red-600 underline font-medium cursor-pointer transition"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Thông báo định vị địa chỉ mới sau sáp nhập */}
      {mergerInfo && (
        <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/90 rounded-xl px-3 py-1.5 text-xs text-emerald-950">
          <div className="flex items-center gap-1.5 min-w-0">
            <i className="fa-solid fa-circle-check text-emerald-600 shrink-0 text-xs"></i>
            <span className="truncate">
              Tâm bản đồ chuẩn xác: <strong>{mergerInfo.newWard}</strong>, {mergerInfo.newDistrict || district}
            </span>
          </div>
          {effectivePlaceId && (
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 shrink-0 ml-2">
              Place ID: {effectivePlaceId.substring(0, 16)}...
            </span>
          )}
        </div>
      )}

      <div className="text-[11px] text-slate-500">
        Kéo bản đồ để đổi vị trí ghim (hoặc click vào địa chỉ mới gợi ý để định vị chuẩn xác)
      </div>

      {/* Khung Bản đồ với ghim tâm tương tác */}
      <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 mt-2">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Ghim trung tâm cố định (Map Center Pin Marker) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 -translate-y-4">
          <div className="relative flex flex-col items-center">
            {/* Icon ghim màu đỏ thương hiệu */}
            <i className="fa-solid fa-location-dot text-red-600 text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] filter"></i>
            {/* Bóng ghim */}
            <div className="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] -mt-1"></div>
          </div>
        </div>

        {/* Badge tọa độ thu nhỏ ở góc trái dưới */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs pointer-events-none">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
}
