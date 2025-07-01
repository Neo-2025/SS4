/**
 * Resilience Service
 * Provides a simple API for resilience patterns
 */

import { CircuitState } from './circuitBreaker';
import { ResilienceFactory } from './resilienceFactory';

/**
 * Resilience status type
 */
export interface ResilienceStatus {
  circuitState: CircuitState;
  isFallbackMode: boolean;
  statusMessage: string;
}

/**
 * Resilience Service
 * Provides resilience status and management functions
 */
export class ResilienceService {
  /**
   * Get the current resilience status
   * @returns ResilienceStatus
   */
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
      statusMessage
    };
  }
  
  /**
   * Reset the circuit breaker (manual recovery)
   */
  static resetCircuitBreaker(): void {
    ResilienceFactory.resetCircuitBreaker();
  }
  
  /**
   * Execute an operation with resilience patterns
   * @param operation Operation to execute
   * @param fallback Optional fallback function
   * @returns Promise<T> Result of operation or fallback
   */
  static async executeResilient<T>(
    operation: () => Promise<T>, 
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = ResilienceFactory.getCircuitBreaker();
    const retryPolicy = ResilienceFactory.getRetryPolicy();
    
    return circuitBreaker.execute(
      async () => retryPolicy.execute(operation),
      fallback
    );
  }
} 