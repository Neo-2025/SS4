#!/bin/bash
# Branch 0 Implementation Script
# This script executes all the steps needed for Branch 0 implementation

set -e  # Exit on error

# Working directory
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"

echo "===================== Branch 0 Implementation ====================="
echo "Starting at: $(date)"
echo "Working directory: $SCRIPT_DIR"

# Step 1: Check database structure
echo
echo "===== Step 1: Checking Database Structure ====="
psql "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres" << EOF
\echo 'Checking temp_zcta_geometries table:'
SELECT COUNT(*) FROM temp_zcta_geometries;

\echo 'Checking if h3_cells column exists:'
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'temp_zcta_geometries' 
  AND column_name = 'h3_cells'
) AS has_h3_cells;

\echo 'Adding h3_cells column if needed:'
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'temp_zcta_geometries' 
    AND column_name = 'h3_cells'
  ) THEN
    ALTER TABLE temp_zcta_geometries ADD COLUMN h3_cells TEXT[];
    RAISE NOTICE 'Added h3_cells column to temp_zcta_geometries';
  ELSE
    RAISE NOTICE 'h3_cells column already exists in temp_zcta_geometries';
  END IF;
END
\$\$;

\echo 'Checking geozip table:'
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'geozip'
) AS has_geozip_table;

\echo 'Checking zip_geozip_crosswalk table:'
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'zip_geozip_crosswalk'
) AS has_zip_geozip_crosswalk_table;
EOF

# Step 2: Install dependencies
echo
echo "===== Step 2: Installing Python Dependencies ====="
pip install -r requirements-branch0.txt

# Step 3: Generate H3 cells for ZCTAs
echo
echo "===== Step 3: Generating H3 Cells for ZCTAs ====="
python generate_h3_cells.py
if [ $? -ne 0 ]; then
  echo "Error: H3 cell generation failed"
  exit 1
fi

# Step 4: Verify H3 cell generation
echo
echo "===== Step 4: Verifying H3 Cell Generation ====="
psql "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres" << EOF
SELECT 
  COUNT(*) AS total_zctas,
  COUNT(CASE WHEN h3_cells IS NOT NULL AND array_length(h3_cells, 1) > 0 THEN 1 END) AS with_h3_cells,
  COUNT(CASE WHEN h3_cells IS NULL OR array_length(h3_cells, 1) = 0 THEN 1 END) AS without_h3_cells,
  ROUND(
    100.0 * COUNT(CASE WHEN h3_cells IS NOT NULL AND array_length(h3_cells, 1) > 0 THEN 1 END) / 
    COUNT(*), 2
  ) AS completion_percentage
FROM temp_zcta_geometries;
EOF

# Step 5: Populate GeoZIP tables
echo
echo "===== Step 5: Populating GeoZIP Tables ====="
python populate_geozip_tables.py --temp-crosswalk
if [ $? -ne 0 ]; then
  echo "Error: GeoZIP table population failed"
  exit 1
fi

# Step 6: Verify implementation
echo
echo "===== Step 6: Verifying Implementation ====="
psql "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres" << EOF
\echo 'GeoZIP table count:'
SELECT COUNT(*) FROM geozip;

\echo 'ZIP-GeoZIP crosswalk count:'
SELECT COUNT(*) FROM zip_geozip_crosswalk;

\echo 'Sample GeoZIP entries:'
SELECT geozip_id, zcta_id, primary_zip5, array_length(zip_array, 1) as zip_count, 
       array_length(h3_cells, 1) as h3_cell_count, is_simple, hsa_id
FROM geozip
LIMIT 5;

\echo 'Sample ZIP-GeoZIP crosswalk entries:'
SELECT zip5, geozip_id, is_primary, population
FROM zip_geozip_crosswalk
LIMIT 5;

\echo 'Orphan ZCTAs (with H3 cells but no GeoZIP):'
SELECT tz.zcta5ce20
FROM temp_zcta_geometries tz
LEFT JOIN geozip g ON tz.zcta5ce20 = g.zcta_id
WHERE
    tz.h3_cells IS NOT NULL
    AND array_length(tz.h3_cells, 1) > 0
    AND g.geozip_id IS NULL
LIMIT 10;
EOF

# Step 7: Update implementation log
echo
echo "===== Step 7: Updating Implementation Log ====="
LOG_FILE="../../kb/docs/ss5-train-new-thread/Notes as perform Branch 0 post refactor to h3 -first.md"

# Append implementation log
cat << EOF >> "$LOG_FILE"

# Branch 0 Implementation Log - $(date "+%Y-%m-%d %H:%M:%S")

## Implementation Steps Executed

1. Verified database structure
   - Confirmed temp_zcta_geometries table with $(psql -t -c "SELECT COUNT(*) FROM temp_zcta_geometries;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres") ZCTAs
   - Ensured h3_cells column exists
   - Verified geozip and zip_geozip_crosswalk tables

2. Generated H3 cells for ZCTAs using Python script
   - Used H3 resolution 7 (~161m edge length)
   - Applied parallel processing for efficiency
   - Handled geometry conversion between PostGIS and H3

3. Populated GeoZIP tables
   - Created temporary ZIP-ZCTA crosswalk for initial implementation
   - Populated geozip table with $(psql -t -c "SELECT COUNT(*) FROM geozip;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres") records
   - Populated zip_geozip_crosswalk with $(psql -t -c "SELECT COUNT(*) FROM zip_geozip_crosswalk;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres") records

## Implementation Status

- H3 cell generation: $(psql -t -c "SELECT ROUND(100.0 * COUNT(CASE WHEN h3_cells IS NOT NULL AND array_length(h3_cells, 1) > 0 THEN 1 END) / COUNT(*), 2) AS completion_percentage FROM temp_zcta_geometries;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres")% complete
- GeoZIP table: $(psql -t -c "SELECT COUNT(*) FROM geozip;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres") records
- ZIP-GeoZIP crosswalk: $(psql -t -c "SELECT COUNT(*) FROM zip_geozip_crosswalk;" "postgresql://postgres:f4e20a07a5490943a2319f267de7d07fccb79008@db.ugtepudnmpvgormpcuje.supabase.co:6543/postgres") records

## Next Steps

1. Refine ZIP-ZCTA crosswalk with more accurate data sources
2. Update HSA and HRR assignments in GeoZIP table
3. Implement the remaining stories in Branch 1
EOF

echo
echo "Implementation completed successfully at: $(date)"
echo "================================================================="
echo "Check the implementation log at: $LOG_FILE" 