const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  password: 'f4e20a07a5490943a2319f267de7d07fccb79008',
  host: 'db.ugtepudnmpvgormpcuje.supabase.co',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('Testing direct PostgreSQL connection...');
  
  try {
    // Test basic connection
    const client = await pool.connect();
    
    try {
      // Query 1: Check current database and user
      console.log('1. Checking database connection:');
      const dbResult = await client.query('SELECT current_database() AS database, current_user AS user');
      console.log(dbResult.rows[0]);
      
      // Query 2: List tables in public schema
      console.log('\n2. Listing tables in public schema:');
      const tablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
        LIMIT 10
      `);
      
      console.log('Tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      
      // Query 3: Check if agency_reference table exists and get some data
      console.log('\n3. Querying agency_reference table:');
      try {
        const agencyResult = await client.query(`
          SELECT ccn, name, city, state 
          FROM agency_reference 
          LIMIT 5
        `);
        
        console.log('Agency data:');
        console.table(agencyResult.rows);
      } catch (err) {
        console.error('Error querying agency_reference:', err.message);
      }
      
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testConnection(); 