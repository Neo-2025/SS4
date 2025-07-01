#!/usr/bin/env python3
import os
import json
import psycopg2
from datetime import datetime
from pathlib import Path

def connect_to_db():
    """Connect to the database using environment variables or defaults"""
    return psycopg2.connect(
        host="db.ugtepudnmpvgormpcuje.supabase.co",
        port=6543,
        database="postgres",
        user="postgres",
        password="f4e20a07a5490943a2319f267de7d07fccb79008"
    )

def read_sql_file(filename):
    """Read SQL from a file"""
    with open(filename, 'r') as f:
        return f.read()

def generate_markdown_docs(schema_data, output_dir):
    """Generate markdown documentation from schema data"""
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Main schema documentation
    with open(os.path.join(output_dir, 'schema_documentation.md'), 'w') as f:
        f.write(f"# SmartStack v5 Schema Documentation\n\n")
        f.write(f"Generated at: {schema_data['generated_at']}\n\n")
        
        # H3-related objects
        f.write("## H3 and GeoZIP Related Objects\n\n")
        if schema_data.get('h3_related_objects'):
            for obj in schema_data['h3_related_objects']:
                f.write(f"### {obj['name']} ({obj['type']})\n\n")
                f.write("| Column | Type | Nullable | Default |\n")
                f.write("|--------|------|----------|----------|\n")
                for col in obj['columns']:
                    f.write(f"| {col['column']} | {col['type']} | {col['nullable']} | {col['default'] or '-'} |\n")
                f.write("\n")
        
        # Tables
        f.write("## Tables\n\n")
        if schema_data.get('tables'):
            for table in schema_data['tables']:
                f.write(f"### {table['name']}\n\n")
                # Table statistics
                if table.get('statistics'):
                    stats = table['statistics']
                    f.write("**Statistics:**\n")
                    f.write(f"- Estimated rows: {stats['row_estimate']:,}\n")
                    f.write(f"- Total size: {stats['total_size_mb']} MB\n")
                    f.write(f"- Table size: {stats['table_size_mb']} MB\n")
                    f.write(f"- Index size: {stats['index_size_mb']} MB\n\n")
                
                # Columns
                f.write("**Columns:**\n\n")
                f.write("| Column | Type | Nullable | Default |\n")
                f.write("|--------|------|----------|----------|\n")
                for col in table['columns']:
                    f.write(f"| {col['column']} | {col['type']} | {col['nullable']} | {col['default'] or '-'} |\n")
                f.write("\n")
                
                # Foreign keys
                if table.get('foreign_keys'):
                    f.write("**Foreign Keys:**\n\n")
                    f.write("| Column | References |\n")
                    f.write("|--------|------------|\n")
                    for fk in table['foreign_keys']:
                        f.write(f"| {fk['column']} | {fk['foreign_table']}({fk['foreign_column']}) |\n")
                    f.write("\n")
                
                # Indexes
                if table.get('indexes'):
                    f.write("**Indexes:**\n\n")
                    for idx in table['indexes']:
                        f.write(f"- {idx['index_name']}\n")
                        f.write(f"  ```sql\n  {idx['index_def']}\n  ```\n")
                    f.write("\n")
        
        # Views
        f.write("## Views\n\n")
        if schema_data.get('views'):
            for view in schema_data['views']:
                f.write(f"### {view['name']}\n\n")
                f.write("**Columns:**\n\n")
                f.write("| Column | Type | Nullable | Default |\n")
                f.write("|--------|------|----------|----------|\n")
                for col in view['columns']:
                    f.write(f"| {col['column']} | {col['type']} | {col['nullable']} | {col['default'] or '-'} |\n")
                f.write("\n")
                
                f.write("**Definition:**\n```sql\n")
                f.write(view['definition'])
                f.write("\n```\n\n")

def main():
    """Main function to discover schema and generate documentation"""
    try:
        # Connect to database
        conn = connect_to_db()
        cur = conn.cursor()
        
        # Read and execute schema discovery SQL
        sql = read_sql_file('hb/scripts/schema_discovery.sql')
        cur.execute(sql)
        schema_json = cur.fetchone()[0]
        
        # Parse JSON
        schema_data = json.loads(schema_json)
        
        # Generate documentation
        generate_markdown_docs(schema_data, 'kb/docs/schema')
        
        print("Schema documentation generated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main() 