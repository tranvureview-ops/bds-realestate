const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://ipkwsobnxulvfibjmwwi.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3dzb2JueHVsdmZpYmptd3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjU2NzYsImV4cCI6MjEwNzcwMTY3Nn0.TbXzQiaD2L1QI1Vl7FyK2FBQMstcM-vfFTuRVt4osGg';
const supabase = createClient(url, key);

async function cleanData() {
  console.log('=== BẮT ĐẦU QUY TRÌNH THANH LỌC BẢO MẬT DỮ LIỆU ===');

  // 1. Cập nhật .env.local để lưu SMTP_PASSWORD an toàn
  const envPath = path.resolve('.env.local');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (!envContent.includes('SMTP_PASSWORD=')) {
    envContent += '\n# Server-Side Private Credentials (KHÔNG lộ ra Client)\nSMTP_PASSWORD="yjhk hdia qswa lxxd"\n';
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✔ Đã lưu mật khẩu SMTP Gmail vào .env.local an toàn.');
  }

  // 2. Làm sạch file server-db.json cục bộ
  const dbPath = path.resolve('server-db.json');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Xóa password plain text trong bds_users_list
    if (Array.isArray(db.bds_users_list)) {
      db.bds_users_list = db.bds_users_list.map(u => {
        if (!u.passwordHash && u.password) {
          u.passwordHash = bcrypt.hashSync(u.password, 10);
        }
        delete u.password;
        return u;
      });
      console.log('✔ Đã xóa bỏ toàn bộ mật khẩu plain-text trong server-db.json');
    }

    // Xóa password trong bds_email_config
    if (db.bds_email_config && db.bds_email_config.smtp) {
      db.bds_email_config.smtp.password = '';
      console.log('✔ Đã xóa mật khẩu SMTP khỏi bds_email_config trong server-db.json');
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  }

  // 3. Làm sạch trên Supabase Cloud Database (platform_settings)
  const { data: currentSettings } = await supabase.from('platform_settings').select('key, value');
  if (currentSettings) {
    const settingsMap = {};
    currentSettings.forEach(s => { settingsMap[s.key] = s.value; });

    // Cập nhật bds_users_list trên Supabase
    if (Array.isArray(settingsMap['bds_users_list'])) {
      const cleanedUsers = settingsMap['bds_users_list'].map(u => {
        if (!u.passwordHash && u.password) {
          u.passwordHash = bcrypt.hashSync(u.password, 10);
        }
        delete u.password;
        return u;
      });
      const { error: err1 } = await supabase.from('platform_settings').upsert({
        key: 'bds_users_list',
        value: cleanedUsers,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      if (err1) console.error('Lỗi cập nhật users trên Supabase:', err1.message);
      else console.log('✔ Đã cập nhật bds_users_list trên Supabase: KHÔNG CÒN MẬT KHẨU PLAIN-TEXT!');
    }

    // Cập nhật bds_email_config trên Supabase
    if (settingsMap['bds_email_config'] && settingsMap['bds_email_config'].smtp) {
      const cleanedEmailConfig = { ...settingsMap['bds_email_config'] };
      cleanedEmailConfig.smtp = { ...cleanedEmailConfig.smtp, password: '' };
      const { error: err2 } = await supabase.from('platform_settings').upsert({
        key: 'bds_email_config',
        value: cleanedEmailConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
      if (err2) console.error('Lỗi cập nhật email config trên Supabase:', err2.message);
      else console.log('✔ Đã xóa mật khẩu SMTP trong bds_email_config trên Supabase Cloud!');
    }
  }

  console.log('=== HOÀN TẤT BƯỚC 1: THANH LỌC DỮ LIỆU NHẠY CẢM ===');
}

cleanData();
