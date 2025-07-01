/**
 * Magic Link Authentication Command
 * SmartMarkets.ai CLI-First SaaS Authentication
 * ACTUAL implementation for real end-to-end workflow
 */

import { Command, CommandOptions } from '../types';
import registry from '../registry';
import { supabase } from '../../utils/supabase';

const magicLinkCommand: Command = {
  name: 'login',
  description: 'Send magic link to your email for secure authentication',
  usage: 'login <email>',
  category: 'auth',
  args: [
    { name: 'email', type: 'string', required: false, description: 'Your email address' }
  ],
  execute: async (args, options: CommandOptions = {}) => {
    const onProgress = options.onProgress || (() => {});
    
    // Get email from arguments (prioritize positional argument)
    const email = args._?.[0] || args.email;
    
    if (!email) {
      return {
        success: false,
        message: 'Usage: login <email>\nExample: login neo@smartmarkets.ai'
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Please provide a valid email address'
      };
    }
    
    try {
      onProgress({ step: 'sending_magic_link', message: '🔐 Sending magic link...' });
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}?auth=success`
        }
      });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: `✅ Magic link sent to ${email}\n\nCheck your inbox and click the link to authenticate.\nThe link will redirect you back to this terminal.`,
        data: { 
          email: email,
          method: 'magic_link',
          redirect_url: `${window.location.origin}?auth=success`
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        message: `Magic link failed: ${errorMessage}\n\nTip: Check if ${email} is a valid email address`,
        error: 'MAGIC_LINK_ERROR'
      };
    }
  }
};

// Register the command (this will override the existing GitHub OAuth login)
registry.register(magicLinkCommand);

// Add status command to check authentication
const statusCommand: Command = {
  name: 'status',
  description: 'Show authentication and subscription status',
  usage: 'status',
  category: 'auth',
  execute: async (args, options: CommandOptions = {}) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return {
          success: true,
          message: '❌ Not authenticated\n\nUse: login <email> to get started',
          data: { authenticated: false }
        };
      }
      
      return {
        success: true,
        message: `✅ Authenticated as ${user.email}\n📧 Ready for QBR generation\n🔗 Account ID: ${user.id.substring(0, 8)}...`,
        data: { 
          authenticated: true, 
          email: user.email,
          user_id: user.id
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Status check failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
};

registry.register(statusCommand);

export default magicLinkCommand; 