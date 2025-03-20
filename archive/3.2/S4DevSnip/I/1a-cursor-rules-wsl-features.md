# WSL2-Optimized Cursor Rules: Key Features & Implementation

## Overview
This snippet details the key features and implementation details for WSL2-optimized Cursor rules, focusing on path resolution, extension management, and environment synchronization.

## Core Features

### 1. Hybrid Path Resolution
```ini
# .cursor/rules/path-mappings.rule
[path_mappings]
"C:\\Users\\" = "/mnt/c/Users/"
"~/" = "/home/<WSL_USERNAME>/"
"$HOME/" = "/mnt/c/Users/<USER_NAME>/"

[conversion_rules]
auto_convert = true
validate_paths = true
fallback_to_windows = false
```

### 2. WSL Extension Management
```json
{
  "extensions.autoUpdate": false,
  "extensions.allowedExtensions": {
    "ms-vscode-remote.remote-wsl": "0.88.5"
  },
  "wsl.extension.autoInstall": false,
  "wsl.extension.version": "0.88.5"
}
```

### 3. Supabase CLI Integration
```typescript
// .cursor/utils/cli-manager.ts
interface CLIConfig {
  isWSL: boolean;
  cliPath: string;
  version: string;
}

class CLIManager {
  getSupabaseCLIPath(): string {
    if (process.env.WSLENV) {
      return "wsl supabase";
    }
    return "C:\\Program Files\\Supabase CLI\\supabase.exe";
  }

  async validateCLI(): Promise<boolean> {
    const path = this.getSupabaseCLIPath();
    const version = await this.getCLIVersion(path);
    return version === "3.2.1";
  }
}
```

## Implementation Details

### 1. Environment Setup
```powershell
# setup-wsl.ps1
# Configure PATH for Cursor
$env:PATH += ";C:\Users\<USER_NAME>\AppData\Local\Programs\cursor\resources\app\bin"

# Create directory structure
New-Item -ItemType Directory -Force -Path ".cursor/rules"
New-Item -ItemType File -Force -Path ".cursor/rules/wsl-supabase.rule"
New-Item -ItemType File -Force -Path ".cursor/rules/security.rule"
New-Item -ItemType File -Force -Path ".cursor/rules/vercel-integration.rule"
```

### 2. Migration Safety
```typescript
// .cursor/utils/migration-validator.ts
interface MigrationConfig {
  branch: string;
  validateRLS: boolean;
  checkDependencies: boolean;
}

class MigrationValidator {
  async validateMigration(config: MigrationConfig): Promise<boolean> {
    try {
      // Check database diff
      await this.runDiffCheck();
      
      // Validate RLS policies
      if (config.validateRLS) {
        await this.validateRLSPolicies();
      }
      
      // Check dependencies
      if (config.checkDependencies) {
        await this.checkDependencies();
      }
      
      return true;
    } catch (error) {
      console.error("Migration validation failed:", error);
      return false;
    }
  }

  private async runDiffCheck(): Promise<void> {
    const { stdout } = await exec("supabase db diff --linked");
    if (stdout.includes("ERROR")) {
      throw new Error("Database diff check failed");
    }
  }
}
```

### 3. Troubleshooting Automation
```typescript
// .cursor/utils/troubleshooter.ts
interface TroubleshootingRule {
  match: string;
  script: string;
  description: string;
}

class WSLTroubleshooter {
  private rules: TroubleshootingRule[] = [
    {
      match: "WSL connection failed",
      script: "powershell.exe -ExecutionPolicy Bypass -File \"C:\\Users\\<USER_NAME>\\AppData\\Local\\Programs\\cursor\\resources\\app\\bin\\fixWSLNew.ps1\"",
      description: "Fix WSL connection issues"
    },
    {
      match: "Docker service not running",
      script: "net start com.docker.service",
      description: "Start Docker service"
    }
  ];

  async handleError(error: string): Promise<void> {
    const rule = this.findMatchingRule(error);
    if (rule) {
      await this.executeFix(rule);
    }
  }

  private findMatchingRule(error: string): TroubleshootingRule | undefined {
    return this.rules.find(rule => error.includes(rule.match));
  }
}
```

## Validation System

### 1. Environment Checks
```typescript
// .cursor/utils/env-validator.ts
interface EnvCheck {
  name: string;
  check: () => Promise<boolean>;
  required: boolean;
}

class EnvironmentValidator {
  private checks: EnvCheck[] = [
    {
      name: "WSL_PATH",
      check: async () => {
        const { stdout } = await exec("wsl --status");
        return stdout.includes("Ubuntu");
      },
      required: true
    },
    {
      name: "SUPABASE_VERSION",
      check: async () => {
        const { stdout } = await exec("supabase --version");
        return stdout.includes("3.2.1");
      },
      required: true
    }
  ];

  async validateEnvironment(): Promise<boolean> {
    for (const check of this.checks) {
      const result = await check.check();
      if (check.required && !result) {
        return false;
      }
    }
    return true;
  }
}
```

### 2. Path Validation
```typescript
// .cursor/utils/path-validator.ts
interface PathValidation {
  windows: string;
  wsl: string;
  exists: boolean;
}

class PathValidator {
  async validatePaths(): Promise<PathValidation[]> {
    const paths = [
      {
        windows: "C:\\Users\\<USER_NAME>\\Projects",
        wsl: "/mnt/c/Users/<USER_NAME>/Projects"
      }
    ];

    return Promise.all(
      paths.map(async path => ({
        ...path,
        exists: await this.checkPathExists(path.wsl)
      }))
    );
  }

  private async checkPathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
```

## Best Practices

1. **Path Management**
   - Use consistent path mappings
   - Validate path existence
   - Handle edge cases
   - Maintain WSL/Windows parity

2. **Extension Control**
   - Lock extension versions
   - Disable auto-updates
   - Validate compatibility
   - Regular version checks

3. **Environment Validation**
   - Check WSL status
   - Verify CLI versions
   - Validate paths
   - Monitor performance

## Related Snippets
- I.1a: Development environment
- I.1a: WSL2-optimized environment
- I.1a: Cursor rules configuration
- IV.4a: Supabase branch-first workflow 