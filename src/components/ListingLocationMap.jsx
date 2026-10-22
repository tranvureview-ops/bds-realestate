'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Tọa độ trung tâm mặc định TP. Đà Nẵng
const DEFAULT_CENTER = { lat: 16.0544, lng: 108.2022, zoom: 15 };

const DISTRICT_COORDS = {
  'Quận Hải Châu': { lat: 16.0594, lng: 108.2208 },
  'Quận Sơn Trà': { lat: 16.0792, lng: 108.2427 },
  'Quận Ngũ Hành Sơn': { lat: 16.0125, lng: 108.2514 },
  'Quận Thanh Khê': { lat: 16.0645, lng: 108.1885 },
  'Quận Cẩm Lệ': { lat: 16.0150, lng: 108.1980 },
  'Quận Liên Chiểu': { lat: 16.0782, lng: 108.1488 },
  'Huyện Hòa Vang': { lat: 15.9892, lng: 108.1189 }
};

// Các lớp hiển thị của Google Maps
const GOOGLE_MAP_LAYERS = {
  roadmap: {
    name: 'Bản đồ',
    icon: 'fa-regular fa-map',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
  },
  satellite: {
    name: 'Vệ tinh',
    icon: 'fa-solid fa-satellite',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
  }
};

export default function ListingLocationMap({
  city,
  district,
  targetCoords,
  formattedAddress,
  googlePlaceId,
  isGeocoding = false,
  onLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [coords, setCoords] = useState({ lat: 16.0544, lng: 108.2022 });
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' hoặc 'satellite'

  // Xác định tọa độ tâm: Ưu tiên tọa độ từ Google Maps Geocoding -> Quận -> Thành phố
  const getTargetCenter = useCallback(() => {
    if (targetCoords?.lat && targetCoords?.lng) {
      return { lat: Number(targetCoords.lat), lng: Number(targetCoords.lng), zoom: 16 };
    }
    if (district && DISTRICT_COORDS[district]) {
      return { ...DISTRICT_COORDS[district], zoom: 15 };
    }
    return DEFAULT_CENTER;
  }, [district, targetCoords]);

  // Khởi tạo bản đồ với Google Maps Tile Layer
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
          zoom: center.zoom || 15,
          zoomControl: false,
          scrollWheelZoom: true,
          attributionControl: false
        });

        // Layer Google Maps chuẩn (Roadmap hoặc Vệ tinh Hybrid)
        const currentUrl = GOOGLE_MAP_LAYERS[mapType]?.url || GOOGLE_MAP_LAYERS.roadmap.url;
        const tileLayer = window.L.tileLayer(currentUrl, {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);

        tileLayerRef.current = tileLayer;

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
        console.warn('Google Map initialization retry...', err);
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

  // Đổi kiểu hiển thị bản đồ (Bản đồ đường Google Maps / Vệ tinh Google)
  useEffect(() => {
    if (tileLayerRef.current && GOOGLE_MAP_LAYERS[mapType]) {
      tileLayerRef.current.setUrl(GOOGLE_MAP_LAYERS[mapType].url);
    }
  }, [mapType]);

  // Tự động di chuyển góc nhìn (PanTo) khi Google Maps Geocoding trả về tọa độ mới
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      const center = getTargetCenter();
      mapInstanceRef.current.setView([center.lat, center.lng], center.zoom || 16, { animate: true });
      setCoords({ lat: center.lat, lng: center.lng });
    }
  }, [targetCoords, district, getTargetCenter, isMapReady]);

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

  const effectivePlaceId = googlePlaceId || null;
  const googleMapsUrl = effectivePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(effectivePlaceId)}`
    : `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="space-y-2 pt-4 border-t border-slate-200">
      {/* Header Chọn vị trí & Nút Xem Google Maps + Đặt lại */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
          <i className="fa-solid fa-map-location-dot text-red-600"></i>
          <span>Vị trí trên Google Maps</span>
          {isGeocoding && (
            <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1">
              <i className="fa-solid fa-spinner fa-spin text-red-500"></i> Đang định vị...
            </span>
          )}
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

      {/* Thông báo định vị địa chỉ từ Google Maps */}
      {formattedAddress && (
        <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/90 rounded-xl px-3 py-1.5 text-xs text-emerald-950">
          <div className="flex items-center gap-1.5 min-w-0">
            <i className="fa-solid fa-circle-check text-emerald-600 shrink-0 text-xs"></i>
            <span className="truncate">
              Tâm bản đồ Google Maps: <strong>{formattedAddress}</strong>
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

      {/* Khung Bản đồ Google Maps với ghim tâm tương tác */}
      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100 mt-2">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Nút chuyển đổi kiểu bản đồ Google Maps (Bản đồ / Vệ tinh) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 font-medium transition flex items-center gap-1 ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <i className="fa-regular fa-map text-[11px]"></i>
            <span>Bản đồ</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 font-medium transition flex items-center gap-1 border-l border-slate-200 ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <i className="fa-solid fa-satellite text-[11px]"></i>
            <span>Vệ tinh</span>
          </button>
        </div>

        {/* Ghim trung tâm cố định (Google Maps Marker Pin) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 -translate-y-4">
          <div className="relative flex flex-col items-center animate-bounce-subtle">
            <i className="fa-solid fa-location-dot text-red-600 text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] filter"></i>
            <div className="w-2.5 h-1 bg-black/40 rounded-full blur-[1px] -mt-1"></div>
          </div>
        </div>

        {/* Logo Google Maps chính thống ở góc dưới trái */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs border border-slate-200/80 flex items-center gap-1 select-none pointer-events-none">
            <span className="text-[11px] font-bold tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </span>
          </div>
          {/* Badge tọa độ thu nhỏ */}
          <div className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs pointer-events-none">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
}
