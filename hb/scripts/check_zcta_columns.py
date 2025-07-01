#!/usr/bin/env python3
"""
Script to check column names in temp_zcta_geometries
"""

import psycopg2
import psycopg2.extras

# Database connection details
DB_PARAMS = {
    "host": "db.ugtepudnmpvgormpcuje.supabase.co",
    "port": 6543,
    "database": "postgres",
    "user": "postgres",
    "password": "f4e20a07a5490943a2319f267de7d07fccb79008"
}

def main():
    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_PARAMS)
    
    # Get column names
    print("Getting column names for temp_zcta_geometries...")
    with conn.cursor() as cur:
        cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'temp_zcta_geometries'
        ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()
    
    print("\nColumns in temp_zcta_geometries:")
    print("--------------------------------")
    for col in columns:
        print(f"{col[0]} ({col[1]})")
    
    # Close connection
    conn.close()
    print("\nConnection closed")

if __name__ == "__main__":
    main() 