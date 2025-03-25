#!/bin/bash

# Script to test the SS5 CI/CD pipeline locally
# Simulates GitHub Actions workflow execution

echo "Testing SS5 CI/CD pipeline locally..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Test pattern validation
echo "Testing pattern validation..."
$REPO_ROOT/ss5/scripts/validate-patterns.sh
if [ $? -ne 0 ]; then
  echo "ERROR: Pattern validation failed"
  exit 1
fi
echo "Pattern validation passed"

# Test documentation generation
echo "Testing documentation generation..."
cd $REPO_ROOT/ss5/tools/doc-gen
if [ -f "./setup.sh" ]; then
  ./setup.sh
  if [ $? -ne 0 ]; then
    echo "ERROR: Documentation setup failed"
    exit 1
  fi
  
  ./generate-docs.js
  if [ $? -ne 0 ]; then
    echo "ERROR: Documentation generation failed"
    exit 1
  fi
else
  echo "SKIPPED: Documentation tools not found"
fi

# Test metrics generation
echo "Testing metrics generation..."
cd $REPO_ROOT/ss5/tools/metrics
if [ -f "./setup.sh" ]; then
  ./setup.sh
  if [ $? -ne 0 ]; then
    echo "ERROR: Metrics setup failed"
    exit 1
  fi
  
  if [ -f "./pattern-metrics.js" ]; then
    ./pattern-metrics.js
    if [ $? -ne 0 ]; then
      echo "ERROR: Metrics generation failed"
      exit 1
    fi
  fi
  
  if [ -f "./metrics-dashboard.js" ]; then
    ./metrics-dashboard.js
    if [ $? -ne 0 ]; then
      echo "ERROR: Dashboard generation failed"
      exit 1
    fi
  fi
else
  echo "SKIPPED: Metrics tools not found"
fi

echo "CI/CD pipeline test completed successfully!"
exit 0
