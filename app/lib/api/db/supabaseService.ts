/**
 * Supabase Service
 * Provides database operations using Supabase client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Agency, AgencyGroupType } from '@/app/lib/models/agency';
import { env } from '@/app/lib/env';

export class SupabaseService {
  private client: SupabaseClient;
  
  constructor() {
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );
  }
  
  /**
   * Save an agency to the database (insert or update)
   * @param agency Agency to save
   * @param userId User ID owner
   * @returns Promise<string> Agency UUID
   */
  async saveAgency(agency: Agency, userId: string): Promise<string> {
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
        last_updated: new Date().toISOString(),
        is_fallback_data: (agency as any).isFallbackData || false,
        user_id: userId
      })
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  }
  
  /**
   * Get agency by CCN
   * @param ccn Agency CCN
   * @param userId User ID owner
   * @returns Promise<Agency | null>
   */
  async getAgencyByCCN(ccn: string, userId: string): Promise<Agency | null> {
    const { data, error } = await this.client
      .from('agencies')
      .select('*')
      .eq('ccn', ccn)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // Not found is not an error for our purposes
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    if (!data) return null;
    
    return {
      ccn: data.ccn,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      type: data.type,
      ownership: data.ownership,
      certificationDate: data.certification_date,
      isFallbackData: data.is_fallback_data
    };
  }
  
  /**
   * Get agency ID by CCN
   * @param ccn Agency CCN
   * @param userId User ID owner
   * @returns Promise<string | null> Agency UUID
   */
  async getAgencyIdByCCN(ccn: string, userId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from('agencies')
      .select('id')
      .eq('ccn', ccn)
      .eq('user_id', userId)
      .single();
      
    if (error || !data) return null;
    return data.id;
  }
  
  /**
   * Get all agencies for a user
   * @param userId User ID owner
   * @returns Promise<Agency[]>
   */
  async getAgenciesByUser(userId: string): Promise<Agency[]> {
    const { data, error } = await this.client
      .from('agencies')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(row => ({
      ccn: row.ccn,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      type: row.type,
      ownership: row.ownership,
      certificationDate: row.certification_date,
      isFallbackData: row.is_fallback_data
    }));
  }
  
  /**
   * Add an agency to a group
   * @param agencyId Agency UUID
   * @param groupType Group type (Org, Comp, Target)
   * @param userId User ID
   * @returns Promise<boolean> Success
   */
  async addAgencyToGroup(agencyId: string, groupType: AgencyGroupType, userId: string): Promise<boolean> {
    const { error } = await this.client
      .from('agency_groups')
      .upsert({
        agency_id: agencyId,
        group_type: groupType,
        user_id: userId
      });
      
    return !error;
  }
  
  /**
   * Get agencies by group type
   * @param groupType Group type (Org, Comp, Target)
   * @param userId User ID
   * @returns Promise<Agency[]>
   */
  async getAgenciesByGroupType(groupType: AgencyGroupType, userId: string): Promise<Agency[]> {
    const { data, error } = await this.client
      .from('agency_groups')
      .select(`
        agency_id,
        agencies!inner (*)
      `)
      .eq('group_type', groupType)
      .eq('user_id', userId)
      .eq('agencies.user_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(row => {
      const agency = row.agencies;
      return {
        ccn: agency.ccn,
        name: agency.name,
        address: agency.address,
        city: agency.city,
        state: agency.state,
        zip: agency.zip,
        phone: agency.phone,
        type: agency.type,
        ownership: agency.ownership,
        certificationDate: agency.certification_date,
        isFallbackData: agency.is_fallback_data
      };
    });
  }
  
  /**
   * Store data in API cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds
   * @returns Promise<boolean> Success
   */
  async setCacheData(key: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);
    
    const { error } = await this.client
      .from('api_cache')
      .upsert({
        cache_key: key,
        data,
        expires_at: expiresAt.toISOString()
      });
      
    return !error;
  }
  
  /**
   * Get data from API cache
   * @param key Cache key
   * @returns Promise<any | null> Cached data
   */
  async getCacheData(key: string): Promise<any | null> {
    const now = new Date().toISOString();
    
    const { data, error } = await this.client
      .from('api_cache')
      .select('data')
      .eq('cache_key', key)
      .gt('expires_at', now)
      .single();
      
    if (error || !data) return null;
    return data.data;
  }
} 