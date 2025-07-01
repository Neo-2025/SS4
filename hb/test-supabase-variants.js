#!/usr/bin/env node
// Test different Supabase connection patterns enabled by $4/mo upgrade

const { Client } = require('pg');

const BASE_CONFIG = {
  user: 'rowzero_user',
  password: 'Episode2025!',
  database: 'postgres'
};

console.log('🔍 TESTING: Alternative Supabase Connection Patterns\n');

async function testVariants() {
  const variants = [
    {
      name: 'Standard Connection (5432)',
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 5432 }
    },
    {
      name: 'Transaction Pooler (6543)', 
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 6543 }
    },
    {
      name: 'Session Pooler (5432)',
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 5432, options: '-c default_transaction_isolation=read_committed' }
    },
    {
      name: 'SSL Required',
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 5432, ssl: { rejectUnauthorized: false } }
    },
    {
      name: 'SSL Disabled',
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 5432, ssl: false }
    },
    {
      name: 'Connection Pooler URL Pattern',
      config: { ...BASE_CONFIG, host: 'pooler.ugtepudnmpvgormpcuje.supabase.co', port: 5432 }
    },
    {
      name: 'IPv4 Dedicated (if exists)',
      config: { ...BASE_CONFIG, host: 'ipv4.db.ugtepudnmpvgormpcuje.supabase.co', port: 5432 }
    },
    {
      name: 'Alternative Port 5433',
      config: { ...BASE_CONFIG, host: 'db.ugtepudnmpvgormpcuje.supabase.co', port: 5433 }
    }
  ];

  for (const variant of variants) {
    console.log(`\n🔍 Testing: ${variant.name}`);
    await testConnection(variant.config, variant.name);
  }
}

async function testConnection(config, description) {
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 8000
  });
  
  const startTime = Date.now();
  
  try {
    console.log(`   Connecting to: ${config.host}:${config.port}`);
    if (config.ssl !== undefined) {
      console.log(`   SSL: ${config.ssl === false ? 'DISABLED' : 'ENABLED'}`);
    }
    
    await client.connect();
    
    const connectTime = Date.now() - startTime;
    console.log(`   ✅ SUCCESS! Connected in ${connectTime}ms`);
    
    // Quick test query
    const result = await client.query('SELECT NOW() as current_time;');
    console.log(`   ✅ Query successful: ${result.rows[0].current_time}`);
    
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

// Run tests
testVariants().catch(console.error); 