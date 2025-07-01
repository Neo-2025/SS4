const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with the provided credentials
const supabase = createClient(
  'https://ugtepudnmpvgormpcuje.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndGVwdWRubXB2Z29ybXBjdWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzOTU1MDMsImV4cCI6MjAzMTk3MTUwM30.yvMckLm3NjHyT2AucUBN4EJl1aDz-VkN_2SHsLGDVEY',
  { 
    db: { 
      schema: 'public' 
    }
  }
);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Query the agency_reference table
    const { data: agencyData, error: agencyError } = await supabase
      .from('agency_reference')
      .select('ccn, name')
      .limit(5);
    
    if (agencyError) {
      console.error('Error querying agency_reference:', agencyError);
    } else {
      console.log('Agency data:', agencyData);
    }
    
    // Check available tables
    const { data: tableData, error: tableError } = await supabase
      .rpc('get_tables');
      
    if (tableError) {
      console.error('Error getting tables:', tableError);
      
      // Try another approach to get tables
      console.log('Trying alternate approach...');
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (error) {
        console.error('Error with alternate approach:', error);
      } else {
        console.log('Available tables:', data);
      }
    } else {
      console.log('Available tables:', tableData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection(); 