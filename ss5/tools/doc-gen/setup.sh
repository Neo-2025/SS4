#!/bin/bash

# Setup script for documentation generation tools
echo "Setting up documentation generation tools..."

# Install required npm packages
npm install --prefix . markdown-it fs-extra glob handlebars

echo "Documentation tool setup complete." 