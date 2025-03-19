# SS4 Context Archival System

## Overview
The SS4 Context Archival System provides daily backups of the entire SS4 workspace, ensuring context preservation and disaster recovery capabilities.

## System Components

### 1. Local Archive Script
Location: `/SS4/scripts/backup/ss4-daily-archive.sh`

Features:
- Daily snapshots of SS4 workspace
- Smart exclusion of unnecessary files
- Detailed manifest generation
- 7-day rolling retention
- Environment state capture

### 2. GitHub Workflow
Location: `/SS4/p1/.github/workflows/context-archive.yml`

Schedule:
```yaml
schedule:
  - cron: '0 1 * * *'  # Daily at 1 AM UTC
```

Features:
- Automated daily execution
- GitHub Artifacts storage
- Manual trigger option
- 7-day retention policy

## Archive Contents

### Included
- All project files
- Knowledge base (kb)
- Configuration files
- Environment states
- Git status
- Version information

### Excluded (via .archiveignore)
```
node_modules/
.next/
.vercel/
*.log
tmp/
.git/
archive/daily/
```

## Manifest Structure
Each archive includes a detailed manifest:
1. Archive metadata
2. Complete file listing
3. Git repository status
4. Environment versions
   - Node.js
   - NPM
   - Vercel CLI

## Recovery Process

### Quick Recovery
1. Access latest archive from GitHub Actions
2. Extract to desired location:
   ```bash
   tar -xzf ss4-context-{date}.tar.gz -C /desired/location
   ```
3. Review manifest for environment requirements
4. Restore node_modules: `npm install`

### Full Recovery
1. Clone fresh SS4 repository
2. Extract archive over clone
3. Review manifest.md
4. Verify environment matches
5. Test key functionality

## Maintenance

### Automatic
- Daily archives at 1 AM UTC
- 7-day retention enforcement
- Size optimization via exclusions

### Manual Tasks
- Monthly archive verification
- Quarterly test recovery
- Annual retention policy review

## Security Notes
- Archives exclude sensitive files
- GitHub Artifacts provide secure storage
- Workflow requires specific permissions
- Manifests track all included content

## Related Files
- `scripts/backup/ss4-daily-archive.sh`
- `.github/workflows/context-archive.yml`
- `.archiveignore` 