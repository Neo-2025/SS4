/**
 * Agency Service
 * Provides agency management capabilities with real API integration and persistence
 * Implements Circuit Breaker pattern for API resilience
 */

import { Agency, AgencyGroup, AgencyGroupType } from '../models/agency';
import { CMSProviderDataApi } from '../api/cms/providerDataApi';
import { SupabaseService } from '../api/db/supabaseService';
import { ResilienceFactory } from '../api/resilience/resilienceFactory';
import { ResilienceService, ResilienceStatus } from '../api/resilience/resilienceService';
import { CircuitState } from '../api/resilience/circuitBreaker';
import { supabase } from '../utils/supabase';

// Define the CircuitBreaker interface
interface CircuitBreaker {
  isOpen: boolean;
  failureCount: number;
  lastFailure: string | null;
  getState(): CircuitState;
}

// Fallback agency data for testing and circuit breaker mode
const fallbackAgencies: Record<string, Agency> = {
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
   * @param ccn Agency CCN
   * @returns Promise<Agency> Agency details
   */
  async addAgency(ccn: string): Promise<Agency> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('User must be logged in to add agencies');
      }
      
      // First, check if the agency exists in in-memory cache
      const cachedAgency = this.agencies.get(ccn);
      if (cachedAgency) {
        return cachedAgency;
      }
      
      // Next, check if the agency exists in the DB
      let existingAgency = null;
      try {
        existingAgency = await this.dbService.getAgencyByCCN(ccn, userId);
      } catch (dbError: any) {
        console.warn(`Error checking for agency in database: ${dbError.message}`);
      }
      
      if (existingAgency) {
        // If it exists in DB, add to in-memory cache and return
        this.agencies.set(ccn, existingAgency);
        return existingAgency;
      }
      
      // If not in DB, fetch from CMS API
      const agency = await this.cmsApi.getAgencyByProviderNumber(ccn);
      
      // Add to in-memory cache FIRST (to ensure it's there even if DB fails)
      this.agencies.set(ccn, agency);
      
      // Try to save to database
      try {
        const agencyId = await this.dbService.saveAgency(agency, userId);
        console.log(`Saved agency ${agency.name} with ID ${agencyId}`);
      } catch (saveError: any) {
        console.warn(`Error saving agency to database: ${saveError.message}`);
        console.log(`Using in-memory storage for agency ${agency.name}`);
      }
      
      return agency;
    } catch (apiError: any) {
      // Fallback - if everything fails, return a minimal agency
      console.error(`Error in addAgency: ${apiError.message}`);
      
      // Create a fallback agency with just the CCN
      const fallbackAgency: Agency = {
        ccn,
        name: `Agency ${ccn}`,
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        type: 'HHA',
        ownership: '',
        certificationDate: '',
        isFallbackData: true
      };
      
      // Add to in-memory cache
      this.agencies.set(ccn, fallbackAgency);
      
      return fallbackAgency;
    }
  }
  
  /**
   * Get agency by CCN
   * @param ccn Agency CCN
   * @returns Promise<Agency | undefined> Agency or undefined if not found
   */
  async getAgency(ccn: string): Promise<Agency | undefined> {
    // First check in-memory cache
    if (this.agencies.has(ccn)) {
      return this.agencies.get(ccn);
    }
    
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return fallbackAgencies[ccn];
      }
      
      // Check database
      const agency = await this.dbService.getAgencyByCCN(ccn, userId);
      if (agency) {
        // Store in memory for next time
        this.agencies.set(ccn, agency);
        return agency;
      }
    } catch (fetchError: any) {
      console.warn(`Error fetching agency from database: ${fetchError.message}`);
    }
    
    // If we get here, check fallback
    if (fallbackAgencies[ccn]) {
      this.agencies.set(ccn, fallbackAgencies[ccn]);
      return fallbackAgencies[ccn];
    }
    
    return undefined;
  }
  
  /**
   * List all agencies
   * @returns Promise<Agency[]> List of all agencies
   */
  async listAgencies(): Promise<Agency[]> {
    try {
      const userId = await this.getUserId();
      
      // Get from database if possible
      if (userId) {
        try {
          const agencies = await this.dbService.getAllAgencies(userId);
          
          // Update in-memory cache with DB results
          agencies.forEach(agency => {
            this.agencies.set(agency.ccn, agency);
          });
          
          // If we have results, return them
          if (agencies.length > 0) {
            return agencies;
          }
        } catch (dbError: any) {
          console.warn(`Error fetching agencies from database: ${dbError.message}`);
        }
      }
      
      // If no DB results or DB error, use in-memory cache
      const cachedAgencies = Array.from(this.agencies.values());
      if (cachedAgencies.length > 0) {
        console.log(`Using ${cachedAgencies.length} agencies from in-memory cache`);
        return cachedAgencies;
      }
      
      // Lastly, fall back to hardcoded agencies
      return Object.values(fallbackAgencies);
    } catch (listError: any) {
      console.error(`Error in listAgencies: ${listError.message}`);
      
      // Ultimate fallback - return in-memory cache or empty array
      return Array.from(this.agencies.values());
    }
  }
  
  /**
   * Group an agency as Org, Comp, or Target
   * @param ccn Agency CCN
   * @param type Group type
   * @returns Promise<boolean> Success
   */
  async groupAgency(ccn: string, type: AgencyGroupType): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      
      // Ensure agency exists
      const agency = await this.getAgency(ccn);
      if (!agency) {
        return false;
      }
      
      // Get existing groups for this type or create empty array
      const existingGroups = this.groups.get(type) || [];
      
      // Check if agency is already in this group
      const alreadyInGroup = existingGroups.some(group => group.ccn === ccn);
      
      if (!alreadyInGroup) {
        // Add to in-memory group
        existingGroups.push({
          ccn,
          type,
          name: agency.name
        });
        
        this.groups.set(type, existingGroups);
        
        // Try to update database if user is logged in
        if (userId) {
          try {
            await this.dbService.addAgencyToGroup(ccn, type, userId);
          } catch (groupError: any) {
            console.warn(`Error adding agency to group in database: ${groupError.message}`);
            console.log(`Using in-memory storage for group ${type}`);
          }
        }
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error in groupAgency: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get agencies by group type
   * @param type Group type
   * @returns Promise<AgencyGroup[]> Agency groups
   */
  async getAgenciesByType(type: AgencyGroupType): Promise<AgencyGroup[]> {
    try {
      const userId = await this.getUserId();
      
      // Try to get from database first
      if (userId) {
        try {
          const dbGroups = await this.dbService.getAgenciesByGroup(type, userId);
          
          // If we have DB results, update memory and return
          if (dbGroups && dbGroups.length > 0) {
            // Convert to agency groups
            const agencyGroups = dbGroups.map(agency => ({
              ccn: agency.ccn,
              type,
              name: agency.name
            }));
            
            // Update in-memory cache
            this.groups.set(type, agencyGroups);
            
            return agencyGroups;
          }
        } catch (dbError: any) {
          console.warn(`Error fetching agency groups from database: ${dbError.message}`);
        }
      }
      
      // Fall back to in-memory groups
      return this.groups.get(type) || [];
    } catch (error: any) {
      console.error(`Error in getAgenciesByType: ${error.message}`);
      return this.groups.get(type) || [];
    }
  }
  
  /**
   * Get all agency groups
   * @returns Promise<Record<AgencyGroupType, Agency[]>> Groups by type
   */
  async getAllGroups(): Promise<Record<AgencyGroupType, AgencyGroup[]>> {
    return {
      'Org': await this.getAgenciesByType('Org'),
      'Comp': await this.getAgenciesByType('Comp'),
      'Target': await this.getAgenciesByType('Target')
    };
  }
  
  /**
   * Get resilience status
   * @returns Resilience status
   */
  getResilienceStatus(): ResilienceStatus {
    const circuitBreaker = this.getCircuitBreaker();
    if (!circuitBreaker) {
      return {
        circuitState: CircuitState.CLOSED,
        isFallbackMode: false,
        statusMessage: 'System operating normally'
      };
    }
    
    const circuitState = circuitBreaker.getState();
    const isFallbackMode = circuitState === CircuitState.OPEN;
    
    let statusMessage = 'System operating normally';
    
    if (circuitState === CircuitState.OPEN) {
      statusMessage = 'Circuit OPEN: Using fallback data, API calls blocked';
    } else if (circuitState === CircuitState.HALF_OPEN) {
      statusMessage = 'Circuit HALF-OPEN: Testing API recovery';
    }
    
    return {
      circuitState,
      isFallbackMode,
      statusMessage
    };
  }
  
  /**
   * Get circuit breaker (if available)
   * @returns CircuitBreaker or null if not available
   */
  private getCircuitBreaker(): CircuitBreaker | null {
    // @ts-ignore - Access the wrapped instance internal property
    if (this.__resilience && this.__resilience.circuitBreaker) {
      // @ts-ignore
      return this.__resilience.circuitBreaker;
    }
    return null;
  }
  
  /**
   * Get the current user ID
   * @returns Promise<string | null> User ID or null if not logged in
   */
  private async getUserId(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || null;
    } catch (authError: any) {
      console.error('Error getting user ID:', authError.message);
      return null;
    }
  }
}

// Export singleton instance
export const agencyService = new AgencyService(); 