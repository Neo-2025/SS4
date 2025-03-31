/**
 * Resilience Factory
 * Combines Circuit Breaker and Retry Policy patterns
 */

import { CircuitBreaker } from './circuitBreaker';
import { RetryPolicy } from './retryPolicy';

/**
 * Resilience Factory
 * Creates resilient services with circuit breaker and retry policies
 */
export class ResilienceFactory {
  private static circuitBreaker = new CircuitBreaker();
  private static retryPolicy = new RetryPolicy();
  
  /**
   * Make a service resilient by wrapping methods with circuit breaker and retry policy
   * @param service Service to make resilient
   * @param methods Methods to wrap with resilience patterns
   * @returns Service with resilient methods
   */
  static makeResilient<T extends object>(service: T, methods: (keyof T)[]): T {
    const resilientService = { ...service };
    
    for (const method of methods) {
      const originalMethod = service[method];
      
      if (typeof originalMethod === 'function') {
        // Replace the original method with resilient version
        (resilientService[method] as any) = async (...args: any[]) => {
          // Wrap the operation with retry policy
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
  
  /**
   * Get the current circuit breaker instance
   * @returns CircuitBreaker
   */
  static getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }
  
  /**
   * Get the current retry policy instance
   * @returns RetryPolicy
   */
  static getRetryPolicy(): RetryPolicy {
    return this.retryPolicy;
  }
  
  /**
   * Reset the circuit breaker
   */
  static resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
} 