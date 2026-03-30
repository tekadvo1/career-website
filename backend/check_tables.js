const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway' });
client.connect()
  .then(() => client.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\';'))
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); client.end(); })
  .catch(e => { console.error(e); client.end(); });
