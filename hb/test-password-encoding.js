#!/usr/bin/env node
// Test password encoding variations

const { Client } = require('pg');

console.log('🎯 TESTING: Password Encoding Variations\n');

async function testPasswordFormats() {
  const passwordTests = [
    {
      name: 'Original Password',
      password: 'Episode2025!'
    },
    {
      name: 'URL Encoded Password',
      password: 'Episode2025%21'  // ! encoded as %21
    },
    {
      name: 'Double URL Encoded',
      password: 'Episode2025%2521'  // %21 encoded again
    },
    {
      name: 'Escaped Exclamation',
      password: 'Episode2025\\!'
    }
  ];

  for (const test of passwordTests) {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`   Password: ${test.password}`);
    
    await testConnection({
      user: 'postgres.ugtepudnmpvgormpcuje',
      password: test.password,
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      ssl: false
    }, test.name);
  }

  // Also test connection string format
  console.log(`\n🔍 Testing: Connection String URL Encoded`);
  await testConnectionString('postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=disable');
}

async function testConnection(config, description) {
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 8000
  });
  
  const startTime = Date.now();
  
  try {
    console.log(`   Connecting...`);
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    console.log(`   🏆 Password encoding solved: ${description}`);
    
    // Quick test
    const result = await client.query('SELECT NOW() as current_time;');
    console.log(`   ✅ Query works: ${result.rows[0].current_time}`);
    
    await client.end();
    return true;
    
  } catch (error) {
    const failTime = Date.now() - startTime;
    console.log(`   ❌ FAILED after ${failTime}ms: ${error.message}`);
    
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

async function testConnectionString(connectionString) {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  
  try {
    await client.connect();
    console.log(`   ✅ Connection string works!`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Connection string failed: ${error.message}`);
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

testPasswordFormats().catch(console.error); 