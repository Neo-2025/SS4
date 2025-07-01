#!/usr/bin/env python3
import os
import json
import requests
from dotenv import load_dotenv
import sys
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Error: Missing Supabase credentials")
    sys.exit(1)

def create_table():
    """Create the ZCTA geometries table"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # SQL to create table
    sql = """
    DROP TABLE IF EXISTS zcta_pipline_geometries CASCADE;
    
    CREATE TABLE zcta_pipline_geometries (
        id SERIAL PRIMARY KEY,
        geom geometry(MultiPolygon, 4326),
        zcta5ce20 VARCHAR(5) NOT NULL,
        geoid20 VARCHAR(7) NOT NULL,
        classfp20 VARCHAR(2),
        mtfcc20 VARCHAR(5),
        funcstat20 VARCHAR(1),
        aland20 NUMERIC,
        awater20 NUMERIC,
        intptlat20 NUMERIC(9,7),
        intptlon20 NUMERIC(10,7)
    );
    
    CREATE INDEX idx_zcta_pipline_geometries_zcta5ce20 
    ON zcta_pipline_geometries(zcta5ce20);
    """
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec",
        headers=headers,
        json={"command": sql}
    )
    
    if response.status_code != 200:
        print(f"Error creating table: {response.text}")
        sys.exit(1)
    
    print("Table created successfully")

def process_geojson(file_path, batch_size=100):
    """Process GeoJSON file in batches"""
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    features = data['features']
    total_features = len(features)
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # Process in batches with progress bar
    for i in tqdm(range(0, total_features, batch_size)):
        batch = features[i:i + batch_size]
        rows = []
        
        for feature in batch:
            props = feature['properties']
            geom = feature['geometry']
            
            row = {
                'geom': json.dumps(geom),
                'zcta5ce20': props['ZCTA5CE20'],
                'geoid20': props['GEOID20'],
                'classfp20': props['CLASSFP20'],
                'mtfcc20': props['MTFCC20'],
                'funcstat20': props['FUNCSTAT20'],
                'aland20': float(props['ALAND20']),
                'awater20': float(props['AWATER20']),
                'intptlat20': float(props['INTPTLAT20']),
                'intptlon20': float(props['INTPTLON20'])
            }
            rows.append(row)
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/zcta_pipline_geometries",
            headers=headers,
            json=rows
        )
        
        if response.status_code != 201:
            print(f"Error inserting batch: {response.text}")
            continue

def main():
    geojson_path = 'temp/extracted_data/zcta_boundaries/zcta_boundaries.geojson'
    
    print("Creating table...")
    create_table()
    
    print("\nProcessing GeoJSON file...")
    process_geojson(geojson_path)
    
    print("\nImport completed!")

if __name__ == "__main__":
    main() 