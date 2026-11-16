import { VIETNAM_ADMINISTRATIVE_DATA } from '../data/vietnamAdministrativeData.js';

// Helper tạo RegExp với ranh giới Unicode chuẩn xác (thay thế cho \\b vốn không nhận ký tự có dấu tiếng Việt)
const ub = (phrase) => new RegExp(`(?<=^|[^\\p{L}\\p{N}])${phrase}(?=[^\\p{L}\\p{N}]|$)`, 'gui');

const PROVINCES_MAP = [
  { re: ub('(?:tp\\.?|thành phố)\\s+hồ chí minh'), rep: 'TP. Hồ Chí Minh' },
  { re: ub('hồ chí minh'), rep: 'Hồ Chí Minh' },
  { re: ub('(?:tp\\.?|thành phố)\\s+hà nội'), rep: 'TP. Hà Nội' },
  { re: ub('hà nội'), rep: 'Hà Nội' },
  { re: ub('(?:tp\\.?|thành phố)\\s+đà nẵng'), rep: 'TP. Đà Nẵng' },
  { re: ub('đà nẵng'), rep: 'Đà Nẵng' },
  { re: ub('(?:tp\\.?|thành phố)\\s+hải phòng'), rep: 'TP. Hải Phòng' },
  { re: ub('hải phòng'), rep: 'Hải Phòng' },
  { re: ub('(?:tp\\.?|thành phố)\\s+cần thơ'), rep: 'TP. Cần Thơ' },
  { re: ub('cần thơ'), rep: 'Cần Thơ' },
  { re: ub('(?:tp\\.?|thành phố)\\s+thủ đức'), rep: 'TP. Thủ Đức' },
  { re: ub('thủ đức'), rep: 'Thủ Đức' },
  { re: ub('(?:tp\\.?|thành phố)\\s+hội an'), rep: 'Thành phố Hội An' },
  { re: ub('hội an'), rep: 'Hội An' },
  { re: ub('(?:tp\\.?|thành phố)\\s+tam kỳ'), rep: 'Thành phố Tam Kỳ' },
  { re: ub('tam kỳ'), rep: 'Tam Kỳ' },
  { re: ub('(?:thị xã|tx\\.?)\\s+điện bàn'), rep: 'Thị xã Điện Bàn' },
  { re: ub('điện bàn'), rep: 'Điện Bàn' },
  { re: ub('quảng nam'), rep: 'Quảng Nam' },
  { re: ub('bình dương'), rep: 'Bình Dương' },
  { re: ub('đồng nai'), rep: 'Đồng Nai' },
  { re: ub('khánh hòa'), rep: 'Khánh Hòa' },
  { re: ub('bà rịa\\s*[-–]\\s*vũng tàu'), rep: 'Bà Rịa - Vũng Tàu' },
  { re: ub('vũng tàu'), rep: 'Vũng Tàu' },
  { re: ub('lâm đồng'), rep: 'Lâm Đồng' },
  { re: ub('đà lạt'), rep: 'Đà Lạt' },
  { re: ub('(?:tp\\.?|thành phố)\\s+nha trang'), rep: 'Thành phố Nha Trang' },
  { re: ub('nha trang'), rep: 'Nha Trang' },
  { re: ub('quảng ninh'), rep: 'Quảng Ninh' },
  { re: ub('hạ long'), rep: 'Hạ Long' },
  { re: ub('bắc ninh'), rep: 'Bắc Ninh' },
  { re: ub('hải dương'), rep: 'Hải Dương' },
  { re: ub('hưng yên'), rep: 'Hưng Yên' },
  { re: ub('vĩnh phúc'), rep: 'Vĩnh Phúc' },
  { re: ub('thái nguyên'), rep: 'Thái Nguyên' },
  { re: ub('bắc giang'), rep: 'Bắc Giang' },
  { re: ub('ninh bình'), rep: 'Ninh Bình' },
  { re: ub('nam định'), rep: 'Nam Định' },
  { re: ub('thái bình'), rep: 'Thái Bình' },
  { re: ub('hà nam'), rep: 'Hà Nam' },
  { re: ub('phú thọ'), rep: 'Phú Thọ' },
  { re: ub('lạng sơn'), rep: 'Lạng Sơn' },
  { re: ub('lào cai'), rep: 'Lào Cai' },
  { re: ub('hòa bình'), rep: 'Hòa Bình' },
  { re: ub('sơn la'), rep: 'Sơn La' },
  { re: ub('yên bái'), rep: 'Yên Bái' },
  { re: ub('tuyên quang'), rep: 'Tuyên Quang' },
  { re: ub('hà giang'), rep: 'Hà Giang' },
  { re: ub('cao bằng'), rep: 'Cao Bằng' },
  { re: ub('bắc kạn'), rep: 'Bắc Kạn' },
  { re: ub('điện biên'), rep: 'Điện Biên' },
  { re: ub('lai châu'), rep: 'Lai Châu' },
  { re: ub('thừa thiên huế'), rep: 'Thừa Thiên Huế' },
  { re: ub('huế'), rep: 'Huế' },
  { re: ub('thanh hóa'), rep: 'Thanh Hóa' },
  { re: ub('nghệ an'), rep: 'Nghệ An' },
  { re: ub('vinh'), rep: 'Vinh' },
  { re: ub('hà tĩnh'), rep: 'Hà Tĩnh' },
  { re: ub('quảng bình'), rep: 'Quảng Bình' },
  { re: ub('đồng hới'), rep: 'Đồng Hới' },
  { re: ub('quảng trị'), rep: 'Quảng Trị' },
  { re: ub('quảng ngãi'), rep: 'Quảng Ngãi' },
  { re: ub('bình định'), rep: 'Bình Định' },
  { re: ub('quy nhơn'), rep: 'Quy Nhơn' },
  { re: ub('phú yên'), rep: 'Phú Yên' },
  { re: ub('tuy hòa'), rep: 'Tuy Hòa' },
  { re: ub('ninh thuận'), rep: 'Ninh Thuận' },
  { re: ub('phan rang'), rep: 'Phan Rang' },
  { re: ub('bình thuận'), rep: 'Bình Thuận' },
  { re: ub('phan thiết'), rep: 'Phan Thiết' },
  { re: ub('đắk lắk'), rep: 'Đắk Lắk' },
  { re: ub('buôn ma thuột'), rep: 'Buôn Ma Thuột' },
  { re: ub('gia lai'), rep: 'Gia Lai' },
  { re: ub('pleiku'), rep: 'Pleiku' },
  { re: ub('đắk nông'), rep: 'Đắk Nông' },
  { re: ub('kon tum'), rep: 'Kon Tum' },
  { re: ub('bình phước'), rep: 'Bình Phước' },
  { re: ub('tây ninh'), rep: 'Tây Ninh' },
  { re: ub('long an'), rep: 'Long An' },
  { re: ub('tiền giang'), rep: 'Tiền Giang' },
  { re: ub('mỹ tho'), rep: 'Mỹ Tho' },
  { re: ub('kiên giang'), rep: 'Kiên Giang' },
  { re: ub('phú quốc'), rep: 'Phú Quốc' },
  { re: ub('rạch giá'), rep: 'Rạch Giá' },
  { re: ub('an giang'), rep: 'An Giang' },
  { re: ub('long xuyên'), rep: 'Long Xuyên' },
  { re: ub('châu đốc'), rep: 'Châu Đốc' },
  { re: ub('bến tre'), rep: 'Bến Tre' },
  { re: ub('đồng tháp'), rep: 'Đồng Tháp' },
  { re: ub('cao lãnh'), rep: 'Cao Lãnh' },
  { re: ub('sa đéc'), rep: 'Sa Đéc' },
  { re: ub('vĩnh long'), rep: 'Vĩnh Long' },
  { re: ub('trà vinh'), rep: 'Trà Vinh' },
  { re: ub('hậu giang'), rep: 'Hậu Giang' },
  { re: ub('vị thanh'), rep: 'Vị Thanh' },
  { re: ub('sóc trăng'), rep: 'Sóc Trăng' },
  { re: ub('bạc liêu'), rep: 'Bạc Liêu' },
  { re: ub('cà mau'), rep: 'Cà Mau' },
  { re: ub('toàn quốc'), rep: 'Toàn Quốc' }
];

// Danh sách các địa danh / danh mục trọng điểm (viết hoa chuẩn)
const PROMINENT_LANDMARKS = [
  ['ngũ hành sơn', 'Ngũ Hành Sơn'],
  ['hải châu', 'Hải Châu'],
  ['sơn trà', 'Sơn Trà'],
  ['thanh khê', 'Thanh Khê'],
  ['cẩm lệ', 'Cẩm Lệ'],
  ['liên chiểu', 'Liên Chiểu'],
  ['hòa vang', 'Hòa Vang'],
  ['hoàng sa', 'Hoàng Sa'],
  ['duy xuyên', 'Duy Xuyên'],
  ['thăng bình', 'Thăng Bình'],
  ['núi thành', 'Núi Thành'],
  ['đại lộc', 'Đại Lộc'],
  ['quế sơn', 'Quế Sơn'],
  ['ba đình', 'Ba Đình'],
  ['hoàn kiếm', 'Hoàn Kiếm'],
  ['cầu giấy', 'Cầu Giấy'],
  ['đống đa', 'Đống Đa'],
  ['hai bà trưng', 'Hai Bà Trưng'],
  ['hoàng mai', 'Hoàng Mai'],
  ['thanh xuân', 'Thanh Xuân'],
  ['tây hồ', 'Tây Hồ'],
  ['nam từ liêm', 'Nam Từ Liêm'],
  ['bắc từ liêm', 'Bắc Từ Liêm'],
  ['hà đông', 'Hà Đông'],
  ['gia lâm', 'Gia Lâm'],
  ['đông anh', 'Đông Anh'],
  ['bình thạnh', 'Bình Thạnh'],
  ['tân bình', 'Tân Bình'],
  ['tân phú', 'Tân Phú'],
  ['phú nhuận', 'Phú Nhuận'],
  ['gò vấp', 'Gò Vấp'],
  ['bình tân', 'Bình Tân'],
  ['bình chánh', 'Bình Chánh'],
  ['hóc môn', 'Hóc Môn'],
  ['củ chi', 'Củ Chi'],
  ['nhà bè', 'Nhà Bè'],
  ['an thượng', 'An Thượng'],
  ['bạch đằng', 'Bạch Đằng'],
  ['trần phú', 'Trần Phú'],
  ['nguyễn văn linh', 'Nguyễn Văn Linh'],
  ['nguyễn tất thành', 'Nguyễn Tất Thành'],
  ['võ nguyên giáp', 'Võ Nguyên Giáp'],
  ['phạm văn đồng', 'Phạm Văn Đồng'],
  ['lê duẩn', 'Lê Duẩn'],
  ['sông hàn', 'Sông Hàn'],
  ['sông cổ cò', 'Sông Cổ Cò'],
  ['cổ cò', 'Cổ Cò'],
  ['mỹ khê', 'Mỹ Khê'],
  ['nam hòa xuân', 'Nam Hòa Xuân'],
  ['hòa xuân', 'Hòa Xuân'],
  ['fpt city', 'FPT City'],
  ['liễu giai', 'Liễu Giai'],
  ['kim mã', 'Kim Mã'],
  ['đội cấn', 'Đội Cấn'],
  ['giảng võ', 'Giảng Võ'],
  ['mễ trì', 'Mễ Trì'],
  ['trần thủ độ', 'Trần Thủ Độ'],
  ['viêm đông', 'Viêm Đông'],
  ['thảo điền', 'Thảo Điền'],
  ['an phú', 'An Phú'],
  ['bến nghé', 'Bến Nghé'],
  ['bến thành', 'Bến Thành'],
  ['vinhomes ocean park', 'Vinhomes Ocean Park'],
  ['vinhomes central park', 'Vinhomes Central Park'],
  ['the matrix one', 'The Matrix One'],
  ['landmark 81', 'Landmark 81'],
  ['wyndham soleil', 'Wyndham Soleil'],
  ['the filmore', 'The Filmore']
];

const PROMINENT_LANDMARKS_MAP = PROMINENT_LANDMARKS.map(([k, v]) => ({
  re: ub(k),
  rep: v
}));

const LOCATION_STOP_WORDS = new Set([
  'tại', 'năm', 'giá', 'sổ', 'đầy', 'mới', 'diện', 'gần', 'mặt', 'hẻm', 'đường',
  'phố', 'và', 'hoặc', 'cho', 'với', 'có', 'là', 'tiện', 'kinh', 'doanh', 'đang',
  'đẹp', 'ngay', 'khu', 'khung', 'bảng', 'thị', 'trường', 'diễn', 'biến', 'tiềm',
  'năng', 'phát', 'triển', 'đánh', 'xu', 'hướng', 'xây', 'tầng', 'thang', 'máy',
  'chính', 'chủ', 'vị', 'trí', 'view', 'căn', 'hộ', 'nhà', 'đất', 'chi', 'tiết',
  'từng', 'các', 'thuộc', 'trong', 'ở', 'trên', 'của'
]);

/**
 * Viết hoa chữ cái đầu cho các danh xưng địa danh hành chính (Khu Vực, Quận Huyện, Phường Xã)
 * Đáp ứng yêu cầu: "Các Khu Vực (ví dụ hồ chí minh nên Hồ Chí Minh), Quận Huyện, Phường Xã, nên ghi Hoa chữ cái"
 */
export const capitalizeLocationEntities = (str) => {
  if (!str || typeof str !== 'string') return '';
  let res = str;

  // 1. Cấp hành chính: Quận, Huyện, Thị xã, Thành phố, Phường, Xã, Thị trấn
  // Bỏ qua trường hợp theo sau là từ nối (ví dụ: từng phường tại Quận 1)
  const adminRegex = /(?<=^|[^\p{L}\p{N}])(quận|huyện|thị xã|thành phố|tp\.?|phường|xã|thị trấn)\s+(?!(?:tại|thuộc|trong|ở|trên|của|và|hoặc|cho|với|nào|mỗi|từng|các)(?:[^\p{L}\p{N}]|$))([0-9]+|[\p{L}]+(?:\s+[\p{L}]+){0,3})/gui;

  res = res.replace(adminRegex, (match, prefix, rest) => {
    let pCap = prefix.toLowerCase();
    if (pCap === 'quận') pCap = 'Quận';
    else if (pCap === 'huyện') pCap = 'Huyện';
    else if (pCap === 'thị xã') pCap = 'Thị xã';
    else if (pCap === 'thành phố') pCap = 'Thành phố';
    else if (pCap.startsWith('tp')) pCap = 'TP.';
    else if (pCap === 'phường') pCap = 'Phường';
    else if (pCap === 'xã') pCap = 'Xã';
    else if (pCap === 'thị trấn') pCap = 'Thị trấn';

    const words = rest.split(/\s+/);
    const capWords = [];
    for (const w of words) {
      if (LOCATION_STOP_WORDS.has(w.toLowerCase())) break;
      capWords.push(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    }
    if (capWords.length === 0) return match;
    const remainingWords = words.slice(capWords.length);
    const suffix = remainingWords.length > 0 ? ' ' + remainingWords.join(' ') : '';
    return pCap + ' ' + capWords.join(' ') + suffix;
  });

  // 2. Bảng đối chiếu Khu Vực & Tỉnh Thành trực thuộc 63 tỉnh thành
  for (const item of PROVINCES_MAP) {
    res = res.replace(item.re, item.rep);
  }

  // 3. Bảng đối chiếu các quận huyện & địa danh trọng điểm không có tiền tố quận/huyện
  for (const item of PROMINENT_LANDMARKS_MAP) {
    res = res.replace(item.re, item.rep);
  }

  // 4. Tuyến đường / Phố tên riêng (tránh nhầm lẫn 'nhà mặt phố', 'mặt phố', 'nhà phố')
  res = res.replace(/(?<=^|[^\p{L}\p{N}])(đường)\s+([\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)*)/gui, (match, prefix, rest) => {
    const words = rest.split(/\s+/);
    if (LOCATION_STOP_WORDS.has(words[0].toLowerCase())) return match;
    const capWords = [];
    let insideName = true;
    for (const w of words) {
      const wLower = w.toLowerCase();
      if (LOCATION_STOP_WORDS.has(wLower) && capWords.length >= 1) insideName = false;
      if (insideName) capWords.push(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      else capWords.push(w);
    }
    return `Đường ${capWords.join(' ')}`;
  });

  res = res.replace(/(?<!thành\s+|tp\.?\s+|mặt\s+|nhà\s+mặt\s+|nhà\s+)(?<=^|[^\p{L}\p{N}])(phố)\s+([\p{L}\p{N}]+(?:\s+[\p{L}\p{N}]+)*)/gui, (match, prefix, rest) => {
    const words = rest.split(/\s+/);
    if (LOCATION_STOP_WORDS.has(words[0].toLowerCase())) return match;
    const capWords = [];
    let insideName = true;
    for (const w of words) {
      const wLower = w.toLowerCase();
      if (LOCATION_STOP_WORDS.has(wLower) && capWords.length >= 1) insideName = false;
      if (insideName) capWords.push(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      else capWords.push(w);
    }
    return `Phố ${capWords.join(' ')}`;
  });

  return res;
};

/**
 * Chuẩn hóa câu / tiêu đề theo chuẩn Sentence Case (Chỉ viết hoa đầu câu & viết hoa địa danh)
 * Đúng chuẩn yêu cầu: "như cũ chỉ in Hoa địa danh, Hồ Chí Minh..."
 * Ví dụ: "Câu Hỏi Thường Gặp Khi Mua Bán Căn Hộ Chung Cư Tại TP. Hồ Chí Minh"
 *    -> "Câu hỏi thường gặp khi mua bán căn hộ chung cư tại TP. Hồ Chí Minh"
 * @param {string} str Chuỗi tiêu đề cần chuẩn hóa
 * @returns {string} Chuỗi sau chuẩn hóa
 */
export const formatSentenceCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();
  if (!trimmed) return '';

  // Đưa về Sentence Case: hạ thường toàn bộ rồi chỉ viết hoa chữ cái đầu tiên
  const lower = trimmed.toLowerCase();
  const text = lower.charAt(0).toUpperCase() + lower.slice(1);

  // Chỉ in hoa địa danh, đơn vị hành chính và danh từ riêng
  return capitalizeLocationEntities(text);
};
