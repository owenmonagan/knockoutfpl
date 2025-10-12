#!/bin/bash

# Setup Watchman to watch for test.json changes and trigger auto-commit
# Run this script once to initialize the watcher

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TEST_JSON="$PROJECT_DIR/.claude/tdd-guard/data/test.json"
COMMIT_SCRIPT="$PROJECT_DIR/.claude/hooks/post-test-commit.sh"

echo "Setting up Watchman to auto-commit after passing tests..."

# Create test.json directory if it doesn't exist
mkdir -p "$PROJECT_DIR/.claude/tdd-guard/data"

# Initialize watchman watch on the project
watchman watch "$PROJECT_DIR"

# Create a trigger that fires when test.json is modified
watchman -- trigger-del "$PROJECT_DIR" auto-commit-tests 2>/dev/null || true

watchman -- trigger "$PROJECT_DIR" auto-commit-tests \
  --expression '["name", "test.json", "wholename"]' \
  --append-files -- \
  "$COMMIT_SCRIPT"

echo "✅ Watchman configured successfully!"
echo ""
echo "The auto-commit trigger will now fire when:"
echo "  - test.json is modified in .claude/tdd-guard/data/"
echo "  - All tests are passing"
echo ""
echo "To verify the trigger:"
echo "  watchman trigger-list $PROJECT_DIR"
echo ""
echo "To remove the trigger:"
echo "  watchman trigger-del $PROJECT_DIR auto-commit-tests"
