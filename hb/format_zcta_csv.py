#!/usr/bin/env python3
import csv
import os
import glob

def format_csv_file(input_file, output_file):
    print(f"Processing {input_file}...")
    
    with open(input_file, 'r') as infile:
        # Read the entire file content
        content = infile.read()
        
        # Split into lines
        lines = content.split('\n')
        if not lines[-1]:  # Remove empty last line if exists
            lines = lines[:-1]
            
        # Process each line
        formatted_lines = []
        for i, line in enumerate(lines):
            if i == 0:  # Header line
                formatted_lines.append(line)
                continue
                
            # Find the end of the WKT part (closing parenthesis of the polygon)
            wkt_end = line.rfind('"))')
            if wkt_end == -1:  # Try without quotes
                wkt_end = line.rfind('))')
                if wkt_end == -1:
                    print(f"Warning: Could not find WKT end in line {i+1}")
                    continue
                wkt_end += 2
            else:
                wkt_end += 3
                
            # Split the line into WKT and rest
            wkt_part = line[:wkt_end]
            rest_part = line[wkt_end:]
            
            # Remove any existing quotes around WKT
            wkt_part = wkt_part.strip('"')
            
            # Split the rest into fields
            rest_fields = rest_part.strip(',').split(',')
            
            # Combine with proper quoting
            formatted_line = f'"{wkt_part}",{",".join(rest_fields)}'
            formatted_lines.append(formatted_line)
    
    # Write the formatted content
    with open(output_file, 'w', newline='') as outfile:
        outfile.write('\n'.join(formatted_lines))
    
    print(f"Created formatted file: {output_file}")

def main():
    base_dir = '../temp/extracted_data/zcta_boundaries'
    
    # Process all part files
    for i in range(1, 14):
        input_file = os.path.join(base_dir, f'zcta_part{i}.csv')
        output_file = os.path.join(base_dir, f'zcta_part{i}_formatted.csv')
        
        if os.path.exists(input_file):
            format_csv_file(input_file, output_file)
        else:
            print(f"Warning: Could not find {input_file}")

if __name__ == '__main__':
    main()
