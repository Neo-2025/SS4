# Branch-First Development Workflow with Cursor AI

## Overview
This snippet details a specialized branch-first development workflow using targeted Cursor AI prompts, optimized for solopreneurs leveraging prompt engineering for microSaaS development.

## Branch Workflow Configuration

### 1. Branch Prompt Definitions
```yaml
# branch_workflow_prompts.yaml
branches:
  auth-overhaul:
    prompt: |
      @branch-first: Create isolated environment for new Google OAuth flow
      - Auto-generate RLS policies
      - Add test users via seed.sql
      - Connect Vercel preview
    triggers:
      - supabase preview-branch
      - vercel env sync
      - cypress baseline

  subscription-tiers:
    prompt: |
      @branch-first: Develop premium tier feature
      - Create subscriptions table
      - Add Stripe webhook handler
      - Isolate test payment data
    triggers:
      - supabase migration new
      - edge-function create
      - test-card-seeding
```

### 2. Environment Creation
```typescript
// .cursor/utils/branch-manager.ts
interface BranchConfig {
  name: string;
  type: "feature" | "bugfix" | "release";
  env: {
    supabase: boolean;
    vercel: boolean;
    database: boolean;
  };
}

class BranchManager {
  async createBranch(config: BranchConfig): Promise<BranchResult> {
    const prompt = `
      @branch-init: Create '${config.name}' branch with:
      - Supabase preview env: ${config.env.supabase}
      - Vercel deployment: ${config.env.vercel}
      - Test database: ${config.env.database}
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

## Schema Management

### 1. Schema Generation
```typescript
// .cursor/utils/schema-manager.ts
interface SchemaConfig {
  table: string;
  columns: Column[];
  constraints: Constraint[];
  rls: RLSPolicy[];
}

class SchemaManager {
  async generateSchema(config: SchemaConfig): Promise<Migration> {
    const prompt = `
      @branch-schema: Add ${config.table} table with:
      ${this.formatColumns(config.columns)}
      ${this.formatConstraints(config.constraints)}
      ${this.formatRLS(config.rls)}
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

### 2. Migration Management
```sql
-- Example auto-generated migration
create table enterprise_subscriptions (
  id uuid primary key,
  user_id uuid references auth.users,
  features jsonb,
  constraint is_admin check (
    exists (
      select 1 from users 
      where id = user_id and role = 'admin'
    )
  )
);
alter table enterprise_subscriptions enable row level security;
```

## Testing Automation

### 1. Test Generation
```typescript
// .cursor/utils/test-generator.ts
interface TestConfig {
  feature: string;
  scenarios: TestScenario[];
  coverage: number;
}

class TestGenerator {
  async generateTests(config: TestConfig): Promise<TestSuite> {
    const prompt = `
      @branch-test: Verify ${config.feature}
      Scenarios: ${JSON.stringify(config.scenarios)}
      Coverage: ${config.coverage}%
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

### 2. Test Implementation
```typescript
// Example auto-generated test
describe('Admin Subscription Access', () => {
  it('Allows admin access', () => {
    cy.loginAsAdmin()
    cy.visit('/subscriptions')
    cy.get('[data-cy=enterprise-table]').should('exist')
  })
})
```

## Branch Monitoring

### 1. Health Checks
```typescript
// .cursor/utils/monitor.ts
interface MonitorConfig {
  branch: string;
  metrics: string[];
  thresholds: Record<string, number>;
}

class BranchMonitor {
  async checkHealth(config: MonitorConfig): Promise<HealthReport> {
    const prompt = `
      @branch-status: Show resource usage for '${config.branch}'
      Metrics: ${config.metrics.join(', ')}
      Thresholds: ${JSON.stringify(config.thresholds)}
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

### 2. Security Audits
```typescript
// .cursor/utils/security-auditor.ts
interface AuditConfig {
  branch: string;
  checks: SecurityCheck[];
  autoFix: boolean;
}

class SecurityAuditor {
  async runAudit(config: AuditConfig): Promise<AuditReport> {
    const prompt = `
      @branch-audit: Check for credential leaks in ${config.branch}
      Checks: ${config.checks.join(', ')}
      Auto-fix: ${config.autoFix}
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

## GitOps Automation

### 1. Branch Lifecycle Rules
```ini
# .cursor/rules/gitops.rule
[branch-lifecycle]
auto_pr_description = true
pr_checks = ["supabase-migrations", "vercel-build"]
branch_cleanup = "7d"

[prompt-templates]
create_branch = """
@branch-create: {branch_name} 
Purpose: {feature_description}
Env Requirements: {supabase_config}
Test Cases: {test_scenarios}
"""
```

### 2. PR Management
```typescript
// .cursor/utils/pr-manager.ts
interface PRConfig {
  branch: string;
  title: string;
  description: string;
  checks: string[];
}

class PRManager {
  async createPR(config: PRConfig): Promise<PullRequest> {
    const prompt = `
      @branch-pr: Create PR for ${config.branch}
      Title: ${config.title}
      Description: ${config.description}
      Checks: ${config.checks.join(', ')}
    `;
    
    return await this.cursorAI.generate(prompt);
  }
}
```

## Solopreneur Optimization

### 1. Meta-Prompt Template
```typescript
// .cursor/templates/meta-prompt.ts
interface MetaPromptConfig {
  userStory: string;
  requirements: string[];
  constraints: string[];
}

class MetaPromptGenerator {
  generate(config: MetaPromptConfig): string {
    return `
      meta-prompt: |
        You're a SaaS architect assistant. Given: ${config.userStory}, 
        generate branch-first workflow plan with:
        1. Supabase schema changes
        2. Vercel env requirements 
        3. Automated test cases
        4. Git branch naming convention
        5. Cleanup conditions
    `;
  }
}
```

### 2. Time Savings Metrics
```typescript
// .cursor/metrics/time-savings.ts
interface TimeMetrics {
  task: string;
  manualTime: number;
  automatedTime: number;
  savings: number;
}

class TimeTracker {
  async measureSavings(): Promise<TimeMetrics[]> {
    return [
      {
        task: "Branch env setup",
        manualTime: 45,
        automatedTime: 2,
        savings: 43
      },
      {
        task: "Migration creation",
        manualTime: 30,
        automatedTime: 0.75,
        savings: 29.25
      }
    ];
  }
}
```

## Best Practices

1. **Prompt Engineering**
   - Use structured templates
   - Include clear requirements
   - Specify constraints
   - Add business context

2. **Branch Management**
   - Follow naming conventions
   - Set cleanup policies
   - Monitor resource usage
   - Track costs

3. **Security**
   - Validate credentials
   - Check RLS policies
   - Review API keys
   - Monitor access

4. **Testing**
   - Generate comprehensive tests
   - Maintain coverage
   - Validate edge cases
   - Document scenarios

## Related Snippets
- I.1a: Development environment
- I.1a: WSL2-optimized environment
- I.1a: Cursor rules configuration
- I.1a: MicroSaaS MVP workflow 