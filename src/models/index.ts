/**
 * Agency Management Models Index
 * 
 * This file exports all data models for agency management functionality.
 * Implements DATA-MODEL-SCHEMAS pattern for consistent data modeling.
 */

// Agency Models
export * from './agency/types';

// Quality Measures Models
export * from './quality-measures/types';

// Relationship Models
export * from './relationship/types';

// Helper function to transform Agency API data to internal model
export const transformAgencyData = (apiData: import('./agency/types').AgencyData): import('./agency/types').Agency => {
  return {
    id: apiData.provider.ccn, // Using CCN as ID for simplicity
    ccn: apiData.provider.ccn,
    name: apiData.provider.name,
    address: apiData.provider.location.address,
    city: apiData.provider.location.city,
    state: apiData.provider.location.state,
    zip: apiData.provider.location.zip,
    phone: apiData.provider.contact.phone,
    ownershipType: apiData.provider.details.ownershipType,
    certificationDate: new Date(apiData.provider.details.certificationDate),
    lastUpdated: new Date(apiData.metadata.lastUpdated),
    active: apiData.provider.details.active
  };
};

// Helper function to transform Quality Measures API data to internal model
export const transformQualityMeasuresData = (apiData: import('./quality-measures/types').QualityMeasuresData): import('./quality-measures/types').QualityMeasures => {
  return {
    agencyCCN: apiData.provider_ccn,
    reportingPeriod: apiData.reporting_period,
    measures: apiData.measures.map(m => ({
      id: m.measure_id,
      name: m.measure_name,
      description: m.measure_description,
      domain: m.domain,
      score: m.score,
      nationalAverage: m.national_average,
      stateAverage: m.state_average,
      previousScore: m.previous_score,
      change: m.previous_score ? m.score - m.previous_score : undefined,
      reportingPeriod: apiData.reporting_period,
      impactOnStarRating: m.star_rating_impact
    })),
    lastUpdated: new Date(apiData.metadata.last_updated)
  };
}; 