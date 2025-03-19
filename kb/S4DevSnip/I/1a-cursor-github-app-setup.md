# Secure GitHub App Setup for Cursor AI GitOps

## Overview
This snippet provides step-by-step instructions for setting up a GitHub App with secure credential management and environment variable handling for Cursor AI GitOps automation.

## GitHub App Creation

### 1. Initial Setup
```bash
# Navigate to GitHub Developer Settings
Start-Process "https://github.com/settings/apps/new"
```

### 2. App Configuration
```json
// .cursor/github-app-config.json
{
  "name": "Cursor AI GitOps",
  "description": "Automated GitOps for Cursor AI development",
  "homepage_url": "https://github.com/your-org",
  "callback_url": "https://cursor.sh/auth/callback",
  "permissions": {
    "contents": "read",
    "pull_requests": "write",
    "workflows": "write",
    "environments": "read",
    "secrets": "read"
  },
  "events": [
    "create",
    "push",
    "pull_request",
    "workflow_dispatch"
  ]
}
```

### 3. Private Key Management
```typescript
// .cursor/utils/key-manager.ts
interface KeyConfig {
  pemPath: string;
  wslPath: string;
  encryptionKey: string;
}

class KeyManager {
  async setupPrivateKey(config: KeyConfig): Promise<void> {
    // 1. Encrypt PEM file
    await this.encryptPEM(config.pemPath, config.encryptionKey);
    
    // 2. Create WSL symlink
    await this.createWSLSymlink(config.pemPath, config.wslPath);
    
    // 3. Set permissions
    await this.setSecurePermissions(config.wslPath);
  }

  private async encryptPEM(path: string, key: string): Promise<void> {
    const command = `Protect-File -Path ${path} -Password (ConvertTo-SecureString -String "${key}" -AsPlainText -Force)`;
    await this.wslProxy.executeInWSL({
      command: "powershell.exe",
      args: ["-Command", command],
      env: {}
    });
  }

  private async createWSLSymlink(windowsPath: string, wslPath: string): Promise<void> {
    const command = `sudo ln -s ${windowsPath} ${wslPath}`;
    await this.wslProxy.executeInWSL({
      command: "bash",
      args: ["-c", command],
      env: {}
    });
  }
}
```

## Environment Variable Management

### 1. Vercel Integration
```typescript
// .cursor/utils/vercel-manager.ts
interface VercelConfig {
  projectId: string;
  teamId: string;
  token: string;
}

class VercelManager {
  async setupEnvironment(config: VercelConfig): Promise<void> {
    // 1. Store token securely
    await this.storeToken(config.token);
    
    // 2. Link project
    await this.linkProject(config.projectId, config.teamId);
    
    // 3. Sync environment variables
    await this.syncEnvironmentVariables();
  }

  private async storeToken(token: string): Promise<void> {
    const command = `cmdkey /generic:vercel-token /user:oauth /pass:${token}`;
    await this.wslProxy.executeInWSL({
      command: "cmd.exe",
      args: ["/c", command],
      env: {}
    });
  }
}
```

### 2. Supabase Integration
```typescript
// .cursor/utils/supabase-manager.ts
interface SupabaseConfig {
  projectId: string;
  accessToken: string;
  previewUrl: string;
}

class SupabaseManager {
  async setupPreviewEnvironment(config: SupabaseConfig): Promise<void> {
    // 1. Store token
    await this.storeToken(config.accessToken);
    
    // 2. Link project
    await this.linkProject(config.projectId);
    
    // 3. Configure preview URL
    await this.setPreviewUrl(config.previewUrl);
  }

  private async storeToken(token: string): Promise<void> {
    const command = `supabase login --token ${token} --save`;
    await this.wslProxy.executeInWSL({
      command: "bash",
      args: ["-c", command],
      env: {}
    });
  }
}
```

## Branch-First Environment Variables

### 1. Local Development
```bash
# .env.local (Gitignored)
NEXT_PUBLIC_SUPABASE_URL=$VERCEL_PREVIEW_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_KEY=$VERCEL_PREVIEW_ANON_KEY
VERCEL_PROJECT_ID=$PROJECT_ID
VERCEL_TEAM_ID=$TEAM_ID
```

### 2. GitHub Actions Integration
```yaml
# .github/workflows/branch-env.yml
name: Branch Environment Setup
on:
  create:
    branches: ['feat/**']

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Configure Supabase Preview
        uses: supabase/github-actions@v2
        with:
          command: preview-branch ${{ github.head_ref }}
          token: ${{ secrets.SUPABASE_TOKEN }}

      - name: Configure Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: --preview

      - name: Sync Environment Variables
        run: |
          vercel env pull .env.preview
          supabase secrets set --env-file .env.preview
```

## Security Implementation

### 1. Token Rotation
```typescript
// .cursor/utils/token-rotator.ts
interface RotationConfig {
  service: "github" | "vercel" | "supabase";
  interval: number; // days
}

class TokenRotator {
  async scheduleRotation(config: RotationConfig): Promise<void> {
    const cron = this.calculateCronSchedule(config.interval);
    
    await this.createGitHubAction({
      name: `rotate-${config.service}-token`,
      schedule: cron,
      steps: this.getRotationSteps(config.service)
    });
  }

  private getRotationSteps(service: string): any[] {
    switch (service) {
      case "github":
        return [{
          name: "Rotate GitHub Token",
          run: "gh auth refresh -h github.com"
        }];
      case "vercel":
        return [{
          name: "Rotate Vercel Token",
          run: "vercel tokens rotate"
        }];
      case "supabase":
        return [{
          name: "Rotate Supabase Token",
          run: "supabase login --token $(supabase token rotate)"
        }];
    }
  }
}
```

### 2. Audit Trail
```typescript
// .cursor/utils/audit-logger.ts
interface AuditEvent {
  type: "token_rotation" | "env_sync" | "branch_creation";
  service: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

class AuditLogger {
  async logEvent(event: AuditEvent): Promise<void> {
    const logEntry = {
      ...event,
      timestamp: event.timestamp.toISOString(),
      cursor_version: process.env.CURSOR_VERSION
    };
    
    await this.writeToLog(logEntry);
    await this.updateGitHistory(logEntry);
  }
}
```

## Troubleshooting Guide

### 1. Common Issues
```typescript
// .cursor/utils/troubleshooter.ts
interface Issue {
  type: string;
  symptoms: string[];
  solution: string;
}

const commonIssues: Issue[] = [
  {
    type: "PEM Permissions",
    symptoms: ["Permission denied", "Cannot read private key"],
    solution: "chmod 600 /etc/cursor/github-app.pem"
  },
  {
    type: "Env Var Mismatch",
    symptoms: ["Missing environment variables", "Invalid credentials"],
    solution: "vercel env pull && source .env.local"
  },
  {
    type: "Auth Timeout",
    symptoms: ["Token expired", "Authentication failed"],
    solution: "Refresh-SecureToken && sudo service ssh restart"
  }
];
```

### 2. Validation Checks
```typescript
// .cursor/utils/validator.ts
class EnvironmentValidator {
  async validateSetup(): Promise<ValidationResult> {
    return {
      github: await this.checkGitHubAuth(),
      vercel: await this.checkVercelAuth(),
      supabase: await this.checkSupabaseAuth(),
      envVars: await this.checkEnvironmentVariables()
    };
  }
}
```

## Best Practices

1. **Credential Storage**
   - Use Windows Credential Manager for Windows-native apps
   - Use WSL environment variables for Linux tools
   - Implement automatic token rotation
   - Maintain audit trails

2. **Environment Variables**
   - Keep production values in Vercel
   - Use preview environments for branches
   - Implement automatic sync
   - Validate before deployment

3. **Security Measures**
   - Regular token rotation
   - Least privilege principle
   - Audit logging
   - Automated validation

4. **Integration Points**
   - GitHub App for repository access
   - Vercel for deployment
   - Supabase for database
   - Local development environment

## Related Snippets
- I.1a: WSL2 integration
- I.1a: Cursor rules configuration
- I.1a: Branch-first workflow
- I.1a: Development environment 