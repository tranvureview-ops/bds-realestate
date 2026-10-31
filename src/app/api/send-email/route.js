import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { decryptAES256 } from '../../../utils/cryptoUtils';

export async function POST(request) {
  try {
    const data = await request.json();
    const { smtp, from, fromName, to, subject, html, text } = data;

    if (!to) {
      return NextResponse.json({ success: false, error: 'Thiếu địa chỉ email người nhận (to)' }, { status: 400 });
    }

    const host = (smtp?.host || '').trim();
    const port = Number(smtp?.port) || 587;
    const user = (smtp?.username || '').trim();
    const envPass = process.env.SMTP_PASSWORD || process.env.EMAIL_SMTP_PASSWORD || '';
    const rawPass = (smtp?.password || envPass || '').trim();
    const pass = decryptAES256(rawPass).replace(/\s+/g, '');
    const isSecure = port === 465 || smtp?.encryption === 'ssl';

    if (!host) {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình Máy chủ SMTP (SMTP Host)' }, { status: 400 });
    }

    if (!user || !pass) {
      return NextResponse.json({
        success: false,
        error: 'Chưa nhập Tài khoản hoặc Mật khẩu ứng dụng (App Password) trong Cấu Hình Email.'
      }, { status: 400 });
    }

    const transportOptions = {
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    };

    const transporter = nodemailer.createTransport(transportOptions);
    await transporter.verify();

    const sender = fromName ? `"${fromName}" <${from || user}>` : (from || user);
    const mailOptions = {
      from: sender,
      to,
      subject: subject || 'Thư thử nghiệm từ Đất Biển Đà Nẵng',
      html: html || '<p>Nội dung thử nghiệm</p>',
      text: text || 'Nội dung thử nghiệm'
    };

    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted
    });
  } catch (err) {
    let friendlyMsg = err.message || 'Lỗi gửi mail không xác định';
    if (err.code === 'EAUTH' || err.responseCode === 535) {
      friendlyMsg = 'Xác thực tài khoản SMTP thất bại (Sai email hoặc mật khẩu ứng dụng Gmail App Password)';
    } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
      friendlyMsg = 'Không thể kết nối đến máy chủ SMTP (Kiểm tra lại Host và Port)';
    }
    return NextResponse.json({ success: false, error: friendlyMsg, rawError: err.message }, { status: 500 });
  }
}
