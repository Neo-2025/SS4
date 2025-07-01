import { Command, CommandResponse, CommandOptions } from '../types';
import { supabase } from '../../utils/supabase';
import registry from '../registry';

export const listingCommand: Command = {
  name: 'listing',
  description: 'Manage hospital T_ID listings in marketplace',
  usage: '$listing <provider_id> [--status|--list|--unlist]',
  
  async execute(args: Record<string, any>, options?: CommandOptions): Promise<CommandResponse> {
    // Convert args to array format expected by the command
    const argsArray = Object.values(args);
    const providerId = argsArray[0] as string;
    const action = (argsArray[1] as string) || '--status';
    
    // Get user from global context (you may need to adjust this)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required. Use $magic-link first.',
        error: 'Authentication required'
      };
    }

    if (argsArray.length === 0) {
      return {
        success: false,
        message: 'Usage: $listing <provider_id> [--status|--list|--unlist]',
        error: 'Missing provider_id'
      };
    }

    // Validate provider_id exists and format (6 digits)
    if (!providerId || !/^\d{6}$/.test(providerId)) {
      return {
        success: false,
        message: 'Provider ID must be exactly 6 digits',
        error: 'Invalid provider_id format'
      };
    }

    try {
      // Get user's group and verify ownership
      const { data: userGroups, error: groupError } = await supabase
        .from('hospital_groups')
        .select('cms_group_id, group_name, provider_ids')
        .contains('provider_ids', [parseInt(providerId)]);

      if (groupError) {
        return {
          success: false,
          message: 'Database error checking group ownership',
          error: groupError.message
        };
      }

      if (!userGroups || userGroups.length === 0) {
        return {
          success: false,
          message: `Provider ${providerId} not found in your group holdings`,
          error: 'Provider not owned'
        };
      }

      const group = userGroups[0];

      // Handle different actions
      switch (action) {
        case '--status':
          const { data: listing, error: statusError } = await supabase
            .from('hospital_listings')
            .select('*')
            .eq('provider_id', parseInt(providerId))
            .single();

          if (statusError && statusError.code !== 'PGRST116') {
            return {
              success: false,
              message: 'Error checking listing status',
              error: statusError.message
            };
          }

          const status = listing ? (listing.is_for_sale ? '.t (for sale)' : '.0 (retained)') : '.0 (retained)';
          
          return {
            success: true,
            message: `T_ID ${providerId} status: ${status}`,
            data: {
              provider_id: providerId,
              group_name: group.group_name,
              t_id_status: status,
              listing: listing || null
            }
          };

        case '--list':
          const { data: newListing, error: listError } = await supabase
            .from('hospital_listings')
            .upsert({
              provider_id: parseInt(providerId),
              cms_group_id: group.cms_group_id,
              is_for_sale: true,
              list_date: new Date().toISOString(),
              user_id: user.id
            })
            .select()
            .single();

          if (listError) {
            return {
              success: false,
              message: 'Failed to list T_ID for sale',
              error: listError.message
            };
          }

          return {
            success: true,
            message: `T_ID ${providerId} now listed for sale (.t)`,
            data: newListing
          };

        case '--unlist':
          const { data: unlistData, error: unlistError } = await supabase
            .from('hospital_listings')
            .update({ is_for_sale: false })
            .eq('provider_id', parseInt(providerId))
            .select()
            .single();

          if (unlistError) {
            return {
              success: false,
              message: 'Failed to remove T_ID from sale',
              error: unlistError.message
            };
          }

          return {
            success: true,
            message: `T_ID ${providerId} removed from sale (.0)`,
            data: unlistData
          };

        default:
          return {
            success: false,
            message: 'Invalid action. Use --status, --list, or --unlist',
            error: 'Invalid action'
          };
      }

    } catch (error) {
      return {
        success: false,
        message: 'System error processing listing command',
        error: (error as Error).message
      };
    }
  }
};

// Register the command
registry.register(listingCommand);
