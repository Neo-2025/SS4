---
status: Validated
classification: resilience
---

# RESILIENT-API-GATEWAY

## Status

**Current Status**: Validated
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 2
- Projects: 1
- Related Patterns: 3

## Classification

Resilience Pattern

## Problem

Applications that integrate with external APIs face multiple failure modes: temporary network issues, service outages, rate limiting, and more. Each failure type requires different handling strategies, and without a unified approach, this complexity can spread throughout the codebase, leading to inconsistent error handling and poor user experience during service disruptions.

## Solution

The Resilient API Gateway pattern provides a unified facade for API interactions that combines multiple resilience strategies (retry, circuit breaking, fallback) into a cohesive solution. It centralizes resilience logic, ensures consistent error handling, and enables graceful degradation during service disruptions.

### Core Components

1. **Gateway Interface**: Provides a clean, domain-focused API for service interactions
2. **Retry Mechanism**: Handles transient failures with configurable retry policies
3. **Circuit Breaker**: Prevents cascading failures by stopping requests to failing services
4. **Fallback Mechanism**: Offers alternative data sources when services are unavailable
5. **Configuration**: Allows tuning of resilience parameters based on service characteristics

### Key Features

1. **Unified Resilience Strategy**: Combines multiple patterns into a cohesive solution
2. **Domain-Specific Methods**: Provides service-specific methods aligned with domain model
3. **Transparent Fallback**: Seamlessly transitions to alternative data sources
4. **Configurable Behavior**: Allows tuning based on specific service characteristics
5. **Degradation Detection**: Provides status information about service health

## Implementation Example

```typescript
import { CircuitBreaker } from './circuit-breaker';
import { RetryPolicy } from './retry-policy';
import { csvDataSource } from '../csv';

/**
 * Resilient API Gateway - Provides fault-tolerant API communication
 */
export class ResilientApiGateway {
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;

  constructor(options?: {
    failureThreshold?: number;
    resetTimeout?: number;
    maxRetries?: number;
    initialDelay?: number;
  }) {
    this.circuitBreaker = new CircuitBreaker(
      options?.failureThreshold || 5,
      options?.resetTimeout || 30000
    );
    
    this.retryPolicy = new RetryPolicy({
      maxRetries: options?.maxRetries || 3,
      initialDelay: options?.initialDelay || 1000
    });
  }

  /**
   * Execute an operation with resilience patterns applied
   * @param operation The operation to execute
   * @param fallback Optional fallback operation
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    return this.circuitBreaker.execute(
      () => this.retryPolicy.execute(operation),
      fallback
    );
  }

  /**
   * Get agency data with resilience
   * @param apiCall API call function to get agency data
   * @param ccn Agency CCN
   */
  async getAgencyData(apiCall: (ccn: string) => Promise<any>, ccn: string): Promise<any> {
    return this.execute(
      () => apiCall(ccn),
      () => csvDataSource.getAgencyData(ccn)
    );
  }

  /**
   * Get quality measures with resilience
   * @param apiCall API call function to get quality measures
   * @param ccn Agency CCN
   */
  async getQualityMeasures(apiCall: (ccn: string) => Promise<any>, ccn: string): Promise<any> {
    return this.execute(
      () => apiCall(ccn),
      () => csvDataSource.getQualityMeasures(ccn)
    );
  }

  /**
   * Get benchmarks with resilience
   * @param apiCall API call function to get benchmarks
   * @param state State code
   */
  async getBenchmarks(apiCall: (state: string) => Promise<any>, state: string): Promise<any> {
    return this.execute(
      () => apiCall(state),
      () => csvDataSource.getBenchmarks(state)
    );
  }

  /**
   * Check if the system is in Circuit Breaker Fallback (CBF) mode
   */
  isInCBFMode(): boolean {
    return this.circuitBreaker.isOpen() || process.env.USE_CBF_MODE === 'true';
  }
}
```

## Benefits

1. **Simplified Client Code**: Client code can focus on business logic, not error handling
2. **Consistent Resilience**: Ensures all API calls use the same resilience strategies
3. **Domain-Focused Interfaces**: API methods match domain concepts, not raw HTTP calls
4. **Graceful Degradation**: System can continue operating with reduced functionality
5. **Configurable Resilience**: Different services can have different resilience parameters
6. **Centralized Error Handling**: All resilience logic is contained in one place
7. **Testability**: Makes it easier to test failure scenarios with mocked fallbacks

## Limitations

1. **Additional Complexity**: Adds an extra layer to the architecture
2. **Configuration Overhead**: Requires proper tuning of resilience parameters
3. **Potential Over-Abstraction**: May hide important API details in some cases
4. **Testing Challenges**: Complex behavior requires thorough testing
5. **Performance Impact**: Multiple resilience strategies may add latency

## Related Patterns

- **CIRCUIT-BREAKER-PATTERN**: Core component that detects service failures
- **RETRY-POLICY-PATTERN**: Handles transient errors with exponential backoff
- **CSV-FALLBACK-MECHANISM**: Provides alternative data during service outages
- **SERVICE-LAYER-ARCHITECTURE**: Works within a broader service layer approach

## Usage Examples

### Agency Management Service Integration

```typescript
export class AgencyManagementService {
  private resilientApiGateway: ResilientApiGateway;
  
  constructor(apiGateway: ResilientApiGateway) {
    this.resilientApiGateway = apiGateway;
  }
  
  /**
   * Add an agency by CCN
   */
  async addAgency(ccn: string, apiCall: (ccn: string) => Promise<AgencyData>): Promise<AgencyData> {
    // Fetch agency data with resilience
    const agencyData = await this.resilientApiGateway.getAgencyData(apiCall, ccn);
    
    // Further processing with the data
    // ...
    
    return agencyData;
  }
}
```

### UI Component with CBF Mode Indicator

```tsx
function AgencyDataComponent({ ccn }) {
  const [agencyData, setAgencyData] = useState(null);
  const [isInCBFMode, setIsInCBFMode] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await agencyService.getAgencyData(ccn);
        setAgencyData(data);
        
        // Check if using fallback data
        setIsInCBFMode(apiGateway.isInCBFMode());
      } catch (error) {
        console.error("Failed to fetch agency data", error);
      }
    };
    
    fetchData();
  }, [ccn]);
  
  return (
    <div>
      {isInCBFMode && (
        <div className="cbf-mode-indicator">
          ⚠️ Using offline data (CBF Mode)
        </div>
      )}
      
      {agencyData && (
        <AgencyDetails data={agencyData} />
      )}
    </div>
  );
}
```

## Evolution History

- **v1.0**: Basic integration of Circuit Breaker and Retry Policy
- **v1.1**: Added CSV Fallback mechanism for offline operation
- **v1.2**: Added domain-specific methods for agency data
- **v1.3**: Added CBF Mode detection for UI indicators 