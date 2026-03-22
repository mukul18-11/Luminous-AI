const nodemailer = require('nodemailer');
const EMAIL_TIMEOUT_MS = 15000;
const RESEND_API_URL = 'https://api.resend.com/emails';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP email is not configured. Set EMAIL_USER and EMAIL_PASS.');
  }

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

const buildOtpEmail = ({ otp, name, purpose }) => {
  const isReset = purpose === 'reset';
  const title = isReset ? 'Reset your password' : 'Verify your email';
  const subtitle = isReset
    ? 'Use this code to reset your password:'
    : 'Enter this verification code to complete your signup:';
  const expiryText = isReset
    ? "This code expires in 10 minutes. If you didn't request a password reset, ignore this email."
    : "This code expires in 10 minutes. If you didn't sign up, ignore this email.";

  return {
    subject: `${title} — Luminous Voice`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #0b1326; color: #dae2fd; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00FF41; font-size: 24px; margin: 0;">Luminous Voice</h1>
        </div>
        <p style="font-size: 16px; margin-bottom: 8px;">Hi ${name},</p>
        <p style="font-size: 14px; color: #a0a8c4; margin-bottom: 24px;">
          ${subtitle}
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: #131b2e; border: 2px solid #00FF41; border-radius: 12px; padding: 20px 40px; letter-spacing: 12px; font-size: 36px; font-weight: bold; color: #00FF41;">
            ${otp}
          </div>
        </div>
        <p style="font-size: 12px; color: #6b7190; text-align: center; margin-top: 24px;">
          ${expiryText}
        </p>
        <hr style="border: none; border-top: 1px solid #222a3d; margin: 32px 0;" />
        <p style="font-size: 11px; color: #4a5070; text-align: center;">
          © 2026 Luminous Voice. All rights reserved.
        </p>
      </div>
    `,
  };
};

const sendWithSmtp = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || `"Luminous Voice" <${process.env.EMAIL_USER}>`;

  await Promise.race([
    transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email service timed out while sending OTP.')), EMAIL_TIMEOUT_MS);
    }),
  ]);
};

const sendWithResend = async ({ to, subject, html }) => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is unavailable in this Node runtime.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
  const fromAddress = process.env.EMAIL_FROM || 'Luminous Voice <onboarding@resend.dev>';

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `Resend request failed with status ${response.status}.`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Email service timed out while sending OTP.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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
 * @param {{ purpose?: 'verify' | 'reset' }} options
 */
const sendOTPEmail = async (email, otp, name, options = {}) => {
  const purpose = options.purpose === 'reset' ? 'reset' : 'verify';
  const mailOptions = {
    to: email,
    ...buildOtpEmail({ otp, name, purpose }),
  };

  try {
    if (process.env.RESEND_API_KEY) {
      await sendWithResend(mailOptions);
      return;
    }

    await sendWithSmtp(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { generateOTP, sendOTPEmail };
