import fs from 'fs';
import path from 'path';
import {
  isSupabaseConfigured,
  fetchFullSupabaseDb,
  syncFullDbToSupabase
} from '../lib/supabase';

const DB_FILE_PATH = path.resolve(process.cwd(), 'server-db.json');

/**
 * Đọc toàn bộ dữ liệu từ server-db.json cục bộ
 * @returns {Object} Đối tượng cơ sở dữ liệu cục bộ
 */
export function readLocalDatabase() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content || '{}');
    }
  } catch (error) {
    console.error('Lỗi khi đọc file server-db.json:', error.message);
  }
  return {};
}

/**
 * Ghi toàn bộ dữ liệu vào file server-db.json cục bộ
 * @param {Object} databasePayload Dữ liệu cần lưu
 * @returns {boolean} True nếu ghi thành công
 */
export function writeLocalDatabase(databasePayload) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(databasePayload, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn('Không thể ghi file server-db.json (môi trường serverless):', error.message);
    return false;
  }
}

const fetchWithTimeout = (promise, ms = 800) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Supabase request timed out (> ${ms}ms), fallback tức thì sang local DB`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

/**
 * Tải toàn bộ dữ liệu hệ thống (ưu tiên Supabase Cloud, fallback server-db.json)
 * @returns {Promise<Object>} Toàn bộ dữ liệu hệ thống
 */
export async function getFullSystemDatabase() {
  if (isSupabaseConfigured()) {
    try {
      const cloudData = await fetchWithTimeout(fetchFullSupabaseDb(), 800);
      if (cloudData && (cloudData.bds_properties?.length > 0 || cloudData.bds_system_config)) {
        return cloudData;
      }
    } catch (error) {
      console.warn('Lỗi kết nối hoặc timeout Supabase, chuyển ngay sang server-db.json:', error.message);
    }
  }
  return readLocalDatabase();
}

/**
 * Đồng bộ lưu một lát cắt dữ liệu (slice) vào Database (Supabase + local file)
 * @param {string} sliceKey Khóa dữ liệu (ví dụ: bds_users_list, bds_verification_tokens)
 * @param {any} sliceValue Giá trị mới cần lưu
 * @returns {Promise<boolean>} True nếu lưu thành công
 */
export async function persistDatabaseSlice(sliceKey, sliceValue) {
  const currentDb = await getFullSystemDatabase();
  const updatedDb = { ...currentDb, [sliceKey]: sliceValue };

  writeLocalDatabase(updatedDb);
  if (isSupabaseConfigured()) {
    try {
      await syncFullDbToSupabase({ [sliceKey]: sliceValue });
    } catch (error) {
      console.warn(`Lỗi sync Supabase cho key ${sliceKey}:`, error.message);
    }
  }
  return true;
}

/**
 * Lấy danh sách toàn bộ người dùng trong hệ thống
 * @returns {Promise<Array>} Danh sách user
 */
export async function getAllUsers() {
  const db = await getFullSystemDatabase();
  return Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
}

/**
 * Lưu thêm người dùng mới vào danh sách
 * @param {Object} newUser Đối tượng người dùng mới
 * @returns {Promise<Array>} Danh sách người dùng sau khi thêm
 */
export async function saveNewUser(newUser) {
  const users = await getAllUsers();
  const updatedUsers = [newUser, ...users.filter((u) => u.id !== newUser.id)];
  await persistDatabaseSlice('bds_users_list', updatedUsers);
  return updatedUsers;
}

/**
 * Cập nhật thông tin của một người dùng theo userId
 * @param {string} userId ID người dùng cần cập nhật
 * @param {Object} updates Các trường thông tin cần sửa
 * @returns {Promise<Object|null>} Người dùng sau cập nhật hoặc null nếu không tìm thấy
 */
export async function updateUserById(userId, updates) {
  const users = await getAllUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return null;

  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  await persistDatabaseSlice('bds_users_list', users);
  return updatedUser;
}

/**
 * Lấy toàn bộ danh sách token kích hoạt email
 * @returns {Promise<Array>} Danh sách token
 */
export async function getAllVerificationTokens() {
  const db = await getFullSystemDatabase();
  return Array.isArray(db.bds_verification_tokens) ? db.bds_verification_tokens : [];
}

/**
 * Lưu một token xác thực mới vào cơ sở dữ liệu
 * @param {Object} tokenRecord Bản ghi token
 * @returns {Promise<boolean>} True nếu thành công
 */
export async function saveVerificationToken(tokenRecord) {
  const tokens = await getAllVerificationTokens();
  const updatedTokens = [tokenRecord, ...tokens.filter((t) => t.token !== tokenRecord.token)];
  await persistDatabaseSlice('bds_verification_tokens', updatedTokens);
  return true;
}

/**
 * Đánh dấu token đã được kích hoạt thành công
 * @param {string} tokenString Chuỗi token
 * @returns {Promise<Object|null>} Bản ghi token sau khi đánh dấu
 */
export async function markTokenAsUsed(tokenString) {
  const tokens = await getAllVerificationTokens();
  const tokenRecord = tokens.find((t) => t.token === tokenString);
  if (!tokenRecord) return null;

  tokenRecord.used = true;
  tokenRecord.usedAt = new Date().toISOString();
  await persistDatabaseSlice('bds_verification_tokens', tokens);
  return tokenRecord;
}

/**
 * Ghi nhận thêm 1 giao dịch vào lịch sử giao dịch toàn sàn
 * @param {Object} transactionRecord Bản ghi giao dịch
 * @returns {Promise<boolean>} True nếu thành công
 */
export async function recordTransaction(transactionRecord) {
  const db = await getFullSystemDatabase();
  const txns = Array.isArray(db.bds_transactions) ? db.bds_transactions : [];
  const updatedTxns = [transactionRecord, ...txns];
  await persistDatabaseSlice('bds_transactions', updatedTxns);
  return true;
}

/**
 * Lấy toàn bộ danh sách token đặt lại mật khẩu
 * @returns {Promise<Array>} Danh sách token đặt lại mật khẩu
 */
export async function getAllPasswordResetTokens() {
  const db = await getFullSystemDatabase();
  return Array.isArray(db.bds_password_reset_tokens) ? db.bds_password_reset_tokens : [];
}

/**
 * Lưu bản ghi token đặt lại mật khẩu mới
 * @param {Object} tokenRecord Bản ghi token
 * @returns {Promise<boolean>} True nếu thành công
 */
export async function savePasswordResetToken(tokenRecord) {
  const tokens = await getAllPasswordResetTokens();
  const updatedTokens = [tokenRecord, ...tokens.filter((t) => t.token !== tokenRecord.token)];
  await persistDatabaseSlice('bds_password_reset_tokens', updatedTokens);
  return true;
}

/**
 * Tìm bản ghi token đặt lại mật khẩu
 * @param {string} tokenString Chuỗi token
 * @returns {Promise<Object|null>} Bản ghi token
 */
export async function findPasswordResetToken(tokenString) {
  const tokens = await getAllPasswordResetTokens();
  return tokens.find((t) => t.token === tokenString) || null;
}

/**
 * Đánh dấu token đặt lại mật khẩu đã sử dụng
 * @param {string} tokenString Chuỗi token
 * @returns {Promise<Object|null>} Bản ghi token sau khi đánh dấu
 */
export async function markPasswordResetTokenAsUsed(tokenString) {
  const tokens = await getAllPasswordResetTokens();
  const tokenRecord = tokens.find((t) => t.token === tokenString);
  if (!tokenRecord) return null;

  tokenRecord.used = true;
  tokenRecord.usedAt = new Date().toISOString();
  await persistDatabaseSlice('bds_password_reset_tokens', tokens);
  return tokenRecord;
}

/**
 * Lấy toàn bộ danh sách lịch hẹn xem nhà từ cơ sở dữ liệu
 * @returns {Promise<Array>} Danh sách lịch hẹn
 */
export async function getAllAppointments() {
  const db = await getFullSystemDatabase();
  return Array.isArray(db.bds_appointments) ? db.bds_appointments : [];
}

/**
 * Lưu một lịch hẹn xem nhà mới vào cơ sở dữ liệu
 * @param {Object} appointment Bản ghi lịch hẹn
 * @returns {Promise<Object>} Lịch hẹn sau khi lưu
 */
export async function saveAppointment(appointment) {
  const appointments = await getAllAppointments();
  const updated = [appointment, ...appointments.filter(a => a.id !== appointment.id)];
  await persistDatabaseSlice('bds_appointments', updated);
  return appointment;
}

/**
 * Cập nhật thông tin hoặc trạng thái lịch hẹn xem nhà
 * @param {string} appointmentId ID lịch hẹn
 * @param {Object} updates Các trường cần sửa (status, note, ...)
 * @returns {Promise<Object|null>}
 */
export async function updateAppointmentById(appointmentId, updates) {
  const appointments = await getAllAppointments();
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) return null;

  const updatedAppointment = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
  appointments[index] = updatedAppointment;
  await persistDatabaseSlice('bds_appointments', appointments);
  return updatedAppointment;
}

/**
 * Xóa một lịch hẹn xem nhà khỏi cơ sở dữ liệu
 * @param {string} appointmentId ID lịch hẹn
 * @returns {Promise<boolean>}
 */
export async function deleteAppointmentById(appointmentId) {
  const appointments = await getAllAppointments();
  const filtered = appointments.filter(a => a.id !== appointmentId);
  await persistDatabaseSlice('bds_appointments', filtered);
  return true;
}

/**
 * Lấy danh sách thông báo hệ thống (In-app notifications)
 * @returns {Promise<Array>}
 */
export async function getAllInAppNotifications() {
  const db = await getFullSystemDatabase();
  return Array.isArray(db.bds_notifications) ? db.bds_notifications : [];
}

/**
 * Lưu thông báo mới vào hệ thống
 * @param {Object} notification
 * @returns {Promise<Object>}
 */
export async function saveInAppNotification(notification) {
  const notifications = await getAllInAppNotifications();
  const updated = [notification, ...notifications.slice(0, 99)];
  await persistDatabaseSlice('bds_notifications', updated);
  return notification;
}
