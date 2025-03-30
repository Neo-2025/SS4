/**
 * CMS Quality Measures Service
 * 
 * Implements SERVICE-LAYER-ARCHITECTURE pattern for quality measures data access.
 * This service provides methods to fetch quality measures from the CMS Provider Data Catalog API.
 */

import { CMSApiClient } from './client';
import { QualityMeasures, QualityMeasuresData, Benchmark, transformQualityMeasuresData } from '../../models';

/**
 * Service for accessing quality measures data from CMS API
 */
export class CMSQualityMeasuresService {
  private apiClient: CMSApiClient;
  
  /**
   * Constructor
   * @param apiClient - CMS API client
   */
  constructor(apiClient: CMSApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Fetch quality measures for an agency
   * @param ccn - CMS Certification Number
   * @returns Quality measures information
   */
  async fetchQualityMeasures(ccn: string): Promise<QualityMeasures> {
    try {
      // Create query payload for quality measures lookup
      const queryPayload = {
        conditions: [
          {
            property: "provider_ccn",
            value: ccn,
            operator: "="
          }
        ],
        resources: [
          {
            id: "provider-quality-measures", // This would be the actual dataset ID from schema discovery
            alias: "measures"
          }
        ]
      };
      
      // Execute query
      const response = await this.apiClient.query(queryPayload);
      
      // Handle empty results
      if (!response.results || response.results.length === 0) {
        throw new Error(`Quality measures for CCN ${ccn} not found`);
      }
      
      // Transform API response to quality measures model
      return transformQualityMeasuresData(response.results[0] as QualityMeasuresData);
    } catch (error) {
      console.error(`Error fetching quality measures for CCN ${ccn}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch benchmarks for a specific state
   * @param state - State code (e.g., "TX" or "FL")
   * @returns Benchmark information
   */
  async fetchBenchmarks(state: string): Promise<Benchmark[]> {
    try {
      // Create query payload for benchmarks lookup
      const queryPayload = {
        conditions: [
          {
            property: "state",
            value: state,
            operator: "="
          }
        ],
        resources: [
          {
            id: "provider-benchmarks", // This would be the actual dataset ID from schema discovery
            alias: "benchmarks"
          }
        ]
      };
      
      // Execute query
      const response = await this.apiClient.query(queryPayload);
      
      // Handle empty results
      if (!response.results || response.results.length === 0) {
        throw new Error(`Benchmarks for state ${state} not found`);
      }
      
      // Transform API response to benchmark models
      return response.results.map((result: any) => ({
        id: `${result.state}-${result.measure_id}`,
        measureId: result.measure_id,
        region: result.state,
        value: result.value,
        period: result.period,
        percentile: result.percentile
      }));
    } catch (error) {
      console.error(`Error fetching benchmarks for state ${state}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch national benchmarks
   * @returns National benchmark information
   */
  async fetchNationalBenchmarks(): Promise<Benchmark[]> {
    try {
      // Create query payload for national benchmarks lookup
      const queryPayload = {
        conditions: [
          {
            property: "region",
            value: "NATIONAL",
            operator: "="
          }
        ],
        resources: [
          {
            id: "provider-benchmarks",
            alias: "benchmarks"
          }
        ]
      };
      
      // Execute query
      const response = await this.apiClient.query(queryPayload);
      
      // Handle empty results
      if (!response.results || response.results.length === 0) {
        throw new Error('National benchmarks not found');
      }
      
      // Transform API response to benchmark models
      return response.results.map((result: any) => ({
        id: `NATIONAL-${result.measure_id}`,
        measureId: result.measure_id,
        region: "NATIONAL",
        value: result.value,
        period: result.period,
        percentile: result.percentile
      }));
    } catch (error) {
      console.error('Error fetching national benchmarks:', error);
      throw error;
    }
  }
  
  /**
   * Fetch quality measure trends for an agency
   * @param ccn - CMS Certification Number
   * @param measureIds - Optional list of specific measure IDs to fetch
   * @param periods - Optional number of periods to include
   * @returns Quality measure trends
   */
  async fetchQualityMeasureTrends(ccn: string, measureIds?: string[], periods: number = 4): Promise<any> {
    try {
      // Create query payload for trends lookup
      const queryPayload: any = {
        conditions: [
          {
            property: "provider_ccn",
            value: ccn,
            operator: "="
          }
        ],
        resources: [
          {
            id: "provider-quality-trends",
            alias: "trends"
          }
        ],
        limit: periods
      };
      
      // Add measure ID filter if provided
      if (measureIds && measureIds.length > 0) {
        queryPayload.conditions.push({
          property: "measure_id",
          value: measureIds,
          operator: "in"
        });
      }
      
      // Execute query
      const response = await this.apiClient.query(queryPayload);
      
      // Handle empty results
      if (!response.results || response.results.length === 0) {
        throw new Error(`Quality measure trends for CCN ${ccn} not found`);
      }
      
      // Transform API response to trend models
      const trendMap = new Map<string, any>();
      
      // Group by measure ID
      response.results.forEach((result: any) => {
        if (!trendMap.has(result.measure_id)) {
          trendMap.set(result.measure_id, {
            measureId: result.measure_id,
            periods: []
          });
        }
        
        trendMap.get(result.measure_id).periods.push({
          period: result.period,
          score: result.score,
          nationalAverage: result.national_average,
          stateAverage: result.state_average
        });
      });
      
      // Sort periods in each trend
      trendMap.forEach(trend => {
        trend.periods.sort((a: any, b: any) => a.period.localeCompare(b.period));
      });
      
      return Array.from(trendMap.values());
    } catch (error) {
      console.error(`Error fetching quality measure trends for CCN ${ccn}:`, error);
      throw error;
    }
  }
} 