/**
 * Service Quản lý Hệ Thống Dự Đoán Giá BĐS (Gamification & Prediction Engine)
 * Bao gồm:
 * 1. Quản lý cấu hình chương trình & Bot ảo (is_bot = 1)
 * 2. Lưu trữ & lọc dự đoán của User thật (is_bot = 0)
 * 3. Thuật toán tính toán sai số, phân loại đồng hạng (>3 người chia đều)
 * 4. Trao thưởng Ví KM & cấp Huy hiệu vinh danh (Thần Phán Đoán)
 */

export const PREDICTION_STORAGE_KEY = 'bds_prediction_programs';
export const PREDICTION_VOTES_KEY = 'bds_prediction_votes_store';

// Danh sách họ tên Việt Nam tự nhiên để sinh Bot ảo chân thực
const VN_FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn'];
const VN_MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Tuấn', 'Đức', 'Hoàng', 'Ngọc', 'Quang', 'Quốc', 'Thanh', 'Hữu', 'Anh', 'Bảo', 'Gia'];
const VN_LAST_NAMES = ['Nam', 'Tuấn', 'Hùng', 'Long', 'Cường', 'Anh', 'Thảo', 'Linh', 'Hương', 'My', 'Trang', 'Dũng', 'Khánh', 'Huy', 'Quân', 'Sơn', 'Giang', 'Hiếu', 'Hải', 'Phúc', 'Kiên', 'Thành', 'Trung', 'Bình'];

const BOT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80'
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

// Sinh ngẫu nhiên tên người Việt
export function generateRandomVnName() {
  const f = VN_FIRST_NAMES[Math.floor(Math.random() * VN_FIRST_NAMES.length)];
  const m = VN_MIDDLE_NAMES[Math.floor(Math.random() * VN_MIDDLE_NAMES.length)];
  const l = VN_LAST_NAMES[Math.floor(Math.random() * VN_LAST_NAMES.length)];
  return `${f} ${m} ${l}`;
}

// Sinh danh sách bản ghi Bot Ảo (is_bot = 1)
export function generateBotRecords(gameId, botCount = 2000, basePrice = 7.8, spreadPercent = 6) {
  const records = [];
  const count = Math.min(Math.max(Number(botCount) || 50, 10), 3000);
  const spreadDelta = basePrice * (Number(spreadPercent) / 100);
  const stdev = spreadDelta / 2; // ~95% giá rơi trong khoảng ±spreadDelta
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Thời gian dự đoán ngẫu nhiên rải từ 3 ngày trước đến 3 phút trước
    const minutesAgo = Math.floor(Math.random() * (3 * 24 * 60) + 2);
    const createdAt = new Date(now - minutesAgo * 60 * 1000).toISOString();
    
    // Giá dự đoán làm tròn 2 chữ số thập phân
    let price = Number(randomGaussian(basePrice, stdev).toFixed(2));
    if (price <= 0) price = Number(basePrice.toFixed(2));

    records.push({
      id: `bot-${gameId}-${i + 1}`,
      gameId,
      userId: `bot-user-${i + 1}`,
      userName: generateRandomVnName(),
      userAvatar: BOT_AVATARS[i % BOT_AVATARS.length],
      predictedPrice: price,
      is_bot: 1, // ĐÁNH DẤU CHÍNH XÁC LÀ BOT ẢO
      createdAt
    });
  }

  return records;
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
      if (Array.isArray(parsed)) return parsed;
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
 */
export function syncBotsForGame(gameId, botConfig = {}) {
  const count = Number(botConfig.botCount || 2000);
  const base = Number(botConfig.basePrice || 15.5);
  const spread = Number(botConfig.spreadPercent || 8);
  const isEnabled = botConfig.isEnabled !== false;

  const existing = getStoredPredictions(gameId);
  // Giữ lại toàn bộ User Thật (is_bot = 0)
  const realUsers = existing.filter(r => !r.is_bot && r.is_bot !== 1);

  let newRecords = [];
  if (isEnabled && count > 0) {
    const bots = generateBotRecords(gameId, count, base, spread);
    newRecords = [...realUsers, ...bots];
  } else {
    newRecords = realUsers;
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
 * BACKEND & LOGIC KHI KẾT THÚC SỰ KIỆN: CHỐT KẾT QUẢ & XẾP HẠNG
 * 
 * Bước 1: LỌC DỮ LIỆU - Loại bỏ toàn bộ Bot (is_bot = 1), chỉ giữ lại User thật (is_bot = 0).
 * Bước 2: TÍNH TOÁN & XẾP HẠNG - So sánh với Giá chuẩn, sắp xếp sai số tăng dần.
 * Bước 3: XÉT THƯỞNG & VINH DANH:
 *   - Nếu >3 người đồng hạng ở Top: Chia đều tổng giải thưởng (Ví dụ 2.000.000đ).
 *   - Nếu không đồng hạng: Top 1 (50%), Top 2 (30%), Top 3 (20%).
 *   - Cấp Huy hiệu vinh danh "Thần Phán Đoán" cho User trúng giải.
 */
export function settlePredictionGame({
  gameId,
  targetPrice,
  totalPrize = 2000000,
  currentUser = null
}) {
  const allRecords = getStoredPredictions(gameId);
  const numTargetPrice = Number(targetPrice);

  // BƯỚC 1: LỌC DỮ LIỆU - LOẠI BỎ TOÀN BỘ BOT (is_bot = 1), CHỈ GIỮ USER THẬT (is_bot = 0)
  const realUsers = allRecords.filter(r => !r.is_bot && r.is_bot !== 1);

  if (realUsers.length === 0) {
    return {
      success: false,
      message: 'Chưa có người dùng thật (is_bot = 0) nào tham gia dự đoán chương trình này!',
      winners: [],
      payouts: [],
      splitPrize: false
    };
  }

  // BƯỚC 2: TÍNH TOÁN SAI SỐ VÀ XẮP XẾP
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

  // BƯỚC 3: XÉT THƯỞNG & VINH DANH
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
