import path from 'path';
import { CSVDataSource } from './CSVDataSource';

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

// Export the CSV data source class for custom configuration
export { CSVDataSource } from './CSVDataSource'; 