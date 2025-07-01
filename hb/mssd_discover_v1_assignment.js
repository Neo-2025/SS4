const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
});

async function discoverV1AssignmentMechanism() {
  try {
    await client.connect();
    console.log('🔍 MSSD V1 Assignment Discovery - How did V1 handle client agency assignments?');
    
    // 1. Look for any existing data in agency_groups
    const existingAssignments = await client.query(`
      SELECT 
        ag.*,
        ar.ccn,
        ar.shrt_name
      FROM agency_groups ag
      LEFT JOIN agency_reference ar ON ag.agency_id = ar.id
      ORDER BY ag.created_at DESC
      LIMIT 20
    `);
    
    console.log('\n📊 EXISTING AGENCY_GROUPS DATA:');
    if (existingAssignments.rows.length > 0) {
      existingAssignments.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. CCN: ${row.ccn || 'N/A'} | Name: ${row.shrt_name || 'N/A'} | Type: ${row.group_type} | User: ${row.user_id} | Created: ${row.created_at}`);
      });
    } else {
      console.log('  ❌ No data found in agency_groups');
    }
    
    // 2. Look for tables that might contain client/group assignment logic
    const groupRelatedTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        table_name ILIKE '%group%' OR 
        table_name ILIKE '%client%' OR
        table_name ILIKE '%assignment%' OR
        table_name ILIKE '%user%' OR
        table_name ILIKE '%owner%'
      )
      ORDER BY table_name
    `);
    
    console.log('\n🗂️ GROUP/CLIENT RELATED TABLES:');
    groupRelatedTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 3. Check if mv_client_spatial_foundation exists and how it identifies clients
    const mvExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'mv_client_spatial_foundation'
      ) as mv_exists
    `);
    
    if (mvExists.rows[0].mv_exists) {
      console.log('\n📈 MV_CLIENT_SPATIAL_FOUNDATION EXISTS - Checking structure:');
      
      const mvStructure = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'mv_client_spatial_foundation'
        ORDER BY ordinal_position
      `);
      
      console.log('  Structure:');
      mvStructure.rows.forEach(row => {
        console.log(`    - ${row.column_name}: ${row.data_type}`);
      });
      
      // Sample the MV data to understand client identification
      const mvSample = await client.query(`
        SELECT 
          user_group_tag,
          agency_ccn,
          agency_short_name,
          final_group_code,
          COUNT(*) as row_count
        FROM mv_client_spatial_foundation
        GROUP BY user_group_tag, agency_ccn, agency_short_name, final_group_code
        ORDER BY user_group_tag, agency_ccn
        LIMIT 10
      `);
      
      console.log('\n  Sample MV data:');
      mvSample.rows.forEach(row => {
        console.log(`    - CCN: ${row.agency_ccn} | Name: ${row.agency_short_name} | Group Tag: ${row.user_group_tag} | Final Code: ${row.final_group_code} | Rows: ${row.row_count}`);
      });
      
    } else {
      console.log('\n❌ mv_client_spatial_foundation does not exist');
    }
    
    // 4. Look for any views that might show client assignment logic
    const clientViews = await client.query(`
      SELECT table_name, view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND (
        table_name ILIKE '%client%' OR
        table_name ILIKE '%group%' OR
        view_definition ILIKE '%457050%' OR
        view_definition ILIKE '%457126%' OR
        view_definition ILIKE '%group_type%'
      )
      ORDER BY table_name
    `);
    
    console.log('\n👁️ CLIENT/GROUP RELATED VIEWS:');
    if (clientViews.rows.length > 0) {
      clientViews.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
        if (row.view_definition && row.view_definition.length < 500) {
          console.log(`    Definition excerpt: ${row.view_definition.substring(0, 200)}...`);
        }
      });
    } else {
      console.log('  ❌ No relevant views found');
    }
    
    // 5. Search for any hardcoded references to client CCNs
    const functionSearch = await client.query(`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND (
        routine_definition ILIKE '%457050%' OR
        routine_definition ILIKE '%457126%' OR
        routine_definition ILIKE '%group_type%' OR
        routine_definition ILIKE '%client%'
      )
      ORDER BY routine_name
    `);
    
    console.log('\n⚙️ FUNCTIONS WITH CLIENT REFERENCES:');
    if (functionSearch.rows.length > 0) {
      functionSearch.rows.forEach(row => {
        console.log(`  - ${row.routine_name}`);
        if (row.routine_definition) {
          // Extract key lines that mention our CCNs or group logic
          const relevantLines = row.routine_definition
            .split('\n')
            .filter(line => 
              line.includes('457050') || 
              line.includes('457126') || 
              line.includes('group_type') ||
              line.includes('client') ||
              line.includes("'O'")
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
      console.log('  ❌ No functions with client references found');
    }
    
    // 6. Check if there are any existing materialized views that show client logic
    const existingMVs = await client.query(`
      SELECT 
        schemaname,
        matviewname,
        definition
      FROM pg_matviews
      WHERE schemaname = 'public'
      AND (
        definition ILIKE '%457050%' OR
        definition ILIKE '%457126%' OR
        definition ILIKE '%group_type%' OR
        definition ILIKE '%client%'
      )
      ORDER BY matviewname
    `);
    
    console.log('\n🏗️ MATERIALIZED VIEWS WITH CLIENT LOGIC:');
    if (existingMVs.rows.length > 0) {
      existingMVs.rows.forEach(row => {
        console.log(`  - ${row.matviewname}`);
        if (row.definition) {
          // Extract relevant parts of the definition
          const relevantParts = row.definition
            .split('\n')
            .filter(line => 
              line.includes('457050') || 
              line.includes('457126') || 
              line.includes('group_type') ||
              line.includes("'O'")
            )
            .slice(0, 5);
          
          if (relevantParts.length > 0) {
            console.log('    Client assignment logic:');
            relevantParts.forEach(line => {
              console.log(`      ${line.trim()}`);
            });
          }
        }
      });
    } else {
      console.log('  ❌ No materialized views with client logic found');
    }
    
    console.log('\n🔧 DISCOVERY SUMMARY:');
    console.log(`  - Agency groups data: ${existingAssignments.rows.length > 0 ? '✅ Found' : '❌ Empty'}`);
    console.log(`  - Client spatial MV: ${mvExists.rows[0].mv_exists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`  - Client views: ${clientViews.rows.length > 0 ? '✅ Found' : '❌ None'}`);
    console.log(`  - Client functions: ${functionSearch.rows.length > 0 ? '✅ Found' : '❌ None'}`);
    console.log(`  - Client MVs: ${existingMVs.rows.length > 0 ? '✅ Found' : '❌ None'}`);
    
    await client.end();
    console.log('\n🚀 MSSD V1 Assignment Discovery Complete');
    
  } catch (error) {
    console.error('❌ MSSD Error:', error.message);
    await client.end();
  }
}

discoverV1AssignmentMechanism(); 