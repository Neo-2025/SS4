#!/bin/bash

# Script to fix pattern file formats
echo "Fixing pattern file formats..."

# Find all pattern files excluding templates
pattern_files=$(find ss5/patterns -name "*.md" -not -name "_template*.md")

for file in $pattern_files; do
  echo "Processing $file..."
  
  # Get current status and classification values with better whitespace handling
  # Get the line, strip the header prefix, strip checkmarks, then trim whitespace
  status_line=$(grep -E "^## Status" "$file" || echo "")
  classification_line=$(grep -E "^## Classification" "$file" || echo "")
  
  if [ -n "$status_line" ]; then
    status=$(echo "$status_line" | sed -E 's/^## Status:?//' | sed -E 's/[✓✅]//' | tr -d '\r\n' | xargs)
  else
    status="Draft"  # Default to Draft if missing
  fi
  
  if [ -n "$classification_line" ]; then
    classification=$(echo "$classification_line" | sed -E 's/^## Classification:?//' | tr -d '\r\n' | xargs)
  else
    # Try to guess from directory name
    dir_name=$(dirname "$file" | xargs basename)
    classification="$dir_name"
    # Capitalize first letter
    classification="$(tr '[:lower:]' '[:upper:]' <<< ${classification:0:1})${classification:1}"
  fi
  
  # Skip if already in correct format (has a colon followed immediately by non-whitespace)
  if grep -q "^## Status: [A-Za-z]" "$file" && grep -q "^## Classification: [A-Za-z]" "$file"; then
    echo "  Already in correct format. Skipping."
    continue
  fi
  
  # Fix the file
  sed -i -E 's/^# Pattern: (.+)$/# \1/' "$file"
  
  # If status line exists, replace it correctly, otherwise add it
  if [ -n "$status_line" ]; then
    sed -i -E "s/^## Status.*$/## Status: $status/" "$file"
  else
    # Add status line after title
    sed -i -E "/^# /a ## Status: $status" "$file"
  fi
  
  # If classification line exists, replace it, otherwise add it
  if [ -n "$classification_line" ]; then
    sed -i -E "s/^## Classification.*$/## Classification: $classification/" "$file"
  else
    # Add classification line after status
    sed -i -E "/^## Status/a ## Classification: $classification" "$file"
  fi
  
  echo "  Fixed format for $file (Status: $status, Classification: $classification)"
done

echo "Pattern format fixing complete." 