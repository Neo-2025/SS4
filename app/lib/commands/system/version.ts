/**
 * Version Command
 * Displays the application version from package.json
 */

import { Command } from '../types';
import registry from '../registry';

// Hard-code the version from package.json
// This approach is more compatible with client-side components
const PACKAGE_VERSION = '0.1.0';

const versionCommand: Command = {
  name: 'version',
  description: 'Display the HealthBench version information',
  usage: 'version',
  category: 'system',
  execute: async () => {
    return {
      success: true,
      message: `HealthBench CLI v${PACKAGE_VERSION}`,
      data: {
        version: PACKAGE_VERSION,
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }
};

// Register the command
registry.register(versionCommand);

export default versionCommand; 