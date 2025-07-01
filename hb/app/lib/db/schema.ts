/**
 * Database Schema Definitions
 */

/**
 * Command History Table
 * Tracks the history of commands executed by users
 */
export interface CommandHistoryRecord {
  id: string;         // UUID primary key
  user_id: string;    // Supabase auth user ID
  command: string;    // The executed command
  args: any;          // Command arguments (JSON)
  success: boolean;   // Whether the command executed successfully
  timestamp: string;  // ISO timestamp of execution
}

/**
 * User Session Table
 * Tracks user session information
 */
export interface UserSessionRecord {
  id: string;            // UUID primary key
  user_id: string;       // Supabase auth user ID
  started_at: string;    // ISO timestamp of session start
  last_active_at: string;// ISO timestamp of last activity
  is_active: boolean;    // Whether the session is still active
  client_info: any;      // Client information (JSON) including browser, OS, etc.
}

/**
 * Health Metrics Table
 * Stores basic health metrics
 */
export interface HealthMetricRecord {
  id: string;          // UUID primary key
  component: string;   // Component name
  status: string;      // Status (online, offline, degraded)
  check_time: string;  // ISO timestamp of check
  details: any;        // Additional details (JSON)
}

/**
 * Database Tables
 * Provides type-safe access to table names
 */
export const DB_TABLES = {
  COMMAND_HISTORY: 'command_history',
  USER_SESSIONS: 'user_sessions',
  HEALTH_METRICS: 'health_metrics'
} as const;

/**
 * Type-safe Table Names
 */
export type DBTableName = typeof DB_TABLES[keyof typeof DB_TABLES]; 