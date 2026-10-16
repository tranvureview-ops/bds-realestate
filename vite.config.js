import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.resolve(__dirname, 'server-db.json')

const paymentSessions = new Map()

function localPersistencePlugin() {
  return {
    name: 'vite-plugin-local-persistence',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/db-sync') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            if (fs.existsSync(DB_FILE)) {
              try {
                const data = fs.readFileSync(DB_FILE, 'utf-8')
                res.end(data || '{}')
              } catch (e) {
                res.end('{}')
              }
            } else {
              res.end('{}')
            }
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                fs.writeFileSync(DB_FILE, body, 'utf-8')
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: e.message }))
              }
            })
            return
          }
        }

        // 1. Khởi tạo phiên thanh toán (Draft / Payment Session)
        if (req.url === '/api/payment-session' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}')
              if (data.orderId) {
                paymentSessions.set(data.orderId, {
                  orderId: data.orderId,
                  amount: data.amount,
                  status: 'pending',
                  createdAt: Date.now()
                })
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, orderId: data.orderId }))
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
          return
        }

        // 2. Client Polling: Kiểm tra trạng thái thanh toán theo orderId
        if (req.url.startsWith('/api/payment-status') && req.method === 'GET') {
          const urlObj = new URL(req.url, 'http://localhost:5173')
          const orderId = urlObj.searchParams.get('orderId')
          const session = paymentSessions.get(orderId) || { orderId, status: 'pending' }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(session))
          return
        }

        // 3. Webhook: Cổng thanh toán / Ngân hàng báo biến động số dư thành công
        if (req.url === '/api/payment-webhook' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}')
              const orderId = data.orderId
              if (orderId) {
                const session = paymentSessions.get(orderId) || { orderId }
                session.status = 'success'
                session.paidAt = Date.now()
                session.paidAmount = data.amount || session.amount
                paymentSessions.set(orderId, session)
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Webhook received and payment marked success' }))
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
          return
        }

        // 4. API Gửi Email Thật qua SMTP (Nodemailer)
        if (req.url === '/api/send-email' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            try {
              const data = JSON.parse(body || '{}')
              const { smtp, from, fromName, to, subject, html, text } = data

              if (!to) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Thiếu địa chỉ email người nhận (to)' }))
                return
              }

              const host = (smtp?.host || '').trim()
              const port = Number(smtp?.port) || 587
              const user = (smtp?.username || '').trim()
              const pass = (smtp?.password || '').replace(/\s+/g, '') // App password thường có dấu cách
              const isSecure = port === 465 || smtp?.encryption === 'ssl'

              if (!host) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Chưa cấu hình Máy chủ SMTP (SMTP Host)' }))
                return
              }

              if (!user || !pass) {
                res.statusCode = 400
                res.end(JSON.stringify({
                  success: false,
                  error: 'Chưa nhập Tài khoản hoặc Mật khẩu ứng dụng (App Password) trong Cấu Hình Email.'
                }))
                return
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
              }

              const transporter = nodemailer.createTransport(transportOptions)

              // Verify connection first
              await transporter.verify()

              // Send email
              const sender = fromName ? `"${fromName}" <${from || user}>` : (from || user)
              const mailOptions = {
                from: sender,
                to,
                subject: subject || 'Thư thử nghiệm từ BDS Landmark',
                html: html || '<p>Nội dung thử nghiệm</p>',
                text: text || 'Nội dung thử nghiệm'
              }

              const info = await transporter.sendMail(mailOptions)

              res.end(JSON.stringify({
                success: true,
                messageId: info.messageId,
                response: info.response,
                accepted: info.accepted
              }))
            } catch (err) {
              console.error('Lỗi gửi email qua SMTP:', err)
              res.statusCode = 500
              let userFriendlyMsg = err.message
              if (err.code === 'EAUTH' || err.message?.includes('535') || err.message?.includes('Username and Password not accepted')) {
                userFriendlyMsg = 'Tài khoản hoặc Mật khẩu ứng dụng (App Password) không chính xác. Với Gmail, vui lòng bật Xác minh 2 bước và tạo "Mật khẩu ứng dụng" (16 ký tự).'
              } else if (err.code === 'ESOCKET' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                userFriendlyMsg = `Không thể kết nối đến máy chủ SMTP (${err.address || err.hostname || 'Host'}:${err.port || ''}). Vui lòng kiểm tra lại Host và Port.`
              }
              res.end(JSON.stringify({
                success: false,
                error: userFriendlyMsg,
                originalError: err.message,
                code: err.code
              }))
            }
          })
          return
        }

        // 5. API Kiểm tra kết nối SMTP (Verify Connection)
        if (req.url === '/api/verify-smtp' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            try {
              const data = JSON.parse(body || '{}')
              const { smtp } = data
              const host = (smtp?.host || '').trim()
              const port = Number(smtp?.port) || 587
              const user = (smtp?.username || '').trim()
              const pass = (smtp?.password || '').replace(/\s+/g, '')
              const isSecure = port === 465 || smtp?.encryption === 'ssl'

              if (!host) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Chưa cấu hình Máy chủ SMTP (SMTP Host)' }))
                return
              }

              if (!user || !pass) {
                res.statusCode = 400
                res.end(JSON.stringify({
                  success: false,
                  error: 'Chưa nhập Tài khoản hoặc Mật khẩu ứng dụng (App Password).'
                }))
                return
              }

              const transporter = nodemailer.createTransport({
                host,
                port,
                secure: isSecure,
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000
              })

              await transporter.verify()
              res.end(JSON.stringify({ success: true, message: 'Kết nối máy chủ SMTP thành công!' }))
            } catch (err) {
              res.statusCode = 500
              let userFriendlyMsg = err.message
              if (err.code === 'EAUTH' || err.message?.includes('535') || err.message?.includes('Username and Password not accepted')) {
                userFriendlyMsg = 'Xác thực tài khoản thất bại (Sai Username hoặc App Password). Vui lòng kiểm tra mật khẩu ứng dụng 16 ký tự của Gmail.'
              } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
                userFriendlyMsg = 'Hết thời gian chờ hoặc từ chối kết nối tới Host/Port. Vui lòng kiểm tra cổng mạng.'
              }
              res.end(JSON.stringify({ success: false, error: userFriendlyMsg, originalError: err.message, code: err.code }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localPersistencePlugin()],
})

