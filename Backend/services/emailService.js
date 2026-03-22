const nodemailer = require('nodemailer');
const EMAIL_TIMEOUT_MS = 15000;

// Create a transporter using Gmail SMTP
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not regular password)
    },
    tls: {
      servername: host,
      minVersion: 'TLSv1.2',
    },
  });
};

/**
 * Generate a 6-digit random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - User's name
 */
const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Luminous Voice" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email — Luminous Voice',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #0b1326; color: #dae2fd; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00FF41; font-size: 24px; margin: 0;">Luminous Voice</h1>
        </div>
        <p style="font-size: 16px; margin-bottom: 8px;">Hi ${name},</p>
        <p style="font-size: 14px; color: #a0a8c4; margin-bottom: 24px;">
          Enter this verification code to complete your signup:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: #131b2e; border: 2px solid #00FF41; border-radius: 12px; padding: 20px 40px; letter-spacing: 12px; font-size: 36px; font-weight: bold; color: #00FF41;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 12px; color: #6b7190; text-align: center; margin-top: 24px;">
          This code expires in <strong>10 minutes</strong>. If you didn't sign up, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #222a3d; margin: 32px 0;" />
        <p style="font-size: 11px; color: #4a5070; text-align: center;">
          © 2026 Luminous Voice. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email service timed out while sending OTP.')), EMAIL_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { generateOTP, sendOTPEmail };
