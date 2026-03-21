const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway' });
pool.query("INSERT INTO rewards (title, description, xp_cost, reward_type) VALUES ('5 AI Generation Credits', 'Exchange 500 XP to get 5 more AI credits.', 500, 'ai_credits')")
  .then(() => { console.log('Added ai_credits reward'); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
