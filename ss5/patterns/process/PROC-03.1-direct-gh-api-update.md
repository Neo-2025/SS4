# Direct GitHub API File Update Pattern

## Status: Draft

## Classification: Process

## Context

When working in CI/CD systems or automation workflows, there's often a need to update specific files in a GitHub repository without relying on traditional Git workflows. This pattern is a specialized variant of the broader GitHub API Workflow Deployment Pattern (PROC-03), focusing specifically on the direct file update scenario with known SHAs.

## Problem

How can we efficiently update a known file in a GitHub repository when:

1. We need a single-command solution for automation scripts
2. The file already exists and we have its SHA identifier
3. We want to avoid the complexity of Git clone/commit/push operations
4. We need to preserve proper version history and avoid conflicts

## Solution

Implement a direct GitHub API file update using a compressed one-line command combining base64 encoding and the GitHub API:

```bash
base64 -w 0 /path/to/local/file > /tmp/content.txt && gh api --method PUT /repos/owner/repo/contents/path/to/remote/file -f message="Commit message" -f content="$(cat /tmp/content.txt)" -f sha="current_file_sha"
```

This pattern uses:
1. Base64 encoding to prepare the file content for API transmission
2. GitHub CLI for authenticated API access
3. PUT method with specific parameters including:
   - Content: The base64-encoded file data
   - Message: A descriptive commit message
   - SHA: The current file's SHA to ensure proper versioning

### Implementation Example

```bash
# A complete example updating a documentation file
base64 -w 0 /home/neo/SS4/kb/docs/plan-for-minimally-viable-ci-cd.md > /tmp/plan_content.txt && \
gh api --method PUT /repos/Neo-2025/SS4/contents/kb/docs/plan-for-minimally-viable-ci-cd.md \
  -f message="Add pattern evolution insights addendum" \
  -f content="$(cat /tmp/plan_content.txt)" \
  -f sha="7f6afdec5166e0b8d6765763d27917e4e804b5d0"
```

## Benefits

1. **Single-Command Efficiency**: Combines multiple operations into one command
2. **Version-Safe Updates**: Uses SHA parameter to prevent conflicting changes
3. **No Local Repository Required**: Updates GitHub without requiring a Git clone
4. **Automatable**: Easily integrated into scripts and automation workflows
5. **Proper Version History**: Maintains commit history with descriptive messages
6. **Authentication Simplicity**: Leverages GitHub CLI's authentication

## Limitations

1. **SHA Requirement**: Requires knowing the current file's SHA
2. **Error Handling**: Limited error handling in the one-line format
3. **Size Limits**: Subject to GitHub API's file size constraints
4. **GitHub CLI Dependency**: Requires the GitHub CLI to be installed

## Related Patterns

- **GitHub API Workflow Deployment Pattern (PROC-03)**: The parent pattern that covers the full verification-first approach
- **Content Versioning Pattern**: Ensures changes don't conflict with other updates
- **Command Chaining Pattern**: Uses the shell's ability to chain commands with &&

## Usage Metrics

- **Adoption**: Used in SS5 CI/CD implementation
- **Success Rate**: High reliability for file updates
- **Implementation Time**: Minimal overhead compared to Git workflows

## Evolution History

- **Initial Version**: Derived from PROC-03 GitHub API Workflow Deployment Pattern
- **Future Directions**: Potential for parameter extraction to enhance reusability 