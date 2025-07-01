#!/usr/bin/env node

/**
 * Direct Supabase Migration Runner
 * 
 * This script runs migrations directly without requiring TypeScript imports
 * Usage: node scripts/run-migrations-direct.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n')
      .filter(line => line.trim() !== '' && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          acc[key.trim()] = value.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
        }
        return acc;
      }, {});
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      if (!process.env[key]) {
        process.env[key] = envVars[key];
      }
    });
    
    console.log('Loaded environment variables from .env.local');
  } catch (error) {
    console.error('Error loading .env.local file:', error.message);
  }
}

// Load environment variables
loadEnv();

async function runMigration() {
  console.log('Running migration: Create agency tables');
  
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugtepudnmpvgormpcuje.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGVwdWRubXB2Z29ybXBjdWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzI3MDg5OCwiZXhwIjoyMDU4ODQ2ODk4fQ.X4KZNZq8Rk_L3U1FJO-lmcLhFTZFSgNaOgtEIsjbb0M';
  
  console.log('Using Supabase URL:', supabaseUrl);
  console.log('Using Supabase Key:', supabaseKey.substring(0, 10) + '...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in environment variables');
    return false;
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Create agency_reference table
    try {
      console.log('Checking for agency_reference table...');
      const { error: checkError } = await supabase.from('agency_reference').select('id').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Creating agency_reference table...');
        const createRefTableQuery = `
          CREATE TABLE IF NOT EXISTS public.agency_reference (
            id SERIAL PRIMARY KEY,
            ccn TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            city TEXT,
            state TEXT NOT NULL,
            zip TEXT,
            phone TEXT,
            type TEXT,
            ownership TEXT,
            certification_date TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_agency_reference_ccn ON public.agency_reference(ccn);
          CREATE INDEX IF NOT EXISTS idx_agency_reference_name ON public.agency_reference(name);
        `;
        
        // Since we can't directly execute SQL in most cases through client,
        // we'll have instructions for using the Supabase web interface
        console.log('IMPORTANT: Please execute this SQL in the Supabase web interface:');
        console.log(createRefTableQuery);
      } else {
        console.log('agency_reference table already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error checking/creating agency_reference table:', error);
    }
    
    // Create user_agencies table
    try {
      console.log('Checking for user_agencies table...');
      const { error: checkError } = await supabase.from('user_agencies').select('id').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Creating user_agencies table...');
        const createUserAgenciesQuery = `
          CREATE TABLE IF NOT EXISTS public.user_agencies (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            ccn TEXT NOT NULL,
            group_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, ccn)
          );
          
          CREATE INDEX IF NOT EXISTS idx_user_agencies_user_id ON public.user_agencies(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_agencies_ccn ON public.user_agencies(ccn);
        `;
        
        console.log('IMPORTANT: Please execute this SQL in the Supabase web interface:');
        console.log(createUserAgenciesQuery);
      } else {
        console.log('user_agencies table already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error checking/creating user_agencies table:', error);
    }
    
    // Create api_update_metadata table
    try {
      console.log('Checking for api_update_metadata table...');
      const { error: checkError } = await supabase.from('api_update_metadata').select('id').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        console.log('Creating api_update_metadata table...');
        const createMetaTableQuery = `
          CREATE TABLE IF NOT EXISTS public.api_update_metadata (
            id SERIAL PRIMARY KEY,
            source TEXT NOT NULL,
            update_type TEXT NOT NULL,
            last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
            record_count INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(source, update_type)
          );
        `;
        
        console.log('IMPORTANT: Please execute this SQL in the Supabase web interface:');
        console.log(createMetaTableQuery);
      } else {
        console.log('api_update_metadata table already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error checking/creating api_update_metadata table:', error);
    }
    
    console.log('Migration check completed. Copy any SQL statements above to execute in Supabase SQL Editor if needed.');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Run the migration
runMigration()
  .then(success => {
    if (success) {
      console.log('Migration process completed!');
    } else {
      console.error('Migration process failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error in migration process:', err);
    process.exit(1);
  }); 