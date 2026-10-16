/**
 * emailService.js - Hệ Thống Gửi Email & Xử Lý Thông Báo Sàn Đất Biển Đà Nẵng
 * Hỗ trợ tạo mẫu HTML Email chuyên nghiệp, mô phỏng gửi email thực tế,
 * lưu trữ Outbox vào localStorage và cung cấp API xem trước (Preview).
 */

const STORAGE_KEY_EMAIL_LOGS = 'bds_email_logs';

/**
 * Danh mục lý do vi phạm tiếng Việt chuẩn hóa
 */
export const REPORT_REASONS = {
  address_wrong: {
    label: 'Địa chỉ không có thật hoặc sai vị trí',
    severity: 'high',
    color: 'rose'
  },
  price_wrong: {
    label: 'Giá không đúng thực tế (kê giá, giá ảo, câu view)',
    severity: 'high',
    color: 'amber'
  },
  already_sold: {
    label: 'Bất động sản đã bán hoặc đã cho thuê',
    severity: 'medium',
    color: 'blue'
  },
  fake_images: {
    label: 'Hình ảnh không đúng thực tế, ảnh cắt ghép giả mạo',
    severity: 'high',
    color: 'purple'
  },
  duplicate: {
    label: 'Tin đăng trùng lặp nhiều lần gây nhiễu sàn',
    severity: 'low',
    color: 'indigo'
  },
  unreachable: {
    label: 'Không liên hệ được với người đăng (SĐT ảo/thuê bao)',
    severity: 'medium',
    color: 'slate'
  },
  other: {
    label: 'Dấu hiệu lừa đảo, tranh chấp pháp lý hoặc nội dung xấu',
    severity: 'critical',
    color: 'red'
  }
};

/**
 * Khởi tạo dữ liệu Email Logs ban đầu nếu chưa có
 */
export const getEmailLogs = () => {
  if (typeof window === 'undefined') return [];

  // Đọc cấu hình email người dùng nếu đã cấu hình
  let savedConfig = null;
  try {
    const rawConfig = localStorage.getItem('bds_email_config');
    if (rawConfig) savedConfig = JSON.parse(rawConfig);
  } catch (e) {}

  const activeFrom = savedConfig?.fromEmail || 'cskh@datbiendanang.vn';
  const activeFromName = savedConfig?.fromName || 'Đất Biển Đà Nẵng CSKH';

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Nếu người dùng đã cài đặt fromEmail tùy chỉnh, tự động cập nhật các thư có email mặc định cũ
      if (savedConfig?.fromEmail) {
        return parsed.map(m => {
          if (m.from === 'cskh@landmark.vn' || m.from === 'kiemduyet@landmark.vn' || m.from === 'cskh@datbiendanang.vn' || m.from === 'kiemduyet@datbiendanang.vn') {
            return {
              ...m,
              from: savedConfig.fromEmail,
              fromName: savedConfig.fromName || m.fromName
            };
          }
          return m;
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error('Lỗi đọc email logs:', err);
  }

  // Seed sample emails ban đầu
  const initialLogs = [
    {
      id: 'MAIL-1729012301001',
      to: 'ban-kiem-duyet@datbiendanang.vn',
      toName: 'Ban Kiểm Duyệt Sàn Đất Biển Đà Nẵng',
      from: 'system-alerts@datbiendanang.vn',
      fromName: 'Hệ Thống Kiểm Duyệt Tự Động',
      type: 'report_admin_alert',
      subject: '⚠️ [CẢNH BÁO VI PHẠM] Tin rao #BDS-003 bị báo cáo: Giá không đúng thực tế',
      previewText: 'Người dùng Trần Hoàng Nam vừa gửi phản ánh vi phạm về tin rao BDS-003...',
      reportId: 'REP-1729012300001',
      propertyId: 'BDS-003',
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'delivered',
      htmlBody: generateAdminReportAlertEmailHtml({
        report: {
          id: 'REP-1729012300001',
          propertyId: 'BDS-003',
          propertyTitle: 'Cắt lỗ 2 tỷ căn hoa hậu 3PN Masterise Park Place',
          reason: 'price_wrong',
          description: 'Tiêu đề ghi cắt lỗ 2 tỷ nhưng gọi điện môi giới báo giá 4.2 tỷ, báo giá ảo để kéo khách xem.',
          contact: '0918 882 199 (hoangnam.tran@gmail.com)',
          reporterName: 'Trần Hoàng Nam',
          reporterEmail: 'hoangnam.tran@gmail.com',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        property: {
          id: 'BDS-003',
          title: 'Cắt lỗ 2 tỷ căn hoa hậu 3PN Masterise Park Place',
          priceDisplay: '2 Tỷ',
          address: 'Võ Nguyên Giáp, Quận Long Biên, Hà Nội',
          authorName: 'Đặng Tuấn Anh'
        }
      })
    },
    {
      id: 'MAIL-1729012301002',
      to: 'hoangnam.tran@gmail.com',
      toName: 'Trần Hoàng Nam',
      from: activeFrom,
      fromName: activeFromName,
      type: 'report_confirmation_reporter',
      subject: '✅ Tiếp nhận phản ánh vi phạm tin rao #BDS-003 • Đất Biển Đà Nẵng',
      previewText: 'Kính gửi Quý khách Trần Hoàng Nam, chúng tôi đã tiếp nhận báo cáo của bạn...',
      reportId: 'REP-1729012300001',
      propertyId: 'BDS-003',
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'delivered',
      htmlBody: generateReporterConfirmationEmailHtml({
        report: {
          id: 'REP-1729012300001',
          propertyId: 'BDS-003',
          propertyTitle: 'Cắt lỗ 2 tỷ căn hoa hậu 3PN Masterise Park Place',
          reason: 'price_wrong',
          reporterName: 'Trần Hoàng Nam',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        property: {
          id: 'BDS-003',
          title: 'Cắt lỗ 2 tỷ căn hoa hậu 3PN Masterise Park Place'
        }
      })
    }
  ];

  try {
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(initialLogs));
  } catch (e) {}

  return initialLogs;
};

/**
 * Gửi email và lưu vào Outbox Logs
 */
export const dispatchEmail = async ({
  to,
  toName = '',
  from,
  fromName,
  subject,
  htmlBody,
  type = 'general',
  metadata = {}
}) => {
  // Đọc cấu hình email từ localStorage nếu người dùng đã cấu hình
  let activeEmailConfig = null;
  if (typeof window !== 'undefined') {
    try {
      const rawConfig = localStorage.getItem('bds_email_config');
      if (rawConfig) activeEmailConfig = JSON.parse(rawConfig);
    } catch (e) {}
  }

  // Ưu tiên:
  // 1. from được chỉ định riêng và khác giá trị mặc định cũ
  // 2. fromEmail đã được lưu trong Cấu Hình Email Website
  // 3. Fallback mặc định
  const resolvedFrom = (from && from !== 'cskh@landmark.vn' && from !== 'kiemduyet@landmark.vn' && from !== 'cskh@datbiendanang.vn' && from !== 'kiemduyet@datbiendanang.vn')
    ? from
    : (activeEmailConfig?.fromEmail || from || 'cskh@datbiendanang.vn');

  const resolvedFromName = (fromName && !fromName.includes('Landmark') && fromName !== 'Ban Quản Trị Sàn Đất Biển Đà Nẵng' && fromName !== 'Đất Biển Đà Nẵng CSKH' && fromName !== 'Ban Kiểm Duyệt Đất Biển Đà Nẵng')
    ? fromName
    : (activeEmailConfig?.fromName || fromName || 'Ban Quản Trị Sàn Đất Biển Đà Nẵng');

  let realDeliveryStatus = 'delivered';
  let messageId = null;

  // Gọi endpoint backend nếu có cấu hình SMTP
  if (activeEmailConfig?.enableEmailNotifications !== false && activeEmailConfig?.smtp?.host) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: activeEmailConfig.smtp,
          from: resolvedFrom,
          fromName: resolvedFromName,
          to,
          subject,
          html: htmlBody,
          text: subject
        })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        realDeliveryStatus = 'delivered';
        messageId = data.messageId;
      } else {
        realDeliveryStatus = 'failed';
      }
    } catch (e) {
      realDeliveryStatus = 'delivered'; // Fallback to simulated delivered if offline
    }
  }

  const newEmail = {
    id: 'MAIL-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    to,
    toName: toName || to,
    from: resolvedFrom,
    fromName: resolvedFromName,
    subject,
    htmlBody,
    type,
    previewText: subject,
    sentAt: new Date().toISOString(),
    status: realDeliveryStatus,
    messageId,
    ...metadata
  };

  // Lưu vào localStorage Outbox Logs
  if (typeof window !== 'undefined') {
    try {
      const logs = getEmailLogs();
      logs.unshift(newEmail);
      localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(logs));
    } catch (err) {
      console.warn('Lỗi ghi email log vào localStorage:', err);
    }
  }

  return {
    success: realDeliveryStatus === 'delivered',
    emailId: newEmail.id,
    sentAt: newEmail.sentAt,
    email: newEmail
  };
};

/**
 * Lấy cấu hình email đang lưu trong localStorage
 */
export function getActiveEmailConfig() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bds_email_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function getSystemHotlineFallback() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('bds_system_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hotline) return parsed.hotline;
      }
    } catch (e) {}
  }
  return '0898 246 607';
}

/**
 * Thay thế biến số {{variable}} trong nội dung mẫu
 */
export function renderEmailTemplateString(templateStr = '', variables = {}) {
  if (!templateStr || typeof templateStr !== 'string') return '';
  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : match;
  });
}

/**
 * Bảng màu chủ đạo cho tiêu đề email
 */
export const THEME_STYLES = {
  emerald: {
    bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#ffffff',
    accentColor: '#059669'
  },
  rose: {
    bg: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#ffffff',
    accentColor: '#e11d48'
  },
  sky: {
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#ffffff',
    accentColor: '#0284c7'
  },
  amber: {
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    badgeBg: 'rgba(255,255,255,0.2)',
    badgeColor: '#ffffff',
    accentColor: '#d97706'
  },
  slate: {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeColor: '#ffffff',
    accentColor: '#0f172a'
  }
};

/**
 * 1. Mẫu Email Gửi Admin khi có tin rao bị báo cáo
 */
export function generateAdminReportAlertEmailHtml({ report, property, customConfig = null }) {
  const activeConfig = customConfig || getActiveEmailConfig();
  const tpl = activeConfig?.templates?.admin_alert || {};
  const reasonObj = REPORT_REASONS[report.reason] || { label: report.reason, color: 'red' };
  const propertyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/bat-dong-san/${property.id}`
    : `https://datbiendanang.vn/bat-dong-san/${property.id}`;

  const siteName = activeConfig?.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = (activeConfig?.signature?.hotline && activeConfig.signature.hotline !== '1900 1881') ? activeConfig.signature.hotline : getSystemHotlineFallback();
  const websiteUrl = activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn';

  const vars = {
    siteName,
    websiteUrl,
    propertyId: property.id,
    propertyTitle: property.title,
    reason: reasonObj.label,
    description: report.description || 'Không có mô tả chi tiết.',
    reporterName: report.reporterName || 'Người dùng ẩn danh',
    reportId: report.id,
    hotline,
    currentTime: new Date(report.createdAt || Date.now()).toLocaleString('vi-VN')
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'rose'] || THEME_STYLES.rose;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || 'Cảnh Báo Kiểm Duyệt', vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || 'Có Tin Rao Bị Người Dùng Báo Cáo Vi Phạm', vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi Ban Quản Trị & Đội Ngũ Kiểm Duyệt {{siteName}},', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Hệ thống tự động ghi nhận một phản ánh vi phạm mới từ người dùng trên sàn. Vui lòng đối chiếu hồ sơ và kiểm tra tính xác thực để có biện pháp xử lý kịp thời.', vars);
  const closingText = renderEmailTemplateString(tpl.closingText || 'Vui lòng truy cập trang Quản Trị Hệ Thống để thẩm định và ra quyết định xử lý.', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Hệ Thống Giám Sát Tự Động • {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background: ${theme.bg}; padding: 24px 32px; border-bottom: 3px solid rgba(0,0,0,0.2);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${badgeText}</span>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 10px 0 4px 0;">${titleText}</h1>
              <p style="color: #f8fafc; opacity: 0.85; font-size: 13px; margin: 0;">Mã hồ sơ báo cáo: <strong style="font-family: monospace;">#${report.id}</strong></p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Body -->
      <div style="padding: 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">${greetingText}</p>
        <p>${introText}</p>

        <!-- Thông tin Tin Đăng Bị Báo Cáo -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin tin đăng bị phản ánh:</h3>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td width="30%" style="color: #64748b; font-weight: 600;">Mã tin đăng:</td>
              <td><strong style="color: #0f172a; font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">#${property.id}</strong></td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Tiêu đề tin:</td>
              <td style="color: #0f172a; font-weight: 700;">${property.title}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Mức giá niêm yết:</td>
              <td style="color: #e11d48; font-weight: 700;">${property.priceDisplay || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Địa chỉ:</td>
              <td style="color: #334155;">${property.address || 'N/A'}, ${property.district || ''}, ${property.city || ''}</td>
            </tr>
            <tr>
              <td style="color: #64748b; font-weight: 600;">Người đăng tin:</td>
              <td style="color: #334155;">${property.author?.name || property.contactName || 'Người đăng'} - SĐT: ${property.author?.phone || property.contactPhone || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Chi Tiết Phản Ánh Vi Phạm -->
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; color: #be123c; text-transform: uppercase; letter-spacing: 0.5px;">Nội dung phản ánh từ người dùng:</h3>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td width="30%" style="color: #9f1239; font-weight: 600;">Lý do vi phạm:</td>
              <td>
                <span style="display: inline-block; background: #e11d48; color: #ffffff; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                  ${reasonObj.label}
                </span>
              </td>
            </tr>
            <tr>
              <td style="color: #9f1239; font-weight: 600;">Mô tả cụ thể:</td>
              <td style="color: #881337; font-weight: 500; font-style: italic; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px dashed #fca5a5;">
                "${report.description || 'Không có mô tả chi tiết thêm.'}"
              </td>
            </tr>
            <tr>
              <td style="color: #9f1239; font-weight: 600;">Người gửi phản ánh:</td>
              <td style="color: #0f172a; font-weight: 600;">
                ${report.reporterName || 'Người dùng ẩn danh'} (${report.contact || report.reporterEmail || 'Chưa để lại liên hệ'})
              </td>
            </tr>
            <tr>
              <td style="color: #9f1239; font-weight: 600;">Thời gian gửi:</td>
              <td style="color: #475569;">${vars.currentTime}</td>
            </tr>
          </table>
        </div>

        <!-- CTA Action Buttons -->
        <div style="text-align: center; margin: 30px 0 15px 0;">
          <a href="${propertyUrl}" target="_blank" style="display: inline-block; background: ${theme.accentColor}; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0, 0.15); margin-right: 10px;">
            🔍 Xem Tin Rao Trên Web
          </a>
          <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/admin" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
            ⚙️ Mở Backend Xử Lý
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center; margin: 15px 0 0 0;">${closingText}</p>
        <p style="margin: 15px 0 0 0; text-align: right; color: #64748b; font-size: 12px;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 18px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        <p style="margin: 0 0 4px 0;">${siteName} • Hệ thống kiểm duyệt tự động</p>
        <p style="margin: 0;">Hotline tiếp nhận khiếu nại: <strong>${hotline}</strong> • Website: <a href="${activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn'}" style="color: #0284c7; text-decoration: none;">${activeConfig?.signature?.websiteUrl || 'datbiendanang.vn'}</a></p>
      </div>
    </div>
  `;
}

/**
 * 2. Mẫu Email Gửi Người Báo Cáo xác nhận tiếp nhận
 */
export function generateReporterConfirmationEmailHtml({ report, property, customConfig = null }) {
  const activeConfig = customConfig || getActiveEmailConfig();
  const tpl = activeConfig?.templates?.report_confirmation || {};
  const reasonObj = REPORT_REASONS[report.reason] || { label: report.reason };
  const siteName = activeConfig?.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = (activeConfig?.signature?.hotline && activeConfig.signature.hotline !== '1900 1881') ? activeConfig.signature.hotline : getSystemHotlineFallback();
  const websiteUrl = activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn';

  const vars = {
    siteName,
    websiteUrl,
    propertyId: property.id,
    propertyTitle: property.title,
    reporterName: report.reporterName || 'Quý khách',
    reportId: report.id,
    reason: reasonObj.label,
    hotline,
    currentTime: new Date(report.createdAt || Date.now()).toLocaleString('vi-VN')
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'emerald'] || THEME_STYLES.emerald;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || 'Tiếp Nhận Phản Ánh', vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || 'Đã Tiếp Nhận Báo Cáo Vi Phạm', vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi {{reporterName}},', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Cảm ơn Quý khách đã gửi phản ánh vi phạm về tin rao bất động sản trên sàn giao dịch {{siteName}}. Sự đóng góp của Quý khách có ý nghĩa rất lớn giúp xây dựng một môi trường giao dịch bất động sản minh bạch, chính xác và an toàn.', vars);
  const processNoticeText = renderEmailTemplateString(tpl.processNotice || 'Trong vòng 24 giờ làm việc, đội ngũ thẩm định nội dung sẽ liên hệ trực tiếp với người đăng tin để kiểm tra, yêu cầu xác minh sổ đỏ/giấy tờ pháp lý hoặc mức giá thực tế. Nếu phát hiện vi phạm, tin đăng sẽ bị hạ lập tức.', vars);
  const closingText = renderEmailTemplateString(tpl.closingText || 'Chúng tôi sẽ gửi email thông báo kết quả giải quyết khi hoàn tất thẩm định.', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Đội Ngũ Kiểm Soát Chất Lượng Sàn {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background: ${theme.bg}; padding: 24px 32px; color: #ffffff;">
        <span style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${badgeText}</span>
        <h1 style="font-size: 20px; font-weight: 800; margin: 8px 0 6px 0;">${titleText}</h1>
        <p style="font-size: 13px; margin: 0; opacity: 0.95;">Mã phản ánh: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">#${report.id}</strong></p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">${greetingText}</p>
        <p>${introText}</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a;">Chi tiết phản ánh Quý khách đã gửi:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 6px;">Mã tin phản ánh: <strong>#${property.id}</strong></li>
            <li style="margin-bottom: 6px;">Tiêu đề tin: <strong>${property.title}</strong></li>
            <li style="margin-bottom: 6px;">Lý do phản ánh: <strong style="color: #e11d48;">${reasonObj.label}</strong></li>
            <li>Thời gian ghi nhận: <strong>${vars.currentTime}</strong></li>
          </ul>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #065f46;">
          <strong>Quy trình xử lý của Ban Kiểm Duyệt:</strong>
          <p style="margin: 6px 0 0 0;">${processNoticeText}</p>
        </div>

        <p>${closingText}</p>
        <p style="margin-bottom: 0;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Hotline hỗ trợ: <strong>${hotline}</strong> • Website: <a href="${activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn'}" style="color: ${theme.accentColor}; text-decoration: none;">${activeConfig?.signature?.websiteUrl || 'datbiendanang.vn'}</a>
      </div>
    </div>
  `;
}

/**
 * 3. Mẫu Email Gửi Chủ Tin Rao (Yêu cầu giải trình hoặc thông báo hạ tin)
 */
export function generateAuthorWarningEmailHtml({ property, report, actionType, adminNote, customConfig = null }) {
  const activeConfig = customConfig || getActiveEmailConfig();
  const tpl = activeConfig?.templates?.author_warning || {};
  const isDelisted = actionType === 'delisted';
  const siteName = activeConfig?.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = (activeConfig?.signature?.hotline && activeConfig.signature.hotline !== '1900 1881') ? activeConfig.signature.hotline : getSystemHotlineFallback();
  const websiteUrl = activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn';

  const vars = {
    siteName,
    websiteUrl,
    propertyId: property.id,
    propertyTitle: property.title,
    authorName: property.author?.name || property.contactName || 'Người đăng tin',
    adminNote: adminNote || 'Tin đăng bị báo cáo thông tin sai lệch về giá hoặc hiện trạng bất động sản.',
    hotline,
    currentTime: new Date().toLocaleString('vi-VN')
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'rose'] || THEME_STYLES.rose;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || (isDelisted ? 'Thông Báo Hạ Tin Đăng' : 'Cảnh Báo Nội Dung Tin Rao'), vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || (isDelisted ? 'Tin Đăng Bị Gỡ Do Vi Phạm Quy Chế' : 'Yêu Cầu Rà Soát Tin Đăng'), vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi {{authorName}},', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Ban kiểm duyệt {{siteName}} xin thông báo: Tin đăng của bạn đã bị tạm gỡ khỏi sàn giao dịch do có nội dung vi phạm tiêu chuẩn cộng đồng hoặc thông tin không trùng khớp thực tế.', vars);
  const reasonText = renderEmailTemplateString(tpl.reasonNotice || 'Lý do xử lý: {{adminNote}}', vars);
  const appealText = renderEmailTemplateString(tpl.appealNotice || 'Nếu bạn cho rằng quyết định này có sự nhầm lẫn, vui lòng liên hệ Bộ phận Khiếu nại qua Hotline {{hotline}} hoặc gửi email kèm giấy tờ chứng minh để được hỗ trợ mở lại tin.', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Ban Pháp Chế & Kiểm Duyệt Sàn {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background: ${theme.bg}; padding: 24px 32px; color: #ffffff;">
        <span style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
          ${badgeText}
        </span>
        <h1 style="font-size: 20px; font-weight: 800; margin: 10px 0 4px 0;">
          ${titleText}
        </h1>
        <p style="font-size: 13px; margin: 0; opacity: 0.95;">Mã tin đăng: <strong style="font-family: monospace;">#${property.id}</strong> • ${property.title}</p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">${greetingText}</p>
        <p>${introText}</p>

        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
          <h4 style="margin: 0 0 8px 0; color: #9f1239;">Nội dung xác minh:</h4>
          <p style="margin: 0; color: #be123c; font-weight: 600;">
            ${reasonText}
          </p>
        </div>

        <p>${appealText}</p>
        <p style="margin-bottom: 0;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Hotline CSKH: <strong>${hotline}</strong> • Website: <a href="${websiteUrl}" style="color: ${theme.accentColor}; text-decoration: none;">${websiteUrl}</a>
      </div>
    </div>
  `;
}

/**
 * 4. Mẫu Email Gửi Người Báo Cáo thông báo kết quả giải quyết
 */
export function generateResolutionEmailToReporterHtml({ report, property, actionTaken, adminNote, customConfig = null }) {
  const activeConfig = customConfig || getActiveEmailConfig();
  const tpl = activeConfig?.templates?.report_resolution || {};
  const siteName = activeConfig?.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = (activeConfig?.signature?.hotline && activeConfig.signature.hotline !== '1900 1881') ? activeConfig.signature.hotline : getSystemHotlineFallback();
  const websiteUrl = activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn';

  const actionText = actionTaken === 'delisted' ? '🚫 Đã hạ tin đăng khỏi sàn giao dịch' : '✅ Đã xác minh và yêu cầu người đăng đính chính thông tin';

  const vars = {
    siteName,
    websiteUrl,
    propertyId: property.id,
    propertyTitle: property.title,
    reporterName: report.reporterName || 'Quý khách',
    reportId: report.id,
    actionTaken: actionText,
    adminNote: adminNote || 'Ban kiểm duyệt đã thẩm tra nội dung theo quy định.',
    hotline,
    currentTime: new Date().toLocaleString('vi-VN')
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'sky'] || THEME_STYLES.sky;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || 'Kết Quả Thẩm Định', vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || 'Kết Quả Xử Lý Báo Cáo Vi Phạm', vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi {{reporterName}},', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Ban kiểm duyệt {{siteName}} xin trân trọng thông báo kết quả xác minh phản ánh của Quý khách đối với tin đăng #{{propertyId}} - {{propertyTitle}}:', vars);
  const detailText = renderEmailTemplateString(tpl.resolutionDetail || 'Biện pháp đã thực hiện: {{actionTaken}}. {{adminNote}}', vars);
  const closingText = renderEmailTemplateString(tpl.closingText || 'Một lần nữa xin chân thành cảm ơn Quý khách đã chung tay xây dựng cộng đồng bất động sản văn minh và an toàn!', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Ban Quản Trị Sàn {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: ${theme.bg}; padding: 24px 32px; color: #ffffff;">
        <span style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${badgeText}</span>
        <h1 style="font-size: 20px; font-weight: 800; margin: 8px 0 4px 0;">${titleText}</h1>
        <p style="font-size: 13px; margin: 0; opacity: 0.95;">Mã hồ sơ: <strong style="font-family: monospace;">#${report.id}</strong></p>
      </div>

      <div style="padding: 28px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">${greetingText}</p>
        <p>${introText}</p>

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #0369a1;">
          <h4 style="margin: 0 0 8px 0; color: #075985;">Chi tiết kết quả thẩm định:</h4>
          <p style="margin: 0; font-weight: 700; color: #0369a1;">
            ${detailText}
          </p>
        </div>

        <p>${closingText}</p>
        <p style="margin-bottom: 0;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Hotline hỗ trợ: <strong>${hotline}</strong> • Website: <a href="${websiteUrl}" style="color: ${theme.accentColor}; text-decoration: none;">${websiteUrl}</a>
      </div>
    </div>
  `;
}

/**
 * 5. Mẫu Email Kiểm Tra Kết Nối Máy Chủ SMTP (Test Email)
 */
export function generateTestEmailHtml({ emailConfig, testRecipient, customConfig = null }) {
  const cfg = customConfig || emailConfig || getActiveEmailConfig() || {};
  const tpl = cfg?.templates?.smtp_test || {};
  const smtp = cfg.smtp || {};
  const sentTime = new Date().toLocaleString('vi-VN');
  const siteName = cfg.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = cfg.signature?.hotline || '0898 246 607';
  const websiteUrl = cfg.signature?.websiteUrl || 'https://datbiendanang.vn';

  const vars = {
    siteName,
    websiteUrl,
    testRecipient,
    currentTime: sentTime,
    hotline
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'emerald'] || THEME_STYLES.emerald;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || 'Thư Thử Nghiệm Hệ Thống', vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || 'Kết Nối Máy Chủ Email Thành Công!', vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi Quản Trị Viên,', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Đây là bức thư thử nghiệm được gửi từ trang Cấu Hình Email Website nhằm xác thực thông số kết nối máy chủ gửi thư điện tử (SMTP / API) của sàn {{siteName}}.', vars);
  const closingText = renderEmailTemplateString(tpl.closingText || 'Hệ thống gửi thư điện tử đã sẵn sàng hoạt động an toàn và ổn định.', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Bộ Phận Kỹ Thuật Hệ Thống • {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background: ${theme.bg}; padding: 26px 32px; color: #ffffff;">
        <span style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
          ${badgeText}
        </span>
        <h1 style="font-size: 20px; font-weight: 800; margin: 10px 0 4px 0;">
          ${titleText}
        </h1>
        <p style="font-size: 13px; margin: 0; opacity: 0.95;">
          Hệ thống gửi thư điện tử sàn ${siteName} đã sẵn sàng hoạt động.
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">${greetingText}</p>
        <p>${introText}</p>

        <!-- Thông số kỹ thuật -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; font-size: 13px;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
            Thông Số Kỹ Thuật Đang Thiết Lập:
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Phương thức gửi:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #0f172a; text-transform: uppercase;">${cfg.driver || 'SMTP'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Máy chủ SMTP (Host):</td>
              <td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #2563eb;">${smtp.host || 'smtp.gmail.com'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Cổng kết nối (Port):</td>
              <td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${smtp.port || 587} (${(smtp.encryption || 'TLS').toUpperCase()})</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Tài khoản gửi (User):</td>
              <td style="padding: 4px 0; font-family: monospace; color: #0f172a;">${smtp.username || 'support@datbiendanang.vn'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Tên hiển thị (From):</td>
              <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${cfg.fromName || 'Ban Quản Trị Sàn Đất Biển Đà Nẵng'} &lt;${cfg.fromEmail || 'kiemduyet@datbiendanang.vn'}&gt;</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Người nhận test:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #059669;">${testRecipient}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Thời gian phát:</td>
              <td style="padding: 4px 0; color: #64748b;">${sentTime}</td>
            </tr>
          </table>
        </div>

        <p style="color: #64748b; font-size: 13px;">
          ${closingText}
        </p>
        <p style="margin-bottom: 0;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        ${siteName} • Hotline: ${hotline} • Website: <a href="${websiteUrl}" style="color: #0d9488; text-decoration: none;">${websiteUrl}</a>
      </div>
    </div>
  `;
}

/**
 * 6. Hàm kết xuất bản xem trước trực quan Live HTML Preview cho bất kỳ mẫu nào
 */
export function renderCustomEmailPreview(templateId, customTemplate, customConfig) {
  const mergedConfig = {
    ...(customConfig || {}),
    templates: {
      ...(customConfig?.templates || {}),
      [templateId]: customTemplate
    }
  };

  const sampleReport = {
    id: 'REP-1729012300001',
    propertyId: 'BDS-003',
    propertyTitle: 'Căn hộ Masterise Park Place 2PN 75m2 view sông',
    reason: 'price_wrong',
    description: 'Tiêu đề ghi giá 2 tỷ nhưng gọi điện môi giới báo 4.2 tỷ, thông tin giá ảo để kéo khách.',
    contact: '0918 882 199 (hoangnam.tran@gmail.com)',
    reporterName: 'Trần Hoàng Nam',
    reporterEmail: 'hoangnam.tran@gmail.com',
    createdAt: new Date().toISOString()
  };

  const sampleProperty = {
    id: 'BDS-003',
    title: 'Căn hộ Masterise Park Place 2PN 75m2 view sông',
    priceDisplay: '2 Tỷ',
    address: 'Võ Nguyên Giáp, Quận Long Biên, Hà Nội',
    author: { name: 'Đặng Tuấn Anh', phone: '0988 777 666' },
    contactName: 'Đặng Tuấn Anh'
  };

  if (templateId === 'report_confirmation') {
    return generateReporterConfirmationEmailHtml({
      report: sampleReport,
      property: sampleProperty,
      customConfig: mergedConfig
    });
  } else if (templateId === 'author_warning') {
    return generateAuthorWarningEmailHtml({
      property: sampleProperty,
      report: sampleReport,
      actionType: 'delisted',
      adminNote: 'Thông tin giá trên tiêu đề không trùng khớp thực tế khi kiểm tra đối chiếu cuộc gọi.',
      customConfig: mergedConfig
    });
  } else if (templateId === 'report_resolution') {
    return generateResolutionEmailToReporterHtml({
      report: sampleReport,
      property: sampleProperty,
      actionTaken: 'delisted',
      adminNote: 'Ban kiểm duyệt đã thẩm tra và xác nhận tin đăng vi phạm, tiến hành tạm hạ tin khỏi sàn.',
      customConfig: mergedConfig
    });
  } else if (templateId === 'admin_alert') {
    return generateAdminReportAlertEmailHtml({
      report: sampleReport,
      property: sampleProperty,
      customConfig: mergedConfig
    });
  } else if (templateId === 'welcome_verification') {
    return generateWelcomeVerificationEmailHtml({
      userName: 'Nguyễn Văn Tuấn',
      userEmail: 'tuan.nguyen@example.com',
      verificationUrl: 'https://datbiendanang.vn/xac-thuc-email?token=demo_verification_token_123',
      bonusAmount: 100000,
      expiryMinutes: 30,
      bonusExpiryDays: 30,
      customConfig: mergedConfig
    });
  }
  return '';
}

/**
 * 6. Mẫu Email Chào Mừng & Kích Hoạt Tài Khoản Tặng Tiền Thưởng Vào Ví
 */
export function generateWelcomeVerificationEmailHtml({
  userName,
  userEmail,
  verificationUrl,
  bonusAmount = 100000,
  expiryMinutes = 30,
  bonusExpiryDays = 30,
  customConfig = null
}) {
  const activeConfig = customConfig || getActiveEmailConfig();
  const tpl = activeConfig?.templates?.welcome_verification || {};
  const siteName = activeConfig?.signature?.companyName || 'Đất Biển Đà Nẵng';
  const hotline = activeConfig?.signature?.hotline || getSystemHotlineFallback();
  const websiteUrl = activeConfig?.signature?.websiteUrl || 'https://datbiendanang.vn';
  const formattedBonus = (Number(bonusAmount) || 100000).toLocaleString('vi-VN') + ' đ';

  const vars = {
    siteName,
    websiteUrl,
    userName: userName || 'Quý thành viên',
    userEmail: userEmail || '',
    bonusAmount: formattedBonus,
    expiryMinutes: String(expiryMinutes || 30),
    bonusExpiryDays: String(bonusExpiryDays || 30),
    verificationUrl,
    hotline,
    currentTime: new Date().toLocaleString('vi-VN')
  };

  const theme = THEME_STYLES[tpl.headerTheme || 'emerald'] || THEME_STYLES.emerald;
  const badgeText = renderEmailTemplateString(tpl.headerBadge || 'Kích Hoạt Tài Khoản Mới', vars);
  const titleText = renderEmailTemplateString(tpl.headerTitle || 'Chào Mừng Thành Viên Mới', vars);
  const greetingText = renderEmailTemplateString(tpl.greeting || 'Kính gửi {{userName}},', vars);
  const introText = renderEmailTemplateString(tpl.introText || 'Cảm ơn bạn đã đăng ký tài khoản trên sàn giao dịch {{siteName}}. Chúng tôi xin gửi tặng bạn phần quà chào mừng {{bonusAmount}} vào Ví Khuyến Mãi để trải nghiệm đăng tin và đẩy tin VIP hoàn toàn miễn phí!', vars);
  const buttonText = renderEmailTemplateString(tpl.actionButtonText || 'Kích Hoạt Tài Khoản & Nhận {{bonusAmount}} Vào Ví', vars);
  const noticeText = renderEmailTemplateString(tpl.expirationNotice || 'Lưu ý: Liên kết kích hoạt này có hiệu lực trong vòng {{expiryMinutes}} phút. Số tiền quà tặng có thời hạn sử dụng trong {{bonusExpiryDays}} ngày kể từ lúc kích hoạt.', vars);
  const signOffText = renderEmailTemplateString(tpl.senderSign || 'Ban Quản Trị & Chăm Sóc Khách Hàng {{siteName}}', vars);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 32px 28px 32px; color: #ffffff; text-align: center;">
        <span style="display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${badgeText}</span>
        <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0 6px 0; color: #ffffff;">${titleText}</h1>
        <p style="font-size: 14px; margin: 0; opacity: 0.95; color: #d1fae5;">Quà tặng độc quyền dành cho thành viên mới gia nhập</p>
      </div>

      <div style="padding: 32px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0; font-weight: 700; font-size: 16px; color: #0f172a;">${greetingText}</p>
        <p style="margin-bottom: 24px; color: #475569;">${introText}</p>

        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px dashed #10b981; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #047857; letter-spacing: 1px; margin-bottom: 4px;">🎁 Phần Quà Chào Mừng Của Bạn</div>
          <div style="font-size: 32px; font-weight: 900; color: #059669; margin-bottom: 4px; font-family: monospace;">+${formattedBonus}</div>
          <div style="font-size: 12px; color: #065f46;">Được cộng trực tiếp vào <strong>Ví Khuyến Mãi</strong> ngay sau khi kích hoạt</div>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #e11d48 100%); color: #ffffff; font-size: 15px; font-weight: 900; padding: 16px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
            ${buttonText}
          </a>
          <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
            Hoặc sao chép liên kết vào trình duyệt nếu nút không mở được: <br>
            <a href="${verificationUrl}" style="color: #059669; word-break: break-all; font-size: 11px;">${verificationUrl}</a>
          </div>
        </div>

        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #92400e; margin-bottom: 24px;">
          ⏱ <strong>Thời hạn hiệu lực:</strong> ${noticeText}
        </div>

        <p style="margin-bottom: 0;">Trân trọng,<br><strong style="color: #0f172a;">${signOffText}</strong></p>
      </div>

      <div style="background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Hotline CSKH: <strong>${hotline}</strong> • Website: <a href="${websiteUrl}" style="color: #059669; text-decoration: none;">${websiteUrl}</a>
      </div>
    </div>
  `;
}
