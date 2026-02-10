
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

module.exports = { sendVerificationEmail };
