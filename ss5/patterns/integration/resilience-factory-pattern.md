# Pattern: Resilience Factory

## Status
Validated

## Classification
Integration

## Problem Statement
Implementing resilience patterns like Circuit Breaker and Retry Policy requires intrusive changes to service implementations. This leads to:
- Code duplication as similar resilience logic is added to multiple services
- Mixed concerns where business logic is tangled with resilience logic
- Inconsistent implementation of resilience patterns across services
- Difficulty in testing service logic independently from resilience logic

## Solution
Create a Resilience Factory that transforms ordinary services into resilient ones by wrapping their methods with circuit breaker and retry policies without modifying the original service implementation. This factory:

1. Accepts any service and a list of methods to make resilient
2. Returns a proxy that wraps the specified methods with resilience patterns
3. Maintains the original API interface for seamless integration
4. Supports customized fallback mechanisms for each service

## Implementation Details

### 1. Core Resilience Factory Implementation

```typescript
export class ResilienceFactory {
  private static circuitBreaker = new CircuitBreaker();
  private static retryPolicy = new RetryPolicy();
  
  static makeResilient<T extends object>(service: T, methods: (keyof T)[]): T {
    const resilientService = { ...service };
    
    for (const method of methods) {
      const originalMethod = service[method];
      
      if (typeof originalMethod === 'function') {
        // Replace the original method with resilient version
        (resilientService[method] as any) = async (...args: any[]) => {
          // Wrap the operation with circuit breaker and retry policy
          return this.circuitBreaker.execute(
            async () => {
              return this.retryPolicy.execute(
                async () => {
                  return (originalMethod as Function).apply(service, args);
                }
              );
            },
            async () => {
              // Fallback logic
              if ((resilientService as any).getFallbackData) {
                return (resilientService as any).getFallbackData(method, ...args);
              }
              throw new Error(`No fallback available for ${String(method)}`);
            }
          );
        };
      }
    }
    
    return resilientService;
  }
  
  static getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }
  
  static getRetryPolicy(): RetryPolicy {
    return this.retryPolicy;
  }
  
  static resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}
```

### 2. Service Implementation with Fallback

```typescript
export class ApiService {
  private client: ApiClient;
  
  constructor() {
    this.client = new ApiClient();
  }
  
  async fetchData(id: string): Promise<DataModel> {
    return this.client.get(`/data/${id}`);
  }
  
  async saveData(data: DataModel): Promise<boolean> {
    return this.client.post('/data', data);
  }
  
  // Fallback implementation for resilience
  async getFallbackData(methodName: string, ...args: any[]): Promise<any> {
    switch (methodName) {
      case 'fetchData': {
        const id = args[0] as string;
        // Fetch from local storage or return default data
        return this.fetchFromLocalCache(id) || { id, name: 'Default Data' };
      }
      default:
        throw new Error(`No fallback available for ${methodName}`);
    }
  }
  
  private fetchFromLocalCache(id: string): DataModel | null {
    // Implementation details...
    return null;
  }
}
```

### 3. Usage Example

```typescript
// Create a normal service instance
const apiService = new ApiService();

// Make it resilient by wrapping specific methods
const resilientApiService = ResilienceFactory.makeResilient(
  apiService, 
  ['fetchData']
);

// Use the resilient service - resilience is transparent to consumers
async function getData(id: string) {
  try {
    return await resilientApiService.fetchData(id);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

## Benefits
- **Separation of Concerns**: Keeps business logic and resilience logic separate
- **Consistency**: Ensures uniform resilience implementation across services
- **Reusability**: Avoids duplicating resilience code in each service
- **Testability**: Services can be tested without resilience wrappers
- **Non-Invasive**: Adds resilience without modifying original service code
- **Central Configuration**: Provides single point for resilience configuration

## Evidence
This pattern has been implemented in HealthBench Branch 3.6 for API integration:
- Resilience Factory implementation: `/app/lib/api/resilience/resilienceFactory.ts`
- Agency Service with resilience: `/app/lib/services/agency.ts`
- Resilience Status view: `/app/lib/commands/system/status.ts`

## Limitations
- Requires consistent method signatures across services
- May add complexity to debugging due to proxied method calls
- Potential performance overhead from multiple wrapped layers
- Limited to asynchronous methods returning promises
- Requires careful implementation of fallback mechanisms

## Related Patterns
- Circuit Breaker Pattern
- Retry Policy Pattern
- Proxy Pattern
- Decorator Pattern
- Abstract Factory Pattern 