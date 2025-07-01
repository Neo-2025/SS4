const { Client } = require('pg');

const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function checkPromisingMVs() {
  try {
    await client.connect();
    console.log('🎯 CHECKING PROMISING MVs FOR V1 FIELDS...');
    
    const targetMVs = [
      'mv_client_dfc465a2_baseline',
      'mv_client_discovery_foundation', 
      'mv_executive_flat_file_final',
      'mv_hh_executive_flat_file_complete',
      'mv_hh_executive_flat_file'
    ];
    
    const v1Fields = [
      'individual_c_percent', 'hsa_coverage_percentage', 'agencies_in_group',
      'ind_c_percent_num', 'ind_c_percent_denom', 'grp_c_percent_num', 'grp_c_percent_denom',
      'user_group_sort', 'data_source'
    ];
    
    for (const mvName of targetMVs) {
      console.log(`\n🔍 Checking ${mvName}...`);
      
      try {
        // Get all columns
        const allColumns = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${mvName}'
          ORDER BY ordinal_position
        `);
        
        if (allColumns.rows.length === 0) {
          console.log('❌ No columns found (table may not exist)');
          continue;
        }
        
        console.log(`📋 Total columns: ${allColumns.rows.length}`);
        
        // Check for V1 fields
        const v1FieldsFound = [];
        const allColumnNames = allColumns.rows.map(r => r.column_name);
        
        v1Fields.forEach(field => {
          if (allColumnNames.includes(field)) {
            v1FieldsFound.push(field);
          }
        });
        
        if (v1FieldsFound.length > 0) {
          console.log(`🎯 V1 FIELDS FOUND (${v1FieldsFound.length}/${v1Fields.length}):`);
          v1FieldsFound.forEach(field => {
            console.log(`   ✅ ${field}`);
          });
          
          // Get sample data
          const sampleData = await client.query(`SELECT * FROM ${mvName} LIMIT 3`);
          console.log(`📊 Sample data: ${sampleData.rows.length} rows`);
          
          if (sampleData.rows.length > 0) {
            const firstRow = sampleData.rows[0];
            console.log('   Sample values:');
            v1FieldsFound.forEach(field => {
              console.log(`     • ${field}: ${firstRow[field]}`);
            });
          }
        } else {
          console.log('❌ No V1 calculation fields found');
        }
        
        // Show key columns anyway
        console.log('📋 Key columns:', allColumnNames.slice(0, 10).join(', ') + '...');
        
      } catch (error) {
        console.log(`❌ Error checking ${mvName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPromisingMVs(); 