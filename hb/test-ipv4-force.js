#!/usr/bin/env node
// Test IPv4-forced connection matching Row Zero exactly
// Row Zero config: db.ugtepudnmpvgormpcuje.supabase.co:5432, rowzero_user

const { Client } = require('pg');
const net = require('net');

// Exact Row Zero configuration
const RZ_CONFIG = {
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,  // Same as Row Zero
  user: 'rowzero_user',  // Same as Row Zero
  password: 'Episode2025!',
  database: 'postgres'  // Same as Row Zero
};

console.log('🎯 TESTING: Exact Row Zero Configuration with IPv4 Forcing\n');

async function testIPv4Connection() {
  console.log('1️⃣ Testing IPv4-forced connection methods\n');
  
  // Method 1: Force IPv4 by using IP address directly
  console.log('🔍 Method 1: Direct IPv4 IP address');
  await testConnection({
    ...RZ_CONFIG,
    host: '34.231.148.198',  // IPv4 IP from our DNS lookup
  }, 'Direct IPv4 IP');
  
  // Method 2: Force IPv4 with family option
  console.log('\n🔍 Method 2: IPv4 family forcing');
  await testConnection({
    ...RZ_CONFIG,
    family: 4,  // Force IPv4
  }, 'IPv4 family forced');
  
  // Method 3: Connection string with IPv4 hints
  console.log('\n🔍 Method 3: Connection string with options');
  const ipv4ConnectionString = `postgresql://${RZ_CONFIG.user}:${RZ_CONFIG.password}@34.231.148.198:${RZ_CONFIG.port}/${RZ_CONFIG.database}`;
  await testConnectionString(ipv4ConnectionString, 'IPv4 connection string');
  
  // Method 4: Test if port 5432 is actually open
  console.log('\n🔍 Method 4: Port connectivity test');
  await testPortConnectivity('34.231.148.198', 5432);
  await testPortConnectivity('db.ugtepudnmpvgormpcuje.supabase.co', 5432);
}

async function testConnection(config, description) {
  const client = new Client(config);
  const startTime = Date.now();
  
  try {
    console.log(`   Connecting to: ${config.host}:${config.port}`);
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as agencies FROM agency_reference LIMIT 1;');
    console.log(`   ✅ Query successful: ${result.rows[0].agencies} agencies`);
    
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

async function testConnectionString(connectionString, description) {
  const client = new Client({ connectionString });
  const startTime = Date.now();
  
  try {
    console.log(`   Testing: ${description}`);
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    
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

async function testPortConnectivity(host, port) {
  return new Promise((resolve) => {
    console.log(`   Testing port connectivity: ${host}:${port}`);
    
    const socket = new net.Socket();
    const timeout = 5000;
    
    const timer = setTimeout(() => {
      socket.destroy();
      console.log(`   ❌ Port ${port} on ${host}: TIMEOUT after ${timeout}ms`);
      resolve(false);
    }, timeout);
    
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      console.log(`   ✅ Port ${port} on ${host}: OPEN`);
      resolve(true);
    });
    
    socket.on('error', (err) => {
      clearTimeout(timer);
      console.log(`   ❌ Port ${port} on ${host}: ERROR - ${err.message}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Run test
testIPv4Connection().catch(console.error); 