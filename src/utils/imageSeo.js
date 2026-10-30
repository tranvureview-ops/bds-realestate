/**
 * Module Tối ưu hóa SEO Hình ảnh & Tự động sinh thẻ ALT chuẩn SEO theo Tiêu đề BĐS
 * Tuân thủ tiêu chuẩn Google Image SEO & Technical SEO của Batdongsan.com.vn
 */

export const DEFAULT_PROPERTY_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

export const DEFAULT_AVATAR_FALLBACK_IMAGE =
  '/avatars/ai-preset-1.jpg';

/**
 * Tự động tạo thẻ ALT hình ảnh chuẩn SEO theo Tiêu đề và ngữ cảnh bài đăng BĐS
 * 
 * @param {string} title Tiêu đề bài đăng hoặc tên dự án
 * @param {Object} [options]
 * @param {number} [options.index=0] Vị trí ảnh trong danh sách (0 là ảnh đại diện/chính)
 * @param {number} [options.total=1] Tổng số lượng ảnh
 * @param {'thumbnail'|'main'|'gallery'|'floorplan'|'vr360'|'agent'|'project'} [options.type='gallery'] Phân loại hiển thị
 * @param {string} [options.city] Tỉnh / Thành phố
 * @param {string} [options.district] Quận / Huyện
 * @param {string} [options.propertyType] Loại hình BĐS (vd: Căn hộ chung cư, Nhà riêng)
 * @param {string} [options.sceneName] Tên góc nhìn (nếu là VR 360 Panorama)
 * @param {string} [options.customContext] Ngữ cảnh phòng hoặc mô tả bổ sung
 * @returns {string} Thẻ ALT chuẩn hóa SEO tối ưu cho Google Image Search & Screen Readers
 */
export function buildImageAlt(title = '', options = {}) {
  const {
    index = 0,
    total = 1,
    type = 'gallery',
    city = '',
    district = '',
    propertyType = '',
    sceneName = '',
    customContext = ''
  } = options;

  const cleanTitle = (title || '').trim().replace(/\s+/g, ' ');
  const location = [district, city].filter(Boolean).join(', ');

  // 1. Trường hợp không có tiêu đề, tự động sinh thẻ ALT mô tả theo loại hình và vị trí
  if (!cleanTitle) {
    if (type === 'agent') return 'Chuyên viên tư vấn bất động sản - Ảnh đại diện';
    if (type === 'project') return `Hình ảnh dự án bất động sản ${location ? `tại ${location}` : 'Việt Nam'}`;
    const pType = propertyType || 'Bất động sản';
    return `Hình ảnh thực tế ${pType} ${location ? `tại ${location}` : 'chính chủ'}`;
  }

  // 2. Sơ đồ thiết kế mặt bằng (Floor plan)
  if (type === 'floorplan') {
    return `Sơ đồ bản vẽ thiết kế mặt bằng chi tiết - ${cleanTitle}`;
  }

  // 3. Góc nhìn thực tế ảo VR 360° Panorama
  if (type === 'vr360') {
    const scene = sceneName ? `(${sceneName}) ` : '';
    return `Không gian thực tế ảo VR 360° Panorama ${scene}- ${cleanTitle}`;
  }

  // 4. Ảnh đại diện chuyên viên / môi giới phụ trách tin
  if (type === 'agent') {
    const name = customContext || 'Chuyên viên tư vấn';
    return `Chuyên viên tư vấn ${name} - Phụ trách tin đăng ${cleanTitle}`;
  }

  // 5. Ảnh phối cảnh dự án
  if (type === 'project') {
    return `Hình ảnh phối cảnh dự án ${cleanTitle} ${location ? `tại ${location}` : ''}`.trim();
  }

  // 6. Ảnh thẻ bài đăng trong danh sách / Thumbnail (Listing Card, Grid, Drawer)
  if (type === 'thumbnail') {
    return location 
      ? `${cleanTitle} - Bất động sản tại ${location}`
      : `${cleanTitle} - Bất động sản chính chủ`;
  }

  // 7. Ảnh chính / Ảnh bìa chi tiết (Hero / Main photo index 0)
  if (type === 'main' || index === 0) {
    return `Ảnh chụp thực tế: ${cleanTitle} - Hình ảnh chính`;
  }

  // 8. Ảnh thư viện chi tiết (Gallery photos index 1, 2, 3...)
  if (customContext) {
    return `${cleanTitle} - ${customContext} (Hình ảnh ${index + 1})`;
  }

  return `${cleanTitle} - Hình ảnh chi tiết ${index + 1}`;
}

/**
 * Tự động sinh thuộc tính responsive (srcSet, sizes) cho ảnh CDN (Unsplash, Cloudinary...)
 * Giúp thiết bị di động chỉ tải ảnh có kích thước phù hợp (480px thay vì 1200px),
 * tiết kiệm > 75% băng thông mạng và tối ưu LCP (Largest Contentful Paint) theo chuẩn Google Lighthouse.
 */
export function getResponsiveImageProps(src, type = 'gallery') {
  if (!src || typeof src !== 'string') return {};

  // 1. Tối ưu ảnh Unsplash CDN
  if (src.includes('images.unsplash.com')) {
    try {
      const cleanBase = src
        .replace(/[?&]w=\d+/g, '')
        .replace(/[?&]q=\d+/g, '')
        .replace(/[?&]fit=[^&]+/g, '')
        .replace(/[?&]auto=[^&]+/g, '');
      const connector = cleanBase.includes('?') ? '&' : '?';

      const src480 = `${cleanBase}${connector}auto=format&fit=crop&w=480&q=75`;
      const src768 = `${cleanBase}${connector}auto=format&fit=crop&w=768&q=80`;
      const src1200 = `${cleanBase}${connector}auto=format&fit=crop&w=1200&q=80`;

      let sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px';
      if (type === 'main') {
        sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px';
      } else if (type === 'thumbnail') {
        sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px';
      } else if (type === 'gallery') {
        sizes = '(max-width: 640px) 50vw, 250px';
      }

      return {
        srcSet: `${src480} 480w, ${src768} 768w, ${src1200} 1200w`,
        sizes
      };
    } catch (e) {
      return {};
    }
  }

  return {};
}
