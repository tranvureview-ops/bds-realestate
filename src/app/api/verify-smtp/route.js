import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { decryptAES256 } from '../../../utils/cryptoUtils';
import { verifyAdminRequest } from '../../../utils/adminAuth';

export async function POST(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: Quyền Quản trị viên không hợp lệ' 
      }, { status: 401 });
    }

    const data = await request.json();
    const { smtp } = data || {};

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
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 15000
    };

    const transporter = nodemailer.createTransport(transportOptions);
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: `Kết nối thành công tới máy chủ ${host}:${port} với tài khoản ${user}!`
    });
  } catch (err) {
    console.error('Lỗi verify SMTP:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Không thể xác thực kết nối SMTP. Vui lòng kiểm tra lại Username hoặc App Password.'
    }, { status: 500 });
  }
}
