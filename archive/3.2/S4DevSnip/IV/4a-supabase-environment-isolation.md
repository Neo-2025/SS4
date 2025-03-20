# Supabase Environment Isolation Mechanism

## Overview
This snippet details how Supabase implements environment isolation across different branches, ensuring secure and efficient development environments for microSaaS applications.

## Prerequisites
- Supabase project with branch-first workflow enabled
- Vercel project integration
- Access to Supabase Dashboard
- Understanding of environment variables

## Installation Steps

### 1. Enable Branch Isolation
```bash
# Configure branch isolation settings
supabase config set branch.isolation.enabled true

# Set auto-pause timeout (in minutes)
supabase config set branch.auto_pause_timeout 5
```

### 2. Configure Persistent Branches
```bash
# Create persistent branch for performance testing
supabase branch create perf-test --persistent

# List branch configurations
supabase branch list
```

## Configuration Details

### 1. Database Isolation
```sql
-- Each branch gets unique connection string
-- Format: postgresql://postgres:[password]@db.[branch-ref].supabase.co:5432/postgres
-- Example:
CREATE DATABASE branch_feat_auth;
```

### 2. API Layer Configuration
```toml
# Branch-specific config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

# Branch-specific keys
[api.keys]
anon = "branch-specific-anon-key"
service_role = "branch-specific-service-key"
```

### 3. Environment Variables
```bash
# Branch-specific environment variables
NEXT_PUBLIC_SUPABASE_URL=https://[branch-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[branch-specific-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[branch-specific-service-key]
```

## Verification Steps

1. **Check Branch Isolation**
```bash
# Verify branch configuration
supabase branch show [branch-name]

# Check database connection
psql "postgresql://postgres:[password]@db.[branch-ref].supabase.co:5432/postgres"
```

2. **Test API Access**
```bash
# Test with branch-specific credentials
curl -X GET 'https://[branch-ref].supabase.co/rest/v1/your_table' \
  -H "apikey: [branch-specific-anon-key]"
```

3. **Verify Data Seeding**
```sql
-- Check seeded data
SELECT COUNT(*) FROM your_table;
```

## Performance Considerations

### 1. Cold Start Handling
```typescript
// src/lib/db.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 2. Persistent Branch Configuration
```yaml
# .github/workflows/persistent-branch.yml
name: Persistent Branch Setup
on:
  workflow_dispatch:
    inputs:
      branch_name:
        description: 'Branch name'
        required: true
      persistent:
        description: 'Make branch persistent'
        default: false

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - name: Configure Branch
        run: |
          if [ "${{ github.event.inputs.persistent }}" = "true" ]; then
            supabase branch create ${{ github.event.inputs.branch_name }} --persistent
          else
            supabase branch create ${{ github.event.inputs.branch_name }}
          fi
```

## Troubleshooting Tips

1. **Cold Start Issues**
   - Implement retry logic
   - Use connection pooling
   - Consider persistent branches
   - Monitor latency metrics

2. **Data Seeding Problems**
   - Verify seed.sql syntax
   - Check foreign key constraints
   - Review data dependencies
   - Test seed file locally

3. **Connection Issues**
   - Verify branch status
   - Check credentials
   - Review network access
   - Test connection string

## Common Issues and Solutions

1. **High Latency on First Request**
   - Implement retry mechanism
   - Use persistent branches
   - Optimize connection pooling
   - Cache frequently accessed data

2. **Data Inconsistency**
   - Review seed.sql
   - Check foreign keys
   - Verify constraints
   - Test data integrity

3. **Branch Creation Failures**
   - Check project limits
   - Verify permissions
   - Review error logs
   - Clean up unused branches

## Best Practices

1. **Performance Optimization**
   - Use persistent branches for critical paths
   - Implement retry logic
   - Optimize database queries
   - Cache frequently accessed data

2. **Data Management**
   - Keep seed data minimal
   - Use realistic test data
   - Document data dependencies
   - Regular cleanup

3. **Branch Management**
   - Set appropriate timeouts
   - Monitor resource usage
   - Clean up unused branches
   - Document branch purposes

## Related Snippets
- IV.4a: Supabase branch-first workflow
- IV.4c: Data persistence
- VI.6c: Environment variables
- VII.7b: Performance tools 