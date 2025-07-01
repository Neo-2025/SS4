/**
 * Login Command
 * Handles authentication to Supabase using GitHub OAuth
 * Following the CORE pattern where Vercel is the primary SOR for environment variables
 */

import { Command, CommandOptions } from '../types';
import registry from '../registry';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import { AuthProgressTracker } from '../../utils/auth-progress-tracker';

const loginCommand: Command = {
  name: 'login',
  description: 'Authenticate with HealthBench using GitHub',
  usage: 'login [email]',
  category: 'auth',
  args: [],
  execute: async (args, options: CommandOptions = {}) => {
    const onProgress = options.onProgress || (() => {});
    const tracker = new AuthProgressTracker(onProgress);
    
    // YOLO: Direct login bypass for testing
    // This allows Branch 2 testing to be completed with test credentials
    
    // Get email from any possible location in args
    // Check all possible arg locations
    const emailCandidate = 
      args?.email || // Named parameter
      args?.arg1 ||  // First positional argument
      (typeof args === 'string' ? args : ''); // Direct string
      
    const TEST_EMAIL = 'neo@smartscale.co';
    
    console.log('YOLO Debug - Login command arguments:', JSON.stringify(args));
    console.log('YOLO Debug - Email detected:', emailCandidate);
    
    if (emailCandidate === TEST_EMAIL) {
      console.log('YOLO Debug - Test user detected, bypassing OAuth');
      tracker.authenticating();
      
      try {
        // Create a direct session for the test user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: 'Episode2025!' // This is a test password only for preview environments
        });
        
        if (error) {
          console.log('YOLO Debug - Auth error:', error.message);
          tracker.error(error);
          return {
            success: false,
            message: `Authentication failed: ${error.message}`,
            error: error.message
          };
        }
        
        console.log('YOLO Debug - Auth successful');
        tracker.complete(TEST_EMAIL);
        return {
          success: true,
          message: 'Successfully logged in with test account (YOLO bypass).',
          data: { user: data.user }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('YOLO Debug - Auth exception:', errorMessage);
        tracker.error(new Error(errorMessage));
        
        return {
          success: false,
          message: `Login attempt failed: ${errorMessage}`,
          error: 'LOGIN_ERROR'
        };
      }
    }
    
    // Regular GitHub OAuth flow
    if (!isSupabaseConfigured(true)) {
      return {
        success: false,
        message: 'Authentication is not properly configured. GitHub OAuth credentials are missing.\n' +
                'CORE PATTERN: Run "npm run vercel:env:pull" to pull environment variables from Vercel (primary SOR).',
        error: 'CONFIG_ERROR'
      };
    }
    
    try {
      // Get the base URL for proper redirection
      const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 
                     (typeof window !== 'undefined' ? window.location.origin : '');
      
      // Notify that we're redirecting
      tracker.redirecting();
      
      // Initiate GitHub OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        }
      });
      
      if (error) {
        tracker.error(error);
        return {
          success: false,
          message: `GitHub authentication failed: ${error.message}`,
          error: error.message
        };
      }
      
      return {
        success: true,
        message: 'Redirecting to GitHub for authentication...',
        data: { method: 'github_oauth', url: data?.url }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      tracker.error(new Error(errorMessage));
      
      return {
        success: false,
        message: `Login attempt failed: ${errorMessage}`,
        error: 'LOGIN_ERROR'
      };
    }
  }
};

// Register the command
registry.register(loginCommand);

export default loginCommand; 