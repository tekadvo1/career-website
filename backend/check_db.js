const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway" });

async function check() {
  const res = await pool.query("SELECT role_title FROM role_analyses WHERE role_title ILIKE '%mainframe%' LIMIT 5");
  res.rows.forEach(r => console.log('Found:', `'${r.role_title}'`));
  process.exit(0);
}
check();
