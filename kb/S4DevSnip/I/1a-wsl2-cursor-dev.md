# WSL2-Optimized Development Environment with Cursor AI

## Overview
This snippet details the optimal WSL2-based development environment setup for Windows 10, specifically optimized for Cursor AI integration and microSaaS development.

## Prerequisites

### 1. WSL2 Installation
```powershell
# Run in PowerShell Admin
wsl --install -d Ubuntu
wsl --set-version Ubuntu 2
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V /all /norestart
```

### 2. WSL2 Configuration
```ini
# ~/.wslconfig (Windows side)
[wsl2]
memory=6GB
processors=4
localhostForwarding=true
```

## Cursor AI Integration

### 1. Cursor Rules
```ini
# ~/.cursorrules (WSL home)
[context]
tech_stack = "Next.js 14, Supabase, TypeScript (WSL2)"
path_conventions = "Linux-style paths"
docker_runtime = "wsl2"

[ai]
auto_path_conversion = true
wsl_mount = "/mnt/c/Projects/my-saas"
terminal_profile = "WSL Ubuntu"
```

### 2. VS Code Settings
```json
{
  "terminal.integrated.profiles.windows": {
    "WSL Ubuntu": {
      "path": "wsl.exe",
      "args": ["-d", "Ubuntu"]
    }
  },
  "supabase.wslMount": "/mnt/c/Projects/my-saas",
  "cursor.wslOptimization": true,
  "cursor.autoPathConversion": true
}
```

## Environment Setup

### 1. File System Optimization
```bash
# Store projects in WSL native filesystem
ln -s /mnt/c/Users/yourname/Projects ~/projects

# Configure Git for WSL
git config --global core.fileMode false
```

### 2. Docker Configuration
```bash
# Install Docker in WSL2
sudo apt-get update && sudo apt-get install docker-ce

# Configure Docker for WSL2
sudo service docker start
sudo usermod -aG docker $USER
```

### 3. Development Tools
```bash
# Install essential tools
sudo apt-get install -y \
  curl \
  git \
  nodejs \
  npm \
  postgresql-client \
  redis-tools

# Install global npm packages
npm install -g \
  supabase \
  vercel \
  typescript \
  ts-node
```

## Workflow Automation

### 1. Cursor AI Commands
```typescript
// .cursor/commands.ts
interface WSLCommand {
  name: string;
  command: string;
  description: string;
}

const wslCommands: WSLCommand[] = [
  {
    name: "init-supabase",
    command: "supabase start --wsl",
    description: "Initialize WSL2 Supabase stack"
  },
  {
    name: "deploy-preview",
    command: "vercel deploy --preview",
    description: "Deploy preview to Vercel"
  },
  {
    name: "fix-wsl",
    command: "sudo service docker restart && wsl --shutdown",
    description: "Fix WSL2 container issues"
  }
];
```

### 2. Path Resolution
```typescript
// .cursor/path-resolver.ts
class WSLPathResolver {
  convertWindowsToWSL(windowsPath: string): string {
    return windowsPath
      .replace(/^C:\\/, '/mnt/c/')
      .replace(/\\/g, '/');
  }

  convertWSLToWindows(wslPath: string): string {
    return wslPath
      .replace(/^\/mnt\/c\//, 'C:\\')
      .replace(/\//g, '\\');
  }
}
```

## Development Workflow

### 1. Database Operations
```sql
-- Example of WSL2-optimized schema
create table audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users,
  action text not null
);

-- WSL2-specific optimizations
alter table audit_logs set (autovacuum_vacuum_scale_factor = 0.1);
alter table audit_logs set (autovacuum_analyze_scale_factor = 0.05);
```

### 2. Container Management
```bash
# scripts/wsl-docker.sh
#!/bin/bash

# Start Supabase stack
supabase start --wsl

# Monitor container health
docker ps --filter "name=supabase"

# Handle WSL2-specific issues
if [ "$(docker info | grep 'WSL')" ]; then
  echo "Running in WSL2 mode"
  export DOCKER_HOST=unix:///var/run/docker.sock
fi
```

### 3. Performance Monitoring
```typescript
// scripts/wsl-monitor.ts
interface WSLMetrics {
  memory: number;
  cpu: number;
  io: number;
}

class WSLMonitor {
  async getMetrics(): Promise<WSLMetrics> {
    const memory = await this.getMemoryUsage();
    const cpu = await this.getCPUUsage();
    const io = await this.getIOUsage();
    
    return { memory, cpu, io };
  }

  async optimizePerformance() {
    const metrics = await this.getMetrics();
    if (metrics.memory > 80) {
      await this.cleanupResources();
    }
  }
}
```

## Troubleshooting

### 1. Common Issues
```bash
# Auto-generated fixes
sudo service docker restart # Fix container issues
wsl --shutdown # Reset environment
supabase start --no-healthcheck # Bypass WSL2 quirks
```

### 2. Performance Optimization
```bash
# Optimize WSL2 performance
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.dirty_ratio=40" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Best Practices

1. **WSL2 Configuration**
   - Use native filesystem for projects
   - Optimize memory allocation
   - Enable localhost forwarding
   - Regular environment resets

2. **Cursor AI Integration**
   - Leverage auto path conversion
   - Use WSL-specific commands
   - Monitor performance metrics
   - Regular environment validation

3. **Development Workflow**
   - Use WSL2 for all development
   - Maintain Windows for GUI tools
   - Regular container cleanup
   - Monitor resource usage

## Related Snippets
- I.1a: Development environment
- I.1a: Ideal microSaaS environment
- IV.4a: Supabase branch-first workflow
- VI.6a: Vercel-Supabase integration 