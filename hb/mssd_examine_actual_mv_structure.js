// ===================================================
// MSSD: Examine Actual MV Structure vs Proven V1 Results
// Goal: Identify what columns actually exist vs what we need
// Compare with proven USS_2.3.results.md JSON structure
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

async function examineActualMVStructure() {
  console.log('🔍 MSSD: Examining Actual mv_client_spatial_foundation Structure');
  console.log('📋 Comparing with proven V1 JSON results structure...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Get actual column structure
    console.log('\n📋 Step 1: Actual MV Column Structure');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mv_client_spatial_foundation'
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Actual MV Columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Get sample data to see actual values
    console.log('\n📋 Step 2: Sample Data Structure');
    const sampleResult = await client.query(`
      SELECT * FROM mv_client_spatial_foundation 
      WHERE agency_ccn = '457050' 
      ORDER BY hrr, hsa LIMIT 3
    `);
    
    console.log('✅ Sample Row Structure:');
    if (sampleResult.rows.length > 0) {
      const sampleRow = sampleResult.rows[0];
      Object.keys(sampleRow).forEach(key => {
        console.log(`   • ${key}: ${sampleRow[key]} (${typeof sampleRow[key]})`);
      });
    }
    
    // Check for V1 proven columns that might be missing
    console.log('\n📋 Step 3: V1 Proven Columns Check');
    const v1ProvenColumns = [
      'ind_agency_pop',
      'ind_intersection_pop', 
      'ind_c_percent_num',
      'ind_c_percent_denom',
      'grp_o_client_pop_weighted',
      'grp_agency_pop',
      'grp_intersection_pop_weighted',
      'grp_c_percent_num',
      'grp_c_percent_denom',
      'star',
      'act',
      'epsd',
      'agencies_in_group',
      'generated_at'
    ];
    
    const actualColumns = columnsResult.rows.map(r => r.column_name);
    
    console.log('✅ V1 Proven Columns Analysis:');
    v1ProvenColumns.forEach(col => {
      const exists = actualColumns.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
    
    // Check compass_sort_order values
    console.log('\n📋 Step 4: Compass Sort Order Analysis');
    const compassResult = await client.query(`
      SELECT 
        compass_area_id,
        compass_sort_order,
        COUNT(*) as row_count
      FROM mv_client_spatial_foundation
      GROUP BY compass_area_id, compass_sort_order
      ORDER BY compass_area_id
    `);
    
    console.log('✅ Compass Sort Order Values:');
    compassResult.rows.forEach(row => {
      console.log(`   • ${row.compass_area_id}: sort_order=${row.compass_sort_order} (${row.row_count} rows)`);
    });
    
    // Check existing display names format
    console.log('\n📋 Step 5: Existing Display Names Format Analysis');
    const displayResult = await client.query(`
      SELECT 
        compass_area_id,
        compass_display_name,
        market_name,
        COUNT(*) as examples
      FROM mv_client_spatial_foundation
      GROUP BY compass_area_id, compass_display_name, market_name
      ORDER BY compass_area_id
      LIMIT 10
    `);
    
    console.log('✅ Existing Display Name Formats:');
    displayResult.rows.forEach(row => {
      console.log(`   • ${row.compass_area_id}: "${row.compass_display_name}" | Market: ${row.market_name}`);
    });
    
    console.log('\n🎯 MSSD Analysis Complete');
    console.log('📋 Ready to reconstruct proper V1-compatible query');
    
  } catch (error) {
    console.error('❌ MSSD Analysis Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Analysis
examineActualMVStructure()
  .then(() => {
    console.log('\n🏆 MSSD Analysis Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 MSSD Analysis Failed:', error.message);
    process.exit(1);
  }); 