#!/usr/bin/env python3
"""
Load H3 Extension into Supabase Database

This script connects to the Supabase database and loads the H3 extension.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('h3_extension_loader')

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

def load_h3_extension(engine):
    """Load the H3 extension into the database."""
    logger.info("Loading H3 extension...")
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS h3;"))
            conn.commit()
            logger.info("H3 extension loaded successfully.")
    except Exception as e:
        logger.error(f"Error loading H3 extension: {e}")
        return False
    return True

if __name__ == "__main__":
    engine = get_db_connection()
    load_h3_extension(engine) 