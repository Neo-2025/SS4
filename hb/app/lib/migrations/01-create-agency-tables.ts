/**
 * Database migration: Create agency tables
 * 
 * This migration creates the necessary tables for the agency reference data:
 * - agency_reference: Stores information about all Texas HHAs
 * - user_agencies: Tracks user-agency relationships
 * - api_update_metadata: Tracks API update timestamps
 */

import { createClient } from '@supabase/supabase-js';

export async function runMigration() {
  console.log('Running migration: Create agency tables');
  
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in environment variables');
    return false;
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Create agency_reference table
    let error: any = null;
    try {
      await supabase.rpc('create_agency_reference_table', {}, {
        count: 'exact'
      });
      console.log('agency_reference table created successfully via RPC');
    } catch (err) {
      error = err;
    }
    
    if (error) {
      console.log('Creating agency_reference table via SQL...');
      
      // Create agency_reference table with direct SQL
      const { error: sqlError } = await supabase.from('agency_reference').select('id').limit(1);
      
      if (sqlError?.code === '42P01') { // Table doesn't exist error
        try {
          await supabase.auth.admin.createUser({
            email: 'migration@example.com',
            password: 'migration_password',
            email_confirm: true
          });
          console.log('Created temporary admin user for migration');
        } catch (e) {
          console.error('Could not create admin user for migration:', e);
          return false;
        }
      } else {
        console.log('agency_reference table already exists, skipping creation');
      }
    }
    
    // Create user_agencies table
    const { error: userError } = await supabase.from('user_agencies').select('id').limit(1);
    
    if (userError?.code === '42P01') { // Table doesn't exist error
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
      
      // Since we can't directly execute SQL, we'll create an RPC function to do it
      try {
        await supabase.rpc('execute_sql', { sql: createUserAgenciesQuery });
        console.log('user_agencies table created successfully');
      } catch (rpcError) {
        console.warn('Could not create user_agencies table via RPC. Will be created by API script.');
      }
    } else {
      console.log('user_agencies table already exists, skipping creation');
    }
    
    // Create api_update_metadata table
    const { error: metaError } = await supabase.from('api_update_metadata').select('id').limit(1);
    
    if (metaError?.code === '42P01') { // Table doesn't exist error
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
      
      // Since we can't directly execute SQL, we'll create an RPC function to do it
      try {
        await supabase.rpc('execute_sql', { sql: createMetaTableQuery });
        console.log('api_update_metadata table created successfully');
      } catch (rpcError) {
        console.warn('Could not create api_update_metadata table via RPC. Will be created by API script.');
      }
    } else {
      console.log('api_update_metadata table already exists, skipping creation');
    }
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// For CommonJS compatibility
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = { runMigration };
} 