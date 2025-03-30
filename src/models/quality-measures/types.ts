/**
 * Quality Measures Data Models
 * 
 * Implements DATA-MODEL-SCHEMAS pattern for consistent data modeling.
 * These models conform to the CMS Provider Data Catalog API structure.
 */

/**
 * Individual quality measure with score and comparisons
 */
export interface QualityMeasure {
  id: string;              // Measure identifier
  name: string;            // Human-readable measure name
  description: string;     // Detailed description
  domain: string;          // Measure domain/category
  score: number;           // Current agency score (percentage)
  nationalAverage: number; // National average for comparison
  stateAverage: number;    // State average for comparison
  previousScore?: number;  // Previous reporting period score
  change?: number;         // Change from previous period
  reportingPeriod: string; // Period of measurement (e.g., "2023-Q1")
  impactOnStarRating: number; // Impact coefficient on star rating
}

/**
 * Collection of quality measures for an agency
 */
export interface QualityMeasures {
  agencyCCN: string;       // Agency CCN these measures belong to
  reportingPeriod: string; // Overall reporting period
  measures: QualityMeasure[]; // Individual measures
  lastUpdated: Date;       // Last data update timestamp
}

/**
 * Quality measures data as returned by the CMS API
 */
export interface QualityMeasuresData {
  provider_ccn: string;
  reporting_period: string;
  measures: Array<{
    measure_id: string;
    measure_name: string;
    measure_description: string;
    domain: string;
    score: number;
    national_average: number;
    state_average: number;
    previous_score?: number;
    star_rating_impact: number;
  }>,
  metadata: {
    last_updated: string;
  }
}

/**
 * Quality measures transformation function type
 */
export type QualityMeasuresTransformer = (apiData: QualityMeasuresData) => QualityMeasures;

/**
 * Quality measure with trend data
 */
export interface QualityMeasureTrend {
  measureId: string;
  periods: Array<{
    period: string;
    score: number;
    nationalAverage: number;
    stateAverage: number;
  }>;
}

/**
 * Benchmark data for state or national comparisons
 */
export interface Benchmark {
  id: string;
  measureId: string;      // Measure identifier
  region: string;         // State code or "NATIONAL"
  value: number;          // Benchmark value
  period: string;         // Reporting period
  percentile?: {          // Optional percentile data
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

/**
 * Collection of benchmarks
 */
export interface Benchmarks {
  region: string;          // State code or "NATIONAL"
  period: string;          // Reporting period
  benchmarks: Benchmark[]; // Individual benchmarks
  lastUpdated: Date;       // Last data update timestamp
}

/**
 * Star rating components
 */
export interface StarRating {
  agencyCCN: string;       // Agency CCN
  overallRating: number;   // Overall star rating (1-5)
  components: {
    qualityOfPatientCare: number;
    patientExperience: number;
  };
  lastUpdated: Date;       // Last data update timestamp
} 