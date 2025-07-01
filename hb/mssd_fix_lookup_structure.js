// ===================================================
// MSSD: Fix Lookup Structure Analysis
// Goal: Properly understand spatial_display_names_master structure and joins
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

async function fixLookupStructure() {
  console.log('🔍 MSSD: Fix Lookup Structure Analysis');
  console.log('📋 Understanding spatial_display_names_master proper structure...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Check spatial_display_names_master structure and data
    console.log('\n📋 Step 1: spatial_display_names_master Sample Data');
    const spatialSampleResult = await client.query(`
      SELECT * FROM spatial_display_names_master 
      ORDER BY id
      LIMIT 15
    `);
    
    console.log('✅ spatial_display_names_master Sample:');
    spatialSampleResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}: ${JSON.stringify(row)}`);
    });
    
    // Check what the hierarchy_level values are
    console.log('\n📋 Step 2: hierarchy_level Values');
    const hierarchyResult = await client.query(`
      SELECT hierarchy_level, COUNT(*) as count
      FROM spatial_display_names_master 
      GROUP BY hierarchy_level
      ORDER BY hierarchy_level
    `);
    
    console.log('✅ hierarchy_level Breakdown:');
    hierarchyResult.rows.forEach(row => {
      console.log(`   • ${row.hierarchy_level}: ${row.count} records`);
    });
    
    // Now check master_display_names properly with mv_client_spatial_foundation
    console.log('\n📋 Step 3: Proper master_display_names Join');
    const masterJoinResult = await client.query(`
      SELECT 
        mcsf.hrr,
        mcsf.hsa,
        mcsf.compass_area_id,
        mcsf.market_name,
        mcsf.agency_ccn,
        mcsf.agency_short_name,
        mdn.hsa_display_name,
        mdn.hrr_display_name,
        mdn.hsa_full_name,
        mdn.hrr_full_name
      FROM mv_client_spatial_foundation mcsf
      LEFT JOIN master_display_names mdn 
        ON mcsf.hrr = mdn.hrr AND mcsf.hsa = mdn.hsa
      WHERE mcsf.agency_ccn = '457050'
      ORDER BY mcsf.hrr, mcsf.hsa
      LIMIT 5
    `);
    
    console.log('✅ Proper master_display_names Join Results:');
    masterJoinResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}:`);
      console.log(`     • HRR ${row.hrr} HSA ${row.hsa}: ${row.market_name}`);
      console.log(`     • HSA Display: "${row.hsa_display_name}"`);
      console.log(`     • HRR Display: "${row.hrr_display_name}"`);
      console.log(`     • Agency: ${row.agency_ccn} (${row.agency_short_name})`);
      console.log(`     • Compass: ${row.compass_area_id}`);
      console.log('');
    });
    
    // Check if we need to use the existing compass_display_name from mv_client_spatial_foundation
    console.log('\n📋 Step 4: Check Existing Compass Display Names in MV');
    const compassCheckResult = await client.query(`
      SELECT 
        compass_area_id,
        compass_display_name,
        COUNT(*) as row_count
      FROM mv_client_spatial_foundation
      GROUP BY compass_area_id, compass_display_name
      ORDER BY compass_area_id
    `);
    
    console.log('✅ Existing Compass Display Names in MV:');
    compassCheckResult.rows.forEach(row => {
      console.log(`   • ${row.compass_area_id}: "${row.compass_display_name}" (${row.row_count} rows)`);
    });
    
    // Check mv_client_spatial_foundation for all V1 columns
    console.log('\n📋 Step 5: Check MV for All V1 Proven Columns');
    const mvColumnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ mv_client_spatial_foundation All Columns:');
    mvColumnsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n🎯 MSSD Lookup Structure Fix Complete');
    console.log('📋 Ready to build proper flat file query with correct joins');
    
  } catch (error) {
    console.error('❌ MSSD Fix Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Fix
fixLookupStructure()
  .then(() => {
    console.log('\n🏆 MSSD Lookup Structure Fix Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 MSSD Fix Failed:', error.message);
    process.exit(1);
  }); 