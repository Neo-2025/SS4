/**
 * Subscription Command
 * SmartMarkets.ai CLI-First SaaS Subscription Management
 * ACTUAL Stripe integration using real product IDs
 */

import { Command, CommandOptions } from '../types';
import registry from '../registry';
import { supabase } from '../../utils/supabase';

const subscribeCommand: Command = {
  name: 'subscribe',
  description: 'Subscribe to SmartMarkets.ai plans',
  usage: 'subscribe --plan=<beta|standard>',
  category: 'auth',
  args: [
    { name: 'plan', type: 'string', required: false, description: 'Subscription plan: beta ($1/month) or standard ($499/month)' }
  ],
  execute: async (args, options: CommandOptions = {}) => {
    const onProgress = options.onProgress || (() => {});
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        message: 'Please login first: login <email>'
      };
    }
    
    // Get plan from arguments
    const planInput = args.plan || args._?.[0] || 'beta';
    
    // Validate plan with proper typing
    const validPlans = ['beta', 'standard'] as const;
    type ValidPlan = typeof validPlans[number];
    
    if (!validPlans.includes(planInput as ValidPlan)) {
      return {
        success: false,
        message: 'Invalid plan. Choose: beta ($1/month) or standard ($499/month)\nUsage: subscribe --plan=beta'
      };
    }
    
    // Now plan is properly typed
    const plan: ValidPlan = planInput as ValidPlan;
    
    try {
      onProgress({ step: 'creating_checkout', message: '💳 Creating Stripe checkout...' });
      
      // Get Stripe configuration from our database
      const { data: stripeConfig, error: configError } = await supabase
        .from('stripe_config')
        .select('*')
        .eq('tier_name', plan)
        .single();
      
      if (configError || !stripeConfig) {
        throw new Error(`Plan configuration not found: ${plan}`);
      }
      
      // Call our Stripe checkout Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          user_id: user.id,
          user_email: user.email,
          plan: plan,
          price_id: stripeConfig.price_id,
          success_url: `${window.location.origin}?checkout=success`,
          cancel_url: `${window.location.origin}?checkout=cancel`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Open Stripe checkout in new tab
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }
      
      const planDetails: Record<ValidPlan, { price: string; description: string }> = {
        beta: { price: '$1.00/month', description: 'Beta testing access with full QBR capabilities' },
        standard: { price: '$499.00/month', description: 'Full territorial intelligence platform' }
      };
      
      return {
        success: true,
        message: `🚀 Stripe checkout opened for ${plan} plan\n\n` +
                `Plan: ${planDetails[plan].description}\n` +
                `Price: ${planDetails[plan].price}\n\n` +
                `Complete payment in the new tab to activate your subscription.\n` +
                `Run 'status' to check your subscription status.`,
        data: { 
          plan: plan,
          checkout_url: data.checkout_url,
          price_id: stripeConfig.price_id,
          monthly_rate: stripeConfig.monthly_rate
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        message: `Subscription failed: ${errorMessage}\n\nPlease try again or contact support.`,
        error: 'SUBSCRIPTION_ERROR'
      };
    }
  }
};

// Register the command
registry.register(subscribeCommand);

export default subscribeCommand; 