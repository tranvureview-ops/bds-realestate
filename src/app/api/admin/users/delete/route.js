import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'server-db.json');

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let supabaseDeleted = false;

    if (url && (serviceKey || anonKey)) {
      // Ưu tiên dùng service_role key nếu có để bypass RLS xóa sạch vật lý
      const supabase = createClient(url, serviceKey || anonKey, {
        auth: { persistSession: false }
      });

      // 1. Xóa vật lý dòng dữ liệu trong bảng profiles
      const { data: delData, error: delError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select();

      if (!delError && delData && delData.length > 0) {
        supabaseDeleted = true;
      }

      // 2. Xóa khỏi platform_settings.bds_users_list
      try {
        const { data: settingRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'bds_users_list')
          .single();

        if (settingRow?.value && Array.isArray(settingRow.value)) {
          const cleaned = settingRow.value.filter(u => u.id !== userId);
          await supabase
            .from('platform_settings')
            .upsert({ key: 'bds_users_list', value: cleaned, updated_at: new Date().toISOString() });
        }
      } catch (setErr) {
        // ignore
      }
    }

    // 3. Xóa khỏi file server-db.json cục bộ
    try {
      if (fs.existsSync(DB_FILE)) {
        const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8') || '{}');
        if (Array.isArray(currentDb.bds_users_list)) {
          currentDb.bds_users_list = currentDb.bds_users_list.filter(u => u.id !== userId);
          fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2), 'utf-8');
        }
      }
    } catch (fsErr) {
      // ignore
    }

    return NextResponse.json({ success: true, userId, supabaseDeleted });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
