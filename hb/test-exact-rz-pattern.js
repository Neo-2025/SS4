#!/usr/bin/env node
// Test EXACT Row Zero connection pattern

const { Client } = require('pg');

console.log('🎯 TESTING: EXACT Row Zero Connection Pattern\n');

async function testExactRZPattern() {
  // EXACT Row Zero configuration
  const exactRZConnection = 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable';
  
  console.log('🔍 Using EXACT Row Zero pattern:');
  console.log('Host: db.ugtepudnmpvgormpcuje.supabase.co');
  console.log('Port: 5432 (direct connection)');
  console.log('Database: postgres');
  console.log('Schema: public (default)');
  console.log('');
  
  const client = new Client({
    connectionString: exactRZConnection,
    connectionTimeoutMillis: 10000
  });
  
  try {
    console.log('🔄 Connecting with exact RZ pattern...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test 1: What tables can we see?
    console.log('📊 ALL TABLES WE CAN ACCESS:');
    const tablesResult = await client.query(`
      SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`  📋 ${row.tablename} (owner: ${row.tableowner})`);
      });
    } else {
      console.log('  ❌ No tables found in public schema');
    }
    
    // Test 2: Direct check for agency_reference
    console.log('\n🔍 DIRECT CHECK: agency_reference table');
    try {
      const directCheck = await client.query(`
        SELECT COUNT(*) as count 
        FROM agency_reference 
        LIMIT 1;
      `);
      console.log(`✅ agency_reference found: ${directCheck.rows[0].count} rows`);
      
      // If found, get schema
      const schemaCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'agency_reference' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
        LIMIT 5;
      `);
      
      console.log('  📋 Schema preview:');
      schemaCheck.rows.forEach(col => {
        console.log(`    • ${col.column_name}: ${col.data_type}`);
      });
      
    } catch (error) {
      console.log(`❌ agency_reference not accessible: ${error.message}`);
    }
    
    // Test 3: Check permissions comparison
    console.log('\n🔑 PERMISSION CHECK:');
    const permCheck = await client.query(`
      SELECT 
        current_user as our_user,
        has_table_privilege('cursor_ai', 'agency_reference', 'SELECT') as can_select_agency,
        has_schema_privilege('cursor_ai', 'public', 'USAGE') as can_use_public
    `);
    
    const perms = permCheck.rows[0];
    console.log(`  👤 Current user: ${perms.our_user}`);
    console.log(`  📊 Can select agency_reference: ${perms.can_select_agency}`);
    console.log(`  📂 Can use public schema: ${perms.can_use_public}`);
    
    await client.end();
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    try {
      await client.end();
    } catch (e) {}
  }
}

testExactRZPattern().catch(console.error); 