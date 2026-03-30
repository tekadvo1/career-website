const { Client } = require('pg');
const fs = require('fs');
const client = new Client({ connectionString: 'postgresql://postgres:iXbjqloBGLwGCkoTNFEaPdmurPgePsrR@caboose.proxy.rlwy.net:31652/railway' });
client.connect()
  .then(() => client.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\';'))
  .then(res => { 
    fs.writeFileSync('tables.json', JSON.stringify(res.rows, null, 2), 'utf8');
    client.end(); 
  })
  .catch(e => { console.error(e); client.end(); });
