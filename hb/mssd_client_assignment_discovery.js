const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function discoverClientAssignment() {
  try {
    await client.connect();
    console.log('🔍 MSSD Client Assignment Discovery - Finding "O" Marking Mechanism');
    
    // 1. First, check the actual structure of agency_groups table
    const agencyGroupsStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'agency_groups'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 AGENCY_GROUPS TABLE STRUCTURE:');
    agencyGroupsStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 2. Sample agency_groups data to understand the structure
    const sampleAgencyGroups = await client.query(`
      SELECT * FROM agency_groups 
      LIMIT 5
    `);
    console.log('\n👥 SAMPLE AGENCY_GROUPS DATA:');
    if (sampleAgencyGroups.rows.length > 0) {
      sampleAgencyGroups.rows.forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    } else {
      console.log('  ⚠️ No data in agency_groups table');
    }
    
    // 3. Check for CCNs 457050 and 457126 in agency_reference
    const clientAgencyRef = await client.query(`
      SELECT 
        ccn,
        shrt_name,
        derived_active,
        quality_rating,
        timely_care_denominator
      FROM agency_reference 
      WHERE ccn IN ('457050', '457126')
      ORDER BY ccn
    `);
    console.log('\n📊 CLIENT CCNs IN AGENCY_REFERENCE:');
    if (clientAgencyRef.rows.length > 0) {
      clientAgencyRef.rows.forEach(row => {
        console.log(`  - CCN ${row.ccn}: ${row.shrt_name} | Active: ${row.derived_active} | Quality: ${row.quality_rating} | Episodes: ${row.timely_care_denominator}`);
      });
    } else {
      console.log('  ❌ Client CCNs not found in agency_reference');
    }
    
    // 4. Check territorial coverage for client CCNs
    const clientCoverage = await client.query(`
      SELECT 
        ccn,
        array_length(geozip_array, 1) as territory_size,
        geozip_array[1:5] as sample_geozips
      FROM agency_geozip_coverage 
      WHERE ccn IN ('457050', '457126')
      ORDER BY ccn
    `);
    console.log('\n🗺️ CLIENT TERRITORIAL COVERAGE:');
    if (clientCoverage.rows.length > 0) {
      clientCoverage.rows.forEach(row => {
        console.log(`  - CCN ${row.ccn}: ${row.territory_size} geozips | Sample: ${row.sample_geozips}`);
      });
    } else {
      console.log('  ❌ Client CCNs not found in agency_geozip_coverage');
    }
    
    // 5. Check if mv_client_spatial_foundation exists
    const mvExists = await client.query(`
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_name = 'mv_client_spatial_foundation'
    `);
    console.log('\n📈 MV_CLIENT_SPATIAL_FOUNDATION STATUS:');
    if (mvExists.rows[0].table_exists > 0) {
      const mvClientCheck = await client.query(`
        SELECT 
          COUNT(*) as total_rows,
          COUNT(DISTINCT agency_ccn) as unique_agencies,
          array_agg(DISTINCT user_group_tag) as group_tags,
          array_agg(DISTINCT agency_ccn) as ccns_in_mv
        FROM mv_client_spatial_foundation
        LIMIT 1
      `);
      const mv = mvClientCheck.rows[0];
      console.log(`  - Total rows: ${mv.total_rows}`);
      console.log(`  - Unique agencies: ${mv.unique_agencies}`);
      console.log(`  - Group tags: ${mv.group_tags}`);
      console.log(`  - CCNs in MV: ${mv.ccns_in_mv}`);
    } else {
      console.log('  ❌ MV does not exist');
    }
    
    // 6. Check if there's a user_id that we should use
    const userCheck = await client.query(`
      SELECT COUNT(*) as user_count 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    console.log('\n👤 USER SYSTEM CHECK:');
    if (userCheck.rows[0].user_count > 0) {
      const sampleUsers = await client.query(`
        SELECT id, email FROM users LIMIT 3
      `);
      console.log('  Sample users:');
      sampleUsers.rows.forEach(row => {
        console.log(`    - ID: ${row.id}, Email: ${row.email}`);
      });
    } else {
      console.log('  ⚠️ No users table found');
    }
    
    // 7. Final summary
    console.log('\n🔧 IMPLEMENTATION REQUIREMENTS:');
    const hasAgencyRef = clientAgencyRef.rows.length > 0;
    const hasCoverage = clientCoverage.rows.length > 0;
    const hasMV = mvExists.rows[0].table_exists > 0;
    
    console.log(`  - Client agencies in agency_reference: ${hasAgencyRef ? '✅' : '❌'}`);
    console.log(`  - Client territorial coverage: ${hasCoverage ? '✅' : '❌'}`);
    console.log(`  - Client spatial MV exists: ${hasMV ? '✅' : '❌'}`);
    
    if (hasAgencyRef && hasCoverage) {
      console.log('\n📝 READY FOR CLIENT ASSIGNMENT:');
      console.log('  1. Agency data exists and has territorial coverage');
      console.log('  2. Need to populate agency_groups with "O" assignments');
      console.log('  3. Need to create/refresh mv_client_spatial_foundation');
    }
    
    await client.end();
    console.log('\n🚀 MSSD Client Assignment Discovery Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

discoverClientAssignment(); 