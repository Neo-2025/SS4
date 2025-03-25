#!/bin/bash

# Script to validate SS5 pattern files
# Checks for required sections and proper formatting

echo "Validating SS5 pattern files..."
# Use absolute path based on script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PATTERN_DIR="$REPO_ROOT/ss5/patterns"
EXIT_CODE=0

# Required pattern sections
REQUIRED_SECTIONS=("# " "## Status:" "## Classification:" "## Problem" "## Solution")

# Check each pattern file
for file in $(find $PATTERN_DIR -name "*.md"); do
  echo "Checking $file..."
  
  # Skip template file
  if [[ $file == *"_template.md" ]]; then
    echo "Skipping template file"
    continue
  fi
  
  # Check for required sections
  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "$section" "$file"; then
      echo "ERROR: Missing section '$section' in $file"
      EXIT_CODE=1
    fi
  done
  
  # Validate status values
  STATUS=$(grep -E "^## Status:" "$file" | sed 's/^## Status:\s*//')
  if [[ ! "$STATUS" =~ ^(Draft|Candidate|Validated|Adaptive|Core)$ ]]; then
    echo "ERROR: Invalid status '$STATUS' in $file. Must be one of: Draft, Candidate, Validated, Adaptive, Core"
    EXIT_CODE=1
  fi
  
  echo "Completed check for $file"
done

echo "Pattern validation complete."
exit $EXIT_CODE 