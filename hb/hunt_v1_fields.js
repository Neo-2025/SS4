const { Client } = require('pg');

const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function huntV1Fields() {
  try {
    await client.connect();
    console.log('🔍 HUNTING V1 CALCULATION FIELDS...');
    
    // Hunt for tables with V1 field patterns
    const v1Fields = [
      'individual_c_percent', 'hsa_coverage_percentage', 'agencies_in_group',
      'ind_c_percent_num', 'ind_c_percent_denom', 'grp_c_percent_num', 'grp_c_percent_denom',
      'ind_o_client_pop', 'ind_agency_pop', 'ind_intersection_pop',
      'grp_o_client_pop_weighted', 'grp_agency_pop', 'grp_intersection_pop_weighted',
      'user_group_sort', 'data_source', 'generated_at'
    ];
    
    console.log('\n🎯 Searching for V1 fields across ALL tables...');
    
    for (const field of v1Fields) {
      const result = await client.query(`
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE column_name = '${field}'
        AND table_schema = 'public'
      `);
      
      if (result.rows.length > 0) {
        console.log(`✅ FOUND ${field}:`);
        result.rows.forEach(row => {
          console.log(`   • ${row.table_name}.${row.column_name}`);
        });
      } else {
        console.log(`❌ MISSING: ${field}`);
      }
    }
    
    // Hunt for client/competitor related tables
    console.log('\n🔍 Searching for client/competitor tables...');
    const competitorSearch = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND (table_name ILIKE '%client%' 
           OR table_name ILIKE '%competitor%' 
           OR table_name ILIKE '%c_percent%'
           OR table_name ILIKE '%foundation%'
           OR table_name ILIKE '%discovery%')
      ORDER BY table_name
    `);
    
    console.log('📋 Client/Competitor related tables:');
    competitorSearch.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    // Hunt for all materialized views
    console.log('\n🔍 Searching ALL materialized views...');
    const mvSearch = await client.query(`
      SELECT schemaname, matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'public'
      ORDER BY matviewname
    `);
    
    console.log('📋 All Materialized Views:');
    mvSearch.rows.forEach(row => {
      console.log(`   • ${row.matviewname}`);
    });
    
    // Check if any MVs have the V1 fields
    for (const mv of mvSearch.rows) {
      try {
        const mvColumns = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${mv.matviewname}'
          AND column_name IN ('individual_c_percent', 'ind_c_percent_num', 'agencies_in_group')
        `);
        
        if (mvColumns.rows.length > 0) {
          console.log(`🎯 POTENTIAL MATCH: ${mv.matviewname} has V1 fields:`);
          mvColumns.rows.forEach(col => {
            console.log(`     • ${col.column_name}`);
          });
        }
      } catch (e) {
        // Skip if error
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

huntV1Fields(); 