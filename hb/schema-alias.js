#!/usr/bin/env node
// SCHEMA ALIAS: Anti-Amnesia HealthBench Database Access
// MISSION ACCOMPLISHED: Direct access to live Supabase schema eliminates field rediscovery cycles

const { Client } = require('pg');

const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function SCHEMA(query) {
  try {
      await client.connect();
    const result = await client.query(query);
    await client.end();
    return result.rows;
  } catch (error) {
    console.error('❌ Schema Query Error:', error.message);
        await client.end();
    return [];
  }
}

// If run directly, show schema overview
if (require.main === module) {
  (async () => {
    try {
      await client.connect();
      console.log('✅ MSSD Schema Access: OPERATIONAL');
      
      // Show table count
      const tables = await client.query(`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log(`📊 Public Tables: ${tables.rows[0].table_count}`);
      
      // Show key tables
      const keyTables = await client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        ORDER BY table_name
        LIMIT 10
      `);
      
      console.log('\n📋 Sample Tables:');
      keyTables.rows.forEach(table => {
        console.log(`  ${table.table_name} (${table.column_count} columns)`);
      });
      
      await client.end();
    } catch (error) {
      console.error('❌ Schema Access Failed:', error.message);
      await client.end();
    }
  })();
  }
  
module.exports = { SCHEMA }; 