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

  // Chuẩn hóa kích thước src fallback tránh tải ảnh quá cỡ cho Lighthouse
  const optimizedSrc = useMemo(() => {
    if (imgSrc && imgSrc.includes('images.unsplash.com')) {
      const cleanBase = imgSrc
        .replace(/[?&]w=\d+/g, '')
        .replace(/[?&]q=\d+/g, '')
        .replace(/[?&]fit=[^&]+/g, '')
        .replace(/[?&]auto=[^&]+/g, '');
      const connector = cleanBase.includes('?') ? '&' : '?';
      if (type === 'agent') {
        return `${cleanBase}${connector}auto=format&fit=crop&w=128&q=80`;
      }
      if (type === 'lightbox' || type === 'fullscreen') {
        return `${cleanBase}${connector}auto=format&fit=crop&w=1600&q=85`;
      }
      if (type === 'main') {
        return `${cleanBase}${connector}auto=format&fit=crop&w=800&q=75`;
      }
      return `${cleanBase}${connector}auto=format&fit=crop&w=600&q=75`;
    }
    return imgSrc;
  }, [imgSrc, type]);

  return (
    <img
      {...rest}
      src={optimizedSrc}
      srcSet={rest.srcSet || responsiveProps.srcSet}
      sizes={rest.sizes || responsiveProps.sizes}
      alt={computedAlt}
      title={title || computedAlt}
      loading={priority ? 'eager' : (loading || 'lazy')}
      decoding={priority ? 'sync' : decoding}
      fetchPriority={priority ? 'high' : (fetchPriority || undefined)}
      fetchpriority={priority ? 'high' : (fetchPriority || undefined)}
      onError={handleError}
      className={className}
    />
  );
}
