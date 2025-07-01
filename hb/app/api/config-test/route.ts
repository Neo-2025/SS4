/**
 * Config Test API Route
 * Verifies that required environment variables are properly set
 * ONLY FOR TESTING PURPOSES - Will be disabled in production
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in preview environments
  const isProduction = process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    return NextResponse.json({ 
      error: 'Config test is only available in preview environments'
    }, { status: 403 });
  }

  // Check for required environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasGithubClientId = !!(
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 
    process.env.GITHUB_OAUTH_CLIENT_ID
  );
  const hasGithubClientSecret = !!(
    process.env.GITHUB_CLIENT_SECRET || 
    process.env.GITHUB_OAUTH_CLIENT_SECRET
  );

  // Get GitHub OAuth URL for reference
  const githubOAuthUrl = process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL || 'https://github.com/login/oauth/authorize';
  
  // Return test results
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV || 'development',
    hasSupabaseUrl,
    hasSupabaseKey,
    hasGithubClientId,
    hasGithubClientSecret,
    githubOAuthUrl,
    timestamp: new Date().toISOString()
  });
} 