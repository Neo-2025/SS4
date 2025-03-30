/**
 * Circuit Breaker Implementation
 * 
 * Implements CIRCUIT-BREAKER-PATTERN for resilient API communication.
 * This file provides a circuit breaker to prevent cascading failures.
 */

/**
 * Circuit breaker state
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval?: number;
  halfOpenMaxAttempts?: number;
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private state: CircuitState = 'CLOSED';
  private monitor?: NodeJS.Timeout;
  private config: Required<CircuitBreakerConfig>;
  
  /**
   * Default configuration
   */
  private defaultConfig: Required<CircuitBreakerConfig> = {
    failureThreshold: 5,
    resetTimeout: 30000,
    monitorInterval: 5000,
    halfOpenMaxAttempts: 3
  };
  
  /**
   * Constructor
   * @param config - Circuit breaker configuration
   */
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      ...this.defaultConfig,
      ...config
    };
    
    // Start monitoring the circuit state
    this.startMonitor();
  }
  
  /**
   * Execute operation with circuit breaking
   * @param operation - Operation to execute
   * @param fallback - Optional fallback operation to use when circuit is open
   * @returns Operation result
   * @throws Error when circuit is open and no fallback is provided
   */
  async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // If circuit is open, check if we should attempt reset
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else if (fallback) {
        console.log(`Circuit OPEN: Using fallback`);
        return fallback();
      } else {
        throw new Error('Circuit is OPEN and no fallback provided');
      }
    }
    
    try {
      // Execute the operation
      const result = await operation();
      
      // If we were in HALF_OPEN state, increment success count
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        
        // If we've had enough successes, close the circuit
        if (this.successCount >= this.config.halfOpenMaxAttempts) {
          this.transitionToClosed();
        }
      } else if (this.state === 'CLOSED') {
        // Reset failure count after successful operation
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      // Handle operation failure
      this.onFailure();
      
      // If we have a fallback, use it
      if (fallback) {
        console.log(`Circuit breaker failure: Using fallback`);
        return fallback();
      }
      
      // Otherwise, propagate the error
      throw error;
    }
  }
  
  /**
   * Get current circuit state
   * @returns Circuit state
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Handle operation failure
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    // If we're in HALF_OPEN state, any failure should reopen the circuit
    if (this.state === 'HALF_OPEN') {
      this.transitionToOpen();
      return;
    }
    
    // In CLOSED state, check if we've hit the threshold
    if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.transitionToOpen();
    }
  }
  
  /**
   * Check if we should attempt to reset the circuit
   * @returns True if we should attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    
    const now = new Date();
    return (now.getTime() - this.lastFailureTime.getTime()) > this.config.resetTimeout;
  }
  
  /**
   * Start monitor for circuit state
   */
  private startMonitor(): void {
    // Clear any existing monitor
    if (this.monitor) {
      clearInterval(this.monitor);
    }
    
    // Set up monitoring interval
    this.monitor = setInterval(() => {
      if (this.state === 'OPEN' && this.shouldAttemptReset()) {
        console.log('Circuit breaker monitor: Attempting to reset circuit');
        this.transitionToHalfOpen();
      }
    }, this.config.monitorInterval);
  }
  
  /**
   * Stop monitor
   */
  public stopMonitor(): void {
    if (this.monitor) {
      clearInterval(this.monitor);
      this.monitor = undefined;
    }
  }
  
  /**
   * Manually reset circuit to CLOSED state
   */
  public reset(): void {
    this.transitionToClosed();
  }
  
  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    console.log('Circuit state transition: CLOSED');
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }
  
  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    console.log('Circuit state transition: OPEN');
    this.state = 'OPEN';
    this.lastFailureTime = new Date();
    this.successCount = 0;
  }
  
  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    console.log('Circuit state transition: HALF_OPEN');
    this.state = 'HALF_OPEN';
    this.successCount = 0;
  }

  /**
   * Check if the circuit breaker is in OPEN state
   */
  isOpen(): boolean {
    return this.state === 'OPEN';
  }
} 