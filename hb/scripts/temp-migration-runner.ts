
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
