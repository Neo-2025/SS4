import fs from 'fs';
import path from 'path';
import { AgencyData, QualityMeasure, QualityMeasures, Benchmark, Benchmarks } from '../../models';

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
   * Ensure data is loaded before accessing
   */
  private async ensureDataLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadCSVData();
      
      // If still not loaded, throw error
      if (!this.loaded) {
        throw new Error('Failed to load CSV data');
      }
    }
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

  /**
   * Map CSV row to agency data model
   */
  private mapRowToAgencyData(row: any): AgencyData {
    return {
      ccn: row.ccn,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      type: row.type,
      ownership: row.ownership,
      certificationDate: row.certification_date
    };
  }

  /**
   * Map CSV rows to quality measures model
   */
  private mapRowsToQualityMeasures(rows: any[]): QualityMeasures {
    return {
      ccn: rows[0].ccn,
      measures: rows.map(row => ({
        id: row.measure_id,
        name: row.measure_name,
        score: parseFloat(row.score),
        nationalAverage: parseFloat(row.national_average),
        stateAverage: parseFloat(row.state_average),
        reportingPeriod: row.reporting_period
      }))
    };
  }

  /**
   * Map CSV rows to benchmarks model
   */
  private mapRowsToBenchmarks(rows: any[]): Benchmarks {
    return {
      state: rows[0].state,
      benchmarks: rows.map(row => ({
        measureId: row.measure_id,
        value: parseFloat(row.value),
        period: row.period
      }))
    };
  }

  /**
   * Group array items by a key
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }
} 