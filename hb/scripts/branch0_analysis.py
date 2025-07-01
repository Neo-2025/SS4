#!/usr/bin/env python3
"""
Branch 0 Analysis and Fix Script
-------------------------------
This script connects to the Supabase database, analyzes the current state
of Branch 0 implementation, and provides fixes for any issues.
"""

import psycopg2
import psycopg2.extras
import json
import sys
from datetime import datetime

# Database connection details
DB_PARAMS = {
    "host": "db.ugtepudnmpvgormpcuje.supabase.co",
    "port": 6543,
    "database": "postgres",
    "user": "postgres",
    "password": "f4e20a07a5490943a2319f267de7d07fccb79008"
}

# Log file
LOG_FILE = "branch0_analysis_log.txt"

def log_message(message):
    """Log message to console and file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_message = f"[{timestamp}] {message}"
    print(full_message)
    with open(LOG_FILE, "a") as f:
        f.write(full_message + "\n")

def execute_query(conn, query, params=None, fetch=True):
    """Execute a query and optionally fetch results"""
    with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(query, params)
        if fetch:
            return cur.fetchall()
        return []

def list_tables(conn):
    """List all tables in the public schema"""
    log_message("Listing public tables...")
    query = """
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
    """
    results = execute_query(conn, query)
    tables = [row['tablename'] for row in results]
    log_message(f"Found {len(tables)} tables: {', '.join(tables)}")
    return tables

def get_table_structure(conn, table_name):
    """Get the structure of a table"""
    log_message(f"Getting structure for table {table_name}...")
    query = """
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = %s
    ORDER BY ordinal_position;
    """
    results = execute_query(conn, query, (table_name,))
    log_message(f"Table {table_name} has {len(results)} columns")
    return results

def check_zcta_data(conn):
    """Check ZCTA data in temp_zcta_geometries"""
    log_message("Checking ZCTA data...")
    query = """
    SELECT COUNT(*) as count
    FROM temp_zcta_geometries;
    """
    results = execute_query(conn, query)
    zcta_count = results[0]['count']
    log_message(f"Found {zcta_count} ZCTAs in temp_zcta_geometries")
    
    # Check if h3_cells column exists
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'temp_zcta_geometries'
        AND column_name = 'h3_cells'
    ) AS has_h3_cells;
    """
    results = execute_query(conn, query)
    has_h3_cells = results[0]['has_h3_cells']
    
    orphan_zctas = []  # Initialize with empty list by default
    
    if has_h3_cells:
        log_message("temp_zcta_geometries has h3_cells column")
        
        # Check ZCTAs with h3_cells
        query = """
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN h3_cells IS NOT NULL AND array_length(h3_cells, 1) > 0 THEN 1 END) as with_h3,
            COUNT(CASE WHEN h3_cells IS NULL OR array_length(h3_cells, 1) = 0 THEN 1 END) as without_h3
        FROM temp_zcta_geometries;
        """
        results = execute_query(conn, query)
        log_message(f"ZCTAs with H3 cells: {results[0]['with_h3']} of {results[0]['total']}")
        log_message(f"ZCTAs without H3 cells: {results[0]['without_h3']} of {results[0]['total']}")
        
        # List orphan ZCTAs
        query = """
        SELECT zcta5ce20
        FROM temp_zcta_geometries
        WHERE h3_cells IS NULL OR array_length(h3_cells, 1) = 0
        ORDER BY zcta5ce20;
        """
        results = execute_query(conn, query)
        orphan_zctas = [row['zcta5ce20'] for row in results]
        log_message(f"Orphan ZCTAs: {', '.join(orphan_zctas) if orphan_zctas else 'None'}")
        
        # Check ZCTA 116 specifically
        query = """
        SELECT 
            zcta5ce20,
            ST_IsValid(geom) AS valid_geometry,
            ST_Area(geom::geography) AS area_sq_meters,
            h3_cells
        FROM temp_zcta_geometries
        WHERE zcta5ce20 = '00116';
        """
        results = execute_query(conn, query)
        if results:
            log_message(f"ZCTA 116 analysis:")
            log_message(f"  Valid geometry: {results[0]['valid_geometry']}")
            log_message(f"  Area: {results[0]['area_sq_meters']} sq meters")
            log_message(f"  H3 cells: {results[0]['h3_cells'] or 'None'}")
    else:
        log_message("temp_zcta_geometries does NOT have h3_cells column")
        log_message("Need to add h3_cells column before proceeding")
    
    return has_h3_cells, orphan_zctas

def check_geozip_table(conn):
    """Check GeoZIP table structure and data"""
    log_message("Checking GeoZIP table...")
    # Check if table exists
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'geozip'
    ) AS table_exists;
    """
    results = execute_query(conn, query)
    table_exists = results[0]['table_exists']
    
    if table_exists:
        log_message("GeoZIP table exists")
        # Check record count
        query = """
        SELECT COUNT(*) as count
        FROM geozip;
        """
        results = execute_query(conn, query)
        record_count = results[0]['count']
        log_message(f"GeoZIP table has {record_count} records")
        
        # Get table structure
        columns = get_table_structure(conn, 'geozip')
        column_names = [col['column_name'] for col in columns]
        log_message(f"GeoZIP columns: {', '.join(column_names)}")
    else:
        log_message("GeoZIP table does NOT exist")
    
    return table_exists, record_count if table_exists else 0

def check_zip_geozip_crosswalk(conn):
    """Check ZIP-GeoZIP crosswalk table"""
    log_message("Checking ZIP-GeoZIP crosswalk table...")
    # Check if table exists
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'zip_geozip_crosswalk'
    ) AS table_exists;
    """
    results = execute_query(conn, query)
    table_exists = results[0]['table_exists']
    
    if table_exists:
        log_message("ZIP-GeoZIP crosswalk table exists")
        # Check record count
        query = """
        SELECT COUNT(*) as count
        FROM zip_geozip_crosswalk;
        """
        results = execute_query(conn, query)
        record_count = results[0]['count']
        log_message(f"ZIP-GeoZIP crosswalk table has {record_count} records")
    else:
        log_message("ZIP-GeoZIP crosswalk table does NOT exist")
    
    return table_exists, record_count if table_exists else 0

def fix_orphan_zctas(conn, orphan_zctas):
    """Fix orphan ZCTAs by assigning H3 cells based on geometry"""
    if not orphan_zctas:
        log_message("No orphan ZCTAs to fix")
        return
    
    log_message(f"Attempting to fix {len(orphan_zctas)} orphan ZCTAs...")
    
    # Check if h3 extension is available
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'h3'
    ) AS h3_installed;
    """
    results = execute_query(conn, query)
    h3_installed = results[0]['h3_installed']
    
    if not h3_installed:
        log_message("H3 extension not installed. Cannot fix orphan ZCTAs automatically.")
        return
    
    for zcta in orphan_zctas:
        log_message(f"Processing ZCTA {zcta}...")
        
        # Check if geometry is valid
        query = """
        SELECT 
            ST_IsValid(geom) AS is_valid,
            ST_Area(geom::geography) AS area_sq_meters
        FROM temp_zcta_geometries
        WHERE zcta5ce20 = %s;
        """
        results = execute_query(conn, query, (zcta,))
        
        if not results or not results[0]['is_valid']:
            log_message(f"ZCTA {zcta} has invalid geometry. Skipping.")
            continue
        
        area = results[0]['area_sq_meters']
        if area < 100:  # Very small area
            log_message(f"ZCTA {zcta} has very small area ({area} sq meters). Assigning to nearest neighbor.")
            # Find nearest ZCTA with H3 cells
            query = """
            SELECT 
                tz2.zcta5ce20,
                ST_Distance(tz1.geom::geography, tz2.geom::geography) AS distance
            FROM 
                temp_zcta_geometries tz1,
                temp_zcta_geometries tz2
            WHERE 
                tz1.zcta5ce20 = %s
                AND tz2.zcta5ce20 != %s
                AND tz2.h3_cells IS NOT NULL
                AND array_length(tz2.h3_cells, 1) > 0
            ORDER BY 
                ST_Distance(tz1.geom::geography, tz2.geom::geography)
            LIMIT 1;
            """
            nearest = execute_query(conn, query, (zcta, zcta))
            
            if nearest:
                nearest_zcta = nearest[0]['zcta5ce20']
                distance = nearest[0]['distance']
                log_message(f"Nearest ZCTA to {zcta} is {nearest_zcta} ({distance:.2f} meters away)")
                
                # Get H3 cells from nearest ZCTA
                query = """
                SELECT h3_cells
                FROM temp_zcta_geometries
                WHERE zcta5ce20 = %s;
                """
                results = execute_query(conn, query, (nearest_zcta,))
                h3_cells = results[0]['h3_cells']
                
                # Update orphan ZCTA with borrowed H3 cells
                query = """
                UPDATE temp_zcta_geometries
                SET h3_cells = %s
                WHERE zcta5ce20 = %s;
                """
                execute_query(conn, query, (h3_cells, zcta), fetch=False)
                log_message(f"Assigned {len(h3_cells)} H3 cells from ZCTA {nearest_zcta} to ZCTA {zcta}")
            else:
                log_message(f"No suitable neighbor found for ZCTA {zcta}")
        else:
            log_message(f"ZCTA {zcta} has sufficient area. Generating H3 cells from geometry.")
            # Generate H3 cells from geometry (requires h3 extension)
            query = """
            UPDATE temp_zcta_geometries
            SET h3_cells = ARRAY(
                SELECT h3_cell
                FROM h3_postgis.polyfill(geom, 7) AS t(h3_cell)
            )
            WHERE zcta5ce20 = %s
            RETURNING array_length(h3_cells, 1) AS cell_count;
            """
            try:
                results = execute_query(conn, query, (zcta,))
                if results:
                    log_message(f"Generated {results[0]['cell_count']} H3 cells for ZCTA {zcta}")
                else:
                    log_message(f"Failed to generate H3 cells for ZCTA {zcta}")
            except Exception as e:
                log_message(f"Error generating H3 cells for ZCTA {zcta}: {str(e)}")
    
    conn.commit()
    log_message("Orphan ZCTA fixes applied and committed")

def populate_geozip_table(conn):
    """Populate GeoZIP table from ZCTA data"""
    log_message("Populating GeoZIP table...")
    
    # Check if geozip table is already populated
    query = """
    SELECT COUNT(*) AS count
    FROM geozip;
    """
    results = execute_query(conn, query)
    count = results[0]['count']
    
    if count > 0:
        log_message(f"GeoZIP table already has {count} records. Skipping population.")
        return
    
    # Check if zip_zcta_crosswalk table exists
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'zip_zcta_crosswalk'
    ) AS table_exists;
    """
    results = execute_query(conn, query)
    zip_zcta_exists = results[0]['table_exists']
    
    if not zip_zcta_exists:
        log_message("zip_zcta_crosswalk table not found. Cannot populate GeoZIP table.")
        return
    
    # Populate GeoZIP table
    log_message("Populating GeoZIP table from temp_zcta_geometries and zip_zcta_crosswalk...")
    
    query = """
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
            FROM zip_zcta_crosswalk zz
            WHERE zz.zcta = tz.zcta5ce20
            ORDER BY zz.population DESC
            LIMIT 1
        ) AS primary_zip5,
        ARRAY(
            SELECT DISTINCT zz.zip5
            FROM zip_zcta_crosswalk zz
            WHERE zz.zcta = tz.zcta5ce20
        ) AS zip_array,
        (
            SELECT COUNT(DISTINCT zz.zip5) = 1
            FROM zip_zcta_crosswalk zz
            WHERE zz.zcta = tz.zcta5ce20
        ) AS is_simple,
        NULL AS hsa_id,
        NULL AS hrr_id,
        tz.geom,
        tz.h3_cells,
        (
            SELECT COALESCE(SUM(zz.population), 0)
            FROM zip_zcta_crosswalk zz
            WHERE zz.zcta = tz.zcta5ce20
        ) AS pop_total
    FROM 
        temp_zcta_geometries tz
    WHERE
        tz.h3_cells IS NOT NULL
        AND array_length(tz.h3_cells, 1) > 0
    RETURNING geozip_id;
    """
    
    try:
        results = execute_query(conn, query)
        inserted_count = len(results)
        log_message(f"Inserted {inserted_count} records into GeoZIP table")
        
        # Populate the crosswalk table if needed
        if not check_zip_geozip_crosswalk(conn)[1]:
            log_message("Populating zip_geozip_crosswalk table...")
            
            query = """
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
                zip_zcta_crosswalk zz
            JOIN 
                geozip g ON zz.zcta = g.zcta_id
            RETURNING zip5;
            """
            
            results = execute_query(conn, query)
            inserted_count = len(results)
            log_message(f"Inserted {inserted_count} records into zip_geozip_crosswalk table")
        
        conn.commit()
        log_message("GeoZIP population committed successfully")
    except Exception as e:
        conn.rollback()
        log_message(f"Error populating GeoZIP table: {str(e)}")
        log_message(f"SQL Error: {str(e)}")
        # Print more detailed error info if possible
        if hasattr(e, 'pgerror'):
            log_message(f"PostgreSQL Error: {e.pgerror}")
        if hasattr(e, 'diag'):
            log_message(f"Diagnostics: {e.diag}")
            
        # Let's try to identify the specific issue by running a test query
        try:
            # Test zip_zcta_crosswalk join
            query = """
            SELECT 
                COUNT(*) AS count
            FROM 
                temp_zcta_geometries tz
            JOIN 
                zip_zcta_crosswalk zz ON zz.zcta = tz.zcta5ce20
            WHERE
                tz.h3_cells IS NOT NULL
                AND array_length(tz.h3_cells, 1) > 0;
            """
            results = execute_query(conn, query)
            log_message(f"Test join found {results[0]['count']} matching records")
        except Exception as test_error:
            log_message(f"Test query failed: {str(test_error)}")

def add_h3_cells_column(conn):
    """Add h3_cells column to temp_zcta_geometries if it doesn't exist"""
    log_message("Adding h3_cells column to temp_zcta_geometries...")
    query = """
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'temp_zcta_geometries'
        AND column_name = 'h3_cells'
    ) AS has_h3_cells;
    """
    results = execute_query(conn, query)
    has_h3_cells = results[0]['has_h3_cells']
    
    if has_h3_cells:
        log_message("h3_cells column already exists. Skipping.")
        return
    
    try:
        # Add h3_cells column
        query = """
        ALTER TABLE temp_zcta_geometries
        ADD COLUMN h3_cells TEXT[];
        """
        execute_query(conn, query, fetch=False)
        log_message("Added h3_cells column to temp_zcta_geometries")
        
        # Check if h3 extension and h3_postgis extension are available
        query = """
        SELECT 
            EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'h3') AS h3_installed,
            EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'h3_postgis') AS h3_postgis_installed;
        """
        results = execute_query(conn, query)
        h3_installed = results[0]['h3_installed']
        h3_postgis_installed = results[0]['h3_postgis_installed']
        
        if h3_installed and h3_postgis_installed:
            log_message("H3 and H3_PostGIS extensions are installed. Will attempt to populate h3_cells.")
            
            # Populate h3_cells column using PostGIS and H3
            query = """
            UPDATE temp_zcta_geometries
            SET h3_cells = ARRAY(
                SELECT h3_cell
                FROM h3_postgis.polyfill(geom, 7) AS t(h3_cell)
            )
            WHERE ST_IsValid(geom)
            RETURNING COUNT(*);
            """
            try:
                results = execute_query(conn, query)
                log_message(f"Populated h3_cells for {results[0]['count']} ZCTAs")
            except Exception as e:
                log_message(f"Error populating h3_cells using H3_PostGIS: {str(e)}")
                log_message("Will need to populate h3_cells using another method")
        else:
            log_message("H3 extensions not fully installed. Cannot automatically populate h3_cells.")
            log_message("Need to install H3 extensions or use alternative method to populate h3_cells")
        
        conn.commit()
        log_message("h3_cells column addition committed")
    except Exception as e:
        conn.rollback()
        log_message(f"Error adding h3_cells column: {str(e)}")
        return False
    
    return True

def main():
    """Main function to analyze and fix Branch 0 implementation"""
    log_message("Branch 0 Analysis and Fix Script")
    log_message("--------------------------------")
    
    try:
        # Connect to database
        log_message("Connecting to database...")
        conn = psycopg2.connect(**DB_PARAMS)
        
        # List tables
        tables = list_tables(conn)
        
        # Check ZCTA data
        has_h3_cells, orphan_zctas = check_zcta_data(conn)
        
        # Add h3_cells column if it doesn't exist
        if not has_h3_cells:
            add_h3_cells_column(conn)
            # Recheck ZCTA data
            has_h3_cells, orphan_zctas = check_zcta_data(conn)
        
        # Check GeoZIP table
        geozip_exists, geozip_count = check_geozip_table(conn)
        
        # Check ZIP-GeoZIP crosswalk table
        crosswalk_exists, crosswalk_count = check_zip_geozip_crosswalk(conn)
        
        # Fix orphan ZCTAs if needed
        if orphan_zctas:
            fix_orphan_zctas(conn, orphan_zctas)
        
        # Populate GeoZIP table if needed
        if geozip_exists and geozip_count == 0:
            populate_geozip_table(conn)
        
        # Summary
        log_message("\nBranch 0 Implementation Status Summary:")
        log_message("--------------------------------------")
        log_message(f"ZCTA Data: {'Complete' if has_h3_cells and not orphan_zctas else 'Incomplete'}")
        log_message(f"GeoZIP Table: {'Populated' if geozip_count > 0 else 'Empty'}")
        log_message(f"ZIP-GeoZIP Crosswalk: {'Populated' if crosswalk_count > 0 else 'Empty'}")
        
        # Close connection
        conn.close()
        log_message("Database connection closed")
        
    except Exception as e:
        log_message(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 