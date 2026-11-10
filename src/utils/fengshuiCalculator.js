/**
 * Thuật toán tra cứu phong thủy xem tuổi mua đất, làm nhà chuẩn truyền thống Việt Nam
 * Bao gồm tính toán:
 * 1. Can Chi & Mệnh Ngũ Hành
 * 2. Cung Phi Bát Trạch & Hướng Hợp Mệnh
 * 3. Hạn Tam Tai
 * 4. Hạn Kim Lâu (Thân, Thê, Tử, Lục Súc)
 * 5. Hạn Hoang Ốc (Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc)
 * 6. Tự động tìm các tuổi đẹp nhất để mượn tuổi làm nhà
 */

const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Ngũ hành Nạp Âm theo Can Chi
const MENH_NGU_HANH = {
  'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim', 'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
  'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc', 'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
  'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim', 'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
  'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy', 'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
  'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim', 'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
  'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy', 'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
  'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa', 'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
  'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy', 'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
  'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa', 'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
  'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ', 'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
  'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa', 'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
  'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ', 'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
  'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc', 'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
  'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ', 'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
  'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc', 'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
};

// Tam Hợp & Tam Tai
const TAM_TAI_MAPPING = {
  // Thân - Tý - Thìn gặp Tam Tai tại Dần - Mão - Thìn
  'Thân': ['Dần', 'Mão', 'Thìn'],
  'Tý': ['Dần', 'Mão', 'Thìn'],
  'Thìn': ['Dần', 'Mão', 'Thìn'],

  // Dần - Ngọ - Tuất gặp Tam Tai tại Thân - Dậu - Tuất
  'Dần': ['Thân', 'Dậu', 'Tuất'],
  'Ngọ': ['Thân', 'Dậu', 'Tuất'],
  'Tuất': ['Thân', 'Dậu', 'Tuất'],

  // Hợi - Mão - Mùi gặp Tam Tai tại Tỵ - Ngọ - Mùi
  'Hợi': ['Tỵ', 'Ngọ', 'Mùi'],
  'Mão': ['Tỵ', 'Ngọ', 'Mùi'],
  'Mùi': ['Tỵ', 'Ngọ', 'Mùi'],

  // Tỵ - Dậu - Sửu gặp Tam Tai tại Hợi - Tý - Sửu
  'Tỵ': ['Hợi', 'Tý', 'Sửu'],
  'Dậu': ['Hợi', 'Tý', 'Sửu'],
  'Sửu': ['Hợi', 'Tý', 'Sửu']
};

// Cung mệnh Bát Trạch cho Nam & Nữ
const CUNG_MENH_NAM = ['Khảm', 'Ly', 'Cấn', 'Đoài', 'Càn', 'Khôn', 'Tốn', 'Chấn', 'Khôn'];
const CUNG_MENH_NU = ['Cấn', 'Càn', 'Đoài', 'Cấn', 'Ly', 'Khảm', 'Khôn', 'Chấn', 'Tốn'];

const HUONG_BAT_TRACH = {
  'Khảm': { nhom: 'Đông Tứ Mệnh', tot: ['Đông Nam (Sinh Khí)', 'Đông (Thiên Y)', 'Nam (Diên Niên)', 'Bắc (Phục Vị)'], xau: ['Tây Nam (Tuyệt Mệnh)', 'Đông Bắc (Ngũ Quỷ)', 'Tây Bắc (Lục Sát)', 'Tây (Họa Hại)'] },
  'Ly': { nhom: 'Đông Tứ Mệnh', tot: ['Đông (Sinh Khí)', 'Đông Nam (Thiên Y)', 'Bắc (Diên Niên)', 'Nam (Phục Vị)'], xau: ['Tây Bắc (Tuyệt Mệnh)', 'Tây (Ngũ Quỷ)', 'Tây Nam (Lục Sát)', 'Đông Bắc (Họa Hại)'] },
  'Chấn': { nhom: 'Đông Tứ Mệnh', tot: ['Nam (Sinh Khí)', 'Bắc (Thiên Y)', 'Đông Nam (Diên Niên)', 'Đông (Phục Vị)'], xau: ['Tây (Tuyệt Mệnh)', 'Tây Bắc (Ngũ Quỷ)', 'Đông Bắc (Lục Sát)', 'Tây Nam (Họa Hại)'] },
  'Tốn': { nhom: 'Đông Tứ Mệnh', tot: ['Bắc (Sinh Khí)', 'Nam (Thiên Y)', 'Đông (Diên Niên)', 'Đông Nam (Phục Vị)'], xau: ['Đông Bắc (Tuyệt Mệnh)', 'Tây Nam (Ngũ Quỷ)', 'Tây (Lục Sát)', 'Tây Bắc (Họa Hại)'] },
  'Càn': { nhom: 'Tây Tứ Mệnh', tot: ['Tây (Sinh Khí)', 'Đông Bắc (Thiên Y)', 'Tây Nam (Diên Niên)', 'Tây Bắc (Phục Vị)'], xau: ['Nam (Tuyệt Mệnh)', 'Đông (Ngũ Quỷ)', 'Bắc (Lục Sát)', 'Đông Nam (Họa Hại)'] },
  'Khôn': { nhom: 'Tây Tứ Mệnh', tot: ['Đông Bắc (Sinh Khí)', 'Tây (Thiên Y)', 'Tây Bắc (Diên Niên)', 'Tây Nam (Phục Vị)'], xau: ['Bắc (Tuyệt Mệnh)', 'Đông Nam (Ngũ Quỷ)', 'Nam (Lục Sát)', 'Đông (Họa Hại)'] },
  'Cấn': { nhom: 'Tây Tứ Mệnh', tot: ['Tây Nam (Sinh Khí)', 'Tây Bắc (Thiên Y)', 'Tây (Diên Niên)', 'Đông Bắc (Phục Vị)'], xau: ['Đông Nam (Tuyệt Mệnh)', 'Bắc (Ngũ Quỷ)', 'Đông (Lục Sát)', 'Nam (Họa Hại)'] },
  'Đoài': { nhom: 'Tây Tứ Mệnh', tot: ['Tây Bắc (Sinh Khí)', 'Tây Nam (Thiên Y)', 'Đông Bắc (Diên Niên)', 'Tây (Phục Vị)'], xau: ['Đông (Tuyệt Mệnh)', 'Nam (Ngũ Quỷ)', 'Đông Nam (Lục Sát)', 'Bắc (Họa Hại)'] }
};

/**
 * Lấy Can Chi từ năm dương lịch
 */
export function getCanChi(year) {
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  const can = THIEN_CAN[canIndex >= 0 ? canIndex : canIndex + 10];
  const chi = DIA_CHI[chiIndex >= 0 ? chiIndex : chiIndex + 12];
  return { can, chi, fullName: `${can} ${chi}` };
}

/**
 * Kiểm tra hạn Tam Tai
 */
export function checkTamTai(birthYear, targetYear) {
  const birthChi = getCanChi(birthYear).chi;
  const targetChi = getCanChi(targetYear).chi;
  const tamTaiYears = TAM_TAI_MAPPING[birthChi] || [];
  const isPham = tamTaiYears.includes(targetChi);

  return {
    isPham,
    tamTaiYears,
    targetChi,
    details: isPham
      ? `Năm ${targetYear} (${targetChi}) là năm Tam Tai của tuổi ${birthChi} (gặp hạn trong các năm: ${tamTaiYears.join(', ')}). Gia chủ không nên động thổ khởi công.`
      : `Tuổi ${birthChi} gặp Tam Tai vào các năm ${tamTaiYears.join(', ')}. Năm ${targetYear} (${targetChi}) KHÔNG phạm Tam Tai. Rất thuận lợi.`
  };
}

/**
 * Kiểm tra hạn Kim Lâu
 * Tuổi mụ chia cho 9:
 * Dư 1: Kim Lâu Thân
 * Dư 3: Kim Lâu Thê
 * Dư 6: Kim Lâu Tử
 * Dư 8: Kim Lâu Lục Súc
 */
export function checkKimLau(tuoiMu) {
  const remainder = tuoiMu % 9;

  let isPham = false;
  let loaiKimLau = '';
  let yNghia = '';

  switch (remainder) {
    case 1:
      isPham = true;
      loaiKimLau = 'Kim Lâu Thân';
      yNghia = 'Gây tai họa, bệnh tật hoặc tổn hại trực tiếp đến chính bản thân gia chủ.';
      break;
    case 3:
      isPham = true;
      loaiKimLau = 'Kim Lâu Thê';
      yNghia = 'Gây tai ương, đau ốm, ảnh hưởng xấu đến sức khỏe và sự nghiệp của người vợ.';
      break;
    case 6:
      isPham = true;
      loaiKimLau = 'Kim Lâu Tử';
      yNghia = 'Gây khó khăn, trắc trở, ảnh hưởng trực tiếp đến đường con cái trong nhà.';
      break;
    case 8:
      isPham = true;
      loaiKimLau = 'Kim Lâu Lục Súc';
      yNghia = 'Gây hao tổn tài lộc, kinh tế gia đình sa sút, làm ăn thất bát, lục súc khó nuôi.';
      break;
    default:
      isPham = false;
      loaiKimLau = 'Không phạm Kim Lâu';
      yNghia = 'Tuổi này đại cát, không vướng hạn Kim Lâu, hoàn toàn an tâm làm nhà.';
      break;
  }

  return {
    isPham,
    remainder,
    loaiKimLau,
    yNghia,
    details: isPham
      ? `Tuổi mụ là ${tuoiMu} tuổi (chia 9 dư ${remainder}), phạm phải ${loaiKimLau}. ${yNghia}`
      : `Tuổi mụ là ${tuoiMu} tuổi (chia 9 dư ${remainder}), KHÔNG phạm Kim Lâu. Rất cát lợi.`
  };
}

/**
 * Kiểm tra hạn Hoang Ốc
 * 6 cung Hoang Ốc:
 * 1. Nhất Cát (Tốt)
 * 2. Nhì Nghi (Tốt)
 * 3. Tam Địa Sát (Xấu)
 * 4. Tứ Tấn Tài (Tốt)
 * 5. Ngũ Thọ Tử (Xấu)
 * 6. Lục Hoang Ốc (Xấu)
 */
export function checkHoangOc(tuoiMu) {
  const HOANG_OC_PALACES = [
    { cung: 'Nhất Cát', isTot: true, yNghia: 'Làm nhà tuổi này sẽ có chốn an cư tốt, vạn sự hanh thông, công thành danh toại.' },
    { cung: 'Nhì Nghi', isTot: true, yNghia: 'Làm nhà tuổi này sẽ giàu có, hưng vượng, tiền bạc vào nhà sung túc thịnh vượng.' },
    { cung: 'Tam Địa Sát', isTot: false, yNghia: 'Phạm Địa Sát, gia chủ sinh bệnh tật, ốm đau liên miên, gia đạo hao tài tốn của.' },
    { cung: 'Tứ Tấn Tài', isTot: true, yNghia: 'Phúc lộc tự đến, làm nhà mùa này phát tài phát lộc, kinh doanh đắc lợi.' },
    { cung: 'Ngũ Thọ Tử', isTot: false, yNghia: 'Phạm Thọ Tử, gia đạo lục đục, ly tán, cảnh sinh ly tử biệt vô cùng hung hiểm.' },
    { cung: 'Lục Hoang Ốc', isTot: false, yNghia: 'Phạm Hoang Ốc, nhà cửa âm khí, vướng bận tai ương, khó lòng thành đạt.' }
  ];

  // Tính theo vòng 6 cung:
  // 10: 0, 20: 1, 30: 2, 40: 3, 50: 4, 60: 5
  const chuc = Math.floor(tuoiMu / 10);
  const donVi = tuoiMu % 10;

  let startPalace = (chuc - 1) % 6;
  if (startPalace < 0) startPalace = 5;

  const finalIndex = (startPalace + donVi) % 6;
  const result = HOANG_OC_PALACES[finalIndex];

  return {
    cung: result.cung,
    isTot: result.isTot,
    isPham: !result.isTot,
    yNghia: result.yNghia,
    details: result.isTot
      ? `Tuổi mụ ${tuoiMu} tuổi thuộc cung ${result.cung} (TỐT). ${result.yNghia}`
      : `Tuổi mụ ${tuoiMu} tuổi thuộc cung ${result.cung} (HUNG - XẤU). ${result.yNghia}`
  };
}

/**
 * Tra cứu cung phi Bát Trạch
 */
export function getBatTrach(birthYear, gender = 'nam') {
  // Rút gọn tổng các chữ số năm sinh
  let sum = birthYear.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum >= 10) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  let cungIndex = 0;
  if (gender === 'nam') {
    // Với người sinh sau năm 2000 có thể khác, nhưng chuẩn cổ:
    // Nam: 11 - sum (trước 2000) hoặc 9 - sum (sau 2000)
    let val = birthYear < 2000 ? 11 - sum : 9 - sum;
    if (val <= 0) val += 9;
    cungIndex = (val - 1) % 9;
    const cungName = CUNG_MENH_NAM[cungIndex] || 'Khôn';
    return { cung: cungName, ...HUONG_BAT_TRACH[cungName] };
  } else {
    let val = birthYear < 2000 ? 4 + sum : 6 + sum;
    while (val > 9) val -= 9;
    cungIndex = (val - 1) % 9;
    const cungName = CUNG_MENH_NU[cungIndex] || 'Cấn';
    return { cung: cungName, ...HUONG_BAT_TRACH[cungName] };
  }
}

/**
 * Đánh giá tổng quan phong thủy làm nhà
 */
export function calculateFengShui(birthYear, targetYear, gender = 'nam') {
  const tuoiMu = targetYear - birthYear + 1;
  const canChiBirth = getCanChi(birthYear);
  const canChiTarget = getCanChi(targetYear);
  const menh = MENH_NGU_HANH[canChiBirth.fullName] || 'Chưa xác định';
  const batTrach = getBatTrach(birthYear, gender);

  const tamTai = checkTamTai(birthYear, targetYear);
  const kimLau = checkKimLau(tuoiMu);
  const hoangOc = checkHoangOc(tuoiMu);

  const countPham = (tamTai.isPham ? 1 : 0) + (kimLau.isPham ? 1 : 0) + (hoangOc.isPham ? 1 : 0);

  let rating = 'xuat-sac'; // xuat-sac, kha, can-muon-tuoi, dai-ky
  let titleVerdict = '';
  let summary = '';

  if (countPham === 0) {
    rating = 'xuat-sac';
    titleVerdict = 'TUỔI ĐẠI CÁT ĐẠI LỢI ĐỂ LÀM NHÀ / MUA ĐẤT';
    summary = `Năm ${targetYear} (${canChiTarget.fullName}) là một năm TUYỆT VỜI đối với tuổi ${canChiBirth.fullName}. Gia chủ không phạm bất kỳ hạn nào trong 3 đại kỵ (Tam Tai, Kim Lâu, Hoang Ốc). Gia đạo sẽ đón tài lộc, gia đình hưng vượng, sức khỏe dồi dào, an cư lạc nghiệp.`;
  } else if (!kimLau.isPham && !hoangOc.isPham && tamTai.isPham) {
    rating = 'kha';
    titleVerdict = 'CÓ THỂ LÀM NHÀ (CÂN NHẮC HOẶC MƯỢN TUỔI)';
    summary = `Năm ${targetYear}, gia chủ không phạm Kim Lâu và Hoang Ốc (2 đại kỵ nặng nhất), nhưng phạm hạn Tam Tai. Nếu không quá vội, bạn có thể chờ hết Tam Tai hoặc tiến hành thủ tục mượn tuổi người thân để thêm phần an tâm trọn vẹn.`;
  } else {
    rating = 'can-muon-tuoi';
    titleVerdict = 'KHÔNG NÊN ĐỘNG THỔ - NÊN MƯỢN TUỔI LÀM NHÀ';
    summary = `Năm ${targetYear}, tuổi của gia chủ phạm vào ${kimLau.isPham ? 'Kim Lâu (' + kimLau.loaiKimLau + ')' : ''}${kimLau.isPham && hoangOc.isPham ? ' và ' : ''}${hoangOc.isPham ? 'Hoang Ốc (' + hoangOc.cung + ')' : ''}. Nếu tiến hành khởi công xây nhà hoặc mua đất có thể gặp nhiều trắc trở, hao tài tán của. GIẢI PHÁP TỐI ƯU NHẤT LÀ MƯỢN TUỔI NGƯỜI THÂN ĐỂ ĐỨNG RA ĐỘNG THỔ.`;
  }

  // Danh sách gợi ý các tuổi mượn đẹp nhất trong năm targetYear
  const suggestedBorrowAges = findBestBorrowAges(targetYear);

  return {
    birthYear,
    targetYear,
    gender,
    tuoiMu,
    canChiBirth,
    canChiTarget,
    menh,
    batTrach,
    tamTai,
    kimLau,
    hoangOc,
    countPham,
    rating,
    titleVerdict,
    summary,
    suggestedBorrowAges
  };
}

/**
 * Tìm kiếm các tuổi nam giới đẹp nhất trong năm targetYear (không phạm Tam Tai, Kim Lâu, Hoang Ốc)
 */
export function findBestBorrowAges(targetYear) {
  const result = [];
  // Quét các tuổi nam giới từ 22 đến 75 tuổi
  const currentYear = new Date().getFullYear();
  const maxBirth = targetYear - 20;
  const minBirth = targetYear - 75;

  for (let year = minBirth; year <= maxBirth; year++) {
    const tuoiMu = targetYear - year + 1;
    const tt = checkTamTai(year, targetYear);
    const kl = checkKimLau(tuoiMu);
    const ho = checkHoangOc(tuoiMu);

    // Điều kiện mượn tuổi: TUYỆT ĐỐI không phạm cả 3 hạn
    if (!tt.isPham && !kl.isPham && !ho.isPham) {
      const canChi = getCanChi(year);
      result.push({
        birthYear: year,
        tuoiMu,
        canChi: canChi.fullName,
        menh: MENH_NGU_HANH[canChi.fullName] || '',
        cungHoangOc: ho.cung,
        isPriority: tuoiMu >= 35 && tuoiMu <= 65 // Độ tuổi phúc đức, sung mãn nhất
      });
    }
  }

  // Sắp xếp ưu tiên tuổi chín muồi, đứng tuổi (từ 35 đến 65 tuổi)
  return result.sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.birthYear - a.birthYear;
  }).slice(0, 8); // Lấy top 8 tuổi đẹp nhất
}
