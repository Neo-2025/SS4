/**
 * Debug Command
 * Displays parsed arguments for debugging
 */

import { Command } from '../types';
import registry from '../registry';

const debugCommand: Command = {
  name: 'debug',
  description: 'Display parsed arguments for debugging',
  usage: 'debug [args...]',
  category: 'system',
  execute: async (args) => {
    return {
      success: true,
      message: 'Debug Command - Parsed Arguments:',
      data: {
        args: args,
        hasPositionalArray: args._ ? true : false,
        positionalArray: args._,
        positionalCount: args._ ? args._.length : 0,
        namedArgs: Object.keys(args).filter(key => key !== '_')
      }
    };
  }
};

// Register the command
registry.register(debugCommand);

export default debugCommand; 