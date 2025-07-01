/**
 * Account Command
 * Shows user account information
 */

import { Command } from '../types';
import registry from '../registry';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import { userSessionService } from '../../db/supabase-service';

const accountCommand: Command = {
  name: 'account',
  description: 'View your HealthBench account information',
  usage: 'account',
  category: 'auth',
  execute: async () => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Authentication is not properly configured',
        error: 'CONFIG_ERROR'
      };
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'You are not logged in. Use the login command to authenticate.',
          error: 'NOT_AUTHENTICATED'
        };
      }
      
      // Get active session
      const session = await userSessionService.getActive(user.id);
      
      return {
        success: true,
        message: `Account information for ${user.email}`,
        data: {
          user: {
            id: user.id,
            email: user.email,
            emailConfirmed: user.email_confirmed_at !== null,
            lastSignIn: user.last_sign_in_at,
            createdAt: user.created_at
          },
          session: session ? {
            started: session.started_at,
            lastActive: session.last_active_at
          } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch account information: ${error instanceof Error ? error.message : String(error)}`,
        error: 'ACCOUNT_ERROR'
      };
    }
  }
};

// Register the command
registry.register(accountCommand);

export default accountCommand; 