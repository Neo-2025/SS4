#!/usr/bin/env node
// TEST: Session Pooler - The REAL Row Zero connection method!
// postgresql://postgres.ugtepudnmpvgormpcuje:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

const { Client } = require('pg');

console.log('🎯 TESTING: Session Pooler - The REAL Row Zero Connection!\n');

async function testSessionPooler() {
  // The REAL connection string Row Zero uses
  const sessionPoolerConnectionString = 'postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
  
  console.log('🔍 Testing Session Pooler Connection');
  console.log('Connection string:', sessionPoolerConnectionString);
  console.log('');
  
  const client = new Client({
    connectionString: sessionPoolerConnectionString,
    connectionTimeoutMillis: 10000
  });
  
  const startTime = Date.now();
  
  try {
    console.log('🔄 Connecting to Session Pooler...');
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`✅ SUCCESS! Connected in ${connectTime}ms`);
    console.log('🎉 WE FOUND THE WORKING CONNECTION METHOD!');
    
    console.log('\n🔍 Testing database access...');
    
    // Test basic query
    const timeResult = await client.query('SELECT NOW() as current_time;');
    console.log(`✅ Time query: ${timeResult.rows[0].current_time}`);
    
    // Test schema access - the REAL test!
    const schemaResult = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'agency_reference'
      ORDER BY ordinal_position
      LIMIT 5;
    `);
    
    console.log('\n✅ SCHEMA ACCESS WORKING!');
    console.log('agency_reference columns:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Test actual data access
    const dataResult = await client.query('SELECT ccn, name FROM agency_reference LIMIT 3;');
    console.log('\n✅ DATA ACCESS WORKING!');
    console.log('Sample agencies:');
    dataResult.rows.forEach(row => {
      console.log(`  - ${row.ccn}: ${row.name}`);
    });
    
    await client.end();
    
    console.log('\n🏆 MISSION ACCOMPLISHED!');
    console.log('We can now access the live Supabase schema exactly like Row Zero!');
    
    return true;
    
  } catch (error) {
    const failTime = Date.now() - startTime;
    console.log(`❌ FAILED after ${failTime}ms: ${error.message}`);
    console.log(`Error code: ${error.code}`);
    
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

// Run the test
testSessionPooler().catch(console.error); 