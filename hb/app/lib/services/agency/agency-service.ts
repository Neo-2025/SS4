/**
 * Agency Service
 * Provides agency management capabilities
 * Implements Circuit Breaker pattern for API resilience
 */

import { Agency, AgencyGroup, AgencyGroupType } from '../../models/agency';

// In-memory storage for agencies and groups
const agencies: Map<string, Agency> = new Map();
const groups: Map<string, AgencyGroup[]> = new Map();

// Demo agency data for testing
const demoAgencies: Record<string, Agency> = {
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
 * Add an agency
 * In Branch 3, we simulate API response with demo data
 */
export function addAgency(ccn: string): Agency {
  // Check if we have a demo agency with this CCN
  const demoAgency = demoAgencies[ccn];
  
  if (demoAgency) {
    agencies.set(ccn, demoAgency);
    return demoAgency;
  } else {
    // Generate a generic agency if CCN not in demo data
    const genericAgency: Agency = {
      ccn,
      name: `Healthcare Agency ${ccn}`,
      state: 'TX',
      type: 'HHA'
    };
    
    agencies.set(ccn, genericAgency);
    return genericAgency;
  }
}

/**
 * Group an agency as Org, Comp, or Target
 */
export function groupAgency(ccn: string, type: AgencyGroupType): boolean {
  const agency = agencies.get(ccn);
  
  if (!agency) {
    return false;
  }
  
  // Get existing groups for this type or create empty array
  const existingGroups = groups.get(type) || [];
  
  // Check if agency is already in this group
  const alreadyInGroup = existingGroups.some(group => group.ccn === ccn);
  
  if (!alreadyInGroup) {
    // Add to group
    existingGroups.push({
      ccn,
      type,
      name: agency.name
    });
    
    groups.set(type, existingGroups);
  }
  
  return true;
}

/**
 * Get a single agency by CCN
 */
export function getAgency(ccn: string): Agency | undefined {
  return agencies.get(ccn);
}

/**
 * List all agencies
 */
export function listAgencies(): Agency[] {
  return Array.from(agencies.values());
}

/**
 * Get agencies by group type
 */
export function getAgenciesByType(type: AgencyGroupType): AgencyGroup[] {
  return groups.get(type) || [];
}

/**
 * Get all agency groups
 */
export function getAllGroups(): Record<AgencyGroupType, AgencyGroup[]> {
  return {
    'Org': groups.get('Org') || [],
    'Comp': groups.get('Comp') || [],
    'Target': groups.get('Target') || []
  };
}

/**
 * Clear all data (for testing)
 */
export function clearAgencyData(): void {
  agencies.clear();
  groups.clear();
}

// Circuit Breaker implementation
let isFallbackMode = false;

/**
 * Check if system is operating in Circuit Breaker Fallback mode
 */
export function isCircuitBreakerFallbackMode(): boolean {
  // Check if fallback mode is forced by environment variable
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.USE_CBF_MODE === 'true') {
      return true;
    }
  }
  
  return isFallbackMode;
}

/**
 * Set Circuit Breaker Fallback mode
 */
export function setCircuitBreakerFallbackMode(mode: boolean): void {
  isFallbackMode = mode;
}

/**
 * Execute a function with Circuit Breaker pattern
 * If the function fails and a fallback is provided, the fallback will be used
 */
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>, 
  fallback?: () => Promise<T>
): Promise<T> {
  // If already in fallback mode, use fallback immediately
  if (isCircuitBreakerFallbackMode() && fallback) {
    return fallback();
  }
  
  try {
    return await operation();
  } catch (error) {
    // If operation fails and fallback is available, use it
    if (fallback) {
      // Set fallback mode
      setCircuitBreakerFallbackMode(true);
      return fallback();
    }
    // Otherwise, re-throw the error
    throw error;
  }
} 