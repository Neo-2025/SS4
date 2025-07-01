#!/usr/bin/env python3
"""
GeoZIP Table Population Script

This script populates the GeoZIP tables from ZCTA geometry data
after H3 cells have been generated. It handles:

1. Verification of H3 cell generation
2. Population of the geozip table
3. Creation of the ZIP-GeoZIP crosswalk
4. Validation of the population process

Required packages:
- psycopg2-binary
"""

import os
import sys
import logging
import psycopg2
import psycopg2.extras
import time
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('geozip_populator')

# Database configuration
DB_PARAMS = {
    "host": "db.ugtepudnmpvgormpcuje.supabase.co",
    "port": 6543,
    "database": "postgres",
    "user": "postgres",
    "password": "f4e20a07a5490943a2319f267de7d07fccb79008"
}

def connect_to_db():
    """Connect to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        sys.exit(1)

def check_h3_cell_generation(conn):
    """Check if H3 cells have been generated for ZCTAs."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT 
                COUNT(*) AS total,
                COUNT(CASE WHEN h3_cells IS NOT NULL AND array_length(h3_cells, 1) > 0 THEN 1 END) AS with_h3,
                COUNT(CASE WHEN h3_cells IS NULL OR array_length(h3_cells, 1) = 0 THEN 1 END) AS without_h3
            FROM temp_zcta_geometries
            """
        )
        result = cur.fetchone()
        total, with_h3, without_h3 = result
        completion_pct = (with_h3 / total) * 100 if total > 0 else 0
        
        logger.info(f"H3 Cell Generation Status:")
        logger.info(f"  Total ZCTAs: {total}")
        logger.info(f"  ZCTAs with H3 cells: {with_h3} ({completion_pct:.2f}%)")
        logger.info(f"  ZCTAs without H3 cells: {without_h3}")
        
        return total, with_h3, without_h3

def check_zip_zcta_crosswalk(conn):
    """Check if the ZIP-ZCTA crosswalk table exists and has data."""
    with conn.cursor() as cur:
        # Check if table exists
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'zip_zcta_crosswalk'
            )
            """
        )
        table_exists = cur.fetchone()[0]
        
        if not table_exists:
            logger.warning("zip_zcta_crosswalk table does not exist")
            return False, 0, []
        
        # Check column structure
        cur.execute(
            """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'zip_zcta_crosswalk'
            ORDER BY ordinal_position
            """
        )
        columns = cur.fetchall()
        
        # Check record count
        cur.execute("SELECT COUNT(*) FROM zip_zcta_crosswalk")
        record_count = cur.fetchone()[0]
        
        logger.info(f"ZIP-ZCTA Crosswalk Status:")
        logger.info(f"  Table exists: {table_exists}")
        logger.info(f"  Record count: {record_count}")
        
        return table_exists, record_count, columns

def create_temp_crosswalk(conn):
    """Create a temporary ZIP-ZCTA crosswalk if needed."""
    with conn.cursor() as cur:
        logger.info("Creating temporary ZIP-ZCTA crosswalk")
        
        # Create temporary table
        cur.execute(
            """
            DROP TABLE IF EXISTS temp_zip_zcta_crosswalk;
            
            CREATE TABLE temp_zip_zcta_crosswalk (
                zip5 TEXT PRIMARY KEY,
                zcta TEXT NOT NULL,
                population INTEGER DEFAULT 1000,
                is_primary BOOLEAN DEFAULT TRUE
            );
            """
        )
        
        # Populate with 1:1 mapping as a fallback
        cur.execute(
            """
            INSERT INTO temp_zip_zcta_crosswalk (zip5, zcta, is_primary)
            SELECT 
                zcta5ce20 AS zip5,
                zcta5ce20 AS zcta,
                TRUE AS is_primary
            FROM 
                temp_zcta_geometries
            WHERE
                h3_cells IS NOT NULL
                AND array_length(h3_cells, 1) > 0
            ON CONFLICT (zip5) DO NOTHING;
            """
        )
        
        # Get count of records
        cur.execute("SELECT COUNT(*) FROM temp_zip_zcta_crosswalk")
        record_count = cur.fetchone()[0]
        
        logger.info(f"Created temporary crosswalk with {record_count} records")
        
        return record_count

def populate_geozip_table(conn, temp_crosswalk=False):
    """Populate the GeoZIP table from ZCTA geometries."""
    crosswalk_table = "temp_zip_zcta_crosswalk" if temp_crosswalk else "zip_zcta_crosswalk"
    
    with conn.cursor() as cur:
        logger.info("Checking GeoZIP table status")
        
        # Check if table exists
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'geozip'
            )
            """
        )
        table_exists = cur.fetchone()[0]
        
        if not table_exists:
            logger.error("GeoZIP table does not exist")
            return False, 0
        
        # Truncate table if it exists
        logger.info("Truncating GeoZIP table")
        cur.execute("TRUNCATE TABLE geozip")
        
        # Populate GeoZIP table
        logger.info(f"Populating GeoZIP table from {crosswalk_table}")
        query = f"""
        INSERT INTO geozip (
            geozip_id,
            zcta_id,
            geozip_name,
            primary_zip5,
            zip_array,
            is_simple,
            hsa_id,
            hrr_id,
            geometry,
            h3_cells,
            pop_total
        )
        SELECT 
            tz.zcta5ce20 AS geozip_id,
            tz.zcta5ce20 AS zcta_id,
            tz.zcta5ce20 AS geozip_name,
            (
                SELECT zz.zip5
                FROM {crosswalk_table} zz
                WHERE zz.zcta = tz.zcta5ce20
                ORDER BY zz.population DESC, zz.is_primary DESC
                LIMIT 1
            ) AS primary_zip5,
            ARRAY(
                SELECT DISTINCT zz.zip5
                FROM {crosswalk_table} zz
                WHERE zz.zcta = tz.zcta5ce20
            ) AS zip_array,
            (
                SELECT COUNT(DISTINCT zz.zip5) = 1
                FROM {crosswalk_table} zz
                WHERE zz.zcta = tz.zcta5ce20
            ) AS is_simple,
            tz.hsarollup_zcta AS hsa_id,
            NULL AS hrr_id,
            tz.geom AS geometry,
            tz.h3_cells,
            (
                SELECT COALESCE(SUM(zz.population), 0)
                FROM {crosswalk_table} zz
                WHERE zz.zcta = tz.zcta5ce20
            ) AS pop_total
        FROM 
            temp_zcta_geometries tz
        WHERE
            tz.h3_cells IS NOT NULL
            AND array_length(tz.h3_cells, 1) > 0
        """
        
        cur.execute(query)
        
        # Get count of records
        cur.execute("SELECT COUNT(*) FROM geozip")
        record_count = cur.fetchone()[0]
        
        logger.info(f"Populated GeoZIP table with {record_count} records")
        
        return True, record_count

def populate_zip_geozip_crosswalk(conn, temp_crosswalk=False):
    """Populate the ZIP-GeoZIP crosswalk table."""
    crosswalk_table = "temp_zip_zcta_crosswalk" if temp_crosswalk else "zip_zcta_crosswalk"
    
    with conn.cursor() as cur:
        logger.info("Checking ZIP-GeoZIP crosswalk table status")
        
        # Check if table exists
        cur.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'zip_geozip_crosswalk'
            )
            """
        )
        table_exists = cur.fetchone()[0]
        
        if not table_exists:
            logger.error("ZIP-GeoZIP crosswalk table does not exist")
            return False, 0
        
        # Truncate table if it exists
        logger.info("Truncating ZIP-GeoZIP crosswalk table")
        cur.execute("TRUNCATE TABLE zip_geozip_crosswalk")
        
        # Populate ZIP-GeoZIP crosswalk table
        logger.info(f"Populating ZIP-GeoZIP crosswalk table from {crosswalk_table}")
        query = f"""
        INSERT INTO zip_geozip_crosswalk (
            zip5,
            geozip_id,
            is_primary,
            population
        )
        SELECT 
            zz.zip5,
            g.geozip_id,
            zz.zip5 = g.primary_zip5 AS is_primary,
            zz.population
        FROM 
            {crosswalk_table} zz
        JOIN 
            geozip g ON zz.zcta = g.zcta_id
        """
        
        cur.execute(query)
        
        # Get count of records
        cur.execute("SELECT COUNT(*) FROM zip_geozip_crosswalk")
        record_count = cur.fetchone()[0]
        
        logger.info(f"Populated ZIP-GeoZIP crosswalk table with {record_count} records")
        
        return True, record_count

def validate_population(conn):
    """Validate the population process."""
    with conn.cursor() as cur:
        # Check GeoZIP counts
        cur.execute("SELECT COUNT(*) FROM geozip")
        geozip_count = cur.fetchone()[0]
        
        # Check ZIP-GeoZIP crosswalk counts
        cur.execute("SELECT COUNT(*) FROM zip_geozip_crosswalk")
        crosswalk_count = cur.fetchone()[0]
        
        # Check for orphan ZCTAs (those with H3 cells but no GeoZIP)
        cur.execute(
            """
            SELECT COUNT(*)
            FROM temp_zcta_geometries tz
            LEFT JOIN geozip g ON tz.zcta5ce20 = g.zcta_id
            WHERE
                tz.h3_cells IS NOT NULL
                AND array_length(tz.h3_cells, 1) > 0
                AND g.geozip_id IS NULL
            """
        )
        orphan_zctas = cur.fetchone()[0]
        
        # Check for orphan ZIPs (those in crosswalk but no GeoZIP)
        cur.execute(
            """
            SELECT COUNT(*)
            FROM zip_geozip_crosswalk z
            LEFT JOIN geozip g ON z.geozip_id = g.geozip_id
            WHERE g.geozip_id IS NULL
            """
        )
        orphan_zips = cur.fetchone()[0]
        
        logger.info("Validation Results:")
        logger.info(f"  GeoZIP count: {geozip_count}")
        logger.info(f"  ZIP-GeoZIP crosswalk count: {crosswalk_count}")
        logger.info(f"  Orphan ZCTAs: {orphan_zctas}")
        logger.info(f"  Orphan ZIPs: {orphan_zips}")
        
        return geozip_count, crosswalk_count, orphan_zctas, orphan_zips

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Populate GeoZIP tables from ZCTA data")
    parser.add_argument("--force", action="store_true", help="Force population even if H3 cells are not complete")
    parser.add_argument("--temp-crosswalk", action="store_true", help="Use a temporary 1:1 crosswalk")
    args = parser.parse_args()
    
    logger.info("Starting GeoZIP table population")
    
    # Connect to database
    conn = connect_to_db()
    
    try:
        # Check H3 cell generation
        total, with_h3, without_h3 = check_h3_cell_generation(conn)
        
        # Exit if H3 cells are not complete, unless forced
        if without_h3 > 0 and not args.force:
            logger.error(f"{without_h3} ZCTAs do not have H3 cells. Use --force to continue anyway.")
            sys.exit(1)
        
        # Check ZIP-ZCTA crosswalk
        has_crosswalk, crosswalk_count, columns = check_zip_zcta_crosswalk(conn)
        
        # Create temporary crosswalk if needed
        if not has_crosswalk or crosswalk_count == 0 or args.temp_crosswalk:
            create_temp_crosswalk(conn)
            use_temp_crosswalk = True
        else:
            use_temp_crosswalk = False
        
        # Populate GeoZIP table
        start_time = time.time()
        success, geozip_count = populate_geozip_table(conn, use_temp_crosswalk)
        
        if not success:
            logger.error("Failed to populate GeoZIP table")
            sys.exit(1)
        
        # Populate ZIP-GeoZIP crosswalk
        success, crosswalk_count = populate_zip_geozip_crosswalk(conn, use_temp_crosswalk)
        
        if not success:
            logger.error("Failed to populate ZIP-GeoZIP crosswalk")
            sys.exit(1)
        
        # Validate population
        geozip_count, crosswalk_count, orphan_zctas, orphan_zips = validate_population(conn)
        
        # Commit changes
        conn.commit()
        
        # Log timing
        end_time = time.time()
        duration = end_time - start_time
        
        logger.info(f"GeoZIP table population completed in {duration:.2f} seconds")
        logger.info(f"Created {geozip_count} GeoZIP records and {crosswalk_count} ZIP-GeoZIP crosswalk records")
        
        if orphan_zctas > 0 or orphan_zips > 0:
            logger.warning(f"Found {orphan_zctas} orphan ZCTAs and {orphan_zips} orphan ZIPs")
        
    except Exception as e:
        logger.error(f"Error during execution: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main() 