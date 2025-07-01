import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/app/lib/env';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    tables: [],
    queries: {},
    env: {
      supabaseUrl: Boolean(env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseKey: Boolean(env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  };
  
  try {
    // Create direct client
    const supabaseUrl = env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    results.env.actualUrl = supabaseUrl.substring(0, 10) + '...'; // Just show prefix for security
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        ...results,
        error: 'Missing Supabase credentials',
        status: 'error'
      }, { status: 500 });
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    results.tests.clientCreated = true;
    
    // Test connection
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (tablesError) {
      results.tests.tablesQuery = false;
      results.error = tablesError.message;
      results.status = 'error';
      return NextResponse.json(results, { status: 500 });
    }
    
    results.tests.tablesQuery = true;
    results.tables = tablesData.map(t => t.table_name);
    
    // Test agencies table
    if (results.tables.includes('agencies')) {
      results.tests.agenciesTableExists = true;
      
      // Test agency insert
      const testAgency = {
        ccn: '999999',
        name: 'Test Agency',
        address: '123 Test St',
        city: 'Testville',
        state: 'TX',
        zip: '12345',
        phone: '555-1234',
        type: 'HHA',
        ownership: 'Test',
        certification_date: new Date().toISOString()
      };
      
      // Try to insert a test agency
      const { data: insertData, error: insertError } = await supabase
        .from('agencies')
        .upsert(testAgency)
        .select();
      
      results.tests.agencyInsert = !insertError;
      if (insertError) {
        results.queries.insertError = insertError.message;
      } else {
        results.queries.insertResult = insertData;
      }
      
      // Try to query agencies
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .limit(5);
      
      results.tests.agencyQuery = !agencyError;
      if (agencyError) {
        results.queries.queryError = agencyError.message;
      } else {
        results.queries.agencies = agencyData;
      }
    } else {
      results.tests.agenciesTableExists = false;
    }
    
    // Check command_history table
    if (results.tables.includes('command_history')) {
      results.tests.commandHistoryTableExists = true;
      
      // Test insert into command_history
      const testCommand = {
        command: 'test',
        args: { test: true },
        success: true
      };
      
      const { error: cmdInsertError } = await supabase
        .from('command_history')
        .insert(testCommand);
      
      results.tests.commandHistoryInsert = !cmdInsertError;
      if (cmdInsertError) {
        results.queries.commandInsertError = cmdInsertError.message;
      }
    } else {
      results.tests.commandHistoryTableExists = false;
    }
    
    results.status = 'success';
    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      ...results,
      error: error.message,
      status: 'error'
    }, { status: 500 });
  }
} 