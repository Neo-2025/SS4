/**
 * CMS Agency Service
 * 
 * Implements SERVICE-LAYER-ARCHITECTURE pattern for agency data access.
 * This service provides methods to fetch agency data from the CMS Provider Data Catalog API.
 */

import { CMSApiClient } from './client';
import { Agency, AgencyData, transformAgencyData } from '../../models';

/**
 * Service for accessing agency data from CMS API
 */
export class CMSAgencyService {
  private apiClient: CMSApiClient;
  
  /**
   * Constructor
   * @param apiClient - CMS API client
   */
  constructor(apiClient: CMSApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Fetch agency by CCN
   * @param ccn - CMS Certification Number
   * @returns Agency information
   */
  async fetchAgencyByCCN(ccn: string): Promise<Agency> {
    try {
      // Create query payload for agency lookup
      const queryPayload = {
        conditions: [
          {
            property: "ccn",
            value: ccn,
            operator: "="
          }
        ],
        resources: [
          {
            id: "provider-agency-info", // This would be the actual dataset ID from schema discovery
            alias: "agency"
          }
        ],
        limit: 1
      };
      
      // Execute query
      const response = await this.apiClient.query(queryPayload);
      
      // Handle empty results
      if (!response.results || response.results.length === 0) {
        throw new Error(`Agency with CCN ${ccn} not found`);
      }
      
      // Transform API response to agency model
      return transformAgencyData(response.results[0] as AgencyData);
    } catch (error) {
      console.error(`Error fetching agency with CCN ${ccn}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for agencies by criteria
   * @param searchText - Text to search for in agency name
   * @param state - Optional state filter
   * @param limit - Maximum number of results
   * @returns List of matching agencies
   */
  async searchAgencies(searchText: string, state?: string, limit: number = 10): Promise<Agency[]> {
    try {
      // Create search parameters
      const searchParams: Record<string, any> = {
        q: searchText,
        limit
      };
      
      // Add state filter if provided
      if (state) {
        searchParams.state = state;
      }
      
      // Execute search
      const response = await this.apiClient.search(searchParams);
      
      // Transform search results to agency models
      return response.results.map((result: AgencyData) => transformAgencyData(result));
    } catch (error) {
      console.error(`Error searching agencies with text "${searchText}":`, error);
      throw error;
    }
  }
  
  /**
   * Fetch multiple agencies by CCNs
   * @param ccns - List of CMS Certification Numbers
   * @returns List of agencies
   */
  async fetchMultipleAgencies(ccns: string[]): Promise<Agency[]> {
    try {
      // Handle batch size limits
      const BATCH_SIZE = 10;
      const batches: string[][] = [];
      
      // Split CCNs into batches
      for (let i = 0; i < ccns.length; i += BATCH_SIZE) {
        batches.push(ccns.slice(i, i + BATCH_SIZE));
      }
      
      // Process each batch
      const results: Agency[] = [];
      for (const batch of batches) {
        // Create batch query payload
        const queryPayload = {
          conditions: [
            {
              property: "ccn",
              value: batch,
              operator: "in"
            }
          ],
          resources: [
            {
              id: "provider-agency-info",
              alias: "agency"
            }
          ]
        };
        
        // Execute batch query
        const response = await this.apiClient.query(queryPayload);
        
        // Transform and add results
        if (response.results && response.results.length > 0) {
          const agencies = response.results.map((result: AgencyData) => transformAgencyData(result));
          results.push(...agencies);
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Error fetching multiple agencies:`, error);
      throw error;
    }
  }
} 