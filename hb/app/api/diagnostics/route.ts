import { NextResponse } from 'next/server';
import { SupabaseService } from '@/app/lib/api/db/supabaseService';
import { checkDatabaseConnection } from '@/app/lib/utils/error-handler';
import { env } from '@/app/lib/env';

export async function GET() {
  try {
    // Check database connection
    const dbService = new SupabaseService();
    const dbStatus = await dbService.checkConnection();
    
    // Check if required tables exist
    const requiredTables = ['agencies', 'agency_groups', 'command_history', 'api_cache'];
    const missingTables = requiredTables.filter(table => !dbStatus.tables.includes(table));
    
    // Check if environment variables are set
    const envStatus = {
      supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
      cmsApi: Boolean(env.CMS_API_BASE_URL && env.CMS_API_KEY),
      circuitBreaker: Boolean(
        env.CIRCUIT_BREAKER_THRESHOLD && 
        env.CIRCUIT_BREAKER_RESET_TIMEOUT
      ),
      retryPolicy: Boolean(
        env.RETRY_ATTEMPTS && 
        env.RETRY_INITIAL_DELAY
      )
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'success',
      database: {
        isConnected: dbStatus.isConnected,
        tables: dbStatus.tables,
        missingTables,
        allTablesExist: missingTables.length === 0
      },
      environmentVariables: envStatus
    }, { status: 200 });
  } catch (error) {
    console.error('Diagnostic error:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 