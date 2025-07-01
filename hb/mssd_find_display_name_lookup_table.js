// ===================================================
// MSSD: Find Display Name Lookup Table
// Goal: Locate the lookup table with pre-calculated pivot display names
// These should be the "locked down" names we worked hard to achieve
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

async function findDisplayNameLookupTable() {
  console.log('🔍 MSSD: Finding Display Name Lookup Table');
  console.log('📋 Searching for pre-calculated pivot display names...');
  
  try {
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Search for tables with "display" or "pivot" in name
    console.log('\n📋 Step 1: Search for Display/Pivot Tables');
    const tablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND (table_name ILIKE '%display%' 
             OR table_name ILIKE '%pivot%'
             OR table_name ILIKE '%lookup%'
             OR table_name ILIKE '%reference%')
      ORDER BY table_name
    `);
    
    console.log('✅ Display/Pivot Related Tables:');
    tablesResult.rows.forEach(table => {
      console.log(`   • ${table.table_name} (${table.table_type})`);
    });
    
    // Search for tables with HSA, Compass, HRR references
    console.log('\n📋 Step 2: Search for HSA/Compass/HRR Reference Tables');
    const geoTablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND (table_name ILIKE '%hsa%' 
             OR table_name ILIKE '%compass%'
             OR table_name ILIKE '%hrr%')
      ORDER BY table_name
    `);
    
    console.log('✅ Geographic Reference Tables:');
    geoTablesResult.rows.forEach(table => {
      console.log(`   • ${table.table_name} (${table.table_type})`);
    });
    
    // Look for any table with display_name columns
    console.log('\n📋 Step 3: Search for Tables with Display Name Columns');
    const displayColumnsResult = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
        AND column_name ILIKE '%display%'
      ORDER BY table_name, column_name
    `);
    
    console.log('✅ Tables with Display Name Columns:');
    displayColumnsResult.rows.forEach(col => {
      console.log(`   • ${col.table_name}.${col.column_name} (${col.data_type})`);
    });
    
    // Check if there's a specific pivot or lookup table in h3_index
    console.log('\n📋 Step 4: Check h3_index for Display Names');
    const h3IndexResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'h3_index'
        AND (column_name ILIKE '%display%' 
             OR column_name ILIKE '%pivot%'
             OR column_name ILIKE '%name%')
      ORDER BY column_name
    `);
    
    console.log('✅ h3_index Display/Name Columns:');
    h3IndexResult.rows.forEach(col => {
      console.log(`   • h3_index.${col.column_name} (${col.data_type})`);
    });
    
    // Sample h3_index data to see naming patterns
    if (h3IndexResult.rows.length > 0) {
      console.log('\n📋 Step 5: Sample h3_index Display Names');
      const h3SampleResult = await client.query(`
        SELECT hrr, hsa, compass_area_id, market_name,
               ${h3IndexResult.rows.map(r => r.column_name).join(', ')}
        FROM h3_index 
        WHERE hrr IN ('385', '397', '412', '413', '417')
        ORDER BY hrr, compass_area_id, hsa
        LIMIT 10
      `);
      
      console.log('✅ Sample h3_index Display Names:');
      h3SampleResult.rows.forEach((row, i) => {
        console.log(`   Row ${i+1}:`);
        Object.keys(row).forEach(key => {
          console.log(`     • ${key}: ${row[key]}`);
        });
        console.log('');
      });
    }
    
    // Look for any materialized views with display names
    console.log('\n📋 Step 6: Check Other MVs for Display Names');
    const mvResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_type = 'VIEW'
        AND table_name ILIKE 'mv_%'
      ORDER BY table_name
    `);
    
    console.log('✅ All Materialized Views:');
    for (const mv of mvResult.rows) {
      console.log(`   • ${mv.table_name}`);
      
      // Check if this MV has display columns
      const mvColsResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = $1
          AND column_name ILIKE '%display%'
      `, [mv.table_name]);
      
      if (mvColsResult.rows.length > 0) {
        console.log(`     ✅ Has display columns: ${mvColsResult.rows.map(r => r.column_name).join(', ')}`);
      }
    }
    
    console.log('\n🎯 MSSD Lookup Table Discovery Complete');
    console.log('📋 Ready to identify the proper lookup/reference table');
    
  } catch (error) {
    console.error('❌ MSSD Lookup Discovery Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute MSSD Lookup Discovery
findDisplayNameLookupTable()
  .then(() => {
    console.log('\n🏆 MSSD Lookup Discovery Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 MSSD Lookup Discovery Failed:', error.message);
    process.exit(1);
  }); 