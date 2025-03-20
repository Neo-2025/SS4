# Bootstrap Commands Summary

This document provides a quick reference of the key commands used to successfully bootstrap and fix issues in the SS4 project.

## Project Setup

```bash
# Branch setup
git checkout -b feat/saas-template-setup

# Dependencies installation
npm install next@14.1.0 react@18.2.0 react-dom@18.2.0 @supabase/auth-helpers-nextjs @supabase/supabase-js
npm install zod @tanstack/react-query clsx tailwind-merge
```

## Key Fixes Applied

### JSON Formatting Fix

```bash
# Fix JSON files with script
./scripts/fix-json-files.sh package.json vercel.json

# Verify JSON validity
cat package.json | jq empty
```

### Route Structure Fix

```bash
# Create proper auth route structure (non-route group)
mkdir -p app/auth/login

# Create login page in correct location
touch app/auth/login/page.tsx
```

### Module Resolution Fix

```bash
# Create missing modules
mkdir -p lib types

# Create needed utilities
touch lib/validation.ts lib/error-handling.ts lib/utils.ts types/index.ts
```

## Deployment Commands

```bash
# Environment variables
vercel env pull .env.local

# Deploy to production
vercel deploy --prod -y
```

## Git Workflow

```bash
# Commit changes
git add app/auth/login/page.tsx app/auth/layout.tsx
git commit -m "fix(routes): create proper auth/login route structure"

# Push to feature branch
git push origin feat/saas-template-setup

# Merge to main
git checkout main
git pull origin main
git merge feat/saas-template-setup
git push origin main
```

## Testing

```bash
# Run build to test for errors
npm run build
``` 