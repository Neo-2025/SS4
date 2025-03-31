-- Database Setup for HealthBench Branch 3.6
-- Creates tables and RLS policies for agency data persistence

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS on tables
ALTER TABLE IF EXISTS agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agency_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if needed (in correct order due to foreign keys)
DROP TABLE IF EXISTS agency_groups;
DROP TABLE IF EXISTS agencies;
DROP TABLE IF EXISTS api_cache;

-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ccn VARCHAR(6) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  phone VARCHAR(20),
  type VARCHAR(100),
  ownership VARCHAR(100),
  certification_date VARCHAR(50),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_fallback_data BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  
  -- Create unique constraint for ccn per user to avoid duplicates
  UNIQUE(ccn, user_id)
);

-- Create agency groups table
CREATE TABLE IF NOT EXISTS agency_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  group_type VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Create unique constraint to avoid duplicates
  UNIQUE(agency_id, group_type, user_id)
);

-- Create API cache table
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Create unique constraint on cache key
  UNIQUE(cache_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS agencies_ccn_idx ON agencies(ccn);
CREATE INDEX IF NOT EXISTS agencies_user_id_idx ON agencies(user_id);
CREATE INDEX IF NOT EXISTS agency_groups_user_id_idx ON agency_groups(user_id);
CREATE INDEX IF NOT EXISTS agency_groups_group_type_idx ON agency_groups(group_type);
CREATE INDEX IF NOT EXISTS api_cache_expires_at_idx ON api_cache(expires_at);

-- Set up RLS policies for agencies
DROP POLICY IF EXISTS agencies_user_isolation ON agencies;
CREATE POLICY agencies_user_isolation ON agencies
  FOR ALL USING (auth.uid() = user_id);

-- Set up RLS policies for agency groups
DROP POLICY IF EXISTS agency_groups_user_isolation ON agency_groups;
CREATE POLICY agency_groups_user_isolation ON agency_groups
  FOR ALL USING (auth.uid() = user_id);

-- Set up RLS policies for API cache (global access, managed by expiration)
DROP POLICY IF EXISTS api_cache_global_read ON api_cache;
CREATE POLICY api_cache_global_read ON api_cache
  FOR SELECT USING (true);

-- Enable RLS on tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Insert sample agency data for testing
INSERT INTO agencies (ccn, name, address, city, state, zip, phone, type, ownership, certification_date, is_fallback_data, user_id)
VALUES 
('123456', 'Sample Agency 1', '123 Main St', 'Anytown', 'CA', '90210', '555-1234', 'HHA', 'Private', '2023-01-01', false, auth.uid())
ON CONFLICT (ccn, user_id) DO NOTHING; 