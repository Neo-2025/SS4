# Build Resilient Components

## Status: Candidate

## Classification: Integration

## Problem Statement
Components fail during build time due to missing environment variables or configuration issues with styling systems like Tailwind CSS.

## Context
Apply this pattern when:
- Your app uses environment variables that might not be available during build time
- You're using a styling system with custom utilities or themes
- You're experiencing build failures in CI/CD pipelines

## Solution
1. For styling issues:
   - Use direct CSS properties instead of custom utility classes when applying theme variables
   - Ensure all theme variables used in utilities are properly defined in configuration

2. For environment variables and external services:
   - Create clients and access environment variables on-demand only when needed at runtime
   - Implement fallbacks and error handling for missing environment variables

## Implementation Example
```tsx
// BAD: Creating client at component level can cause build errors
function Component() {
  // This runs during server-side rendering and build time
  const client = createSomeClient(process.env.API_KEY) 
  
  return <div>Component</div>
}

// GOOD: Create client on-demand only when needed
function Component() {
  const handleAction = () => {
    // Only created when function is called at runtime
    const client = createSomeClient(process.env.API_KEY)
    client.doSomething()
  }
  
  return <div onClick={handleAction}>Component</div>
}
```

```css
/* BAD: Using custom utility classes that might not be processed correctly */
@layer base {
  * {
    @apply border-custom bg-theme;
  }
}

/* GOOD: Using direct CSS properties with theme variables */
@layer base {
  * {
    border-color: hsl(var(--border));
    background-color: hsl(var(--background));
  }
}
```

## Benefits
- Prevents build failures in CI/CD pipelines
- Ensures components work in both development and production
- Reduces debugging time for environment-specific issues
- Makes components more robust in various deployment contexts

## Limitations
- May require more verbose code in some cases
- Less declarative approach with direct CSS properties
- Requires careful consideration of when resources are initialized

## Related Patterns
- **Environment Configuration Pattern**: Provides environment-specific settings
- **Hybrid Auth Flow**: Benefits from this pattern for authentication stability
- **React Snippet Integration**: Uses consistent, stable component approaches

## Usage Metrics
- Complexity: Medium
- Reusability: High  
- Stories: US-001 (GitHub OAuth Authentication)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-03-21 | Initial pattern | Resolved build failures in US-001 |
| 1.1 | 2023-04-15 | Refined for SS5 | Enhanced documentation and examples | 