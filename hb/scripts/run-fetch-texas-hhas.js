#!/usr/bin/env node

/**
 * Run Script for Texas HHA Data Fetching
 * 
 * This script executes the fetch-texas-hhas.ts script using ts-node
 * To run: node scripts/run-fetch-texas-hhas.js
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.resolve(__dirname, '..');
const scriptPath = path.join(rootDir, 'scripts', 'data-import', 'fetch-texas-hhas.ts');

// Check if the script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Script not found at ${scriptPath}`);
  process.exit(1);
}

console.log('Starting Texas HHA data fetching script...');
console.log(`Script path: ${scriptPath}`);

// Try to use npx ts-node
const result = spawnSync('npx', ['ts-node', scriptPath], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

if (result.error) {
  console.error('Error executing script:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`Script exited with code ${result.status}`);
  process.exit(result.status);
}

console.log('Data fetching script completed successfully!'); 