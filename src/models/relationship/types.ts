/**
 * Agency Relationship Models
 * 
 * Implements MULTI-ENTITY-GROUPING pattern for relationship modeling.
 * These models support the multi-agency management system.
 */

import { Agency, AgencyGroupType } from '../agency/types';

/**
 * Agency relationship within a group
 */
export interface AgencyRelationship {
  id: string;
  sourceAgencyId: string;  // The primary agency
  targetAgencyId: string;  // The related agency
  relationshipType: AgencyGroupType; // Org, Comp, or Target
  metadata?: Record<string, any>; // Additional relationship metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agency comparison group
 */
export interface ComparisonGroup {
  id: string;
  name: string;
  clientId: string;
  agencies: Array<{
    agencyId: string;
    type: AgencyGroupType;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agency with comparison data
 */
export interface AgencyWithComparisons {
  agency: Agency;
  comparisons: {
    org?: Agency[];
    comp?: Agency[];
    target?: Agency[];
  };
}

/**
 * Client with their agency groups
 */
export interface ClientWithAgencyGroups {
  clientId: string;
  clientName: string;
  groups: {
    org: Agency[];
    comp: Agency[];
    target: Agency[];
  };
}

/**
 * Agency group operation result
 */
export interface AgencyGroupOperationResult {
  success: boolean;
  operation: 'add' | 'remove' | 'change-type';
  agencyCCN: string;
  groupType?: AgencyGroupType;
  message?: string;
}

/**
 * Agency group filter options
 */
export interface AgencyGroupFilter {
  includeTypes?: AgencyGroupType[];
  excludeTypes?: AgencyGroupType[];
  clientId?: string;
  state?: string;
}

/**
 * Report context with agency grouping
 */
export interface ReportContext {
  clientId: string;
  clientName: string;
  agencies: {
    ccn: string;
    name: string;
    type: AgencyGroupType;
  }[];
  reportType: string;
  reportTitle: string;
  reportDate: string;
  metrics: string[];
}

/**
 * Agency group types
 */
export type AgencyGroupType = 'Org' | 'Comp' | 'Target';

/**
 * Agency group relationship model
 */
export interface AgencyGroup {
  id: string;
  agencyId: string;
  type: AgencyGroupType;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client group model
 */
export interface ClientGroup {
  id: string;
  clientId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  agencies: AgencyGroup[];
}

/**
 * Agency with group information
 */
export interface GroupedAgency {
  ccn: string;
  name: string;
  groupType: AgencyGroupType;
  state: string;
  groupId: string;
} 