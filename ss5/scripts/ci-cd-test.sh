#!/bin/bash

# SS5 CI/CD Test Script
# Run this script to verify that all CI/CD components are working

set -e  # Exit on any error

# Use absolute paths based on script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== Testing SS5 CI/CD System ==="

# Check directory structure
echo "Checking directory structure..."
for dir in "$REPO_ROOT/.github/workflows" "$REPO_ROOT/ss5/scripts" "$REPO_ROOT/ss5/tools/doc-gen" "$REPO_ROOT/ss5/tools/metrics" "$REPO_ROOT/ss5/patterns" "$REPO_ROOT/ss5/chains" "$REPO_ROOT/ss5/tools/prompts"; do
  if [ ! -d "$dir" ]; then
    echo "ERROR: Directory ${dir#$REPO_ROOT/} not found"
    exit 1
  else
    echo "✓ Directory ${dir#$REPO_ROOT/} exists"
  fi
done

# Check workflow files
echo "Checking workflow files..."
for file in "$REPO_ROOT/.github/workflows/ss5-pipeline.yml" "$REPO_ROOT/.github/workflows/ss5-documentation.yml" "$REPO_ROOT/.github/workflows/ss5-metrics-report.yml"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Workflow file ${file#$REPO_ROOT/} not found"
    exit 1
  else
    echo "✓ Workflow file ${file#$REPO_ROOT/} exists"
  fi
done

# Check script files
echo "Checking script files..."
for file in "$REPO_ROOT/ss5/scripts/validate-patterns.sh"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Script file ${file#$REPO_ROOT/} not found"
    exit 1
  elif [ ! -x "$file" ]; then
    echo "ERROR: Script file ${file#$REPO_ROOT/} is not executable"
    exit 1
  else
    echo "✓ Script file ${file#$REPO_ROOT/} exists and is executable"
  fi
done

# Test pattern validation
echo "Testing pattern validation..."
if "$REPO_ROOT/ss5/scripts/validate-patterns.sh"; then
  echo "✓ Pattern validation successful"
else
  echo "ERROR: Pattern validation failed"
  exit 1
fi

# Test documentation generation if Node.js is available
if command -v node &> /dev/null; then
  echo "Testing documentation generation..."
  if [ -f "$REPO_ROOT/ss5/tools/doc-gen/generate-docs.js" ]; then
    mkdir -p "$REPO_ROOT/ss5/tools/doc-gen/templates"
    
    # Install required packages
    npm install --prefix "$REPO_ROOT/ss5/tools/doc-gen" fs-extra glob markdown-it
    
    # Run documentation generation
    node "$REPO_ROOT/ss5/tools/doc-gen/generate-docs.js"
    echo "✓ Documentation generation successful"
  else
    echo "WARNING: Documentation generator not found"
  fi
else
  echo "WARNING: Node.js not found, skipping documentation test"
fi

# Test prompt system
echo "Testing prompt system..."
if [ -f "$REPO_ROOT/ss5/tools/prompts/prompt-inject.sh" ] && [ -x "$REPO_ROOT/ss5/tools/prompts/prompt-inject.sh" ]; then
  "$REPO_ROOT/ss5/tools/prompts/prompt-inject.sh"
  echo "✓ Prompt system test successful"
else
  echo "WARNING: Prompt system not found or not executable"
fi

echo "=== SS5 CI/CD System Test Complete ==="
echo "All critical components are working correctly!" 
echo "To trigger the actual GitHub Actions pipeline, commit and push your changes." 