#!/usr/bin/env node
// DEBUG: Exact connection that worked 5 minutes ago
// postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres

const { Client } = require('pg');
const { execSync } = require('child_process');

const EXACT_CONNECTION = 'postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres';

console.log('🔍 DEBUGGING EXACT CONNECTION THAT WORKED 5 MINUTES AGO\n');
console.log('Connection string:', EXACT_CONNECTION);

async function debugConnection() {
  console.log('\n1️⃣ NETWORK CONNECTIVITY CHECK');
  
  // Check DNS resolution
  try {
    console.log('🔍 DNS Resolution:');
    const nslookup = execSync('nslookup db.ugtepudnmpvgormpcuje.supabase.co', { encoding: 'utf8' });
    console.log(nslookup);
  } catch (error) {
    console.log('❌ DNS lookup failed:', error.message);
  }
  
  // Check if host is reachable
  try {
    console.log('🔍 Host Reachability (ping):');
    const ping = execSync('ping -c 3 db.ugtepudnmpvgormpcuje.supabase.co', { encoding: 'utf8' });
    console.log(ping);
  } catch (error) {
    console.log('❌ Ping failed:', error.message);
  }
  
  // Check port connectivity
  try {
    console.log('🔍 Port 6543 Connectivity:');
    const telnet = execSync('timeout 5 bash -c "echo > /dev/tcp/db.ugtepudnmpvgormpcuje.supabase.co/6543" && echo "Port 6543 OPEN" || echo "Port 6543 CLOSED"', { encoding: 'utf8' });
    console.log(telnet);
  } catch (error) {
    console.log('❌ Port check failed:', error.message);
  }
  
  console.log('\n2️⃣ CONNECTION ATTEMPTS WITH DIFFERENT TIMEOUTS');
  
  // Test with very short timeout to fail fast
  await testWithTimeout(1000, 'Fast timeout (1s)');
  
  // Test with medium timeout
  await testWithTimeout(5000, 'Medium timeout (5s)');
  
  // Test with long timeout
  await testWithTimeout(15000, 'Long timeout (15s)');
  
  console.log('\n3️⃣ CONNECTION WITH VERBOSE LOGGING');
  await testWithVerboseLogging();
}

async function testWithTimeout(timeoutMs, description) {
  console.log(`\n🔍 Testing: ${description}`);
  
  const client = new Client({
    connectionString: EXACT_CONNECTION,
    connectionTimeoutMillis: timeoutMs,
  });
  
  const startTime = Date.now();
  
  try {
    await client.connect();
    const connectTime = Date.now() - startTime;
    console.log(`✅ SUCCESS! Connected in ${connectTime}ms`);
    
    // Quick test query
    const result = await client.query('SELECT NOW() as current_time;');
    console.log(`✅ Query executed: ${result.rows[0].current_time}`);
    
    await client.end();
    return true;
    
  } catch (error) {
    const failTime = Date.now() - startTime;
    console.log(`❌ FAILED after ${failTime}ms: ${error.message}`);
    console.log(`   Error code: ${error.code}`);
    
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function testWithVerboseLogging() {
  console.log('\n🔍 Verbose Connection Analysis');
  
  const client = new Client({
    connectionString: EXACT_CONNECTION,
    connectionTimeoutMillis: 10000,
  });
  
  // Log connection events
  client.on('connect', () => {
    console.log('🟢 EVENT: Connected to database');
  });
  
  client.on('error', (err) => {
    console.log('🔴 EVENT: Connection error:', err.message);
  });
  
  client.on('end', () => {
    console.log('🟡 EVENT: Connection ended');
  });
  
  try {
    console.log('🔄 Attempting connection...');
    await client.connect();
    console.log('✅ Connection established');
    
    console.log('🔄 Testing database access...');
    const result = await client.query('SELECT 1 as test;');
    console.log('✅ Database query successful');
    
    await client.end();
    
  } catch (error) {
    console.log('❌ Verbose test failed:', error.message);
    console.log('   Stack:', error.stack);
  }
}

// Run diagnostics
debugConnection().catch(console.error); 