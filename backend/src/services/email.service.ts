import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { ENV } from '../config/env.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;

  constructor() {
    if (ENV.RESEND_API_KEY) {
      this.resend = new Resend(ENV.RESEND_API_KEY);
      console.log('[EmailService] Initialized with Resend API');
    }

    if (ENV.SMTP_USER && ENV.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
      console.log('[EmailService] Initialized with SMTP Transporter');
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
    console.log(`\n========================================`);
    console.log(`[REAL OTP DISPATCH]`);
    console.log(`Recipient: ${toEmail}`);
    console.log(`OTP Code:  >>> ${otpCode} <<< (Expires in 5 mins)`);
    console.log(`========================================\n`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff;">
        <h2 style="color: #FF4458; text-align: center; margin-bottom: 8px;">Chào mừng bạn đến với Cupid AI!</h2>
        <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0;">Kết nối thông minh & Xóa bỏ rào cản mở lời</p>
        
        <p style="font-size: 15px; margin-top: 24px;">Mã xác thực (OTP) kích hoạt tài khoản của bạn là:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF4458; background: #FFF0F2; padding: 14px 30px; border-radius: 12px; border: 1px dashed #FF4458;">
            ${otpCode}
          </span>
        </div>
        
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Cupid AI Team - Smart Dating Platform</p>
      </div>
    `;

    // 1. Try Resend API first
    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: ENV.EMAIL_FROM,
          to: toEmail,
          subject: `[Cupid AI] Mã xác thực tài khoản của bạn: ${otpCode}`,
          html: htmlContent,
        });

        if (error) {
          console.error('[EmailService] Resend API error:', error);
        } else {
          console.log(`[EmailService] Email sent via Resend API successfully. ID:`, data?.id);
          return true;
        }
      } catch (err) {
        console.error('[EmailService] Resend dispatch exception:', err);
      }
    }

    // 2. Try SMTP fallback
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: ENV.EMAIL_FROM,
          to: toEmail,
          subject: `[Cupid AI] Mã xác thực tài khoản của bạn: ${otpCode}`,
          html: htmlContent,
        });
        console.log(`[EmailService] Email sent via SMTP successfully to ${toEmail}`);
        return true;
      } catch (error) {
        console.error(`[EmailService] Error sending email via SMTP:`, error);
      }
    }

    console.log(`[EmailService] Notice: Neither Resend API nor SMTP sent. Simulated email logged to console.`);
    return true;
  }

  async sendPasswordResetEmail(toEmail: string, otpCode: string): Promise<boolean> {
    console.log(`\n========================================`);
    console.log(`[PASSWORD RESET OTP DISPATCH]`);
    console.log(`Recipient: ${toEmail}`);
    console.log(`Reset Code: >>> ${otpCode} <<< (Expires in 5 mins)`);
    console.log(`========================================\n`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff;">
        <h2 style="color: #FF4458; text-align: center; margin-bottom: 8px;">Yêu cầu Đặt lại Mật khẩu - Cupid AI</h2>
        <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0;">Bảo mật tài khoản Cupid AI</p>
        
        <p style="font-size: 15px; margin-top: 24px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã xác thực là:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF4458; background: #FFF0F2; padding: 14px 30px; border-radius: 12px; border: 1px dashed #FF4458;">
            ${otpCode}
          </span>
        </div>
        
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">Mã này có hiệu lực trong vòng 5 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Cupid AI Team - Smart Dating Platform</p>
      </div>
    `;

    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: ENV.EMAIL_FROM,
          to: toEmail,
          subject: `[Cupid AI] Mã đặt lại mật khẩu: ${otpCode}`,
          html: htmlContent,
        });

        if (!error) {
          console.log(`[EmailService] Password reset email sent via Resend API successfully. ID:`, data?.id);
          return true;
        }
      } catch (err) {
        console.error('[EmailService] Resend dispatch exception for password reset:', err);
      }
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: ENV.EMAIL_FROM,
          to: toEmail,
          subject: `[Cupid AI] Mã đặt lại mật khẩu: ${otpCode}`,
          html: htmlContent,
        });
        console.log(`[EmailService] Password reset email sent via SMTP successfully to ${toEmail}`);
        return true;
      } catch (error) {
        console.error(`[EmailService] Error sending password reset email via SMTP:`, error);
      }
    }

    console.log(`[EmailService] Notice: Neither Resend API nor SMTP sent. Simulated email logged to console.`);
    return true;
  }
}

export const emailService = new EmailService();
