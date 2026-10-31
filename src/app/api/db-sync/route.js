import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase, fetchFullSupabaseDb, syncFullDbToSupabase } from '../../../lib/supabase';
import { encryptAES256 } from '../../../utils/cryptoUtils';
import { verifyAdminRequest } from '../../../utils/adminAuth';

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

    // 0. BẢO VỆ ĐẶC QUYỀN ADMIN: Ngăn chặn kẻ xấu giả mạo gọi API ghi đè cấu hình sàn hoặc leo thang đặc quyền
    const sensitiveAdminKeys = ['bds_system_config', 'bds_payment_config', 'bds_email_config', 'bds_vip_packages', 'bds_membership_packages'];
    const touchesSensitiveKey = sensitiveAdminKeys.some(k => k in payload);
    const touchesAdminUsers = Array.isArray(payload.bds_users_list) && payload.bds_users_list.some(u => u && u.role === 'admin');

    if (touchesSensitiveKey || touchesAdminUsers) {
      const adminAuth = verifyAdminRequest(request);
      if (!adminAuth.valid) {
        return NextResponse.json({ 
          error: 'Unauthorized: Thao tác cập nhật cấu hình quản trị hệ thống yêu cầu quyền Quản trị viên!' 
        }, { status: 401 });
      }
    }

    // 1. Tải các cấu hình hiện có để hợp nhất sâu (Deep Merge) tránh việc lưu từng phần làm mất các trường khác
    let existingSettings = {};
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.from('platform_settings').select('key, value');
        if (data && Array.isArray(data)) {
          data.forEach(r => {
            if (r.key && r.value) existingSettings[r.key] = r.value;
          });
        }
      } catch {}
    }

    // Nếu không có từ Supabase, fallback đọc từ file server-db.json
    if (Object.keys(existingSettings).length === 0 && fs.existsSync(DB_FILE)) {
      try {
        const local = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8') || '{}');
        existingSettings = local;
      } catch {}
    }

    const mergedPayload = { ...payload };
    const objectKeys = [
      'bds_header_config',
      'bds_footer_config',
      'bds_system_config',
      'bds_payment_config',
      'bds_single_config',
      'bds_email_config',
      'bds_rewards_config'
    ];
    for (const k of objectKeys) {
      if (mergedPayload[k] && typeof mergedPayload[k] === 'object' && !Array.isArray(mergedPayload[k])) {
        const prevVal = existingSettings[k] || {};
        mergedPayload[k] = { ...prevVal, ...mergedPayload[k] };
      }
    }

    if (Array.isArray(payload.bds_users_list)) {
      // Khi payload gửi bds_users_list, đây là danh sách mới nhất từ client (đã xử lý thêm/sửa/xóa).
      // Tuyệt đối không hợp nhất với prevUsers để tránh hồi sinh người dùng đã bị xóa.
      mergedPayload.bds_users_list = payload.bds_users_list.filter(
        u => u && u.id && u.status !== 'deleted' && u.roleName !== 'deleted' && u.name !== '[Đã xóa]'
      );
    }

    // Tự động mã hóa mật khẩu SMTP bằng thuật toán AES-256-GCM trước khi ghi vào Database
    if (mergedPayload.bds_email_config?.smtp?.password) {
      const rawPass = String(mergedPayload.bds_email_config.smtp.password).trim();
      if (rawPass && rawPass.split(':').length !== 3) {
        mergedPayload.bds_email_config.smtp.password = encryptAES256(rawPass);
      }
    }

    // 2. Đồng bộ lên đám mây Supabase trước (đặc biệt quan trọng trên Vercel Serverless Function)
    let supabaseSynced = false;
    if (isSupabaseConfigured()) {
      try {
        supabaseSynced = await syncFullDbToSupabase(mergedPayload);
      } catch (err) {
        console.warn('Lỗi ghi Supabase trong POST /api/db-sync:', err.message);
      }
    }

    // 3. Dự phòng hợp nhất vào server-db.json cục bộ (cho localhost / máy chủ có quyền ghi đĩa)
    try {
      let currentDb = {};
      if (fs.existsSync(DB_FILE)) {
        try {
          currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8') || '{}');
        } catch {}
      }
      const mergedDb = { ...currentDb, ...mergedPayload };
      fs.writeFileSync(DB_FILE, JSON.stringify(mergedDb, null, 2), 'utf-8');
    } catch (fsErr) {
      // Bỏ qua lỗi EROFS trên môi trường serverless (như Vercel có hệ thống tệp chỉ đọc)
      console.warn('Không thể ghi file cục bộ (môi trường serverless read-only):', fsErr.message);
    }

    return NextResponse.json({ 
      success: true, 
      source: supabaseSynced ? 'supabase_saved' : 'local_saved', 
      supabaseSynced 
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
