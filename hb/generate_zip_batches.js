const fs = require('fs');
const path = require('path');

function generateZipBatches() {
  console.log('🚀 Generating ZIP Centroid Batches for Browser Execution...');
  
  // Read the CSV file
  const csvPath = path.join('..', 'temp', 'zip_lat_lon.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('❌ CSV file not found at:', csvPath);
    return;
  }
  
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  console.log(`📊 Total CSV Records: ${(lines.length - 1).toLocaleString()}`);
  console.log(`📋 Headers: ${headers.join(', ')}`);
  
  const batchSize = 5000;
  const totalRecords = lines.length - 1; // Exclude header
  const totalBatches = Math.ceil(totalRecords / batchSize);
  
  console.log(`📦 Creating ${totalBatches} batches of ${batchSize.toLocaleString()} records each\n`);
  
  for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
    const startIdx = 1 + (batchNum - 1) * batchSize; // Skip header, start from record 1
    const endIdx = Math.min(startIdx + batchSize - 1, lines.length - 1);
    const actualRecords = endIdx - startIdx + 1;
    
    console.log(`📝 Generating Batch ${batchNum.toString().padStart(3, '0')}: Records ${startIdx}-${endIdx} (${actualRecords} records)`);
    
    let sql = `-- ZIP Centroid Batch ${batchNum.toString().padStart(3, '0')} (Records ${startIdx}-${endIdx})
-- Hospital Coordinate Coverage Enhancement via ZIP Centroids
-- Execute this in Supabase SQL Editor

-- Create table if not exists (only in first batch)
${batchNum === 1 ? `CREATE TABLE IF NOT EXISTS zip_centroids (
  id SERIAL PRIMARY KEY,
  zip_code VARCHAR(5) UNIQUE NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(11,7) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

` : ''}-- Insert batch ${batchNum.toString().padStart(3, '0')} data (${actualRecords} records)
INSERT INTO zip_centroids (zip_code, latitude, longitude) VALUES\n`;
    
    const values = [];
    let validRecords = 0;
    
    for (let i = startIdx; i <= endIdx; i++) {
      const line = lines[i];
      const [id, zip, misc, lat, lng] = line.split(',');
      
      // Validate data
      if (!zip || !lat || !lng || zip.length !== 5) {
        continue;
      }
      
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        continue;
      }
      
      values.push(`('${zip.trim()}', ${latitude}, ${longitude})`);
      validRecords++;
    }
    
    sql += values.join(',\n');
    sql += `\nON CONFLICT (zip_code) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- Verification query
SELECT 
  COUNT(*) as total_records,
  MIN(zip_code) as first_zip,
  MAX(zip_code) as last_zip
FROM zip_centroids;

-- Status message
SELECT 'Batch ${batchNum.toString().padStart(3, '0')} Complete: ${validRecords} ZIP centroids loaded' as status;`;
    
    // Write batch file
    const filename = `zip_batch_${batchNum.toString().padStart(3, '0')}.sql`;
    fs.writeFileSync(filename, sql);
    
    console.log(`   ✅ ${filename} created (${validRecords} valid records)`);
  }
  
  // Create verification script
  const verificationSQL = `-- ZIP Centroid Loading Verification
-- Execute after all batches are loaded

-- Final count and coverage analysis
SELECT 
  COUNT(*) as total_zip_centroids,
  MIN(zip_code) as first_zip,
  MAX(zip_code) as last_zip,
  MIN(latitude) as min_lat,
  MAX(latitude) as max_lat,
  MIN(longitude) as min_lng,
  MAX(longitude) as max_lng
FROM zip_centroids;

-- Check for potential hospital coordinate updates
-- (Assumes hospital table exists - adjust table name as needed)
SELECT 
  'Hospital Coverage Analysis' as analysis_type,
  COUNT(*) as total_hospitals,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as hospitals_with_coords,
  COUNT(CASE WHEN (latitude IS NULL OR longitude IS NULL) AND zip IS NOT NULL THEN 1 END) as missing_coords_with_zip,
  ROUND(
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    1
  ) as current_coverage_pct
FROM hospital_reference
WHERE 1=1; -- Adjust table name if different

-- Check potential ZIP matches for missing coordinates
SELECT 
  'ZIP Match Potential' as analysis_type,
  COUNT(*) as hospitals_missing_coords,
  COUNT(z.zip_code) as zip_matches_available,
  ROUND(COUNT(z.zip_code) * 100.0 / COUNT(*), 1) as match_percentage
FROM hospital_reference h
LEFT JOIN zip_centroids z ON h.zip = z.zip_code
WHERE (h.latitude IS NULL OR h.longitude IS NULL)
  AND h.zip IS NOT NULL;

SELECT '🎯 ZIP Centroid Loading Complete! Ready for Hospital Coordinate Enhancement.' as final_status;`;
  
  fs.writeFileSync('zip_verify_all.sql', verificationSQL);
  
  console.log(`\n✅ All batches generated successfully!`);
  console.log(`📊 Total Batches: ${totalBatches}`);
  console.log(`📄 Files created: zip_batch_001.sql through zip_batch_${totalBatches.toString().padStart(3, '0')}.sql`);
  console.log(`🔍 Verification script: zip_verify_all.sql`);
  console.log(`\n🚀 Ready for sequential browser execution!`);
}

// Execute if run directly
if (require.main === module) {
  generateZipBatches();
}

module.exports = { generateZipBatches }; 