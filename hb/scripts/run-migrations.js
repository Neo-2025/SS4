#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * This script runs all migrations in the app/lib/migrations directory
 * Usage: node scripts/run-migrations.js
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.resolve(__dirname, '..');
const migrationsDir = path.join(rootDir, 'app', 'lib', 'migrations');

console.log('Starting Supabase migrations...');

// Create temporary TypeScript file that uses require syntax
const tempRunnerPath = path.join(__dirname, 'temp-migration-runner.ts');
const runnerCode = `
// Using CommonJS style for compatibility
const { runMigration } = require('../app/lib/migrations/01-create-agency-tables');

async function runMigrations() {
  console.log('Running all migrations...');
  
  // Run migrations in sequence
  console.log('Running: 01-create-agency-tables');
  const success = await runMigration();
  
  if (!success) {
    console.error('Migration failed');
    process.exit(1);
  }
  
  console.log('All migrations completed successfully!');
}

runMigrations().catch(err => {
  console.error('Migration process failed:', err);
  process.exit(1);
});
`;

try {
  // Write the temporary runner
  fs.writeFileSync(tempRunnerPath, runnerCode);
  
  // Execute the runner with ts-node
  console.log('Executing migrations with ts-node...');
  const result = spawnSync('npx', ['ts-node', tempRunnerPath], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });
  
  if (result.error) {
    console.error('Error executing migrations:', result.error);
    process.exit(1);
  }
  
  if (result.status !== 0) {
    console.error(`Migrations exited with code ${result.status}`);
    process.exit(result.status);
  }
  
  console.log('Migration process completed successfully!');
} finally {
  // Clean up temp file
  if (fs.existsSync(tempRunnerPath)) {
    fs.unlinkSync(tempRunnerPath);
  }
} 