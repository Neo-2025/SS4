# Ideal MicroSaaS Development Environment

## Overview
This snippet details the optimal development environment setup for microSaaS applications, focusing on cloud-first development with local fallback options.

## Core Stack Components

### 1. Frontend Stack
```typescript
// package.json
{
  "dependencies": {
    "next": "14.1.0",
    "@supabase/supabase-js": "2.39.3",
    "zustand": "4.5.0",
    "@vercel/ai": "1.0.0"
  }
}
```

### 2. Backend Configuration
```toml
# supabase/config.toml
[db]
seed_paths = ["/seeds/base.sql"]

[remotes.production]
project_id = "prod-abcd"
seed_paths = ["/seeds/prod-sample.sql"]

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[studio]
enabled = true
port = 54323
```

### 3. Environment Variables
```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID}
```

## Workflow Features

### 1. Ephemeral Database Management
```typescript
// scripts/db-manager.ts
interface BranchConfig {
  name: string;
  isPersistent: boolean;
  autoPauseDelay: number;
}

class BranchManager {
  async createBranch(config: BranchConfig) {
    const { data, error } = await supabase
      .from('branch_configs')
      .insert({
        name: config.name,
        is_persistent: config.isPersistent,
        auto_pause_delay: config.autoPauseDelay
      });

    if (error) throw error;
    return data;
  }

  async pauseInactiveBranches() {
    const inactiveBranches = await this.getInactiveBranches();
    for (const branch of inactiveBranches) {
      await this.pauseBranch(branch.id);
    }
  }
}
```

### 2. Environment Parity
```bash
# scripts/verify-parity.sh
#!/bin/bash

# Check Supabase version
supabase_version=$(supabase -v)
if [ "$supabase_version" != "3.2.1" ]; then
  echo "Warning: Local Supabase version ($supabase_version) differs from production (3.2.1)"
fi

# Verify schema parity
supabase db diff --linked

# Check environment variables
supabase secrets list --env-file .env.local
```

### 3. Credential Rotation
```typescript
// lib/auth/credential-manager.ts
class CredentialManager {
  async rotateCredentials(branchId: string) {
    const { data, error } = await supabase
      .from('branch_credentials')
      .update({
        last_rotated: new Date().toISOString(),
        status: 'rotating'
      })
      .eq('branch_id', branchId);

    if (error) throw error;
    return data;
  }

  async syncVercelEnv(branchId: string) {
    const credentials = await this.getBranchCredentials(branchId);
    await this.updateVercelEnv(branchId, credentials);
  }
}
```

## Local Development Setup

### 1. Hybrid Workflow Configuration
```bash
# scripts/setup-local.sh
#!/bin/bash

# Link to production project
supabase link --project-ref $PROD_ID

# Sync production schema
supabase db remote commit

# Start local instance
supabase start

# Verify setup
supabase status
```

### 2. Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:local": "supabase start && next dev",
    "test:local": "cypress open",
    "test:cloud": "cypress cloud",
    "db:sync": "supabase db remote commit",
    "db:reset": "supabase db reset"
  }
}
```

## Testing Configuration

### 1. Cypress Cloud Setup
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    }
  }
})
```

### 2. Visual Testing
```typescript
// cypress/e2e/visual.cy.ts
describe('Visual Regression', () => {
  it('matches baseline', () => {
    cy.visit('/')
    cy.compareSnapshot('homepage', {
      capture: 'fullPage',
      errorThreshold: 0.1
    })
  })
})
```

## Cost Optimization

### 1. Branch Lifecycle Management
```typescript
// scripts/branch-manager.ts
interface BranchMetrics {
  lastAccessed: Date;
  totalCost: number;
  activeTime: number;
}

class BranchOptimizer {
  async optimizeBranches() {
    const metrics = await this.getBranchMetrics();
    for (const branch of metrics) {
      if (this.shouldPause(branch)) {
        await this.pauseBranch(branch.id);
      }
    }
  }

  private shouldPause(branch: BranchMetrics): boolean {
    const inactiveTime = Date.now() - branch.lastAccessed.getTime();
    return inactiveTime > 5 * 60 * 1000; // 5 minutes
  }
}
```

### 2. Resource Monitoring
```typescript
// lib/monitoring/resource-tracker.ts
class ResourceTracker {
  async trackBranchUsage(branchId: string) {
    const usage = await this.getBranchUsage(branchId);
    await this.updateMetrics(usage);
    await this.checkThresholds(usage);
  }

  private async checkThresholds(usage: BranchUsage) {
    if (usage.cost > this.getBudgetThreshold()) {
      await this.notifyBudgetExceeded(usage);
    }
  }
}
```

## Best Practices

1. **Environment Management**
   - Use cloud-first approach
   - Maintain local fallback
   - Regular parity checks
   - Automated verification

2. **Cost Control**
   - Monitor branch usage
   - Implement auto-pausing
   - Track resource metrics
   - Set budget alerts

3. **Testing Strategy**
   - Visual regression testing
   - Parallel test execution
   - Automated verification
   - Performance monitoring

## Related Snippets
- I.1a: Development environment
- IV.4a: Supabase branch-first workflow
- VI.6a: Vercel-Supabase integration
- VI.6b: GitHub Actions 