/**
 * CMS Provider Data API Client
 * Handles requests to the CMS Provider Data Catalog API
 */

import axios, { AxiosInstance } from 'axios';
import { Agency } from '@/app/lib/models/agency';
import { env } from '@/app/lib/env';

export class CMSProviderDataApi {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: env.CMS_API_BASE_URL,
      timeout: 10000,
      headers: {
        'x-api-key': env.CMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * Get agency by provider number (CCN)
   * @param ccn The CMS Certification Number
   * @returns Promise<Agency>
   */
  async getAgencyByProviderNumber(ccn: string): Promise<Agency> {
    try {
      const response = await this.client.get(`/home-health-agencies/${ccn}`);
      return this.mapToAgency(response.data);
    } catch (error) {
      console.error(`Error fetching agency data for CCN ${ccn}:`, error);
      throw error;
    }
  }
  
  /**
   * Get quality measures for an agency
   * @param ccn The CMS Certification Number
   * @returns Promise<any> Quality measures data
   */
  async getQualityMeasures(ccn: string): Promise<any> {
    try {
      const response = await this.client.get(`/quality-measures/home-health/${ccn}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quality measures for CCN ${ccn}:`, error);
      throw error;
    }
  }
  
  /**
   * Get state benchmark data
   * @param state Two-letter state code
   * @returns Promise<any> State benchmark data
   */
  async getStateBenchmarks(state: string): Promise<any> {
    try {
      const response = await this.client.get(`/benchmarks/state/${state}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching state benchmarks for ${state}:`, error);
      throw error;
    }
  }
  
  /**
   * Get national benchmark data
   * @returns Promise<any> National benchmark data
   */
  async getNationalBenchmarks(): Promise<any> {
    try {
      const response = await this.client.get('/benchmarks/national');
      return response.data;
    } catch (error) {
      console.error('Error fetching national benchmarks:', error);
      throw error;
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