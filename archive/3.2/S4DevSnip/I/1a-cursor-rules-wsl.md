# Cursor Rules Configuration for Windows 10 WSL2 Development

## Overview
This snippet details the comprehensive Cursor rules configuration for Windows 10 WSL2 development, specifically optimized for Supabase and Vercel integration.

## Core Rules Configuration

### 1. WSL-Supabase Rules
```ini
# .cursor/rules/wsl-supabase.rule
[context]
tech_stack = "Windows 10 WSL2, Next.js 14, Supabase, TypeScript"
path_conventions = "Hybrid Windows/WSL paths"
wsl_distro = "Debian"
supabase_cli_version = "3.2.1"

[behavior]
terminal_profile = "WSL Ubuntu"
security = "RLS-first with WSL isolation"
model = "claude-3.7-sonnet@windows-wsl-optimized"

[paths]
include = [
    "supabase/**/*.sql",
    "src/app/**/*.ts*",
    "vercel.json"
]
exclude = ["supabase/data/*"]

[wsl]
mount_point = "/mnt/c/Users/<USER_NAME>/projects"
docker_compose = "wsl2"
path_conversion = "auto"

[terminal]
profiles = [
    {
        "name": "PowerShell",
        "path": "powershell.exe",
        "args": ["-NoExit", "-Command", "cd ~/projects"]
    },
    {
        "name": "WSL Ubuntu",
        "path": "wsl.exe",
        "args": ["-d", "Debian", "--cd", "~/projects"]
    }
]

[supabase]
wsl_cli_path = "/usr/local/bin/supabase"
windows_cli_path = "C:\\Program Files\\Supabase CLI\\supabase.exe"
migration_checks = "strict"
```

### 2. Security Rules
```ini
# .cursor/rules/security.rule
[security]
wsl_extension_version = "0.88.5"
env_var_handling = "isolated"
allowed_commands = [
    "supabase start --wsl",
    "vercel deploy --preview",
    "wsl --shutdown"
]

[permissions]
wsl_root_access = false
auto_sudo = "disabled"
docker_without_sudo = true

[ai]
allowed_actions = [
    "schema_migration",
    "env_var_sync",
    "wsl_path_conversion"
]
```

### 3. Vercel Integration Rules
```ini
# .cursor/rules/vercel-integration.rule
[vercel]
env_sync = {
    "strategy": "preview-branch",
    "auto_map": {
        "NEXT_PUBLIC_SUPABASE_URL": "SUPABASE_PREVIEW_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "SUPABASE_PREVIEW_KEY"
    }
}

[preview]
cold_start_timeout = "8s"
auto_pause = "10m"
```

## Implementation Details

### 1. Path Resolution
```typescript
// .cursor/utils/path-resolver.ts
interface PathConfig {
  windows: string;
  wsl: string;
  isWSL: boolean;
}

class HybridPathResolver {
  resolvePath(config: PathConfig): string {
    if (config.isWSL) {
      return this.convertToWSLPath(config.windows);
    }
    return this.convertToWindowsPath(config.wsl);
  }

  private convertToWSLPath(windowsPath: string): string {
    return windowsPath
      .replace(/^C:\\/, '/mnt/c/')
      .replace(/\\/g, '/');
  }

  private convertToWindowsPath(wslPath: string): string {
    return wslPath
      .replace(/^\/mnt\/c\//, 'C:\\')
      .replace(/\//g, '\\');
  }
}
```

### 2. Environment Management
```typescript
// .cursor/utils/env-manager.ts
interface EnvConfig {
  preview: boolean;
  branch: string;
  envVars: Record<string, string>;
}

class EnvManager {
  async syncEnvironment(config: EnvConfig): Promise<void> {
    if (config.preview) {
      await this.syncPreviewEnv(config.branch);
    }
    await this.updateEnvVars(config.envVars);
  }

  private async syncPreviewEnv(branch: string): Promise<void> {
    const previewUrl = await this.getPreviewUrl(branch);
    await this.updateEnvVar('NEXT_PUBLIC_SUPABASE_URL', previewUrl);
  }
}
```

### 3. Command Validation
```typescript
// .cursor/utils/command-validator.ts
interface CommandConfig {
  command: string;
  context: 'wsl' | 'windows';
  permissions: string[];
}

class CommandValidator {
  validateCommand(config: CommandConfig): boolean {
    if (!this.isAllowedCommand(config.command)) {
      return false;
    }
    if (!this.hasRequiredPermissions(config.permissions)) {
      return false;
    }
    return true;
  }

  private isAllowedCommand(command: string): boolean {
    return ALLOWED_COMMANDS.includes(command);
  }
}
```

## Integration Examples

### 1. Supabase Migration
```typescript
// .cursor/commands/supabase-migration.ts
interface MigrationConfig {
  name: string;
  schema: string;
  isWSL: boolean;
}

class SupabaseMigration {
  async createMigration(config: MigrationConfig): Promise<void> {
    const path = this.getMigrationPath(config.name);
    const content = this.generateMigrationContent(config.schema);
    
    await this.writeMigrationFile(path, content);
    await this.validateMigration(path);
  }

  private getMigrationPath(name: string): string {
    return pathResolver.resolvePath({
      windows: `C:\\Projects\\supabase\\migrations\\${name}.sql`,
      wsl: `/mnt/c/Projects/supabase/migrations/${name}.sql`,
      isWSL: true
    });
  }
}
```

### 2. Vercel Preview
```typescript
// .cursor/commands/vercel-preview.ts
interface PreviewConfig {
  branch: string;
  envVars: Record<string, string>;
  timeout: number;
}

class VercelPreview {
  async deployPreview(config: PreviewConfig): Promise<void> {
    await this.syncEnvironment({
      preview: true,
      branch: config.branch,
      envVars: config.envVars
    });

    await this.deployToVercel(config.branch);
    await this.waitForDeployment(config.timeout);
  }
}
```

## Best Practices

1. **Path Management**
   - Use hybrid path resolution
   - Validate path conversions
   - Handle edge cases
   - Maintain consistency

2. **Environment Handling**
   - Isolate environment variables
   - Sync preview environments
   - Validate configurations
   - Handle timeouts

3. **Security**
   - Validate commands
   - Check permissions
   - Monitor access
   - Regular audits

## Related Snippets
- I.1a: Development environment
- I.1a: WSL2-optimized environment
- I.1a: Windows-optimized environment
- IV.4a: Supabase branch-first workflow 