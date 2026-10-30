import HomePage from '../views/HomePage';
import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { isSupabaseConfigured, fetchFullSupabaseDb } from '../lib/supabase';

const getPageDb = cache(async () => {
  try {
    if (isSupabaseConfigured()) {
      const cloud = await fetchFullSupabaseDb();
      if (cloud?.bds_system_config) return cloud;
    }
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      return JSON.parse(fs.readFileSync(dbFile, 'utf8') || '{}');
    }
  } catch {}
  return null;
});

export async function generateMetadata() {
  const db = await getPageDb();
  const sys = db?.bds_system_config || {};
  const brand = sys.brandShortName || 'Sàn Bất Động Sản';
  return {
    title: {
      absolute: `${brand} - Kênh Thông Tin & Giao Dịch Bất Động Sản Hàng Đầu`
    },
    description: sys.tagline ? `${brand} - ${sys.tagline}` : 'Khám phá hàng ngàn bất động sản bán và cho thuê với thông tin minh bạch, định giá chính xác và hình ảnh thực tế.',
  };
}

export default function Page() {
  return <HomePage />;
}
