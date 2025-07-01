import { Command, CommandResult } from '../types';
import { supabase } from '../../utils/supabase';

export const listingCommand: Command = {
  name: 'listing',
  description: 'Manage hospital listings for sales/acquisition (T_ID system)',
  usage: 'listing <group_code> --list [hospital_ids] | --unlist | --status',
  category: 'auth',
  execute: async (args): Promise<CommandResult> => {
    const groupInput = args._[0];
    const action = args._[1];
    
    if (!groupInput) {
      return {
        type: 'error',
        content: '❌ Group code required. Usage: listing <group_code> --status'
      };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        type: 'error',
        content: '❌ Authentication required. Run: login <email>'
      };
    }

    let targetGroupId: number;
    if (typeof groupInput === 'string' && /^\d+$/.test(groupInput)) {
      targetGroupId = parseInt(groupInput, 10);
    } else if (typeof groupInput === 'number') {
      targetGroupId = groupInput;
    } else {
      return {
        type: 'error',
        content: `❌ Invalid group code format. Use INTEGER (50093) or TEXT ("050093")`
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('group_id_claimed')
      .eq('email', user.email)
      .single();

    if (profileError || !profile || profile.group_id_claimed !== targetGroupId) {
      return {
        type: 'error',
        content: `❌ Must claim group ${targetGroupId} before listing. Run: claim ${targetGroupId}`
      };
    }

    const { data: group, error: groupError } = await supabase
      .from('hospital_groups')
      .select('group_id, group_name, providers_opt')
      .eq('group_id', targetGroupId)
      .single();

    if (groupError || !group) {
      return {
        type: 'error',
        content: `❌ Group ${targetGroupId} not found`
      };
    }

    switch (action) {
      case '--status':
        return {
          type: 'success',
          content: `📋 ${group.group_name} listing status: Available for implementation`
        };
      default:
        return {
          type: 'error',
          content: '❌ Invalid action. Use: --status (more options coming)'
        };
    }
  }
};

import { commandRegistry } from '../registry';
commandRegistry.register(listingCommand); 