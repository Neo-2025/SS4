---
status: Candidate
classification: data
---

# CSV-FALLBACK-MECHANISM

## Status

**Current Status**: Candidate
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 1
- Projects: 1
- Related Patterns: 2

## Classification

Data Pattern

## Problem

Applications that rely on external APIs or services need to maintain functionality even when those services are unavailable. Especially during development, testing, and network outages, having a reliable offline data source is critical. Traditional caching solutions often don't provide consistent data structures across the entire domain model.

## Solution

The CSV Fallback Mechanism pattern provides a structured approach to offline data handling using CSV files as a reliable, human-readable data source. When external services are unavailable (detected via Circuit Breaker pattern), the system seamlessly transitions to using pre-populated CSV files that match the structure of the API responses.

### Core Components

1. **CSV Data Source**: Parses and provides data from CSV files
2. **Data Mapping**: Maps CSV rows to domain model objects
3. **Fallback Integration**: Connects with resilience patterns (Circuit Breaker)
4. **Configuration**: Allows flexible CSV file paths

### Key Features

1. **Transparent Fallback**: Application code remains unchanged, with fallback happening behind the scenes
2. **Structured Data**: CSV format ensures consistent data structure
3. **Human-Readable/Editable**: Easy to inspect and modify for testing scenarios
4. **Offline Development**: Enables development without API access
5. **Graceful Degradation**: Maintains core functionality during outages

## Implementation Example

```typescript
import fs from 'fs';
import path from 'path';
import { AgencyData, QualityMeasures, Benchmarks } from '../../models';

interface CSVDataSourceConfig {
  agencyDataPath: string;
  qualityMeasuresPath: string;
  benchmarksPath: string;
}

/**
 * CSV Data Source - Provides fallback data for the Circuit Breaker Fallback (CBF) mode
 */
export class CSVDataSource {
  private agencyData: Map<string, AgencyData> = new Map();
  private qualityMeasures: Map<string, QualityMeasures> = new Map();
  private benchmarks: Map<string, Benchmarks> = new Map();
  private loaded: boolean = false;

  constructor(private config: CSVDataSourceConfig) {
    this.loadCSVData();
  }

  /**
   * Load data from CSV files
   */
  private async loadCSVData(): Promise<void> {
    try {
      // Load agency data
      const agencyRows = await this.parseCSV(this.config.agencyDataPath);
      agencyRows.forEach(row => {
        this.agencyData.set(row.ccn, this.mapRowToAgencyData(row));
      });

      // Load quality measures
      const measureRows = await this.parseCSV(this.config.qualityMeasuresPath);
      
      // Group measures by CCN
      const measuresByCCN = this.groupBy(measureRows, 'ccn');
      Object.entries(measuresByCCN).forEach(([ccn, measures]) => {
        this.qualityMeasures.set(ccn, this.mapRowsToQualityMeasures(measures));
      });

      // Load benchmarks
      const benchmarkRows = await this.parseCSV(this.config.benchmarksPath);
      
      // Group benchmarks by state
      const benchmarksByState = this.groupBy(benchmarkRows, 'state');
      Object.entries(benchmarksByState).forEach(([state, benchmarks]) => {
        this.benchmarks.set(state, this.mapRowsToBenchmarks(benchmarks));
      });

      this.loaded = true;
      console.log('CSV data loaded successfully for Circuit Breaker Fallback mode');
    } catch (error) {
      console.error('Failed to load CSV data:', error);
    }
  }

  /**
   * Get agency data by CCN
   */
  async getAgencyData(ccn: string): Promise<AgencyData> {
    await this.ensureDataLoaded();
    
    const data = this.agencyData.get(ccn);
    if (!data) {
      throw new Error(`Agency with CCN ${ccn} not found in CSV data`);
    }
    return data;
  }

  /**
   * Get quality measures for an agency by CCN
   */
  async getQualityMeasures(ccn: string): Promise<QualityMeasures> {
    await this.ensureDataLoaded();
    
    const data = this.qualityMeasures.get(ccn);
    if (!data) {
      throw new Error(`Quality measures for CCN ${ccn} not found in CSV data`);
    }
    return data;
  }

  /**
   * Get benchmarks for a state
   */
  async getBenchmarks(state: string): Promise<Benchmarks> {
    await this.ensureDataLoaded();
    
    const data = this.benchmarks.get(state);
    if (!data) {
      throw new Error(`Benchmarks for state ${state} not found in CSV data`);
    }
    return data;
  }

  /**
   * Parse CSV file to array of objects
   */
  private async parseCSV(filePath: string): Promise<any[]> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      const headers = lines[0].split(',').map(header => header.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as any);
      });
      
      return rows;
    } catch (error) {
      console.error(`Error parsing CSV ${filePath}:`, error);
      return [];
    }
  }
}
```

### Configuration Example

```typescript
// Default CSV file paths
const defaultPaths = {
  agencyDataPath: path.join(process.cwd(), 'src/data/csv/agencies.csv'),
  qualityMeasuresPath: path.join(process.cwd(), 'src/data/csv/quality_measures.csv'),
  benchmarksPath: path.join(process.cwd(), 'src/data/csv/benchmarks.csv')
};

// Create and export a configured CSV data source instance
export const csvDataSource = new CSVDataSource({
  agencyDataPath: process.env.CSV_AGENCY_DATA_PATH || defaultPaths.agencyDataPath,
  qualityMeasuresPath: process.env.CSV_QUALITY_MEASURES_PATH || defaultPaths.qualityMeasuresPath,
  benchmarksPath: process.env.CSV_BENCHMARKS_PATH || defaultPaths.benchmarksPath
});
```

## Benefits

1. **Offline Development**: Enables development without requiring API connectivity
2. **Resilient Operations**: Provides graceful degradation during service outages
3. **Test Scenario Creation**: Easy to create test data in CSV format
4. **Human Readability**: CSV files are easy to inspect and modify
5. **Performance**: Fast local access without network overhead
6. **Data Consistency**: Consistent structure across different data sets
7. **Simplified Mocking**: No need for complex API mocking during development

## Limitations

1. **Data Freshness**: CSV data can become stale and diverge from actual API data
2. **Schema Changes**: Requires manual updates when API schemas change
3. **Scale Limitations**: Not suitable for very large datasets
4. **Complex Relationships**: Harder to represent complex nested data structures
5. **Maintenance Overhead**: Requires maintaining CSV files alongside code

## Related Patterns

- **CIRCUIT-BREAKER-PATTERN**: Detects API failures and triggers fallback to CSV data
- **RESILIENT-API-GATEWAY**: Combines multiple resilience patterns including CSV fallback
- **TEST-DATA-GENERATOR**: Can be used to create CSV test data from API responses

## Usage Examples

### Integration with Circuit Breaker

```typescript
export class ResilientApiGateway {
  private circuitBreaker: CircuitBreaker;
  
  // Agency-specific methods with CSV fallback
  async getAgencyData(apiCall: (ccn: string) => Promise<any>, ccn: string): Promise<any> {
    return this.circuitBreaker.execute(
      () => apiCall(ccn),
      () => csvDataSource.getAgencyData(ccn)
    );
  }
  
  async getQualityMeasures(apiCall: (ccn: string) => Promise<any>, ccn: string): Promise<any> {
    return this.circuitBreaker.execute(
      () => apiCall(ccn),
      () => csvDataSource.getQualityMeasures(ccn)
    );
  }
  
  async getBenchmarks(apiCall: (state: string) => Promise<any>, state: string): Promise<any> {
    return this.circuitBreaker.execute(
      () => apiCall(state),
      () => csvDataSource.getBenchmarks(state)
    );
  }
}
```

## Evolution History

- **v1.0** (Current): Initial implementation with CSV parsing and integration with Circuit Breaker 