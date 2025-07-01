const { Client } = require('pg');

const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('✅ ACTUAL COLUMNS in mv_client_spatial_foundation:');
    
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`  • ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema(); 