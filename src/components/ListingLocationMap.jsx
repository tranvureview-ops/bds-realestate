'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const CITY_COORDS = {
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022, zoom: 14 },
  'Hà Nội': { lat: 21.0285, lng: 105.8542, zoom: 14 },
  'TP. Hồ Chí Minh': { lat: 10.7769, lng: 106.7009, zoom: 14 },
  'Hải Phòng': { lat: 20.8449, lng: 106.6881, zoom: 14 },
  'Cần Thơ': { lat: 10.0452, lng: 105.7469, zoom: 14 },
  'Khánh Hòa': { lat: 12.2388, lng: 109.1967, zoom: 14 },
  'Bình Dương': { lat: 10.9804, lng: 106.6519, zoom: 14 },
  'Đồng Nai': { lat: 10.9574, lng: 106.8427, zoom: 14 }
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

export default function ListingLocationMap({ city, district, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [coords, setCoords] = useState({ lat: 16.0544, lng: 108.2022 });

  // Lấy tọa độ mục tiêu dựa trên Tỉnh/Thành & Quận/Huyện
  const getTargetCenter = useCallback(() => {
    if (district && DISTRICT_COORDS[district]) {
      return { ...DISTRICT_COORDS[district], zoom: 15 };
    }
    if (city && CITY_COORDS[city]) {
      return CITY_COORDS[city];
    }
    return { lat: 16.0544, lng: 108.2022, zoom: 14 };
  }, [city, district]);

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

  // Tự động di chuyển góc nhìn khi người dùng đổi Tỉnh / Quận
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      const center = getTargetCenter();
      mapInstanceRef.current.setView([center.lat, center.lng], center.zoom || 14, { animate: true });
      setCoords({ lat: center.lat, lng: center.lng });
    }
  }, [city, district, getTargetCenter, isMapReady]);

  // Hàm Đặt lại vị trí ban đầu
  const handleReset = () => {
    if (mapInstanceRef.current) {
      const center = getTargetCenter();
      mapInstanceRef.current.setView([center.lat, center.lng], center.zoom || 14, { animate: true });
      setCoords({ lat: center.lat, lng: center.lng });
      if (onLocationChange) {
        onLocationChange({ lat: center.lat, lng: center.lng });
      }
    }
  };

  return (
    <div className="space-y-1.5 pt-4 border-t border-slate-200">
      {/* Header Chọn vị trí & Nút Đặt lại chuẩn Batdongsan */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-xs sm:text-sm text-slate-900">
          Chọn vị trí trên bản đồ
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-800 hover:text-red-600 underline font-medium cursor-pointer transition"
        >
          Đặt lại
        </button>
      </div>

      <div className="text-[11px] text-slate-500">
        Kéo bản đồ để đổi vị trí ghim
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
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
