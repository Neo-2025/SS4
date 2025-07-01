#!/usr/bin/env node
// Test both connection patterns for cursor_ai

const { Client } = require('pg');

console.log('🎯 TESTING: Both Connection Patterns for cursor_ai\n');

async function testBothPatterns() {
  const patterns = [
    {
      name: 'Direct Connection (rowzero_user pattern)',
      connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable'
    },
    {
      name: 'Direct Connection Port 6543 (your working pattern)',
      connectionString: 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres?sslmode=disable'
    },
    {
      name: 'Session Pooler (project-qualified username)',
      connectionString: 'postgresql://cursor_ai.ugtepudnmpvgormpcuje:CursorAI2025@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=disable'
    },
    {
      name: 'Session Pooler Transaction Mode',
      connectionString: 'postgresql://cursor_ai.ugtepudnmpvgormpcuje:CursorAI2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
    }
  ];

  for (const pattern of patterns) {
    console.log(`\n🔍 Testing: ${pattern.name}`);
    console.log(`   Connection: ${pattern.connectionString}`);
    
    await testConnection(pattern.connectionString, pattern.name);
  }
}

async function testConnection(connectionString, description) {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 8000
  });
  
  const startTime = Date.now();
  
  try {
    console.log(`   🔄 Connecting...`);
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    console.log(`   🎉 WORKING PATTERN FOUND: ${description}`);
    
    // Quick test
    const result = await client.query('SELECT NOW() as current_time, USER as current_user;');
    console.log(`   ✅ Connected as: ${result.rows[0].current_user}`);
    console.log(`   ✅ Time: ${result.rows[0].current_time}`);
    
    // Test anti-amnesia query
    const schemaResult = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log(`   🧠 Schema access: ${schemaResult.rows[0].table_count} public tables found`);
    
    await client.end();
    
    console.log(`   🏆 THIS IS OUR WORKING PATTERN!`);
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

testBothPatterns().catch(console.error); 