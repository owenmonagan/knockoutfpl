#!/bin/bash

# Smart E2E Reminder Hook
# Triggers gentle reminder to verify with Playwright MCP when:
# 1. Unit tests are passing
# 2. Critical user-facing files were modified

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TEST_RESULTS="$PROJECT_DIR/.claude/tdd-guard/data/test.json"

# Check if test results file exists
if [ ! -f "$TEST_RESULTS" ]; then
    exit 0
fi

# Parse test results and check modified files using Python
python3 <<'PYTHON'
import json
import sys
import os
import subprocess
import re

project_dir = os.environ.get('PROJECT_DIR', os.getcwd())
test_results_path = os.path.join(project_dir, '.claude', 'tdd-guard', 'data', 'test.json')

try:
    # Check test results
    with open(test_results_path, 'r') as f:
        data = json.load(f)

    # Count test results
    failed_tests = 0
    for module in data.get('testModules', []):
        for test in module.get('tests', []):
            if test.get('state') == 'failed':
                failed_tests += 1

    reason = data.get('reason', 'unknown')

    # Only proceed if all tests passed
    if reason != 'passed' or failed_tests > 0:
        sys.exit(0)

    # Check git diff for modified files
    status_result = subprocess.run(
        ['git', 'diff', '--name-only', 'HEAD'],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    # Also check staged changes
    staged_result = subprocess.run(
        ['git', 'diff', '--name-only', '--cached'],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    modified_files = status_result.stdout + staged_result.stdout

    # Define critical paths that require E2E verification
    critical_patterns = [
        r'src/components/.*[Ff]orm',      # Form components
        r'src/.*[Aa]uth',                  # Auth-related files
        r'src/.*[Ll]ogin',                 # Login components
        r'src/.*[Ss]ignup',                # Signup components
        r'src/.*[Rr]oute',                 # Routing files
        r'src/.*[Nn]av',                   # Navigation components
        r'src/services/.*',                # Service files (API, Firebase)
        r'src/.*[Cc]hallenge',             # Challenge-related components
        r'src/pages/.*',                   # Page components
        r'App\.tsx',                       # Main app component
    ]

    # Check if any critical files were modified
    requires_e2e = False
    for pattern in critical_patterns:
        if re.search(pattern, modified_files, re.IGNORECASE):
            requires_e2e = True
            break

    # If critical files modified and tests passing, provide reminder
    if requires_e2e:
        print("\n" + "="*70)
        print("💡 E2E VERIFICATION REMINDER")
        print("="*70)
        print("\n✅ Unit tests are passing")
        print("📝 Critical user-facing files were modified")
        print("\n🎯 Consider verifying with Playwright MCP:")
        print("   • Use mcp__playwright__browser_navigate to test user flows")
        print("   • Use mcp__playwright__browser_console_messages to check for errors")
        print("   • Or use /e2e-verify command for guided verification")
        print("\n💭 Skip if: styling-only changes, refactoring, or no UI impact")
        print("="*70 + "\n")

except FileNotFoundError:
    sys.exit(0)
except json.JSONDecodeError:
    sys.exit(0)
except Exception as e:
    # Silently fail - this is a non-blocking reminder
    sys.exit(0)

PYTHON
