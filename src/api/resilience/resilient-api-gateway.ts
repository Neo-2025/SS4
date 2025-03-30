/**
 * Resilient API Gateway
 * 
 * Implements CIRCUIT-BREAKER-PATTERN for resilient API communication.
 * This file provides a resilient gateway for API operations.
 */

import { RetryPolicy, ExponentialBackoffRetry } from './retry-policy';
import { CircuitBreaker, CircuitBreakerConfig } from './circuit-breaker';
import { csvDataSource } from '../csv';

/**
 * Resilient operation result
 */
export interface ResilientResult<T> {
  data?: T;
  error?: Error;
  source: 'primary' | 'fallback';
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  retries: number;
}

/**
 * Resilient API gateway configuration
 */
export interface ResilientApiGatewayConfig {
  retryPolicy?: RetryPolicy;
  circuitBreaker?: CircuitBreaker;
  enableLogging?: boolean;
}

/**
 * Resilient API gateway
 */
export class ResilientApiGateway {
  private retryPolicy: RetryPolicy;
  private circuitBreaker: CircuitBreaker;
  private enableLogging: boolean;
  
  /**
   * Constructor
   * @param config - Gateway configuration
   */
  constructor(config: ResilientApiGatewayConfig = {}) {
    this.retryPolicy = config.retryPolicy || new ExponentialBackoffRetry({
      maxRetries: Number(process.env.API_RETRY_ATTEMPTS) || 3,
      initialDelay: Number(process.env.API_RETRY_DELAY) || 1000
    });
    
    this.circuitBreaker = config.circuitBreaker || new CircuitBreaker({
      failureThreshold: Number(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
      resetTimeout: Number(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000
    });
    
    this.enableLogging = config.enableLogging ?? true;
  }
  
  /**
   * Execute operation with resilience
   * @param operation - Primary operation
   * @param fallback - Optional fallback operation
   * @returns Operation result with metadata
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<ResilientResult<T>> {
    let retries = 0;
    let source: 'primary' | 'fallback' = 'primary';
    
    try {
      // Wrap operation with retry counter
      const operationWithRetryCount = async (): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          retries++;
          throw error;
        }
      };
      
      // Execute with circuit breaker and retry policy
      const data = await this.circuitBreaker.execute(
        () => this.retryPolicy.execute(operationWithRetryCount),
        fallback ? async () => {
          source = 'fallback';
          return fallback();
        } : undefined
      );
      
      // Return successful result
      return {
        data,
        source,
        circuitState: this.circuitBreaker.getState(),
        retries
      };
    } catch (error) {
      // Log error if logging is enabled
      if (this.enableLogging) {
        console.error(`Resilient API Gateway Error:`, error);
      }
      
      // Return error result
      return {
        error: error as Error,
        source,
        circuitState: this.circuitBreaker.getState(),
        retries
      };
    }
  }
  
  /**
   * Check if circuit is open
   * @returns True if circuit is open
   */
  isCircuitOpen(): boolean {
    return this.circuitBreaker.getState() === 'OPEN';
  }
  
  /**
   * Get circuit state
   * @returns Current circuit state
   */
  getCircuitState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.circuitBreaker.getState();
  }
  
  /**
   * Reset circuit
   */
  resetCircuit(): void {
    this.circuitBreaker.reset();
  }
  
  /**
   * Stop circuit breaker monitor
   */
  stopMonitor(): void {
    this.circuitBreaker.stopMonitor();
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

/**
 * Create resilient service
 * 
 * Wraps a service with resilience patterns
 * 
 * @param service - Service to wrap
 * @param gateway - Resilient gateway
 * @returns Wrapped service
 */
export function createResilientService<T extends object>(
  service: T,
  gateway: ResilientApiGateway
): T {
  const proxy = new Proxy(service, {
    get: (target, prop) => {
      const originalMethod = target[prop as keyof T];
      
      // If not a function or not found, return as is
      if (typeof originalMethod !== 'function') {
        return originalMethod;
      }
      
      // Wrap method with resilience
      return async (...args: any[]) => {
        // Extract fallback if provided as last argument
        const lastArg = args.length > 0 ? args[args.length - 1] : undefined;
        const hasFallback = lastArg && typeof lastArg === 'object' && lastArg.__fallback && typeof lastArg.__fallback === 'function';
        
        // If fallback provided, remove it from args
        const methodArgs = hasFallback ? args.slice(0, -1) : args;
        const fallback = hasFallback ? lastArg.__fallback : undefined;
        
        // Execute with resilience
        const result = await gateway.execute(
          () => (originalMethod as Function).apply(target, methodArgs),
          fallback
        );
        
        // If error and no fallback was provided, throw
        if (result.error && !hasFallback) {
          throw result.error;
        }
        
        // Return data
        return result.data;
      };
    }
  });
  
  return proxy as T;
} 