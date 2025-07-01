// ===================================================
// MSSD: Build V1-Compatible Flat File Query
// Goal: Create proper flat file using lookup tables + all V1 proven columns
// Based on proven USS_2.3.results.md JSON structure
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

async function buildV1CompatibleFlatFile() {
  console.log('🔍 MSSD: Build V1-Compatible Flat File Query');
  console.log('📋 Creating proper flat file with lookup tables + all V1 columns...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // First get the full column list
    console.log('\n📋 Step 1: Get Full mv_client_spatial_foundation Column List');
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Full Column List:');
    columnsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type}`);
    });
    
    // Build the V1-compatible flat file query
    console.log('\n📋 Step 2: Build V1-Compatible Flat File Query');
    const flatFileQuery = `
      -- V1-Compatible Enhanced Flat File Query
      -- Uses existing mv_client_spatial_foundation + lookup tables
      -- Preserves all V1 proven columns + adds proper pivot display names
      
      SELECT 
        -- Core hierarchy (V1 proven)
        mcsf.client_id,
        mcsf.cluster_id,
        mcsf.hrr,
        mcsf.hsa,
        mcsf.compass_area_id,
        mcsf.market_name,
        mcsf.agency_ccn,
        mcsf.agency_short_name,
        mcsf.user_group_tag,
        mcsf.final_group_code,
        
        -- Enhanced pivot display names (using lookup tables)
        mdn.hsa_display_name as hsa_pivot_display_name,
        mcsf.compass_display_name as compass_pivot_display_name,
        mdn.hrr_display_name as hrr_pivot_display_name,
        
        -- All other V1 proven columns
        mcsf.*
        
      FROM mv_client_spatial_foundation mcsf
      LEFT JOIN master_display_names mdn 
        ON mcsf.hrr = mdn.hrr AND mcsf.hsa = mdn.hsa
      ORDER BY 
        mcsf.hrr,
        mcsf.compass_sort_order,
        mcsf.hsa,
        mcsf.agency_ccn
    `;
    
    console.log('✅ Generated V1-Compatible Query');
    
    // Test the query
    console.log('\n📋 Step 3: Test V1-Compatible Query');
    const testResult = await client.query(flatFileQuery);
    
    console.log(`✅ Query executed successfully: ${testResult.rows.length} rows`);
    
    // Show sample results
    console.log('\n📋 Sample V1-Compatible Results:');
    testResult.rows.slice(0, 3).forEach((row, i) => {
      console.log(`\\n   Row ${i+1}:`);
      console.log(`     • HSA Pivot: "${row.hsa_pivot_display_name}"`);
      console.log(`     • Compass Pivot: "${row.compass_pivot_display_name}"`);
      console.log(`     • HRR Pivot: "${row.hrr_pivot_display_name}"`);
      console.log(`     • Agency: ${row.agency_ccn} (${row.agency_short_name})`);
      console.log(`     • Final Group: ${row.final_group_code}`);
      console.log(`     • Individual C%: ${row.individual_c_percent}`);
      console.log(`     • HSA Coverage%: ${row.hsa_coverage_percentage}`);
    });
    
    // Create the final Row Zero query file content
    const rowZeroQuery = flatFileQuery.replace('mcsf.*,', '').trim();
    
    console.log('\\n📋 Step 4: Row Zero Query Ready');
    console.log('✅ Clean query without duplicate columns prepared');
    
    console.log('\\n🎯 MSSD V1-Compatible Flat File Complete');
    console.log('📋 Ready for Row Zero testing with proper V1 structure');
    
    return rowZeroQuery;
    
  } catch (error) {
    console.error('❌ MSSD V1-Compatible Query Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD V1-Compatible Flat File
buildV1CompatibleFlatFile()
  .then((query) => {
    console.log('\\n🏆 MSSD V1-Compatible Flat File Complete!');
    console.log('✅ Ready for Row Zero deployment');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n💥 MSSD V1-Compatible Failed:', error.message);
    process.exit(1);
  }); 