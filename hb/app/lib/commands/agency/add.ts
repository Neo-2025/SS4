/**
 * Add Command
 * Adds an agency by CCN using reference data validation
 */

import { Command } from '../types';
import registry from '../registry';
import { EnhancedAgencyService } from '../../services/enhancedAgencyService';
import { supabase } from '../../utils/supabase';

// Create a service instance
const enhancedAgencyService = new EnhancedAgencyService();

const addCommand: Command = {
  name: 'add',
  description: 'Add an agency by CCN',
  usage: 'add [ccn]',
  category: 'agency',
  execute: async (args) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to add agencies. Use login to authenticate.'
        };
      }

      // Extract CCN - simplified approach
      let ccn = '';
      
      // Check in args._ array (positional args)
      if (args._ && Array.isArray(args._) && args._.length > 0) {
        // First try to find a 6-digit number in any position
        for (const arg of args._) {
          const strArg = String(arg);
          if (/^\d{6}$/.test(strArg)) {
            ccn = strArg;
            break;
          }
        }
        
        // If no 6-digit number found, use the first argument
        if (!ccn && args._.length > 0) {
          ccn = String(args._[0]);
        }
      }
      
      // Also check first positional arg directly (for backward compatibility)
      if (!ccn && args.arg1) {
        ccn = String(args.arg1);
      }

      // Validate CCN
      if (!ccn || !/^\d{6}$/.test(ccn)) {
        return {
          success: false,
          message: 'Please provide a valid 6-digit CCN. Example: add 123456'
        };
      }

      // Add progress indicator
      if (args.onProgress) {
        args.onProgress({ 
          step: 'info', 
          message: `HealthBench: Validating agency CCN ${ccn} against reference data...` 
        });
      }

      // Add the agency using the enhanced service
      try {
        const agency = await enhancedAgencyService.addAgency(ccn);
        
        if (args.onProgress) {
          args.onProgress({ 
            step: 'success', 
            message: `HealthBench: Found "${agency.name}" (CCN: ${agency.ccn})` 
          });
        }
        
        return {
          success: true,
          message: `HealthBench: Successfully added "${agency.name}" (CCN: ${agency.ccn})`,
          data: { agency }
        };
      } catch (error: any) {
        // Handle "not found in reference data" error specially
        if (error.message && error.message.includes('not found in reference data')) {
          return {
            success: false,
            message: `Error: ${error.message}. Use 'search [query]' to find valid agencies.`
          };
        }
        
        // Re-throw for general error handling
        throw error;
      }
    } catch (error) {
      console.error('Error in add command:', error);
      return {
        success: false,
        message: `Error adding agency: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Register the command
registry.register(addCommand);

export default addCommand; 