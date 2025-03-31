# Pattern: Resilience Status

## Status
Validated

## Classification
UI

## Problem Statement
In resilient systems that use patterns like Circuit Breaker and Fallback Data, users and administrators face several challenges:
- Lack of visibility into the current system health state
- Difficulty in identifying when systems are operating in degraded or fallback modes
- No straightforward way to manually recover degraded systems
- Poor user experience due to unexpected behavior without context
- Support and debugging challenges without system state information

## Solution
Implement a Resilience Status pattern that:
1. Provides clear visibility into the system resilience state through dedicated status endpoints and UI elements
2. Offers manual recovery operations for authorized users
3. Integrates visual indicators of fallback/degraded modes within the UI
4. Supplies diagnostic information for troubleshooting and monitoring

## Implementation Details

### 1. Resilience Status Service

```typescript
export interface ResilienceStatus {
  circuitState: CircuitState;
  isFallbackMode: boolean;
  statusMessage: string;
  lastCheck?: string;
  failureCount?: number;
}

export class ResilienceService {
  static getStatus(): ResilienceStatus {
    const circuitBreaker = ResilienceFactory.getCircuitBreaker();
    const circuitState = circuitBreaker.getState();
    const isFallbackMode = circuitState === CircuitState.OPEN;
    
    let statusMessage = 'System operating normally';
    
    if (circuitState === CircuitState.OPEN) {
      statusMessage = 'Circuit OPEN: Using fallback data, API calls blocked';
    } else if (circuitState === CircuitState.HALF_OPEN) {
      statusMessage = 'Circuit HALF-OPEN: Testing API recovery';
    }
    
    return {
      circuitState,
      isFallbackMode,
      statusMessage,
      lastCheck: new Date().toISOString()
    };
  }
  
  static resetCircuitBreaker(): void {
    ResilienceFactory.resetCircuitBreaker();
  }
}
```

### 2. Status Command Implementation (CLI)

```typescript
const statusCommand: Command = {
  name: 'status',
  description: 'Check resilience system status',
  usage: 'status',
  category: 'system',
  execute: async () => {
    try {
      const status = agencyService.getResilienceStatus();
      
      // Format state for display
      let stateDisplay = 'UNKNOWN';
      let stateEmoji = '❓';
      
      switch (status.circuitState) {
        case CircuitState.CLOSED:
          stateDisplay = 'CLOSED';
          stateEmoji = '✅';
          break;
        case CircuitState.OPEN:
          stateDisplay = 'OPEN';
          stateEmoji = '🛑';
          break;
        case CircuitState.HALF_OPEN:
          stateDisplay = 'HALF-OPEN';
          stateEmoji = '⚠️';
          break;
      }
      
      return {
        success: true,
        message: `System Status:
          
Circuit State: ${stateEmoji} ${stateDisplay}
${status.statusMessage}

${status.isFallbackMode 
  ? 'System is in FALLBACK MODE. Some data may be estimated or unavailable.' 
  : 'System is operating normally with live API data.'}

Use 'reset' command to manually reset the circuit breaker if needed.`,
        data: { status }
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return {
        success: false,
        message: `Error getting system status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
```

### 3. Reset Command Implementation (CLI)

```typescript
const resetCommand: Command = {
  name: 'reset',
  description: 'Reset the circuit breaker manually',
  usage: 'reset',
  category: 'system',
  execute: async () => {
    try {
      // Reset the circuit breaker
      agencyService.resetCircuitBreaker();
      
      return {
        success: true,
        message: 'Circuit breaker has been reset. System will attempt API connections again.',
        data: {
          status: agencyService.getResilienceStatus()
        }
      };
    } catch (error) {
      console.error('Error resetting circuit breaker:', error);
      return {
        success: false,
        message: `Error resetting circuit breaker: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
```

### 4. UI Integration with Fallback Indicators

```typescript
function DataItem({ data }) {
  return (
    <div className="data-item">
      <div className="data-header">
        <h3>{data.name}</h3>
        {data.isFallbackData && (
          <span className="fallback-badge" title="Using fallback data due to API unavailability">
            [FALLBACK]
          </span>
        )}
      </div>
      <div className="data-content">
        {/* Item details */}
      </div>
    </div>
  );
}

function StatusIndicator() {
  const [status, setStatus] = useState<ResilienceStatus | null>(null);
  
  useEffect(() => {
    // Fetch status on mount and periodically
    const fetchStatus = async () => {
      const result = await resilienceService.getStatus();
      setStatus(result);
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (!status) return null;
  
  return (
    <div className={`status-indicator ${status.isFallbackMode ? 'fallback-mode' : 'normal-mode'}`}>
      <div className="status-icon">
        {status.circuitState === CircuitState.CLOSED && <CheckCircleIcon />}
        {status.circuitState === CircuitState.OPEN && <ErrorIcon />}
        {status.circuitState === CircuitState.HALF_OPEN && <WarningIcon />}
      </div>
      <div className="status-label">{status.statusMessage}</div>
      {status.isFallbackMode && (
        <button onClick={() => resilienceService.resetCircuitBreaker()}>
          Reset System
        </button>
      )}
    </div>
  );
}
```

## Benefits
- **Transparency**: Users understand when data may be stale or estimated
- **User Confidence**: Clear indicators reduce confusion during degraded operation
- **Operational Control**: Manual reset options for faster recovery
- **Debugging**: Easier troubleshooting with visible system state
- **Reduced Support Burden**: Users can identify fallback situations without contacting support
- **Improved UX**: Context-aware interface adapts to system conditions

## Evidence
This pattern has been implemented in HealthBench Branch 3.6 for API integration:
- Resilience Status service: `/app/lib/api/resilience/resilienceService.ts`
- Status command: `/app/lib/commands/system/status.ts`
- Reset command: `/app/lib/commands/system/reset.ts`
- Fallback indicators in agency list command: `/app/lib/commands/agency/list.ts`

## Limitations
- Additional UI complexity to handle different states
- Requires appropriate user access controls for reset operations
- May expose implementation details to end users
- Needs careful status message wording to avoid confusion
- Potential for users to rely on fallback mode as normal operation

## Related Patterns
- Circuit Breaker Pattern
- Multi-Layer Fallback Pattern
- Command Pattern
- Status Object Pattern
- User Feedback Pattern 