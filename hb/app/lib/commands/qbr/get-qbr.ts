/**
 * Fire-and-Forget QBR Command
 * SmartMarkets.ai Hospital M&A Territorial Intelligence
 * STATELESS implementation per SS15-yaml.md authority
 */

import { Command, CommandOptions } from '../types';
import registry from '../registry';
import { supabase } from '../../utils/supabase';

const getQBRCommand: Command = {
  name: 'get',
  description: 'Queue QBR for 9pm batch processing (fire-and-forget)',
  usage: 'get QBR [--t-only]',
  category: 'qbr',
  execute: async (args, options: CommandOptions = {}) => {
    const onProgress = options.onProgress || (() => {});
    
    // Check if user wants QBR
    if (args._?.[0] !== 'QBR') {
      return {
        success: false,
        message: 'Usage: get QBR\nExample: get QBR'
      };
    }
    
    try {
      // Step 1: Verify authentication
      onProgress({ step: 'authentication', message: '🔐 Verifying authentication...' });
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: '❌ Authentication required\n\nUse: login <email> to authenticate first'
        };
      }
      
      // Step 2: Fire-and-forget queue insertion
      onProgress({ step: 'queuing', message: '📝 Queuing for 9pm batch processing...' });
      
      // INSERT ON CONFLICT DO NOTHING pattern (fire-and-forget)
      const { error: queueError } = await supabase
        .from('qbr_generation_queue')
        .insert({
          user_email: user.email,
          request_date: new Date().toISOString().split('T')[0], // Today's date
          requested_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (queueError) {
        // Check if it's a duplicate (expected behavior)
        if (queueError.code === '23505') { // Unique constraint violation
          return {
            success: true,
            message: '⚠️ Already queued for today - one QBR per day\n\n📧 Check your email after 9pm CST for delivery',
            data: { status: 'duplicate', email: user.email }
          };
        }
        throw queueError;
      }
      
      return {
        success: true,
        message: '✅ Queued for 9pm batch processing\n\n📧 Your QBR will be emailed after batch completion\n🕘 Processing time: 9pm CST daily',
        data: { 
          status: 'queued', 
          email: user.email,
          batch_time: '9pm CST',
          fire_and_forget: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `QBR queue failed: ${error instanceof Error ? error.message : String(error)}\n\nTry again tomorrow or contact support`,
        error: 'QBR_QUEUE_ERROR'
      };
    }
  }
};

// Register the command
registry.register(getQBRCommand);

export default getQBRCommand; 