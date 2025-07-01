// Jest setup file
// Add any global configuration or mocks needed for tests

// Mock environment variables that are usually loaded from .env.local
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-supabase-anon-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_NAME = 'HealthBench CLI';
process.env.NEXT_PUBLIC_ENABLE_AUTH = 'true';

// Import any additional test libraries or setup here, such as:
// require('@testing-library/jest-dom');

// This will be used if we add React Testing Library in the future 