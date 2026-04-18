const cron = require('node-cron');
const pool = require('../config/db');
const { sendDailyScheduleEmail } = require('../utils/email');

console.log('⏰ Initializing Daily Schedule Reminder Cron Job (Runs every day at 9AM)...');

// '0 9 * * *' -> Every day at 9:00 AM server time
cron.schedule('0 9 * * *', async () => {
  console.log('🚀 Running Daily Schedule Reminder Job...');
  try {
    const client = await pool.connect();
    
    // Fetch users with email to send reminders
    const usersRes = await client.query(`
      SELECT id, name, username, email, free_time_schedule
      FROM users 
      WHERE email IS NOT NULL AND daily_email_enabled = true
    `);
    const users = usersRes.rows;

    let successCount = 0;
    for (const user of users) {
       const sent = await sendDailyScheduleEmail({
         email: user.email,
         name: user.name || user.username || 'Developer'
       });
       if (sent) successCount++;
    }

    client.release();
    console.log(`✅ Daily Schedule Job complete. Sent ${successCount}/${users.length} emails.`);
  } catch (err) {
    console.error('❌ Error running Daily Schedule Job:', err);
  }
});

module.exports = true;
