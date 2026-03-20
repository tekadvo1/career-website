const cron = require('node-cron');
const pool = require('../config/db');
const { sendWeeklyStreakEmail } = require('../utils/email');

console.log('⏰ Initializing Weekly Streak Cron Job (Runs every Monday at 9AM)...');

// '0 9 * * 1' -> Every Monday at 9:00 AM server time
cron.schedule('0 9 * * 1', async () => {
  console.log('🚀 Running Weekly Streak Email Job...');
  try {
    const client = await pool.connect();
    
    // Fetch users with email to send reminders
    const usersRes = await client.query('SELECT id, name, username, email, current_streak FROM users WHERE email IS NOT NULL');
    const users = usersRes.rows;

    let successCount = 0;
    for (const user of users) {
       const sent = await sendWeeklyStreakEmail({
         email: user.email,
         name: user.name || user.username || 'Developer',
         streak: user.current_streak || 0
       });
       if (sent) successCount++;
    }

    client.release();
    console.log(`✅ Weekly Streak Job complete. Sent ${successCount}/${users.length} emails.`);
  } catch (err) {
    console.error('❌ Error running Weekly Streak Job:', err);
  }
});

module.exports = true;
