#!/bin/bash

# Auto-commit after successful test runs
# Triggered by: PostToolUse hook (when Claude runs tests) and Watchman (manual test runs)

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TEST_RESULTS="$PROJECT_DIR/.claude/tdd-guard/data/test.json"

# Check if test results file exists
if [ ! -f "$TEST_RESULTS" ]; then
    echo "No test results found at $TEST_RESULTS"
    exit 0
fi

# Parse test results using Python for reliable JSON handling
python3 <<'PYTHON'
import json
import sys
import os
import subprocess
from datetime import datetime

project_dir = os.environ.get('PROJECT_DIR', os.getcwd())
test_results_path = os.path.join(project_dir, '.claude', 'tdd-guard', 'data', 'test.json')

try:
    with open(test_results_path, 'r') as f:
        data = json.load(f)

    # Count test results from testModules array
    total_tests = 0
    passed_tests = 0
    failed_tests = 0

    for module in data.get('testModules', []):
        for test in module.get('tests', []):
            total_tests += 1
            if test.get('state') == 'passed':
                passed_tests += 1
            elif test.get('state') == 'failed':
                failed_tests += 1

    # Check overall result
    reason = data.get('reason', 'unknown')

    # Only commit if all tests passed
    if reason != 'passed' or failed_tests > 0:
        print(f"❌ Tests not all passing: {passed_tests}/{total_tests} passed, {failed_tests} failed")
        print("Skipping auto-commit")
        sys.exit(0)

    if total_tests == 0:
        print("⚠️  No tests found")
        sys.exit(0)

    # Check if there are changes to commit
    status_result = subprocess.run(
        ['git', 'status', '--porcelain'],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    if not status_result.stdout.strip():
        print(f"✅ All {total_tests} tests passing, but no changes to commit")
        sys.exit(0)

    # Stage all changes
    subprocess.run(['git', 'add', '-A'], cwd=project_dir, check=True)

    # Create commit message
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"""✅ Tests passing: {total_tests} tests green

Auto-committed after successful test run
- {passed_tests} tests passed
- 0 tests failed
- Timestamp: {timestamp}
"""

    # Create the commit
    commit_result = subprocess.run(
        ['git', 'commit', '-m', commit_msg],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    if commit_result.returncode == 0:
        print(f"✅ Auto-commit created: {total_tests} tests passing")
        print(commit_result.stdout)
    else:
        print(f"⚠️  Commit failed: {commit_result.stderr}")
        sys.exit(1)

except FileNotFoundError:
    print(f"Test results file not found: {test_results_path}")
    sys.exit(0)
except json.JSONDecodeError as e:
    print(f"Error parsing test results: {e}")
    sys.exit(0)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)

PYTHON
