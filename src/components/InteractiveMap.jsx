'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function InteractiveMap({ properties, activePropertyId = null, height = '500px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { openPropertyDetail } = useRealEstate();

  const [activeAmenity, setActiveAmenity] = useState('all');

  useEffect(() => {
    let intervalId = null;
    let isCancelled = false;

    const initMap = () => {
      if (typeof window === 'undefined' || !window.L || !mapContainerRef.current) return false;
      if (isCancelled) return true;

      // Destroy existing map if any
      if (mapInstanceRef.current) {
        try {
          if (typeof mapInstanceRef.current.stop === 'function') mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }

      // Default center (Vietnam center or first property)
      const firstProp = properties.find(p => p.lat && p.lng) || { lat: 10.7951, lng: 106.7219 };
      const map = window.L.map(mapContainerRef.current, {
        center: [firstProp.lat, firstProp.lng],
        zoom: 12,
        scrollWheelZoom: true
      });

      // OpenStreetMap standard tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Đất Biển Đà Nẵng GIS'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Render Markers
      markersRef.current = [];
      const bounds = window.L.latLngBounds();

      properties.forEach(prop => {
        if (!prop.lat || !prop.lng) return;

        const isDiamond = prop.vipPackageId === 'vip-diamond';
        const isGold = prop.vipPackageId === 'vip-gold';
        const pinColor = isDiamond ? '#ef4444' : isGold ? '#f59e0b' : '#3b82f6';

        // Custom HTML Marker Icon
        const customIcon = window.L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="
              background-color: ${pinColor};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              transform: translate(-50%, -100%);
            ">
              <span>${isDiamond ? '💎' : '📍'}</span>
              <span>${prop.priceDisplay}</span>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });

        if (typeof prop.lat === 'number' && !isNaN(prop.lat) && typeof prop.lng === 'number' && !isNaN(prop.lng)) {
          const marker = window.L.marker([prop.lat, prop.lng], { icon: customIcon }).addTo(map);

          // Popup Content
          const popupHtml = `
            <div style="width: 200px; font-family: sans-serif; cursor: pointer;" id="popup-${prop.id}">
              <img src="${prop.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
              <div style="font-size: 11px; color: #ef4444; font-weight: bold; text-transform: uppercase;">${prop.vipPackageId === 'vip-diamond' ? 'VIP KIM CƯƠNG' : 'BẤT ĐỘNG SẢN'}</div>
              <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px; line-height: 1.2; max-height: 32px; overflow: hidden;">${prop.title}</div>
              <div style="font-size: 14px; font-weight: 800; color: #047857; margin-bottom: 4px;">${prop.priceDisplay} • ${prop.area}m²</div>
              <div style="font-size: 11px; color: #64748b;">${prop.district}, ${prop.city}</div>
            </div>
          `;

          marker.bindPopup(popupHtml);

          marker.on('popupopen', () => {
            const popupElem = document.getElementById(`popup-${prop.id}`);
            if (popupElem) {
              popupElem.onclick = () => {
                openPropertyDetail(prop);
              };
            }
          });

          bounds.extend([prop.lat, prop.lng]);
          markersRef.current.push({ id: prop.id, marker });
        }
      });

      if (markersRef.current.length > 0 && typeof bounds.isValid === 'function' && bounds.isValid()) {
        try {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        } catch (e) {
          console.warn('fitBounds error:', e);
        }
      }
      return true;
    };

    if (!initMap()) {
      intervalId = setInterval(() => {
        if (initMap()) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 200);
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (mapInstanceRef.current) {
        try {
          if (typeof mapInstanceRef.current.stop === 'function') mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [properties, openPropertyDetail]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map Header Controls */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1 text-emerald-700">
          <i className="fa-solid fa-map-location-dot"></i>
          Bản đồ BĐS Số
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-[11px] font-normal text-slate-500">
          Hiển thị {properties.length} vị trí
        </span>
      </div>

      {/* Amenity Filter Quick Chips */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200 hidden sm:flex items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-500 font-semibold px-1">Tiện ích:</span>
        <button
          onClick={() => setActiveAmenity('all')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeAmenity === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveAmenity('school')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeAmenity === 'school' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          🏫 Trường học
        </button>
        <button
          onClick={() => setActiveAmenity('hospital')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeAmenity === 'hospital' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          🏥 Bệnh viện
        </button>
        <button
          onClick={() => setActiveAmenity('mall')}
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${activeAmenity === 'mall' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          🛒 Siêu thị
        </button>
      </div>

      {/* Actual Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', zIndex: 1 }}
      />
    </div>
  );
}
