import { Command, CommandResult } from '../types';
import { supabase } from '../../utils/supabase';

export const getQbrCommand: Command = {
  name: 'get',
  description: 'Generate QBR using your claimed hospital group perspective',
  usage: 'get QBR',
  category: 'qbr',
  execute: async (args): Promise<CommandResult> => {
    if (args._[0] !== 'QBR') {
      return {
        type: 'error',
        content: '❌ Usage: get QBR'
      };
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        type: 'error',
        content: '❌ Authentication required. Run: login <email>'
      };
    }

    // Get user's claimed group and subscription status
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('group_id_claimed, subscription_tier')
      .eq('email', user.email)
      .single();

    if (profileError || !profile) {
      return {
        type: 'error',
        content: '❌ User profile not found. Run: claim <group_id> first'
      };
    }

    if (!profile.group_id_claimed) {
      return {
        type: 'error',
        content: '❌ Must claim hospital group first. Run: claim <group_id>'
      };
    }

    if (!profile.subscription_tier || profile.subscription_tier === 'freemium') {
      return {
        type: 'error',
        content: '❌ Beta or Professional subscription required. Run: subscribe beta'
      };
    }

    // Use resolve_client_authority to get real authority data
    const { data: authority, error: authorityError } = await supabase
      .rpc('resolve_client_authority', { authenticated_email: user.email });

    if (authorityError || !authority || authority.length === 0) {
      return {
        type: 'error',
        content: `❌ Failed to resolve authority: ${authorityError?.message || 'No authority found'}`
      };
    }

    const clientAuthority = authority[0];

    // Queue for batch processing (fire-and-forget)
    const { error: queueError } = await supabase
      .from('qbr_generation_queue')
      .insert({
        user_email: user.email,
        request_date: new Date().toISOString().split('T')[0],
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (queueError && queueError.code !== '23505') { // 23505 = duplicate key (already queued)
      return {
        type: 'error',
        content: `❌ Failed to queue QBR: ${queueError.message}`
      };
    }

    if (queueError && queueError.code === '23505') {
      return {
        type: 'warning',
        content: '⚠️ Already queued for today - one QBR per day'
      };
    }

    return {
      type: 'success',
      content: `✅ QBR queued for ${clientAuthority.group_name || `Group ${clientAuthority.group_id}`} (${clientAuthority.hospital_array?.length || 0} hospitals)\n📝 Queued for 9pm batch processing\n📧 Excel report will be delivered via email`
    };
  }
};

// Auto-register the command
import { commandRegistry } from '../registry';
commandRegistry.register(getQbrCommand); 