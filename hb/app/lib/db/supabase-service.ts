/**
 * Supabase Service
 * Provides methods to interact with the Supabase database
 */

import { supabase } from '../utils/supabase';
import { DB_TABLES, CommandHistoryRecord, UserSessionRecord, HealthMetricRecord } from './schema';
import { handleDatabaseError, logDetailedError } from '../utils/error-handler';

/**
 * Command History Service
 */
export const commandHistoryService = {
  /**
   * Add a new command history record
   */
  async add(record: Omit<CommandHistoryRecord, 'id' | 'timestamp'>): Promise<CommandHistoryRecord | null> {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.COMMAND_HISTORY)
        .insert({
          ...record,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.COMMAND_HISTORY} not found. Command history will not be saved.`);
          // Return a mock record instead of failing
          return {
            id: 'local-' + Date.now(),
            user_id: record.user_id,
            command: record.command,
            args: record.args,
            success: record.success,
            timestamp: new Date().toISOString()
          };
        }
        
        logDetailedError(error, { operation: 'adding command history', record });
        console.error('Error adding command history:', handleDatabaseError(error, 'adding command history').message);
        return null;
      }
      
      return data as CommandHistoryRecord;
    } catch (error) {
      logDetailedError(error, { operation: 'adding command history', record });
      return null;
    }
  },
  
  /**
   * Get command history for a user
   */
  async getByUser(userId: string, limit = 50): Promise<CommandHistoryRecord[]> {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.COMMAND_HISTORY)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.COMMAND_HISTORY} not found. Returning empty command history.`);
          return [];
        }
        
        logDetailedError(error, { operation: 'fetching command history', userId });
        console.error('Error fetching command history:', handleDatabaseError(error, 'fetching command history').message);
        return [];
      }
      
      return data as CommandHistoryRecord[];
    } catch (error) {
      logDetailedError(error, { operation: 'fetching command history', userId });
      return [];
    }
  }
};

/**
 * User Session Service
 */
export const userSessionService = {
  /**
   * Start a new user session
   */
  async start(userId: string, clientInfo: any): Promise<UserSessionRecord | null> {
    try {
      const timestamp = new Date().toISOString();
      
      // End any existing active sessions for this user
      await this.endAllForUser(userId);
      
      // Create a new session
      const { data, error } = await supabase
        .from(DB_TABLES.USER_SESSIONS)
        .insert({
          user_id: userId,
          started_at: timestamp,
          last_active_at: timestamp,
          is_active: true,
          client_info: clientInfo
        })
        .select()
        .single();
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.USER_SESSIONS} not found. Using local session.`);
          // Return a mock session instead of failing
          return {
            id: 'local-' + Date.now(),
            user_id: userId,
            started_at: timestamp,
            last_active_at: timestamp,
            is_active: true,
            client_info: clientInfo
          };
        }
        
        logDetailedError(error, { operation: 'starting user session', userId });
        console.error('Error starting user session:', handleDatabaseError(error, 'starting user session').message);
        return null;
      }
      
      return data as UserSessionRecord;
    } catch (error) {
      logDetailedError(error, { operation: 'starting user session', userId });
      return null;
    }
  },
  
  /**
   * Update the last active time for a session
   */
  async updateActivity(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(DB_TABLES.USER_SESSIONS)
        .update({
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        // If it's a local session ID (starts with 'local-'), just return success
        if (sessionId.startsWith('local-')) {
          return true;
        }
        
        logDetailedError(error, { operation: 'updating session activity', sessionId });
        console.error('Error updating session activity:', handleDatabaseError(error, 'updating session activity').message);
        return false;
      }
      
      return true;
    } catch (error) {
      logDetailedError(error, { operation: 'updating session activity', sessionId });
      return false;
    }
  },
  
  /**
   * End a specific session
   */
  async end(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from(DB_TABLES.USER_SESSIONS)
      .update({
        is_active: false,
        last_active_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error ending session:', error);
      return false;
    }
    
    return true;
  },
  
  /**
   * End all active sessions for a user
   */
  async endAllForUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(DB_TABLES.USER_SESSIONS)
        .update({
          is_active: false,
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.USER_SESSIONS} not found. Skipping session end.`);
          return true;
        }
        
        logDetailedError(error, { operation: 'ending user sessions', userId });
        console.error('Error ending user sessions:', handleDatabaseError(error, 'ending user sessions').message);
        return false;
      }
      
      return true;
    } catch (error) {
      logDetailedError(error, { operation: 'ending user sessions', userId });
      return false;
    }
  },
  
  /**
   * Get active session for a user
   */
  async getActive(userId: string): Promise<UserSessionRecord | null> {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.USER_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        // Handle PGRST116 error (no rows returned)
        if (error.code === 'PGRST116') {
          return null;
        }
        
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.USER_SESSIONS} not found. Using local session.`);
          // Return a mock session instead of failing
          return {
            id: 'local-' + Date.now(),
            user_id: userId,
            started_at: new Date().toISOString(),
            last_active_at: new Date().toISOString(),
            is_active: true,
            client_info: { source: 'local-fallback' }
          };
        }
        
        logDetailedError(error, { operation: 'getting active session', userId });
        console.error('Error fetching active session:', handleDatabaseError(error, 'fetching active session').message);
        return null;
      }
      
      return data as UserSessionRecord;
    } catch (error) {
      logDetailedError(error, { operation: 'getting active session', userId });
      return null;
    }
  }
};

/**
 * Health Metrics Service
 */
export const healthMetricsService = {
  /**
   * Record a health check
   */
  async record(record: Omit<HealthMetricRecord, 'id' | 'check_time'>): Promise<HealthMetricRecord | null> {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.HEALTH_METRICS)
        .insert({
          ...record,
          check_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.HEALTH_METRICS} not found. Health metrics will not be saved.`);
          // Return a mock record instead of failing
          return {
            id: 'local-' + Date.now(),
            component: record.component,
            status: record.status,
            check_time: new Date().toISOString(),
            details: record.details
          };
        }
        
        logDetailedError(error, { operation: 'recording health metric', record });
        console.error('Error recording health metric:', handleDatabaseError(error, 'recording health metric').message);
        return null;
      }
      
      return data as HealthMetricRecord;
    } catch (error) {
      logDetailedError(error, { operation: 'recording health metric', record });
      return null;
    }
  },
  
  /**
   * Get latest health metrics for all components
   */
  async getLatest(): Promise<HealthMetricRecord[]> {
    try {
      // This requires a more complex query to get the latest record for each component
      // For simplicity, we'll just get the latest 50 records
      const { data, error } = await supabase
        .from(DB_TABLES.HEALTH_METRICS)
        .select('*')
        .order('check_time', { ascending: false })
        .limit(50);
      
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table ${DB_TABLES.HEALTH_METRICS} not found. Returning mock health metrics.`);
          // Return mock metrics instead of failing
          return [
            {
              id: 'local-1',
              component: 'API',
              status: 'online',
              check_time: new Date().toISOString(),
              details: { source: 'local-fallback' }
            },
            {
              id: 'local-2',
              component: 'Database',
              status: 'online',
              check_time: new Date().toISOString(),
              details: { source: 'local-fallback' }
            }
          ];
        }
        
        logDetailedError(error, { operation: 'fetching health metrics' });
        console.error('Error fetching health metrics:', handleDatabaseError(error, 'fetching health metrics').message);
        return [];
      }
      
      return data as HealthMetricRecord[];
    } catch (error) {
      logDetailedError(error, { operation: 'fetching health metrics' });
      return [];
    }
  }
}; 