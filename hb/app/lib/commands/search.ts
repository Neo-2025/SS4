/**
 * Search Command
 * 
 * Provides search functionality for finding agencies by name, city, or CCN.
 * Uses the enhanced agency service to search against the reference database.
 */

import { Command } from './types';
import registry from './registry';
import { EnhancedAgencyService } from '../services/enhancedAgencyService';
import { Agency } from '../models/agency';
import { supabase } from '../utils/supabase';

// Create a service instance
const enhancedAgencyService = new EnhancedAgencyService();

const searchCommand: Command = {
  name: 'search',
  description: 'Search for agencies by name, city, or CCN',
  usage: 'search [query]',
  category: 'agency',
  execute: async (args) => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to search for agencies. Use login to authenticate.'
        };
      }
      
      // Extract search query
      let query = '';
      
      // Check in args._ array (positional args)
      if (args._ && Array.isArray(args._) && args._.length > 0) {
        query = args._.join(' ');
      }
      
      // Also check first positional arg directly (for backward compatibility)
      if (!query && args.arg1) {
        query = String(args.arg1);
      }
      
      if (!query) {
        return {
          success: false,
          message: 'Please provide a search query. Example: search texas home health'
        };
      }
      
      // Add progress indicator
      if (args.onProgress) {
        args.onProgress({
          step: 'info',
          message: `HealthBench: Searching for agencies matching "${query}"...`
        });
      }
      
      // Search for agencies
      const agencies = await enhancedAgencyService.searchAgencies(query);
      
      if (agencies.length === 0) {
        return {
          success: true,
          message: `No agencies found matching "${query}"`
        };
      }
      
      // Format results in a table-like structure
      const formattedResults = formatAgenciesTable(agencies);
      
      return {
        success: true,
        message: `Found ${agencies.length} agencies matching "${query}":\n\n${formattedResults}`,
        data: { agencies }
      };
    } catch (error) {
      console.error('Error in search command:', error);
      return {
        success: false,
        message: `Error searching for agencies: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

// Helper function to format agencies as a table
function formatAgenciesTable(agencies: Agency[]): string {
  // Table header
  let table = 'CCN      | Name                               | Location\n';
  table += '---------|------------------------------------|-----------------------\n';
  
  // Table rows
  for (const agency of agencies) {
    const ccn = agency.ccn.padEnd(9, ' ');
    const name = agency.name.length > 34 
      ? agency.name.substring(0, 31) + '...' 
      : agency.name.padEnd(34, ' ');
    const location = `${agency.city || ''}, ${agency.state}`;
    
    table += `${ccn}| ${name}| ${location}\n`;
  }
  
  return table;
}

// Register the command
registry.register(searchCommand);

export default searchCommand; 