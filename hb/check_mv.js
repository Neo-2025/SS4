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
.then(() => client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'mv_hh_executive_flat_file_complete\' ORDER BY ordinal_position'))
.then(r => {
  console.log('mv_hh_executive_flat_file_complete columns:');
  r.rows.forEach(row => console.log('•', row.column_name));
})
.catch(e => console.log('Error:', e.message))
.finally(() => client.end()); 