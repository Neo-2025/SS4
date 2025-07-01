// ===================================================
// MSSD: Examine Display Name Lookup Tables
// Goal: Understand structure of master_display_names & spatial_display_names_master
// These contain the pre-calculated "locked down" pivot display names
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

async function examineLookupTables() {
  console.log('🔍 MSSD: Examining Display Name Lookup Tables');
  console.log('📋 Understanding pre-calculated pivot display name structure...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Examine master_display_names structure
    console.log('\n📋 Step 1: master_display_names Structure');
    const masterColsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'master_display_names'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ master_display_names Columns:');
    masterColsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Sample master_display_names data
    console.log('\n📋 Step 2: master_display_names Sample Data');
    const masterSampleResult = await client.query(`
      SELECT * FROM master_display_names 
      WHERE hrr IN ('385', '397', '412', '413', '417')
      ORDER BY hrr, hsa
      LIMIT 10
    `);
    
    console.log('✅ master_display_names Sample:');
    masterSampleResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}:`);
      Object.keys(row).forEach(key => {
        console.log(`     • ${key}: ${row[key]}`);
      });
      console.log('');
    });
    
    // Examine spatial_display_names_master structure
    console.log('\n📋 Step 3: spatial_display_names_master Structure');
    const spatialColsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'spatial_display_names_master'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ spatial_display_names_master Columns:');
    spatialColsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Sample spatial_display_names_master data
    console.log('\n📋 Step 4: spatial_display_names_master Sample Data');
    const spatialSampleResult = await client.query(`
      SELECT * FROM spatial_display_names_master 
      WHERE hrr IN ('385', '397', '412', '413', '417')
      ORDER BY hrr, compass_area_id
      LIMIT 10
    `);
    
    console.log('✅ spatial_display_names_master Sample:');
    spatialSampleResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}:`);
      Object.keys(row).forEach(key => {
        console.log(`     • ${key}: ${row[key]}`);
      });
      console.log('');
    });
    
    // Check if we can match with mv_client_spatial_foundation
    console.log('\n📋 Step 5: Lookup Table Matching Analysis');
    const matchResult = await client.query(`
      SELECT 
        mcsf.hrr,
        mcsf.hsa,
        mcsf.compass_area_id,
        mcsf.market_name,
        mdn.hrr_display_name,
        mdn.hsa_display_name,
        sdnm.display_name as compass_display_name
      FROM mv_client_spatial_foundation mcsf
      LEFT JOIN master_display_names mdn 
        ON mcsf.hrr = mdn.hrr AND mcsf.hsa = mdn.hsa
      LEFT JOIN spatial_display_names_master sdnm 
        ON mcsf.compass_area_id = sdnm.compass_area_id
      WHERE mcsf.agency_ccn = '457050'
      ORDER BY mcsf.hrr, mcsf.hsa
      LIMIT 5
    `);
    
    console.log('✅ Lookup Table Matching Results:');
    matchResult.rows.forEach((row, i) => {
      console.log(`   Row ${i+1}:`);
      console.log(`     • HRR ${row.hrr} HSA ${row.hsa}: ${row.market_name}`);
      console.log(`     • HRR Display: "${row.hrr_display_name}"`);
      console.log(`     • HSA Display: "${row.hsa_display_name}"`);
      console.log(`     • Compass Display: "${row.compass_display_name}"`);
      console.log(`     • Compass Area: ${row.compass_area_id}`);
      console.log('');
    });
    
    // Check for coverage completeness
    console.log('\n📋 Step 6: Coverage Completeness Check');
    const coverageResult = await client.query(`
      SELECT 
        COUNT(*) as total_mv_rows,
        COUNT(mdn.hrr_display_name) as matched_hrr_names,
        COUNT(mdn.hsa_display_name) as matched_hsa_names,
        COUNT(sdnm.display_name) as matched_compass_names
      FROM mv_client_spatial_foundation mcsf
      LEFT JOIN master_display_names mdn 
        ON mcsf.hrr = mdn.hrr AND mcsf.hsa = mdn.hsa
      LEFT JOIN spatial_display_names_master sdnm 
        ON mcsf.compass_area_id = sdnm.compass_area_id
    `);
    
    const coverage = coverageResult.rows[0];
    console.log('✅ Lookup Coverage Analysis:');
    console.log(`   • Total MV rows: ${coverage.total_mv_rows}`);
    console.log(`   • HRR name matches: ${coverage.matched_hrr_names}/${coverage.total_mv_rows}`);
    console.log(`   • HSA name matches: ${coverage.matched_hsa_names}/${coverage.total_mv_rows}`);
    console.log(`   • Compass name matches: ${coverage.matched_compass_names}/${coverage.total_mv_rows}`);
    
    console.log('\n🎯 MSSD Lookup Table Analysis Complete');
    console.log('📋 Ready to build proper V1-compatible flat file with lookup joins');
    
  } catch (error) {
    console.error('❌ MSSD Lookup Analysis Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Lookup Analysis
examineLookupTables()
  .then(() => {
    console.log('\n🏆 MSSD Lookup Analysis Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 MSSD Lookup Analysis Failed:', error.message);
    process.exit(1);
  }); 