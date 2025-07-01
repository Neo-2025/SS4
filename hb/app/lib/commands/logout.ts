/**
 * Logout Command
 * Handles sign out from Supabase authentication
 */

import { Command } from '../types';
import registry from '../registry';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import { userSessionService } from '../../db/supabase-service';

const logoutCommand: Command = {
  name: 'logout',
  description: 'Sign out from HealthBench',
  usage: 'logout',
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
      
      if (user) {
        // End all active sessions for this user in our database
        await userSessionService.endAllForUser(user.id);
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          return {
            success: false,
            message: `Logout failed: ${error.message}`,
            error: error.message
          };
        }
        
        return {
          success: true,
          message: 'You have been successfully logged out.',
          data: { action: 'logout' }
        };
      } else {
        return {
          success: true,
          message: 'No active session found. You are already logged out.',
          data: { action: 'logout' }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Logout failed: ${error instanceof Error ? error.message : String(error)}`,
        error: 'LOGOUT_ERROR'
      };
    }
  }
};

// Register the command
registry.register(logoutCommand);

export default logoutCommand; 