/**
 * CMS Provider Data API Client
 * Handles requests to the CMS Provider Data Catalog API with Edge monitoring
 */

import axios from 'axios';
import { Agency } from '@/app/lib/models/agency';
import { env } from '@/app/lib/env';

// Define API response types
interface QualityMeasuresResponse {
  measures: Array<{
    id: string;
    name: string;
    score: number;
    nationalAverage: number;
    stateAverage: number;
    reportingPeriod: string;
  }>;
}

interface BenchmarkResponse {
  benchmarks: Array<{
    id: string;
    name: string;
    value: number;
    state: string;
    period: string;
  }>;
}

// Custom error class for API errors
export class CMSApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CMSApiError';
  }
}

export class CMSProviderDataApi {
  private client: any; // Using a generic type instead of specific AxiosInstance
  private requestId: string = '';
  
  constructor() {
    this.client = axios.create({
      baseURL: env.CMS_API_BASE_URL,
      timeout: 10000,
      headers: {
        'x-api-key': env.CMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for Edge monitoring
    this.client.interceptors.request.use(
      (config: any) => {
        this.requestId = crypto.randomUUID();
        const startTime = performance.now();
        
        // Add Edge monitoring headers
        config.headers['x-edge-monitor-id'] = this.requestId;
        config.headers['x-edge-monitor-start'] = startTime.toString();
        
        // Log request details
        console.log(`[Edge Monitor] Request ${this.requestId} started:`, {
          url: config.url,
          method: config.method,
          headers: config.headers
        });
        
        return config;
      },
      (error: any) => {
        console.error(`[Edge Monitor] Request ${this.requestId} failed to start:`, error);
        return Promise.reject(new CMSApiError('Failed to start request', undefined, 'REQUEST_START_FAILED', error));
      }
    );

    // Add response interceptor for Edge monitoring
    this.client.interceptors.response.use(
      (response: any) => {
        const endTime = performance.now();
        const duration = endTime - parseInt(response.config.headers['x-edge-monitor-start']);
        
        // Log response details
        console.log(`[Edge Monitor] Request ${this.requestId} completed:`, {
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          dataSize: JSON.stringify(response.data).length
        });
        
        return response;
      },
      (error: any) => {
        const endTime = performance.now();
        const duration = endTime - parseInt(error.config?.headers['x-edge-monitor-start'] || '0');
        
        // Create detailed error
        const apiError = new CMSApiError(
          error.message || 'API request failed',
          error.response?.status,
          error.code,
          {
            duration: `${duration.toFixed(2)}ms`,
            url: error.config?.url,
            method: error.config?.method
          }
        );
        
        // Log error details
        console.error(`[Edge Monitor] Request ${this.requestId} failed:`, {
          status: apiError.status,
          duration: apiError.details?.duration,
          error: apiError.message
        });
        
        return Promise.reject(apiError);
      }
    );
  }
  
  /**
   * Get agency by provider number (CCN)
   * @param ccn The CMS Certification Number
   * @returns Promise<Agency>
   * @throws {CMSApiError} When API request fails
   */
  async getAgencyByProviderNumber(ccn: string): Promise<Agency> {
    try {
      const response = await this.client.get(`/home-health-agencies/${ccn}`);
      return this.mapToAgency(response.data);
    } catch (error) {
      if (error instanceof CMSApiError) {
        throw error;
      }
      throw new CMSApiError(
        `Failed to fetch agency data for CCN ${ccn}`,
        undefined,
        'AGENCY_FETCH_FAILED',
        error
      );
    }
  }
  
  /**
   * Get quality measures for an agency
   * @param ccn The CMS Certification Number
   * @returns Promise<QualityMeasuresResponse>
   * @throws {CMSApiError} When API request fails
   */
  async getQualityMeasures(ccn: string): Promise<QualityMeasuresResponse> {
    try {
      const response = await this.client.get(`/quality-measures/home-health/${ccn}`);
      return response.data;
    } catch (error) {
      if (error instanceof CMSApiError) {
        throw error;
      }
      throw new CMSApiError(
        `Failed to fetch quality measures for CCN ${ccn}`,
        undefined,
        'QUALITY_MEASURES_FETCH_FAILED',
        error
      );
    }
  }
  
  /**
   * Get state benchmark data
   * @param state Two-letter state code
   * @returns Promise<BenchmarkResponse>
   * @throws {CMSApiError} When API request fails
   */
  async getStateBenchmarks(state: string): Promise<BenchmarkResponse> {
    try {
      const response = await this.client.get(`/benchmarks/state/${state}`);
      return response.data;
    } catch (error) {
      if (error instanceof CMSApiError) {
        throw error;
      }
      throw new CMSApiError(
        `Failed to fetch state benchmarks for ${state}`,
        undefined,
        'BENCHMARKS_FETCH_FAILED',
        error
      );
    }
  }
  
  /**
   * Get national benchmark data
   * @returns Promise<BenchmarkResponse>
   * @throws {CMSApiError} When API request fails
   */
  async getNationalBenchmarks(): Promise<BenchmarkResponse> {
    try {
      const response = await this.client.get('/benchmarks/national');
      return response.data;
    } catch (error) {
      if (error instanceof CMSApiError) {
        throw error;
      }
      throw new CMSApiError(
        'Failed to fetch national benchmarks',
        undefined,
        'NATIONAL_BENCHMARKS_FETCH_FAILED',
        error
      );
    }
  }
  
  /**
   * Map API data to Agency model
   * @param data Raw API data
   * @returns Agency Mapped agency object
   */
  private mapToAgency(data: any): Agency {
    return {
      ccn: data.provider_number || data.ccn,
      name: data.provider_name || data.name,
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip_code || data.zip || '',
      phone: data.telephone_number || data.phone || '',
      type: data.provider_type || data.type || 'HHA',
      ownership: data.ownership_type || data.ownership || '',
      certificationDate: data.certification_date || data.certificationDate || ''
    };
  }
} 