#!/usr/bin/env node
// HealthBench Live Schema via Supabase CLI
// Workaround for Row Zero's IPv4-only paid tier access

const { execSync } = require('child_process');
const fs = require('fs');

const PROJECT_REF = 'ugtepudnmpvgormpcuje';

async function getSchemaViaCLI() {
  console.log('🏥 HealthBench Live Schema via Supabase CLI\n');
  
  try {
    // Test CLI access
    console.log('🔍 Testing Supabase CLI access...');
    const projects = execSync('supabase projects list', { encoding: 'utf8' });
    
    if (!projects.includes(PROJECT_REF)) {
      console.log('❌ Project not found in CLI. Need to login first.');
      return;
    }
    
    console.log('✅ CLI access confirmed');
    
    // Get database schema using CLI
    console.log('\n📋 Fetching live schema...');
    
    const schemaCommand = `supabase db dump --schema public --project-ref ${PROJECT_REF}`;
    const schema = execSync(schemaCommand, { encoding: 'utf8' });
    
    // Parse schema for tables
    const tables = [];
    const lines = schema.split('\n');
    
    for (const line of lines) {
      if (line.includes('CREATE TABLE')) {
        const match = line.match(/CREATE TABLE (?:public\.)?(\w+)/);
        if (match) {
          tables.push(match[1]);
        }
      }
    }
    
    console.log(`\n📊 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${table}`);
    });
    
    // Check HealthBench core tables
    const healthBenchTables = [
      'agency_reference',
      'agency_geozip_coverage', 
      'h3_index',
      'geozip',
      'hhcahps_survey_results'
    ];
    
    console.log(`\n🎯 HEALTHBENCH CORE TABLES:`);
    healthBenchTables.forEach(table => {
      const exists = tables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // Save schema to file for offline reference
    fs.writeFileSync('hb/live-schema.sql', schema);
    console.log(`\n💾 Full schema saved to hb/live-schema.sql`);
    
    return { tables, schema };
    
  } catch (error) {
    console.error('❌ CLI Error:', error.message);
    
    if (error.message.includes('not logged in')) {
      console.log('\n🔑 Need to login to Supabase CLI:');
      console.log('   supabase login');
    }
  }
}

async function getTableSchema(tableName) {
  console.log(`🔍 Getting schema for table: ${tableName}`);
  
  try {
    // Get table definition from CLI
    const command = `supabase db dump --schema public --table ${tableName} --project-ref ${PROJECT_REF}`;
    const result = execSync(command, { encoding: 'utf8' });
    
    console.log(`\n📋 ${tableName.toUpperCase()} SCHEMA:`);
    console.log(result);
    
  } catch (error) {
    console.error(`❌ Error getting ${tableName}:`, error.message);
  }
}

// SCHEMA shortcut for instant access
async function schema(tableName = null) {
  if (tableName) {
    await getTableSchema(tableName);
  } else {
    await getSchemaViaCLI();
  }
}

// Run if called directly
if (require.main === module) {
  const tableName = process.argv[2];
  schema(tableName);
}

// Export for use in other scripts
module.exports = { getSchemaViaCLI, getTableSchema, schema }; 