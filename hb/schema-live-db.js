#!/usr/bin/env node
// HealthBench Live Schema via Direct PostgreSQL Connection
// Enhanced for reliability and durability

const { Client } = require('pg');

// Enhanced connection configurations with reliability improvements
const connectionConfigs = {
  // **PRIMARY**: Port 6543 with rowzero_user (most reliable)
  primary_rowzero: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'rowzero_user',
    password: 'Episode2025!',
    connectionTimeoutMillis: 10000,  // 10 second timeout
    idleTimeoutMillis: 30000,        // 30 second idle timeout
    ssl: { rejectUnauthorized: false },
    name: '🎯 PRIMARY: Port 6543 with rowzero_user (enhanced)'
  },
  
  // **FALLBACK 1**: Connection string format
  fallback1_string: {
    connectionString: 'postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres?sslmode=require&connect_timeout=10',
    name: '🔄 FALLBACK 1: Connection string with SSL'
  },
  
  // **FALLBACK 2**: Different SSL configuration
  fallback2_ssl: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'rowzero_user',
    password: 'Episode2025!',
    connectionTimeoutMillis: 15000,
    ssl: true,
    name: '🔄 FALLBACK 2: SSL true with extended timeout'
  },
  
  // **FALLBACK 3**: Standard port with Row Zero credentials
  fallback3_standard: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'rowzero_user',
    password: 'Episode2025!',
    connectionTimeoutMillis: 8000,
    ssl: { rejectUnauthorized: false },
    name: '🔄 FALLBACK 3: Standard port 5432'
  },
  
  // **FALLBACK 4**: Postgres user with RZ password
  fallback4_postgres: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'Episode2025!',
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
    name: '🔄 FALLBACK 4: Postgres user with RZ password'
  },
  
  // **FALLBACK 5**: Connection pooler with enhanced config
  fallback5_pooler: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=8',
    name: '🔄 FALLBACK 5: Enhanced pooler connection'
  },
  
  // Test rowzero_user with port 6543
  port_6543_rowzero_user: {
    connectionString: 'postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres',
    name: '🎯 Port 6543 with rowzero_user'
  },
  
  // Original working example from docs used this exact pattern
  documented_working: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: 'Episode2025!',
    name: '📚 Documented Working Method (port 6543)'
  },
  
  postgres_user: {
    connectionString: 'postgresql://postgres:LFAdgTAPid6a7cZL@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres',
    name: 'Standard postgres user (port 5432)'
  },
  
  rowzero_user: {
    connectionString: 'postgresql://rowzero_user:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres',
    name: 'Row Zero user with custom password (port 5432)'
  },
  
  // Test postgres user with RZ password
  postgres_rz_password: {
    connectionString: 'postgresql://postgres:Episode2025!@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres',
    name: 'Postgres user with RZ password'
  },
  
  // Connection pooler with Row Zero password
  pooler_rowzero: {
    connectionString: 'postgresql://rowzero_user:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    name: 'Pooler with Row Zero credentials'
  },
  
  // Pooler with correct project format and RZ password
  pooler_correct_rz: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:Episode2025!@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    name: 'Correct Pooler with RZ password'
  },
  
  // Service role might work for direct DB
  service_role: {
    host: 'db.ugtepudnmpvgormpcuje.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'service_role',
    password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGVwdWRubXB2Z29ybXBjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTkyNjkzNSwiZXhwIjoyMDQxNTAyOTM1fQ.OdxBNKXuiS8vbUZFHWYLONSQwwlUFgOxIrUYGNkb_0Q',
    name: 'Service Role JWT'
  },
  
  // Connection pooler with correct project format
  pooler_correct: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:LFAdgTAPid6a7cZL@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    name: 'Correct Pooler Format'
  },
  
  // Pooler with anon key (Row Zero might use this)
  pooler_anon: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGVwdWRubXB2Z29ybXBjdWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MjY5MzUsImV4cCI6MjA0MTUwMjkzNX0.-V5dYfqxNi_P2BXLKMI5sVsLLI8HMKdIYVb5yIDCp3Y@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    name: 'Pooler with Anon Key'
  },
  
  // Pooler with service role key
  pooler_service: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGVwdWRubXB2Z29ybXBjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTkyNjkzNSwiZXhwIjoyMDQxNTAyOTM1fQ.OdxBNKXuiS8vbUZFHWYLONSQwwlUFgOxIrUYGNkb_0Q@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
    name: 'Pooler with Service Role Key'
  },
  
  // Try different regions
  pooler_west: {
    connectionString: 'postgresql://postgres.ugtepudnmpvgormpcuje:LFAdgTAPid6a7cZL@aws-0-us-west-1.pooler.supabase.com:5432/postgres', 
    name: 'West Coast Pooler'
  },
  
  // Force IPv4 by using IP address directly with RZ password
  direct_ipv4_rz: {
    host: '34.231.148.198', // The IP from timeout error
    port: 5432,
    database: 'postgres',
    user: 'rowzero_user',
    password: 'Episode2025!',
    name: 'Direct IPv4 with Row Zero credentials'
  }
};

async function testConnection(config, configName) {
  const client = new Client(config);
  
  try {
    console.log(`\n🔍 Testing: ${configName}`);
    console.log(`   Timeout: ${config.connectionTimeoutMillis || 'default'}ms`);
    
    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Connected successfully! (${connectTime}ms)`);
    
    // Quick validation query
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'agency_reference'
      LIMIT 1;
    `);
    
    if (result.rows.length > 0) {
      console.log(`✅ Database validation passed - agency_reference found`);
      return { success: true, config, configName, connectTime };
    } else {
      console.log(`⚠️  Connected but agency_reference not found`);
      return { success: false, error: 'Database validation failed' };
    }
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.code) {
      console.log(`   Error Code: ${error.code}`);
    }
    return { success: false, error: error.message, code: error.code };
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

async function getTableSchema(tableName) {
  console.log(`🔍 Getting schema for table: ${tableName}`);
  
  // Try connections in order until one works
  for (const [key, config] of Object.entries(connectionConfigs)) {
    const client = new Client(config.connectionString || config);
    
    try {
      console.log(`\n🔄 Trying: ${config.name}`);
      await client.connect();
      console.log(`✅ Connected!`);
      
      // Get column information
      const query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const result = await client.query(query, [tableName]);
      
      if (result.rows.length > 0) {
        console.log(`\n📋 ${tableName.toUpperCase()} SCHEMA:`);
        result.rows.forEach(row => {
          console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Get sample data
        const sampleQuery = `SELECT * FROM ${tableName} LIMIT 1;`;
        const sampleResult = await client.query(sampleQuery);
        
        if (sampleResult.rows.length > 0) {
          console.log(`\n📊 SAMPLE DATA:`);
          console.log(JSON.stringify(sampleResult.rows[0], null, 2));
        } else {
          console.log(`\n📊 Table exists but is empty`);
        }
        
        await client.end();
        console.log(`\n🎯 SUCCESS! Schema retrieved using: ${config.name}`);
        return; // Success, exit function
        
      } else {
        console.log(`⚠️  Table ${tableName} not found in public schema`);
      }
      
    } catch (error) {
      console.log(`❌ Failed with ${config.name}: ${error.message}`);
    } finally {
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
  
  console.log(`\n❌ All connection methods failed for table: ${tableName}`);
}

async function testAllConnections() {
  console.log('🏥 HealthBench Live Schema - Enhanced Durability Testing\n');
  
  let workingMethod = null;
  let bestPerformance = null;
  const results = [];
  
  for (const [key, config] of Object.entries(connectionConfigs)) {
    const result = await testConnection(config.connectionString || config, config.name);
    results.push({ key, ...result });
    
    if (result.success && !workingMethod) {
      workingMethod = key;
      bestPerformance = result;
    }
  }
  
  console.log(`\n📊 CONNECTION TEST SUMMARY:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = result.connectTime ? `(${result.connectTime}ms)` : '';
    console.log(`  ${status} ${result.configName} ${time}`);
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  if (workingMethod) {
    console.log(`\n🎯 BEST CONNECTION: ${bestPerformance.configName}`);
    console.log(`   Performance: ${bestPerformance.connectTime}ms`);
    
    // Test HealthBench tables with working connection
    const healthBenchTables = [
      'agency_reference',
      'agency_geozip_coverage', 
      'h3_index',
      'geozip',
      'hhcahps_survey_results'
    ];
    
    console.log(`\n🔍 Checking HealthBench Core Tables:`);
    const workingConfig = connectionConfigs[workingMethod];
    const client = new Client(workingConfig.connectionString || workingConfig);
    
    try {
      await client.connect();
      
      for (const table of healthBenchTables) {
        const result = await client.query(`
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1 AND table_schema = 'public';
        `, [table]);
        
        console.log(`  ${result.rows.length > 0 ? '✅' : '❌'} ${table}`);
      }
      
    } catch (error) {
      console.error(`❌ Error checking tables: ${error.message}`);
    } finally {
      await client.end();
    }
    
  } else {
    console.log(`\n❌ NO WORKING CONNECTION FOUND`);
    console.log(`🔧 Troubleshooting suggestions:`);
    console.log(`   1. Check network connectivity`);
    console.log(`   2. Verify credentials haven't changed`);
    console.log(`   3. Try again in a few minutes (pooler may be busy)`);
    console.log(`   4. Consider using Supabase CLI as fallback`);
  }
}

// Run if called directly
if (require.main === module) {
  const tableName = process.argv[2];
  if (tableName) {
    getTableSchema(tableName);
  } else {
    testAllConnections();
  }
}