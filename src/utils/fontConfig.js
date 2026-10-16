// Danh mục phông chữ tiếng Việt chuẩn Google Fonts cho sàn BĐS
export const AVAILABLE_FONTS = [
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    category: 'Hiện đại, Công nghệ, BĐS cao cấp (Mặc định)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cssValue: "'Plus Jakarta Sans', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
    sampleHeadline: 'Sàn Bất Động Sản Đất Biển Đà Nẵng',
    sampleText: 'Nền tảng mua bán căn hộ, đất nền và biệt thự biển chuẩn pháp lý.',
    samplePrice: '4.850.000.000 ₫'
  },
  {
    id: 'be-vietnam-pro',
    name: 'Be Vietnam Pro',
    category: 'Chuẩn Tiếng Việt, Pháp lý, Báo chí & Văn bản',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    cssValue: "'Be Vietnam Pro', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap',
    sampleHeadline: 'Quy Chế & Pháp Lý Bất Động Sản Việt Nam',
    sampleText: 'Thiết kế riêng cho hệ thống chữ Quốc ngữ, dấu thanh hiển thị chuẩn xác nhất.',
    samplePrice: '12.500.000.000 ₫'
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Gọn gàng, Chuẩn Quốc tế, Tối ưu giao diện UI',
    fontFamily: "'Inter', sans-serif",
    cssValue: "'Inter', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    sampleHeadline: 'Căn Hộ View Biển Mỹ Khê Sơn Trà',
    sampleText: 'Font chữ số 1 thế giới cho giao diện phần mềm và cổng thông tin.',
    samplePrice: '3.200.000.000 ₫'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'Sang trọng, Đẳng cấp, Khối hình học ấn tượng',
    fontFamily: "'Montserrat', sans-serif",
    cssValue: "'Montserrat', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
    sampleHeadline: 'BIỆT THỰ BIỂN LUXURY RESORT',
    sampleText: 'Tạo dấu ấn thương hiệu mạnh mẽ, nổi bật trên các banner quảng cáo VIP.',
    samplePrice: '25.000.000.000 ₫'
  },
  {
    id: 'lexend',
    name: 'Lexend',
    category: 'Tối ưu tốc độ đọc, Thoáng mắt, Dễ chịu',
    fontFamily: "'Lexend', sans-serif",
    cssValue: "'Lexend', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap',
    sampleHeadline: 'Tra Cứu Bất Động Sản Nhanh Chóng',
    sampleText: 'Được thiết kế khoa học giúp người xem đọc lướt thông tin tin đăng nhanh hơn.',
    samplePrice: '7.900.000.000 ₫'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'Phổ biến, Thân thiện, Thích ứng mọi thiết bị',
    fontFamily: "'Roboto', sans-serif",
    cssValue: "'Roboto', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
    sampleHeadline: 'Bản Đồ Quy Hoạch Đất Nền Đà Nẵng 2026',
    sampleText: 'Phông chữ tiêu chuẩn của Google, hiển thị mượt mà trên tất cả thiết bị di động.',
    samplePrice: '1.850.000.000 ₫'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'Truyền thống, Dễ nhìn, Độ mở ký tự cao',
    fontFamily: "'Open Sans', sans-serif",
    cssValue: "'Open Sans', sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap',
    sampleHeadline: 'Hỗ Trợ Thủ Tục Pháp Lý & Sang Tên Sổ Đỏ',
    sampleText: 'Nét chữ tròn trịa, ấm áp, tạo cảm giác tin cậy và chuyên nghiệp.',
    samplePrice: '6.400.000.000 ₫'
  }
];

export const DEFAULT_FONT_NAME = 'Plus Jakarta Sans';

export const getFontConfig = (fontNameOrId) => {
  if (!fontNameOrId) return AVAILABLE_FONTS[0];
  const query = fontNameOrId.trim().toLowerCase();
  const match = AVAILABLE_FONTS.find(
    f => f.id.toLowerCase() === query || 
         f.name.toLowerCase() === query || 
         f.fontFamily.toLowerCase().includes(query)
  );
  return match || AVAILABLE_FONTS[0];
};
