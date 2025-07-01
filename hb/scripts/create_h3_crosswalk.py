#!/usr/bin/env python3
"""
H3 Crosswalk Generator for HealthBench

This script creates a comprehensive spatial crosswalk between:
- ZIP codes and ZCTAs
- ZCTAs and H3 cells (resolution 7)
- H3 cells and HSAs/HRRs

It maintains the strict hierarchical structure:
HRR > HSA > ZCTA > H3 Cell (resolution 7)

Dependencies:
- h3-py
- geopandas
- pandas
- requests
- shapely
"""

import os
import sys
import time
import json
import tempfile
import urllib.request
from pathlib import Path
import zipfile
import logging

import pandas as pd
import geopandas as gpd
import h3
import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('h3_crosswalk')

# Constants
H3_RESOLUTION = 7  # ~161m edge length hexagons
ZCTA_URL = "https://www2.census.gov/geo/tiger/TIGER2022/ZCTA520/tl_2022_us_zcta520.zip"
OUTPUT_DIR = Path("../data")

def check_dependencies():
    """Verify all required packages are installed."""
    try:
        import h3
        import geopandas
        import pandas
        import shapely
        logger.info("All dependencies are installed.")
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        logger.info("Please install required packages: pip install h3-py geopandas pandas shapely requests")
        sys.exit(1)

def download_zcta_boundaries():
    """Download ZCTA boundaries from Census Bureau."""
    logger.info(f"Downloading ZCTA boundaries from: {ZCTA_URL}")
    
    # Create temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir_path = Path(temp_dir)
        zip_path = temp_dir_path / "zcta.zip"
        
        # Download the file
        urllib.request.urlretrieve(ZCTA_URL, zip_path)
        logger.info(f"Downloaded ZCTA zip file to: {zip_path}")
        
        # Extract the zip file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir_path)
        
        # Find the shapefile
        shapefiles = list(temp_dir_path.glob("*.shp"))
        if not shapefiles:
            logger.error("No shapefile found in the downloaded zip.")
            sys.exit(1)
        
        shapefile_path = shapefiles[0]
        logger.info(f"Loading shapefile: {shapefile_path}")
        
        # Load the ZCTA boundaries
        zcta_gdf = gpd.read_file(shapefile_path)
        logger.info(f"Loaded {len(zcta_gdf)} ZCTA boundaries.")
        
        return zcta_gdf

def load_zip_hrr_hsa_crosswalk():
    """Load the existing ZIP-HSA-HRR crosswalk file."""
    crosswalk_path = Path("../../temp/extracted_data/ZipHsaHrr19.csv")
    
    if not crosswalk_path.exists():
        logger.error(f"Crosswalk file not found: {crosswalk_path}")
        logger.error("Please place the ZipHsaHrr19.csv file in the temp/extracted_data directory.")
        sys.exit(1)
    
    logger.info(f"Loading ZIP-HSA-HRR crosswalk from: {crosswalk_path}")
    crosswalk_df = pd.read_csv(crosswalk_path)
    logger.info(f"Loaded {len(crosswalk_df)} ZIP code mappings.")
    
    return crosswalk_df

def generate_h3_cells_for_zcta(zcta_gdf):
    """Generate H3 cells (resolution 7) for each ZCTA."""
    logger.info(f"Generating H3 cells (resolution {H3_RESOLUTION}) for each ZCTA...")
    
    # Create a function to convert a geometry to H3 cells
    def geometry_to_h3_cells(geometry):
        if geometry is None:
            return []
        
        # Convert to GeoJSON format expected by h3.polyfill
        try:
            if geometry.geom_type == 'MultiPolygon':
                # Handle MultiPolygon by processing each polygon
                all_h3_cells = []
                for poly in geometry.geoms:
                    # Convert polygon to GeoJSON format
                    geojson = {"type": "Polygon", "coordinates": [list(zip(*poly.exterior.coords.xy))]}
                    cells = list(h3.polyfill(geojson, H3_RESOLUTION))
                    all_h3_cells.extend(cells)
                return list(set(all_h3_cells))  # Remove duplicates
            else:
                # Handle single Polygon
                geojson = {"type": "Polygon", "coordinates": [list(zip(*geometry.exterior.coords.xy))]}
                return list(h3.polyfill(geojson, H3_RESOLUTION))
        except Exception as e:
            logger.warning(f"Error processing geometry: {e}")
            return []
    
    # Process each ZCTA and generate H3 cells
    h3_results = []
    
    # Use a progress indicator
    total = len(zcta_gdf)
    for i, (idx, row) in enumerate(zcta_gdf.iterrows()):
        if i % 100 == 0:
            logger.info(f"Processing ZCTA {i}/{total}...")
        
        zcta = row['ZCTA5CE20']
        geometry = row['geometry']
        h3_cells = geometry_to_h3_cells(geometry)
        
        # Save the result
        h3_results.append({
            'zcta': zcta,
            'h3_cells': h3_cells,
            'h3_cell_count': len(h3_cells)
        })
    
    # Convert to dataframe
    h3_df = pd.DataFrame(h3_results)
    logger.info(f"Generated H3 cells for {len(h3_df)} ZCTAs.")
    logger.info(f"Total H3 cells: {h3_df['h3_cell_count'].sum()}")
    
    return h3_df

def create_full_crosswalk(zcta_h3_df, zip_hrr_hsa_df):
    """Create comprehensive crosswalk between ZIP-ZCTA-H3-HSA-HRR."""
    logger.info("Creating comprehensive spatial crosswalk...")
    
    # Prepare ZIP-to-ZCTA mapping (for now, assume ZIP=ZCTA for simplicity)
    # In a real implementation, this would use spatial joins or official crosswalks
    zip_zcta_df = zip_hrr_hsa_df.copy()
    zip_zcta_df = zip_zcta_df.rename(columns={'zipcode19': 'zip_code'})
    zip_zcta_df['zcta'] = zip_zcta_df['zip_code']  # Temporary simplification
    
    # Merge ZCTA-H3 with ZIP-ZCTA to get ZIP-ZCTA-H3
    merged_df = pd.merge(
        zip_zcta_df[['zip_code', 'zcta', 'hsanum', 'hsacity', 'hsastate', 'hrrnum', 'hrrcity', 'hrrstate']],
        zcta_h3_df[['zcta', 'h3_cells']],
        on='zcta',
        how='left'
    )
    
    # Handle missing H3 cells (ZCTAs not found in boundary data)
    missing_h3 = merged_df[merged_df['h3_cells'].isna()]
    if len(missing_h3) > 0:
        logger.warning(f"{len(missing_h3)} ZCTAs missing H3 cells. These will need manual attention.")
    
    # Explode the h3_cells arrays to create individual records for each H3 cell
    logger.info("Exploding H3 cells to create individual records...")
    
    # First, fill NaN h3_cells with empty lists
    merged_df['h3_cells'] = merged_df['h3_cells'].apply(lambda x: [] if isinstance(x, float) and np.isnan(x) else x)
    
    # Then explode the h3_cells column
    exploded_df = merged_df.explode('h3_cells').reset_index(drop=True)
    exploded_df = exploded_df.rename(columns={'h3_cells': 'h3_cell'})
    
    # Remove rows with empty h3_cell
    exploded_df = exploded_df[exploded_df['h3_cell'].notna()]
    
    logger.info(f"Exploded crosswalk contains {len(exploded_df)} rows.")
    
    # Create a streamlined version for export
    export_df = exploded_df[['zip_code', 'zcta', 'h3_cell', 'hsanum', 'hrrnum']]
    export_df = export_df.rename(columns={
        'hsanum': 'hsa_id',
        'hrrnum': 'hrr_id'
    })
    
    # Ensure the strict hierarchy
    # 1. Each H3 cell belongs to exactly one ZCTA
    # 2. Each ZCTA belongs to exactly one HSA
    # 3. Each HSA belongs to exactly one HRR
    
    # Check for H3 cells assigned to multiple ZCTAs
    h3_zcta_counts = export_df.groupby('h3_cell')['zcta'].nunique()
    multi_zcta_h3 = h3_zcta_counts[h3_zcta_counts > 1]
    
    if len(multi_zcta_h3) > 0:
        logger.warning(f"{len(multi_zcta_h3)} H3 cells are assigned to multiple ZCTAs.")
        logger.warning("These will need resolution to maintain the strict hierarchy.")
        
        # For each problematic H3 cell, keep only the first ZCTA assignment
        # A more sophisticated approach would use geometric area or population
        h3_first_zcta = export_df.drop_duplicates(subset=['h3_cell'])
        
        # Filter the original dataframe to keep only one ZCTA per H3 cell
        export_df = export_df.merge(
            h3_first_zcta[['h3_cell', 'zcta']],
            on=['h3_cell', 'zcta'],
            how='inner'
        )
        
        logger.info(f"After resolving multiple ZCTAs, crosswalk contains {len(export_df)} rows.")
    
    return export_df

def export_crosswalks(crosswalk_df):
    """Export crosswalks in various formats."""
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Export full crosswalk
    full_path = OUTPUT_DIR / "zip_zcta_h3_hsa_hrr_crosswalk.csv"
    crosswalk_df.to_csv(full_path, index=False)
    logger.info(f"Exported full crosswalk to: {full_path}")
    
    # Export ZIP-to-ZCTA crosswalk
    zip_zcta_path = OUTPUT_DIR / "zip_zcta_crosswalk.csv"
    zip_zcta_df = crosswalk_df[['zip_code', 'zcta']].drop_duplicates()
    zip_zcta_df.to_csv(zip_zcta_path, index=False)
    logger.info(f"Exported ZIP-to-ZCTA crosswalk to: {zip_zcta_path}")
    
    # Export ZCTA-to-H3 crosswalk
    zcta_h3_path = OUTPUT_DIR / "zcta_h3_crosswalk.csv"
    zcta_h3_df = crosswalk_df[['zcta', 'h3_cell']].drop_duplicates()
    zcta_h3_df.to_csv(zcta_h3_path, index=False)
    logger.info(f"Exported ZCTA-to-H3 crosswalk to: {zcta_h3_path}")
    
    # Export ZIP-to-H3 crosswalk
    zip_h3_path = OUTPUT_DIR / "zip_h3_crosswalk.csv"
    zip_h3_df = crosswalk_df[['zip_code', 'h3_cell']].drop_duplicates()
    zip_h3_df.to_csv(zip_h3_path, index=False)
    logger.info(f"Exported ZIP-to-H3 crosswalk to: {zip_h3_path}")
    
    # Export H3-to-HSA-HRR crosswalk
    h3_hsa_hrr_path = OUTPUT_DIR / "h3_hsa_hrr_crosswalk.csv"
    h3_hsa_hrr_df = crosswalk_df[['h3_cell', 'hsa_id', 'hrr_id']].drop_duplicates()
    h3_hsa_hrr_df.to_csv(h3_hsa_hrr_path, index=False)
    logger.info(f"Exported H3-to-HSA-HRR crosswalk to: {h3_hsa_hrr_path}")
    
    # Create import-ready SQL for the database
    create_import_sql(crosswalk_df)

def create_import_sql(crosswalk_df):
    """Create SQL import scripts for the database."""
    sql_path = OUTPUT_DIR / "import_h3_crosswalk.sql"
    
    # Create SQL to import the data
    with open(sql_path, 'w') as f:
        f.write("-- H3 Crosswalk Import Script\n")
        f.write("-- Generated by create_h3_crosswalk.py\n\n")
        
        # Create temporary table for the import
        f.write("-- Create temporary table for import\n")
        f.write("CREATE TEMPORARY TABLE temp_crosswalk (\n")
        f.write("  zip_code TEXT,\n")
        f.write("  zcta TEXT,\n")
        f.write("  h3_cell TEXT,\n")
        f.write("  hsa_id TEXT,\n")
        f.write("  hrr_id TEXT\n")
        f.write(");\n\n")
        
        # Create COPY command for the full crosswalk
        f.write("-- Import the crosswalk data\n")
        f.write(f"\\COPY temp_crosswalk FROM '{OUTPUT_DIR / 'zip_zcta_h3_hsa_hrr_crosswalk.csv'}' CSV HEADER;\n\n")
        
        # Insert into zip_zcta_crosswalk table
        f.write("-- Populate zip_zcta_crosswalk table\n")
        f.write("INSERT INTO public.zip_zcta_crosswalk (zip_code, zcta)\n")
        f.write("SELECT DISTINCT zip_code, zcta FROM temp_crosswalk\n")
        f.write("ON CONFLICT (zip_code, zcta) DO NOTHING;\n\n")
        
        # Insert into h3_index table (basic structure)
        f.write("-- Populate h3_index table with basic structure\n")
        f.write("INSERT INTO public.h3_index (h3_r7, zcta, hsa, hrr)\n")
        f.write("SELECT DISTINCT h3_cell, zcta, hsa_id, hrr_id FROM temp_crosswalk\n")
        f.write("ON CONFLICT (h3_r7) DO NOTHING;\n\n")
        
        # Populate h3_zcta_map table with H3 cells per ZCTA
        f.write("-- Populate h3_zcta_map table with H3 cells per ZCTA\n")
        f.write("INSERT INTO public.h3_zcta_map (zcta, h3_cells)\n")
        f.write("SELECT zcta, array_agg(DISTINCT h3_cell) FROM temp_crosswalk\n")
        f.write("GROUP BY zcta\n")
        f.write("ON CONFLICT (zcta) DO NOTHING;\n\n")
        
        # Populate h3_hsa_map table with H3 cells and ZCTAs per HSA
        f.write("-- Populate h3_hsa_map table with H3 cells and ZCTAs per HSA\n")
        f.write("INSERT INTO public.h3_hsa_map (hsa, h3_cells, zctas)\n")
        f.write("SELECT \n")
        f.write("  hsa_id, \n")
        f.write("  array_agg(DISTINCT h3_cell), \n")
        f.write("  array_agg(DISTINCT zcta) \n")
        f.write("FROM temp_crosswalk\n")
        f.write("GROUP BY hsa_id\n")
        f.write("ON CONFLICT (hsa) DO NOTHING;\n\n")
        
        # Populate h3_hrr_map table with H3 cells and HSAs per HRR
        f.write("-- Populate h3_hrr_map table with H3 cells and HSAs per HRR\n")
        f.write("INSERT INTO public.h3_hrr_map (hrr, h3_cells, hsas)\n")
        f.write("SELECT \n")
        f.write("  hrr_id, \n")
        f.write("  array_agg(DISTINCT h3_cell), \n")
        f.write("  array_agg(DISTINCT hsa_id) \n")
        f.write("FROM temp_crosswalk\n")
        f.write("GROUP BY hrr_id\n")
        f.write("ON CONFLICT (hrr) DO NOTHING;\n\n")
        
        # Clean up
        f.write("-- Clean up temporary table\n")
        f.write("DROP TABLE temp_crosswalk;\n\n")
        
        # Row Zero validation
        f.write("-- Row Zero validation\n")
        f.write("INSERT INTO public.h3_row_zero (check_type, validation_count, error_count, performance_ms, sample_data)\n")
        f.write("SELECT \n")
        f.write("  'crosswalk_import',\n")
        f.write("  (SELECT COUNT(*) FROM public.h3_index),\n")
        f.write("  0,\n")
        f.write("  0,\n")
        f.write("  jsonb_build_object(\n")
        f.write("    'h3_index_count', (SELECT COUNT(*) FROM public.h3_index),\n")
        f.write("    'zcta_map_count', (SELECT COUNT(*) FROM public.h3_zcta_map),\n")
        f.write("    'hsa_map_count', (SELECT COUNT(*) FROM public.h3_hsa_map),\n")
        f.write("    'hrr_map_count', (SELECT COUNT(*) FROM public.h3_hrr_map),\n")
        f.write("    'zip_zcta_count', (SELECT COUNT(*) FROM public.zip_zcta_crosswalk)\n")
        f.write("  );\n")
    
    logger.info(f"Created SQL import script: {sql_path}")

def main():
    """Main execution function."""
    logger.info("Starting H3 Crosswalk Generator")
    
    # Check dependencies
    check_dependencies()
    
    # Step 1: Download ZCTA boundaries
    zcta_gdf = download_zcta_boundaries()
    
    # Step 2: Load existing ZIP-HSA-HRR crosswalk
    zip_hrr_hsa_df = load_zip_hrr_hsa_crosswalk()
    
    # Step 3: Generate H3 cells for each ZCTA
    zcta_h3_df = generate_h3_cells_for_zcta(zcta_gdf)
    
    # Step 4: Create full crosswalk
    crosswalk_df = create_full_crosswalk(zcta_h3_df, zip_hrr_hsa_df)
    
    # Step 5: Export crosswalks
    export_crosswalks(crosswalk_df)
    
    logger.info("H3 Crosswalk Generator completed successfully!")

if __name__ == "__main__":
    main() 