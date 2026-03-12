const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway" });

async function check() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  res.rows.forEach(r => console.log('table:', r.table_name));
  process.exit(0);
}
check();
