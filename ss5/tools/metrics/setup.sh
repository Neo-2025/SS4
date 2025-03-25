#!/bin/bash

# Setup script for metrics collection tools
echo "Setting up metrics collection tools..."

# Install required npm packages
npm install --prefix . fs-extra glob chart.js

echo "Metrics tools setup complete." 