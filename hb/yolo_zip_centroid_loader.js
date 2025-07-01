const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// MSSD Connection - Working Pattern
const client = new Client({
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 5432,
  user: 'cursor_ai',
  password: 'CursorAI2025',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function loadZipCentroids() {
  try {
    await client.connect();
    console.log('✅ MSSD Connection: OPERATIONAL');
    console.log('🚀 Starting ZIP Centroid Loading Process...\n');

    // Step 1: Check if zip_centroids table exists
    console.log('📋 Step 1: Checking zip_centroids table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'zip_centroids' 
        AND table_schema = 'public'
      ) as table_exists
    `);

    if (!tableCheck.rows[0].table_exists) {
      console.log('🏗️ Creating zip_centroids table...');
      await client.query(`
        CREATE TABLE zip_centroids (
          id SERIAL PRIMARY KEY,
          zip_code VARCHAR(5) UNIQUE NOT NULL,
          latitude NUMERIC(10,7) NOT NULL,
          longitude NUMERIC(11,7) NOT NULL,
          misc_field VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ zip_centroids table created');
    } else {
      console.log('✅ zip_centroids table already exists');
    }

    // Step 2: Check current record count
    const countResult = await client.query('SELECT COUNT(*) as count FROM zip_centroids');
    const currentCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Current records in zip_centroids: ${currentCount.toLocaleString()}`);

    // Step 3: Load ZIP centroid data from CSV
    const csvPath = path.join('..', 'temp', 'zip_lat_lon.csv');
    console.log(`📂 Looking for CSV at: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      console.log('❌ CSV file not found. Expected location: ../temp/zip_lat_lon.csv');
      return;
    }

    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    console.log(`📋 CSV Headers: ${headers.join(', ')}`);
    console.log(`📊 CSV Records: ${(lines.length - 1).toLocaleString()}`);

    // Step 4: Process and insert data in batches
    const batchSize = 500;
    let totalInserted = 0;
    let totalSkipped = 0;

    console.log('\n🔄 Processing ZIP centroid data...');
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const line of batch) {
        const [id, zip, misc, lat, lng] = line.split(',');
        
        // Validate data
        if (!zip || !lat || !lng || zip.length !== 5) {
          totalSkipped++;
          continue;
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
          totalSkipped++;
          continue;
        }

        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
        params.push(zip.trim(), latitude, longitude, misc ? misc.trim() : null);
        paramIndex += 4;
      }

      if (values.length > 0) {
        try {
          const insertQuery = `
            INSERT INTO zip_centroids (zip_code, latitude, longitude, misc_field)
            VALUES ${values.join(', ')}
            ON CONFLICT (zip_code) DO UPDATE SET
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              misc_field = EXCLUDED.misc_field,
              updated_at = NOW()
          `;

          await client.query(insertQuery, params);
          totalInserted += values.length;
          
          if (totalInserted % 5000 === 0) {
            console.log(`   📈 Processed: ${totalInserted.toLocaleString()} records...`);
          }
        } catch (error) {
          console.log(`❌ Batch insert error: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ ZIP Centroid Loading Complete!`);
    console.log(`   📊 Total Inserted/Updated: ${totalInserted.toLocaleString()}`);
    console.log(`   ⚠️ Total Skipped: ${totalSkipped.toLocaleString()}`);

    // Step 5: Verify final count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM zip_centroids');
    console.log(`   🎯 Final Record Count: ${parseInt(finalCount.rows[0].count).toLocaleString()}`);

    // Step 6: Show sample data
    console.log('\n📋 Sample ZIP Centroids:');
    const sample = await client.query('SELECT * FROM zip_centroids ORDER BY zip_code LIMIT 5');
    sample.rows.forEach(row => {
      console.log(`   ${row.zip_code}: ${row.latitude}, ${row.longitude}`);
    });

    // Step 7: Check for hospital coverage improvement potential
    console.log('\n🏥 Checking Hospital Coordinate Coverage Impact...');
    
    // Check if hospital tables exist
    const hospitalCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('hospital_reference', 'hospital_general_info')
      AND table_schema = 'public'
    `);

    if (hospitalCheck.rows.length > 0) {
      const hospitalTable = hospitalCheck.rows[0].table_name;
      console.log(`   📊 Found hospital table: ${hospitalTable}`);

      // Check missing coordinates
      const missingCoords = await client.query(`
        SELECT COUNT(*) as missing_count
        FROM ${hospitalTable}
        WHERE (latitude IS NULL OR longitude IS NULL)
        AND zip IS NOT NULL
      `);

      const totalHospitals = await client.query(`SELECT COUNT(*) as total FROM ${hospitalTable}`);

      console.log(`   🏥 Total Hospitals: ${parseInt(totalHospitals.rows[0].total).toLocaleString()}`);
      console.log(`   ❌ Missing Coordinates: ${parseInt(missingCoords.rows[0].missing_count).toLocaleString()}`);

      // Check potential matches
      const potentialMatches = await client.query(`
        SELECT COUNT(*) as potential_matches
        FROM ${hospitalTable} h
        INNER JOIN zip_centroids z ON h.zip = z.zip_code
        WHERE (h.latitude IS NULL OR h.longitude IS NULL)
      `);

      console.log(`   🎯 Potential ZIP Matches: ${parseInt(potentialMatches.rows[0].potential_matches).toLocaleString()}`);

      // Generate update SQL if matches exist
      if (parseInt(potentialMatches.rows[0].potential_matches) > 0) {
        console.log('\n🔧 Generating Hospital Coordinate Update SQL...');
        
        const updateSQL = `
-- Hospital Coordinate Update using ZIP Centroids
-- Generated by YOLO ZIP Centroid Loader

UPDATE ${hospitalTable} 
SET 
  latitude = z.latitude,
  longitude = z.longitude,
  updated_at = NOW()
FROM zip_centroids z
WHERE ${hospitalTable}.zip = z.zip_code
  AND (${hospitalTable}.latitude IS NULL OR ${hospitalTable}.longitude IS NULL);

-- Verification Query
SELECT 
  COUNT(*) as total_hospitals,
  COUNT(latitude) as hospitals_with_coords,
  ROUND(COUNT(latitude) * 100.0 / COUNT(*), 1) as coverage_percentage
FROM ${hospitalTable};
        `;

        fs.writeFileSync('hospital_coordinate_update.sql', updateSQL);
        console.log('   📄 Update SQL saved to: hospital_coordinate_update.sql');
      }
    } else {
      console.log('   ℹ️ No hospital tables found for coordinate update analysis');
    }

    console.log('\n🎉 YOLO ZIP Centroid Loading: COMPLETE!');
    console.log('   Ready for Hospital Coordinate Enhancement via ZIP Proxy Coordinates');

  } catch (error) {
    console.error('❌ YOLO ZIP Loader Error:', error.message);
  } finally {
    await client.end();
  }
}

// Execute the loader
if (require.main === module) {
  loadZipCentroids();
}

module.exports = { loadZipCentroids }; 