const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function examineExistingMVs() {
  try {
    await client.connect();
    console.log('🔍 MSSD Examining Existing V1 Materialized Views');
    
    // 1. Check if mv_client_spatial_foundation actually has data
    const mvClientSpatialData = await client.query(`
      SELECT 
        COUNT(*) as total_rows,
        COUNT(DISTINCT agency_ccn) as unique_agencies,
        COUNT(DISTINCT hrr) as covered_hrrs,
        string_agg(DISTINCT user_group_tag, ', ') as group_tags,
        string_agg(DISTINCT agency_ccn, ', ') as ccns
      FROM mv_client_spatial_foundation
    `);
    
    console.log('\n📊 MV_CLIENT_SPATIAL_FOUNDATION DATA STATUS:');
    const mvData = mvClientSpatialData.rows[0];
    console.log(`  - Total rows: ${mvData.total_rows}`);
    console.log(`  - Unique agencies: ${mvData.unique_agencies}`);
    console.log(`  - Covered HRRs: ${mvData.covered_hrrs}`);
    console.log(`  - Group tags: ${mvData.group_tags}`);
    console.log(`  - CCNs: ${mvData.ccns}`);
    
    if (mvData.total_rows > 0) {
      // Sample the data to understand structure
      const mvSample = await client.query(`
        SELECT *
        FROM mv_client_spatial_foundation
        LIMIT 3
      `);
      
      console.log('\n  Sample rows:');
      mvSample.rows.forEach((row, index) => {
        console.log(`    Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    // 2. Check mv_client_discovery_foundation
    const mvDiscoveryData = await client.query(`
      SELECT 
        COUNT(*) as total_rows,
        string_agg(DISTINCT client_id, ', ') as client_ids,
        string_agg(DISTINCT cluster_id, ', ') as cluster_ids
      FROM mv_client_discovery_foundation
    `);
    
    console.log('\n📊 MV_CLIENT_DISCOVERY_FOUNDATION DATA STATUS:');
    const discoveryData = mvDiscoveryData.rows[0];
    console.log(`  - Total rows: ${discoveryData.total_rows}`);
    console.log(`  - Client IDs: ${discoveryData.client_ids}`);
    console.log(`  - Cluster IDs: ${discoveryData.cluster_ids}`);
    
    if (discoveryData.total_rows > 0) {
      const discoverySample = await client.query(`
        SELECT *
        FROM mv_client_discovery_foundation
        LIMIT 2
      `);
      
      console.log('\n  Sample rows:');
      discoverySample.rows.forEach((row, index) => {
        console.log(`    Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    // 3. Get the actual definition of mv_client_spatial_foundation to understand V1's approach
    const mvDefinition = await client.query(`
      SELECT definition
      FROM pg_matviews
      WHERE matviewname = 'mv_client_spatial_foundation'
    `);
    
    if (mvDefinition.rows.length > 0) {
      console.log('\n🔧 MV_CLIENT_SPATIAL_FOUNDATION DEFINITION:');
      const definition = mvDefinition.rows[0].definition;
      
      // Extract key parts of the definition
      const lines = definition.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('457050') || 
        line.includes('457126') || 
        line.includes('user_group_tag') ||
        line.includes('WHERE') ||
        line.includes('FROM') ||
        line.includes('SELECT')
      ).slice(0, 15);
      
      console.log('  Key definition lines:');
      relevantLines.forEach(line => {
        console.log(`    ${line.trim()}`);
      });
    }
    
    // 4. Get the actual definition of mv_client_discovery_foundation
    const discoveryDefinition = await client.query(`
      SELECT definition
      FROM pg_matviews
      WHERE matviewname = 'mv_client_discovery_foundation'
    `);
    
    if (discoveryDefinition.rows.length > 0) {
      console.log('\n🔧 MV_CLIENT_DISCOVERY_FOUNDATION DEFINITION:');
      const definition = discoveryDefinition.rows[0].definition;
      
      // Extract key parts
      const lines = definition.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('457050') || 
        line.includes('457126') || 
        line.includes('cluster') ||
        line.includes('WHERE') ||
        line.includes('FROM') ||
        line.includes('SELECT')
      ).slice(0, 15);
      
      console.log('  Key definition lines:');
      relevantLines.forEach(line => {
        console.log(`    ${line.trim()}`);
      });
    }
    
    // 5. Test if the existing MVs work with the V1 flat file pattern
    if (mvData.total_rows > 0) {
      console.log('\n🧪 TESTING V1 FLAT FILE COMPATIBILITY:');
      
      const v1FlatFileTest = await client.query(`
        SELECT 
          'V1_FLAT_FILE_TEST' as test_type,
          user_group_tag,
          COUNT(*) as row_count,
          COUNT(DISTINCT agency_ccn) as unique_agencies,
          COUNT(DISTINCT hrr) as covered_hrrs,
          string_agg(DISTINCT market_name, ', ') as markets
        FROM mv_client_spatial_foundation
        GROUP BY user_group_tag
        ORDER BY user_group_tag
      `);
      
      console.log('  V1 flat file test results:');
      v1FlatFileTest.rows.forEach(row => {
        console.log(`    - ${row.user_group_tag}: ${row.row_count} rows, ${row.unique_agencies} agencies, ${row.covered_hrrs} HRRs, Markets: ${row.markets}`);
      });
    }
    
    await client.end();
    console.log('\n🚀 MSSD Existing MVs Examination Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

examineExistingMVs(); 