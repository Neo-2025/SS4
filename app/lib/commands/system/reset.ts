/**
 * Reset Command
 * Resets the circuit breaker manually
 */

import { Command } from '../types';
import registry from '../registry';
import { agencyService } from '../../services/agency';

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
        message: 'HealthBench: Circuit breaker has been reset. System will attempt API connections again.',
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

// Register the command
registry.register(resetCommand); 