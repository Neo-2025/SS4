const { Client } = require('pg');

async function testPoolerConnection() {
  // Try the session pooler as fallback
  const client = new Client({
    connectionString: 'postgresql://cursor_ai:CursorAI2025@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=disable'
  });

  try {
    await client.connect();
    console.log('✅ MSSD Pooler Connection: OPERATIONAL');
    
    // Test basic query
    const result = await client.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log(`✅ Database Access: ${result.rows[0].count} public tables found`);
    
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ MSSD Pooler Connection: FAILED -', err.message);
    return false;
  }
}

testPoolerConnection(); 