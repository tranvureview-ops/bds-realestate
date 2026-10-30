'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { buildImageAlt, getResponsiveImageProps, DEFAULT_PROPERTY_FALLBACK_IMAGE, DEFAULT_AVATAR_FALLBACK_IMAGE } from '../utils/imageSeo';

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

  const responsiveProps = useMemo(() => {
    return getResponsiveImageProps(imgSrc, type);
  }, [imgSrc, type]);

  return (
    <img
      src={imgSrc}
      srcSet={rest.srcSet || responsiveProps.srcSet}
      sizes={rest.sizes || responsiveProps.sizes}
      alt={computedAlt}
      title={title || computedAlt}
      loading={loading || (priority ? undefined : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority || (priority ? 'high' : undefined)}
      fetchpriority={fetchPriority || (priority ? 'high' : undefined)}
      onError={handleError}
      className={className}
      {...rest}
    />
  );
}
