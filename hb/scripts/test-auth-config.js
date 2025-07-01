/**
 * GitHub OAuth Configuration Test
 * 
 * This script tests that our authentication configuration is properly detected.
 * It follows the CORE pattern where Vercel is the primary SOR for environment variables.
 */

require('dotenv').config({ path: '.env.local' });

console.log('🚀 Testing GitHub OAuth Configuration');
console.log('───────────────────────────────────────────────────');

// Check basic Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const basicSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Check GitHub OAuth configuration
const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
const githubOAuthConfigured = Boolean(githubClientId && githubClientSecret);

// Display results
console.log(`📋 Basic Supabase Configuration: ${basicSupabaseConfigured ? '✅ Configured' : '❌ Not Configured'}`);
console.log(`📋 GitHub OAuth Configuration: ${githubOAuthConfigured ? '✅ Configured' : '❌ Not Configured'}`);

// Check specific environment variables
console.log('\n📋 Environment Variable Details:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}`);
console.log(`GITHUB_OAUTH_CLIENT_ID: ${githubClientId ? '✅ Present' : '❌ Missing'}`);
console.log(`GITHUB_OAUTH_CLIENT_SECRET: ${githubClientSecret ? '✅ Present' : '❌ Missing'}`);

console.log('\n📋 Summary:');
if (basicSupabaseConfigured && githubOAuthConfigured) {
  console.log('✅ All configurations are present and correct!');
  console.log('🚀 Ready to proceed with Branch 2 implementation!');
} else {
  console.log('❌ Some configurations are missing.');
  console.log('Please run `npm run vercel:env:pull` to pull the latest environment variables from Vercel (primary SOR).');
} 