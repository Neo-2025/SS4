const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
  });

  try {
    await client.connect();
    console.log('✅ MSSD Connection: OPERATIONAL');
    
    // Test basic query
    const result = await client.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log(`✅ Database Access: ${result.rows[0].count} public tables found`);
    
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ MSSD Connection: FAILED -', err.message);
    return false;
  }
}

testConnection(); 