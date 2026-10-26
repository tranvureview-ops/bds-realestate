/**
 * textSanitizer.js
 * Bộ tiện ích tự động phát hiện, làm sạch và loại bỏ số điện thoại (Anti-Phone Spam)
 * khỏi Tiêu đề (Title) và Nội dung mô tả (Description) tin đăng bất động sản.
 * 
 * Hỗ trợ các định dạng:
 * - Dạng liền: 0905123456, 0389999999, +84905123456, 84905123456
 * - Dạng nhóm: 0905.123.456, 0905 123 456, 0905-123-456, 090 512 3456
 * - Dạng cách chữ số cố tình lách: 0 9 0 5 1 2 3 4 5 6
 * - Kèm các tiền tố: LH, Liên hệ, SĐT, Zalo, Hotline, Call, Tel, Phone, Gặp,...
 * 
 * Đảm bảo KHÔNG xóa nhầm:
 * - Số tiền tỷ/triệu: 5.5 tỷ, 10.500.000.000 đ
 * - Diện tích / kích thước: 100m2, 5m x 20m, đường 7.5m
 * - Năm hoàn công: 2024, 2025
 */

// Danh sách tiền tố liên hệ thường gặp đi kèm số điện thoại
const PHONE_PREFIX_REGEX_STR = '(?:(?:liên\\s*hệ|lh|l\\/h|sđt|sdt|số\\s*đt|số\\s*điện\\s*thoại|zalo|hotline|call|tel|phone|inbox|gặp)\\s*[:\\-\\s]*)+';

/**
 * Regex nhận diện số điện thoại Việt Nam (có hoặc không có tiền tố)
 * - (?<!\\d): không được bắt phần đuôi của chuỗi số khác (ví dụ không xóa phần đuôi của 10.500.000.000)
 * - Đầu số VN: 0 hoặc +84 hoặc 84, theo sau là [235789]
 * - Tổng số chữ số: 10 đến 11 chữ số
 */
const VIETNAMESE_PHONE_REGEX = new RegExp(
  '(?:' + PHONE_PREFIX_REGEX_STR + ')?' +
  '(?<!\\d)(?:\\+?84|0)[\\s._-]*[235789](?:[\\s._-]*\\d){8,9}(?!\\d)',
  'gi'
);

/**
 * Kiểm tra xem chuỗi văn bản có chứa số điện thoại hay không
 * @param {string} rawText 
 * @returns {boolean}
 */
export function hasPhoneNumber(rawText) {
  if (!rawText || typeof rawText !== 'string') return false;
  const matches = rawText.match(VIETNAMESE_PHONE_REGEX);
  if (!matches) return false;
  return matches.some(m => {
    const digitsOnly = m.replace(/\D/g, '');
    const isLikelyMoney = /000[\s._-]*000/i.test(m);
    return !isLikelyMoney && (digitsOnly.length === 10 || digitsOnly.length === 11 || (digitsOnly.startsWith('84') && digitsOnly.length === 11));
  });
}

/**
 * Quét và loại bỏ số điện thoại kèm tiền tố khỏi chuỗi văn bản
 * @param {string} rawText Văn bản gốc
 * @returns {{ text: string, hasPhone: boolean, removedPhones: string[] }}
 */
export function sanitizePhoneFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { text: rawText || '', hasPhone: false, removedPhones: [] };
  }

  let text = rawText;
  const removedPhones = [];

  // 1. Quét tìm tất cả các chuỗi khớp regex số điện thoại
  const matches = text.match(VIETNAMESE_PHONE_REGEX);
  if (matches && matches.length > 0) {
    for (const m of matches) {
      const digitsOnly = m.replace(/\D/g, '');
      const isLikelyMoney = /000[\s._-]*000/i.test(m);
      if (!isLikelyMoney && (digitsOnly.length === 10 || digitsOnly.length === 11 || (digitsOnly.startsWith('84') && digitsOnly.length === 11))) {
        removedPhones.push(m.trim());
        text = text.replace(m, ' ');
      }
    }
  }

  // 2. Xóa các tiền tố mồ côi nếu còn sót lại (sau khi SĐT bị xóa riêng)
  text = text.replace(
    /(?:^|[\s,.\-!])(?:liên\s*hệ|lh|l\/h|sđt|sdt|số\s*đt|số\s*điện\s*thoại|zalo|hotline|call|tel|phone)\s*[:\-]?\s*(?=[\s,.\-!]|$)/gi,
    ' '
  );

  // 3. Chuẩn hóa khoảng trắng & dấu câu mồ côi mà KHÔNG làm vỡ số thập phân (5.5 tỷ, 7.5m)
  text = text
    .replace(/[ \t]+/g, ' ')                           // Khoảng trắng tab/kép -> đơn
    .replace(/\s*-\s*-+\s*/g, ' - ')                   // Gạch nối kép -> đơn
    .replace(/\s*,\s*,+\s*/g, ', ')                    // Phẩy kép -> đơn
    .replace(/\s*,\s*-\s*/g, ' - ')
    .replace(/\s*-\s*,\s*/g, ' - ')
    .replace(/([,;!?])\s*/g, '$1 ')                    // Dấu câu cách sau 1 space
    .replace(/\s+([.\-])\s+(?!\d)/g, ' $1 ')           // Dấu chấm / gạch nối mồ côi
    .replace(/^\s*[,.\-!?:\–\—]+\s*/g, '')             // Xóa dấu câu ở đầu chuỗi
    .replace(/\s*[,.\-!?:\–\—]+\s*$/g, '')             // Xóa dấu câu ở cuối chuỗi
    .replace(/\s{2,}/g, ' ')                           // Chuẩn hóa lại khoảng trắng
    .trim();

  return {
    text,
    hasPhone: removedPhones.length > 0,
    removedPhones
  };
}

export default {
  hasPhoneNumber,
  sanitizePhoneFromText
};
