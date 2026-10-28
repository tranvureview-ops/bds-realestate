'use client';

import React, { useState, useEffect } from 'react';
import { buildImageAlt, DEFAULT_PROPERTY_FALLBACK_IMAGE, DEFAULT_AVATAR_FALLBACK_IMAGE } from '../utils/imageSeo';

/**
 * Component Hiển Thị Hình Ảnh Chuẩn SEO (Image SEO Component)
 * - Tự động tạo thẻ ALT và TITLE theo tiêu đề tin đăng và ngữ cảnh
 * - Hỗ trợ lazy loading thông minh (loading="lazy", decoding="async")
 * - Tự động nạp eager và fetchPriority="high" khi priority={true} (dành cho ảnh LCP/Hero)
 * - Tự động fallback ảnh thay thế khi ảnh gốc lỗi 404
 */
export default function SeoImage({
  src,
  alt = '',
  title,
  propertyTitle = '',
  property = null,
  index = 0,
  total = 1,
  type = 'gallery',
  priority = false,
  fallbackSrc,
  className = '',
  loading,
  decoding = 'async',
  fetchPriority,
  onError,
  sceneName = '',
  customContext = '',
  ...rest
}) {
  const defaultFallback = type === 'agent' ? DEFAULT_AVATAR_FALLBACK_IMAGE : DEFAULT_PROPERTY_FALLBACK_IMAGE;
  const targetFallback = fallbackSrc || defaultFallback;

  const [imgSrc, setImgSrc] = useState(src || targetFallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || targetFallback);
    setHasError(false);
  }, [src, targetFallback]);

  // Tự động sinh ALT nếu chưa có hoặc là chuỗi rỗng
  const effectiveTitle = propertyTitle || property?.title || '';
  const computedAlt = (alt && alt.trim())
    ? alt.trim()
    : buildImageAlt(effectiveTitle, {
        index,
        total,
        type,
        city: property?.city,
        district: property?.district,
        propertyType: property?.propertyType,
        sceneName,
        customContext
      });

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(targetFallback);
    }
    if (onError) onError(e);
  };

  return (
    <img
      src={imgSrc}
      alt={computedAlt}
      title={title || computedAlt}
      loading={loading || (priority ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority || (priority ? 'high' : 'auto')}
      onError={handleError}
      className={className}
      {...rest}
    />
  );
}
