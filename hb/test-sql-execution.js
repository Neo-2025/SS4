#!/usr/bin/env node
// Test SQL Execution - Can we run SQL directly?

const { Client } = require('pg');

const workingConnection = {
  connectionString: 'postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres'
};

async function testSQLExecution() {
  const client = new Client(workingConnection);
  
  try {
    console.log('🔍 Testing SQL execution capability...\n');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test 1: Simple SELECT query
    console.log('\n📊 Test 1: Simple SELECT');
    const result1 = await client.query('SELECT COUNT(*) as total_agencies FROM agency_reference;');
    console.log(`Result: ${result1.rows[0].total_agencies} agencies found`);
    
    // Test 2: More complex query with WHERE
    console.log('\n📊 Test 2: Filtered SELECT');
    const result2 = await client.query(`
      SELECT state, COUNT(*) as count 
      FROM agency_reference 
      WHERE state IN ('TX', 'CA', 'FL') 
      GROUP BY state 
      ORDER BY count DESC 
      LIMIT 3;
    `);
    console.log('Top states:');
    result2.rows.forEach(row => {
      console.log(`  ${row.state}: ${row.count} agencies`);
    });
    
    // Test 3: Schema query
    console.log('\n📊 Test 3: Schema introspection');
    const result3 = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agency_reference' 
      AND column_name IN ('ccn', 'name', 'state', 'quality_rating')
      ORDER BY ordinal_position;
    `);
    console.log('Key fields in agency_reference:');
    result3.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n🎯 SQL EXECUTION SUCCESSFUL!');
    console.log('✅ We can run SELECT queries directly');
    console.log('✅ Perfect schema info available instantly');
    console.log('✅ No more field name rediscovery needed');
    
    return true;
    
  } catch (error) {
    console.error('❌ SQL Execution Failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Run test
if (require.main === module) {
  testSQLExecution();
}

module.exports = { testSQLExecution }; 