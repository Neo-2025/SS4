/**
 * Status Command
 * Shows system resilience status
 */

import { Command } from '../types';
import registry from '../registry';
import { CircuitState } from '../../api/resilience';
import { agencyService } from '../../services/agency';
import { supabase } from '../../utils/supabase';

const statusCommand: Command = {
  name: 'status',
  description: 'Show system resilience status',
  usage: 'status',
  category: 'system',
  execute: async (args) => {
    try {
      // Get resilience status
      const status = agencyService.getResilienceStatus();
      
      // Get circuit state name
      let circuitStateName = 'UNKNOWN';
      switch (status.circuitState) {
        case CircuitState.CLOSED:
          circuitStateName = 'CLOSED';
          break;
        case CircuitState.OPEN:
          circuitStateName = 'OPEN';
          break;
        case CircuitState.HALF_OPEN:
          circuitStateName = 'HALF-OPEN';
          break;
      }
      
      // Check Supabase connection
      let dbStatus = 'UNKNOWN';
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try a simple query to verify DB access
          const { data: healthData, error } = await supabase
            .from('agencies')
            .select('count(*)', { count: 'exact' })
            .eq('user_id', user.id)
            .limit(1);
            
          dbStatus = error ? 'ERROR' : 'CONNECTED';
        } else {
          dbStatus = 'DISCONNECTED';
        }
      } catch (error) {
        dbStatus = 'ERROR';
      }
      
      // Format message based on status
      let statusMessage = `System Status:\n\n`;
      statusMessage += `API Circuit: ${circuitStateName}\n`;
      statusMessage += `Database: ${dbStatus}\n`;
      statusMessage += `Fallback Mode: ${status.isFallbackMode ? 'ACTIVE' : 'INACTIVE'}\n`;
      statusMessage += `\nStatus Message: ${status.statusMessage}`;
      
      // Add reset instructions if circuit is open
      if (status.circuitState === CircuitState.OPEN) {
        statusMessage += `\n\nTo reset the circuit breaker, use the command: reset circuit`;
      }
      
      return {
        success: true,
        message: statusMessage,
        data: { 
          circuitState: circuitStateName,
          databaseStatus: dbStatus,
          isFallbackMode: status.isFallbackMode,
          statusMessage: status.statusMessage
        }
      };
    } catch (error) {
      console.error('Error in status command:', error);
      return {
        success: false,
        message: `Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Register the command
registry.register(statusCommand);

export default statusCommand;

 