'use client';

import React from 'react';

/**
 * StandardPageContainer
 * Layout container chuẩn mực đồng bộ chiều rộng cho toàn bộ trang của Sàn BĐS Đất Biển Đà Nẵng.
 * Chiều rộng chuẩn: max-w-7xl (1280px), căn giữa, padding co giãn tự động theo màn hình di động/tablet/desktop.
 * Sử dụng wrapper này khi tạo bất kỳ trang mới nào để đảm bảo 100% đồng nhất layout với Header, Footer và toàn sàn.
 */
export default function StandardPageContainer({
  children,
  className = '',
  as: Component = 'div',
  size = 'standard', // 'standard' (max-w-7xl) | 'wide' (max-w-screen-2xl) | 'narrow' (max-w-4xl) | 'full'
  ...props
}) {
  const sizeClasses = {
    standard: 'max-w-7xl',
    wide: 'max-w-[94vw] 2xl:max-w-[1536px]',
    narrow: 'max-w-4xl',
    full: 'w-full'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.standard;

  return (
    <Component
      className={`w-full ${selectedSize} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
