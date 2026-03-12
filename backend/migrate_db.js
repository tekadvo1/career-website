const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway" });

async function migrate() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(10)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT");
    console.log('Migration successful');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}
migrate();
