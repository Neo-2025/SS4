#!/bin/bash

# SS5 Prompt Injection Tool
# Suggests appropriate prompts based on current git context

DEFAULT_PROMPT_DIR="ss5/tools/prompts"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
BRANCH_PREFIX=${CURRENT_BRANCH%%/*}

# Help function
show_help() {
  echo "SS5 Prompt Injection Tool"
  echo "========================="
  echo "Usage: $0 [options] [context]"
  echo ""
  echo "Options:"
  echo "  --help          Show this help message"
  echo "  --list          List all available prompts"
  echo "  --context TYPE  Explicitly set context (branch-creation, pattern-selection, implementation, verification, pull-request)"
  echo ""
  echo "Examples:"
  echo "  $0                      Auto-detect context and suggest prompts"
  echo "  $0 --list               List all available prompts"
  echo "  $0 --context implementation  Show implementation prompts"
  echo ""
}

# List all available prompts
list_prompts() {
  echo "Available SS5 Prompts:"
  echo "======================"
  
  for dir in $DEFAULT_PROMPT_DIR/*; do
    if [ -d "$dir" ]; then
      context=$(basename "$dir")
      echo "Context: $context"
      
      for file in "$dir"/*.txt; do
        if [ -f "$file" ]; then
          filename=$(basename "$file" .txt)
          echo "  - $filename"
        fi
      done
      
      echo ""
    fi
  done
}

# Determine context
determine_context() {
  # Parse command line arguments first
  if [ "$EXPLICIT_CONTEXT" != "" ]; then
    echo "$EXPLICIT_CONTEXT"
    return
  fi
  
  # Check if we're in a feature branch
  if [[ "$BRANCH_PREFIX" == "feat" ]]; then
    echo "implementation"
  # Check if we're in a bugfix branch
  elif [[ "$BRANCH_PREFIX" == "fix" ]]; then
    echo "implementation"
  # Check if we're in a documentation branch
  elif [[ "$BRANCH_PREFIX" == "docs" ]]; then
    echo "pattern-selection"
  # Check if we're on main/develop
  elif [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
    echo "branch-creation"
  else
    echo "branch-creation"
  fi
}

# Get staged files
get_staged_files() {
  git diff --cached --name-only
}

# Suggest prompt based on context
suggest_prompt() {
  local context=$1
  local staged_files=$2
  
  case $context in
    branch-creation)
      # Default prompt for branch creation
      prompt_file="$DEFAULT_PROMPT_DIR/branch-creation/feature.txt"
      ;;
    pattern-selection)
      # Check if we're working on patterns
      if echo "$staged_files" | grep -q "ss5/patterns"; then
        prompt_file="$DEFAULT_PROMPT_DIR/pattern-selection/new-pattern.txt"
      else
        prompt_file="$DEFAULT_PROMPT_DIR/pattern-selection/existing-pattern.txt"
      fi
      ;;
    implementation)
      prompt_file="$DEFAULT_PROMPT_DIR/implementation/pattern-application.txt"
      ;;
    verification)
      prompt_file="$DEFAULT_PROMPT_DIR/verification/pattern-validation.txt"
      ;;
    pull-request)
      prompt_file="$DEFAULT_PROMPT_DIR/pull-request/pattern-pr.txt"
      ;;
    *)
      prompt_file="$DEFAULT_PROMPT_DIR/branch-creation/feature.txt"
      ;;
  esac
  
  # Return the prompt file (or default if specific one doesn't exist)
  if [ -f "$prompt_file" ]; then
    echo "$prompt_file"
  else
    # Find any file in the context directory
    for file in "$DEFAULT_PROMPT_DIR/$context"/*.txt; do
      if [ -f "$file" ]; then
        echo "$file"
        return
      fi
    done
    
    # Absolute fallback
    echo "$DEFAULT_PROMPT_DIR/branch-creation/feature.txt"
  fi
}

# Process command line arguments
EXPLICIT_CONTEXT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --help)
      show_help
      exit 0
      ;;
    --list)
      list_prompts
      exit 0
      ;;
    --context)
      EXPLICIT_CONTEXT="$2"
      shift
      shift
      ;;
    *)
      # Any other argument becomes the context
      EXPLICIT_CONTEXT="$1"
      shift
      ;;
  esac
done

# Main function
main() {
  local context=$(determine_context)
  local staged_files=$(get_staged_files)
  local prompt_file=$(suggest_prompt "$context" "$staged_files")
  
  echo "===== SS5 AI Prompt Suggestion ====="
  echo "Current context: $context"
  echo "Current branch: $CURRENT_BRANCH"
  echo
  echo "Suggested prompt:"
  if [ -f "$prompt_file" ]; then
    cat "$prompt_file"
  else
    echo "No prompt found for context: $context"
    echo "Create a prompt file at: $DEFAULT_PROMPT_DIR/$context/*.txt"
  fi
  echo
  echo "You can find more prompts in: $DEFAULT_PROMPT_DIR"
  echo "For help, run: $0 --help"
  echo "======================================"
}

# Run main function if not using a command-line option
main 