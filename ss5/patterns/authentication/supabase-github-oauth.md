# Supabase GitHub OAuth Integration

## Status: Validated

## Classification: Authentication

## Problem
Setting up and configuring GitHub OAuth authentication with Supabase in a Next.js application is complex, with many potential pitfalls related to environment-specific URLs and redirect handling.

## Context
This pattern should be applied when:
- Implementing GitHub OAuth authentication with Supabase
- Building applications that need social login functionality
- Working with Next.js App Router and server components
- Deploying to multiple environments (local, staging, production)

## Solution
Implement a standardized approach for integrating GitHub OAuth with Supabase that works reliably across all environments:

1. **Client-side OAuth Initiation**:
   - Create client component for OAuth button
   - Handle redirect URL construction
   - Manage loading and error states

2. **Server-side Callback Handling**:
   - Create route handler for OAuth callback
   - Exchange OAuth code for session
   - Handle reliable redirects after authentication

3. **Environment Configuration**:
   - Configure GitHub OAuth app properly
   - Set up Supabase project with GitHub provider
   - Ensure environment variables are available
   - Use absolute URLs for redirects

## Implementation Example
```typescript
// Client-side OAuth initiation
const handleLogin = async () => {
  const supabase = createClientComponentClient();
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || getBaseUrl();
  
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${baseUrl}/auth/callback`
    }
  });
};

// Server-side callback handler
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
```

## Benefits
- Works across all environments (local, staging, production)
- Properly handles redirects with absolute URLs
- Provides consistent authentication experience
- Integrates with Supabase Auth backend
- Simplifies complex OAuth setup

## Related Patterns
- **Hybrid Auth Flow**: Extends this pattern with additional features
- **Environment Configuration Pattern**: Used for proper URL handling
- **Build Resilient Components**: Ensures components work reliably

## Usage Metrics
- Complexity: Medium
- Reusability: High
- Stories: US-001 (GitHub OAuth Authentication)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-04-15 | Initial pattern | Extracted from HealthBench US-001 implementation | 