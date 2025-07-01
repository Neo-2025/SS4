const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function checkMVStructure() {
  try {
    await client.connect();
    console.log('🔍 Checking Existing MV Structure');
    
    // 1. Check actual structure of mv_client_spatial_foundation
    console.log('\n📈 MV_CLIENT_SPATIAL_FOUNDATION STRUCTURE:');
    
    const mvStructure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('  Columns:');
    mvStructure.rows.forEach(row => {
      console.log(`    - ${row.column_name}: ${row.data_type}`);
    });
    
    // 2. Sample the actual data
    const mvCount = await client.query('SELECT COUNT(*) as row_count FROM mv_client_spatial_foundation');
    console.log(`\n  Total rows: ${mvCount.rows[0].row_count}`);
    
    if (mvCount.rows[0].row_count > 0) {
      const mvSample = await client.query('SELECT * FROM mv_client_spatial_foundation LIMIT 2');
      
      console.log('\n  Sample data:');
      mvSample.rows.forEach((row, i) => {
        console.log(`    Row ${i+1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    // 3. Check mv_client_discovery_foundation structure
    console.log('\n📊 MV_CLIENT_DISCOVERY_FOUNDATION STRUCTURE:');
    
    const discoveryStructure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'mv_client_discovery_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('  Columns:');
    discoveryStructure.rows.forEach(row => {
      console.log(`    - ${row.column_name}: ${row.data_type}`);
    });
    
    const discoveryCount = await client.query('SELECT COUNT(*) as row_count FROM mv_client_discovery_foundation');
    console.log(`\n  Total rows: ${discoveryCount.rows[0].row_count}`);
    
    if (discoveryCount.rows[0].row_count > 0) {
      const discoverySample = await client.query('SELECT * FROM mv_client_discovery_foundation LIMIT 1');
      
      console.log('\n  Sample data:');
      discoverySample.rows.forEach((row, i) => {
        console.log(`    Row ${i+1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    await client.end();
    console.log('\n🚀 MSSD Structure Check Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

checkMVStructure(); 