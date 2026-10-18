import { getFullSystemDatabase, persistDatabaseSlice } from './serverDbService';
import { deliverEmailViaSmtp, createMailTransporter, appendEmailLog } from './mailerService';
import { normalizePhone } from '../utils/authValidation';

/**
 * Tạo nội dung HTML chuyên nghiệp cho email thông báo lịch hẹn xem nhà
 * @param {Object} params
 * @returns {string} HTML string
 */
export function generateAppointmentEmailHtml({ appointment, broker, property, emailConfig }) {
  const brandName = emailConfig?.companyName || emailConfig?.fromName || 'Đất Biển Đà Nẵng';
  const hotline = emailConfig?.hotline || '0898 246 607';
  const logoUrl = emailConfig?.companyLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80';
  const customerPhone = appointment.customerPhone || '';
  const customerName = appointment.customerName || 'Khách hàng quan tâm';
  const appointmentDate = appointment.appointmentDate || 'Thời gian theo thỏa thuận';
  const propertyTitle = appointment.propertyTitle || 'Bất động sản';
  const propertyPrice = appointment.propertyPrice || 'Thỏa thuận';
  const propertyAddress = appointment.propertyAddress || '';
  const propertyUrl = appointment.propertyPermalink ? (appointment.propertyPermalink.startsWith('http') ? appointment.propertyPermalink : `https://datbiendanang.vn${appointment.propertyPermalink}`) : 'https://datbiendanang.vn';
  const zaloChatUrl = `https://zalo.me/${normalizePhone(customerPhone)}`;
  const callUrl = `tel:${customerPhone}`;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông Báo: Khách Hẹn Xem Nhà Trực Tiếp</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 6px;">
                ${brandName} • THÔNG BÁO LỊCH HẸN
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                🗓️ Có Khách Hẹn Xem Nhà Trực Tiếp
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #d1fae5;">
                Vui lòng liên hệ xác nhận với khách hàng trong thời gian sớm nhất
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 24px 16px;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                Xin chào <strong>${broker?.name || 'Đối Tác Môi Giới'}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #334155;">
                Hệ thống <strong>${brandName}</strong> vừa tiếp nhận một yêu cầu đặt lịch hẹn xem nhà trực tiếp từ khách hàng quan tâm đến bất động sản của bạn:
              </p>

              <!-- Property Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 4px;">
                  BẤT ĐỘNG SẢN QUAN TÂM
                </div>
                <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                  ${propertyTitle}
                </div>
                <div style="font-size: 13px; color: #dc2626; font-weight: 700; margin-bottom: 4px;">
                  💰 Giá niêm yết: ${propertyPrice}
                </div>
                ${propertyAddress ? `<div style="font-size: 12px; color: #64748b;">📍 Địa chỉ: ${propertyAddress}</div>` : ''}
              </div>

              <!-- Customer Info Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 8px;">
                      THÔNG TIN KHÁCH HÀNG & LỊCH HẸN
                    </div>
                    <table width="100%" style="font-size: 13px; color: #1e293b; line-height: 1.8;">
                      <tr>
                        <td width="140" style="color: #475569; font-weight: 600;">👤 Khách hàng:</td>
                        <td style="font-weight: 700;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="color: #475569; font-weight: 600;">📞 Số điện thoại:</td>
                        <td>
                          <a href="${callUrl}" style="color: #059669; font-weight: 800; font-size: 15px; text-decoration: none;">
                            ${customerPhone}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #475569; font-weight: 600;">⏰ Thời gian hẹn:</td>
                        <td style="font-weight: 700; color: #0f172a;">${appointmentDate}</td>
                      </tr>
                      ${appointment.customerNote ? `
                      <tr>
                        <td style="color: #475569; font-weight: 600; vertical-align: top;">📝 Lời nhắn:</td>
                        <td style="font-style: italic; color: #334155;">"${appointment.customerNote}"</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <a href="${callUrl}" style="display: block; width: 100%; max-width: 280px; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 20px; font-size: 14px; font-weight: 700; border-radius: 10px; text-align: center; box-shadow: 0 2px 6px rgba(220,38,38,0.3);">
                      📞 Gọi Ngay: ${customerPhone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${zaloChatUrl}" style="display: block; width: 100%; max-width: 280px; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; font-size: 14px; font-weight: 700; border-radius: 10px; text-align: center; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">
                      💬 Chat Trực Tiếp Qua Zalo
                    </a>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-bottom: 12px;">
                <a href="${propertyUrl}" style="font-size: 12px; color: #64748b; text-decoration: underline;">
                  Xem lại tin đăng bất động sản này trên website
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px;">
                Bạn nhận được email này vì đang bật tùy chọn <strong>"Thông báo có khách gửi yêu cầu hẹn xem nhà"</strong> trong Hồ sơ cá nhân.
              </p>
              <p style="margin: 0; color: #94a3b8;">
                ${brandName} • Hotline/Zalo Hỗ Trợ: ${hotline}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Điều phối thông báo đa kênh cho lịch hẹn xem nhà mới
 * Gửi theo cấu hình bật/tắt của người dùng (Email, Zalo, SMS, In-App Notification)
 * @param {Object} params
 * @param {Object} params.appointment Bản ghi lịch hẹn
 * @param {string} [params.origin] Origin URL của server
 * @returns {Promise<Object>} Kết quả điều phối từng kênh
 */
export async function dispatchAppointmentNotifications({ appointment, origin = 'https://datbiendanang.vn' }) {
  const db = await getFullSystemDatabase();
  const users = Array.isArray(db.bds_users_list) ? db.bds_users_list : [];
  const emailConfig = db.bds_email_config || null;

  // 1. Tìm thông tin người nhận (môi giới / chủ tin đăng)
  const broker = users.find(u => 
    (appointment.brokerId && String(u.id) === String(appointment.brokerId)) ||
    (appointment.brokerEmail && u.email && u.email.toLowerCase() === appointment.brokerEmail.toLowerCase()) ||
    (appointment.brokerPhone && normalizePhone(u.phone) === normalizePhone(appointment.brokerPhone))
  ) || {
    id: appointment.brokerId || 'broker-default',
    name: appointment.brokerName || 'Môi Giới Phụ Trách',
    email: appointment.brokerEmail || '',
    phone: appointment.brokerPhone || '',
    notificationSettings: {
      emailAppointment: true,
      zaloAppointment: true,
      smsAppointment: true,
      inAppAppointment: true
    }
  };

  const settings = broker.notificationSettings || {
    emailAppointment: true,
    zaloAppointment: true,
    smsAppointment: true,
    inAppAppointment: true
  };

  const results = {
    email: { enabled: settings.emailAppointment !== false, sent: false, error: null },
    zalo: { enabled: settings.zaloAppointment !== false, logged: false, link: null },
    sms: { enabled: settings.smsAppointment !== false, logged: false, message: null },
    inApp: { enabled: settings.inAppAppointment !== false, saved: false }
  };

  // 2. KÊNH EMAIL: Gửi email nếu môi giới có bật và có địa chỉ email
  const targetEmail = broker.email || appointment.brokerEmail;
  if (results.email.enabled && targetEmail) {
    try {
      const transporter = createMailTransporter(emailConfig?.smtp);
      const subject = `[Lịch Hẹn Mới] Khách hẹn xem BĐS: ${appointment.propertyTitle?.slice(0, 50)}...`;
      const htmlBody = generateAppointmentEmailHtml({
        appointment,
        broker,
        property: { title: appointment.propertyTitle, price: appointment.propertyPrice },
        emailConfig
      });

      const delivery = await deliverEmailViaSmtp(transporter, emailConfig, targetEmail, subject, htmlBody);
      results.email.sent = Boolean(delivery.delivered);
      results.email.error = delivery.error || null;

      // Lưu log email
      await appendEmailLog({
        id: `LOG-MAIL-APPT-${Date.now()}`,
        to: targetEmail,
        type: 'appointment_alert',
        subject,
        status: delivery.delivered ? 'sent' : (delivery.error ? 'failed' : 'simulated'),
        error: delivery.error || null,
        metadata: {
          appointmentId: appointment.id,
          propertyId: appointment.propertyId,
          customerPhone: appointment.customerPhone
        },
        sentAt: new Date().toISOString()
      });
    } catch (err) {
      results.email.error = err.message;
      console.warn('Lỗi khi gửi email thông báo lịch hẹn:', err.message);
    }
  }

  // 3. KÊNH ZALO: Tạo liên kết trò chuyện Zalo trực tiếp và lưu vết
  if (results.zalo.enabled && appointment.customerPhone) {
    try {
      const normalizedCustomerPhone = normalizePhone(appointment.customerPhone);
      const zaloLink = `https://zalo.me/${normalizedCustomerPhone}`;
      const zaloMessage = `Chào bạn, tôi là ${broker.name} phụ trách bài đăng "${appointment.propertyTitle}". Tôi nhận được lịch hẹn xem nhà vào ${appointment.appointmentDate}. Tôi nhắn tin để xác nhận thời gian với bạn nhé.`;

      const zaloLogs = Array.isArray(db.bds_zalo_logs) ? db.bds_zalo_logs : [];
      const updatedZaloLogs = [
        {
          id: `LOG-ZALO-${Date.now()}`,
          appointmentId: appointment.id,
          brokerId: broker.id,
          brokerPhone: broker.phone,
          customerPhone: appointment.customerPhone,
          zaloLink,
          suggestedMessage: zaloMessage,
          status: 'ready_to_chat',
          createdAt: new Date().toISOString()
        },
        ...zaloLogs.slice(0, 99)
      ];
      await persistDatabaseSlice('bds_zalo_logs', updatedZaloLogs);

      results.zalo.logged = true;
      results.zalo.link = zaloLink;
      results.zalo.suggestedMessage = zaloMessage;
    } catch (err) {
      console.warn('Lỗi xử lý kênh Zalo:', err.message);
    }
  }

  // 4. KÊNH SMS: Chuẩn bị nội dung tin nhắn và lưu vào hàng đợi/log SMS
  if (results.sms.enabled && (broker.phone || appointment.brokerPhone)) {
    try {
      const brokerPhone = broker.phone || appointment.brokerPhone;
      const smsContent = `[DatBienDaNang] Quy khach co lich hen xem BDS "${(appointment.propertyTitle || '').slice(0, 35)}..." vao "${appointment.appointmentDate}" tu SDT ${appointment.customerPhone}. Vui long lien he xac nhan.`;

      const smsLogs = Array.isArray(db.bds_sms_logs) ? db.bds_sms_logs : [];
      const updatedSmsLogs = [
        {
          id: `LOG-SMS-${Date.now()}`,
          appointmentId: appointment.id,
          recipientPhone: brokerPhone,
          customerPhone: appointment.customerPhone,
          content: smsContent,
          status: 'queued_simulation', // Sẵn sàng kết nối Brandname SMS Gateway
          createdAt: new Date().toISOString()
        },
        ...smsLogs.slice(0, 99)
      ];
      await persistDatabaseSlice('bds_sms_logs', updatedSmsLogs);

      results.sms.logged = true;
      results.sms.message = smsContent;
    } catch (err) {
      console.warn('Lỗi xử lý kênh SMS:', err.message);
    }
  }

  // 5. KÊNH IN-APP NOTIFICATION: Tạo thông báo chuông hiển thị trên website
  if (results.inApp.enabled && broker.id) {
    try {
      const inAppNotifications = Array.isArray(db.bds_notifications) ? db.bds_notifications : [];
      const newNotif = {
        id: `NOTIF-${Date.now()}`,
        userId: broker.id,
        type: 'appointment_new',
        title: '🗓️ Có khách hẹn xem nhà trực tiếp',
        content: `Khách hàng SĐT ${appointment.customerPhone} vừa đặt lịch hẹn xem BĐS: "${(appointment.propertyTitle || '').slice(0, 50)}..." vào ${appointment.appointmentDate}.`,
        link: '/ho-so-ca-nhan?tab=appointments',
        appointmentId: appointment.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await persistDatabaseSlice('bds_notifications', [newNotif, ...inAppNotifications.slice(0, 99)]);
      results.inApp.saved = true;
    } catch (err) {
      console.warn('Lỗi lưu in-app notification:', err.message);
    }
  }

  return results;
}
