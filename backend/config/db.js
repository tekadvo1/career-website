const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Debug connection details (omit sensitive info)
if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log(`Attempting to connect to database at: ${dbUrl.hostname}:${dbUrl.port} (DB: ${dbUrl.pathname.split('/')[1]})`);
  } catch (e) {
    console.log('DATABASE_URL is set but could not be parsed for logging.');
  }
} else {
  console.error('DATABASE_URL environment variable is NOT set!');
}

module.exports = pool;
