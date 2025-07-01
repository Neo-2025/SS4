// ===================================================
// MSSD: Inspect Exact Lookup Values
// Goal: Report exact values in master_display_names for our HRRs
// Need to verify actual HRR display name format vs incorrect assumptions
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

async function inspectExactLookupValues() {
  console.log('🔍 MSSD: Inspect Exact Lookup Values');
  console.log('📋 Reporting actual values for HRRs 385, 397, 412, 413, 417...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Get exact HRR display names for our target HRRs
    console.log('\n📋 Step 1: Exact HRR Display Names in master_display_names');
    const hrrResult = await client.query(`
      SELECT DISTINCT 
        hrr,
        hrr_display_name,
        hrrcity,
        hrrstate,
        hrr_full_name
      FROM master_display_names 
      WHERE hrr IN ('385', '397', '412', '413', '417')
      ORDER BY hrr
    `);
    
    console.log('✅ Exact HRR Display Names Found:');
    hrrResult.rows.forEach(row => {
      console.log(`   • HRR ${row.hrr}:`);
      console.log(`     - hrr_display_name: "${row.hrr_display_name}"`);
      console.log(`     - hrrcity: "${row.hrrcity}"`);
      console.log(`     - hrrstate: "${row.hrrstate}"`);
      console.log(`     - hrr_full_name: "${row.hrr_full_name}"`);
      console.log('');
    });
    
    // Get exact HSA display names for our client agencies (sample)
    console.log('\n📋 Step 2: Exact HSA Display Names for Client HSAs');
    const hsaResult = await client.query(`
      SELECT DISTINCT 
        mdn.hrr,
        mdn.hsa,
        mdn.hsa_display_name,
        mdn.hsacity,
        mdn.hsa_full_name,
        mcsf.market_name,
        mcsf.agency_ccn
      FROM master_display_names mdn
      INNER JOIN mv_client_spatial_foundation mcsf 
        ON mdn.hrr = mcsf.hrr AND mdn.hsa = mcsf.hsa
      WHERE mcsf.agency_ccn IN ('457050', '457126')
      ORDER BY mdn.hrr, mdn.hsa
    `);
    
    console.log('✅ Exact HSA Display Names for Client:');
    hsaResult.rows.forEach(row => {
      console.log(`   • HRR ${row.hrr} HSA ${row.hsa} (${row.market_name}):`);
      console.log(`     - hsa_display_name: "${row.hsa_display_name}"`);
      console.log(`     - hsacity: "${row.hsacity}"`);
      console.log(`     - hsa_full_name: "${row.hsa_full_name}"`);
      console.log(`     - agency: ${row.agency_ccn}`);
      console.log('');
    });
    
    // Check what compass display names actually exist in our MV
    console.log('\n📋 Step 3: Exact Compass Display Names in MV');
    const compassResult = await client.query(`
      SELECT DISTINCT 
        compass_area_id,
        compass_display_name,
        hrr,
        market_name
      FROM mv_client_spatial_foundation
      WHERE agency_ccn IN ('457050', '457126')
      ORDER BY hrr, compass_area_id
    `);
    
    console.log('✅ Exact Compass Display Names in MV:');
    compassResult.rows.forEach(row => {
      console.log(`   • HRR ${row.hrr} (${row.market_name}) - ${row.compass_area_id}:`);
      console.log(`     - compass_display_name: "${row.compass_display_name}"`);
      console.log('');
    });
    
    // Check if spatial_display_names_master has any relevant data
    console.log('\n📋 Step 4: Check spatial_display_names_master for COMPASS level');
    const spatialCompassResult = await client.query(`
      SELECT * FROM spatial_display_names_master 
      WHERE hierarchy_level = 'COMPASS'
      ORDER BY display_name
      LIMIT 10
    `);
    
    console.log('✅ spatial_display_names_master COMPASS Sample:');
    spatialCompassResult.rows.forEach(row => {
      console.log(`   • "${row.display_name}" | density: ${row.density_dd}`);
    });
    
    // Summary of actual formats found
    console.log('\n🎯 SUMMARY: Actual Lookup Value Formats');
    console.log('===================================================');
    
    if (hrrResult.rows.length > 0) {
      console.log('✅ HRR Display Name Format Examples:');
      hrrResult.rows.slice(0, 3).forEach(row => {
        console.log(`   • HRR ${row.hrr}: "${row.hrr_display_name}"`);
      });
    }
    
    if (hsaResult.rows.length > 0) {
      console.log('✅ HSA Display Name Format Examples:');
      hsaResult.rows.slice(0, 5).forEach(row => {
        console.log(`   • HSA ${row.hsa}: "${row.hsa_display_name}"`);
      });
    }
    
    if (compassResult.rows.length > 0) {
      console.log('✅ Compass Display Name Format Examples:');
      compassResult.rows.slice(0, 5).forEach(row => {
        console.log(`   • ${row.compass_area_id}: "${row.compass_display_name}"`);
      });
    }
    
    console.log('\n📋 Ready to correct any wrong format assumptions');
    
  } catch (error) {
    console.error('❌ MSSD Inspection Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Inspection
inspectExactLookupValues()
  .then(() => {
    console.log('\n🏆 MSSD Exact Lookup Inspection Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 MSSD Inspection Failed:', error.message);
    process.exit(1);
  }); 