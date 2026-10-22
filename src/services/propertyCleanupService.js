import { getFullSystemDatabase, persistDatabaseSlice } from './serverDbService';

/**
 * Nén dữ liệu bài viết sang định dạng siêu nhẹ (Archive Light)
 * Giữ 1 thumbnail đại diện, lược bỏ VR360, gallery ảnh lớn, nén mô tả
 * Giảm 90% dung lượng DB mà vẫn giữ lịch sử báo cáo & doanh thu.
 * @param {Object} p Thông tin bài viết
 * @returns {Object} Bài viết sau khi nén
 */
export function archivePropertyLightHelper(p) {
  const safeThumbnail = (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';
  const truncatedDesc = (p.description || '').slice(0, 180) + '... [Dữ liệu đã nén lưu trữ tối ưu DB]';
  return {
    ...p,
    isArchived: true,
    archivedAt: new Date().toISOString(),
    status: 'archived',
    images: [safeThumbnail],
    vrScenes: [],
    floorPlanImages: [],
    videoUrl: null,
    hasVR360: false,
    description: truncatedDesc
  };
}

/**
 * Quét toàn bộ DB và tự động thực thi dọn dẹp các bài viết quá hạn
 * @returns {Promise<Object>} Kết quả dọn dẹp
 */
export async function executeAutoDatabaseCleanup() {
  const db = await getFullSystemDatabase();
  const cfg = db.bds_system_config || {};

  if (cfg.autoCleanupEnabled === false) {
    return {
      success: true,
      skipped: true,
      message: 'Tính năng tự động quét & dọn dẹp DB đang TẮT trong cấu hình hệ thống.'
    };
  }

  const retentionDays = Number(cfg.expiredRetentionDays) || 45;
  const action = cfg.expiredCleanupAction || 'archive_light';
  const trashDays = Number(cfg.trashRetentionDays) || 30;
  const now = Date.now();

  const properties = Array.isArray(db.bds_properties) ? db.bds_properties : [];
  let archivedCount = 0;
  let deletedCount = 0;
  let trashCleanedCount = 0;

  const nextProperties = [];
  for (const p of properties) {
    // 1. Dọn dẹp tin trong Thùng rác quá trashRetentionDays (ví dụ 30 ngày)
    if (p.isDeleted || p.status === 'trash') {
      const delTime = p.deletedAt ? new Date(p.deletedAt).getTime() : now;
      const daysInTrash = Math.floor((now - delTime) / (1000 * 60 * 60 * 24));
      if (trashDays > 0 && daysInTrash >= trashDays) {
        trashCleanedCount++;
        continue; // Bỏ qua khỏi danh sách => Xóa vĩnh viễn khỏi DB
      }
      nextProperties.push(p);
      continue;
    }

    // 2. Xử lý tin hết hạn không gia hạn quá retentionDays (ví dụ 45 ngày)
    const expTime = p.expiresAt ? new Date(p.expiresAt).getTime() : 0;
    const isExpired = p.status === 'expired' || (expTime > 0 && expTime <= now);

    if (isExpired && expTime > 0 && !p.isArchived) {
      const daysSinceExpiry = Math.floor((now - expTime) / (1000 * 60 * 60 * 24));
      if (daysSinceExpiry >= retentionDays) {
        if (action === 'permanent_delete') {
          deletedCount++;
          continue; // Xóa sạch hoàn toàn khỏi database
        } else if (action === 'move_to_trash') {
          deletedCount++;
          nextProperties.push({
            ...p,
            isDeleted: true,
            status: 'trash',
            previousStatus: 'expired',
            deletedAt: new Date().toISOString(),
            trashReason: `Tự động chuyển vào thùng rác do hết hạn quá ${retentionDays} ngày`
          });
          continue;
        } else {
          // Mặc định: 'archive_light' (Nén sang dữ liệu nhẹ)
          archivedCount++;
          nextProperties.push(archivePropertyLightHelper(p));
          continue;
        }
      }
    }

    nextProperties.push(p);
  }

  const totalProcessed = archivedCount + deletedCount + trashCleanedCount;
  if (totalProcessed > 0) {
    await persistDatabaseSlice('bds_properties', nextProperties);
  }

  const estFreedKb = (archivedCount * 25) + (deletedCount * 80) + (trashCleanedCount * 80);
  return {
    success: true,
    totalProcessed,
    archivedCount,
    deletedCount,
    trashCleanedCount,
    estFreedKb,
    retentionDays,
    action,
    message: totalProcessed > 0
      ? `Đã hoàn tất tự động dọn dẹp: Nén ${archivedCount} tin, dọn ${deletedCount + trashCleanedCount} tin quá hạn ${retentionDays} ngày. Giải phóng ~${estFreedKb} KB.`
      : `Hệ thống đã quét: Không có bài viết nào quá hạn ${retentionDays} ngày cần xử lý.`
  };
}
