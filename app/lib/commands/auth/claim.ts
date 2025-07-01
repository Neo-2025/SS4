import { Command, CommandResponse, CommandOptions } from '../types';
import { supabase } from '../../utils/supabase';
import registry from '../registry';

export const claimCommand: Command = {
  name: 'claim',
  description: 'Claim a hospital group for QBR access',
  usage: 'claim <group_id>',
  category: 'auth',
  execute: async (args: Record<string, any>, options: CommandOptions = {}): Promise<CommandResponse> => {
    const groupId = args._?.[0];
    
    if (!groupId) {
      return {
        success: false,
        message: '❌ Group ID required\n\nUsage: claim <group_id>\n\nExample: claim SYS-6-TRINITYH',
        data: null
      };
    }
    
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: '❌ You must be logged in to claim a group\n\nRun: login <your-email>',
          data: null
        };
      }
      
      // Verify group exists in hospital_groups table
      const { data: groupData, error: groupError } = await supabase
        .from('hospital_groups')
        .select('group_code, group_name, providers')
        .eq('group_code', groupId)
        .single();
        
      if (groupError || !groupData) {
        return {
          success: false,
          message: `❌ Group '${groupId}' not found\n\nUse 'list groups' to see available groups`,
          data: null
        };
      }
      
      // Update user_profiles with claimed group
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id, // Add the required UUID
          email: user.email,
          hospital_group_claimed: groupId,
          subscription_tier: 'beta', // Default tier
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        });
        
      if (updateError) {
        return {
          success: false,
          message: `❌ Failed to claim group: ${updateError.message}`,
          data: null
        };
      }
      
      const providerCount = Array.isArray(groupData.providers) ? groupData.providers.length : 0;
      
      return {
        success: true,
        message: `✅ Successfully claimed: ${groupData.group_name}\n` +
                `📊 Group ID: ${groupId}\n` +
                `🏥 Hospitals: ${providerCount}\n` +
                `🎯 Status: Ready for QBR generation\n\n` +
                `Next: Run 'get qbr' to request your quarterly business review`,
        data: {
          group_id: groupId,
          group_name: groupData.group_name,
          provider_count: providerCount
        }
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Error claiming group: ${error.message}`,
        data: null
      };
    }
  }
};

// Register the command
registry.register(claimCommand);

export default claimCommand; 