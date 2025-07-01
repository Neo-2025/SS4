#!/usr/bin/env python3
"""
H3 Cell Generator for ZCTA Geometries

This script reads ZCTA geometries from a PostgreSQL database,
generates H3 cells for each geometry, and updates the database.

Required packages:
- psycopg2-binary
- h3
- shapely
- geopandas
"""

import os
import sys
import logging
import psycopg2
import psycopg2.extras
import h3
import json
from shapely.geometry import shape, Polygon, Point
from shapely import wkb
import binascii
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('h3_cell_generator')

# Database configuration
DB_PARAMS = {
    "host": "db.ugtepudnmpvgormpcuje.supabase.co",
    "port": 6543,
    "database": "postgres",
    "user": "postgres",
    "password": "f4e20a07a5490943a2319f267de7d07fccb79008"
}

# H3 resolution (7 is ~161m edge length)
H3_RESOLUTION = 7

# Batch size for processing
BATCH_SIZE = 100

def connect_to_db():
    """Connect to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        sys.exit(1)

def wkb_to_shape(wkb_hex):
    """Convert WKB hex string to Shapely geometry."""
    try:
        return wkb.loads(binascii.unhexlify(wkb_hex))
    except Exception as e:
        logger.error(f"Error converting WKB to shape: {e}")
        return None

def generate_h3_cells(geom):
    """Generate H3 cells for a Shapely geometry."""
    try:
        # Convert the geometry to a GeoJSON-like dictionary
        geojson = {'type': geom.geom_type}
        
        if geom.geom_type == 'Polygon':
            geojson['coordinates'] = [list(geom.exterior.coords)]
            for interior in geom.interiors:
                geojson['coordinates'].append(list(interior.coords))
        elif geom.geom_type == 'MultiPolygon':
            geojson['coordinates'] = []
            for poly in geom.geoms:
                poly_coords = [list(poly.exterior.coords)]
                for interior in poly.interiors:
                    poly_coords.append(list(interior.coords))
                geojson['coordinates'].append(poly_coords)
        else:
            logger.warning(f"Unsupported geometry type: {geom.geom_type}")
            return []
        
        # Use h3.polyfill to get H3 cells
        cells = h3.polyfill(geojson, H3_RESOLUTION, True)
        return list(cells)
    except Exception as e:
        logger.error(f"Error generating H3 cells: {e}")
        return []

def process_zcta(conn, zcta_id, zcta_code, geom_hex):
    """Process a single ZCTA and update its H3 cells."""
    try:
        # Convert WKB to Shapely geometry
        geom = wkb_to_shape(geom_hex)
        if geom is None:
            logger.warning(f"Failed to convert geometry for ZCTA {zcta_code}")
            return False, 0
        
        # Generate H3 cells
        h3_cells = generate_h3_cells(geom)
        
        # Update database
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE temp_zcta_geometries SET h3_cells = %s WHERE gid = %s",
                (h3_cells, zcta_id)
            )
        
        return True, len(h3_cells)
    except Exception as e:
        logger.error(f"Error processing ZCTA {zcta_code}: {e}")
        return False, 0

def get_total_zcta_count(conn):
    """Get the total number of ZCTAs in the database."""
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM temp_zcta_geometries")
        return cur.fetchone()[0]

def get_zcta_batch(conn, offset, limit):
    """Get a batch of ZCTAs from the database."""
    with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(
            """
            SELECT gid, zcta5ce20, geom::text as geom_hex
            FROM temp_zcta_geometries
            ORDER BY gid
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        return cur.fetchall()

def monitor_progress(conn):
    """Monitor the H3 cell generation progress."""
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
        
        logger.info(f"Progress: {with_h3}/{total} ZCTAs processed ({completion_pct:.2f}%)")
        logger.info(f"Remaining: {without_h3} ZCTAs")
        
        return with_h3, without_h3

def process_zctas_batch(conn, batch):
    """Process a batch of ZCTAs in parallel."""
    success_count = 0
    total_cells = 0
    
    # Process ZCTAs in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for zcta in batch:
            future = executor.submit(
                process_zcta, 
                conn, 
                zcta['gid'], 
                zcta['zcta5ce20'], 
                zcta['geom_hex']
            )
            futures.append((future, zcta['zcta5ce20']))
        
        # Collect results
        for future, zcta_code in futures:
            success, cell_count = future.result()
            if success:
                success_count += 1
                total_cells += cell_count
                logger.debug(f"ZCTA {zcta_code}: {cell_count} H3 cells")
            else:
                logger.warning(f"Failed to process ZCTA {zcta_code}")
    
    return success_count, total_cells

def main():
    """Main function to process all ZCTAs."""
    logger.info("Starting H3 cell generation for ZCTAs")
    
    # Connect to database
    conn = connect_to_db()
    
    try:
        # Get total count
        total_count = get_total_zcta_count(conn)
        logger.info(f"Found {total_count} ZCTAs to process")
        
        # Process in batches
        offset = 0
        processed_count = 0
        total_cells_generated = 0
        batch_number = 1
        
        start_time = time.time()
        
        while offset < total_count:
            batch_start_time = time.time()
            logger.info(f"Processing batch #{batch_number} (offset {offset})")
            
            # Get batch of ZCTAs
            batch = get_zcta_batch(conn, offset, BATCH_SIZE)
            if not batch:
                logger.warning(f"No ZCTAs returned for batch at offset {offset}")
                break
            
            # Process batch
            success_count, cells_generated = process_zctas_batch(conn, batch)
            
            # Commit changes
            conn.commit()
            
            # Update stats
            processed_count += success_count
            total_cells_generated += cells_generated
            
            batch_end_time = time.time()
            batch_duration = batch_end_time - batch_start_time
            
            logger.info(f"Batch #{batch_number}: {success_count}/{len(batch)} ZCTAs processed successfully")
            logger.info(f"Generated {cells_generated} H3 cells in {batch_duration:.2f} seconds")
            
            # Calculate ETA
            elapsed_time = batch_end_time - start_time
            avg_time_per_zcta = elapsed_time / processed_count if processed_count > 0 else 0
            remaining_zctas = total_count - offset - len(batch)
            eta_seconds = avg_time_per_zcta * remaining_zctas if avg_time_per_zcta > 0 else 0
            
            if remaining_zctas > 0:
                hours, remainder = divmod(eta_seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                logger.info(f"ETA: {int(hours)}h {int(minutes)}m {int(seconds)}s for remaining {remaining_zctas} ZCTAs")
            
            # Move to next batch
            offset += len(batch)
            batch_number += 1
            
            # Monitor progress every 5 batches
            if batch_number % 5 == 0:
                with_h3, without_h3 = monitor_progress(conn)
        
        # Final progress check
        with_h3, without_h3 = monitor_progress(conn)
        
        total_duration = time.time() - start_time
        hours, remainder = divmod(total_duration, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        logger.info(f"H3 cell generation completed in {int(hours)}h {int(minutes)}m {int(seconds)}s")
        logger.info(f"Processed {with_h3}/{total_count} ZCTAs")
        logger.info(f"Generated {total_cells_generated} H3 cells")
        
        if without_h3 > 0:
            logger.warning(f"{without_h3} ZCTAs still don't have H3 cells")
    
    except Exception as e:
        logger.error(f"Error during processing: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main() 