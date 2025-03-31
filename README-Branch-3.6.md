# Branch 3.6: API Integration with Resilience Patterns

This branch implements real API integration with the CMS Provider Data API, along with database persistence and resilience patterns to ensure robust operation even during API failures.

## Key Features

1. **Real API Integration**: 
   - CMS Provider Data API client with proper error handling
   - Structured data mapping between API and application models

2. **Database Persistence**:
   - Supabase database integration for agency data
   - User-specific data isolation with Row Level Security (RLS)
   - API response caching for offline operation

3. **Resilience Patterns**:
   - Circuit Breaker pattern for preventing cascading failures
   - Retry Policy with exponential backoff for transient issues
   - Multi-Layer Fallback with database and static fallbacks
   - Visual indicators for fallback data in the UI

4. **System Monitoring**:
   - `status` command to check system resilience status
   - `reset` command to manually reset the circuit breaker
   - Transparent fallback mode indicators

## Implementation Details

### Database Schema

The implementation includes a database schema with tables for:
- `agencies` - Stores agency data with user ownership
- `agency_groups` - Manages agency grouping (Org, Comp, Target)
- `api_cache` - Caches API responses with expiration

### Environment Variables

The following environment variables are supported:
- `CMS_API_KEY` - API key for the CMS Provider Data API
- `CMS_API_BASE_URL` - Base URL for the API (defaults to "https://data.cms.gov/provider-data/api/1")
- `CIRCUIT_BREAKER_THRESHOLD` - Number of failures before opening the circuit (default: 5)
- `CIRCUIT_BREAKER_RESET_TIMEOUT` - Time in ms before half-open state (default: 30000)
- `RETRY_ATTEMPTS` - Maximum number of retry attempts (default: 3)
- `RETRY_INITIAL_DELAY` - Initial delay in ms before first retry (default: 1000)
- `USE_CBF_MODE` - Force fallback mode for testing (default: false)

### Resilience Factory

The implementation uses a Resilience Factory to make services resilient:

```typescript
// Make a service resilient
const resilientService = ResilienceFactory.makeResilient(
  originalService, 
  ['methodToMakeResilient', 'anotherMethod']
);
```

### Testing

To test the resilience patterns:
1. Set `USE_CBF_MODE=true` to force fallback mode
2. Use the `status` command to check circuit state
3. Look for [FALLBACK DATA] indicators in responses

Run the test script:
```
node scripts/test-agency-service.js
```

## Testing in Preview Environment

### Automated Preview Deployment

The preview environment is automatically deployed through Vercel and Supabase integration when changes are pushed to the `feat/branch-3.6-api-persistence` branch.

### Testing Steps

1. **Access the Preview URL**: 
   - Visit the Vercel preview URL provided in the GitHub PR or deployment notification

2. **Test Resilience Features**:
   - Add an agency using the `add [ccn]` command (e.g., `add 123456`)
   - List agencies with `list agencies` to see them with fallback indicators if applicable
   - Group agencies with `group-as org [ccn]` to test database persistence
   - Check system status with `status` command
   - Force fallback mode by setting `USE_CBF_MODE=true` in environment variables
   - Reset the circuit breaker with `reset` command

3. **Testing API Failure Scenarios**:
   - Force API failures by setting invalid API keys or endpoints
   - Verify fallback indicators appear in the UI ([FALLBACK DATA])
   - Check that the system continues to function with database fallbacks

4. **Verify Database Persistence**:
   - Add agencies and group them
   - Log out and log back in to verify data persists
   - Test with multiple users to verify data isolation

### Environment Variables

The following variables are automatically configured in the Vercel/Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Additional variables for testing resilience features:
- `USE_CBF_MODE=true` - Force circuit breaker into fallback mode
- `CIRCUIT_BREAKER_THRESHOLD=1` - Make circuit break after a single failure
- `RETRY_ATTEMPTS=1` - Reduce retry attempts for faster testing

## Deployment

This branch is ready for review and merging. It follows the SS5-B1 workflow pattern with proper resilience patterns to ensure robust operation even during API failures.

## Vercel Deployment Requirements

For the preview deployment to work correctly, the following steps need to be completed in the Vercel project settings:

### Environment Variables

Set these variables in the Vercel project:

```
CMS_API_KEY=your-cms-api-key
CMS_API_BASE_URL=https://data.cms.gov/provider-data/api/1
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_INITIAL_DELAY=1000
USE_CBF_MODE=false
```

### Database Setup

1. **Manual Setup**:
   - Use the Supabase dashboard to run the SQL script in `scripts/db/db-setup.sql`
   - This will create the necessary tables and policies

2. **Automatic Setup** (if GitHub Actions are configured):
   - The CI/CD pipeline can automatically apply the database migrations
   - Ensure the `SUPABASE_SERVICE_ROLE_KEY` is set in GitHub Secrets

### Vercel Build Configuration

Ensure these settings in the Vercel project:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next` 