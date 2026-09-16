require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../database/migrations/08_add_tech_stack_and_workflow_storage.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration successful');
  } catch(e) {
    console.error('Migration failed', e);
  } finally {
    pool.end();
  }
}

run();
