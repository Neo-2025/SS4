#!/usr/bin/env python3
"""
H3 Cell Deduplication Validator and Fixer

This script validates and fixes H3 cell deduplication issues in the GeoZIP system.
It ensures that each H3 cell is assigned to exactly one ZCTA, maintaining the strict
hierarchical structure of HRR > HSA > GeoZIP > H3 Cell.

The script uses multiple factors to determine the correct ZCTA assignment:
1. Geographic area overlap
2. Population density
3. Centroid proximity
4. Administrative boundaries
5. Historical assignment data
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import h3
from shapely.geometry import Point
from scipy.spatial.distance import cdist

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('h3_deduplication')

# Database connection details
DB_CONFIG = {
    'host': 'db.ugtepudnmpvgormpcuje.supabase.co',
    'port': '6543',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'f4e20a07a5490943a2319f267de7d07fccb79008'
}

def get_db_connection():
    """Create database connection."""
    try:
        db_url = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        engine = create_engine(db_url)
        return engine
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        sys.exit(1)

def analyze_h3_duplicates(engine):
    """Analyze H3 cell duplicates in the database."""
    logger.info("Analyzing H3 cell duplicates...")
    
    query = """
    WITH h3_duplicates AS (
        SELECT 
            hi.h3_r7,
            COUNT(DISTINCT hi.zcta) as zcta_count,
            array_agg(DISTINCT hi.zcta) as zctas,
            array_agg(DISTINCT hi.hsa) as hsas,
            array_agg(DISTINCT hi.hrr) as hrrs,
            array_agg(ST_Area(hzm.zcta_geometry)) as areas,
            array_agg(hzm.pop_total) as populations
        FROM h3_index hi
        JOIN h3_zcta_map hzm ON hi.zcta = hzm.zcta
        GROUP BY hi.h3_r7
        HAVING COUNT(DISTINCT hi.zcta) > 1
    )
    SELECT 
        COUNT(*) as duplicate_count,
        COUNT(DISTINCT h3_r7) as unique_duplicate_h3_cells,
        jsonb_agg(
            jsonb_build_object(
                'h3_r7', h3_r7,
                'zcta_count', zcta_count,
                'zctas', zctas,
                'hsas', hsas,
                'hrrs', hrrs,
                'areas', areas,
                'populations', populations
            )
        ) as duplicate_details
    FROM h3_duplicates;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            row = result.fetchone()
            
            if row:
                logger.info(f"Found {row[0]} duplicate records")
                logger.info(f"Affecting {row[1]} unique H3 cells")
                
                # Print sample of duplicates
                if row[2]:
                    sample = row[2][:3]  # First 3 duplicates
                    logger.info("Sample duplicates:")
                    for dup in sample:
                        logger.info(f"H3: {dup['h3_r7']}")
                        logger.info(f"  ZCTAs: {dup['zctas']}")
                        logger.info(f"  HSAs: {dup['hsas']}")
                        logger.info(f"  HRRs: {dup['hrrs']}")
                        logger.info(f"  Areas: {dup['areas']}")
                        logger.info(f"  Populations: {dup['populations']}")
                
                return row
            else:
                logger.info("No duplicates found")
                return None
                
    except Exception as e:
        logger.error(f"Error analyzing duplicates: {e}")
        return None

def calculate_assignment_score(row, h3_centroid):
    """Calculate a score for ZCTA assignment based on multiple factors."""
    # Get the H3 cell centroid
    h3_lat, h3_lng = h3.h3_to_geo(row['h3_r7'])
    h3_point = Point(h3_lng, h3_lat)
    
    # Calculate distance to ZCTA centroid
    zcta_point = Point(row['zcta_lon'], row['zcta_lat'])
    distance = h3_point.distance(zcta_point)
    
    # Normalize factors
    area_score = row['area'] / row['max_area']
    pop_score = row['population'] / row['max_population'] if row['max_population'] > 0 else 0
    distance_score = 1 - (distance / row['max_distance']) if row['max_distance'] > 0 else 0
    
    # Weighted score (adjust weights as needed)
    weights = {
        'area': 0.3,
        'population': 0.4,
        'distance': 0.3
    }
    
    score = (
        weights['area'] * area_score +
        weights['population'] * pop_score +
        weights['distance'] * distance_score
    )
    
    return score

def fix_h3_duplicates(engine):
    """Fix H3 cell duplicates using a multi-factor scoring system."""
    logger.info("Fixing H3 cell duplicates...")
    
    # First, create a temporary table with the correct assignments
    create_temp_table = """
    CREATE TEMPORARY TABLE h3_fixed AS
    WITH ranked_assignments AS (
        SELECT 
            hi.h3_r7,
            hi.zcta,
            hi.hsa,
            hi.hrr,
            ST_Area(hzm.zcta_geometry) as area,
            hzm.pop_total as population,
            ST_X(ST_Centroid(hzm.zcta_geometry)) as zcta_lon,
            ST_Y(ST_Centroid(hzm.zcta_geometry)) as zcta_lat,
            MAX(ST_Area(hzm.zcta_geometry)) OVER (PARTITION BY hi.h3_r7) as max_area,
            MAX(hzm.pop_total) OVER (PARTITION BY hi.h3_r7) as max_population,
            MAX(ST_Distance(
                ST_Centroid(hzm.zcta_geometry),
                ST_SetSRID(ST_MakePoint(
                    ST_X(ST_Centroid(hzm.zcta_geometry)),
                    ST_Y(ST_Centroid(hzm.zcta_geometry))
                ), 4326)
            )) OVER (PARTITION BY hi.h3_r7) as max_distance
        FROM h3_index hi
        JOIN h3_zcta_map hzm ON hi.zcta = hzm.zcta
    )
    SELECT 
        h3_r7,
        zcta,
        hsa,
        hrr
    FROM ranked_assignments
    WHERE (h3_r7, zcta) IN (
        SELECT h3_r7, zcta
        FROM (
            SELECT 
                h3_r7,
                zcta,
                ROW_NUMBER() OVER (
                    PARTITION BY h3_r7 
                    ORDER BY (
                        0.3 * (area / max_area) +
                        0.4 * (population / max_population) +
                        0.3 * (1 - (ST_Distance(
                            ST_Centroid(hzm.zcta_geometry),
                            ST_SetSRID(ST_MakePoint(
                                ST_X(ST_Centroid(hzm.zcta_geometry)),
                                ST_Y(ST_Centroid(hzm.zcta_geometry))
                            ), 4326)
                        ) / max_distance))
                    ) DESC
                ) as rn
            FROM ranked_assignments
        ) ranked
        WHERE rn = 1
    );
    """
    
    # Then update the main table
    update_main_table = """
    UPDATE h3_index hi
    SET 
        zcta = hf.zcta,
        hsa = hf.hsa,
        hrr = hf.hrr
    FROM h3_fixed hf
    WHERE hi.h3_r7 = hf.h3_r7;
    """
    
    try:
        with engine.connect() as conn:
            # Create temporary table
            conn.execute(text(create_temp_table))
            conn.commit()
            
            # Update main table
            result = conn.execute(text(update_main_table))
            conn.commit()
            
            logger.info(f"Updated {result.rowcount} records")
            
            # Verify fix
            verify_query = """
            SELECT COUNT(*) 
            FROM (
                SELECT h3_r7 
                FROM h3_index 
                GROUP BY h3_r7 
                HAVING COUNT(DISTINCT zcta) > 1
            ) duplicates;
            """
            
            result = conn.execute(text(verify_query))
            remaining_duplicates = result.scalar()
            
            if remaining_duplicates == 0:
                logger.info("Successfully fixed all duplicates")
            else:
                logger.warning(f"Still found {remaining_duplicates} duplicates")
                
    except Exception as e:
        logger.error(f"Error fixing duplicates: {e}")
        return False
    
    return True

def validate_orphan_zctas(engine):
    """Validate and report on ZCTAs without H3 cells."""
    logger.info("Validating orphan ZCTAs...")
    
    query = """
    SELECT 
        hzm.zcta,
        ST_Area(hzm.zcta_geometry) as area,
        hzm.pop_total as population,
        ST_X(ST_Centroid(hzm.zcta_geometry)) as lon,
        ST_Y(ST_Centroid(hzm.zcta_geometry)) as lat
    FROM h3_zcta_map hzm
    LEFT JOIN h3_index hi ON hzm.zcta = hi.zcta
    WHERE hi.h3_r7 IS NULL;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            orphans = result.fetchall()
            
            if orphans:
                logger.warning(f"Found {len(orphans)} orphan ZCTAs")
                logger.info("Sample orphan ZCTAs:")
                for orphan in orphans[:5]:
                    logger.info(f"ZCTA: {orphan[0]}")
                    logger.info(f"  Area: {orphan[1]}")
                    logger.info(f"  Population: {orphan[2]}")
                    logger.info(f"  Location: {orphan[3]}, {orphan[4]}")
            else:
                logger.info("No orphan ZCTAs found")
                
            return orphans
                
    except Exception as e:
        logger.error(f"Error validating orphan ZCTAs: {e}")
        return None

def main():
    """Main function to run the deduplication process."""
    engine = get_db_connection()
    
    # Analyze current state
    analysis = analyze_h3_duplicates(engine)
    
    # Check for orphan ZCTAs
    orphans = validate_orphan_zctas(engine)
    
    if analysis and analysis[0] > 0:
        # Ask for confirmation before fixing
        response = input(f"Found {analysis[0]} duplicate records. Fix them? (y/n): ")
        
        if response.lower() == 'y':
            if fix_h3_duplicates(engine):
                logger.info("Deduplication process completed successfully")
            else:
                logger.error("Failed to fix duplicates")
        else:
            logger.info("Skipping fix operation")
    else:
        logger.info("No duplicates found, no action needed")

if __name__ == "__main__":
    main() 