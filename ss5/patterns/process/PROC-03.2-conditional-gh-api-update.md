# Conditional GitHub API Content Update Pattern

## Status: Draft

## Classification: Process

## Context

When managing content in GitHub repositories programmatically, there are scenarios where updates should only occur if specific content conditions are met. Traditional Git workflows require multiple steps to inspect content, make decisions, and execute updates. With the GitHub API Workflow patterns established (PROC-03 and PROC-03.1), we can extend this approach to add conditional logic.

## Problem

How can we conditionally update GitHub repository content when:

1. Updates should only occur if the current content meets specific criteria
2. We need to perform pattern matching or content analysis before deciding to update
3. We want to maintain the efficiency of direct API access
4. Multiple files may need coordinated updates in a single logical operation
5. We need transaction-like semantics where related updates succeed or fail together

## Solution

Implement a conditional GitHub API update workflow that:
1. Retrieves the current content via the GitHub API
2. Analyzes the content using tools like grep, jq, or other text processing utilities
3. Only proceeds with updates when specific conditions are met
4. Coordinates related updates to maintain consistency

### Implementation Example

```bash
#!/bin/bash

# Define repository details
REPO="owner/repository"
FILE_PATH="path/to/target/file.md"
CONDITION_PATTERN="text-to-search-for"
COMMIT_MESSAGE="Update content conditionally"

# Step 1: Retrieve current content and check condition
echo "Checking current content..."
CURRENT_CONTENT=$(gh api /repos/$REPO/contents/$FILE_PATH | jq -r '.content' | base64 -d)
CURRENT_SHA=$(gh api /repos/$REPO/contents/$FILE_PATH | jq -r '.sha')

# Step 2: Apply condition check
if echo "$CURRENT_CONTENT" | grep -q "$CONDITION_PATTERN"; then
    echo "Condition met! Proceeding with update..."
    
    # Step 3: Prepare new content (for example, replacing a specific section)
    NEW_CONTENT=$(echo "$CURRENT_CONTENT" | sed -e "s/old section text/new section text/g")
    
    # Step 4: Encode and upload the modified content
    echo "$NEW_CONTENT" | base64 -w 0 > /tmp/updated_content.txt
    
    # Step 5: Update the file with new content
    gh api --method PUT /repos/$REPO/contents/$FILE_PATH \
      -f message="$COMMIT_MESSAGE" \
      -f content="$(cat /tmp/updated_content.txt)" \
      -f sha="$CURRENT_SHA"
      
    echo "Update completed successfully!"
else
    echo "Condition not met. No update performed."
fi
```

### Advanced Implementation: Transaction-Like Updates

```bash
#!/bin/bash

# Define repository details
REPO="owner/repository"
FILES=("config.json" "README.md" "docs/index.md")
SEARCH_PATTERN="version: 1.0.0"
NEW_VERSION="version: 1.1.0"
COMMIT_MESSAGE="Bump version to 1.1.0"

# Step 1: Check all files first
ALL_FILES_MATCH=true
declare -A FILE_SHAS

for file in "${FILES[@]}"; do
    RESPONSE=$(gh api /repos/$REPO/contents/$file)
    CURRENT_CONTENT=$(echo "$RESPONSE" | jq -r '.content' | base64 -d)
    FILE_SHAS[$file]=$(echo "$RESPONSE" | jq -r '.sha')
    
    if ! echo "$CURRENT_CONTENT" | grep -q "$SEARCH_PATTERN"; then
        ALL_FILES_MATCH=false
        echo "File $file does not contain the expected pattern."
        break
    fi
done

# Step 2: Only proceed if all files match the condition
if [ "$ALL_FILES_MATCH" = true ]; then
    echo "All files match conditions. Proceeding with coordinated update..."
    
    # Step 3: Update all files
    for file in "${FILES[@]}"; do
        RESPONSE=$(gh api /repos/$REPO/contents/$file)
        CURRENT_CONTENT=$(echo "$RESPONSE" | jq -r '.content' | base64 -d)
        UPDATED_CONTENT=$(echo "$CURRENT_CONTENT" | sed -e "s/$SEARCH_PATTERN/$NEW_VERSION/g")
        
        echo "$UPDATED_CONTENT" | base64 -w 0 > /tmp/updated_content.txt
        
        gh api --method PUT /repos/$REPO/contents/$file \
          -f message="$COMMIT_MESSAGE" \
          -f content="$(cat /tmp/updated_content.txt)" \
          -f sha="${FILE_SHAS[$file]}"
          
        echo "Updated $file successfully."
    done
    
    echo "Coordinated update completed successfully!"
else
    echo "Conditions not met in all files. No updates performed."
fi
```

## Benefits

1. **Content-Driven Updates**: Updates only occur when necessary based on content analysis
2. **Reduced Network Operations**: Avoids unnecessary API calls when conditions aren't met
3. **Coordinated Multi-File Updates**: Can handle related changes across multiple files
4. **Transaction-Like Behavior**: All-or-nothing updates maintain consistency
5. **Self-Contained Scripts**: Encapsulates complete conditional logic in a single script
6. **Idempotent Operation**: Can safely run multiple times with predictable results

## Limitations

1. **Complex Error Handling**: Requires additional error handling for multi-file operations
2. **API Rate Limits**: Multiple content checks can consume API rate limits
3. **Shell Script Complexity**: More complex conditions may exceed shell script capabilities
4. **No True Transactions**: GitHub API doesn't support true atomic transactions
5. **Security Considerations**: Scripts must securely handle authentication tokens

## Related Patterns

- **GitHub API Workflow Deployment Pattern (PROC-03)**: The parent pattern covering the verification-first approach
- **Direct GitHub API File Update Pattern (PROC-03.1)**: Sibling pattern for direct file updates
- **Command Chaining Pattern**: Uses shell command chaining for condition evaluation
- **Content-Based Deployment Pattern**: General approach of content-driven deployment decisions

## Usage Metrics

- **Adoption**: Suitable for automated version bumps, configuration updates, and documentation refreshes
- **Success Rate**: High reliability when proper error handling is implemented
- **Implementation Time**: Moderate complexity requiring careful testing

## Evolution History

- **Initial Version**: Derived from PROC-03.1 (Direct GitHub API File Update Pattern)
- **Future Directions**: Potential for integration with event-driven architectures and webhook-based automation 