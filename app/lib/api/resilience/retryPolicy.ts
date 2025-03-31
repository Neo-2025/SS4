/**
 * Retry Policy Pattern
 * Provides automatic retry with exponential backoff
 */

import { env } from '../../../../lib/env';

/**
 * Retry Policy implementation
 */
export class RetryPolicy {
  private readonly maxRetries: number;
  private readonly initialDelayMs: number;
  
  /**
   * Create a new Retry Policy
   * @param maxRetries Maximum number of retry attempts
   * @param initialDelayMs Initial delay in ms (will increase with backoff)
   */
  constructor(
    maxRetries: number = env.RETRY_ATTEMPTS, 
    initialDelayMs: number = env.RETRY_INITIAL_DELAY
  ) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
  }
  
  /**
   * Execute an operation with retry policy
   * @param operation Function to execute
   * @returns Promise<T> Result of operation
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | unknown;
    
    for (let retryCount = 0; retryCount <= this.maxRetries; retryCount++) {
      try {
        // Wait before retry (except first attempt)
        if (retryCount > 0) {
          await this.delay(this.calculateBackoff(retryCount));
        }
        
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Retry ${retryCount}/${this.maxRetries} failed:`, error);
      }
    }
    
    throw lastError;
  }
  
  /**
   * Calculate exponential backoff delay
   * @param retryCount Current retry attempt
   * @returns number Delay in ms
   */
  private calculateBackoff(retryCount: number): number {
    // Exponential backoff: initialDelay * 2^retryCount
    return this.initialDelayMs * Math.pow(2, retryCount - 1);
  }
  
  /**
   * Create a delay promise
   * @param ms Milliseconds to delay
   * @returns Promise<void>
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 