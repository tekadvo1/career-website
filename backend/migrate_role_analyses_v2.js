require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    // Check if schema_version exists
    let res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='role_analyses' AND column_name='schema_version';
    `);
    if (res.rows.length === 0) {
      console.log('schema_version column not found, adding it...');
      await pool.query(`ALTER TABLE role_analyses ADD COLUMN schema_version INTEGER DEFAULT 1`);
      console.log('Added schema_version column.');
    } else {
      console.log('schema_version column already exists.');
    }

    // Check if updated_at exists
    res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='role_analyses' AND column_name='updated_at';
    `);
    if (res.rows.length === 0) {
      console.log('updated_at column not found, adding it...');
      await pool.query(`ALTER TABLE role_analyses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      console.log('Added updated_at column.');
    } else {
      console.log('updated_at column already exists.');
    }

  } catch(e) {
    console.error('Migration failed:', e);
  } finally {
    pool.end();
  }
}
run();
