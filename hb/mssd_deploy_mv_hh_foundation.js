// ===================================================
// MSSD DEPLOYMENT: mv_hh_client_competitor_foundation
// Uses established MSSD connection pattern for zero-amnesia deployment
// ===================================================

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// MSSD Connection Pattern (from anti-amnesia test)
const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function deployMaterializedView() {
  console.log('🚀 MSSD Deployment: mv_hh_client_competitor_foundation');
  console.log('📋 Using established MSSD connection pattern...');
  
  try {
    // Connect using MSSD pattern
    await client.connect();
    console.log('✅ MSSD connection established');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../sql/migrations/004_create_mv_hh_client_competitor_foundation.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Deploying materialized view...');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Materialized view created successfully!');
    
    // Validation query - check if MV was created
    const validationResult = await client.query(`
      SELECT 
        schemaname,
        matviewname,
        matviewowner,
        ispopulated,
        definition
      FROM pg_matviews 
      WHERE matviewname = 'mv_hh_client_competitor_foundation'
    `);
    
    if (validationResult.rows.length > 0) {
      console.log('✅ Materialized view validation successful:');
      console.log(`   • Schema: ${validationResult.rows[0].schemaname}`);
      console.log(`   • Name: ${validationResult.rows[0].matviewname}`);
      console.log(`   • Owner: ${validationResult.rows[0].matviewowner}`);
      console.log(`   • Populated: ${validationResult.rows[0].ispopulated}`);
    } else {
      console.log('❌ Materialized view validation failed - not found in pg_matviews');
    }
    
    // Check row count
    const rowCountResult = await client.query(`
      SELECT COUNT(*) as total_rows
      FROM mv_hh_client_competitor_foundation
    `);
    
    console.log(`✅ Row count: ${rowCountResult.rows[0].total_rows} rows`);
    
    // Sample data check
    const sampleResult = await client.query(`
      SELECT 
        client_id,
        agency_ccn,
        agency_short_name,
        market_name,
        user_group_tag,
        individual_c_percent,
        data_source
      FROM mv_hh_client_competitor_foundation
      ORDER BY user_group_sort, individual_c_percent DESC
      LIMIT 10
    `);
    
    console.log('✅ Sample data from materialized view:');
    sampleResult.rows.forEach(row => {
      console.log(`   • ${row.agency_ccn}: ${row.agency_short_name} (${row.market_name}) - C%: ${row.individual_c_percent}% [${row.data_source}]`);
    });
    
    console.log('🎯 MSSD Deployment Complete!');
    console.log('🚀 Ready for instant flat file generation');
    
  } catch (error) {
    console.error('❌ MSSD Deployment Error:', error.message);
    
    // If it's a column error, let's check what exists
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      console.log('🔍 Checking existing schema for troubleshooting...');
      
      try {
        // Check mv_client_spatial_foundation exists
        const mvCheck = await client.query(`
          SELECT COUNT(*) as count
          FROM information_schema.tables 
          WHERE table_name = 'mv_client_spatial_foundation'
        `);
        
        if (mvCheck.rows[0].count > 0) {
          console.log('✅ mv_client_spatial_foundation exists');
          
          // Check its columns
          const columnsCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mv_client_spatial_foundation'
            ORDER BY ordinal_position
          `);
          
          console.log('📋 Available columns in mv_client_spatial_foundation:');
          columnsCheck.rows.forEach(col => {
            console.log(`   • ${col.column_name}: ${col.data_type}`);
          });
        } else {
          console.log('❌ mv_client_spatial_foundation does not exist - prerequisite missing');
        }
        
      } catch (schemaError) {
        console.error('❌ Schema check error:', schemaError.message);
      }
    }
    
    throw error;
  } finally {
    await client.end();
    console.log('🔌 MSSD connection closed');
  }
}

// Execute deployment
deployMaterializedView()
  .then(() => {
    console.log('🏆 MSSD Deployment successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 MSSD Deployment failed:', error.message);
    process.exit(1);
  }); 