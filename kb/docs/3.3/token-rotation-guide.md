# Token Rotation Guide for SS4

## Current Status
✅ **COMPLETED**:
- Workflow setup at `.github/workflows/token-rotation.yml`
- Daily schedule configured (00:00 UTC)
- GitHub and Vercel integration established
- Initial secrets synced

## What It Does
The workflow runs daily at midnight (`cron: '0 0 * * *'`) and:
1. ✅ Pulls latest environment variables from Vercel
2. ✅ Syncs them to GitHub secrets
3. ✅ Maintains security without manual intervention

## Initial Setup
✅ **COMPLETED**:
```bash
# Already set in GitHub repo secrets
VERCEL_TOKEN=configured
GH_TOKEN=configured
```

## Regular Check (Monthly Task)
1. Visit GitHub repo → Actions tab
2. Look for "Token Rotation" workflow runs
3. Green checks = everything's good
4. Red X = check the logs and verify tokens

## Schedule Configuration
✅ **COMPLETED**:
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Runs at 00:00 UTC daily
  workflow_dispatch:      # Manual trigger option added
```

## Manual Rotation Process
If needed:
1. Go to GitHub → Actions → Token Rotation
2. Click "Run workflow" button
3. Select branch and run

## Security Notes
- Workflow runs in isolated production environment
- Uses GitHub OIDC for enhanced security
- Permissions strictly limited to required scopes
- All sensitive operations logged and audited

## Troubleshooting
If rotation fails:
1. Check GitHub Actions logs
2. Verify Vercel token validity
3. Confirm GitHub token permissions
4. Review environment variable sync status

## Related Files
- ✅ `.github/workflows/token-rotation.yml`
- ✅ `scripts/sync-vercel-env.sh`
- ✅ `.cursor.rules` workflow configuration 