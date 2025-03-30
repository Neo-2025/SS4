/**
 * CMS Provider Data Catalog API Client
 * 
 * Implements SERVICE-LAYER-ARCHITECTURE pattern for API communication.
 * This client handles interactions with the CMS Provider Data Catalog API.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API client configuration options
export interface CMSApiClientConfig {
  baseURL?: string;
  timeout?: number;
  apiKey?: string;
  headers?: Record<string, string>;
}

/**
 * CMS Provider Data Catalog API client
 */
export class CMSApiClient {
  private client: AxiosInstance;
  private defaultConfig: CMSApiClientConfig = {
    baseURL: process.env.CMS_API_BASE_URL || 'https://data.cms.gov',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  /**
   * Constructor
   * @param config - API client configuration
   */
  constructor(config: CMSApiClientConfig = {}) {
    const mergedConfig: AxiosRequestConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers,
        ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {})
      }
    };
    
    this.client = axios.create(mergedConfig);
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[CMS API] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[CMS API] Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[CMS API] Response: ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[CMS API] Response Error:', error.response ? `${error.response.status} ${error.response.statusText}` : error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns API response
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`[CMS API] GET Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API response
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`[CMS API] POST Error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Discover available schemas
   * @returns Schema information
   */
  async discoverSchemas(): Promise<any> {
    return this.get('/provider-data/api/1/metastore/schemas');
  }

  /**
   * Get schema details
   * @param schemaId - Schema identifier
   * @returns Schema details
   */
  async getSchema(schemaId: string): Promise<any> {
    return this.get(`/provider-data/api/1/metastore/schemas/${schemaId}`);
  }

  /**
   * Execute a datastore query
   * @param queryPayload - Query payload
   * @returns Query results
   */
  async query(queryPayload: any): Promise<any> {
    return this.post('/provider-data/api/1/datastore/query', queryPayload);
  }

  /**
   * Search for agencies
   * @param params - Search parameters
   * @returns Search results
   */
  async search(params: Record<string, any>): Promise<any> {
    return this.get('/provider-data/api/1/search', params);
  }

  /**
   * Get search facets
   * @returns Facet information
   */
  async searchFacets(): Promise<any> {
    return this.get('/provider-data/api/1/search/facets');
  }
} 