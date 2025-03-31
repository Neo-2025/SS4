/**
 * Supabase Client
 * Provides a centralized Supabase client for the app
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Create a single supabase client for the entire app
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY); 