require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='interview_guides' AND column_name='answers_data';
    `);
    if (res.rows.length === 0) {
      console.log('answers_data column not found, adding it...');
      await pool.query(`ALTER TABLE interview_guides ADD COLUMN answers_data JSONB DEFAULT '{}'::jsonb`);
      console.log('Added answers_data column.');
    } else {
      console.log('answers_data column already exists.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
