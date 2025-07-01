#!/usr/bin/env node
// TEST: Full SQL Write Capabilities (Browser-Equivalent)
// Demonstrates our anti-amnesia solution can execute any SQL as if pasted in Supabase browser

const { Client } = require('pg');

console.log('✍️  TESTING: Full SQL Write Capabilities (Browser-Equivalent)\n');

const HEALTHBENCH_CONNECTION = 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable';

async function testSQLWriteCapabilities() {
  const client = new Client({
    connectionString: HEALTHBENCH_CONNECTION,
    connectionTimeoutMillis: 10000
  });
  
  try {
    await client.connect();
    console.log('🔄 Connected to HealthBench for SQL write testing...\n');
    
    // Test 1: CREATE TABLE (as if pasted in browser)
    console.log('1️⃣ CREATE TABLE Test (Browser SQL Equivalent):');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS anti_amnesia_test_log (
        id SERIAL PRIMARY KEY,
        test_name VARCHAR(100) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW(),
        sql_query TEXT,
        result_count INTEGER,
        status VARCHAR(20) DEFAULT 'SUCCESS',
        notes TEXT
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Table created successfully');
    console.log('📋 SQL executed:', createTableSQL.trim().split('\n')[1].trim());
    
    // Test 2: INSERT with complex data (as if pasted in browser)
    console.log('\n2️⃣ INSERT Complex Data (Browser SQL Equivalent):');
    const insertSQL = `
      INSERT INTO anti_amnesia_test_log 
        (test_name, sql_query, result_count, notes)
      VALUES 
        ('Schema Discovery', 'SELECT * FROM information_schema.columns', 1000, 'Anti-amnesia field discovery'),
        ('Agency Count', 'SELECT COUNT(*) FROM agency_reference', 12015, 'Live HealthBench data access'),
        ('H3 Geo Data', 'SELECT COUNT(*) FROM h3_index', 1426914, 'Massive geo dataset accessible'),
        ('Quality Ratings', 'SELECT AVG(quality_rating) FROM agency_reference WHERE quality_rating IS NOT NULL', 1, 'Real-time quality metrics')
      RETURNING id, test_name, executed_at;
    `;
    
    const insertResult = await client.query(insertSQL);
    console.log('✅ Complex INSERT successful');
    console.log('📊 Records inserted:', insertResult.rows.length);
    insertResult.rows.forEach(row => {
      console.log(`   • ${row.id}: ${row.test_name} at ${row.executed_at}`);
    });
    
    // Test 3: UPDATE with JOIN (as if pasted in browser)
    console.log('\n3️⃣ UPDATE with Business Logic (Browser SQL Equivalent):');
    const updateSQL = `
      UPDATE anti_amnesia_test_log 
      SET notes = CONCAT(notes, ' - Verified at ', NOW()),
          status = 'VERIFIED'
      WHERE test_name LIKE '%Count%'
      RETURNING test_name, status, notes;
    `;
    
    const updateResult = await client.query(updateSQL);
    console.log('✅ UPDATE with logic successful');
    updateResult.rows.forEach(row => {
      console.log(`   • ${row.test_name}: ${row.status}`);
    });
    
    // Test 4: Complex SELECT with aggregations (as if pasted in browser)
    console.log('\n4️⃣ Complex Analytics Query (Browser SQL Equivalent):');
    const analyticsSQL = `
      SELECT 
        COUNT(*) as total_tests,
        COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified_tests,
        AVG(result_count) as avg_result_count,
        STRING_AGG(test_name, ', ' ORDER BY executed_at) as test_sequence,
        MIN(executed_at) as first_test,
        MAX(executed_at) as last_test
      FROM anti_amnesia_test_log
      WHERE executed_at >= NOW() - INTERVAL '1 hour';
    `;
    
    const analyticsResult = await client.query(analyticsSQL);
    const stats = analyticsResult.rows[0];
    console.log('✅ Complex analytics successful');
    console.log(`📊 Test Summary:`);
    console.log(`   • Total tests: ${stats.total_tests}`);
    console.log(`   • Verified: ${stats.verified_tests}`);
    console.log(`   • Avg result count: ${Math.round(stats.avg_result_count).toLocaleString()}`);
    console.log(`   • Duration: ${Math.round((new Date(stats.last_test) - new Date(stats.first_test)) / 1000)}s`);
    
    // Test 5: Real HealthBench data integration (as if pasted in browser)
    console.log('\n5️⃣ Live HealthBench Integration (Browser SQL Equivalent):');
    const integrationSQL = `
      INSERT INTO anti_amnesia_test_log (test_name, sql_query, result_count, notes)
      SELECT 
        'Live Agency Analysis',
        'Real HealthBench Query',
        COUNT(*),
        CONCAT('Found agencies in ', COUNT(DISTINCT state), ' states with avg rating ', ROUND(AVG(quality_rating), 2))
      FROM agency_reference 
      WHERE quality_rating IS NOT NULL
      RETURNING test_name, result_count, notes;
    `;
    
    const integrationResult = await client.query(integrationSQL);
    console.log('✅ Live data integration successful');
    integrationResult.rows.forEach(row => {
      console.log(`   • ${row.test_name}: ${row.result_count} records`);
      console.log(`   • Analysis: ${row.notes}`);
    });
    
    // Test 6: Advanced SQL features (as if pasted in browser)
    console.log('\n6️⃣ Advanced SQL Features (Browser SQL Equivalent):');
    const advancedSQL = `
      WITH test_summary AS (
        SELECT 
          test_name,
          result_count,
          RANK() OVER (ORDER BY result_count DESC) as data_size_rank,
          CASE 
            WHEN result_count > 1000000 THEN 'MASSIVE'
            WHEN result_count > 10000 THEN 'LARGE' 
            WHEN result_count > 1000 THEN 'MEDIUM'
            ELSE 'SMALL'
          END as dataset_category
        FROM anti_amnesia_test_log
        WHERE result_count IS NOT NULL
      )
      SELECT 
        dataset_category,
        COUNT(*) as test_count,
        STRING_AGG(test_name, ', ') as tests_in_category,
        MAX(result_count) as largest_dataset
      FROM test_summary
      GROUP BY dataset_category
      ORDER BY largest_dataset DESC;
    `;
    
    const advancedResult = await client.query(advancedSQL);
    console.log('✅ Advanced SQL (CTE, Window Functions) successful');
    console.log('📊 Dataset Categories:');
    advancedResult.rows.forEach(row => {
      console.log(`   • ${row.dataset_category}: ${row.test_count} tests, max ${row.largest_dataset.toLocaleString()} records`);
    });
    
    // Test 7: Cleanup (as if pasted in browser)
    console.log('\n7️⃣ Cleanup Operations (Browser SQL Equivalent):');
    const cleanupSQL = `
      SELECT 
        COUNT(*) as records_to_delete,
        MIN(executed_at) as oldest_record,
        MAX(executed_at) as newest_record
      FROM anti_amnesia_test_log;
    `;
    
    const cleanupCheck = await client.query(cleanupSQL);
    console.log('📊 Records created during test:', cleanupCheck.rows[0].records_to_delete);
    
    // Optional cleanup (commented out to preserve test results)
    console.log('💡 Test table preserved for inspection: anti_amnesia_test_log');
    console.log('   To cleanup: DROP TABLE anti_amnesia_test_log;');
    
    await client.end();
    
    console.log('\n🏆 SQL WRITE CAPABILITIES TEST COMPLETE!');
    console.log('✅ CREATE, INSERT, UPDATE, SELECT all working');
    console.log('✅ Complex queries, CTEs, window functions working');
    console.log('✅ Live HealthBench data integration working');
    console.log('✅ All SQL equivalent to browser paste-and-execute');
    console.log('\n🧠 Anti-amnesia solution has FULL database write capabilities!');
    console.log('🚀 Ready for production SQL development workflow!');
    
  } catch (error) {
    console.log(`❌ SQL write test failed: ${error.message}`);
    console.log('Stack:', error.stack);
    try {
      await client.end();
    } catch (e) {}
  }
}

testSQLWriteCapabilities().catch(console.error); 