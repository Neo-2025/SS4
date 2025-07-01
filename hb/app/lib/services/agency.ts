/**
 * Enhanced Agency Service
 * Provides robust agency management with real API integration and persistence
 * Implements Circuit Breaker pattern for API resilience
 */

import { Agency, AgencyGroup, AgencyGroupType } from '../models/agency';
import { CMSProviderDataApi } from '../api/cms/providerDataApi';
import { SupabaseService } from '../api/db/supabaseService';
import { ResilienceFactory, ResilienceService } from '../api/resilience';
import { supabase } from '../utils/supabase';

// Demo agency data for fallback
const demoAgencies: Record<string, Agency> = {
  '123456': {
    ccn: '123456',
    name: 'Valley Home Health Services',
    address: '123 Main St',
    city: 'Springfield',
    state: 'TX',
    zip: '75082',
    phone: '(555) 123-4567',
    type: 'HHA',
    ownership: 'Non-profit',
    certificationDate: '2010-05-15'
  },
  '789012': {
    ccn: '789012',
    name: 'Summit Home Care',
    address: '456 Oak Ave',
    city: 'Austin',
    state: 'TX',
    zip: '73301',
    phone: '(555) 789-0123',
    type: 'HHA',
    ownership: 'For-profit',
    certificationDate: '2015-08-22'
  },
  '345678': {
    ccn: '345678',
    name: 'Lakeside Health Services',
    address: '789 Elm Blvd',
    city: 'Dallas',
    state: 'TX',
    zip: '75001',
    phone: '(555) 345-6789',
    type: 'HHA',
    ownership: 'Government',
    certificationDate: '2008-03-10'
  }
};

/**
 * Enhanced Agency Service
 * Combines API and database operations with resilience patterns
 */
export class AgencyService {
  private cmsApi: CMSProviderDataApi;
  private dbService: SupabaseService;
  
  constructor() {
    this.cmsApi = new CMSProviderDataApi();
    this.dbService = new SupabaseService();
    
    // Make API methods resilient
    this.cmsApi = ResilienceFactory.makeResilient(this.cmsApi, [
      'getAgencyByProviderNumber',
      'getQualityMeasures',
      'getStateBenchmarks',
      'getNationalBenchmarks'
    ]);
  }
  
  /**
   * Get fallback data for API methods
   * Used by the ResilienceFactory when circuit is open
   */
  getFallbackData(method: string, ...args: any[]): any {
    if (method === 'getAgencyByProviderNumber') {
      const ccn = args[0];
      return this.getFallbackAgency(ccn);
    }
    
    throw new Error(`No fallback available for ${method}`);
  }
  
  /**
   * Add an agency by CCN
   * @param ccn CMS Certification Number
   * @returns Promise<Agency> Agency object
   */
  async addAgency(ccn: string): Promise<Agency> {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to add agencies');
    }
    
    try {
      // First check if agency already exists in database
      const existingAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
      if (existingAgency) {
        return existingAgency;
      }
      
      // Fetch from API if not in database
      const agency = await this.cmsApi.getAgencyByProviderNumber(ccn);
      
      // Save to database
      await this.dbService.saveAgency(agency, user.id);
      
      return agency;
    } catch (error) {
      console.error('Error in addAgency:', error);
      
      // If API call fails, use fallback data
      const fallbackAgency = this.getFallbackAgency(ccn);
      
      // Save fallback data to database with flag
      try {
        await this.dbService.saveAgency({
          ...fallbackAgency,
          isFallbackData: true
        }, user.id);
      } catch (dbError) {
        console.error('Error saving fallback data:', dbError);
      }
      
      return fallbackAgency;
    }
  }
  
  /**
   * Group an agency as Org, Comp, or Target
   * @param ccn Agency CCN
   * @param type Group type
   * @returns Promise<boolean> Success
   */
  async groupAgency(ccn: string, type: AgencyGroupType): Promise<boolean> {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to group agencies');
    }
    
    try {
      // Ensure agency exists in database
      const existingAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
      
      if (!existingAgency) {
        // Add agency first if it doesn't exist
        const agency = await this.addAgency(ccn);
        if (!agency) return false;
      }
      
      // Find agency ID in database
      const { data } = await supabase
        .from('agencies')
        .select('id')
        .eq('ccn', ccn)
        .eq('user_id', user.id)
        .single();
      
      if (!data || !data.id) {
        throw new Error(`Could not find agency with CCN ${ccn}`);
      }
      
      // Add to group
      return await this.dbService.addAgencyToGroup(data.id, type, user.id);
    } catch (error) {
      console.error('Error in groupAgency:', error);
      return false;
    }
  }
  
  /**
   * List all agencies
   * @returns Promise<Agency[]> List of agencies
   */
  async listAgencies(): Promise<Agency[]> {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to list agencies');
    }
    
    try {
      return await this.dbService.getAllAgencies(user.id);
    } catch (error) {
      console.error('Error in listAgencies:', error);
      return [];
    }
  }
  
  /**
   * Get agencies by group type
   * @param type Group type to filter by
   * @returns Promise<Agency[]> List of agencies in the group
   */
  async getAgenciesByType(type: AgencyGroupType): Promise<Agency[]> {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to get agencies by type');
    }
    
    try {
      return await this.dbService.getAgenciesByGroup(type, user.id);
    } catch (error) {
      console.error(`Error in getAgenciesByType(${type}):`, error);
      return [];
    }
  }
  
  /**
   * Get all agency groups
   * @returns Promise<Record<AgencyGroupType, Agency[]>> Groups by type
   */
  async getAllGroups(): Promise<Record<AgencyGroupType, Agency[]>> {
    return {
      'Org': await this.getAgenciesByType('Org'),
      'Comp': await this.getAgenciesByType('Comp'),
      'Target': await this.getAgenciesByType('Target')
    };
  }
  
  /**
   * Get system resilience status
   * @returns ResilienceStatus Status object
   */
  getResilienceStatus() {
    return ResilienceService.getStatus();
  }
  
  /**
   * Reset the circuit breaker
   */
  resetCircuitBreaker(): void {
    ResilienceService.resetCircuitBreaker();
  }
  
  /**
   * Generate a fallback agency for a CCN
   * @param ccn CMS Certification Number
   * @returns Agency Fallback agency
   */
  private getFallbackAgency(ccn: string): Agency {
    // Check if we have a demo agency with this CCN
    const demoAgency = demoAgencies[ccn];
    
    if (demoAgency) {
      return { ...demoAgency, isFallbackData: true } as Agency;
    }
    
    // Generate a generic agency if CCN not in demo data
    return {
      ccn,
      name: `Healthcare Agency ${ccn}`,
      state: 'TX',
      type: 'HHA',
      isFallbackData: true
    } as Agency;
  }
}

// Export a singleton instance
export const agencyService = new AgencyService(); 