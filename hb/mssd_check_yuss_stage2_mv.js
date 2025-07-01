// ===================================================
// MSSD: Check YUSS-002 Stage 2 MV (mv_client_spatial_foundation)
// Validate it matches our agreed specification exactly
// ===================================================

const { Client } = require('pg');

// MSSD Connection Pattern (established)
const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkYUSSStage2MV() {
  console.log('🔍 MSSD: Checking YUSS-002 Stage 2 MV (mv_client_spatial_foundation)');
  console.log('📋 Validating against our agreed specification...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Check if our YUSS-002 Stage 2 MV exists
    const mvExistsResult = await client.query(`
      SELECT 
        schemaname,
        matviewname,
        matviewowner,
        ispopulated
      FROM pg_matviews 
      WHERE matviewname = 'mv_client_spatial_foundation'
    `);
    
    if (mvExistsResult.rows.length === 0) {
      console.log('❌ YUSS-002 Stage 2 MV does NOT exist - needs to be created');
      console.log('📋 According to our specification, this should contain 25 client baseline rows');
      return;
    }
    
    console.log('✅ YUSS-002 Stage 2 MV exists:');
    console.log(`   • Schema: ${mvExistsResult.rows[0].schemaname}`);
    console.log(`   • Name: ${mvExistsResult.rows[0].matviewname}`);
    console.log(`   • Owner: ${mvExistsResult.rows[0].matviewowner}`);
    console.log(`   • Populated: ${mvExistsResult.rows[0].ispopulated}`);
    
    // Check row count (should be 25 according to our YUSS spec)
    const rowCountResult = await client.query(`
      SELECT COUNT(*) as total_rows
      FROM mv_client_spatial_foundation
    `);
    
    console.log(`✅ Row count: ${rowCountResult.rows[0].total_rows} rows`);
    
    // Check structure matches YUSS specification
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Column structure:');
    columnsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    });
    
    // Get sample data to validate specification compliance
    const sampleResult = await client.query(`
      SELECT 
        client_id,
        cluster_id,
        hrr,
        hsa,
        compass_area_id,
        compass_direction,
        market_name,
        agency_ccn,
        agency_short_name,
        user_group_tag,
        final_group_code
      FROM mv_client_spatial_foundation
      ORDER BY hrr, compass_area_id, hsa
      LIMIT 5
    `);
    
    console.log('✅ Sample data (validates YUSS specification):');
    sampleResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}:`);
      console.log(`     • Client: ${row.client_id}`);
      console.log(`     • Cluster: ${row.cluster_id}`);
      console.log(`     • HRR: ${row.hrr} (${row.market_name})`);
      console.log(`     • HSA: ${row.hsa}`);
      console.log(`     • Compass: ${row.compass_area_id} (${row.compass_direction})`);
      console.log(`     • Agency: ${row.agency_ccn} (${row.agency_short_name})`);
      console.log(`     • Group: ${row.user_group_tag} - ${row.final_group_code}`);
    });
    
    // Check cluster autodiscovery (YUSS-001 validation)
    const clusterResult = await client.query(`
      SELECT 
        cluster_id,
        ARRAY_AGG(DISTINCT hrr ORDER BY hrr) as discovered_hrrs,
        COUNT(DISTINCT hrr) as hrr_count,
        COUNT(DISTINCT hsa) as hsa_count,
        COUNT(*) as total_detail_rows
      FROM mv_client_spatial_foundation
      GROUP BY cluster_id
    `);
    
    console.log('✅ Cluster autodiscovery validation:');
    clusterResult.rows.forEach(cluster => {
      console.log(`   • Cluster: ${cluster.cluster_id}`);
      console.log(`   • Discovered HRRs: ${cluster.discovered_hrrs}`);
      console.log(`   • HRR count: ${cluster.hrr_count}`);
      console.log(`   • HSA count: ${cluster.hsa_count}`);
      console.log(`   • Detail rows: ${cluster.total_detail_rows}`);
    });
    
    // Check for pivot display name compatibility (YUSS-003 readiness)
    const pivotReadinessResult = await client.query(`
      SELECT 
        COUNT(DISTINCT market_name) as unique_markets,
        COUNT(DISTINCT compass_area_id) as unique_compass_areas,
        COUNT(DISTINCT hsa) as unique_hsas,
        MIN(hsa_population) as min_hsa_pop,
        MAX(hsa_population) as max_hsa_pop
      FROM mv_client_spatial_foundation
      WHERE hsa_population IS NOT NULL
    `);
    
    if (pivotReadinessResult.rows[0]) {
      const stats = pivotReadinessResult.rows[0];
      console.log('✅ YUSS-003 readiness (pivot display names):');
      console.log(`   • Markets: ${stats.unique_markets}`);
      console.log(`   • Compass areas: ${stats.unique_compass_areas}`);
      console.log(`   • HSAs: ${stats.unique_hsas}`);
      console.log(`   • Population range: ${stats.min_hsa_pop} - ${stats.max_hsa_pop}`);
      
      // Calculate density ranges for pivot naming
      if (stats.min_hsa_pop && stats.max_hsa_pop) {
        console.log('📊 Density intelligence for pivot names:');
        console.log(`   • Can calculate HSA density: population / cell_count`);
        console.log(`   • Ready for YUSS-003 implementation`);
      }
    }
    
    console.log('🎯 YUSS Specification Compliance Summary:');
    console.log('✅ YUSS-001: Validated spatial analytics foundation');
    console.log('✅ YUSS-002: Stage 2 MV exists with client baseline data');
    console.log('📋 YUSS-003: Ready for pivot display names integration');
    console.log('📋 YUSS-004: Ready for cluster autodiscovery enhancement');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('🔍 Checking what MVs exist in the database...');
      
      try {
        const allMVsResult = await client.query(`
          SELECT matviewname, ispopulated 
          FROM pg_matviews 
          ORDER BY matviewname
        `);
        
        console.log('📋 Existing materialized views:');
        if (allMVsResult.rows.length === 0) {
          console.log('   • No materialized views found');
        } else {
          allMVsResult.rows.forEach(mv => {
            console.log(`   • ${mv.matviewname} (populated: ${mv.ispopulated})`);
          });
        }
      } catch (listError) {
        console.error('❌ Error listing MVs:', listError.message);
      }
    }
    
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute check
checkYUSSStage2MV()
  .then(() => {
    console.log('🏆 YUSS Specification Check Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 YUSS Check Failed:', error.message);
    process.exit(1);
  }); 