/**
 * Agency types for HealthBench
 */

/**
 * Represents a healthcare agency entity
 */
export interface Agency {
  ccn: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  type?: string;
  ownership?: string;
  certificationDate?: string;
}

/**
 * Agency group types (as defined in requirements)
 */
export type AgencyGroupType = 'Org' | 'Comp' | 'Target';

/**
 * Agency group relationship
 */
export interface AgencyGroup {
  ccn: string;
  type: AgencyGroupType;
  name?: string;
}

/**
 * Client group for multi-agency management
 */
export interface ClientGroup {
  id: string;
  name: string;
  agencies: AgencyGroup[];
} 