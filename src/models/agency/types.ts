/**
 * Agency Data Models
 * 
 * Implements DATA-MODEL-SCHEMAS pattern for consistent data modeling.
 * These models conform to the CMS Provider Data Catalog API structure.
 */

/**
 * Base Agency information
 */
export interface Agency {
  id: string;
  ccn: string;            // CMS Certification Number (unique identifier)
  name: string;           // Agency name
  address: string;        // Street address
  city: string;           // City
  state: string;          // State code (2-letter)
  zip: string;            // ZIP code
  phone: string;          // Contact phone
  ownershipType: string;  // Ownership category (For-profit, Non-profit, Government)
  certificationDate: Date; // Initial certification date
  lastUpdated: Date;      // Last data update timestamp
  active: boolean;        // Whether agency is active
}

/**
 * Agency data as returned by the CMS API
 */
export interface AgencyData {
  provider: {
    ccn: string;
    name: string;
    location: {
      address: string;
      city: string;
      state: string;
      zip: string;
    },
    contact: {
      phone: string;
    },
    details: {
      ownershipType: string;
      certificationDate: string;
      active: boolean;
    }
  },
  metadata: {
    lastUpdated: string;
  }
}

/**
 * Agency data transformation function type
 */
export type AgencyTransformer = (apiData: AgencyData) => Agency;

/**
 * Agency Group Types
 */
export type AgencyGroupType = 'Org' | 'Comp' | 'Target';

/**
 * Agency Group relationship
 */
export interface AgencyGroup {
  id: string;
  clientId: string;
  agencyId: string;
  type: AgencyGroupType;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client Group for organizing multiple agencies
 */
export interface ClientGroup {
  id: string;
  clientId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  agencies: AgencyGroup[];
}

/**
 * Agency import status for terminal display
 */
export interface AgencyImportStatus {
  ccn: string;
  name: string;
  status: 'pending' | 'importing' | 'complete' | 'error';
  message?: string;
  progress: number; // 0-100
}

/**
 * Agency with extended relationships
 */
export interface AgencyWithRelationships extends Agency {
  groups: AgencyGroup[];
}

/**
 * Agency search criteria
 */
export interface AgencySearchCriteria {
  ccn?: string;
  name?: string;
  state?: string;
  ownershipType?: string;
  groupType?: AgencyGroupType;
} 