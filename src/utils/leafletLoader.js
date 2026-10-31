/**
 * Trình nạp Leaflet Map SDK theo cơ chế Dynamic On-Demand Loader
 * Giúp triệt tiêu 145KB JavaScript không sử dụng trên luồng chính của tất cả các trang
 * Chỉ tải và biên dịch Leaflet.js & Leaflet.css khi người dùng thực sự kích hoạt bản đồ
 */
let leafletPromise = null;

export function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve) => {
    // 1. Tải stylesheet Leaflet chỉ khi cần
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = '/leaflet/leaflet.css';
      document.head.appendChild(link);
    }

    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingScript = document.getElementById('leaflet-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      return;
    }

    // 2. Tải mã nguồn Leaflet SDK bất đồng bộ
    const script = document.createElement('script');
    script.id = 'leaflet-script';
    script.src = '/leaflet/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      leafletPromise = null;
      resolve(null);
    };
    document.body.appendChild(script);
  });

  return leafletPromise;
}
