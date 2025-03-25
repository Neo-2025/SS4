#!/bin/bash

# SS5 Prompt Injection Tool
# Helps with inserting standardized prompts for different development stages

echo "SS5 Prompt Injection Tool"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Define prompt types
PROMPT_TYPES=("branch-creation" "pattern-selection" "implementation" "verification" "pull-request")

# Help function
function show_help {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -t, --type TYPE    Prompt type (${PROMPT_TYPES[*]})"
  echo "  -p, --pattern ID   Pattern ID to use in prompt"
  echo "  -o, --output FILE  Output file (default: stdout)"
  echo "  -h, --help         Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 --type implementation --pattern AUTH-01"
}

# Parse arguments
TYPE=""
PATTERN=""
OUTPUT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      TYPE="$2"
      shift 2
      ;;
    -p|--pattern)
      PATTERN="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Validate arguments
if [[ -z "$TYPE" ]]; then
  echo "ERROR: Prompt type is required"
  show_help
  exit 1
fi

VALID_TYPE=false
for t in "${PROMPT_TYPES[@]}"; do
  if [[ "$t" == "$TYPE" ]]; then
    VALID_TYPE=true
    break
  fi
done

if [[ "$VALID_TYPE" == "false" ]]; then
  echo "ERROR: Invalid prompt type '$TYPE'"
  show_help
  exit 1
fi

# Get the prompt template
TEMPLATE_FILE="$SCRIPT_DIR/$TYPE/template.md"
if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "ERROR: Prompt template not found at $TEMPLATE_FILE"
  exit 1
fi

# Load and process template
TEMPLATE=$(cat "$TEMPLATE_FILE")

# Replace variables in template
if [[ ! -z "$PATTERN" ]]; then
  TEMPLATE=${TEMPLATE//\{\{PATTERN_ID\}\}/$PATTERN}
  
  # If pattern exists, try to get more info
  PATTERN_FILE="$REPO_ROOT/ss5/patterns/*/$PATTERN.md"
  if [[ -f $PATTERN_FILE ]]; then
    PATTERN_TITLE=$(grep -m 1 "^# " "$PATTERN_FILE" | sed 's/^# //')
    TEMPLATE=${TEMPLATE//\{\{PATTERN_TITLE\}\}/$PATTERN_TITLE}
  fi
fi

# Replace date variables
DATE=$(date +%Y-%m-%d)
TEMPLATE=${TEMPLATE//\{\{DATE\}\}/$DATE}

# Output the result
if [[ -z "$OUTPUT" ]]; then
  echo "$TEMPLATE"
else
  echo "$TEMPLATE" > "$OUTPUT"
  echo "Prompt saved to $OUTPUT"
fi

exit 0
