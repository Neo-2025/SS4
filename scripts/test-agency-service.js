/**
 * Test Agency Service Integration
 * 
 * This script validates the AgencyService implementation with:
 * - API integration
 * - Database persistence
 * - Resilience patterns
 * 
 * Usage: 
 * 1. Configure environment variables
 * 2. Run with Node.js: node scripts/test-agency-service.js
 */

// Mock environment for testing
process.env.CMS_API_KEY = process.env.CMS_API_KEY || 'test-api-key';
process.env.CMS_API_BASE_URL = process.env.CMS_API_BASE_URL || 'https://data.cms.gov/provider-data/api/1';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// Import dependencies
const { AgencyService } = require('../app/lib/services/agency');
const { ResilienceService } = require('../app/lib/api/resilience/resilienceService');

// Create a test agency service
const agencyService = new AgencyService();

// Test CCNs (use valid CCNs for your environment)
const TEST_CCN = '123456';
const TEST_GROUP_TYPE = 'Org';

// Color helpers for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test logger
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  
  switch (type) {
    case 'success':
      console.log(`${colors.green}[${timestamp}] ✓ ${message}${colors.reset}`);
      break;
    case 'error':
      console.error(`${colors.red}[${timestamp}] ✗ ${message}${colors.reset}`);
      break;
    case 'warning':
      console.warn(`${colors.yellow}[${timestamp}] ⚠ ${message}${colors.reset}`);
      break;
    case 'info':
    default:
      console.log(`${colors.blue}[${timestamp}] ℹ ${message}${colors.reset}`);
      break;
  }
}

// Test runner
async function runTests() {
  log('Starting Agency Service integration tests...', 'info');
  
  // Test 1: Check resilience status
  try {
    const status = agencyService.getResilienceStatus();
    log(`Resilience status: Circuit is ${status.circuitState}`, 'info');
    log('Test 1: Get resilience status - PASSED', 'success');
  } catch (error) {
    log(`Test 1: Get resilience status - FAILED: ${error.message}`, 'error');
  }
  
  // Test 2: Add agency
  try {
    const agency = await agencyService.addAgency(TEST_CCN);
    log(`Added agency: ${agency.name} (${agency.ccn})`, 'info');
    log(`Fallback data: ${agency.isFallbackData ? 'Yes' : 'No'}`, agency.isFallbackData ? 'warning' : 'info');
    log('Test 2: Add agency - PASSED', 'success');
  } catch (error) {
    log(`Test 2: Add agency - FAILED: ${error.message}`, 'error');
  }
  
  // Test 3: Group agency
  try {
    const result = await agencyService.groupAgency(TEST_CCN, TEST_GROUP_TYPE);
    if (result) {
      log(`Grouped agency ${TEST_CCN} as ${TEST_GROUP_TYPE}`, 'info');
      log('Test 3: Group agency - PASSED', 'success');
    } else {
      log(`Failed to group agency ${TEST_CCN}`, 'warning');
      log('Test 3: Group agency - FAILED', 'error');
    }
  } catch (error) {
    log(`Test 3: Group agency - FAILED: ${error.message}`, 'error');
  }
  
  // Test 4: List agencies
  try {
    const agencies = await agencyService.listAgencies();
    log(`Found ${agencies.length} agencies`, 'info');
    agencies.forEach(agency => {
      log(`- ${agency.name} (${agency.ccn})${agency.isFallbackData ? ' [FALLBACK]' : ''}`, 'info');
    });
    log('Test 4: List agencies - PASSED', 'success');
  } catch (error) {
    log(`Test 4: List agencies - FAILED: ${error.message}`, 'error');
  }
  
  // Test 5: Get agencies by group
  try {
    const groupedAgencies = await agencyService.getAgenciesByType(TEST_GROUP_TYPE);
    log(`Found ${groupedAgencies.length} agencies in group ${TEST_GROUP_TYPE}`, 'info');
    groupedAgencies.forEach(agency => {
      log(`- ${agency.name} (${agency.ccn})`, 'info');
    });
    log('Test 5: Get agencies by group - PASSED', 'success');
  } catch (error) {
    log(`Test 5: Get agencies by group - FAILED: ${error.message}`, 'error');
  }
  
  // Test 6: Reset circuit breaker
  try {
    agencyService.resetCircuitBreaker();
    const status = agencyService.getResilienceStatus();
    log(`Circuit breaker reset. New state: ${status.circuitState}`, 'info');
    log('Test 6: Reset circuit breaker - PASSED', 'success');
  } catch (error) {
    log(`Test 6: Reset circuit breaker - FAILED: ${error.message}`, 'error');
  }
  
  log('All tests completed.', 'info');
}

// Run tests
log('Test script initialized', 'info');
runTests().catch(error => {
  log(`Unhandled error in test suite: ${error.message}`, 'error');
  console.error(error);
}); 