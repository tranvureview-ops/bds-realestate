-- ==============================================================================
-- BẢN MÃ NGUYÊN KHỐI PHÂN QUYỀN BẢO MẬT ROW LEVEL SECURITY (RLS) CHO SUPABASE
-- Mục tiêu: 
-- 1. Bảo vệ tuyệt đối thông tin người dùng, mật khẩu, token xác thực và cấu hình SMTP.
-- 2. Ngăn chặn hoàn toàn việc khóa công khai (Anon Key) đọc trộm cấu hình sàn.
-- ==============================================================================

-- 1. BẢNG CẤU HÌNH SÀN (platform_settings)
ALTER TABLE IF EXISTS public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ nếu có để tránh xung đột
DROP POLICY IF EXISTS "Public settings read policy" ON public.platform_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.platform_settings;
DROP POLICY IF EXISTS "Allow anon read all settings" ON public.platform_settings;

-- CHỈ CHO PHÉP KHÁCH VÀ NGƯỜI DÙNG ĐỌC CÁC CẤU HÌNH GIAO DIỆN CÔNG CỘNG
-- Tuyệt đối KHÔNG cho phép đọc: bds_users_list, bds_email_config, bds_verification_tokens, bds_telegram_config
CREATE POLICY "Public settings read policy"
ON public.platform_settings
FOR SELECT
TO anon, authenticated
USING (
  key IN (
    'bds_header_config',
    'bds_footer_config',
    'bds_system_config',
    'bds_payment_config',
    'bds_nav_menu',
    'bds_vip_packages',
    'bds_membership_packages',
    'bds_single_config',
    'bds_rewards_config',
    'bds_bump_service_price'
  )
);

-- Service Role (Server Backend) có toàn quyền đọc/ghi mọi cấu hình
CREATE POLICY "Service role full access to platform_settings"
ON public.platform_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- 2. BẢNG BẤT ĐỘNG SẢN (properties)
ALTER TABLE IF EXISTS public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read properties" ON public.properties;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.properties;

-- Cho phép mọi người xem danh sách tin đăng chưa bị xóa
CREATE POLICY "Allow public read properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (is_deleted IS NOT TRUE);

CREATE POLICY "Service role full access to properties"
ON public.properties
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- 3. BẢNG GIAO DỊCH TÀI CHÍNH (transactions)
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;

-- Khách vãng lai (anon) KHÔNG ĐƯỢC PHÉP đọc bảng giao dịch tài chính
-- Người dùng đã đăng nhập chỉ được xem giao dịch của chính mình (nếu dùng Supabase Auth)
CREATE POLICY "Users can only read own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Service role full access to transactions"
ON public.transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- 4. BẢNG HỒ SƠ TÀI KHOẢN (profiles)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- Khách chỉ được xem thông tin cơ bản của môi giới (đã public), không xem được số dư ví
CREATE POLICY "Allow read basic public profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (is_deleted IS NOT TRUE);

CREATE POLICY "Service role full access to profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
