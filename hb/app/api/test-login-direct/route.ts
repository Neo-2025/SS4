/**
 * Direct Test Login API
 * ONE-CLICK solution for test user login in preview environments
 * This creates a test user in Supabase if needed and logs them in directly
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only allow in preview environments
  const isProduction = process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    return NextResponse.json({ 
      error: 'This login endpoint is only available in preview environments'
    }, { status: 403 });
  }

  // Create service role client with admin privileges
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Create client for regular auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const TEST_EMAIL = 'neo@smartscale.co';
  const TEST_PASSWORD = 'Episode2025!';

  try {
    // Step 1: Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    // Find the test user in the list
    let testUser = existingUsers?.users?.find(user => user.email === TEST_EMAIL);
    
    // Step 2: Create test user if needed
    if (!testUser) {
      console.log('Creating test user...');
      
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true
      });
      
      if (createError) {
        return NextResponse.json({ 
          error: `Error creating test user: ${createError.message}`
        }, { status: 500 });
      }
      
      testUser = newUserData.user;
    }
    
    // Step 3: Sign in user directly - but don't try to set cookies in this context
    // Instead, return instructions and info needed to sign in from the client side
    return NextResponse.json({
      success: true,
      message: 'Test user is ready. Use the login command with "neo@smartscale.co" to sign in.',
      email: TEST_EMAIL,
      exists: true
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 