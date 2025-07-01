const { Client } = require('pg');
const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
.then(() => {
  console.log('Checking mv_client_discovery_foundation...');
  return client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'mv_client_discovery_foundation\' ORDER BY ordinal_position');
})
.then(r => {
  console.log('mv_client_discovery_foundation columns:');
  r.rows.forEach(row => console.log('•', row.column_name));
  
  // Check sample data
  return client.query('SELECT * FROM mv_client_discovery_foundation LIMIT 1');
})
.then(r => {
  if (r.rows.length > 0) {
    console.log('\nSample row keys:');
    Object.keys(r.rows[0]).forEach(key => console.log('•', key));
  }
})
.catch(e => console.log('Error:', e.message))
.finally(() => client.end()); 