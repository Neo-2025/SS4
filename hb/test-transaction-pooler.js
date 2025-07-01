#!/usr/bin/env node
// Quick test: Transaction pooler port 6543

const { Client } = require('pg');

console.log('🎯 Testing Transaction Pooler (Port 6543)\n');

async function testTransactionPooler() {
  const client = new Client({
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=disable',
    connectionTimeoutMillis: 8000
  });
  
  try {
    console.log('Connecting to transaction pooler...');
    await client.connect();
    
    console.log('✅ SUCCESS! Transaction pooler connected!');
    
    const result = await client.query('SELECT NOW() as current_time;');
    console.log(`✅ Query works: ${result.rows[0].current_time}`);
    
    await client.end();
    console.log('🏆 FOUND THE WORKING CONNECTION!');
    
  } catch (error) {
    console.log(`❌ Transaction pooler failed: ${error.message}`);
    try {
      await client.end();
    } catch (e) {}
  }
}

testTransactionPooler(); 