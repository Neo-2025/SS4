# Windows-Optimized Development Environment with Cursor AI

## Overview
This snippet details the optimal Windows-based development environment setup for microSaaS development, specifically optimized for Cursor AI integration and Windows-specific features.

## Cursor AI Configuration

### 1. Project Rules
```ini
# .cursorrules (project root)
[context]
tech_stack = "Next.js 14, Supabase, TypeScript"
architecture = "App Router, RLS, Edge Functions"
testing = "Cypress E2E, Migration checks"

[windows]
path_conventions = "Windows-style"
terminal = "PowerShell"
docker_runtime = "auto"
```

### 2. VS Code Settings
```json
{
  "ai.windowsShortcuts": "enabled",
  "terminal.shell": "PowerShell",
  "supabase.winPath": "C:\\Program Files\\Supabase CLI",
  "ai.model": "claude-3.7-sonnet@windows-optimized",
  "files.watcherExclude": {
    "**/supabase/data": true,
    "**/node_modules": true,
    "**/.git": true
  }
}
```

## Environment Setup

### 1. PowerShell Configuration
```powershell
# Configure PowerShell execution policy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Add Supabase CLI to PATH
$env:PATH += ";C:\Program Files\Supabase CLI"

# Configure Git for Windows
git config --global core.autocrlf true
git config --global core.fileMode false
```

### 2. Docker Configuration
```powershell
# Install Docker Desktop for Windows
winget install Docker.DockerDesktop

# Configure Docker for Windows
docker context use desktop-linux
```

### 3. Development Tools
```powershell
# Install essential tools via winget
winget install Microsoft.VisualStudioCode
winget install NodeJS.NodeJS
winget install Git.Git

# Install global npm packages
npm install -g `
  supabase `
  vercel `
  typescript `
  ts-node
```

## Workflow Automation

### 1. Cursor AI Commands
```typescript
// .cursor/commands.ts
interface WindowsCommand {
  name: string;
  command: string;
  shortcut: string;
  description: string;
}

const windowsCommands: WindowsCommand[] = [
  {
    name: "init-project",
    command: "supabase start --windows",
    shortcut: "Ctrl+.",
    description: "Initialize Windows Supabase stack"
  },
  {
    name: "create-migration",
    command: "supabase migration new",
    shortcut: "Alt+Ctrl+M",
    description: "Create new migration"
  },
  {
    name: "deploy-preview",
    command: "vercel deploy --preview --yes",
    shortcut: "Ctrl+Shift+P",
    description: "Deploy preview to Vercel"
  }
];
```

### 2. Path Management
```typescript
// .cursor/path-manager.ts
class WindowsPathManager {
  convertToWindowsPath(path: string): string {
    return path
      .replace(/\//g, '\\')
      .replace(/^\/mnt\/c\//, 'C:\\');
  }

  convertToUnixPath(path: string): string {
    return path
      .replace(/\\/g, '/')
      .replace(/^C:\\/, '/mnt/c/');
  }

  normalizePath(path: string): string {
    return this.convertToWindowsPath(path);
  }
}
```

## Development Workflow

### 1. Database Operations
```sql
-- Example of Windows-optimized schema
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('active', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Container Management
```powershell
# scripts/windows-docker.ps1
# Start Supabase stack
supabase start --windows

# Monitor container health
docker ps --filter "name=supabase"

# Handle Windows-specific issues
if ($env:OS -eq "Windows_NT") {
    Write-Host "Running in Windows mode"
    $env:DOCKER_HOST = "tcp://localhost:2375"
}
```

### 3. Performance Monitoring
```typescript
// scripts/windows-monitor.ts
interface WindowsMetrics {
  memory: number;
  cpu: number;
  disk: number;
}

class WindowsMonitor {
  async getMetrics(): Promise<WindowsMetrics> {
    const memory = await this.getMemoryUsage();
    const cpu = await this.getCPUUsage();
    const disk = await this.getDiskUsage();
    
    return { memory, cpu, disk };
  }

  async optimizePerformance() {
    const metrics = await this.getMetrics();
    if (metrics.memory > 80) {
      await this.cleanupResources();
    }
  }
}
```

## Security Configuration

### 1. Windows Defender Rules
```powershell
# Configure Windows Defender exclusions
Add-MpPreference -ExclusionPath "C:\Program Files\Supabase CLI"
Add-MpPreference -ExclusionPath "C:\Program Files\Docker"
Add-MpPreference -ExclusionProcess "supabase.exe"
```

### 2. Network Configuration
```powershell
# Configure Docker network rules
New-NetFirewallRule -DisplayName "Docker Desktop" -Direction Inbound -Action Allow -Program "C:\Program Files\Docker\Docker\Docker Desktop.exe"
New-NetFirewallRule -DisplayName "Supabase CLI" -Direction Inbound -Action Allow -Program "C:\Program Files\Supabase CLI\supabase.exe"
```

## Troubleshooting

### 1. Common Issues
```powershell
# Auto-generated fixes
Restart-Service Docker # Fix container issues
Stop-Process -Name "supabase" -Force # Reset Supabase
supabase start --no-healthcheck # Bypass Windows quirks
```

### 2. Performance Optimization
```powershell
# Optimize Windows performance
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" -Name "LargeSystemCache" -Value 1
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" -Name "IoPageLockLimit" -Value 983040
```

## Best Practices

1. **Windows Configuration**
   - Use Windows-style paths
   - Configure PowerShell execution policy
   - Set up Windows Defender exclusions
   - Regular system maintenance

2. **Cursor AI Integration**
   - Use Windows-specific shortcuts
   - Leverage PowerShell automation
   - Monitor performance metrics
   - Regular environment validation

3. **Development Workflow**
   - Use Windows-native tools
   - Maintain WSL2 for Linux tools
   - Regular container cleanup
   - Monitor resource usage

## Related Snippets
- I.1a: Development environment
- I.1a: WSL2-optimized environment
- I.1a: Ideal microSaaS environment
- IV.4a: Supabase branch-first workflow 