/**
 * Status Command
 * Shows the current system resilience status
 */

import { Command } from '../types';
import registry from '../registry';
import { agencyService } from '../../services/agency';
import { CircuitState } from '../../api/resilience/circuitBreaker';

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
        message: `HealthBench System Status:
          
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

// Register the command
registry.register(statusCommand); 