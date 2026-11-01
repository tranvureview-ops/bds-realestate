/**
 * Service Quản lý Hệ Thống Dự Đoán Giá BĐS (Gamification & Prediction Engine)
 * Bao gồm:
 * 1. Quản lý cấu hình chương trình & Bot ảo (is_bot = 1)
 * 2. Lưu trữ & lọc dự đoán của User thật (is_bot = 0)
 * 3. Thuật toán tính toán sai số, phân loại đồng hạng (>3 người chia đều)
 * 4. Trao thưởng Ví KM & cấp Huy hiệu vinh danh (Thần Phán Đoán)
 */

import { upsertSupabaseSetting } from '../lib/supabase';

export const PREDICTION_STORAGE_KEY = 'bds_prediction_programs';
export const PREDICTION_VOTES_KEY = 'bds_prediction_votes_store_v2';
export const PREDICTION_MEMBERSHIP_KEY = 'bds_prediction_membership_required';
const OLD_PREDICTION_VOTES_KEY = 'bds_prediction_votes_store';

// Helper phát tin đồng bộ qua BroadcastChannel (nếu trình duyệt hỗ trợ)
function broadcastPredictionMessage(msg) {
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('bds_prediction_sync');
      bc.postMessage(msg);
      bc.close();
    } catch (e) {}
  }
}

// Lấy danh sách sự kiện Ticker thời gian thực (Dùng cho Topbar và Trang Dự Đoán)
export function getLivePredictionTickerEvents() {
  const DEFAULT_ITEMS = [
    { id: 'def-1', userName: '090***240', price: '5.65', totalPrize: '2.000.000 đ', timeText: 'Vừa xong' },
    { id: 'def-2', userName: 'Dương K***', price: '5.36', totalPrize: '2.000.000 đ', timeText: '1 phút trước' },
    { id: 'def-3', userName: 'Bùi Đức T***', price: '5.43', totalPrize: '2.000.000 đ', timeText: '2 phút trước' },
    { id: 'def-4', userName: 'Nguyễn Văn T***', price: '15.6', totalPrize: '2.000.000 đ', timeText: '3 phút trước' },
    { id: 'def-5', userName: '098***342', price: '15.7', totalPrize: '2.000.000 đ', timeText: '4 phút trước' },
    { id: 'def-6', userName: 'Trần Thị M***', price: '15.5', totalPrize: '2.000.000 đ', timeText: '5 phút trước' },
    { id: 'def-7', userName: '097***471', price: '6.01', totalPrize: '2.000.000 đ', timeText: '7 phút trước' }
  ];

  try {
    const programs = getStoredPredictionPrograms();
    const events = [];
    programs.forEach(prog => {
      const records = getStoredPredictions(prog.id);
      records.slice(0, 8).forEach((r, idx) => {
        events.push({
          id: `${prog.id}-${r.userId || r.userName || idx}`,
          userName: r.userName || 'Thành viên ẩn danh',
          price: r.predictedPrice,
          isBot: Boolean(r.is_bot),
          programTitle: prog.projectName || prog.title,
          totalPrize: (Number(prog.totalPrize) || 2000000).toLocaleString('vi-VN') + ' đ',
          timeText: formatRelativeTime(r.createdAt) || 'Vừa xong',
          createdAt: r.createdAt || new Date().toISOString()
        });
      });
    });

    if (events.length === 0) return DEFAULT_ITEMS;

    return events
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 15);
  } catch (e) {
    return DEFAULT_ITEMS;
  }
}

// Lấy trạng thái Bật/Tắt Đặc Quyền Gói Hội Viên toàn hệ thống (Real-time Cross-tab Sync)
export function getIsPredictionMembershipRequired() {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(PREDICTION_MEMBERSHIP_KEY);
    if (val !== null) return val === 'true';
  } catch (e) {}
  return true; // Mặc định là TRUE (Đặc quyền dành riêng cho Gói Hội Viên)
}

// Lưu trạng thái Bật/Tắt Đặc Quyền Gói Hội Viên & phát sự kiện đồng bộ ngay lập tức giữa các tab
export function setIsPredictionMembershipRequired(isRequired) {
  if (typeof window === 'undefined') return;
  const boolVal = Boolean(isRequired);
  try {
    localStorage.setItem(PREDICTION_MEMBERSHIP_KEY, String(boolVal));
    window.dispatchEvent(new CustomEvent('bds_prediction_membership_toggled', { detail: boolVal }));
    broadcastPredictionMessage({ type: 'MEMBERSHIP_TOGGLED', isRequired: boolVal });

    // Đồng bộ lên Supabase Cloud & server-db.json qua /api/db-sync
    const adminToken = sessionStorage.getItem('bds_admin_token') || localStorage.getItem('bds_admin_token') || '';
    fetch('/api/db-sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ bds_prediction_membership_required: boolVal })
    }).catch(console.warn);

    upsertSupabaseSetting('bds_prediction_membership_required', boolVal).catch(console.warn);
  } catch (e) {}
}

// Danh sách họ tên và đầu số di động để sinh danh tính chân thực như thật:
const VN_PHONE_PREFIXES = ['090', '091', '093', '094', '096', '097', '098', '086', '088', '089', '077', '079', '038', '039', '036', '035'];
const VN_FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
const VN_MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Tuấn', 'Đức', 'Hoàng', 'Ngọc', 'Quang', 'Quốc', 'Thanh', 'Hữu', 'Anh', 'Bảo', 'Gia'];
const VN_LAST_NAMES = ['Nam', 'Tuấn', 'Hùng', 'Long', 'Cường', 'Anh', 'Thảo', 'Linh', 'Hương', 'My', 'Trang', 'Dũng', 'Khánh', 'Huy', 'Quân', 'Sơn', 'Giang', 'Hiếu', 'Hải', 'Phúc', 'Kiên', 'Thành', 'Trung', 'Bình'];
const VN_REAL_NICKNAMES = [
  'Hải Long', 'Minh Trang', 'Quốc Đạt Land', 'Thanh Tùng', 'Bảo Ngọc', 'Hoàng Yến', 
  'Khánh Linh', 'Đức Huy', 'Ngọc Mai', 'Văn Hùng Land', 'Thùy Dương', 'Anh Tuấn Land',
  'Phương Thảo', 'Gia Huy', 'Trọng Nghĩa', 'Bảo Trâm', 'Đình Trọng BĐS', 'Kim Ngân'
];

export const DEFAULT_PREDICTION_PROGRAMS = [
  {
    id: 'pred-sun-ponte',
    slug: 'sun-ponte-residence',
    title: 'Dự đoán giá Penthouse Sun Ponte Residence',
    projectName: 'Penthouse Sun Ponte Residence Mặt Tiền Trần Hưng Đạo',
    location: 'Sơn Trà, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    currentEstimate: '14.5 - 16.0 tỷ',
    startDate: '2026-10-25T00:00:00Z',
    endDate: '2026-11-15T20:00:00Z',
    totalPrize: 2000000, // 2.000.000 đ
    basePrice: 15.5, // 15.5 tỷ
    spreadPercent: 8, // ±8%
    targetPrice: 15.65, // Giá chốt thẩm định thực tế
    requireMembership: true, // Bật/Tắt: Đặc quyền dành riêng cho Gói Hội Viên
    status: 'active', // 'active' | 'settled'
    botConfig: {
      isEnabled: true,
      botCount: 2000,
      basePrice: 15.5,
      spreadPercent: 8
    },
    settledResult: null,
    options: [
      { id: 'opt-a', label: 'Dưới 15 tỷ', min: 0, max: 15.0 },
      { id: 'opt-b', label: 'Từ 15 - 16 tỷ', min: 15.0, max: 16.0 },
      { id: 'opt-c', label: 'Trên 16 tỷ', min: 16.0, max: 99.0 }
    ]
  },
  {
    id: 'pred-co-co',
    slug: 'biet-thu-co-co-hoi-an',
    title: 'Dự đoán giá Biệt Thự Nghỉ Dưỡng Ven Sông Cổ Cò',
    projectName: 'Biệt Thự Nghỉ Dưỡng Ven Sông Cổ Cò Hội An (PR027)',
    location: 'Hội An, Quảng Nam',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    currentEstimate: '16.5 tỷ',
    startDate: '2026-10-26T00:00:00Z',
    endDate: '2026-11-18T18:00:00Z',
    totalPrize: 3000000, // 3.000.000 đ
    basePrice: 16.5, // 16.5 tỷ
    spreadPercent: 6, // ±6%
    targetPrice: 16.42,
    requireMembership: true, // Bật/Tắt: Đặc quyền dành riêng cho Gói Hội Viên
    status: 'active',
    botConfig: {
      isEnabled: true,
      botCount: 1500,
      basePrice: 16.5,
      spreadPercent: 6
    },
    settledResult: null,
    options: [
      { id: 'opt-a', label: 'Chốt dưới 16 tỷ', min: 0, max: 16.0 },
      { id: 'opt-b', label: 'Chốt từ 16 - 16.5 tỷ', min: 16.0, max: 16.5 },
      { id: 'opt-c', label: 'Chốt trên 16.5 tỷ', min: 16.5, max: 99.0 }
    ]
  },
  {
    id: 'pred-monarchy',
    slug: 'the-monarchy-da-nang',
    title: 'Dự đoán giá Căn hộ The Monarchy Block B Sông Hàn (Kỳ 01)',
    projectName: 'Căn hộ 2PN The Monarchy Block B View Sông Hàn (PR025)',
    location: 'Sơn Trà, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    currentEstimate: '3.65 - 3.85 tỷ',
    startDate: '2026-10-10T00:00:00Z',
    endDate: '2026-10-31T20:00:00Z',
    totalPrize: 2000000, // 2.000.000 đ Ví KM
    basePrice: 3.75,
    spreadPercent: 5,
    targetPrice: 3.75, // Giá chốt thẩm định thực tế: 3.75 tỷ
    requireMembership: false,
    status: 'settled',
    botConfig: {
      isEnabled: true,
      botCount: 1420,
      basePrice: 3.75,
      spreadPercent: 5
    },
    settledResult: {
      settledAt: '2026-10-31T20:00:00Z',
      targetPrice: 3.75,
      isMedianMethod: true,
      totalPrize: 2000000,
      totalParticipants: 1420,
      realParticipantsCount: 42,
      isSplitPrize: false,
      rewardPerWinner: null,
      winners: [
        {
          userId: 'user-winner-1',
          userName: 'Nguyễn Hoàng Nam (091***882)',
          userAvatar: '/avatars/ai-preset-1.jpg',
          predictedPrice: 3.75,
          diff: 0.00,
          rank: 1,
          rewardAmount: 1000000,
          rewardBadge: 'Thần Phán Đoán BĐS (Quán Quân) ★',
          isTied: false,
          payoutStatus: 'Đã giải ngân Ví KM',
          awardedAt: '31/10/2026 20:00'
        },
        {
          userId: 'user-winner-2',
          userName: 'Lê Thị Thu Hà (093***415)',
          userAvatar: '/avatars/ai-preset-2.jpg',
          predictedPrice: 3.74,
          diff: 0.01,
          rank: 2,
          rewardAmount: 600000,
          rewardBadge: 'Chuyên Gia Định Giá BĐS (Á Quân)',
          isTied: false,
          payoutStatus: 'Đã giải ngân Ví KM',
          awardedAt: '31/10/2026 20:00'
        },
        {
          userId: 'user-winner-3',
          userName: 'Trần Đức Minh (098***926)',
          userAvatar: '/avatars/ai-preset-1.jpg',
          predictedPrice: 3.76,
          diff: 0.01,
          rank: 3,
          rewardAmount: 400000,
          rewardBadge: 'Thẩm Định Viên Xuất Sắc (Giải Ba)',
          isTied: false,
          payoutStatus: 'Đã giải ngân Ví KM',
          awardedAt: '31/10/2026 20:00'
        }
      ]
    },
    options: [
      { id: 'opt-a', label: 'Dưới 3.6 tỷ', min: 0, max: 3.6 },
      { id: 'opt-b', label: 'Từ 3.6 - 3.8 tỷ', min: 3.6, max: 3.8 },
      { id: 'opt-c', label: 'Trên 3.8 tỷ', min: 3.8, max: 99.0 }
    ]
  }
];

// Hàm sinh số ngẫu nhiên theo phân phối chuẩn Gaussian quanh giá cơ sở
function randomGaussian(mean, stdev) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdev;
}

// Sinh danh tính người tham gia chân thực như người thật trên sàn (SĐT che, Họ tên che bảo mật, Nickname)
export function generateRealisticParticipantName() {
  const rand = Math.random();
  // 1. Dạng Số Điện Thoại che 3 số giữa (~40%): ví dụ 098***412, 090***839
  if (rand < 0.40) {
    const prefix = VN_PHONE_PREFIXES[Math.floor(Math.random() * VN_PHONE_PREFIXES.length)];
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    return `${prefix}***${suffix}`;
  }
  
  // 2. Dạng Họ Tên che sao bảo mật (Privacy Masking) (~45%): ví dụ Nguyễn V. T***, Trần Minh H***, Lê T. P***
  if (rand < 0.85) {
    const f = VN_FIRST_NAMES[Math.floor(Math.random() * VN_FIRST_NAMES.length)];
    const m = VN_MIDDLE_NAMES[Math.floor(Math.random() * VN_MIDDLE_NAMES.length)];
    const l = VN_LAST_NAMES[Math.floor(Math.random() * VN_LAST_NAMES.length)];
    const style = Math.random();
    if (style < 0.5) {
      return `${f} ${m.charAt(0)}. ${l.charAt(0)}***`;
    } else if (style < 0.8) {
      return `${f} ${m} ${l.charAt(0)}***`;
    } else {
      return `${f} ${l.charAt(0)}***`;
    }
  }

  // 3. Dạng Tên ngắn / Nickname quen thuộc của dân BĐS (~15%): ví dụ Hải Long, Anh Tuấn Land, Minh Trang
  return VN_REAL_NICKNAMES[Math.floor(Math.random() * VN_REAL_NICKNAMES.length)];
}

// Giữ lại alias để tương thích ngược nếu có code gọi generateRandomVnName
export const generateRandomVnName = generateRealisticParticipantName;

/**
 * ĐỊNH DẠNG THỜI GIAN TƯƠNG ĐỐI TỰ NHIÊN NHƯ THẬT
 * Ví dụ: "Vừa xong", "3 phút trước", "2 giờ trước", "Hôm qua lúc 14:20", "28/10 lúc 09:15"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) {
    return `Hôm qua lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDay < 7) {
    return `${diffDay} ngày trước`;
  }
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * SINH DANH SÁCH MỐC THỜI GIAN NHƯ THẬT:
 * - Trải đều từ ngày bắt đầu (startDate) đến hiện tại.
 * - Mô phỏng biểu đồ hoạt động người dùng thực tế (giờ vàng đông người tham gia, ban đêm thưa thớt).
 * - Sắp xếp giảm dần (mới nhất lên đầu).
 */
export function generateRealisticTimestamps(count, startDateStr = null, endDateStr = null) {
  const now = Date.now();
  const start = startDateStr ? new Date(startDateStr).getTime() : (now - 7 * 24 * 3600 * 1000);
  const end = Math.min(now, endDateStr ? new Date(endDateStr).getTime() : now);
  const duration = Math.max(end - start, 3600 * 1000); // Tối thiểu 1 giờ

  const timestamps = [];

  for (let i = 0; i < count; i++) {
    // Phân bổ nghiêng về thời điểm gần hiện tại (số lượng tham gia tăng dần theo độ nóng của sự kiện)
    const factor = Math.pow(Math.random(), 1.35);
    const timeMs = start + factor * duration;
    const date = new Date(timeMs);

    // Đường cong hoạt động thực tế (Human Activity Curve):
    // Nếu rơi vào đêm muộn 0h - 6h sáng, 85% dời sang khung giờ sôi động ban ngày (9h - 22h)
    const hour = date.getHours();
    if (hour >= 0 && hour <= 5 && Math.random() > 0.15) {
      date.setHours(8 + Math.floor(Math.random() * 14));
      date.setMinutes(Math.floor(Math.random() * 60));
      date.setSeconds(Math.floor(Math.random() * 60));
    }

    // Đảm bảo không vượt quá thời điểm hiện tại
    const finalMs = Math.min(date.getTime(), now - (Math.floor(Math.random() * 90) + 10) * 1000);
    timestamps.push(finalMs);
  }

  // Sắp xếp thời gian giảm dần: Mới nhất lên đầu
  timestamps.sort((a, b) => b - a);

  // Tạo các mốc vài phút/vài chục giây gần nhất cho top đầu bảng xếp hạng
  if (timestamps.length > 5) {
    timestamps[0] = now - (Math.floor(Math.random() * 30) + 15) * 1000; // 15 - 45 giây trước
    timestamps[1] = now - (Math.floor(Math.random() * 2) + 2) * 60 * 1000; // 2 - 4 phút trước
    timestamps[2] = now - (Math.floor(Math.random() * 4) + 5) * 60 * 1000; // 5 - 9 phút trước
    timestamps[3] = now - (Math.floor(Math.random() * 10) + 12) * 60 * 1000; // 12 - 22 phút trước
    timestamps[4] = now - (Math.floor(Math.random() * 20) + 25) * 60 * 1000; // 25 - 45 phút trước
  }

  return timestamps;
}

/**
 * TÍNH TOÁN SỐ LƯỢNG BOT CHẠY HIỆN TẠI THEO TIẾN ĐỘ THỜI GIAN
 * - botCount trong cấu hình là TỔNG SỐ LƯỢNG BOT TỐI ĐA trong toàn bộ khoảng thời gian từ startDate đến endDate.
 * - Tại thời điểm hiện tại (now), số lượng bot được phân bổ lũy tiến tăng dần theo tiến độ thực tế của sự kiện.
 */
export function calculateCurrentPacedBotCount(totalBotMax, startDateStr = null, endDateStr = null) {
  const max = Math.max(Number(totalBotMax) || 0, 0);
  if (max <= 0) return 0;
  if (!startDateStr || !endDateStr) return max;

  const now = Date.now();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();

  // Sự kiện chưa tới ngày bắt đầu: 0 bot
  if (now < start) return 0;
  // Sự kiện đã kết thúc hoặc qua ngày kết thúc: Đạt tối đa 100% số bot cài đặt
  if (now >= end) return max;

  const totalDuration = end - start;
  if (totalDuration <= 0) return max;

  const elapsed = now - start;
  // Tiến độ thời gian (0 -> 1)
  const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

  // Phân bổ lũy tiến mượt mà: Giai đoạn đầu tăng vừa phải, tăng dần theo độ nóng về cuối sự kiện
  const factor = Math.pow(progress, 1.15);
  const pacedCount = Math.min(max, Math.max(1, Math.round(max * factor)));
  return pacedCount;
}

// Sinh danh sách bản ghi Bot Ảo (is_bot = 1) phân bổ thời gian như thật (không dùng ảnh avatar AI)
export function generateBotRecords(gameId, botCount = 0, basePrice = 7.8, spreadPercent = 6, startDate = null, endDate = null) {
  const records = [];
  const count = Math.max(Number(botCount) || 0, 0);
  if (count <= 0) return [];
  const spreadDelta = basePrice * (Number(spreadPercent) / 100);
  const stdev = spreadDelta / 2; // ~95% giá rơi trong khoảng ±spreadDelta

  // Sinh dải thời gian phân bổ chân thực theo thời gian diễn ra chương trình
  const timestamps = generateRealisticTimestamps(count, startDate, endDate);

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(timestamps[i]).toISOString();
    
    // Giá dự đoán làm tròn 2 chữ số thập phân
    let price = Number(randomGaussian(basePrice, stdev).toFixed(2));
    if (price <= 0) price = Number(basePrice.toFixed(2));

    records.push({
      id: `bot-${gameId}-${i + 1}`,
      gameId,
      userId: `bot-user-${i + 1}`,
      userName: generateRealisticParticipantName(),
      predictedPrice: price,
      is_bot: 1, // ĐÁNH DẤU CHÍNH XÁC LÀ BOT ẢO
      createdAt
    });
  }

  return records;
}

// Sinh 1 lượt dự đoán bot mới trực tiếp (Real-time Live Injection) không dùng avatar AI
export function generateSingleBotPrediction(gameId, basePrice = 15.5, spreadPercent = 8) {
  const spreadDelta = basePrice * (Number(spreadPercent) / 100);
  const stdev = spreadDelta / 2;
  let price = Number(randomGaussian(basePrice, stdev).toFixed(2));
  if (price <= 0) price = Number(basePrice.toFixed(2));

  return {
    id: `bot-${gameId}-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gameId,
    userId: `bot-live-${Date.now()}`,
    userName: generateRealisticParticipantName(),
    predictedPrice: price,
    is_bot: 1,
    createdAt: new Date().toISOString()
  };
}

// Thêm 1 bot mới vào đầu danh sách (dùng cho hiệu ứng nhảy số trực tiếp)
export function appendLiveBotPrediction(gameId, botConfig = {}) {
  const base = Number(botConfig.basePrice || 15.5);
  const spread = Number(botConfig.spreadPercent || 8);
  const maxBots = Number(botConfig.botCount || 0);
  if (maxBots <= 0 || botConfig.isEnabled === false) return null;

  const singleBot = generateSingleBotPrediction(gameId, base, spread);
  const existing = getStoredPredictions(gameId);
  const realUsers = existing.filter(r => !r.is_bot && r.is_bot !== 1);
  const currentBots = existing.filter(r => r.is_bot === 1);

  // Giữ tổng số bot không vượt quá maxBots đã cấu hình trong Admin
  const nextBots = [singleBot, ...currentBots].slice(0, maxBots);
  const updated = [...realUsers, ...nextBots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  saveStoredPredictions(gameId, updated);
  return singleBot;
}

// Lấy danh sách chương trình dự đoán
export function getStoredPredictionPrograms() {
  if (typeof window === 'undefined') return DEFAULT_PREDICTION_PROGRAMS;
  try {
    const raw = localStorage.getItem(PREDICTION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Tự động bổ sung các kỳ mặc định (như Kỳ 01 đã chốt trao giải) nếu trong local chưa có
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = DEFAULT_PREDICTION_PROGRAMS.filter(p => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try { localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(merged)); } catch (e) {}
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_PREDICTION_PROGRAMS;
}

// Lưu danh sách chương trình dự đoán
export function savePredictionPrograms(programs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(programs));
    window.dispatchEvent(new CustomEvent('bds_prediction_programs_updated', { detail: programs }));
    broadcastPredictionMessage({ type: 'PROGRAMS_UPDATED', programs });

    // Đồng bộ lên Supabase Cloud & server-db.json qua /api/db-sync
    const adminToken = sessionStorage.getItem('bds_admin_token') || localStorage.getItem('bds_admin_token') || '';
    fetch('/api/db-sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ bds_prediction_programs: programs })
    }).catch(console.warn);

    upsertSupabaseSetting('bds_prediction_programs', programs).catch(console.warn);
  } catch (e) {}
}

// Lấy danh sách tất cả các lượt dự đoán (cả Bot ảo is_bot=1 và User thật is_bot=0)
export function getStoredPredictions(gameId) {
  if (typeof window === 'undefined') return [];
  try {
    const progs = getStoredPredictionPrograms();
    const prog = progs?.find(p => p.id === gameId);

    const raw = localStorage.getItem(`${PREDICTION_VOTES_KEY}_${gameId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Tự động kiểm tra tính toàn vẹn:
        // - botCount là TỔNG BOT TỐI ĐA trong toàn bộ khoảng thời gian cài đặt
        // - Số bot hiện tại không được vượt quá botCount tối đa hoặc nếu tắt bot thì đưa về 0
        if (prog?.botConfig) {
          const totalMax = prog.botConfig.isEnabled ? Number(prog.botConfig.botCount || 0) : 0;
          const currentBots = parsed.filter(r => r.is_bot === 1);
          
          if (!prog.botConfig.isEnabled && currentBots.length > 0) {
            return syncBotsForGame(gameId, prog.botConfig, prog.startDate, prog.endDate);
          }
          if (currentBots.length > totalMax) {
            return syncBotsForGame(gameId, prog.botConfig, prog.startDate, prog.endDate);
          }
        }
        return parsed;
      }
    }

    // Tự động nâng cấp dữ liệu từ phiên bản cũ (v1) sang (v2):
    // Giữ nguyên toàn bộ User Thật đã tham gia và tạo lại dàn Bot siêu thực không avatar
    const oldRaw = localStorage.getItem(`${OLD_PREDICTION_VOTES_KEY}_${gameId}`);
    let realUsers = [];

    if (oldRaw) {
      try {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) {
          realUsers = oldParsed.filter(r => r.is_bot === 0 || (!r.is_bot && r.userId && !String(r.userId).startsWith('bot-')));
        }
      } catch (e) {}
    }

    const botCount = Number(prog?.botConfig?.botCount ?? 0);
    if (prog && prog.botConfig?.isEnabled === true && botCount > 0) {
      // Phân bổ số bot hiện tại lũy tiến theo tiến độ thời gian (tối đa bằng botCount khi kết thúc)
      const pacedCount = calculateCurrentPacedBotCount(botCount, prog.startDate, prog.endDate);
      const base = Number(prog.botConfig.basePrice || prog.basePrice || 15.5);
      const spread = Number(prog.botConfig.spreadPercent || prog.spreadPercent || 8);
      const bots = generateBotRecords(gameId, pacedCount, base, spread, prog.startDate, prog.endDate);
      const merged = [...realUsers, ...bots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      saveStoredPredictions(gameId, merged);
      return merged;
    } else if (realUsers.length > 0) {
      saveStoredPredictions(gameId, realUsers);
      return realUsers;
    } else {
      saveStoredPredictions(gameId, []);
      return [];
    }
  } catch (e) {}
  return [];
}

// Lưu danh sách dự đoán của 1 game
export function saveStoredPredictions(gameId, records) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PREDICTION_VOTES_KEY}_${gameId}`, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('bds_prediction_votes_updated', { detail: { gameId, count: records?.length || 0 } }));
    broadcastPredictionMessage({ type: 'VOTES_UPDATED', gameId, count: records?.length || 0 });
  } catch (e) {}
}

/**
 * ĐỒNG BỘ HOẶC KHỞI TẠO BOT ẢO CHO MỘT GAME
 * botConfig.botCount là TỔNG SỐ LƯỢNG BOT TỐI ĐA trong toàn bộ khoảng thời gian cài đặt
 * Số bot chạy thực tế tại thời điểm hiện tại được phân bổ lũy tiến theo tiến độ startDate -> endDate
 */
export function syncBotsForGame(gameId, botConfig = {}, startDate = null, endDate = null) {
  const isEnabled = Boolean(botConfig?.isEnabled);
  const totalMax = Number(botConfig?.botCount !== undefined ? botConfig.botCount : 0);
  const base = Number(botConfig?.basePrice || 15.5);
  const spread = Number(botConfig?.spreadPercent || 8);

  // Tự động lấy startDate và endDate từ cấu hình chương trình nếu chưa có
  if (!startDate || !endDate) {
    const progs = getStoredPredictionPrograms();
    const p = progs.find(x => x.id === gameId);
    if (p) {
      startDate = startDate || p.startDate;
      endDate = endDate || p.endDate;
    }
  }

  const existing = getStoredPredictions(gameId);
  // Giữ lại toàn bộ User Thật (is_bot = 0)
  const realUsers = existing.filter(r => !r.is_bot && r.is_bot !== 1);

  let newRecords = [];
  if (isEnabled && totalMax > 0) {
    // Phân bổ số bot hiện tại lũy tiến theo tiến độ thời gian thực tế
    const currentPacedCount = calculateCurrentPacedBotCount(totalMax, startDate, endDate);
    const bots = generateBotRecords(gameId, currentPacedCount, base, spread, startDate, endDate);
    // Ghép với User thật và sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
    newRecords = [...realUsers, ...bots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // Nếu tắt bot hoặc botCount <= 0: Xóa toàn bộ bot, đưa danh sách bot về 0 (chỉ giữ người thật)
    newRecords = realUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  saveStoredPredictions(gameId, newRecords);
  return newRecords;
}

// Xóa toàn bộ bot ảo của 1 chương trình, đưa về 0 lượt bot
export function clearBotPredictions(gameId) {
  const existing = getStoredPredictions(gameId);
  const realUsers = existing.filter(r => !r.is_bot && r.is_bot !== 1);
  saveStoredPredictions(gameId, realUsers);

  // Cập nhật cấu hình chương trình: tắt bot và đưa botCount về 0
  const progs = getStoredPredictionPrograms();
  const nextProgs = progs.map(p => {
    if (p.id === gameId) {
      return {
        ...p,
        botConfig: {
          ...(p.botConfig || {}),
          isEnabled: false,
          botCount: 0
        }
      };
    }
    return p;
  });
  savePredictionPrograms(nextProgs);
  return realUsers;
}

/**
 * LƯU DỰ ĐOÁN CỦA USER THẬT (is_bot = 0)
 */
export function recordUserPrediction(gameId, user, predictedPrice, chosenOption = null) {
  const existing = getStoredPredictions(gameId);
  const userId = String(user?.id || 'guest');
  const now = new Date().toISOString();

  const newEntry = {
    id: `vote-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gameId,
    userId,
    userName: user?.name || 'Người dùng',
    userAvatar: user?.avatar || '/avatars/ai-preset-2.jpg',
    predictedPrice: Number(predictedPrice),
    chosenOption,
    is_bot: 0, // USER THẬT
    createdAt: now
  };

  // Nếu user đã từng dự đoán thì cập nhật lại giá mới nhất
  const filtered = existing.filter(r => !(r.is_bot === 0 && String(r.userId) === userId));
  const updated = [newEntry, ...filtered];
  saveStoredPredictions(gameId, updated);
  return newEntry;
}

/**
 * TÍNH GIÁ TRUNG VỊ (MEDIAN) CỦA NGƯỜI THẬT DỰ ĐOÁN (is_bot = 0)
 * Phương pháp tính công tâm, khách quan nhất:
 * - Sắp xếp dãy giá dự đoán tăng dần.
 * - Lấy điểm trung vị chính giữa của cộng đồng người thật.
 */
export function calculateMedianPrice(realUsers = []) {
  if (!realUsers || realUsers.length === 0) return 0;
  const prices = realUsers
    .map(u => Number(u.predictedPrice))
    .filter(p => !isNaN(p) && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return 0;
  const mid = Math.floor(prices.length / 2);
  if (prices.length % 2 !== 0) {
    return Number(prices[mid].toFixed(2));
  }
  return Number(((prices[mid - 1] + prices[mid]) / 2).toFixed(2));
}

/**
 * BACKEND & LOGIC KHI KẾT THÚC SỰ KIỆN: CHỐT KẾT QUẢ & XẾP HẠNG
 * 
 * Bước 1: Tính Giá Chuẩn theo Trung Vị (Median) của người thật (hoặc cấu hình nếu chưa có user thật).
 * Bước 2: Chấm điểm & tính sai số cho User thật so với Giá Trung Vị.
 * Bước 3: Xét cơ cấu giải thưởng:
 *   - Nếu >= 3 user thật: Phân bổ Quán Quân (50%), Á Quân (30%), Giải Ba (20%) hoặc chia đều nếu >3 đồng hạng.
 *   - Nếu < 3 user thật: Bổ sung thêm random 2 - 5 bot vào hệ thống trúng thưởng với giá sát trung vị.
 *     Ưu tiên người thật nhận Giải Nhất và Giải Nhì, Giải Ba chia đều cho hệ thống bot.
 * Bước 4: Trao thưởng Ví KM cho User thật và cấp Huy hiệu vinh danh "Thần Phán Đoán".
 */
export function settlePredictionGame({
  gameId,
  targetPrice = null,
  totalPrize = 2000000,
  currentUser = null
}) {
  const allRecords = getStoredPredictions(gameId);
  const realUsers = allRecords.filter(r => !r.is_bot && r.is_bot !== 1);
  const botRecords = allRecords.filter(r => r.is_bot === 1);

  // BƯỚC 1: XÁC ĐỊNH GIÁ CHUẨN TRUNG VỊ
  let numTargetPrice = 0;
  if (targetPrice !== null && !isNaN(targetPrice) && Number(targetPrice) > 0) {
    numTargetPrice = Number(targetPrice);
  } else if (realUsers.length > 0) {
    numTargetPrice = calculateMedianPrice(realUsers);
  } else {
    const progs = getStoredPredictionPrograms();
    const p = progs?.find(x => x.id === gameId);
    numTargetPrice = Number(p?.targetPrice || p?.basePrice || 15.5);
  }

  // BƯỚC 2: CHẤM ĐIỂM VÀ TÍNH SAI SỐ CHO USER THẬT
  const scoredRealUsers = realUsers.map(u => {
    const diff = Math.abs(Number(u.predictedPrice) - numTargetPrice);
    return {
      ...u,
      diff: Number(diff.toFixed(4)),
      diffPercent: Number(((diff / numTargetPrice) * 100).toFixed(2))
    };
  }).sort((a, b) => {
    if (a.diff !== b.diff) return a.diff - b.diff; // Sai số thấp nhất xếp trước
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Dự đoán sớm hơn xếp trước
  });

  const totalPrizeNum = Number(totalPrize) || 2000000;
  let winners = [];
  let isSplitPrize = false;
  let rewardPerWinner = 0;

  // BƯỚC 3: XÉT CƠ CẤU GIẢI THƯỞNG
  if (scoredRealUsers.length >= 3) {
    // Trường hợp >= 3 User thật:
    const bestDiff = scoredRealUsers[0].diff;
    const tiedAtTop = scoredRealUsers.filter(u => Math.abs(u.diff - bestDiff) <= 0.0001);

    if (tiedAtTop.length > 3) {
      // > 3 người đồng hạng: Chia đều tổng giải thưởng
      isSplitPrize = true;
      rewardPerWinner = Math.floor(totalPrizeNum / tiedAtTop.length);
      winners = tiedAtTop.map((u, idx) => ({
        ...u,
        rank: idx + 1,
        isTied: true,
        rewardAmount: rewardPerWinner,
        rewardBadge: 'Thần Phán Đoán BĐS ★'
      }));
    } else {
      // Phân chia Top 1 (50%), Top 2 (30%), Top 3 (20%)
      const shares = [0.5, 0.3, 0.2];
      winners = scoredRealUsers.slice(0, 3).map((u, idx) => ({
        ...u,
        rank: idx + 1,
        isTied: false,
        rewardAmount: Math.floor(totalPrizeNum * shares[idx]),
        rewardBadge: idx === 0 ? 'Thần Phán Đoán BĐS (Quán Quân) ★' : `Chuyên Gia Định Giá BĐS (Top ${idx + 1})`
      }));
    }
  } else {
    // Trường hợp khi ít hơn 3 User thật (< 3 người):
    // Bổ sung thêm random 2 - 5 bot vào hệ thống trúng thưởng, giá gần trung vị để chia cơ cấu giải thưởng.
    // Ưu tiên người thật nhận giải 1 và 2, giải 3 chia đều cho hệ thống bot.
    const botCountToAdd = Math.floor(Math.random() * 4) + 2; // Random 2, 3, 4 hoặc 5 bot
    const giai1Amount = Math.floor(totalPrizeNum * 0.5); // 50%
    const giai2Amount = Math.floor(totalPrizeNum * 0.3); // 30%
    const giai3Total = Math.floor(totalPrizeNum * 0.2);  // 20%
    const rewardPerBotGiai3 = Math.floor(giai3Total / botCountToAdd);

    // Tạo danh sách bot có giá sát trung vị (độ lệch cực nhỏ quanh targetPrice)
    const offsets = [-0.02, 0.01, -0.01, 0.03, -0.03, 0.02, 0.04];
    const botsForPrize = [];

    for (let i = 0; i < botCountToAdd; i++) {
      const offset = offsets[i % offsets.length];
      const botPrice = Number((numTargetPrice + offset).toFixed(2));
      const diff = Math.abs(Number((botPrice - numTargetPrice).toFixed(4)));
      const candidate = botRecords[i] || {};

      botsForPrize.push({
        id: candidate.id || `bot-winner-${Date.now()}-${i}`,
        gameId,
        userId: candidate.userId || `bot-win-${i}`,
        userName: candidate.userName || generateRealisticParticipantName(),
        predictedPrice: botPrice,
        diff,
        diffPercent: Number(((diff / numTargetPrice) * 100).toFixed(2)),
        is_bot: 1,
        createdAt: candidate.createdAt || new Date().toISOString()
      });
    }

    // Sắp xếp các bot theo sai số tăng dần
    botsForPrize.sort((a, b) => a.diff - b.diff);

    if (scoredRealUsers.length === 2) {
      // 2 User thật:
      // Người thật 1 -> Giải Nhất (50%)
      winners.push({
        ...scoredRealUsers[0],
        rank: 1,
        isTied: false,
        rewardAmount: giai1Amount,
        rewardBadge: 'Thần Phán Đoán BĐS (Giải Nhất) ★'
      });
      // Người thật 2 -> Giải Nhì (30%)
      winners.push({
        ...scoredRealUsers[1],
        rank: 2,
        isTied: false,
        rewardAmount: giai2Amount,
        rewardBadge: 'Chuyên Gia Định Giá BĐS (Giải Nhì)'
      });
      // 2 - 5 bot -> Đồng Hạng Giải Ba (chia đều 20% giải thưởng)
      botsForPrize.forEach(bot => {
        winners.push({
          ...bot,
          rank: 3,
          isTied: true,
          rewardAmount: rewardPerBotGiai3,
          rewardBadge: 'Đồng Hạng Giải Ba (Dự Đoán Chuẩn Xác)'
        });
      });
    } else if (scoredRealUsers.length === 1) {
      // 1 User thật:
      // Người thật duy nhất -> Giải Nhất (50%)
      winners.push({
        ...scoredRealUsers[0],
        rank: 1,
        isTied: false,
        rewardAmount: giai1Amount,
        rewardBadge: 'Thần Phán Đoán BĐS (Giải Nhất) ★'
      });
      // 1 Bot tốt nhất -> Giải Nhì (30%)
      winners.push({
        ...botsForPrize[0],
        rank: 2,
        isTied: false,
        rewardAmount: giai2Amount,
        rewardBadge: 'Chuyên Gia Định Giá BĐS (Giải Nhì)'
      });
      // Các bot còn lại (đảm bảo ít nhất 2 bot) -> Chia đều 20% Giải Ba
      const remainingBots = botsForPrize.slice(1);
      if (remainingBots.length < 2) {
        remainingBots.push({
          id: `bot-extra-${Date.now()}`,
          gameId,
          userId: `bot-win-extra`,
          userName: generateRealisticParticipantName(),
          predictedPrice: Number((numTargetPrice + 0.04).toFixed(2)),
          diff: 0.04,
          diffPercent: Number(((0.04 / numTargetPrice) * 100).toFixed(2)),
          is_bot: 1,
          createdAt: new Date().toISOString()
        });
      }
      const rewardEachBot = Math.floor(giai3Total / remainingBots.length);
      remainingBots.forEach(bot => {
        winners.push({
          ...bot,
          rank: 3,
          isTied: true,
          rewardAmount: rewardEachBot,
          rewardBadge: 'Đồng Hạng Giải Ba (Dự Đoán Chuẩn Xác)'
        });
      });
    } else {
      // 0 User thật: Phân bổ mẫu cho bot để admin chốt test mượt mà
      winners.push({
        ...botsForPrize[0],
        rank: 1,
        isTied: false,
        rewardAmount: giai1Amount,
        rewardBadge: 'Thần Phán Đoán BĐS (Giải Nhất) ★'
      });
      winners.push({
        ...botsForPrize[1],
        rank: 2,
        isTied: false,
        rewardAmount: giai2Amount,
        rewardBadge: 'Chuyên Gia Định Giá BĐS (Giải Nhì)'
      });
      const remainingBots = botsForPrize.slice(2);
      const rewardEachBot = Math.floor(giai3Total / Math.max(remainingBots.length, 1));
      remainingBots.forEach(bot => {
        winners.push({
          ...bot,
          rank: 3,
          isTied: true,
          rewardAmount: rewardEachBot,
          rewardBadge: 'Đồng Hạng Giải Ba (Dự Đoán Chuẩn Xác)'
        });
      });
    }
  }

  // Kết quả lưu lại
  const settledResult = {
    settledAt: new Date().toISOString(),
    targetPrice: numTargetPrice,
    isMedianMethod: true,
    totalPrize: totalPrizeNum,
    totalParticipants: allRecords.length,
    realParticipantsCount: realUsers.length,
    isSplitPrize,
    rewardPerWinner,
    winners
  };

  return {
    success: true,
    settledResult,
    winners,
    isSplitPrize
  };
}

// Cấp huy hiệu vinh danh cho User khi trúng giải
export function awardBadgeToUser(user, badgeName = 'Thần Phán Đoán BĐS ★') {
  if (!user) return user;
  const currentBadges = Array.isArray(user.badges) ? user.badges : [];
  if (currentBadges.includes(badgeName)) return user;

  const updatedBadges = [...currentBadges, badgeName];
  const updatedUser = {
    ...user,
    badges: updatedBadges
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bds_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
  }
  return updatedUser;
}
