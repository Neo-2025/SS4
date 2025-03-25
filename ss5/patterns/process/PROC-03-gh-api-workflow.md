# GitHub API Workflow Deployment Pattern

## Status: Draft

## Classification: Process

## Context

When implementing CI/CD systems in GitHub repositories, traditional Git-based deployment approaches often face authentication challenges. This is especially problematic during initial setup when workflows don't yet exist to automate deployments. Teams may encounter a "bootstrap problem" - needing automation to set up automation.

## Problem

How can we reliably deploy GitHub Actions workflow files and other repository content when:

1. SSH key configuration is complex or unavailable
2. Direct Git commands face authentication issues
3. Traditional Git workflows require multiple steps (clone, modify, commit, push)
4. We need to handle existing file versioning and prevent conflicts

## Solution

Implement a GitHub API-based approach that leverages the GitHub CLI for direct content API access:

1. Use `gh api` commands to interact with GitHub's repository contents API
2. Implement a verification-first pattern to check for existing content
3. For file updates, retrieve SHA values to ensure proper versioning
4. Base64-encode file content for transmission via API
5. Execute single-command operations that combine file creation and commits

### Implementation Example

```bash
# Step 1: Check if file exists and retrieve its SHA if it does
FILE_PATH=".github/workflows/example-workflow.yml"
REPO="owner/repository"

RESPONSE=$(gh api /repos/$REPO/contents/$FILE_PATH 2>/dev/null || echo "NotFound")

# Step 2: Prepare file content (create or modify locally)
cat > /tmp/workflow.yml << 'EOF'
name: Example Workflow
on:
  workflow_dispatch:
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Hello, world!"
EOF

# Step 3: Encode content for API transmission
base64 -w 0 /tmp/workflow.yml > /tmp/content.txt

# Step 4: Create or update the file via API
if [[ $RESPONSE == *"NotFound"* ]]; then
  # File doesn't exist, create it
  gh api --method PUT /repos/$REPO/contents/$FILE_PATH \
    -f message="Add example workflow" \
    -f content="$(cat /tmp/content.txt)"
else
  # File exists, update it with SHA
  SHA=$(echo $RESPONSE | jq -r .sha)
  gh api --method PUT /repos/$REPO/contents/$FILE_PATH \
    -f message="Update example workflow" \
    -f content="$(cat /tmp/content.txt)" \
    -f sha="$SHA"
fi
```

## Benefits

1. **Simplified Authentication**: Relies on GitHub CLI's already-established authentication
2. **Direct Control**: Operates directly on GitHub content without local repository
3. **Single-Step Operations**: Combines multiple Git operations into one command
4. **Conflict Prevention**: Built-in versioning with SHA verification
5. **Idempotent Operations**: Can safely run the same script multiple times
6. **CI/CD Bootstrap**: Perfect for initializing CI/CD systems when automation doesn't yet exist

## Limitations

1. **API Rate Limits**: Subject to GitHub API rate limiting
2. **Size Restrictions**: Limited to GitHub's maximum file size for API operations
3. **No Local History**: Changes happen directly in GitHub without local Git history
4. **CLI Dependency**: Requires GitHub CLI to be installed and configured

## Related Patterns

- **GitOps Workflow Pattern**: Traditional GitOps approach using Git operations
- **CI/CD Pipeline Pattern**: The workflows being deployed often implement this pattern
- **Content Verification Pattern**: The check-before-modify approach is a common verification pattern

## Usage Metrics

- **Adoption**: Used successfully in setting up SS5 CI/CD infrastructure
- **Success Rate**: High success rate in environments where direct Git operations fail
- **Implementation Time**: Reduces multi-step process to single command operation

## Evolution History

- **Initial Version**: Developed during SS5 CI/CD implementation
- **Future Directions**: Potential for extension to handle multi-file operations and directory structures 