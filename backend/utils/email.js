
const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn("⚠️ RESEND_API_KEY is missing. Emails will not be sent.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const sendVerificationEmail = async (email, token) => {
  if (!resend) {
    console.warn("Skipping email send: RESEND_API_KEY is missing.");
    return false; 
  }

  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FindStreak <onboarding@resend.dev>', // Use verified domain in production
      to: [email],
      subject: 'Verify your email for FindStreak',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to FindStreak!</h2>
          <p>Please verify your email address to complete your registration by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email sending failed:', err);
    return false;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  if (!resend) {
    console.warn("Skipping email send: RESEND_API_KEY is missing.");
    return false; 
  }

  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FindStreak <noreply@findstreak.com>', 
      to: [email],
      subject: 'Reset your password for FindStreak',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email sending failed:', err);
    return false;
  }
};


const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!resend) {
    console.warn("Skipping contact email: RESEND_API_KEY is missing.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FindStreak <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'support@findstreak.com'],
      reply_to: email,
      subject: `[FindStreak Contact] ${subject || 'New Message'} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">New Contact Form Submission</h2>
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            <tr><td style="padding:8px; font-weight:bold; color:#555; width:100px;">Name</td><td style="padding:8px;">${name}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px; font-weight:bold; color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#555;">Topic</td><td style="padding:8px;">${subject || 'Not specified'}</td></tr>
          </table>
          <div style="margin-top:20px; padding:16px; background:#f9fafb; border-left:4px solid #0d9488; border-radius:4px;">
            <p style="font-weight:bold; color:#555; margin:0 0 8px;">Message:</p>
            <p style="margin:0; white-space:pre-wrap; color:#333;">${message}</p>
          </div>
          <p style="margin-top:20px; font-size:12px; color:#999;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending contact email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Contact email failed:', err);
    return false;
  }
};

const sendWeeklyStreakEmail = async ({ email, name, streak }) => {
  if (!resend) {
    console.warn("Skipping weekly email: RESEND_API_KEY is missing.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FindStreak <onboarding@resend.dev>',
      to: [email],
      subject: 'Keep your FindStreak alive! 🔥',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0d9488; text-align: center;">Ready to level up, ${name}?</h2>
          <div style="text-align: center; margin: 30px 0;">
             <p style="font-size: 16px; color: #475569;">You currently have a</p>
             <h1 style="font-size: 48px; color: #f59e0b; margin: 10px 0;">${streak} Day</h1>
             <p style="font-size: 16px; color: #475569; font-weight: bold;">Learning Streak!</p>
          </div>
          <p style="color: #334155; line-height: 1.6;">Consistency is the key to mastering your career path. Log in today to complete a learning node, finish a project, or do a quick quiz to keep your fire burning!</p>
          <div style="text-align: center; margin-top: 30px;">
             <a href="https://findstreak.com/dashboard" style="display: inline-block; padding: 14px 28px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Jump back in</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">You are receiving this email because you registered on FindStreak.com.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending weekly email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Weekly email failed:', err);
    return false;
  }
};

const sendDailyScheduleEmail = async ({ email, name, freeTime }) => {
  if (!resend) {
    console.warn("Skipping daily email: RESEND_API_KEY is missing.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FindStreak <onboarding@resend.dev>',
      to: [email],
      subject: `Your Daily Learning Schedule Reminder — FindStreak`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0d9488; text-align: center;">Daily Learning Schedule</h2>
          <div style="text-align: center; margin: 30px 0;">
             <p style="font-size: 16px; color: #475569;">This is your automated daily reminder. You have scheduled dedicated learning time today during the following hours:</p>
             <h1 style="font-size: 32px; color: #f59e0b; margin: 15px 0;">${freeTime}</h1>
             <p style="font-size: 16px; color: #475569;">Consistency is the key to career advancement. Log in to your workspace to continue your progress.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
             <a href="https://findstreak.com/dashboard" style="display: inline-block; padding: 14px 28px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Dashboard</a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending daily email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Daily email failed:', err);
    return false;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendContactEmail, sendWeeklyStreakEmail, sendDailyScheduleEmail };

