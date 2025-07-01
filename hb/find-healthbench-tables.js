#!/usr/bin/env node
// Find where HealthBench tables are located

const { Client } = require('pg');

const WORKING_CONNECTION = 'postgresql://cursor_ai.ugtepudnmpvgormpcuje:CursorAI2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=disable';

async function findHealthBenchTables() {
  const client = new Client({
    connectionString: WORKING_CONNECTION,
    connectionTimeoutMillis: 10000
  });
  
  try {
    await client.connect();
    console.log('🔍 SEARCHING FOR HEALTHBENCH TABLES\n');
    
    // Check all schemas in current database
    console.log('1️⃣ ALL SCHEMAS IN CURRENT DATABASE:');
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name;
    `);
    
    schemasResult.rows.forEach(row => {
      console.log(`  📂 ${row.schema_name}`);
    });
    
    // Check for agency_reference across all schemas
    console.log('\n2️⃣ SEARCHING FOR agency_reference ACROSS ALL SCHEMAS:');
    const searchResult = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name = 'agency_reference'
      ORDER BY table_schema;
    `);
    
    if (searchResult.rows.length > 0) {
      console.log('✅ Found agency_reference:');
      searchResult.rows.forEach(row => {
        console.log(`  📊 ${row.table_schema}.${row.table_name}`);
      });
    } else {
      console.log('❌ agency_reference not found in any schema');
    }
    
    // Search for any table with "agency" in the name
    console.log('\n3️⃣ SEARCHING FOR ANY TABLES WITH "agency" IN NAME:');
    const agencySearchResult = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name ILIKE '%agency%'
      ORDER BY table_schema, table_name;
    `);
    
    if (agencySearchResult.rows.length > 0) {
      console.log('✅ Found agency-related tables:');
      agencySearchResult.rows.forEach(row => {
        console.log(`  📊 ${row.table_schema}.${row.table_name}`);
      });
    } else {
      console.log('❌ No tables with "agency" in name found');
    }
    
    // Check current user permissions
    console.log('\n4️⃣ CURRENT USER INFORMATION:');
    const userInfoResult = await client.query(`
      SELECT 
        current_user as username,
        current_database() as database,
        current_schema() as default_schema,
        session_user as session_user;
    `);
    
    const userInfo = userInfoResult.rows[0];
    console.log(`  👤 User: ${userInfo.username}`);
    console.log(`  🗃️  Database: ${userInfo.database}`);
    console.log(`  📂 Default Schema: ${userInfo.default_schema}`);
    console.log(`  🔑 Session User: ${userInfo.session_user}`);
    
    // Check what databases we can access
    console.log('\n5️⃣ ACCESSIBLE DATABASES:');
    try {
      const dbResult = await client.query(`
        SELECT datname 
        FROM pg_database 
        WHERE datallowconn = true
        ORDER BY datname;
      `);
      
      dbResult.rows.forEach(row => {
        console.log(`  🗃️  ${row.datname}`);
      });
    } catch (error) {
      console.log(`  ❌ Cannot list databases: ${error.message}`);
    }
    
    await client.end();
    
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
    try {
      await client.end();
    } catch (e) {}
  }
}

findHealthBenchTables().catch(console.error); 