import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured, fetchFullSupabaseDb, syncFullDbToSupabase } from '../../../lib/supabase';

const DB_FILE = path.resolve(process.cwd(), 'server-db.json');

export async function GET() {
  try {
    // 1. Nếu Supabase đã được cấu hình, ưu tiên lấy dữ liệu trực tiếp từ Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const cloudData = await fetchFullSupabaseDb();
        if (cloudData && (cloudData.bds_properties?.length > 0 || cloudData.bds_header_config)) {
          return NextResponse.json({
            ...cloudData,
            _source: 'supabase'
          });
        }
      } catch (err) {
        console.warn('Lỗi kết nối Supabase trong GET /api/db-sync, chuyển về server-db.json:', err.message);
      }
    }

    // 2. Dự phòng đọc từ server-db.json trên máy chủ
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return NextResponse.json({
        ...JSON.parse(data || '{}'),
        _source: 'local_file'
      });
    }
    return NextResponse.json({});
  } catch (e) {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const rawText = await request.text();
    const payload = JSON.parse(rawText || '{}');

    // 1. Luôn hợp nhất và lưu vào server-db.json cục bộ để đảm bảo tốc độ và dự phòng offline
    let currentDb = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8') || '{}');
      } catch (err) {}
    }
    const mergedDb = { ...currentDb, ...payload };
    fs.writeFileSync(DB_FILE, JSON.stringify(mergedDb, null, 2), 'utf-8');

    // 2. Nếu đã kết nối Supabase, đồng bộ lên đám mây Supabase
    let supabaseSynced = false;
    if (isSupabaseConfigured()) {
      try {
        supabaseSynced = await syncFullDbToSupabase(payload);
      } catch (err) {
        console.warn('Lỗi ghi Supabase trong POST /api/db-sync:', err.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      source: 'local_saved', 
      supabaseSynced 
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
