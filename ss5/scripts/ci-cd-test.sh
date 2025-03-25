#!/bin/bash

# SS5 CI/CD Test Script
# Run this script to verify that all CI/CD components are working

set -e  # Exit on any error

echo "=== Testing SS5 CI/CD System ==="

# Check directory structure
echo "Checking directory structure..."
for dir in .github/workflows ss5/scripts ss5/tools/doc-gen ss5/tools/metrics ss5/patterns ss5/chains ss5/tools/prompts; do
  if [ ! -d "$dir" ]; then
    echo "ERROR: Directory $dir not found"
    exit 1
  else
    echo "✓ Directory $dir exists"
  fi
done

# Check workflow files
echo "Checking workflow files..."
for file in .github/workflows/ss5-pipeline.yml .github/workflows/ss5-documentation.yml .github/workflows/ss5-metrics-report.yml; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Workflow file $file not found"
    exit 1
  else
    echo "✓ Workflow file $file exists"
  fi
done

# Check script files
echo "Checking script files..."
for file in ss5/scripts/validate-patterns.sh; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Script file $file not found"
    exit 1
  elif [ ! -x "$file" ]; then
    echo "ERROR: Script file $file is not executable"
    exit 1
  else
    echo "✓ Script file $file exists and is executable"
  fi
done

# Test pattern validation
echo "Testing pattern validation..."
if ./ss5/scripts/validate-patterns.sh; then
  echo "✓ Pattern validation successful"
else
  echo "ERROR: Pattern validation failed"
  exit 1
fi

# Test documentation generation if Node.js is available
if command -v node &> /dev/null; then
  echo "Testing documentation generation..."
  if [ -f "ss5/tools/doc-gen/generate-docs.js" ]; then
    mkdir -p ss5/tools/doc-gen/templates
    
    # Install required packages
    npm install --prefix ss5/tools/doc-gen fs-extra glob markdown-it
    
    # Run documentation generation
    node ss5/tools/doc-gen/generate-docs.js
    echo "✓ Documentation generation successful"
  else
    echo "WARNING: Documentation generator not found"
  fi
else
  echo "WARNING: Node.js not found, skipping documentation test"
fi

# Test prompt system
echo "Testing prompt system..."
if [ -f "ss5/tools/prompts/prompt-inject.sh" ] && [ -x "ss5/tools/prompts/prompt-inject.sh" ]; then
  ./ss5/tools/prompts/prompt-inject.sh
  echo "✓ Prompt system test successful"
else
  echo "WARNING: Prompt system not found or not executable"
fi

echo "=== SS5 CI/CD System Test Complete ==="
echo "All critical components are working correctly!" 
echo "To trigger the actual GitHub Actions pipeline, commit and push your changes." 