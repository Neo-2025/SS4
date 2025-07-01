import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with fallbacks for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log the initialization (will only show in development)
if (process.env.NODE_ENV === 'development') {
  console.log(`Initializing global Supabase client with URL: ${supabaseUrl.substring(0, 10)}...`);
}

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if Supabase is properly configured
 * Includes checking for GitHub OAuth configuration if githubAuth is true
 */
export const isSupabaseConfigured = (githubAuth = false): boolean => {
  // Check basic Supabase configuration
  const basicConfig = Boolean(supabaseUrl && supabaseAnonKey);
  
  // If GitHub OAuth is required, check for those variables too
  if (githubAuth) {
    // Check for multiple possible variable names (CORE pattern: flexibility for variable naming)
    const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID || 
                          process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 
                          process.env.GITHUB_CLIENT_ID;
    
    const githubClientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET || 
                               process.env.GITHUB_CLIENT_SECRET;
    
    return basicConfig && Boolean(githubClientId && githubClientSecret);
  }
  
  return basicConfig;
};

// Example query function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { success: false, error };
  }
} 