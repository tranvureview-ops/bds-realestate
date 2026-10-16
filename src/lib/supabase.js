import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Kiểm tra xem người dùng đã điền đúng thông tin Supabase chưa
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your-project')
  );
};

// Khởi tạo Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 1. DỊCH VỤ BẤT ĐỘNG SẢN (PROPERTIES CRUD)
// ==========================================

/**
 * Lấy danh sách bất động sản từ Supabase Cloud
 */
export async function fetchSupabaseProperties() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.warn('Lỗi khi tải properties từ Supabase:', error.message);
      return null;
    }

    if (!Array.isArray(data)) return null;

    // Chuyển đổi dữ liệu từ Supabase về đúng chuẩn object của ứng dụng
    return data.map(row => {
      if (row.raw_data && typeof row.raw_data === 'object') {
        return {
          ...row.raw_data,
          id: row.id,
          title: row.title || row.raw_data.title,
          price: Number(row.price) || row.raw_data.price,
          status: row.status || row.raw_data.status,
          vipPackageId: row.vip_package_id || row.raw_data.vipPackageId,
          expiresAt: row.expires_at || row.raw_data.expiresAt,
          publishedAt: row.published_at || row.raw_data.publishedAt,
          isDeleted: Boolean(row.is_deleted)
        };
      }
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        demand: row.demand,
        propertyType: row.property_type,
        propertyTypeName: row.property_type_name,
        price: Number(row.price),
        priceDisplay: row.price_display,
        pricePerM2: row.price_per_m2,
        area: Number(row.area),
        bedroom: Number(row.bedroom),
        bathroom: Number(row.bathroom),
        floor: row.floor,
        direction: row.direction,
        legal: row.legal,
        furniture: row.furniture,
        address: row.address,
        city: row.city,
        district: row.district,
        ward: row.ward,
        street: row.street,
        project: row.project,
        lat: row.lat,
        lng: row.lng,
        description: row.description,
        images: row.images || [],
        videoUrl: row.video_url,
        hasVR360: row.has_vr360,
        vrScenes: row.vr_scenes || [],
        amenities: row.amenities || [],
        nearbyFacilities: row.nearby_facilities || [],
        author: row.author,
        vipPackageId: row.vip_package_id,
        status: row.status,
        expiresAt: row.expires_at,
        publishedAt: row.published_at,
        viewsCount: Number(row.views_count || 0),
        callsCount: Number(row.calls_count || 0),
        isFeatured: row.is_featured,
        autoRenew: row.auto_renew,
        isDeleted: row.is_deleted
      };
    });
  } catch (err) {
    console.error('Lỗi kết nối Supabase:', err);
    return null;
  }
}

/**
 * Thêm mới hoặc cập nhật bài viết BĐS lên Supabase Cloud
 */
export async function upsertSupabaseProperty(prop) {
  if (!isSupabaseConfigured() || !supabase || !prop?.id) return false;
  try {
    const payload = {
      id: prop.id,
      title: prop.title,
      slug: prop.slug || prop.id.toLowerCase(),
      demand: prop.demand || 'sale',
      property_type: prop.propertyType || 'apartment',
      property_type_name: prop.propertyTypeName || '',
      price: Number(prop.price) || 0,
      price_display: prop.priceDisplay || '',
      price_per_m2: prop.pricePerM2 || '',
      area: Number(prop.area) || 0,
      bedroom: Number(prop.bedroom) || 0,
      bathroom: Number(prop.bathroom) || 0,
      floor: prop.floor ? Number(prop.floor) : null,
      direction: prop.direction || '',
      legal: prop.legal || '',
      furniture: prop.furniture || '',
      address: prop.address || '',
      city: prop.city || '',
      district: prop.district || '',
      ward: prop.ward || '',
      street: prop.street || '',
      project: prop.project || '',
      lat: prop.lat ? Number(prop.lat) : null,
      lng: prop.lng ? Number(prop.lng) : null,
      description: prop.description || '',
      images: prop.images || [],
      video_url: prop.videoUrl || '',
      has_vr360: Boolean(prop.hasVR360),
      vr_scenes: prop.vrScenes || [],
      amenities: prop.amenities || [],
      nearby_facilities: prop.nearbyFacilities || [],
      author: prop.author || null,
      vip_package_id: prop.vipPackageId || 'vip-normal',
      status: prop.status || 'active',
      expires_at: prop.expiresAt || null,
      published_at: prop.publishedAt || new Date().toISOString(),
      views_count: Number(prop.viewsCount || 0),
      calls_count: Number(prop.callsCount || 0),
      is_featured: Boolean(prop.isFeatured),
      auto_renew: Boolean(prop.autoRenew),
      is_deleted: Boolean(prop.isDeleted),
      raw_data: prop,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('properties')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Lỗi upsert property lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi khi ghi property lên Supabase:', err);
    return false;
  }
}

/**
 * Xóa vĩnh viễn hoặc đưa vào thùng rác trên Supabase
 */
export async function deleteSupabaseProperty(propertyId, softDelete = true) {
  if (!isSupabaseConfigured() || !supabase || !propertyId) return false;
  try {
    if (softDelete) {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'trash', is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', propertyId);
      return !error;
    } else {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      return !error;
    }
  } catch (err) {
    console.error('Lỗi xóa property trên Supabase:', err);
    return false;
  }
}

// ==========================================
// 2. DỊCH VỤ CẤU HÌNH TOÀN SÀN (SETTINGS)
// ==========================================

export async function fetchSupabaseSetting(key) {
  if (!isSupabaseConfigured() || !supabase || !key) return null;
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value;
  } catch (err) {
    return null;
  }
}

export async function upsertSupabaseSetting(key, value) {
  if (!isSupabaseConfigured() || !supabase || !key) return false;
  try {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteSupabaseSetting(key) {
  if (!isSupabaseConfigured() || !supabase || !key) return false;
  try {
    const { error } = await supabase
      .from('platform_settings')
      .delete()
      .eq('key', key);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// 3. DỊCH VỤ NGƯỜI DÙNG & TÀI KHOẢN (PROFILES)
// ==========================================

export async function fetchSupabaseProfiles() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error || !Array.isArray(data)) return null;
    return data
      .filter(r => r.status !== 'deleted' && r.role_name !== 'deleted' && r.name !== '[Đã xóa]')
      .map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        roleName: r.role_name,
        walletBalance: Number(r.wallet_balance || 0),
        bonusWalletBalance: Number(r.bonus_wallet_balance || 0),
        phone: r.phone,
        avatar: r.avatar,
        membership: r.membership,
        vouchers: r.vouchers,
        isVerified: Boolean(r.is_verified),
        status: r.status || 'active',
        isDeleted: Boolean(r.is_deleted),
        deletedAt: r.deleted_at || null,
        createdAt: r.created_at || new Date().toISOString()
      }));
  } catch (err) {
    return null;
  }
}

export async function upsertSupabaseProfile(user) {
  if (!isSupabaseConfigured() || !supabase || !user?.id) return false;
  try {
    const fullPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      role_name: user.roleName,
      wallet_balance: Number(user.walletBalance || 0),
      phone: user.phone,
      avatar: user.avatar,
      membership: user.membership,
      vouchers: user.vouchers,
      is_verified: Boolean(user.isVerified),
      status: user.status || 'active',
      is_deleted: Boolean(user.isDeleted),
      deleted_at: user.deletedAt || null
    };

    let { error } = await supabase
      .from('profiles')
      .upsert(fullPayload, { onConflict: 'id' });

    // Nếu bảng profiles chưa có các cột status / is_deleted, thử lại bằng payload cơ bản
    if (error && error.code === 'PGRST204') {
      const { status, is_deleted, deleted_at, ...basePayload } = fullPayload;
      const res = await supabase.from('profiles').upsert(basePayload, { onConflict: 'id' });
      error = res.error;
    }

    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteSupabaseProfile(userId) {
  if (!userId) return false;
  try {
    // 1. Nếu đang ở trình duyệt, gọi API route máy chủ để hỗ trợ service_role key xóa vật lý triệt để
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/admin/users/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (apiErr) {
        // Tiếp tục fallback client
      }
    }

    if (isSupabaseConfigured() && supabase) {
      // 2. Thử xóa vật lý từ bảng profiles
      const { data: delData } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select();

      // Chỉ khi RLS chặn xóa vật lý (delData rỗng) thì mới tạm đánh dấu role_name = 'deleted'
      if (!delData || delData.length === 0) {
        await supabase
          .from('profiles')
          .update({
            role_name: 'deleted',
            name: '[Đã xóa]',
            wallet_balance: 0
          })
          .eq('id', userId);
      }

      // 3. Xóa người dùng khỏi platform_settings.bds_users_list ngay lập tức
      try {
        const { data: settingRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'bds_users_list')
          .single();

        if (settingRow?.value && Array.isArray(settingRow.value)) {
          const cleaned = settingRow.value.filter(u => u.id !== userId);
          await supabase
            .from('platform_settings')
            .upsert({ key: 'bds_users_list', value: cleaned, updated_at: new Date().toISOString() });
        }
      } catch (setErr) {
        // bỏ qua lỗi settings
      }
    }

    return true;
  } catch (err) {
    console.error('Lỗi khi deleteSupabaseProfile:', err);
    return false;
  }
}

// ==========================================
// 4. DỊCH VỤ LỊCH SỬ GIAO DỊCH (TRANSACTIONS)
// ==========================================

export async function fetchSupabaseTransactions() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return null;
    return data.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      type: r.type,
      title: r.title,
      amount: Number(r.amount || 0),
      balanceAfter: Number(r.balance_after || 0),
      status: r.status,
      createdAt: r.created_at,
      paymentMethod: r.payment_method
    }));
  } catch (err) {
    return null;
  }
}

export async function insertSupabaseTransaction(txn) {
  if (!isSupabaseConfigured() || !supabase || !txn?.id) return false;
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        id: txn.id,
        user_id: txn.userId,
        user_name: txn.userName,
        type: txn.type,
        title: txn.title,
        amount: Number(txn.amount || 0),
        balance_after: Number(txn.balanceAfter || 0),
        status: txn.status || 'success',
        payment_method: txn.paymentMethod || 'Ví tài khoản',
        created_at: txn.createdAt || new Date().toISOString()
      });

    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// 5. ĐỒNG BỘ TOÀN BỘ CƠ SỞ DỮ LIỆU (FULL DB SYNC)
// ==========================================

export function mergeProfilesWithSettingsUsers(profiles, settingsUsers) {
  // 1. Nếu profiles là null (lỗi kết nối PostgREST), dùng tạm settingsUsers
  if (!profiles && Array.isArray(settingsUsers)) {
    return settingsUsers.filter(u => u.status !== 'deleted' && u.roleName !== 'deleted' && u.name !== '[Đã xóa]');
  }

  const map = new Map();
  const profilesList = Array.isArray(profiles) ? profiles : [];

  // Nạp toàn bộ profiles hợp lệ (bỏ qua người dùng đã đánh dấu xóa)
  profilesList.forEach(p => {
    if (p.status === 'deleted' || p.role_name === 'deleted' || p.roleName === 'deleted' || p.name === '[Đã xóa]') {
      return;
    }
    const rawWallet = p.walletBalance !== undefined ? p.walletBalance : p.wallet_balance;
    const rawBonus = p.bonusWalletBalance !== undefined ? p.bonusWalletBalance : (p.bonus_wallet_balance || p.promoBalance);
    const rawRoleName = p.roleName || p.role_name;
    const rawVerified = p.isVerified !== undefined ? p.isVerified : p.is_verified;
    const rawDeleted = p.isDeleted !== undefined ? p.isDeleted : p.is_deleted;
    const rawDeletedAt = p.deletedAt || p.deleted_at;
    const rawCreatedAt = p.createdAt || p.created_at;

    map.set(p.id, {
      id: p.id,
      name: p.name || 'Người dùng',
      email: p.email || '',
      phone: p.phone || '',
      role: p.role || 'user',
      roleName: rawRoleName || (p.role === 'admin' ? 'Quản Trị Viên' : p.role === 'broker' ? 'Môi Giới' : 'Khách Hàng'),
      avatar: p.avatar || '',
      walletBalance: Number(rawWallet !== undefined ? rawWallet : 0),
      bonusWalletBalance: Number(rawBonus !== undefined ? rawBonus : 0),
      isVerified: Boolean(rawVerified),
      status: p.status || 'active',
      isDeleted: Boolean(rawDeleted),
      deletedAt: rawDeletedAt || null,
      createdAt: rawCreatedAt || new Date().toISOString()
    });
  });

  // Hợp nhất dữ liệu chi tiết từ platform_settings (chỉ hợp nhất với những user đang tồn tại trong bảng profiles!)
  // Nếu profiles đang có dữ liệu, bảng profiles là chân lý (Single Source of Truth).
  // Tuyệt đối không hồi sinh user đã bị xóa khỏi profiles!
  if (map.size > 0 && Array.isArray(settingsUsers)) {
    settingsUsers.forEach(u => {
      if (u && u.id && map.has(u.id)) {
        const prev = map.get(u.id);
        map.set(u.id, {
          ...prev,
          ...u,
          id: prev.id,
          name: prev.name && prev.name !== 'Người dùng' ? prev.name : (u.name || prev.name),
          email: prev.email || u.email || '',
          walletBalance: Number(u.walletBalance !== undefined ? u.walletBalance : prev.walletBalance),
          bonusWalletBalance: Number(u.bonusWalletBalance !== undefined ? u.bonusWalletBalance : prev.bonusWalletBalance),
          roleName: u.roleName || prev.roleName,
          status: u.status || prev.status || 'active',
          isDeleted: Boolean(u.isDeleted !== undefined ? u.isDeleted : prev.isDeleted),
          deletedAt: u.deletedAt || prev.deletedAt || null
        });
      }
    });
  } else if (map.size === 0 && Array.isArray(settingsUsers)) {
    // Trường hợp hệ thống mới khởi tạo hoặc bảng profiles chưa có bản ghi nào
    settingsUsers.forEach(u => {
      if (u && u.id && u.status !== 'deleted' && u.roleName !== 'deleted' && u.name !== '[Đã xóa]') {
        map.set(u.id, u);
      }
    });
  }

  return Array.from(map.values());
}

/**
 * Tải toàn bộ dữ liệu hệ thống từ Supabase Cloud để đồng bộ SSR và Client
 */
export async function fetchFullSupabaseDb() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const [props, settingsRes, profiles, txns] = await Promise.all([
      fetchSupabaseProperties(),
      supabase.from('platform_settings').select('key, value'),
      fetchSupabaseProfiles(),
      fetchSupabaseTransactions()
    ]);

    const settingsMap = {};
    if (settingsRes && Array.isArray(settingsRes.data)) {
      settingsRes.data.forEach(row => {
        if (row.key && row.value !== undefined) {
          settingsMap[row.key] = row.value;
        }
      });
    }

    // Nếu cả properties và platform_settings đều rỗng, có thể bảng chưa được tạo hoặc chưa có dữ liệu
    if (!props && Object.keys(settingsMap).length === 0) {
      return null;
    }

    const mergedUsers = mergeProfilesWithSettingsUsers(profiles, settingsMap['bds_users_list']);

    return {
      bds_properties: props && props.length > 0 ? props : undefined,
      bds_users_list: mergedUsers.length > 0 ? mergedUsers : undefined,
      bds_transactions: txns && txns.length > 0 ? txns : undefined,
      bds_header_config: settingsMap['bds_header_config'] || undefined,
      bds_system_config: settingsMap['bds_system_config'] || undefined,
      bds_payment_config: settingsMap['bds_payment_config'] || undefined,
      bds_nav_menu: settingsMap['bds_nav_menu'] || undefined,
      bds_vip_packages: settingsMap['bds_vip_packages'] || undefined,
      bds_membership_packages: settingsMap['bds_membership_packages'] || undefined,
      bds_single_config: settingsMap['bds_single_config'] || undefined,
      bds_email_config: settingsMap['bds_email_config'] || undefined,
      bds_reported_listings: settingsMap['bds_reported_listings'] || undefined,
      bds_email_logs: settingsMap['bds_email_logs'] || undefined,
      bds_verification_tokens: settingsMap['bds_verification_tokens'] || undefined,
    };
  } catch (err) {
    console.error('Lỗi khi fetchFullSupabaseDb:', err);
    return null;
  }
}

/**
 * Đồng bộ toàn bộ dữ liệu từ ứng dụng lên Supabase Cloud
 */
export async function syncFullDbToSupabase(payload) {
  if (!isSupabaseConfigured() || !supabase || !payload) return false;
  try {
    const promises = [];

    // 1. Đồng bộ cấu hình sàn (platform_settings)
    const settingsKeys = [
      'bds_header_config',
      'bds_system_config',
      'bds_payment_config',
      'bds_nav_menu',
      'bds_vip_packages',
      'bds_membership_packages',
      'bds_single_config',
      'bds_email_config',
      'bds_reported_listings',
      'bds_email_logs',
      'bds_verification_tokens',
      'bds_users_list'
    ];

    const settingsToUpsert = [];
    for (const key of settingsKeys) {
      if (payload[key] !== undefined) {
        settingsToUpsert.push({
          key,
          value: payload[key],
          updated_at: new Date().toISOString()
        });
      }
    }

    if (settingsToUpsert.length > 0) {
      promises.push(
        supabase.from('platform_settings').upsert(settingsToUpsert, { onConflict: 'key' })
      );
    }

    // 2. Đồng bộ danh sách tin BĐS (properties)
    if (Array.isArray(payload.bds_properties) && payload.bds_properties.length > 0) {
      const propPayloads = payload.bds_properties.map(prop => ({
        id: prop.id,
        title: prop.title || '',
        slug: prop.slug || prop.id?.toLowerCase() || '',
        demand: prop.demand || 'sale',
        property_type: prop.propertyType || 'apartment',
        property_type_name: prop.propertyTypeName || '',
        price: Number(prop.price) || 0,
        price_display: prop.priceDisplay || '',
        price_per_m2: prop.pricePerM2 || '',
        area: Number(prop.area) || 0,
        bedroom: Number(prop.bedroom) || 0,
        bathroom: Number(prop.bathroom) || 0,
        floor: prop.floor ? Number(prop.floor) : null,
        direction: prop.direction || '',
        legal: prop.legal || '',
        furniture: prop.furniture || '',
        address: prop.address || '',
        city: prop.city || '',
        district: prop.district || '',
        ward: prop.ward || '',
        street: prop.street || '',
        project: prop.project || '',
        lat: prop.lat ? Number(prop.lat) : null,
        lng: prop.lng ? Number(prop.lng) : null,
        description: prop.description || '',
        images: prop.images || [],
        video_url: prop.videoUrl || '',
        has_vr360: Boolean(prop.hasVR360),
        vr_scenes: prop.vrScenes || [],
        amenities: prop.amenities || [],
        nearby_facilities: prop.nearbyFacilities || [],
        author: prop.author || null,
        vip_package_id: prop.vipPackageId || 'vip-normal',
        status: prop.status || 'active',
        expires_at: prop.expiresAt || null,
        published_at: prop.publishedAt || new Date().toISOString(),
        views_count: Number(prop.viewsCount || 0),
        calls_count: Number(prop.callsCount || 0),
        is_featured: Boolean(prop.isFeatured),
        auto_renew: Boolean(prop.autoRenew),
        is_deleted: Boolean(prop.isDeleted),
        raw_data: prop,
        updated_at: new Date().toISOString()
      }));

      promises.push(
        supabase.from('properties').upsert(propPayloads, { onConflict: 'id' })
      );
    }

    // 3. Đồng bộ giao dịch (transactions)
    if (Array.isArray(payload.bds_transactions) && payload.bds_transactions.length > 0) {
      const txnPayloads = payload.bds_transactions.map(txn => ({
        id: txn.id,
        user_id: txn.userId || '',
        user_name: txn.userName || '',
        type: txn.type || '',
        title: txn.title || '',
        amount: Number(txn.amount || 0),
        balance_after: Number(txn.balanceAfter || 0),
        status: txn.status || 'success',
        payment_method: txn.paymentMethod || 'Ví tài khoản',
        created_at: txn.createdAt || new Date().toISOString()
      }));

      promises.push(
        supabase.from('transactions').upsert(txnPayloads, { onConflict: 'id' })
      );
    }

    // 4. Đồng bộ danh sách người dùng (profiles)
    if (Array.isArray(payload.bds_users_list) && payload.bds_users_list.length > 0) {
      const profilePayloads = payload.bds_users_list
        .filter(u => u && u.id && u.status !== 'deleted' && u.roleName !== 'deleted' && u.name !== '[Đã xóa]')
        .map(u => ({
          id: u.id,
          name: u.name || '',
          email: u.email || '',
          role: u.role || 'user',
          role_name: u.roleName || '',
          wallet_balance: Number(u.walletBalance || 0),
          phone: u.phone || '',
          avatar: u.avatar || '',
          membership: u.membership || null,
          vouchers: u.vouchers || null,
          is_verified: Boolean(u.isVerified)
        }));

      if (profilePayloads.length > 0) {
        promises.push(
          supabase.from('profiles').upsert(profilePayloads, { onConflict: 'id' })
        );
      }
    }

    await Promise.allSettled(promises);
    return true;
  } catch (err) {
    console.error('Lỗi khi syncFullDbToSupabase:', err);
    return false;
  }
}

