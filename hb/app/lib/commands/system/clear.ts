/**
 * Clear Command
 * Clears the terminal output
 */

import { Command } from '../types';
import registry from '../registry';

const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal output',
  usage: 'clear',
  category: 'system',
  execute: async () => {
    return {
      success: true,
      message: '',
      data: {
        action: 'clear',
        maintainHistory: true
      }
    };
  }
};

// Register the command
registry.register(clearCommand);

export default clearCommand; 