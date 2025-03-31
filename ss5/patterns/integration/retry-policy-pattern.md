# Pattern: Retry Policy

## Status
Validated

## Classification
Integration

## Problem Statement
When integrating with external services and APIs, transient failures frequently occur due to:
- Network connectivity issues
- Temporary service outages or maintenance
- Rate limiting or throttling
- Momentary resource constraints

These transient failures, if not properly handled, can lead to poor user experience, service degradation, and unnecessary error handling complexity in client code.

## Solution
Implement a Retry Policy pattern that automatically retries failed operations with an exponential backoff strategy, reducing immediate retry load while increasing the probability of eventual success for transient failures.

Key components:
1. Configurable maximum retry attempts
2. Exponential backoff delay calculation
3. Operation wrapping for seamless integration
4. Transparent error handling

## Implementation Details

### 1. Core Retry Policy Implementation

```typescript
export class RetryPolicy {
  private readonly maxRetries: number;
  private readonly initialDelayMs: number;
  
  constructor(maxRetries: number = 3, initialDelayMs: number = 1000) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | unknown;
    
    for (let retryCount = 0; retryCount <= this.maxRetries; retryCount++) {
      try {
        // Wait before retry (except first attempt)
        if (retryCount > 0) {
          await this.delay(this.calculateBackoff(retryCount));
        }
        
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Retry ${retryCount}/${this.maxRetries} failed:`, error);
      }
    }
    
    throw lastError;
  }
  
  private calculateBackoff(retryCount: number): number {
    // Exponential backoff: initialDelay * 2^retryCount
    return this.initialDelayMs * Math.pow(2, retryCount - 1);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2. Environment-Aware Configuration

```typescript
// Environment configuration (app/lib/env.ts)
export const env = {
  // Other configurations...
  RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || '3'),
  RETRY_INITIAL_DELAY: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'),
};

// Using environment configuration
const retryPolicy = new RetryPolicy(
  env.RETRY_ATTEMPTS,
  env.RETRY_INITIAL_DELAY
);
```

### 3. Usage Example

```typescript
// Create a retry policy
const retryPolicy = new RetryPolicy(3, 1000);

// Use the retry policy to wrap an API call
async function fetchUserData(userId: string) {
  return retryPolicy.execute(async () => {
    return await apiClient.get(`/users/${userId}`);
  });
}

// Can be combined with Circuit Breaker for more resilience
async function fetchDataWithResilience(userId: string) {
  return circuitBreaker.execute(
    async () => {
      return retryPolicy.execute(async () => {
        return await apiClient.get(`/users/${userId}`);
      });
    },
    async () => {
      return getCachedUserData(userId);
    }
  );
}
```

## Benefits
- **Handles Transient Failures**: Automatically recovers from temporary issues
- **Reduces Error Noise**: Filters out transient errors, only surfacing persistent ones
- **Improves Reliability**: Increases chance of operation success without developer intervention
- **Backoff Strategy**: Prevents overwhelming systems under stress with immediate retries
- **Simple Integration**: Easy to integrate with existing code through wrapper pattern

## Evidence
This pattern has been implemented in the HealthBench Branch 3.6 API integration:
- Retry Policy implementation: `/app/lib/api/resilience/retryPolicy.ts`
- Integration with services: `/app/lib/api/resilience/resilienceFactory.ts`
- Environment configuration: `/app/lib/env.ts`

## Limitations
- Not suitable for non-idempotent operations (those that shouldn't be repeated)
- Can increase latency due to wait times between retries
- May mask underlying issues if retries become normal behavior
- Not effective for persistent failures
- Requires careful tuning of retry count and backoff parameters

## Related Patterns
- Circuit Breaker Pattern
- Resilience Factory Pattern
- Bulkhead Pattern
- Timeout Pattern 