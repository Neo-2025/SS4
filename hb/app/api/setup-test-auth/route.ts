/**
 * Setup Test Auth API
 * ONE-TIME SETUP for test user in preview environments
 * This creates a test user account in Supabase for testing purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Only allow in preview environments
  const isProduction = process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    return NextResponse.json({ 
      error: 'This setup endpoint is only available in preview environments'
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

  try {
    // First check if user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      return NextResponse.json({ 
        error: `Error searching for users: ${searchError.message}`
      }, { status: 500 });
    }
    
    // Find the test user in the list
    const testUser = existingUsers?.users?.find(user => user.email === 'neo@smartscale.co');
    
    if (testUser) {
      return NextResponse.json({ 
        message: 'Test user already exists',
        user: { 
          id: testUser.id,
          email: testUser.email,
          created_at: testUser.created_at
        }
      });
    }
    
    // Create test user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'neo@smartscale.co',
      password: 'Episode2025!',
      email_confirm: true
    });
    
    if (error) {
      return NextResponse.json({ 
        error: `Error creating test user: ${error.message}`
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 