/**
 * Circuit Breaker Pattern
 * Provides resilience for API calls with fallback mechanisms
 */

import { env } from '@/app/lib/env';

/**
 * Circuit states
 */
export enum CircuitState {
  CLOSED, // Normal operation, requests go through
  OPEN,   // Circuit is open, requests fail fast
  HALF_OPEN // Testing if the system has recovered
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private resetTimeout: NodeJS.Timeout | null = null;
  private readonly threshold: number;
  private readonly resetTimeoutMs: number;
  
  /**
   * Create a new Circuit Breaker
   * @param threshold Number of failures before opening the circuit
   * @param resetTimeoutMs Time in ms before trying to close the circuit again
   */
  constructor(
    threshold: number = env.CIRCUIT_BREAKER_THRESHOLD, 
    resetTimeoutMs: number = env.CIRCUIT_BREAKER_RESET_TIMEOUT
  ) {
    this.threshold = threshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }
  
  /**
   * Execute an operation with circuit breaker protection
   * @param operation Function to execute
   * @param fallback Optional fallback function if circuit is open
   * @returns Promise<T> Result of operation or fallback
   */
  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // If USE_CBF_MODE is true, use fallback immediately
    if (env.USE_CBF_MODE) {
      if (!fallback) {
        throw new Error('Circuit is forced OPEN and no fallback available');
      }
      return fallback();
    }
    
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
  
  /**
   * Handle operation failure
   * @param fallback Optional fallback function
   * @returns Promise<T> Result of fallback
   */
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
  
  /**
   * Trip the circuit breaker (set to OPEN)
   */
  private tripBreaker(): void {
    this.state = CircuitState.OPEN;
    
    // Reset any existing timeout
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    
    // Set timeout to transition to HALF_OPEN state
    this.resetTimeout = setTimeout(() => {
      this.state = CircuitState.HALF_OPEN;
      this.failureCount = 0;
    }, this.resetTimeoutMs);
  }
  
  /**
   * Get the current circuit state
   * @returns CircuitState
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Reset the circuit breaker manually
   */
  reset(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
  }
} 