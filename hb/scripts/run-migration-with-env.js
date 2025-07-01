#!/usr/bin/env node

/**
 * Migration Runner with .env Support
 * 
 * This script loads environment variables from .env file and runs migrations
 * Usage: node scripts/run-migration-with-env.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Now run the migration script with environment variables loaded
require('./run-migrations-direct');

console.log('For instructions on running Supabase migrations using the CLI, see:');
console.log('https://supabase.com/docs/reference/cli/introduction');
console.log('\nTo install the Supabase CLI:');
console.log('npm install -g supabase');
console.log('\nTo login and set up:');
console.log('supabase login');
console.log('\nTo link your project:');
console.log('supabase link --project-ref your-project-ref');
console.log('\nTo run migrations:');
console.log('supabase db push'); 