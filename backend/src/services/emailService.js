const nodemailer = require('nodemailer');

/**
 * Email Service — sends transactional emails via SMTP (Gmail, SendGrid, etc.)
 * Gracefully degrades: if SMTP is not configured, logs the email to console instead.
 */

// Create reusable transporter
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return null; // No SMTP configured — will log to console
  }

  return nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Jobora <noreply@jobora.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Core send function — tries SMTP, falls back to console log
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n📧 [Email Service — Dev Mode] Email not sent (SMTP not configured)');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log('   Body:    [HTML email content]');
    console.log('   → Configure SMTP_USER and SMTP_PASS in .env to enable real emails.\n');
    return { success: true, mode: 'console' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// -----------------------------------------------
// 1. Application Confirmation — sent to Candidate
// -----------------------------------------------
const sendApplicationConfirmation = async ({ candidateName, candidateEmail, jobTitle, companyName }) => {
  return sendEmail({
    to: candidateEmail,
    subject: `✅ Application Received — ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); border-radius: 10px; padding: 28px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">Application Submitted! 🎉</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Your application is on its way</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hi <strong>${candidateName}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Great news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.
          </p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 600;">📋 Application Details</p>
            <p style="margin: 6px 0 0; color: #374151; font-size: 13px;">Position: <strong>${jobTitle}</strong></p>
            <p style="margin: 4px 0 0; color: #374151; font-size: 13px;">Company: <strong>${companyName}</strong></p>
            <p style="margin: 4px 0 0; color: #374151; font-size: 13px;">Applied: <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">The employer will review your application and reach out if you're a good fit. You can track all your applications in your dashboard.</p>
          <div style="text-align: center; margin: 24px 0 0;">
            <a href="${FRONTEND_URL}/candidate/applications" style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">View My Applications →</a>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Jobora — AI-Powered Job Portal</p>
      </div>
    `,
  });
};

// -----------------------------------------------
// 2. New Applicant Alert — sent to Employer
// -----------------------------------------------
const sendNewApplicantAlert = async ({ employerEmail, employerName, candidateName, jobTitle }) => {
  return sendEmail({
    to: employerEmail,
    subject: `👤 New Applicant — ${candidateName} applied for ${jobTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 10px; padding: 28px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">New Application Received 📬</h1>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hi <strong>${employerName || 'there'}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            <strong>${candidateName}</strong> just applied for the <strong>${jobTitle}</strong> position.
          </p>
          <div style="text-align: center; margin: 24px 0 0;">
            <a href="${FRONTEND_URL}/employer/applicants" style="background: #0f172a; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">View Applicants →</a>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Jobora — AI-Powered Job Portal</p>
      </div>
    `,
  });
};

// -----------------------------------------------
// 3. Password Reset Email
// -----------------------------------------------
const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const expiresHours = process.env.RESET_TOKEN_EXPIRES_HOURS || 1;

  return sendEmail({
    to: email,
    subject: '🔐 Reset Your Jobora Password',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 10px; padding: 28px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">Password Reset Request 🔐</h1>
          <p style="color: #fecaca; margin: 8px 0 0; font-size: 14px;">This link expires in ${expiresHours} hour(s)</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hi <strong>${name || 'there'}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            We received a request to reset your password. Click the button below to choose a new password. If you didn't request this, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">Reset My Password →</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0; word-break: break-all;">
            Or paste this link in your browser:<br/>
            <span style="color: #2563eb;">${resetUrl}</span>
          </p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px; padding: 12px 16px; margin-top: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 12px; font-weight: 600;">⚠️ Security Notice</p>
            <p style="margin: 4px 0 0; color: #7f1d1d; font-size: 12px;">This link expires in <strong>${expiresHours} hour(s)</strong>. Never share your password with anyone.</p>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">Jobora — AI-Powered Job Portal</p>
      </div>
    `,
  });
};

module.exports = {
  sendApplicationConfirmation,
  sendNewApplicantAlert,
  sendPasswordResetEmail,
};
