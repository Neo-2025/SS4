const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function discoverClientMechanism() {
  try {
    await client.connect();
    console.log('🔍 MSSD Deep Discovery - Client Assignment & HRR Connectivity');
    
    // 1. Find client agency assignment mechanism ("O" marking)
    const agencyGroups = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'agency_groups'
      ORDER BY ordinal_position
    `);
    console.log('\n👥 AGENCY_GROUPS TABLE STRUCTURE:');
    agencyGroups.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // 2. Sample agency groups data to understand "O" marking
    const sampleGroups = await client.query(`
      SELECT * FROM agency_groups 
      WHERE group_type = 'O' OR group_type ILIKE '%org%' OR group_type ILIKE '%client%'
      LIMIT 10
    `);
    console.log('\n🏢 SAMPLE CLIENT AGENCY ASSIGNMENTS:');
    if (sampleGroups.rows.length > 0) {
      sampleGroups.rows.forEach(row => {
        console.log(`  - CCN ${row.ccn}: Type=${row.group_type}, Name=${row.agency_name || 'N/A'}`);
      });
    } else {
      console.log('  ⚠️ No "O" type assignments found - checking all group types...');
      
      const allGroupTypes = await client.query(`
        SELECT DISTINCT group_type, COUNT(*) as count
        FROM agency_groups 
        GROUP BY group_type
        ORDER BY count DESC
      `);
      console.log('\n📊 ALL GROUP TYPES:');
      allGroupTypes.rows.forEach(row => {
        console.log(`  - ${row.group_type}: ${row.count} agencies`);
      });
    }
    
    // 3. Discover HRR connectivity via h3_index spatial relationships
    const hrrConnectivity = await client.query(`
      SELECT 
        hrr,
        COUNT(DISTINCT compass_area_id) as compass_areas,
        COUNT(DISTINCT hsa) as hsa_count,
        COUNT(*) as h3_cells
      FROM h3_index
      WHERE hrr IS NOT NULL
      GROUP BY hrr
      ORDER BY hrr
      LIMIT 10
    `);
    console.log('\n🗺️ HRR SPATIAL STRUCTURE (Sample):');
    hrrConnectivity.rows.forEach(row => {
      console.log(`  - HRR ${row.hrr}: ${row.compass_areas} compass areas, ${row.hsa_count} HSAs, ${row.h3_cells} H3 cells`);
    });
    
    // 4. Check for geographic boundary relationships 
    const spatialRelationships = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'h3_index'
      AND (column_name ILIKE '%neighbor%' OR column_name ILIKE '%boundary%' OR column_name ILIKE '%adjacent%')
    `);
    console.log('\n🔗 H3_INDEX BOUNDARY RELATIONSHIP FIELDS:');
    if (spatialRelationships.rows.length > 0) {
      spatialRelationships.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('  ⚠️ No explicit boundary fields found');
    }
    
    // 5. Test HRR boundary discovery via spatial proximity
    const hrrBoundaryTest = await client.query(`
      WITH hrr_compass_boundaries AS (
        SELECT 
          h1.hrr as hrr_a,
          h2.hrr as hrr_b,
          h1.compass_area_id as compass_a,
          h2.compass_area_id as compass_b,
          COUNT(*) as shared_boundaries
        FROM h3_index h1
        JOIN h3_index h2 ON h1.compass_area_id = h2.compass_area_id
        WHERE h1.hrr != h2.hrr
        AND h1.hrr IN ('385', '397', '412', '413', '417')  -- Texas cluster sample
        AND h2.hrr IN ('385', '397', '412', '413', '417')
        GROUP BY h1.hrr, h2.hrr, h1.compass_area_id, h2.compass_area_id
        HAVING COUNT(*) > 0
      )
      SELECT hrr_a, hrr_b, COUNT(*) as connection_points
      FROM hrr_compass_boundaries
      GROUP BY hrr_a, hrr_b
      ORDER BY hrr_a, hrr_b
    `);
    console.log('\n🔗 HRR CONNECTIVITY ANALYSIS (Texas Sample):');
    hrrBoundaryTest.rows.forEach(row => {
      console.log(`  - HRR ${row.hrr_a} ↔ HRR ${row.hrr_b}: ${row.connection_points} connection points`);
    });
    
    await client.end();
    console.log('\n🚀 MSSD Client & Connectivity Discovery Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

discoverClientMechanism(); 