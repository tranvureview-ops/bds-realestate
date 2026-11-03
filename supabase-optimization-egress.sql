-- ====================================================================
-- TỐI ƯU HÓA BĂNG THÔNG DATABASE EGRESS & CHỐNG QUÁ TẢI LOGS SUPABASE
-- Hướng dẫn: Đăng nhập Supabase Dashboard -> SQL Editor -> Dán mã này -> Bấm Run
-- ====================================================================

-- 1. TẠO DATABASE VIEW RÚT GỌN CHO THẺ BẤT ĐỘNG SẢN (CARD LISTING)
-- View này chỉ trả về các cột cần thiết cho thẻ bài viết / trang chủ,
-- loại bỏ hoàn toàn các trường siêu nặng như raw_data (50-200KB), description HTML, vr_scenes...
CREATE OR REPLACE VIEW public.vw_properties_card AS
SELECT 
  id,
  title,
  slug,
  demand,
  property_type,
  price,
  price_display,
  price_per_m2,
  area,
  bedroom,
  bathroom,
  address,
  city,
  district,
  ward,
  COALESCE(address, CONCAT_WS(', ', ward, district, city)) AS location,
  images,
  author,
  vip_package_id,
  status,
  published_at,
  expires_at,
  is_verified,
  is_featured
FROM public.properties
WHERE status = 'active' AND is_deleted = false;

-- 2. CẤP QUYỀN TRUY VẤN VIEW CHO CLIENT (ANON VÀ AUTHENTICATED)
GRANT SELECT ON public.vw_properties_card TO anon, authenticated, service_role;

-- 3. TẠO INDEXES TỐI ƯU TRUY VẤN VÀ BĂNG THÔNG
-- Index tối ưu lọc bài viết active sắp xếp theo thời gian đăng (cho trang chủ và danh sách)
CREATE INDEX IF NOT EXISTS idx_properties_card_query 
ON public.properties (published_at DESC) 
WHERE status = 'active' AND is_deleted = false;

-- Index tối ưu lọc theo chuyên mục (demand: sale / rent)
CREATE INDEX IF NOT EXISTS idx_properties_demand_status 
ON public.properties (demand, published_at DESC) 
WHERE status = 'active' AND is_deleted = false;

-- Index tối ưu tra cứu cấu hình sàn
CREATE INDEX IF NOT EXISTS idx_platform_settings_key 
ON public.platform_settings (key);
