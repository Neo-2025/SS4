# SS4-Native SaaS Template Development Prompt Chain

## Overview

This document provides a structured prompt chain for building a comprehensive SaaS template that follows SmartStack v4 (SS4) and Branch First (B1) principles. The template aims to solve the limitations of existing templates like the [Next.js SaaS Starter](https://vercel.com/templates/next.js/next-js-saas-starter-1) while providing additional capabilities like Web3/Polygon integration.

## Purpose

The purpose of this prompt chain is to:

1. Guide the development of a robust, deployable SaaS foundation
2. Ensure SS4-B1 workflow compatibility at every step
3. Address common integration issues between Next.js, Supabase, and Stripe
4. Provide optional Web3 capabilities for token-based economies
5. Create a template that can be easily customized for various MVP use cases

## Prompt Chain Structure

This chain is designed to be followed sequentially, with each prompt building upon the previous one. However, the Web3/Polygon integration section is optional and can be skipped for projects that don't require blockchain functionality.

## Phase 1: Architecture & Foundation

### Prompt 1: SaaS Architecture Blueprint

```
I'm creating a native SS4 SaaS template following the Branch First workflow. Help me design a scalable architecture that solves the limitations of the Vercel SaaS template (https://vercel.com/templates/next.js/next-js-saas-starter-1).

Please create an architecture blueprint that includes:

1. Next.js App Router structure that properly separates client and server components
2. Authentication strategy using Supabase that works reliably with SSR
3. Database schema design with Drizzle ORM that supports extensibility
4. Middleware approach that avoids race conditions and properly handles auth state
5. Environment variable strategy that prevents build-time failures

For each component, explain:
- How it avoids the integration issues of the standard template
- How it maintains SS4-B1 workflow compatibility
- How it could be extended for different use cases

Focus on creating a foundation that compiles and deploys reliably, even if missing some advanced features initially.

When finished, use the format: "SS4-B1 Architecture Blueprint: [SUMMARY] | Next Step: [RECOMMENDATION]"
```

### Prompt 2: Environment Configuration System

```
Following the SS4-B1 workflow, help me create a robust environment configuration system for our native SS4 SaaS template that prevents the deployment failures we encountered with the Vercel template.

Please design:

1. A hierarchical .env structure that separates:
   - Core template requirements
   - Service-specific configurations (Supabase, Stripe, Polygon)
   - Environment-specific overrides (dev, preview, production)

2. A validation system that:
   - Detects missing required variables early
   - Provides clear error messages
   - Has graceful fallbacks for non-critical services

3. A setup script that:
   - Walks users through configuration
   - Tests connections to external services
   - Validates the complete environment

4. Documentation for environment setup that clearly explains:
   - Which variables are required vs. optional
   - How to obtain credentials for each service
   - Troubleshooting common configuration issues

Follow the complete SS4-B1 workflow for implementation and provide code examples for each component.

When finished, summarize with "SS4-B1 Environment System Complete: [SUMMARY] | Next: [RECOMMENDATION]"
```

## Phase 2: Authentication & Core Components

### Prompt 3: Hybrid Auth System

```
I need to implement a hybrid authentication system following the SS4-B1 workflow. This system should solve the server-side rendering issues we encountered with the Vercel SaaS template.

Design and implement a hybrid auth system with:

1. Client-side authentication context that:
   - Manages auth state consistently across the application
   - Handles token refresh transparently
   - Provides useful hooks for components to access auth state

2. Server-side auth helpers that:
   - Safely access session data in server components
   - Have proper error handling and fallbacks
   - Work reliably with middleware

3. Middleware implementation that:
   - Handles authentication checks without race conditions
   - Uses a progressive enhancement approach
   - Gracefully handles auth failures

4. A flexible OAuth system supporting:
   - GitHub, Google, and email authentication initially
   - Extensibility for additional providers
   - Proper redirect handling in all environments

Please include tests for key authentication flows and document potential edge cases.

When completed, summarize with "SS4-B1 Auth System Implemented: [SUMMARY] | Test with: [INSTRUCTIONS]"
```

### Prompt 4: Dashboard & Navigation System

```
Help me implement a dashboard and navigation system following the SS4-B1 workflow. This system should work reliably regardless of authentication state and avoid the server-rendering errors in the Vercel template.

Please design and implement:

1. A hybrid rendering strategy with:
   - Static shell components that load instantly
   - Client-side data fetching with loading states
   - Progressive enhancement for authenticated content

2. A navigation system that:
   - Works with or without JavaScript
   - Properly handles authenticated/unauthenticated states
   - Maintains state during navigation

3. Dashboard components that:
   - Display placeholder content during loading
   - Handle error states gracefully
   - Adapt to different user access levels

4. State management approach that:
   - Caches user data appropriately
   - Refreshes stale data automatically
   - Preserves UI state during soft navigation

Include documentation on how this system solves the server-rendering issues we encountered.

When complete, summarize with "SS4-B1 Dashboard Implemented: [SUMMARY] | Preview at: [URL]"
```

## Phase 3: Payment Integration & Subscription Management

### Prompt 5: Stripe Integration with Fallbacks

```
Following the SS4-B1 workflow, help me implement a robust Stripe integration that handles payment processing and subscription management with proper fallbacks.

Please design and implement:

1. A modular Stripe integration that:
   - Can be enabled/disabled without breaking the application
   - Works with test keys during development
   - Supports both checkout sessions and customer portal

2. Subscription management that:
   - Persists subscription data in database
   - Handles webhook events reliably
   - Updates user permissions based on subscription status

3. Stripe server components that:
   - Safely handle API calls with proper error boundaries
   - Provide fallback UI when API calls fail
   - Maintain security best practices

4. Client-side components that:
   - Work with or without JavaScript
   - Provide feedback on payment status
   - Handle common payment error scenarios

Include comprehensive testing instructions and document the fallbacks implemented.

When finished, use the format: "SS4-B1 Stripe Integration Complete: [SUMMARY] | Test with: [INSTRUCTIONS]"
```

## Phase 4: Web3/Polygon Integration (Optional)

### Prompt 6: Modular Polygon Integration

```
I need to implement an optional Polygon integration following the SS4-B1 workflow. This should provide Web3 capabilities while maintaining compatibility with users who don't need blockchain features.

Design and implement a modular Polygon system with:

1. A plugin architecture that:
   - Can be enabled/disabled without affecting core functionality
   - Lazy loads Web3 components only when needed
   - Properly handles wallet connections and disconnections

2. Smart contract integration that:
   - Includes sample contracts for token management
   - Provides hooks for common contract interactions
   - Handles transaction state and errors

3. User token management that:
   - Displays token balances and history
   - Facilitates token transfers
   - Integrates with subscription/membership status

4. A Web3 authentication option that:
   - Allows sign-in with Ethereum wallets
   - Links traditional auth with wallet addresses
   - Maintains session state appropriately

Include documentation on setup requirements and clear instructions for enabling/disabling this module.

When completed, summarize with "SS4-B1 Polygon Integration: [SUMMARY] | Testing: [INSTRUCTIONS]"
```

## Phase 5: Deployment & Documentation

### Prompt 7: Deployment Pipeline & Documentation

```
Help me create a comprehensive deployment pipeline and documentation for our SS4-native SaaS template following the Branch First workflow.

Please design and implement:

1. A Vercel deployment configuration that:
   - Properly handles environment variables
   - Sets up preview deployments for branches
   - Configures build caching optimally

2. GitHub workflow files that:
   - Run tests on pull requests
   - Check for environment configuration issues
   - Ensure code quality standards

3. Comprehensive template documentation covering:
   - Initial setup and configuration
   - Authentication flows and customization
   - Payment integration options
   - Polygon/Web3 extension setup (optional)
   - Common customization scenarios

4. Troubleshooting guide that addresses:
   - Known limitations and workarounds
   - Environment configuration issues
   - Authentication debugging
   - Deployment problem resolution

Follow the SS4-B1 workflow for this implementation, showing each step in the process.

When completed, summarize with "SS4-B1 Deployment & Docs Complete: [SUMMARY] | Next Steps: [RECOMMENDATIONS]"
```

## Technical Implementation Details

### Architecture Considerations

#### Auth System Architecture

- Use a hybrid approach with React Context for client state
- Implement `useSession` hook with SWR for caching and revalidation
- Create server-side helpers with proper error boundaries
- Keep sensitive operations in API routes with proper validation
- Use middleware only for simple redirects, not complex auth logic

#### Database Schema Considerations

- Core tables: users, profiles, subscriptions, api_keys
- Optional tables: wallet_connections, tokens, token_transactions
- Use incremental migrations that can be applied selectively 
- Implement schema versioning for compatibility checks
- Create extension points for custom data models

#### Middleware Strategy

- Split middleware by concern (auth, redirects, logging)
- Use matchers to limit middleware scope
- Implement graceful fallbacks for auth failures
- Add extensive logging for debugging
- Create middleware testing utilities

#### Polygon Integration Details

- Use ethers.js or viem for Ethereum interactions
- Implement abstraction layer for smart contract calls
- Support Mumbai testnet and Polygon mainnet
- Include sample contracts for:
  - Membership NFTs
  - Utility tokens
  - Access control
- Provide hooks for common Web3 operations

### Environment Variable Structure

```
# Core (always required)
NEXT_PUBLIC_SITE_URL=
DATABASE_URL=

# Auth (required for auth features)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payments (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Web3 (optional)
NEXT_PUBLIC_ENABLE_WEB3=false
NEXT_PUBLIC_DEFAULT_CHAIN_ID=137
POLYGON_RPC_URL=
CONTRACT_ADDRESS_MEMBERSHIP=
```

## Implementation Timeline

1. **Foundation**: Architecture + environment configuration (1-2 weeks)
2. **Core**: Auth system + dashboard components (2-3 weeks)
3. **Payments**: Stripe integration + subscription management (1-2 weeks)
4. **Web3/Optional**: Polygon integration + token economy (2-3 weeks)
5. **Completion**: Documentation + deployment pipeline (1 week)

## Key Advantages Over Standard Template

1. **Reliable Authentication**: Hybrid auth approach prevents SSR errors
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Modular Design**: Features can be enabled/disabled without breaking the app
4. **Error Resilience**: Proper error boundaries and fallbacks throughout
5. **Web3 Ready**: Optional blockchain integration for token economies
6. **Deployment Robustness**: Environment validation prevents common deployment failures
7. **SS4-B1 Compatible**: Designed for branch-based workflows with preview deployments

## Conclusion

This prompt chain provides a comprehensive guide for building a robust SaaS template that follows SS4-B1 principles while addressing the limitations of existing solutions. By following this approach, you can create a foundation that is both reliable for deployment and flexible for customization across various MVP use cases.

---

*This document serves as a guide for building a native SS4 SaaS template using Cursor AI Agent. Follow the prompts sequentially to develop a complete solution.* 