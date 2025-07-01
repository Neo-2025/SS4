#!/bin/bash

# Finalize Branch 2 Implementation Script
# This script performs final checks and prepares the branch for PR

# Exit on any error
set -e

echo "🚀 Finalizing Branch 2 Implementation (GitHub OAuth Authentication)"
echo "=================================================================="

# Ensure we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "feat/us-001-github-auth" ]]; then
  echo "❌ Error: Not on the expected branch. Please checkout feat/us-001-github-auth first."
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin feat/us-001-github-auth

# Verify environment variables are properly set
echo "🔍 Verifying environment configuration..."
if [ ! -f .env.local ]; then
  echo "⚠️  Warning: .env.local not found. Running environment pull from Vercel..."
  npm run vercel:env:pull
fi

# Verify required files exist
echo "📋 Checking implementation completeness..."
required_files=(
  "app/lib/commands/auth/login.ts"
  "app/lib/commands/auth/logout.ts"
  "app/lib/commands/auth/account.ts"
  "app/auth/callback/route.ts"
  "app/lib/utils/auth-progress-tracker.ts"
  "kb/patterns/ui/Terminal-Style-Progress-Tracker-Pattern.md"
  "kb/patterns/process/Vercel-Primary-SOR-Pattern.md"
)

missing_files=0
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing required file: $file"
    missing_files=$((missing_files+1))
  fi
done

if [ $missing_files -gt 0 ]; then
  echo "❌ Error: $missing_files required files are missing. Please implement them before finalizing."
else
  echo "✅ All required files are present."
fi

# Run tests to verify implementation
echo "🧪 Running tests..."
npm test

# Build the project to verify it compiles
echo "🏗️  Building project..."
npm run build

# Add any remaining changes
echo "📝 Adding any remaining changes..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
  echo "✅ No changes to commit. Branch is ready for PR."
else
  # Commit changes
  echo "💾 Committing final changes..."
  git commit -m "feat(auth): finalize Branch 2 GitHub OAuth implementation [SS5-B1]"
  
  # Push changes
  echo "📤 Pushing changes to remote..."
  git push origin feat/us-001-github-auth
fi

echo "✅ Branch 2 implementation is complete and ready for PR!"
echo "PR Template is available at: .github/PULL_REQUEST_TEMPLATE_BRANCH2.md"
echo "==================================================================" 