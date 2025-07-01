// ===================================================
// MSSD: Check actual structure of existing mv_client_spatial_foundation
// Compare with our YUSS specification requirements
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

async function checkExistingMVStructure() {
  console.log('🔍 MSSD: Checking existing mv_client_spatial_foundation structure');
  console.log('📋 Comparing with YUSS specification requirements...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Get actual column structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Existing MV structure:');
    columnsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Get sample row to understand data
    const sampleResult = await client.query(`
      SELECT * 
      FROM mv_client_spatial_foundation
      LIMIT 1
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('✅ Sample row data:');
      const row = sampleResult.rows[0];
      Object.keys(row).forEach(key => {
        console.log(`   • ${key}: ${JSON.stringify(row[key])}`);
      });
    }
    
    // Check what our YUSS spec expects vs what exists
    console.log('📋 YUSS Specification Gap Analysis:');
    
    const expectedFields = [
      'client_id', 'cluster_id', 'hrr', 'hsa', 'compass_area_id', 
      'compass_direction', 'market_name', 'agency_ccn', 'agency_short_name',
      'user_group_tag', 'final_group_code', 'hsa_population'
    ];
    
    const actualFields = columnsResult.rows.map(col => col.column_name);
    
    expectedFields.forEach(field => {
      if (actualFields.includes(field)) {
        console.log(`   ✅ ${field}: EXISTS`);
      } else {
        console.log(`   ❌ ${field}: MISSING`);
      }
    });
    
    // Check for extra fields not in our spec
    actualFields.forEach(field => {
      if (!expectedFields.includes(field)) {
        console.log(`   📋 ${field}: EXTRA (not in YUSS spec)`);
      }
    });
    
    // Get basic statistics
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_rows,
        COUNT(DISTINCT agency_ccn) as unique_agencies,
        COUNT(DISTINCT hrr) as unique_hrrs,
        COUNT(DISTINCT hsa) as unique_hsas
      FROM mv_client_spatial_foundation
    `);
    
    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      console.log('📊 Data Statistics:');
      console.log(`   • Total rows: ${stats.total_rows}`);
      console.log(`   • Unique agencies: ${stats.unique_agencies}`);
      console.log(`   • Unique HRRs: ${stats.unique_hrrs}`);
      console.log(`   • Unique HSAs: ${stats.unique_hsas}`);
    }
    
    console.log('🎯 Recommendations based on findings:');
    
    if (actualFields.includes('compass_direction')) {
      console.log('✅ MV matches YUSS-002 spec - ready for YUSS-003 pivot names');
    } else {
      console.log('📋 MV needs enhancement to match YUSS-002 spec');
      console.log('💡 Options:');
      console.log('   1. Refresh existing MV with correct schema');
      console.log('   2. Create mv_client_spatial_foundation_enhanced per YUSS-003');
      console.log('   3. Add missing columns via ALTER (if supported)');
    }
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute check
checkExistingMVStructure()
  .then(() => {
    console.log('🏆 MV Structure Check Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Structure Check Failed:', error.message);
    process.exit(1);
  }); 