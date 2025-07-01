/**
 * Auth Callback Route
 * Handles the OAuth callback from GitHub
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If no code, redirect to home page
  if (!code) {
    console.error('Auth callback: No code provided');
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }
  
  try {
    // Create a Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Don't persist the session in this context
      }
    });
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
    } else {
      console.log('Auth callback: Successfully exchanged code for session');
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    // Even on error, redirect to the app
  }
  
  // Always redirect back to the application
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 