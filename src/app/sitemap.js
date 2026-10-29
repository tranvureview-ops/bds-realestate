import { SITE_URL, PROPERTY_TAXONOMY, getPropertyPermalink } from '../utils/permalink';
import { fetchServerProperties } from '../services/propertyService';
import { INITIAL_PROPERTIES } from '../data/mockData';

/**
 * Next.js Metadata Route: Sitemap XML chuẩn SEO
 * Chỉ lập chỉ mục các URL gốc có giá trị SEO cao nhất:
 * 1. Trang chủ
 * 2. Danh mục chính (/nha-dat-ban, /nha-dat-cho-thue)
 * 3. 12 danh mục loại hình chuẩn SEO
 * 4. Các tin đăng bất động sản đang active (không đưa trang phân trang vào sitemap)
 */
export default async function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const now = new Date().toISOString();

  // 1. Trang chủ
  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/nha-dat-ban/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nha-dat-cho-thue/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bang-gia-tin-dang/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/goi-hoi-vien/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/khuyen-mai/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nhiem-vu/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trung-tam-phan-thuong/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trung-tam-phan-thuong/diem-danh-7-ngay/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trung-tam-phan-thuong/san-kho-bau-bds/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trung-tam-phan-thuong/du-doan-gia-bds/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/trung-tam-phan-thuong/doi-qua/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // 2. 12 Danh mục loại hình bán & cho thuê
  const taxonomyRoutes = [];
  for (const demand of ['sale', 'rent']) {
    const group = PROPERTY_TAXONOMY[demand];
    if (group?.types) {
      for (const typeInfo of Object.values(group.types)) {
        taxonomyRoutes.push({
          url: `${baseUrl}${typeInfo.slug}/`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }
    }
  }

  // 3. Danh sách tin đăng BĐS thực tế
  let properties = [];
  try {
    properties = await fetchServerProperties();
  } catch (_e) {
    properties = INITIAL_PROPERTIES;
  }
  if (!properties || properties.length === 0) {
    properties = INITIAL_PROPERTIES;
  }

  const propertyRoutes = properties.map((prop) => ({
    url: `${baseUrl}${getPropertyPermalink(prop)}`,
    lastModified: prop.publishedAt ? new Date(prop.publishedAt).toISOString() : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...taxonomyRoutes, ...propertyRoutes];
}
