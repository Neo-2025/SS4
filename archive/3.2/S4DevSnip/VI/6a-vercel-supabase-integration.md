# Vercel-Supabase Integration Requirements

## Overview
This snippet details the mandatory integration between Vercel and Supabase for branch-first testing workflows, explaining the requirements, workflow, and consequences of missing integration.

## Prerequisites
- GitHub repository
- Vercel project
- Supabase project
- GitHub integration enabled on Vercel
- Supabase project connected to Vercel

## Installation Steps

### 1. Configure Vercel Integration
```bash
# Install Vercel CLI
npm i -g vercel

# Link Vercel project
vercel link

# Add Supabase integration
vercel integrations add supabase
```

### 2. Set Up GitHub Integration
```bash
# Configure GitHub integration
vercel git connect

# Verify integration status
vercel git status
```

## Configuration Details

### 1. Vercel Project Settings
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### 2. GitHub Actions Workflow
```yaml
# .github/workflows/vercel-supabase-sync.yml
name: Vercel-Supabase Sync
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - name: Sync Environment Variables
        run: |
          # Get Supabase credentials
          SUPABASE_URL=$(supabase status --json | jq -r '.api.url')
          SUPABASE_ANON_KEY=$(supabase status --json | jq -r '.api.anon_key')
          
          # Update Vercel environment variables
          vercel env add NEXT_PUBLIC_SUPABASE_URL $SUPABASE_URL
          vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY $SUPABASE_ANON_KEY
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 3. Integration Verification
```typescript
// src/lib/vercel-supabase.ts
export async function verifyIntegration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Test connection
  const { data, error } = await supabase
    .from('health_check')
    .select('*')
    .limit(1);
    
  if (error) {
    throw new Error(`Integration verification failed: ${error.message}`);
  }
  
  return true;
}
```

## Integration Workflow

### 1. PR Creation
```mermaid
graph TD
    A[Create PR] --> B[Supabase: Create Preview Branch]
    B --> C[Generate Branch Credentials]
    C --> D[Vercel: Start Preview Deployment]
    D --> E[Sync Environment Variables]
```

### 2. Environment Synchronization
```typescript
// src/lib/env-sync.ts
interface EnvSync {
  branch: string;
  supabaseUrl: string;
  supabaseKey: string;
  vercelUrl: string;
}

export async function syncEnvironments(config: EnvSync) {
  // 1. Verify Supabase branch
  const supabaseStatus = await verifySupabaseBranch(config.branch);
  
  // 2. Update Vercel environment
  await updateVercelEnv({
    NEXT_PUBLIC_SUPABASE_URL: config.supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: config.supabaseKey
  });
  
  // 3. Verify synchronization
  await verifyIntegration();
}
```

## Verification Steps

1. **Check Integration Status**
```bash
# Verify Vercel integration
vercel integrations ls

# Check Supabase connection
supabase status
```

2. **Test Environment Variables**
```bash
# List Vercel environment variables
vercel env ls

# Verify Supabase credentials
supabase status --json
```

3. **Validate Deployment**
```bash
# Check preview deployment
vercel ls

# Verify environment variables
vercel env pull .env.local
```

## Troubleshooting Tips

1. **Integration Failures**
   - Check GitHub permissions
   - Verify project connections
   - Review error logs
   - Test manually

2. **Environment Sync Issues**
   - Verify credentials
   - Check branch status
   - Review workflow logs
   - Test locally

3. **Deployment Problems**
   - Check build logs
   - Verify environment variables
   - Review integration status
   - Test preview deployment

## Common Issues and Solutions

1. **Missing Environment Variables**
   - Check integration status
   - Verify GitHub permissions
   - Review workflow logs
   - Test manually

2. **Credential Mismatches**
   - Verify branch status
   - Check sync timing
   - Review error logs
   - Test connections

3. **Deployment Failures**
   - Check build configuration
   - Verify dependencies
   - Review error messages
   - Test locally

## Best Practices

1. **Integration Management**
   - Regular status checks
   - Automated verification
   - Clear error handling
   - Documentation updates

2. **Environment Variables**
   - Secure storage
   - Regular rotation
   - Clear naming
   - Documentation

3. **Deployment Process**
   - Automated testing
   - Clear logging
   - Error handling
   - Status monitoring

## Related Snippets
- VI.6c: Environment variables
- IV.4a: Supabase branch-first workflow
- IV.4a: Supabase environment isolation
- VI.6b: GitHub Actions 