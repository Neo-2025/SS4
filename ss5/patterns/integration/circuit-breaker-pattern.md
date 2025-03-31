# Pattern: Circuit Breaker

## Status
Validated

## Classification
Integration

## Problem Statement
When integrating with external APIs and services, applications often face reliability issues due to network problems, service outages, or timeouts. These failures can lead to:
- Cascading failures throughout the system
- Poor user experience due to long wait times or errors
- Resource exhaustion as the system keeps trying to make failing calls
- Inability to provide graceful degradation during outages

## Solution
Implement a Circuit Breaker pattern that monitors failures when calling external services and "trips" after a threshold, preventing further calls until the external service recovers. This pattern:
1. Tracks failure counts and circuit state (CLOSED, OPEN, HALF-OPEN)
2. Defines failure thresholds and automatic reset timeouts
3. Provides mechanisms for manual reset
4. Supports fallback operations when the circuit is OPEN

## Implementation Details

### 1. Circuit States
The circuit breaker operates in three states:
- **CLOSED**: Normal operation, requests flow through to the external service
- **OPEN**: Circuit is tripped, requests are immediately rejected or handled by fallbacks
- **HALF-OPEN**: Trial state where a limited number of requests are allowed through to test if the service has recovered

### 2. Typescript Implementation

```typescript
export enum CircuitState {
  CLOSED,  // Normal operation
  OPEN,    // Circuit is open, requests fail fast
  HALF_OPEN // Testing if system has recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private resetTimeout: NodeJS.Timeout | null = null;
  private readonly threshold: number;
  private readonly resetTimeoutMs: number;
  
  constructor(threshold: number = 5, resetTimeoutMs: number = 30000) {
    this.threshold = threshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }
  
  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // If circuit is OPEN, use fallback immediately if available
    if (this.state === CircuitState.OPEN) {
      if (!fallback) {
        throw new Error('Circuit is OPEN and no fallback available');
      }
      return fallback();
    }
    
    try {
      const result = await operation();
      
      // If successful and was in HALF_OPEN, close the circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      return this.handleFailure(fallback);
    }
  }
  
  private handleFailure<T>(fallback?: () => Promise<T>): Promise<T> {
    this.failureCount++;
    
    // If threshold reached, open the circuit
    if (this.state === CircuitState.CLOSED && this.failureCount >= this.threshold) {
      this.tripBreaker();
    }
    
    // If fallback is available, use it
    if (fallback) {
      return fallback();
    }
    
    throw new Error('Operation failed and no fallback available');
  }
  
  private tripBreaker(): void {
    this.state = CircuitState.OPEN;
    
    // Set timeout to transition to HALF_OPEN state
    this.resetTimeout = setTimeout(() => {
      this.state = CircuitState.HALF_OPEN;
      this.failureCount = 0;
    }, this.resetTimeoutMs);
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  reset(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }
}
```

### 3. Usage Example

```typescript
// Create circuit breaker with custom settings
const circuitBreaker = new CircuitBreaker(3, 10000);

// Use the circuit breaker to protect API calls
async function fetchUserData(userId: string) {
  return circuitBreaker.execute(
    // Primary operation
    async () => {
      return await apiClient.get(`/users/${userId}`);
    },
    // Fallback operation
    async () => {
      return await dbCache.getUserData(userId);
    }
  );
}
```

## Benefits
- **Fail Fast**: Prevents resource exhaustion by failing quickly when a service is unavailable
- **Self-Recovery**: Automatically tests for service recovery with the HALF-OPEN state
- **Resilience**: Makes systems more robust against external failures
- **Improved UX**: Users experience graceful degradation instead of errors
- **Operational Visibility**: Provides clear status for monitoring system health

## Evidence
This pattern has been implemented in HealthBench Branch 3.6 for API integration:
- Circuit Breaker implementation: `/app/lib/api/resilience/circuitBreaker.ts`
- Usage with agency API: `/app/lib/services/agency.ts`
- Status command: `/app/lib/commands/system/status.ts`

## Limitations
- Requires careful threshold configuration to avoid premature tripping
- May mask underlying issues if fallbacks become the norm
- Increases complexity of service integration
- Needs monitoring to detect chronically open circuits

## Related Patterns
- Retry Policy Pattern
- Resilience Factory Pattern
- Multi-Layer Fallback Pattern
- Bulkhead Pattern 