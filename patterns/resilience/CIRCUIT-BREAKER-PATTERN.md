---
status: Adaptive
classification: resilience
---

# CIRCUIT-BREAKER-PATTERN

## Status

**Current Status**: Adaptive
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 2
- Projects: 1
- Related Patterns: 2

## Classification

Resilience Pattern

## Problem

External API calls and service integrations can fail for various reasons (service outages, network issues, rate limiting). Without proper handling, these failures can cascade through the system, causing degraded performance or complete system failure. Traditional timeout and retry mechanisms alone don't prevent resource exhaustion when a service is experiencing persistent issues.

## Solution

The Circuit Breaker pattern detects failures and prevents the application from repeatedly trying to execute an operation that's likely to fail. Like an electrical circuit breaker, it trips when issues are detected, stopping further requests to the failing service. It provides three states (CLOSED, OPEN, HALF-OPEN) to manage service access based on failure patterns.

### Core Components

1. **State Machine**: Manages transitions between CLOSED, OPEN, and HALF-OPEN states
2. **Failure Counter**: Tracks consecutive failures to determine when to trip 
3. **Timeout Management**: Controls when to attempt recovery after tripping
4. **Fallback Mechanism**: Provides alternative behavior when the circuit is OPEN

### States

1. **CLOSED**: Normal operation - requests pass through to the service
2. **OPEN**: Circuit is tripped - requests immediately fail or use fallback
3. **HALF-OPEN**: Testing recovery - limited requests pass through to see if service has recovered

## Implementation Example

```typescript
/**
 * Circuit Breaker pattern implementation for fault tolerance
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;
  
  constructor(
    failureThreshold: number = 5,
    resetTimeout: number = 30000,
    successThreshold: number = 2
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.successThreshold = successThreshold;
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        return fallback();
      } else {
        throw new Error('Circuit is OPEN and no fallback provided');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
  
  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    
    const now = new Date();
    return (now.getTime() - this.lastFailureTime.getTime()) > this.resetTimeout;
  }
  
  /**
   * Check if the circuit breaker is in OPEN state
   */
  isOpen(): boolean {
    return this.state === 'OPEN';
  }
}
```

## Benefits

1. **Fail Fast**: Quickly fails requests to services known to be unavailable
2. **Resilience**: Prevents cascading failures through the system
3. **Self-Healing**: Automatically tests recovery with HALF-OPEN state
4. **Resource Conservation**: Prevents resource exhaustion during service issues
5. **Fallback Options**: Supports alternative paths for continued operation
6. **User Experience**: Maintains responsive system behavior even during external service failures

## Limitations

1. **Configuration Sensitivity**: Threshold and timeout values require tuning
2. **Fallback Quality**: Effectiveness depends on quality of fallback implementations
3. **State Management**: In distributed systems, state synchronization can be challenging
4. **Cross-Request Impact**: When tripped, impacts all requests, not just problematic ones
5. **Debugging Complexity**: Can mask underlying issues by preventing calls

## Related Patterns

- **CSV-FALLBACK-MECHANISM**: Often used as the fallback mechanism when circuit is OPEN
- **RESILIENT-API-GATEWAY**: Combines Circuit Breaker with Retry and Fallback patterns
- **RETRY-POLICY-PATTERN**: Complements Circuit Breaker by handling transient failures

## Usage Examples

### Integration with Resilient API Gateway

```typescript
export class ResilientApiGateway {
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;
  
  constructor(options?: CircuitBreakerConfig & RetryPolicyConfig) {
    this.circuitBreaker = new CircuitBreaker(
      options?.failureThreshold,
      options?.resetTimeout
    );
    
    this.retryPolicy = new RetryPolicy({
      maxRetries: options?.maxRetries,
      initialDelay: options?.initialDelay
    });
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    return this.circuitBreaker.execute(
      () => this.retryPolicy.execute(operation),
      fallback
    );
  }
  
  // Agency-specific methods with CSV fallback
  async getAgencyData(apiCall: (ccn: string) => Promise<any>, ccn: string): Promise<any> {
    return this.execute(
      () => apiCall(ccn),
      () => csvDataSource.getAgencyData(ccn)
    );
  }
  
  // Check if in fallback mode
  isInCBFMode(): boolean {
    return this.circuitBreaker.isOpen() || process.env.USE_CBF_MODE === 'true';
  }
}
```

## Evolution History

- **v1.0**: Basic Circuit Breaker implementation with three states
- **v1.1**: Added support for success threshold in HALF-OPEN state
- **v1.2**: Added integration with CSV Fallback for offline operation
- **v1.3**: Added isOpen() method and CBF Mode detection 