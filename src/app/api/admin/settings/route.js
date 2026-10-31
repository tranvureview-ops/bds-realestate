import { NextResponse } from 'next/server';
import { getSystemSetting, saveSystemSetting, countCachedGeocodes, clearAllCachedGeocodes } from '../../../../lib/serverSettings';
import { verifyAdminRequest } from '../../../../utils/adminAuth';

/**
 * API ROUTE QUẢN TRỊ CẤU HÌNH HỆ THỐNG & GOOGLE MAPS API KEY (SERVER-SIDE BẢO MẬT)
 * Đường dẫn: /api/admin/settings
 */

// Helper che mờ API Key khi hiển thị trên giao diện Admin
function maskApiKey(key) {
  if (!key || key.length < 10) return '';
  return `${key.substring(0, 6)}••••••••••••••••${key.substring(key.length - 4)}`;
}

/**
 * GET: Lấy thông tin cấu hình Google Maps API và thống kê Cache MD5
 */
export async function GET(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    const rawKey = await getSystemSetting('google_maps_api_key');
    const cachedCount = await countCachedGeocodes();

    const isConfigured = Boolean(rawKey && rawKey !== 'your-google-maps-api-key');

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        maskedKey: maskApiKey(rawKey),
        rawKey: adminAuth.valid ? (rawKey || '') : '', // CHỈ trả về rawKey khi đã xác thực quyền Admin
        cachedCount: cachedCount || 0,
        estimatedSavingsUsd: ((cachedCount || 0) * 0.005).toFixed(2), // Mỗi request geocode Google tính ~0.005$
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Lỗi khi lấy cài đặt hệ thống:', err);
    return NextResponse.json(
      { success: false, error: 'Không thể đọc cấu hình hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * POST / PUT: Cập nhật Google Maps API Key vào bảng system_settings
 * Body: { mapsApiKey } hoặc { key, value }
 */
export async function POST(request) {
  return handleUpdate(request);
}

export async function PUT(request) {
  return handleUpdate(request);
}

async function handleUpdate(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Yêu cầu quyền Quản trị viên để cập nhật cài đặt hệ thống!' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const mapsApiKey = (body?.mapsApiKey || body?.google_maps_api_key || body?.value || '').trim();

    // 1. Kiểm tra đầu vào
    if (mapsApiKey !== undefined) {
      // Lưu vào bảng system_settings qua hàm bảo mật
      const success = await saveSystemSetting(
        'google_maps_api_key',
        mapsApiKey,
        'Khóa Google Maps Platform API Key cho định vị Geocoding và bản đồ'
      );

      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Lỗi ghi dữ liệu vào bảng system_settings' },
          { status: 500 }
        );
      }

      const cachedCount = await countCachedGeocodes();

      return NextResponse.json({
        success: true,
        message: mapsApiKey ? 'Đã lưu và kích hoạt Google Maps API Key thành công!' : 'Đã xóa Google Maps API Key.',
        isConfigured: Boolean(mapsApiKey),
        maskedKey: maskApiKey(mapsApiKey),
        cachedCount: cachedCount || 0
      });
    }

    return NextResponse.json(
      { success: false, error: 'Thiếu trường mapsApiKey trong yêu cầu' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Lỗi khi cập nhật cài đặt Admin:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật cấu hình' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Xóa sạch bộ nhớ đệm Geocoding (Làm mới Cache MD5)
 */
export async function DELETE(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Yêu cầu quyền Quản trị viên để xóa bộ nhớ đệm Geocoding!' },
        { status: 401 }
      );
    }

    await clearAllCachedGeocodes();
    return NextResponse.json({
      success: true,
      message: 'Đã xóa sạch bộ nhớ đệm Geocoding thành công!',
      cachedCount: 0
    });
  } catch (err) {
    console.error('Lỗi khi xóa bộ nhớ đệm Geocoding:', err);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa bộ nhớ đệm Geocoding' },
      { status: 500 }
    );
  }
}
