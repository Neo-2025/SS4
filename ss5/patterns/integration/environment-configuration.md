# Environment Configuration

## Status: Validated

## Classification: Integration

## Problem
Environment variables are not properly accessible or configured for multi-environment deployments, leading to inconsistencies between development, preview, and production environments, particularly with URL handling.

## Context
This pattern should be applied when:
- Building applications that will be deployed to multiple environments
- Working with environment-specific configuration
- Handling OAuth redirects or other URL-dependent functionality
- Ensuring consistent configuration across different deployment contexts

## Solution
Implement a hierarchical environment configuration system with:

1. **Base URL Management**:
   - Utility functions for determining the correct base URL
   - Environment detection with appropriate fallbacks
   - URL construction helpers for absolute paths

2. **Environment Variable Handling**:
   - Prioritized access to environment variables
   - Fallback mechanisms for missing variables
   - Default values for development environments
   - Runtime validation of required variables

3. **Configuration Structure**:
   - Environment-specific configuration objects
   - Merged configuration with appropriate overrides
   - Type-safe configuration access
   - Configuration validation

## Implementation Example
```typescript
// Base URL utility with proper fallbacks
export function getBaseUrl(): string {
  // Browser environment
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // Priority order for environment variables
  if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL;
  }
  
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development fallback
  return "http://localhost:3000";
}

// Environment-aware configuration creator
export function createConfig() {
  const environment = process.env.NODE_ENV || 'development';
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';
  const isTest = environment === 'test';
  
  // Base configuration
  const baseConfig = {
    environment,
    isDevelopment,
    isProduction,
    isTest,
    baseUrl: getBaseUrl(),
    apiTimeout: 10000,
    features: {
      analytics: !isDevelopment,
      debugMode: isDevelopment,
    }
  };
  
  // Environment-specific overrides
  const envConfigs = {
    development: {
      apiTimeout: 30000, // Longer timeout for development
      features: {
        mockResponses: true,
      }
    },
    production: {
      apiTimeout: 8000, // Shorter timeout for production
      features: {
        mockResponses: false,
      }
    },
    test: {
      apiTimeout: 1000, // Very short for tests
      features: {
        mockResponses: true,
      }
    }
  };
  
  // Merge base config with environment-specific config
  return {
    ...baseConfig,
    ...(envConfigs[environment] || {}),
    
    // Helper functions
    getAbsoluteUrl: (path: string) => `${baseConfig.baseUrl}${path.startsWith('/') ? path : `/${path}`}`,
    isFeatureEnabled: (feature: string) => baseConfig.features[feature] || false,
  };
}

// Usage for authentication redirects
const config = createConfig();
const redirectUrl = config.getAbsoluteUrl('/auth/callback');

// React hook for accessing configuration
export function useConfig() {
  // Could add caching, context, or other enhancements
  return createConfig();
}
```

## Benefits
- Ensures consistent environment handling across the application
- Automatically supports preview deployments
- Prevents common errors with OAuth redirects and API URLs
- Simplifies environment configuration with fallbacks
- Provides type-safe access to configuration values
- Centralizes environment logic

## Related Patterns
- **Hybrid Auth Flow**: Uses environment configuration for proper redirects
- **Build Resilient Components**: Ensures components work across environments
- **Supabase GitHub OAuth Integration**: Relies on proper environment URLs

## Usage Metrics
- Complexity: Medium
- Reusability: High
- Stories: US-000 (Project Setup), US-001 (GitHub OAuth Authentication)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-04-15 | Initial pattern | Extracted from HealthBench US-000 implementation | 