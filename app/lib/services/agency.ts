/**
 * Agency Service
 * Provides agency management with API integration and persistence
 */

import { Agency, AgencyGroupType } from '../models/agency';
import { CMSProviderDataApi } from '../api/cms/providerDataApi';
import { SupabaseService } from '../api/db/supabaseService';
import { ResilienceFactory } from '../api/resilience/resilienceFactory';
import { ResilienceService, ResilienceStatus } from '../api/resilience/resilienceService';
import { supabase } from '../utils/supabase';

/**
 * Agency Service Implementation
 */
export class AgencyService {
  private cmsApi: CMSProviderDataApi;
  private dbService: SupabaseService;
  
  // In-memory storage for current session
  private agencies: Map<string, Agency> = new Map();
  private groups: Map<string, AgencyGroup[]> = new Map();
  
  constructor() {
    this.cmsApi = new CMSProviderDataApi();
    this.dbService = new SupabaseService();
    
    // Make this service resilient using ResilienceFactory
    return ResilienceFactory.makeResilient(this, [
      'addAgency',
      'getAgency',
      'listAgencies',
      'groupAgency',
      'getAgenciesByType'
    ]) as AgencyService;
  }
  
  /**
   * Add an agency by CCN
   * @param ccn The CMS Certification Number
   * @returns Promise<Agency>
   */
  async addAgency(ccn: string): Promise<Agency> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // First, try to fetch from API
      const agency = await this.cmsApi.getAgencyByProviderNumber(ccn);
      
      // Save to database
      await this.dbService.saveAgency(agency, user.id);
      
      // Add to in-memory cache
      this.agencies.set(ccn, agency);
      
      return agency;
    } catch (error) {
      // If API fails, try to get from database
      const dbAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
      
      if (dbAgency) {
        // Mark as fallback data and update cache
        const fallbackAgency = {
          ...dbAgency,
          isFallbackData: true
        };
        
        this.agencies.set(ccn, fallbackAgency);
        return fallbackAgency;
      }
      
      // No fallback available, rethrow error
      throw error;
    }
  }
  
  /**
   * Fallback implementation for resilience
   * This is called by ResilienceFactory when the circuit is open
   */
  async getFallbackData(methodName: string, ...args: any[]): Promise<any> {
    // Get current user for database operations
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Handle different methods
    switch (methodName) {
      case 'addAgency': {
        const ccn = args[0] as string;
        // Try to get from database
        const dbAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
        
        if (dbAgency) {
          return {
            ...dbAgency,
            isFallbackData: true
          };
        }
        
        // If not in database, create minimal fallback
        return {
          ccn,
          name: `Agency ${ccn}`,
          type: 'HHA',
          isFallbackData: true
        };
      }
      
      case 'getAgency': {
        const ccn = args[0] as string;
        // First check in-memory cache
        if (this.agencies.has(ccn)) {
          const cachedAgency = this.agencies.get(ccn)!;
          return {
            ...cachedAgency,
            isFallbackData: true
          };
        }
        
        // Try to get from database
        const dbAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
        
        if (dbAgency) {
          return {
            ...dbAgency,
            isFallbackData: true
          };
        }
        
        throw new Error(`Agency with CCN ${ccn} not found`);
      }
      
      case 'listAgencies': {
        // Try to get from database
        const dbAgencies = await this.dbService.getAgenciesByUser(user.id);
        
        return dbAgencies.map(agency => ({
          ...agency,
          isFallbackData: true
        }));
      }
      
      default:
        throw new Error(`No fallback available for ${methodName}`);
    }
  }
  
  /**
   * Get an agency by CCN
   * @param ccn The CMS Certification Number
   * @returns Promise<Agency>
   */
  async getAgency(ccn: string): Promise<Agency> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // First check in-memory cache
    if (this.agencies.has(ccn)) {
      return this.agencies.get(ccn)!;
    }
    
    // Then try database
    const dbAgency = await this.dbService.getAgencyByCCN(ccn, user.id);
    if (dbAgency) {
      this.agencies.set(ccn, dbAgency);
      return dbAgency;
    }
    
    // Finally try API
    const agency = await this.cmsApi.getAgencyByProviderNumber(ccn);
    
    // Save to database and cache
    await this.dbService.saveAgency(agency, user.id);
    this.agencies.set(ccn, agency);
    
    return agency;
  }
  
  /**
   * List all agencies for the current user
   * @returns Promise<Agency[]>
   */
  async listAgencies(): Promise<Agency[]> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get all agencies from database
    const agencies = await this.dbService.getAgenciesByUser(user.id);
    
    // Update cache
    agencies.forEach(agency => {
      this.agencies.set(agency.ccn, agency);
    });
    
    return agencies;
  }
  
  /**
   * Group an agency as a specific type
   * @param ccn The CMS Certification Number
   * @param type GroupType (Org, Comp, Target)
   * @returns Promise<boolean> Success
   */
  async groupAgency(ccn: string, type: AgencyGroupType): Promise<boolean> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // First make sure agency exists
    let agency: Agency;
    
    try {
      agency = await this.getAgency(ccn);
    } catch (error) {
      console.error(`Error getting agency ${ccn}:`, error);
      return false;
    }
    
    // Get agency ID
    const agencyId = await this.dbService.getAgencyIdByCCN(ccn, user.id);
    if (!agencyId) {
      return false;
    }
    
    // Add to group
    const success = await this.dbService.addAgencyToGroup(agencyId, type, user.id);
    
    // Update in-memory cache
    if (success) {
      if (!this.groups.has(type)) {
        this.groups.set(type, []);
      }
      
      const group = this.groups.get(type)!;
      if (!group.find(a => a.ccn === ccn)) {
        group.push({
          ccn,
          type,
          name: agency.name
        });
      }
    }
    
    return success;
  }
  
  /**
   * Get agencies by group type
   * @param type GroupType (Org, Comp, Target)
   * @returns Promise<Agency[]>
   */
  async getAgenciesByType(type: AgencyGroupType): Promise<Agency[]> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get grouped agencies from database
    const groupedAgencies = await this.dbService.getAgenciesByGroupType(type, user.id);
    
    // Update cache
    if (!this.groups.has(type)) {
      this.groups.set(type, []);
    }
    
    const agencies: Agency[] = [];
    
    for (const agency of groupedAgencies) {
      if (!this.agencies.has(agency.ccn)) {
        this.agencies.set(agency.ccn, agency);
      }
      agencies.push(agency);
    }
    
    return agencies;
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
   * Get current resilience status
   * @returns ResilienceStatus
   */
  getResilienceStatus(): ResilienceStatus {
    return ResilienceService.getStatus();
  }
  
  /**
   * Reset the circuit breaker (for manual recovery)
   */
  resetCircuitBreaker(): void {
    ResilienceService.resetCircuitBreaker();
  }
}

// Export a singleton instance
export const agencyService = new AgencyService(); 