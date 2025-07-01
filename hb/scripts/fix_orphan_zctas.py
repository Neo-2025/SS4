#!/usr/bin/env python3
"""
Orphan ZCTA Fixer

This script identifies and fixes ZCTAs that don't have any H3 cells assigned to them.
It uses a combination of spatial proximity and population density to assign H3 cells
to these orphan ZCTAs.
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import h3
from shapely.geometry import Point, Polygon
from scipy.spatial.distance import cdist

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('orphan_zcta_fixer')

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

def get_orphan_zctas(engine):
    """Get all ZCTAs that don't have any H3 cells assigned."""
    query = """
    SELECT 
        zcta,
        ST_Area(zcta_geometry) as area,
        pop_total as population,
        ST_X(ST_Centroid(zcta_geometry)) as lon,
        ST_Y(ST_Centroid(zcta_geometry)) as lat,
        hsa,
        hrr
    FROM h3_zcta_map hzm
    LEFT JOIN h3_index hi ON hzm.zcta = hi.zcta
    WHERE hi.h3_r7 IS NULL;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            orphans = pd.DataFrame(result.fetchall(), columns=[
                'zcta', 'area', 'population', 'lon', 'lat', 'hsa', 'hrr'
            ])
            return orphans
    except Exception as e:
        logger.error(f"Error getting orphan ZCTAs: {e}")
        return None

def get_nearby_h3_cells(engine, zcta_lon, zcta_lat, radius_km=5):
    """Get H3 cells within a certain radius of a ZCTA centroid."""
    # Convert radius to H3 resolution 7 cells (approximately)
    # Each H3 resolution 7 cell is about 0.161 km²
    radius_cells = int(radius_km / 0.161)
    
    # Get the H3 cell containing the ZCTA centroid
    center_h3 = h3.geo_to_h3(zcta_lat, zcta_lon, 7)
    
    # Get all H3 cells within the radius
    nearby_cells = h3.k_ring(center_h3, radius_cells)
    
    # Query the database for these cells
    query = """
    SELECT DISTINCT h3_r7, zcta, hsa, hrr
    FROM h3_index
    WHERE h3_r7 = ANY(:cells);
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query), {'cells': list(nearby_cells)})
            return pd.DataFrame(result.fetchall(), columns=['h3_r7', 'zcta', 'hsa', 'hrr'])
    except Exception as e:
        logger.error(f"Error getting nearby H3 cells: {e}")
        return None

def assign_h3_cells_to_orphan(engine, orphan_zcta, nearby_cells):
    """Assign H3 cells to an orphan ZCTA based on spatial proximity and population."""
    if nearby_cells.empty:
        logger.warning(f"No nearby H3 cells found for ZCTA {orphan_zcta['zcta']}")
        return
    
    # Calculate distances between ZCTA centroid and H3 cell centroids
    zcta_point = Point(orphan_zcta['lon'], orphan_zcta['lat'])
    h3_points = []
    
    for h3_cell in nearby_cells['h3_r7']:
        h3_lat, h3_lng = h3.h3_to_geo(h3_cell)
        h3_points.append(Point(h3_lng, h3_lat))
    
    distances = [zcta_point.distance(p) for p in h3_points]
    
    # Calculate scores based on distance and population
    max_distance = max(distances)
    scores = []
    
    for i, distance in enumerate(distances):
        # Normalize distance (closer = higher score)
        distance_score = 1 - (distance / max_distance)
        
        # Combine with population (if available)
        population_score = orphan_zcta['population'] / orphan_zcta['population'].max() if orphan_zcta['population'] > 0 else 0
        
        # Weighted score
        score = 0.7 * distance_score + 0.3 * population_score
        scores.append(score)
    
    # Get the top scoring H3 cells
    top_indices = np.argsort(scores)[-3:]  # Get top 3 cells
    top_cells = nearby_cells.iloc[top_indices]
    
    # Insert the assignments
    insert_query = """
    INSERT INTO h3_index (h3_r7, zcta, hsa, hrr)
    VALUES (:h3_r7, :zcta, :hsa, :hrr)
    ON CONFLICT (h3_r7) DO UPDATE
    SET zcta = :zcta,
        hsa = :hsa,
        hrr = :hrr;
    """
    
    try:
        with engine.connect() as conn:
            for _, cell in top_cells.iterrows():
                conn.execute(text(insert_query), {
                    'h3_r7': cell['h3_r7'],
                    'zcta': orphan_zcta['zcta'],
                    'hsa': orphan_zcta['hsa'],
                    'hrr': orphan_zcta['hrr']
                })
            conn.commit()
            logger.info(f"Assigned {len(top_cells)} H3 cells to ZCTA {orphan_zcta['zcta']}")
    except Exception as e:
        logger.error(f"Error assigning H3 cells: {e}")

def main():
    """Main function to fix orphan ZCTAs."""
    engine = get_db_connection()
    
    # Get orphan ZCTAs
    orphans = get_orphan_zctas(engine)
    
    if orphans is None or orphans.empty:
        logger.info("No orphan ZCTAs found")
        return
    
    logger.info(f"Found {len(orphans)} orphan ZCTAs")
    
    # Process each orphan ZCTA
    for _, orphan in orphans.iterrows():
        logger.info(f"Processing orphan ZCTA: {orphan['zcta']}")
        
        # Get nearby H3 cells
        nearby_cells = get_nearby_h3_cells(engine, orphan['lon'], orphan['lat'])
        
        if nearby_cells is not None and not nearby_cells.empty:
            # Assign H3 cells to the orphan ZCTA
            assign_h3_cells_to_orphan(engine, orphan, nearby_cells)
        else:
            logger.warning(f"No nearby H3 cells found for ZCTA {orphan['zcta']}")
    
    logger.info("Finished processing orphan ZCTAs")

if __name__ == "__main__":
    main() 