#!/usr/bin/env node
// Check current user privileges and permissions

const { Client } = require('pg');

const HEALTHBENCH_CONNECTION = 'postgresql://cursor_ai:CursorAI2025@db.ugtepudnmpvgormpcuje.supabase.co:5432/postgres?sslmode=disable';

async function checkUserPrivileges() {
  const client = new Client({
    connectionString: HEALTHBENCH_CONNECTION,
    connectionTimeoutMillis: 10000
  });
  
  try {
    await client.connect();
    console.log('🔍 Checking cursor_ai user privileges...\n');
    
    // Check current user
    const userResult = await client.query('SELECT current_user, current_database();');
    console.log('👤 Current user:', userResult.rows[0].current_user);
    console.log('💾 Current database:', userResult.rows[0].current_database);
    
    // Check user attributes
    const attributesResult = await client.query(`
      SELECT 
        rolname, 
        rolsuper, 
        rolinherit, 
        rolcreaterole, 
        rolcreatedb, 
        rolcanlogin, 
        rolreplication, 
        rolbypassrls
      FROM pg_roles 
      WHERE rolname = 'cursor_ai';
    `);
    
    if (attributesResult.rows.length > 0) {
      const attrs = attributesResult.rows[0];
      console.log('\n🔐 User Attributes:');
      console.log(`  • Superuser: ${attrs.rolsuper}`);
      console.log(`  • Can inherit: ${attrs.rolinherit}`);
      console.log(`  • Create roles: ${attrs.rolcreaterole}`);
      console.log(`  • Create databases: ${attrs.rolcreatedb}`);
      console.log(`  • Can login: ${attrs.rolcanlogin}`);
      console.log(`  • Replication: ${attrs.rolreplication}`);
      console.log(`  • Bypass RLS: ${attrs.rolbypassrls}`);
    }
    
    // Check schema privileges
    const schemaPrivsResult = await client.query(`
      SELECT 
        schema_name,
        privilege_type,
        is_grantable
      FROM information_schema.schema_privileges 
      WHERE grantee = 'cursor_ai'
      ORDER BY schema_name, privilege_type;
    `);
    
    console.log('\n📋 Schema Privileges:');
    if (schemaPrivsResult.rows.length > 0) {
      schemaPrivsResult.rows.forEach(row => {
        console.log(`  • ${row.schema_name}: ${row.privilege_type} (grantable: ${row.is_grantable})`);
      });
    } else {
      console.log('  ❌ No explicit schema privileges found');
    }
    
    // Check table privileges
    const tablePrivsResult = await client.query(`
      SELECT 
        table_schema,
        COUNT(*) as tables_with_privileges,
        STRING_AGG(DISTINCT privilege_type, ', ') as privileges
      FROM information_schema.table_privileges 
      WHERE grantee = 'cursor_ai'
      GROUP BY table_schema
      ORDER BY table_schema;
    `);
    
    console.log('\n📊 Table Privileges by Schema:');
    if (tablePrivsResult.rows.length > 0) {
      tablePrivsResult.rows.forEach(row => {
        console.log(`  • ${row.table_schema}: ${row.tables_with_privileges} tables (${row.privileges})`);
      });
    } else {
      console.log('  ❌ No explicit table privileges found');
    }
    
    // Test basic read access
    console.log('\n🧪 Testing Read Access:');
    try {
      const readTest = await client.query('SELECT COUNT(*) FROM agency_reference LIMIT 1;');
      console.log('  ✅ Read access: Working');
    } catch (error) {
      console.log('  ❌ Read access failed:', error.message);
    }
    
    // Test write access on existing table
    console.log('\n🧪 Testing Write Access:');
    try {
      // Try to create a temp table first
      await client.query('CREATE TEMP TABLE test_write (id INT);');
      await client.query('INSERT INTO test_write VALUES (1);');
      await client.query('DROP TABLE test_write;');
      console.log('  ✅ Temp table write: Working');
    } catch (error) {
      console.log('  ❌ Temp table write failed:', error.message);
    }
    
    // Test schema creation
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS test_schema;');
      await client.query('DROP SCHEMA test_schema;');
      console.log('  ✅ Schema creation: Working');
    } catch (error) {
      console.log('  ❌ Schema creation failed:', error.message);
    }
    
    await client.end();
    
  } catch (error) {
    console.log(`❌ Privilege check failed: ${error.message}`);
    try {
      await client.end();
    } catch (e) {}
  }
}

checkUserPrivileges().catch(console.error); 