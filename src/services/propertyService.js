import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { INITIAL_PROPERTIES } from '../data/mockData';
import { isSupabaseConfigured, fetchSupabaseProperties } from '../lib/supabase';
import { toVietnameseSlug, getPropertyPermalink } from '../utils/permalink';

let inMemoryCache = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60s memory cache giúp tăng tốc độ tải trang cực nhanh

/**
 * Lấy danh sách bất động sản phía server từ Supabase hoặc file fallback server-db.json (kèm cache)
 * @returns {Promise<Array>} Danh sách bất động sản
 */
async function getPropertiesInternal() {
  const now = Date.now();
  if (inMemoryCache && (now - lastCacheTimestamp < CACHE_TTL_MS)) {
    return inMemoryCache;
  }

  try {
    if (isSupabaseConfigured()) {
      try {
        const cloudProperties = await fetchSupabaseProperties();
        if (Array.isArray(cloudProperties) && cloudProperties.length > 0) {
          inMemoryCache = cloudProperties;
          lastCacheTimestamp = Date.now();
          return inMemoryCache;
        }
      } catch (error) {
        // Fallback to local server-db.json when Supabase request fails
      }
    }

    const databaseFilePath = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(databaseFilePath)) {
      const fileContent = fs.readFileSync(databaseFilePath, 'utf8');
      const parsedDatabase = JSON.parse(fileContent || '{}');
      if (Array.isArray(parsedDatabase.bds_properties) && parsedDatabase.bds_properties.length > 0) {
        inMemoryCache = parsedDatabase.bds_properties;
        lastCacheTimestamp = Date.now();
        return inMemoryCache;
      }
    }
  } catch (error) {
    // Return mock properties on read failure
  }

  inMemoryCache = INITIAL_PROPERTIES;
  lastCacheTimestamp = Date.now();
  return inMemoryCache;
}

export const fetchServerProperties = cache(getPropertiesInternal);

/**
 * Tìm bài đăng bất động sản theo tiêu chí nhận diện URL chuẩn
 * Ưu tiên: Mã BĐS định danh > Canonical Permalink > SEO Slug
 * @param {Array} propertyList Danh sách tin BĐS
 * @param {Object} parsedUrl Thông tin URL đã phân tích từ parsePropertyUrl
 * @param {string} currentPath Đường dẫn hiện tại
 * @returns {Object|null} Bất động sản tìm thấy hoặc null
 */
export function findProperty(propertyList, parsedUrl, currentPath = '') {
  if (!propertyList || !Array.isArray(propertyList) || !parsedUrl) {
    return null;
  }

  // Tiêu chí 1: Khớp mã BĐS định danh chuẩn (ID-first: -pr{id}, /pr{id}, /bds-{id})
  if (parsedUrl.normalizedBdsId || parsedUrl.rawIdNumber) {
    const idMatch = findPropertyById(propertyList, parsedUrl.normalizedBdsId, parsedUrl.rawIdNumber);
    if (idMatch) return idMatch;
  }

  // Tiêu chí 2: Khớp chính xác Canonical Permalink
  if (currentPath) {
    const permalinkMatch = findPropertyByPermalink(propertyList, currentPath);
    if (permalinkMatch) return permalinkMatch;
  }

  // Tiêu chí 3: Khớp slug tiêu đề (ưu tiên tin đang active)
  if (parsedUrl.rawSlug) {
    return findPropertyBySlug(propertyList, parsedUrl.rawSlug);
  }

  return null;
}

function findPropertyById(propertyList, normalizedBdsId, rawIdNumber) {
  return propertyList.find((property) => {
    if (!property) return false;
    if (normalizedBdsId && property.id?.toUpperCase() === normalizedBdsId.toUpperCase()) {
      return true;
    }
    const propertyNumber = parseInt(String(property.id || '').replace(/\D/g, ''), 10);
    const parsedNumber = parseInt(String(rawIdNumber || '').replace(/\D/g, ''), 10);
    return !isNaN(propertyNumber) && !isNaN(parsedNumber) && propertyNumber === parsedNumber;
  });
}

function findPropertyByPermalink(propertyList, currentPath) {
  const cleanPath = currentPath.replace(/\/$/, '').toLowerCase();
  return propertyList.find((property) => {
    if (!property) return false;
    const propertyLink = getPropertyPermalink(property).replace(/\/$/, '').toLowerCase();
    return propertyLink === cleanPath;
  });
}

function findPropertyBySlug(propertyList, rawSlug) {
  const targetSlug = rawSlug.toLowerCase();
  const matchedList = propertyList.filter((property) => {
    if (!property) return false;
    if (property.slug && property.slug.toLowerCase() === targetSlug) return true;
    if (toVietnameseSlug(property.title) === targetSlug) return true;
    return false;
  });

  if (matchedList.length === 0) return null;
  return matchedList.find((property) => property.status === 'active') || matchedList[0];
}
