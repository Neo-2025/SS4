# Hybrid Auth Flow

## Status: Validated

## Classification: Authentication

## Problem Statement
Implementing OAuth authentication in Next.js applications presents several challenges due to the hybrid rendering model:
- Server-side rendering can cause hydration mismatches with authentication state
- Loading states are difficult to manage consistently across client and server components
- Redirect handling needs to work across development, preview, and production environments
- Session persistence needs to be reliable across page navigations

## Context
This pattern should be applied when implementing authentication in Next.js App Router applications, particularly when using OAuth providers such as GitHub, Google, or social login services.

The pattern is essential for:
- Login pages and authentication flows
- Protected routes that require authentication
- Applications using third-party authentication providers
- Components that need to access user session data

## Solution
Implement a hybrid authentication approach that combines:

1. **Client-side Authentication Components**:
   - React components for login UI with loading states
   - Client-side OAuth redirects via Supabase Auth Helpers
   - React Query for session caching and revalidation

2. **Server-side Auth Handling**:
   - Server-side callback handler for OAuth redirects
   - Middleware for protected route handling
   - Absolute URL handling for multi-environment support

3. **Progressive Enhancement**:
   - Static shell for auth-related pages
   - Client-side enhancements for interactive elements
   - Fallbacks for failed server components

## Implementation Example
```tsx
// 1. Client-side OAuth Button
// components/auth/OAuthButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { GithubIcon } from 'lucide-react'

type OAuthButtonProps = {
  provider: 'github'
  children: React.ReactNode
}

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSignIn = async () => {
    setIsLoading(true)
    
    try {
      // Get the base URL for proper redirection
      const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 
                     (typeof window !== 'undefined' ? window.location.origin : '')
                     
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        },
      })
    } catch (error) {
      console.error('OAuth error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full h-12"
      variant="outline"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          {provider === 'github' && <GithubIcon className="mr-2 h-5 w-5" />}
          {children}
        </span>
      )}
    </Button>
  )
}

// 2. Server-side Auth Callback Handler
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the site URL from the request or environment
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 
                   process.env.VERCEL_URL ? 
                   `https://${process.env.VERCEL_URL}` : 
                   requestUrl.origin;
                   
    // Use absolute URL for redirect
    return NextResponse.redirect(`${baseUrl}/dashboard`)
  }

  // Handle error case - something went wrong
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/login?error=Something went wrong during signin`
  )
}

// 3. Auth Middleware
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create middleware client
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/account', '/game']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Auth routes that should redirect logged-in users to dashboard
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirect logic
  if (isProtectedRoute && !session) {
    // User not authenticated, redirect to login
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    // User is authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/account/:path*',
    '/game/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}

// 4. React Query Auth Hook
// hooks/useAuth.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    error,
    signOut,
  }
}
```

## Benefits
- Works consistently in both server and client rendering contexts
- Provides visual feedback during authentication process
- Handles redirects properly across all environments (local, preview, production)
- Maintains session state reliably with React Query caching
- Follows the progressive enhancement approach for better user experience

## Limitations
- Requires additional dependencies (React Query)
- More complex implementation than simple client-only auth
- Requires careful environment variable setup for redirects
- May need customization for specific OAuth providers

## Related Patterns
- **Supabase GitHub OAuth Integration**: Built upon this integration pattern
- **Environment Configuration Pattern**: Used for proper URL handling
- **Protected Routes Implementation**: Can be used together to secure routes

## Usage Metrics
- Complexity: High
- Reusability: High  
- Stories: US-001 (GitHub OAuth Authentication)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-03-20 | Initial pattern | Implementation in US-001 |
| 1.1 | 2023-04-15 | Refined for SS5 | Enhanced documentation and examples | 