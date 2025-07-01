#!/usr/bin/env python3
"""
H3 Mapping Fixer

This script runs a complete fix of the H3 cell mapping system by:
1. Validating and fixing H3 cell deduplication
2. Identifying and fixing orphan ZCTAs
3. Validating the final state

It ensures that:
- Each H3 cell is assigned to exactly one ZCTA
- Each ZCTA has at least one H3 cell
- The hierarchical structure (HRR > HSA > ZCTA > H3) is maintained
"""

import os
import sys
import logging
import subprocess
import traceback
from pathlib import Path

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more detailed output
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('h3_mapping_fixer')

# Database connection details
DB_CONFIG = {
    'host': 'db.ugtepudnmpvgormpcuje.supabase.co',
    'port': '6543',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'f4e20a07a5490943a2319f267de7d07fccb79008'
}

def check_dependencies():
    """Check if all required Python packages are installed."""
    required_packages = [
        'sqlalchemy',
        'psycopg2',
        'pandas',
        'numpy',
        'h3',
        'shapely',
        'scipy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.error("Please install them using: pip3 install " + " ".join(missing_packages))
        return False
    return True

def test_db_connection():
    """Test database connection before running scripts."""
    try:
        from sqlalchemy import create_engine, text
        db_url = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        logger.error("Please check your database configuration and network connection")
        return False

def run_script(script_name):
    """Run a Python script and return its exit code."""
    script_path = Path(__file__).parent / script_name
    logger.info(f"Running {script_name}...")
    
    if not script_path.exists():
        logger.error(f"Script not found: {script_path}")
        return False
    
    try:
        # Use python3 explicitly and capture both stdout and stderr
        result = subprocess.run(
            ['python3', str(script_path)],
            check=True,
            capture_output=True,
            text=True,
            env={
                **os.environ,
                'DATABASE_URL': f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
                'PYTHONUNBUFFERED': '1'  # Ensure Python output is not buffered
            }
        )
        
        # Log the output
        if result.stdout:
            logger.info(f"Script output:\n{result.stdout}")
        if result.stderr:
            logger.warning(f"Script warnings/errors:\n{result.stderr}")
            
        logger.info(f"{script_name} completed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running {script_name}:")
        logger.error(f"Exit code: {e.returncode}")
        if e.stdout:
            logger.error(f"Output:\n{e.stdout}")
        if e.stderr:
            logger.error(f"Error output:\n{e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error running {script_name}:")
        logger.error(traceback.format_exc())
        return False

def validate_final_state():
    """Validate the final state of the H3 mapping system."""
    logger.info("Validating final state...")
    
    # Check for any remaining duplicates
    if not run_script("validate_h3_deduplication.py"):
        logger.error("Validation failed: Found remaining duplicates")
        return False
    
    # Check for any remaining orphan ZCTAs
    if not run_script("fix_orphan_zctas.py"):
        logger.error("Validation failed: Found remaining orphan ZCTAs")
        return False
    
    logger.info("Final state validation completed successfully")
    return True

def main():
    """Main function to run the complete H3 mapping fix process."""
    logger.info("Starting H3 mapping fix process")
    
    # Check dependencies first
    if not check_dependencies():
        logger.error("Missing required dependencies")
        return False
    
    # Test database connection
    if not test_db_connection():
        logger.error("Database connection test failed")
        return False
    
    # Step 1: Fix H3 cell deduplication
    if not run_script("validate_h3_deduplication.py"):
        logger.error("Failed to fix H3 cell deduplication")
        return False
    
    # Step 2: Fix orphan ZCTAs
    if not run_script("fix_orphan_zctas.py"):
        logger.error("Failed to fix orphan ZCTAs")
        return False
    
    # Step 3: Validate final state
    if not validate_final_state():
        logger.error("Final state validation failed")
        return False
    
    logger.info("H3 mapping fix process completed successfully")
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        logger.error("Unexpected error in main process:")
        logger.error(traceback.format_exc())
        sys.exit(1) 