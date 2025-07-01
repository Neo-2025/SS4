import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/app/lib/env';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    cms: {
      status: 'pending',
      data: null,
      error: null
    },
    db: {
      status: 'pending',
      connection: false,
      tables: [],
      error: null
    },
    env: {
      supabaseUrl: Boolean(env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseKey: Boolean(env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      cmsApiUrl: Boolean(env.CMS_API_BASE_URL || process.env.CMS_API_BASE_URL)
    }
  };

  // Test CMS API connectivity
  try {
    const cmsUrl = env.CMS_API_BASE_URL || process.env.CMS_API_BASE_URL || 'https://data.cms.gov/provider-data/api/1';
    console.log(`Testing CMS API connectivity to: ${cmsUrl}`);
    
    // Simple API request to get datasets (public endpoint)
    const response = await fetch(`${cmsUrl}/datasets`, { 
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 } // Disable caching
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    results.cms = {
      status: 'success',
      statusCode: response.status,
      data: data.slice(0, 2), // Just show first 2 items for brevity
      total: data.length
    };
  } catch (error: any) {
    console.error('CMS API test failed:', error);
    results.cms = {
      status: 'error',
      error: error.message
    };
  }

  // Test database connectivity
  try {
    const supabaseUrl = env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    console.log(`Testing Supabase connectivity to: ${supabaseUrl.substring(0, 15)}...`);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by querying public tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      throw new Error(tablesError.message);
    }
    
    results.db = {
      status: 'success',
      connection: true,
      tables: tables.map(t => t.table_name)
    };
    
    // Test agencies table if it exists
    if (tables.some(t => t.table_name === 'agencies')) {
      const { data: agencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('ccn, name')
        .limit(5);
      
      results.db.agencies = {
        exists: true,
        error: agenciesError ? agenciesError.message : null,
        count: agencies ? agencies.length : 0,
        data: agencies ? agencies.slice(0, 2) : null
      };
    } else {
      results.db.agencies = {
        exists: false
      };
    }
    
    // Test command_history table if it exists
    if (tables.some(t => t.table_name === 'command_history')) {
      const { data: commands, error: commandsError } = await supabase
        .from('command_history')
        .select('command')
        .limit(5);
      
      results.db.commandHistory = {
        exists: true,
        error: commandsError ? commandsError.message : null,
        count: commands ? commands.length : 0
      };
    } else {
      results.db.commandHistory = {
        exists: false
      };
    }
  } catch (error: any) {
    console.error('Database connectivity test failed:', error);
    results.db = {
      status: 'error',
      connection: false,
      error: error.message
    };
  }

  // Add environment variable information (without exposing sensitive values)
  results.env.actualCmsUrl = (env.CMS_API_BASE_URL || process.env.CMS_API_BASE_URL || 'https://data.cms.gov/provider-data/api/1').substring(0, 15) + '...';
  
  return NextResponse.json(results);
} 