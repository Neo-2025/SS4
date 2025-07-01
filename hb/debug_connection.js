const { Client } = require('pg');

const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function debug() {
  try {
    await client.connect();
    console.log('✅ Connected to:', await client.query('SELECT current_database(), current_user'));
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'mv_client_spatial_foundation'
    `);
    console.log('Table exists:', tableCheck.rows);
    
    // Try direct query
    const dataCheck = await client.query('SELECT * FROM mv_client_spatial_foundation LIMIT 3');
    console.log('Sample data:', dataCheck.rows.length, 'rows');
    if (dataCheck.rows.length > 0) {
      console.log('First row keys:', Object.keys(dataCheck.rows[0]));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

debug(); 