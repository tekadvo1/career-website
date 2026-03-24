const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'supportfindstreak@tekadvo.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an HTML email notification to the admin.
 * Non-blocking — errors are logged but don't crash the request.
 */
const notifyAdmin = async (subject, body) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return; // silently skip in dev
  try {
    await transporter.sendMail({
      from: `"FindStreak Platform" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `[FindStreak] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f8fafc;padding:24px;border-radius:12px">
          <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:16px 20px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
            <div style="background:white;border-radius:8px;padding:6px;display:inline-block">
              <div style="width:20px;height:20px;background:linear-gradient(135deg,#059669,#0d9488);border-radius:4px"></div>
            </div>
            <div>
              <div style="color:white;font-weight:900;font-size:16px;letter-spacing:-0.3px">FindStreak Admin Alert</div>
              <div style="color:rgba(255,255,255,0.7);font-size:11px">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</div>
            </div>
          </div>
          <div style="background:white;border-radius:8px;padding:20px;border:1px solid #e2e8f0">
            ${body}
          </div>
          <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px">
            FindStreak Admin · <a href="https://findstreak.com/admindashboard" style="color:#10b981">Open Dashboard</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[AdminNotify] Email failed:', err.message);
  }
};

// ── Pre-built notification templates ─────────────────────────────────────────

const notifyNewUser = (username, email, method = 'email') => {
  notifyAdmin(
    `🆕 New User Signup: ${username}`,
    `
    <h3 style="margin:0 0 12px;color:#0f172a">New User Registered</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;color:#64748b;font-size:13px;width:120px">Username</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${username}</td></tr>
      <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Email</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${email}</td></tr>
      <tr><td style="padding:8px;color:#64748b;font-size:13px">Method</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${method}</td></tr>
      <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Time</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${new Date().toLocaleString()}</td></tr>
    </table>
    `
  );
};

const notifyNewFeedback = (username, email, message, pagePath) => {
  notifyAdmin(
    `💬 New Feedback Received`,
    `
    <h3 style="margin:0 0 12px;color:#0f172a">User Submitted Feedback</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;color:#64748b;font-size:13px;width:120px">From</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${username} &lt;${email}&gt;</td></tr>
      <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Page</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${pagePath || 'Unknown'}</td></tr>
    </table>
    <div style="margin-top:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px">
      <p style="margin:0;color:#166534;font-size:13px;line-height:1.6">${message}</p>
    </div>
    <div style="margin-top:12px">
      <a href="https://findstreak.com/admindashboard" style="display:inline-block;padding:8px 16px;background:#059669;color:white;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700">View in Dashboard →</a>
    </div>
    `
  );
};

const notifyServerError = (route, errorMessage, stack) => {
  notifyAdmin(
    `🚨 Server Error Detected`,
    `
    <h3 style="margin:0 0 12px;color:#dc2626">Server Error</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;color:#64748b;font-size:13px;width:120px">Route</td><td style="padding:8px;font-weight:700;color:#dc2626;font-size:13px">${route}</td></tr>
      <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;font-size:13px">Error</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${errorMessage}</td></tr>
      <tr><td style="padding:8px;color:#64748b;font-size:13px">Time</td><td style="padding:8px;font-weight:700;color:#0f172a;font-size:13px">${new Date().toLocaleString()}</td></tr>
    </table>
    ${stack ? `<pre style="margin-top:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;font-size:11px;overflow:auto;max-height:200px;color:#7f1d1d">${stack.substring(0, 600)}</pre>` : ''}
    `
  );
};

module.exports = { notifyAdmin, notifyNewUser, notifyNewFeedback, notifyServerError };
