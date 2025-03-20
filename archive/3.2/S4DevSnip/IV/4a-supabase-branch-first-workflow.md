# Supabase Branch-First Testing Workflow

## Overview
This snippet describes how to implement Supabase's branch-first testing workflow, which integrates Git branches, Supabase Preview Branches, and Vercel Preview Deployments for isolated microSaaS development environments.

## Prerequisites
- GitHub repository
- Supabase project
- Vercel project
- Git CLI
- Supabase CLI (optional)

## Installation Steps

### 1. Configure Supabase Project
```bash
# Initialize Supabase config
supabase init

# Link project
supabase link --project-ref your-project-ref
```

### 2. Set Up GitHub Integration
```bash
# Configure GitHub Actions
mkdir -p .github/workflows
touch .github/workflows/supabase-preview.yml
```

### 3. Configure Vercel Integration
```bash
# Install Vercel CLI
npm i -g vercel

# Link Vercel project
vercel link
```

## Configuration Details

### 1. Supabase Configuration
```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"
```

### 2. GitHub Actions Workflow
```yaml
# .github/workflows/supabase-preview.yml
name: Supabase Preview
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  create-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - name: Create Preview Branch
        run: |
          supabase db push
          supabase db reset
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 3. Vercel Configuration
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
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

## Verification Steps

1. **Create Test Branch**
```bash
# Create and switch to new branch
git checkout -b feat/test-workflow

# Push changes
git push origin feat/test-workflow
```

2. **Verify Preview Environment**
```bash
# Check Supabase Preview Branch
supabase status

# Verify Vercel Preview Deployment
vercel ls
```

3. **Test Database Changes**
```sql
-- Test SQL in Supabase Dashboard
SELECT * FROM your_table;
```

## Troubleshooting Tips

1. **Preview Branch Issues**
   - Check Supabase Dashboard for branch status
   - Verify GitHub Actions logs
   - Ensure proper access tokens

2. **Vercel Deployment Issues**
   - Check build logs
   - Verify environment variables
   - Test locally first

3. **Database Sync Problems**
   - Review migration files
   - Check schema changes
   - Verify data seeding

## Common Issues and Solutions

1. **Preview Branch Not Created**
   - Verify GitHub Actions permissions
   - Check Supabase project settings
   - Review workflow file syntax

2. **Environment Variables Not Synced**
   - Check Vercel project settings
   - Verify Supabase credentials
   - Review environment mapping

3. **Database Migration Failures**
   - Review migration files
   - Check for conflicts
   - Verify schema changes

## Best Practices

1. **Branch Management**
   - Use descriptive branch names
   - Keep branches up to date
   - Clean up unused branches

2. **Database Changes**
   - Test migrations locally
   - Use version control
   - Document schema changes

3. **Environment Variables**
   - Use secure storage
   - Document requirements
   - Test locally first

## Related Snippets
- IV.4c: Data persistence
- VI.6b: GitHub Actions
- VI.6c: Environment variables 