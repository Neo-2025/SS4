/**
 * Reset Command
 * Allows manual reset of circuit breaker or other system components
 */

import { Command } from '../types';
import registry from '../registry';
import { agencyService } from '../../services/agency';
import { supabase } from '../../utils/supabase';

const resetCommand: Command = {
  name: 'reset',
  description: 'Reset system components',
  usage: 'reset circuit',
  category: 'system',
  execute: async (args) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to reset system components.'
        };
      }
      
      // Check what to reset
      const resetWhat = args._?.[0] || args.arg1 || '';
      
      if (resetWhat.toLowerCase() === 'circuit') {
        // Reset the circuit breaker
        agencyService.resetCircuitBreaker();
        
        // Show the updated status
        const status = agencyService.getResilienceStatus();
        
        return {
          success: true,
          message: `Circuit breaker has been reset.\nCurrent status: ${status.statusMessage}`,
          data: { status }
        };
      } else {
        return {
          success: false,
          message: 'Please specify what to reset. Example: reset circuit'
        };
      }
    } catch (error) {
      console.error('Error in reset command:', error);
      return {
        success: false,
        message: `Error resetting: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Register the command
registry.register(resetCommand);

export default resetCommand; 