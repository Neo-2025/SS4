/**
 * Supabase Service
 * Provides database operations using Supabase client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Agency, AgencyGroupType } from '@/app/lib/models/agency';
import { env } from '@/app/lib/env';
import { logDetailedError } from '@/app/lib/utils/error-handler';

export class SupabaseService {
  private client: SupabaseClient;
  
  constructor() {
    // Check both env object and process.env for Supabase URL and key
    const supabaseUrl = env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    console.log(`Initializing Supabase with URL: ${supabaseUrl.substring(0, 10)}...`);
    
    this.client = createClient(supabaseUrl, supabaseKey);
  }
  
  /**
   * Save an agency to the database (insert or update)
   * @param agency Agency to save
   * @param userId User ID owner
   * @returns Promise<string> Agency UUID
   */
  async saveAgency(agency: Agency, userId: string): Promise<string> {
    try {
      const { data, error } = await this.client
        .from('agencies')
        .upsert({
          ccn: agency.ccn,
          name: agency.name,
          address: agency.address,
          city: agency.city,
          state: agency.state,
          zip: agency.zip,
          phone: agency.phone,
          type: agency.type,
          ownership: agency.ownership,
          certification_date: agency.certificationDate,
          updated_at: new Date().toISOString(),
          is_fallback_data: (agency as any).isFallbackData || false,
          user_id: userId
        })
        .select('id')
        .single();
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table agencies not found. Agency data will not be persisted.`);
          return `local-${agency.ccn}`;
        }
        
        logDetailedError(error, { operation: 'saving agency', agency, userId });
        throw error;
      }
      
      return data.id;
    } catch (error) {
      logDetailedError(error, { operation: 'saving agency', agency, userId });
      // Return a local ID so the app can continue
      return `local-${agency.ccn}`;
    }
  }
  
  /**
   * Get an agency by CCN
   * @param ccn CCN to look up
   * @param userId User ID owner
   * @returns Promise<Agency | null> Agency or null if not found
   */
  async getAgencyByCCN(ccn: string, userId: string): Promise<Agency | null> {
    try {
      const { data, error } = await this.client
        .from('agencies')
        .select('*')
        .eq('ccn', ccn)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table agencies not found. Agency data will not be retrieved.`);
          return null;
        }
        
        if (error.code === 'PGRST116') return null; // Not found
        
        logDetailedError(error, { operation: 'getting agency by CCN', ccn, userId });
        throw error;
      }
      
      return {
        ccn: data.ccn,
        name: data.name,
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        phone: data.phone || '',
        type: data.type || 'HHA',
        ownership: data.ownership || '',
        certificationDate: data.certification_date || ''
      };
    } catch (error) {
      logDetailedError(error, { operation: 'getting agency by CCN', ccn, userId });
      return null;
    }
  }
  
  /**
   * Get all agencies for a user
   * @param userId User ID
   * @returns Promise<Agency[]> List of agencies
   */
  async getAllAgencies(userId: string): Promise<Agency[]> {
    try {
      const { data, error } = await this.client
        .from('agencies')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table agencies not found. Agency data will not be retrieved.`);
          return [];
        }
        
        logDetailedError(error, { operation: 'getting all agencies', userId });
        throw error;
      }
      
      return data.map(row => ({
        ccn: row.ccn,
        name: row.name,
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        zip: row.zip || '',
        phone: row.phone || '',
        type: row.type || 'HHA',
        ownership: row.ownership || '',
        certificationDate: row.certification_date || ''
      }));
    } catch (error) {
      logDetailedError(error, { operation: 'getting all agencies', userId });
      return [];
    }
  }
  
  /**
   * Add an agency to a group
   * @param ccn Agency CCN (not UUID)
   * @param groupType Group type (Org, Comp, Target)
   * @param userId User ID
   * @returns Promise<boolean> Success
   */
  async addAgencyToGroup(ccn: string, groupType: AgencyGroupType, userId: string): Promise<boolean> {
    try {
      // First get the agency UUID
      const { data: agencies, error: agencyError } = await this.client
        .from('agencies')
        .select('id')
        .eq('ccn', ccn)
        .eq('user_id', userId)
        .limit(1);
        
      if (agencyError) {
        // Handle 42P01 error (table not found)
        if (agencyError.code === '42P01') {
          console.warn(`Table agencies not found. Agency group will not be saved.`);
          return true; // Return success so the app can continue
        }
        
        logDetailedError(agencyError, { operation: 'finding agency for group', ccn, userId });
        throw agencyError;
      }
      
      if (!agencies || agencies.length === 0) {
        console.warn(`Agency ${ccn} not found. Cannot add to group.`);
        return false;
      }
      
      const agencyId = agencies[0].id;
      
      // Now add to group
      const { error } = await this.client
        .from('agency_groups')
        .upsert({
          agency_id: agencyId,
          group_type: groupType,
          user_id: userId
        });
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table agency_groups not found. Agency group will not be saved.`);
          return true; // Return success so the app can continue
        }
        
        logDetailedError(error, { operation: 'adding agency to group', ccn, agencyId, groupType, userId });
        throw error;
      }
      
      return true;
    } catch (error) {
      logDetailedError(error, { operation: 'adding agency to group', ccn, groupType, userId });
      return false;
    }
  }
  
  /**
   * Get agencies by group type
   * @param groupType Group type to filter by
   * @param userId User ID
   * @returns Promise<Agency[]> List of agencies in the group
   */
  async getAgenciesByGroup(groupType: AgencyGroupType, userId: string): Promise<Agency[]> {
    try {
      // Define the expected shape of the response
      type AgencyGroupRow = {
        agency_id: string;
        agencies: {
          ccn: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          phone: string | null;
          type: string | null;
          ownership: string | null;
          certification_date: string | null;
        };
      };
      
      const { data, error } = await this.client
        .from('agency_groups')
        .select(`
          agency_id,
          agencies (
            ccn,
            name,
            address,
            city,
            state,
            zip,
            phone,
            type,
            ownership,
            certification_date
          )
        `)
        .eq('group_type', groupType)
        .eq('user_id', userId);
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table agency_groups not found. Agency groups will not be retrieved.`);
          return [];
        }
        
        logDetailedError(error, { operation: 'getting agencies by group', groupType, userId });
        throw error;
      }
      
      // Cast the response to the expected type
      const typedData = data as unknown as AgencyGroupRow[];
      
      return typedData.map(row => ({
        ccn: row.agencies.ccn,
        name: row.agencies.name,
        address: row.agencies.address || '',
        city: row.agencies.city || '',
        state: row.agencies.state || '',
        zip: row.agencies.zip || '',
        phone: row.agencies.phone || '',
        type: row.agencies.type || 'HHA',
        ownership: row.agencies.ownership || '',
        certificationDate: row.agencies.certification_date || ''
      }));
    } catch (error) {
      logDetailedError(error, { operation: 'getting agencies by group', groupType, userId });
      return [];
    }
  }
  
  /**
   * Store data in API cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds
   * @returns Promise<boolean> Success
   */
  async setCacheData(key: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);
      
      const { error } = await this.client
        .from('api_cache')
        .upsert({
          cache_key: key,
          data,
          expires_at: expiresAt.toISOString()
        });
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table api_cache not found. Cache data will not be saved.`);
          return true; // Return success so the app can continue
        }
        
        logDetailedError(error, { operation: 'setting cache data', key, ttlSeconds });
        throw error;
      }
      
      return true;
    } catch (error) {
      logDetailedError(error, { operation: 'setting cache data', key });
      return false;
    }
  }
  
  /**
   * Get data from API cache
   * @param key Cache key
   * @returns Promise<any | null> Cached data or null if not found or expired
   */
  async getCacheData(key: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('api_cache')
        .select('data, expires_at')
        .eq('cache_key', key)
        .single();
        
      if (error) {
        // Handle 42P01 error (table not found)
        if (error.code === '42P01') {
          console.warn(`Table api_cache not found. Cache data will not be retrieved.`);
          return null;
        }
        
        // Handle PGRST116 error (no rows returned)
        if (error.code === 'PGRST116') {
          return null;
        }
        
        logDetailedError(error, { operation: 'getting cache data', key });
        throw error;
      }
      
      // Check if expired
      const now = new Date();
      const expires = new Date(data.expires_at);
      
      if (now > expires) return null;
      
      return data.data;
    } catch (error) {
      logDetailedError(error, { operation: 'getting cache data', key });
      return null;
    }
  }
  
  /**
   * Check database connection and tables
   * @returns Promise<{isConnected: boolean, tables: string[]}>
   */
  async checkConnection(): Promise<{isConnected: boolean, tables: string[]}> {
    try {
      // Check if tables exist
      const { data, error } = await this.client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        console.error('Database schema check error:', error);
        return { isConnected: false, tables: [] };
      }
      
      const tables = (data || []).map(t => t.table_name);
      return { 
        isConnected: true, 
        tables 
      };
    } catch (error) {
      console.error('Database connection check failed:', error);
      return { isConnected: false, tables: [] };
    }
  }
} 