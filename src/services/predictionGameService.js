/**
 * Service Quản lý Hệ Thống Dự Đoán Giá BĐS (Gamification & Prediction Engine)
 * Bao gồm:
 * 1. Quản lý cấu hình chương trình & Bot ảo (is_bot = 1)
 * 2. Lưu trữ & lọc dự đoán của User thật (is_bot = 0)
 * 3. Thuật toán tính toán sai số, phân loại đồng hạng (>3 người chia đều)
 * 4. Trao thưởng Ví KM & cấp Huy hiệu vinh danh (Thần Phán Đoán)
 */

export const PREDICTION_STORAGE_KEY = 'bds_prediction_programs';
export const PREDICTION_VOTES_KEY = 'bds_prediction_votes_store_v2';
const OLD_PREDICTION_VOTES_KEY = 'bds_prediction_votes_store';

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

// Sinh danh sách bản ghi Bot Ảo (is_bot = 1) phân bổ thời gian như thật (không dùng ảnh avatar AI)
export function generateBotRecords(gameId, botCount = 2000, basePrice = 7.8, spreadPercent = 6, startDate = null, endDate = null) {
  const records = [];
  const count = Math.min(Math.max(Number(botCount) || 50, 10), 3000);
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
  const singleBot = generateSingleBotPrediction(gameId, base, spread);
  
  const existing = getStoredPredictions(gameId);
  const updated = [singleBot, ...existing];
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_PREDICTION_PROGRAMS;
}

// Lưu danh sách chương trình dự đoán
export function savePredictionPrograms(programs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(programs));
  } catch (e) {}
}

// Lấy danh sách tất cả các lượt dự đoán (cả Bot ảo is_bot=1 và User thật is_bot=0)
export function getStoredPredictions(gameId) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${PREDICTION_VOTES_KEY}_${gameId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Tự động nâng cấp dữ liệu từ phiên bản cũ (v1) sang (v2):
    // Giữ nguyên toàn bộ User Thật đã tham gia và tạo lại dàn Bot siêu thực không avatar
    const oldRaw = localStorage.getItem(`${OLD_PREDICTION_VOTES_KEY}_${gameId}`);
    const progs = getStoredPredictionPrograms();
    const prog = progs?.find(p => p.id === gameId);
    let realUsers = [];

    if (oldRaw) {
      try {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) {
          realUsers = oldParsed.filter(r => r.is_bot === 0 || (!r.is_bot && r.userId && !String(r.userId).startsWith('bot-')));
        }
      } catch (e) {}
    }

    if (prog && prog.botConfig?.isEnabled !== false) {
      const count = Number(prog.botConfig.botCount || 2000);
      const base = Number(prog.botConfig.basePrice || prog.basePrice || 15.5);
      const spread = Number(prog.botConfig.spreadPercent || prog.spreadPercent || 8);
      const bots = generateBotRecords(gameId, count, base, spread, prog.startDate, prog.endDate);
      const merged = [...realUsers, ...bots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      saveStoredPredictions(gameId, merged);
      return merged;
    } else if (realUsers.length > 0) {
      saveStoredPredictions(gameId, realUsers);
      return realUsers;
    }
  } catch (e) {}
  return [];
}

// Lưu danh sách dự đoán của 1 game
export function saveStoredPredictions(gameId, records) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PREDICTION_VOTES_KEY}_${gameId}`, JSON.stringify(records));
  } catch (e) {}
}

/**
 * ĐỒNG BỘ HOẶC KHỞI TẠO BOT ẢO CHO MỘT GAME
 * Phân bổ thời gian chân thực theo startDate -> endDate của chương trình
 */
export function syncBotsForGame(gameId, botConfig = {}, startDate = null, endDate = null) {
  const count = Number(botConfig.botCount || 2000);
  const base = Number(botConfig.basePrice || 15.5);
  const spread = Number(botConfig.spreadPercent || 8);
  const isEnabled = botConfig.isEnabled !== false;

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
  if (isEnabled && count > 0) {
    const bots = generateBotRecords(gameId, count, base, spread, startDate, endDate);
    // Ghép với User thật và sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
    newRecords = [...realUsers, ...bots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    newRecords = realUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  saveStoredPredictions(gameId, newRecords);
  return newRecords;
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
 * Bước 1: LỌC DỮ LIỆU - Loại bỏ toàn bộ Bot (is_bot = 1), chỉ giữ lại User thật (is_bot = 0).
 * Bước 2: TỰ ĐỘNG TÍNH GIÁ CHUẨN THEO TRUNG VỊ (MEDIAN) CỦA NGƯỜI THẬT.
 * Bước 3: TÍNH TOÁN SAI SỐ SO VỚI GIÁ TRUNG VỊ - Sắp xếp sai số tăng dần.
 * Bước 4: XÉT THƯỞNG & VINH DANH:
 *   - Nếu >3 người đồng hạng ở Top: Chia đều tổng giải thưởng (Ví dụ 2.000.000đ).
 *   - Nếu không đồng hạng: Top 1 (50%), Top 2 (30%), Top 3 (20%).
 *   - Cấp Huy hiệu vinh danh "Thần Phán Đoán" cho User trúng giải.
 */
export function settlePredictionGame({
  gameId,
  targetPrice = null,
  totalPrize = 2000000,
  currentUser = null
}) {
  const allRecords = getStoredPredictions(gameId);

  // BƯỚC 1: LỌC DỮ LIỆU - LOẠI BỎ TOÀN BỘ BOT (is_bot = 1), CHỈ GIỮ USER THẬT (is_bot = 0)
  const realUsers = allRecords.filter(r => !r.is_bot && r.is_bot !== 1);

  if (realUsers.length === 0) {
    return {
      success: false,
      message: 'Chưa có người dùng thật (is_bot = 0) nào tham gia dự đoán chương trình này để tính Giá Trung Vị!',
      winners: [],
      payouts: [],
      splitPrize: false
    };
  }

  // BƯỚC 2: TỰ ĐỘNG TÍNH GIÁ CHUẨN THEO TRUNG VỊ CỦA NGƯỜI THẬT (nếu không truyền thủ công)
  const numTargetPrice = (targetPrice !== null && !isNaN(targetPrice) && Number(targetPrice) > 0)
    ? Number(targetPrice)
    : calculateMedianPrice(realUsers);

  // BƯỚC 3: TÍNH TOÁN SAI SỐ VÀ XẾP HẠNG THEO GIÁ TRUNG VỊ
  const scoredUsers = realUsers.map(u => {
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

  const bestDiff = scoredUsers[0].diff;
  // Tìm nhóm những người đồng hạng sai số thấp nhất
  const tiedAtTop = scoredUsers.filter(u => Math.abs(u.diff - bestDiff) <= 0.0001);

  let winners = [];
  let isSplitPrize = false;
  let rewardPerWinner = 0;

  // BƯỚC 4: XÉT THƯỞNG & VINH DANH
  if (tiedAtTop.length > 3) {
    // TRƯỜNG HỢP >3 NGƯỜI ĐỒNG HẠNG Ở TOP: Áp dụng cơ chế CHIA ĐỀU TỔNG GIẢI THƯỞNG
    isSplitPrize = true;
    rewardPerWinner = Math.floor(Number(totalPrize) / tiedAtTop.length);

    winners = tiedAtTop.map((u, idx) => ({
      ...u,
      rank: idx + 1,
      isTied: true,
      rewardAmount: rewardPerWinner,
      rewardBadge: 'Thần Phán Đoán BĐS ★'
    }));
  } else {
    // Dưới hoặc bằng 3 người: Phân chia Top 1, Top 2, Top 3
    const topCount = Math.min(scoredUsers.length, 3);
    const shares = [0.5, 0.3, 0.2]; // 50%, 30%, 20%
    
    winners = scoredUsers.slice(0, topCount).map((u, idx) => {
      const share = shares[idx] || 0.1;
      const amt = Math.floor(Number(totalPrize) * share);
      return {
        ...u,
        rank: idx + 1,
        isTied: false,
        rewardAmount: amt,
        rewardBadge: idx === 0 ? 'Thần Phán Đoán BĐS (Quán Quân) ★' : `Chuyên Gia Định Giá BĐS (Top ${idx + 1})`
      };
    });
  }

  // Kết quả lưu lại
  const settledResult = {
    settledAt: new Date().toISOString(),
    targetPrice: numTargetPrice,
    isMedianMethod: true,
    totalPrize: Number(totalPrize),
    totalParticipants: realUsers.length,
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
