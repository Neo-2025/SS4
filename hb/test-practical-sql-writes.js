#!/usr/bin/env node
// PRACTICAL SQL WRITE TEST: Browser-Equivalent Operations Within Constraints
// Focus on temp tables, data analysis, and realistic Supabase operations

const { Client } = require('pg');

console.log('✍️  PRACTICAL SQL WRITE TEST: Browser-Equivalent Operations\n');

const HEALTHBENCH_CONNECTION = 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable';

async function testPracticalSQLWrites() {
  const client = new Client({
    connectionString: HEALTHBENCH_CONNECTION,
    connectionTimeoutMillis: 10000
  });
  
  try {
    await client.connect();
    console.log('🔄 Connected to HealthBench for practical SQL write testing...\n');
    
    // Test 1: TEMP TABLE Creation (always works - like browser scratch space)
    console.log('1️⃣ TEMP TABLE Operations (Browser SQL Equivalent):');
    const tempTableSQL = `
      CREATE TEMP TABLE analysis_workspace (
        test_id SERIAL PRIMARY KEY,
        table_name VARCHAR(100),
        record_count BIGINT,
        analysis_type VARCHAR(50),
        insights TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(tempTableSQL);
    console.log('✅ Temp table created successfully');
    
    // Test 2: INSERT Analysis Data (populate our workspace)
    console.log('\n2️⃣ INSERT Analysis Data (Browser SQL Equivalent):');
    const insertAnalysisSQL = `
      INSERT INTO analysis_workspace (table_name, record_count, analysis_type, insights)
      SELECT 
        'agency_reference' as table_name,
        COUNT(*) as record_count,
        'Healthcare Agency Analysis' as analysis_type,
        CONCAT('Found ', COUNT(*), ' agencies across ', COUNT(DISTINCT state), ' states') as insights
      FROM agency_reference
      
      UNION ALL
      
      SELECT 
        'h3_index' as table_name,
        COUNT(*) as record_count,
        'Geospatial Analysis' as analysis_type,
        CONCAT('Massive geo dataset with ', COUNT(*), ' H3 indices') as insights
      FROM h3_index
      
      UNION ALL
      
      SELECT 
        'hhcahps_survey_results' as table_name,
        COUNT(*) as record_count,
        'Survey Analysis' as analysis_type,
        CONCAT('Patient satisfaction data: ', COUNT(*), ' survey results') as insights
      FROM hhcahps_survey_results;
    `;
    
    await client.query(insertAnalysisSQL);
    console.log('✅ Analysis data inserted from live HealthBench tables');
    
    // Test 3: Complex Analytics (as if pasted in browser)
    console.log('\n3️⃣ Complex Analytics Query (Browser SQL Equivalent):');
    const analyticsSQL = `
      WITH dataset_summary AS (
        SELECT 
          table_name,
          record_count,
          analysis_type,
          CASE 
            WHEN record_count > 1000000 THEN 'MASSIVE (1M+)'
            WHEN record_count > 100000 THEN 'LARGE (100K+)'
            WHEN record_count > 10000 THEN 'MEDIUM (10K+)'
            ELSE 'SMALL (<10K)'
          END as size_category,
          ROUND(record_count / 1000.0, 1) as size_k
        FROM analysis_workspace
      )
      SELECT 
        size_category,
        COUNT(*) as table_count,
        SUM(record_count) as total_records,
        STRING_AGG(table_name || ' (' || size_k || 'K)', ', ') as tables_detail
      FROM dataset_summary
      GROUP BY size_category
      ORDER BY total_records DESC;
    `;
    
    const analyticsResult = await client.query(analyticsSQL);
    console.log('✅ Complex analytics successful');
    console.log('📊 HealthBench Dataset Categories:');
    analyticsResult.rows.forEach(row => {
      console.log(`   • ${row.size_category}: ${row.table_count} tables, ${row.total_records.toLocaleString()} total records`);
      console.log(`     Tables: ${row.tables_detail}`);
    });
    
    // Test 4: UPDATE Operations on temp table (like browser data manipulation)
    console.log('\n4️⃣ UPDATE Operations (Browser SQL Equivalent):');
    const updateSQL = `
      UPDATE analysis_workspace 
      SET insights = insights || ' - Verified access at ' || NOW()::TIME
      WHERE record_count > 100000
      RETURNING table_name, record_count, insights;
    `;
    
    const updateResult = await client.query(updateSQL);
    console.log('✅ UPDATE operations successful');
    updateResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}: ${row.record_count.toLocaleString()} records`);
    });
    
    // Test 5: Advanced SQL with Window Functions (browser-level complexity)
    console.log('\n5️⃣ Advanced SQL Features (Browser SQL Equivalent):');
    const advancedSQL = `
      SELECT 
        table_name,
        record_count,
        analysis_type,
        RANK() OVER (ORDER BY record_count DESC) as size_rank,
        ROUND(100.0 * record_count / SUM(record_count) OVER(), 2) as percentage_of_total,
        LAG(table_name) OVER (ORDER BY record_count DESC) as larger_table,
        LEAD(table_name) OVER (ORDER BY record_count DESC) as smaller_table
      FROM analysis_workspace
      ORDER BY record_count DESC;
    `;
    
    const advancedResult = await client.query(advancedSQL);
    console.log('✅ Advanced SQL (Window Functions) successful');
    console.log('📊 Detailed Table Analysis:');
    advancedResult.rows.forEach(row => {
      console.log(`   • Rank ${row.size_rank}: ${row.table_name}`);
      console.log(`     Records: ${row.record_count.toLocaleString()} (${row.percentage_of_total}% of total)`);
    });
    
    // Test 6: Real-time HealthBench Business Intelligence (browser SQL equivalent)
    console.log('\n6️⃣ Real-time HealthBench BI (Browser SQL Equivalent):');
    const biSQL = `
      CREATE TEMP TABLE quality_insights AS
      SELECT 
        state,
        COUNT(*) as agency_count,
        AVG(quality_rating) as avg_quality,
        MIN(quality_rating) as min_quality,
        MAX(quality_rating) as max_quality,
        COUNT(CASE WHEN quality_rating >= 4 THEN 1 END) as high_quality_count
      FROM agency_reference 
      WHERE quality_rating IS NOT NULL
      GROUP BY state
      HAVING COUNT(*) >= 10
      ORDER BY avg_quality DESC;
      
      SELECT 
        state,
        agency_count,
        ROUND(avg_quality, 2) as avg_rating,
        high_quality_count,
        ROUND(100.0 * high_quality_count / agency_count, 1) as high_quality_percentage
      FROM quality_insights
      LIMIT 10;
    `;
    
    const biResult = await client.query(biSQL);
    console.log('✅ Business Intelligence query successful');
    console.log('📊 Top Quality States (10+ agencies):');
    biResult.rows.forEach(row => {
      console.log(`   • ${row.state}: ${row.agency_count} agencies, avg rating ${row.avg_rating}`);
      console.log(`     ${row.high_quality_count} high-quality (${row.high_quality_percentage}%)`);
    });
    
    // Test 7: Multi-table JOIN Analysis (complex browser SQL)
    console.log('\n7️⃣ Multi-table JOIN Analysis (Browser SQL Equivalent):');
    const joinSQL = `
      SELECT 
        ar.state,
        COUNT(DISTINCT ar.ccn) as agencies,
        COUNT(DISTINCT agc.geozip) as coverage_areas,
        ROUND(AVG(ar.quality_rating), 2) as avg_quality
      FROM agency_reference ar
      LEFT JOIN agency_geozip_coverage agc ON ar.ccn = agc.ccn
      WHERE ar.quality_rating IS NOT NULL
      GROUP BY ar.state
      HAVING COUNT(DISTINCT ar.ccn) >= 5
      ORDER BY avg_quality DESC
      LIMIT 8;
    `;
    
    const joinResult = await client.query(joinSQL);
    console.log('✅ Multi-table JOIN successful');
    console.log('📊 State Coverage Analysis:');
    joinResult.rows.forEach(row => {
      console.log(`   • ${row.state}: ${row.agencies} agencies, ${row.coverage_areas} coverage areas, ${row.avg_quality} avg quality`);
    });
    
    await client.end();
    
    console.log('\n🏆 PRACTICAL SQL WRITE TEST COMPLETE!');
    console.log('✅ TEMP tables: Full CREATE/INSERT/UPDATE/SELECT');
    console.log('✅ Complex analytics: CTEs, Window Functions, Aggregations');
    console.log('✅ Multi-table JOINs: Live HealthBench data integration');
    console.log('✅ Business Intelligence: Real-time quality analysis');
    console.log('✅ All operations equivalent to Supabase browser SQL editor');
    console.log('\n🧠 Anti-amnesia solution: FULL practical write capabilities confirmed!');
    console.log('🚀 Ready for any SQL development workflow you can do in browser!');
    
  } catch (error) {
    console.log(`❌ Practical SQL test failed: ${error.message}`);
    console.log('Stack:', error.stack);
    try {
      await client.end();
    } catch (e) {}
  }
}

testPracticalSQLWrites().catch(console.error); 