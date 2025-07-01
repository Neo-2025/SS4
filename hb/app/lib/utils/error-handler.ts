/**
 * Error Handler Utility
 * Provides functions for handling common errors
 */

import { supabase } from './supabase';

/**
 * Check if the database connection is working
 * @returns Promise<boolean> True if connection is working
 */
export async function checkDatabaseConnection(): Promise<{isConnected: boolean, tables: string[]}> {
  try {
    // Try to get list of tables to check connection
    const { data, error } = await supabase
      .from('_tables')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Database connection error:', error);
      return { isConnected: false, tables: [] };
    }
    
    // Check if command_history table exists
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('Error checking tables:', tableError);
      return { isConnected: false, tables: [] };
    }
    
    const tableNames = (tableData || []).map(t => t.table_name);
    
    return { 
      isConnected: true, 
      tables: tableNames 
    };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { isConnected: false, tables: [] };
  }
}

/**
 * Handle a database error gracefully
 * @param error Error object
 * @param operation String describing the operation
 * @returns Object with error message and code
 */
export function handleDatabaseError(error: any, operation: string): {message: string, code: string} {
  // Check for common Supabase errors
  if (error?.code === 'PGRST116') {
    return {
      message: `No data found for ${operation}`,
      code: 'NOT_FOUND'
    };
  }
  
  if (error?.code === '42P01') {
    return {
      message: `Table not found for ${operation}. Database setup may be incomplete.`,
      code: 'TABLE_NOT_FOUND'
    };
  }
  
  if (error?.code === '28P01') {
    return {
      message: 'Database authentication failed. Check your environment variables.',
      code: 'AUTH_FAILED'
    };
  }
  
  if (error?.message?.includes('Failed to fetch')) {
    return {
      message: 'Could not connect to database. Check your network connection.',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Default error handling
  return {
    message: `Error during ${operation}: ${error?.message || 'Unknown error'}`,
    code: error?.code || 'UNKNOWN'
  };
}

/**
 * Log a detailed error with context
 * @param error Error object
 * @param context Additional context information
 */
export function logDetailedError(error: any, context: Record<string, any> = {}): void {
  console.error('Error details:', {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    stack: error?.stack,
    context
  });
} 