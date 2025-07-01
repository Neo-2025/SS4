#!/bin/bash
# SS5 Schema Refresh Script
# Captures complete production or branch schema for thread context loading

cd ~/SS4/hb

# Check if branch parameter provided
BRANCH_NAME="${1:-main}"
SCHEMA_FILE="production-schema.sql"

if [ "$1" == "--branch" ] && [ -n "$2" ]; then
    BRANCH_NAME="$2"
    SCHEMA_FILE="${BRANCH_NAME}-schema.sql"
    echo "🔄 SS5 Schema Refresh for Branch: $BRANCH_NAME"
else
    echo "🔄 SS5 Schema Refresh for Production"
fi

echo "================================"

# Create schema directory if it doesn't exist
mkdir -p schema

# 1. Generate TypeScript types
echo "📝 Generating TypeScript types..."
if [ "$BRANCH_NAME" != "main" ]; then
    # For preview branches, we need to specify the branch
    npx supabase gen types typescript --linked --branch $BRANCH_NAME > database.types.ts
else
    npx supabase gen types typescript --linked > database.types.ts
fi

# 2. Dump complete SQL schema
echo "📊 Dumping schema for: $BRANCH_NAME..."
if [ "$BRANCH_NAME" != "main" ]; then
    # For preview branches
    npx supabase db dump --schema public --branch $BRANCH_NAME > schema/$SCHEMA_FILE
else
    # For production
    npx supabase db dump --schema public > schema/$SCHEMA_FILE
fi

# 3. Generate a timestamp
echo "Schema refreshed at $(date) for branch: $BRANCH_NAME" > schema/last-refresh.log

# 4. Create a quick reference file
echo "# SS5 Schema Quick Reference" > schema/README.md
echo "" >> schema/README.md
echo "Last refreshed: $(date)" >> schema/README.md
echo "Branch: $BRANCH_NAME" >> schema/README.md
echo "" >> schema/README.md
echo "## Files:" >> schema/README.md
echo "- $SCHEMA_FILE - Complete SQL schema dump for $BRANCH_NAME" >> schema/README.md
echo "- ../database.types.ts - TypeScript type definitions" >> schema/README.md
echo "" >> schema/README.md
echo "## Usage for this branch:" >> schema/README.md
echo '```' >> schema/README.md
echo "@required_file hb/schema/$SCHEMA_FILE" >> schema/README.md
echo "@required_file hb/database.types.ts" >> schema/README.md
echo '```' >> schema/README.md

echo "✅ Schema refresh complete for branch: $BRANCH_NAME"
echo ""
echo "📋 To use in your SS5-SQL session, include:"
echo "   @required_file hb/schema/$SCHEMA_FILE"
echo "   @required_file hb/database.types.ts"
echo ""
echo "⚡ This schema includes:"
echo "   - All tables and columns"
echo "   - btree and GIN indexes"
echo "   - Constraints and foreign keys"
echo "   - Views and materialized views"
echo "   - RLS policies" 