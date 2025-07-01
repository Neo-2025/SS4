#!/usr/bin/env node
// FIXED: Session Pooler with proper SSL and auth settings

const { Client } = require('pg');

console.log('🎯 TESTING: Session Pooler with PROPER Authentication\n');

async function testSessionPoolerFixed() {
  // Try different connection configurations
  const configs = [
    {
      name: 'Session Pooler with SSL',
      config: {
        user: 'postgres.ugtepudnmpvgormpcuje',  // Different username format for pooler
        password: 'Episode2025!',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Session Pooler with rowzero_user',
      config: {
        user: 'rowzero_user', 
        password: 'Episode2025!',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Session Pooler SSL required',
      config: {
        user: 'postgres.ugtepudnmpvgormpcuje',
        password: 'Episode2025!',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: true
      }
    },
    {
      name: 'Connection String with SSL',
      connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
    },
    {
      name: 'Connection String rowzero_user with SSL',
      connectionString: 'postgresql://rowzero_user:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
    }
  ];

  for (const test of configs) {
    console.log(`\n🔍 Testing: ${test.name}`);
    await testConnection(test.config || { connectionString: test.connectionString }, test.name);
  }
}

async function testConnection(config, description) {
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 10000
  });
  
  const startTime = Date.now();
  
  try {
    console.log(`   Connecting...`);
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    console.log('   🎉 BREAKTHROUGH! Session pooler working!');
    
    // Test schema access
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5;
    `);
    
    console.log('   ✅ Schema access confirmed!');
    console.log('   Tables found:', result.rows.map(r => r.table_name).join(', '));
    
    await client.end();
    return true;
    
  } catch (error) {
    const failTime = Date.now() - startTime;
    console.log(`   ❌ FAILED after ${failTime}ms: ${error.message}`);
    console.log(`   Error code: ${error.code}`);
    
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

// Run the test
testSessionPoolerFixed().catch(console.error); 