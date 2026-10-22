import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * MODULE SERVER-SIDE QUẢN LÝ CẤU HÌNH BẢO MẬT & BỘ NHỚ ĐỆM GEOCODING MD5
 * Chỉ chạy trên môi trường Node.js Server-side (API Routes)
 */

const DB_PATH = path.resolve(process.cwd(), 'server-db.json');

// In-memory cache tốc độ mili-giây
const memoryGeocodeCache = new Map();

// =======================================================================
// 1. QUẢN LÝ CẤU HÌNH BẢO MẬT (SYSTEM SETTINGS - GOOGLE MAPS API KEY)
// =======================================================================

/**
 * Lấy cấu hình hệ thống theo key (Ví dụ: google_maps_api_key)
 */
export async function getSystemSetting(key) {
  if (!key) return null;

  // 1. Ưu tiên tra cứu Supabase Cloud (Bảng system_settings)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();

      if (!error && data?.setting_value) {
        return data.setting_value;
      }
    } catch (_) {}
  }

  // 2. Fallback: Lấy từ file server-db.json
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      if (json.bds_system_settings?.[key]) {
        return json.bds_system_settings[key];
      }
    }
  } catch (_) {}

  // 3. Fallback cuối cùng: process.env
  if (key === 'google_maps_api_key') {
    return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null;
  }

  return null;
}

/**
 * Lưu / Cập nhật cấu hình hệ thống (Admin Settings)
 */
export async function saveSystemSetting(key, value, description = '') {
  if (!key) return false;

  let savedCloud = false;

  // 1. Lưu lên Supabase Cloud
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          description: description || 'Cấu hình quản trị website',
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (!error) {
        savedCloud = true;
      }
    } catch (err) {
      console.warn('Lỗi lưu system_settings lên Supabase:', err?.message);
    }
  }

  // 2. Luôn đồng bộ bản sao vào server-db.json
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      if (!json.bds_system_settings) json.bds_system_settings = {};
      json.bds_system_settings[key] = value;
      fs.writeFileSync(DB_PATH, JSON.stringify(json, null, 2), 'utf8');
    }
  } catch (_) {}

  return true;
}

// =======================================================================
// 2. QUẢN LÝ BỘ NHỚ ĐỆM GEOCODING MD5 (CACHED GEOCODES)
// =======================================================================

/**
 * Tra cứu bộ nhớ đệm Geocoding theo mã MD5 (32 ký tự)
 */
export async function getCachedGeocode(addressHash) {
  if (!addressHash) return null;

  // 1. Kiểm tra RAM cache trước tiên (0ms)
  if (memoryGeocodeCache.has(addressHash)) {
    return memoryGeocodeCache.get(addressHash);
  }

  // 2. Tra cứu Supabase Cloud bảng cached_geocodes
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('cached_geocodes')
        .select('*')
        .eq('address_hash', addressHash)
        .maybeSingle();

      if (!error && data) {
        memoryGeocodeCache.set(addressHash, data);
        return data;
      }
    } catch (_) {}
  }

  // 3. Tra cứu file local server-db.json
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      const found = json.bds_cached_geocodes?.[addressHash];
      if (found) {
        memoryGeocodeCache.set(addressHash, found);
        return found;
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Lưu bản ghi mới vào bộ nhớ đệm Geocoding (Cache MD5)
 */
export async function saveCachedGeocode(record) {
  if (!record?.address_hash) return false;

  const cleanRecord = {
    address_hash: record.address_hash,
    raw_address: record.raw_address || '',
    clean_address: record.clean_address || '',
    new_ward: record.new_ward || '',
    new_district: record.new_district || '',
    lat: Number(record.lat),
    lng: Number(record.lng),
    place_id: record.place_id || '',
    is_merged: Boolean(record.is_merged),
    created_at: new Date().toISOString()
  };

  // 1. Lưu vào RAM cache
  memoryGeocodeCache.set(cleanRecord.address_hash, cleanRecord);

  // 2. Lưu vào Supabase Cloud
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('cached_geocodes')
        .upsert(cleanRecord, { onConflict: 'address_hash' });
    } catch (err) {
      console.warn('Lỗi lưu cached_geocodes lên Supabase:', err?.message);
    }
  }

  // 3. Lưu vào server-db.json
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      if (!json.bds_cached_geocodes) json.bds_cached_geocodes = {};
      json.bds_cached_geocodes[cleanRecord.address_hash] = cleanRecord;
      fs.writeFileSync(DB_PATH, JSON.stringify(json, null, 2), 'utf8');
    }
  } catch (_) {}

  return true;
}

/**
 * Đếm số lượng bản ghi trong bộ nhớ đệm Geocoding
 */
export async function countCachedGeocodes() {
  let count = memoryGeocodeCache.size;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { count: cloudCount, error } = await supabase
        .from('cached_geocodes')
        .select('*', { count: 'exact', head: true });

      if (!error && typeof cloudCount === 'number') {
        return cloudCount;
      }
    } catch (_) {}
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      if (json.bds_cached_geocodes) {
        return Object.keys(json.bds_cached_geocodes).length;
      }
    }
  } catch (_) {}

  return count;
}

/**
 * Xóa sạch bộ nhớ đệm Geocoding (Làm mới Cache)
 */
export async function clearAllCachedGeocodes() {
  memoryGeocodeCache.clear();

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('cached_geocodes').delete().neq('address_hash', '');
    } catch (_) {}
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const json = JSON.parse(raw);
      json.bds_cached_geocodes = {};
      fs.writeFileSync(DB_PATH, JSON.stringify(json, null, 2), 'utf8');
    }
  } catch (_) {}

  return true;
}
