/**
 * Group-As Command
 * Groups an agency by type (Org, Comp, Target)
 */

import { Command } from '../types';
import registry from '../registry';
import { Agency, AgencyGroupType } from '../../models/agency';
import { EnhancedAgencyService } from '../../services/enhancedAgencyService';
import { supabase } from '../../utils/supabase';

// Create a service instance
const enhancedAgencyService = new EnhancedAgencyService();

// Valid group types
const VALID_GROUP_TYPES: AgencyGroupType[] = ['Org', 'Comp', 'Target'];

const groupAsCommand: Command = {
  name: 'group-as',
  description: 'Group an agency as Org, Comp, or Target',
  usage: 'group-as [Org|Comp|Target] [ccn]',
  category: 'agency',
  execute: async (args) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to group agencies. Use login to authenticate.'
        };
      }
      
      // Extract group type and CCN
      let groupType: AgencyGroupType | undefined;
      let ccn = '';
      
      // Parse from args._ array (positional args)
      if (args._ && Array.isArray(args._) && args._.length >= 2) {
        // Try to find a valid group type
        const typeCandidate = String(args._[0]);
        if (VALID_GROUP_TYPES.includes(typeCandidate as AgencyGroupType)) {
          groupType = typeCandidate as AgencyGroupType;
          
          // Look for CCN in the remaining arguments
          for (let i = 1; i < args._.length; i++) {
            const strArg = String(args._[i]);
            if (/^\d{6}$/.test(strArg)) {
              ccn = strArg;
              break;
            }
          }
          
          // If no 6-digit number found, use the second argument
          if (!ccn && args._.length > 1) {
            ccn = String(args._[1]);
          }
        }
      }
      
      // Try direct arg1/arg2 access (for backward compatibility)
      if (!groupType && args.arg1) {
        const typeCandidate = String(args.arg1);
        if (VALID_GROUP_TYPES.includes(typeCandidate as AgencyGroupType)) {
          groupType = typeCandidate as AgencyGroupType;
        }
      }
      
      if (!ccn && args.arg2) {
        ccn = String(args.arg2);
      }
      
      // Validate inputs
      if (!groupType) {
        return {
          success: false,
          message: 'Please provide a valid group type (Org, Comp, or Target). Example: group-as Org 123456'
        };
      }
      
      if (!ccn || !/^\d{6}$/.test(ccn)) {
        return {
          success: false,
          message: `Please provide a valid 6-digit CCN for the ${groupType} group. Example: group-as ${groupType} 123456`
        };
      }
      
      // Add progress indicator
      if (args.onProgress) {
        args.onProgress({ 
          step: 'info', 
          message: `HealthBench: Adding agency ${ccn} to ${groupType} group...` 
        });
      }
      
      try {
        // Group the agency
        await enhancedAgencyService.groupAgency(ccn, groupType);
        
        if (args.onProgress) {
          args.onProgress({ 
            step: 'success', 
            message: `HealthBench: Successfully added agency ${ccn} to ${groupType} group` 
          });
        }
        
        return {
          success: true,
          message: `HealthBench: Successfully added agency to ${groupType} group`,
          data: { ccn, groupType }
        };
      } catch (error: any) {
        // Handle "not found" error specially
        if (error.message && error.message.includes('not found in your list')) {
          return {
            success: false,
            message: `Error: ${error.message}. Add the agency first with 'add ${ccn}'`
          };
        }
        
        // Re-throw for general error handling
        throw error;
      }
    } catch (error) {
      console.error('Error in group-as command:', error);
      return {
        success: false,
        message: `Error grouping agency: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Register the command
registry.register(groupAsCommand);

export default groupAsCommand; 