/**
 * List Command
 * Lists agencies using reference data
 */

import { Command } from '../types';
import registry from '../registry';
import { EnhancedAgencyService } from '../../services/enhancedAgencyService';
import { supabase } from '../../utils/supabase';
import { Agency } from '../../models/agency';

// Create a service instance
const enhancedAgencyService = new EnhancedAgencyService();

const listCommand: Command = {
  name: 'list',
  description: 'List agencies or agency groups',
  usage: 'list [agencies|groups]',
  category: 'agency',
  execute: async (args) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to list agencies. Use login to authenticate.'
        };
      }

      // Check what to list: agencies or groups
      let target = 'agencies';
      
      // Check in args._ array (positional args)
      if (args._ && Array.isArray(args._) && args._.length > 0) {
        const firstArg = String(args._[0]).toLowerCase();
        if (firstArg === 'groups' || firstArg === 'group') {
          target = 'groups';
        }
      }
      
      // Also check first positional arg directly
      if (args.arg1 && String(args.arg1).toLowerCase() === 'groups') {
        target = 'groups';
      }
      
      // Add progress indicator
      if (args.onProgress) {
        args.onProgress({ 
          step: 'info', 
          message: `HealthBench: Fetching ${target}...` 
        });
      }
      
      if (target === 'groups') {
        // List groups
        const groups = await enhancedAgencyService.getAgencyGroups();
        
        // Create a formatted output
        let message = 'Agency Groups:\n\n';
        
        // Format each group
        Object.entries(groups).forEach(([groupName, agencies]) => {
          message += `${groupName} (${agencies.length}):\n`;
          
          if (agencies.length === 0) {
            message += '  No agencies in this group\n';
          } else {
            agencies.forEach(agency => {
              message += `  ${agency.ccn} - ${agency.name}\n`;
            });
          }
          
          message += '\n';
        });
        
        return {
          success: true,
          message,
          data: { groups }
        };
      } else {
        // List all agencies
        const agencies = await enhancedAgencyService.listAgencies();
        
        if (agencies.length === 0) {
          return {
            success: true,
            message: 'No agencies found. Add agencies using the "add [ccn]" command.',
            data: { agencies: [] }
          };
        }
        
        // Format results in a table-like structure
        const formattedTable = formatAgenciesTable(agencies);
        
        return {
          success: true,
          message: `Your Agencies (${agencies.length}):\n\n${formattedTable}`,
          data: { agencies }
        };
      }
    } catch (error) {
      console.error('Error in list command:', error);
      return {
        success: false,
        message: `Error listing agencies: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Helper function to format agencies as a table
function formatAgenciesTable(agencies: Agency[]): string {
  // Table header
  let table = 'CCN      | Name                               | Location          | Group\n';
  table += '---------|------------------------------------|--------------------|-------\n';
  
  // Table rows
  for (const agency of agencies) {
    const ccn = agency.ccn.padEnd(9, ' ');
    const name = agency.name.length > 34 
      ? agency.name.substring(0, 31) + '...' 
      : agency.name.padEnd(34, ' ');
    const location = `${agency.city || ''}, ${agency.state}`.padEnd(20, ' ');
    const group = agency.groupType || '-';
    
    table += `${ccn}| ${name}| ${location}| ${group}\n`;
  }
  
  return table;
}

// Register the command
registry.register(listCommand);

export default listCommand; 