/**
 * Email Service — Phase 10
 *
 * This service provides a clean abstraction for sending transactional emails.
 * It uses nodemailer when SMTP_HOST is configured in environment variables.
 * If SMTP is not configured, emails are logged to the console only (dev mode).
 *
 * Design decisions:
 * - Email sending is NEVER blocking for the main business operation.
 *   Callers should await but wrap in try/catch that does not propagate failures.
 * - Deduplication is tracked via in-memory set (resets on server restart).
 *   For production, use Redis or DB-backed deduplication.
 * - HTML templates are inline to avoid file-system dependency.
 *
 * Setup (environment variables in .env):
 *   SMTP_HOST=smtp.yourprovider.com
 *   SMTP_PORT=587
 *   SMTP_SECURE=false          # true for port 465
 *   SMTP_USER=your@email.com
 *   SMTP_PASS=yourpassword
 *   EMAIL_FROM=Campus Lost & Found <noreply@campus.edu>
 *
 * If SMTP_HOST is not set, the service operates in LOG_ONLY mode.
 */

import environment from '../config/environment.js';

// ----- Deduplication -----
// Key: {recipient}:{templateKey} → timestamp last sent
const sentEmailLog = new Map();
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check deduplication — returns true if email was recently sent
 * @param {string} key - deduplication key
 */
const isRecentlySent = (key) => {
  const last = sentEmailLog.get(key);
  if (!last) return false;
  return Date.now() - last < DEDUP_WINDOW_MS;
};

/**
 * Mark an email as sent for deduplication
 * @param {string} key
 */
const markSent = (key) => {
  sentEmailLog.set(key, Date.now());
  // Cleanup old entries (prevent unbounded growth)
  if (sentEmailLog.size > 1000) {
    const oldest = [...sentEmailLog.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 200)
      .map(([k]) => k);
    oldest.forEach((k) => sentEmailLog.delete(k));
  }
};

// ----- Transporter Singleton -----
let transporter = null;
let transporterReady = false;

const initTransporter = async () => {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log('[EmailService] SMTP_HOST not configured. Running in LOG_ONLY mode.');
    return null;
  }

  try {
    // Dynamic import to avoid requiring nodemailer when not used
    const nodemailer = await import('nodemailer').catch(() => null);
    if (!nodemailer) {
      console.warn('[EmailService] nodemailer not installed. Run: npm install nodemailer');
      return null;
    }

    transporter = nodemailer.default.createTransporter({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    transporterReady = true;
    console.log('[EmailService] SMTP transporter ready.');
    return transporter;
  } catch (err) {
    console.warn('[EmailService] SMTP initialization failed:', err.message);
    transporter = null;
    return null;
  }
};

// Initialize on module load (non-blocking)
initTransporter().catch(() => {});

// ----- HTML Template Generator -----
/**
 * Generates a responsive, print-safe HTML email body.
 * Does NOT include passwords, tokens, or verification codes.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.preheader
 * @param {string} opts.bodyHtml
 * @param {string|null} opts.actionUrl
 * @param {string|null} opts.actionLabel
 */
const buildEmailHtml = ({ title, preheader = '', bodyHtml, actionUrl = null, actionLabel = null }) => {
  const appName = 'Campus Lost &amp; Found';
  const btnHtml = actionUrl
    ? `<tr>
        <td style="padding: 24px 0 0;">
          <a href="${actionUrl}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;
                    text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
            ${actionLabel || 'View Details'}
          </a>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <!-- Preheader text (shows in email previews) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f1f5f9;">
    ${preheader}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0f2724;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:#0d9488;">
              <span style="font-size:20px;font-weight:700;color:#fff;">${appName}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="margin:0 0 16px;font-size:22px;color:#f8fafc;">${title}</h2>
                    <div style="font-size:15px;line-height:1.6;color:#cbd5e1;">
                      ${bodyHtml}
                    </div>
                  </td>
                </tr>
                ${btnHtml}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#071615;font-size:12px;color:#475569;border-top:1px solid #1e3a35;">
              This email was sent by the <strong>${appName}</strong> system.
              If you believe you received this in error, please contact the campus administration office.
              <br><br>
              &copy; ${new Date().getFullYear()} Campus Administration. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ----- Public Email Templates -----

/**
 * Send email for claim status change
 */
const sendClaimStatusEmail = async ({ to, recipientName, itemTitle, newStatus, claimId }) => {
  const dedupKey = `claim_status:${to}:${claimId}:${newStatus}`;
  if (isRecentlySent(dedupKey)) return { skipped: true, reason: 'duplicate' };

  const statusLabels = {
    approved: 'Approved ✓',
    rejected: 'Rejected',
    underReview: 'Under Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending'
  };
  const label = statusLabels[newStatus] || newStatus;

  const result = await sendEmail({
    to,
    subject: `Claim Update: ${label} — ${itemTitle}`,
    preheader: `Your claim for "${itemTitle}" has been updated.`,
    title: `Claim Status Update`,
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>Your ownership claim for <strong>${itemTitle}</strong> has been updated.</p>
      <p><strong>New Status:</strong> ${label}</p>
      <p>Please log in to the campus portal to view the full details and any required actions.</p>
    `,
    actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-claims`,
    actionLabel: 'View My Claims',
    dedupKey
  });

  return result;
};

/**
 * Send email for return scheduling
 */
const sendReturnScheduledEmail = async ({ to, recipientName, itemTitle, scheduledDate, returnId }) => {
  const dedupKey = `return_scheduled:${to}:${returnId}`;
  if (isRecentlySent(dedupKey)) return { skipped: true, reason: 'duplicate' };

  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
    : 'To be confirmed';

  const result = await sendEmail({
    to,
    subject: `Return Scheduled — ${itemTitle}`,
    preheader: `Your return for "${itemTitle}" is scheduled.`,
    title: 'Return Appointment Scheduled',
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>A return appointment has been scheduled for your item: <strong>${itemTitle}</strong>.</p>
      <p><strong>Scheduled Date/Time:</strong> ${dateStr}</p>
      <p>Please arrive on time and bring your student ID for identity verification.</p>
    `,
    actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-returns`,
    actionLabel: 'View Return Details',
    dedupKey
  });

  return result;
};

/**
 * Send return reminder email
 */
const sendReturnReminderEmail = async ({ to, recipientName, itemTitle, scheduledDate, returnId, reminderType }) => {
  const dedupKey = `return_reminder:${to}:${returnId}:${reminderType}`;
  if (isRecentlySent(dedupKey)) return { skipped: true, reason: 'duplicate' };

  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'soon';

  const result = await sendEmail({
    to,
    subject: `Reminder: Return appointment for ${itemTitle} is ${reminderType}`,
    preheader: `Don't miss your return appointment for "${itemTitle}".`,
    title: 'Return Appointment Reminder',
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>This is a reminder that your return appointment for <strong>${itemTitle}</strong> is coming up.</p>
      <p><strong>Scheduled:</strong> ${dateStr}</p>
      <p>Please arrive on time with your student ID.</p>
    `,
    actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-returns`,
    actionLabel: 'View Return Details',
    dedupKey
  });

  return result;
};

/**
 * Send security alert email
 */
const sendSecurityAlertEmail = async ({ to, recipientName, alertMessage }) => {
  const dedupKey = `security_alert:${to}:${alertMessage.slice(0, 50)}`;
  if (isRecentlySent(dedupKey)) return { skipped: true, reason: 'duplicate' };

  const result = await sendEmail({
    to,
    subject: `Security Alert — Campus Lost & Found`,
    preheader: 'A security event was detected on your account.',
    title: '⚠ Security Alert',
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>A security event has been detected related to your campus account:</p>
      <p style="padding:12px;background:#1e1e2e;border-radius:6px;color:#fca5a5;">${alertMessage}</p>
      <p>If you did not initiate this action, please contact campus administration immediately.</p>
    `,
    dedupKey
  });

  return result;
};

/**
 * Send important announcement email
 */
const sendAnnouncementEmail = async ({ to, recipientName, announcementTitle, announcementMessage, announcementId }) => {
  const dedupKey = `announcement:${to}:${announcementId}`;
  if (isRecentlySent(dedupKey)) return { skipped: true, reason: 'duplicate' };

  const result = await sendEmail({
    to,
    subject: `Campus Notice: ${announcementTitle}`,
    preheader: announcementMessage.slice(0, 100),
    title: announcementTitle,
    bodyHtml: `
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>${announcementMessage.replace(/\n/g, '<br>')}</p>
    `,
    actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/notifications`,
    actionLabel: 'View in Portal',
    dedupKey
  });

  return result;
};

// ----- Core Send Function -----

/**
 * Core email sending function.
 * NEVER throws — failures are logged but do not propagate to callers.
 *
 * @param {object} opts
 * @param {string} opts.to - recipient email
 * @param {string} opts.subject
 * @param {string} opts.preheader
 * @param {string} opts.title - email heading
 * @param {string} opts.bodyHtml - inner HTML content
 * @param {string|null} opts.actionUrl
 * @param {string|null} opts.actionLabel
 * @param {string|null} opts.dedupKey - if provided, marks as sent after success
 * @returns {{ sent: boolean, error?: string, skipped?: boolean }}
 */
const sendEmail = async ({
  to,
  subject,
  preheader = '',
  title,
  bodyHtml,
  actionUrl = null,
  actionLabel = null,
  dedupKey = null
}) => {
  if (!to || !subject || !bodyHtml) {
    console.warn('[EmailService] Missing required fields: to, subject, bodyHtml');
    return { sent: false, error: 'Missing required fields' };
  }

  const html = buildEmailHtml({ title, preheader, bodyHtml, actionUrl, actionLabel });
  const fromAddress = process.env.EMAIL_FROM || `Campus Lost & Found <noreply@campus.edu>`;

  // Check if SMTP is configured
  const t = await initTransporter();

  if (!t) {
    // LOG_ONLY mode
    console.log(`[EmailService LOG_ONLY] Would send email:`);
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Title: ${title}`);
    if (dedupKey) markSent(dedupKey);
    return { sent: false, logOnly: true };
  }

  try {
    await t.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: `${title}\n\n${bodyHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()}\n\nVisit: ${actionUrl || 'Campus Portal'}`
    });

    if (dedupKey) markSent(dedupKey);
    console.log(`[EmailService] Email sent to ${to}: ${subject}`);
    return { sent: true };
  } catch (err) {
    console.error(`[EmailService] Failed to send to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
};

export const EmailService = {
  sendEmail,
  sendClaimStatusEmail,
  sendReturnScheduledEmail,
  sendReturnReminderEmail,
  sendSecurityAlertEmail,
  sendAnnouncementEmail
};

export default EmailService;
