/**
 * API Services Index
 * 
 * This file exports all API services and provides a factory function for creating them.
 * Implements SERVICE-LAYER-ARCHITECTURE pattern for API access.
 */

// Export API client
export { CMSApiClient, CMSApiClientConfig } from './cms/client';

// Export services
export { CMSAgencyService } from './cms/agency-service';
export { CMSQualityMeasuresService } from './cms/quality-measures-service';

// Import types
import { CMSApiClient } from './cms/client';
import { CMSAgencyService } from './cms/agency-service';
import { CMSQualityMeasuresService } from './cms/quality-measures-service';

/**
 * API services container
 */
export interface APIServices {
  agencyService: CMSAgencyService;
  qualityMeasuresService: CMSQualityMeasuresService;
}

/**
 * Create API services using a single API client instance
 * @param apiKey - Optional API key for CMS API
 * @returns API services container
 */
export function createAPIServices(apiKey?: string): APIServices {
  // Create API client with provided key
  const apiClient = new CMSApiClient({
    apiKey,
    baseURL: process.env.CMS_API_BASE_URL || 'https://data.cms.gov'
  });
  
  // Create and return services
  return {
    agencyService: new CMSAgencyService(apiClient),
    qualityMeasuresService: new CMSQualityMeasuresService(apiClient)
  };
}

/**
 * Default API services singleton
 */
export const defaultAPIServices = createAPIServices(process.env.CMS_API_KEY); 