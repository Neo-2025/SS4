#!/bin/bash

# Script to test the SS5 CI/CD pipeline functionality
echo "Testing SS5 CI/CD Pipeline..."

# Test pattern validation
echo "Testing pattern validation..."
if [ -f "ss5/scripts/validate-patterns.sh" ]; then
  chmod +x ss5/scripts/validate-patterns.sh
  ./ss5/scripts/validate-patterns.sh
  if [ $? -ne 0 ]; then
    echo "Pattern validation failed. Please fix the issues before committing."
    exit 1
  else
    echo "Pattern validation successful."
  fi
else
  echo "WARNING: Pattern validation script not found. Skipping validation."
fi

# Test documentation generation
echo "Testing documentation generation..."
if [ -d "ss5/tools/doc-gen" ]; then
  cd ss5/tools/doc-gen
  if [ -f "generate-docs.js" ]; then
    chmod +x generate-docs.js
    ./generate-docs.js
    if [ $? -ne 0 ]; then
      echo "Documentation generation failed."
      exit 1
    else
      echo "Documentation generation successful."
    fi
  else
    echo "WARNING: Documentation generation script not found. Skipping."
  fi
  cd - > /dev/null
else
  echo "WARNING: Documentation tools directory not found. Skipping."
fi

# Test metrics collection
echo "Testing metrics collection..."
if [ -d "ss5/tools/metrics" ]; then
  cd ss5/tools/metrics
  if [ -f "pattern-metrics.js" ]; then
    chmod +x pattern-metrics.js
    ./pattern-metrics.js
    if [ $? -ne 0 ]; then
      echo "Metrics collection failed."
      exit 1
    else
      echo "Metrics collection successful."
    fi
  else
    echo "WARNING: Metrics collection script not found. Skipping."
  fi
  cd - > /dev/null
else
  echo "WARNING: Metrics tools directory not found. Skipping."
fi

# Test prompt system
echo "Testing prompt system..."
if [ -f "ss5/tools/prompts/prompt-inject.sh" ]; then
  chmod +x ss5/tools/prompts/prompt-inject.sh
  ./ss5/tools/prompts/prompt-inject.sh --list
  if [ $? -ne 0 ]; then
    echo "Prompt system test failed."
    exit 1
  else
    echo "Prompt system test successful."
  fi
else
  echo "WARNING: Prompt system script not found. Skipping."
fi

echo "CI/CD Pipeline tests completed."
echo "To trigger the actual GitHub Actions pipeline, commit and push your changes." 