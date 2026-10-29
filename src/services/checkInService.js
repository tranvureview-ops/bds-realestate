/**
 * Service quản lý Chuỗi Điểm Danh 7 Ngày Nhận Thưởng
 * Yêu cầu:
 * 1. Bắt buộc ĐĂNG NHẬP mới có thể điểm danh.
 * 2. Mỗi ngày chỉ điểm danh đúng 1 ngày trong chuỗi (Ngày 1 -> Ngày 2 -> ... -> Ngày 7).
 * 3. Tuyệt đối không nhảy cóc hoặc tích 2 ngày cùng lúc trong 1 lần bấm.
 * 4. Nếu bỏ lỡ 1 ngày không điểm danh thì chuỗi tự động quay lại từ Ngày 1.
 * 5. Cảnh báo hạn dùng tiền khuyến mãi 30 ngày (điểm danh ngày nào thì 30 ngày sau không sử dụng sẽ bị thu hồi).
 */

import { CHECK_IN_7_DAYS } from '../data/rewardData';

// Lấy ngày hôm qua dạng toDateString()
function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

/**
 * Lấy trạng thái điểm danh hiện tại của người dùng
 * @param {string} userId - ID người dùng đã đăng nhập
 * @returns {object} { isLoggedIn, checkedToday, streak, nextDayToClaim, isMissed }
 */
export function getCheckInStatus(userId) {
  if (typeof window === 'undefined' || !userId || userId === 'guest') {
    return {
      isLoggedIn: false,
      checkedToday: false,
      streak: 0,
      nextDayToClaim: 1,
      isMissed: false
    };
  }

  const todayStr = new Date().toDateString();
  const yesterdayStr = getYesterdayDateString();

  const lastDate = localStorage.getItem(`bds_checkin_last_date_${userId}`);
  let savedStreak = Number(localStorage.getItem(`bds_checkin_streak_${userId}`) || 0);
  let savedContinuous = Number(localStorage.getItem(`bds_checkin_continuous_${userId}`) || savedStreak || 0);

  // Tự động sửa lỗi nếu user bị lưu sai streak = 2 khi mới điểm danh ngày đầu tiên hôm nay
  const prevDate = localStorage.getItem(`bds_checkin_prev_date_${userId}`);
  if (lastDate === todayStr && savedStreak === 2 && prevDate !== yesterdayStr) {
    savedStreak = 1;
    savedContinuous = 1;
    try {
      localStorage.setItem(`bds_checkin_streak_${userId}`, '1');
      localStorage.setItem(`bds_checkin_continuous_${userId}`, '1');
    } catch (e) {}
  }

  if (lastDate === todayStr) {
    // Đã điểm danh hôm nay
    return {
      isLoggedIn: true,
      checkedToday: true,
      streak: savedStreak || 1,
      continuousStreak: Math.max(savedContinuous, savedStreak || 1),
      nextDayToClaim: savedStreak >= 7 ? 1 : savedStreak + 1,
      isMissed: false
    };
  }

  if (lastDate === yesterdayStr) {
    // Hôm qua có điểm danh, hôm nay chưa điểm danh (tiếp tục chuỗi)
    const activeStreak = savedStreak >= 7 ? 0 : savedStreak;
    return {
      isLoggedIn: true,
      checkedToday: false,
      streak: activeStreak,
      continuousStreak: Math.max(savedContinuous, savedStreak || 0),
      nextDayToClaim: activeStreak + 1,
      isMissed: false
    };
  }

  // Nếu đã từng điểm danh trước đây nhưng không phải hôm qua (bỏ lỡ 1 ngày trở lên) -> Chuỗi quay về Ngày 1
  const isMissed = Boolean(lastDate && lastDate !== yesterdayStr && lastDate !== todayStr);

  return {
    isLoggedIn: true,
    checkedToday: false,
    streak: 0,
    continuousStreak: 0,
    nextDayToClaim: 1,
    isMissed
  };
}

/**
 * Thực hiện điểm danh nhận thưởng vào Ví Khuyến Mãi
 * @param {object} user - Object tài khoản currentUser
 * @param {Array} daysConfig - Danh sách cấu hình ngày (mặc định 7 ngày)
 * @param {number} expiryDays - Số ngày hết hạn tiền thưởng theo cấu hình hệ thống
 * @returns {object} { success, streak, reward, dayLabel, expiresAt, formattedExpiryDate, wasReset, message, error }
 */
export function executeCheckIn(user, daysConfig = CHECK_IN_7_DAYS, expiryDays = 30) {
  if (!user || user.role === 'guest' || !user.id) {
    return {
      success: false,
      error: 'require_login',
      message: 'Vui lòng đăng nhập tài khoản để điểm danh nhận tiền vào Ví Khuyến Mãi!'
    };
  }

  const userId = user.id;
  const status = getCheckInStatus(userId);

  if (status.checkedToday) {
    return {
      success: false,
      error: 'already_checked',
      message: 'Bạn đã điểm danh hôm nay rồi! Vui lòng quay lại vào ngày mai.'
    };
  }

  const todayStr = new Date().toDateString();
  const yesterdayStr = getYesterdayDateString();
  const lastDate = localStorage.getItem(`bds_checkin_last_date_${userId}`);
  const currentSavedStreak = Number(localStorage.getItem(`bds_checkin_streak_${userId}`) || 0);
  const currentContinuous = Number(localStorage.getItem(`bds_checkin_continuous_${userId}`) || currentSavedStreak || 0);

  // Tính chính xác ngày điểm danh tiếp theo (tuyệt đối không nhảy số)
  let nextStreak = 1;
  let nextContinuous = 1;
  let wasReset = false;

  if (lastDate === yesterdayStr && currentSavedStreak > 0) {
    // Có điểm danh hôm qua -> Tiếp tục chuỗi
    nextStreak = currentSavedStreak >= 7 ? 1 : currentSavedStreak + 1;
    nextContinuous = currentContinuous + 1;
  } else {
    // Lần đầu hoặc bỏ lỡ 1 ngày không điểm danh -> Quay lại Ngày 1
    nextStreak = 1;
    nextContinuous = 1;
    if (lastDate && lastDate !== yesterdayStr && lastDate !== todayStr) {
      wasReset = true;
    }
  }

  // Lưu lại lịch sử
  try {
    if (lastDate) {
      localStorage.setItem(`bds_checkin_prev_date_${userId}`, lastDate);
    }
    localStorage.setItem(`bds_checkin_last_date_${userId}`, todayStr);
    localStorage.setItem(`bds_checkin_streak_${userId}`, String(nextStreak));
    localStorage.setItem(`bds_checkin_continuous_${userId}`, String(nextContinuous));

    // Bắn sự kiện đồng bộ toàn hệ thống (Reward Center, Checkin page, Missions)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bds_checkin_updated', {
        detail: { userId, streak: nextStreak, continuousStreak: nextContinuous, checkedToday: true }
      }));
      window.dispatchEvent(new CustomEvent('bds_claimed_missions_updated'));
    }
  } catch (e) {}

  const dayItem = daysConfig[nextStreak - 1] || { reward: 5000 };
  const amount = Number(dayItem.reward || 5000);

  // Tính thời hạn cho tiền thưởng điểm danh theo cài đặt hệ thống
  const effectiveExpiryDays = Number(expiryDays) || 30;
  const expiryDate = new Date(Date.now() + effectiveExpiryDays * 24 * 60 * 60 * 1000);
  const formattedExpiryDate = expiryDate.toLocaleDateString('vi-VN');

  const resetNotice = wasReset ? ' (Chuỗi đã quay lại từ Ngày 1 do bạn bỏ lỡ ngày trước đó)' : '';
  const message = `🎉 Điểm danh Ngày ${nextStreak} thành công! Đã cộng +${amount.toLocaleString('vi-VN')}đ vào Ví Khuyến Mãi${resetNotice}. Lưu ý: Tiền thưởng có hạn sử dụng ${effectiveExpiryDays} ngày (đến ngày ${formattedExpiryDate}), quá thời hạn trên nếu không sử dụng sẽ bị thu hồi.`;

  return {
    success: true,
    streak: nextStreak,
    reward: amount,
    dayLabel: `Ngày ${nextStreak}`,
    expiresAt: expiryDate.toISOString(),
    formattedExpiryDate,
    wasReset,
    message
  };
}
