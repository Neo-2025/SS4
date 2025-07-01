/**
 * Enhanced Agency Service
 * 
 * Provides agency management capabilities with reference data validation.
 * This service validates all agency operations against a pre-populated 
 * database of Texas Home Health Agencies from the CMS Provider Data API.
 */

import { Agency, AgencyGroupType } from '../models/agency';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class EnhancedAgencyService {
  private supabase: SupabaseClient;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  /**
   * Add an agency by CCN after validating against reference data
   */
  async addAgency(ccn: string): Promise<Agency> {
    try {
      // Get authenticated user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      // Check if agency exists in reference table
      const { data: refAgency, error: refError } = await this.supabase
        .from('agency_reference')
        .select('*')
        .eq('ccn', ccn)
        .single();
      
      if (refError || !refAgency) {
        throw new Error(`Agency with CCN ${ccn} not found in reference data`);
      }
      
      // Check if user already has this agency
      const { data: userAgency, error: userError } = await this.supabase
        .from('user_agencies')
        .select('*')
        .eq('user_id', user.id)
        .eq('ccn', ccn)
        .maybeSingle();
      
      if (!userError && userAgency) {
        // Already exists, return the agency
        return this.mapDatabaseAgency(refAgency);
      }
      
      // Add to user_agencies
      const { error: insertError } = await this.supabase
        .from('user_agencies')
        .insert({
          user_id: user.id,
          ccn: ccn,
          group_type: null
        });
      
      if (insertError) {
        throw new Error(`Failed to add agency: ${insertError.message}`);
      }
      
      return this.mapDatabaseAgency(refAgency);
    } catch (error: any) {
      console.error('Error in addAgency:', error);
      throw error;
    }
  }
  
  /**
   * List all agencies for the current user
   */
  async listAgencies(): Promise<Agency[]> {
    try {
      // Get authenticated user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      // Join user_agencies with agency_reference
      const { data, error } = await this.supabase
        .from('user_agencies')
        .select(`
          ccn,
          group_type,
          agency_reference (*)
        `)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(`Failed to list agencies: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Map to agency model
      return data
        .filter(item => item.agency_reference) // Ensure agency reference exists
        .map(item => this.mapJoinedAgency(item));
    } catch (error: any) {
      console.error('Error in listAgencies:', error);
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Group an agency by type
   */
  async groupAgency(ccn: string, groupType: AgencyGroupType): Promise<boolean> {
    try {
      // Get authenticated user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      // Check if user has this agency
      const { data: userAgency, error: checkError } = await this.supabase
        .from('user_agencies')
        .select('*')
        .eq('user_id', user.id)
        .eq('ccn', ccn)
        .maybeSingle();
      
      if (checkError || !userAgency) {
        throw new Error(`Agency with CCN ${ccn} not found in your list`);
      }
      
      // Update group type
      const { error: updateError } = await this.supabase
        .from('user_agencies')
        .update({ group_type: groupType })
        .eq('user_id', user.id)
        .eq('ccn', ccn);
      
      if (updateError) {
        throw new Error(`Failed to group agency: ${updateError.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in groupAgency:', error);
      throw error;
    }
  }
  
  /**
   * Search for agencies in the reference data
   */
  async searchAgencies(query: string): Promise<Agency[]> {
    try {
      // Get authenticated user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      // Format the query for case-insensitive search
      const formattedQuery = query.trim().toLowerCase();
      
      // Search reference table
      const { data, error } = await this.supabase
        .from('agency_reference')
        .select('*')
        .or(`name.ilike.%${formattedQuery}%,city.ilike.%${formattedQuery}%,ccn.ilike.%${formattedQuery}%`)
        .eq('state', 'TX')
        .limit(20);
      
      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(this.mapDatabaseAgency);
    } catch (error: any) {
      console.error('Error in searchAgencies:', error);
      return [];
    }
  }
  
  /**
   * Get agencies by group type
   */
  async getAgenciesByGroup(groupType: AgencyGroupType): Promise<Agency[]> {
    try {
      // Get authenticated user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      // Join user_agencies with agency_reference
      const { data, error } = await this.supabase
        .from('user_agencies')
        .select(`
          ccn,
          group_type,
          agency_reference (*)
        `)
        .eq('user_id', user.id)
        .eq('group_type', groupType);
      
      if (error) {
        throw new Error(`Failed to get agencies by group: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Map to agency model
      return data
        .filter(item => item.agency_reference) // Ensure agency reference exists
        .map(item => this.mapJoinedAgency(item));
    } catch (error: any) {
      console.error(`Error in getAgenciesByGroup(${groupType}):`, error);
      return [];
    }
  }
  
  /**
   * Get all agency groups
   */
  async getAgencyGroups(): Promise<Record<AgencyGroupType, Agency[]>> {
    const result: Record<AgencyGroupType, Agency[]> = {
      'Org': [],
      'Comp': [],
      'Target': []
    };
    
    try {
      result.Org = await this.getAgenciesByGroup('Org');
      result.Comp = await this.getAgenciesByGroup('Comp');
      result.Target = await this.getAgenciesByGroup('Target');
    } catch (error) {
      console.error('Error in getAgencyGroups:', error);
    }
    
    return result;
  }
  
  // Helper methods for mapping database records to Agency objects
  private mapDatabaseAgency(dbAgency: any): Agency {
    return {
      ccn: dbAgency.ccn,
      name: dbAgency.name,
      address: dbAgency.address || '',
      city: dbAgency.city || '',
      state: dbAgency.state || 'TX',
      zip: dbAgency.zip || '',
      phone: dbAgency.phone || '',
      type: dbAgency.type || 'HHA',
      ownership: dbAgency.ownership || '',
      certificationDate: dbAgency.certification_date || '',
    };
  }
  
  private mapJoinedAgency(joinedRecord: any): Agency {
    const refAgency = joinedRecord.agency_reference;
    return {
      ...this.mapDatabaseAgency(refAgency),
      groupType: joinedRecord.group_type
    };
  }
} 