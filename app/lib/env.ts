/**
 * Environment Configuration
 * Centralizes all environment variables for HealthBench
 */

export const env = {
  // CMS API Configuration
  CMS_API_KEY: process.env.CMS_API_KEY || '',
  CMS_API_BASE_URL: process.env.CMS_API_BASE_URL || 'https://data.cms.gov/provider-data/api/1',
  
  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Circuit breaker configuration
  CIRCUIT_BREAKER_THRESHOLD: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
  CIRCUIT_BREAKER_RESET_TIMEOUT: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000'),
  
  // Retry policy configuration
  RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || '3'),
  RETRY_INITIAL_DELAY: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'),
  
  // Feature flags
  USE_CBF_MODE: process.env.USE_CBF_MODE === 'true',
}; 