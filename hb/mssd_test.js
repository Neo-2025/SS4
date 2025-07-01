const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function discoverSchema() {
  try {
    await client.connect();
    console.log('✅ MSSD Operational - Zero Schema Amnesia Active');
    
    // 1. Count total tables
    const tableCount = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📊 Total Public Tables: ${tableCount.rows[0].table_count}`);
    
    // 2. Find client agency related tables
    const clientTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%client%' OR table_name ILIKE '%agency%' OR table_name ILIKE '%org%')
      ORDER BY table_name
    `);
    console.log('\n🏢 CLIENT/AGENCY RELATED TABLES:');
    clientTables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // 3. Check agency_geozip_coverage structure
    const geozipStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'agency_geozip_coverage'
      ORDER BY ordinal_position
    `);
    console.log('\n🗺️ AGENCY_GEOZIP_COVERAGE STRUCTURE:');
    if (geozipStructure.rows.length > 0) {
      geozipStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('  ❌ Table not found');
    }
    
    // 4. Check for HRR boundary/connectivity data in h3_index
    const h3Structure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'h3_index'
      AND (column_name ILIKE '%hrr%' OR column_name ILIKE '%compass%' OR column_name ILIKE '%hsa%')
      ORDER BY ordinal_position
    `);
    console.log('\n🗺️ H3_INDEX HRR/SPATIAL FIELDS:');
    h3Structure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // 5. Sample data to understand current state
    const sampleAgencies = await client.query(`
      SELECT ccn, array_length(geozip_array, 1) as territory_size
      FROM agency_geozip_coverage 
      LIMIT 5
    `);
    console.log('\n📊 SAMPLE TERRITORIAL COVERAGE:');
    sampleAgencies.rows.forEach(row => {
      console.log(`  - CCN ${row.ccn}: ${row.territory_size} geozips`);
    });
    
    await client.end();
    console.log('\n🚀 MSSD Schema Discovery Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

discoverSchema(); 