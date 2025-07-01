const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function checkExistingMVs() {
  try {
    await client.connect();
    console.log('🔍 Examining Existing V1 Materialized Views');
    
    // 1. Check mv_client_spatial_foundation
    console.log('\n📈 MV_CLIENT_SPATIAL_FOUNDATION:');
    
    const clientMVCount = await client.query('SELECT COUNT(*) as row_count FROM mv_client_spatial_foundation');
    console.log(`  Rows: ${clientMVCount.rows[0].row_count}`);
    
    if (clientMVCount.rows[0].row_count > 0) {
      const clientMVSample = await client.query(`
        SELECT 
          user_group_tag,
          agency_ccn,
          agency_short_name,
          hrr,
          hsa,
          market_name,
          compass_area_id,
          compass_direction
        FROM mv_client_spatial_foundation 
        LIMIT 3
      `);
      
      console.log('  Sample data:');
      clientMVSample.rows.forEach((row, i) => {
        console.log(`    Row ${i+1}: CCN ${row.agency_ccn} | ${row.agency_short_name} | ${row.market_name} | ${row.hrr}-${row.hsa} | ${row.compass_area_id}`);
      });
    }
    
    // 2. Check mv_client_discovery_foundation
    console.log('\n📊 MV_CLIENT_DISCOVERY_FOUNDATION:');
    
    const discoveryMVCount = await client.query('SELECT COUNT(*) as row_count FROM mv_client_discovery_foundation');
    console.log(`  Rows: ${discoveryMVCount.rows[0].row_count}`);
    
    if (discoveryMVCount.rows[0].row_count > 0) {
      const discoveryMVSample = await client.query(`
        SELECT 
          client_id,
          cluster_id,
          cluster_hrr_array,
          client_total_population
        FROM mv_client_discovery_foundation 
        LIMIT 2
      `);
      
      console.log('  Sample data:');
      discoveryMVSample.rows.forEach((row, i) => {
        console.log(`    Row ${i+1}: ${row.client_id} | Cluster: ${row.cluster_id} | HRRs: ${row.cluster_hrr_array} | Pop: ${row.client_total_population}`);
      });
    }
    
    // 3. Check other promising MVs
    console.log('\n🎯 OTHER RELEVANT MVs:');
    
    const otherMVs = ['mv_hh_executive_flat_file', 'mv_client_dfc465a2_baseline'];
    
    for (const mvName of otherMVs) {
      try {
        const mvCount = await client.query(`SELECT COUNT(*) as row_count FROM ${mvName}`);
        console.log(`  ${mvName}: ${mvCount.rows[0].row_count} rows`);
        
        if (mvCount.rows[0].row_count > 0 && mvCount.rows[0].row_count <= 100) {
          const mvColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${mvName}'
            ORDER BY ordinal_position
            LIMIT 10
          `);
          
          console.log(`    Columns: ${mvColumns.rows.map(r => r.column_name).join(', ')}`);
        }
      } catch (err) {
        console.log(`    ${mvName}: Error - ${err.message}`);
      }
    }
    
    await client.end();
    console.log('\n🚀 MSSD MV Examination Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

checkExistingMVs(); 