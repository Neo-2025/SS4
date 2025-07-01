const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function discoverV1AssignmentMechanism() {
  try {
    await client.connect();
    console.log('🔍 MSSD V1 Assignment Discovery - How did V1 handle client agency assignments?');
    
    // 1. First check the exact structure of agency_groups to understand the join
    const agencyGroupsStructure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'agency_groups'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 AGENCY_GROUPS STRUCTURE:');
    agencyGroupsStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // 2. Check agency_reference structure to understand the join relationship
    const agencyRefStructure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'agency_reference'
      AND (column_name = 'id' OR column_name = 'ccn')
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 AGENCY_REFERENCE KEY FIELDS:');
    agencyRefStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // 3. Look for any existing data in agency_groups (simple query first)
    const existingAssignments = await client.query(`
      SELECT * FROM agency_groups 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n📊 EXISTING AGENCY_GROUPS DATA:');
    if (existingAssignments.rows.length > 0) {
      existingAssignments.rows.forEach((row, index) => {
        console.log(`  ${index + 1}.`, JSON.stringify(row, null, 2));
      });
    } else {
      console.log('  ❌ No data found in agency_groups');
    }
    
    // 4. Check if mv_client_spatial_foundation exists
    const mvExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'mv_client_spatial_foundation'
      ) as mv_exists
    `);
    
    console.log(`\n📈 mv_client_spatial_foundation exists: ${mvExists.rows[0].mv_exists}`);
    
    if (mvExists.rows[0].mv_exists) {
      // Check MV structure
      const mvStructure = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'mv_client_spatial_foundation'
        ORDER BY ordinal_position
      `);
      
      console.log('\n  MV Structure:');
      mvStructure.rows.forEach(row => {
        console.log(`    - ${row.column_name}: ${row.data_type}`);
      });
      
      // Sample the MV data
      const mvSample = await client.query(`
        SELECT *
        FROM mv_client_spatial_foundation
        LIMIT 3
      `);
      
      console.log('\n  Sample MV data:');
      mvSample.rows.forEach((row, index) => {
        console.log(`    Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    // 5. Search for any materialized views that contain client CCNs
    const clientMVSearch = await client.query(`
      SELECT 
        schemaname,
        matviewname,
        definition
      FROM pg_matviews
      WHERE schemaname = 'public'
      ORDER BY matviewname
    `);
    
    console.log('\n🏗️ ALL MATERIALIZED VIEWS:');
    if (clientMVSearch.rows.length > 0) {
      clientMVSearch.rows.forEach(row => {
        console.log(`  - ${row.matviewname}`);
        
        // Check if this MV mentions our client CCNs
        if (row.definition && (
          row.definition.includes('457050') || 
          row.definition.includes('457126') ||
          row.definition.includes("'O'") ||
          row.definition.includes('group_type')
        )) {
          console.log('    ⭐ Contains client references!');
          
          // Extract relevant lines
          const relevantLines = row.definition
            .split('\n')
            .filter(line => 
              line.includes('457050') || 
              line.includes('457126') || 
              line.includes("'O'") ||
              line.includes('group_type')
            )
            .slice(0, 3);
          
          if (relevantLines.length > 0) {
            console.log('    Key lines:');
            relevantLines.forEach(line => {
              console.log(`      ${line.trim()}`);
            });
          }
        }
      });
    } else {
      console.log('  ❌ No materialized views found');
    }
    
    // 6. Look for hardcoded CCN references in any table with those CCNs
    const hardcodedCCNSearch = await client.query(`
      SELECT 
        COUNT(*) as ccn_457050_count
      FROM agency_reference
      WHERE ccn = '457050'
    `);
    
    const hardcodedCCNSearch2 = await client.query(`
      SELECT 
        COUNT(*) as ccn_457126_count
      FROM agency_reference
      WHERE ccn = '457126'
    `);
    
    console.log('\n🔍 CLIENT CCN VERIFICATION:');
    console.log(`  - CCN 457050 exists in agency_reference: ${hardcodedCCNSearch.rows[0].ccn_457050_count > 0 ? '✅' : '❌'}`);
    console.log(`  - CCN 457126 exists in agency_reference: ${hardcodedCCNSearch2.rows[0].ccn_457126_count > 0 ? '✅' : '❌'}`);
    
    await client.end();
    console.log('\n🚀 MSSD V1 Assignment Discovery Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

discoverV1AssignmentMechanism(); 