// ===================================================
// MSSD: Discover Actual MV Columns
// Goal: Get actual field names to avoid amnesia, build proper SQL
// Use YUSS spec HRR format "AUSTI-0.4" not lookup table "TX-AUSTI"
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

async function discoverActualMVColumns() {
  console.log('🔍 MSSD: Discover Actual MV Columns');
  console.log('📋 Getting exact field names to avoid amnesia...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Get exact column names and types
    console.log('\n📋 Step 1: Discover Actual mv_client_spatial_foundation Columns');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Actual Column Names:');
    const actualColumns = [];
    columnsResult.rows.forEach(col => {
      actualColumns.push(col.column_name);
      console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Check for V1 proven columns existence
    console.log('\n📋 Step 2: Check V1 Proven Columns Existence');
    const v1ExpectedColumns = [
      'client_id', 'cluster_id', 'hrr', 'hsa', 'compass_area_id', 'market_name',
      'agency_ccn', 'agency_short_name', 'user_group_tag', 'final_group_code',
      'agencies_in_group', 'star', 'act', 'epsd', 'h3_cell_count',
      'ind_o_client_pop', 'ind_agency_pop', 'ind_intersection_pop',
      'ind_c_percent_num', 'ind_c_percent_denom',
      'grp_o_client_pop_weighted', 'grp_agency_pop', 'grp_intersection_pop_weighted',
      'grp_c_percent_num', 'grp_c_percent_denom',
      'individual_c_percent', 'hsa_coverage_percentage',
      'compass_sort_order', 'user_group_sort', 'data_source', 'generated_at',
      'compass_display_name'
    ];
    
    console.log('✅ V1 Column Existence Check:');
    const existingColumns = [];
    const missingColumns = [];
    
    v1ExpectedColumns.forEach(col => {
      if (actualColumns.includes(col)) {
        existingColumns.push(col);
        console.log(`   ✅ ${col}: EXISTS`);
      } else {
        missingColumns.push(col);
        console.log(`   ❌ ${col}: MISSING`);
      }
    });
    
    // Sample data to understand values
    console.log('\n📋 Step 3: Sample Data Analysis');
    const sampleResult = await client.query(`
      SELECT * FROM mv_client_spatial_foundation 
      WHERE agency_ccn = '457050'
      ORDER BY hrr, hsa 
      LIMIT 3
    `);
    
    console.log('✅ Sample Data Structure:');
    if (sampleResult.rows.length > 0) {
      const sampleRow = sampleResult.rows[0];
      console.log('   First Row Fields:');
      Object.keys(sampleRow).forEach(key => {
        console.log(`     • ${key}: ${sampleRow[key]} (${typeof sampleRow[key]})`);
      });
    }
    
    // Build proper SQL using only existing columns
    console.log('\n📋 Step 4: Build Proper SQL with Actual Columns');
    
    const sqlQuery = `
      SELECT 
        -- Core hierarchy (actual existing columns)
        ${existingColumns.includes('client_id') ? 'mcsf.client_id,' : '-- client_id missing'}
        ${existingColumns.includes('cluster_id') ? 'mcsf.cluster_id,' : '-- cluster_id missing'}
        ${existingColumns.includes('hrr') ? 'mcsf.hrr,' : '-- hrr missing'}
        ${existingColumns.includes('hsa') ? 'mcsf.hsa,' : '-- hsa missing'}
        ${existingColumns.includes('compass_area_id') ? 'mcsf.compass_area_id,' : '-- compass_area_id missing'}
        ${existingColumns.includes('market_name') ? 'mcsf.market_name,' : '-- market_name missing'}
        ${existingColumns.includes('agency_ccn') ? 'mcsf.agency_ccn,' : '-- agency_ccn missing'}
        ${existingColumns.includes('agency_short_name') ? 'mcsf.agency_short_name,' : '-- agency_short_name missing'}
        ${existingColumns.includes('user_group_tag') ? 'mcsf.user_group_tag,' : '-- user_group_tag missing'}
        ${existingColumns.includes('final_group_code') ? 'mcsf.final_group_code,' : '-- final_group_code missing'}
        
        -- YUSS-003 Pivot Display Names (correct spec format)
        mdn.hsa_display_name as hsa_pivot_display_name,
        ${existingColumns.includes('compass_display_name') ? 'mcsf.compass_display_name as compass_pivot_display_name,' : '-- compass_display_name missing'}
        
        -- HRR Display: YUSS spec "AUSTI-0.4" format (NOT lookup table "TX-AUSTI")
        UPPER(LEFT(${existingColumns.includes('market_name') ? 'mcsf.market_name' : "'Unknown'"}, 5)) || '-' || 
        ROUND(COALESCE(${existingColumns.includes('h3_cell_count') ? 'mcsf.h3_cell_count' : '0'}, 0) / 10000.0, 1) as hrr_pivot_display_name,
        
        -- V1 proven metrics (only existing columns)
        ${existingColumns.includes('star') ? 'mcsf.star,' : '-- star missing'}
        ${existingColumns.includes('act') ? 'mcsf.act,' : '-- act missing'}
        ${existingColumns.includes('epsd') ? 'mcsf.epsd,' : '-- epsd missing'}
        ${existingColumns.includes('h3_cell_count') ? 'mcsf.h3_cell_count,' : '-- h3_cell_count missing'}
        ${existingColumns.includes('individual_c_percent') ? 'mcsf.individual_c_percent,' : '-- individual_c_percent missing'}
        ${existingColumns.includes('hsa_coverage_percentage') ? 'mcsf.hsa_coverage_percentage,' : '-- hsa_coverage_percentage missing'}
        ${existingColumns.includes('compass_sort_order') ? 'mcsf.compass_sort_order,' : '-- compass_sort_order missing'}
        ${existingColumns.includes('data_source') ? 'mcsf.data_source' : '-- data_source missing'}
        
      FROM mv_client_spatial_foundation mcsf
      LEFT JOIN master_display_names mdn 
        ON mcsf.hrr = mdn.hrr AND mcsf.hsa = mdn.hsa
      ORDER BY 
        mcsf.hrr,
        ${existingColumns.includes('compass_sort_order') ? 'mcsf.compass_sort_order' : 'mcsf.compass_area_id'},
        mcsf.hsa,
        mcsf.agency_ccn
    `;
    
    console.log('✅ Generated SQL with Actual Columns');
    
    // Test the SQL
    console.log('\n📋 Step 5: Test SQL with Actual Columns');
    const testResult = await client.query(sqlQuery);
    
    console.log(`✅ SQL executed successfully: ${testResult.rows.length} rows`);
    
    // Show sample with correct YUSS HRR format
    console.log('\n📋 Sample Results with YUSS Spec HRR Format:');
    testResult.rows.slice(0, 3).forEach((row, i) => {
      console.log(`\\n   Row ${i+1}:`);
      console.log(`     • HSA Pivot: "${row.hsa_pivot_display_name}"`);
      console.log(`     • Compass Pivot: "${row.compass_pivot_display_name}"`);
      console.log(`     • HRR Pivot: "${row.hrr_pivot_display_name}" (YUSS spec format ✅)`);
      console.log(`     • Agency: ${row.agency_ccn} (${row.agency_short_name || 'N/A'})`);
      console.log(`     • Market: ${row.market_name}`);
    });
    
    console.log('\\n🎯 MSSD Column Discovery Complete');
    console.log('📋 Ready to build final Row Zero query with actual columns + YUSS spec');
    
    return { actualColumns, existingColumns, missingColumns, sqlQuery };
    
  } catch (error) {
    console.error('❌ MSSD Column Discovery Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Column Discovery
discoverActualMVColumns()
  .then((result) => {
    console.log('\\n🏆 MSSD Column Discovery Complete!');
    console.log(`✅ Found ${result.existingColumns.length} existing columns`);
    console.log(`❌ Missing ${result.missingColumns.length} expected columns`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n💥 MSSD Column Discovery Failed:', error.message);
    process.exit(1);
  }); 