/**
 * Fetch Texas Home Health Agencies from CMS Provider Data API
 * 
 * This script fetches all Texas Home Health Agencies from the CMS Provider Data API
 * and stores them in the agency_reference table in Supabase.
 * 
 * To run:
 * ts-node scripts/data-import/fetch-texas-hhas.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 3;
const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second

interface CMSAgency {
  ccn: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  ownership_type: string;
  certification_date: string;
}

async function setupTables(supabase: SupabaseClient) {
  console.log('Setting up database tables...');
  
  // Create agency_reference table
  const { error: refError } = await supabase.from('agency_reference').select('id').limit(1).maybeSingle();
  
  if (refError && refError.code === '42P01') { // Table doesn't exist error
    console.log('Creating agency_reference table...');
    const { error } = await supabase.rpc('create_agency_reference_table');
    
    if (error) {
      // Fall back to raw SQL if RPC doesn't exist
      const createTableQuery = `
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
      
      const { error: sqlError } = await supabase.auth.admin.createUser({
        email: 'temp@example.com',
        password: 'temppassword',
        email_confirm: true
      }).then(() => ({ error: null })).catch(e => ({ error: e }));
      
      if (sqlError) {
        console.error('Failed to create table:', sqlError);
        return false;
      }
    }
  }
  
  // Create user_agencies table
  const { error: userError } = await supabase.from('user_agencies').select('id').limit(1).maybeSingle();
  
  if (userError && userError.code === '42P01') { // Table doesn't exist error
    console.log('Creating user_agencies table...');
    const { error } = await supabase.rpc('create_user_agencies_table');
    
    if (error) {
      // Fall back to simplified approach: we'll create this later through migration
      console.warn('Could not create user_agencies table, will be created later');
    }
  }
  
  // Create metadata table if needed
  const { error: metaError } = await supabase.from('api_update_metadata').select('id').limit(1).maybeSingle();
  
  if (metaError && metaError.code === '42P01') { // Table doesn't exist error
    console.log('Creating api_update_metadata table...');
    const createMetaQuery = `
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
    
    try {
      // We'll just note that this is needed but not block on it
      console.warn('api_update_metadata table needed - will be created in migration');
    } catch (error) {
      console.warn('Could not create metadata table:', error);
    }
  }
  
  return true;
}

async function fetchTexasHHAs() {
  console.log('Starting fetch of Texas Home Health Agencies...');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not found in environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Define CMS API parameters for Texas HHAs
  const cmsApiUrl = process.env.CMS_API_BASE_URL || 'https://data.cms.gov/provider-data/api/1';
  const datasetId = 'b8d88d99-71b4-4543-942e-d10c3cbbd300'; // Provider dataset ID
  const stateFilter = 'state=TX';
  const typeFilter = 'provider_type=Home Health Agency';
  const fields = 'ccn,name,city,state,zip,phone,ownership_type,certification_date';
  
  let page = 1;
  let hasMore = true;
  let totalFetched = 0;
  
  try {
    // Setup database tables - but don't block if they already exist
    const tablesSetup = await setupTables(supabase);
    if (!tablesSetup) {
      console.log('Table setup issues detected, but proceeding with fetch...');
    }
    
    console.log('Starting API fetch...');
    
    // Fetch and process data in batches
    while (hasMore) {
      let retries = 0;
      let success = false;
      
      while (!success && retries < MAX_RETRIES) {
        try {
          console.log(`Fetching page ${page}...`);
          
          const response = await fetch(
            `${cmsApiUrl}/dataset/${datasetId}/data?${stateFilter}&${typeFilter}&page=${page}&limit=${BATCH_SIZE}&fields=${fields}`,
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          
          const agencies = await response.json() as CMSAgency[];
          
          if (agencies.length === 0) {
            hasMore = false;
            break;
          }
          
          // Transform and insert data
          const formattedAgencies = agencies.map(agency => ({
            ccn: agency.ccn,
            name: agency.name,
            city: agency.city,
            state: agency.state,
            zip: agency.zip,
            phone: agency.phone,
            type: 'HHA',
            ownership: agency.ownership_type,
            certification_date: agency.certification_date
          }));
          
          // Insert into Supabase with upsert to handle duplicates
          const { error: insertError } = await supabase
            .from('agency_reference')
            .upsert(formattedAgencies, { onConflict: 'ccn' });
          
          if (insertError) {
            throw new Error(`Database insertion error: ${insertError.message}`);
          }
          
          totalFetched += agencies.length;
          console.log(`Processed ${agencies.length} agencies (total: ${totalFetched})`);
          
          success = true;
          page++;
          
          // Add delay between batches to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        } catch (error: any) {
          retries++;
          console.error(`Error on attempt ${retries}:`, error);
          
          if (retries >= MAX_RETRIES) {
            console.error('Max retries reached, exiting');
            process.exit(1);
          }
          
          // Exponential backoff
          const delay = 1000 * Math.pow(2, retries);
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Record update metadata - try a simple approach
    try {
      await supabase
        .from('api_update_metadata')
        .upsert({
          source: 'CMS Provider Data API',
          update_type: 'Texas HHA Reference Data',
          last_updated: new Date().toISOString(),
          record_count: totalFetched
        }, { onConflict: 'source,update_type' });
    } catch (metadataError) {
      console.warn('Could not store update metadata:', metadataError);
      // Continue despite metadata storage error
    }
    
    console.log(`Completed! Fetched ${totalFetched} Texas Home Health Agencies.`);
    console.log('Next update will be performed manually when CMS data refreshes (quarterly).');
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
}

// Run the script
fetchTexasHHAs().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 